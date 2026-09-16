# Konzept: Monster Creator

Ein achtes Werkzeug. Es baut Homebrew-Monster zu einem vorgegebenen
Herausforderungsgrad — mit und ohne KI — und **prüft jedes Ergebnis gegen
ein Punktsystem**, egal woher es kommt.

Dies ist ein Konzept, kein Plan zum Abarbeiten.

## Wozu, und was daran schwer ist

Ein Monster zu erfinden ist leicht. Ein Monster zu erfinden, das den
Kampfabend nicht kaputt macht, ist es nicht. Homebrew geht fast immer in
dieselben zwei Richtungen schief: zu viele Trefferpunkte bei zu wenig
Schaden (der Kampf wird lang und langweilig) oder zu viel Schaden bei zu
wenig Trefferpunkten (jemand geht zu Boden, bevor der Kampf anfängt).

Deshalb ist die **Prüfung** hier nicht ein Zusatz am Ende, sondern der Kern
des Werkzeugs. Alles andere ist Beiwerk drumherum.

## Der Grundsatz: die Zahlen entscheiden, nicht die Prosa

Drei Sätze, die alles Weitere bestimmen:

1. **Die Bewertung läuft über alles.** Ob ein Monster gewürfelt, von Hand
   getippt oder von der KI vorgeschlagen wurde, ist der Prüfung egal. Sie
   rechnet aus den Zahlen einen CR und vergleicht ihn mit dem eingestellten.
2. **Die Prüfung ist eine reine Funktion.** Rein wie `wuerfle()` im
   Würfelwerkzeug und `erzeugeEntwurf()` in der Inspirationshilfe: Zahlen
   rein, Befund raus, kein Zufall, keine Dateien. Nur so lässt sie sich gegen
   bekannte Monster prüfen (siehe unten), und nur so ist sie glaubwürdig.
3. **Die KI darf vorschlagen, nicht entscheiden.** Ihre Antwort geht
   denselben Weg wie ein Handeintrag: durch die Prüfung. Besteht sie nicht,
   sagt das Werkzeug, was klemmt.

## Woher die Richtwerte kommen — und woher nicht

Das ist der heikelste Punkt am ganzen Werkzeug, und er ist rechtlich, nicht
technisch.

**Die Tabellen aus dem Dungeon Master's Guide dürfen nicht ins Repository.**
Das Kapitel zum Monsterbau ist nicht Teil des SRD; es steht unter normalem
Urheberrecht. In einem öffentlichen Repository unter AGPL wäre das eine
Verletzung, und zwar eine offensichtliche.

**Es gibt eine saubere Quelle.** Das *Lazy GM's 5e Monster Builder Resource
Document* von Teos Abadía, Scott Fitzgerald Gray und Michael E. Shea steht
unter **Creative Commons Attribution 4.0** und enthält genau, was gebraucht
wird: eine Tabelle „Monster Statistics by Challenge Rating" von CR 0 bis 30
mit Rüstungsklasse/SG, Trefferpunkten, Übungsbonus, Schaden pro Runde,
Anzahl Angriffe und Schaden je Angriff.

CC-BY verträgt sich mit AGPL: benutzen und weitergeben ist erlaubt, solange
die Herkunft genannt wird. Konkret hieße das ein Hinweis in der
Datei mit den Tabellen, im README und im Über-Dialog.

**Das muss vor dem Bauen bestätigt werden.** Ich habe die Lizenz auf der
Quelle gelesen; wer das Werkzeug baut, sollte sie noch einmal selbst
ansehen, bevor Zahlen ins Repository wandern. Eine Fehleinschätzung an
dieser Stelle fällt bei einem öffentlichen Repository auf.

