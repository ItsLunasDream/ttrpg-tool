/**
 * Prototyp zur Frage: laesst sich eine eingebettete Ansicht fluessig bewegen?
 *
 * Eine `WebContentsView` hat keine Opazitaet — nur `setBounds`, `setVisible`,
 * `setBackgroundColor` und `setBorderRadius` (nachgesehen in electron.d.ts).
 * Ein Uebergang beim Werkzeugwechsel kann deshalb nur ein *Ortswechsel* sein:
 * die Ansicht faehrt herein, statt einzublenden. Ob das gut aussieht oder
 * ruckelt, entscheidet, ob die Huelle diesen Effekt bekommt.
 *
 * Gemessen wird dreierlei:
 *   1. Wie gleichmaessig der Hauptprozess seine Bilder ausloest. Er hat kein
 *      requestAnimationFrame; die Bewegung haengt an einem Timer, und ein
 *      Timer, der mal 16 und mal 40 Millisekunden braucht, ruckelt sichtbar.
 *   2. Ob die eingebettete Anwendung waehrenddessen selbst weiterzeichnet —
 *      ihr rAF darf nicht stehenbleiben, waehrend ihr Rahmen verschoben wird.
 *   3. Ob die Ansicht am Ende wirklich dort *gemalt* ist, wo sie hinsollte.
 *      Dafuer wird der Bildschirm aufgenommen und die linke Kante der
 *      eingefaerbten Flaeche im Bild gesucht. Ohne diesen Teil pruefte der
 *      Test nur, dass Zahlen gesetzt wurden.
 *
 * Was er *nicht* beantworten kann: wie es aussieht. Unter Xvfb gibt es keinen
 * echten Compositor und kein vsync. Das Urteil faellt am Windows-Rechner.
 *
 *   xvfb-run -a electron scripts/proto-view-slide.cjs --no-sandbox
 */
const { app, BaseWindow, WebContentsView, desktopCapturer, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shell-proto-'));
app.setPath('userData', path.join(tmp, 'userData'));

const BREITE = 900;
const HOEHE = 600;
const SCHIENE = 56;
/** Aus @suite/motion: DAUER.ortswechsel. Hier als Zahl, das Skript laedt kein TypeScript. */
const DAUER = 220;
/** KURVEN.standard */
const KURVE = [0.4, 0, 0.2, 1];
/** Unverwechselbare Farbe, damit die Kante im Bildschirmfoto zu finden ist. */
const FARBE = { r: 255, g: 0, b: 255 };

function bezier([x1, y1, x2, y2]) {
  const b = (t, a, c) => {
    const u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * c + t * t * t;
  };
  const s = (t, a, c) => {
    const u = 1 - t;
    return 3 * u * u * a + 6 * u * t * (c - a) + 3 * t * t * (1 - c);
  };
  return (anteil) => {
    if (anteil <= 0) return 0;
    if (anteil >= 1) return 1;
    let t = anteil;
    for (let i = 0; i < 8; i++) {
      const ab = b(t, x1, x2) - anteil;
      if (Math.abs(ab) < 1e-6) return b(t, y1, y2);
      const d = s(t, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      t -= ab / d;
    }
    return b(t, y1, y2);
  };
}

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

function quantil(werte, q) {
  const sortiert = [...werte].sort((a, b) => a - b);
  return sortiert[Math.min(sortiert.length - 1, Math.floor(sortiert.length * q))];
}

/**
 * Sucht im Bildschirmfoto die linke Kante der eingefaerbten Flaeche.
 *
 * Gesucht wird in einer Bildzeile in der Mitte der Ansicht. Rueckgabe in
 * Bildpunkten des Fotos, nicht in Fensterkoordinaten — der Aufrufer rechnet
 * mit dem Massstab um.
 */
function linkeKante(bild) {
  const groesse = bild.getSize();
  const daten = bild.toBitmap(); // BGRA
  const y = Math.floor(groesse.height / 2);
  for (let x = 0; x < groesse.width; x++) {
    const i = (y * groesse.width + x) * 4;
    if (
      Math.abs(daten[i] - FARBE.b) < 12 &&
      Math.abs(daten[i + 1] - FARBE.g) < 12 &&
      Math.abs(daten[i + 2] - FARBE.r) < 12
    ) {
      return x;
    }
  }
  return -1;
}

async function bildschirm() {
  const { width, height } = screen.getPrimaryDisplay().size;
  const quellen = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height }
  });
  return quellen[0]?.thumbnail ?? null;
}

