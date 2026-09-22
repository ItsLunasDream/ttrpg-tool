/**
 * Die Einstellungen der Huelle.
 *
 * Zwei Dinge stehen hier: die Sprache und die KI-Anbindung. Die Sprache gilt
 * nur fuer diesen Rahmen — jedes Werkzeug bringt seine eigene mit, und die von
 * aussen zu ueberschreiben waere eine Ueberraschung fuer jeden, der sie dort
 * bewusst anders gesetzt hat.
 *
 * Die KI dagegen gilt fuer alle. Ein Sprachmodell richtet man einmal ein und
 * benutzt es dann ueberall; wer den Schluessel in jedem Werkzeug neu
 * eintippen muesste, tippt ihn zweimal falsch.
 */
import { useState } from 'react';
import { LANGUAGES, type Language, type MessageKey, type MessageParams } from '../shared/i18n';
import type { KiEinstellungen } from '@suite/ki/einstellungen';
import type { Werkzeugeinstellungen, Wert } from '@suite/einstellungen';
import { THEMEN, text as farbtext } from '@suite/farben';
import { Dialog } from './Dialog';
import { Werkzeugfelder } from './Werkzeugfelder';

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
   * Die gerade laufenden Werkzeuge, mit ihrem uebersetzten Namen.
   *
   * Nur laufende: was noch nie offen war, hat seine Einstellungen noch nicht
   * geladen und koennte nichts beantworten. Das ist kein Mangel, sondern die
   * Regel dieses Fensters — man stellt ein Werkzeug ein, waehrend man darin
   * arbeitet.
   */
  readonly offeneWerkzeuge: readonly { readonly id: string; readonly name: string }[];
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
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Einstellungen({
  sprache,
  setzeSprache,
  thema,
  setzeThema,
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
  offeneWerkzeuge,
  werkzeugEinstellungen,
  werkzeugSetzen,
  werkzeugBefehl,
  onClose,
  t
}: Props) {
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

  return (
    <Dialog titel={t('settings.title')} schliessenText={t('dialog.close')} onClose={onClose}>
      <label className="feld">
        <span className="feld__name">{t('settings.language')}</span>
        <select
          className="feld__wahl"
          value={sprache}
          onChange={(event) => melde(setzeSprache(event.target.value as Language))}
        >
          {LANGUAGES.map((eintrag) => (
            <option key={eintrag.id} value={eintrag.id}>
              {eintrag.label}
            </option>
          ))}
        </select>
      </label>
      <p className="feld__hinweis">{t('settings.languageHint')}</p>

      {/*
        Das Thema gilt fuer das ganze Fenster, Werkzeuge eingeschlossen —
        anders als die Sprache, die jedes Werkzeug fuer sich fuehrt. Ein
        Fenster in zwei Farben waere keine Wahl, sondern ein Fehler.
      */}
      <label className="feld">
        <span className="feld__name">{t('settings.theme')}</span>
        <select
          className="feld__wahl"
          value={thema}
          onChange={(event) => melde(setzeThema(event.target.value))}
        >
          {THEMEN.map((eintrag) => (
            <option key={eintrag.id} value={eintrag.id}>
              {farbtext(eintrag.name, sprache === 'de' ? 'de' : 'en')}
            </option>
          ))}
        </select>
      </label>
      <p className="feld__hinweis">{t('settings.themeHint')}</p>

      <h3 className="feld__ueberschrift">{t('settings.ai')}</h3>

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

      {/*
        Die Werkzeuge selbst. Sie stehen hier und nicht in einem eigenen
        Dialog im Werkzeug: zwei Stellen fuer Einstellungen heisst, dass man
        immer zuerst in der falschen nachsieht.
      */}
      {offeneWerkzeuge.map((werkzeug) => (
        <Werkzeugfelder
          key={werkzeug.id}
          appId={werkzeug.id}
          titel={werkzeug.name}
          sprache={sprache === 'de' ? 'de' : 'en'}
          lade={werkzeugEinstellungen}
          setze={werkzeugSetzen}
          befehl={werkzeugBefehl}
          onFehler={(grund) => setFehler(t('settings.saveFailed', { detail: String(grund) }))}
        />
      ))}

      <h3 className="feld__ueberschrift">{t('settings.icons')}</h3>
      <p className="feld__hinweis">{t('settings.iconsHint')}</p>
      <div className="feld__knoepfe">
        <button type="button" onClick={() => melde(symbolordnerOeffnen())}>
          {t('settings.iconsOpen')}
        </button>
        <button type="button" onClick={() => melde(symboleNeuLaden())}>
          {t('settings.iconsReload')}
        </button>
      </div>

      {/*
        Die Sicherung der ganzen Sammlung.

        Bisher sicherte nur der Story Creator, und auch nur seine Kampagne.
        Hier geht alles hinein — bis auf den API-Schluessel: der liegt mit
        dem Schluesselbund DIESES Rechners verschluesselt da und waere
        anderswo ohnehin wertlos.
      */}
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

      {fehler && <p className="feld__fehler">{fehler}</p>}
    </Dialog>
  );
}
