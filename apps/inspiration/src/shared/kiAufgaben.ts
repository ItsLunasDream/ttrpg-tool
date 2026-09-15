/**
 * Was die Inspirationshilfe ein Sprachmodell fragt.
 *
 * Die KI steht NEBEN den Tabellen, nicht an ihrer Stelle. Die Tabellen sind
 * der Weg ohne KI und bleiben, wie sie sind; das Modell schlaegt frei vor.
 * Waere es auf die Tabelleneintraege festgelegt, waere es ein langsamer und
 * teurer Wuerfel.
 *
 * Gefragt wird immer nur nach EINEM Baustein. Eine ganze Kampagne in einer
 * Anfrage ist teuer, dauert, und man sieht am Ende einen Textblock, dem man
 * nicht ansieht, was man davon behalten will (docs/inspirationshilfe.md,
 * offene Frage 3).
 *
 * Der Zuschnitt geht als Text mit, nicht als Marke. Das ist der eine Punkt,
 * an dem die KI wirklich mehr kann als die Tabellen: „Schwebende Inseln"
 * findet in keiner Tabelle eine Marke, ein Modell kann damit aber etwas
 * anfangen.
 *
 * Plattformfrei: kein node:*, kein electron. Hier steht nur Text und
 * Auswertung, damit sich beides pruefen laesst, ohne ein Modell zu fragen.
 */
import type { Entwurf } from './erzeuge';
import { MENGEN, type Sprache, type UmfangId } from './tabellen';
import { ZEITMARKEN } from './zeitstrahl';

/** Wonach gefragt werden kann. */
export const KI_AUFGABEN = ['aufhaenger', 'fraktion', 'figur', 'ort', 'verbindung', 'zeitstrahl'] as const;
export type KiAufgabe = (typeof KI_AUFGABEN)[number];

/**
 * Die Regler, wie sie dastehen — als Text und nicht als Marke.
 *
 * Leere Felder fallen aus der Anfrage heraus; „beliebig" ist keine Vorgabe,
 * die man einem Modell schreiben muesste.
 */
export interface Vorgaben {
  readonly umfang: UmfangId;
  readonly region: string;
  readonly thema: string;
  readonly tonfall: string;
}

/**
 * Wie lang ein Satz hoechstens sein darf.
 *
 * Die Tabelleneintraege sind kurze Saetze. Ein Modell, dem man nichts sagt,
 * schreibt einen Absatz — und ein Entwurf, den man nicht ueberfliegen kann,
 * nuetzt am Tisch nichts.
 */
export const MAX_ZEICHEN = 160;

const REGELN: Record<'de' | 'en', string> = {
  de: [
    'Du hilfst beim Entwerfen einer Kampagne für ein Pen-and-Paper-Rollenspiel.',
    '',
    'Du lieferst Bausteine, keine fertige Geschichte: einen Aufhänger, eine Fraktion,',
    'eine Figur, einen Ort, eine Verbindung. Die Spielleitung setzt daraus zusammen,',
    'was sie braucht.',
    '',
    'Regeln:',
    `- Jeder Wert ist ein kurzer Satz, höchstens ${MAX_ZEICHEN} Zeichen. Keine Absätze.`,
    '- Konkret statt allgemein. „Das Zollhaus ist abgebrannt, samt aller Bücher"',
    '  statt „es gibt Ärger in der Stadt".',
    '- Keine Werte, keine Stufen, keine Regelbegriffe, keine Spielernamen.',
    '- Nichts über die Heldengruppe selbst entscheiden. Sie ist noch nicht dabei.',
    '- Was du lieferst, muss zu dem passen, was schon dasteht.',
    '- Antworte nur mit JSON, ohne Erklärung drumherum.'
  ].join('\n'),
  en: [
    'You help design a campaign for a tabletop role-playing game.',
    '',
    'You deliver building blocks, not a finished story: a hook, a faction, a character,',
    'a place, a connection. The game master assembles what they need from them.',
    '',
    'Rules:',
    `- Each value is one short sentence, at most ${MAX_ZEICHEN} characters. No paragraphs.`,
    '- Concrete, not general. "The customs house burned down, ledgers and all"',
    '  rather than "there is trouble in town".',
    '- No stats, no levels, no rules terms, no player names.',
    '- Decide nothing about the player party. It is not there yet.',
    '- What you deliver has to fit what is already there.',
    '- Answer with JSON only, no explanation around it.'
  ].join('\n')
};

