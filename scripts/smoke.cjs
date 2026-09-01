/**
 * End-to-End-Rauchtest der gebauten App: legt Kampagne und Notizen an,
 * tippt einen Wiki-Link, speichert und prueft die Datei auf der Platte.
 * Aufruf: xvfb-run -a npx electron scripts/smoke.cjs --no-sandbox
 */
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'backstory-smoke-'));
app.setPath('userData', userData);

require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const problems = [];

function check(condition, message) {
  if (!condition) problems.push(message);
}

async function waitForWindow() {
  for (let attempt = 0; attempt < 100; attempt++) {
    const [window] = BrowserWindow.getAllWindows();
    if (window) return window;
    await sleep(100);
  }
  throw new Error('Kein Fenster geöffnet.');
}

/** Setzt einen React-kontrollierten Eingabewert so, dass onChange feuert. */
const SET_VALUE = `
function setValue(element, value) {
  const proto = element instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}`;

function run(window, body) {
  return window.webContents.executeJavaScript(`(() => { ${SET_VALUE}\n${body} })()`);
}

/** Klickt den Button, dessen Beschriftung `label` enthaelt. */
function clickButton(window, label, scope = 'document') {
  return run(
    window,
    `const button = [...${scope}.querySelectorAll('button')].find((b) => b.textContent.includes(${JSON.stringify(label)}));
     if (!button) throw new Error('Button nicht gefunden: ' + ${JSON.stringify(label)});
     button.click();
     return true;`
  );
}

async function fillDialog(window, value, confirmLabel) {
  await run(window, `setValue(document.querySelector('.modal input'), ${JSON.stringify(value)}); return true;`);
  await sleep(120);
  await clickButton(window, confirmLabel, "document.querySelector('.modal')");
  await sleep(500);
}

app.whenReady().then(async () => {
  try {
    const window = await waitForWindow();

    window.webContents.on('console-message', (_event, level, message) => {
      if (level >= 2) problems.push(`console: ${message}`);
    });
    window.webContents.on('render-process-gone', (_event, details) =>
      problems.push(`renderer weg: ${details.reason}`)
    );

    await new Promise((resolve) => {
      if (!window.webContents.isLoading()) resolve();
      else window.webContents.once('did-finish-load', resolve);
    });
    await sleep(800);

    check(await run(window, 'return typeof window.api === "object";'), 'preload stellt window.api nicht bereit');

    // 1. Kampagne anlegen
    await clickButton(window, 'Erste Kampagne anlegen');
    await sleep(300);
    await fillDialog(window, 'Sturmküste', 'Anlegen');
    check(await run(window, `return document.querySelector('.campaign-bar select').selectedOptions[0].textContent === 'Sturmküste';`),
      'Kampagne wurde nicht ausgewaehlt');

    // 2. Zwei Charaktere anlegen
    for (const name of ['Mira Falkenhand', 'Toran']) {
      await clickButton(window, '+ Charakter');
      await sleep(300);
      await fillDialog(window, name, 'Anlegen');
    }
    check(await run(window, `return document.querySelectorAll('.note-list li').length === 2;`),
      'Notizliste zeigt nicht beide Charaktere');

    // 3. Steckbrieffeld fuellen
    await run(
      window,
      `const field = [...document.querySelectorAll('.note-editor__side .field')]
         .find((f) => f.textContent.startsWith('Spezies'));
       setValue(field.querySelector('input'), 'Waldelfe');
       return true;`
    );
    await sleep(200);

    // 4. Text mit Wiki-Link tippen
    await run(window, `document.querySelector('.ProseMirror').focus(); return true;`);
    await sleep(200);
    window.webContents.insertText('Er schuldet [[Mira Falkenhand]] noch Gold.');
    await sleep(600);

    check(await run(window, `return document.querySelectorAll('.ProseMirror .wikilink').length === 1;`),
      'Wiki-Link wurde im Editor nicht hervorgehoben');
    check(await run(window, `return document.querySelectorAll('.ProseMirror .wikilink--unresolved').length === 0;`),
      'Bestehende Notiz wurde faelschlich als offener Link markiert');
    check(await run(window, `return /\\d+ Wörter/.test(document.querySelector('.note-editor__words').textContent);`),
      'Wortzaehler fehlt');

    // 5. Speichern per Strg+S
    await run(
      window,
      `window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })); return true;`
    );
    await sleep(1200);

    // 6. Backlink muss jetzt bei Mira auftauchen
    await run(
      window,
      `const entry = [...document.querySelectorAll('.note-list li button')]
         .find((b) => b.textContent.includes('Mira Falkenhand'));
       entry.click();
       return true;`
    );
    await sleep(700);
    check(await run(window, `return document.querySelector('.backlinks')?.textContent.includes('Toran') === true;`),
      'Backlink von Toran fehlt bei Mira');

    // 7. Datei auf der Platte pruefen
    const campaignsDir = path.join(userData, 'vault', 'campaigns');
    const campaignId = fs.readdirSync(campaignsDir)[0];
    const notesDir = path.join(campaignsDir, campaignId, 'notes');
    const files = fs.readdirSync(notesDir).map((name) => fs.readFileSync(path.join(notesDir, name), 'utf8'));

    check(files.some((raw) => raw.includes('[[Mira Falkenhand]]')), 'Wiki-Link steht nicht als Klartext in der Datei');
    check(files.some((raw) => raw.includes('species: Waldelfe')), 'Steckbrieffeld wurde nicht gespeichert');
    check(files.every((raw) => raw.startsWith('---\n')), 'Datei ohne YAML-Frontmatter');
    check(files.every((raw) => !raw.includes('\\[')), 'Klammern wurden beim Speichern maskiert');
    check(files.some((raw) => raw.includes('schemaVersion: 1')), 'schemaVersion fehlt');

    // 8. Umbenennen muss die Links mitziehen
    await run(
      window,
      `const title = document.querySelector('.note-editor__title');
       setValue(title, 'Mira Sturmhand');
       title.dispatchEvent(new Event('blur', { bubbles: true }));
       return true;`
    );
    await sleep(1600);
    const afterRename = fs.readdirSync(notesDir).map((name) => fs.readFileSync(path.join(notesDir, name), 'utf8'));
    check(afterRename.some((raw) => raw.includes('[[Mira Sturmhand]]')), 'Umbenennen hat den Link nicht mitgezogen');
    check(afterRename.every((raw) => !raw.includes('[[Mira Falkenhand]]')), 'Alter Linkname blieb stehen');
  } catch (error) {
    problems.push(String(error));
  }

  if (problems.length) {
    console.error('SMOKE FEHLGESCHLAGEN\n- ' + problems.join('\n- '));
  } else {
    console.log('SMOKE OK');
  }

  fs.rmSync(userData, { recursive: true, force: true });
  app.exit(problems.length ? 1 : 0);
});
