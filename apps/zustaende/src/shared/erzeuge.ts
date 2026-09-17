/**
 * Der Erzeuger: ein vollstaendiger Zustand aus den Tabellen.
 *
 * Ohne KI, wie in der Inspirationshilfe und im NPC Creator. Eine reine
 * Funktion mit uebergebenem Zufallsgeber — dieselbe Saat gibt denselben
 * Zustand, und Tests koennen wuerfeln, ohne zu raten.
 *
 * Die Stufen sind der Kern, und sie folgen einer Regel: jede Stufe ist
 * mindestens so schwer wie die davor. Sonst ist ein Zustand auf Stufe 4
 * harmloser als auf Stufe 2, und das merkt am Tisch jeder sofort.
 */

import { darfAufStufe, pruefe, type Befund, type Stufe } from './gewicht';
import { pruefeStimmigkeit, skalenFuerStufen, type Stimmigkeitsbefund } from './stimmigkeit';
import {
  ARTEN,
  DAUERN,
  HAERTEN,
  SINNBILDER,
  THEMEN,
  dauer as dauerMit,
  skalaWert,
  text,
  type Art,
  type Haerte,
  type Sprache,
  type Thema,
  type Wirkrichtung,
  type Zeitskala
} from './tabellen';
import {
  SCHWEREN,
  schwereWert,
  wirkungenFuer,
  type Richtung,
  type Schwere,
  type Wirkung
} from './wirkungen';

export interface Zustand {
  readonly name: string;
  readonly kurzsatz: string;
  readonly artId: string;
  readonly art: string;
  readonly themaId: string;
  readonly thema: string;
  readonly haerteId: string;
  readonly haerte: string;
  readonly wirkrichtung: Wirkrichtung;
  /** Das Zeichen und die Farbe fuer den Initiative Tracker. */
  readonly zeichen: string;
  readonly farbe: string;
  readonly stufen: readonly Stufe[];
  readonly dauer: string;
  /**
   * Die Kennung der Dauer, nicht nur ihr Text.
   *
   * Daran haengt die Zeitskala, und an der haengt, ob Linderung und
   * Verschlimmerung ueberhaupt Sinn ergeben. Siehe `stimmigkeit.ts`.
   */
  readonly dauerId: string;
  readonly verschlimmerung: string;
  readonly linderung: string;
  /** In welchem Takt die beiden wirken. Fuer die Stimmigkeitspruefung. */
  readonly verschlimmerungSkala: Zeitskala;
  readonly linderungSkala: Zeitskala;
  /** Optional: eine Umgebung, die ihn von selbst gibt. Leer heisst: keine. */
  readonly ausloeser: string;
}

export interface Wuensche {
  readonly artId?: string;
  readonly themaId?: string;
  readonly haerteId?: string;
  readonly wirkrichtung?: Wirkrichtung;
  /** Wie viele Stufen. Eins heisst: ein Zustand ohne Stufen. */
  readonly stufen?: number;
  /** Ob eine Umgebung ihn auslöst. Fehlt es, entscheidet der Wurf. */
  readonly mitAusloeser?: boolean;
}

function zieh<T>(liste: readonly T[], rng: () => number): T {
  return liste[Math.floor(rng() * liste.length)];
}

/** Welche Richtungen zu einer Wirkrichtung gehoeren. */
export function richtungenFuer(wirkrichtung: Wirkrichtung): Richtung[] {
  if (wirkrichtung === 'schaden') return ['schaden', 'debuff'];
  if (wirkrichtung === 'buff') return ['buff'];
  if (wirkrichtung === 'gemischt') return ['buff', 'debuff'];
  return ['debuff'];
}

/**
 * Die Schwere, die eine Stufe haben soll.
 *
 * Verteilt die Spanne von „leicht" bis zur Obergrenze der Haerte gleichmaessig
 * ueber die Stufen. Bei drei Stufen und der Haerte „gefaehrlich" heisst das
 * leicht, mittel, schwer; bei fuenf Stufen wiederholen sich die mittleren.
 *
 * Die erste Stufe bleibt immer leicht: ein Zustand, der auf Stufe 1 schon
 * handlungsunfaehig macht, hat keine Stufen, sondern einen Schalter.
 */
