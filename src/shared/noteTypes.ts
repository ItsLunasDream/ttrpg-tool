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
      { key: 'portrait', label: 'Portrait', type: 'image' },
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

export const FIELD_TYPES: FieldDef['type'][] = [
  'text',
  'textarea',
  'number',
  'url',
  'image',
  'select',
  'date',
  'checkbox'
];

/** Ein Ankreuzfeld ist gesetzt, wenn hier etwas anderes als leer steht. */
export const CHECKED = 'ja';

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
 * Schluessel, unter dem ein Werksfeld mit dieser Beschriftung liegt.
 *
 * Die Werksfelder tragen teils englische Schluessel (`class` fuer „Klasse"),
 * die sich aus ihrer Beschriftung nicht ableiten lassen. Wer ein solches Feld
 * entfernt und spaeter wieder anlegt, bekaeme sonst `klasse` und saehe die
 * bereits eingetragenen Werte nicht wieder, obwohl sie in der Datei stehen.
 */
export function factoryFieldKey(typeId: string, label: string): string | undefined {
  const wanted = label.trim().toLocaleLowerCase('de-DE');
  if (!wanted) return undefined;
  return DEFAULT_NOTE_TYPES.find((def) => def.id === typeId)?.fields.find(
    (field) => field.label.toLocaleLowerCase('de-DE') === wanted
  )?.key;
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

/**
 * Vergibt Kennung und Feldschluessel der im Dialog neu angelegten Eintraege
 * endgueltig, aus ihrer Beschriftung.
 *
 * Beim Anlegen steht in der Beschriftung noch der Platzhalter („Neuer Typ",
 * „Neues Feld"), ein daraus gebildeter Schluessel haette also nichts mit dem
 * zu tun, was danach eingetippt wird. Der jeweils erste eigene Typ jeder
 * Kampagne hiess so ueberall `neuer_typ`; das Uebernehmen aus einer anderen
 * Kampagne vergleicht Kennungen und hielt zwei voellig verschiedene Typen
 * fuer denselben.
 *
 * Bestehende Eintraege bleiben unangetastet: an ihrem Schluessel haengen
 * bereits eingetragene Werte. Neue koennen noch keine haben, ein Typ aus
 * diesem Dialog hat noch keine Notiz.
 *
 * @param createdTypes Kennungen der neu angelegten Typen.
 * @param createdFields Neue Felder als `typKennung:feldSchluessel`.
 */
export function finalizeNewEntries(
  draft: NoteTypeDef[],
  createdTypes: string[],
  createdFields: string[]
): NoteTypeDef[] {
  const takenIds = new Set(draft.filter((def) => !createdTypes.includes(def.id)).map((def) => def.id));

  return draft.map((def) => {
    const isNewField = (field: FieldDef) => createdFields.includes(`${def.id}:${field.key}`);
    const takenKeys = new Set(def.fields.filter((field) => !isNewField(field)).map((field) => field.key));

    const fields = def.fields.map((field) => {
      if (!isNewField(field)) return field;
      // Traegt das Feld die Beschriftung eines Werksfeldes, bekommt es dessen
      // Schluessel zurueck. Sonst blieben die Werte eines versehentlich
      // entfernten Feldes unerreichbar in der Datei stehen.
      const fromFactory = factoryFieldKey(def.id, field.label);
      const key = fromFactory && !takenKeys.has(fromFactory) ? fromFactory : toKey(field.label, takenKeys);
      takenKeys.add(key);
      return { ...field, key };
    });

    if (!createdTypes.includes(def.id)) return { ...def, fields };

    const id = toKey(def.label, takenIds);
    takenIds.add(id);
    return { ...def, id, fields };
  });
}

/**
 * Uebernimmt Notiztypen aus einer anderen Kampagne, ohne etwas zu verlieren.
 *
 * Bewusst nur ergaenzend: fehlende Typen kommen dazu, bei bekannten Typen
 * fehlende Felder. Nichts wird ersetzt oder entfernt, denn ein hier
 * geloeschter Typ wuerde bestehende Notizen typlos machen, und eine
 * ueberschriebene Beschriftung waere eine stille Aenderung an eigener Arbeit.
 */
export function mergeNoteTypes(current: NoteTypeDef[], incoming: NoteTypeDef[]): NoteTypeDef[] {
  const merged = current.map((def) => ({ ...def, fields: [...def.fields] }));
  const byId = new Map(merged.map((def) => [def.id, def]));

  for (const source of incoming) {
    const existing = byId.get(source.id);
    if (!existing) {
      const copy = { ...source, fields: source.fields.map((field) => ({ ...field })) };
      merged.push(copy);
      byId.set(copy.id, copy);
      continue;
    }

    const keys = new Set(existing.fields.map((field) => field.key));
    for (const field of source.fields) {
      if (!keys.has(field.key)) {
        existing.fields.push({ ...field });
        keys.add(field.key);
      }
    }
  }

  return merged;
}

/** Zaehlt, was ein Zusammenfuehren aendern wuerde, fuer die Rueckmeldung. */
export function countMergeChanges(
  current: NoteTypeDef[],
  incoming: NoteTypeDef[]
): { types: number; fields: number } {
  const merged = mergeNoteTypes(current, incoming);
  const currentFields = current.reduce((sum, def) => sum + def.fields.length, 0);
  const mergedFields = merged.reduce((sum, def) => sum + def.fields.length, 0);
  return { types: merged.length - current.length, fields: mergedFields - currentFields };
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
