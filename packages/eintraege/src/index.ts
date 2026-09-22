/**
 * Was ein Werkzeug abgelegt hat, in einer Form, die alle verstehen.
 *
 * Die gemeinsame Schnittstelle, die das Konzept der Austausch-App als den
 * groesseren Brocken benannt hat (`docs/austausch.md`). Heute gibt es nur
 * Einzelbruecken zwischen je zwei Werkzeugen — Monster → Story Creator, NPC
 * → Story Creator, Inspiration → Karteneditor. Ein viertes und fuenftes Paar
 * zu verdrahten waere die Art Wachstum, bei der am Ende niemand mehr weiss,
 * wer mit wem redet.
 *
 * Zwei Saetze reichen:
 *
 *     „Gib mir deine Eintraege."
 *     „Zeig mir diesen Eintrag."
 *
 * Wer beide beantwortet, macht mit. Wer nicht, taucht nicht auf. Dieselbe
 * Form wie bei `@suite/einstellungen` — ein optionaler Haken je Werkzeug,
 * und die Huelle muss ueber ein neues Werkzeug nichts wissen.
 *
 * Der erste Nutzer ist die werkzeuguebergreifende Suche (Strg+K). Der
 * zweite waere der Austausch am Tisch.
 *
 * Plattformfrei: nur Daten und reine Funktionen. Wer die Eintraege von der
 * Platte holt, tut das im Hauptprozess.
 */

/** Ein Ding, das ein Werkzeug abgelegt hat. */
export interface Eintrag {
  /** Welches Werkzeug es hat. Dorthin springt die Suche. */
  readonly werkzeug: string;
  /**
   * Eindeutig INNERHALB des Werkzeugs.
   *
   * Nicht global: jedes Werkzeug vergibt seine Kennungen selbst, und sie
   * nachtraeglich eindeutig zu machen hiesse, in jede Ablage einzugreifen.
   * Wer einen Eintrag meint, nennt beides — Werkzeug und Kennung.
   */
  readonly kennung: string;
  readonly name: string;
  /**
   * Was es ist, in der Sprache des Werkzeugs: „Notiz", „Monster",
   * „Begegnung". Steht auf der Trefferzeile, damit man zwei gleichnamige
   * Dinge auseinanderhalten kann.
   */
  readonly art: string;
  /**
   * Weiteres, worin gesucht werden soll — Teilnehmer einer Begegnung, das
   * Thema eines Monsters, der Anfang einer Notiz.
   *
   * Nicht der ganze Text: die Suche soll im Speicher laufen und schnell
   * sein. Wer eine Volltextsuche will, baut sie im Werkzeug.
   */
  readonly stichworte?: string;
}

/** Wo ein Eintrag steht: Werkzeug und Kennung zusammen. */
export function eintragsSchluessel(eintrag: Eintrag): string {
  return `${eintrag.werkzeug}/${eintrag.kennung}`;
}

/**
 * Kleinschreibung, Umlaute vereinheitlicht.
 *
 * Damit „Bär" auf „bar" passt — dieselbe Regel wie in den Suchen der
 * einzelnen Werkzeuge. Sie stand dort dreimal; hier steht sie einmal.
 */
export function schluessel(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');
}

/** Alles, worin gesucht wird. */
export function heuhaufen(eintrag: Eintrag): string {
  return schluessel([eintrag.name, eintrag.art, eintrag.stichworte ?? ''].join(' '));
}

/**
 * Ob ein Eintrag zur Suche passt.
 *
 * In Worten, nicht als eine Zeichenkette: „ghul wald" findet die Begegnung
 * „Waldlager", in der ein Ghul steht. Alle Worte muessen vorkommen, nicht
 * irgendeines — sonst wird die Liste mit jedem getippten Wort laenger statt
 * kuerzer.
 */
export function passt(eintrag: Eintrag, suche: string): boolean {
  const worte = schluessel(suche).split(/\s+/).filter(Boolean);
  if (worte.length === 0) return true;
  const stroh = heuhaufen(eintrag);
  return worte.every((wort) => stroh.includes(wort));
}

/**
 * Wie gut ein Eintrag passt. Groesser ist besser.
 *
 * Die Reihenfolge ist der halbe Wert einer Suche ueber alles: bei zwanzig
 * Treffern aus fuenf Werkzeugen entscheidet sie, ob man den gesuchten sofort
 * sieht oder scrollt.
 *
 * Gewichtet wird, WO der Treffer sass und WIE genau:
 * - der ganze Name ist der beste Treffer,
 * - der Anfang des Namens der zweitbeste,
 * - irgendwo im Namen der drittbeste,
 * - nur in den Stichworten der schwaechste.
 */
export function guete(eintrag: Eintrag, suche: string): number {
  const gesucht = schluessel(suche).trim();
  if (!gesucht) return 0;
  const name = schluessel(eintrag.name);

  if (name === gesucht) return 100;
  if (name.startsWith(gesucht)) return 75;
  if (name.includes(gesucht)) return 50;

  // Mehrere Worte, die zusammen nur ueber Name und Stichworte aufgehen.
  const worte = gesucht.split(/\s+/).filter(Boolean);
  const imNamen = worte.filter((wort) => name.includes(wort)).length;
  if (imNamen === worte.length) return 40;
  return 10 + imNamen;
}

/**
 * Die Treffer, die besten zuerst.
 *
 * Bei gleicher Guete entscheidet der Name — damit die Liste sich beim
 * Tippen nicht umsortiert, ohne dass sich etwas geaendert haette.
 */
export function finde(
  eintraege: readonly Eintrag[],
  suche: string,
  hoechstens = 40
): readonly Eintrag[] {
  const getroffen = eintraege.filter((eintrag) => passt(eintrag, suche));
  const sortiert = [...getroffen].sort((a, b) => {
    const unterschied = guete(b, suche) - guete(a, suche);
    if (unterschied !== 0) return unterschied;
    return a.name.localeCompare(b.name, 'de');
  });
  return sortiert.slice(0, hoechstens);
}

/** Die Treffer nach Werkzeug gebuendelt, in der Reihenfolge der besten. */
export interface Buendel {
  readonly werkzeug: string;
  readonly eintraege: readonly Eintrag[];
}

export function buendle(eintraege: readonly Eintrag[]): readonly Buendel[] {
  const nachWerkzeug = new Map<string, Eintrag[]>();
  for (const eintrag of eintraege) {
    const liste = nachWerkzeug.get(eintrag.werkzeug);
    if (liste) liste.push(eintrag);
    else nachWerkzeug.set(eintrag.werkzeug, [eintrag]);
  }
  // `Map` haelt die Einfuegereihenfolge — und die ist die der Treffer. Das
  // Werkzeug mit dem besten Treffer steht damit oben.
  return [...nachWerkzeug].map(([werkzeug, liste]) => ({ werkzeug, eintraege: liste }));
}
