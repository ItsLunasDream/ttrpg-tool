# LORE auf itch.io (#157)

Vorbereitet ist alles, was im Repository liegen kann: Texte, Bilder,
Manifest und der Upload bei jeder Veröffentlichung. Anlegen muss die Seite
und den Schlüssel die Inhaberin des Kontos; das geht nur auf itch.io selbst.

## Einmalig einrichten

1. **Projekt anlegen** auf itch.io → „Upload new project“.
   - Title: `LORE`
   - Project URL: z. B. `lore` oder `lore-rpg` (falls vergeben)
   - Kind of project: **Downloadable**
   - Classification: **Tools**
   - Pricing: Vorschlag **„No payments“** oder **„Donate“** (siehe unten)
   - Uploads: erst einmal leer lassen, die kommen aus der CI.
2. **API-Schlüssel** holen: itch.io → Settings → API keys → „Generate new
   API key“.
3. Im GitHub-Repository unter Settings → Secrets and variables → Actions:
   - **Secret** `BUTLER_API_KEY` = der Schlüssel aus Schritt 2
   - **Variable** `ITCH_PROJEKT` = `<itch-benutzername>/<project-url>`,
     z. B. `itslunasdream/lore`
4. Ein **Release** auf GitHub veröffentlichen. Der Workflow baut Windows und
   Linux und schiebt beide per `butler` in die Kanäle `windows` und `linux`.
   Die Fassung auf itch.io ist die aus `apps/shell/package.json`.
5. Auf der Projektseite bei den Uploads die Plattform-Häkchen prüfen
   (butler setzt sie meist selbst anhand des Kanalnamens).

Solange `ITCH_PROJEKT` nicht gesetzt ist, bleibt der Upload-Schritt aus;
nichts schlägt fehl. Ist die Variable gesetzt, aber der Schlüssel fehlt,
bricht der Schritt mit einer klaren Meldung ab.

**Nicht geprüft:** die Download-Adresse von butler
(`broth.itch.zone/butler/<plattform>/LATEST/archive/default`) stammt aus der
Dokumentation von itch.io, ließ sich aus der Entwicklungsumgebung heraus
aber nicht abrufen (Netzwerksperre). Der erste echte Lauf ist also zugleich
der Test. Schlägt er fehl, steht der Grund im Log des Schritts „Auf itch.io
hochladen“.

## Was hochgeladen wird

- **windows:** der ungepackte Ordner (`win-unpacked`) mit `LORE.exe`, nicht
  der Installer. Die itch-App installiert und aktualisiert selbst; wer ohne
  App lädt, bekommt ein ZIP zum Entpacken und Starten.
- **linux:** der ungepackte Ordner mit `lore`.
- In beide legt das Skript ein `.itch.toml`, damit „Launch“ in der itch-App
  das richtige Programm startet.

Die Installer (`LORE-Setup-…exe`) hängen weiter am GitHub-Release.

## Preis und Lizenz

Der Quelltext steht unter der AGPL-3.0. Verkaufen ist damit erlaubt, aber
jede Person darf den Quelltext frei weitergeben; ein Preis ist also eher
eine Spende. Empfehlung: **„No payments“** oder **„Donate“** mit einem
Hinweis auf das Repository. Die Entscheidung liegt bei dir.

## Bilder

`apps/shell/scripts/itch-bilder.cjs` nimmt die App in 1280 × 720 auf
(Startseite, Initiative, Monster, Inspiration, Nachschlagewerk, NPC,
Würfel, Loot, Encounter), `itch-bilder.py` setzt Hülle und Werkzeug
zusammen:

```bash
cd apps/shell && npm run build
ZIEL=/tmp/itch xvfb-run -a npx electron scripts/itch-bilder.cjs --no-sandbox
python3 scripts/itch-bilder.py /tmp/itch        # Ergebnis: /tmp/itch/fertig
SPRACHE=de ZIEL=/tmp/itch-de xvfb-run -a npx electron scripts/itch-bilder.cjs --no-sandbox
```

itch.io empfiehlt 3 bis 5 Screenshots; als Titelbild (Cover, 630 × 500)
eignet sich das Symbol oder ein eigenes Banner. Das Cover ist nicht
automatisch erzeugt.

## Texte für die Seite

### Kurzbeschreibung (Tagline)

> Offline tools for running tabletop RPGs: initiative, encounters, monsters,
> rules reference and more, in one window.

### Beschreibung (Englisch)

> **LORE — Library Of RPG Essentials**
>
> A collection of tools for game masters and players, running side by side
> in one window. No account, no cloud: everything stays on your own disk.
>
> **For everyone at the table**
> - **Story Creator:** characters, places and how they relate, with wiki
>   links and a relationship graph.
> - **Dice:** pools from d4 to d100, flat or as 3D dice.
> - **Reference:** the rules glossary, equipment, all 339 spells and 258
>   magic items of the SRD 5.2.1, offline, in English and German.
>
> **For running the game**
> - **Initiative Tracker:** turn order, hit points, conditions with a
>   duration. Share it with your players on the local network.
> - **Encounter Creator:** build encounters from 331 SRD monsters and your
>   own, with difficulty worked out from the rules.
> - **Monster Creator:** homebrew monsters checked against a challenge
>   rating.
> - **Status Effect, Magic Item and NPC Creators, Loot Generator,
>   Inspiration** for campaign ideas, and a **Map Editor**.
>
> **Play together:** open a room on your local network to chat, send
> monsters, notes and rules to one person or everyone, and share the
> initiative order live.
>
> AI features are optional and off by default. They only talk to the
> provider you set up yourself (a local Ollama or an API key).
>
> Free and open source (AGPL-3.0).

### Beschreibung (Deutsch, falls gewünscht als zweiter Abschnitt)

> **LORE — Library Of RPG Essentials**
>
> Werkzeuge für Spielleitung und Spielrunde, nebeneinander in einem Fenster.
> Keine Anmeldung, keine Cloud: alles bleibt auf der eigenen Platte.
> Initiative, Begegnungen, Monster, Zustände, magische Gegenstände, NPCs,
> Beute, Inspiration, Karten und das komplette SRD 5.2.1 als
> Nachschlagewerk, offline und zweisprachig. Im lokalen Netz lassen sich
> Einträge teilen, chatten und die Initiative live mit der Runde teilen.
> KI ist optional und standardmäßig aus.

### Pflichtangabe (unverändert übernehmen)

Die Namensnennung des SRD **muss** auf der Seite stehen, wörtlich, ohne
weitere Nennung von Wizards (siehe `NOTICE.md`,
`packages/srd/src/namensnennung.ts`):

> This work includes material from the System Reference Document 5.2.1
> (“SRD 5.2.1”) by Wizards of the Coast LLC, available at
> https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the
> Creative Commons Attribution 4.0 International License, available at
> https://creativecommons.org/licenses/by/4.0/legalcode.

Keine Logos, keine Marken, kein „D&D“ in Titel, Tags oder Bildern.

### Tags (bis zu 10)

`tabletop`, `ttrpg`, `game-master`, `initiative-tracker`, `dice`,
`encounter-builder`, `offline`, `open-source`, `worldbuilding`, `tools`

### Weitere Felder

- Genre: keins nötig (Tools)
- Made with: Electron
- Platforms: Windows, Linux
- Languages: English, German
- Inputs: Keyboard, Mouse
- Accessibility: „Interface size“ (80–200 %), Farbthemen hell und dunkel
- Links: GitHub-Repository
