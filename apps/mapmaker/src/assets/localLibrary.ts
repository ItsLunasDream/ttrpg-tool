/**
 * Kleine Bibliothek neben der Karte.
 *
 * Bausteine und Ebenen-Vorlagen sind dasselbe Muster: eine Liste benannter
 * Dinge, die dem Benutzer gehören und nicht der Karte, im Speicher gehalten und
 * im localStorage gesichert. Zweimal geschrieben liefe es auseinander — genau
 * das war `VttKind` schon einmal.
 *
 * Jeder Zugriff auf den Speicher ist eingefasst: im privaten Modus wirft er,
 * und eine Vorlage ist keine Arbeit, für die das Programm stehenbleiben darf.
 */

export interface LocalLibrary<T extends { id: string }> {
  all(): T[];
  get(id: string): T | null;
  /** Falsch heißt: aufgenommen, aber nicht dauerhaft gesichert. */
  add(item: T): boolean;
  remove(id: string): void;
  patch(id: string, patch: Partial<T>): void;
  onChange(fn: () => void): () => void;
  /** Nur für Tests. */
  reset(): void;
}

interface Ablage<T> {
  version: number;
  items: T[];
}

export function createLocalLibrary<T extends { id: string }>(
  storageKey: string,
  version: number,
  /** Prüft einen geladenen Eintrag; Unbrauchbares fliegt beim Laden raus. */
  isUsable: (item: T) => boolean,
): LocalLibrary<T> {
  const listeners = new Set<() => void>();

  const laden = (): T[] => {
    try {
      const roh = localStorage.getItem(storageKey);
      if (!roh) return [];
      const daten = JSON.parse(roh) as Ablage<T>;
      if (!daten || daten.version !== version || !Array.isArray(daten.items)) return [];
      return daten.items.filter((x) => x && typeof x.id === 'string' && isUsable(x));
    } catch {
      /* Kaputt oder gesperrt — dann eben ohne. */
      return [];
    }
  };

  let items = laden();

  /**
   * Sichert und meldet, ob es geklappt hat.
   *
   * Der Rückgabewert ist kein Zierrat: der Speicher fasst nur wenige Megabyte,
   * und ein Baustein aus hunderten Objekten kann ihn sprengen. Wer hier still
   * scheiterte, verlöre seine Arbeit erst beim nächsten Start.
   */
  const speichern = (): boolean => {
    try {
      const daten: Ablage<T> = { version, items };
      localStorage.setItem(storageKey, JSON.stringify(daten));
      return true;
    } catch {
      return false;
    }
  };

  const melden = () => {
    for (const fn of listeners) fn();
  };

  return {
    all: () => items,
    get: (id) => items.find((x) => x.id === id) ?? null,
    /**
     * Nimmt den Eintrag auf. Falsch heißt: aufgenommen, aber nicht gesichert.
     *
     * Der Eintrag bleibt bewusst *drin*, auch wenn der Speicher ihn nicht
     * annimmt. Er zurückzuweisen hieße, die gerade zusammengestellte Sitzecke
     * im selben Moment wegzuwerfen — im privaten Modus, wo `localStorage`
     * schlicht wirft, wäre die Bibliothek damit unbenutzbar. So funktioniert
     * sie für diese Sitzung, und der Aufrufer sagt, dass sie den Neustart
     * nicht überlebt.
     */
    add(item) {
      items = [...items, item];
      const ok = speichern();
      melden();
      return ok;
    },
    remove(id) {
      items = items.filter((x) => x.id !== id);
      speichern();
      melden();
    },
    patch(id, patch) {
      items = items.map((x) => (x.id === id ? { ...x, ...patch } : x));
      speichern();
      melden();
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    reset() {
      items = [];
      speichern();
      melden();
    },
  };
}
