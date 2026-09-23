/**
 * Der Dialog „Teilen" (docs/austausch.md, Stufe 1).
 *
 * Zwei Richtungen in einem Dialog:
 *
 * - **Weitergeben**: Eintraege auswaehlen und als Paketdatei speichern. Die
 *   Datei geht dann per Stick, Mail oder Chat an den Tisch; in Stufe 2
 *   ersetzt der Raum im lokalen Netz genau diesen Schritt.
 * - **Empfangen**: ein Paket oeffnen, sehen, was darin ist, und annehmen.
 *   Gibt es einen Eintrag schon, wird gefragt; daneben legen ist die
 *   Vorgabe, nichts wird stillschweigend ueberschrieben.
 *
 * Die Oberflaeche sieht nie den Inhalt eines Pakets, nur Namen und Arten.
 * Das Paket selbst bleibt im Hauptprozess, bis angenommen ist.
 */
import { useEffect, useMemo, useState } from 'react';
import { eintragsSchluessel, finde, type Eintrag } from '@suite/eintraege';
import type { MessageKey, MessageParams } from '../shared/i18n';
import { nameKey } from '../shared/apps';
import { Dialog } from './Dialog';
import { Raum } from './Raum';
import type { GefundenerRaum, Raumzustand } from '../main/raum';
import type { Raumpaket } from '../preload';

const AUS: Raumzustand = { rolle: 'aus', raum: '', ich: null, personen: [], chat: [], port: null, adressen: [] };

type Modus = 'uebernehmen' | 'daneben' | 'verwerfen';

interface Ankunft {
  readonly nummer: number;
  readonly werkzeug: string;
  readonly name: string;
  readonly art: string;
  readonly bilder: number;
  readonly verweis: boolean;
  readonly annehmbar: boolean;
}

