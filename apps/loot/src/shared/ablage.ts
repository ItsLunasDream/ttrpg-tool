/**
 * Eine Zufallstabelle als Markdown-Datei.
 *
 *   ---
 *   name: Beute einer Räuberbande
 *   wuerfel: 1d6
 *   ohneZuruecklegen: nein
 *   geaendert: 2026-09-22T20:00:00.000Z
 *   ---
 *   - 1-3: 2d6 × 10 Kupfer
 *   - 4-5: [Taschenkram]
 *   - 6: [Etwas Glänzendes] und 1d4 × 10 Silber
 *
 *   ## Notiz
 *
 *   …
 *
 * Eine Zeile je Eintrag, die Spanne davor ist freiwillig. Dieselbe Form
 * gilt im Eingabefeld der Oberflaeche — wer die Datei in einem Texteditor
 * oeffnet, sieht, was er im Werkzeug getippt hat. Damit ist die Datei
 * auch das Format zum Weitergeben.
 *
 * Plattformfrei, damit die Tests ohne Electron laufen.
 */
import { parseDiceExpression } from '@suite/dice';
import { alsWuerfel, finde, verweise, type Eintrag, type Tabelle } from '@suite/tabellen';

export interface Gespeichert extends Tabelle {
  readonly notiz: string;
  readonly geaendert: string;
}

export function zuId(name: string): string {
  const sauber = name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sauber || 'tabelle';
}

export function freieKennung(wunsch: string, vergeben: Iterable<string>): string {
  const belegt = new Set(vergeben);
  if (!belegt.has(wunsch)) return wunsch;
  let n = 2;
  while (belegt.has(`${wunsch}-${n}`)) n += 1;
  return `${wunsch}-${n}`;
}

/** Der naechste freie Name der Form „Tabelle_3". */
export function naechsterName(grund: string, namen: Iterable<string>): string {
  const belegt = new Set([...namen].map((n) => n.toLowerCase()));
  let n = 1;
  while (belegt.has(`${grund}_${n}`.toLowerCase())) n += 1;
  return `${grund}_${n}`;
}

/** „1-3: Text", „4: Text" oder nur „Text". Der Gedankenstrich zaehlt wie der Bindestrich. */
const SPANNE = /^(\d+)(?:\s*[-–]\s*(\d+))?\s*:\s*(.*)$/;

/** Die Zeilen des Eingabefelds als Eintraege. Leere Zeilen fallen weg. */
export function alsEintraege(zeilen: string): Eintrag[] {
  const heraus: Eintrag[] = [];
  for (const roh of zeilen.split(/\r?\n/)) {
    const zeile = roh.trim();
    if (!zeile) continue;
    const m = SPANNE.exec(zeile);
    if (m && m[3].trim()) {
      const a = Number(m[1]);
      const b = m[2] === undefined ? a : Number(m[2]);
      heraus.push({ text: m[3].trim(), von: Math.min(a, b), bis: Math.max(a, b) });
    } else {
      heraus.push({ text: zeile });
    }
  }
  return heraus;
}

/** Die Eintraege zurueck als Zeilen, so wie sie getippt werden. */
export function alsZeilen(eintraege: readonly Eintrag[]): string {
  return eintraege
    .map((e) => {
      if (typeof e.von !== 'number') return e.text;
      const bis = e.bis ?? e.von;
      return `${bis === e.von ? e.von : `${e.von}-${bis}`}: ${e.text}`;
    })
    .join('\n');
}

