/**
 * Rauchtest: „Zuletzt geoeffnet" im Teilen-Dialog mit Notizen aus dem Story
 * Creator.
 *
 * Der Story Creator meldet als Ort nur die Notiz-ID, die Eintraege tragen
 * aber „kampagne/notiz" als Kennung. Geprueft wird, dass die Zuordnung
 * trotzdem greift: zwei Notizen nacheinander oeffnen, dann stehen beide
 * oben in „Zuletzt geoeffnet", die zuletzt geoeffnete zuerst.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-zuletzt-story.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zuletzt-story-'));
const userData = path.join(tmp, 'userData');
fs.mkdirSync(userData, { recursive: true });
fs.writeFileSync(
  path.join(userData, 'einstellungen.json'),
  JSON.stringify({ language: 'en', einfuehrungGesehen: ['suite', 'backstory', 'monster', 'zustaende'] })
);
// Ein Monster und ein Zustand in ihren Sammlungen: auch sie melden, was offen ist.
fs.mkdirSync(path.join(userData, 'monster', 'monster'), { recursive: true });
fs.writeFileSync(
  path.join(userData, 'monster', 'monster', 'ghul.md'),
  '---\nid: ghul\nname: Ghul\ncr: "1"\nthema: untot\nrolle: brute\n---\n# Ghul\n\nKlauen, die laehmen.\n'
);
fs.mkdirSync(path.join(userData, 'zustaende', 'zustaende'), { recursive: true });
fs.writeFileSync(
  path.join(userData, 'zustaende', 'zustaende', 'fluch.md'),
  '---\nid: fluch\nname: Fluch\nhaerte: ernst\nstufen: 2\nzeichen: "✦"\nfarbe: "#aa55ff"\ngeaendert: 2026-01-01\nschemaVersion: 1\n---\n# Fluch\n'
);
app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

setTimeout(() => {
  console.log('\nABBRUCH: Zeitwaechter nach 120s');
  app.exit(2);
}, 120000);

app.whenReady().then(async () => {
  await warte(4500);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 800 });
  const huelle = fenster.contentView.children[0];
  const hjs = (a) => huelle.webContents.executeJavaScript(a);
  const sicht = (id) => fenster.contentView.children.find((v) => v.webContents.getURL().includes(`/apps/${id}/`));

  await hjs(`document.querySelector('[data-app="backstory"]').click(); true`);
  await warte(5000);
  const bs = sicht('backstory');
  pruefe(Boolean(bs), 'der Story Creator kommt hoch');
  if (!bs) return app.exit(1);
  const bjs = (a) => bs.webContents.executeJavaScript(a);

  // Kampagne und zwei Notizen ueber die Bruecke, dann neu laden, damit die
  // Oberflaeche sie wie beim normalen Start vorfindet.
  const ids = await bjs(`(async () => {
    const aus = (a) => (a && 'value' in a ? a.value : a);
    const k = aus(await window.api.campaigns.create('Testrunde'));
    const a = aus(await window.api.notes.create(k.id, 'character', 'Aldric'));
    const b = aus(await window.api.notes.create(k.id, 'location', 'Rabenfels'));
    return { k: k.id, a: a.id, b: b.id };
  })()`);
  pruefe(Boolean(ids && ids.a && ids.b), `Kampagne und zwei Notizen angelegt (${JSON.stringify(ids)})`);
  bs.webContents.reload();
  await warte(4000);

  const klicke = (titel) =>
    bjs(`(() => {
      const knopf = [...document.querySelectorAll('.note-list button')].find((b) => b.querySelector('.note-list__title')?.textContent.trim() === ${JSON.stringify(titel)});
      if (!knopf) return false;
      knopf.click();
      return true;
    })()`);
  pruefe(await klicke('Aldric'), 'Aldric in der Liste angeklickt');
  await warte(1200);
  pruefe(await klicke('Rabenfels'), 'Rabenfels in der Liste angeklickt');
  await warte(1200);

  // Ein Monster aus der Sammlung oeffnen, dann einen Zustand.
  const oeffneAusSammlung = async (id, kachel) => {
    await hjs(`document.querySelector('[data-schiene="${id}"]').click(); true`);
    await warte(4500);
    const v = sicht(id);
    if (!v) return false;
    const vjs = (a) => v.webContents.executeJavaScript(a);
    await vjs("[...document.querySelectorAll('.reiter__knopf')].find(b => /Collection|Sammlung|Library/i.test(b.textContent))?.click(); true");
    await warte(800);
    const ok = await vjs(`(() => { const k = document.querySelector('${kachel}'); if (!k) return false; k.click(); return true; })()`);
    await warte(800);
    return ok;
  };
  pruefe(await oeffneAusSammlung('monster', '.monsterkachel'), 'ein Monster aus der Sammlung geoeffnet');
  pruefe(await oeffneAusSammlung('zustaende', '.zustandskachel'), 'einen Zustand aus der Sammlung geoeffnet');

  await hjs(`document.querySelector('[data-teilen-knopf]').click(); true`);
  await warte(1000);
  await hjs(`document.querySelector('[data-richtung="datei"]').click(); true`);
  await warte(800);
  const gruppen = await hjs("[...document.querySelectorAll('[data-austausch=\"geben\"] [data-gruppe]')].map(g => g.dataset.gruppe)");
  const zuletzt = await hjs("[...document.querySelectorAll('[data-gruppe=\"~zuletzt\"] [data-teilen]')].map(e => e.dataset.teilen)");
  pruefe(gruppen[0] === '~zuletzt', `„Zuletzt geoeffnet" steht ganz oben (${gruppen.slice(0, 3).join(', ')})`);
  pruefe(
    zuletzt[0] === 'zustaende/fluch' &&
      zuletzt[1] === 'monster/ghul' &&
      zuletzt[2] === `backstory/${ids.k}/${ids.b}` &&
      zuletzt[3] === `backstory/${ids.k}/${ids.a}`,
    `Zustand, Monster und beide Notizen, das zuletzt geoeffnete zuerst (${zuletzt.join(', ')})`
  );

  console.log(fehler.length === 0 ? '\nZuletzt geoeffnet bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
