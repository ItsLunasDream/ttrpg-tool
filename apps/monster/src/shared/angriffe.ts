/**
 * Die Angriffe: womit ein Monster zuschlaegt, aus welcher Entfernung und
 * mit welchem Schaden.
 *
 * Vorher stand im Statblock eine Zeile „Angriff, +7 auf Treffer, Schaden 12
 * Stich". Das ist kein Angriff, das ist ein Platzhalter. Am Tisch will man
 * wissen, ob die Klaue kommt oder der Bogen, ob man in Deckung gehen kann
 * und ob der Kegel die halbe Gruppe erwischt.
 *
 * Drei Arten, und sie funktionieren verschieden:
 *
 *   nah      Angriffswurf gegen RK, Reichweite 5 bis 15 Fuss
 *   fern     Angriffswurf gegen RK, Reichweite in zwei Stufen (normal/weit)
 *   flaeche  kein Angriffswurf, sondern ein Rettungswurf gegen einen SG,
 *            dafuer trifft es alle in einem Kegel, einer Linie oder einem
 *            Quadrat
 *
 * Die Schadensart haengt an der Waffe und nicht am Wurf: ein Bogen macht
 * Stich, eine Axt Hieb, ein Odem das, was zum Wesen passt. Eine Klaue, die
 * Donnerschaden macht, ist kein Monster, sondern ein Tippfehler.
 *
 * Rein und ohne Zufall im Inneren. Der Zufallsgeber kommt herein.
 */

import { modifikator, type AttributId, type Attribute } from './attribute';
import { schadensart, schadensartName, type SchadensartId } from './schadensarten';
import { text, type Paar, type Sprache } from './tabellen';

export type Angriffsart = 'nah' | 'fern' | 'flaeche';

/** Was man sich beim Bauen wuenschen kann. */
export type Kampfweite = 'nah' | 'fern' | 'gemischt' | 'egal';

/** Die Form einer Flaeche. In D&D sind das genau diese vier. */
export type FlaechenForm = 'kegel' | 'linie' | 'quadrat' | 'kugel';

export interface Waffe {
  readonly id: string;
  readonly name: Paar;
  readonly art: Angriffsart;
  /**
   * Ob es eine gefuehrte Waffe ist oder ein Koerperteil.
   *
   * Daran haengt, wer sie ueberhaupt tragen kann: eine Bestie fuehrt keine
   * Hellebarde, und ein Konstrukt traegt keinen Kurzbogen — es sei denn,
   * jemand hat es dafuer gebaut.
   */
  readonly gefuehrt: boolean;
  /** Welche Schadensarten dazu passen. Die erste ist die uebliche. */
  readonly schaden: readonly SchadensartId[];
  /**
   * Ob die Schadensart stattdessen vom Wesen kommt.
   *
   * Ein Odem macht, was das Wesen ausmacht: der Drache Feuer, die Aberration
   * Saeure. Die Waffe gibt dann nur die Form vor, nicht die Art.
   */
  readonly schadenVomWesen?: boolean;
  /** Der Wuerfel, aus dem der Schaden gebaut wird. */
  readonly wuerfel: 4 | 6 | 8 | 10 | 12;
  /** Nahkampf: die Reichweite in Fuss. Fernkampf: normal und weit. */
  readonly reichweite?: number;
  readonly weite?: readonly [number, number];
  /** Flaechen: Form und Groesse in Fuss. */
  readonly form?: FlaechenForm;
  readonly groesse?: number;
  /** Welches Attribut man dagegen rettet. Nur bei Flaechen. */
  readonly rettung?: AttributId;
  /** Nur diese Arten von Wesen. Leer heisst: alle. */
  readonly themen?: readonly string[];
  /** Nur diese Rollen. Leer heisst: alle. */
  readonly rollen?: readonly string[];
}

/*
 * Die Waffen.
 *
 * Kein Versuch, das Regelwerk abzubilden — das waere eine Liste mit
 * fuenfzig Eintraegen, von denen vierzig gleich aussehen. Was hier steht,
 * deckt die Faelle ab, die am Tisch vorkommen, und jede Zeile macht einen
 * hoerbaren Unterschied: eine Hellebarde reicht zehn Fuss weit, ein Odem
 * trifft drei Leute auf einmal.
 */
