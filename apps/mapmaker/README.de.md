# TTRPG Map Editor

*[This document in English: README.md](README.md)*

Karteneditor für Pen-&-Paper-Rollenspiele. Battlemaps und Weltkarten zeichnen — und
als Universal VTT exportieren, **mit** Wänden, Türen und Lichtern statt sie dort
nachzuzeichnen. Kompatibel mit Foundry VTT, Roll20 und Owlbear Rodeo.

Läuft im Browser, alles lokal. Keine Anmeldung, keine Cloud.

> Dieses Projekt ist nicht offiziell mit Foundry Gaming LLC, Roll20 oder Owlbear
> Rodeo verbunden und wird von keinem der drei unterstützt oder geprüft. Die Namen
> stehen hier ausschließlich, um zu beschreiben, mit welchen Programmen die
> exportierten Dateien zusammenarbeiten.

**Über dieses Projekt:** Code, Architektur und diese Dokumentation sind zum
allergrößten Teil mit [Claude Code](https://claude.com/claude-code) entstanden,
Anthropics KI-Assistenten — als eigenständig arbeitender Entwickler über viele
Sitzungen hinweg, nicht nur als Autovervollständigung. Wer beitragen möchte: das ist
ausdrücklich willkommen, unabhängig davon, ob mit oder ohne KI-Unterstützung
gearbeitet wird.

## Loslegen

```bash
npm install
npm run dev
```

Dann http://localhost:5173 öffnen.

### Ohne Node: die Einzeldatei

Es gibt den Editor auch als **eine einzige HTML-Datei**, die man doppelklickt.
Kein Node, kein npm, kein Server — der Browser reicht:

```bash
npm run build:portable      # ergibt dist-portable/index.html
```

Wer nicht selbst bauen kann, lädt sie fertig herunter: unter *Actions* →
*Portable Einzeldatei* den letzten Lauf öffnen und das Artefakt
`TTRPG-Karteneditor` nehmen.

Die Datei enthält alles — JavaScript, CSS, Schriften, Props. Speichern und Laden
gehen über den normalen Dateidialog des Browsers, der Bild- und der VTT-Export
ebenfalls. Nichts wird hochgeladen; die Datei arbeitet offline.

### Wenn `npm run dev` unter Windows abbricht

Sieht der Abbruch so aus —

```
Error: Cannot find module @rollup/rollup-win32-x64-msvc.
  [cause]: Error: An Application Control policy has blocked this file.
```

— dann **ist der Rat in der Meldung falsch.** Sie schlägt vor, `node_modules`
und `package-lock.json` zu löschen und neu zu installieren. Das hilft hier
nicht: die Datei ist vorhanden, aber Windows verweigert das Laden. Der
entscheidende Satz steht erst darunter unter `cause`.

Zwei Wege:

1. **Die Einzeldatei oben benutzen.** Sie braucht Rollup gar nicht.
2. **Rollup durch seine WASM-Fassung ersetzen** — dieselbe Funktion, aber ohne
   native Datei, an der die Richtlinie hängen bleibt. In die `package.json`:

   ```json
   "overrides": { "rollup": "npm:@rollup/wasm-node@^4" }
   ```

   danach `npm install`. Geprüft mit Rollup 4.63: Dev-Server und Build laufen
   damit durch. Der Build wird etwas langsamer — WASM statt nativem Code —, ist
   aber sonst nicht zu unterscheiden.

Der Punkt steht bewusst nicht als Voreinstellung in der `package.json`: wo die
native Datei geladen werden darf, ist sie schneller.

## Was drin ist

**Karte und Raster**
Kartengröße in Tile-Einheiten, nachträglich änderbar mit 9-Feld-Anker. Quadratraster
und Hex in beiden Ausrichtungen. Rastergröße, Deckkraft, Farbe, Linienstärke und
Versatz einstellbar. Fangen auf Tile, halbes, viertel Tile oder Eckpunkte.

**Layer**
Frei anlegbarer Stapel statt fester Ebenen. Beliebig viele Objekt-Layer, die gemischt
Props, Zeichnungen und Text aufnehmen. Gruppen, Sichtbarkeit, Sperre, Deckkraft,
Blendmodus, Export-Flag, Umsortieren, Zusammenführen. Grid und die VTT-Ebene stehen
im selben Stapel und sind frei einsortierbar.

**Props**
Eingebaute prozedurale Vektor-Props — Steine, Bäume, Pflanzen, Möbel, Dungeon-Inventar.
Jedes mit mehreren Varianten, frei skalierbar, drehbar und einfärbbar. Eigene
PNG/WebP-Ordner lassen sich zusätzlich importieren.

Größe, Farbe, Deckkraft und Spiegelung lassen sich als **Vorgabe für alle neuen
Props** einstellen, statt jedes gesetzte Prop einzeln nachzustellen; die Vorschau
am Zeiger zeigt sie mit. „Aus Auswahl übernehmen" macht ein zurechtgestelltes
Prop zur Vorlage für die nächsten.

Die Griffe der Auswahl lassen sich **direkt anfassen**, ohne auf das
Auswahl-Werkzeug zu wechseln — ein gerade gesetztes Prop ist also sofort drehbar
und skalierbar. Alt gedrückt halten setzt stattdessen ein Prop, auch auf einem
schon ausgewählten.

**Streu-Pinsel**
Verteilt mehrere Props gleichzeitig mit zufälliger Größe, Drehung und Farbnuance.
Radius, Dichte, Wertebereiche, Mindestabstand und Randabfall einstellbar, als Preset
speicherbar. Radieren mit rechter Maustaste. Ein Strich ist ein Undo-Schritt.

**Zeichnen und Text**
Freihand mit Glättung, Linie, Rechteck, Ellipse, Polygon — mit Kontur, Füllung und
Blendmodus. Text wird direkt auf der Karte getippt, mehrzeilig, mit Schriftart,
Größe, Ausrichtung, Laufweite und Kontur.

**Wände, Türen, Lichter**
Eigene Ebene für alles, was das VTT bauen soll. Wandzüge mit Fang an Zellecken und
an vorhandenen Wandpunkten, Türen sitzen auf Wänden und lassen sich öffnen und
schließen, Lichter mit Reichweite in Tiles, Farbe, Stärke und Schatten. Dazu
„Wände aus Flächen erzeugen": aus gezeichneten Räumen entstehen normale,
editierbare Wandzüge.

**Legende**
Baut aus dem, was auf der Karte steht, eine Tafel: Farbfeld je Biom, Signatur je
benutztem Prop. Jeder Eintrag lässt sich einzeln abwählen, und zusätzliche
Einträge, die auf der Karte nicht vorkommen, lassen sich aufnehmen — sie stehen
in der Tafel unter einer Trennlinie, damit klar bleibt, was die Karte zeigt und
was nicht.

**Export**
PNG, WebP und JPEG mit wählbarer Auflösung. Universal VTT (`.uvtt`/`.dd2vtt`) für
Foundry, Roll20 und Owlbear Rodeo — jeder Export wird sofort gegengelesen und die
gefundenen Zahlen angezeigt. Projekte als `.ttmap` zum Weiterbearbeiten.
`.dd2vtt`-Dateien lassen sich auch öffnen.

## Foundry-Import

Foundry kann Universal VTT nicht von Haus aus lesen. Nötig ist das Modul
[Universal Battlemap Importer](https://foundryvtt.com/packages/dd-import) (`dd-import`),
kompatibel mit v13 und v14. Danach: `.dd2vtt` wählen, importieren — Wände, Türen und
Lichter entstehen automatisch.

Beim Export fürs VTT das Grid abschalten. Foundry zeichnet ein eigenes, sonst liegen
zwei übereinander.

## Tastenkürzel

| Taste | Wirkung |
|---|---|
| `V` / `P` / `B` | Auswahl / Prop / Pinsel |
| `D` / `T` | Zeichnen / Text |
| `W` / `O` / `L` | Wand / Tür / Licht |
| `H` | Ansicht schieben |
| Leertaste halten | Ansicht schieben |
| Mausrad | Zoomen |
| `Alt`+Mausrad | Pinselradius |
| `Strg`+`Z` / `Strg`+`Y` | Rückgängig / Wiederholen |
| `Strg`+`C` / `V` / `D` | Kopieren / Einfügen / Duplizieren |
| `Alt`+Ziehen | Klonen beim Ziehen |
| `Entf` | Löschen |
| `[` / `]` | Nach hinten / nach vorn |
| `Strg` beim Ziehen | Fangen aussetzen |
| Griff anfassen (Prop) | Drehen/skalieren ohne Werkzeugwechsel |
| `Alt`+Klick (Prop) | Prop setzen statt Auswahl anfassen |
| `F1` | Hilfe und Steuerung |

Die Oberfläche gibt es auf **Deutsch und Englisch** — umschaltbar im Hilfe-Dialog
(`F1`), die Wahl wird gemerkt.

## Entwicklung

```bash
npm test          # Tests
npm run typecheck # Typprüfung
npm run build     # Produktionsbuild
```

Architektur und Projektregeln stehen in [CLAUDE.md](CLAUDE.md), offene Punkte in
[BACKLOG.md](BACKLOG.md).

## Lizenz

[GNU Affero General Public License v3.0 oder neuer](../../LICENSE) — dieselbe
Lizenz wie für den Rest von TTRPG-Tools. Freie Software: benutzen, verändern,
weitergeben. Wird eine veränderte Fassung über ein Netzwerk angeboten, muss
ihr Quelltext ebenfalls offenstehen.
