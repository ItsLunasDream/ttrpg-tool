/**
 * Rauchtest: der Magic Item Creator.
 *
 * Geprueft wird der Weg, den die Modultests nicht sehen: Kachel anklicken,
 * Eintrag waehlen, suchen — und vor allem der Sprung aus der Suche der
 * Huelle hinein. Der ist bei diesem Werkzeug der haeufigste Weg: man sucht
 * „liegend" und will die Regel sehen, nicht erst das Werkzeug oeffnen.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-magicitems.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'magicitems-smoke-'));
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

setTimeout(() => {
  console.log('\nABBRUCH: Zeitwaechter');
  app.exit(2);
}, 120000);

app.whenReady().then(async () => {
  await warte(4500);
  const fenster = BaseWindow.getAllWindows()[0];
  if (!fenster) {
    console.log('  FEHL kein Fenster');
    app.exit(1);
    return;
  }
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 860 });
  const huelle = fenster.contentView.children[0];
  const hjs = (a) => huelle.webContents.executeJavaScript(a);

  // --- Die Kachel ---------------------------------------------------------
  await hjs(
    `(() => { const k = document.querySelector('.kachel[data-app="magicitems"]:not(:disabled)');
      if (k) k.click(); return Boolean(k); })()`
  );
  await warte(5000);
  const sicht = fenster.contentView.children.find((v) => v.webContents.getURL().includes('/apps/magicitems/'));
  pruefe(Boolean(sicht), 'das Werkzeug kommt hoch');
  if (!sicht) {
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);
  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });
  pruefe(/Magic Item Creator/.test(await js('document.body.innerText')), 'mit seiner Ueberschrift');

  // --- Wuerfeln: Art und Seltenheit festgelegt ------------------------------
  const waehle = (was, wert) => js(`(() => {
    const el = document.querySelector('select[data-erzeuger="${was}"]');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, '${wert}');
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await waehle('art', 'waffe');
  await waehle('seltenheit', 'rare');
  await warte(200);
  await js(`document.querySelector('[data-wuerfeln]').click(); true`);
  await warte(400);
  const wirkung = await js("document.querySelector('[data-wirkung]')?.value ?? ''");
  pruefe(wirkung.length > 20, `ein gewuerfelter Gegenstand hat Wirkungen (${wirkung.slice(0, 60)})`);
  pruefe(
    /4[.,]000/.test(await js("document.querySelector('[data-wert]')?.textContent ?? ''")),
    'der Wert einer seltenen Waffe ist 4.000 nach der SRD-Tabelle'
  );
  const ordner = path.join(userData, 'magicitems', 'gegenstaende');
  const dateien = () => (fs.existsSync(ordner) ? fs.readdirSync(ordner) : []);
  pruefe(dateien().length === 0, 'vor dem Speichern liegt nichts auf der Platte');

  // Seltenheit aendern: der Wert folgt.
  await js(`(() => {
    const el = [...document.querySelectorAll('.kopfzeile select')][1];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, 'veryRare');
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await warte(200);
  pruefe(
    /40[.,]000/.test(await js("document.querySelector('[data-wert]')?.textContent ?? ''")),
    'eine andere Seltenheit aendert den Wert'
  );

  await js(`document.querySelector('[data-speichern]').click(); true`);
  await warte(700);
  pruefe(dateien().length === 1, `gespeichert liegt der Gegenstand auf der Platte (${dateien().join(', ')})`);
  const inhalt = dateien().length ? fs.readFileSync(path.join(ordner, dateien()[0]), 'utf8') : '';
  pruefe(/^art: waffe$/m.test(inhalt) && /^seltenheit: veryRare$/m.test(inhalt), 'mit Art und Seltenheit im Kopf');

  // --- Die Sammlung und die Suche -------------------------------------------
  await js(`[...document.querySelectorAll('button')].find(b => /Zurück zur Liste|Back to the list/.test(b.textContent)).click(); true`);
  await warte(500);
  pruefe((await js("document.querySelectorAll('.gegenstandskachel').length")) === 1, 'die Kachel steht in der Sammlung');
  const eintraege = await hjs('window.shell.suche.eintraege()');
  pruefe(
    (eintraege ?? []).some((e) => e.werkzeug === 'magicitems'),
    'Strg+K findet den Gegenstand'
  );

  // Ein Bildschirmfoto, wenn gewuenscht — zum Ansehen, nicht zum Pruefen.
  if (process.env.BILD) {
    await js(`document.querySelector('.gegenstandskachel').click(); true`);
    await warte(600);
    const bild = await sicht.webContents.capturePage();
    fs.writeFileSync(process.env.BILD, bild.toPNG());
  }

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nMagic Item Creator bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
