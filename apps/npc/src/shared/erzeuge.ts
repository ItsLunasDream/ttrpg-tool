/**
 * Aus den Tabellen wird eine Figur.
 *
 * Reine Funktionen mit uebergebenem Zufallsgeber — wie `wuerfle()` beim
 * Wuerfel. So laesst sich pruefen, was sonst nur zu erahnen waere: dass
 * Eigenheiten selten sind, dass seltene Spezies selten bleiben, und dass ein
 * festgehaltenes Feld beim Nachwuerfeln wirklich stehen bleibt.
 */
import { BEINAMEN, MAENNLICH, NEUTRAL, WEIBLICH } from './namen';
import {
  ARCHETYPEN,
  AUSSEHEN,
  BERUFE,
  EIGENHEITEN,
  GEHEIMNISSE,
  MOTIVATIONEN,
  SPEZIES
} from './tabellen';

export const NAMENSKLANG = ['weiblich', 'maennlich', 'neutral'] as const;
export type Namensklang = (typeof NAMENSKLANG)[number];

/** Die Felder, die einzeln nachgewuerfelt und festgehalten werden koennen. */
export const FELDER = [
  'name',
  'spezies',
  'beruf',
  'aussehen',
  'motivation',
  'geheimnis',
  'eigenheit'
] as const;
export type Feld = (typeof FELDER)[number];

export interface Figur {
  readonly name: string;
  readonly spezies: string;
  readonly beruf: string;
  readonly aussehen: string;
  readonly motivation: string;
  readonly geheimnis: string;
  /** Leer, wenn die Figur keine Marotte hat — und das ist der Normalfall. */
  readonly eigenheit: string;
}

export interface Wuensche {
  /** Welcher Archetyp, oder 'beliebig'. */
  readonly archetyp: string;
  /** Ein fester Namensklang, oder null fuer gemischt. */
  readonly klang: Namensklang | null;
  /** Eine feste Spezies, oder null fuer gewuerfelt. */
  readonly spezies: string | null;
}

export const STANDARD_WUENSCHE: Wuensche = {
  archetyp: 'beliebig',
  klang: null,
  spezies: null
};

/**
 * Wie oft eine Figur eine Marotte bekommt.
 *
 * Fuenfzehn von hundert. Der Wert stand so in der Anforderung, und er ist
 * gut begruendet: nicht jede Figur hat einen Tic, und wenn doch, faellt er
 * nicht mehr auf.
 */
export const EIGENHEIT_CHANCE = 0.15;

/**
 * Wie oft ein Name einen Beinamen bekommt.
 *
 * Bei einer Wache am Tor fragt niemand nach dem Nachnamen. Ein Generator,
 * der immer zwei Namen liefert, klingt nach Adelsregister.
 */
const BEINAME_CHANCE = 0.35;

/** Wie oft eine seltene Spezies gezogen wird, wenn nichts vorgegeben ist. */
const SELTEN_CHANCE = 0.25;

function waehle<T>(liste: readonly T[], rng: () => number): T {
  if (liste.length === 0) throw new Error('leere Liste');
  return liste[Math.min(liste.length - 1, Math.floor(rng() * liste.length))];
}

function erzeugeName(klang: Namensklang | null, rng: () => number): string {
  const gewaehlt = klang ?? waehle(NAMENSKLANG, rng);
  const liste =
    gewaehlt === 'weiblich' ? WEIBLICH : gewaehlt === 'maennlich' ? MAENNLICH : NEUTRAL;
  const rufname = waehle(liste, rng);
  return rng() < BEINAME_CHANCE ? `${rufname} ${waehle(BEINAMEN, rng)}` : rufname;
}

function erzeugeSpezies(vorgabe: string | null, rng: () => number): string {
  if (vorgabe) return vorgabe;
  // Erst wuerfeln, ob es etwas Seltenes wird, dann innerhalb der Gruppe
  // gleichverteilt. Ueber alle Eintraege gleichverteilt waere jeder zweite
  // Passant ein Golem, und die Welt fuehlte sich an wie ein Jahrmarkt.
  const selten = rng() < SELTEN_CHANCE;
  const gruppe = SPEZIES.filter((art) => art.haeufig !== selten);
  return waehle(gruppe.length > 0 ? gruppe : SPEZIES, rng).name;
}

function erzeugeBeruf(archetyp: string, rng: () => number): string {
  const gefunden = ARCHETYPEN.find((eintrag) => eintrag.id === archetyp);
  const liste = gefunden && gefunden.berufe.length > 0 ? gefunden.berufe : BERUFE;
  return waehle(liste, rng);
}

/** Ein einzelnes Feld, frisch gewuerfelt. */
export function erzeugeFeld(
  feld: Feld,
  wuensche: Wuensche,
  rng: () => number
): string {
  switch (feld) {
    case 'name':
      return erzeugeName(wuensche.klang, rng);
    case 'spezies':
      return erzeugeSpezies(wuensche.spezies, rng);
    case 'beruf':
      return erzeugeBeruf(wuensche.archetyp, rng);
    case 'aussehen':
      return waehle(AUSSEHEN, rng);
    case 'motivation':
      return waehle(MOTIVATIONEN, rng);
    case 'geheimnis':
      return waehle(GEHEIMNISSE, rng);
    case 'eigenheit':
      // Die Ausnahme: meistens kommt hier nichts.
      return rng() < EIGENHEIT_CHANCE ? waehle(EIGENHEITEN, rng) : '';
  }
}

/**
 * Eine ganze Figur.
 *
 * `festgehalten` nennt die Felder, die aus `vorher` uebernommen werden. Ohne
 * das wuerfelte man den guten Namen weg, waehrend man den Beruf sucht.
 */
export function erzeugeFigur(
  wuensche: Wuensche,
  rng: () => number,
  festgehalten: readonly Feld[] = [],
  vorher: Figur | null = null
): Figur {
  const behalten = new Set(festgehalten);
  const nimm = (feld: Feld): string => {
    if (behalten.has(feld) && vorher) return vorher[feld];
    return erzeugeFeld(feld, wuensche, rng);
  };

  return {
    name: nimm('name'),
    spezies: nimm('spezies'),
    beruf: nimm('beruf'),
    aussehen: nimm('aussehen'),
    motivation: nimm('motivation'),
    geheimnis: nimm('geheimnis'),
    eigenheit: nimm('eigenheit')
  };
}

/**
 * Die Figur als Text, wie er in eine Notiz wandert.
 *
 * Markdown, weil der Backstory Creator Markdown speichert. Leere Felder
 * fallen weg — eine Zeile „Eigenheit: " sagt weniger als keine Zeile.
 */
export function alsMarkdown(figur: Figur): string {
  const zeilen = [
    `**Spezies:** ${figur.spezies}`,
    `**Tätigkeit:** ${figur.beruf}`,
    '',
    `**Auffällig:** ${figur.aussehen}`,
    `**Will:** ${figur.motivation}`,
    `**Verschweigt:** ${figur.geheimnis}`
  ];
  if (figur.eigenheit) zeilen.push(`**Eigenheit:** ${figur.eigenheit}`);
  return zeilen.join('\n');
}
