# TTRPG Map Editor

*[Dieses Dokument auf Deutsch: README.de.md](README.de.md)*

A map editor for pen-&-paper tabletop RPGs. Draw battlemaps and world maps — and
export them as Universal VTT, **with** walls, doors and lights instead of retracing
them there. Compatible with Foundry VTT, Roll20 and Owlbear Rodeo.

Runs in the browser, entirely locally. No login, no cloud.

> This project is not officially affiliated with, endorsed by, or reviewed by
> Foundry Gaming LLC, Roll20, or Owlbear Rodeo. Their names appear here solely to
> describe which programs the exported files work with.

**About this project:** the code, architecture, and this documentation were built
almost entirely with [Claude Code](https://claude.com/claude-code), Anthropic's AI
assistant — acting as an independently working developer across many sessions, not
just as autocomplete. Contributions are explicitly welcome, whether you work with
AI assistance or without it.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

### Without Node: the single file

The editor is also available as **a single HTML file** you can double-click.
No Node, no npm, no server — a browser is enough:

```bash
npm run build:portable      # produces dist-portable/index.html
```

If you can't build it yourself, download a ready-made copy: under *Actions* →
*Portable Einzeldatei*, open the latest run and grab the `TTRPG-Karteneditor`
artifact.

The file contains everything — JavaScript, CSS, fonts, props. Saving and loading
go through the browser's normal file dialog, as do the image and VTT export.
Nothing is uploaded; the file works offline.

### If `npm run dev` fails on Windows

If the failure looks like this —

```
Error: Cannot find module @rollup/rollup-win32-x64-msvc.
  [cause]: Error: An Application Control policy has blocked this file.
```

— then **the advice in the message is wrong.** It suggests deleting `node_modules`
and `package-lock.json` and reinstalling. That won't help here: the file exists,
but Windows refuses to load it. The decisive sentence is the one below, under
`cause`.

Two ways forward:

1. **Use the single file above.** It doesn't need Rollup at all.
2. **Replace Rollup with its WASM build** — the same functionality, but without a
   native file for the policy to block. In `package.json`:

   ```json
   "overrides": { "rollup": "npm:@rollup/wasm-node@^4" }
   ```

   then `npm install`. Verified with Rollup 4.63: the dev server and the build
   both run fine this way. The build gets somewhat slower — WASM instead of
   native code — but is otherwise indistinguishable.

This isn't the default in `package.json` on purpose: wherever the native file is
allowed to load, it's faster.

## What's inside

**Map and grid**
Map size in tile units, resizable afterwards with a 9-point anchor. Square grid
and hex in both orientations. Grid size, opacity, colour, line width and offset
are all adjustable. Snapping to tile, half-tile, quarter-tile, or corner points.

**Layers**
A freely arranged stack instead of a fixed set of layers. Any number of object
layers, mixing props, drawings and text. Groups, visibility, lock, opacity, blend
mode, export flag, reordering, merging. The grid and the VTT layer sit in the same
stack and can be freely repositioned.

**Props**
Built-in procedural vector props — rocks, trees, plants, furniture, dungeon
dressing. Each with several variants, freely scalable, rotatable and tintable.
Your own PNG/WebP folders can be imported as well.

Size, colour, opacity and mirroring can be set as a **default for all new
props**, instead of adjusting every placed prop individually; the preview at the
pointer shows it live. "Apply from selection" turns an already-adjusted prop
into the template for the next ones.

Selection handles can be **grabbed directly**, without switching to the select
tool — a prop you've just placed is immediately rotatable and scalable. Holding
Alt places a prop instead, even on top of one that's already selected.

**Scatter brush**
Spreads several props at once with random size, rotation and colour variation.
Radius, density, value ranges, minimum spacing and edge falloff are adjustable
and can be saved as a preset. Erase with the right mouse button. One stroke is
one undo step.

**Drawing and text**
Freehand with smoothing, line, rectangle, ellipse, polygon — with stroke, fill
and blend mode. Text is typed directly on the map, multi-line, with font, size,
alignment, letter spacing and outline.

**Walls, doors, lights**
A dedicated layer for everything the VTT should build. Wall runs snap to cell
corners and existing wall points, doors sit on walls and can be opened and
closed, lights have a range in tiles, colour, intensity and shadows. Plus
"generate walls from shapes": drawn rooms become normal, editable wall runs.

**Legend**
Builds a panel from what's actually on the map: a colour swatch per biome, a
signature per prop in use. Every entry can be deselected individually, and
additional entries that don't appear on the map can be added too — they sit in
the panel below a divider, so it stays clear what the map shows and what it
doesn't.

**Export**
PNG, WebP and JPEG at a chosen resolution. Universal VTT (`.uvtt`/`.dd2vtt`) for
Foundry, Roll20 and Owlbear Rodeo — every export is immediately read back and
the numbers it found are shown. Projects as `.ttmap` for further editing.
`.dd2vtt` files can also be opened.

## Importing into Foundry

Foundry cannot read Universal VTT out of the box. You need the
[Universal Battlemap Importer](https://foundryvtt.com/packages/dd-import) module
(`dd-import`), compatible with v13 and v14. Then: pick the `.dd2vtt` file, import
— walls, doors and lights are created automatically.

Turn the grid off when exporting for a VTT. Foundry draws its own, otherwise
you'll get two on top of each other.

## Keyboard shortcuts

| Key | Effect |
|---|---|
| `V` / `P` / `B` | Select / Prop / Brush |
| `D` / `T` | Draw / Text |
| `W` / `O` / `L` | Wall / Door / Light |
| `H` | Pan the view |
| Hold spacebar | Pan the view |
| Mouse wheel | Zoom |
| `Alt`+wheel | Brush radius |
| `Ctrl`+`Z` / `Ctrl`+`Y` | Undo / Redo |
| `Ctrl`+`C` / `V` / `D` | Copy / Paste / Duplicate |
| `Alt`+drag | Clone while dragging |
| `Del` | Delete |
| `[` / `]` | Send backward / bring forward |
| `Ctrl` while dragging | Suspend snapping |
| Grab a handle (prop) | Rotate/scale without switching tools |
| `Alt`+click (prop) | Place a prop instead of grabbing the selection |
| `F1` | Help and controls |

The interface is available in **German and English** — switchable in the Help
dialog (`F1`); the choice is remembered.

## Development

```bash
npm test          # tests
npm run typecheck # type checking
npm run build     # production build
```

Architecture and project conventions live in [CLAUDE.md](CLAUDE.md), open items
in [BACKLOG.md](BACKLOG.md) — both in German for now.

## License

[GNU Affero General Public License v3.0 or later](../../LICENSE) — the same
license as the rest of TTRPG-Tools. Free software: use it, change it, pass it
on. If you offer a modified version over a network, its source has to be
available too.
