/**
 * Rauchtest fuer den Fehlerfall: ein Werkzeug, dessen Dateien fehlen.
 *
 * Der Fall ist keine Theorie. Wer die Sammlung frisch auscheckt und nur die
 * Huelle baut, hat genau ihn — und bekam frueher eine Flaeche zu sehen, auf
 * der stand, das Einbetten sei „noch nicht gebaut\". Der Fehler war unsichtbar
 * (eine unbehandelte Ablehnung im Renderer), und der einzige sichtbare Text
 * zeigte in die falsche Richtung.
 *
 * Schlimmer war der zweite Klick: das Montieren meldet die IPC-Kanaele der
 * Anwendung und ihr eigenes Protokoll an, und beides geht nur einmal. Weil ein
 * Ladefehler die ganze Montage mitriss, scheiterte jeder weitere Versuch an
 * „Failed to register protocol\" statt an der fehlenden Datei — das Werkzeug
 * blieb bis zum Neustart der Huelle unbrauchbar, auch nachdem man gebaut
 * hatte. Genau das prueft Schritt 2 und 3.
 *
 * Geprueft wird am Backstory Creator, und das ist keine Beliebigkeit: er ist
 * die Anwendung, die ein eigenes Protokoll (backstory-asset) und eigene
 * IPC-Kanaele anmeldet. Der Karteneditor tut beides nicht — an ihm blieb
 * dieser Test gruen, auch mit dem alten, kaputten Stand. Ein Test, der den
 * Fehler nicht faengt, ist keiner.
 *
 * Der Test nimmt ihm kurz seine index.html weg und legt sie hinterher
 * zurueck, auch wenn er unterwegs abbricht.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shell-fehl-'));
app.setPath('userData', path.join(tmp, 'userData'));

const INDEX = path.join(__dirname, '..', '..', 'backstory', 'dist', 'renderer', 'index.html');
const BEISEITE = `${INDEX}.rauchtest-weg`;

function nimmWeg() {
  fs.renameSync(INDEX, BEISEITE);
}
function legZurueck() {
  if (fs.existsSync(BEISEITE)) fs.renameSync(BEISEITE, INDEX);
}
// Auch bei Absturz oder Abbruch: die Datei gehoert zurueck.
process.on('exit', legZurueck);
process.on('SIGINT', () => process.exit(130));
process.on('uncaughtException', (fehler) => {
  console.error(fehler);
  process.exit(1);
});

nimmWeg();
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const fehlschlaege = [];
function pruefe(bedingung, beschreibung) {
  if (bedingung) console.log(`  ok   ${beschreibung}`);
  else {
    console.log(`  FEHL ${beschreibung}`);
    fehlschlaege.push(beschreibung);
  }
}

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

app.whenReady().then(async () => {
  await warte(2500);
  const fenster = BaseWindow.getAllWindows()[0];
  const huelle = fenster?.contentView?.children?.[0];
  if (!huelle) {
    console.log('  FEHL Die Huelle ist nicht hochgekommen');
    app.exit(1);
    return;
  }
  const js = (ausdruck) => huelle.webContents.executeJavaScript(ausdruck);
  const stoerung = () => js("document.querySelector('.stoerung__titel')?.textContent ?? ''");
  const detail = () => js("document.querySelector('.stoerung__detail')?.textContent ?? ''");
  const rat = () => js("document.querySelector('.stoerung__text')?.textContent ?? ''");

  // Der Backstory Creator ist der erste Eintrag in den Kacheln.
  await js("document.querySelectorAll('.kachel')[0].click(); true");
  await warte(3000);

  pruefe(Boolean(await stoerung()), `eine Stoerung wird gemeldet ("${await stoerung()}")`);
  pruefe(
    (await detail()).includes('ERR_FILE_NOT_FOUND'),
    'die Meldung nennt den echten Fehler'
  );
  pruefe(
    (await rat()).includes('npm run build'),
    `und sagt, was zu tun ist ("${(await rat()).slice(0, 60)}...")`
  );
  pruefe(
    !(await js("Boolean(document.querySelector('.platzhalter'))")),
    'und nicht der Platzhalter, der behauptet, das Einbetten fehle noch'
  );

  // Zweiter Versuch, Datei fehlt weiterhin: es muss *dieselbe* Meldung sein.
  await js("document.querySelector('.stoerung__knopf').click(); true");
  await warte(3000);
  const zweiterDetail = await detail();
  pruefe(
    zweiterDetail.includes('ERR_FILE_NOT_FOUND'),
    `der zweite Versuch meldet weiter die fehlende Datei (${zweiterDetail.slice(0, 70)})`
  );
  pruefe(
    !zweiterDetail.includes('register protocol') && !zweiterDetail.includes('second handler'),
    'und scheitert nicht an einer doppelten Anmeldung'
  );

  // Datei zurueck, noch einmal versuchen: jetzt muss es aufgehen — ohne
  // Neustart der Huelle. Das ist der Weg, den eine Person geht: Meldung lesen,
  // bauen, Knopf druecken.
  legZurueck();
  await js("document.querySelector('.stoerung__knopf').click(); true");
  await warte(6000);
  pruefe(!(await stoerung()), `nach dem Nachbauen geht es auf (${(await stoerung()) || 'keine Stoerung'})`);
  pruefe(
    await js("Boolean(document.querySelector('.buehne__flaeche'))"),
    'und die Flaeche gehoert wieder der Anwendung'
  );

  if (fehlschlaege.length) {
    console.log(`\n${fehlschlaege.length} Pruefung(en) fehlgeschlagen.`);
    app.exit(1);
  } else {
    console.log('\nFehlerfall bestanden.');
    app.exit(0);
  }
});
