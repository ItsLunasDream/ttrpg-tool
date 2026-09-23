# TTRPG-Tools

*[This document in English: README.md](README.md)*

Werkzeuge für Pen-&-Paper-Kampagnen, die nebeneinander in einem Fenster
laufen. Keine Anmeldung, keine Cloud: alles bleibt auf der eigenen Platte.
Die einzige Ausnahme ist die KI-Anbindung, die man selbst einrichtet — und
auch die spricht nur mit dem eingetragenen Anbieter.

- **Initiative Tracker** — Kampfreihenfolge, Trefferpunkte, Zustände mit
  Dauer, Geländeereignisse. Systemneutral, mit Gruppen für Monsterhorden.
- **Würfel** — Pool aus d4 bis d100 und einem eigenen Würfel, flach oder als
  fallende Körper. Auch mit Abzug (`1d20 − 1d4`).
- **Story Creator** — Figuren, Orte, Beziehungen: Rich-Text-Editor,
  Wiki-Links, Steckbrieffelder, gespeichert als Markdown.
- **NPC Creator** — Randfiguren auf Knopfdruck, aus Tabellen oder per KI,
  Export als Notiz in den Story Creator.
- **Inspirationshilfe** — Gerüst für eine neue Kampagne: Aufhänger,
  Fraktionen, Figuren, Orte, Verbindungen, Zeitstrahl. Aus Tabellen, auf
  Wunsch mit KI.
- **Monster Creator** — Homebrew-Monster zu einem Grad, den du vorgibst.
  Jede Zahl wird gegen die Richtwerte geprüft, egal ob sie aus den Tabellen,
  von der Tastatur oder von einer KI kam.
- **Status Effect Creator** — eigene Zustände mit Stufen, gewogen an denen,
  die jeder kennt, mit einer Karte zum Vorlesen am Tisch.
- **Encounter Creator** — Begegnungen aus den 331 SRD-Monstern und den
  eigenen, mit Umgebung, in einem Zug in den Initiative Tracker geschoben.
  Die Schwierigkeit wird nach dem Regelwerk gerechnet; auf Wunsch stellt er
  eine Begegnung zu einem Ziel-HG zusammen.
- **Magic Item Creator** — magische Gegenstände nach Art und Seltenheit
  würfeln, anpassen und ablegen. Der Wert folgt der Tabelle des SRD.
- **Loot Generator** — eigene Zufallstabellen schreiben, eine Zeile je
  Eintrag, mit Spannen, Würfeln im Text und Verweisen auf andere Tabellen;
  von der Kachel einmal würfeln oder mehrmals ohne Wiederholung.
- **Nachschlagewerk** — das ganze Regelglossar, das Kapitel Ausrüstung
  (Waffen, Rüstung, Werkzeug, Abenteuerausrüstung), alle 339 Zauber und alle
  258 magischen Gegenstände des Systemreferenzdokuments, offline und in beiden Sprachen, mit Querverweisen, Hausregeln und Notizen,
  in derselben Strg+K-Suche wie alles andere.
- **TTRPG Map Editor** — Battlemaps und Weltkarten zeichnen, Export als
  Universal VTT.

Arbeitstitel, Symbole und Werkzeugnamen sind vorläufig.

## Fertige Anwendung herunterladen

Ohne Node und npm:

1. Reiter **Actions** öffnen, obersten Lauf **Build** anklicken
2. Unter **Artifacts** `ttrpg-tools-windows` herunterladen und entpacken
3. Darin: `TTRPGTools-Setup-<version>.exe` (Installer) und
   `TTRPGTools-portable-<version>.exe` (läuft ohne Installation)

Hinweise:

- SmartScreen warnt beim ersten Start, weil die Datei nicht signiert ist:
  „Weitere Informationen" → „Trotzdem ausführen". Eine Signatur bräuchte ein
  kostenpflichtiges Zertifikat.
- Artefakte werden einen Tag aufbewahrt. Wer ein dauerhaftes Download-Ziel
  will, legt ein Release an; der Workflow hängt die Dateien dann dort an.

## Selbst bauen

Nur nötig, wenn du am Code arbeiten willst.

Zwei Regeln, an denen sonst der Build scheitert:

- Alle Befehle im Projektordner ausführen, nicht im Benutzerordner.
- **Nach jedem `git pull` einmal `npm install`.** Sonst fehlen Verweise auf
  neue Workspace-Pakete. `scripts/pruefe-installation.mjs` läuft vor `dev`,
  `start`, `build`, `test`, `typecheck` und den Rauchtests mit und sagt es im
  Klartext statt `Rollup failed to resolve import`.