interface Props {
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

/** Ohne Suchwort stehen die offiziellen Regeln nicht in der Liste: es sind ueber 900. */
function istOffiziell(e: Eintrag): boolean {
  return e.werkzeug === 'nachschlagewerk' && !e.kennung.startsWith('hausregel/');
}

export function Austausch({ onClose, t }: Props) {
  const [richtung, setRichtung] = useState<'geben' | 'nehmen' | 'raum'>('geben');
  const werkzeugName = (id: string) => t(nameKey(id));

  /* ---------- Der Raum (Stufe 2) ---------- */
  const [raum, setRaum] = useState<Raumzustand>(AUS);
  const [raeume, setRaeume] = useState<readonly GefundenerRaum[]>([]);
  const [raumPakete, setRaumPakete] = useState<readonly Raumpaket[]>([]);
  const [raumFehler, setRaumFehler] = useState('');
  const [raumAn, setRaumAn] = useState('');

  useEffect(() => {
    void window.shell.raum.zustand().then((s) => {
      setRaum(s.zustand);
      setRaeume(s.raeume);
      setRaumPakete(s.pakete);
    });
    return window.shell.raum.beiEreignis((e) => {
      if (e.art === 'zustand') {
        setRaum(e.zustand);
        if (e.zustand.rolle !== 'aus') setRaumFehler('');
      } else if (e.art === 'raeume') setRaeume(e.raeume);
      else if (e.art === 'pakete') setRaumPakete(e.pakete);
      else if (e.art === 'chat') setRaum((alt) => ({ ...alt, chat: [...alt.chat, e.zeile] }));
      else if (e.art === 'fehler') setRaumFehler(t(`room.error.${e.grund}` as MessageKey));
    });
  }, [t]);

  /* ---------- Weitergeben ---------- */
  const [teilbar, setTeilbar] = useState<Eintrag[] | null>(null);
  const [filter, setFilter] = useState('');
  const [gewaehlt, setGewaehlt] = useState<Set<string>>(new Set());
  const [meldung, setMeldung] = useState('');

  useEffect(() => {
    void window.shell.austausch.teilbar().then(setTeilbar, () => setTeilbar([]));
  }, []);

  const sichtbar = useMemo(() => {
    if (!teilbar) return [];
    if (filter.trim()) return [...finde(teilbar, filter, 200)];
    return teilbar
      .filter((e) => !istOffiziell(e))
      .sort((a, b) => a.werkzeug.localeCompare(b.werkzeug) || a.name.localeCompare(b.name, 'de'));
  }, [teilbar, filter]);

  const umschalten = (e: Eintrag) => {
    const k = eintragsSchluessel(e);
    setGewaehlt((alt) => {
      const neu = new Set(alt);
      if (neu.has(k)) neu.delete(k);
      else neu.add(k);
      return neu;
    });
  };

  const auswahlListe = () =>
    (teilbar ?? [])
      .filter((e) => gewaehlt.has(eintragsSchluessel(e)))
      .map((e) => ({ werkzeug: e.werkzeug, kennung: e.kennung }));

  const inDenRaum = async () => {
    const antwort = await window.shell.raum.senden(auswahlListe(), raumAn || null);
    setMeldung(antwort.ok ? t('share.sentToRoom', { anzahl: antwort.anzahl }) : t('share.saveFailed'));
  };

  const speichern = async () => {
    const auswahl = auswahlListe();
    const antwort = await window.shell.austausch.speichern(auswahl);
    if (antwort.abgebrochen) return;
    setMeldung(antwort.ok ? t('share.saved', { anzahl: antwort.anzahl }) : t('share.saveFailed'));
  };

  /* ---------- Empfangen ---------- */
  const [ankuenfte, setAnkuenfte] = useState<Ankunft[] | null>(null);
  const [ziele, setZiele] = useState<Record<string, { id: string; name: string }[]>>({});
  const [zielWahl, setZielWahl] = useState<Record<string, string>>({});
  const [konflikt, setKonflikt] = useState<boolean[]>([]);
  const [annehmen, setAnnehmen] = useState<Set<number>>(new Set());
  const [modi, setModi] = useState<Record<number, Modus>>({});
  const [fehler, setFehler] = useState('');
  const [ergebnis, setErgebnis] = useState<{ ok: boolean; name: string; grund?: string }[] | null>(null);

  const oeffnen = async () => zeige(await window.shell.austausch.oeffnen());

  const zeige = (antwort: Awaited<ReturnType<typeof window.shell.austausch.oeffnen>>) => {
    if (antwort.abgebrochen) return;
    setErgebnis(null);
    if (!antwort.ok || !antwort.ankuenfte) {
      setAnkuenfte(null);
      setFehler(t('share.openFailed', { grund: antwort.grund ?? '' }));
      return;
    }
    setFehler('');
    const z = antwort.ziele ?? {};
    const wahl = Object.fromEntries(Object.entries(z).map(([w, liste]) => [w, liste[0]?.id ?? '']));
    setZiele(z);
    setZielWahl(wahl);
    setAnkuenfte(antwort.ankuenfte);
    setAnnehmen(new Set(antwort.ankuenfte.filter((a) => a.annehmbar).map((a) => a.nummer)));
    setModi({});
  };

  // Ob es die Eintraege im gewaehlten Ziel schon gibt — neu, sobald sich
  // das Ziel aendert.
  useEffect(() => {
    if (!ankuenfte) return;
    void window.shell.austausch.konflikte(zielWahl).then(setKonflikt, () => setKonflikt([]));
  }, [ankuenfte, zielWahl]);

  /** Eine Ankunft, fuer deren Werkzeug es Ziele geben muss, aber keines gibt. */
  const ohneZiel = (a: Ankunft) => a.werkzeug in ziele && !zielWahl[a.werkzeug];

  const nimmAn = async () => {
    if (!ankuenfte) return;
    const entscheidungen = ankuenfte
      .filter((a) => annehmen.has(a.nummer) && a.annehmbar && !ohneZiel(a))
      .map((a) => ({ nummer: a.nummer, modus: konflikt[a.nummer] ? (modi[a.nummer] ?? 'daneben') : 'daneben' }));
    setErgebnis(await window.shell.austausch.annehmen(entscheidungen, zielWahl));
  };

  return (
    <Dialog titel={t('share.title')} schliessenText={t('dialog.close')} onClose={onClose}>
      <div className="segment" role="group" aria-label={t('share.title')}>
        {(['geben', 'nehmen', 'raum'] as const).map((r) => (
          <button
            key={r}
            type="button"
            data-richtung={r}
            className={r === richtung ? 'segment__knopf is-an' : 'segment__knopf'}
            aria-pressed={r === richtung}
            onClick={() => setRichtung(r)}
          >
            {t(r === 'geben' ? 'share.give' : r === 'nehmen' ? 'share.take' : 'share.room')}
            {r === 'nehmen' && raumPakete.length > 0 ? ` (${raumPakete.length})` : ''}
          </button>
        ))}
      </div>

      {richtung === 'raum' ? (
        <Raum key="raum" zustand={raum} raeume={raeume} fehler={raumFehler} t={t} />
      ) : richtung === 'geben' ? (
        <div key="geben" className="austausch motion-erscheinen" data-austausch="geben">
          <p className="einst__satz">{t('share.giveHint')}</p>
          <input
            className="suche__feld austausch__filter"
            value={filter}
            placeholder={t('share.filter')}
            onChange={(e) => setFilter(e.target.value)}
          />
          {teilbar === null ? (
            <p className="einst__satz">{t('search.loading')}</p>
          ) : sichtbar.length === 0 ? (
            <p className="einst__satz">{t('share.nothing')}</p>
          ) : (
            <ul className="austausch__liste">
              {sichtbar.map((e) => (
                <li key={eintragsSchluessel(e)}>
                  <label className="austausch__zeile">
                    <input
                      type="checkbox"
                      data-teilen={eintragsSchluessel(e)}
                      checked={gewaehlt.has(eintragsSchluessel(e))}
                      onChange={() => umschalten(e)}
                    />
                    <span className="austausch__name">{e.name}</span>
                    <span className="austausch__art">
                      {e.art} · {werkzeugName(e.werkzeug)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          <div className="austausch__fuss">
            <span>{t('share.selected', { anzahl: gewaehlt.size })}</span>
            <button
              type="button"
              className="dialog__knopf"
              data-paket-speichern
              disabled={gewaehlt.size === 0}
              onClick={() => void speichern()}
            >
              {t('share.save')}
            </button>
          </div>
          {raum.rolle !== 'aus' && (
            <div className="austausch__fuss">
              <select className="feld__wahl" data-raum-an value={raumAn} onChange={(e) => setRaumAn(e.target.value)}>
                <option value="">{t('room.toAll')}</option>
                {raum.personen
                  .filter((p) => p.id !== raum.ich?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {t('room.toOne', { name: p.name })}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="dialog__knopf"
                data-in-den-raum
                disabled={gewaehlt.size === 0}
                onClick={() => void inDenRaum()}
              >
                {t('share.sendToRoom')}
              </button>
            </div>
          )}
          {meldung && (
            <p className="einst__satz" data-meldung>
              {meldung}
            </p>
          )}
        </div>
      ) : (
        <div key="nehmen" className="austausch motion-erscheinen" data-austausch="nehmen">
          <p className="einst__satz">{t('share.takeHint')}</p>
          <button type="button" className="dialog__knopf" data-paket-oeffnen onClick={() => void oeffnen()}>
            {t('share.open')}
          </button>
          {raumPakete.length > 0 && (
            <ul className="austausch__liste" data-raumpakete>
              {raumPakete.map((p) => (
                <li key={p.id} className="austausch__zeile">
                  <span className="austausch__name">{p.titel}</span>
                  <span className="austausch__art">{t('share.fromRoom', { name: p.von })}</span>
                  <button
                    type="button"
                    className="dialog__knopf"
                    data-raumpaket={p.id}
                    onClick={() => void window.shell.raum.paketAnsehen(p.id).then(zeige)}
                  >
                    {t('share.look')}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {fehler && (
            <p className="einst__satz austausch__fehler" data-fehler>
              {fehler}
            </p>
          )}
          {ankuenfte && (
            <>
              {Object.entries(ziele).map(([werkzeug, liste]) => (
                <label key={werkzeug} className="feld austausch__ziel">
                  <span className="feld__name">{t('share.target', { werkzeug: werkzeugName(werkzeug) })}</span>
                  {liste.length === 0 ? (
                    <span>{t('share.noTarget')}</span>
                  ) : (
                    <select
                      className="feld__wahl"
                      data-ziel={werkzeug}
                      value={zielWahl[werkzeug] ?? ''}
                      onChange={(e) => setZielWahl({ ...zielWahl, [werkzeug]: e.target.value })}
                    >
                      {liste.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              ))}
              <ul className="austausch__liste">
                {ankuenfte.map((a) => (
                  <li key={a.nummer} data-ankunft={a.nummer}>
                    <label className="austausch__zeile">
                      <input
                        type="checkbox"
                        disabled={!a.annehmbar || ohneZiel(a)}
                        checked={annehmen.has(a.nummer) && a.annehmbar && !ohneZiel(a)}
                        onChange={() =>
                          setAnnehmen((alt) => {
                            const neu = new Set(alt);
                            if (neu.has(a.nummer)) neu.delete(a.nummer);
                            else neu.add(a.nummer);
                            return neu;
                          })
                        }
                      />
                      <span className="austausch__name">{a.name}</span>
                      <span className="austausch__art">
                        {a.art} · {werkzeugName(a.werkzeug)}
                        {a.bilder > 0 ? ` · ${t('share.images', { anzahl: a.bilder })}` : ''}
                        {a.verweis ? ` · ${t('share.reference')}` : ''}
                        {!a.annehmbar ? ` · ${t('share.unknownTool')}` : ''}
                      </span>
                    </label>
                    {konflikt[a.nummer] && (
                      <label className="austausch__konflikt">
                        <span>{t('share.exists')}</span>
                        <select
                          className="feld__wahl"
                          data-modus={a.nummer}
                          value={modi[a.nummer] ?? 'daneben'}
                          onChange={(e) => setModi({ ...modi, [a.nummer]: e.target.value as Modus })}
                        >
                          <option value="daneben">{t('share.modeBeside')}</option>
                          <option value="uebernehmen">{t('share.modeReplace')}</option>
                          <option value="verwerfen">{t('share.modeDiscard')}</option>
                        </select>
                      </label>
                    )}
                  </li>
                ))}
              </ul>
              <div className="austausch__fuss">
                <span />
                <button type="button" className="dialog__knopf" data-annehmen onClick={() => void nimmAn()}>
                  {t('share.accept')}
                </button>
              </div>
            </>
          )}
          {ergebnis && (
            <ul className="austausch__ergebnis" data-ergebnis>
              {ergebnis.map((e, i) => (
                <li key={i} className={e.ok ? 'is-ok' : 'is-fehler'}>
                  {e.ok ? '✓' : '✗'} {e.name}
                  {!e.ok && e.grund ? ` (${e.grund})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Dialog>
  );
}
