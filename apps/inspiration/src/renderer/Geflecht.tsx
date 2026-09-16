/**
 * Das Geflecht als Bild — klein in der Karte, gross auf Klick.
 *
 * Klein steht es zwischen den anderen Bausteinen und beantwortet die Frage,
 * die die Liste darunter nicht beantwortet: wo ist die Geschichte dicht, wer
 * steht am Rand. Fuer alles Weitere ist es zu klein — Namen und Muster
 * draengen sich —, und deshalb oeffnet ein Klick dieselbe Zeichnung gross
 * ueber dem Schirm.
 *
 * Gross wird dabei NEU gerechnet und nicht skaliert: die Anordnung haengt an
 * der Flaeche, und ein gedehntes Bild haette dieselben gedraengten Abstaende,
 * nur groesser.
 *
 * Eigene Datei, weil App.tsx schon reichlich traegt und das hier ein Stueck
 * ist, das man am Stueck liest.
 */
import { useEffect } from 'react';
import { KNOTEN_RADIUS, beschriftung as knotenText, type Geflecht as Netz } from '../shared/geflecht';

interface BildProps {
  readonly netz: Netz;
  /**
   * Kennung der Pfeilspitze.
   *
   * Je Zeichnung eine eigene: kleines Bild und Vollbild stehen gleichzeitig
   * im Baum, und zwei Elemente mit derselben `id` waeren keine gueltige
   * Seite mehr — der Browser nimmt dann fuer beide die erste.
   */
  readonly markeId: string;
  readonly alt: string;
}

/** Die Zeichnung selbst. Ohne Rahmen, ohne Knopf — nur das SVG. */
export function GeflechtBild({ netz, markeId, alt }: BildProps) {
  return (
    <svg className="geflecht" viewBox={`0 0 ${netz.breite} ${netz.hoehe}`} role="img" aria-label={alt}>
      <defs>
        {/* Die Pfeilspitze sitzt am Ende jeder Linie: die Richtung ist bei
            diesen Beziehungen der ganze Witz. */}
        <marker
          id={markeId}
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 z" />
        </marker>
      </defs>
      {netz.kanten.map((kante, stelle) => (
        <g className="geflecht__kante" key={`${kante.von}-${kante.nach}-${stelle}`}>
          <line x1={kante.x1} y1={kante.y1} x2={kante.x2} y2={kante.y2} markerEnd={`url(#${markeId})`} />
          <text x={kante.mx} y={kante.my - 4} textAnchor="middle">
            {kante.muster}
          </text>
        </g>
      ))}
      {netz.knoten.map((knoten) => {
        const wo = knotenText(knoten, netz);
        return (
          <g
            className={knoten.vorhanden ? 'geflecht__knoten geflecht__knoten--vorhanden' : 'geflecht__knoten'}
            key={knoten.stelle}
          >
            <circle cx={knoten.x} cy={knoten.y} r={KNOTEN_RADIUS} />
            <text x={wo.x} y={wo.y} textAnchor={wo.anker}>
              {knoten.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface VollbildProps {
  readonly netz: Netz;
  readonly alt: string;
  readonly schliessenText: string;
  readonly onClose: () => void;
}

/** Dieselbe Zeichnung ueber dem ganzen Schirm. Escape und Klick schliessen. */
export function GeflechtVollbild({ netz, alt, schliessenText, onClose }: VollbildProps) {
  useEffect(() => {
    const beiTaste = (ereignis: KeyboardEvent) => {
      if (ereignis.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', beiTaste);
    return () => window.removeEventListener('keydown', beiTaste);
  }, [onClose]);

  return (
    <div
      className="geflecht-schirm"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <div className="geflecht-schirm__flaeche" onClick={(ereignis) => ereignis.stopPropagation()}>
        <GeflechtBild netz={netz} markeId="geflecht-pfeil-gross" alt={alt} />
      </div>
      {/* Der Knopf liegt ueber der Flaeche und nicht darin: sonst waere er
          Teil des Bildes und wanderte mit dessen Seitenverhaeltnis. */}
      <button type="button" className="geflecht-schirm__zu" onClick={onClose}>
        {schliessenText}
      </button>
    </div>
  );
}
