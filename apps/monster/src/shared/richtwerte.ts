/**
 * Die Richtwerte je Herausforderungsgrad.
 *
 * Das ist die Grundlage des ganzen Werkzeugs: was ein Monster eines
 * bestimmten CR ueblicherweise aushaelt und austeilt. Alles andere — der
 * Erzeuger, die Pruefung, die Vorschlaege — rechnet gegen diese Zahlen.
 *
 * HERKUNFT UND LIZENZ
 * ===================
 * Die Zahlen stammen aus dem *Lazy GM's 5e Monster Builder Resource
 * Document*, das unter Creative Commons Attribution 4.0 steht. Sie sind
 * unveraendert uebernommen, nur anders angeordnet.
 *
 * Die Lizenz verlangt eine Namensnennung, und die steht deshalb hier,
 * wortwoertlich wie gefordert:
 *
 *   This work includes material taken from the Lazy GM's 5e Monster Builder
 *   Resource Document written by Teos Abadía of Alphastream.org, Scott
 *   Fitzgerald Gray of Insaneangel.com, and Michael E. Shea of
 *   SlyFlourish.com, available under a Creative Commons Attribution 4.0
 *   International License.
 *
 * Dieselbe Nennung gehoert in den Ueber-Dialog und ins README. Sie
 * wegzulassen waere ein Lizenzbruch, kein Schoenheitsfehler.
 *
 * NICHT aus dem Dungeon Master's Guide. Dessen Kapitel zum Monsterbau steht
 * nicht im SRD und darf hier nicht liegen — auch nicht „nur die Zahlen".
 */

/** Ein Herausforderungsgrad mit seinen Richtwerten. */
export interface Richtwert {
  /** Wie der Grad geschrieben wird: '0', '1/8', … '30'. */
  readonly cr: string;
  /** Derselbe Grad als Zahl, zum Rechnen und Sortieren. */
  readonly wert: number;
  /** Ruestungsklasse — und zugleich der uebliche Rettungs-SG. */
  readonly rk: number;
  /** Trefferpunkte: der Mittelwert. */
  readonly tp: number;
  /** Und die Spanne, innerhalb derer ein Monster noch als passend gilt. */
  readonly tpVon: number;
  readonly tpBis: number;
  /** Angriffsbonus, und derselbe Wert fuer geuebte Rettungswuerfe. */
  readonly bonus: number;
  /** Erwarteter Schaden pro Runde, ueber alle Angriffe zusammen. */
  readonly schadenProRunde: number;
  /** Wie viele Angriffe daraus ueblicherweise gemacht werden. */
  readonly angriffe: number;
}

