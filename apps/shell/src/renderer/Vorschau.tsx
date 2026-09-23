/**
 * Die Vorschau beim Darueberfahren im Teilen: fuer eigene Eintraege
 * (Auswahl) und fuer angekommene, noch nicht angenommene.
 *
 * Erst nach kurzem Verweilen, damit ein Wischen ueber die Liste nicht zehn
 * Anfragen losschickt. Gelesenes bleibt im Speicher, solange die Liste
 * steht. Die Karte haengt am Dokument, nicht am Dialog: der Dialog ist
 * verschoben (transform), und darin waere `position: fixed` falsch.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Stand {
  readonly schluessel: string;
  readonly text: string;
  readonly x: number;
  readonly y: number;
}

export function useVorschau(): {
  zeige: (schluessel: string, lade: () => Promise<string>, ziel: HTMLElement) => void;
  verstecke: () => void;
  karte: ReactNode;
} {
  const [stand, setStand] = useState<Stand | null>(null);
  const gelesen = useRef(new Map<string, string>());
  const warte = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (warte.current) clearTimeout(warte.current);
  }, []);

  const zeige = (schluessel: string, lade: () => Promise<string>, ziel: HTMLElement) => {
    if (warte.current) clearTimeout(warte.current);
    warte.current = setTimeout(() => {
      const kasten = ziel.getBoundingClientRect();
      const ort = { x: kasten.left, y: kasten.bottom + 6 };
      const bekannt = gelesen.current.get(schluessel);
      if (bekannt !== undefined) {
        setStand({ schluessel, text: bekannt, ...ort });
        return;
      }
      void lade().then(
        (text) => {
          gelesen.current.set(schluessel, text);
          setStand((alt) => (alt === null || alt.schluessel === schluessel ? { schluessel, text, ...ort } : alt));
        },
        () => undefined
      );
      setStand({ schluessel, text: '…', ...ort });
    }, 350);
  };
  const verstecke = () => {
    if (warte.current) clearTimeout(warte.current);
    setStand(null);
  };

  const karte =
    stand && stand.text
      ? createPortal(
          <div
            className="auswahl__vorschau motion-erscheinen"
            data-vorschau={stand.schluessel}
            style={{
              left: Math.min(stand.x, window.innerWidth - 380),
              top: Math.min(stand.y, window.innerHeight - 240)
            }}
          >
            {stand.text}
          </div>,
          document.body
        )
      : null;
  return { zeige, verstecke, karte };
}