export function systemAnweisung(sprache: Sprache): string {
  return REGELN[sprache === 'en' ? 'en' : 'de'];
}

/** Die Felder je Aufgabe, in der Reihenfolge, in der sie gelesen werden. */
export const FELDER: Record<KiAufgabe, readonly string[]> = {
  aufhaenger: ['ausloeser', 'betroffene', 'komplikation', 'frist'],
  fraktion: ['name', 'art', 'ziel', 'mittel', 'schwaeche'],
  figur: ['name', 'rolle', 'triebfeder', 'hebel', 'makel'],
  ort: ['name', 'art', 'merkmal', 'zustand', 'karte'],
  verbindung: ['muster', 'hin', 'zurueck'],
  zeitstrahl: ['schritte']
};

/** Was in dem jeweiligen Feld stehen soll — geht als Erklaerung mit. */
const ERKLAERUNG: Record<KiAufgabe, Record<'de' | 'en', readonly string[]>> = {
  aufhaenger: {
    de: [
      '"ausloeser": was geschehen ist, abgeschlossen und konkret',
      '"betroffene": wer damit zur Gruppe kommt, ein Mensch mit einem Anliegen',
      '"komplikation": was die Sache schief macht, beginnend mit „Nur:"',
      '"frist": bis wann, oder leer, wenn keine Uhr tickt'
    ],
    en: [
      '"ausloeser": what has happened, finished and concrete',
      '"betroffene": who brings it to the party, a person with a request',
      '"komplikation": what makes it awkward, starting with "Only:"',
      '"frist": by when, or empty if no clock is ticking'
    ]
  },
  fraktion: {
    de: [
      '"name": der Name der Gruppe, mit Artikel',
      '"art": was für eine Art Gruppe das ist',
      '"ziel": was sie erreichen will, als Vorhaben ohne Fürwort',
      '"mittel": womit sie es versucht',
      '"schwaeche": woran es hakt — ohne das wäre sie unbesiegbar'
    ],
    en: [
      '"name": the group’s name',
      '"art": what kind of group it is',
      '"ziel": what it wants to achieve, as an aim without pronouns',
      '"mittel": how it goes about it',
      '"schwaeche": where it is vulnerable — without that it would be unbeatable'
    ]
  },
  figur: {
    de: [
      '"name": Rufname und Beiname',
      '"rolle": die Rolle im Geflecht, zwei bis vier Wörter, ohne Geschlecht',
      '"triebfeder": was diese Figur will',
      '"hebel": was sie in der Hand hat und für die Gruppe interessant macht',
      '"makel": was gegen sie spricht, beginnend mit „Aber:"'
    ],
    en: [
      '"name": given name and byname',
      '"rolle": their role in the web, two to four words',
      '"triebfeder": what this person wants',
      '"hebel": what they hold that makes them useful to the party',
      '"makel": what speaks against them, starting with "But:"'
    ]
  },
  ort: {
    de: [
      '"name": der Name des Ortes, ein Wort',
      '"art": was der Ort ist',
      '"merkmal": was ihn von jedem anderen seiner Art unterscheidet',
      '"zustand": wie es gerade um ihn steht',
      '"karte": was auf einer Karte davon stehen würde, z. B. „drei Zugänge, einer verschüttet"'
    ],
    en: [
      '"name": the place’s name, one word',
      '"art": what the place is',
      '"merkmal": what sets it apart from every other of its kind',
      '"zustand": how things stand with it right now',
      '"karte": what would be on a map of it, e.g. "three ways in, one collapsed"'
    ]
  },
  verbindung: {
    de: [
      '"muster": wie diese Verbindung heißt, zwei bis drei Wörter',
      '"hin": wie die erste Person die zweite sieht',
      '"zurueck": wie die zweite die erste sieht — bewusst anders'
    ],
    en: [
      '"muster": what this connection is called, two or three words',
      '"hin": how the first person sees the second',
      '"zurueck": how the second sees the first — deliberately differently'
    ]
  },
  zeitstrahl: {
    de: ['"schritte": eine Liste von Sätzen, je einer pro Zeitpunkt, mit steigender Wucht'],
    en: ['"schritte": a list of sentences, one per point in time, escalating']
  }
};

