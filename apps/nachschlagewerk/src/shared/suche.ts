/**
 * Die Suche im Nachschlagewerk.
 *
 * ANDERS ALS IN DEN UEBRIGEN WERKZEUGEN wird hier auch im Text gesucht.
 * Wer in einem Nachschlagewerk „difficult terrain" eintippt, meint die
 * Stelle im Regeltext, nicht einen Eintrag, der zufaellig so heisst. Die
 * gemeinsame Suche der Huelle (Strg+K) sucht dagegen nur in Namen und
 * Stichworten — die Volltextsuche gehoert deshalb in dieses Werkzeug und
 * nicht in das gemeinsame Paket.
 *
 * Gesucht wird in BEIDEN Sprachen, gezeigt wird in einer. Wer auf Deutsch
 * eingestellt ist und „prone" tippt, findet „Liegend" — die englischen
 * Begriffe sind am Tisch ohnehin im Umlauf.
 */
import type { Sprache } from '@suite/srd';
import type { Regel } from './bestand';

/** Kleinschreibung, Umlaute vereinheitlicht — wie in der uebrigen Suche. */
export function schluessel(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    // Die SRD-Texte tragen typografische Apostrophe; getippt wird der
    // gerade. Ohne das faende „can't" nichts.
    .replace(/[’‘]/g, "'");
}

/**
 * Ein grober Wortstamm fuer englische Endungen: „grapple" soll „Grappling"
 * finden, „grappled" auch (Testbericht). Kurze Worte bleiben, wie sie sind.
 */
export function stamm(wort: string): string {
  const ohne = wort.replace(/(ing|ed|es|s|e)$/, '');
  return ohne.length >= 4 ? ohne : wort;
}

export interface Treffer {
  readonly regel: Regel;
  /** Hoeher ist besser. Name vor Text, Anfang vor Mitte. */
  readonly guete: number;
  /** Wo im Text das Gesuchte steht, fuer den Ausschnitt in der Liste. */
  readonly stelle: string | null;
}

/** Ein Ausschnitt um die Fundstelle, damit man sieht, WARUM etwas passt. */
function ausschnitt(text: string, wort: string): string | null {
  const flach = text.replace(/\s+/g, ' ');
  const index = schluessel(flach).indexOf(wort);
  if (index < 0) return null;
  const von = Math.max(0, index - 40);
  const bis = Math.min(flach.length, index + wort.length + 60);
  return `${von > 0 ? '… ' : ''}${flach.slice(von, bis).trim()}${bis < flach.length ? ' …' : ''}`;
}

export function finde(
  regeln: readonly Regel[],
  suche: string,
  sprache: Sprache
): Treffer[] {
  const worte = schluessel(suche).split(/\s+/).filter(Boolean);
  if (worte.length === 0) {
    return regeln.map((regel) => ({ regel, guete: 0, stelle: null }));
  }
  const ganz = worte.join(' ');

  const heraus: Treffer[] = [];
  for (const regel of regeln) {
    // Auf Deutsch wird in beiden Sprachen gesucht (englische Begriffe sind
    // am Tisch ueblich), auf Englisch nur im Englischen: sonst stuende ein
    // Treffer da, dessen Grund ein deutscher Satz ist, der nie gezeigt wird.
    // Die Namen immer in beiden Sprachen: „Feuerball" findet auch auf
    // Englisch den Fireball (Testbericht). Der Text bleibt bei der Regel oben.
    const namen = schluessel(`${regel.name.de} ${regel.name.en}`);
    const text = schluessel(sprache === 'de' ? `${regel.text.de} ${regel.text.en}` : regel.text.en);
    // Alle Worte muessen vorkommen, irgendwo — sonst wird die Liste mit
    // jedem getippten Wort laenger statt kuerzer.
    const imNamen = (wort: string) => namen.includes(wort) || namen.includes(stamm(wort));
    if (!worte.every((wort) => imNamen(wort) || text.includes(wort) || text.includes(stamm(wort)))) continue;

    let guete = 0;
    const eigenerName = schluessel(regel.name[sprache]);
    const andererName = schluessel(regel.name[sprache === 'de' ? 'en' : 'de']);
    if (eigenerName === ganz || andererName === ganz) guete += 100;
    else if (eigenerName.startsWith(ganz) || eigenerName.startsWith(stamm(ganz))) guete += 60;
    else if (namen.includes(ganz)) guete += 40;
    for (const wort of worte) if (imNamen(wort)) guete += 10;
    // Bei gleicher Guete die Regeln vor Zaubern, Gegenstaenden und Ausruestung:
    // wer „grapple" tippt, sucht die Regel.
    if (guete > 0 && !['zauber', 'gegenstand', 'ausruestung'].includes(regel.art)) guete += 5;

    // Die Fundstelle zeigen, wenn es NICHT am Namen lag: dann ist sie der
    // Grund, warum der Eintrag ueberhaupt in der Liste steht.
    const amNamen = worte.every((wort) => imNamen(wort));
    const stelle = amNamen
      ? null
      : ausschnitt(regel.text[sprache], ganz) ??
        ausschnitt(regel.text[sprache], worte[0]) ??
        (sprache === 'de' ? ausschnitt(regel.text.en, ganz) : null);

    heraus.push({ regel, guete, stelle });
  }
  return heraus.sort(
    (a, b) => b.guete - a.guete || a.regel.name[sprache].localeCompare(b.regel.name[sprache], sprache)
  );
}
