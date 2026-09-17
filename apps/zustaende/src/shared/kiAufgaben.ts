/**
 * Was die KI beisteuert — und was mit ihrer Antwort passiert.
 *
 * Dasselbe Muster wie in den anderen Werkzeugen: frei vorschlagen, nicht aus
 * den Tabellen. Ein Modell, das wuerfelt, waere ein langsamer Wuerfel.
 *
 * DIE BREMSE: was zurueckkommt, wird GEPRUEFT, bevor es angezeigt wird.
 * Stufen duerfen nicht rueckwaerts schwaecher werden, eine Wirkung darf
 * nicht zweimal vorkommen. Das ist kein Urteil ueber Balance — das ist
 * reines Nachzaehlen, und genau deshalb darf das Werkzeug es.
 *
 * Der Unterschied zum Monster Creator: dort werden die Zahlen der KI
 * automatisch auf den Grad GEZOGEN. Hier wird nicht gezogen, sondern
 * ZURUECKGEWIESEN. Beim Monster gibt es einen richtigen Wert, auf den man
 * ziehen kann — den Richtwert des Grades. Bei einem Zustand gibt es den
 * nicht: welche Wirkung auf Stufe 3 gehoert, ist keine Rechnung. Was kaputt
 * ist, kann das Werkzeug erkennen; was besser waere, nicht.
 */

import { pruefe, type Stufe } from './gewicht';
import type { Zustand } from './erzeuge';
import { WIRKUNGEN, eigeneWirkungen, wirkung } from './wirkungen';
import { ARTEN, HAERTEN, THEMEN, text, type Sprache } from './tabellen';

export const KI_AUFGABEN = ['name', 'kurzsatz', 'stufe', 'zustand', 'ausformulieren'] as const;
export type KiAufgabe = (typeof KI_AUFGABEN)[number];

/** Womit die KI nicht ueberzogen werden darf. Eine Antwort ist kein Roman. */
export const MAX_ZEICHEN = 700;

export interface Frage {
  readonly aufgabe: KiAufgabe;
  readonly artId?: string;
  readonly themaId?: string;
  readonly haerteId?: string;
  readonly stufen?: number;
  /** Der bisherige Stand, wenn es einen gibt. */
  readonly zustand?: Zustand | null;
  /** Was der Mensch sich thematisch wuenscht, in eigenen Worten. */
  readonly wunsch?: string;
}

export function systemAnweisung(sprache: Sprache): string {
  const de = sprache !== 'en';
  return de
    ? [
        'Du hilfst beim Bau eigener Zustände für ein Pen-&-Paper-Rollenspiel.',
        'Du antwortest ausschließlich mit JSON, ohne Text davor oder danach.',
        `Jeder einzelne Text bleibt unter ${MAX_ZEICHEN} Zeichen.`,
        'Regeltexte sind Stichpunkte, keine Prosa — am Tisch liest niemand einen Absatz.',
        'Stufen bauen aufeinander auf: jede ist schlimmer als die davor.',
        'Keine Regelzitate, keine Seitenangaben, keine geschützten Eigennamen.'
      ].join('\n')
    : [
        'You help build custom conditions for a tabletop roleplaying game.',
        'You answer with JSON only, no text before or after.',
        `Every single text stays under ${MAX_ZEICHEN} characters.`,
        'Rules text is bullet points, not prose — nobody reads a paragraph at the table.',
        'Levels build on each other: every one is worse than the one before.',
        'No rules quotations, no page references, no protected names.'
      ].join('\n');
}

export const FELDER: Record<KiAufgabe, readonly string[]> = {
  name: ['name'],
  kurzsatz: ['kurzsatz'],
  stufe: ['text'],
  zustand: ['name', 'kurzsatz', 'stufen', 'verschlimmerung', 'linderung'],
  ausformulieren: ['stufen']
};

