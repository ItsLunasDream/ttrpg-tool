# Nachschlagewerk (Konzept)

Die Regeln offline dabei haben, in derselben Suche wie die eigenen Sachen.

**Stand:** Konzept. Nichts davon ist gebaut.

## Wofür es da ist — und wofür nicht

Gute Nachschlagewerke zum SRD gibt es im Netz reichlich, und sie sind besser
gepflegt, als dieses es je sein wird. Der Mehrwert hier ist genau einer:

> **Offline, und in derselben Suche wie die eigenen Monster, Zustände und
> Begegnungen.**

Das ist am Tisch ohne WLAN etwas wert, und es ist der einzige Grund. Wer das
nicht braucht, braucht diese Anwendung nicht — das gehört so gesagt, bevor
jemand anfängt, mehrere hundert Seiten zu erfassen.

Der zweite Nutzen ist nach innen gerichtet: dieselben Daten tragen die
Eichung des Magic Item Creators (`docs/magicitems.md`) und die
Schwierigkeitszahlen des Encounter Creators (`docs/encounter.md`). Das
Nachschlagewerk ist die sichtbare Seite eines Bestands, den es ohnehin
geben muss.

## Der Regeltext bleibt englisch

**Entschieden, und zwar gegen die Linie des übrigen Projekts.** Alles hier
ist zweisprachig, Paar für Paar. Das SRD 5.2 gibt es nur auf Englisch.

Mehrere hundert Seiten Regeltext zu übersetzen ist keine Nebenarbeit, und
maschinell übersetzt wäre er genau dort falsch, wo es weh tut: bei Zahlen,
Bedingungen, Wirkungsdauern und Reichweiten. Ein Zustand, dessen deutsche
Fassung „bis zum Ende deines nächsten Zuges" statt „bis zum Beginn" sagt,
ist schlimmer als gar keine deutsche Fassung, weil man ihm glaubt.

Also:

- **Die Oberfläche** ist zweisprachig wie überall — Knöpfe, Überschriften,
  Kategorien, Suchfeld.
- **Der Regeltext** steht englisch da, unübersetzt, und ist als solcher
  erkennbar (eigene Schrift oder eine Marke an der Ecke, nicht bloß
  stillschweigend).

Wer später einzelne Teile übersetzt — die fünfzehn Zustände etwa, die kurz
sind und ständig gebraucht werden —, trägt die Übersetzung als *zusätzliches*
Feld nach, nicht als Ersatz. Das Englische bleibt das Maßgebliche.

## Was hinein soll, und was nicht

Nicht das ganze SRD. Das Dokument hat über 350 Seiten, und der größte Teil
davon wird am Tisch nie nachgeschlagen. Was man mitten im Spiel sucht, ist
ein schmaler Ausschnitt:

| Drin | Warum |
|---|---|
| **Zustände** | Das Meistgesuchte überhaupt, und kurz |
| **Regel-Glossar** | „Was heißt nochmal Cover?" — genau dafür |
| **Zauber** | Lang, aber ständig gebraucht |
| **Magische Gegenstände** | Trägt zugleich die Eichung für den Magic Item Creator |
| **Ausrüstung** | Waffeneigenschaften, Reichweiten, Preise |

| Draußen | Warum |
|---|---|
| **Klassen, Talente, Herkünfte** | Schlägt man bei der Erschaffung nach, nicht im Kampf — und dafür hat man Zeit und ein Browserfenster |
| **Monster** | Der Monster Creator ist das Werkzeug dafür. Eine mitgelieferte Monsterliste wäre eine eigene Entscheidung, siehe unten |

Das ist grob ein Drittel des Dokuments und der Großteil des Nutzens.

## Wo die Daten liegen

**`packages/srd/`, und zwar von Anfang an.**

Das ist die eine Entscheidung, die jetzt fällt und später teuer wäre. Drei
Werkzeuge brauchen denselben Bestand:

- das Nachschlagewerk den Text,
- der Magic Item Creator die Gegenstände als Eichpunkte,
- der Encounter Creator die Schwierigkeitszahlen.

Läge er in der Anwendung, die ihn zuerst braucht, hätten die anderen beiden
entweder eine Kopie oder eine Abhängigkeit auf eine Anwendung — und
Anwendungen hängen hier nicht voneinander ab, das ist Konvention 7.

