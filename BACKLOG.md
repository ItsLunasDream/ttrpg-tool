# Backlog

Gesammelte Aufgaben, die noch nicht umgesetzt sind. Reihenfolge innerhalb
eines Abschnitts ist keine Priorisierung.

## Offene Wünsche

### Zoom mit dem Mausrad im Editor, GUI-Größe separat in den Einstellungen

Zwei getrennte Wünsche:

- Im Textfeld des Editors soll das Mausrad, gehalten mit einer Modifikatortaste
  (z. B. Strg, analog zu Browsern), die Schriftgröße des bearbeiteten Textes
  ändern. Das gilt NUR innerhalb des Editorfelds, nicht für die restliche
  Oberfläche (Seitenleiste, Kopfzeile, Dialoge).
- Unabhängig davon soll es in den Einstellungen eine eigene Option geben, mit
  der sich die Größe der gesamten Oberfläche (GUI) ändern lässt, nicht nur die
  des Editortextes.

Beides sollte dauerhaft gespeichert werden (wie die übrigen Einstellungen),
nicht nur für die laufende Sitzung gelten.

### Graph: laufende Simulation beim Ziehen

Die Anordnung wird einmal berechnet. Zieht man einen Knoten, folgen die
anderen nicht nach. Eine weiterlaufende Simulation wäre schöner, kostet aber
Rechenzeit und macht die Ansicht unruhig.

### Weitere Sprachen

Deutsch und Englisch sind umgesetzt. Eine weitere Sprache ist ein Eintrag in
`LANGUAGES` und ein Wörterbuch in `src/shared/i18n.ts`, sonst nichts. Der Test
„jeder deutsche Schlüssel hat eine englische Entsprechung" müsste dann auf
alle Sprachen erweitert werden.

Eine Stelle wäre dann noch zu ändern: die Trefferliste beschriftet Funde in
Aliasen und Tags mit den festen Wörtern „Alias" und „Tag" (`matchNote` in
`src/renderer/noteIndex.ts`). In beiden bisherigen Sprachen heißen sie
zufällig gleich, deshalb fällt es nicht auf.

## Bekannte Grenzen

- Der Dateiname einer Notiz wird zu ihrer ID und darf deshalb nur Buchstaben
  ohne Umlaute, Ziffern, `-` und `_` enthalten. Wer eine eigene Datei ablegt,
  muss sie entsprechend benennen; die Notizliste sagt jetzt, dass es daran
  liegt. Die Beschränkung bleibt, weil aus der ID ein Pfad wird
- Stehen doppelte eckige Klammern in einer Adresse (`…?a=[[b]]`), zählt das
  nicht als Wiki-Link, die Adresse wird beim Speichern aber zur
  ausgeschriebenen Linkschreibweise `[Text](Adresse)`. Sie bleibt dabei heil
  und ändert sich danach nicht weiter
- Ein Wiki-Link, der in der Datei über zwei Zeilen umgebrochen ist, gilt nicht
  als Link. Der Editor bricht nie um, das kann also nur aus einem anderen
  Programm kommen. Die Beschränkung ist gewollt: ohne sie verschluckt eine
  offene doppelte Klammer alles bis zur nächsten schließenden
- Doppelte eckige Klammern in der Adresse eines ausgeschriebenen Verweises
  werden erkannt und in Ruhe gelassen, außer die Adresse enthält selbst runde
  Klammern (`[Text](…/Foo_(bar)/[[c]])`). Dann geht die Adresse beim Speichern
  kaputt. Sehr enger Fall
- Steht ein Wiki-Link mit maskiertem Senkrechtstrich (`[[Mira\|ihr]]`) in
  einem Codeblock, verliert er beim Speichern die Maskierung. Die Maskierung
  gehört in eine Tabellenzelle, und beim Zurücksetzen der Links ist noch nicht
  bekannt, wo sie stehen. Sehr enger Fall, aber notiert
- Ein maskierter Senkrechtstrich in einem Code-Ausschnitt (`` `a \| b` ``)
  erscheint in der Kurzinfo ohne den Backslash. Betrifft nur Vorschau und
  Wortzahl, nicht die Datei
- Der Editor vereinheitlicht beim ersten Speichern die Schreibweise des
  Markdowns: Listen bekommen drei Leerzeichen nach dem Strich und eine
  Leerzeile zwischen den Punkten, ein `*` oder `_` im Fließtext wird maskiert,
  ein Codeblock bekommt eine Leerzeile vor dem Schlusszaun. Am Dargestellten
  ändert das nichts, und ein zweiter Durchlauf ändert nichts mehr; ein Test
  hält diese Stabilität fest. Wer die Dateien parallel in Obsidian pflegt,
  sieht die Umstellung aber einmal

- Sobald eine Knotenstelle gesetzt ist, rechnet der Graph zweimal: einmal, um
  die natürliche Größe zu messen, einmal mit dem daraus abgeleiteten
  Wunschabstand. Bei 500 Notizen sind das rund 1,3 statt 0,6 Sekunden beim
  Öffnen. Ein kürzerer Messlauf reicht nicht, das Netz dehnt sich bis zuletzt
  weiter aus
- Beim Kampagnenwechsel werden alle Notizen der Kampagne in den Speicher
  geladen. Für einige hundert Notizen unkritisch, darüber bräuchte es einen
  Index statt Volllast
