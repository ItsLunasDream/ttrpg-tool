/**
 * Die Bruecke vom Monster dieses Werkzeugs zum JSON, das Foundry liest.
 *
 * Duenn mit Absicht: das Umwandeln selbst steht in `@suite/foundry`, damit
 * es nur einmal existiert und dort gegen echte Exporte geprueft ist. Hier
 * steht allein, welches unserer Felder welchem dortigen entspricht.
 */
import { alsFoundryMonster, dateiname, kennung } from '@suite/foundry';
import type { AngriffEingabe, MonsterEingabe } from '@suite/foundry';
import type { Monster } from './erzeuge';
import { schadensartName } from './schadensarten';
import { waffe } from './angriffe';

/**
 * Unsere Themen auf die Wesensarten von dnd5e.
 *
 * Eins zu eins bis auf die Namen: unsere Themen SIND die Wesensarten, sie
 * heissen nur deutsch. Ein Thema ohne Eintrag hier bekommt „humanoid" —
 * lieber die haeufigste Art als ein leeres Feld, das in Foundry rot
 * angestrichen wird.
 */
const ART_NACH_THEMA: Readonly<Record<string, string>> = {
  untot: 'undead',
  bestie: 'beast',
  konstrukt: 'construct',
  aberration: 'aberration',
  elementar: 'elemental',
  unhold: 'fiend',
  fee: 'fey',
  drache: 'dragon',
  humanoid: 'humanoid',
  pflanze: 'plant'
};

/** Die englischen Namen unserer Schadensarten sind die Kennungen von dnd5e. */
const alsSchadensart = (id: string) => schadensartName(id, 'en').toLowerCase();

export function alsFoundryEingabe(monster: Monster): MonsterEingabe {
  return {
    name: monster.name,
    cr: monster.cr,
    tp: monster.werte.tp,
    rk: monster.werte.rk,
    attribute: monster.attribute,
    hauptattribut: monster.hauptattribut,
    gangarten: monster.bewegung.gangarten.map((g) => ({ art: g.art, fuss: g.fuss })),
    artEnglisch: ART_NACH_THEMA[monster.themaId] ?? 'humanoid',
    widerstaende: {
      resistenzen: monster.widerstaende.resistenzen.map(alsSchadensart),
      immunitaeten: monster.widerstaende.immunitaeten.map(alsSchadensart),
      verwundbarkeiten: monster.widerstaende.verwundbarkeiten.map(alsSchadensart)
    },
    faehigkeiten: monster.faehigkeiten.map((f) => ({ name: f.name, text: f.text })),
    angriffe: monster.angriffe.map(alsAngriff),
    satz: monster.satz
  };
}

function alsAngriff(angriff: Monster['angriffe'][number]): AngriffEingabe {
  const gewaehlte = waffe(angriff.waffeId);
  return {
    // Der Name der Waffe auf Englisch: Foundry ist englisch, und ein
    // „Großaxt" mitten in einem englischen Statblock sieht aus wie ein
    // Fehler. Fehlt die Waffe in der Tabelle, bleibt die Kennung — sichtbar
    // falsch ist besser als leer.
    name: gewaehlte ? gewaehlte.name.en : angriff.waffeId,
    art: angriff.art,
    wuerfel: angriff.wuerfel,
    schadensart: alsSchadensart(angriff.schadensartId),
    reichweite: gewaehlte?.reichweite,
    weite: gewaehlte?.weite,
    anzahl: angriff.anzahl
  };
}

/**
 * Die fertige Datei: Inhalt und der Name, den Foundry selbst vergeben wuerde.
 *
 * Der Zufall kommt herein, damit ein Test dieselbe Datei zweimal erzeugen
 * kann — die Kennungen darin sind sonst bei jedem Aufruf andere.
 */
export function alsFoundryDatei(
  monster: Monster,
  rng: () => number
): { readonly name: string; readonly inhalt: string } {
  const akteur = alsFoundryMonster(alsFoundryEingabe(monster), rng);
  return {
    name: dateiname('Actor', monster.name, kennung(rng)),
    // Zwei Leerzeichen eingerueckt wie in den echten Exporten: wer die Datei
    // aufmacht, soll etwas lesen koennen.
    inhalt: `${JSON.stringify(akteur, null, 2)}\n`
  };
}
