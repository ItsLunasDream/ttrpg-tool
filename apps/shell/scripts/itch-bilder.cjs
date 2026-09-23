/**
 * Bilder fuer die Projektseite auf itch.io (docs/itchio.md).
 *
 * Startet die Huelle mit einem vorbereiteten Datenordner, oeffnet der Reihe
 * nach die Werkzeuge und nimmt jede Ansicht auf: die Huelle und das
 * eingebettete Werkzeug getrennt, dazu ihre Lage im Fenster. Zusammengesetzt
 * werden sie von scripts/itch-bilder.py — Electron kann zwei Ansichten
 * nicht in ein Bild legen.
 *
 * Aufruf: ZIEL=<ordner> xvfb-run -a electron scripts/itch-bilder.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const ziel = process.env.ZIEL || path.join(os.tmpdir(), 'itch-bilder');
fs.mkdirSync(ziel, { recursive: true });
const sprache = process.env.SPRACHE === 'de' ? 'de' : 'en';

// Der Story Creator fehlt: ohne Kampagne zeigt er nur einen Knopf.
const WERKZEUGE = ['initiative', 'monster', 'inspiration', 'nachschlagewerk', 'npc', 'dice', 'loot', 'encounter'];

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'itch-'));
fs.writeFileSync(
  path.join(userData, 'einstellungen.json'),
  JSON.stringify({ language: sprache, einfuehrungGesehen: ['suite', ...WERKZEUGE, 'mapmaker', 'zustaende', 'magicitems'] })
);
// Ein laufender Kampf, damit der Tracker nicht leer dasteht.
const koerper = (id, hp, hpMax) => ({ id, marke: '', hp, hpMax, tempHp: 0, raus: false });
const figur = (id, name, ini, spieler, hp, hpMax, zustaende = []) => ({
  id, name, initiative: ini, feinwert: 0, istSpieler: spieler, istTerrain: false,
  koerper: [koerper(`${id}k`, hp, hpMax)], zustaende, bild: null, notiz: ''
});
fs.mkdirSync(path.join(userData, 'initiative'), { recursive: true });
fs.writeFileSync(
  path.join(userData, 'initiative', 'kampf.json'),
  JSON.stringify({
    schemaVersion: 1, begegnungId: null, name: sprache === 'de' ? 'Hinterhalt an der Brücke' : 'Ambush at the bridge',
    amZug: 1, runde: 2, laeuft: true,
    teilnehmer: [
      figur('a', 'Mira', 19, true, 21, 24),
      figur('b', sprache === 'de' ? 'Ork-Häuptling' : 'Orc Chief', 16, false, 38, 60,
        [{ id: 'z1', name: sprache === 'de' ? 'Liegend' : 'Prone', dauer: 'offen', rundenRest: null, frisch: false }]),
      figur('c', 'Borin', 14, true, 30, 30),
      figur('d', sprache === 'de' ? 'Wolf' : 'Wolf', 12, false, 4, 11),
      figur('e', 'Selene', 9, true, 12, 18)
    ]
  })
);
app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

/** Ein Klick auf einen Knopf mit passendem Text, wenn es einen gibt. */
const klicke = (muster) => `(() => { const b = [...document.querySelectorAll('button')]
  .find(x => !x.disabled && ${muster}.test(x.textContent.trim())); if (b) b.click(); return Boolean(b); })()`;
const HANDLUNG = {
  encounter: `(() => { const k = (m) => [...document.querySelectorAll('button')].find(b => !b.disabled && m.test(b.textContent.trim()));
    k(/New encounter|Neue Begegnung/i)?.click();
    return new Promise(r => setTimeout(() => { const b = k(/^(Build|Zusammenstellen)$/); b?.click(); r(Boolean(b)); }, 800)); })()`,
  monster: klicke('/^(Generate|Erzeugen|Roll|Würfeln)/i'),
  npc: klicke('/^(New character|Neue Figur|Neuer Charakter)/i'),
  // Zwei W20 und ein W6, dann werfen.
  dice: `(() => { const k = [...document.querySelectorAll('button')].filter(b => /^d(20|6)$/.test(b.getAttribute('aria-label') || b.title || ''));
    const w = (n) => [...document.querySelectorAll('button, [role=button]')].find(b => (b.getAttribute('aria-label') || b.title || b.textContent).trim() === n);
    for (const n of ['d20', 'd20', 'd6']) w(n)?.click();
    return new Promise(r => setTimeout(() => { const roll = [...document.querySelectorAll('button')].find(b => !b.disabled && /^(Roll|Würfeln)$/.test(b.textContent.trim())); roll?.click(); r(Boolean(roll)); }, 300)); })()`,
  inspiration: klicke('/^(Roll|Würfeln|Generate|Erzeugen)/i'),
  nachschlagewerk: `(() => { const f = document.querySelector('input'); if (!f) return false;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(f, 'Fireball');
    f.dispatchEvent(new Event('input', { bubbles: true }));
    return new Promise(r => setTimeout(() => { const e = document.querySelector('button.eintrag[data-regel]'); e?.click(); r(Boolean(e)); }, 500)); })()`
};

/** Die Huelle und, wenn eins offen ist, das Werkzeug darueber. */
async function nimmAuf(fenster, name, werkzeug) {
  const teile = [];
  const ansichten = [fenster.contentView.children[0], ...(werkzeug ? [werkzeug] : [])];
  for (const [i, sicht] of ansichten.entries()) {
    const b = sicht.getBounds();
    if (b.width === 0 || b.height === 0) continue;
    const datei = `${name}-${i}.png`;
    fs.writeFileSync(path.join(ziel, datei), (await sicht.webContents.capturePage()).toPNG());
    teile.push({ datei, ...b });
  }
  return { name, teile };
}

app.whenReady().then(async () => {
  await warte(4500);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 720 });
  await warte(800);
  const huelle = fenster.contentView.children[0];
  const hjs = (a) => huelle.webContents.executeJavaScript(a);
  const bilder = [await nimmAuf(fenster, '00-start')];

  for (const [n, id] of WERKZEUGE.entries()) {
    // Ueber die Startseite: dort stehen die Kacheln.
    await hjs(`(() => { const h = document.querySelector('.schiene__heim'); if (h) h.click(); return true; })()`);
    await warte(900);
    await hjs(`(() => { const k = document.querySelector('[data-app="${id}"]'); if (k) k.click(); return Boolean(k); })()`);
    await warte(3500);
    const sicht = fenster.contentView.children.find((v) => v !== huelle && v.webContents.getURL().includes(`/apps/${id}/`));
    if (sicht && HANDLUNG[id]) {
      const ok = await sicht.webContents.executeJavaScript(HANDLUNG[id]).catch(() => false);
      console.log(`  ${id}: Handlung ${ok ? 'ausgefuehrt' : 'nicht gefunden'}`);
      await warte(1500);
    }
    bilder.push(await nimmAuf(fenster, `${String(n + 1).padStart(2, '0')}-${id}`, sicht));
    if (!sicht) console.log(`  ${id}: keine Ansicht gefunden`);
  }
  fs.writeFileSync(path.join(ziel, 'bilder.json'), JSON.stringify({ breite: 1280, hoehe: 720, bilder }, null, 2));
  console.log(`${bilder.length} Aufnahmen in ${ziel}`);
  app.exit(0);
});
