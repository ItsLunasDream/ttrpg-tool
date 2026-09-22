/**
 * Der Monsterkatalog: offizielle und eigene Monster in einer Liste.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

const eigen = T.eigeneKarten([
  { id: 'grabwaechter', name: 'Grabwächter', cr: '5', tp: 90, rk: 15, ge: 12, themaId: 'untot', rolleId: '' }
]);
const alle = [...T.srdKarten('de'), ...eigen];
const sortiert = { spalte: 'name', absteigend: false };

test('der Katalog fuehrt alle SRD-Monster und die eigenen', () => {
  assert.equal(alle.length, 332);
  assert.ok(alle.every((k) => k.id.startsWith(T.SRD_PRAEFIX) || k.quelle === 'eigen'));
});

test('filtern nach Quelle, Typ, Grad und legendaer', () => {
  const nurEigen = T.filtere(alle, { ...T.LEERER_FILTER, quelle: 'eigen' }, sortiert, 'de');
  assert.deepEqual(nurEigen.map((k) => k.id), ['grabwaechter']);

  const drachen = T.filtere(alle, { ...T.LEERER_FILTER, typ: 'dragon' }, sortiert, 'de');
  assert.ok(drachen.length > 10 && drachen.every((k) => k.typ === 'dragon'));

  const grad = T.filtere(alle, { ...T.LEERER_FILTER, hgVon: 0.25, hgBis: 0.5 }, sortiert, 'de');
  assert.ok(grad.length > 0 && grad.every((k) => ['1/4', '1/2'].includes(k.cr)));

  const legendaer = T.filtere(alle, { ...T.LEERER_FILTER, nurLegendaer: true }, sortiert, 'de');
  assert.ok(legendaer.length > 0 && legendaer.every((k) => k.legendaer));
});

test('die Suche findet ueber Namen und Typ, ohne auf Umlaute zu achten', () => {
  const treffer = T.filtere(alle, { ...T.LEERER_FILTER, suche: 'grabwachter' }, sortiert, 'de');
  assert.deepEqual(treffer.map((k) => k.id), ['grabwaechter']);
  const typ = T.filtere(alle, { ...T.LEERER_FILTER, suche: 'drache' }, sortiert, 'de');
  assert.ok(typ.length > 10);
});

test('sortieren nach Grad, absteigend, faengt beim staerksten an', () => {
  const liste = T.filtere(alle, T.LEERER_FILTER, { spalte: 'hg', absteigend: true }, 'de');
  assert.equal(liste[0].cr, '30');
  const tp = T.filtere(alle, T.LEERER_FILTER, { spalte: 'tp', absteigend: false }, 'de');
  assert.ok(tp[0].tp <= tp[tp.length - 1].tp);
});
