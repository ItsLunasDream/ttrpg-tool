/**
 * Der Erzeuger.
 *
 * Der Anspruch ist derselbe wie beim Monster Creator: was hier herauskommt,
 * muss die eigene Pruefung bestehen. Ein Werkzeug, das an seinen eigenen
 * Ergebnissen herummeckert, glaubt einem niemand.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function wuerfelgeber(saat) {
  let z = saat >>> 0;
  const zieh = () => {
    z = (z * 1664525 + 1013904223) >>> 0;
    return z / 4294967296;
  };
  // Warmlaufen: der erste Wurf haengt fast linear von der Saat ab.
  for (let i = 0; i < 5; i += 1) zieh();
  return zieh;
}

test('JEDER erzeugte Zustand besteht die eigene Pruefung', () => {
  const daneben = [];
  for (const art of T.ARTEN) {
    for (const thema of T.THEMEN) {
      for (const haerte of T.HAERTEN) {
        for (const stufen of [1, 3, 5]) {
          for (let saat = 1; saat <= 3; saat += 1) {
            const zustand = T.erzeugeZustand(
              { artId: art.id, themaId: thema.id, haerteId: haerte.id, stufen },
              'de',
              wuerfelgeber(saat)
            );
            const befund = T.pruefeZustand(zustand);
            if (befund.urteil === 'kaputt') {
              daneben.push(
                `${art.id}/${thema.id}/${haerte.id}/${stufen} Saat ${saat}: ${befund.flacheStufen.join()} ${befund.doppelte.join()}`
              );
            }
          }
        }
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} kaputt`);
});

test('jede Stufe wird schlimmer als die davor', () => {
  for (const haerte of T.HAERTEN) {
    for (let saat = 1; saat <= 20; saat += 1) {
      const zustand = T.erzeugeZustand({ haerteId: haerte.id, stufen: 5 }, 'de', wuerfelgeber(saat));
      const befund = T.pruefeZustand(zustand);
      assert.deepEqual(befund.flacheStufen, [], `${haerte.id} Saat ${saat}`);
      // Auf dem Betrag: ein Segen waechst ins Negative und wird dabei
      // staerker, nicht schwaecher.
      for (let i = 1; i < befund.kurve.length; i += 1) {
        assert.ok(
          Math.abs(befund.kurve[i]) > Math.abs(befund.kurve[i - 1]),
          `${haerte.id} Saat ${saat} Stufe ${i + 1}`
        );
      }
    }
  }
});

test('keine Wirkung kommt zweimal vor', () => {
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ stufen: 5 }, 'de', wuerfelgeber(saat));
    const alle = zustand.stufen.flatMap((s) => s.wirkungen);
    assert.equal(new Set(alle).size, alle.length, `Saat ${saat}`);
  }
});

test('die erste Stufe macht nicht gleich handlungsunfaehig', () => {
  // Ein Zustand, der auf Stufe 1 schon alles nimmt, hat keine Stufen,
  // sondern einen Schalter.
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ haerteId: 'toedlich', stufen: 5 }, 'de', wuerfelgeber(saat));
    for (const id of zustand.stufen[0].wirkungen) {
      assert.notEqual(T.wirkung(id).schwere, 'toedlich', `Saat ${saat}`);
    }
  }
});

test('die Haerte deckelt, wie schlimm es wird', () => {
  for (let saat = 1; saat <= 30; saat += 1) {
    const laestig = T.erzeugeZustand({ haerteId: 'laestig', stufen: 3 }, 'de', wuerfelgeber(saat));
    const toedlich = T.erzeugeZustand({ haerteId: 'toedlich', stufen: 3 }, 'de', wuerfelgeber(saat));
    // Verglichen wird der Betrag: ein Segen wiegt negativ und ist trotzdem
    // schwer.
    const leicht = T.betragVon(T.gesamtgewicht(laestig.stufen));
    const schwer = T.betragVon(T.gesamtgewicht(toedlich.stufen));
    assert.ok(leicht < schwer, `Saat ${saat}: ${leicht} / ${schwer}`);
  }
});

test('ein Zustand ohne Stufen hat genau eine', () => {
  const zustand = T.erzeugeZustand({ stufen: 1 }, 'de', wuerfelgeber(4));
  assert.equal(zustand.stufen.length, 1);
});

test('„gemischt" liefert wirklich beides', () => {
  let mitBeidem = 0;
  for (let saat = 1; saat <= 30; saat += 1) {
    const zustand = T.erzeugeZustand(
      { wirkrichtung: 'gemischt', stufen: 4 },
      'de',
      wuerfelgeber(saat)
    );
    const richtungen = new Set(
      zustand.stufen.flatMap((s) => s.wirkungen).map((id) => T.wirkung(id).richtung)
    );
    if (richtungen.has('buff') && richtungen.has('debuff')) mitBeidem += 1;
  }
  assert.ok(mitBeidem >= 25, `nur ${mitBeidem} von 30 haben beides`);
});

test('„buff" liefert keine Debuffs', () => {
  for (let saat = 1; saat <= 30; saat += 1) {
    const zustand = T.erzeugeZustand({ wirkrichtung: 'buff', stufen: 3 }, 'de', wuerfelgeber(saat));
    for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) {
      assert.equal(T.wirkung(id).richtung, 'buff', `Saat ${saat}`);
    }
  }
});

test('das Thema faerbt ab, ohne alles zu bestimmen', () => {
  // Kaelte greift eher Bewegung und Koerper an. Nicht immer — dann waere die
  // Liste zu kurz —, aber oefter als der Zufall.
  const kaelte = new Set();
  for (let saat = 1; saat <= 40; saat += 1) {
    const zustand = T.erzeugeZustand({ themaId: 'kaelte', stufen: 4 }, 'de', wuerfelgeber(saat));
    for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) kaelte.add(T.wirkung(id).spur);
  }
  assert.ok(kaelte.has('bewegung') || kaelte.has('koerper'), 'keine passende Spur dabei');
});

test('die Namen wiederholen sich nicht bei jedem Wurf', () => {
  for (const thema of T.THEMEN) {
    const namen = new Set();
    for (let saat = 1; saat <= 60; saat += 1) namen.add(T.baueNamen(thema, 'de', wuerfelgeber(saat)));
    assert.ok(namen.size >= 25, `${thema.id}: nur ${namen.size} aus 60`);
  }
});

test('der Kurzsatz ist ein Satz und kein Absatz', () => {
  for (const thema of T.THEMEN) {
    const satz = T.baueKurzsatz(thema, 'de', wuerfelgeber(9));
    assert.ok(satz.endsWith('.'), satz);
    assert.ok(satz.length < 90, `zu lang: ${satz}`);
  }
});

test('der Kurzsatz sieht nach fuenfzig Wuerfen nicht immer gleich aus', () => {
  const saetze = new Set();
  for (let saat = 1; saat <= 50; saat += 1) {
    saetze.add(T.baueKurzsatz(T.THEMEN[0], 'de', wuerfelgeber(saat)));
  }
  assert.ok(saetze.size >= 20, `nur ${saetze.size} verschiedene aus 50`);
});

test('ein Ausloeser ist die Ausnahme, ausser bei der Art Umgebung', () => {
  const zaehle = (artId) => {
    let mit = 0;
    for (let saat = 1; saat <= 40; saat += 1) {
      const zustand = T.erzeugeZustand({ artId }, 'de', wuerfelgeber(saat));
      if (zustand.ausloeser !== '') mit += 1;
    }
    return mit;
  };
  assert.ok(zaehle('umgebung') > 28, `Umgebung nur ${zaehle('umgebung')} von 40`);
  assert.ok(zaehle('fluch') < 20, `Fluch schon ${zaehle('fluch')} von 40`);
});

test('ein Segen ist von sich aus ein Buff', () => {
  const zustand = T.erzeugeZustand({ artId: 'segen' }, 'de', wuerfelgeber(3));
  assert.equal(zustand.wirkrichtung, 'buff');
});

test('jeder Zustand bekommt ein Zeichen und eine Farbe fuer den Tracker', () => {
  for (let saat = 1; saat <= 20; saat += 1) {
    const zustand = T.erzeugeZustand({}, 'de', wuerfelgeber(saat));
    assert.ok(zustand.zeichen.length > 0);
    assert.match(zustand.farbe, /^#[0-9a-f]{6}$/i);
  }
});

test('nachwuerfeln laesst den Rest stehen', () => {
  const vorher = T.erzeugeZustand({ themaId: 'kaelte', stufen: 3 }, 'de', wuerfelgeber(5));
  // Ueber mehrere Saaten: derselbe Name kann zufaellig noch einmal fallen.
  const namen = new Set();
  for (let saat = 1; saat <= 10; saat += 1) {
    namen.add(T.wuerfleNeu(vorher, 'name', 'de', wuerfelgeber(saat)).name);
  }
  assert.ok(namen.size > 1, 'der Name aendert sich nie');
  const nachher = T.wuerfleNeu(vorher, 'name', 'de', wuerfelgeber(6));
  assert.equal(nachher.kurzsatz, vorher.kurzsatz);
  assert.deepEqual(nachher.stufen, vorher.stufen);
});

test('neu gewuerfelte Stufen behalten ihre Anzahl und bleiben heil', () => {
  const vorher = T.erzeugeZustand({ stufen: 5 }, 'de', wuerfelgeber(5));
  for (let saat = 1; saat <= 20; saat += 1) {
    const nachher = T.wuerfleNeu(vorher, 'stufen', 'de', wuerfelgeber(saat));
    assert.equal(nachher.stufen.length, 5, `Saat ${saat}`);
    assert.notEqual(T.pruefeZustand(nachher).urteil, 'kaputt', `Saat ${saat}`);
  }
});

/* ---------- Die Themen als Ganzes ---------- */

