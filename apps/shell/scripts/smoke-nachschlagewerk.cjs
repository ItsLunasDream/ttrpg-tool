/**
 * Rauchtest: das Nachschlagewerk.
 *
 * Geprueft wird der Weg, den die Modultests nicht sehen: Kachel anklicken,
 * Eintrag waehlen, suchen — und vor allem der Sprung aus der Suche der
 * Huelle hinein. Der ist bei diesem Werkzeug der haeufigste Weg: man sucht
 * „liegend" und will die Regel sehen, nicht erst das Werkzeug oeffnen.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-nachschlagewerk.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nachschlagewerk-smoke-'));
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
  const marke = await hjs(
    `document.querySelector('.kachel[data-app="nachschlagewerk"]')?.className ?? 'fehlt'`
  );
  pruefe(/kachel--bereit/.test(marke), `die Kachel ist bereit (${marke})`);

  // --- Die Suche der Huelle findet den offiziellen Bestand -----------------
  //
  // Das ist der eigentliche Gewinn: bisher fand Strg+K nur Selbstgebautes.
  // Gesucht wird ohne dass das Werkzeug je offen war.
  const eintraege = await hjs('window.shell.suche.eintraege()');
  const regeln = (eintraege ?? []).filter((e) => e.werkzeug === 'nachschlagewerk');
  pruefe(regeln.length === 15, `die Suche der Huelle kennt die fuenfzehn Zustaende (${regeln.length})`);
  const liegend = regeln.find((e) => e.kennung === 'zustand/prone');
  pruefe(Boolean(liegend), 'darunter „Liegend"');
  pruefe(
    Boolean(liegend) && /Prone/.test(liegend.stichworte),
    'und zwar auch unter dem englischen Namen'
  );

  // --- Werkzeug oeffnen -----------------------------------------------------
  await hjs(
    `(() => { const k = document.querySelector('.kachel[data-app="nachschlagewerk"]:not(:disabled)');
      if (k) k.click(); return Boolean(k); })()`
  );
  await warte(5000);

  const sicht = fenster.contentView.children.find((v) =>
    v.webContents.getURL().includes('/apps/nachschlagewerk/')
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
    (await js("document.querySelectorAll('.eintrag').length")) === 15,
    'die Liste zeigt alle fuenfzehn'
  );
  // Die Einfuehrung kann beim ersten Oeffnen davor liegen; sie gehoert der
  // Huelle, nicht dem Werkzeug, und stoert die Pruefungen hier nicht.

  // --- Ein Eintrag ---------------------------------------------------------
  await js(`document.querySelector('.eintrag[data-regel="zustand/blinded"]').click(); true`);
  await warte(400);
  const blatt = await js("document.querySelector('.regel')?.innerText ?? ''");
  pruefe(blatt.length > 100, 'der Eintrag steht rechts');
  pruefe(
    (await js("document.querySelectorAll('.regel__punkt strong').length")) >= 2,
    'mit seinen Unterpunkten, hervorgehoben'
  );

  // --- Beide Sprachen nebeneinander ----------------------------------------
  await js(`document.querySelector('button[data-daneben]').click(); true`);
  await warte(300);
  pruefe(
    (await js("document.querySelectorAll('.regel__fassung').length")) === 2,
    'auf Wunsch stehen beide Sprachfassungen nebeneinander'
  );
  pruefe(
    /Blinded/.test(await js("document.querySelector('.regel__fassung[data-sprache=\"en\"]')?.innerText ?? ''")) &&
      /Blind/.test(await js("document.querySelector('.regel__fassung[data-sprache=\"de\"]')?.innerText ?? ''")),
    'und zwar wirklich die englische und die deutsche'
  );

  // --- Suche im Text -------------------------------------------------------
  //
  // „critical hit" steht in keinem Namen, aber im Text von Gelaehmt und
  // Bewusstlos. Wer nachschlaegt, sucht die Stelle, nicht nur den Titel.
  await js(`(() => {
    const feld = document.querySelector('.liste__suche');
    const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setzer.call(feld, 'critical hit');
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(300);
  const treffer = await js("[...document.querySelectorAll('.eintrag')].map(e => e.dataset.regel)");
  pruefe(
    treffer.includes('zustand/paralyzed') && treffer.includes('zustand/unconscious'),
    `die Suche findet auch im Text (${treffer.join(', ')})`
  );
  pruefe(
    (await js("document.querySelectorAll('.eintrag__stelle').length")) > 0,
    'und zeigt die Fundstelle'
  );

  // --- Der Sprung aus der Suche der Huelle ---------------------------------
  const sprung = await hjs(`window.shell.suche.zeige('nachschlagewerk', 'zustand/prone')`);
  pruefe(sprung === true, 'die Huelle stellt den Sprung zu');
  await warte(500);
  pruefe(
    (await js("document.querySelector('.regel')?.dataset.regel ?? ''")) === 'zustand/prone',
    'und der Eintrag ist offen'
  );
  pruefe(
    (await js("document.querySelector('.liste__suche').value")) === '',
    'die alte Suche ist dabei geleert, sonst stuende der Eintrag nicht in der Liste'
  );

  // --- Die Namensnennung ---------------------------------------------------
  pruefe(
    /Systemreferenzdokument 5\.2\.1|System Reference Document 5\.2\.1/.test(
      await js("document.querySelector('.fuss')?.innerText ?? ''")
    ),
    'die vorgeschriebene Namensnennung steht da'
  );

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nNachschlagewerk bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
