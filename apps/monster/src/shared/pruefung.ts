/**
 * Die Pruefung: aus den Zahlen eines Monsters einen CR rechnen.
 *
 * Das ist der Kern des Werkzeugs, nicht der Erzeuger. Ein Monster zu
 * erfinden ist leicht; eines zu erfinden, das den Kampfabend nicht kaputt
 * macht, ist es nicht.
 *
 * Eine reine Funktion: Zahlen rein, Befund raus. Kein Zufall, keine Dateien,
 * kein `electron`. Nur so laesst sie sich gegen bekannte Monster eichen, und
 * nur so ist sie glaubwuerdig.
 *
 * Das Verfahren in drei Schritten, wie es die Richtwerte nahelegen:
 *
 *   Verteidigung  aus Trefferpunkten und Ruestungsklasse
 *   Angriff       aus Schaden pro Runde und Angriffsbonus
 *   Ergebnis      der Mittelwert aus beiden
 *
 * Die beiden Haelften werden dabei getrennt ausgewiesen und nicht nur
 * verrechnet. Der Mittelwert allein sagt „CR 7" und verschweigt, dass das
 * Monster wie CR 4 einsteckt und wie CR 9 austeilt — und genau das ist die
 * haeufigste Art, wie Homebrew schiefgeht.
 */

import { alsGrad, naechsterCr, richtwert, stetigerCr, type Richtwert } from './richtwerte';

/** Die Zahlen eines Monsters, so weit sie fuer den CR zaehlen. */
export interface Werte {
  readonly tp: number;
  readonly rk: number;
  /** Schaden pro Runde, ueber alle Angriffe zusammen. */
  readonly schadenProRunde: number;
  /** Angriffsbonus, oder der Rettungs-SG minus 8, wenn das Monster vor allem zwingt. */
  readonly angriffsbonus: number;
  /**
   * Schadensarten, gegen die das Monster widerstandsfaehig ist.
   *
   * Zaehlt nur mit, wenn es mehr als eine Handvoll ist — ein Monster mit
   * Resistenz gegen genau den Schaden, den die Gruppe nicht bringt, haelt
   * nicht laenger durch. Siehe `WIRKSAME_TP`.
   */
  readonly resistenzen?: number;
  readonly immunitaeten?: number;
  /**
   * Verwundbarkeiten, in derselben Gewichtung wie die Resistenzen.
   *
   * Die Gegenrichtung: wer doppelten Schaden nimmt, haelt kuerzer durch als
   * seine Trefferpunkte behaupten. Ohne diese Zeile waere eine
   * Verwundbarkeit ein Nachteil, den der Grad nicht sieht — und damit ein
   * Weg, ein Monster unter der Hand zu schwaechen.
   */
  readonly verwundbarkeiten?: number;
  /** Hat es legendaere Aktionen? Das ist kein Aufschlag, sondern ein Faktor. */
  readonly legendaer?: boolean;
}

/** Was bei einer Haelfte herauskam. */
export interface Haelfte {
  /** Der Grad, den diese Haelfte fuer sich genommen ergibt. */
  readonly cr: string;
  /** Derselbe Grad stetig, fuer den Mittelwert. */
  readonly wert: number;
  /** Was gemessen wurde, und was der Richtwert dazu sagt. */
  readonly gemessen: number;
  readonly erwartet: number;
  /** Liegt die Haelfte innerhalb dessen, was zum Ziel-CR passt? */
  readonly passt: boolean;
}

export interface Befund {
  /** Der gerechnete Grad. */
  readonly cr: string;
  readonly wert: number;
  readonly verteidigung: Haelfte;
  readonly angriff: Haelfte;
  /** Der eingestellte Grad, gegen den geprueft wurde. */
  readonly ziel: string;
  /** Wie weit daneben, in Graden. 0 heisst: getroffen. */
  readonly abweichung: number;
  readonly urteil: 'passt' | 'zu stark' | 'zu schwach';
  /**
   * Was man drehen kann, um es hinzubekommen — der wichtigste Teil.
   *
   * Ein Befund, der nur „stimmt nicht" sagt, hilft niemandem beim naechsten
   * Schritt.
   */
  readonly vorschlaege: readonly Vorschlag[];
}

