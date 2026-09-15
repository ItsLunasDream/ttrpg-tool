/**
 * Was beim ersten Mal erklaert wird.
 *
 * Ein kurzes Fenster beim ersten Start der Sammlung und beim ersten Oeffnen
 * jedes Werkzeugs: was es tut, wofuer es gut ist, drei bis fuenf Punkte.
 * Danach nie wieder — wer es noch einmal sehen will, findet in den
 * Einstellungen einen Knopf dafuer.
 *
 * Die Texte stehen hier und nicht im Woerterbuch: sie gehoeren zusammen, sind
 * laenger als ein Knopfbeschriftung und wuerden dort zwischen zwanzig
 * Einzelschluesseln verschwinden. Zweisprachig wie alles andere.
 *
 * In der Huelle und nicht in den Werkzeugen, damit die Einfuehrung ueberall
 * gleich aussieht und ein Werkzeug sie nicht vergessen kann.
 */

export interface Paar {
  readonly de: string;
  readonly en: string;
}

export interface Einfuehrung {
  /** Werkzeug-Kennung, oder 'suite' fuer das Willkommen der Sammlung. */
  readonly id: string;
  readonly titel: Paar;
  /** Ein Satz: worum es geht. */
  readonly satz: Paar;
  /** Drei bis fuenf Punkte. Mehr liest beim ersten Start niemand. */
  readonly punkte: readonly Paar[];
}

/** Die Kennung des Willkommens beim allerersten Start. */
export const WILLKOMMEN = 'suite';

