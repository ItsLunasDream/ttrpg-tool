# Backlog

Gesammelte Aufgaben, die noch nicht umgesetzt sind. Reihenfolge innerhalb
eines Abschnitts ist keine Priorisierung.

## Offene Wünsche

### Textanfang in der Kurzinfo-Karte zeigen

Beim Überfahren eines `[[Links]]` zeigt die Kurzinfo aktuell nur Titel, Typ,
Aliase, Steckbrieffelder und Tags. Zusätzlich soll der Anfang des Textes zu
sehen sein, damit man ohne Notizwechsel einschätzen kann, worum es geht.

Betrifft `src/renderer/components/InfoCard.tsx`. Der Rumpf liegt bereits im
Notizobjekt vor, es fehlt nur die Darstellung.

Zu klären beim Umsetzen:
- Länge des Ausschnitts, Vorschlag: erste zwei bis drei Zeilen, hart begrenzt
  auf etwa 200 Zeichen mit Auslassungszeichen
- Markdown-Syntax im Ausschnitt entfernen, sonst stehen `##` und `[[` in der
  Karte. `countWords` in `src/renderer/editor/markdown.ts` macht so eine
  Bereinigung bereits, die Logik lässt sich herausziehen
- Karte darf dadurch nicht unbegrenzt wachsen, sie ist auf 300 px Breite fest

### Fundstelle in der Suche farblich markieren

Die Volltextsuche filtert die Notizliste, zeigt aber nur die Titel. Die
gefundene Textstelle soll sichtbar und farblich hervorgehoben sein, in der
Trefferliste **und** im Editor, wenn man den Treffer öffnet. Vorbild ist die
Suche in VS Code: alle Vorkommen markiert, mit Sprungmöglichkeit zwischen
ihnen.

Die Datenseite ist für die Trefferliste bereits da: `searchNotes` in
`src/renderer/noteIndex.ts` liefert pro Treffer einen `SearchHit` mit
`snippet` und `field` (Titel, Alias, Tag, Feld oder Rumpf). Die Notizliste
benutzt bislang nur `filterNotes` und wirft diese Information weg.

Teil 1, Trefferliste:
- `NoteList` auf `searchNotes` umstellen, sobald ein Suchbegriff eingegeben
  ist, und den Ausschnitt unter dem Titel anzeigen
- Hervorhebung nicht per `dangerouslySetInnerHTML`, sondern den Ausschnitt in
  Textstücke zerlegen und den Treffer in ein `<mark>` setzen
- Mehrere Fundstellen pro Notiz: `matchNote` liefert aktuell nur den ersten
  Treffer und muss dafür erweitert werden

Teil 2, Markierung im Editor:
- Als ProseMirror-Dekoration umsetzbar, dieselbe Technik wie bei den
  Wiki-Links in `src/renderer/editor/wikiLinkExtension.ts`. Der Suchbegriff
  kommt als veränderliche Referenz herein, wie dort der Notizindex
- Zusätzlich zur reinen Markierung braucht es für das VS-Code-Gefühl eine
  aktive Fundstelle mit eigener Farbe, Sprung zur nächsten und vorherigen
  (F3 bzw. Umschalt+F3), Trefferzähler und Scrollen zur Fundstelle
- Offen: reicht die Markierung des Begriffs aus der Seitenleiste, oder soll
  es eine eigene Suchleiste im Editor geben (Strg+F), die unabhängig von der
  Notizsuche funktioniert. VS Code hat beides getrennt. Vorschlag: mit der
  Markierung aus der Seitenleiste anfangen, die eigene Suchleiste erst
  danach entscheiden

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
