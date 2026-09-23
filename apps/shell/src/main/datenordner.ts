/**
 * Der Datenordner ueberlebt die Umbenennung (#125: aus „TTRPG-Tools" wurde
 * „LORE").
 *
 * Electron leitet den Ordner vom Namen der App ab. Ohne diese Datei laege
 * nach dem Update alles Gespeicherte unter dem alten Namen, und die App
 * startete scheinbar leer. Deshalb: gibt es den Ordner unter dem neuen
 * Namen noch nicht, aber einen unter einem alten, bleibt es beim alten.
 * Wer neu anfaengt, bekommt den neuen.
 *
 * „Gibt es noch nicht" heisst: keine eigene Datei darin. Den leeren Ordner
 * legt Electron selbst an, bevor diese Datei laeuft.
 *
 * Muss vor allem anderen geladen werden, was den Pfad erfragt. Ein von
 * aussen gesetzter Pfad (die Rauchtests) bleibt unberuehrt.
 */
import { app } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ALTE_NAMEN = ['TTRPG-Tools', 'ttrpg-tools-shell'];
/** Was die Huelle selbst schreibt: eins davon liegt in jedem benutzten Ordner. */
const EIGENE = ['einstellungen.json', 'fenster.json'];

const benutzt = (ordner: string) => EIGENE.some((datei) => existsSync(join(ordner, datei)));

export function waehleDatenordner(): void {
  const basis = app.getPath('appData');
  const jetzt = app.getPath('userData');
  if (jetzt !== join(basis, app.getName())) return;
  if (benutzt(jetzt)) return;
  const alt = ALTE_NAMEN.map((name) => join(basis, name)).find(benutzt);
  if (alt) app.setPath('userData', alt);
}

waehleDatenordner();
