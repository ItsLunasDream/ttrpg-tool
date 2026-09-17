/**
 * Die Symbole der Werkzeuge. Bewusst als Vektor im Quelltext und nicht als
 * Bilddatei: sie erben so `currentColor` und passen sich damit von selbst an
 * hell, dunkel und den Zustand der Kachel an, ohne dass es jedes Symbol
 * doppelt geben muss. Sie skalieren ausserdem von 26 auf 64 Pixel ohne
 * zweiten Satz Dateien.
 *
 * Alles Platzhalter — die endgueltigen Symbole kommen mit den endgueltigen
 * Namen.
 */
import { useState, type ReactElement } from 'react';

interface IconProps {
  readonly size?: number;
}

function Rahmen({ size = 26, children }: IconProps & { children: React.ReactNode }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={size >= 48 ? 2 : 2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Zettel, die durch Linien verbunden sind: Notizen und ihre Beziehungen. */
export const BackstoryIcon = (p: IconProps) => (
  <Rahmen {...p}>
    <rect x="7" y="7" width="15" height="11" rx="2" />
    <rect x="26" y="6" width="15" height="11" rx="2" />
    <rect x="15" y="29" width="17" height="11" rx="2" />
    <line x1="14.5" y1="18" x2="20" y2="29" />
    <line x1="22" y1="12.5" x2="26" y2="11.5" />
    <line x1="33.5" y1="17" x2="27" y2="29" />
    <line x1="19" y1="33" x2="28" y2="33" />
    <line x1="19" y1="37" x2="25" y2="37" />
  </Rahmen>
);

/** Ein Rasterfeld mit angedeuteter Mauer: die Karte. */
export const MapmakerIcon = (p: IconProps) => (
  <Rahmen {...p}>
    <rect x="8" y="8" width="28" height="28" />
    <line x1="17" y1="8" x2="17" y2="36" />
    <line x1="27" y1="8" x2="27" y2="36" />
    <line x1="8" y1="17" x2="36" y2="17" />
    <line x1="8" y1="27" x2="36" y2="27" />
    <line x1="10.5" y1="25.5" x2="10.5" y2="28.5" />
    <line x1="13.5" y1="25.5" x2="13.5" y2="28.5" />
    <line x1="16.5" y1="25.5" x2="16.5" y2="28.5" />
  </Rahmen>
);

/** Absteigend lange Balken mit Pfeil zurueck nach oben: die Zugreihenfolge. */
export const InitiativeIcon = (p: IconProps) => (
  <Rahmen {...p}>
    <rect x="9" y="9" width="26" height="7" rx="3.5" />
    <rect x="9" y="20.5" width="20" height="7" rx="3.5" />
    <rect x="9" y="32" width="14" height="7" rx="3.5" />
    <path d="M41,35 C44,35 44,9 41,9" />
    <path d="M41,9 L37,7" />
    <path d="M41,9 L37,11" />
  </Rahmen>
);

/** Ein W20 in Aufsicht. */
export const DiceIcon = (p: IconProps) => (
  <Rahmen {...p}>
    <path d="M24,8 L39,16 L24,24 L9,16 Z" />
    <path d="M9,16 L24,24 L24,42 L9,34 Z" />
    <path d="M39,16 L24,24 L24,42 L39,34 Z" />
    <circle cx="13" cy="23" r="1.4" />
    <circle cx="19" cy="35" r="1.4" />
    <circle cx="28" cy="22" r="1.4" />
    <circle cx="31" cy="29" r="1.4" />
    <circle cx="34" cy="36" r="1.4" />
  </Rahmen>
);

/** Eine Waage: Gruppe gegen Gegner, ausbalanciert. */
export const EncounterIcon = (p: IconProps) => (
  <Rahmen {...p}>
    <line x1="15" y1="41" x2="33" y2="41" />
    <line x1="24" y1="41" x2="24" y2="11" />
    <line x1="9" y1="13" x2="39" y2="13" />
    <line x1="9" y1="13" x2="9" y2="19" />
    <line x1="39" y1="13" x2="39" y2="19" />
    <path d="M4,19 L9,23 L14,19" />
    <path d="M34,19 L39,23 L44,19" />
    <circle cx="9" cy="24" r="3" />
    <circle cx="36" cy="24" r="2" />
    <circle cx="42" cy="24" r="2" />
  </Rahmen>
);

/** Die Marke der Sammlung: ein Sechseck mit Stern. */
export const SuiteIcon = (p: IconProps) => (
  <Rahmen {...p}>
    <path d="M24,8 L38,16 L38,32 L24,40 L10,32 L10,16 Z" />
    <path d="M24,16 L26.47,21.53 L32,24 L26.47,26.47 L24,32 L21.53,26.47 L16,24 L21.53,21.53 Z" />
  </Rahmen>
);

/**
 * NPC Creator: Kopf und Schultern, daneben ein Funke.
 *
 * Eine Person allein waere vom Initiative Tracker kaum zu unterscheiden —
 * der Funke sagt, dass hier jemand entsteht und nicht verwaltet wird.
 */
function NpcIcon({ size = 26 }: IconProps): ReactElement {
  return (
    <Rahmen size={size}>
      <circle cx="20" cy="17" r="7" />
      <path d="M8 40c0-6.6 5.4-12 12-12s12 5.4 12 12" />
      <path d="M36 10v8M32 14h8" />
      <path d="M38 24v4M36 26h4" />
    </Rahmen>
  );
}

/**
 * Inspirationshilfe: ein Funke ueber drei verbundenen Punkten.
 *
 * Die Punkte sind das Geflecht — Figuren, Fraktionen, Orte und was zwischen
 * ihnen liegt. Der Funke allein waere vom NPC Creator kaum zu unterscheiden,
 * die Punkte allein saehen aus wie ein Graph.
 */
/**
 * Monster Creator: ein Schaedel mit Hoernern, auf einer Waage.
 *
 * Die Waage ist der Punkt. Das Werkzeug baut nicht nur ein Monster, es wiegt
 * es — und das ist der Teil, der es von einem Wuerfel unterscheidet.
 */
function MonsterIcon({ size = 26 }: IconProps): ReactElement {
  return (
    <Rahmen size={size}>
      <path d="M14 16c0-5 4-8 10-8s10 3 10 8v6c0 3-2 5-4 6h-12c-2-1-4-3-4-6z" />
      <path d="M14 14l-4-5M34 14l4-5" />
      <circle cx="19" cy="19" r="1.6" />
      <circle cx="29" cy="19" r="1.6" />
      <path d="M24 30v8M16 38h16" />
    </Rahmen>
  );
}

function InspirationIcon({ size = 26 }: IconProps): ReactElement {
  return (
    <Rahmen size={size}>
      <path d="M24 6v6M14 10l3 4M34 10l-3 4" />
      <circle cx="24" cy="22" r="4" />
      <circle cx="12" cy="38" r="4" />
      <circle cx="36" cy="38" r="4" />
      <path d="M21 25 14 34M27 25l7 9M16 38h16" />
    </Rahmen>
  );
}

/**
 * Der Status Effect Creator: eine Figur mit einer Marke darauf.
 *
 * Nicht das Zeichen eines einzelnen Zustands — die sind je Thema
 * verschieden. Was alle gemeinsam haben, ist die Stufenleiter daneben: ein
 * Zustand, der schlimmer wird.
 */
function ZustaendeIcon({ size = 26 }: IconProps): ReactElement {
  return (
    <Rahmen size={size}>
      <circle cx="17" cy="13" r="5" />
      <path d="M17 18v14M11 23h12M13 40l4-8M21 40l-4-8" />
      <path d="M32 36h10M32 28h8M32 20h6" />
    </Rahmen>
  );
}

const NACH_ID: Record<string, (p: IconProps) => ReactElement> = {
  backstory: BackstoryIcon,
  mapmaker: MapmakerIcon,
  initiative: InitiativeIcon,
  dice: DiceIcon,
  npc: NpcIcon,
  inspiration: InspirationIcon,
  monster: MonsterIcon,
  zustaende: ZustaendeIcon,
  encounter: EncounterIcon
};

/**
 * Symbol zu einer App-ID. Faellt auf die Marke der Sammlung zurueck, damit ein
 * neuer Eintrag im Verzeichnis nicht zu einer Luecke in der Kachel fuehrt.
 */
export function iconFuer(id: string): (p: IconProps) => ReactElement {
  return NACH_ID[id] ?? SuiteIcon;
}

/**
 * Das Symbol eines Werkzeugs: entweder ein eigenes Bild oder das eingebaute.
 *
 * Die eingebauten sind Vektoren und erben `currentColor` — sie passen sich
 * damit von selbst an den Zustand der Kachel an. Ein eigenes Bild kann das
 * nicht und soll es auch nicht: wer eines hinlegt, will genau dieses sehen.
 *
 * Laesst sich das Bild nicht anzeigen — kaputte Datei, unbekanntes Format,
 * das der Browser doch nicht mag —, faellt es still auf das eingebaute
 * zurueck. Ein Symbol ist kein Grund fuer eine Fehlermeldung.
 */
export function AppSymbol({
  id,
  size = 26,
  bild
}: {
  readonly id: string;
  readonly size?: number;
  /** Die data:-URL aus dem Symbolordner, oder undefined. */
  readonly bild?: string;
}): ReactElement {
  const [kaputt, setKaputt] = useState(false);
  const Eingebaut = iconFuer(id);

  if (!bild || kaputt) return <Eingebaut size={size} />;

  return (
    <img
      className="app-symbol"
      src={bild}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      onError={() => setKaputt(true)}
    />
  );
}
