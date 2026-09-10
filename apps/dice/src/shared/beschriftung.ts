/**
 * Welche Ziffer auf welcher Flaeche steht.
 *
 * Reine Daten und reine Regeln, ohne three.js: so laesst sich das Einzige
 * pruefen, was hier schiefgehen kann, naemlich ein Vertipper in einer
 * Tabelle. Im Bild faellt so etwas erst auf, wenn jemand eine 13 zweimal
 * sieht.
 *
 * Echte Wuerfel sind so beschriftet, dass gegenueberliegende Flaechen sich
 * zur Seitenzahl plus eins ergaenzen: beim d20 liegt der 1 die 20 gegenueber,
 * beim d6 der 1 die 6. Der d4 kann das nicht — ein Tetraeder hat keine
 * parallelen Flaechen.
 */
import type { Art } from './formen';

/** Die Arten, die ueberhaupt beschriftet werden. Die Kugeln nicht. */
export const BESCHRIFTETE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const;
export type BeschrifteteArt = (typeof BESCHRIFTETE)[number];

export function istBeschriftet(art: Art): art is BeschrifteteArt {
  return (BESCHRIFTETE as readonly string[]).includes(art);
}

/**
 * Die Ziffern in der Reihenfolge der Flaechen.
 *
 * Der Index ist die Flaeche, der Wert die Ziffer. Gebaut wird die Liste, statt
 * sie hinzuschreiben: eine handgetippte Tabelle mit zwanzig Eintraegen ist
 * eine Einladung an den Zahlendreher, und die Regel dahinter ist einfach
 * genug.
 *
 * Die Flaechen kommen paarweise: erst eine, dann ihre gegenueberliegende. So
 * ergaenzen sich die Ziffern an den Stellen 2k und 2k+1 zur Seitenzahl plus
 * eins. Welche Flaeche welcher gegenueberliegt, ergibt sich aus der Geometrie
 * und wird dort ermittelt — hier steht nur, welche Zahlen ein Paar bilden.
 */
export function ziffernPaare(seiten: number): [number, number][] {
  const paare: [number, number][] = [];
  for (let ziffer = 1; ziffer <= seiten / 2; ziffer++) {
    paare.push([ziffer, seiten + 1 - ziffer]);
  }
  return paare;
}

/**
 * Die Ziffern des d4.
 *
 * Ohne Paare, weil es keine gegenueberliegenden Flaechen gibt. Gelesen wird
 * beim d4 ohnehin anders: es gibt keine obere Flaeche, sondern eine obere
 * Spitze. Wir lesen deshalb die Flaeche, die nach UNTEN zeigt — die liegt
 * auf dem Tisch auf, und ihre Ziffer ist die einzige, die man nicht sieht.
 * Das ist die verbreitete Loesung; die Alternative waere, die Ziffern an die
 * Spitzen zu schreiben, dreimal je Flaeche.
 */
export const D4_ZIFFERN = [1, 2, 3, 4] as const;

/**
 * Die Zuordnung Flaeche -> Ziffer fuer eine Art.
 *
 * `gegenueber` sagt fuer jede Flaeche, welche ihr gegenueberliegt, oder -1,
 * wenn es keine gibt. Diese Angabe kommt aus der Geometrie.
 */
export function ordneZiffernZu(seiten: number, gegenueber: readonly number[]): number[] {
  if (gegenueber.length !== seiten) {
    throw new Error(`${seiten} Flaechen erwartet, ${gegenueber.length} bekommen`);
  }

  // Der d4 und alles ohne Gegenstuecke: der Reihe nach durchzaehlen.
  if (gegenueber.every((g) => g < 0)) return Array.from({ length: seiten }, (_, i) => i + 1);

  const ziffern = new Array<number>(seiten).fill(0);
  const paare = ziffernPaare(seiten);
  let naechstes = 0;
  for (let flaeche = 0; flaeche < seiten; flaeche++) {
    if (ziffern[flaeche] !== 0) continue;
    const gegen = gegenueber[flaeche];
    if (gegen < 0) throw new Error(`Flaeche ${flaeche} hat kein Gegenstueck, andere aber schon`);
    const [klein, gross] = paare[naechstes++];
    ziffern[flaeche] = klein;
    ziffern[gegen] = gross;
  }
  return ziffern;
}

/**
 * Prueft die drei Regeln, die eine Beschriftung erfuellen muss.
 *
 * Gibt die Verstoesse zurueck, leer heisst in Ordnung. Als Funktion und nicht
 * als Test geschrieben, damit sie auch zur Laufzeit greifen kann, wenn eine
 * Geometrie sich einmal anders verhaelt als erwartet.
 */
export function pruefeBeschriftung(
  seiten: number,
  ziffern: readonly number[],
  gegenueber: readonly number[]
): string[] {
  const klagen: string[] = [];

  if (ziffern.length !== seiten) {
    klagen.push(`${seiten} Ziffern erwartet, ${ziffern.length} bekommen`);
    return klagen;
  }

  const fehlend = [];
  for (let ziffer = 1; ziffer <= seiten; ziffer++) {
    const wie_oft = ziffern.filter((z) => z === ziffer).length;
    if (wie_oft !== 1) fehlend.push(`${ziffer} kommt ${wie_oft}-mal vor`);
  }
  if (fehlend.length > 0) klagen.push(`jede Ziffer genau einmal: ${fehlend.join(', ')}`);

  for (let flaeche = 0; flaeche < seiten; flaeche++) {
    const gegen = gegenueber[flaeche];
    if (gegen < 0) continue;
    const summe = ziffern[flaeche] + ziffern[gegen];
    if (summe !== seiten + 1) {
      klagen.push(
        `Flaeche ${flaeche} (${ziffern[flaeche]}) und ${gegen} (${ziffern[gegen]}) ` +
          `ergeben ${summe} statt ${seiten + 1}`
      );
      break;
    }
  }

  return klagen;
}