```bash
cd Pfad\zum\Projektordner
npm install
npm run dev             # Hülle im Entwicklungsmodus, mit Hot Reload
npm start               # Produktionsbuild starten
npm test                # Tests der Kernlogik, über alle Workspaces
npm run typecheck
npm run smoke           # Rauchtest der gebauten Hülle
npm run smoke:backstory # Rauchtest des Story Creators (eigener Lauf)
npm run dist:win        # Windows-Installer nach apps/shell/release/
```

Weiteres:

- `scripts\bauen-win.cmd` nimmt unter Windows `git fetch -p`, `git pull`,
  `npm install`, `npm run dist:win` auf einmal. Am Ende öffnet es
  `apps\shell\release`, es hält in jedem Fall an, statt das Fenster zu
  schließen, und schreibt den gelaufenen Schritt nach `bauen-win.log`.
- Einzeln entwickeln: `npm run dev:backstory`, `dev:mapmaker`,
  `dev:initiative`, `dev:dice`, `dev:npc`.
- Befehle ohne Zusatz meinen immer die Sammlung, nicht den Story Creator.
- Gezielt für einen Workspace: `npm run <skript> -w apps/backstory`.

### Workspace-Aufbau

npm-Workspace-Monorepo; die Befehle an der Wurzel delegieren.

```
apps/shell/        Die Hülle: Fenster, Startmenü, Schiene, Einstellungen
apps/backstory/    Story Creator
apps/mapmaker/     TTRPG Map Editor (auch als Tauri-Anwendung baubar)
apps/initiative/   Initiative Tracker
apps/dice/         Würfel
apps/npc/          NPC Creator
apps/inspiration/  Inspirationshilfe
apps/monster/      Monster Creator
apps/zustaende/    Status Effect Creator
apps/encounter/    Encounter Creator
apps/nachschlagewerk/ Nachschlagewerk (die Regeln, offline)
apps/magicitems/   Magic Item Creator
apps/loot/         Loot Generator
packages/dice/     Würfelausdrücke lesen und werfen
packages/i18n/     Sprachwahl und Textersetzung
packages/motion/   Zeiten, Kurven und Grundanimationen
packages/ki/       Anbindung an Sprachmodelle (Ollama, Claude)
packages/umgebungen/ Umgebungen: was man sieht, und was mit einer Zahl wirkt
packages/einstellungen/ Wie ein Werkzeug seine Einstellungen für die Hülle beschreibt
packages/foundry/  Monster und Zustände als JSON, das Foundry VTT liest
packages/farben/   Farbrollen und die wählbaren Themen
packages/eintraege/ Was ein Werkzeug abgelegt hat, in einer Form, die alle verstehen
packages/tabellen/ Zufallstabellen: das Format, darauf würfeln, verschachteln
packages/uebergabe/ Die Form, in der eine Begegnung von einem Werkzeug ins andere wandert
packages/srd/      Alles aus dem SRD 5.2.1, in beiden Sprachen
```

`packages/*` sind plattformfrei: kein `node:*`, kein `electron`, keine
Browser-Globals. Sie werden in beide Prozesse gebündelt.

## Die Hülle

`apps/shell` ist der Haupteinstieg: ein rahmenloses `BaseWindow`, darin die
Hülle über die volle Fläche und darüber die Ansicht des Werkzeugs, die oben
und links Platz für Titelleiste und Schiene lässt.

- Einmal geöffnete Werkzeuge bleiben geladen und werden beim Wechseln nur
  versteckt. Beim Zurückkommen steht alles noch da; der Preis ist Speicher,
  rund 130 MB je Werkzeug.
- Jedes Werkzeug läuft in einer eigenen Electron-Sitzung (`persist:<id>`).
  Sonst teilten sich alle `localStorage` und IndexedDB, weil `file://` für
  alle derselbe Ursprung ist.
- Eingebettet wird über je eine `src/main/embed.ts` im Werkzeug. Denselben
  Code benutzt auch dessen eigenständiger Hauptprozess.
- Was es gibt und wie weit es ist, steht nur an einer Stelle:
  `apps/shell/src/shared/apps.ts`.
- Die Sprache ist durchgekoppelt: eine Änderung gilt sofort überall.
- Beim Öffnen wächst das Symbol des Werkzeugs über den Schirm; dauert das
  Laden länger, kommt danach der Ladekreis.
- **Zurück und vorwärts** wie im Browser, über die Daumentasten der Maus
  oder Alt und Pfeiltaste. Der Verlauf hält fünfzig Schritte und merkt sich,
  *wo* man war — er hat mit Strg+Z nichts zu tun. Die Daumentasten kommen auf
  zwei Wegen an: als `app-command` vom Fenster und aus dem Dokument der
  vorn liegenden Ansicht (gemeldet vom Preload des Werkzeugs). Einer reicht
  nicht — unter Windows greift Chromium sie in der Ansicht selbst ab, und
  das Fenster erfährt nie davon.
