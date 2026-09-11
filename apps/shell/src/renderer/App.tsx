/**
 * Oberflaeche der Huelle: Titelleiste, Startmenue und Schiene.
 *
 * Die Huelle kennt zwei Bilder. Ohne gewaehltes Werkzeug fuellt das Startmenue
 * mit den grossen Kacheln das Fenster. Mit gewaehltem Werkzeug schrumpft das
 * Menue zur schmalen Schiene links, dieselben Symbole in klein, und rechts
 * daneben bleibt die Flaeche fuer die Anwendung frei.
 *
 * Auf dieser Flaeche liegt die Ansicht der Anwendung. Sichtbar wird hier nur
 * etwas, wenn keine daraufliegt: weil das Werkzeug noch nicht einbettbar ist,
 * oder weil es sich nicht oeffnen liess.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { APPS, CHROME, STATUS_KEY, descriptionKey, findApp, istWaehlbar, nameKey } from '../shared/apps';
import {
  DEFAULT_LANGUAGE,
  translate,
  type Language,
  type MessageKey,
  type MessageParams
} from '../shared/i18n';
import { iconFuer, SuiteIcon } from './icons';
import { KI_VOREINSTELLUNGEN, type KiEinstellungen } from '@suite/ki/einstellungen';
import { Einstellungen, type KiZustandAnsicht } from './Einstellungen';
import { Ueber } from './Ueber';

declare global {
  interface Window {
    readonly shell: import('../preload/index').ShellApi;
  }
}

type Uebersetzer = (key: MessageKey, params?: MessageParams) => string;

/**
 * Was auf der Buehne los ist: das Ergebnis des Hauptprozesses, um den
 * Zwischenzustand `laedt` erweitert. Den kennt nur die Oberflaeche — der
 * Hauptprozess antwortet erst, wenn er fertig ist.
 */
type BuehnenZustand =
  | { zustand: 'laedt' }
  | import('../main/index').ZeigenErgebnis;

