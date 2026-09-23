/**
 * Ein Gast aus dem Raumprotokoll (Fassung 2), ohne die App — fuer die
 * Rauchtests. Rechnet dieselbe Verschluesselung wie src/main/raumkrypto.ts
 * nach: scrypt fuer den Stammschluessel, HMAC als Nachweis, HKDF je
 * Richtung und AES-256-GCM mit Zaehler. Stimmt eine Seite nicht, schlaegt
 * der Rauchtest fehl, statt dass beide Seiten denselben Fehler teilen.
 */
const net = require('node:net');
const { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, scryptSync } = require('node:crypto');

const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function schutz(stamm, nonce, gastNonce) {
  const salz = Buffer.from(`${nonce}|${gastNonce}`);
  const k = (r) => Buffer.from(hkdfSync('sha256', stamm, salz, `ttrpg-raum v2 ${r}`, 32));
  const senden = k('gast->gastgeber');
  const empfangen = k('gastgeber->gast');
  let zs = 0n;
  let ze = 0n;
  const iv = (z) => {
    const b = Buffer.alloc(12);
    b.writeBigUInt64BE(z, 4);
    return b;
  };
  return {
    verpacke(zeile) {
      const c = createCipheriv('aes-256-gcm', senden, iv(zs++));
      const g = Buffer.concat([c.update(zeile, 'utf8'), c.final()]);
      return `~${Buffer.concat([c.getAuthTag(), g]).toString('base64')}\n`;
    },
    entpacke(zeile) {
      const roh = Buffer.from(zeile.slice(1), 'base64');
      const d = createDecipheriv('aes-256-gcm', empfangen, iv(ze++));
      d.setAuthTag(roh.subarray(0, 16));
      return Buffer.concat([d.update(roh.subarray(16)), d.final()]).toString('utf8');
    }
  };
}

/** `host` darf auch '::1' sein. */
function gast(port, passwort, name, host = '127.0.0.1') {
  const s = net.connect({ host, port });
  s.setEncoding('utf8');
  let rest = '';
  let leitung = null;
  const g = {
    alle: [],
    ich: null,
    getrennt: false,
    verschluesselt: false,
    /** Ob eine Zeile nach der Anmeldung im Klartext kam (darf nicht). */
    klartextNachAnmeldung: false,
    schreibe: (n) => s.write(leitung ? leitung.verpacke(JSON.stringify(n)) : `${JSON.stringify(n)}\n`),
    zu: () => s.destroy()
  };
  s.on('data', (stueck) => {
    rest += stueck;
    const teile = rest.split('\n');
    rest = teile.pop();
    for (const t of teile) {
      if (!t.trim()) continue;
      let klar = t;
      if (t.startsWith('~')) {
        if (!leitung) continue;
        klar = leitung.entpacke(t);
      } else if (leitung) g.klartextNachAnmeldung = true;
      const n = JSON.parse(klar);
      g.alle.push(n);
      if (n.typ === 'herausforderung') {
        const gastNonce = randomBytes(16).toString('hex');
        let nachweis = '';
        let neu = null;
        if (n.salz && passwort) {
          const stamm = scryptSync(passwort.normalize('NFC'), `ttrpg-raum|${n.salz}`, 32, SCRYPT);
          nachweis = createHmac('sha256', stamm).update(`nachweis|${n.nonce}|${gastNonce}`).digest('hex');
          neu = schutz(stamm, n.nonce, gastNonce);
        }
        s.write(`${JSON.stringify({ typ: 'hallo', name, nachweis, version: 2, gastNonce })}\n`);
        leitung = neu;
        g.verschluesselt = Boolean(neu);
      }
      if (n.typ === 'willkommen') g.ich = n.du;
      // Wie die App: ein Ping des Gastgebers wird sofort beantwortet.
      if (n.typ === 'ping') g.schreibe({ typ: 'pong', n: n.n });
    }
  });
  s.on('error', () => undefined);
  s.on('close', () => {
    g.getrennt = true;
  });
  return g;
}

module.exports = { gast };
