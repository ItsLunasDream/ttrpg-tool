/**
 * Pakete: mehrere Zustaende, die zusammengehoeren.
 *
 * Wer einen Arktis-Abschnitt vorbereitet, braucht Kaelte, Schneeblindheit,
 * Erschoepfung durch Stapfen und den Hunger dazu — vier Zustaende, die
 * dieselbe Sprache sprechen sollen.
 *
 * DER GEWINN LIEGT NICHT IM SPAREN VON KLICKS.
 * ===========================================
 * Vier Mal einzeln wuerfeln waere genauso schnell. Der Unterschied ist die
 * ABSTIMMUNG: die Wirkungen werden ueber das ganze Paket verteilt, statt
 * vier Mal unabhaengig gezogen. So greift nicht dreimal derselbe Nachteil
 * an, und die Zustaende fuehlen sich wie ein Regelwerk an und nicht wie vier
 * Zufaelle.
 *
 * Das ist derselbe Erzeuger mit einem gemeinsamen Vorrat, keine zweite
 * Mechanik.
 */

import { baueNamen, erzeugeZustand, type Zustand } from './erzeuge';
import { ARTEN, HAERTEN, THEMEN, text, type Sprache } from './tabellen';
import { WIRKUNGEN, schwereWert, wirkung, type Wirkung } from './wirkungen';

export interface Paket {
  readonly name: string;
  readonly themaId: string;
  readonly haerteId: string;
  readonly zustaende: readonly Zustand[];
}

export interface Paketwunsch {
  readonly themaId?: string;
  readonly haerteId?: string;
  /** Wie viele Zustaende. Zwei bis sechs; mehr liest niemand. */
  readonly anzahl?: number;
}

function zieh<T>(liste: readonly T[], rng: () => number): T {
  return liste[Math.floor(rng() * liste.length)];
}

/**
 * Wie ein Paket heisst.
 *
 * Aus dem Thema, mit einer Wendung davor: „Der lange Winter", „Die
 * trockenen Wochen". Ein Paket ist ein Abschnitt der Kampagne, kein
 * Aktenordner — der Name darf so klingen.
 */
const WENDUNGEN: readonly { de: string; en: string }[] = [
  { de: 'Der lange', en: 'The Long' },
  { de: 'Die stillen', en: 'The Silent' },
  { de: 'Das ferne', en: 'The Distant' },
  { de: 'Der harte', en: 'The Hard' },
  { de: 'Die letzten', en: 'The Last' },
  { de: 'Das tiefe', en: 'The Deep' }
];

const ZEITEN: readonly { de: string; en: string }[] = [
  { de: 'Winter', en: 'Winter' },
  { de: 'Wochen', en: 'Weeks' },
  { de: 'Tage', en: 'Days' },
  { de: 'Meilen', en: 'Miles' },
  { de: 'Nächte', en: 'Nights' },
  { de: 'Wege', en: 'Roads' }
];

export function bauePaketnamen(sprache: Sprache, rng: () => number): string {
  return `${text(zieh(WENDUNGEN, rng), sprache)} ${text(zieh(ZEITEN, rng), sprache)}`;
}

/**
 * Ein Paket bauen.
 *
 * Die Verteilung laeuft ueber einen Vorrat: jede schon vergebene Wirkung
 * wird beim naechsten Zustand ueberschlagen. Weil die Wirkungsliste
 * endlich ist, kann der Vorrat ausgehen — dann wird wieder von vorn
 * vergeben, statt Zustaende ohne Stufen zu bauen. Bei sechs Zustaenden zu je
 * fuenf Stufen ist das der Normalfall und kein Fehler; die Abstimmung hat
 * bis dahin gewirkt.
 */
export function erzeugePaket(wunsch: Paketwunsch, sprache: Sprache, rng: () => number): Paket {
  const thema = THEMEN.find((t) => t.id === wunsch.themaId) ?? zieh(THEMEN, rng);
  const haerte = HAERTEN.find((h) => h.id === wunsch.haerteId) ?? HAERTEN[1];
  const anzahl = Math.max(2, Math.min(6, wunsch.anzahl ?? 4));

  const vergeben = new Set<string>();
  const namen = new Set<string>();
  const zustaende: Zustand[] = [];

  for (let i = 0; i < anzahl; i += 1) {
    /*
     * Die Stufenzahl schwankt innerhalb des Pakets.
     *
     * Vier Zustaende mit je fuenf Stufen sehen aus wie vier Mal dasselbe.
     * Drei bis fuenf, gewuerfelt, macht aus der Liste ein Regelwerk.
     */
    const stufen = 3 + Math.floor(rng() * 3);

    /*
     * Die Art wird je Zustand gewuerfelt, aber ohne den Segen.
     *
     * „Freezing" kommt von der Umgebung, „Frostbite" ist eine Verletzung —
     * verschiedene Arten im selben Paket sind richtig. Ein Segen zwischen
     * vier Widrigkeiten ist es nicht, und der erste Anlauf hat genau das
     * gebaut: ein Kaeltepaket, in dem ein Zustand lauter Buffs hatte.
     */
    const art = zieh(
      ARTEN.filter((a) => a.id !== 'segen'),
      rng
    );
    const roh = erzeugeZustand(
      { artId: art.id, themaId: thema.id, haerteId: haerte.id, stufen },
      sprache,
      rng
    );
    zustaende.push(ohneWiederholung(mitEigenemNamen(roh, namen, sprache, rng), vergeben, rng));
  }

  return {
    name: bauePaketnamen(sprache, rng),
    themaId: thema.id,
    haerteId: haerte.id,
    zustaende
  };
}

