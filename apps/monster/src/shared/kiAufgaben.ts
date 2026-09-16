/**
 * Was die KI beisteuert — und was mit ihren Zahlen passiert.
 *
 * Sie schreibt, was Tabellen schlecht koennen: Namen mit Eigenart,
 * Faehigkeiten, eine Beschreibung. Die Zahlen darf sie vorschlagen, aber sie
 * entscheiden nichts — sie gehen durch dieselbe Pruefung wie ein
 * Handeintrag.
 *
 * DIE REGEL, die alles Weitere bestimmt:
 *
 *   von der KI       →  automatisch nachziehen, und es dazusagen
 *   von Hand/Wuerfel →  nur ein Warnhinweis mit den empfohlenen Werten
 *
 * Das ist keine Willkuer, sondern folgt daraus, wer die Entscheidung
 * getroffen hat. Die KI hat 137 Trefferpunkte nicht gewollt, sie hat eine
 * Zahl geraten, die ungefaehr passen sollte. Wer sie selbst eingetippt hat,
 * hat sich etwas dabei gedacht.
 */

import { pruefe, zieheNach, type Befund, type Werte } from './pruefung';
import { richtwert } from './richtwerte';
import type { Monster } from './erzeuge';
import { ROLLEN, THEMEN, text, type Kategorie, type Sprache } from './tabellen';

export const KI_AUFGABEN = ['name', 'faehigkeit', 'beschreibung', 'monster'] as const;
export type KiAufgabe = (typeof KI_AUFGABEN)[number];

/** Womit die KI nicht ueberzogen werden darf. Eine Antwort ist kein Roman. */
export const MAX_ZEICHEN = 900;

export interface Frage {
  readonly aufgabe: KiAufgabe;
  readonly cr: string;
  readonly themaId?: string;
  readonly rolleId?: string;
  /** Der bisherige Stand, wenn es einen gibt — fuer einzelne Felder. */
  readonly monster?: Monster | null;
  /**
   * Was der Mensch sich thematisch wuenscht, in eigenen Worten.
   *
   * „Ein Sumpfhexer, der Ertrunkene ruft" sagt mehr als jede Auswahlliste,
   * und genau dafuer ist eine KI da. Die Zahlen beruehrt das nicht: die
   * kommen aus den Richtwerten und werden nachgerechnet wie immer.
   */
  readonly wunsch?: string;
}

export function systemAnweisung(sprache: Sprache): string {
  const de = sprache !== 'en';
  return de
    ? [
        'Du hilfst beim Bau von Monstern für ein Pen-&-Paper-Rollenspiel.',
        'Du antwortest ausschließlich mit JSON, ohne Text davor oder danach.',
        `Jeder einzelne Text bleibt unter ${MAX_ZEICHEN} Zeichen.`,
        'Du lieferst Namen, Fähigkeiten und Beschreibungen — kurz und am Tisch vorlesbar.',
        'Zahlen darfst du vorschlagen; sie werden nachgerechnet und gegebenenfalls berichtigt.',
        'Keine Regelzitate, keine Seitenangaben, keine geschützten Eigennamen.'
      ].join('\n')
    : [
        'You help build monsters for a tabletop roleplaying game.',
        'You answer with JSON only, no text before or after.',
        `Every single text stays under ${MAX_ZEICHEN} characters.`,
        'You deliver names, features and descriptions — short and readable at the table.',
        'You may suggest numbers; they will be recomputed and corrected if needed.',
        'No rules quotations, no page references, no protected names.'
      ].join('\n');
}

/**
 * Wie viele Faehigkeiten die KI liefern soll, nach Grad.
 *
 * Frueher stand hier „hoechstens drei", fuer jeden Grad. Auf Grad 30 ist
 * das zu wenig: ein Endgegner mit drei Zeilen ist keiner. Die Zahlen folgen
 * denen des Erzeugers, damit KI-Monster und gewuerfelte gleich dicht sind.
 */
function anzahlWunsch(crWert: number): string {
  if (crWert < 3) return '2';
  if (crWert < 6) return '3';
  if (crWert < 10) return '4';
  if (crWert < 15) return '5';
  if (crWert < 21) return '6';
  return '7';
}

/** Welche Schluessel die Antwort tragen muss. */
export const FELDER: Record<KiAufgabe, readonly string[]> = {
  name: ['name'],
  faehigkeit: ['name', 'text'],
  beschreibung: ['beschreibung'],
  monster: ['name', 'beschreibung', 'faehigkeiten', 'tp', 'rk', 'schadenProRunde', 'angriffsbonus']
};

