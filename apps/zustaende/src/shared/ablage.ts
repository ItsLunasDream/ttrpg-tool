/**
 * Ein Zustand als Markdown mit YAML-Kopf.
 *
 * Dasselbe Muster wie bei den Monstern und den Begegnungen des Trackers:
 * eine Datei, die man in jedem Texteditor lesen und aendern kann. Wer das
 * Werkzeug nicht mehr benutzt, behaelt seine Zustaende.
 *
 * DER KOPF IST DIE SCHNITTSTELLE ZUM TRACKER.
 * ==========================================
 * Der Initiative Tracker kennt heute Zustaende mit Dauer. Damit er einen
 * eigenen anzeigen kann, braucht er Name, Zeichen, Farbe und die Zahl der
 * Stufen — alles in Zahlen und kurzen Worten, nicht in Prosa. Er liest
 * denselben Ordner; einen Kanal zwischen den beiden Werkzeugen gibt es
 * nicht und soll es nicht geben.
 *
 * Ein Zustand gehoert dabei ausdruecklich KEINER Kampagne: er ist
 * Handwerkszeug, das ueber Kampagnen hinweg gilt. Deshalb liegt er im
 * Datenordner des Werkzeugs und nicht im Vault des Story Creators.
 */

import { gesamtgewicht, betragVon } from './gewicht';
import { eichname, naechsterVergleich } from './eichung';
import type { Zustand } from './erzeuge';
import { wirkung } from './wirkungen';
import { text, type Sprache } from './tabellen';

export interface Abgelegt extends Zustand {
  readonly id: string;
  /** ISO-Zeitpunkt. Fuers Sortieren nach „zuletzt". */
  readonly geaendert: string;
}

/** Was die Sammlung von einer Datei wissen muss, ohne sie ganz zu lesen. */
export interface Eintrag {
  readonly id: string;
  readonly name: string;
  readonly artId: string;
  readonly themaId: string;
  readonly haerteId: string;
  readonly stufen: number;
  readonly gewicht: number;
  readonly zeichen: string;
  readonly farbe: string;
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
  return sauber || 'zustand';
}

/** YAML-sicher: Werte, die der Leser sonst falsch versteht, kommen in Anfuehrungszeichen. */
function alsYaml(wert: string): string {
  return /^[A-Za-z0-9äöüÄÖÜß ._-]*$/.test(wert) && wert.trim() === wert && wert !== ''
    ? wert
    : JSON.stringify(wert);
}

