/**
 * Ebenen-Vorlagen: einen Stapel sichern und wiederverwenden.
 *
 * Zwei Wege, weil es zwei Lagen gibt. Auf einer *frischen* Karte ersetzt die
 * Vorlage die vier Standardebenen — sonst bliebe genau die Aufräumarbeit übrig,
 * die sie abnehmen soll; dieser Weg steht im Datei-Menü unter „Neu mit
 * Vorlage". Auf einer Karte, an der schon gearbeitet wurde, werden die Ebenen
 * *hinzugefügt* und nichts angetastet — als ein Rückgängig-Schritt.
 */

import { useEffect, useState } from 'react';
import {
  addLayerTemplate,
  allLayerTemplates,
  onLayerTemplatesChange,
  removeLayerTemplate,
  renameLayerTemplate,
} from '@/assets/layerTemplateStore';
import { AddLayer, CompositeCommand } from '@/model/commands';
import {
  firstObjectLayer,
  layersFromTemplate,
  templateFromDocument,
  type LayerTemplate,
} from '@/model/layerTemplates';
import { useEditor } from '@/model/store';
import { useT } from '@/i18n/useT';
import { Section } from './controls';

export function LayerTemplates() {
  const { t } = useT();
  const [rev, setRev] = useState(0);
  const [name, setName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);

  const doc = useEditor((s) => s.doc);
  const docRev = useEditor((s) => s.rev);
  const exec = useEditor((s) => s.exec);
  const setActiveLayer = useEditor((s) => s.setActiveLayer);
  const setStatus = useEditor((s) => s.setStatusMessage);

  useEffect(() => onLayerTemplatesChange(() => setRev((r) => r + 1)), []);
  void rev;
  void docRev;

  const templates = allLayerTemplates();

  const save = () => {
    const template = templateFromDocument(name.trim() || t('layerTpl.title'), doc);
    if (template.layers.length === 0) {
      setStatus(t('layerTpl.needLayers'));
      return;
    }
    // Wie bei den Bausteinen: nicht gesichert heißt nicht abgelehnt.
    const gesichert = addLayerTemplate(template);
    setName('');
    if (!gesichert) {
      setStatus(t('layerTpl.storageFull', { name: template.name }));
      return;
    }
    setStatus(
      template.layers.length === 1
        ? t('layerTpl.savedOne', { name: template.name })
        : t('layerTpl.saved', { name: template.name, n: template.layers.length }),
    );
  };

  /** Vorlage an die vorhandene Karte anhängen — ein Rückgängig-Schritt. */
  const apply = (template: LayerTemplate) => {
    const gebaut = layersFromTemplate(template);
    if (gebaut.layers.length === 0) return;
    // Eltern vor Kindern: AddLayer trägt jedes Kind in die Kinderliste seiner
    // Gruppe ein, und die muss dafür schon stehen.
    const befehle = gebaut.layers.map((layer) => new AddLayer(layer));
    exec(new CompositeCommand(befehle, t('cmd.applyLayerTemplate')));

    const erste = firstObjectLayer(gebaut);
    if (erste) setActiveLayer(erste);
    setStatus(t('layerTpl.applied', { name: template.name, n: gebaut.layers.length }));
  };

  return (
    <Section title={t('layerTpl.title')} defaultOpen={false}>
      <div className="row-inline">
        <input
          value={name}
          placeholder={t('layerTpl.namePlaceholder')}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
          }}
        />
        <button onClick={save}>{t('layerTpl.save')}</button>
      </div>

      {templates.length === 0 ? (
        <p className="hint">{t('layerTpl.empty')}</p>
      ) : (
        <ul className="stamp-list">
          {templates.map((tpl) => (
            <li key={tpl.id}>
              {renaming === tpl.id ? (
                <input
                  autoFocus
                  defaultValue={tpl.name}
                  onBlur={(e) => {
                    renameLayerTemplate(tpl.id, e.target.value.trim() || tpl.name);
                    setRenaming(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') setRenaming(null);
                  }}
                />
              ) : (
                <button
                  className="stamp-pick"
                  title={t('layerTpl.applyHint')}
                  onClick={() => apply(tpl)}
                >
                  <span className="stamp-name">{tpl.name}</span>
                  <span className="value">
                    {tpl.layers.length === 1
                      ? t('layerTpl.countOne')
                      : t('layerTpl.count', { n: tpl.layers.length })}
                  </span>
                </button>
              )}
              <button
                className="ghost icon"
                title={t('layerTpl.rename')}
                onClick={() => setRenaming(tpl.id)}
              >
                ✎
              </button>
              <button
                className="ghost icon"
                title={t('layerTpl.delete')}
                onClick={() => {
                  if (!window.confirm(t('layerTpl.confirmDelete', { name: tpl.name }))) return;
                  removeLayerTemplate(tpl.id);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {templates.length > 0 ? <p className="hint">{t('layerTpl.hint')}</p> : null}
    </Section>
  );
}