export function anweisung(frage: Frage, sprache: Sprache): string {
  const de = sprache !== 'en';
  const art = ARTEN.find((a) => a.id === frage.artId);
  const thema = THEMEN.find((t) => t.id === frage.themaId);
  const haerte = HAERTEN.find((h) => h.id === frage.haerteId);

  const teile: string[] = [];

  // Der eigene Wunsch steht ganz oben: Modelle gewichten den Anfang
  // staerker, und hier ist der freie Text das Eigentliche.
  if (frage.wunsch && frage.wunsch.trim() !== '') {
    teile.push(
      de ? `Gewünscht ist: ${frage.wunsch.trim().slice(0, MAX_ZEICHEN)}` : `Wanted: ${frage.wunsch.trim().slice(0, MAX_ZEICHEN)}`,
      ''
    );
  }

  if (art) teile.push(de ? `Art: ${text(art.name, sprache)}` : `Kind: ${text(art.name, sprache)}`);
  if (thema) teile.push(de ? `Thema: ${text(thema.name, sprache)}` : `Theme: ${text(thema.name, sprache)}`);
  if (haerte) teile.push(de ? `Härte: ${text(haerte.name, sprache)}` : `Severity: ${text(haerte.name, sprache)}`);
  if (frage.stufen) teile.push(de ? `Stufen: ${frage.stufen}` : `Levels: ${frage.stufen}`);

  if (frage.zustand) {
    const z = frage.zustand;
    teile.push(
      '',
      de ? 'Das steht schon:' : 'What is already there:',
      `- ${z.name}: ${z.kurzsatz}`,
      ...z.stufen.map((stufe) => `- ${stufe.nummer}. ${textVonStufe(stufe, sprache)}`)
    );
  }

  if (frage.aufgabe === 'zustand') {
    /*
     * Die Wirkungen der Tabellen gehen MIT in die Anfrage.
     *
     * Nicht als Zwang — das Modell darf eigene erfinden, dafuer ist es da —,
     * sondern als Massstab fuer die Tonlage und die Laenge. Ohne sie kommen
     * Absaetze zurueck, wo Stichpunkte hingehoeren.
     */
    /*
     * Die Beispiele kommen, wenn moeglich, aus dem gewaehlten Thema.
     *
     * Ein Modell, dem man acht allgemeine Wirkungen zeigt, liefert acht
     * allgemeine zurueck. Zeigt man ihm „du brennst weiter, bis du die
     * Flammen loeschst", liefert es Feuer.
     */
    const ausThema = thema ? eigeneWirkungen(thema.id).filter((w) => w.richtung !== 'buff') : [];
    const rest = WIRKUNGEN.filter((w) => w.richtung !== 'buff' && w.themen === undefined);
    const beispiele = [...ausThema, ...rest].slice(0, 8).map((w) => `- ${text(w.text, sprache)}`);
    teile.push(
      '',
      de ? 'So kurz sollen die Stufen sein:' : 'Levels should be this short:',
      ...beispiele,
      '',
      de
        ? 'Nenne konkrete Zahlen: 1W6 Feuerschaden, −2 auf Angriffswürfe, Rettungswurf SG 13. "Weniger Schaden" ist am Tisch eine Rückfrage, keine Wirkung.'
        : 'Name concrete numbers: 1d6 fire damage, −2 to attack rolls, DC 13 saving throw. "Less damage" is a question at the table, not an effect.',
      de
        ? 'Liefere "stufen" als Liste von Objekten mit "nummer" und "text". Jede Stufe ist schlimmer als die davor und wiederholt keine frühere Wirkung.'
        : 'Deliver "stufen" as a list of objects with "nummer" and "text". Each level is worse than the one before and repeats no earlier effect.'
    );
  }

  if (frage.aufgabe === 'ausformulieren') {
    teile.push(
      '',
      de
        ? 'Formuliere jede Stufe in einem Satz aus, ohne ihre Regelwirkung zu ändern. Liefere "stufen" als Liste von Objekten mit "nummer" und "text".'
        : 'Write out each level as one sentence without changing its rules effect. Deliver "stufen" as a list of objects with "nummer" and "text".'
    );
  }

  teile.push(
    '',
    de ? 'Antworte als JSON mit genau diesen Schlüsseln:' : 'Answer as JSON with exactly these keys:',
    FELDER[frage.aufgabe].join(', ')
  );

  return teile.filter((zeile) => zeile !== '').join('\n');
}

/** Die Wirkungen einer Stufe als Text. */
export function textVonStufe(stufe: Stufe, sprache: Sprache): string {
  return stufe.wirkungen
    .map((id) => {
      const gefunden = wirkung(id);
      return gefunden ? text(gefunden.text, sprache) : id;
    })
    .join('; ');
}

