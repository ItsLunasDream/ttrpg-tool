/**
 * Der Erzeuger.
 *
 * Die wichtigste Pruefung steht ganz unten: was hier herauskommt, muss die
 * eigene Pruefung bestehen — auf jedem Grad, in jeder Rolle, ueber viele
 * Wuerfe. Ein Erzeuger, dessen Monster das eigene Werkzeug beanstandet,
 * waere ein schlechter Witz.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

/** Gesaeter Zufall: derselbe Startwert gibt denselben Ablauf. */
function wuerfelgeber(saat) {
  let zustand = saat >>> 0;
  return () => {
    zustand = (zustand * 1664525 + 1013904223) >>> 0;
    return zustand / 4294967296;
  };
}

test('dieselbe Saat gibt dasselbe Monster', () => {
  const a = T.erzeugeMonster({ cr: '5' }, 'de', wuerfelgeber(7));
  const b = T.erzeugeMonster({ cr: '5' }, 'de', wuerfelgeber(7));
  assert.deepEqual(a, b);
});

test('verschiedene Saaten geben verschiedene Monster', () => {
  const namen = new Set();
  for (let saat = 0; saat < 40; saat += 1) {
    namen.add(T.erzeugeMonster({ cr: '5' }, 'de', wuerfelgeber(saat)).name);
  }
  // Nicht alle verschieden — bei zehn Themen mal 64 Namen kommt ein
  // Doppelter vor —, aber auch nicht immer derselbe.
  assert.ok(namen.size > 25, `nur ${namen.size} verschiedene Namen aus 40 Wuerfen`);
});

test('Wuensche werden befolgt', () => {
  const m = T.erzeugeMonster({ cr: '8', themaId: 'untot', rolleId: 'schuetze' }, 'de', wuerfelgeber(3));
  assert.equal(m.cr, '8');
  assert.equal(m.themaId, 'untot');
  assert.equal(m.rolleId, 'schuetze');
});

test('ein zusammengesetzter Name passt zur Sprache', () => {
  // Fest gewuerfelt, damit wirklich die Zusammensetzung geprueft wird: seit
  // es Einzelnamen gibt („Wiedergänger", „Revenant"), sagt ein Leerzeichen
  // allein nichts mehr ueber die Sprache.
  const immerZusammengesetzt = () => 0.5;
  const untot = T.THEMEN.find((t) => t.id === 'untot');
  const de = T.baueNamen(untot, 'de', immerZusammengesetzt);
  const en = T.baueNamen(untot, 'en', immerZusammengesetzt);
  assert.ok(!de.includes(' '), `„${de}" hat ein Leerzeichen`);
  assert.ok(en.includes(' '), `„${en}" hat keins`);
});

test('die Rolle verschiebt gegenlaeufig, nicht nach oben', () => {
  /*
   * Der Kern der Rollen: ein Schuetze hat weniger Trefferpunkte UND mehr
   * Schaden. Verschoebe die Rolle nur in eine Richtung, waere sie ein
   * Regler fuer „staerker", und der Grad stimmte nicht mehr.
   */
  const rng = wuerfelgeber(5);
  const ziel = T.richtwert('7');
  const schuetze = T.werteFuer(ziel, T.ROLLEN.find((r) => r.id === 'schuetze'), wuerfelgeber(5));
  const brecher = T.werteFuer(ziel, T.ROLLEN.find((r) => r.id === 'brecher'), wuerfelgeber(5));
  void rng;
  assert.ok(schuetze.tp < brecher.tp, 'der Schuetze ist nicht zaeher als der Brecher');
  assert.ok(schuetze.schadenProRunde > brecher.schadenProRunde, 'und teilt nicht mehr aus');
});

test('die Anzahl der Faehigkeiten waechst mit dem Grad und bleibt lesbar', () => {
  // Frueher war bei drei Schluss, auch auf Grad 30. Ein Endgegner mit drei
  // Faehigkeiten ist keiner; acht liest am Tisch aber auch niemand.
  const anzahl = (cr) => T.erzeugeMonster({ cr }, 'de', wuerfelgeber(17)).faehigkeiten.length;
  for (const cr of ['0', '1', '5', '12', '20', '30']) {
    assert.ok(anzahl(cr) >= 1 && anzahl(cr) <= 8, `CR ${cr}: ${anzahl(cr)}`);
  }
  assert.ok(anzahl('30') > anzahl('1'), 'Grad 30 hat nicht mehr als Grad 1');
});

