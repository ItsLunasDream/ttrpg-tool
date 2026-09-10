# TTRPG-Tools

Werkzeuge für Pen-&-Paper-Kampagnen, die nebeneinander in einem Fenster
laufen. Alles bleibt lokal auf der eigenen Platte.

- **Initiative Tracker** — Kampfreihenfolge, Trefferpunkte und Zustände am
  Spieltisch verfolgen. Systemneutral, mit Gruppen für Monsterhorden.
- **Würfel** — Würfelpool aus d4 bis d100 und einem eigenen Würfel
  zusammenstellen, rollen und das Ergebnis sehen. Auch mit Abzug (`1d20 − 1d4`).
- **Backstory Creator** — Figuren, Orte und ihre Beziehungen aufschreiben:
  Rich-Text-Editor, Wiki-Verlinkung zwischen Notizen, strukturierte
  Steckbrieffelder und gerichtete Beziehungen, gespeichert als Markdown.
- **TTRPG Map Editor** — Battlemaps und Weltkarten zeichnen und als Universal
  VTT exportieren.

Der Arbeitstitel der Sammlung, ihre Symbole und die Namen der einzelnen
Werkzeuge sind vorläufig.

## Fertige Anwendung herunterladen

Du brauchst dafür weder Node noch npm.

1. Auf GitHub den Reiter **Actions** öffnen
2. Den obersten Lauf **Build** anklicken
3. Unten unter **Artifacts** `ttrpg-tools-windows` herunterladen
4. Die ZIP-Datei entpacken. Darin liegen zwei Dateien:
   - `TTRPGTools-Setup-<version>.exe` — Installer, legt Startmenü- und
     Desktopeintrag an
   - `TTRPGTools-portable-<version>.exe` — läuft ohne Installation direkt

Windows zeigt beim ersten Start eine SmartScreen-Warnung, weil die Datei nicht
signiert ist. Über „Weitere Informationen" → „Trotzdem ausführen" startet sie.
Eine Signatur bräuchte ein kostenpflichtiges Zertifikat.

Artefakte werden einen Tag aufbewahrt — das spart Speicherkontingent. Wer ein
dauerhaftes Download-Ziel will, legt auf GitHub ein Release an, dann hängt der
Workflow die Dateien dort an.

## Selbst bauen

Nur nötig, wenn du am Code arbeiten willst.

### Starten

**Wichtig:** Alle Befehle müssen im Projektordner laufen, nicht im
Benutzerordner. Sonst meldet npm `Could not read package.json`. Wechsle vorher
mit `cd` in den Ordner, in dem diese README liegt.

**Nach jedem `git pull` einmal `npm install`.** Bringt ein Pull ein neues
geteiltes Paket mit, legt npm dessen Verweis in `node_modules` erst beim
nächsten Installieren an — sonst scheitert der Build an Meldungen, die den
Grund nicht nennen (`Rollup failed to resolve import`, `Cannot find module
'vitest'`). `scripts/pruefe-installation.mjs` fängt das ab und sagt es
stattdessen im Klartext; es läuft vor `dev`, `start`, `build`, `test`,
`typecheck` und den Rauchtests mit.

```bash
cd Pfad\zum\Projektordner
npm install
npm run dev             # TTRPG-Tools (die Hülle) im Entwicklungsmodus mit Hot Reload
npm start               # TTRPG-Tools, Produktionsbuild starten
npm test                # Tests der Kernlogik, über alle Workspaces
npm run smoke           # Rauchtest der gebauten Hülle
npm run typecheck
npm run dist:win        # Windows-Installer der ganzen Sammlung nach apps/shell/release/
```

Nur den Backstory Creator für sich, ohne die Hülle: `npm run dev:backstory`,
`npm run start:backstory`, `npm run smoke:backstory`, `npm run roundtrip`
(prüft, ob Speichern am Markdown etwas verändert), `npm run dist:backstory:win`
(Windows-Installer und portable exe nach `apps/backstory/release/`).

Die Paketskripte ohne Zusatz meinen immer die Sammlung, so wie `npm run dev`
und `npm start` auch: `npm run dist:win` baut TTRPG-Tools, nicht den
Backstory Creator allein. Das war einmal andersherum, und wer die Sammlung
paketieren wollte, bekam wortlos die einzelne Anwendung.

### Workspace-Aufbau

Das Repository ist ein npm-Workspace-Monorepo. Die Befehle oben laufen an der
Wurzel und delegieren an die passenden Ordner:

