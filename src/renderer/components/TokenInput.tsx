import { useState, type KeyboardEvent } from 'react';

interface Props {
  label: string;
  values: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
}

/** Eingabe fuer Tags und Aliase: Enter oder Komma legt einen Eintrag an. */
export function TokenInput({ label, values, placeholder, onChange }: Props) {
  const [text, setText] = useState('');

  function commit(raw: string) {
    const entry = raw.trim().replace(/,$/, '').trim();
    setText('');
    if (!entry || values.some((value) => value.toLocaleLowerCase('de-DE') === entry.toLocaleLowerCase('de-DE'))) return;
    onChange([...values, entry]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(text);
    } else if (event.key === 'Backspace' && !text && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <div className="tokens">
        {values.map((value) => (
          <span className="token" key={value}>
            {value}
            <button type="button" onClick={() => onChange(values.filter((entry) => entry !== value))} aria-label={`${value} entfernen`}>
              ×
            </button>
          </span>
        ))}
        <input
          className="tokens__input"
          value={text}
          placeholder={placeholder}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commit(text)}
        />
      </div>
    </label>
  );
}
