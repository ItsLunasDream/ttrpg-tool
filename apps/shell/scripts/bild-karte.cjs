/**
 * Ein Bild vom Paket-Reiter und von der Karte zum Vorlesen.
 *
 * Kein Test, nur ein Schnappschuss: Huelle starten, Paket wuerfeln, Bild;
 * dann einen einzelnen Zustand als Karte oeffnen, zweites Bild.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'karte-bild-'));
app.setPath('userData', path.join(tmp, 'userData'));
process.env.TTRPG_TOOLS_START_APP = 'zustaende';
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const ziel = process.env.BILD_ZIEL;
const zielKarte = process.env.BILD_ZIEL_KARTE;

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

  // --- Paket ---
  await js("[...document.querySelectorAll('.reiter__knopf')].find(k => /Package|Paket/.test(k.textContent)).click(); true");
  await warte(400);
  await js(`(() => {
    const felder = [...document.querySelectorAll('.regler select')];
    const setzer = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    const setze = (feld, wert) => {
      setzer.call(feld, wert);
      feld.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setze(felder[0], 'kaelte');
    setze(felder[2], '3');
    return true;
  })()`);
  await warte(300);
  await js("[...document.querySelectorAll('.knopf')].find(k => /Roll a package|Paket würfeln/.test(k.textContent)).click(); true");
  await warte(700);
  fs.writeFileSync(ziel, (await sicht.webContents.capturePage()).toPNG());
  console.log('geschrieben:', ziel);

  // --- Karte ---
  await js(`(() => {
    const knopf = [...document.querySelectorAll('.paket__eintrag .knopf')].find((k) =>
      /own|Einzeln/.test(k.textContent)
    );
    if (knopf) knopf.click();
    return true;
  })()`);
  await warte(500);
  await js("[...document.querySelectorAll('.knopf')].find(k => /card|Karte/i.test(k.textContent)).click(); true");
  await warte(900);
  fs.writeFileSync(zielKarte, (await sicht.webContents.capturePage()).toPNG());
  console.log('geschrieben:', zielKarte);
  app.exit(0);
});
