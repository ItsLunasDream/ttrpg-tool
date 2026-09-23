/**
 * Eine Begegnung aus einem anderen Werkzeug wird zu Teilnehmern.
 *
 * Der Encounter Creator stellt zusammen, der Tracker spielt. Die Form
 * dazwischen steht in `@suite/uebergabe` und ist absichtlich duenn: Namen,
 * Zahlen, Saetze. Was daraus wird — Koerper mit Marken, Terrain bei
 * Initiative 20 — entscheidet der Tracker, also diese Datei.
 *
 * Reine Funktionen, wie im ganzen Kampfkern. Die Kennungen kommen von
 * aussen, damit sich das Ergebnis in einem Test festnageln laesst.
 */
import { marken, type Uebergabe } from '@suite/uebergabe';
import { TERRAIN_INITIATIVE } from './kampf';
import type { Koerper, Teilnehmer } from './types';

/** Woher die Kennungen kommen. In der Anwendung `neueId`. */
export type Kennungsquelle = () => string;

function koerperVon(anzahl: number, hpMax: number, kennung: Kennungsquelle): Koerper[] {
  return marken(anzahl).map((marke) => ({
    id: kennung(),
    marke,
    hp: hpMax,
    hpMax,
    tempHp: 0,
    raus: false
  }));
}

/**
 * Die Teilnehmer, die aus einer Uebergabe entstehen.
 *
 * Die Initiative steht auf null und WIRD NICHT GEWUERFELT. Das ist eine
 * Entscheidung und kein Versehen: am Tisch wird ausgewuerfelt, wenn der
 * Kampf beginnt, und der Tracker hat dafuer seinen eigenen Knopf. Eine
 * Zahl, die von aussen hereinkommt und aussieht wie gewuerfelt, waere
 * schlimmer als eine leere.
 *
 * Der Zuschlag landet im Feinwert. Der entscheidet im Tracker
 * Gleichstaende und ist genau das, was beim Auswuerfeln daraufkommt —
 * ein zweites Feld nur fuer diesen Zweck haette der Tracker nicht.
 */
export function alsTeilnehmer(
  uebergabe: Uebergabe,
  kennung: Kennungsquelle
): Teilnehmer[] {
  const gegner = uebergabe.gegner.map((einer) => ({
    id: kennung(),
    name: einer.name,
    initiative: 0,
    feinwert: einer.iniMod,
    istSpieler: false,
    istTerrain: false,
    koerper: koerperVon(einer.anzahl, einer.tp, kennung),
    zustaende: [],
    bild: null,
    // Frueher stand die Ruestungsklasse als „RK 17" in der Notiz — auch
    // auf Englisch. Mit eigenem Feld zeigt die Zeile sie in der Sprache
    // der Oberflaeche.
    notiz: '',
    ...(einer.rk > 0 ? { rk: einer.rk } : {})
  }));

  /*
   * Jede Regel der Umgebung wird ein eigener Terrain-Eintrag.
   *
   * Nicht einer mit allen Regeln darin: im Tracker laesst sich ein
   * einzelner Eintrag austragen, wenn er nicht mehr gilt — der Nebel
   * verzieht sich, das Wasser steht. Ein Sammeleintrag waere ganz da oder
   * ganz weg.
   *
   * Was man SIEHT, wird kein Eintrag. Es ist zum Vorlesen und haette in
   * der Zugreihenfolge nichts verloren.
   */
  const terrain = (uebergabe.umgebung?.regeln ?? []).map((regel) => ({
    id: kennung(),
    /*
     * Die Regel steht im NAMEN, nicht in der Notiz.
     *
     * Im Tracker ist der Name das einzige, was an einer Zeile immer zu
     * sehen ist; die Notiz zeigt er erst, wenn man den Eintrag aufklappt.
     * Eine Terrain-Zeile wird einmal pro Runde gelesen — stuende dort nur
     * „Wald", waere die halbe Arbeit dieser Uebergabe unsichtbar.
     *
     * Die Umgebung davor, damit man bei mehreren Zeilen sieht, wozu sie
     * gehoeren. Die Zahl der Regel steht schon im Satz („auf 30 Fuss");
     * sie noch einmal anzuhaengen waere Rauschen.
     */
    name: uebergabe.umgebung?.name
      ? `${uebergabe.umgebung.name}: ${regel.text}`
      : regel.text,
    initiative: TERRAIN_INITIATIVE,
    feinwert: 0,
    istSpieler: false,
    istTerrain: true,
    koerper: [],
    zustaende: [],
    bild: null,
    notiz: ''
  }));

  return [...gegner, ...terrain];
}

/**
 * Was beim Uebernehmen vorgelesen werden kann.
 *
 * Die erste Sorte der Umgebung landet in der Taktik der Begegnung, nicht
 * in der Reihenfolge. Leer, wenn keine Umgebung dabei war.
 */
export function alsTaktik(uebergabe: Uebergabe): string {
  const umgebung = uebergabe.umgebung;
  if (!umgebung) return '';
  const zeilen = [`## ${umgebung.name}`, '', ...umgebung.beschreibung];
  return zeilen.join('\n');
}
