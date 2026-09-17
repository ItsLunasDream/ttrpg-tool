# Konzept: Inspirationshilfe

Ein sechstes Werkzeug für die Sammlung. Es hilft beim Erfinden einer
Kampagne oder eines Abenteuers: Region, Thema, Figuren, Orte, und wie das
alles zusammenhängt.

Dies war ein Konzept, kein Plan zum Abarbeiten. Inzwischen ist es gebaut:
`apps/inspiration`.

**Stand:** Alle fünf Stufen stehen — Gerüst und Einbettung, die vier Regler,
die sechs Bausteine, die Verbindungen, die KI neben den Tabellen, das
Übernehmen in den Story Creator, das Geflecht als Bild und der Knopf
„Karte anlegen" zum Karteneditor. Dazu, über das Konzept hinaus: Bearbeiten
von Hand, das Holen vorhandener Figuren aus der offenen Kampagne und ein
KI-Knopf, der alle sechs Bausteine in einer zusammenhängenden Antwort
entwirft. Die offenen Fragen unten sind beantwortet; die Antworten stehen
jeweils dabei.

Offen bleibt aus den „weiteren Vorschlägen": „Was, wenn" und die
Widerspruchsprüfung. Und der Entwurf lebt nur in der Sitzung — wer die
Anwendung schließt, ohne zu übernehmen, fängt neu an.

## Wozu

Am Anfang einer Kampagne steht ein leeres Blatt. Der NPC Creator füllt eine
Zeile davon (eine Randfigur), der Story Creator verwaltet, was schon
steht. Dazwischen fehlt das Werkzeug, das aus einer Handvoll Einfälle ein
Gerüst macht: wer will was, wer steht wem im Weg, wo passiert es.

## Der Grundsatz

**Nichts wird übernommen, was nicht ausgewählt wurde.** Vorschläge stehen
daneben und wandern per Knopf in die Welt. Das Werkzeug schreibt nie von
selbst in eine Kampagne.

**Ohne KI läuft es auch.** Jedes Werkzeug der Sammlung muss das (der NPC
Creator hat dafür seine Tabellen). Hier heißt das: Tabellen für Haken,
Konflikte, Orte und Verbindungen. Ohne die wäre es keine Anwendung, sondern
eine Oberfläche für ein fremdes Modell.

## Die wichtigste Entscheidung: wo die Welt liegt

Der Story Creator hält Figuren, Orte und gerichtete Beziehungen bereits
als Notizen. Die Inspirationshilfe darf keine zweite Ablage aufmachen, sonst
gibt es die Welt zweimal und niemand weiß, welche gilt.

**Vorschlag:** Die Inspirationshilfe hat eine eigene, kurzlebige Ablage für
den Entwurf — Skizzen, verworfene Einfälle, Varianten. Was bleiben soll,
wandert per Knopf als Notiz in die offene Kampagne des Story Creators,
mit Wiki-Verweisen untereinander. Der Weg dorthin existiert schon: der NPC
Creator legt genauso Figuren ab.

Damit gilt: **Entwurf hier, Wahrheit dort.**

## Was man einstellt

Vier Regler, mehr nicht. Wer zwanzig Felder ausfüllen muss, bevor etwas
passiert, macht das Werkzeug einmal auf.

| Einstellung | Beispiel |
| --- | --- |
| Umfang | ein Abend · ein Bogen · eine Kampagne |
| Region | Hafenstadt · Grenzwald · Unterreich |
| Thema | Schuld · Aufstieg · Verrat · Seuche |
| Tonfall | heiter · düster · gefährlich · politisch |

Alle vier sind freie Textfelder mit Vorschlagsliste. Eine feste Auswahl
verbaut jeden Tisch, der etwas anderes spielt.

## Was dabei herauskommt

Sechs Bausteine, jeder einzeln erzeugbar und einzeln übernehmbar:

1. **Aufhänger** — drei Sätze, warum die Gruppe überhaupt anfängt.
2. **Fraktionen** mit Zielen, die einander im Weg stehen. Daraus entsteht
   Handlung von selbst, ohne dass jemand eine Geschichte schreiben muss.
3. **Figuren** — aus dem NPC Creator übernommen oder neu, mit einer Rolle im
   Geflecht (Auftraggeberin, Gegenspieler, Ahnungslose).
4. **Orte**, die zur Region passen, je mit drei Sätzen, warum der Ort eine
   Szene wert ist.
