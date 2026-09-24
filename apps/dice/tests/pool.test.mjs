import test from 'node:test';
import assert from 'node:assert/strict';
import entry from '../dist/tests/entry.cjs';

const {
  setzeAnzahl,
  aendereAnzahl,
  anzahlGesamt,
  alsAusdruck,
  wuerfle,
  MAX_PRO_ART,
  MAX_MODIFIKATOR,
  begrenzeModifikator,
  leseAusdruck,
  MAX_EXPLOSIONEN
} = entry;

/** Liefert einen rng, der auf einem N-seitigen Wuerfel genau `augen` ergibt. */
function ergibt(seiten, augen) {
  return (augen - 1) / seiten + 1 / (seiten * 2);
}

// --- Anzahl setzen ---------------------------------------------------------

test('Null nimmt die Art aus dem Wurf, statt als 0 stehenzubleiben', () => {
  const mit = setzeAnzahl({}, 'd6', 3);
  assert.equal(mit.d6, 3);
  const ohne = setzeAnzahl(mit, 'd6', 0);
  assert.equal('d6' in ohne, false, 'sonst stuende d6 weiter im Ausdruck');
});

test('negative Anzahlen sind erlaubt', () => {
  assert.equal(setzeAnzahl({}, 'd4', -2).d4, -2);
});

test('die Anzahl bleibt in ihren Grenzen', () => {
  assert.equal(setzeAnzahl({}, 'd6', 9999).d6, MAX_PRO_ART);
  assert.equal(setzeAnzahl({}, 'd6', -9999).d6, -MAX_PRO_ART);
});

test('Bruchzahlen und Unsinn werden abgeschnitten', () => {
  assert.equal(setzeAnzahl({}, 'd6', 3.7).d6, 3);
  assert.equal('d6' in setzeAnzahl({}, 'd6', Number.NaN), false);
});

test('aendereAnzahl geht durch die Null hindurch', () => {
  let auswahl = setzeAnzahl({}, 'd4', 1);
  auswahl = aendereAnzahl(auswahl, 'd4', -1);
  assert.equal('d4' in auswahl, false, 'bei 0 faellt die Art heraus');
  auswahl = aendereAnzahl(auswahl, 'd4', -1);
  assert.equal(auswahl.d4, -1, 'weiter nach unten wird sie negativ');
});

test('anzahlGesamt zaehlt Abzugswuerfel mit', () => {
  assert.equal(anzahlGesamt({ d20: 3, d4: -2 }), 5);
});

// --- Ausdruck --------------------------------------------------------------

test('der Ausdruck sieht aus wie das, was man schreiben wuerde', () => {
  assert.equal(alsAusdruck({ d20: 3, d4: -2 }, 6, 5), '3d20 - 2d4 + 5');
  assert.equal(alsAusdruck({ d6: 2 }, 6, 0), '2d6');
  assert.equal(alsAusdruck({ d6: 2 }, 6, -1), '2d6 - 1');
});

// Ohne den Sonderfall stuende „+3d20 - 2d4" da, was niemand so schreibt.
test('das erste Glied traegt kein Pluszeichen', () => {
  assert.equal(alsAusdruck({ d20: 3 }, 6, 0).startsWith('+'), false);
});

test('faengt der Wurf mit einem Abzug an, steht das Minus vorn', () => {
  assert.equal(alsAusdruck({ d4: -2 }, 6, 0), '-2d4');
});

// Sonst hiesse ein Wurf aus 3d20 und -2d4 „-2d4 + 3d20" — dieselbe Rechnung,
// und sie liest sich wie ein Fehler.
test('was dazugezaehlt wird, steht vorn — unabhaengig von der Wuerfelart', () => {
  assert.equal(alsAusdruck({ d4: -2, d20: 3 }, 6, 0), '3d20 - 2d4');
  assert.equal(alsAusdruck({ d20: -1, d4: 2 }, 6, 0), '2d4 - 1d20');
});

// Die abgebildeten Wuerfel stehen in derselben Folge wie der Ausdruck
// darueber — sonst sucht man beim Nachrechnen die falsche Zahl.
test('die Wuerfel fallen in der Reihenfolge des Ausdrucks', () => {
  const wurf = wuerfle({ d4: -1, d20: 1 }, 6, 0, () => 0.5);
  assert.equal(wurf.wuerfe[0].art, 'd20');
  assert.equal(wurf.wuerfe[1].art, 'd4');
});

test('der eigene Wuerfel traegt seine Seitenzahl', () => {
  assert.equal(alsAusdruck({ custom: 2 }, 7, 0), '2d7');
});

test('eine leere Auswahl ergibt einen leeren Ausdruck', () => {
  assert.equal(alsAusdruck({}, 6, 5), '');
});

// --- Wuerfeln --------------------------------------------------------------

test('Abzugswuerfel werden von der Summe abgezogen', () => {
  // 1d20 ergibt 15, 1d4 ergibt 3 -> 15 - 3 + 2 = 14
  const werte = [ergibt(20, 15), ergibt(4, 3)];
  let i = 0;
  const wurf = wuerfle({ d20: 1, d4: -1 }, 6, 2, () => werte[i++]);
  assert.equal(wurf.summe, 14);
  assert.equal(wurf.wuerfe[0].zaehltPositiv, true);
  assert.equal(wurf.wuerfe[1].zaehltPositiv, false);
});

test('der Hoechstwurf wird erkannt', () => {
  const wurf = wuerfle({ d20: 1 }, 6, 0, () => ergibt(20, 20));
  assert.equal(wurf.wuerfe[0].istHoechst, true);
  assert.equal(wurf.wuerfe[0].istTiefst, false);
});

