/**
 * Sichern und wieder einlesen.
 *
 * Eine Sicherung, die man nur von Hand zurueckspielen kann, ist keine.
 * Geprueft wird der ganze Weg: Kampagne mit Notiz anlegen, als ZIP sichern,
 * einlesen, und danach muessen beide nebeneinander stehen — die eingelesene
 * darf die vorhandene nicht ueberschrieben haben.
 *
 * Aufruf: xvfb-run -a npx electron scripts/smoke-einlesen.cjs --no-sandbox
 */
const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'backstory-einlesen-'));
app.setPath('userData', userData);
fs.writeFileSync(path.join(userData, 'settings.json'), JSON.stringify({ language: 'de' }), 'utf8');

const archiv = path.join(userData, 'sicherung.zip');

// Die Dateidialoge beantworten sich im Rauchtest selbst.
dialog.showSaveDialog = async () => ({ canceled: false, filePath: archiv });
dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [archiv] });
dialog.showMessageBox = async () => ({ response: 0 });

require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const sleep = (ms) => new Promise((fertig) => setTimeout(fertig, ms));
const fehler = [];

function check(bedingung, text) {
  if (!bedingung) fehler.push(text);
}

function run(window, body) {
  return window.webContents.executeJavaScript(`(() => { ${body} })()`);
}

async function warteAufFenster() {
  for (let versuch = 0; versuch < 100; versuch += 1) {
    const [window] = BrowserWindow.getAllWindows();
    if (window) return window;
    await sleep(100);
  }
  throw new Error('Kein Fenster geoeffnet.');
}

function fuelleDialog(wert) {
  return `const feld = document.querySelector('.modal input');
     const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
     setzer.call(feld, ${JSON.stringify(wert)});
     feld.dispatchEvent(new Event('input', { bubbles: true }));
     [...document.querySelectorAll('.modal button')].find((b) => b.textContent.includes('Anlegen')).click();
     return true;`;
}

async function menue(window, beschriftung) {
  await run(
    window,
    `const oeffner = document.querySelector('.campaign-bar > .menu > button');
     if (oeffner.getAttribute('aria-expanded') !== 'true') oeffner.click();
     return true;`
  );
  await sleep(300);
  await run(
    window,
    `const eintrag = [...document.querySelectorAll('.menu__list button')]
       .find((b) => b.textContent === ${JSON.stringify(beschriftung)});
     if (!eintrag) throw new Error('Menueeintrag fehlt: ' + ${JSON.stringify(beschriftung)});
     eintrag.click();
     return true;`
  );
  await sleep(1500);
}

async function main() {
  const window = await warteAufFenster();
  window.webContents.on('console-message', (_e, stufe, text) => {
    if (stufe >= 2) fehler.push(`console: ${text}`);
  });
  await sleep(3000);

  // Kampagne mit einer Notiz
  await run(
    window,
    `[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Erste Kampagne')).click();
     return true;`
  );
  await sleep(600);
  await run(window, fuelleDialog('Sturmküste'));
  await sleep(1400);

  await run(
    window,
    `[...document.querySelectorAll('button')].find((b) => b.textContent.includes('+ Charakter')).click();
     return true;`
  );
  await sleep(600);
  await run(window, fuelleDialog('Mira Falkenhand'));
  await sleep(1600);

  await run(window, `document.querySelector('.ProseMirror').focus(); return true;`);
  await sleep(300);
  window.webContents.insertText('Sie kam aus dem Hafen.');
  await sleep(600);
  await run(window, `window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })); return true;`);
  await sleep(1500);

  // Sichern
  await menue(window, 'Als ZIP sichern');
  check(fs.existsSync(archiv), 'Es wurde keine Sicherung geschrieben');

  // Einlesen
  await menue(window, 'Aus ZIP einlesen');
  await sleep(1500);

  const kampagnen = fs.readdirSync(path.join(userData, 'vault', 'campaigns'));
  check(kampagnen.length === 2, `Nach dem Einlesen gibt es ${kampagnen.length} Kampagnen statt zwei`);

  const namen = kampagnen.map((id) =>
    JSON.parse(fs.readFileSync(path.join(userData, 'vault', 'campaigns', id, 'campaign.json'), 'utf8')).name
  );
  check(
    // Der Name ist vergeben, also bekommt die eingelesene den Zusatz.
    namen.includes('Sturmküste') && namen.some((name) => /^Sturmküste \((importiert|imported)\)$/.test(name)),
    `Die eingelesene Kampagne traegt nicht den Zusatz: ${JSON.stringify(namen)}`
  );

  // Die Notiz muss mitgekommen sein, samt Text.
  const ohneNotizen = kampagnen.filter(
    (id) => !fs.existsSync(path.join(userData, 'vault', 'campaigns', id, 'notes'))
  );
  const texte = kampagnen.map((id) => {
    const notizen = path.join(userData, 'vault', 'campaigns', id, 'notes');
    return fs
      .readdirSync(notizen)
      .map((datei) => fs.readFileSync(path.join(notizen, datei), 'utf8'))
      .join('\n');
  });
  check(ohneNotizen.length === 0, 'Einer Kampagne fehlt der Notizordner');
  check(
    texte.filter((text) => text.includes('Sie kam aus dem Hafen.')).length === 2,
    'Die Notiz steht nicht in beiden Kampagnen'
  );

  // Die Kennung muss neu sein, sonst waere die vorhandene ueberschrieben.
  check(new Set(kampagnen).size === 2, 'Beide Kampagnen tragen dieselbe Kennung');

  if (fehler.length) {
    console.error('EINLESEN FEHLGESCHLAGEN');
    for (const eintrag of fehler) console.error(`- ${eintrag}`);
    app.exit(1);
    return;
  }
  console.log('Einlesen bestanden.');
  app.exit(0);
}

main().catch((problem) => {
  console.error(problem);
  app.exit(1);
});