test('keine Faehigkeit doppelt', () => {
  for (let saat = 0; saat < 30; saat += 1) {
    const m = T.erzeugeMonster({ cr: '10' }, 'de', wuerfelgeber(saat));
    const namen = m.faehigkeiten.map((f) => f.name);
    assert.equal(new Set(namen).size, namen.length, `Saat ${saat}: ${namen.join(', ')}`);
  }
});

test('einzelne Felder lassen sich neu wuerfeln, der Rest bleibt', () => {
  const m = T.erzeugeMonster({ cr: '6' }, 'de', wuerfelgeber(21));
  const neu = T.wuerfleNeu(m, 'name', 'de', wuerfelgeber(99));
  assert.notEqual(neu.name, m.name);
  assert.equal(neu.cr, m.cr);
  assert.deepEqual(neu.werte, m.werte);
  assert.deepEqual(neu.faehigkeiten, m.faehigkeiten);
});

test('eine Variante behaelt die Prosa und wechselt die Zahlen', () => {
  const m = T.erzeugeMonster({ cr: '3', themaId: 'humanoid' }, 'de', wuerfelgeber(4));
  const hoeher = T.alsVariante(m, '7', wuerfelgeber(4));
  assert.equal(hoeher.name, m.name);
  assert.deepEqual(hoeher.faehigkeiten, m.faehigkeiten);
  assert.equal(hoeher.cr, '7');
  assert.ok(hoeher.werte.tp > m.werte.tp);
  assert.ok(hoeher.werte.schadenProRunde > m.werte.schadenProRunde);
});

test('und die Variante besteht die Pruefung auf ihrem neuen Grad', () => {
  const m = T.erzeugeMonster({ cr: '2' }, 'de', wuerfelgeber(8));
  for (const cr of ['1/2', '5', '11', '18']) {
    const variante = T.alsVariante(m, cr, wuerfelgeber(8));
    assert.equal(T.pruefe(variante.werte, cr).urteil, 'passt', `Variante CR ${cr}`);
  }
});

test('JEDES erzeugte Monster besteht die eigene Pruefung', () => {
  /*
   * Der Test, wegen dem der Erzeuger so gebaut ist, wie er gebaut ist.
   * Alle Grade, alle Rollen, dreissig Wuerfe je Kombination — das sind
   * einige tausend Monster, und keines darf durchfallen.
   */
  const durchgefallen = [];
  for (const eintrag of T.RICHTWERTE) {
    for (const rolle of T.ROLLEN) {
      for (let saat = 0; saat < 30; saat += 1) {
        const m = T.erzeugeMonster({ cr: eintrag.cr, rolleId: rolle.id }, 'de', wuerfelgeber(saat));
        const befund = T.pruefe(m.werte, m.cr);
        if (befund.urteil !== 'passt') {
          durchgefallen.push(
            `CR ${eintrag.cr} ${rolle.id} Saat ${saat}: gerechnet CR ${befund.cr} (${befund.urteil})`
          );
        }
      }
    }
  }
  assert.deepEqual(durchgefallen.slice(0, 5), [], `${durchgefallen.length} durchgefallen. Erste: ${durchgefallen.slice(0, 5).join(' | ')}`);
});

test('auch mit legendaeren Aktionen bleibt es stimmig', () => {
  const durchgefallen = [];
  for (const cr of ['5', '10', '15', '20']) {
    for (let saat = 0; saat < 20; saat += 1) {
      const m = T.erzeugeMonster({ cr, legendaer: true }, 'de', wuerfelgeber(saat));
      if (!T.istStimmig(m)) durchgefallen.push(`CR ${cr} Saat ${saat}`);
    }
  }
  assert.deepEqual(durchgefallen.slice(0, 5), [], `${durchgefallen.length} durchgefallen`);
});

