/**
 * Rauchtest der Huelle: startet die gebaute Anwendung wirklich und prueft die
 * Oberflaeche im laufenden Fenster.
 *
 * Bewusst wird der echte Hauptprozess geladen und kein nachgebautes Fenster
 * aufgemacht. Ein Nachbau haette hier zuerst gemeldet, alles sei in Ordnung,
 * obwohl kein einziger IPC-Kanal registriert war — genau die Sorte Fehler, um
 * derentwillen es diesen Test gibt.
 *
 * Laeuft mit eigenem userData-Verzeichnis, damit der Test die Fensterlage der
 * Person nicht ueberschreibt, die ihn ausfuehrt.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shell-smoke-'));
app.setPath('userData', path.join(tmp, 'userData'));

// Erst jetzt: der Hauptprozess haengt sich an `whenReady` und legt sein
// Fenster im userData-Verzeichnis von oben ab.
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

async function warteAufFenster(versuche = 40) {
  for (let i = 0; i < versuche; i++) {
    const fenster = BaseWindow.getAllWindows()[0];
    const sicht = fenster?.contentView?.children?.[0];
    if (sicht?.webContents && !sicht.webContents.isLoading()) return { fenster, sicht };
    await warte(250);
  }
  return {};
}

app.whenReady().then(async () => {
  const { fenster, sicht } = await warteAufFenster();
  if (!fenster || !sicht) {
    console.error('Kein Fenster mit geladener Ansicht gefunden.');
    app.exit(1);
    return;
  }

  const konsolenfehler = [];
  sicht.webContents.on('console-message', (_e, level, text) => {
    if (level >= 2) konsolenfehler.push(text.slice(0, 200));
  });

  // Das Fenster steht schon; die Oberflaeche darin braucht noch einen Moment
  // fuer ihren ersten Durchlauf samt IPC-Abfragen.
  await warte(1500);
  const js = (ausdruck) => sicht.webContents.executeJavaScript(ausdruck);

  pruefe(fenster.getBounds().width >= 960, 'Fenster mindestens in Mindestbreite');
  pruefe(await js('typeof window.shell === "object"'), 'Preload-Bruecke ist da');
  pruefe(await js("Boolean(document.querySelector('.titelleiste'))"), 'Titelleiste gerendert');
  pruefe(await js("Boolean(document.querySelector('.menue'))"), 'Startmenue gerendert');
  pruefe((await js("document.querySelectorAll('.kachel').length")) >= 5, 'mindestens fuenf Kacheln');
  pruefe(
    (await js("document.querySelectorAll('.kachel svg').length")) ===
      (await js("document.querySelectorAll('.kachel').length")),
    'jede Kachel hat ein Symbol'
  );
  pruefe((await js("document.querySelectorAll('.fensterknopf').length")) === 3, 'drei Fensterknoepfe');
  // Die Schiene erscheint erst, wenn ein Werkzeug gewaehlt ist.
  pruefe(!(await js("Boolean(document.querySelector('.schiene'))")), 'keine Schiene im Startmenue');
  // Prueft, dass die Kanaele wirklich registriert sind: die Fassung kommt aus
  // dem Hauptprozess.
  pruefe(await js("Boolean(document.querySelector('.menue__version'))"), 'Fassung aus dem Hauptprozess');
  // Voreingestellt ist Englisch. Stuende hier Deutsch, waere die
  // Sprachwahl irgendwo ueberschrieben worden.
  pruefe(
    (await js("document.querySelector('.menue__frage').textContent")) ===
      'What would you like to work on?',
    'Oberflaeche startet auf Englisch'
  );

  // Fensterknoepfe echt betaetigen. Die IPC-Kanaele sind der Teil, den die
  // Modultests nicht sehen koennen.
  //
  // Ob das Fenster danach wirklich maximiert ist, haengt aber am
  // Fenstermanager. Unter xvfb, wie es in der CI laeuft, gibt es keinen, und
  // `maximize()` bleibt folgenlos — auch direkt aufgerufen. Deshalb wird das
  // erst geprueft, nachdem festgestellt wurde, dass Maximieren hier ueberhaupt
  // geht. Sonst meldete dieser Test einen Umgebungsmangel als Fehler der
  // Anwendung.
  fenster.maximize();
  await warte(700);
  const maximierenMoeglich = fenster.isMaximized();
  fenster.unmaximize();
  await warte(400);

  await js("document.querySelector('[aria-label=\"Maximize\"]').click()");
  await warte(700);
  if (maximierenMoeglich) {
    pruefe(fenster.isMaximized(), 'Maximieren-Knopf maximiert das Fenster');
    await js("document.querySelector('[aria-label=\"Restore\"]').click()");
    await warte(700);
    pruefe(!fenster.isMaximized(), 'Wiederherstellen-Knopf stellt wieder her');
  } else {
    // Der Kanal wird trotzdem geprueft: der Klick oben haette sonst einen
    // Konsolenfehler hinterlassen, und den faengt die Pruefung am Ende ab.
    console.log('  --   Maximieren uebersprungen: kein Fenstermanager (xvfb)');
  }

  // Wechsel ins Werkzeug: die erste bereite Kachel anklicken. Solange keine
  // bereit ist, wird dieser Teil uebersprungen statt zu scheitern — sonst
  // muesste der Test bei jedem Bauabschnitt umgeschrieben werden.
  if ((await js("document.querySelectorAll('.kachel:not(:disabled)').length")) > 0) {
    await js("document.querySelector('.kachel:not(:disabled)').click()");
    await warte(500);
    pruefe(await js("Boolean(document.querySelector('.schiene'))"), 'Schiene nach Wechsel da');
    pruefe(
      (await js("document.querySelectorAll('.schiene__eintrag:disabled').length")) > 0,
      'geplante Werkzeuge bleiben in der Schiene gesperrt'
    );
    await js("document.querySelector('.schiene__heim').click()");
    await warte(500);
    pruefe(await js("Boolean(document.querySelector('.menue'))"), 'zurueck im Startmenue');
  } else {
    console.log('  --   Kachelwechsel uebersprungen: keine waehlbare Kachel');
  }

  // Die Fensterlage muss nach einem Verschieben auf der Platte stehen. Der
  // Schreibvorgang ist gebuendelt, deshalb das Warten.
  const zustandsDatei = path.join(app.getPath('userData'), 'fenster.json');
  fenster.setBounds({ x: 60, y: 40, width: 1100, height: 800 });
  await warte(1200);
  pruefe(fs.existsSync(zustandsDatei), 'Fensterlage wurde gemerkt');
  if (fs.existsSync(zustandsDatei)) {
    const gemerkt = JSON.parse(fs.readFileSync(zustandsDatei, 'utf8'));
    pruefe(gemerkt.width === 1100 && gemerkt.height === 800, 'die gemerkte Groesse stimmt');
  }

  pruefe(konsolenfehler.length === 0, `keine Konsolenfehler (${konsolenfehler.join(' | ') || 'keine'})`);

  fs.rmSync(tmp, { recursive: true, force: true });
  if (fehlschlaege.length > 0) {
    console.error(`\n${fehlschlaege.length} Pruefung(en) fehlgeschlagen.`);
    app.exit(1);
  } else {
    console.log('\nRauchtest der Huelle bestanden.');
    app.exit(0);
  }
});
