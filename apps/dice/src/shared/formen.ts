/**
 * Die Umrisse der Wuerfelarten.
 *
 * Farbe und Muster gelten fuer alle Wuerfel gemeinsam — die **Form** ist damit
 * das Einzige, woran man eine Art erkennt. Sie muss deshalb auch klein und
 * neben den anderen eindeutig sein, nicht nur allein und gross.
 *
 * Darum sind die Umrisse nicht die geometrisch korrekten Projektionen der
 * Koerper (ein echter d10 sieht von oben aus wie ein Zehneck, ein d12 wie ein
 * Zwoelfeck — beide waeren von einem Kreis kaum zu unterscheiden), sondern die
 * Silhouetten, die man von Wuerfelbildern kennt: die *Seitenansicht* des
 * Koerpers. Genau die benutzen auch Roll20 und Foundry.
 *
 * Plattformfrei: nur Zahlen und Zeichenketten, kein SVG, kein DOM.
 */

/** Die Arten, die es fest gibt. `custom` traegt eine frei gewaehlte Seitenzahl. */
export const ARTEN = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100', 'custom'] as const;
export type Art = (typeof ARTEN)[number];

/** Wie viele Seiten eine Art hat. `custom` steht hier mit 0 und wird ersetzt. */
export const SEITEN: Record<Art, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
  custom: 0
};

export interface Form {
  /**
   * Der Umriss als SVG-Pfad in einem Feld von 100x100.
   *
   * Ein Pfad und keine `points`-Liste: der d6 hat abgerundete Ecken und der
   * d100 ist ein Kreis — beides braucht Kurven.
   */
  readonly umriss: string;
  /**
   * Die Facettenlinien, die den Koerper plastisch machen. Sie werden duenn und
   * halbdurchsichtig gezeichnet; ohne sie wirkt jede Art wie ein flacher
   * Aufkleber.
   */
  readonly facetten: readonly string[];
  /**
   * Wohin die Zahl gehoert, und wie gross.
   *
   * Nicht bei allen Arten die Mitte: beim d4 steht die Zahl unten, weil oben
   * die Spitze ist und eine mittig gesetzte Zahl dort oben herausragt.
   */
  readonly zahlY: number;
  readonly zahlGroesse: number;
}

/**
 * Ein regelmaessiges Vieleck, auf die Spitze gestellt.
 *
 * `drehung` in Grad: 0 heisst, die erste Ecke zeigt nach oben.
 */
function vieleck(ecken: number, radius: number, drehung = 0): string {
  const punkte: string[] = [];
  for (let i = 0; i < ecken; i++) {
    const winkel = (i / ecken) * Math.PI * 2 - Math.PI / 2 + (drehung * Math.PI) / 180;
    punkte.push(`${(50 + Math.cos(winkel) * radius).toFixed(2)},${(50 + Math.sin(winkel) * radius).toFixed(2)}`);
  }
  return `M${punkte.join('L')}Z`;
}

/** Ein Stern: `zacken` Spitzen aussen, dazwischen Ecken auf dem Innenradius. */
function stern(zacken: number, aussen: number, innen: number): string {
  const punkte: string[] = [];
  for (let i = 0; i < zacken * 2; i++) {
    const radius = i % 2 === 0 ? aussen : innen;
    const winkel = (i / (zacken * 2)) * Math.PI * 2 - Math.PI / 2;
    punkte.push(`${(50 + Math.cos(winkel) * radius).toFixed(2)},${(50 + Math.sin(winkel) * radius).toFixed(2)}`);
  }
  return `M${punkte.join('L')}Z`;
}

/** Eine Linie zwischen zwei Punkten. */
function linie(x1: number, y1: number, x2: number, y2: number): string {
  return `M${x1},${y1}L${x2},${y2}`;
}

