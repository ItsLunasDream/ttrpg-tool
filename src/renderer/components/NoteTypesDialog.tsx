import { useMemo, useState } from 'react';
import {
  FIELD_TYPES as FIELD_TYPE_IDS,
  countMergeChanges,
  factoryFieldKey,
  mergeNoteTypes,
  toKey
} from '../../shared/noteTypes';
import type { MessageKey } from '../../shared/i18n';
import { useT } from '../i18n';
import type { Campaign, FieldDef, Note, NoteTypeDef } from '../../shared/types';
import { Modal } from './Modal';

interface Props {
  types: NoteTypeDef[];
  notes: Note[];
  /** Andere Kampagnen, aus denen sich Typen uebernehmen lassen. */
  otherCampaigns: Campaign[];
  onSave: (types: NoteTypeDef[]) => void;
  onClose: () => void;
}

const FIELD_TYPE_KEYS: Record<FieldDef['type'], MessageKey> = {
  text: 'fieldType.text',
  textarea: 'fieldType.textarea',
  number: 'fieldType.number',
  url: 'fieldType.url',
  image: 'fieldType.image',
  select: 'fieldType.select',
  date: 'fieldType.date',
  checkbox: 'fieldType.checkbox'
};

/**
 * Bearbeitet die Notiztypen einer Kampagne samt ihrer Steckbrieffelder.
 *
 * Feldschluessel bleiben nach dem Anlegen unveraendert, nur die Beschriftung
 * laesst sich umbenennen. Sonst gingen bereits eingetragene Werte verloren.
 * Ein entferntes Feld loescht keine Werte: sie stehen weiter in der Datei und
 * tauchen wieder auf, wenn das Feld zurueckgeholt wird.
 */
