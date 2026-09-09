/**
 * Eine Zeile der Initiativliste.
 *
 * Zugeklappt zeigt sie, was man im Kampf braucht: wer dran ist, wie es um die
 * Trefferpunkte steht, welche Zustaende laufen. Aufgeklappt kommen die Felder
 * dazu, die man beim Vorbereiten oder Nachjustieren braucht. Das ist kein
 * Bearbeitungsmodus — beides ist jederzeit erreichbar, weil am Tisch beides
 * jederzeit vorkommt.
 */
import { useState, type ReactNode } from 'react';
import { t } from './i18n';
import type { Koerper, Teilnehmer } from '../shared/types';

interface Props {
  readonly teilnehmer: Teilnehmer;
  readonly amZug: boolean;
  readonly laeuft: boolean;
  readonly offen: boolean;
  readonly nummer: number;
  readonly bildUrl: string | null;
  onOeffnen(): void;
  onAendern(aendere: (teilnehmer: Teilnehmer) => Teilnehmer): void;
  onSchaden(koerperId: string, betrag: number): void;
  onSetzeHp(koerperId: string, wert: number): void;
  onGruppe(anzahl: number): void;
  onDuplizieren(): void;
  onEntfernen(): void;
  onZustand(name: string, runden: number | null): void;
  onZustandWeg(zustandId: string): void;
  onBild(): void;
}

