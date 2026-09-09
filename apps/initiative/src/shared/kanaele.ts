/**
 * Namen der IPC-Kanaele.
 *
 * Mit Praefix, weil `ipcMain.handle` global ist: in der Huelle laufen mehrere
 * Anwendungen im selben Hauptprozess, und zwei gleich benannte Kanaele wuerden
 * sich gegenseitig ausschliessen. Derselbe Grund wie beim `backstory:`-Praefix.
 */
export const PRAEFIX = 'initiative';

export function kanal(name: string): string {
  return `${PRAEFIX}:${name}`;
}

export const BILD_SCHEMA = 'initiative-bild';
