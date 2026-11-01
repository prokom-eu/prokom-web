#!/usr/bin/env bash
# Puts the PRIVATE age key on the server for a restore (runbook §6, §7): ../secrets/age.key,
# checked against age.pub. Delete it right after the restore: shred -u ../secrets/age.key
set -euo pipefail
secrets="$(cd "$(dirname "$0")/../../.." && pwd)/secrets"
f="$secrets/age.key"
read -rsp "AGE-SECRET-KEY (paste: right click): " raw
echo
# Terminals may wrap a paste in escape codes (bracketed paste) or add spaces — keep the key only.
k="$(printf '%s' "$raw" | tr -d '\r' | grep -oE 'AGE-SECRET-KEY-1[0-9A-Z]+' | head -1 || true)"
unset raw
[ -n "$k" ] || { echo "No AGE-SECRET-KEY-1… in the pasted text — nothing saved."; exit 1; }
echo "key length: ${#k} (74)"
install -m 600 /dev/null "$f"
printf '%s\n' "$k" >"$f"
unset k
if age-keygen -y "$f" 2>/dev/null | cmp -s - "$secrets/age.pub"; then
  echo "OK: key matches the backup key ($f)"
else
  rm -f "$f"
  echo "Key does NOT match $secrets/age.pub — removed."
  exit 1
fi
