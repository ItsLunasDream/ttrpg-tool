/**
 * Rechtschreibung: eigenes Menue, Ersetzen und Woerterbuch.
 *
 * Die Pruefung selbst gehoert Chromium, und ihre Woerterbuecher laedt es erst
 * bei Bedarf nach — in einem Rauchtest ohne Netz streicht sie also nichts an.
 * Geprueft wird deshalb der Weg, der uns gehoert: das Ereignis aus dem
 * Hauptprozess, das eigene Menue, das Ersetzen im Text und das Woerterbuch.
 * BACKSTORY_SMOKE_SPELL setzt dafuer ein festes Wort an die Stelle der
 * echten Pruefung.
 */
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const PROBE = 'Falknhand';
// Tritt an die Stelle der echten Pruefung, siehe oben.
process.env.BACKSTORY_SMOKE_SPELL = PROBE;

const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'backstory-spell-'));
app.setPath('userData', userData);
// Der Test klickt auf deutsche Beschriftungen.
fs.writeFileSync(path.join(userData, 'settings.json'), JSON.stringify({ language: 'de' }), 'utf8');

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

function setzeFeld(wert) {
  return `const feld = document.querySelector('.modal input');
     const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
     setzer.call(feld, ${JSON.stringify(wert)});
     feld.dispatchEvent(new Event('input', { bubbles: true }));
     [...document.querySelectorAll('.modal button')].find((b) => b.textContent.includes('Anlegen')).click();
     return true;`;
}

async function main() {
  const window = await warteAufFenster();
  // Ein Fehler im Renderer soll hier stehen und nicht in einer Konsole, die
  // niemand aufmacht.
  window.webContents.on('console-message', (_e, stufe, text) => {
    if (stufe >= 2) fehler.push(`console: ${text}`);
  });
  await sleep(3000);

  await run(
    window,
    `const knopf = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Erste Kampagne'));
     knopf.click();
     return true;`
  );
  await sleep(600);
  await run(window, setzeFeld('Probe'));
  await sleep(1400);

  await run(
    window,
    `const knopf = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('+ Charakter'));
     if (!knopf) throw new Error('Kein Knopf fuer einen neuen Charakter');
     knopf.click();
     return true;`
  );
  await sleep(600);
  await run(window, setzeFeld('Mira'));
  await sleep(1600);

  await run(window, `document.querySelector('.ProseMirror').focus(); return true;`);
  await sleep(300);
  window.webContents.insertText(`Sie heisst ${PROBE} mit Nachnamen.`);
  await sleep(800);

  // Rechtsklick auf das Wort: das eigene Menue muss aufgehen.
  //
  // Mit echten Eingabeereignissen, nicht mit einem gebauten DOM-Ereignis:
  // das Ereignis 'context-menu' im Hauptprozess kommt von Chromium, und das
  // sieht nur, was wirklich durch die Eingabe gelaufen ist.
  const stelle = await run(
    window,
    `const feld = document.querySelector('.ProseMirror');
     const knoten = (function suche(k) {
       if (k.nodeType === 3 && k.textContent.includes(${JSON.stringify(PROBE)})) return k;
       for (const kind of k.childNodes) { const treffer = suche(kind); if (treffer) return treffer; }
       return null;
     })(feld);
     if (!knoten) throw new Error('Das Probewort steht nicht im Text');
     const versatz = knoten.textContent.indexOf(${JSON.stringify(PROBE)});
     const bereich = document.createRange();
     bereich.setStart(knoten, versatz + 2);
     bereich.setEnd(knoten, versatz + 3);
     const kasten = bereich.getBoundingClientRect();
     return { x: Math.round(kasten.left + kasten.width / 2), y: Math.round(kasten.top + kasten.height / 2) };`
  );

  window.webContents.sendInputEvent({ type: 'mouseDown', button: 'right', x: stelle.x, y: stelle.y, clickCount: 1 });
  window.webContents.sendInputEvent({ type: 'mouseUp', button: 'right', x: stelle.x, y: stelle.y, clickCount: 1 });
  await sleep(1200);

  const eintraege = await run(
    window,
    `return [...document.querySelectorAll('.kontextmenue button')].map((b) => b.textContent);`
  );
  check(eintraege.includes('Falkenhand'), `Der Vorschlag fehlt im Menue: ${JSON.stringify(eintraege)}`);
  check(
    eintraege.some((eintrag) => eintrag.includes('Wörterbuch')),
    'Der Eintrag zum Aufnehmen ins Woerterbuch fehlt'
  );

  // Vorschlag anklicken: das Wort im Text muss ersetzt sein
  await run(
    window,
    `[...document.querySelectorAll('.kontextmenue button')].find((b) => b.textContent === 'Falkenhand').click();
     return true;`
  );
  await sleep(900);
  const text = await run(window, `return document.querySelector('.ProseMirror').textContent;`);
  check(text.includes('Falkenhand') && !text.includes(PROBE), `Das Wort wurde nicht ersetzt: ${text}`);

  // Woerterbuch: aufnehmen, auflisten, entfernen
  const nachAufnahme = await run(
    window,
    `return window.api.woerterbuch.hinzufuegen('Sturmküste').then((r) => r.ok ? r.value : []);`
  );
  check(nachAufnahme.includes('Sturmküste'), `Das Wort steht nicht im Woerterbuch: ${JSON.stringify(nachAufnahme)}`);

  const nachEntfernen = await run(
    window,
    `return window.api.woerterbuch.entfernen('Sturmküste').then((r) => r.ok ? r.value : ['fehler']);`
  );
  check(!nachEntfernen.includes('Sturmküste'), 'Das Wort liess sich nicht wieder entfernen');

  if (fehler.length) {
    console.error('RECHTSCHREIBUNG FEHLGESCHLAGEN');
    for (const eintrag of fehler) console.error(`- ${eintrag}`);
    app.exit(1);
    return;
  }
  console.log('Rechtschreibung bestanden.');
  app.exit(0);
}

main().catch((fehler) => {
  console.error(fehler);
  app.exit(1);
});
