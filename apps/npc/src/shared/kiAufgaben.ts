/**
 * Was der NPC Creator ein Sprachmodell fragt.
 *
 * Der Unterschied zum Assistenten des Backstory Creators ist grundsaetzlich:
 * dort darf das Modell ausdruecklich NICHT schreiben, weil die
 * Hintergrundgeschichte der Autorin gehoert. Hier soll es schreiben — eine
 * Randfigur, die gleich am Tisch auftaucht, will niemand selbst ausformulieren.
 *
 * Und es ist nicht an die Tabellen gebunden. Die Tabellen sind der Weg ohne
 * KI und bleiben, wie sie sind; das Modell schlaegt daneben frei vor. Waere
 * es auf die Tabelleneintraege festgelegt, waere es ein langsamer und teurer
 * Wuerfel.
 *
 * Plattformfrei: kein node:*, kein electron. Hier steht nur Text und
 * Auswertung, damit sich beides pruefen laesst, ohne ein Modell zu fragen.
 */
import { FELDER, type Feld, type Figur, type Wuensche } from './erzeuge';
import { ARCHETYPEN, SPEZIES, text, type Sprache } from './tabellen';

/** Die Beschriftungen der Felder, wie sie auch in der Oberflaeche stehen. */
const BESCHRIFTUNG: Record<Feld, { de: string; en: string }> = {
  name: { de: 'Name', en: 'Name' },
  spezies: { de: 'Spezies', en: 'Species' },
  beruf: { de: 'Tätigkeit', en: 'Occupation' },
  aussehen: { de: 'Auffällig', en: 'Notable' },
  motivation: { de: 'Will', en: 'Wants' },
  geheimnis: { de: 'Verschweigt', en: 'Hides' },
  eigenheit: { de: 'Eigenheit', en: 'Quirk' }
};

/**
 * Wie lang ein Feld hoechstens sein darf.
 *
 * Die Tabelleneintraege sind Halbsaetze. Ein Modell, dem man nichts sagt,
 * schreibt einen Absatz, und die Figur laesse sich nicht mehr ueberfliegen —
 * was der ganze Sinn dieses Werkzeugs ist.
 */
export const MAX_ZEICHEN = 120;

const REGELN: Record<'de' | 'en', string> = {
  de: [
    'Du erfindest Nebenfiguren für ein Pen-and-Paper-Rollenspiel in einer Fantasywelt.',
    '',
    'Es sind Leute, denen die Gruppe im Vorbeigehen begegnet: eine Wache, eine Wirtin,',
    'jemand am Hafen. Keine Helden, keine Schicksalsträger.',
    '',
    'Regeln:',
    '- Jedes Feld ist ein Halbsatz, höchstens ' + MAX_ZEICHEN + ' Zeichen. Keine Absätze.',
    '- Konkret statt allgemein. „riecht nach kaltem Rauch" statt „wirkt geheimnisvoll".',
    '- Keine Werte, keine Stufen, keine Regelbegriffe.',
    '- Die Felder müssen zueinander passen.',
    '- Antworte nur mit JSON, ohne Erklärung drumherum.'
  ].join('\n'),
  en: [
    'You invent minor characters for a tabletop fantasy role-playing game.',
    '',
    'These are people the party passes by: a guard, an innkeeper, someone at the docks.',
    'Not heroes, not chosen ones.',
    '',
    'Rules:',
    '- Each field is half a sentence, at most ' + MAX_ZEICHEN + ' characters. No paragraphs.',
    '- Concrete, not general. "smells of cold smoke" rather than "seems mysterious".',
    '- No stats, no levels, no rules terms.',
    '- The fields must fit together.',
    '- Answer with JSON only, no explanation around it.'
  ].join('\n')
};

export function systemAnweisung(sprache: Sprache): string {
  return REGELN[sprache === 'en' ? 'en' : 'de'];
}

/** Die Vorgaben als Satz, oder leer, wenn keine gesetzt sind. */
function vorgaben(wuensche: Wuensche, sprache: Sprache): string[] {
  const zeilen: string[] = [];
  const archetyp = ARCHETYPEN.find((eintrag) => eintrag.id === wuensche.archetyp);
  if (archetyp && archetyp.id !== 'beliebig') {
    // Der Archetyp ist im Innenleben eine Kennung; was er meint, sagen die
    // Berufe, die er nennt. Die gehen mit, damit das Modell die Richtung
    // kennt, ohne an die Liste gebunden zu sein.
    zeilen.push(
      sprache === 'de'
        ? `Richtung: etwas in der Art von ${archetyp.berufe.slice(0, 6).join(', ')}.`
        : `Direction: something along the lines of ${archetyp.berufe.slice(0, 6).join(', ')}.`
    );
  }
  if (wuensche.klang) {
    const klang =
      sprache === 'de'
        ? { weiblich: 'feminin', maennlich: 'maskulin', neutral: 'geschlechtsneutral' }
        : { weiblich: 'feminine', maennlich: 'masculine', neutral: 'gender-neutral' };
    zeilen.push(
      sprache === 'de'
        ? `Der Name soll ${klang[wuensche.klang]} klingen.`
        : `The name should sound ${klang[wuensche.klang]}.`
    );
  }
  if (wuensche.spezies >= 0 && wuensche.spezies < SPEZIES.length) {
    const art = text(SPEZIES[wuensche.spezies], sprache);
    zeilen.push(sprache === 'de' ? `Die Spezies ist: ${art}.` : `The species is: ${art}.`);
  }
  return zeilen;
}

/** Die Figur, wie sie gerade dasteht — als Zeilen fuer das Modell. */
function beschreibe(figur: Figur, sprache: Sprache, ohne?: Feld): string[] {
  return FELDER.filter((feld) => feld !== ohne && figur[feld].trim()).map(
    (feld) => `${BESCHRIFTUNG[feld][sprache === 'en' ? 'en' : 'de']}: ${figur[feld]}`
  );
}

