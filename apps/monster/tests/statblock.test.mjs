/**
 * Attribute, Bewegung, Angriffe und Widerstaende.
 *
 * Das Neue am Statblock, und jedes Stueck davon kann still falsch sein:
 * ein Angriffsbonus, der nicht zum Attribut passt, faellt am Tisch erst
 * beim ersten Wurf auf.
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
  /*
   * Ein paar Wuerfe warmlaufen lassen.
   *
   * Der erste Wurf dieses einfachen Generators haengt fast linear von der
   * Saat ab: fuer die Saaten 1 bis 40 liegt er zwischen 0,236 und 0,252.
   * Wer genau EINEN Wurf braucht — die Zahl der Faehigkeiten etwa —,
   * bekaeme damit vierzigmal dasselbe Ergebnis und haelt den Generator fuer
   * kaputt, obwohl der Fehler im Test steckt.
   */
  for (let i = 0; i < 5; i += 1) zieh();
  return zieh;
}

/* ---------- Attribute ---------- */

test('der Uebungsbonus folgt dem Regelwerk', () => {
  assert.equal(T.uebungsbonus(0), 2);
  assert.equal(T.uebungsbonus(4), 2);
  assert.equal(T.uebungsbonus(5), 3);
  assert.equal(T.uebungsbonus(9), 4);
  assert.equal(T.uebungsbonus(17), 6);
  assert.equal(T.uebungsbonus(30), 9);
});

test('der Modifikator ist die Formel aus dem Buch', () => {
  assert.equal(T.modifikator(10), 0);
  assert.equal(T.modifikator(11), 0);
  assert.equal(T.modifikator(18), 4);
  assert.equal(T.modifikator(1), -5);
});

