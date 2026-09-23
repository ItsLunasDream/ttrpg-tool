import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Raumdienst } = require('../dist/tests/entry.cjs');

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/** Ein Dienst, der mitschreibt, was er meldet. Suchport weit weg vom echten. */
function dienst(suchport) {
  const ereignisse = [];
  const d = new Raumdienst((e) => ereignisse.push(e), { suchport, rufziel: '127.0.0.1' });
  return { d, ereignisse, chat: () => ereignisse.filter((e) => e.art === 'chat').map((e) => e.zeile) };
}

async function bis(bedingung, ms = 3000) {
  const ende = Date.now() + ms;
  while (!bedingung()) {
    if (Date.now() > ende) throw new Error('Zeit abgelaufen');
    await warte(20);
  }
}

test('Gastgeber und zwei Gaeste: Namen, Chat an alle und Direktnachricht', async () => {
  const g = dienst(47901);
  const a = dienst(47901);
  const b = dienst(47901);
  try {
    const port = await g.d.eroeffne('Freitagsrunde', 'geheim', 'Spielleitung');
    await a.d.trittBei('127.0.0.1', port, 'geheim', 'Anna');
    await b.d.trittBei('127.0.0.1', port, 'geheim', 'Anna');
    await bis(() => g.d.zustand().personen.length === 3);
    assert.deepEqual(
      g.d.zustand().personen.map((p) => p.name),
      ['Spielleitung', 'Anna', 'Anna (2)']
    );
    assert.equal(b.d.zustand().ich.name, 'Anna (2)');
    assert.equal(b.d.zustand().raum, 'Freitagsrunde');

    // An alle: jeder sieht es, der Absender als eigene Zeile.
    a.d.chatte('Hallo zusammen', null);
    await bis(() => g.chat().length === 1 && b.chat().length === 1 && a.chat().length === 1);
    assert.equal(b.chat()[0].von.name, 'Anna');
    assert.equal(a.chat()[0].eigene, true);

    // Direkt an Anna (2): Anna sieht es nicht.
    const ziel = b.d.zustand().ich.id;
    g.d.chatte('Nur fuer dich', ziel);
    await bis(() => b.chat().length === 2 && g.chat().length === 2);
    await warte(100);
    assert.equal(a.chat().length, 1);
    assert.equal(b.chat()[1].an.id, ziel);
  } finally {
    a.d.beende();
    b.d.beende();
    g.d.beende();
  }
});

test('ein falsches Passwort kommt nicht herein, und das Passwort reist nicht', async () => {
  const g = dienst(47902);
  const a = dienst(47902);
  try {
    const port = await g.d.eroeffne('Runde', 'richtig', 'SL');
    await a.d.trittBei('127.0.0.1', port, 'falsch', 'Eve');
    assert.ok(a.ereignisse.some((e) => e.art === 'fehler' && e.grund === 'passwort'));
    assert.equal(a.d.zustand().rolle, 'aus');
    await warte(100);
    assert.equal(g.d.zustand().personen.length, 1);
  } finally {
    a.d.beende();
    g.d.beende();
  }
});

test('ein Paket geht nur an die eine Person', async () => {
  const g = dienst(47903);
  const a = dienst(47903);
  const b = dienst(47903);
  try {
    const port = await g.d.eroeffne('Runde', '', 'SL');
    await a.d.trittBei('127.0.0.1', port, '', 'Anna');
    await b.d.trittBei('127.0.0.1', port, '', 'Ben');
    await bis(() => g.d.zustand().personen.length === 3);
    g.d.sende('# Paket', '1 Eintrag: Ghul', a.d.zustand().ich.id);
    await bis(() => a.ereignisse.some((e) => e.art === 'paket'));
    await warte(100);
    assert.equal(b.ereignisse.some((e) => e.art === 'paket'), false);
    assert.equal(a.ereignisse.find((e) => e.art === 'paket').von.name, 'SL');
  } finally {
    a.d.beende();
    b.d.beende();
    g.d.beende();
  }
});

test('der Raum erscheint in der Liste, und wer geht, verschwindet aus dem Raum', async () => {
  const such = dienst(47904);
  const g = dienst(47904);
  const a = dienst(47904);
  try {
    such.d.suche();
    const port = await g.d.eroeffne('Sonntag', 'x', 'SL');
    await bis(() => such.d.raeume().some((r) => r.raum === 'Sonntag' && r.port === port && r.geschuetzt));
    await a.d.trittBei('127.0.0.1', port, 'x', 'Anna');
    await bis(() => g.d.zustand().personen.length === 2);
    a.d.verlasse();
    await bis(() => g.d.zustand().personen.length === 1);
    // Der Gastgeber schliesst: der Gast erfaehrt es.
    await a.d.trittBei('127.0.0.1', port, 'x', 'Anna');
    g.d.verlasse();
    await bis(() => a.d.zustand().rolle === 'aus');
    assert.ok(a.ereignisse.some((e) => e.art === 'fehler' && e.grund === 'getrennt'));
  } finally {
    such.d.beende();
    a.d.beende();
    g.d.beende();
  }
});