export function schwereFuerStufe(nummer: number, anzahl: number, haerte: Haerte): Schwere {
  const obergrenze = schwereWert(haerte.bis as Schwere);
  if (anzahl <= 1) return haerte.bis as Schwere;
  const anteil = (nummer - 1) / (anzahl - 1);
  return SCHWEREN[Math.min(obergrenze, Math.round(anteil * obergrenze))];
}

/**
 * Die Stufen eines Zustands.
 *
 * Je Stufe eine Wirkung, aufsteigend und ohne Wiederholung. Gibt es zur
 * gewuenschten Schwere nichts Passendes mehr, wird nach oben ausgewichen —
 * lieber eine Stufe zu schwer als eine, die nichts bringt.
 */
export function baueStufen(
  anzahl: number,
  haerte: Haerte,
  wirkrichtung: Wirkrichtung,
  thema: Thema,
  rng: () => number
): Stufe[] {
  const richtungen = richtungenFuer(wirkrichtung);
  const vergeben = new Set<string>();
  const bisher: Wirkung[] = [];
  const stufen: Stufe[] = [];

  for (let nummer = 1; nummer <= anzahl; nummer += 1) {
    const gewuenscht = schwereFuerStufe(nummer, anzahl, haerte);
    const gewaehlt = waehleWirkung(gewuenscht, richtungen, thema, vergeben, bisher, rng);
    if (!gewaehlt) continue;
    vergeben.add(gewaehlt.id);
    bisher.push(gewaehlt);
    stufen.push({ nummer, wirkungen: [gewaehlt.id] });
  }

  /*
   * „Gemischt" bekommt auf der letzten Stufe den Gegenpol dazu.
   *
   * Das ist der Fall, den Tabellen gut koennen und der sich von Hand ungern
   * aufschreibt: zwei Wirkungen, die aufeinander zeigen — Staerke dazu,
   * Selbstbeherrschung weg. Er steht auf der letzten Stufe, weil er dort am
   * meisten auffaellt.
   */
  if (wirkrichtung === 'gemischt' && stufen.length > 0) {
    const letzte = stufen[stufen.length - 1];
    const bisherige = letzte.wirkungen.map((id) => bisher.find((w) => w.id === id)).filter(Boolean) as Wirkung[];
    const gegenrichtung: Richtung = bisherige.some((w) => w.richtung === 'buff') ? 'debuff' : 'buff';
    const gegenpol = waehleWirkung(
      schwereFuerStufe(letzte.nummer, anzahl, haerte),
      [gegenrichtung],
      thema,
      vergeben,
      [],
      rng
    );
    if (gegenpol) {
      vergeben.add(gegenpol.id);
      stufen[stufen.length - 1] = {
        nummer: letzte.nummer,
        wirkungen: [...letzte.wirkungen, gegenpol.id]
      };
    }
  }

  return stufen;
}

/**
 * Eine Wirkung zur gewuenschten Schwere.
 *
 * Zuerst nach Thema: Kaelte greift eher Bewegung und Koerper an, Wahnsinn
 * eher den Geist. Findet sich dort nichts Freies, wird das Thema fallen
 * gelassen, und erst danach die Schwere erhoeht. Die Reihenfolge ist
 * Absicht — lieber eine unthematische Wirkung als eine, die den Verlauf
 * kaputt macht.
 */
function waehleWirkung(
  schwere: Schwere,
  richtungen: readonly Richtung[],
  thema: Thema,
  vergeben: ReadonlySet<string>,
  bisher: readonly Wirkung[],
  rng: () => number
): Wirkung | null {
  for (let stufe = schwereWert(schwere); stufe < SCHWEREN.length; stufe += 1) {
    const hier = SCHWEREN[stufe];
    const mitThema = wirkungenFuer(hier, richtungen, thema.spuren).filter(
      (w) => !vergeben.has(w.id) && darfAufStufe(w, bisher)
    );
    if (mitThema.length > 0) return zieh(mitThema, rng);

    const ohneThema = wirkungenFuer(hier, richtungen).filter(
      (w) => !vergeben.has(w.id) && darfAufStufe(w, bisher)
    );
    if (ohneThema.length > 0) return zieh(ohneThema, rng);
  }
  return null;
}

