# Backlog

Gesammelte Aufgaben, die noch nicht umgesetzt sind. Reihenfolge innerhalb
eines Abschnitts ist keine Priorisierung.

## Offene Wünsche

### Inspirationshilfe: ein sechstes Werkzeug

Hilft beim Erfinden einer Kampagne: Region, Thema, Figuren, Orte, und wie
das zusammenhängt. Das Konzept steht in [docs/inspirationshilfe.md](docs/inspirationshilfe.md)
— mit der wichtigsten Entscheidung darin: Entwurf im neuen Werkzeug, Wahrheit
im Story Creator. Eine zweite Ablage für dieselbe Welt gibt es nicht.

Erst besprechen, dann bauen.


### GUI-Größe in den Einstellungen

Die Größe der gesamten Oberfläche soll einstellbar sein, nicht nur die des
Notiztextes — Seitenleisten, Kopfzeilen, Dialoge, und das in allen
Werkzeugen. Als Barrierefreiheits-Option gedacht.

Der Zoom im Editorfeld ist seit Fassung 0.2.0 da (Strg und Mausrad, Strg+0,
Anzeige oben rechts). Diese Hälfte bleibt offen.

Der teure Teil ist nicht das Bauen, sondern das Prüfen: bei jeder Stufe muss
nachgesehen werden, dass nichts abgeschnitten wird, nichts überlappt und
kein Dialog aus dem Fenster läuft. Dazu kommt, dass Titelleiste und Schiene
der Hülle feste Maße haben (`CHROME` in `apps/shell/src/shared/apps.ts`), aus
denen der Hauptprozess die Fläche der eingebetteten Anwendung rechnet — die
müssen mitwandern.

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
- Der Monster Creator kennt keine Erfahrungspunkte. Aus der CC-BY-Quelle sind
  nur sieben XP-Werte belegt, die übrigen 27 wären geraten. Deshalb steht `xp`
  nicht im YAML-Kopf. Der Encounter Creator braucht die Tabelle; sie muss
  vorher aus einer belegten Quelle kommen
- Die Eichung der Monsterprüfung läuft gegen sieben Statblocks aus derselben
  CC-BY-Quelle wie die Richtwerte. Die liegen bauartbedingt auf der Kurve, das
  Bestehen sagt also wenig. Eine belastbare Eichung bräuchte Monster aus dem
  SRD 5.2 quer über die Grade; die Quellen waren aus der Entwicklungsumgebung
  nicht erreichbar

## Erledigt

### Zustände: von sechs auf siebzehn Themen

Gemeldet mit dem Eindruck, es gäbe nur Eiseffekte. Der Eindruck kam von mir:
in allen Bildern stand das Thema auf „Kälte". Es waren sechs — aber das war
trotzdem dünn. Gift war nur eine *Art* und kein Thema, und Feuer, Säure,
Sturm, Stein, Blut, Schatten, Zeit, Klang, Traum und Tiefe fehlten ganz.

Jetzt siebzehn, jedes mit eigenen Namensteilen, Einzelnamen, Bildern,
Gegenmitteln, Orten und einem eigenen Zeichen für den Tracker.

Drei Sprachfehler hat erst die Breite gezeigt — die alten sechs sahen gut
aus, weil ihre Bausteine zufällig zusammenpassten:

- Ein Bild wie „Etwas fehlt" ist ein Nebensatz und ergab „Etwas fehlt zieht
  in deine Hände". Bilder sind jetzt Nominalgruppen.
- Ein Gegenmittel wie „nach einer vollen Rast" ergab „Eine Stunde nach einer
  vollen Rast senkt ihn um 1" — zwei Zeitangaben hintereinander.
- Das Verb „sitzt" verlangt den Dativ, die Stellen stehen im Akkusativ:
  „sitzt in deine Hände".

Dazu „Lochloch" und „Fernferne" (ein Name darf seinen Wortstamm nicht
wiederholen) und im Englischen „The embers draws" (Plural mit
Singularverb). Für alle fünf gibt es jetzt Tests, die über alle Themen
laufen.

### Status Effect Creator: das siebte Werkzeug

Eigene Zustände mit Stufen — Kälte, die sich aufbaut, ein Fluch, der beim
dritten Mal etwas anderes tut. Nach dem Konzept in
[docs/statuseffekte.md](docs/statuseffekte.md), das dort unverändert stehen
bleibt; was davon gebaut wurde, steht am Ende derselben Datei.

Der Kern sind 40 Wirkungen nach Schwere, jede mit Punktwert. Eine Stufe ist
eine Wirkung daraus — deshalb kommen die Tabellen ohne KI aus, und deshalb
lässt sich ein Zustand überhaupt wiegen.

**Die Waage ist bewusst keine Ampel.** Beim Monster gibt es ein Richtig, der
Grad ist eine Rechnung. Hier nicht: ob ein Zustand zu hart ist, hängt daran,
wie oft man ihn bekommt, und das weiß nur der Tisch. Was dasteht, ist eine
Auskunft — so schwer wiegt er, so viel wie das da — und der einschränkende
Satz steht dabei, in der Oberfläche und in der Datei.

Dazu Pakete (mehrere Zustände in einem Wurf, mit über alle verteilten
Wirkungen), die Karte zum Vorlesen (vorn, was die Figur merkt; hinten die
Regel), Ablage als Markdown mit YAML-Kopf als spätere Schnittstelle zum
Initiative Tracker, Sammlung mit Suche und die KI-Anbindung.

Bei der KI wird **nicht nachgezogen, sondern zurückgewiesen**. Beim Monster
gibt es einen richtigen Wert, auf den man ziehen kann; bei einem Zustand
nicht. Geprüft wird nur, was sich nachzählen lässt.

Fünf Fehler hat erst die eigene Prüfung gefunden: ein widerlegter Punktwert
(„handlungsunfähig" wog weniger als „blind"), eine Rangfolge, die eine
Behauptung war, ein Segen, der als kaputt galt, weil Buffs negativ wiegen,
eine Umgebung ohne Auslöser im Kampftakt, und im Paket ein Ersatz, der sich
an einer Wirkung bediente, die derselbe Zustand später noch brauchte.

### Zustände: Dauer und Linderung passten nicht zusammen

