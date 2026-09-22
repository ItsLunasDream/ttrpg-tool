/**
 * Die Farben der ganzen Sammlung — als Rollen, nicht als Farbnamen.
 *
 * Bisher stand in jedem Werkzeug dieselbe Palette noch einmal: sieben von
 * neun hatten `--grund: #14161c` woertlich in ihrer eigenen styles.css. Wer
 * eine Farbe aendern wollte, aenderte sie neunmal oder vergass eine.
 *
 * Hier steht sie einmal, und zwar nach ROLLE: nicht „dunkelblau", sondern
 * „der Grund, auf dem alles liegt". Ein Thema besetzt jede Rolle. Die
 * Werkzeuge behalten ihre eigenen Variablennamen und leiten sie von den
 * Rollen ab — dadurch musste keine der rund 870 Fundstellen angefasst
 * werden.
 *
 * Plattformfrei: nur Daten und Zeichenketten. Wer daraus CSS macht, ruft
 * `alsCssText`; das Setzen im Dokument gehoert in die Oberflaeche.
 */

export interface Paar {
  readonly de: string;
  readonly en: string;
}

export type Sprache = 'de' | 'en';

export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'de' ? paar.de : paar.en;
}

/**
 * Die Rollen. Mehr gibt es nicht, und das ist Absicht.
 *
 * Jede neue Rolle muss in JEDEM Thema besetzt werden. Eine Liste, die
 * waechst, wie es gerade passt, ist nach dem dritten Thema keine Palette
 * mehr, sondern eine Sammlung von Sonderfaellen.
 */
export const ROLLEN = [
  /** Der Grund, auf dem alles liegt. */
  'grund',
  /** Was darauf liegt: Karten, Leisten, Dialoge. */
  'grundHoch',
  /** Was hineingeht: Eingabefelder, Tabellen, die Wuerfelflaeche. */
  'grundTief',
  /** Trennlinien und Umrandungen. */
  'rand',
  /** Ein Rand, der auffallen soll. */
  'randStark',
  /** Lesetext. */
  'text',
  /** Text, der danebensteht: Hinweise, Einheiten, Zweitzeilen. */
  'textLeise',
  /** Die eine Farbe, die etwas hervorhebt. */
  'betont',
  /** Dieselbe Farbe als Flaeche hinter etwas. */
  'betontLeise',
  /** Was wegnimmt oder schiefgeht. */
  'gefahr',
  /** Was gelingt oder heilt. */
  'gut',
  /** Was festgehalten oder gewarnt ist — das Gold der Sammlung. */
  'fest',
  /** Ein Verweis im Text. */
  'verweis',
  /** Ein Verweis, der ins Leere zeigt. */
  'verweisFehlt'
] as const;

export type Rolle = (typeof ROLLEN)[number];

export type Palette = Readonly<Record<Rolle, string>>;

export interface Thema {
  readonly id: string;
  readonly name: Paar;
  /**
   * Ob es ein helles Thema ist.
   *
   * Steht hier und wird nicht aus der Grundfarbe geraten: davon haengt
   * `color-scheme` ab, und damit, wie das System Bildlaufleisten und
   * Auswahlfelder zeichnet. Ein helles Thema mit dunklen Leisten sieht aus
   * wie ein Fehler.
   */
  readonly hell: boolean;
  readonly farben: Palette;
}

/*
 * Die Themen.
 *
 * Schwerpunkt dunkel, ein paar helle — damit ist der helle Modus abgedeckt,
 * ohne dass es einen eigenen Schalter dafuer braucht.
 *
 * Jedes Thema ist in sich stimmig: ein Grundton, davon drei Helligkeiten,
 * dazu eine Betonung und die vier Bedeutungsfarben. Die Bedeutungsfarben
 * wandern zwischen den Themen mit, statt fest zu bleiben — ein Rot, das auf
 * Pergament funktioniert, ist ein anderes als eines auf Schiefer.
 */