test('es gibt deutlich mehr als eine Handvoll Themen', () => {
  /*
   * Der Grund fuer die Zahl: mit sechs Themen sah jede Sammlung nach
   * Kaelte, Hitze und Faeulnis aus. Feuer, Gift, Säure, Sturm, Stein, Blut,
   * Schatten, Zeit, Klang, Traum und Tiefe kamen dazu.
   */
  assert.ok(T.THEMEN.length >= 15, `nur ${T.THEMEN.length}`);
});

test('jedes Thema hat alles, was der Erzeuger braucht', () => {
  for (const thema of T.THEMEN) {
    assert.ok(thema.erstes.length >= 6, `${thema.id}: zu wenige erste Teile`);
    assert.ok(thema.zweites.length >= 6, `${thema.id}: zu wenige zweite Teile`);
    assert.ok(thema.einzeln.length >= 4, `${thema.id}: zu wenige Einzelnamen`);
    assert.ok(thema.bilder.length >= 3, `${thema.id}: zu wenige Bilder`);
    assert.ok(thema.gegenmittel.length >= 3, `${thema.id}: zu wenige Gegenmittel`);
    assert.ok(thema.orte.length >= 3, `${thema.id}: zu wenige Orte`);
    assert.ok(thema.spuren.length >= 2, `${thema.id}: zu wenige Spuren`);
  }
});

