/**
 * Der Monster Creator.
 *
 * Drei Reiter: bauen, die Sammlung, und ein vorhandenes Monster pruefen.
 *
 * Der Befund steht in allen dreien an derselben Stelle und sieht gleich aus.
 * Das ist Absicht: die Pruefung ist der Kern des Werkzeugs, und sie soll
 * nicht wie ein Anhaengsel wirken, das man im Bauen-Reiter uebersieht.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, type Language } from '@suite/i18n';
import type { Eintrag } from '../shared/ablage';
import { alsMarkdown, zuId } from '../shared/ablage';
import {
  alsVariante,
  erzeugeMonster,
  schadenJeAngriff,
  wuerfleNeu,
  type Monster
} from '../shared/erzeuge';
import { zieheKiNach, type RohMonster } from '../shared/kiAufgaben';
import { pruefe, type Vorschlag, type Werte } from '../shared/pruefung';
import { RICHTWERTE } from '../shared/richtwerte';
import { ROLLEN, THEMEN, text } from '../shared/tabellen';
import { api } from './api';
import { Befund } from './Befund';
import { Sammlung } from './Sammlung';
import { getLanguage, setLanguage, t, type TextKey } from './i18n';

/** Der Zufall der Oberflaeche. Die reinen Funktionen bekommen ihn uebergeben. */
const wuerfel = () => Math.random();

type Reiter = 'bauen' | 'sammlung' | 'pruefen';

