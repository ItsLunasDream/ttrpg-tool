/**
 * Aus den Tabellen wird eine Figur.
 *
 * Die Figur traegt fertige Texte, keine Verweise in die Tabellen. Das ist
 * Absicht: jedes Feld laesst sich vor dem Export von Hand aendern, und ein
 * selbst geschriebener Satz hat in keiner Tabelle eine Stelle.
 *
 * Gewuerfelt wird in der Sprache, in der gerade gearbeitet wird — die
 * Tabellen fuehren jeden Eintrag zweisprachig. Eine bereits gewuerfelte Figur
 * wechselt die Sprache dadurch NICHT mit: sie koennte ja von Hand bearbeitet
 * sein, und eine Uebersetzung wuerde diese Arbeit ueberschreiben.
 *
 * Reine Funktionen mit uebergebenem Zufallsgeber, wie `wuerfle()` beim
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
  SPEZIES,
  text,
  type Paar,
  type Sprache
} from './tabellen';

export const NAMENSKLANG = ['weiblich', 'maennlich', 'neutral'] as const;
export type Namensklang = (typeof NAMENSKLANG)[number];

/** Die Felder, die einzeln nachgewuerfelt, bearbeitet und festgehalten werden. */
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
  /** Die Stelle einer festen Spezies in SPEZIES, oder -1 fuer gewuerfelt. */
  readonly spezies: number;
}

export const STANDARD_WUENSCHE: Wuensche = {
  archetyp: 'beliebig',
  klang: null,
  spezies: -1
};

/**
 * Wie oft eine Figur eine Marotte bekommt.
 *
 * Fuenfzehn von hundert. Nicht jede Figur hat einen Tic, und wenn doch,
 * faellt er nicht mehr auf.
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

/** Die Rufnamen zu einem Klang. Rufnamen sind in jeder Sprache dieselben. */
export function namenliste(klang: Namensklang): readonly string[] {
  return klang === 'weiblich' ? WEIBLICH : klang === 'maennlich' ? MAENNLICH : NEUTRAL;
}

function waehle<T>(liste: readonly T[], rng: () => number): T {
  if (liste.length === 0) throw new Error('leere Liste');
  return liste[Math.min(liste.length - 1, Math.floor(rng() * liste.length))];
}

function waehleText(liste: readonly Paar[], sprache: Sprache, rng: () => number): string {
  return text(waehle(liste, rng), sprache);
}

function erzeugeName(klang: Namensklang | null, sprache: Sprache, rng: () => number): string {
  const gewaehlt = klang ?? waehle(NAMENSKLANG, rng);
  const rufname = waehle(namenliste(gewaehlt), rng);
  // Der Rufname bleibt in jeder Sprache derselbe — Mara heisst nirgends
  // anders. Der Beiname ist eine Beschreibung und wird uebersetzt.
  return rng() < BEINAME_CHANCE ? `${rufname} ${waehleText(BEINAMEN, sprache, rng)}` : rufname;
}

function erzeugeSpezies(vorgabe: number, sprache: Sprache, rng: () => number): string {
  if (vorgabe >= 0 && vorgabe < SPEZIES.length) return text(SPEZIES[vorgabe], sprache);
  // Erst wuerfeln, ob es etwas Seltenes wird, dann innerhalb der Gruppe
  // gleichverteilt. Ueber alle Eintraege gleichverteilt waere jeder zweite
  // Passant ein Golem, und die Welt fuehlte sich an wie ein Jahrmarkt.
  const selten = rng() < SELTEN_CHANCE;
  const gruppe = SPEZIES.filter((art) => art.haeufig !== selten);
  return text(waehle(gruppe.length > 0 ? gruppe : SPEZIES, rng), sprache);
}

function erzeugeBeruf(archetyp: string, sprache: Sprache, rng: () => number): string {
  const gefunden = ARCHETYPEN.find((eintrag) => eintrag.id === archetyp);
  if (!gefunden || gefunden.berufe.length === 0) return waehleText(BERUFE, sprache, rng);
  // Der Archetyp nennt Berufe ueber ihre deutsche Fassung — das ist der
  // Schluessel im Innenleben und taucht nirgends in der Oberflaeche auf.
  const passend = BERUFE.filter((beruf) => gefunden.berufe.includes(beruf.de));
  return waehleText(passend.length > 0 ? passend : BERUFE, sprache, rng);
}

/** Ein einzelnes Feld, frisch gewuerfelt. */
export function erzeugeFeld(
  feld: Feld,
  wuensche: Wuensche,
  sprache: Sprache,
  rng: () => number
): string {
  switch (feld) {
    case 'name':
      return erzeugeName(wuensche.klang, sprache, rng);
    case 'spezies':
      return erzeugeSpezies(wuensche.spezies, sprache, rng);
    case 'beruf':
      return erzeugeBeruf(wuensche.archetyp, sprache, rng);
    case 'aussehen':
      return waehleText(AUSSEHEN, sprache, rng);
    case 'motivation':
      return waehleText(MOTIVATIONEN, sprache, rng);
    case 'geheimnis':
      return waehleText(GEHEIMNISSE, sprache, rng);
    case 'eigenheit':
      // Die Ausnahme: meistens kommt hier nichts.
      return rng() < EIGENHEIT_CHANCE ? waehleText(EIGENHEITEN, sprache, rng) : '';
  }
}

/**
 * Eine ganze Figur.
 *
 * `festgehalten` nennt die Felder, die aus `vorher` uebernommen werden. Ohne
 * das wuerfelte man den guten Namen weg, waehrend man den Beruf sucht — und
 * einen von Hand geschriebenen Satz gleich mit.
 */
export function erzeugeFigur(
  wuensche: Wuensche,
  sprache: Sprache,
  rng: () => number,
  festgehalten: readonly Feld[] = [],
  vorher: Figur | null = null
): Figur {
  const behalten = new Set(festgehalten);
  const nimm = (feld: Feld): string => {
    if (behalten.has(feld) && vorher) return vorher[feld];
    return erzeugeFeld(feld, wuensche, sprache, rng);
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
 *
 * Die Beschriftungen kommen mit, damit die Notiz auch ohne dieses Werkzeug
 * lesbar bleibt; sie stehen in der Sprache, in der exportiert wird.
 */
export function alsMarkdown(figur: Figur, sprache: Sprache): string {
  const w = (de: string, en: string) => (sprache === 'de' ? de : en);
  const zeilen = [
    `**${w('Spezies', 'Species')}:** ${figur.spezies}`,
    `**${w('Tätigkeit', 'Occupation')}:** ${figur.beruf}`,
    '',
    `**${w('Auffällig', 'Notable')}:** ${figur.aussehen}`,
    `**${w('Will', 'Wants')}:** ${figur.motivation}`,
    `**${w('Verschweigt', 'Hides')}:** ${figur.geheimnis}`
  ];
  if (figur.eigenheit) zeilen.push(`**${w('Eigenheit', 'Quirk')}:** ${figur.eigenheit}`);
  return zeilen.join('\n');
}
