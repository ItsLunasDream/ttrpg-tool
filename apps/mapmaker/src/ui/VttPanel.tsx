/** Panel für Wände, Türen und Lichter — die Ebene, die nach Foundry wandert. */

import { useState } from 'react';
import {
  AddObjects,
  AddVttItems,
  CompositeCommand,
  PatchVttEnvironment,
  PatchVttItems,
  RemoveVttItems,
  SetHeightMap,
} from '@/model/commands';
import { canHoldObjects, makeHeightMap } from '@/model/document';
import {
  buildLegendObjects,
  collectLegendEntries,
  legendKey,
  resolveLegendEntries,
} from '@/model/legend';
import { allProps, getProp, propName } from '@/assets/library';
import { getRenderer } from '@/engine/instance';
import { mergeWalls } from '@/model/wallMerge';
import { useEditor } from '@/model/store';
import {
  defaultDeriveOptions,
  deriveWalls,
  describeDerivation,
  type DeriveOptions,
} from '@/model/deriveWalls';
import { WALL_STYLES, type WallStyleId } from '@/assets/wallStyles';
import type { SelectFilter } from '@/model/toolSettings';
import { BIOMES, NOTE_ICONS } from '@/model/types';
import type { NoteIcon, WallSenses, WallType } from '@/model/types';
import { PRESET_SENSES, WALL_SENSES, blocksAnything } from '@/model/wallSenses';
import type { HeightMode } from '@/model/toolSettings';
import { useT } from '@/i18n/useT';
import type { StringKey } from '@/i18n';
import { ColorField, Row, Section, Select, Slider, Toggle } from './controls';

export function WallSettingsPanel() {
  const { t } = useT();
  const wall = useEditor((s) => s.wall);
  const patch = useEditor((s) => s.patchWall);
  const doc = useEditor((s) => s.doc);
  const exec = useEditor((s) => s.exec);
  const setStatus = useEditor((s) => s.setStatusMessage);
  const [derive, setDerive] = useState<DeriveOptions>(() => defaultDeriveOptions(doc));

  const run = () => {
    const walls = deriveWalls(doc, derive);
    if (walls.length > 0) exec(new AddVttItems('walls', walls, t('wall.deriveButton')));
    setStatus(describeDerivation(walls));
  };

  return (
    <Section title={t('wall.title')}>
      <Select<WallType>
        label={t('wall.type')}
        value={wall.type}
        options={[
          { value: 'normal', label: t('wall.normal') },
          { value: 'window', label: t('wall.window') },
          { value: 'ethereal', label: t('wall.ethereal') },
          { value: 'invisible', label: t('wall.invisible') },
        ]}
        onChange={(v) => patch({ type: v })}
      />
      <p className="hint">{t('wall.hint')}</p>

      <WallSensesEditor
        type={wall.type}
        senses={wall.senses}
        onChange={(v) => patch({ senses: v })}
      />

      <Select<WallStyleId>
        label={t('wallStyle.label')}
        value={wall.style}
        options={[
          { value: 'none', label: t('wallStyle.none') },
          ...WALL_STYLES.map((st) => ({ value: st.id, label: t(st.nameKey as StringKey) })),
        ]}
        onChange={(v) => patch({ style: v })}
      />
      <p className="hint">{t('wallStyle.hint')}</p>

      <div className="divider" />

      <strong className="sub">{t('wall.derive')}</strong>
      <Toggle
        label={t('wall.filledOnly')}
        checked={derive.filledOnly}
        onChange={(v) => setDerive({ ...derive, filledOnly: v })}
      />
      <Slider
        label={t('wall.tolerance')}
        min={0}
        max={doc.grid.tileSize * 0.5}
        step={1}
        value={derive.tolerance}
        onChange={(v) => setDerive({ ...derive, tolerance: v })}
        format={(v) => (v === 0 ? t('wall.toleranceExact') : `${Math.round(v)} px`)}
      />
      <button onClick={run}>{t('wall.deriveButton')}</button>
      <p className="hint">{t('wall.deriveHint')}</p>
    </Section>
  );
}

