export type Language = 'de' | 'en';

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' }
];

export const DEFAULT_LANGUAGE: Language = 'de';

export type MessageParams = Record<string, string | number>;

/**
 * Alle festen Texte der Anwendung. Vom Nutzer vergebene Bezeichnungen, etwa
 * eigene Notiztypen und Feldnamen, bleiben unveraendert: die kann das
 * Programm nicht uebersetzen.
 *
 * Deutsch ist die Leitsprache. Fehlt ein Schluessel in einer anderen Sprache,
 * wird der deutsche Text benutzt, damit nie ein roher Schluessel erscheint.
 */
const de = {
  'app.loading': 'Lädt …',
  'app.noCampaign': 'Keine Kampagne vorhanden.',
  'app.createFirstCampaign': 'Erste Kampagne anlegen',
  'app.noNotes': 'Noch keine Notiz in dieser Kampagne.',
  'app.noNotesHint': 'Leg links eine an, zum Beispiel einen Charakter.',

  'bar.chooseCampaign': 'Kampagne wählen …',
  'bar.newCampaign': 'Neue Kampagne',
  'bar.rename': 'Umbenennen',
  'bar.noteTypes': 'Notiztypen',
  'bar.exportZip': 'Als ZIP sichern',
  'bar.deleteCampaign': 'Kampagne löschen',
  'bar.settings': 'Einstellungen',
  'bar.autosaveOn': 'Autosave an',
  'bar.autosaveOff': 'Autosave aus',

  'list.search': 'Volltextsuche …',
  'list.allTypes': 'Alle Typen',
  'list.allTags': 'Alle Tags',
  'list.newNoteOf': 'Neue Notiz: {label}',
  'list.noMatch': 'Keine Notiz passt zum Filter.',
  'list.total': '{total} Notizen · {visible} sichtbar',
  'list.withoutType': 'Ohne Typ',

  'editor.title': 'Titel',
  'editor.save': 'Speichern',
  'editor.delete': 'Löschen',
  'editor.saving': 'Speichert …',
  'editor.unsaved': 'Nicht gespeichert',
  'editor.saved': 'Gespeichert',
  'editor.words': '{count} Wörter',
  'editor.autosaveOffHint': 'Autosave ist aus. Strg+S speichert.',
  'editor.placeholder': 'Schreib los. Mit [[ verlinkst du andere Notizen.',
  'editor.profile': 'Steckbrief',
  'editor.aliases': 'Aliase',
  'editor.aliasesHint': 'Spitzname, Titel …',
  'editor.tags': 'Tags',
  'editor.tagsHint': 'Kampagnenrolle, Thema …',
  'editor.open': 'öffnen',
  'editor.removeToken': '{value} entfernen',

  'search.noHit': 'keine Fundstelle',
  'search.position': '{current} von {total}',
  'search.previous': 'Vorherige Fundstelle (Umschalt+F3)',
  'search.next': 'Nächste Fundstelle (F3)',

  'suggest.createNew': '„{title}" neu anlegen',
  'suggest.new': 'neu',

  'card.noText': 'Noch kein Text geschrieben.',
  'card.openNote': 'Notiz öffnen',
  'card.alias': 'alias {names}',

  'relations.title': 'Beziehungen',
  'relations.hint': 'Nur die Sicht von {title} auf die andere Notiz. Die Gegenrichtung wird dort separat gepflegt.',
  'relations.typePlaceholder': 'Beziehungstyp, z.B. Mentorin',
  'relations.notePlaceholder': 'Wie steht sie dazu?',
  'relations.choose': 'Notiz wählen …',
  'relations.add': 'Hinzufügen',
  'relations.remove': 'Beziehung entfernen',
  'relations.missing': 'Notiz gelöscht',

  'backlinks.title': 'Erwähnt von',
  'backlinks.empty': 'Noch keine andere Notiz verlinkt hierher.',
  'unresolved.title': 'Offene Links',
  'unresolved.hint': 'Diese Links zeigen noch auf keine Notiz.',
  'unresolved.create': 'anlegen',

  'types.title': 'Notiztypen und Steckbrief',
  'types.addType': '+ Typ',
  'types.addField': '+ Feld',
  'types.deleteType': 'Typ löschen',
  'types.label': 'Bezeichnung',
  'types.plural': 'Mehrzahl',
  'types.fields': 'Steckbrieffelder',
  'types.noFields': 'Dieser Typ hat keine Felder. Notizen bestehen dann nur aus Text.',
  'types.fieldLabel': 'Feldbezeichnung',
  'types.fieldKind': 'Feldart',
  'types.example': 'Beispieltext, optional',
  'types.exampleLabel': 'Beispieltext',
  'types.key': 'Schlüssel {key}',
  'types.moveUp': 'Nach oben',
  'types.moveDown': 'Nach unten',
  'types.removeField': 'Feld entfernen',
  'types.hint':
    'Ein entferntes Feld löscht keine Werte. Sie bleiben in der Notizdatei stehen und erscheinen wieder, wenn du das Feld zurückholst. Der Schlüssel eines Felds bleibt beim Umbenennen unverändert, damit bestehende Einträge erhalten bleiben.',
  'types.inUse': '„{label}" wird noch von {count} Notizen benutzt.',
  'types.inUseOne': '„{label}" wird noch von einer Notiz benutzt.',
  'types.needsLabel': 'Jeder Notiztyp braucht eine Bezeichnung.',
  'types.fieldNeedsLabel': 'Ein Feld in „{label}" hat keine Bezeichnung.',
  'types.newType': 'Neuer Typ',
  'types.newTypePlural': 'Neue Typen',
  'types.newField': 'Neues Feld',
  'types.saved': 'Notiztypen gespeichert.',

  'fieldType.text': 'Text',
  'fieldType.textarea': 'Mehrzeilig',
  'fieldType.number': 'Zahl',
  'fieldType.url': 'Link',

  'settings.title': 'Einstellungen',
  'settings.language': 'Sprache',
  'settings.autosave': 'Autosave aktiv',
  'settings.autosaveDelay': 'Verzögerung bis zum Autosave (ms)',
  'settings.location': 'Speicherort',
  'settings.chooseFolder': 'Anderen Ordner wählen …',
  'settings.openFolder': 'Ordner öffnen',
  'settings.hint':
    'Kampagnen und Notizen liegen als Markdown-Dateien mit YAML-Frontmatter im Speicherort. Du kannst sie jederzeit mit einem Texteditor oder Obsidian öffnen.',

  'dialog.cancel': 'Abbrechen',
  'dialog.ok': 'OK',
  'dialog.apply': 'Übernehmen',
  'dialog.create': 'Anlegen',
  'dialog.rename': 'Umbenennen',
  'dialog.delete': 'Löschen',
  'dialog.close': 'Schließen',
  'dialog.newCampaign': 'Neue Kampagne',
  'dialog.campaignName': 'Name der Kampagne',
  'dialog.renameCampaign': 'Kampagne umbenennen',
  'dialog.newName': 'Neuer Name',
  'dialog.deleteCampaign': 'Kampagne löschen',
  'dialog.deleteCampaignText':
    '„{name}" mit allen Notizen unwiderruflich löschen? Sichere sie vorher als ZIP, wenn du unsicher bist.',
  'dialog.newNote': 'Neue Notiz',
  'dialog.type': 'Typ',
  'dialog.deleteNote': 'Notiz löschen',
  'dialog.deleteNoteText':
    '„{title}" löschen? Beziehungen anderer Notizen auf diese werden mit entfernt, [[Links]] im Text bleiben stehen.',

  'toolbar.bold': 'Fett (Strg+B)',
  'toolbar.italic': 'Kursiv (Strg+I)',
  'toolbar.strike': 'Durchgestrichen',
  'toolbar.heading': 'Überschrift {level}',
  'toolbar.bulletList': 'Aufzählung',
  'toolbar.orderedList': 'Nummerierte Liste',
  'toolbar.quote': 'Zitat',
  'toolbar.code': 'Code',
  'toolbar.rule': 'Trennlinie',
  'toolbar.undo': 'Rückgängig (Strg+Z)',
  'toolbar.redo': 'Wiederholen (Strg+Umschalt+Z)',

  'msg.renamed': 'Umbenannt, {count} Notizen mit Links angepasst.',
  'msg.renamedOne': 'Umbenannt, eine Notiz mit Links angepasst.',
  'msg.exported': 'Sicherung geschrieben: {path}',
  'msg.alreadyExists': '„{title}" existiert bereits.',

  'error.campaignName': 'Die Kampagne braucht einen Namen.',
  'error.noteTitle': 'Die Notiz braucht einen Titel.',
  'error.unknownNoteType': 'Unbekannter Notiztyp: {type}',
  'error.invalidId': 'Ungültige ID: {id}',
  'error.externalProtocol': 'Nur http- und https-Links können geöffnet werden.',
  'error.needsOneType': 'Es muss mindestens ein Notiztyp übrig bleiben.',
  'error.typeWithoutId': 'Ein Notiztyp ohne Kennung ist nicht möglich.',
  'error.typeNeedsLabel': 'Der Notiztyp „{id}" braucht eine Bezeichnung.',
  'error.duplicateType': 'Der Notiztyp „{id}" kommt doppelt vor.',
  'error.fieldWithoutKey': 'Ein Feld in „{label}" hat keinen Schlüssel.',
  'error.fieldNeedsLabel': 'Ein Feld in „{label}" braucht eine Bezeichnung.',
  'error.duplicateField': 'Das Feld „{key}" kommt in „{label}" doppelt vor.',
  'error.unexpected': 'Unerwarteter Fehler: {detail}'
} as const;

