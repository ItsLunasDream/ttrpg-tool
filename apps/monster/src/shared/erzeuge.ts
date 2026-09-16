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
import { LEGENDAER_FAKTOR, RK_ZU_TP, pruefe, type Werte } from './pruefung';
import {
  FAEHIGKEITEN,
  ROLLEN,
  THEMEN,
  UMGEBUNGEN,
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
  readonly schadensart: string;
  readonly werte: Werte;
  /** Wie viele Angriffe der Rundenschaden aufgeteilt wird. */
  readonly angriffe: number;
  readonly faehigkeiten: readonly { name: string; text: string }[];
  /** Ein Satz, was es ist. Aus Rolle und Thema, nicht aus der Luft. */
  readonly satz: string;
}

export interface Wuensche {
  readonly cr: string;
  /** Leer heisst: wird gewuerfelt. */
  readonly themaId?: string;
  readonly rolleId?: string;
  readonly legendaer?: boolean;
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
function anzahlFaehigkeiten(wert: number): number {
  if (wert < 1) return 1;
  if (wert < 5) return 2;
  return 3;
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
  legendaer = false
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
  // Was die Ruestung an wirksamen Trefferpunkten bringt, wird von den
  // rohen abgezogen — sie geht in die Pruefung ein.
  const ausRuestung = 1 + (rk - ziel.rk) * RK_ZU_TP;
  const ausLegende = legendaer ? LEGENDAER_FAKTOR : 1;

  const baue = (schub: number): Werte => ({
    tp: Math.max(1, Math.round(wertBeiStelle(stelle + schub, (e) => e.tp) / ausRuestung)),
    rk,
    schadenProRunde: Math.max(
      1,
      Math.round(wertBeiStelle(stelle - schub, (e) => e.schadenProRunde) / ausLegende)
    ),
    angriffsbonus: ziel.bonus,
    legendaer: legendaer || undefined
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

/** Faehigkeiten, die zur Rolle passen, ohne Wiederholung. */
function waehleFaehigkeiten(rolle: Rolle, anzahl: number, rng: () => number): Faehigkeit[] {
  const passend = FAEHIGKEITEN.filter((f) => !f.rollen || f.rollen.includes(rolle.id));
  const uebrig = [...passend];
  const heraus: Faehigkeit[] = [];
  while (heraus.length < anzahl && uebrig.length > 0) {
    const stelle = Math.floor(rng() * uebrig.length);
    heraus.push(uebrig[stelle]);
    uebrig.splice(stelle, 1);
  }
  return heraus;
}

/** Ein Name aus zwei Teilen des Themas. */
export function baueNamen(thema: Thema, sprache: Sprache, rng: () => number): string {
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

  const werte: Werte = werteFuer(ziel, rolle, rng, wunsch.legendaer ?? false);
  const faehigkeiten = waehleFaehigkeiten(rolle, anzahlFaehigkeiten(ziel.wert), rng).map((f) => ({
    name: text(f.name, sprache),
    text: text(f.text, sprache)
  }));

  return {
    name: baueNamen(thema, sprache, rng),
    cr: ziel.cr,
    themaId: thema.id,
    thema: text(thema.name, sprache),
    rolleId: rolle.id,
    rolle: text(rolle.name, sprache),
    umgebung: text(zieh(UMGEBUNGEN, rng), sprache),
    schadensart: text(zieh(thema.schaden, rng), sprache),
    werte,
    angriffe: ziel.angriffe,
    faehigkeiten,
    satz: text(rolle.satz, sprache)
  };
}

/**
 * Ein einzelnes Feld neu wuerfeln, der Rest bleibt stehen.
 *
 * Dasselbe Verhalten wie im NPC Creator: man wuerfelt nicht die ganze Figur
 * weg, weil einem der Name nicht gefaellt.
 */
export function wuerfleNeu(
  monster: Monster,
  feld: 'name' | 'umgebung' | 'schadensart' | 'faehigkeiten' | 'werte',
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
      return { ...monster, umgebung: text(zieh(UMGEBUNGEN, rng), sprache) };
    case 'schadensart':
      return { ...monster, schadensart: text(zieh(thema.schaden, rng), sprache) };
    case 'faehigkeiten':
      return {
        ...monster,
        faehigkeiten: waehleFaehigkeiten(rolle, anzahlFaehigkeiten(ziel.wert), rng).map((f) => ({
          name: text(f.name, sprache),
          text: text(f.text, sprache)
        }))
      };
    case 'werte':
      return { ...monster, werte: werteFuer(ziel, rolle, rng, monster.werte.legendaer ?? false) };
  }
}

/**
 * Dasselbe Monster auf einem anderen Grad.
 *
 * Die Zahlen wandern, die Prosa bleibt: Name, Thema, Rolle und
 * Faehigkeitentexte sind dieselben. Angelegt wird damit ein zweiter Eintrag,
 * nicht der erste geaendert — ein Raeuberhauptmann CR 3 und einer CR 5 sind
 * zwei Monster, und beide will man behalten.
 */
export function alsVariante(monster: Monster, neuerCr: string, rng: () => number): Monster {
  const ziel = richtwert(neuerCr) ?? richtwert('1')!;
  const rolle = ROLLEN.find((r) => r.id === monster.rolleId) ?? ROLLEN[0];
  return {
    ...monster,
    cr: ziel.cr,
    werte: werteFuer(ziel, rolle, rng, monster.werte.legendaer ?? false),
    angriffe: ziel.angriffe
  };
}

/** Der Schaden je Angriff, aus Rundenschaden und Anzahl. Nur zur Anzeige. */
export function schadenJeAngriff(monster: Monster): number {
  return Math.max(1, Math.round(monster.werte.schadenProRunde / Math.max(1, monster.angriffe)));
}

/** Besteht dieses Monster die eigene Pruefung? Bequemlichkeit fuer Tests und Oberflaeche. */
export function istStimmig(monster: Monster): boolean {
  return pruefe(monster.werte, monster.cr).urteil === 'passt';
}