5. **Verbindungen** zwischen Figuren: selbe Familie, Lehrerin und Schülerin,
   gemeinsame Schuld, alte Rechnung.
6. **Zeitstrahl: was passiert, wenn die Gruppe nichts tut.** Der Trick, mit
   dem Abenteuer lebendig wirken, statt auf die Gruppe zu warten.

## Die Verbindungen

Der Kern des Wunsches und der interessanteste Teil.

**Zwei Wege hinein:**

- *Neu bauen:* Das Werkzeug erzeugt Figuren und verbindet sie gleich.
- *Bestehende verbinden:* Vorhandene Figuren — aus dem NPC Creator oder aus
  der Kampagne — werden ausgewählt, und das Werkzeug schlägt vor, was sie
  miteinander zu tun haben.

**Bedienung:** ein Geflecht wie der Graph im Story Creator, aber als
Entwurf. Zwei Figuren zusammenziehen heißt „findet etwas zwischen diesen
beiden". Das Ergebnis ist eine gerichtete Beziehung, wie sie der Backstory
Creator führt: A sieht B als Mentorin, B sieht A als Bedrohung.

**Ohne KI** kommen die Verbindungen aus einer Tabelle mit Mustern
(Verwandtschaft, Schuld, Lehre, Rivalität, gemeinsames Geheimnis), die mit
den Namen der beiden Figuren gefüllt werden.

## Und der Karteneditor?

Die Frage kam vom Nutzer: ob der Karteneditor mit hineingehört. Ehrliche
Antwort: **teilweise, und nicht als Erstes.**

**Was naheliegt und wenig kostet**

Die Inspirationshilfe erzeugt Orte. Ein Ort ohne Karte ist eine Notiz, ein
Ort mit Karte ist ein Schauplatz. Der einfache Weg:

- Zu jedem erzeugten Ort ein Knopf **„Karte anlegen"**, der den Karteneditor
  öffnet und dort eine leere Karte unter diesem Namen beginnt.
- Umgekehrt: eine vorhandene Karte als Ort übernehmen, damit sie im
  Beziehungsnetz auftaucht.

Das ist derselbe Handgriff, den der NPC Creator schon macht, nur in Richtung
Karteneditor statt Story Creator.

**Was verlockend klingt und schwierig ist**

„Die Inspirationshilfe zeichnet gleich die Karte" — eine Battlemap oder
Weltkarte aus Text erzeugen. Davon würde ich abraten:

- Der Karteneditor arbeitet mit Ebenen, Wänden, Lichtern und Props. Etwas
  Brauchbares zu erzeugen hieße, sein Datenmodell von außen zu bedienen; das
  ist ein Projekt für sich, kein Knopf.
- Was dabei herauskäme, müsste man ohnehin von Hand nacharbeiten. Eine leere
  Karte mit dem richtigen Namen ist ehrlicher.
- Der Karteneditor bringt eine eigene Historie und eigene Konventionen mit
  (`apps/mapmaker/CLAUDE.md`). Je weniger von außen hineingreift, desto
  besser lässt er sich weiterpflegen.

**Ein dritter Weg, falls es doch mehr sein soll**

Nicht die Karte zeichnen, sondern **beschreiben, was darauf gehört**: „drei
Eingänge, einer verschüttet", „ein Turm im Nordosten", „Wasser auf zwei
Seiten". Das liest sich am Tisch, taugt als Vorlage zum Zeichnen und braucht
keinen Eingriff in fremdes Datenmodell.

**Vorschlag:** Stufe 1 bis 4 ohne Karteneditor bauen. Den Knopf „Karte
anlegen" in Stufe 5, zusammen mit dem Zeichnen des Geflechts. Das Beschreiben
der Karte gehört zu den Orten und kostet nichts extra.

**So gebaut.** Der Knopf steht an jedem Ort und schickt den Namen und
Notiz-Pins hinüber. Der Weg führt über die Hülle und nicht direkt — die
beiden Anwendungen kennen einander nicht. Sie holt den Karteneditor nach
vorn und stellt den Namen zu, sobald er montiert, geladen und sichtbar ist;
dort entsteht daraus eine leere Karte, mit Rückfrage, falls auf der offenen
schon etwas steht. Die Zeile „Auf der Karte" bleibt Text und wird nicht
gezeichnet, wie hier vorgeschlagen.

