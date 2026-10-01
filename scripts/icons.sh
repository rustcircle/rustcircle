#!/usr/bin/env bash
# Derive every icon and the avatar from the two originals in imgs/ at the exact
# sizes the site uses. Originals are never modified.
#   imgs/icons.png   -> favicon.ico (16/32), favicon-16/32 png, apple-touch 180,
#                       manifest 192 png / 512 webp
#   imgs/profile.png -> avatar 56/112/168 webp (56 CSS px at 1x/2x/3x), og 400 jpg
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
src_icons="$root/imgs/icons.png"
src_profile="$root/imgs/profile.png"
out="$root/static"
img="$out/img"
mkdir -p "$img"

for f in "$src_icons" "$src_profile"; do
  [[ -f $f ]] || { echo "missing $f" >&2; exit 1; }
done

tmp=$(mktemp -d "${TMPDIR:-/tmp}/icons.XXXXXX")
trap 'rm -rf "$tmp"' EXIT

# Square crops on the faces (coordinates in the 1024-px originals).
magick "$src_icons" -crop 580x580+260+100 +repage "$tmp/icon-sq.png"
magick "$src_profile" -crop 320x320+385+0 +repage "$tmp/avatar-sq.png"

png() { # size src dst [colors]
  magick "$2" -filter Lanczos -resize "$1x$1" -strip \
    ${4:+-colors "$4"} -define png:compression-level=9 \
    -define png:exclude-chunks=all "$3"
}

png 16  "$tmp/icon-sq.png" "$out/favicon-16x16.png" 64
png 32  "$tmp/icon-sq.png" "$out/favicon-32x32.png" 128
png 180 "$tmp/icon-sq.png" "$out/apple-touch-icon.png" 256
png 192 "$tmp/icon-sq.png" "$img/icon-192.png" 256
magick "$tmp/icon-sq.png" -filter Lanczos -resize 512x512 -strip "$tmp/i512.png"
cwebp -quiet -q 82 -m 6 -metadata none "$tmp/i512.png" -o "$img/icon-512.webp"

magick "$tmp/icon-sq.png" -strip -define icon:auto-resize=32,16 -colors 256 "$out/favicon.ico"

for s in 56 112 168; do
  magick "$tmp/avatar-sq.png" -filter Lanczos -resize "${s}x${s}" -strip "$tmp/a$s.png"
  cwebp -quiet -q 80 -m 6 -metadata none "$tmp/a$s.png" -o "$img/avatar-$s.webp"
done
magick "$tmp/avatar-sq.png" -filter Lanczos -resize 400x400 -strip -quality 78 \
  -sampling-factor 4:2:0 -interlace JPEG "$img/og-avatar.jpg"

ls -l "$out"/favicon* "$out/apple-touch-icon.png" "$img" | awk 'NF>5 {print $5, $NF}'
