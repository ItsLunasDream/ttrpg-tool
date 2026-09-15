/**
 * Die Farben der Notiztypen im Beziehungsnetz.
 *
 * Steht in `shared`, weil beide Seiten sie brauchen: die Oberflaeche
 * zeichnet den Graphen damit, der Hauptprozess das Bild fuer das PDF. Zwei
 * Listen an zwei Orten waeren dieselbe Sache in zwei Wahrheiten — und im
 * Ausdruck haette eine Figur dann eine andere Farbe als am Bildschirm.
 *
 * Die Reihenfolge entscheidet: der erste Notiztyp bekommt die erste Farbe.
 * Damit haengt die Farbe an der Stelle in den Typen einer Kampagne und nicht
 * an ihrer Kennung — eigene Typen bekommen so von selbst eine.
 */
export const TYP_FARBEN = ['#c4a35a', '#8ec3e0', '#a3c48b', '#d98a7c', '#b39ddb', '#7fb3a8'] as const;

/** Die Farbe eines Notiztyps, nach seiner Stelle in der Typenliste. */
export function typFarbe(typen: readonly { id: string }[], typId: string): string {
  const stelle = typen.findIndex((def) => def.id === typId);
  return TYP_FARBEN[(stelle === -1 ? typen.length : stelle) % TYP_FARBEN.length];
}
