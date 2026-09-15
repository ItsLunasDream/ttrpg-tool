# Konzept: Inspirationshilfe

Ein sechstes Werkzeug für die Sammlung. Es hilft beim Erfinden einer
Kampagne oder eines Abenteuers: Region, Thema, Figuren, Orte, und wie das
alles zusammenhängt.

Dies ist ein Konzept, kein Plan zum Abarbeiten. Erst besprechen, dann bauen.

## Wozu

Am Anfang einer Kampagne steht ein leeres Blatt. Der NPC Creator füllt eine
Zeile davon (eine Randfigur), der Backstory Creator verwaltet, was schon
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

Der Backstory Creator hält Figuren, Orte und gerichtete Beziehungen bereits
als Notizen. Die Inspirationshilfe darf keine zweite Ablage aufmachen, sonst
gibt es die Welt zweimal und niemand weiß, welche gilt.

**Vorschlag:** Die Inspirationshilfe hat eine eigene, kurzlebige Ablage für
den Entwurf — Skizzen, verworfene Einfälle, Varianten. Was bleiben soll,
wandert per Knopf als Notiz in die offene Kampagne des Backstory Creators,
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

**Bedienung:** ein Geflecht wie der Graph im Backstory Creator, aber als
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
Karteneditor statt Backstory Creator.

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

## Weitere Vorschläge

- **„Was, wenn"** — eine bestehende Figur nehmen und fragen, was sie
  ausgerechnet in dieser Region zu suchen hat.
- **Namensaussaat** — alles Erzeugte kann als Notizen im Backstory Creator
  landen, untereinander verlinkt, statt Zeile für Zeile abgetippt zu werden.
- **Würfeln statt wählen** — ein Knopf, der alle sechs Bausteine auf einmal
  zieht. Für den Abend, an dem in zehn Minuten gespielt wird.
- **Festhalten wie im NPC Creator** — ein Schloss je Baustein, damit
  Nachwürfeln nicht wegnimmt, was schon gefällt.
- **Widerspruchsprüfung** — der Assistent des Backstory Creators kann bereits
  gegen verlinkte Notizen prüfen. Für eine frisch erzeugte Kampagne wäre das
  derselbe Handgriff.

## Offene Fragen

1. Wie heißt das Werkzeug? „Inspirationshilfe" ist ein Arbeitstitel.
2. Braucht der Entwurf eine eigene Datei auf der Platte, oder reicht es,
   wenn er bis zum Übernehmen im Speicher lebt? Für den ersten Bau würde
   Sitzungszustand genügen.
3. Wie viel darf die KI auf einmal? Eine ganze Kampagne in einer Anfrage ist
   teuer und schwer zu lesen; Baustein für Baustein ist langsamer, aber man
   sieht, was passiert.
4. Übernimmt man einzeln oder alles zusammen?

## Ein möglicher Zuschnitt

Falls gebaut wird, in dieser Reihenfolge — jede Stufe für sich benutzbar:

1. Gerüst, Einbettung, die vier Einstellungen, Tabellen für Aufhänger und
   Orte. Ohne KI vollständig.
2. Figuren aus dem NPC Creator übernehmen, Verbindungen aus der Mustertabelle.
3. KI: Bausteine frei vorschlagen lassen, wie im NPC Creator neben den
   Tabellen und nicht an ihrer Stelle.
4. Übernehmen in den Backstory Creator, mit Wiki-Verweisen.
5. Das Geflecht als Bild, Zeitstrahl, und der Knopf „Karte anlegen" zum
   Karteneditor.