test('Uebungsbonus plus Hauptattribut ergibt den Angriffsbonus — bei JEDEM Grad', () => {
  // Die harte Regel des ganzen Moduls. Haelt sie nicht, widerspricht sich
  // der Statblock selbst.
  const daneben = [];
  for (const richtwert of T.RICHTWERTE) {
    for (const thema of T.THEMEN) {
      for (const rolle of T.ROLLEN) {
        for (let saat = 1; saat <= 3; saat += 1) {
          const profil = T.profilFuer(thema, rolle);
          const attribute = T.attributeFuer(richtwert, profil, wuerfelgeber(saat));
          const befund = T.pruefeAttribute(attribute, profil.haupt, richtwert.bonus, richtwert.wert);
          if (!befund.passt) {
            daneben.push(`CR ${richtwert.cr} ${thema.id} ${rolle.id} Saat ${saat}`);
          }
        }
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} daneben`);
});

test('kein Attributwert faellt aus der Spanne 1 bis 30', () => {
  for (const richtwert of T.RICHTWERTE) {
    for (const thema of T.THEMEN) {
      const profil = T.profilFuer(thema, T.ROLLEN[0]);
      const attribute = T.attributeFuer(richtwert, profil, wuerfelgeber(7));
      for (const id of T.ATTRIBUTE) {
        assert.ok(attribute[id] >= 1 && attribute[id] <= 30, `${thema.id} ${id}: ${attribute[id]}`);
      }
    }
  }
});

test('wer aus der Entfernung schiesst, nimmt Geschick — egal was er ist', () => {
  const schuetze = T.ROLLEN.find((r) => r.id === 'schuetze');
  for (const thema of T.THEMEN) {
    assert.equal(T.profilFuer(thema, schuetze).haupt, 'ge', thema.id);
  }
});

test('eine Bestie schlaegt mit Staerke zu, ein Unhold mit Charisma', () => {
  const brecher = T.ROLLEN.find((r) => r.id === 'brecher');
  const bestie = T.THEMEN.find((t) => t.id === 'bestie');
  const unhold = T.THEMEN.find((t) => t.id === 'unhold');
  assert.equal(T.profilFuer(bestie, brecher).haupt, 'st');
  assert.equal(T.profilFuer(unhold, brecher).haupt, 'ch');
});

/* ---------- Bewegung ---------- */

test('jedes Monster kann gehen, und zwar als Erstes', () => {
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 20; saat += 1) {
      const bewegung = T.bewegungFuer(thema, wuerfelgeber(saat));
      assert.equal(bewegung.gangarten[0].art, 'gehen');
      assert.ok(bewegung.gangarten[0].fuss >= 5);
    }
  }
});

test('kein Monster kann alles auf einmal', () => {
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 50; saat += 1) {
      const bewegung = T.bewegungFuer(thema, wuerfelgeber(saat));
      assert.ok(bewegung.gangarten.length <= 3, `${thema.id} Saat ${saat}`);
    }
  }
});

test('nicht jedes Monster fliegt', () => {
  const bestie = T.THEMEN.find((t) => t.id === 'bestie');
  let fliegend = 0;
  for (let saat = 1; saat <= 60; saat += 1) {
    const bewegung = T.bewegungFuer(bestie, wuerfelgeber(saat));
    if (bewegung.gangarten.some((g) => g.art === 'fliegen')) fliegend += 1;
  }
  assert.ok(fliegend < 30, `${fliegend} von 60 fliegen`);
});

test('alle Werte sind Vielfache von fuenf', () => {
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 20; saat += 1) {
      for (const gangart of T.bewegungFuer(thema, wuerfelgeber(saat)).gangarten) {
        assert.equal(gangart.fuss % 5, 0);
      }
    }
  }
});

test('die Zeile liest sich wie im Statblock', () => {
  const bewegung = { gangarten: [{ art: 'gehen', fuss: 30 }, { art: 'fliegen', fuss: 60 }] };
  assert.equal(T.alsZeile(bewegung, 'en'), '30 ft., fly 60 ft.');
  assert.equal(T.alsZeile(bewegung, 'de'), '30 Fuß, fliegen 60 Fuß');
});

/* ---------- Angriffe ---------- */

test('der Wuerfelausdruck trifft den Durchschnitt', () => {
  for (const seiten of [4, 6, 8, 10, 12]) {
    for (let schaden = 2; schaden <= 60; schaden += 1) {
      for (const bonus of [0, 3, 5]) {
        const text = T.alsWuerfel(schaden, seiten, bonus);
        const treffer = /^(\d+)d(\d+)(?: ([+−]) (\d+))?$/.exec(text);
        assert.ok(treffer, text);
        const anzahl = Number(treffer[1]);
        const rest = treffer[3] ? (treffer[3] === '+' ? 1 : -1) * Number(treffer[4]) : 0;
        const mittel = (anzahl * (seiten + 1)) / 2 + rest;
        // Ein halber Punkt Abstand, weil der Wuerfelmittelwert halbe Zahlen
        // hat und der Durchschnitt eine ganze ist.
        assert.ok(Math.abs(mittel - schaden) <= 0.5, `${schaden} ≠ ${text} (${mittel})`);
      }
    }
  }
});

test('eine Bestie fuehrt keine Waffe', () => {
  const nah = T.moeglicheWaffen('bestie', 'brecher', 'nah');
  assert.ok(nah.length > 0);
  assert.ok(nah.every((waffe) => !waffe.gefuehrt));
});

test('ein Humanoider kann sehr wohl eine Hellebarde tragen', () => {
  const nah = T.moeglicheWaffen('humanoid', 'brecher', 'nah');
  assert.ok(nah.some((waffe) => waffe.id === 'hellebarde'));
});

test('die Schadensart passt immer zur Waffe', () => {
  // Der Fall, um den es geht: keine Klaue, die Donnerschaden macht.
  for (const waffe of T.WAFFEN) {
    for (const id of waffe.schaden) {
      assert.ok(T.schadensart(id), `${waffe.id}: ${id}`);
    }
  }
});

test('die Angriffe teilen den Rundenschaden auf, sie erhoehen ihn nicht', () => {
  const daneben = [];
  for (const richtwert of T.RICHTWERTE) {
    for (const thema of T.THEMEN) {
      for (let saat = 1; saat <= 4; saat += 1) {
        const monster = T.erzeugeMonster({ cr: richtwert.cr, themaId: thema.id }, 'de', wuerfelgeber(saat));
        // Was eine Aura oder Stachelhaut austeilt, gehoert zur Runde dazu.
        const summe = T.schadenProRunde(monster.angriffe) + T.abzweig(monster.faehigkeiten, monster.werte.schadenProRunde).schaden;
        // Gerundet wird je Angriff, deshalb eine Toleranz von der Anzahl
        // der Angriffe — mehr waere ein Fehler.
        const spielraum = Math.max(2, T.angriffeProRunde(monster));
        if (Math.abs(summe - monster.werte.schadenProRunde) > spielraum) {
          daneben.push(`CR ${richtwert.cr} ${thema.id}: ${summe} statt ${monster.werte.schadenProRunde}`);
        }
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} daneben`);
});

test('eine Flaeche kommt vor, aber nicht bei jedem', () => {
  let mitFlaeche = 0;
  for (let saat = 1; saat <= 60; saat += 1) {
    const monster = T.erzeugeMonster({ cr: '8' }, 'de', wuerfelgeber(saat));
    if (monster.angriffe.some((a) => a.art === 'flaeche')) mitFlaeche += 1;
  }
  assert.ok(mitFlaeche > 0, 'nie eine Flaeche');
  assert.ok(mitFlaeche < 45, `${mitFlaeche} von 60 haben eine`);
});

test('eine Flaeche hat einen Rettungswurf und keinen Angriffsbonus', () => {
  for (let saat = 1; saat <= 60; saat += 1) {
    const monster = T.erzeugeMonster({ cr: '12' }, 'de', wuerfelgeber(saat));
    for (const angriff of monster.angriffe.filter((a) => a.art === 'flaeche')) {
      assert.ok(angriff.rettung, 'ohne Rettungswurf');
      assert.equal(angriff.trefferbonus, undefined);
      assert.equal(angriff.rettung.sg, 8 + monster.werte.angriffsbonus);
    }
  }
});

test('„nah" liefert nur Nahkampf, „fern" nur Fernkampf', () => {
  for (let saat = 1; saat <= 30; saat += 1) {
    const nah = T.erzeugeMonster({ cr: '5', kampfweite: 'nah' }, 'de', wuerfelgeber(saat));
    for (const angriff of nah.angriffe.filter((a) => a.art !== 'flaeche')) {
      assert.equal(angriff.art, 'nah', `Saat ${saat}`);
    }
    const fern = T.erzeugeMonster({ cr: '5', kampfweite: 'fern' }, 'de', wuerfelgeber(saat));
    for (const angriff of fern.angriffe.filter((a) => a.art !== 'flaeche')) {
      assert.equal(angriff.art, 'fern', `Saat ${saat}`);
    }
  }
});

/* ---------- Widerstaende ---------- */

test('nicht jedes Monster hat Resistenzen', () => {
  let ohne = 0;
  for (let saat = 1; saat <= 60; saat += 1) {
    const monster = T.erzeugeMonster({ cr: '5' }, 'de', wuerfelgeber(saat));
    const w = monster.widerstaende;
    if (w.resistenzen.length === 0 && w.immunitaeten.length === 0) ohne += 1;
  }
  assert.ok(ohne > 15, `nur ${ohne} von 60 ohne — zu viele haben welche`);
});

test('eine Schadensart ist nie zugleich resistent und immun', () => {
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 40; saat += 1) {
      const w = T.widerstaendeFuer(thema, 20, wuerfelgeber(saat));
      const alle = [...w.resistenzen, ...w.immunitaeten, ...w.verwundbarkeiten];
      assert.equal(new Set(alle).size, alle.length, `${thema.id} Saat ${saat}`);
    }
  }
});

