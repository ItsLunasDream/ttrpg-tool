/**
 * Zuletzt geöffnete Karten.
 *
 * **Warum das nicht bloß eine Namensliste ist.** Ein Browser kann eine Datei
 * nicht von sich aus öffnen, nur weil er ihren Pfad kennt — es gibt keinen Pfad.
 * Wiederöffnen geht allein über das Handle der File System Access API, und das
 * lässt sich zwar in IndexedDB ablegen, aber nicht in `localStorage`: es ist
 * kein JSON, es überlebt nur den strukturierten Klon.
 *
 * Daraus folgt der Zuschnitt: Wo es die API nicht gibt (Firefox, Safari),
 * bleibt die Liste leer und die Oberfläche zeigt sie gar nicht erst. Eine Liste
 * aus Namen, die auf Klick nur den Dateidialog öffnet, verspricht etwas, das sie
 * nicht hält — dieselbe Überlegung wie beim Quicksave-Knopf.
 *
 * Das Recht, eine Datei zu lesen, überlebt den Neustart des Browsers nicht
 * unbedingt. Beim Öffnen wird es deshalb geprüft und, wenn nötig, neu erfragt;
 * ein abgelehntes Recht ist kein Fehler, sondern eine Antwort.
 */

/** Ein Eintrag der Liste. */
export interface RecentEntry {
  /** Schlüssel in der Datenbank. Beim ersten Merken vergeben. */
  id: string;
  name: string;
  /** Zuletzt geöffnet oder gespeichert. */
  time: number;
  handle: FileSystemFileHandle;
}

/** Was der Speicher können muss. Für Tests austauschbar. */
export interface RecentBackend {
  all(): Promise<RecentEntry[]>;
  put(entry: RecentEntry): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Mehr Einträge liest niemand mehr; das Menü würde zur Liste. */
export const MAX_RECENT = 8;

/**
 * Neueste zuerst, auf `max` gekürzt.
 *
 * Eigene Funktion, weil genau hier die Fehler sitzen: doppelte Einträge und
 * eine Liste, die still weiterwächst.
 */
export function orderRecent(entries: RecentEntry[], max = MAX_RECENT): RecentEntry[] {
  return [...entries].sort((a, b) => b.time - a.time).slice(0, max);
}

interface PermissionfulHandle extends FileSystemFileHandle {
  queryPermission?: (opts: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
  requestPermission?: (opts: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
}

/**
 * Darf gelesen werden? Fragt nach, wenn das Recht abgelaufen ist.
 *
 * `requestPermission` verlangt eine Benutzeraktion — der Aufruf hängt deshalb
 * am Klick auf den Listeneintrag und nicht am Aufbau des Menüs.
 */
async function darfLesen(handle: FileSystemFileHandle): Promise<boolean> {
  const h = handle as PermissionfulHandle;
  if (!h.queryPermission) return true;
  if ((await h.queryPermission({ mode: 'read' })) === 'granted') return true;
  if (!h.requestPermission) return false;
  return (await h.requestPermission({ mode: 'read' })) === 'granted';
}

export interface RecentFiles {
  list(): Promise<RecentEntry[]>;
  /** Merkt eine Datei; ein vorhandener Eintrag derselben Datei rückt nach vorn. */
  remember(handle: FileSystemFileHandle, time?: number): Promise<void>;
  /**
   * Öffnet einen Eintrag.
   *
   * `null` heißt: nicht zu haben — Recht verweigert oder Datei verschwunden.
   * Im zweiten Fall fliegt der Eintrag raus; einen toten Eintrag stehen zu
   * lassen hieße, ihn beim nächsten Mal wieder anzubieten.
   */
  open(entry: RecentEntry): Promise<File | null>;
  forget(id: string): Promise<void>;
  clear(): Promise<void>;
}

export function createRecentFiles(backend: RecentBackend, max = MAX_RECENT): RecentFiles {
  const list = async () => orderRecent(await backend.all(), max);

  return {
    list,

    async remember(handle, time = Date.now()) {
      const alle = await backend.all();
      let id = `recent-${time.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      // Dieselbe Datei erkennt nur `isSameEntry` — zwei Handles auf eine Datei
      // sind verschiedene Objekte, und Namen sind nicht eindeutig.
      for (const e of alle) {
        try {
          if (await e.handle.isSameEntry(handle)) {
            id = e.id;
            break;
          }
        } catch {
          // Ein Handle, das nicht einmal mehr vergleichbar ist, ist erledigt.
          await backend.remove(e.id);
        }
      }
      await backend.put({ id, name: handle.name, time, handle });

      // Überzählige wegräumen, sonst wächst die Datenbank still weiter.
      const behalten = new Set(orderRecent(await backend.all(), max).map((e) => e.id));
      for (const e of await backend.all()) if (!behalten.has(e.id)) await backend.remove(e.id);
    },

    async open(entry) {
      if (!(await darfLesen(entry.handle))) return null;
      try {
        return await entry.handle.getFile();
      } catch {
        await backend.remove(entry.id);
        return null;
      }
    },

    forget: (id) => backend.remove(id),

    async clear() {
      for (const e of await backend.all()) await backend.remove(e.id);
    },
  };
}

// --- IndexedDB -------------------------------------------------------------

const DB_NAME = 'ttrpg-map-editor';
const STORE = 'recent';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function anfrage<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Der echte Speicher.
 *
 * Jeder Zugriff schluckt seine Fehler und liefert einen leeren Stand: im
 * privaten Fenster ist IndexedDB gesperrt, und daran soll das Datei-Menü nicht
 * scheitern — es ist eine Bequemlichkeit, keine Funktion.
 */
export const indexedDbBackend: RecentBackend = {
  async all() {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readonly');
      const rows = await anfrage(tx.objectStore(STORE).getAll() as IDBRequest<RecentEntry[]>);
      db.close();
      return rows.filter((r) => r && r.handle && typeof r.name === 'string');
    } catch {
      return [];
    }
  },
  async put(entry) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readwrite');
      await anfrage(tx.objectStore(STORE).put(entry));
      db.close();
    } catch {
      // Nicht gemerkt zu werden ist verschmerzlich.
    }
  },
  async remove(id) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE, 'readwrite');
      await anfrage(tx.objectStore(STORE).delete(id));
      db.close();
    } catch {
      // s.o.
    }
  },
};

/** Gibt es überhaupt etwas zu merken? */
export function isRecentSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.showOpenFilePicker === 'function' &&
    typeof indexedDB !== 'undefined'
  );
}

export const recentFiles = createRecentFiles(indexedDbBackend);