export interface Vorschlag {
  /** Welches Feld, damit die Oberflaeche einen Knopf daraus machen kann. */
  readonly feld: 'tp' | 'rk' | 'schadenProRunde' | 'angriffsbonus';
  readonly von: number;
  readonly auf: number;
  /** Warum. Als Schluessel, nicht als Satz — der Text gehoert ins Woerterbuch. */
  readonly grund: 'tpZuHoch' | 'tpZuNiedrig' | 'schadenZuHoch' | 'schadenZuNiedrig' | 'rkDaneben' | 'bonusDaneben';
}

/**
 * Wie viel ein Punkt Ruestungsklasse ueber dem Richtwert wert ist.
 *
 * Zwei Punkte RK entsprechen ungefaehr einem Fuenftel mehr Trefferpunkten:
 * die Gruppe trifft seltener, das Monster haelt laenger. Der Wert ist
 * gerundet und bewusst vorsichtig — RK wirkt nicht linear, und wer ihn zu
 * hoch ansetzt, baut Monster, die nur noch aus Ruestung bestehen.
 */
export const RK_ZU_TP = 0.1;

/**
 * Wie viel Resistenzen und Immunitaeten an wirksamen Trefferpunkten bringen.
 *
 * Eine Annahme, und sie wird auch als solche ausgewiesen: es haengt daran,
 * welchen Schaden die Gruppe ueberhaupt bringt. Eine Gruppe mit einem
 * Feuermagier laesst eine Feuerimmunitaet nach viel aussehen; eine ohne
 * merkt sie nicht.
 */
const JE_RESISTENZ = 0.08;
const JE_IMMUNITAET = 0.15;
/** Mehr als das zaehlt nicht mehr — irgendwann trifft die Gruppe eben anders. */
const DECKEL_WIDERSTAND = 0.5;

/**
 * Legendaere Aktionen als Faktor, nicht als Aufschlag.
 *
 * Ein Einzelgegner ohne sie kaempft gegen vier Figuren ueberhaupt erst mit:
 * er handelt einmal, sie viermal. Die Zahl ist grob, aber die Richtung ist
 * eindeutig, und sie wegzulassen waere der groessere Fehler.
 */
export const LEGENDAER_FAKTOR = 1.25;

/**
 * Wie viel die Widerstaende an wirksamen Trefferpunkten ausmachen.
 *
 * Als eigene Funktion, weil der Erzeuger sie GENAUSO braucht: er muss die
 * rohen Trefferpunkte um denselben Anteil senken, den die Widerstaende
 * hinzufuegen. Stuende die Rechnung zweimal da, liefe sie irgendwann
 * auseinander, und dann waere ein Monster mit Resistenzen still zu stark.
 */
export function widerstandsAnteil(werte: Werte): number {
  const roh =
    (werte.resistenzen ?? 0) * JE_RESISTENZ +
    (werte.immunitaeten ?? 0) * JE_IMMUNITAET -
    (werte.verwundbarkeiten ?? 0) * JE_RESISTENZ;
  return Math.max(-DECKEL_WIDERSTAND, Math.min(DECKEL_WIDERSTAND, roh));
}

/** Die wirksamen Trefferpunkte: was das Monster tatsaechlich aushaelt. */
export function wirksameTp(werte: Werte, ziel: Richtwert): number {
  const ausRuestung = (werte.rk - ziel.rk) * RK_ZU_TP;
  return werte.tp * (1 + widerstandsAnteil(werte) + ausRuestung);
}

/** Der wirksame Schaden: was es tatsaechlich austeilt. */
export function wirksamerSchaden(werte: Werte, ziel: Richtwert): number {
  const ausBonus = (werte.angriffsbonus - ziel.bonus) * 0.05;
  const legendaer = werte.legendaer ? LEGENDAER_FAKTOR : 1;
  return werte.schadenProRunde * (1 + ausBonus) * legendaer;
}