function vorgabezeilen(vorgaben: Vorgaben, sprache: Sprache): string[] {
  const de = sprache !== 'en';
  const zeilen: string[] = [];
  const umfang: Record<UmfangId, { de: string; en: string }> = {
    abend: { de: 'ein einzelner Spielabend', en: 'a single evening of play' },
    bogen: { de: 'ein Handlungsbogen über mehrere Abende', en: 'an arc over several sessions' },
    kampagne: { de: 'eine ganze Kampagne', en: 'a whole campaign' }
  };
  zeilen.push(de ? `Umfang: ${umfang[vorgaben.umfang].de}.` : `Scope: ${umfang[vorgaben.umfang].en}.`);
  // Freier Text geht wortwoertlich mit. Die Tabellen koennen mit „Schwebende
  // Inseln" nichts anfangen, ein Modell schon — das ist der Punkt, an dem es
  // wirklich etwas beitraegt.
  if (vorgaben.region.trim()) {
    zeilen.push(de ? `Region: ${vorgaben.region.trim()}.` : `Region: ${vorgaben.region.trim()}.`);
  }
  if (vorgaben.thema.trim()) {
    zeilen.push(de ? `Thema: ${vorgaben.thema.trim()}.` : `Theme: ${vorgaben.thema.trim()}.`);
  }
  if (vorgaben.tonfall.trim()) {
    zeilen.push(de ? `Tonfall: ${vorgaben.tonfall.trim()}.` : `Tone: ${vorgaben.tonfall.trim()}.`);
  }
  return zeilen;
}

/**
 * Der Entwurf, wie er dasteht — kurz gefasst.
 *
 * Nicht alles: Fraktionsmittel und Figurenmakel gehoeren nicht in jede
 * Anfrage. Es geht darum, dass der Vorschlag in dieselbe Welt passt, nicht
 * darum, dem Modell den ganzen Entwurf vorzulesen.
 */
function umgebung(entwurf: Entwurf | null, sprache: Sprache): string[] {
  if (!entwurf) return [];
  const de = sprache !== 'en';
  const zeilen: string[] = [];
  const haken = entwurf.aufhaenger;
  if (haken.ausloeser) {
    zeilen.push(de ? 'Der Aufhänger:' : 'The hook:', `- ${haken.ausloeser}`);
    if (haken.komplikation) zeilen.push(`- ${haken.komplikation}`);
  }
  if (entwurf.fraktionen.length > 0) {
    zeilen.push(
      '',
      de ? 'Fraktionen:' : 'Factions:',
      ...entwurf.fraktionen.map((f) => `- ${f.name}: ${f.ziel}`)
    );
  }
  if (entwurf.figuren.length > 0) {
    zeilen.push(
      '',
      de ? 'Figuren:' : 'Characters:',
      ...entwurf.figuren.map((f) => `- ${f.name} (${f.rolle})`)
    );
  }
  if (entwurf.orte.length > 0) {
    zeilen.push('', de ? 'Orte:' : 'Places:', ...entwurf.orte.map((o) => `- ${o.name}: ${o.art}`));
  }
  return zeilen;
}

/** Wonach genau gefragt wird. */
export interface Frage {
  readonly aufgabe: KiAufgabe;
  readonly vorgaben: Vorgaben;
  readonly entwurf: Entwurf | null;
  /** Nur bei 'verbindung': die beiden Namen, um die es geht. */
  readonly namen?: readonly [string, string];
}

const EINLEITUNG: Record<KiAufgabe, Record<'de' | 'en', string>> = {
  aufhaenger: {
    de: 'Erfinde einen Aufhänger: warum die Gruppe überhaupt anfängt.',
    en: 'Invent a hook: why the party gets involved at all.'
  },
  fraktion: {
    de: 'Erfinde eine Fraktion, deren Ziel den anderen im Weg steht.',
    en: 'Invent a faction whose goal gets in the way of the others.'
  },
  figur: {
    de: 'Erfinde eine Figur mit einer Rolle in diesem Geflecht.',
    en: 'Invent a character with a role in this web.'
  },
  ort: { de: 'Erfinde einen Ort, an dem eine Szene spielen kann.', en: 'Invent a place worth a scene.' },
  verbindung: {
    de: 'Finde heraus, was diese beiden miteinander zu tun haben.',
    en: 'Work out what these two have to do with each other.'
  },
  zeitstrahl: {
    de: 'Sag, was passiert, wenn die Gruppe nichts tut.',
    en: 'Say what happens if the party does nothing.'
  }
};

