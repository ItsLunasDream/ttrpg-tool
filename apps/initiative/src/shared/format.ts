/**
 * Begegnungen als Markdown mit YAML-Kopf lesen und schreiben (Konvention 1).
 *
 * Bewusst ohne YAML-Bibliothek und ohne die Frontmatter-Datei des Backstory
 * Creators: der Kopf hier ist eine flache, selbst erzeugte Struktur, und ein
 * Zugriff quer in eine andere Anwendung verbietet Konvention 7. Gelesen wird
 * trotzdem nachsichtig — die Datei darf von Hand repariert worden sein.
 *
 * Plattformfrei: kein `node:fs`. Wer liest und schreibt, entscheidet der
 * Hauptprozess.
 */
import type { Begegnung, Koerper, Teilnehmer, Zustand } from './types';
import { SCHEMA_VERSION } from './types';

/** IDs sind `[A-Za-z0-9_-]+`, der Dateiname ist die ID (Konvention 3). */
export function istGueltigeId(id: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

/** Macht aus einem Namen eine brauchbare ID. */
export function zuId(name: string): string {
  const kern = name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  // Ein leerer Name darf keine leere ID ergeben: die waere ein Dateiname aus
  // nichts und truebe im Verzeichnis Unheil.
  return kern || `begegnung-${Date.now().toString(36)}`;
}

function jsonZeile(schluessel: string, wert: unknown): string {
  return `${schluessel}: ${JSON.stringify(wert)}`;
}

/**
 * Schreibt eine Begegnung.
 *
 * Die Teilnehmer stehen als eine JSON-Zeile im Kopf und nicht als
 * ausgeschriebenes YAML. Das ist eine bewusste Abwaegung: verschachteltes
 * YAML von Hand zu erzeugen *und* wieder einzulesen waere hier der halbe Weg
 * zu einer YAML-Bibliothek, und die Teilnehmerliste ist Maschinendaten. Der
 * Teil, den ein Mensch anfasst — Name und Taktik — steht lesbar da.
 */
export function schreibeBegegnung(begegnung: Begegnung): string {
  const kopf = [
    '---',
    jsonZeile('schemaVersion', SCHEMA_VERSION),
    jsonZeile('id', begegnung.id),
    jsonZeile('name', begegnung.name),
    jsonZeile('teilnehmer', begegnung.teilnehmer),
    '---',
    ''
  ].join('\n');
  const rumpf = begegnung.taktik.trimEnd();
  return rumpf ? `${kopf}${rumpf}\n` : kopf;
}

/**
 * Liest eine Begegnung.
 *
 * Nachsichtig: fehlt etwas oder ist es kaputt, wird es durch einen sinnvollen
 * Wert ersetzt, statt die Datei abzulehnen. Eine Begegnung, die sich wegen
 * eines Tippfehlers im Kopf gar nicht mehr oeffnen laesst, waere am
 * Spieltisch das Schlimmste, was passieren kann.
 */
export function leseBegegnung(text: string, ersatzId: string): Begegnung {
  const treffer = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  const kopfText = treffer ? treffer[1] : '';
  const taktik = treffer ? treffer[2] : text;

  const kopf = new Map<string, unknown>();
  for (const zeile of kopfText.split(/\r?\n/)) {
    const doppelpunkt = zeile.indexOf(':');
    if (doppelpunkt <= 0) continue;
    const schluessel = zeile.slice(0, doppelpunkt).trim();
    const rest = zeile.slice(doppelpunkt + 1).trim();
    try {
      kopf.set(schluessel, JSON.parse(rest));
    } catch {
      // Von Hand geaenderte Werte stehen oft ohne Anfuehrungszeichen da.
      kopf.set(schluessel, rest.replace(/^["']|["']$/g, ''));
    }
  }

  const id = typeof kopf.get('id') === 'string' && istGueltigeId(kopf.get('id') as string)
    ? (kopf.get('id') as string)
    : ersatzId;

  return {
    schemaVersion: typeof kopf.get('schemaVersion') === 'number' ? (kopf.get('schemaVersion') as number) : SCHEMA_VERSION,
    id,
    name: typeof kopf.get('name') === 'string' && kopf.get('name') ? (kopf.get('name') as string) : id,
    teilnehmer: leseTeilnehmer(kopf.get('teilnehmer')),
    taktik: taktik.trimEnd()
  };
}

function zahl(wert: unknown, ersatz = 0): number {
  return typeof wert === 'number' && Number.isFinite(wert) ? wert : ersatz;
}

function text(wert: unknown, ersatz = ''): string {
  return typeof wert === 'string' ? wert : ersatz;
}

function leseTeilnehmer(roh: unknown): Teilnehmer[] {
  if (!Array.isArray(roh)) return [];
  return roh.map((eintrag, index) => {
    const e = (eintrag ?? {}) as Record<string, unknown>;
    const koerper = leseKoerper(e.koerper);
    return {
      id: text(e.id) || `t${index}`,
      name: text(e.name, `Teilnehmer ${index + 1}`),
      initiative: zahl(e.initiative),
      feinwert: zahl(e.feinwert),
      istSpieler: e.istSpieler === true,
      // Ohne mindestens einen Koerper waere der Eintrag nicht darstellbar.
      koerper: koerper.length > 0 ? koerper : [leerKoerper(index)],
      zustaende: leseZustaende(e.zustaende),
      bild: typeof e.bild === 'string' && e.bild ? e.bild : null,
      notiz: text(e.notiz)
    };
  });
}

function leerKoerper(index: number): Koerper {
  return { id: `k${index}`, marke: '', hp: 0, hpMax: 0, tempHp: 0, raus: false };
}

function leseKoerper(roh: unknown): Koerper[] {
  if (!Array.isArray(roh)) return [];
  return roh.map((eintrag, index) => {
    const k = (eintrag ?? {}) as Record<string, unknown>;
    const hpMax = Math.max(0, zahl(k.hpMax));
    return {
      id: text(k.id) || `k${index}`,
      marke: text(k.marke),
      // Trefferpunkte ueber dem Maximum kaemen aus einer Datei, die jemand von
      // Hand angefasst hat — hier beschnitten statt spaeter in der Anzeige.
      hp: Math.max(0, Math.min(hpMax, zahl(k.hp, hpMax))),
      hpMax,
      tempHp: Math.max(0, zahl(k.tempHp)),
      raus: k.raus === true
    };
  });
}

function leseZustaende(roh: unknown): Zustand[] {
  if (!Array.isArray(roh)) return [];
  return roh.flatMap((eintrag, index) => {
    const z = (eintrag ?? {}) as Record<string, unknown>;
    const name = text(z.name);
    if (!name) return [];
    const rest = z.rundenRest;
    return [{
      id: text(z.id) || `z${index}`,
      name,
      rundenRest: typeof rest === 'number' && Number.isFinite(rest) ? rest : null
    }];
  });
}
