/**
 * Legende einer Weltkarte.
 *
 * Baut aus dem, was tatsächlich auf der Karte steht, eine Tafel: für jedes
 * gemalte Biom ein Farbfeld mit Namen, für jede benutzte Kartensignatur das
 * Prop mit seinem Namen. Nur *benutzte* Einträge — eine Legende, die alle zehn
 * Biome auflistet, obwohl drei vorkommen, erklärt nichts, sie füllt Platz.
 *
 * Herauskommen gewöhnliche Objekte: ein Rahmen, Farbfelder, Props und Texte.
 * Kein eigener Objekttyp, keine Sonderbehandlung im Renderer — die Legende ist
 * danach ganz normal zu verschieben, umzubenennen und zu löschen. Das ist auch
 * der Grund, warum sie *erzeugt* und nicht laufend nachgeführt wird: wer eine
 * Zeile von Hand ändert, soll sie nicht beim nächsten Pinselstrich verlieren.
 */

import { nextZ } from './document';
import { makeId } from './ids';
import { BIOMES, type LayerId, type MapDocument, type MapObject } from './types';

/**
 * Zuschlag für Kartensignaturen in der Legende. Siehe `propScale`.
 */
const PROP_FILL = 1.5;

export interface LegendEntry {
  /** Farbfeld, oder ein Prop. */
  kind: 'biome' | 'prop';
  /** Bei 'biome' der Biom-Index (1-basiert), bei 'prop' die Prop-Id. */
  key: string;
  color?: number;
  label: string;
  /**
   * Steht *nicht* auf der Karte, sondern wurde von Hand aufgenommen.
   *
   * Solche Einträge rücken in der Tafel unter eine Trennlinie. Der Grund ist
   * inhaltlich, nicht dekorativ: eine Legende sagt „so liest du diese Karte".
   * Was darauf gar nicht vorkommt, sagt etwas anderes — eine Vereinbarung für
   * die Runde, ein Zeichen für später —, und beides ununterscheidbar
   * untereinander zu stellen führt den Leser in die Irre.
   */
  extra?: boolean;
}

export interface LegendOptions {
  layerId: LayerId;
  x: number;
  y: number;
  /** Zeilenhöhe in Weltpixeln; alles andere richtet sich danach. */
  rowHeight: number;
  title: string;
  backgroundColor: number;
  backgroundAlpha: number;
  borderColor: number;
  textColor: number;
  fontFamily: string;
}

/**
 * Was auf der Karte vorkommt.
 *
 * `propLabel` übersetzt eine Prop-Id in den Anzeigenamen; das Modell kennt die
 * Prop-Bibliothek nicht und bekommt die Zuordnung darum hereingereicht.
 */
