/**
 * Macht aus einem echten Foundry-Export ein FELDGERUEST.
 *
 * Nur Schluessel und Typen bleiben stehen, kein einziger Inhalt. Die
 * Exporte selbst gehoeren nicht ins Repository: sie tragen Welt- und
 * Nutzerkennungen aus einer fremden Installation, und ein Teil davon ist
 * offizielles Material. Das Geruest genuegt fuer den Zweck — die Tests
 * fragen nur, ob ein Feld, das wir schreiben, es wirklich gibt.
 *
 * Aufruf: node scripts/geruest.mjs <export.json> "<woher>" > tests/belege/<name>.json
 */
import { readFileSync } from 'node:fs';

/**
 * Eine Liste wird zu EINEM Eintrag, der alle Schluessel aller Eintraege
 * kennt. Der erste allein waere zu wenig: die Taetigkeiten eines
 * Gegenstands haben je nach Art verschiedene Felder, und genau die
 * unterschiedlichen sind die interessanten.
 */
function verschmelze(a, b) {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const aus = { ...a };
    for (const [k, v] of Object.entries(b)) aus[k] = verschmelze(aus[k], v);
    return aus;
  }
  // Zwei verschiedene Typen an derselben Stelle: `null` ist in Foundry oft
  // nur „noch nicht gesetzt", der andere Typ sagt mehr.
  return a === null ? b : a;
}

function geruest(wert) {
  if (Array.isArray(wert)) {
    if (wert.length === 0) return [];
    return [geruest(wert.reduce((a, b) => verschmelze(a, b)))];
  }
  if (wert === null) return 'null';
  if (typeof wert === 'object') {
    const aus = {};
    for (const schluessel of Object.keys(wert).sort()) aus[schluessel] = geruest(wert[schluessel]);
    return aus;
  }
  if (typeof wert === 'number') return Number.isInteger(wert) ? 'int' : 'num';
  if (typeof wert === 'boolean') return 'bool';
  return 'str';
}

const [datei, woher] = process.argv.slice(2);
if (!datei) {
  console.error('Aufruf: node scripts/geruest.mjs <export.json> "<woher>"');
  process.exit(1);
}
const roh = JSON.parse(readFileSync(datei, 'utf8'));
console.log(
  JSON.stringify({ _woher: woher ?? 'Feldgeruest eines echten Exports.', _geruest: geruest(roh) }, null, 1)
);
