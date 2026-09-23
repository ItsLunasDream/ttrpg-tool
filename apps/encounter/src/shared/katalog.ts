/**
 * Der Monsterkatalog: die offiziellen Monster aus dem SRD und die eigenen aus
 * dem Monster Creator in einer Liste, mit Filtern und Sortierung.
 *
 * Eine Liste und nicht zwei: wer eine Begegnung baut, sucht „etwas mit Grad 3,
 * das fliegt", nicht „etwas aus Ordner A". Woher ein Monster kommt, ist ein
 * Filter und eine Marke an der Zeile.
 *
 * Plattformfrei, damit die Tests ohne Electron laufen.
 */
import { KREATURENTYPEN, SRD_MONSTER, type Kreaturentyp } from '@suite/srd/monster';
import { gradAlsZahl } from './schwierigkeit';
import type { Monsterkarte } from './monsterliste';

export type Quelle = 'srd' | 'eigen';

/** Vor die Kennung eines SRD-Monsters, damit sie nie mit einer eigenen zusammenfaellt. */
export const SRD_PRAEFIX = 'srd:';

export interface Katalogkarte extends Monsterkarte {
  readonly quelle: Quelle;
  /** Leer, wenn unbekannt (eigene Monster tragen keinen Typ). */
  readonly typ: Kreaturentyp | '';
  readonly legendaer: boolean;
  /** Der Initiativezuschlag, wo das Dokument ihn nennt. */
  readonly ini: number | null;
}

export type Sprache = 'de' | 'en';

export function srdKarten(sprache: Sprache): Katalogkarte[] {
  return SRD_MONSTER.map((m) => ({
    id: SRD_PRAEFIX + m.id,
    name: m.name[sprache],
    cr: m.hg,
    tp: m.tp,
    rk: m.rk,
    ge: m.attribute[1] ?? 10,
    themaId: '',
    rolleId: '',
    quelle: 'srd' as const,
    typ: m.typ,
    legendaer: m.legendaer,
    ini: m.initiative
  }));
}

export function eigeneKarten(monster: readonly Monsterkarte[]): Katalogkarte[] {
  return monster.map((m) => ({ ...m, quelle: 'eigen' as const, typ: '', legendaer: false, ini: null }));
}

export function typName(typ: Kreaturentyp | '', sprache: Sprache): string {
  return typ ? KREATURENTYPEN[typ][sprache] : '';
}

export interface Filter {
  readonly suche: string;
  readonly quelle: 'alle' | Quelle;
  readonly typ: Kreaturentyp | '';
  /** Grenzen als Zahl (1/4 = 0.25); `null` heisst offen. */
  readonly hgVon: number | null;
  readonly hgBis: number | null;
  readonly nurLegendaer: boolean;
}

export const LEERER_FILTER: Filter = {
  suche: '',
  quelle: 'alle',
  typ: '',
  hgVon: null,
  hgBis: null,
  nurLegendaer: false
};

export type Spalte = 'name' | 'typ' | 'hg' | 'tp' | 'rk';

export interface Sortierung {
  readonly spalte: Spalte;
  readonly absteigend: boolean;
}

function schluessel(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss');
}

export function filtere(
  karten: readonly Katalogkarte[],
  filter: Filter,
  sortierung: Sortierung,
  sprache: Sprache
): Katalogkarte[] {
  const worte = schluessel(filter.suche).split(/\s+/).filter(Boolean);
  const gefunden = karten.filter((k) => {
    if (filter.quelle !== 'alle' && k.quelle !== filter.quelle) return false;
    if (filter.typ && k.typ !== filter.typ) return false;
    if (filter.nurLegendaer && !k.legendaer) return false;
    const grad = gradAlsZahl(k.cr);
    if (filter.hgVon !== null && (grad === null || grad < filter.hgVon)) return false;
    if (filter.hgBis !== null && (grad === null || grad > filter.hgBis)) return false;
    if (worte.length > 0) {
      const heu = schluessel(`${k.name} ${typName(k.typ, sprache)} ${k.themaId} ${k.rolleId}`);
      if (!worte.every((w) => heu.includes(w))) return false;
    }
    return true;
  });

  const wert = (k: Katalogkarte): number | string => {
    switch (sortierung.spalte) {
      case 'hg':
        return gradAlsZahl(k.cr) ?? -1;
      case 'tp':
        return k.tp;
      case 'rk':
        return k.rk;
      case 'typ':
        return typName(k.typ, sprache);
      default:
        return k.name;
    }
  };
  const richtung = sortierung.absteigend ? -1 : 1;
  return gefunden.sort((a, b) => {
    const x = wert(a);
    const y = wert(b);
    const vergleich =
      typeof x === 'number' && typeof y === 'number'
        ? x - y
        : String(x).localeCompare(String(y), sprache);
    // Bei Gleichstand nach Namen, damit die Reihenfolge nicht springt.
    return vergleich * richtung || a.name.localeCompare(b.name, sprache);
  });
}

/** Die Grade, die man im Filter waehlen kann — so wie das Dokument sie schreibt. */
export const GRADE: readonly string[] = [
  '0', '1/8', '1/4', '1/2',
  ...Array.from({ length: 30 }, (_, i) => String(i + 1))
];