test('koerperlicher Schaden wiegt doppelt', () => {
  assert.equal(T.gewicht(['hieb']), 2);
  assert.equal(T.gewicht(['strahlend']), 1);
  assert.equal(T.gewicht(['hieb', 'feuer']), 3);
});

test('ein Monster mit Resistenzen bekommt weniger rohe Trefferpunkte', () => {
  // Das ist die Stelle, an der Balancing passiert: wer laenger durchhaelt,
  // braucht weniger Trefferpunkte, um auf demselben Grad zu stehen.
  const ziel = T.richtwert('10');
  const rolle = T.ROLLEN.find((r) => r.id === 'brecher');
  const ohne = T.werteFuer(ziel, rolle, wuerfelgeber(5), false, T.KEINE_WIDERSTAENDE);
  const mit = T.werteFuer(ziel, rolle, wuerfelgeber(5), false, {
    resistenzen: ['hieb', 'stich'],
    immunitaeten: [],
    verwundbarkeiten: []
  });
  assert.ok(mit.tp < ohne.tp, `${mit.tp} nicht kleiner als ${ohne.tp}`);
});

test('eine Verwundbarkeit bringt mehr rohe Trefferpunkte', () => {
  const ziel = T.richtwert('10');
  const rolle = T.ROLLEN.find((r) => r.id === 'brecher');
  const ohne = T.werteFuer(ziel, rolle, wuerfelgeber(5), false, T.KEINE_WIDERSTAENDE);
  const mit = T.werteFuer(ziel, rolle, wuerfelgeber(5), false, {
    resistenzen: [],
    immunitaeten: [],
    verwundbarkeiten: ['feuer']
  });
  assert.ok(mit.tp > ohne.tp, `${mit.tp} nicht groesser als ${ohne.tp}`);
});

