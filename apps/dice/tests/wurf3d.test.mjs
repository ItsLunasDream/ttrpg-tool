import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {
  wirf,
  koerperVorrat,
  abgeleseneFlaeche,
  setzeErgebnisAufFlaeche,
  pruefeUmnummerierung,
  baueKoerper,
  gegenueberliegende,
  ordneZiffernZu,
  SEITEN,
  TISCH
} = entry;

/** Ein Zufallsgeber, der immer dieselbe Folge liefert. */
function festerZufall(saat = 1) {
  let zustand = saat;
  return () => {
    zustand = (zustand * 1103515245 + 12345) % 2147483648;
    return zustand / 2147483648;
  };
}

const ARTEN = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

// --- Umnummerieren ---------------------------------------------------------

test('das Ergebnis landet auf der gewuenschten Flaeche', () => {
  for (const art of ARTEN) {
    const seiten = SEITEN[art];
    const gegen = gegenueberliegende(baueKoerper(art).flaechen);
    const grund = ordneZiffernZu(seiten, gegen);
    for (let flaeche = 0; flaeche < seiten; flaeche++) {
      for (const ergebnis of [1, Math.ceil(seiten / 2), seiten]) {
        const neu = setzeErgebnisAufFlaeche(grund, gegen, flaeche, ergebnis);
        assert.equal(neu[flaeche], ergebnis, `${art}: Flaeche ${flaeche} sollte ${ergebnis} tragen`);
      }
    }
  }
});

test('das Umnummerieren zerreisst die Regeln nicht', () => {
  // Ein einfacher Tausch zweier Ziffern wuerde die Regel der
  // gegenueberliegenden Flaechen brechen: der Wuerfel saehe bei genauem
  // Hinsehen falsch aus, ohne dass das Ergebnis falsch waere.
  for (const art of ARTEN) {
    const seiten = SEITEN[art];
    const gegen = gegenueberliegende(baueKoerper(art).flaechen);
    const grund = ordneZiffernZu(seiten, gegen);
    for (let flaeche = 0; flaeche < seiten; flaeche++) {
      for (let ergebnis = 1; ergebnis <= seiten; ergebnis++) {
        const neu = setzeErgebnisAufFlaeche(grund, gegen, flaeche, ergebnis);
        const klagen = pruefeUmnummerierung(seiten, neu, gegen);
        assert.deepEqual(klagen, [], `${art}, Flaeche ${flaeche}, Ergebnis ${ergebnis}: ${klagen.join('; ')}`);
      }
    }
  }
});

// --- Der ganze Wurf --------------------------------------------------------

test('nach dem Wurf traegt die obere Flaeche das Ergebnis', () => {
  const vorrat = koerperVorrat();
  const einwuerfe = [
    { art: 'd20', augen: 17 },
    { art: 'd6', augen: 2 },
    { art: 'd10', augen: 10 },
    { art: 'd12', augen: 1 },
    { art: 'd8', augen: 5 },
    { art: 'd4', augen: 3 }
  ];
  const ergebnis = wirf(einwuerfe, vorrat, festerZufall(7));

  for (const [nummer, wuerfel] of ergebnis.entries()) {
    const koerper = vorrat(wuerfel.art);
    const gegen = gegenueberliegende(koerper.flaechen);
    const klagen = pruefeUmnummerierung(SEITEN[wuerfel.art], wuerfel.ziffern, gegen);
    assert.deepEqual(klagen, [], `${wuerfel.art}: ${klagen.join('; ')}`);

    // Die scharfe Pruefung: nicht dass die Zahl irgendwo steht, sondern dass
    // sie dort steht, wo man sie abliest. Der erste Anlauf prueft nur das
    // Vorkommen und blieb deshalb auch dann gruen, wenn die Umnummerierung
    // die falsche Flaeche traf.
    const gelesen = wuerfel.ziffern[abgeleseneFlaeche(koerper, wuerfel.art, wuerfel.endlage.drehung)];
    assert.equal(
      gelesen,
      einwuerfe[nummer].augen,
      `${wuerfel.art}: oben liegt ${gelesen}, gewuerfelt war ${einwuerfe[nummer].augen}`
    );
  }
});

test('alle Wuerfel kommen zur Ruhe und bleiben im Bereich', () => {
  const vorrat = koerperVorrat();
  const einwuerfe = Array.from({ length: 20 }, (_, i) => ({
    art: ARTEN[i % ARTEN.length],
    augen: 1
  }));
  const ergebnis = wirf(einwuerfe, vorrat, festerZufall(3));

  for (const wuerfel of ergebnis) {
    // Zur Ruhe gekommen heisst: die letzten Lagen unterscheiden sich kaum
    // noch. Auf exakte Endlagen zu pruefen waere falsch — Physik ist ueber
    // Plattformen hinweg nicht bitgenau.
    const bahn = wuerfel.bahn;
    const vorletzte = bahn[bahn.length - 2] ?? bahn[0];
    const weg = wuerfel.endlage.position.distanceTo(vorletzte.position);
    assert.ok(weg < 0.05, `${wuerfel.art} bewegt sich am Ende noch um ${weg.toFixed(3)}`);

    const p = wuerfel.endlage.position;
    // Der Bereich ist auf den Bildausschnitt abgestimmt; ein Wuerfel
    // dahinter waere geworfen, aber nicht zu sehen. Etwas Luft fuer die
    // halbe Kantenlaenge.
    assert.ok(
      Math.abs(p.x) < TISCH + 1 && Math.abs(p.z) < TISCH + 1,
      `${wuerfel.art} liegt ausserhalb des Bildes: ${p.x.toFixed(2)}, ${p.z.toFixed(2)}`
    );
    assert.ok(p.y > -1, `${wuerfel.art} ist durch den Boden gefallen: y=${p.y}`);
  }
});

test('die Kugeln kommen ebenfalls zur Ruhe', () => {
  // Eine Kugel rollt ohne Rollreibung endlos. cannon-es kennt keine, die
  // Daempfung der Drehung muss die Arbeit tun — im Vorversuch rollte sie
  // sonst 8,2 Sekunden.
  const vorrat = koerperVorrat();
  const ergebnis = wirf(
    [
      { art: 'd100', augen: 73 },
      { art: 'custom', augen: 2 }
    ],
    vorrat,
    festerZufall(11)
  );
  for (const kugel of ergebnis) {
    assert.equal(kugel.ziffern.length, 0, 'Kugeln tragen keine Beschriftung');
    const bahn = kugel.bahn;
    assert.ok(bahn.length < 900, `${kugel.art} kam nicht zur Ruhe (${bahn.length} Schritte)`);
  }
});

test('derselbe Zufall ergibt dieselbe Bahn', () => {
  // Der Wurf muss wiederholbar sein, sonst laesst sich nichts davon pruefen.
  const einwuerfe = [{ art: 'd20', augen: 20 }];
  const eins = wirf(einwuerfe, koerperVorrat(), festerZufall(5));
  const zwei = wirf(einwuerfe, koerperVorrat(), festerZufall(5));
  assert.equal(eins[0].bahn.length, zwei[0].bahn.length);
  assert.ok(eins[0].endlage.position.distanceTo(zwei[0].endlage.position) < 1e-6);
});
