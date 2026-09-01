import { useMemo, useState } from 'react';
import { FIELD_TYPE_LABELS, toKey } from '../../shared/noteTypes';
import type { FieldDef, Note, NoteTypeDef } from '../../shared/types';
import { Modal } from './Modal';

interface Props {
  types: NoteTypeDef[];
  notes: Note[];
  onSave: (types: NoteTypeDef[]) => void;
  onClose: () => void;
}

const FIELD_TYPES = Object.keys(FIELD_TYPE_LABELS) as FieldDef['type'][];

/**
 * Bearbeitet die Notiztypen einer Kampagne samt ihrer Steckbrieffelder.
 *
 * Feldschluessel bleiben nach dem Anlegen unveraendert, nur die Beschriftung
 * laesst sich umbenennen. Sonst gingen bereits eingetragene Werte verloren.
 * Ein entferntes Feld loescht keine Werte: sie stehen weiter in der Datei und
 * tauchen wieder auf, wenn das Feld zurueckgeholt wird.
 */
export function NoteTypesDialog({ types, notes, onSave, onClose }: Props) {
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
    const key = toKey('Neues Feld', selected.fields.map((field) => field.key));
    updateSelected({ fields: [...selected.fields, { key, label: 'Neues Feld', type: 'text' }] });
  }

  function addType() {
    const id = toKey('Neuer Typ', draft.map((def) => def.id));
    const created: NoteTypeDef = { id, label: 'Neuer Typ', plural: 'Neue Typen', fields: [] };
    setDraft([...draft, created]);
    setSelectedId(id);
  }

  function removeType(def: NoteTypeDef) {
    const inUse = usage.get(def.id) ?? 0;
    if (inUse > 0) {
      setError(`„${def.label}" wird noch von ${inUse} Notiz${inUse === 1 ? '' : 'en'} benutzt.`);
      return;
    }
    if (draft.length === 1) {
      setError('Es muss mindestens ein Notiztyp übrig bleiben.');
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
      setError('Jeder Notiztyp braucht eine Bezeichnung.');
      return;
    }
    const emptyField = draft.flatMap((def) => def.fields.map((field) => ({ def, field }))).find(
      (entry) => !entry.field.label.trim()
    );
    if (emptyField) {
      setError(`Ein Feld in „${emptyField.def.label}" hat keine Bezeichnung.`);
      return;
    }
    onSave(draft);
  }

  return (
    <Modal
      title="Notiztypen und Steckbrief"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="primary" onClick={submit}>
            Übernehmen
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
            + Typ
          </button>
        </div>

        {selected ? (
          <div className="type-editor__detail">
            <label className="field">
              <span className="field__label">Bezeichnung</span>
              <input value={selected.label} onChange={(event) => updateSelected({ label: event.target.value })} />
            </label>

            <label className="field">
              <span className="field__label">Mehrzahl</span>
              <input value={selected.plural} onChange={(event) => updateSelected({ plural: event.target.value })} />
            </label>

            <h4 className="type-editor__heading">Steckbrieffelder</h4>

            {selected.fields.length === 0 ? (
              <p className="panel__empty">Dieser Typ hat keine Felder. Notizen bestehen dann nur aus Text.</p>
            ) : null}

            <ul className="type-editor__fields">
              {selected.fields.map((field, position) => (
                <li key={field.key}>
                  <div className="type-editor__field-row">
                    <input
                      className="type-editor__field-label"
                      value={field.label}
                      onChange={(event) => updateField(field.key, { label: event.target.value })}
                      aria-label="Feldbezeichnung"
                    />
                    <select
                      value={field.type}
                      onChange={(event) => updateField(field.key, { type: event.target.value as FieldDef['type'] })}
                      aria-label="Feldart"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option value={type} key={type}>
                          {FIELD_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="icon-button"
                      title="Nach oben"
                      disabled={position === 0}
                      onClick={() => moveField(field.key, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title="Nach unten"
                      disabled={position === selected.fields.length - 1}
                      onClick={() => moveField(field.key, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      title="Feld entfernen"
                      onClick={() => updateSelected({ fields: selected.fields.filter((entry) => entry.key !== field.key) })}
                    >
                      ×
                    </button>
                  </div>
                  <input
                    className="type-editor__placeholder"
                    value={field.placeholder ?? ''}
                    placeholder="Beispieltext, optional"
                    onChange={(event) => updateField(field.key, { placeholder: event.target.value })}
                    aria-label="Beispieltext"
                  />
                  <span className="type-editor__key">Schlüssel {field.key}</span>
                </li>
              ))}
            </ul>

            <div className="type-editor__actions">
              <button type="button" onClick={addField}>
                + Feld
              </button>
              <button type="button" className="danger" onClick={() => removeType(selected)}>
                Typ löschen
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="type-editor__error">{error}</p> : null}

      <p className="modal__hint">
        Ein entferntes Feld löscht keine Werte. Sie bleiben in der Notizdatei stehen und erscheinen wieder, wenn du das
        Feld zurückholst. Der Schlüssel eines Felds bleibt beim Umbenennen unverändert, damit bestehende Einträge
        erhalten bleiben.
      </p>
    </Modal>
  );
}
