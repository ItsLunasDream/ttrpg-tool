import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { useT } from '../i18n';

interface Props {
  title: string;
  label: string;
  initialValue?: string;
  confirmLabel?: string;
  /** Zusaetzliche Felder oberhalb der Texteingabe. */
  children?: ReactNode;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export function PromptDialog({ title, label, initialValue = '', confirmLabel, children, onConfirm, onClose }: Props) {
  const t = useT();
  const [value, setValue] = useState(initialValue);

  function submit() {
    if (!value.trim()) return;
    onConfirm(value.trim());
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}>
            {t('dialog.cancel')}
          </button>
          <button type="button" className="primary" onClick={submit} disabled={!value.trim()}>
            {confirmLabel ?? t('dialog.ok')}
          </button>
        </>
      }
    >
      {children}
      <label className="field">
        <span className="field__label">{label}</span>
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
        />
      </label>
    </Modal>
  );
}