export const WAFFEN: readonly Waffe[] = [
  /* --- Nahkampf, gefuehrte Waffen --- */
  { id: 'langschwert', name: { de: 'Langschwert', en: 'Longsword' }, art: 'nah', gefuehrt: true, schaden: ['hieb'], wuerfel: 8, reichweite: 5 },
  { id: 'kurzschwert', name: { de: 'Kurzschwert', en: 'Shortsword' }, art: 'nah', gefuehrt: true, schaden: ['stich'], wuerfel: 6, reichweite: 5 },
  { id: 'grossaxt', name: { de: 'Großaxt', en: 'Greataxe' }, art: 'nah', gefuehrt: true, schaden: ['hieb'], wuerfel: 12, reichweite: 5 },
  { id: 'handaxt', name: { de: 'Handaxt', en: 'Handaxe' }, art: 'nah', gefuehrt: true, schaden: ['hieb'], wuerfel: 6, reichweite: 5 },
  { id: 'hellebarde', name: { de: 'Hellebarde', en: 'Halberd' }, art: 'nah', gefuehrt: true, schaden: ['hieb'], wuerfel: 10, reichweite: 10 },
  { id: 'speer', name: { de: 'Speer', en: 'Spear' }, art: 'nah', gefuehrt: true, schaden: ['stich'], wuerfel: 6, reichweite: 5 },
  { id: 'pike', name: { de: 'Pike', en: 'Pike' }, art: 'nah', gefuehrt: true, schaden: ['stich'], wuerfel: 10, reichweite: 10 },
  { id: 'streitkolben', name: { de: 'Streitkolben', en: 'Mace' }, art: 'nah', gefuehrt: true, schaden: ['wucht'], wuerfel: 6, reichweite: 5 },
  { id: 'kriegshammer', name: { de: 'Kriegshammer', en: 'Warhammer' }, art: 'nah', gefuehrt: true, schaden: ['wucht'], wuerfel: 8, reichweite: 5 },
  { id: 'dolch', name: { de: 'Dolch', en: 'Dagger' }, art: 'nah', gefuehrt: true, schaden: ['stich'], wuerfel: 4, reichweite: 5 },
  { id: 'sense', name: { de: 'Sense', en: 'Scythe' }, art: 'nah', gefuehrt: true, schaden: ['hieb'], wuerfel: 10, reichweite: 10 },
  { id: 'kette', name: { de: 'Kette', en: 'Chain' }, art: 'nah', gefuehrt: true, schaden: ['wucht'], wuerfel: 6, reichweite: 10 },
  { id: 'peitsche', name: { de: 'Peitsche', en: 'Whip' }, art: 'nah', gefuehrt: true, schaden: ['hieb'], wuerfel: 4, reichweite: 10 },
  { id: 'stab', name: { de: 'Stab', en: 'Quarterstaff' }, art: 'nah', gefuehrt: true, schaden: ['wucht'], wuerfel: 6, reichweite: 5 },

  /* --- Nahkampf, natuerliche Waffen --- */
  { id: 'klaue', name: { de: 'Klaue', en: 'Claw' }, art: 'nah', gefuehrt: false, schaden: ['hieb'], wuerfel: 6, reichweite: 5 },
  { id: 'biss', name: { de: 'Biss', en: 'Bite' }, art: 'nah', gefuehrt: false, schaden: ['stich'], wuerfel: 8, reichweite: 5 },
  { id: 'hufschlag', name: { de: 'Hufschlag', en: 'Hooves' }, art: 'nah', gefuehrt: false, schaden: ['wucht'], wuerfel: 6, reichweite: 5 },
  { id: 'hieb', name: { de: 'Prankenhieb', en: 'Slam' }, art: 'nah', gefuehrt: false, schaden: ['wucht'], wuerfel: 8, reichweite: 5 },
  { id: 'schwanz', name: { de: 'Schwanzhieb', en: 'Tail' }, art: 'nah', gefuehrt: false, schaden: ['wucht'], wuerfel: 8, reichweite: 10 },
  { id: 'ranke', name: { de: 'Ranke', en: 'Tendril' }, art: 'nah', gefuehrt: false, schaden: ['wucht'], wuerfel: 6, reichweite: 15 },
  { id: 'stachel', name: { de: 'Stachel', en: 'Sting' }, art: 'nah', gefuehrt: false, schaden: ['stich', 'gift'], wuerfel: 6, reichweite: 5 },
  { id: 'horn', name: { de: 'Hornstoß', en: 'Gore' }, art: 'nah', gefuehrt: false, schaden: ['stich'], wuerfel: 8, reichweite: 5 },
  { id: 'griff', name: { de: 'Zermalmender Griff', en: 'Crushing Grip' }, art: 'nah', gefuehrt: false, schaden: ['wucht'], wuerfel: 10, reichweite: 5 },
  { id: 'beruehrung', name: { de: 'Zehrende Berührung', en: 'Withering Touch' }, art: 'nah', gefuehrt: false, schaden: ['nekrotisch'], wuerfel: 8, reichweite: 5 },
  { id: 'frostgriff', name: { de: 'Frostgriff', en: 'Frozen Grasp' }, art: 'nah', gefuehrt: false, schaden: ['kaelte'], wuerfel: 8, reichweite: 5 },
  { id: 'brandmal', name: { de: 'Brandmal', en: 'Searing Brand' }, art: 'nah', gefuehrt: false, schaden: ['feuer'], wuerfel: 8, reichweite: 5 },

  /* --- Fernkampf, gefuehrte Waffen --- */
  { id: 'langbogen', name: { de: 'Langbogen', en: 'Longbow' }, art: 'fern', gefuehrt: true, schaden: ['stich'], wuerfel: 8, weite: [150, 600] },
  { id: 'kurzbogen', name: { de: 'Kurzbogen', en: 'Shortbow' }, art: 'fern', gefuehrt: true, schaden: ['stich'], wuerfel: 6, weite: [80, 320] },
  { id: 'armbrust', name: { de: 'Schwere Armbrust', en: 'Heavy Crossbow' }, art: 'fern', gefuehrt: true, schaden: ['stich'], wuerfel: 10, weite: [100, 400] },
  { id: 'wurfspeer', name: { de: 'Wurfspeer', en: 'Javelin' }, art: 'fern', gefuehrt: true, schaden: ['stich'], wuerfel: 6, weite: [30, 120] },
  { id: 'schleuder', name: { de: 'Schleuder', en: 'Sling' }, art: 'fern', gefuehrt: true, schaden: ['wucht'], wuerfel: 4, weite: [30, 120] },
  { id: 'wurfnetz', name: { de: 'Wurfbeil', en: 'Throwing Axe' }, art: 'fern', gefuehrt: true, schaden: ['hieb'], wuerfel: 6, weite: [20, 60] },

  /* --- Fernkampf, natuerlich oder zauberhaft --- */
  { id: 'stachelsalve', name: { de: 'Stachelsalve', en: 'Spine Volley' }, art: 'fern', gefuehrt: false, schaden: ['stich'], wuerfel: 6, weite: [30, 120] },
  { id: 'saeurespucke', name: { de: 'Säurespucke', en: 'Acid Spit' }, art: 'fern', gefuehrt: false, schaden: ['saeure'], wuerfel: 6, weite: [30, 90] },
  { id: 'schattenpfeil', name: { de: 'Schattenpfeil', en: 'Shadow Bolt' }, art: 'fern', gefuehrt: false, schaden: ['nekrotisch'], wuerfel: 8, weite: [60, 120] },
  { id: 'funkenstoss', name: { de: 'Funkenstoß', en: 'Spark Bolt' }, art: 'fern', gefuehrt: false, schaden: ['blitz'], wuerfel: 8, weite: [60, 120] },
  { id: 'glutball', name: { de: 'Glutball', en: 'Ember Bolt' }, art: 'fern', gefuehrt: false, schaden: ['feuer'], wuerfel: 8, weite: [60, 120] },
  { id: 'geistesstoss', name: { de: 'Geistesstoß', en: 'Mind Lance' }, art: 'fern', gefuehrt: false, schaden: ['psychisch'], wuerfel: 8, weite: [60, 120] },
  { id: 'lichtspeer', name: { de: 'Lichtspeer', en: 'Radiant Lance' }, art: 'fern', gefuehrt: false, schaden: ['strahlend'], wuerfel: 8, weite: [60, 120] },

  /* --- Flaechen --- */
  { id: 'odem', name: { de: 'Odem', en: 'Breath Weapon' }, art: 'flaeche', gefuehrt: false, schaden: ['feuer'], schadenVomWesen: true, wuerfel: 6, form: 'kegel', groesse: 30, rettung: 'ge' },
  { id: 'strahl', name: { de: 'Strahl', en: 'Searing Line' }, art: 'flaeche', gefuehrt: false, schaden: ['blitz'], schadenVomWesen: true, wuerfel: 6, form: 'linie', groesse: 60, rettung: 'ge' },
  { id: 'schwall', name: { de: 'Schwall', en: 'Surge' }, art: 'flaeche', gefuehrt: false, schaden: ['wucht'], schadenVomWesen: true, wuerfel: 6, form: 'kugel', groesse: 20, rettung: 'ko' },
  { id: 'aufschlag', name: { de: 'Aufschlag', en: 'Ground Slam' }, art: 'flaeche', gefuehrt: false, schaden: ['wucht'], wuerfel: 6, form: 'quadrat', groesse: 15, rettung: 'ge' },
  { id: 'schrei', name: { de: 'Schrei', en: 'Howl' }, art: 'flaeche', gefuehrt: false, schaden: ['psychisch'], schadenVomWesen: true, wuerfel: 6, form: 'kugel', groesse: 30, rettung: 'we' },
  { id: 'sporen', name: { de: 'Sporenwolke', en: 'Spore Cloud' }, art: 'flaeche', gefuehrt: false, schaden: ['gift'], wuerfel: 6, form: 'kugel', groesse: 15, rettung: 'ko', themen: ['pflanze', 'aberration'] },
  { id: 'schwarzerodem', name: { de: 'Fäulnisodem', en: 'Rotting Breath' }, art: 'flaeche', gefuehrt: false, schaden: ['nekrotisch'], wuerfel: 6, form: 'kegel', groesse: 15, rettung: 'ko', themen: ['untot', 'unhold'] }
];