export type MessageKey = keyof typeof de;

const en: Partial<Record<MessageKey, string>> = {
  'app.loading': 'Loading …',
  'app.noCampaign': 'No campaign yet.',
  'app.createFirstCampaign': 'Create your first campaign',
  'app.noNotes': 'No notes in this campaign yet.',
  'app.noNotesHint': 'Create one on the left, a character for example.',

  'bar.chooseCampaign': 'Choose a campaign …',
  'bar.newCampaign': 'New campaign',
  'bar.rename': 'Rename',
  'bar.noteTypes': 'Note types',
  'bar.exportZip': 'Save as ZIP',
  'bar.deleteCampaign': 'Delete campaign',
  'bar.settings': 'Settings',
  'bar.autosaveOn': 'Autosave on',
  'bar.autosaveOff': 'Autosave off',

  'list.search': 'Search all notes …',
  'list.allTypes': 'All types',
  'list.allTags': 'All tags',
  'list.newNoteOf': 'New note: {label}',
  'list.noMatch': 'No note matches the filter.',
  'list.total': '{total} notes · {visible} shown',
  'list.withoutType': 'Without type',

  'editor.title': 'Title',
  'editor.save': 'Save',
  'editor.delete': 'Delete',
  'editor.saving': 'Saving …',
  'editor.unsaved': 'Unsaved',
  'editor.saved': 'Saved',
  'editor.words': '{count} words',
  'editor.autosaveOffHint': 'Autosave is off. Ctrl+S saves.',
  'editor.placeholder': 'Start writing. Type [[ to link another note.',
  'editor.profile': 'Profile',
  'editor.aliases': 'Aliases',
  'editor.aliasesHint': 'Nickname, title …',
  'editor.tags': 'Tags',
  'editor.tagsHint': 'Role, theme …',
  'editor.open': 'open',
  'editor.removeToken': 'Remove {value}',

  'search.noHit': 'no match',
  'search.position': '{current} of {total}',
  'search.previous': 'Previous match (Shift+F3)',
  'search.next': 'Next match (F3)',

  'suggest.createNew': 'Create “{title}”',
  'suggest.new': 'new',

  'card.noText': 'No text written yet.',
  'card.openNote': 'Open note',
  'card.alias': 'alias {names}',

  'relations.title': 'Relationships',
  'relations.hint': 'Only how {title} sees the other note. The other direction is kept there separately.',
  'relations.typePlaceholder': 'Relationship, e.g. mentor',
  'relations.notePlaceholder': 'How do they feel about it?',
  'relations.choose': 'Choose a note …',
  'relations.add': 'Add',
  'relations.remove': 'Remove relationship',
  'relations.missing': 'Note deleted',

  'backlinks.title': 'Mentioned by',
  'backlinks.empty': 'No other note links here yet.',
  'unresolved.title': 'Open links',
  'unresolved.hint': 'These links do not point to a note yet.',
  'unresolved.create': 'create',

  'types.title': 'Note types and profile',
  'types.addType': '+ Type',
  'types.addField': '+ Field',
  'types.deleteType': 'Delete type',
  'types.label': 'Label',
  'types.plural': 'Plural',
  'types.fields': 'Profile fields',
  'types.noFields': 'This type has no fields. Notes will be text only.',
  'types.fieldLabel': 'Field label',
  'types.fieldKind': 'Field kind',
  'types.example': 'Example text, optional',
  'types.exampleLabel': 'Example text',
  'types.key': 'Key {key}',
  'types.moveUp': 'Move up',
  'types.moveDown': 'Move down',
  'types.removeField': 'Remove field',
  'types.hint':
    'Removing a field does not delete any values. They stay in the note file and reappear if you bring the field back. A field keeps its key when you rename the label, so existing entries are preserved.',
  'types.inUse': '“{label}” is still used by {count} notes.',
  'types.inUseOne': '“{label}” is still used by one note.',
  'types.needsLabel': 'Every note type needs a label.',
  'types.fieldNeedsLabel': 'A field in “{label}” has no label.',
  'types.newType': 'New type',
  'types.newTypePlural': 'New types',
  'types.newField': 'New field',
  'types.saved': 'Note types saved.',

  'fieldType.text': 'Text',
  'fieldType.textarea': 'Multiline',
  'fieldType.number': 'Number',
  'fieldType.url': 'Link',

  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.autosave': 'Autosave enabled',
  'settings.autosaveDelay': 'Autosave delay (ms)',
  'settings.location': 'Storage location',
  'settings.chooseFolder': 'Choose another folder …',
  'settings.openFolder': 'Open folder',
  'settings.hint':
    'Campaigns and notes are stored as Markdown files with YAML front matter. You can open them any time in a text editor or in Obsidian.',

  'dialog.cancel': 'Cancel',
  'dialog.ok': 'OK',
  'dialog.apply': 'Apply',
  'dialog.create': 'Create',
  'dialog.rename': 'Rename',
  'dialog.delete': 'Delete',
  'dialog.close': 'Close',
  'dialog.newCampaign': 'New campaign',
  'dialog.campaignName': 'Campaign name',
  'dialog.renameCampaign': 'Rename campaign',
  'dialog.newName': 'New name',
  'dialog.deleteCampaign': 'Delete campaign',
  'dialog.deleteCampaignText':
    'Delete “{name}” and all its notes for good? Save it as a ZIP first if you are unsure.',
  'dialog.newNote': 'New note',
  'dialog.type': 'Type',
  'dialog.deleteNote': 'Delete note',
  'dialog.deleteNoteText':
    'Delete “{title}”? Relationships of other notes pointing here are removed as well, [[links]] in text stay.',

  'toolbar.bold': 'Bold (Ctrl+B)',
  'toolbar.italic': 'Italic (Ctrl+I)',
  'toolbar.strike': 'Strikethrough',
  'toolbar.heading': 'Heading {level}',
  'toolbar.bulletList': 'Bullet list',
  'toolbar.orderedList': 'Numbered list',
  'toolbar.quote': 'Quote',
  'toolbar.code': 'Code',
  'toolbar.rule': 'Divider',
  'toolbar.undo': 'Undo (Ctrl+Z)',
  'toolbar.redo': 'Redo (Ctrl+Shift+Z)',

  'msg.renamed': 'Renamed, links updated in {count} notes.',
  'msg.renamedOne': 'Renamed, links updated in one note.',
  'msg.exported': 'Backup written to {path}',
  'msg.alreadyExists': '“{title}” already exists.',

  'error.campaignName': 'The campaign needs a name.',
  'error.noteTitle': 'The note needs a title.',
  'error.unknownNoteType': 'Unknown note type: {type}',
  'error.invalidId': 'Invalid id: {id}',
  'error.externalProtocol': 'Only http and https links can be opened.',
  'error.needsOneType': 'At least one note type has to remain.',
  'error.typeWithoutId': 'A note type without an id is not possible.',
  'error.typeNeedsLabel': 'The note type “{id}” needs a label.',
  'error.duplicateType': 'The note type “{id}” appears twice.',
  'error.fieldWithoutKey': 'A field in “{label}” has no key.',
  'error.fieldNeedsLabel': 'A field in “{label}” needs a label.',
  'error.duplicateField': 'The field “{key}” appears twice in “{label}”.',
  'error.unexpected': 'Unexpected error: {detail}'
};

const MESSAGES: Record<Language, Partial<Record<MessageKey, string>>> = { de, en };

/** Ersetzt Platzhalter der Form {name} durch die uebergebenen Werte. */
export function translate(language: Language, key: MessageKey, params?: MessageParams): string {
  const template = MESSAGES[language]?.[key] ?? de[key] ?? key;
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole
  );
}

/** Alle bekannten Textschluessel, fuer Vollstaendigkeitspruefungen. */
export const MESSAGE_KEYS = Object.keys(de) as MessageKey[];

export function isLanguage(value: unknown): value is Language {
  return value === 'de' || value === 'en';
}
