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
   denselben Weg wie ein Handeintrag: durch die Prüfung. Was danach
   passiert, ist der einzige Unterschied zwischen beiden — die KI wird
   korrigiert, der Mensch bekommt einen Hinweis. Warum, steht weiter unten.

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

### Die Regel: die KI wird korrigiert, der Mensch wird beraten

Was bei einem daneben liegenden CR passiert, hängt davon ab, **woher die
Zahlen kommen** — und nur davon:

```
von der KI        →  automatisch nachziehen, und es dazusagen
von Hand/Würfel   →  nur ein Warnhinweis mit den empfohlenen Werten
```

Das ist keine Willkür, sondern folgt daraus, wer die Entscheidung getroffen
hat. Die KI hat 137 Trefferpunkte nicht *gewollt* — sie hat eine Zahl
geraten, die ungefähr passen sollte. Sie zu korrigieren nimmt niemandem
etwas weg. Wer die 137 dagegen selbst eingetippt hat, hat sich dabei etwas
gedacht, und sie ungefragt zu ändern wäre eine Anmaßung. Da genügt der
Hinweis, was stattdessen üblich wäre.

Der Ablauf bei einer KI-Antwort:

```
Antwort lesen  →  Zahlen prüfen  →  CR daneben:
                                     Trefferpunkte und Schaden pro Runde
                                     auf die Richtwerte des Ziel-CR ziehen
                                  →  und in der Meldung sagen, was
                                     geändert wurde und um wie viel
```

Das Dazusagen ist kein Beiwerk. Stillschweigend nachzuziehen wäre bequem
und falsch: wer sieht, dass das Modell beim Schaden um vierzig Prozent
danebenlag, lernt etwas über seine Vorschläge. Und es gibt einen Knopf
„zurück zum Vorschlag der KI" — vielleicht war die Abweichung ja Absicht.

Beim Warnhinweis von Hand steht dasselbe, nur ohne Eingriff:

```
⚠ Gerechnet: CR 7, eingestellt: CR 5

  Empfohlen für CR 5:   Trefferpunkte 130–144, Schaden/Runde 33–38
  Du hast:              136 ✓                  58 ✗

  [ Schaden auf 36 setzen ]   [ so lassen ]
```

Die Prosa bleibt in beiden Fällen unangetastet. Eine Fähigkeit
umzuschreiben, weil ihre Zahlen nicht passen, ist Aufgabe der Zahlen, nicht
des Textes.

## Die Sammlung: was schon gebaut wurde

Ein Werkzeug, das nur erzeugt und nie zeigt, was es erzeugt hat, ist eine
Einbahnstraße. Nach zehn Abenden liegen dreißig Monster da, und man findet
keines wieder.

**Zwei Ansichten, ein Umschalter:**

```
Kacheln       groß, mit Symbol, Name, CR und Thema. Zum Stöbern —
              „ich brauche irgendwas Untotes um CR 4".

Liste         eine Zeile je Monster: Name · Thema · CR · XP · TP · RK.
              Zum Wiederfinden — „wie hieß der Golem nochmal".
```

Die Kacheln sind die Vorgabe. Sie sehen aus wie die Kacheln des Startmenüs,
damit die Sammlung nicht wie ein zweites Programm wirkt, und sie sind nach
CR gruppiert.

**Gesucht wird über ein Feld, nicht über drei.** Ein einziges Suchfeld, das
Name, Thema und CR gleichzeitig durchsucht:

```
„untot"        →  alles mit Thema Untot
„golem"        →  Namenstreffer
„cr 4"         →  alle mit CR 4
„cr 3-6"       →  Bereich
„untot 4"      →  beides zusammen: Untote mit CR 4
```

Drei getrennte Felder wären genauer und langsamer. Ein Feld, das Zahlen als
CR liest und Wörter als Name oder Thema, trifft in der Praxis, was gemeint
ist — und wer es genauer will, klickt die Filterleiste daneben auf.

Dazu das Übliche, weil es sonst fehlt: sortieren nach CR, Name oder Datum;
Rechtsklick für Umbenennen, Duplizieren, Löschen; und die Anzeige, wie viele
Monster gerade gefunden wurden.

## Ein vorhandenes Monster prüfen

Derselbe Code ohne Erzeuger, und deshalb fast geschenkt: einen Statblock
hineingeben und nur nachrechnen lassen.

