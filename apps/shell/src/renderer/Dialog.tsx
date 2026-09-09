/**
 * Der Rahmen fuer die Dialoge der Huelle.
 *
 * Die Huelle hat zwei, und beide sollen sich gleich verhalten: Escape
 * schliesst, ein Klick auf den Hintergrund schliesst, der Fokus springt in den
 * Dialog und bleibt darin. Das einmal hier zu machen ist weniger Arbeit als
 * zweimal daran zu denken.
 */
import { useCallback, useEffect, useRef, type ReactNode } from 'react';

interface Props {
  readonly titel: string;
  readonly schliessenText: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Dialog({ titel, schliessenText, onClose, children }: Props) {
  const kasten = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fokus in den Dialog holen, sonst haengt er noch am Knopf dahinter und
    // Escape kaeme nie an.
    kasten.current?.focus();
  }, []);

  const beiTaste = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className="dialog__grund motion-erscheinen"
      onMouseDown={(event) => {
        // Nur ein Klick auf den Hintergrund schliesst, nicht einer, der im
        // Dialog begonnen und ausserhalb geendet hat (Textauswahl).
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog motion-eintritt"
        role="dialog"
        aria-modal="true"
        aria-label={titel}
        tabIndex={-1}
        ref={kasten}
        onKeyDown={beiTaste}
      >
        <h2 className="dialog__titel">{titel}</h2>
        <div className="dialog__inhalt">{children}</div>
        <div className="dialog__fuss">
          <button type="button" className="dialog__knopf" onClick={onClose}>
            {schliessenText}
          </button>
        </div>
      </div>
    </div>
  );
}