/**
 * Welche Waffen zu welcher Art von Wesen passen.
 *
 * Der Punkt, an dem ein Generator glaubwuerdig wird oder nicht: eine Bestie
 * mit Hellebarde hat noch jeden am Tisch aus der Geschichte geworfen.
 *
 * `gefuehrt` sagt, ob das Wesen Waffen ueberhaupt in die Hand nimmt.
 * `bevorzugt` sind die Kennungen, die ueberdurchschnittlich oft kommen —
 * ein Drache beisst nun einmal haeufiger, als er tritt.
 */
interface Waffenneigung {
  readonly gefuehrt: boolean;
  readonly bevorzugt: readonly string[];
}

const NEIGUNG: Record<string, Waffenneigung> = {
  untot: { gefuehrt: true, bevorzugt: ['klaue', 'beruehrung', 'sense', 'langschwert', 'schattenpfeil'] },
  bestie: { gefuehrt: false, bevorzugt: ['biss', 'klaue', 'horn', 'hufschlag', 'stachel'] },
  konstrukt: { gefuehrt: true, bevorzugt: ['hieb', 'griff', 'kriegshammer', 'armbrust'] },
  aberration: { gefuehrt: false, bevorzugt: ['ranke', 'biss', 'geistesstoss', 'saeurespucke'] },
  elementar: { gefuehrt: false, bevorzugt: ['hieb', 'brandmal', 'frostgriff', 'funkenstoss'] },
  unhold: { gefuehrt: true, bevorzugt: ['klaue', 'biss', 'grossaxt', 'peitsche', 'glutball'] },
  fee: { gefuehrt: true, bevorzugt: ['dolch', 'kurzbogen', 'ranke', 'geistesstoss'] },
  drache: { gefuehrt: false, bevorzugt: ['biss', 'klaue', 'schwanz'] },
  humanoid: { gefuehrt: true, bevorzugt: ['langschwert', 'kurzschwert', 'speer', 'langbogen', 'armbrust', 'streitkolben'] },
  pflanze: { gefuehrt: false, bevorzugt: ['ranke', 'hieb', 'stachelsalve'] }
};

