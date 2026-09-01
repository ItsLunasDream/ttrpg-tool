# Backstory Creator

Desktop-Tool zum Schreiben von D&D-Charakter-Backstorys. Rich-Text-Editor,
Wiki-Verlinkung zwischen Notizen, strukturierte Steckbrieffelder und gerichtete
Beziehungen, alles lokal als Markdown auf der eigenen Platte.

## Starten

```bash
npm install
npm run dev     # Entwicklungsmodus mit Hot Reload
npm start       # Produktionsbuild starten
npm test        # Tests der Kernlogik
npm run typecheck
```

## Bedienung

| Aktion | So geht's |
| --- | --- |
| Notiz verlinken | `[[` tippen, aus der Vorschlagsliste wählen |
| Neue Notiz aus einem Link | `[[` tippen, Namen eingeben, „neu anlegen" wählen |
| Verlinkte Notiz öffnen | Strg (bzw. Cmd) halten und auf den Link klicken |
| Kurzinfo ansehen | Mit der Maus über den Link fahren |
| Speichern | Strg+S, oder Autosave laufen lassen |
| Kampagne sichern | „Als ZIP sichern" in der Kopfzeile |

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

**Notiztypen** (Charakter, Ort, Fraktion, Ereignis) sind gleichberechtigt und
schema-getrieben: die Feldlisten stehen in `src/shared/noteTypes.ts`, das
Formular wird daraus gerendert. Ein neues Feld ist ein Listeneintrag, keine
Komponentenänderung.

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
- Notiztypen Charakter, Ort, Fraktion, Ereignis mit eigenen Feldern
- Rich-Text-Editor auf TipTap, gespeichert als Markdown
- `[[Wiki-Links]]` mit Autocomplete, Kurzinfo-Karte, offenen Links
- Aliase, Tags, Volltextsuche, Wortzähler
- Gerichtete Beziehungen und Backlinks
- Autosave (abschaltbar) und Strg+S

Phase 2: Bilder pro Notiz, Versionsverlauf, Export als PDF und Markdown,
Options-Listen als Schreibhilfe ohne KI.

Phase 3: Graph-Ansicht des Beziehungsnetzes.

Phase 4: KI-Sidebar hinter einem austauschbaren Provider-Interface
(Ollama lokal oder Claude API), als Rückfrage- und Konsistenzhilfe, nicht als
Textgenerator.

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
