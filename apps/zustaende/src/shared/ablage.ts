/**
 * Ein Zustand als Markdown mit YAML-Kopf.
 *
 * Dasselbe Muster wie bei den Monstern und den Begegnungen des Trackers:
 * eine Datei, die man in jedem Texteditor lesen und aendern kann. Wer das
 * Werkzeug nicht mehr benutzt, behaelt seine Zustaende.
 *
 * DER KOPF IST DIE SCHNITTSTELLE ZUM TRACKER.
 * ==========================================
 * Der Initiative Tracker kennt heute Zustaende mit Dauer. Damit er einen
 * eigenen anzeigen kann, braucht er Name, Zeichen, Farbe und die Zahl der
 * Stufen — alles in Zahlen und kurzen Worten, nicht in Prosa. Er liest
 * denselben Ordner; einen Kanal zwischen den beiden Werkzeugen gibt es
 * nicht und soll es nicht geben.
 *
 * Ein Zustand gehoert dabei ausdruecklich KEINER Kampagne: er ist
 * Handwerkszeug, das ueber Kampagnen hinweg gilt. Deshalb liegt er im
 * Datenordner des Werkzeugs und nicht im Vault des Story Creators.
 */

import { gesamtgewicht, betragVon } from './gewicht';
import { eichname, naechsterVergleich } from './eichung';
import type { Zustand } from './erzeuge';
import { wirkung } from './wirkungen';
import { text, type Sprache } from './tabellen';

export interface Abgelegt extends Zustand {
  readonly id: string;
  /** ISO-Zeitpunkt. Fuers Sortieren nach „zuletzt". */
  readonly geaendert: string;
  /**
   * Zu welchem Paket dieser Zustand gehoert — leer, wenn er allein steht.
   *
   * **Warum das im Kopf steht und nicht in einer eigenen Datei.** Ein Paket
   * ist kein Gegenstand fuer sich, sondern eine Zusammengehoerigkeit: die
   * vier Zustaende sind ueber einen gemeinsamen Vorrat gezogen worden und
   * sollen zusammen gelesen werden. Jeder von ihnen bleibt aber fuer sich
   * brauchbar — man kann einen einzeln nehmen, umbenennen oder loeschen,
   * ohne dass die anderen etwas merken. Ein Verweis im Kopf traegt genau
   * das; eine eigene Paketdatei muesste bei jedem Loeschen nachgefuehrt
   * werden und waere die zweite Stelle, an der dieselbe Wahrheit steht.
   */
  readonly paketId?: string;
  /** Der Name des Pakets, wie er auf der Kachel steht. */
  readonly paketName?: string;
}

/** Was die Sammlung von einer Datei wissen muss, ohne sie ganz zu lesen. */
export interface Eintrag {
  readonly id: string;
  readonly name: string;
  readonly dauerId: string;
  readonly artId: string;
  readonly themaId: string;
  readonly haerteId: string;
  readonly stufen: number;
  readonly gewicht: number;
  readonly zeichen: string;
  readonly farbe: string;
  readonly geaendert: string;
  /** Leer, wenn der Zustand allein steht. */
  readonly paketId: string;
  readonly paketName: string;
}

export function zuId(name: string): string {
  const sauber = name
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sauber || 'zustand';
}

/**
 * Eine Kennung, die noch niemand hat.
 *
 * Aus `wunsch` wird `wunsch-2`, `wunsch-3`, … solange, bis eine frei ist.
 *
 * **Warum das noetig ist.** Kennungen kommen hier aus Namen, und Namen sind
 * gewuerfelt — aus einer endlichen Liste. Zwei Pakete, die denselben Namen
 * ziehen, bekaemen dieselbe Kennung, und die Sammlung zeigte sie als EIN
 * Paket mit doppelt so vielen Zustaenden. Bei sechsunddreissig moeglichen
 * Paketnamen ist das nach einer Handvoll Pakete nicht unwahrscheinlich,
 * sondern zu erwarten.
 *
 * Bei Zustaenden faellt derselbe Zusammenstoss noch haerter aus: die Datei
 * wird ueberschrieben, und der aeltere Zustand ist weg, ohne dass jemand
 * gefragt wurde.
 *
 * Gilt nur fuers ANLEGEN. Wer einen vorhandenen Zustand bearbeitet, behaelt
 * seine Kennung — sonst zoege jedes Speichern eine Kopie nach sich.
 */
export function freieKennung(wunsch: string, vergeben: Iterable<string>): string {
  const belegt = new Set(vergeben);
  if (!belegt.has(wunsch)) return wunsch;
  for (let n = 2; ; n += 1) {
    const versuch = `${wunsch}-${n}`;
    if (!belegt.has(versuch)) return versuch;
  }
}

/** YAML-sicher: Werte, die der Leser sonst falsch versteht, kommen in Anfuehrungszeichen. */
function alsYaml(wert: string): string {
  return /^[A-Za-z0-9äöüÄÖÜß ._-]*$/.test(wert) && wert.trim() === wert && wert !== ''
    ? wert
    : JSON.stringify(wert);
}