- Direkt in einem Werkzeug starten: `TTRPG_TOOLS_START_APP=backstory`.
- **Einführung beim ersten Mal**: beim allerersten Start ein Willkommen, beim
  ersten Öffnen jedes Werkzeugs eine kurze Erklärung, was es tut. Danach nie
  wieder; ein Knopf in den Einstellungen holt sie zurück. Die Texte stehen in
  `apps/shell/src/shared/einfuehrung.ts`.

### Eigene Symbole

Die mitgelieferten Symbole sind vorläufig und lassen sich ersetzen:

1. Ordner `symbole` im Datenordner — gilt nur lokal.
2. `apps/shell/symbole/` im Repository — gilt für alle, wird mit
   ausgeliefert.
3. Die eingebauten Vektoren, wenn nichts davon da ist.

Dateiname ist die Kennung (`backstory.png`, `mapmaker.png`,
`initiative.png`, `dice.png`, `npc.png`). Erlaubt sind PNG, JPG, WebP und
GIF bis 2 MB. Kein SVG, weil eine SVG-Datei Skripte enthalten kann. Mehr in
`apps/shell/symbole/LIESMICH.md`.

### Paket der Sammlung

```bash
npm run dist:suite:win        # Installer und portable exe
npm run dist:suite:linux      # AppImage
npm run verify:package:suite -- <pfad-zum-programm>
```

Die Dateien der eingebetteten Anwendungen liegen über `extraResources` unter
`resources/apps/<id>/dist`, bewusst neben dem asar-Archiv: was außerhalb
liegt, lässt sich ansehen, wenn etwas fehlt.

Ausgeliefert wird die Sammlung. Die einzelnen Anwendungen bleiben baubar
(`npm run dist:backstory:win`), sind aber kein Auslieferungsgegenstand.

## KI

Eingestellt wird an einer Stelle, in den Einstellungen der Hülle; die
Werkzeuge erben die Einstellung und erfahren einen Wechsel sofort.

- Drei Anbieter, hinter einem Interface in `packages/ki`: **Ollama** (lokal,
  kostenlos), die **Claude API** und **jeder Dienst mit der Schnittstelle von
  OpenAI** — Groq, Mistral, Together, OpenRouter, ein lokales LM Studio. Für
  den letzten werden Adresse, Modell und Schlüssel eingetragen.
- Der API-Schlüssel wird mit dem Schlüsselbund des Systems verschlüsselt und
  erreicht den Renderer nie. Alle Netzaufrufe laufen im Hauptprozess, die CSP
  bleibt auf `connect-src 'self'`.
- Ohne Anbieter läuft alles weiter: KI ist überall eine Zugabe.

## Story Creator

Notizen sind Markdown mit YAML-Kopf und in jedem Texteditor oder in Obsidian
lesbar. Eigene Angaben im Kopf bleiben beim Speichern erhalten.

| Aktion | So geht's |
| --- | --- |
| Notiz verlinken | `[[` tippen, aus der Liste wählen |
| Neue Notiz aus einem Link | `[[` tippen, Namen eingeben, „neu anlegen" |
| Verlinkte Notiz öffnen | Strg (Cmd) halten und klicken |
| Speichern | Strg+S, oder Autosave |
| Suchen und ersetzen | Strg+F, springen mit F3 / Umschalt+F3 |
| Text markieren und verlinken | markieren, dann `[[` tippen |
| Notiz umbenennen, löschen | Rechtsklick in der Notizliste |
| Rechtschreibung korrigieren | Rechtsklick auf das angestrichene Wort |
| Abschnitt einklappen | Pfeil links neben der Überschrift |
| Vergrößern | Strg und Mausrad, Strg+Plus, Strg+Minus, Strg+0 |
| Unterstreichen | Knopf U, oder Strg+U |
| Kampagne sichern | Menü „Kampagne" → „Als ZIP sichern" |
| Sicherung einlesen | Menü „Kampagne" → „Aus ZIP einlesen" |
| Steckbrief anpassen | Menü „Kampagne" → „Notiztypen" |
| Bild einfügen | Knopf ▣, oder Bild in den Text ziehen |
| Assistent fragen | Sidebar im Editor |
| Vorschläge zum Weiterschreiben | „Schreibhilfe" in der Kopfzeile |
| Export | Knopf „Export" in der Kopfzeile: Notiz oder ganze Kampagne |
| Alten Stand zurückholen | „Verlauf" in der Kopfzeile |
| Beziehungsnetz | „Graph" in der Kopfzeile |
| Tastenkürzel | „Hilfe" in der Kopfzeile |

