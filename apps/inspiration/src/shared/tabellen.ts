/**
 * Die Grundbegriffe der Inspirationshilfe: Zuschnitt, Zweisprachigkeit,
 * Auswahl nach Merkmalen.
 *
 * Alles zweisprachig und als reine Daten, aus demselben Grund wie im NPC
 * Creator: ein gewuerfelter Entwurf soll beim Sprachwechsel nicht zur Haelfte
 * deutsch bleiben, und eine Tabelle laesst sich pruefen — auf Luecken, auf
 * Doppelungen, auf fehlende Uebersetzungen.
 *
 * Die eigentlichen Tabellen stehen nicht hier, sondern je Baustein in einer
 * eigenen Datei (haken.ts, orte.ts, fraktionen.ts, figuren.ts,
 * verbindungen.ts, zeitstrahl.ts). Eine Datei mit allem waere zwar bequem zu
 * finden, aber nicht mehr zu lesen.
 */

/** Ein Eintrag in beiden Sprachen. */
export interface Paar {
  readonly de: string;
  readonly en: string;
}

export type Sprache = 'de' | 'en';

/** Den Text eines Paares in der gewuenschten Sprache. */
export function text(paar: Paar, sprache: Sprache): string {
  return sprache === 'de' ? paar.de : paar.en;
}

/**
 * Die Regionen.
 *
 * Sie sind Marken an den Tabelleneintraegen, kein Filter mit harter Kante:
 * ein Eintrag ohne Marke passt ueberall. Ohne diese Regel waere jede Region
 * eine eigene, viel kleinere Tabelle — und genau dann kaeme wieder fuenfmal
 * dasselbe.
 */
export const REGIONEN = [
  'stadt',
  'hafen',
  'wald',
  'berge',
  'wueste',
  'sumpf',
  'unterreich',
  'see',
  'steppe',
  'eis',
  'vulkan',
  'oedland'
] as const;
export type RegionId = (typeof REGIONEN)[number];

/** Die Themen. Gleiche Regel wie bei den Regionen. */
export const THEMEN = [
  'schuld',
  'aufstieg',
  'verrat',
  'seuche',
  'glaube',
  'gier',
  'rache',
  'erbe',
  'krieg',
  'wissen',
  'wildnis',
  'erloesung'
] as const;
export type ThemaId = (typeof THEMEN)[number];

/** Der Tonfall. Er faerbt die Auswahl, er schliesst nichts aus. */
export const TONFALL = [
  'heiter',
  'duester',
  'gefaehrlich',
  'politisch',
  'geheimnisvoll',
  'episch',
  'bodenstaendig'
] as const;
export type TonfallId = (typeof TONFALL)[number];

/** Der Umfang. Er entscheidet, wie viel von allem erzeugt wird. */
export const UMFAENGE = ['abend', 'bogen', 'kampagne'] as const;
export type UmfangId = (typeof UMFAENGE)[number];

/**
 * Wie viel ein Umfang mitbringt.
 *
 * Ein Abend braucht zwei Fraktionen und drei Figuren, sonst kennt am Tisch
 * niemand die Namen. Eine Kampagne darf unuebersichtlich anfangen.
 */
export interface Menge {
  readonly fraktionen: number;
  readonly figuren: number;
  readonly orte: number;
  readonly schritte: number;
}

export const MENGEN: Record<UmfangId, Menge> = {
  abend: { fraktionen: 2, figuren: 3, orte: 2, schritte: 3 },
  bogen: { fraktionen: 3, figuren: 5, orte: 3, schritte: 4 },
  kampagne: { fraktionen: 4, figuren: 7, orte: 5, schritte: 6 }
};

/**
 * Ein Tabelleneintrag mit Marken.
 *
 * Alle drei Markenlisten sind freiwillig. Fehlt eine, gilt der Eintrag fuer
 * jede Auspraegung — „ein Kind ist verschwunden" passt in jede Region.
 */
export interface Eintrag extends Paar {
  readonly regionen?: readonly RegionId[];
  readonly themen?: readonly ThemaId[];
  readonly tonfall?: readonly TonfallId[];
}

/** Was eingestellt ist. Leerer Text heisst „beliebig". */
export interface Zuschnitt {
  readonly umfang: UmfangId;
  /** Eine RegionId, oder freier Text, oder leer. */
  readonly region: string;
  /** Eine ThemaId, oder freier Text, oder leer. */
  readonly thema: string;
  /** Eine TonfallId, oder freier Text, oder leer. */
  readonly tonfall: string;
}

export const STANDARD_ZUSCHNITT: Zuschnitt = {
  umfang: 'bogen',
  region: '',
  thema: '',
  tonfall: ''
};

/**
 * Wie viele Eintraege noch zur Auswahl stehen muessen, damit gefiltert wird.
 *
 * Darunter wird die Filterung gelockert. Der Grund ist der Zweck des ganzen
 * Werkzeugs: bleiben nach dem Filtern vier Eintraege uebrig, sieht man beim
 * dritten Wurf denselben wieder, und das Werkzeug wirkt duenn — obwohl die
 * Tabelle voll ist.
 */
export const MINDESTAUSWAHL = 10;

function marke<T extends string>(marken: readonly T[] | undefined, gewaehlt: string): boolean {
  // Kein Eintrag mit Marken heisst: passt ueberall. Nichts gewaehlt heisst:
  // alles passt.
  if (!marken || marken.length === 0) return true;
  if (!gewaehlt) return true;
  return (marken as readonly string[]).includes(gewaehlt);
}