app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(async () => {
  const fenster = new BaseWindow({ width: BREITE, height: HOEHE, x: 0, y: 0, show: true });
  fenster.setBackgroundColor('#101216');

  const sicht = new WebContentsView({ webPreferences: { backgroundThrottling: false } });
  fenster.contentView.addChildView(sicht);
  const flaeche = { x: SCHIENE, y: 0, breite: BREITE - SCHIENE, hoehe: HOEHE };
  sicht.setBounds({ x: flaeche.x, y: 0, width: flaeche.breite, height: flaeche.hoehe });

  // Die Seite faerbt sich ein und zaehlt ihre eigenen Bilder mit. Bleibt ihr
  // rAF waehrend der Fahrt stehen, faellt das hier auf.
  await sicht.webContents.loadURL(
    'data:text/html,' +
      encodeURIComponent(`<!doctype html><meta charset="utf-8">
        <body style="margin:0;background:rgb(255,0,255)">
        <canvas id="c" width="700" height="600"></canvas>
        <script>
          window.__frames = [];
          window.__last = false;
          var g = document.getElementById('c').getContext('2d');
          (function tick(t){
            window.__frames.push(t);
            if (window.__last) {
              // Genug Arbeit, um ein Bild sichtbar zu fuellen, aber nicht so
              // viel, dass die Seite fuer sich schon ruckelt.
              for (var i = 0; i < 3000; i++) {
                g.fillStyle = 'rgb(255,0,255)';
                g.fillRect((i * 37) % 700, (i * 53) % 600, 8, 8);
              }
            }
            requestAnimationFrame(tick);
          })(0);
        </script>`)
  );
  await warte(600);

  const ergebnis = { fehler: [] };
  const pruefe = (bedingung, text) => {
    console.log(`  ${bedingung ? 'ok  ' : 'FEHL'} ${text}`);
    if (!bedingung) ergebnis.fehler.push(text);
  };

  // --- 3. Malt die Ansicht dort, wo sie soll? ------------------------------
  const foto = await bildschirm();
  if (!foto || foto.isEmpty()) {
    console.log('  --   Bildschirmaufnahme nicht verfuegbar, Teil 3 entfaellt');
  } else {
    const groesse = foto.getSize();
    const massstab = groesse.width / screen.getPrimaryDisplay().size.width;
    const gemessen = [];
    for (const x of [SCHIENE, 300, 600]) {
      sicht.setBounds({ x, y: 0, width: flaeche.breite, height: flaeche.hoehe });
      await warte(250);
      const b = await bildschirm();
      const kante = linkeKante(b);
      gemessen.push({ soll: x, ist: kante < 0 ? -1 : Math.round(kante / massstab) });
    }
    console.log('  Kanten:', JSON.stringify(gemessen));
    pruefe(
      gemessen.every((m) => m.ist >= 0 && Math.abs(m.ist - m.soll) <= 2),
      'die Ansicht wird dort gemalt, wo setBounds sie hinsetzt'
    );
    sicht.setBounds({ x: flaeche.x, y: 0, width: flaeche.breite, height: flaeche.hoehe });
    await warte(200);
  }

  // --- 1. + 2. Die Fahrt --------------------------------------------------
  const ease = bezier(KURVE);
  const von = BREITE;
  const nach = flaeche.x;

  /**
   * Faehrt die Ansicht einmal herein und misst dabei.
   *
   * Zweimal, mit und ohne Last in der eingebetteten Seite: eine leere Seite
   * beweist wenig. Interessant ist, ob der Timer des Hauptprozesses noch
   * gleichmaessig laeuft, waehrend die Anwendung selbst zeichnet.
   */
  async function fahrt(bezeichnung, last) {
    await sicht.webContents.executeJavaScript(
      `window.__last = ${last}; window.__frames.length = 0; true`
    );
    sicht.setBounds({ x: von, y: 0, width: flaeche.breite, height: flaeche.hoehe });
    await warte(300);

    const abstaende = [];
    const start = process.hrtime.bigint();
    let letzte = start;
    await new Promise((fertig) => {
      const schritt = () => {
        const jetzt = process.hrtime.bigint();
        abstaende.push(Number(jetzt - letzte) / 1e6);
        letzte = jetzt;
        const anteil = Number(jetzt - start) / 1e6 / DAUER;
        const x = Math.round(von + (nach - von) * ease(Math.min(1, anteil)));
        sicht.setBounds({ x, y: 0, width: flaeche.breite, height: flaeche.hoehe });
        if (anteil >= 1) fertig();
        else setTimeout(schritt, 16);
      };
      setTimeout(schritt, 16);
    });
    abstaende.shift(); // der erste Abstand misst die Wartezeit davor, nicht ein Bild

    const p50 = quantil(abstaende, 0.5);
    const p95 = quantil(abstaende, 0.95);
    const max = Math.max(...abstaende);
    const frames = await sicht.webContents.executeJavaScript('window.__frames.length');
    console.log(
      `  [${bezeichnung}] Bilder ${abstaende.length}, Abstand p50 ${p50.toFixed(
        1
      )}ms, p95 ${p95.toFixed(1)}ms, max ${max.toFixed(
        1
      )}ms; die Anwendung selbst zeichnete ${frames}`
    );
    pruefe(abstaende.length >= 10, `[${bezeichnung}] genug Bilder (>= 10 in ${DAUER}ms)`);
    pruefe(p95 < 24, `[${bezeichnung}] gleichmaessige Abstaende (p95 < 24ms)`);
    pruefe(max < 40, `[${bezeichnung}] kein Bild faellt aus (max < 40ms)`);
    pruefe(frames >= 5, `[${bezeichnung}] die eingebettete Anwendung zeichnet weiter`);
  }

  await fahrt('leere Seite', false);
  await fahrt('Seite unter Last', true);

  console.log(
    ergebnis.fehler.length === 0
      ? '\nPROTOTYP OK — die Fahrt laesst sich gleichmaessig treiben.'
      : `\nPROTOTYP MIT BEFUND (${ergebnis.fehler.length})`
  );
  app.exit(ergebnis.fehler.length === 0 ? 0 : 1);
});
