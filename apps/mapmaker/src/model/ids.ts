/** Kurze, kollisionsarme Ids. Lesbarer als UUIDs in Projektdateien und Diffs. */

let counter = 0;

export function makeId(prefix: string): string {
  counter = (counter + 1) % 0xffff;
  const rand = Math.floor(Math.random() * 0xffffff).toString(36);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}