function kopfwert(wert: string): string {
  return /[:#"'\n]|^\s|\s$/.test(wert) ? JSON.stringify(wert.replace(/\n/g, ' ')) : wert;
}

export function alsMarkdown(t: Gespeichert): string {
  const teile = [
    '---',
    `name: ${kopfwert(t.name)}`,
    ...(t.wuerfel?.trim() ? [`wuerfel: ${t.wuerfel.trim()}`] : []),
    `ohneZuruecklegen: ${t.ohneZuruecklegen ? 'ja' : 'nein'}`,
    `geaendert: ${t.geaendert}`,
    '---',
    ...alsZeilen(t.eintraege)
      .split('\n')
      .filter(Boolean)
      .map((z) => `- ${z}`),
    ''
  ];
  if (t.notiz.trim()) teile.push('## Notiz', '', t.notiz.trim(), '');
  return teile.join('\n');
}

export function leseTabelle(inhalt: string, ersatzId: string): Gespeichert {
  const treffer = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(inhalt);
  const kopf: Record<string, string> = {};
  if (treffer) {
    for (const zeile of treffer[1].split(/\r?\n/)) {
      const stelle = zeile.indexOf(':');
      if (stelle <= 0) continue;
      let wert = zeile.slice(stelle + 1).trim();
      if (wert.startsWith('"')) {
        try {
          wert = JSON.parse(wert) as string;
        } catch {
          wert = wert.replace(/^"|"$/g, '');
        }
      }
      kopf[zeile.slice(0, stelle).trim()] = wert;
    }
  }
  const leib = (treffer ? treffer[2] : inhalt).replace(/\r\n/g, '\n');
  const notizStelle = leib.search(/^## Notiz\s*$/m);
  const liste = notizStelle >= 0 ? leib.slice(0, notizStelle) : leib;
  const notiz = notizStelle >= 0 ? leib.slice(notizStelle).replace(/^## Notiz\s*\n/, '').trim() : '';
  // Nur Aufzaehlungszeilen sind Eintraege; was sonst dasteht, gehoert dem
  // Menschen, der die Datei von Hand bearbeitet hat, und bleibt unbeachtet.
  const zeilen = liste
    .split('\n')
    .filter((z) => /^\s*[-*]\s+/.test(z))
    .map((z) => z.replace(/^\s*[-*]\s+/, ''))
    .join('\n');
  return {
    id: ersatzId,
    name: kopf.name || ersatzId,
    ...(kopf.wuerfel ? { wuerfel: kopf.wuerfel } : {}),
    ohneZuruecklegen: kopf.ohneZuruecklegen === 'ja',
    eintraege: alsEintraege(zeilen),
    notiz,
    geaendert: kopf.geaendert ?? ''
  };
}

/** Was die Kachel und die Suche brauchen. */
export interface Kachel {
  readonly id: string;
  readonly name: string;
  readonly wuerfel: string;
  readonly anzahl: number;
  readonly ohneZuruecklegen: boolean;
  /** Die ersten Eintraege, fuer die Kachel und die Suche. */
  readonly kurz: string;
  readonly geaendert: string;
}

export function alsKachel(t: Gespeichert): Kachel {
  return {
    id: t.id,
    name: t.name,
    wuerfel: t.wuerfel ?? '',
    anzahl: t.eintraege.length,
    ohneZuruecklegen: Boolean(t.ohneZuruecklegen),
    kurz: t.eintraege
      .map((e) => e.text)
      .join(' · ')
      .slice(0, 200),
    geaendert: t.geaendert
  };
}

/**
 * Was an der Form einer Tabelle auffaellt. Nur die Form: der Inhalt gehoert
 * der Spielleitung. Codes statt Saetze, die Oberflaeche uebersetzt.
 */
export type Befund =
  | { readonly art: 'wuerfel-unlesbar'; readonly wuerfel: string }
  | { readonly art: 'spannen-ohne-wuerfel' }
  | { readonly art: 'wuerfel-ohne-spannen' }
  | { readonly art: 'luecke'; readonly von: number; readonly bis: number }
  | { readonly art: 'doppelt'; readonly zahl: number }
  | { readonly art: 'ausserhalb'; readonly zahl: number }
  | { readonly art: 'verweis-fehlt'; readonly name: string }
  | { readonly art: 'verweis-selbst' };

export function pruefe(tabelle: Tabelle, alle: readonly Tabelle[]): Befund[] {
  const befunde: Befund[] = [];
  const mitSpanne = tabelle.eintraege.filter((e) => typeof e.von === 'number');
  const wuerfel = tabelle.wuerfel?.trim();

  if (wuerfel) {
    let spanne: { min: number; max: number } | null = null;
    try {
      const w = parseDiceExpression(alsWuerfel(wuerfel));
      spanne = { min: w.count + w.modifier, max: w.count * w.sides + w.modifier };
    } catch {
      befunde.push({ art: 'wuerfel-unlesbar', wuerfel });
    }
    if (spanne && mitSpanne.length === 0 && tabelle.eintraege.length > 0) {
      befunde.push({ art: 'wuerfel-ohne-spannen' });
    }
    // Riesige Wuerfel (1d100000) werden nicht Zahl fuer Zahl abgelaufen.
    if (spanne && mitSpanne.length > 0 && spanne.max - spanne.min <= 10000) {
      const belegt = new Map<number, number>();
      for (const e of mitSpanne) {
        // Nur bis knapp ueber den Rand: „1-1000000" soll nicht eine Million Zahlen ablegen.
        const von = Math.max(e.von as number, spanne.min - 1);
        const bis = Math.min(e.bis ?? (e.von as number), spanne.max + 1);
        for (let z = von; z <= bis; z += 1) {
          belegt.set(z, (belegt.get(z) ?? 0) + 1);
        }
      }
      // Je Befundart hoechstens ein paar Meldungen: eine Tabelle mit
      // falschem Wuerfel soll nicht hundert Zeilen Hinweise erzeugen.
      let luecke: number | null = null;
      const luecken: { von: number; bis: number }[] = [];
      for (let z = spanne.min; z <= spanne.max + 1; z += 1) {
        const frei = z <= spanne.max && !belegt.has(z);
        if (frei && luecke === null) luecke = z;
        if (!frei && luecke !== null) {
          luecken.push({ von: luecke, bis: z - 1 });
          luecke = null;
        }
      }
      for (const l of luecken.slice(0, 3)) befunde.push({ art: 'luecke', ...l });
      const doppelt = [...belegt].filter(([, n]) => n > 1).map(([z]) => z);
      for (const z of doppelt.slice(0, 3)) befunde.push({ art: 'doppelt', zahl: z });
      const aussen = [...belegt.keys()].filter((z) => z < spanne!.min || z > spanne!.max).sort((a, b) => a - b);
      if (aussen.length) befunde.push({ art: 'ausserhalb', zahl: aussen[0] });
    }
  } else if (mitSpanne.length > 0) {
    befunde.push({ art: 'spannen-ohne-wuerfel' });
  }

  // Die Tabelle selbst steht in `alle` vielleicht noch in der alten
  // Fassung; fuer die Verweise zaehlt die, die gerade bearbeitet wird.
  const bestand = [...alle.filter((t) => t.id !== tabelle.id || !tabelle.id), tabelle];
  const gemeldet = new Set<string>();
  for (const e of tabelle.eintraege) {
    for (const name of verweise(e.text)) {
      const ziel = finde(bestand, name);
      if (!ziel && !gemeldet.has(name.toLowerCase())) {
        gemeldet.add(name.toLowerCase());
        befunde.push({ art: 'verweis-fehlt', name });
      } else if (ziel === tabelle && !gemeldet.has('\u0000selbst')) {
        gemeldet.add('\u0000selbst');
        befunde.push({ art: 'verweis-selbst' });
      }
    }
  }
  return befunde;
}

/**
 * Nummeriert die Zeilen einer Tabelle (Rueckmeldung: „Entries sollen
 * automatisch nummeriert werden, die Zahl soll man aendern koennen").
 *
 * - Hat noch keine Zeile eine Nummer, bekommen alle der Reihe nach 1 bis n.
 * - Haben schon welche eine, bekommen die uebrigen die naechsten freien
 *   Zahlen nach der hoechsten. Vorhandene Nummern bleiben, wie sie sind:
 *   sie gehoeren dem Menschen.
 * - Ist kein Wuerfel eingetragen, wird er aus der hoechsten Zahl gesetzt
 *   (`1d12`). Ein eingetragener Wuerfel bleibt stehen; passt er nicht, sagt
 *   das `pruefe`.
 *
 * Plattformfrei. Liefert dieselben Werte zurueck, wenn es nichts zu tun gibt.
 */
export function nummeriere(zeilen: string, wuerfel: string): { zeilen: string; wuerfel: string } {
  const eintraege = alsEintraege(zeilen);
  if (eintraege.length === 0 || eintraege.every((e) => typeof e.von === 'number')) {
    const max = Math.max(0, ...eintraege.map((e) => e.bis ?? e.von ?? 0));
    return { zeilen, wuerfel: wuerfel.trim() || max < 2 ? wuerfel : `1d${max}` };
  }
  let naechste = Math.max(0, ...eintraege.map((e) => e.bis ?? e.von ?? 0)) + 1;
  const nummeriert = eintraege.map((e) => (typeof e.von === 'number' ? e : { ...e, von: naechste, bis: naechste++ }));
  const max = naechste - 1;
  // Unter zwei Zeilen kein Wuerfel: einen „1d1" gibt es nicht.
  return { zeilen: alsZeilen(nummeriert), wuerfel: wuerfel.trim() || max < 2 ? wuerfel : `1d${max}` };
}

/**
 * Befunde, die das Wuerfeln sperren: bei einer Luecke, einer doppelten Zahl
 * oder einer Zahl ausserhalb des Wuerfels waere das Ergebnis nicht das, was
 * die Tabelle verspricht. Hinweise wie ein fehlender Verweis sperren nicht.
 */
export function sperrt(befund: Befund): boolean {
  return befund.art === 'luecke' || befund.art === 'doppelt' || befund.art === 'ausserhalb' || befund.art === 'wuerfel-unlesbar';
}

/**
 * Ein angefangener Verweis vor dem Cursor: ein „[" in derselben Zeile, noch
 * ohne „]". Liefert, wo er beginnt, und was schon getippt ist.
 */
export function offenerVerweis(text: string, cursor: number): { von: number; suche: string } | null {
  const davor = text.slice(0, cursor);
  const von = davor.lastIndexOf('[');
  if (von < 0) return null;
  const suche = davor.slice(von + 1);
  if (/[\]\n[]/.test(suche)) return null;
  return { von, suche };
}

/**
 * Setzt den gewaehlten Namen als Verweis ein. Ein „]" direkt hinter dem
 * Cursor wird mitverwendet statt verdoppelt.
 */
export function setzeVerweis(
  text: string,
  von: number,
  cursor: number,
  name: string
): { text: string; cursor: number } {
  const danach = text.slice(cursor);
  const rest = danach.startsWith(']') ? danach.slice(1) : danach;
  const eingesetzt = `[${name}]`;
  return { text: text.slice(0, von) + eingesetzt + rest, cursor: von + eingesetzt.length };
}

/** Die Tabellen, die zu einem angefangenen Verweis passen: Anfang vor Mitte. */
export function verweisVorschlaege(namen: readonly string[], suche: string, anzahl = 8): string[] {
  const s = suche.trim().toLocaleLowerCase();
  const eindeutig = [...new Set(namen)];
  const anfang = eindeutig.filter((n) => n.toLocaleLowerCase().startsWith(s));
  const mitte = eindeutig.filter((n) => !n.toLocaleLowerCase().startsWith(s) && n.toLocaleLowerCase().includes(s));
  const sortiert = (l: string[]) => l.sort((a, b) => a.localeCompare(b));
  return [...sortiert(anfang), ...sortiert(mitte)].slice(0, anzahl);
}
