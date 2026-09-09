import { useEffect, useRef, useState } from 'react';

export interface MenuEntry {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Trennlinie oberhalb dieses Eintrags. */
  separated?: boolean;
}

interface Props {
  label: string;
  entries: MenuEntry[];
  disabled?: boolean;
}

/**
 * Kleines Klappmenue. Von Hand statt mit einer Bibliothek, weil es nur eines
 * gibt und die Anwendung dafuer keine weitere Abhaengigkeit braucht.
 */
export function Menu({ label, entries, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="menu" ref={container}>
      <button type="button" disabled={disabled} aria-expanded={open} onClick={() => setOpen((previous) => !previous)}>
        {label} ▾
      </button>

      {open ? (
        <ul className="menu__list">
          {entries.map((entry) => (
            <li key={entry.label} className={entry.separated ? 'menu__separated' : undefined}>
              <button
                type="button"
                className={entry.danger ? 'danger' : undefined}
                disabled={entry.disabled}
                onClick={() => {
                  setOpen(false);
                  entry.onSelect();
                }}
              >
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
