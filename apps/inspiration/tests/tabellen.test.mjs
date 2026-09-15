import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/**
 * Alle Tabellen an einer Stelle, damit die Pruefungen darunter keine
 * vergessen koennen. Wer eine neue Tabelle anlegt und hier nicht eintraegt,
 * faellt beim Zaehltest auf.
 */
const TABELLEN = {
  AUSLOESER: T.AUSLOESER,
  BETROFFENE: T.BETROFFENE,
  KOMPLIKATIONEN: T.KOMPLIKATIONEN,
  FRISTEN: T.FRISTEN,
  FRAKTION_FORM: T.FRAKTION_FORM,
  FRAKTION_ZUSATZ: T.FRAKTION_ZUSATZ,
  FRAKTION_ART: T.FRAKTION_ART,
  FRAKTION_ZIEL: T.FRAKTION_ZIEL,
  FRAKTION_MITTEL: T.FRAKTION_MITTEL,
  FRAKTION_SCHWAECHE: T.FRAKTION_SCHWAECHE,
  ROLLEN: T.ROLLEN,
  TRIEBFEDERN: T.TRIEBFEDERN,
  HEBEL: T.HEBEL,
  MAKEL: T.MAKEL,
  NAME_ERSTE: T.NAME_ERSTE,
  NAME_ZWEITE: T.NAME_ZWEITE,
  ORT_ART: T.ORT_ART,
  ORT_MERKMAL: T.ORT_MERKMAL,
  ORT_ZUSTAND: T.ORT_ZUSTAND,
  ORT_KARTE: T.ORT_KARTE,
  SCHRITTE: T.SCHRITTE,
  VERBINDUNGEN: T.VERBINDUNGEN
};

test('keine Tabelle ist leer, und keine ist heimlich kurz', () => {
  // Der ganze Zweck des Werkzeugs haengt an der Breite der Tabellen. Eine
  // Tabelle mit fuenf Eintraegen faellt am Spieltisch sofort auf.
  for (const [name, liste] of Object.entries(TABELLEN)) {
    assert.ok(Array.isArray(liste), `${name} fehlt`);
    assert.ok(liste.length >= 15, `${name} hat nur ${liste.length} Eintraege`);
  }
});

test('jeder Eintrag steht in beiden Sprachen da', () => {
  for (const [name, liste] of Object.entries(TABELLEN)) {
    liste.forEach((eintrag, i) => {
      assert.ok(eintrag.de && eintrag.de.trim().length > 0, `${name}[${i}] ohne Deutsch`);
      assert.ok(eintrag.en && eintrag.en.trim().length > 0, `${name}[${i}] ohne Englisch`);
    });
  }
});

test('kein Eintrag steht zweimal in derselben Tabelle', () => {
  // Doppelte Eintraege verschieben die Wahrscheinlichkeit still und leise und
  // sind beim Lesen kaum zu sehen.
  for (const [name, liste] of Object.entries(TABELLEN)) {
    const deutsch = liste.map((eintrag) => eintrag.de);
    assert.equal(new Set(deutsch).size, deutsch.length, `${name} enthaelt eine Doppelung`);
    const englisch = liste.map((eintrag) => eintrag.en);
    assert.equal(new Set(englisch).size, englisch.length, `${name} enthaelt eine Doppelung (en)`);
  }
});

test('deutsche und englische Fassung sind nicht dieselbe Zeichenkette', () => {
  // Ausnahme: Namensteile, die in beiden Sprachen gleich heissen (Winter,
  // Frost, Gold, Storm ...). Bei ganzen Saetzen waere Gleichheit ein
  // vergessener Uebersetzungsschritt.
  const ausgenommen = new Set(['NAME_ERSTE', 'NAME_ZWEITE']);
  for (const [name, liste] of Object.entries(TABELLEN)) {
    if (ausgenommen.has(name)) continue;
    for (const eintrag of liste) {
      assert.notEqual(eintrag.de, eintrag.en, `${name}: "${eintrag.de}" ist nicht uebersetzt`);
    }
  }
});

test('alle Marken sind bekannte Regionen, Themen und Tonfaelle', () => {
  // Ein Tippfehler in einer Marke faellt sonst nie auf: der Eintrag wird
  // einfach nie gezogen, wenn jemand die Region einstellt.
  const regionen = new Set(T.REGIONEN);
  const themen = new Set(T.THEMEN);
  const tonfall = new Set(T.TONFALL);
  for (const [name, liste] of Object.entries(TABELLEN)) {
    for (const eintrag of liste) {
      for (const marke of eintrag.regionen ?? []) {
        assert.ok(regionen.has(marke), `${name}: unbekannte Region "${marke}"`);
      }
      for (const marke of eintrag.themen ?? []) {
        assert.ok(themen.has(marke), `${name}: unbekanntes Thema "${marke}"`);
      }
      for (const marke of eintrag.tonfall ?? []) {
        assert.ok(tonfall.has(marke), `${name}: unbekannter Tonfall "${marke}"`);
      }
    }
  }
});

