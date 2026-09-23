/**
 * Was das Nachschlagewerk kennt.
 *
 * Der offizielle Bestand ist das ganze Regelglossar aus `@suite/srd` (155
 * Eintraege, beide Sprachen) und wird hier nur in eine einheitliche Form
 * gebracht: ein Eintrag hat eine Art, einen Namen, Bloecke und Verweise.
 *
 * Die Hausregeln (#145) kommen spaeter aus einer eigenen Ablage dazu und
 * stehen NEBEN dem offiziellen Bestand, nicht darin: der eine ist
 * unveraenderlich, die anderen gehoeren dem Tisch.
 *
 * Plattformfrei und ohne Oberflaeche — der Hauptprozess liefert daraus die
 * Eintraege fuer die Suche der Huelle, die Oberflaeche zeigt sie.
 */
import type { Paar } from '@suite/srd';
import { GLOSSAR, type Glossarblock } from '@suite/srd/glossar';
import { MAGISCHE_GEGENSTAENDE, type MagischerGegenstand } from '@suite/srd/magische-gegenstaende';
import { ZAUBER, type Zauber } from '@suite/srd/zauber';
import { AUSRUESTUNG, type Ausruestung } from '@suite/srd/ausruestung';
import type { Hausregel } from './hausregeln';

/**
 * Die Arten, in der Reihenfolge, in der sie in der Liste stehen. Sie kommen
 * aus dem Schlagwort, das das Glossar hinter einen Namen setzt
 * („Blinded [Condition]"); Eintraege ohne Schlagwort sind Regeln.
 */
export const ARTEN = [
  'hausregel',
  'regel',
  'zustand',
  'aktion',
  'wirkungsbereich',
  'gefahr',
  'haltung',
  'ausruestung',
  'zauber',
  'gegenstand'
] as const;
export type Art = (typeof ARTEN)[number];

export const ART_NAME: Record<Art, Paar> = {
  hausregel: { de: 'Hausregel', en: 'House rule' },
  regel: { de: 'Regel', en: 'Rule' },
  zustand: { de: 'Zustand', en: 'Condition' },
  aktion: { de: 'Aktion', en: 'Action' },
  wirkungsbereich: { de: 'Wirkungsbereich', en: 'Area of Effect' },
  gefahr: { de: 'Gefahr', en: 'Hazard' },
  haltung: { de: 'Haltung', en: 'Attitude' },
  ausruestung: { de: 'Ausrüstung', en: 'Equipment' },
  zauber: { de: 'Zauber', en: 'Spell' },
  gegenstand: { de: 'Magischer Gegenstand', en: 'Magic Item' }
};

/** Die Ueberschrift einer Gruppe in der Liste: Mehrzahl. */
export const ART_GRUPPE: Record<Art, Paar> = {
  hausregel: { de: 'Hausregeln', en: 'House rules' },
  regel: { de: 'Regeln', en: 'Rules' },
  zustand: { de: 'Zustände', en: 'Conditions' },
  aktion: { de: 'Aktionen', en: 'Actions' },
  wirkungsbereich: { de: 'Wirkungsbereiche', en: 'Areas of Effect' },
  gefahr: { de: 'Gefahren', en: 'Hazards' },
  haltung: { de: 'Haltungen', en: 'Attitudes' },
  ausruestung: { de: 'Ausrüstung', en: 'Equipment' },
  zauber: { de: 'Zauber', en: 'Spells' },
  gegenstand: { de: 'Magische Gegenstände', en: 'Magic Items' }
};

export interface Regel {
  /** `<art>/<kennung>` — eindeutig ueber alle Arten hinweg. */
  readonly id: string;
  readonly art: Art;
  readonly name: Paar;
  /** Eine Zeile unter dem Namen, wie gedruckt: „Wondrous Item, Rare (Requires Attunement)". */
  readonly unterzeile?: Paar;
  /** Der ganze Text, Absatz fuer Absatz mit Leerzeile getrennt — fuer die Suche. */
  readonly text: Paar;
  /** Wie er gezeigt wird: Absaetze, Unterpunkte, Tabellen, Listen. */
  readonly bloecke: readonly Glossarblock[];
  /** Die Kennungen (`<art>/<kennung>`) der Eintraege, auf die er verweist. */
  readonly verweise: readonly string[];
}

