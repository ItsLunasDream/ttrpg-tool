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

test('Werkzeugnachrichten gehen an alle oder an eine Person, ohne Echo an den Absender', async () => {
  const g = dienst(47905);
  const a = dienst(47905);
  const b = dienst(47905);
  try {
    const port = await g.d.eroeffne('Runde', '', 'SL');
    await a.d.trittBei('127.0.0.1', port, '', 'Anna');
    await b.d.trittBei('127.0.0.1', port, '', 'Ben');
    await bis(() => g.d.zustand().personen.length === 3);
    const werkzeug = (x) => x.ereignisse.filter((e) => e.art === 'werkzeug');
    g.d.sendeWerkzeug('initiative', '{"art":"stand"}', null);
    await bis(() => werkzeug(a).length === 1 && werkzeug(b).length === 1);
    assert.equal(werkzeug(g).length, 0);
    assert.equal(werkzeug(a)[0].von.name, 'SL');
    a.d.sendeWerkzeug('initiative', '{"art":"aenderung"}', 'gastgeber');
    await bis(() => werkzeug(g).length === 1);
    await warte(100);
    assert.equal(werkzeug(b).length, 1);
    assert.equal(werkzeug(g)[0].von.name, 'Anna');
  } finally {
    a.d.beende();
    b.d.beende();
    g.d.beende();
  }
});

test('im offenen Raum umbenennen: Gast und Gastgeber, eindeutig und bei allen', async () => {
  const g = dienst(47905);
  const a = dienst(47905);
  const b = dienst(47905);
  try {
    const port = await g.d.eroeffne('Runde', '', 'SL');
    await a.d.trittBei('127.0.0.1', port, '', 'Anna');
    await b.d.trittBei('127.0.0.1', port, '', 'Ben');
    await bis(() => g.d.zustand().personen.length === 3);

    assert.equal(a.d.umbenennen('Mira'), true);
    await bis(() => b.d.zustand().personen.some((p) => p.name === 'Mira'));
    await bis(() => a.d.zustand().ich.name === 'Mira');
    // Ein vergebener Name bekommt eine Zahl, wie beim Beitreten.
    b.d.umbenennen('Mira');
    await bis(() => b.d.zustand().ich.name === 'Mira (2)');
    // Der Gastgeber benennt sich selbst um, und alle sehen es.
    g.d.umbenennen('Spielleitung');
    await bis(() => a.d.zustand().personen.some((p) => p.name === 'Spielleitung'));
    assert.deepEqual(g.d.zustand().personen.map((p) => p.name), ['Spielleitung', 'Mira', 'Mira (2)']);
    assert.equal(g.d.umbenennen('   '), false);
  } finally {
    a.d.beende();
    b.d.beende();
    g.d.beende();
  }
});

/* ------------------------------------------------------------------ */
/* Verschluesselung und Internet (Protokoll 2)                         */
/* ------------------------------------------------------------------ */

const net = require('node:net');
const K = require('../dist/tests/entry.cjs');

/** Ein Gast von Hand: liest die Herausforderung, meldet sich an, liefert den Schutz. */
function handgast(port, passwort, host = '127.0.0.1') {
  return new Promise((fertig, fehler) => {
    const s = net.connect({ host, port });
    s.setEncoding('utf8');
    let rest = '';
    const zeilen = [];
    let schutz = null;
    s.on('data', async (stueck) => {
      rest += stueck;
      const teile = rest.split('\n');
      rest = teile.pop();
      for (const z of teile) {
        zeilen.push(z);
        const n = z.startsWith('{') ? JSON.parse(z) : null;
        if (n?.typ === 'herausforderung') {
          const gastNonce = K.neueNonce();
          const stamm = await K.stammschluessel(passwort, n.salz);
          s.write(`${JSON.stringify({ typ: 'hallo', name: 'Hand', nachweis: K.nachweis(stamm, n.nonce, gastNonce), version: 2, gastNonce })}\n`);
          schutz = new K.Leitungsschutz(stamm, n.nonce, gastNonce, 'gast');
          fertig({ s, zeilen, schutz: () => schutz });
        }
      }
    });
    s.on('error', fehler);
  });
}

