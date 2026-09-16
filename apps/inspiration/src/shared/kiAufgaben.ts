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
import type { Baustein, Entwurf } from './erzeuge';
import { MENGEN, type Sprache, type UmfangId } from './tabellen';
import { ZEITMARKEN } from './zeitstrahl';

/** Wonach gefragt werden kann. */
export const KI_AUFGABEN = [
  'aufhaenger',
  'fraktion',
  'figur',
  'ort',
  'verbindung',
  'zeitstrahl',
  // Alles auf einmal, als zusammenhaengende Antwort. Die teuerste Anfrage und
  // die einzige, bei der das Modell die Bausteine aufeinander beziehen kann:
  // die Fraktion kennt den Aufhaenger, die Verbindung kennt die Figuren.
  'entwurf'
] as const;
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
    '- Die Vorgaben unten gelten wörtlich und für jeden einzelnen Wert. Steht',
    '  dort „Cyberpunk City", gibt es keine Burgen, keine Zunftmeister und',
    '  keine Kutschen — sondern das, was in so einer Stadt vorkommt. Nimm auch',
    '  eigene, ungewöhnliche Angaben ernst, statt sie in etwas Vertrautes zu',
    '  übersetzen.',
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
    '- The settings below are literal and apply to every single value. If they',
    '  say "cyberpunk city", there are no castles, no guild masters and no',
    '  carriages — there is what such a city holds. Take unusual settings',
    '  seriously instead of translating them into something familiar.',
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
  zeitstrahl: ['schritte'],
  entwurf: ['welt', 'aufhaenger', 'fraktionen', 'figuren', 'orte', 'verbindungen', 'zeitstrahl']
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
  },
  entwurf: {
    de: [
      '"welt": ein bis zwei Sätze, in welcher Welt das spielt — nimm die Vorgaben beim Wort',
      '"aufhaenger": { "ausloeser", "betroffene", "komplikation", "frist" }',
      '"fraktionen": Liste aus { "name", "art", "ziel", "mittel", "schwaeche" }',
      '"figuren": Liste aus { "name", "rolle", "triebfeder", "hebel", "makel" }',
      '"orte": Liste aus { "name", "art", "merkmal", "zustand", "karte" }',
      '"verbindungen": Liste aus { "a", "b", "muster", "hin", "zurueck" } —',
      '  "a" und "b" sind Nummern von Figuren, gezählt ab 0 in der Reihenfolge',
      '  deiner Liste. "hin" ist, wie a die b sieht, "zurueck", wie b die a',
      '  sieht; beide Sätze nennen die Namen und sehen dieselbe Sache anders.',
      '"zeitstrahl": Liste von Sätzen, je einer pro Zeitpunkt, mit steigender Wucht'
    ],
    en: [
      '"welt": one or two sentences on the world this plays in — take the settings literally',
      '"aufhaenger": { "ausloeser", "betroffene", "komplikation", "frist" }',
      '"fraktionen": list of { "name", "art", "ziel", "mittel", "schwaeche" }',
      '"figuren": list of { "name", "rolle", "triebfeder", "hebel", "makel" }',
      '"orte": list of { "name", "art", "merkmal", "zustand", "karte" }',
      '"verbindungen": list of { "a", "b", "muster", "hin", "zurueck" } —',
      '  "a" and "b" are character numbers, counted from 0 in the order of',
      '  your own list. "hin" is how a sees b, "zurueck" how b sees a; both',
      '  name the people and see the same thing differently.',
      '"zeitstrahl": list of sentences, one per point in time, escalating'
    ]
  }
};

