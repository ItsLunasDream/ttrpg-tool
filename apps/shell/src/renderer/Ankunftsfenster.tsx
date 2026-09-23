/**
 * Ein angekommener Eintrag in einem eigenen Fenster: per Doppelklick in der
 * Liste. Man liest den ganzen Text, bevor man ihn annimmt, und speichert ihn
 * von hier aus, ohne erst in die Liste zurueck zu muessen.
 *
 * Das Fenster liegt ueber dem Dialog „Teilen" (am Dokument, nicht im
 * Dialog: der ist verschoben, darin waere `position: fixed` falsch). Escape
 * schliesst nur das Fenster.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MessageKey, MessageParams } from '../shared/i18n';
import { AppSymbol } from './icons';

type Modus = 'uebernehmen' | 'daneben' | 'verwerfen';

interface Props {
  readonly ankunft: { nummer: number; werkzeug: string; name: string; art: string; annehmbar: boolean };
  readonly werkzeugName: string;
  readonly symbol?: string;
  /** Die Ziele des Werkzeugs, wenn es mehrere gibt (etwa Kampagnen). */
  readonly ziele?: readonly { id: string; name: string }[];
  readonly zielWahl: string;
  readonly setZiel: (id: string) => void;
  readonly konflikt: boolean;
  readonly modus: Modus;
  readonly setModus: (m: Modus) => void;
  readonly gespeichert: boolean;
  readonly speichere: () => Promise<{ ok: boolean; name: string; grund?: string }>;
  readonly onClose: () => void;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Ankunftsfenster(p: Props) {
  const { ankunft, t } = p;
  const [text, setText] = useState<string | null>(null);
  const [meldung, setMeldung] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const kasten = useRef<HTMLDivElement>(null);

  useEffect(() => {
    kasten.current?.focus();
    void window.shell.austausch.ankunftText(ankunft.nummer, true).then(setText, () => setText(''));
  }, [ankunft.nummer]);

  const ohneZiel = p.ziele !== undefined && !p.zielWahl;
  const speichern = async () => {
    setLaeuft(true);
    const e = await p.speichere();
    setLaeuft(false);
    setMeldung(e.ok ? t('share.windowSaved') : `${t('share.saveFailed')}${e.grund ? ` (${e.grund})` : ''}`);
  };

  return createPortal(
    <div
      className="ankunft__grund motion-erscheinen"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) p.onClose();
      }}
    >
      <div
        className="ankunft motion-eintritt"
        role="dialog"
        aria-modal="true"
        aria-label={ankunft.name}
        tabIndex={-1}
        ref={kasten}
        data-ankunftsfenster={ankunft.nummer}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            p.onClose();
          }
        }}
      >
        <div className="ankunft__kopf">
          <AppSymbol id={ankunft.werkzeug} size={22} bild={p.symbol} />
          <div className="ankunft__titel">
            <strong>{ankunft.name}</strong>
            <span className="auswahl__art">
              {ankunft.art} · {p.werkzeugName}
            </span>
          </div>
        </div>
        <div className="ankunft__text" data-ankunft-text>
          {text === null ? '…' : text || t('share.noText')}
        </div>
        <div className="ankunft__fuss">
          {p.ziele !== undefined && p.ziele.length > 0 && (
            <select className="feld__wahl" data-fenster-ziel value={p.zielWahl} onChange={(e) => p.setZiel(e.target.value)}>
              {p.ziele.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          )}
          {p.konflikt && !p.gespeichert && (
            <label className="austausch__konflikt">
              <span>{t('share.exists')}</span>
              <select className="feld__wahl" data-fenster-modus value={p.modus} onChange={(e) => p.setModus(e.target.value as Modus)}>
                <option value="daneben">{t('share.modeBeside')}</option>
                <option value="uebernehmen">{t('share.modeReplace')}</option>
                <option value="verwerfen">{t('share.modeDiscard')}</option>
              </select>
            </label>
          )}
          <span className="ankunft__meldung" data-fenster-meldung>
            {p.gespeichert ? t('share.windowSaved') : meldung}
          </span>
          <button
            type="button"
            className="dialog__knopf"
            data-fenster-speichern
            disabled={p.gespeichert || laeuft || !ankunft.annehmbar || ohneZiel}
            onClick={() => void speichern()}
          >
            {t('share.windowSave')}
          </button>
          <button type="button" className="dialog__knopf" data-fenster-schliessen onClick={p.onClose}>
            {t('dialog.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
