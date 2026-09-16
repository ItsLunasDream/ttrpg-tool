# Konzept: Status Effect Creator

Ein siebtes Werkzeug für die Sammlung. Es baut eigene Zustände — „Freezing",
„Sandblind", „Marked by the Hunt" — mit Regeltext, Stufen und, wenn man
will, einer Anbindung an die Umgebung, die sie von selbst auslöst.

Dies ist ein Konzept, kein Plan zum Abarbeiten. Es steht hier, damit wir
darüber reden, bevor gebaut wird.

## Wozu

Die fünf, sechs Zustände aus dem Regelwerk kennt jeder am Tisch. Sie decken
Kampf ab und sonst wenig. Was fehlt, sind die Zustände, die eine *Welt*
beschreiben: Kälte, die sich aufbaut. Ein Fluch, der beim dritten Mal etwas
anderes tut als beim ersten. Eine Markierung, die ein Jäger auf einer Beute
lässt.

So etwas schreibt man sich heute auf einen Zettel und vergisst beim vierten
Mal, wie Stufe 2 noch gleich ging. Das Werkzeug soll daraus einen Eintrag
machen, der am Tisch in drei Sekunden lesbar ist — und der dem Initiative
Tracker bekannt ist, damit er selbst mitzählt.

## Der Grundsatz

**Ohne KI vollständig.** Wie bei der Inspirationshilfe und dem NPC Creator:
Tabellen tragen das Werkzeug, die KI ist eine Zugabe. Wer keine einrichtet,
merkt beim Bauen eines Zustands keinen Unterschied — er bekommt Vorschläge
aus kombinierenden Tabellen statt aus einem Modell.

**Regeltext ist kurz oder er wird nicht gelesen.** Ein Zustand hat einen
Satz, der sagt, was er tut. Alles Weitere steht darunter und ist Beiwerk.
Ein Absatz Fließtext am Tisch ist eine Unterbrechung.

**Systemneutral, wo es geht.** Wie der Initiative Tracker: das Werkzeug
kennt Stufen, Dauern und Auslöser. Was „Nachteil auf Angriffswürfe"
bedeutet, entscheidet der Tisch. Vorgaben und Beispiele orientieren sich an
5e, weil die Sammlung das ohnehin tut, aber nichts davon ist fest verdrahtet.

## Was ein Zustand ist

```
Name              Freezing
Kurzsatz          Die Kälte kriecht dir in die Knochen.
Symbol/Farbe      ❄ blau        (für den Tracker)
Stufen            1 bis 5       (oder: keine Stufen)
Je Stufe          Regeltext, der mit der Stufe wächst
Dauer             offen | bis Rundenende | bis Zugbeginn | X Stunden | bis geheilt
Verschlimmerung   wodurch die Stufe steigt
Linderung         wodurch sie fällt, und was ihn ganz aufhebt
Auslöser          optional: eine Umgebung, die ihn von selbst gibt
```

Die Stufen sind der Kern. Ein Zustand ohne Stufen ist ein Sonderfall mit
genau einer — das Werkzeug soll beides können, ohne dass der einfache Fall
kompliziert aussieht.

**Beispiel, wie es herauskommen soll:**

```
Freezing (1–5)                                    ❄
Die Kälte kriecht dir in die Knochen.

  1   Nachteil auf Wahrnehmung.
  2   Bewegungsrate halbiert.
  3   Nachteil auf Angriffswürfe und Geschicklichkeitsproben.
  4   Du kannst keine Reaktionen nutzen.
  5   Bewusstlos. Nach einer weiteren Stunde: Tod durch Erfrieren.

  Schlimmer:  jede Stunde in sehr kalter Umgebung ohne Schutz
  Besser:     eine Stunde an Wärme senkt um 1
  Weg:        Lesser Restoration hebt zwei Stufen auf
```

## Die Umgebung — und warum sie optional bleibt

Das ist der Teil, der das Werkzeug von einer Textvorlage unterscheidet: ein
Zustand kann eine **Umgebung** nennen, die ihn auslöst, und ein Intervall,
in dem das passiert.

```
Umgebung     sehr kalt (unter -10 °C), ohne Kälteschutz
Intervall    jede Stunde
Wurf         Konstitution, SG 12 — Erfolg verhindert die Stufe
```

Drei Dinge dazu, die zusammen entscheiden, ob das am Tisch trägt:

