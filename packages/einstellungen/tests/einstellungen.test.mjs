import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { alleFelder, feldMit, istBedienbar, pruefeWert, text, traegtWert } = require('../dist/tests/entry.cjs');

const BEISPIEL = {
  appId: 'backstory',
  gruppen: [
    {
      id: 'schreiben',
      name: { de: 'Schreiben', en: 'Writing' },
      felder: [
        { art: 'schalter', id: 'autosave', name: { de: 'Autosave', en: 'Autosave' }, wert: true },
        {
          art: 'zahl',
          id: 'autosaveMs',
          name: { de: 'Verzögerung', en: 'Delay' },
          wert: 1200,
          min: 300,
          max: 30000,
          haengtAn: 'autosave'
        },
        {
          art: 'auswahl',
          id: 'sprache',
          name: { de: 'Sprache', en: 'Language' },
          wert: 'de',
          optionen: [
            { id: 'de', name: { de: 'Deutsch', en: 'German' } },
            { id: 'en', name: { de: 'Englisch', en: 'English' } }
          ]
        },
        { art: 'satz', id: 'kiHinweis', hinweis: { de: 'Oben.', en: 'Above.' } }
      ]
    }
  ]
};

test('text nimmt die verlangte Sprache', () => {
  assert.equal(text({ de: 'Ja', en: 'Yes' }, 'de'), 'Ja');
  assert.equal(text({ de: 'Ja', en: 'Yes' }, 'en'), 'Yes');
});

test('alleFelder und feldMit finden ueber die Gruppen hinweg', () => {
  assert.equal(alleFelder(BEISPIEL).length, 4);
  assert.equal(feldMit(BEISPIEL, 'autosaveMs')?.art, 'zahl');
  assert.equal(feldMit(BEISPIEL, 'gibtesnicht'), undefined);
});

test('nur Felder mit Wert melden sich zurueck', () => {
  assert.equal(traegtWert(feldMit(BEISPIEL, 'autosave')), true);
  assert.equal(traegtWert(feldMit(BEISPIEL, 'kiHinweis')), false);
});

test('ein Feld haengt am Schalter darueber', () => {
  const ms = feldMit(BEISPIEL, 'autosaveMs');
  assert.equal(istBedienbar(BEISPIEL, ms), true);

  const aus = {
    ...BEISPIEL,
    gruppen: [
      {
        ...BEISPIEL.gruppen[0],
        felder: BEISPIEL.gruppen[0].felder.map((f) =>
          f.id === 'autosave' ? { ...f, wert: false } : f
        )
      }
    ]
  };
  assert.equal(istBedienbar(aus, feldMit(aus, 'autosaveMs')), false);
});

test('ein Feld ohne Anker bleibt bedienbar', () => {
  assert.equal(istBedienbar(BEISPIEL, feldMit(BEISPIEL, 'autosave')), true);
  // Auch wenn der Anker gar nicht existiert: lieber bedienbar als
  // unerreichbar.
  const kaputt = {
    appId: 'x',
    gruppen: [
      {
        id: 'g',
        name: { de: 'G', en: 'G' },
        felder: [
          { art: 'schalter', id: 'a', name: { de: 'A', en: 'A' }, wert: true, haengtAn: 'fehlt' }
        ]
      }
    ]
  };
  assert.equal(istBedienbar(kaputt, feldMit(kaputt, 'a')), true);
});

test('eine Zahl wird in ihre Grenzen gezogen', () => {
  const ms = feldMit(BEISPIEL, 'autosaveMs');
  assert.equal(pruefeWert(ms, 5000), 5000);
  assert.equal(pruefeWert(ms, 10), 300);
  assert.equal(pruefeWert(ms, 999999), 30000);
  // Die Oberflaeche schickt Text; ein leeres Zahlenfeld schickt "".
  assert.equal(pruefeWert(ms, '2000'), 2000);
  assert.equal(pruefeWert(ms, ''), null);
  assert.equal(pruefeWert(ms, 'viel'), null);
});

test('eine Auswahl nimmt nur ihre eigenen Optionen', () => {
  const sprache = feldMit(BEISPIEL, 'sprache');
  assert.equal(pruefeWert(sprache, 'en'), 'en');
  assert.equal(pruefeWert(sprache, 'fr'), null);
});

test('ein Schalter nimmt nur ja und nein', () => {
  const schalter = feldMit(BEISPIEL, 'autosave');
  assert.equal(pruefeWert(schalter, false), false);
  assert.equal(pruefeWert(schalter, 'false'), null);
});

test('Felder ohne Wert nehmen nichts an', () => {
  assert.equal(pruefeWert(feldMit(BEISPIEL, 'kiHinweis'), 'irgendwas'), null);
});
