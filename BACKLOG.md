# Backlog

Gesammelte Aufgaben, die noch nicht umgesetzt sind. Reihenfolge innerhalb
eines Abschnitts ist keine Priorisierung.

## Offene Wünsche

### Freier Notiztyp ohne feste Felder

Neben Charakter, Ort, Fraktion und Ereignis soll es einen generischen Typ
geben, für alles, was in keine der vier Schubladen passt.

Hängt eng mit dem nächsten Punkt zusammen: sobald der Steckbrief frei
anpassbar ist, ist ein generischer Typ schlicht ein Typ, der ohne Felder
startet. Beide Punkte sollten deshalb zusammen umgesetzt werden, sonst baut
man zweimal am selben Mechanismus.

### Steckbrief anpassbar machen

Felder sollen sich weglassen, umbenennen und ergänzen lassen. Aktuell stehen
sie fest in `src/shared/noteTypes.ts`.

Die Oberfläche rendert das Formular bereits aus dem Schema, das ist die
halbe Miete. Fehlt: das Schema muss vom Code in die Daten wandern.

Zu klären beim Umsetzen:
- **Ebene der Anpassung.** Pro Kampagne oder global über alle Kampagnen
  hinweg? Pro Kampagne passt besser zum Container-Modell, bedeutet aber, dass
  man Anpassungen bei einer neuen Kampagne wiederholt. Vorschlag: pro
  Kampagne, mit der Möglichkeit, das Schema einer anderen Kampagne zu
  übernehmen
- **Ablageort.** Naheliegend in `campaign.json`, damit das Schema mit der
  Kampagne gesichert und exportiert wird
- **Umbenennen von Feldern.** Ein Feld hat einen Schlüssel (`species`) und
  eine Beschriftung (`Spezies`). Umbenannt werden darf nur die Beschriftung,
  der Schlüssel muss stabil bleiben, sonst gehen bestehende Werte verloren.
  Neue Felder brauchen einen automatisch erzeugten, stabilen Schlüssel
- **Löschen von Feldern.** Was passiert mit bereits eingetragenen Werten?
  Vorschlag: Wert bleibt in der Datei stehen und taucht wieder auf, wenn das
  Feld zurückgeholt wird. Verlustfrei und einfach. Alternativ Warnung und
  echtes Löschen
- **Migration.** Bestehende Notizen wurden mit dem festen Schema angelegt.
  Beim ersten Start mit der neuen Version muss das aktuelle Schema in die
  Kampagne geschrieben werden. Dafür ist die `schemaVersion` in jeder Datei da
- Feldtypen bleiben zunächst wie gehabt (Text, mehrzeilig, Zahl, URL), ohne
  eigene Auswahllisten. Das wäre eine eigene Ausbaustufe

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
