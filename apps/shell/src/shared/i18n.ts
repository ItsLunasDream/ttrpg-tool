/**
 * Die Texte der Huelle. Sprachliste, Voreinstellung und Platzhalterregeln
 * kommen aus @suite/i18n, hier stehen nur die Texte selbst.
 *
 * Englisch steht oben und ist die Leitsprache: es ist die voreingestellte
 * Sprache, und ein fehlender Schluessel faellt hierher zurueck.
 */
import { createTranslator, type Language } from '@suite/i18n';

const en = {
  'title.settings': 'Settings',
  'title.about': 'About',
  'window.minimize': 'Minimize',
  'window.maximize': 'Maximize',
  'window.restore': 'Restore',
  'window.close': 'Close',

  'menu.question': 'What would you like to work on?',
  'menu.hint': 'Everything lives in the same place. Switch any time, nothing gets lost.',
  'menu.version': 'Version {version}',

  'rail.home': 'Back to the start menu',
  'rail.homeShort': 'Start menu',

  'status.ready': 'ready',
  'status.inProgress': 'in progress',
  'status.planned': 'later',

  'stage.placeholder': 'This is where the application gets embedded. The shell is done, embedding is next.',

  'app.backstory.name': 'Backstory',
  'app.backstory.description': 'Write down characters, places and how they relate',
  'app.mapmaker.name': 'Maps',
  'app.mapmaker.description': 'Draw and generate maps',
  'app.initiative.name': 'Initiative',
  'app.initiative.description': 'Keep track of turn order in combat',
  'app.dice.name': 'Dice',
  'app.dice.description': 'Roll dice expressions, with advantage and disadvantage',
  'app.encounter.name': 'Encounters',
  'app.encounter.description': 'Plan and balance fights'
};

export type MessageKey = keyof typeof en;

const de: Partial<Record<MessageKey, string>> = {
  'title.settings': 'Einstellungen',
  'title.about': 'Über',
  'window.minimize': 'Minimieren',
  'window.maximize': 'Maximieren',
  'window.restore': 'Wiederherstellen',
  'window.close': 'Schließen',

  'menu.question': 'Womit möchtest du arbeiten?',
  'menu.hint': 'Alles liegt im selben Speicherort. Wechseln geht jederzeit, nichts geht dabei verloren.',
  'menu.version': 'Fassung {version}',

  'rail.home': 'Zurück zum Startmenü',
  'rail.homeShort': 'Startmenü',

  'status.ready': 'bereit',
  'status.inProgress': 'in Arbeit',
  'status.planned': 'später',

  'stage.placeholder': 'Hier wird die Anwendung eingebettet. Die Hülle steht, das Einbetten kommt als Nächstes.',

  'app.backstory.name': 'Backstory',
  'app.backstory.description': 'Figuren, Orte und ihre Beziehungen aufschreiben',
  'app.mapmaker.name': 'Karten',
  'app.mapmaker.description': 'Karten zeichnen und erzeugen',
  'app.initiative.name': 'Initiative',
  'app.initiative.description': 'Zugreihenfolge im Kampf verwalten',
  'app.dice.name': 'Würfel',
  'app.dice.description': 'Würfelausdrücke werfen, mit Vorteil und Nachteil',
  'app.encounter.name': 'Begegnungen',
  'app.encounter.description': 'Kämpfe planen und ausbalancieren'
};

const MESSAGES: Record<Language, Partial<Record<MessageKey, string>>> = { en, de };

export const translate = createTranslator<MessageKey>(MESSAGES, 'en');

/** Alle bekannten Textschluessel, fuer Vollstaendigkeitspruefungen. */
export const MESSAGE_KEYS = Object.keys(en) as MessageKey[];

export { DEFAULT_LANGUAGE, LANGUAGES, isLanguage } from '@suite/i18n';
export type { Language, MessageParams } from '@suite/i18n';
