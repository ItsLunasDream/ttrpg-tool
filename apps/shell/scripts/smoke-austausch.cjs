/**
 * Rauchtest: Austausch, Stufe 1 (docs/austausch.md).
 *
 * Der ganze Weg ohne Netz: Eintraege aus drei Werkzeugen als Paket
 * schnueren, das Paket lesen, Konflikte erkennen, daneben legen und
 * uebernehmen. Die Werkzeuge sind dabei ZU — angenommen wird trotzdem.
 * Dazu der Dialog „Teilen" mit seiner Liste.
 *
 * Die Dateidialoge lassen sich hier nicht bedienen; die Kanaele nehmen
 * deshalb einen Pfad.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-austausch.cjs --no-sandbox
 * Mit BILD=<pfad.png> wird der Dialog abgelichtet.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'austausch-smoke-'));
const userData = path.join(tmp, 'userData');

// --- Ein kleiner Bestand, direkt auf der Platte ---------------------------
const monsterOrdner = path.join(userData, 'monster', 'monster');
fs.mkdirSync(monsterOrdner, { recursive: true });
fs.writeFileSync(
  path.join(monsterOrdner, 'ghul.md'),
  '---\nid: ghul\nname: Ghul\ncr: "1"\nthema: untot\nrolle: brute\n---\n# Ghul\n\nKlauen, die laehmen.\n'
);
const regelOrdner = path.join(userData, 'nachschlagewerk', 'hausregeln');
fs.mkdirSync(regelOrdner, { recursive: true });
fs.writeFileSync(
  path.join(regelOrdner, 'kritisch.md'),
  '---\nname: Kritische Treffer maximal\nbezug: regel/critical-hit\ngeaendert: 2026-09-23T08:00:00.000Z\n---\nSchaden maximiert.\n'
);
const kampagne = path.join(userData, 'backstory', 'vault', 'campaigns', 'kampagne-1');
fs.mkdirSync(path.join(kampagne, 'notes'), { recursive: true });
fs.mkdirSync(path.join(kampagne, 'assets'), { recursive: true });
fs.writeFileSync(path.join(kampagne, 'campaign.json'), JSON.stringify({ name: 'Sturmkueste' }));
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
fs.writeFileSync(path.join(kampagne, 'assets', 'karte.png'), png);
fs.writeFileSync(
  path.join(kampagne, 'notes', 'koenig-1.md'),
  '---\nid: koenig-1\nschemaVersion: 1\ntype: character\ntitle: Der König\n---\nHier seine Karte: ![](assets/karte.png)\n'
);

app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

app.whenReady().then(async () => {
  await warte(4000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 900 });
  const huelle = fenster.contentView.children[0];
  const js = (a) => huelle.webContents.executeJavaScript(a);
  const konsole = [];
  huelle.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // --- Was sich teilen laesst ---------------------------------------------
  const teilbar = await js('window.shell.austausch.teilbar()');
  const kennungen = teilbar.map((e) => `${e.werkzeug}/${e.kennung}`);
  pruefe(
    ['monster/ghul', 'nachschlagewerk/hausregel/kritisch', 'backstory/kampagne-1/koenig-1'].every((k) => kennungen.includes(k)),
    `Monster, Hausregel und Notiz lassen sich teilen (${teilbar.length})`
  );
  pruefe(kennungen.includes('nachschlagewerk/regel/critical-hit'), 'offizielle Regeln auch, als Verweis');
  pruefe(!kennungen.some((k) => k.startsWith('dice/')), 'Werkzeuge, die nicht mitmachen, fehlen');

  // --- Der Dialog ----------------------------------------------------------
  await js(`document.querySelector('[data-teilen-knopf]').click(); true`);
  await warte(1200);
  const zeilen = await js("document.querySelectorAll('[data-austausch=\"geben\"] [data-teilen]').length");
  pruefe(zeilen === 3, `der Dialog zeigt ohne Suchwort die drei eigenen Eintraege (${zeilen})`);
  await js(`document.querySelector('[data-teilen="monster/ghul"]').click(); true`);
  await warte(200);
  pruefe(
    /1/.test(await js("document.querySelector('.austausch__fuss span').textContent")),
    'eine Auswahl wird gezaehlt'
  );
  if (process.env.BILD) {
    const bild = await huelle.webContents.capturePage();
    fs.writeFileSync(process.env.BILD, bild.toPNG());
  }

  // --- Schnueren -----------------------------------------------------------
  const datei = path.join(tmp, 'paket.ttrpg.md');
  const auswahl = [
    { werkzeug: 'monster', kennung: 'ghul' },
    { werkzeug: 'nachschlagewerk', kennung: 'hausregel/kritisch' },
    { werkzeug: 'backstory', kennung: 'kampagne-1/koenig-1' },
    { werkzeug: 'nachschlagewerk', kennung: 'regel/critical-hit' }
  ];
  const gespeichert = await js(`window.shell.austausch.speichern(${JSON.stringify(auswahl)}, ${JSON.stringify(datei)})`);
  pruefe(gespeichert.ok && gespeichert.anzahl === 4, `vier Eintraege im Paket (${gespeichert.anzahl})`);
  const text = fs.readFileSync(datei, 'utf8');
  pruefe(/Klauen, die laehmen/.test(text) && /Schaden maximiert/.test(text), 'das Paket ist lesbares Markdown');
  pruefe(text.includes(png.toString('base64').slice(0, 40)), 'das Bild der Notiz reist mit');

  // --- Einlesen: alles gibt es schon --------------------------------------
  const geoeffnet = await js(`window.shell.austausch.oeffnen(${JSON.stringify(datei)})`);
  pruefe(geoeffnet.ok && geoeffnet.ankuenfte.length === 4, 'das Paket laesst sich einlesen');
  pruefe(geoeffnet.ziele?.backstory?.[0]?.id === 'kampagne-1', 'der Story Creator bietet seine Kampagne als Ziel an');
  const ziele = { backstory: 'kampagne-1' };
  const konflikte = await js(`window.shell.austausch.konflikte(${JSON.stringify(ziele)})`);
  pruefe(JSON.stringify(konflikte) === '[true,true,true,false]', `bekannte Eintraege werden erkannt (${JSON.stringify(konflikte)})`);

  const ergebnis = await js(
    `window.shell.austausch.annehmen([0,1,2,3].map((nummer) => ({ nummer, modus: 'daneben' })), ${JSON.stringify(ziele)})`
  );
  pruefe(ergebnis.every((e) => e.ok), `alles angenommen (${ergebnis.map((e) => e.grund ?? 'ok').join(', ')})`);
  pruefe(fs.existsSync(path.join(monsterOrdner, 'ghul-2.md')), 'das Monster liegt daneben, das alte bleibt');
  pruefe(/id: ghul-2/.test(fs.readFileSync(path.join(monsterOrdner, 'ghul-2.md'), 'utf8')), 'mit neuer Kennung im Kopf');
  pruefe(fs.existsSync(path.join(regelOrdner, 'kritisch-2.md')), 'die Hausregel ebenso');
  const notizen = fs.readdirSync(path.join(kampagne, 'notes'));
  pruefe(notizen.length === 2, `die Notiz liegt daneben (${notizen.join(', ')})`);
  const neu = notizen.find((n) => n !== 'koenig-1.md');
  const neuerText = neu ? fs.readFileSync(path.join(kampagne, 'notes', neu), 'utf8') : '';
  pruefe(/title: Der König \(2\)/.test(neuerText), 'mit eindeutigem Titel');
  const bildName = /\]\((assets\/[^)]+)\)/.exec(neuerText)?.[1];
  pruefe(
    Boolean(bildName) && bildName !== 'assets/karte.png' && fs.existsSync(path.join(kampagne, bildName)),
    `und eigenem Bild (${bildName})`
  );
  pruefe(ergebnis[3].kennung === 'regel/critical-hit', 'die offizielle Regel kommt als Verweis an, ohne zu schreiben');

  // --- Uebernehmen legt nichts daneben -------------------------------------
  const vorher = fs.readdirSync(monsterOrdner).length;
  await js(`window.shell.austausch.annehmen([{ nummer: 0, modus: 'uebernehmen' }], ${JSON.stringify(ziele)})`);
  pruefe(fs.readdirSync(monsterOrdner).length === vorher, 'Uebernehmen ersetzt, statt eine dritte Fassung anzulegen');

  // --- Eine kaputte Datei ---------------------------------------------------
  const kaputt = path.join(tmp, 'kaputt.ttrpg.md');
  fs.writeFileSync(kaputt, text.slice(0, text.indexOf('<!-- ttrpg:ende')));
  const abgelehnt = await js(`window.shell.austausch.oeffnen(${JSON.stringify(kaputt)})`);
  pruefe(!abgelehnt.ok && /bricht/.test(abgelehnt.grund ?? ''), `ein abgebrochenes Paket wird abgelehnt (${abgelehnt.grund})`);

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nAustausch bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
