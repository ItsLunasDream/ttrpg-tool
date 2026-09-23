/**
 * Die Montage-Schnittstelle des Wuerfels (Konvention 7).
 *
 * Wie beim Initiative Tracker: die Huelle ruft `mountDice` und bekommt
 * zurueck, was sie zum Anzeigen braucht. Kein eigenstaendiger Hauptprozess —
 * der Wuerfel laeuft nur in der Huelle.
 */
import path from 'node:path';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { Ablage } from './ablage';
import { kanal } from '../shared/kanaele';
import type { Einstellungen } from '../shared/einstellungen';

export interface DiceEmbedOptions {
  readonly userDataDir: string;
  readonly distDir: string;
  readonly partition?: string;
  readonly devServerUrl?: string;
  readonly language?: string;
  readonly onLanguageChange?: (language: string) => void;
  /**
   * Der Raum im lokalen Netz, wenn die Huelle einen hat: ob man drin ist,
   * und eine Chatzeile schicken (an alle oder an eine Person).
   */
  readonly raum?: {
    lage(): { readonly rolle: 'aus' | 'gastgeber' | 'gast'; readonly ichId: string | null };
    chatte(text: string, an: string | null): boolean;
  };
}

/** Die Kennung des Gastgebers im Raum — er ist die Spielleitung. */
const GASTGEBER = 'gastgeber';

export interface DiceEmbed {
  readonly preloadPath: string;
  readonly indexFile: string | null;
  readonly devServerUrl: string | null;
  readonly csp: string;
  flush(): Promise<void>;
  setLanguage(webContents: WebContents, language: string): Promise<void>;
}

/**
 * Die Richtlinie.
 *
 * Kein eigenes Bildprotokoll noetig: die Wuerfel sind SVG, das die Anwendung
 * selbst zeichnet. `style-src` braucht 'unsafe-inline', weil React Stile
 * ueber `style`-Attribute setzt; kein `unsafe-eval`, und `connect-src` geht
 * nirgendwohin — der Wuerfel redet mit niemandem.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'"
].join('; ');

export async function mountDice(options: DiceEmbedOptions): Promise<DiceEmbed> {
  const ablage = new Ablage(options.userDataDir);
  await ablage.init();

  // Erst abmelden: nach einem Fehlschlag kann dieselbe Anwendung ein zweites
  // Mal montiert werden, und `handle` weist einen zweiten Handler ab.
  for (const name of ['einstellungen:lesen', 'einstellungen:schreiben']) {
    ipcMain.removeHandler(kanal(name));
  }
  ipcMain.handle(kanal('einstellungen:lesen'), () => ablage.lesen());
  for (const name of ['raum:lage', 'raum:wurf']) ipcMain.removeHandler(kanal(name));
  ipcMain.handle(kanal('raum:lage'), () => options.raum?.lage() ?? { rolle: 'aus', ichId: null });
  /*
   * Einen Wurf in den Raum schicken. „dm" geht an den Gastgeber; ist man
   * selbst der Gastgeber, bleibt der Wurf hier (ein verdeckter Wurf der
   * Spielleitung) und es wird nichts geschickt.
   */
  ipcMain.handle(kanal('raum:wurf'), (_e, text: string, ziel: 'alle' | 'dm') => {
    const lage = options.raum?.lage();
    if (!options.raum || !lage || lage.rolle === 'aus') return 'aus';
    if (ziel === 'dm' && lage.ichId === GASTGEBER) return 'selbst';
    const ok = options.raum.chatte(String(text).slice(0, 400), ziel === 'dm' ? GASTGEBER : null);
    return ok ? 'ok' : 'fehler';
  });
  ipcMain.handle(kanal('einstellungen:schreiben'), (_e, neu: Einstellungen) =>
    ablage.schreiben(neu)
  );

  ipcMain.removeAllListeners(kanal('sprache:gewechselt'));
  ipcMain.on(kanal('sprache:gewechselt'), (_event, language: string) => {
    options.onLanguageChange?.(language);
  });

  return {
    preloadPath: path.join(options.distDir, 'preload.js'),
    indexFile: options.devServerUrl
      ? null
      : path.join(options.distDir, '..', 'renderer', 'index.html'),
    devServerUrl: options.devServerUrl ?? null,
    csp: CSP,
    flush: async () => {
      // Einstellungen werden bei jeder Aenderung geschrieben, der Verlauf
      // absichtlich nie. Hier bleibt nichts zu sichern.
    },
    setLanguage: async (webContents, language) => {
      if (!webContents.isDestroyed()) webContents.send(kanal('sprache:gesetzt'), language);
    }
  };
}
