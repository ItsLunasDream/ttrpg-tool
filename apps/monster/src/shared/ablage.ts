/**
 * Ein Monster als Markdown mit YAML-Kopf.
 *
 * Dasselbe Muster wie bei den Notizen des Story Creators und den Begegnungen
 * des Trackers: eine Datei, die man in jedem Texteditor lesen und aendern
 * kann. Wer das Werkzeug nicht mehr benutzt, behaelt seine Monster.
 *
 * DER KOPF IST DIE SCHNITTSTELLE.
 * ==============================
 * Im YAML-Kopf stehen ALLE Zahlen, die eine Begegnungsrechnung braucht —
 * `cr`, `tp`, `rk`, `schaden_pro_runde`, `angriffsbonus`, `rolle`, `thema`.
 * Nicht, weil YAML schoen waere, sondern damit der Encounter Creator sie
 * lesen kann, ohne den Statblock zu zerlegen. Wer erst Prosa auseinander-
 * nehmen muesste, um an den CR zu kommen, hat schon verloren.
 *
 * Deshalb ist die Ablage auch die einzige Verbindung zwischen den beiden
 * Werkzeugen: derselbe Ordner, kein Kanal. Das ist die billigste Kopplung,
 * die es gibt, und sie ueberlebt, wenn eines von beiden umgebaut wird.
 *
 * Plattformfrei: hier wird nur Text gebaut und gelesen, keine Datei
 * angefasst. Das erledigt der Hauptprozess.
 */

import type { Monster } from './erzeuge';
import { schadenJeAngriff } from './erzeuge';
import type { Sprache } from './tabellen';

/** Was ausser dem Monster noch in der Datei steht. */
export interface Abgelegt extends Monster {
  readonly id: string;
  /** ISO-Zeitpunkt. Fuers Sortieren nach „zuletzt". */
  readonly geaendert: string;
}

/** Aus einem Namen eine Dateikennung machen. */
export function zuId(name: string): string {
  const sauber = name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // Ein leerer Name darf keine Datei ohne Namen ergeben.
  return sauber || 'monster';
}

/** YAML-sicher: Werte, die der Leser sonst falsch versteht, kommen in Anfuehrungszeichen. */
function alsYaml(wert: string): string {
  return /^[A-Za-z0-9äöüÄÖÜß ._-]*$/.test(wert) && wert.trim() === wert && wert !== ''
    ? wert
    : JSON.stringify(wert);
}

export function alsMarkdown(monster: Abgelegt, sprache: Sprache): string {
  const de = sprache !== 'en';
  const w = monster.werte;
  const kopf = [
    '---',
    `id: ${alsYaml(monster.id)}`,
    `name: ${alsYaml(monster.name)}`,
    `cr: ${alsYaml(monster.cr)}`,
    `thema: ${alsYaml(monster.themaId)}`,
    `rolle: ${alsYaml(monster.rolleId)}`,
    `tp: ${w.tp}`,
    `rk: ${w.rk}`,
    `schaden_pro_runde: ${w.schadenProRunde}`,
    `angriffsbonus: ${w.angriffsbonus}`,
    `angriffe: ${monster.angriffe}`,
    `legendaer: ${w.legendaer ? 'true' : 'false'}`,
    `geaendert: ${monster.geaendert}`,
    'schemaVersion: 1',
    '---',
    ''
  ];

  const leib = [
    `# ${monster.name}`,
    '',
    `*${monster.thema} · ${monster.rolle} · ${de ? 'Grad' : 'CR'} ${monster.cr}*`,
    '',
    monster.satz,
    '',
    `**${de ? 'Rüstungsklasse' : 'Armor Class'}** ${w.rk}`,
    '',
    `**${de ? 'Trefferpunkte' : 'Hit Points'}** ${w.tp}`,
    '',
    `**${de ? 'Umgebung' : 'Environment'}** ${monster.umgebung}`,
    '',
    `## ${de ? 'Aktionen' : 'Actions'}`,
    '',
    monster.angriffe > 1
      ? `***${de ? 'Mehrfachangriff' : 'Multiattack'}.*** ${
          de
            ? `Es macht ${monster.angriffe} Angriffe.`
            : `It makes ${monster.angriffe} attacks.`
        }`
      : '',
    monster.angriffe > 1 ? '' : '',
    `***${de ? 'Angriff' : 'Attack'}.*** +${w.angriffsbonus} ${
      de ? 'auf Treffer' : 'to hit'
    }. ${de ? 'Schaden' : 'Damage'}: ${schadenJeAngriff(monster)} ${monster.schadensart}.`,
    '',
    `*${de ? 'Schaden pro Runde' : 'Damage per round'}: ${w.schadenProRunde}*`,
    ''
  ].filter((zeile, stelle, alle) => !(zeile === '' && alle[stelle - 1] === ''));

  const faehigkeiten =
    monster.faehigkeiten.length > 0
      ? [`## ${de ? 'Fähigkeiten' : 'Features'}`, '', ...monster.faehigkeiten.flatMap((f) => [`***${f.name}.*** ${f.text}`, ''])]
      : [];

  return [...kopf, ...leib, ...faehigkeiten].join('\n');
}

/**
 * Den YAML-Kopf zurueckliefern, ohne den Rest zu lesen.
 *
 * Genau das braucht der Encounter Creator: er will die Zahlen und nicht die
 * Prosa. Bewusst ein winziger Leser und kein YAML-Paket — der Kopf hat ein
 * festes Format, das dieses Werkzeug selbst schreibt.
 */
export function liesKopf(inhalt: string): Record<string, string> {
  const treffer = /^---\r?\n([\s\S]*?)\r?\n---/.exec(inhalt);
  if (!treffer) return {};
  const heraus: Record<string, string> = {};
  for (const zeile of treffer[1].split(/\r?\n/)) {
    const doppelpunkt = zeile.indexOf(':');
    if (doppelpunkt < 1) continue;
    const schluessel = zeile.slice(0, doppelpunkt).trim();
    let wert = zeile.slice(doppelpunkt + 1).trim();
    if (wert.startsWith('"')) {
      try {
        wert = JSON.parse(wert) as string;
      } catch {
        // Eine kaputte Zeile macht nicht die ganze Datei kaputt.
      }
    }
    heraus[schluessel] = wert;
  }
  return heraus;
}

/** Nur das Noetigste fuer Liste und Kacheln — ohne den Leib zu lesen. */
export interface Eintrag {
  readonly id: string;
  readonly name: string;
  readonly cr: string;
  readonly themaId: string;
  readonly rolleId: string;
  readonly tp: number;
  readonly rk: number;
  readonly geaendert: string;
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
    cr: kopf.cr || '1',
    themaId: kopf.thema || '',
    rolleId: kopf.rolle || '',
    tp: zahl('tp'),
    rk: zahl('rk'),
    geaendert: kopf.geaendert || ''
  };
}
