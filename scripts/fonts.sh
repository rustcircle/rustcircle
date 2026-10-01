#!/usr/bin/env bash
# Subset the OFL fonts (from @fontsource, already woff2) down to the glyphs a
# Portuguese/English maths blog needs: Basic Latin, Latin-1 (accents, ª º « »),
# Œ œ, typographic punctuation, arrows and the common maths operators.
# Output goes to assets/fonts/ (committed), so `make build` never needs Python.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
fs="$root/node_modules/@fontsource"
out="$root/assets/fonts"
mkdir -p "$out"

unicodes="U+0020-007E,U+00A0-00FF,U+0152-0153,U+02C6,U+02DC,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2030,U+2032-2033,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+221E,U+2248,U+2260,U+2264-2265,U+00D7,U+00F7"

subset() { # src dst [features]
  uv run --quiet --with 'fonttools[woff]==4.*' --with brotli pyftsubset "$1" \
    --unicodes="$unicodes" --flavor=woff2 --output-file="$2" \
    --layout-features="${3:-kern,liga,calt,tnum,lnum}" --no-hinting \
    --desubroutinize --name-IDs='*' --notdef-outline
}

subset "$fs/orbitron/files/orbitron-latin-700-normal.woff2"            "$out/orbitron-700.woff2"   kern
subset "$fs/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2"  "$out/plex-sans-400.woff2"
subset "$fs/ibm-plex-sans/files/ibm-plex-sans-latin-400-italic.woff2"  "$out/plex-sans-400i.woff2"
subset "$fs/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2"  "$out/plex-sans-600.woff2"
subset "$fs/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2"  "$out/plex-mono-400.woff2"

# Licences travel with the fonts.
cp "$fs/orbitron/LICENSE"      "$out/LICENSE-Orbitron.txt"
cp "$fs/ibm-plex-sans/LICENSE" "$out/LICENSE-IBM-Plex.txt"

ls -l "$out"/*.woff2 | awk '{print $5, $NF}'
