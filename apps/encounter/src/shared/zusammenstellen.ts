/**
 * Eine Begegnung zu einem Ziel zusammenstellen: „Grad 5, vier Gegner".
 *
 * Die umgekehrte Richtung zum Katalog. Man sagt, wie stark die Begegnung
 * sein soll — als Herausforderungsgrad oder als Erfahrungspunkte — und
 * optional, wie viele Gegner es sein sollen; das Werkzeug sucht Monster,
 * deren EP zusammen so nah wie moeglich am Ziel liegen.
 *
 * WAS „GRAD" FUER EINE BEGEGNUNG HEISST
 * ====================================
 * Das Regelwerk kennt keinen Grad fuer eine ganze Begegnung, nur EP. Ein
 * Grad als Ziel wird deshalb in EP uebersetzt: eine Begegnung mit „Grad 5"
 * ist so viel wert wie ein Monster mit Grad 5 (1.800 EP). Genauso zurueck:
 * der „tatsaechliche Grad" ist der Grad, dessen EP dem Ergebnis am
 * naechsten liegen. Diese Uebersetzung steht so nicht im Regelwerk; sie ist
 * eine Lesehilfe und wird in der Oberflaeche auch so genannt.
 *
 * WIE GESUCHT WIRD
 * ================
 * Zufaellig und oft: einige tausend Versuche aus ein bis drei Monsterarten
 * mit passenden Anzahlen, davon der beste. Unter gleich guten wird gelost,
 * damit ein zweiter Klick etwas anderes vorschlaegt. Mehr als drei Arten
 * werden nicht gemischt — eine Begegnung aus fuenf verschiedenen Monstern
 * ist am Tisch selten, was man will.
 *
 * Plattformfrei und mit einstellbarem Zufall, damit die Tests ohne Glueck
 * auskommen.
 */
import { EP_NACH_GRAD, epFuerGrad } from '@suite/srd';
import type { Katalogkarte } from './katalog';

export interface Pflicht {
  readonly karte: Katalogkarte;
  readonly anzahl: number;
}

export interface Auftrag {
  /** Das Ziel in EP. */
  readonly zielEp: number;
  /** Wie viele Gegner insgesamt, Pflichtgegner eingerechnet; `null` = egal. */
  readonly anzahl: number | null;
  /** Aus diesen wird gewaehlt (schon nach Quelle und Typ gefiltert). */
  readonly vorrat: readonly Katalogkarte[];
  /** Muss in der Begegnung stehen. */
  readonly pflicht: readonly Pflicht[];
}

export interface Vorschlag {
  readonly gegner: readonly Pflicht[];
  readonly ep: number;
}

/** Hoechstens so viele Wesen je Art, wenn keine Anzahl vorgegeben ist. */
const HOECHSTENS_JE_ART = 8;
const VERSUCHE = 4000;

function epVon(karte: Katalogkarte): number {
  return epFuerGrad(karte.cr) ?? 0;
}

export function summeEp(gegner: readonly Pflicht[]): number {
  return gegner.reduce((summe, g) => summe + epVon(g.karte) * g.anzahl, 0);
}

/**
 * Die EP eines Grades, als Ziel. `null`, wenn der Grad unbekannt ist.
 */
export function zielAusGrad(grad: string): number | null {
  return epFuerGrad(grad);
}

/** Der Grad, dessen EP dem Wert am naechsten liegen. */
export function naechsterGrad(ep: number): string {
  let bester = '0';
  let abstand = Infinity;
  for (const [grad, wert] of Object.entries(EP_NACH_GRAD)) {
    const d = Math.abs(wert - ep);
    if (d < abstand) {
      bester = grad;
      abstand = d;
    }
  }
  return bester;
}

/** Wie weit ein Ergebnis vom Ziel abweicht, als Anteil (0,1 = 10 %). */
export function abweichung(ergebnis: number, ziel: number): number {
  return ziel > 0 ? Math.abs(ergebnis - ziel) / ziel : 0;
}

