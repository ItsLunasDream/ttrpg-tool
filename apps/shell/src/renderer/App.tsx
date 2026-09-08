/**
 * Oberflaeche der Huelle: Titelleiste, Startmenue und Schiene.
 *
 * Die Huelle kennt zwei Bilder. Ohne gewaehltes Werkzeug fuellt das Startmenue
 * mit den grossen Kacheln das Fenster. Mit gewaehltem Werkzeug schrumpft das
 * Menue zur schmalen Schiene links, dieselben Symbole in klein, und rechts
 * daneben bleibt die Flaeche fuer die Anwendung frei.
 *
 * In diesem Bauabschnitt wird dort noch nichts eingebettet — die Flaeche zeigt
 * stattdessen, was als naechstes hineinkommt. Der Wechsel selbst,
 * Fensterknoepfe und Fensterlage sind aber schon echt.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { APPS, CHROME, STATUS_KEY, descriptionKey, findApp, istWaehlbar, nameKey } from '../shared/apps';
import {
  DEFAULT_LANGUAGE,
  translate,
  type Language,
  type MessageKey,
  type MessageParams
} from '../shared/i18n';
import { iconFuer, SuiteIcon } from './icons';

declare global {
  interface Window {
    readonly shell: import('../preload/index').ShellApi;
  }
}

type Uebersetzer = (key: MessageKey, params?: MessageParams) => string;

export function App() {
  const [aktiv, setAktiv] = useState<string | null>(null);
  /**
   * Ob hinter der Buehne wirklich eine Anwendung liegt.
   *
   * Die Huelle kann noch nicht jede einbetten. Ohne diese Auskunft schriebe
   * die Oberflaeche ihren Platzhaltertext unter eine laufende Anwendung — zu
   * sehen waere er nicht, aber Vorlesewerkzeuge laesen ihn vor.
   */
  const [eingebettet, setEingebettet] = useState(false);
  const [maximiert, setMaximiert] = useState(false);
  const [version, setVersion] = useState('');
  // Fest auf der Voreinstellung, bis es Einstellungen gibt: die Huelle hat
  // noch keinen Ort, an dem man umschalten koennte. Die deutschen Texte stehen
  // trotzdem schon im Woerterbuch und werden von einem Test vollstaendig
  // gehalten — sonst waeren sie an dem Tag, an dem der Schalter kommt, zur
  // Haelfte veraltet.
  const sprache: Language = DEFAULT_LANGUAGE;

  useEffect(() => {
    void window.shell.app.version().then(setVersion);
    void window.shell.fenster.istMaximiert().then(setMaximiert);
    // Auch der Fensterrahmen des Systems kann maximieren. Ohne diese Meldung
    // zeigte der Knopf danach das falsche Symbol.
    return window.shell.fenster.beiZustandswechsel(({ maximiert: m }) => setMaximiert(m));
  }, []);

  const t = useMemo<Uebersetzer>(
    () => (key, params) => translate(sprache, key, params),
    [sprache]
  );

  // Die Seite traegt die gewaehlte Sprache, damit Vorlesewerkzeuge und die
  // Silbentrennung des Browsers wissen, woran sie sind.
  useEffect(() => {
    document.documentElement.lang = sprache;
  }, [sprache]);

  const umschalten = useCallback(() => {
    void window.shell.fenster.maximierenUmschalten().then(setMaximiert);
  }, []);

  /**
   * Wechselt das Werkzeug. Der Hauptprozess montiert beim ersten Mal und legt
   * die Ansicht ueber die Huelle; hier wird nur noch gemerkt, was sichtbar
   * ist.
   */
  const waehle = useCallback((id: string | null) => {
    setAktiv(id);
    if (id === null) {
      setEingebettet(false);
      void window.shell.app.startmenue();
      return;
    }
    setEingebettet(false);
    void window.shell.app.zeigen(id).then(setEingebettet);
  }, []);

  const eintrag = aktiv ? findApp(aktiv) : undefined;

  return (
    <div className="huelle">
      <header
        className="titelleiste"
        style={{ height: CHROME.titelleisteHoehe }}
        onDoubleClick={umschalten}
      >
        <span className="titelleiste__marke" aria-hidden="true">
          <SuiteIcon size={18} />
        </span>
        <span className="titelleiste__name">TTRPG-Tools</span>
        {eintrag && <span className="titelleiste__pfad">› {t(nameKey(eintrag.id))}</span>}
        <span className="titelleiste__fueller" />
        <button type="button" className="titelleiste__knopf" disabled>
          {t('title.settings')}
        </button>
        <button type="button" className="titelleiste__knopf" disabled>
          {t('title.about')}
        </button>
        <div className="fensterknoepfe">
          <button
            type="button"
            className="fensterknopf"
            aria-label={t('window.minimize')}
            onClick={() => void window.shell.fenster.minimieren()}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            type="button"
            className="fensterknopf"
            aria-label={maximiert ? t('window.restore') : t('window.maximize')}
            onClick={umschalten}
          >
            {maximiert ? (
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <rect x="1" y="3" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 3 V1 H9 V7 H7" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="fensterknopf fensterknopf--schliessen"
            aria-label={t('window.close')}
            onClick={() => void window.shell.fenster.schliessen()}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" />
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      </header>

      {eintrag ? (
        <Buehne
          eintrag={eintrag}
          aktiv={aktiv!}
          setAktiv={waehle}
          eingebettet={eingebettet}
          t={t}
        />
      ) : (
        <Startmenue setAktiv={waehle} version={version} t={t} />
      )}
    </div>
  );
}

function Startmenue({
  setAktiv,
  version,
  t
}: {
  setAktiv: (id: string) => void;
  version: string;
  t: Uebersetzer;
}) {
  return (
    <main className="menue">
      <h1 className="menue__frage">{t('menu.question')}</h1>
      <p className="menue__hinweis">{t('menu.hint')}</p>

      <div className="kacheln">
        {APPS.map((app) => {
          const Icon = iconFuer(app.id);
          const waehlbar = istWaehlbar(app.status);
          return (
            <button
              key={app.id}
              type="button"
              className={`kachel kachel--${app.status}`}
              disabled={!waehlbar}
              onClick={() => setAktiv(app.id)}
            >
              <span className="kachel__icon">
                <Icon size={64} />
              </span>
              <span className="kachel__name">{t(nameKey(app.id))}</span>
              <span className="kachel__text">{t(descriptionKey(app.id))}</span>
              <span className="kachel__marke">{t(STATUS_KEY[app.status])}</span>
            </button>
          );
        })}
      </div>

      {version && <p className="menue__version">{t('menu.version', { version })}</p>}
    </main>
  );
}

function Buehne({
  eintrag,
  aktiv,
  setAktiv,
  eingebettet,
  t
}: {
  eintrag: { id: string };
  aktiv: string;
  setAktiv: (id: string | null) => void;
  eingebettet: boolean;
  t: Uebersetzer;
}) {
  return (
    <div className="buehne">
      <nav className="schiene" style={{ width: CHROME.schieneBreite }} aria-label="TTRPG-Tools">
        <button
          type="button"
          className="schiene__heim"
          aria-label={t('rail.home')}
          title={t('rail.homeShort')}
          onClick={() => setAktiv(null)}
        >
          <SuiteIcon size={22} />
        </button>
        <span className="schiene__trenner" />
        {APPS.map((app) => {
          const Icon = iconFuer(app.id);
          const waehlbar = istWaehlbar(app.status);
          const name = t(nameKey(app.id));
          return (
            <button
              key={app.id}
              type="button"
              className={`schiene__eintrag ${app.id === aktiv ? 'schiene__eintrag--an' : ''} ${
                waehlbar ? '' : 'schiene__eintrag--geplant'
              }`}
              disabled={!waehlbar}
              aria-current={app.id === aktiv ? 'page' : undefined}
              title={waehlbar ? name : `${name} — ${t(STATUS_KEY[app.status])}`}
              onClick={() => setAktiv(app.id)}
            >
              <Icon size={26} />
            </button>
          );
        })}
      </nav>

      {/*
        Liegt eine Anwendung vor der Huelle, ist hier nichts zu zeigen: ihre
        Ansicht deckt die Flaeche vollstaendig ab. Der Platzhalter steht nur
        fuer die Werkzeuge, die noch nicht eingebettet werden koennen.
      */}
      {eingebettet ? (
        <div className="buehne__flaeche" aria-hidden="true" />
      ) : (
        <main className="platzhalter">
          <p className="platzhalter__name">{t(nameKey(eintrag.id))}</p>
          <p className="platzhalter__text">{t(descriptionKey(eintrag.id))}</p>
          <p className="platzhalter__hinweis">{t('stage.placeholder')}</p>
        </main>
      )}
    </div>
  );
}
