/**
 * Importierte Bild-Assets.
 *
 * Die Bibliothek konnte importierte Props schon immer halten (`source:
 * 'imported'`, `textureUrl`); was fehlte, war der Weg von einer Datei auf der
 * Platte dorthin — und der Rückweg beim Speichern.
 *
 * Hier liegen die Rohdaten. Sie werden gebraucht, weil ein Object-URL nur
 * innerhalb der laufenden Sitzung gilt: zum Einpacken ins `.ttmap` braucht es
 * die Bytes selbst, und beim Öffnen entsteht daraus wieder ein frischer URL.
 */

import type { MapDocument } from '@/model/types';
import { registerProps, unregisterProps } from './library';
import type { PropCategory, PropDef } from './propTypes';

/** Bezugsgröße der Prop-Maße: alles bezieht sich auf ein 100-px-Tile. */
const REFERENCE_TILE = 100;

export interface ImportedAsset {
  /** Prop-Id, zugleich Dateiname im Archiv. Stabil über Speichern und Laden. */
  id: string;
  /** Dateiname im Archiv, mit Endung. */
  filename: string;
  bytes: Uint8Array;
  url: string;
}

const store = new Map<string, ImportedAsset>();

/** Ordnernamen, die einer eingebauten Kategorie entsprechen. */
const ORDNER_KATEGORIE: Record<string, PropCategory> = {
  stein: 'stein', steine: 'stein', rocks: 'stein', stones: 'stein',
  pflanze: 'pflanze', pflanzen: 'pflanze', plants: 'pflanze',
  baum: 'baum', baeume: 'baum', trees: 'baum',
  boden: 'boden', ground: 'boden', floor: 'boden', floors: 'boden',
  moebel: 'moebel', furniture: 'moebel',
  dungeon: 'dungeon',
  struktur: 'struktur', structure: 'struktur', building: 'struktur', buildings: 'struktur',
  deko: 'deko', decoration: 'deko', props: 'deko',
  welt: 'welt', world: 'welt', worldmap: 'welt',
};

const BILD_ENDUNGEN = /\.(png|webp|jpe?g|gif|avif)$/i;

export function isImageFile(name: string): boolean {
  return BILD_ENDUNGEN.test(name);
}

/**
 * Id aus dem relativen Pfad.
 *
 * Der Pfad geht ein, nicht nur der Dateiname: zwei Ordner dürfen beide eine
 * `tisch.png` enthalten, ohne einander zu überschreiben.
 */
export function assetIdFor(relativePath: string): string {
  const ohneEndung = relativePath.replace(BILD_ENDUNGEN, '');
  const sauber = ohneEndung
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `imp_${sauber || 'asset'}`;
}

/** Kategorie aus der Ordnerstruktur; unbekannte Ordner landen unter „Importiert". */
export function categoryFor(relativePath: string): PropCategory {
  const teile = relativePath.split('/').slice(0, -1);
  for (let i = teile.length - 1; i >= 0; i--) {
    const treffer = ORDNER_KATEGORIE[teile[i].toLowerCase()];
    if (treffer) return treffer;
  }
  return 'import';
}

/** Tags aus Ordnern und Dateinamen — damit die Suche greift. */
export function tagsFor(relativePath: string): string[] {
  return [
    ...new Set(
      relativePath
        .replace(BILD_ENDUNGEN, '')
        .toLowerCase()
        .split(/[^a-z0-9äöüß]+/)
        .filter((w) => w.length > 1),
    ),
  ];
}

/** Anzeigename: der Dateiname ohne Endung, Unterstriche als Leerzeichen. */
export function displayNameFor(relativePath: string): string {
  const datei = relativePath.split('/').pop() ?? relativePath;
  const ohne = datei.replace(BILD_ENDUNGEN, '').replace(/[_-]+/g, ' ').trim();
  return ohne.charAt(0).toUpperCase() + ohne.slice(1);
}

/** Natürliche Bildgröße messen — sie bestimmt, wie viele Tiles das Prop breit ist. */
function measure(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 100, h: img.naturalHeight || 100 });
    // Ein unlesbares Bild soll den ganzen Import nicht aufhalten.
    img.onerror = () => resolve({ w: 100, h: 100 });
    img.src = url;
  });
}

export interface ImportOptions {
  /** Wie viele Bildpixel einem Tile entsprechen. Ein 512er-PNG ist nicht 5 Tiles breit, nur weil es 512 px hat. */
  pixelsPerTile: number;
}

/**
 * Legt aus Dateien Props an und registriert sie.
 *
 * `relativePath` bestimmt Id, Kategorie und Tags. Beim Ordner-Import ist das
 * der Pfad unterhalb des gewählten Ordners, beim Dateidialog der Dateiname.
 */
