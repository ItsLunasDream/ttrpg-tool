/**
 * Rauchtest des Wuerfels — in der Huelle, an der laufenden Anwendung.
 *
 * Die Modelltests unter apps/dice/tests pruefen die Rechnung: Pool, Ausdruck,
 * Abzugswuerfel, Lesbarkeit der Zahlenfarbe. Was sie nicht sehen koennen, ist,
 * ob ein Klick ankommt: ob die Formen gezeichnet werden, ob ein Rechtsklick
 * verringert statt das Kontextmenue zu oeffnen, ob die Effekte erscheinen und
 * ob hundert Wuerfel die Anwendung stehenlassen.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-dice.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dice-smoke-'));
app.setPath('userData', path.join(tmp, 'userData'));
process.env.TTRPG_TOOLS_START_APP = 'dice';
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

const SETZ = `const setz = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el, v); el.dispatchEvent(new Event('input',{bubbles:true})); };`;

app.whenReady().then(async () => {
  await warte(5000);
  const fenster = BaseWindow.getAllWindows()[0];
  const sicht = fenster?.contentView?.children?.[1];
  pruefe(Boolean(sicht), 'der Wuerfel haengt als eigene Ansicht im Fenster');
  if (!sicht) {
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);
  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  pruefe(await js("Boolean(document.querySelector('.wuerfelapp'))"), 'seine Oberflaeche steht');
  pruefe(await js("typeof window.dice === 'object'"), 'die Bruecke zum Hauptprozess ist da');
  pruefe(
    (await js("document.querySelectorAll('.artfeld').length")) === 8,
    'alle acht Wuerfelarten stehen zur Wahl'
  );

  // Jede Art muss eine eigene Form haben — sie ist das Einzige, woran man sie
  // erkennt. Verglichen werden die Pfaddaten der Umrisse.
  const formen = await js(
    "JSON.stringify([...document.querySelectorAll('.artfeld svg > path:first-of-type')].map(p => p.getAttribute('d')))"
  );
  const eindeutig = new Set(JSON.parse(formen));
  pruefe(eindeutig.size === 8, `alle acht Formen sind verschieden (${eindeutig.size} von 8)`);

  // --- Klicken ------------------------------------------------------------
  await js("[...document.querySelectorAll('.artfeld .wuerfel')][5].click(); true");
  await warte(300);
  pruefe((await js("[...document.querySelectorAll('.artfeld__zahl')][5].value")) === '1', 'Linksklick legt einen dazu');

  await js(`(() => { const w = [...document.querySelectorAll('.artfeld .wuerfel')][5];
    const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    const abgewehrt = !w.dispatchEvent(e);
    window.__abgewehrt = abgewehrt; return true; })()`);
  await warte(300);
  pruefe((await js("[...document.querySelectorAll('.artfeld__zahl')][5].value")) === '', 'Rechtsklick nimmt einen weg');
  pruefe(await js('window.__abgewehrt'), 'und unterdrueckt dabei das Kontextmenue');

  // --- Abzugswuerfel ------------------------------------------------------
  await js(`(() => { ${SETZ} const f = [...document.querySelectorAll('.artfeld__zahl')];
    setz(f[5], '3'); setz(f[0], '-2'); setz(document.querySelector('.feld input'), '5'); return true; })()`);
  await warte(400);
  const ausdruck = await js("document.querySelector('.buehne__ausdruck').textContent");
  pruefe(ausdruck === '3d20 - 2d4 + 5', `der Ausdruck stimmt (${ausdruck})`);

  await js("[...document.querySelectorAll('button')].find(b => /Roll|Rollen/.test(b.textContent)).click(); true");
  await warte(1400);
  pruefe(
    (await js("document.querySelectorAll('.wuerfel--abzug').length")) === 2,
    'Abzugswuerfel sind als solche zu sehen'
  );

  // Die Summe muss zu den abgebildeten Zahlen passen — sonst rechnet man sie
  // im Kopf nach und haelt das Werkzeug fuer kaputt.
  const rechnung = await js(`(() => {
    const zahlen = [...document.querySelectorAll('.buehne__tisch .wuerfel')].map((w) => ({
      wert: Number(w.querySelector('text').textContent),
      abzug: w.classList.contains('wuerfel--abzug')
    }));
    const summe = zahlen.reduce((s, z) => s + (z.abzug ? -z.wert : z.wert), 0) + 5;
    return JSON.stringify({ summe, gezeigt: Number(document.querySelector('.buehne__summe-zahl').textContent) });
  })()`);
  const { summe, gezeigt } = JSON.parse(rechnung);
  pruefe(summe === gezeigt, `die Summe passt zu den Wuerfeln (${summe} gegen ${gezeigt})`);

  pruefe(
    (await js("document.querySelectorAll('.verlauf__liste li').length")) === 1,
    'der Wurf steht im Verlauf'
  );

  // --- Die Anzahl bleibt stehen -------------------------------------------
  pruefe(
    (await js("[...document.querySelectorAll('.artfeld__zahl')][5].value")) === '3',
    'die Anzahl setzt sich nach dem Wurf NICHT zurueck'
  );

  // --- Effekte ------------------------------------------------------------
  // Solange wuerfeln, bis eine 20 und eine 1 dabei sind. Bei 20 Wuerfeln ist
  // beides in wenigen Versuchen da; bleibt es aus, ist der Test nicht rot,
  // sondern sagt es.
  await js(`(() => { ${SETZ} const f = [...document.querySelectorAll('.artfeld__zahl')];
    f.forEach((x) => setz(x, '0')); setz(f[5], '20'); return true; })()`);
  let glitzer = 0;
  let streifen = 0;
  for (let versuch = 0; versuch < 20 && (glitzer === 0 || streifen === 0); versuch++) {
    await js("[...document.querySelectorAll('button')].find(b => /Roll|Rollen/.test(b.textContent)).click(); true");
    await warte(1000);
    glitzer = Math.max(glitzer, await js("document.querySelectorAll('.glitzer').length"));
    streifen = Math.max(streifen, await js("document.querySelectorAll('.streifen').length"));
  }
  pruefe(glitzer > 0, `der Hoechstwurf glitzert (${glitzer} gesehen)`);
  pruefe(streifen > 0, `die Eins bekommt Streifen (${streifen} gesehen)`);

  // Abgeschaltet heisst abgeschaltet.
  await js("[...document.querySelectorAll('.aussehen__schalter input')][0].click(); true");
  await warte(200);
  await js("[...document.querySelectorAll('button')].find(b => /Roll|Rollen/.test(b.textContent)).click(); true");
  await warte(1200);
  pruefe(
    (await js("document.querySelectorAll('.glitzer').length")) === 0,
    'abgeschalteter Glitzer bleibt aus'
  );
  await js("[...document.querySelectorAll('.aussehen__schalter input')][0].click(); true");

  // --- Hundert Wuerfel ----------------------------------------------------
  // Der Nutzer nennt das einen Extremfall; realistisch sind rund zwanzig.
  // Gemessen wird trotzdem, damit die Zahl bekannt ist statt geschaetzt.
  await js(`(() => { ${SETZ} const f = [...document.querySelectorAll('.artfeld__zahl')];
    f.forEach((x) => setz(x, '0')); setz(f[5], '100'); return true; })()`);
  await warte(400);
  const gemessen = await js(`(() => new Promise((fertig) => {
    const knopf = [...document.querySelectorAll('button')].find((b) => /Roll|Rollen/.test(b.textContent));
    const bilder = [];
    let letzte = performance.now();
    let laeuft = true;
    function tick(jetzt) {
      bilder.push(jetzt - letzte);
      letzte = jetzt;
      if (laeuft) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    knopf.click();
    setTimeout(() => {
      laeuft = false;
      const sortiert = bilder.slice(1).sort((a, b) => a - b);
      fertig(JSON.stringify({
        anzahl: document.querySelectorAll('.buehne__tisch .wuerfel').length,
        p50: sortiert[Math.floor(sortiert.length * 0.5)],
        p95: sortiert[Math.floor(sortiert.length * 0.95)],
        max: sortiert[sortiert.length - 1]
      }));
    }, 1600);
  }))()`);
  const m = JSON.parse(gemessen);
  console.log(
    `  100 Wuerfel: ${m.anzahl} gezeichnet, Bildabstand p50 ${m.p50.toFixed(1)}ms, ` +
      `p95 ${m.p95.toFixed(1)}ms, max ${m.max.toFixed(1)}ms`
  );
  pruefe(m.anzahl === 100, 'alle hundert Wuerfel werden gezeichnet');
  // Die Grenze ist bewusst weit: hundert ist der Extremfall, und der darf
  // ruckeln. Was nicht passieren darf, ist Stillstand.
  pruefe(m.p95 < 120, `die Anwendung bleibt bedienbar (p95 ${m.p95.toFixed(1)}ms)`);

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' | ') || 'keine'})`);

  console.log(fehler.length ? `\n${fehler.length} Pruefung(en) fehlgeschlagen.` : '\nWuerfel bestanden.');
  app.exit(fehler.length ? 1 : 0);
});