/** Ein Eintrag aus einer Liste, mit dem uebergebenen Zufallsgeber. */
function zieh<T>(liste: readonly T[], rng: () => number): T {
  return liste[Math.floor(rng() * liste.length)];
}

/**
 * Die Waffen, die dieses Wesen ueberhaupt fuehren kann.
 *
 * Bevorzugte Waffen stehen doppelt in der Liste: das ist der billigste Weg
 * zu einer Gewichtung, und er bleibt mit einem einfachen Zufallsgeber
 * pruefbar.
 */
export function moeglicheWaffen(
  themaId: string,
  rolleId: string,
  art: Angriffsart
): Waffe[] {
  const neigung = NEIGUNG[themaId] ?? { gefuehrt: true, bevorzugt: [] };
  const passend = WAFFEN.filter((waffe) => {
    if (waffe.art !== art) return false;
    if (waffe.gefuehrt && !neigung.gefuehrt) return false;
    if (waffe.themen && !waffe.themen.includes(themaId)) return false;
    if (waffe.rollen && !waffe.rollen.includes(rolleId)) return false;
    return true;
  });
  const bevorzugt = passend.filter((waffe) => neigung.bevorzugt.includes(waffe.id));
  return [...passend, ...bevorzugt, ...bevorzugt];
}