export const RICHTWERTE: readonly Richtwert[] = [
  { cr: '0', wert: 0.0, rk: 10, tp: 3, tpVon: 2, tpBis: 4, bonus: 2, schadenProRunde: 2, angriffe: 1 },
  { cr: '1/8', wert: 0.125, rk: 11, tp: 9, tpVon: 7, tpBis: 11, bonus: 3, schadenProRunde: 3, angriffe: 1 },
  { cr: '1/4', wert: 0.25, rk: 11, tp: 13, tpVon: 10, tpBis: 16, bonus: 3, schadenProRunde: 5, angriffe: 1 },
  { cr: '1/2', wert: 0.5, rk: 12, tp: 22, tpVon: 17, tpBis: 28, bonus: 4, schadenProRunde: 8, angriffe: 2 },
  { cr: '1', wert: 1.0, rk: 12, tp: 33, tpVon: 25, tpBis: 41, bonus: 5, schadenProRunde: 12, angriffe: 2 },
  { cr: '2', wert: 2.0, rk: 13, tp: 45, tpVon: 34, tpBis: 56, bonus: 5, schadenProRunde: 17, angriffe: 2 },
  { cr: '3', wert: 3.0, rk: 13, tp: 65, tpVon: 49, tpBis: 81, bonus: 5, schadenProRunde: 23, angriffe: 2 },
  { cr: '4', wert: 4.0, rk: 14, tp: 84, tpVon: 64, tpBis: 106, bonus: 6, schadenProRunde: 28, angriffe: 2 },
  { cr: '5', wert: 5.0, rk: 15, tp: 95, tpVon: 71, tpBis: 119, bonus: 7, schadenProRunde: 35, angriffe: 3 },
  { cr: '6', wert: 6.0, rk: 15, tp: 112, tpVon: 84, tpBis: 140, bonus: 7, schadenProRunde: 41, angriffe: 3 },
  { cr: '7', wert: 7.0, rk: 15, tp: 130, tpVon: 98, tpBis: 162, bonus: 7, schadenProRunde: 47, angriffe: 3 },
  { cr: '8', wert: 8.0, rk: 15, tp: 136, tpVon: 102, tpBis: 170, bonus: 7, schadenProRunde: 53, angriffe: 3 },
  { cr: '9', wert: 9.0, rk: 16, tp: 145, tpVon: 109, tpBis: 181, bonus: 8, schadenProRunde: 59, angriffe: 3 },
  { cr: '10', wert: 10.0, rk: 17, tp: 155, tpVon: 116, tpBis: 194, bonus: 9, schadenProRunde: 65, angriffe: 4 },
  { cr: '11', wert: 11.0, rk: 17, tp: 165, tpVon: 124, tpBis: 206, bonus: 9, schadenProRunde: 71, angriffe: 4 },
  { cr: '12', wert: 12.0, rk: 17, tp: 175, tpVon: 131, tpBis: 219, bonus: 9, schadenProRunde: 77, angriffe: 4 },
  { cr: '13', wert: 13.0, rk: 18, tp: 184, tpVon: 138, tpBis: 230, bonus: 10, schadenProRunde: 83, angriffe: 4 },
  { cr: '14', wert: 14.0, rk: 19, tp: 196, tpVon: 147, tpBis: 245, bonus: 11, schadenProRunde: 89, angriffe: 4 },
  { cr: '15', wert: 15.0, rk: 19, tp: 210, tpVon: 158, tpBis: 263, bonus: 11, schadenProRunde: 95, angriffe: 5 },
  { cr: '16', wert: 16.0, rk: 19, tp: 229, tpVon: 172, tpBis: 286, bonus: 11, schadenProRunde: 101, angriffe: 5 },
  { cr: '17', wert: 17.0, rk: 20, tp: 246, tpVon: 185, tpBis: 308, bonus: 12, schadenProRunde: 107, angriffe: 5 },
  { cr: '18', wert: 18.0, rk: 21, tp: 266, tpVon: 200, tpBis: 333, bonus: 13, schadenProRunde: 113, angriffe: 5 },
  { cr: '19', wert: 19.0, rk: 21, tp: 285, tpVon: 214, tpBis: 356, bonus: 13, schadenProRunde: 119, angriffe: 5 },
  { cr: '20', wert: 20.0, rk: 21, tp: 300, tpVon: 225, tpBis: 375, bonus: 13, schadenProRunde: 132, angriffe: 5 },
  { cr: '21', wert: 21.0, rk: 22, tp: 325, tpVon: 244, tpBis: 406, bonus: 14, schadenProRunde: 150, angriffe: 5 },
  { cr: '22', wert: 22.0, rk: 23, tp: 350, tpVon: 263, tpBis: 438, bonus: 15, schadenProRunde: 168, angriffe: 5 },
  { cr: '23', wert: 23.0, rk: 23, tp: 375, tpVon: 281, tpBis: 469, bonus: 15, schadenProRunde: 186, angriffe: 5 },
  { cr: '24', wert: 24.0, rk: 23, tp: 400, tpVon: 300, tpBis: 500, bonus: 15, schadenProRunde: 204, angriffe: 5 },
  { cr: '25', wert: 25.0, rk: 24, tp: 430, tpVon: 323, tpBis: 538, bonus: 16, schadenProRunde: 222, angriffe: 5 },
  { cr: '26', wert: 26.0, rk: 25, tp: 460, tpVon: 345, tpBis: 575, bonus: 17, schadenProRunde: 240, angriffe: 5 },
  { cr: '27', wert: 27.0, rk: 25, tp: 490, tpVon: 368, tpBis: 613, bonus: 17, schadenProRunde: 258, angriffe: 5 },
  { cr: '28', wert: 28.0, rk: 25, tp: 540, tpVon: 405, tpBis: 675, bonus: 17, schadenProRunde: 276, angriffe: 5 },
  { cr: '29', wert: 29.0, rk: 26, tp: 600, tpVon: 450, tpBis: 750, bonus: 18, schadenProRunde: 294, angriffe: 5 },
  { cr: '30', wert: 30.0, rk: 27, tp: 666, tpVon: 500, tpBis: 833, bonus: 19, schadenProRunde: 312, angriffe: 5 }
];