export function anweisung(frage: Frage, sprache: Sprache): string {
  const de = sprache !== 'en';
  const ziel = richtwert(frage.cr) ?? richtwert('1')!;
  const thema = THEMEN.find((t) => t.id === frage.themaId);
  const rolle = ROLLEN.find((r) => r.id === frage.rolleId);

  const teile: string[] = [];
  teile.push(
    de ? `Herausforderungsgrad: ${ziel.cr}` : `Challenge rating: ${ziel.cr}`,
    thema ? (de ? `Art: ${text(thema.name, sprache)}` : `Type: ${text(thema.name, sprache)}`) : '',
    rolle ? (de ? `Rolle im Kampf: ${text(rolle.name, sprache)} — ${text(rolle.satz, sprache)}` : `Combat role: ${text(rolle.name, sprache)} — ${text(rolle.satz, sprache)}`) : ''
  );

  /*
   * Der eigene Wunsch steht GANZ OBEN, vor Grad, Art und Rolle.
   *
   * Modelle gewichten den Anfang staerker, und hier ist der freie Text das
   * Eigentliche — die Auswahllisten sagen nur, in welchen Rahmen es passen
   * muss.
   */
  if (frage.wunsch && frage.wunsch.trim() !== '') {
    teile.unshift(
      de ? `Gewünscht ist: ${frage.wunsch.trim().slice(0, MAX_ZEICHEN)}` : `Wanted: ${frage.wunsch.trim().slice(0, MAX_ZEICHEN)}`,
      ''
    );
  }

  if (frage.monster) {
    const m = frage.monster;
    teile.push(
      '',
      de ? 'Das steht schon:' : 'What is already there:',
      `- ${m.name} (${m.thema}, ${m.rolle})`,
      ...m.faehigkeiten.map((f) => `- ${f.name}: ${f.text}`)
    );
  }

  if (frage.aufgabe === 'monster') {
    /*
     * Die Richtwerte gehen MIT in die Anfrage.
     *
     * Nicht, weil die Antwort daran gebunden waere — sie wird ohnehin
     * nachgerechnet —, sondern damit das Modell nicht voellig danebenliegt.
     * Eine Antwort, die um den Faktor drei daneben liegt, muss so stark
     * nachgezogen werden, dass von ihrem Entwurf nichts uebrig bleibt.
     */
    teile.push(
      '',
      de ? 'Übliche Werte für diesen Grad (Richtwerte, keine Vorgabe):' : 'Typical values for this rating (guidance, not a rule):',
      `- ${de ? 'Trefferpunkte' : 'Hit points'}: ${ziel.tp} (${ziel.tpVon}–${ziel.tpBis})`,
      `- ${de ? 'Rüstungsklasse' : 'Armor class'}: ${ziel.rk}`,
      `- ${de ? 'Schaden pro Runde' : 'Damage per round'}: ${ziel.schadenProRunde}`,
      `- ${de ? 'Angriffsbonus' : 'Attack bonus'}: +${ziel.bonus}`,
      '',
      de
        ? `Liefere ${anzahlWunsch(ziel.wert)} Fähigkeiten. Jede bekommt ein Feld "kategorie" mit genau einem dieser Werte: passiv, aktion, bonusaktion, reaktion.`
        : `Deliver ${anzahlWunsch(ziel.wert)} features. Each gets a "kategorie" field with exactly one of: passiv, aktion, bonusaktion, reaktion.`
    );
  }

  teile.push(
    '',
    de ? 'Antworte als JSON mit genau diesen Schlüsseln:' : 'Answer as JSON with exactly these keys:',
    FELDER[frage.aufgabe].join(', ')
  );

  return teile.filter((zeile) => zeile !== '').join('\n');
}

/* ---------- Die Antwort lesen ---------- */

/**
 * Die Kategorie aus der Antwort, mit einem sicheren Rueckfall.
 *
 * Modelle erfinden hier gern eigene Woerter („trait", „special"). Was nicht
 * in der Liste steht, wird passiv — das ist der Abschnitt, in dem eine
 * falsch einsortierte Faehigkeit am wenigsten Schaden anrichtet. Legendaer
 * ist bewusst NICHT erlaubt: darueber entscheidet der Schalter, nicht das
 * Modell.
 */