test('die Rollen sind auf dem Steckbrief zu erkennen', () => {
  /*
   * Der Test, den es vorher nicht gab — und der zwei Dinge gefunden hat.
   *
   * Erstens einen echten Fehler: der Verteidiger bekam +2 Ruestungsklasse,
   * das sind in der Pruefung rund zwanzig Prozent wirksame Trefferpunkte,
   * und damit sein Grad stimmte, wurden die rohen Trefferpunkte
   * heruntergerechnet. Er stand mit WENIGER Trefferpunkten da als der
   * Schuetze. Rechnerisch richtig, auf dem Steckbrief offensichtlich falsch.
   *
   * Zweitens eine falsche Erwartung von mir: „der Verteidiger hat deutlich
   * mehr rohe Trefferpunkte" laesst sich bei gleichem Grad gar nicht
   * einloesen. Die Trefferpunkt-Spalte der Quelle ist im mittleren Bereich
   * flach — von CR 8 auf 12 steigt sie um 29 Prozent, der Schaden um 45 —,
   * also traegt sie die Rolle nicht. Wer es erzwingen wollte, muesste den
   * Grad verfehlen, und der ist der ganze Zweck des Werkzeugs.
   *
   * Geprueft wird deshalb, was das Modell wirklich hergibt: die WIRKSAME
   * Verteidigung (Trefferpunkte mal Ruestung) und der Schaden. Und dass die
   * rohen Trefferpunkte des Verteidigers nicht unter denen des Schuetzen
   * liegen — das war der eigentliche Fehler.
   */
  const mittel = (cr, rolleId, was) => {
    let summe = 0;
    for (let saat = 0; saat < 50; saat += 1) {
      const m = T.erzeugeMonster({ cr, rolleId }, 'de', wuerfelgeber(saat));
      const ziel = T.richtwert(cr);
      summe +=
        was === 'wirksam'
          ? T.wirksameTp(m.werte, ziel)
          : was === 'tp'
            ? m.werte.tp
            : m.werte.schadenProRunde;
    }
    return summe / 50;
  };

  for (const cr of ['5', '10', '15']) {
    const vWirksam = mittel(cr, 'verteidiger', 'wirksam');
    const sWirksam = mittel(cr, 'schuetze', 'wirksam');
    assert.ok(
      vWirksam > sWirksam * 1.15,
      `CR ${cr}: Verteidiger haelt ${vWirksam.toFixed(0)} aus, Schuetze ${sWirksam.toFixed(0)}`
    );

    const sSchaden = mittel(cr, 'schuetze', 'schaden');
    const vSchaden = mittel(cr, 'verteidiger', 'schaden');
    assert.ok(
      sSchaden > vSchaden * 1.15,
      `CR ${cr}: Schuetze teilt ${sSchaden.toFixed(0)} aus, Verteidiger ${vSchaden.toFixed(0)}`
    );

    // Und der Fehler von vorhin, der nie wiederkommen soll.
    const vTp = mittel(cr, 'verteidiger', 'tp');
    const sTp = mittel(cr, 'schuetze', 'tp');
    assert.ok(
      vTp >= sTp * 0.98,
      `CR ${cr}: der Verteidiger hat weniger rohe Trefferpunkte (${vTp.toFixed(0)}) als der Schuetze (${sTp.toFixed(0)})`
    );
  }
});

test('kein Rollenaufschlag auf die Ruestungsklasse ueber einen Punkt hinaus', () => {
  // Mehr als ein Punkt frisst die ganze Verschiebung auf, siehe oben.
  for (const rolle of T.ROLLEN) {
    assert.ok(Math.abs(rolle.rk) <= 1, `${rolle.id}: ${rolle.rk}`);
  }
});

test('ein eigener Zustand wird als Faehigkeit eingebaut, hoechstens einer', () => {
  const monster = T.erzeugeMonster({ cr: '5' }, 'de', wuerfelgeber(4));
  const eins = T.mitEigenemZustand(monster, 'Trockenfieber', 'de');
  const zwei = T.mitEigenemZustand(eins, 'Frostbiss', 'de');
  const eigene = zwei.faehigkeiten.filter((f) => f.eigenerZustand);
  assert.equal(eigene.length, 1);
  assert.equal(eigene[0].name, 'Frostbiss');
  assert.match(eigene[0].text, /SG \d+/);
  assert.equal(zwei.werte.schadenProRunde, monster.werte.schadenProRunde);
});