/** Der kleinste und der groesste Grad, die es gibt. */
export const KLEINSTER_CR = RICHTWERTE[0];
export const GROESSTER_CR = RICHTWERTE[RICHTWERTE.length - 1];

/** Die Richtwerte zu einem Grad, geschrieben wie in der Tabelle. */
export function richtwert(cr: string): Richtwert | undefined {
  return RICHTWERTE.find((eintrag) => eintrag.cr === cr);
}

/**
 * Der Grad, dessen Richtwert einer Zahl am naechsten kommt.
 *
 * Gebraucht wird das an mehreren Stellen der Pruefung: aus Trefferpunkten
 * einen CR machen, aus Schaden einen CR machen. Welche Spalte gemeint ist,
 * gibt der Aufrufer als Funktion mit — so steht die Suche einmal hier und
 * nicht dreimal nebenan.
 *
 * Bei gleichem Abstand gewinnt der NIEDRIGERE Grad. Ein Monster, das genau
 * zwischen zwei Graden liegt, lieber als das schwaechere zu fuehren ist die
 * sichere Richtung: eine unterschaetzte Begegnung ist eine langweilige, eine
 * ueberschaetzte kann den Abend beenden.
 */
export function naechsterCr(zahl: number, spalte: (eintrag: Richtwert) => number): Richtwert {
  let bester = RICHTWERTE[0];
  let besterAbstand = Math.abs(spalte(bester) - zahl);
  for (const eintrag of RICHTWERTE) {
    const abstand = Math.abs(spalte(eintrag) - zahl);
    if (abstand < besterAbstand) {
      besterAbstand = abstand;
      bester = eintrag;
    }
  }
  return bester;
}

/**
 * Zwischen zwei Graden linear vermitteln.
 *
 * `naechsterCr` springt in Stufen; fuer die Rechnung ist ein stetiger Wert
 * angenehmer, weil sich zwei davon mitteln lassen, ohne dass zweimal
 * gerundet wird. Unterhalb und oberhalb der Tabelle wird nicht
 * extrapoliert — dort gilt der Randwert.
 */
export function stetigerCr(zahl: number, spalte: (eintrag: Richtwert) => number): number {
  if (zahl <= spalte(RICHTWERTE[0])) return RICHTWERTE[0].wert;
  for (let i = 1; i < RICHTWERTE.length; i += 1) {
    const oben = RICHTWERTE[i];
    if (zahl <= spalte(oben)) {
      const unten = RICHTWERTE[i - 1];
      const spanne = spalte(oben) - spalte(unten);
      const anteil = spanne === 0 ? 0 : (zahl - spalte(unten)) / spanne;
      return unten.wert + anteil * (oben.wert - unten.wert);
    }
  }
  return GROESSTER_CR.wert;
}

/** Aus einem stetigen Wert wieder einen Grad der Tabelle machen. */
export function alsGrad(wert: number): Richtwert {
  return naechsterCr(wert, (eintrag) => eintrag.wert);
}
