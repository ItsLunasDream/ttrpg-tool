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

import { darfAufStufe, gesamtgewicht, pruefe, type Befund, type Stufe } from './gewicht';
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
  wirkung,
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
  /*
   * Mehrere Zuege, der erste, der die eigene Pruefung besteht, gewinnt.
   *
   * Ein einzelner Zug landete zu oft daneben: „toedlich" mit zwei Stufen
   * wog 39 bei erwarteten 60 bis 180, „ernst, gemischt" hatte flache
   * Stufen (Testbericht). Besteht keiner, bleibt der mit dem kleinsten
   * Abstand zur Spanne — ehrlich angezeigt von der Waage.
   */
  let bester: { stufen: Stufe[]; abstand: number } | null = null;
  for (let versuch = 0; versuch < 24; versuch += 1) {
    const stufen = zieheStufen(anzahl, haerte, wirkrichtung, thema, rng);
    const befund = pruefe(stufen, haerte.id);
    if (befund.urteil === 'passt') return stufen;
    const abstand =
      (befund.urteil === 'kaputt' ? 1000 : 0) +
      Math.max(0, befund.haerteVon - befund.gewicht, befund.gewicht - befund.haerteBis);
    if (!bester || abstand < bester.abstand) bester = { stufen, abstand };
  }
  return bester!.stufen;
}

function zieheStufen(
  anzahl: number,
  haerte: Haerte,
  wirkrichtung: Wirkrichtung,
  thema: Thema,
  rng: () => number
): Stufe[] {
  const richtungen = richtungenFuer(wirkrichtung);
  const vergeben = new Set<string>();
  const bisher: Wirkung[] = [];
  const gezogen: Wirkung[] = [];

  for (let nummer = 1; nummer <= anzahl; nummer += 1) {
    const gewuenscht = schwereFuerStufe(nummer, anzahl, haerte);
    const gewaehlt = waehleWirkung(gewuenscht, richtungen, thema, vergeben, bisher, rng, haerte);
    if (!gewaehlt) continue;
    vergeben.add(gewaehlt.id);
    bisher.push(gewaehlt);
    gezogen.push(gewaehlt);
  }

  /*
   * ERST ZIEHEN, DANN SORTIEREN.
   *
   * Der erste Anlauf hat beim Ziehen gefiltert: eine Wirkung durfte nur auf
   * eine Stufe, wenn sie nicht leichter war als die davor. Das ist gierig
   * und geht schief, sobald der Vorrat einer Schwere knapp wird. Ein
   * Zustand auf „laestig" mit fuenf Stufen zog auf Stufe 3 die schwerste
   * leichte Wirkung — danach gab es keine schwerere leichte mehr, und der
   * Verlauf fiel zurueck: 3 → 4 → 5 → 4 → 3.
   *
   * Sortieren loest das vollstaendig, und ohne etwas zu verlieren: gezogen
   * wird frei, die Reihenfolge entsteht danach. Sortiert wird nach Schwere
   * und, innerhalb davon, nach Betrag — erst die feinere Punktskala macht
   * den zweiten Schluessel ueberhaupt aussagekraeftig.
   */
  gezogen.sort(
    (a, b) =>
      schwereWert(a.schwere) - schwereWert(b.schwere) ||
      Math.abs(a.punkte) - Math.abs(b.punkte)
  );

  const stufen: Stufe[] = gezogen.map((w, i) => ({ nummer: i + 1, wirkungen: [w.id] }));

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
      rng,
      haerte
    );
    /*
     * Der Gegenpol ist freiwillig — der Deckel der Haerte ist es nicht.
     *
     * `waehleWirkung` hebt den Deckel im Notfall, damit keine Stufe
     * ausfaellt. Fuer den Gegenpol gilt das nicht: er ist eine Zugabe, und
     * eine Zugabe darf den Regler nicht sprengen. Auf „laestig" gibt es nur
     * drei leichte Buffs; waren die vergeben, landete prompt „+1 auf
     * Angriffswuerfe" aus „mittel" in einem laestigen Zustand.
     */
    if (gegenpol && schwereWert(gegenpol.schwere) <= schwereWert(haerte.bis as Schwere)) {
      vergeben.add(gegenpol.id);
      stufen[stufen.length - 1] = {
        nummer: letzte.nummer,
        wirkungen: [...letzte.wirkungen, gegenpol.id]
      };
    }
  }

  /*
   * Auffuellen, wenn wenige Stufen die Haerte nicht tragen.
   *
   * Die Spannen der Haerten sind auf drei bis fuenf Stufen gebaut. „Toedlich"
   * mit zwei Stufen blieb mit einer Wirkung je Stufe weit darunter
   * (Testbericht: 39 statt 60 bis 180). Dann bekommen die Stufen von hinten
   * her eine zweite und dritte Wirkung — hinten, weil die spaeten Stufen
   * ohnehin die schweren sind und der Verlauf so steigend bleibt.
   */
  const richtungenAuffuellen = wirkrichtung === 'gemischt' ? richtungenFuer('debuff') : richtungen;
  for (let runde = 0; runde < 2; runde += 1) {
    for (let i = stufen.length - 1; i >= 0; i -= 1) {
      if (Math.abs(gesamtgewicht(stufen)) >= haerte.gewichtVon) return stufen;
      if (stufen[i].wirkungen.length >= 3) continue;
      const dazu = waehleWirkung(
        schwereFuerStufe(stufen[i].nummer, stufen.length, haerte),
        richtungenAuffuellen,
        thema,
        vergeben,
        [],
        rng,
        haerte
      );
      if (!dazu || schwereWert(dazu.schwere) > schwereWert(haerte.bis as Schwere)) continue;
      vergeben.add(dazu.id);
      stufen[i] = { nummer: stufen[i].nummer, wirkungen: [...stufen[i].wirkungen, dazu.id] };
    }
  }

  return stufen;
}

