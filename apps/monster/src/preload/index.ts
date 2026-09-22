/**
 * Die Bruecke des Monster Creators.
 *
 * Der Renderer hat keinen Node-Zugriff; alles, was er darf, steht hier.
 */
import { contextBridge, ipcRenderer } from 'electron';
import { kanal } from '../shared/kanaele';
import type { Abgelegt, Eintrag } from '../shared/ablage';
import type { Frage } from '../shared/kiAufgaben';

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
    lesen: (id: string) => ipcRenderer.invoke(kanal('lesen'), id) as Promise<string | null>,
    speichern: (monster: Abgelegt, sprache: string) =>
      ipcRenderer.invoke(kanal('speichern'), monster, sprache) as Promise<{
        ok: boolean;
        id: string;
        text: string;
      }>,
    loeschen: (id: string) => ipcRenderer.invoke(kanal('loeschen'), id) as Promise<boolean>
  },
  export: (titel: string, markdown: string) =>
    ipcRenderer.invoke(kanal('export'), titel, markdown) as Promise<{ ok: boolean; text: string }>,
  /**
   * Eine Datei fuer Foundry wegschreiben. `text` ist der Pfad, wenn es ging.
   * Bricht jemand den Dateidialog ab, kommt `{ ok: false, text: '' }` —
   * kein Fehler, sondern eine Entscheidung.
   */
  foundry: (vorschlag: string, inhalt: string) =>
    ipcRenderer.invoke(kanal('foundry'), vorschlag, inhalt) as Promise<{
      ok: boolean;
      text: string;
    }>,
  ki: {
    da: () => ipcRenderer.invoke(kanal('ki:da')) as Promise<boolean>,
    frage: (frage: Frage, sprache: string) =>
      ipcRenderer.invoke(kanal('ki:frage'), frage, sprache) as Promise<{
        ok: boolean;
        wert: unknown;
        grund: string;
      }>,
    beiWechsel: (hoerer: () => void) => {
      const lauscher = () => hoerer();
      ipcRenderer.on(kanal('ki:gewechselt'), lauscher);
      return () => {
        ipcRenderer.off(kanal('ki:gewechselt'), lauscher);
      };
    }
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

contextBridge.exposeInMainWorld('monster', api);

export type MonsterApi = typeof api;

/*
 * Die Daumentasten der Maus und Alt+Pfeil, an die Huelle gemeldet.
 *
 * Wie in den anderen Werkzeugen: das Preload sieht dasselbe Dokument und
 * braucht dafuer keine Zeile im Anwendungscode. Gehoert wird auf drei
 * Mausereignisse, weil vom System abhaengt, welches eine Seitentaste
 * ausloest; der Hauptprozess hat eine Sperrfrist und macht daraus einen
 * Schritt.
 */
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

