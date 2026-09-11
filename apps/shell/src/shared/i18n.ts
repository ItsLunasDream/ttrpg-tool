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

  'stage.placeholder': 'This tool is not ready to be embedded yet.',

  'stage.failed.title': '{name} could not be opened',
  'stage.failed.missing':
    'Its build output is missing. Run "npm run build" in the project folder, then try again.',
  'stage.failed.other': 'The tool reported an error while loading.',
  'stage.failed.detail': 'Details: {detail}',
  'stage.failed.retry': 'Try again',

  'dialog.close': 'Close',

  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.languageHint':
    'Applies to this window — its title bar, the start menu and the rail. Each tool keeps its own language setting.',
  'settings.saveFailed': 'Could not save the settings: {detail}',

  'settings.ai': 'AI',
  'settings.aiHint':
    'Set up once here, used by every tool. Nothing is sent anywhere until you ask for it.',
  'settings.aiProvider': 'Connection',
  'settings.aiNone': 'None',
  'settings.aiOllama': 'Ollama (local)',
  'settings.aiClaude': 'Claude API',
  'settings.ollamaUrl': 'Ollama address',
  'settings.ollamaModel': 'Ollama model',
  'settings.claudeModel': 'Claude model',
  'settings.apiKey': 'API key',
  'settings.apiKeySet': 'A key is stored.',
  'settings.apiKeyPlaceholder': 'sk-ant-…',
  'settings.apiKeySave': 'Save key',
  'settings.apiKeyClear': 'Remove key',
  'settings.apiKeyHint':
    'The key is encrypted with your system keychain and never reaches the interface. If the keychain is unavailable, nothing is stored at all.',
  'settings.apiKeyNoKeychain':
    'Your system offers no keychain, so the key was not stored. Storing it in plain text would be worse than not storing it.',
  'settings.aiCheck': 'Check connection',
  'settings.aiChecking': 'Checking…',
  'settings.aiReady': 'Ready: {detail}',
  'settings.aiNotReady': 'Not ready: {detail}',

  'error.aiNoConnection': 'No connection: is Ollama running?',
  'error.aiTimeout': 'Timed out. Is Ollama running and the model loaded?',
  'error.aiHttp': 'The provider answered with HTTP {status}.',
  'error.aiEmpty': 'The provider returned no answer.',
  'error.aiAuth': 'The API key is not accepted.',
  'error.aiRateLimit': 'Too many requests. Try again in a moment.',
  'error.aiModelMissing': 'That model does not exist or you have no access to it.',
  'error.aiRefused': 'The request was declined. Ask differently.',
  'error.aiOther': 'The provider reports: {detail}',
  'error.aiNoModels': 'No model is installed in Ollama.',
  'error.aiModelNotInstalled': 'The model {model} is not installed in Ollama.',
  'error.aiNoKey': 'No API key stored.',

  'about.title': 'About TTRPG-Tools',
  'about.author': 'By ItsLunasDream',
  'about.version': 'Version {version}',
  'about.description':
    'A collection of tools for tabletop RPG campaigns, running side by side in one window.',
  'about.license': 'License: GNU Affero General Public License v3.0 (or later)',
  'about.licenseDetail':
    'Free software: you may use, change and redistribute it. If a modified version is offered over a network, its source must be made available too.',
  'about.warranty': 'Without any warranty, as described in the license.',
  'about.sourceLink': 'Source code on GitHub',
  'about.licenseLink': 'Read the full license',

  'app.backstory.name': 'Backstory',
  'app.backstory.description': 'Write down characters, places and how they relate',
  'app.mapmaker.name': 'Maps',
  'app.mapmaker.description': 'Draw and generate maps',
  'app.initiative.name': 'Initiative',
  'app.initiative.description': 'Keep track of turn order in combat',
  'app.dice.name': 'Dice',
  'app.dice.description': 'Roll dice expressions, with advantage and disadvantage',
  'app.npc.name': 'NPC Creator',
  'app.npc.description': 'Roll a character the table can meet right away',
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

  'stage.placeholder': 'Dieses Werkzeug lässt sich noch nicht einbetten.',

  'stage.failed.title': '{name} ließ sich nicht öffnen',
  'stage.failed.missing':
    'Die gebauten Dateien fehlen. Führe im Projektordner „npm run build" aus und versuche es noch einmal.',
  'stage.failed.other': 'Das Werkzeug hat beim Laden einen Fehler gemeldet.',
  'stage.failed.detail': 'Einzelheiten: {detail}',
  'stage.failed.retry': 'Noch einmal versuchen',

  'dialog.close': 'Schließen',

  'settings.title': 'Einstellungen',
  'settings.language': 'Sprache',
  'settings.languageHint':
    'Gilt für dieses Fenster — seine Titelleiste, das Startmenü und die Schiene. Jedes Werkzeug behält seine eigene Spracheinstellung.',
  'settings.saveFailed': 'Die Einstellungen ließen sich nicht speichern: {detail}',

  'settings.ai': 'KI',
  'settings.aiHint':
    'Einmal hier eingerichtet, von allen Werkzeugen benutzt. Es geht nichts raus, solange du nicht fragst.',
  'settings.aiProvider': 'Anbindung',
  'settings.aiNone': 'Keine',
  'settings.aiOllama': 'Ollama (lokal)',
  'settings.aiClaude': 'Claude API',
  'settings.ollamaUrl': 'Ollama-Adresse',
  'settings.ollamaModel': 'Ollama-Modell',
  'settings.claudeModel': 'Claude-Modell',
  'settings.apiKey': 'API-Schlüssel',
  'settings.apiKeySet': 'Ein Schlüssel ist hinterlegt.',
  'settings.apiKeyPlaceholder': 'sk-ant-…',
  'settings.apiKeySave': 'Schlüssel speichern',
  'settings.apiKeyClear': 'Schlüssel entfernen',
  'settings.apiKeyHint':
    'Der Schlüssel wird mit dem Schlüsselbund deines Systems verschlüsselt und erreicht die Oberfläche nie. Steht kein Schlüsselbund zur Verfügung, wird gar nicht gespeichert.',
  'settings.apiKeyNoKeychain':
    'Dein System bietet keinen Schlüsselbund, deshalb wurde nichts gespeichert. Im Klartext abzulegen wäre schlechter, als es zu lassen.',
  'settings.aiCheck': 'Verbindung prüfen',
  'settings.aiChecking': 'Prüfe …',
  'settings.aiReady': 'Bereit: {detail}',
  'settings.aiNotReady': 'Nicht bereit: {detail}',

  'error.aiNoConnection': 'Keine Verbindung: Läuft Ollama?',
  'error.aiTimeout': 'Zeitüberschreitung. Läuft Ollama, und ist das Modell geladen?',
  'error.aiHttp': 'Der Anbieter antwortete mit HTTP {status}.',
  'error.aiEmpty': 'Der Anbieter hat keine Antwort geliefert.',
  'error.aiAuth': 'Der API-Schlüssel wird nicht akzeptiert.',
  'error.aiRateLimit': 'Zu viele Anfragen. Versuch es gleich noch einmal.',
  'error.aiModelMissing': 'Dieses Modell gibt es nicht oder du hast keinen Zugriff darauf.',
  'error.aiRefused': 'Die Anfrage wurde abgelehnt. Frag anders.',
  'error.aiOther': 'Der Anbieter meldet: {detail}',
  'error.aiNoModels': 'In Ollama ist kein Modell installiert.',
  'error.aiModelNotInstalled': 'Das Modell {model} ist in Ollama nicht installiert.',
  'error.aiNoKey': 'Kein API-Schlüssel hinterlegt.',

  'about.title': 'Über TTRPG-Tools',
  'about.author': 'Von ItsLunasDream',
  'about.version': 'Fassung {version}',
  'about.description':
    'Eine Sammlung von Werkzeugen für Pen-&-Paper-Kampagnen, die nebeneinander in einem Fenster laufen.',
  'about.license': 'Lizenz: GNU Affero General Public License v3.0 (oder neuer)',
  'about.licenseDetail':
    'Freie Software: du darfst sie benutzen, verändern und weitergeben. Wird eine veränderte Fassung über ein Netzwerk angeboten, muss ihr Quelltext ebenfalls offenstehen.',
  'about.warranty': 'Ohne jede Gewährleistung, wie in der Lizenz beschrieben.',
  'about.sourceLink': 'Quelltext auf GitHub',
  'about.licenseLink': 'Vollständigen Lizenztext lesen',

  'app.backstory.name': 'Backstory',
  'app.backstory.description': 'Figuren, Orte und ihre Beziehungen aufschreiben',
  'app.mapmaker.name': 'Karten',
  'app.mapmaker.description': 'Karten zeichnen und erzeugen',
  'app.initiative.name': 'Initiative',
  'app.initiative.description': 'Zugreihenfolge im Kampf verwalten',
  'app.dice.name': 'Würfel',
  'app.dice.description': 'Würfelausdrücke werfen, mit Vorteil und Nachteil',
  'app.npc.name': 'NPC Creator',
  'app.npc.description': 'Eine Figur würfeln, die der Tisch sofort treffen kann',
  'app.encounter.name': 'Begegnungen',
  'app.encounter.description': 'Kämpfe planen und ausbalancieren'
};

const MESSAGES: Record<Language, Partial<Record<MessageKey, string>>> = { en, de };

export const translate = createTranslator<MessageKey>(MESSAGES, 'en');

/** Alle bekannten Textschluessel, fuer Vollstaendigkeitspruefungen. */
export const MESSAGE_KEYS = Object.keys(en) as MessageKey[];

export { DEFAULT_LANGUAGE, LANGUAGES, isLanguage } from '@suite/i18n';
export type { Language, MessageParams } from '@suite/i18n';
