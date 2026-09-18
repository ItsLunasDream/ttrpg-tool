/**
 * Die Faehigkeiten: Zahlen statt Luecken, und genug verschiedene Formen.
 *
 * Aus der Oberflaeche kam beides als Beanstandung. „Alle in 10 Fuss Umkreis
 * nehmen Schaden" nennt keine Zahl, „Es macht eine Wahrnehmungsprobe" nennt
 * keine Folge, und drei legendaere Aktionen, die immer dasselbe tun, sind
 * keine Auswahl.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const T = require('../dist/tests/entry.cjs');

function wuerfelgeber(saat) {
  let wert = saat;
  const zieh = () => {
    wert = (wert * 1103515245 + 12345) % 2147483648;
    return wert / 2147483648;
  };
  for (let i = 0; i < 5; i += 1) zieh();
  return zieh;
}

/* ---------- Die Tabelle ---------- */

test('ein Rettungswurf nennt immer seinen Schwierigkeitsgrad', () => {
  for (const f of T.FAEHIGKEITEN) {
    if (/rettung/i.test(f.text.de)) {
      // „Rettungswurf gegen eine Wirkung" ist ein Wurf, den das Monster
      // SELBST macht — dessen SG gehoert dem anderen und steht nicht hier.
      if (/Rettungswurf gegen|Rettungswürfe gegen/.test(f.text.de)) continue;
      assert.match(f.text.de, /SG \{sg\}/, f.name.de);
    }
    if (/\bsave\b/i.test(f.text.en)) {
      if (/save against|saves against|saving throws? against/.test(f.text.en)) continue;
      assert.match(f.text.en, /DC \{sg\}/, f.name.en);
    }
  }
});

test('wo Schaden steht, steht auch ein Wuerfel', () => {
  /*
   * Ausgenommen sind Saetze, die einen ANDEREN Schaden veraendern statt
   * selbst welchen zu machen — „doppelter Schaden gegen Bauwerke" braucht
   * keine eigene Zahl, weil die vom Angriff kommt.
   */
  const veraendertNur = /doppelt|halb|weitergeben|auf sich|double|half|pass|takes the|instead/i;
  for (const f of T.FAEHIGKEITEN) {
    for (const sprache of ['de', 'en']) {
      const satz = f.text[sprache];
      const nenntSchaden = /schaden|damage/i.test(satz);
      if (!nenntSchaden || veraendertNur.test(satz)) continue;
      assert.match(satz, /\{schaden\}|\{kleinerSchaden\}/, `${f.name[sprache]} (${sprache}): ${satz}`);
    }
  }
});

test('beide Sprachen tragen dieselben Platzhalter', () => {
  const platzhalter = (satz) => [...satz.matchAll(/\{(\w+)\}/g)].map((t) => t[1]).sort().join(',');
  for (const f of T.FAEHIGKEITEN) {
    assert.equal(platzhalter(f.text.de), platzhalter(f.text.en), f.name.de);
  }
});

test('kein Text nennt einen Platzhalter, den es nicht gibt', () => {
  for (const f of T.FAEHIGKEITEN) {
    assert.deepEqual(T.unbekanntePlatzhalter(f.text.de), [], f.name.de);
    assert.deepEqual(T.unbekanntePlatzhalter(f.text.en), [], f.name.en);
  }
});

test('keine Faehigkeit ist ein Lueckenfueller', () => {
  /*
   * „Es macht eine Wahrnehmungsprobe." — eine Probe ohne Folge ist keine
   * Faehigkeit. Erkannt wird das daran, dass der Satz eine Probe oder einen
   * Wurf nennt und danach nichts passiert: kein „oder", kein „und", keine
   * Zahl.
   */
  const nurEineProbe = /^(Es|It) (macht|makes) (eine|a|an) [\wäöüß ]+(probe|check)\.?$/i;
  for (const f of T.FAEHIGKEITEN) {
    assert.ok(!nurEineProbe.test(f.text.de.trim()), `ohne Folge: ${f.name.de} — ${f.text.de}`);
    assert.ok(!nurEineProbe.test(f.text.en.trim()), `ohne Folge: ${f.name.en} — ${f.text.en}`);
  }
});

/* ---------- Die legendaeren Aktionen ---------- */