- Umbenennen einer Notiz schreibt alle betroffenen Dateien einzeln. Bricht es
  mittendrin ab, zeigen einige Links schon auf den neuen Namen, der noch nicht
  vergeben ist. Der Titel wird zuletzt gesetzt, ein erneutes Umbenennen holt
  den Rest deshalb nach
- Bei mehrdeutigen Namen gewinnt beim Verlinken weiterhin die erste Notiz.
  Immerhin wird jetzt darauf hingewiesen
- Der Versionsverlauf wächst mit und landet auch in der ZIP-Sicherung. Bei
  vielen Notizen und hoher Höchstzahl kann das spürbar werden
- Rohes HTML in einer Datei (`<div>`, `<span style=…>`) überlebt das Öffnen
  nicht: der Editor kennt diese Elemente nicht, es bleibt der Text darin. Die
  Auszeichnung ist danach weg. Gewollt, weil beliebiges HTML sonst ungeprüft
  im Dokument stünde
- Eine Datei mit BOM oder CRLF wird beim Speichern auf UTF-8 ohne BOM und LF
  vereinheitlicht. Am Inhalt ändert das nichts, in einem Vergleichswerkzeug
  sieht man es aber einmal als vollständige Änderung
- Wird eine Notizdatei außerhalb geändert, während sie im Editor offen ist,
  gewinnt beim nächsten Speichern der Editor. Es gibt keine Überwachung der
  Dateien; fremde YAML-Schlüssel der externen Änderung werden dagegen
  übernommen, weil sie erst beim Schreiben gelesen werden
- Der PDF-Export bietet keine Auswahl von Schriftart, Rand oder Seitengröße
- Die Windows-Anwendung ist nicht signiert, Windows zeigt beim ersten Start
  eine SmartScreen-Warnung. Eine Signatur bräuchte ein kostenpflichtiges
  Zertifikat

## Erledigt

### Testrunde mit simulierten Nutzerinnen

Fünf Agenten haben die gebaute Anwendung bedient, jede mit einem eigenen
Anspruch: Anfängerin, Vielschreiberin, Ordnungsliebende, Obsidian-Umsteigerin
und ein Chaos-Tester. Alle Funde wurden danach selbst nachgeprüft, nicht
ungeprüft übernommen. Sechs echte Fehler kamen dabei heraus:

- **Wiederherstellen löschte den Text.** Der Sicherheitsschnappschuss vor dem
  Zurückholen lief durch dasselbe Fünf-Minuten-Sperrfenster wie ein
  gewöhnliches Speichern. Wer eine Stunde schrieb und dabei immer wieder
  speicherte, hatte keine Fassung im Verlauf und verlor beim Wiederherstellen
  alles, obwohl der Dialog ausdrücklich zusagt, dass es umkehrbar ist. Der
  Schnappschuss vor dem Zurückholen umgeht das Sperrfenster jetzt
- **Aufgabenlisten verloren den Haken.** `- [x] erledigt` wurde beim Speichern
  zu einer gewöhnlichen Liste, der Editor kannte kein Ankreuzfeld
- **Notiztypen aus einer anderen Kampagne wurden verschluckt.** Der erste
  eigene Typ jeder Kampagne hieß intern `neuer_typ`, weil die Kennung aus dem
  Platzhalter entstand
