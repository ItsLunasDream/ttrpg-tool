import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function wuerfelgeber(saat = 1) {
  let zustand = saat >>> 0;
  return () => {
    zustand += 0x6d2b79f5;
    let x = zustand;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const ZU = { ...T.STANDARD_ZUSCHNITT, umfang: 'abend' };

/** Eine vollstaendige Antwort, wie sie ein williges Modell schicken wuerde. */
function volleAntwort() {
  return {
    aufhaenger: {
      ausloeser: 'Die Glocke hat um Mitternacht geläutet.',
      betroffene: 'Der Küster bittet um Hilfe.',
      komplikation: 'Nur: der Turm steht leer.',
      frist: 'Bis zum Vollmond.'
    },
    fraktionen: [
      { name: 'Der Zirkel', art: 'eine Zunft', ziel: 'Das Läuten erklären.', mittel: 'Geld.', schwaeche: 'Alt.' },
      { name: 'Die Wacht', art: 'eine Garnison', ziel: 'Ruhe halten.', mittel: 'Gewalt.', schwaeche: 'Kein Sold.' }
    ],
    figuren: [
      { name: 'Mara Rabenstein', rolle: 'Auftraggebend', triebfeder: 'Will Ruhe.', hebel: 'Hat Schlüssel.', makel: 'Aber: lügt.' },
      { name: 'Halvard Salzfurt', rolle: 'Gegenseite', triebfeder: 'Will Geld.', hebel: 'Kennt den Turm.', makel: 'Aber: trinkt.' },
      { name: 'Edda Aschbrücke', rolle: 'Hat es gesehen', triebfeder: 'Will weg.', hebel: 'War dabei.', makel: 'Aber: schweigt.' }
    ],
    orte: [
      { name: 'Rabenstein', art: 'ein Turm', merkmal: 'Keine Tür.', zustand: 'Leer.', karte: 'Ein Eingang.' },
      { name: 'Salzfurt', art: 'eine Furt', merkmal: 'Tief.', zustand: 'Gesperrt.', karte: 'Zwei Ufer.' }
    ],
    verbindungen: [
      { a: 0, b: 1, muster: 'Alte Rechnung', hin: 'Mara wartet.', zurueck: 'Halvard hat es vergessen.' },
      { a: 1, b: 2, muster: 'Schuld', hin: 'Halvard schweigt.', zurueck: 'Edda weiß es.' }
    ],
    zeitstrahl: ['Es läutet wieder.', 'Jemand verschwindet.', 'Der Turm fällt.']
  };
}

test('eine vollstaendige Antwort wird eins zu eins uebernommen', () => {
  const roh = T.uebernehmbarerEntwurf(volleAntwort());
  assert.ok(roh);
  const entwurf = T.baueEntwurf(roh, null, ZU, 'de', wuerfelgeber(1));
  assert.equal(entwurf.aufhaenger.ausloeser, 'Die Glocke hat um Mitternacht geläutet.');
  assert.equal(entwurf.fraktionen.length, T.MENGEN.abend.fraktionen);
  assert.equal(entwurf.figuren[2].name, 'Edda Aschbrücke');
  assert.equal(entwurf.orte[0].name, 'Rabenstein');
  assert.equal(entwurf.verbindungen.length, 2);
  assert.equal(entwurf.zeitstrahl.length, T.MENGEN.abend.schritte);
  assert.equal(entwurf.zeitstrahl[0].was, 'Es läutet wieder.');
});

test('die Zeitmarken kommen aus der Tabelle, nicht vom Modell', () => {
  // Sonst erfindet es eigene Zeitangaben, und die Liste passt nicht mehr zum
  // eingestellten Umfang.
  const roh = T.uebernehmbarerEntwurf(volleAntwort());
  const entwurf = T.baueEntwurf(roh, null, ZU, 'de', wuerfelgeber(1));
  assert.deepEqual(
    entwurf.zeitstrahl.map((punkt) => punkt.marke),
    T.ZEITMARKEN.abend.slice(0, T.MENGEN.abend.schritte).map((paar) => paar.de)
  );
});

test('was fehlt, kommt aus den Tabellen', () => {
  // Der eigentliche Zweck dieser Datei: ein Modell, das zu wenig liefert,
  // darf kein halbes Geruest hinterlassen.
  const halb = { ...volleAntwort(), orte: [], figuren: volleAntwort().figuren.slice(0, 1), zeitstrahl: [] };
  const roh = T.uebernehmbarerEntwurf(halb);
  const entwurf = T.baueEntwurf(roh, null, ZU, 'de', wuerfelgeber(2));
  assert.equal(entwurf.orte.length, T.MENGEN.abend.orte);
  assert.equal(entwurf.figuren.length, T.MENGEN.abend.figuren);
  assert.equal(entwurf.zeitstrahl.length, T.MENGEN.abend.schritte);
  // Das Gelieferte steht vorn und bleibt unangetastet.
  assert.equal(entwurf.figuren[0].name, 'Mara Rabenstein');
  for (const ort of entwurf.orte) assert.ok(ort.name.length > 0);
});

test('was zu viel ist, faellt weg — der Umfang gilt', () => {
  const zuViel = {
    ...volleAntwort(),
    orte: [...volleAntwort().orte, ...volleAntwort().orte, ...volleAntwort().orte]
  };
  const roh = T.uebernehmbarerEntwurf(zuViel);
  const entwurf = T.baueEntwurf(roh, null, ZU, 'de', wuerfelgeber(3));
  assert.equal(entwurf.orte.length, T.MENGEN.abend.orte);
});

test('ein unvollstaendiges Stueck kostet nicht die ganze Antwort', () => {
  const luecke = volleAntwort();
  luecke.figuren[1] = { name: 'Ohne Rolle' };
  const roh = T.uebernehmbarerEntwurf(luecke);
  assert.equal(roh.figuren.length, 2);
  assert.equal(roh.figuren[1].name, 'Edda Aschbrücke');
});

test('eine Verbindung auf eine Figur, die es nicht gibt, wird verworfen', () => {
  // Im Bild waere das eine Linie ins Nichts, im Export ein Verweis ins Leere.
  const falsch = volleAntwort();
  falsch.verbindungen = [
    { a: 0, b: 9, muster: 'X', hin: 'a', zurueck: 'b' },
    { a: 2, b: 2, muster: 'Y', hin: 'a', zurueck: 'b' },
    { a: 0, b: 1, muster: 'Gut', hin: 'a', zurueck: 'b' }
  ];
  const roh = T.uebernehmbarerEntwurf(falsch);
  assert.equal(roh.verbindungen.length, 1);
  assert.equal(roh.verbindungen[0].muster, 'Gut');
});

test('ohne brauchbare Verbindungen kommen sie aus den Tabellen', () => {
  const ohne = { ...volleAntwort(), verbindungen: [] };
  const roh = T.uebernehmbarerEntwurf(ohne);
  const entwurf = T.baueEntwurf(roh, null, ZU, 'de', wuerfelgeber(4));
  assert.ok(entwurf.verbindungen.length > 0);
  const beteiligt = new Set();
  for (const verbindung of entwurf.verbindungen) {
    beteiligt.add(verbindung.a);
    beteiligt.add(verbindung.b);
  }
  assert.equal(beteiligt.size, entwurf.figuren.length, 'keine Figur ohne Anschluss');
});

test('ein festgehaltener Baustein ueberlebt die KI-Antwort', () => {
  // Das Modell weiss von den Schloessern (die Anfrage sagt es ihm), aber
  // verlassen kann man sich darauf nicht.
  const vorher = T.erzeugeEntwurf(ZU, 'de', wuerfelgeber(5));
  const roh = T.uebernehmbarerEntwurf(volleAntwort());
  const danach = T.baueEntwurf(roh, vorher, ZU, 'de', wuerfelgeber(6), ['aufhaenger', 'orte']);
  assert.deepEqual(danach.aufhaenger, vorher.aufhaenger);
  assert.deepEqual(danach.orte, vorher.orte);
  assert.equal(danach.figuren[0].name, 'Mara Rabenstein');
});

test('festgehaltene Figuren machen die gelieferten Verbindungen nicht ungueltig', () => {
  const vorher = T.erzeugeEntwurf({ ...ZU, umfang: 'kampagne' }, 'de', wuerfelgeber(7));
  const roh = T.uebernehmbarerEntwurf(volleAntwort());
  const danach = T.baueEntwurf(roh, vorher, { ...ZU, umfang: 'kampagne' }, 'de', wuerfelgeber(8), ['figuren']);
  assert.deepEqual(danach.figuren, vorher.figuren);
  for (const verbindung of danach.verbindungen) {
    assert.ok(verbindung.a < danach.figuren.length && verbindung.b < danach.figuren.length);
  }
});

test('eine leere Antwort gilt als misslungen', () => {
  assert.equal(T.uebernehmbarerEntwurf({}), null);
  assert.equal(T.uebernehmbarerEntwurf(null), null);
  assert.equal(T.uebernehmbarerEntwurf('Hier ist deine Kampagne!'), null);
  assert.equal(T.uebernehmbarerEntwurf({ fraktionen: [{ name: 'nur ein Name' }] }), null);
});

test('die Anfrage nennt die Mengen des eingestellten Umfangs', () => {
  const text = T.anweisung(
    {
      aufgabe: 'entwurf',
      vorgaben: { umfang: 'kampagne', region: '', thema: '', tonfall: '' },
      entwurf: null
    },
    'de'
  );
  const menge = T.MENGEN.kampagne;
  assert.ok(text.includes(`${menge.fraktionen} Fraktionen`), text);
  assert.ok(text.includes(`${menge.figuren} Figuren`));
  assert.ok(text.includes(`${menge.orte} Orte`));
  assert.ok(text.includes('"verbindungen"'));
});

test('die Anfrage sagt, was festgehalten ist', () => {
  const vorher = T.erzeugeEntwurf(ZU, 'de', wuerfelgeber(9));
  const text = T.anweisung(
    {
      aufgabe: 'entwurf',
      vorgaben: { umfang: 'abend', region: '', thema: '', tonfall: '' },
      entwurf: vorher,
      festgehalten: ['aufhaenger']
    },
    'de'
  );
  assert.match(text, /steht fest/);
  assert.match(text, /der Aufhänger/);
});
