# Backstory Creator

Desktop-Tool zum Schreiben von D&D-Charakter-Backstorys. Rich-Text-Editor,
Wiki-Verlinkung zwischen Notizen, strukturierte Steckbrieffelder und gerichtete
Beziehungen, alles lokal als Markdown auf der eigenen Platte.

## Fertige Anwendung herunterladen

Du brauchst dafür weder Node noch npm.

1. Auf GitHub den Reiter **Actions** öffnen
2. Den obersten Lauf **Build** anklicken
3. Unten unter **Artifacts** `backstory-creator-windows` herunterladen
4. Die ZIP-Datei entpacken. Darin liegen zwei Dateien:
   - `BackstoryCreator-Setup-<version>.exe` — Installer, legt Startmenü- und
     Desktopeintrag an
   - `BackstoryCreator-portable-<version>.exe` — läuft ohne Installation direkt

Windows zeigt beim ersten Start eine SmartScreen-Warnung, weil die Datei nicht
signiert ist. Über „Weitere Informationen" → „Trotzdem ausführen" startet sie.
Eine Signatur bräuchte ein kostenpflichtiges Zertifikat.

Artefakte werden 90 Tage aufbewahrt. Wer ein dauerhaftes Download-Ziel will,
legt auf GitHub ein Release an, dann hängt der Workflow die Dateien dort an.

## Selbst bauen

Nur nötig, wenn du am Code arbeiten willst.

### Starten

**Wichtig:** Alle Befehle müssen im Projektordner laufen, nicht im
Benutzerordner. Sonst meldet npm `Could not read package.json`. Wechsle vorher
mit `cd` in den Ordner, in dem diese README liegt.

```bash
cd Pfad\zum\Projektordner
npm install
npm run dev       # Entwicklungsmodus mit Hot Reload
npm start         # Produktionsbuild starten
npm test          # Tests der Kernlogik
npm run typecheck
npm run dist:win  # Windows-Installer und portable exe nach release/
```

## Bedienung

| Aktion | So geht's |
| --- | --- |
| Notiz verlinken | `[[` tippen, aus der Vorschlagsliste wählen |
| Neue Notiz aus einem Link | `[[` tippen, Namen eingeben, „neu anlegen" wählen |
| Verlinkte Notiz öffnen | Strg (bzw. Cmd) halten und auf den Link klicken |
| Kurzinfo ansehen | Mit der Maus über den Link fahren |
| Speichern | Strg+S, oder Autosave laufen lassen |
| Zwischen Fundstellen springen | F3 und Umschalt+F3, oder die Pfeile über dem Editor |
| Kampagne sichern | „Als ZIP sichern" in der Kopfzeile |
| Steckbrief anpassen | „Notiztypen" in der Kopfzeile |

Links in einer anderen Farbe zeigen auf eine Notiz, die es noch nicht gibt.
Sie stehen zusätzlich im Panel „Offene Links".

## Datenablage

Standardmäßig unter dem Nutzerdatenverzeichnis der App, änderbar unter
Einstellungen → Speicherort.

```
<Speicherort>/
  campaigns/
    <campaignId>/
      campaign.json
      notes/<noteId>.md      YAML-Frontmatter + Markdown
      assets/                Bilder (Phase 2)
```

Notizen sind gewöhnliches Markdown mit YAML-Kopf. Sie lassen sich mit jedem
Texteditor oder in Obsidian öffnen, das Tool ist keine Einbahnstraße.

Jede Datei trägt eine `schemaVersion`, damit spätere Formatänderungen migriert
werden können.

## Modell

**Kampagne** ist ein echter Container. Eine Notiz gehört zu genau einer
Kampagne und ist nur innerhalb dieser verlinkbar.

**Notiztypen** sind gleichberechtigt und schema-getrieben. Das Schema ist
kein Code, sondern gehört der Kampagne: es liegt in `campaign.json` und wird
über „Notiztypen" in der Kopfzeile bearbeitet. Typen und Felder lassen sich
anlegen, umbenennen, umsortieren und entfernen.
`src/shared/noteTypes.ts` liefert nur noch die Vorlage für neue Kampagnen.

Zwei Regeln schützen dabei bestehende Daten. Der Schlüssel eines Felds bleibt
beim Umbenennen der Beschriftung unverändert, sonst gingen eingetragene Werte
verloren. Und ein entferntes Feld löscht keine Werte: sie bleiben in der
Notizdatei und erscheinen wieder, wenn das Feld zurückgeholt wird.

**Wiki-Links** stehen als `[[Titel]]` bzw. `[[Titel|Anzeigetext]]` im Klartext.
Beim Umbenennen einer Notiz werden alle Vorkommen in der Kampagne mitgezogen,
Links gehen also durch Umbenennen nicht verloren.

