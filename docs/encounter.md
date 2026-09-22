# Konzept: Encounter Creator

Das Werkzeug hinter der Kachel `encounter`, die heute „später" sagt. Es
stellt eine Begegnung zusammen: welche Monster, wie viele, wo, und wie hart
das für diese Gruppe wird — und schiebt das Ergebnis in einem Zug in den
Initiative Tracker.

**Stand:** Konzept. Nichts davon ist gebaut.

## Wozu

Zwischen „ich hätte gern einen Kampf" und „der Kampf läuft" liegen heute
drei Handgriffe, die alle von Hand gehen. Man sucht Monster zusammen,
schätzt im Kopf, ob das die Gruppe umbringt, und tippt sie danach im Tracker
ab. Der dritte Handgriff ist der ärgerlichste: er ist reine Abschrift von
etwas, das man schon hatte.

Genau das ist der Grund, warum das Werkzeug lohnt. Ein Encounter Creator,
der die fertige Begegnung nicht in den Tracker bekommt, spart nichts.

## Der Grundsatz

**Die Monster kommen aus der Sammlung, nicht aus einer Liste im Werkzeug.**
Der Monster Creator legt jedes Monster als Markdown-Datei in seinem Ordner
ab, mit dem Grad im Kopf. Das ist genau die Zahl, die die
Schwierigkeitsrechnung braucht. Der Encounter Creator liest diesen Ordner —
keinen Kanal zwischen zwei Werkzeugen, kein zweiter Bestand.

Dass die Ablage des Monster Creators ein eigener Ordner ist statt Notizen im
Story Creator, war schon damals mit diesem Werkzeug begründet
(`apps/monster/src/main/embed.ts`). Hier wird die Begründung eingelöst.

**Eine Begegnung ist eine Vorlage, kein Spielstand.** Der Tracker liest sie
und schreibt nicht zurück. Zwei Stände, die auseinanderlaufen, sind am Tisch
schlimmer als ein Stand, der nach dem Kampf eben nicht mehr stimmt. Wer die
Begegnung ein zweites Mal spielt, fängt bewusst wieder bei der Vorlage an.

## Was hineingeht

### Die Gruppe

Ohne sie ist „schwer" eine Behauptung. Gebraucht wird das Wenigste, das
reicht: **wie viele Spielfiguren und auf welcher Stufe.** Unterschiedliche
Stufen innerhalb einer Gruppe kommen vor, also eine kurze Liste statt einer
Zahl.

Wo das steht: in den Einstellungen des Werkzeugs, über den Dialog der Hülle
(`packages/einstellungen`). Eine Gruppe wechselt selten; sie jedes Mal neu
einzutippen wäre die Sorte Reibung, an der ein Werkzeug stirbt.

Offen: ob eine Kampagne im Story Creator ihre Gruppe mitbringen kann. Wäre
schöner, setzt aber voraus, dass Spielfiguren dort als eigener Notiztyp
erkennbar sind. **Für die erste Fassung: eigene Einstellung.**

### Die Monster

Zwei Quellen, und die Reihenfolge ist Absicht:

1. **Die eigene Sammlung** aus dem Monster Creator. Das ist der Punkt, den
   du ausdrücklich wolltest, und er ist der wichtigere — wer sich ein
   Monster baut, will es auch einsetzen.
2. **Eine mitgelieferte Liste**, falls sie kommt. Dazu unten unter
   „Zu klären", denn daran hängt eine Lizenzfrage.

Gewählt wird mit Anzahl: „3× Frostwächter". Mehrere gleiche sind der
Normalfall, nicht die Ausnahme.

### Die Umgebung

**Zwei Sorten, und beide müssen vorkommen.** Das ist die Entscheidung, die
dieses Werkzeug von einer Monsterliste unterscheidet.

| Sorte | Beispiel | Wohin sie geht |
|---|---|---|
| Was man sieht | „Hohe Höhle, unten ein Wasserbecken, Hängebrücken ziehen sich hindurch." | Text zum Vorlesen, Grundlage für eine Karte |
| Was am Tisch wirkt | „Schneesturm: man sieht höchstens 30 Fuß weit." | Regel mit Zahl, als Terrain in den Tracker |

Ohne die zweite Sorte ist die Umgebung Deko. Ohne die erste ist sie eine
Tabellenzeile.

Beides ist wählbar oder gewürfelt. Die Grundlage steht schon:
`packages/umgebungen` hält sechzehn Umgebungen mit `anblick` (was man sieht)
und `regeln` (was wirkt, mit Zahl und Art). Das Paket entstand aus genau
dieser Planung; hier wird es benutzt statt ein viertes Mal gebaut.

## Die Schwierigkeitsrechnung

Der Teil, bei dem ich ehrlich sein muss.

Die Rechnung aus dem Regelwerk — Erfahrungspunkte je Grad, ein Faktor für
die Anzahl der Monster, Schwellen je Gruppenstufe — **kenne ich nicht so
belastbar, dass ich sie aus dem Kopf in Tabellen schreiben würde.** Die
Zahlen unterscheiden sich zwischen den Regelfassungen, und eine falsche
Schwelle ist schlimmer als gar keine: sie sieht aus wie eine Auskunft.

