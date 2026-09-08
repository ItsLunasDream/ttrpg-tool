import { Modal } from './Modal';
import { useT } from '../i18n';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: Props) {
  const t = useT();

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}>
            {t('dialog.cancel')}
          </button>
          <button type="button" className="danger" onClick={onConfirm}>
            {confirmLabel ?? t('dialog.delete')}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