export function collectLegendEntries(
  doc: MapDocument,
  propLabel: (propId: string) => string | null,
  biomeLabel: (biomeId: string) => string,
): LegendEntry[] {
  const out: LegendEntry[] = [];

  const benutzteBiome = new Set<number>();
  for (const map of Object.values(doc.heightMaps ?? {})) {
    for (const b of map.biome ?? []) if (b > 0) benutzteBiome.add(b);
  }
  // In der Reihenfolge der Liste, nicht in der des Malens: so sieht dieselbe
  // Karte bei jedem Erzeugen gleich aus.
  for (let i = 1; i <= BIOMES.length; i++) {
    if (!benutzteBiome.has(i)) continue;
    out.push({
      kind: 'biome',
      key: String(i),
      color: BIOMES[i - 1].color,
      label: biomeLabel(BIOMES[i - 1].id),
    });
  }

  const benutzteProps = new Map<string, number>();
  for (const id in doc.objects) {
    const o = doc.objects[id];
    if (o.kind !== 'prop') continue;
    benutzteProps.set(o.propId, (benutzteProps.get(o.propId) ?? 0) + 1);
  }
  // Häufigste zuerst: was die Karte prägt, steht oben.
  const sortiert = [...benutzteProps.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  for (const [propId] of sortiert) {
    const label = propLabel(propId);
    if (label === null) continue;
    out.push({ kind: 'prop', key: propId, label });
  }

  return out;
}

/** Eindeutiger Schlüssel eines Eintrags, für Ab- und Anwahl. */
export function legendKey(e: Pick<LegendEntry, 'kind' | 'key'>): string {
  return `${e.kind}:${e.key}`;
}

/**
 * Was am Ende in der Tafel steht: Gefundenes ohne die Abgewählten, danach die
 * von Hand aufgenommenen.
 *
 * Die Reihenfolge ist Absicht — erst was auf der Karte steht, dann was nicht.
 * `buildLegendObjects` zieht die Trennlinie an genau dieser Naht, und dafür
 * muss alles Zusätzliche am Stück hinten liegen.
 *
 * Handeinträge, die inzwischen doch auf der Karte vorkommen, fallen weg: sie
 * stehen dann schon oben, und zweimal dieselbe Zeile erklärt nichts.
 */
export function resolveLegendEntries(
  gefunden: LegendEntry[],
  excluded: readonly string[],
  extra: ReadonlyArray<{ kind: 'biome' | 'prop'; key: string }>,
  label: (kind: 'biome' | 'prop', key: string) => { label: string; color?: number } | null,
): LegendEntry[] {
  const raus = new Set(excluded);
  const behalten = gefunden.filter((e) => !raus.has(legendKey(e)));
  const schonDa = new Set(gefunden.map(legendKey));

  const zusatz: LegendEntry[] = [];
  const gesehen = new Set<string>();
  for (const e of extra) {
    const k = legendKey(e);
    if (schonDa.has(k) || gesehen.has(k) || raus.has(k)) continue;
    gesehen.add(k);
    const info = label(e.kind, e.key);
    if (!info) continue;
    zusatz.push({ kind: e.kind, key: e.key, label: info.label, color: info.color, extra: true });
  }

  return [...behalten, ...zusatz];
}

/**
 * Die Objekte der Legende.
 *
 * Der Rahmen entsteht zuerst und bekommt das kleinste z; die Einträge liegen
 * darüber. Alle bekommen dieselbe Gruppenkennung, damit sich die Tafel als
 * Ganzes anfassen lässt.
 */
export function buildLegendObjects(
  doc: MapDocument,
  entries: LegendEntry[],
  opts: LegendOptions,
  /**
   * Grundmaß eines Props bei Skalierung 1, bezogen auf ein 100-px-Tile.
   *
   * Wird hereingereicht wie die Namen: das Modell kennt die Prop-Bibliothek
   * nicht. Ohne diese Angabe stünden in der Legende Signaturen in ihrer
   * Originalgröße nebeneinander — und ein Gebirge ist doppelt so breit wie
   * ein Dorf, sodass die Zeilen jede Ordnung verlören.
   */
  propSize: (propId: string) => { w: number; h: number } | null = () => null,
): { objects: MapObject[]; groupId: string } {
  const h = opts.rowHeight;
  const rand = h * 0.6;
  /**
   * Kantenlänge des Farbfelds bzw. des Signaturkastens.
   *
   * Nah an der Zeilenhöhe: eine Kartensignatur ist eine kleine Zeichnung, und
   * bei halber Zeilenhöhe war von einem Gebirge nur noch ein Krisel übrig.
   */
  const feld = h * 0.82;
  const breite = h * 9;
  const kopf = opts.title.trim().length > 0 ? h * 1.5 : 0;
  /** Wo die von Hand aufgenommenen Einträge anfangen; -1 heißt: keine. */
  const extraAb = entries.findIndex((e) => e.extra);
  /** Luft für die Trennlinie, nur wenn es etwas zu trennen gibt. */
  const trenner = extraAb > 0 ? h * 0.5 : 0;
  const hoehe = rand * 2 + kopf + entries.length * h + trenner;

  /**
   * Waagerechte Mitte der Textspalte.
   *
   * Der Renderer zeichnet Text um seinen *Mittelpunkt* — `align` wirkt nur
   * zwischen mehreren Zeilen eines Objekts, nicht auf seine Lage. Eine
   * linksbündige Spalte ließe sich hier darum nicht setzen, ohne die Breite
   * jeder Beschriftung zu kennen, und die kennt nur der Renderer. Also die
   * Spalte mittig — in einer Legende sieht das ordentlich aus, und der
   * Abstand zum Farbfeld stimmt in jedem Fall.
   */
  const spalteVon = rand + feld + h * 0.5;
  const textMitte = opts.x + spalteVon + (breite - rand - spalteVon) / 2;

  const groupId = makeId('grp');
  const objects: MapObject[] = [];
  let z = nextZ(doc, opts.layerId);

  const tileScale = doc.grid.tileSize / 100;
  const propScale = (propId: string): number => {
    const size = propSize(propId);
    if (!size) return 0.5;
    const groesste = Math.max(size.w, size.h);
    if (groesste <= 0) return 0.5;
    // Das angegebene Maß eines Props ist sein Kasten, nicht seine Zeichnung —
    // ein Gebirge lässt darin oben und unten Luft. Genau in den Kasten
    // gerechnet wirkt eine Signatur darum kleiner als ein Farbfeld, das ihn
    // ganz ausfüllt. Der Zuschlag gleicht das aus.
    return (feld * PROP_FILL) / (groesste * tileScale);
  };

  objects.push({
    id: makeId('obj'),
    kind: 'shape',
    layerId: opts.layerId,
    shape: 'rect',
    x: opts.x,
    y: opts.y,
    rotation: 0,
    opacity: 1,
    z: z++,
    locked: false,
    points: [0, 0, breite, hoehe],
    closed: true,
    blend: 'normal',
    stroke: { color: opts.borderColor, width: Math.max(1.5, h * 0.08), alpha: 1, dash: [] },
    fill: { color: opts.backgroundColor, alpha: opts.backgroundAlpha, gradient: null, pattern: null },
    groupId,
  });

  const text = (inhalt: string, x: number, y: number, groesse: number, fett: boolean): MapObject => ({
    id: makeId('obj'),
    kind: 'text',
    layerId: opts.layerId,
    x,
    y,
    rotation: 0,
    opacity: 1,
    z: z++,
    locked: false,
    text: inhalt,
    fontFamily: opts.fontFamily,
    fontSize: groesse,
    bold: fett,
    italic: false,
    color: opts.textColor,
    align: 'left',
    letterSpacing: 0,
    lineHeight: 1.2,
    strokeColor: null,
    strokeWidth: 0,
    groupId,
  });

  if (kopf > 0) {
    objects.push(text(opts.title, opts.x + breite / 2, opts.y + rand + kopf / 2, h * 0.8, true));
  }

  // Die Trennlinie sitzt zwischen der letzten gefundenen und der ersten von
  // Hand aufgenommenen Zeile.
  if (trenner > 0) {
    const y = opts.y + rand + kopf + extraAb * h + trenner / 2;
    objects.push({
      id: makeId('obj'),
      kind: 'shape',
      layerId: opts.layerId,
      shape: 'line',
      x: opts.x + rand,
      y,
      rotation: 0,
      opacity: 1,
      z: z++,
      locked: false,
      points: [0, 0, breite - rand * 2, 0],
      closed: false,
      blend: 'normal',
      stroke: { color: opts.borderColor, width: Math.max(1, h * 0.04), alpha: 0.55, dash: [] },
      fill: null,
      groupId,
    });
  }

  entries.forEach((eintrag, i) => {
    // Ab der ersten Handzeile rutscht alles um die Trennlinie nach unten.
    const versatz = trenner > 0 && i >= extraAb ? trenner : 0;
    const zeileY = opts.y + rand + kopf + i * h + h / 2 + versatz;

    if (eintrag.kind === 'biome') {
      objects.push({
        id: makeId('obj'),
        kind: 'shape',
        layerId: opts.layerId,
        shape: 'rect',
        x: opts.x + rand,
        y: zeileY - feld / 2,
        rotation: 0,
        opacity: 1,
        z: z++,
        locked: false,
        points: [0, 0, feld, feld],
        closed: true,
        blend: 'normal',
        stroke: { color: opts.borderColor, width: Math.max(1, h * 0.05), alpha: 0.9, dash: [] },
        fill: { color: eintrag.color ?? 0x888888, alpha: 1, gradient: null, pattern: null },
        groupId,
      });
    } else {
      objects.push({
        id: makeId('obj'),
        kind: 'prop',
        layerId: opts.layerId,
        x: opts.x + rand + feld / 2,
        y: zeileY,
        rotation: 0,
        opacity: 1,
        z: z++,
        locked: false,
        propId: eintrag.key,
        // Alle Signaturen auf dieselbe Kastengröße wie die Farbfelder. Der
        // Renderer multipliziert zusätzlich mit tileSize/100, das muss hier
        // wieder heraus.
        scaleX: propScale(eintrag.key),
        scaleY: propScale(eintrag.key),
        tint: null,
        flipX: false,
        flipY: false,
        seed: 1,
        groupId,
      });
    }

    objects.push(text(eintrag.label, textMitte, zeileY, h * 0.62, false));
  });

  return { objects, groupId };
}
