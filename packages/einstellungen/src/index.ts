/**
 * Wie ein Werkzeug seine eigenen Einstellungen beschreibt.
 *
 * Warum ueberhaupt eine Beschreibung und keine Oberflaeche? Weil jedes
 * Werkzeug in einer eigenen Ansicht laeuft. Die Huelle kann die Bedienteile
 * eines Werkzeugs nicht einfach in ihren Dialog haengen — sie liegen in einem
 * anderen Prozess. Also schickt das Werkzeug, WAS es einzustellen gibt, und
 * die Huelle malt es. Zurueck kommt nur „Feld x hat jetzt Wert y".
 *
 * Das kostet den Preis, dass hier nur die Feldarten gehen, die diese Datei
 * kennt. Dafuer gibt es Einstellungen an genau einer Stelle, und ein neues
 * Werkzeug macht mit, ohne dass die Huelle davon wissen muss.
 *
 * Plattformfrei: keine Browser-Globals, kein node, kein electron. Die
 * Beschreibung geht durch IPC, sie muss also auch durch `structuredClone`
 * passen — deshalb nur Daten, keine Funktionen.
 */

/** Ein Text in beiden Sprachen. Wie ueberall in der Sammlung. */
export interface Paar {
  readonly de: string;
  readonly en: string;
}

export type Sprache = 'de' | 'en';

export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'de' ? paar.de : paar.en;
}

/** Was ueber die Leitung zurueckkommen kann, wenn jemand etwas verstellt. */
export type Wert = string | number | boolean;

interface FeldGemeinsam {
  /** Eindeutig innerhalb eines Werkzeugs. Das Werkzeug ordnet danach zu. */
  readonly id: string;
  readonly name: Paar;
  readonly hinweis?: Paar;
  /**
   * Die id eines Schalters, an dem dieses Feld haengt. Steht der auf „aus",
   * zeigt die Huelle dieses Feld ausgegraut — wie die Verzoegerung, die ohne
   * Autosave nichts bedeutet.
   */
  readonly haengtAn?: string;
}

/** Ein Kaestchen. */
export interface Schalter extends FeldGemeinsam {
  readonly art: 'schalter';
  readonly wert: boolean;
}

/** Eine Zahl mit Grenzen. Die Huelle laesst nichts ausserhalb zu. */
export interface Zahl extends FeldGemeinsam {
  readonly art: 'zahl';
  readonly wert: number;
  readonly min: number;
  readonly max: number;
  readonly schritt?: number;
  /** Was hinter dem Feld steht, etwa „ms". */
  readonly einheit?: Paar;
}

/** Eine Zeile Text. */
export interface Zeile extends FeldGemeinsam {
  readonly art: 'zeile';
  readonly wert: string;
  readonly platzhalter?: Paar;
}

/** Eine Liste zum Auswaehlen. */
export interface Auswahl extends FeldGemeinsam {
  readonly art: 'auswahl';
  readonly wert: string;
  readonly optionen: readonly { readonly id: string; readonly name: Paar }[];
}

/**
 * Ein Pfad, den man nicht tippt, sondern waehlt. Der Wert wird nur angezeigt;
 * geaendert wird er ueber die Knoepfe daneben.
 */
export interface Pfad extends FeldGemeinsam {
  readonly art: 'pfad';
  readonly wert: string;
  readonly knoepfe: readonly Knopf[];
}

/** Etwas, das man ausloest statt einstellt. */
export interface Knopf {
  readonly id: string;
  readonly name: Paar;
  /** Rot dargestellt. Fuer alles, was etwas wegnimmt. */
  readonly gefaehrlich?: boolean;
}

/**
 * Eine Aufzaehlung, aus der man einzelne Eintraege entfernen kann.
 *
 * Fuer das eigene Woerterbuch der Rechtschreibpruefung: aufgenommen wird per
 * Rechtsklick im Text, und hier kommt man wieder heraus.
 */
export interface Sammelfeld extends FeldGemeinsam {
  readonly art: 'sammlung';
  readonly eintraege: readonly string[];
  readonly leer: Paar;
  readonly entfernen: Paar;
}

