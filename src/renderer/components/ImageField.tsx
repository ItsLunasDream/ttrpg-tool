import { assetUrl } from '../editor/assets';
import { useT } from '../i18n';

interface Props {
  campaignId: string;
  /** Relativer Verweis wie assets/x.png, leer wenn kein Bild gesetzt ist. */
  value: string;
  onChange: (value: string) => void;
  onPickImage: () => Promise<string | null>;
  onImportImage: (file: File) => Promise<string | null>;
}

/**
 * Bildfeld im Steckbrief, etwa fuer ein Portrait. Bilder werden in die
 * Kampagne kopiert, im Feld steht nur der relative Verweis.
 */
export function ImageField({ campaignId, value, onChange, onPickImage, onImportImage }: Props) {
  const t = useT();

  async function choose() {
    const relativePath = await onPickImage();
    if (relativePath) onChange(relativePath);
  }

  async function drop(event: React.DragEvent) {
    event.preventDefault();
    const file = [...event.dataTransfer.files].find((entry) => entry.type.startsWith('image/'));
    if (!file) return;
    const relativePath = await onImportImage(file);
    if (relativePath) onChange(relativePath);
  }

  return (
    <div className="image-field" onDragOver={(event) => event.preventDefault()} onDrop={(event) => void drop(event)}>
      {value ? (
        <img className="image-field__preview" src={assetUrl(campaignId, value)} alt={t('image.alt')} />
      ) : (
        <p className="image-field__empty">{t('image.dropHint')}</p>
      )}

      <div className="image-field__actions">
        <button type="button" onClick={() => void choose()}>
          {t('image.choose')}
        </button>
        {value ? (
          <button type="button" className="danger" onClick={() => onChange('')}>
            {t('image.remove')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
