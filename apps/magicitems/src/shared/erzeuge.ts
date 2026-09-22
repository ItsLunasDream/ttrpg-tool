/**
 * Wuerfelt einen magischen Gegenstand aus den Tabellen.
 *
 * Eingabe: Art und Seltenheit (beide optional, sonst gewuerfelt), die
 * Sprache und eine Zufallsquelle. Ausgabe: ein fertiger Gegenstand mit Name,
 * Wirkungen als Saetzen, Einstimmung und Wert. Die Saetze stehen in der
 * gewaehlten Sprache fest — was danach bearbeitet wird, gehoert dem
 * Menschen und wird nicht uebersetzt.
 *
 * Plattformfrei und mit einstellbarem Zufall, damit die Tests nicht vom
 * Glueck abhaengen.
 */
import { SELTENHEITEN, gegenstandswert, type Seltenheit } from '@suite/srd';
import {
  ARTEN,
  ATTRIBUTE,
  BEINAME,
  FLUECHE,
  GRUNDWORT,
  KREATURENTYPEN,
  SCHADENSARTEN,
  STUFE,
  VERBRAUCH,
  WIRKUNGEN,
  ZAUBER,
  ZUSTAENDE,
  type Art,
  type Wirkung
} from './tabellen';

export type Sprache = 'de' | 'en';
export type Zufall = () => number;

export interface Gegenstand {
  readonly id: string;
  readonly name: string;
  readonly art: Art;
  readonly seltenheit: Seltenheit;
  readonly einstimmung: boolean;
  /** Je Wirkung ein Satz. */
  readonly wirkungen: readonly string[];
  /** Leer, wenn der Gegenstand nicht verflucht ist. */
  readonly fluch: string;
  /** Wert in Goldmuenzen, nach der Tabelle des SRD. */
  readonly wert: number;
  readonly notiz: string;
  readonly geaendert: string;
}

function eins<T>(liste: readonly T[], zufall: Zufall): T {
  return liste[Math.floor(zufall() * liste.length)];
}

/** Der Bonus je Seltenheit: Ungewoehnlich +1, Selten +2, Sehr selten +3. */
function bonus(stufe: number): number {
  return Math.max(1, Math.min(3, stufe));
}

/** Zusatzschaden je Seltenheit. */
const SCHADEN = ['1W4', '1W4', '1W6', '2W6', '3W6'];
const SCHADEN_EN = ['1d4', '1d4', '1d6', '2d6', '3d6'];

/** Heilung eines Tranks je Seltenheit (wie die Heiltraenke des SRD gestaffelt). */
const HEILUNG = ['2W4 + 2', '4W4 + 4', '8W4 + 8', '10W4 + 20', '10W4 + 20'];
const HEILUNG_EN = ['2d4 + 2', '4d4 + 4', '8d4 + 8', '10d4 + 20', '10d4 + 20'];

/** Der hoechste Zaubergrad je Seltenheit, fuer Staebe und Schriftrollen. */
const HOECHSTER_GRAD = [1, 3, 5, 7, 9];
/** SG eines Stabs je Seltenheit. */
const STAB_SG = [13, 13, 15, 17, 19];

interface Gefuellt {
  readonly text: string;
  /** Der Zaubergrad, wenn die Wirkung einen Zauber traegt (fuer den Wert der Schriftrolle). */
  readonly grad?: number;
}

