import type { AppSettings } from '../../shared/types';
import { LANGUAGES } from '../../shared/i18n';
import { Modal } from './Modal';
import { useT } from '../i18n';

interface Props {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onChooseVaultRoot: () => void;
  onRevealVault: () => void;
  onClose: () => void;
}

export function SettingsDialog({ settings, onChange, onChooseVaultRoot, onRevealVault, onClose }: Props) {
  const t = useT();

  return (
    <Modal title={t('settings.title')} onClose={onClose}>
      <label className="field">
        <span className="field__label">{t('settings.language')}</span>
        <select
          value={settings.language}
          onChange={(event) => onChange({ language: event.target.value as typeof settings.language })}
        >
          {LANGUAGES.map((entry) => (
            <option value={entry.id} key={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field field--inline">
        <input
          type="checkbox"
          checked={settings.autosaveEnabled}
          onChange={(event) => onChange({ autosaveEnabled: event.target.checked })}
        />
        <span>{t('settings.autosave')}</span>
      </label>

      <label className="field">
        <span className="field__label">{t('settings.autosaveDelay')}</span>
        <input
          type="number"
          min={300}
          max={30000}
          step={100}
          disabled={!settings.autosaveEnabled}
          value={settings.autosaveDelayMs}
          onChange={(event) => onChange({ autosaveDelayMs: Number(event.target.value) })}
        />
      </label>

      <label className="field field--inline">
        <input
          type="checkbox"
          checked={settings.historyEnabled}
          onChange={(event) => onChange({ historyEnabled: event.target.checked })}
        />
        <span>{t('settings.history')}</span>
      </label>

      <label className="field">
        <span className="field__label">{t('settings.historyMax')}</span>
        <input
          type="number"
          min={1}
          max={500}
          step={1}
          disabled={!settings.historyEnabled}
          value={settings.historyMaxVersions}
          onChange={(event) => onChange({ historyMaxVersions: Number(event.target.value) })}
        />
      </label>

      <label className="field">
        <span className="field__label">{t('settings.location')}</span>
        <code className="field__path">{settings.vaultRoot}</code>
      </label>

      <div className="modal__actions">
        <button type="button" onClick={onChooseVaultRoot}>
          {t('settings.chooseFolder')}
        </button>
        <button type="button" onClick={onRevealVault}>
          {t('settings.openFolder')}
        </button>
      </div>

      <p className="modal__hint">{t('settings.hint')}</p>
    </Modal>
  );
}
