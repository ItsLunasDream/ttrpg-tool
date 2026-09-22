/**
 * Rauchtest: das Farbthema gilt fuer das ganze Fenster.
 *
 * Die Modultests in packages/farben pruefen die Paletten selbst — dass jede
 * Rolle besetzt ist und dass der Kontrast reicht. Was sie nicht sehen
 * koennen: ob die Farben ueberhaupt ankommen, und zwar in der Huelle UND in
 * einem eingebetteten Werkzeug. Genau dort steckte der Zweck: die Werkzeuge
 * hatten dieselbe Palette bisher je einzeln in ihrer styles.css stehen.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-farben.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'farben-smoke-'));
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

const einstellungsDatei = path.join(userData, 'einstellungen.json');
const aufDerPlatte = () => JSON.parse(fs.readFileSync(einstellungsDatei, 'utf8'));

/** Die gerade wirksame Farbe einer Rolle, wie der Browser sie berechnet. */
const geleseneFarbe = (rolle) =>
  `getComputedStyle(document.documentElement).getPropertyValue('--f-${rolle}').trim()`;

app.whenReady().then(async () => {
  await warte(4000);
  const fenster = BaseWindow.getAllWindows()[0];
  if (!fenster) {
    console.log('  FEHL kein Fenster');
    app.exit(1);
    return;
  }
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 860 });
  const sicht = fenster.contentView.children[0];
  if (!sicht?.webContents) {
    console.log('  FEHL die Oberflaeche der Huelle steht nicht');
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);

  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // --- Die Vorgabe --------------------------------------------------------
  //
  // „Nacht" ist die Palette, die die Sammlung vorher hatte. Wer nichts
  // umstellt, soll keinen Unterschied sehen.
  pruefe(
    (await js(geleseneFarbe('grund'))) === '#14161c',
    `die Huelle traegt die Vorgabe (${await js(geleseneFarbe('grund'))})`
  );
  pruefe(
    (await js("getComputedStyle(document.body).backgroundColor")) === 'rgb(20, 22, 28)',
    `und der Hintergrund kommt wirklich daher (${await js('getComputedStyle(document.body).backgroundColor')})`
  );

  // --- Ein Werkzeug oeffnen ------------------------------------------------
  await js(`(() => { const k=[...document.querySelectorAll('.kachel:not(:disabled)')]
    .find(x => /Initiative/.test(x.textContent)); if(!k) return false; k.click(); return true; })()`);
  await warte(5000);

  const werkzeug = fenster.contentView.children.find((v) =>
    v.webContents.getURL().includes('/apps/initiative/')
  );
  pruefe(Boolean(werkzeug), 'der Initiative Tracker kommt hoch');
  if (!werkzeug) {
    app.exit(1);
    return;
  }
  const wjs = (a) => werkzeug.webContents.executeJavaScript(a);

  pruefe(
    (await wjs(geleseneFarbe('grund'))) === '#14161c',
    `auch im Werkzeug steht die Vorgabe (${await wjs(geleseneFarbe('grund'))})`
  );

  // --- Umstellen -----------------------------------------------------------
  //
  // „Pergament" ist hell — der Unterschied ist damit nicht nur ein anderer
  // Blauton, sondern die Richtung.
  await js("window.shell.einstellungen.schreiben({ thema: 'pergament' }); true");
  await warte(1500);

  pruefe(aufDerPlatte().thema === 'pergament', 'die Wahl landet auf der Platte');
  pruefe(
    (await js(geleseneFarbe('grund'))) === '#f4ecdd',
    `die Huelle faerbt sich um (${await js(geleseneFarbe('grund'))})`
  );

  // Das ist der eigentliche Punkt: das Werkzeug laeuft in einer eigenen
  // Ansicht und bekommt die Regel eingespritzt.
  pruefe(
    (await wjs(geleseneFarbe('grund'))) === '#f4ecdd',
    `und das Werkzeug zieht mit (${await wjs(geleseneFarbe('grund'))})`
  );
  // Nicht nur die Variable, sondern das, was daraus wird: der Tracker
  // leitet sein `--grund` daraus ab.
  pruefe(
    (await wjs("getComputedStyle(document.body).backgroundColor")) === 'rgb(244, 236, 221)',
    `der Hintergrund des Werkzeugs folgt (${await wjs('getComputedStyle(document.body).backgroundColor')})`
  );
  pruefe(
    (await wjs('getComputedStyle(document.documentElement).colorScheme')) === 'light',
    `und das System weiss, dass es hell ist (${await wjs('getComputedStyle(document.documentElement).colorScheme')})`
  );

  // --- Noch einmal umstellen -----------------------------------------------
  //
  // Beim zweiten Wechsel muss die vorige eingespritzte Regel weg sein. Ohne
  // das stapeln sich die Themen, und welches gewinnt, waere Zufall.
  await js("window.shell.einstellungen.schreiben({ thema: 'wald' }); true");
  await warte(1500);
  pruefe(
    (await wjs(geleseneFarbe('grund'))) === '#12180f',
    `ein zweiter Wechsel ersetzt den ersten (${await wjs(geleseneFarbe('grund'))})`
  );
  pruefe(
    (await wjs('getComputedStyle(document.documentElement).colorScheme')) === 'dark',
    'und die Richtung stimmt wieder'
  );

  // --- Unsinn faellt auf die Vorgabe zurueck -------------------------------
  await js("window.shell.einstellungen.schreiben({ thema: 'gibtesnicht' }); true");
  await warte(1200);
  pruefe(
    aufDerPlatte().thema === 'nacht',
    `eine unbekannte Kennung wird zur Vorgabe (${aufDerPlatte().thema})`
  );

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);

  console.log(fehler.length === 0 ? '\nFarbthemen bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