function flach(bloecke: readonly Glossarblock[], sprache: 'de' | 'en'): string {
  return bloecke
    .map((b) => {
      if (b.typ === 'tabelle') {
        return [b.titel[sprache], b.kopf[sprache].join(' '), ...b.reihen[sprache].map((r) => r.join(' '))]
          .filter(Boolean)
          .join('\n');
      }
      if (b.typ === 'liste') return [b.titel[sprache], ...b.eintraege[sprache]].filter(Boolean).join('\n');
      return b.text[sprache];
    })
    .join('\n\n');
}

/**
 * Eine Hausregel in derselben Form wie ein offizieller Eintrag, damit Liste,
 * Suche und Vorschau sie gleich behandeln. Der Name steht in beiden Sprachen
 * gleich da: uebersetzt wird nicht, was die Spielleitung schreibt.
 */
export function alsRegel(hausregel: Hausregel): Regel {
  const name = { de: hausregel.name, en: hausregel.name };
  const text = { de: hausregel.text, en: hausregel.text };
  return {
    id: `hausregel/${hausregel.id}`,
    art: 'hausregel',
    name,
    text,
    bloecke: hausregel.text
      .split(/\n{2,}/)
      .filter((absatz) => absatz.trim())
      .map((absatz) => ({ typ: 'absatz' as const, text: { de: absatz, en: absatz } })),
    verweise: hausregel.bezug ? [hausregel.bezug] : []
  };
}

/**
 * Ein magischer Gegenstand in der Form eines Eintrags. Die Bloecke stehen im
 * Paket je Sprache, in derselben Folge (dort geprueft); hier werden sie
 * paarweise zusammengelegt, wie das Glossar sie liefert.
 */
/** Bloecke, die im Paket je Sprache in derselben Folge stehen, paarweise. */
function paarweise(g: { readonly id: string; readonly bloecke: MagischerGegenstand['bloecke'] }): Glossarblock[] {
  return g.bloecke.en.map((en, i) => {
    const de = g.bloecke.de[i];
    if (en.typ === 'tabelle' && de.typ === 'tabelle') {
      return {
        typ: 'tabelle',
        titel: { de: de.titel, en: en.titel },
        kopf: { de: de.kopf, en: en.kopf },
        reihen: { de: de.reihen, en: en.reihen }
      };
    }
    if (en.typ === 'liste' && de.typ === 'liste') {
      return { typ: 'liste', titel: { de: de.titel, en: en.titel }, eintraege: { de: de.eintraege, en: en.eintraege } };
    }
    if ('text' in en && 'text' in de) return { typ: en.typ, text: { de: de.text, en: en.text } };
    throw new Error(`Blockfolge verschieden: ${g.id}`);
  });
}

function gegenstandAlsRegel(g: MagischerGegenstand): Regel {
  const bloecke = paarweise(g);
  return {
    id: `gegenstand/${g.id}`,
    art: 'gegenstand',
    name: g.name,
    unterzeile: g.kopfzeile,
    text: { de: flach(bloecke, 'de'), en: flach(bloecke, 'en') },
    bloecke,
    verweise: []
  };
}

const EIGENSCHAFT_NAME: Record<keyof Zauber['eigenschaften']['de'], Paar> = {
  zeit: { de: 'Zeitaufwand', en: 'Casting Time' },
  reichweite: { de: 'Reichweite', en: 'Range' },
  komponenten: { de: 'Komponenten', en: 'Components' },
  dauer: { de: 'Wirkungsdauer', en: 'Duration' }
};

/**
 * Ein Zauber in der Form eines Eintrags. Die vier Eigenschaften stehen als
 * fette Kopfzeilen vor dem Text, wie im Buch.
 */
