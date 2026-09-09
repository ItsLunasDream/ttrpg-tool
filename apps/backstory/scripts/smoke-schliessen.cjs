/**
 * Rauchtest fuer den Dialog beim Schliessen.
 *
 * Drei Knoepfe, drei Versprechen, und das dritte ist das wichtigste:
 * „Abbrechen\" muss das Schliessen wirklich verhindern. Ein Dialog, der zwar
 * fragt, aber trotzdem schliesst, waere schlimmer als gar keiner — man
 * verlaesst sich darauf.
 *
 * Der Dialog ist ein Fenster des Betriebssystems und laesst sich nicht
 * anklicken. Geprueft wird deshalb ueber `dialog.showMessageBox`: der Test
 * ersetzt es und gibt der Reihe nach jede Antwort zurueck. Das prueft alles
 * ausser dem Zeichnen des Dialogs selbst — also genau das, wo die Fehler
 * sitzen.
 *
 * „Abbrechen" wird in jedem Lauf geprueft — danach ist das Fenster noch da.
 * Fuer den zweiten Knopf ist es zu, und ein zweites Fenster macht der
 * Hauptprozess nicht auf: das Skript laeuft deshalb zweimal, einmal je
 * Ausgang.
 *
 * Aufruf: xvfb-run -a npx electron scripts/smoke-schliessen.cjs [speichern|verwerfen] --no-sandbox
 */
const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'backstory-close-'));
app.setPath('userData', userData);
fs.writeFileSync(
  path.join(userData, 'settings.json'),
  JSON.stringify({ language: 'de', autosaveEnabled: false }),
  'utf8'
);

// Der Dialog wird abgefangen, bevor der Hauptprozess ihn benutzen kann.
const gezeigt = [];
let naechsteAntwort = 2;
dialog.showMessageBox = async (...args) => {
  const optionen = args.length > 1 ? args[1] : args[0];
  gezeigt.push(optionen);
  return { response: naechsteAntwort, checkboxChecked: false };
};

// Nach dem letzten Fenster beendet sich die Anwendung — der Test kaeme dann
// nicht mehr dazu, das Ergebnis zu pruefen. `app.exit` am Ende bleibt davon
// unberuehrt, das ist eine andere Funktion.
app.quit = () => {};

require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

/** Welcher Ausgang in diesem Lauf geprueft wird. */
const MODUS = process.argv.includes('speichern') ? 'speichern' : 'verwerfen';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const problems = [];
function pruefe(bedingung, text) {
  if (bedingung) console.log(`  ok   ${text}`);
  else {
    console.log(`  FEHL ${text}`);
    problems.push(text);
  }
}

async function warteAufFenster() {
  for (let i = 0; i < 100; i++) {
    const [f] = BrowserWindow.getAllWindows();
    if (f) return f;
    await sleep(100);
  }
  throw new Error('Kein Fenster');
}

function run(fenster, body) {
  return fenster.webContents.executeJavaScript(`(() => { ${body} })()`);
}

function clickButton(fenster, label, scope = 'document') {
  return run(
    fenster,
    `const b = [...${scope}.querySelectorAll('button')].find((x) => x.textContent.includes(${JSON.stringify(label)}));
     if (!b) throw new Error('Button nicht gefunden: ' + ${JSON.stringify(label)});
     b.click(); return true;`
  );
}

async function fillDialog(fenster, wert, knopf) {
  await run(
    fenster,
    `const el = document.querySelector('.modal input');
     Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(wert)});
     el.dispatchEvent(new Event('input', { bubbles: true })); return true;`
  );
  await sleep(150);
  await clickButton(fenster, knopf, "document.querySelector('.modal')");
  await sleep(600);
}

async function tippe(fenster, text) {
  await run(
    fenster,
    `const p = document.querySelector('.ProseMirror');
     p.focus(); document.execCommand('insertText', false, ${JSON.stringify(text)}); return true;`
  );
  await sleep(500);
}

function aufDerPlatte(kampagne, titel) {
  const ordner = path.join(userData, 'vault', 'campaigns', kampagne, 'notes');
  try {
    for (const name of fs.readdirSync(ordner)) {
      const inhalt = fs.readFileSync(path.join(ordner, name), 'utf8');
      if (inhalt.includes(`title: ${titel}`)) return inhalt;
    }
  } catch {
    /* noch nichts da */
  }
  return '';
}

app.whenReady().then(async () => {
  try {
    const fenster = await warteAufFenster();
    await new Promise((r) => {
      if (!fenster.webContents.isLoading()) r();
      else fenster.webContents.once('did-finish-load', r);
    });
    await sleep(1000);

    await clickButton(fenster, 'Erste Kampagne anlegen');
    await sleep(400);
    await fillDialog(fenster, 'Testkampagne', 'Anlegen');
    await clickButton(fenster, '+ Charakter');
    await sleep(400);
    await fillDialog(fenster, 'Wichtige Notiz', 'Anlegen');
    const kampagne = fs.readdirSync(path.join(userData, 'vault', 'campaigns'))[0];

    await tippe(fenster, 'DARF-NICHT-VERLOREN-GEHEN');
    pruefe(
      !aufDerPlatte(kampagne, 'Wichtige Notiz').includes('DARF-NICHT-VERLOREN-GEHEN'),
      'Ausgangslage: der Text ist ungespeichert'
    );

    // --- 1. Abbrechen: das Fenster muss offen bleiben ----------------------
    naechsteAntwort = 2;
    fenster.close();
    await sleep(2500);
    pruefe(gezeigt.length === 1, `der Dialog kam (${gezeigt.length}x)`);
    pruefe(
      gezeigt[0]?.detail?.includes('Wichtige Notiz'),
      `er nennt die betroffene Notiz (${JSON.stringify(gezeigt[0]?.detail ?? '')})`
    );
    pruefe(
      (gezeigt[0]?.buttons ?? []).length === 3,
      `drei Knoepfe: ${JSON.stringify(gezeigt[0]?.buttons ?? [])}`
    );
    pruefe(!fenster.isDestroyed(), 'ABBRECHEN: das Fenster ist noch offen');
    pruefe(
      !aufDerPlatte(kampagne, 'Wichtige Notiz').includes('DARF-NICHT-VERLOREN-GEHEN'),
      'und es wurde nichts geschrieben'
    );

    // --- 2. Der zweite Ausgang, je nach Lauf ------------------------------
    naechsteAntwort = MODUS === 'speichern' ? 0 : 1;
    fenster.close();
    await sleep(3500);
    pruefe(gezeigt.length === 2, 'der zweite Versuch fragt erneut');
    pruefe(fenster.isDestroyed(), `${MODUS.toUpperCase()}: das Fenster ist zu`);

    const geschrieben = aufDerPlatte(kampagne, 'Wichtige Notiz').includes(
      'DARF-NICHT-VERLOREN-GEHEN'
    );
    if (MODUS === 'speichern') {
      pruefe(geschrieben, 'SPEICHERN: der Text steht jetzt auf der Platte');
    } else {
      pruefe(!geschrieben, 'NICHT SPEICHERN: der Text wurde nicht geschrieben');
    }
  } catch (fehler) {
    console.log(`  FEHL Abbruch: ${fehler.message}`);
    problems.push(String(fehler.message));
  }

  if (problems.length) {
    console.log(`\n${problems.length} Pruefung(en) fehlgeschlagen.`);
    app.exit(1);
  } else {
    console.log(`\nSchliessen-Dialog (${MODUS}) bestanden.`);
    app.exit(0);
  }
});
