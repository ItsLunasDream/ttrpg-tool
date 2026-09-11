import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { schreibeBegegnung, leseBegegnung, zuId, istGueltigeId, neuerTeilnehmer } = entry;

function begegnung(ueberschreiben = {}) {
  return {
    schemaVersion: 1,
    id: 'hoehle',
    name: 'Die Höhle',
    teilnehmer: [{ ...neuerTeilnehmer('Goblin'), initiative: 12 }],
    taktik: 'Sie greifen von hinten an.',
    ...ueberschreiben
  };
}

test('geschrieben und wieder gelesen kommt dasselbe heraus', () => {
  const vorher = begegnung();
  const nachher = leseBegegnung(schreibeBegegnung(vorher), 'ersatz');
  assert.equal(nachher.id, vorher.id);
  assert.equal(nachher.name, vorher.name);
  assert.equal(nachher.taktik, vorher.taktik);
  assert.equal(nachher.teilnehmer.length, 1);
  assert.equal(nachher.teilnehmer[0].name, 'Goblin');
  assert.equal(nachher.teilnehmer[0].initiative, 12);
});

test('der Rumpf bleibt lesbar und traegt die Taktik', () => {
  const text = schreibeBegegnung(begegnung({ taktik: '# Plan\n\nErst reden.' }));
  assert.ok(text.includes('# Plan'), 'die Taktik steht als Markdown im Rumpf');
  assert.ok(text.startsWith('---\n'), 'der Kopf steht oben');
});

test('eine Begegnung ohne Taktik ergibt kein Leerzeug', () => {
  const text = schreibeBegegnung(begegnung({ taktik: '' }));
  assert.equal(leseBegegnung(text, 'x').taktik, '');
});

// Am Spieltisch ist eine Datei, die sich wegen eines Tippfehlers gar nicht
// mehr oeffnen laesst, das Schlimmste, was passieren kann.
test('eine kaputte Datei blockiert nicht, sondern liefert Brauchbares', () => {
  const kaputt = '---\nid: nicht json\nteilnehmer: [[[\n---\nText';
  const gelesen = leseBegegnung(kaputt, 'ersatz-id');
  assert.equal(gelesen.id, 'ersatz-id', 'die ungueltige ID wird ersetzt');
  assert.deepEqual(gelesen.teilnehmer, [], 'kaputte Teilnehmer werden verworfen');
  assert.equal(gelesen.taktik, 'Text', 'der Rumpf bleibt erhalten');
});

test('eine Datei ganz ohne Kopf ist Taktik', () => {
  const gelesen = leseBegegnung('Nur Notizen, kein Kopf.', 'x');
  assert.equal(gelesen.taktik, 'Nur Notizen, kein Kopf.');
  assert.equal(gelesen.id, 'x');
});

test('von Hand geaenderte Werte ohne Anfuehrungszeichen werden gelesen', () => {
  const gelesen = leseBegegnung('---\nid: hoehle\nname: Die Hoehle\n---\n', 'x');
  assert.equal(gelesen.id, 'hoehle');
  assert.equal(gelesen.name, 'Die Hoehle');
});

test('Teilnehmer ohne Koerper bekommen einen, sonst waeren sie unsichtbar', () => {
  const text = '---\nid: a\nteilnehmer: [{"id":"t1","name":"X","koerper":[]}]\n---\n';
  const gelesen = leseBegegnung(text, 'a');
  assert.equal(gelesen.teilnehmer[0].koerper.length, 1);
});

test('Trefferpunkte ueber dem Maximum werden beschnitten', () => {
  const text = '---\nid: a\nteilnehmer: [{"id":"t1","name":"X","koerper":[{"id":"k","hp":99,"hpMax":10}]}]\n---\n';
  const gelesen = leseBegegnung(text, 'a');
  assert.equal(gelesen.teilnehmer[0].koerper[0].hp, 10);
});

test('Zustaende ohne Namen fallen weg', () => {
  const text = '---\nid: a\nteilnehmer: [{"id":"t1","name":"X","zustaende":[{"id":"z","name":""},{"id":"z2","name":"Gift","rundenRest":3}]}]\n---\n';
  const gelesen = leseBegegnung(text, 'a');
  assert.equal(gelesen.teilnehmer[0].zustaende.length, 1);
  assert.equal(gelesen.teilnehmer[0].zustaende[0].name, 'Gift');
});

test('Begegnungen von vor den drei Zeitpunkten werden richtig gelesen', () => {
  /*
   * Frueher gab es nur einen Rundenzaehler, und der lief am Ende des eigenen
   * Zuges herunter — genau das heisst heute 'zugEnde'. Ohne Zaehler lief ein
   * Zustand, bis ihn jemand wegnahm: 'offen'.
   *
   * Waere das falsch zugeordnet, aenderte sich still das Verhalten
   * gespeicherter Begegnungen, und niemand kaeme auf die Idee, dort zu
   * suchen.
   */
  const text =
    '---\nid: a\nteilnehmer: [{"id":"t1","name":"X","zustaende":[' +
    '{"id":"z1","name":"Gift","rundenRest":3},' +
    '{"id":"z2","name":"Verflucht"}]}]\n---\n';
  const gelesen = leseBegegnung(text, 'a');
  const [gift, fluch] = gelesen.teilnehmer[0].zustaende;

  assert.equal(gift.dauer, 'zugEnde');
  assert.equal(gift.rundenRest, 3);
  assert.equal(gift.frisch, false, 'geladen wird nie mitten im eigenen Zug');

  assert.equal(fluch.dauer, 'offen');
  assert.equal(fluch.rundenRest, null);
});

test('Ein Zustand mit Zeitpunkt, aber ohne Zaehler, laeuft einmal', () => {
  // "bis zum Ende deines naechsten Zuges" ist einmal, nicht null Mal.
  const text =
    '---\nid: a\nteilnehmer: [{"id":"t1","name":"X","zustaende":[' +
    '{"id":"z1","name":"Gebannt","dauer":"rundeEnde"}]}]\n---\n';
  const gelesen = leseBegegnung(text, 'a');
  assert.equal(gelesen.teilnehmer[0].zustaende[0].rundenRest, 1);
});

test('Ein unbekannter Zeitpunkt faellt zurueck, statt die Datei zu verlieren', () => {
  const text =
    '---\nid: a\nteilnehmer: [{"id":"t1","name":"X","zustaende":[' +
    '{"id":"z1","name":"Seltsam","dauer":"irgendwann","rundenRest":2}]}]\n---\n';
  const gelesen = leseBegegnung(text, 'a');
  assert.equal(gelesen.teilnehmer[0].zustaende[0].dauer, 'zugEnde');
});

test('zuId macht aus Namen gueltige Dateinamen', () => {
  assert.equal(zuId('Die Höhle der Goblins'), 'die-hoehle-der-goblins');
  assert.equal(zuId('Straße & Gasse!'), 'strasse-gasse');
  assert.ok(istGueltigeId(zuId('Die Höhle')));
});

// Ein leerer Name darf keine leere ID ergeben: die waere ein Dateiname aus
// nichts.
test('ein leerer Name ergibt trotzdem eine gueltige ID', () => {
  const id = zuId('   ');
  assert.ok(id.length > 0);
  assert.ok(istGueltigeId(id));
});

test('istGueltigeId weist Pfadtrenner und Punkte ab', () => {
  assert.equal(istGueltigeId('..'), false);
  assert.equal(istGueltigeId('a/b'), false);
  assert.equal(istGueltigeId('a b'), false);
  assert.equal(istGueltigeId('gut-1_2'), true);
});
