/**
 * Das Gewicht eines Zustands — und was es ehrlicherweise NICHT sagt.
 *
 * Beim Monster steht die Frage fest: vier Figuren, ein Kampf, wie lange
 * haelt es durch. Beim Zustand fehlt genau die Angabe, die alles
 * entscheidet — wie oft man ihn bekommt und wie leicht man ihn wieder los
 * wird. Derselbe Frostzustand ist harmlos, wenn die Gruppe alle zwei
 * Stunden an ein Feuer kommt, und toedlich auf einem Gletschermarsch ohne
 * Holz.
 *
 * Eine Zahl, die so taete, als wuesste sie das, waere eine
 * Scheingenauigkeit — und die ist schlimmer als gar keine Zahl, weil sie
 * Sicherheit gibt, wo keine ist.
 *
 * WAS SICH RECHNEN LAESST, ist deshalb nicht „Balance", sondern das
 * GEWICHT: wie schwer der Zustand wiegt, solange er anliegt. Damit sagt das
 * Werkzeug drei Dinge, die alle stimmen:
 *
 *   1. „Wiegt 14 — so viel wie fuenf Stufen Erschoepfung."
 *   2. „Der Sprung von Stufe 3 auf 4 verdoppelt das Gewicht."
 *   3. „Das passt nicht zu deinem Regler."
 *
 * Und eines sagt es nicht, sondern schreibt es ausdruecklich hin: ob der
 * Zustand fuer DEINE Kampagne zu hart ist.
 */

import { HAERTEN, type Haerte } from './tabellen';
import { schwereWert, wirkung, type Wirkung } from './wirkungen';

/** Eine Stufe: was auf ihr dazukommt. */
export interface Stufe {
  /** Die Nummer, bei 1 beginnend. */
  readonly nummer: number;
  /** Die Kennungen der Wirkungen dieser Stufe. */
  readonly wirkungen: readonly string[];
}

/**
 * Das Gewicht EINER Stufe.
 *
 * Kumulativ gedacht: in D&D bleibt eine erreichte Stufe stehen, die hoehere
 * kommt dazu. Wer nur die oberste zaehlte, unterschaetzte jeden gestuften
 * Zustand.
 */
export function stufengewicht(stufe: Stufe): number {
  return stufe.wirkungen.reduce((summe, id) => summe + (wirkung(id)?.punkte ?? 0), 0);
}

/** Das Gewicht bis einschliesslich einer Stufe. */
export function gewichtBis(stufen: readonly Stufe[], nummer: number): number {
  return stufen
    .filter((stufe) => stufe.nummer <= nummer)
    .reduce((summe, stufe) => summe + stufengewicht(stufe), 0);
}

/**
 * Der Betrag eines Gewichts.
 *
 * Wie schwer der Zustand wiegt, ohne zu fragen, in welche Richtung. Steht
 * hier und nicht verstreut in der Oberflaeche, damit „schwer" ueberall
 * dasselbe heisst.
 */
export function betragVon(gewicht: number): number {
  return Math.abs(gewicht);
}

/** Das Gewicht des ganzen Zustands: alle Stufen zusammen. */
export function gesamtgewicht(stufen: readonly Stufe[]): number {
  return stufen.reduce((summe, stufe) => summe + stufengewicht(stufe), 0);
}

/** Was bei der Pruefung eines Zustands herauskam. */
export interface Befund {
  readonly gewicht: number;
  /** Das Gewicht je Stufe, kumulativ — die Kurve, die man sehen will. */
  readonly kurve: readonly number[];
  /** Stimmt die Reihenfolge: wird jede Stufe schlimmer als die davor? */
  readonly steigtAn: boolean;
  /** Stufen, auf denen es NICHT schlimmer wird. Leer heisst: alles gut. */
  readonly flacheStufen: readonly number[];
  /** Stufen, bei denen der Sprung auffaellig gross ist. */
  readonly spruenge: readonly number[];
  /** Kommt eine Wirkung zweimal vor? */
  readonly doppelte: readonly string[];
  /** Passt das Gewicht zur eingestellten Haerte? */
  readonly passtZurHaerte: boolean;
  readonly haerteVon: number;
  readonly haerteBis: number;
  /** Das Gesamturteil, fuer die Ampel. */
  readonly urteil: 'passt' | 'zu schwer' | 'zu leicht' | 'kaputt';
}

/**
 * Wann ein Sprung „auffaellig" ist.
 *
 * Eine Verdopplung. Das ist eine Entscheidung und keine Messung: ungleiche
 * Stufen sind der haeufigste Fehler bei selbstgebauten Zustaenden, und beim
 * Schreiben sieht man sie nicht. Ein Hinweis, der zu oft kommt, wird
 * ignoriert — deshalb erst bei Faktor zwei und nicht bei anderthalb.
 */