/**
 * Die Fassung des Kopfes.
 *
 * 1 = Punktskala bis 12. 2 = Punktskala bis 36 (siehe `wirkungen.ts`).
 *
 * Die Zahl steht hier, weil im Kopf ein GEWICHT gespeichert wird und die
 * Sammlung es anzeigt und danach sortiert, ohne die Datei aufzumachen. Ohne
 * die Fassung staenden nach der Umstellung alte und neue Zahlen
 * nebeneinander in derselben Liste, und 14 saehe leichter aus als 15,
 * obwohl es dreimal so schwer ist.
 */
export const SCHEMA_VERSION = 2;

/**
 * Wie eine alte Zahl auf die neue Skala kommt.
 *
 * EHRLICH DAZU: das ist eine Naeherung. Die Umstellung war keine reine
 * Verdreifachung — innerhalb jeder Schwere wurden die Wirkungen neu
 * gegeneinander gewichtet, damit „festgehalten" schwerer wiegt als „taub".
 * Der Faktor trifft also den Mittelwert und nicht jede Datei. Genau wird die
 * Zahl erst wieder, wenn der Zustand einmal geoeffnet und gespeichert wird;
 * die Wirkungskennungen stehen im Leib, nicht im Kopf, und nur aus ihnen
 * laesst sich exakt rechnen.
 */
const SKALENFAKTOR = 3;

export function skaliertesGewicht(gewicht: number, fassung: number): number {
  return fassung >= SCHEMA_VERSION ? gewicht : gewicht * SKALENFAKTOR;
}

/**
 * Die ganze Datei: Kopfzahlen als YAML, darunter der Zustand zum Vorlesen.
 *
 * So liegt ein Zustand auf der Platte. Der Kopf ist fuer Maschinen — die
 * Sammlung und der Tracker lesen daraus, ohne den Leib zu zerlegen.
 */
export function alsMarkdown(zustand: Abgelegt, sprache: Sprache): string {
  return [...kopfzeilen(zustand), ...leibzeilen(zustand, sprache)].join('\n');
}

/**
 * Nur der Zustand, ohne die Kopfzahlen.
 *
 * Fuer den Weg in den Story Creator: dort ist der Kopf keine Verwaltung mehr,
 * sondern steht als Absatz „id: … name: … schemaVersion: 2" ueber dem Text.
 */
export function alsLeib(zustand: Abgelegt, sprache: Sprache): string {
  return leibzeilen(zustand, sprache).join('\n');
}

function kopfzeilen(zustand: Abgelegt): string[] {
  const gewicht = gesamtgewicht(zustand.stufen);

  const kopf = [
    '---',
    `id: ${alsYaml(zustand.id)}`,
    `name: ${alsYaml(zustand.name)}`,
    `art: ${alsYaml(zustand.artId)}`,
    `thema: ${alsYaml(zustand.themaId)}`,
    `haerte: ${alsYaml(zustand.haerteId)}`,
    `wirkrichtung: ${alsYaml(zustand.wirkrichtung)}`,
    `stufen: ${zustand.stufen.length}`,
    `gewicht: ${gewicht}`,
    // Zeichen und Farbe stehen im Kopf, damit der Tracker sie holen kann,
    // ohne den Leib zu lesen.
    `zeichen: ${alsYaml(zustand.zeichen)}`,
    `farbe: ${alsYaml(zustand.farbe)}`,
    `dauer: ${alsYaml(zustand.dauer)}`,
    // Die Kennung dazu: an ihr haengt die Zeitskala, und an der haengt, ob
    // Linderung und Verschlimmerung zusammenpassen.
    `dauer_id: ${alsYaml(zustand.dauerId)}`,
    // Der Verweis aufs Paket. Steht nur da, wo es eines gibt — eine Zeile
    // `paket: ""` in jeder Datei waere Rauschen.
    ...(zustand.paketId
      ? [`paket: ${alsYaml(zustand.paketId)}`, `paket_name: ${alsYaml(zustand.paketName ?? '')}`]
      : []),
    `geaendert: ${zustand.geaendert}`,
    `schemaVersion: ${SCHEMA_VERSION}`,
    '---',
    ''
  ];
  return kopf;
}

