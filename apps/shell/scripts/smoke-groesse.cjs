/**
 * Rauchtest: die Groesse der ganzen Oberflaeche (#61).
 *
 * Geprueft wird, was die Modultests nicht sehen: die Stufe aus dem Dialog
 * kommt in der Einstellungsdatei an, Huelle und Werkzeug sind gezoomt, und
 * das Werkzeug rueckt mit Titelleiste und Schiene, statt unter ihnen zu
 * liegen. Ein spaeter geoeffnetes Werkzeug bekommt dieselbe Groesse.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-groesse.cjs --no-sandbox
 * Mit BILD=<pfad.png> wird die vergroesserte Oberflaeche abgelichtet.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'groesse-smoke-'));
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

const einstellungen = () => {
  try {
    return JSON.parse(fs.readFileSync(path.join(userData, 'einstellungen.json'), 'utf8'));
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
  const huelle = fenster.contentView.children[0];
  const js = (a) => huelle.webContents.executeJavaScript(a);
  const konsole = [];
  huelle.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  const oeffne = async (name) => {
    await js(`(() => { const k=[...document.querySelectorAll('.kachel:not(:disabled)')]
      .find(x => ${JSON.stringify(name)} === x.querySelector('.kachel__name, h3, strong')?.textContent?.trim() || new RegExp(${JSON.stringify(name)}).test(x.textContent));
      if(!k) return false; k.click(); return true; })()`);
    await warte(4000);
  };
  const ansicht = (teil) => fenster.contentView.children.find((v) => v.webContents.getURL().includes(teil));

  // --- Ein Werkzeug laeuft, dann wird die Groesse im Dialog gewaehlt -------
  await oeffne('Dice');
  const wuerfel = ansicht('/apps/dice/');
  pruefe(Boolean(wuerfel), 'der Wuerfel kommt hoch');
  if (!wuerfel) {
    app.exit(1);
    return;
  }
  const vorher = wuerfel.getBounds();
  pruefe(vorher.x === 56 && vorher.y === 40, `bei 100 % liegt es unter Titelleiste und neben Schiene (${vorher.x}/${vorher.y})`);

  await js(`[...document.querySelectorAll('.titelleiste__knopf')].find(b => /Settings|Einstellungen/.test(b.textContent)).click(); true`);
  await warte(800);
  const stufen = await js("[...document.querySelectorAll('[data-groesse]')].map(b => b.dataset.groesse).join(',')");
  pruefe(stufen === '80,90,100,110,125,150,175,200', `der Dialog bietet die Stufen an (${stufen})`);
  await js(`document.querySelector('[data-groesse="150"]').click(); true`);
  await warte(1200);

  pruefe(einstellungen()?.groesse === 150, `die Stufe steht in der Datei (${einstellungen()?.groesse})`);
  pruefe(
    (await js("document.querySelector('[data-groesse=\"150\"]').getAttribute('aria-pressed')")) === 'true',
    'und ist im Dialog gewaehlt'
  );
  pruefe(Math.abs(huelle.webContents.getZoomFactor() - 1.5) < 0.001, `die Huelle ist vergroessert (${huelle.webContents.getZoomFactor()})`);
  pruefe(Math.abs(wuerfel.webContents.getZoomFactor() - 1.5) < 0.001, `das Werkzeug auch (${wuerfel.webContents.getZoomFactor()})`);

  // Dialog zu, damit das Werkzeug wieder vorn steht.
  await js("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true");
  await warte(800);
  const nachher = wuerfel.getBounds();
  pruefe(nachher.x === 84 && nachher.y === 60, `es rueckt mit Titelleiste und Schiene (${nachher.x}/${nachher.y})`);
  const titel = await js("Math.round(document.querySelector('.titelleiste').getBoundingClientRect().height * window.devicePixelRatio / (window.devicePixelRatio / 1.5))");
  pruefe(titel === 60, `die Titelleiste ist im Fenster so hoch, wie das Werkzeug frei laesst (${titel})`);
  if (process.env.BILD) {
    const bild = await huelle.webContents.capturePage();
    fs.writeFileSync(process.env.BILD, bild.toPNG());
  }

  // --- Ein spaeter geoeffnetes Werkzeug bekommt dieselbe Groesse ------------
  await js("document.querySelector('.schiene__heim').click(); true");
  await warte(800);
  await oeffne('Loot');
  const loot = ansicht('/apps/loot/');
  pruefe(Boolean(loot) && Math.abs(loot.webContents.getZoomFactor() - 1.5) < 0.001, `ein neu geoeffnetes Werkzeug ist ebenso gross (${loot?.webContents.getZoomFactor()})`);

  // --- Zurueck auf 100 % --------------------------------------------------
  await js("window.shell.einstellungen.schreiben({ groesse: 100 })");
  await warte(800);
  pruefe(Math.abs(huelle.webContents.getZoomFactor() - 1) < 0.001, 'zurueck auf 100 % ist alles wie vorher');
  const zurueck = (loot ?? wuerfel).getBounds();
  pruefe(zurueck.x === 56 && zurueck.y === 40, `und das Werkzeug liegt wieder an der alten Kante (${zurueck.x}/${zurueck.y})`);

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nGroesse der Oberflaeche bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
