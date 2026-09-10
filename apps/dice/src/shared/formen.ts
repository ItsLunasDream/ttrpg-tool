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

/** Eine Linie zwischen zwei Punkten. */
function linie(x1: number, y1: number, x2: number, y2: number): string {
  return `M${x1},${y1}L${x2},${y2}`;
}

export const FORMEN: Record<Art, Form> = {
  /**
   * d4 — Tetraeder, von vorn auf eine Kante gesehen.
   *
   * Das Dreieck traegt drei Linien vom Mittelpunkt zu den Ecken: so sieht man
   * die drei Flaechen, die von hier aus sichtbar sind. Ohne sie waere es ein
   * Verkehrsschild.
   */
  d4: {
    umriss: 'M50,6 L92,80 L8,80 Z',
    facetten: [linie(50, 6, 50, 55), linie(50, 55, 8, 80), linie(50, 55, 92, 80)],
    zahlY: 72,
    zahlGroesse: 26
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

  /**
   * d8 — Oktaeder. Die Raute mit waagerechter Mittelkante; darueber und
   * darunter je zwei Flaechen, getrennt durch die senkrechte Vorderkante.
   */
  d8: {
    umriss: 'M50,3 L90,50 L50,97 L10,50 Z',
    facetten: [linie(10, 50, 90, 50), linie(50, 3, 50, 97)],
    zahlY: 44,
    zahlGroesse: 24
  },

  /**
   * d10 — Trapezoeder.
   *
   * Die Kante um die Mitte laeuft im Zickzack, und genau daran erkennt man
   * ihn: ohne sie waere er nur eine etwas laengere Raute und vom d8 kaum zu
   * unterscheiden.
   */
  d10: {
    // Schmaler und laenger als der d8, und mit einer tiefen Zickzack-Kante:
    // die erste Fassung war nur eine etwas laengere Raute und daneben nicht
    // auseinanderzuhalten. Die Silhouette allein muss den Unterschied tragen,
    // die Facetten sind bei 52 Punkten zu fein dafuer.
    umriss: 'M50,2 L82,34 L50,98 L18,34 Z',
    facetten: [
      'M18,34 L34,50 L50,34 L66,50 L82,34',
      linie(50, 2, 50, 34),
      linie(34, 50, 34, 62),
      linie(66, 50, 66, 62),
      linie(34, 62, 50, 98),
      linie(66, 62, 50, 98)
    ],
    zahlY: 38,
    zahlGroesse: 22
  },

  /**
   * d12 — Dodekaeder: das Fuenfeck mit einem gedrehten Fuenfeck darin und
   * Speichen dazwischen. Das sind die fuenf Flaechen um die vordere herum.
   */
  d12: {
    umriss: vieleck(5, 47),
    facetten: [
      vieleck(5, 23, 36),
      linie(50, 3, 68.5, 31.4),
      linie(94.7, 35.5, 68.5, 60.6),
      linie(77.6, 88, 50, 68),
      linie(22.4, 88, 31.5, 60.6),
      linie(5.3, 35.5, 31.5, 31.4)
    ],
    zahlY: 56,
    zahlGroesse: 24
  },

  /**
   * d20 — Ikosaeder: das Sechseck mit dem Dreieck in der Mitte, dessen Ecken
   * ueber Speichen an den Sechseckecken haengen. Die Zahl steht auf der
   * vorderen Flaeche, also im Dreieck.
   */
  d20: {
    umriss: vieleck(6, 48),
    facetten: [
      'M50,74 L27,34 L73,34 Z',
      linie(50, 74, 50, 98),
      linie(27, 34, 8.4, 26),
      linie(73, 34, 91.6, 26),
      linie(27, 34, 50, 2),
      linie(73, 34, 50, 2),
      linie(27, 34, 8.4, 74),
      linie(73, 34, 91.6, 74)
    ],
    zahlY: 60,
    zahlGroesse: 24
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
   * Der eigene Wuerfel — ein Zehneck mit Speichen.
   *
   * Zwei Versuche davor lagen daneben: ein Achteck sah neben dem runden d100
   * gleich aus, ein Stern war so auffaellig, dass er wie eine besondere
   * Wuerfelart wirkte statt wie ein einstellbarer Platzhalter. Ein Vieleck mit
   * vielen Ecken sagt „irgendeine Seitenzahl" — und die Speichen halten es
   * vom Kreis auseinander.
   */
  custom: {
    // Ein Achteck mit Speichen zu jeder Ecke — das liest sich als Rad und
    // damit als „irgendeine Seitenzahl". Drei Formen davor lagen daneben: ein
    // schlichtes Achteck und ein Zehneck sahen neben dem runden d100 gleich
    // aus, ein Stern wirkte wie eine besondere Wuerfelart statt wie ein
    // Platzhalter.
    umriss: vieleck(8, 47, 22.5),
    facetten: [
      vieleck(8, 26, 22.5),
      linie(50, 3, 50, 24),
      linie(81.2, 18.8, 67.4, 32.6),
      linie(97, 50, 76, 50),
      linie(81.2, 81.2, 67.4, 67.4),
      linie(50, 97, 50, 76),
      linie(18.8, 81.2, 32.6, 67.4),
      linie(3, 50, 24, 50),
      linie(18.8, 18.8, 32.6, 32.6)
    ],
    zahlY: 58,
    zahlGroesse: 23
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