/**
 * Zwei Zustaende eines Pakets duerfen nicht gleich heissen.
 *
 * Das ist nicht nur unschoen: die Datei wird nach dem Namen benannt, und
 * „Alle in die Sammlung" haette den einen mit dem anderen ueberschrieben.
 * Aufgefallen ist es auf einem Bild der Oberflaeche — zwei Mal
 * „Winterschlaf" in einem Kaeltepaket.
 *
 * Nachgewuerfelt wird begrenzt oft; danach entscheidet die Art, was den
 * Unterschied macht („Winterschlaf (Verletzung)"). Ein Zustand ohne Namen
 * waere die schlechtere Loesung.
 */
function mitEigenemNamen(
  zustand: Zustand,
  namen: Set<string>,
  sprache: Sprache,
  rng: () => number
): Zustand {
  let name = zustand.name;
  for (let versuch = 0; versuch < 12 && namen.has(name); versuch += 1) {
    name = baueNamen(THEMEN.find((t) => t.id === zustand.themaId) ?? THEMEN[0], sprache, rng);
  }
  if (namen.has(name)) name = `${name} (${zustand.art})`;
  namen.add(name);
  return { ...zustand, name };
}

/**
 * Wirkungen ersetzen, die im Paket schon vorkommen.
 *
 * Gesucht wird ein Ersatz derselben Richtung, zuerst in derselben Schwere,
 * danach in einer hoeheren — eine leichtere waere falsch, sie kippte den
 * Verlauf.
 *
 * WICHTIG: der Ersatz darf sich nicht an einer Wirkung bedienen, die DIESER
 * Zustand weiter unten noch braucht. Genau daran ist der erste Anlauf
 * gescheitert: Stufe 2 bekam als Ersatz eine Wirkung, die Stufe 4 ohnehin
 * schon hatte, und der Zustand trug sie danach zweimal. Ein Paket, das die
 * Zustaende darin kaputt macht, ist keine Abstimmung.
 */
function ohneWiederholung(zustand: Zustand, vergeben: Set<string>, rng: () => number): Zustand {
  // Was dieser Zustand selbst noch vorhat. Daran ruehrt der Ersatz nicht.
  const eigene = new Set(zustand.stufen.flatMap((stufe) => stufe.wirkungen));

  const stufen = zustand.stufen.map((stufe) => {
    const wirkungen = stufe.wirkungen.map((id) => {
      if (!vergeben.has(id)) {
        vergeben.add(id);
        eigene.delete(id);
        return id;
      }
      const ersatz = freierErsatz(id, vergeben, eigene, rng);
      if (ersatz) {
        vergeben.add(ersatz);
        return ersatz;
      }
      /*
       * Kein Ersatz zu finden: die Wiederholung bleibt stehen.
       *
       * Zwei Zustaende, die beide die Bewegung halbieren, sind unschoen.
       * Eine Stufe ohne Wirkung waere kaputt. Von zwei Uebeln das kleinere,
       * und `ueberschneidung()` sagt es der Oberflaeche.
       */
      eigene.delete(id);
      return id;
    });
    return { nummer: stufe.nummer, wirkungen };
  });
  return { ...zustand, stufen };
}

/**
 * Eine freie Wirkung derselben Richtung, nicht leichter als die Vorlage.
 *
 * `gesperrt` sind die Wirkungen, die derselbe Zustand noch braucht.
 */
function freierErsatz(
  id: string,
  vergeben: ReadonlySet<string>,
  gesperrt: ReadonlySet<string>,
  rng: () => number
): string | null {
  const vorlage = wirkung(id);
  if (!vorlage) return null;

  const frei = (w: Wirkung) =>
    w.richtung === vorlage.richtung && !vergeben.has(w.id) && !gesperrt.has(w.id);

  const gleicheSchwere = WIRKUNGEN.filter((w) => w.schwere === vorlage.schwere && frei(w));
  if (gleicheSchwere.length > 0) {
    return gleicheSchwere[Math.floor(rng() * gleicheSchwere.length)].id;
  }

  const schwerer = WIRKUNGEN.filter(
    (w) => schwereWert(w.schwere) > schwereWert(vorlage.schwere) && frei(w)
  );
  if (schwerer.length > 0) return schwerer[Math.floor(rng() * schwerer.length)].id;

  return null;
}

/**
 * Wie stark sich die Zustaende eines Pakets ueberschneiden.
 *
 * Null heisst: keine Wirkung kommt zweimal vor — das Paket ist sauber
 * verteilt. Die Zahl steht in der Oberflaeche, damit man sieht, ob die
 * Abstimmung gegriffen hat oder ob der Vorrat ausgegangen ist.
 */
export function ueberschneidung(paket: Paket): number {
  const gesehen = new Set<string>();
  let doppelt = 0;
  for (const zustand of paket.zustaende) {
    for (const id of zustand.stufen.flatMap((s) => s.wirkungen)) {
      if (gesehen.has(id)) doppelt += 1;
      gesehen.add(id);
    }
  }
  return doppelt;
}