test('es gibt genug legendaere Aktionen zur Auswahl', () => {
  const legendaer = T.FAEHIGKEITEN.filter((f) => f.kategorie === 'legendaer');
  assert.ok(legendaer.length >= 15, `nur ${legendaer.length}`);
});

test('die legendaeren Aktionen folgen nicht alle denselben drei Mustern', () => {
  /*
   * Die Beanstandung aus der Oberflaeche, woertlich: „Ich sehe bis jetzt nur
   * folgendes Muster: Bonusattacke / Save oder Status Effect / 10 feet Area
   * Schaden." Der Test zaehlt, wie viele NICHT in dieses Raster fallen.
   */
  const legendaer = T.FAEHIGKEITEN.filter((f) => f.kategorie === 'legendaer');
  const imRaster = (f) => {
    const satz = f.text.de;
    const rettung = /rettung/i.test(satz);
    const flaeche = /Umkreis|in \d+ Fuß nehmen/i.test(satz);
    const angriff = /greift .* an|einen Angriff/i.test(satz);
    return rettung || flaeche || angriff;
  };
  const anders = legendaer.filter((f) => !imRaster(f));
  assert.ok(anders.length >= 7, `nur ${anders.length} von ${legendaer.length} fallen aus dem Raster`);
});

/* ---------- Am fertigen Monster ---------- */

test('im fertigen Statblock steht kein Platzhalter mehr', () => {
  for (const cr of ['1/4', '1', '5', '12', '20', '30']) {
    for (let saat = 1; saat <= 6; saat += 1) {
      const monster = T.erzeugeMonster({ cr, legendaer: true }, 'de', wuerfelgeber(saat));
      for (const f of monster.faehigkeiten) {
        assert.doesNotMatch(f.text, /\{\w+\}/, `${cr}/${saat}: ${f.name} — ${f.text}`);
      }
    }
  }
});

test('der Rettungs-SG passt zum Angriffsbonus', () => {
  /*
   * Dieselbe harte Regel wie bei den Attributen: 8 + Uebungsbonus +
   * Modifikator des Hauptattributs. Ein Monster, dessen SG nicht dazu passt,
   * widerspricht sich selbst, und das faellt am Tisch beim ersten Wurf auf.
   */
  for (const cr of ['1/8', '2', '9', '17', '24']) {
    for (let saat = 1; saat <= 4; saat += 1) {
      const monster = T.erzeugeMonster({ cr, legendaer: true }, 'de', wuerfelgeber(saat));
      const ziel = T.richtwert(monster.cr);
      const sg = T.rettungsSg(monster.werte.angriffsbonus);
      // Der Angriffsbonus ist Uebungsbonus plus Modifikator des
      // Hauptattributs — der SG haengt damit an derselben harten Regel.
      assert.equal(
        monster.werte.angriffsbonus,
        T.uebungsbonus(ziel.wert) + T.modifikator(monster.attribute[monster.hauptattribut])
      );

      const mitSg = monster.faehigkeiten.filter((f) => /SG \d+/.test(f.text));
      for (const f of mitSg) assert.match(f.text, new RegExp(`SG ${sg}\\b`), f.name);
    }
  }
});

test('der Schaden einer legendaeren Aktion waechst mit dem Grad', () => {
  const schnitt = (ausdruck) => {
    const [, anzahl, seiten, rest] = ausdruck.match(/(\d+)d(\d+)(?: [+−] (\d+))?/);
    return Number(anzahl) * ((Number(seiten) + 1) / 2) + (rest ? Number(rest) : 0);
  };
  const fuer = (cr) => {
    const monster = T.erzeugeMonster({ cr, legendaer: true }, 'de', wuerfelgeber(3));
    return schnitt(
      T.kampfzahlen(monster.werte.angriffsbonus, monster.werte.schadenProRunde, ['wucht'], 'de').schaden
    );
  };
  assert.ok(fuer('1') < fuer('10'), 'Grad 10 schlaegt nicht haerter zu als Grad 1');
  assert.ok(fuer('10') < fuer('24'), 'Grad 24 schlaegt nicht haerter zu als Grad 10');
});