export const EINFUEHRUNGEN: readonly Einfuehrung[] = [
  {
    id: WILLKOMMEN,
    titel: { de: 'Willkommen', en: 'Welcome' },
    satz: {
      de: 'Sechs Werkzeuge für Pen-&-Paper-Runden, nebeneinander in einem Fenster.',
      en: 'Six tools for tabletop campaigns, side by side in one window.'
    },
    punkte: [
      {
        de: 'Links in der Schiene wechselst du das Werkzeug. Nichts geht dabei verloren — was offen ist, bleibt offen.',
        en: 'Switch tools in the rail on the left. Nothing is lost on the way — whatever is open stays open.'
      },
      {
        de: 'Alles bleibt auf deiner Platte. Es geht nichts ins Netz, solange du keine KI einrichtest und fragst.',
        en: 'Everything stays on your disk. Nothing goes online unless you set up an AI and ask it something.'
      },
      {
        de: 'Sprache, Symbole und die KI stellst du oben rechts in den Einstellungen ein — einmal für alle Werkzeuge.',
        en: 'Language, icons and the AI live in the settings at the top right — set once, used by every tool.'
      },
      {
        de: 'Jedes Werkzeug erklärt sich beim ersten Öffnen selbst, genau wie dieses Fenster hier.',
        en: 'Each tool introduces itself the first time you open it, just like this window does now.'
      }
    ]
  },
  {
    id: 'backstory',
    titel: { de: 'Story Creator', en: 'Story Creator' },
    satz: {
      de: 'Das Archiv deiner Welt: Figuren, Orte, Fraktionen und was sie verbindet.',
      en: 'The archive of your world: characters, places, factions and what connects them.'
    },
    punkte: [
      {
        de: 'Notizen schreibst du wie in einem Textprogramm. Gespeichert wird als Markdown — lesbar auch ohne dieses Programm.',
        en: 'Write notes like in a word processor. They are saved as Markdown — readable without this program, too.'
      },
      {
        de: 'Mit [[doppelten Klammern]] verweist du auf andere Notizen. Gibt es sie noch nicht, legst du sie mit einem Klick an.',
        en: 'Use [[double brackets]] to link other notes. If one does not exist yet, a click creates it.'
      },
      {
        de: 'Der Graph zeigt das Geflecht: wer mit wem, wer allein steht. Knoten lassen sich verschieben, die Anordnung bleibt.',
        en: 'The graph shows the web: who is tied to whom, who stands alone. Drag nodes around; the arrangement is kept.'
      },
      {
        de: 'Exportieren kannst du einzelne Notizen oder die ganze Kampagne, als Markdown oder PDF — mit Inhaltsverzeichnis und Netzbild.',
        en: 'Export single notes or the whole campaign, as Markdown or PDF — with a table of contents and the web as a picture.'
      }
    ]
  },
  {
    id: 'mapmaker',
    titel: { de: 'Karteneditor', en: 'Map Editor' },
    satz: {
      de: 'Battlemaps und Weltkarten zeichnen — für den Tisch oder fürs VTT.',
      en: 'Draw battlemaps and world maps — for the table or for a VTT.'
    },
    punkte: [
      {
        de: 'Links die Werkzeuge, rechts ihre Einstellungen. Rechtsklick auf der Fläche wechselt zurück aufs Verschieben.',
        en: 'Tools on the left, their settings on the right. Right-click on the canvas switches back to panning.'
      },
      {
        de: 'Wände, Türen und Lichter gehören zur Karte dazu: Foundry, Roll20 und Owlbear Rodeo lesen sie aus dem Export.',
        en: 'Walls, doors and lights are part of the map: Foundry, Roll20 and Owlbear Rodeo read them from the export.'
      },
      {
        de: 'Generatoren bauen dir einen Stadtplan oder ein Höhlensystem als Anfang, den du danach von Hand veränderst.',
        en: 'Generators give you a town plan or a cave system to start from, which you then change by hand.'
      },
      {
        de: 'Gespeichert wird als Datei auf deiner Platte. F1 zeigt alle Tastenkürzel.',
        en: 'Maps are saved as files on your disk. Press F1 for every keyboard shortcut.'
      }
    ]
  },
  {
    id: 'initiative',
    titel: { de: 'Initiative Tracker', en: 'Initiative Tracker' },
    satz: {
      de: 'Die Reihenfolge im Kampf, Trefferpunkte und Zustände — systemneutral.',
      en: 'Turn order in combat, hit points and conditions — system-neutral.'
    },
    punkte: [
      {
        de: 'Teilnehmende eintragen, Initiative würfeln oder eintippen, los geht die Runde.',
        en: 'Add participants, roll or type initiative, and the round begins.'
      },
      {
        de: 'Zustände haben eine Dauer und zählen selbst herunter. Was abläuft, sagt der Tracker.',
        en: 'Conditions carry a duration and count themselves down. The tracker says when one ends.'
      },
      {
        de: 'Monsterhorden fasst du zu Gruppen zusammen — eine Zeile statt acht.',
        en: 'Group monster hordes together — one row instead of eight.'
      },
      {
        de: 'Begegnungen lassen sich vorbereiten und später wieder laden.',
        en: 'Prepare encounters in advance and load them again later.'
      }
    ]
  },
  {
    id: 'dice',
    titel: { de: 'Würfel', en: 'Dice' },
    satz: {
      de: 'Ein Wurf, wenn keine Würfel zur Hand sind — flach oder als fallende Körper.',
      en: 'A roll when no dice are at hand — flat, or as falling bodies.'
    },
    punkte: [
      {
        de: 'Würfel anklicken, Anzahl wächst; Rechtsklick nimmt wieder weg. Ein Minus davor heißt Abzug.',
        en: 'Click a die to add one, right-click to take one away. A minus in front means subtraction.'
      },
      {
        de: 'Vorteil und Nachteil gibt es als eigenen Schalter, der Verlauf steht daneben.',
        en: 'Advantage and disadvantage have their own switch; the history stands beside it.'
      },
      {
        de: 'Die 3D-Ansicht ist Schau, kein Zufall: das Ergebnis steht vorher fest und wird nur gezeigt.',
        en: 'The 3D view is for show, not for chance: the result is fixed beforehand and only played back.'
      }
    ]
  },
  {
    id: 'npc',
    titel: { de: 'NPC Creator', en: 'NPC Creator' },
    satz: {
      de: 'Eine Randfigur auf Knopfdruck, wenn die Gruppe jemanden anspricht, den du nicht vorbereitet hast.',
      en: 'A minor character at the push of a button, for when the party talks to someone you did not prepare.'
    },
    punkte: [
      {
        de: 'Jedes Feld lässt sich einzeln neu würfeln, festhalten oder überschreiben.',
        en: 'Every field can be rerolled, locked or overwritten on its own.'
      },
      {
        de: 'Ohne KI kommt alles aus Tabellen. Mit KI schlägt das Modell frei vor, nicht aus den Tabellen.',
        en: 'Without an AI everything comes from tables. With one, the model suggests freely instead.'
      },
      {
        de: 'Ein Knopf legt die Figur als Notiz im Story Creator an — in der Kampagne, die dort offen ist.',
        en: 'One button files the character as a note in the Story Creator — in the campaign open over there.'
      }
    ]
  },
  {
    id: 'inspiration',
    titel: { de: 'Inspirationshilfe', en: 'Inspiration' },
    satz: {
      de: 'Das leere Blatt am Anfang einer Kampagne: Aufhänger, Fraktionen, Figuren, Orte und ihre Verbindungen.',
      en: 'The blank page at the start of a campaign: hooks, factions, characters, places and their ties.'
    },
    punkte: [
      {
        de: 'Umfang, Region, Thema und Tonfall einstellen, dann „Alles würfeln" — aus großen Tabellen, ohne KI.',
        en: 'Set scope, region, theme and tone, then “Roll everything” — from large tables, no AI needed.'
      },
      {
        de: 'Jeder Baustein hat ein Schloss. Was dir gefällt, bleibt beim nächsten Wurf stehen.',
        en: 'Every block has a lock. Whatever you like stays put on the next roll.'
      },
      {
        de: 'Verbindungen sind gerichtet: beide sehen dieselbe Sache anders. Genau daraus wird am Tisch eine Szene.',
        en: 'Connections are directed: the two see the same thing differently. That is what makes a scene.'
      },
      {
        de: 'Übernehmen legt alles als verknüpfte Notizen im Story Creator an. Der Entwurf hier ist nur ein Entwurf.',
        en: 'Sending it over files everything as linked notes in the Story Creator. What is here is only a draft.'
      }
    ]
  }
];

/** Die Einfuehrung zu einer Kennung, oder `undefined`. */
export function einfuehrungFuer(id: string): Einfuehrung | undefined {
  return EINFUEHRUNGEN.find((eintrag) => eintrag.id === id);
}

/** Ob diese Einfuehrung noch aussteht. */
export function stehtAus(id: string, gesehen: readonly string[]): boolean {
  return Boolean(einfuehrungFuer(id)) && !gesehen.includes(id);
}
