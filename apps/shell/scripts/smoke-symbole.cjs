/**
 * Eigene Bilder als Symbole der Werkzeuge.
 *
 * Geprueft wird beides: dass ein Bild im Ordner wirklich benutzt wird, und
 * dass ein fehlendes oder kaputtes still auf das eingebaute zurueckfaellt.
 * Der zweite Fall ist der wichtigere — ein Symbol ist kein Grund fuer eine
 * Fehlermeldung, und wer ein Bild falsch abspeichert, soll kein kaputtes
 * Programm vorfinden.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-symbole.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'symbole-'));
const userData = path.join(tmp, 'userData');
const ordner = path.join(userData, 'symbole');
fs.mkdirSync(ordner, { recursive: true });

/*
 * Ein winziges PNG, vier mal vier Pixel, magenta. Von Hand hingeschrieben
 * statt erzeugt: so haengt der Test an keiner Bildbibliothek, und die Bytes
 * sind nachlesbar.
 */
const MAGENTA_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+F' +
    'ABJvBQBZbAKDAAAAAElFTkSuQmCC',
  'base64'
);
fs.writeFileSync(path.join(ordner, 'dice.png'), MAGENTA_PNG);
// Eine Datei mit richtiger Endung, aber unbrauchbarem Inhalt.
fs.writeFileSync(path.join(ordner, 'initiative.png'), 'das ist kein Bild');
// Eine, die viel zu gross ist: drei Megabyte.
fs.writeFileSync(path.join(ordner, 'mapmaker.png'), Buffer.alloc(3 * 1024 * 1024, 7));
// Und eine mit einem Format, das nicht vorgesehen ist.
fs.writeFileSync(path.join(ordner, 'npc.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');

app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

app.whenReady().then(async () => {
  await warte(4000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1200, height: 800 });
  await warte(600);
  const sicht = fenster.contentView.children[0];
  const js = (a) => sicht.webContents.executeJavaScript(a);

  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // --- Was der Hauptprozess gelesen hat ------------------------------------
  const gelesen = await js('window.shell.symbole.lesen()');
  pruefe(typeof gelesen.dice === 'string', 'das eigene Bild wurde gelesen');
  pruefe(
    (gelesen.dice ?? '').startsWith('data:image/png;base64,'),
    'und kommt als data:-URL an'
  );
  pruefe(!('mapmaker' in gelesen), 'ein zu grosses Bild wird uebersprungen');
  pruefe(!('npc' in gelesen), 'ein nicht vorgesehenes Format ebenfalls');
  pruefe(!('backstory' in gelesen), 'wo keine Datei liegt, steht auch nichts');
  // Die kaputte Datei hat die richtige Endung: sie wird gelesen und
  // weitergereicht. Aussortiert wird sie erst in der Oberflaeche, wenn der
  // Browser sie nicht anzeigen kann.
  pruefe('initiative' in gelesen, 'eine kaputte Datei kommt zunaechst durch');

  // --- Und was in der Oberflaeche steht ------------------------------------
  /*
   * Die Reihenfolge der Kacheln ist die aus shared/apps.ts: backstory,
   * mapmaker, initiative, dice, npc, encounter. Nur dice hat ein brauchbares
   * Bild — alle anderen muessen das eingebaute Symbol zeigen, auch die mit
   * der kaputten Datei.
   */
  const bilder = await js(
    "[...document.querySelectorAll('.kachel__icon')].map(e => e.firstElementChild.tagName).join(',')"
  );
  pruefe(bilder.includes('IMG'), `mindestens eine Kachel zeigt ein Bild (${bilder})`);
  pruefe(bilder.includes('svg'), 'und mindestens eine das eingebaute Symbol');

  // Die kaputte Datei: das img meldet einen Fehler, und die Oberflaeche
  // faellt auf das eingebaute Symbol zurueck.
  await warte(800);
  const nachFehler = await js(
    "[...document.querySelectorAll('.kachel__icon')].map(e => e.firstElementChild.tagName).join(',')"
  );
  pruefe(
    (nachFehler.match(/IMG/g) ?? []).length === 1,
    `nur das brauchbare Bild bleibt stehen (${nachFehler})`
  );

  // --- Der Ordner wird beim Start angelegt, samt Liesmich ------------------
  pruefe(fs.existsSync(path.join(ordner, 'LIESMICH.txt')), 'eine Liesmich liegt im Ordner');
  const liesmich = fs.readFileSync(path.join(ordner, 'LIESMICH.txt'), 'utf8');
  pruefe(liesmich.includes('backstory.png'), 'und nennt die erwarteten Dateinamen');

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);

  console.log(fehler.length === 0 ? '\nSymbole bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
