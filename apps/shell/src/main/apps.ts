/**
 * Das Einbetten der Anwendungen.
 *
 * Jede Anwendung bringt eine Montage-Schnittstelle mit (beim Backstory
 * Creator `src/main/embed.ts`). Die Huelle ruft sie auf, bekommt Preload und
 * Oberflaeche zurueck und haengt eine Ansicht ins Fenster. Der Code der
 * Anwendung bleibt dabei unveraendert: sie merkt nicht, dass sie in einer
 * Huelle laeuft.
 *
 * Der Import geht quer ueber die Anwendungsgrenze, mit relativem Pfad. Das
 * ist Absicht und die einzige erlaubte Richtung: die Huelle darf in eine
 * Anwendung hineingreifen, eine Anwendung nie in die Huelle und nie in eine
 * andere Anwendung. Sonst waeren sie nicht mehr einzeln lauffaehig, und genau
 * das sollen sie bleiben.
 */
import { join } from 'node:path';
import { app, WebContentsView, shell } from 'electron';
import type { WebContents } from 'electron';
import {
  mountBackstory,
  registerAssetScheme as registerBackstoryScheme
} from '../../../backstory/src/main/embed';

export interface MontierteApp {
  readonly id: string;
  readonly sicht: WebContentsView;
  /** Sichert Ungespeichertes und wartet darauf. Vor dem Schliessen aufzurufen. */
  flush(): Promise<void>;
}

/**
 * Meldet die eigenen Protokolle aller Anwendungen an.
 *
 * Muss vor `app.whenReady()` laufen — danach duerfen keine Schemata mehr
 * angemeldet werden, und der Backstory Creator koennte seine Bilder nicht
 * ausliefern. Deshalb steht das getrennt vom Montieren, das erst danach geht.
 */
export function registerSchemes(): void {
  registerBackstoryScheme();
}

/**
 * Wo der gebuendelte Hauptprozess einer Anwendung liegt.
 *
 * `__dirname` ist hier das Verzeichnis der Huelle — der Code der Anwendung
 * ist in dieses Buendel hineingewandert, ihre Dateien aber nicht. Ohne diese
 * Umrechnung suchte die Anwendung ihr Preload und ihre Oberflaeche neben der
 * Huelle und die Ansicht bliebe leer.
 *
 * Beim Paketieren aendert sich diese Anordnung, dann muss auch diese Funktion
 * angepasst werden. Ein Test haelt fest, dass die Dateien dort auch wirklich
 * liegen.
 */
export function appDistDir(id: string): string {
  return join(__dirname, '..', '..', '..', id, 'dist', 'main');
}

/** Wohin eine Anwendung ihre Daten legt. */
function datenordner(id: string): string {
  // Jede Anwendung bekommt einen eigenen Unterordner. Ein gemeinsamer waere
  // bequemer, aber zwei Anwendungen mit je einer settings.json wuerden sich
  // gegenseitig ueberschreiben.
  return join(app.getPath('userData'), id);
}

/**
 * Baut die Ansicht einer Anwendung und laedt sie.
 *
 * Gibt `null` zurueck, wenn die Huelle die Anwendung noch nicht einbetten
 * kann. Die Oberflaeche zeigt dann ihre Platzhalterflaeche — besser als ein
 * Fehler fuer etwas, das erklaertermassen noch nicht fertig ist.
 */
export async function mountApp(id: string): Promise<MontierteApp | null> {
  if (id !== 'backstory') return null;

  const eingebettet = await mountBackstory({
    userDataDir: datenordner(id),
    distDir: appDistDir(id),
    devServerUrl: process.env.BACKSTORY_DEV_SERVER_URL
  });

  const sicht = new WebContentsView({
    webPreferences: {
      preload: eingebettet.preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Externe Links gehoeren in den Systembrowser. Dieselbe Absicherung wie im
  // eigenstaendigen Fenster: ohne sie laege auf einer fremden Seite dieselbe
  // Bruecke zum Dateisystem wie auf der eigenen.
  sicht.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  sicht.webContents.on('will-navigate', (event, url) => {
    if (eingebettet.devServerUrl && url.startsWith(eingebettet.devServerUrl)) return;
    event.preventDefault();
    const ziel = new URL(url);
    if (ziel.protocol === 'http:' || ziel.protocol === 'https:') void shell.openExternal(ziel.href);
  });

  if (eingebettet.devServerUrl) {
    await sicht.webContents.loadURL(eingebettet.devServerUrl);
  } else {
    await sicht.webContents.loadFile(eingebettet.indexFile!);
  }

  return {
    id,
    sicht,
    flush: () => eingebettet.flush(sicht.webContents as WebContents)
  };
}
