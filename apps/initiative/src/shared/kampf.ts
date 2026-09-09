/**
 * Die Regeln des Kampfablaufs — ohne Oberflaeche, ohne Dateien.
 *
 * Alles hier ist eine reine Funktion: Kampf rein, neuer Kampf raus. Das ist
 * kein Selbstzweck. Am Spieltisch faellt ein Fehler in der Zugreihenfolge
 * niemandem sofort auf, und wenn doch, laesst er sich nicht nachstellen —
 * also muss er sich pruefen lassen, bevor er passiert.
 */
import type { Kampf, Koerper, Teilnehmer, Zustand } from './types';

/** Eine ID, die auch ohne `crypto.randomUUID` funktioniert (Node-Tests). */
export function neueId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function leererKampf(): Kampf {
  return {
    schemaVersion: 1,
    begegnungId: null,
    name: '',
    teilnehmer: [],
    amZug: -1,
    runde: 0,
    laeuft: false
  };
}

export function neuerKoerper(marke = '', hpMax = 0): Koerper {
  return { id: neueId(), marke, hp: hpMax, hpMax, tempHp: 0, raus: false };
}

export function neuerTeilnehmer(name: string, istSpieler = false): Teilnehmer {
  return {
    id: neueId(),
    name,
    initiative: 0,
    feinwert: 0,
    istSpieler,
    koerper: [neuerKoerper()],
    zustaende: [],
    bild: null,
    notiz: ''
  };
}

/**
 * Die Reihenfolge: hoechste Initiative zuerst.
 *
 * Gleichstaende entscheidet der Feinwert, danach — und das ist der Punkt —
 * die *Reihenfolge des Eintragens* und nicht der Name. Eine Sortierung nach
 * Namen sieht ordentlich aus und waere hier falsch: die Reihenfolge duerfte
 * sich beim Umbenennen einer Kreatur mitten im Kampf nicht aendern.
 */
export function reihenfolge(teilnehmer: readonly Teilnehmer[]): Teilnehmer[] {
  return teilnehmer
    .map((eintrag, index) => ({ eintrag, index }))
    .sort((a, b) => {
      if (b.eintrag.initiative !== a.eintrag.initiative) {
        return b.eintrag.initiative - a.eintrag.initiative;
      }
      if (b.eintrag.feinwert !== a.eintrag.feinwert) return b.eintrag.feinwert - a.eintrag.feinwert;
      return a.index - b.index;
    })
    .map((eintrag) => eintrag.eintrag);
}

/** Ob ein Teilnehmer noch mitspielt: mindestens ein Koerper steht. */
export function istAktiv(teilnehmer: Teilnehmer): boolean {
  return teilnehmer.koerper.some((koerper) => !koerper.raus && koerper.hp > 0);
}

/**
 * Beginnt den Kampf: sortiert und stellt den ersten Teilnehmer auf Zug.
 *
 * Gestartet wird bei Runde 1, nicht 0 — am Tisch zaehlt man ab eins, und eine
 * „Runde 0\" im Bild waere eine Frage, die niemand stellen wollte.
 */
export function beginne(kampf: Kampf): Kampf {
  const sortiert = reihenfolge(kampf.teilnehmer);
  if (sortiert.length === 0) return kampf;
  return { ...kampf, teilnehmer: sortiert, amZug: 0, runde: 1, laeuft: true };
}

/**
 * Weiter zum naechsten Zug. Die eine Handlung, die hundertmal pro Abend
 * passiert — sie muss ohne Nachdenken gehen und darf nie stecken bleiben.
 *
 * Uebersprungen wird, wer nicht mehr mitspielt. Wenn *niemand* mehr aktiv ist,
 * bleibt der Zeiger stehen, statt sich im Kreis zu drehen: der Kampf ist dann
 * vorbei, und das entscheidet der Tisch, nicht das Werkzeug.
 *
 * Zustaende laufen am Ende des eigenen Zuges herunter — dort, wo sie in den
 * meisten Systemen ablaufen, und vor allem an *einer* Stelle statt verteilt.
 */
export function naechsterZug(kampf: Kampf): Kampf {
  if (!kampf.laeuft || kampf.teilnehmer.length === 0) return kampf;
  if (!kampf.teilnehmer.some(istAktiv)) return kampf;

  const abgelaufen = zaehleZustaendeHerunter(kampf, kampf.amZug);

  let index = kampf.amZug;
  let runde = abgelaufen.runde;
  for (let schritt = 0; schritt < abgelaufen.teilnehmer.length; schritt++) {
    index += 1;
    if (index >= abgelaufen.teilnehmer.length) {
      index = 0;
      runde += 1;
    }
    if (istAktiv(abgelaufen.teilnehmer[index])) {
      return { ...abgelaufen, amZug: index, runde };
    }
  }
  return abgelaufen;
}

/**
 * Zaehlt die Zustaende dessen herunter, der gerade dran war, und entfernt die
 * abgelaufenen.
 *
 * Zustaende ohne Dauer (`rundenRest === null`) bleiben unangetastet.
 */
