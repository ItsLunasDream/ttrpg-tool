/**
 * Der Status Effect Creator in der Huelle.
 *
 * Geprueft wird der Weg, den kein Modelltest sieht: laedt das Werkzeug,
 * wuerfelt es einen Zustand, steht die Waage darunter, und landet ein
 * gespeicherter Zustand wirklich als Datei im Datenordner — mit Zeichen,
 * Farbe und Stufenzahl im Kopf, denn daran haengt spaeter der Initiative
 * Tracker.
 *
 * Aufruf: xvfb-run -a electron scripts/smoke-zustaende.cjs --no-sandbox
 */
const { app, BaseWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zustaende-'));
const userData = path.join(tmp, 'userData');
app.setPath('userData', userData);
process.env.TTRPG_TOOLS_START_APP = 'zustaende';
require(path.join(__dirname, '..', 'dist', 'main', 'index.js'));

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const fehler = [];
const pruefe = (b, t) => {
  console.log(`  ${b ? 'ok  ' : 'FEHL'} ${t}`);
  if (!b) fehler.push(t);
};

process.on('unhandledRejection', (grund) => {
  console.log('FEHLER: unbehandelte Ablehnung:', grund);
  app.exit(1);
});

app.whenReady().then(async () => {
  await warte(5000);
  const fenster = BaseWindow.getAllWindows()[0];
  fenster.setBounds({ x: 0, y: 0, width: 1320, height: 900 });
  await warte(800);

  const sicht = fenster.contentView.children.find((ansicht) =>
    ansicht.webContents.getURL().includes('/apps/zustaende/')
  );
  pruefe(Boolean(sicht), 'die Ansicht des Status Effect Creators ist da');
  if (!sicht) {
    app.exit(1);
    return;
  }
  const js = (a) => sicht.webContents.executeJavaScript(a);
  const menue = fenster.contentView.children[0];
  const mjs = (a) => menue.webContents.executeJavaScript(a);

  const konsole = [];
  sicht.webContents.on('console-message', (_e, l, t) => {
    if (l >= 2) konsole.push(t.slice(0, 160));
  });

  // --- Wuerfeln ---------------------------------------------------------
  console.log('\nEinen Zustand wuerfeln:');
  pruefe(await js("Boolean(document.querySelector('.regler'))"), 'die Regler stehen da');

  // Fuenf Stufen einstellen, damit die Kurve etwas zu zeigen hat.
  await js(`(() => {
    const felder = [...document.querySelectorAll('.regler select')];
    const setzer = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    // Das letzte Auswahlfeld ist die Stufenzahl.
    setzer.call(felder[felder.length - 1], '5');
    felder[felder.length - 1].dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await warte(200);

  await js("[...document.querySelectorAll('.knopf')].find(k => /Roll|Würfeln/.test(k.textContent)).click(); true");
  await warte(600);

  const name = await js("document.querySelector('.blatt__name')?.textContent ?? ''");
  pruefe(name.length > 2, `ein Zustand steht da (${name})`);
  pruefe(
    (await js("document.querySelectorAll('.blatt__stufen li').length")) === 5,
    'fuenf Stufen stehen untereinander'
  );
  pruefe(
    (await js("(document.querySelector('.blatt__zeichen')?.textContent ?? '').length")) > 0,
    'ein Zeichen fuer den Tracker steht dabei'
  );

  // --- Die Waage ---------------------------------------------------------
  console.log('\nDie Waage:');
  pruefe(await js("Boolean(document.querySelector('.waage'))"), 'die Waage steht darunter');
  pruefe(
    !(await js("document.querySelector('.waage').className.includes('waage--kaputt')")),
    'ein frisch gewuerfelter Zustand ist nicht kaputt'
  );
  pruefe(
    (await js("document.querySelectorAll('.waage__kurve li').length")) === 5,
    'die Kurve zeigt jede Stufe'
  );
  const vergleich = await js("document.querySelector('.waage__vergleich')?.textContent ?? ''");
  pruefe(vergleich.length > 5, `das Gewicht steht mit einem Vergleich da (${vergleich})`);

  /*
   * Und die Teile passen zueinander.
   *
   * Der gemeldete Fall: Dauer „bis zu deinem naechsten Zug" und Linderung
   * „eine Stunde in trockener Kleidung". Der Kasten taucht nur auf, wenn
   * etwas nicht zusammengeht — er darf hier also nicht da sein.
   */
  pruefe(
    !(await js("Boolean(document.querySelector('.waage__stimmig'))")),
    'ein frisch gewuerfelter Zustand ist in sich stimmig'
  );

  const blatt = await js(
    "[...document.querySelectorAll('.blatt__zeile')].map(z => z.textContent).join(' | ')"
  );
  pruefe(
    !/until the end of the round|until your next turn|Rundenende|nächsten Zug/.test(blatt),
    `fuenf Stufen bekommen keine Kampfdauer (${blatt.slice(0, 80)})`
  );

  /*
   * Der einschraenkende Satz MUSS dabeistehen.
   *
   * Eine Zahl ohne ihn liest sich wie ein Balance-Urteil, und genau das ist
   * sie nicht. Wer ihn beim Umbauen wegwirft, soll hier darueber stolpern.
   */
  const fussnote = await js(
    "[...document.querySelectorAll('.waage__fussnote')].map(f => f.textContent).join(' ')"
  );
  pruefe(
    /wie oft man ihn bekommt|how often you get it/.test(fussnote),
    'und mit dem Satz, was es nicht bedeutet'
  );

  // --- Speichern ---------------------------------------------------------
  console.log('\nIn die Sammlung:');
  await js("[...document.querySelectorAll('.knopf')].find(k => /collection|Sammlung/i.test(k.textContent)).click(); true");
  await warte(900);

  // Jedes Werkzeug hat einen eigenen Unterordner im Datenordner, darin liegt
  // der Ordner `zustaende`. Genau diesen Pfad wird der Tracker lesen.
  const ordner = path.join(userData, 'zustaende', 'zustaende');
  const dateien = fs.existsSync(ordner) ? fs.readdirSync(ordner).filter((d) => d.endsWith('.md')) : [];
  pruefe(dateien.length === 1, `eine Datei liegt im Ordner (${dateien.join(', ') || 'keine'})`);

  if (dateien.length > 0) {
    const inhalt = fs.readFileSync(path.join(ordner, dateien[0]), 'utf8');
    for (const feld of ['name:', 'art:', 'thema:', 'haerte:', 'stufen:', 'gewicht:', 'zeichen:', 'farbe:', 'dauer_id:']) {
      pruefe(inhalt.includes(feld), `der Kopf traegt ${feld}`);
    }
    pruefe(/^\d\. /m.test(inhalt), 'und der Leib nennt die Stufen mit Nummer');
    pruefe(
      /wie oft man ihn bekommt|how often you get it/.test(inhalt),
      'auch in der Datei steht, was das Gewicht nicht bedeutet'
    );
  }

  // --- Die Sammlung ------------------------------------------------------
  console.log('\nDie Sammlung:');
  await js("[...document.querySelectorAll('.reiter__knopf')].find(k => /Collection|Sammlung/.test(k.textContent)).click(); true");
  await warte(500);
  pruefe(
    (await js("document.querySelectorAll('.zustandskachel').length")) === 1,
    'der gespeicherte Zustand steht als Kachel da'
  );

  const suchen = async (text) => {
    await js(`(() => {
      const feld = document.querySelector('.sammlung__suche');
      const setzer = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setzer.call(feld, ${JSON.stringify(text)});
      feld.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await warte(250);
    return js("document.querySelectorAll('.zustandskachel').length");
  };

  pruefe((await suchen(name.slice(0, 4))) === 1, 'der Anfang des Namens findet ihn wieder');
  pruefe((await suchen('5 stufen')) === 1, '„5 stufen" findet ihn auch');
  pruefe((await suchen('9 stufen')) === 0, 'eine andere Stufenzahl findet nichts');
  await suchen('');

  await js("[...document.querySelectorAll('.knopf--klein')].find(k => /List|Liste/.test(k.textContent)).click(); true");
  await warte(300);
  pruefe(
    (await js("document.querySelectorAll('.zustandsliste tbody tr').length")) === 1,
    'die Liste zeigt denselben Zustand'
  );

  // --- Pakete --------------------------------------------------------------
  console.log('\nEin Paket:');
  await js("[...document.querySelectorAll('.reiter__knopf')].find(k => /Package|Paket/.test(k.textContent)).click(); true");
  await warte(400);
  await js("[...document.querySelectorAll('.knopf')].find(k => /Roll a package|Paket würfeln/.test(k.textContent)).click(); true");
  await warte(700);

  pruefe(
    (await js("document.querySelectorAll('.paket__eintrag').length")) >= 2,
    'das Paket enthaelt mehrere Zustaende'
  );
  const paketname = await js("document.querySelector('.paket__name')?.textContent ?? ''");
  pruefe(paketname.length > 3, `das Paket hat einen Namen (${paketname})`);

  /*
   * Der eigentliche Zweck des Pakets: die Abstimmung. Steht dort etwas von
   * Wiederholungen, hat der Vorrat nicht gereicht — bei vier Zustaenden darf
   * das nicht passieren.
   */
  const abgestimmt = await js(
    "[...document.querySelectorAll('.hinweis--klein')].map(h => h.textContent).join(' ')"
  );
  pruefe(
    /Coordinated|Abgestimmt/.test(abgestimmt),
    `die Wirkungen sind ueber das Paket verteilt (${abgestimmt.slice(0, 60)})`
  );

  /*
   * Und in der Sammlung bleibt das Paket eines.
   *
   * Aus dem Gebrauch: die vier Zustaende landeten einzeln an ihrer
   * alphabetischen Stelle zwischen fremden Eintraegen, und die Abstimmung —
   * der ganze Grund, ein Paket zu wuerfeln — war nicht mehr zu sehen.
   */
  await js(`[...document.querySelectorAll('.knopf')].find(
    k => /All to the collection|Alle in die Sammlung/.test(k.textContent)).click(); true`);
  await warte(1200);
  await js("[...document.querySelectorAll('.reiter__knopf')].find(k => /Collection|Sammlung/.test(k.textContent)).click(); true");
  await warte(700);

  pruefe(
    (await js("document.querySelectorAll('.paketgruppe').length")) === 1,
    'das Paket steht als eine Kachel in der Sammlung'
  );
  const kopfText = await js("document.querySelector('.paketkachel__name')?.textContent ?? ''");
  pruefe(kopfText === paketname, `die Kachel traegt den Paketnamen (${kopfText})`);
  pruefe(
    !(await js("Boolean(document.querySelector('.paketgruppe--auf'))")),
    'zugeklappt ist die Vorgabe'
  );

  await js("document.querySelector('.paketkachel__kopf').click(); true");
  await warte(400);
  pruefe(
    (await js("document.querySelectorAll('.paketgruppe__glied .zustandskachel').length")) >= 2,
    'aufgeklappt stehen die Zustaende darin'
  );

  // Ueber den Paketnamen laesst es sich auch finden.
  await js(`(() => { const f = document.querySelector('.sammlung__suche');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
      f, ${JSON.stringify(paketname)});
    f.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  await warte(400);
  pruefe(
    (await js("document.querySelectorAll('.paketgruppe').length")) === 1,
    'und der Paketname findet es in der Suche'
  );

  // --- Die Karte zum Vorlesen ----------------------------------------------
  console.log('\nDie Karte:');
  await js("[...document.querySelectorAll('.reiter__knopf')].find(k => /Build|Bauen/.test(k.textContent)).click(); true");
  await warte(400);
  await js("[...document.querySelectorAll('.knopf')].find(k => /card|Karte/i.test(k.textContent)).click(); true");
  await warte(600);

  pruefe(await js("Boolean(document.querySelector('.kartenschirm'))"), 'die Karte liegt auf dem Schirm');

  /*
   * Auf der Vorderseite steht, was die Figur merkt — keine Regelwirkungen.
   * Das ist die Seite, die man der Gruppe hinhaelt.
   */
  const karteninhalt = await js(`(() => {
    const rahmen = document.querySelector('.kartenschirm__blatt');
    return rahmen ? rahmen.getAttribute('srcdoc') ?? '' : '';
  })()`);
  pruefe(karteninhalt.includes('karte--vorn'), 'sie hat eine Vorderseite');
  pruefe(karteninhalt.includes('karte--rueck'), 'und eine Rueckseite');
  pruefe(karteninhalt.includes('@page'), 'und eine Seitengroesse zum Drucken');

  await js(`(() => {
    const knopf = [...document.querySelectorAll('.kartenschirm .knopf')].find((k) =>
      /Close|Schließen/.test(k.textContent)
    );
    if (knopf) knopf.click();
    return true;
  })()`);
  await warte(300);
  pruefe(!(await js("Boolean(document.querySelector('.kartenschirm'))")), 'und sie geht wieder zu');

  // --- In den Story Creator ----------------------------------------------
  console.log('\nIn den Story Creator:');
  // Ohne dass der Story Creator je offen war: die Huelle montiert ihn
  // im Hintergrund, statt „erst einmal oeffnen" zu melden (Testbericht).
  await js(`(() => {
    const knopf = [...document.querySelectorAll('.knopf')].find((k) => /Story Creator/i.test(k.textContent));
    if (knopf) knopf.click();
    return Boolean(knopf);
  })()`);
  await warte(3000);
  const vorher = await js("document.querySelector('.meldung')?.textContent ?? ''");
  pruefe(!/once|einmal/i.test(vorher), `kein „erst oeffnen" mehr (${vorher})`);
  await mjs(`(() => {
    const eintrag = [...document.querySelectorAll('.schiene__eintrag:not(:disabled)')]
      .find((k) => /Story|Backstory/i.test(k.title));
    if (!eintrag) return false;
    eintrag.click();
    return true;
  })()`);
  await warte(5000);
  const bs = fenster.contentView.children.find((ansicht) =>
    ansicht.webContents.getURL().includes('/apps/backstory/')
  );
  pruefe(Boolean(bs), 'der Story Creator kommt hoch');

  if (bs) {
    const kampagne = await bs.webContents.executeJavaScript(`(async () => {
      const auspacken = (antwort) => (antwort && 'value' in antwort ? antwort.value : antwort);
      const liste = auspacken(await window.api.campaigns.list()) ?? [];
      if (liste.length > 0) return liste[0].name;
      return auspacken(await window.api.campaigns.create('Testrunde')).name;
    })()`);
    pruefe(typeof kampagne === 'string' && kampagne.length > 0, `eine Kampagne steht bereit (${kampagne})`);

    await mjs(`(() => {
      const eintrag = [...document.querySelectorAll('.schiene__eintrag:not(:disabled)')]
        .find((k) => /Status|Zustand/i.test(k.title));
      if (!eintrag) return false;
      eintrag.click();
      return true;
    })()`);
    await warte(2500);

    await js(`(() => {
      const reiter = [...document.querySelectorAll('.reiter__knopf')].find((k) =>
        /Build|Bauen/.test(k.textContent)
      );
      if (reiter) reiter.click();
      return true;
    })()`);
    await warte(400);

    const geklickt = await js(`(() => {
      const knopf = [...document.querySelectorAll('.knopf')].find((k) =>
        /Story Creator/i.test(k.textContent)
      );
      if (!knopf) return false;
      knopf.click();
      return true;
    })()`);
    pruefe(geklickt === true, 'der Knopf „In den Story Creator" ist da');
    await warte(1500);
    /*
     * Der Knopf fuer Foundry.
     *
     * Geklickt wird er NICHT: er oeffnet einen Dateidialog des Systems, und
     * der bliebe im Rauchtest offen stehen. Dass die erzeugte Datei stimmt,
     * pruefen die Modultests (packages/foundry und apps/zustaende/tests/foundry).
     * Hier geht es um die Verdrahtung: steht der Knopf da, und bietet die
     * Bruecke den Kanal an, den er ruft?
     */
    const foundryKnopf = await js(
      `[...document.querySelectorAll('.knopf')].some((k) => /Foundry/i.test(k.textContent))`
    );
    pruefe(foundryKnopf === true, 'der Knopf „Für Foundry (JSON)" ist da');
    pruefe(
      (await js("typeof window.zustaende.foundry")) === 'function',
      'und die Bruecke bietet den Kanal dafuer an'
    );


    const meldung = await js("document.querySelector('.meldung')?.textContent ?? ''");
    pruefe(
      !/error\\.|unknownNoteType|did not work|ging nicht/i.test(meldung),
      `der Export meldet keinen Fehler (${meldung})`
    );

    const wurzel = await bs.webContents.executeJavaScript(`(async () => {
      const antwort = await window.api.settings.get();
      const wert = antwort && 'value' in antwort ? antwort.value : antwort;
      return wert.vaultRoot;
    })()`);
    const kampagnenOrdner = path.join(wurzel, 'campaigns');
    const gefunden = [];
    if (fs.existsSync(kampagnenOrdner)) {
      for (const eintrag of fs.readdirSync(kampagnenOrdner)) {
        const notizen = path.join(kampagnenOrdner, eintrag, 'notes');
        if (fs.existsSync(notizen)) gefunden.push(...fs.readdirSync(notizen));
      }
    }
    pruefe(gefunden.length > 0, `die Notiz liegt in der Kampagne (${gefunden.join(', ') || 'nichts'})`);
  }

  pruefe(konsole.length === 0, `keine Konsolenfehler (${konsole.join(' / ') || 'keine'})`);
  console.log(fehler.length === 0 ? '\nStatus Effect Creator bestanden.' : `\n${fehler.length} Fehler.`);
  app.exit(fehler.length === 0 ? 0 : 1);
});