export function App() {
  const [sprache, setSpracheState] = useState<Language>(DEFAULT_LANGUAGE);
  const [reiter, setReiter] = useState<Reiter>('bauen');
  const [cr, setCr] = useState('5');
  const [themaId, setThemaId] = useState('');
  const [rolleId, setRolleId] = useState('');
  const [legendaer, setLegendaer] = useState(false);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [eintraege, setEintraege] = useState<Eintrag[]>([]);
  const [kiDa, setKiDa] = useState(false);
  const [kiLaeuft, setKiLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  /** Was die KI zuletzt vorgeschlagen hat, falls sie berichtigt wurde. */
  const [kiVorschlag, setKiVorschlag] = useState<{ werte: Werte; zeilen: string[] } | null>(null);
  /** Der Prueflappen: Zahlen von Hand, ohne Erzeuger. */
  const [handWerte, setHandWerte] = useState<Werte>({
    tp: 95,
    rk: 15,
    schadenProRunde: 35,
    angriffsbonus: 7
  });
  const [handCr, setHandCr] = useState('5');

  useEffect(() => {
    void api.ki.da().then(setKiDa);
    const ab = api.ki.beiWechsel(() => void api.ki.da().then(setKiDa));
    const abSprache = api.sprache.beiWechsel((neu) => {
      setLanguage(neu as Language);
      setSpracheState(neu as Language);
    });
    return () => {
      ab();
      abSprache();
    };
  }, []);

  const ladeSammlung = useCallback(async () => {
    setEintraege(await api.sammlung.liste());
  }, []);

  useEffect(() => {
    void ladeSammlung();
  }, [ladeSammlung]);

  const befund = useMemo(() => (monster ? pruefe(monster.werte, monster.cr) : null), [monster]);
  const handBefund = useMemo(() => pruefe(handWerte, handCr), [handWerte, handCr]);

  const wuerfeln = () => {
    setKiVorschlag(null);
    setMonster(
      erzeugeMonster(
        { cr, themaId: themaId || undefined, rolleId: rolleId || undefined, legendaer },
        getLanguage(),
        wuerfel
      )
    );
  };

  /**
   * Das ganze Monster von der KI.
   *
   * Und danach die Regel, fuer die die Pruefung gebaut ist: was die KI
   * liefert, wird nachgerechnet und bei Bedarf auf den Grad gezogen — mit
   * Ansage, samt Knopf zurueck zum Vorschlag.
   */
  const frageKi = async () => {
    if (kiLaeuft) return;
    setKiLaeuft(true);
    setMeldung(null);
    try {
      const ergebnis = await api.ki.frage(
        { aufgabe: 'monster', cr, themaId: themaId || undefined, rolleId: rolleId || undefined },
        getLanguage()
      );
      if (!ergebnis.ok || !ergebnis.wert) {
        setMeldung(t((ergebnis.grund || 'error.aiOther') as TextKey));
        return;
      }
      const roh = ergebnis.wert as RohMonster;
      const nachgezogen = zieheKiNach(roh.werte, cr);

      // Das Geruest kommt aus den Tabellen, die Prosa von der KI: so ist
      // alles gefuellt, was das Modell auslaesst.
      const grundlage = erzeugeMonster(
        { cr, themaId: themaId || undefined, rolleId: rolleId || undefined, legendaer },
        getLanguage(),
        wuerfel
      );
      setMonster({
        ...grundlage,
        name: roh.name || grundlage.name,
        satz: roh.beschreibung || grundlage.satz,
        faehigkeiten: roh.faehigkeiten.length > 0 ? roh.faehigkeiten : grundlage.faehigkeiten,
        werte: { ...nachgezogen.werte, legendaer: legendaer || undefined }
      });

      if (nachgezogen.berichtigt) {
        const zeilen: string[] = [];
        const nenne = (feldKey: TextKey, von: number, auf: number) => {
          if (von !== auf) zeilen.push(t('ki.aenderung', { feld: t(feldKey), von, auf }));
        };
        nenne('werte.tp', nachgezogen.vorschlagDerKi.tp, nachgezogen.werte.tp);
        nenne('werte.rk', nachgezogen.vorschlagDerKi.rk, nachgezogen.werte.rk);
        nenne('werte.schaden', nachgezogen.vorschlagDerKi.schadenProRunde, nachgezogen.werte.schadenProRunde);
        nenne('werte.bonus', nachgezogen.vorschlagDerKi.angriffsbonus, nachgezogen.werte.angriffsbonus);
        setKiVorschlag({ werte: nachgezogen.vorschlagDerKi, zeilen });
      } else {
        setKiVorschlag(null);
      }
    } catch (fehler) {
      setMeldung(String(fehler));
    } finally {
      setKiLaeuft(false);
    }
  };

  const speichern = async () => {
    if (!monster) return;
    const ergebnis = await api.sammlung.speichern(
      { ...monster, id: zuId(monster.name), geaendert: new Date().toISOString() },
      getLanguage()
    );
    setMeldung(
      ergebnis.ok
        ? t('meldung.gespeichert', { name: monster.name })
        : t('meldung.fehler', { detail: ergebnis.text })
    );
    if (ergebnis.ok) await ladeSammlung();
  };

  const exportieren = async () => {
    if (!monster) return;
    const markdown = alsMarkdown(
      { ...monster, id: zuId(monster.name), geaendert: new Date().toISOString() },
      getLanguage()
    );
    const ergebnis = await api.export(monster.name, markdown);
    setMeldung(
      ergebnis.ok
        ? t('meldung.exportiert', { name: monster.name })
        : t('meldung.fehler', { detail: ergebnis.text })
    );
  };

  const oeffnen = async (id: string) => {
    const eintrag = eintraege.find((e) => e.id === id);
    if (!eintrag) return;
    /*
     * Geoeffnet wird ueber die Kopfzahlen, nicht ueber den Leib: der Leib ist
     * Markdown fuer Menschen, der Kopf sind die Zahlen. Faehigkeitentexte
     * gehen dabei verloren — das ist der Preis dafuer, dass die Dateien von
     * Hand aenderbar bleiben, und er ist hier vertretbar.
     */
    const grundlage = erzeugeMonster(
      { cr: eintrag.cr, themaId: eintrag.themaId || undefined, rolleId: eintrag.rolleId || undefined },
      getLanguage(),
      wuerfel
    );
    setMonster({
      ...grundlage,
      name: eintrag.name,
      cr: eintrag.cr,
      werte: { ...grundlage.werte, tp: eintrag.tp, rk: eintrag.rk }
    });
    setCr(eintrag.cr);
    setReiter('bauen');
  };

  const loeschen = async (eintrag: Eintrag) => {
    if (!window.confirm(`${eintrag.name}?`)) return;
    await api.sammlung.loeschen(eintrag.id);
    setMeldung(t('meldung.geloescht', { name: eintrag.name }));
    await ladeSammlung();
  };

  const uebernimmVorschlag = (vorschlag: Vorschlag) => {
    if (!monster) return;
    setMonster({ ...monster, werte: { ...monster.werte, [vorschlag.feld]: vorschlag.auf } });
  };

  return (
    <div className="app" lang={sprache}>
      <header className="kopf">
        <div>
          <h1>{t('titel')}</h1>
          <p className="kopf__satz">{t('untertitel')}</p>
        </div>
        <nav className="reiter">
          {(['bauen', 'sammlung', 'pruefen'] as const).map((id) => (
            <button
              key={id}
              type="button"
              className={reiter === id ? 'reiter__knopf reiter__knopf--an' : 'reiter__knopf'}
              onClick={() => setReiter(id)}
            >
              {t(`reiter.${id}` as TextKey)}
            </button>
          ))}
        </nav>
      </header>

      {meldung && <p className="meldung">{meldung}</p>}

      {reiter === 'bauen' && (
        <main className="bauen">
          <section className="regler">
            <label>
              {t('feld.cr')}
              <select value={cr} onChange={(e) => setCr(e.target.value)}>
                {RICHTWERTE.map((eintrag) => (
                  <option key={eintrag.cr} value={eintrag.cr}>
                    {eintrag.cr}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('feld.thema')}
              <select value={themaId} onChange={(e) => setThemaId(e.target.value)}>
                <option value="">{t('feld.beliebig')}</option>
                {THEMEN.map((thema) => (
                  <option key={thema.id} value={thema.id}>
                    {text(thema.name, sprache)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('feld.rolle')}
              <select value={rolleId} onChange={(e) => setRolleId(e.target.value)}>
                <option value="">{t('feld.beliebig')}</option>
                {ROLLEN.map((rolle) => (
                  <option key={rolle.id} value={rolle.id}>
                    {text(rolle.name, sprache)}
                  </option>
                ))}
              </select>
            </label>
            <label className="regler__kaestchen">
              <input type="checkbox" checked={legendaer} onChange={(e) => setLegendaer(e.target.checked)} />
              {t('feld.legendaer')}
            </label>
            <div className="regler__knoepfe">
              <button type="button" className="knopf knopf--haupt" onClick={wuerfeln}>
                {t('knopf.wuerfeln')}
              </button>
              {kiDa ? (
                <button type="button" className="knopf" disabled={kiLaeuft} onClick={() => void frageKi()}>
                  {kiLaeuft ? t('knopf.kiLaeuft') : t('knopf.ki')}
                </button>
              ) : (
                <span className="hinweis hinweis--klein">{t('ki.aus')}</span>
              )}
            </div>
          </section>

          {monster && befund && (
            <>
              <Steckbrief monster={monster} />
              <Befund befund={befund} onUebernehmen={uebernimmVorschlag} />

              {kiVorschlag && (
                <section className="kiHinweis">
                  <p>{t('ki.berichtigt', { cr })}</p>
                  <ul>
                    {kiVorschlag.zeilen.map((zeile) => (
                      <li key={zeile}>{zeile}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="knopf knopf--klein"
                    onClick={() => {
                      setMonster({ ...monster, werte: kiVorschlag.werte });
                      setKiVorschlag(null);
                    }}
                  >
                    {t('knopf.zurueckZurKi')}
                  </button>
                </section>
              )}

              <section className="werkzeuge">
                <button type="button" className="knopf knopf--klein" onClick={() => setMonster(wuerfleNeu(monster, 'name', getLanguage(), wuerfel))}>
                  {t('knopf.neuerName')}
                </button>
                <button type="button" className="knopf knopf--klein" onClick={() => setMonster(wuerfleNeu(monster, 'faehigkeiten', getLanguage(), wuerfel))}>
                  {t('knopf.neueFaehigkeiten')}
                </button>
                <button type="button" className="knopf knopf--klein" onClick={() => setMonster(wuerfleNeu(monster, 'werte', getLanguage(), wuerfel))}>
                  {t('knopf.neueWerte')}
                </button>
                <button type="button" className="knopf knopf--klein" onClick={() => setMonster(alsVariante(monster, cr, wuerfel))}>
                  {t('knopf.variante')}
                </button>
              </section>

              <section className="abgang">
                <button type="button" className="knopf knopf--haupt" onClick={() => void speichern()}>
                  {t('knopf.speichern')}
                </button>
                <button type="button" className="knopf" onClick={() => void exportieren()}>
                  {t('knopf.export')}
                </button>
              </section>
            </>
          )}
        </main>
      )}

      {reiter === 'sammlung' && (
        <main>
          <Sammlung eintraege={eintraege} onOeffnen={(id) => void oeffnen(id)} onLoeschen={(e) => void loeschen(e)} />
        </main>
      )}

      {reiter === 'pruefen' && (
        <main className="pruefen">
          <p className="hinweis">{t('pruefen.hinweis')}</p>
          <section className="regler">
            <label>
              {t('feld.cr')}
              <select value={handCr} onChange={(e) => setHandCr(e.target.value)}>
                {RICHTWERTE.map((eintrag) => (
                  <option key={eintrag.cr} value={eintrag.cr}>
                    {eintrag.cr}
                  </option>
                ))}
              </select>
            </label>
            {(
              [
                ['tp', 'werte.tp'],
                ['rk', 'werte.rk'],
                ['schadenProRunde', 'werte.schaden'],
                ['angriffsbonus', 'werte.bonus']
              ] as const
            ).map(([feld, schluessel]) => (
              <label key={feld}>
                {t(schluessel)}
                <input
                  type="number"
                  value={handWerte[feld]}
                  onChange={(e) =>
                    setHandWerte({ ...handWerte, [feld]: Number(e.target.value) || 0 })
                  }
                />
              </label>
            ))}
          </section>
          <Befund
            befund={handBefund}
            onUebernehmen={(vorschlag) => setHandWerte({ ...handWerte, [vorschlag.feld]: vorschlag.auf })}
          />
        </main>
      )}
    </div>
  );
}

function Steckbrief({ monster }: { readonly monster: Monster }) {
  return (
    <section className="steckbrief">
      <h2>{monster.name}</h2>
      <p className="steckbrief__zeile">
        {monster.thema} · {monster.rolle} · {t('feld.cr')} {monster.cr}
        {monster.werte.legendaer ? ' · ' + t('feld.legendaer') : ''}
      </p>
      <p className="steckbrief__satz">{monster.satz}</p>
      <dl className="steckbrief__werte">
        <div>
          <dt>{t('werte.tp')}</dt>
          <dd>{monster.werte.tp}</dd>
        </div>
        <div>
          <dt>{t('werte.rk')}</dt>
          <dd>{monster.werte.rk}</dd>
        </div>
        <div>
          <dt>{t('werte.schaden')}</dt>
          <dd>
            {monster.werte.schadenProRunde}
            <span className="steckbrief__klein">
              {' '}
              ({monster.angriffe} × {schadenJeAngriff(monster)} {monster.schadensart})
            </span>
          </dd>
        </div>
        <div>
          <dt>{t('werte.bonus')}</dt>
          <dd>+{monster.werte.angriffsbonus}</dd>
        </div>
      </dl>
      <ul className="steckbrief__faehigkeiten">
        {monster.faehigkeiten.map((f) => (
          <li key={f.name}>
            <strong>{f.name}.</strong> {f.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