Modell in Stichpunkten:

- **Kampagne** ist ein Container; eine Notiz gehört zu genau einer und ist
  nur darin verlinkbar.
- **Notiztypen** sind schema-getrieben und gehören der Kampagne
  (`campaign.json`), nicht dem Code. Feldschlüssel bleiben beim Umbenennen
  der Beschriftung stehen, und ein entferntes Feld löscht keine Werte.
- **Wiki-Links** stehen als `[[Titel]]` im Klartext und werden beim
  Umbenennen mitgezogen. Links auf fehlende Notizen sind anders gefärbt und
  stehen im Panel „Offene Links".
- **Beziehungen** hängen am Notizpaar und sind gerichtet, nicht Teil der
  Link-Syntax.
- **Bilder** werden in `assets/` kopiert, nicht verlinkt, und über das
  Protokoll `backstory-asset://` angezeigt.
- **Versionsverlauf** sichert vor dem Überschreiben, höchstens alle fünf
  Minuten. Wiederherstellen ist selbst umkehrbar.
- **Der Assistent** schreibt nichts in den Text; er fragt, prüft gegen
  verlinkte Notizen und gibt Stilrückmeldung. Ob die verlinkten Notizen
  mitgeschickt werden, entscheidet ein Kästchen — es nennt auch, wie viele
  es gerade wären.
- **Der Zoom** gilt für alle Notizen und nur für das Editorfeld, 20 bis 500
  Prozent. Er ändert nur die Darstellung: eine Schriftgröße im Markdown wäre
  ein Formatzeichen, das kein anderes Programm versteht.
- **Eingeklappte Abschnitte** sind ebenfalls nur Ansicht und stehen nie in
  der Datei. Landet der Cursor in einem versteckten Block, klappt er wieder
  auf — sonst schriebe man in Text, den niemand sieht.
- **Der PDF-Export** kann ein Inhaltsverzeichnis und das Beziehungsnetz
  mitgeben, und Wiki-Links werden darin zu Sprungzielen, wenn die gemeinte
  Notiz mit exportiert wurde.
- **Eigene Wörter** der Rechtschreibprüfung stehen in den Einstellungen und
  lassen sich dort wieder entfernen.

```
apps/backstory/src/shared/     Datenmodell, Wiki-Link-Parsing, Texte
apps/backstory/src/main/       Hauptprozess: Dateien, IPC, Export, KI
apps/backstory/src/preload/    Einzige Brücke zum Renderer
apps/backstory/src/renderer/   React, TipTap-Editor, Notizindex, Graph
```

Der Renderer hat keinen Node-Zugriff.

## Initiative Tracker

Systemneutral: ein Eintrag hat Initiative, Trefferpunkte und Zustände — was
die Zahlen bedeuten, entscheidet der Tisch.

- **Gruppen**: sechs Goblins würfeln eine Initiative und haben sechs
  Trefferpunktsätze. Deshalb hängen die Trefferpunkte am Körper, nicht am
  Eintrag.
- **Zustände tragen eine Dauer**: offen, bis Beginn oder Ende des nächsten
  Zuges, bis Rundenende. Sie zählen selbst ab.
- **Geländeereignisse** laufen bei Initiative 20 und bei Gleichstand hinter
  Figuren mit 20, wie die Unterschlupfaktion im Regelwerk. Sie haben keine
  Trefferpunkte und werden nicht durchgestrichen.
- **Leertaste heißt weiter.** Schaden wird getippt und mit Enter angewendet,
  nicht geklickt — Schaden ist selten eins.
- Rechtsklick auf eine Zeile öffnet ein Menü.
- Begegnungen sind Dokumente (Markdown mit YAML-Kopf); der laufende Kampf ist
  Sitzungszustand und liegt als JSON daneben.
- Bilder werden in den eigenen Ordner kopiert, nicht verlinkt.

Die Regeln stehen als reine Funktionen in `src/shared/kampf.ts`. Ein Fehler
in der Zugreihenfolge fällt am Tisch niemandem auf und lässt sich nicht
nachstellen — er muss sich prüfen lassen, bevor er passiert.

## NPC Creator

Eine Randfigur auf Knopfdruck: Name, Spezies, Tätigkeit, Auffälliges, Wille,
Geheimnis, Eigenheit.

- Jedes Feld lässt sich einzeln neu würfeln, festhalten (Schloss) oder von
  Hand überschreiben. Eine Figur trägt fertige Texte, keine Verweise in die
  Tabellen.
