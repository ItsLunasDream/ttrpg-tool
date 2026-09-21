/**
 * Wohin der Tracker schreibt und was er liest.
 *
 * Zwei Sorten Daten, und sie werden bewusst verschieden behandelt:
 *
 * - **Begegnungen** sind Dokumente. Markdown mit YAML-Kopf (Konvention 1),
 *   eine Datei je Begegnung, der Dateiname ist die ID (Konvention 3).
 * - **Der laufende Kampf** ist Sitzungszustand, kein Dokument: eine JSON-Datei,
 *   die beim naechsten Start wieder aufgemacht wird. Sie als Markdown zu
 *   fuehren haette den Anschein erweckt, man solle sie aufheben.
 *
 * Bilder liegen in einem eigenen Ordner und werden beim Einfuegen *kopiert*,
 * nicht verlinkt. Ein Verweis auf ein Bild irgendwo auf der Platte zeigt ins
 * Leere, sobald jemand aufraeumt — und das faellt erst mitten im Kampf auf.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { leseBegegnung, schreibeBegegnung, istGueltigeId } from '../shared/format';
import type { Begegnung, Kampf } from '../shared/types';

export class Ablage {
  constructor(private readonly wurzel: string) {}

  /**
   * Die laufende Schreibarbeit am Kampf, eine nach der anderen.
   *
   * Dieselbe Vorsorge wie beim Wuerfel, aus demselben Anlass (siehe dort).
   * Hier wiegt sie schwerer: der laufende Kampf wird bei JEDER Aenderung
   * geschrieben — Schaden, ein Zustand, ein Zug weiter —, und am Tisch
   * kommen die schnell hintereinander. Faende jemand die Datei halb
   * geschrieben vor, waere mitten im Gefecht der Kampf weg.
   *
   * Geschrieben wird daneben und dann umbenannt: wer liest, sieht immer
   * genau einen vollstaendigen Stand.
   */
  private kampfKette: Promise<unknown> = Promise.resolve();

  get begegnungenOrdner(): string {
    return path.join(this.wurzel, 'begegnungen');
  }

  get bilderOrdner(): string {
    return path.join(this.wurzel, 'bilder');
  }

  get kampfDatei(): string {
    return path.join(this.wurzel, 'kampf.json');
  }

  async init(): Promise<void> {
    await fs.mkdir(this.begegnungenOrdner, { recursive: true });
    await fs.mkdir(this.bilderOrdner, { recursive: true });
  }

  /**
   * Der Pfad einer Begegnung.
   *
   * Die ID wird geprueft, bevor sie in einen Pfad wandert. Konvention 3
   * schliesst `..` und Pfadtrenner aus; hier wird das durchgesetzt statt
   * vorausgesetzt — die ID kann aus einer Datei stammen, die jemand von Hand
   * angefasst hat.
   */
  private begegnungsDatei(id: string): string {
    if (!istGueltigeId(id)) throw new Error(`Ungueltige Begegnungs-ID: ${id}`);
    return path.join(this.begegnungenOrdner, `${id}.md`);
  }

  async listeBegegnungen(): Promise<Begegnung[]> {
    let dateien: string[];
    try {
      dateien = await fs.readdir(this.begegnungenOrdner);
    } catch {
      return [];
    }
    const gelesen: Begegnung[] = [];
    for (const datei of dateien) {
      if (!datei.endsWith('.md')) continue;
      const id = datei.slice(0, -3);
      if (!istGueltigeId(id)) continue;
      try {
        const text = await fs.readFile(path.join(this.begegnungenOrdner, datei), 'utf8');
        gelesen.push(leseBegegnung(text, id));
      } catch {
        // Eine unlesbare Datei darf die Liste nicht kippen — die uebrigen
        // Begegnungen soll man trotzdem oeffnen koennen.
      }
    }
    return gelesen.sort((a, b) => a.name.localeCompare(b.name));
  }

  async leseBegegnungMitId(id: string): Promise<Begegnung> {
    const text = await fs.readFile(this.begegnungsDatei(id), 'utf8');
    return leseBegegnung(text, id);
  }

  async speichereBegegnung(begegnung: Begegnung): Promise<Begegnung> {
    await fs.mkdir(this.begegnungenOrdner, { recursive: true });
    await fs.writeFile(this.begegnungsDatei(begegnung.id), schreibeBegegnung(begegnung), 'utf8');
    return begegnung;
  }

  async loescheBegegnung(id: string): Promise<void> {
    await fs.rm(this.begegnungsDatei(id), { force: true });
  }

  /** Der laufende Kampf, oder `null`, wenn keiner gespeichert ist. */
  async leseKampf(): Promise<Kampf | null> {
    try {
      const roh = JSON.parse(await fs.readFile(this.kampfDatei, 'utf8')) as Kampf;
      return roh && typeof roh === 'object' && Array.isArray(roh.teilnehmer) ? roh : null;
    } catch {
      return null;
    }
  }

  async schreibeKampf(kampf: Kampf): Promise<void> {
    const arbeit = this.kampfKette.then(
      () => this.schreibeKampfJetzt(kampf),
      () => this.schreibeKampfJetzt(kampf)
    );
    // Die Kette darf nie abgelehnt stehenbleiben, sonst schleppt jeder
    // spaetere Aufruf denselben alten Fehler mit.
    this.kampfKette = arbeit.catch(() => undefined);
    await arbeit;
  }

  /**
   * Erst daneben schreiben, dann umbenennen: ein Umbenennen ist im
   * Dateisystem ein Schritt. Bricht der Strom mitten im Schreiben ab, steht
   * der alte Kampf noch da statt eines halben neuen.
   */
  private async schreibeKampfJetzt(kampf: Kampf): Promise<void> {
    await fs.mkdir(this.wurzel, { recursive: true });
    const daneben = `${this.kampfDatei}.neu`;
    await fs.writeFile(daneben, JSON.stringify(kampf, null, 2), 'utf8');
    await fs.rename(daneben, this.kampfDatei);
  }

  /**
   * Kopiert ein Bild in den eigenen Ordner und gibt den Dateinamen zurueck.
   *
   * Der Name kommt aus dem Inhalt (Hash) und nicht aus dem Originalnamen:
   * zweimal dasselbe Bild liegt dann einmal da, und ein Bild mit Umlauten
   * oder Leerzeichen im Namen macht keine Umstaende.
   */
  async legeBildAb(quelle: string): Promise<string> {
    const inhalt = await fs.readFile(quelle);
    const hash = createHash('sha256').update(inhalt).digest('hex').slice(0, 16);
    const endung = (path.extname(quelle) || '.png').toLowerCase().replace(/[^.a-z0-9]/g, '');
    const name = `${hash}${endung}`;
    await fs.mkdir(this.bilderOrdner, { recursive: true });
    const ziel = path.join(this.bilderOrdner, name);
    try {
      await fs.access(ziel);
    } catch {
      await fs.writeFile(ziel, inhalt);
    }
    return name;
  }

  /**
   * Der Pfad zu einem abgelegten Bild — oder `null`, wenn der Name nicht
   * einer ist, den `legeBildAb` vergeben haette.
   *
   * Die Pruefung ist der Grund, warum diese Funktion existiert: der Name
   * kommt aus einer Begegnungsdatei, und die kann von Hand geaendert worden
   * sein. `../../etc/passwd` waere sonst ein gueltiger „Bildname\".
   */
  bildPfad(name: string): string | null {
    if (!/^[a-f0-9]{16}\.[a-z0-9]{2,5}$/.test(name)) return null;
    return path.join(this.bilderOrdner, name);
  }

  /** Bilder, die keine Begegnung mehr benutzt. */
  async verwaisteBilder(): Promise<string[]> {
    const begegnungen = await this.listeBegegnungen();
    const benutzt = new Set<string>();
    for (const begegnung of begegnungen) {
      for (const teilnehmer of begegnung.teilnehmer) {
        if (teilnehmer.bild) benutzt.add(teilnehmer.bild);
      }
    }
    const laufend = await this.leseKampf();
    for (const teilnehmer of laufend?.teilnehmer ?? []) {
      if (teilnehmer.bild) benutzt.add(teilnehmer.bild);
    }
    try {
      return (await fs.readdir(this.bilderOrdner)).filter((datei) => !benutzt.has(datei));
    } catch {
      return [];
    }
  }
}
