/**
 * Zuletzt geöffnete Karten.
 *
 * Geprüft wird über einen Speicher aus dem Arbeitsspeicher statt über
 * IndexedDB: die Datenbank gibt es im Testlauf nicht, und geprüft werden soll
 * ohnehin das Verhalten der Liste — dass dieselbe Datei nicht zweimal
 * auftaucht, dass die Liste nicht wächst, und dass ein toter Eintrag
 * verschwindet statt beim nächsten Mal wieder angeboten zu werden.
 */

import { describe, expect, it } from 'vitest';
import {
  createRecentFiles,
  orderRecent,
  type RecentBackend,
  type RecentEntry,
} from '@/io/recentFiles';

/** Ein Handle, das sich wie eines verhält, ohne Dateisystem. */
function handle(name: string, opts: { file?: unknown; recht?: PermissionState } = {}) {
  const h = {
    name,
    kind: 'file' as const,
    isSameEntry: async (other: { name: string }) => other.name === name,
    getFile: async () => {
      if (!opts.file) throw new DOMException('weg', 'NotFoundError');
      return opts.file;
    },
    queryPermission: async () => opts.recht ?? 'granted',
    requestPermission: async () => opts.recht ?? 'granted',
  };
  return h as unknown as FileSystemFileHandle;
}

function speicher(): RecentBackend & { rows: Map<string, RecentEntry> } {
  const rows = new Map<string, RecentEntry>();
  return {
    rows,
    all: async () => [...rows.values()],
    put: async (e) => void rows.set(e.id, e),
    remove: async (id) => void rows.delete(id),
  };
}

describe('Reihenfolge', () => {
  const e = (id: string, time: number): RecentEntry => ({
    id,
    time,
    name: id,
    handle: handle(id),
  });

  it('stellt die neueste Karte nach vorn', () => {
    expect(orderRecent([e('a', 1), e('c', 3), e('b', 2)]).map((x) => x.id)).toEqual([
      'c',
      'b',
      'a',
    ]);
  });

  it('kürzt auf die Höchstzahl', () => {
    const viele = Array.from({ length: 20 }, (_, i) => e(`x${i}`, i));
    expect(orderRecent(viele, 8)).toHaveLength(8);
    expect(orderRecent(viele, 8)[0].id).toBe('x19');
  });
});

describe('Liste der zuletzt geöffneten Karten', () => {
  it('merkt eine Datei', async () => {
    const s = speicher();
    const r = createRecentFiles(s);
    await r.remember(handle('burg.ttmap'), 1000);
    expect((await r.list()).map((e) => e.name)).toEqual(['burg.ttmap']);
  });

  /**
   * Der Fehler, gegen den das steht: zweimal dieselbe Datei zu öffnen füllte
   * die Liste mit Kopien, und die vier anderen Karten fielen hinten heraus.
   */
  it('führt dieselbe Datei nur einmal und rückt sie nach vorn', async () => {
    const s = speicher();
    const r = createRecentFiles(s);
    await r.remember(handle('a.ttmap'), 1000);
    await r.remember(handle('b.ttmap'), 2000);
    await r.remember(handle('a.ttmap'), 3000);

    const liste = await r.list();
    expect(liste.map((e) => e.name)).toEqual(['a.ttmap', 'b.ttmap']);
    expect(s.rows.size).toBe(2);
  });

  it('lässt die Liste nicht über die Höchstzahl wachsen', async () => {
    const s = speicher();
    const r = createRecentFiles(s, 3);
    for (let i = 0; i < 7; i++) await r.remember(handle(`k${i}.ttmap`), 1000 + i);
    expect((await r.list()).map((e) => e.name)).toEqual(['k6.ttmap', 'k5.ttmap', 'k4.ttmap']);
    // Auch im Speicher, nicht nur in der Anzeige.
    expect(s.rows.size).toBe(3);
  });

  it('liefert die Datei, wenn das Recht steht', async () => {
    const s = speicher();
    const r = createRecentFiles(s);
    await r.remember(handle('a.ttmap', { file: { name: 'a.ttmap' } }), 1);
    const [eintrag] = await r.list();
    expect(await r.open(eintrag)).toEqual({ name: 'a.ttmap' });
  });

  it('gibt nichts heraus, wenn das Leserecht verweigert wird — und behält den Eintrag', async () => {
    const s = speicher();
    const r = createRecentFiles(s);
    await r.remember(handle('a.ttmap', { file: {}, recht: 'denied' }), 1);
    const [eintrag] = await r.list();
    expect(await r.open(eintrag)).toBeNull();
    // Verweigert heißt nicht verschwunden: beim nächsten Mal darf wieder
    // gefragt werden.
    expect(await r.list()).toHaveLength(1);
  });

  it('wirft einen Eintrag weg, dessen Datei nicht mehr da ist', async () => {
    const s = speicher();
    const r = createRecentFiles(s);
    await r.remember(handle('weg.ttmap'), 1);
    const [eintrag] = await r.list();
    expect(await r.open(eintrag)).toBeNull();
    expect(await r.list()).toHaveLength(0);
  });

  it('vergisst einzeln und ganz', async () => {
    const s = speicher();
    const r = createRecentFiles(s);
    await r.remember(handle('a.ttmap'), 1);
    await r.remember(handle('b.ttmap'), 2);
    await r.forget((await r.list())[0].id);
    expect((await r.list()).map((e) => e.name)).toEqual(['a.ttmap']);
    await r.clear();
    expect(await r.list()).toHaveLength(0);
  });
});
