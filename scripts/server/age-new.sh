#!/usr/bin/env bash
# New age key pair for backups (runbook §1.8). Shows the PRIVATE key once — copy it to the
# password manager ("prokom-web backup age") — and keeps only the PUBLIC key on the server,
# in ../secrets/age.pub (AGE_RECIPIENT in .env.backup). A new pair = new backups only; old
# backups still need the old private key.
set -euo pipefail
secrets="$(cd "$(dirname "$0")/../../.." && pwd)/secrets"
dir="$(mktemp -d)"
trap 'shred -u "$dir/key" 2>/dev/null; rm -rf "$dir"' EXIT
age-keygen -o "$dir/key" # refuses an existing file, so it gets a fresh path
echo
echo "PRIVATE key — copy this whole line to the password manager:"
echo
grep '^AGE-SECRET-KEY-' "$dir/key"
echo
age-keygen -y "$dir/key" >"$secrets/age.pub"
echo "Public key saved in $secrets/age.pub: $(cat "$secrets/age.pub")"