/** Der Name: zusammengesetzt oder einzeln, wie im Monster Creator. */
export function baueNamen(thema: Thema, sprache: Sprache, rng: () => number): string {
  if (thema.einzeln.length > 0 && rng() < 0.4) return text(zieh(thema.einzeln, rng), sprache);
  const erstes = text(zieh(thema.erstes, rng), sprache);
  const zweites = text(zieh(thema.zweites, rng), sprache);
  return sprache === 'en'
    ? `${erstes} ${zweites.charAt(0).toUpperCase()}${zweites.slice(1)}`
    : `${erstes}${zweites}`;
}

/**
 * Der Kurzsatz aus einer Maske.
 *
 * Eine Maske ist ein Satz mit Luecken, und die Luecken kommen aus denselben
 * Tabellen wie alles andere. Wichtig ist die Anzahl der Varianten je Luecke:
 * bei dreien erkennt man das Muster nach fuenf Zustaenden wieder.
 */
const VERBEN: readonly { de: string; en: string }[] = [
  { de: 'kriecht', en: 'creeps' },
  { de: 'frisst sich', en: 'eats its way' },
  { de: 'legt sich', en: 'settles' },
  { de: 'zieht', en: 'draws' },
  { de: 'sitzt', en: 'sits' },
  { de: 'sinkt', en: 'sinks' }
];

const STELLEN: readonly { de: string; en: string }[] = [
  { de: 'dir in die Knochen', en: 'into your bones' },
  { de: 'über deine Sinne', en: 'over your senses' },
  { de: 'dir auf die Brust', en: 'onto your chest' },
  { de: 'hinter deine Augen', en: 'behind your eyes' },
  { de: 'in deine Hände', en: 'into your hands' },
  { de: 'dir in den Nacken', en: 'into the back of your neck' }
];

export function baueKurzsatz(thema: Thema, sprache: Sprache, rng: () => number): string {
  const bild = text(zieh(thema.bilder, rng), sprache);
  const verb = text(zieh(VERBEN, rng), sprache);
  const stelle = text(zieh(STELLEN, rng), sprache);
  return `${bild} ${verb} ${stelle}.`;
}

/**
 * Wodurch es schlimmer wird — und in welchem Takt.
 *
 * Der Ort kommt NUR bei der Art „Umgebung" dazu. Vorher wurde er immer
 * angehaengt, und dann stand an einem Fluch „jedes Mal, wenn der Name auf
 * dem Gletscher genannt wird". Ein Fluch braucht keinen Gletscher.
 *
 * `hoechstens` deckelt den Takt: laenger als die Dauer darf die
 * Verschlimmerung nicht brauchen, sonst kaeme sie nie zum Zug.
 */
export function baueVerschlimmerung(
  art: Art,
  thema: Thema,
  hoechstens: Zeitskala,
  sprache: Sprache,
  rng: () => number
): { text: string; zeitskala: Zeitskala } {
  const moeglich = art.ausloeser.filter((a) => skalaWert(a.zeitskala) <= skalaWert(hoechstens));
  // Bleibt nichts uebrig, wird der schnellste genommen: er passt immer.
  const gewaehlt =
    moeglich.length > 0
      ? zieh(moeglich, rng)
      : [...art.ausloeser].sort((a, b) => skalaWert(a.zeitskala) - skalaWert(b.zeitskala))[0];

  const wann = text(gewaehlt.text, sprache);
  if (art.id !== 'umgebung') return { text: wann, zeitskala: gewaehlt.zeitskala };

  const wo = text(zieh(thema.orte, rng), sprache);
  return { text: `${wann} ${wo}`, zeitskala: gewaehlt.zeitskala };
}

/**
 * Wodurch es besser wird — im Takt der Dauer.
 *
 * Der Fall, um den es geht: „bis zu deinem naechsten Zug" und „eine Stunde
 * am Feuer senkt ihn um 1" ist ein Widerspruch. Im Kampf hilft keine
 * Stunde, dort hilft eine Rettung; ueber Tage hilft keine Runde.
 */
