/**
 * Was das Nachschlagewerk kennt.
 *
 * Der offizielle Bestand kommt aus `@suite/srd` und wird hier nur in eine
 * einheitliche Form gebracht: ein Eintrag hat eine Art, einen Namen und
 * einen Text, alles zweisprachig. Welche Art dazukommt — Glossar,
 * Gegenstaende, Zauber —, aendert an dieser Form nichts.
 *
 * Die Hausregeln (#145) kommen spaeter aus einer eigenen Ablage dazu und
 * stehen NEBEN dem offiziellen Bestand, nicht darin: der eine ist
 * unveraenderlich, die anderen gehoeren dem Tisch.
 *
 * Plattformfrei und ohne Oberflaeche — der Hauptprozess liefert daraus die
 * Eintraege fuer die Suche der Huelle, die Oberflaeche zeigt sie.
 */
import { ZUSTAENDE, type Paar } from '@suite/srd';

/** Die Arten, in der Reihenfolge, in der sie in der Liste stehen. */
export const ARTEN = ['zustand'] as const;
export type Art = (typeof ARTEN)[number];

export const ART_NAME: Record<Art, Paar> = {
  zustand: { de: 'Zustand', en: 'Condition' }
};

export interface Regel {
  /** `<art>/<kennung>` — eindeutig ueber alle Arten hinweg. */
  readonly id: string;
  readonly art: Art;
  readonly name: Paar;
  /** Der Regeltext, Absatz fuer Absatz mit Leerzeile getrennt. */
  readonly text: Paar;
}

export function alleRegeln(): readonly Regel[] {
  return ZUSTAENDE.map((zustand) => ({
    id: `zustand/${zustand.id}`,
    art: 'zustand' as const,
    name: zustand.name,
    text: zustand.text
  }));
}

export function regelNach(id: string): Regel | undefined {
  return alleRegeln().find((regel) => regel.id === id);
}

/**
 * Ein Absatz aus dem Regeltext, aufgeteilt in Unterpunkt und Rest.
 *
 * Die Unterpunkte stehen im Dokument fett vor dem Satz — „Attacks
 * Affected." oder „Beeinträchtigte Angriffe:". In beiden Sprachen mit
 * einem anderen Satzzeichen, deshalb hier und nicht in der Oberflaeche.
 * Der Einleitungssatz hat keinen Unterpunkt.
 */
export interface Absatz {
  readonly kopf: string | null;
  readonly rest: string;
}

export function absaetze(text: string): Absatz[] {
  return text
    .split(/\n{2,}/)
    .map((teil) => teil.trim())
    .filter(Boolean)
    .map((teil, index) => {
      // Der erste Absatz ist die Einleitung („While you have …") und hat
      // nie einen Unterpunkt, auch wenn er mit einem Doppelpunkt endet.
      if (index === 0) return { kopf: null, rest: teil };
      const treffer = /^([^.:]{2,60}[.:])\s+([\s\S]+)$/.exec(teil);
      return treffer ? { kopf: treffer[1], rest: treffer[2] } : { kopf: null, rest: teil };
    });
}
