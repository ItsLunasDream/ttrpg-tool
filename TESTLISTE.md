# Testliste

Zum Durchgehen von Hand, auf dem Windows-Gerät. Hier steht nur, was die
automatischen Prüfungen **nicht** sehen können: das Aussehen, das Gefühl,
das Gerät und alles, was erst nach einem Neustart auffällt.

Was schon geprüft ist, steht nicht drin. `npm test` (801 Modelltests),
`npm run smoke`, `npm run smoke:backstory` und `npm run roundtrip` laufen in
der CI und decken die Logik ab.

Vorgehen: Zeile lesen, machen, Haken oder Notiz dahinter. Was nicht stimmt,
lieber mit einem Satz aufschreiben als mit einem Wort — „geht nicht" kostet
später eine Rückfrage.

---

## Zuerst: der frische Start

Am aussagekräftigsten auf einem Rechner, auf dem die Sammlung noch nie lief.
Ersatzweise den Datenordner umbenennen (`%APPDATA%\ttrpg-tools`).

- [ ] Beim allerersten Start geht das Willkommen auf, mit Symbol und vier Punkten
- [ ] „Los geht's" schließt es, und es kommt beim nächsten Start **nicht** wieder
- [ ] Beim ersten Öffnen jedes Werkzeugs kommt dessen eigene Einführung, genau einmal
- [ ] Einstellungen → „Einführungen wieder zeigen" holt sie zurück
- [ ] Die Texte der Einführungen stimmen: kein Werkzeug erklärt etwas, das es nicht tut

## Das Gerät

Das ist der Teil, den hier niemand prüfen kann.

- [ ] **Daumentaste zurück** (M4) springt im Verlauf zurück — im Startmenü
- [ ] … und auch, während ein Werkzeug offen ist und der Zeiger darüber liegt
- [ ] **Daumentaste vorwärts** (M5) ebenso
- [ ] Ein Druck geht **einen** Schritt, nicht zwei
- [ ] Nach einem Schritt zurück führt **vorwärts** wieder an dieselbe Stelle
- [ ] Das gilt auch innerhalb eines Werkzeugs (zwei Notizen im Story Creator)
- [ ] Alt+Pfeil links und rechts tun dasselbe
- [ ] Falls eine Taste nicht geht: geht die andere? Geht Alt+Pfeil? (grenzt die Ursache ein)
- [ ] Maus mit Herstellersoftware: sind M4/M5 dort auf etwas anderes umbelegt?

Wenn die Daumentasten **in einem offenen Werkzeug** nichts tun, misst dieses
Protokoll, woran es liegt — statt weiter zu raten:

```
setx TTRPG_TOOLS_TASTEN_LOG 1        (einmalig, danach neues Fenster)
```

Dann die Anwendung starten, im Startmenü zweimal die Daumentasten drücken,
ein Werkzeug öffnen, dort noch einmal drücken, beenden. Die Datei
`maustasten.log` im Datenordner (`%APPDATA%\ttrpg-tools`) enthält je Signal
eine Zeile: ob es als `app-command` am Fenster ankam oder aus dem Dokument,
aus welchem Werkzeug, und welches Ereignis es war. Bleibt sie beim Druck im
Werkzeug leer, kommt die Taste gar nicht an — dann liegt es an Chromium oder
am Treiber und nicht an der Hülle.

Danach wieder abschalten: `setx TTRPG_TOOLS_TASTEN_LOG 0`

- [ ] **Alt+Pfeil links** wirkt auch, während ein Werkzeug offen ist
- [ ] Die zwei Pfeile in der Titelleiste gehen zurück und vorwärts
- [ ] Sie sind ausgegraut, wenn es in die Richtung nichts zu holen gibt

## Fenster und Hülle

- [ ] Fenster maximieren, wiederherstellen, minimieren — auch per Doppelklick auf die Titelleiste
- [ ] Größe und Stelle des Fensters überleben einen Neustart
- [ ] Werkzeug wechseln: das Symbol wächst über den Schirm, dann kommt das Werkzeug
- [ ] Zurück ins Startmenü und wieder hinein: der Stand des Werkzeugs steht noch da
- [ ] Sprache umstellen: **alle** Werkzeuge ziehen sofort mit, auch die schon offenen
- [ ] Eigenes Symbol in den Symbolordner legen, „Symbole neu laden" — die Kachel zeigt es
- [ ] Ein kaputtes Bild hineinlegen: es passiert nichts Schlimmes, das eingebaute gilt

