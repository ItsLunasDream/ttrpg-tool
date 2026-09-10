/**
 * Wohin der Wuerfel schreibt.
 *
 * Nur die Einstellungen — Aussehen, Effektschalter, Seitenzahl des eigenen
 * Wuerfels. Der Verlauf gehoert bewusst nicht dazu: er ist Sitzungszustand,
 * und ihn zu schreiben hiesse, dass jemand ihn spaeter wiederfinden will.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { bereinige, STANDARD, type Einstellungen } from '../shared/einstellungen';

export class Ablage {
  constructor(private readonly wurzel: string) {}

  private get datei(): string {
    return path.join(this.wurzel, 'einstellungen.json');
  }

  async init(): Promise<void> {
    await fs.mkdir(this.wurzel, { recursive: true });
  }

  /**
   * Liest die Einstellungen. Fehlt die Datei oder ist sie kaputt, gilt der
   * Standard — der Wuerfel soll immer aufgehen, auch wenn jemand die Datei
   * von Hand verunstaltet hat.
   */
  async lesen(): Promise<Einstellungen> {
    try {
      return bereinige(JSON.parse(await fs.readFile(this.datei, 'utf8')));
    } catch {
      return STANDARD;
    }
  }

  async schreiben(einstellungen: Einstellungen): Promise<Einstellungen> {
    const bereinigt = bereinige(einstellungen);
    await fs.mkdir(this.wurzel, { recursive: true });
    await fs.writeFile(this.datei, JSON.stringify(bereinigt, null, 2), 'utf8');
    return bereinigt;
  }
}
