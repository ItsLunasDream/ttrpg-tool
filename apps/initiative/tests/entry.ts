// Sammelpunkt fuer die Tests: buendelt die reinen Logikmodule ohne Electron
// und ohne Oberflaeche.
export {
  leererKampf,
  neuerTeilnehmer,
  neuerKoerper,
  reihenfolge,
  istAktiv,
  beginne,
  naechsterZug,
  aendereHp,
  setzeHp,
  dupliziere,
  naechsterName,
  setzeGruppengroesse,
  setzeZustand,
  entferneZustand,
  entferneTeilnehmer,
  fuegeEin,
  neueId
} from '../src/shared/kampf';
export {
  schreibeBegegnung,
  leseBegegnung,
  zuId,
  istGueltigeId
} from '../src/shared/format';
