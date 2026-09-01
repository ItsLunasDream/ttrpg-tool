import type { AppSettings } from '../../shared/types';
import { Modal } from './Modal';

interface Props {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onChooseVaultRoot: () => void;
  onRevealVault: () => void;
  onClose: () => void;
}

export function SettingsDialog({ settings, onChange, onChooseVaultRoot, onRevealVault, onClose }: Props) {
  return (
    <Modal title="Einstellungen" onClose={onClose}>
      <label className="field field--inline">
        <input
          type="checkbox"
          checked={settings.autosaveEnabled}
          onChange={(event) => onChange({ autosaveEnabled: event.target.checked })}
        />
        <span>Autosave aktiv</span>
      </label>

      <label className="field">
        <span className="field__label">Verzögerung bis zum Autosave (ms)</span>
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

      <label className="field">
        <span className="field__label">Speicherort</span>
        <code className="field__path">{settings.vaultRoot}</code>
      </label>

      <div className="modal__actions">
        <button type="button" onClick={onChooseVaultRoot}>
          Anderen Ordner wählen …
        </button>
        <button type="button" onClick={onRevealVault}>
          Ordner öffnen
        </button>
      </div>

      <p className="modal__hint">
        Kampagnen und Notizen liegen als Markdown-Dateien mit YAML-Frontmatter im Speicherort. Du kannst sie jederzeit mit
        einem Texteditor oder Obsidian öffnen.
      </p>
    </Modal>
  );
}
