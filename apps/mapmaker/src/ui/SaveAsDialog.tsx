/**
 * „Speichern unter": Namen vergeben, dann speichern.
 *
 * Der Grund für einen eigenen Dialog ist ein Unterschied zwischen den
 * Browsern, den der Benutzer sonst als Fehler erlebt. Wo es die
 * File-System-Access-API gibt (Chrome, Edge), fragt der Browser danach selbst
 * nach Ordner und Dateiname — dort ist dieser Dialog nur die Stelle, an der
 * die *Karte* ihren Namen bekommt. Wo es sie nicht gibt (Firefox, Safari),
 * darf eine Seite den Ordner nicht wählen; ohne diesen Dialog liefe
 * „Speichern unter" dort auf einen wortlosen Download unter automatisch
 * vergebenem Namen hinaus — also auf genau dasselbe wie „Speichern".
 *
 * Deshalb sagt der Hilfetext auch, was gleich passiert, statt es zu
 * verschweigen: einen Ordner kann diese Seite in Firefox nicht wählen, und so
 * zu tun, als könnte sie es, wäre schlimmer als es zu benennen.
 */

import { useEffect, useRef, useState } from 'react';
import { canPickSaveTarget } from '@/io/saveTarget';
import { useT } from '@/i18n/useT';
import { Row } from './controls';

export function SaveAsDialog({
  offen,
  name,
  onAbbruch,
  onSpeichern,
}: {
  offen: boolean;
  name: string;
  onAbbruch: () => void;
  onSpeichern: (name: string) => void;
}) {
  const { t } = useT();
  const [wert, setWert] = useState(name);
  const feld = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!offen) return;
    setWert(name);
    // Auswählen statt nur fokussieren: der alte Name ist meist nicht der,
    // den man behalten will.
    const id = window.setTimeout(() => feld.current?.select(), 0);
    return () => window.clearTimeout(id);
  }, [offen, name]);

  if (!offen) return null;

  const sauber = wert.trim();
  const absenden = () => {
    if (sauber) onSpeichern(sauber);
  };

  return (
    <div className="modal-backdrop" onClick={onAbbruch}>
      <div className="modal narrow" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>{t('file.saveAsTitle')}</h3>
          <button className="ghost icon" onClick={onAbbruch} title={t('export.close')}>
            ✕
          </button>
        </header>

        <div className="modal-body">
          <Row label={t('file.saveAsName')}>
            <input
              ref={feld}
              type="text"
              value={wert}
              placeholder={t('file.saveAsNamePlaceholder')}
              onChange={(e) => setWert(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') absenden();
                if (e.key === 'Escape') onAbbruch();
              }}
            />
          </Row>
          <p className="hint">
            {canPickSaveTarget() ? t('file.saveAsPicker') : t('file.saveAsDownload')}
          </p>
        </div>

        <footer>
          <button onClick={onAbbruch}>{t('export.cancel')}</button>
          <button className="primary" disabled={!sauber} onClick={absenden}>
            {t('file.saveAsRun')}
          </button>
        </footer>
      </div>
    </div>
  );
}
