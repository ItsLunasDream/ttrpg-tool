import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { LEERER_VERLAUF, VERLAUF_TIEFE, besuche, zurueck, vorwaerts, kannZurueck, kannVorwaerts, aktuelleStelle } =
  entry;

function wege(...apps) {
  return apps.reduce((verlauf, app) => besuche(verlauf, { app }), LEERER_VERLAUF);
}

test('zurueck und vorwaerts laufen durch die besuchten Stellen', () => {
  let verlauf = wege('mapmaker', 'initiative', 'dice');
  assert.equal(aktuelleStelle(verlauf).app, 'dice');

  verlauf = zurueck(verlauf);
  assert.equal(aktuelleStelle(verlauf).app, 'initiative');
  verlauf = zurueck(verlauf);
  assert.equal(aktuelleStelle(verlauf).app, 'mapmaker');

  verlauf = vorwaerts(verlauf);
  assert.equal(aktuelleStelle(verlauf).app, 'initiative');
});

test('an den Enden passiert nichts, kein Rundlauf', () => {
  const einer = wege('dice');
  assert.equal(kannZurueck(einer), false);
  assert.equal(kannVorwaerts(einer), false);
  assert.equal(zurueck(einer), einer);
  assert.equal(vorwaerts(einer), einer);
});

test('ein neuer Schritt wirft den Vorwaerts-Ast weg', () => {
  // Genau so halten es Browser.
  let verlauf = wege('mapmaker', 'initiative', 'dice');
  verlauf = zurueck(zurueck(verlauf));
  verlauf = besuche(verlauf, { app: 'npc' });

  assert.deepEqual(verlauf.stellen.map((stelle) => stelle.app), ['mapmaker', 'npc']);
  assert.equal(kannVorwaerts(verlauf), false);
});

test('dieselbe Stelle noch einmal ergibt keinen zweiten Eintrag', () => {
  const verlauf = besuche(wege('dice'), { app: 'dice' });
  assert.equal(verlauf.stellen.length, 1);
});

test('der Verlauf ist auf die Tiefe begrenzt, und die Gegenwart bleibt am Ende', () => {
  let verlauf = LEERER_VERLAUF;
  for (let i = 0; i < VERLAUF_TIEFE + 10; i += 1) verlauf = besuche(verlauf, { app: `app-${i}` });

  assert.equal(verlauf.stellen.length, VERLAUF_TIEFE);
  assert.equal(verlauf.jetzt, VERLAUF_TIEFE - 1);
  assert.equal(aktuelleStelle(verlauf).app, `app-${VERLAUF_TIEFE + 9}`);
});

test('das Startmenue ist eine Stelle wie jede andere', () => {
  let verlauf = besuche(LEERER_VERLAUF, { app: null });
  verlauf = besuche(verlauf, { app: 'dice' });
  assert.equal(aktuelleStelle(zurueck(verlauf)).app, null);
});
