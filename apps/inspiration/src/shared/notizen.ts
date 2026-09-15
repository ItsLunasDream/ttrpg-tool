/**
 * Der Entwurf als Notizen fuer den Backstory Creator.
 *
 * „Entwurf hier, Wahrheit dort" (docs/inspirationshilfe.md): dieses Werkzeug
 * fuehrt keine zweite Welt. Was bleiben soll, wandert auf Knopfdruck
 * hinueber — als Notizen mit Wiki-Verweisen untereinander, damit der Graph
 * drueben sofort etwas zu zeichnen hat.
 *
 * Zwei Formen, weil beide gebraucht werden: alles in eine Notiz, wenn man
 * nur nachlesen will, und eine Notiz je Figur und Ort, wenn daraus eine
 * Kampagne werden soll.
 */
import type { Entwurf, EntwurfsFigur, Fraktion, Ort, Verbindung } from './erzeuge';
import type { Sprache } from './tabellen';

/** Die Notiztypen des Backstory Creators, soweit hier gebraucht. */
export type NotizTyp = 'character' | 'location' | 'faction' | 'note';

export interface Notiz {
  readonly typ: NotizTyp;
  readonly titel: string;
  readonly markdown: string;
}

function w(sprache: Sprache, de: string, en: string): string {
  return sprache === 'de' ? de : en;
}

/** Ein Wiki-Verweis, wie der Backstory Creator ihn liest. */
export function verweis(titel: string): string {
  return `[[${titel}]]`;
}

/**
 * Setzt Absaetze zusammen und laesst Leeres weg.
 *
 * Mit Leerzeile dazwischen, nicht mit einfachem Umbruch: der Backstory
 * Creator liest Markdown mit `breaks: false`, und dort werden aus drei
 * Zeilen ohne Leerzeile ein einziger Absatz — „**Rolle:** … **Will:** …"
 * hintereinander weg. Zeilen, die als Liste zusammengehoeren, kommen deshalb
 * fertig verbunden als EIN Absatz herein.
 */
function zeilen(...teile: Array<string | false | null | undefined>): string {
  return teile.filter((teil): teil is string => typeof teil === 'string' && teil !== '').join('\n\n');
}

export function aufhaengerText(entwurf: Entwurf, sprache: Sprache): string {
  const a = entwurf.aufhaenger;
  return zeilen(
    a.ausloeser,
    a.betroffene,
    a.komplikation,
    a.frist && `**${w(sprache, 'Frist', 'Deadline')}:** ${a.frist}`
  );
}

export function fraktionText(fraktion: Fraktion, sprache: Sprache): string {
  return zeilen(
    `*${fraktion.art}*`,
    `**${w(sprache, 'Ziel', 'Goal')}:** ${fraktion.ziel}`,
    `**${w(sprache, 'Mittel', 'Methods')}:** ${fraktion.mittel}`,
    `**${w(sprache, 'Schwachstelle', 'Weak point')}:** ${fraktion.schwaeche}`
  );
}

export function figurText(
  figur: EntwurfsFigur,
  sprache: Sprache,
  verbindungen: readonly string[] = []
): string {
  return zeilen(
    `**${w(sprache, 'Rolle', 'Role')}:** ${figur.rolle}`,
    `**${w(sprache, 'Will', 'Wants')}:** ${figur.triebfeder}`,
    `**${w(sprache, 'Hat', 'Holds')}:** ${figur.hebel}`,
    `**${w(sprache, 'Haken', 'Snag')}:** ${figur.makel}`,
    verbindungen.length > 0 ? `### ${w(sprache, 'Verbindungen', 'Connections')}` : '',
    // Die Liste als ein Stueck: Aufzaehlungspunkte gehoeren zusammen und
    // brauchen untereinander keine Leerzeile.
    verbindungen.map((satz) => `- ${satz}`).join('\n')
  );
}

export function ortText(ort: Ort, sprache: Sprache): string {
  return zeilen(
    `*${ort.art}*`,
    ort.merkmal,
    ort.zustand,
    `**${w(sprache, 'Auf der Karte', 'On the map')}:** ${ort.karte}`
  );
}

