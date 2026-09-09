/**
 * Rauchtest des Initiative Trackers — in der Huelle, an der laufenden
 * Anwendung.
 *
 * Die Modelltests unter apps/initiative/tests pruefen die Regeln: Reihenfolge,
 * Runden, Gruppen, Schaden. Was sie nicht sehen koennen, ist, ob ein Klick
 * wirklich ankommt: ob die Bruecke zum Hauptprozess steht, ob die Gruppe drei
 * Felder zeichnet, ob Schaden im richtigen Feld landet und ob der Kampf die
 * Platte erreicht. Genau daran ist beim Karteneditor der erste Anlauf
 * gescheitert — die Modelltests waren gruen und die Oberflaeche blieb leer.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-initiative.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trk-'));
app.setPath('userData', path.join(tmp, 'userData'));
process.env.TTRPG_TOOLS_START_APP = 'initiative';
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

const fehler = [];
const pruefe = (b, t) => { console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`); if (!b) fehler.push(t); };

app.whenReady().then(async () => {
  await warte(5000);
  const fenster = BaseWindow.getAllWindows()[0];
  const sicht = fenster?.contentView?.children?.[1];
  pruefe(Boolean(sicht), 'der Tracker haengt als eigene Ansicht im Fenster');
  if (!sicht) { app.exit(1); return; }

  const konsole = [];
  sicht.webContents.on('console-message', (_e, level, text) => {
    if (level >= 2) konsole.push(text.slice(0, 160));
  });
  const js = (a) => sicht.webContents.executeJavaScript(a);

  pruefe(await js("Boolean(document.querySelector('.tracker'))"), 'seine Oberflaeche steht');
  pruefe(await js("typeof window.initiative === 'object'"), 'die Bruecke zum Hauptprozess ist da');
  pruefe(await js("Boolean(document.querySelector('.leer'))"), 'ohne Teilnehmer steht der Leertext');

  // Teilnehmer anlegen
  await js(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Participant') || b.textContent.includes('Teilnehmer')).click(); true`);
  await warte(600);
  pruefe(await js("document.querySelectorAll('.zeile').length === 1"), 'ein Teilnehmer wurde angelegt');
  pruefe(await js("Boolean(document.querySelector('.ausklapp'))"), 'seine Felder sind gleich offen');

  // Name und Werte setzen
  await js(`(() => {
    const setz = (el, v) => { Object.getOwnPropertyDescriptor(el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', {bubbles:true})); };
    const felder = [...document.querySelectorAll('.ausklapp__felder input')];
    setz(felder[0], 'Goblin'); setz(felder[1], '15'); setz(felder[3], '7');
    return true; })()`);
  await warte(600);
  pruefe((await js("document.querySelector('.zeile__ini').textContent")) === '15', 'die Initiative steht in der Zeile');
  pruefe((await js("document.querySelector('.koerper__max').textContent")) === '/7', 'die Trefferpunkte stehen');

  // Gruppe auf 3
  await js(`(() => { const f = [...document.querySelectorAll('.ausklapp__felder input')][4];
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(f,'3');
    f.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
  await warte(600);
  pruefe(await js("document.querySelectorAll('.koerper').length === 3"), 'die Gruppe hat drei Koerper');

  // Schaden auf den zweiten
  await js(`(() => { const f = [...document.querySelectorAll('.koerper__schaden')][1];
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(f,'5');
    f.dispatchEvent(new Event('input',{bubbles:true}));
    f.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); return true; })()`);
  await warte(800);
  const hp = await js("[...document.querySelectorAll('.koerper__hp')].map(e => e.value).join(',')");
  pruefe(hp === '7,2,7', `Schaden trifft genau einen Koerper (${hp})`);

  // Kampf beginnen und weiter
  await js(`[...document.querySelectorAll('button')].find(b => /Start combat|Kampf beginnen/.test(b.textContent)).click(); true`);
  await warte(700);
  pruefe(await js("Boolean(document.querySelector('.zeile--dran'))"), 'der Kampf laeuft, jemand ist dran');
  pruefe(await js("Boolean(document.querySelector('.leiste__runde'))"), 'die Runde wird angezeigt');

  // Leertaste
  await js(`window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true})); true`);
  await warte(500);
  pruefe(await js("Boolean(document.querySelector('.leiste__runde'))"), 'nach der Leertaste laeuft er weiter');

  // Auf der Platte gelandet?
  const datei = path.join(tmp, 'userData', 'initiative', 'kampf.json');
  const da = fs.existsSync(datei);
  pruefe(da, 'der laufende Kampf steht auf der Platte');
  if (da) {
    const gespeichert = JSON.parse(fs.readFileSync(datei, 'utf8'));
    pruefe(gespeichert.teilnehmer[0]?.name === 'Goblin', 'und traegt den richtigen Namen');
    pruefe(gespeichert.laeuft === true, 'und weiss, dass der Kampf laeuft');
  }

  // --- Sprachkopplung ---------------------------------------------------
  // Bei den anderen beiden Werkzeugen war genau das die Fehlerquelle: die
  // Modelltests sahen die Kopplung nicht, und im Fenster blieb ein Werkzeug
  // auf der alten Sprache stehen.
  const spracheJetzt = () =>
    js("document.querySelector('.leiste__sprache')?.value ?? ''");
  const vorher = await spracheJetzt();
  const andere = vorher === 'de' ? 'en' : 'de';
  await js(`(() => { const s = document.querySelector('.leiste__sprache');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s, '${andere}');
    s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  await warte(900);
  pruefe((await spracheJetzt()) === andere, `der Tracker stellt selbst um (${vorher} -> ${andere})`);

  // Die Huelle muss es mitbekommen haben und ihre eigene Titelleiste umstellen.
  const huelle = fenster.contentView.children[0];
  const huellenText = await huelle.webContents.executeJavaScript(
    "document.querySelector('.titelleiste__knopf')?.textContent ?? ''"
  );
  pruefe(
    andere === 'de' ? huellenText === 'Einstellungen' : huellenText === 'Settings',
    `die Huelle ist mitgegangen (\"${huellenText}\")`
  );

  // Und zurueck, von der Huelle aus: der Tracker muss folgen.
  await huelle.webContents.executeJavaScript(
    `window.shell.einstellungen.schreiben({ language: '${vorher}' })`
  );
  await warte(900);
  pruefe((await spracheJetzt()) === vorher, 'und folgt der Huelle wieder zurueck');

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' | ') || 'keine'})`);

  console.log(fehler.length ? `\n${fehler.length} Pruefung(en) fehlgeschlagen.` : '\nTracker in der Huelle bestanden.');
  app.exit(fehler.length ? 1 : 0);
});
