/**
 * Ein Bild der Oberflaeche des Status Effect Creators.
 *
 * Kein Test, nur ein Schnappschuss: Huelle starten, den Status Effect
 * Creator oeffnen, einen Zustand auf „gefaehrlich" mit fuenf Stufen
 * wuerfeln und die Ansicht als PNG ablegen.
 *
 * Das Ziel kommt aus BILD_ZIEL und ist PFLICHT. Ohne die Variable schreibt
 * das Skript nach `undefined`, der Fehler landet in einem async-Handler,
 * und der Prozess haengt statt abzubrechen — deshalb der Abbruch oben.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zustaende-bild-'));
app.setPath('userData', path.join(tmp, 'userData'));
process.env.TTRPG_TOOLS_START_APP = 'zustaende';
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const ziel = process.env.BILD_ZIEL;
if (!ziel) {
  console.error('BILD_ZIEL fehlt: BILD_ZIEL=/pfad/zum/bild.png electron scripts/bild-zustaende.cjs');
  process.exit(2);
}

app.whenReady().then(async () => {
  await warte(5000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1400, height: 1000 });
  await warte(1200);

  const sicht = fenster.contentView.children.find((a) =>
    a.webContents.getURL().includes('/apps/zustaende/')
  );
  if (!sicht) {
    console.log('keine Ansicht');
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);

  // Fuenf Stufen und „gefaehrlich" — damit Blatt und Waage etwas zu zeigen haben.
  await js(`(() => {
    const felder = [...document.querySelectorAll('.regler select')];
    const setzer = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    const setze = (feld, wert) => {
      setzer.call(feld, wert);
      feld.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setze(felder[1], 'kaelte');
    setze(felder[3], 'gefaehrlich');
    setze(felder[4], '5');
    return true;
  })()`);
  await warte(300);

  // So lange wuerfeln, bis ein Zustand mit Ausloeser herauskommt — der zeigt
  // am meisten.
  for (let versuch = 0; versuch < 25; versuch += 1) {
    await js("[...document.querySelectorAll('.knopf')].find(k => /Roll|Würfeln/.test(k.textContent)).click(); true");
    await warte(250);
    const reich = await js(
      "document.querySelectorAll('.blatt__zeile').length >= 4 && document.querySelectorAll('.blatt__stufen li').length === 5"
    );
    if (reich) break;
  }

  const bild = await sicht.webContents.capturePage();
  fs.writeFileSync(ziel, bild.toPNG());
  console.log('geschrieben:', ziel);
  app.exit(0);
});