/** Wie die Sammlung bisher aussah. Bleibt die Vorgabe. */
const NACHT: Thema = {
  id: 'nacht',
  name: { de: 'Nacht', en: 'Night' },
  hell: false,
  farben: {
    grund: '#14161c',
    grundHoch: '#1b1e26',
    grundTief: '#10121a',
    rand: '#2a2e39',
    randStark: '#3b4150',
    text: '#e6e8ee',
    textLeise: '#939aab',
    betont: '#7aa2f7',
    betontLeise: '#243049',
    gefahr: '#e5484d',
    gut: '#4a9d5f',
    fest: '#e0af68',
    verweis: '#8ec3e0',
    verweisFehlt: '#d98a7c'
  }
};

/** Die Palette, die der Story Creator schon hatte: Tinte und Gold. */
const TINTE: Thema = {
  id: 'tinte',
  name: { de: 'Tinte', en: 'Ink' },
  hell: false,
  farben: {
    grund: '#16141c',
    grundHoch: '#1f1c28',
    grundTief: '#14121a',
    rand: '#322d40',
    randStark: '#453d59',
    text: '#ece9f2',
    textLeise: '#9c94ae',
    betont: '#c4a35a',
    betontLeise: '#2e2820',
    gefahr: '#d1635c',
    gut: '#6a9d5f',
    fest: '#c4a35a',
    verweis: '#8ec3e0',
    verweisFehlt: '#d98a7c'
  }
};

/** Dunkles Gruen, warme Betonung. Fuer Waldkampagnen und lange Abende. */
const WALD: Thema = {
  id: 'wald',
  name: { de: 'Wald', en: 'Forest' },
  hell: false,
  farben: {
    grund: '#12180f',
    grundHoch: '#1a2216',
    grundTief: '#0e130c',
    rand: '#2a3524',
    randStark: '#3d4c34',
    text: '#e7ebe2',
    textLeise: '#96a189',
    betont: '#8fbf6a',
    betontLeise: '#26331d',
    gefahr: '#d4685c',
    gut: '#6fb06a',
    fest: '#d8b25c',
    verweis: '#7fc0b0',
    verweisFehlt: '#d09077'
  }
};

/** Ganz ohne Farbstich. Fuer alle, denen jeder Grundton im Weg ist. */
const ASCHE: Thema = {
  id: 'asche',
  name: { de: 'Asche', en: 'Ash' },
  hell: false,
  farben: {
    grund: '#161616',
    grundHoch: '#1e1e1e',
    grundTief: '#111111',
    rand: '#2e2e2e',
    randStark: '#434343',
    text: '#e8e8e8',
    textLeise: '#9a9a9a',
    betont: '#9fb5c9',
    betontLeise: '#26303a',
    gefahr: '#d96a6a',
    gut: '#77ad77',
    fest: '#cfae70',
    verweis: '#a8c4d6',
    verweisFehlt: '#c9907f'
  }
};

/** Warm und dunkel, Kupfer als Betonung. */
const GLUT: Thema = {
  id: 'glut',
  name: { de: 'Glut', en: 'Ember' },
  hell: false,
  farben: {
    grund: '#1a1411',
    grundHoch: '#241c18',
    grundTief: '#14100d',
    rand: '#3a2e26',
    randStark: '#4f3f34',
    text: '#f0e7e0',
    textLeise: '#a89689',
    betont: '#e08a4c',
    betontLeise: '#3a2618',
    gefahr: '#e06055',
    gut: '#8aae6a',
    fest: '#e0b45c',
    verweis: '#d8a878',
    verweisFehlt: '#c08a7a'
  }
};

/** Papier. Warme helle Flaeche, dunkelbraune Schrift. */
const PERGAMENT: Thema = {
  id: 'pergament',
  name: { de: 'Pergament', en: 'Parchment' },
  hell: true,
  farben: {
    grund: '#f4ecdd',
    grundHoch: '#fbf5ea',
    grundTief: '#ebe0cc',
    rand: '#d4c4a8',
    randStark: '#b8a068',
    text: '#2e2519',
    textLeise: '#6b5c47',
    betont: '#8a5a2b',
    betontLeise: '#e8d8bd',
    gefahr: '#9e3a33',
    gut: '#3d6b32',
    fest: '#8a6a20',
    verweis: '#2b5f80',
    verweisFehlt: '#9e5340'
  }
};

