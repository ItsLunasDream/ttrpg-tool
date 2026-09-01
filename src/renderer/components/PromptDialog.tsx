import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';

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

export function PromptDialog({ title, label, initialValue = '', confirmLabel = 'OK', children, onConfirm, onClose }: Props) {
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
            Abbrechen
          </button>
          <button type="button" className="primary" onClick={submit} disabled={!value.trim()}>
            {confirmLabel}
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