- Namensklang wählbar: feminin, maskulin, neutral.
- **Mit KI** schlägt das Modell frei vor, nicht aus den Tabellen — sonst wäre
  es ein langsamer und teurer Würfel. Ohne KI gelten die Tabellen.
- **Export** legt eine Notiz in der offenen Kampagne des Story Creators
  an. Die Notizliste dort aktualisiert sich sofort.
- Gewürfelt wird in der Arbeitssprache; eine fertige Figur wechselt die
  Sprache nicht mit, sonst überschriebe eine Übersetzung Handarbeit.

Die Erzeugung steht als reine Funktion in `src/shared/erzeuge.ts`, die
Modellaufgaben in `src/shared/kiAufgaben.ts`.

## Inspirationshilfe

Das leere Blatt am Anfang einer Kampagne. Sechs Bausteine, ein Knopf:
Aufhänger, Fraktionen, Figuren, Orte, Verbindungen und ein Zeitstrahl —
was passiert, wenn die Gruppe nichts tut.

- **Ohne KI vollständig.** Die Bausteine werden aus kombinierenden Tabellen
  gezogen: über eine Million verschiedene Aufhänger, ebenso viele Orte und
  Figuren. Die Zahl steht in der Oberfläche und ist aus den Tabellen
  nachgerechnet, nicht behauptet.
- **Vier Regler**: Umfang (Abend, Bogen, Kampagne), Region, Thema, Tonfall.
  Region, Thema und Tonfall sind freie Felder mit Vorschlagsliste; bekannte
  Begriffe verengen die Tabellen, eigene lassen sie offen.
- **Verbindungen sind gerichtet**: A sieht B als Mentorin, B sieht A als
  Bedrohung. Jede Figur hängt an mindestens einer anderen.
- **Schloss je Baustein**, wie im NPC Creator. Der Knopf am Baustein selbst
  würfelt ihn trotzdem neu.
- **Alles ist von Hand überschreibbar.** Ein Wurf ist ein Vorschlag, kein
  Ergebnis. Wer einen Satz selbst schreibt, hält den Baustein damit auch
  fest — das nächste „Alles würfeln" nimmt ihn nicht mit.
- **Figuren, die es schon gibt**, lassen sich aus der offenen Kampagne holen
  (und damit auch die des NPC Creators, der dort ablegt). Sie werden gleich
  ins Geflecht eingehängt und bekommen beim Übernehmen keine zweite Notiz.
- **Das Geflecht als Bild**: Figuren als Punkte, Verbindungen als Pfeile.
  Die Liste darunter sagt, was zwischen zweien liegt; das Bild sagt, wo die
  Geschichte dicht ist und wer am Rand steht. Ein Klick öffnet dasselbe
  Geflecht über den ganzen Schirm — neu gerechnet, nicht gedehnt.
- **„Karte anlegen"** an jedem Ort öffnet den Karteneditor und beginnt dort
  eine Karte unter diesem Namen — mit dem, was über den Ort bekannt ist, als
  Notiz-Pins darauf. Gezeichnet wird nichts: eine Karte aus Text zu erzeugen
  hieße, das Datenmodell des Karteneditors von außen zu bedienen. Steht auf
  der offenen Karte schon etwas, fragt er vorher nach.
- **Mit KI** schlägt das Modell einen Baustein frei vor, nicht aus den
  Tabellen — mit dem bisherigen Entwurf als Umgebung. Sie versteht auch
  eigene Regionen wie „Schwebende Inseln", mit denen die Tabellen nichts
  anfangen können. Ohne KI gelten die Tabellen.
- **Die Welt**: bei den KI-Knöpfen kommen ein, zwei Sätze dazu, in welcher
  Welt das spielt — eigene Angaben wie „Cyberpunk City" gelten dabei wörtlich.
  Gewürfelt bleibt das leer, die Tabellen liefern Bausteine, keine Welt.
- **„Alles von der KI"** entwirft alle sechs Bausteine in einer Antwort und
  aufeinander bezogen: die Fraktion kennt den Aufhänger, die Verbindung
  kennt die Figuren. Was das Modell ausläßt, kommt aus den Tabellen, was zu
  viel ist, fällt weg — der eingestellte Umfang gilt —, und festgehaltene
  Bausteine bleiben stehen.
- **Übernehmen** legt je Figur, Ort und Fraktion eine Notiz in der offenen
  Kampagne an, dazu eine Übersicht mit Wiki-Verweisen — der Graph im
  Story Creator hat sofort etwas zu zeichnen. Entwurf hier, Wahrheit
  dort: eine eigene Ablage gibt es nicht.