```
apps/backstory/    Der Backstory Creator selbst (Electron-Anwendung)
apps/shell/        TTRPG-Tools: die Hülle, in die die Werkzeuge eingebettet werden
apps/mapmaker/     TTRPG Map Editor: Kartenzeichner (Tauri-Anwendung), siehe unten
apps/initiative/   Initiative Tracker: Kampfreihenfolge am Spieltisch, siehe unten
apps/dice/         Würfel: Würfelpool zusammenstellen und rollen, siehe unten
packages/dice/     Geteiltes Paket: Würfelausdrücke lesen und werfen
packages/i18n/     Geteiltes Paket: Sprachwahl und Textersetzung
packages/motion/   Geteiltes Paket: Zeiten, Kurven und Grundanimationen der Oberfläche
```

`npm install` an der Wurzel richtet alle ein. `npm run dev`, `npm start` und
`npm run smoke` betreffen die Hülle (`apps/shell`) — sie ist der
Haupteinstieg, in ihr laufen die Werkzeuge eingebettet. Für den Backstory
Creator für sich gibt es `npm run dev:backstory`, `npm run start:backstory`,
`npm run smoke:backstory`, `npm run roundtrip`, `npm run dist:backstory:win`
und `npm run dist:backstory:linux`; für den Kartenmacher `npm run dev:mapmaker`, für den
Initiative Tracker `npm run dev:initiative`, für den Würfel `npm run
dev:dice`. `npm run build`, `npm run typecheck` und `npm test` laufen dagegen
über alle Workspaces, Apps und Pakete eingeschlossen. Ein Befehl gezielt für einen
Workspace: `npm run <skript> -w apps/backstory` bzw. `-w packages/dice`.

### TTRPG Map Editor

`apps/mapmaker` kam als eigenständiges Repository dazu (Bauabschnitt 4) und
bringt eine eigene Historie, eigene Konventionen und eine eigene `CLAUDE.md`
mit — dort steht das Eigentliche zur Anwendung. An zwei Stellen musste der
Umzug in den Workspace etwas anfassen:

- **`vite.config.ts` setzt jetzt `base: './'`.** Ohne das verweist die gebaute
  `index.html` absolut auf `/assets/…`, was unter `file://` und in einer
  eingebetteten `WebContentsView` gleichermaßen ins Leere zeigt — ein
  Prototyp hatte das vor dem Umzug an genau dieser Stelle scheitern sehen.
  Für Tauri, das sein Bündel über einen eigenen Host ausliefert, ändert sich
  dadurch nichts.
- **Die Vite-Plugins tragen eine Typ-Notlösung** (`as Plugin[]` in
  `vite.config.ts`): der Workspace teilt sich `@vitejs/plugin-react` mit
  `apps/backstory` und `apps/shell`, die auf Vite 5 stehen, während diese
  Anwendung Vite 6 benutzt. npm hält eine gemeinsame Kopie für kompatibel und
  installiert sie nur einmal — TypeScript löst deren eigene `vite`-Typen
  darum gegen die andere, ältere Installation auf. Zur Laufzeit ist das
  folgenlos, betroffen sind nur zwei einander fremde Typ-Instanzen derselben
  Struktur.

Der Rust-Anteil (`src-tauri/`, `npm run tauri:dev`/`tauri:build`) läuft
unverändert, ist aber nicht Teil der CI dieses Repositories: das bräuchte
Systembibliotheken, die dort fehlen. Ebenso noch nicht angeschlossen: der
End-to-End-Lauf unter `e2e/` (braucht einen installierten Browser) und die
`build:portable`-Variante. Alle drei funktionieren lokal unverändert, siehe
`apps/mapmaker/CLAUDE.md`.

### Initiative Tracker

`apps/initiative` verfolgt die Zugreihenfolge im Kampf. Systemneutral: ein
Eintrag hat eine Initiative, Trefferpunkte und Zustände — was die Zahlen
bedeuten, entscheidet der Tisch. Das Würfeln der Initiative (über
`packages/dice`, mit dem Feinwert als Modifikator) ist eine Zugabe, keine
Voraussetzung, und läuft nur für Gegner: Spielerfiguren würfeln am Tisch
selbst.

Die Regeln stehen in `src/shared/kampf.ts` als reine Funktionen, ohne
Oberfläche und ohne Dateien. Am Spieltisch fällt ein Fehler in der
Zugreihenfolge niemandem sofort auf, und wenn doch, lässt er sich nicht
nachstellen — er muss sich prüfen lassen, bevor er passiert.

