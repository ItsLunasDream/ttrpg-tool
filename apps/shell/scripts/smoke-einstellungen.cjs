/**
 * Rauchtest: die Einstellungen stehen an EINER Stelle.
 *
 * Gemeldet: „Hier gibt es zwei mal Settings. Schön wäre wenn unter den
 * bekannten Einstellungen der Hülle, spezifische Einstellungen für die Apps
 * dabei sind."
 *
 * Geprueft wird der ganze Weg, den die Modultests nicht sehen koennen:
 * der Dialog der Huelle fragt das Werkzeug, malt dessen Felder, schickt eine
 * Aenderung zurueck, und sie landet in der Einstellungsdatei DES WERKZEUGS.
 * Dazu, dass der eigene Knopf im Werkzeug verschwunden ist — sonst waere es
 * weiterhin zweimal dieselbe Sache.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-einstellungen.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'einst-smoke-'));
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

const werkzeugDatei = path.join(userData, 'backstory', 'settings.json');
/**
 * Die Einstellungsdatei des Werkzeugs — oder `null`, solange es keine gibt.
 *
 * Geschrieben wird sie erst, wenn wirklich etwas verstellt wurde: beim
 * Montieren liest der Story Creator nur. Genau das ist hier der Punkt, also
 * darf das Fehlen kein Absturz sein, sondern muss pruefbar bleiben.
 */
const werkzeugStand = () => {
  try {
    return JSON.parse(fs.readFileSync(werkzeugDatei, 'utf8'));
  } catch {
    return null;
  }
};

app.whenReady().then(async () => {
  await warte(4000);
  const fenster = BaseWindow.getAllWindows()[0];
  if (!fenster) {
    console.log('  FEHL kein Fenster');
    app.exit(1);
    return;
  }
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 900 });
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

  // --- Das Werkzeug muss erst laufen --------------------------------------
  //
  // Nur ein montiertes Werkzeug kann seine Einstellungen beschreiben. Das ist
  // kein Mangel: man stellt ein Werkzeug ein, waehrend man darin arbeitet.
  await js(`(() => { const k=[...document.querySelectorAll('.kachel:not(:disabled)')]
    .find(x => /Story Creator/.test(x.textContent)); if(!k) return false; k.click(); return true; })()`);
  await warte(5000);

  const werkzeug = fenster.contentView.children.find((v) =>
    v.webContents.getURL().includes('/apps/backstory/')
  );
  pruefe(Boolean(werkzeug), 'der Story Creator kommt hoch');
  if (!werkzeug) {
    app.exit(1);
    return;
  }
  const wjs = (a) => werkzeug.webContents.executeJavaScript(a);

  // --- Der eigene Knopf ist weg -------------------------------------------
  const eigeneKnoepfe = await wjs(
    "[...document.querySelectorAll('.campaign-bar button')].map(b => b.textContent.trim())"
  );
  pruefe(
    !eigeneKnoepfe.some((text) => text === 'Settings' || text === 'Einstellungen'),
    `das Werkzeug hat keinen eigenen Einstellungen-Knopf mehr (${eigeneKnoepfe.join('|')})`
  );

  // --- Der Dialog der Huelle zeigt den Abschnitt ---------------------------
  await js(
    `[...document.querySelectorAll('button')].find(b => /^(Settings|Einstellungen)$/.test(b.textContent.trim())).click(); true`
  );
  await warte(800);

  const ueberschriften = await js(
    "[...document.querySelectorAll('.feld__ueberschrift')].map(e => e.textContent)"
  );
  pruefe(
    ueberschriften.some((u) => /Story Creator/.test(u)),
    `der Dialog der Huelle zeigt einen Abschnitt fuer das Werkzeug (${ueberschriften.join(', ')})`
  );

  const gruppen = await js(
    "[...document.querySelectorAll('.feld__untertitel')].map(e => e.textContent).join('|')"
  );
  pruefe(
    /Writing|Schreiben/.test(gruppen) && /Storage|Speicherort/.test(gruppen),
    `mit seinen Gruppen (${gruppen})`
  );

  // --- Eine Aenderung geht den ganzen Weg ----------------------------------
  //
  // Der Anfangsstand kommt aus dem Werkzeug und nicht von der Platte: die
  // Datei entsteht erst mit der ersten Aenderung.
  const werkzeugLiest = async () =>
    wjs(`(async () => { const a = await window.api.settings.get();
      return a && 'value' in a ? a.value : a; })()`);
  const vorher = await werkzeugLiest();
  pruefe(vorher?.autosaveEnabled === true, 'der Autosave des Werkzeugs steht anfangs an');

  await js(`(() => {
    const kasten = [...document.querySelectorAll('.werkzeugfelder__gruppe input[type=checkbox]')][0];
    if (!kasten) return false;
    kasten.click();
    return true;
  })()`);
  await warte(1000);
  pruefe(
    werkzeugStand()?.autosaveEnabled === false,
    `ein Klick im Dialog der Huelle landet in der Einstellungsdatei des Werkzeugs (${JSON.stringify(
      werkzeugStand()?.autosaveEnabled
    )})`
  );

  // Und die Antwort des Werkzeugs kommt zurueck: das Wartezeit-Feld haengt am
  // Autosave-Schalter und ist jetzt gesperrt. Ohne den zurueckgelieferten
  // Stand stuende es weiter bedienbar da.
  await warte(300);
  const gesperrt = await js(
    "[...document.querySelectorAll('.werkzeugfelder__gruppe input[type=number]')].filter(e => e.disabled).length"
  );
  pruefe(gesperrt >= 1, `das abhaengige Feld ist gesperrt (${gesperrt})`);

  // --- Ein unsinniger Wert aendert nichts ----------------------------------
  //
  // Ein leer geraeumtes Zahlenfeld schickt "". Wuerde das durchgehen, stuende
  // NaN in der Datei und das Werkzeug faende beim naechsten Start keine
  // gueltige Wartezeit mehr.
  const msVorher = werkzeugStand()?.autosaveDelayMs;
  await js("window.shell.werkzeug.setzen('backstory', 'autosaveDelayMs', ''); true");
  await warte(600);
  pruefe(
    werkzeugStand()?.autosaveDelayMs === msVorher,
    `ein leeres Zahlenfeld aendert nichts (${msVorher} -> ${werkzeugStand()?.autosaveDelayMs})`
  );

  // --- Die Oberflaeche des Werkzeugs erfaehrt davon ------------------------
  //
  // Sie haelt die Einstellungen im Speicher. Ohne Meldung schriebe sie weiter
  // mit der alten Wartezeit.
  const gelesen = await werkzeugLiest();
  pruefe(
    gelesen?.autosaveEnabled === false,
    `das Werkzeug liest denselben Stand (${JSON.stringify(gelesen?.autosaveEnabled)})`
  );

  // --- Werkzeuge ohne eigene Einstellungen bleiben stumm -------------------
  const ohne = await js("window.shell.werkzeug.einstellungen('dice')");
  pruefe(ohne === null, 'ein Werkzeug ohne eigene Einstellungen liefert nichts');

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);

  console.log(
    fehler.length === 0 ? '\nEinstellungen an einer Stelle bestanden.' : `\n${fehler.length} Fehler.`
  );
  app.exit(fehler.length === 0 ? 0 : 1);
});