/** Wie die Bausteine im Klartext heissen — fuer „das steht fest". */
const BAUSTEIN_TEXT: Record<string, { de: string; en: string }> = {
  aufhaenger: { de: 'der Aufhänger', en: 'the hook' },
  fraktionen: { de: 'die Fraktionen', en: 'the factions' },
  figuren: { de: 'die Figuren', en: 'the characters' },
  orte: { de: 'die Orte', en: 'the places' },
  verbindungen: { de: 'die Verbindungen', en: 'the connections' },
  zeitstrahl: { de: 'der Zeitstrahl', en: 'the timeline' }
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

/**
 * Der Entwurf, auf die festgehaltenen Bausteine eingedampft.
 *
 * `null`, wenn nichts festgehalten ist — dann soll das Modell gar nichts vom
 * Bisherigen sehen. Die leeren Listen sind kein Verlust: `umgebung` laesst
 * weg, was leer ist.
 */
export function nurFestgehaltenes(
  entwurf: Entwurf | null,
  // Lose getippt wie das Feld in `Frage`: die Liste kommt ueber die Bruecke
  // und ist dort nur noch eine Liste von Zeichenketten.
  festgehalten: readonly string[] = []
): Entwurf | null {
  if (!entwurf || festgehalten.length === 0) return null;
  const behalten = (baustein: Baustein) => festgehalten.includes(baustein);
  return {
    ...entwurf,
    welt: behalten('aufhaenger') ? entwurf.welt : '',
    aufhaenger: behalten('aufhaenger')
      ? entwurf.aufhaenger
      : { ausloeser: '', betroffene: '', komplikation: '', frist: '' },
    fraktionen: behalten('fraktionen') ? entwurf.fraktionen : [],
    figuren: behalten('figuren') ? entwurf.figuren : [],
    orte: behalten('orte') ? entwurf.orte : [],
    verbindungen: behalten('verbindungen') ? entwurf.verbindungen : [],
    zeitstrahl: behalten('zeitstrahl') ? entwurf.zeitstrahl : []
  };
}

/** Wonach genau gefragt wird. */
export interface Frage {
  readonly aufgabe: KiAufgabe;
  readonly vorgaben: Vorgaben;
  readonly entwurf: Entwurf | null;
  /** Nur bei 'verbindung': die beiden Namen, um die es geht. */
  readonly namen?: readonly [string, string];
  /**
   * Nur bei 'entwurf': welche Bausteine stehen bleiben.
   *
   * Sie gehen als „das steht fest" mit, damit das Modell darum herumbaut,
   * statt sie zu ersetzen. Sonst waeren die Schloesser beim grossen Knopf
   * wirkungslos — und das faellt erst auf, wenn der gute Aufhaenger weg ist.
   */
  readonly festgehalten?: readonly string[];
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
  },
  entwurf: {
    de: 'Entwirf das Gerüst einer Geschichte — alles auf einmal und aufeinander bezogen.',
    en: 'Sketch the scaffold of a story — all of it at once, and all of a piece.'
  }
};

