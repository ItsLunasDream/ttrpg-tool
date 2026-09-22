/**
 * Rauchtest: der Encounter Creator, erste Stufe.
 *
 * Geprueft wird der Weg, den die Modultests nicht sehen: Kachel anklicken,
 * Begegnung anlegen, benennen, speichern — und ob sie nach einem Neustart
 * des Werkzeugs noch da ist. Genau an dieser Naht ist bisher am meisten
 * schiefgegangen.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-encounter.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'encounter-smoke-'));
const userData = path.join(tmp, 'userData');
fs.mkdirSync(userData, { recursive: true });

/*
 * Ein Monster, das schon da liegt, bevor die Anwendung startet.
 *
 * Zweimal `monster` im Pfad: die Huelle gibt dem Werkzeug seinen eigenen
 * Unterordner, und die Ablage legt darin noch einen an. Genau die Stelle,
 * an der die Suche der Huelle lange danebengegriffen hat.
 */
const monsterordner = path.join(userData, 'monster', 'monster');
fs.mkdirSync(monsterordner, { recursive: true });
fs.writeFileSync(
  path.join(monsterordner, 'bounty-hounter.md'),
  [
    '---',
    'id: bounty-hounter',
    'name: Bounty Hounter',
    'cr: "5"',
    'thema: untot',
    'rolle: jaeger',
    'tp: 90',
    'rk: 15',
    'geaendert: 2026-09-22T09:00:00.000Z',
    '---',
    '',
    '# Bounty Hounter',
    ''
  ].join('\n'),
  'utf8'
);

app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

const ordner = path.join(userData, 'encounter', 'encounter');
const dateien = () => {
  try {
    return fs.readdirSync(ordner).filter((d) => d.endsWith('.md'));
  } catch {
    return [];
  }
};

