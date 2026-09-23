/**
 * Die Begriffe, die im offiziellen Regeltext zu Verweisen werden.
 *
 * EINE BEWUSSTE AUSWAHL, KEINE ABLEITUNG. Wuerde jedes Wort, das zufaellig
 * auch ein Glossareintrag ist, zum Verweis, waere ein Regeltext ein blaues
 * Feld: „Damage", „Creature", „Target" stehen in fast jedem Satz. Hier
 * stehen nur Begriffe, bei denen man am Tisch wirklich nachschlaegt:
 * Zustaende, benannte Aktionen, Wirkungsbereiche, Gefahren und eine Handvoll
 * Spielbegriffe mit eigener Regel.
 *
 * Die Schreibweisen kommen aus den Namen des Glossars, nicht aus dem Kopf —
 * ein Tippfehler hier waere ein Begriff, der nie gefunden wird. Gross- und
 * Kleinschreibung zaehlt: das Regelwerk schreibt Spielbegriffe gross
 * („Prone", „Difficult Terrain"), und genau daran erkennt man, dass der
 * Begriff gemeint ist und nicht das Alltagswort.
 */
import { GLOSSAR } from './glossar';

/**
 * Begriffe, die unter ihrem Namen erkannt werden.
 *
 * Nicht dabei, obwohl Eintraege: die zu allgemeinen („Damage", „Creature",
 * „Speed", „Action", „Attack Roll" steht ohnehin fast ueberall) und die, deren
 * Name ein Alltagswort ist („Ally", „Enemy", „Target", „Search").
 */
const ALS_NAME = [
  // Zustaende
  'blinded', 'charmed', 'deafened', 'exhaustion', 'frightened', 'grappled', 'incapacitated',
  'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned',
  'unconscious',
  // Wirkungsbereiche
  'cone', 'cube', 'cylinder', 'emanation', 'line', 'sphere',
  // Gefahren
  'burning', 'dehydration', 'falling', 'malnutrition', 'suffocation',
  // Haltungen
  'friendly', 'hostile', 'indifferent',
  // Spielbegriffe mit eigener Regel
  'advantage', 'disadvantage', 'difficult-terrain', 'heavily-obscured', 'lightly-obscured',
  'bright-light', 'dim-light', 'darkness', 'darkvision', 'blindsight', 'truesight',
  'tremorsense', 'cover', 'concentration', 'opportunity-attacks', 'temporary-hit-points',
  'hit-point-dice', 'bloodied', 'critical-hit', 'death-saving-throw', 'heroic-inspiration',
  'resistance', 'vulnerability', 'immunity', 'short-rest', 'long-rest', 'surprise',
  'difficulty-class', 'passive-perception', 'unarmed-strike', 'occupied-space',
  'unoccupied-space', 'high-jump', 'long-jump', 'knocking-out-a-creature'
] as const;

/**
 * Aktionen werden nur in ihrer Form als Aktion erkannt: „the Dash action",
 * „die Spurt‑Aktion". „Help", „Search" oder „Magic" allein sind zu oft
 * einfach Woerter.
 */
const ALS_AKTION = [
  'attack', 'dash', 'disengage', 'dodge', 'help', 'hide', 'influence', 'magic', 'ready',
  'search', 'study', 'utilize'
] as const;

export interface Verweisform {
  /** Die Kennung des Glossareintrags. */
  readonly ziel: string;
  /** Die Schreibweise, genau so, wie sie im Text steht. */
  readonly form: string;
}

function eintrag(id: string) {
  const gefunden = GLOSSAR.find((e) => e.id === id);
  if (!gefunden) throw new Error(`Verweisbegriff ohne Glossareintrag: ${id}`);
  return gefunden;
}

let zwischenspeicher: { de: Verweisform[]; en: Verweisform[] } | null = null;

/**
 * Alle Schreibweisen je Sprache, die laengsten zuerst — damit „Difficult
 * Terrain" vor einem kuerzeren Begriff greift, der darin steckt.
 */
export function verweisformen(sprache: 'de' | 'en'): readonly Verweisform[] {
  if (!zwischenspeicher) {
    const de: Verweisform[] = [];
    const en: Verweisform[] = [];
    for (const id of ALS_NAME) {
      const e = eintrag(id);
      en.push({ ziel: id, form: e.name.en });
      de.push({ ziel: id, form: e.name.de });
      // Im Deutschen steht ein mehrwortiger Begriff mitten im Satz klein:
      // „ein Bereich ist schwieriges Gelände".
      if (/\s/.test(e.name.de)) {
        de.push({ ziel: id, form: e.name.de[0].toLowerCase() + e.name.de.slice(1) });
      }
    }
    for (const id of ALS_AKTION) {
      const e = eintrag(id);
      en.push({ ziel: id, form: `${e.name.en} action` });
      // Der Bindestrich im Deutschen ist mal der geschuetzte, mal der normale.
      de.push({ ziel: id, form: `${e.name.de}‑Aktion` });
      de.push({ ziel: id, form: `${e.name.de}-Aktion` });
    }
    const ordnen = (liste: Verweisform[]) => liste.sort((a, b) => b.form.length - a.form.length);
    zwischenspeicher = { de: ordnen(de), en: ordnen(en) };
  }
  return zwischenspeicher[sprache];
}
