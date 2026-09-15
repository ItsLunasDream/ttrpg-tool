/**
 * Das Beziehungsnetz als Bild fuer das PDF.
 *
 * Gerechnet wird mit denselben Funktionen wie in der Oberflaeche
 * (buildGraphEdges, layoutGraph). Sie sind rein und kommen ohne Browser aus,
 * also laufen sie auch hier.
 *
 * Gezeichnet wird dagegen neu, und schlichter: fuers Papier zaehlen andere
 * Dinge als fuer den Bildschirm. Keine Farben je Notiztyp, kein Zoom, keine
 * Pfeilspitzen — schwarze Linien, Kreise, Beschriftungen. Wer das Netz in
 * Farbe sehen will, oeffnet den Graphen in der Anwendung.
 *
 * Kein Electron: damit laesst es sich ohne Druckfenster pruefen.
 */
import { buildGraphEdges, buildGraphNodes } from '../renderer/graph/build';
import { layoutGraph } from '../renderer/graph/layout';
import { buildIndex } from '../renderer/noteIndex';
import type { Note, NoteTypeDef } from '../shared/types';

/** Masse der Zeichenflaeche, in Einheiten des SVG. */
const BREITE = 1000;
const HOEHE = 700;
const RAND = 40;

function schuetze(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Liefert das SVG, oder eine leere Zeichenkette, wenn es nichts zu zeigen
 * gibt. Ein Netz aus einer Notiz ist kein Netz.
 */
export function zeichneGraph(
  notes: Note[],
  types: NoteTypeDef[],
  stellen: Record<string, { x: number; y: number }> = {}
): string {
  if (notes.length < 2) return '';

  const index = buildIndex(notes, types);
  const kanten = buildGraphEdges(index, 'both');
  const knotenIds = buildGraphNodes(notes, kanten);
  if (knotenIds.length < 2) return '';

  const knoten = layoutGraph(knotenIds, kanten, {
    width: BREITE - RAND * 2,
    height: HOEHE - RAND * 2,
    fixed: stellen
  }).map((eintrag) => ({ ...eintrag, x: eintrag.x + RAND, y: eintrag.y + RAND }));

  const nachId = new Map(knoten.map((eintrag) => [eintrag.id, eintrag]));
  const titel = new Map(notes.map((note) => [note.id, note.title]));

  const linien = kanten
    .map((kante) => {
      const von = nachId.get(kante.source);
      const nach = nachId.get(kante.target);
      if (!von || !nach) return '';
      // Erwaehnungen gestrichelt, Beziehungen durchgezogen: auf Papier ist
      // das der Unterschied, der ohne Farbe noch traegt.
      const strich = kante.kind === 'mention' ? ' stroke-dasharray="4 3"' : '';
      return `<line x1="${von.x.toFixed(1)}" y1="${von.y.toFixed(1)}" x2="${nach.x.toFixed(1)}" y2="${nach.y.toFixed(1)}"${strich} />`;
    })
    .filter(Boolean)
    .join('\n');

  const punkte = knoten
    .map((eintrag) => {
      const name = titel.get(eintrag.id) ?? eintrag.id;
      return [
        `<circle cx="${eintrag.x.toFixed(1)}" cy="${eintrag.y.toFixed(1)}" r="7" />`,
        `<text x="${eintrag.x.toFixed(1)}" y="${(eintrag.y + 20).toFixed(1)}">${schuetze(name)}</text>`
      ].join('');
    })
    .join('\n');

  return `<svg class="graph-bild" viewBox="0 0 ${BREITE} ${HOEHE}" xmlns="http://www.w3.org/2000/svg">
<g stroke="#8a8494" stroke-width="1.2">${linien}</g>
<g fill="#1b1720" text-anchor="middle" font-size="13">${punkte}</g>
</svg>`;
}
