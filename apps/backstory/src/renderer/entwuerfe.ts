/**
 * Die Rechenregeln fuer beiseitegelegte Entwuerfe.
 *
 * Getrennt von der Komponente, damit sie ohne Oberflaeche pruefbar sind: hier
 * entscheidet sich, ob ungespeicherter Text erhalten bleibt, und das gehoert
 * geprueft statt ausprobiert.
 */
import { rewriteWikiLinks } from '../shared/wikilinks';
import type { Note } from '../shared/types';

/**
 * Eine beiseitegelegte, ungespeicherte Notiz mitsamt ihrer Kampagne.
 *
 * Die Kampagne ist kein Beiwerk: wer in Kampagne A tippt, zu B wechselt und
 * dann speichert, bekaeme die Notiz aus A sonst in die Kampagne B
 * geschrieben — die gerade offene ist nicht mehr die, aus der sie stammt.
 */
export interface Entwurf {
  readonly notiz: Note;
  readonly campaignId: string;
}

/**
 * Zieht eine Umbenennung durch alle Entwuerfe derselben Kampagne.
 *
 * Das Umbenennen einer Notiz zieht die [[Links]] in den *Dateien* mit. Einen
 * Entwurf im Arbeitsspeicher erreicht es nicht — und der wuerde beim
 * Speichern den alten Namen zurueckschreiben und den Link damit tot machen.
 * Auffallen wuerde das niemandem: unmittelbar nach dem Umbenennen sieht alles
 * richtig aus, kaputt geht es erst beim Speichern der anderen Notiz.
 *
 * Gibt die unveraenderte Sammlung zurueck, wenn nichts zu tun war — so
 * loest ein Umbenennen ohne betroffene Entwuerfe kein Neuzeichnen aus.
 */
export function zieheUmbenennungNach(
  entwuerfe: ReadonlyMap<string, Entwurf>,
  campaignId: string,
  alterTitel: string,
  neuerTitel: string
): ReadonlyMap<string, Entwurf> {
  if (alterTitel === neuerTitel) return entwuerfe;

  let geaendert = false;
  const naechste = new Map(entwuerfe);
  for (const [id, entwurf] of entwuerfe) {
    if (entwurf.campaignId !== campaignId) continue;
    const body = rewriteWikiLinks(entwurf.notiz.body, alterTitel, neuerTitel);
    if (body === entwurf.notiz.body) continue;
    naechste.set(id, { ...entwurf, notiz: { ...entwurf.notiz, body } });
    geaendert = true;
  }
  return geaendert ? naechste : entwuerfe;
}

/**
 * Der Stand, den die Person vor sich hat: die Notizen von der Platte, wo
 * vorhanden durch ihren Entwurf ersetzt.
 *
 * `offen` ist die gerade bearbeitete Notiz, falls sie ungespeicherte
 * Aenderungen hat. Sie steht *nicht* im Entwurfsspeicher — dort landet sie
 * erst beim Wechsel —, gehoert aber genauso in die Liste, sonst zeigte diese
 * beim Tippen eines neuen Titels weiter den alten.
 */
export function effektiverStand(
  notizen: Note[],
  entwuerfe: ReadonlyMap<string, Entwurf>,
  campaignId: string | null,
  offen: Note | null
): Note[] {
  // Gibt dieselbe Liste zurueck, wenn nichts zu ueberlagern ist — die
  // Referenz bleibt gleich, und nachgelagerte Berechnungen (der Index) rechnen
  // nicht ohne Grund neu.
  if (entwuerfe.size === 0 && !offen) return notizen;
  return notizen.map((notiz) => {
    if (offen && notiz.id === offen.id) return offen;
    const entwurf = entwuerfe.get(notiz.id);
    // Notiz-IDs sind kampagnenweit eindeutig, der Speicher haelt aber
    // Entwuerfe aus allen offenen Kampagnen.
    return entwurf && entwurf.campaignId === campaignId ? entwurf.notiz : notiz;
  });
}
