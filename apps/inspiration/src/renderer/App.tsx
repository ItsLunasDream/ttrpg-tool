/**
 * Die Inspirationshilfe.
 *
 * Sechs Bausteine, ein Knopf. Der Anspruch ist derselbe wie beim NPC
 * Creator: es wird benutzt, waehrend die Gruppe schon am Tisch sitzt. Wer
 * erst zwanzig Felder ausfuellen muss, macht es einmal auf.
 *
 * Die vier Regler oben sind freie Felder mit Vorschlagsliste. Bekannte
 * Begriffe verengen die Tabellen, unbekannte lassen sie offen — beides ohne
 * Fehlermeldung. Eine feste Auswahl verbaute jeden Tisch, der etwas anderes
 * spielt.
 *
 * Jeder Baustein hat ein Schloss. Ohne das wuerfelt man den guten Aufhaenger
 * weg, waehrend man die Fraktionen sucht.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BAUSTEINE,
  erzeugeAufhaenger,
  erzeugeEntwurf,
  erzeugeFigur,
  erzeugeFraktion,
  erzeugeOrt,
  erzeugeVerbindung,
  moeglichkeiten,
  type Baustein,
  type Entwurf
} from '../shared/erzeuge';
import { alsMarkdown, alsNotizen } from '../shared/notizen';
import {
  REGION_TEXTE,
  THEMA_TEXTE,
  TONFALL_TEXTE,
  UMFAENGE,
  UMFANG_TEXTE,
  alsRegionId,
  alsThemaId,
  alsTonfallId,
  text,
  type Paar,
  type UmfangId,
  type Zuschnitt
} from '../shared/tabellen';
import { getLanguage, onLanguageChange, t, type Language, type TextKey } from './i18n';
import { api } from './api';

/** Der Zufall dieses Werkzeugs. Die Erzeuger bekommen ihn uebergeben. */
const wuerfel = Math.random;

function beschriftung(paar: Paar, sprache: Language): string {
  return text(paar, sprache);
}

