import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {
  leererKampf, neuerTeilnehmer, reihenfolge, beginne, naechsterZug, aendereHp,
  setzeHp, dupliziere, naechsterName, setzeGruppengroesse, setzeZustand,
  entferneTeilnehmer, fuegeEin, neueId, istAktiv
} = entry;

/** Baut einen Kampf aus [name, initiative, hpMax]-Tripeln. */
function kampfMit(...eintraege) {
  const teilnehmer = eintraege.map(([name, initiative, hpMax = 10]) => {
    const t = neuerTeilnehmer(name);
    return {
      ...t,
      initiative,
      koerper: [{ ...t.koerper[0], hp: hpMax, hpMax }]
    };
  });
  return { ...leererKampf(), teilnehmer };
}

const namen = (kampf) => kampf.teilnehmer.map((t) => t.name);
const dran = (kampf) => kampf.teilnehmer[kampf.amZug]?.name;

// --- Reihenfolge -----------------------------------------------------------

test('sortiert nach Initiative, hoechste zuerst', () => {
  const kampf = kampfMit(['Klein', 5], ['Gross', 20], ['Mitte', 12]);
  assert.deepEqual(reihenfolge(kampf.teilnehmer).map((t) => t.name), ['Gross', 'Mitte', 'Klein']);
});

test('bei Gleichstand entscheidet der Feinwert', () => {
  const kampf = kampfMit(['Langsam', 15], ['Flink', 15]);
  const mitFein = kampf.teilnehmer.map((t) => (t.name === 'Flink' ? { ...t, feinwert: 3 } : t));
  assert.deepEqual(reihenfolge(mitFein).map((t) => t.name), ['Flink', 'Langsam']);
});

// Eine Sortierung nach Namen saehe ordentlich aus und waere falsch: die
// Reihenfolge duerfte sich beim Umbenennen mitten im Kampf nicht aendern.
test('bei voelligem Gleichstand gilt die Reihenfolge des Eintragens', () => {
  const kampf = kampfMit(['Zebra', 10], ['Adler', 10]);
  assert.deepEqual(reihenfolge(kampf.teilnehmer).map((t) => t.name), ['Zebra', 'Adler']);
});

// --- Zugfolge --------------------------------------------------------------

test('der Kampf beginnt sortiert bei Runde 1', () => {
  const kampf = beginne(kampfMit(['A', 5], ['B', 20]));
  assert.equal(dran(kampf), 'B');
  assert.equal(kampf.runde, 1);
  assert.equal(kampf.laeuft, true);
});

test('nach dem letzten Zug beginnt die naechste Runde', () => {
  let kampf = beginne(kampfMit(['A', 20], ['B', 10]));
  kampf = naechsterZug(kampf);
  assert.equal(dran(kampf), 'B');
  assert.equal(kampf.runde, 1);
  kampf = naechsterZug(kampf);
  assert.equal(dran(kampf), 'A');
  assert.equal(kampf.runde, 2, 'die Runde muss hochzaehlen');
});

test('wer bei 0 Trefferpunkten liegt, wird uebersprungen', () => {
  let kampf = beginne(kampfMit(['A', 30], ['B', 20], ['C', 10]));
  const b = kampf.teilnehmer[1];
  kampf = setzeHp(kampf, b.id, b.koerper[0].id, 0);
  kampf = naechsterZug(kampf);
  assert.equal(dran(kampf), 'C', 'B liegt und ist nicht dran');
});

// Ohne diese Grenze drehte sich der Zeiger im Kreis, wenn alle liegen — und
// die Rundenzahl liefe still ins Unendliche.
test('liegen alle, bleibt der Zeiger stehen', () => {
  let kampf = beginne(kampfMit(['A', 20], ['B', 10]));
  for (const t of kampf.teilnehmer) kampf = setzeHp(kampf, t.id, t.koerper[0].id, 0);
  const vorher = { amZug: kampf.amZug, runde: kampf.runde };
  kampf = naechsterZug(kampf);
  assert.equal(kampf.amZug, vorher.amZug);
  assert.equal(kampf.runde, vorher.runde);
});

// --- Trefferpunkte ---------------------------------------------------------

