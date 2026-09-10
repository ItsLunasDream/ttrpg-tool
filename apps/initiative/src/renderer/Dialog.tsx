/**
 * Kleine Dialoge in der Oberflaeche — Namensabfrage und Ja/Nein.
 *
 * Nicht `window.prompt` und `window.confirm`, und das ist kein Geschmack:
 * `prompt()` wirft in Electron („prompt() is not supported\"), die Abfrage
 * waere also schlicht kaputt gewesen. `confirm()` funktioniert zwar, haelt
 * dabei aber den ganzen Renderer an — in einer eingebetteten Ansicht ist das
 * ein Dialog, den die Huelle nicht kennt und nicht wegbekommt.
 *
 * Gemessen, nicht vermutet: ein Testfenster meldete fuer `prompt` die
 * Ausnahme und blieb bei `confirm` stehen, bis der Prozess abgebrochen wurde.
 */
import { useEffect, useRef, useState } from 'react';
import { t } from './i18n';

interface Props {
  readonly titel: string;
  /** Vorbelegung. Fehlt sie, ist es eine reine Ja/Nein-Frage. */
  readonly vorgabe?: string;
  readonly bestaetigen: string;
  onAbschluss(wert: string | null): void;
}

export function Dialog({ titel, vorgabe, bestaetigen, onAbschluss }: Props) {
  const [wert, setWert] = useState(vorgabe ?? '');
  const feld = useRef<HTMLInputElement>(null);
  const kasten = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fokus hinein, sonst haengt er am Knopf dahinter und Escape kaeme nie an.
    (feld.current ?? kasten.current)?.focus();
    feld.current?.select();
  }, []);

  function fertig() {
    if (vorgabe !== undefined && !wert.trim()) return;
    onAbschluss(vorgabe === undefined ? 'ja' : wert.trim());
  }

  return (
    <div
      className="dialog__grund motion-erscheinen"
      onMouseDown={(ereignis) => {
        // Nur ein Klick auf den Hintergrund schliesst, nicht einer, der im
        // Kasten begann und draussen endete.
        if (ereignis.target === ereignis.currentTarget) onAbschluss(null);
      }}
    >
      <div
        className="dialog motion-eintritt"
        role="dialog"
        aria-modal="true"
        aria-label={titel}
        tabIndex={-1}
        ref={kasten}
        onKeyDown={(ereignis) => {
          if (ereignis.key === 'Escape') {
            ereignis.stopPropagation();
            onAbschluss(null);
          }
          if (ereignis.key === 'Enter') {
            ereignis.preventDefault();
            fertig();
          }
        }}
      >
        <p className="dialog__titel">{titel}</p>
        {vorgabe !== undefined ? (
          <input
            ref={feld}
            type="text"
            value={wert}
            onChange={(ereignis) => setWert(ereignis.target.value)}
          />
        ) : null}
        <div className="dialog__knoepfe">
          <button type="button" onClick={() => onAbschluss(null)}>
            {t('nein')}
          </button>
          <button type="button" className="knopf--haupt" onClick={fertig}>
            {bestaetigen}
          </button>
        </div>
      </div>
    </div>
  );
}
