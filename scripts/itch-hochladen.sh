#!/usr/bin/env bash
# Laedt ein ungepacktes Paket der Sammlung auf itch.io hoch. Laeuft im
# Workflow (Release oder von Hand mit „itch") und genauso lokal.
#
#   scripts/itch-hochladen.sh <kanal> <ordner>
#
# kanal:  windows | linux — so heissen die Kanaele auf der Projektseite.
# ordner: das ungepackte Paket (release/win-unpacked, release/linux-unpacked).
#
# Braucht BUTLER_API_KEY (Schluessel von itch.io, als Secret) und
# ITCH_PROJEKT ("benutzer/projekt", als Variable). Die Fassung kommt aus
# apps/shell/package.json, damit itch.io dieselbe Nummer zeigt wie der
# Ueber-Dialog.
#
# Lokal (unter Windows in der Git Bash), aus der Wurzel des Repositorys:
#   npm run dist:suite:win
#   BUTLER_API_KEY=... ITCH_PROJEKT=name/lore \
#     bash scripts/itch-hochladen.sh windows apps/shell/release/win-unpacked
# Braucht dort curl, unzip (oder 7z) und node.
set -euo pipefail

kanal="$1"
ordner="$2"
: "${BUTLER_API_KEY:?BUTLER_API_KEY fehlt (Secret im Repository anlegen)}"
: "${ITCH_PROJEKT:?ITCH_PROJEKT fehlt (Variable im Repository anlegen, z. B. name/lore)}"

case "$kanal" in
  windows) plattform=windows-amd64; programm=LORE.exe ;;
  linux) plattform=linux-amd64; programm=lore ;;
  *) echo "Unbekannter Kanal: $kanal" >&2; exit 1 ;;
esac
[ -e "$ordner/$programm" ] || { echo "$ordner/$programm fehlt" >&2; exit 1; }

# Das Manifest sagt der itch-App, was „Starten" heisst.
cat > "$ordner/.itch.toml" <<TOML
[[actions]]
name = "play"
path = "$programm"
TOML

werkzeug="$(mktemp -d)"
curl -fsSL -o "$werkzeug/butler.zip" "https://broth.itch.zone/butler/$plattform/LATEST/archive/default"
if command -v unzip >/dev/null; then unzip -q "$werkzeug/butler.zip" -d "$werkzeug"; else 7z x -y -o"$werkzeug" "$werkzeug/butler.zip" >/dev/null; fi
chmod +x "$werkzeug/butler"* || true
butler="$werkzeug/butler"
[ -e "$butler" ] || butler="$werkzeug/butler.exe"

fassung="$(node -p "require('./apps/shell/package.json').version")"
"$butler" -V
"$butler" push "$ordner" "$ITCH_PROJEKT:$kanal" --userversion "$fassung"
