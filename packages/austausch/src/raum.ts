/**
 * Der Raum im lokalen Netz (docs/austausch.md, Stufe 2): das Protokoll.
 *
 * Wer einen Raum eroeffnet, ist Gastgeber. Er kuendigt den Raum im lokalen
 * Netz an (UDP, `RAUM_SUCHPORT`), die anderen sehen ihn in einer Liste und
 * verbinden sich mit ihm (TCP). Der Gastgeber verteilt: Chat an alle oder
 * an eine Person, Pakete ebenso. Kein Dienst im Internet.
 *
 * Auf der Leitung steht je Zeile eine Nachricht als JSON. Das Passwort
 * reist nie: der Gastgeber schickt eine Zufallszahl, der Gast antwortet mit
 * einem Nachweis daraus (HMAC, gerechnet im Hauptprozess). Alles andere ist
 * UNVERSCHLUESSELT — wer im selben Netz mitliest, sieht es. Die Oberflaeche
 * sagt das.
 *
 * Plattformfrei: nur Daten und reine Funktionen. Netz und Kryptografie
 * stehen im Hauptprozess der Huelle.
 */

export const RAUM_SUCHPORT = 47811;
export const RAUM_VERSION = 1;
/** Mehr Personen braucht ein Tisch nicht; mehr Verbindungen nimmt der Gastgeber nicht an. */
export const MAX_PERSONEN = 16;
/** Eine Zeile darf so lang sein wie ein Paket plus Umschlag. */
export const MAX_ZEILE = 80 * 1024 * 1024;
export const MAX_CHAT = 4000;

export interface Person {
  readonly id: string;
  readonly name: string;
}

/** Was ein Gastgeber alle paar Sekunden ins Netz ruft. */
export interface Ankuendigung {
  readonly typ: 'ttrpg-raum';
  readonly version: number;
  readonly raum: string;
  readonly gastgeber: string;
  readonly port: number;
  readonly geschuetzt: boolean;
}

export type Nachricht =
  | { readonly typ: 'herausforderung'; readonly raum: string; readonly nonce: string }
  | { readonly typ: 'hallo'; readonly name: string; readonly nachweis: string; readonly version: number }
  | { readonly typ: 'willkommen'; readonly du: Person; readonly personen: readonly Person[] }
  | { readonly typ: 'abgelehnt'; readonly grund: 'passwort' | 'voll' | 'version' }
  | { readonly typ: 'personen'; readonly personen: readonly Person[] }
  | {
      readonly typ: 'chat';
      readonly von: string;
      /** `null`: an alle. Sonst die Kennung der einen Person. */
      readonly an: string | null;
      readonly text: string;
      readonly zeit: string;
    }
  | {
      readonly typ: 'paket';
      readonly von: string;
      readonly an: string | null;
      /** Was die Empfaenger in der Liste sehen: „3 Eintraege: Ghul, …". */
      readonly titel: string;
      /** Das Paket als Text (`alsPaket`). */
      readonly paket: string;
      readonly zeit: string;
    };

export function kodiere(nachricht: Nachricht | Ankuendigung): string {
  return `${JSON.stringify(nachricht)}\n`;
}

function istText(wert: unknown, max = 200): wert is string {
  return typeof wert === 'string' && wert.length <= max;
}

function istPerson(wert: unknown): wert is Person {
  const p = wert as Person;
  return typeof wert === 'object' && wert !== null && istText(p.id, 64) && istText(p.name, 64);
}

/**
 * Prueft eine Nachricht von der Leitung. Alles, was nicht genau passt, ist
 * `null` — ein fremdes Programm auf demselben Port soll den Raum nicht
 * durcheinanderbringen.
 */