/**
 * Der Befund.
 *
 * `zielCr` ist der eingestellte Grad. Die Richtwerte dazu werden an zwei
 * Stellen gebraucht: als Vergleich (passt es?) und als Bezugspunkt fuer die
 * Umrechnung von RK und Angriffsbonus (beide wirken relativ zum erwarteten
 * Wert, nicht absolut).
 */
/**
 * Die Schadensspanne, gegen die die Pruefung misst. Eigene Funktion, damit
 * die Anzeige dieselbe Spanne zeigt: sie rechnete frueher mit einem reinen
 * Viertel und zeigte bei CR 1/4 „7 · 4–6 ✓" (Testbericht).
 */
export function schadensSpanne(ziel: Richtwert): { von: number; bis: number } {
  const spielraum = Math.max(ziel.schadenProRunde * 0.25, 2);
  return { von: ziel.schadenProRunde - spielraum, bis: ziel.schadenProRunde + spielraum };
}

export function pruefe(werte: Werte, zielCr: string): Befund {
  const ziel = richtwert(zielCr) ?? richtwert('1')!;

  const tpWirksam = wirksameTp(werte, ziel);
  const schadenWirksam = wirksamerSchaden(werte, ziel);

  const verteidigungWert = stetigerCr(tpWirksam, (e) => e.tp);
  const angriffWert = stetigerCr(schadenWirksam, (e) => e.schadenProRunde);
  const mittel = (verteidigungWert + angriffWert) / 2;
  const grad = alsGrad(mittel);

  const verteidigung: Haelfte = {
    cr: alsGrad(verteidigungWert).cr,
    wert: verteidigungWert,
    gemessen: Math.round(tpWirksam),
    erwartet: ziel.tp,
    /*
     * Verglichen wird, was das Monster AUSHAELT, nicht was in der Zeile
     * „Trefferpunkte" steht.
     *
     * Der Unterschied faellt erst auf, seit es Resistenzen gibt: ein
     * Konstrukt mit Resistenz gegen Stich bekommt absichtlich weniger rohe
     * Trefferpunkte, weil es laenger durchhaelt. Gegen die rohe Zahl
     * geprueft fiel es durch — und zwar dafuer, dass es richtig gebaut war.
     * Dieselbe Ueberlegung galt vorher schon fuer die Ruestungsklasse, nur
     * war die Verschiebung dort klein genug, um in der Spanne unterzugehen.
     */
    passt: tpWirksam >= ziel.tpVon && tpWirksam <= ziel.tpBis
  };

  /*
   * Beim Schaden gilt eine Spanne von einem Viertel nach oben und unten.
   * Die Quelle nennt fuer den Schaden keine, nur einen Wert — ohne Spanne
   * waere aber jedes Monster „daneben", das nicht genau trifft.
   *
   * Dazu ein fester Mindestspielraum von zwei Punkten. Bei CR 1/8 sind drei
   * Schaden erwartet, ein Viertel davon ist 0,75 — ein einziger Punkt
   * Unterschied faellt damit schon aus der Spanne. Der Musterblock „Minion"
   * aus der Quelle selbst macht 4 Schaden und galt prompt als zu stark.
   * Bei kleinen Zahlen ist der relative Abstand die falsche Groesse.
   */
  const { von: schadenVon, bis: schadenBis } = schadensSpanne(ziel);
  const angriff: Haelfte = {
    cr: alsGrad(angriffWert).cr,
    wert: angriffWert,
    gemessen: Math.round(schadenWirksam),
    erwartet: ziel.schadenProRunde,
    // Und ebenso beim Schaden: legendaere Aktionen senken den rohen
    // Rundenschaden, weil das Monster oefter drankommt.
    passt: schadenWirksam >= schadenVon && schadenWirksam <= schadenBis
  };

  const abweichung = grad.wert - ziel.wert;
  /*
   * Das Urteil braucht BEIDES: die Spannen muessen halten UND der
   * gerechnete Grad muss beim eingestellten liegen.
   *
   * Die Spannen allein reichen nicht. Die der Trefferpunkte stammen aus der
   * Quelle und sind weit — bei CR 15 reichen sie von 158 bis 263 —, sodass
   * sich benachbarte Grade ueberlappen. Der Musterblock „Sentinel" (CR 11)
   * lag damit in beiden Spannen von CR 15 und wurde als passend
   * durchgewunken, vier Grade daneben. Ein Werkzeug, das so etwas
   * durchlaesst, ist gefaehrlicher als keines.
   *
   * Ein halber Grad Toleranz, weil der Mittelwert stetig ist und sonst jede
   * Rundung ein Urteil kippte.
   */
  const nahGenug = Math.abs(grad.wert - ziel.wert) < 0.5;
  const urteil: Befund['urteil'] =
    verteidigung.passt && angriff.passt && nahGenug
      ? 'passt'
      : abweichung > 0
        ? 'zu stark'
        : abweichung < 0
          ? 'zu schwach'
          : verteidigung.passt && angriff.passt
            ? 'passt'
            : 'zu stark';

  return {
    cr: grad.cr,
    wert: mittel,
    verteidigung,
    angriff,
    ziel: ziel.cr,
    abweichung,
    urteil,
    vorschlaege: baueVorschlaege(werte, ziel, verteidigung, angriff)
  };
}