**Gruppen** sind der Grund, warum die Trefferpunkte nicht am Eintrag hängen:
sechs Goblins würfeln *eine* Initiative und haben sechs getrennte
Trefferpunktsätze. Ein Eintrag mit einem Körper ist der Normalfall und sieht
aus wie eine einzelne Kreatur.

**Zwei Sorten Daten, bewusst verschieden behandelt:** Begegnungen sind
Dokumente (Markdown mit YAML-Kopf, der Rumpf trägt die Taktiknotiz); der
laufende Kampf ist Sitzungszustand und liegt als JSON daneben. Ihn als
Markdown zu führen hätte den Anschein erweckt, man solle ihn aufheben.

**Bilder** werden in den eigenen Ordner kopiert, nicht verlinkt: ein Verweis
irgendwohin zeigt ins Leere, sobald jemand aufräumt — und das fällt erst
mitten im Kampf auf. Der Dateiname kommt aus dem Inhalt, und `bildPfad` prüft
ihn, bevor er in einen Pfad wandert.

Bedienung: **Leertaste heißt weiter**, die eine Handlung, die hundertmal pro
Abend passiert. Schaden wird eingetippt und mit Enter angewendet, nicht über
Plus- und Minusknöpfe geklickt — Schaden ist selten eins.

### Würfel

`apps/dice` stellt einen Würfelpool zusammen und rollt ihn. Gewürfelt wird
über `packages/dice`; die Anwendung zeichnet.

**Die Form ist das Einzige, woran man eine Würfelart erkennt** — Farbe und
Muster gelten für alle gemeinsam. Deshalb sind die Umrisse nicht die
geometrisch korrekten Projektionen der Körper (ein d10 sieht von oben aus wie
ein Zehneck, ein d12 wie ein Zwölfeck — beide wären von einem Kreis kaum zu
unterscheiden), sondern die Silhouetten, die man von Würfelbildern kennt.
Drei Formen mussten nach einem Blick auf das laufende Programm geändert
werden, weil sie neben ihren Nachbarn nicht auseinanderzuhalten waren: der d6
(war ein Sechseck wie der d20), der d10 (war eine Raute wie der d8) und der
eigene Würfel (war rund wie der d100).

**Die Auswahl ist eine Zahl je Art, die negativ sein darf.** `3` beim d20 und
`-2` beim d4 heißt `3d20 - 2d4`. Linksklick auf das Symbol legt einen dazu,
Rechtsklick nimmt einen weg. Im Ausdruck steht erst, was dazugezählt wird —
sonst hieße derselbe Wurf „-2d4 + 3d20" und läse sich wie ein Fehler.

**Die Zahlenfarbe wird gerechnet, nicht eingestellt.** Die Würfelfarbe ist
frei wählbar, und auf Hellgelb ist eine weiße Zahl unlesbar. `zahlenFarbe`
nimmt die relative Leuchtdichte nach WCAG — nicht das Mittel der drei Kanäle:
Grün trägt viel mehr zur empfundenen Helligkeit bei als Blau.

**Effekte:** Glitzer beim Höchstwurf, violette Streifen bei einer 1, beide
einzeln abschaltbar. Abzugswürfel bekommen keinen — eine 4 auf dem d4 in
`1d20 - 1d4` ist die höchste Zahl und für den Wurf das schlechteste Ergebnis.
Zu jedem Effekt gehört ein ruhender Teil (goldener Schein, violetter
Schleier): laufende Funken allein sind je nach Augenblick gerade
zusammengeschnurrt, und ein Blick auf den Tisch trifft dann nichts.

Der Verlauf hält die letzten 40 Würfe **nur für diese Sitzung** und wird nicht
geschrieben — ein Wurf ist ein Ereignis am Tisch, kein Dokument.

Gemessen: 100 Würfel gleichzeitig laufen mit p50 16,7 ms, also mit vollen 60
Bildern je Sekunde (unter Xvfb ohne GPU).

### TTRPG-Tools: die Hülle

`apps/shell` ist der gemeinsame Rahmen, in dem die einzelnen Werkzeuge später
laufen sollen — ein Fenster, ein Startmenü, eine Schiene zum Wechseln. Der
Arbeitstitel und die Symbole sind vorläufig.

Aufbau: ein rahmenloses `BaseWindow`. Zuunterst liegt die Ansicht mit der Hülle
selbst über die volle Fensterfläche. Wird ein Werkzeug eingebettet, kommt dessen
Ansicht *darüber* und lässt oben und links genau so viel frei, wie Titelleiste
und Schiene brauchen — die Hülle schaut also als L-Form darunter hervor. Eine
Ansicht ist immer ein Rechteck; eine L-Form ließe sich nur aus zwei Ansichten
bauen, die dann zwei getrennte Dokumente wären.

