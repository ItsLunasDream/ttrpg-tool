# TTRPG-Tools

*[Dieses Dokument auf Deutsch: README.de.md](README.de.md)*

Tools for tabletop RPG campaigns, running side by side in one window. No
account, no cloud: everything stays on your own disk. The one exception is
the optional AI connection you set up yourself, and even that only speaks to
the provider you entered.

- **Initiative Tracker** — turn order, hit points, conditions with a
  duration, terrain events. System-neutral, with groups for monster hordes.
- **Dice** — a pool from d4 to d100 plus a custom die, flat or as falling
  bodies. Subtraction works too (`1d20 − 1d4`).
- **Story Creator** — characters, places, relationships: rich-text editor,
  wiki links, profile fields, stored as Markdown.
- **NPC Creator** — background characters at the push of a button, from
  tables or from an AI, exported as a note into the Story Creator.
- **Inspiration** — the scaffold for a new campaign: hook, factions,
  characters, places, connections, timeline. From tables, with AI if you
  want it.
- **Monster Creator** — homebrew monsters at a challenge rating you choose.
  Every number is checked against the baselines, whether it came from the
  tables, from your keyboard or from an AI.
- **TTRPG Map Editor** — draw battlemaps and world maps, export as Universal
  VTT.

Working titles, icons and tool names are provisional.

## Download a finished build

No Node, no npm needed:

1. Open the **Actions** tab, click the topmost **Build** run
2. Under **Artifacts**, download `ttrpg-tools-windows` and unpack it
3. Inside: `TTRPGTools-Setup-<version>.exe` (installer) and
   `TTRPGTools-portable-<version>.exe` (runs without installing)

Notes:

- SmartScreen warns on first launch because the file is not signed: "More
  info" → "Run anyway". A signature would need a paid certificate.
- Artifacts are kept for one day. For a permanent download, create a
  release; the workflow attaches the files there.

## Building it yourself

Only needed if you want to work on the code.

Two rules, without which the build fails:

- Run every command inside the project folder, not in your home folder.
- **Run `npm install` once after every `git pull`.** Otherwise references to
  new workspace packages are missing. `scripts/pruefe-installation.mjs` runs
  before `dev`, `start`, `build`, `test`, `typecheck` and the smoke tests and
  says so in plain words instead of `Rollup failed to resolve import`.

```bash
cd path\to\project
npm install
npm run dev             # shell in development mode, with hot reload
npm start               # start the production build
npm test                # core logic tests, across all workspaces
npm run typecheck
npm run smoke           # smoke test of the built shell
npm run smoke:backstory # smoke test of the Story Creator (separate run)
npm run dist:win        # Windows installer into apps/shell/release/
```

Also:

- `scripts\bauen-win.cmd` does `git fetch -p`, `git pull`, `npm install` and
  `npm run dist:win` in one go on Windows.
- Work on one tool alone: `npm run dev:backstory`, `dev:mapmaker`,
  `dev:initiative`, `dev:dice`, `dev:npc`.
- A command without a suffix always means the suite, not the Story Creator.
- For a single workspace: `npm run <script> -w apps/backstory`.

### Workspace layout

An npm workspace monorepo; the commands at the root delegate.

```
apps/shell/        The shell: window, start menu, rail, settings
apps/backstory/    Story Creator
apps/mapmaker/     TTRPG Map Editor (also buildable as a Tauri app)
apps/initiative/   Initiative Tracker
apps/dice/         Dice
apps/npc/          NPC Creator
apps/inspiration/  Inspiration
apps/monster/      Monster Creator
packages/dice/     Reading and rolling dice expressions
packages/i18n/     Language choice and text substitution
packages/motion/   Timings, curves and base animations
packages/ki/       Connection to language models (Ollama, Claude)
```

`packages/*` are platform-free: no `node:*`, no `electron`, no browser
globals. They are bundled into both processes.

## The shell

`apps/shell` is the main entry point: a frameless `BaseWindow` holding the
shell across the full area, with the tool's view on top of it, leaving room
for the title bar and the rail.

- A tool stays loaded once opened and is only hidden when you switch away.
  Everything is still there when you come back; the price is memory, roughly
  130 MB per tool.
- Each tool runs in its own Electron session (`persist:<id>`). Otherwise they
  would all share `localStorage` and IndexedDB, because `file://` is the same
  origin for all of them.
- Embedding goes through one `src/main/embed.ts` per tool. Its own standalone
  main process uses the same code.
- What exists and how far along it is lives in exactly one place:
  `apps/shell/src/shared/apps.ts`.
