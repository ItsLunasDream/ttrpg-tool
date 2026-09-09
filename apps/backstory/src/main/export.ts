import { createWriteStream } from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

/** Packt ein Kampagnenverzeichnis als ZIP-Backup. */
export function zipDirectory(sourceDir: string, targetFile: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(targetFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve(archive.pointer()));
    output.on('error', reject);
    archive.on('error', reject);
    archive.on('warning', (warning) => {
      if (warning.code !== 'ENOENT') reject(warning);
    });

    archive.pipe(output);
    archive.directory(sourceDir, path.basename(sourceDir));
    void archive.finalize();
  });
}
