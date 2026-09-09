/**
 * Bausteine: Auswahl sichern, benennen, wiederverwenden.
 *
 * Steht bei der Prop-Palette und nicht bei den Werkzeugeinstellungen: ein
 * Baustein ist Material, kein Regler. Wer ihn anklickt, will ihn setzen —
 * darum schaltet die Auswahl gleich aufs Werkzeug um, genau wie bei den Props.
 */

import { useEffect, useState } from 'react';
import {
  addStamp,
  allStamps,
  onStampsChange,
  removeStamp,
  renameStamp,
} from '@/assets/stampStore';
import { createStamp } from '@/model/stamps';
import { useEditor } from '@/model/store';
import { useT } from '@/i18n/useT';
import { Section, Slider } from './controls';

export function StampLibrary() {
  const { t } = useT();
  const [rev, setRev] = useState(0);
  const [name, setName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);

  const doc = useEditor((s) => s.doc);
  const selection = useEditor((s) => s.selection);
  const tool = useEditor((s) => s.tool);
  const setTool = useEditor((s) => s.setTool);
  const activeStampId = useEditor((s) => s.activeStampId);
  const setActiveStamp = useEditor((s) => s.setActiveStamp);
  const setStatus = useEditor((s) => s.setStatusMessage);
  const stampSettings = useEditor((s) => s.stamp);
  const patchStamp = useEditor((s) => s.patchStamp);

  useEffect(() => onStampsChange(() => setRev((r) => r + 1)), []);
  void rev;

  const stamps = allStamps();

  const save = () => {
    if (selection.length === 0) {
      setStatus(t('stamp.needSelection'));
      return;
    }
    const objects = selection.map((id) => doc.objects[id]).filter(Boolean);
    if (objects.length === 0) {
      setStatus(t('stamp.needSelection'));
      return;
    }
    const stamp = createStamp(
      name.trim() || t('stamp.title'),
      objects,
      doc.grid.tileSize,
    );
    // Falsch heißt hier nicht „abgelehnt": der Baustein ist da, nur nicht
    // dauerhaft. Er ist trotzdem benutzbar, und das gehört gesagt statt
    // verschwiegen.
    const gesichert = addStamp(stamp);
    setName('');
    setActiveStamp(stamp.id);
    if (!gesichert) {
      setStatus(t('stamp.storageFull', { name: stamp.name }));
      return;
    }
    setStatus(
      objects.length === 1
        ? t('stamp.savedOne', { name: stamp.name })
        : t('stamp.saved', { name: stamp.name, n: objects.length }),
    );
  };

  const pick = (id: string) => {
    setActiveStamp(id);
    // Einen Baustein zu wählen heißt, ihn setzen zu wollen.
    if (tool !== 'stamp') setTool('stamp');
  };

  /** Maße in Feldern der Ursprungskarte — Weltpixel sagen niemandem etwas. */
  const felder = (wert: number, tileSize: number) =>
    Math.max(1, Math.round(wert / Math.max(1, tileSize)));

  return (
    <Section title={t('stamp.title')}>
      <div className="row-inline">
        <input
          value={name}
          placeholder={t('stamp.namePlaceholder')}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
          }}
        />
        <button onClick={save} disabled={selection.length === 0}>
          {t('stamp.save')}
        </button>
      </div>

      {stamps.length === 0 ? (
        <p className="hint">{t('stamp.empty')}</p>
      ) : (
        <ul className="stamp-list">
          {stamps.map((s) => (
            <li key={s.id} className={s.id === activeStampId ? 'active' : ''}>
              {renaming === s.id ? (
                <input
                  autoFocus
                  defaultValue={s.name}
                  onBlur={(e) => {
                    renameStamp(s.id, e.target.value.trim() || s.name);
                    setRenaming(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') setRenaming(null);
                  }}
                />
              ) : (
                <button className="stamp-pick" onClick={() => pick(s.id)}>
                  <span className="stamp-name">{s.name}</span>
                  <span className="value">
                    {s.objects.length === 1
                      ? t('stamp.objectsOne', {
                          w: felder(s.width, s.tileSize),
                          h: felder(s.height, s.tileSize),
                        })
                      : t('stamp.objects', {
                          n: s.objects.length,
                          w: felder(s.width, s.tileSize),
                          h: felder(s.height, s.tileSize),
                        })}
                  </span>
                </button>
              )}
              <button
                className="ghost icon"
                title={t('stamp.rename')}
                onClick={() => setRenaming(s.id)}
              >
                ✎
              </button>
              <button
                className="ghost icon"
                title={t('stamp.delete')}
                onClick={() => {
                  if (!window.confirm(t('stamp.confirmDelete', { name: s.name }))) return;
                  removeStamp(s.id);
                  if (activeStampId === s.id) setActiveStamp(null);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {stamps.length > 0 ? (
        <>
          <Slider
            label={t('stamp.rotation')}
            min={0}
            max={345}
            step={15}
            value={stampSettings.rotation}
            onChange={(v) => patchStamp({ rotation: v })}
            format={(v) => `${v}°`}
          />
          <p className="hint">{t('stamp.hint')}</p>
        </>
      ) : null}
    </Section>
  );
}