/** Die Anfrage an das Modell. */
export function anweisung(frage: Frage, sprache: Sprache): string {
  const de = sprache !== 'en';
  const teile: string[] = [EINLEITUNG[frage.aufgabe][de ? 'de' : 'en']];

  teile.push('', ...vorgabezeilen(frage.vorgaben, sprache));

  if (frage.aufgabe === 'verbindung' && frage.namen) {
    teile.push(
      '',
      de
        ? `Es geht um ${frage.namen[0]} (erste Person) und ${frage.namen[1]} (zweite Person).`
        : `This is about ${frage.namen[0]} (first person) and ${frage.namen[1]} (second person).`,
      de
        ? 'Beide sehen dieselbe Sache verschieden — daraus entsteht am Tisch die Szene.'
        : 'The two see the same thing differently — that is what makes the scene.'
    );
  }

  const bekannt = umgebung(frage.entwurf, sprache);
  if (bekannt.length > 0) {
    teile.push('', de ? 'Das steht schon:' : 'What is already there:', ...bekannt);
  }

  if (frage.aufgabe === 'zeitstrahl') {
    const marken = ZEITMARKEN[frage.vorgaben.umfang].slice(
      0,
      MENGEN[frage.vorgaben.umfang].schritte
    );
    teile.push(
      '',
      de ? 'Zu diesen Zeitpunkten, in dieser Reihenfolge:' : 'At these points in time, in order:',
      ...marken.map((marke, i) => `${i + 1}. ${marke[de ? 'de' : 'en']}`)
    );
  }

  teile.push(
    '',
    de ? 'Antworte als JSON mit genau diesen Schlüsseln:' : 'Answer as JSON with exactly these keys:',
    frage.aufgabe === 'zeitstrahl'
      ? '{"schritte": ["…", "…"]}'
      : `{${FELDER[frage.aufgabe].map((feld) => `"${feld}": "…"`).join(', ')}}`,
    '',
    ...ERKLAERUNG[frage.aufgabe][de ? 'de' : 'en'],
    '',
    de
      ? `Jeder Wert höchstens ${MAX_ZEICHEN} Zeichen, auf Deutsch.`
      : `Each value at most ${MAX_ZEICHEN} characters, in English.`
  );

  return teile.join('\n');
}

function sauber(wert: unknown): string {
  if (typeof wert !== 'string') return '';
  // Zeilenumbrueche raus: die Felder sind einzeilig, und ein Umbruch darin
  // waere unsichtbar und trotzdem im Export.
  return wert.replace(/\s+/g, ' ').trim().slice(0, MAX_ZEICHEN);
}

/**
 * Macht aus dem, was das Modell geschickt hat, uebernehmbare Werte.
 *
 * Grosszuegig beim Lesen, streng beim Uebernehmen: unbekannte Schluessel
 * fallen weg, Werte werden gekuerzt, und fehlt ein Pflichtfeld, gilt die
 * ganze Antwort als misslungen. Ein halb gefuellter Baustein saehe aus wie
 * ein Fehler in der Anwendung.
 *
 * Ausnahme ist die Frist: sie darf leer bleiben, genau wie beim Wuerfeln.
 */
export function uebernehmbar(
  aufgabe: KiAufgabe,
  gelesen: unknown
): Record<string, string> | readonly string[] | null {
  if (typeof gelesen !== 'object' || gelesen === null) return null;
  const roh = gelesen as Record<string, unknown>;

  if (aufgabe === 'zeitstrahl') {
    const liste = Array.isArray(roh.schritte) ? roh.schritte : Array.isArray(gelesen) ? gelesen : null;
    if (!liste) return null;
    const schritte = liste.map(sauber).filter((satz) => satz.length > 0);
    return schritte.length > 0 ? schritte : null;
  }

  const ergebnis: Record<string, string> = {};
  for (const feld of FELDER[aufgabe]) {
    const wert = sauber(roh[feld]);
    // Die Frist ist der einzige Wert, der leer bleiben darf.
    if (!wert && !(aufgabe === 'aufhaenger' && feld === 'frist')) return null;
    ergebnis[feld] = wert;
  }
  return ergebnis;
}
