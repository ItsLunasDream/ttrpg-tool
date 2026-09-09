import { describe, expect, it } from 'vitest';
import {
  boundsOf,
  chaikin,
  circleIntersectsRect,
  hasExtent,
  dashPolyline,
  douglasPeucker,
  dropDensePoints,
  pointSegmentDistanceSq,
  polylineLength,
  segmentIntersectsRect,
  strokeBand,
  smoothStroke,
  translatePoints,
} from '@/model/geometry';

describe('pointSegmentDistanceSq', () => {
  it('misst senkrecht auf die Strecke', () => {
    expect(pointSegmentDistanceSq(5, 3, 0, 0, 10, 0)).toBe(9);
  });

  it('fällt auf die Endpunkte zurück, wenn das Lot daneben liegt', () => {
    expect(pointSegmentDistanceSq(-4, 0, 0, 0, 10, 0)).toBe(16);
    expect(pointSegmentDistanceSq(14, 0, 0, 0, 10, 0)).toBe(16);
  });

  it('kommt mit einer Strecke der Länge null zurecht', () => {
    expect(pointSegmentDistanceSq(3, 4, 0, 0, 0, 0)).toBe(25);
  });
});

describe('douglasPeucker', () => {
  it('reduziert eine gerade Linie auf ihre Endpunkte', () => {
    const line = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
    expect(douglasPeucker(line, 0.1)).toEqual([0, 0, 5, 0]);
  });

  it('behält Punkte, die weiter als die Toleranz abweichen', () => {
    const bend = [0, 0, 5, 10, 10, 0];
    expect(douglasPeucker(bend, 1)).toEqual(bend);
    expect(douglasPeucker(bend, 20)).toEqual([0, 0, 10, 0]);
  });

  it('behält immer Anfang und Ende', () => {
    const pts = [0, 0, 1, 0.05, 2, -0.05, 3, 0.02, 9, 0];
    const out = douglasPeucker(pts, 1);
    expect(out.slice(0, 2)).toEqual([0, 0]);
    expect(out.slice(-2)).toEqual([9, 0]);
  });

  it('lässt zu kurze oder tolerierte Eingaben unverändert', () => {
    expect(douglasPeucker([0, 0, 1, 1], 5)).toEqual([0, 0, 1, 1]);
    expect(douglasPeucker([0, 0, 5, 5, 9, 1], 0)).toEqual([0, 0, 5, 5, 9, 1]);
  });

  it('verkraftet sehr lange Striche ohne Stapelüberlauf', () => {
    // Iterative Umsetzung — rekursiv würde das hier knallen.
    const pts: number[] = [];
    for (let i = 0; i < 60000; i++) pts.push(i, Math.sin(i / 500) * 40);
    const out = douglasPeucker(pts, 1);
    expect(out.length).toBeGreaterThan(4);
    expect(out.length).toBeLessThan(pts.length);
  });
});

describe('chaikin', () => {
  it('rundet Ecken ab und behält bei offenen Linien die Enden', () => {
    const corner = [0, 0, 10, 0, 10, 10];
    const out = chaikin(corner, 1);
    expect(out.slice(0, 2)).toEqual([0, 0]);
    expect(out.slice(-2)).toEqual([10, 10]);
    // Der Eckpunkt selbst ist verschwunden — die Koordinate 10 kommt anderswo
    // sehr wohl noch vor, deshalb muss paarweise geprüft werden.
    const points: Array<[number, number]> = [];
    for (let i = 0; i < out.length; i += 2) points.push([out[i], out[i + 1]]);
    expect(points).not.toContainEqual([10, 0]);
    expect(out.length).toBeGreaterThan(corner.length);
  });

  it('lässt bei geschlossenen Formen keine Endpunkte stehen', () => {
    const square = [0, 0, 10, 0, 10, 10, 0, 10];
    const out = chaikin(square, 1, true);
    expect(out.length).toBe(square.length * 2);
  });

  it('lässt zu kurze Eingaben in Ruhe', () => {
    expect(chaikin([0, 0, 1, 1], 2)).toEqual([0, 0, 1, 1]);
  });
});

describe('dropDensePoints', () => {
  it('wirft zu dicht liegende Zwischenpunkte weg', () => {
    const pts = [0, 0, 0.1, 0, 0.2, 0, 10, 0];
    expect(dropDensePoints(pts, 1)).toEqual([0, 0, 10, 0]);
  });

  it('behält Anfang und Ende auch bei sehr großer Mindestdistanz', () => {
    const out = dropDensePoints([0, 0, 1, 1, 2, 2], 1000);
    expect(out).toEqual([0, 0, 2, 2]);
  });
});

