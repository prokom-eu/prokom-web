#!/usr/bin/env bash
# A separate staging login for a tool (S10c, runbook §1.9), e.g. the Better Stack monitor:
#   ssh -t prokom-vps 'bash /srv/prokom/prokom-web/scripts/server/staging-login.sh monitor'
# Adds (or replaces) <user> in ../secrets/staging.htpasswd with a random password and shows the
# ready `Authorization` header (and the bare base64 token) ONCE — paste it into the tool,
# nowhere else. Nginx reads the file
# on every request, no restart needed. Remove a login: sed -i '/^<user>:/d' <file>.
set -euo pipefail
user="${1:?usage: staging-login.sh <user>}"
[[ "$user" =~ ^[a-z][a-z0-9-]{1,31}$ ]] || { echo "invalid user name: $user"; exit 1; }
[ "$user" != szef ] || { echo "szef is the people's login — not replaced here"; exit 1; }
file="$(cd "$(dirname "$0")/../../.." && pwd)/secrets/staging.htpasswd"
[ -f "$file" ] || { echo "No $file"; exit 1; }
pw="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"
sed -i "/^$user:/d" "$file"
printf '%s:%s\n' "$user" "$(printf '%s' "$pw" | openssl passwd -apr1 -stdin)" >>"$file"
chmod 644 "$file" # nginx in its container reads it as another user; the password is hashed
token="$(printf '%s:%s' "$user" "$pw" | base64 -w0)"
echo "Login $user saved. Header for the tool (shown once):"
echo
echo "Authorization: Basic $token"
echo
echo "Only the token (secret STAGING_BASIC_AUTH of the Lighthouse workflow): $token"
unset token
unset pw
