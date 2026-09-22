/**
 * Rauchtest: der Loot Generator.
 *
 * Geprueft wird der Weg, den die Modultests nicht sehen: die Beispiele beim
 * ersten Start, der Wurf direkt von der Kachel, eine neue Tabelle tippen,
 * die auf ein Beispiel verweist, mehrfach wuerfeln, speichern — und dass
 * Strg+K die Tabelle findet.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-loot.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'loot-smoke-'));
const userData = path.join(tmp, 'userData');
fs.mkdirSync(userData, { recursive: true });

app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

setTimeout(() => {
  console.log('\nABBRUCH: Zeitwaechter');
  app.exit(2);
}, 120000);

app.whenReady().then(async () => {
  await warte(4500);
  const fenster = BaseWindow.getAllWindows()[0];
  if (!fenster) {
    console.log('  FEHL kein Fenster');
    app.exit(1);
    return;
  }
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 860 });
  const huelle = fenster.contentView.children[0];
  const hjs = (a) => huelle.webContents.executeJavaScript(a);

  // --- Die Kachel ---------------------------------------------------------
  await hjs(
    `(() => { const k = document.querySelector('.kachel[data-app="loot"]:not(:disabled)');
      if (k) k.click(); return Boolean(k); })()`
  );
  await warte(5000);
  const sicht = fenster.contentView.children.find((v) => v.webContents.getURL().includes('/apps/loot/'));
  pruefe(Boolean(sicht), 'das Werkzeug kommt hoch');
  if (!sicht) {
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);
  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });
  pruefe(/Loot Generator/.test(await js('document.body.innerText')), 'mit seiner Ueberschrift');

  // --- Die Beispiele und der Wurf von der Kachel -----------------------------
  const ordner = path.join(userData, 'loot', 'tabellen');
  const dateien = () => (fs.existsSync(ordner) ? fs.readdirSync(ordner).sort() : []);
  pruefe(dateien().length === 3, `beim ersten Start liegen drei Beispiele da (${dateien().join(', ')})`);
  pruefe((await js("document.querySelectorAll('.tabellenkachel').length")) === 3, 'und stehen als Kacheln in der Liste');

  const bandit = await js(`(() => {
    const k = document.querySelector('[data-schnell="bandit-loot"], [data-schnell="beute-einer-raeuberbande"]');
    if (!k) return '';
    k.click();
    return k.getAttribute('data-schnell');
  })()`);
  await warte(300);
  const schnell = await js("document.querySelector('[data-schnellwurf] .ergebnis__text')?.textContent ?? ''");
  pruefe(Boolean(bandit) && schnell.length > 3, `der Wuerfel auf der Kachel wuerfelt sofort (${schnell.slice(0, 60)})`);
  pruefe(!/\[|\d+d\d+/.test(schnell), 'ohne offene Verweise und ungewuerfelte Wuerfel');

  // --- Eine neue Tabelle -----------------------------------------------------
  await js(`document.querySelector('[data-neu]').click(); true`);
  await warte(300);
  const tippe = (feld, wert) => js(`(() => {
    const el = document.querySelector('[data-feld="${feld}"]');
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(wert)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  const kram = bandit === 'bandit-loot' ? 'Pocket Junk' : 'Taschenkram';
  await tippe('name', 'Rauchtest Truhe');
  await tippe('wuerfel', '1d4');
  await tippe('zeilen', `1-2: [${kram}]\n3: 2d6 Gold`);
  await warte(200);
  const befunde = await js("document.querySelector('[data-befunde]')?.textContent ?? ''");
  pruefe(/4/.test(befunde), `die Luecke bei 4 wird angezeigt (${befunde.slice(0, 80)})`);
  await tippe('zeilen', `1-2: [${kram}]\n3-4: 2d6 Gold`);
  await warte(200);
  pruefe((await js("document.querySelector('[data-befunde]') === null")), 'ohne Luecke keine Befunde');

  await tippe('wuerfel', '');
  await tippe('zeilen', `[${kram}]`);
  await js(`(() => {
    const el = document.querySelector('[data-anzahl]');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '4');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(200);
  await js(`document.querySelector('[data-wuerfeln]').click(); true`);
  await warte(300);
  const wuerfe = await js("[...document.querySelectorAll('[data-ergebnisse] .ergebnis__text')].map(e => e.textContent)");
  pruefe(wuerfe.length === 4, `vier Wuerfe auf einmal (${wuerfe.length})`);
  pruefe(
    new Set(wuerfe).size === 4,
    `Taschenkram ist ohne Zuruecklegen: vier verschiedene (${wuerfe.map((w) => w.slice(0, 18)).join(' | ')})`
  );
  pruefe(dateien().length === 3, 'vor dem Speichern liegt nichts Neues auf der Platte');

  await js(`document.querySelector('[data-speichern]').click(); true`);
  await warte(700);
  pruefe(dateien().includes('rauchtest-truhe.md'), `gespeichert liegt die Tabelle auf der Platte (${dateien().join(', ')})`);
  const inhalt = fs.existsSync(path.join(ordner, 'rauchtest-truhe.md'))
    ? fs.readFileSync(path.join(ordner, 'rauchtest-truhe.md'), 'utf8')
    : '';
  pruefe(inhalt.includes(`- [${kram}]`), 'mit dem Eintrag als Aufzaehlungszeile');

  // --- Die Sammlung und die Suche -------------------------------------------
  await js(`[...document.querySelectorAll('button')].find(b => /Zurück zur Liste|Back to the list/.test(b.textContent)).click(); true`);
  await warte(500);
  pruefe((await js("document.querySelectorAll('.tabellenkachel').length")) === 4, 'die Kachel steht in der Sammlung');
  const eintraege = await hjs('window.shell.suche.eintraege()');
  pruefe(
    (eintraege ?? []).some((e) => e.werkzeug === 'loot' && e.name === 'Rauchtest Truhe'),
    'Strg+K findet die Tabelle'
  );

  if (process.env.BILD) {
    await js(`document.querySelector('[data-id="rauchtest-truhe"]').click(); true`);
    await warte(400);
    await js(`document.querySelector('[data-wuerfeln]').click(); true`);
    await warte(300);
    const bild = await sicht.webContents.capturePage();
    fs.writeFileSync(process.env.BILD, bild.toPNG());
  }

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nLoot Generator bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
