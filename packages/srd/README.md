# packages/srd

Alles, was aus dem Systemreferenzdokument 5.2.1 kommt, an einer Stelle —
zweisprachig, plattformfrei, ohne Abhängigkeiten.

## Was hier liegt

| Datei | Inhalt |
| --- | --- |
| `src/namensnennung.ts` | Die wörtlich vorgeschriebene Namensnennung, englisch und deutsch |
| `src/zustaende.ts` | Die fünfzehn Zustände, wörtlich in beiden Sprachen (**erzeugt**) |
| `src/erfahrung.ts` | EP je Grad, EP-Budget je Charakter, Übungsbonus, und die Einordnung einer Begegnung |
| `quelle/` | Die beiden Sprachfassungen des Dokuments, aus denen alles stammt |

## Warum die PDFs mitliegen

Damit sich jede Zahl und jeder Satz nachprüfen lässt, ohne sie neu zu
beschaffen. Sie stehen unter CC-BY-4.0 und dürfen weitergegeben werden.
Ins Installationspaket geraten sie nicht: dort wandert nur `dist/**`, und
kein Code importiert sie.

## Der Text ist erzeugt, nicht abgetippt

`src/zustaende.ts` wird aus den PDFs ausgelesen. Beim Auslesen entstehen
Fehler, die man nicht sieht, wenn man nicht danach sucht: die
Zweispaltigkeit trennt Wörter mit Bindestrichen, ein Seitenkopf rutscht
mitten in einen Absatz, ein Glossareintrag läuft in den nächsten hinein,
und in Zahlen landen Leerzeichen — im englischen PDF steht „11, 50 0" für
11.500.

Deshalb prüfen die Tests nicht nur Werte, sondern die Übernahme selbst:
dass beide Sprachfassungen gleich viele Absätze haben, dass kein Eintrag
Text des nächsten trägt, dass keine Seitenkopfreste darin stehen.

**Zwei Fassungen zu haben ist dabei der beste Schutz.** Eine Zahl, die in
beiden gleich dasteht, ist mit ziemlicher Sicherheit richtig gelesen —
genau so sind die beiden Leerzeichen-Stellen aufgefallen.

## Eine Zahl, die nicht aus dem Dokument stammt

`DARUEBER_AB` in `erfahrung.ts`. Das Regelwerk kennt drei Budgets und hört
bei „hoch" auf; was weit darüber liegt, lässt es offen. Die Grenze, ab der
diese Sammlung „über hoch" sagt statt weiter „hoch", ist gesetzt und nicht
abgeleitet. Sie steht als benannte Konstante da, damit sie sich nicht als
Regel ausgibt.

## Namensnennung

Pflicht, wörtlich, in `src/namensnennung.ts` und in `NOTICE.md` im
Projektstamm. Sie gehört in den Über-Dialog jeder Anwendung, die etwas von
hier benutzt.
