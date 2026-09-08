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
import { useCallback, useEffect, useState } from 'react';
import { APPS, CHROME, STATUS_MARKE, findApp, istWaehlbar } from '../shared/apps';
import { iconFuer, SuiteIcon } from './icons';

declare global {
  interface Window {
    readonly shell: import('../preload/index').ShellApi;
  }
}

export function App() {
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [maximiert, setMaximiert] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    void window.shell.app.version().then(setVersion);
    void window.shell.fenster.istMaximiert().then(setMaximiert);
    // Auch der Fensterrahmen des Systems kann maximieren. Ohne diese Meldung
    // zeigte der Knopf danach das falsche Symbol.
    return window.shell.fenster.beiZustandswechsel(({ maximiert: m }) => setMaximiert(m));
  }, []);

  const umschalten = useCallback(() => {
    void window.shell.fenster.maximierenUmschalten().then(setMaximiert);
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
        {eintrag && <span className="titelleiste__pfad">› {eintrag.name}</span>}
        <span className="titelleiste__fueller" />
        <button type="button" className="titelleiste__knopf" disabled>
          Einstellungen
        </button>
        <button type="button" className="titelleiste__knopf" disabled>
          Über
        </button>
        <div className="fensterknoepfe">
          <button
            type="button"
            className="fensterknopf"
            aria-label="Minimieren"
            onClick={() => void window.shell.fenster.minimieren()}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            type="button"
            className="fensterknopf"
            aria-label={maximiert ? 'Wiederherstellen' : 'Maximieren'}
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
            aria-label="Schließen"
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
        <Buehne eintrag={eintrag} aktiv={aktiv!} setAktiv={setAktiv} />
      ) : (
        <Startmenue setAktiv={setAktiv} version={version} />
      )}
    </div>
  );
}

function Startmenue({
  setAktiv,
  version
}: {
  setAktiv: (id: string) => void;
  version: string;
}) {
  return (
    <main className="menue">
      <h1 className="menue__frage">Womit möchtest du arbeiten?</h1>
      <p className="menue__hinweis">
        Alles liegt im selben Speicherort. Wechseln geht jederzeit, nichts geht dabei verloren.
      </p>

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
              <span className="kachel__name">{app.name}</span>
              <span className="kachel__text">{app.beschreibung}</span>
              <span className="kachel__marke">{STATUS_MARKE[app.status]}</span>
            </button>
          );
        })}
      </div>

      {version && <p className="menue__version">Fassung {version}</p>}
    </main>
  );
}

function Buehne({
  eintrag,
  aktiv,
  setAktiv
}: {
  eintrag: { name: string; beschreibung: string };
  aktiv: string;
  setAktiv: (id: string | null) => void;
}) {
  return (
    <div className="buehne">
      <nav className="schiene" style={{ width: CHROME.schieneBreite }} aria-label="Werkzeuge">
        <button
          type="button"
          className="schiene__heim"
          aria-label="Zurück zum Startmenü"
          title="Startmenü"
          onClick={() => setAktiv(null)}
        >
          <SuiteIcon size={22} />
        </button>
        <span className="schiene__trenner" />
        {APPS.map((app) => {
          const Icon = iconFuer(app.id);
          const waehlbar = istWaehlbar(app.status);
          return (
            <button
              key={app.id}
              type="button"
              className={`schiene__eintrag ${app.id === aktiv ? 'schiene__eintrag--an' : ''} ${
                waehlbar ? '' : 'schiene__eintrag--geplant'
              }`}
              disabled={!waehlbar}
              aria-current={app.id === aktiv ? 'page' : undefined}
              title={waehlbar ? app.name : `${app.name} — ${STATUS_MARKE[app.status]}`}
              onClick={() => setAktiv(app.id)}
            >
              <Icon size={26} />
            </button>
          );
        })}
      </nav>

      {/*
        Ab dem naechsten Bauabschnitt liegt hier die Ansicht der eingebetteten
        Anwendung darueber. Bis dahin steht hier, was dort hinkommt — besser
        als eine leere Flaeche, die wie ein Fehler aussieht.
      */}
      <main className="platzhalter">
        <p className="platzhalter__name">{eintrag.name}</p>
        <p className="platzhalter__text">{eintrag.beschreibung}</p>
        <p className="platzhalter__hinweis">
          Hier wird die Anwendung eingebettet. Die Hülle steht, das Einbetten kommt als Nächstes.
        </p>
      </main>
    </div>
  );
}