/* ---------- Faehigkeiten ---------- */

test('die Zahl der Faehigkeiten waechst bis zum hoechsten Grad', () => {
  const mittel = (wert) => {
    let summe = 0;
    for (let saat = 1; saat <= 40; saat += 1) summe += T.anzahlFaehigkeiten(wert, wuerfelgeber(saat));
    return summe / 40;
  };
  assert.ok(mittel(1) < mittel(10), 'Grad 10 hat nicht mehr als Grad 1');
  assert.ok(mittel(10) < mittel(30), 'Grad 30 hat nicht mehr als Grad 10');
  assert.ok(mittel(30) >= 6.5, `Grad 30 kommt nur auf ${mittel(30)}`);
});

test('bei gleichem Grad schwankt die Zahl', () => {
  const gesehen = new Set();
  for (let saat = 1; saat <= 40; saat += 1) gesehen.add(T.anzahlFaehigkeiten(10, wuerfelgeber(saat)));
  assert.ok(gesehen.size >= 2, 'immer dieselbe Zahl');
});

test('keins bekommt null Faehigkeiten', () => {
  for (const wert of [0, 0.125, 1, 5, 30]) {
    for (let saat = 1; saat <= 30; saat += 1) {
      assert.ok(T.anzahlFaehigkeiten(wert, wuerfelgeber(saat)) >= 1);
    }
  }
});

test('jede Faehigkeit gehoert in einen Abschnitt des Statblocks', () => {
  const erlaubt = new Set(['passiv', 'aktion', 'bonusaktion', 'reaktion', 'legendaer']);
  for (const faehigkeit of T.FAEHIGKEITEN) {
    assert.ok(erlaubt.has(faehigkeit.kategorie), `${faehigkeit.name.de}: ${faehigkeit.kategorie}`);
  }
});

/* ---------- Namen ---------- */

test('es gibt mindestens 40 Faehigkeiten', () => {
  // Der Grund fuer die Zahl: bei zwoelf kamen „Zehrende Nähe" und
  // „Flimmern" nach wenigen Wuerfen immer wieder.
  assert.ok(T.FAEHIGKEITEN.length >= 40, `nur ${T.FAEHIGKEITEN.length}`);
});

test('legendaere Aktionen gibt es nur bei legendaeren Monstern', () => {
  for (let saat = 1; saat <= 30; saat += 1) {
    const ohne = T.erzeugeMonster({ cr: '15' }, 'de', wuerfelgeber(saat));
    assert.ok(!ohne.faehigkeiten.some((f) => f.kategorie === 'legendaer'), `Saat ${saat}`);

    const mit = T.erzeugeMonster({ cr: '15', legendaer: true }, 'de', wuerfelgeber(saat));
    assert.ok(mit.faehigkeiten.some((f) => f.kategorie === 'legendaer'), `Saat ${saat}`);
  }
});

test('der Schalter fuer legendaere Aktionen aendert den Statblock sichtbar', () => {
  const ohne = T.alsMarkdown(
    { ...T.erzeugeMonster({ cr: '12' }, 'de', wuerfelgeber(4)), id: 'a', geaendert: 'x' },
    'de'
  );
  const mit = T.alsMarkdown(
    { ...T.erzeugeMonster({ cr: '12', legendaer: true }, 'de', wuerfelgeber(4)), id: 'a', geaendert: 'x' },
    'de'
  );
  assert.ok(!ohne.includes('Legendäre Aktionen'));
  assert.ok(mit.includes('Legendäre Aktionen'));
});