function zauberAlsRegel(z: Zauber): Regel {
  const eigenschaften: Glossarblock[] = (['zeit', 'reichweite', 'komponenten', 'dauer'] as const).map((k) => ({
    typ: 'stichpunkt',
    text: {
      de: `${EIGENSCHAFT_NAME[k].de}: ${z.eigenschaften.de[k]}`,
      en: `${EIGENSCHAFT_NAME[k].en}: ${z.eigenschaften.en[k]}`
    }
  }));
  const bloecke = [...eigenschaften, ...paarweise(z)];
  return {
    id: `zauber/${z.id}`,
    art: 'zauber',
    name: z.name,
    unterzeile: z.gradzeile,
    text: { de: flach(bloecke, 'de'), en: flach(bloecke, 'en') },
    bloecke,
    verweise: []
  };
}

/**
 * Ein Eintrag aus dem Kapitel Ausruestung. Unter dem Namen steht der
 * Abschnitt („Schwer" allein sagt wenig, „Schwer · Eigenschaften" genug),
 * ausser beim Abschnittskopf selbst.
 */
function ausruestungAlsRegel(a: Ausruestung): Regel {
  const bloecke = paarweise(a);
  const eigener = a.name.en === a.abschnitt.en;
  return {
    id: `ausruestung/${a.id}`,
    art: 'ausruestung',
    name: a.name,
    ...(eigener ? {} : { unterzeile: a.abschnitt }),
    text: { de: flach(bloecke, 'de'), en: flach(bloecke, 'en') },
    bloecke,
    verweise: []
  };
}

let bestand: readonly Regel[] | null = null;

export function alleRegeln(): readonly Regel[] {
  if (bestand) return bestand;
  const artVon = new Map(GLOSSAR.map((e) => [e.id, (e.tag ?? 'regel') as Art]));
  bestand = GLOSSAR.map((e) => ({
    id: `${artVon.get(e.id)}/${e.id}`,
    art: artVon.get(e.id) ?? 'regel',
    name: e.name,
    text: { de: flach(e.bloecke, 'de'), en: flach(e.bloecke, 'en') },
    bloecke: e.bloecke,
    verweise: e.verweise.map((v) => `${artVon.get(v) ?? 'regel'}/${v}`)
  }));
  bestand = [
    ...bestand,
    ...AUSRUESTUNG.map(ausruestungAlsRegel),
    ...ZAUBER.map(zauberAlsRegel),
    ...MAGISCHE_GEGENSTAENDE.map(gegenstandAlsRegel)
  ];
  return bestand;
}

/** Der Eintrag zu einer Kennung des Glossars („prone" -> „zustand/prone"). */
export function regelFuerGlossar(glossarId: string): Regel | undefined {
  return alleRegeln().find((regel) => regel.id.endsWith(`/${glossarId}`));
}

/** Die Kennung im Glossar: „zustand/prone" -> „prone". */
export function glossarId(regel: Regel): string {
  return regel.id.slice(regel.id.indexOf('/') + 1);
}

export function regelNach(id: string): Regel | undefined {
  return alleRegeln().find((regel) => regel.id === id);
}

/**
 * Der Eintrag, den ein Listenpunkt nennt: „Blinded" in der Liste der
 * Zustaende, „Magie wirken" in der deutschen Liste der Aktionen (der
 * Eintrag heisst dort „Magie").
 */
const LISTENNAMEN: Record<string, string> = { 'Magie wirken': 'Magie', Erschöpft: 'Erschöpfung' };

export function regelMitNamen(name: string, sprache: 'de' | 'en'): Regel | undefined {
  const gesucht = sprache === 'de' ? LISTENNAMEN[name] ?? name : name;
  return alleRegeln().find((regel) => regel.name[sprache] === gesucht);
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

/**
 * Ein einzelner Unterpunkt: fetter Kopf und Rest. `null` als Kopf, wenn der
 * Text keinen traegt.
 */
export function unterpunkt(text: string): Absatz {
  const treffer = /^([^.:]{2,60}[.:])\s+([\s\S]+)$/.exec(text.trim());
  return treffer ? { kopf: treffer[1], rest: treffer[2] } : { kopf: null, rest: text.trim() };
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
