/**
 * Das Beziehungsnetz als Bild fuer das PDF.
 *
 * Gerechnet wird mit denselben Funktionen wie in der Oberflaeche
 * (buildGraphEdges, layoutGraph). Sie sind rein und kommen ohne Browser aus,
 * also laufen sie auch hier.
 *
 * Gezeichnet wird dagegen neu: kein Zoom, keine Pfeilspitzen, keine
 * Beschriftung an den Kanten — Linien, Punkte, Namen. Die Farben der
 * Notiztypen kommen mit, aus demselben Modul wie am Bildschirm; ein
 * graues Netz liess im Ausdruck nicht mehr erkennen, was Figur und was Ort
 * ist, und der Unterschied zwischen Erwaehnung (gestrichelt) und Beziehung
 * (durchgezogen) trug das allein nicht.
 *
 * Kein Electron: damit laesst es sich ohne Druckfenster pruefen.
 */
import { buildGraphEdges, buildGraphNodes } from '../renderer/graph/build';
import { layoutGraph } from '../renderer/graph/layout';
import { buildIndex } from '../renderer/noteIndex';
import { typFarbe } from '../shared/graphFarben';
import type { Note, NoteTypeDef } from '../shared/types';

/** Masse der Zeichenflaeche, in Einheiten des SVG. */
const BREITE = 1000;
const HOEHE = 700;
const RAND = 40;

/**
 * Punkte und Schrift.
 *
 * Groesser als die erste Fassung (7 und 13): auf einer PDF-Seite ist das
 * Netz hoechstens so breit wie der Satzspiegel, und was am Bildschirm in
 * einem grossen Fenster noch ging, war gedruckt nicht mehr zu lesen.
 */
const PUNKT = 9;
const SCHRIFT = 16;

function schuetze(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Rechnet von Hand gesetzte Stellen auf diese Zeichenflaeche um.
 *
 * Gleichmaessig skaliert und zentriert, damit die Anordnung erhalten bleibt:
 * wer im Graphen etwas nach rechts oben gezogen hat, findet es im PDF auch
 * rechts oben. Passen die Stellen schon hinein, bleibt alles, wie es ist.
 */
function eingepasst(
  stellen: Record<string, { x: number; y: number }>,
  flaeche: { breite: number; hoehe: number }
): Record<string, { x: number; y: number }> {
  const werte = Object.values(stellen);
  if (werte.length === 0) return stellen;

  const minX = Math.min(...werte.map((stelle) => stelle.x));
  const maxX = Math.max(...werte.map((stelle) => stelle.x));
  const minY = Math.min(...werte.map((stelle) => stelle.y));
  const maxY = Math.max(...werte.map((stelle) => stelle.y));

  const spanneX = maxX - minX;
  const spanneY = maxY - minY;
  const platzX = flaeche.breite - RAND * 2;
  const platzY = flaeche.hoehe - RAND * 2;

  const massstab = Math.min(
    1,
    spanneX > 1 ? platzX / spanneX : 1,
    spanneY > 1 ? platzY / spanneY : 1
  );

  const versatzX = (flaeche.breite - spanneX * massstab) / 2 - minX * massstab;
  const versatzY = (flaeche.hoehe - spanneY * massstab) / 2 - minY * massstab;

  const heraus: Record<string, { x: number; y: number }> = {};
  for (const [id, stelle] of Object.entries(stellen)) {
    heraus[id] = { x: stelle.x * massstab + versatzX, y: stelle.y * massstab + versatzY };
  }
  return heraus;
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

  /*
   * Von Hand gesetzte Stellen kommen aus dem Graphen der Anwendung — und der
   * hat eine andere Flaeche als diese Zeichnung. Roh uebernommen liegen sie
   * teils weit ausserhalb; das Layout rechnet mit festen Stellen ausserdem
   * ohne abschliessendes Einpassen, und im PDF war das Netz dann unten
   * abgeschnitten. Deshalb werden sie vorher auf diese Flaeche umgerechnet.
   */
  const flaeche = { breite: BREITE - RAND * 2, hoehe: HOEHE - RAND * 2 };
  const knoten = layoutGraph(knotenIds, kanten, {
    width: flaeche.breite,
    height: flaeche.hoehe,
    fixed: eingepasst(stellen, flaeche)
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

  const typVon = new Map(notes.map((note) => [note.id, note.type]));

  const punkte = knoten
    .map((eintrag) => {
      const name = titel.get(eintrag.id) ?? eintrag.id;
      const farbe = typFarbe(types, typVon.get(eintrag.id) ?? '');
      return [
        `<circle cx="${eintrag.x.toFixed(1)}" cy="${eintrag.y.toFixed(1)}" r="${PUNKT}" fill="${farbe}" />`,
        `<text x="${eintrag.x.toFixed(1)}" y="${(eintrag.y + PUNKT + 15).toFixed(1)}">${schuetze(name)}</text>`
      ].join('');
    })
    .join('\n');

  return `<svg class="graph-bild" viewBox="0 0 ${BREITE} ${HOEHE}" xmlns="http://www.w3.org/2000/svg">
<g stroke="#8a8494" stroke-width="1.2">${linien}</g>
<g fill="#1b1720" text-anchor="middle" font-size="${SCHRIFT}">${punkte}</g>
</svg>`;
}
