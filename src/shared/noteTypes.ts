import type { NoteType, NoteTypeDef } from './types';

/**
 * Notiztypen sind schema-getrieben: das Formular im Editor wird aus diesen
 * Definitionen gerendert. Ein neuer Typ oder ein neues Feld braucht daher
 * keine Aenderung an den Komponenten.
 */
export const NOTE_TYPES: NoteTypeDef[] = [
  {
    type: 'character',
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
    type: 'location',
    label: 'Ort',
    plural: 'Orte',
    fields: [
      { key: 'locationType', label: 'Art', type: 'text', placeholder: 'z.B. Hafenstadt' },
      { key: 'region', label: 'Region', type: 'text', placeholder: 'z.B. Schwertküste' },
      { key: 'population', label: 'Einwohner', type: 'text', placeholder: 'z.B. ca. 4.000' }
    ]
  },
  {
    type: 'faction',
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
    type: 'event',
    label: 'Ereignis',
    plural: 'Ereignisse',
    fields: [
      { key: 'date', label: 'Zeitpunkt', type: 'text', placeholder: 'z.B. 1492 DR, Sommer' },
      { key: 'place', label: 'Schauplatz', type: 'text' }
    ]
  }
];

const BY_TYPE = new Map<NoteType, NoteTypeDef>(NOTE_TYPES.map((def) => [def.type, def]));

export function noteTypeDef(type: NoteType): NoteTypeDef {
  const def = BY_TYPE.get(type);
  if (!def) throw new Error(`Unbekannter Notiztyp: ${type}`);
  return def;
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