## Story Creator

- [ ] Einklapp-Pfeile: mittig auf Höhe der Überschrift, gut zu treffen
- [ ] Cursor **im Abschnitt** unter einer Überschrift, dann zuklappen: geht, und der Cursor springt zur Überschrift
- [ ] Eingeklappte Abschnitte stehen nach dem Speichern **nicht** in der Datei
- [ ] Graph: eine Notiz ohne Verbindung liegt in vernünftigem Abstand, die verbundenen sind lesbar
- [ ] PDF-Export mit Graph: farbig, groß genug, unten nicht abgeschnitten
- [ ] PDF-Export: ein Wiki-Verweis im Text springt zur gemeinten Notiz (im PDF-Betrachter klicken)
- [ ] Zoom im Editor (Strg+Mausrad) wirkt auf alle Notizen und nur auf das Textfeld
- [ ] Rechtschreibung: Rechtsklick auf ein angestrichenes Wort bringt Vorschläge
- [ ] Kampagne als ZIP sichern, dann wieder einlesen: die eingelesene bekommt eine neue Kennung

## Karteneditor

- [ ] **Notiz-Pin anklicken** öffnet ihren Text (das ging vorher nicht)
- [ ] Doppelklick auf einen Pin im Auswahl-Werkzeug öffnet ihn ebenfalls
- [ ] Der Auswahlrahmen sitzt **auf** dem Pin, nicht daneben
- [ ] Pin ziehen verschiebt ihn, Rechtsklick löscht ihn
- [ ] Ein Klick ins Leere mit dem Notiz-Werkzeug legt weiter eine neue Notiz an
- [ ] Export als Universal VTT, Import in Foundry: Wände, Türen und Lichter kommen an

## Inspirationshilfe