Eingebettet wird über `apps/backstory/src/main/embed.ts` — eine Datei, die
alles kapselt, was zum Einrichten gehört, und Preload, Oberfläche und das
Sichern vor dem Schließen zurückgibt. Der eigenständige Hauptprozess des
Backstory Creators benutzt dieselbe Datei; beide Wege laufen also durch
denselben Code. Die Anwendung selbst merkt nicht, dass sie in einer Hülle
läuft.

Einmal geöffnete Anwendungen bleiben geladen und werden beim Wechseln nur
unsichtbar gestellt. Deshalb geht beim Wechseln nichts verloren: eine halb
getippte Notiz, die Scrollposition, ein offener Dialog stehen beim
Zurückkommen noch da. Der Preis ist Arbeitsspeicher, gemessen rund 130 MB je
zusätzlich geöffneter Anwendung.

Jede Anwendung läuft in einer eigenen Electron-Sitzung (`persist:<id>`). Alle
Ansichten laden über `file://`, und dort ist der Ursprung für alle derselbe —
ohne getrennte Sitzungen teilten sie sich `localStorage` und IndexedDB. Der
Karteneditor legt dort seine Prop-Bibliothek, seine Tastenbelegung und die
zuletzt geöffneten Karten ab.

Stand: der Backstory Creator und der Karteneditor laufen eingebettet.
Werkzeuge mit dem Zustand `vorbereitet` lassen sich anwählen und führen auf
eine Fläche, die sagt, dass das Einbetten noch aussteht. Was es gibt und wie
weit es ist, steht an einer Stelle: `apps/shell/src/shared/apps.ts`.

**Einstellungen und Über** sitzen in der Titelleiste. Die Sprache ist
durchgekoppelt: eine Änderung an irgendeiner Stelle — im Einstellungen-Dialog
der Hülle oder im eigenen Sprachmenü eines Werkzeugs — gilt sofort überall,
in der Hülle selbst und in jeder eingebetteten Anwendung. Der Backstory
Creator meldet einen Wechsel über einen eigenen IPC-Kanal
(`backstory:app:sprache`); der Karteneditor, der sonst kein Preload
braucht, bekommt dafür eines, das ausschließlich diese eine Kopplung trägt
(`apps/mapmaker/src/embed/preload.ts`). Die einzige Stelle, die beide
Richtungen zusammenführt, ist `aktualisiereSammlungssprache` in
`apps/shell/src/main/index.ts`.

**Direkt in einem Werkzeug starten:** `TTRPG_TOOLS_START_APP=backstory`. Das
ist auch der Weg, auf dem die Prüfung des gepackten Pakets feststellt, ob die
eingebetteten Anwendungen dort wirklich hochkommen.

#### Paket der Sammlung

```bash
npm run dist:suite:win        # Windows-Installer und portable exe
npm run dist:suite:linux      # AppImage
npm run verify:package:suite -- <pfad-zum-programm>
```

Die Dateien der eingebetteten Anwendungen landen über `extraResources` unter
`resources/apps/<id>/dist` — bewusst neben dem asar-Archiv, nicht darin: was
außerhalb liegt, lässt sich mit gewöhnlichen Mitteln ansehen, wenn etwas
fehlt. `appDistDir` in `apps/shell/src/main/apps.ts` kennt beide Orte, den im
Workspace und den im Paket.

Ausgeliefert wird die Sammlung. Die einzelnen Anwendungen bleiben baubar
(`npm run dist:backstory:win`) und werden weiter geprüft, sind aber
kein Auslieferungsgegenstand mehr.

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
`apps/backstory/src/shared/noteTypes.ts` liefert nur noch die Vorlage für neue Kampagnen.

Zwei Regeln schützen dabei bestehende Daten. Der Schlüssel eines Felds bleibt
beim Umbenennen der Beschriftung unverändert, sonst gingen eingetragene Werte
verloren. Und ein entferntes Feld löscht keine Werte: sie bleiben in der
Notizdatei und erscheinen wieder, wenn das Feld zurückgeholt wird.

**Eingefügter Text** wird als Markdown gelesen: aus `**fett**` wird fetter
Text, aus einer eingefügten Tabelle eine Tabelle. Wer aus dem Editor selbst
oder aus einem Browser kopiert, bringt die Formatierung ohnehin schon mit; nur
reiner Text geht durch den Markdown-Leser.

**Der KI-Assistent** steht in der Sidebar und, mit mehr Platz, im Dialog
„Schreibhilfe und KI" unter dem zweiten Reiter. Beide zeigen dasselbe Gespräch.

