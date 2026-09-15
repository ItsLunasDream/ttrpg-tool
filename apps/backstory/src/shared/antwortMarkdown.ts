/**
 * Liest die Antwort des Assistenten als Markdown.
 *
 * Das Modell zeichnet aus, ob man es will oder nicht: Stichpunkte, fette
 * Zwischenueberschriften, gelegentlich ein Codeblock. Frueher stand die
 * Antwort als reiner Text in der Oberflaeche, und die Sternchen waren
 * sichtbar.
 *
 * Bewusst kein Markdown-Leser von der Stange und bewusst kein HTML: die
 * Antwort kommt von einem Sprachmodell. Hier entstehen nur Bausteine, aus
 * denen die Oberflaeche Elemente baut — ein `<script>` in der Antwort bleibt
 * damit unter allen Umstaenden Text.
 *
 * Halbe Auszeichnung bleibt stehen, wie sie ist. Die Antwort trifft
 * stueckweise ein, und ein noch nicht geschlossenes `**` darf weder
 * flackern noch den Rest verschlucken.
 *
 * Plattformfrei: kein node:*, kein electron, kein React.
 */

export type Auszeichnung = 'text' | 'fett' | 'kursiv' | 'code';

export interface Stueck {
  readonly art: Auszeichnung;
  readonly text: string;
}

export type Baustein =
  | { readonly art: 'absatz'; readonly stuecke: Stueck[] }
  | { readonly art: 'ueberschrift'; readonly stufe: number; readonly stuecke: Stueck[] }
  | { readonly art: 'liste'; readonly nummeriert: boolean; readonly punkte: Stueck[][] }
  | { readonly art: 'code'; readonly text: string };

/**
 * Nur geschlossene Paare zaehlen. Ein einzelnes Sternchen im Satz bleibt ein
 * Sternchen, und das gilt auch fuer die halb angekommene Antwort.
 *
 * Direkt hinter dem oeffnenden und vor dem schliessenden Zeichen darf kein
 * Leerraum stehen, sonst waere "2 * 3 * 4" kursiv. Der Unterstrich braucht
 * zusaetzlich freie Raender, sonst zerlegte er Namen wie `feld_name_zwei`.
 */
const INLINE =
  /`([^`]+)`|\*\*(\S(?:[^*]*\S)?)\*\*|(?<!\w)__(\S(?:[^_]*\S)?)__(?!\w)|\*(\S(?:[^*]*\S)?)\*|(?<!\w)_(\S(?:[^_]*\S)?)_(?!\w)/g;

const AUFZAEHLUNG = /^\s{0,3}[-*+]\s+(.*)$/;
const NUMMERIERT = /^\s{0,3}\d+[.)]\s+(.*)$/;
const UEBERSCHRIFT = /^\s{0,3}(#{1,6})\s+(.*)$/;
const ZAUN = /^\s{0,3}(?:```|~~~)/;

export function leseStuecke(zeile: string): Stueck[] {
  const stuecke: Stueck[] = [];
  let zuletzt = 0;

  for (const treffer of zeile.matchAll(INLINE)) {
    const start = treffer.index ?? 0;
    if (start > zuletzt) stuecke.push({ art: 'text', text: zeile.slice(zuletzt, start) });

    const [, code, fett, fettUnten, kursiv, kursivUnten] = treffer;
    if (code !== undefined) stuecke.push({ art: 'code', text: code });
    else if (fett !== undefined || fettUnten !== undefined) {
      stuecke.push({ art: 'fett', text: (fett ?? fettUnten) as string });
    } else stuecke.push({ art: 'kursiv', text: (kursiv ?? kursivUnten) as string });

    zuletzt = start + treffer[0].length;
  }

  if (zuletzt < zeile.length) stuecke.push({ art: 'text', text: zeile.slice(zuletzt) });
  return stuecke;
}

export function leseAntwort(antwort: string): Baustein[] {
  const bausteine: Baustein[] = [];
  const zeilen = antwort.split('\n');
  let absatz: string[] = [];

  function absatzAbschliessen(): void {
    if (absatz.length === 0) return;
    bausteine.push({ art: 'absatz', stuecke: leseStuecke(absatz.join('\n')) });
    absatz = [];
  }

  for (let i = 0; i < zeilen.length; i += 1) {
    const zeile = zeilen[i];

    if (ZAUN.test(zeile)) {
      absatzAbschliessen();
      const inhalt: string[] = [];
      i += 1;
      // Ein noch nicht geschlossener Zaun am Ende gehoert zur laufenden
      // Antwort. Sein Inhalt wird trotzdem schon gezeigt.
      while (i < zeilen.length && !ZAUN.test(zeilen[i])) {
        inhalt.push(zeilen[i]);
        i += 1;
      }
      bausteine.push({ art: 'code', text: inhalt.join('\n') });
      continue;
    }

    const ueberschrift = UEBERSCHRIFT.exec(zeile);
    if (ueberschrift) {
      absatzAbschliessen();
      bausteine.push({
        art: 'ueberschrift',
        stufe: ueberschrift[1].length,
        stuecke: leseStuecke(ueberschrift[2])
      });
      continue;
    }

    const punkt = AUFZAEHLUNG.exec(zeile) ?? NUMMERIERT.exec(zeile);
    if (punkt) {
      absatzAbschliessen();
      const nummeriert = AUFZAEHLUNG.exec(zeile) === null;
      const letzter = bausteine[bausteine.length - 1];
      // Aufeinanderfolgende Punkte gehoeren in dieselbe Liste, sonst stuende
      // zwischen je zwei Stichpunkten ein Absatzabstand.
      if (letzter && letzter.art === 'liste' && letzter.nummeriert === nummeriert) {
        letzter.punkte.push(leseStuecke(punkt[1]));
      } else {
        bausteine.push({ art: 'liste', nummeriert, punkte: [leseStuecke(punkt[1])] });
      }
      continue;
    }

    if (zeile.trim() === '') absatzAbschliessen();
    else absatz.push(zeile);
  }

  absatzAbschliessen();
  return bausteine;
}