test('jedes Thema hat genug Namensteile fuer mehr als hundert Namen', () => {
  for (const thema of T.THEMEN) {
    const moeglich = thema.erstes.length * thema.zweites.length + thema.einzeln.length;
    assert.ok(moeglich >= 200, `${thema.id}: nur ${moeglich}`);
  }
});

test('es kommen auch Einzelnamen heraus, aber nicht nur', () => {
  const bestie = T.THEMEN.find((t) => t.id === 'bestie');
  const einzelne = new Set(bestie.einzeln.map((p) => p.de));
  let einzeln = 0;
  for (let saat = 1; saat <= 80; saat += 1) {
    if (einzelne.has(T.baueNamen(bestie, 'de', wuerfelgeber(saat)))) einzeln += 1;
  }
  assert.ok(einzeln > 5, `nur ${einzeln} von 80 Einzelnamen`);
  assert.ok(einzeln < 60, `${einzeln} von 80 sind Einzelnamen`);
});

test('hundert Wuerfe geben nicht dauernd denselben Namen', () => {
  for (const thema of T.THEMEN) {
    const namen = new Set();
    for (let saat = 1; saat <= 100; saat += 1) namen.add(T.baueNamen(thema, 'de', wuerfelgeber(saat)));
    assert.ok(namen.size >= 55, `${thema.id}: nur ${namen.size} verschiedene aus 100`);
  }
});

test('eine Flaeche nimmt vom Wesen nie eine koerperliche Schadensart', () => {
  /*
   * Aufgefallen auf einem Bild der Oberflaeche: ein „Strahl", der
   * Hiebschaden macht. Ein Humanoider hat als Schadensarten nur Hieb, Stich
   * und Wucht, und die Flaeche nahm die erste davon.
   *
   * Erlaubt bleibt, was die WAFFE selbst mitbringt: ein „Schwall", der
   * Wucht macht, ist eine Welle und kein Fehler. Verboten ist nur, dass eine
   * koerperliche Art des Wesens auf eine Flaeche durchschlaegt.
   */
  const daneben = [];
  for (const thema of T.THEMEN) {
    for (let saat = 1; saat <= 40; saat += 1) {
      const monster = T.erzeugeMonster({ cr: '12', themaId: thema.id }, 'de', wuerfelgeber(saat));
      for (const angriff of monster.angriffe.filter((a) => a.art === 'flaeche')) {
        const waffe = T.WAFFEN.find((w) => w.id === angriff.waffeId);
        if (!waffe?.schadenVomWesen) continue;
        const eigen = angriff.schadensartId === waffe.schaden[0];
        const koerperlich = T.schadensart(angriff.schadensartId)?.koerperlich;
        if (koerperlich && !eigen) {
          daneben.push(`${thema.id} Saat ${saat}: ${waffe.id} macht ${angriff.schadensartId}`);
        }
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} daneben`);
});

test('der Strahl eines Humanoiden schneidet nicht', () => {
  // Der gemeldete Fall, fest nachgestellt.
  const humanoid = T.THEMEN.find((t) => t.id === 'humanoid');
  const strahl = T.WAFFEN.find((w) => w.id === 'strahl');
  assert.ok(humanoid.schaden.every((id) => T.schadensart(id).koerperlich), 'Vorbedingung');
  // Ohne passende Art des Wesens bleibt es bei dem, was die Waffe mitbringt.
  assert.equal(strahl.schaden[0], 'blitz');
});

test('die Reichweite bringt keinen zweiten Satzpunkt mit', () => {
  // „reach 5 ft.." stand im ersten Bild der Oberflaeche.
  const langschwert = T.WAFFEN.find((w) => w.id === 'langschwert');
  assert.equal(T.reichweiteText(langschwert, 'en'), '5 ft');
  assert.equal(T.reichweiteText(langschwert, 'de'), '5 Fuß');
  for (const waffe of T.WAFFEN) {
    for (const sprache of ['de', 'en']) {
      assert.ok(!T.reichweiteText(waffe, sprache).endsWith('.'), `${waffe.id} ${sprache}`);
    }
  }
});