Gemeldet an einem Beispiel aus der Oberfläche: Dauer „bis zu deinem nächsten
Zug", Linderung „eine Stunde in trockener Kleidung senkt ihn um 1". Beides
für sich richtig, zusammen Unsinn. Und im selben Block klebte der Auslöser
eines Fluchs an einem Ort aus der Umgebung.

Neu ist deshalb die **Zeitskala** als eigener Begriff: `kampf`, `kurz`,
`lang`. Dauern, Auslöser, Linderung und Verschlimmerung tragen sie alle,
`stimmigkeit.ts` prüft ihr Verhältnis, und der Erzeuger baut solche Zustände
gar nicht erst — die Dauer wird zuerst gewählt, und die anderen richten sich
danach.

### Monster Creator: aus Zahlen wurde ein Statblock

Rückmeldung aus dem ersten richtigen Gebrauch, in einem Zug abgearbeitet.
Der Kern des Werkzeugs war richtig, die Ausgabe war es nicht: ein Block mit
Trefferpunkten, Rüstungsklasse und „Schaden pro Runde: 41" sagt nicht, was
passiert, wenn das Monster dran ist.

Neu am Modell: die sechs Attribute (mit einer harten Regel — Übungsbonus
plus Modifikator des Hauptattributs ergibt den Angriffsbonus), die
Bewegungsrate samt Klettern, Schwimmen, Fliegen und Graben, die Angriffe
aufgeschlüsselt nach Waffe, Reichweite, Trefferbonus, Würfel und
Schadensart, Flächenangriffe mit Rettungswurf, und Resistenzen,
Immunitäten und Verwundbarkeiten.

Der Grundsatz dabei, und er gilt für die nächsten Werkzeuge genauso: **die
Zusätze sind keine Pflicht.** Alles davon hängt an einer Chance. Ein
Bestiarium, in dem jedes Wesen resistent ist, fliegt und einen Odem hat, ist
langweilig — und es nimmt den wenigen, bei denen es zählt, die Wirkung.

Dabei ein echter Fehler in der Prüfung gefunden: die Spannen wurden gegen
die **rohen** Trefferpunkte geprüft, angezeigt wurden die **wirksamen**.
Solange nur die Rüstungsklasse hineinspielte, ging die Verschiebung in der
Spanne unter. Mit Resistenzen nicht mehr — ein richtig gebautes Monster fiel
durch die eigene Prüfung.

Dazu 50 statt 12 Fähigkeiten mit Abschnitt im Statblock, eine Fähigkeitszahl
die bis Grad 30 wächst, sechzehn statt acht Namensteile je Liste plus
Einzelnamen, das klassische Statblock-Aussehen und ein freies Wunschfeld für
die KI.

### „In den Story Creator" tat gar nichts

Der Monster Creator legte die Notiz unter dem Notiztyp `creature` an. Den
gibt es in keiner Vorlage, der Story Creator wies das mit
`error.unknownNoteType` ab.

Aufgefallen ist es nur im Gebrauch, und das ist der eigentliche Punkt: der
Rauchtest des Monster Creators fasste den Export gar nicht an. Er sah das
Werkzeug für sich allein, und dort meldet ein Fehlschlag genauso ruhig wie
ein Erfolg. Jetzt sucht sich jedes Werkzeug einen Notiztyp, den die Kampagne
wirklich kennt, und der Rauchtest läuft den Weg bis zur Datei auf der Platte
durch.

### Vorwärts im Verlauf war nach einem Schritt zurück sofort wieder tot

Beim Nachziehen der Rauchtests aufgefallen, nicht gemeldet, aber echt: ein
Schritt zurück funktionierte, der Schritt vorwärts danach nicht.

Zwei Ursachen, beide in der Hülle:

- **Alt und Pfeil löste zwei Schritte aus.** Die Hülle hörte selbst auf die
  Taste *und* bekam denselben Druck über den Hauptprozess. Der eigene Weg
  lief an der Sperrfrist vorbei, die genau das verhindern soll. Der zweite
  Hörer ist weg; es bleibt der eine Weg über den Hauptprozess, den auch die
  Daumentasten nehmen.
- **Der Ortsbericht nach einem Sprung galt als neuer Besuch.** Ein Werkzeug
  meldet nach dem Sprung, wo es steht — und das warf den Vorwärts-Ast weg,
  wie es ein echter neuer Besuch tun soll. Jetzt gilt ein Bericht kurz nach
  einem Verlaufsschritt als dessen Antwort und zählt nicht.

### Monster Creator: die Prüfung ist der Kern

Ein achtes Werkzeug. Homebrew-Monster zu einem vorgegebenen
Herausforderungsgrad, mit und ohne KI — und jedes Ergebnis geht durch
dieselbe Prüfung, egal woher die Zahlen kommen.

Die Richtwerte von CR 0 bis 30 stammen aus dem *Lazy GM's 5e Monster
Builder Resource Document* unter CC-BY-4.0. Sie stehen wörtlich in
`richtwerte.ts`, mit Lizenzkopf in der Datei und Nennung in `NOTICE.md` und
im README. Die Tabellen aus dem Dungeon Master's Guide sind bewusst nicht
angefasst worden.

Die Prüfung rechnet einen Verteidigungs-CR aus Trefferpunkten und
Rüstungsklasse, einen Angriffs-CR aus Schaden pro Runde und Angriffsbonus
und nimmt den Mittelwert. Rein, ohne Zufall und ohne Dateien. Drei Fehler
hat erst sie selbst ans Licht gebracht: das Schadensband war bei niedrigen
Graden zu eng, das Urteil hing allein an den Bändern (ein CR 11 ging als
CR 15 durch), und das Nachziehen zog auf die Bandkante statt auf den
Richtwert.

Der Erzeuger verschiebt Rollen in **Tabellenzeilen**, nicht in Prozent. Der
erste Anlauf mit Prozentsätzen ließ die Hälfte der erzeugten Monster an der
eigenen Prüfung scheitern. Ein Test fährt jetzt alle 7140 Kombinationen aus
Grad, Rolle und Saat durch und verlangt, dass jedes Ergebnis besteht.

Bei der KI ist der Unterschied bewusst: ihre Zahlen werden nachgezogen und
es wird gesagt, was geändert wurde (der ursprüngliche Vorschlag bleibt
abrufbar); ein Handeintrag wird nur gewarnt, nie überschrieben.

