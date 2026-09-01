import { useMemo, useState } from 'react';
import { FIELD_TYPES as FIELD_TYPE_IDS, toKey } from '../../shared/noteTypes';
import type { MessageKey } from '../../shared/i18n';
import { useT } from '../i18n';
import type { FieldDef, Note, NoteTypeDef } from '../../shared/types';
import { Modal } from './Modal';

interface Props {
  types: NoteTypeDef[];
  notes: Note[];
  onSave: (types: NoteTypeDef[]) => void;
  onClose: () => void;
}

const FIELD_TYPE_KEYS: Record<FieldDef['type'], MessageKey> = {
  text: 'fieldType.text',
  textarea: 'fieldType.textarea',
  number: 'fieldType.number',
  url: 'fieldType.url',
  image: 'fieldType.image'
};

/**
 * Bearbeitet die Notiztypen einer Kampagne samt ihrer Steckbrieffelder.
 *
 * Feldschluessel bleiben nach dem Anlegen unveraendert, nur die Beschriftung
 * laesst sich umbenennen. Sonst gingen bereits eingetragene Werte verloren.
 * Ein entferntes Feld loescht keine Werte: sie stehen weiter in der Datei und
 * tauchen wieder auf, wenn das Feld zurueckgeholt wird.
 */
export function NoteTypesDialog({ types, notes, onSave, onClose }: Props) {
  const t = useT();
  const [draft, setDraft] = useState<NoteTypeDef[]>(() => structuredClone(types));
  const [selectedId, setSelectedId] = useState(types[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);

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
    updateSelected({ fields: [...selected.fields, { key, label, type: 'text' }] });
  }

  function addType() {
    const id = toKey(t('types.newType'), draft.map((def) => def.id));
    const created: NoteTypeDef = { id, label: t('types.newType'), plural: t('types.newTypePlural'), fields: [] };
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
    onSave(draft);
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
                  <input
                    className="type-editor__placeholder"
                    value={field.placeholder ?? ''}
                    placeholder={t('types.example')}
                    onChange={(event) => updateField(field.key, { placeholder: event.target.value })}
                    aria-label={t('types.exampleLabel')}
                  />
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

      {error ? <p className="type-editor__error">{error}</p> : null}

      <p className="modal__hint">{t('types.hint')}</p>
    </Modal>
  );
}
