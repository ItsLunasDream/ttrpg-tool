/**
 * Der Erzeuger: ein Monster zu einem vorgegebenen Grad.
 *
 * Eine reine Funktion mit uebergebenem Zufallsgeber, wie ueberall in der
 * Sammlung — dieselbe Saat gibt dasselbe Monster, und Tests koennen wuerfeln,
 * ohne zu raten.
 *
 * Der Erzeuger ist hier ausdruecklich NICHT der Kern; die Pruefung ist es.
 * Woran man das sieht: was hier herauskommt, muss die Pruefung bestehen, und
 * ein Test besteht darauf. Ein Erzeuger, der Monster baut, die sein eigenes
 * Werkzeug beanstandet, waere ein schlechter Witz.
 */

import {
  richtwert,
  spielraumAn,
  stelleVon,
  wertBeiStelle,
  type Richtwert
} from './richtwerte';
import { LEGENDAER_FAKTOR, RK_ZU_TP, pruefe, widerstandsAnteil, type Werte } from './pruefung';
import { ANTEIL_KLEIN, kampfzahlen, setzeZahlen, type Kampfzahlen } from './platzhalter';
import { umgebungFuer, umgebungName } from './umgebungen';
import { attributeFuer, modifikator, profilFuer, type AttributId, type Attribute } from './attribute';
import { bewegungFuer, type Bewegung } from './bewegung';
import {
  angriffsAttribut,
  baueAngriffe,
  schadenProRunde as angriffsschaden,
  type Angriff,
  type Kampfweite
} from './angriffe';
import { gewicht, widerstaendeFuer, KEINE_WIDERSTAENDE, type Widerstaende } from './widerstaende';
import {
  FAEHIGKEITEN,
  ROLLEN,
  THEMEN,
  text,
  type Faehigkeit,
  type Rolle,
  type Sprache,
  type Thema
} from './tabellen';

export interface Monster {
  readonly name: string;
  readonly cr: string;
  readonly themaId: string;
  readonly thema: string;
  readonly rolleId: string;
  readonly rolle: string;
  readonly umgebung: string;
  readonly werte: Werte;
  /** Die sechs Attribute, und welches davon die Angriffe traegt. */
  readonly attribute: Attribute;
  readonly hauptattribut: AttributId;
  readonly bewegung: Bewegung;
  /**
   * Die Angriffe, aufgeschluesselt.
   *
   * Frueher stand hier eine Zahl — „drei Angriffe" — und daneben der
   * Rundenschaden. Beides zusammen liess offen, was eigentlich passiert,
   * wenn das Monster dran ist. Jetzt steht es da: womit, wie oft, wie weit
   * und mit welchem Schaden.
   */
  readonly angriffe: readonly Angriff[];
  readonly widerstaende: Widerstaende;
  readonly faehigkeiten: readonly Faehigkeitseintrag[];
  /** Ein Satz, was es ist. Aus Rolle und Thema, nicht aus der Luft. */
  readonly satz: string;
}

/** Eine Faehigkeit, wie sie im Statblock steht. */
export interface Faehigkeitseintrag {
  readonly name: string;
  readonly text: string;
  /** In welchen Abschnitt des Statblocks sie gehoert. */
  readonly kategorie: Faehigkeit['kategorie'];
  /** Siehe `Faehigkeit.kostetAngriff`. */
  readonly kostetAngriff?: true;
}

/**
 * Was Faehigkeiten mit „ein Angriff weniger" vom Rundenschaden abzweigen.
 *
 * Der Rundenschaden der Werte bleibt die Summe, gegen die die Pruefung
 * misst. Die Angriffe bekommen davon nur den Rest und einen Angriff weniger;
 * die Naehe oder die Stachelhaut traegt den Anteil, den sie am Tisch
 * austeilt. Vorher stand „dafuer ein Angriff weniger" nur im Text
 * (Testbericht).
 */
export function abzweig(
  faehigkeiten: readonly Faehigkeitseintrag[],
  schadenProRunde: number
): { weniger: number; schaden: number } {
  const weniger = faehigkeiten.filter((f) => f.kostetAngriff).length;
  const je = Math.max(1, Math.round(schadenProRunde * ANTEIL_KLEIN));
  // Nie alles: ein Angriff mit wenigstens einem Punkt bleibt stehen.
  return { weniger, schaden: Math.min(weniger * je, Math.max(0, schadenProRunde - 1)) };
}