**Nachgezogen: auf die Karte geht nur, was man zeichnen kann.** Im ersten
Anlauf gingen auch Merkmal und Zustand als Pins mit. Aus dem Gebrauch kam
die Rückmeldung, dass das beim Kartenbau nichts hilft: „es riecht
durchgehend nach etwas, das hier nicht verarbeitet wird" ist ein guter Satz
für eine Notiz und auf einer Karte wertlos — einen Geruch zeichnet man
nicht, eine Verpfändung auch nicht.

Deshalb trägt ein Ort jetzt ein eigenes Feld **„Was dort steht"**: drei
Dinge aus `ORT_AUSSTATTUNG`, jedes mit Größe oder Lage dabei, damit klar
ist, wie viel Platz es braucht und was es blockiert — „ein Karren ohne Rad,
quer im Durchgang", „Fässer, brusthoch gestapelt, zwei Reihen tief",
„Stützbalken alle vier Schritt, einer geborsten". Auf die Karte gehen nur
noch der Grundriss, die Art des Ortes und je ein Pin pro Ding; ein Pin je
Ding, weil man ihn dorthin schiebt, wo das Ding steht. Merkmal und Zustand
bleiben in der Ortsnotiz, wo sie hingehören.

Zwei Tests halten die Regel fest: kein Eintrag darf etwas nennen, das man
nur riechen oder hören kann, und jeder muss ein Maß oder eine Lage tragen.
Der zweite hat beim Schreiben prompt neunzehn eigene Einträge verworfen.

## Weitere Vorschläge

- **„Was, wenn"** — eine bestehende Figur nehmen und fragen, was sie
  ausgerechnet in dieser Region zu suchen hat.
- **Namensaussaat** — alles Erzeugte kann als Notizen im Story Creator
  landen, untereinander verlinkt, statt Zeile für Zeile abgetippt zu werden.
- **Würfeln statt wählen** — ein Knopf, der alle sechs Bausteine auf einmal
  zieht. Für den Abend, an dem in zehn Minuten gespielt wird.
- **Festhalten wie im NPC Creator** — ein Schloss je Baustein, damit
  Nachwürfeln nicht wegnimmt, was schon gefällt.
- **Widerspruchsprüfung** — der Assistent des Story Creators kann bereits
  gegen verlinkte Notizen prüfen. Für eine frisch erzeugte Kampagne wäre das
  derselbe Handgriff.

## Offene Fragen

1. Wie heißt das Werkzeug? „Inspirationshilfe" ist ein Arbeitstitel — und
   steht bis auf Weiteres so in der Hülle.
2. Braucht der Entwurf eine eigene Datei auf der Platte, oder reicht es,
   wenn er bis zum Übernehmen im Speicher lebt? **Gebaut:** nur im Speicher.
   Wer die Anwendung schließt, verliert einen nicht übernommenen Entwurf —
   das ist der Preis dafür, dass es keine zweite Ablage gibt.
3. Wie viel darf die KI auf einmal? **Gebaut:** beides. Je Baustein ein
   kleiner Knopf, mit dem bisherigen Entwurf als Umgebung — und ein großer,
   der alles auf einmal entwirft, damit die Stücke aufeinander Bezug nehmen
   können. Was die Gesamtantwort ausläßt, kommt aus den Tabellen; was über
   den eingestellten Umfang hinausgeht, fällt weg.
4. Übernimmt man einzeln oder alles zusammen? **Gebaut:** alles zusammen,
   auf einen Knopf. Eine Auswahl je Notiz wäre ein zweiter Dialog vor dem
   eigentlichen Ziel; wer einzelne Stücke nicht will, löscht die Notiz
   drüben oder würfelt sie vorher weg.

## Ein möglicher Zuschnitt

Falls gebaut wird, in dieser Reihenfolge — jede Stufe für sich benutzbar:

1. Gerüst, Einbettung, die vier Einstellungen, Tabellen für Aufhänger und
   Orte. Ohne KI vollständig.
2. Figuren aus dem NPC Creator übernehmen, Verbindungen aus der Mustertabelle.
3. KI: Bausteine frei vorschlagen lassen, wie im NPC Creator neben den
   Tabellen und nicht an ihrer Stelle.
4. Übernehmen in den Story Creator, mit Wiki-Verweisen.
5. Das Geflecht als Bild, Zeitstrahl, und der Knopf „Karte anlegen" zum
   Karteneditor.