/** Die Anfrage an das Modell. */
export function anweisung(frage: Frage, sprache: Sprache): string {
  const de = sprache !== 'en';
  const teile: string[] = [EINLEITUNG[frage.aufgabe][de ? 'de' : 'en']];

  teile.push('', ...vorgabezeilen(frage.vorgaben, sprache));

  // Noch einmal direkt an den Vorgaben, nicht nur in der Systemanweisung:
  // ein Modell, das ein paar hundert Zeilen Umgebung bekommt, haelt sich
  // sonst an das Vertraute und nicht an die zwei Woerter, auf die es ankommt.
  if (frage.vorgaben.region.trim() || frage.vorgaben.thema.trim() || frage.vorgaben.tonfall.trim()) {
    teile.push(
      de
        ? 'Diese Angaben sind bindend. Alles, was du lieferst, spielt in dieser Welt.'
        : 'These settings are binding. Everything you deliver plays in that world.'
    );
  }

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

  /*
   * Was das Modell vom bisherigen Entwurf zu sehen bekommt.
   *
   * Bei einem einzelnen Baustein: alles. Ein Vorschlag, der nicht in die
   * begonnene Welt passt, ist nutzlos — dafuer steht der Entwurf da.
   *
   * Beim ganzen Entwurf dagegen NUR, was festgehalten ist. Wer von Piraten
   * auf Cyberpunk umstellt und dann „Alles von der KI" drueckt, will einen
   * neuen Anfang; bekam aber den alten Entwurf als „Das steht schon" vorn in
   * die Anfrage gelegt und darauf prompt weiter Piraten. Die Schloesser
   * bleiben davon unberuehrt: was festgehalten ist, sieht das Modell weiter
   * und baut darum herum.
   */
  const umriss =
    frage.aufgabe === 'entwurf' ? nurFestgehaltenes(frage.entwurf, frage.festgehalten) : frage.entwurf;
  const bekannt = umgebung(umriss, sprache);
  if (bekannt.length > 0) {
    teile.push('', de ? 'Das steht schon:' : 'What is already there:', ...bekannt);
  }

  if (frage.aufgabe === 'entwurf') {
    const menge = MENGEN[frage.vorgaben.umfang];
    teile.push(
      '',
      de ? 'Liefere genau:' : 'Deliver exactly:',
      de
        ? `- ${menge.fraktionen} Fraktionen, deren Ziele einander im Weg stehen`
        : `- ${menge.fraktionen} factions whose goals get in each other\u2019s way`,
      de ? `- ${menge.figuren} Figuren` : `- ${menge.figuren} characters`,
      de ? `- ${menge.orte} Orte` : `- ${menge.orte} places`,
      de
        ? `- ${Math.max(1, menge.figuren - 1)} Verbindungen, so dass jede Figur an mindestens einer haengt`
        : `- ${Math.max(1, menge.figuren - 1)} connections, so every character hangs on at least one`,
      de ? `- ${menge.schritte} Schritte im Zeitstrahl` : `- ${menge.schritte} steps on the timeline`,
      '',
      de
        ? 'Alles gehört zusammen: die Fraktionen zum Aufhänger, die Figuren zu den Fraktionen, die Orte zu beidem.'
        : 'It all belongs together: factions to the hook, characters to the factions, places to both.'
    );

    // Was festgehalten ist, bleibt stehen. Das Modell soll darum herumbauen,
    // statt es zu ersetzen — sonst waeren die Schloesser hier wirkungslos.
    const behalten = frage.festgehalten ?? [];
    if (behalten.length > 0 && frage.entwurf) {
      teile.push(
        '',
        de ? 'Das steht fest und darf nicht ersetzt werden:' : 'This is fixed and must not be replaced:',
        ...behalten.map((baustein) =>
          de ? `- ${BAUSTEIN_TEXT[baustein]?.de ?? baustein}` : `- ${BAUSTEIN_TEXT[baustein]?.en ?? baustein}`
        ),
        de
          ? 'Lass diese Schlüssel weg oder wiederhole sie unverändert.'
          : 'Leave those keys out, or repeat them unchanged.'
      );
    }
  }

  if (frage.aufgabe === 'zeitstrahl' || frage.aufgabe === 'entwurf') {
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
      : frage.aufgabe === 'entwurf'
        ? '{"welt": "…", "aufhaenger": {…}, "fraktionen": [{…}], "figuren": [{…}], "orte": [{…}], "verbindungen": [{…}], "zeitstrahl": ["…"]}'
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
/**
 * Ein ganzer Entwurf, wie ihn das Modell geschickt hat — roh und geprueft.
 *
 * Roh, weil noch nichts ergaenzt ist: was fehlt, fuellt `baueEntwurf` aus den
 * Tabellen nach. Geprueft, weil hier alles wegfaellt, was nicht ins Muster
 * passt — ein einzelnes unvollstaendiges Stueck darf nicht die ganze Antwort
 * kosten, und eine Verbindung auf Figur 9 von 5 darf nicht ins Geflecht.
 */
export interface RohEntwurf {
  /** Ein bis zwei Saetze zur Welt. Leer, wenn das Modell keine geliefert hat. */
  readonly welt: string;
  readonly aufhaenger: Record<string, string> | null;
  readonly fraktionen: readonly Record<string, string>[];
  readonly figuren: readonly Record<string, string>[];
  readonly orte: readonly Record<string, string>[];
  readonly verbindungen: readonly {
    a: number;
    b: number;
    muster: string;
    hin: string;
    zurueck: string;
  }[];
  readonly zeitstrahl: readonly string[];
}

function liste(wert: unknown): readonly unknown[] {
  return Array.isArray(wert) ? wert : [];
}

/** Ein Stueck mit allen Pflichtfeldern, oder nichts. */
function stueck(roh: unknown, felder: readonly string[]): Record<string, string> | null {
  if (typeof roh !== 'object' || roh === null) return null;
  const quelle = roh as Record<string, unknown>;
  const ergebnis: Record<string, string> = {};
  for (const feld of felder) {
    const wert = sauber(quelle[feld]);
    if (!wert && feld !== 'frist') return null;
    ergebnis[feld] = wert;
  }
  return ergebnis;
}

/**
 * Die Gesamtantwort auswerten.
 *
 * Grosszuegig im Kleinen, streng im Ganzen: einzelne Stuecke, die nicht
 * vollstaendig sind, fallen weg; kommt gar nichts Brauchbares an, gilt die
 * Antwort als misslungen. Ein Entwurf, bei dem sich nichts geaendert hat,
 * saehe sonst aus wie ein Knopf, der nicht reagiert.
 */
export function uebernehmbarerEntwurf(gelesen: unknown, anzahlFiguren = 0): RohEntwurf | null {
  if (typeof gelesen !== 'object' || gelesen === null) return null;
  const roh = gelesen as Record<string, unknown>;

  const figuren = liste(roh.figuren)
    .map((eintrag) => stueck(eintrag, FELDER.figur))
    .filter((eintrag): eintrag is Record<string, string> => eintrag !== null);

  // Wie viele Figuren es am Ende gibt, entscheidet, welche Verbindungen
  // gelten duerfen: die des Modells, oder die der festgehaltenen Liste.
  const grenze = Math.max(figuren.length, anzahlFiguren);

  const verbindungen = liste(roh.verbindungen)
    .map((eintrag) => {
      const teil = stueck(eintrag, FELDER.verbindung);
      if (!teil || typeof eintrag !== 'object' || eintrag === null) return null;
      const quelle = eintrag as Record<string, unknown>;
      const a = Number(quelle.a);
      const b = Number(quelle.b);
      // Eine Verbindung auf eine Figur, die es nicht gibt, oder auf sich
      // selbst: weg damit. Im Bild waere das eine Linie ins Nichts.
      if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
      if (a < 0 || b < 0 || a >= grenze || b >= grenze || a === b) return null;
      return { a, b, muster: teil.muster, hin: teil.hin, zurueck: teil.zurueck };
    })
    .filter((eintrag): eintrag is RohEntwurf['verbindungen'][number] => eintrag !== null);

  const ergebnis: RohEntwurf = {
    welt: sauber(roh.welt),
    aufhaenger: stueck(roh.aufhaenger, FELDER.aufhaenger),
    fraktionen: liste(roh.fraktionen)
      .map((eintrag) => stueck(eintrag, FELDER.fraktion))
      .filter((eintrag): eintrag is Record<string, string> => eintrag !== null),
    figuren,
    orte: liste(roh.orte)
      .map((eintrag) => stueck(eintrag, FELDER.ort))
      .filter((eintrag): eintrag is Record<string, string> => eintrag !== null),
    verbindungen,
    zeitstrahl: liste(roh.zeitstrahl)
      .map(sauber)
      .filter((satz) => satz.length > 0)
  };

  const leer =
    !ergebnis.welt &&
    !ergebnis.aufhaenger &&
    ergebnis.fraktionen.length === 0 &&
    ergebnis.figuren.length === 0 &&
    ergebnis.orte.length === 0 &&
    ergebnis.zeitstrahl.length === 0;
  return leer ? null : ergebnis;
}

export function uebernehmbar(
  aufgabe: KiAufgabe,
  gelesen: unknown
): Record<string, string> | readonly string[] | RohEntwurf | null {
  if (typeof gelesen !== 'object' || gelesen === null) return null;
  const roh = gelesen as Record<string, unknown>;

  if (aufgabe === 'entwurf') return uebernehmbarerEntwurf(gelesen);

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