export interface Wuensche {
  readonly cr: string;
  /** Leer heisst: wird gewuerfelt. */
  readonly themaId?: string;
  readonly rolleId?: string;
  readonly legendaer?: boolean;
  /** Nah, fern, beides oder egal. Fehlt es, entscheidet der Wurf. */
  readonly kampfweite?: Kampfweite;
}

/** Ein Eintrag aus einer Liste, mit dem uebergebenen Zufallsgeber. */
function zieh<T>(liste: readonly T[], rng: () => number): T {
  return liste[Math.floor(rng() * liste.length)];
}

/**
 * Wie viele Faehigkeiten ein Monster bekommt.
 *
 * Nach Grad, und gedeckelt: ein Monster mit acht Sonderfaehigkeiten liest am
 * Tisch niemand. Das ist eine Vorgabe mit Meinung, und sie steht hier statt
 * als Regler — wer mehr will, schreibt sie von Hand dazu.
 */
export function anzahlFaehigkeiten(wert: number, rng: () => number): number {
  /*
   * Die Grundzahl waechst mit dem Grad, und zwar bis zum Ende.
   *
   * Vorher war bei drei Schluss, ab Grad 5 bis Grad 30 — und ein
   * Erzunhold auf Grad 30 mit drei Faehigkeiten ist kein Erzunhold, sondern
   * ein Goblin mit vielen Trefferpunkten. Wer auf Grad 30 einen Endgegner
   * baut, erwartet sieben oder mehr.
   */
  const grund = wert < 1 ? 1 : wert < 3 ? 2 : wert < 6 ? 3 : wert < 10 ? 4 : wert < 15 ? 5 : wert < 21 ? 6 : 7;

  /*
   * Dazu ein Wurf von minus eins bis plus eins.
   *
   * Ohne ihn traegt jedes Monster desselben Grades gleich viele
   * Faehigkeiten, und das sieht man einer Sammlung nach zehn Eintraegen an.
   * Nach unten bleibt mindestens eine stehen: ein Monster ganz ohne ist
   * eine Zahlenkolonne.
   */
  const wurf = Math.floor(rng() * 3) - 1;
  return Math.max(1, grund + wurf);
}

/**
 * Die Zahlen aus Richtwert und Rolle.
 *
 * Gerechnet wird in GRADEN, nicht in Prozenten. Die Rolle zieht die beiden
 * Haelften auseinander — der Verteidiger haelt 0,8 Grad laenger durch und
 * teilt 0,8 Grad weniger aus —, und weil beides gegenlaeufig ist, liegt der
 * Mittelwert genau auf dem eingestellten Grad. Das ist kein glueckliches
 * Zusammentreffen, sondern der Bauplan: die Pruefung mittelt dieselben zwei
 * Haelften.
 *
 * Mit Prozenten ging das schief, und zwar gruendlich: die Trefferpunkt-
 * Spalte ist im mittleren Bereich gestaucht (von CR 8 auf 9 sind es sechs
 * Prozent), die Schadensspalte nicht (elf Prozent). Dieselben zwölf Prozent
 * hoben die eine Haelfte um zwei Grade und senkten die andere um eine. Die
 * Haelfte aller erzeugten Monster fiel dadurch durch die eigene Pruefung.
 *
 * Auch die Ruestungsklasse und die legendaeren Aktionen werden
 * herausgerechnet: beide gehen in die Pruefung ein, also muessen die
 * Grundwerte um genau so viel niedriger liegen. Sonst waere ein Verteidiger
 * mit +2 RK am Ende doch wieder zu stark.
 */
