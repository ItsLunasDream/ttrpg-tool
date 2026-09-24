/**
 * Die Einstellungen der Huelle.
 *
 * Die Sprache gilt nur fuer diesen Rahmen — jedes Werkzeug bringt seine
 * eigene mit, und die von aussen zu ueberschreiben waere eine Ueberraschung
 * fuer jeden, der sie dort bewusst anders gesetzt hat. Die KI dagegen gilt
 * fuer alle: ein Sprachmodell richtet man einmal ein und benutzt es dann
 * ueberall; wer den Schluessel in jedem Werkzeug neu eintippen muesste,
 * tippt ihn zweimal falsch.
 *
 * ABSCHNITTE STATT EINER LANGEN LISTE
 * ===================================
 * Frueher stand alles untereinander in einem schmalen Kasten: Sprache,
 * Thema, KI, jedes offene Werkzeug, Symbole, Sicherung, Einfuehrungen. Wer
 * die Sicherung suchte, scrollte an allem anderen vorbei, und das Fenster
 * war eine Reihe von Auswahlfeldern — bedienbar, aber nichts, das man gern
 * aufmacht.
 *
 * Jetzt links die Bereiche, rechts einer davon. Die Breite ist dabei kein
 * Selbstzweck: sie wird gebraucht, weil die Farbproben nebeneinander liegen
 * und die Navigation eine eigene Spalte hat. Ein breiter Kasten mit
 * derselben Liste darin waere nur leere Flaeche links und rechts gewesen.
 *
 * ZWEI AUSWAHLFELDER SIND VERSCHWUNDEN, und zwar mit Grund:
 *
 * - **Das Thema** ist jetzt eine Reihe von Proben. Ein Klappfeld, in dem
 *   „Pergament" steht, sagt nichts darueber, wie Pergament aussieht — man
 *   waehlt, schaut, waehlt neu. Die Probe zeigt Grund, Betonung und Text
 *   des Themas, und damit waehlt man einmal.
 * - **Die Sprache** hat zwei Werte. Ein Klappfeld fuer zwei Werte ist ein
 *   Klick zu viel; zwei Knoepfe nebeneinander zeigen beide auf einmal.
 *
 * Die KI-Anbindung bleibt ein Klappfeld: dort kommen Anbieter dazu, und
 * vier Knoepfe nebeneinander waeren in einem Jahr sieben.
 */
import { useState, type ReactNode } from 'react';
import { LANGUAGES, type Language, type MessageKey, type MessageParams } from '../shared/i18n';
import type { KiEinstellungen } from '@suite/ki/einstellungen';
import type { Werkzeugeinstellungen, Wert } from '@suite/einstellungen';
import { THEMEN, text as farbtext } from '@suite/farben';
import { Dialog } from './Dialog';
import { GROESSEN } from '../shared/apps';
import { Werkzeugfelder } from './Werkzeugfelder';
import { AppSymbol } from './icons';

/** Was die Bereitschaftspruefung zurueckmeldet. Der Schluessel selbst nie. */
export interface KiZustandAnsicht {
  anbieter: string;
  bereit: boolean;
  beschreibung: string;
  hatSchluessel: boolean;
}