export function App() {
  const [entwurf, setEntwurf] = useState<Entwurf | null>(null);
  const [festgehalten, setFestgehalten] = useState<readonly Baustein[]>([]);
  const [umfang, setUmfang] = useState<UmfangId>('bogen');
  const [regionText, setRegionText] = useState('');
  const [themaText, setThemaText] = useState('');
  const [tonfallText, setTonfallText] = useState('');
  const [titel, setTitel] = useState('');
  const [exportStand, setExportStand] = useState<'ruht' | 'laeuft' | 'fertig' | 'fehler'>('ruht');
  const [exportText, setExportText] = useState('');
  const [kopiert, setKopiert] = useState(false);
  const [sprache, setSprache] = useState<Language>(getLanguage);

  useEffect(() => onLanguageChange(() => setSprache(getLanguage())), []);

  /**
   * Was eingestellt ist, als Marken.
   *
   * Getippt wird Text, gerechnet wird mit Marken. Unbekannter Text ergibt
   * eine leere Marke und damit „beliebig" — das ist kein Fehlerfall, sondern
   * der Normalfall fuer jede Welt, die nicht aus unserer Vorschlagsliste
   * stammt.
   */
  const zuschnitt: Zuschnitt = useMemo(
    () => ({
      umfang,
      region: alsRegionId(regionText),
      thema: alsThemaId(themaText),
      tonfall: alsTonfallId(tonfallText)
    }),
    [umfang, regionText, themaText, tonfallText]
  );

  const zahlen = useMemo(() => moeglichkeiten(), []);
  const formatiert = useMemo(() => {
    const format = new Intl.NumberFormat(sprache === 'de' ? 'de-DE' : 'en-GB');
    return {
      aufhaenger: format.format(zahlen.aufhaenger),
      orte: format.format(zahlen.orte),
      figuren: format.format(zahlen.figuren)
    };
  }, [zahlen, sprache]);

  const wuerfleAlles = useCallback(() => {
    setEntwurf((vorher) => erzeugeEntwurf(zuschnitt, getLanguage(), wuerfel, festgehalten, vorher));
    setExportStand('ruht');
  }, [zuschnitt, festgehalten]);

  /**
   * Einen einzelnen Baustein neu wuerfeln.
   *
   * Sein eigenes Schloss zaehlt hier nicht: wer auf den Knopf DIESES
   * Bausteins drueckt, meint genau ihn. Ein Knopf, der nichts tut, weil
   * daneben ein Schloss zu ist, sieht aus wie ein Fehler.
   */
  const wuerfleBaustein = useCallback(
    (baustein: Baustein) => {
      setEntwurf((vorher) => {
        if (!vorher) return erzeugeEntwurf(zuschnitt, getLanguage(), wuerfel);
        const andere = BAUSTEINE.filter((eintrag) => eintrag !== baustein);
        return erzeugeEntwurf(zuschnitt, getLanguage(), wuerfel, andere, vorher);
      });
      setExportStand('ruht');
    },
    [zuschnitt]
  );

  /** Eine einzelne Zeile, ohne den Rest des Bausteins anzufassen. */
  const ersetze = useCallback((aendere: (alt: Entwurf) => Entwurf) => {
    setEntwurf((vorher) => (vorher ? aendere(vorher) : vorher));
    setExportStand('ruht');
  }, []);

  const schalteSchloss = useCallback((baustein: Baustein) => {
    setFestgehalten((alt) =>
      alt.includes(baustein) ? alt.filter((eintrag) => eintrag !== baustein) : [...alt, baustein]
    );
  }, []);

  const uebernehmen = useCallback(async () => {
    if (!entwurf) return;
    setExportStand('laeuft');
    const notizen = alsNotizen(entwurf, getLanguage(), titel.trim() || t('export.titelVorgabe'));
    try {
      const ergebnis = await api.export(notizen);
      setExportStand(ergebnis.ok ? 'fertig' : 'fehler');
      setExportText(
        ergebnis.ok
          ? t('export.fertig', { anzahl: ergebnis.angelegt, ziel: ergebnis.text })
          : t('export.fehler', { grund: ergebnis.text })
      );
    } catch (fehler) {
      setExportStand('fehler');
      setExportText(t('export.fehler', { grund: String(fehler) }));
    }
  }, [entwurf, titel]);

  const kopieren = useCallback(async () => {
    if (!entwurf) return;
    const markdown = alsMarkdown(entwurf, getLanguage());
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {
      // Unter file:// ist die Zwischenablage nicht immer freigegeben. Der
      // alte Weg funktioniert dort noch.
      const feld = document.createElement('textarea');
      feld.value = markdown;
      document.body.appendChild(feld);
      feld.select();
      document.execCommand('copy');
      feld.remove();
    }
    setKopiert(true);
    window.setTimeout(() => setKopiert(false), 1500);
  }, [entwurf]);

  const regler = (
    schluessel: TextKey,
    wert: string,
    setze: (wert: string) => void,
    texte: Record<string, Paar>,
    listenId: string
  ) => (
    <label className="regler">
      <span className="regler__name">{t(schluessel)}</span>
      <input
        className="regler__feld"
        list={listenId}
        value={wert}
        placeholder={t('regler.beliebig')}
        onChange={(ereignis) => setze(ereignis.target.value)}
      />
      <datalist id={listenId}>
        {Object.values(texte).map((paar) => (
          <option key={paar.de} value={beschriftung(paar, sprache)} />
        ))}
      </datalist>
    </label>
  );

  const kopf = (baustein: Baustein, hinweis?: TextKey) => {
    const zu = festgehalten.includes(baustein);
    return (
      <header className="karte__kopf">
        <h2 className="karte__titel">{t(`baustein.${baustein}` as TextKey)}</h2>
        {hinweis && <p className="karte__hinweis">{t(hinweis)}</p>}
        <div className="karte__knoepfe">
          <button
            type="button"
            className={zu ? 'knopf knopf--aktiv' : 'knopf'}
            aria-pressed={zu}
            onClick={() => schalteSchloss(baustein)}
          >
            {zu ? t('knopf.losgeben') : t('knopf.festhalten')}
          </button>
          <button type="button" className="knopf" onClick={() => wuerfleBaustein(baustein)}>
            {t('knopf.nochmal')}
          </button>
        </div>
      </header>
    );
  };

  /** Der kleine Knopf an einer einzelnen Zeile. */
  const zeilenKnopf = (beiKlick: () => void) => (
    <button type="button" className="zeile__knopf" title={t('knopf.zeileNeu')} onClick={beiKlick}>
      ⟳
    </button>
  );

  return (
    <div className="app">
      <header className="app__kopf">
        <h1 className="app__titel">{t('app.title')}</h1>
        <p className="app__unterzeile">{t('app.unterzeile')}</p>
      </header>

      <section className="regler-leiste">
        <label className="regler">
          <span className="regler__name">{t('regler.umfang')}</span>
          <select
            className="regler__feld"
            value={umfang}
            onChange={(ereignis) => setUmfang(ereignis.target.value as UmfangId)}
          >
            {UMFAENGE.map((eintrag) => (
              <option key={eintrag} value={eintrag}>
                {beschriftung(UMFANG_TEXTE[eintrag], sprache)}
              </option>
            ))}
          </select>
        </label>
        {regler('regler.region', regionText, setRegionText, REGION_TEXTE, 'liste-region')}
        {regler('regler.thema', themaText, setThemaText, THEMA_TEXTE, 'liste-thema')}
        {regler('regler.tonfall', tonfallText, setTonfallText, TONFALL_TEXTE, 'liste-tonfall')}
      </section>

      <div className="wurf">
        <button type="button" className="knopf knopf--gross" onClick={wuerfleAlles}>
          {t('knopf.allesWuerfeln')}
        </button>
        <p className="wurf__zahlen">{t('moeglichkeiten', formatiert)}</p>
      </div>

      {!entwurf && <p className="leer">{t('leer')}</p>}

      {entwurf && (
        <main className="bausteine">
          <section className="karte">
            {kopf('aufhaenger')}
            <ul className="zeilen">
              {(['ausloeser', 'betroffene', 'komplikation'] as const).map((feld) => (
                <li className="zeile" key={feld}>
                  <span>{entwurf.aufhaenger[feld]}</span>
                  {zeilenKnopf(() =>
                    ersetze((alt) => ({
                      ...alt,
                      aufhaenger: {
                        ...alt.aufhaenger,
                        [feld]: erzeugeAufhaenger(zuschnitt, getLanguage(), wuerfel)[feld]
                      }
                    }))
                  )}
                </li>
              ))}
              {entwurf.aufhaenger.frist && (
                <li className="zeile zeile--frist">
                  <span>
                    <strong>{t('feld.frist')}:</strong> {entwurf.aufhaenger.frist}
                  </span>
                </li>
              )}
            </ul>
          </section>

          <section className="karte">
            {kopf('fraktionen', 'hinweis.fraktionen')}
            <ul className="zeilen">
              {entwurf.fraktionen.map((fraktion, stelle) => (
                <li className="block" key={`${fraktion.name}-${stelle}`}>
                  <div className="block__kopf">
                    <h3 className="block__titel">{fraktion.name}</h3>
                    {zeilenKnopf(() =>
                      ersetze((alt) => ({
                        ...alt,
                        fraktionen: alt.fraktionen.map((eintrag, i) =>
                          i === stelle ? erzeugeFraktion(zuschnitt, getLanguage(), wuerfel) : eintrag
                        )
                      }))
                    )}
                  </div>
                  <p className="block__art">{fraktion.art}</p>
                  <p>
                    <strong>{t('feld.ziel')}:</strong> {fraktion.ziel}
                  </p>
                  <p>
                    <strong>{t('feld.mittel')}:</strong> {fraktion.mittel}
                  </p>
                  <p>
                    <strong>{t('feld.schwaeche')}:</strong> {fraktion.schwaeche}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="karte">
            {kopf('figuren')}
            <ul className="zeilen">
              {entwurf.figuren.map((figur, stelle) => (
                <li className="block" key={`${figur.name}-${stelle}`}>
                  <div className="block__kopf">
                    <h3 className="block__titel">
                      {figur.name} <span className="block__rolle">{figur.rolle}</span>
                    </h3>
                    {zeilenKnopf(() =>
                      ersetze((alt) => ({
                        ...alt,
                        figuren: alt.figuren.map((eintrag, i) =>
                          i === stelle ? erzeugeFigur(zuschnitt, getLanguage(), wuerfel) : eintrag
                        )
                      }))
                    )}
                  </div>
                  <p>
                    <strong>{t('feld.will')}:</strong> {figur.triebfeder}
                  </p>
                  <p>
                    <strong>{t('feld.hat')}:</strong> {figur.hebel}
                  </p>
                  <p>
                    <strong>{t('feld.haken')}:</strong> {figur.makel}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="karte">
            {kopf('orte')}
            <ul className="zeilen">
              {entwurf.orte.map((ort, stelle) => (
                <li className="block" key={`${ort.name}-${stelle}`}>
                  <div className="block__kopf">
                    <h3 className="block__titel">{ort.name}</h3>
                    {zeilenKnopf(() =>
                      ersetze((alt) => ({
                        ...alt,
                        orte: alt.orte.map((eintrag, i) =>
                          i === stelle ? erzeugeOrt(zuschnitt, getLanguage(), wuerfel) : eintrag
                        )
                      }))
                    )}
                  </div>
                  <p className="block__art">{ort.art}</p>
                  <p>{ort.merkmal}</p>
                  <p>{ort.zustand}</p>
                  <p className="block__karte">
                    <strong>{t('feld.karte')}:</strong> {ort.karte}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="karte">
            {kopf('verbindungen', 'hinweis.verbindungen')}
            <ul className="zeilen">
              {entwurf.verbindungen.map((verbindung, stelle) => (
                <li className="block" key={`${verbindung.a}-${verbindung.b}-${stelle}`}>
                  <div className="block__kopf">
                    <h3 className="block__titel">{verbindung.muster}</h3>
                    {zeilenKnopf(() =>
                      ersetze((alt) => ({
                        ...alt,
                        verbindungen: alt.verbindungen.map((eintrag, i) =>
                          i === stelle
                            ? erzeugeVerbindung(
                                eintrag.a,
                                eintrag.b,
                                alt.figuren,
                                zuschnitt,
                                getLanguage(),
                                wuerfel
                              )
                            : eintrag
                        )
                      }))
                    )}
                  </div>
                  <p>{verbindung.hin}</p>
                  <p className="block__zurueck">{verbindung.zurueck}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="karte">
            {kopf('zeitstrahl', 'hinweis.zeitstrahl')}
            <ol className="zeitstrahl">
              {entwurf.zeitstrahl.map((punkt, stelle) => (
                <li key={`${punkt.marke}-${stelle}`}>
                  <span className="zeitstrahl__marke">{punkt.marke}</span>
                  <span>{punkt.was}</span>
                </li>
              ))}
            </ol>
          </section>
        </main>
      )}

      {entwurf && (
        <footer className="fuss">
          <label className="fuss__titel">
            <span className="regler__name">{t('export.titel')}</span>
            <input
              className="regler__feld"
              value={titel}
              placeholder={t('export.titelVorgabe')}
              onChange={(ereignis) => setTitel(ereignis.target.value)}
            />
          </label>
          <div className="fuss__knoepfe">
            <button type="button" className="knopf" onClick={kopieren}>
              {kopiert ? t('knopf.kopiert') : t('knopf.kopieren')}
            </button>
            <button
              type="button"
              className="knopf knopf--gross"
              disabled={exportStand === 'laeuft'}
              onClick={() => void uebernehmen()}
            >
              {exportStand === 'laeuft' ? t('knopf.exportLaeuft') : t('knopf.export')}
            </button>
          </div>
          <p className="fuss__hinweis">{t('export.hinweis')}</p>
          {exportStand !== 'ruht' && exportStand !== 'laeuft' && (
            <p className={exportStand === 'fehler' ? 'fuss__meldung fuss__meldung--fehler' : 'fuss__meldung'}>
              {exportText}
            </p>
          )}
        </footer>
      )}
    </div>
  );
}
