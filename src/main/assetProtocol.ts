import { promises as fs } from 'node:fs';
import path from 'node:path';
import { net, protocol } from 'electron';
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
 */
export function handleAssetProtocol(vault: Vault): void {
  protocol.handle(ASSET_SCHEME, async (request) => {
    try {
      const url = new URL(request.url);
      const campaignId = url.hostname;
      const fileName = decodeURIComponent(url.pathname.replace(/^\//, ''));

      const file = vault.assetFile(campaignId, fileName);
      await fs.access(file);

      return net.fetch(`file://${path.resolve(file)}`);
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