export function werteFuer(
  ziel: Richtwert,
  rolle: Rolle,
  rng: () => number,
  legendaer = false,
  widerstaende: Widerstaende = KEINE_WIDERSTAENDE
): Werte {
  const stelle = Math.max(0, stelleVon(ziel.cr));

  /*
   * Streuung, damit nicht jedes Monster desselben Grades dieselben Zahlen
   * traegt — ebenfalls in Zeilen, und ebenfalls gegenlaeufig. Damit
   * verschiebt sie die Mischung, nie das Ergebnis.
   */
  const streuung = (rng() - 0.5) * 0.5;
  /*
   * Und beides gedeckelt auf das, was die Tabelle hergibt. Bei CR 0 ist der
   * Spielraum null: dort gibt es nichts darunter, in das die Angriffsseite
   * ausweichen koennte, und eine einseitige Verschiebung macht das Monster
   * staerker als bestellt.
   */
  const spielraum = spielraumAn(stelle);
  const schub = Math.max(-spielraum, Math.min(spielraum, rolle.verschiebung + streuung));

  const rk = ziel.rk + rolle.rk;

  /*
   * Die Widerstaende in Zahlen, so wie die Pruefung sie liest: gewichtet,
   * nicht gezaehlt. Resistenz gegen Hieb wiegt doppelt so schwer wie
   * Resistenz gegen Strahlen.
   */
  const gewichte = {
    resistenzen: gewicht(widerstaende.resistenzen),
    immunitaeten: gewicht(widerstaende.immunitaeten),
    verwundbarkeiten: gewicht(widerstaende.verwundbarkeiten)
  };

  /*
   * Und wieder herausgerechnet.
   *
   * Ein Untoter mit Resistenz gegen Kaelte und nekrotisch haelt laenger
   * durch als seine Trefferpunkte behaupten. Wenn er trotzdem die vollen
   * Richtwert-Trefferpunkte bekaeme, waere er still zu stark — und zwar
   * genau um den Betrag, den die Pruefung ihm hinterher anrechnet. Also
   * bekommt er weniger rohe Trefferpunkte, und am Ende steht er wieder auf
   * seinem Grad. Dasselbe Verfahren wie bei der Ruestung und der Legende.
   */
  const ausRuestung = 1 + (rk - ziel.rk) * RK_ZU_TP;
  const ausWiderstand = 1 + widerstandsAnteil({ tp: 1, rk, schadenProRunde: 1, angriffsbonus: 0, ...gewichte });
  const ausLegende = legendaer ? LEGENDAER_FAKTOR : 1;

  const baue = (schub: number): Werte => ({
    tp: Math.max(
      1,
      Math.round(wertBeiStelle(stelle + schub, (e) => e.tp) / (ausRuestung * ausWiderstand))
    ),
    rk,
    schadenProRunde: Math.max(
      1,
      Math.round(wertBeiStelle(stelle - schub, (e) => e.schadenProRunde) / ausLegende)
    ),
    angriffsbonus: ziel.bonus,
    legendaer: legendaer || undefined,
    ...gewichte
  });

  /*
   * Die Rolle so weit ausspielen, wie der Grad sie traegt.
   *
   * Bei niedrigen Graden sind die Zahlen winzig — bei CR 1/8 stehen neun
   * Trefferpunkte mit einer Spanne von sieben bis elf. Eine halbe Zeile
   * Verschiebung springt dort aus der Spanne, waehrend sie bei CR 15 kaum
   * auffaellt. Statt die Rolle pauschal zu daempfen, wird sie hier
   * probiert und halbiert, bis sie passt. Beim Schub null stehen die
   * Richtwerte selbst da, und die bestehen die Pruefung immer — das
   * Verfahren endet also.
   *
   * Fuenf Prozent aller erzeugten Monster fielen vorher hier durch, alle
   * bei CR 1/8 bis 2. Gefunden hat das der Test, der alle Grade mal alle
   * Rollen mal dreissig Wuerfe durchgeht.
   */
  let versuch = schub;
  for (let runde = 0; runde < 5; runde += 1) {
    const werte = baue(versuch);
    if (pruefe(werte, ziel.cr).urteil === 'passt') return werte;
    versuch /= 2;
  }
  return baue(0);
}

/**
 * Faehigkeiten, die zur Rolle passen, ohne Wiederholung.
 *
 * Legendaere Aktionen laufen getrennt: sie stehen in einem eigenen Abschnitt
 * des Statblocks und ergeben nur Sinn, wenn das Monster ueberhaupt welche
 * hat. Ohne diese Trennung stand „Legendäre Aktionen: an" in den Reglern und
 * im Statblock aenderte sich nichts ausser einer Zahl — genau das ist
 * aufgefallen.
 */
export function waehleFaehigkeiten(
  rolle: Rolle,
  anzahl: number,
  rng: () => number,
  legendaer = false
): Faehigkeit[] {
  const passt = (f: Faehigkeit) => !f.rollen || f.rollen.includes(rolle.id);
  const gewoehnlich = FAEHIGKEITEN.filter((f) => f.kategorie !== 'legendaer' && passt(f));
  const heraus = ziehMehrere(gewoehnlich, anzahl, rng);

  if (legendaer) {
    /*
     * Zwei oder drei legendaere Aktionen, wie in den Statblocks ueblich.
     * Der Angriff als vierte Moeglichkeit kommt beim Schreiben dazu, der
     * steht in jedem Block und muss nicht in der Tabelle stehen.
     */
    const legendaere = FAEHIGKEITEN.filter((f) => f.kategorie === 'legendaer' && passt(f));
    heraus.push(...ziehMehrere(legendaere, 2 + Math.floor(rng() * 2), rng));
  }
  return heraus;
}