/**
 * Die vier Sperren als Kästchenreihe.
 *
 * Ausgeschaltet zeigt sie, was der Typ vorgibt — sichtbar, aber nicht
 * anfassbar. Erst der Haken bei „Eigene Sperren" macht sie zur Einstellung.
 * Ohne die Vorschau müsste man raten, was „Fenster" eigentlich bedeutet.
 */
export function WallSensesEditor({
  type,
  senses,
  onChange,
}: {
  type: WallType;
  senses: WallSenses | null;
  onChange: (next: WallSenses | null) => void;
}) {
  const { t } = useT();
  const wirksam = senses ?? PRESET_SENSES[type];
  const label: Record<keyof WallSenses, string> = {
    move: t('wall.move'),
    sight: t('wall.sight'),
    light: t('wall.light'),
    sound: t('wall.sound'),
  };

  return (
    <>
      <Toggle
        label={t('wall.senses')}
        checked={senses !== null}
        onChange={(v) => onChange(v ? { ...wirksam } : null)}
      />
      <div className="row-inline senses">
        {WALL_SENSES.map((k) => (
          <label key={k} className={senses ? '' : 'muted'}>
            <input
              type="checkbox"
              checked={wirksam[k]}
              disabled={senses === null}
              onChange={(e) => onChange({ ...wirksam, [k]: e.target.checked })}
            />
            {label[k]}
          </label>
        ))}
      </div>
      {senses && !blocksAnything({ type, senses }) ? (
        <p className="warn">{t('wall.sensesNothing')}</p>
      ) : null}
      <p className="hint">{t('wall.sensesHint')}</p>
    </>
  );
}

export function RoomSettingsPanel() {
  const { t } = useT();
  const room = useEditor((s) => s.room);
  const patch = useEditor((s) => s.patchRoom);

  return (
    <Section title={t('room.title')}>
      <Toggle
        label={t('room.walls')}
        checked={room.createWalls}
        onChange={(v) => patch({ createWalls: v })}
      />
      {room.createWalls ? (
        <Select<WallType>
          label={t('wall.type')}
          value={room.wallType}
          options={[
            { value: 'normal', label: t('wall.normal') },
            { value: 'window', label: t('wall.window') },
            { value: 'ethereal', label: t('wall.ethereal') },
            { value: 'invisible', label: t('wall.invisible') },
          ]}
          onChange={(v) => patch({ wallType: v })}
        />
      ) : null}
      {room.createWalls ? (
        <Select<WallStyleId>
          label={t('wallStyle.label')}
          value={room.style}
          options={[
            { value: 'none', label: t('wallStyle.none') },
            ...WALL_STYLES.map((st) => ({ value: st.id, label: t(st.nameKey as StringKey) })),
          ]}
          onChange={(v) => patch({ style: v })}
        />
      ) : null}
      <Toggle
        label={t('room.floor')}
        checked={room.createFloor}
        onChange={(v) => patch({ createFloor: v })}
      />
      {room.createFloor ? (
        <ColorField
          label={t('room.floorColor')}
          value={room.floorColor}
          onChange={(v) => patch({ floorColor: v })}
        />
      ) : null}
      <p className="hint">{t('room.hint')}</p>
    </Section>
  );
}

/**
 * Einstellungen für Tür und Fenster. Welche Art gesetzt wird, sagt das
 * gewählte Werkzeug — hier steht nur noch, was für beide gilt.
 */
export function OpeningSettingsPanel({ kind }: { kind: 'door' | 'window' }) {
  const { t } = useT();
  const opening = useEditor((s) => s.opening);
  const patch = useEditor((s) => s.patchOpening);

  return (
    <Section title={kind === 'door' ? t('opening.doorTitle') : t('opening.windowTitle')}>
      <Toggle
        label={t('opening.snap')}
        checked={opening.snapToWalls}
        onChange={(v) => patch({ snapToWalls: v })}
      />
      <Select<WallStyleId>
        label={t('wallStyle.label')}
        value={opening.style}
        options={[
          { value: 'none', label: t('wallStyle.none') },
          ...WALL_STYLES.map((st) => ({ value: st.id, label: t(st.nameKey as StringKey) })),
        ]}
        onChange={(v) => patch({ style: v })}
      />
      <p className="hint">{t('wallStyle.hint')}</p>
      <p className="hint">{t('opening.hint')}</p>
      <p className="hint">{kind === 'door' ? t('opening.doorHint') : t('opening.windowHint')}</p>
    </Section>
  );
}

