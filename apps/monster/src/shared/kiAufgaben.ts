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
import { ROLLEN, THEMEN, text, type Sprache } from './tabellen';

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
        ? 'Liefere höchstens drei Fähigkeiten. Mehr liest am Tisch niemand.'
        : 'Deliver at most three features. Nobody reads more at the table.'
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
  readonly faehigkeiten: readonly { name: string; text: string }[];
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
          return { name: alsText(f?.name), text: alsText(f?.text) };
        })
        .filter((f) => f.name && f.text)
        // Drei sind genug, auch wenn das Modell fuenf schickt.
        .slice(0, 3)
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
