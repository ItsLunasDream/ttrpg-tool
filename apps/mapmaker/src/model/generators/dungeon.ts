/**
 * Dungeon-Generator: Räume plus Korridor-Graph.
 *
 * Die Räume werden durch Verwerfen platziert (Versuch, Überschneidung prüfen,
 * verwerfen) statt über ein Unterteilungsverfahren. Das ergibt unregelmäßigere,
 * lebendigere Grundrisse — ein BSP-Baum füllt die Fläche zwar restlos, sieht
 * aber immer nach einem Schachbrett aus.
 */

import { Rng } from '../rng';
import { CellGrid, traceOutlines } from './grid';
import { emptyResult, type BaseOptions, type GeneratedMap } from './types';
import {
  assignRoomKinds,
  roomKindsFor,
  type DungeonTheme,
  type RoomKind,
} from './roomThemes';

export interface DungeonOptions extends BaseOptions {
  roomCount: number;
  roomMin: number;
  roomMax: number;
  corridorWidth: number;
  /** 0 = gerade Korridore, 1 = viele Knicke. */
  winding: number;
  /** Anteil der Durchgänge, die eine Tür bekommen. */
  doorChance: number;
  /**
   * Hauptschalter für jede Ausstattung.
   *
   * Aus heißt: keine Props, keine Lichter — unabhängig vom Thema. Das Thema
   * sagt, *was* in die Räume kommt, dieser Schalter, *ob* überhaupt etwas
   * hineinkommt. Ohne diese Rangfolge gäbe es zwei Regler, die beide
   * „Ausstattung" bedeuten und einander widersprechen können.
   */
  decorate: boolean;
  /**
   * Wie weit die Räume auseinanderliegen, 0–1.
   *
   * Steuert den Mindestabstand zwischen zwei Räumen. Bei 0 stoßen sie fast
   * aneinander und der Grundriss wird kompakt; bei 1 liegen Nester weit
   * verstreut und die Gänge werden lang. Auf einer festen Kartengröße heißt
   * mehr Abstand zwangsläufig: es passen weniger Räume hinein.
   */
  spread: number;
  /**
   * Ausstattung nach Thema.
   *
   * 'none' lässt die Räume leer, 'random' mischt alle Themen, sonst bleibt es
   * innerhalb eines Hauses — benachbarte Räume gehören dann zusammen.
   */
  theme: DungeonTheme;
  /**
   * Legt für jeden Raum eine GM-Notiz mit fortlaufender Nummer und Raumart an
   * — der klassische Kartenschlüssel aus gedruckten Abenteuern, hier aus den
   * bereits vergebenen Raumthemen statt frei erfunden. Nur mit Thema und
   * Ausstattung sinnvoll: ohne `zuordnung` gäbe es nichts zu benennen.
   */
  roomKey: boolean;
}

export function defaultDungeonOptions(): Omit<DungeonOptions, 'seed' | 'tileSize'> {
  return {
    cols: 48,
    rows: 34,
    roomCount: 9,
    roomMin: 4,
    roomMax: 9,
    corridorWidth: 1,
    winding: 0.35,
    doorChance: 0.75,
    decorate: true,
    spread: 0.3,
    theme: 'plain',
    roomKey: true,
  };
}

export interface Raum {
  c: number;
  r: number;
  w: number;
  h: number;
}

const mitte = (raum: Raum) => ({
  c: Math.floor(raum.c + raum.w / 2),
  r: Math.floor(raum.r + raum.h / 2),
});

export interface PlatzierteRaeume {
  raeume: Raum[];
  boden: CellGrid;
  raumMaske: CellGrid;
  /** Welcher Raum eine Bodenzelle beansprucht (Index in `raeume`), -1 heißt keiner. */
  raumIndex: Int32Array;
}

/**
 * Nur die Raumplatzierung, ohne Korridore, Wände oder Ausstattung.
 *
 * Eigene, exportierte Funktion — nicht nur Aufteilung der Übersicht wegen:
 * Tests brauchen die tatsächlich gesetzten Rechtecke, um zu prüfen, dass am
 * Ende *jeder* Raum eine Tür bekommt. Ohne diesen Seam ließe sich das nur am
 * Gesamtergebnis raten, nicht am einzelnen Raum nachweisen. Mit demselben
 * `Rng`, an derselben Stelle im Ablauf aufgerufen wie in `generateDungeon`,
 * liefert sie exakt dieselben Räume wie ein voller Lauf mit gleichem Seed.
 */