export function NoteTypesDialog({ types, notes, otherCampaigns, onSave, onClose }: Props) {
  const t = useT();
  const [draft, setDraft] = useState<NoteTypeDef[]>(() => structuredClone(types));
  const [selectedId, setSelectedId] = useState(types[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState('');
  const [note, setNote] = useState<string | null>(null);

  /**
   * Was in diesem Dialog neu entstanden ist. Kennung und Feldschluessel
   * werden fuer diese Eintraege erst beim Uebernehmen aus der Beschriftung
   * gebildet, siehe `submit`.
   */
  const [createdTypes, setCreatedTypes] = useState<string[]>([]);
  const [createdFields, setCreatedFields] = useState<string[]>([]);

  const selected = draft.find((def) => def.id === selectedId) ?? draft[0] ?? null;

  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) counts.set(note.type, (counts.get(note.type) ?? 0) + 1);
    return counts;
  }, [notes]);

  function updateSelected(patch: Partial<NoteTypeDef>) {
    if (!selected) return;
    setDraft(draft.map((def) => (def.id === selected.id ? { ...def, ...patch } : def)));
  }

  function updateField(key: string, patch: Partial<FieldDef>) {
    if (!selected) return;
    updateSelected({
      fields: selected.fields.map((field) => (field.key === key ? { ...field, ...patch } : field))
    });
  }

  function moveField(key: string, direction: -1 | 1) {
    if (!selected) return;
    const fields = [...selected.fields];
    const from = fields.findIndex((field) => field.key === key);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= fields.length) return;
    [fields[from], fields[to]] = [fields[to], fields[from]];
    updateSelected({ fields });
  }

  function addField() {
    if (!selected) return;
    const label = t('types.newField');
    const key = toKey(label, selected.fields.map((field) => field.key));
    setCreatedFields([...createdFields, `${selected.id}:${key}`]);
    updateSelected({ fields: [...selected.fields, { key, label, type: 'text' }] });
  }

  function addType() {
    const id = toKey(t('types.newType'), draft.map((def) => def.id));
    const created: NoteTypeDef = { id, label: t('types.newType'), plural: t('types.newTypePlural'), fields: [] };
    setCreatedTypes([...createdTypes, id]);
    setDraft([...draft, created]);
    setSelectedId(id);
  }

  function removeType(def: NoteTypeDef) {
    const inUse = usage.get(def.id) ?? 0;
    if (inUse > 0) {
      setError(inUse === 1 ? t('types.inUseOne', { label: def.label }) : t('types.inUse', { label: def.label, count: inUse }));
      return;
    }
    if (draft.length === 1) {
      setError(t('error.needsOneType'));
      return;
    }
    setError(null);
    const remaining = draft.filter((entry) => entry.id !== def.id);
    setDraft(remaining);
    setSelectedId(remaining[0]?.id ?? '');
  }

  function submit() {
    const empty = draft.find((def) => !def.label.trim());
    if (empty) {
      setError(t('types.needsLabel'));
      return;
    }
    const emptyField = draft.flatMap((def) => def.fields.map((field) => ({ def, field }))).find(
      (entry) => !entry.field.label.trim()
    );
    if (emptyField) {
      setError(t('types.fieldNeedsLabel', { label: emptyField.def.label }));
      return;
    }

    // Eine Auswahlliste ohne Werte waere unbedienbar.
    const emptySelect = draft
      .flatMap((def) => def.fields)
      .find((field) => field.type === 'select' && (field.options ?? []).length === 0);
    if (emptySelect) {
      setError(t('error.selectNeedsOptions', { label: emptySelect.label }));
      return;
    }
    onSave(withFinalKeys());
  }

  /**
   * Vergibt Kennung und Feldschluessel der neuen Eintraege endgueltig.
   *
   * Beim Anlegen steht in der Beschriftung noch der Platzhalter, ein daraus
   * gebildeter Schluessel haette also nichts mit dem zu tun, was danach
   * eingetippt wird. Zwei Kampagnen bekaemen fuer ihren jeweils ersten
   * eigenen Typ dieselbe Kennung `neuer_typ`, und das Uebernehmen aus einer
   * anderen Kampagne hielte die beiden fuer denselben Typ und ergaenzte
   * nichts. Deshalb faellt die Entscheidung erst hier, wo die Beschriftung
   * feststeht.
   *
   * Bestehende Eintraege bleiben unangetastet: an ihrem Schluessel haengen
   * bereits eingetragene Werte. Neue koennen noch keine haben, ein Typ aus
   * diesem Dialog hat noch keine Notiz.
   */
  function withFinalKeys(): NoteTypeDef[] {
    const takenIds = new Set(draft.filter((def) => !createdTypes.includes(def.id)).map((def) => def.id));

    return draft.map((def) => {
      const takenKeys = new Set(
        def.fields.filter((field) => !createdFields.includes(`${def.id}:${field.key}`)).map((field) => field.key)
      );

      const fields = def.fields.map((field) => {
        if (!createdFields.includes(`${def.id}:${field.key}`)) return field;
        // Traegt das Feld die Beschriftung eines Werksfeldes, bekommt es
        // dessen Schluessel zurueck. Sonst blieben die Werte eines
        // versehentlich entfernten Feldes unerreichbar in der Datei.
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

  return (
    <Modal
      title={t('types.title')}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}>
            {t('dialog.cancel')}
          </button>
          <button type="button" className="primary" onClick={submit}>
            {t('dialog.apply')}
          </button>
        </>
      }
    >
      <div className="type-editor">
        <div className="type-editor__list">
          <ul>
            {draft.map((def) => (
              <li key={def.id}>
                <button
                  type="button"
                  className={def.id === selected?.id ? 'is-active' : undefined}
                  onClick={() => setSelectedId(def.id)}
                >
                  <span>{def.label || def.id}</span>
                  <span className="type-editor__count">{usage.get(def.id) ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={addType}>
            {t('types.addType')}
          </button>
        </div>

        {selected ? (
          <div className="type-editor__detail">
            <label className="field">
              <span className="field__label">{t('types.label')}</span>
              <input value={selected.label} onChange={(event) => updateSelected({ label: event.target.value })} />
            </label>

            <label className="field">
              <span className="field__label">{t('types.plural')}</span>
              <input value={selected.plural} onChange={(event) => updateSelected({ plural: event.target.value })} />
            </label>

            <h4 className="type-editor__heading">{t('types.fields')}</h4>

            {selected.fields.length === 0 ? (
              <p className="panel__empty">{t('types.noFields')}</p>
            ) : null}

            <ul className="type-editor__fields">
              {selected.fields.map((field, position) => (
                <li key={field.key}>
                  <div className="type-editor__field-row">
                    <input
                      className="type-editor__field-label"
                      value={field.label}
                      onChange={(event) => updateField(field.key, { label: event.target.value })}
                      aria-label={t('types.fieldLabel')}
                    />
                    <select
                      value={field.type}
                      onChange={(event) => updateField(field.key, { type: event.target.value as FieldDef['type'] })}
                      aria-label={t('types.fieldKind')}
                    >
                      {FIELD_TYPE_IDS.map((type) => (
                        <option value={type} key={type}>
                          {t(FIELD_TYPE_KEYS[type])}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="icon-button"
                      title={t('types.moveUp')}
                      disabled={position === 0}
                      onClick={() => moveField(field.key, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title={t('types.moveDown')}
                      disabled={position === selected.fields.length - 1}
                      onClick={() => moveField(field.key, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title={t('types.removeField')}
                      onClick={() => updateSelected({ fields: selected.fields.filter((entry) => entry.key !== field.key) })}
                    >
                      ×
                    </button>
                  </div>
                  {field.type === 'select' ? (
                    <textarea
                      className="type-editor__placeholder"
                      rows={3}
                      value={(field.options ?? []).join('\n')}
                      placeholder={t('types.options')}
                      aria-label={t('types.options')}
                      onChange={(event) =>
                        updateField(field.key, {
                          options: event.target.value.split('\n').map((entry) => entry.trim()).filter(Boolean)
                        })
                      }
                    />
                  ) : (
                    <input
                      className="type-editor__placeholder"
                      value={field.placeholder ?? ''}
                      placeholder={t('types.example')}
                      onChange={(event) => updateField(field.key, { placeholder: event.target.value })}
                      aria-label={t('types.exampleLabel')}
                    />
                  )}
                  <span className="type-editor__key">{t('types.key', { key: field.key })}</span>
                </li>
              ))}
            </ul>

            <div className="type-editor__actions">
              <button type="button" onClick={addField}>
                {t('types.addField')}
              </button>
              <button type="button" className="danger" onClick={() => removeType(selected)}>
                {t('types.deleteType')}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="type-editor__copy">
        <span className="field__label">{t('types.copyFrom')}</span>
        {otherCampaigns.length === 0 ? (
          <p className="panel__empty">{t('types.copyFromNone')}</p>
        ) : (
          <div className="relations__add">
            <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              <option value="">{t('types.copyFromChoose')}</option>
              {otherCampaigns.map((campaign) => (
                <option value={campaign.id} key={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!sourceId}
              onClick={() => {
                const source = otherCampaigns.find((campaign) => campaign.id === sourceId);
                if (!source) return;

                const changes = countMergeChanges(draft, source.noteTypes);
                setDraft(mergeNoteTypes(draft, source.noteTypes));
                setError(null);
                setNote(
                  changes.types === 0 && changes.fields === 0
                    ? t('types.copyFromNothing')
                    : t('types.copyFromResult', { types: changes.types, fields: changes.fields })
                );
              }}
            >
              {t('types.copyFromApply')}
            </button>
          </div>
        )}
        <p className="modal__hint">{t('types.copyFromHint')}</p>
        {note ? <p className="type-editor__note">{note}</p> : null}
      </div>

      {error ? <p className="type-editor__error">{error}</p> : null}

      <p className="modal__hint">{t('types.hint')}</p>
    </Modal>
  );
}
