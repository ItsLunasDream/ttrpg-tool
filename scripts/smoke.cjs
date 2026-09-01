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

/** Waehlt eine Notiz ueber die Liste in der Seitenleiste aus. */
async function selectNote(window, title) {
  await run(
    window,
    `const entry = [...document.querySelectorAll('.note-list li button')]
       .find((b) => b.textContent.includes(${JSON.stringify(title)}));
     if (!entry) throw new Error('Notiz nicht in der Liste: ' + ${JSON.stringify(title)});
     entry.click();
     return true;`
  );
  await sleep(700);
}

/** Setzt ein Steckbrieffeld ueber seine Beschriftung. */
async function setField(window, label, value) {
  await run(
    window,
    `const field = [...document.querySelectorAll('.note-editor__side .field')]
       .find((f) => f.textContent.startsWith(${JSON.stringify(label)}));
     if (!field) throw new Error('Feld nicht gefunden: ' + ${JSON.stringify(label)});
     setValue(field.querySelector('input'), ${JSON.stringify(value)});
     return true;`
  );
  await sleep(250);
}

async function save(window) {
  await run(
    window,
    `window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })); return true;`
  );
  await sleep(1200);
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

    // 3. Mira bekommt Steckbrieffeld und Text, damit die Kurzinfo etwas zeigt
    await selectNote(window, 'Mira Falkenhand');
    await setField(window, 'Spezies', 'Waldelfe');
    await run(window, `document.querySelector('.ProseMirror').focus(); return true;`);
    await sleep(200);
    window.webContents.insertText('Sie wuchs im Hafen von Baldurs Tor auf.');
    await sleep(600);
    await save(window);

    // 4. Text mit Wiki-Link in Torans Notiz tippen
    await selectNote(window, 'Toran');
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

    // 5. Kurzinfo-Karte muss den Textanfang zeigen
    await run(
      window,
      `const link = document.querySelector('.ProseMirror .wikilink');
       link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
       return true;`
    );
    await sleep(500);
    check(await run(window, `return Boolean(document.querySelector('.info-card'));`), 'Kurzinfo-Karte erscheint nicht');
    check(await run(window, `return document.querySelector('.info-card')?.textContent.includes('Waldelfe') === true;`),
      'Steckbrieffeld fehlt in der Kurzinfo');
    check(await run(window, `return document.querySelector('.info-card__preview')?.textContent.includes('Sie wuchs im Hafen') === true;`),
      'Textanfang fehlt in der Kurzinfo');
    await run(window, `document.querySelector('.ProseMirror').dispatchEvent(new MouseEvent('mouseleave', { bubbles: true })); return true;`);
    await sleep(300);

    // 6. Speichern per Strg+S
    await save(window);

    // 7. Suche: Treffer markiert in Liste und im Editor
    await run(
      window,
      `setValue(document.querySelector('.note-list__search input'), 'gold');
       return true;`
    );
    await sleep(700);
    check(await run(window, `return document.querySelectorAll('.note-list__snippet mark').length >= 1;`),
      'Suchtreffer in der Liste nicht hervorgehoben');
    check(await run(window, `return document.querySelectorAll('.ProseMirror .search-hit').length >= 1;`),
      'Suchtreffer im Editor nicht hervorgehoben');
    check(await run(window, `return Boolean(document.querySelector('.search-bar'));`),
      'Navigationsleiste für Fundstellen fehlt');

    await clickButton(window, '›', "document.querySelector('.search-bar')");
    await sleep(400);
    check(await run(window, `return document.querySelectorAll('.ProseMirror .search-hit--active').length === 1;`),
      'Aktive Fundstelle wird nicht hervorgehoben');
    check(await run(window, `return /1 von 1/.test(document.querySelector('.search-bar__count').textContent);`),
      'Trefferzähler stimmt nicht');

    await run(window, `setValue(document.querySelector('.note-list__search input'), ''); return true;`);
    await sleep(500);
    check(await run(window, `return document.querySelectorAll('.ProseMirror .search-hit').length === 0;`),
      'Hervorhebung bleibt nach Leeren der Suche stehen');

    // 8. Backlink muss jetzt bei Mira auftauchen
    await selectNote(window, 'Mira Falkenhand');
    check(await run(window, `return document.querySelector('.backlinks')?.textContent.includes('Toran') === true;`),
      'Backlink von Toran fehlt bei Mira');

    // 9. Datei auf der Platte pruefen
    const campaignsDir = path.join(userData, 'vault', 'campaigns');
    const campaignId = fs.readdirSync(campaignsDir)[0];
    const notesDir = path.join(campaignsDir, campaignId, 'notes');
    const files = fs.readdirSync(notesDir).map((name) => fs.readFileSync(path.join(notesDir, name), 'utf8'));

    check(files.some((raw) => raw.includes('[[Mira Falkenhand]]')), 'Wiki-Link steht nicht als Klartext in der Datei');
    check(files.some((raw) => raw.includes('species: Waldelfe')), 'Steckbrieffeld wurde nicht gespeichert');
    check(files.every((raw) => raw.startsWith('---\n')), 'Datei ohne YAML-Frontmatter');
    check(files.every((raw) => !raw.includes('\\[')), 'Klammern wurden beim Speichern maskiert');
    check(files.some((raw) => raw.includes('schemaVersion: 1')), 'schemaVersion fehlt');

    // 10. Umbenennen muss die Links mitziehen
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