/**
 * Eine Wirkung zur gewuenschten Schwere.
 *
 * Drei Anlaeufe je Schwere, in dieser Reihenfolge:
 *
 *   1. die Wirkungen, die dem Thema SELBST gehoeren — „du brennst weiter,
 *      bis du die Flammen loeschst". Die sind der Grund, warum sich zwei
 *      Zustaende aus verschiedenen Themen ueberhaupt unterscheiden.
 *   2. die allgemeinen Wirkungen auf den Spuren des Themas: Kaelte greift
 *      eher Bewegung und Koerper an, Wahnsinn eher den Geist.
 *   3. die allgemeinen Wirkungen ueberhaupt.
 *
 * Erst wenn alle drei leer sind, wird die Schwere erhoeht. Die Reihenfolge
 * ist Absicht — lieber eine unthematische Wirkung als eine, die den Verlauf
 * kaputt macht.
 */
function waehleWirkung(
  schwere: Schwere,
  richtungen: readonly Richtung[],
  thema: Thema,
  vergeben: ReadonlySet<string>,
  bisher: readonly Wirkung[],
  rng: () => number,
  haerte?: Haerte
): Wirkung | null {
  /*
   * Zwei Durchgaenge: erst mit der strengen Regel, dann ohne.
   *
   * Streng heisst, dass die Punkte nicht sinken duerfen (siehe
   * `darfAufStufe`). Das kann den Vorrat leerraeumen — wer auf Stufe 3 eine
   * 15 gezogen hat, findet auf Stufe 4 vielleicht nichts Schwereres mehr.
   * Frueher fiel die Stufe dann stillschweigend aus: `baueStufen`
   * uebersprang sie, und man bekam einen Zustand mit vier Stufen, obwohl
   * fuenf eingestellt waren, ohne Hinweis.
   *
   * Der zweite Durchgang laesst gleich schwere Wirkungen wieder zu. Eine
   * Stufe, die nicht schlimmer wird, faellt in `pruefe()` als „flach" auf
   * und ist damit sichtbar — anders als eine Stufe, die gar nicht da ist.
   */
  /*
   * Gezogen wird OHNE die Punktschranke — die Reihenfolge stellt
   * `baueStufen` hinterher durch Sortieren her. Hier greift nur die
   * Schwere, damit eine Stufe nicht unter die Stufe davor faellt, bevor
   * ueberhaupt sortiert wird.
   */
  const frei = (liste: readonly Wirkung[]) =>
    liste.filter((w) => !vergeben.has(w.id) && darfAufStufe(w, bisher, false));

  const versuche = (bis: number): Wirkung | null => {
    for (let stufe = schwereWert(schwere); stufe <= bis; stufe += 1) {
      const hier = SCHWEREN[stufe];

      const eigene = frei(
        wirkungenFuer(hier, richtungen, undefined, thema.id).filter((w) => w.themen !== undefined)
      );
      if (eigene.length > 0) return zieh(eigene, rng);

      const aufSpur = frei(wirkungenFuer(hier, richtungen, thema.spuren));
      if (aufSpur.length > 0) return zieh(aufSpur, rng);

      const allgemein = frei(wirkungenFuer(hier, richtungen));
      if (allgemein.length > 0) return zieh(allgemein, rng);
    }
    return null;
  };

  /*
   * Der Deckel der Haerte kommt zuerst.
   *
   * Ohne ihn stieg der Erzeuger, wenn eine Schwere leer war, einfach eine
   * hoeher — und ein Zustand auf „laestig" trug am Ende „+1 auf
   * Angriffswuerfe" aus der Stufe „mittel". Damit war der Regler
   * ausgehebelt, den der Mensch gestellt hat, und zwar unsichtbar.
   *
   * Erst wenn unter dem Deckel wirklich nichts mehr frei ist, wird er
   * gehoben. Eine Stufe zu verlieren waere schlimmer als eine Wirkung, die
   * eine Schwere zu hoch liegt — die faellt wenigstens in der Waage auf.
   */
  const deckel = haerte ? schwereWert(haerte.bis as Schwere) : SCHWEREN.length - 1;
  return versuche(Math.min(deckel, SCHWEREN.length - 1)) ?? versuche(SCHWEREN.length - 1);
}