/** Mehrere verschiedene Eintraege aus einer Liste ziehen. */
function ziehMehrere<T>(liste: readonly T[], anzahl: number, rng: () => number): T[] {
  const uebrig = [...liste];
  const heraus: T[] = [];
  while (heraus.length < anzahl && uebrig.length > 0) {
    const stelle = Math.floor(rng() * uebrig.length);
    heraus.push(uebrig[stelle]);
    uebrig.splice(stelle, 1);
  }
  return heraus;
}

/**
 * Der Name.
 *
 * Drei von zehn Monstern bekommen einen Einzelnamen, der Rest eine
 * Zusammensetzung. Ohne den Einzelnamen heisst in einer Sammlung alles wie
 * ein Kompositum, und bei Tieren klingt „Fellhetzer" neben „Wolf" wie eine
 * Verlegenheitsloesung — was es vorher auch war.
 */
export function baueNamen(thema: Thema, sprache: Sprache, rng: () => number): string {
  if (thema.einzeln.length > 0 && rng() < 0.3) return text(zieh(thema.einzeln, rng), sprache);

  const erstes = text(zieh(thema.erstes, rng), sprache);
  const zweites = text(zieh(thema.zweites, rng), sprache);
  // Im Deutschen zusammengeschrieben, im Englischen getrennt: „Grabwandler"
  // gegen „Grave Walker". Andersherum sieht beides falsch aus.
  return sprache === 'en'
    ? `${erstes} ${zweites.charAt(0).toUpperCase()}${zweites.slice(1)}`
    : `${erstes}${zweites}`;
}

export function erzeugeMonster(wunsch: Wuensche, sprache: Sprache, rng: () => number): Monster {
  const ziel = richtwert(wunsch.cr) ?? richtwert('1')!;
  const thema = THEMEN.find((t) => t.id === wunsch.themaId) ?? zieh(THEMEN, rng);
  const rolle = ROLLEN.find((r) => r.id === wunsch.rolleId) ?? zieh(ROLLEN, rng);

  /*
   * Die Reihenfolge ist keine Geschmacksfrage.
   *
   * Erst die Widerstaende, dann die Werte: die Werte muessen wissen, wie
   * viel das Monster ohnehin schon aushaelt, sonst bekommt es die vollen
   * Trefferpunkte UND die Resistenz obendrauf.
   */
  const widerstaende = widerstaendeFuer(thema, ziel.wert, rng);
  const werte = werteFuer(ziel, rolle, rng, wunsch.legendaer ?? false, widerstaende);

  const profil = profilFuer(thema, rolle);
  const attribute = attributeFuer(ziel, profil, rng);
  const bewegung = bewegungFuer(thema, rng);

  const roh: Monster = {
    name: baueNamen(thema, sprache, rng),
    cr: ziel.cr,
    themaId: thema.id,
    thema: text(thema.name, sprache),
    rolleId: rolle.id,
    rolle: text(rolle.name, sprache),
    /*
     * Die Umgebung kommt NACH der Bewegung und richtet sich nach ihr.
     *
     * Vorher wurde sie frei gezogen, und im Bild der Oberflaeche stand ein
     * Elementar mit Schwimmbewegung in der Wueste. Siehe `umgebungen.ts`.
     */
    umgebung: umgebungName(umgebungFuer(thema.id, bewegung, rng), sprache),
    werte,
    attribute,
    hauptattribut: profil.haupt,
    bewegung,
    angriffe: [],
    widerstaende,
    faehigkeiten: alsEintraege(
      waehleFaehigkeiten(rolle, anzahlFaehigkeiten(ziel.wert, rng), rng, wunsch.legendaer ?? false),
      sprache,
      /*
       * Die Zahlen kommen aus den Richtwerten, nicht aus der Tabelle.
       *
       * „Ein Ziel muss eine Staerkerettung bestehen" ohne SG und „alle in 10
       * Fuss nehmen Schaden" ohne Wuerfel sind keine Faehigkeiten, sondern
       * Aufgaben fuer die Spielleitung. Siehe `platzhalter.ts`.
       */
      kampfzahlen(
        ziel.wert,
        werte.angriffsbonus,
        werte.schadenProRunde,
        thema.schaden,
        sprache
      )
    ),
    satz: text(rolle.satz, sprache)
  };
  return mitAngriffen(roh, rng, wunsch.kampfweite ?? 'egal');
}

