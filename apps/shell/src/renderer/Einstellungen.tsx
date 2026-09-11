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
import { Dialog } from './Dialog';

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
  readonly ki: KiEinstellungen;
  readonly setzeKi: (aenderung: Partial<KiEinstellungen>) => Promise<void>;
  readonly kiZustand: KiZustandAnsicht | null;
  readonly pruefeKi: () => Promise<void>;
  readonly setzeSchluessel: (schluessel: string) => Promise<void>;
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Einstellungen({
  sprache,
  setzeSprache,
  ki,
  setzeKi,
  kiZustand,
  pruefeKi,
  setzeSchluessel,
  onClose,
  t
}: Props) {
  const [fehler, setFehler] = useState<string | null>(null);
  const [schluessel, setSchluessel] = useState('');
  const [pruefend, setPruefend] = useState(false);

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

      {ki.anbieter === 'claude' ? (
        <>
          <label className="feld">
            <span className="feld__name">{t('settings.claudeModel')}</span>
            <input
              className="feld__eingabe"
              value={ki.claudeModell}
              onChange={(event) => melde(setzeKi({ claudeModell: event.target.value }))}
            />
          </label>

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

      {fehler && <p className="feld__fehler">{fehler}</p>}
    </Dialog>
  );
}
