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

6. **Englisch ist die voreingestellte Sprache, Deutsch eine Wahl.**
   Jedes Programm der Sammlung startet auf Englisch, solange niemand etwas
   anderes eingestellt hat. Die Programme werden veröffentlicht, und die
   meisten Menschen, die sie finden, lesen kein Deutsch. Wer Deutsch will,
   stellt es einmal um; die Wahl wird gespeichert und gilt weiter.

   Sprachliste, Voreinstellung und Platzhalterregeln kommen aus
   `packages/i18n` und stehen damit an einer Stelle. Die Texte selbst
   gehören zu der Anwendung, die sie anzeigt — ein gemeinsames Wörterbuch
   über alle Programme hinweg wäre schnell ein Sammelsurium aus Begriffen,
   die anderswo nicht passen.

   Kein Text steht fest in der Oberfläche. Jede Anwendung führt ihre
   Schlüssel vollständig in beiden Sprachen und hält das mit einem Test
   fest, auch dann, wenn es noch gar keinen Schalter zum Umstellen gibt:
   sonst ist die zweite Sprache an dem Tag, an dem der Schalter kommt, zur
   Hälfte veraltet.

7. **Jede Anwendung präfixt ihre IPC-Kanäle und bringt eine Montage-Datei mit.**
   In der Hülle laufen mehrere Anwendungen im selben Hauptprozess, und
   `ipcMain.handle` ist global. Zwei Anwendungen mit einem Kanal namens
   `settings:get` ergänzen sich nicht, die zweite Registrierung bricht ab —
   und der schlimmere Fall wäre der, in dem es durchgeht und die falsche
   Anwendung antwortet. Das Präfix ist die ID der Anwendung
   (`backstory:settings:get`) und wird an genau zwei Stellen gesetzt: beim
   Registrieren im Hauptprozess und beim Aufrufen im Preload. Die Aufrufer
   nennen weiter die kurzen Namen.

   Eingebettet wird über eine einzige Datei je Anwendung
   (`src/main/embed.ts`), die alles kapselt, was zum Einrichten gehört, und
   Preload, Oberfläche und das Sichern vor dem Schließen zurückgibt. Der
   eigenständige Hauptprozess der Anwendung benutzt dieselbe Datei. Zwei
   getrennte Wege würden auseinanderlaufen, und der eingebettete fiele erst
   auf, wenn ihn jemand benutzt.

   Kein Pfad wird aus `__dirname` erraten: beim Einbetten wandert der Code
   der Anwendung in das Bündel der Hülle, ihre Dateien aber nicht. Wo eine
   Anwendung liegt, sagt ihr die Hülle.

   Die Richtung ist festgelegt: die Hülle darf in eine Anwendung
   hineingreifen, eine Anwendung nie in die Hülle und nie in eine andere.
   Sonst wären sie nicht mehr einzeln lauffähig, und genau das sollen sie
   bleiben.

8. **`overrides` in der package.json der Wurzel gilt für alle — und nur dort.**
   npm beachtet das `overrides`-Feld ausschließlich in der Wurzel des
   Workspace-Baums; in der `package.json` eines einzelnen Apps oder Pakets
   trägt es nichts bei. Braucht eine Anwendung eine erzwungene Abhängigkeit
   (`apps/mapmaker` etwa bindet `rollup` per Alias auf `@rollup/wasm-node`,
   weil eine native `rollup.*.node`-Datei auf einem Entwicklungsrechner durch
   eine Windows-Application-Control-Richtlinie blockiert wird, siehe
   `apps/mapmaker/CLAUDE.md`), muss dieser Eintrag an der Wurzel stehen, sonst
   verschwindet der Schutz kommentarlos, sobald die Anwendung Teil des
   Workspace wird.

   Das gilt zwangsläufig für den ganzen Baum, nicht nur für die eine
   Anwendung — npm kennt keine Workspace-genauen Overrides. Wer eine
   Abhängigkeit hier einträgt, prüft deshalb Typecheck, Tests und Build aller
   Workspaces, nicht nur des eigenen.