test('jedes Thema hat ein eigenes Sinnbild', () => {
  // Ohne eines faellt es auf den allgemeinen Rueckfall zurueck, und dann
  // tragen zwei verschiedene Themen dasselbe Zeichen.
  for (const thema of T.THEMEN) {
    const passend = T.SINNBILDER.filter((s) => s.themen.includes(thema.id));
    assert.equal(passend.length, 1, `${thema.id}: ${passend.length} Sinnbilder`);
  }
});

test('kein Thema teilt sein Zeichen mit einem anderen', () => {
  const zeichen = T.SINNBILDER.filter((s) => s.themen.length > 0).map((s) => s.zeichen);
  assert.equal(new Set(zeichen).size, zeichen.length, zeichen.join(' '));
});

test('jede Spur eines Themas gibt es wirklich', () => {
  const erlaubt = new Set(['sinne', 'bewegung', 'angriff', 'verteidigung', 'handlung', 'geist', 'koerper', 'schaden']);
  for (const thema of T.THEMEN) {
    for (const spur of thema.spuren) {
      assert.ok(erlaubt.has(spur), `${thema.id}: ${spur}`);
    }
  }
});

test('zu jeder Spur eines Themas gibt es auch Wirkungen', () => {
  // Eine Spur ohne Wirkungen waere eine Vorliebe, die nie greift.
  for (const thema of T.THEMEN) {
    const treffer = T.WIRKUNGEN.filter((w) => thema.spuren.includes(w.spur));
    assert.ok(treffer.length >= 4, `${thema.id}: nur ${treffer.length} Wirkungen auf seinen Spuren`);
  }
});