Konzept und offene Punkte: `docs/inspirationshilfe.md`.

## Monster Creator

Homebrew-Monster zu einem Grad, den du vorgibst — und der Kern ist die
Prüfung, nicht der Erzeuger.

- **Die Prüfung ist eine reine Funktion.** Trefferpunkte und Rüstung ergeben
  einen Verteidigungs-CR, Schaden pro Runde und Angriffsbonus einen
  Angriffs-CR; das Ergebnis ist der Mittelwert. Beide Hälften stehen
  **getrennt** da: der Mittelwert allein verschweigt ein Monster, das wie
  CR 4 einsteckt und wie CR 9 austeilt — und genau so geht Homebrew meistens
  schief.
- **Der Befund sagt, was sich drehen lässt**, nicht nur dass etwas klemmt —
  und jeder Vorschlag ist ein Knopf.
- **Wessen Zahlen es sind, entscheidet, was passiert.** Von der KI: automatisch
  auf den Grad gezogen, mit Ansage, was sich um wie viel geändert hat (samt
  Weg zurück zum Vorschlag der KI). Von Hand: ein Warnhinweis mit den
  empfohlenen Werten, aber nichts wird hinter deinem Rücken geändert.
- **Rollen verschieben in Tabellenzeilen, nicht in Prozent.** Die
  Trefferpunkt-Spalte ist in der Mitte flach, die Schadensspalte nicht;
  dieselben Prozente verschieben also um verschieden viele Grade. Ein Test
  erzeugt alle Grade mal alle Rollen und besteht darauf, dass jedes Ergebnis
  die eigene Prüfung besteht.
- **Ein echter Statblock, keine Zahlenkolonne.** Attribute, Bewegung und
  jeder Angriff ausgeschrieben: Waffe, Reichweite, Trefferbonus, Würfel und
  Schadensart. Die Waffe passt zum Wesen — eine Bestie führt keine
  Hellebarde.
- **Resistenzen, Immunitäten und Verwundbarkeiten sind keine Pflicht.** Sie
  kommen über Chancen, mit dem Grad häufiger, und die meisten Monster
  bekommen nichts. Was ein Monster länger aushalten lässt, wird von seinen
  rohen Trefferpunkten abgezogen — so bleibt es auf seinem Grad.
- **Ein vorhandenes Monster prüfen**, ohne eines zu bauen: Zahlen aus einem
  Buch oder aus einer alten Kampagne eintippen und sehen, was der Grad sagt.
- **Die Sammlung** zeigt Gebautes als Kacheln oder Liste, mit einem Suchfeld
  für Name, Art und Grad zugleich (`untot 4`, `cr 3-6`).
- Monster sind Markdown-Dateien mit YAML-Kopf im Datenordner. Alle Zahlen
  stehen im Kopf, damit ein künftiges Begegnungswerkzeug sie lesen kann, ohne
  den Statblock zu zerlegen. Ausgenommen sind die Erfahrungspunkte: die
  CC-BY-Quelle belegt nur sieben davon, und geratene Zahlen in einer Datei
  namens „Richtwerte" wären schlimmer als gar keine.

Die Richtwerte stammen aus einer CC-BY-Quelle, genannt in
[NOTICE.md](NOTICE.md).

## Status Effect Creator

- **Eigene Zustände mit Stufen** — Kälte, die sich aufbaut, ein Fluch, der
  beim dritten Mal etwas anderes tut. Siebzehn Themen: Feuer, Kälte, Hitze,
  Gift, Säure, Sturm, Stein, Fäulnis, Blut, Schatten, Licht, Leere,
  Wahnsinn, Zeit, Klang, Traum und Tiefe. Die Stufen sind Stichpunkte, keine
  Prosa; einen Absatz liest am Tisch niemand.
- **Jeder Zustand wird gewogen**, und das Gewicht steht nie ohne Vergleich
  da: „etwa so viel wie Erschöpfung 5". Was es ausdrücklich nicht sagt: ob er
  für deine Runde zu hart ist. Das hängt daran, wie oft man ihn bekommt, und
  das weiß nur dein Tisch.
- **Die Teile müssen zueinander passen.** Ein Zustand, der bis zum nächsten
  Zug anhält, lässt sich nicht durch eine Stunde am Feuer lindern. Dauer,
  Linderung und Verschlimmerung tragen einen Takt, und ein Widerspruch wird
  gemeldet.
- **Pakete**: mehrere Zustände in einem Wurf, mit demselben Thema und über
  alle verteilten Wirkungen — so greift nicht dreimal derselbe Nachteil an.
