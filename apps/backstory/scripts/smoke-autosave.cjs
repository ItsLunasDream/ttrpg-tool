/**
 * Rauchtest fuer ausgeschalteten Autosave.
 *
 * Die Zusage lautet: ohne Autosave schreibt *nichts* von allein auf die
 * Platte, auch nicht der Wechsel auf eine andere Notiz. Der Text bleibt im
 * Arbeitsspeicher, bis Strg+S ihn wegschreibt.
 *
 * Vorher galt das nur fuer die Verzoegerung: der Editor kannte genau eine
 * offene Notiz, und jeder Wechsel schrieb sie weg — die Einstellung war an
 * der Stelle, an der sie am meisten auffaellt, wirkungslos.
 *
 * Geprueft wird gegen die Datei auf der Platte, nicht gegen die Anzeige. Was
 * der Editor zeigt, sagt nichts darueber, was gespeichert wurde.
 *
 * Aufruf: xvfb-run -a npx electron scripts/smoke-autosave.cjs --no-sandbox
 */
const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'backstory-autosave-'));
app.setPath('userData', userData);

// Deutsche Beschriftungen, und Autosave von vornherein aus — darum geht es.
fs.writeFileSync(
  path.join(userData, 'settings.json'),
  JSON.stringify({ language: 'de', autosaveEnabled: false }),
  'utf8'
);

// Der Nachfrage-Dialog vor Plattenaktionen ist ein Systemfenster und laesst
// sich nicht anklicken. Der Test ersetzt ihn und gibt die gewuenschte Antwort.
const gefragt = [];
let dialogAntwort = 2; // Abbrechen
dialog.showMessageBox = async (...args) => {
  gefragt.push(args.length > 1 ? args[1] : args[0]);
  return { response: dialogAntwort, checkboxChecked: false };
};

require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const problems = [];
function pruefe(bedingung, beschreibung) {
  if (bedingung) console.log(`  ok   ${beschreibung}`);
  else {
    console.log(`  FEHL ${beschreibung}`);
    problems.push(beschreibung);
  }
}