test('mit Passwort ist nach der Anmeldung jede Zeile verschluesselt, eine veraenderte trennt die Leitung', async () => {
  const g = dienst(47911);
  try {
    const port = await g.d.eroeffne('Geheimrunde', 'sehr geheim', 'Spielleitung');
    assert.equal(g.d.zustand().verschluesselt, true);
    const h = await handgast(port, 'sehr geheim');
    await bis(() => h.zeilen.length >= 2);
    // Die Antwort auf die Anmeldung ist schon verschluesselt …
    const willkommen = h.zeilen[1];
    assert.ok(willkommen.startsWith('~'), 'kein Klartext nach der Anmeldung');
    assert.ok(!willkommen.includes('Spielleitung'));
    assert.equal(JSON.parse(h.schutz().entpacke(willkommen)).typ, 'willkommen');
    // … und ein Chat im Mitschnitt verraet nichts.
    g.d.chatte('Der Drache schlaeft im Keller', null);
    await bis(() => h.zeilen.some((z, i) => i > 1 && z.startsWith('~')));
    assert.ok(!h.zeilen.join('\n').includes('Drache'));
    // Eine gefaelschte Zeile vom Gast: der Gastgeber trennt.
    const zu = new Promise((r) => h.s.on('close', r));
    h.s.write('~AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n');
    await zu;
    await bis(() => g.d.zustand().personen.length === 1);
  } finally {
    g.d.beende();
  }
});

test('ueber das Internet: nur mit Passwort, fester Port, IPv6, belegter Port wird gemeldet', async () => {
  const g = dienst(47912);
  const a = dienst(47912);
  const zweiter = dienst(47912);
  try {
    await assert.rejects(g.d.eroeffne('Offen', '', 'SL', { internet: true, port: 47913 }), /passwort-noetig/);
    const port = await g.d.eroeffne('Weit weg', 'pw', 'SL', { internet: true, port: 47913 });
    assert.equal(port, 47913);
    assert.equal(g.d.zustand().internet, true);
    await assert.rejects(zweiter.d.eroeffne('Noch einer', 'pw', 'SL', { internet: true, port: 47913 }), /port-belegt/);
    // Ueber IPv6 (Schleife), wenn der Rechner IPv6 kann; sonst ueber IPv4.
    let host = '::1';
    try {
      await new Promise((ok, nein) => net.connect({ host: '::1', port }).once('connect', function () { this.destroy(); ok(); }).once('error', nein));
    } catch {
      host = '127.0.0.1';
    }
    await a.d.trittBei(host === '::1' ? '[::1]' : host, port, 'pw', 'Anna');
    await bis(() => a.d.zustand().rolle === 'gast');
    assert.equal(a.d.zustand().verschluesselt, true);
    a.d.chatte('Hallo aus der Ferne', null);
    await bis(() => g.chat().some((z) => z.text === 'Hallo aus der Ferne'));
  } finally {
    a.d.beende();
    zweiter.d.beende();
    g.d.beende();
  }
});

test('Beitritt: wo niemand lauscht, heisst der Grund „abgewiesen"; eine alte Fassung „version"', async () => {
  const a = dienst(47914);
  const g = dienst(47914);
  try {
    // Ein Port, auf dem sicher nichts lauscht: kurz belegen, dann freigeben.
    const frei = await new Promise((r) => {
      const srv = net.createServer();
      srv.listen(0, '127.0.0.1', () => {
        const p = srv.address().port;
        srv.close(() => r(p));
      });
    });
    await a.d.trittBei('127.0.0.1', frei, '', 'Anna');
    assert.ok(a.ereignisse.some((e) => e.art === 'fehler' && e.grund === 'abgewiesen'));

    const port = await g.d.eroeffne('Runde', '', 'SL');
    assert.equal(g.d.zustand().verschluesselt, false);
    const antwort = await new Promise((r) => {
      const s = net.connect({ host: '127.0.0.1', port });
      s.setEncoding('utf8');
      let alles = '';
      s.on('data', (d) => {
        alles += d;
        if (alles.includes('herausforderung') && !alles.includes('hallo-geschickt')) {
          alles += 'hallo-geschickt';
          s.write(`${JSON.stringify({ typ: 'hallo', name: 'Alt', nachweis: '', version: 1 })}\n`);
        }
      });
      s.on('close', () => r(alles));
    });
    assert.match(antwort, /"grund":"version"/);
  } finally {
    a.d.beende();
    g.d.beende();
  }
});

test('der Gast misst den Ping zum Gastgeber, verschluesselt und im Klartext', async () => {
  for (const passwort of ['geheim', '']) {
    const g = dienst(47931);
    const a = dienst(47931);
    try {
      const port = await g.d.eroeffne('Runde', passwort, 'SL');
      await a.d.trittBei('127.0.0.1', port, passwort, 'Anna');
      assert.equal(g.d.zustand().ping, null, 'der Gastgeber hat keinen Ping zu sich selbst');
      await bis(() => typeof a.d.zustand().ping === 'number');
      assert.ok(a.d.zustand().ping >= 0 && a.d.zustand().ping < 1000, `Ping ${a.d.zustand().ping} ms`);
      a.d.verlasse();
      assert.equal(a.d.zustand().ping, null, 'nach dem Verlassen ist der Ping weg');
    } finally {
      a.d.beende();
      g.d.beende();
    }
  }
});
