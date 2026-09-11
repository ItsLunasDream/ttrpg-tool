/**
 * Rauchtest der KI-Einstellungen — an der laufenden Huelle.
 *
 * Die Modultests unter tests/ki.test.mjs pruefen das Bereinigen und die
 * Uebernahme. Was sie nicht sehen koennen: ob der Dialog die Felder wirklich
 * zeigt, ob das Geschriebene den Weg auf die Platte findet, und vor allem, ob
 * der API-Schluessel dort bleibt, wo er hingehoert — im Hauptprozess.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-ki.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ki-smoke-'));
const userData = path.join(tmp, 'userData');

// Eine Einstellungsdatei des Backstory Creators, wie sie aus der Zeit vor
// diesem Umbau stammen koennte. Die Uebernahme soll sie finden.
fs.mkdirSync(path.join(userData, 'backstory'), { recursive: true });
fs.writeFileSync(
  path.join(userData, 'backstory', 'settings.json'),
  JSON.stringify({
    schemaVersion: 1,
    aiProvider: 'ollama',
    ollamaBaseUrl: 'http://127.0.0.1:12345',
    ollamaModel: 'uebernommenes-modell',
    claudeApiKeyEncrypted: 'alter-schluessel'
  })
);

app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

const einstellungsDatei = path.join(userData, 'einstellungen.json');
const aufDerPlatte = () => JSON.parse(fs.readFileSync(einstellungsDatei, 'utf8'));

app.whenReady().then(async () => {
  await warte(4000);
  const fenster = BaseWindow.getAllWindows()[0];
  if (!fenster) {
    console.log('  FEHL kein Fenster');
    app.exit(1);
    return;
  }
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 800 });
  // Die Oberflaeche der Huelle ist die erste Ansicht im Fenster. Das Fenster
  // selbst ist ein BaseWindow und hat gar keine.
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

  // --- Uebernahme ----------------------------------------------------------
  const uebernommen = aufDerPlatte();
  pruefe(
    uebernommen.ki?.anbieter === 'ollama',
    'die im Backstory Creator eingerichtete KI wurde uebernommen'
  );
  pruefe(
    uebernommen.ki?.ollamaModell === 'uebernommenes-modell',
    'mitsamt Modell und Adresse'
  );
  pruefe(
    uebernommen.claudeSchluessel === 'alter-schluessel',
    'und der Schluessel wanderte unveraendert mit'
  );

  // --- Der Schluessel erreicht die Oberflaeche nicht -----------------------
  const gelesen = await js('window.shell.einstellungen.lesen()');
  pruefe(gelesen.claudeSchluessel === '', 'die Oberflaeche bekommt den Schluessel nicht zu sehen');
  pruefe(gelesen.ki.ollamaModell === 'uebernommenes-modell', 'die Einstellungen selbst schon');

  // --- Der Dialog ----------------------------------------------------------
  await js(
    `[...document.querySelectorAll('button')].find(b => /Settings|Einstellungen/.test(b.textContent)).click(); true`
  );
  await warte(400);
  const ueberschriften = await js(
    "[...document.querySelectorAll('.feld__ueberschrift')].map(e => e.textContent).join('|')"
  );
  pruefe(/^(AI|KI)$/m.test(ueberschriften), 'der Dialog zeigt einen KI-Abschnitt');

  const felder = await js(
    "[...document.querySelectorAll('.feld__name')].map(e => e.textContent).join('|')"
  );
  pruefe(/Ollama/.test(felder), 'und die Felder des uebernommenen Anbieters');

  // --- Umstellen ------------------------------------------------------------
  await js(`(() => {
    const wahl = [...document.querySelectorAll('.feld__wahl')].find(s => s.value === 'ollama');
    const setzer = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    setzer.call(wahl, 'claude');
    wahl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await warte(500);
  pruefe(aufDerPlatte().ki.anbieter === 'claude', 'ein Wechsel des Anbieters landet auf der Platte');
  pruefe(
    aufDerPlatte().ki.ollamaModell === 'uebernommenes-modell',
    'und raeumt die Einstellung des anderen Anbieters nicht weg'
  );

  // --- Die Sprache raeumt die KI nicht weg ---------------------------------
  /*
   * Der Fallstrick an der Sache: die Oberflaeche schickt nur Teilstuecke.
   * Wuerde das als ganze Einstellungsdatei gelten, loeschte ein Sprachwechsel
   * die KI-Einstellung — und niemand kaeme auf die Idee, dort zu suchen.
   */
  await js(`(() => {
    const wahl = [...document.querySelectorAll('.feld__wahl')].find(s => s.value === 'en' || s.value === 'de');
    const setzer = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    setzer.call(wahl, wahl.value === 'en' ? 'de' : 'en');
    wahl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await warte(600);
  pruefe(
    aufDerPlatte().ki.anbieter === 'claude',
    'ein Sprachwechsel laesst die KI-Einstellung stehen'
  );
  pruefe(
    aufDerPlatte().claudeSchluessel === 'alter-schluessel',
    'und den Schluessel ebenfalls'
  );

  // --- Bereitschaft ---------------------------------------------------------
  /*
   * Geprueft wird nicht, ob eine KI antwortet — hier laeuft keine. Geprueft
   * wird, dass die Absage einen uebersetzten Satz traegt und nicht einen
   * rohen Schluessel wie "error.aiAuth".
   */
  const zustand = await js('window.shell.ki.status()');
  pruefe(zustand.anbieter === 'claude', 'die Bereitschaftspruefung kennt den Anbieter');
  /*
   * Hier steht bewusst nicht `true`. Der uebernommene Schluessel ist in
   * diesem Lauf kein echter safeStorage-Block, laesst sich also nicht
   * aufmachen — und dann gilt er als nicht vorhanden. Geprueft wird, dass
   * Befund und Meldung zusammenpassen: entweder beide sagen "da", oder beide
   * sagen "nicht da". Ein "Ein Schluessel ist hinterlegt" neben "Kein
   * API-Schluessel hinterlegt" waere die unangenehmere Sorte Fehler.
   */
  pruefe(
    zustand.hatSchluessel === !/aiNoKey|Kein API|No API key/.test(zustand.beschreibung),
    `Befund und Meldung widersprechen sich nicht (hatSchluessel=${zustand.hatSchluessel})`
  );
  pruefe(
    typeof zustand.beschreibung === 'string' && !zustand.beschreibung.startsWith('error.'),
    `der Grund ist uebersetzt (${zustand.beschreibung.slice(0, 60)})`
  );
  pruefe(zustand.schluessel === undefined, 'der Schluessel selbst kommt nicht zurueck');

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);

  console.log(fehler.length === 0 ? '\nKI-Einstellungen bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
