/**
 * End-to-End-Rauchtest der gebauten App: legt Kampagne und Notizen an,
 * tippt einen Wiki-Link, speichert und prueft die Datei auf der Platte.
 * Aufruf: xvfb-run -a npx electron scripts/smoke.cjs --no-sandbox
 */
const { app, BrowserWindow, dialog } = require('electron');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

// Das '#' im Namen ist Absicht: der Speicherort wird frei gewaehlt und darf
// Zeichen enthalten, die in einer URL eine Bedeutung haben.
const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'backstory-smoke #'));
app.setPath('userData', userData);

// Dieser Test klickt auf deutsche Beschriftungen. Ausgeliefert wird aber
// Englisch (Konvention 6), deshalb wird die Sprache hier vorab gesetzt statt
// jedes Label doppelt zu fuehren. Der uebrige Teil der Einstellungen bleibt
// leer und wird beim Lesen mit den Standardwerten aufgefuellt.
fs.writeFileSync(path.join(userData, 'settings.json'), JSON.stringify({ language: 'de' }), 'utf8');

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

/** Oeffnet das Kampagnen-Menue und waehlt einen Eintrag. */
async function menuAction(window, label) {
  await run(
    window,
    `const opener = [...document.querySelectorAll('.menu > button')][0];
     if (!opener) throw new Error('Kampagnen-Menü fehlt');
     if (opener.getAttribute('aria-expanded') !== 'true') opener.click();
     return true;`
  );
  await sleep(300);
  await run(
    window,
    `const entry = [...document.querySelectorAll('.menu__list button')]
       .find((b) => b.textContent === ${JSON.stringify(label)});
     if (!entry) throw new Error('Menüeintrag nicht gefunden: ' + ${JSON.stringify(label)});
     entry.click();
     return true;`
  );
  await sleep(500);
}

/**
 * Drueckt einen Knopf der Werkzeugleiste. Die reagiert auf mousedown statt
 * click, damit der Editor den Fokus behaelt.
 */