test('JEDES Thema liefert brauchbare Zustaende, nicht nur die alten', () => {
  const daneben = [];
  for (const thema of T.THEMEN) {
    for (const stufen of [1, 3, 5]) {
      for (let saat = 1; saat <= 5; saat += 1) {
        const zustand = T.erzeugeZustand({ themaId: thema.id, stufen }, 'de', wuerfelgeber(saat));
        if (T.pruefeZustand(zustand).urteil === 'kaputt') daneben.push(`${thema.id}/${stufen}/${saat} kaputt`);
        if (!T.pruefeZustandsStimmigkeit(zustand).ok) daneben.push(`${thema.id}/${stufen}/${saat} unstimmig`);
        if (zustand.name.trim() === '') daneben.push(`${thema.id}: ohne Namen`);
        if (!zustand.kurzsatz.endsWith('.')) daneben.push(`${thema.id}: Kurzsatz ohne Punkt`);
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} daneben`);
});

test('die Namen der neuen Themen sind so vielfaeltig wie die der alten', () => {
  for (const thema of T.THEMEN) {
    const namen = new Set();
    for (let saat = 1; saat <= 60; saat += 1) namen.add(T.baueNamen(thema, 'de', wuerfelgeber(saat)));
    assert.ok(namen.size >= 25, `${thema.id}: nur ${namen.size} aus 60`);
  }
});

test('kein Thema heisst wie ein anderes', () => {
  const ids = T.THEMEN.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const sprache of ['de', 'en']) {
    const namen = T.THEMEN.map((t) => T.text(t.name, sprache));
    assert.equal(new Set(namen).size, namen.length, namen.join(', '));
  }
});

test('kein Name wiederholt seinen eigenen Wortstamm', () => {
  /*
   * „Lochloch" (beide Listen des Themas Säure enthalten „Loch") und
   * „Fernferne" (Leere: „Fern" und „ferne"). Im Deutschen wird
   * zusammengeschrieben, und dann faellt es sofort auf.
   */
  const einzelne = new Set(T.THEMEN.flatMap((t) => t.einzeln.map((p) => p.de)));
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 120; saat += 1) {
      const name = T.baueNamen(thema, 'de', wuerfelgeber(saat));
      if (einzelne.has(name)) continue;
      for (const erstes of thema.erstes) {
        if (!name.startsWith(erstes.de)) continue;
        const rest = name.slice(erstes.de.length).toLowerCase();
        const kopf = erstes.de.toLowerCase();
        assert.ok(
          !rest.startsWith(kopf) && !kopf.startsWith(rest),
          `${thema.id}: ${name}`
        );
      }
    }
  }
});

test('jedes Bild eines Themas taugt als Satzgegenstand', () => {
  /*
   * Der Kurzsatz lautet „{Bild} {Verb} {Stelle}." — ein Nebensatz als
   * Subjekt ergibt „Etwas fehlt zieht in deine Hände." Ein Bild ist deshalb
   * eine Nominalgruppe und beginnt mit einem Artikel.
   */
  for (const thema of T.THEMEN) {
    for (const bild of thema.bilder) {
      assert.match(bild.de, /^(Der|Die|Das|Ein|Eine) /, `${thema.id}: „${bild.de}"`);
    }
  }
});

test('jedes Gegenmittel passt in den Linderungssatz', () => {
  /*
   * „Eine Stunde {Gegenmittel} senkt ihn um 1" braucht eine
   * Praepositionalgruppe. „nach einer vollen Rast" ergab „Eine Stunde nach
   * einer vollen Rast senkt ihn um 1" — zwei Zeitangaben hintereinander.
   */
  for (const thema of T.THEMEN) {
    for (const mittel of thema.gegenmittel) {
      assert.ok(!/^nach /.test(mittel.de), `${thema.id}: „${mittel.de}"`);
      assert.ok(!/^after /.test(mittel.en), `${thema.id}: “${mittel.en}”`);
    }
  }
});

