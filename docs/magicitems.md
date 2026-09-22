# Konzept: Magic Item Creator

Ein weiteres Werkzeug in derselben Form wie der Monster Creator und der
Status Effect Creator: magische Gegenstände erzeugen, in einer Sammlung
ablegen, nach Foundry exportieren. Bezug ist D&D 2024, wie bei den anderen.

**Stand:** Konzept. Nichts davon ist gebaut.

## Warum es hierher passt

Die drei Teile, die so ein Werkzeug braucht, stehen schon:

- **Tabellen mit zweisprachigen Paaren** — dasselbe Muster wie in
  `apps/monster/src/shared/tabellen.ts`.
- **Eine Ablage mit Kacheln und Suche** — im Monster Creator und im Status
  Effect Creator baugleich, bis hin zur Suchleiste.
- **Platzhalter für Zahlen im Text** — `platzhalter.ts` füllt schon Würfel
  und Schwierigkeitsgrade in Fähigkeitstexte ein.
- **Der Foundry-Export** — `packages/foundry` steht seit #127. Ein
  Gegenstand wird dort ein Item vom Typ `equipment` oder `weapon`; beide
  Formen sind in den vorhandenen Belegen zu sehen.

Der Gegenstand ist die kleinste der drei Sorten: kein Statblock, keine
Stufen. Das Neue daran ist allein die Punkteskala.

## Die Punkteskala — und was ich dazu nicht weiß

Hier muss ich deutlich sein, bevor irgendetwas gebaut wird:

> **Eine offizielle Formel, die Seltenheit in Punkte umrechnet, kenne ich
> nicht.**

Das Regelwerk ordnet Gegenstände Seltenheitsstufen zu (Common, Uncommon,
Rare, Very Rare, Legendary) und nennt Preisspannen. Es gibt aber keine
Rechnung, aus der sich „dieser Effekt kostet 4 Punkte" ableiten ließe.
Schriebe ich hier eine Tabelle hin, wäre sie erfunden — und eine erfundene
Tabelle, die aussieht wie eine Regel, ist schlechter als keine.

**Der gangbare Weg ist die Eichung, nicht die Ableitung.** Genau so ist das
Gewicht im Status Effect Creator entstanden:

1. Eine eigene Skala aufstellen.
2. Vorhandenen, bekannten Gegenständen Punkte zuweisen.
3. Prüfen, ob die Reihenfolge stimmt — ein Common muss unter einem Very Rare
   landen, und zwar jedes Mal.
4. Wenn nicht: die Skala ändern, nicht das Ergebnis.

Das ist eine Eichung, und sie gehört genauso benannt — im Code, in der
Oberfläche und im Über-Dialog. „Unsere Einschätzung, an bekannten
Gegenständen geprüft" ist eine ehrliche Aussage. „Punktewert nach den
Regeln" wäre keine.

## Was die Punkte zählen

Eine Zahl ohne Achsen ist bedeutungslos. Vorschlag für die Achsen, an denen
ein Gegenstand gemessen wird:

| Achse | Warum sie zählt |
|---|---|
| **Stärke der Wirkung** | +1 auf Angriff ist etwas anderes als +3 |
| **Wie oft** | Dauernd, x-mal am Tag, einmal und verbraucht |
| **Worauf sie wirkt** | Nur der Träger, ein Ziel, ein Bereich |
| **Wie breit sie greift** | Gegen alles, oder nur gegen Untote |

Zwei Dinge, die von Anfang an vorgesehen sein müssen, sonst werden sie
später angeflanscht:

- **Verzehrbares.** Ein Trank ist kein dauerhafter Gegenstand. Er wiegt
  weniger, weil er einmal wirkt — das ist keine Ausnahme, sondern eine
  Stellung auf der Achse „wie oft".
- **Fluch.** Ein Fluch **zieht Punkte ab**, statt sie hinzuzufügen. Damit
  ist die Skala nicht nach unten bei null begrenzt, und ein verfluchter
  Gegenstand kann leichter wiegen als sein ungefluchtes Gegenstück. Genau
  dieselbe Form hat der Status Effect Creator schon: ein Buff trägt dort ein
  negatives Gewicht.

## Attunement

**Ob ein Gegenstand Einstimmung braucht, ist im Spiel der stärkste Hebel
gegen zu viel auf einmal.** Eine Figur kann nur drei Gegenstände eingestimmt
tragen; was Einstimmung verlangt, konkurriert also mit allem anderen
Starken, das sie hat.

Deshalb gehört Attunement in die Rechnung und nicht nur als Kästchen
daneben. Ein starker Gegenstand ohne Einstimmung wiegt schwerer als
derselbe mit — er kostet nichts, was die Figur sonst bräuchte.

## Zu klären

- **Woher die Vergleichsgegenstände kommen dürfen.** Dieselbe Lizenzfrage
  wie bei den Richtwerten im Monster Creator. Was aus einer CC-BY-Quelle
  stammt, darf hinein, mit Namensnennung im Über-Dialog. Ohne
  Vergleichsgegenstände gibt es keine Eichung, und ohne Eichung ist die
  Skala eine Behauptung — **diese Frage blockiert den interessanten Teil des
  Werkzeugs, nicht aber den Rest.**
- **Welche Art Gegenstand.** Waffe, Rüstung, Wundersames, Trank, Schriftrolle.
  Davon hängt ab, was überhaupt einstellbar ist — eine Waffe hat einen
  Schadensbonus, ein Trank nicht.
- **Wie der Foundry-Export aussieht.** `equipment` und `weapon` sind beide
  belegt. Welche Form wann, und ob ein Trank `consumable` wird, sollte an
  einem echten Export geprüft werden, bevor es jemand rät. **Wenn du einen
  magischen Gegenstand aus deiner Welt exportierst und schickst, ist das
  geklärt** — so wie bei #127.

## Ein möglicher Zuschnitt

1. **Tabellen und Erzeuger.** Arten, Wirkungen, Namen. Ohne Punkte.
2. **Ablage und Oberfläche.** Kacheln, Suche, Bearbeiten — baugleich zu den
   beiden vorhandenen Werkzeugen.
3. **Foundry-Export.** Sobald die Form an einem echten Beispiel geprüft ist.
4. **Die Punkteskala und ihre Eichung.** Der interessante Teil, und der,
   der auf die Lizenzfrage wartet.

Die Stufen 1 bis 3 ergeben schon ein brauchbares Werkzeug: „würfle mir einen
magischen Gegenstand und leg ihn ab" ist für sich nützlich. Stufe 4 macht
daraus ein Werkzeug, das auch sagt, ob der Gegenstand zur Gruppe passt.
