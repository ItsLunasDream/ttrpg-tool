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

  'menu.title': 'TTRPG-Tools',
  'menu.groupGm': 'For running the game',
  'menu.groupAll': 'For everyone at the table',
  'menu.version': 'Version {version}',

  'verlauf.zurueck': 'Back',
  'verlauf.vorwaerts': 'Forward',

  'rail.home': 'Back to the start menu',
  'rail.homeShort': 'Start menu',

  'status.ready': 'ready',
  'status.inProgress': 'in progress',
  'status.planned': 'later',

  'stage.placeholder': 'This tool is not ready to be embedded yet.',
  'stage.loading': 'Opening {name} …',

  'stage.failed.title': '{name} could not be opened',
  'stage.failed.missing':
    'Its build output is missing. Run "npm run build" in the project folder, then try again.',
  'stage.failed.other': 'The tool reported an error while loading.',
  'stage.failed.detail': 'Details: {detail}',
  'stage.failed.retry': 'Try again',

  'dialog.close': 'Close',

  'search.title': 'Search everything',
  'search.placeholder': 'Search monsters, conditions, encounters…',
  'search.hint': 'Type to search across all tools.',
  'search.loading': 'Reading…',
  'search.nothing': 'Nothing found.',
  'search.keys': '↑ ↓ to move, Enter to open, Esc to close',
  'search.appArt': 'Tool',
  'search.appGruppe': 'Tools',
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.languageHint':
    'Applies to the whole collection.',
  'settings.sectionLook': 'Appearance',
  'settings.sectionData': 'Data & backup',
  'settings.sectionTools': 'Tools',
  'settings.toolClosed':
    'This tool is not running. Open it once to see its settings here.',
  'settings.toolOpen': 'Open {name}',
  'settings.theme': 'Colour theme',
  'settings.themeHint':
    'Applies to the whole window, tools included.',
  'settings.size': 'Interface size',
  'settings.sizeHint': 'Makes text and controls larger or smaller, in the whole window and every tool.',
  'settings.saveFailed': 'Could not save the settings: {detail}',

  'settings.icons': 'Tool icons',
  'settings.iconsHint':
    'One image per tool, named after its id (e.g. dice.png), plus banner.png for the start menu. Missing ones keep the built-in image.',
  'settings.iconsOpen': 'Open folder',
  'settings.iconsReload': 'Reload icons',

  'settings.ai': 'AI',
  'settings.aiHint':
    'Used by every tool. Nothing is sent until you ask.',
  'settings.aiProvider': 'Connection',
  'settings.aiNone': 'None',
  'settings.aiOllama': 'Ollama (local)',
  'settings.aiOpen': 'Other service (OpenAI interface)',
  'settings.openUrl': 'Service address',
  'settings.openModel': 'Model',
  'settings.openHint':
    'For services that answer like OpenAI — Groq, Mistral, Together, OpenRouter or a local LM Studio, for example. The address is in their documentation and usually ends in /v1.',
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
    'No keychain available, the key was not stored.',
  'settings.aiCheck': 'Check connection',
  'settings.aiChecking': 'Checking…',
  'settings.aiReady': 'Ready: {detail}',
  'settings.aiNotReady': 'Not ready: {detail}',

  'settings.backup': 'Backup',
  'settings.backupHint':
    'One ZIP with all data and settings. The API key is not included.',
  'settings.backupNow': 'Back up now',
  'settings.backupRunning': 'Backing up…',
  'settings.backupDone': 'Done, {count} files:',
  'settings.backupFolder': 'Open data folder',
  'settings.backupRestore':
    'To restore: close the app, unpack the ZIP into the data folder, start again.',
  'settings.intro': 'Introductions',
  'settings.introHint':
    'Show the first-start introduction of each tool again.',
  'settings.introReset': 'Show introductions again',
  'settings.introDone': 'They will appear again the next time you open a tool.',

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

  'intro.start': 'Let’s go',
  'intro.wieder': 'Shown once. You can bring it back in the settings.',

  'about.title': 'About TTRPG-Tools',
  'about.author': 'By ItsLunasDream',
  'about.version': 'Version {version}',
  'about.description':
    'A collection of tools for tabletop RPG campaigns, running side by side in one window.',
  'about.license': 'License: GNU Affero General Public License v3.0 (or later)',
  'about.licenseDetail':
    'Free software: you may use, change and redistribute it. If a modified version is offered over a network, its source must be made available too.',
  'about.warranty': 'Without any warranty, as described in the license.',
  'about.notice':
    'Some data comes from other works under CC-BY-4.0 and is credited there — the monster baselines by challenge rating from the Lazy GM\u2019s 5e Monster Builder Resource Document.',
  'about.noticeLink': 'Attributions',
  'about.sourceLink': 'Source code on GitHub',
  'about.licenseLink': 'Read the full license',

  'app.backstory.name': 'Story Creator',
  'app.backstory.description': 'Write down characters, places and how they relate',
  'app.mapmaker.name': 'Maps',
  'app.mapmaker.description': 'Draw and generate maps',
  'app.initiative.name': 'Initiative',
  'app.initiative.description': 'Keep track of turn order in combat',
  'app.dice.name': 'Dice',
  'app.dice.description': 'Roll dice expressions, with advantage and disadvantage',
  'app.npc.name': 'NPC Creator',
  'app.npc.description': 'Roll a character the table can meet right away',
  'app.monster.name': 'Monster Creator',
  'app.monster.description': 'Build homebrew monsters that hold up to a challenge-rating check',
  'app.zustaende.name': 'Status Effect Creator',
  'app.zustaende.description': 'Build custom conditions with levels — and see what they weigh',
  'app.inspiration.name': 'Inspiration',
  'app.inspiration.description': 'Build a campaign scaffold: hooks, factions, places, ties',
  'app.encounter.name': 'Encounters',
  'app.encounter.description': 'Plan and balance fights',
  'app.nachschlagewerk.name': 'Reference',
  'app.nachschlagewerk.description': 'The rules, offline and in both languages',
  'app.magicitems.name': 'Magic Item Creator',
  'app.magicitems.description': 'Roll and adjust magic items',
  'app.loot.name': 'Loot Generator',
  'app.loot.description': 'Your own random tables, nested and rolled'
};