export const FORMEN: Record<Art, Form> = {
  /**
   * d4 — Tetraeder. Dreieck mit der Spitze oben, drei Linien zur Mitte.
   * Die Zahl steht unten: oben ist die Spitze zu schmal.
   */
  d4: {
    umriss: vieleck(3, 46),
    facetten: [linie(50, 50, 50, 4), linie(50, 50, 10, 73), linie(50, 50, 90, 73)],
    zahlY: 66,
    zahlGroesse: 30
  },

  /**
   * d6 — das Quadrat mit runden Ecken.
   *
   * Der erste Versuch war ein Sechseck (der Wuerfel schraeg von oben, mit drei
   * sichtbaren Flaechen). Das ist naeher am Gegenstand und war falsch: neben
   * dem d20, der ebenfalls ein Sechseck ist, waren die beiden im Bild kaum zu
   * unterscheiden — und die Form ist hier das Einzige, woran man die Art
   * erkennt. Unterscheidbarkeit schlaegt Naturtreue.
   */
  d6: {
    umriss: 'M22,8 L78,8 Q92,8 92,22 L92,78 Q92,92 78,92 L22,92 Q8,92 8,78 L8,22 Q8,8 22,8 Z',
    facetten: [linie(8, 30, 92, 30), linie(30, 8, 30, 92)],
    zahlY: 62,
    zahlGroesse: 34
  },

  /** d8 — Oktaeder. Raute mit waagerechter Mittellinie. */
  d8: {
    umriss: 'M50,4 L88,50 L50,96 L12,50 Z',
    facetten: [linie(12, 50, 88, 50), linie(50, 4, 50, 96)],
    zahlY: 58,
    zahlGroesse: 28
  },

  /**
   * d10 — Trapezoeder. Der Drachen: oben eine kurze Spitze, unten eine
   * lange. Die unverwechselbarste Form im Satz.
   */
  d10: {
    umriss: 'M50,4 L90,38 L50,96 L10,38 Z',
    facetten: [linie(10, 38, 50, 56), linie(90, 38, 50, 56), linie(50, 4, 50, 56)],
    zahlY: 46,
    zahlGroesse: 26
  },

  /** d12 — Dodekaeder. Fuenfeck mit einem Fuenfeck darin. */
  d12: {
    umriss: vieleck(5, 47),
    facetten: [
      vieleck(5, 22, 180),
      linie(50, 3, 50, 28),
      linie(94.7, 35.5, 71, 63),
      linie(77.6, 88, 50, 72),
      linie(22.4, 88, 29, 63),
      linie(5.3, 35.5, 50, 28)
    ],
    zahlY: 58,
    zahlGroesse: 26
  },

  /**
   * d20 — Ikosaeder. Sechseck mit einem Dreieck darin: das ist die
   * Ansicht, die jeder kennt, und sie unterscheidet sich klar vom d6, weil
   * dessen Facetten von der Mitte nach aussen laufen.
   */
  d20: {
    umriss: vieleck(6, 48, 30),
    facetten: [
      'M50,18 L79,67 L21,67 Z',
      linie(50, 18, 50, 2),
      linie(79, 67, 91.6, 74),
      linie(21, 67, 8.4, 74)
    ],
    zahlY: 58,
    zahlGroesse: 26
  },

  /**
   * d100 — der Prozentwuerfel. Ein Kreis mit Aequator und Meridian: eine
   * Kugel, und damit die einzige Form ohne Ecken. Bei dreistelligen Zahlen
   * muss die Schrift kleiner sein.
   */
  d100: {
    umriss: 'M50,3 A47,47 0 1,1 49.9,3 Z',
    facetten: ['M3,50 A47,20 0 0,0 97,50', 'M50,3 A20,47 0 0,0 50,97'],
    zahlY: 59,
    zahlGroesse: 24
  },

  /**
   * Der eigene Wuerfel — ein Stern.
   *
   * Bewusst eine Form, die es als Wuerfel nicht gibt: er soll nicht mit einer
   * echten Art verwechselt werden, wenn jemand ihn auf 6 oder 20 Seiten
   * stellt. Ein Achteck stand hier zuerst und war neben dem runden d100 zu
   * unauffaellig — bei 52 Punkten Kantenlaenge sah beides gleich aus.
   */
  custom: {
    umriss: stern(6, 47, 26),
    facetten: [vieleck(6, 26)],
    zahlY: 58,
    zahlGroesse: 24
  }
};

/** Der Anzeigename einer Art. `custom` bekommt seine Seitenzahl. */
export function artName(art: Art, eigeneSeiten: number): string {
  return art === 'custom' ? `d${eigeneSeiten}` : art;
}

/** Wie viele Seiten diese Art in diesem Wurf hat. */
export function seitenVon(art: Art, eigeneSeiten: number): number {
  return art === 'custom' ? eigeneSeiten : SEITEN[art];
}