- [ ] Das Geflecht steht klein in der Karte und drängt nichts an den Rand
- [ ] Klick darauf öffnet es groß, Escape und Klick daneben schließen
- [ ] Groß sind Namen und Muster lesbar (nicht bloß das kleine Bild gedehnt)
- [ ] Thema/Region wechseln, dann „Alles von der KI": das Ergebnis passt zum **neuen** Thema
- [ ] Dasselbe mit einem festgehaltenen Baustein: der bleibt stehen, der Rest ist neu
- [ ] Eigener Text in der Auswahl (z. B. „Schwebende Inseln"): der Würfelknopf ist gesperrt, mit Hinweis
- [ ] „Karte anlegen": der Karteneditor geht auf, die Karte heißt wie der Ort und trägt Notiz-Pins
- [ ] Steht auf der offenen Karte schon etwas, fragt er vorher nach — auch wenn nur eine Notiz darauf liegt
- [ ] Übernehmen: im Story Creator liegt eine Notiz „Überblick" mit Verweisen auf alle Figuren

## Initiative Tracker

- [ ] Gruppe mit sechs Gegnern: eine Initiative, sechs Trefferpunktsätze
- [ ] Zustand mit Dauer zählt selbst ab
- [ ] Geländeereignis läuft bei Initiative 20 und wird nicht durchgestrichen
- [ ] Leertaste heißt weiter, Schaden tippen und mit Enter anwenden

## Würfel

- [ ] Die Silhouetten sind auseinanderzuhalten, auch bei kleinem Fenster
- [ ] Zahlen bleiben auf jeder Würfelfarbe lesbar
- [ ] 3D einschalten: die Würfel fallen, das Ergebnis stimmt mit der Anzeige überein
- [ ] Auf einem Rechner ohne Grafikbeschleunigung bleibt es automatisch flach

## NPC Creator

- [ ] Einzelne Felder nachwürfeln, Schloss setzen, von Hand überschreiben
- [ ] Export legt eine Notiz in der offenen Kampagne an, die Liste dort zieht sofort nach

## KI (nur wenn eingerichtet)

- [ ] Ollama: Verbindung prüfen meldet „bereit"
- [ ] Claude/OpenAI-Dienst: Schlüssel speichern, prüfen, wieder entfernen
- [ ] Ohne KI läuft alles weiter, nur die KI-Knöpfe sind still
- [ ] Ein Wechsel des Anbieters kommt in den offenen Werkzeugen sofort an

## Zum Schluss: Neustart

- [ ] Alles schließen und neu starten: Sprache, KI-Einstellung, Fenstergröße und Symbole stehen wie vorher
- [ ] Der Datenordner enthält nichts Überraschendes

## Monster Creator

- [ ] Grad, Art und Rolle einstellen, würfeln: der Steckbrief passt zur Rolle (ein Schütze teilt mehr aus als ein Verteidiger)
- [ ] Der Befund unter dem Steckbrief steht auf „Passt", wenn frisch gewürfelt wurde
- [ ] Im Reiter „Prüfen" absichtlich Unsinn eintragen: die Ampel schlägt aus und nennt Vorschläge
- [ ] Ein Vorschlag als Knopf angeklickt setzt den Wert wirklich
- [ ] „In die Sammlung" speichert; die Datei liegt im Datenordner unter `monster/monster/`
- [ ] Die Datei in einem Texteditor öffnen: der YAML-Kopf trägt alle Zahlen
- [ ] Sammlung: Kacheln und Liste zeigen dasselbe
- [ ] Suche: „untot" findet die Art, „4" den Grad, „untot 4" beides zugleich
- [ ] „Variante anlegen" auf einem anderen Grad: die Zahlen wandern, Name und Texte bleiben
- [ ] Mit KI: die Meldung sagt, was nachgezogen wurde, und der Weg zurück zum Vorschlag geht
- [ ] Ohne KI läuft alles; nur die KI-Knöpfe fehlen
- [ ] „In den Story Creator" legt eine Notiz in der offenen Kampagne an
- [ ] Der Steckbrief sieht aus wie ein Statblock: Kapitälchen, Attributreihe, Abschnitte
- [ ] Bei jedem Angriff steht Waffe, Reichweite, Trefferbonus und Schadensart
- [ ] Die Waffe passt zum Wesen (eine Bestie führt keine Hellebarde)
- [ ] Zehnmal würfeln: nicht jedes Monster hat Resistenzen, und nicht jedes fliegt
- [ ] Zehnmal würfeln: die Namen wiederholen sich nicht, es kommen auch Einzelnamen
- [ ] Grad 30: deutlich mehr Fähigkeiten als auf Grad 1
- [ ] Legendäre Aktionen an: der Abschnitt taucht wirklich auf
- [ ] Kampfentfernung „Fernkampf": es kommt kein Nahkampfangriff heraus
- [ ] Mit KI: der eigene Wunsch schlägt im Ergebnis durch

## Status Effect Creator

- [ ] Art, Thema, Härte und Stufenzahl einstellen, würfeln: jede Stufe ist schlimmer als die davor
- [ ] Unter dem Blatt steht das Gewicht mit Vergleich und mit dem Satz, was es nicht bedeutet
- [ ] Die Kurve zeigt jede Stufe; ein großer Sprung wird als Hinweis genannt
- [ ] Dauer, „Schlimmer" und „Besser" passen zeitlich zusammen (keine Stunde bei einer Runde Dauer)
- [ ] Ein Ort als Auslöser steht nur bei Zuständen aus der Umgebung
- [ ] Zehnmal würfeln: die Namen und Kurzsätze wiederholen sich nicht
- [ ] Reiter „Paket": mehrere Zustände auf einmal, und es steht „Abgestimmt" darunter
- [ ] „Alle in die Sammlung" speichert wirklich alle
- [ ] „Karte zum Vorlesen": vorn steht, was die Figur merkt, hinten die Regel
- [ ] Die Karte als PDF speichern, ausdrucken und ansehen: passt sie auf die Seite?
- [ ] Mit KI: unbrauchbare Antworten werden mit Begründung zurückgewiesen
- [ ] „Ausformulieren lassen" macht Sätze aus den Stichpunkten, ohne die Regel zu ändern
- [ ] „In den Story Creator" legt eine Notiz in der offenen Kampagne an
