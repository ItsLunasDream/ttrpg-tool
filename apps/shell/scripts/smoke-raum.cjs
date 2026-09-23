/**
 * Rauchtest: der Raum im lokalen Netz (docs/austausch.md, Stufe 2).
 *
 * Die App eroeffnet den Raum ueber ihre Oberflaeche. Ein Gast, von Hand
 * gebaut aus dem Protokoll (eine JSON-Zeile je Nachricht), tritt ueber
 * 127.0.0.1 bei. Geprueft: Name, Passwort, Chat an alle, Direktnachricht,
 * ein Paket vom Gast, das in der App angenommen wird, eins von der App an
 * genau den Gast, und der Zaehler am Knopf bei geschlossenem Dialog.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-raum.cjs --no-sandbox
 * Mit BILD=<pfad.png> wird der Chat abgelichtet.
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const net = require('node:net');
const { createHmac } = require('node:crypto');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'raum-smoke-'));
const userData = path.join(tmp, 'userData');
const monsterOrdner = path.join(userData, 'monster', 'monster');
fs.mkdirSync(monsterOrdner, { recursive: true });
fs.writeFileSync(path.join(monsterOrdner, 'ork.md'), '---\nid: ork\nname: Ork\ncr: "1"\n---\n# Ork\n');
// Ein Gegenstand aus dem Magic Item Creator: auch er laesst sich teilen.
const gegenstandOrdner = path.join(userData, 'magicitems', 'gegenstaende');
fs.mkdirSync(gegenstandOrdner, { recursive: true });
fs.writeFileSync(
  path.join(gegenstandOrdner, 'klinge.md'),
  '---\nname: Klinge\nart: waffe\nseltenheit: rare\neinstimmung: nein\nwert: 4000\ngeaendert: 2026-01-01\n---\n## Wirkungen\n\n- Glaenzt.\n'
);
fs.writeFileSync(path.join(userData, 'einstellungen.json'), JSON.stringify({ language: 'en', einfuehrungGesehen: ['suite', 'dice'] }));
app.setPath('userData', userData);
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};
async function bis(bedingung, ms = 4000) {
  const ende = Date.now() + ms;
  while (!(await bedingung())) {
    if (Date.now() > ende) return false;
    await warte(50);
  }
  return true;
}

/** Ein Gast aus dem Protokoll, ohne die App. */
function gast(port, passwort, name) {
  const s = net.connect({ host: '127.0.0.1', port });
  s.setEncoding('utf8');
  const nachrichten = [];
  let rest = '';
  s.on('data', (stueck) => {
    rest += stueck;
    const teile = rest.split('\n');
    rest = teile.pop();
    for (const t of teile) if (t.trim()) nachrichten.push(JSON.parse(t));
    for (const n of nachrichten.splice(0)) {
      gastobj.alle.push(n);
      if (n.typ === 'herausforderung') {
        const nachweis = passwort ? createHmac('sha256', passwort).update(n.nonce).digest('hex') : '';
        s.write(`${JSON.stringify({ typ: 'hallo', name, nachweis, version: 1 })}\n`);
      }
      if (n.typ === 'willkommen') gastobj.ich = n.du;
    }
  });
  s.on('error', () => undefined);
  s.on('close', () => {
    gastobj.getrennt = true;
  });
  const gastobj = { alle: [], ich: null, getrennt: false, schreibe: (n) => s.write(`${JSON.stringify(n)}\n`), zu: () => s.destroy() };
  return gastobj;
}

