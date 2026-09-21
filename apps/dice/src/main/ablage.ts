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

  /**
   * Die laufende Schreibarbeit, eine nach der anderen.
   *
   * **Woher das kommt.** Ein Rauchtest las diese Datei und brach ab:
   * „Unexpected non-whitespace character after JSON at position 170 (line 11
   * column 1)". Die Einstellungen sind 169 Zeichen in zehn Zeilen lang — es
   * stand also ein vollstaendiger Stand darin und dahinter noch etwas.
   *
   * **Was ich nicht sagen kann:** wie es genau dazu kam. Nachgestellt habe
   * ich es nicht; zwanzig gleichzeitige Schreibvorgaenge auf dieselbe Datei
   * ergaben hier jedes Mal heiles JSON. Es bleibt also offen, ob ein
   * Schreiben ueber ein anderes lief oder ob jemand die Datei gelesen hat,
   * waehrend sie geschrieben wurde.
   *
   * **Warum der Umbau trotzdem richtig ist:** beide Faelle koennen danach
   * nicht mehr auftreten. Geschrieben wird eines nach dem anderen, und zwar
   * daneben und dann umbenannt — wer die Datei liest, sieht immer genau
   * einen vollstaendigen Stand. Die Huelle macht es bei ihren Einstellungen
   * seit jeher so; der Wuerfel war der Ausreisser.
   *
   * Die Kette bricht nicht ab, wenn ein Schreiben fehlschlaegt: der Fehler
   * geht an den Aufrufer, die naechste Aenderung laeuft wieder.
   */
  private kette: Promise<unknown> = Promise.resolve();

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
    const arbeit = this.kette.then(
      () => this.schreibeJetzt(bereinigt),
      () => this.schreibeJetzt(bereinigt)
    );
    // Die Kette selbst darf nie in einen abgelehnten Zustand geraten, sonst
    // schleppt jeder spaetere Aufruf denselben alten Fehler mit.
    this.kette = arbeit.catch(() => undefined);
    await arbeit;
    return bereinigt;
  }

  /**
   * Erst daneben schreiben, dann umbenennen.
   *
   * Ein Umbenennen ist im Dateisystem ein Schritt: entweder steht die neue
   * Datei da oder die alte. Bricht der Strom mitten im Schreiben ab, ist
   * nichts halb geschrieben. Die Huelle macht es bei ihren Einstellungen
   * genauso.
   */
  private async schreibeJetzt(bereinigt: Einstellungen): Promise<void> {
    await fs.mkdir(this.wurzel, { recursive: true });
    const daneben = `${this.datei}.neu`;
    await fs.writeFile(daneben, JSON.stringify(bereinigt, null, 2), 'utf8');
    await fs.rename(daneben, this.datei);
  }
}