test('die Schadensart steht im Satz, wie sie im Statblock steht', () => {
  /*
   * Nicht „2d6 Feuer", sondern „2d6 Feuerschaden" — und bei den Arten,
   * deren Name ein Eigenschaftswort ist, im Akkusativ: „3d6 psychischen
   * Schaden", nicht „psychischer Schaden". Beides stand im ersten Anlauf
   * falsch im Statblock.
   */
  assert.equal(T.schadensartMitWort('feuer', 'de'), 'Feuerschaden');
  assert.equal(T.schadensartMitWort('feuer', 'en'), 'fire damage');
  assert.equal(T.schadensartMitWort('psychisch', 'de'), 'psychischen Schaden');
  assert.equal(T.schadensartMitWort('nekrotisch', 'de'), 'nekrotischen Schaden');

  for (const art of T.SCHADENSARTEN) {
    assert.match(T.schadensartMitWort(art.id, 'de'), /[Ss]chaden$/, art.id);
    assert.match(T.schadensartMitWort(art.id, 'en'), / damage$/, art.id);
    // Nie im Nominativ: „psychischer Schaden" nach „nimmt" ist falsch.
    assert.doesNotMatch(T.schadensartMitWort(art.id, 'de'), /er Schaden$/, art.id);
  }
});

/* ---------- Die Umgebung passt zum Wesen ---------- */

test('jedes Thema hat mehrere Umgebungen zur Auswahl', () => {
  for (const thema of T.THEMEN) {
    const passend = T.UMGEBUNGEN.filter((u) => T.passtZumThema(u, thema.id));
    assert.ok(passend.length >= 4, `${thema.id}: nur ${passend.length}`);
  }
});

test('wer schwimmt, lebt nicht in der Wueste', () => {
  /*
   * Der Fall aus dem Bild: ein Elementar mit Schwimmbewegung und
   * „Amphibisch", eingetragen in der Wueste. Beides fuer sich stimmte.
   */
  const daneben = [];
  for (const cr of ['1/4', '2', '5', '11', '17', '24']) {
    for (let saat = 1; saat <= 25; saat += 1) {
      const monster = T.erzeugeMonster({ cr }, 'de', wuerfelgeber(saat));
      const umgebung = T.UMGEBUNGEN.find((u) => T.umgebungName(u, 'de') === monster.umgebung);
      assert.ok(umgebung, `unbekannte Umgebung: ${monster.umgebung}`);

      const arten = monster.bewegung.gangarten.map((g) => g.art);
      if (arten.includes('schwimmen') && !umgebung.wasser) {
        daneben.push(`${cr}/${saat}: schwimmt in ${monster.umgebung}`);
      }
      if (arten.includes('graben') && !umgebung.grabbar) {
        daneben.push(`${cr}/${saat}: gräbt in ${monster.umgebung}`);
      }
      if (!T.passtZumThema(umgebung, monster.themaId)) {
        daneben.push(`${cr}/${saat}: ${monster.themaId} in ${monster.umgebung}`);
      }
    }
  }
  assert.deepEqual(daneben.slice(0, 5), [], `${daneben.length} Widersprüche`);
});

test('das Nachwuerfeln der Bewegung zieht die Umgebung mit', () => {
  /*
   * Sonst bleibt der Widerspruch an genau der Stelle zurueck, an der man
   * ihn gerade beheben wollte.
   */
  for (let saat = 1; saat <= 20; saat += 1) {
    const rng = wuerfelgeber(saat);
    let monster = T.erzeugeMonster({ cr: '5' }, 'de', rng);
    monster = T.wuerfleNeu(monster, 'bewegung', 'de', rng);
    const umgebung = T.UMGEBUNGEN.find((u) => T.umgebungName(u, 'de') === monster.umgebung);
    assert.ok(T.passtZurBewegung(umgebung, monster.bewegung), `${saat}: ${monster.umgebung}`);
  }
});

test('die Umgebung bleibt in beiden Sprachen dieselbe Liste', () => {
  for (const u of T.UMGEBUNGEN) {
    assert.ok(T.umgebungName(u, 'de').trim().length > 0, u.id);
    assert.ok(T.umgebungName(u, 'en').trim().length > 0, u.id);
  }
  const kennungen = T.UMGEBUNGEN.map((u) => u.id);
  assert.equal(new Set(kennungen).size, kennungen.length);
});
