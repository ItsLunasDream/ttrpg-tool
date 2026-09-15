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
/*
 * Ein Symbol fuer ein Werkzeug, das es noch gar nicht gibt.
 *
 * „Begegnungen" steht als Kachel da und ist nicht anklickbar. Gelesen wird
 * trotzdem jede Bilddatei im Ordner — der Dateiname ist die Kennung, es gibt
 * keine Liste erlaubter Namen. Wer das Symbol schon hat, soll es auch schon
 * sehen.
 */
fs.writeFileSync(path.join(ordner, 'encounter.png'), MAGENTA_PNG);

/*
 * Ein mitgeliefertes Symbol, wie es aus dem Repository kaeme.
 *
 * Der Ordner liegt im Arbeitsverzeichnis neben dem Quelltext der Huelle;
 * gepackt legt electron-builder ihn nach resources/symbole. Hier wird die
 * erste Lage benutzt, weil der Test aus dem Arbeitsverzeichnis laeuft.
 *
 * `backstory.png` liegt NUR hier und `dice.png` in beiden Ordnern: so laesst
 * sich beides pruefen — dass ein mitgeliefertes ankommt, und dass ein
 * eigenes es sticht.
 */
const mitgeliefert = path.join(__dirname, '..', 'symbole');
const vorhandene = fs.existsSync(mitgeliefert) ? fs.readdirSync(mitgeliefert) : [];
fs.mkdirSync(mitgeliefert, { recursive: true });
fs.writeFileSync(path.join(mitgeliefert, 'backstory.png'), MAGENTA_PNG);
// Ein anderes Bild als das eigene, damit sich die beiden unterscheiden lassen.
fs.writeFileSync(path.join(mitgeliefert, 'dice.png'), Buffer.concat([MAGENTA_PNG, Buffer.alloc(4)]));

/** Raeumt die Testdateien wieder weg — der Ordner gehoert ins Repository. */
function raeumeAuf() {
  for (const datei of fs.readdirSync(mitgeliefert)) {
    if (!vorhandene.includes(datei)) fs.rmSync(path.join(mitgeliefert, datei), { force: true });
  }
}

app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

// Das Aufraeumen haengt am Ende des Prozesses und nicht nur am Ende des
// Ablaufs: bricht der Test irgendwo ab, sollen trotzdem keine Testdateien im
// Repository liegen bleiben.
app.on('will-quit', raeumeAuf);
process.on('exit', raeumeAuf);

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
  pruefe('backstory' in gelesen, 'ein mitgeliefertes Symbol kommt an');
  /*
   * dice.png liegt in BEIDEN Ordnern, mit verschiedenem Inhalt. Geprueft
   * wird, welches gewonnen hat — und zwar an den Bytes, nicht daran, dass
   * sich zwei Werte unterscheiden: die beiden Bilder koennten
   * versehentlich gleich sein, und dann sagte ein Ungleichvergleich nichts.
   */
  const eigenesDice = `data:image/png;base64,${MAGENTA_PNG.toString('base64')}`;
  pruefe(
    gelesen.dice === eigenesDice,
    'und ein eigenes sticht das mitgelieferte mit demselben Namen'
  );
  pruefe(
    typeof gelesen.encounter === 'string',
    'auch ein Symbol fuer ein noch nicht gebautes Werkzeug wird gelesen'
  );
  pruefe(!('gibtsnicht' in gelesen), 'wo nirgends eine Datei liegt, steht auch nichts');
  // Die kaputte Datei hat die richtige Endung: sie wird gelesen und
  // weitergereicht. Aussortiert wird sie erst in der Oberflaeche, wenn der
  // Browser sie nicht anzeigen kann.
  pruefe('initiative' in gelesen, 'eine kaputte Datei kommt zunaechst durch');

  // --- Und was in der Oberflaeche steht ------------------------------------
  /*
   * Die Reihenfolge der Kacheln ist die aus shared/apps.ts: backstory,
   * mapmaker, initiative, dice, npc, inspiration, encounter. Brauchbare
   * Bilder haben dice und encounter — alle anderen muessen das eingebaute
   * Symbol zeigen, auch die mit der kaputten Datei.
   */
  const bilder = await js(
    "[...document.querySelectorAll('.kachel__icon')].map(e => e.firstElementChild.tagName).join(',')"
  );
  pruefe(bilder.includes('IMG'), `mindestens eine Kachel zeigt ein Bild (${bilder})`);
  pruefe(bilder.includes('svg'), 'und mindestens eine das eingebaute Symbol');
  // Die letzte Kachel ist „Begegnungen": geplant, nicht anklickbar — und
  // trotzdem mit eigenem Bild.
  pruefe(
    (await js(
      "[...document.querySelectorAll('.kachel')].at(-1).querySelector('.kachel__icon').firstElementChild.tagName"
    )) === 'IMG',
    'die Kachel des geplanten Werkzeugs zeigt das eigene Bild'
  );

  // Die kaputte Datei: das img meldet einen Fehler, und die Oberflaeche
  // faellt auf das eingebaute Symbol zurueck.
  await warte(800);
  const nachFehler = await js(
    "[...document.querySelectorAll('.kachel__icon')].map(e => e.firstElementChild.tagName).join(',')"
  );
  /*
   * Drei brauchbare Bilder: das eigene fuer dice, das mitgelieferte fuer
   * backstory und das fuer das geplante encounter. Die kaputte Datei
   * (initiative), die zu grosse (mapmaker) und das nicht vorgesehene Format
   * (npc) muessen auf das eingebaute zurueckfallen.
   */
  pruefe(
    (nachFehler.match(/IMG/g) ?? []).length === 3,
    `nur die brauchbaren Bilder bleiben stehen (${nachFehler})`
  );

  // --- Der Ordner wird beim Start angelegt, samt Liesmich ------------------
  pruefe(fs.existsSync(path.join(ordner, 'LIESMICH.txt')), 'eine Liesmich liegt im Ordner');
  const liesmich = fs.readFileSync(path.join(ordner, 'LIESMICH.txt'), 'utf8');
  pruefe(liesmich.includes('backstory.png'), 'und nennt die erwarteten Dateinamen');

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);

  raeumeAuf();
  console.log(fehler.length === 0 ? '\nSymbole bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