function leibzeilen(zustand: Abgelegt, sprache: Sprache): string[] {
  const de = sprache !== 'en';
  const gewicht = gesamtgewicht(zustand.stufen);
  const vergleich = naechsterVergleich(gewicht);

  const leib: string[] = [
    `# ${zustand.zeichen} ${zustand.name}`,
    '',
    `*${zustand.art} · ${zustand.thema} · ${zustand.haerte}*`,
    '',
    zustand.kurzsatz,
    ''
  ];

  if (zustand.stufen.length > 1) {
    leib.push(`## ${de ? 'Stufen' : 'Levels'}`, '');
    for (const stufe of zustand.stufen) {
      const wirkungen = stufe.wirkungen
        .map((id) => {
          const gefunden = wirkung(id);
          return gefunden ? text(gefunden.text, sprache) : id;
        })
        .join(de ? '; ' : '; ');
      leib.push(`${stufe.nummer}. ${wirkungen}`);
    }
    leib.push('');
  } else if (zustand.stufen.length === 1) {
    const wirkungen = zustand.stufen[0].wirkungen
      .map((id) => {
        const gefunden = wirkung(id);
        return gefunden ? text(gefunden.text, sprache) : id;
      })
      .join('; ');
    leib.push(`**${de ? 'Wirkung' : 'Effect'}** ${wirkungen}`, '');
  }

  leib.push(
    `**${de ? 'Dauer' : 'Duration'}** ${zustand.dauer}`,
    '',
    `**${de ? 'Schlimmer' : 'Worse'}** ${zustand.verschlimmerung}`,
    '',
    `**${de ? 'Besser' : 'Better'}** ${zustand.linderung}`,
    ''
  );

  if (zustand.ausloeser !== '') {
    leib.push(`**${de ? 'Ausgelöst' : 'Triggered'}** ${zustand.ausloeser}`, '');
  }

  /*
   * Das Gewicht steht mit seinem Vergleich da, nie allein.
   *
   * „Wiegt 43" sagt niemandem etwas. „Wiegt so viel wie Erschoepfung 5"
   * sagt jedem alles. Und der Satz darunter sagt, was die Zahl NICHT
   * bedeutet — sonst liest sie jemand als Balance-Urteil.
   */
  /*
   * Ein Segen bekommt keinen Vergleich — wie in der Waage.
   *
   * Die Eichzustaende sind samt und sonders Fluesche; „so viel wie
   * Erschoepfung 1" neben einem Zustand, der gibt, vergleicht zwei Dinge,
   * die nichts miteinander zu tun haben.
   */
  const vergleichstext =
    gewicht < 0
      ? de
        ? 'kein Vergleich — die Eichung kennt nur Zustände, die nehmen'
        : 'no comparison — the calibration only knows conditions that take'
      : `${de ? 'etwa so viel wie' : 'about as much as'} ${eichname(vergleich, sprache)}`;

  leib.push(
    `*${de ? 'Gewicht' : 'Weight'}: ${betragVon(gewicht)} — ${vergleichstext}.*`,
    '',
    `*${
      de
        ? 'Das Gewicht sagt, wie schwer der Zustand wiegt, solange er anliegt. Ob er für deine Runde zu hart ist, hängt daran, wie oft man ihn bekommt — und das weiß nur dein Tisch.'
        : 'The weight says how much the condition weighs while it lasts. Whether it is too harsh for your table depends on how often you get it — and only your table knows that.'
    }*`,
    ''
  );

  const alles = [...leib].filter(
    (zeile, stelle, liste) => !(zeile === '' && liste[stelle - 1] === '')
  );
  return alles;
}

/**
 * Den YAML-Kopf zurueckliefern, ohne den Rest zu lesen.
 *
 * Bewusst ein winziger Leser und kein YAML-Paket — der Kopf hat ein festes
 * Format, das dieses Werkzeug selbst schreibt.
 */
export function liesKopf(inhalt: string): Record<string, string> {
  const heraus: Record<string, string> = {};
  const zeilen = inhalt.split(/\r?\n/);
  if (zeilen[0]?.trim() !== '---') return heraus;

  for (let i = 1; i < zeilen.length; i += 1) {
    const zeile = zeilen[i];
    if (zeile.trim() === '---') break;
    const doppelpunkt = zeile.indexOf(':');
    if (doppelpunkt <= 0) continue;
    const name = zeile.slice(0, doppelpunkt).trim();
    const roh = zeile.slice(doppelpunkt + 1).trim();
    heraus[name] = roh.startsWith('"') ? sicherGelesen(roh) : roh;
  }
  return heraus;
}

function sicherGelesen(roh: string): string {
  try {
    const gelesen = JSON.parse(roh) as unknown;
    return typeof gelesen === 'string' ? gelesen : roh;
  } catch {
    return roh;
  }
}

export function alsEintrag(inhalt: string, rueckfallId: string): Eintrag {
  const kopf = liesKopf(inhalt);
  const zahl = (name: string) => {
    const wert = Number(kopf[name]);
    return Number.isFinite(wert) ? wert : 0;
  };
  return {
    id: kopf.id || rueckfallId,
    name: kopf.name || rueckfallId,
    dauerId: kopf.dauer_id || '',
    artId: kopf.art || '',
    themaId: kopf.thema || '',
    haerteId: kopf.haerte || '',
    stufen: zahl('stufen'),
    // Alte Dateien tragen die alte Skala. Ohne die Umrechnung stuenden in
    // der Sammlung zwei Massstaebe untereinander.
    gewicht: skaliertesGewicht(zahl('gewicht'), zahl('schemaVersion')),
    zeichen: kopf.zeichen || '◈',
    farbe: kopf.farbe || '#7a8ca8',
    geaendert: kopf.geaendert || '',
    paketId: kopf.paket || '',
    // Aeltere Dateien kennen nur die Kennung; dann steht sie auch als Name
    // da, statt dass die Kachel „ohne Namen" sagt.
    paketName: kopf.paket_name || kopf.paket || ''
  };
}
