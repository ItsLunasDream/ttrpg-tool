# Backlog

Gesammelte Aufgaben, die noch nicht umgesetzt sind. Reihenfolge innerhalb
eines Abschnitts ist keine Priorisierung.

## Offene Wünsche

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
