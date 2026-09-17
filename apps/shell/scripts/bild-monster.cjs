/**
 * Ein Bild der Oberflaeche des Monster Creators.
 *
 * Kein Test, nur ein Schnappschuss: Huelle starten, Monster Creator oeffnen,
 * ein Monster auf Grad 12 mit legendaeren Aktionen wuerfeln und die Ansicht
 * als PNG ablegen.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'monster-bild-'));
app.setPath('userData', path.join(tmp, 'userData'));
process.env.TTRPG_TOOLS_START_APP = 'monster';
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const ziel = process.env.BILD_ZIEL;

app.whenReady().then(async () => {
  await warte(5000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1400, height: 1000 });
  await warte(1200);

  const sicht = fenster.contentView.children.find((a) =>
    a.webContents.getURL().includes('/apps/monster/')
  );
  if (!sicht) {
    console.log('keine Ansicht');
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);

  // Grad 12, legendaer an — damit alle Abschnitte im Block vorkommen.
  await js(`(() => {
    const feld = document.querySelector('.regler select');
    const setzer = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    setzer.call(feld, '12');
    feld.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('.regler__kaestchen input').click();
    return true;
  })()`);
  await warte(300);

  // So lange wuerfeln, bis ein Block mit Flaechenangriff und Resistenzen
  // herauskommt — der zeigt am meisten von dem, was neu ist.
  for (let versuch = 0; versuch < 25; versuch += 1) {
    await js("[...document.querySelectorAll('.knopf')].find(k => /Roll|Würfeln/.test(k.textContent)).click(); true");
    await warte(250);
    const reich = await js(`(() => {
      const text = document.querySelector('.statblock')?.textContent ?? '';
      const zeilen = document.querySelectorAll('.statblock__zeile').length;
      return /saving throw|Rettungswurf/.test(text) && zeilen >= 4;
    })()`);
    if (reich) break;
  }

  const bild = await sicht.webContents.capturePage();
  fs.writeFileSync(ziel, bild.toPNG());
  console.log('geschrieben:', ziel);
  app.exit(0);
});
