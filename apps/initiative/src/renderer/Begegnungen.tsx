/** Die Liste der gespeicherten Begegnungen. */
import { t } from './i18n';
import type { Begegnung } from '../shared/types';

interface Props {
  readonly begegnungen: readonly Begegnung[];
  onOeffnen(id: string): void;
  onLoeschen(id: string): Promise<void>;
  onSchliessen(): void;
}

export function Begegnungen({ begegnungen, onOeffnen, onLoeschen, onSchliessen }: Props) {
  return (
    <div className="begegnungen motion-eintritt">
      {begegnungen.length === 0 ? (
        <p className="begegnungen__leer">{t('begegnung.keine')}</p>
      ) : (
        <ul className="begegnungen__liste">
          {begegnungen.map((begegnung) => (
            <li key={begegnung.id}>
              <button type="button" onClick={() => onOeffnen(begegnung.id)}>
                <span className="begegnungen__name">{begegnung.name}</span>
                <span className="begegnungen__zahl">{begegnung.teilnehmer.length}</span>
              </button>
              <button
                type="button"
                className="knopf--gefahr"
                onClick={() => void onLoeschen(begegnung.id)}
                aria-label={t('knopf.entfernen')}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="begegnungen__zu" onClick={onSchliessen}>
        ×
      </button>
    </div>
  );
}
