import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const { OllamaAnbieter } = entry;

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

/** Die kuerzeste sinnvolle Anfrage. Was geprueft wird, ist der Datenstrom, nicht der Text. */
const einfach = { system: 'system', nachrichten: [{ rolle: 'user', inhalt: 'user' }] };

const anbieter = () => new OllamaAnbieter({ adresse: 'http://127.0.0.1:11434', modell: 'testmodell' });

test('Teiltexte kommen einzeln an und ergeben zusammen die Antwort', async () => {
  const chunks = [];
  const text = await withFetch(
    async () =>
      streamingResponse([
        '{"message":{"content":"Erster "}}\n',
        '{"message":{"content":"zweiter "}}\n{"message":{"content":"dritter"}}\n'
      ]),
    () => anbieter().frage(einfach, (teil) => chunks.push(teil))
  );

  assert.deepEqual(chunks, ['Erster ', 'zweiter ', 'dritter']);
  assert.equal(text, 'Erster zweiter dritter');
});

test('Eine über zwei Pakete verteilte Zeile wird korrekt zusammengesetzt', async () => {
  const chunks = [];
  const text = await withFetch(
    async () => streamingResponse(['{"message":{"con', 'tent":"geteilt"}}\n']),
    () => anbieter().frage(einfach, (teil) => chunks.push(teil))
  );

  assert.deepEqual(chunks, ['geteilt']);
  assert.equal(text, 'geteilt');
});

test('Ein Fehler im Datenstrom wird gemeldet', async () => {
  await assert.rejects(
    withFetch(
      async () => streamingResponse(['{"error":"Modell nicht geladen"}\n']),
      () => anbieter().frage(einfach, () => {})
    ),
    { schluessel: 'error.aiOther' }
  );
});

test('Eine leere Antwort gilt als Fehler', async () => {
  await assert.rejects(
    withFetch(
      async () => streamingResponse(['{"message":{"content":"   "}}\n']),
      () => anbieter().frage(einfach, () => {})
    ),
    { schluessel: 'error.aiEmpty' }
  );
});

test('Ein HTTP-Fehler wird gemeldet, ohne den Rumpf zu lesen', async () => {
  await assert.rejects(
    withFetch(
      async () => new Response('kaputt', { status: 500 }),
      () => anbieter().frage(einfach, () => {})
    ),
    { schluessel: 'error.aiHttp' }
  );
});

test('Eine abgelehnte Verbindung wird als solche gemeldet', async () => {
  await assert.rejects(
    withFetch(
      async () => {
        throw new Error('fetch failed: ECONNREFUSED');
      },
      () => anbieter().frage(einfach, () => {})
    ),
    { schluessel: 'error.aiNoConnection' }
  );
});

test('Die Bereitschaftspruefung erkennt ein fehlendes Modell', async () => {
  const zustand = await withFetch(
    async () => new Response(JSON.stringify({ models: [{ name: 'anderes:latest' }] }), { status: 200 }),
    () => anbieter().pruefe()
  );
  assert.equal(zustand.bereit, false);
  assert.equal(zustand.schluessel, 'error.aiModelNotInstalled');
});

test('Die Bereitschaftspruefung akzeptiert das Modell mit Tag', async () => {
  const zustand = await withFetch(
    async () => new Response(JSON.stringify({ models: [{ name: 'testmodell:8b' }] }), { status: 200 }),
    () => anbieter().pruefe()
  );
  assert.equal(zustand.bereit, true);
});

test('Der Gespraechsverlauf wird mitgeschickt, mit der Systemanweisung zuerst', async () => {
  let sent = null;
  await withFetch(
    async (_url, init) => {
      sent = JSON.parse(init.body);
      return streamingResponse(['{"message":{"content":"ok"}}\n']);
    },
    () =>
      anbieter().frage(
        {
          system: 'systemtext',
          nachrichten: [
            { rolle: 'user', inhalt: 'erste Frage' },
            { rolle: 'assistant', inhalt: 'erste Antwort' },
            { rolle: 'user', inhalt: 'Rückfrage' }
          ]
        },
        () => {}
      )
  );

  assert.deepEqual(sent.messages, [
    { role: 'system', content: 'systemtext' },
    { role: 'user', content: 'erste Frage' },
    { role: 'assistant', content: 'erste Antwort' },
    { role: 'user', content: 'Rückfrage' }
  ]);
  assert.equal(sent.stream, true);
});
