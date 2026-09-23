/**
 * Der Reiter „Raum" im Dialog „Teilen" (docs/austausch.md, Stufe 2).
 *
 * Aus: den eigenen Namen setzen, einen Raum eroeffnen oder einem aus der
 * Liste beitreten (oder ueber die Adresse, wenn das Netz die Liste nicht
 * durchlaesst). Drin: wer da ist, der Chat, Nachrichten an alle oder an
 * eine Person.
 *
 * Der Dienst lebt im Hauptprozess; dieser Reiter zeigt nur seinen Stand.
 * Ein geschlossener Dialog verliert also nichts.
 */
import { useEffect, useRef, useState } from 'react';
import type { MessageKey, MessageParams } from '../shared/i18n';
import type { GefundenerRaum, Raumzustand } from '../main/raum';

interface Props {
  readonly zustand: Raumzustand;
  readonly raeume: readonly GefundenerRaum[];
  readonly fehler: string;
  readonly t: (key: MessageKey, params?: MessageParams) => string;
}

export function Raum({ zustand, raeume, fehler, t }: Props) {
  const [name, setName] = useState('');
  const [raumName, setRaumName] = useState('');
  const [passwort, setPasswort] = useState('');
  const [beitrittPasswort, setBeitrittPasswort] = useState('');
  const [adresse, setAdresse] = useState('');
  const [text, setText] = useState('');
  const [an, setAn] = useState('');
  const liste = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void window.shell.einstellungen.lesen().then((e) => setName(e.tischName));
    void window.shell.raum.suchen();
  }, []);

  useEffect(() => {
    liste.current?.scrollTo({ top: liste.current.scrollHeight });
  }, [zustand.chat.length]);

  const speichereName = (neu: string) => {
    setName(neu);
    void window.shell.einstellungen.schreiben({ tischName: neu });
  };

  if (zustand.rolle === 'aus') {
    return (
      <div className="austausch raum" data-raum="aus">
        <label className="feld">
          <span className="feld__name">{t('room.yourName')}</span>
          <input
            className="suche__feld raum__eingabe"
            data-tischname
            value={name}
            maxLength={40}
            placeholder={t('room.namePlaceholder')}
            onChange={(e) => speichereName(e.target.value)}
          />
        </label>
        <p className="einst__satz raum__warnung">{t('room.unencrypted')}</p>

        <h3 className="raum__kopf">{t('room.found')}</h3>
        {raeume.length === 0 ? (
          <p className="einst__satz">{t('room.noneFound')}</p>
        ) : (
          <ul className="austausch__liste">
            {raeume.map((r) => (
              <li key={`${r.adresse}:${r.port}`} className="austausch__zeile">
                <span className="austausch__name">{r.raum}</span>
                <span className="austausch__art">
                  {r.gastgeber}
                  {r.geschuetzt ? ` · ${t('room.protected')}` : ''}
                </span>
                <button
                  type="button"
                  className="dialog__knopf"
                  data-beitreten={r.raum}
                  onClick={() => void window.shell.raum.beitreten(r.adresse, r.port, beitrittPasswort)}
                >
                  {t('room.join')}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="raum__reihe">
          <input
            className="suche__feld raum__eingabe"
            type="password"
            data-beitritt-passwort
            value={beitrittPasswort}
            placeholder={t('room.password')}
            onChange={(e) => setBeitrittPasswort(e.target.value)}
          />
          <input
            className="suche__feld raum__eingabe"
            data-adresse
            value={adresse}
            placeholder={t('room.address')}
            onChange={(e) => setAdresse(e.target.value)}
          />
          <button
            type="button"
            className="dialog__knopf"
            disabled={!/^[^\s:]+:\d+$/.test(adresse.trim())}
            onClick={() => {
              const [host, port] = adresse.trim().split(':');
              void window.shell.raum.beitreten(host, Number(port), beitrittPasswort);
            }}
          >
            {t('room.join')}
          </button>
        </div>
        {fehler && (
          <p className="einst__satz austausch__fehler" data-raum-fehler>
            {fehler}
          </p>
        )}

        <h3 className="raum__kopf">{t('room.open')}</h3>
        <div className="raum__reihe">
          <input
            className="suche__feld raum__eingabe"
            data-raumname
            value={raumName}
            maxLength={40}
            placeholder={t('room.roomName')}
            onChange={(e) => setRaumName(e.target.value)}
          />
          <input
            className="suche__feld raum__eingabe"
            type="password"
            data-raum-passwort
            value={passwort}
            placeholder={t('room.passwordOptional')}
            onChange={(e) => setPasswort(e.target.value)}
          />
          <button
            type="button"
            className="dialog__knopf"
            data-raum-eroeffnen
            onClick={() => void window.shell.raum.eroeffnen(raumName, passwort)}
          >
            {t('room.openButton')}
          </button>
        </div>
      </div>
    );
  }

  const andere = zustand.personen.filter((p) => p.id !== zustand.ich?.id);
  const senden = () => {
    if (!text.trim()) return;
    void window.shell.raum.chat(text, an || null).then((ok) => ok && setText(''));
  };

  return (
    <div className="austausch raum" data-raum="drin">
      <div className="raum__reihe raum__kopfzeile">
        <strong data-raumtitel>{zustand.raum}</strong>
        <span className="austausch__art">
          {zustand.rolle === 'gastgeber'
            ? t('room.youHost', {
                adresse: (zustand.adressen.length > 0 ? zustand.adressen : ['127.0.0.1'])
                  .map((a) => `${a}:${zustand.port ?? ''}`)
                  .join(', ')
              })
            : t('room.youAre', { name: zustand.ich?.name ?? '' })}
        </span>
        <button type="button" className="dialog__knopf" data-raum-verlassen onClick={() => void window.shell.raum.verlassen()}>
          {zustand.rolle === 'gastgeber' ? t('room.close') : t('room.leave')}
        </button>
      </div>
      <p className="austausch__art" data-personen>
        {t('room.people')}: {zustand.personen.map((p) => p.name).join(', ')}
      </p>
      <div className="raum__chat" ref={liste} data-chat>
        {zustand.chat.length === 0 ? (
          <p className="einst__satz">{t('room.emptyChat')}</p>
        ) : (
          zustand.chat.map((z, i) => (
            <p key={i} className={`raum__zeile${z.an ? ' is-privat' : ''}${z.eigene ? ' is-eigen' : ''}`}>
              <span className="raum__wer">
                {z.von.name}
                {z.an ? ` → ${z.an.name}` : ''}
              </span>{' '}
              {z.an ? <em className="raum__privat">{t('room.private')} </em> : null}
              {z.text}
            </p>
          ))
        )}
      </div>
      <div className="raum__reihe">
        <select className="feld__wahl" data-chat-an value={an} onChange={(e) => setAn(e.target.value)}>
          <option value="">{t('room.toAll')}</option>
          {andere.map((p) => (
            <option key={p.id} value={p.id}>
              {t('room.toOne', { name: p.name })}
            </option>
          ))}
        </select>
        <input
          className="suche__feld raum__eingabe raum__text"
          data-chat-text
          value={text}
          maxLength={4000}
          placeholder={t('room.message')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') senden();
          }}
        />
        <button type="button" className="dialog__knopf" data-chat-senden onClick={senden}>
          {t('room.send')}
        </button>
      </div>
      {an && <p className="einst__satz raum__warnung">{t('room.privateHint')}</p>}
    </div>
  );
}