export async function importAssets(
  dateien: Array<{ relativePath: string; blob: Blob; id?: string }>,
  opts: ImportOptions,
): Promise<PropDef[]> {
  const neu: PropDef[] = [];

  for (const { relativePath, blob, id: vorgegeben } of dateien) {
    if (!isImageFile(relativePath)) continue;
    // Beim Wiederherstellen aus einem Archiv steht die Id schon fest; sie noch
    // einmal aus dem Dateinamen abzuleiten hinge ein zweites „imp_" davor, und
    // das Dokument fände sein Prop nicht mehr.
    const id = vorgegeben ?? assetIdFor(relativePath);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const endung = relativePath.match(BILD_ENDUNGEN)?.[0] ?? '.png';
    const url = URL.createObjectURL(blob);
    const natur = await measure(url);

    // Vorherige Fassung derselben Id sauber ablösen, sonst leckt der Object-URL.
    const alt = store.get(id);
    if (alt) URL.revokeObjectURL(alt.url);

    store.set(id, { id, filename: `${id}${endung}`, bytes, url });

    neu.push({
      id,
      name: displayNameFor(relativePath),
      category: categoryFor(relativePath),
      tags: tagsFor(relativePath),
      source: 'imported',
      size: {
        w: (natur.w / opts.pixelsPerTile) * REFERENCE_TILE,
        h: (natur.h / opts.pixelsPerTile) * REFERENCE_TILE,
      },
      tintable: false,
      variants: 1,
      textureUrl: url,
    });
  }

  if (neu.length > 0) registerProps(neu);
  return neu;
}

/** Alle abgelegten Assets. */
export function importedAssets(): ImportedAsset[] {
  return [...store.values()];
}

export function removeImported(ids: string[]): void {
  for (const id of ids) {
    const a = store.get(id);
    if (a) URL.revokeObjectURL(a.url);
    store.delete(id);
  }
  unregisterProps(ids);
}

/**
 * Nur die Assets, auf die das Dokument tatsächlich verweist.
 *
 * Beim Speichern soll nicht die ganze importierte Bibliothek mitwandern —
 * eine `.ttmap` mit fünfhundert ungenutzten Bildern wäre unbrauchbar groß.
 */
export function usedAssets(doc: MapDocument): Map<string, Uint8Array> {
  const benutzt = new Set<string>();
  for (const id in doc.objects) {
    const o = doc.objects[id];
    if (o.kind === 'prop') benutzt.add(o.propId);
  }
  const out = new Map<string, Uint8Array>();
  for (const id of benutzt) {
    const a = store.get(id);
    if (a) out.set(a.filename, a.bytes);
  }
  return out;
}

/**
 * Stellt Assets aus einer geöffneten Projektdatei wieder her.
 *
 * Die Bilder kommen als Rohdaten; daraus entstehen neue Object-URLs. Die Größe
 * in Tiles steht nicht im Archiv, sie wird wieder aus dem Bild gemessen — die
 * beim Import gewählte Auflösung ist also die Voreinstellung, nicht mehr.
 */
export async function restoreAssets(
  assets: Map<string, Uint8Array>,
  pixelsPerTile: number,
): Promise<PropDef[]> {
  const dateien: Array<{ relativePath: string; blob: Blob; id?: string }> = [];
  for (const [filename, bytes] of assets) {
    if (!isImageFile(filename)) continue;
    const typ = filename.endsWith('.webp')
      ? 'image/webp'
      : filename.match(/\.jpe?g$/i)
        ? 'image/jpeg'
        : filename.endsWith('.gif')
          ? 'image/gif'
          : filename.endsWith('.avif')
            ? 'image/avif'
            : 'image/png';
    // Der Dateiname im Archiv ist „<id>.<endung>" — die Id also einfach abschneiden.
    dateien.push({
      id: filename.replace(/\.[^.]+$/, ''),
      relativePath: filename,
      blob: new Blob([bytes as unknown as BlobPart], { type: typ }),
    });
  }
  return importAssets(dateien, { pixelsPerTile });
}

/**
 * Bild aus einer Universal-VTT-Datei als Prop anlegen.
 *
 * Der Reader liest das Kartenbild als Base64 aus; bisher wurde es verworfen.
 * Es wird hier zu einem gewöhnlichen importierten Prop — damit lässt es sich
 * verschieben, skalieren und auf einen eigenen Layer legen wie jedes andere
 * Hintergrundbild auch.
 *
 * `pixelsPerGrid` ist die Auflösung, mit der die Datei das Bild angelegt hat.
 * Sie als „Pixel je Tile" einzusetzen lässt das Bild deckungsgleich auf dem
 * Raster liegen — genau darauf beziehen sich auch Wände und Türen der Datei.
 */
export async function importUvttImage(
  base64: string,
  pixelsPerGrid: number,
  name: string,
): Promise<PropDef | null> {
  const roh = base64.replace(/^data:[^,]+,/, '');
  let bytes: Uint8Array;
  try {
    const binaer = atob(roh);
    bytes = new Uint8Array(binaer.length);
    for (let i = 0; i < binaer.length; i++) bytes[i] = binaer.charCodeAt(i);
  } catch {
    return null;
  }

  // PNG oder WebP? Die Signatur entscheidet, nicht die Endung — die Datei hat keine.
  const istWebp =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const endung = istWebp ? '.webp' : '.png';
  const id = `imp_uvtt_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'karte'}`;

  const defs = await importAssets(
    [
      {
        id,
        relativePath: `${id}${endung}`,
        blob: new Blob([bytes as unknown as BlobPart], {
          type: istWebp ? 'image/webp' : 'image/png',
        }),
      },
    ],
    { pixelsPerTile: pixelsPerGrid },
  );
  return defs[0] ?? null;
}
