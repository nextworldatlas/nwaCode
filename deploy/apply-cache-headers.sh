#!/bin/sh
# Insert (or remove) the Next World Atlas cache-control block in a docroot's
# .htaccess, leaving every other line in that file untouched.
#
# Run on the Hostinger host from .github/workflows/deploy.yml:
#   ssh ... "sh -s -- 'public_html' apply"  < deploy/apply-cache-headers.sh
#   ssh ... "sh -s -- 'public_html' remove" < deploy/apply-cache-headers.sh
#
# Why a block and not a committed public/.htaccess: ~/public_html is SHARED --
# airportrouteatlas/, bookings/ and guesspolis/ are other live sites inside it,
# and its .htaccess is not in this repo. Shipping our own copy would let rsync
# overwrite theirs. This script only ever rewrites the lines between its two
# markers, so anything else in the file survives.
#
# Idempotent: re-running with the same block writes nothing and makes no backup.

set -eu

root=${1:?usage: apply-cache-headers.sh <docroot-under-HOME> <apply|remove>}
mode=${2:?usage: apply-cache-headers.sh <docroot-under-HOME> <apply|remove>}

case "$mode" in
  apply | remove) ;;
  *) echo "mode must be 'apply' or 'remove', got '$mode'" >&2; exit 2 ;;
esac

dir="$HOME/$root"
file="$dir/.htaccess"
backup="$file.nwa-bak"
begin='# BEGIN nwa-cache'
end='# END nwa-cache'

[ -d "$dir" ] || { echo "no such docroot: $dir" >&2; exit 1; }

tmp="$file.nwa-tmp.$$"
trap 'rm -f "$tmp"' EXIT INT TERM

# Start from the current file with any previous copy of our block stripped out.
: > "$tmp"
if [ -f "$file" ]; then
  awk -v b="$begin" -v e="$end" '
    index($0, b) == 1 { skipping = 1; next }
    index($0, e) == 1 { skipping = 0; next }
    !skipping         { print }
  ' "$file" > "$tmp"
fi

if [ "$mode" = apply ]; then
  cat >> "$tmp" <<'BLOCK'
# BEGIN nwa-cache -- managed by .github/workflows/deploy.yml; edits are overwritten
#
# Everything under static/ carries a content hash in its filename and may be
# cached forever. index.html must NOT be: Hostinger serves it with
# "Cache-Control: public, max-age=604800", so a returning visitor can hold a
# week-old copy that asks for a bundle hash the next deploy deleted. The result
# is a blank page until the cache expires.
#
# Scoped on purpose. public_html is shared with airportrouteatlas/, bookings/
# and guesspolis/, and a root .htaccess is inherited by all of them. Request_URI
# below matches only "/" and "/index.html" at the root, so a request for
# /guesspolis/index.html never sets the variable and keeps that site's own
# caching untouched.
<IfModule mod_setenvif.c>
  SetEnvIf Request_URI "^/(index\.html)?$" NWA_NOCACHE=1
</IfModule>
<IfModule mod_headers.c>
  Header unset Expires env=NWA_NOCACHE
  Header unset Pragma env=NWA_NOCACHE
  Header set Cache-Control "no-cache, must-revalidate, max-age=0" env=NWA_NOCACHE
</IfModule>
# END nwa-cache
BLOCK
fi

# Nothing to do if the result is byte-identical to what is already there.
if [ -f "$file" ] && cmp -s "$file" "$tmp"; then
  echo "unchanged: $file"
  exit 0
fi

if [ -f "$file" ]; then
  cp "$file" "$backup"
  echo "previous .htaccess saved to $backup"
fi

# A 'remove' that empties a file we created should not leave a stray .htaccess.
if [ "$mode" = remove ] && ! grep -q '[^[:space:]]' "$tmp"; then
  rm -f "$file"
  echo "remove ok: deleted $file (held nothing but our block)"
  exit 0
fi

mv "$tmp" "$file"
chmod 644 "$file"
echo "$mode ok: $file"