test('Schaden geht zuerst an die zeitweiligen Trefferpunkte', () => {
  let kampf = kampfMit(['A', 10, 20]);
  const t = kampf.teilnehmer[0];
  kampf = { ...kampf, teilnehmer: [{ ...t, koerper: [{ ...t.koerper[0], tempHp: 5 }] }] };
  kampf = aendereHp(kampf, t.id, t.koerper[0].id, 8);
  assert.equal(kampf.teilnehmer[0].koerper[0].tempHp, 0);
  assert.equal(kampf.teilnehmer[0].koerper[0].hp, 17, '20 minus (8 minus 5)');
});

test('Trefferpunkte fallen nicht unter null und Heilung nicht ueber das Maximum', () => {
  let kampf = kampfMit(['A', 10, 10]);
  const t = kampf.teilnehmer[0];
  kampf = aendereHp(kampf, t.id, t.koerper[0].id, 999);
  assert.equal(kampf.teilnehmer[0].koerper[0].hp, 0);
  kampf = aendereHp(kampf, t.id, t.koerper[0].id, -999);
  assert.equal(kampf.teilnehmer[0].koerper[0].hp, 10);
});

// --- Gruppen ---------------------------------------------------------------

test('eine Gruppe hat eine Initiative und mehrere Trefferpunktsaetze', () => {
  let kampf = kampfMit(['Goblins', 12, 7]);
  const id = kampf.teilnehmer[0].id;
  kampf = setzeGruppengroesse(kampf, id, 4);
  const gruppe = kampf.teilnehmer[0];
  assert.equal(gruppe.koerper.length, 4);
  assert.deepEqual(gruppe.koerper.map((k) => k.marke), ['1', '2', '3', '4']);
  assert.ok(gruppe.koerper.every((k) => k.hpMax === 7));
  assert.equal(gruppe.initiative, 12, 'die Gruppe behaelt ihre eine Initiative');
});

test('Schaden trifft genau einen Koerper der Gruppe', () => {
  let kampf = setzeGruppengroesse(kampfMit(['Goblins', 12, 7]), kampfMit(['Goblins', 12, 7]).teilnehmer[0].id, 3);
  // Neu aufbauen, damit die IDs stimmen:
  kampf = kampfMit(['Goblins', 12, 7]);
  const id = kampf.teilnehmer[0].id;
  kampf = setzeGruppengroesse(kampf, id, 3);
  const zweiter = kampf.teilnehmer[0].koerper[1];
  kampf = aendereHp(kampf, id, zweiter.id, 5);
  const hp = kampf.teilnehmer[0].koerper.map((k) => k.hp);
  assert.deepEqual(hp, [7, 2, 7]);
});

test('beim Verkleinern auf eins faellt die Marke weg', () => {
  let kampf = kampfMit(['Goblin', 12, 7]);
  const id = kampf.teilnehmer[0].id;
  kampf = setzeGruppengroesse(kampf, id, 4);
  kampf = setzeGruppengroesse(kampf, id, 1);
  assert.equal(kampf.teilnehmer[0].koerper.length, 1);
  assert.equal(kampf.teilnehmer[0].koerper[0].marke, '');
});

// --- Duplizieren -----------------------------------------------------------

test('der Zwilling steht direkt hinter dem Vorbild und hat eigene IDs', () => {
  let kampf = kampfMit(['Ork', 12], ['Held', 18]);
  const orkId = kampf.teilnehmer[0].id;
  kampf = dupliziere(kampf, orkId);
  assert.deepEqual(namen(kampf), ['Ork', 'Ork 2', 'Held']);
  assert.notEqual(kampf.teilnehmer[1].id, orkId);
  assert.notEqual(kampf.teilnehmer[1].koerper[0].id, kampf.teilnehmer[0].koerper[0].id);
});

// Ohne eigene Koerper-IDs traefe Schaden beide zugleich — und *das* faellt am
// Tisch erst auf, wenn zwei Gegner gleichzeitig umfallen.
test('Schaden am Zwilling laesst das Vorbild unberuehrt', () => {
  let kampf = kampfMit(['Ork', 12, 15]);
  kampf = dupliziere(kampf, kampf.teilnehmer[0].id);
  const zwilling = kampf.teilnehmer[1];
  kampf = aendereHp(kampf, zwilling.id, zwilling.koerper[0].id, 10);
  assert.equal(kampf.teilnehmer[0].koerper[0].hp, 15, 'das Vorbild muss unversehrt sein');
  assert.equal(kampf.teilnehmer[1].koerper[0].hp, 5);
});

