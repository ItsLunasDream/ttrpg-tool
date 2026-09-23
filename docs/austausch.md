# Konzept: Austausch am Tisch

Ein Werkzeug, mit dem eine Gruppe, die in Person spielt und die Sammlung
auf mehreren Rechnern hat, Sachen hin- und herschickt: Notizen, Monster,
Zustände, Nachrichten.

**Stand:** Stufe 1 ist gebaut: die gemeinsame Schnittstelle
(`packages/austausch`) in drei Werkzeugen (Story Creator, Monster Creator,
Nachschlagewerk) und der Dialog „Teilen" in der Hülle. Weitergegeben wird
vorerst als Paketdatei, eingelesen aus einer. Der Raum im lokalen Netz
(Stufe 2) steht noch aus.

**Entschieden (Nutzerin, 23.09.):**

- Die Schnittstelle hat dieselbe Form wie die Einstellungen: ein optionaler
  Haken je Werkzeug, die Hülle vermittelt.
- Angenommen wird auch, wenn das Zielwerkzeug zu ist: die Werkzeuge
  schreiben direkt in ihre Ablage, beim nächsten Öffnen ist der Eintrag da.
- Räume findet man über eine **Liste im Netz** (Stufe 2).
- **Bilder reisen mit**, als Base64 im Paket.
- Im Raum gibt es außerdem einen **Chat**: Nachrichten an alle und
  **Direktnachrichten** an eine Person. **Dateien und Einträge** lassen sich
  ebenso an alle oder an **einzelne Personen** schicken. Jede Person gibt
  sich einen **Namen** (Einstellung „Dein Name am Tisch"); ohne eigenen
  Namen gilt ein generischer („Gast 1"). Doppelte Namen bekommen im Raum
  eine Zahl. Solange die Verbindung unverschlüsselt ist, sagt die App bei
  Direktnachrichten sichtbar, dass sie im selben Netz mitlesbar sind.

**Wie Stufe 1 gebaut ist:**

- Eine Sendung ist das Markdown, das das Werkzeug ohnehin ablegt, dazu
  Name, Art und die Bilder. Ein Paket ist eine lesbare Markdown-Datei
  (`.ttrpg.md`); die Verwaltung steht in HTML-Kommentaren.
- Gibt es eine Kennung schon, wird gefragt: daneben legen (Vorgabe),
  übernehmen oder verwerfen. Daneben gelegt bekommt der Eintrag eine freie
  Kennung, eine Notiz auch einen eindeutigen Titel („Der König (2)").
- Eine Notiz geht in eine Kampagne, die der Empfänger wählt. Kennt die
  Kampagne den Notiztyp nicht, wird er mit der Beschriftung des Absenders
  angelegt. Beziehungen auf Notizen, die es beim Empfänger nicht gibt,
  fallen weg.
- Offizielle Regeln reisen als Verweis, Hausregeln ganz, Notizen am
  Regeltext gar nicht.
- Offene Werkzeuge erfahren vom Empfang: der Story Creator liest neu,
  Monster Creator und Nachschlagewerk zeigen den angekommenen Eintrag.
- Geprüft in `packages/austausch` (Paketformat), im Vault-Test des Story
  Creators (Empfang mit Bild und Typ) und im Rauchtest
  `smoke-austausch.cjs` (ganzer Weg, Werkzeuge geschlossen).

## Die Reihenfolge, um die es geht

Der erste Reflex bei diesem Punkt ist die Verbindung — wie finden sich zwei
Rechner, was ist mit dem Router, geht das ohne Server. Das ist der falsche
Anfang.

**Das größere Problem liegt innen.** Ein Werkzeug, das von allen anderen
etwas holt und an alle etwas zurückgibt, braucht eine gemeinsame
Schnittstelle zu ihnen. Die gibt es heute nicht. Es gibt drei Einzelbrücken
zwischen je zwei Werkzeugen:

- Monster Creator → Story Creator (legt eine Notiz an)
- NPC Creator → Story Creator (legt eine Figur an)
- Inspirationshilfe → Karteneditor (beginnt eine Karte)

Jede davon ist für ihren einen Fall gebaut. Ein viertes, fünftes und
sechstes Paar zu verdrahten wäre die Art Wachstum, bei der am Ende niemand
mehr weiß, wer mit wem redet.

Also: **erst die Schnittstelle, dann das Netz.** Die Verbindung ist das
kleinere Problem, und sie ist ohne die Schnittstelle nutzlos.

## Teil 1: Die gemeinsame Schnittstelle

Zwei Sätze, mehr braucht es nicht:

> **„Gib mir deine Einträge."**
> **„Nimm diesen Eintrag an."**

Ein Werkzeug, das mitmacht, beantwortet beide. Ein Werkzeug, das nicht
mitmacht, taucht schlicht nicht auf. Genau dieselbe Form hat gerade die
Einstellungs-Schnittstelle bekommen (`packages/einstellungen`, ein
optionaler Haken je Werkzeug), und sie hat sich bewährt: die Hülle muss über
ein neues Werkzeug nichts wissen.

Was ein Eintrag mitbringen muss:

| Feld | Wozu |
|---|---|
| Werkzeug | Woher er stammt und wohin er zurückgehört |
| Kennung | Damit „derselbe Eintrag" erkennbar ist |
| Name | Zum Anzeigen in der Liste |
| Art | Notiz, Monster, Zustand, Begegnung … |
| Inhalt | Das Markdown, das die Werkzeuge ohnehin schreiben |

**Markdown als Transportform, nicht JSON.** Jedes Werkzeug schreibt seine
Ablage schon so, und wer eine empfangene Datei von Hand aufmacht, soll etwas
lesen können. Das ist dieselbe Entscheidung wie überall in der Sammlung.

### Regeln sind auch Einträge

Das Nachschlagewerk (`docs/nachschlagewerk.md`) hält neben den offiziellen
Regeln die **Hausregeln** des Tisches — wie kritische Treffer gewürfelt
werden, was bei einer langen Rast sonst noch geht. Genau die will man
verschicken: die Gruppe soll nachlesen können, was gilt, ohne zu fragen.

Dabei gilt eine Unterscheidung, die man gleich richtig macht:

- **Eine Hausregel reist ganz**, mit Text. Sie stammt vom Tisch, es gibt sie
  nirgends sonst.
- **Eine offizielle Regel reist nicht, sie wird genannt.** Jede Installation
  hat denselben Bestand; den Text mitzuschicken wäre Ballast. Es genügt die
  Kennung, und beim Empfänger geht die Stelle auf.

Die **Notizen am Regeltext** (kleine Bemerkungen an einer Stelle, siehe
`docs/nachschlagewerk.md`) reisen dagegen gar nicht: sie sind für einen
selbst geschrieben und hängen an einer Textstelle, die beim Empfänger
womöglich anders verläuft. Wer eine Bemerkung teilen will, macht eine
Hausregel daraus — und genau dieser Knopf ist die Brücke zwischen beiden.

Das passt ohne Umbau in die Tabelle oben: eine Hausregel ist ein Eintrag mit
Inhalt, ein Verweis auf eine offizielle Regel einer ohne. Nebenbei erledigt
sich damit die Frage, ob die vorgeschriebene Namensnennung des SRD
mitreisen muss — sie stellt sich nicht, wenn der offizielle Text gar nicht
mitreist.

### Wo Empfangenes landet

Die Ablagen sind heute getrennt: jedes Werkzeug hat seinen eigenen Ordner.
Das soll so bleiben — ein Monster gehört in den Monsterordner, auch wenn es
von jemand anderem kommt.

**Nichts überschreibt stillschweigend.** Kommt ein Eintrag mit einer
Kennung, die es hier schon gibt, wird gefragt: übernehmen, daneben legen
oder verwerfen. „Daneben legen" ist die Vorgabe. Beim Übernehmen die
falsche Fassung zu verlieren ist der Fehler, bei dem jemand Arbeit verliert
— und das ist die Sorte, die diese Sammlung an anderer Stelle schon
konsequent vermeidet.

## Teil 2: Wer was sehen darf

**Die Spielleitung schickt nicht alles an alle.** Ein Monster mit Statblock
an einen Spieler ist ein Spoiler, und ein Werkzeug, das das erst nach dem
Klick merkt, hat den Abend verdorben.

Vorschlag, bewusst einfach:

- **Es wird nur auf Zuruf geschickt.** Kein Abonnement, kein „alles
  synchronisieren". Wer etwas teilt, wählt es aus und wählt, an wen.
- **An alle oder an einen.** Mehr Abstufungen braucht ein Tisch mit fünf
  Leuten nicht.
- **Nichts wird geholt.** Man kann nicht in die Sammlung eines anderen
  sehen und sich etwas nehmen. Das ist keine Sicherheitsmaßnahme, sondern
  eine über die Rolle: die Spielleitung entscheidet, was die Gruppe weiß.

Damit ist die Rechteverwaltung: es gibt keine. Wer sendet, entscheidet. Das
ist für einen Tisch angemessen und spart ein Rollenmodell, das sowieso
niemand pflegt.

## Teil 3: Die Verbindung

Erst hier. Ein benannter Raum mit Passwort, Peer-to-Peer.

### Stufe 1: dasselbe Netz

Im selben WLAN finden sich die Geräte über mDNS/Bonjour und reden direkt
miteinander. Dafür braucht es nichts weiter — **„ohne Server" gilt hier
wirklich.**

Das Passwort regelt den **Zutritt zum Raum**, mehr nicht. Verschlüsselung
ist ein eigener Punkt und kommt extra. Solange sie fehlt, gilt:

> **Alles im Raum liegt für jeden im selben Netz offen.**

Im eigenen WLAN am Spieltisch ist das vertretbar. In einem fremden Netz
(Bibliothek, Laden, Uni) ist es das nicht. **Dieser Satz gehört in die
Oberfläche, nicht nur in diese Datei** — sichtbar, wenn ein Raum aufgemacht
wird, nicht in einer Hilfe, die niemand liest.

### Stufe 2: über das Internet

Hier muss ich der Wunschvorstellung widersprechen: **ohne Server geht das
nicht ganz.**

Über das Internet scheitert Peer-to-Peer fast immer an den Routern (NAT).
Zwei Rechner hinter zwei Anschlüssen finden einander nicht von selbst; es
braucht einen fremden Helfer zum Kennenlernen (STUN, dazu eine Stelle, die
die Kontaktdaten vermittelt). Bei ungünstigen Anschlüssen läuft der Verkehr
sogar dauerhaft über einen Relay — dann ist es kein Peer-to-Peer mehr,
sondern ein Server mit zusätzlichen Schritten.

Daraus folgt:

- „Ohne Server" ist für Stufe 1 zu halten und für Stufe 2 nur mit
  Einschränkung.
- **Über das Internet darf es ohne Verschlüsselung gar nicht erst gehen.**
  Im eigenen WLAN ist offener Verkehr eine vertretbare Abkürzung; über
  fremde Leitungen ist er keine.

Stufe 2 ist damit kein Ausbau von Stufe 1, sondern ein eigener Punkt mit
eigener Entscheidung. Sie gehört nicht in dieselbe Planung.

## Was zuerst

Die Reihenfolge fällt aus dem Obigen von selbst:

1. **Die Schnittstelle** in zwei oder drei Werkzeugen. Schon ohne jedes
   Netz nützlich — sie ist das, was eine werkzeugübergreifende Suche
   (Strg+K, steht auch auf der Liste) genauso braucht.
2. **Der Raum im lokalen Netz**, mit dem Hinweis auf offenen Verkehr.
3. **Senden auf Zuruf**, mit der Rückfrage beim Annehmen.
4. *Später und getrennt:* Verschlüsselung, und erst danach das Internet.

Stufe 1 lohnt sich auch allein. Das ist das beste Zeichen dafür, dass der
Schnitt stimmt.

## Zu klären

- **Ob die Schnittstelle dieselbe Form bekommt wie die der Einstellungen.**
  Ich würde ja sagen: ein optionaler Haken je Werkzeug, die Hülle vermittelt.
  Dann gibt es ein Muster statt zweier.
- **Wie ein Raum heißt und wie man beitritt.** Name plus Passwort ist die
  Entscheidung; wie der Name gefunden wird (Liste im Netz? Eintippen?) ist
  offen.
- **Was mit Bildern passiert.** Eine Notiz kann Bilder haben, ein Monster
  nicht. Markdown allein transportiert sie nicht mit — für die erste Fassung
  vermutlich: Text ja, Bilder nein, und das sichtbar sagen.
- **Ob ein Werkzeug offen sein muss, um etwas anzunehmen.** Heute antworten
  nur montierte Werkzeuge auf Anfragen der Hülle. Für Einstellungen ist das
  richtig; für ankommende Einträge wäre es überraschend, wenn ein Monster
  verloren geht, weil der Monster Creator gerade zu ist.
