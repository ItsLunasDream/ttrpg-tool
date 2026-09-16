/**
 * Der Monster Creator in der Huelle.
 *
 * Geprueft wird der Weg, den kein Modelltest sieht: laedt das Werkzeug,
 * wuerfelt es ein Monster, steht der Befund da, und landet ein gespeichertes
 * Monster wirklich als Datei im Datenordner — mit allen Zahlen im Kopf, denn
 * daran haengt spaeter der Encounter Creator.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-monster.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'monster-'));
const userData = path.join(tmp, 'userData');
app.setPath('userData', userData);
process.env.TTRPG_TOOLS_START_APP = 'monster';
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

process.on('unhandledRejection', (grund) => {
  console.log('FEHLER: unbehandelte Ablehnung:', grund);
  app.exit(1);
});

app.whenReady().then(async () => {
  await warte(5000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1320, height: 900 });
  await warte(800);

  const sicht = fenster.contentView.children.find((ansicht) =>
    ansicht.webContents.getURL().includes('/apps/monster/')
  );
  pruefe(Boolean(sicht), 'die Ansicht des Monster Creators ist da');
  if (!sicht) {
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);

  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // --- Wuerfeln -------------------------------------------------------------
  console.log('\nEin Monster wuerfeln:');
  pruefe(await js("Boolean(document.querySelector('.regler'))"), 'die Regler stehen da');

  // Grad 8 einstellen, damit die Zahlen gross genug sind, um sie zu erkennen.
  await js(`(() => {
    const feld = document.querySelector('.regler select');
    const setzer = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    setzer.call(feld, '8');
    feld.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await warte(200);

  await js("[...document.querySelectorAll('.knopf')].find(k => /Roll|Würfeln/.test(k.textContent)).click(); true");
  await warte(600);

  const name = await js("document.querySelector('.steckbrief h2')?.textContent ?? ''");
  pruefe(name.length > 2, `ein Monster steht da (${name})`);
  pruefe(
    await js("Boolean(document.querySelector('.befund'))"),
    'und der Befund steht darunter'
  );

  // --- Der Befund sagt „passt" ---------------------------------------------
  /*
   * Der Erzeuger baut gegen dieselben Richtwerte, gegen die die Pruefung
   * rechnet. Waere das nicht so, meckerte das Werkzeug an seinen eigenen
   * Monstern herum — und niemand wuerde ihm noch glauben.
   */
  pruefe(
    await js("document.querySelector('.befund').className.includes('befund--gut')"),
    'ein frisch gewuerfeltes Monster besteht die eigene Pruefung'
  );
  pruefe(
    (await js("document.querySelectorAll('.haelfte').length")) === 2,
    'beide Haelften werden getrennt ausgewiesen'
  );

  // --- Speichern ------------------------------------------------------------
  console.log('\nIn die Sammlung:');
  await js("[...document.querySelectorAll('.knopf')].find(k => /collection|Sammlung/i.test(k.textContent)).click(); true");
  await warte(900);

  // Jedes Werkzeug hat einen eigenen Unterordner im Datenordner (siehe
  // `datenordner()` in apps.ts), darin liegt der Ordner `monster`. Genau
  // diesen Pfad wird spaeter der Encounter Creator lesen.
  const ordner = path.join(userData, 'monster', 'monster');
  const dateien = fs.existsSync(ordner) ? fs.readdirSync(ordner).filter((d) => d.endsWith('.md')) : [];
  pruefe(dateien.length === 1, `eine Datei liegt im Ordner (${dateien.join(', ') || 'keine'})`);

  if (dateien.length > 0) {
    const inhalt = fs.readFileSync(path.join(ordner, dateien[0]), 'utf8');
    /*
     * Der Kopf ist die Schnittstelle zum Encounter Creator: er muss die
     * Zahlen tragen, damit niemand den Statblock zerlegen muss.
     */
    for (const feld of ['cr:', 'tp:', 'rk:', 'schaden_pro_runde:', 'angriffsbonus:', 'thema:', 'rolle:']) {
      pruefe(inhalt.includes(feld), `der Kopf traegt ${feld}`);
    }
    pruefe(inhalt.includes(`# ${name}`), 'und der Leib traegt den Namen als Ueberschrift');
  }

  // --- Die Sammlung ---------------------------------------------------------
  console.log('\nDie Sammlung:');
  await js("[...document.querySelectorAll('.reiter__knopf')].find(k => /Collection|Sammlung/.test(k.textContent)).click(); true");
  await warte(500);
  pruefe(
    (await js("document.querySelectorAll('.monsterkachel').length")) === 1,
    'das gespeicherte Monster steht als Kachel da'
  );

  // Die Suche: ein Feld fuer Name, Art und Grad.
  const suchen = async (text) => {
    await js(`(() => {
      const feld = document.querySelector('.sammlung__suche');
      const setzer = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setzer.call(feld, ${JSON.stringify(text)});
      feld.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await warte(250);
    return js("document.querySelectorAll('.monsterkachel').length");
  };

  pruefe((await suchen('8')) === 1, 'eine Zahl sucht den Grad');
  pruefe((await suchen('99')) === 0, 'ein anderer Grad findet nichts');
  pruefe((await suchen(name.slice(0, 4))) === 1, 'der Anfang des Namens findet es wieder');
  await suchen('');

  // --- Umschalten auf die Liste --------------------------------------------
  await js("[...document.querySelectorAll('.sammlung__ansicht .knopf')].at(-1).click(); true");
  await warte(300);
  pruefe(
    (await js("document.querySelectorAll('.monsterliste tbody tr').length")) === 1,
    'die Liste zeigt dasselbe Monster'
  );

  // --- Pruefen von Hand -----------------------------------------------------
  console.log('\nEin vorhandenes Monster pruefen:');
  await js("[...document.querySelectorAll('.reiter__knopf')].find(k => /Check|Prüfen/.test(k.textContent)).click(); true");
  await warte(400);
  pruefe(await js("Boolean(document.querySelector('.pruefen .befund'))"), 'der Befund steht auch hier');

  // Absichtlich zu viele Trefferpunkte: die Ampel muss anschlagen.
  await js(`(() => {
    const felder = [...document.querySelectorAll('.pruefen input[type=number]')];
    const setzer = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setzer.call(felder[0], '900');
    felder[0].dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await warte(400);
  pruefe(
    await js("document.querySelector('.pruefen .befund').className.includes('befund--hoch')"),
    'neunhundert Trefferpunkte bei Grad 5 gelten als zu stark'
  );
  pruefe(
    (await js("document.querySelectorAll('.pruefen .befund__vorschlaege li').length")) > 0,
    'und es steht dabei, was sich drehen laesst'
  );

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nMonster Creator bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
