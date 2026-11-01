#!/usr/bin/env bash
# New age key pair for backups (runbook §1.8) — ONLY for a first setup or a planned key change,
# never when rebuilding a server (then age.pub comes from the old private key, runbook §6).
# Shows the PRIVATE key once — copy it to the password manager ("prokom-web backup age") — and
# keeps only the PUBLIC key on the server in ../secrets/age.pub (.env.backup reads it from
# there). A new pair = new backups only; old backups still need the old private key.
#   bash age-new.sh            # refuses when age.pub exists
#   bash age-new.sh --force    # planned key change
set -euo pipefail
secrets="$(cd "$(dirname "$0")/../../.." && pwd)/secrets"
[ -d "$secrets" ] || { echo "No $secrets directory — create it first (runbook §1.2)."; exit 1; }
if [ -e "$secrets/age.pub" ] && [ "${1:-}" != --force ]; then
  echo "$secrets/age.pub already exists — backups use that key. Planned change: --force."
  exit 1
fi
dir="$(mktemp -d)"
trap 'shred -u "$dir/key" 2>/dev/null || true; rm -rf "$dir"' EXIT
age-keygen -o "$dir/key" # refuses an existing file, so it gets a fresh path
echo
echo "PRIVATE key — copy this whole line to the password manager:"
echo
grep '^AGE-SECRET-KEY-' "$dir/key"
echo
age-keygen -y "$dir/key" >"$secrets/age.pub"
echo "Public key saved in $secrets/age.pub: $(cat "$secrets/age.pub")"