export type MessageKey = keyof typeof en;

const de: Partial<Record<MessageKey, string>> = {
  'title.settings': 'Einstellungen',
  'title.about': 'Über',
  'window.minimize': 'Minimieren',
  'window.maximize': 'Maximieren',
  'window.restore': 'Wiederherstellen',
  'window.close': 'Schließen',

  'menu.title': 'TTRPG-Tools',
  'menu.groupGm': 'Zum Leiten',
  'menu.groupAll': 'Für alle am Tisch',
  'menu.version': 'Fassung {version}',

  'verlauf.zurueck': 'Zurück',
  'verlauf.vorwaerts': 'Vorwärts',

  'rail.home': 'Zurück zum Startmenü',
  'rail.homeShort': 'Startmenü',

  'status.ready': 'bereit',
  'status.inProgress': 'in Arbeit',
  'status.planned': 'später',

  'stage.placeholder': 'Dieses Werkzeug lässt sich noch nicht einbetten.',
  'stage.loading': '{name} wird geöffnet …',

  'stage.failed.title': '{name} ließ sich nicht öffnen',
  'stage.failed.missing':
    'Die gebauten Dateien fehlen. Führe im Projektordner „npm run build" aus und versuche es noch einmal.',
  'stage.failed.other': 'Das Werkzeug hat beim Laden einen Fehler gemeldet.',
  'stage.failed.detail': 'Einzelheiten: {detail}',
  'stage.failed.retry': 'Noch einmal versuchen',

  'dialog.close': 'Schließen',

  'search.title': 'Alles durchsuchen',
  'search.placeholder': 'Monster, Zustände, Begegnungen durchsuchen…',
  'search.hint': 'Tippen, um über alle Werkzeuge zu suchen.',
  'search.loading': 'Wird gelesen…',
  'search.nothing': 'Nichts gefunden.',
  'search.keys': '↑ ↓ bewegen, Enter öffnet, Esc schließt',
  'search.appArt': 'Werkzeug',
  'search.appGruppe': 'Werkzeuge',
  'settings.title': 'Einstellungen',
  'settings.language': 'Sprache',
  'settings.languageHint':
    'Gilt für die ganze Sammlung.',
  'settings.sectionLook': 'Aussehen',
  'settings.sectionData': 'Daten & Sicherung',
  'settings.sectionTools': 'Werkzeuge',
  'settings.toolClosed':
    'Das Werkzeug läuft gerade nicht. Öffne es einmal, dann stehen seine Einstellungen hier.',
  'settings.toolOpen': '{name} öffnen',
  'settings.theme': 'Farbthema',
  'settings.themeHint':
    'Gilt für das ganze Fenster, Werkzeuge eingeschlossen.',
  'settings.size': 'Größe der Oberfläche',
  'settings.sizeHint': 'Macht Schrift und Bedienelemente größer oder kleiner, im ganzen Fenster und in jedem Werkzeug.',
  'settings.saveFailed': 'Die Einstellungen ließen sich nicht speichern: {detail}',

  'settings.icons': 'Symbole der Werkzeuge',
  'settings.iconsHint':
    'Ein eigenes Bild je Werkzeug, benannt nach seiner Kennung (z. B. dice.png), dazu banner.png für das Startmenü. Fehlt eines, gilt das eingebaute.',
  'settings.iconsOpen': 'Ordner öffnen',
  'settings.iconsReload': 'Symbole neu laden',

  'settings.ai': 'KI',
  'settings.aiHint':
    'Gilt für alle Werkzeuge. Gesendet wird nur, wenn du fragst.',
  'settings.aiProvider': 'Anbindung',
  'settings.aiNone': 'Keine',
  'settings.aiOllama': 'Ollama (lokal)',
  'settings.aiOpen': 'Anderer Dienst (OpenAI-Schnittstelle)',
  'settings.openUrl': 'Adresse des Dienstes',
  'settings.openModel': 'Modell',
  'settings.openHint':
    'Für Dienste, die wie OpenAI antworten — etwa Groq, Mistral, Together, OpenRouter oder ein lokales LM Studio. Die Adresse steht in deren Dokumentation, meist endet sie auf /v1.',
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
    'Kein Schlüsselbund verfügbar, der Schlüssel wurde nicht gespeichert.',
  'settings.aiCheck': 'Verbindung prüfen',
  'settings.aiChecking': 'Prüfe …',
  'settings.aiReady': 'Bereit: {detail}',
  'settings.aiNotReady': 'Nicht bereit: {detail}',

  'settings.backup': 'Sicherung',
  'settings.backupHint':
    'Ein ZIP mit allen Daten und Einstellungen. Der API-Schlüssel ist nicht dabei.',
  'settings.backupNow': 'Jetzt sichern',
  'settings.backupRunning': 'Wird gesichert…',
  'settings.backupDone': 'Fertig, {count} Dateien:',
  'settings.backupFolder': 'Datenordner öffnen',
  'settings.backupRestore':
    'Wiederherstellen: Anwendung schließen, ZIP in den Datenordner entpacken, neu starten.',
  'settings.intro': 'Einführungen',
  'settings.introHint':
    'Die Einführung beim ersten Öffnen eines Werkzeugs noch einmal zeigen.',
  'settings.introReset': 'Einführungen wieder zeigen',
  'settings.introDone': 'Sie erscheinen wieder, sobald du das nächste Werkzeug öffnest.',

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

  'intro.start': 'Los geht’s',
  'intro.wieder': 'Wird einmal gezeigt. In den Einstellungen holst du es zurück.',

  'about.title': 'Über TTRPG-Tools',
  'about.author': 'Von ItsLunasDream',
  'about.version': 'Fassung {version}',
  'about.description':
    'Eine Sammlung von Werkzeugen für Pen-&-Paper-Kampagnen, die nebeneinander in einem Fenster laufen.',
  'about.license': 'Lizenz: GNU Affero General Public License v3.0 (oder neuer)',
  'about.licenseDetail':
    'Freie Software: du darfst sie benutzen, verändern und weitergeben. Wird eine veränderte Fassung über ein Netzwerk angeboten, muss ihr Quelltext ebenfalls offenstehen.',
  'about.warranty': 'Ohne jede Gewährleistung, wie in der Lizenz beschrieben.',
  'about.notice':
    'Einzelne Daten stammen aus fremden Werken unter CC-BY-4.0 und sind dort genannt — die Richtwerte je Herausforderungsgrad aus dem Lazy GM\u2019s 5e Monster Builder Resource Document.',
  'about.noticeLink': 'Namensnennungen',
  'about.sourceLink': 'Quelltext auf GitHub',
  'about.licenseLink': 'Vollständigen Lizenztext lesen',

  'app.backstory.name': 'Story Creator',
  'app.backstory.description': 'Figuren, Orte und ihre Beziehungen aufschreiben',
  'app.mapmaker.name': 'Karten',
  'app.mapmaker.description': 'Karten zeichnen und erzeugen',
  'app.initiative.name': 'Initiative',
  'app.initiative.description': 'Zugreihenfolge im Kampf verwalten',
  'app.dice.name': 'Würfel',
  'app.dice.description': 'Würfelausdrücke werfen, mit Vorteil und Nachteil',
  'app.npc.name': 'NPC Creator',
  'app.npc.description': 'Eine Figur würfeln, die der Tisch sofort treffen kann',
  'app.monster.name': 'Monster Creator',
  'app.monster.description': 'Homebrew-Monster bauen, die einer Grad-Prüfung standhalten',
  'app.zustaende.name': 'Status Effect Creator',
  'app.zustaende.description': 'Eigene Zustände mit Stufen bauen — und sehen, was sie wiegen',
  'app.inspiration.name': 'Inspirationshilfe',
  'app.inspiration.description': 'Ein Gerüst für die Kampagne: Aufhänger, Fraktionen, Orte, Verbindungen',
  'app.encounter.name': 'Begegnungen',
  'app.encounter.description': 'Kämpfe planen und ausbalancieren',
  'app.nachschlagewerk.name': 'Nachschlagewerk',
  'app.nachschlagewerk.description': 'Die Regeln, offline und in beiden Sprachen',
  'app.magicitems.name': 'Magic Item Creator',
  'app.magicitems.description': 'Magische Gegenstände würfeln und anpassen',
  'app.loot.name': 'Loot Generator',
  'app.loot.description': 'Eigene Zufallstabellen, verschachtelt und gewürfelt'
};

const MESSAGES: Record<Language, Partial<Record<MessageKey, string>>> = { en, de };

export const translate = createTranslator<MessageKey>(MESSAGES, 'en');

/** Alle bekannten Textschluessel, fuer Vollstaendigkeitspruefungen. */
export const MESSAGE_KEYS = Object.keys(en) as MessageKey[];

export { DEFAULT_LANGUAGE, LANGUAGES, isLanguage } from '@suite/i18n';
export type { Language, MessageParams } from '@suite/i18n';
