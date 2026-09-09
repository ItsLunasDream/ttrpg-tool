/**
 * Notizen nach Foundry bringen.
 *
 * Universal VTT kennt keine Notizen, und der verbreitete Importer
 * (moo-man/FVTT-DD-Import) legt keine an — die Notizen im `.uvtt` sind darum
 * nur Aufbewahrung, kein Weg nach Foundry. Dieser Weg hier ist einer: ein
 * Makro, das die Spielleitung in Foundry einfügt und einmal ausführt.
 *
 * Warum ein Makro und keine Importdatei: eine Journalnotiz besteht in Foundry
 * aus *zwei* Dingen — einem JournalEntry in der Sammlung und einem Note-Pin auf
 * der Szene, der ihn verweist. Über die Oberfläche lässt sich nur eines von
 * beiden importieren; das Makro legt beides an und verbindet es. Es braucht
 * kein Modul.
 *
 * Das Makro läuft auf der *aktiven* Szene. Deren Rasterweite bestimmt, wohin
 * die Pins kommen: die Positionen stehen hier in Grid-Einheiten und werden erst
 * in Foundry mit `grid.size` multipliziert. Damit stimmen sie auch dann, wenn
 * die Szene mit einer anderen Auflösung importiert wurde als hier exportiert.
 */

import type { MapDocument, MapNote, NoteIcon } from '@/model/types';

/**
 * Icon-Dateien, die Foundry selbst mitbringt.
 *
 * Bewusst nur Pfade aus dem Grundumfang: ein Pfad in ein Modul, das nicht
 * installiert ist, ergibt in Foundry einen leeren Pin.
 */
const FOUNDRY_ICONS: Record<NoteIcon, string> = {
  marker: 'icons/svg/book.svg',
  info: 'icons/svg/aura.svg',
  danger: 'icons/svg/hazard.svg',
  treasure: 'icons/svg/chest.svg',
  door: 'icons/svg/door-closed.svg',
  secret: 'icons/svg/mystery-man.svg',
  combat: 'icons/svg/sword.svg',
  quest: 'icons/svg/direction.svg',
};

export function foundryIconPath(icon: NoteIcon): string {
  return FOUNDRY_ICONS[icon] ?? FOUNDRY_ICONS.marker;
}

/** Text in HTML-Absätze. Leerzeilen trennen, alles andere wird escaped. */
export function textToHtml(text: string): string {
  const absaetze = text
    .split(/\n{2,}/)
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
  if (absaetze.length === 0) return '';
  return absaetze.map((a) => `<p>${escapeHtml(a).replace(/\n/g, '<br>')}</p>`).join('');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 0xRRGGBB als `#rrggbb`. */
function toCssColor(rgb: number): string {
  return `#${(rgb & 0xffffff).toString(16).padStart(6, '0')}`;
}

export interface FoundryNoteData {
  title: string;
  /** Fertiges HTML der Journalseite. */
  html: string;
  /** Position in Grid-Einheiten — in Foundry mit `grid.size` multipliziert. */
  x: number;
  y: number;
  icon: string;
  /** Kantenlänge des Pins in Pixeln, wie Foundry es erwartet. */
  iconSize: number;
  iconTint: string;
  /** 0 = nur Spielleitung, 2 = für alle sichtbar (Foundrys OWNERSHIP-Stufen). */
  ownership: 0 | 2;
}

/**
 * Die Notizen in die Form bringen, die das Makro einsetzt.
 *
 * Eigene Funktion, damit sich das Übersetzen testen lässt, ohne den erzeugten
 * JavaScript-Text auseinanderzunehmen.
 */
export function buildFoundryNotes(doc: MapDocument): FoundryNoteData[] {
  const tile = doc.grid.tileSize;
  return doc.vtt.notes.map((note: MapNote, index) => ({
    title: note.title.trim() || `Notiz ${index + 1}`,
    html: textToHtml(note.text),
    x: note.x / tile,
    y: note.y / tile,
    icon: foundryIconPath(note.icon),
    // Foundry misst die Pin-Größe in Pixeln; unsere Größe steht in Tiles und
    // wird erst in der Szene aufgelöst — dort kann das Raster anders sein.
    iconSize: note.size,
    iconTint: toCssColor(note.color),
    ownership: note.playerVisible ? 2 : 0,
  }));
}

/**
 * Das Makro als Text.
 *
 * Die Daten stehen als JSON-Literal darin, nicht als eingebauter Code — so
 * kann nichts aus einem Notiztext den Skriptaufbau durcheinanderbringen.
 */
export function buildFoundryNotesMacro(doc: MapDocument): string {
  const notes = buildFoundryNotes(doc);
  const daten = JSON.stringify(notes, null, 2).replace(/<\/script/gi, '<\\/script');
  const kartenname = doc.meta.name.replace(/[\r\n]/g, ' ');

  return `/**
 * Notizen aus dem TTRPG Map Editor für "${escapeForComment(kartenname)}".
 *
 * So wird es benutzt:
 *   1. In Foundry die Szene öffnen, zu der die Notizen gehören.
 *   2. Makro-Verzeichnis > Neues Makro > Typ "Script", diesen Text einfügen.
 *   3. Ausführen. Es ${notes.length === 1 ? 'entsteht 1 Journaleintrag' : `entstehen ${notes.length} Journaleinträge`} und
 *      ebenso viele Pins auf der aktiven Szene.
 *
 * Nochmals ausführen legt die Notizen erneut an — vorher die alten löschen.
 */
const NOTIZEN = ${daten};

(async () => {
  const szene = canvas?.scene;
  if (!szene) {
    ui.notifications.error('Keine aktive Szene.');
    return;
  }

  const ordner = await Folder.create({ name: ${JSON.stringify(kartenname)}, type: 'JournalEntry' });

  const pins = [];
  for (const n of NOTIZEN) {
    const eintrag = await JournalEntry.create({
      name: n.title,
      folder: ordner?.id ?? null,
      pages: [{ name: n.title, type: 'text', text: { content: n.html, format: 1 } }],
      // 0 = keiner, 2 = beobachten. Steuert, ob Spieler den Pin anklicken dürfen.
      ownership: { default: n.ownership },
    });

    pins.push({
      entryId: eintrag.id,
      // Grid-Einheiten mal Rasterweite der Szene: so sitzen die Pins auch dann
      // richtig, wenn die Szene mit anderer Auflösung importiert wurde.
      x: n.x * szene.grid.size,
      y: n.y * szene.grid.size,
      texture: { src: n.icon, tint: n.iconTint },
      iconSize: Math.max(32, Math.round(n.iconSize * szene.grid.size)),
      text: n.title,
      global: false,
    });
  }

  await szene.createEmbeddedDocuments('Note', pins);
  ui.notifications.info(\`\${pins.length} Notiz(en) angelegt.\`);
})();
`;
}

function escapeForComment(value: string): string {
  return value.replace(/\*\//g, '*\\/');
}