/** Schlicht hell, blaue Betonung. Der naechstliegende helle Modus. */
const TAG: Thema = {
  id: 'tag',
  name: { de: 'Tag', en: 'Day' },
  hell: true,
  farben: {
    grund: '#f2f3f6',
    grundHoch: '#ffffff',
    grundTief: '#e7e9ef',
    rand: '#cdd2dd',
    randStark: '#a9b1c2',
    text: '#1c2027',
    textLeise: '#5c6472',
    betont: '#2f5fb8',
    betontLeise: '#dde6f7',
    gefahr: '#b3302f',
    gut: '#2f6b3c',
    fest: '#8a6212',
    verweis: '#1f5f86',
    verweisFehlt: '#9c4b39'
  }
};

export const THEMEN: readonly Thema[] = [NACHT, TINTE, WALD, ASCHE, GLUT, PERGAMENT, TAG];

/** Womit die Sammlung startet: so, wie sie bisher aussah. */
export const VORGABE_THEMA = 'nacht';

export function themaMit(id: string): Thema {
  return THEMEN.find((thema) => thema.id === id) ?? THEMEN[0]!;
}

/** Der Name der CSS-Variablen einer Rolle. */
export function cssName(rolle: Rolle): string {
  // Aus `grundHoch` wird `--f-grund-hoch`. Das Praefix `f-` haelt sie von
  // den Variablen der Werkzeuge getrennt, die daraus abgeleitet werden.
  return `--f-${rolle.replace(/[A-Z]/g, (gross) => `-${gross.toLowerCase()}`)}`;
}

/**
 * Ein Thema als CSS-Zuweisungen.
 *
 * Nur die Zuweisungen, kein `:root { … }` darum: wer sie setzt, entscheidet
 * wo. Die Oberflaeche schreibt sie ueblicherweise in `style` am
 * Wurzelelement, und dort waere eine Regel falsch.
 */
export function alsCssText(thema: Thema): string {
  return ROLLEN.map((rolle) => `${cssName(rolle)}: ${thema.farben[rolle]};`).join('\n');
}

/**
 * Ein Thema als Paare aus Name und Wert.
 *
 * Fuer die Oberflaeche: sie setzt sie einzeln am Wurzelelement
 * (`style.setProperty`). Das ist kein Umweg um `alsCssText`, sondern der
 * andere Fall — eine Zeichenkette ins `style`-Attribut zu schreiben wuerde
 * alles ueberbuegeln, was sonst noch darin steht.
 *
 * Hier und nicht in den Werkzeugen, weil `document` in packages/ nichts zu
 * suchen hat (Regel 4). Die drei Zeilen Schleife stehen dort.
 */
export function zuweisungen(thema: Thema): readonly (readonly [string, string])[] {
  return ROLLEN.map((rolle) => [cssName(rolle), thema.farben[rolle]] as const);
}

// ---------------------------------------------------------------------------
// Lesbarkeit
// ---------------------------------------------------------------------------

/** #rrggbb zu den drei Kanaelen. `null`, wenn es keine solche Farbe ist. */
export function kanaele(farbe: string): readonly [number, number, number] | null {
  const treffer = /^#([0-9a-f]{6})$/i.exec(farbe.trim());
  if (!treffer) return null;
  const zahl = Number.parseInt(treffer[1]!, 16);
  return [(zahl >> 16) & 255, (zahl >> 8) & 255, zahl & 255];
}

/**
 * Die relative Helligkeit nach WCAG.
 *
 * Nicht der Mittelwert der drei Kanaele: das Auge sieht Gruen viel heller
 * als Blau, und ein Mittelwert haelt deshalb Paare fuer lesbar, die es
 * nicht sind.
 */
export function helligkeit(farbe: string): number | null {
  const teile = kanaele(farbe);
  if (!teile) return null;
  const linear = teile.map((wert) => {
    const anteil = wert / 255;
    return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

/**
 * Das Kontrastverhaeltnis zweier Farben, 1 bis 21.
 *
 * WCAG verlangt 4.5 fuer Lesetext und 3 fuer Grosses und Bedienteile. Die
 * Tests halten jedes Thema dagegen — ein Thema, das hübsch aussieht und
 * nicht lesbar ist, ist keins.
 */
export function kontrast(vorn: string, hinten: string): number | null {
  const a = helligkeit(vorn);
  const b = helligkeit(hinten);
  if (a === null || b === null) return null;
  const [hoch, tief] = a > b ? [a, b] : [b, a];
  return (hoch + 0.05) / (tief + 0.05);
}
