import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { OllamaProvider } = entry;

/** Baut eine Antwort, deren Rumpf die uebergebenen Pakete nacheinander liefert. */
function streamingResponse(packets, init = {}) {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      for (const packet of packets) controller.enqueue(encoder.encode(packet));
      controller.close();
    }
  });
  return new Response(body, { status: 200, ...init });
}

async function withFetch(handler, run) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

const provider = () => new OllamaProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'testmodell' });

test('Teiltexte kommen einzeln an und ergeben zusammen die Antwort', async () => {
  const chunks = [];
  const text = await withFetch(
    async () =>
      streamingResponse([
        '{"message":{"content":"Erster "}}\n',
        '{"message":{"content":"zweiter "}}\n{"message":{"content":"dritter"}}\n'
      ]),
    () => provider().ask({}, 'system', 'user', (chunk) => chunks.push(chunk))
  );

  assert.deepEqual(chunks, ['Erster ', 'zweiter ', 'dritter']);
  assert.equal(text, 'Erster zweiter dritter');
});

test('Eine über zwei Pakete verteilte Zeile wird korrekt zusammengesetzt', async () => {
  const chunks = [];
  const text = await withFetch(
    async () => streamingResponse(['{"message":{"con', 'tent":"geteilt"}}\n']),
    () => provider().ask({}, 'system', 'user', (chunk) => chunks.push(chunk))
  );

  assert.deepEqual(chunks, ['geteilt']);
  assert.equal(text, 'geteilt');
});

test('Ein Fehler im Datenstrom wird gemeldet', async () => {
  await assert.rejects(
    withFetch(
      async () => streamingResponse(['{"error":"Modell nicht geladen"}\n']),
      () => provider().ask({}, 'system', 'user', () => {})
    ),
    { key: 'error.aiOther' }
  );
});

test('Eine leere Antwort gilt als Fehler', async () => {
  await assert.rejects(
    withFetch(
      async () => streamingResponse(['{"message":{"content":"   "}}\n']),
      () => provider().ask({}, 'system', 'user', () => {})
    ),
    { key: 'error.aiEmpty' }
  );
});

test('Ein HTTP-Fehler wird gemeldet, ohne den Rumpf zu lesen', async () => {
  await assert.rejects(
    withFetch(
      async () => new Response('kaputt', { status: 500 }),
      () => provider().ask({}, 'system', 'user', () => {})
    ),
    { key: 'error.aiHttp' }
  );
});

test('Eine abgelehnte Verbindung wird als solche gemeldet', async () => {
  await assert.rejects(
    withFetch(
      async () => {
        throw new Error('fetch failed: ECONNREFUSED');
      },
      () => provider().ask({}, 'system', 'user', () => {})
    ),
    { key: 'error.aiNoConnection' }
  );
});

test('Die Bereitschaftspruefung erkennt ein fehlendes Modell', async () => {
  const status = await withFetch(
    async () => new Response(JSON.stringify({ models: [{ name: 'anderes:latest' }] }), { status: 200 }),
    () => provider().check()
  );
  assert.equal(status.ready, false);
  assert.equal(status.key, 'error.aiModelNotInstalled');
});

test('Die Bereitschaftspruefung akzeptiert das Modell mit Tag', async () => {
  const status = await withFetch(
    async () => new Response(JSON.stringify({ models: [{ name: 'testmodell:8b' }] }), { status: 200 }),
    () => provider().check()
  );
  assert.equal(status.ready, true);
});