- **Eine Karte zum Vorlesen**: vorn, was die Figur merkt, hinten die Regel
  für dich. Zum Ausdrucken oder groß auf dem Schirm.

## Würfel

- **Die Form ist das Einzige, woran man eine Würfelart erkennt** — Farbe und
  Muster gelten für alle. Deshalb sind die Umrisse die bekannten Silhouetten,
  nicht die geometrisch korrekten Projektionen.
- Auswahl ist eine Zahl je Art und darf negativ sein: `3` beim d20 und `-2`
  beim d4 heißt `3d20 - 2d4`. Linksklick legt dazu, Rechtsklick nimmt weg.
- Die Zahlenfarbe wird aus der Leuchtdichte nach WCAG gerechnet, damit sie
  auf jeder Würfelfarbe lesbar bleibt.
- Effekte: Glitzer beim Höchstwurf, violette Streifen bei einer 1, je
  einzeln abschaltbar. Abzugswürfel bekommen keinen.
- Der Verlauf hält die letzten 40 Würfe nur für die Sitzung.

**Als Körper (3D):** ein Schalter im Aussehen-Bereich lässt die Würfel fallen
statt flache Umrisse zu drehen. Aus ist der Standard, weil die Darstellung
Grafikbeschleunigung braucht; fehlt sie, bleibt es automatisch flach.

**Die Physik bestimmt nicht das Ergebnis.** Gewürfelt wird mit `wuerfle()`,
einer reinen Funktion. Die Simulation lässt die Körper fallen; danach wird
die Beschriftung so umnummeriert, dass oben das Ergebnis steht — paarweise
mit den gegenüberliegenden Flächen, damit die Summenregel gilt. d100 und der
eigene Würfel sind unbeschriftete Kugeln, für 37 oder 100 Seiten gibt es
keinen Körper.

Gemessen (ohne Grafikkarte, Software-WebGL): 100 Würfel liegen nach 211
Schritten und 1635 ms Rechenzeit; die Anzeige ist auf gut zwei Sekunden
gedeckelt. three.js und cannon-es lassen das Bündel von 157 auf 724 kB
wachsen.

## TTRPG Map Editor

`apps/mapmaker` kam als eigenständiges Repository dazu und bringt eine eigene
Historie und eine eigene `CLAUDE.md` mit — dort steht das Eigentliche. Zwei
Anpassungen für den Workspace:

- `vite.config.ts` setzt `base: './'`. Ohne das zeigen die Pfade der gebauten
  `index.html` unter `file://` und in einer `WebContentsView` ins Leere.
- Die Vite-Plugins tragen eine Typ-Notlösung (`as Plugin[]`): der Workspace
  teilt sich `@vitejs/plugin-react` mit Apps auf Vite 5, während diese
  Anwendung Vite 6 benutzt. Zur Laufzeit folgenlos.

Nicht in der CI dieses Repositories: der Rust-Anteil (`src-tauri/`,
`npm run tauri:dev`/`tauri:build`), der End-to-End-Lauf unter `e2e/` und die
`build:portable`-Variante. Alle drei laufen lokal unverändert.

## Datenablage

Der Speicherort des Story Creators liegt standardmäßig im
Nutzerdatenverzeichnis und ist unter Einstellungen → Speicherort änderbar.

Der Speicherort lässt sich auch als ZIP sichern und wieder einlesen. Eine
eingelesene Kampagne bekommt immer eine neue Kennung — eine vorhandene wird
nie überschrieben.

```
<Speicherort>/                  Daten des Story Creators
  campaigns/<campaignId>/
    campaign.json
    notes/<noteId>.md           YAML-Frontmatter + Markdown
    assets/                     Bilder der Kampagne
    history/<noteId>/           Frühere Stände
  writing-prompts.de.json       Vorschläge der Schreibhilfe, frei bearbeitbar
  writing-prompts.en.json

<Nutzerdatenverzeichnis>/       Daten der Hülle
  einstellungen.json            Sprache, KI, verschlüsselter Schlüssel
  fenster.json                  Fenstergröße und -stelle
  symbole/                      Eigene App-Symbole
```

- Eine selbst abgelegte Markdown-Datei in `notes/` wird mitgelesen. Fehlt der
  YAML-Kopf, dient die erste Überschrift als Titel. Der Dateiname wird zur ID
  und darf nur Buchstaben, Ziffern, `-` und `_` enthalten.
- Die Anwendung läuft nur einmal; ein zweiter Start holt das Fenster nach
  vorn.
- Jede Datei trägt eine `schemaVersion` für spätere Migrationen.
- Voreingestellte Sprache ist Englisch; eine einmal getroffene Wahl bleibt.

## Tests

