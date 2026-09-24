/**
 * Der Knopf „Neue Begegnung" und seine Rueckfrage.
 *
 * Aus der Planung: „hier Warnung sollte der Kampf aktuell noch laufen oder
 * nicht gespeichert sein." Zwei Faelle also, und ein dritter, der genauso
 * wichtig ist: wo nichts auf dem Spiel steht, darf nicht gefragt werden.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function mitTeilnehmern(teil = {}) {
  return {
    ...T.leererKampf(),
    teilnehmer: [T.neuerTeilnehmer('Wolf'), T.neuerTeilnehmer('Bär')],
    ...teil
  };
}

function alsBegegnung(kampf, id = 'gespeichert') {
  return { schemaVersion: 1, id, name: id, taktik: '', teilnehmer: kampf.teilnehmer };
}

test('ein leerer Tracker fragt nicht', () => {
  const warnung = T.pruefeVerlust(T.leererKampf(), []);
  assert.equal(T.nichtsZuVerlieren(warnung), true);
});

test('ein leerer Tracker fragt auch dann nicht, wenn er formal laeuft', () => {
  const warnung = T.pruefeVerlust({ ...T.leererKampf(), laeuft: true }, []);
  assert.equal(T.nichtsZuVerlieren(warnung), true);
});

test('Teilnehmer ohne gespeicherte Begegnung: ungespeichert', () => {
  const warnung = T.pruefeVerlust(mitTeilnehmern(), []);
  assert.equal(warnung.ungespeichert, true);
  assert.equal(warnung.laeuft, false);
  assert.equal(T.nichtsZuVerlieren(warnung), false);
});

test('ein laufender Kampf wird als solcher gemeldet', () => {
  const kampf = mitTeilnehmern({ laeuft: true, begegnungId: 'gespeichert' });
  const warnung = T.pruefeVerlust(kampf, [alsBegegnung(kampf)]);
  assert.equal(warnung.laeuft, true);
  assert.equal(warnung.ungespeichert, false);
});

test('unveraendert gespeichert und nicht laufend: keine Rueckfrage', () => {
  const kampf = mitTeilnehmern({ begegnungId: 'gespeichert' });
  const warnung = T.pruefeVerlust(kampf, [alsBegegnung(kampf)]);
  assert.equal(T.nichtsZuVerlieren(warnung), true);
});

test('ein zusaetzlicher Teilnehmer macht die Aufstellung ungespeichert', () => {
  const kampf = mitTeilnehmern({ begegnungId: 'gespeichert' });
  const gespeichert = alsBegegnung(kampf);
  const erweitert = { ...kampf, teilnehmer: [...kampf.teilnehmer, T.neuerTeilnehmer('Ghul')] };
  assert.equal(T.pruefeVerlust(erweitert, [gespeichert]).ungespeichert, true);
});

test('Schaden im laufenden Kampf gilt nicht als ungespeichert', () => {
  /*
   * Der wichtigste Fall: verglichen wird, was beim Speichern herauskaeme,
   * nicht der laufende Stand. Sonst meldete das Werkzeug „ungespeichert",
   * sobald jemand einmal Schaden eingetragen hat, und die Rueckfrage waere
   * nach zwei Runden nur noch Rauschen.
   */
  // Mit echten Trefferpunkten, sonst prueft der Fall nichts: ein frischer
  // Teilnehmer hat null, und Schaden an null aendert nichts.
  const wolf = { ...T.neuerTeilnehmer('Wolf'), koerper: [T.neuerKoerper('', 11)] };
  const kampf = { ...T.leererKampf(), teilnehmer: [wolf], begegnungId: 'gespeichert' };
  const gespeichert = alsBegegnung(kampf);

  const verwundet = T.aendereHp(kampf, wolf.id, wolf.koerper[0].id, 3);
  assert.equal(verwundet.teilnehmer[0].koerper[0].hp, 8, 'der Schaden kommt an');
  assert.equal(T.pruefeVerlust(verwundet, [gespeichert]).ungespeichert, false);

  // Die Hoechstwerte gehoeren dagegen zur Aufstellung und zaehlen sehr wohl.
  const staerker = {
    ...kampf,
    teilnehmer: [{ ...wolf, koerper: [T.neuerKoerper('', 22)] }]
  };
  assert.equal(T.pruefeVerlust(staerker, [gespeichert]).ungespeichert, true);
});

test('eine geloeschte Begegnungsdatei macht die Aufstellung ungespeichert', () => {
  const kampf = mitTeilnehmern({ begegnungId: 'weg' });
  assert.equal(T.pruefeVerlust(kampf, []).ungespeichert, true);
});

test('Speichern: gleicher Name bleibt, neuer Name ist eine neue Datei, fremde Datei wird nicht still ersetzt', () => {
  const zuId = T.zuId;
  const vorhanden = [
    { ...T.leererKampf(), id: 'forest-ambush', name: 'Forest Ambush', teilnehmer: [], schemaVersion: 1, taktik: '' },
    { id: 'cave-fight', name: 'Cave Fight', teilnehmer: [], schemaVersion: 1, taktik: '' }
  ];
  const geladen = { begegnungId: 'forest-ambush', name: 'Forest Ambush' };
  assert.deepEqual(T.speicherZiel('Forest Ambush', geladen, vorhanden, zuId), { id: 'forest-ambush', kollision: null });
  assert.deepEqual(T.speicherZiel('Night Raid', geladen, vorhanden, zuId), { id: 'night-raid', kollision: null });
  assert.equal(T.speicherZiel('Cave Fight', geladen, vorhanden, zuId).kollision?.id, 'cave-fight');
  assert.equal(T.speicherZiel('Forest Ambush', { begegnungId: undefined, name: '' }, vorhanden, zuId).kollision?.id, 'forest-ambush');
});