/**
 * Die Eintraege, die zum Zuschnitt passen — in drei Stufen.
 *
 * 1. Region UND Thema UND Tonfall treffen zu.
 * 2. Reicht das nicht fuer MINDESTAUSWAHL, zaehlt nur noch Region und Thema.
 * 3. Reicht auch das nicht, zaehlt nur die Region.
 * 4. Sonst die ganze Tabelle.
 *
 * Gelockert wird in dieser Reihenfolge, weil der Ort am staerksten auffaellt:
 * eine Hafenszene im Unterreich merkt jeder, ein etwas zu heiterer Satz in
 * einer duesteren Runde nicht.
 */
export function passend<T extends Eintrag>(liste: readonly T[], zuschnitt: Zuschnitt): readonly T[] {
  const stufen: Array<(eintrag: T) => boolean> = [
    (e) =>
      marke(e.regionen, zuschnitt.region) &&
      marke(e.themen, zuschnitt.thema) &&
      marke(e.tonfall, zuschnitt.tonfall),
    (e) => marke(e.regionen, zuschnitt.region) && marke(e.themen, zuschnitt.thema),
    (e) => marke(e.regionen, zuschnitt.region)
  ];

  for (const stufe of stufen) {
    const gefiltert = liste.filter(stufe);
    if (gefiltert.length >= MINDESTAUSWAHL) return gefiltert;
  }
  return liste;
}

/**
 * Die Beschriftungen der Regler.
 *
 * Sie stehen hier und nicht im Woerterbuch der Oberflaeche, weil sie zwei
 * Aufgaben haben: sie erscheinen in der Vorschlagsliste, und sie sind der
 * Weg zurueck. Wer „Hafen" tippt, meint die Marke `hafen` — und wer
 * „Schwebende Inseln" tippt, meint gar keine und soll trotzdem etwas
 * bekommen.
 */
export const REGION_TEXTE: Record<RegionId, Paar> = {
  stadt: { de: 'Stadt', en: 'City' },
  hafen: { de: 'Hafen', en: 'Harbour' },
  wald: { de: 'Wald', en: 'Forest' },
  berge: { de: 'Berge', en: 'Mountains' },
  wueste: { de: 'Wüste', en: 'Desert' },
  sumpf: { de: 'Sumpf', en: 'Marsh' },
  unterreich: { de: 'Unterreich', en: 'Underdark' },
  see: { de: 'See und Küste', en: 'Sea and coast' },
  steppe: { de: 'Steppe und Land', en: 'Steppe and farmland' },
  eis: { de: 'Eis', en: 'Ice' },
  vulkan: { de: 'Vulkan', en: 'Volcano' },
  oedland: { de: 'Ödland', en: 'Wasteland' }
};

export const THEMA_TEXTE: Record<ThemaId, Paar> = {
  schuld: { de: 'Schuld', en: 'Guilt' },
  aufstieg: { de: 'Aufstieg', en: 'Ambition' },
  verrat: { de: 'Verrat', en: 'Betrayal' },
  seuche: { de: 'Seuche', en: 'Plague' },
  glaube: { de: 'Glaube', en: 'Faith' },
  gier: { de: 'Gier', en: 'Greed' },
  rache: { de: 'Rache', en: 'Revenge' },
  erbe: { de: 'Erbe', en: 'Inheritance' },
  krieg: { de: 'Krieg', en: 'War' },
  wissen: { de: 'Wissen', en: 'Knowledge' },
  wildnis: { de: 'Wildnis', en: 'The wild' },
  erloesung: { de: 'Erlösung', en: 'Redemption' }
};

export const TONFALL_TEXTE: Record<TonfallId, Paar> = {
  heiter: { de: 'heiter', en: 'light' },
  duester: { de: 'düster', en: 'dark' },
  gefaehrlich: { de: 'gefährlich', en: 'dangerous' },
  politisch: { de: 'politisch', en: 'political' },
  geheimnisvoll: { de: 'geheimnisvoll', en: 'mysterious' },
  episch: { de: 'episch', en: 'epic' },
  bodenstaendig: { de: 'bodenständig', en: 'down to earth' }
};

export const UMFANG_TEXTE: Record<UmfangId, Paar> = {
  abend: { de: 'ein Abend', en: 'one evening' },
  bogen: { de: 'ein Bogen', en: 'one arc' },
  kampagne: { de: 'eine Kampagne', en: 'a campaign' }
};

function ausTexten<T extends string>(texte: Record<T, Paar>, eingabe: string): T | '' {
  const gesucht = eingabe.trim().toLowerCase();
  if (!gesucht) return '';
  for (const id of Object.keys(texte) as T[]) {
    const paar = texte[id];
    if (id.toLowerCase() === gesucht) return id;
    if (paar.de.toLowerCase() === gesucht || paar.en.toLowerCase() === gesucht) return id;
  }
  return '';
}

/**
 * Aus dem, was jemand getippt hat, eine Marke machen — oder keine.
 *
 * Beide Sprachen zaehlen, unabhaengig davon, welche gerade eingestellt ist:
 * wer auf Englisch arbeitet und „Hafen" tippt, hat sich nicht vertan.
 */
export function alsRegionId(eingabe: string): RegionId | '' {
  return ausTexten(REGION_TEXTE, eingabe);
}

export function alsThemaId(eingabe: string): ThemaId | '' {
  return ausTexten(THEMA_TEXTE, eingabe);
}

export function alsTonfallId(eingabe: string): TonfallId | '' {
  return ausTexten(TONFALL_TEXTE, eingabe);
}