/**
 * Ein einzelnes Feld vorschlagen.
 *
 * Die uebrigen Felder gehen als Umgebung mit: ein Geheimnis soll zu der Figur
 * passen, die schon dasteht, und nicht zu irgendeiner.
 */
export function feldAnweisung(
  feld: Feld,
  figur: Figur,
  wuensche: Wuensche,
  sprache: Sprache
): string {
  const de = sprache !== 'en';
  const name = BESCHRIFTUNG[feld][de ? 'de' : 'en'];
  const umgebung = beschreibe(figur, sprache, feld);

  const teile = [
    de
      ? `Schlage einen neuen Wert für das Feld „${name}" vor.`
      : `Suggest a new value for the field "${name}".`
  ];

  if (umgebung.length > 0) {
    teile.push('', de ? 'Die Figur bisher:' : 'The character so far:', ...umgebung);
  }
  const vorgabezeilen = vorgaben(wuensche, sprache);
  if (vorgabezeilen.length > 0) teile.push('', ...vorgabezeilen);

  if (feld === 'eigenheit') {
    // Ohne diesen Satz liefert das Modell eine schrullige Marotte, und die
    // Figur wird zur Karikatur. Bei den Tabellen sorgt dafuer die
    // Wahrscheinlichkeit; hier muss es dastehen.
    teile.push(
      '',
      de
        ? 'Eine Kleinigkeit, keine Schrulle. Etwas, das am Tisch einmal auffällt und dann nicht mehr.'
        : 'Something small, not a running gag. Something noticed once at the table and then not again.'
    );
  }

  teile.push(
    '',
    de
      ? `Antworte als JSON: {"wert": "…"} — höchstens ${MAX_ZEICHEN} Zeichen, auf Deutsch.`
      : `Answer as JSON: {"wert": "…"} — at most ${MAX_ZEICHEN} characters, in English.`
  );
  return teile.join('\n');
}

/**
 * Eine ganze Figur erfinden.
 *
 * Festgehaltene Felder gehen als gesetzt mit und werden nicht neu erfunden —
 * genau wie beim Wuerfeln. Sonst waere das Schloss beim KI-Knopf wirkungslos,
 * und das faellt erst auf, wenn der gute Name weg ist.
 */
export function figurAnweisung(
  figur: Figur | null,
  festgehalten: readonly Feld[],
  wuensche: Wuensche,
  sprache: Sprache
): string {
  const de = sprache !== 'en';
  const behalten = FELDER.filter((feld) => festgehalten.includes(feld) && figur?.[feld].trim());
  const gesucht = FELDER.filter((feld) => !behalten.includes(feld));

  const teile = [de ? 'Erfinde eine Nebenfigur.' : 'Invent a minor character.'];

  if (behalten.length > 0 && figur) {
    teile.push(
      '',
      de ? 'Das steht fest und bleibt so:' : 'This is fixed and stays as it is:',
      ...behalten.map((feld) => `${BESCHRIFTUNG[feld][de ? 'de' : 'en']}: ${figur[feld]}`)
    );
  }

  const vorgabezeilen = vorgaben(wuensche, sprache);
  if (vorgabezeilen.length > 0) teile.push('', ...vorgabezeilen);

  teile.push(
    '',
    de
      ? 'Antworte als JSON mit genau diesen Schlüsseln:'
      : 'Answer as JSON with exactly these keys:',
    `{${gesucht.map((feld) => `"${feld}": "…"`).join(', ')}}`,
    '',
    de
      ? `Jeder Wert höchstens ${MAX_ZEICHEN} Zeichen, auf Deutsch. „eigenheit" darf leer bleiben — die meisten Leute haben keine.`
      : `Each value at most ${MAX_ZEICHEN} characters, in English. "eigenheit" may stay empty — most people have none.`
  );
  return teile.join('\n');
}

/**
 * Macht aus dem, was das Modell geschickt hat, brauchbare Feldwerte.
 *
 * Grosszuegig beim Lesen, streng beim Uebernehmen: unbekannte Schluessel
 * fallen weg, Werte werden gekuerzt, und alles andere als Text zaehlt nicht.
 * Ein Modell, das sich nicht an die Abmachung haelt, darf die Figur nicht
 * kaputt machen.
 */
export function uebernehmbareFelder(gelesen: unknown): Partial<Record<Feld, string>> {
  if (typeof gelesen !== 'object' || gelesen === null) return {};
  const roh = gelesen as Record<string, unknown>;
  const ergebnis: Partial<Record<Feld, string>> = {};

  for (const feld of FELDER) {
    const wert = roh[feld];
    if (typeof wert !== 'string') continue;
    // Zeilenumbrueche raus: die Felder sind einzeilige Eingaben, und ein
    // Umbruch darin waere unsichtbar und trotzdem im Export.
    const sauber = wert.replace(/\s+/g, ' ').trim().slice(0, MAX_ZEICHEN);
    // Die Eigenheit darf leer sein — das ist der Normalfall. Bei allen
    // anderen Feldern ist leer keine Antwort.
    if (sauber || feld === 'eigenheit') ergebnis[feld] = sauber;
  }
  return ergebnis;
}

/** Dasselbe fuer die Antwort auf eine Frage nach einem einzelnen Feld. */
export function uebernehmbarerWert(gelesen: unknown): string | null {
  if (typeof gelesen !== 'object' || gelesen === null) return null;
  const wert = (gelesen as Record<string, unknown>).wert;
  if (typeof wert !== 'string') return null;
  return wert.replace(/\s+/g, ' ').trim().slice(0, MAX_ZEICHEN);
}
