/**
 * Ein einzelner Wuerfel.
 *
 * Die Form kommt aus shared/formen.ts, die Farbe aus den Einstellungen, die
 * Zahlenfarbe wird aus der Farbe berechnet. Beim Rollen dreht und wackelt er;
 * danach bleibt die Zahl stehen, bis erneut gewuerfelt wird.
 */
import { FORMEN, type Art } from '../shared/formen';
import { zahlenFarbe, type Muster } from '../shared/einstellungen';

/**
 * Wo die Funken sitzen und wann sie aufblitzen.
 *
 * Feste Stellen statt Zufall: bei hundert Wuerfeln wuerde jeder Wurf sonst
 * hundertmal neu rechnen, und niemand sieht den Unterschied. Die Verzoegerung
 * laesst sie nacheinander aufblitzen — gleichzeitig sieht es nach einem
 * Blitzlicht aus, nicht nach Glitzer.
 */
const FUNKEN = [
  { x: 8, y: 14, verzug: 0 },
  { x: 82, y: 8, verzug: 120 },
  { x: 92, y: 62, verzug: 260 },
  { x: 14, y: 74, verzug: 190 },
  { x: 50, y: -6, verzug: 330 },
  { x: 46, y: 92, verzug: 80 }
] as const;

interface Props {
  readonly art: Art;
  /** Die Zahl, oder `null`, solange nicht gewuerfelt wurde. */
  readonly augen: number | null;
  readonly farbe: string;
  readonly muster: Muster;
  readonly groesse: number;
  /** Ob dieser Wuerfel abgezogen wird. */
  readonly abzug?: boolean;
  readonly rollt?: boolean;
  readonly hoechst?: boolean;
  readonly tiefst?: boolean;
  /**
   * Verzoegerung in Millisekunden. Wuerfel starten leicht versetzt — alle
   * gleichzeitig sieht nach einer Maschine aus, nicht nach Wuerfeln.
   */
  readonly verzug?: number;
  readonly onClick?: () => void;
  readonly onContextMenu?: (ereignis: React.MouseEvent) => void;
  readonly titel?: string;
}

export function Wuerfel({
  art,
  augen,
  farbe,
  muster,
  groesse,
  abzug = false,
  rollt = false,
  hoechst = false,
  tiefst = false,
  verzug = 0,
  onClick,
  onContextMenu,
  titel
}: Props) {
  const form = FORMEN[art];
  const schrift = zahlenFarbe(farbe);
  // Eine eigene Kennung je Wuerfel: zwei Verlaeufe mit demselben Namen im
  // selben Dokument fallen zusammen, und dann tragen alle Wuerfel den des
  // ersten.
  const kennung = `w-${art}-${verzug}-${groesse}`;

  const klassen = [
    'wuerfel',
    rollt ? 'wuerfel--rollt' : '',
    abzug ? 'wuerfel--abzug' : '',
    hoechst ? 'wuerfel--hoechst' : '',
    tiefst ? 'wuerfel--tiefst' : '',
    onClick ? 'wuerfel--klickbar' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const Wurzel = onClick ? 'button' : 'span';

  return (
    <Wurzel
      className={klassen}
      style={{ width: groesse, height: groesse, animationDelay: `${verzug}ms` }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={titel}
      type={onClick ? 'button' : undefined}
    >
      <svg viewBox="0 0 100 100" width={groesse} height={groesse} aria-hidden="true">
        <defs>
          <Musterung kennung={kennung} muster={muster} farbe={farbe} />
        </defs>

        <path d={form.umriss} fill={`url(#${kennung})`} stroke={schrift} strokeOpacity="0.45" strokeWidth="1.5" />

        {/* Die Facetten machen den Koerper plastisch. Ohne sie wirkt jede Art
            wie ein flacher Aufkleber. */}
        {form.facetten.map((facette, nummer) => (
          <path
            key={nummer}
            d={facette}
            fill="none"
            stroke={schrift}
            strokeOpacity="0.38"
            strokeWidth="1.2"
          />
        ))}

        {augen !== null ? (
          <text
            x="50"
            y={form.zahlY}
            textAnchor="middle"
            fill={schrift}
            fontSize={form.zahlGroesse}
            fontWeight="700"
            // Ziffern gleicher Breite: sonst huepft die Zahl beim Wechsel von
            // 9 auf 10 im Wuerfel herum.
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {augen}
          </text>
        ) : null}
      </svg>

      {abzug ? (
        <span className="wuerfel__abzug" aria-hidden="true">
          −
        </span>
      ) : null}

      {/*
        Die Effekte liegen ueber dem Wuerfel und nicht im SVG: als eigene
        Elemente kosten sie nichts, solange sie fehlen — und bei hundert
        Wuerfeln zaehlt genau das. Ein Filter im SVG haette auf jedem Wuerfel
        gerechnet, auch auf den ruhigen.
      */}
      {hoechst ? (
        <span className="glitzer" aria-hidden="true">
          {FUNKEN.map((funke, nummer) => (
            <span
              key={nummer}
              className="glitzer__funke"
              style={{ left: `${funke.x}%`, top: `${funke.y}%`, animationDelay: `${funke.verzug}ms` }}
            />
          ))}
        </span>
      ) : null}

      {tiefst ? (
        <span className="streifen" aria-hidden="true">
          <span className="streifen__linie" />
          <span className="streifen__linie" />
          <span className="streifen__linie" />
          <span className="streifen__linie" />
        </span>
      ) : null}
    </Wurzel>
  );
}

/**
 * Die Fuellung — je nach Muster ein Verlauf, ein Farbwechsel oder Punkte.
 *
 * Alle Muster leiten sich aus der einen gewaehlten Farbe ab, statt eigene
 * Farben mitzubringen: sonst waere die freie Farbwahl nur beim schlichten
 * Muster wirksam.
 */
function Musterung({ kennung, muster, farbe }: { kennung: string; muster: Muster; farbe: string }) {
  if (muster === 'metall') {
    // Harte Kanten zwischen hell und dunkel: das liest sich als Metall,
    // waehrend ein weicher Verlauf nach Plastik aussieht.
    return (
      <linearGradient id={kennung} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={farbe} stopOpacity="1" />
        <stop offset="38%" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="40%" stopColor={farbe} />
        <stop offset="72%" stopColor="#000000" stopOpacity="0.35" />
        <stop offset="74%" stopColor={farbe} />
        <stop offset="100%" stopColor={farbe} />
      </linearGradient>
    );
  }

  if (muster === 'marmor') {
    return (
      <radialGradient id={kennung} cx="35%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
        <stop offset="45%" stopColor={farbe} />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
      </radialGradient>
    );
  }

  if (muster === 'sternenhimmel') {
    return (
      <radialGradient id={kennung} cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor={farbe} />
        <stop offset="60%" stopColor={farbe} />
        <stop offset="100%" stopColor="#05060a" />
      </radialGradient>
    );
  }

  // Schlicht: die Farbe selbst, oben eine Spur heller. Der Verlauf muss von
  // der Farbe ausgehen und nicht von Weiss nach Schwarz — sonst waere der
  // Wuerfel durchsichtig und die gewaehlte Farbe wirkungslos.
  return (
    <linearGradient id={kennung} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={farbe} />
      <stop offset="100%" stopColor={farbe} stopOpacity="0.82" />
    </linearGradient>
  );
}