1. **Optional heißt wirklich optional.** Die meisten Zustände haben keine
   Umgebung. „Marked by the Hunt" kommt von einer Figur, nicht vom Wetter.
   Das Feld ist zugeklappt, bis jemand es aufklappt.
2. **Die Umgebung ist ein Text, keine Simulation.** Das Werkzeug modelliert
   kein Wetter. Es hält fest, *wann* der Zustand zuschlägt, und der
   Initiative Tracker oder die Spielleitung entscheidet, ob die Bedingung
   gerade gilt. Alles andere wäre ein Klimamodell im Rollenspielwerkzeug.
3. **Das Intervall ist die eigentliche Arbeit.** „Jede Stunde" ist nichts,
   was man im Kampf abhandelt — es gehört in die Reisezeit. Dafür braucht es
   im Tracker einen Zähler, der auch außerhalb eines Kampfes läuft. Siehe
   „Offene Fragen".

## Was man einstellt

Vier Regler, wie bei der Inspirationshilfe — freie Felder mit
Vorschlagsliste, damit eigene Begriffe nicht abprallen:

- **Art**: Umgebung, Gift, Fluch, Krankheit, Verletzung, Magie, Segen
- **Thema**: Kälte, Hitze, Fäulnis, Wahnsinn, Licht, Leere, …
- **Wirkrichtung**: Schaden, Debuff, Buff, gemischt
- **Härte**: lästig, ernst, gefährlich, tödlich
- **Stufen**: keine, 3, 5, eigene Zahl

**Art und Wirkrichtung sind zwei verschiedene Fragen**, deshalb zwei Regler.
Die Art sagt, *woher* der Zustand kommt; die Wirkrichtung, *wohin* er wirkt.
Ein Fluch kann Schaden über Zeit sein oder ein Debuff; ein Segen ist fast
immer ein Buff, aber „Blessed by the Wolf" kann beides sein — Stärke dazu,
Selbstbeherrschung weg.

Die Wirkrichtung wählt die Wirkungsliste aus, aus der gezogen wird:

```
Schaden   Schaden je Runde/Stunde | verlorene Trefferpunkte-Höchstgrenze
Debuff    Nachteil, Abzüge, verlorene Aktionen, Bewegung
Buff      Vorteil, Boni, zusätzliche Bewegung, Widerstand
gemischt  ein Buff und ein Debuff, die zusammengehören
```

„Gemischt" ist der interessanteste Fall und der, den Tabellen gut können:
zwei Wirkungen mit Vorzeichen, die aufeinander zeigen. Genau das schreibt
sich von Hand ungern auf.

Daraus baut der Würfel einen vollständigen Zustand. Jedes Feld hat ein
Schloss und lässt sich von Hand überschreiben — dieselbe Handhabung wie im
NPC Creator, damit man nicht zweimal lernen muss, wie ein Werkzeug der
Sammlung funktioniert.

## Wie die Tabellen das ohne KI schaffen

Die Sorge ist berechtigt: fünf Stufen Regeltext klingen nach etwas, das nur
ein Modell kann. Sie sind es nicht, wenn man sie als *Bausteine* baut statt
als Sätze.

Eine Stufe ist eine **Wirkung** aus einer Liste, und die Liste ist nach
Schwere sortiert:

```
leicht    Nachteil auf eine Fertigkeit | -1 auf einen Wurf | Bewegung -5 Fuß
mittel    Nachteil auf eine Rettung | Bewegung halbiert | keine Reaktion
schwer    Nachteil auf alle Angriffe | keine Bonusaktion | Erschöpfung +1
tödlich   handlungsunfähig | bewusstlos | sterbend
```

Der Erzeuger zieht je Stufe eine Wirkung, aufsteigend, ohne Wiederholung,
passend zum Thema (Kälte greift eher Bewegung und Geschick an, Wahnsinn eher
Konzentration und Rettungswürfe). Bei fünf Stufen und einigen Dutzend
Wirkungen je Schwere sind das Millionen Verläufe — dieselbe Rechnung wie bei
der Inspirationshilfe, und sie steht wie dort in der Oberfläche.