function zaehleZustaendeHerunter(kampf: Kampf, index: number): Kampf {
  if (index < 0 || index >= kampf.teilnehmer.length) return kampf;
  const dran = kampf.teilnehmer[index];
  const zustaende = dran.zustaende
    .map((zustand) =>
      zustand.rundenRest === null ? zustand : { ...zustand, rundenRest: zustand.rundenRest - 1 }
    )
    .filter((zustand) => zustand.rundenRest === null || zustand.rundenRest > 0);
  if (zustaende.length === dran.zustaende.length && zustaende.every((z, i) => z === dran.zustaende[i])) {
    return kampf;
  }
  return {
    ...kampf,
    teilnehmer: kampf.teilnehmer.map((eintrag, i) =>
      i === index ? { ...eintrag, zustaende } : eintrag
    )
  };
}

/**
 * Schaden oder Heilung auf einen Koerper. Negativ heilt.
 *
 * Zeitweilige Trefferpunkte fangen Schaden zuerst ab und werden dabei nicht
 * negativ. Geheilt wird hoechstens bis zum Hoechstwert, und Trefferpunkte
 * fallen nicht unter null: „minus vier\" ist in keinem System eine Zahl, die
 * ein Tracker fuehren sollte.
 */
export function aendereHp(kampf: Kampf, teilnehmerId: string, koerperId: string, schaden: number): Kampf {
  return mitKoerper(kampf, teilnehmerId, koerperId, (koerper) => {
    if (schaden <= 0) {
      const geheilt = Math.min(koerper.hpMax, koerper.hp - schaden);
      return { ...koerper, hp: geheilt };
    }
    const ausTemp = Math.min(koerper.tempHp, schaden);
    const rest = schaden - ausTemp;
    return {
      ...koerper,
      tempHp: koerper.tempHp - ausTemp,
      hp: Math.max(0, koerper.hp - rest)
    };
  });
}

/** Setzt einen Koerper auf einen Wert. Fuer das Eintippen von Hand. */
export function setzeHp(kampf: Kampf, teilnehmerId: string, koerperId: string, hp: number): Kampf {
  return mitKoerper(kampf, teilnehmerId, koerperId, (koerper) => ({
    ...koerper,
    hp: Math.max(0, Math.min(koerper.hpMax, hp))
  }));
}

function mitKoerper(
  kampf: Kampf,
  teilnehmerId: string,
  koerperId: string,
  aendere: (koerper: Koerper) => Koerper
): Kampf {
  return {
    ...kampf,
    teilnehmer: kampf.teilnehmer.map((teilnehmer) =>
      teilnehmer.id !== teilnehmerId
        ? teilnehmer
        : {
            ...teilnehmer,
            koerper: teilnehmer.koerper.map((koerper) =>
              koerper.id === koerperId ? aendere(koerper) : koerper
            )
          }
    )
  };
}

/** Aendert einen Teilnehmer. */
export function mitTeilnehmer(
  kampf: Kampf,
  teilnehmerId: string,
  aendere: (teilnehmer: Teilnehmer) => Teilnehmer
): Kampf {
  return {
    ...kampf,
    teilnehmer: kampf.teilnehmer.map((eintrag) =>
      eintrag.id === teilnehmerId ? aendere(eintrag) : eintrag
    )
  };
}

/**
 * Dupliziert einen Teilnehmer.
 *
 * Der Zwilling bekommt eigene IDs — auch fuer jeden Koerper. Ohne das
 * traefe Schaden beide zugleich, und *das* faellt am Tisch erst auf, wenn
 * zwei Goblins gleichzeitig umfallen.
 *
 * Der Name bekommt eine laufende Nummer, wenn er sie noch nicht hat. Der
 * Zwilling wird direkt hinter das Vorbild gesetzt, nicht ans Ende: er gehoert
 * dorthin, wo man ihn gerade angelegt hat.
 */
export function dupliziere(kampf: Kampf, teilnehmerId: string): Kampf {
  const index = kampf.teilnehmer.findIndex((eintrag) => eintrag.id === teilnehmerId);
  if (index < 0) return kampf;
  const vorbild = kampf.teilnehmer[index];

  const zwilling: Teilnehmer = {
    ...vorbild,
    id: neueId(),
    name: naechsterName(vorbild.name, kampf.teilnehmer),
    // Frische Koerper mit vollen Trefferpunkten: der Zwilling ist eine neue
    // Kreatur, nicht der halb erschlagene Zustand des Vorbilds.
    koerper: vorbild.koerper.map((koerper) => ({
      ...koerper,
      id: neueId(),
      hp: koerper.hpMax,
      tempHp: 0,
      raus: false
    })),
    // Zustaende gehoeren zum Vorbild, nicht zur Art.
    zustaende: []
  };

  const teilnehmer = [...kampf.teilnehmer];
  teilnehmer.splice(index + 1, 0, zwilling);
  // Der Zeiger steht auf einem Index; wird davor eingefuegt, rutscht er mit.
  const amZug = kampf.amZug > index ? kampf.amZug + 1 : kampf.amZug;
  return { ...kampf, teilnehmer, amZug };
}