test('zu jeder Region bleibt genug uebrig, ohne dass der Filter aufgibt', () => {
  // Der Punkt der Marken: enger werden, aber nicht leerlaufen. Faellt
  // `passend` auf die ganze Tabelle zurueck, war die Region wirkungslos.
  for (const region of T.REGIONEN) {
    const zuschnitt = { ...T.STANDARD_ZUSCHNITT, region };
    const gefiltert = T.passend(T.ORT_ART, zuschnitt);
    assert.ok(
      gefiltert.length >= T.MINDESTAUSWAHL,
      `Region ${region}: nur ${gefiltert.length} Orte`
    );
    assert.ok(gefiltert.length < T.ORT_ART.length, `Region ${region} filtert gar nicht`);
  }
});

test('zu jedem Thema bleibt genug uebrig', () => {
  for (const thema of T.THEMEN) {
    const zuschnitt = { ...T.STANDARD_ZUSCHNITT, thema };
    const gefiltert = T.passend(T.AUSLOESER, zuschnitt);
    assert.ok(
      gefiltert.length >= T.MINDESTAUSWAHL,
      `Thema ${thema}: nur ${gefiltert.length} Ausloeser`
    );
  }
});

test('ein Eintrag mit passender Marke ist nach dem Filtern noch dabei', () => {
  // Gegenprobe zum Test darueber: „genug uebrig" waere auch erfuellt, wenn
  // der Filter alles Markierte wegwuerfe und nur Unmarkiertes uebrig liesse.
  const zuschnitt = { ...T.STANDARD_ZUSCHNITT, region: 'unterreich' };
  const gefiltert = T.passend(T.ORT_ART, zuschnitt);
  assert.ok(gefiltert.some((eintrag) => (eintrag.regionen ?? []).includes('unterreich')));
  assert.ok(!gefiltert.some((eintrag) => (eintrag.regionen ?? []).includes('hafen') && !(eintrag.regionen ?? []).includes('unterreich')));
});

test('ohne Zuschnitt steht die ganze Tabelle zur Verfuegung', () => {
  assert.equal(T.passend(T.ORT_ART, T.STANDARD_ZUSCHNITT).length, T.ORT_ART.length);
});

test('ein unbekannter freier Text filtert nichts weg', () => {
  // Region und Thema sind freie Felder mit Vorschlagsliste. Wer „Schwebende
  // Inseln" eintraegt, soll ein volles Werkzeug bekommen und keine Fehler.
  const zuschnitt = { ...T.STANDARD_ZUSCHNITT, region: 'Schwebende Inseln' };
  assert.equal(T.passend(T.ORT_ART, zuschnitt).length, T.ORT_ART.length);
});

test('jeder Umfang hat Zeitmarken fuer alle seine Schritte', () => {
  for (const umfang of T.UMFAENGE) {
    assert.ok(
      T.ZEITMARKEN[umfang].length >= T.MENGEN[umfang].schritte,
      `${umfang}: zu wenige Zeitmarken`
    );
  }
});

test('die Zeitstrahl-Schritte decken alle drei Stufen ab', () => {
  for (const stufe of [1, 2, 3]) {
    const anzahl = T.SCHRITTE.filter((schritt) => schritt.stufe === stufe).length;
    assert.ok(anzahl >= 10, `Stufe ${stufe} hat nur ${anzahl} Schritte`);
  }
});

test('jedes Verbindungsmuster nennt beide Figuren', () => {
  for (const muster of T.VERBINDUNGEN) {
    const beide = `${muster.hin.de} ${muster.zurueck.de}`;
    assert.ok(beide.includes('{a}'), `${muster.de}: {a} fehlt`);
    assert.ok(beide.includes('{b}'), `${muster.de}: {b} fehlt`);
    const beideEn = `${muster.hin.en} ${muster.zurueck.en}`;
    assert.ok(beideEn.includes('{a}') && beideEn.includes('{b}'), `${muster.de}: Platzhalter fehlen (en)`);
  }
});

test('jede Marke hat eine Beschriftung in beiden Sprachen', () => {
  const paare = [
    ['REGION_TEXTE', T.REGIONEN, T.REGION_TEXTE],
    ['THEMA_TEXTE', T.THEMEN, T.THEMA_TEXTE],
    ['TONFALL_TEXTE', T.TONFALL, T.TONFALL_TEXTE],
    ['UMFANG_TEXTE', T.UMFAENGE, T.UMFANG_TEXTE]
  ];
  for (const [name, ids, texte] of paare) {
    for (const id of ids) {
      assert.ok(texte[id], `${name}: ${id} fehlt`);
      assert.ok(texte[id].de && texte[id].en, `${name}: ${id} unvollstaendig`);
    }
    assert.equal(Object.keys(texte).length, ids.length, `${name} hat einen Eintrag zu viel`);
  }
});

test('getippter Text wird zur Marke, in beiden Sprachen', () => {
  // Der Regler ist ein freies Feld mit Vorschlagsliste. Wer auf Englisch
  // arbeitet und „Hafen" tippt, hat sich nicht vertan.
  assert.equal(T.alsRegionId('Hafen'), 'hafen');
  assert.equal(T.alsRegionId('harbour'), 'hafen');
  assert.equal(T.alsRegionId('  UNTERREICH '), 'unterreich');
  assert.equal(T.alsThemaId('Betrayal'), 'verrat');
  assert.equal(T.alsTonfallId('düster'), 'duester');
  // Freier Text bleibt frei und filtert nichts.
  assert.equal(T.alsRegionId('Schwebende Inseln'), '');
  assert.equal(T.alsRegionId(''), '');
});
