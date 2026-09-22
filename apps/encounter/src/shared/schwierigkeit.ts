/**
 * Das Verhaeltnis zwischen Begegnung und Gruppe — und jetzt auch die
 * Einordnung.
 *
 * ZWEI ANTWORTEN, NICHT EINE
 * ==========================
 * Die Einordnung („mittel") kommt aus `@suite/srd` und damit aus dem
 * Regelwerk selbst: Erfahrungspunkte je Grad, Budget je Charakter und
 * Stufe. Sie stand lange nicht zur Verfuegung, und solange stand hier
 * nur das Verhaeltnis.
 *
 * Das Verhaeltnis BLEIBT trotzdem stehen. Eine Einordnung allein ist
 * eine Behauptung, die man glauben muss; daneben die beiden Zahlen zu
 * sehen, aus denen sie entstanden ist, macht sie nachpruefbar. Und wenn
 * ein Monster keinen Grad aus der Tabelle hat, ist das Verhaeltnis die
 * einzige Antwort, die dann noch ehrlich ist.
 *
 * Alles hier ist eine reine Funktion.
 */
import { epFuerGrad, einordnung as srdEinordnung, type Einordnung } from '@suite/srd';

/** Eine Zeile der Gruppe: so viele Figuren auf dieser Stufe. */
export interface Gruppenzeile {
  readonly anzahl: number;
  readonly stufe: number;
}

/** Die Gruppe am Tisch. Leer heisst: nicht eingetragen. */
export type Gruppe = readonly Gruppenzeile[];

/**
 * Ein Herausforderungsgrad als Zahl.
 *
 * „1/4" ist ein gueltiger Grad und muss ein Viertel ergeben, nicht eins.
 * `null` fuer alles, was sich nicht lesen laesst — auch fuer ein leeres
 * Feld. Der Unterschied zu null ist wichtig: Grad 0 gibt es wirklich
 * (ein Kaefer), „steht nicht da" ist etwas anderes.
 */
export function gradAlsZahl(grad: string): number | null {
  const roh = grad.trim();
  if (!roh) return null;

  const bruch = /^(\d+)\s*\/\s*(\d+)$/.exec(roh);
  if (bruch) {
    const nenner = Number(bruch[2]);
    if (nenner === 0) return null;
    return Number(bruch[1]) / nenner;
  }

  const zahl = Number(roh);
  return Number.isFinite(zahl) && zahl >= 0 ? zahl : null;
}

/** Ein Gegner, so weit diese Rechnung ihn braucht. */
export interface Gewertet {
  readonly anzahl: number;
  /** Der Grad als Text, wie er im Kopf der Monsterdatei steht. */
  readonly grad: string;
}

export interface Gradsumme {
  /** Die Summe der Grade, Anzahl eingerechnet. */
  readonly summe: number;
  /**
   * Wie viele Gegnerzeilen keinen lesbaren Grad hatten.
   *
   * Steht mit in der Antwort und wird nicht verschwiegen: eine Summe, in
   * der drei Monster fehlen, sieht genauso aus wie eine vollstaendige.
   */
  readonly ohneGrad: number;
}

/**
 * Die Erfahrungspunkte einer Begegnung.
 *
 * Getrennt von der Gradsumme, obwohl beide ueber dieselben Gegner
 * laufen: die Gradsumme zaehlt Grade, die hier zaehlt Punkte, und ein
 * Monster kann einen Grad haben, den die Tabelle nicht kennt. Dann fehlt
 * es HIER, nicht dort — und das muss sichtbar bleiben.
 */
export interface Punktsumme {
  readonly summe: number;
  /** Gegnerzeilen, deren Grad die Tabelle nicht kennt. */
  readonly ohnePunkte: number;
}

export function punktsumme(gegner: readonly Gewertet[]): Punktsumme {
  let summe = 0;
  let ohnePunkte = 0;
  for (const einer of gegner) {
    const punkte = epFuerGrad(einer.grad);
    const anzahl = Math.max(1, Math.floor(einer.anzahl));
    if (punkte === null) {
      ohnePunkte += 1;
      continue;
    }
    summe += punkte * anzahl;
  }
  return { summe, ohnePunkte };
}

