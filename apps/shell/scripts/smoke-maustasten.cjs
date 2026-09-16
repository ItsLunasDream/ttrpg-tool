/**
 * Die Daumentasten der Maus: zurueck und vorwaerts.
 *
 * Der Fall, der gemeldet wurde: der Zeiger liegt ueber einem eingebetteten
 * Werkzeug, nicht ueber der Huelle. Genau dort greift Chromium die
 * Seitentasten unter Windows selbst ab, und `app-command` am Fenster kommt
 * nie an.
 *
 * Geprueft wird mit ECHTEN Tastenereignissen ueber xdotool (X11-Taste 8 ist
 * zurueck, 9 ist vorwaerts) — ein `dispatchEvent` aus der Seite heraus
 * bewiese hier nichts, weil es genau den Weg ueberspringt, um den es geht.
 * Ohne xdotool meldet sich der Test ab, statt gruen zu behaupten, er haette
 * etwas geprueft.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-maustasten.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'maustasten-'));
app.setPath('userData', path.join(tmp, 'userData'));
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

process.on('unhandledRejection', (grund) => {
  console.log('FEHLER: unbehandelte Ablehnung:', grund);
  app.exit(1);
});

function habenWirXdotool() {
  try {
    execFileSync('xdotool', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Ein echtes Tastenereignis auf die Mitte des Fensters. */
function taste(nummer) {
  execFileSync('xdotool', ['mousemove', '600', '420']);
  execFileSync('xdotool', ['click', String(nummer)]);
}

app.whenReady().then(async () => {
  if (!habenWirXdotool()) {
    console.log('\nxdotool fehlt — dieser Test prueft nichts und meldet sich ab.');
    console.log('Unter Debian/Ubuntu: apt-get install -y xdotool');
    app.exit(0);
    return;
  }

  await warte(4000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1200, height: 800 });
  await warte(600);
  const huelle = fenster.contentView.children[0];
  const js = (a) => huelle.webContents.executeJavaScript(a);

  const konsole = [];
  huelle.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // Die Einfuehrung beim ersten Start steht sonst vor allem anderen.
  if (await js("Boolean(document.querySelector('.dialog__knopf'))")) {
    await js("document.querySelector('.dialog__knopf').click(); true");
    await warte(400);
  }

  const aktiv = () => js("document.querySelector('.titelleiste__pfad')?.textContent ?? ''");

  console.log('\nZwei Werkzeuge oeffnen:');
  await js("document.querySelector('.kachel--bereit').click(); true");
  await warte(5000);
  if (await js("Boolean(document.querySelector('.dialog__knopf'))")) {
    await js("document.querySelector('.dialog__knopf').click(); true");
    await warte(400);
  }
  const erstes = await aktiv();
  pruefe(erstes.length > 0, `das erste Werkzeug liegt vorn (${erstes})`);

  await js("document.querySelector('.schiene__heim').click(); true");
  await warte(1500);
  await js("[...document.querySelectorAll('.kachel--bereit')][1].click(); true");
  await warte(5000);
  if (await js("Boolean(document.querySelector('.dialog__knopf'))")) {
    await js("document.querySelector('.dialog__knopf').click(); true");
    await warte(400);
  }
  const zweites = await aktiv();
  pruefe(zweites !== erstes, `das zweite liegt vorn (${zweites})`);

  console.log('\nZurueck mit der Daumentaste, waehrend das Werkzeug vorn liegt:');
  taste(8);
  await warte(2500);
  const nachZurueck = await aktiv();
  pruefe(nachZurueck !== zweites, `die Taste hat den Verlauf bewegt (${nachZurueck || 'Startmenue'})`);

  console.log('\nUnd wieder vorwaerts:');
  taste(9);
  await warte(2500);
  const nachVor = await aktiv();
  pruefe(nachVor === zweites, `vorwaerts fuehrt zurueck zum zweiten (${nachVor})`);

  console.log('\nEin Druck ist ein Schritt, nicht zwei:');
  // Wo beide Wege tragen — app-command UND die Taste im Dokument —, faenge
  // eine fehlende Sperrfrist hier an: ein Druck spraenge zwei Stellen weit.
  taste(8);
  await warte(2500);
  const einSchritt = await aktiv();
  pruefe(
    einSchritt === nachZurueck,
    `ein Druck geht genau einen Schritt (${einSchritt || 'Startmenue'} statt ${nachZurueck || 'Startmenue'})`
  );

  /*
   * Der neue Weg, fuer sich allein.
   *
   * Die Pruefungen oben belegen ihn NICHT: unter Linux traegt `app-command`
   * am Fenster schon allein, sie waren auch ohne den neuen Weg gruen. Der
   * Bericht kam aber von Windows, wo genau dieser Weg fehlt.
   *
   * Hier wird deshalb ein Ereignis im Dokument der eingebetteten Ansicht
   * ausgeloest — von der Seite aus, nicht vom System. `app-command` kann
   * dabei nicht mitspielen, es entsteht nur aus einer echten Taste. Bewegt
   * sich der Verlauf trotzdem, kann es allein am Preload gelegen haben.
   */
  console.log('\nDer Weg ueber das Dokument, ohne Zutun des Systems:');
  // Nach dem letzten Schritt zurueck steht das Startmenue da — dort gibt es
  // keine Schiene, und ein Klick darauf waere ein Fehler im Test.
  if (await js("Boolean(document.querySelector('.schiene__heim'))")) {
    await js("document.querySelector('.schiene__heim').click(); true");
    await warte(1500);
  }
  await js("document.querySelector('.kachel--bereit').click(); true");
  await warte(5000);
  if (await js("Boolean(document.querySelector('.dialog__knopf'))")) {
    await js("document.querySelector('.dialog__knopf').click(); true");
    await warte(400);
  }
  const vorSynthetisch = await aktiv();

  const werkzeug = fenster.contentView.children.find(
    (sicht) => sicht !== huelle && sicht.webContents.getURL().includes('/apps/')
  );
  pruefe(Boolean(werkzeug), 'die Ansicht des Werkzeugs ist da');
  if (werkzeug) {
    const wurf = await werkzeug.webContents.executeJavaScript(
      "(() => { try { window.dispatchEvent(new MouseEvent('mouseup', { button: 3, bubbles: true })); return 'ok'; } catch (f) { return 'FEHLER: ' + f.message; } })()"
    );
    console.log(`  (Ansicht ${werkzeug.webContents.getURL().slice(-40)}: ${wurf})`);
    await warte(2500);
    const danach = await aktiv();
    pruefe(
      danach !== vorSynthetisch,
      `das Preload des Werkzeugs meldet die Taste (${danach || 'Startmenue'} statt ${vorSynthetisch})`
    );
  }

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nMaustasten bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