export interface Angriff {
  readonly waffeId: string;
  readonly art: Angriffsart;
  /** Wie viele Angriffe dieser Art das Monster pro Runde macht. */
  readonly anzahl: number;
  /** Durchschnittsschaden EINES Angriffs. */
  readonly schadenJeAngriff: number;
  /** Der Wuerfelausdruck dazu: „2d8 + 4". */
  readonly wuerfel: string;
  readonly schadensartId: string;
  /** Bei nah und fern: der Bonus auf den Angriffswurf. */
  readonly trefferbonus?: number;
  /** Bei Flaechen: wogegen und gegen welchen SG gerettet wird. */
  readonly rettung?: { readonly attribut: AttributId; readonly sg: number };
  /** Bei Flaechen: ob sie erst wieder aufgeladen werden muss. */
  readonly aufladen?: boolean;
}

/** Die Waffe zu einer Kennung. `undefined`, wenn es sie nicht (mehr) gibt. */
export function waffe(id: string): Waffe | undefined {
  return WAFFEN.find((eine) => eine.id === id);
}

/**
 * Ein Wuerfelausdruck zu einem Durchschnitt.
 *
 * In D&D steht der Durchschnitt vorn und der Ausdruck in Klammern — „13
 * (2d8 + 4)". Verbindlich ist der Durchschnitt: er ist es, der in die
 * Pruefung eingeht. Der Ausdruck wird so gewaehlt, dass er moeglichst genau
 * dazu passt, und wenn er einen Punkt danebenliegt, gewinnt der
 * Durchschnitt.
 */
export function alsWuerfel(durchschnitt: number, wuerfelseiten: number, bonus: number): string {
  const ohneBonus = Math.max(1, durchschnitt - bonus);
  const proWuerfel = (wuerfelseiten + 1) / 2;
  const anzahl = Math.max(1, Math.round(ohneBonus / proWuerfel));
  const rest = Math.round(durchschnitt - anzahl * proWuerfel);
  const zeichen = rest === 0 ? '' : rest > 0 ? ` + ${rest}` : ` − ${Math.abs(rest)}`;
  return `${anzahl}d${wuerfelseiten}${zeichen}`;
}

/**
 * Die Reichweite als Text, wie sie im Statblock steht.
 *
 * Ohne Schlusspunkt: der Satz drumherum setzt seinen eigenen, und „5 ft.."
 * mit zwei Punkten stand prompt im ersten Bild der Oberflaeche.
 */
