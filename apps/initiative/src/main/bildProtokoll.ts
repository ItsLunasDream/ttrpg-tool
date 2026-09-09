/**
 * Liefert die abgelegten Bilder unter initiative-bild://<datei>.
 *
 * Der Renderer bekommt bewusst keinen Dateizugriff. Der Dateiname wird von
 * `Ablage.bildPfad` geprueft — er stammt aus einer Begegnungsdatei, und die
 * kann von Hand geaendert worden sein.
 */
import { net, protocol, session as electronSession } from 'electron';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { BILD_SCHEMA } from '../shared/kanaele';
import type { Ablage } from './ablage';

/**
 * Muss vor `app.whenReady()` laufen. Danach nimmt Electron keine Schemata
 * mehr an, und die Bilder blieben leer.
 */
export function registriereBildSchema(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: BILD_SCHEMA,
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
    }
  ]);
}

/**
 * `partition` benennt die Sitzung, in der die Anwendung laeuft. In der Huelle
 * bekommt jede eine eigene; ein Protokoll gilt immer nur fuer eine Sitzung,
 * und ohne diese Angabe blieben dort alle Bilder leer.
 */
export function behandleBildProtokoll(ablage: Ablage, partition?: string): void {
  const ziel = partition ? electronSession.fromPartition(partition).protocol : protocol;
  ziel.handle(BILD_SCHEMA, async (anfrage) => {
    try {
      const url = new URL(anfrage.url);
      // Der Name steht im Host, nicht im Pfad: `initiative-bild://<name>`.
      const name = decodeURIComponent(url.hostname || url.pathname.replace(/^\//, ''));
      const datei = ablage.bildPfad(name);
      if (!datei) return new Response('Not found', { status: 404 });
      await fs.access(datei);
      // pathToFileURL statt Zusammenbauen: der Speicherort wird frei gewaehlt
      // und darf # oder ? enthalten.
      return net.fetch(pathToFileURL(path.resolve(datei)).href);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
}

/** Aus einem Dateinamen eine anzeigbare URL. */
export function bildUrl(name: string): string {
  return `${BILD_SCHEMA}://${encodeURIComponent(name)}`;
}
