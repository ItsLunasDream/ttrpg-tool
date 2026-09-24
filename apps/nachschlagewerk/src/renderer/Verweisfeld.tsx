/**
 * Ein Textfeld, das bei `[[` Eintraege vorschlaegt — wie im Story Creator.
 *
 * Fuer Hausregeln: wer „[[Blin" tippt, bekommt „Blind" und andere Treffer
 * aus den offiziellen Regeln und den eigenen Hausregeln. Pfeiltasten
 * waehlen, Enter oder Tab nimmt, Escape schliesst. Gesetzt wird
 * `[[Name]]`, das die Anzeige schon als Verweis kennt.
 */
import { useMemo, useRef, useState } from 'react';

export interface Vorschlag {
  readonly name: string;
  /** Kleine Zeile daneben: „Zauber", „Hausregel" … */
  readonly art: string;
}

const HOECHSTENS = 8;

/** Der offene Verweis vor der Einfuegemarke: `[[Blin|` → „Blin". */
export function offenerVerweis(text: string, stelle: number): { start: number; frage: string } | null {
  const davor = text.slice(0, stelle);
  const anfang = davor.lastIndexOf('[[');
  if (anfang < 0) return null;
  const frage = davor.slice(anfang + 2);
  // Schon geschlossen, oder ueber die Zeile hinaus: dann ist nichts offen.
  if (/[\]\n|]/.test(frage) || frage.length > 60) return null;
  return { start: anfang + 2, frage };
}

export function passende(alle: readonly Vorschlag[], frage: string): Vorschlag[] {
  const f = frage.trim().toLowerCase();
  const gesehen = new Set<string>();
  const vorne: Vorschlag[] = [];
  const drin: Vorschlag[] = [];
  for (const v of alle) {
    const n = v.name.toLowerCase();
    if (gesehen.has(n)) continue;
    if (f && !n.includes(f)) continue;
    gesehen.add(n);
    (n.startsWith(f) ? vorne : drin).push(v);
  }
  return [...vorne, ...drin].slice(0, HOECHSTENS);
}

export function Verweisfeld({
  wert,
  setze,
  vorschlaege,
  ...rest
}: {
  readonly wert: string;
  readonly setze: (text: string) => void;
  readonly vorschlaege: readonly Vorschlag[];
  readonly rows?: number;
  readonly placeholder?: string;
  readonly 'data-feld'?: string;
}) {
  const feld = useRef<HTMLTextAreaElement>(null);
  const [offen, setOffen] = useState<{ start: number; frage: string } | null>(null);
  const [markiert, setMarkiert] = useState(0);
  const liste = useMemo(() => (offen ? passende(vorschlaege, offen.frage) : []), [offen, vorschlaege]);

  const pruefe = (el: HTMLTextAreaElement) => {
    const gefunden = el.selectionStart === el.selectionEnd ? offenerVerweis(el.value, el.selectionStart) : null;
    setOffen(gefunden);
    setMarkiert(0);
  };

  const nimm = (name: string) => {
    const el = feld.current;
    if (!el || !offen) return;
    const ende = el.selectionStart;
    const danach = wert.slice(ende);
    // Stand schon „]]" dahinter, wird es nicht verdoppelt.
    const schluss = danach.startsWith(']]') ? '' : ']]';
    const neu = wert.slice(0, offen.start) + name + schluss + danach;
    setze(neu);
    setOffen(null);
    const marke = offen.start + name.length + 2;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(marke, marke);
    });
  };

  return (
    <div className="verweisfeld">
      <textarea
        {...rest}
        ref={feld}
        value={wert}
        onChange={(e) => {
          setze(e.target.value);
          pruefe(e.target);
        }}
        onClick={(e) => pruefe(e.currentTarget)}
        onBlur={() => setOffen(null)}
        onKeyDown={(e) => {
          if (!offen || liste.length === 0) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const schritt = e.key === 'ArrowDown' ? 1 : -1;
            setMarkiert((m) => (m + schritt + liste.length) % liste.length);
          } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            nimm(liste[Math.min(markiert, liste.length - 1)].name);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setOffen(null);
          }
        }}
      />
      {offen && liste.length > 0 ? (
        <ul className="verweisfeld__liste" role="listbox" data-verweisvorschlaege>
          {liste.map((v, i) => (
            <li
              key={`${v.art}-${v.name}`}
              role="option"
              aria-selected={i === markiert}
              className={i === markiert ? 'verweisfeld__eintrag is-an' : 'verweisfeld__eintrag'}
              data-verweisvorschlag={v.name}
              // mousedown statt click: sonst schliesst onBlur die Liste vorher.
              onMouseDown={(e) => {
                e.preventDefault();
                nimm(v.name);
              }}
              onMouseEnter={() => setMarkiert(i)}
            >
              <span>{v.name}</span>
              <span className="verweisfeld__art">{v.art}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
