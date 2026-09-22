/**
 * Die Bruecke des Nachschlagewerks.
 *
 * Duenn, weil der offizielle Bestand in der Oberflaeche selbst liegt:
 * `@suite/srd` ist plattformfrei und wird mitgebuendelt. Ueber die Bruecke
 * laufen die Hausregeln, die Sprache und die Spruenge aus der Suche.
 */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Hausregel } from '../shared/hausregeln';

const api = {
  hausregeln: {
    liste: () => ipcRenderer.invoke(kanal('hausregeln:liste')) as Promise<Hausregel[]>,
    speichern: (regel: Hausregel, neu: boolean) =>
      ipcRenderer.invoke(kanal('hausregeln:speichern'), regel, neu) as Promise<{
        ok: boolean;
        id: string;
        text: string;
      }>,
    loeschen: (id: string) => ipcRenderer.invoke(kanal('hausregeln:loeschen'), id) as Promise<boolean>
  },
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

export type NachschlagewerkApi = typeof api;

contextBridge.exposeInMainWorld('nachschlagewerk', api);
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

