/**
 * End-to-End-Rauchtest der gebauten App: legt Kampagne und Notizen an,
 * tippt einen Wiki-Link, speichert und prueft die Datei auf der Platte.
 * Aufruf: xvfb-run -a npx electron scripts/smoke.cjs --no-sandbox
 */
const { app, BrowserWindow, dialog } = require('electron');
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

/**
 * Dateidialoge blockieren einen automatischen Durchlauf. Fuer den Rauchtest
 * werden sie durch feste Antworten ersetzt.
 */
function stubDialogs(exportDir) {
  fs.mkdirSync(exportDir, { recursive: true });

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
    await clickButton(window, 'Notiztypen');
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
           .find((f) => f.textContent.startsWith('Volk'));
         return field.querySelector('input').value === 'Waldelfe';`
      ),
      'Wert ging beim Umbenennen der Beschriftung verloren'
    );

    // Neuen Typ anlegen und benutzen
    await clickButton(window, 'Notiztypen');
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

    await save(window);

    // Im Markdown muss ein relativer Verweis stehen, kein Protokoll und kein Base64
    {
      const campaignsDir = path.join(userData, 'vault', 'campaigns');
      const campaignId = fs.readdirSync(campaignsDir)[0];
      const notesDir = path.join(campaignsDir, campaignId, 'notes');
      const files = fs.readdirSync(notesDir).map((name) => fs.readFileSync(path.join(notesDir, name), 'utf8'));

      check(files.some((raw) => /!\[[^\]]*\]\(assets\/[^)]+\.png\)/.test(raw)),
        'Bild steht nicht als relativer Verweis im Markdown');
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
    check(await run(window, `return [...document.querySelectorAll('.campaign-bar button')].some((b) => b.textContent === 'New campaign');`),
      'Kopfzeile bleibt nach dem Sprachwechsel deutsch');

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
    // 15. Export als Markdown und PDF
    {
      const exportDir = path.join(userData, 'export');
      stubDialogs(exportDir);

      // Die Notiz wurde in Abschnitt 14 umbenannt
      await selectNote(window, 'Mira Sturmhand');
      await clickButton(window, 'Kampagne als Markdown');
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

      await clickButton(window, 'Kampagne als PDF');
      await sleep(4000);

      const pdf = fs.readdirSync(exportDir).find((name) => name.endsWith('.pdf'));
      check(Boolean(pdf), `PDF wurde nicht geschrieben: ${fs.readdirSync(exportDir).join(', ')}`);
      if (pdf) {
        const bytes = fs.readFileSync(path.join(exportDir, pdf));
        check(bytes.subarray(0, 4).toString() === '%PDF', 'Datei ist kein PDF');
        check(bytes.length > 1000, `PDF ist verdächtig klein: ${bytes.length} Bytes`);
      }
    }

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

    // Die Vorschlagsdatei muss im Speicherort liegen und bearbeitbar sein
    check(fs.existsSync(path.join(userData, 'vault', 'writing-prompts.json')),
      'writing-prompts.json wurde nicht angelegt');

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

    await clickButton(window, 'Ansicht zurücksetzen', "document.querySelector('.graph__bar')");
    await sleep(500);
    check(await run(window, `return document.querySelector('.graph__canvas').getAttribute('viewBox') === '0 0 1200 780';`),
      'Zurücksetzen der Ansicht wirkt nicht');

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
    await clickButton(window, 'Neue Kampagne');
    await sleep(400);
    await fillDialog(window, 'Aschetal', 'Anlegen');
    await sleep(700);

    await clickButton(window, 'Notiztypen');
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
    await clickButton(window, 'Aufräumen');
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