export function App() {
  const [aktiv, setAktiv] = useState<string | null>(null);
  /**
   * Was auf der Buehne los ist.
   *
   * Frueher stand hier ein `boolean`. Der beantwortete zwei verschiedene
   * Fragen mit demselben Wort: „dieses Werkzeug gibt es noch nicht" und
   * „es liess sich nicht oeffnen" fuehrten beide zum selben Platzhalter,
   * und der behauptete, das Einbetten sei noch nicht gebaut. Wer mit einem
   * ungebauten Werkzeug darauf stiess, suchte den Fehler an der falschen
   * Stelle.
   *
   * `laedt` ist der Zustand zwischen Klick und Antwort. Ohne ihn zeigte die
   * Flaeche in dieser Zeit die Meldung des *vorigen* Versuchs.
   */
  const [buehne, setBuehne] = useState<BuehnenZustand>({ zustand: 'laedt' });
  const [maximiert, setMaximiert] = useState(false);
  const [version, setVersion] = useState('');
  const [sprache, setSprache] = useState<Language>(DEFAULT_LANGUAGE);
  /**
   * Die KI-Anbindung der Sammlung. Der API-Schluessel steht nicht darin — er
   * bleibt im Hauptprozess, hier ist nur zu sehen, ob einer da ist.
   */
  const [ki, setKi] = useState<KiEinstellungen>(KI_VOREINSTELLUNGEN);
  const [kiZustand, setKiZustand] = useState<KiZustandAnsicht | null>(null);
  /** Welcher Dialog offen ist, oder `null`. Es ist immer hoechstens einer. */
  const [dialog, setDialog] = useState<'einstellungen' | 'ueber' | null>(null);

  /**
   * Oeffnet oder schliesst einen Dialog und sagt es dem Hauptprozess.
   *
   * Der muss es wissen: die Dialoge liegen in der Ansicht der Huelle, und die
   * liegt unter den Anwendungen. Ohne diese Meldung waere ein geoeffneter
   * Dialog hinter der laufenden Anwendung nicht zu sehen.
   */
  const zeigeDialog = useCallback((welcher: 'einstellungen' | 'ueber' | null) => {
    setDialog(welcher);
    void window.shell.app.dialog(welcher !== null);
  }, []);

  useEffect(() => {
    void window.shell.app.version().then(setVersion);
    void window.shell.fenster.istMaximiert().then(setMaximiert);
    // Die gespeicherte Sprache kommt erst nach dem ersten Zeichnen an. Bis
    // dahin steht die Voreinstellung da — ein kurzer Wechsel ist besser als
    // ein leeres Fenster, das auf eine Datei wartet.
    void window.shell.einstellungen.lesen().then((e) => {
      setSprache(e.language);
      setKi(e.ki);
    });
    // Auch der Fensterrahmen des Systems kann maximieren. Ohne diese Meldung
    // zeigte der Knopf danach das falsche Symbol.
    const abmeldenZustand = window.shell.fenster.beiZustandswechsel(({ maximiert: m }) =>
      setMaximiert(m)
    );
    // Hat der Hauptprozess beim Start schon ein Werkzeug geoeffnet, liegt es
    // bereits vorn — die Oberflaeche muss nur nachziehen und darf es nicht
    // ein zweites Mal anfordern.
    const abmeldenStart = window.shell.app.beiStartMitWerkzeug((id) => {
      setAktiv(id);
      setBuehne({ zustand: 'offen' });
    });
    // Eine der eingebetteten Anwendungen (oder eine andere Sitzung dieses
    // Fensters) kann die Sprache aendern, ohne dass hier der
    // Einstellungen-Dialog benutzt wurde. Ohne diesen Kanal wuesste die
    // Titelleiste nichts davon.
    const abmeldenSprache = window.shell.einstellungen.beiSprachwechselVonAussen(setSprache);
    return () => {
      abmeldenZustand();
      abmeldenStart();
      abmeldenSprache();
    };
  }, []);

  const t = useMemo<Uebersetzer>(
    () => (key, params) => translate(sprache, key, params),
    [sprache]
  );

  /**
   * Sagt dem Hauptprozess, ob weniger Bewegung gewuenscht ist.
   *
   * Er treibt die Einfahrt der eingebetteten Ansichten selbst — die sind
   * keine HTML-Elemente, CSS erreicht sie nicht. `prefers-reduced-motion`
   * laesst sich aber nur hier beantworten, also wird es hier abgefragt und
   * gemeldet, beim Start und wenn die Person die Einstellung im laufenden
   * Betrieb umstellt.
   */
  useEffect(() => {
    const abfrage = window.matchMedia('(prefers-reduced-motion: reduce)');
    const melde = () => window.shell.bewegung.reduziert(abfrage.matches);
    melde();
    abfrage.addEventListener('change', melde);
    return () => abfrage.removeEventListener('change', melde);
  }, []);

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
      setBuehne({ zustand: 'laedt' });
      void window.shell.app.startmenue();
      return;
    }
    setBuehne({ zustand: 'laedt' });
    window.shell.app
      .zeigen(id)
      .then(setBuehne)
      // Der Hauptprozess faengt Montagefehler selbst ab und meldet sie als
      // Zustand. Bleibt trotzdem eine Ablehnung uebrig, ist etwas an der
      // Bruecke kaputt — auch das gehoert auf den Schirm und nicht ins Nichts.
      .catch((fehler: unknown) => {
        console.error(`[shell] Werkzeug "${id}" liess sich nicht einbetten:`, fehler);
        setBuehne({
          zustand: 'fehler',
          grund: 'sonst',
          detail: fehler instanceof Error ? fehler.message : String(fehler)
        });
      });
  }, []);

  const setzeSprache = useCallback(async (neu: Language) => {
    const gespeichert = await window.shell.einstellungen.schreiben({ language: neu });
    // Angezeigt wird, was wirklich gespeichert wurde, nicht was angeklickt
    // wurde.
    setSprache(gespeichert.language);
  }, []);

  const setzeKi = useCallback(async (aenderung: Partial<KiEinstellungen>) => {
    const gespeichert = await window.shell.einstellungen.schreiben({ ki: { ...ki, ...aenderung } });
    // Angezeigt wird, was wirklich gespeichert wurde, nicht was angeklickt
    // wurde: `sanitizeSettings` raeumt ungueltige Werte weg.
    setKi(gespeichert.ki);
    // Der alte Befund gilt fuer die alte Einstellung. Ihn stehen zu lassen
    // waere die unangenehmere Sorte Fehler: er sagt "bereit" ueber etwas,
    // das gar nicht mehr eingestellt ist.
    setKiZustand(null);
  }, [ki]);

  const pruefeKi = useCallback(async () => {
    setKiZustand(await window.shell.ki.status());
  }, []);

  const setzeSchluessel = useCallback(async (schluessel: string) => {
    await window.shell.ki.setzeSchluessel(schluessel);
    setKiZustand(await window.shell.ki.status());
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
        <button
          type="button"
          className="titelleiste__knopf"
          onClick={() => zeigeDialog('einstellungen')}
        >
          {t('title.settings')}
        </button>
        <button type="button" className="titelleiste__knopf" onClick={() => zeigeDialog('ueber')}>
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
        <Buehne eintrag={eintrag} aktiv={aktiv!} setAktiv={waehle} buehne={buehne} t={t} />
      ) : (
        <Startmenue setAktiv={waehle} version={version} t={t} />
      )}

      {dialog === 'einstellungen' && (
        <Einstellungen
          sprache={sprache}
          setzeSprache={setzeSprache}
          ki={ki}
          setzeKi={setzeKi}
          kiZustand={kiZustand}
          pruefeKi={pruefeKi}
          setzeSchluessel={setzeSchluessel}
          onClose={() => zeigeDialog(null)}
          t={t}
        />
      )}
      {dialog === 'ueber' && (
        <Ueber version={version} onClose={() => zeigeDialog(null)} t={t} />
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
        {APPS.map((app, nummer) => {
          const Icon = iconFuer(app.id);
          const waehlbar = istWaehlbar(app.status);
          return (
            <button
              key={app.id}
              type="button"
              className={`kachel kachel--${app.status} motion-eintritt`}
              // Gestaffelt, damit das Menue sich aufbaut statt aufzublitzen.
              // Kurz gehalten: die letzte Kachel darf nicht spuerbar spaeter
              // da sein als die erste, sonst wartet man auf sie.
              style={{ animationDelay: `${nummer * 35}ms` }}
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
  buehne,
  t
}: {
  eintrag: { id: string };
  aktiv: string;
  setAktiv: (id: string | null) => void;
  buehne: BuehnenZustand;
  t: Uebersetzer;
}) {
  const schiene = useRef<HTMLElement>(null);
  /** Wo der Marker steht (in Bildpunkten von oben), oder `null` vor der ersten Messung. */
  const [markeOben, setMarkeOben] = useState<number | null>(null);
  /**
   * Ob der Marker seine erste Stelle schon gefunden hat.
   *
   * Beim ersten Zeichnen darf er nicht wandern: er kaeme sonst von der
   * Oberkante der Schiene hereingefahren, obwohl gar nichts gewechselt hat.
   * Die Fahrt schaltet sich erst danach ein.
   */
  const gesetzt = useRef(false);
  const [wandert, setWandert] = useState(false);
  /*
   * Welche Werkzeuge gerade etwas gemeldet haben.
   *
   * Eine Farbe wischt ueber ihr Symbol und sagt: dort ist etwas dazugekommen.
   * Die Anzeige gehoert in die Huelle und nicht in die meldende Anwendung —
   * sie soll ueberall gleich aussehen, gleich wer sie ausloest.
   */
  const [gemeldet, setGemeldet] = useState<readonly string[]>([]);

  /**
   * Nimmt ein Werkzeug wieder aus der Meldung.
   *
   * Muss passieren, sonst liefe die Animation nur ein einziges Mal: eine
   * Klasse, die stehen bleibt, startet nicht neu.
   */
  const wischFertig = useCallback((id: string) => {
    setGemeldet((vorher) => vorher.filter((eintrag) => eintrag !== id));
  }, []);

  useEffect(() => {
    const notbremse = new Map<string, number>();
    const ab = window.shell?.app?.beiEreignis?.((id) => {
      setGemeldet((vorher) => (vorher.includes(id) ? vorher : [...vorher, id]));
      /*
       * Abgeraeumt wird, wenn die Animation zu Ende ist — sie meldet das
       * selbst (siehe onAnimationEnd an der Schiene).
       *
       * Vorher stand hier ein Zeitgeber mit 1400 ms, waehrend die CSS zwei
       * Durchgaenge zu 1100 ms lief: der zweite Wisch fing an und brach
       * mitten drin ab. Zwei Zahlen, die zusammenpassen mussten und es nicht
       * taten.
       *
       * Der Zeitgeber bleibt als Notbremse, deutlich laenger als die
       * Animation. Er greift nur, wenn gar kein `animationend` kommt — etwa
       * weil das Symbol waehrenddessen aus der Schiene verschwindet. Ohne ihn
       * bliebe die Farbe dann fuer immer stehen.
       */
      window.clearTimeout(notbremse.get(id));
      notbremse.set(id, window.setTimeout(() => wischFertig(id), 4000));
    });
    return () => {
      ab?.();
      for (const nummer of notbremse.values()) window.clearTimeout(nummer);
    };
  }, [wischFertig]);

  // Gemessen statt gerechnet: die Stelle haengt an Knopfhoehen, Abstaenden und
  // dem Trenner. Eine Formel dafuer waere bei der naechsten Aenderung an der
  // Schiene still falsch.
  useLayoutEffect(() => {
    const an = schiene.current?.querySelector<HTMLElement>('.schiene__eintrag--an');
    if (!an) {
      setMarkeOben(null);
      return;
    }
    setMarkeOben(an.offsetTop);
    if (gesetzt.current) setWandert(true);
    gesetzt.current = true;
  }, [aktiv]);

  return (
    <div className="buehne">
      <nav
        className="schiene"
        style={{ width: CHROME.schieneBreite }}
        aria-label="TTRPG-Tools"
        ref={schiene}
      >
        {markeOben !== null && (
          <span
            className={`schiene__marke ${wandert ? 'schiene__marke--wandert' : ''}`}
            style={{ transform: `translateY(${markeOben}px)` }}
            aria-hidden="true"
          />
        )}
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
              } ${gemeldet.includes(app.id) ? 'schiene__eintrag--gemeldet' : ''}`}
              disabled={!waehlbar}
              aria-current={app.id === aktiv ? 'page' : undefined}
              title={waehlbar ? name : `${name} — ${t(STATUS_KEY[app.status])}`}
              onClick={() => setAktiv(app.id)}
              // Die Animation liegt auf ::after; ihr Ende steigt bis hierher
              // auf. So bleibt die Dauer allein in der CSS.
              onAnimationEnd={() => wischFertig(app.id)}
            >
              <Icon size={26} />
            </button>
          );
        })}
      </nav>

      {/*
        Liegt eine Anwendung vor der Huelle, ist hier nichts zu zeigen: ihre
        Ansicht deckt die Flaeche vollstaendig ab. Ein Text an dieser Stelle
        waere unsichtbar, aber Vorlesewerkzeuge laesen ihn vor.
      */}
      {buehne.zustand === 'offen' || buehne.zustand === 'laedt' ? (
        <div className="buehne__flaeche" aria-hidden="true" />
      ) : buehne.zustand === 'fehler' ? (
        <main className="stoerung" role="alert">
          <p className="stoerung__titel">
            {t('stage.failed.title', { name: t(nameKey(eintrag.id)) })}
          </p>
          <p className="stoerung__text">
            {t(buehne.grund === 'dateien-fehlen' ? 'stage.failed.missing' : 'stage.failed.other')}
          </p>
          {/* Die Rohmeldung bleibt sichtbar: sie ist das Einzige, womit sich
              ein Fall weiterverfolgen laesst, den die beiden Saetze oben nicht
              treffen. */}
          <p className="stoerung__detail">{t('stage.failed.detail', { detail: buehne.detail })}</p>
          <button type="button" className="stoerung__knopf" onClick={() => setAktiv(eintrag.id)}>
            {t('stage.failed.retry')}
          </button>
        </main>
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