Namen entstehen zweiteilig (Thema + Form: „Frostbite", „Creeping Chill",
„Winter's Grasp"), Kurzsätze aus einer Satzschablone je Thema.

### Stichpunkte statt Fließtext — und Masken dort, wo Text sein muss

Ohne KI wird **nicht ausformuliert**. Eine Stufe ist ein Stichpunkt:

```
2   Bewegungsrate halbiert
3   Nachteil auf Angriffswürfe und Geschicklichkeitsproben
```

und nicht „Die klamme Kälte macht deine Glieder schwer, sodass du dich nur
noch halb so schnell bewegen kannst." Der zweite Satz liest am Tisch
niemand, und eine Tabelle, die ihn erzeugt, klingt nach drei Würfen immer
gleich — das ist der Weg, auf dem generierter Text langweilig wird.

**Textmasken gibt es trotzdem, aber nur an zwei Stellen**, und beide sind
kurz genug, dass Wiederholung nicht auffällt:

```
Kurzsatz          „{Thema-Bild} {kriecht|frisst|legt sich} {dir in die
                   Knochen|über deine Sinne|auf die Brust}."
Verschlimmerung   „{Intervall} {Umgebung} ohne {Schutz}"
Linderung         „{Dauer} {Gegenmittel} senkt um {Zahl}"
```

Eine Maske ist dabei nur ein Satz mit Lücken, und die Lücken werden aus
denselben Tabellen gefüllt wie alles andere. Wichtig ist die Anzahl: je
Maske ein Dutzend Varianten je Lücke, sonst erkennt man das Muster nach
fünf Zuständen wieder.

**Was die KI daraus macht:** sie bekommt genau diese Stichpunkte und darf
sie ausformulieren, wenn jemand das will. Ein eigener Knopf, nicht
automatisch — wer Stichpunkte wollte, soll keine Prosa zurückbekommen.

## Was die KI dazu tut

Dasselbe Muster wie in den anderen Werkzeugen: **frei vorschlagen, nicht aus
den Tabellen.** Ein Modell, das würfelt, wäre ein langsamer Würfel.

- **Ein Feld**: einen Namen, einen Kurzsatz, eine einzelne Stufe neu.
- **Alles**: einen zusammenhängenden Zustand, bei dem die fünf Stufen
  aufeinander aufbauen und nicht fünf zufällige Wirkungen sind.
- **Eigene Themen**: „Zeitkrankheit", „Netzabhängigkeit im Cyberpunk" —
  Begriffe, mit denen die Tabellen nichts anfangen, aber ein Modell schon.

Und die Bremse, die es überall braucht: **was zurückkommt, wird geprüft,
bevor es angezeigt wird.** Stufen dürfen nicht rückwärts schwächer werden,
eine Stufe darf nicht zweimal dieselbe Wirkung tragen, Zahlen müssen im
Rahmen liegen. Was das Modell ausläßt, füllen die Tabellen auf. Das ist
genau der Weg, den `uebernahme.ts` in der Inspirationshilfe schon geht.

## Ein Punktesystem — und was es ehrlicherweise leisten kann

Dein Einwand dazu ist der richtige: **ein Zustand lässt sich nicht so
balancieren wie ein Monster.** Beim Monster steht die Frage fest („vier
Figuren, ein Kampf, wie lange hält es durch"). Beim Zustand fehlt genau die
Angabe, die alles entscheidet — wie oft man ihn bekommt und wie leicht man
ihn wieder los wird. Derselbe „Freezing"-Zustand ist harmlos, wenn die
Gruppe alle zwei Stunden an ein Feuer kommt, und tödlich auf einem
Gletschermarsch ohne Holz.

Ein Punktwert, der so täte, als wüsste er das, wäre eine Scheingenauigkeit.
Und die ist schlimmer als gar keine Zahl: sie gibt Sicherheit, wo keine ist.

**Was sich trotzdem sinnvoll rechnen lässt**, ist nicht „Balance", sondern
das **Gewicht** eines Zustands — wie schwer er wiegt, wenn er anliegt:

```
Jede Wirkung hat einen Punktwert:
  Nachteil auf eine Fertigkeit            1
  Bewegung halbiert                       2
  Nachteil auf alle Angriffe              3
  keine Reaktion                          2
  keine Aktion / handlungsunfähig         6
  Schaden je Runde                        1 je 5 % der Höchst-TP
  Buff: Vorteil auf eine Sache           -1
  …

Gewicht = Summe der Wirkungen bis zur höchsten Stufe
```

Damit kann das Werkzeug drei Dinge sagen, die alle stimmen:

1. **„Dieser Zustand wiegt 14. Das ist so viel wie drei Stufen
   Erschöpfung."** Ein Vergleich mit Bekanntem — die einzige Zahl, die am
   Tisch etwas bedeutet.
2. **„Der Sprung von Stufe 3 auf 4 verdoppelt das Gewicht."** Ungleichmäßige
   Stufen sind der häufigste Fehler bei selbstgebauten Zuständen, und man
   sieht sie beim Schreiben nicht.
3. **„Das passt nicht zu deinem Regler."** Auf „lästig" gestellt und Gewicht
   22 herausbekommen heißt: irgendetwas ist durchgerutscht — meistens eine
   Wirkung aus der falschen Schwereliste.

Was es **nicht** sagt und auch nicht sagen soll: ob der Zustand für deine
Kampagne zu hart ist. Das hängt am Auslöser, und den kennt nur der Tisch.
Das Werkzeug schreibt diesen Satz auch hin, statt ihn wegzulassen.

**Das Gewicht prüft auch die KI.** Dasselbe Muster wie beim Monster Creator:
was das Modell liefert, wird gewogen, bevor es angezeigt wird. Steigt das
Gewicht über die Stufen nicht an, ist die Antwort kaputt und wird
zurückgewiesen — dafür braucht es kein Urteil über Balance, das ist reines
Nachzählen.

## Wohin ein fertiger Zustand geht

Drei Wege, und alle drei gibt es in der Sammlung schon:

1. **Initiative Tracker.** Der wichtigste. Der Tracker kennt heute Zustände
   mit Dauer; er müsste zusätzlich Stufen kennen und den Regeltext anzeigen
   können. Ein eigener Zustand steht dann in derselben Liste wie „Vergiftet".
2. **Story Creator.** Als Notiz, wie beim NPC Creator. So steht der Zustand
   in der Kampagne und lässt sich von einer Figur aus verlinken.
3. **Export als Markdown**, für alles andere.

Die Ablage selbst: **eigene Dateien im Datenordner**, wie die Begegnungen
des Trackers — Markdown mit YAML-Kopf, damit man sie von Hand lesen und
bearbeiten kann. Eine zweite Wahrheit neben dem Story Creator soll es nicht
geben, aber ein Zustand gehört auch nicht in eine bestimmte Kampagne: er ist
Handwerkszeug, das über Kampagnen hinweg gilt.

## Offene Fragen

- ~~Der Zähler außerhalb des Kampfes.~~ **Entschieden: der Auslöser ist
  zunächst nur Text.** „Jede Stunde in großer Kälte" steht am Zustand und
  wird von der Spielleitung angewendet; eine Uhr, die außerhalb des Kampfes
  läuft, baut der Tracker erst, wenn der Rest steht. Das hält das Werkzeug
  klein und die Abhängigkeit zum Tracker gering — er muss zunächst nur
  Stufen anzeigen können, nicht mitzählen.
- **Wie eng an 5e?** Erschöpfung, Rettungswürfe und SG sind 5e-Begriffe. Ganz
  neutral zu bleiben hieße, nur Prosa zu erzeugen; ganz bei 5e zu bleiben
  schließt andere Tische aus. Vorschlag: die Tabellen sind 5e-nah, die
  Datenstruktur ist es nicht.
- **Stufen oder Stapel?** „Stackt bis fünf" kann zweierlei heißen: fünf
  verschiedene Wirkungen (wie oben), oder fünfmal dieselbe. Das Konzept oben
  nimmt Ersteres. Beides anzubieten wäre möglich, kostet aber einen Regler
  mehr.
- **Die Punktwerte selbst.** Die Liste oben ist geschätzt, nicht hergeleitet
  — „Nachteil auf alle Angriffe = 3" ist eine Meinung. Sie wird belastbarer,
  wenn wir sie gegen die Zustände aus dem Regelwerk eichen: Erschöpfung,
  Vergiftet, Gelähmt und so weiter durchrechnen und sehen, ob die Rangfolge
  herauskommt, die jeder am Tisch im Gefühl hat. Das ist dieselbe Gegenprobe
  wie beim Monster Creator, nur billiger.
- **Gehört ein Zustand einer Kampagne?** Oben steht: nein. Dagegen spricht,
  dass man dann eine wachsende Liste ohne Ordnung bekommt. Vielleicht
  Schlagworte statt Zuordnung.