test('der Zwilling ist unverletzt, auch wenn das Vorbild angeschlagen ist', () => {
  let kampf = kampfMit(['Ork', 12, 15]);
  const id = kampf.teilnehmer[0].id;
  kampf = aendereHp(kampf, id, kampf.teilnehmer[0].koerper[0].id, 12);
  kampf = dupliziere(kampf, id);
  assert.equal(kampf.teilnehmer[1].koerper[0].hp, 15);
});

test('naechsterName zaehlt hoch und ueberspringt Belegtes', () => {
  const vorhandene = [neuerTeilnehmer('Ork'), neuerTeilnehmer('Ork 2')];
  assert.equal(naechsterName('Ork', vorhandene), 'Ork 3');
  assert.equal(naechsterName('Ork 2', vorhandene), 'Ork 3');
});

test('Duplizieren verschiebt den Zeiger nicht auf den Falschen', () => {
  let kampf = beginne(kampfMit(['A', 30], ['B', 20], ['C', 10]));
  kampf = naechsterZug(kampf); // B ist dran
  assert.equal(dran(kampf), 'B');
  kampf = dupliziere(kampf, kampf.teilnehmer[0].id); // A duplizieren, vor B
  assert.equal(dran(kampf), 'B', 'der Zeiger muss mitrutschen');
});

// --- Zustaende -------------------------------------------------------------

test('Zustaende zaehlen am Ende des eigenen Zuges herunter und laufen ab', () => {
  let kampf = beginne(kampfMit(['A', 20], ['B', 10]));
  const a = kampf.teilnehmer[0];
  kampf = setzeZustand(kampf, a.id, { id: neueId(), name: 'Gelaehmt', rundenRest: 2 });
  kampf = naechsterZug(kampf); // As Zug endet
  assert.equal(kampf.teilnehmer[0].zustaende[0].rundenRest, 1);
  kampf = naechsterZug(kampf); // B
  kampf = naechsterZug(kampf); // As Zug endet erneut
  assert.equal(kampf.teilnehmer[0].zustaende.length, 0, 'abgelaufen und weg');
});

test('Zustaende ohne Dauer bleiben stehen', () => {
  let kampf = beginne(kampfMit(['A', 20], ['B', 10]));
  const a = kampf.teilnehmer[0];
  kampf = setzeZustand(kampf, a.id, { id: neueId(), name: 'Verflucht', rundenRest: null });
  for (let i = 0; i < 6; i++) kampf = naechsterZug(kampf);
  assert.equal(kampf.teilnehmer.find((t) => t.id === a.id).zustaende.length, 1);
});

// --- Ein und Aus -----------------------------------------------------------

test('ein Nachzuegler landet an der richtigen Stelle der Reihenfolge', () => {
  let kampf = beginne(kampfMit(['A', 30], ['C', 10]));
  const spaet = { ...neuerTeilnehmer('B'), initiative: 20 };
  kampf = fuegeEin(kampf, spaet);
  assert.deepEqual(namen(kampf), ['A', 'B', 'C']);
  assert.equal(dran(kampf), 'A', 'wer dran war, bleibt dran');
});

test('wird ein Vordermann entfernt, bleibt der Zeiger auf demselben Teilnehmer', () => {
  let kampf = beginne(kampfMit(['A', 30], ['B', 20], ['C', 10]));
  kampf = naechsterZug(kampf);
  kampf = naechsterZug(kampf); // C ist dran
  assert.equal(dran(kampf), 'C');
  kampf = entferneTeilnehmer(kampf, kampf.teilnehmer[0].id); // A raus
  assert.equal(dran(kampf), 'C', 'der Zeiger muss nachziehen');
});

test('istAktiv erkennt liegende und ausgetragene Koerper', () => {
  const t = neuerTeilnehmer('X');
  assert.equal(istAktiv({ ...t, koerper: [{ ...t.koerper[0], hp: 3, hpMax: 3 }] }), true);
  assert.equal(istAktiv({ ...t, koerper: [{ ...t.koerper[0], hp: 0 }] }), false);
  assert.equal(istAktiv({ ...t, koerper: [{ ...t.koerper[0], hp: 3, raus: true }] }), false);
});