/** Faehigkeiten in die Form bringen, in der sie im Statblock stehen. */
function alsEintraege(
  faehigkeiten: readonly Faehigkeit[],
  sprache: Sprache,
  zahlen: Kampfzahlen
): Faehigkeitseintrag[] {
  return faehigkeiten.map((f) => ({
    name: text(f.name, sprache),
    text: setzeZahlen(text(f.text, sprache), zahlen),
    kategorie: f.kategorie,
    ...(f.kostetAngriff ? { kostetAngriff: true as const } : {})
  }));
}

/**
 * Ein einzelnes Feld neu wuerfeln, der Rest bleibt stehen.
 *
 * Dasselbe Verhalten wie im NPC Creator: man wuerfelt nicht die ganze Figur
 * weg, weil einem der Name nicht gefaellt.
 */
export function wuerfleNeu(
  monster: Monster,
  feld: 'name' | 'umgebung' | 'angriffe' | 'faehigkeiten' | 'werte' | 'bewegung',
  sprache: Sprache,
  rng: () => number
): Monster {
  const thema = THEMEN.find((t) => t.id === monster.themaId) ?? THEMEN[0];
  const rolle = ROLLEN.find((r) => r.id === monster.rolleId) ?? ROLLEN[0];
  const ziel = richtwert(monster.cr) ?? richtwert('1')!;

  switch (feld) {
    case 'name':
      return { ...monster, name: baueNamen(thema, sprache, rng) };
    case 'umgebung':
      return {
        ...monster,
        umgebung: umgebungName(umgebungFuer(thema.id, monster.bewegung, rng), sprache)
      };
    case 'bewegung': {
      /*
       * Wer die Bewegung neu wuerfelt, wuerfelt die Umgebung mit.
       *
       * Sonst bekommt ein Monster aus der Wueste eine Schwimmbewegung, und
       * genau der Widerspruch sollte hier verschwinden. Die Umgebung ist
       * vom Wesen abhaengig, nicht umgekehrt.
       */
      const bewegung = bewegungFuer(thema, rng);
      return {
        ...monster,
        bewegung,
        umgebung: umgebungName(umgebungFuer(thema.id, bewegung, rng), sprache)
      };
    }
    case 'angriffe':
      // Nur die Angriffe neu, die Werte bleiben: der Rundenschaden ist
      // vorgegeben und wird nur anders aufgeteilt. Wer den Biss nicht mag,
      // will nicht gleich ein anderes Monster.
      return mitAngriffen(monster, rng);
    case 'faehigkeiten':
      // Die Angriffe muessen mit: eine neue Aura kostet einen Angriff,
      // eine weggewuerfelte gibt ihn zurueck.
      return mitAngriffen({
        ...monster,
        faehigkeiten: alsEintraege(
          waehleFaehigkeiten(
            rolle,
            anzahlFaehigkeiten(ziel.wert, rng),
            rng,
            monster.werte.legendaer ?? false
          ),
          sprache,
          // Dasselbe Monster, dieselben Zahlen: beim Nachwuerfeln der
          // Faehigkeiten aendert sich die Auswahl, nicht der Grad.
          kampfzahlen(
            ziel.wert,
            monster.werte.angriffsbonus,
            monster.werte.schadenProRunde,
            thema.schaden,
            sprache
          )
        )
      }, rng);
    case 'werte': {
      const werte = werteFuer(
        ziel,
        rolle,
        rng,
        monster.werte.legendaer ?? false,
        monster.widerstaende
      );
      // Die Angriffe haengen am Rundenschaden und muessen mit: sonst steht
      // im Statblock eine Summe, die nicht mehr aufgeht.
      return mitAngriffen({ ...monster, werte }, rng);
    }
  }
}