Zwei Wege hinein:
- **Aus der Sammlung** — ein Monster öffnen und den Befund sehen. Nützlich,
  wenn sich die Richtwerte ändern oder man später klüger ist.
- **Von außen** — Zahlen eintippen oder einen Statblock als Markdown
  einwerfen. Für Monster aus Büchern, aus dem Netz, von früher.

Das ist der schnellste Weg zu einem Werkzeug, das schon etwas taugt, bevor
der Erzeuger steht: die Prüfung ist ohnehin der Kern, und sie allein
beantwortet die Frage „ist das Ding, das ich gerade gebaut habe, in Ordnung".

## Varianten: dasselbe Monster, zwei Grade höher

Am Tisch ständig gebraucht — der Räuberhauptmann, der in Kapitel drei noch
einmal auftaucht, diesmal gefährlicher.

**Die Zahlen skalieren, die Prosa bleibt.** Trefferpunkte, Schaden,
Angriffsbonus und Rettungs-SG wandern auf die Richtwerte des neuen CR;
Name, Beschreibung und Fähigkeitentexte bleiben unangetastet. Was sich an
den Zahlen einer Fähigkeit ändert (`2W8` → `3W8`), wird im Text ersetzt, der
Satz drumherum nicht.

Angeboten wird das als „Variante anlegen", nicht als „ändern": das
Ursprungsmonster bleibt stehen. Ein Räuberhauptmann CR 3 und einer CR 5 sind
zwei Einträge, und beide will man behalten.

## Der Weg in den Encounter Creator

Die Gruppenrechnung — „vier Gegner mit CR 2" gegen „ein Gegner mit CR 5" —
steht **nicht** in diesem Werkzeug. Sie gehört in den Encounter Creator, der
als Kachel `encounter` ohnehin geplant ist: dort geht es um eine Begegnung
gegen eine bestimmte Gruppe, hier um ein einzelnes Monster.

Damit das später ohne Umbau zusammenpasst, wird hier **intern vorbereitet**:

- **Die Ablage ist die Schnittstelle.** Monster liegen als Markdown mit
  YAML-Kopf im Datenordner, wie die Begegnungen des Trackers. Der Encounter
  Creator liest denselben Ordner — er braucht keinen Kanal zum Monster
  Creator, nur den Pfad. Das ist die billigste Kopplung, die es gibt, und
  sie überlebt, wenn eines der beiden Werkzeuge umgebaut wird.
- **Im YAML-Kopf steht alles, was eine Begegnungsrechnung braucht**, in
  Zahlen und nicht in Prosa: `cr`, `tp`, `rk`, `schaden_pro_runde`,
  `angriffsbonus`, `angriffe`, `legendaer`, `rolle`, `thema`. Wer den
  Statblock lesen müsste, um an den CR zu kommen, hätte schon verloren.
  Die Erfahrungspunkte stehen **nicht** dabei — warum, steht unten unter
  „Stand der Umsetzung".
- **Ein Knopf „in die Begegnung"**, wie der NPC Creator ihn zum Story
  Creator hat. Solange es den Encounter Creator nicht gibt, ist der Knopf
  nicht da — vorgesehen ist er trotzdem, und der Weg dorthin ist derselbe
  wie beim Kartenknopf der Inspirationshilfe: die Hülle reicht durch.
- **Mehrfachauswahl in der Sammlung** ist deshalb schon eingeplant: man
  schickt selten ein Monster in eine Begegnung, meistens drei.

Was hier **nicht** vorbereitet wird: die Begegnungsmathematik selbst. Sie
gehört dorthin, wo sie gebraucht wird, und hier erfunden zu werden hieße,
sie zweimal zu haben.

## Wohin ein fertiges Monster geht

- **Initiative Tracker** — der Hauptweg. Ein fertiges Monster gehört in die
  Begegnung, nicht in eine Sammelmappe.
- **Story Creator** als Notiz, für Monster mit einer Rolle in der Geschichte.
- **Markdown-Export** im üblichen Statblock-Aufbau.
- **Karteneditor**: nicht vorgesehen. Ein Monster ist kein Ort.

## Offene Fragen

- **Wie viele Fähigkeiten?** Ein Monster mit acht Sonderfähigkeiten liest am
  Tisch niemand. Eine Obergrenze nach CR wäre eine Vorgabe mit Meinung —
  vermutlich die richtige.
