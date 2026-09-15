/**
 * Die Einfuehrungen: eine je Werkzeug, zweisprachig, genau einmal gezeigt.
 *
 * Geprueft wird hier die Tabelle, nicht das Fenster. Dass ein Werkzeug ohne
 * Einfuehrung durchrutscht, faellt sonst erst dem auf, der es zum ersten Mal
 * oeffnet — und dann nur, wenn er weiss, dass da etwas kommen sollte.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { APPS, EINFUEHRUNGEN, WILLKOMMEN, einfuehrungFuer, istWaehlbar, stehtAus } =
  require('../dist/tests/entry.cjs');

test('jedes oeffenbare Werkzeug hat eine Einfuehrung, dazu das Willkommen', () => {
  // Ein geplantes Werkzeug laesst sich nicht oeffnen und braucht darum auch
  // nichts zu erklaeren. Sobald es waehlbar wird, faellt hier auf, dass die
  // Einfuehrung fehlt.
  for (const app of APPS.filter((app) => istWaehlbar(app.status))) {
    assert.ok(einfuehrungFuer(app.id), `keine Einfuehrung fuer ${app.id}`);
  }
  assert.ok(einfuehrungFuer(WILLKOMMEN));
});

test('keine Kennung zweimal', () => {
  const ids = EINFUEHRUNGEN.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('beide Sprachen sind gefuellt und nicht dieselbe Zeile', () => {
  for (const e of EINFUEHRUNGEN) {
    for (const [name, paar] of [['titel', e.titel], ['satz', e.satz]]) {
      assert.ok(paar.de.trim(), `${e.id}: ${name} ohne Deutsch`);
      assert.ok(paar.en.trim(), `${e.id}: ${name} ohne Englisch`);
    }
    // Der Satz ist der einzige Ort, an dem eine unuebersetzte Fassung nicht
    // auffaellt — beim Titel sieht man es sofort.
    assert.notEqual(e.satz.de, e.satz.en, `${e.id}: Satz in beiden Sprachen gleich`);
    for (const punkt of e.punkte) {
      assert.ok(punkt.de.trim() && punkt.en.trim(), `${e.id}: Punkt unvollstaendig`);
      assert.notEqual(punkt.de, punkt.en, `${e.id}: Punkt in beiden Sprachen gleich`);
    }
  }
});

test('drei bis fuenf Punkte — mehr liest beim ersten Start niemand', () => {
  for (const e of EINFUEHRUNGEN) {
    assert.ok(
      e.punkte.length >= 3 && e.punkte.length <= 5,
      `${e.id}: ${e.punkte.length} Punkte`
    );
  }
});

test('eine gesehene Einfuehrung steht nicht mehr aus', () => {
  assert.equal(stehtAus('backstory', []), true);
  assert.equal(stehtAus('backstory', ['backstory']), false);
  assert.equal(stehtAus('backstory', ['mapmaker']), true);
  // Ein Werkzeug ohne Eintrag in der Tabelle darf nichts ausloesen.
  assert.equal(stehtAus('gibtesnicht', []), false);
});

test('unbekannte Kennung liefert nichts, statt zu werfen', () => {
  assert.equal(einfuehrungFuer('gibtesnicht'), undefined);
});
