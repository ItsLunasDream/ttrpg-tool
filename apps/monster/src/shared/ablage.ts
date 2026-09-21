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
import { angriffeProRunde } from './erzeuge';
import { ATTRIBUTE, alsVorzeichen, attributKuerzel, modifikator, rettungsSg } from './attribute';
import { alsZeile } from './bewegung';
import { angriffName, angriffSchaden, reichweiteText, WAFFEN, type Angriff } from './angriffe';
import { schadensartName } from './schadensarten';
import type { Kategorie, Sprache } from './tabellen';

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

/**
 * Die ganze Datei: Kopfzahlen als YAML, darunter der Statblock.
 *
 * So liegt ein Monster auf der Platte. Der Kopf ist fuer Maschinen — die
 * Sammlung liest daraus ihre Kacheln, ohne den Leib zu zerlegen.
 */
export function alsMarkdown(monster: Abgelegt, sprache: Sprache): string {
  return [...kopfzeilen(monster), ...leibzeilen(monster, sprache)].join('\n');
}

/**
 * Nur der Statblock, ohne die Kopfzahlen.
 *
 * Fuer den Weg in den Story Creator: dort ist der Kopf keine Verwaltung mehr,
 * sondern steht als Absatz im Text — „id: … name: … schemaVersion: 2" mitten
 * in der Notiz. Wer ein Monster in eine Notiz schiebt, will den Statblock.
 */
export function alsLeib(monster: Abgelegt, sprache: Sprache): string {
  return leibzeilen(monster, sprache).join('\n');
}

function kopfzeilen(monster: Abgelegt): string[] {
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
    `angriffe: ${angriffeProRunde(monster)}`,
    `legendaer: ${w.legendaer ? 'true' : 'false'}`,
    // Die Attribute einzeln und nicht als Block: der Encounter Creator soll
    // sie mit demselben winzigen Leser holen koennen wie alles andere.
    ...ATTRIBUTE.map((id) => `${id}: ${monster.attribute[id]}`),
    `tempo: ${monster.bewegung.gangarten[0]?.fuss ?? 30}`,
    `resistenzen: ${alsYaml(monster.widerstaende.resistenzen.join(' '))}`,
    `immunitaeten: ${alsYaml(monster.widerstaende.immunitaeten.join(' '))}`,
    `verwundbarkeiten: ${alsYaml(monster.widerstaende.verwundbarkeiten.join(' '))}`,
    `geaendert: ${monster.geaendert}`,
    'schemaVersion: 2',
    '---',
    ''
  ];
  return kopf;
}

