#!/usr/bin/env bash
# FIRST content of production = a copy of staging, without its test traffic (runbook §3a).
# Run on Krystian's computer (Git Bash), once per line launch, after the boss accepted staging:
#   SSH=/c/Windows/System32/OpenSSH/ssh.exe bash scripts/prod-content.sh biznes
# Before: the production stack exists (its postgres runs) and .env.prod has APP_IMAGE_TAG = the
# staging tag. The server half (scripts/server/prod-content-apply.sh) comes from this checkout
# over ssh, so the server needs no newer scripts. It stops — and changes nothing — when production
# already holds inquiries: from the launch on, production content is edited in its panel.
set -euo pipefail
export MSYS_NO_PATHCONV=1

[ $# -gt 0 ] || { echo "usage: scripts/prod-content.sh <biznes|software|instalacje>…" >&2; exit 2; }
for line in "$@"; do
  case "$line" in biznes | software | instalacje) ;; *) echo "Unknown line: $line" >&2; exit 2 ;; esac
done

SSH="${SSH:-ssh}" # Git Bash on Windows: SSH=/c/Windows/System32/OpenSSH/ssh.exe (key in the agent)
server="${SERVER:-prokom-vps}"
remote=/srv/prokom/prokom-web
root="$(cd "$(dirname "$0")/.." && pwd)"

echo "Production gets the content of staging (database and media) for: $*."
echo "Inquiries, sessions and edit locks of staging are left out; accounts come along."
read -r -p "Type prokom-prod to go on: " answer
[ "$answer" = prokom-prod ] || { echo "Aborted." >&2; exit 1; }

"$SSH" "$server" "CONTENT_CONFIRM=prokom-prod PROD_REPO=$remote bash -s -- $*" \
  <"$root/scripts/server/prod-content-apply.sh"