function alsKategorie(wert: unknown): Kategorie {
  const erlaubt: readonly Kategorie[] = ['passiv', 'aktion', 'bonusaktion', 'reaktion'];
  const gelesen = typeof wert === 'string' ? wert.trim().toLowerCase() : '';
  return (erlaubt as readonly string[]).includes(gelesen) ? (gelesen as Kategorie) : 'passiv';
}

function alsText(wert: unknown): string {
  return typeof wert === 'string' ? wert.trim().slice(0, MAX_ZEICHEN) : '';
}

function alsZahl(wert: unknown): number | null {
  const zahl = typeof wert === 'number' ? wert : Number(wert);
  return Number.isFinite(zahl) ? Math.round(zahl) : null;
}

export interface RohMonster {
  readonly name: string;
  readonly beschreibung: string;
  readonly faehigkeiten: readonly { name: string; text: string; kategorie: Kategorie }[];
  readonly werte: Partial<Werte>;
}

/** Was die KI geschickt hat, in eine Form bringen — oder `null`, wenn nichts Brauchbares kam. */
export function uebernehmbar(aufgabe: KiAufgabe, gelesen: unknown): unknown {
  if (typeof gelesen !== 'object' || gelesen === null) return null;
  const o = gelesen as Record<string, unknown>;

  if (aufgabe === 'name') return alsText(o.name) || null;
  if (aufgabe === 'beschreibung') return alsText(o.beschreibung) || null;
  if (aufgabe === 'faehigkeit') {
    const name = alsText(o.name);
    const text = alsText(o.text);
    return name && text ? { name, text } : null;
  }

  const faehigkeiten = Array.isArray(o.faehigkeiten)
    ? o.faehigkeiten
        .map((eintrag) => {
          const f = eintrag as Record<string, unknown>;
          return {
            name: alsText(f?.name),
            text: alsText(f?.text),
            kategorie: alsKategorie(f?.kategorie)
          };
        })
        .filter((f) => f.name && f.text)
        // Acht sind die Obergrenze, auch wenn das Modell zwoelf schickt —
        // mehr liest am Tisch niemand.
        .slice(0, 8)
    : [];

  const name = alsText(o.name);
  if (!name) return null;

  // `Werte` ist unveraenderlich getippt, also wird hier gesammelt und erst
  // am Ende ein Objekt daraus gemacht.
  const gesammelt: Record<string, number> = {};
  for (const feld of ['tp', 'rk', 'schadenProRunde', 'angriffsbonus'] as const) {
    const zahl = alsZahl(o[feld]);
    if (zahl !== null) gesammelt[feld] = zahl;
  }
  const werte = gesammelt as Partial<Werte>;

  const roh: RohMonster = { name, beschreibung: alsText(o.beschreibung), faehigkeiten, werte };
  return roh;
}

export interface Nachgezogen {
  readonly werte: Werte;
  /** Was die KI geliefert hatte — fuer den Knopf „zurueck zum Vorschlag". */
  readonly vorschlagDerKi: Werte;
  /** Wurde etwas geaendert? */
  readonly berichtigt: boolean;
  readonly befundVorher: Befund;
}

/**
 * Die Zahlen einer KI-Antwort auf den Grad ziehen.
 *
 * Was fehlt, kommt aus den Richtwerten — ein Modell, das die
 * Ruestungsklasse vergisst, soll nicht das ganze Monster verhindern.
 *
 * Und das Ergebnis wird ZURUECKGEMELDET, nicht stillschweigend eingesetzt:
 * wer sieht, dass das Modell beim Schaden um vierzig Prozent danebenlag,
 * lernt etwas ueber seine Vorschlaege.
 */
export function zieheKiNach(roh: Partial<Werte>, cr: string): Nachgezogen {
  const ziel = richtwert(cr) ?? richtwert('1')!;
  const vorschlagDerKi: Werte = {
    tp: roh.tp ?? ziel.tp,
    rk: roh.rk ?? ziel.rk,
    schadenProRunde: roh.schadenProRunde ?? ziel.schadenProRunde,
    angriffsbonus: roh.angriffsbonus ?? ziel.bonus,
    legendaer: roh.legendaer
  };
  const befundVorher = pruefe(vorschlagDerKi, cr);
  const werte = zieheNach(vorschlagDerKi, cr);
  const berichtigt =
    werte.tp !== vorschlagDerKi.tp ||
    werte.rk !== vorschlagDerKi.rk ||
    werte.schadenProRunde !== vorschlagDerKi.schadenProRunde ||
    werte.angriffsbonus !== vorschlagDerKi.angriffsbonus;
  return { werte, vorschlagDerKi, berichtigt, befundVorher };
}