| Befehl | Was er prüft |
| --- | --- |
| `npm test` | Kernlogik aller Workspaces |
| `npm run typecheck` | Typen aller Workspaces |
| `npm run smoke` | Gebaute Hülle: Start, Wechsel, KI, Symbole, NPC-Export, Einführungen, Daumentasten |
| `npm run smoke:backstory` | Kampagne, Notizen, Wiki-Link, Umbenennen, Rechtschreibung, Einlesen |
| `npm run roundtrip` | Speichern verändert das Markdown nicht |
| `npm run verify:package:suite -- <pfad>` | Gepacktes Paket kommt hoch |

Zu beachten:

- `smoke` und `smoke:backstory` sind **zwei getrennte Läufe**. Wer nur den
  ersten anstößt, übersieht Regressionen im Story Creator.
- Der Rauchtest läuft gegen die ungepackte App. Ob im Installationspaket
  etwas fehlt, sieht nur `verify:package`. Beides läuft in der CI, bevor die
  Windows-Anwendung hochgeladen wird.
- Der Rundlauf ist nötig, weil die Tests der Kernlogik nur Markdown ↔ HTML
  prüfen. Kennt das Editor-Schema ein Element nicht, fällt es beim Laden weg
  und ist nach dem Speichern verloren — so gingen früher Tabellen, Links und
  tiefe Überschriften verloren.

Unter Linux mit Xvfb:

```bash
npm run dist:backstory:linux:dir
xvfb-run -a npm run verify:package -w apps/backstory -- \
  "$PWD/apps/backstory/release/linux-unpacked/backstory-creator"
```

## Stand und Grenzen

Alle sieben Werkzeuge laufen eingebettet; `encounter` ist geplant und noch
nicht anklickbar.

Bekannte Grenzen:

- Beim Kampagnenwechsel werden alle Notizen geladen. Für einige hundert
  unkritisch, bei deutlich mehr bräuchte es einen Index.
- Umbenennen schreibt alle betroffenen Dateien einzeln; ein Absturz
  mittendrin ließe einen Teil der Links auf dem alten Namen.
- Mehrdeutige Namen (gleicher Titel oder Alias) werden im Index erfasst, in
  der Oberfläche aber nicht gesondert angezeigt.

Offene Aufgaben und geplante Phasen: [BACKLOG.md](BACKLOG.md). Was vor
einer Veröffentlichung von Hand durchzugehen ist — das, was die
automatischen Prüfungen nicht sehen: [TESTLISTE.md](TESTLISTE.md).

## Marken

Dieses Projekt steht in keiner Verbindung zu Foundry Gaming LLC, Roll20,
Owlbear Rodeo, Obsidian, Anthropic oder Ollama und wird von keinem dieser
Anbieter unterstützt oder geprüft. Die Namen stehen hier ausschließlich, um
zu beschreiben, mit welchen Programmen und Diensten die Werkzeuge
zusammenarbeiten.

## Über dieses Projekt

Code, Architektur und diese Dokumentation sind zum allergrößten Teil mit
[Claude Code](https://claude.com/claude-code) entstanden, Anthropics
KI-Assistenten — als eigenständig arbeitender Entwickler über viele
Sitzungen hinweg, nicht nur als Autovervollständigung. Beiträge sind
willkommen, ob mit oder ohne KI-Unterstützung.

Code-Kommentare, Commit-Nachrichten und die Projektunterlagen
(`KONVENTIONEN.md`, `BACKLOG.md`, `docs/`) sind auf Deutsch. Die Oberfläche
gibt es auf Deutsch und Englisch.

## Lizenz

[GNU Affero General Public License v3.0 oder neuer](LICENSE).

Freie Software: benutzen, verändern und weitergeben ist ausdrücklich
erlaubt. Wird eine veränderte Fassung über ein Netzwerk angeboten, muss ihr
Quelltext ebenfalls offenstehen. Ohne jede Gewährleistung, wie in der Lizenz
beschrieben.

### Fremde Inhalte

Einzelne **Daten** im Repository stammen aus fremden Werken unter eigenen
Lizenzen, die eine Namensnennung verlangen. Sie steht in
[NOTICE.md](NOTICE.md) und wird mitgegeben — sie wegzulassen wäre ein
Lizenzbruch, kein Schönheitsfehler.

Kurz: die Richtwerte je Herausforderungsgrad im Monster Creator stammen aus
dem *Lazy GM's 5e Monster Builder Resource Document* von Teos Abadía, Scott
Fitzgerald Gray und Michael E. Shea unter CC-BY-4.0, das seinerseits Material
aus dem SRD 5.1 enthält. Aus dem Dungeon Master's Guide stammt nichts.
