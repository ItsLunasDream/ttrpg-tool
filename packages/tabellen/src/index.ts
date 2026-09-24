/**
 * Zufallstabellen, die die Spielleitung selbst schreibt.
 *
 * Der Unterschied zu den Tabellen im Monster Creator, im NPC Creator und in
 * der Inspirationshilfe ist grundsaetzlich und traegt die ganze Form dieses
 * Pakets: **dort schreiben wir die Tabellen, hier schreibt sie die
 * Spielleitung.** Also sind sie nicht zweisprachig — was jemand hinschreibt,
 * kommt so zurueck, wie es dasteht —, sie liegen in der Ablage statt im
 * Quelltext, und pruefen laesst sich nur ihre Form, nicht ihr Inhalt.
 *
 * Das Werkzeug an der Sache ist die Verschachtelung: ein Eintrag darf auf
 * eine andere Tabelle zeigen. Damit ist jede Tabelle zugleich Ergebnis und
 * Baustein — wer einmal „Taschenkram" geschrieben hat, benutzt es in jeder
 * Bande, jedem Wirtshaus, jeder Leiche.
 *
 * Plattformfrei: nur Daten und reine Funktionen, der Zufall wird
 * hineingereicht. Wer die Tabellen von der Platte holt, tut das im
 * Hauptprozess.
 *
 * Siehe `docs/loot.md`.
 */
import { parseDiceExpression, rollExpression, type RandomSource } from '@suite/dice';
import { schluessel } from '@suite/eintraege';

export type { RandomSource };

/**
 * Ein Eintrag einer Tabelle.
 *
 * `von`/`bis` sind die Spanne auf dem Wuerfel der Tabelle („1-3"). Wer keine
 * Spannen schreibt, bekommt Gleichverteilung — und das ist der Normalfall,
 * denn die meisten Tabellen entstehen als Liste und nicht als Rechnung.
 */
export interface Eintrag {
  /**
   * Was herauskommt. Darf Wuerfel enthalten (`2d6 × 10 Kupfer`) und
   * Verweise auf andere Tabellen (`[Taschenkram]`).
   */
  readonly text: string;
  readonly von?: number;
  readonly bis?: number;
}

export interface Tabelle {
  readonly id: string;
  readonly name: string;
  /**
   * Der Wuerfel der Tabelle, etwa `1d100`. Fehlt er, entscheidet die Anzahl
   * der Eintraege: gleichverteilt, jeder gleich wahrscheinlich.
   */
  readonly wuerfel?: string;
  readonly eintraege: readonly Eintrag[];
  /**
   * Ohne Zuruecklegen: innerhalb einer Wurfreihe kommt kein Eintrag zweimal,
   * bis die Tabelle erschoepft ist. Eine Eigenschaft der Tabelle, nicht des
   * Wurfs — „die zwoelf Wirtshausgaeste sind zwoelf verschiedene".
   */
  readonly ohneZuruecklegen?: boolean;
  /**
   * Weitere Namen, unter denen ein Verweis die Tabelle findet — etwa der
   * Name in der anderen Sprache, damit „[Trinkets]" auch auf Deutsch trifft.
   */
  readonly aliase?: readonly string[];
}

/**
 * Was in einer Wurfreihe schon gezogen wurde: je Tabelle die Nummern der
 * Eintraege. Nur Tabellen mit `ohneZuruecklegen` tragen hier etwas ein.
 */
export type Gezogen = Map<string, Set<number>>;

/**
 * Ein Verweis im Text: `[Taschenkram]`.
 *
 * Eckige Klammern, weil der Story Creator sie fuer Notizverweise schon
 * benutzt (`[[Notiz]]`) — wer das eine kennt, raet das andere richtig. Ein
 * einfaches Klammerpaar genuegt hier, die Tabellen stehen in ihrer eigenen
 * Welt.
 */
const VERWEIS = /\[([^\]\[]+)\]/g;