export function Zeile(props: Props) {
  const { teilnehmer, amZug, laeuft, offen } = props;
  const lebt = teilnehmer.koerper.some((koerper) => !koerper.raus && koerper.hp > 0);
  const gruppe = teilnehmer.koerper.length > 1;

  return (
    <section
      className={[
        'zeile',
        amZug ? 'zeile--dran' : '',
        !lebt ? 'zeile--liegt' : '',
        offen ? 'zeile--offen' : '',
        'motion-eintritt'
      ]
        .filter(Boolean)
        .join(' ')}
      // Gestaffelter Auftritt, aber knapp: bei zwoelf Teilnehmern darf der
      // letzte nicht spuerbar spaeter dastehen als der erste.
      style={{ animationDelay: `${Math.min(props.nummer, 8) * 25}ms` }}
      aria-current={amZug ? 'true' : undefined}
    >
      <div className="zeile__kopf">
        <span className="zeile__ini" title={t('feld.initiative')}>
          {teilnehmer.initiative}
        </span>

        {props.bildUrl ? (
          <img className="zeile__bild" src={props.bildUrl} alt="" />
        ) : (
          <span className="zeile__bild zeile__bild--leer" aria-hidden="true">
            {(teilnehmer.name || '?').slice(0, 1).toUpperCase()}
          </span>
        )}

        <button type="button" className="zeile__name" onClick={props.onOeffnen}>
          {teilnehmer.name || <em className="zeile__namenlos">{t('feld.name')}</em>}
          {gruppe ? (
            <span className="zeile__marke">{t('gruppe.mitglieder', { n: teilnehmer.koerper.length })}</span>
          ) : null}
          {teilnehmer.istSpieler ? <span className="zeile__marke">PC</span> : null}
        </button>

        <div className="zeile__koerper">
          {teilnehmer.koerper.map((koerper) => (
            <KoerperFeld
              key={koerper.id}
              koerper={koerper}
              zeigeMarke={gruppe}
              onSchaden={(betrag) => props.onSchaden(koerper.id, betrag)}
              onSetzeHp={(wert) => props.onSetzeHp(koerper.id, wert)}
            />
          ))}
        </div>

        {amZug ? <span className="zeile__dran">{t('amZug')}</span> : null}
      </div>

      {teilnehmer.zustaende.length > 0 ? (
        <div className="zeile__zustaende">
          {teilnehmer.zustaende.map((zustand) => (
            <button
              key={zustand.id}
              type="button"
              className="zustand"
              onClick={() => props.onZustandWeg(zustand.id)}
              title={t('knopf.entfernen')}
            >
              {zustand.name}
              {zustand.rundenRest !== null ? <span className="zustand__runden">{zustand.rundenRest}</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      {offen ? (
        <Ausklapp
          teilnehmer={teilnehmer}
          laeuft={laeuft}
          hatBild={Boolean(props.bildUrl)}
          onAendern={props.onAendern}
          onGruppe={props.onGruppe}
          onDuplizieren={props.onDuplizieren}
          onEntfernen={props.onEntfernen}
          onZustand={props.onZustand}
          onBild={props.onBild}
        />
      ) : null}
    </section>
  );
}

/**
 * Trefferpunkte eines Koerpers, mit dem Feld fuer Schaden daneben.
 *
 * Eintippen und Enter — nicht Plus- und Minusknoepfe: Schaden ist selten eins,
 * und siebenmal klicken ist am Tisch keine Bedienung.
 */
function KoerperFeld({
  koerper,
  zeigeMarke,
  onSchaden,
  onSetzeHp
}: {
  koerper: Koerper;
  zeigeMarke: boolean;
  onSchaden: (betrag: number) => void;
  onSetzeHp: (wert: number) => void;
}) {
  const [eingabe, setEingabe] = useState('');
  const [blitzt, setBlitzt] = useState<'schaden' | 'heilung' | null>(null);
  const liegt = koerper.hp <= 0 || koerper.raus;

  function anwenden() {
    const betrag = Number.parseInt(eingabe, 10);
    if (!Number.isFinite(betrag) || betrag === 0) return;
    onSchaden(betrag);
    setEingabe('');
    // Ein kurzes Aufleuchten statt einer Meldung: es sagt „angekommen\", ohne
    // dass jemand hinsehen muss.
    setBlitzt(betrag > 0 ? 'schaden' : 'heilung');
    window.setTimeout(() => setBlitzt(null), 500);
  }

  return (
    <span className={`koerper ${liegt ? 'koerper--liegt' : ''} ${blitzt ? `koerper--${blitzt}` : ''}`}>
      {zeigeMarke && koerper.marke ? <span className="koerper__marke">{koerper.marke}</span> : null}
      <input
        className="koerper__hp"
        type="number"
        value={koerper.hp}
        onChange={(ereignis) => onSetzeHp(Number.parseInt(ereignis.target.value, 10) || 0)}
        aria-label={t('feld.hp')}
      />
      <span className="koerper__max">/{koerper.hpMax}</span>
      {koerper.tempHp > 0 ? <span className="koerper__temp">+{koerper.tempHp}</span> : null}
      <input
        className="koerper__schaden"
        type="text"
        inputMode="numeric"
        value={eingabe}
        placeholder="–"
        title={t('schaden.hinweis')}
        onChange={(ereignis) => setEingabe(ereignis.target.value)}
        onKeyDown={(ereignis) => {
          if (ereignis.key === 'Enter') {
            ereignis.preventDefault();
            anwenden();
          }
        }}
        onBlur={anwenden}
      />
    </span>
  );
}

function Feld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="feld">
      <span className="feld__label">{label}</span>
      {children}
    </label>
  );
}

function Ausklapp({
  teilnehmer,
  laeuft,
  hatBild,
  onAendern,
  onGruppe,
  onDuplizieren,
  onEntfernen,
  onZustand,
  onBild
}: {
  teilnehmer: Teilnehmer;
  laeuft: boolean;
  hatBild: boolean;
  onAendern: (aendere: (teilnehmer: Teilnehmer) => Teilnehmer) => void;
  onGruppe: (anzahl: number) => void;
  onDuplizieren: () => void;
  onEntfernen: () => void;
  onZustand: (name: string, runden: number | null) => void;
  onBild: () => void;
}) {
  const [zustandName, setZustandName] = useState('');
  const [zustandRunden, setZustandRunden] = useState('');

  function zustandHinzu() {
    const name = zustandName.trim();
    if (!name) return;
    const runden = Number.parseInt(zustandRunden, 10);
    onZustand(name, Number.isFinite(runden) && runden > 0 ? runden : null);
    setZustandName('');
    setZustandRunden('');
  }

  return (
    <div className="ausklapp motion-eintritt">
      <div className="ausklapp__felder">
        <Feld label={t('feld.name')}>
          <input
            type="text"
            value={teilnehmer.name}
            autoFocus={!teilnehmer.name}
            onChange={(e) => onAendern((alt) => ({ ...alt, name: e.target.value }))}
          />
        </Feld>
        <Feld label={t('feld.initiative')}>
          <input
            type="number"
            className="schmal"
            value={teilnehmer.initiative}
            onChange={(e) => onAendern((alt) => ({ ...alt, initiative: Number.parseInt(e.target.value, 10) || 0 }))}
          />
        </Feld>
        <Feld label={t('feld.feinwert')}>
          <input
            type="number"
            className="schmal"
            value={teilnehmer.feinwert}
            onChange={(e) => onAendern((alt) => ({ ...alt, feinwert: Number.parseInt(e.target.value, 10) || 0 }))}
          />
        </Feld>
        <Feld label={t('feld.hpMax')}>
          <input
            type="number"
            className="schmal"
            value={teilnehmer.koerper[0]?.hpMax ?? 0}
            onChange={(e) => {
              const hpMax = Math.max(0, Number.parseInt(e.target.value, 10) || 0);
              // Auch die laufenden Trefferpunkte mitziehen, solange sie
              // unberuehrt sind: beim Anlegen tippt man erst den Hoechstwert,
              // und eine Kreatur, die mit 0 von 12 startet, waere falsch.
              onAendern((alt) => ({
                ...alt,
                koerper: alt.koerper.map((koerper) => ({
                  ...koerper,
                  hpMax,
                  hp: koerper.hp === koerper.hpMax ? hpMax : Math.min(koerper.hp, hpMax)
                }))
              }));
            }}
          />
        </Feld>
        <Feld label={t('feld.anzahl')}>
          <input
            type="number"
            className="schmal"
            min={1}
            max={99}
            value={teilnehmer.koerper.length}
            onChange={(e) => onGruppe(Number.parseInt(e.target.value, 10) || 1)}
          />
        </Feld>
        <label className="feld feld--haken">
          <input
            type="checkbox"
            checked={teilnehmer.istSpieler}
            onChange={(e) => onAendern((alt) => ({ ...alt, istSpieler: e.target.checked }))}
          />
          <span>{t('feld.spieler')}</span>
        </label>
      </div>

      <div className="ausklapp__zustand">
        <input
          type="text"
          placeholder={t('knopf.zustand')}
          value={zustandName}
          onChange={(e) => setZustandName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              zustandHinzu();
            }
          }}
        />
        <input
          type="number"
          className="schmal"
          placeholder={t('feld.runden')}
          value={zustandRunden}
          onChange={(e) => setZustandRunden(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              zustandHinzu();
            }
          }}
        />
        <button type="button" onClick={zustandHinzu}>
          +
        </button>
      </div>

      <div className="ausklapp__knoepfe">
        <button type="button" onClick={onBild}>
          {hatBild ? t('knopf.bild') : t('knopf.bild')}
        </button>
        {hatBild ? (
          <button type="button" onClick={() => onAendern((alt) => ({ ...alt, bild: null }))}>
            {t('knopf.bildWeg')}
          </button>
        ) : null}
        <button type="button" onClick={onDuplizieren}>
          {t('knopf.duplizieren')}
        </button>
        <span className="leiste__fueller" />
        <button type="button" className="knopf--gefahr" onClick={onEntfernen}>
          {t('knopf.entfernen')}
        </button>
      </div>

      {laeuft ? null : (
        <textarea
          className="ausklapp__notiz"
          placeholder={t('feld.notiz')}
          value={teilnehmer.notiz}
          onChange={(e) => onAendern((alt) => ({ ...alt, notiz: e.target.value }))}
        />
      )}
    </div>
  );
}