- **Zurückgeholte Werksfelder blieben leer**, weil sie teils englische
  Schlüssel tragen (`class` für „Klasse")
- **Fußnoten** `[^1]` wurden zu `\[^1\]` und waren in Obsidian keine mehr
- **Der Versionsverlauf gelöschter Notizen** blieb für immer auf der Platte

Nicht bestätigt haben sich: angeblich langsames Speichern von Aliasen und Tags
(das ist die Entprellung, die bei jeder Änderung neu anläuft), und
verschwindende Dateien in einem Testlauf (zwei Agenten teilten sich `/tmp`).


### Assistent auch in groß, im Schreibhilfe-Dialog

Der Dialog heißt jetzt „Schreibhilfe und KI" und hat zwei Reiter:
„Vorschläge (ohne KI)" und „KI-Assistent". Beide Male steht ausgeschrieben in
der Beschriftung, was dahintersteckt: die Vorschläge kommen ohne Modell aus,
der Assistent fragt eines.

Der KI-Reiter zeigt dasselbe Gespräch wie die Sidebar, nur mit mehr Platz:
abgesetzte Blasen, größere Schrift, der Verlauf läuft beim Antworten mit.

Das Gespräch liegt dafür in einem Kontext (`src/renderer/assistant.tsx`) statt
im Zustand der Sidebar. Beide Ansichten holen es von dort, sonst stünde in der
einen etwas anderes als in der anderen. Beim Notizwechsel fängt es von vorn
an, weil als Kontext immer die offene Notiz mitgeht; eine noch laufende
Antwort wird dabei verworfen statt in das neue Gespräch geleitet.

### Eingefügtes Markdown wird ausgewertet

Auf Wunsch umgesetzt: eingefügter reiner Text läuft durch den Markdown-Leser,
aus `**fett**` wird also fetter Text. Text mit eigener Formatierung (aus dem
Editor selbst oder aus einem Browser) bleibt unangetastet, ebenso eine einzelne
Adresse über markiertem Text, die weiterhin verlinkt statt eingefügt wird.

In einem Codeblock bleibt Eingefügtes wörtlich, und spitze Klammern im Text
werden als Text behandelt, nicht als HTML.

Der Preis, der vorher als Gegenargument notiert war, bleibt bestehen: `5 * 3
und 2 * 4` wird beim Einfügen kursiv. Strg+Z macht es rückgängig.

### Steckbrief bearbeiten und Export zusammengefasst

Neben der Überschrift „Steckbrief" steht jetzt „Felder bearbeiten" und öffnet
den Notiztypen-Dialog. Der Eintrag im Kampagnen-Menü bleibt, aber der Weg von
„ich will dieses Feld umbenennen" zum Knopf führt nicht mehr quer über die
Kopfzeile.

Die beiden Knöpfe „MD" und „PDF" in der Kopfzeile des Editors liegen unter
einem gemeinsamen „Export". Im Kampagnen-Menü standen die drei Exporte schon
beieinander und bleiben, wo sie sind.

### Graph: Beziehungstexte nebeneinander

Beide Richtungen zwischen zwei Knoten zeichneten Linie und Beschriftung auf
denselben Punkt. Deshalb standen die Texte ineinander, schon bei zwei Notizen.

Gibt es die Gegenrichtung, werden beide Linien jetzt um denselben kleinen
Betrag zur Seite versetzt, jede in ihre eigene Richtung. Die Beschriftung
liegt außen an ihrer eigenen Linie, damit eindeutig ist, welche Bezeichnung
wohin gilt. Der Versatz ist klein genug, dass beim Herauszoomen wieder eine
Linie daraus wird.

Die Notbremse `LABEL_LIMIT` bleibt: bei mehr als zwanzig Kanten erscheinen
weiterhin nur die Beschriftungen rund um den Knoten unter der Maus. Der
Versatz löst das Aufeinanderliegen zweier Richtungen, nicht das Gedränge in
einem dichten Netz.

### Graph: verschobene Knoten behalten ihre Stelle

Wer einen Knoten verschiebt, findet ihn beim nächsten Öffnen dort wieder. Die
Stellen liegen in `campaign.json` unter `graphPositions`, nicht in den
Notizdateien: eine Stelle im Graphen sagt nichts über die Notiz aus.

Gespeicherte Knoten gehen als feste Punkte in die Anordnung ein und werden von
der Berechnung nicht mehr angefasst. Kommt eine Notiz dazu, ordnet sie sich um
die vorhandenen herum ein, statt das ganze Netz zu verschieben. Das Einpassen
in die Fläche entfällt dann, es würde genau die Knoten verschieben, die stehen
bleiben sollen.

„Neu anordnen" wirft die gesetzten Stellen weg, das ist der Sinn des Knopfes.
Eine Rückfrage davor gibt es bewusst nicht: der Knopf heißt, was er tut, und
ein Versehen ist mit erneutem Verschieben behoben.

Gespeichert wird beim Loslassen, nicht während des Ziehens. Beim Löschen einer
Notiz fällt ihre Stelle mit weg.

### Tabellen, Links und der Markdown-Rundlauf

In der Nacht auf den 2. September mit einer Sonde geprüft, was der Editor beim
Laden und Speichern am Markdown verändert. Die Sonde ist als
`scripts/roundtrip.cjs` geblieben und läuft in der CI mit.

Gefunden und behoben wurden vier Wege, auf denen Text still verlorenging:

- **Tabellen** wurden zu einer Textwurst zusammengezogen. Der Editor kennt sie
  jetzt, samt Knöpfen für Zeilen und Spalten
- **Links** verloren ihre Adresse und blieben als bloßes Wort zurück. Der
  Editor kennt sie jetzt, mit Knopf in der Werkzeugleiste und Strg+Klick
- **Überschriften** ab der vierten Ebene wurden zu gewöhnlichem Text
- **Durchgestrichenes** verschwand, obwohl die Werkzeugleiste es anbietet

Dazu ein Bündel kleinerer Sachen: Trennlinien behalten ihre Schreibweise,
Leerzeichenreste am Zeilenende werden nicht mitgeschrieben, eine bloße Adresse
bleibt bloß, und Wiki-Links überstehen Sonderzeichen im Titel. Die Grenzen, die
geblieben sind, stehen oben.

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

### Export als Markdown und PDF

Beides gibt es für eine einzelne Notiz und für die ganze Kampagne.

**Markdown** schreibt in einen gewählten Ordner: je Notiz eine Datei mit
ausgeschriebenem Steckbrief statt YAML-Kopf, dazu Beziehungen und
Erwähnungen. `[[Wiki-Links]]` bleiben stehen, in einem Ordner voller
exportierter Notizen sind sie in Obsidian weiterhin klickbar. Benutzte Bilder
werden mitkopiert, der Export steht also für sich.

**PDF** rendert über ein unsichtbares Druckfenster, mit eigenem Drucklayout:
heller Grund, Serifenschrift, Portrait als umflossenes Bild, Seitenumbruch je
Notiz. Wiki-Links werden zu ihrem Anzeigetext, im PDF ist ohnehin nichts
klickbar.

### Schreibhilfe ohne KI

Sechs Kategorien (Herkunftsort, Früheres Leben, Wendepunkt, Geheimnis,
Bindung, Ziel) mit je 24 Vorschlägen, aufrufbar über „Schreibhilfe" in der
Kopfzeile des Editors. Oben vier zufällige Vorschläge zum Würfeln, darunter
die vollständige Liste. Ein Klick hängt den Vorschlag an den Text an.

Wie im Backlog angemerkt: die Vorschläge sind von mir geschrieben und damit
das schwächste Glied. Deshalb liegen sie als `writing-prompts.json` im
Speicherort und sind mit jedem Texteditor zu ändern. Eigene Kategorien lassen
sich ergänzen, die Vorlage komplett ersetzen. Eine kaputte Datei fällt auf die
Vorlage zurück, unbrauchbare Einzeleinträge werden übersprungen.

### Graph-Ansicht

Über „Graph" in der Kopfzeile, je Kampagne. Knoten sind Notizen, eingefärbt
nach Notiztyp und in der Größe nach Anzahl der Verbindungen. Kanten sind
gerichtet: durchgezogen und beschriftet für Beziehungen, gestrichelt für
Erwähnungen aus `[[Links]]`. Umschaltbar zwischen beiden und beidem.

Beim Überfahren eines Knotens treten er und seine Nachbarn hervor, ein Klick
öffnet die Notiz, Knoten lassen sich verschieben.

Die kräftebasierte Anordnung ist von Hand geschrieben statt mit einer
Bibliothek: das Netz einer Kampagne ist klein, und so bleibt die Anwendung
ohne zusätzliche Abhängigkeit. Sie ist wiederholbar, dieselbe Kampagne sieht
also gleich aus. Nach der Simulation wird das Ergebnis in die Fläche
eingepasst, sonst hängt die Größe des Netzes von der Knotenzahl ab.

### KI-Assistent, Phase 4

Sidebar im Editor mit drei Aufgaben: Fragen zum Weiterdenken, Konsistenzcheck
gegen die verlinkten Notizen, Stilfeedback. Kein Textgenerator: die
Systemanweisung verbietet fertige Absätze ausdrücklich, und die Antwort landet
in der Sidebar, nie im Text.

Zwei Anbieter hinter einem gemeinsamen Interface (`src/main/ai/provider.ts`):
- **Ollama**, lokal und kostenlos, Adresse und Modell einstellbar
- **Claude API**, kostenpflichtig, Modell einstellbar

Ein dritter Anbieter ist eine Datei, kein Eingriff in die Anwendung. Das
Interface wurde wie angekündigt erst zusammen mit den beiden echten
Implementierungen entworfen.

Entscheidungen dabei:
- Alle Netzaufrufe laufen im Hauptprozess. Der Renderer behält keinen
  Netzzugriff, und der API-Schlüssel erreicht ihn nie
- Der Schlüssel wird mit dem Schlüsselbund des Systems verschlüsselt. Steht
  das nicht zur Verfügung, wird gar nicht gespeichert: ein Schlüssel im
  Klartext wäre schlechter als keiner
- Als Kontext gehen nur die verlinkten Notizen mit, gekürzt und auf zwölf
  begrenzt. Sonst wächst die Anfrage mit der Kampagne und wird teuer, ohne
  besser zu werden
- Fehlermeldungen der Anbieter tragen Schlüssel statt fertiger Texte, sonst
  wären sie bei englischer Oberfläche weiterhin deutsch

### KI für die ganze Sammlung: packages/ki und die Hülle

Der NPC Creator sollte die KI mitbenutzen, und ein zweiter Satz derselben
Dateien wären zwei Sätze, die auseinanderlaufen. Also wanderten die Anbieter
nach `packages/ki`, und die Einstellung selbst in die Hülle.

Was dabei entschieden wurde:

- **Das Paket bringt den Mechanismus, nicht die Aufgaben.** Die Anbieter, die
  Fehlerschlüssel, die Schnittstelle. Was gefragt wird, bleibt bei der
  Anwendung, die fragt — `prompts.ts` des Backstory Creators wanderte nicht
  mit. Die Schnittstelle wurde dabei schmaler: `frage()` nimmt nur noch
  Systemanweisung und Nachrichten, statt einer Anfrage mit Notiz und Aufgabe,
  die beide Anbieter ohnehin ignoriert haben. So passt sie auch auf Fragen,
  in denen keine Notiz vorkommt.
- **Der Schlüsselbund bleibt draußen.** Verschlüsseln kann nur, wer ihn kennt,
  und `electron` hat in einem geteilten Paket nichts zu suchen (Regel 4). Der
  Schlüssel wird beim Bauen des Anbieters übergeben.
- **Ein zweiter Einstiegspunkt `@suite/ki/einstellungen`.** Eine Oberfläche
  muss die Einstellungen anzeigen, ohne die Anbieter mitzuladen. Über den
  Hauptzugang kam das Anthropic-SDK ins Bündel des Renderers — gemessen, nicht
  vermutet: es stand wirklich darin. Jetzt nicht mehr, und ein Rauchtest
  würde es merken.
- **Die Einstellung liegt in der Hülle, nicht je Werkzeug.** Ein Sprachmodell
  richtet man einmal ein und benutzt es dann überall; wer den Schlüssel in
  jedem Werkzeug neu eintippen müsste, tippt ihn zweimal falsch. Anders als
  die Sprache, die jedes Werkzeug bewusst für sich führt.
- **Eingebettet gilt die der Hülle, eigenständig die eigene.** Der Backstory
  Creator bekommt eine `kiQuelle` durchgereicht; ist sie gesetzt, verschwindet
  sein eigener KI-Abschnitt aus den Einstellungen und ein Satz sagt, wo es
  stattdessen steht. Zwei Stellen für dieselbe Sache wären eine zu viel, und
  wer in der falschen einstellt, sucht den Fehler lange.
- **Übernahme statt Neueintippen.** Wer die KI früher im Backstory Creator
  eingerichtet hat, findet sie beim ersten Start der Hülle wieder. Der
  verschlüsselte Schlüssel wandert unverändert mit: derselbe Rechner,
  derselbe Schlüsselbund. Genau einmal — steht in der Hülle schon etwas,
  greift die Übernahme nicht mehr.
- **„Ein Schlüssel ist hinterlegt" heißt: er lässt sich auch aufmachen.** Ein
  Block aus einem anderen Konto ist so gut wie keiner. Sonst stünde in den
  Einstellungen „Ein Schlüssel ist hinterlegt" direkt neben „Kein
  API-Schlüssel hinterlegt".
- **Die Bereitschaftsprüfung hat eine Frist.** Vier Sekunden, ohne
  Wiederholung. Das SDK wartet von sich aus zehn Minuten, und wer auf
  „Verbindung prüfen" drückt, will nicht zehn Minuten warten, um zu erfahren,
  dass kein Netz da ist. Aufgefallen ist das im Rauchtest, der daran hing.
- **Teilstücke werden zusammengeführt, nicht ersetzt.** Die Oberfläche schickt
  nur, was sie geändert hat. Würde das als ganze Einstellungsdatei gelten,
  löschte ein Sprachwechsel die KI-Einstellung — und niemand käme auf die
  Idee, dort zu suchen. Ein Rauchtest hält genau das fest.

### KI im NPC Creator: frei vorschlagen, nicht aus der Tabelle

Die Entscheidung kam von der Nutzerin: „KI soll unabhängig von der Tabelle
Vorschläge geben." Die Tabellen bleiben der Weg ohne KI und ändern sich nicht;
das Modell schlägt daneben frei vor. Wäre es auf die Tabelleneinträge
festgelegt, wäre es ein langsamer und teurer Würfel.

Zwei Wege: ein Knopf für die ganze Figur, und einer je Zeile für ein
einzelnes Feld.

Der Unterschied zum Assistenten des Backstory Creators ist grundsätzlich.
Dort darf das Modell ausdrücklich **nicht** schreiben, weil die
Hintergrundgeschichte der Autorin gehört. Hier **soll** es schreiben — eine
Randfigur, die gleich am Tisch auftaucht, will niemand selbst ausformulieren.
Dieselbe Anbindung, entgegengesetzte Systemanweisung.

Was dabei entschieden wurde:

- **Festgehaltene Felder gehen als gesetzt mit** und werden nicht neu
  erfunden, genau wie beim Würfeln. Sonst wäre das Schloss beim KI-Knopf
  wirkungslos, und das fällt erst auf, wenn der gute Name weg ist. Ein leeres
  Feld gilt dabei nicht als gesetzt: „Das steht fest: Eigenheit: " wäre eine
  Vorgabe ohne Inhalt und hielte das Feld dauerhaft leer.
- **Ein Vorschlag wird behandelt wie ein getippter Text.** Er landet im selben
  bearbeitbaren Feld und wird dabei festgehalten — er ist jetzt der Wert, den
  man behalten will.
- **Eine Länge steht in der Anweisung, nicht nur im Code.** Die
  Tabelleneinträge sind Halbsätze; ein Modell, dem man nichts sagt, schreibt
  einen Absatz, und die Figur ließe sich nicht mehr überfliegen. Beim
  Auswerten wird trotzdem gekürzt: ein Modell, das sich nicht an die
  Abmachung hält, darf die Figur nicht unlesbar machen.
- **Bei der Eigenheit wird ausdrücklich gebremst.** Bei den Tabellen sorgt die
  Wahrscheinlichkeit dafür, dass die meisten Figuren keine Marotte haben. Ohne
  einen Satz dazu liefert das Modell jedes Mal eine Schrulle, und jede Figur
  wird zur Karikatur.
- **Ohne eingerichtete KI sind die Knöpfe nicht da**, nicht ausgegraut.
  Eingerichtet wird sie in der Hülle; hier gäbe es dafür nichts zu klicken,
  und ein grauer Knopf wäre eine Einladung zum Suchen.
- **Ein Fehlschlag lässt die Figur unangetastet.** Unbrauchbare Antwort,
  Fehler des Anbieters, kein Netz: es kommt ein Satz, kein halb ersetztes
  Feld und kein abgebrochener Aufruf.
- **`connect-src` bleibt zu.** Die Anfrage geht vom Hauptprozess aus. Der
  Renderer bekommt keinen Netzzugriff, und der API-Schlüssel erreicht ihn nie.

Der Rauchtest täuscht nur das Modell vor — ein kleiner HTTP-Server, der sich
wie Ollama verhält. Alles davor und danach ist echt. Dabei fiel auf, dass der
neue KI-Knopf die Reihenfolge der Knöpfe in einer Zeile verschoben hatte und
der ältere Rauchtest deshalb nicht mehr das Schloss traf, sondern die KI. Das
Schloss hat jetzt eine eigene Klasse; ein Test, der auf Reihenfolge zeigt,
zeigt beim nächsten Knopf wieder daneben.

### Eigene Bilder als Symbole der Werkzeuge

Die eingebauten Symbole sind Vektoren im Quelltext und ausdrücklich
Platzhalter. Wer eigene will, legt sie in den Ordner `symbole` im Datenordner
der Hülle, benannt nach der Kennung des Werkzeugs: `backstory.png`,
`mapmaker.png`, `initiative.png`, `dice.png`, `npc.png`. Zwei Knöpfe in den
Einstellungen öffnen den Ordner und lesen neu.

Entscheidungen:

- **Der Ordner liegt im Datenordner, nicht im Programmordner.** Dort ist er
  nach der Installation beschreibbar und überlebt ein Update.
- **Als `data:`-URL über die Brücke, kein eigenes Protokoll.** Es sind fünf
  kleine Dateien, die beim Start gelesen werden, und `img-src` lässt `data:`
  ohnehin zu. Ein Protokoll wäre der sauberere Weg bei vielen oder großen
  Bildern; hier wäre es Aufwand ohne Gegenwert.
- **Kein SVG.** Eine SVG-Datei kann Skripte enthalten, und auch wenn sie in
  einem `img` nicht laufen, ist das eine Tür, die man für ein Symbol nicht
  aufmachen muss. PNG, JPEG, WebP und GIF decken ab, was aus einem
  Zeichenprogramm kommt.
- **Höchstens 2 MB je Datei.** Ein PNG mit 256 Pixeln Kantenlänge liegt bei
  wenigen zehn Kilobyte. Die Grenze steht gegen den Fall, dass jemand
  versehentlich ein Foto hineinlegt — als `data:`-URL wandert die Datei durch
  die Brücke und in den Speicher der Oberfläche.
- **Jeder Fehlschlag ist still.** Fehlende Datei, kaputtes Bild, unbekanntes
  Format, zu groß: es gilt das eingebaute Symbol, und sonst passiert nichts.
  Ein Symbol ist kein Grund für eine Fehlermeldung. Der Rauchtest spielt alle
  vier Fälle durch.
- **`object-fit: contain`**, damit ein nicht quadratisches Bild nicht
  gestaucht wird — lieber Luft an zwei Seiten als eine verzerrte Zeichnung.

Beim ersten Start entsteht der Ordner samt einer LIESMICH, die die
Dateinamen nennt. Wer eigene Bilder einsetzen will, soll den Ordner
vorfinden und nicht raten müssen, wie er heißt.

### Bewegung: der Übergang aus dem Startmenü, und die letzten drei Werkzeuge

Beim Klick auf eine Kachel wächst deren Symbol über den ganzen Bildschirm.
Das war ein ausdrücklicher Wunsch, und der Übergang trägt zweierlei: er
verbindet die Kachel mit dem Werkzeug, das daraus wird, und er überbrückt die
Zeit, in der sonst nichts zu sehen wäre. Ist das Feld ausgewachsen und das
Werkzeug noch nicht da, steht darin der Ladekreis; ist es schneller, sieht
man ihn gar nicht.

Entscheidungen dabei:

- **Der Übergang beginnt an der Kachel, nicht in der Bildmitte.** Sonst wäre
  er ein Effekt statt einer Verbindung.
- **Über die Schiene läuft er nicht.** Dort wechselt man ständig hin und her,
  und jedes Mal eine große Bewegung wäre eine Zumutung. Er gehört dem
  Startmenü.
- **Der Hauptprozess bekommt die Dauer mit und wartet sie ab.** Die
  eingebettete Ansicht ist kein HTML-Element; sie liegt immer über allem, was
  die Hülle zeichnet. Schöbe sie sich mitten hinein, sähe es aus, als hätte
  jemand die Animation abgeschnitten. Montiert und geladen wird
  währenddessen — es geht keine Zeit verloren, sie wird nur nicht vorzeitig
  sichtbar.
- **Bewegt werden left/top/width/height, nicht `transform: scale`.** Die
  teurere Sorte, hier aber die richtige: beim Skalieren zöge sich das Symbol
  mit in die Breite und aus dem runden Rand würde ein Oval.

Danach fehlten noch Backstory Creator, Karteneditor und NPC Creator — die
drei Werkzeuge, die `motion.css` nicht einmal geladen hatten. Jetzt benutzen
alle fünf dieselben Zeiten und Kurven.

Zwei Fallen dabei, beide erst beim Ausprobieren aufgefallen:

- Das Einblenden beim Notizwechsel braucht einen `key` am Element. Ohne ihn
  behält React dasselbe Element, und eine CSS-Animation läuft nur, wenn das
  Element neu entsteht — sie bliebe genau bei dem Vorgang aus, für den sie
  gedacht ist.
- Der Toast des Backstory Creators bekommt eine eigene Bewegung statt
  `.motion-eintritt`: er steht mit `translateX(-50%)` in der Mitte, und die
  Klasse des Pakets überschreibt diese Verschiebung — er spränge beim
  Erscheinen nach rechts.

Unangetastet bleiben die Stellen, die schon ihre eigene, stärkere Bewegung
haben: die fallenden Würfel und die Zeichenfläche des Karteneditors.

### Ladeanzeige und Startzeit

Während ein Werkzeug lädt, steht jetzt ein Ladekreis mit Text daneben. Vorher
blieb die Fläche leer, und ein langsamer Start sah aus wie ein hängendes
Programm.

Der Kreis widerspricht einer Entscheidung im Bewegungspaket: dort steht
ausdrücklich, dass es **keine** Endlosanimation mitbringt, weil eine hängende
Anwendung damit so lebendig aussieht wie eine arbeitende. Er wurde trotzdem
gebaut, weil er gewünscht war — abgefedert dadurch, dass er nur während des
Ladens läuft, dass ein Text danebensteht, und dass er bei
`prefers-reduced-motion` stillsteht statt zu verschwinden.

**Zur Startzeit: gemessen, nicht geraten.** Hier unter Linux, aus dem
Arbeitsverzeichnis:

    399 ms   Electron bereit
     13 ms   Einstellungen gelesen und geschrieben
      0 ms   Kanäle angemeldet
    149 ms   Fenster steht
    565 ms   GESAMT

Drei Viertel der Zeit vergehen, bevor eigener Code überhaupt läuft. Der
einzige messbare Hebel im Bündel ist das Anthropic-SDK, das im Hauptprozess
liegt, auch wenn keine KI eingerichtet ist: ohne es startet die Hülle in
486 statt 533 ms. **47 ms** — zu wenig für den Umbau, den es kosten würde
(`baueAnbieter` müsste asynchron werden und zöge das durch beide Werkzeuge).

Die gemeldete Langsamkeit kommt von einem Windows-Rechner, und dort kann ich
nicht messen. Statt zu raten ist die Messung jetzt eingebaut:
`TTRPG_TOOLS_STARTZEIT=1` gesetzt, und die Hülle schreibt dieselbe Tabelle in
die Konsole. Erst danach lässt sich sagen, ob die Zeit im eigenen Code liegt
oder davor — die wahrscheinlichste Erklärung, ein unsigniertes Programm, das
beim ersten Start vom Virenschutz durchgesehen wird, wäre durch keine
Codeänderung zu beheben.

### Verwaiste Bilder aufräumen

„Aufräumen" in der Kopfzeile zeigt Bilddateien, auf die nichts mehr verweist,
mit Vorschau und Größe. Ausgewählte lassen sich löschen, automatisch passiert
nichts.

Wichtig dabei: der Versionsverlauf wird mitgelesen. Ein Bild, das eine
gesicherte Fassung noch braucht, gilt nicht als verwaist, sonst würde das
Wiederherstellen ein kaputtes Bild ergeben. Wer aggressiver aufräumen will,
schaltet den Verlauf ab.

### Eigene Suchleiste im Editor

Strg+F öffnet eine Suche, die nur in der offenen Notiz sucht, unabhängig von
der Suche in der Seitenleiste. Mit Feld zum Ersetzen, „Ersetzen" für die
aktive Fundstelle und „Alle ersetzen". Enter springt zur nächsten Stelle,
Escape schließt.

Ist die eigene Suche offen, gilt ihr Begriff; sonst weiterhin der aus der
Seitenleiste. Ersetzen läuft in einer Transaktion, ein Rückgängig holt also
alles zusammen zurück.

### Notiztypen zwischen Kampagnen übernehmen

Im Notiztypen-Dialog lassen sich die Typen einer anderen Kampagne übernehmen.

Bewusst nur ergänzend: fehlende Typen kommen dazu, bei bekannten Typen
fehlende Felder. Nichts wird ersetzt oder entfernt. Ein hier gelöschter Typ
würde bestehende Notizen typlos machen, und eine überschriebene Beschriftung
wäre eine stille Änderung an eigener Arbeit. Die Rückmeldung nennt, wie viele
Typen und Felder dazugekommen sind.

### Graph verfeinern

Zoomen mit dem Mausrad oder den Knöpfen, Verschieben der Fläche mit gedrückter
Maustaste auf freiem Grund, Zurücksetzen der Ansicht. Dazu ein Filter nach
Notiztyp mit Farbmarken, der ausgeblendete Typen samt ihrer Kanten aus der
Anordnung nimmt, damit die verbleibenden Knoten den ganzen Platz bekommen.

Beschriftungen bekommen einen Umriss in Hintergrundfarbe und bleiben dadurch
über Kanten und anderen Knoten lesbar.

### Antworten des Assistenten strömen lassen

Die Antwort erscheint jetzt, während sie geschrieben wird, mit blinkendem
Cursor. Beide Anbieter strömen: Ollama liefert JSON-Zeilen, Claude über den
Stream des SDK.

Teiltexte gehen als eigenes Ereignis an genau das Fenster, das gefragt hat,
mit einer Kennung je Anfrage. Ohne die Kennung könnten Teiltexte einer
abgebrochenen Anfrage in einer neuen Antwort landen. Am Ende gewinnt das
vollständige Ergebnis, damit nichts fehlt.

Der Renderer bekommt weiterhin kein `ipcRenderer`, nur eine Anmeldefunktion,
die eine Abmeldung zurückgibt.

Getestet ist das Zerlegen des Datenstroms gegen ein gefälschtes `fetch`,
inklusive einer über zwei Pakete verteilten Zeile. Gegen ein echtes Modell
lief es mangels Zugang nicht.

### Drei Fehler beim Aufräumen der bekannten Grenzen

**Selbstverweis beim Umbenennen.** Eine Notiz, die sich selbst verlinkt,
behielt im eigenen Text den alten Namen. Der Link zeigte danach ins Leere.

**Reihenfolge beim Umbenennen.** Der Titel wurde vor den Verweisen gesetzt.
Brach es dazwischen ab, war der Zustand nicht mehr durch erneutes Umbenennen
zu reparieren. Jetzt kommen die Verweise zuerst, der Titel zuletzt.

Beide sind durch Tests abgedeckt, die gegen die alte Fassung fehlschlagen.

**Mehrdeutige Namen.** Teilen sich zwei Notizen einen Titel oder Alias,
trafen Links stillschweigend immer dieselbe. Jetzt steht eine Warnung über
dem Editor.

### Gegenrichtung bei Beziehungen anbieten

Beziehungen bleiben gerichtet, das ist gewollt. Fehlt die Gegenrichtung, wird
sie jetzt aber angeboten: ein Klick legt bei der Zielnotiz eine Beziehung
zurück an, ohne Typ, damit dort eingetragen werden kann, wie es von der
anderen Seite aussieht.

### Drei stille Fehler beim Durchsehen gefunden

**Veralteter Stand nach dem Umbenennen.** Die Notizliste wurde nur über den
React-Zustand nachgezogen, die parallel geführte Referenz erst beim nächsten
Rendern. Ein noch laufender Ablauf arbeitete deshalb mit dem alten Stand
weiter: nach einem Umbenennen konnte der Editor den Text von vor dem
Link-Rewrite zeigen und ihn beim Speichern wieder zurückschreiben.

**Graph blockiert bei vielen Notizen.** Jede Runde der Anordnung vergleicht
alle Knotenpaare. Bei 600 Notizen hätte das mit fester Rundenzahl die
Oberfläche für viele Sekunden eingefroren. Die Rundenzahl sinkt jetzt mit der
Größe; das Ergebnis wird gröber, bleibt aber brauchbar.

**Ein kaputter Bildverweis brach den PDF-Export ab.** Jetzt wird der
betroffene Verweis übersprungen statt der ganze Export.

### Weitere Feldarten im Steckbrief

Neben Text, mehrzeilig, Zahl, Link und Bild gibt es jetzt Auswahlliste,
Datum und Ankreuzfeld.

Die Werte einer Auswahlliste stehen im Notiztypen-Dialog, einer je Zeile.
Eine Liste ohne Werte wird abgelehnt, sie wäre unbedienbar; eine von Hand
kaputt gemachte wird beim Lesen zu einem Textfeld.

Ankreuzfelder erscheinen im Export und in der Kurzinfo als Ja oder Nein, und
zwar auch dann, wenn sie nicht gesetzt sind: bei einem Ankreuzfeld ist das
eine Aussage, bei einem leeren Textfeld nicht.

### Assistent mit Gesprächsverlauf

Nach einer Antwort lässt sich eine Rückfrage stellen. Der bisherige Verlauf
geht dann mit, das Gespräch steht untereinander in der Sidebar.

Ein Klick auf eine der drei Aufgaben fängt dagegen bewusst neu an, damit ein
alter Faden nicht unbemerkt weiterläuft. Der mitgeschickte Verlauf ist auf die
letzten acht Nachrichten begrenzt, sonst wächst jede Rückfrage die Anfrage
weiter auf und kostet mehr, ohne besser zu werden. Ein Hinweis in der Sidebar
sagt, dass Rückfragen bei der Claude API entsprechend mehr kosten.

### Bildgröße im Text einstellen

Ist ein Bild ausgewählt, erscheinen in der Werkzeugleiste drei Breiten: 200,
400 und volle Textbreite.

Markdown kann keine Bildgröße ausdrücken. Bilder mit gesetzter Breite werden
deshalb als inline-HTML gespeichert, was gültiges Markdown ist und auch von
Obsidian dargestellt wird. Ohne Breite bleibt es beim gewöhnlichen
`![](assets/x.png)`. In beiden Fällen steht der relative Pfad in der Datei,
nie die Protokoll-URL.

### Graph: Beschriftungen bei dichten Netzen

Kantenbeschriftungen erscheinen nur noch, wenn sie lesbar bleiben: bei bis zu
zwanzig Kanten immer, darüber nur rund um den Knoten unter der Maus.

### Auffangnetz und Sichern beim Beenden

**Fehler in der Oberfläche** zeigten bisher ein leeres Fenster ohne Weg
zurück. Jetzt fängt eine Fehlergrenze sie ab und bietet Neuladen an, mit dem
Hinweis, dass die Notizen als Dateien auf der Platte davon nicht betroffen
sind. Bewusst ohne Übersetzung: der Fehler kann aus der Sprachschicht selbst
kommen, dann wäre ein Übersetzungsaufruf dort der nächste Absturz.

**Beim Beenden** wartet der Hauptprozess jetzt darauf, dass der Renderer
Ungespeichertes sichert, mit drei Sekunden Sicherheitsnetz. Vorher hing das
allein an `beforeunload`, worauf in Electron kein Verlass ist. Zusätzlich wird
beim Wegklicken des Fensters gesichert.

Ehrlich dazu: ich hatte vermutet, dass `beforeunload` mit `preventDefault` das
Schließen blockiert. Nachgestellt ließ sich das nicht, das Fenster schloss
sich auch vorher. Die Änderung macht das Sichern beim Beenden trotzdem
verlässlich statt vom Verhalten des Browsers abhängig.

### Kaputte Notizdateien werden gemeldet

Eine Datei mit beschädigtem Frontmatter wurde übergangen, damit sie nicht die
ganze Kampagne unlesbar macht. Sie verschwand damit aber stillschweigend aus
der Liste, und der Verlust wäre erst aufgefallen, wenn es zu spät ist. Jetzt
steht ein Hinweis über der Notizliste, mit einem Knopf zum Öffnen des Ordners.

### Kopfzeile entrümpelt und Hilfe ergänzt

Die Kopfzeile hatte vierzehn Elemente und brach auf drei Zeilen um. Die
Aktionen einer Kampagne stecken jetzt in einem Klappmenü, sichtbar bleiben
Kampagnenauswahl, Graph, Hilfe und Einstellungen.

Neu ist eine Hilfe mit den Tastenkürzeln und den Handgriffen, die man sonst
nicht findet: `[[` zum Verlinken, Strg+Klick zum Öffnen, Bilder ziehen,
Bildbreite über die Werkzeugleiste, Zoom im Graph.