/** Die Verbindungen einer Figur, als Saetze mit Verweis auf die Gegenseite. */
export function verbindungenVon(
  stelle: number,
  entwurf: Entwurf
): string[] {
  const satz = (verbindung: Verbindung): string => {
    const andere = verbindung.a === stelle ? verbindung.b : verbindung.a;
    const name = entwurf.figuren[andere]?.name ?? '?';
    // Beide Saetze, immer. Eine gerichtete Beziehung ist erst zu zweit zu
    // verstehen: „{a} hat {b} das Leben gerettet" heisst wenig, solange nicht
    // danebensteht, dass {b} lieber ertrunken waere.
    const beides = `${verbindung.hin} ${verbindung.zurueck}`;
    // Nur der Name der Gegenseite wird zum Verweis, der eigene nicht — eine
    // Notiz, die auf sich selbst zeigt, waere im Graph eine Schleife.
    return `**${verbindung.muster}:** ${beides.split(name).join(verweis(name))}`;
  };
  return entwurf.verbindungen
    .filter((verbindung) => verbindung.a === stelle || verbindung.b === stelle)
    .map(satz);
}

/**
 * Alles in einem Text.
 *
 * Das ist auch die Fassung, die in die Zwischenablage geht.
 */
export function alsMarkdown(entwurf: Entwurf, sprache: Sprache): string {
  const teile: string[] = [];

  teile.push(`## ${w(sprache, 'Aufhänger', 'Hook')}`, aufhaengerText(entwurf, sprache));

  if (entwurf.fraktionen.length > 0) {
    teile.push(`## ${w(sprache, 'Fraktionen', 'Factions')}`);
    for (const fraktion of entwurf.fraktionen) {
      teile.push(`### ${fraktion.name}`, fraktionText(fraktion, sprache));
    }
  }

  if (entwurf.figuren.length > 0) {
    teile.push(`## ${w(sprache, 'Figuren', 'Characters')}`);
    entwurf.figuren.forEach((figur, stelle) => {
      teile.push(`### ${figur.name}`, figurText(figur, sprache, verbindungenVon(stelle, entwurf)));
    });
  }

  if (entwurf.orte.length > 0) {
    teile.push(`## ${w(sprache, 'Orte', 'Places')}`);
    for (const ort of entwurf.orte) {
      teile.push(`### ${ort.name}`, ortText(ort, sprache));
    }
  }

  if (entwurf.zeitstrahl.length > 0) {
    teile.push(
      `## ${w(sprache, 'Wenn niemand eingreift', 'If nobody intervenes')}`,
      entwurf.zeitstrahl.map((punkt) => `- **${punkt.marke}:** ${punkt.was}`).join('\n')
    );
  }

  return teile.join('\n\n');
}

/**
 * Eine Notiz je Baustein, mit Verweisen untereinander.
 *
 * Die Uebersichtsnotiz haelt den Aufhaenger und den Zeitstrahl und verweist
 * auf alles andere. Die Titel sind die Namen aus dem Entwurf — genau die
 * stehen auch in den Verweisen, sonst zeigten sie ins Leere.
 */
export function alsNotizen(entwurf: Entwurf, sprache: Sprache, titel: string): Notiz[] {
  const notizen: Notiz[] = [];

  const liste = (ueberschrift: string, namen: readonly string[]) =>
    namen.length > 0 ? `### ${ueberschrift}\n${namen.map((name) => `- ${verweis(name)}`).join('\n')}` : '';

  notizen.push({
    typ: 'note',
    titel,
    markdown: zeilen(
      `## ${w(sprache, 'Aufhänger', 'Hook')}`,
      aufhaengerText(entwurf, sprache),
      liste(w(sprache, 'Fraktionen', 'Factions'), entwurf.fraktionen.map((f) => f.name)),
      liste(w(sprache, 'Figuren', 'Characters'), entwurf.figuren.map((f) => f.name)),
      liste(w(sprache, 'Orte', 'Places'), entwurf.orte.map((o) => o.name)),
      entwurf.zeitstrahl.length > 0
        ? `### ${w(sprache, 'Wenn niemand eingreift', 'If nobody intervenes')}\n${entwurf.zeitstrahl
            .map((punkt) => `- **${punkt.marke}:** ${punkt.was}`)
            .join('\n')}`
        : ''
    )
  });

  for (const fraktion of entwurf.fraktionen) {
    notizen.push({ typ: 'faction', titel: fraktion.name, markdown: fraktionText(fraktion, sprache) });
  }

  entwurf.figuren.forEach((figur, stelle) => {
    notizen.push({
      typ: 'character',
      titel: figur.name,
      markdown: figurText(figur, sprache, verbindungenVon(stelle, entwurf))
    });
  });

  for (const ort of entwurf.orte) {
    notizen.push({ typ: 'location', titel: ort.name, markdown: ortText(ort, sprache) });
  }

  return notizen;
}
