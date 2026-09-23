/**
 * Was in eine Sicherung gehoert.
 *
 * Der Teil, bei dem ein Fehler weh tut: eine Sicherung, in der etwas fehlt,
 * merkt man erst beim Zurueckspielen — und dann ist das Original weg.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  EINSTELLUNGSDATEI,
  einstellungenOhneSchluessel,
  gehoertInSicherung,
  ordnerLohnt,
  sicherungsname
} =
  require('../dist/tests/entry.cjs');

test('was die Werkzeuge ablegen, ist dabei', () => {
  for (const pfad of [
    'einstellungen.json',
    'backstory/settings.json',
    'backstory/vault/Meine Kampagne/notes/koenig.md',
    'backstory/vault/Meine Kampagne/assets/wappen.png',
    'monster/frostwaechter.md',
    'zustaende/absolute-kaelte.md',
    'initiative/begegnungen/hoehle.md',
    'initiative/kampf.md',
    'dice/einstellungen.json',
    'symbole/backstory.png'
  ]) {
    assert.ok(gehoertInSicherung(pfad), `fehlt: ${pfad}`);
  }
});

test('Zwischenspeicher und Protokolle bleiben draussen', () => {
  for (const pfad of [
    'Cache/data_0',
    'Code Cache/js/index',
    'GPUCache/data_1',
    'blob_storage/abc/def',
    'Crashpad/settings.dat',
    'logs/main.log',
    'backstory/vault/irgendwas.log',
    'Local Storage/leveldb/000003.log',
    'Service Worker/CacheStorage/x',
    'IndexedDB/file__0.indexeddb.leveldb/CURRENT',
    'Network/Cookies'
  ]) {
    assert.equal(gehoertInSicherung(pfad), false, `sollte draussen bleiben: ${pfad}`);
  }
});

test('halb geschriebene Dateien bleiben draussen', () => {
  // Sie leben Millisekunden — eine davon in der Sicherung waere ein Stand,
  // den es nie gab.
  assert.equal(gehoertInSicherung('initiative/kampf.md.neu'), false);
  assert.equal(gehoertInSicherung('dice/einstellungen.json.neu'), false);
  // Aber eine Datei, die nur so heisst, schon.
  assert.ok(gehoertInSicherung('monster/schneu.md'));
});

test('von den Sitzungsordnern nur das eigene Woerterbuch', () => {
  // Darin liegt Browserzustand, kein Inhalt — bis auf die Woerter, die
  // jemand von Hand aufgenommen hat.
  assert.equal(gehoertInSicherung('Partitions/backstory/Local Storage/x'), false);
  assert.equal(gehoertInSicherung('Partitions/backstory/Network/Cookies'), false);
  assert.ok(gehoertInSicherung('Partitions/backstory/Custom Dictionary.txt'));
});

test('in einen Sitzungsordner wird hineingesehen, auch wenn er nicht hineingehoert', () => {
  // Der Fehler, den dieser Test festhaelt: `Partitions` wurde an derselben
  // Frage gemessen wie eine Datei und deshalb abgewiesen, bevor jemand
  // hineinsah — das eigene Woerterbuch war damit weg.
  assert.equal(gehoertInSicherung('Partitions'), false);
  assert.ok(ordnerLohnt('Partitions'), 'es muss trotzdem hineingesehen werden');
  assert.ok(ordnerLohnt('Partitions/backstory'));
  // Wegwerfordner bleiben aber aussen vor, egal wo sie liegen.
  assert.equal(ordnerLohnt('Cache'), false);
  assert.equal(ordnerLohnt('Partitions/backstory/Local Storage'), false);
  assert.equal(ordnerLohnt(''), false);
});

test('der leere Pfad gehoert nirgendwohin', () => {
  assert.equal(gehoertInSicherung(''), false);
  assert.equal(gehoertInSicherung('/'), false);
});

test('der API-Schluessel wird aus den Einstellungen genommen', () => {
  const vorher = JSON.stringify(
    { language: 'de', thema: 'nacht', claudeSchluessel: 'v10:geheim', ki: { anbieter: 'claude' } },
    null,
    2
  );
  const nachher = JSON.parse(einstellungenOhneSchluessel(vorher));
  assert.equal(nachher.claudeSchluessel, '');
  // Und sonst nichts verloren: eine Sicherung, die stillschweigend eine
  // Einstellung wegwirft, waere schlimmer als der Schluessel darin.
  assert.equal(nachher.language, 'de');
  assert.equal(nachher.thema, 'nacht');
  assert.deepEqual(nachher.ki, { anbieter: 'claude' });
  assert.ok(!einstellungenOhneSchluessel(vorher).includes('geheim'));
});

test('eine kaputte Einstellungsdatei geht unveraendert durch', () => {
  // Lieber eine Datei zu viel gesichert als eine Sicherung, die still
  // etwas verliert. Einen brauchbaren Schluessel enthaelt so eine Datei
  // ohnehin nicht.
  assert.equal(einstellungenOhneSchluessel('{kaputt'), '{kaputt');
  assert.equal(einstellungenOhneSchluessel(''), '');
  assert.equal(einstellungenOhneSchluessel('null'), 'null');
});

test('eine Datei ohne Schluesselfeld bleibt, wie sie ist', () => {
  const roh = '{"language":"en"}';
  assert.equal(einstellungenOhneSchluessel(roh), roh);
});

test('die Einstellungsdatei heisst, wie der Hauptprozess sie nennt', () => {
  assert.equal(EINSTELLUNGSDATEI, 'einstellungen.json');
  assert.ok(gehoertInSicherung(EINSTELLUNGSDATEI));
});

test('der Dateiname traegt Datum und Uhrzeit', () => {
  // Die Stunde gehoert dazu: wer an einem Nachmittag zweimal sichert, will
  // nicht raten muessen, welche die neuere ist.
  const name = sicherungsname(new Date(2026, 8, 22, 9, 5));
  assert.equal(name, 'lore-sicherung-2026-09-22-0905.zip');
  assert.match(sicherungsname(new Date()), /^lore-sicherung-\d{4}-\d{2}-\d{2}-\d{4}\.zip$/);
});

/*
 * Und jetzt wirklich packen.
 *
 * Der Packer braucht kein Electron — nur `node:fs` und `fflate`. Deshalb
 * steht er hier und nicht in einem Rauchtest: eine Sicherung, in der etwas
 * fehlt, merkt man erst beim Zurueckspielen, und bis dahin ist das Original
 * weg. Das gehoert in die schnellen Tests, nicht in die langsamen.
 */
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { unzipSync } from 'fflate';

