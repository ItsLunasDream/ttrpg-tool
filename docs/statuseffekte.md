# Konzept: Status Effect Creator

Ein siebtes Werkzeug für die Sammlung. Es baut eigene Zustände — „Freezing",
„Sandblind", „Marked by the Hunt" — mit Regeltext, Stufen und, wenn man
will, einer Anbindung an die Umgebung, die sie von selbst auslöst.

Dies war ein Konzept, kein Plan zum Abarbeiten. **Gebaut ist es
inzwischen** — was davon umgesetzt wurde und was nicht, steht unten unter
„Stand der Umsetzung". Der Text darüber bleibt unverändert stehen, damit man
Plan und Ergebnis vergleichen kann.

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

## Pakete: fünf Zustände, die zusammengehören

Ein einzelner Zustand ist selten das, was man braucht. Wer einen
Arktis-Abschnitt vorbereitet, braucht Kälte, Schneeblindheit, Erschöpfung
durch Stapfen und den Hunger dazu — vier Zustände, die dieselbe Sprache
sprechen sollen.

**Ein Paket ist ein Wurf über mehrere Zustände hinweg**, mit gemeinsamem
Thema und abgestimmter Härte:

```
Paket „Der lange Winter"        Thema: Kälte, Härte: ernst

  Freezing          5 Stufen   Umgebung, jede Stunde
  Snowblind         3 Stufen   Umgebung, nach Stunden im Schnee
  Frostbite         3 Stufen   Folge von Freezing ab Stufe 3
  Hollow Hunger     4 Stufen   Zeit, je Tag ohne warme Mahlzeit
```