export function baueLinderung(
  thema: Thema,
  skala: Zeitskala,
  sprache: Sprache,
  rng: () => number
): { text: string; zeitskala: Zeitskala } {
  const de = sprache !== 'en';
  const mittel = text(zieh(thema.gegenmittel, rng), sprache);

  if (skala === 'kampf') {
    return {
      text: de
        ? 'Eine bestandene Konstitutionsrettung am Ende deines Zuges beendet ihn'
        : 'A successful Constitution save at the end of your turn ends it',
      zeitskala: 'kampf'
    };
  }
  if (skala === 'kurz') {
    return {
      text: de ? `Eine Stunde ${mittel} senkt ihn um 1` : `An hour ${mittel} lowers it by 1`,
      zeitskala: 'kurz'
    };
  }
  return {
    text: de ? `Ein Tag ${mittel} senkt ihn um 1` : `A day ${mittel} lowers it by 1`,
    zeitskala: 'lang'
  };
}

export function erzeugeZustand(wunsch: Wuensche, sprache: Sprache, rng: () => number): Zustand {
  const art = ARTEN.find((a) => a.id === wunsch.artId) ?? zieh(ARTEN, rng);
  const thema = THEMEN.find((t) => t.id === wunsch.themaId) ?? zieh(THEMEN, rng);
  const haerte = HAERTEN.find((h) => h.id === wunsch.haerteId) ?? HAERTEN[1];
  const wirkrichtung: Wirkrichtung =
    wunsch.wirkrichtung ?? (art.id === 'segen' ? 'buff' : 'debuff');
  const anzahl = Math.max(1, Math.min(10, wunsch.stufen ?? 3));

  const passende = SINNBILDER.filter((s) => s.themen.includes(thema.id));
  const sinnbild = passende.length > 0 ? zieh(passende, rng) : zieh(SINNBILDER, rng);

  /*
   * Die Dauer kommt VOR der Linderung, und sie richtet sich nach den Stufen.
   *
   * Ein Zustand mit fuenf Stufen, der bis zum naechsten Zug anhaelt, kommt
   * nie ueber Stufe 1 — die vier anderen sind dann Zierrat. Deshalb sind
   * Kampfdauern bei mehreren Stufen gar nicht erst im Topf.
   */
  const erlaubteSkalen = skalenFuerStufen(anzahl);

  /*
   * Und die Dauer muss auch zur ART passen.
   *
   * Eine Umgebung schlaegt fruehestens stuendlich zu — „jede Stunde ohne
   * Schutz". Ein Zustand aus der Umgebung, der bis zum naechsten Zug
   * anhaelt, koennte sich deshalb nie verschlimmern: der schnellste
   * Ausloeser, den es fuer ihn gibt, kommt zu spaet. Ein Gift dagegen wirkt
   * rundenweise und darf kurz sein.
   */
  const schnellsterAusloeser = art.ausloeser.reduce(
    (schnellster, kandidat) =>
      skalaWert(kandidat.zeitskala) < skalaWert(schnellster.zeitskala) ? kandidat : schnellster,
    art.ausloeser[0]
  );

  const moeglicheDauern = DAUERN.filter(
    (d) =>
      erlaubteSkalen.includes(d.zeitskala) &&
      skalaWert(d.zeitskala) >= skalaWert(schnellsterAusloeser.zeitskala)
  );
  const gewaehlteDauer = zieh(
    moeglicheDauern.length > 0
      ? moeglicheDauern
      : // Bleibt nichts uebrig, entscheidet der Ausloeser: lieber die Dauer
        // dehnen als einen Zustand bauen, der sich nie verschlimmert.
        DAUERN.filter((d) => d.zeitskala === schnellsterAusloeser.zeitskala),
    rng
  );

  const linderung = baueLinderung(thema, gewaehlteDauer.zeitskala, sprache, rng);
  const verschlimmerung = baueVerschlimmerung(art, thema, gewaehlteDauer.zeitskala, sprache, rng);

  /*
   * Ein Ausloeser ist die Ausnahme, nicht die Regel.
   *
   * „Marked by the Hunt" kommt von einer Figur, nicht vom Wetter. Nur bei
   * der Art „Umgebung" ist er der Normalfall — dort ist er praktisch die
   * Daseinsberechtigung des Zustands. Bei allen anderen Arten bleibt er
   * leer, sonst stuende ein Ort an einem Fluch.
   */
  const mitAusloeser = art.id === 'umgebung' && (wunsch.mitAusloeser ?? rng() < 0.85);

  return {
    name: baueNamen(thema, sprache, rng),
    kurzsatz: baueKurzsatz(thema, sprache, rng),
    artId: art.id,
    art: text(art.name, sprache),
    themaId: thema.id,
    thema: text(thema.name, sprache),
    haerteId: haerte.id,
    haerte: text(haerte.name, sprache),
    wirkrichtung,
    zeichen: sinnbild.zeichen,
    farbe: sinnbild.farbe,
    stufen: baueStufen(anzahl, haerte, wirkrichtung, thema, rng),
    dauer: text(gewaehlteDauer.name, sprache),
    dauerId: gewaehlteDauer.id,
    verschlimmerung: verschlimmerung.text,
    verschlimmerungSkala: verschlimmerung.zeitskala,
    linderung: linderung.text,
    linderungSkala: linderung.zeitskala,
    ausloeser: mitAusloeser ? text(zieh(thema.orte, rng), sprache) : ''
  };
}

