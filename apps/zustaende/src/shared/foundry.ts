/**
 * Die Bruecke vom Zustand dieses Werkzeugs zum JSON, das Foundry liest.
 *
 * Duenn mit Absicht, wie im Monster Creator: das Umwandeln steht in
 * `@suite/foundry` und ist dort gegen echte Exporte geprueft. Hier steht
 * allein, welches unserer Felder welchem dortigen entspricht.
 */
import { alsFoundryZustand, dateiname, kennung } from '@suite/foundry';
import type { ZustandEingabe } from '@suite/foundry';
import type { Zustand } from './erzeuge';
import { wirkung } from './wirkungen';
import { text, type Sprache } from './tabellen';

/**
 * Eine Wirkungskennung zu ihrem Satz.
 *
 * Kennt die Tabelle sie nicht (eine alte Datei, eine geloeschte Wirkung),
 * bleibt die Kennung stehen. Sichtbar falsch ist besser als eine Luecke, die
 * niemand bemerkt.
 */
const alsSatz = (id: string, sprache: Sprache) => {
  const gefunden = wirkung(id);
  return gefunden ? text(gefunden.text, sprache) : id;
};

export function alsFoundryEingabe(zustand: Zustand, sprache: Sprache): ZustandEingabe {
  return {
    name: zustand.name,
    kurzsatz: zustand.kurzsatz,
    stufen: zustand.stufen.map((stufe) => ({
      nummer: stufe.nummer,
      wirkungen: stufe.wirkungen.map((id) => alsSatz(id, sprache))
    })),
    dauer: zustand.dauer,
    verschlimmerung: zustand.verschlimmerung,
    linderung: zustand.linderung
  };
}

/** Die fertige Datei: Inhalt und der Name, den Foundry selbst vergeben wuerde. */
export function alsFoundryDatei(
  zustand: Zustand,
  sprache: Sprache,
  rng: () => number
): { readonly name: string; readonly inhalt: string } {
  const gegenstand = alsFoundryZustand(alsFoundryEingabe(zustand, sprache));
  return {
    name: dateiname('Item', zustand.name, kennung(rng)),
    inhalt: `${JSON.stringify(gegenstand, null, 2)}\n`
  };
}