const { schreibeSicherung } = require('../dist/tests/entry.cjs');

/** Ein Datenordner, wie er nach ein paar Sitzungen aussieht. */
function beispielordner() {
  const wurzel = mkdtempSync(join(tmpdir(), 'sicherung-test-'));
  const lege = (relativ, inhalt) => {
    const voll = join(wurzel, ...relativ.split('/'));
    mkdirSync(dirname(voll), { recursive: true });
    writeFileSync(voll, inhalt);
  };

  lege(
    'einstellungen.json',
    JSON.stringify({ language: 'de', thema: 'wald', claudeSchluessel: 'v10:GEHEIMNIS' }, null, 2)
  );
  lege('backstory/settings.json', '{"vaultRoot":"x"}');
  lege('backstory/vault/Kampagne/notes/koenig.md', '# Der König\n');
  lege('backstory/vault/Kampagne/assets/wappen.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  lege('monster/frostwaechter.md', '---\nid: frost\n---\n# Frostwächter\n');
  lege('zustaende/kaelte.md', '# Kälte\n');
  lege('initiative/begegnungen/hoehle.md', '# Höhle\n');
  lege('symbole/backstory.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  // Und das, was draussen bleiben soll.
  lege('Cache/data_0', 'muell');
  lege('GPUCache/data_1', 'muell');
  lege('logs/main.log', 'zeilen');
  lege('initiative/kampf.md.neu', 'halb geschrieben');
  lege('Partitions/backstory/Local Storage/leveldb/CURRENT', 'x');
  lege('Partitions/backstory/Custom Dictionary.txt', 'Frostwächter\n');

  return wurzel;
}

async function gepackt() {
  const wurzel = beispielordner();
  const ziel = join(wurzel, '..', `probe-${Date.now()}.zip`);
  const bericht = await schreibeSicherung(wurzel, ziel);
  const roh = readFileSync(ziel);
  return { bericht, ziel, roh, eintraege: unzipSync(new Uint8Array(roh)) };
}

test('jedes Werkzeug ist in der Sicherung', async () => {
  const { eintraege, bericht, ziel } = await gepackt();
  assert.ok(existsSync(ziel), 'die Datei liegt nicht da');
  assert.ok(bericht.dateien > 0, `leer (${bericht.dateien})`);

  const fehlend = [
    'einstellungen.json',
    'backstory/settings.json',
    'backstory/vault/Kampagne/notes/koenig.md',
    'backstory/vault/Kampagne/assets/wappen.png',
    'monster/frostwaechter.md',
    'zustaende/kaelte.md',
    'initiative/begegnungen/hoehle.md',
    'symbole/backstory.png',
    'Partitions/backstory/Custom Dictionary.txt'
  ].filter((name) => !(name in eintraege));
  assert.deepEqual(fehlend, [], `fehlt: ${fehlend.join(', ')}`);
});

test('Umlaute und Bilder kommen heil an', async () => {
  const { eintraege } = await gepackt();
  const text = new TextDecoder().decode(eintraege['monster/frostwaechter.md']);
  assert.ok(text.includes('Frostwächter'), text);
  // Ein Bild darf nicht durch die Textbehandlung gelaufen sein.
  assert.equal(eintraege['backstory/vault/Kampagne/assets/wappen.png'][0], 0x89);
});

test('Zwischenspeicher und halbe Dateien bleiben draussen', async () => {
  const { eintraege } = await gepackt();
  const drin = Object.keys(eintraege).filter(
    (name) =>
      name.startsWith('Cache/') ||
      name.startsWith('GPUCache/') ||
      name.startsWith('logs/') ||
      name.endsWith('.neu') ||
      name.includes('Local Storage')
  );
  assert.deepEqual(drin, [], `drin: ${drin.join(', ')}`);
});

test('der API-Schluessel steht nirgends in der fertigen Datei', async () => {
  // Die schaerfste Pruefung: eine Sicherung liegt irgendwo oder wird
  // verschickt. Ein Zugangsschluessel hat darin nichts verloren — auch kein
  // verschluesselter, der hier ohnehin wertlos waere.
  //
  // Gesucht wird in den ROHEN Bytes, nicht im entpackten Eintrag: waere er
  // versehentlich in einer anderen Datei gelandet, fiele das sonst nicht auf.
  const { roh, eintraege } = await gepackt();
  assert.ok(!roh.includes('GEHEIMNIS'), 'der Schluessel steht in der Sicherung');

  const eingestellt = JSON.parse(new TextDecoder().decode(eintraege['einstellungen.json']));
  assert.equal(eingestellt.claudeSchluessel, '', 'das Feld soll leer sein, nicht weg');
  // Und sonst nichts verloren.
  assert.equal(eingestellt.thema, 'wald');
  assert.equal(eingestellt.language, 'de');
});
