/**
 * Die Suche in der Sammlung: EIN Feld statt dreier.
 *
 * Zahlen liest sie als Herausforderungsgrad, Woerter als Name, Thema oder
 * Rolle, und „untot 4" als beides zusammen. Drei getrennte Felder waeren
 * genauer und langsamer; wer es genau will, klappt die Filterleiste auf.
 *
 * Rein und ohne Zustand, damit sie sich pruefen laesst — die Suche ist die
 * Stelle, an der eine Sammlung entweder brauchbar ist oder nicht.
 */

import type { Eintrag } from './ablage';
import { RICHTWERTE } from './richtwerte';
import { ROLLEN, THEMEN, text, type Sprache } from './tabellen';

export interface Anfrage {
  /** Was getippt wurde. */
  readonly text: string;
  /** Zusaetzlich aus der Filterleiste, wenn jemand sie benutzt. */
  readonly themaId?: string;
  readonly rolleId?: string;
}

/** Ein Wort, das als Grad gemeint sein koennte: „4", „1/2", „cr4", „cr 3-6". */
interface Gradwunsch {
  readonly von: number;
  readonly bis: number;
}

function alsZahl(wort: string): number | null {
  const bruch = /^(\d+)\/(\d+)$/.exec(wort);
  if (bruch) return Number(bruch[1]) / Number(bruch[2]);
  if (/^\d+$/.test(wort)) return Number(wort);
  return null;
}

/**
 * Liest aus den Woertern einen Gradwunsch heraus, falls einer darin steckt.
 *
 * Erkannt wird „5", „1/2", „cr5", „cr 5" und „3-6". Bewusst grosszuegig:
 * wer „cr" tippt, meint den Grad, und wer nur „5" tippt, fast immer auch —
 * ein Monster mit einer 5 im Namen ist die seltenere Absicht.
 */
export function gradAus(woerter: readonly string[]): Gradwunsch | null {
  for (const rohWort of woerter) {
    const wort = rohWort.replace(/^cr/, '');
    if (wort === '') continue;

    const spanne = /^(\d+)-(\d+)$/.exec(wort);
    if (spanne) return { von: Number(spanne[1]), bis: Number(spanne[2]) };

    const zahl = alsZahl(wort);
    if (zahl !== null) return { von: zahl, bis: zahl };
  }
  return null;
}

/** Der Zahlwert eines Grades, fuer den Vergleich. */
function gradwert(cr: string): number {
  return RICHTWERTE.find((e) => e.cr === cr)?.wert ?? Number.NaN;
}

/**
 * Passt der Eintrag zur Anfrage?
 *
 * Alle Teile muessen passen, nicht einer: wer „untot 4" tippt, will Untote
 * MIT Grad 4 und nicht alles Untote plus alles auf Grad 4.
 */
export function passt(eintrag: Eintrag, anfrage: Anfrage, sprache: Sprache): boolean {
  if (anfrage.themaId && eintrag.themaId !== anfrage.themaId) return false;
  if (anfrage.rolleId && eintrag.rolleId !== anfrage.rolleId) return false;

  const woerter = anfrage.text.toLowerCase().split(/\s+/).filter(Boolean);
  if (woerter.length === 0) return true;

  const wunsch = gradAus(woerter);
  if (wunsch) {
    const wert = gradwert(eintrag.cr);
    if (!(wert >= wunsch.von && wert <= wunsch.bis)) return false;
  }

  /*
   * Die uebrigen Woerter muessen im Text stehen — im Namen, im Thema oder in
   * der Rolle, in der gerade eingestellten Sprache UND in der Kennung. Wer
   * auf Englisch sucht, soll deutsch angelegte Monster trotzdem finden.
   */
  const thema = THEMEN.find((t) => t.id === eintrag.themaId);
  const rolle = ROLLEN.find((r) => r.id === eintrag.rolleId);
  const heuhaufen = [
    eintrag.name,
    eintrag.themaId,
    eintrag.rolleId,
    thema ? text(thema.name, sprache) : '',
    rolle ? text(rolle.name, sprache) : ''
  ]
    .join(' ')
    .toLowerCase();

  for (const wort of woerter) {
    // Was als Grad gelesen wurde, muss nicht auch im Text stehen.
    if (wunsch && (alsZahl(wort.replace(/^cr/, '')) !== null || /^\d+-\d+$/.test(wort) || wort === 'cr')) {
      continue;
    }
    if (!heuhaufen.includes(wort)) return false;
  }
  return true;
}

export type Sortierung = 'cr' | 'name' | 'geaendert';

/** Die Sammlung sortieren. Bei gleichem Wert entscheidet der Name, damit nichts springt. */
export function sortiere(eintraege: readonly Eintrag[], nach: Sortierung): Eintrag[] {
  const heraus = [...eintraege];
  heraus.sort((a, b) => {
    if (nach === 'name') return a.name.localeCompare(b.name);
    if (nach === 'geaendert') {
      const diff = b.geaendert.localeCompare(a.geaendert);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    }
    const diff = (gradwert(a.cr) || 0) - (gradwert(b.cr) || 0);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
  return heraus;
}

/** Suchen und sortieren in einem Schritt — was die Oberflaeche wirklich braucht. */
export function finde(
  eintraege: readonly Eintrag[],
  anfrage: Anfrage,
  nach: Sortierung,
  sprache: Sprache
): Eintrag[] {
  return sortiere(
    eintraege.filter((eintrag) => passt(eintrag, anfrage, sprache)),
    nach
  );
}
