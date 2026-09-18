/**
 * Wo ein Monster lebt.
 *
 * Vorher wurde die Umgebung frei gezogen, unabhaengig von allem anderen.
 * Das ging lange gut und fiel dann in einem Bild der Oberflaeche auf: ein
 * Elementar mit Schwimmbewegung und „Amphibisch", eingetragen in der Wueste.
 * Beides fuer sich stimmte, zusammen ergab es keinen Sinn.
 *
 * Die Umgebung wird deshalb ZULETZT entschieden und richtet sich nach dem,
 * was schon feststeht:
 *
 *   1. das THEMA — ein Drache gehoert nicht in eine Kanalisation, ein
 *      Konstrukt nicht in einen Feenhain.
 *   2. die BEWEGUNG — wer schwimmt, braucht Wasser; wer graebt, braucht
 *      Boden, in den das geht.
 *
 * Das ist dieselbe Reihenfolge wie beim Rest des Erzeugers: erst das Wesen,
 * dann der Ort, an dem es funktioniert.
 *
 * Plattformfrei, wie alles unter `shared`.
 */

import type { Bewegung } from './bewegung';
import type { Paar, Sprache } from './tabellen';
import { text } from './tabellen';

export interface Umgebung {
  readonly id: string;
  readonly name: Paar;
  /**
   * Zu welchen Themen sie passt. Leer heisst: zu allen.
   *
   * Absichtlich grosszuegig: ausgeschlossen wird nur, was am Tisch
   * stutzig macht, nicht alles, was ungewoehnlich ist. Ein Untoter im
   * Gebirge ist selten und kein Fehler.
   */
  readonly themen?: readonly string[];
  /** Gibt es genug Wasser, dass eine Schwimmbewegung etwas nuetzt? */
  readonly wasser: boolean;
  /** Laesst sich der Boden durchgraben? */
  readonly grabbar: boolean;
}

export const UMGEBUNGEN: readonly Umgebung[] = [
  {
    id: 'wald', name: { de: 'Wald', en: 'forest' }, wasser: true, grabbar: true,
    themen: ['bestie', 'fee', 'pflanze', 'humanoid', 'untot', 'drache']
  },
  {
    id: 'hain', name: { de: 'Feenhain', en: 'fae grove' }, wasser: true, grabbar: true,
    themen: ['fee', 'pflanze', 'bestie']
  },
  {
    id: 'unterreich', name: { de: 'Unterreich', en: 'underdark' }, wasser: true, grabbar: true,
    themen: ['aberration', 'untot', 'konstrukt', 'elementar', 'humanoid', 'unhold', 'bestie']
  },
  {
    id: 'stadt', name: { de: 'Stadt', en: 'city' }, wasser: false, grabbar: false,
    themen: ['humanoid', 'untot', 'konstrukt', 'unhold', 'fee']
  },
  {
    id: 'turm', name: { de: 'Zauberturm', en: 'wizard’s tower' }, wasser: false, grabbar: false,
    themen: ['konstrukt', 'aberration', 'humanoid', 'untot']
  },
  {
    id: 'tiefsee', name: { de: 'Tiefsee', en: 'deep sea' }, wasser: true, grabbar: false,
    themen: ['bestie', 'aberration', 'elementar', 'drache']
  },
  {
    id: 'kueste', name: { de: 'Küste', en: 'coast' }, wasser: true, grabbar: true,
    themen: ['bestie', 'humanoid', 'drache', 'elementar', 'fee', 'aberration']
  },
  {
    id: 'sumpf', name: { de: 'Sumpf', en: 'swamp' }, wasser: true, grabbar: true,
    themen: ['bestie', 'pflanze', 'untot', 'aberration', 'fee', 'drache']
  },
  {
    id: 'wueste', name: { de: 'Wüste', en: 'desert' }, wasser: false, grabbar: true,
    themen: ['bestie', 'konstrukt', 'untot', 'elementar', 'drache', 'humanoid']
  },
  {
    id: 'gebirge', name: { de: 'Gebirge', en: 'mountains' }, wasser: false, grabbar: true,
    themen: ['drache', 'bestie', 'elementar', 'humanoid', 'konstrukt', 'unhold']
  },
  {
    id: 'eiswueste', name: { de: 'Eiswüste', en: 'ice waste' }, wasser: false, grabbar: true,
    themen: ['elementar', 'bestie', 'drache', 'untot', 'humanoid']
  },
  {
    id: 'vulkan', name: { de: 'Vulkanland', en: 'volcanic land' }, wasser: false, grabbar: true,
    themen: ['elementar', 'drache', 'unhold', 'konstrukt']
  },
  {
    id: 'aschewueste', name: { de: 'Aschewüste', en: 'ash waste' }, wasser: false, grabbar: true,
    themen: ['unhold', 'untot', 'elementar', 'drache']
  },
  {
    id: 'ruinen', name: { de: 'Ruinen', en: 'ruins' }, wasser: false, grabbar: true,
    themen: ['untot', 'konstrukt', 'humanoid', 'unhold', 'aberration', 'pflanze']
  },
  {
    id: 'grabmal', name: { de: 'Grabmal', en: 'tomb' }, wasser: false, grabbar: true,
    themen: ['untot', 'konstrukt', 'unhold', 'aberration']
  },
  {
    id: 'ebene', name: { de: 'Ebene', en: 'plains' }, wasser: false, grabbar: true,
    themen: ['bestie', 'humanoid', 'drache', 'untot', 'konstrukt', 'pflanze']
  }
];

function kann(bewegung: Bewegung, art: string): boolean {
  return bewegung.gangarten.some((gangart) => gangart.art === art);
}

/**
 * Passt diese Umgebung zu dieser Bewegung?
 *
 * Nur zwei harte Regeln, und beide fallen am Tisch sofort auf: eine
 * Schwimmbewegung ohne Wasser und eine Grabbewegung auf Pflaster. Fliegen
 * bleibt ungeprueft — auch unter der Erde fliegt allerhand, und eine Regel,
 * die zu viel ausschliesst, macht aus zwoelf Umgebungen drei.
 */
export function passtZurBewegung(umgebung: Umgebung, bewegung: Bewegung): boolean {
  if (kann(bewegung, 'schwimmen') && !umgebung.wasser) return false;
  if (kann(bewegung, 'graben') && !umgebung.grabbar) return false;
  return true;
}

export function passtZumThema(umgebung: Umgebung, themaId: string): boolean {
  return !umgebung.themen || umgebung.themen.includes(themaId);
}

/**
 * Die Umgebung zu einem Wesen.
 *
 * Drei Anlaeufe, absteigend streng. Der letzte nimmt irgendeine — lieber
 * eine unpassende Umgebung als gar keine, und dass es je dazu kommt,
 * schliesst der Test darunter aus.
 */
export function umgebungFuer(themaId: string, bewegung: Bewegung, rng: () => number): Umgebung {
  const beides = UMGEBUNGEN.filter(
    (u) => passtZumThema(u, themaId) && passtZurBewegung(u, bewegung)
  );
  const nurThema = UMGEBUNGEN.filter((u) => passtZumThema(u, themaId));
  const auswahl = beides.length > 0 ? beides : nurThema.length > 0 ? nurThema : UMGEBUNGEN;
  return auswahl[Math.floor(rng() * auswahl.length)];
}

export function umgebungName(umgebung: Umgebung, sprache: Sprache): string {
  return text(umgebung.name, sprache);
}