async function warteAufFenster() {
  for (let i = 0; i < 100; i++) {
    const [fenster] = BrowserWindow.getAllWindows();
    if (fenster) return fenster;
    await sleep(100);
  }
  throw new Error('Kein Fenster geöffnet.');
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

async function waehleNotiz(fenster, titel) {
  await run(
    fenster,
    `const e = [...document.querySelectorAll('.note-list li button')]
       .find((b) => b.textContent.includes(${JSON.stringify(titel)}));
     if (!e) throw new Error('Notiz nicht in der Liste: ' + ${JSON.stringify(titel)});
     e.click(); return true;`
  );
  await sleep(800);
}

/** Tippt Text in den Rumpf der offenen Notiz. */
async function tippe(fenster, text) {
  await run(
    fenster,
    `const p = document.querySelector('.ProseMirror');
     p.focus();
     document.execCommand('insertText', false, ${JSON.stringify(text)});
     return true;`
  );
  await sleep(500);
}

/**
 * Liest die Notiz mit diesem Titel von der Platte — die einzige Wahrheit hier.
 *
 * Gesucht wird ueber den Titel im Kopf der Datei, nicht ueber den Dateinamen:
 * der ist eine UUID. Ein erster Anlauf ordnete die Dateien ueber
 * `dateiname.includes('eins')` zu, traf damit nie und verglich danach
 * zufaellig die falsche Datei — der Test meldete einen Fehler, den es nicht
 * gab.
 */
function aufDerPlatte(kampagne, titel) {
  const ordner = path.join(userData, 'vault', 'campaigns', kampagne, 'notes');
  for (const name of notizDateien(kampagne)) {
    const inhalt = fs.readFileSync(path.join(ordner, name), 'utf8');
    if (inhalt.includes(`title: ${titel}`) || inhalt.includes(`title: "${titel}"`)) return inhalt;
  }
  return '';
}

function notizDateien(kampagne) {
  try {
    return fs.readdirSync(path.join(userData, 'vault', 'campaigns', kampagne, 'notes'));
  } catch {
    return [];
  }
}

app.whenReady().then(async () => {
  try {
    const fenster = await warteAufFenster();
    await new Promise((resolve) => {
      if (!fenster.webContents.isLoading()) resolve();
      else fenster.webContents.once('did-finish-load', resolve);
    });
    await sleep(1000);

    await clickButton(fenster, 'Erste Kampagne anlegen');
    await sleep(400);
    await fillDialog(fenster, 'Testkampagne', 'Anlegen');

    for (const name of ['Notiz Eins', 'Notiz Zwei']) {
      await clickButton(fenster, '+ Charakter');
      await sleep(400);
      await fillDialog(fenster, name, 'Anlegen');
    }

    const kampagne = fs.readdirSync(path.join(userData, 'vault', 'campaigns'))[0];
    const dateien = notizDateien(kampagne);
    pruefe(dateien.length === 2, `beide Notizen liegen an (${dateien.length})`);
    const eins = 'Notiz Eins';
    const zwei = 'Notiz Zwei';
    pruefe(
      aufDerPlatte(kampagne, eins) !== '' && aufDerPlatte(kampagne, zwei) !== '',
      'beide Notizen sind ueber ihren Titel auffindbar'
    );

    // --- Der Kern: tippen, wechseln, nicht geschrieben --------------------
    await waehleNotiz(fenster, 'Notiz Eins');
    await tippe(fenster, 'TEXT-EINS-UNGESPEICHERT');

    pruefe(
      !aufDerPlatte(kampagne, eins).includes('TEXT-EINS-UNGESPEICHERT'),
      'nach dem Tippen steht noch nichts auf der Platte'
    );
    pruefe(
      await run(fenster, `return document.querySelectorAll('.note-list__ungespeichert').length === 1;`),
      'die Notiz ist in der Liste als ungespeichert markiert'
    );

    await waehleNotiz(fenster, 'Notiz Zwei');
    await sleep(800);
    pruefe(
      !aufDerPlatte(kampagne, eins).includes('TEXT-EINS-UNGESPEICHERT'),
      'der Wechsel auf eine andere Notiz schreibt sie NICHT weg'
    );

    await tippe(fenster, 'TEXT-ZWEI-UNGESPEICHERT');
    pruefe(
      await run(fenster, `return document.querySelectorAll('.note-list__ungespeichert').length === 2;`),
      'jetzt sind zwei Notizen als ungespeichert markiert'
    );
    pruefe(
      await run(fenster, `return Boolean(document.querySelector('.campaign-bar__ungespeichert'));`),
      'die Leiste nennt die Zahl der ungespeicherten Notizen'
    );

    // Zurueck zur ersten: der Text muss noch da sein.
    await waehleNotiz(fenster, 'Notiz Eins');
    pruefe(
      await run(fenster, `return document.querySelector('.ProseMirror').textContent.includes('TEXT-EINS-UNGESPEICHERT');`),
      'der ungespeicherte Text ist beim Zurueckkommen noch im Editor'
    );

    // --- Strg+S schreibt ---------------------------------------------------
    await run(
      fenster,
      `window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })); return true;`
    );
    await sleep(1200);
    pruefe(
      aufDerPlatte(kampagne, eins).includes('TEXT-EINS-UNGESPEICHERT'),
      'Strg+S schreibt die offene Notiz auf die Platte'
    );
    pruefe(
      !aufDerPlatte(kampagne, zwei).includes('TEXT-ZWEI-UNGESPEICHERT'),
      'und nur sie — die andere bleibt ungespeichert'
    );
    pruefe(
      await run(fenster, `return document.querySelectorAll('.note-list__ungespeichert').length === 1;`),
      'die Markierung der gespeicherten Notiz ist weg'
    );
    // --- Der Titel in der Liste folgt dem Entwurf -------------------------
    await run(
      fenster,
      `const el = document.querySelector('.note-editor__title input, .note-editor input');
       if (!el) throw new Error('Titelfeld nicht gefunden');
       Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'Umbenannt Ungespeichert');
       el.dispatchEvent(new Event('input', { bubbles: true })); return true;`
    );
    await sleep(600);
    pruefe(
      await run(
        fenster,
        `return [...document.querySelectorAll('.note-list__title')]
           .some((e) => e.textContent.includes('Umbenannt Ungespeichert'));`
      ),
      'die Liste zeigt den ungespeicherten Titel, nicht den von der Platte'
    );

    // --- Export fragt nach und laesst sich abbrechen ----------------------
    gefragt.length = 0;
    dialogAntwort = 2; // Abbrechen
    await run(
      fenster,
      `const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Export'));
       if (b) b.click(); return true;`
    ).catch(() => {});
    await sleep(300);
    await run(
      fenster,
      `const e = [...document.querySelectorAll('.menu__list button')]
         .find((b) => b.textContent.includes('Markdown'));
       if (e) e.click(); return true;`
    ).catch(() => {});
    await sleep(1500);
    pruefe(
      gefragt.length >= 1,
      `der Export fragt bei Ungespeichertem nach (${gefragt.length}x)`
    );
    if (gefragt.length) {
      pruefe(
        (gefragt[0].buttons ?? []).length === 3,
        `drei Antworten: ${JSON.stringify(gefragt[0].buttons ?? [])}`
      );
    }
  } catch (fehler) {
    console.log(`  FEHL Abbruch: ${fehler.message}`);
    problems.push(String(fehler.message));
  }

  if (problems.length) {
    console.log(`\n${problems.length} Pruefung(en) fehlgeschlagen.`);
    app.exit(1);
  } else {
    console.log('\nAutosave-aus bestanden.');
    app.exit(0);
  }
});