/** Der Name: zusammengesetzt oder einzeln, wie im Monster Creator. */
export function baueNamen(thema: Thema, sprache: Sprache, rng: () => number): string {
  if (thema.einzeln.length > 0 && rng() < 0.4) return text(zieh(thema.einzeln, rng), sprache);

  const erstes = text(zieh(thema.erstes, rng), sprache);

  /*
   * Der zweite Teil darf nicht derselbe sein wie der erste.
   *
   * Sonst kommt „Lochloch" heraus — beide Listen enthalten „Loch", und im
   * Deutschen wird zusammengeschrieben. Ein paar Versuche reichen; danach
   * bleibt es, wie es ist, statt in einer Schleife zu haengen.
   */
  const doppelt = (a: string, b: string) => {
    const x = a.toLowerCase();
    const y = b.toLowerCase();
    // Nicht nur wortgleich: „Fern" und „ferne" ergeben „Fernferne".
    return x.startsWith(y) || y.startsWith(x);
  };

  let zweites = text(zieh(thema.zweites, rng), sprache);
  for (let versuch = 0; versuch < 8 && doppelt(erstes, zweites); versuch += 1) {
    zweites = text(zieh(thema.zweites, rng), sprache);
  }

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
  { de: 'drängt sich', en: 'presses' },
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

/**
 * Was „Frist" bei diesem Zustand heisst.
 *
 * Die Wirkungen sagen „1W4 Schaden je Frist", damit dieselbe Zeile im Kampf
 * und ueber Tage passt. Festgelegt war die Frist aber nirgends (Testbericht),
 * und am Tisch fragte man nach. Sie folgt der Dauer: im Kampf eine Runde,
 * sonst eine Stunde oder ein Tag. `null`, wenn keine Stufe sie braucht.
 */
export function fristText(zustand: Zustand, sprache: Sprache): string | null {
  const braucht = zustand.stufen.some((stufe) =>
    stufe.wirkungen.some((id) => {
      const w = wirkung(id);
      return w !== undefined && /Frist|interval/.test(`${w.text.de} ${w.text.en}`);
    })
  );
  if (!braucht) return null;
  const skala = dauerMit(zustand.dauerId)?.zeitskala ?? 'lang';
  const de = sprache !== 'en';
  if (skala === 'kampf') return de ? 'eine Runde, jeweils zu Beginn deines Zuges' : 'one round, at the start of each of your turns';
  if (skala === 'kurz') return de ? 'eine Stunde' : 'one hour';
  return de ? 'ein Tag' : 'one day';
}

/**
 * Ob „Schlimmer" und „Besser" zu diesem Zustand gehoeren.
 *
 * Bei einem Segen ohne Stufen ergab „Schlimmer: jedes gebrochene
 * Versprechen" keinen Sinn (Testbericht). Mit Stufen waechst ein Segen,
 * dann heissen die Zeilen „Staerker" und „Schwaecher".
 */
export function verlaufsZeilen(zustand: Zustand): 'keine' | 'schaden' | 'segen' {
  if (zustand.wirkrichtung !== 'buff') return 'schaden';
  return zustand.stufen.length > 1 ? 'segen' : 'keine';
}

/** Der Befund zu einem Zustand. Bequemlichkeit fuer Oberflaeche und Tests. */
export function pruefeZustand(zustand: Zustand): Befund {
  return pruefe(zustand.stufen, zustand.haerteId);
}