/* ---------- Die Antwort lesen ---------- */

function alsText(wert: unknown): string {
  return typeof wert === 'string' ? wert.trim().slice(0, MAX_ZEICHEN) : '';
}

/**
 * Eine Stufe, wie die KI sie liefert: als freier Text.
 *
 * Die KI vergibt KEINE Wirkungskennungen. Sie kennt die Tabelle nicht, und
 * sie soll sie nicht kennen — sonst waere sie wieder ein langsamer Wuerfel.
 * Was sie liefert, ist ein Stichpunkt, und der bekommt hier ein Gewicht
 * ueber die Schaetzung unten.
 */
export interface RohStufe {
  readonly nummer: number;
  readonly text: string;
}

export interface RohZustand {
  readonly name: string;
  readonly kurzsatz: string;
  readonly stufen: readonly RohStufe[];
  readonly verschlimmerung: string;
  readonly linderung: string;
}

export function uebernehmbar(aufgabe: KiAufgabe, gelesen: unknown): unknown {
  if (typeof gelesen !== 'object' || gelesen === null) return null;
  const o = gelesen as Record<string, unknown>;

  if (aufgabe === 'name') return alsText(o.name) || null;
  if (aufgabe === 'kurzsatz') return alsText(o.kurzsatz) || null;
  if (aufgabe === 'stufe') return alsText(o.text) || null;

  const stufen = leseStufen(o.stufen);
  if (aufgabe === 'ausformulieren') return stufen.length > 0 ? stufen : null;

  const name = alsText(o.name);
  if (!name) return null;

  const roh: RohZustand = {
    name,
    kurzsatz: alsText(o.kurzsatz),
    stufen,
    verschlimmerung: alsText(o.verschlimmerung),
    linderung: alsText(o.linderung)
  };
  return roh;
}

function leseStufen(wert: unknown): RohStufe[] {
  if (!Array.isArray(wert)) return [];
  return wert
    .map((eintrag, stelle) => {
      const s = eintrag as Record<string, unknown>;
      const nummer = Number(s?.nummer);
      return {
        nummer: Number.isFinite(nummer) && nummer > 0 ? Math.round(nummer) : stelle + 1,
        text: alsText(s?.text)
      };
    })
    .filter((stufe) => stufe.text !== '')
    .sort((a, b) => a.nummer - b.nummer)
    // Zehn sind die Obergrenze. Wer mehr will, baut zwei Zustaende.
    .slice(0, 10);
}

/** Was bei der Pruefung einer KI-Antwort herauskam. */
export interface KiBefund {
  /** Ob die Antwort brauchbar ist. */
  readonly ok: boolean;
  /** Warum nicht, als Schluesselwoerter fuer die Oberflaeche. */
  readonly gruende: readonly string[];
}

/**
 * Taugt, was die KI geliefert hat?
 *
 * Geprueft wird NUR, was sich nachzaehlen laesst:
 *
 *   - Gibt es ueberhaupt Stufen?
 *   - Sind sie lueckenlos von 1 an durchnummeriert?
 *   - Wiederholt sich ein Stufentext wortgleich?
 *   - Ist eine Stufe so lang, dass sie am Tisch niemand liest?
 *
 * Nicht geprueft wird, ob Stufe 3 „schlimmer" ist als Stufe 2 — das steht
 * in freiem Text, und ein Werkzeug, das Prosa nach Schwere sortiert, taeuscht
 * eine Faehigkeit vor, die es nicht hat. Wer die Stufen aus den Tabellen
 * baut, bekommt diese Pruefung; wer sie von der KI schreiben laesst, bekommt
 * die Reihenfolge, die das Modell gewaehlt hat.
 */
export function pruefeKiAntwort(roh: RohZustand): KiBefund {
  const gruende: string[] = [];

  if (roh.stufen.length === 0) gruende.push('kiFehler.keineStufen');

  const nummern = roh.stufen.map((s) => s.nummer);
  const erwartet = nummern.map((_, i) => i + 1);
  if (nummern.join() !== erwartet.join()) gruende.push('kiFehler.stufenLuecke');

  const texte = roh.stufen.map((s) => s.text.toLowerCase().trim());
  if (new Set(texte).size !== texte.length) gruende.push('kiFehler.stufeDoppelt');

  if (roh.stufen.some((s) => s.text.length > 160)) gruende.push('kiFehler.zuLang');

  return { ok: gruende.length === 0, gruende };
}

