/**
 * Zeiten und Kurven der Oberflaeche — eine Quelle fuer alle Anwendungen.
 *
 * Die Werte stehen doppelt: hier als Zahlen fuer Bewegung, die JavaScript
 * selbst treibt (die Huelle verschiebt eingebettete Ansichten ueber
 * `setBounds`, dort gibt es kein CSS), und in `motion.css` als Custom
 * Properties fuer alles, was der Browser animiert. `tests/motion.test.mjs`
 * haelt beide Seiten auf demselben Stand — ohne diesen Test laufen sie
 * auseinander, und niemand merkt es, weil beides fuer sich plausibel aussieht.
 *
 * Konvention 4: keine Browser-Globals. Ob der Nutzer weniger Bewegung will,
 * beantwortet `motion.css` selbst ueber `prefers-reduced-motion`; JavaScript,
 * das Bewegung von Hand treibt, fragt das ueber `matchMedia` in der jeweiligen
 * Anwendung ab und uebergibt das Ergebnis an `dauerFuer`.
 */

/**
 * Vier Dauern, nicht mehr. Jede beantwortet eine andere Frage.
 *
 * Die Grenze von 250 ms fuer alles, was auf eine Eingabe folgt, ist bewusst:
 * darueber wartet man auf die Oberflaeche, statt sie zu bedienen. Einzige
 * Ausnahme ist `aufmerksamkeit` — die laeuft *neben* der Bedienung, blockiert
 * nichts und darf deshalb lang genug sein, um bemerkt zu werden.
 */
export const DAUER = {
  /** Der Knopf hat gedrueckt, das Feld hat Fokus. Direkte Antwort auf einen Klick. */
  rueckmeldung: 90,
  /** Etwas ist jetzt anders: an/aus, offen/zu, ausgewaehlt. */
  zustand: 160,
  /** Etwas ist woanders: Ansicht wechselt, Zeile rueckt, Dialog kommt. */
  ortswechsel: 220,
  /** Einmaliger Hinweis ohne Bewegung: gespeichert, fehlgeschlagen. */
  aufmerksamkeit: 450
} as const;

export type DauerName = keyof typeof DAUER;

/**
 * Beschleunigungskurven als [x1, y1, x2, y2] einer kubischen Bezierkurve —
 * dieselben vier Zahlen, die CSS in `cubic-bezier(...)` erwartet.
 */
export const KURVEN = {
  /** Fuer alles, was anfaengt und aufhoert: weich an beiden Enden. */
  standard: [0.4, 0, 0.2, 1],
  /** Fuer Auftritte: schnell da, weich abgebremst. */
  eintritt: [0, 0, 0.2, 1],
  /** Fuer Abgaenge: weich los, dann zuegig weg. Niemand sieht gern beim Verschwinden zu. */
  austritt: [0.4, 0, 1, 1]
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type KurvenName = keyof typeof KURVEN;

/** Schreibt eine Kurve so, wie CSS sie liest. */
export function cssKurve(name: KurvenName): string {
  return `cubic-bezier(${KURVEN[name].join(', ')})`;
}

/**
 * Die Dauer, die gilt — abhaengig davon, ob der Nutzer weniger Bewegung will.
 *
 * `aufmerksamkeit` bleibt dann stehen: sie ist reine Farbe, keine Bewegung,
 * und sie auf null zu kuerzen naehme die Rueckmeldung weg, statt sie ruhiger
 * zu machen. Alles andere faellt auf einen Wert nahe null. *Nahe*, nicht null:
 * bei genau 0 melden Browser weder `transitionend` noch `animationend`, und
 * Code, der auf das Ende einer Animation wartet, bliebe haengen.
 */
export function dauerFuer(name: DauerName, reduziert: boolean): number {
  if (!reduziert || name === 'aufmerksamkeit') return DAUER[name];
  return 0.01;
}

/**
 * Wertet eine kubische Bezierkurve aus: Anteil der Zeit rein, Anteil des Weges
 * raus. Fuer Bewegung, die kein CSS treibt.
 *
 * CSS-Kurven geben x (Zeit) und y (Weg) getrennt an; gesucht ist y zu einem
 * gegebenen x. Dafuer muss erst der Kurvenparameter t zu diesem x gefunden
 * werden — Newton-Verfahren, mit Intervallhalbierung als Rueckfall, wo dessen
 * Ableitung zu flach wird.
 *
 * Fuer die drei Kurven oben greift dieser Rueckfall nie; Newton ist dort nach
 * wenigen Schritten genau genug (gemessen, nicht vermutet). Er steht trotzdem
 * da, weil die Funktion auch eine frei uebergebene Kurve annimmt, und bei
 * einer mit waagerechter Tangente in der Mitte laeuft Newton weg.
 */
export function bezier(
  kurveOderName: KurvenName | readonly [number, number, number, number]
): (anteil: number) => number {
  const [x1, y1, x2, y2] =
    typeof kurveOderName === 'string' ? KURVEN[kurveOderName] : kurveOderName;
  // Ausgeschriebene Bernsteinform mit P0=(0,0) und P3=(1,1).
  const kurve = (t: number, a: number, b: number): number => {
    const u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
  };
  const steigung = (t: number, a: number, b: number): number => {
    const u = 1 - t;
    return 3 * u * u * a + 6 * u * t * (b - a) + 3 * t * t * (1 - b);
  };

  return (anteil: number): number => {
    if (anteil <= 0) return 0;
    if (anteil >= 1) return 1;
    let t = anteil;
    for (let i = 0; i < 8; i++) {
      const abweichung = kurve(t, x1, x2) - anteil;
      if (Math.abs(abweichung) < 1e-6) return kurve(t, y1, y2);
      const d = steigung(t, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      t -= abweichung / d;
    }
    let unten = 0;
    let oben = 1;
    t = anteil;
    for (let i = 0; i < 40; i++) {
      const x = kurve(t, x1, x2);
      if (Math.abs(x - anteil) < 1e-6) break;
      if (x > anteil) oben = t;
      else unten = t;
      t = (unten + oben) / 2;
    }
    return kurve(t, y1, y2);
  };
}