function fuelle(wirkung: Wirkung, stufe: number, sprache: Sprache, zufall: Zufall): Gefuellt {
  const de = sprache === 'de';
  let grad: number | undefined;
  const werte: Record<string, string> = {
    bonus: `+${bonus(stufe)}`,
    schaden: (de ? SCHADEN : SCHADEN_EN)[stufe],
    art: eins(SCHADENSARTEN, zufall)[sprache],
    typ: eins(KREATURENTYPEN, zufall)[sprache],
    zustand: eins(ZUSTAENDE, zufall)[sprache],
    attribut: eins(ATTRIBUTE, zufall)[sprache],
    heilung: (de ? HEILUNG : HEILUNG_EN)[stufe],
    ladungen: String(3 + stufe * 2),
    wurf: String(STAB_SG[stufe])
  };
  if (wirkung.text.de.includes('{zauber}')) {
    // Schriftrollen tragen den hoechsten Grad ihrer Seltenheit oder knapp
    // darunter; taegliche Zauber bleiben zwei Grade darunter, sonst waere
    // „einmal am Tag Feuerball" schon ungewoehnlich.
    const oben = HOECHSTER_GRAD[stufe] - (wirkung.id === 'schriftrolle-zauber' ? 0 : 2);
    const unten = wirkung.id === 'schriftrolle-zauber' ? Math.max(0, oben - 1) : 1;
    grad = Math.max(unten, Math.min(oben, unten + Math.floor(zufall() * (oben - unten + 1))));
    grad = Math.max(0, grad);
    werte.zauber = eins(ZAUBER[grad], zufall)[sprache];
    werte.grad = String(grad);
  }
  let text = wirkung.text[sprache];
  for (const [name, wert] of Object.entries(werte)) text = text.split(`{${name}}`).join(wert);
  return { text, grad };
}

/** Wie viele Wirkungen ein Gegenstand dieser Seltenheit traegt. */
function anzahlWirkungen(art: Art, stufe: number): number {
  if (art === 'trank' || art === 'schriftrolle') return 1;
  return stufe >= 3 ? 3 : stufe >= 1 ? 2 : 1;
}

export interface Wunsch {
  readonly art?: Art;
  readonly seltenheit?: Seltenheit;
  /** Wahrscheinlichkeit eines Fluchs, 0 bis 1. Voreinstellung: 0,1. */
  readonly fluchChance?: number;
}

export function erzeuge(wunsch: Wunsch, sprache: Sprache, zufall: Zufall = Math.random): Gegenstand {
  const art = wunsch.art ?? eins(ARTEN, zufall);
  const seltenheit = wunsch.seltenheit ?? eins(SELTENHEITEN, zufall);
  const stufe = STUFE[seltenheit];

  const moeglich = WIRKUNGEN.filter((w) => w.arten.includes(art) && w.ab <= stufe && w.bis >= stufe);
  // Faellt fuer diese Seltenheit nichts, nimm, was der Art am naechsten liegt.
  const vorrat = moeglich.length
    ? moeglich
    : WIRKUNGEN.filter((w) => w.arten.includes(art)).sort(
        (a, b) => Math.abs(a.ab - stufe) - Math.abs(b.ab - stufe)
      ).slice(0, 1);

  const gewaehlt: Wirkung[] = [];
  const ziel = Math.min(anzahlWirkungen(art, stufe), vorrat.length);
  for (let versuch = 0; gewaehlt.length < ziel && versuch < 50; versuch += 1) {
    const w = eins(vorrat, zufall);
    if (!gewaehlt.includes(w)) gewaehlt.push(w);
  }
  const gefuellt = gewaehlt.map((w) => fuelle(w, stufe, sprache, zufall));

  const fluch = zufall() < (wunsch.fluchChance ?? 0.1) ? eins(FLUECHE, zufall)[sprache] : '';
  const grund = eins(GRUNDWORT[art], zufall)[sprache];
  const beiname = eins(BEINAME, zufall)[sprache];
  const scrollGrad = art === 'schriftrolle' ? gefuellt[0]?.grad : undefined;

  return {
    id: '',
    name: `${grund} ${beiname}`,
    art,
    seltenheit,
    // Traenke und Schriftrollen verlangen nie Einstimmung; sonst entscheidet
    // die staerkste Wirkung. Ein Fluch bindet immer.
    einstimmung:
      art !== 'trank' && art !== 'schriftrolle' && (gewaehlt.some((w) => w.einstimmung) || Boolean(fluch)),
    wirkungen: gefuellt.map((g) => g.text),
    fluch,
    wert: gegenstandswert(seltenheit, { verbrauch: VERBRAUCH[art], schriftrolleGrad: scrollGrad }),
    notiz: '',
    geaendert: ''
  };
}