/**
 * Findet den naechsten freien Namen: „Goblin\" wird zu „Goblin 2\", „Goblin 2\"
 * zu „Goblin 3\".
 */
export function naechsterName(name: string, vorhandene: readonly Teilnehmer[]): string {
  const treffer = /^(.*?)\s+(\d+)$/.exec(name);
  const stamm = treffer ? treffer[1] : name;
  const benutzt = new Set(vorhandene.map((eintrag) => eintrag.name));
  for (let nummer = 2; nummer < 1000; nummer++) {
    const kandidat = `${stamm} ${nummer}`;
    if (!benutzt.has(kandidat)) return kandidat;
  }
  return `${stamm} ${neueId().slice(0, 4)}`;
}

/**
 * Macht aus einem Eintrag eine Gruppe mit `anzahl` Koerpern — oder passt die
 * Anzahl an.
 *
 * Beim Vergroessern bekommen die neuen Koerper die Trefferpunkte des ersten
 * als Vorlage. Beim Verkleinern fallen die *hinteren* weg: die vorderen sind
 * die, an denen am Tisch schon gerechnet wurde.
 */
export function setzeGruppengroesse(
  kampf: Kampf,
  teilnehmerId: string,
  anzahl: number
): Kampf {
  const ziel = Math.max(1, Math.min(99, Math.floor(anzahl)));
  return mitTeilnehmer(kampf, teilnehmerId, (teilnehmer) => {
    if (teilnehmer.koerper.length === ziel) return teilnehmer;
    const vorlage = teilnehmer.koerper[0];
    const koerper = [...teilnehmer.koerper];
    while (koerper.length > ziel) koerper.pop();
    while (koerper.length < ziel) {
      koerper.push({ ...neuerKoerper('', vorlage?.hpMax ?? 0), marke: String(koerper.length + 1) });
    }
    // Marken neu vergeben: bei genau einem Koerper keine, sonst 1..n. Sonst
    // hiesse ein Einzelwesen nach dem Verkleinern weiter „Goblin 1\".
    return {
      ...teilnehmer,
      koerper: koerper.map((eintrag, index) => ({
        ...eintrag,
        marke: ziel === 1 ? '' : String(index + 1)
      }))
    };
  });
}

/** Fuegt einen Zustand hinzu. */
export function setzeZustand(kampf: Kampf, teilnehmerId: string, zustand: Zustand): Kampf {
  return mitTeilnehmer(kampf, teilnehmerId, (teilnehmer) => ({
    ...teilnehmer,
    zustaende: [...teilnehmer.zustaende, zustand]
  }));
}

export function entferneZustand(kampf: Kampf, teilnehmerId: string, zustandId: string): Kampf {
  return mitTeilnehmer(kampf, teilnehmerId, (teilnehmer) => ({
    ...teilnehmer,
    zustaende: teilnehmer.zustaende.filter((zustand) => zustand.id !== zustandId)
  }));
}

/**
 * Entfernt einen Teilnehmer und haelt den Zeiger auf dem, der gerade dran
 * ist.
 *
 * Ohne das Nachziehen zeigte der Zeiger nach dem Entfernen eines
 * Vordermanns auf den Falschen — und wer gerade dran war, waere uebersprungen
 * worden.
 */
export function entferneTeilnehmer(kampf: Kampf, teilnehmerId: string): Kampf {
  const index = kampf.teilnehmer.findIndex((eintrag) => eintrag.id === teilnehmerId);
  if (index < 0) return kampf;
  const teilnehmer = kampf.teilnehmer.filter((eintrag) => eintrag.id !== teilnehmerId);
  let amZug = kampf.amZug;
  if (index < kampf.amZug) amZug -= 1;
  if (amZug >= teilnehmer.length) amZug = teilnehmer.length === 0 ? -1 : 0;
  return { ...kampf, teilnehmer, amZug };
}

/**
 * Fuegt einen Teilnehmer in den laufenden Kampf ein — an der Stelle, an die
 * seine Initiative gehoert.
 *
 * Neu Hinzugekommene ans Ende zu haengen waere einfacher und falsch: mitten
 * im Kampf soll die Reihenfolge stimmen, ohne dass jemand neu sortiert.
 */
export function fuegeEin(kampf: Kampf, neu: Teilnehmer): Kampf {
  if (!kampf.laeuft) {
    return { ...kampf, teilnehmer: [...kampf.teilnehmer, neu] };
  }
  const dran = kampf.amZug >= 0 ? kampf.teilnehmer[kampf.amZug] : null;
  const teilnehmer = reihenfolge([...kampf.teilnehmer, neu]);
  const amZug = dran ? teilnehmer.findIndex((eintrag) => eintrag.id === dran.id) : kampf.amZug;
  return { ...kampf, teilnehmer, amZug };
}