setTimeout(() => {
  console.log('\nABBRUCH: Zeitwaechter');
  app.exit(2);
}, 130000);

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

  // --- Die Kachel ist nicht mehr „spaeter" --------------------------------
  const marke = await hjs(
    `document.querySelector('.kachel[data-app="encounter"]')?.className ?? 'fehlt'`
  );
  pruefe(/kachel--bereit/.test(marke), `die Kachel ist bereit (${marke})`);

  await hjs(
    `(() => { const k = document.querySelector('.kachel[data-app="encounter"]:not(:disabled)');
      if (k) k.click(); return Boolean(k); })()`
  );
  await warte(5000);

  const sicht = fenster.contentView.children.find((v) =>
    v.webContents.getURL().includes('/apps/encounter/')
  );
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

  pruefe(
    /Encounter Creator/.test(await js('document.body.innerText')),
    'und zeigt seine Ueberschrift'
  );

  // --- Anlegen -------------------------------------------------------------
  await js(
    `[...document.querySelectorAll('button')].find(b => /Neue Begegnung|New encounter/.test(b.textContent)).click(); true`
  );
  await warte(500);
  await js(`(() => {
    const feld = document.querySelector('.feld__eingabe');
    const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setzer.call(feld, 'Hinterhalt am Fluss');
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(300);
  await js(
    `[...document.querySelectorAll('button')].find(b => /Anlegen|Create/.test(b.textContent)).click(); true`
  );
  await warte(900);

  pruefe(dateien().length === 1, `die Begegnung liegt auf der Platte (${dateien().join(', ')})`);
  pruefe(
    dateien()[0] === 'hinterhalt-am-fluss.md',
    `und zwar unter einem lesbaren Namen (${dateien()[0]})`
  );

  // --- Eine Notiz dazu, speichern -----------------------------------------
  await js(`(() => {
    const flaeche = document.querySelector('.feld__flaeche');
    if (!flaeche) return false;
    const setzer = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setzer.call(flaeche, 'Die Bruecke bricht in Runde 3.');
    flaeche.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(300);
  await js(
    `[...document.querySelectorAll('button')].find(b => /^(Speichern|Save)$/.test(b.textContent.trim())).click(); true`
  );
  await warte(900);

  const aufDerPlatte = fs.readFileSync(path.join(ordner, 'hinterhalt-am-fluss.md'), 'utf8');
  pruefe(/Die Bruecke bricht in Runde 3\./.test(aufDerPlatte), 'die Notiz steht in der Datei');
  pruefe(/^---/.test(aufDerPlatte) && /name: /.test(aufDerPlatte), 'mit Kopfzahlen darueber');

  // --- Monster aus der eigenen Sammlung ------------------------------------
  //
  // Sie liegen schon auf der Platte, ohne dass der Monster Creator in
  // dieser Sitzung offen war. Genau das ist der Grundsatz: die Werkzeuge
  // treffen sich ueber Dateien, nicht ueber einen Kanal.
  pruefe(
    (await js("document.querySelectorAll('.monsterzeile').length")) === 1,
    'das Monster aus der Sammlung steht zur Auswahl'
  );
  pruefe(
    /Bounty Hounter/.test(await js("document.querySelector('.monsterzeile')?.textContent ?? ''")),
    'und zwar mit seinem Namen'
  );

  // Suchen: Teilwort, Thema, Grad.
  for (const [wort, erwartet] of [
    ['bounty', 1],
    ['untot', 1],
    ['cr 5', 1],
    ['drache', 0]
  ]) {
    await js(`(() => {
      const feld = document.querySelector('input[type=search]');
      const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setzer.call(feld, ${JSON.stringify(wort)});
      feld.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await warte(250);
    const treffer = await js("document.querySelectorAll('.monsterzeile').length");
    pruefe(treffer === erwartet, `„${wort}" findet ${erwartet} (${treffer})`);
  }

  // Zweimal dazu ergibt Anzahl 2, nicht zwei Zeilen.
  await js(`(() => {
    const feld = document.querySelector('input[type=search]');
    const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setzer.call(feld, '');
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(250);
  await js("document.querySelector('.monsterzeile').click(); true");
  await warte(250);
  await js("document.querySelector('.monsterzeile').click(); true");
  await warte(350);
  pruefe(
    (await js("document.querySelectorAll('.gegnerzeile').length")) === 1,
    'zweimal dasselbe Monster ist eine Zeile'
  );
  pruefe(
    (await js("document.querySelector('.gegnerzeile__anzahl')?.value")) === '2',
    'und zwar mit der Anzahl zwei'
  );

  await js(
    `[...document.querySelectorAll('button')].find(b => /^(Speichern|Save)$/.test(b.textContent.trim())).click(); true`
  );
  await warte(900);
  const mitGegnern = fs.readFileSync(path.join(ordner, 'hinterhalt-am-fluss.md'), 'utf8');
  pruefe(/"anzahl":2/.test(mitGegnern), 'die Gegner stehen im Kopf der Datei');
  pruefe(/- 2× Bounty Hounter/.test(mitGegnern), 'und lesbar im Leib');

  // --- Zwei gleichnamige ueberschreiben einander nicht ---------------------
  await js(
    `[...document.querySelectorAll('button')].find(b => /Zurück zur Liste|Back to the list/.test(b.textContent)).click(); true`
  );
  await warte(500);
  await js(
    `[...document.querySelectorAll('button')].find(b => /Neue Begegnung|New encounter/.test(b.textContent)).click(); true`
  );
  await warte(400);
  await js(`(() => {
    const feld = document.querySelector('.feld__eingabe');
    const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setzer.call(feld, 'Hinterhalt am Fluss');
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(300);
  await js(
    `[...document.querySelectorAll('button')].find(b => /Anlegen|Create/.test(b.textContent)).click(); true`
  );
  await warte(900);
  pruefe(
    dateien().length === 2,
    `die zweite gleichnamige ueberschreibt die erste nicht (${dateien().join(', ')})`
  );

  // --- Die Sammlung --------------------------------------------------------
  await js(
    `[...document.querySelectorAll('button')].find(b => /Zurück zur Liste|Back to the list/.test(b.textContent)).click(); true`
  );
  await warte(700);
  pruefe(
    (await js("document.querySelectorAll('.begegnungskachel').length")) === 2,
    'beide stehen in der Sammlung'
  );

  // --- Die Suche der Huelle findet sie, ohne dass sie offen war ------------
  const eintraege = await hjs('window.shell.suche.eintraege()');
  const meine = (eintraege ?? []).filter((e) => e.werkzeug === 'encounter');
  pruefe(meine.length === 2, `die Suche der Huelle kennt sie (${meine.length})`);

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nEncounter bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
