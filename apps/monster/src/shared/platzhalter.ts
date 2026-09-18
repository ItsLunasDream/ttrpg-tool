/**
 * Zahlen in den Faehigkeitstexten.
 *
 * Die Tabellen sind fuer jeden Grad dieselben, die Zahlen nicht. „Ein Ziel
 * muss eine Staerkerettung bestehen" ohne Schwierigkeitsgrad ist am Tisch
 * eine Rueckfrage, und „alle in 10 Fuss Umkreis nehmen Schaden" ohne Wuerfel
 * ist eine Aufgabe fuer die Spielleitung statt einer Fertigstellung — beides
 * stand so in der Oberflaeche und wurde zu Recht beanstandet.
 *
 * Die Texte tragen deshalb Platzhalter, die beim Erzeugen aus den
 * Richtwerten des Grades gefuellt werden. Damit bleibt die Regel des
 * Werkzeugs gewahrt: die Tabellen liefern die FORM, die Zahlen kommen aus
 * der Eichung.
 *
 *   {sg}            der Rettungsschwierigkeitsgrad
 *   {schaden}       ein Wuerfelausdruck fuer eine grosse Wirkung (2 Aktionen)
 *   {kleinerSchaden} derselbe fuer eine kleine (1 Aktion)
 *   {schadensart}   die Schadensart des Themas
 *
 * Plattformfrei, wie alles unter `shared`.
 */

import { alsWuerfel } from './angriffe';
import { rettungsSg } from './attribute';
import { schadensartName } from './schadensarten';
import type { Sprache } from './tabellen';

export interface Kampfzahlen {
  /** Rettungs-SG gegen die Wirkungen dieses Monsters. */
  readonly sg: number;
  /** Wuerfelausdruck fuer eine Wirkung, die zwei legendaere Aktionen kostet. */
  readonly schaden: string;
  /** Wuerfelausdruck fuer eine Wirkung, die eine kostet. */
  readonly kleinerSchaden: string;
  /** Die Schadensart, die zum Thema passt. */
  readonly schadensart: string;
}

/**
 * Wie viel von einem Rundenschaden eine grosse Zusatzwirkung ausmacht.
 *
 * Eine legendaere Aktion fuer zwei Punkte trifft mehrere und kommt einmal je
 * Runde — sie darf spuerbar sein, aber nicht den Angriff ersetzen. Die
 * beiden Anteile sind eine Entscheidung und keine Messung; sie stehen hier
 * an einer Stelle, damit man sie an einer Stelle aendern kann.
 */
export const ANTEIL_GROSS = 0.6;
export const ANTEIL_KLEIN = 0.3;

/*
 * Den Rettungs-SG gibt es schon: `rettungsSg()` in `attribute.ts`, als
 * 8 + Angriffsbonus. Hier stand kurz ein zweiter, der 8 + Uebungsbonus +
 * Modifikator rechnete — dasselbe Ergebnis, weil der Angriffsbonus genau
 * daraus besteht, aber zwei Formeln fuer eine Zahl laufen frueher oder
 * spaeter auseinander. Der Namensstreit ist im Test sofort aufgefallen:
 * zwei gleich heissende Ausfuhren, und die Sammelstelle lieferte keine.
 */

export function kampfzahlen(
  angriffsbonus: number,
  schadenProRunde: number,
  themenschaden: readonly string[],
  sprache: Sprache
): Kampfzahlen {
  return {
    sg: rettungsSg(angriffsbonus),
    // Zehnseitig fuer die grosse Wirkung, sechsseitig fuer die kleine: das
    // liest sich wie ein Statblock und nicht wie eine Rechnung.
    schaden: alsWuerfel(Math.max(1, Math.round(schadenProRunde * ANTEIL_GROSS)), 10, 0),
    kleinerSchaden: alsWuerfel(Math.max(1, Math.round(schadenProRunde * ANTEIL_KLEIN)), 6, 0),
    schadensart: schadensartMitWort(themenschaden[0] ?? 'wucht', sprache)
  };
}

/**
 * Die Schadensart, wie sie im Statblock steht.
 *
 * Nicht „2W6 Feuer", sondern „2W6 Feuerschaden" — im Deutschen
 * zusammengeschrieben, im Englischen mit „damage" dahinter. Der erste Anlauf
 * setzte nur den Namen ein, und im Statblock stand „2d6 + 1 fire each".
 *
 * Die Arten, deren Name schon ein Eigenschaftswort ist („nekrotisch",
 * „psychisch", „strahlend"), tragen es im Deutschen davor statt
 * angehaengt — „nekrotischschaden" gibt es nicht.
 */
export function schadensartMitWort(id: string, sprache: Sprache): string {
  const name = schadensartName(id, sprache);
  if (sprache === 'en') return `${name} damage`;
  /*
   * Im AKKUSATIV, nicht im Nominativ.
   *
   * Die Saetze, in denen der Platzhalter steht, verlangen ihn alle: „nimmt
   * …", „nehmen …", „je …". Der erste Anlauf schrieb „nimmt 3d6 psychischer
   * Schaden", und das steht so in keinem Statblock.
   */
  return /^[a-zäöü]/.test(name) ? `${name}en Schaden` : `${name}schaden`;
}

/**
 * Die Platzhalter eines Textes fuellen.
 *
 * Was nicht bekannt ist, bleibt stehen — ein sichtbares `{sg}` ist besser
 * als eine stillschweigend falsche Zahl, und der Test darunter faellt
 * darueber.
 */
export function setzeZahlen(text_: string, zahlen: Kampfzahlen): string {
  return text_
    .replace(/\{sg\}/g, String(zahlen.sg))
    .replace(/\{schaden\}/g, zahlen.schaden)
    .replace(/\{kleinerSchaden\}/g, zahlen.kleinerSchaden)
    .replace(/\{schadensart\}/g, zahlen.schadensart);
}

/** Alle Platzhalter, die es gibt. Fuer die Pruefung der Tabellen. */
export const PLATZHALTER = ['sg', 'schaden', 'kleinerSchaden', 'schadensart'] as const;

/** Platzhalter, die ein Text nennt, die es aber nicht gibt. */
export function unbekanntePlatzhalter(text_: string): string[] {
  const gefunden = [...text_.matchAll(/\{([A-Za-zäöüÄÖÜß]+)\}/g)].map((treffer) => treffer[1]);
  return gefunden.filter((name) => !PLATZHALTER.includes(name as (typeof PLATZHALTER)[number]));
}