/**
 * Ein Wuerfelausdruck im Text, wahlweise mit Faktor: `2d6`, `1d4 × 10`.
 *
 * Der Faktor ist dabei, weil Beutetabellen so geschrieben werden — „2d6 × 10
 * Kupfer" ist die uebliche Form, und ohne ihn stuende dort „7 × 10 Kupfer"
 * und jemand muesste am Tisch multiplizieren. Genau das soll die Anwendung
 * abnehmen.
 *
 * Die Wortgrenzen sind wichtig: ohne sie faende der Ausdruck auch das `3d6`
 * mitten in einer Kennung.
 */
const WUERFEL_IM_TEXT = /\b(\d*[dw]\d+(?:\s*[+-]\s*\d+)?)(?:\s*[×x*]\s*(\d+))?\b/gi;

/**
 * Die deutsche Schreibweise in die, die `@suite/dice` liest: `2W6` → `2d6`.
 * Am Tisch schreibt man, wie man spricht; das Werkzeug soll beides nehmen.
 */
export function alsWuerfel(ausdruck: string): string {
  return ausdruck.replace(/(\d*)[wW](\d)/g, '$1d$2');
}

/** Wie tief verschachtelt gewuerfelt wird, bevor abgebrochen wird. */
export const TIEFE_DECKEL = 10;

/**
 * Wie viele Tabellen ein einzelner Wurf hoechstens aufloest.
 *
 * Gegen Explosionen: eine Zeile mit sechs Verweisen, die je sechs Verweise
 * haben, sind nach wenigen Ebenen Zehntausende Wuerfe und ein haengendes
 * Fenster (Testbericht: 29 Sekunden). Was darueber hinaus geht, bleibt als
 * `[Name]` stehen und wird als `zu-viel` vermerkt.
 */
export const WURF_DECKEL = 300;

/** Warum ein Zweig nicht zu Ende gewuerfelt wurde. */
export type Fehler = 'fehlt' | 'zu-tief' | 'kreis' | 'zu-viel';

/** Was ein Wurf ueber alle Ebenen mitfuehrt: der Weg hierher und das Restbudget. */
interface Lauf {
  readonly pfad: readonly string[];
  readonly rest: { n: number };
}

/**
 * Was ein Wurf ergeben hat.
 *
 * Der Baum steht hier, nicht nur der fertige Satz: bei drei Ebenen weiss
 * sonst niemand mehr, woher welches Stueck kam. Die Oberflaeche kann ihn
 * aufklappbar zeigen oder weglassen — aber sie kann ihn nicht nachtraeglich
 * erfinden.
 */
export interface Ergebnis {
  /** Der Name der Tabelle, auf die gewuerfelt wurde. */
  readonly tabelle: string;
  /** Der fertige Text: Wuerfel ausgerechnet, Verweise eingesetzt. */
  readonly text: string;
  /** Was der Wuerfel der Tabelle gezeigt hat, falls sie einen hat. */
  readonly wurf?: number;
  /** Die Wuerfe auf verwiesene Tabellen, in der Reihenfolge des Textes. */
  readonly teile: readonly Ergebnis[];
  /** Gesetzt, wenn dieser Zweig nicht zu Ende gewuerfelt wurde. */
  readonly fehler?: Fehler;
}

/**
 * Sucht eine Tabelle, so wie ein Mensch sie meint.
 *
 * Gross- und Kleinschreibung und Umlaute stoeren nicht — wer „taschenkram"
 * schreibt, meint „Taschenkram". Die Kennung gilt auch, damit ein Verweis
 * eine Umbenennung ueberlebt.
 */
export function finde(tabellen: readonly Tabelle[], gesucht: string): Tabelle | null {
  const ziel = schluessel(gesucht.trim());
  return (
    tabellen.find((tabelle) => tabelle.id === gesucht.trim()) ??
    tabellen.find((tabelle) => schluessel(tabelle.name) === ziel) ??
    tabellen.find((tabelle) => tabelle.aliase?.some((a) => schluessel(a) === ziel)) ??
    null
  );
}

/*
 * Maskieren mit `\`: `\2d4` bleibt „2d4", `\[` bleibt „[". Fuer Namen wie
 * „Ring of 2d4 Wishes" und fuer Text, der einfach eckige Klammern braucht.
 * Maskierte Zeichen werden fuer die Dauer des Wurfs durch Zeichen aus dem
 * privaten Bereich ersetzt, die weder Wuerfel noch Verweis sein koennen.
 */
