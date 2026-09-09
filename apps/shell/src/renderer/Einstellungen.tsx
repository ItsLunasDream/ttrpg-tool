/**
 * Die Einstellungen der Huelle.
 *
 * Bisher steht hier eine einzige Sache, die Sprache — und die ist ehrlich
 * abgegrenzt: sie gilt fuer diesen Rahmen, nicht fuer die Werkzeuge darin.
 * Jedes bringt seine eigene Spracheinstellung mit, und die von aussen zu
 * ueberschreiben waere eine Ueberraschung fuer jeden, der sie dort bewusst
 * anders gesetzt hat.
 */
import { useState } from 'react';
import { LANGUAGES, type Language, type MessageKey, type MessageParams } from '../shared/i18n';
import { Dialog } from './Dialog';

interface Props {
  readonly sprache: Language;
  readonly setzeSprache: (sprache: Language) => Promise<void>;
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Einstellungen({ sprache, setzeSprache, onClose, t }: Props) {
  const [fehler, setFehler] = useState<string | null>(null);

  return (
    <Dialog titel={t('settings.title')} schliessenText={t('dialog.close')} onClose={onClose}>
      <label className="feld">
        <span className="feld__name">{t('settings.language')}</span>
        <select
          className="feld__wahl"
          value={sprache}
          onChange={(event) => {
            setFehler(null);
            // Der Fehler wird angezeigt und nicht verschluckt: eine
            // Einstellung, die nach dem Neustart wieder auf dem alten Wert
            // steht, ohne dass jemand etwas gesagt haette, ist das
            // Aergerlichere.
            void setzeSprache(event.target.value as Language).catch((grund: unknown) =>
              setFehler(t('settings.saveFailed', { detail: String(grund) }))
            );
          }}
        >
          {LANGUAGES.map((eintrag) => (
            <option key={eintrag.id} value={eintrag.id}>
              {eintrag.label}
            </option>
          ))}
        </select>
      </label>
      <p className="feld__hinweis">{t('settings.languageHint')}</p>
      {fehler && <p className="feld__fehler">{fehler}</p>}
    </Dialog>
  );
}