/**
 * Neue Angriffe zu den jetzigen Werten, und den Rest daran angeglichen.
 *
 * Angeglichen wird zweierlei. Die Attribute: traegt ein Bogen den Angriff,
 * muss die Geschicklichkeit zum Trefferbonus passen, auch wenn das Wesen
 * sonst ueber Staerke kaempft (Testbericht: „+7 bei GE +3"). Und der
 * Rundenschaden: die Wuerfel treffen den Schnitt nur ungefaehr, und der
 * Statblock soll die Summe nennen, die wirklich dasteht — solange die
 * Pruefung sie traegt.
 */
function mitAngriffen(monster: Monster, rng: () => number, kampfweite: Kampfweite = 'egal'): Monster {
  const thema = THEMEN.find((t) => t.id === monster.themaId) ?? THEMEN[0];
  const ziel = richtwert(monster.cr) ?? richtwert('1')!;
  const ab = abzweig(monster.faehigkeiten, monster.werte.schadenProRunde);
  const angriffe = baueAngriffe(
    {
      themaId: monster.themaId,
      rolleId: monster.rolleId,
      themenschaden: thema.schaden,
      kampfweite,
      angriffeProRunde: Math.max(1, ziel.angriffe - ab.weniger),
      schadenProRunde: Math.max(1, monster.werte.schadenProRunde - ab.schaden),
      angriffsbonus: monster.werte.angriffsbonus,
      attribute: monster.attribute,
      hauptattribut: monster.hauptattribut
    },
    rng
  );

  const hauptMod = modifikator(monster.attribute[monster.hauptattribut]);
  const attribute: Record<AttributId, number> = { ...monster.attribute };
  for (const angriff of angriffe) {
    const id = angriffsAttribut(angriff, monster.hauptattribut);
    if (modifikator(attribute[id]) < hauptMod) attribute[id] = 10 + hauptMod * 2;
  }

  const angeglichen: Werte = { ...monster.werte, schadenProRunde: angriffsschaden(angriffe) + ab.schaden };
  const werte = pruefe(angeglichen, monster.cr).urteil === 'passt' ? angeglichen : monster.werte;
  return { ...monster, angriffe, attribute, werte };
}

/**
 * Dasselbe Monster auf einem anderen Grad.
 *
 * Die Zahlen wandern, die Prosa bleibt: Name, Thema, Rolle und
 * Faehigkeitentexte sind dieselben. Angelegt wird damit ein zweiter Eintrag,
 * nicht der erste geaendert — ein Raeuberhauptmann CR 3 und einer CR 5 sind
 * zwei Monster, und beide will man behalten.
 *
 * Mitwandern muessen auch die Attribute: der Angriffsbonus steigt mit dem
 * Grad, und der haengt am Hauptattribut. Ein Raeuberhauptmann CR 5, der
 * seine CR-3-Staerke behaelt, hat einen Statblock, der sich widerspricht.
 */
export function alsVariante(monster: Monster, neuerCr: string, rng: () => number): Monster {
  const ziel = richtwert(neuerCr) ?? richtwert('1')!;
  const thema = THEMEN.find((t) => t.id === monster.themaId) ?? THEMEN[0];
  const rolle = ROLLEN.find((r) => r.id === monster.rolleId) ?? ROLLEN[0];
  const werte = werteFuer(ziel, rolle, rng, monster.werte.legendaer ?? false, monster.widerstaende);
  const profil = profilFuer(thema, rolle);
  const attribute = attributeFuer(ziel, profil, rng);

  return mitAngriffen({ ...monster, cr: ziel.cr, werte, attribute }, rng);
}

/**
 * Der Schaden je Angriff.
 *
 * Steht jetzt an jedem Angriff selbst; diese Funktion ist der bequeme Weg
 * fuer alles, was nur eine Zahl braucht — die Kacheln der Sammlung etwa.
 */
export function schadenJeAngriff(monster: Monster): number {
  const erster = monster.angriffe.find((angriff) => angriff.art !== 'flaeche');
  return erster?.schadenJeAngriff ?? monster.werte.schadenProRunde;
}

/** Wie viele Angriffe das Monster pro Runde macht, ohne die Flaeche. */
export function angriffeProRunde(monster: Monster): number {
  return monster.angriffe
    .filter((angriff) => angriff.art !== 'flaeche')
    .reduce((summe, angriff) => summe + angriff.anzahl, 0);
}

/** Besteht dieses Monster die eigene Pruefung? Bequemlichkeit fuer Tests und Oberflaeche. */
export function istStimmig(monster: Monster): boolean {
  return pruefe(monster.werte, monster.cr).urteil === 'passt';
}
