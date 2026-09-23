/**
 * Verweise im offiziellen Text: erkannt, nicht geschrieben.
 *
 * Der Regeltext bleibt Zeichen fuer Zeichen, wie er ist. Beim Anzeigen wird
 * er in Stuecke zerlegt, und die Stuecke, die einen kuratierten Begriff
 * treffen (`@suite/srd/verweise`), werden zu Verweisen. Drei Regeln aus dem
 * Konzept (docs/nachschlagewerk.md), nicht verhandelbar:
 *
 * - nur kuratierte Begriffe;
 * - nur das erste Vorkommen je Eintrag — wer „Prone" dreimal in vier Zeilen
 *   liest, braucht nicht dreimal denselben Verweis;
 * - nie auf den eigenen Eintrag.
 */
import { verweisformen } from '@suite/srd/verweise';

export type Stueck = string | { readonly text: string; readonly ziel: string };

/** Ein Buchstabe oder eine Ziffer davor oder danach heisst: mitten im Wort. */
const WORTZEICHEN = /[\p{L}\p{N}]/u;

/**
 * Zerlegt einen Text in Stuecke. `gesehen` traegt die Ziele, die in diesem
 * Eintrag schon verwiesen wurden, und wird fortgeschrieben — so gilt „nur
 * das erste Vorkommen" ueber alle Bloecke eines Eintrags.
 */
export function verlinke(
  text: string,
  sprache: 'de' | 'en',
  eigenesZiel: string,
  gesehen: Set<string>
): Stueck[] {
  const treffer: { von: number; bis: number; ziel: string }[] = [];
  const belegt = (von: number, bis: number) => treffer.some((t) => von < t.bis && bis > t.von);

  // Die laengsten Formen zuerst (so kommen sie aus `verweisformen`): „Difficult
  // Terrain" soll greifen, bevor ein kuerzerer Begriff in seiner Mitte es tut.
  for (const { form, ziel } of verweisformen(sprache)) {
    if (ziel === eigenesZiel || gesehen.has(ziel)) continue;
    let ab = 0;
    for (;;) {
      const von = text.indexOf(form, ab);
      if (von < 0) break;
      const bis = von + form.length;
      const davor = von > 0 ? text[von - 1] : '';
      const danach = bis < text.length ? text[bis] : '';
      if (!WORTZEICHEN.test(davor) && !WORTZEICHEN.test(danach) && !belegt(von, bis)) {
        treffer.push({ von, bis, ziel });
        gesehen.add(ziel);
        break;
      }
      ab = von + 1;
    }
  }

  treffer.sort((a, b) => a.von - b.von);
  const stuecke: Stueck[] = [];
  let stand = 0;
  for (const t of treffer) {
    if (t.von > stand) stuecke.push(text.slice(stand, t.von));
    stuecke.push({ text: text.slice(t.von, t.bis), ziel: t.ziel });
    stand = t.bis;
  }
  if (stand < text.length) stuecke.push(text.slice(stand));
  return stuecke;
}