export function LightSettingsPanel() {
  const { t } = useT();
  const light = useEditor((s) => s.light);
  const patch = useEditor((s) => s.patchLight);

  return (
    <Section title={t('light.title')}>
      <Slider
        label={t('light.range')}
        min={0.5}
        max={30}
        step={0.5}
        value={light.range}
        onChange={(v) => patch({ range: v })}
        format={(v) => (v === 1 ? t('light.rangeUnitOne') : t('light.rangeUnit', { n: v }))}
      />
      <ColorField label={t('light.color')} value={light.color} onChange={(v) => patch({ color: v })} />
      <Slider
        label={t('light.intensity')}
        min={0}
        max={4}
        step={0.05}
        value={light.intensity}
        onChange={(v) => patch({ intensity: v })}
      />
      <Slider
        label={t('light.opacity')}
        min={0}
        max={1}
        step={0.01}
        value={light.alpha}
        onChange={(v) => patch({ alpha: v })}
        format={(v) => `${Math.round(v * 100)}%`}
      />
      <Toggle
        label={t('light.shadows')}
        checked={light.shadows}
        onChange={(v) => patch({ shadows: v })}
      />
      <p className="hint">{t('light.hint')}</p>
    </Section>
  );
}

/**
 * Notiz-Werkzeug: die Vorgaben für den nächsten Pin.
 *
 * Der Text selbst steht nicht hier, sondern im Dialog — er gehört zur einzelnen
 * Notiz, nicht zum Werkzeug.
 */
export function NoteSettingsPanel() {
  const { t } = useT();
  const note = useEditor((s) => s.note);
  const patch = useEditor((s) => s.patchNote);

  return (
    <Section title={t('note.title')}>
      <Select<NoteIcon>
        label={t('note.icon')}
        value={note.icon}
        options={NOTE_ICONS.map((icon) => ({ value: icon, label: t(noteIconKey(icon)) }))}
        onChange={(v) => patch({ icon: v })}
      />
      <Slider
        label={t('note.size')}
        min={0.4}
        max={4}
        step={0.1}
        value={note.size}
        onChange={(v) => patch({ size: v })}
      />
      <ColorField label={t('note.color')} value={note.color} onChange={(v) => patch({ color: v })} />
      <Toggle
        label={t('note.playerVisible')}
        checked={note.playerVisible}
        onChange={(v) => patch({ playerVisible: v })}
      />
      <p className="hint">{t('note.hint')}</p>
    </Section>
  );
}

/** Übersetzungsschlüssel für ein Notizsymbol. */
export function noteIconKey(icon: NoteIcon): StringKey {
  const gross = icon.charAt(0).toUpperCase() + icon.slice(1);
  return `note.icon${gross}` as StringKey;
}

/**
 * Legende: eine Tafel aus dem, was auf der Karte steht.
 *
 * Sie wird *erzeugt* und nicht laufend nachgeführt. Wer eine Zeile von Hand
 * ändert oder verschiebt, soll sie nicht beim nächsten Pinselstrich verlieren;
 * wer die Karte weitergebaut hat, legt eben eine neue an.
 */