Dazu die Ablage als Markdown mit YAML-Kopf — das ist die spätere
Schnittstelle zum Encounter Creator, nicht ein Kanal zwischen zwei
Werkzeugen —, eine Sammlung als Kacheln und Liste mit einem Suchfeld für
Name, Art, Rolle und Grad zugleich („untot 4" heißt untot **und** Grad 4),
Varianten auf anderen Graden und der Markdown-Export.

Offen geblieben und als bekannte Grenze notiert: die CR-XP-Tabelle (nur
sieben Werte sind belegt) und eine echte Eichung an SRD-Monstern.


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
  Anwendung, die fragt — `prompts.ts` des Story Creators wanderte nicht
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
- **Übernahme statt Neueintippen.** Wer die KI früher im Story Creator
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

Der Unterschied zum Assistenten des Story Creators ist grundsätzlich.
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

**Drei Ebenen, und wer gewinnt:** eigene Bilder im Datenordner stechen die
mitgelieferten in `apps/shell/symbole/`, und die stechen die eingebauten
Vektoren. Der mitgelieferte Ordner gehört ins Repository und wird über
`extraResources` ins Paket gelegt — so gelten Bilder, die dort landen, für
alle, die die Sammlung installieren, und nicht nur auf einem Rechner.

Beim ersten Start entsteht der Ordner im Datenordner samt einer LIESMICH, die
die Dateinamen nennt. Wer eigene Bilder einsetzen will, soll den Ordner
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

Danach fehlten noch Story Creator, Karteneditor und NPC Creator — die
drei Werkzeuge, die `motion.css` nicht einmal geladen hatten. Jetzt benutzen
alle fünf dieselben Zeiten und Kurven.

Zwei Fallen dabei, beide erst beim Ausprobieren aufgefallen:

- Das Einblenden beim Notizwechsel braucht einen `key` am Element. Ohne ihn
  behält React dasselbe Element, und eine CSS-Animation läuft nur, wenn das
  Element neu entsteht — sie bliebe genau bei dem Vorgang aus, für den sie
  gedacht ist.
- Der Toast des Story Creators bekommt eine eigene Bewegung statt
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

### Einführung beim ersten Start und beim ersten Öffnen

Beim allerersten Start der Sammlung geht ein Willkommen auf, beim ersten
Öffnen jedes Werkzeugs eine kurze Erklärung: ein Satz, worum es geht, und
drei bis fünf Punkte, was man damit tut. Danach nie wieder.

Entscheidungen:

- **In der Hülle, nicht in den Werkzeugen.** So sieht die Einführung überall
  gleich aus, und kein Werkzeug kann sie vergessen. Der Preis ist, dass die
  Texte in `apps/shell/src/shared/einfuehrung.ts` stehen und nicht neben dem
  Werkzeug, das sie beschreiben — dafür fällt in einem Test auf, wenn ein
  neues Werkzeug ohne Einführung waehlbar wird.
- **Die Texte stehen nicht im Wörterbuch.** Sie gehören zusammen, sind länger
  als eine Knopfbeschriftung und verschwänden dort zwischen zwanzig
  Einzelschlüsseln. Zweisprachig sind sie trotzdem, als `{de, en}` je Zeile.
- **Genau einmal, und das wird sofort gemerkt.** Gespeichert wird die Kennung
  beim Schließen in `einfuehrungGesehen` der Einstellungen, nicht erst beim
  Beenden: nach einem Absturz soll nicht alles noch einmal kommen. Ein
  Kästchen „nicht mehr zeigen" gibt es deshalb nicht — es käme ohnehin nicht
  wieder. Wer sie zurückhaben will, findet in den Einstellungen einen Knopf.
- **Derselbe Dialograhmen wie Einstellungen und Über.** Escape, Klick auf den
  Hintergrund und der Fokus sind damit erledigt; nur die Aufschrift des
  Knopfes ist eine andere, weil gelesen und losgelegt hier dasselbe ist wie
  geschlossen.
- **Erst wenn das Werkzeug wirklich da ist.** Die Einführung kommt nach einer
  erfolgreichen Einbettung, nicht davor — vor einer Fehlermeldung zu
  erklären, was das Werkzeug alles kann, wäre die falsche Reihenfolge.
- **Liegt schon ein Dialog vorn, passiert nichts.** Die Einführung bleibt
  dann ungesehen und kommt beim nächsten Öffnen von selbst wieder. Zwei
  Fenster übereinander zu legen und eines davon ungelesen als erledigt zu
  verbuchen wäre der schlechtere Handel.
- **Geplante Werkzeuge brauchen keine.** Die Kachel „Begegnungen" lässt sich
  nicht anklicken; der Test verlangt eine Einführung erst, wenn ein Werkzeug
  wählbar wird.

Der Rauchtest läuft zweimal als zwei Prozesse (`EINFUEHRUNG_LAUF=1`, dann
`=2`) auf demselben Datenordner. Anders ist der eigentliche Punkt nicht zu
zeigen: dass nach einem Neustart nichts mehr kommt. Zwei Electron-Sitzungen
gleichzeitig auf einem Datenordner gehen dabei nicht — die zweite lädt kein
Werkzeug mehr.

### Verlauf: was in den restlichen Werkzeugen eine „Stelle" wäre

Der Verlauf der Hülle merkt sich zwei Dinge: welches Werkzeug offen war, und
*wo* man darin war. Das zweite kann bisher nur der Story Creator (die offene
Notiz). Beim Durchgehen der übrigen fünf ist die Antwort ausgefallen wie
folgt — und sie fällt gegen ein Nachrüsten aus:

- **Würfel, NPC Creator, Inspirationshilfe** haben keine Stellen. Es gibt je
  einen Arbeitsbereich, und den erreicht der Verlauf schon auf
  Werkzeug-Ebene. Ein „Ort" wäre hier eine erfundene Größe.
- **Initiative Tracker** hätte eine: die offene Begegnung. Ein Sprung dorthin
  lädt aber eine andere Begegnung, und der *laufende* Kampf ist
  Sitzungszustand, der dabei wegfiele. Genau davor steht heute eine
  Rückfrage („Kampf beenden?"). Ein Verlaufssprung, der wortlos einen
  laufenden Kampf verwirft, wäre schlechter als kein Verlaufssprung. Mit
  Rückfrage wiederum wäre es kein Zurück mehr, sondern ein Dialog — und
  Zurück soll billig sein.
- **Karteneditor** hätte die offene Karte. Dasselbe Problem, eine Stufe
  schärfer: ungesicherte Änderungen an einer Zeichnung wiegen mehr als eine
  Runde Initiative.

Bleibt also der Story Creator, und das ist kein Mangel: dort gibt es viele
kleine Stellen, zwischen denen man wirklich hin und her springt. In den
anderen Werkzeugen springt man zwischen *Werkzeugen*, und das kann der
Verlauf längst.

Offen bleibt davon nur das, was sich hier nicht prüfen lässt: ob die
Daumentasten der Maus auf dem Windows-Gerät ankommen (siehe den Abschnitt
darüber — zweiter Weg über die Preloads gebaut, Prüfung steht aus).

## Zwei neue Werkzeuge: Konzepte

Der **Monster Creator ist inzwischen gebaut** (siehe „Monster Creator: die
Prüfung ist der Kern" unter „Erledigt"); sein Konzepttext steht unten
trotzdem unverändert, damit man Plan und Ergebnis vergleichen kann. Was
davon offen blieb, steht in `docs/monster.md` unter „Stand der Umsetzung".
Der Status Effect Creator steht weiter als Konzept, nicht als Plan zum
Abarbeiten.

- **Status Effect Creator** — [docs/statuseffekte.md](docs/statuseffekte.md).
  Eigene Zustände mit Stufen und Regeltext, mit und ohne KI, optional mit
  einer Umgebung, die sie auslöst („Freezing, jede Stunde in großer Kälte,
  stapelt bis fünf"). Der Weg führt in den Initiative Tracker, der die
  Zustände dann selbst mitzählt. Ohne KI kommen Stichpunkte heraus, keine
  Prosa; Regler sind Art, Thema, Wirkrichtung (Schaden/Buff/Debuff), Härte
  und Stufenzahl. Ein Punktesystem wiegt den Zustand und vergleicht ihn mit
  bekannten — es behauptet aber ausdrücklich nicht, ihn zu balancieren:
  dafür fehlt die Angabe, wie oft man ihn bekommt.
- **Monster Creator** — [docs/monster.md](docs/monster.md). Homebrew-Monster
  zu einem vorgegebenen CR. Der Kern ist nicht der Erzeuger, sondern die
  **Prüfung**: eine reine Funktion, die aus den Zahlen einen CR rechnet und
  jedes Ergebnis daran misst, auch das von der KI. Was bei einer Abweichung
  passiert, hängt an der Herkunft der Zahlen: von der KI werden sie
  automatisch nachgezogen (und es wird gesagt), von Hand gibt es nur einen
  Warnhinweis mit den empfohlenen Werten.

Was in den Konzepten seit der ersten Fassung dazugekommen ist: beim
Statuseffekt-Werkzeug Pakete (mehrere zusammengehörende Zustände in einem
Wurf, aufeinander abgestimmt), die Eichung des Punktesystems an den
Zuständen des Regelwerks und eine Karte zum Vorlesen. Beim Monster Creator
eine Sammlung mit Kacheln und Liste samt einem Suchfeld für Name, Thema und
CR zugleich, die Prüfung eines vorhandenen Statblocks ohne Erzeuger, und
Varianten („dasselbe Monster, zwei Grade höher": Zahlen skalieren, Prosa
behalten).

Die Gruppenrechnung steht ausdrücklich **nicht** im Monster Creator. Sie
gehört in den Encounter Creator; der Monster Creator bereitet die Übergabe
nur vor — über die Ablage als Schnittstelle, mit allen Zahlen im YAML-Kopf,
und mit Mehrfachauswahl in der Sammlung.

Ein Punkt am Monster Creator ist rechtlich und muss vor dem Bauen geklärt
sein: die Richtwerttabellen aus dem Dungeon Master's Guide dürfen nicht ins
Repository — das Kapitel zum Monsterbau steht nicht im SRD. Es gibt eine
Quelle unter CC-BY-4.0, die dasselbe liefert (Lazy GM's 5e Monster Builder
Resource Document); die Lizenz ist gelesen, sollte aber vor dem Übernehmen
von Zahlen noch einmal selbst geprüft werden.

## Vorgemerkt: Initiative Tracker

Aus dem Gebrauch. Die ersten beiden gleichen den Tracker an die neueren
Werkzeuge an, der dritte räumt eine doppelte Einstellung weg.

1. **Begegnungen als Sammlung, mit Kacheln und Suche.** Die gespeicherten
   Begegnungen sehen heute anders aus als die Sammlungen im Monster Creator
   und im Status Effect Creator: `Begegnungen.tsx` ist eine schlichte Liste
   mit Namen und Teilnehmerzahl. Es fehlen die Kachelansicht und ein
   Suchfeld, das **sowohl den Namen der Begegnung als auch die Namen der
   Teilnehmer** durchsucht. Vorbild für die Suche ist `suche.ts` in
   `apps/monster` und `apps/zustaende`.
2. **Knopf „Neue Begegnung", mit Rückfrage.** Bevor der bisherige Stand
   verlorengeht, und zwar in zwei Fällen: der Kampf läuft noch, oder die
   aktuelle Begegnung ist nicht gespeichert. Dieselbe Sorte Dialog wie beim
   Schließen einer Notiz im Story Creator — sagen, was verlorenginge, und
   Abbrechen anbieten.
3. **Der eigene Sprachwähler kann weg.** In der Werkzeugleiste sitzt ein
   `EN`/`DE`-Wähler (`leiste__sprache`, `App.tsx`). Die Sprache steht in den
   Einstellungen der Hülle und wird von dort an alle Werkzeuge
   durchgereicht; zwei Stellen für dieselbe Einstellung sind eine zu viel.
4. **Rückgängig (Strg+Z).** Im Tracker lässt sich nichts zurücknehmen: wer
   einen Teilnehmer entfernt, hat ihn weg. Ein Verlauf um `setzeUndSichere`
   deckt in einem Zug alles ab, was durch diese Stelle läuft — Teilnehmer,
   Zustände, Schaden, Reihenfolge.

   **Nicht verwechseln:** der Zurück-Pfeil der Hülle (Alt+Links, M4) ist der
   Verlauf *zwischen Werkzeugen*, kein Rückgängig. Nähme er im Tracker eine
   Löschung zurück, käme man nicht mehr zum vorigen Werkzeug. Beides bleibt
   getrennt: Strg+Z und ein eigener Knopf im Tracker, der Pfeil der Hülle
   bleibt Navigation — so, wie es der Story Creator mit seinen eigenen
   Undo-/Redo-Pfeilen im Editor schon macht.

## Vorgemerkt: vier Ausbauten für die Sammlung

Aus einer Durchsicht, was der Sammlung noch fehlt. Alle vier stehen als
Aufgabe, keiner davon hat ein Konzept.

1. **Werkzeugübergreifende Suche (Strg+K).** Ein Feld in der Hülle, das
   Notizen, Begegnungen, NPCs, Zustände und Monster auf einmal durchsucht
   und dorthin springt. Verlauf und Schiene sind dafür gebaut; es fehlt der
   Index über die Werkzeuge hinweg.
2. **Encounter Creator** — die Kachel `encounter`, die heute „später" sagt.
   Monster auswählen, Schwierigkeit gegen die Gruppe rechnen, in den Tracker
   schieben. Hierher gehört die Gruppenrechnung.
3. **Loot Generator.** Eigene Zufallstabellen, verschachtelbar, plus Beute
   nach Grad. Kleines Werkzeug, am Tisch das meistgebrauchte.
4. **Sicherung der ganzen Sammlung.** Heute sichert nur der Story Creator
   seine Kampagne. Begegnungen, Karten, Symbole und Einstellungen bleiben
   außen vor. Der API-Schlüssel gehört nicht in eine Sicherung — er liegt im
   Schlüsselbund des Systems und wäre anderswo ohnehin wertlos.

## Vorgemerkt: ein Name für die Sammlung nach außen

Nur festgehalten, nicht entschieden. Es geht um den Namen nach außen und in
Texten; intern darf der Code `ttrpg-tools-shell` heißen.

Mit Bezug auf Würfel und Vorteil:

- **Take 20** — die Regel, bei der man ohne Zeitdruck nimmt, was ein
  ausgeschlafener Wurf ergäbe. Passt zu Werkzeugen, die man *vor* der Sitzung
  benutzt. Mein Vorschlag von den zehn.
- **Crit Kit** — kurz, sagt „Werkzeugkasten", reimt sich.
- **Triple Advantage** — die Steigerung der Idee „Super Advantage", und
  regeltechnisch genauso frei erfunden.
- **Passive 20** / **Twenty Sided** / **Open Roll** / **Roll Ahead**
- **Rolltable** — beschreibt die halbe Sammlung wörtlich.
- **Long Rest** / **Downtime** — die Zeit zwischen den Abenteuern, also
  genau die Zeit, in der man vorbereitet.
- **Super Advantage** — die eigene Idee, hier der Vollständigkeit halber.

Zwei Dinge vorher prüfen:

1. **Verfügbarkeit und Marken.** Kann ich von hier aus nicht nachsehen, weder
   Domains noch eingetragene Marken. „Take 20" und „Long Rest" sind gängige
   Begriffe in der Szene und dürften mehrfach belegt sein.
2. **Der Datenordner hängt am Namen.** Gespeichertes liegt unter
   `AppData\Roaming\ttrpg-tools-shell`. Eine Umbenennung der App darf den
   Pfad nicht mitziehen, sonst sind Kampagnen scheinbar weg. Der Ordner
   bleibt also, oder es braucht einen Umzug beim ersten Start.

## Vorgemerkt: drei Kleinigkeiten

1. **Monster-Export in den Story Creator schreibt Metadaten in den Text.**
   Die angelegte Notiz beginnt mit `id: … name: … cr: … schemaVersion: 2`
   als Fließtext im Editor. Das ist der Kopf der Datei, der nicht in den
   Notizkörper gehört: entweder gar nicht exportieren oder als Kurzinfo
   oben, nicht als Absatz. Betrifft die Brücke Monster → Story Creator.
2. **Der Einklapp-Pfeil an Überschriften sitzt zu weit links.** Ein paar
   Pixel nach rechts, damit er mittig zwischen Rand und Text steht
   (Story Creator, Überschriften einklappen).
3. **Die Platzhaltertexte im Steckbrief bleiben deutsch.** Bei „Age" steht
   `z.B. 132`, bei „Pronouns" `z.B. sie/ihr`, auch wenn die Oberfläche auf
   Englisch steht. Die Beispiele gehören in beide Sprachen.

## Vorgemerkt: ein Paket bleibt in der Sammlung ein Paket

Beim Status Effect Creator lässt sich ein Paket erzeugen — mehrere Zustände,
die zusammen abgestimmt sind (`paket.ts`: gemeinsamer Vorrat, damit nicht
dreimal derselbe Nachteil greift). In die Sammlung wandert davon aber nur
das Ergebnis: vier einzelne Zustände, jeder als eigene Datei, jeder an
seiner alphabetischen Stelle zwischen fremden Einträgen. Die Zusammen­
gehörigkeit ist nach dem Speichern weg, und damit auch der Grund, warum man
das Paket überhaupt gewürfelt hat.

Das Paket soll die Sammlung als Einheit erreichen: eine Kachel für das
Paket, aufklappbar zu seinen Zuständen, und die Suche findet es über den
Paketnamen wie über die Namen der einzelnen Zustände.

Zu klären, bevor gebaut wird:

- **Ablage.** Heute kennt `ablage.ts` nur `Abgelegt` je Zustand. Entweder
  bekommt jeder Zustand ein Feld `paket` im Kopf (kleiner Eingriff, die
  Gruppe ergibt sich beim Einlesen) oder das Paket wird ein eigener
  Eintragstyp mit Verweisen. Das erste passt besser dazu, dass ein Zustand
  auch einzeln brauchbar bleibt.
- **Einzeln herauslösen.** Man muss einen Zustand aus dem Paket weiter
  einzeln benutzen, umbenennen und löschen können, ohne dass der Rest
  kaputtgeht.
- **Dasselbe Muster anderswo.** Monster-Varianten und Begegnungen haben die
  gleiche Frage. Wenn die Gruppierung gebaut wird, dann so, dass die anderen
  Werkzeuge sie übernehmen können.

## Vorgemerkt: Export nach Foundry, Encounter Creator, Austausch-App

Drei Punkte aus der Planung. Der erste ist eine Aufgabe, die anderen zwei
sind Konzepte, die vor dem Bauen geschrieben werden müssen.

### 1. Monster und Zustände als JSON für Foundry

Beide Werkzeuge exportieren heute Markdown. Für den Tisch am Bildschirm
fehlt ein Export, den Foundry VTT einlesen kann.

Offen und vor dem Bauen zu klären — hier fehlt mir belastbares Wissen, ich
würde Feldnamen sonst raten:

- **Welches Format genau.** Foundry kennt mehrere Wege hinein: das
  JSON eines Actors aus dem System `dnd5e`, ein Compendium-Pack, oder das
  Format eines Importer-Moduls. Die drei sehen verschieden aus und altern
  verschieden schnell — das Actor-JSON hängt an der Version des
  dnd5e-Systems, und die hat sich zwischen 2.x und 4.x deutlich geändert.
  Erster Schritt ist deshalb nicht Code, sondern: eine Zielversion
  festlegen und ein echtes Beispiel-JSON aus einer laufenden Installation
  danebenlegen.
- **Zustände haben in Foundry keinen sauberen Platz.** Ein Zustand mit
  Stufen ist dort am ehesten ein Active Effect oder ein Item, kein Actor.
  Was davon passt, entscheidet sich am Beispiel.
- **Was verlorengeht.** Die Stufen, die Gegenpole und die Vorlesekarte haben
  in einem Statblock kein Gegenstück. Lieber als Beschreibungstext
  mitschicken als weglassen.

Der Export bleibt zusätzlich, nicht anstelle von Markdown.

### 2. Konzept: Encounter Creator

Die Kachel `encounter` sagt heute „später". Das Konzept gehört geschrieben,
bevor gebaut wird; im Backlog steht der Punkt schon grob (Monster wählen,
Schwierigkeit gegen die Gruppe rechnen, in den Tracker schieben).

Neu dazu: **eigene Monster aus dem Monster Creator müssen wählbar sein**,
nicht nur eine mitgelieferte Liste. Die Sammlung des Monster Creators ist
die naheliegende Quelle, und die Gradangabe, die dort schon an jedem
Monster hängt, ist genau das, was die Schwierigkeitsrechnung braucht. Ob
zusätzlich eine SRD-Liste dazukommt, ist Teil des Konzepts.

Ebenfalls dazu: **die Umgebung gehört in die Begegnung**, wählbar oder
gewürfelt. Gemeint sind zwei Sorten, und beide müssen vorkommen:

- **Was man sieht.** „Hohe Höhle, unten ein Wasserbecken, Hängebrücken
  ziehen sich hindurch." Das ist die Beschreibung, aus der die Spielleitung
  vorliest und aus der eine Karte entstehen kann.
- **Was am Tisch wirkt.** „Schneesturm: man sieht höchstens 30 Fuß weit."
  Eine Regel mit Zahl, keine Stimmung. Ohne diese Sorte ist die Umgebung
  Deko.

Drei Stellen, an die das anschließt, statt es ein viertes Mal zu bauen: der
Monster Creator hat schon Umgebungen mit Themenbindung (`umgebungen.ts`),
der Initiative Tracker kennt Terrain als eigene Art Teilnehmer
(`istTerrain` in `kampf.ts`), und die Inspirationshilfe erzeugt
Ortsbeschreibungen samt Ausstattung. Der Encounter Creator sollte diese drei
zusammenführen: Beschreibung von der einen Seite, Gameplay-Regel als
Terrain-Eintrag in den Tracker.

Zu klären: wie die Gruppe (Stufen, Anzahl) hinterlegt wird, welche
Schwierigkeitsrechnung genommen wird und woher ihre Zahlen stammen dürfen
(Lizenz, wie bei den Richtwerten im Monster Creator).

**Die fertige Begegnung geht in einem Zug in den Initiative Tracker.** Das
ist der Grund, warum das Werkzeug überhaupt lohnt: sonst tippt man am Tisch
ab, was man vorher zusammengestellt hat. Was dabei mitwandern muss:

- die Monster als Teilnehmer, mit Trefferpunkten, Rüstungsklasse und
  Initiative-Modifikator, mehrere gleiche als „Wolf 1" bis „Wolf 4"
- die Umgebung in ihren zwei Sorten: die Beschreibung als Text, die
  Gameplay-Regel als Terrain-Eintrag (`istTerrain` gibt es schon)
- der Verweis zurück auf die gespeicherte Begegnung, damit ein zweiter
  Durchlauf nicht bei null anfängt

Zwei Dinge, die dabei geklärt sein müssen: was passiert, wenn im Tracker
noch ein Kampf läuft (dieselbe Rückfrage wie bei „Neue Begegnung",
Punkt 2 der Tracker-Liste), und ob der Tracker Änderungen zurückschreibt
oder die Begegnung nur als Vorlage liest. Ich würde zum Zweiten raten: eine
Vorlage, die im Kampf nicht mitgeschrieben wird, ist leichter zu verstehen
als zwei Stände, die auseinanderlaufen.

### 3. Konzept: Austausch-App für die Gruppe am Tisch

Eine eigene App für den Austausch, wenn eine Gruppe in Person spielt und
alle die Sammlung haben: Notizen, Monster, Nachrichten und mehr hin- und
herschicken. Zuerst nur im selben Netzwerk, später möglicherweise über das
Internet. Gedacht als benannter Raum mit Passwort, Peer-to-Peer, am liebsten
ohne Server.

Das ist noch Konzept, deshalb hier nur, was vorher geklärt sein muss:

- **Ohne Server geht im lokalen Netz, im Internet nicht ganz.** Im selben
  WLAN finden sich die Geräte über mDNS/Bonjour und reden direkt
  miteinander; dafür braucht es nichts weiter. Über das Internet scheitert
  das an den Routern (NAT): dort braucht Peer-to-Peer fast immer einen
  fremden Helfer zum Kennenlernen (STUN/Signaling), und bei ungünstigen
  Anschlüssen läuft der Verkehr sogar über einen Relay. „Ohne Server" ist
  also für Stufe 1 zu halten, für Stufe 2 nur mit Einschränkung.
- **Entschieden: das Passwort regelt nur den Zutritt.** Verschlüsselung
  ist ein eigener Punkt und kommt extra. Solange sie fehlt, gilt für Stufe 1
  ausdrücklich: alles im Raum liegt für jeden im selben Netz offen. Im
  eigenen WLAN am Spieltisch ist das vertretbar; in einem fremden Netz
  (Bibliothek, Laden, Uni) nicht, und das gehört als Hinweis in die
  Oberfläche, nicht nur in die Doku. Über das Internet darf es ohne
  Verschlüsselung gar nicht erst gehen.
- **Wer was sehen darf.** Die Spielleitung schickt nicht alles an alle. Ein
  Monster mit Statblock an einen Spieler ist ein Spoiler. Das Konzept muss
  sagen, was geteilt wird, auf Zuruf oder dauerhaft.
- **Entschieden: ein Werkzeug in der Hülle**, keine eigene App. Damit ist
  auch gesagt, dass es viel mit den anderen Werkzeugen reden muss — eine
  Notiz kommt aus dem Story Creator, ein Monster aus dem Monster Creator,
  ein Zustand aus dem Status Effect Creator. Heute gibt es dafür nur
  Einzelbrücken zwischen je zwei Werkzeugen (Monster → Story Creator, NPC →
  Story Creator, Inspiration → Karteneditor). Ein Werkzeug, das von allen
  etwas holt und an alle etwas zurückgibt, braucht das als gemeinsame
  Schnittstelle: „gib mir deine Einträge", „nimm diesen Eintrag an". Das ist
  der größte Brocken am ganzen Punkt und sollte im Konzept vor der
  Netzwerkfrage stehen — die Verbindung ist das kleinere Problem.
- **Die Ablagen sind heute getrennt.** Jedes Werkzeug schreibt in seinen
  eigenen Ordner. Etwas Empfangenes muss in der richtigen Ablage landen und
  darf Vorhandenes nicht überschreiben.

## Vorgemerkt: Magic Item Creator

Ein weiteres Werkzeug in derselben Form wie der Monster Creator und der
Status Effect Creator: magische Gegenstände erzeugen, in einer Sammlung
ablegen, nach Foundry exportieren. Bezug ist D&D 2024, wie bei den anderen.

Warum es hierher passt: die drei Teile, die so ein Werkzeug braucht, stehen
schon. Tabellen mit zweisprachigen Paaren, eine Ablage mit Kacheln und
Suche, Platzhalter für Zahlen im Text (`platzhalter.ts` im Monster Creator
füllt genau so die Würfel und SGs ein). Der Gegenstand ist die kleinste der
drei Sorten — kein Statblock, keine Stufen.

Das **Punktesystem je Seltenheit** ist der interessante Teil und zugleich
der, bei dem ich ehrlich sein muss: **eine offizielle Formel, die Seltenheit
in Punkte umrechnet, kenne ich nicht.** Das Regelwerk ordnet Gegenstände
Seltenheitsstufen zu und gibt Preisspannen, aber keine Rechnung, aus der man
„dieser Effekt kostet 4 Punkte" ableiten könnte. Wenn ich hier eine Tabelle
erfinde, ist sie erfunden. Der gangbare Weg ist derselbe wie bei den
Zuständen: eine eigene Skala aufstellen, den vorhandenen Gegenständen
Punkte zuweisen und prüfen, ob die Reihenfolge stimmt (ein Common landet
unter einem Very Rare). Das ist eine Eichung, keine Ableitung, und sie
gehört genauso benannt.

Zu klären:

- **Woher die Vergleichsgegenstände kommen dürfen.** Dieselbe Lizenzfrage
  wie bei den Richtwerten im Monster Creator: was aus einer CC-BY-Quelle
  stammt, darf hinein, mit Namensnennung.
- **Was die Punkte überhaupt zählen.** Ein Bonus auf Angriff wiegt anders
  als eine Ladung pro Tag, und „einmal am Tag" ist etwas anderes als
  „dauernd". Ohne diese Achsen ist die Skala eine Zahl ohne Bedeutung.
- **Verzehrbares und Fluch.** Ein Trank ist kein dauerhafter Gegenstand,
  und ein Fluch zieht Punkte ab statt sie hinzuzufügen. Beides sollte von
  Anfang an vorgesehen sein, sonst wird es später angeflanscht.
- **Attunement.** Ob ein Gegenstand Einstimmung braucht, ist im Spiel der
  stärkste Hebel gegen zu viel auf einmal, und gehört deshalb in die
  Rechnung.


## Vorgemerkt: Umgebungen an einer Stelle

Aus der Planung des Encounter Creators, aber eigenständig: Umgebungen gibt
es heute dreimal, an drei Stellen, in drei Formen.

- `apps/monster/src/shared/umgebungen.ts` — 16 Umgebungen mit Themenbindung
  und den Merkmalen `wasser` und `grabbar`. Dient dazu, dass ein
  schwimmendes Wesen nicht in der Wüste wohnt.
- `apps/initiative/src/shared/kampf.ts` — Terrain als eigene Art
  Teilnehmer (`istTerrain`), also die Umgebung als etwas, das im Kampf eine
  Runde hat.
- `apps/inspiration/src/shared/orte.ts` — Orte mit Ausstattung, also die
  Umgebung als Beschreibung zum Vorlesen und als Vorlage für eine Karte.

Drei Sichten auf dieselbe Sache, und keine kennt die andere. Der Encounter
Creator wäre die vierte. Stattdessen: ein gemeinsames Paket unter
`packages/`, das die Umgebung einmal beschreibt — Name, was man sieht, was
am Tisch mit einer Zahl wirkt, welche Themen dazu passen — und das die
Werkzeuge jeweils so lesen, wie sie es brauchen.

Zu klären:

- **Die Regel mit Zahl ist der neue Teil.** „Schneesturm: Sicht höchstens
  30 Fuß" steht heute nirgends. Ohne sie bleibt die Vereinheitlichung ein
  Umzug ohne Gewinn.
- **Was `packages/` darf.** Die Regel der Sammlung gilt: plattformfrei,
  kein `node:*`, kein `electron`, keine Browser-Globals. Für Tabellen und
  reine Funktionen ist das kein Hindernis.
- **Wie umgezogen wird, ohne etwas kaputtzumachen.** Der Monster Creator
  hat Tests auf seine Umgebungen (Thema, Bewegung, beide Sprachen); die
  müssen nach dem Umzug unverändert grün sein, sonst war es kein Umzug.

## Vorgemerkt: Assistent-Fenster weg, wenn die KI aus ist

Im Story Creator steht rechts der Assistent auch dann, wenn die KI in den
Einstellungen ausgeschaltet ist. Dann nimmt er Platz weg für etwas, das
nicht geht. Er soll verschwinden, nicht ausgegraut dastehen.

Was schon da ist: `App.tsx` hält den Zustand der KI (`aiStatus`) und lauscht
über `onKiWechsel` auf Änderungen aus der Hülle, das Umschalten kommt also
ohne Neustart an.

Zwei Dinge sind dabei zu klären:

- **„Aus" und „nicht eingerichtet" sind nicht dasselbe.** `AiStatus` kennt
  heute `ready`, `hasKey` und `managedByShell`, aber kein eigenes Feld für
  den Schalter der Hülle. Wer keinen Schlüssel hinterlegt hat, soll den
  Assistenten weiter sehen — dort steht ja die Anleitung, wie man ihn
  einrichtet. Wer die KI bewusst abgeschaltet hat, soll ihn loswerden. Ohne
  diese Unterscheidung blendet man dem Neuling die Einrichtung aus.
- **Der Platz muss zurückfallen.** Verschwindet die Spalte, soll der Editor
  die Breite bekommen, nicht eine Lücke bleiben. Und dasselbe gilt für den
  Knopf, der den Assistenten öffnet, sowie für den KI-Bereich im
  Schreibhilfe-Dialog.

## Vorgemerkt: Farbthemen, dann Einteilung der Werkzeuge

Zwei Punkte, die zusammengehören und in dieser Reihenfolge gebaut werden
müssen: erst die Farbthemen, dann die Einteilung, die sich ihrer bedient.

### 1. Wählbare Farbthemen, wie in VSCode

Der Nutzer soll zwischen Paletten wählen. Schwerpunkt auf dunklen Themen,
dazu ein paar helle — damit ist der helle Modus gleich mit abgedeckt, ohne
dass es einen eigenen Schalter dafür braucht. Jede Palette muss in sich
stimmig sein, nicht eine Sammlung ausgetauschter Einzelfarben.

Was heute im Weg steht, nachgezählt:

| Werkzeug | harte Farbwerte | eigene Variablen |
| --- | ---: | ---: |
| Würfel | 40 | 11 |
| Initiative | 27 | 12 |
| NPC | 16 | 12 |
| Monster | 16 | 15 |
| Story Creator | 15 | 17 |
| Zustände | 15 | 11 |
| Inspiration | 12 | 11 |
| Karteneditor | 0 | 0 |
| Hülle | — | 16 |

Also: jedes Werkzeug hat seinen eigenen kleinen Satz Variablen, und daneben
stehen überall feste `#…`-Werte im Stylesheet. Ein Thema umzuschalten, das
an neun Stellen anders heißt, geht nicht. Der erste Schritt ist deshalb
nicht die Palette, sondern **ein gemeinsamer Satz benannter Farbrollen** in
einem Paket unter `packages/` — Grund, Grund-hoch, Rand, Text, Text leise,
betont, Warnung, Erfolg und so weiter. Die Werkzeuge benutzen nur noch
Rollen; die Palette setzt die Rollen.

Zu klären:

- **Welche Rollen es gibt.** Zu wenige, und die Themen sehen alle gleich
  aus; zu viele, und niemand kann eine neue Palette bauen, ohne dreißig
  Werte zu treffen. Die 16 der Hülle sind ein brauchbarer Anfang.
- **Die harten Werte müssen weg**, sonst bleibt bei jedem Thema ein Rest
  in der alten Farbe stehen. Der Würfel ist der dickste Brocken, und dort
  stecken Farben zusätzlich in der 3D-Ansicht, nicht nur im Stylesheet.
- **Lesbarkeit prüfen, nicht hoffen.** Jede Palette braucht einen Test auf
  Kontrast zwischen Text und Grund. Sonst gibt es ein schönes Thema, in dem
  die leisen Texte verschwinden. Das lässt sich rechnen und gehört in die
  Prüfungen, wie die Eichung bei den Zuständen.
- **Wo die Einstellung steht.** In der Hülle, zusammen mit Sprache und KI;
  die Werkzeuge bekommen sie durchgereicht, wie die Sprache heute schon.
- **Eigene Paletten später.** Wenn die Rollen einmal stehen, ist eine
  Palette eine kleine Datei. Ob Nutzer eigene ablegen dürfen, ist eine
  spätere Frage, aber das Format sollte sie nicht verbauen.

### 2. Werkzeuge nach Rolle am Tisch gruppieren

Die Kachelseite soll die Werkzeuge einteilen, statt neun gleichwertige
Kacheln nebeneinander zu zeigen:

- **Für die Spielleitung:** Monster Creator, Status Effect Creator,
  Inspirationshilfe, Encounter Creator, NPC Creator, Karteneditor,
  Initiative Tracker.
- **Für alle am Tisch:** Story Creator, Würfel.

Dazu die Idee, beide Gruppen farblich zu unterscheiden. Zwei Vorbehalte,
bevor das gebaut wird:

- **Nicht zwei Themen gleichzeitig.** Wenn jede Gruppe ihre eigene Palette
  bekommt, sieht die Sammlung aus wie zwei Programme. Besser ist ein Thema
  mit einer Zweitfarbe je Gruppe: Kachelrahmen, Kopfzeile des Werkzeugs,
  vielleicht das Symbol. Das muss jede Palette mitliefern, gehört also in
  die Rollen aus Punkt 1.
- **Farbe allein reicht nicht.** Wer Farben schlecht unterscheidet, sieht
  die Einteilung sonst nicht. Es braucht ohnehin Überschriften über den
  Gruppen; die Farbe ist die Zugabe, nicht die Information.

Offen: ob die Zuordnung fest ist oder der Nutzer Werkzeuge verschieben darf.
Der NPC Creator ist der Grenzfall — ein Spieler baut damit auch seinen
Charakterhintergrund.
