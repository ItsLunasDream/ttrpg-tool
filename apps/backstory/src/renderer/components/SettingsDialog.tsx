import { useState } from 'react';
import type { AiProviderId, AppSettings } from '../../shared/types';
import { LANGUAGES } from '../../shared/i18n';
import { Modal } from './Modal';
import { useT } from '../i18n';

interface Props {
  settings: AppSettings;
  /** Ob bereits ein API-Schluessel hinterlegt ist. Der Schluessel selbst nie. */
  hasApiKey: boolean;
  /**
   * Ob eine Huelle die KI fuehrt. Dann wird hier nichts eingestellt, sondern
   * nur gesagt, wo es steht — zwei Stellen fuer dieselbe Sache waeren eine zu
   * viel, und wer in der falschen einstellt, sucht den Fehler lange.
   */
  kiVonHuelle: boolean;
  onSaveApiKey: (apiKey: string) => void;
  onChange: (patch: Partial<AppSettings>) => void;
  onChooseVaultRoot: () => void;
  onRevealVault: () => void;
  onClose: () => void;
}

export function SettingsDialog({
  settings,
  hasApiKey,
  kiVonHuelle,
  onSaveApiKey,
  onChange,
  onChooseVaultRoot,
  onRevealVault,
  onClose
}: Props) {
  const t = useT();
  const [apiKey, setApiKey] = useState('');

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

      <h4 className="type-editor__heading">{t('settings.ai')}</h4>

      {kiVonHuelle ? (
        <p className="modal__hint">{t('settings.aiManagedByShell')}</p>
      ) : (
        <>
      <label className="field">
        <span className="field__label">{t('settings.aiProvider')}</span>
        <select
          value={settings.aiProvider}
          onChange={(event) => onChange({ aiProvider: event.target.value as AiProviderId })}
        >
          <option value="none">{t('settings.aiNone')}</option>
          <option value="ollama">{t('settings.aiOllama')}</option>
          <option value="claude">{t('settings.aiClaude')}</option>
        </select>
      </label>

      {settings.aiProvider === 'ollama' ? (
        <>
          <label className="field">
            <span className="field__label">{t('settings.ollamaUrl')}</span>
            <input value={settings.ollamaBaseUrl} onChange={(event) => onChange({ ollamaBaseUrl: event.target.value })} />
          </label>
          <label className="field">
            <span className="field__label">{t('settings.ollamaModel')}</span>
            <input value={settings.ollamaModel} onChange={(event) => onChange({ ollamaModel: event.target.value })} />
          </label>
        </>
      ) : null}

      {settings.aiProvider === 'claude' ? (
        <>
          <label className="field">
            <span className="field__label">{t('settings.claudeModel')}</span>
            <input value={settings.claudeModel} onChange={(event) => onChange({ claudeModel: event.target.value })} />
          </label>

          <label className="field">
            <span className="field__label">{t('settings.apiKey')}</span>
            {hasApiKey ? <span className="field__label">{t('settings.apiKeySet')}</span> : null}
            <input
              type="password"
              value={apiKey}
              placeholder={t('settings.apiKeyPlaceholder')}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>

          <div className="modal__actions">
            <button
              type="button"
              disabled={!apiKey.trim()}
              onClick={() => {
                onSaveApiKey(apiKey.trim());
                setApiKey('');
              }}
            >
              {t('settings.apiKeySave')}
            </button>
            {hasApiKey ? (
              <button type="button" className="danger" onClick={() => onSaveApiKey('')}>
                {t('settings.apiKeyClear')}
              </button>
            ) : null}
          </div>

          <p className="modal__hint">{t('settings.apiKeyHint')}</p>
        </>
      ) : null}
        </>
      )}

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