const MASKE_START = 0xe000;
function maskiere(text: string): { text: string; zurueck: (t: string) => string } {
  const gemerkt: string[] = [];
  const maskiert = text.replace(/\\([\s\S])/g, (_, zeichen: string) => {
    gemerkt.push(zeichen);
    return String.fromCharCode(MASKE_START + gemerkt.length - 1);
  });
  if (gemerkt.length === 0) return { text, zurueck: (t) => t };
  return {
    text: maskiert,
    zurueck: (t) =>
      t.replace(/[\ue000-\uf8ff]/g, (z) => gemerkt[z.charCodeAt(0) - MASKE_START] ?? z)
  };
}

/** Maskiert Text so, dass ihn ein Wurf woertlich stehen laesst (Wuerfel, Klammern). */
export function woertlich(text: string): string {
  // Der Buchstabe des Wuerfels wird maskiert: aus „2d4" wird „2\\d4".
  return text.replace(/([\\[\]])/g, '\\$1').replace(/(\d)([dDwW])(\d)/g, '$1\\$2$3').replace(/(^|[^\w\\])([dDwW])(\d)/g, '$1\\$2$3');
}

/** Die Namen, auf die ein Text verweist, in der Reihenfolge ihres Auftretens. */
export function verweise(text: string): readonly string[] {
  return [...maskiere(text).text.matchAll(VERWEIS)].map((treffer) => treffer[1].trim());
}

/**
 * Rechnet die Wuerfel in einem Text aus.
 *
 * Ein Ausdruck, den `@suite/dice` nicht lesen kann, bleibt stehen. Am Tisch
 * ist ein Text mit einem ungewuerfelten `2d` darin brauchbar, eine
 * Fehlermeldung statt des ganzen Ergebnisses nicht.
 */
export function setzeWuerfel(text: string, rng: RandomSource): string {
  return text.replace(WUERFEL_IM_TEXT, (ganz, ausdruck: string, faktor?: string) => {
    try {
      parseDiceExpression(alsWuerfel(ausdruck));
    } catch {
      return ganz;
    }
    const summe = rollExpression(alsWuerfel(ausdruck), rng).total;
    return String(faktor ? summe * Number(faktor) : summe);
  });
}

/**
 * Waehlt einen Eintrag aus.
 *
 * Mit Spannen entscheidet der Wuerfel der Tabelle, ohne Spannen sind alle
 * gleich wahrscheinlich. Faellt der Wurf in keine Spanne — eine Tabelle mit
 * Loechern —, kommt der letzte Eintrag darunter zum Zug statt gar keiner:
 * eine lueckenhafte Tabelle ist ein Versehen beim Schreiben und soll am
 * Tisch trotzdem etwas ausspucken.
 */
