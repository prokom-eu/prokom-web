#!/usr/bin/env bash
# Saves the Backblaze B2 application key in the rclone config of the admin user (remote
# "offsite", ADR-019, runbook §1.8). Run it yourself so the key never reaches a chat or history:
#   ssh -t prokom-vps 'bash /srv/prokom/prokom-web/scripts/server/b2-key.sh <bucket>'
# Paste with a right click — Ctrl+V often does not work in a hidden prompt.
# (rclone gets the key as an argument for a moment — acceptable on a single-admin server.)
set -euo pipefail
bucket="${1:?usage: b2-key.sh <bucket>}"
read -rp "keyID: " id
read -rsp "applicationKey (paste: right click): " k
echo
# Drop bracketed-paste escape codes and spaces around the values.
id="$(printf '%s' "$id" | tr -dc 'A-Za-z0-9')"
k="$(printf '%s' "$k" | tr -dc 'A-Za-z0-9+/=')"
echo "keyID length: ${#id} (25), applicationKey length: ${#k} (31)"
rclone config delete offsite 2>/dev/null || true
rclone config create offsite b2 account "$id" key "$k" >/dev/null # prints the key otherwise
unset k
chmod 600 "$(rclone config file | tail -1)"
rclone lsf "offsite:$bucket" >/dev/null ||
  { echo "B2 connection FAILED — check keyID / applicationKey / bucket, then run again."; exit 1; }
echo "OK: B2 connection works"