- **Welche Fassung?** 5e 2014 und 2024 rechnen CR unterschiedlich. Die
  CC-BY-Quelle oben ist auf dem Stand von 2024. Ein Schalter wäre möglich,
  verdoppelt aber die Tabellen und die Tests.
- **Eigene Richtwerte.** Wer nach anderen Vorgaben baut, will die Tabelle
  ersetzen können. Als Datei im Datenordner, wie die Schreibhilfe-Vorschläge?

## Stand der Umsetzung

Der obere Teil dieser Datei ist das Konzept von vorher und bleibt so stehen.
Hier steht, was davon tatsächlich gebaut ist, damit man beides
auseinanderhalten kann.

**Gebaut und geprüft** (`apps/monster`, 135 Tests plus ein Rauchtest in der
Hülle):

- `richtwerte.ts` — die CC-BY-Tabelle von CR 0 bis 30, wörtlich übernommen,
  mit Lizenzkopf in der Datei und Nennung in `NOTICE.md` und im README.
- `pruefung.ts` — der Kern: Verteidigungs-CR aus TP und RK,
  Angriffs-CR aus Schaden pro Runde und Angriffsbonus, Ergebnis der
  Mittelwert. Reine Funktion, kein Zufall, keine Dateien. `zieheNach` sagt
  getrennt, was sie *rät* und was sie *berichtigt*.
- `eichung.ts` — sieben Statblocks aus derselben CC-BY-Quelle als
  Eichdaten. Wichtige Einschränkung, siehe unten.
- `erzeuge.ts` — der Erzeuger. Ein Test fährt alle 7140 Kombinationen aus
  Grad, Rolle und Saat durch und verlangt, dass jedes erzeugte Monster die
  eigene Prüfung besteht.
- `ablage.ts` — Markdown mit YAML-Kopf im Datenordner
  (`<Datenordner>/monster/monster/`). Das ist die Schnittstelle zum
  Encounter Creator, nicht ein Kanal zwischen zwei Werkzeugen.