**Beziehungen** hängen am Notizpaar, nicht an der einzelnen Textstelle, und
sind gerichtet: A sieht B als Mentorin, B sieht A als Bedrohung. Sie werden im
Beziehungs-Panel gepflegt, nicht in der Link-Syntax. Der Fließtext bleibt so
frei von Metadaten, und eine Beziehung wird nur einmal gepflegt, egal wie oft
die Notiz im Text vorkommt. Dieses Modell ist gleichzeitig die Datenbasis für
die Graph-Ansicht in Phase 3.

## Aufbau

```
src/shared/     Datenmodell, Notiztyp-Schemata, Wiki-Link-Parsing
src/main/       Electron-Hauptprozess: Dateisystem, IPC, ZIP-Export
src/preload/    Einzige Brücke zum Renderer (contextIsolation aktiv)
src/renderer/   React-Oberfläche, TipTap-Editor, Notizindex
tests/          Tests der Kernlogik und der Vault-Schicht
```

Der Renderer hat bewusst keinen Node-Zugriff. Alle Dateioperationen laufen über
die typisierten IPC-Kanäle in `src/preload/index.ts`.

## Stand und nächste Schritte

Umgesetzt (MVP):

- Kampagnen anlegen, umbenennen, löschen, als ZIP sichern
- Notiztypen Charakter, Ort, Fraktion, Ereignis und ein freier Typ „Notiz",
  jeweils mit eigenen Steckbrieffeldern, in der App anpassbar
- Rich-Text-Editor auf TipTap, gespeichert als Markdown
- `[[Wiki-Links]]` mit Autocomplete, Kurzinfo-Karte samt Textanfang, offenen Links
- Aliase, Tags, Wortzähler
- Volltextsuche mit hervorgehobener Fundstelle in der Liste und im Text,
  Sprung zwischen den Fundstellen per F3 und Umschalt+F3
- Gerichtete Beziehungen und Backlinks
- Autosave (abschaltbar) und Strg+S

Phase 2: Bilder pro Notiz, Versionsverlauf, Export als PDF und Markdown,
Options-Listen als Schreibhilfe ohne KI.

Phase 3: Graph-Ansicht des Beziehungsnetzes.

Phase 4: KI-Sidebar hinter einem austauschbaren Provider-Interface
(Ollama lokal oder Claude API), als Rückfrage- und Konsistenzhilfe, nicht als
Textgenerator.

## Backlog

Offene Aufgaben, geplante Phasen und bekannte Grenzen stehen in
[BACKLOG.md](BACKLOG.md).

## Bekannte Grenzen

- Beim Kampagnenwechsel werden alle Notizen der Kampagne in den Speicher
  geladen. Für den vorgesehenen Umfang (einige hundert Notizen) ist das
  unkritisch, bei deutlich mehr bräuchte es einen Index statt Volllast.
- Das Umbenennen einer Notiz schreibt alle betroffenen Dateien einzeln. Ein
  Absturz mittendrin könnte einen Teil der Links auf dem alten Namen lassen.
  Die Links bleiben lesbar, aber ein ZIP-Backup vor größeren Umbenennungen
  schadet nicht.
- Mehrdeutige Namen (zwei Notizen mit gleichem Titel oder Alias) werden im
  Index erfasst, in der Oberfläche aber noch nicht gesondert angezeigt.

## Tests der Paketierung

Der Rauchtest unten laeuft gegen die ungepackte App. Fehlt eine Abhaengigkeit
erst im fertigen Installationspaket, sieht er das nicht. Dafuer gibt es
`scripts/verify-package.mjs`: das Skript startet die **gepackte** Anwendung und
prueft, dass sie ohne fehlende Module hochkommt.

```bash
npm run dist:linux:dir
xvfb-run -a npm run verify:package -- "$PWD/release/linux-unpacked/backstory-creator"
```

Unter Windows nach `npm run dist:win`:

```bash
npm run verify:package -- "release\win-unpacked\Backstory Creator.exe"
```

Beide Prüfungen laufen in der CI, bevor die Windows-Anwendung hochgeladen wird.

Hauptprozess und Preload werden komplett gebündelt (esbuild, nur `electron`
bleibt extern). Das Paket enthält deshalb gar kein `node_modules`, und es kann
keine Abhängigkeit mehr fehlen.

## Rauchtest

`scripts/smoke.cjs` startet die gebaute App, legt eine Kampagne und zwei
Notizen an, tippt einen Wiki-Link, speichert und prüft die Dateien auf der
Platte, inklusive Umbenennen mit Link-Rewrite. Unter Linux mit Xvfb:

```bash
npm run smoke
```

Unter Windows und macOS direkt ohne Xvfb:

```bash
npm run build && npx electron scripts/smoke.cjs
```
