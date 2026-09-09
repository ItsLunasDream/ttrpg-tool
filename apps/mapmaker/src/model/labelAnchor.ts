/**
 * Beschriftungen, die an einem Objekt hängen.
 *
 * **Warum nur eine Kennung und kein Abstand.** Eine Beschriftung mit
 * gespeichertem Versatz hätte ihren Ort zweimal — einmal als eigene Koordinate,
 * einmal als Abstand zum Bezugsobjekt. Die beiden laufen auseinander, sobald
 * jemand die Beschriftung allein anfasst, und dann muss entschieden werden,
 * welche der beiden Wahrheiten gilt. Hier gibt es nur eine: die Beschriftung hat
 * eigene Koordinaten wie jedes andere Objekt, und beim Verschieben des
 * Bezugsobjekts wird sie um denselben Betrag mitgenommen.
 *
 * Daraus folgt, dass die Verknüpfung nicht im Renderer wirkt, sondern in der
 * Auswahl: wer das Objekt anfasst, fasst die Beschriftung mit an. Verschieben,
 * Drehen und Löschen laufen dann über dieselben Befehle wie sonst, und
 * Rückgängig funktioniert ohne Sonderfall.
 */

import type { MapDocument, MapObject, ObjectId, TextObject } from './types';

/** Ist das Objekt eine Beschriftung mit Anschluss? */
export function isAnchoredLabel(o: MapObject | undefined): o is TextObject {
  return !!o && o.kind === 'text' && !!o.anchorId;
}

/** Das Bezugsobjekt einer Beschriftung, falls es (noch) existiert. */
export function anchorTarget(doc: MapDocument, label: TextObject): MapObject | null {
  if (!label.anchorId || label.anchorId === label.id) return null;
  return doc.objects[label.anchorId] ?? null;
}

/**
 * Die Beschriftungen, die an einem der Objekte hängen.
 *
 * Als Fixpunkt gerechnet: eine Beschriftung kann selbst Bezugsobjekt einer
 * weiteren sein. Der Besuchsvermerk hält auch einen Ring auf, den jemand über
 * die Datei hereinträgt — ohne ihn liefe die Suche endlos.
 */
export function anchoredLabels(doc: MapDocument, ids: Iterable<ObjectId>): ObjectId[] {
  const gesehen = new Set<ObjectId>(ids);
  const offen = [...gesehen];
  const out: ObjectId[] = [];

  while (offen.length > 0) {
    const wirt = offen.pop()!;
    for (const o of Object.values(doc.objects)) {
      if (o.kind !== 'text' || o.anchorId !== wirt) continue;
      if (gesehen.has(o.id)) continue;
      gesehen.add(o.id);
      out.push(o.id);
      offen.push(o.id);
    }
  }
  return out;
}

/** Die Objekte samt ihrer Beschriftungen. */
export function withAnchoredLabels(doc: MapDocument, ids: ObjectId[]): ObjectId[] {
  const dazu = anchoredLabels(doc, ids);
  return dazu.length === 0 ? ids : [...ids, ...dazu];
}

/**
 * Darf `label` an `ziel` gehängt werden?
 *
 * Nicht an sich selbst und nicht an etwas, das schon (über Ecken) an ihm hängt —
 * sonst zöge jedes Verschieben das andere hinterher und zurück.
 */
export function canAnchor(doc: MapDocument, labelId: ObjectId, zielId: ObjectId): boolean {
  if (labelId === zielId) return false;
  const label = doc.objects[labelId];
  const ziel = doc.objects[zielId];
  if (!label || label.kind !== 'text' || !ziel) return false;
  return !anchoredLabels(doc, [labelId]).includes(zielId);
}