export function waehle(
  tabelle: Tabelle,
  rng: RandomSource,
  gesperrt?: ReadonlySet<number>
): { eintrag: Eintrag; nummer: number; wurf?: number } | null {
  if (tabelle.eintraege.length === 0) return null;
  const nummerVon = (eintrag: Eintrag) => tabelle.eintraege.indexOf(eintrag);

  // Ohne Zuruecklegen: nur, was noch frei ist. Ist alles gezogen, beginnt
  // die Tabelle von vorn — am Tisch ist ein dreizehnter Gast besser als
  // keiner.
  if (gesperrt && gesperrt.size > 0 && gesperrt.size < tabelle.eintraege.length) {
    // Mit Wuerfel: so lange wuerfeln, bis ein freier Eintrag faellt. So
    // bleibt die Verteilung des Wuerfels erhalten (bei 2d6 ist die 7 weiter
    // die haeufigste), statt nach der Breite der Spannen zu gewichten.
    if (tabelle.wuerfel && tabelle.eintraege.some((e) => typeof e.von === 'number')) {
      for (let versuch = 0; versuch < 64; versuch += 1) {
        const ohne = waehle(tabelle, rng);
        if (ohne && !gesperrt.has(ohne.nummer)) return ohne;
      }
    }
    const frei = tabelle.eintraege.map((eintrag, nummer) => ({ eintrag, nummer })).filter((x) => !gesperrt.has(x.nummer));
    // Mit Spannen bleibt die Gewichtung erhalten: eine Spanne 1-3 zaehlt dreifach.
    const gewicht = (e: Eintrag) =>
      tabelle.wuerfel && typeof e.von === 'number' ? Math.max(1, (e.bis ?? e.von) - e.von + 1) : 1;
    const summe = frei.reduce((s, x) => s + gewicht(x.eintrag), 0);
    let rest = rng() * summe;
    for (const x of frei) {
      rest -= gewicht(x.eintrag);
      if (rest < 0) return { eintrag: x.eintrag, nummer: x.nummer };
    }
    const letzter = frei[frei.length - 1];
    return { eintrag: letzter.eintrag, nummer: letzter.nummer };
  }

  const mitSpanne = tabelle.eintraege.filter((eintrag) => typeof eintrag.von === 'number');
  if (mitSpanne.length === 0 || !tabelle.wuerfel) {
    const nummer = Math.min(Math.floor(rng() * tabelle.eintraege.length), tabelle.eintraege.length - 1);
    return { eintrag: tabelle.eintraege[nummer], nummer };
  }

  let wurf: number;
  try {
    wurf = rollExpression(alsWuerfel(tabelle.wuerfel), rng).total;
  } catch {
    const nummer = Math.min(Math.floor(rng() * tabelle.eintraege.length), tabelle.eintraege.length - 1);
    return { eintrag: tabelle.eintraege[nummer], nummer };
  }

  const getroffen = mitSpanne.find(
    (eintrag) => wurf >= (eintrag.von as number) && wurf <= (eintrag.bis ?? (eintrag.von as number))
  );
  if (getroffen) return { eintrag: getroffen, nummer: nummerVon(getroffen), wurf };

  // Ein Loch in der Tabelle: der naechstkleinere Eintrag faengt es auf.
  const darunter = [...mitSpanne]
    .filter((eintrag) => (eintrag.von as number) <= wurf)
    .sort((a, b) => (a.von as number) - (b.von as number))
    .pop();
  const aufgefangen = darunter ?? mitSpanne[0];
  return { eintrag: aufgefangen, nummer: nummerVon(aufgefangen), wurf };
}

/**
 * Wuerfelt auf eine Tabelle und loest die Verweise auf.
 *
 * Zwei Dinge duerfen dabei nicht passieren, und beide passieren beim
 * Umbauen, nicht aus Boesartigkeit:
 *
 * - **Kreise.** A zeigt auf B, B auf A. Ein Verweis auf eine Tabelle, die
 *   schon auf dem Weg hierher liegt, wird nicht aufgeloest (`kreis`). Dazu
 *   der Deckel bei `TIEFE_DECKEL` Ebenen (`zu-tief`) und bei `WURF_DECKEL`
 *   Tabellen je Wurf (`zu-viel`). Was abbricht, wird vermerkt und nicht
 *   verschwiegen.
 * - **Fehlende Ziele.** Eine Tabelle wird umbenannt, ein Verweis darauf
 *   bleibt stehen. Dann bleibt der Verweis als `[Name]` im Text sichtbar
 *   stehen und wird als `fehlt` vermerkt — der Rest wird trotzdem
 *   gewuerfelt. Am Tisch ist ein unvollstaendiges Ergebnis brauchbar, eine
 *   Fehlermeldung nicht.
 *
 * Bewusst KEIN Text in einer der beiden Sprachen: dieses Paket weiss nichts
 * von Sprachen, und ein deutsches „gibt es nicht" mitten im Ergebnis waere
 * genau die Sorte Text, die spaeter niemand uebersetzt findet. Die
 * Oberflaeche macht aus `fehler` eine Anzeige.
 */
