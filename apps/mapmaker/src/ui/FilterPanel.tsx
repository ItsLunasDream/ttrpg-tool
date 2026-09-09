/**
 * Filter-Panel: Vorlagen und Regler, wahlweise für die ganze Karte oder den
 * aktiven Layer.
 *
 * Die Umschaltung sitzt oben im Panel statt in zwei getrennten Abschnitten —
 * die Regler sind dieselben, und zwei Sätze nebeneinander würden vor allem
 * verwirren, welcher gerade wirkt.
 */

import { useState } from 'react';
import { SetFilters } from '@/model/commands';
import { useEditor } from '@/model/store';
import {
  FILTER_PRESETS,
  defaultFilters,
  isNeutral,
  presetFilters,
  type FilterPresetId,
  type FilterSettings,
} from '@/model/filters';
import { isSystemLayer } from '@/model/types';
import { useT } from '@/i18n/useT';
import type { StringKey } from '@/i18n';
import { ColorField, Row, Section, Select, Slider, Toggle } from './controls';

type Ziel = 'map' | 'layer';

export function FilterPanel() {
  const { t } = useT();
  const doc = useEditor((s) => s.doc);
  const rev = useEditor((s) => s.rev);
  const exec = useEditor((s) => s.exec);
  const activeLayerId = useEditor((s) => s.activeLayerId);
  const [ziel, setZiel] = useState<Ziel>('map');
  void rev;

  const layer = doc.layers[activeLayerId];
  const layerMoeglich = !!layer && !isSystemLayer(layer.id) && !layer.isGroup;
  const wirkendesZiel: Ziel = ziel === 'layer' && !layerMoeglich ? 'map' : ziel;

  const aktuell: FilterSettings =
    (wirkendesZiel === 'map' ? doc.filters : layer?.filters) ?? defaultFilters();

  const setzen = (naechste: FilterSettings | null, mergeKey?: string) => {
    exec(
      new SetFilters(
        wirkendesZiel === 'map' ? null : activeLayerId,
        naechste,
        t('cmd.filters'),
        mergeKey,
      ),
    );
  };

  const patch = (teil: Partial<FilterSettings>, mergeKey?: string) => {
    setzen({ ...aktuell, ...teil }, mergeKey);
  };

  return (
    <Section title={t('filterFx.title')} defaultOpen={false}>
      <Select<Ziel>
        label={t('filterFx.target')}
        value={wirkendesZiel}
        options={[
          { value: 'map', label: t('filterFx.targetMap') },
          {
            value: 'layer',
            label: layerMoeglich
              ? t('filterFx.targetLayer', { name: layer.name })
              : t('filterFx.targetLayerNone'),
          },
        ]}
        onChange={(v) => setZiel(v)}
      />

      <Row label={t('filterFx.preset')}>
        <div className="chips">
          {FILTER_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setzen(p.id === 'none' ? null : presetFilters(p.id as FilterPresetId))}
            >
              {t(p.nameKey as StringKey)}
            </button>
          ))}
        </div>
      </Row>

      <div className="divider" />

      <Slider
        label={t('filterFx.brightness')}
        min={0.2} max={2} step={0.01}
        value={aktuell.brightness}
        onChange={(v) => patch({ brightness: v }, 'fx-b')}
        format={prozent}
      />
      <Slider
        label={t('filterFx.contrast')}
        min={0} max={2} step={0.01}
        value={aktuell.contrast}
        onChange={(v) => patch({ contrast: v }, 'fx-c')}
        format={prozent}
      />
      <Slider
        label={t('filterFx.saturation')}
        min={0} max={2} step={0.01}
        value={aktuell.saturation}
        onChange={(v) => patch({ saturation: v }, 'fx-s')}
        format={prozent}
      />
      <Slider
        label={t('filterFx.hue')}
        min={-180} max={180} step={1}
        value={aktuell.hue}
        onChange={(v) => patch({ hue: v }, 'fx-h')}
        format={(v) => `${Math.round(v)}°`}
      />

      <div className="divider" />

      <Toggle
        label={t('filterFx.useTint')}
        checked={aktuell.tint !== null}
        onChange={(v) => patch({ tint: v ? 0xffb457 : null, tintAmount: v ? 0.35 : 0 })}
      />
      {aktuell.tint !== null ? (
        <>
          <ColorField
            label={t('filterFx.tint')}
            value={aktuell.tint}
            onChange={(v) => patch({ tint: v }, 'fx-t')}
          />
          <Slider
            label={t('filterFx.tintAmount')}
            min={0} max={1} step={0.01}
            value={aktuell.tintAmount}
            onChange={(v) => patch({ tintAmount: v }, 'fx-ta')}
            format={prozent}
          />
        </>
      ) : null}

      <div className="divider" />

      <Slider
        label={t('filterFx.blur')}
        min={0} max={12} step={0.5}
        value={aktuell.blur}
        onChange={(v) => patch({ blur: v }, 'fx-bl')}
        format={(v) => (v === 0 ? t('filterFx.off') : `${v} px`)}
      />
      <Slider
        label={t('filterFx.grain')}
        min={0} max={1} step={0.01}
        value={aktuell.grain}
        onChange={(v) => patch({ grain: v }, 'fx-g')}
        format={(v) => (v === 0 ? t('filterFx.off') : prozent(v))}
      />
      {wirkendesZiel === 'map' ? (
        <Slider
          label={t('filterFx.vignette')}
          min={0} max={1} step={0.01}
          value={aktuell.vignette}
          onChange={(v) => patch({ vignette: v }, 'fx-v')}
          format={(v) => (v === 0 ? t('filterFx.off') : prozent(v))}
        />
      ) : null}

      {!isNeutral(aktuell) ? (
        <button onClick={() => setzen(null)}>{t('filterFx.clear')}</button>
      ) : null}
      <p className="hint">{t('filterFx.hint')}</p>
    </Section>
  );
}

const prozent = (v: number) => `${Math.round(v * 100)}%`;