export function leseNachricht(zeile: string): Nachricht | null {
  let n: Record<string, unknown>;
  try {
    const wert = JSON.parse(zeile) as unknown;
    if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) return null;
    n = wert as Record<string, unknown>;
  } catch {
    return null;
  }
  const an = n.an === null || istText(n.an, 64) ? (n.an as string | null) : undefined;
  switch (n.typ) {
    case 'herausforderung':
      return istText(n.raum, 64) && istText(n.nonce, 128) ? { typ: n.typ, raum: n.raum, nonce: n.nonce } : null;
    case 'hallo':
      return istText(n.name, 64) && istText(n.nachweis, 256) && typeof n.version === 'number'
        ? { typ: n.typ, name: n.name, nachweis: n.nachweis, version: n.version }
        : null;
    case 'willkommen':
      return istPerson(n.du) && Array.isArray(n.personen) && n.personen.every(istPerson)
        ? { typ: n.typ, du: n.du, personen: n.personen }
        : null;
    case 'abgelehnt':
      return n.grund === 'passwort' || n.grund === 'voll' || n.grund === 'version' ? { typ: n.typ, grund: n.grund } : null;
    case 'personen':
      return Array.isArray(n.personen) && n.personen.every(istPerson) ? { typ: n.typ, personen: n.personen } : null;
    case 'chat':
      return istText(n.von, 64) && an !== undefined && istText(n.text, MAX_CHAT) && istText(n.zeit, 40)
        ? { typ: n.typ, von: n.von, an, text: n.text, zeit: n.zeit }
        : null;
    case 'paket':
      return istText(n.von, 64) && an !== undefined && istText(n.titel, 500) && istText(n.paket, MAX_ZEILE) && istText(n.zeit, 40)
        ? { typ: n.typ, von: n.von, an, titel: n.titel, paket: n.paket, zeit: n.zeit }
        : null;
    default:
      return null;
  }
}

export function leseAnkuendigung(text: string): Ankuendigung | null {
  try {
    const a = JSON.parse(text) as Record<string, unknown>;
    if (
      a.typ === 'ttrpg-raum' &&
      typeof a.version === 'number' &&
      istText(a.raum, 64) &&
      istText(a.gastgeber, 64) &&
      typeof a.port === 'number' &&
      Number.isInteger(a.port) &&
      a.port > 0 &&
      a.port < 65536 &&
      typeof a.geschuetzt === 'boolean'
    ) {
      return a as unknown as Ankuendigung;
    }
  } catch {
    // unten
  }
  return null;
}

/**
 * Zerlegt einen Strom in Zeilen. TCP liefert Stuecke, keine Nachrichten:
 * eine Nachricht kann auf zwei Stuecke verteilt ankommen, zwei in einem.
 * Eine Zeile ueber `max` bricht ab — sonst liesse sich der Speicher des
 * Gastgebers mit einer endlosen Zeile fuellen.
 */
export class Zeilenleser {
  private rest = '';
  constructor(private readonly max = MAX_ZEILE) {}

  /** Die fertigen Zeilen. Wirft, wenn eine Zeile zu lang wird. */
  schiebe(stueck: string): string[] {
    this.rest += stueck;
    const teile = this.rest.split('\n');
    this.rest = teile.pop() ?? '';
    if (this.rest.length > this.max) throw new Error('Zeile zu lang');
    return teile.filter((t) => t.trim().length > 0);
  }
}

/** Der Name, den jemand ohne eigenen bekommt: „Gast 1", „Guest 1". */
export function gastname(nummer: number, sprache: 'de' | 'en' = 'de'): string {
  return `${sprache === 'de' ? 'Gast' : 'Guest'} ${nummer}`;
}

/** Ein Name, den im Raum noch niemand traegt: „Anna", „Anna (2)". */
export function eindeutigerName(wunsch: string, vergeben: Iterable<string>): string {
  const sauber = wunsch.replace(/\s+/g, ' ').trim().slice(0, 40) || 'Gast';
  const belegt = new Set([...vergeben].map((n) => n.toLocaleLowerCase('de-DE')));
  if (!belegt.has(sauber.toLocaleLowerCase('de-DE'))) return sauber;
  let n = 2;
  while (belegt.has(`${sauber} (${n})`.toLocaleLowerCase('de-DE'))) n += 1;
  return `${sauber} (${n})`;
}