test('der Kurzsatz steht durchgehend im selben Fall', () => {
  /*
   * Die Stellen sind im Akkusativ gebaut („dir in die Knochen"). Ein Verb,
   * das den Dativ verlangt, ergibt „sitzt in deine Hände" — im Bild der
   * Oberflaeche stand genau das.
   */
  const stellen = ['dir in die Knochen', 'über deine Sinne', 'dir auf die Brust',
                   'hinter deine Augen', 'in deine Hände', 'dir in den Nacken'];
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 40; saat += 1) {
      const satz = T.baueKurzsatz(thema, 'de', wuerfelgeber(saat));
      assert.ok(!/\bsitzt\b/.test(satz), `Dativverb im Akkusativsatz: ${satz}`);
      assert.ok(stellen.some((stelle) => satz.includes(stelle)), satz);
    }
  }
});

test('kein englisches Bild steht im Plural', () => {
  /*
   * Die englischen Verben stehen in der dritten Person Singular („creeps",
   * „draws"). Ein Bild im Plural ergibt „The embers draws behind your eyes."
   *
   * Geprueft wird die Endung: ein „s" am letzten Wort, ohne dass es ein
   * bekanntes Einzelwort darauf ist.
   */
  // Woerter auf „-ness" und „-ing" sind Einzahl, auch wenn sie auf s enden.
  const einzahl = (wort) => /ness$/.test(wort) || /ing$/.test(wort);

  /*
   * Massgeblich ist der KOPF der Nominalgruppe, nicht das letzte Wort: bei
   * „A twitching in the limbs" richtet sich das Verb nach „twitching", und
   * „limbs" gehoert zum Anhang. Der erste Anlauf pruefte das letzte Wort
   * und hat genau diese Zeile zu Unrecht beanstandet.
   */
  const kopf = (satz) => {
    const vorAnhang = satz.split(/\s+(?:in|at|under|without|of|behind|on|into|through)\s+/)[0];
    return vorAnhang.split(/\s+/).pop().toLowerCase();
  };

  for (const thema of T.THEMEN) {
    for (const bild of thema.bilder) {
      const wort = kopf(bild.en);
      if (!wort.endsWith('s') || einzahl(wort)) continue;
      assert.fail(`${thema.id}: “${bild.en}” sieht nach Plural aus`);
    }
  }
});

test('toedlich und gefaehrlich mit wenigen Stufen bestehen die eigene Pruefung', () => {
  // Testbericht: „toedlich" mit zwei Stufen wog 39 bei erwarteten 60 bis 180.
  for (const haerteId of ['gefaehrlich', 'toedlich']) {
    for (const stufen of [2, 3]) {
      let bestanden = 0;
      for (let saat = 1; saat <= 20; saat += 1) {
        const zustand = T.erzeugeZustand({ haerteId, stufen, wirkrichtung: 'debuff' }, 'de', wuerfelgeber(saat));
        if (T.pruefeZustand(zustand).urteil === 'passt') bestanden += 1;
      }
      assert.ok(bestanden >= 18, `${haerteId}/${stufen}: nur ${bestanden} von 20`);
    }
  }
});

test('die Frist ist festgelegt, wenn eine Stufe sie nennt', () => {
  let gesehen = 0;
  for (let saat = 1; saat <= 60; saat += 1) {
    const zustand = T.erzeugeZustand({ haerteId: 'gefaehrlich', stufen: 3 }, 'de', wuerfelgeber(saat));
    const nennt = zustand.stufen.some((s) => s.wirkungen.some((id) => /Frist/.test(T.wirkung(id)?.text.de ?? '')));
    const frist = T.fristText(zustand, 'de');
    assert.equal(Boolean(frist), nennt, zustand.name);
    if (frist) {
      gesehen += 1;
      assert.match(T.alsLeib({ ...zustand, id: 'x', schemaVersion: 2 }, 'de'), /\*\*Frist\*\*/);
    }
  }
  assert.ok(gesehen > 0, 'kein Zustand mit Frist gezogen');
});

test('ein Segen ohne Stufen hat kein Schlimmer und Besser', () => {
  const segen = T.erzeugeZustand({ haerteId: 'ernst', stufen: 1, wirkrichtung: 'buff' }, 'de', wuerfelgeber(3));
  assert.equal(T.verlaufsZeilen(segen), 'keine');
  assert.doesNotMatch(T.alsLeib({ ...segen, id: 'x', schemaVersion: 2 }, 'de'), /Schlimmer|Besser/);
  const fluch = T.erzeugeZustand({ haerteId: 'ernst', stufen: 3, wirkrichtung: 'debuff' }, 'de', wuerfelgeber(3));
  assert.equal(T.verlaufsZeilen(fluch), 'schaden');
});