/**
 * Was sich drehen laesst.
 *
 * Immer der kleinste Eingriff zuerst: was ausserhalb der Spanne liegt, wird
 * auf den naechsten Rand der Spanne gezogen, nicht auf den Mittelwert. Wer
 * 150 Trefferpunkte wollte und 144 bekommt, ist zufriedener als mit 130.
 */
function baueVorschlaege(
  werte: Werte,
  ziel: Richtwert,
  verteidigung: Haelfte,
  angriff: Haelfte
): Vorschlag[] {
  const heraus: Vorschlag[] = [];

  if (!verteidigung.passt) {
    const zuHoch = werte.tp > ziel.tpBis;
    heraus.push({
      feld: 'tp',
      von: werte.tp,
      auf: zuHoch ? ziel.tpBis : ziel.tpVon,
      grund: zuHoch ? 'tpZuHoch' : 'tpZuNiedrig'
    });
  }

  if (!angriff.passt) {
    const spielraum = Math.max(ziel.schadenProRunde * 0.25, 2);
    const zuHoch = werte.schadenProRunde > ziel.schadenProRunde + spielraum;
    /*
     * Nach INNEN runden, nicht kaufmaennisch.
     *
     * Der obere Rand bei CR 5 liegt bei 43,75. Kaufmaennisch gerundet waeren
     * das 44 — und 44 liegt ausserhalb der Spanne. Das Nachziehen landete
     * damit genau einen Punkt neben dem Ziel und schlug beim naechsten
     * Durchgang wieder dasselbe vor, mit „von 44 auf 44". Gefunden hat das
     * der Test, nicht das Auge.
     */
    heraus.push({
      feld: 'schadenProRunde',
      von: werte.schadenProRunde,
      auf: zuHoch
        ? Math.floor(ziel.schadenProRunde + spielraum)
        : Math.ceil(ziel.schadenProRunde - spielraum),
      grund: zuHoch ? 'schadenZuHoch' : 'schadenZuNiedrig'
    });
  }

  /*
   * Ruestungsklasse und Angriffsbonus kommen nur dann zur Sprache, wenn sie
   * weit danebenliegen. Sie tragen wenig zum CR bei; sie jedes Mal
   * anzumerken machte aus dem Befund eine Mecker-Liste, die man nicht mehr
   * liest.
   */
  if (Math.abs(werte.rk - ziel.rk) > 3) {
    heraus.push({ feld: 'rk', von: werte.rk, auf: ziel.rk, grund: 'rkDaneben' });
  }
  if (Math.abs(werte.angriffsbonus - ziel.bonus) > 3) {
    heraus.push({ feld: 'angriffsbonus', von: werte.angriffsbonus, auf: ziel.bonus, grund: 'bonusDaneben' });
  }

  /*
   * Ein Vorschlag, der nichts aendert, ist keiner. Er entsteht, wenn ein
   * Wert genau auf dem Rand der Spanne sitzt — anzeigen wuerde er nur
   * verwirren, und `zieheNach` liefe sich daran fest.
   */
  return heraus.filter((vorschlag) => vorschlag.auf !== vorschlag.von);
}