async function pressToolbar(window, label) {
  await run(
    window,
    `const button = [...document.querySelectorAll('.toolbar button')]
       .find((b) => b.textContent === ${JSON.stringify(label)});
     if (!button) throw new Error('Werkzeug nicht gefunden: ' + ${JSON.stringify(label)});
     button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
     return true;`
  );
  await sleep(400);
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

/**
 * Dateidialoge blockieren einen automatischen Durchlauf. Fuer den Rauchtest
 * werden sie durch feste Antworten ersetzt.
 */
/** Was der Nachfrage-Dialog vor Plattenaktionen antworten soll. */
let speicherAntwort = 0; // 0 = Speichern und fortfahren
const nachgefragt = [];

function stubDialogs(exportDir) {
  fs.mkdirSync(exportDir, { recursive: true });

  // Ohne Autosave fragt der Export, was mit Ungespeichertem geschehen soll.
  // Der Dialog ist ein Systemfenster; hier wird er beantwortet.
  dialog.showMessageBox = async (...args) => {
    nachgefragt.push(args.length > 1 ? args[1] : args[0]);
    return { response: speicherAntwort, checkboxChecked: false };
  };

  dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [exportDir] });
  dialog.showSaveDialog = async (...args) => {
    const options = args.length > 1 ? args[1] : args[0];
    const name = path.basename(options?.defaultPath || 'ausgabe');
    return { canceled: false, filePath: path.join(exportDir, name) };
  };
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

    // 3. Beziehungen: mit zwei Notizen muss die Auswahl gefuellt sein
    await selectNote(window, 'Mira Falkenhand');
    check(
      await run(window, `const select = document.querySelector('.relations__add select');
         return Boolean(select) && select.options.length === 2;`),
      'Auswahlliste für Beziehungen ist leer, obwohl es eine zweite Notiz gibt'
    );

    await run(
      window,
      `const select = document.querySelector('.relations__add select');
       const option = [...select.options].find((o) => o.textContent.includes('Toran'));
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value);
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(300);
    await clickButton(window, 'Hinzufügen', "document.querySelector('.relations__add')");
    await sleep(500);
    check(await run(window, `return document.querySelectorAll('.relation').length === 1;`),
      'Beziehung wurde nicht angelegt');

    // Bezeichnung setzen, sonst traegt die Kante im Graphen spaeter keine.
    await run(window, `setValue(document.querySelector('.relation__type'), 'Mentorin'); return true;`);
    await sleep(400);
    await save(window);
    await sleep(400);

    // Die Gegenrichtung fehlt und muss angeboten werden
    check(await run(window, `return Boolean(document.querySelector('.relation__reverse'));`),
      'Fehlende Gegenrichtung wird nicht angeboten');
    await clickButton(window, 'Gegenrichtung anlegen', "document.querySelector('.relation__reverse')");
    await sleep(1200);
    check(await run(window, `return document.querySelector('.relation__reverse') === null;`),
      'Hinweis auf die Gegenrichtung bleibt stehen');

    await selectNote(window, 'Toran');
    check(await run(window, `return document.querySelectorAll('.relation').length === 1;`),
      'Gegenrichtung wurde bei Toran nicht angelegt');

    // Der Gegenrichtung eine eigene Bezeichnung geben. Im Graphen muessen
    // beide danach nebeneinander lesbar sein.
    await run(window, `setValue(document.querySelector('.relation__type'), 'Schuldner'); return true;`);
    await sleep(400);
    await save(window);
    await sleep(600);
    check(
      await run(window, `return document.querySelector('.relation__type').value === 'Schuldner';`),
      'Die Bezeichnung der Gegenrichtung wurde nicht übernommen'
    );
    await selectNote(window, 'Mira Falkenhand');
    // Jetzt gibt es keine freie Notiz mehr, statt leerer Liste muss ein Hinweis stehen
    check(await run(window, `return document.querySelector('.relations__add') === null;`),
      'Leere Auswahlliste bleibt sichtbar');

    // 4. Mira bekommt Steckbrieffeld und Text, damit die Kurzinfo etwas zeigt
    await selectNote(window, 'Mira Falkenhand');
    await setField(window, 'Spezies', 'Waldelfe');
    await run(window, `document.querySelector('.ProseMirror').focus(); return true;`);
    await sleep(200);
    window.webContents.insertText('Sie wuchs im Hafen von Baldurs Tor auf.');
    await sleep(600);
    await save(window);

    // 5. Text mit Wiki-Link in Torans Notiz tippen
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

    // 6. Kurzinfo-Karte muss den Textanfang zeigen
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

    // 7. Speichern per Strg+S
    await save(window);

    // 8. Suche: Treffer markiert in Liste und im Editor
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

    // 9. Backlink muss jetzt bei Mira auftauchen
    await selectNote(window, 'Mira Falkenhand');
    check(await run(window, `return document.querySelector('.backlinks')?.textContent.includes('Toran') === true;`),
      'Backlink von Toran fehlt bei Mira');

    // 10. Datei auf der Platte pruefen
    const campaignsDir = path.join(userData, 'vault', 'campaigns');
    const campaignId = fs.readdirSync(campaignsDir)[0];
    const notesDir = path.join(campaignsDir, campaignId, 'notes');
    const files = fs.readdirSync(notesDir).map((name) => fs.readFileSync(path.join(notesDir, name), 'utf8'));

    check(files.some((raw) => raw.includes('[[Mira Falkenhand]]')), 'Wiki-Link steht nicht als Klartext in der Datei');
    check(files.some((raw) => raw.includes('species: Waldelfe')), 'Steckbrieffeld wurde nicht gespeichert');
    check(files.every((raw) => raw.startsWith('---\n')), 'Datei ohne YAML-Frontmatter');
    check(files.every((raw) => !raw.includes('\\[')), 'Klammern wurden beim Speichern maskiert');
    check(files.some((raw) => raw.includes('schemaVersion: 1')), 'schemaVersion fehlt');

    // 11. Notiztyp anpassen: Feld umbenennen und neues Feld anlegen
    // Erreichbar ueber den Knopf am Steckbrief, nicht nur ueber das Menue.
    check(
      await run(window, `const box = [...document.querySelectorAll('.panel__title')]
           .find((h) => h.textContent.includes('Steckbrief'));
         return Boolean(box && box.querySelector('button'));`),
      'Am Steckbrief fehlt der Knopf zum Bearbeiten'
    );
    await menuAction(window, 'Notiztypen');
    await sleep(500);
    check(await run(window, `return Boolean(document.querySelector('.type-editor'));`), 'Notiztyp-Editor öffnet nicht');

    await run(
      window,
      `const entry = [...document.querySelectorAll('.type-editor__list button')]
         .find((b) => b.textContent.includes('Charakter'));
       entry.click();
       return true;`
    );
    await sleep(300);

    // Beschriftung aendern, der Schluessel muss stabil bleiben
    await run(
      window,
      `const row = [...document.querySelectorAll('.type-editor__fields li')]
         .find((li) => li.querySelector('.type-editor__field-label').value === 'Spezies');
       if (!row) throw new Error('Feld Spezies nicht gefunden');
       setValue(row.querySelector('.type-editor__field-label'), 'Volk');
       return true;`
    );
    await sleep(250);

    await clickButton(window, '+ Feld', "document.querySelector('.type-editor')");
    await sleep(300);
    await run(
      window,
      `const rows = [...document.querySelectorAll('.type-editor__fields li')];
       setValue(rows[rows.length - 1].querySelector('.type-editor__field-label'), 'Heimat');
       return true;`
    );
    await sleep(250);

    // Eine Auswahlliste anlegen und mit Werten füllen
    await clickButton(window, '+ Feld', "document.querySelector('.type-editor')");
    await sleep(300);
    await run(
      window,
      `const rows = [...document.querySelectorAll('.type-editor__fields li')];
       const row = rows[rows.length - 1];
       setValue(row.querySelector('.type-editor__field-label'), 'Gesinnung');
       const select = row.querySelector('select');
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'select');
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(400);
    await run(
      window,
      `const rows = [...document.querySelectorAll('.type-editor__fields li')];
       const area = rows[rows.length - 1].querySelector('textarea');
       if (!area) throw new Error('Eingabe für Auswahlwerte fehlt');
       setValue(area, 'Rechtschaffen' + String.fromCharCode(10) + 'Neutral' + String.fromCharCode(10) + 'Chaotisch');
       return true;`
    );
    await sleep(300);

    await clickButton(window, 'Übernehmen', "document.querySelector('.modal')");
    await sleep(900);

    check(await run(window, `return document.querySelector('.type-editor') === null;`), 'Dialog bleibt offen');
    check(
      await run(
        window,
        `const labels = [...document.querySelectorAll('.note-editor__side .field__label')].map((s) => s.textContent);
         return labels.includes('Volk') && labels.includes('Heimat') && !labels.includes('Spezies');`
      ),
      'Steckbrief übernimmt die Änderungen nicht'
    );
    check(
      await run(
        window,
        `const field = [...document.querySelectorAll('.note-editor__side .field')]
           .find((f) => f.textContent.startsWith('Gesinnung'));
         const select = field?.querySelector('select');
         return Boolean(select) && [...select.options].map((o) => o.value).includes('Chaotisch');`
      ),
      'Auswahlliste erscheint nicht im Steckbrief'
    );
    check(
      await run(
        window,
        `const field = [...document.querySelectorAll('.note-editor__side .field')]
           .find((f) => f.textContent.startsWith('Volk'));
         return field.querySelector('input').value === 'Waldelfe';`
      ),
      'Wert ging beim Umbenennen der Beschriftung verloren'
    );

    // Neuen Typ anlegen und benutzen
    await menuAction(window, 'Notiztypen');
    await sleep(500);
    await clickButton(window, '+ Typ', "document.querySelector('.type-editor')");
    await sleep(300);
    await run(
      window,
      `const detail = document.querySelector('.type-editor__detail');
       const inputs = detail.querySelectorAll('.field input');
       setValue(inputs[0], 'Gegenstand');
       setValue(inputs[1], 'Gegenstände');
       return true;`
    );
    await sleep(250);
    await clickButton(window, 'Übernehmen', "document.querySelector('.modal')");
    await sleep(900);

    check(
      await run(window, `return [...document.querySelectorAll('.note-list__new button')].some((b) => b.textContent.includes('Gegenstand'));`),
      'Neuer Notiztyp fehlt in der Seitenleiste'
    );

    await clickButton(window, '+ Gegenstand');
    await sleep(300);
    await fillDialog(window, 'Miras Bogen', 'Anlegen');
    check(
      await run(window, `return document.querySelector('.note-editor .badge')?.textContent === 'Gegenstand';`),
      'Notiz bekam nicht den neuen Typ'
    );

    // 12. Bild ins Portrait-Feld ziehen und im Fliesstext einfuegen
    await selectNote(window, 'Mira Falkenhand');

    // Ein winziges PNG, das im Renderer als Datei uebergeben wird
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    await run(
      window,
      `const bytes = Uint8Array.from(atob(${JSON.stringify(pngBase64)}), (c) => c.charCodeAt(0));
       const file = new File([bytes], 'portrait.png', { type: 'image/png' });
       const transfer = new DataTransfer();
       transfer.items.add(file);
       const target = document.querySelector('.image-field');
       if (!target) throw new Error('Portrait-Feld fehlt');
       target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
       return true;`
    );
    await sleep(1200);

    check(await run(window, `return Boolean(document.querySelector('.image-field__preview'));`),
      'Portrait wurde nicht übernommen');
    check(
      await run(window, `return document.querySelector('.image-field__preview').src.startsWith('backstory-asset://');`),
      'Portrait benutzt nicht das Bildprotokoll'
    );
    // Wird das Bild tatsaechlich geladen, oder ist es nur ein toter Verweis?
    check(
      await run(window, `const img = document.querySelector('.image-field__preview');
         return img.complete && img.naturalWidth > 0;`),
      'Portrait-Bild wird nicht geladen'
    );

    // Bild in den Fliesstext ziehen
    await run(
      window,
      `const bytes = Uint8Array.from(atob(${JSON.stringify(pngBase64)}), (c) => c.charCodeAt(0));
       const file = new File([bytes], 'szene.png', { type: 'image/png' });
       const transfer = new DataTransfer();
       transfer.items.add(file);
       const surface = document.querySelector('.ProseMirror');
       surface.focus();
       surface.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }));
       return true;`
    );
    await sleep(1500);
    check(await run(window, `return document.querySelectorAll('.ProseMirror img').length === 1;`),
      'Bild wurde nicht in den Text eingefügt');

    // Bildbreite setzen: die Knöpfe erscheinen nur bei ausgewähltem Bild
    await run(
      window,
      `const image = document.querySelector('.ProseMirror img');
       image.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
       image.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
       image.click();
       return true;`
    );
    await sleep(600);
    const hasWidthButtons = await run(
      window,
      `return [...document.querySelectorAll('.toolbar button')].some((b) => b.textContent === '200');`
    );
    if (hasWidthButtons) {
      await pressToolbar(window, '200');
      await sleep(600);
      const attrs = await run(
        window,
        `const img = document.querySelector('.ProseMirror img');
         return JSON.stringify({
           width: img.getAttribute('width'),
           selected: img.classList.contains('ProseMirror-selectednode'),
           buttons: [...document.querySelectorAll('.toolbar button')].map((b) => b.textContent)
         });`
      );
      check(JSON.parse(attrs).width === '200', `Bildbreite wurde nicht gesetzt: ${attrs}`);
    }

    await save(window);

    // Im Markdown muss ein relativer Verweis stehen, kein Protokoll und kein Base64
    {
      const campaignsDir = path.join(userData, 'vault', 'campaigns');
      const campaignId = fs.readdirSync(campaignsDir)[0];
      const notesDir = path.join(campaignsDir, campaignId, 'notes');
      const files = fs.readdirSync(notesDir).map((name) => fs.readFileSync(path.join(notesDir, name), 'utf8'));

      // Ohne Breite steht das Bild als Markdown, mit Breite als inline-HTML.
      // Beides muss den relativen Pfad behalten.
      check(
        files.some((raw) => /!\[[^\]]*\]\(assets\/[^)]+\.png\)/.test(raw) || /<img[^>]*src="assets\/[^"]+\.png"/.test(raw)),
        'Bild steht nicht als relativer Verweis im Markdown'
      );
      check(files.every((raw) => !/<img[^>]*src="backstory-asset/.test(raw)),
        'Protokoll-URL steht im gespeicherten HTML');
      check(files.every((raw) => !raw.includes('backstory-asset://')),
        'Protokoll-URL wurde ins Markdown geschrieben');
      check(files.every((raw) => !raw.includes('data:image')), 'Bild wurde als Base64 eingebettet');
      check(files.some((raw) => /portrait: assets\//.test(raw)), 'Portrait-Verweis fehlt im Steckbrief');

      const assets = fs.readdirSync(path.join(campaignsDir, campaignId, 'assets'));
      check(assets.length === 2, `erwartet zwei Bilddateien, gefunden ${assets.length}`);
    }

    // 13. Sprache auf Englisch und wieder zurueck
    await clickButton(window, 'Einstellungen');
    await sleep(500);
    await run(
      window,
      `const select = document.querySelector('.modal select');
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'en');
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(900);

    check(await run(window, `return document.querySelector('.modal__header h2').textContent === 'Settings';`),
      'Dialog bleibt nach dem Sprachwechsel deutsch');
    check(
      await run(window, `return [...document.querySelectorAll('.campaign-bar button')]
         .some((b) => b.textContent === 'Settings');`),
      'Kopfzeile bleibt nach dem Sprachwechsel deutsch'
    );

    // Selbst vergebene Bezeichnungen bleiben unveraendert, die kann das
    // Programm nicht uebersetzen
    check(await run(window, `return [...document.querySelectorAll('.note-list__new button')].some((b) => b.textContent.includes('Gegenstand'));`),
      'Eigener Notiztyp wurde faelschlich veraendert');

    await run(
      window,
      `const select = document.querySelector('.modal select');
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'de');
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(900);
    check(await run(window, `return document.querySelector('.modal__header h2').textContent === 'Einstellungen';`),
      'Rückwechsel auf Deutsch hat nicht gewirkt');

    await clickButton(window, '×', "document.querySelector('.modal__header')");
    await sleep(400);

    // 14. Umbenennen muss die Links mitziehen
    await selectNote(window, 'Mira Falkenhand');
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

    // 14b. Ein Titel mit Link-Sonderzeichen wird abgewiesen, nicht gespeichert
    await run(
      window,
      `const title = document.querySelector('.note-editor__title');
       setValue(title, 'Mira|Sturm');
       return true;`
    );
    await sleep(500);
    check(
      await run(window, `return document.body.textContent.includes('gehören zum Link-Format');`),
      'Hinweis auf unerlaubte Zeichen im Titel fehlt'
    );
    // Der Autosave muss pausieren, sonst stuende der Titel gleich in der Datei
    await sleep(1200);
    check(
      fs.readdirSync(notesDir).every((name) => !fs.readFileSync(path.join(notesDir, name), 'utf8').includes('Mira|Sturm')),
      'Titel mit Sonderzeichen wurde gespeichert'
    );

    await run(
      window,
      `const title = document.querySelector('.note-editor__title');
       setValue(title, 'Mira Sturmhand');
       return true;`
    );
    await sleep(1600);
    // 14c. Ein Kampagnen-Export sichert vorher, sonst fehlt der letzte Absatz
    {
      // Autosave aus, damit die Luecke nicht zufaellig zugedeckt wird.
      await clickButton(window, 'Einstellungen');
      await sleep(400);
      await run(
        window,
        `const box = [...document.querySelectorAll('.modal input[type=checkbox]')][0];
         if (box.checked) box.click();
         return true;`
      );
      await sleep(500);
      await clickButton(window, '\u00d7', "document.querySelector('.modal__header')");
      await sleep(400);

      await selectNote(window, 'Mira Sturmhand');
      await run(
        window,
        `const view = document.querySelector('.ProseMirror');
         view.focus();
         // Ans Ende, sonst ersetzt der Text eine noch markierte Bildkachel.
         const range = document.createRange();
         range.selectNodeContents(view);
         range.collapse(false);
         const selection = window.getSelection();
         selection.removeAllRanges();
         selection.addRange(range);
         document.execCommand('insertText', false, ' Ungesicherter Nachsatz.');
         return true;`
      );
      await sleep(600);
      check(
        await run(window, `return document.querySelector('.status--dirty') !== null;`),
        'Der Text gilt nicht als ungesichert, der Test pruefte nichts'
      );

      const unsavedDir = path.join(userData, 'export-ungesichert');
      stubDialogs(unsavedDir);
      nachgefragt.length = 0;
      speicherAntwort = 0; // Speichern und fortfahren
      await menuAction(window, 'Kampagne als Markdown');
      await sleep(3000);

      // Frueher schrieb der Export ungefragt. Ohne Autosave darf er das nicht
      // mehr — er fragt, und erst die Antwort „Speichern und fortfahren"
      // bringt die Aenderung in die Ausgabe.
      check(nachgefragt.length === 1, 'Der Export hat nicht nach Ungespeichertem gefragt');

      const dir = fs.readdirSync(unsavedDir).map((n) => path.join(unsavedDir, n)).find((e) => fs.statSync(e).isDirectory());
      check(Boolean(dir), 'Export ohne Autosave hat keinen Ordner angelegt');
      if (dir) {
        const texte = fs.readdirSync(dir)
          .filter((n) => n.endsWith('.md'))
          .map((n) => fs.readFileSync(path.join(dir, n), 'utf8'));
        check(
          texte.some((raw) => raw.includes('Ungesicherter Nachsatz.')),
          'Der Export enthaelt die ungesicherten Aenderungen nicht'
        );
      }

      // Autosave wieder an, die folgenden Abschnitte verlassen sich darauf.
      await clickButton(window, 'Einstellungen');
      await sleep(400);
      await run(
        window,
        `const box = [...document.querySelectorAll('.modal input[type=checkbox]')][0];
         if (!box.checked) box.click();
         return true;`
      );
      await sleep(500);
      await clickButton(window, '\u00d7', "document.querySelector('.modal__header')");
      await sleep(400);
    }

    // Beide Formate der Notiz liegen unter einem Knopf.
    await run(
      window,
      `const box = [...document.querySelectorAll('.menu')]
         .find((m) => m.querySelector('button').textContent.includes('Export'));
       if (!box) throw new Error('Export-Menü fehlt');
       box.querySelector('button').click();
       return true;`
    );
    await sleep(400);
    check(
      await run(window, `const box = [...document.querySelectorAll('.menu')]
         .find((m) => m.querySelector('button').textContent.includes('Export'));
         const eintraege = [...box.querySelectorAll('.menu__list button')].map((b) => b.textContent);
         box.querySelector('button').click();
         return eintraege.includes('Notiz als Markdown') && eintraege.includes('Notiz als PDF');`),
      'Die Notiz-Exporte liegen nicht unter einem gemeinsamen Knopf'
    );
    await sleep(300);

    // 15. Export als Markdown und PDF
    {
      const exportDir = path.join(userData, 'export');
      stubDialogs(exportDir);

      // Die Notiz wurde in Abschnitt 14 umbenannt
      await selectNote(window, 'Mira Sturmhand');
      await menuAction(window, 'Kampagne als Markdown');
      await sleep(2500);

      const campaignDir = fs.readdirSync(exportDir).map((name) => path.join(exportDir, name)).find((entry) => fs.statSync(entry).isDirectory());
      check(Boolean(campaignDir), 'Markdown-Export hat keinen Ordner angelegt');

      if (campaignDir) {
        const files = fs.readdirSync(campaignDir);
        check(files.some((name) => name.startsWith('Mira Sturmhand')), `Notizdatei fehlt: ${files.join(', ')}`);
        check(files.includes('assets'), 'Bilder wurden nicht mitkopiert');

        const miraFile = files.find((name) => name.startsWith('Mira Sturmhand'));
        const content = fs.readFileSync(path.join(campaignDir, miraFile), 'utf8');
        check(content.startsWith('# Mira'), 'Export beginnt nicht mit der Überschrift');
        check(!content.includes('schemaVersion'), 'YAML-Kopf steht im Export');
        check(/\*\*Volk:\*\*\s*Waldelfe/.test(content), 'Steckbrieffeld fehlt im Export');
        check(content.includes('## Beziehungen'), 'Beziehungen fehlen im Export');

        const assets = fs.readdirSync(path.join(campaignDir, 'assets'));
        check(assets.length >= 1, 'keine Bilder im Export');
      }

      await menuAction(window, 'Kampagne als PDF');
      await sleep(4000);

      const pdf = fs.readdirSync(exportDir).find((name) => name.endsWith('.pdf'));
      check(Boolean(pdf), `PDF wurde nicht geschrieben: ${fs.readdirSync(exportDir).join(', ')}`);
      if (pdf) {
        const bytes = fs.readFileSync(path.join(exportDir, pdf));
        check(bytes.subarray(0, 4).toString() === '%PDF', 'Datei ist kein PDF');
        check(bytes.length > 1000, `PDF ist verdächtig klein: ${bytes.length} Bytes`);
      }
    }

    // 16b. Der KI-Bereich liegt im selben Dialog, klar benannt
    await selectNote(window, 'Toran');
    await clickButton(window, 'Schreibhilfe');
    await sleep(700);
    check(
      await run(window, `return document.querySelector('.modal__header h2').textContent.includes('KI');`),
      'Der Dialogtitel nennt den KI-Teil nicht'
    );
    check(
      await run(window, `const reiter = [...document.querySelectorAll('.prompts__tabs button')].map((b) => b.textContent);
         return reiter.some((r) => r.includes('ohne KI')) && reiter.some((r) => r.includes('KI-Assistent'));`),
      'Die Reiter unterscheiden Vorschläge und KI nicht'
    );
    await run(
      window,
      `[...document.querySelectorAll('.prompts__tabs button')].find((b) => b.textContent.includes('KI-Assistent')).click();
       return true;`
    );
    await sleep(500);
    check(
      await run(window, `return Boolean(document.querySelector('.assistant--chat'))
         || document.body.textContent.includes('Keine KI-Anbindung');`),
      'Der KI-Reiter zeigt weder Gespräch noch Hinweis'
    );
    await clickButton(window, '\u00d7', "document.querySelector('.modal__header')");
    await sleep(400);

    // 16. Schreibhilfe: Vorschlag in den Text uebernehmen
    await selectNote(window, 'Toran');
    await clickButton(window, 'Schreibhilfe');
    await sleep(1200);
    check(await run(window, `return Boolean(document.querySelector('.prompts__categories'));`),
      'Schreibhilfe öffnet nicht');
    check(await run(window, `return document.querySelectorAll('.prompts__option').length === 4;`),
      'Es werden nicht vier Vorschläge gewürfelt');

    const suggestion = await run(
      window,
      `const option = document.querySelector('.prompts__option');
       const text = option.querySelector('span').textContent;
       option.querySelector('button').click();
       return text;`
    );
    await sleep(900);
    check(await run(window, `return document.querySelector('.modal') === null;`), 'Schreibhilfe bleibt offen');
    check(
      await run(window, `return document.querySelector('.ProseMirror').textContent.includes(${JSON.stringify('')} + ${JSON.stringify(suggestion)});`),
      'Vorschlag steht nicht im Text'
    );

    await save(window);

    // Die Vorschlagsdatei muss im Speicherort liegen und bearbeitbar sein.
    //
    // Je Sprache eine Datei: sie ist Nutzerdatei, und wer eigene Vorschlaege
    // ergaenzt, tut das in der Sprache, in der er schreibt. Geprueft wird
    // deshalb das Muster und nicht ein fester Name — welche Sprache der Lauf
    // gerade hat, ist hier nicht der Punkt.
    const imVault = fs.readdirSync(path.join(userData, 'vault'));
    const vorschlagsdateien = imVault.filter((name) => /^writing-prompts\.(de|en)\.json$/.test(name));
    check(vorschlagsdateien.length > 0,
      `keine writing-prompts.<sprache>.json angelegt (gefunden: ${imVault.join(', ')})`);
    // Und der alte sprachlose Name darf nicht zurueckkommen: er fror beim
    // ersten Start eine Sprache ein, und genau das war der Fehler.
    check(!imVault.includes('writing-prompts.json'),
      'die alte sprachlose writing-prompts.json ist wieder da');

    // 16b. Die Vorschlagsliste wechselt die Sprache mit
    /*
     * Gemeldet: "Wenn ich die Sprache auf Englisch stelle ist die Prompt
     * (ohne KI) List immer noch auf Deutsch."
     *
     * Der Hauptprozess las immer richtig — die Liste lag nur im Zustand der
     * Oberflaeche und wurde nach dem ersten Holen nie wieder angefasst.
     */
    await clickButton(window, 'Schreibhilfe');
    await sleep(700);
    /*
     * Geprueft werden die Kategorienamen, nicht die Vorschlaege selbst.
     *
     * Die Vorschlaege werden bei jedem Oeffnen neu gezogen: sie sind auch
     * dann verschieden, wenn die Sprache dieselbe geblieben ist. Ein Test auf
     * "anders als vorher" ging deshalb durch, waehrend unter "Englisch"
     * weiter deutscher Text stand — genau der gemeldete Fehler, und der Test
     * sah ihn nicht.
     */
    const kategorien = () =>
      run(
        window,
        `return [...document.querySelectorAll('.prompts__categories button')].map((e) => e.textContent).join(' | ');`
      );
    const deutscheVorschlaege = await kategorien();
    await run(window, `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`);
    await sleep(400);

    await clickButton(window, 'Einstellungen');
    await sleep(500);
    await run(
      window,
      `const select = document.querySelector('.modal select');
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'en');
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(900);
    await run(window, `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`);
    await sleep(400);

    // Auf Englisch heisst der Knopf "Prompts" — die Oberflaeche ist ja
    // umgestellt, und genau darum geht es hier.
    await clickButton(window, 'Prompts');
    await sleep(900);
    const englischeVorschlaege = await kategorien();
    check(
      deutscheVorschlaege.includes('Herkunftsort'),
      `Auf Deutsch stehen nicht die deutschen Kategorien da (${deutscheVorschlaege})`
    );
    check(
      englischeVorschlaege.includes('Place of origin'),
      `Vorschlagsliste bleibt nach dem Sprachwechsel deutsch (${englischeVorschlaege})`
    );
    await run(window, `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`);
    await sleep(300);

    // Zurueck auf Deutsch, damit die folgenden Pruefungen ihre Texte finden.
    await clickButton(window, 'Settings');
    await sleep(500);
    await run(
      window,
      `const select = document.querySelector('.modal select');
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'de');
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(900);
    await run(window, `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`);
    await sleep(400);

    // 16c. Rechtsklick auf eine Notiz
    /*
     * Geprueft wird die Bedienung, nicht nur die Anwesenheit: dass das Menue
     * aufgeht, dass Escape es wieder schliesst, und dass Loeschen weiterhin
     * nachfragt statt sofort zu loeschen. Ein Menue, das ohne Frage loescht,
     * waere schlimmer als gar keins.
     */
    const rechtsklick = `const ziel = document.querySelector('.note-list__scroll button');
       const kasten = ziel.getBoundingClientRect();
       ziel.dispatchEvent(new MouseEvent('contextmenu', {
         bubbles: true, clientX: kasten.left + 10, clientY: kasten.top + 10 }));
       return true;`;
    await run(window, rechtsklick);
    await sleep(400);
    check(await run(window, `return Boolean(document.querySelector('.kontextmenue'));`),
      'Rechtsklick auf eine Notiz öffnet kein Menü');
    check(
      await run(window, `return document.querySelectorAll('.kontextmenue button').length === 2;`),
      'Das Menü hat nicht die zwei erwarteten Einträge'
    );

    await run(window, `document.querySelector('.kontextmenue').dispatchEvent(
       new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`);
    await sleep(300);
    check(await run(window, `return document.querySelector('.kontextmenue') === null;`),
      'Escape schließt das Kontextmenü nicht');

    // Loeschen muss weiter nachfragen.
    await run(window, rechtsklick);
    await sleep(400);
    await run(window, `[...document.querySelectorAll('.kontextmenue button')]
       .find((b) => /Löschen|Delete/.test(b.textContent)).click(); return true;`);
    await sleep(500);
    check(await run(window, `return Boolean(document.querySelector('.modal'));`),
      'Löschen aus dem Kontextmenü fragt nicht nach');
    // Abbrechen: die Notiz soll bleiben.
    const vorAbbruch = await run(window, `return document.querySelectorAll('.note-list__title').length;`);
    await run(window, `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`);
    await sleep(500);
    check(
      (await run(window, `return document.querySelectorAll('.note-list__title').length;`)) === vorAbbruch,
      'Abbrechen im Löschdialog hat die Notiz trotzdem entfernt'
    );

    // Umbenennen: der Dialog muss den bisherigen Titel mitbringen.
    await run(window, rechtsklick);
    await sleep(400);
    await run(window, `[...document.querySelectorAll('.kontextmenue button')]
       .find((b) => /Umbenennen|Rename/.test(b.textContent)).click(); return true;`);
    await sleep(500);
    check(
      await run(window, `const feld = document.querySelector('.modal input');
         return Boolean(feld && feld.value.length > 0);`),
      'Umbenennen bringt den bisherigen Titel nicht mit'
    );
    await run(window, `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`);
    await sleep(400);

    // 17. Graph-Ansicht
    await clickButton(window, 'Graph');
    await sleep(1500);
    check(await run(window, `return Boolean(document.querySelector('.graph__canvas'));`), 'Graph öffnet nicht');
    check(await run(window, `return document.querySelectorAll('.graph__node').length >= 3;`),
      'Zu wenige Knoten im Graph');
    check(await run(window, `return document.querySelectorAll('.graph__edge').length >= 2;`),
      'Zu wenige Kanten im Graph');
    check(
      await run(window, `return document.querySelectorAll('.graph__edge--relation').length >= 1
         && document.querySelectorAll('.graph__edge--mention').length >= 1;`),
      'Beziehungen und Erwähnungen werden nicht unterschieden'
    );
    // Knoten muessen auseinanderliegen, nicht alle auf einem Punkt
    check(
      await run(window, `const points = [...document.querySelectorAll('.graph__node')]
           .map((g) => g.getAttribute('transform'));
         return new Set(points).size === points.length;`),
      'Knoten liegen übereinander'
    );

    await clickButton(window, 'Beziehungen', "document.querySelector('.graph__modes')");
    await sleep(800);
    check(await run(window, `return document.querySelectorAll('.graph__edge--mention').length === 0;`),
      'Filter auf Beziehungen wirkt nicht');

    // Typfilter: Charaktere ausblenden muss Knoten entfernen
    const beforeFilter = await run(window, `return document.querySelectorAll('.graph__node').length;`);
    await run(
      window,
      `const bars = document.querySelectorAll('.graph__modes');
       const chip = [...bars[bars.length - 1].querySelectorAll('button')]
         .find((b) => b.textContent.includes('Charakter'));
       if (!chip) throw new Error('Typfilter für Charakter fehlt');
       chip.click();
       return true;`
    );
    await sleep(900);
    const afterFilter = await run(window, `return document.querySelectorAll('.graph__node').length;`);
    check(afterFilter < beforeFilter, `Typfilter wirkt nicht (${beforeFilter} -> ${afterFilter})`);

    await clickButton(window, 'Alle', "document.querySelectorAll('.graph__modes')[1]");
    await sleep(800);
    check(
      await run(window, `return document.querySelectorAll('.graph__node').length === ${beforeFilter};`),
      'Zurücksetzen des Typfilters wirkt nicht'
    );

    // Zoom verändert die viewBox und lässt sich zurücksetzen
    const zoomed = await run(
      window,
      `const svg = document.querySelector('.graph__canvas');
       const before = svg.getAttribute('viewBox');
       [...document.querySelectorAll('.graph__bar button')].find((b) => b.textContent.trim() === '+').click();
       return before;`
    );
    await sleep(500);
    check(await run(window, `return document.querySelector('.graph__canvas').getAttribute('viewBox') !== ${JSON.stringify(zoomed)};`),
      'Zoom verändert die Ansicht nicht');

    await clickButton(window, 'Zoom zurücksetzen', "document.querySelector('.graph__bar')");
    await sleep(500);
    check(await run(window, `return document.querySelector('.graph__canvas').getAttribute('viewBox') === '0 0 1200 780';`),
      'Zurücksetzen der Ansicht wirkt nicht');

    // 17a. Zwei Richtungen zwischen denselben Knoten liegen nebeneinander
    {
      const linien = await run(
        window,
        `const paare = new Map();
         for (const g of document.querySelectorAll('.graph__edge--relation')) {
           const line = g.querySelector('line');
           const punkte = [line.getAttribute('x1'), line.getAttribute('y1'), line.getAttribute('x2'), line.getAttribute('y2')];
           paare.set(punkte.join(','), (paare.get(punkte.join(',')) ?? 0) + 1);
         }
         return [...paare.keys()];`
      );
      check(linien.length >= 2, `Zu wenige Beziehungslinien im Graph: ${linien.length}`);
      check(new Set(linien).size === linien.length, 'Hin- und Rückrichtung liegen auf derselben Linie');

      const beschriftungen = await run(
        window,
        `return [...document.querySelectorAll('.graph__edge--relation text')]
           .map((t) => t.getAttribute('x') + ',' + t.getAttribute('y'));`
      );
      check(beschriftungen.length >= 2, `Zu wenige Beziehungstexte im Graph: ${JSON.stringify(beschriftungen)}`);
      check(
        new Set(beschriftungen).size === beschriftungen.length,
        `Die Beziehungstexte stehen aufeinander: ${JSON.stringify(beschriftungen)}`
      );
    }

    // 17b. Ein verschobener Knoten bleibt an seiner Stelle
    const vorherAlle = await run(
      window,
      `return [...document.querySelectorAll('.graph__node')]
         .map((g) => g.getAttribute('data-id') + '=' + g.getAttribute('transform'));`
    );

    const gezogen = await run(
      window,
      `const svg = document.querySelector('.graph__canvas');
       const node = document.querySelector('.graph__node');
       const id = node.getAttribute('data-id');
       const rect = svg.getBoundingClientRect();
       const at = (x, y) => ({ clientX: rect.left + x, clientY: rect.top + y, bubbles: true });

       node.dispatchEvent(new MouseEvent('mousedown', at(100, 100)));
       svg.dispatchEvent(new MouseEvent('mousemove', at(300, 250)));
       svg.dispatchEvent(new MouseEvent('mouseup', at(300, 250)));
       return id;`
    );
    await sleep(1200);
    const kampagnenDatei = path.join(userData, 'vault', 'campaigns', campaignId, 'campaign.json');
    {
      const kampagne = JSON.parse(fs.readFileSync(kampagnenDatei, 'utf8'));
      check(
        Boolean(kampagne.graphPositions && kampagne.graphPositions[gezogen]),
        'Die verschobene Stelle steht nicht in campaign.json'
      );
    }

    // Die uebrigen Knoten duerfen dabei nicht mitspringen.
    {
      const vorherAndere = vorherAlle.filter((eintrag) => !eintrag.startsWith(gezogen + '='));
      const nachherAlle = await run(
        window,
        `return [...document.querySelectorAll('.graph__node')]
           .map((g) => g.getAttribute('data-id') + '=' + g.getAttribute('transform'));`
      );
      const gefiltert = nachherAlle.filter((eintrag) => !eintrag.startsWith(gezogen + '='));
      check(
        JSON.stringify(gefiltert) === JSON.stringify(vorherAndere),
        `Beim Verschieben eines Knotens sind andere mitgesprungen:\n    vorher : ${JSON.stringify(vorherAndere)}\n    nachher: ${JSON.stringify(gefiltert)}`
      );
    }

    // Auch ein Sprachwechsel darf die Anordnung nicht neu wuerfeln: die
    // Notizen werden dabei umsortiert, am Netz aendert sich nichts.
    {
      const vorSprache = await run(
        window,
        `return [...document.querySelectorAll('.graph__node')]
           .map((g) => g.getAttribute('data-id') + '=' + g.getAttribute('transform'));`
      );

      await clickButton(window, 'Einstellungen');
      await sleep(500);
      await run(
        window,
        `const select = document.querySelector('.modal select');
         Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'en');
         select.dispatchEvent(new Event('change', { bubbles: true }));
         return true;`
      );
      await sleep(900);
      await run(
        window,
        `const select = document.querySelector('.modal select');
         Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'de');
         select.dispatchEvent(new Event('change', { bubbles: true }));
         return true;`
      );
      await sleep(900);
      await clickButton(window, '\u00d7', "document.querySelector('.modal__header')");
      await sleep(500);

      const nachSprache = await run(
        window,
        `return [...document.querySelectorAll('.graph__node')]
           .map((g) => g.getAttribute('data-id') + '=' + g.getAttribute('transform'));`
      );
      check(
        JSON.stringify(nachSprache) === JSON.stringify(vorSprache),
        'Ein Sprachwechsel hat die Anordnung im Graphen neu gewürfelt'
      );
    }

    // Zwei Zuege unmittelbar hintereinander: der zweite darf den ersten nicht
    // ueberschreiben, obwohl das Gespeicherte noch nicht zurueck ist.
    await run(
      window,
      `const svg = document.querySelector('.graph__canvas');
       const rect = svg.getBoundingClientRect();
       const at = (x, y) => ({ clientX: rect.left + x, clientY: rect.top + y, bubbles: true });
       const knoten = [...document.querySelectorAll('.graph__node')];

       for (const [i, node] of [knoten[1], knoten[2]].entries()) {
         node.dispatchEvent(new MouseEvent('mousedown', at(150, 150)));
         svg.dispatchEvent(new MouseEvent('mousemove', at(400 + i * 60, 300 + i * 60)));
         svg.dispatchEvent(new MouseEvent('mouseup', at(400 + i * 60, 300 + i * 60)));
       }
       return true;`
    );
    await sleep(1500);
    {
      const kampagne = JSON.parse(fs.readFileSync(kampagnenDatei, 'utf8'));
      check(
        Object.keys(kampagne.graphPositions ?? {}).length === 3,
        `Drei Züge ergeben nicht drei Stellen: ${JSON.stringify(kampagne.graphPositions)}`
      );
    }

    // Neu anordnen wirft sie wieder weg, und zwar beim ersten Druck. Geprueft
    // wird der zuerst gezogene Knoten: die uebrigen ordnen sich ohnehin neu.
    const stelleVon = (id) =>
      run(
        window,
        `const node = document.querySelector('.graph__node[data-id=' + JSON.stringify(${JSON.stringify(id)}) + ']');
         return node ? node.getAttribute('transform') : null;`
      );

    // Die abgelegte Stelle als Vergleich: danach darf der Knoten nicht mehr
    // genau dort stehen.
    const abgelegt = JSON.parse(fs.readFileSync(kampagnenDatei, 'utf8')).graphPositions[gezogen];
    const vorNeu = await stelleVon(gezogen);
    check(
      vorNeu === `translate(${abgelegt.x} ${abgelegt.y})`,
      `Der gezogene Knoten steht nicht an seiner gespeicherten Stelle: ${vorNeu}`
    );

    await clickButton(window, 'Neu anordnen', "document.querySelector('.graph__bar')");
    await sleep(1500);
    {
      const kampagne = JSON.parse(fs.readFileSync(kampagnenDatei, 'utf8'));
      check(
        Object.keys(kampagne.graphPositions ?? {}).length === 0,
        'Neu anordnen hat die verschobenen Stellen nicht verworfen'
      );
      check(
        (await stelleVon(gezogen)) !== vorNeu,
        'Neu anordnen lässt den gezogenen Knoten beim ersten Druck an seiner Stelle'
      );
    }

    // Klick auf einen Knoten oeffnet die Notiz
    await run(window, `document.querySelector('.graph__node').dispatchEvent(new MouseEvent('click', { bubbles: true })); return true;`);
    await sleep(900);
    check(await run(window, `return document.querySelector('.graph__canvas') === null
       && Boolean(document.querySelector('.note-editor'));`), 'Klick auf einen Knoten öffnet keine Notiz');

    // 18. Eigene Suche im Editor mit Strg+F, samt Ersetzen
    await selectNote(window, 'Toran');
    await run(
      window,
      `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true })); return true;`
    );
    await sleep(600);
    check(await run(window, `return Boolean(document.querySelector('.search-bar__query'));`),
      'Strg+F öffnet keine Suchleiste');

    await run(window, `setValue(document.querySelector('.search-bar__query'), 'Gold'); return true;`);
    await sleep(700);
    check(await run(window, `return document.querySelectorAll('.ProseMirror .search-hit').length === 1;`),
      'Eigene Suche hebt nichts hervor');

    await run(window, `setValue(document.querySelector('.search-bar__replace'), 'Silber'); return true;`);
    await sleep(400);
    await clickButton(window, 'Alle ersetzen', "document.querySelector('.search-bar')");
    await sleep(900);

    check(
      await run(window, `const text = document.querySelector('.ProseMirror').textContent;
         return text.includes('Silber') && !text.includes('Gold');`),
      'Ersetzen hat nicht gewirkt'
    );
    check(await run(window, `return document.querySelectorAll('.ProseMirror .search-hit').length === 0;`),
      'Nach dem Ersetzen bleiben Fundstellen markiert');

    // Escape schliesst die eigene Suche wieder
    await run(
      window,
      `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return true;`
    );
    await sleep(500);
    check(await run(window, `return document.querySelector('.search-bar__query') === null;`),
      'Escape schließt die Suchleiste nicht');

    await save(window);

    // 19. Notiztypen aus einer anderen Kampagne übernehmen
    await menuAction(window, 'Neue Kampagne');
    await sleep(400);
    await fillDialog(window, 'Aschetal', 'Anlegen');
    await sleep(700);

    await menuAction(window, 'Notiztypen');
    await sleep(700);
    check(await run(window, `return Boolean(document.querySelector('.type-editor__copy select'));`),
      'Auswahl für andere Kampagnen fehlt');

    await run(
      window,
      `const select = document.querySelector('.type-editor__copy select');
       const option = [...select.options].find((o) => o.textContent.includes('Sturmküste'));
       if (!option) throw new Error('Sturmküste nicht in der Auswahl');
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value);
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(300);
    await clickButton(window, 'Übernehmen', "document.querySelector('.type-editor__copy')");
    await sleep(600);

    check(await run(window, `return Boolean(document.querySelector('.type-editor__note'));`),
      'Keine Rückmeldung zum Übernehmen');
    check(
      await run(window, `return [...document.querySelectorAll('.type-editor__list button')]
         .some((b) => b.textContent.includes('Gegenstand'));`),
      'Der eigene Typ wurde nicht übernommen'
    );

    await clickButton(window, 'Übernehmen', "document.querySelector('.modal__footer')");
    await sleep(900);
    check(
      await run(window, `return [...document.querySelectorAll('.note-list__new button')].some((b) => b.textContent.includes('Gegenstand'));`),
      'Übernommener Typ fehlt nach dem Speichern'
    );

    // Zurück zur ursprünglichen Kampagne
    await run(
      window,
      `const select = document.querySelector('.campaign-bar select');
       const option = [...select.options].find((o) => o.textContent === 'Sturmküste');
       Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value);
       select.dispatchEvent(new Event('change', { bubbles: true }));
       return true;`
    );
    await sleep(1200);

    // 20. Aufräumen: benutzte Bilder bleiben, unbenutzte werden angeboten
    await menuAction(window, 'Aufräumen');
    await sleep(2000);
    check(await run(window, `return Boolean(document.querySelector('.modal'));`), 'Aufräumen-Dialog öffnet nicht');
    // Beide Bilder sind noch in Benutzung, es darf nichts angeboten werden
    check(await run(window, `return document.querySelectorAll('.cleanup li').length === 0;`),
      'Benutzte Bilder wurden als verwaist gemeldet');
    await clickButton(window, 'Schließen', "document.querySelector('.modal__footer')");
    await sleep(500);

    // 21. Versionsverlauf: alten Stand wiederherstellen
    await selectNote(window, 'Toran');
    await run(window, `document.querySelector('.ProseMirror').focus(); return true;`);
    await sleep(200);
    window.webContents.insertText(' Nachtrag.');
    await sleep(500);
    await save(window);

    await clickButton(window, 'Verlauf');
    await sleep(1200);
    check(await run(window, `return Boolean(document.querySelector('.history__list'));`),
      'Verlauf zeigt keine Fassungen');

    await clickButton(window, 'Wiederherstellen', "document.querySelector('.modal')");
    await sleep(1500);
    check(await run(window, `return document.querySelector('.modal') === null;`), 'Verlaufs-Dialog bleibt offen');
    check(
      await run(window, `return !document.querySelector('.ProseMirror').textContent.includes('Nachtrag');`),
      'Der alte Stand wurde nicht wiederhergestellt'
    );
    // 21b. Link im Fliesstext setzen und speichern
    await selectNote(window, 'Toran');
    await run(
      window,
      `const view = document.querySelector('.ProseMirror');
       view.focus();
       const range = document.createRange();
       range.selectNodeContents(view);
       range.collapse(false);
       const selection = window.getSelection();
       selection.removeAllRanges();
       selection.addRange(range);
       document.execCommand('insertText', false, ' Handbuch');
       return true;`
    );
    await sleep(400);
    // Das eben getippte Wort markieren, damit der Link daran haengt.
    await run(
      window,
      `const view = document.querySelector('.ProseMirror');
       const selection = window.getSelection();
       selection.modify('extend', 'backward', 'word');
       return selection.toString();`
    );
    await sleep(300);
    await pressToolbar(window, '\u{1f517}');
    await sleep(600);
    check(await run(window, `return Boolean(document.querySelector('.modal input'));`), 'Link-Dialog öffnet nicht');
    await run(
      window,
      `setValue(document.querySelector('.modal input'), 'https://example.org/regeln');
       return true;`
    );
    await sleep(300);
    await clickButton(window, 'Übernehmen', "document.querySelector('.modal')");
    await sleep(600);
    await save(window);
    await sleep(900);
    {
      const dateien = fs.readdirSync(notesDir).map((n) => fs.readFileSync(path.join(notesDir, n), 'utf8'));
      check(
        dateien.some((raw) => raw.includes('[Handbuch](https://example.org/regeln)')),
        'Der Link steht nicht in der Datei'
      );
    }

    // 21d. Eingefuegter Klartext wird als Markdown gelesen
    await selectNote(window, 'Toran');
    await run(
      window,
      `const view = document.querySelector('.ProseMirror');
       view.focus();
       const range = document.createRange();
       range.selectNodeContents(view);
       range.collapse(false);
       const selection = window.getSelection();
       selection.removeAllRanges();
       selection.addRange(range);

       // Zeilenumbruch ueber String.fromCharCode, damit er die Vorlage hier
       // nicht selbst umbricht.
       const nl = String.fromCharCode(10);
       const text = nl + '## Aus der Zwischenablage' + nl + nl + 'Ein **fetter** Satz.';

       const data = new DataTransfer();
       data.setData('text/plain', text);
       view.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
       return true;`
    );
    await sleep(800);
    check(
      await run(window, `return [...document.querySelectorAll('.ProseMirror h2')].some((h) => h.textContent.includes('Aus der Zwischenablage'));`),
      'Eingefügtes Markdown wurde nicht als Überschrift gelesen'
    );
    check(
      await run(window, `return [...document.querySelectorAll('.ProseMirror strong')].some((b) => b.textContent === 'fetter');`),
      'Eingefügtes Markdown wurde nicht als Fettschrift gelesen'
    );
    // Mehrere Absaetze duerfen keine leeren dazwischen erzeugen.
    const leereVorher = await run(window, `return [...document.querySelectorAll('.ProseMirror p')].filter((p) => !p.textContent.trim()).length;`);
    await run(
      window,
      `const view = document.querySelector('.ProseMirror');
       view.focus();
       const nl = String.fromCharCode(10);
       const data = new DataTransfer();
       data.setData('text/plain', 'Absatz eins.' + nl + nl + 'Absatz zwei.' + nl + nl + 'Ein <div>Kasten</div> bleibt Text.');
       view.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
       return true;`
    );
    await sleep(800);
    check(
      (await run(window, `return [...document.querySelectorAll('.ProseMirror p')].filter((p) => !p.textContent.trim()).length;`)) === leereVorher,
      'Das Einfügen mehrerer Absätze hat leere Absätze erzeugt'
    );
    check(
      await run(window, `return document.querySelector('.ProseMirror').textContent.includes('<div>Kasten</div>');`),
      'Spitze Klammern im eingefügten Text wurden als HTML gelesen'
    );

    // In einem Codeblock bleibt Eingefuegtes woertlich.
    await pressToolbar(window, '</>');
    await sleep(400);
    await run(
      window,
      `const view = document.querySelector('.ProseMirror');
       view.focus();
       const data = new DataTransfer();
       data.setData('text/plain', 'if (**p) return;');
       view.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
       return true;`
    );
    await sleep(700);
    check(
      await run(window, `return [...document.querySelectorAll('.ProseMirror pre')].some((p) => p.textContent.includes('if (**p) return;'));`),
      'Im Codeblock wurde das Eingefügte als Markdown gelesen'
    );

    await save(window);
    await sleep(900);
    {
      const dateien = fs.readdirSync(notesDir).map((n) => fs.readFileSync(path.join(notesDir, n), 'utf8'));
      check(
        dateien.some((raw) => raw.includes('## Aus der Zwischenablage') && raw.includes('**fetter**')),
        'Das eingefügte Markdown steht nicht als Markdown in der Datei'
      );
      check(
        dateien.every((raw) => !raw.includes('\\*\\*fetter')),
        'Das eingefügte Markdown wurde maskiert statt ausgewertet'
      );
    }

    // 21c. Tabelle einfuegen, fuellen und speichern
    await selectNote(window, 'Toran');
    await run(
      window,
      `const view = document.querySelector('.ProseMirror');
       view.focus();
       const range = document.createRange();
       range.selectNodeContents(view);
       range.collapse(false);
       const selection = window.getSelection();
       selection.removeAllRanges();
       selection.addRange(range);
       return true;`
    );
    await sleep(300);
    await pressToolbar(window, '\u25a6');
    await sleep(700);
    check(
      await run(window, `return document.querySelectorAll('.ProseMirror table th').length === 2;`),
      'Tabelle wurde nicht eingefügt'
    );
    // In die erste Kopfzelle schreiben.
    await run(
      window,
      `const cell = document.querySelector('.ProseMirror table th');
       const range = document.createRange();
       range.selectNodeContents(cell);
       range.collapse(true);
       const selection = window.getSelection();
       selection.removeAllRanges();
       selection.addRange(range);
       document.querySelector('.ProseMirror').focus();
       document.execCommand('insertText', false, 'Jahr');
       return true;`
    );
    await sleep(500);
    check(
      await run(window, `return [...document.querySelectorAll('.toolbar button')].some((b) => b.textContent === '+Z');`),
      'Tabellenknöpfe fehlen, obwohl der Cursor in der Tabelle steht'
    );
    await save(window);
    await sleep(900);
    {
      const dateien = fs.readdirSync(notesDir).map((n) => fs.readFileSync(path.join(notesDir, n), 'utf8'));
      const mitTabelle = dateien.find((raw) => raw.includes('| Jahr |'));
      check(Boolean(mitTabelle), 'Die Tabelle steht nicht in der Datei');
      if (mitTabelle) {
        check(/\|\s*---\s*\|/.test(mitTabelle), 'Der Tabelle fehlt die Trennzeile');
      }
    }

    // 22. Hilfe: Tastenkürzel müssen auffindbar sein
    await clickButton(window, 'Hilfe');
    await sleep(600);
    check(await run(window, `return Boolean(document.querySelector('.help'));`), 'Hilfe öffnet nicht');
    check(await run(window, `return document.querySelector('.help').textContent.includes('Strg + F');`),
      'Tastenkürzel fehlen in der Hilfe');
    check(await run(window, `return document.querySelector('.help').textContent.includes('Strg + Klick');`),
      'Tastenbezeichnungen sind nicht deutsch');
    await clickButton(window, '×', "document.querySelector('.modal__header')");
    await sleep(400);

    // 22b. Über: Name, Version und Lizenz müssen auffindbar sein
    await clickButton(window, 'Über');
    await sleep(600);
    check(await run(window, `return document.querySelector('.about')?.textContent.includes('ItsLunasDream');`),
      'Über-Dialog nennt nicht ItsLunasDream');
    check(await run(window, `return /Version \\d+\\.\\d+\\.\\d+/.test(document.querySelector('.about')?.textContent ?? '');`),
      'Über-Dialog zeigt keine Versionsnummer');
    check(await run(window, `return document.querySelector('.about')?.textContent.includes('Affero');`),
      'Über-Dialog nennt nicht die AGPL');
    await clickButton(window, '×', "document.querySelector('.modal__header')");
    await sleep(400);

    // 23. Das Fenster muss sich mit ungespeicherten Aenderungen schliessen
    // lassen. Frueher brach beforeunload das Schliessen ohne Dialog ab.
    await selectNote(window, 'Toran');
    await run(window, `document.querySelector('.ProseMirror').focus(); return true;`);
    await sleep(200);
    window.webContents.insertText(' Ungespeichert.');
    await sleep(400);
    check(await run(window, `return document.querySelector('.status--dirty') !== null;`),
      'Notiz gilt nicht als ungespeichert');

    const closed = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), 8000);
      window.once('closed', () => {
        clearTimeout(timer);
        resolve(true);
      });
      window.close();
    });
    check(closed, 'Das Fenster ließ sich mit ungespeicherten Änderungen nicht schließen');

    // Beim Schliessen muss der Stand noch gesichert worden sein
    if (closed) {
      const campaignsDir = path.join(userData, 'vault', 'campaigns');
      const saved = fs
        .readdirSync(campaignsDir)
        .flatMap((id) => {
          const notesDir = path.join(campaignsDir, id, 'notes');
          if (!fs.existsSync(notesDir)) return [];
          return fs.readdirSync(notesDir).map((name) => fs.readFileSync(path.join(notesDir, name), 'utf8'));
        })
        .some((raw) => raw.includes('Ungespeichert.'));
      check(saved, 'Der ungespeicherte Stand ging beim Schließen verloren');
    }
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