Quellen:
- [Lazy GM's 5e Monster Builder Resource Document](https://slyflourish.com/lazy_5e_monster_building_resource_document.html)
- [dieselbe Fassung als Markdown](https://github.com/crit-tech/LGMRD/blob/main/5e_Monster_Builder.md)
- [SRD 5.2 unter CC-BY](https://www.dndbeyond.com/srd) — enthält Monster, aber nicht das Kapitel zum Monsterbau

## Wie die Prüfung rechnet

Nach dem bekannten Verfahren, in drei Schritten:

```
Verteidigung   aus Trefferpunkten und Rüstungsklasse
               → ein CR, den das Monster aushält

Angriff        aus Schaden pro Runde (über drei Runden gemittelt)
               und Angriffsbonus bzw. Rettungs-SG
               → ein CR, den das Monster austeilt

Ergebnis       der Mittelwert aus beiden
```

Dazu die Anpassungen, die den Unterschied zwischen „stimmt auf dem Papier"
und „stimmt am Tisch" ausmachen:

- **Resistenzen und Immunitäten** erhöhen die wirksamen Trefferpunkte — aber
  nur, wenn die Gruppe den Schadenstyp auch bringt. Das Werkzeug rechnet mit
  einem Aufschlag und sagt dazu, dass es eine Annahme ist.
- **Fähigkeiten, die den Kampf verkürzen** (Betäuben, Festhalten, Angst)
  zählen offensiv, auch wenn sie keinen Schaden machen.
- **Legendäre Aktionen und Widerstände** sind Vervielfacher, kein Aufschlag:
  ein Einzelgegner mit legendären Aktionen kämpft gegen vier Figuren
  überhaupt erst mit.
- **Mehrfachangriffe** gehen über den Schaden pro Runde ein, nicht je
  Angriff — eine der häufigsten Fehlerquellen bei Homebrew.

### Der Befund, den man zu sehen bekommt

Kein „bestanden/nicht bestanden", sondern eine Ampel mit Begründung:

```
Eingestellt:  CR 5   (1.800 XP)
Gerechnet:    CR 7   ⚠ zu stark

  Verteidigung   CR 4    136 TP, RK 15          ✓ passt
  Angriff        CR 9    58 Schaden/Runde       ✗ 14 zu viel
                         Angriffsbonus +9        ✓ passt

  Der Schaden trägt das Ergebnis. Drei Vorschläge:
  → Mehrfachangriff von 3 auf 2 senken           (−19 Schaden)
  → Schaden je Angriff von 2W10 auf 2W8          (−6)
  → Trefferpunkte auf 170 anheben, CR 6 anpeilen (+1 CR defensiv)
```

Das ist der Punkt, an dem das Werkzeug mehr ist als eine Tabelle: es sagt
nicht nur, *dass* etwas klemmt, sondern *woran* und *was man drehen kann*.

### Wie wir wissen, ob die Prüfung stimmt

Eine Prüfung, die falsch rechnet, ist schlimmer als keine — sie gibt
Sicherheit, wo keine ist. Deshalb gehört zum Werkzeug ein Test, der die
Rechnung **gegen bekannte Monster** laufen lässt: die Kreaturen aus dem SRD
(frei verwendbar) mit ihrem offiziellen CR hineingeben und sehen, was
herauskommt.

Anspruch: der gerechnete CR liegt bei der großen Mehrheit höchstens einen
Grad daneben. Wo er weiter danebenliegt, ist das ein Fund — entweder rechnet
die Prüfung falsch, oder das offizielle Monster ist selbst ein Ausreißer.
Beides will man wissen, und beides gehört dokumentiert.

## Was man einstellt

- **CR oder XP** — eins von beidem, das andere rechnet sich mit. XP ist für
  viele die geläufigere Größe („ich brauche 4.000 XP für den Abend").
- **Thema**: Untot, Bestie, Konstrukt, Aberration, Elementar, …
- **Rolle**: Nahkämpfer, Schütze, Zauberer, Anführer, Schwarm, Brecher,
  Lauerer. Die Rolle verteilt die Punkte — ein Schütze bekommt weniger
  Trefferpunkte und mehr Reichweite, ein Brecher umgekehrt.
- **Umgebung** (optional): Wald, Unterreich, Stadt, Tiefsee — färbt Namen,
  Sinne und Bewegungsarten.
- **Einzelgegner oder Gruppe**: ein Einzelgegner braucht legendäre Aktionen
  und mehr Aktionen pro Runde, sonst ist er in Runde zwei gebunden und tot.

## Was die KI dazu tut

Sie schreibt das, was Tabellen schlecht können: **Namen, Fähigkeiten mit
Eigenart, Taktik, Beschreibung.** Die Zahlen setzt sie vor, aber sie
entscheiden nichts — sie gehen durch die Prüfung wie alles andere.

Der Ablauf, wenn die KI ein Monster liefert:

```
Antwort lesen  →  Zahlen prüfen  →  wenn CR daneben:
                                      a) Zahlen automatisch nachziehen
                                         (Trefferpunkte und Schaden auf die
                                          Richtwerte des Ziel-CR)
                                      b) und es dazusagen
```

Punkt b) ist wichtig: stillschweigend nachzuziehen wäre bequem und falsch.
Wer sieht, dass die KI beim Schaden um 40 Prozent danebenlag, lernt etwas
über ihre Vorschläge.

Die Prosa bleibt unangetastet. Eine Fähigkeit umzuschreiben, weil ihre
Zahlen nicht passen, ist Aufgabe der Zahlen, nicht des Textes.

## Wohin ein fertiges Monster geht

- **Initiative Tracker** — der Hauptweg. Ein fertiges Monster gehört in die
  Begegnung, nicht in eine Sammelmappe.
- **Story Creator** als Notiz, für Monster mit einer Rolle in der Geschichte.
- **Markdown-Export** im üblichen Statblock-Aufbau.
- **Karteneditor**: nicht vorgesehen. Ein Monster ist kein Ort.

## Offene Fragen

- **Wie weit geht die Automatik?** Soll das Werkzeug ein unpassendes Monster
  von selbst zurechtrücken, oder nur sagen, was klemmt? Vorschlag: sagen,
  mit einem Knopf „übernehmen" je Vorschlag. Automatik ohne Zustimmung nimmt
  einem die Entscheidung ab, die man gerade treffen wollte.
- **Wie viele Fähigkeiten?** Ein Monster mit acht Sonderfähigkeiten liest am
  Tisch niemand. Eine Obergrenze nach CR wäre eine Vorgabe mit Meinung —
  vermutlich die richtige.
- **Gruppen.** „Vier Gegner mit CR 2" ist etwas anderes als „ein Gegner mit
  CR 5". Die Umrechnung über Begegnungsmultiplikatoren gehört eigentlich in
  den Initiative Tracker oder ein eigenes Begegnungswerkzeug — das steht als
  `encounter` ohnehin auf der Kachelliste. Hier zunächst weglassen?
- **Welche Fassung?** 5e 2014 und 2024 rechnen CR unterschiedlich. Die
  CC-BY-Quelle oben ist auf dem Stand von 2024. Ein Schalter wäre möglich,
  verdoppelt aber die Tabellen und die Tests.
- **Eigene Richtwerte.** Wer nach anderen Vorgaben baut, will die Tabelle
  ersetzen können. Als Datei im Datenordner, wie die Schreibhilfe-Vorschläge?