/**
 * Die Zahlen auf den Ziel-CR ziehen.
 *
 * Das ist der Weg fuer KI-Antworten: sie werden korrigiert, waehrend ein
 * Handeintrag nur einen Hinweis bekommt. Warum der Unterschied, steht im
 * Konzept — kurz: die KI hat die Zahl geraten, der Mensch hat sie gewaehlt.
 *
 * Geaendert wird so wenig wie moeglich: was in der Spanne liegt, bleibt
 * stehen. Sonst kaeme aus jeder KI-Antwort dasselbe Monster mit denselben
 * Zahlen heraus.
 */
export function zieheNach(werte: Werte, zielCr: string): Werte {
  const ziel = richtwert(zielCr) ?? richtwert('1')!;
  const befund = pruefe(werte, zielCr);
  if (befund.urteil === 'passt') return { ...werte };

  /*
   * Auf den RICHTWERT ziehen, nicht auf den Rand der Spanne.
   *
   * Das ist der Unterschied zwischen Vorschlag und Nachziehen, und er hat
   * einen Grund: ein Vorschlag an einen Menschen aendert so wenig wie
   * moeglich und zielt deshalb auf den naechsten Rand — wer 300
   * Trefferpunkte wollte, ist mit 144 zufriedener als mit 130. Das
   * Nachziehen dagegen muss den Grad wirklich treffen.
   *
   * Beides zu verwechseln kostete einen Anlauf: auf die Raender gezogen
   * lagen beide Haelften „in der Spanne" und das Monster trotzdem einen
   * Grad zu hoch, weil zwei obere Raender zusammen eben nach oben mitteln.
   */
  let heraus: Werte = { ...werte };
  if (!befund.verteidigung.passt || Math.abs(befund.verteidigung.wert - ziel.wert) >= 0.5) {
    heraus = { ...heraus, tp: ziel.tp };
  }
  if (!befund.angriff.passt || Math.abs(befund.angriff.wert - ziel.wert) >= 0.5) {
    heraus = { ...heraus, schadenProRunde: ziel.schadenProRunde };
  }
  // Ruestungsklasse und Angriffsbonus nur, wenn sie weit danebenliegen: sie
  // tragen wenig zum Grad bei, stehen aber in jedem Angriff.
  if (Math.abs(heraus.rk - ziel.rk) > 3) heraus = { ...heraus, rk: ziel.rk };
  if (Math.abs(heraus.angriffsbonus - ziel.bonus) > 3) heraus = { ...heraus, angriffsbonus: ziel.bonus };

  /*
   * Letzte Sicherung: wenn es danach immer noch nicht passt, liegt es an
   * etwas, das nicht in den vier Zahlen steht — Widerstaenden oder
   * legendaeren Aktionen. Dann wird die Verteidigung nachgegeben, bis der
   * Grad stimmt. Lieber ein Monster mit ungewoehnlichen Trefferpunkten als
   * eines, das den Abend beendet.
   */
  for (let versuch = 0; versuch < 8 && pruefe(heraus, zielCr).urteil !== 'passt'; versuch += 1) {
    const stand = pruefe(heraus, zielCr);
    const zuStark = stand.abweichung > 0;
    heraus = {
      ...heraus,
      tp: Math.max(1, Math.round(heraus.tp * (zuStark ? 0.92 : 1.08))),
      schadenProRunde: Math.max(1, Math.round(heraus.schadenProRunde * (zuStark ? 0.92 : 1.08)))
    };
  }
  return heraus;
}

/** Nur fuer die Anzeige: der naechstgelegene Grad zu einer Trefferpunktzahl. */
export function gradNachTp(tp: number): string {
  return naechsterCr(tp, (e) => e.tp).cr;
}