Der Gewinn liegt nicht im Sparen von Klicks, sondern in der **Abstimmung**:
Die Wirkungen werden über das ganze Paket verteilt, statt vier Mal
unabhängig gezogen — so greift nicht dreimal derselbe Nachteil an, und die
Zustände fühlen sich wie ein Regelwerk an und nicht wie vier Zufälle. Dass
einer aus dem anderen folgt („Frostbite ab Freezing 3"), ist dabei ein
eigenes Feld: **Folgezustand**.

Fällt weitgehend nebenbei ab, sobald der einzelne Zustand steht — das
Verteilen ist derselbe Erzeuger mit einem gemeinsamen Vorrat statt sechs
Einzelwürfen.

## Die Eichung: das Gewicht braucht einen Maßstab

Oben steht ein Punktesystem, dessen Werte geschätzt sind. Geschätzte Werte
sind ein Anfang, keine Grundlage. Deshalb gehört zum Werkzeug ein Schritt,
der sie prüfbar macht: **die Zustände aus dem Regelwerk einmal einlesen und
durchrechnen.**

```
Erschöpfung 1   →  Gewicht  2      Nachteil auf Fertigkeitswürfe
Erschöpfung 3   →  Gewicht  7
Erschöpfung 5   →  Gewicht 14
Vergiftet       →  Gewicht  4
Gelähmt         →  Gewicht 12
Bewusstlos      →  Gewicht 16
```

Zwei Dinge fallen dabei ab, und beide sind mehr wert als die Zahlen selbst:

1. **Ein Maßstab, den jeder kennt.** „Wiegt 14" sagt niemandem etwas. „Wiegt
   so viel wie fünf Stufen Erschöpfung" sagt jedem alles.
2. **Eine Gegenprobe für die Punktwerte.** Kommt eine Rangfolge heraus, die
   jeder am Tisch im Gefühl hat — gelähmt ist schlimmer als vergiftet —,
   taugen die Werte. Kommt etwas anderes heraus, taugen sie nicht, und das
   merkt man vorher statt nachher.

Die Zustände des SRD sind frei verwendbar (CC-BY), die Werte dürfen also ins
Repository. Sie stehen dort als Eichdaten und als Test, nicht als Inhalt,
den das Werkzeug anbietet.

## Die Karte zum Vorlesen

Ein Zustand am Tisch hat zwei Leser mit verschiedenen Bedürfnissen: die
Spielleitung will die Regel, die Gruppe will wissen, was ihre Figur spürt.

Deshalb eine **Karte** je Zustand — eine halbe Seite, zum Ausdrucken oder
zum Hinhalten:

```
Vorderseite    Name, Symbol, der Kurzsatz, die aktuelle Stufe groß.
               Was die Figur merkt. Keine Zahlen.

Rückseite      Die Stufen als Liste, Verschlimmerung, Linderung.
               Für die Spielleitung.
```

Technisch ist das derselbe Weg wie der PDF-Export des Story Creators
(`printToPDF` im Hauptprozess), nur mit einem anderen Stylesheet — also
wenig neue Mechanik. Mehrere Karten kommen auf einen Bogen, damit ein
Ausdruck sich lohnt.

Wer keinen Drucker hat, öffnet dieselbe Karte groß auf dem Schirm; das ist
dasselbe Bild ohne Papier.

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
- **Die Punktwerte selbst** bleiben eine Meinung, bis die Eichung (siehe
  oben) sie bestätigt. Offen ist dabei, was passiert, wenn sie es nicht tut:
  Werte nachziehen, bis die Rangfolge stimmt, ist naheliegend — birgt aber
  die Gefahr, sie so lange zu biegen, bis sie nur noch die Eichdaten
  erklären und sonst nichts.
- **Gehört ein Zustand einer Kampagne?** Oben steht: nein. Dagegen spricht,
  dass man dann eine wachsende Liste ohne Ordnung bekommt. Vielleicht
  Schlagworte statt Zuordnung.

## Stand der Umsetzung

Das Werkzeug liegt in `apps/zustaende` und hat 86 Tests plus einen Rauchtest
in der Hülle.

**Gebaut:**

- `wirkungen.ts` — 40 Bausteine nach Schwere sortiert, jeder mit Spur,
  Richtung und Punktwert. Eine Stufe ist eine Wirkung aus dieser Liste;
  genau deshalb kommen die Tabellen ohne KI aus und genau deshalb lässt sich
  ein Zustand überhaupt wiegen.
- `gewicht.ts` — die Rechnung samt Kurve über die Stufen, und die Ansage
  dazu: sie misst nicht, ob ein Zustand für eine Kampagne zu hart ist.
- `eichung.ts` — die bekannten Zustände, in unsere eigenen Bausteine
  zerlegt. Geprüft wird die Rangfolge, nicht die Punktzahl.
- `stimmigkeit.ts` — siehe unten, das kam erst aus dem Gebrauch dazu.
- `erzeuge.ts`, `tabellen.ts` — sieben Arten, sechs Themen, vier Härten,
  Namensteile, Bilder und Satzmasken.
- `paket.ts` — mehrere Zustände in einem Wurf, mit verteilten Wirkungen.
- `karte.ts` — Vorder- und Rückseite als HTML. Dasselbe HTML geht groß auf
  den Schirm und durch `printToPDF` aufs Papier; zwei Wege zu demselben Blatt
  wären zwei Blätter, die irgendwann auseinanderlaufen.
- Ablage als Markdown mit YAML-Kopf, Sammlung mit Suche, KI-Anbindung,
  Export in den Story Creator, Einbau in die Hülle.

**Was aus dem Gebrauch dazukam: die Zeitskala**

Im Konzept steht sie nicht, und sie fehlte prompt. Ein Beispiel aus der
ersten Fassung:

```
Dauer:     bis zu deinem nächsten Zug
Besser:    eine Stunde in trockener Kleidung senkt ihn um 1
```

Beides für sich richtig, zusammen Unsinn. Seither trägt alles einen Takt —
`kampf` (Runden und Züge), `kurz` (Stunden), `lang` (Tage und Rasten) —, und
`stimmigkeit.ts` prüft, dass die Teile zueinander passen. Der Erzeuger wählt
die Dauer zuerst und richtet Linderung und Verschlimmerung danach aus; eine
Prüfung, die nur Fehler meldet, die das Werkzeug selbst gebaut hat, wäre eine
Ausrede.

Im selben Beispiel steckte ein zweiter Fehler: der Auslöser eines Fluchs
klebte an einem Ort aus der Umgebung („jedes Mal, wenn der Name auf dem
Gletscher genannt wird"). Ein Ort steht jetzt nur noch an Zuständen, die aus
der Umgebung kommen.

**Was von den Punktwerten zu halten ist**

Sie sind geschätzt, und das bleibt so, bis jemand die Eichung gegenliest. Was
die Eichung prüft, ist die **Rangfolge** — gelähmt schwerer als vergiftet,
bewusstlos am schwersten —, nicht die Höhe der Zahlen. Zwei Fehler hat sie
dabei schon gefunden:

- „handlungsunfähig" wog weniger als „blind". Wer blind ist, kämpft
  schlecht; wer handlungsunfähig ist, kämpft gar nicht.
- Meine eigene Rangfolge war an einer Stelle eine Behauptung: „blind" und
  „festgehalten" lassen sich nicht sinnvoll ordnen. Sie stehen jetzt auf
  demselben Rang, damit die Eichung nicht über eine Meinung fällt.

**Wichtige Einschränkung:** die Zerlegung der bekannten Zustände stammt aus
dem Gedächtnis der Regelmechanik, nicht aus einer nachgeschlagenen Quelle.
Sie ist ein Plausibilitätsmaßstab und kein Beleg. Wer das Werkzeug ernst
nimmt, sollte sie einmal gegen das SRD gegenlesen. Dasselbe gilt für die
Eichung des Monster Creators, und dort steht es ebenso dabei.

**Nicht umgesetzt:**

- **Der Weg in den Initiative Tracker.** Vorbereitet ist er: Zeichen, Farbe
  und Stufenzahl stehen im YAML-Kopf, und der Tracker liest denselben Ordner.
  Was fehlt, ist die Seite im Tracker, die Stufen anzeigen kann.
- **Der Folgezustand** („Frostbite ab Freezing 3") als eigenes Feld. Im
  Paket stehen die Zustände nebeneinander, nicht auseinander folgend.
- **Ein Zähler außerhalb des Kampfes.** Wie im Konzept entschieden: der
  Auslöser bleibt Text, und die Spielleitung wendet ihn an.
