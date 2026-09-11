import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ContextMenuItem {
  readonly label: string;
  /** Rot dargestellt. Fuer alles, was etwas wegnimmt. */
  readonly danger?: boolean;
  readonly onSelect: () => void;
}

interface Props {
  readonly x: number;
  readonly y: number;
  readonly items: readonly ContextMenuItem[];
  readonly onClose: () => void;
}

/**
 * Ein Menue an der Zeigerstelle.
 *
 * Soll sich anfuehlen wie ein Menue des Systems: Escape und ein Klick daneben
 * schliessen es, die Pfeiltasten laufen durch, Enter waehlt. Ohne das waere
 * es ein Kasten, der im Weg steht.
 *
 * Bewusst NICHT in packages/: ein Menue braucht `document` und `window`, und
 * Regel 4 haelt geteilte Pakete frei von Browser-Globals. Der Initiative
 * Tracker hat deshalb eine eigene, gleich gebaute Fassung — zwei kurze
 * Dateien sind hier ehrlicher als ein Paket, das die Regel bricht.
 */
export function ContextMenu({ x, y, items, onClose }: Props) {
  const box = useRef<HTMLUListElement>(null);
  const [stelle, setStelle] = useState({ left: x, top: y });
  const [aktiv, setAktiv] = useState(0);

  /*
   * An einem Rand zur anderen Seite klappen.
   *
   * Erst messen, dann setzen — mit useLayoutEffect, damit das Menue nicht
   * einen Frame lang halb ausserhalb des Fensters steht und dann springt.
   */
  useLayoutEffect(() => {
    const eigen = box.current?.getBoundingClientRect();
    if (!eigen) return;
    const rand = 8;
    const links = x + eigen.width > window.innerWidth - rand ? x - eigen.width : x;
    const oben = y + eigen.height > window.innerHeight - rand ? y - eigen.height : y;
    setStelle({ left: Math.max(rand, links), top: Math.max(rand, oben) });
  }, [x, y]);

  useEffect(() => {
    box.current?.focus();
  }, []);

  useEffect(() => {
    // `pointerdown` und nicht `click`: sonst schliesst das Menue erst, wenn
    // der Klick daneben schon etwas anderes ausgeloest hat.
    const daneben = (ereignis: PointerEvent) => {
      if (!box.current?.contains(ereignis.target as Node)) onClose();
    };
    // In der Auffangphase, damit ein Klick auf einen Knopf darunter das Menue
    // zuverlaessig schliesst, auch wenn der Knopf das Ereignis abfaengt.
    document.addEventListener('pointerdown', daneben, true);
    window.addEventListener('resize', onClose);
    // Rollt die Liste darunter weg, stuende das Menue an der falschen Stelle.
    window.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('pointerdown', daneben, true);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

  return (
    <ul
      className="kontextmenue"
      ref={box}
      role="menu"
      tabIndex={-1}
      style={{ left: stelle.left, top: stelle.top }}
      onKeyDown={(ereignis) => {
        if (ereignis.key === 'Escape') {
          ereignis.stopPropagation();
          onClose();
          return;
        }
        if (ereignis.key === 'ArrowDown' || ereignis.key === 'ArrowUp') {
          ereignis.preventDefault();
          const schritt = ereignis.key === 'ArrowDown' ? 1 : items.length - 1;
          setAktiv((vorher) => (vorher + schritt) % items.length);
          return;
        }
        if (ereignis.key === 'Enter' || ereignis.key === ' ') {
          ereignis.preventDefault();
          items[aktiv]?.onSelect();
          onClose();
        }
      }}
    >
      {items.map((eintrag, nummer) => (
        <li key={eintrag.label}>
          <button
            type="button"
            role="menuitem"
            className={`${eintrag.danger ? 'kontextmenue__gefaehrlich' : ''} ${
              nummer === aktiv ? 'is-active' : ''
            }`}
            onMouseEnter={() => setAktiv(nummer)}
            onClick={() => {
              eintrag.onSelect();
              onClose();
            }}
          >
            {eintrag.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
