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
- **Wie eine schlichte magische Waffe aussieht.** Alle Waffenbelege sind
  Verzauberungen, die auf eine andere Waffe gelegt werden; keiner ist ein
  fertiger magischer Langschwert-Gegenstand mit eigenem Grundschaden. Ob so
  einer `system.type.baseItem` und `system.damage.base` füllt, ist damit
  nicht belegt. Für die Schriftrolle gilt dasselbe.

## Was acht echte Exporte geklärt haben

Acht Gegenstände aus einer laufenden Welt (Foundry 14.368, `dnd5e` 5.3.3 —
dieselben Versionen wie bei den Monster- und Zustandsbelegen, also kein
Versatz): Amulet of Health, Arrow-Catching Shield, Rod of Resurrection,
Flame Tongue, Weapon +1/+2/+3, Ammunition of Slaying, Potion of Healing und
Potion of Giant Strength. Ihr Feldgerüst liegt unter
`packages/foundry/tests/belege/item-*.json` — nur Schlüssel und Typen, ohne
einen einzigen Inhalt, wie schon bei #127. Erzeugt mit
`packages/foundry/scripts/geruest.mjs`.

**Die Form.** Ein Gegenstand ist ein `Item` ohne `_id` auf oberster Ebene —
dieselbe Eigenheit wie beim Zustand. Der Typ steht oben, die Sorte darunter
noch einmal genauer in `system.type.value`:

| `type` | `system.type.value` | belegt an |
|---|---|---|
| `equipment` | `wondrous` | Amulett |
| `equipment` | `shield` | Schild |
| `equipment` | `rod` | Stab |
| `weapon` | (leer) | Flammenzunge, Waffe +1/+2/+3 |
| `consumable` | `potion` | beide Tränke |
| `consumable` | `ammo` | Munition |

Ein Trank ist also `consumable`, nicht `equipment` — das war die offene
Frage. Er trägt `system.uses: { max: "1", autoDestroy: true }`, verbraucht
sich also selbst.

**Die Felder, auf die es ankommt:**

| Feld | Was drinsteht |
|---|---|
| `system.rarity` | `common`, `uncommon`, `rare`, `veryRare`, `legendary` — alle fünf belegt, Very Rare in genau dieser Schreibweise |
| `system.attunement` | `required`, dazu `system.attuned` als eigener Schalter |
| `system.price` | `{ value, denomination: "gp" }` |
| `system.properties` | `["mgc"]`, der Stab zusätzlich `"foc"` |
| `system.source` | `{ rules: "2024", license: "CC-BY-4.0", revision, book }` |
| `system.uses` | Ladungen: `max`, `spent`, `recovery: [{ period: "dawn", … }]` |

**Wo die Wirkung steht, ist zweigeteilt** — und das ist die eigentliche
Erkenntnis für den Export:

- **Was dauernd wirkt**, steht in `effects[].system.changes[]`: ein
  Schlüssel, ein Wert und eine Art. Das Amulett schreibt
  `system.abilities.con.value` mit der Art `upgrade` auf 19, das Schild
  `system.attributes.ac.bonus` mit `add` auf 2. `transfer: true` heißt, dass
  es auf den Träger übergeht.
- **Was man benutzt**, steht in `system.activities`, unter einer eigenen
  16-stelligen Kennung je Tätigkeit. Fünf Arten kommen vor: `utility` (die
  Reaktion des Schilds), `cast` (der Stab wirkt einen Zauber über dessen
  UUID und verbraucht Ladungen), `enchant` (die Flammenzunge verzaubert die
  Waffe, in der sie steckt), `heal` (der Trank, mit
  `healing: { number, denomination, types: ["healing"], bonus }`) und `save`
  (die Munition, mit `damage.parts[]`, `onSave: "half"`, `save.ability` und
  `save.dc.formula`).

**Ein Bonus ist ein eigenes Feld, keine Schadenszeile.** Die Waffe +1/+2/+3
setzt `system.magicalBonus` per `upgrade` auf 1, 2 oder 3 — und gleich
daneben `system.rarity` und `system.price.value`. Das Grund-Item selbst
lässt `rarity` leer; die Seltenheit entsteht erst mit der gewählten Stufe.
Wer im Werkzeug „+1-Waffe" anbietet, schreibt also `magicalBonus` und nicht
eine erfundene Schadensformel.

Für Stufe 3 heißt das: ein erzeugter Gegenstand mit einem dauerhaften
Zahlenbonus lässt sich sauber als `effects[].system.changes` schreiben.
Alles, was aktiv benutzt wird, braucht eine Tätigkeit — und die ist deutlich
mehr Arbeit. Ein erster Export sollte sich auf das Dauerhafte beschränken
und den Rest als Text in der Beschreibung lassen, statt eine halbe Tätigkeit
zu bauen, die in Foundry dann doch nicht klickt.

**Der Preis hängt an der Seltenheit, nicht an der Wirkung.** Über alle
Belege hinweg ergibt sich eine glatte Staffel:

| Seltenheit | Preis | woran abgelesen |
|---|---|---|
| Common | 50 gp | Potion of Healing |
| Uncommon | 400 gp | Waffe +1 |
| Rare | 4000 gp | Amulett, Schild, Waffe +2 |
| Very Rare | 40000 gp | Waffe +3 |
| Legendary | 200000 gp | Rod of Resurrection |

Die Waffe +1/+2/+3 zeigt es am deutlichsten: **derselbe Gegenstand**, drei
Stufen, und der Preis springt allein mit der Seltenheit. Das ist ein
starkes Indiz dafür, dass die Rechnung, die ich oben nicht kenne, auch gar
nicht existiert — Seltenheit ist die Eingabe, der Preis die Ausgabe, und
dazwischen steht eine Tabelle, keine Formel.

Für die Punkteskala heißt das: **sie muss auf die Seltenheit zielen, nicht
auf den Preis.** Der Preis fällt danach aus der Tabelle ab. Abgelesen habe
ich das aus diesen acht Exporten, nicht aus dem Regelwerk — dass die Staffel
dort genauso steht, vermute ich, belegen kann ich es hier nicht.

**Zur Lizenzfrage.** Alle vier tragen `system.source.license: "CC-BY-4.0"`
und stammen laut `_stats.compendiumSource` aus dem Kompendium des
`dnd5e`-Systems. Das ist die Angabe des Systems über sich selbst, kein
Rechtsgutachten — aber es ist ein handfester Anhaltspunkt dafür, dass diese
Gegenstände als Eichpunkte in Frage kommen, mit Namensnennung im
Über-Dialog. Die Frage ist damit nicht beantwortet, aber sie ist enger
geworden.

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
