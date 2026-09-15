import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

const VORGABEN = { umfang: 'bogen', region: '', thema: '', tonfall: '' };

test('die Systemanweisung gibt es in beiden Sprachen und sie verlangt JSON', () => {
  for (const sprache of ['de', 'en']) {
    const anweisung = T.systemAnweisung(sprache);
    assert.ok(anweisung.length > 200, sprache);
    assert.match(anweisung, /JSON/);
    assert.ok(anweisung.includes(String(T.MAX_ZEICHEN)), 'die Laengengrenze steht drin');
  }
  assert.notEqual(T.systemAnweisung('de'), T.systemAnweisung('en'));
});

test('jede Aufgabe nennt ihre Schluessel in der Anfrage', () => {
  // Ein Schluessel, der nicht in der Anfrage steht, kommt auch nicht zurueck —
  // und die Auswertung wirft die halbe Antwort weg, ohne dass jemand sieht,
  // warum.
  for (const aufgabe of T.KI_AUFGABEN) {
    const text = T.anweisung({ aufgabe, vorgaben: VORGABEN, entwurf: null }, 'de');
    for (const feld of T.FELDER[aufgabe]) {
      assert.ok(text.includes(`"${feld}"`), `${aufgabe}: ${feld} fehlt in der Anfrage`);
    }
  }
});

test('freier Text aus den Reglern geht woertlich mit', () => {
  // Der eine Punkt, an dem die KI mehr kann als die Tabellen: „Schwebende
  // Inseln" findet in keiner Tabelle eine Marke.
  const text = T.anweisung(
    {
      aufgabe: 'ort',
      vorgaben: { umfang: 'abend', region: 'Schwebende Inseln', thema: 'Erbe', tonfall: 'heiter' },
      entwurf: null
    },
    'de'
  );
  assert.match(text, /Schwebende Inseln/);
  assert.match(text, /Erbe/);
  assert.match(text, /heiter/);
});

test('leere Regler stehen nicht als leere Zeile in der Anfrage', () => {
  const text = T.anweisung({ aufgabe: 'ort', vorgaben: VORGABEN, entwurf: null }, 'de');
  assert.ok(!text.includes('Region:'), text);
  assert.ok(!text.includes('Thema:'));
});

test('der bestehende Entwurf geht als Umgebung mit', () => {
  // Sonst schlaegt das Modell etwas vor, das zu irgendeiner Welt passt, nur
  // nicht zu der, die schon dasteht.
  const entwurf = T.erzeugeEntwurf(T.STANDARD_ZUSCHNITT, 'de', Math.random);
  const text = T.anweisung({ aufgabe: 'figur', vorgaben: VORGABEN, entwurf }, 'de');
  assert.ok(text.includes(entwurf.fraktionen[0].name));
  assert.ok(text.includes(entwurf.figuren[0].name));
  assert.ok(text.includes(entwurf.orte[0].name));
  assert.ok(text.includes(entwurf.aufhaenger.ausloeser));
});

test('bei einer Verbindung stehen beide Namen und ihre Reihenfolge drin', () => {
  const text = T.anweisung(
    { aufgabe: 'verbindung', vorgaben: VORGABEN, entwurf: null, namen: ['Mara Rabenstein', 'Halvard Salzfurt'] },
    'de'
  );
  assert.match(text, /Mara Rabenstein/);
  assert.match(text, /Halvard Salzfurt/);
  assert.ok(text.indexOf('Mara Rabenstein') < text.indexOf('Halvard Salzfurt'));
});

test('der Zeitstrahl bekommt die Zeitmarken des Umfangs vorgegeben', () => {
  // Die Marken kommen aus der Tabelle, nur die Ereignisse vom Modell. Sonst
  // erfindet es eigene Zeitangaben, und die Liste passt nicht mehr zum Regler.
  const text = T.anweisung(
    { aufgabe: 'zeitstrahl', vorgaben: { ...VORGABEN, umfang: 'abend' }, entwurf: null },
    'de'
  );
  for (const marke of T.ZEITMARKEN.abend.slice(0, T.MENGEN.abend.schritte)) {
    assert.ok(text.includes(marke.de), marke.de);
  }
});

test('eine vollstaendige Antwort wird uebernommen und gekuerzt', () => {
  const lang = 'x'.repeat(400);
  const gelesen = T.uebernehmbar('ort', {
    name: ' Rabenstein ',
    art: 'eine Mühle',
    merkmal: 'Es gibt keinen Spiegel.',
    zustand: 'Sie steht still.',
    karte: lang,
    unbekannt: 'weg damit'
  });
  assert.equal(gelesen.name, 'Rabenstein');
  assert.equal(gelesen.karte.length, T.MAX_ZEICHEN);
  assert.equal('unbekannt' in gelesen, false);
});

test('Zeilenumbrueche in einem Feld werden zu Leerzeichen', () => {
  // Die Felder sind einzeilig. Ein Umbruch darin waere in der Oberflaeche
  // unsichtbar und stuende trotzdem im Export.
  const gelesen = T.uebernehmbar('verbindung', {
    muster: 'Alte\nRechnung',
    hin: 'A wartet.',
    zurueck: 'B hat es vergessen.'
  });
  assert.equal(gelesen.muster, 'Alte Rechnung');
});

test('eine halbe Antwort gilt als misslungen', () => {
  // Ein halb gefuellter Baustein saehe aus wie ein Fehler in der Anwendung.
  assert.equal(T.uebernehmbar('figur', { name: 'Mara', rolle: 'Gegenseite' }), null);
  assert.equal(T.uebernehmbar('figur', null), null);
  assert.equal(T.uebernehmbar('figur', 'Mara ist die Gegenseite.'), null);
  assert.equal(T.uebernehmbar('ort', { name: 'X', art: '', merkmal: 'a', zustand: 'b', karte: 'c' }), null);
});

test('nur die Frist darf leer bleiben', () => {
  // Wie beim Wuerfeln: nicht jede Sache hat eine Uhr, und eine erfundene
  // Frist waere schlimmer als keine.
  const ohne = T.uebernehmbar('aufhaenger', {
    ausloeser: 'Das Zollhaus ist abgebrannt.',
    betroffene: 'Die Hafenmeisterin fragt.',
    komplikation: 'Nur: der Zeuge ist tot.',
    frist: ''
  });
  assert.equal(ohne.frist, '');
  assert.equal(ohne.ausloeser, 'Das Zollhaus ist abgebrannt.');
});

test('der Zeitstrahl kommt als Liste zurueck, auch ohne Umschlag', () => {
  assert.deepEqual(T.uebernehmbar('zeitstrahl', { schritte: ['A.', ' B. '] }), ['A.', 'B.']);
  // Manche Modelle schicken die nackte Liste. Das ist keine Fehlbedienung des
  // Nutzers, also wird es gelesen statt abgewiesen.
  assert.deepEqual(T.uebernehmbar('zeitstrahl', ['A.', 'B.']), ['A.', 'B.']);
  assert.equal(T.uebernehmbar('zeitstrahl', { schritte: [] }), null);
  assert.equal(T.uebernehmbar('zeitstrahl', { schritte: 'A.' }), null);
});

test('englisch gefragt heisst englisch geantwortet', () => {
  const text = T.anweisung({ aufgabe: 'figur', vorgaben: VORGABEN, entwurf: null }, 'en');
  assert.match(text, /in English/);
  assert.ok(!text.includes('auf Deutsch'));
});