describe('smoothStroke', () => {
  it('gibt bei Glättung 0 die Rohpunkte zurück', () => {
    const pts = [0, 0, 3, 7, 9, 2, 14, 5];
    expect(smoothStroke(pts, 0)).toEqual(pts);
  });

  it('verringert bei zappeligen Eingaben die Gesamtlänge', () => {
    const jitter: number[] = [];
    for (let i = 0; i < 200; i++) jitter.push(i, (i % 2 === 0 ? 3 : -3));
    const smoothed = smoothStroke(jitter, 1);
    expect(polylineLength(smoothed)).toBeLessThan(polylineLength(jitter));
  });

  it('lässt sehr kurze Striche unangetastet', () => {
    expect(smoothStroke([0, 0, 1, 1], 1)).toEqual([0, 0, 1, 1]);
  });
});

describe('boundsOf und translatePoints', () => {
  it('bestimmt die Hülle', () => {
    expect(boundsOf([0, 0, 10, -5, 3, 8])).toEqual({ minX: 0, minY: -5, maxX: 10, maxY: 8 });
  });

  it('liefert für leere Eingaben null', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('verschiebt, ohne die Eingabe zu verändern', () => {
    const src = [0, 0, 10, 10];
    const moved = translatePoints(src, 5, -2);
    expect(moved).toEqual([5, -2, 15, 8]);
    expect(src).toEqual([0, 0, 10, 10]);
  });
});

describe('polylineLength', () => {
  it('summiert die Segmente', () => {
    expect(polylineLength([0, 0, 3, 4, 3, 14])).toBe(15);
  });

  it('ist bei einem einzelnen Punkt null', () => {
    expect(polylineLength([1, 1])).toBe(0);
  });
});

describe('segmentIntersectsRect', () => {
  const rect = { minX: 10, minY: 10, maxX: 20, maxY: 20 };

  it('erkennt eine Strecke, die quer hindurchgeht', () => {
    expect(segmentIntersectsRect(0, 15, 30, 15, rect)).toBe(true);
  });

  it('erkennt eine Strecke, die ganz innen liegt', () => {
    expect(segmentIntersectsRect(12, 12, 18, 18, rect)).toBe(true);
  });

  it('erkennt eine Strecke, die nur hineinragt', () => {
    expect(segmentIntersectsRect(0, 15, 15, 15, rect)).toBe(true);
  });

  it('lehnt eine Strecke daneben ab', () => {
    expect(segmentIntersectsRect(0, 0, 5, 5, rect)).toBe(false);
    expect(segmentIntersectsRect(30, 0, 30, 30, rect)).toBe(false);
  });

  it('lehnt eine Strecke ab, deren Hülle das Rechteck zwar trifft, sie selbst aber nicht', () => {
    // Diagonale weit unterhalb: die Hülle überlappt, die Strecke nicht.
    expect(segmentIntersectsRect(0, 30, 30, 100, rect)).toBe(false);
  });

  it('behandelt einen Punkt (Strecke der Länge null)', () => {
    expect(segmentIntersectsRect(15, 15, 15, 15, rect)).toBe(true);
    expect(segmentIntersectsRect(0, 0, 0, 0, rect)).toBe(false);
  });

  it('zählt die Kante als Treffer', () => {
    expect(segmentIntersectsRect(10, 0, 10, 30, rect)).toBe(true);
  });
});

describe('dashPolyline', () => {
  const len = (seg: number[]) => {
    let d = 0;
    for (let i = 0; i + 3 < seg.length; i += 2) {
      d += Math.hypot(seg[i + 2] - seg[i], seg[i + 3] - seg[i + 1]);
    }
    return d;
  };

  it('gibt ohne Muster den Zug unverändert zurück', () => {
    const p = [0, 0, 100, 0];
    expect(dashPolyline(p, [])).toEqual([p]);
    expect(dashPolyline(p, [0, 0])).toEqual([p]);
  });

  it('zerlegt eine gerade Strecke in Striche der Musterlänge', () => {
    // 100 lang, Muster 10 an / 10 aus -> 5 Striche zu je 10.
    const teile = dashPolyline([0, 0, 100, 0], [10, 10]);
    expect(teile).toHaveLength(5);
    for (const teil of teile) expect(len(teil)).toBeCloseTo(10);
  });

  it('beginnt mit einem sichtbaren Strich', () => {
    const teile = dashPolyline([0, 0, 100, 0], [10, 10]);
    expect(teile[0].slice(0, 2)).toEqual([0, 0]);
  });

  it('trägt das Muster über Ecken hinweg ab', () => {
    // Zwei Segmente zu je 10 bei Muster 15/5: der erste Strich läuft um die Ecke.
    const teile = dashPolyline([0, 0, 10, 0, 10, 10], [15, 5]);
    expect(teile[0]).toEqual([0, 0, 10, 0, 10, 5]);
  });

  it('schließt den Ring, wenn closed gesetzt ist', () => {
    const offen = dashPolyline([0, 0, 100, 0, 100, 100], [10, 10], false);
    const zu = dashPolyline([0, 0, 100, 0, 100, 100], [10, 10], true);
    // Die Rückkante steuert weitere Striche bei.
    expect(zu.length).toBeGreaterThan(offen.length);
  });

  it('kommt mit einem zu kurzen Zug zurecht', () => {
    expect(dashPolyline([0, 0], [10, 10])).toEqual([]);
    expect(dashPolyline([], [10, 10])).toEqual([]);
  });

  it('überspringt Punkte, die aufeinanderliegen', () => {
    const teile = dashPolyline([0, 0, 0, 0, 100, 0], [10, 10]);
    expect(teile).toHaveLength(5);
  });
});

describe('strokeBand', () => {
  const flaeche = (pts: number[]) => {
    let a = 0;
    for (let i = 0; i < pts.length; i += 2) {
      const j = (i + 2) % pts.length;
      a += pts[i] * pts[j + 1] - pts[j] * pts[i + 1];
    }
    return Math.abs(a) / 2;
  };

  it('macht aus einer Strecke ein Rechteck der doppelten halben Breite', () => {
    const band = strokeBand([0, 0, 100, 0], 5);
    // Ein gefüllter Linienzug hätte keine Fläche; das Band hat 100 x 10.
    expect(flaeche(band)).toBeCloseTo(1000, 0);
  });

  it('liefert doppelt so viele Punkte wie die Mittellinie', () => {
    expect(strokeBand([0, 0, 10, 0, 20, 0], 3)).toHaveLength(12);
  });

  it('verjüngt zum Anfang hin, wenn taper gesetzt ist', () => {
    const band = strokeBand([0, 0, 100, 0], 10, 1);
    // Erster Punkt oben liegt auf der Mittellinie, letzter bei voller Breite.
    expect(band[1]).toBeCloseTo(0);
    expect(Math.abs(band[3])).toBeGreaterThan(0);
  });

  it('gibt zu kurze oder breitenlose Eingaben unverändert zurück', () => {
    expect(strokeBand([0, 0], 5)).toEqual([0, 0]);
    expect(strokeBand([0, 0, 10, 0], 0)).toEqual([0, 0, 10, 0]);
  });

  it('folgt einem Knick, ohne sich selbst zu durchdringen', () => {
    const band = strokeBand([0, 0, 50, 0, 50, 50], 4);
    expect(flaeche(band)).toBeGreaterThan(500);
  });
});

describe('circleIntersectsRect', () => {
  const rect = { minX: 0, minY: 0, maxX: 100, maxY: 100 };

  it('erkennt einen Kreis ganz innerhalb', () => {
    expect(circleIntersectsRect(50, 50, 5, rect)).toBe(true);
  });

  it('erkennt einen Mittelpunkt außerhalb, dessen Kreis hineinreicht', () => {
    // Genau der Fall, um den es bei den Lichtern geht: die Fackel steht neben
    // der Karte und leuchtet trotzdem auf sie.
    expect(circleIntersectsRect(-30, 50, 40, rect)).toBe(true);
    expect(circleIntersectsRect(130, 130, 50, rect)).toBe(true);
  });

  it('verneint einen Kreis, der die Fläche nicht erreicht', () => {
    expect(circleIntersectsRect(-30, 50, 20, rect)).toBe(false);
    expect(circleIntersectsRect(200, 200, 100, rect)).toBe(false);
  });

  it('zählt die Berührung an der Kante mit', () => {
    expect(circleIntersectsRect(-20, 50, 20, rect)).toBe(true);
    expect(circleIntersectsRect(-20, 50, 19.999, rect)).toBe(false);
  });

  it('behandelt einen Radius von 0 wie einen Punkt', () => {
    expect(circleIntersectsRect(50, 50, 0, rect)).toBe(true);
    expect(circleIntersectsRect(-1, 50, 0, rect)).toBe(false);
  });
});

describe('hasExtent', () => {
  it('verneint zwei Punkte auf derselben Stelle', () => {
    // Genau so entsteht eine Wand ohne Länge: zwei Klicks ohne Zeigerbewegung
    // dazwischen, auf einem Tablett der Normalfall.
    expect(hasExtent([100, 100, 100, 100])).toBe(false);
    expect(hasExtent([100, 100, 100.2, 99.9])).toBe(false);
  });

  it('bejaht, sobald ein Punkt weit genug weg liegt', () => {
    expect(hasExtent([0, 0, 10, 0])).toBe(true);
    expect(hasExtent([0, 0, 0, 0, 0, 5])).toBe(true);
  });

  it('verneint einen einzelnen Punkt und nichts', () => {
    expect(hasExtent([5, 5])).toBe(false);
    expect(hasExtent([])).toBe(false);
  });

  it('nimmt die Toleranz ernst', () => {
    expect(hasExtent([0, 0, 3, 0], 5)).toBe(false);
    expect(hasExtent([0, 0, 6, 0], 5)).toBe(true);
  });
});