interface Props {
  readonly sprache: Language;
  readonly setzeSprache: (sprache: Language) => Promise<void>;
  readonly thema: string;
  readonly setzeThema: (thema: string) => Promise<void>;
  /** Die Groesse der ganzen Oberflaeche in Prozent (#61). */
  readonly groesse: number;
  readonly setzeGroesse: (prozent: number) => Promise<void>;
  readonly ki: KiEinstellungen;
  readonly setzeKi: (aenderung: Partial<KiEinstellungen>) => Promise<void>;
  readonly kiZustand: KiZustandAnsicht | null;
  readonly pruefeKi: () => Promise<void>;
  readonly setzeSchluessel: (schluessel: string) => Promise<void>;
  /** Oeffnet den Ordner fuer eigene Symbole im Dateimanager. */
  readonly symbolordnerOeffnen: () => Promise<string>;
  /** Liest die Symbole neu von der Platte. */
  readonly symboleNeuLaden: () => Promise<void>;
  /** Vergisst, welche Einfuehrungen schon gesehen sind. */
  readonly einfuehrungenZuruecksetzen: () => Promise<void>;
  /** Schreibt eine Sicherung der ganzen Sammlung. */
  readonly sichern: () => Promise<{ ok: boolean; text: string; dateien: number }>;
  /** Oeffnet den Datenordner — von Hand zurueckspielen geht nur dort. */
  readonly datenordnerOeffnen: () => Promise<string>;
  /**
   * Alle waehlbaren Werkzeuge, mit ihrem uebersetzten Namen und der Frage,
   * ob sie gerade laufen.
   *
   * ALLE, nicht nur die laufenden. Frueher standen hier nur die montierten,
   * weil ein nie geoeffnetes Werkzeug seine Einstellungen noch nicht geladen
   * hat und nichts beantworten koennte. Das stimmt — nur war die Folge
   * falsch: die Liste sah je nach Vorgeschichte anders aus, und wer etwas
   * vermisste, suchte den Fehler bei sich. Ein nicht laufendes Werkzeug
   * bekommt jetzt statt seiner Felder einen Knopf, der es oeffnet.
   */
  readonly werkzeuge: readonly {
    readonly id: string;
    readonly name: string;
    readonly laeuft: boolean;
  }[];
  /** Oeffnet ein Werkzeug, damit es seine Einstellungen liefern kann. */
  readonly werkzeugOeffnen: (appId: string) => Promise<void>;
  readonly werkzeugEinstellungen: (appId: string) => Promise<Werkzeugeinstellungen | null>;
  readonly werkzeugSetzen: (
    appId: string,
    feldId: string,
    wert: Wert
  ) => Promise<Werkzeugeinstellungen | null>;
  readonly werkzeugBefehl: (
    appId: string,
    befehlId: string,
    wert?: string
  ) => Promise<Werkzeugeinstellungen | null>;
  /**
   * Die eigenen Bilder der Werkzeuge, nach Kennung.
   *
   * Fuer die Navigation links: dort steht dasselbe Symbol wie auf der
   * Kachel. Wer sein eigenes Bild hinterlegt hat, erkennt sein Werkzeug
   * daran schneller als am Namen.
   */
  readonly symbole: Record<string, string>;
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

/** Ein Bereich der Einstellungen. Werkzeuge kommen als `werkzeug:<id>` dazu. */
type Bereich = 'aussehen' | 'ki' | 'daten' | `werkzeug:${string}`;

export function Einstellungen({
  sprache,
  setzeSprache,
  thema,
  setzeThema,
  groesse,
  setzeGroesse,
  ki,
  setzeKi,
  kiZustand,
  pruefeKi,
  setzeSchluessel,
  symbolordnerOeffnen,
  symboleNeuLaden,
  einfuehrungenZuruecksetzen,
  sichern,
  datenordnerOeffnen,
  werkzeuge,
  werkzeugOeffnen,
  werkzeugEinstellungen,
  werkzeugSetzen,
  werkzeugBefehl,
  symbole,
  onClose,
  t
}: Props) {
  const [bereich, setBereich] = useState<Bereich>('aussehen');
  const [fehler, setFehler] = useState<string | null>(null);
  const [schluessel, setSchluessel] = useState('');
  const [pruefend, setPruefend] = useState(false);
  const [einfuehrungenZurueck, setEinfuehrungenZurueck] = useState(false);
  /** Was die letzte Sicherung ergeben hat, oder `null`, solange keine lief. */
  const [gesichert, setGesichert] = useState<{ pfad: string; dateien: number } | null>(null);
  const [sichertGerade, setSichertGerade] = useState(false);

  /**
   * Der Fehler wird angezeigt und nicht verschluckt: eine Einstellung, die
   * nach dem Neustart wieder auf dem alten Wert steht, ohne dass jemand etwas
   * gesagt haette, ist das Aergerlichere.
   */
  const melde = (versprechen: Promise<unknown>) => {
    setFehler(null);
    void versprechen.catch((grund: unknown) =>
      setFehler(t('settings.saveFailed', { detail: String(grund) }))
    );
  };

  const werkzeugBereich = (id: string) => `werkzeug:${id}` as Bereich;

  /** Ein Eintrag in der Navigation links. */
  const navKnopf = (id: Bereich, beschriftung: string, symbol: ReactNode) => (
    <button
      key={id}
      type="button"
      className={bereich === id ? 'einst__nav-knopf is-an' : 'einst__nav-knopf'}
      aria-current={bereich === id}
      // Damit die Rauchtests einen Bereich ueber seine Kennung finden und
      // nicht ueber die Beschriftung: die haengt an der Sprache.
      data-bereich={id}
      onClick={() => setBereich(id)}
    >
      <span className="einst__nav-symbol" aria-hidden="true">
        {symbol}
      </span>
      {beschriftung}
    </button>
  );

  const titelDesBereichs = () => {
    if (bereich === 'aussehen') return t('settings.sectionLook');
    if (bereich === 'ki') return t('settings.ai');
    if (bereich === 'daten') return t('settings.sectionData');
    const gesucht = werkzeuge.find((w) => werkzeugBereich(w.id) === bereich);
    return gesucht?.name ?? t('settings.title');
  };

  return (
    <Dialog
      titel={t('settings.title')}
      schliessenText={t('dialog.close')}
      onClose={onClose}
      breit
      kopf={null}
    >
      <div className="einst">
        <nav className="einst__nav" aria-label={t('settings.title')}>
          <h2 className="einst__nav-titel">{t('settings.title')}</h2>
          {navKnopf('aussehen', t('settings.sectionLook'), '◐')}
          {navKnopf('ki', t('settings.ai'), '✦')}
          {navKnopf('daten', t('settings.sectionData'), '▤')}

          {/*
            Die Werkzeuge, jedes mit seinem eigenen Symbol — demselben wie
            auf der Kachel. Immer alle, damit die Liste nicht je nach
            Vorgeschichte anders aussieht.
          */}
          {werkzeuge.length > 0 ? (
            <h3 className="einst__nav-gruppe">{t('settings.sectionTools')}</h3>
          ) : null}
          {werkzeuge.map((werkzeug) =>
            navKnopf(
              werkzeugBereich(werkzeug.id),
              werkzeug.name,
              <AppSymbol id={werkzeug.id} size={18} bild={symbole[werkzeug.id]} />
            )
          )}
        </nav>

        <div className="einst__seite">
          <header className="einst__kopf">
            <h2>{titelDesBereichs()}</h2>
          </header>
          <div key={bereich} className="einst__inhalt motion-erscheinen">
            {bereich === 'aussehen' ? (
              <>
                <section className="einst__gruppe">
                  <h3>{t('settings.theme')}</h3>
                  <p className="einst__satz">{t('settings.themeHint')}</p>
                  {/*
                    Waehlen, indem man hinsieht. Die Probe zeigt den Grund
                    des Themas und darauf drei Streifen: Betonung, das Gold
                    der Sammlung und die Textfarbe. Das sind genau die drei,
                    an denen man ein Thema wiedererkennt.
                  */}
                  <div className="themenwahl">
                    {THEMEN.map((eintrag) => (
                      <button
                        key={eintrag.id}
                        type="button"
                        className={eintrag.id === thema ? 'themenwahl__probe is-an' : 'themenwahl__probe'}
                        aria-pressed={eintrag.id === thema}
                        data-thema={eintrag.id}
                        onClick={() => melde(setzeThema(eintrag.id))}
                      >
                        <span
                          className="themenwahl__flaeche"
                          style={{ background: eintrag.farben.grund, borderColor: eintrag.farben.rand }}
                        >
                          <i style={{ background: eintrag.farben.betont }} />
                          <i style={{ background: eintrag.farben.fest }} />
                          <i style={{ background: eintrag.farben.text }} />
                        </span>
                        <span className="themenwahl__name">
                          {farbtext(eintrag.name, sprache === 'de' ? 'de' : 'en')}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="einst__gruppe">
                  <h3>{t('settings.size')}</h3>
                  <p className="einst__satz">{t('settings.sizeHint')}</p>
                  <div className="segment" role="group" aria-label={t('settings.size')}>
                    {GROESSEN.map((stufe) => (
                      <button
                        key={stufe}
                        type="button"
                        className={stufe === groesse ? 'segment__knopf is-an' : 'segment__knopf'}
                        aria-pressed={stufe === groesse}
                        data-groesse={stufe}
                        onClick={() => melde(setzeGroesse(stufe))}
                      >
                        {stufe}&nbsp;%
                      </button>
                    ))}
                  </div>
                </section>

                <section className="einst__gruppe">
                  <h3>{t('settings.language')}</h3>
                  <p className="einst__satz">{t('settings.languageHint')}</p>
                  {/* Zwei Werte, zwei Knoepfe: ein Klappfeld waere ein Klick zu viel. */}
                  <div className="segment" role="group" aria-label={t('settings.language')}>
                    {LANGUAGES.map((eintrag) => (
                      <button
                        key={eintrag.id}
                        type="button"
                        className={eintrag.id === sprache ? 'segment__knopf is-an' : 'segment__knopf'}
                        aria-pressed={eintrag.id === sprache}
                        data-sprache={eintrag.id}
                        onClick={() => melde(setzeSprache(eintrag.id as Language))}
                      >
                        {eintrag.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="einst__gruppe">
                  <h3>{t('settings.icons')}</h3>
                  <p className="einst__satz">{t('settings.iconsHint')}</p>
                  <div className="feld__knoepfe">
                    <button type="button" onClick={() => melde(symbolordnerOeffnen())}>
                      {t('settings.iconsOpen')}
                    </button>
                    <button type="button" onClick={() => melde(symboleNeuLaden())}>
                      {t('settings.iconsReload')}
                    </button>
                  </div>
                </section>
              </>
            ) : null}

            {bereich === 'ki' ? (
              <section className="einst__gruppe">
              <label className="feld">
                <span className="feld__name">{t('settings.aiProvider')}</span>
                <select
                  className="feld__wahl"
                  value={ki.anbieter}
                  onChange={(event) =>
                    melde(setzeKi({ anbieter: event.target.value as KiEinstellungen['anbieter'] }))
                  }
                >
                  <option value="none">{t('settings.aiNone')}</option>
                  <option value="ollama">{t('settings.aiOllama')}</option>
                  <option value="claude">{t('settings.aiClaude')}</option>
                  <option value="offen">{t('settings.aiOpen')}</option>
                </select>
              </label>
              <p className="feld__hinweis">{t('settings.aiHint')}</p>

              {ki.anbieter === 'ollama' ? (
                <>
                  <label className="feld">
                    <span className="feld__name">{t('settings.ollamaUrl')}</span>
                    <input
                      className="feld__eingabe"
                      value={ki.ollamaAdresse}
                      onChange={(event) => melde(setzeKi({ ollamaAdresse: event.target.value }))}
                    />
                  </label>
                  <label className="feld">
                    <span className="feld__name">{t('settings.ollamaModel')}</span>
                    <input
                      className="feld__eingabe"
                      value={ki.ollamaModell}
                      onChange={(event) => melde(setzeKi({ ollamaModell: event.target.value }))}
                    />
                  </label>
                </>
              ) : null}

              {ki.anbieter === 'offen' ? (
                <>
                  <label className="feld">
                    <span className="feld__name">{t('settings.openUrl')}</span>
                    <input
                      className="feld__eingabe"
                      value={ki.offenAdresse}
                      placeholder="https://api.groq.com/openai/v1"
                      onChange={(event) => melde(setzeKi({ offenAdresse: event.target.value }))}
                    />
                  </label>
                  <label className="feld">
                    <span className="feld__name">{t('settings.openModel')}</span>
                    <input
                      className="feld__eingabe"
                      value={ki.offenModell}
                      onChange={(event) => melde(setzeKi({ offenModell: event.target.value }))}
                    />
                  </label>
                  <p className="feld__hinweis">{t('settings.openHint')}</p>
                </>
              ) : null}

              {ki.anbieter === 'claude' ? (
                <label className="feld">
                  <span className="feld__name">{t('settings.claudeModel')}</span>
                  <input
                    className="feld__eingabe"
                    value={ki.claudeModell}
                    onChange={(event) => melde(setzeKi({ claudeModell: event.target.value }))}
                  />
                </label>
              ) : null}

              {/* Den Schluessel brauchen beide bezahlten Wege. Zweimal derselbe
                  Block waere zweimal dieselbe Pflege. */}
              {ki.anbieter === 'claude' || ki.anbieter === 'offen' ? (
                <>
                  <label className="feld">
                    <span className="feld__name">{t('settings.apiKey')}</span>
                    <input
                      className="feld__eingabe"
                      type="password"
                      value={schluessel}
                      placeholder={t('settings.apiKeyPlaceholder')}
                      onChange={(event) => setSchluessel(event.target.value)}
                    />
                  </label>
                  {kiZustand?.hatSchluessel ? (
                    <p className="feld__hinweis">{t('settings.apiKeySet')}</p>
                  ) : null}

                  <div className="feld__knoepfe">
                    <button
                      type="button"
                      disabled={!schluessel.trim()}
                      onClick={() => {
                        melde(setzeSchluessel(schluessel.trim()));
                        setSchluessel('');
                      }}
                    >
                      {t('settings.apiKeySave')}
                    </button>
                    {kiZustand?.hatSchluessel ? (
                      <button type="button" onClick={() => melde(setzeSchluessel(''))}>
                        {t('settings.apiKeyClear')}
                      </button>
                    ) : null}
                  </div>
                  <p className="feld__hinweis">{t('settings.apiKeyHint')}</p>
                </>
              ) : null}

              {ki.anbieter !== 'none' ? (
                <>
                  <div className="feld__knoepfe">
                    <button
                      type="button"
                      disabled={pruefend}
                      onClick={() => {
                        setPruefend(true);
                        setFehler(null);
                        void pruefeKi()
                          .catch((grund: unknown) =>
                            setFehler(t('settings.saveFailed', { detail: String(grund) }))
                          )
                          .finally(() => setPruefend(false));
                      }}
                    >
                      {pruefend ? t('settings.aiChecking') : t('settings.aiCheck')}
                    </button>
                  </div>
                  {kiZustand ? (
                    <p className="feld__hinweis">
                      {kiZustand.bereit
                        ? t('settings.aiReady', { detail: kiZustand.beschreibung })
                        : t('settings.aiNotReady', { detail: kiZustand.beschreibung })}
                    </p>
                  ) : null}
                </>
              ) : null}
              </section>
            ) : null}

            {bereich === 'daten' ? (
              <>
                <section className="einst__gruppe">
                <h3 className="feld__ueberschrift">{t('settings.backup')}</h3>
                <p className="feld__hinweis">{t('settings.backupHint')}</p>
                <div className="feld__knoepfe">
                  <button
                    type="button"
                    disabled={sichertGerade}
                    onClick={() => {
                      setSichertGerade(true);
                      setFehler(null);
                      setGesichert(null);
                      void sichern()
                        .then((ergebnis) => {
                          // Abgebrochen ist kein Fehler: dann bleibt die Zeile leer,
                          // statt nach Missgeschick zu klingen.
                          if (ergebnis.ok) {
                            setGesichert({ pfad: ergebnis.text, dateien: ergebnis.dateien });
                          } else if (ergebnis.text) {
                            setFehler(t('settings.saveFailed', { detail: ergebnis.text }));
                          }
                        })
                        .catch((grund: unknown) =>
                          setFehler(t('settings.saveFailed', { detail: String(grund) }))
                        )
                        .finally(() => setSichertGerade(false));
                    }}
                  >
                    {sichertGerade ? t('settings.backupRunning') : t('settings.backupNow')}
                  </button>
                  <button type="button" onClick={() => melde(datenordnerOeffnen())}>
                    {t('settings.backupFolder')}
                  </button>
                </div>
                {gesichert ? (
                  <p className="feld__hinweis">
                    {t('settings.backupDone', { count: gesichert.dateien })}
                    <br />
                    <code className="feld__pfad">{gesichert.pfad}</code>
                  </p>
                ) : null}
                <p className="feld__hinweis">{t('settings.backupRestore')}</p>
                </section>
                <section className="einst__gruppe">
                <h3 className="feld__ueberschrift">{t('settings.intro')}</h3>
                <p className="feld__hinweis">{t('settings.introHint')}</p>
                <div className="feld__knoepfe">
                  <button
                    type="button"
                    onClick={() => {
                      setEinfuehrungenZurueck(true);
                      melde(einfuehrungenZuruecksetzen());
                    }}
                  >
                    {t('settings.introReset')}
                  </button>
                </div>
                {einfuehrungenZurueck && <p className="feld__hinweis">{t('settings.introDone')}</p>}
                </section>
              </>
            ) : null}

            {/*
              Die Werkzeuge selbst. Sie stehen hier und nicht in einem
              eigenen Dialog im Werkzeug: zwei Stellen fuer Einstellungen
              heisst, dass man immer zuerst in der falschen nachsieht.
            */}
            {werkzeuge
              .filter((werkzeug) => werkzeugBereich(werkzeug.id) === bereich)
              .map((werkzeug) =>
                werkzeug.laeuft ? (
                  <Werkzeugfelder
                    key={werkzeug.id}
                    appId={werkzeug.id}
                    titel={werkzeug.name}
                    sprache={sprache === 'de' ? 'de' : 'en'}
                    lade={werkzeugEinstellungen}
                    setze={werkzeugSetzen}
                    befehl={werkzeugBefehl}
                    onFehler={(grund) =>
                      setFehler(t('settings.saveFailed', { detail: String(grund) }))
                    }
                  />
                ) : (
                  /*
                   * Ein Werkzeug, das nicht laeuft, kann nicht sagen, was es
                   * einstellen kann — es hat seine Einstellungen nie
                   * geladen. Statt einer leeren Seite steht hier, warum, und
                   * ein Knopf, der es aendert. Ein bewusster Klick: von
                   * selbst zu montieren, weil jemand durch die Liste geht,
                   * kostet Speicher fuer etwas, das niemand wollte.
                   */
                  <section className="einst__gruppe" key={werkzeug.id}>
                    <p className="einst__satz">{t('settings.toolClosed')}</p>
                    <div className="feld__knoepfe">
                      <button type="button" onClick={() => void werkzeugOeffnen(werkzeug.id)}>
                        {t('settings.toolOpen', { name: werkzeug.name })}
                      </button>
                    </div>
                  </section>
                )
              )}

            {fehler && <p className="feld__fehler">{fehler}</p>}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
