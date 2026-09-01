# Backlog

Gesammelte Aufgaben, die noch nicht umgesetzt sind. Reihenfolge innerhalb
eines Abschnitts ist keine Priorisierung.

## Offene Wünsche

### Verwaiste Bilder aufräumen

Wird ein Bild aus dem Text oder aus dem Portrait-Feld entfernt, bleibt die
Datei in `assets/` liegen. Das ist absichtlich so, weil Rückgängigmachen sonst
ins Leere liefe, sammelt aber mit der Zeit Datenmüll an.

Denkbar: ein Aufräumen-Knopf, der alle Dateien auflistet, auf die keine Notiz
mehr verweist, und sie nach Rückfrage löscht. Erst dann löschen, nie
automatisch beim Entfernen aus dem Text.

### Bildgröße im Text einstellen

Bilder werden derzeit in voller Breite bis maximal zur Textbreite angezeigt.
Eine Möglichkeit, ein Bild kleiner zu setzen oder neben den Text zu stellen,
wäre nützlich, ist aber im Markdown nicht ohne Weiteres abbildbar.

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

### Weitere Sprachen

Deutsch und Englisch sind umgesetzt. Eine weitere Sprache ist ein Eintrag in
`LANGUAGES` und ein Wörterbuch in `src/shared/i18n.ts`, sonst nichts. Der Test
„jeder deutsche Schlüssel hat eine englische Entsprechung" müsste dann auf
alle Sprachen erweitert werden.

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
- Aus dem Text entfernte Bilder bleiben als Datei in `assets/` liegen
- Der Versionsverlauf wächst mit und landet auch in der ZIP-Sicherung. Bei
  vielen Notizen und hoher Höchstzahl kann das spürbar werden
- Beziehungen kennen keine Gegenrichtung: legst du eine an, entsteht in der
  Zielnotiz nichts. Das ist so gewollt, weil die Sichten unterschiedlich sein
  sollen, könnte aber einen Vorschlag vertragen
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

### Oberfläche auf Englisch umstellbar

Umschaltbar in den Einstellungen, ohne Neustart. Alle festen Texte liegen in
`src/shared/i18n.ts`, der Zugriff läuft über den Hook `useT` in
`src/renderer/i18n.tsx`.

Fehlermeldungen aus dem Hauptprozess sind mit übersetzt: `VaultError` trägt
einen Schlüssel statt eines fertigen Textes, übersetzt wird erst in der
IPC-Schicht, wo die eingestellte Sprache bekannt ist.

Sortierungen folgen der eingestellten Sprache über `Intl.Collator`.

Wie im Backlog vorgeschlagen bleiben selbst vergebene Bezeichnungen
unverändert, also eigene Notiztypen und Feldnamen. Ein Test stellt sicher,
dass kein Schlüssel ohne englische Fassung bleibt.

### Bilder

Bilder lassen sich im Fließtext und als Portrait im Steckbrief einfügen. Wie
besprochen werden sie in die Kampagne kopiert, nicht verlinkt: `assets/` der
Kampagne, mit neu vergebenem Dateinamen, damit gleichnamige Bilder sich nicht
überschreiben. Damit bleibt die ZIP-Sicherung vollständig.

Wege ins Dokument: Knopf in der Werkzeugleiste, Ziehen und Ablegen, Einfügen
aus der Zwischenablage. Beim Portrait zusätzlich per Ziehen auf das Feld.

Im Markdown steht ein relativer Verweis `![](assets/x.png)`, damit die Dateien
in Obsidian oder einem Texteditor lesbar bleiben. Angezeigt werden Bilder über
ein eigenes Protokoll `backstory-asset://`, das nur aus dem `assets`-Ordner
der jeweiligen Kampagne liefert. Der Renderer bekommt weiterhin keinen
direkten Dateizugriff.

Bildfelder sind eine neue Feldart im Steckbrief, lassen sich also über den
Notiztypen-Dialog auch bei anderen Typen ergänzen.

### Versionsverlauf

Frühere Stände liegen unter `history/<noteId>/<zeitstempel>.md` in der
Kampagne, also im selben Klartextformat wie die Notiz selbst. Aufrufbar über
„Verlauf" in der Kopfzeile des Editors, mit Vorschau und Wiederherstellen.

Zwei Entscheidungen dabei:
- Zwischen zwei Fassungen derselben Notiz liegen mindestens fünf Minuten.
  Ohne diese Sperre würde der Autosave im Sekundentakt hunderte fast
  gleicher Stände anlegen. Innerhalb des Fensters bleibt der älteste Stand
  erhalten, man kommt also verlässlich fünf, zehn, fünfzehn Minuten zurück
- Beim Wiederherstellen wird der aktuelle Stand vorher gesichert, das
  Zurückholen ist also selbst umkehrbar

Abschaltbar in den Einstellungen, Höchstzahl je Notiz dort einstellbar.