/**
 * Teilt `gesamt` Wesen zufaellig auf `arten` Arten auf, jede mindestens eins.
 */
function aufteilen(gesamt: number, arten: number, zufall: () => number): number[] {
  const teile = Array.from({ length: arten }, () => 1);
  for (let rest = gesamt - arten; rest > 0; rest -= 1) {
    teile[Math.floor(zufall() * arten)] += 1;
  }
  return teile;
}

export function stelleZusammen(
  auftrag: Auftrag,
  zufall: () => number = Math.random
): Vorschlag | null {
  const pflichtEp = summeEp(auftrag.pflicht);
  const pflichtZahl = auftrag.pflicht.reduce((s, p) => s + p.anzahl, 0);
  const restEp = auftrag.zielEp - pflichtEp;
  const restZahl = auftrag.anzahl === null ? null : auftrag.anzahl - pflichtZahl;

  // Nur Monster, deren EP man kennt und die fuer sich nicht schon ueber
  // dem Ziel liegen.
  const vorrat = auftrag.vorrat.filter((k) => {
    const ep = epVon(k);
    return ep > 0 && ep <= Math.max(restEp, 0) * 1.1;
  });

  const nurPflicht: Vorschlag = { gegner: auftrag.pflicht, ep: pflichtEp };
  if (restZahl !== null && restZahl <= 0) return nurPflicht;
  if (restEp <= 0 || vorrat.length === 0) return auftrag.pflicht.length ? nurPflicht : null;

  const kandidaten: { gegner: Pflicht[]; ep: number; fehler: number }[] = [];
  for (let versuch = 0; versuch < VERSUCHE; versuch += 1) {
    const artenMax = restZahl === null ? 3 : Math.min(3, restZahl);
    const arten = 1 + Math.floor(zufall() * artenMax);
    const gewaehlt: Katalogkarte[] = [];
    for (let i = 0; i < arten; i += 1) {
      const k = vorrat[Math.floor(zufall() * vorrat.length)];
      if (!gewaehlt.includes(k)) gewaehlt.push(k);
    }
    let anzahlen: number[];
    if (restZahl !== null) {
      anzahlen = aufteilen(restZahl, gewaehlt.length, zufall);
    } else {
      // Ohne vorgegebene Zahl: die Anzahl je Art so, dass der Rest moeglichst
      // aufgeht — von der teuersten Art aus.
      gewaehlt.sort((a, b) => epVon(b) - epVon(a));
      let offen = restEp;
      anzahlen = gewaehlt.map((k, i) => {
        const ep = epVon(k);
        const letzte = i === gewaehlt.length - 1;
        const teil = letzte ? offen : offen * (0.3 + zufall() * 0.5);
        const n = Math.max(1, Math.min(HOECHSTENS_JE_ART, Math.round(teil / ep)));
        offen -= n * ep;
        return n;
      });
    }
    const gegner = gewaehlt.map((karte, i) => ({ karte, anzahl: anzahlen[i] }));
    const ep = summeEp(gegner);
    kandidaten.push({ gegner, ep, fehler: Math.abs(ep - restEp) });
  }

  kandidaten.sort((a, b) => a.fehler - b.fehler);
  const bester = kandidaten[0].fehler;
  // Unter gleich guten losen: alles, was hoechstens 3 % des Ziels schlechter
  // ist als das Beste.
  const spielraum = bester + auftrag.zielEp * 0.03;
  const gute = kandidaten.filter((k) => k.fehler <= spielraum);
  const wahl = gute[Math.floor(zufall() * gute.length)];

  const gegner = [...auftrag.pflicht];
  for (const g of wahl.gegner) {
    const schon = gegner.findIndex((p) => p.karte.id === g.karte.id);
    if (schon >= 0) gegner[schon] = { ...gegner[schon], anzahl: gegner[schon].anzahl + g.anzahl };
    else gegner.push(g);
  }
  return { gegner, ep: summeEp(gegner) };
}