/**
 * Die Einordnung einer Begegnung, oder `null`.
 *
 * `null` heisst: es laesst sich nichts sagen — keine Gruppe eingetragen,
 * eine Stufe ausserhalb der Tabelle, oder KEIN EINZIGER Gegner mit
 * bekanntem Grad. Der letzte Fall ist der wichtige: eine Begegnung aus
 * lauter selbstgebauten Monstern mit Grad „?" bekaeme sonst die
 * Einordnung „unter niedrig", und das waere gelogen.
 */
export function ordneEin(
  gegner: readonly Gewertet[],
  gruppe: Gruppe
): Einordnung | null {
  const punkte = punktsumme(gegner);
  const bekannt = gegner.length - punkte.ohnePunkte;
  if (bekannt === 0) return null;
  return srdEinordnung(punkte.summe, gruppe);
}

export function gradsumme(gegner: readonly Gewertet[]): Gradsumme {
  let summe = 0;
  let ohneGrad = 0;
  for (const einer of gegner) {
    const grad = gradAlsZahl(einer.grad);
    const anzahl = Math.max(1, Math.floor(einer.anzahl));
    if (grad === null) {
      ohneGrad += 1;
      continue;
    }
    summe += grad * anzahl;
  }
  return { summe, ohneGrad };
}

export interface Gruppenstaerke {
  readonly figuren: number;
  readonly kleinsteStufe: number;
  readonly groessteStufe: number;
}

/** `null`, wenn die Gruppe nicht eingetragen ist. */
export function gruppenstaerke(gruppe: Gruppe): Gruppenstaerke | null {
  const zeilen = gruppe.filter((zeile) => zeile.anzahl > 0);
  if (zeilen.length === 0) return null;
  return {
    figuren: zeilen.reduce((summe, zeile) => summe + zeile.anzahl, 0),
    kleinsteStufe: Math.min(...zeilen.map((zeile) => zeile.stufe)),
    groessteStufe: Math.max(...zeilen.map((zeile) => zeile.stufe))
  };
}

/**
 * Die Gruppe als kurze Zeile, wie man sie eintippt: „4x5" oder „3x4, 1x6".
 *
 * Ein Textfeld und keine zwei Zahlenfelder, weil unterschiedliche Stufen
 * in einer Gruppe vorkommen und `packages/einstellungen` keine Liste
 * kennt. Der Preis ist diese Schreibweise; dagegen hilft, dass das
 * Werkzeug die gelesene Gruppe im Klartext zurueckzeigt — ein Tippfehler
 * faellt dann sofort auf.
 */
export function leseGruppe(zeile: string): Gruppe {
  const heraus: Gruppenzeile[] = [];
  for (const stueck of zeile.split(/[,;]/)) {
    const teil = stueck.trim();
    if (!teil) continue;
    // „4x5", „4 x 5", „4×5" — das Mal-Zeichen nimmt jede uebliche Form.
    const treffer = /^(\d+)\s*[x×*]\s*(\d+)$/i.exec(teil);
    if (treffer) {
      const anzahl = Number(treffer[1]);
      const stufe = Number(treffer[2]);
      if (anzahl > 0 && stufe > 0) heraus.push({ anzahl, stufe });
      continue;
    }
    /*
     * Eine nackte Zahl ist KEINE Gruppe.
     *
     * „4" koennte vier Figuren auf unbekannter Stufe heissen oder eine
     * Figur auf Stufe 4. Zu raten waere hier schlimmer als die Zeile
     * wegzulassen: die Oberflaeche zeigt, was gelesen wurde, und was
     * fehlt, sieht man dort.
     */
  }
  return heraus;
}

/** Zurueck in die Schreibweise. Fuer die Einstellung und Rauchtests. */
export function schreibeGruppe(gruppe: Gruppe): string {
  return gruppe.map((zeile) => `${zeile.anzahl}x${zeile.stufe}`).join(', ');
}
