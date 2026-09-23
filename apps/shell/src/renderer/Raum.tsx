/**
 * Der Reiter „Raum" im Dialog „Teilen" (docs/austausch.md, Stufe 2).
 *
 * Aus: den eigenen Namen setzen, einen Raum eroeffnen oder einem aus der
 * Liste beitreten (oder ueber die Adresse, wenn das Netz die Liste nicht
 * durchlaesst). Drin: wer da ist, der Chat, Nachrichten an alle oder an
 * eine Person.
 *
 * Ueber das Internet: der Gastgeber schaltet „Auch ueber das Internet" ein,
 * bekommt einen festen Port und braucht ein Passwort (der Verkehr ist dann
 * verschluesselt). Gaeste treten ueber IPv4 mit Portfreigabe, IPv6 oder
 * einen Namen bei.
 *
 * Der Dienst lebt im Hauptprozess; dieser Reiter zeigt nur seinen Stand.
 * Ein geschlossener Dialog verliert also nichts.
 */
import { useEffect, useRef, useState } from 'react';
import type { MessageKey, MessageParams } from '../shared/i18n';
import type { GefundenerRaum, Raumzustand } from '../main/raum';
import { alsAdresse, leseAdresse, RAUM_INTERNETPORT } from '@suite/austausch';

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
  const [neuerName, setNeuerName] = useState('');
  const [text, setText] = useState('');
  const [an, setAn] = useState('');
  const [internet, setInternet] = useState(false);
  const [internetPort, setInternetPort] = useState(String(RAUM_INTERNETPORT));
  const [eigenerFehler, setEigenerFehler] = useState('');
  const [oeffentlich, setOeffentlich] = useState<string | null | 'fragt' | 'fehlt'>(null);
  const [kopiert, setKopiert] = useState('');
  // Chatzeilen mit geteilten Eintraegen, die aufgeklappt sind (nach Index).
  const [aufgeklappt, setAufgeklappt] = useState<Set<number>>(new Set());
  const liste = useRef<HTMLDivElement>(null);
  // Neben „Aktualisieren": erst ein drehender Kreis, dann eine Sekunde ein
  // Haken, dann nichts. Auch wenn sich die Liste von selbst aendert.
  const [anzeige, setAnzeige] = useState<'ruhe' | 'dreht' | 'fertig'>('ruhe');
  const drehTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drehe = (ms: number) => {
    setAnzeige('dreht');
    if (drehTimer.current) clearTimeout(drehTimer.current);
    drehTimer.current = setTimeout(() => {
      setAnzeige('fertig');
      drehTimer.current = setTimeout(() => setAnzeige('ruhe'), 1000);
    }, ms);
  };
  const raumSchluessel = raeume
    .map((r) => `${r.adresse}:${r.port}:${r.raum}`)
    .sort()
    .join('|');
  const vorigeSchluessel = useRef<string | null>(null);
  useEffect(() => {
    if (vorigeSchluessel.current !== null && vorigeSchluessel.current !== raumSchluessel) drehe(700);
    vorigeSchluessel.current = raumSchluessel;
  }, [raumSchluessel]);
  useEffect(() => () => {
    if (drehTimer.current) clearTimeout(drehTimer.current);
  }, []);

  useEffect(() => {
    void window.shell.einstellungen.lesen().then((e) => setName(e.tischName));
    void window.shell.raum.suchen();
  }, []);

  useEffect(() => {
    liste.current?.scrollTo({ top: liste.current.scrollHeight });
  }, [zustand.chat.length]);

  const kopiere = (text: string) => {
    void window.shell.raum.kopieren(text).then(() => {
      setKopiert(text);
      setTimeout(() => setKopiert((alt) => (alt === text ? '' : alt)), 1200);
    });
  };
  const ziel = leseAdresse(adresse);
  const portZahl = Number(internetPort);
  const portGut = Number.isInteger(portZahl) && portZahl >= 1024 && portZahl <= 65535;
  const eroeffnen = () => {
    setEigenerFehler('');
    void window.shell.raum
      .eroeffnen(raumName, passwort, internet ? { internet: true, port: portZahl } : {})
      .then((antwort) => {
        if (!antwort.ok) {
          const grund = antwort.grund === 'passwort-noetig' || antwort.grund === 'port-belegt' ? antwort.grund : 'eroeffnen';
          setEigenerFehler(t(`room.error.${grund}` as MessageKey, { port: internetPort }));
        }
      });
  };

  const speichereName = (neu: string) => {
    setName(neu);
    void window.shell.einstellungen.schreiben({ tischName: neu });
  };

  if (zustand.rolle === 'aus') {
    return (
      <div className="austausch raum motion-erscheinen" data-raum="aus">
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
        <p className="einst__satz raum__warnung">{t('room.encryptionHint')}</p>

        <div className="raum__suchkopf">
          <h3 className="raum__kopf">{t('room.found')}</h3>
          <span className="raum__zeichen" aria-hidden="true" data-raum-anzeige={anzeige}>
            {anzeige === 'dreht' ? <span className="raum__kreis" /> : anzeige === 'fertig' ? <span className="raum__haken">✓</span> : null}
          </span>
          <button
            type="button"
            className="dialog__knopf"
            data-raum-aktualisieren
            onClick={() => {
              drehe(1000);
              void window.shell.raum.aktualisieren();
            }}
          >
            {t('room.refresh')}
          </button>
        </div>
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
            title={t('room.addressHint', { port: String(RAUM_INTERNETPORT) })}
            onChange={(e) => setAdresse(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ziel) void window.shell.raum.beitreten(ziel.host, ziel.port, beitrittPasswort);
            }}
          />
          <button
            type="button"
            className="dialog__knopf"
            data-adresse-beitreten
            disabled={!ziel}
            onClick={() => ziel && void window.shell.raum.beitreten(ziel.host, ziel.port, beitrittPasswort)}
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
            placeholder={internet ? t('room.passwordRequired') : t('room.passwordOptional')}
            onChange={(e) => setPasswort(e.target.value)}
          />
          <button
            type="button"
            className="dialog__knopf"
            data-raum-eroeffnen
            disabled={internet && (!passwort || !portGut)}
            onClick={eroeffnen}
          >
            {t('room.openButton')}
          </button>
        </div>
        <div className="raum__reihe">
          <label className="raum__schalter">
            <input type="checkbox" data-raum-internet checked={internet} onChange={(e) => setInternet(e.target.checked)} />
            {t('room.internet')}
          </label>
          {internet && (
            <label className="raum__schalter">
              {t('room.port')}
              <input
                className="suche__feld raum__port"
                data-raum-port
                inputMode="numeric"
                value={internetPort}
                onChange={(e) => setInternetPort(e.target.value.replace(/\D/g, '').slice(0, 5))}
              />
            </label>
          )}
        </div>
        {internet && <p className="einst__satz raum__warnung">{t('room.internetHint')}</p>}
        {eigenerFehler && (
          <p className="einst__satz austausch__fehler" data-raum-eroeffnen-fehler>
            {eigenerFehler}
          </p>
        )}
      </div>
    );
  }

  const andere = zustand.personen.filter((p) => p.id !== zustand.ich?.id);
  const umbenennen = () => {
    if (!neuerName.trim() || neuerName.trim() === zustand.ich?.name) return;
    void window.shell.raum.umbenennen(neuerName).then((ok) => ok && setNeuerName(''));
  };
  const senden = () => {
    if (!text.trim()) return;
    void window.shell.raum.chat(text, an || null).then((ok) => ok && setText(''));
  };

  return (
    <div className="austausch raum motion-erscheinen" data-raum="drin">
      <div className="raum__reihe raum__kopfzeile">
        <strong data-raumtitel>{zustand.raum}</strong>
        <span className="austausch__art">
          {zustand.rolle === 'gastgeber' ? t('room.youHost') : t('room.youAre', { name: zustand.ich?.name ?? '' })}
        </span>
        {zustand.rolle === 'gast' && (
          <span className="raum__marke" data-raum-ping title={t('room.pingHint')}>
            {zustand.ping === null ? t('room.pingWaiting') : t('room.ping', { ms: zustand.ping })}
          </span>
        )}
        <span className={`raum__marke${zustand.verschluesselt ? ' is-sicher' : ''}`} data-raum-verschluesselt={zustand.verschluesselt}>
          {zustand.verschluesselt ? t('room.encrypted') : t('room.notEncrypted')}
        </span>
        <button type="button" className="dialog__knopf" data-raum-verlassen onClick={() => void window.shell.raum.verlassen()}>
          {zustand.rolle === 'gastgeber' ? t('room.close') : t('room.leave')}
        </button>
      </div>
      {zustand.rolle === 'gastgeber' && zustand.port !== null && (
        <Adressen
          zustand={zustand}
          port={zustand.port}
          oeffentlich={oeffentlich}
          frageOeffentlich={() => {
            setOeffentlich('fragt');
            void window.shell.raum.oeffentlicheIp().then((ip) => setOeffentlich(ip ?? 'fehlt'));
          }}
          kopiert={kopiert}
          kopiere={kopiere}
          t={t}
        />
      )}
      {/* Der eigene Name laesst sich auch im offenen Raum aendern (Rueckmeldung). */}
      <div className="raum__reihe">
        <label className="austausch__art" htmlFor="raum-name">
          {t('room.yourName')}
        </label>
        <input
          id="raum-name"
          className="suche__feld raum__eingabe"
          data-raum-umbenennen
          value={neuerName}
          maxLength={64}
          placeholder={zustand.ich?.name ?? ''}
          onChange={(e) => setNeuerName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') umbenennen();
          }}
        />
        <button
          type="button"
          className="dialog__knopf"
          data-raum-umbenennen-knopf
          disabled={!neuerName.trim()}
          onClick={umbenennen}
        >
          {t('room.rename')}
        </button>
      </div>
      <p className="austausch__art" data-personen>
        {t('room.people')}:{' '}
        {zustand.personen.map((p, i) => (
          <span key={p.id} data-person={p.name}>
            {i > 0 ? ', ' : ''}
            {p.name}
            {/* Beim Gastgeber: der Ping zu jedem Gast. */}
            {zustand.pings[p.id] !== undefined && <span className="raum__personping"> ({zustand.pings[p.id]} ms)</span>}
          </span>
        ))}
      </p>
      <div className="raum__chat" ref={liste} data-chat>
        {zustand.chat.length === 0 ? (
          <p className="einst__satz">{t('room.emptyChat')}</p>
        ) : (
          zustand.chat.map((z, i) => (
            <p key={i} className={`raum__zeile motion-eintritt${z.an ? ' is-privat' : ''}${z.eigene ? ' is-eigen' : ''}`}>
              <span className="raum__wer">
                {z.von.name}
                {z.an ? ` → ${z.an.name}` : ''}
              </span>{' '}
              {z.an ? <em className="raum__privat">{t('room.private')} </em> : null}
              {z.dateien ? (
                <Dateizeile
                  dateien={z.dateien}
                  offen={aufgeklappt.has(i)}
                  schalte={() =>
                    setAufgeklappt((alt) => {
                      const neu = new Set(alt);
                      if (neu.has(i)) neu.delete(i);
                      else neu.add(i);
                      return neu;
                    })
                  }
                  t={t}
                />
              ) : (
                z.text
              )}
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

/**
 * Wo die anderen den Gastgeber erreichen: im lokalen Netz, ueber IPv6 und
 * ueber die oeffentliche IPv4 (Portfreigabe noetig). Die oeffentliche IPv4
 * wird bei einem Internetraum gleich beim Eroeffnen erfragt, wie Foundry
 * es auf seiner Einladungsseite tut; die App sagt dazu, wen sie fragt.
 * „Einladung kopieren" legt alle Adressen als einen Text ab, fertig zum
 * Einfuegen in einen Chat. Das Passwort steht bewusst nicht darin.
 */
function Adressen({
  zustand,
  port,
  oeffentlich,
  frageOeffentlich,
  kopiert,
  kopiere,
  t
}: {
  readonly zustand: Raumzustand;
  readonly port: number;
  readonly oeffentlich: string | null | 'fragt' | 'fehlt';
  readonly frageOeffentlich: () => void;
  readonly kopiert: string;
  readonly kopiere: (text: string) => void;
  readonly t: Props['t'];
}) {
  const zeile = (art: string, adresse: string, daten: string) => (
    <li key={adresse} className="raum__adresse" data-raum-adresse={daten}>
      <span className="raum__adressart">{art}</span>
      <code className="raum__adresstext">{adresse}</code>
      <button type="button" className="dialog__knopf" onClick={() => kopiere(adresse)}>
        {kopiert === adresse ? '✓' : t('room.copy')}
      </button>
    </li>
  );
  const lan = zustand.adressen.length > 0 ? zustand.adressen : ['127.0.0.1'];
  const gefragt = useRef(false);
  useEffect(() => {
    if (zustand.internet && oeffentlich === null && !gefragt.current) {
      gefragt.current = true;
      frageOeffentlich();
    }
  }, [zustand.internet, oeffentlich, frageOeffentlich]);
  const v4 = typeof oeffentlich === 'string' && oeffentlich !== 'fragt' && oeffentlich !== 'fehlt' ? oeffentlich : null;
  const einladung = [
    t('room.inviteTitle', { raum: zustand.raum }),
    ...(zustand.internet && v4 ? [`${t('room.addrPublic')}: ${alsAdresse(v4, port)}`] : []),
    ...(zustand.internet ? zustand.ipv6.map((a) => `IPv6: ${alsAdresse(a, port)}`) : []),
    ...lan.map((a) => `${t('room.addrLan')}: ${alsAdresse(a, port)}`),
    zustand.verschluesselt ? t('room.invitePassword', { name: zustand.ich?.name ?? '' }) : ''
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <div className="raum__adressen" data-raum-adressen>
      <ul className="austausch__liste">
        {lan.map((a) => zeile(t('room.addrLan'), alsAdresse(a, port), 'lan'))}
        {zustand.internet && zustand.ipv6.map((a) => zeile('IPv6', alsAdresse(a, port), 'ipv6'))}
        {zustand.internet && v4 && zeile(t('room.addrPublic'), alsAdresse(v4, port), 'ipv4')}
      </ul>
      <div className="raum__reihe">
        <button type="button" className="dialog__knopf" data-raum-einladung onClick={() => kopiere(einladung)}>
          {kopiert === einladung ? `✓ ${t('room.inviteCopied')}` : t('room.invite')}
        </button>
        {zustand.internet && oeffentlich === 'fragt' && <span className="einst__satz raum__warnung">{t('room.publicAsking')}</span>}
      </div>
      {zustand.internet && (
        <>
          {oeffentlich === 'fehlt' ? (
            <div className="raum__reihe">
              <button type="button" className="dialog__knopf" data-raum-oeffentlich onClick={frageOeffentlich}>
                {t('room.retryPublic')}
              </button>
              <span className="einst__satz raum__warnung">{t('room.publicFailed')}</span>
            </div>
          ) : (
            <p className="einst__satz raum__warnung">{t('room.publicHint')}</p>
          )}
          <p className="einst__satz raum__warnung" data-raum-portfreigabe>
            {t('room.forwardHint', { port: String(port), lan: lan[0] })}
          </p>
          {zustand.ipv6.length === 0 && <p className="einst__satz raum__warnung">{t('room.noIpv6')}</p>}
        </>
      )}
    </div>
  );
}

/** Wie viele Namen eine Chatzeile mit geteilten Eintraegen zeigt, bevor sie zaehlt. */
const SICHTBARE_DATEIEN = 5;

/**
 * Eine Chatzeile fuer geteilte Eintraege: die ersten fuenf Namen, dann eine
 * Zahl. Ein Klick klappt die ganze Liste auf.
 */
function Dateizeile({
  dateien,
  offen,
  schalte,
  t
}: {
  readonly dateien: readonly string[];
  readonly offen: boolean;
  readonly schalte: () => void;
  readonly t: Props['t'];
}) {
  const mehr = dateien.length - SICHTBARE_DATEIEN;
  return (
    <>
      <button type="button" className="raum__dateien" data-chat-dateien={dateien.length} aria-expanded={offen} title={t('room.showFiles')} onClick={schalte}>
        📎 {dateien.length === 1 ? t('room.sharedOne') : t('room.sharedFiles', { anzahl: dateien.length })}{' '}
        <span className="raum__dateiliste">
          {dateien.slice(0, SICHTBARE_DATEIEN).join(', ')}
          {mehr > 0 ? ` ${t('room.moreFiles', { anzahl: mehr })}` : ''}
        </span>
      </button>
      {offen && (
        <ul className="raum__alledateien" data-chat-alle-dateien>
          {dateien.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
    </>
  );
}
