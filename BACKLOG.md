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
gefundene Textstelle soll sichtbar und farblich hervorgehoben sein.

Die Datenseite ist bereits da: `searchNotes` in
`src/renderer/noteIndex.ts` liefert pro Treffer einen `SearchHit` mit
`snippet` und `field` (Titel, Alias, Tag, Feld oder Rumpf). Die Notizliste
benutzt bislang nur `filterNotes` und wirft diese Information weg.

Zu klären beim Umsetzen:
- `NoteList` auf `searchNotes` umstellen, sobald ein Suchbegriff eingegeben
  ist, und den Ausschnitt unter dem Titel anzeigen
- Hervorhebung nicht per `dangerouslySetInnerHTML`, sondern den Ausschnitt in
  Textstücke zerlegen und den Treffer in ein `<mark>` setzen
- Mehrere Fundstellen pro Notiz: aktuell liefert `matchNote` nur den ersten
  Treffer. Falls alle gezeigt werden sollen, muss die Funktion erweitert
  werden
- Vielleicht zusätzlich im Editor markieren, wenn man von einem Treffer aus
  die Notiz öffnet. Das ist deutlich mehr Aufwand und sollte getrennt
  entschieden werden

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