/**
 * Was die Tabellen aufzufuellen haben.
 *
 * Ein Modell laesst gern etwas aus. Was fehlt, kommt aus dem gewuerfelten
 * Entwurf — dasselbe Verfahren wie `uebernahme.ts` in der Inspirationshilfe.
 * Die Stufen der KI ersetzen dabei die gewuerfelten nur, wenn sie die
 * Pruefung bestehen.
 */
export function zieheKiNach(
  roh: RohZustand,
  entwurf: Zustand
): { zustand: Zustand; befund: KiBefund } {
  const befund = pruefeKiAntwort(roh);
  const zustand: Zustand = {
    ...entwurf,
    name: roh.name || entwurf.name,
    kurzsatz: roh.kurzsatz || entwurf.kurzsatz,
    verschlimmerung: roh.verschlimmerung || entwurf.verschlimmerung,
    linderung: roh.linderung || entwurf.linderung
  };
  return { zustand, befund };
}

/**
 * Das Gewicht einer KI-Stufe, geschaetzt ueber Schluesselwoerter.
 *
 * Eine Kruecke, und sie steht hier als solche. Die KI liefert freien Text,
 * und freier Text hat keinen Punktwert — aber ganz ohne Zahl kann die
 * Oberflaeche einen KI-Zustand nicht neben einen gewuerfelten stellen.
 *
 * Deshalb: die Woerter, die in den Tabellen vorkommen, werden gesucht, und
 * ihr Punktwert wird uebernommen. Was sich nicht zuordnen laesst, zaehlt als
 * eine leichte Wirkung. Das Ergebnis ist eine SCHAETZUNG, und die
 * Oberflaeche sagt das auch — sie zeigt es mit einem Ungefaehr-Zeichen.
 */
export function geschaetztesGewicht(stufen: readonly RohStufe[], sprache: Sprache): number {
  let summe = 0;
  for (const stufe of stufen) {
    const punkte = passendeWirkung(stufe.text, sprache);
    summe += punkte ?? 1;
  }
  return summe;
}

/**
 * Welche bekannte Wirkung in einem freien Text steckt — oder keine.
 *
 * Gezaehlt wird die UEBERLAPPUNG bedeutungstragender Woerter, nicht das
 * erste Wort. Der erste Anlauf nahm das erste Wort als Anker, und „Du bist
 * bewusstlos" fing mit „Du" an und traf damit nichts, waehrend „Nachteil
 * auf Wahrnehmung" ueber „Nachteil" gleich ein halbes Dutzend Wirkungen
 * traf. Die Schaetzung lag dadurch genau falsch herum.
 *
 * Gewaehlt wird die Wirkung mit der groessten Ueberlappung; bei Gleichstand
 * die schwerere, weil eine unterschaetzte Stufe die gefaehrlichere Aussage
 * ist.
 */
function passendeWirkung(text_: string, sprache: Sprache): number | null {
  const klein = text_.toLowerCase();
  let beste: { treffer: number; punkte: number } | null = null;

  for (const w of WIRKUNGEN) {
    const woerter = text(w.text, sprache)
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((wort) => wort.length > 4);
    if (woerter.length === 0) continue;

    const treffer = woerter.filter((wort) => klein.includes(wort)).length;
    if (treffer === 0) continue;

    if (
      !beste ||
      treffer > beste.treffer ||
      (treffer === beste.treffer && Math.abs(w.punkte) > Math.abs(beste.punkte))
    ) {
      beste = { treffer, punkte: w.punkte };
    }
  }
  return beste ? beste.punkte : null;
}

/** Der Befund zu einer KI-Antwort, in Stufen umgerechnet. Fuer die Anzeige. */
export function alsStufen(roh: readonly RohStufe[]): Stufe[] {
  return roh.map((stufe) => ({ nummer: stufe.nummer, wirkungen: [] }));
}

/** Bequemlichkeit: die Pruefung eines fertigen Zustands. */
export { pruefe as pruefeGewicht };