app.whenReady().then(async () => {
  await warte(4000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 900 });
  const huelle = fenster.contentView.children[0];
  const js = (a) => huelle.webContents.executeJavaScript(a);
  const setze = (sel, wert) =>
    js(`(() => { const el = document.querySelector(${JSON.stringify(sel)});
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(el, ${JSON.stringify(wert)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  const konsole = [];
  huelle.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // --- Raum eroeffnen ueber die Oberflaeche --------------------------------
  await js(`document.querySelector('[data-teilen-knopf]').click(); true`);
  await warte(800);
  await js(`document.querySelector('[data-richtung="raum"]').click(); true`);
  await warte(500);
  // Aktualisieren: der Kreis dreht.
  await js(`document.querySelector('[data-raum-aktualisieren]').click(); true`);
  const anzeige = () => js("document.querySelector('[data-raum-anzeige]')?.dataset.raumAnzeige");
  await warte(150);
  pruefe((await anzeige()) === 'dreht', '„Aktualisieren" laesst den Kreis drehen');
  await warte(1100);
  pruefe((await anzeige()) === 'fertig', 'nach einer Sekunde steht ein Haken da');
  await warte(1100);
  pruefe((await anzeige()) === 'ruhe', 'und eine Sekunde spaeter nichts mehr');
  await setze('[data-tischname]', 'Spielleitung');
  await setze('[data-raumname]', 'Freitagsrunde');
  await setze('[data-raum-passwort]', 'pw');
  await warte(300);
  await js(`document.querySelector('[data-raum-eroeffnen]').click(); true`);
  pruefe(await bis(async () => js("Boolean(document.querySelector('[data-raum=\"drin\"]'))")), 'der Raum ist eroeffnet');
  const einstellungen = JSON.parse(fs.readFileSync(path.join(userData, 'einstellungen.json'), 'utf8'));
  pruefe(einstellungen.tischName === 'Spielleitung', 'der eigene Name steht in den Einstellungen');
  const { zustand } = await js('window.shell.raum.zustand()');
  pruefe(zustand.rolle === 'gastgeber' && zustand.port > 0, `die App ist Gastgeber (Port ${zustand.port})`);
  pruefe(zustand.ich.name === 'Spielleitung', 'unter dem eigenen Namen');

  // --- Falsches und richtiges Passwort --------------------------------------
  const eve = gast(zustand.port, 'falsch', 'Eve');
  pruefe(await bis(() => eve.alle.some((n) => n.typ === 'abgelehnt' && n.grund === 'passwort')), 'ein falsches Passwort wird abgelehnt');
  const anna = gast(zustand.port, 'pw', 'Anna');
  pruefe(await bis(() => anna.ich !== null), 'mit dem richtigen kommt Anna herein');
  pruefe(
    await bis(async () => /Anna/.test(await js("document.querySelector('[data-personen]')?.textContent ?? ''"))),
    'und steht in der Liste der Personen'
  );

  // --- Chat -------------------------------------------------------------------
  anna.schreibe({ typ: 'chat', von: 'gefaelscht', an: null, text: 'Hallo Runde', zeit: '' });
  pruefe(
    await bis(async () => /Anna\s*Hallo Runde/.test(await js("document.querySelector('[data-chat]').textContent"))),
    'eine Nachricht an alle erscheint, unter Annas Namen (nicht dem gefaelschten)'
  );
  await js(`(() => { const s = document.querySelector('[data-chat-an]'); s.value = ${JSON.stringify(anna.ich.id)};
    s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  await warte(200);
  await setze('[data-chat-text]', 'Nur fuer dich');
  await js(`document.querySelector('[data-chat-senden]').click(); true`);
  pruefe(
    await bis(() => anna.alle.some((n) => n.typ === 'chat' && n.text === 'Nur fuer dich' && n.an === anna.ich.id)),
    'eine Direktnachricht kommt bei Anna an'
  );
  pruefe(
    await bis(async () => Boolean(await js("document.querySelector('.raum__zeile.is-privat')"))),
    'und ist im Chat als privat markiert'
  );
  if (process.env.BILD) {
    const bild = await huelle.webContents.capturePage();
    fs.writeFileSync(process.env.BILD, bild.toPNG());
  }

  // --- Ein Paket von Anna, angenommen in der App -----------------------------
  const paket = [
    '# LORE',
    '',
    '<!-- ttrpg:paket {"version":1,"erstellt":""} -->',
    '',
    '<!-- ttrpg:eintrag {"werkzeug":"monster","kennung":"ghul","name":"Ghul","art":"Monster"} -->',
    '---',
    'id: ghul',
    'name: Ghul',
    '---',
    '# Ghul',
    '<!-- ttrpg:ende -->',
    ''
  ].join('\n');
  // Dialog zu: der Zaehler am Knopf soll anspringen.
  await js("document.querySelector('.dialog').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); true");
  await warte(500);
  anna.schreibe({ typ: 'paket', von: anna.ich.id, an: 'gastgeber', titel: '1: Ghul', paket, zeit: '' });
  pruefe(await bis(async () => Boolean(await js("document.querySelector('[data-ungelesen]')"))), 'bei geschlossenem Dialog zaehlt der Knopf mit');
  anna.schreibe({ typ: 'chat', von: anna.ich.id, an: null, text: 'Seid ihr da?', zeit: '' });
  pruefe(
    await bis(async () => (await js("document.querySelector('[data-ungelesen]')?.textContent")) === '2'),
    'Paket und Nachricht: der Knopf zeigt 2'
  );
  const pakete = (await js('window.shell.raum.zustand()')).pakete;
  pruefe(pakete.length === 1 && pakete[0].von === 'Anna', 'das Paket wartet in der App');
  const angesehen = await js(`window.shell.raum.paketAnsehen(${pakete[0].id})`);
  pruefe(angesehen.ok && angesehen.ankuenfte[0].name === 'Ghul', 'es laesst sich ansehen');
  const ergebnis = await js("window.shell.austausch.annehmen([{ nummer: 0, modus: 'daneben' }], {})");
  pruefe(ergebnis[0]?.ok && fs.existsSync(path.join(monsterOrdner, 'ghul.md')), 'und annehmen: der Ghul liegt im Monster Creator');

  // --- Ein Paket an genau Anna ---------------------------------------------
  const ben = gast(zustand.port, 'pw', 'Ben');
  await bis(() => ben.ich !== null);
  const gesendet = await js(`window.shell.raum.senden([{ werkzeug: 'monster', kennung: 'ork' }], ${JSON.stringify(anna.ich.id)})`);
  pruefe(gesendet.ok, 'die App schickt ein Monster in den Raum');
  pruefe(await bis(() => anna.alle.some((n) => n.typ === 'paket' && /# Ork/.test(n.paket))), 'Anna bekommt es');
  await warte(300);
  pruefe(!ben.alle.some((n) => n.typ === 'paket'), 'Ben nicht');

  // --- Weitere Apps: ein magischer Gegenstand -------------------------------
  const gegenstand = await js(`window.shell.raum.senden([{ werkzeug: 'magicitems', kennung: 'klinge' }], null)`);
  pruefe(gegenstand.ok && gegenstand.anzahl === 1, 'auch ein magischer Gegenstand geht in den Raum');
  pruefe(await bis(() => ben.alle.some((n) => n.typ === 'paket' && /Glaenzt/.test(n.paket))), 'und kommt an');

  // --- Wuerfe aus dem Wuerfel -------------------------------------------------
  await js(`document.querySelector('[data-app="dice"]').click(); true`);
  await warte(4500);
  const wuerfel = fenster.contentView.children.find((v) => v.webContents.getURL().includes('/apps/dice/'));
  const djs = (a) => wuerfel.webContents.executeJavaScript(a);
  await djs(`document.querySelector('[data-teilen-wurf="alle"]').click(); true`);
  await warte(300);
  await djs("[...document.querySelectorAll('.artfeld .wuerfel')][5].click(); true");
  await djs("[...document.querySelectorAll('button')].find(b => /^(Roll|Rollen)$/.test(b.textContent.trim())).click(); true");
  pruefe(
    await bis(() => anna.alle.some((n) => n.typ === 'chat' && /^🎲 /.test(n.text) && n.an === null), 6000),
    'ein Wurf geht an alle im Raum'
  );
  await djs(`document.querySelector('[data-teilen-wurf="dm"]').click(); true`);
  await warte(300);
  const vorher = anna.alle.length;
  await djs("[...document.querySelectorAll('button')].find(b => /^(Roll|Rollen)$/.test(b.textContent.trim())).click(); true");
  pruefe(
    await bis(async () => /host|leitest/i.test(await djs("document.querySelector('[data-teilen-meldung]')?.textContent ?? ''")), 6000),
    'als Gastgeber bleibt ein Wurf „nur an DM" hier'
  );
  pruefe(!anna.alle.slice(vorher).some((n) => n.typ === 'chat' && /^🎲 /.test(n.text)), 'und geht nicht hinaus');

  // --- Raum schliessen -------------------------------------------------------
  await js('window.shell.raum.verlassen()');
  pruefe(await bis(() => anna.getrennt && ben.getrennt), 'der Raum ist zu, die Gaeste sind getrennt');
  pruefe((await js('window.shell.raum.zustand()')).zustand.rolle === 'aus', 'und die App ist wieder draussen');
  anna.zu();
  ben.zu();
  eve.zu();

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nRaum bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