Das Paket ist plattformfrei wie alle unter `packages/`: nur Daten und reine
Funktionen. Die Form ist Markdown im Text und getippte Tabellen für alles,
was gerechnet wird — dieselbe Teilung wie im Monster Creator zwischen
`richtwerte.ts` (Zahlen) und den Fähigkeitstexten.

## Wie es an die Sammlung andockt

Nichts Neues zu bauen. Das Nachschlagewerk beantwortet die zwei Sätze aus
`packages/eintraege`:

    „Gib mir deine Einträge."
    „Zeig mir diesen Eintrag."

Damit taucht es in Strg+K auf, ohne dass die Hülle etwas über es lernt.

**Das ist zugleich das beste Argument für die Anwendung.** Die Suche über
alles wird erst dann richtig etwas wert, wenn „poisoned" den offiziellen
Zustand *und* den eigenen findet, den man vor drei Monaten gebaut hat. Heute
sucht sie nur im Selbstgebauten.

Zwei weitere Kleinigkeiten:

- **Rolle `alle`, nicht `leitung`.** Ein Nachschlagewerk brauchen Spielende
  genauso, und die Kachelseite gruppiert danach (#134).
- **Kein Schreiben.** Das Werkzeug legt nichts ab und ändert nichts. Damit
  braucht es keine Ablage, keinen Sicherungspfad und kein `flush` mit Inhalt
  — es ist die einfachste Anwendung der Sammlung.

## Abgrenzung zum Status Effect Creator

Sie überschneiden sich nicht, sie ergänzen sich:

- Der **Status Effect Creator** erzeugt *eigene* Zustände.
- Das **Nachschlagewerk** hält die *offiziellen*.

Dass in der Suche beide nebeneinander stehen, ist der Gewinn und nicht die
Doppelung: „Kälte" findet die offizielle Regel und die drei eigenen
Zustände, die man dazu gebaut hat.

## Namensnennung

Wörtlich vorgeschrieben, und die Bedingung, unter der das Material überhaupt
benutzt werden darf:

> This work includes material from the System Reference Document 5.2
> ("SRD 5.2") by Wizards of the Coast LLC, available at
> https://www.dndbeyond.com/srd.

Dazu ausdrücklich **keine weitere Nennung** von Wizards — keine Logos, keine
Marken, kein „kompatibel mit". Steht in `NOTICE.md` und gehört genauso in
den Über-Dialog.

Für #125 (der Name der Sammlung nach außen) folgt daraus eine Schranke: der
Name darf keine fremde Marke tragen.

## Zu klären

- **Woher der Text kommt.** Das SRD liegt als PDF vor. Daraus sauberes
  Markdown zu machen ist die eigentliche Arbeit dieses Werkzeugs — und es ist
  Fleißarbeit mit Korrekturlesen, kein Programmierproblem. Ob es eine
  brauchbare maschinenlesbare Fassung unter derselben Lizenz gibt, ist vor
  dem Anfangen zu prüfen; von Hand abzutippen wäre die schlechteste aller
  Möglichkeiten.
- **Ob Monster dazukommen.** Der Encounter Creator hätte gern eine Liste
  bekannter Monster zum Vergleich. Das wäre derselbe Bestand, aber deutlich
  mehr Text. Eigene Entscheidung, nicht nebenbei.
- **Wie die Suche im Regeltext arbeitet.** `packages/eintraege` sucht in
  Name, Art und Stichworten, ausdrücklich nicht im Volltext. Für ein
  Nachschlagewerk ist das womöglich zu wenig — wer „difficult terrain" sucht,
  meint die Stelle im Text. Eine Volltextsuche gehört dann in dieses Werkzeug
  und nicht in das gemeinsame Paket.

## Ein möglicher Zuschnitt

1. **`packages/srd/` mit den Zuständen und dem Regel-Glossar.** Der kürzeste
   Teil, der ständig gebraucht wird, und er trägt sofort etwas: die Suche
   findet ab da offizielle Zustände.
2. **Oberfläche und Einbettung.** Liste, Text, Suchfeld. Baugleich zu den
   vorhandenen Werkzeugen, nur ohne Bearbeiten.
3. **Magische Gegenstände.** Damit steht zugleich die Eichung für
   `docs/magicitems.md`.
4. **Zauber und Ausrüstung.** Der lange Teil, und der, den man auch erstmal
   weglassen kann.

Stufe 1 und 2 zusammen ergeben schon ein Werkzeug, das man am Tisch aufmacht.