export function reichweiteText(waffe: Waffe, sprache: Sprache): string {
  const fuss = sprache === 'en' ? 'ft' : 'Fuß';
  if (waffe.art === 'nah') return `${waffe.reichweite ?? 5} ${fuss}`;
  if (waffe.art === 'fern') {
    const [nah, weit] = waffe.weite ?? [30, 120];
    return `${nah}/${weit} ${fuss}`;
  }
  const form: Record<FlaechenForm, Paar> = {
    kegel: { de: 'Kegel', en: 'cone' },
    linie: { de: 'Linie', en: 'line' },
    quadrat: { de: 'Quadrat', en: 'square' },
    kugel: { de: 'Umkreis', en: 'radius' }
  };
  return `${waffe.groesse ?? 15} ${fuss} ${text(form[waffe.form ?? 'kegel'], sprache)}`;
}

/** Der Name eines Angriffs in der eingestellten Sprache. */
export function angriffName(waffeId: string, sprache: Sprache): string {
  const waffe = WAFFEN.find((w) => w.id === waffeId);
  return waffe ? text(waffe.name, sprache) : waffeId;
}

/** Die Schadensart eines Angriffs als Text. */
export function angriffSchaden(angriff: Angriff, sprache: Sprache): string {
  return schadensartName(angriff.schadensartId, sprache);
}

export interface Angriffswunsch {
  readonly themaId: string;
  readonly rolleId: string;
  /** Die Schadensarten, die zum Wesen passen — fuer Odem und Zauberstoesse. */
  readonly themenschaden: readonly SchadensartId[];
  readonly kampfweite: Kampfweite;
  readonly angriffeProRunde: number;
  readonly schadenProRunde: number;
  readonly angriffsbonus: number;
  readonly attribute: Attribute;
  readonly hauptattribut: AttributId;
}

/**
 * Die Angriffe eines Monsters.
 *
 * Der Rundenschaden ist vorgegeben und wird AUFGETEILT, nicht dazugerechnet:
 * wer drei Angriffe zu je zwoelf Schaden macht, macht sechsunddreissig pro
 * Runde und nicht mehr. Genau deshalb kann die Aufschluesselung den
 * Herausforderungsgrad nicht verschieben — sie zeigt nur, woraus er besteht.
 *
 * Die Flaeche ist der Sonderfall: sie steht NEBEN den Angriffen und nicht
 * zwischen ihnen, weil sie in D&D eine eigene Aktion ist. Sie bekommt den
 * vollen Rundenschaden und dafuer ein Aufladen — im Schnitt ueber den Kampf
 * kommt das ungefaehr auf dasselbe heraus. Eine Annahme, und sie steht hier,
 * damit man sie nachlesen kann, statt sie zu erraten.
 */
export function baueAngriffe(wunsch: Angriffswunsch, rng: () => number): Angriff[] {
  const hauptMod = modifikator(wunsch.attribute[wunsch.hauptattribut]);
  const heraus: Angriff[] = [];

  /* Welche Art von Angriff die Runde traegt. */
  const weite: Angriffsart =
    wunsch.kampfweite === 'nah'
      ? 'nah'
      : wunsch.kampfweite === 'fern'
        ? 'fern'
        : wunsch.kampfweite === 'gemischt'
          ? 'nah'
          : rng() < 0.65
            ? 'nah'
            : 'fern';

  const haupt = waehleWaffe(wunsch, weite, rng);
  const anzahl = Math.max(1, wunsch.angriffeProRunde);
  const jeAngriff = Math.max(1, Math.round(wunsch.schadenProRunde / anzahl));

  heraus.push(baueAngriff(haupt, wunsch, anzahl, jeAngriff, hauptMod));

  /*
   * „Gemischt" heisst: einer von beiden, aber wirklich beide. Der zweite
   * Angriff ersetzt einen der ersten, statt dazuzukommen — sonst waere
   * „gemischt" die Einstellung, mit der das Monster am meisten austeilt.
   */
  if (wunsch.kampfweite === 'gemischt' && anzahl >= 2) {
    const zweite = waehleWaffe(wunsch, 'fern', rng);
    heraus[0] = baueAngriff(haupt, wunsch, anzahl - 1, jeAngriff, hauptMod);
    heraus.push(baueAngriff(zweite, wunsch, 1, jeAngriff, hauptMod));
  }

  /*
   * Eine Flaeche gibt es nicht immer — sonst hat jedes Monster einen Odem.
   * Mit dem Grad wird sie wahrscheinlicher: ein Wolf hat keinen, ein Drache
   * schon.
   */
  const flaechen = moeglicheWaffen(wunsch.themaId, wunsch.rolleId, 'flaeche');
  const chance = wunsch.angriffeProRunde >= 3 ? 0.35 : 0.15;
  if (flaechen.length > 0 && rng() < chance) {
    const waffe = zieh(flaechen, rng);
    heraus.push(baueAngriff(waffe, wunsch, 1, wunsch.schadenProRunde, 0));
  }

  return heraus;
}

