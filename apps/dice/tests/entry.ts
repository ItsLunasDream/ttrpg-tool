// Sammelpunkt fuer die Tests: buendelt die reinen Logikmodule ohne Oberflaeche.
export {
  setzeAnzahl,
  aendereAnzahl,
  anzahlGesamt,
  alsAusdruck,
  wuerfle,
  MAX_PRO_ART,
  MAX_MODIFIKATOR,
  begrenzeModifikator
} from '../src/shared/pool';
export { FORMEN, ARTEN, SEITEN, artName, seitenVon } from '../src/shared/formen';
export { zahlenFarbe, bereinige, STANDARD, MUSTER } from '../src/shared/einstellungen';
export {
  BESCHRIFTETE,
  istBeschriftet,
  ziffernPaare,
  ordneZiffernZu,
  pruefeBeschriftung
} from '../src/shared/beschriftung';
// Zieht three ins Testbuendel. Das ist gewollt: die Flaechen kommen aus der
// Geometrie, und eine Tabelle zu pruefen, die man von Hand danebengeschrieben
// hat, pruefte das Falsche.
export { baueKoerper, gegenueberliegende, flaechenVon, trapezoeder, eckenVon } from '../src/renderer/wuerfel3d/koerper';
export {
  wirf,
  koerperVorrat,
  obenLiegendeFlaeche,
  abgeleseneFlaeche,
  setzeErgebnisAufFlaeche,
  pruefeUmnummerierung,
  SCHRITT
} from '../src/renderer/wuerfel3d/wurf';