- Language is wired through: a change applies everywhere at once.
- On opening, the tool's icon grows across the screen; if loading takes
  longer, the spinner follows.
- **Back and forward** like in a browser, via the mouse's side buttons or
  Alt and an arrow key. The history keeps fifty steps and remembers *where*
  you were — it has nothing to do with Ctrl+Z. The side buttons arrive on two
  paths: as `app-command` from the window, and from the document of whichever
  view is in front (each tool's preload reports it). One is not enough —
  Chromium takes the side buttons inside the view on Windows, and the window
  never hears about them.
- Start directly in one tool: `TTRPG_TOOLS_START_APP=backstory`.
- **An introduction the first time**: a welcome on the very first start, and
  a short explanation the first time you open each tool. Never again after
  that; a button in the settings brings them back. The texts live in
  `apps/shell/src/shared/einfuehrung.ts`.

### Your own icons

The bundled icons are provisional and can be replaced:

1. A `symbole` folder in the data directory — local only.
2. `apps/shell/symbole/` in the repository — applies to everyone, ships with
   the app.
3. The built-in vectors, if neither is there.

The file name is the identifier (`backstory.png`, `mapmaker.png`,
`initiative.png`, `dice.png`, `npc.png`). PNG, JPG, WebP and GIF up to 2 MB
are allowed. No SVG, because an SVG file can carry scripts. More in
`apps/shell/symbole/LIESMICH.md`.

### Packaging the suite

```bash
npm run dist:suite:win        # installer and portable exe
npm run dist:suite:linux      # AppImage
npm run verify:package:suite -- <path-to-the-program>
```

The embedded applications' files go to `resources/apps/<id>/dist` via
`extraResources`, deliberately next to the asar archive: what sits outside it
can be looked at when something is missing.

The suite is what gets shipped. The individual applications stay buildable
(`npm run dist:backstory:win`) but are not a deliverable.

## AI

Configured in one place, in the shell's settings; the tools inherit the
setting and learn about a change immediately.

- Three providers behind one interface in `packages/ki`: **Ollama** (local,
  free), the **Claude API**, and **any service with OpenAI's interface** —
  Groq, Mistral, Together, OpenRouter, a local LM Studio. For the last one you
  enter address, model and key.
- The API key is encrypted with the system keychain and never reaches the
  renderer. All network calls run in the main process, the CSP stays at
  `connect-src 'self'`.
- Without a provider everything keeps working: AI is an addition everywhere,
  never a requirement.

## Story Creator

Notes are Markdown with a YAML header, readable in any text editor or in
Obsidian. Your own entries in the header survive saving.

| Action | How |
| --- | --- |
| Link a note | type `[[`, pick from the list |
| New note from a link | type `[[`, enter a name, "create" |
| Open a linked note | hold Ctrl (Cmd) and click |
| Save | Ctrl+S, or autosave |
| Find and replace | Ctrl+F, jump with F3 / Shift+F3 |
| Turn selected text into a link | select, then type `[[` |
| Rename or delete a note | right-click in the note list |
| Fix a spelling mistake | right-click the underlined word |
| Collapse a section | the arrow left of the heading |
| Zoom | Ctrl and the wheel, Ctrl+Plus, Ctrl+Minus, Ctrl+0 |
| Underline | the U button, or Ctrl+U |
| Back up a campaign | "Campaign" menu → "Save as ZIP" |
| Read a backup back in | "Campaign" menu → "Load from ZIP" |
| Adjust the profile fields | "Campaign" menu → "Note types" |
| Insert an image | the ▣ button, or drag an image into the text |
| Ask the assistant | sidebar in the editor |
| Prompts to keep writing | "Writing help" in the header |
| Export | the "Export" button: one note or the whole campaign |
| Get an earlier state back | "History" in the header |
| Relationship map | "Graph" in the header |
| Keyboard shortcuts | "Help" in the header |

The model in short:

- A **campaign** is a container; a note belongs to exactly one and can only
  be linked within it.
- **Note types** are schema-driven and belong to the campaign
  (`campaign.json`), not to the code. Field keys survive renaming a label,
  and removing a field deletes no values.
- **Wiki links** sit as `[[Title]]` in plain text and are carried along when
  a note is renamed. Links to missing notes are coloured differently and are
  listed in the "Open links" panel.
- **Relationships** hang on the pair of notes and are directed; they are not
  part of the link syntax.
- **Images** are copied into `assets/`, not linked, and shown through the
  `backstory-asset://` protocol.
- **Version history** saves before overwriting, at most every five minutes.
  Restoring is itself undoable.
- **The assistant** writes nothing into your text; it asks, checks against
  linked notes and comments on style. A checkbox decides whether the linked
  notes are sent along — it also says how many that would be right now.
- **Zoom** applies to every note and only to the editor area, 20 to 500
  percent. It changes the display only: a font size in the Markdown would be
  a formatting character no other program understands.
- **Collapsed sections** are display only as well and never end up in the
  file. If the cursor lands inside a hidden block, it unfolds again —
  otherwise you would be typing into text nobody can see.
- **The PDF export** can include a table of contents and the relationship
  map, and wiki links become jump targets in it when the note they mean was
  exported too.
- **Custom words** for the spell checker live in the settings and can be
  removed there again.

```
apps/backstory/src/shared/     Data model, wiki link parsing, texts
apps/backstory/src/main/       Main process: files, IPC, export, AI
apps/backstory/src/preload/    The only bridge to the renderer
apps/backstory/src/renderer/   React, TipTap editor, note index, graph
```

The renderer has no Node access.

## Initiative Tracker

System-neutral: an entry has initiative, hit points and conditions — what the
numbers mean is up to the table.

- **Groups**: six goblins roll one initiative and have six sets of hit
  points. That is why hit points hang on the body, not on the entry.
- **Conditions carry a duration**: open-ended, until the start or end of the
  next turn, until the end of the round. They count down by themselves.
- **Terrain events** act on initiative 20 and, on a tie, behind characters
  with 20, like the lair action in the rulebook. They have no hit points and
  are not struck through.
- **Space means next.** Damage is typed and applied with Enter, not clicked —
  damage is rarely one.
- Right-clicking a row opens a menu.
- Encounters are documents (Markdown with a YAML header); the running fight
  is session state and sits next to them as JSON.
- Images are copied into the tool's own folder, not linked.

The rules are pure functions in `src/shared/kampf.ts`. A mistake in turn
order goes unnoticed at the table and cannot be reproduced — it has to be
checkable before it happens.

## NPC Creator

A background character at the push of a button: name, species, occupation,
something noticeable, what they want, a secret, a quirk.

- Every field can be rerolled on its own, locked, or overwritten by hand. A
  character carries finished text, not references into the tables.
- The sound of the name is selectable: feminine, masculine, neutral.
- **With AI** the model suggests freely rather than from the tables —
  otherwise it would be a slow and expensive die. Without AI the tables
  apply.
- **Export** creates a note in the Story Creator's open campaign. The note
  list there updates immediately.
- Rolling happens in the working language; a finished character does not
  switch languages with it, or a translation would overwrite handwritten
  text.

Generation is a pure function in `src/shared/erzeuge.ts`, the model's tasks
are in `src/shared/kiAufgaben.ts`.

## Inspiration

The blank page at the start of a campaign. Six building blocks, one button:
hook, factions, characters, places, connections, and a timeline of what
happens if the party does nothing.

- **Complete without AI.** The blocks are drawn from combining tables: over a
  million different hooks, as many places and as many characters. The number
  is shown in the interface and is computed from the tables, not claimed.
- **Four dials**: scope (evening, arc, campaign), region, theme, tone.
  Region, theme and tone are free fields with a suggestion list; known terms
  narrow the tables, your own leave them open.
- **Connections are directed**: A sees B as a mentor, B sees A as a threat.
  Every character hangs off at least one other.
- **A lock per block**, as in the NPC Creator. The button on the block itself
  rerolls it anyway.
- **Everything can be overwritten by hand.** A roll is a suggestion, not a
  result. Writing a sentence yourself also pins that block — the next "roll
  everything" leaves it alone.
- **Characters that already exist** can be pulled in from the open campaign
  (including the NPC Creator's, which files them there). They are hooked into
  the web right away and get no second note when taken over.
- **The web as a picture**: characters as dots, connections as arrows. The
  list below says what lies between two of them; the picture says where the
  story is dense and who stands at the edge. Click it and the same web opens
  full screen, redrawn for the larger area rather than stretched.
- **"Start a map"** on any place opens the Map Editor and begins a map under
  that name — with what is known about the place as note pins on it. Nothing
  is drawn: generating a map from text would mean driving the Map Editor's
  data model from outside. If the open map already has something on it, it
  asks first.
- **With AI** the model suggests a block freely rather than from the tables,
  with the draft so far as context. It also understands regions of your own,
  like "floating islands", that the tables can do nothing with. Without AI
  the tables apply.
- **The world**: the AI buttons add a sentence or two about the world this
  plays in — your own entries, like "cyberpunk city", are taken literally.
  Rolled, it stays empty: the tables deliver building blocks, not a world.
- **"All from AI"** drafts all six blocks in one answer and relates them to
  each other: the faction knows the hook, the connection knows the
  characters. What the model leaves out comes from the tables, what is too
  much is dropped — the chosen scope applies — and pinned blocks stay as they
  are.
- **Taking it over** creates a note per character, place and faction in the
  open campaign, plus an overview with wiki links — the graph in the Story
  Creator has something to draw right away. Draft here, truth there: there is
  no second store for the same world.

Concept and open points: `docs/inspirationshilfe.md` (German).

## Monster Creator

Homebrew monsters at a rating you choose — and the check is the point, not
the generator.

- **The check is a pure function.** Hit points and armour give a defensive
  CR, damage per round and attack bonus an offensive one; the result is the
  average. Both halves are shown **separately**: the average alone hides a
  monster that takes hits like CR 4 and deals damage like CR 9, which is how
  homebrew usually goes wrong.
- **The verdict says what to turn**, not just that something is off — and
  each suggestion is a button.
- **Whose numbers they are decides what happens.** From the AI: pulled onto
  the rating automatically, and it says what changed by how much (with a way
  back to the AI's own suggestion). From your keyboard: a warning with the
  recommended values, nothing changed behind your back.
- **Roles shift in table rows, not percentages.** The hit-point column is
  flat in the middle of the table and the damage column is not; shifting both
  by the same percentage moves them by different numbers of ratings. A test
  generates every rating times every role and insists each result passes the
  tool's own check.
- **A real stat block, not a column of numbers.** Ability scores, speed and
  every attack spelled out: weapon, reach, to-hit, dice and damage type. The
  weapon fits the creature — a beast does not wield a halberd.
- **Resistances, immunities and vulnerabilities are optional.** They come up
  by chance, more often at high ratings, and most monsters get none. What a
  monster survives longer is taken off its raw hit points, so it stays on its
  rating.
- **Check an existing monster** without generating one: type in numbers from
  a book or from an older campaign and see what the rating says.
- **The collection** holds what you built, as tiles or a list, with one
  search field for name, type and rating at once (`undead 4`, `cr 3-6`).
- Monsters are Markdown files with a YAML header in the data folder. Every
  number lives in the header, so a future encounter tool can read them
  without taking the stat block apart. Experience points are the one
  exception: the CC-BY source only documents seven of them, and guessed
  numbers in a file called "baselines" would be worse than none.

The baselines come from a CC-BY source, credited in [NOTICE.md](NOTICE.md).

## Dice

- **Shape is the only thing that tells one kind of die from another** —
  colour and pattern apply to all of them. That is why the outlines are the
  familiar silhouettes, not geometrically correct projections.
- The selection is one number per kind and may be negative: `3` on the d20
  and `-2` on the d4 means `3d20 - 2d4`. Left-click adds, right-click takes
  away.
- The number's colour is computed from WCAG luminance so it stays readable on
  any die colour.
- Effects: sparkle on a maximum roll, purple stripes on a 1, each can be
  switched off. Subtracted dice get none.
- The history keeps the last 40 rolls for the session only.

**As bodies (3D):** a switch in the appearance section drops the dice instead
of spinning flat outlines. Off is the default, because the display needs
graphics acceleration; without it, it stays flat automatically.

**The physics does not decide the result.** Rolling happens in `wuerfle()`, a
pure function. The simulation lets the bodies fall; afterwards the labels are
renumbered so the result faces up — in pairs with the opposite faces, so the
sum rule still holds. The d100 and the custom die are unlabelled spheres;
there is no body for 37 or 100 sides.

Measured (no graphics card, software WebGL): 100 dice come to rest after 211
steps and 1635 ms of compute; the display is capped at a little over two
seconds. three.js and cannon-es grow the bundle from 157 to 724 kB.

## TTRPG Map Editor

`apps/mapmaker` joined as a standalone repository and brings its own history
and its own `CLAUDE.md` — that is where the substance is. Two adjustments for
the workspace:

- `vite.config.ts` sets `base: './'`. Without it, the built `index.html`'s
  paths point nowhere under `file://` and in a `WebContentsView`.
- The Vite plugins carry a typing workaround (`as Plugin[]`): the workspace
  shares `@vitejs/plugin-react` with apps on Vite 5 while this application
  uses Vite 6. No effect at runtime.

Not part of this repository's CI: the Rust side (`src-tauri/`,
`npm run tauri:dev`/`tauri:build`), the end-to-end run under `e2e/`, and the
`build:portable` variant. All three run locally, unchanged.

## Where the data lives

The Story Creator's storage location defaults to the user data directory and
can be changed under Settings → Storage location.

That location can also be backed up as a ZIP and read back in. A campaign
read back in always gets a new identifier — an existing one is never
overwritten.

```
<storage location>/             Story Creator data
  campaigns/<campaignId>/
    campaign.json
    notes/<noteId>.md           YAML front matter + Markdown
    assets/                     the campaign's images
    history/<noteId>/           earlier states
  writing-prompts.de.json       writing-help prompts, freely editable
  writing-prompts.en.json

<user data directory>/          the shell's data
  einstellungen.json            language, AI, encrypted key
  fenster.json                  window size and position
  symbole/                      your own app icons
```

- A Markdown file you drop into `notes/` yourself is read along. Without a
  YAML header the first heading serves as the title. The file name becomes
  the ID and may only contain letters, digits, `-` and `_`.
- The application runs only once; a second start brings the window to the
  front.
- Every file carries a `schemaVersion` for later migrations.
- The default language is English; a choice you make once sticks.

## Tests

| Command | What it checks |
| --- | --- |
| `npm test` | core logic of all workspaces |
| `npm run typecheck` | types of all workspaces |
| `npm run smoke` | the built shell: start, switching, AI, icons, NPC export, introductions, mouse side buttons |
| `npm run smoke:backstory` | campaign, notes, wiki link, renaming, spelling, reading back in |
| `npm run roundtrip` | saving does not change the Markdown |
| `npm run verify:package:suite -- <path>` | the packaged build comes up |

Worth knowing:

- `smoke` and `smoke:backstory` are **two separate runs**. Starting only the
  first one misses regressions in the Story Creator.
- The smoke test runs against the unpacked app. Whether something is missing
  from the installer is only seen by `verify:package`. Both run in CI before
  the Windows application is uploaded.
- The round trip is needed because the core logic tests only check Markdown ↔
  HTML. If the editor schema does not know an element, it is dropped on load
  and lost after saving — that is how tables, links and deep headings were
  lost in the past.

On Linux with Xvfb:

```bash
npm run dist:backstory:linux:dir
xvfb-run -a npm run verify:package -w apps/backstory -- \
  "$PWD/apps/backstory/release/linux-unpacked/backstory-creator"
```

## State and limits

All seven tools run embedded; `encounter` is planned and not clickable yet.

Known limits:

- Switching campaigns loads every note. Fine for a few hundred; well beyond
  that it would need an index.
- Renaming writes every affected file one by one; a crash in between would
  leave part of the links on the old name.
- Ambiguous names (same title or alias) are recorded in the index but not
  called out in the interface.

Open tasks and planned phases: [BACKLOG.md](BACKLOG.md) (German). What to
check by hand before a release — the things automated tests cannot see:
[TESTLISTE.md](TESTLISTE.md) (German).

## Trademarks

This project is not affiliated with, endorsed by or reviewed by Foundry
Gaming LLC, Roll20, Owlbear Rodeo, Obsidian, Anthropic or Ollama. Those names
appear here solely to describe which programs and services the tools work
with.

## About this project

Code, architecture and this documentation were to a very large extent written
with [Claude Code](https://claude.com/claude-code), Anthropic's AI assistant —
as a developer working on its own across many sessions, not just as
autocomplete. Contributions are welcome, with or without AI assistance.

Code comments, commit messages and the project documents
(`KONVENTIONEN.md`, `BACKLOG.md`, `docs/`) are in German. The interface is
available in German and English.

## License

[GNU Affero General Public License v3.0 or later](LICENSE).

Free software: you may use it, change it and pass it on. If a modified
version is offered over a network, its source has to be available too.
Without any warranty, as described in the license.

### Third-party content

Some **data** in this repository comes from other works under their own
licenses, which require attribution. The attributions live in
[NOTICE.md](NOTICE.md) and travel with the project — leaving them out would
be a licence violation, not a cosmetic slip.

In short: the monster baselines by challenge rating come from the *Lazy GM's
5e Monster Builder Resource Document* by Teos Abadía, Scott Fitzgerald Gray
and Michael E. Shea, under CC-BY-4.0, which in turn includes material from
the SRD 5.1. Nothing here is taken from the Dungeon Master's Guide.
