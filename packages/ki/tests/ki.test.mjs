import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  baueAnbieter,
  istAnbieterId,
  leseJsonAntwort,
  KiFehler,
  KI_VOREINSTELLUNGEN,
  OllamaAnbieter,
  ClaudeAnbieter,
  OffenerAnbieter,
  baueUrl,
  leseStrom
} = require('../dist/tests/entry.cjs');

test('ohne eingerichtete KI entsteht kein Anbieter', () => {
  // 'none' ist der Normalfall. Die Werkzeuge muessen sich darauf verlassen
  // koennen, dass sie dann nichts zum Fragen bekommen.
  assert.equal(baueAnbieter(KI_VOREINSTELLUNGEN, ''), null);
});

test('die Voreinstellung ist keine KI', () => {
  assert.equal(KI_VOREINSTELLUNGEN.anbieter, 'none');
});

test('jede Einstellung waehlt den Anbieter, der dazu gehoert', () => {
  const ollama = baueAnbieter({ ...KI_VOREINSTELLUNGEN, anbieter: 'ollama' }, '');
  assert.ok(ollama instanceof OllamaAnbieter);
  assert.equal(ollama.id, 'ollama');

  const claude = baueAnbieter({ ...KI_VOREINSTELLUNGEN, anbieter: 'claude' }, 'sk-test');
  assert.ok(claude instanceof ClaudeAnbieter);
  assert.equal(claude.id, 'claude');
});

test('ein leeres Modellfeld faellt auf die Voreinstellung zurueck', () => {
  // Sonst ginge die Anfrage an ein Modell namens '' und scheiterte mit einer
  // Meldung, aus der niemand schlau wird.
  const claude = baueAnbieter({ ...KI_VOREINSTELLUNGEN, anbieter: 'claude', claudeModell: '' }, 'sk-test');
  assert.match(claude.beschreibe(), /Claude · .+/);
});

test('istAnbieterId laesst nur die drei bekannten Werte durch', () => {
  for (const gut of ['none', 'ollama', 'claude']) assert.equal(istAnbieterId(gut), true);
  for (const schlecht of ['openai', '', null, undefined, 42]) {
    assert.equal(istAnbieterId(schlecht), false);
  }
});

test('ein Fehler traegt einen Schluessel, keinen fertigen Text', () => {
  // Sonst waeren die Meldungen bei englischer Oberflaeche weiterhin deutsch.
  const fehler = new KiFehler('error.aiNoKey');
  assert.equal(fehler.schluessel, 'error.aiNoKey');
  assert.ok(fehler instanceof Error);
});

test('Ollama meldet fehlende Verbindung als solche, nicht als Absturz', async () => {
  // Port 1 nimmt nichts an. Genau das ist der Fall "Ollama laeuft nicht".
  const anbieter = new OllamaAnbieter({ adresse: 'http://127.0.0.1:1', modell: 'egal' });
  const zustand = await anbieter.pruefe();
  assert.equal(zustand.bereit, false);
  assert.match(zustand.schluessel, /^error\.ai/);
});

test('Claude ohne Schluessel sagt, dass der Schluessel fehlt', async () => {
  // Ohne diese Pruefung ginge eine Anfrage raus, die sicher scheitert.
  const anbieter = new ClaudeAnbieter({ schluessel: '  ', modell: 'claude-opus-5' });
  const zustand = await anbieter.pruefe();
  assert.deepEqual(zustand, { bereit: false, schluessel: 'error.aiNoKey' });
});

test('JSON wird auch aus einem Codeblock gelesen', () => {
  // Modelle packen ihre Antwort gern in ```json, obwohl man sie darum nicht
  // gebeten hat.
  assert.deepEqual(leseJsonAntwort('```json\n{"beruf":"Koehlerin"}\n```'), { beruf: 'Koehlerin' });
});

test('JSON wird auch aus einem Satz drumherum gelesen', () => {
  const antwort = 'Gerne! Hier mein Vorschlag:\n{"beruf":"Salzhaendler"}\nViel Spass damit.';
  assert.deepEqual(leseJsonAntwort(antwort), { beruf: 'Salzhaendler' });
});

test('eine Liste wird genauso gefunden', () => {
  assert.deepEqual(leseJsonAntwort('Bitte sehr: ["a","b"]'), ['a', 'b']);
});

test('ohne JSON kommt null zurueck, kein Absturz', () => {
  // Der Aufrufer soll die Figur unangetastet lassen koennen, statt mit einem
  // geworfenen Fehler umgehen zu muessen.
  assert.equal(leseJsonAntwort('Das kann ich leider nicht.'), null);
  assert.equal(leseJsonAntwort(''), null);
});

/**
 * Die Bereitschaftspruefung muss aufgeben, statt zu haengen.
 *
 * Das SDK wartet von sich aus zehn Minuten. Wer auf "Verbindung pruefen"
 * drueckt, will nicht zehn Minuten warten, um zu erfahren, dass kein Netz da
 * ist.
 *
 * Dieser Test steht hier, weil die Frist beim ersten Anlauf wirkungslos war:
 * sie ging als zweites Argument an `models.retrieve`, und das sind die
 * Parameter der Anfrage, nicht ihre Optionen. TypeScript hat es dann gemeldet
 * — aber erst, nachdem ein Rauchtest daran haengen geblieben war, ohne dass
 * ihm jemand ansehen konnte, woran.
 */
