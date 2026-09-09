/**
 * Importierte Schriften.
 *
 * Der Kopf von `io/project.ts` versprach sie von Anfang an („importierte Bilder
 * und Fonts liegen mit drin"); gebaut war bisher nur der Bildteil.
 *
 * Eine Schrift ist etwas anderes als ein Bild-Asset und liegt darum nicht im
 * selben Speicher: Bilder werden zu Props mit Kategorie, Tags und Größe, eine
 * Schrift dagegen ist nur ein Name, den Textobjekte nennen. Sie hat auch einen
 * anderen Ort im Archiv (`fonts/` statt `assets/`), damit das Wiederherstellen
 * beide nicht auseinandersortieren muss.
 *
 * Die Rohdaten bleiben liegen, weil sie beim Speichern gebraucht werden — eine
 * `FontFace` gibt ihre Bytes nicht wieder her.
 */

const FONT_ENDUNGEN = /\.(ttf|otf|woff2?)$/i;

export interface ImportedFont {
  /** Familienname, wie ihn `TextObject.fontFamily` nennt. */
  family: string;
  /** Dateiname im Archiv, mit Endung. */
  filename: string;
  bytes: Uint8Array;
}

const store = new Map<string, ImportedFont>();

export function isFontFile(name: string): boolean {
  return FONT_ENDUNGEN.test(name);
}

/**
 * Familienname aus einem Dateinamen.
 *
 * Bindestriche und Unterstriche werden zu Leerzeichen, damit aus
 * „Cinzel-Regular.ttf" ein lesbares „Cinzel Regular" wird. Der Name landet
 * unverändert im Dokument und muss darum stabil sein — dieselbe Datei ergibt
 * immer dieselbe Familie.
 */
export function familyFor(filename: string): string {
  return (
    filename
      .replace(/^.*[\\/]/, '')
      .replace(FONT_ENDUNGEN, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Importierte Schrift'
  );
}

/** Alle bereits importierten Schriften. */
export function importedFonts(): ImportedFont[] {
  return [...store.values()];
}

export function hasFont(family: string): boolean {
  return store.has(family);
}

/**
 * Schrift beim Browser anmelden und ablegen.
 *
 * Doppelte Familien werden übergangen statt ersetzt: sonst könnte das Öffnen
 * einer Projektdatei eine gleichnamige Schrift aus der laufenden Sitzung still
 * überschreiben.
 */
export async function importFont(filename: string, bytes: Uint8Array): Promise<ImportedFont | null> {
  if (!isFontFile(filename)) return null;
  const family = familyFor(filename);
  const vorhanden = store.get(family);
  if (vorhanden) return vorhanden;

  const eintrag: ImportedFont = { family, filename: `${family}${endungVon(filename)}`, bytes };

  if (typeof FontFace !== 'undefined' && typeof document !== 'undefined') {
    // Eine Kopie, weil FontFace den Puffer übernimmt und wir die Bytes zum
    // Speichern behalten müssen.
    const kopie = bytes.slice();
    const face = new FontFace(family, kopie.buffer as ArrayBuffer);
    try {
      await face.load();
      document.fonts.add(face);
    } catch {
      // Eine kaputte oder geschützte Schriftdatei soll den Import nicht
      // abbrechen; sie taucht dann einfach nicht in der Liste auf.
      return null;
    }
  }

  store.set(family, eintrag);
  return eintrag;
}

function endungVon(filename: string): string {
  const m = filename.match(FONT_ENDUNGEN);
  return m ? m[0].toLowerCase() : '.ttf';
}

/**
 * Nur die Schriften, die das Dokument tatsächlich benutzt.
 *
 * Wie bei den Bildern: eine Projektdatei soll nicht die ganze importierte
 * Sammlung mitschleppen.
 */
export function usedFonts(doc: { objects: Record<string, { kind: string; fontFamily?: string }> }): Map<string, Uint8Array> {
  const out = new Map<string, Uint8Array>();
  for (const id in doc.objects) {
    const o = doc.objects[id];
    if (o.kind !== 'text' || !o.fontFamily) continue;
    const font = store.get(o.fontFamily);
    if (font) out.set(font.filename, font.bytes);
  }
  return out;
}

/** Stellt Schriften aus einer geöffneten Projektdatei wieder her. */
export async function restoreFonts(fonts: Map<string, Uint8Array>): Promise<ImportedFont[]> {
  const out: ImportedFont[] = [];
  for (const [filename, bytes] of fonts) {
    const f = await importFont(filename, bytes);
    if (f) out.push(f);
  }
  return out;
}

/** Nur für Tests: leert den Speicher. */
export function resetFonts(): void {
  store.clear();
}