/**
 * Die Stimmigkeit eines fertigen Zustands.
 *
 * Bequemlichkeit fuer Oberflaeche und Tests: sammelt die Angaben zusammen
 * und fragt `stimmigkeit.ts`.
 */
export function pruefeZustandsStimmigkeit(zustand: Zustand): Stimmigkeitsbefund {
  return pruefeStimmigkeit({
    dauerSkala: dauerMit(zustand.dauerId)?.zeitskala ?? 'lang',
    linderungSkala: zustand.linderungSkala,
    verschlimmerungSkala: zustand.verschlimmerungSkala,
    stufen: zustand.stufen.length,
    artId: zustand.artId,
    mitOrt: zustand.ausloeser !== ''
  });
}

/** Ein einzelnes Feld neu wuerfeln, der Rest bleibt stehen. */
export function wuerfleNeu(
  zustand: Zustand,
  feld: 'name' | 'kurzsatz' | 'stufen' | 'verschlimmerung' | 'linderung' | 'zeichen',
  sprache: Sprache,
  rng: () => number
): Zustand {
  const art = ARTEN.find((a) => a.id === zustand.artId) ?? ARTEN[0];
  const thema = THEMEN.find((t) => t.id === zustand.themaId) ?? THEMEN[0];
  const haerte = HAERTEN.find((h) => h.id === zustand.haerteId) ?? HAERTEN[1];

  switch (feld) {
    case 'name':
      return { ...zustand, name: baueNamen(thema, sprache, rng) };
    case 'kurzsatz':
      return { ...zustand, kurzsatz: baueKurzsatz(thema, sprache, rng) };
    case 'stufen':
      return {
        ...zustand,
        stufen: baueStufen(zustand.stufen.length, haerte, zustand.wirkrichtung, thema, rng)
      };
    case 'verschlimmerung': {
      const skala = dauerMit(zustand.dauerId)?.zeitskala ?? 'lang';
      const neu = baueVerschlimmerung(art, thema, skala, sprache, rng);
      return { ...zustand, verschlimmerung: neu.text, verschlimmerungSkala: neu.zeitskala };
    }
    case 'linderung': {
      const skala = dauerMit(zustand.dauerId)?.zeitskala ?? 'lang';
      const neu = baueLinderung(thema, skala, sprache, rng);
      return { ...zustand, linderung: neu.text, linderungSkala: neu.zeitskala };
    }
    case 'zeichen': {
      const sinnbild = zieh(SINNBILDER, rng);
      return { ...zustand, zeichen: sinnbild.zeichen, farbe: sinnbild.farbe };
    }
  }
}

/** Der Befund zu einem Zustand. Bequemlichkeit fuer Oberflaeche und Tests. */
export function pruefeZustand(zustand: Zustand): Befund {
  return pruefe(zustand.stufen, zustand.haerteId);
}