function waehleWaffe(wunsch: Angriffswunsch, art: Angriffsart, rng: () => number): Waffe {
  const moeglich = moeglicheWaffen(wunsch.themaId, wunsch.rolleId, art);
  if (moeglich.length > 0) return zieh(moeglich, rng);
  // Kein Rueckfall auf irgendetwas: lieber die andere Weite als eine Waffe,
  // die zum Wesen nicht passt.
  const andere = moeglicheWaffen(wunsch.themaId, wunsch.rolleId, art === 'nah' ? 'fern' : 'nah');
  return andere.length > 0 ? zieh(andere, rng) : WAFFEN[0];
}

function baueAngriff(
  waffe: Waffe,
  wunsch: Angriffswunsch,
  anzahl: number,
  schaden: number,
  hauptMod: number
): Angriff {
  /*
   * Die Schadensart einer Flaeche kommt vom Wesen — aber nur, wenn zum
   * Wesen ueberhaupt etwas passt.
   *
   * Der Fall, der das aufgedeckt hat: ein Humanoider hat als Schadensarten
   * Hieb, Stich und Wucht, und der „Strahl" nahm die erste davon. Im
   * Statblock stand dann ein Strahl, der Hiebschaden macht. Ein Strahl
   * schneidet nicht, und genau solche Zeilen werfen am Tisch jeden aus der
   * Geschichte.
   *
   * Deshalb: eine Flaeche nimmt nur eine NICHT koerperliche Art des Wesens.
   * Gibt es keine, bleibt es bei dem, was die Waffe selbst mitbringt.
   */
  const vomWesen = wunsch.themenschaden.find((id) => !schadensart(id)?.koerperlich);
  const schadensartId = waffe.schadenVomWesen
    ? (vomWesen ?? waffe.schaden[0])
    : waffe.schaden[0];

  if (waffe.art === 'flaeche') {
    return {
      waffeId: waffe.id,
      art: 'flaeche',
      anzahl: 1,
      schadenJeAngriff: schaden,
      // Kein Attributsbonus auf Flaechenschaden: in D&D haengt der an keinem
      // Angriffswurf, und der Wuerfelausdruck steht ohne Zuschlag da.
      wuerfel: alsWuerfel(schaden, waffe.wuerfel, 0),
      schadensartId,
      rettung: { attribut: waffe.rettung ?? 'ge', sg: 8 + wunsch.angriffsbonus },
      aufladen: true
    };
  }

  return {
    waffeId: waffe.id,
    art: waffe.art,
    anzahl,
    schadenJeAngriff: schaden,
    wuerfel: alsWuerfel(schaden, waffe.wuerfel, hauptMod),
    schadensartId,
    trefferbonus: wunsch.angriffsbonus
  };
}

/**
 * Was die Angriffe zusammen pro Runde austeilen.
 *
 * Ohne die Flaeche: die ist eine eigene Aktion und kommt nicht zusaetzlich.
 * Diese Zahl muss dem Rundenschaden entsprechen, mit dem die Pruefung
 * rechnet — ein Test besteht darauf.
 */
export function schadenProRunde(angriffe: readonly Angriff[]): number {
  return angriffe
    .filter((angriff) => angriff.art !== 'flaeche')
    .reduce((summe, angriff) => summe + angriff.anzahl * angriff.schadenJeAngriff, 0);
}
