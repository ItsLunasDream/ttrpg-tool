/**
 * Rauchtest: die Suche ueber alle Werkzeuge (Strg+K).
 *
 * Die Modultests in packages/eintraege pruefen das Suchen selbst — Treffer,
 * Reihenfolge, Buendelung. Was sie nicht koennen: ob die Werkzeuge ihre
 * Eintraege wirklich liefern, und zwar OHNE dass man sie in dieser Sitzung
 * schon einmal offen hatte. Genau das ist der Punkt der ganzen Sache: was
 * man lange nicht angefasst hat, sucht man am ehesten.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-suche.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'suche-smoke-'));
const userData = path.join(tmp, 'userData');

function lege(relativ, inhalt) {
  const voll = path.join(userData, ...relativ.split('/'));
  fs.mkdirSync(path.dirname(voll), { recursive: true });
  fs.writeFileSync(voll, inhalt, 'utf8');
}

/*
 * Ein Bestand, den in dieser Sitzung niemand angelegt hat.
 *
 * Die Dateien liegen da, bevor die Anwendung startet — genau der Fall, an
 * dem eine Suche ueber die Oberflaeche gescheitert waere.
 */
/*
 * DIE PFADE SIND DOPPELT, UND DAS IST ABSICHT.
 *
 * Die Huelle gibt jedem Werkzeug einen eigenen Unterordner im Datenordner,
 * und die Ablage des Werkzeugs legt darin noch einen an. Ein Monster liegt
 * also unter `monster/monster/`, nicht unter `monster/`.
 *
 * Hier stand frueher der einfache Pfad — und weil die Leser der Suche
 * denselben Fehler machten, ging der Test durch, waehrend die Suche in der
 * fertigen Anwendung kein einziges echtes Monster fand. Ein Rauchtest, der
 * seine Daten woandershin legt, als das Werkzeug schreibt, prueft nichts.
 */
lege(
  'monster/monster/frostwaechter.md',
  '---\nid: frostwaechter\nname: Frostwächter\ncr: "5"\nthema: elementar\nrolle: brecher\ntp: 90\nrk: 15\ngeaendert: 2026-09-22T09:00:00.000Z\n---\n\n# Frostwächter\n'
);
lege(
  'zustaende/zustaende/absolute-kaelte.md',
  '---\nid: absolute-kaelte\nname: Absolute Kälte\nart: koerper\nthema: kaelte\nhaerte: hart\ndauer: stunde\nstufen: 3\ngewicht: 7\nzeichen: "*"\nfarbe: "#88ccff"\ngeaendert: 2026-09-22T09:00:00.000Z\n---\n\n# Absolute Kälte\n'
);
/*
 * Die Begegnung im echten Format des Trackers: die Teilnehmer stehen als
 * JSON-Zeile im Kopf, nicht als Liste im Rumpf. Eine von Hand erfundene
 * Form haette hier bestanden und in der Anwendung nichts gefunden.
 */
lege(
  'initiative/begegnungen/hoehlenkampf.md',
  [
    '---',
    'schemaVersion: 1',
    'id: "hoehlenkampf"',
    'name: "Höhlenkampf"',
    `teilnehmer: ${JSON.stringify([
      { id: 't0', name: 'Ghul', initiative: 12, koerper: [{ id: 'k0', marke: '', hp: 22, hpMax: 22, tempHp: 0, raus: false }] },
      { id: 't1', name: 'Wolf', initiative: 9, koerper: [{ id: 'k1', marke: '', hp: 11, hpMax: 11, tempHp: 0, raus: false }] }
    ])}`,
    '---',
    '',
    'Der Ghul greift zuerst an.',
    ''
  ].join('\n')
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
  if (!fenster) {
    console.log('  FEHL kein Fenster');
    app.exit(1);
    return;
  }
  fenster.setBounds({ x: 0, y: 0, width: 1280, height: 860 });
  const sicht = fenster.contentView.children[0];
  const js = (a) => sicht.webContents.executeJavaScript(a);

  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // --- Die Eintraege kommen von der Platte ---------------------------------
  const eintraege = await js('window.shell.suche.eintraege()');
  pruefe(
    Array.isArray(eintraege) && eintraege.length >= 3,
    `alle drei Werkzeuge liefern (${Array.isArray(eintraege) ? eintraege.length : 'keine Liste'})`
  );
  const werkzeuge = new Set((eintraege ?? []).map((e) => e.werkzeug));
  for (const name of ['monster', 'zustaende', 'initiative']) {
    pruefe(werkzeuge.has(name), `${name} ist dabei`);
  }
  // Und das, ohne dass eines davon je offen war.
  pruefe(
    fenster.contentView.children.length === 1,
    `noch kein Werkzeug montiert (${fenster.contentView.children.length} Ansicht)`
  );

  const begegnung = (eintraege ?? []).find((e) => e.werkzeug === 'initiative');
  pruefe(
    Boolean(begegnung) && /Ghul/.test(begegnung.stichworte ?? ''),
    `die Teilnehmer stehen als Stichworte da (${begegnung?.stichworte})`
  );

  // --- Strg+K oeffnet ------------------------------------------------------
  await js(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })); true`);
  await warte(1200);
  pruefe(await js("Boolean(document.querySelector('.suche'))"), 'Strg+K oeffnet die Suche');

  // --- Tippen findet ueber die Werkzeuge hinweg ----------------------------
  await js(`(() => {
    const feld = document.querySelector('.suche__feld');
    const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setzer.call(feld, 'kälte');
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(500);
  const treffer = await js(
    "[...document.querySelectorAll('.suche__treffer')].map((k) => k.textContent)"
  );
  pruefe(
    treffer.some((text) => /Absolute Kälte/.test(text)),
    `„kälte" findet den Zustand (${treffer.join(' | ') || 'nichts'})`
  );

  // Ein Wort, das nur in einem anderen Werkzeug steht.
  await js(`(() => {
    const feld = document.querySelector('.suche__feld');
    const setzer = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setzer.call(feld, 'ghul');
    feld.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await warte(500);
  const ghul = await js(
    "[...document.querySelectorAll('.suche__treffer')].map((k) => k.textContent)"
  );
  pruefe(
    ghul.some((text) => /Höhlenkampf/.test(text)),
    `ein Teilnehmer findet die Begegnung (${ghul.join(' | ') || 'nichts'})`
  );

  // --- Der Sprung ----------------------------------------------------------
  //
  // Der eigentliche Zweck: ein Treffer bringt einen dorthin, wo er liegt.
  await js("document.querySelector('.suche__treffer').click(); true");
  await warte(6000);

  const tracker = fenster.contentView.children.find((v) =>
    v.webContents.getURL().includes('/apps/initiative/')
  );
  pruefe(Boolean(tracker), 'der Treffer bringt einen in den Initiative Tracker');
  pruefe(
    !(await js("Boolean(document.querySelector('.suche'))")),
    'und die Suche ist wieder zu'
  );

  if (tracker) {
    const name = await tracker.webContents.executeJavaScript(
      "document.querySelector('.kopf__name')?.value ?? document.body.innerText"
    );
    pruefe(/Höhlenkampf/.test(name), `und die Begegnung ist geladen (${name.slice(0, 60)})`);
  }

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);

  console.log(fehler.length === 0 ? '\nSuche bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
