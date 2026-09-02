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
npm run smoke     # Rauchtest der gebauten App
npm run roundtrip # prüft, ob Speichern am Markdown etwas verändert
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
| In der Notiz suchen und ersetzen | Strg+F |
| Zwischen Fundstellen springen | F3 und Umschalt+F3, oder die Pfeile über dem Editor |
| Kampagne sichern | Menü „Kampagne" → „Als ZIP sichern" |
| Steckbrief anpassen | Menü „Kampagne" → „Notiztypen" |
| Tastenkürzel nachsehen | „Hilfe" in der Kopfzeile |
| Sprache wechseln | Einstellungen → Sprache |
| Bildgröße ändern | Bild anklicken, dann 200 / 400 / 100% in der Werkzeugleiste |
| Bild einfügen | Knopf ▣ in der Werkzeugleiste, oder Bild in den Text ziehen bzw. einfügen |
| Assistent fragen | Sidebar im Editor, Einstellungen → Assistent |
| Ungenutzte Bilder löschen | Menü „Kampagne" → „Aufräumen" |
| Beziehungsnetz ansehen | „Graph" in der Kopfzeile |
| Vorschläge zum Weiterschreiben | „Schreibhilfe" in der Kopfzeile des Editors |
| Notiz exportieren | „MD" oder „PDF" in der Kopfzeile des Editors |
| Kampagne exportieren | Menü „Kampagne" → Export |
| Alten Stand zurückholen | „Verlauf" in der Kopfzeile des Editors |
| Portrait setzen | Bild auf das Portrait-Feld im Steckbrief ziehen, oder „Bild wählen" |

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
      assets/                Bilder der Kampagne
      history/<noteId>/      Frühere Stände der Notiz, gleiches Format
  writing-prompts.json     Vorschläge der Schreibhilfe, frei bearbeitbar