test('die Eins wird erkannt', () => {
  const wurf = wuerfle({ d20: 1 }, 6, 0, () => ergibt(20, 1));
  assert.equal(wurf.wuerfe[0].istTiefst, true);
});

// Eine 4 auf dem d4 in „1d20 - 1d4" ist die hoechste Zahl, aber fuer den Wurf
// das schlechteste Ergebnis. Sie zu feiern waere verwirrend.
test('Abzugswuerfel bekommen weder Hoechst- noch Tiefstwurf angerechnet', () => {
  const hoch = wuerfle({ d4: -1 }, 6, 0, () => ergibt(4, 4));
  assert.equal(hoch.wuerfe[0].istHoechst, false);
  const tief = wuerfle({ d4: -1 }, 6, 0, () => ergibt(4, 1));
  assert.equal(tief.wuerfe[0].istTiefst, false);
});

test('beim eigenen Wuerfel gilt seine Seitenzahl als Hoechstwurf', () => {
  const wurf = wuerfle({ custom: 1 }, 7, 0, () => ergibt(7, 7));
  assert.equal(wurf.wuerfe[0].seiten, 7);
  assert.equal(wurf.wuerfe[0].istHoechst, true);
});

test('ein gemischter Pool wirft alle Wuerfel', () => {
  const wurf = wuerfle({ d6: 3, d20: 1, d4: -2 }, 6, 0, () => 0.5);
  assert.equal(wurf.wuerfe.length, 6);
});

test('nur der Modifikator ohne Wuerfel ergibt genau ihn', () => {
  const wurf = wuerfle({}, 6, 5, () => 0.5);
  assert.equal(wurf.summe, 5);
  assert.equal(wurf.wuerfe.length, 0);
});

// --- Modifikator -----------------------------------------------------------

test('der Modifikator wird begrenzt', () => {
  // Ohne Grenze liess sich „999999999" eintippen. Die Zahl stand dann im
  // Ausdruck und in der Summe und machte jede Wuerfelzahl daneben unlesbar.
  assert.equal(begrenzeModifikator(999999999), MAX_MODIFIKATOR);
  assert.equal(begrenzeModifikator(-999999999), -MAX_MODIFIKATOR);
  assert.equal(begrenzeModifikator(MAX_MODIFIKATOR), MAX_MODIFIKATOR);
});

test('der Modifikator nimmt nur ganze Zahlen', () => {
  assert.equal(begrenzeModifikator(3.9), 3);
  assert.equal(begrenzeModifikator(-3.9), -3);
  assert.equal(begrenzeModifikator(Number.NaN), 0);
  assert.equal(begrenzeModifikator(Number.POSITIVE_INFINITY), 0);
});


/** Ein rng, der der Reihe nach die gegebenen Augen auf N Seiten liefert. */
function folge(seiten, ...augen) {
  let i = 0;
  return () => ergibt(seiten, augen[i++ % augen.length]);
}

test('Vorteil und Nachteil: zwei W20, einer zaehlt, der andere liegt verworfen da', () => {
  const vorteil = wuerfle({ d20: 1 }, 6, 0, folge(20, 5, 17), { vorteil: 'vorteil' });
  assert.equal(vorteil.summe, 17);
  assert.deepEqual(vorteil.wuerfe.map((w) => [w.augen, Boolean(w.verworfen)]), [[5, true], [17, false]]);
  const nachteil = wuerfle({ d20: 1 }, 6, 2, folge(20, 5, 17), { vorteil: 'nachteil' });
  assert.equal(nachteil.summe, 7);
  // Andere Wuerfel bleiben einfach.
  const gemischt = wuerfle({ d20: 1, d6: 1 }, 6, 0, folge(20, 10, 12, 20), { vorteil: 'vorteil' });
  assert.equal(gemischt.wuerfe.length, 3);
});

test('hoechste N behalten: 4d6, die drei hoechsten zaehlen', () => {
  const wurf = wuerfle({ d6: 4 }, 6, 0, folge(6, 3, 1, 6, 4), { behalte: 3 });
  assert.equal(wurf.summe, 13);
  assert.equal(wurf.wuerfe.filter((w) => w.verworfen).length, 1);
  assert.equal(wurf.wuerfe.find((w) => w.verworfen).augen, 1);
});

test('explodierend: eine Hoechstzahl wuerfelt nach, mit Deckel', () => {
  const wurf = wuerfle({ d6: 1 }, 6, 0, folge(6, 6, 6, 2), { explodiert: true });
  assert.equal(wurf.summe, 14);
  assert.equal(wurf.wuerfe.filter((w) => w.nachgelegt).length, 2);
  const immer = wuerfle({ d4: 1 }, 6, 0, folge(4, 4), { explodiert: true });
  assert.equal(immer.wuerfe.length, 1 + MAX_EXPLOSIONEN);
});

test('ein getippter Ausdruck wird zur Auswahl', () => {
  assert.deepEqual(leseAusdruck('2d6+3'), { auswahl: { d6: 2 }, modifikator: 3 });
  assert.deepEqual(leseAusdruck('1W20 - 1W4'), { auswahl: { d20: 1, d4: -1 }, modifikator: 0 });
  assert.deepEqual(leseAusdruck('d%'), { auswahl: { d100: 1 }, modifikator: 0 });
  assert.deepEqual(leseAusdruck('3d7 + 2d7 - 1'), { auswahl: { custom: 5 }, modifikator: -1, eigeneSeiten: 7 });
  assert.equal(leseAusdruck('3d7 + 1d9'), null);
  assert.equal(leseAusdruck('hallo'), null);
  assert.equal(leseAusdruck(''), null);
});
