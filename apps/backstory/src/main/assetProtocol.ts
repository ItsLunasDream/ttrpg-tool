import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { net, protocol, session as electronSession } from 'electron';
import type { Vault } from './vault';

export const ASSET_SCHEME = 'backstory-asset';

/**
 * Muss vor app.whenReady laufen. Ohne diese Anmeldung darf das Schema keine
 * Ressourcen liefern, die der Renderer einbinden kann.
 */
export function registerAssetScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: ASSET_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
    }
  ]);
}

/**
 * Liefert Bilder aus dem assets-Verzeichnis einer Kampagne unter
 * backstory-asset://<campaignId>/<dateiname>.
 *
 * Der Renderer bekommt bewusst keinen direkten Dateizugriff. Kampagnen-ID und
 * Dateiname werden von der Vault-Schicht geprueft, ein Ausbruch aus dem
 * Verzeichnis ist damit nicht moeglich.
 *
 * `partition` benennt die Sitzung, in der die Anwendung laeuft. In der Huelle
 * bekommt jede Anwendung eine eigene, damit sie sich localStorage und
 * IndexedDB nicht teilen — unter file:// waere das sonst derselbe Speicher.
 * Ein Protokoll gilt immer nur fuer eine Sitzung; ohne diese Angabe waere es
 * dort nicht angemeldet und jedes Bild bliebe leer. Ohne `partition` gilt die
 * Standardsitzung, wie beim eigenstaendigen Start.
 */
export function handleAssetProtocol(vault: Vault, partition?: string): void {
  const ziel = partition ? electronSession.fromPartition(partition).protocol : protocol;
  ziel.handle(ASSET_SCHEME, async (request) => {
    try {
      const url = new URL(request.url);
      const campaignId = url.hostname;
      const fileName = decodeURIComponent(url.pathname.replace(/^\//, ''));

      const file = vault.assetFile(campaignId, fileName);
      await fs.access(file);

      // pathToFileURL statt Zusammenbauen: der Speicherort wird frei
      // gewaehlt und darf # oder ? enthalten, die in einer URL sonst
      // Fragment bzw. Abfrage einleiten wuerden.
      return net.fetch(pathToFileURL(path.resolve(file)).href);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
}

/** Verweis aus dem Markdown (assets/x.png) in eine anzeigbare URL. */
export function assetUrl(campaignId: string, relativePath: string): string {
  const fileName = relativePath.replace(/^assets\//, '');
  return `${ASSET_SCHEME}://${campaignId}/${encodeURIComponent(fileName)}`;
}