export function wuerfle(
  tabelle: Tabelle,
  tabellen: readonly Tabelle[],
  rng: RandomSource,
  tiefe = 0,
  gezogen?: Gezogen,
  lauf: Lauf = { pfad: [], rest: { n: WURF_DECKEL } }
): Ergebnis {
  lauf.rest.n -= 1;
  const pfad = [...lauf.pfad, tabelle.id];
  const gesperrt = tabelle.ohneZuruecklegen ? gezogen?.get(tabelle.id) : undefined;
  const gewaehlt = waehle(tabelle, rng, gesperrt);
  if (!gewaehlt) {
    return { tabelle: tabelle.name, text: '', teile: [] };
  }
  if (tabelle.ohneZuruecklegen && gezogen) {
    let menge = gezogen.get(tabelle.id);
    // Erschoepft: von vorn, mit dem eben gezogenen als erstem.
    if (!menge || menge.size >= tabelle.eintraege.length) {
      menge = new Set();
      gezogen.set(tabelle.id, menge);
    }
    menge.add(gewaehlt.nummer);
  }

  const teile: Ergebnis[] = [];
  const { text: maskiert, zurueck } = maskiere(gewaehlt.eintrag.text);
  // Die Wuerfel nur im Text zwischen den Verweisen: ein Verweisname bleibt,
  // wie er ist („[d100 Trinkets]"), und ein eingesetztes Ergebnis wird nicht
  // ein zweites Mal gewuerfelt (Testbericht).
  let text = '';
  let bis = 0;
  for (const treffer of maskiert.matchAll(VERWEIS)) {
    const ganz = treffer[0];
    const name = zurueck(treffer[1]);
    text += zurueck(setzeWuerfel(maskiert.slice(bis, treffer.index), rng));
    bis = (treffer.index ?? 0) + ganz.length;
    const ziel = finde(tabellen, name);
    let fehler: Fehler | null = null;
    if (!ziel) fehler = 'fehlt';
    else if (pfad.includes(ziel.id)) fehler = 'kreis';
    else if (tiefe + 1 >= TIEFE_DECKEL) fehler = 'zu-tief';
    else if (lauf.rest.n <= 0) fehler = 'zu-viel';
    if (fehler || !ziel) {
      teile.push({ tabelle: name.trim(), text: '', teile: [], fehler: fehler ?? 'fehlt' });
      text += zurueck(ganz);
      continue;
    }
    const unten = wuerfle(ziel, tabellen, rng, tiefe + 1, gezogen, { pfad, rest: lauf.rest });
    teile.push(unten);
    text += unten.text;
  }
  text += zurueck(setzeWuerfel(maskiert.slice(bis), rng));

  return {
    tabelle: tabelle.name,
    text,
    ...(gewaehlt.wurf === undefined ? {} : { wurf: gewaehlt.wurf }),
    teile
  };
}

/**
 * Mehrmals auf dieselbe Tabelle, als eine Reihe.
 *
 * In einer Reihe gilt „ohne Zuruecklegen" fuer jede beteiligte Tabelle,
 * auch fuer verwiesene: fuenf Wuerfe auf eine Bande ziehen fuenf
 * verschiedene Stuecke Taschenkram, solange es genug gibt.
 */
export function wuerfleReihe(
  tabelle: Tabelle,
  tabellen: readonly Tabelle[],
  anzahl: number,
  rng: RandomSource,
  /** Von aussen, damit „ohne Zuruecklegen" ueber mehrere Klicks gilt. */
  gezogen: Gezogen = new Map()
): readonly Ergebnis[] {
  const heraus: Ergebnis[] = [];
  for (let i = 0; i < Math.max(0, Math.floor(anzahl)); i += 1) {
    heraus.push(wuerfle(tabelle, tabellen, rng, 0, gezogen));
  }
  return heraus;
}

/**
 * Alle Verweise einer Sammlung, die ins Leere gehen.
 *
 * Fuer die Oberflaeche: besser, man sieht die Luecke beim Bearbeiten als
 * mitten im Wurf am Spielabend.
 */
export function loseEnden(
  tabellen: readonly Tabelle[]
): readonly { readonly tabelle: string; readonly verweis: string }[] {
  const lose: { tabelle: string; verweis: string }[] = [];
  for (const tabelle of tabellen) {
    for (const eintrag of tabelle.eintraege) {
      for (const name of verweise(eintrag.text)) {
        if (!finde(tabellen, name)) lose.push({ tabelle: tabelle.name, verweis: name });
      }
    }
  }
  return lose;
}
