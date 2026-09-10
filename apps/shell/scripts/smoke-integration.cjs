/**
 * Integration: alle vier Werkzeuge in einer Sitzung, mit Wechseln dazwischen.
 * Gesucht sind die typischen Probleme: doppelt angemeldete IPC-Kanaele,
 * geteilte Sitzungen, verlorener Zustand beim Wechsel, Einstellungen die
 * einander ueberschreiben.
 *
 * Die anderen Rauchtests sehen je ein Werkzeug allein. Dieser sieht sie
 * zusammen — und nur dort fallen doppelte Kanaele, gemeinsame Sitzungen und
 * verlorener Zustand auf.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-integration.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path'); const fs = require('node:fs'); const os = require('node:os');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'integ-'));
app.setPath('userData', path.join(tmp, 'userData'));
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));
const sag = (t) => console.log(t);
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => { sag(`  ${b ? 'ok  ' : 'FEHL'} ${t}`); if (!b) fehler.push(t); };

// Nichts darf haengen: ein blockierter Renderer wuerde den Lauf sonst
// stillstehen lassen, ohne dass man den Grund saehe.
const mitFrist = (versprechen, was) =>
  Promise.race([
    // Auch eine Ablehnung muss ein Wert werden: eine unbehandelte Ablehnung
    // liess den Lauf frueher wortlos stehenbleiben, bis der Zeitwaechter kam.
    Promise.resolve(versprechen).catch((f) => `((Fehler in ${was}: ${String(f).slice(0, 120)}))`),
    warte(8000).then(() => `((keine Antwort: ${was}))`)
  ]);

// Ein Zeitwaechter, damit ein Haenger als Fehlschlag endet statt die CI
// blockieren zu lassen.
setTimeout(() => {
  sag('\nABBRUCH: Zeitwaechter nach 180s');
  app.exit(2);
}, 180000);

app.whenReady().then(async () => {
  await warte(5000);
  const f = BaseWindow.getAllWindows()[0];
  if (!f) { sag('kein Fenster'); app.exit(1); return; }
  f.setBounds({ x: 0, y: 0, width: 1320, height: 820 });
  await warte(1200);
  const menue = f.contentView.children[0];
  const mjs = (a) => mitFrist(menue.webContents.executeJavaScript(a), 'Huelle');
  const konsole = [];
  const gesehen = new WeakSet();
  const lausche = (wc, wo) => {
    if (gesehen.has(wc)) return;
    gesehen.add(wc);
    wc.on('console-message', (_e, l, t) => { if (l >= 2) konsole.push(`${wo}: ${t.slice(0, 140)}`); });
  };
  lausche(menue.webContents, 'huelle');

  const NAMEN = { backstory: 0, mapmaker: 1, initiative: 2, dice: 3 };

  /**
   * Die Ansicht eines Werkzeugs ueber ihre Adresse suchen.
   *
   * Nicht `children[1]`: die Huelle laesst geoeffnete Werkzeuge haengen,
   * damit ihr Zustand den Wechsel ueberlebt. Sobald zwei offen sind, zeigt
   * children[1] auf irgendeines von beiden — der Test lief dann gegen die
   * falsche Anwendung, fand ihre Elemente nicht und blieb an der Ablehnung
   * haengen.
   */
  const ansichtVon = (id) =>
    f.contentView.children.find((v) => v.webContents.getURL().includes(`/apps/${id}/`)) ?? null;
  const oeffne = async (id, wartezeit = 4500) => {
    const ok = await mjs(`(() => { const k = [...document.querySelectorAll('.kachel:not(:disabled)')][${NAMEN[id]}];
      if (!k) return false; k.click(); return true; })()`);
    if (ok !== true) { sag(`  (Kachel ${id} nicht anklickbar: ${ok})`); return null; }
    await warte(wartezeit);
    const sicht = ansichtVon(id);
    if (sicht) lausche(sicht.webContents, id);
    return sicht;
  };
  const heim = async () => {
    await mjs("(() => { const k = document.querySelector('.schiene__heim'); if (k) k.click(); return true; })()");
    await warte(1000);
  };

  sag('== Reihum oeffnen ==');
  for (const id of Object.keys(NAMEN)) {
    const s = await oeffne(id);
    const steht = s ? await mitFrist(s.webContents.executeJavaScript('document.body.innerText.length > 0'), id) : false;
    pruefe(steht === true, `${id} kommt hoch`);
    await heim();
  }

  sag('\n== Wuerfel: Zustand ueberlebt den Wechsel ==');
  let d = await oeffne('dice');
  if (!d) { sag('Wuerfel liess sich nicht oeffnen'); app.exit(1); return; }
  const djs = (a) => mitFrist(d.webContents.executeJavaScript(a), 'dice');
  const SETZ = `const setz=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};`;
  await djs(`(() => { ${SETZ} setz([...document.querySelectorAll('.artfeld__zahl')][5],'3');
    setz(document.querySelector('.aussehen__farbe input'),'#e0af68');
    [...document.querySelectorAll('.musterknopf')][2].click(); return true; })()`);
  await warte(500);
  await djs(`(() => { [...document.querySelectorAll('button')].find(b=>/Roll|Rollen/.test(b.textContent)).click(); return true; })()`);
  await warte(1000);
  const vorher = await djs("document.querySelector('.buehne__ausdruck').textContent");

  await heim();
  const t = await oeffne('initiative');
  pruefe(Boolean(t), 'der Tracker kommt dazwischen hoch');
  await heim();
  d = await oeffne('dice', 1500);
  const nachher = await djs("document.querySelector('.buehne__ausdruck').textContent");
  const farbe = await djs("document.querySelector('.aussehen__farbe input').value");
  const verlauf = await djs("document.querySelectorAll('.verlauf__liste li').length");
  pruefe(nachher === vorher, `die Auswahl ueberlebt den Wechsel (${vorher} -> ${nachher})`);
  pruefe(farbe === '#e0af68', `die Farbe ueberlebt den Wechsel (${farbe})`);
  pruefe(verlauf >= 1, `der Verlauf ueberlebt den Wechsel (${verlauf})`);

  sag('\n== Getrennte Ablagen ==');
  for (const u of ['dice', 'initiative', 'backstory']) {
    let inhalt; try { inhalt = fs.readdirSync(path.join(tmp, 'userData', u)).sort().join(','); } catch { inhalt = '(fehlt)'; }
    sag(`  ${u}/: ${inhalt}`);
  }
  const datei = path.join(tmp, 'userData', 'dice', 'einstellungen.json');
  const dEin = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, 'utf8')) : {};
  pruefe(dEin.farbe === '#e0af68', `der Wuerfel schreibt in seine eigene Datei (${dEin.farbe})`);

  sag('\n== Schnelles Hin und Her ==');
  for (let i = 0; i < 4; i++) {
    await heim();
    await mjs("(() => { const k=[...document.querySelectorAll('.kachel:not(:disabled)')]; k[3] && k[3].click(); return true; })()");
    await warte(220);
    await mjs("(() => { const k=document.querySelector('.schiene__heim'); if (k) k.click(); return true; })()");
    await warte(220);
    await mjs("(() => { const k=[...document.querySelectorAll('.kachel:not(:disabled)')]; k[2] && k[2].click(); return true; })()");
    await warte(220);
  }
  await warte(3500);
  const lebt = ansichtVon('initiative') ?? ansichtVon('dice');
  pruefe(Boolean(lebt), 'nach schnellem Wechseln steht noch ein Werkzeug');
  const stoerung = await mjs("Boolean(document.querySelector('.stoerung'))");
  pruefe(stoerung === false, `und keine Stoerungsflaeche (${stoerung})`);
  if (lebt) {
    const inhalt = await mitFrist(lebt.webContents.executeJavaScript('document.body.innerText.length > 0'), 'zuletzt');
    pruefe(inhalt === true, 'und es ist bedienbar');
  }

  sag('\nKonsolenfehler: ' + (konsole.length ? konsole.join(' | ') : 'keine'));
  pruefe(konsole.length === 0, 'keine Konsolenfehler');
  sag(fehler.length ? `\n${fehler.length} Pruefung(en) fehlgeschlagen:\n  - ${fehler.join('\n  - ')}` : '\nIntegration bestanden.');
  app.exit(fehler.length ? 1 : 0);
});