**Im Graphen** verschobene Knoten bleiben, wo man sie hinlegt. Die Stellen
stehen in `campaign.json`; „Neu anordnen" verwirft sie wieder.

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
(kostenpflichtig), hinter einem gemeinsamen Interface in `apps/backstory/src/main/ai/`.

Alle Netzaufrufe laufen im Hauptprozess. Der API-Schlüssel wird mit dem
Schlüsselbund des Systems verschlüsselt und erreicht den Renderer nie.

**Versionsverlauf** sichert den vorherigen Stand, bevor eine Notiz
überschrieben wird, höchstens aber alle fünf Minuten. Ohne diese Sperre würde
der Autosave im Sekundentakt hunderte fast gleicher Stände anlegen. Beim
Wiederherstellen wandert der aktuelle Stand vorher in den Verlauf, das
Zurückholen ist also selbst umkehrbar.

**Sprache** ist umschaltbar zwischen Englisch und Deutsch. Voreingestellt ist
Englisch (Konvention 6, gilt für alle Programme der Sammlung); wer Deutsch
will, stellt es unter Einstellungen → Sprache einmal um, und die Wahl bleibt.
Eine bereits getroffene Wahl bleibt von der Voreinstellung unberührt — sie
gilt nur dort, wo noch keine steht.

Alle festen Texte liegen in `apps/backstory/src/shared/i18n.ts`, auch die
Fehlermeldungen des Hauptprozesses: `VaultError` trägt einen Schlüssel,
übersetzt wird erst in der IPC-Schicht. Selbst vergebene Bezeichnungen wie
eigene Notiztypen und Feldnamen bleiben unverändert, die kann das Programm
nicht übersetzen.

**Beziehungen** hängen am Notizpaar, nicht an der einzelnen Textstelle, und
sind gerichtet: A sieht B als Mentorin, B sieht A als Bedrohung. Sie werden im
Beziehungs-Panel gepflegt, nicht in der Link-Syntax. Der Fließtext bleibt so
frei von Metadaten, und eine Beziehung wird nur einmal gepflegt, egal wie oft
die Notiz im Text vorkommt. Dieses Modell ist gleichzeitig die Datenbasis für
die Graph-Ansicht in Phase 3.

## Aufbau

```
apps/backstory/src/shared/     Datenmodell, Notiztyp-Vorlage, Wiki-Link-Parsing, Texte
apps/backstory/src/main/       Electron-Hauptprozess: Dateisystem, IPC, Export, KI-Anbindung
apps/backstory/src/preload/    Einzige Brücke zum Renderer (contextIsolation aktiv)
apps/backstory/src/renderer/   React-Oberfläche, TipTap-Editor, Notizindex, Graph
apps/backstory/tests/          Tests der Kernlogik und der Vault-Schicht
```

Der Renderer hat bewusst keinen Node-Zugriff. Alle Dateioperationen laufen über
die typisierten IPC-Kanäle in `apps/backstory/src/preload/index.ts`.

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
`apps/backstory/scripts/verify-package.mjs`: das Skript startet die **gepackte** Anwendung und
prueft, dass sie ohne fehlende Module hochkommt.

```bash
npm run dist:backstory:linux:dir
xvfb-run -a npm run verify:package -w apps/backstory -- "$PWD/apps/backstory/release/linux-unpacked/backstory-creator"
```

Unter Windows nach `npm run dist:backstory:win`:

```bash
npm run verify:package -w apps/backstory -- "apps\backstory\release\win-unpacked\Backstory Creator.exe"
```

Beide Prüfungen laufen in der CI, bevor die Windows-Anwendung hochgeladen wird.

Hauptprozess und Preload werden komplett gebündelt (esbuild, nur `electron`
bleibt extern). Das Paket enthält deshalb gar kein `node_modules`, und es kann
keine Abhängigkeit mehr fehlen.

## Rauchtest

`apps/backstory/scripts/smoke.cjs` startet die gebaute App, legt eine Kampagne und zwei
Notizen an, tippt einen Wiki-Link, speichert und prüft die Dateien auf der
Platte, inklusive Umbenennen mit Link-Rewrite. Unter Linux mit Xvfb:

```bash
npm run smoke:backstory
```

Unter Windows und macOS direkt ohne Xvfb:

```bash
npm run build && npx electron scripts/smoke.cjs  # innerhalb von apps/backstory
```

## Markdown-Rundlauf

`apps/backstory/scripts/roundtrip.cjs` legt Notizen mit verschiedenen Markdown-Bestandteilen
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
