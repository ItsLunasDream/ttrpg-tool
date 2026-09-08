# Konventionen

Regeln, die für alle Anwendungen und Pakete in diesem Workspace gelten, nicht
nur für den Backstory Creator. Sie sollen es leicht machen, künftige
Werkzeuge (Kampagnenplaner, Mapmaker, weitere) dazuzunehmen, ohne dass jedes
sein eigenes Datenformat und seine eigenen Annahmen mitbringt.

1. **Speicherformat: Markdown mit YAML-Kopf.**
   Menschenlesbar, versionierbar mit Git, in jedem Texteditor zu öffnen und
   notfalls von Hand zu reparieren. Erzwingt keine Datenbank und keinen
   Server — die Daten gehören der Person, die sie anlegt, nicht dem Werkzeug.

2. **Jede Datei trägt `schemaVersion`.**
   Ohne eine Versionsangabe im Dokument selbst lässt sich später nicht
   unterscheiden, ob eine Datei im alten oder im neuen Format vorliegt.
   `schemaVersion` macht spätere Migrationen erst möglich, weil ein Werkzeug
   dann gezielt nur die Dateien anfasst, die es auch versteht.

3. **IDs sind `[A-Za-z0-9_-]+`, der Dateiname ist die ID.**
   Die ID kommt ungeprüft in Dateipfade. Diese Zeichenmenge schließt `..`,
   Pfadtrenner, Leerzeichen und Sonderzeichen aus und hält Pfade damit sicher
   und plattformübergreifend gültig, ohne dass jedes Werkzeug seine eigene
   Maskierung erfinden muss.

4. **Geteilte Pakete sind plattformfrei.**
   Kein `node:fs`, kein `electron`, kein `@tauri-apps`, keine
   Browser-Globals (`window`, `document`, …) in `packages/*`. Nur so lassen
   sich Pakete unverändert in einer Electron-Anwendung, einer Tauri-Anwendung
   und im Browser verwenden. Plattformspezifischer Code (Dateizugriff,
   native Dialoge, …) lebt stattdessen je Anwendung in einer eigenen, klar
   benannten Datei innerhalb der jeweiligen App, nicht in einem geteilten
   Paket.

5. **Beziehungen sind gerichtet, ihr Typ ist Freitext.**
   Eine Beziehung hat eine Quelle, ein Ziel und eine Richtung, aber keine
   feste Aufzählung erlaubter Typen. Eine Kampagne bestimmt selbst, welche
   Beziehungsarten für sie Sinn ergeben (verbündet mit, untergeordnet,
   verfeindet mit, …), statt an eine im Werkzeug fest einprogrammierte Liste
   gebunden zu sein.