test('die Bereitschaftspruefung gibt auf, statt zu haengen', async () => {
  const original = globalThis.fetch;
  // Eine Antwort, die nie kommt — aber auf den Abbruch hoert. Genau so
  // verhaelt sich ein Netz, das Pakete verschluckt, statt abzulehnen.
  globalThis.fetch = (_url, init = {}) =>
    new Promise((_loese, brichAb) => {
      init.signal?.addEventListener('abort', () => brichAb(new Error('aborted')));
    });

  try {
    const anbieter = new ClaudeAnbieter({ schluessel: 'sk-test', modell: 'claude-opus-5' });
    const beginn = Date.now();

    /*
     * Mit eigener Uhr daneben. Ohne sie wartet dieser Test bei einer
     * wirkungslosen Frist einfach mit — und ein haengender Test sagt nichts,
     * er wird irgendwann abgewuergt und niemand weiss, woran.
     *
     * Die Frist sind vier Sekunden. Acht lassen Luft fuer eine langsame
     * Maschine und schlagen trotzdem an, wenn gar keine Frist wirkt.
     */
    let uhr;
    const zustand = await Promise.race([
      anbieter.pruefe(),
      new Promise((_loese, brichAb) => {
        uhr = setTimeout(() => brichAb(new Error('pruefe() hat nach 8 s nicht aufgegeben')), 8000);
      })
    ]).finally(() => clearTimeout(uhr));

    assert.equal(zustand.bereit, false);
    assert.ok(Date.now() - beginn < 8000);
  } finally {
    globalThis.fetch = original;
  }
});

test('die Adresse des offenen Anbieters vertraegt alle drei Schreibweisen', () => {
  // Wer sie eintraegt, schreibt mal mit /v1, mal ohne, mal mit Schraegstrich.
  // Verlangte man genau eine Form, laege der Fehler beim Tippen und die
  // Meldung hiesse "nicht erreichbar".
  assert.equal(baueUrl('https://api.beispiel.de', '/models'), 'https://api.beispiel.de/v1/models');
  assert.equal(baueUrl('https://api.beispiel.de/v1', '/models'), 'https://api.beispiel.de/v1/models');
  assert.equal(baueUrl('https://api.beispiel.de/v1/', '/models'), 'https://api.beispiel.de/v1/models');
  assert.equal(baueUrl('  https://api.beispiel.de  ', '/models'), 'https://api.beispiel.de/v1/models');
  // Eine andere Fassung bleibt stehen, sie ist nicht unser Ratespiel.
  assert.equal(baueUrl('https://api.beispiel.de/v2', '/models'), 'https://api.beispiel.de/v2/models');
});

test('der Datenstrom des offenen Anbieters wird zusammengesetzt', async () => {
  // Eine Zeile kann ueber zwei Pakete verteilt ankommen — dieselbe Falle wie
  // bei Ollama, und sie ist nur mit einem geteilten Paket zu sehen.
  const pakete = [
    'data: {"choices":[{"delta":{"content":"Hallo "}}]}\n',
    'data: {"choices":[{"delta":{"con',
    'tent":"Welt"}}]}\n\ndata: [DONE]\n'
  ].map((text) => new TextEncoder().encode(text));

  const teile = [];
  const text = await leseStrom((async function* () {
    for (const paket of pakete) yield paket;
  })(), (stueck) => teile.push(stueck));

  assert.equal(text, 'Hallo Welt');
  assert.deepEqual(teile, ['Hallo ', 'Welt']);
});

test('ein Fehler im Datenstrom wird zum uebersetzbaren Fehler', async () => {
  const strom = (async function* () {
    yield new TextEncoder().encode('data: {"error":{"message":"kaputt"}}\n');
  })();

  await assert.rejects(() => leseStrom(strom, () => {}), (fehler) => {
    assert.equal(fehler.name, 'KiFehler');
    assert.equal(fehler.schluessel, 'error.aiOther');
    return true;
  });
});

test('der offene Anbieter kommt nur mit Adresse und Modell zustande', () => {
  const basis = { ...KI_VOREINSTELLUNGEN, anbieter: 'offen', offenAdresse: 'https://x.y', offenModell: 'gross-1' };
  const anbieter = baueAnbieter(basis, 'geheim');
  assert.equal(anbieter?.id, 'offen');
  assert.match(anbieter.beschreibe(), /x\.y/);
  assert.match(anbieter.beschreibe(), /gross-1/);
});

test('ohne Schluessel meldet der offene Anbieter das, statt zu fragen', async () => {
  const anbieter = baueAnbieter(
    { ...KI_VOREINSTELLUNGEN, anbieter: 'offen', offenAdresse: 'https://x.y', offenModell: 'gross-1' },
    ''
  );
  const zustand = await anbieter.pruefe();
  assert.equal(zustand.bereit, false);
  assert.equal(zustand.schluessel, 'error.aiNoKey');
});