Der gangbare Weg ist derselbe wie beim Monster Creator: **eine Quelle mit
Lizenz suchen, die Zahlen von dort nehmen, und sie im Über-Dialog nennen.**
Der Monster Creator macht das bereits mit den Richtwerten je Grad (Lazy
GM's 5e Monster Builder Resource Document, CC-BY-4.0).

**Diese Frage ist inzwischen beantwortet.** Das SRD 5.2 steht unter
CC-BY-4.0, und die Zahlen dürfen mit der vorgeschriebenen Namensnennung
übernommen werden (siehe `NOTICE.md`). Sie gehören nach `packages/srd/`,
zusammen mit dem, was das Nachschlagewerk und der Magic Item Creator
brauchen — siehe `docs/nachschlagewerk.md`. Was bleibt, ist Fleißarbeit:
die Tabellen aus dem Dokument sauber herausholen und gegenlesen. **Der Bau
ist damit nicht mehr blockiert.**

Bis dahin gibt es eine zweitbeste Lösung, die ehrlich bleibt: **die Summe
der Grade gegen die Gruppenstärke stellen und das Ergebnis als Verhältnis
zeigen, nicht als Urteil.** „Grade zusammen 9 gegen 4 Figuren auf Stufe 5"
sagt weniger als „mittelschwer", behauptet aber auch nichts Falsches. Eine
Eichung an bekannten Begegnungen kann daraus später eine Skala machen — so
wie das Gewicht im Status Effect Creator entstanden ist.

**Nicht erfinden, was man nicht weiß, und es dazuschreiben.**

## Der Weg in den Initiative Tracker

Der eigentliche Zweck. Was mitwandern muss:

- **Die Monster als Teilnehmer** — Trefferpunkte, Rüstungsklasse,
  Initiative-Modifikator. Mehrere gleiche als „Wolf 1" bis „Wolf 4". Der
  Tracker hat für Gruppen gleicher Wesen schon eine Form (`koerper` je
  Teilnehmer), sie muss nur gefüllt werden.
- **Die Umgebung in ihren zwei Sorten.** Die Beschreibung als Text, die
  Gameplay-Regel als Terrain-Eintrag. `istTerrain` gibt es im Tracker
  bereits, samt Ereignissen je Runde — ein Schneesturm, der jede Runde
  wirkt, ist genau der Fall, für den das gebaut wurde.
- **Ein Verweis zurück auf die gespeicherte Begegnung**, damit ein zweiter
  Durchlauf nicht bei null anfängt.

Zwei Dinge, die dabei geklärt sein müssen, und beide sind es:

**Wenn im Tracker noch ein Kampf läuft**, kommt dieselbe Rückfrage wie bei
„Neue Begegnung". Die steht schon (`pruefeVerlust` in
`apps/initiative/src/shared/neuebegegnung.ts`) und unterscheidet bereits
zwischen „ein Kampf läuft" und „es gibt Ungespeichertes". Der Weg von außen
muss dieselbe Frage stellen, nicht eine zweite eigene.

**Zurückgeschrieben wird nicht.** Siehe Grundsatz oben.

## Und der Karteneditor?

Die Beschreibung der Umgebung ist die Grundlage für eine Karte, und den Weg
dorthin gibt es schon: die Inspirationshilfe stößt „Karte anlegen" an, die
Hülle holt den Karteneditor nach vorn und stellt den Namen zu
(`oeffneKarteImEditor`). Derselbe Weg, dieselbe Brücke.

Für die erste Fassung ist das **nicht** nötig. Es gehört in die Liste, weil
es billig wird, sobald der Rest steht — nicht, weil es den Anfang trägt.

## Was das Werkzeug ablegt

Eine Begegnung als Markdown-Datei in einem eigenen Ordner, wie beim Monster
Creator und beim Status Effect Creator: Kopfzahlen oben, lesbarer Leib
darunter. Eine Sammlung mit Kacheln und Suche, dieselbe Handhabung wie
überall — wer sie einmal gelernt hat, soll sie nicht dreimal lernen.

## Zu klären

- ~~**Woher die Schwierigkeitszahlen kommen dürfen.**~~ Geklärt: SRD 5.2
  unter CC-BY-4.0, mit wörtlicher Namensnennung. Siehe oben und `NOTICE.md`.
- **Ob eine mitgelieferte Monsterliste dazukommt.** Lizenzrechtlich jetzt
  ebenfalls erlaubt; offen ist nur noch, ob sie den Aufwand wert ist. Ohne
  sie ist das Werkzeug nur für den brauchbar, der schon Monster gebaut hat
  — das ist eine echte Einschränkung, aber keine, die den Anfang
  verhindert.
- **Ob die Gruppe aus einer Kampagne kommen kann.** Siehe oben; erste
  Fassung ohne.
- **Was bei einem Monster passiert, das nach dem Speichern der Begegnung
  geändert wurde.** Die Vorlage hält einen Verweis; beim Öffnen wird neu
  gelesen. Damit ändert sich die Begegnung mit dem Monster — das ist
  gewollt. Gelöschte Monster müssen aber sichtbar fehlen und dürfen nicht
  stillschweigend verschwinden.

## Ein möglicher Zuschnitt

1. **Gerüst und Einbettung.** Die Kachel wird echt, das Werkzeug lädt, eine
   leere Begegnung lässt sich anlegen und speichern.
2. **Monster aus der Sammlung.** Lesen, suchen, mit Anzahl wählen. Ohne
   Schwierigkeitsrechnung — die Liste allein ist schon nützlich.
3. **Umgebung.** Aus `packages/umgebungen`, wählbar oder gewürfelt, beide
   Sorten sichtbar.
4. **In den Tracker.** Teilnehmer und Terrain in einem Zug, mit der
   Rückfrage bei laufendem Kampf.
5. **Schwierigkeit.** Erst das Verhältnis, später die Skala mit den Zahlen
   aus `packages/srd/`.

Stufe 4 ist der Punkt, ab dem sich das Werkzeug lohnt. Stufe 5 macht es gut
und wartet auf nichts mehr — nur darauf, dass jemand die Tabellen erfasst.
