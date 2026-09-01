import { useEffect, useState } from 'react';
import type { OrphanedAsset } from '../../shared/types';
import { assetUrl } from '../editor/assets';
import { useLanguage } from '../i18n';
import { Modal } from './Modal';

interface Props {
  campaignId: string;
  assets: OrphanedAsset[] | null;
  onDelete: (names: string[]) => void;
  onClose: () => void;
}

/** Groesse in einer Einheit, die man beim Aufräumen tatsächlich lesen will. */
function formatBytes(bytes: number, language: string): string {
  const units = ['B', 'kB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit === 0 || value >= 100 ? 0 : 1;
  return `${value.toLocaleString(language, { maximumFractionDigits: digits })} ${units[unit]}`;
}

/**
 * Zeigt Bilddateien, auf die nichts mehr verweist, mit Vorschau. Nichts wird
 * automatisch geloescht: welches Bild weg darf, entscheidet die Nutzerin.
 */
export function CleanupDialog({ campaignId, assets, onDelete, onClose }: Props) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set(assets?.map((asset) => asset.name) ?? []));
  }, [assets]);

  const total = (assets ?? []).reduce((sum, asset) => sum + asset.bytes, 0);
  const allSelected = Boolean(assets?.length) && selected.size === assets?.length;

  function toggle(name: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <Modal
      title={t('cleanup.title')}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}>
            {t('dialog.close')}
          </button>
          <button
            type="button"
            className="danger"
            disabled={selected.size === 0}
            onClick={() => onDelete([...selected])}
          >
            {t('cleanup.delete')}
          </button>
        </>
      }
    >
      {assets === null ? (
        <p className="panel__empty">{t('app.loading')}</p>
      ) : assets.length === 0 ? (
        <p className="panel__empty">{t('cleanup.none')}</p>
      ) : (
        <>
          <p className="panel__hint">
            {assets.length === 1
              ? t('cleanup.foundOne', { size: formatBytes(total, language) })
              : t('cleanup.found', { count: assets.length, size: formatBytes(total, language) })}
          </p>

          <button
            type="button"
            className="link-button"
            onClick={() => setSelected(allSelected ? new Set() : new Set(assets.map((asset) => asset.name)))}
          >
            {allSelected ? t('cleanup.deselectAll') : t('cleanup.selectAll')}
          </button>

          <ul className="cleanup">
            {assets.map((asset) => (
              <li key={asset.name}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.has(asset.name)}
                    onChange={() => toggle(asset.name)}
                  />
                  <img src={assetUrl(campaignId, `assets/${asset.name}`)} alt="" />
                  <span className="cleanup__meta">{formatBytes(asset.bytes, language)}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="modal__hint">{t('cleanup.hint')}</p>
    </Modal>
  );
}