export function alsMarkdown(zustand: Abgelegt, sprache: Sprache): string {
  const de = sprache !== 'en';
  const gewicht = gesamtgewicht(zustand.stufen);
  const vergleich = naechsterVergleich(gewicht);

  const kopf = [
    '---',
    `id: ${alsYaml(zustand.id)}`,
    `name: ${alsYaml(zustand.name)}`,
    `art: ${alsYaml(zustand.artId)}`,
    `thema: ${alsYaml(zustand.themaId)}`,
    `haerte: ${alsYaml(zustand.haerteId)}`,
    `wirkrichtung: ${alsYaml(zustand.wirkrichtung)}`,
    `stufen: ${zustand.stufen.length}`,
    `gewicht: ${gewicht}`,
    // Zeichen und Farbe stehen im Kopf, damit der Tracker sie holen kann,
    // ohne den Leib zu lesen.
    `zeichen: ${alsYaml(zustand.zeichen)}`,
    `farbe: ${alsYaml(zustand.farbe)}`,
    `dauer: ${alsYaml(zustand.dauer)}`,
    `geaendert: ${zustand.geaendert}`,
    'schemaVersion: 1',
    '---',
    ''
  ];

  const leib: string[] = [
    `# ${zustand.zeichen} ${zustand.name}`,
    '',
    `*${zustand.art} · ${zustand.thema} · ${zustand.haerte}*`,
    '',
    zustand.kurzsatz,
    ''
  ];

  if (zustand.stufen.length > 1) {
    leib.push(`## ${de ? 'Stufen' : 'Levels'}`, '');
    for (const stufe of zustand.stufen) {
      const wirkungen = stufe.wirkungen
        .map((id) => {
          const gefunden = wirkung(id);
          return gefunden ? text(gefunden.text, sprache) : id;
        })
        .join(de ? '; ' : '; ');
      leib.push(`${stufe.nummer}. ${wirkungen}`);
    }
    leib.push('');
  } else if (zustand.stufen.length === 1) {
    const wirkungen = zustand.stufen[0].wirkungen
      .map((id) => {
        const gefunden = wirkung(id);
        return gefunden ? text(gefunden.text, sprache) : id;
      })
      .join('; ');
    leib.push(`**${de ? 'Wirkung' : 'Effect'}** ${wirkungen}`, '');
  }

  leib.push(
    `**${de ? 'Dauer' : 'Duration'}** ${zustand.dauer}`,
    '',
    `**${de ? 'Schlimmer' : 'Worse'}** ${zustand.verschlimmerung}`,
    '',
    `**${de ? 'Besser' : 'Better'}** ${zustand.linderung}`,
    ''
  );

  if (zustand.ausloeser !== '') {
    leib.push(`**${de ? 'Ausgelöst' : 'Triggered'}** ${zustand.ausloeser}`, '');
  }

  /*
   * Das Gewicht steht mit seinem Vergleich da, nie allein.
   *
   * „Wiegt 14" sagt niemandem etwas. „Wiegt so viel wie Erschoepfung 5"
   * sagt jedem alles. Und der Satz darunter sagt, was die Zahl NICHT
   * bedeutet — sonst liest sie jemand als Balance-Urteil.
   */
  leib.push(
    `*${de ? 'Gewicht' : 'Weight'}: ${betragVon(gewicht)} — ${
      de ? 'etwa so viel wie' : 'about as much as'
    } ${eichname(vergleich, sprache)}.*`,
    '',
    `*${
      de
        ? 'Das Gewicht sagt, wie schwer der Zustand wiegt, solange er anliegt. Ob er für deine Runde zu hart ist, hängt daran, wie oft man ihn bekommt — und das weiß nur dein Tisch.'
        : 'The weight says how much the condition weighs while it lasts. Whether it is too harsh for your table depends on how often you get it — and only your table knows that.'
    }*`,
    ''
  );

  const alles = [...leib].filter(
    (zeile, stelle, liste) => !(zeile === '' && liste[stelle - 1] === '')
  );
  return [...kopf, ...alles].join('\n');
}

/**
 * Den YAML-Kopf zurueckliefern, ohne den Rest zu lesen.
 *
 * Bewusst ein winziger Leser und kein YAML-Paket — der Kopf hat ein festes
 * Format, das dieses Werkzeug selbst schreibt.
 */
export function liesKopf(inhalt: string): Record<string, string> {
  const heraus: Record<string, string> = {};
  const zeilen = inhalt.split(/\r?\n/);
  if (zeilen[0]?.trim() !== '---') return heraus;

  for (let i = 1; i < zeilen.length; i += 1) {
    const zeile = zeilen[i];
    if (zeile.trim() === '---') break;
    const doppelpunkt = zeile.indexOf(':');
    if (doppelpunkt <= 0) continue;
    const name = zeile.slice(0, doppelpunkt).trim();
    const roh = zeile.slice(doppelpunkt + 1).trim();
    heraus[name] = roh.startsWith('"') ? sicherGelesen(roh) : roh;
  }
  return heraus;
}

function sicherGelesen(roh: string): string {
  try {
    const gelesen = JSON.parse(roh) as unknown;
    return typeof gelesen === 'string' ? gelesen : roh;
  } catch {
    return roh;
  }
}

export function alsEintrag(inhalt: string, rueckfallId: string): Eintrag {
  const kopf = liesKopf(inhalt);
  const zahl = (name: string) => {
    const wert = Number(kopf[name]);
    return Number.isFinite(wert) ? wert : 0;
  };
  return {
    id: kopf.id || rueckfallId,
    name: kopf.name || rueckfallId,
    artId: kopf.art || '',
    themaId: kopf.thema || '',
    haerteId: kopf.haerte || '',
    stufen: zahl('stufen'),
    gewicht: zahl('gewicht'),
    zeichen: kopf.zeichen || '◈',
    farbe: kopf.farbe || '#7a8ca8',
    geaendert: kopf.geaendert || ''
  };
}
