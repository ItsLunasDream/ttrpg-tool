import type { FieldDef, NoteType, NoteTypeDef } from './types';

/**
 * Vorlage fuer neue Kampagnen. Ab dem Anlegen gehoeren die Typen der Kampagne
 * und koennen dort frei angepasst werden, ohne dass sich diese Datei aendert.
 */
export const DEFAULT_NOTE_TYPES: NoteTypeDef[] = [
  {
    id: 'character',
    label: 'Charakter',
    plural: 'Charaktere',
    fields: [
      { key: 'age', label: 'Alter', type: 'text', placeholder: 'z.B. 132' },
      { key: 'pronouns', label: 'Pronomen', type: 'text', placeholder: 'z.B. sie/ihr' },
      { key: 'species', label: 'Spezies', type: 'text', placeholder: 'z.B. Waldelfe' },
      { key: 'class', label: 'Klasse', type: 'text', placeholder: 'z.B. Waldläuferin' },
      { key: 'height', label: 'Größe', type: 'text', placeholder: 'z.B. 1,72 m' },
      { key: 'dndBeyondUrl', label: 'D&D-Beyond-Sheet', type: 'url', placeholder: 'https://www.dndbeyond.com/characters/...' }
    ]
  },
  {
    id: 'location',
    label: 'Ort',
    plural: 'Orte',
    fields: [
      { key: 'locationType', label: 'Art', type: 'text', placeholder: 'z.B. Hafenstadt' },
      { key: 'region', label: 'Region', type: 'text', placeholder: 'z.B. Schwertküste' },
      { key: 'population', label: 'Einwohner', type: 'text', placeholder: 'z.B. ca. 4.000' }
    ]
  },
  {
    id: 'faction',
    label: 'Fraktion',
    plural: 'Fraktionen',
    fields: [
      { key: 'factionType', label: 'Art', type: 'text', placeholder: 'z.B. Diebesgilde' },
      { key: 'leader', label: 'Anführung', type: 'text' },
      { key: 'headquarters', label: 'Sitz', type: 'text' },
      { key: 'goals', label: 'Ziele', type: 'textarea' }
    ]
  },
  {
    id: 'event',
    label: 'Ereignis',
    plural: 'Ereignisse',
    fields: [
      { key: 'date', label: 'Zeitpunkt', type: 'text', placeholder: 'z.B. 1492 DR, Sommer' },
      { key: 'place', label: 'Schauplatz', type: 'text' }
    ]
  },
  {
    // Fuer alles, was in keine der anderen Schubladen passt.
    id: 'note',
    label: 'Notiz',
    plural: 'Notizen',
    fields: []
  }
];

export const FIELD_TYPE_LABELS: Record<FieldDef['type'], string> = {
  text: 'Text',
  textarea: 'Mehrzeilig',
  number: 'Zahl',
  url: 'Link'
};

/**
 * Notiztyp aus der Kampagne. Ist der Typ unbekannt, etwa weil er geloescht
 * wurde, entsteht ein Platzhalter. So bleiben betroffene Notizen bedienbar,
 * statt dass die Oberflaeche mit einem Fehler stehen bleibt.
 */
export function findNoteType(types: NoteTypeDef[], id: NoteType): NoteTypeDef {
  return types.find((def) => def.id === id) ?? { id, label: id, plural: id, fields: [] };
}

export function isKnownNoteType(types: NoteTypeDef[], id: NoteType): boolean {
  return types.some((def) => def.id === id);
}

/** Beschriftung eines Steckbrieffelds, mit dem Schluessel als Rueckfallwert. */
export function fieldLabel(types: NoteTypeDef[], typeId: NoteType, key: string): string {
  return findNoteType(types, typeId).fields.find((field) => field.key === key)?.label ?? key;
}

/**
 * Erzeugt aus einer Beschriftung einen stabilen Schluessel. Der Schluessel
 * bleibt danach unveraendert, auch wenn die Beschriftung umbenannt wird,
 * sonst gingen bereits eingetragene Werte verloren.
 */
export function toKey(label: string, taken: Iterable<string> = []): string {
  const base =
    label
      .toLocaleLowerCase('de-DE')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'feld';

  const used = new Set(taken);
  if (!used.has(base)) return base;

  let counter = 2;
  while (used.has(`${base}_${counter}`)) counter += 1;
  return `${base}_${counter}`;
}

/** Vorschlaege fuer das Beziehungsfeld. Freitext bleibt erlaubt. */
export const RELATION_SUGGESTIONS = [
  'Freund/in',
  'Feind/in',
  'Familie',
  'Mentor/in',
  'Schüler/in',
  'Rivale/Rivalin',
  'Liebschaft',
  'Verbündete/r',
  'Bedrohung',
  'Auftraggeber/in',
  'Heimat',
  'Mitglied von'
];