```

Notizen sind gewöhnliches Markdown mit YAML-Kopf. Sie lassen sich mit jedem
Texteditor oder in Obsidian öffnen, das Tool ist keine Einbahnstraße. Eigene
Angaben im YAML-Kopf, die das Tool nicht kennt, bleiben beim Speichern
erhalten.

Eine Markdown-Datei, die man selbst in `notes/` ablegt, wird mitgelesen. Fehlt
der YAML-Kopf, dient die erste Überschrift als Titel. Der Dateiname wird zur
ID und darf deshalb nur Buchstaben, Ziffern, `-` und `_` enthalten; andere
Dateien meldet die Notizliste als nicht lesbar.

Die Anwendung läuft nur einmal. Ein zweiter Start holt das vorhandene Fenster
nach vorn, statt ein zweites Fenster auf denselben Speicherort zu öffnen.

Jede Datei trägt eine `schemaVersion`, damit spätere Formatänderungen migriert
werden können.

## Modell

**Kampagne** ist ein echter Container. Eine Notiz gehört zu genau einer
Kampagne und ist nur innerhalb dieser verlinkbar.

**Notiztypen** sind gleichberechtigt und schema-getrieben. Das Schema ist
kein Code, sondern gehört der Kampagne: es liegt in `campaign.json` und wird
über Menü „Kampagne" → „Notiztypen" bearbeitet. Typen und Felder lassen sich
anlegen, umbenennen, umsortieren und entfernen. Feldarten sind Text,
mehrzeilig, Zahl, Link, Bild, Auswahlliste, Datum und Ankreuzfeld.
`src/shared/noteTypes.ts` liefert nur noch die Vorlage für neue Kampagnen.

Zwei Regeln schützen dabei bestehende Daten. Der Schlüssel eines Felds bleibt
beim Umbenennen der Beschriftung unverändert, sonst gingen eingetragene Werte
verloren. Und ein entferntes Feld löscht keine Werte: sie bleiben in der
Notizdatei und erscheinen wieder, wenn das Feld zurückgeholt wird.

**Eingefügter Text** wird als Markdown gelesen: aus `**fett**` wird fetter
Text, aus einer eingefügten Tabelle eine Tabelle. Wer aus dem Editor selbst
oder aus einem Browser kopiert, bringt die Formatierung ohnehin schon mit; nur
reiner Text geht durch den Markdown-Leser.

**Tabellen** gibt es über den Knopf ▦ in der Werkzeugleiste. Steht der
Cursor in einer Tabelle, erscheinen Knöpfe für Zeilen und Spalten. In der
Datei stehen sie als gewöhnliche Markdown-Tabelle.

**Links ins Netz** stehen als `[Text](https://…)`. Setzen über den Knopf in
der Werkzeugleiste oder indem man eine Adresse über markierten Text einfügt.
Strg+Klick öffnet sie im Systembrowser.

**Wiki-Links** stehen als `[[Titel]]` bzw. `[[Titel|Anzeigetext]]` im Klartext.
Beim Umbenennen einer Notiz werden alle Vorkommen in der Kampagne mitgezogen,
Links gehen also durch Umbenennen nicht verloren.

**Bilder** werden in den `assets`-Ordner der Kampagne kopiert, nicht
verlinkt. Damit bleibt eine Kampagne vollständig und als ZIP sicherbar. Im
Markdown steht ein relativer Verweis `![](assets/x.png)`, damit die Dateien
auch außerhalb des Tools lesbar bleiben. Angezeigt werden sie über ein eigenes
Protokoll `backstory-asset://`, das ausschließlich aus dem `assets`-Ordner der
jeweiligen Kampagne liefert; der Renderer behält keinen direkten Dateizugriff.

**Der KI-Assistent** ist optional und abschaltbar. Er sitzt in der Sidebar des
Editors und stellt Fragen, prüft gegen verlinkte Notizen und gibt
Stilrückmeldung. Er schreibt nichts in den Text: das ist in der
Systemanweisung festgeschrieben und dadurch, dass die Antwort nur in der
Sidebar erscheint. Anbieter sind Ollama (lokal, kostenlos) oder die Claude API
(kostenpflichtig), hinter einem gemeinsamen Interface in `src/main/ai/`.

Alle Netzaufrufe laufen im Hauptprozess. Der API-Schlüssel wird mit dem
Schlüsselbund des Systems verschlüsselt und erreicht den Renderer nie.

**Versionsverlauf** sichert den vorherigen Stand, bevor eine Notiz
überschrieben wird, höchstens aber alle fünf Minuten. Ohne diese Sperre würde
der Autosave im Sekundentakt hunderte fast gleicher Stände anlegen. Beim
Wiederherstellen wandert der aktuelle Stand vorher in den Verlauf, das
Zurückholen ist also selbst umkehrbar.

**Sprache** ist umschaltbar zwischen Deutsch und Englisch. Alle festen Texte
liegen in `src/shared/i18n.ts`, auch die Fehlermeldungen des Hauptprozesses:
`VaultError` trägt einen Schlüssel, übersetzt wird erst in der IPC-Schicht.
Selbst vergebene Bezeichnungen wie eigene Notiztypen und Feldnamen bleiben
unverändert, die kann das Programm nicht übersetzen.

**Beziehungen** hängen am Notizpaar, nicht an der einzelnen Textstelle, und
sind gerichtet: A sieht B als Mentorin, B sieht A als Bedrohung. Sie werden im
Beziehungs-Panel gepflegt, nicht in der Link-Syntax. Der Fließtext bleibt so
frei von Metadaten, und eine Beziehung wird nur einmal gepflegt, egal wie oft
die Notiz im Text vorkommt. Dieses Modell ist gleichzeitig die Datenbasis für
die Graph-Ansicht in Phase 3.

## Aufbau

```
src/shared/     Datenmodell, Notiztyp-Vorlage, Wiki-Link-Parsing, Texte
src/main/       Electron-Hauptprozess: Dateisystem, IPC, Export, KI-Anbindung
src/preload/    Einzige Brücke zum Renderer (contextIsolation aktiv)
src/renderer/   React-Oberfläche, TipTap-Editor, Notizindex, Graph
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
- Bilder im Fließtext und als Portrait im Steckbrief, in die Kampagne kopiert
- Aliase, Tags, Wortzähler
- Volltextsuche mit hervorgehobener Fundstelle in der Liste und im Text,
  Sprung zwischen den Fundstellen per F3 und Umschalt+F3
- Gerichtete Beziehungen und Backlinks
- Oberfläche auf Deutsch oder Englisch, umschaltbar ohne Neustart
- Versionsverlauf mit Vorschau und Wiederherstellen, abschaltbar
- Export als Markdown und als PDF, je Notiz oder für die ganze Kampagne
- Schreibhilfe mit Vorschlagslisten, ohne KI und frei bearbeitbar
- Graph-Ansicht des Beziehungsnetzes mit Zoom und Filter nach Notiztyp
- KI-Assistent in der Sidebar, wahlweise über Ollama (lokal) oder die Claude
  API, abschaltbar und austauschbar
- Autosave (abschaltbar) und Strg+S

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

## Markdown-Rundlauf

`scripts/roundtrip.cjs` legt Notizen mit verschiedenen Markdown-Bestandteilen
hinter dem Rücken der Anwendung an, lässt sie laden, ändert eine Kleinigkeit,
speichert und vergleicht die Datei.

Die Tests der Kernlogik prüfen nur die Umwandlung Markdown ↔ HTML. Ob das
Schema des Editors ein Element überhaupt kennt, sehen sie nicht: kennt es das
Element nicht, fällt es beim Laden weg und ist nach dem nächsten Speichern
verloren. Genau so gingen früher Tabellen, Links und Überschriften ab der
vierten Ebene verloren.

```bash
npm run roundtrip
```

Beide Tests laufen auch in der CI.