export function platziereRaeume(rng: Rng, opts: DungeonOptions): PlatzierteRaeume {
  const boden = new CellGrid(opts.cols, opts.rows);
  const raumMaske = new CellGrid(opts.cols, opts.rows);

  // --- Räume platzieren ----------------------------------------------------
  /**
   * Mindestabstand zwischen zwei Räumen, in Feldern.
   *
   * Eins ist das Minimum — ohne Lücke klebten zwei Räume zu einem zusammen.
   * Darüber macht `spread` den Grundriss weitläufig.
   */
  const wunschAbstand = 1 + Math.round(Math.max(0, Math.min(1, opts.spread)) * 6);
  /**
   * Bei kleinem Abstand die Kandidaten an bestehende Räume heranrücken.
   *
   * Nur den Abstand zu verringern ergäbe keine *Ballung*, sondern bloß
   * dichteren Zufall: die Räume verteilten sich weiter gleichmäßig über die
   * Karte, sie dürften sich nur näher kommen. Wer „nah beieinander" einstellt,
   * meint aber eine Anlage, nicht eine gleichmäßige Streuung.
   */
  const ballen = opts.spread < 0.35;

  /**
   * Räume mit einem gegebenen Mindestabstand setzen.
   *
   * Getrennte Funktion, weil sie mehrfach läuft: der gewünschte Abstand passt
   * nicht immer auf die Karte. Bei 48×34 Feldern und sieben Feldern Luft nach
   * jeder Seite bleiben für neun Räume schlicht keine Plätze übrig — vorher
   * kamen dann statt neun Räumen zwei heraus, ohne dass irgendwo stand,
   * warum. Jetzt wird der Abstand so weit zurückgenommen, bis die verlangte
   * Zahl zusammenkommt; weitläufig ist die Anlage dann eben so weitläufig,
   * wie die Karte es hergibt.
   */
  const setzeRaeume = (g: number): Raum[] => {
    const out: Raum[] = [];
    const versuche = opts.roomCount * 60;
    for (let i = 0; i < versuche && out.length < opts.roomCount; i++) {
      const w = rng.int(opts.roomMin, opts.roomMax);
      const h = rng.int(opts.roomMin, opts.roomMax);

      let c: number;
      let r: number;
      if (ballen && out.length > 0 && rng.bool(0.8)) {
        const nachbar = rng.pick(out);
        const reichweite = opts.roomMax + g + 3;
        c = Math.round(nachbar.c + rng.range(-reichweite, reichweite));
        r = Math.round(nachbar.r + rng.range(-reichweite, reichweite));
      } else {
        c = rng.int(1, Math.max(1, opts.cols - w - 2));
        r = rng.int(1, Math.max(1, opts.rows - h - 2));
      }
      c = Math.max(1, Math.min(c, Math.max(1, opts.cols - w - 2)));
      r = Math.max(1, Math.min(r, Math.max(1, opts.rows - h - 2)));

      const kollidiert = out.some(
        (o) => c - g < o.c + o.w + g && c + w + g > o.c - g && r - g < o.r + o.h + g && r + h + g > o.r - g,
      );
      if (kollidiert) continue;
      out.push({ c, r, w, h });
    }
    return out;
  };

  let raeume: Raum[] = [];
  for (let g = wunschAbstand; g >= 1; g--) {
    raeume = setzeRaeume(g);
    // Vier Fünftel genügen: auf den letzten Raum zu bestehen hieße, den
    // Abstand für ihn ganz aufzugeben.
    if (raeume.length >= Math.ceil(opts.roomCount * 0.8)) break;
  }
  /**
   * Welcher Raum eine Bodenzelle beansprucht, -1 heißt Korridor.
   *
   * Nur für die Türvergabe gebraucht: dort muss bekannt sein, zu welchem Raum
   * ein Durchgang gehört, nicht nur, dass es einer ist.
   */
  const raumIndex = new Int32Array(opts.cols * opts.rows).fill(-1);
  raeume.forEach((r, i) => {
    boden.fillRect(r.c, r.r, r.w, r.h);
    raumMaske.fillRect(r.c, r.r, r.w, r.h);
    for (let rr = r.r; rr < r.r + r.h; rr++) {
      for (let cc = r.c; cc < r.c + r.w; cc++) raumIndex[rr * opts.cols + cc] = i;
    }
  });

  return { raeume, boden, raumMaske, raumIndex };
}