export function LegendPanel() {
  const { t } = useT();
  const doc = useEditor((s) => s.doc);
  const rev = useEditor((s) => s.rev);
  const exec = useEditor((s) => s.exec);
  const activeLayerId = useEditor((s) => s.activeLayerId);
  const setSelection = useEditor((s) => s.setSelection);
  const setStatus = useEditor((s) => s.setStatusMessage);
  const legend = useEditor((s) => s.legend);
  const patchLegend = useEditor((s) => s.patchLegend);
  void rev;

  /**
   * Name und Farbe zu Art und Schlüssel — für Gefundenes wie für Handeinträge
   * dieselbe Quelle, sonst hieße dasselbe Biom oben anders als unten.
   */
  const info = (kind: 'biome' | 'prop', key: string) => {
    if (kind === 'biome') {
      const b = BIOMES[Number(key) - 1];
      return b ? { label: t(`biome.${b.id}` as StringKey), color: b.color } : null;
    }
    const def = getProp(key);
    return def ? { label: propName(def) } : null;
  };

  const gefunden = collectLegendEntries(
    doc,
    // `propName` und nicht `.name`: das rohe Feld ist der deutsche Name aus
    // der Bibliothek. In der Legende stand darum „Gebirge" auch auf Englisch.
    (propId) => {
      const def = getProp(propId);
      return def ? propName(def) : null;
    },
    (biomeId) => t(`biome.${biomeId}` as StringKey),
  );

  const eintraege = resolveLegendEntries(gefunden, legend.excluded, legend.extra, info);

  const umschalten = (k: string) =>
    patchLegend({
      excluded: legend.excluded.includes(k)
        ? legend.excluded.filter((x) => x !== k)
        : [...legend.excluded, k],
    });

  /** Was sich noch aufnehmen ließe: alles, was weder gefunden noch schon dabei ist. */
  const schonDa = new Set([...gefunden.map(legendKey), ...legend.extra.map(legendKey)]);
  const offeneBiome = BIOMES.map((_, i) => ({ kind: 'biome' as const, key: String(i + 1) })).filter(
    (e) => !schonDa.has(legendKey(e)),
  );
  const offeneProps = allProps()
    .map((p) => ({ kind: 'prop' as const, key: p.id }))
    .filter((e) => !schonDa.has(legendKey(e)));

  const aufnehmen = (kind: 'biome' | 'prop', key: string) => {
    if (!key) return;
    patchLegend({
      extra: [...legend.extra, { kind, key }],
      // Wer etwas aufnimmt, meint es — eine alte Abwahl desselben Eintrags
      // stünde sonst wortlos dagegen.
      excluded: legend.excluded.filter((x) => x !== legendKey({ kind, key })),
    });
  };

  const einfuegen = () => {
    if (eintraege.length === 0) {
      setStatus(t('legend.empty'));
      return;
    }
    const { objects } = buildLegendObjects(
      doc,
      eintraege,
      {
        layerId: activeLayerId,
        // Links oben mit etwas Abstand — von dort aus lässt sie sich ziehen.
        x: doc.grid.tileSize,
        y: doc.grid.tileSize,
        // Eine gute halbe Feldbreite je Zeile: darunter sind die
        // Kartensignaturen nicht mehr zu erkennen.
        rowHeight: doc.grid.tileSize * 0.75,
        title: t('legend.title'),
        backgroundColor: 0x1d1a15,
        backgroundAlpha: 0.82,
        borderColor: 0xd9c9a3,
        textColor: 0xeee6d2,
        fontFamily: 'Georgia, serif',
      },
      (propId) => getProp(propId)?.size ?? null,
    );
    exec(new AddObjects(objects, t('legend.insert')));
    setSelection(objects.map((o) => o.id));
  };

  return (
    <Section title={t('legend.title')} defaultOpen={false}>
      <p className="hint">{t('legend.hint')}</p>

      <p className="subhead">{t('legend.found')}</p>
      {gefunden.length === 0 ? (
        <div className="empty">{t('legend.empty')}</div>
      ) : (
        <>
          <div className="chips fill">
            <button onClick={() => patchLegend({ excluded: [] })}>{t('legend.allOn')}</button>
            <button onClick={() => patchLegend({ excluded: gefunden.map(legendKey) })}>
              {t('legend.allOff')}
            </button>
          </div>
          {gefunden.map((e) => (
            <Toggle
              key={legendKey(e)}
              label={e.label}
              checked={!legend.excluded.includes(legendKey(e))}
              onChange={() => umschalten(legendKey(e))}
            />
          ))}
          <p className="hint">{t('legend.foundHint')}</p>
        </>
      )}

      <p className="subhead">{t('legend.extra')}</p>
      {legend.extra.map((e) => {
        const i = info(e.kind, e.key);
        return (
          <Row key={legendKey(e)} label={i?.label ?? e.key}>
            <button
              onClick={() =>
                patchLegend({ extra: legend.extra.filter((x) => legendKey(x) !== legendKey(e)) })
              }
            >
              {t('legend.remove')}
            </button>
          </Row>
        );
      })}
      <Row>
        <div className="chips fill">
          <select
            value=""
            disabled={offeneProps.length === 0}
            onChange={(ev) => aufnehmen('prop', ev.target.value)}
          >
            <option value="">{t('legend.addProp')}</option>
            {offeneProps.map((e) => (
              <option key={e.key} value={e.key}>
                {info('prop', e.key)?.label ?? e.key}
              </option>
            ))}
          </select>
          <select
            value=""
            disabled={offeneBiome.length === 0}
            onChange={(ev) => aufnehmen('biome', ev.target.value)}
          >
            <option value="">{t('legend.addBiome')}</option>
            {offeneBiome.map((e) => (
              <option key={e.key} value={e.key}>
                {info('biome', e.key)?.label ?? e.key}
              </option>
            ))}
          </select>
        </div>
      </Row>
      <p className="hint">{t('legend.extraHint')}</p>

      <Row label={t('legend.entries')}>
        <span className="value">{eintraege.length}</span>
      </Row>
      <button
        className="primary"
        onClick={einfuegen}
        disabled={eintraege.length === 0 || !canHoldObjects(doc, activeLayerId)}
      >
        {t('legend.insert')}
      </button>
    </Section>
  );
}