- `suche.ts` — ein Suchfeld für Name, Thema, Rolle und Grad, mit
  UND-Bedeutung („untot 4" = untot **und** Grad 4).
- `kiAufgaben.ts` — die KI schlägt vor, die Prüfung entscheidet. Ihre Zahlen
  werden stillschweigend auf die Richtwerte gezogen; was sie ursprünglich
  wollte, bleibt sichtbar. Ein Handeintrag wird nur gewarnt, nicht geändert.
- `attribute.ts` — die sechs Attribute, mit einer harten Regel:
  Übungsbonus plus Modifikator des Hauptattributs ergibt den Angriffsbonus.
  Welches Attribut das ist, entscheiden Art und Rolle. Alles andere an den
  Attributen ist Geschmack und wird nicht beurteilt.
- `bewegung.ts` — 30 Fuß zu Fuß, dazu klettern, schwimmen, fliegen oder
  graben, aber nur über eine Chance und höchstens zwei davon.
- `angriffe.ts` — Waffen, Reichweiten, Schadensarten und Flächen. Der
  Rundenschaden wird aufgeteilt, nicht erhöht.
- `widerstaende.ts` — Resistenzen, Immunitäten, Verwundbarkeiten, alles über
  Chancen.
- `umgebungen.ts` — sechzehn Umgebungen, jede mit den Themen, zu denen sie
  passt, und mit zwei Angaben zum Gelände: gibt es Wasser, lässt sich der
  Boden durchgraben. Die Umgebung wird zuletzt entschieden und richtet sich
  nach Thema und Bewegung.
- `platzhalter.ts` — die Zahlen in den Fähigkeitstexten. Die Tabellen sind
  für jeden Grad dieselben, die Zahlen nicht; die Texte tragen deshalb
  `{sg}`, `{schaden}`, `{kleinerSchaden}`, `{schadensart}` und `{uebung}`
  (der Übungsbonus mit Vorzeichen), gefüllt aus
  den Richtwerten. Damit bleibt die Regel des Werkzeugs gewahrt: die
  Tabellen liefern die Form, die Zahlen kommen aus der Eichung.
- Oberfläche mit Erzeugen, Prüfen von außen, Sammlung als Liste und als
  Kacheln, Variante anlegen, Markdown-Export — der Steckbrief sieht aus wie
  ein Statblock im Buch.

## Was aus dem Gebrauch dazukam: die Umgebung gehört zum Wesen

Im selben Bild stand ein Elementar mit Schwimmbewegung und „Amphibisch",
eingetragen in der **Wüste**. Jede Angabe für sich war richtig; zusammen
ergaben sie kein Wesen. Grund: die Umgebung wurde frei gezogen, unabhängig
von Thema und Bewegung.

Jetzt wird sie **zuletzt** entschieden und richtet sich nach dem, was schon
feststeht:

1. **Thema** — ein Konstrukt gehört nicht in einen Feenhain, ein Drache
   nicht in einen Zauberturm. Bewusst großzügig: ausgeschlossen wird nur,
   was am Tisch stutzig macht, nicht alles, was ungewöhnlich ist.
2. **Bewegung** — wer schwimmt, braucht Wasser; wer gräbt, braucht Boden,
   in den das geht. Fliegen bleibt ungeprüft, auch unter der Erde fliegt
   allerhand.

Aus zwölf Umgebungen sind sechzehn geworden, damit jedes Thema nach dem
Filtern noch genug Auswahl hat — dazugekommen sind Feenhain, Zauberturm,
Vulkanland und Aschewüste. Ein Test verlangt mindestens vier je Thema und
fährt 150 Monster durch, ohne einen einzigen Widerspruch zu finden.

Das Nachwürfeln der Bewegung zieht die Umgebung mit. Sonst bliebe der
Widerspruch genau an der Stelle zurück, an der man ihn gerade beheben wollte.

## Was aus dem Gebrauch dazukam: Fähigkeiten ohne Zahlen und ohne Folge

Aus einem Bild der Oberfläche, wörtlich: *„Bei Devastating Surge steht nur
‚damage' aber nicht wie viel. Und das Feature ‚Detect' ergibt gar kein Sinn.
Was soll denn ein Perception check machen? Solche leeren Features sind nur
Lückenfüller."* Dazu die Beobachtung, dass die legendären Aktionen immer
demselben Muster folgen: Bonusattacke, Rettungswurf mit Statuseffekt, oder
10 Fuß Flächenschaden.

Drei Sachen waren daran kaputt:

**Keine Zahlen.** Elf Fähigkeiten verlangten einen Rettungswurf, ohne einen
Schwierigkeitsgrad zu nennen, und mehrere machten Schaden ohne Würfel. Beides
ist am Tisch keine Fähigkeit, sondern eine Rückfrage. Die Texte tragen jetzt
Platzhalter (siehe `platzhalter.ts`), und der SG kommt aus derselben harten
Regel wie der Angriffsbonus.

**Nachtrag: Zahlen an den übrigen Stellen.** Eine zweite Durchsicht aller
62 Fähigkeiten fand dieselbe Lücke in drei weiteren Formen — ein Bonus ohne
Höhe („Parade" erhöhte die Rüstungsklasse um nichts, jetzt um `{uebung}`),
eine Bewegung ohne Weite („Ausweichender Schritt", jetzt eine halbe
Bewegungsrate), eine Beschwörung ohne Anzahl („Herbeirufen", jetzt 1d4) —
dazu zwei fehlende Befreiungs-SG und vier Ziele, die nur „in Sichtweite"
standen statt in 30 Fuß. Zwei Tests halten die Klasse fest, nicht bloß die
einzelnen Fälle: wer etwas erhöht, bewegt oder herbeiruft, muss eine Zahl
nennen, und ein Ziel außerhalb des Nahkampfs braucht eine Fußangabe.

**Eine Fähigkeit ohne Folge.** „Es macht eine Wahrnehmungsprobe." ist
gestrichen. Ein Test hält fest, dass kein Text nur aus einer Probe bestehen
darf.

**Zu wenig Auswahl.** Es gab sechs legendäre Aktionen, jetzt achtzehn, und
sieben davon fallen bewusst aus dem Dreierraster: Platz mit einem
Verbündeten tauschen, den Boden zu schwierigem Gelände machen, sich selbst
heilen, ein Ziel markieren, sich verhüllen, einen Rettungswurf gegen eine
laufende Wirkung wiederholen, einen Verbündeten anfeuern. Ein Test zählt
das nach, damit die Vielfalt nicht beim nächsten Ausbau wieder verloren
geht.

Dabei aufgefallen und mitbehoben: zwei Fähigkeiten hießen „Antreiben", und
es gab bereits ein `rettungsSg()` in `attribute.ts` — der zweite, gleich
heißende Ausdruck in `platzhalter.ts` hat die Sammelstelle der Tests still
leergeräumt, bis der Test darüber fiel.

## Was aus dem Gebrauch dazukam

Nach der ersten Runde am echten Werkzeug. Die Punkte stehen hier, weil sie
das Konzept an mehreren Stellen korrigieren:

- **Die Zahlen allein sind kein Statblock.** „Schaden pro Runde: 41" sagt
  nicht, was passiert, wenn das Monster dran ist. Jetzt steht die Waffe da,
  die Reichweite, der Trefferbonus, der Würfelausdruck und die Schadensart —
  und die Summe darunter, klein, als das, was sie ist: die Zahl, mit der die
  Prüfung rechnet.
- **Die Schadensart hängt an der Waffe, die Waffe am Wesen.** Ein Bogen macht
  Stich, eine Axt Hieb, ein Odem das, was zum Wesen passt. Eine Bestie führt
  keine Hellebarde. Das ist die Stelle, an der ein Generator glaubwürdig wird
  oder eben nicht.
- **Zusatzattribute sind kein Pflichtprogramm.** Resistenzen, Immunitäten,
  Flächenangriffe und zusätzliche Gangarten hängen alle an Chancen, und die
  meisten Monster bekommen nichts davon. Ein Bestiarium, in dem jedes Wesen
  alles hat, ist langweilig und nimmt den wenigen, bei denen es zählt, die
  Wirkung.
- **Die Fähigkeiten skalieren bis zum Schluss.** Vorher war bei drei
  Schluss, auch auf Grad 30. Jetzt sind es dort sieben, mit einem Wurf von
  plus/minus eins.
- **Legendär an/aus muss man sehen.** Vorher änderte der Schalter nur eine
  Zahl. Jetzt gibt es den Abschnitt „Legendäre Aktionen" mit eigenen
  Einträgen, und die KI darf sie nicht selbst vergeben.
- **Die KI bekommt einen freien Wunsch.** „Ein Sumpfhexer, der Ertrunkene
  ruft" sagt mehr als jede Auswahlliste. An den Zahlen ändert das nichts.

### Ein Fehler, den erst die Resistenzen sichtbar gemacht haben

Die Prüfung verglich die Spannen gegen die **rohen** Trefferpunkte, zeigte
aber die **wirksamen** an. Solange nur die Rüstungsklasse hineinspielte, war
die Verschiebung klein genug, um in der Spanne unterzugehen. Mit Resistenzen
nicht mehr: ein Konstrukt, das absichtlich weniger rohe Trefferpunkte
bekommt, weil es länger durchhält, fiel durch die eigene Prüfung — und zwar
dafür, dass es richtig gebaut war. Verglichen wird jetzt, was das Monster
aushält.

**Zwei Lücken, die bewusst offen sind:**

1. **Keine CR-XP-Tabelle.** Aus der CC-BY-Quelle sind nur sieben XP-Werte
   belegt; die übrigen 27 aus dem Gedächtnis hinzuschreiben wäre geraten,
   und geratene Zahlen in einer Datei, die „Richtwerte" heißt, sind
   schlimmer als gar keine. Deshalb steht `xp` nicht im YAML-Kopf. Der
   Encounter Creator braucht sie — vorher muss die Tabelle aus einer
   belegten Quelle nachgetragen werden.
2. **Die Eichung ist noch keine echte Eichung.** Die sieben Statblocks
   stammen aus derselben Quelle wie die Richtwerte und liegen deshalb
   bauartbedingt auf der Kurve; dass die Prüfung sie besteht, sagt wenig.
   Eine belastbare Eichung braucht Monster aus dem SRD 5.2 (CC-BY),
   quer über die Grade. Die entsprechenden Seiten waren aus der
   Entwicklungsumgebung nicht erreichbar. Bis das nachgeholt ist, gilt die
   Prüfung als plausibel, nicht als belegt.

**Was aus dem Konzept nicht umgesetzt ist:** der Knopf „in die Begegnung"
(es gibt den Encounter Creator noch nicht), der Weg in den Initiative
Tracker, und die Mehrfachauswahl in der Sammlung. Alles drei hängt am
Encounter Creator und wartet auf ihn.