export function generateDungeon(opts: DungeonOptions): GeneratedMap {
  const rng = new Rng(opts.seed);
  const ergebnis = emptyResult(opts.cols, opts.rows);
  const { raeume, boden, raumMaske, raumIndex } = platziereRaeume(rng, opts);

  if (raeume.length === 0) return ergebnis;

  // --- Korridore -----------------------------------------------------------
  // Prim: jeder noch nicht angebundene Raum wird mit dem nächstgelegenen
  // bereits angebundenen verbunden. So entsteht ein zusammenhängender Graph
  // ohne Ringe — Ringe kommen unten gezielt dazu.
  const verbunden = [raeume[0]];
  const offen = raeume.slice(1);
  /**
   * An welchen Raum wurde welcher angeschlossen?
   *
   * Index in `verbunden`-Reihenfolge, nicht in `raeume`: die Raumarten werden
   * entlang dieser Kette vergeben, und dabei muss der Elternraum vor dem Kind
   * an der Reihe sein. Die Prim-Schleife liefert genau diese Reihenfolge.
   */
  const eltern: number[] = [-1];
  // Breite w heißt: w Felder quer zum Gang. Bei geraden Breiten liegt der Gang
  // eine halbe Zelle außermittig — das ist unvermeidlich und fällt nicht auf.
  const vor = Math.floor((opts.corridorWidth - 1) / 2);
  const zurueck = Math.floor(opts.corridorWidth / 2);

  const grabe = (c: number, r: number) => {
    for (let dr = -vor; dr <= zurueck; dr++) {
      for (let dc = -vor; dc <= zurueck; dc++) boden.set(c + dc, r + dr, 1);
    }
  };

  const korridor = (a: Raum, b: Raum) => {
    const pa = mitte(a);
    const pb = mitte(b);
    // Zufällig erst waagerecht oder erst senkrecht — das ergibt die typischen
    // L-Gänge. `winding` fügt gelegentlich einen zusätzlichen Knick ein.
    const zuerstX = rng.bool();
    const knick = rng.next() < opts.winding;
    const zwischenC = knick ? rng.int(Math.min(pa.c, pb.c), Math.max(pa.c, pb.c)) : pb.c;
    const zwischenR = knick ? rng.int(Math.min(pa.r, pb.r), Math.max(pa.r, pb.r)) : pb.r;

    const waagerecht = (von: number, bis: number, r: number) => {
      for (let c = Math.min(von, bis); c <= Math.max(von, bis); c++) grabe(c, r);
    };
    const senkrecht = (von: number, bis: number, c: number) => {
      for (let r = Math.min(von, bis); r <= Math.max(von, bis); r++) grabe(c, r);
    };

    if (zuerstX) {
      waagerecht(pa.c, zwischenC, pa.r);
      senkrecht(pa.r, zwischenR, zwischenC);
      waagerecht(zwischenC, pb.c, zwischenR);
      senkrecht(zwischenR, pb.r, pb.c);
    } else {
      senkrecht(pa.r, zwischenR, pa.c);
      waagerecht(pa.c, zwischenC, zwischenR);
      senkrecht(zwischenR, pb.r, zwischenC);
      waagerecht(zwischenC, pb.c, pb.r);
    }
  };

  while (offen.length > 0) {
    let besteI = 0;
    let besteJ = 0;
    let besteDist = Infinity;
    for (let i = 0; i < offen.length; i++) {
      for (let j = 0; j < verbunden.length; j++) {
        const a = mitte(offen[i]);
        const b = mitte(verbunden[j]);
        const d = Math.abs(a.c - b.c) + Math.abs(a.r - b.r);
        if (d < besteDist) {
          besteDist = d;
          besteI = i;
          besteJ = j;
        }
      }
    }
    korridor(offen[besteI], verbunden[besteJ]);
    eltern.push(besteJ);
    verbunden.push(offen[besteI]);
    offen.splice(besteI, 1);
  }

  // Ein paar zusätzliche Verbindungen: ein reiner Baum zwingt Spielfiguren
  // immer denselben Weg zurück.
  const extra = Math.floor(raeume.length * 0.25);
  for (let i = 0; i < extra; i++) {
    const a = rng.pick(raeume);
    const b = rng.pick(raeume);
    if (a !== b) korridor(a, b);
  }

  // --- Wände aus dem Grundriss --------------------------------------------
  const s = opts.tileSize;
  for (const ring of traceOutlines(boden)) {
    const punkte = ring.map((v) => v * s);
    ergebnis.walls.push({ points: punkte, closed: true });
  }

  // Boden als Fläche je Ring; Löcher bleiben ausgespart, weil sie eigene
  // Ringe sind und der Renderer sie über die Umlaufrichtung nicht füllt.
  for (const ring of traceOutlines(boden)) {
    ergebnis.floors.push({ points: ring.map((v) => v * s), color: 0x50483c });
  }

  // --- Türen ---------------------------------------------------------------
  /**
   * Ein Durchgang ist dort, wo ein Korridorfeld unmittelbar an ein Raumfeld
   * grenzt. Die Tür sitzt auf der gemeinsamen Kante.
   *
   * `doorChance` entscheidet für jeden Durchgang einzeln — ein Raum mit nur
   * einem Durchgang landete damit bei jedem vierten Anlauf (Standard 75 %)
   * ganz ohne Tür: begehbar blieb er trotzdem, weil die Wandlücke rein aus dem
   * Grundriss entsteht und vom Würfel unabhängig ist, aber ohne Tür-Objekt
   * sieht die Lücke in Foundry aus wie ein Loch, nicht wie ein Zugang. Darum
   * erst alle Kandidaten je Raum sammeln und würfeln, und danach jedem Raum,
   * der dabei leer ausging, seine erste Tür erzwingen — der Würfel bleibt
   * damit die Regel, nicht die Ausnahme.
   */
  interface Turkandidat {
    bounds: [number, number, number, number];
    gesetzt: boolean;
  }
  const kandidatenProRaum: Turkandidat[][] = raeume.map(() => []);
  const gesehen = new Set<string>();
  for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      if (!boden.filled(c, r) || raumMaske.filled(c, r)) continue;
      for (const [dc, dr] of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ]) {
        if (!raumMaske.filled(c + dc, r + dr)) continue;
        const schluessel = `${Math.min(c, c + dc)},${Math.min(r, r + dr)},${dc},${dr}`;
        if (gesehen.has(schluessel)) continue;
        gesehen.add(schluessel);
        // Kante zwischen den beiden Feldern.
        const kx = dc === 1 ? c + 1 : c;
        const ky = dr === 1 ? r + 1 : r;
        const bounds: [number, number, number, number] =
          dc !== 0
            ? [kx * s, r * s, kx * s, (r + 1) * s]
            : [c * s, ky * s, (c + 1) * s, ky * s];
        const raum = raumIndex[(r + dr) * opts.cols + (c + dc)];
        kandidatenProRaum[raum].push({ bounds, gesetzt: rng.next() <= opts.doorChance });
      }
    }
  }
  for (const kandidaten of kandidatenProRaum) {
    if (kandidaten.length === 0) continue;
    // 0 bleibt die Ausnahme: „keine Türwahrscheinlichkeit" heißt ausdrücklich
    // gar keine Türen, nicht „mindestens eine trotzdem". Ab da an gilt: wer
    // Türen will, soll auch wirklich in jeden Raum eine bekommen.
    if (opts.doorChance > 0 && !kandidaten.some((k) => k.gesetzt)) {
      rng.pick(kandidaten).gesetzt = true;
    }
    for (const k of kandidaten) if (k.gesetzt) ergebnis.doors.push({ bounds: k.bounds });
  }

  // --- Ausstattung ---------------------------------------------------------
  /**
   * Möbel bekommen Plätze, nicht Koordinaten.
   *
   * Ein Tisch mittig, Stühle darum, Regale und Fässer an der Wand, Kleinkram
   * irgendwo: erst das macht aus einem Rechteck einen Speisesaal. Gleichmäßig
   * gestreut sähe jede Raumart gleich aus — und dann hätte das ganze Thema
   * keinen sichtbaren Effekt.
   */
  const arten = opts.decorate ? roomKindsFor(opts.theme) : [];
  const zuordnung = assignRoomKinds(rng, eltern, arten);

  const setze = (propId: string, x: number, y: number, gross = false) => {
    ergebnis.props.push({
      propId,
      x: x * s,
      y: y * s,
      scale: gross ? rng.range(0.95, 1.25) : rng.range(0.7, 1.15),
      rotation: rng.range(0, Math.PI * 2),
    });
  };

  /** Ein Raum wird nach seiner Art möbliert. */
  const moebliere = (raum: Raum, art: RoomKind) => {
    const m = { x: raum.c + raum.w / 2, y: raum.r + raum.h / 2 };

    // Mittelstück: nur, wenn der Raum groß genug ist, sonst steht es in der Tür.
    let hatMitte = false;
    if (art.center.length > 0 && raum.w >= 3 && raum.h >= 3) {
      // Große Möbel stehen gerade, nicht schräg — ein verdrehter Altar wirkt
      // wie umgefallen.
      ergebnis.props.push({
        propId: rng.pick(art.center),
        x: m.x * s,
        y: m.y * s,
        scale: rng.range(0.95, 1.3),
        rotation: rng.bool() ? 0 : Math.PI / 2,
      });
      hatMitte = true;
    }

    // Was sich um die Mitte gruppiert — Stühle um den Tisch.
    if (hatMitte && art.around.length > 0) {
      const n = Math.min(6, Math.max(2, Math.floor((raum.w + raum.h) / 3)));
      for (let i = 0; i < n; i++) {
        const w = (i / n) * Math.PI * 2 + rng.range(-0.2, 0.2);
        const d = rng.range(1.1, 1.6);
        const x = m.x + Math.cos(w) * d;
        const y = m.y + Math.sin(w) * d;
        if (x < raum.c + 0.5 || x > raum.c + raum.w - 0.5) continue;
        if (y < raum.r + 0.5 || y > raum.r + raum.h - 0.5) continue;
        setze(rng.pick(art.around), x, y);
      }
    }

    // An der Wand: auf dem inneren Ring des Raums.
    if (art.walls.length > 0) {
      const n = Math.max(1, Math.round((raum.w + raum.h) * 0.35));
      for (let i = 0; i < n; i++) {
        const seite = rng.int(0, 3);
        const rand = 0.6;
        let x: number;
        let y: number;
        if (seite === 0) {
          x = rng.range(raum.c + rand, raum.c + raum.w - rand);
          y = raum.r + rand;
        } else if (seite === 1) {
          x = rng.range(raum.c + rand, raum.c + raum.w - rand);
          y = raum.r + raum.h - rand;
        } else if (seite === 2) {
          x = raum.c + rand;
          y = rng.range(raum.r + rand, raum.r + raum.h - rand);
        } else {
          x = raum.c + raum.w - rand;
          y = rng.range(raum.r + rand, raum.r + raum.h - rand);
        }
        // Nicht in die Mitte hineinragen, wo schon ein Möbel steht.
        if (hatMitte && Math.hypot(x - m.x, y - m.y) < 1.2) continue;
        setze(rng.pick(art.walls), x, y);
      }
    }

    if (art.scatter.length > 0) {
      const n = rng.int(1, 4);
      for (let i = 0; i < n; i++) {
        setze(
          rng.pick(art.scatter),
          rng.range(raum.c + 0.5, raum.c + raum.w - 0.5),
          rng.range(raum.r + 0.5, raum.r + raum.h - 0.5),
        );
      }
    }

    if (rng.bool(art.lit)) {
      ergebnis.lights.push({
        x: m.x * s,
        y: m.y * s,
        range: Math.max(2, Math.min(raum.w, raum.h)),
      });
    }
  };

  if (zuordnung.length > 0) {
    // `verbunden` steht in derselben Reihenfolge wie `zuordnung`.
    verbunden.forEach((raum, i) => moebliere(raum, zuordnung[i]));
    if (opts.roomKey) {
      verbunden.forEach((raum, i) => {
        ergebnis.notes.push({
          x: (raum.c + raum.w / 2) * s,
          y: (raum.r + raum.h / 2) * s,
          nameKey: zuordnung[i].nameKey,
          index: i + 1,
        });
      });
    }
  } else if (opts.decorate) {
    // Ohne Thema bleibt es beim alten Streuwurf: Schutt und Knochen.
    const streu = ['rubble', 'bones', 'stone_small', 'web', 'pottery', 'crate'];
    for (const raum of raeume) {
      const n = rng.int(0, 3);
      for (let i = 0; i < n; i++) {
        setze(
          rng.pick(streu),
          rng.range(raum.c + 0.5, raum.c + raum.w - 0.5),
          rng.range(raum.r + 0.5, raum.r + raum.h - 0.5),
        );
      }
      if (rng.bool(0.5)) {
        const m = mitte(raum);
        ergebnis.lights.push({
          x: (m.c + 0.5) * s,
          y: (m.r + 0.5) * s,
          range: Math.max(2, Math.min(raum.w, raum.h)),
        });
      }
    }
  }

  return ergebnis;
}