/** Regionen: Fläche, Grenze und Name in einem Zug. */
export function RegionSettingsPanel() {
  const { t } = useT();
  const r = useEditor((s) => s.region);
  const patch = useEditor((s) => s.patchRegion);

  return (
    <Section title={t('region.title')}>
      <ColorField label={t('region.fill')} value={r.fillColor} onChange={(v) => patch({ fillColor: v })} />
      <Slider
        label={t('region.fillAlpha')}
        min={0}
        max={1}
        step={0.02}
        value={r.fillAlpha}
        onChange={(v) => patch({ fillAlpha: v })}
        format={(v) => `${Math.round(v * 100)}%`}
      />
      <ColorField label={t('region.border')} value={r.borderColor} onChange={(v) => patch({ borderColor: v })} />
      <Slider
        label={t('region.borderWidth')}
        min={0}
        max={20}
        step={0.5}
        value={r.borderWidth}
        onChange={(v) => patch({ borderWidth: v })}
      />
      <Toggle
        label={t('region.dashed')}
        checked={r.dash.length > 0}
        onChange={(v) => patch({ dash: v ? [14, 9] : [] })}
      />
      <Toggle
        label={t('region.withLabel')}
        checked={r.withLabel}
        onChange={(v) => patch({ withLabel: v })}
      />
      {r.withLabel ? (
        <>
          <Slider
            label={t('region.labelSize')}
            min={10}
            max={200}
            step={2}
            value={r.labelSize}
            onChange={(v) => patch({ labelSize: v })}
          />
          <ColorField
            label={t('region.labelColor')}
            value={r.labelColor}
            onChange={(v) => patch({ labelColor: v })}
          />
        </>
      ) : null}
      <p className="hint">{t('region.hint')}</p>
    </Section>
  );
}

/**
 * Höhen-Pinsel und die Rasterebene selbst.
 *
 * Das Anlegen der Ebene steht hier und nicht im Layer-Panel: dort geht es um
 * Reihenfolge und Sichtbarkeit, hier um das, was man mit der Ebene tut — und
 * wer den Pinsel wählt, ohne eine Rasterebene zu haben, findet den Knopf
 * genau dort, wo er ihn sucht.
 */