/** Nur ein Satz. Fuer den Verweis „das steht in den KI-Einstellungen oben". */
export interface Satz {
  readonly art: 'satz';
  readonly id: string;
  readonly hinweis: Paar;
}

/** Eine Reihe Knoepfe ohne Feld davor. */
export interface Knopfreihe {
  readonly art: 'knoepfe';
  readonly id: string;
  readonly name?: Paar;
  readonly knoepfe: readonly Knopf[];
}

export type Feld = Schalter | Zahl | Zeile | Auswahl | Pfad | Sammelfeld | Satz | Knopfreihe;

/** Alles, was ein Werkzeug an Einstellungen zeigt, in der Reihenfolge. */
export interface Werkzeugeinstellungen {
  /** Die App-Kennung, wie die Huelle sie kennt. */
  readonly appId: string;
  readonly gruppen: readonly Gruppe[];
}

export interface Gruppe {
  readonly id: string;
  readonly name: Paar;
  readonly felder: readonly Feld[];
}

/** Ob dieses Feld einen Wert traegt, den man zurueckmelden kann. */
export function traegtWert(feld: Feld): feld is Schalter | Zahl | Zeile | Auswahl {
  return feld.art === 'schalter' || feld.art === 'zahl' || feld.art === 'zeile' || feld.art === 'auswahl';
}

/** Alle Felder aller Gruppen, flach. Fuer Pruefungen und Suche. */
export function alleFelder(einstellungen: Werkzeugeinstellungen): readonly Feld[] {
  return einstellungen.gruppen.flatMap((gruppe) => gruppe.felder);
}

/** Findet ein Feld ueber seine id. */
export function feldMit(
  einstellungen: Werkzeugeinstellungen,
  id: string
): Feld | undefined {
  return alleFelder(einstellungen).find((feld) => feld.id === id);
}

/**
 * Ob ein Feld gerade bedienbar ist.
 *
 * Haengt es an einem Schalter, der aus ist, dann nicht. Fehlt der Schalter
 * (Tippfehler in der id), bleibt das Feld bedienbar — lieber ein Feld zu
 * viel als eine Einstellung, an die niemand mehr herankommt.
 */
export function istBedienbar(einstellungen: Werkzeugeinstellungen, feld: Feld): boolean {
  if (!('haengtAn' in feld) || !feld.haengtAn) return true;
  const anker = feldMit(einstellungen, feld.haengtAn);
  if (!anker || anker.art !== 'schalter') return true;
  return anker.wert;
}

/**
 * Bringt einen von der Oberflaeche gemeldeten Wert in die Form, die das Feld
 * verlangt — und sagt nein, wenn das nicht geht.
 *
 * Die Huelle schickt, was in ihrem Bedienteil stand. Bei einer Zahl ist das
 * ein Text, bei einem leeren Zahlenfeld ein leerer Text. Ungeprueft
 * uebernommen stuende dann `NaN` in der Einstellungsdatei, und das Werkzeug
 * faende beim naechsten Start keine gueltige Verzoegerung mehr.
 */
export function pruefeWert(feld: Feld, roh: Wert): Wert | null {
  switch (feld.art) {
    case 'schalter':
      return typeof roh === 'boolean' ? roh : null;
    case 'zahl': {
      // `Number('')` ist 0 und damit endlich — ein leer geraeumtes Zahlenfeld
      // wuerde sonst stillschweigend zur Untergrenze.
      if (typeof roh === 'string' && roh.trim() === '') return null;
      const zahl = typeof roh === 'number' ? roh : Number(roh);
      if (!Number.isFinite(zahl)) return null;
      return Math.min(feld.max, Math.max(feld.min, zahl));
    }
    case 'zeile':
      return typeof roh === 'string' ? roh : null;
    case 'auswahl':
      return typeof roh === 'string' && feld.optionen.some((o) => o.id === roh) ? roh : null;
    default:
      // Pfad, Sammlung, Satz und Knopfreihe tragen keinen Wert.
      return null;
  }
}
