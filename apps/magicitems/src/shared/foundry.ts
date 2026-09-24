/**
 * Die Bruecke vom Gegenstand dieses Werkzeugs zum JSON, das Foundry liest.
 * Das Umwandeln steht in `@suite/foundry` und ist dort gegen echte Exporte
 * geprueft; hier steht nur, welches Feld welchem entspricht.
 */
import { alsFoundryGegenstand, dateiname, kennung } from '@suite/foundry';
import type { Gegenstand } from './erzeuge';

export function alsFoundryDatei(g: Gegenstand, zufall: () => number = Math.random): { name: string; inhalt: string } {
  const item = alsFoundryGegenstand({
    name: g.name,
    art: g.art,
    seltenheit: g.seltenheit,
    einstimmung: g.einstimmung,
    wirkungen: g.wirkungen,
    fluch: g.fluch,
    wert: g.wert,
    notiz: g.notiz
  });
  return { name: dateiname('Item', g.name, kennung(zufall)), inhalt: `${JSON.stringify(item, null, 2)}\n` };
}