export function HeightSettingsPanel() {
  const { t } = useT();
  const h = useEditor((s) => s.height);
  const patch = useEditor((s) => s.patchHeight);
  const doc = useEditor((s) => s.doc);
  const rev = useEditor((s) => s.rev);
  const exec = useEditor((s) => s.exec);
  const activeLayerId = useEditor((s) => s.activeLayerId);
  void rev;

  const layer = doc.layers[activeLayerId];
  const istRaster = layer?.kind === 'height';

  const anlegen = () => {
    exec(
      new SetHeightMap(
        activeLayerId,
        makeHeightMap(doc.size.cols, doc.size.rows),
        t('height.makeLayer'),
      ),
    );
  };

  const entfernen = () => {
    // Das Höhenfeld ließe sich zwar zurückholen, aber ein Fehlklick, der eine
    // gemalte Landschaft wegräumt, erschreckt trotzdem.
    if (!window.confirm(t('height.confirmRemove'))) return;
    exec(new SetHeightMap(activeLayerId, null, t('height.removeLayer')));
  };

  return (
    <Section title={t('height.title')}>
      {!istRaster ? (
        <>
          <p className="hint">{t('height.needLayer')}</p>
          <button className="primary" onClick={anlegen} disabled={!layer || layer.isGroup}>
            {t('height.makeLayer')}
          </button>
        </>
      ) : (
        <>
          <Select<HeightMode>
            label={t('height.mode')}
            value={h.mode}
            options={[
              { value: 'raise', label: t('height.raise') },
              { value: 'lower', label: t('height.lower') },
              { value: 'smooth', label: t('height.smooth') },
              { value: 'flatten', label: t('height.flatten') },
              { value: 'biome', label: t('height.biome') },
            ]}
            onChange={(v) => patch({ mode: v })}
          />
          {h.mode === 'biome' ? (
            <>
              <Select<string>
                label={t('height.biomePick')}
                value={String(h.biome)}
                options={[
                  { value: '0', label: t('height.biomeNone') },
                  ...BIOMES.map((b, i) => ({
                    value: String(i + 1),
                    label: t(`biome.${b.id}` as StringKey),
                  })),
                ]}
                onChange={(v) => patch({ biome: Number(v) })}
              />
              <p className="hint">{t('height.biomeHint')}</p>
            </>
          ) : null}
          <Slider
            label={t('height.radius')}
            min={1}
            max={40}
            step={1}
            value={h.radius}
            onChange={(v) => patch({ radius: v })}
          />
          {h.mode !== 'biome' ? (
            <Slider
              label={t('height.strength')}
              min={0.02}
              max={1}
              step={0.02}
              value={h.strength}
              onChange={(v) => patch({ strength: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          ) : null}
          {h.mode === 'flatten' ? (
            <Slider
              label={t('height.target')}
              min={0}
              max={1}
              step={0.01}
              value={h.target}
              onChange={(v) => patch({ target: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          ) : null}
          <Slider
            label={t('height.relief')}
            min={0}
            max={2}
            step={0.1}
            value={h.relief}
            onChange={(v) => {
              patch({ relief: v });
              // Die Schattierung steckt in der Textur, nicht im Dokument —
              // ohne diesen Anstoß bliebe das Bild stehen.
              getRenderer()?.invalidateHeights();
            }}
          />
          <p className="hint">{t('height.reliefHint')}</p>
          <p className="hint">{t('height.hint')}</p>
          <div className="divider" />
          <button className="danger" onClick={entfernen}>
            {t('height.removeLayer')}
          </button>
        </>
      )}
    </Section>
  );
}

/**
 * Auswahlfilter: was das Auswahl-Werkzeug anfassen darf.
 *
 * Ohne ihn wäre die VTT-Ebene kaum zu bedienen — Wände liegen über dem Boden,
 * den man verschieben will, Lichter mitten auf den Props.
 */
export function SelectFilterPanel() {
  const { t } = useT();
  const filter = useEditor((s) => s.selectFilter);
  const patch = useEditor((s) => s.patchSelectFilter);

  const rows: Array<[keyof SelectFilter, string]> = [
    ['props', t('filter.props')],
    ['shapes', t('filter.shapes')],
    ['texts', t('filter.texts')],
    ['walls', t('filter.walls')],
    ['doors', t('filter.doors')],
    ['windows', t('filter.windows')],
    ['lights', t('filter.lights')],
    ['notes', t('filter.notes')],
  ];

  const setAll = (on: boolean) => {
    patch({
      props: on,
      shapes: on,
      texts: on,
      walls: on,
      doors: on,
      windows: on,
      lights: on,
      notes: on,
    });
  };

  const allOn = rows.every(([key]) => filter[key]);

  return (
    <Section title={t('filter.title')}>
      {rows.map(([key, label]) => (
        <Toggle
          key={key}
          label={label}
          checked={filter[key]}
          onChange={(v) => patch({ [key]: v })}
        />
      ))}
      <button onClick={() => setAll(!allOn)}>
        {allOn ? t('filter.noneButton') : t('filter.allButton')}
      </button>
      <p className="hint">{t('filter.hint')}</p>
    </Section>
  );
}

/**
 * Inspektor für ausgewählte Wände, Türen, Fenster und Lichter.
 *
 * Steht neben dem Objekt-Inspektor, weil VTT-Elemente keine Layer-Objekte sind:
 * sie haben weder Drehung noch Deckkraft noch z-Reihenfolge.
 */
export function VttSelectionInspector() {
  const { t } = useT();
  const doc = useEditor((s) => s.doc);
  const rev = useEditor((s) => s.rev);
  const sel = useEditor((s) => s.vttSelection);
  const exec = useEditor((s) => s.exec);
  void rev;

  const walls = doc.vtt.walls.filter((w) => sel.walls.includes(w.id));
  const portals = doc.vtt.portals.filter((p) => sel.portals.includes(p.id));
  const lights = doc.vtt.lights.filter((l) => sel.lights.includes(l.id));
  if (walls.length + portals.length + lights.length === 0) return null;

  const patchMany = <T,>(
    kind: 'walls' | 'portals' | 'lights',
    items: Array<{ id: string }>,
    p: Record<string, T>,
    label: string,
  ) => {
    const map = new Map<string, Record<string, unknown>>();
    for (const i of items) map.set(i.id, p);
    exec(new PatchVttItems(kind, map, label));
  };

  return (
    <Section title={t('vttSel.title')}>
      <Row label={t('vttSel.counts')}>
        <span className="value">
          {t('vttSel.countsValue', {
            walls: walls.length,
            portals: portals.length,
            lights: lights.length,
          })}
        </span>
      </Row>

      {walls.length > 0 ? (
        <Select<WallType>
          label={t('wall.type')}
          value={walls[0].type}
          options={[
            { value: 'normal', label: t('wall.normal') },
            { value: 'window', label: t('wall.window') },
            { value: 'ethereal', label: t('wall.ethereal') },
            { value: 'invisible', label: t('wall.invisible') },
          ]}
          onChange={(v) => patchMany('walls', walls, { type: v }, t('vttSel.setWallType'))}
        />
      ) : null}
      {walls.length > 0 ? (
        <WallSensesEditor
          type={walls[0].type}
          senses={walls[0].senses ?? null}
          onChange={(v) =>
            patchMany(
              'walls',
              walls,
              // `undefined` löscht das Feld wieder — die Wand fällt auf die
              // Voreinstellung ihres Typs zurück.
              { senses: v ?? undefined },
              t('vttSel.setWallSenses'),
            )
          }
        />
      ) : null}

      {portals.length > 0 ? (
        <Toggle
          label={t('vttSel.doorClosed')}
          checked={portals[0].closed}
          onChange={(v) => patchMany('portals', portals, { closed: v }, t('vttSel.setDoorState'))}
        />
      ) : null}

      {lights.length > 0 ? (
        <>
          <Slider
            label={t('light.range')}
            min={0.5}
            max={30}
            step={0.5}
            value={lights[0].range}
            onChange={(v) => patchMany('lights', lights, { range: v }, t('vttSel.setLight'))}
            format={(v) => (v === 1 ? t('light.rangeUnitOne') : t('light.rangeUnit', { n: v }))}
          />
          <ColorField
            label={t('light.color')}
            value={lights[0].color}
            onChange={(v) => patchMany('lights', lights, { color: v }, t('vttSel.setLight'))}
          />
          <Slider
            label={t('light.intensity')}
            min={0}
            max={4}
            step={0.05}
            value={lights[0].intensity}
            onChange={(v) => patchMany('lights', lights, { intensity: v }, t('vttSel.setLight'))}
          />
          <Toggle
            label={t('light.shadows')}
            checked={lights[0].shadows}
            onChange={(v) => patchMany('lights', lights, { shadows: v }, t('vttSel.setLight'))}
          />
        </>
      ) : null}

      <p className="hint">{t('vttSel.hint')}</p>
    </Section>
  );
}

export function VttOverviewPanel() {
  const { t } = useT();
  const doc = useEditor((s) => s.doc);
  const rev = useEditor((s) => s.rev);
  const exec = useEditor((s) => s.exec);
  const setStatus = useEditor((s) => s.setStatusMessage);
  void rev;

  const { walls, portals, lights, notes } = doc.vtt;

  const CONFIRM_KEY = {
    walls: ['vtt.confirmClearWallsOne', 'vtt.confirmClearWalls'],
    portals: ['vtt.confirmClearPortalsOne', 'vtt.confirmClearPortals'],
    lights: ['vtt.confirmClearLightsOne', 'vtt.confirmClearLights'],
    notes: ['vtt.confirmClearNotesOne', 'vtt.confirmClearNotes'],
  } as const;

  const clear = (kind: 'walls' | 'portals' | 'lights' | 'notes') => {
    const ids = doc.vtt[kind].map((i) => i.id);
    if (ids.length === 0) return;
    // Rückgängig ginge zwar, aber ein Fehlklick, der die ganze Wandarbeit
    // wegräumt, erschreckt trotzdem. Die Anzahl steht in der Frage, damit
    // sichtbar ist, worum es geht.
    const [one, many] = CONFIRM_KEY[kind];
    if (!window.confirm(t(ids.length === 1 ? one : many, { count: ids.length }))) return;
    exec(new RemoveVttItems({ [kind]: ids }, t('vtt.clearAll')));
  };

  /**
   * Wandzüge zusammenführen.
   *
   * Ein Knopf und keine automatische Bereinigung beim Zeichnen: wer zwei Züge
   * bewusst getrennt hält, soll sie behalten dürfen. Wie viele es waren, sagt
   * die Statuszeile — sonst sieht man dem Ergebnis nicht an, ob etwas passiert
   * ist, denn die Karte sieht hinterher genauso aus.
   */
  const joinWalls = () => {
    const { merged, removedIds } = mergeWalls(walls);
    if (merged.length === 0) {
      setStatus(t('vtt.joinNothing'));
      return;
    }
    exec(
      new CompositeCommand(
        [
          new RemoveVttItems({ walls: removedIds }, t('vtt.joinWalls')),
          new AddVttItems('walls', merged, t('vtt.joinWalls')),
        ],
        t('vtt.joinWalls'),
      ),
    );
    setStatus(t('vtt.joined', { from: removedIds.length, to: merged.length }));
  };

  const counter = (
    label: string,
    count: number,
    kind: 'walls' | 'portals' | 'lights' | 'notes',
  ) => (
    <Row label={label}>
      <div className="row-inline">
        <span className="value">{count}</span>
        <button className="ghost icon" title={t('vtt.clearAll')} onClick={() => clear(kind)}>
          🗑
        </button>
      </div>
    </Row>
  );

  return (
    <Section title={t('vtt.title')} defaultOpen={false}>
      {counter(t('vtt.walls'), walls.length, 'walls')}
      {counter(t('vtt.portals'), portals.length, 'portals')}
      {counter(t('vtt.lights'), lights.length, 'lights')}
      {counter(t('vtt.notes'), notes.length, 'notes')}

      <ColorField
        label={t('vtt.ambient')}
        value={doc.vtt.ambientLight}
        onChange={(v) => exec(new PatchVttEnvironment({ ambientLight: v }))}
      />
      <Toggle
        label={t('vtt.baked')}
        checked={doc.vtt.bakedLighting}
        onChange={(v) => exec(new PatchVttEnvironment({ bakedLighting: v }))}
      />
      <p className="hint">{t('vtt.bakedHint')}</p>

      {walls.length > 1 ? (
        <>
          <button onClick={joinWalls}>{t('vtt.joinWalls')}</button>
          <p className="hint">{t('vtt.joinWallsHint')}</p>
        </>
      ) : null}

      {portals.length > 0 ? (
        <button
          onClick={() => {
            const map = new Map(portals.map((p) => [p.id, { closed: true }]));
            exec(new PatchVttItems('portals', map, t('vtt.closeAllDoors')));
          }}
        >
          {t('vtt.closeAllDoors')}
        </button>
      ) : null}
    </Section>
  );
}