function leibzeilen(monster: Abgelegt, sprache: Sprache): string[] {
  const de = sprache !== 'en';
  const w = monster.werte;

  /*
   * Der Leib ist ein Statblock, kein Bericht.
   *
   * Aufbau und Reihenfolge wie in D&D: Kopf, Ruestung und Trefferpunkte,
   * Bewegung, die sechs Attribute, dann was es aushaelt, dann was es kann,
   * und zuletzt, was es tut. Wer den Block am Tisch liest, sucht immer an
   * derselben Stelle.
   */
  const leib: string[] = [
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
    `**${de ? 'Bewegung' : 'Speed'}** ${alsZeile(monster.bewegung, sprache)}`,
    ''
  ];

  // Die sechs Attribute als Tabelle — so steht es im Buch, und so liest es
  // sich auch in einem Texteditor ohne Formatierung.
  leib.push(
    `| ${ATTRIBUTE.map((id) => attributKuerzel(id, sprache)).join(' | ')} |`,
    `|${ATTRIBUTE.map(() => ' --- |').join('')}`,
    `| ${ATTRIBUTE.map((id) => {
      const wert = monster.attribute[id];
      return `${wert} (${alsVorzeichen(modifikator(wert))})`;
    }).join(' | ')} |`,
    ''
  );

  const liste = (arten: readonly string[]) =>
    arten.map((id) => schadensartName(id, sprache)).join(', ');

  if (monster.widerstaende.verwundbarkeiten.length > 0) {
    leib.push(
      `**${de ? 'Verwundbarkeiten' : 'Damage Vulnerabilities'}** ${liste(monster.widerstaende.verwundbarkeiten)}`,
      ''
    );
  }
  if (monster.widerstaende.resistenzen.length > 0) {
    leib.push(
      `**${de ? 'Resistenzen' : 'Damage Resistances'}** ${liste(monster.widerstaende.resistenzen)}`,
      ''
    );
  }
  if (monster.widerstaende.immunitaeten.length > 0) {
    leib.push(
      `**${de ? 'Immunitäten' : 'Damage Immunities'}** ${liste(monster.widerstaende.immunitaeten)}`,
      ''
    );
  }

  leib.push(`**${de ? 'Umgebung' : 'Environment'}** ${monster.umgebung}`, '');

  // Passive Faehigkeiten stehen ueber den Aktionen, ohne Ueberschrift —
  // genau wie im Buch.
  const passiv = monster.faehigkeiten.filter((f) => f.kategorie === 'passiv');
  for (const f of passiv) leib.push(`***${f.name}.*** ${f.text}`, '');

  const abschnitt = (kategorie: Kategorie, titelDe: string, titelEn: string): string[] => {
    const treffer = monster.faehigkeiten.filter((f) => f.kategorie === kategorie);
    if (treffer.length === 0) return [];
    return [`## ${de ? titelDe : titelEn}`, '', ...treffer.flatMap((f) => [`***${f.name}.*** ${f.text}`, ''])];
  };

  /* --- Aktionen: erst die Angriffe, dann was sonst eine Aktion kostet --- */
  const angriffe = monster.angriffe.filter((a) => a.art !== 'flaeche');
  const flaechen = monster.angriffe.filter((a) => a.art === 'flaeche');
  const aktionen: string[] = [`## ${de ? 'Aktionen' : 'Actions'}`, ''];

  const gesamt = angriffeProRunde(monster);
  if (gesamt > 1) {
    const was = angriffe
      .map((a) => `${a.anzahl}× ${angriffName(a.waffeId, sprache)}`)
      .join(de ? ' und ' : ' and ');
    aktionen.push(
      `***${de ? 'Mehrfachangriff' : 'Multiattack'}.*** ${
        de ? `Es greift ${gesamt}-mal an: ${was}.` : `It makes ${gesamt} attacks: ${was}.`
      }`,
      ''
    );
  }
  for (const angriff of angriffe) aktionen.push(angriffZeile(angriff, sprache), '');
  for (const flaeche of flaechen) aktionen.push(angriffZeile(flaeche, sprache), '');
  aktionen.push(
    `*${de ? 'Schaden pro Runde' : 'Damage per round'}: ${w.schadenProRunde}*`,
    ''
  );

  const weitereAktionen = monster.faehigkeiten.filter((f) => f.kategorie === 'aktion');
  for (const f of weitereAktionen) aktionen.splice(aktionen.length - 2, 0, `***${f.name}.*** ${f.text}`, '');

  const schluss = [
    ...aktionen,
    ...abschnitt('bonusaktion', 'Bonusaktionen', 'Bonus Actions'),
    ...abschnitt('reaktion', 'Reaktionen', 'Reactions')
  ];

  /*
   * Legendaere Aktionen stehen nur da, wenn es welche gibt — und dann mit
   * dem Satz, der erklaert, wie sie funktionieren. Ohne den Satz ist die
   * Ueberschrift eine Behauptung.
   */
  if (w.legendaer) {
    schluss.push(
      `## ${de ? 'Legendäre Aktionen' : 'Legendary Actions'}`,
      '',
      de
        ? 'Es kann 3 legendäre Aktionen einsetzen und wählt aus den folgenden Möglichkeiten. Nur eine legendäre Aktion auf einmal, und nur am Ende des Zuges einer anderen Kreatur. Zu Beginn seines Zuges bekommt es die verbrauchten zurück.'
        : 'It can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature’s turn. It regains spent legendary actions at the start of its turn.',
      ''
    );
    const legendaer = monster.faehigkeiten.filter((f) => f.kategorie === 'legendaer');
    for (const f of legendaer) schluss.push(`***${f.name}.*** ${f.text}`, '');
    // Ein Angriff als legendaere Aktion steht in fast jedem Statblock und
    // macht den Unterschied zwischen „hat legendaere Aktionen" und „tut
    // damit auch etwas".
    const erster = angriffe[0];
    if (erster) {
      schluss.push(
        de
          ? `***Angriff.*** Es macht einen ${angriffName(erster.waffeId, sprache)}-Angriff.`
          : `***Attack.*** It makes one ${angriffName(erster.waffeId, sprache)} attack.`,
        ''
      );
    }
  }

  const alles = [...leib, ...schluss].filter(
    (zeile, stelle, liste) => !(zeile === '' && liste[stelle - 1] === '')
  );
  return alles;
}

/**
 * Eine Angriffszeile, wie sie im Statblock steht.
 *
 * Nahkampf und Fernkampf mit Angriffswurf und Reichweite, Flaechen mit
 * Rettungswurf und Form. Das ist der Unterschied, um den es geht: gegen
 * einen Angriffswurf hilft Ruestung, gegen einen Rettungswurf nicht.
 */
export function angriffZeile(angriff: Angriff, sprache: Sprache): string {
  const de = sprache !== 'en';
  const waffe = WAFFEN.find((w) => w.id === angriff.waffeId);
  const name = angriffName(angriff.waffeId, sprache);
  const schaden = `${angriff.schadenJeAngriff} (${angriff.wuerfel}) ${angriffSchaden(angriff, sprache)}`;

  if (angriff.art === 'flaeche' && angriff.rettung) {
    const flaeche = waffe ? reichweiteText(waffe, sprache) : '';
    const rettung = attributKuerzel(angriff.rettung.attribut, sprache);
    const aufladen = angriff.aufladen ? (de ? ' (Aufladen 5–6)' : ' (Recharge 5–6)') : '';
    return de
      ? `***${name}${aufladen}.*** ${flaeche}. Jede Kreatur darin: Rettungswurf ${rettung} gegen SG ${angriff.rettung.sg}, sonst ${schaden}. Bei Erfolg die Hälfte.`
      : `***${name}${aufladen}.*** ${flaeche}. Each creature in the area makes a DC ${angriff.rettung.sg} ${rettung} saving throw, taking ${schaden} on a failure, or half as much on a success.`;
  }

  const art = angriff.art === 'nah' ? (de ? 'Nahkampfangriff' : 'Melee Attack') : de ? 'Fernkampfangriff' : 'Ranged Attack';
  const reichweite = waffe ? reichweiteText(waffe, sprache) : '';
  return de
    ? `***${name}.*** ${art}: +${angriff.trefferbonus ?? 0} auf Treffer, Reichweite ${reichweite}. Treffer: ${schaden}.`
    : `***${name}.*** ${art}: +${angriff.trefferbonus ?? 0} to hit, reach/range ${reichweite}. Hit: ${schaden}.`;
}

/** Der Rettungs-SG gegen die Faehigkeiten dieses Monsters. Fuer die Oberflaeche. */
export function sgVon(monster: Monster): number {
  return rettungsSg(monster.werte.angriffsbonus);
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
