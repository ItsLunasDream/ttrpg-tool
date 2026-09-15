/**
 * Rauchtest der Inspirationshilfe — in der Huelle, an der laufenden Anwendung.
 *
 * Die Modelltests unter apps/inspiration/tests pruefen die Tabellen und den
 * Erzeuger: dass zweihundert Aufhaenger zweihundert verschiedene sind, dass
 * ein festgehaltener Baustein stehen bleibt, dass die Notizen aufeinander
 * verweisen. Was sie nicht sehen koennen, ist, ob ein Klick ankommt, ob die
 * Einbettung haelt und ob am Ende wirklich Dateien auf der Platte liegen.
 *
 * Beides in einem Lauf, weil der Export ohne Backstory Creator nur die
 * halbe Wahrheit ist: erst mit Kampagne zeigt sich, ob zwoelf Notizen
 * durchgehen, ob sie in derselben Kampagne landen und ob die Verweise
 * stimmen.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-inspiration.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inspiration-smoke-'));
app.setPath('userData', path.join(tmp, 'userData'));
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

app.whenReady().then(async () => {
  await warte(4500);
  const f = BaseWindow.getAllWindows()[0];
  f.setBounds({ x: 0, y: 0, width: 1320, height: 860 });
  await warte(800);
  const menue = f.contentView.children[0];
  const mjs = (a) => menue.webContents.executeJavaScript(a);
  const sicht = (id) => f.contentView.children.find((v) => v.webContents.getURL().includes(`/apps/${id}/`));

  // --- Backstory oeffnen und eine Kampagne anlegen -------------------------
  await mjs("[...document.querySelectorAll('.kachel:not(:disabled)')][0].click(); true");
  await warte(5000);
  const bs = sicht('backstory');
  pruefe(Boolean(bs), 'der Backstory Creator kommt hoch');
  if (!bs) { app.exit(1); return; }
  const bjs = (a) => bs.webContents.executeJavaScript(a);

  const kampagnen = await bjs(`(async () => {
    const auspacken = (antwort) => (antwort && 'value' in antwort ? antwort.value : antwort);
    const liste = auspacken(await window.api.campaigns.list()) ?? [];
    if (liste.length > 0) return liste.map((k) => k.name);
    const neu = auspacken(await window.api.campaigns.create('Testrunde'));
    return [neu.name]; })()`);
  pruefe(Array.isArray(kampagnen) && kampagnen.length > 0, `eine Kampagne steht bereit (${kampagnen})`);
  bs.webContents.reload();
  await warte(4000);

  // --- Zur Inspirationshilfe wechseln -------------------------------------
  await mjs("document.querySelector('.schiene__heim').click(); true");
  await warte(900);
  const kachel = await mjs(`(() => { const k=[...document.querySelectorAll('.kachel:not(:disabled)')]
    .find(x => /Inspiration/.test(x.textContent)); if(!k) return false; k.click(); return true; })()`);
  pruefe(kachel === true, 'die Kachel der Inspirationshilfe ist da');
  await warte(4000);
  const ins = sicht('inspiration');
  pruefe(Boolean(ins), 'sie kommt hoch');
  if (!ins) { app.exit(1); return; }
  const js = (a) => ins.webContents.executeJavaScript(a);
  const konsole = [];
  ins.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  pruefe(await js("Boolean(document.querySelector('.regler-leiste'))"), 'die vier Regler stehen');
  pruefe(await js("typeof window.inspiration === 'object'"), 'die Bruecke zum Hauptprozess ist da');
  pruefe(
    (await js("document.querySelectorAll('.karte').length")) === 0,
    'vor dem ersten Wurf steht noch kein Baustein da'
  );

  // --- Alles wuerfeln ------------------------------------------------------
  const wuerfeln =
    "[...document.querySelectorAll('button')].find(b => /Alles würfeln|Roll everything/.test(b.textContent))";
  pruefe(await js(`Boolean(${wuerfeln})`), 'der Wuerfelknopf ist da');
  await js(`${wuerfeln}.click(); true`);
  await warte(400);
  pruefe(
    (await js("document.querySelectorAll('.karte').length")) === 6,
    'ein Klick fuellt alle sechs Bausteine'
  );
  const zeitstrahl = await js("document.querySelectorAll('.zeitstrahl li').length");
  pruefe(zeitstrahl === 4, `der Zeitstrahl hat vier Stufen fuer einen Bogen (${zeitstrahl})`);

  // --- Das Schloss ---------------------------------------------------------
  /*
   * Die wichtigste Pruefung der Bedienung, wie im NPC Creator: ohne das
   * Festhalten wuerfelt man den guten Aufhaenger weg, waehrend man die
   * Fraktionen sucht.
   */
  const ersterSatz = () => js("document.querySelector('.karte .zeile span').textContent");
  const vorher = await ersterSatz();
  await js(`(() => { const k=[...document.querySelectorAll('.karte')][0]
    .querySelector('.karte__knoepfe button'); k.click(); return true; })()`);
  await warte(200);
  pruefe(
    await js("[...document.querySelectorAll('.karte')][0].querySelector('.karte__knoepfe button').getAttribute('aria-pressed') === 'true'"),
    'der Aufhaenger laesst sich festhalten'
  );
  let gleich = true;
  for (let versuch = 0; versuch < 8; versuch += 1) {
    await js(`${wuerfeln}.click(); true`);
    await warte(140);
    if ((await ersterSatz()) !== vorher) gleich = false;
  }
  pruefe(gleich, 'und bleibt ueber acht Wuerfe stehen');

  // Der Knopf AM Baustein wuerfelt ihn trotzdem neu — er meint genau ihn.
  let geaendert = false;
  for (let versuch = 0; versuch < 12 && !geaendert; versuch += 1) {
    await js(`(() => { const k=[...document.querySelectorAll('.karte')][0]
      .querySelectorAll('.karte__knoepfe button')[1]; k.click(); return true; })()`);
    await warte(140);
    if ((await ersterSatz()) !== vorher) geaendert = true;
  }
  pruefe(geaendert, 'sein eigener Knopf wuerfelt ihn trotz Schloss neu');

  // --- Eine einzelne Zeile -------------------------------------------------
  const zweiter = await js("[...document.querySelectorAll('.karte .zeile span')][1].textContent");
  let zeileNeu = false;
  for (let versuch = 0; versuch < 12 && !zeileNeu; versuch += 1) {
    await js("[...document.querySelectorAll('.karte .zeile__knopf')][1].click(); true");
    await warte(120);
    const jetzt = await js("[...document.querySelectorAll('.karte .zeile span')][1].textContent");
    if (jetzt !== zweiter) zeileNeu = true;
  }
  pruefe(zeileNeu, 'eine einzelne Zeile laesst sich neu wuerfeln');
  pruefe(
    (await ersterSatz()) !== zweiter,
    'ohne die Nachbarzeile mitzunehmen'
  );

  // --- Der Umfang schlaegt durch ------------------------------------------
  await js(`(() => { const s=document.querySelector('select');
    const setz=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;
    setz.call(s, 'kampagne'); s.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
  await warte(200);
  await js(`${wuerfeln}.click(); true`);
  await warte(300);
  const figuren = await js("[...document.querySelectorAll('.karte')][2].querySelectorAll('.block').length");
  pruefe(figuren === 7, `eine Kampagne bringt sieben Figuren (${figuren})`);

  // --- Uebernehmen ---------------------------------------------------------
  const namen = await js(`[...[...document.querySelectorAll('.karte')][2].querySelectorAll('.block__titel')]
    .map(e => e.childNodes[0].textContent.trim())`);
  await js(`(() => { const e=document.querySelector('.fuss__titel input');
    const setz=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    setz.call(e, 'Der lange Winter');
    e.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
  await warte(200);
  await js("[...document.querySelectorAll('button')].find(b=>/Backstory/.test(b.textContent)).click(); true");
  await warte(2500);
  const meldung = await js("document.querySelector('.fuss__meldung')?.textContent ?? ''");
  pruefe(
    /\d+/.test(meldung) && !(await js("Boolean(document.querySelector('.fuss__meldung--fehler'))")),
    `der Export meldet Vollzug (${meldung || 'nichts'})`
  );

  // --- Liegen die Notizen wirklich? ---------------------------------------
  const vault = path.join(tmp, 'userData', 'backstory', 'vault');
  const dateien = [];
  const suche = (ordner) => {
    for (const e of fs.readdirSync(ordner, { withFileTypes: true })) {
      const p = path.join(ordner, e.name);
      // `history` auslassen. Der Backstory Creator legt dort zu jeder Notiz
      // eine Fassung ab — beim Anlegen also eine mit dem Titel und noch
      // leerem Rumpf. Beim ersten Anlauf zaehlte dieser Test deshalb 34 statt
      // 17 Notizen und verglich die Verweise gegen die leere Erstfassung.
      if (e.isDirectory()) { if (e.name !== 'history') suche(p); }
      else if (e.name.endsWith('.md')) dateien.push(p);
    }
  };
  try { suche(vault); } catch (e) { console.log('  (kein Vault:', e.message, ')'); }
  const texte = dateien.map((p) => fs.readFileSync(p, 'utf8'));
  // Uebersicht + 4 Fraktionen + 7 Figuren + 5 Orte = 17.
  pruefe(dateien.length === 17, `siebzehn Notizen liegen auf der Platte (${dateien.length})`);

  const uebersicht = texte.find((t) => t.includes('Der lange Winter'));
  pruefe(Boolean(uebersicht), 'die Uebersichtsnotiz ist dabei');
  const fehlendeVerweise = namen.filter((name) => !(uebersicht ?? '').includes(`[[${name}]]`));
  pruefe(
    fehlendeVerweise.length === 0,
    `sie verweist auf jede Figur (fehlt: ${fehlendeVerweise.join(', ') || 'nichts'})`
  );
  const mitVerbindung = texte.filter((t) => /\*\*[^*]+:\*\* .*\[\[/.test(t)).length;
  pruefe(mitVerbindung >= 7, `die Figurennotizen tragen ihre Verbindungen (${mitVerbindung})`);

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' | ') || 'keine'})`);

  console.log(
    fehler.length ? `\n${fehler.length} Pruefung(en) fehlgeschlagen.` : '\nInspirationshilfe bestanden.'
  );
  app.exit(fehler.length ? 1 : 0);
});
