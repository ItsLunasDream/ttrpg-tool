# Backlog

Gesammelte Aufgaben, die noch nicht umgesetzt sind. Reihenfolge innerhalb
eines Abschnitts ist keine Priorisierung.

## Offene Wünsche

### Oberfläche auf Englisch umstellbar

Das Tool soll zwischen Deutsch und Englisch umschaltbar sein.

Zu klären beim Umsetzen:
- Alle sichtbaren Texte sind derzeit hart in den Komponenten verdrahtet. Sie
  müssen erst in eine Textdatei je Sprache herausgezogen werden. Das betrifft
  auch den Hauptprozess, dort stehen Fehlermeldungen wie „Die Notiz braucht
  einen Titel"
- Umschaltung in den Einstellungen, Wert in `AppSettings`, ohne Neustart
- Bibliothek oder Eigenbau? Für zwei Sprachen ohne Pluralregeln und ohne
  Datumsformate reicht ein einfaches Wörterbuch mit Nachschlagefunktion.
  Vorschlag: erst Eigenbau, eine Bibliothek nur bei Bedarf
- **Konflikt mit den anpassbaren Feldern:** sobald Feldbeschriftungen von der
  Nutzerin stammen, lassen sie sich nicht übersetzen. Gleiches gilt für
  selbst angelegte Notiztypen. Vorschlag: nur die fest eingebauten Texte
  übersetzen, selbst vergebene Beschriftungen bleiben wie eingegeben
- Sortierungen benutzen aktuell `localeCompare(..., 'de-DE')` und die
  Kleinschreibung `toLocaleLowerCase('de-DE')`. Das sollte der eingestellten
  Sprache folgen

### Weitere Feldarten im Steckbrief

Aktuell gibt es Text, mehrzeilig, Zahl und Link. Denkbar wären Auswahllisten
mit festen Werten, Datumsfelder oder Ankreuzfelder. Erst umsetzen, wenn ein
konkreter Bedarf da ist.

### Notiztypen zwischen Kampagnen übernehmen

Angepasste Notiztypen gelten nur für eine Kampagne. Beim Anlegen einer neuen
Kampagne startet man wieder bei der Vorlage. Sinnvoll wäre, die Typen einer
bestehenden Kampagne übernehmen zu können.

### Eigene Suchleiste im Editor

Die Markierung im Editor folgt derzeit dem Suchbegriff aus der Seitenleiste.
VS Code hat zusätzlich eine eigene Suche im Dokument (Strg+F), die unabhängig
davon funktioniert und auch Ersetzen anbietet.

Zu entscheiden: wird das gebraucht, oder reicht die gekoppelte Variante?
Ersetzen wäre ein eigener Punkt.

## Geplante Phasen

### Phase 2

- Referenzbilder pro Notiz, Ablage im bereits angelegten `assets`-Verzeichnis
- Versionsverlauf, alte Textstände wiederherstellbar
- Export als PDF
- Export als Markdown
- Schreibhilfe ohne KI: konkrete Options-Listen als Startpunkt, zum Beispiel
  Herkunftsort und Berufung. Das ist überwiegend Inhaltsarbeit, generierte
  Listen werden schnell generisch

### Phase 3

- Graph-Ansicht des Beziehungsnetzes, je Kampagne. Die Datenbasis liegt
  bereits vor: gerichtete Beziehungen mit Typ und Freitext an jeder Notiz

### Phase 4

- KI-Sidebar hinter einem austauschbaren Provider-Interface, wahlweise Ollama
  lokal oder Claude API. Rolle: Rückfragen zum Weiterdenken, Konsistenzcheck
  gegen verlinkte Notizen, Stilfeedback. Ausdrücklich kein Textgenerator
- Das `AIProvider`-Interface wird bewusst erst zusammen mit dem ersten echten
  Provider entworfen. Ein Interface ohne Implementierung ist geraten

## Bekannte Grenzen

- Beim Kampagnenwechsel werden alle Notizen der Kampagne in den Speicher
  geladen. Für einige hundert Notizen unkritisch, darüber bräuchte es einen
  Index statt Volllast
- Umbenennen einer Notiz schreibt alle betroffenen Dateien einzeln. Ein
  Absturz mittendrin könnte einen Teil der Links auf dem alten Namen lassen
- Notiztypen gelten je Kampagne. Anpassungen müssen in einer neuen Kampagne
  wiederholt werden
- Mehrdeutige Namen, also zwei Notizen mit gleichem Titel oder Alias, werden
  im Index erfasst (`NoteIndex.ambiguous`), in der Oberfläche aber nicht
  angezeigt. Beim Verlinken gewinnt stillschweigend die erste Notiz
- Die Windows-Anwendung ist nicht signiert, Windows zeigt beim ersten Start
  eine SmartScreen-Warnung. Eine Signatur bräuchte ein kostenpflichtiges
  Zertifikat

## Erledigt

### Textanfang in der Kurzinfo-Karte

Die Kurzinfo beim Überfahren eines `[[Links]]` zeigt jetzt zusätzlich den
Anfang des Textes. Die Markdown-Bereinigung steckt in `stripMarkdown` und
`textPreview` in `src/renderer/editor/markdown.ts`, der Ausschnitt bricht an
einer Wortgrenze ab.

### Fundstelle in der Suche farblich markieren

In der Trefferliste steht unter dem Titel ein Ausschnitt mit hervorgehobener
Fundstelle, bei mehreren Vorkommen im Text mit Zähler. Im Editor sind alle
Fundstellen eingefärbt, die aktive zusätzlich. Eine Leiste über dem Editor
zeigt „x von y" und erlaubt das Springen, auch per F3 und Umschalt+F3.

Offen geblieben: eine eigene Suchleiste im Editor mit Strg+F, unabhängig von
der Suche in der Seitenleiste. Siehe eigenen Punkt oben.

### Freier Notiztyp und anpassbarer Steckbrief

Notiztypen sind keine feste Aufzählung mehr, sondern Daten. Sie liegen pro
Kampagne in `campaign.json` und lassen sich über „Notiztypen" in der Kopfzeile
bearbeiten: Typen anlegen, umbenennen und löschen, Felder ergänzen,
umbenennen, umsortieren und entfernen.

Der neue Typ „Notiz" ist der freie Typ ohne Felder.

Umgesetzt wie im Backlog vorgeschlagen:
- Feldschlüssel bleiben beim Umbenennen der Beschriftung stabil
- ein entferntes Feld löscht keine Werte, sie bleiben in der Datei
- ein Typ lässt sich nur löschen, wenn keine Notiz ihn benutzt
- bestehende Kampagnen bekommen die Vorlage beim ersten Lesen eingetragen