const SPRUNG_FAKTOR = 2;

export function pruefe(stufen: readonly Stufe[], haerteId: string): Befund {
  const haerte: Haerte = HAERTEN.find((h) => h.id === haerteId) ?? HAERTEN[1];
  const sortiert = [...stufen].sort((a, b) => a.nummer - b.nummer);

  const kurve: number[] = [];
  let summe = 0;
  for (const stufe of sortiert) {
    summe += stufengewicht(stufe);
    kurve.push(summe);
  }

  /*
   * Flach heisst: die Stufe bringt nichts dazu.
   *
   * Das ist kein Geschmack, sondern kaputt — wer von Stufe 2 auf 3 geht und
   * nichts merkt, hat eine Stufe zu viel im Zustand.
   */
  /*
   * Gerechnet wird auf dem BETRAG, nicht auf dem Vorzeichen.
   *
   * Ein Segen besteht aus lauter Buffs, und die wiegen negativ — seine Kurve
   * faellt also, waehrend der Zustand staerker wird. Auf dem Vorzeichen
   * geprueft galt jeder Segen als kaputt, und zwar dafuer, dass er ein Segen
   * ist.
   *
   * Der Betrag stimmt fuer beide Richtungen: ein Zustand wird staerker, wenn
   * er weiter von der Null wegwaechst. Bei „gemischt" heben sich Buff und
   * Debuff teilweise auf — auch das ist richtig so, ein Zustand, der gibt
   * und nimmt, wiegt weniger als einer, der nur nimmt.
   */
  const betraege = kurve.map((wert) => Math.abs(wert));

  const flacheStufen: number[] = [];
  const spruenge: number[] = [];
  for (let i = 1; i < betraege.length; i += 1) {
    const zuwachs = betraege[i] - betraege[i - 1];
    if (zuwachs <= 0) flacheStufen.push(sortiert[i].nummer);
    const vorher = betraege[i - 1] - (i >= 2 ? betraege[i - 2] : 0);
    if (vorher > 0 && zuwachs >= vorher * SPRUNG_FAKTOR && zuwachs - vorher >= 3) {
      spruenge.push(sortiert[i].nummer);
    }
  }

  const gesehen = new Set<string>();
  const doppelte: string[] = [];
  for (const stufe of sortiert) {
    for (const id of stufe.wirkungen) {
      if (gesehen.has(id)) doppelte.push(id);
      gesehen.add(id);
    }
  }

  const gewicht = summe;
  // Auch die Haerte misst den Betrag: ein Segen, der viel gibt, ist genauso
  // „schwer" wie ein Fluch, der viel nimmt.
  const betrag = Math.abs(gewicht);
  const passtZurHaerte = betrag >= haerte.gewichtVon && betrag <= haerte.gewichtBis;
  const steigtAn = flacheStufen.length === 0;

  /*
   * „Kaputt" ist etwas anderes als „zu schwer".
   *
   * Zu schwer heisst: die Zahlen stimmen, der Regler passt nicht dazu. Das
   * ist eine Frage der Absicht. Kaputt heisst: der Zustand widerspricht
   * sich selbst — eine Stufe, die nichts bringt, oder dieselbe Wirkung
   * zweimal. Das ist keine Frage der Absicht, sondern ein Fehler.
   */
  const urteil: Befund['urteil'] = !steigtAn || doppelte.length > 0
    ? 'kaputt'
    : passtZurHaerte
      ? 'passt'
      : betrag > haerte.gewichtBis
        ? 'zu schwer'
        : 'zu leicht';

  return {
    gewicht,
    kurve,
    steigtAn,
    flacheStufen,
    spruenge,
    doppelte,
    passtZurHaerte,
    haerteVon: haerte.gewichtVon,
    haerteBis: haerte.gewichtBis,
    urteil
  };
}

/**
 * Passt eine Wirkung noch zu dieser Stufe?
 *
 * Die Regel, die den Erzeuger beisammenhaelt: eine Stufe darf keine
 * Wirkung tragen, die leichter ist als die der Stufe davor. Sonst wird ein
 * Zustand auf Stufe 4 harmloser als auf Stufe 2, und das merkt man am Tisch
 * sofort.
 */
export function darfAufStufe(neu: Wirkung, vorher: readonly Wirkung[]): boolean {
  if (vorher.length === 0) return true;
  const hoechste = Math.max(...vorher.map((w) => schwereWert(w.schwere)));
  return schwereWert(neu.schwere) >= hoechste;
}
