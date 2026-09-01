export const ASSET_SCHEME = 'backstory-asset';

/** Relativer Verweis aus dem Markdown in eine im Editor ladbare URL. */
export function assetUrl(campaignId: string, relativePath: string): string {
  const fileName = relativePath.replace(/^assets\//, '');
  return `${ASSET_SCHEME}://${campaignId}/${encodeURIComponent(fileName)}`;
}

/**
 * Rueckweg beim Speichern. Fremde URLs, etwa aus dem Netz eingefuegte Bilder,
 * bleiben unveraendert und werden nicht faelschlich zu Kampagnendateien.
 */
export function assetPath(url: string): string | null {
  if (!url.startsWith(`${ASSET_SCHEME}://`)) return null;
  try {
    const fileName = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
    return fileName ? `assets/${fileName}` : null;
  } catch {
    return null;
  }
}

/** Liest eine Datei aus Zwischenablage oder Ziehen und Ablegen ein. */
export async function readFileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
