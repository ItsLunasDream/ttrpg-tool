/**
 * Die Bruecke des Encounter Creators.
 *
 * Der Renderer hat keinen Node-Zugriff; alles, was er darf, steht hier.
 */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Begegnung, Eintrag } from '../shared/ablage';

const api = {
  /**
   * Die Suche der Huelle hat einen Eintrag gewaehlt, der hier liegt.
   * Liefert eine Funktion zum Abmelden zurueck.
   */
  beiSuchtreffer: (hoerer: (kennung: string) => void) => {
    const lauscher = (_e: unknown, kennung: string) => hoerer(kennung);
    ipcRenderer.on(kanal('suche:zeigen'), lauscher);
    return () => {
      ipcRenderer.off(kanal('suche:zeigen'), lauscher);
    };
  },
  sammlung: {
    liste: () => ipcRenderer.invoke(kanal('liste')) as Promise<Eintrag[]>,
    lesen: (id: string) => ipcRenderer.invoke(kanal('lesen'), id) as Promise<Begegnung | null>,
    /**
     * `neu` entscheidet, ob eine freie Kennung gesucht wird.
     *
     * Beim Anlegen ja — zwei Begegnungen „Hinterhalt" sind der Normalfall
     * und duerfen einander nicht ueberschreiben. Beim Bearbeiten nein,
     * sonst zoege jedes Speichern eine Kopie nach sich.
     */
    speichern: (begegnung: Begegnung, neu: boolean) =>
      ipcRenderer.invoke(kanal('speichern'), begegnung, neu) as Promise<{
        ok: boolean;
        id: string;
        text: string;
      }>,
    loeschen: (id: string) => ipcRenderer.invoke(kanal('loeschen'), id) as Promise<boolean>
  },
  sprache: {
    melde: (sprache: string) => ipcRenderer.send(kanal('sprache:gewechselt'), sprache),
    beiWechsel: (hoerer: (sprache: string) => void) => {
      const lauscher = (_e: unknown, sprache: string) => hoerer(sprache);
      ipcRenderer.on(kanal('sprache:gesetzt'), lauscher);
      return () => {
        ipcRenderer.off(kanal('sprache:gesetzt'), lauscher);
      };
    }
  }
};

export type EncounterApi = typeof api;

contextBridge.exposeInMainWorld('encounter', api);

const verlaufsDokument = globalThis as unknown as {
  addEventListener(
    art: string,
    hoerer: (ereignis: { readonly button?: number; readonly key?: string; readonly altKey?: boolean }) => void,
    erfassen: boolean
  ): void;
};

function meldeVerlaufsTaste(richtung: 'zurueck' | 'vorwaerts', art: string): void {
  ipcRenderer.send('huelle:verlauf-taste', richtung, art);
}

for (const art of ['mouseup', 'auxclick', 'pointerup']) {
  verlaufsDokument.addEventListener(
    art,
    (ereignis) => {
      if (ereignis.button === 3) meldeVerlaufsTaste('zurueck', art);
      else if (ereignis.button === 4) meldeVerlaufsTaste('vorwaerts', art);
    },
    true
  );
}

verlaufsDokument.addEventListener(
  'keydown',
  (ereignis) => {
    if (!ereignis.altKey) return;
    if (ereignis.key === 'ArrowLeft') meldeVerlaufsTaste('zurueck', 'alt-pfeil');
    else if (ereignis.key === 'ArrowRight') meldeVerlaufsTaste('vorwaerts', 'alt-pfeil');
  },
  true
);

/*
 * Strg+K an die Huelle melden.
 *
 * Dasselbe Muster wie bei den Daumentasten der Maus: liegt der Fokus in
 * dieser Ansicht, sieht die Huelle den Tastendruck nicht. Das Preload
 * sieht dasselbe Dokument und braucht dafuer keine Zeile im
 * Anwendungscode.
 */
verlaufsDokument.addEventListener(
  'keydown',
  (ereignis) => {
    const taste = ereignis as { key?: string; ctrlKey?: boolean; metaKey?: boolean };
    if ((taste.ctrlKey || taste.metaKey) && taste.key?.toLowerCase() === 'k') {
      ipcRenderer.send('suche:taste');
    }
  },
  true
);
