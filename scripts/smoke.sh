#!/usr/bin/env bash
# Smoke test after a deploy (S9, run by the pipeline in S10).
# Usage: scripts/smoke.sh <base-url> [site-host ...]
#   scripts/smoke.sh http://127.0.0.1:3000                      # the app directly, local domains
#   scripts/smoke.sh https://127.0.0.1 prokombiznes.pl …         # through Nginx on the server
# Every request goes to the address of <base-url>, but for the site's domain (curl --connect-to):
# the right `Host` and TLS name (SNI), before DNS and behind Nginx alike.
# Without hosts: the three local dev domains. A host with „biznes” in its name is the Biznes site,
# with „software” the Software site: their own routes must answer 200, on every other host 404
# (route guards, B11b, SW12).
# Only routes that work without content entered in the panel — a failed smoke test rolls the
# deploy back (S10). Optional environment:
#   PANEL_HOST       panel domain (default panel.localhost)
#   SMOKE_AUTH       user:password for a server behind basic auth (staging)
#   SMOKE_INSECURE=1 accept a self-signed certificate (local test of Nginx)
#   SMOKE_CORE=1     only health, panel and the home page of each site — routes every version
#                    has (deploy.sh checks a rolled-back older image with it)
# Exit code 1 on any failure.
set -euo pipefail

base="${1:?usage: scripts/smoke.sh <base-url> [site-host ...]}"
shift
hosts=("$@")
if [ ${#hosts[@]} -eq 0 ]; then
  hosts=(biznes.localhost instalacje.localhost software.localhost)
fi
panel="${PANEL_HOST:-panel.localhost}"

scheme="${base%%://*}"
address="${base#*://}"
address="${address%%/*}"
if [[ "$address" == *:* ]]; then
  port="${address##*:}"
  address="${address%:*}"
else
  port=$([ "$scheme" = https ] && echo 443 || echo 80)
fi

curl_opts=(-s -o /dev/null -w '%{http_code}' --max-time 15)
[ -n "${SMOKE_AUTH:-}" ] && curl_opts+=(-u "$SMOKE_AUTH")
[ "${SMOKE_INSECURE:-}" = 1 ] && curl_opts+=(-k)

failures=0

# check <expected status> <host> <path>
check() {
  local expected="$1" host="$2" path="$3" status
  status=$(curl "${curl_opts[@]}" --connect-to "${host}:${port}:${address}:${port}" \
    "${scheme}://${host}:${port}${path}" || true)
  if [ "$status" = "$expected" ]; then
    echo "ok    ${status} ${host}${path}"
  else
    echo "FAIL  ${status} ${host}${path} (expected ${expected})"
    failures=$((failures + 1))
  fi
}

check 200 "${hosts[0]}" /api/health
# The admin build (import map, assets) is the most fragile part of a standalone image.
check 200 "$panel" /admin/login
for host in "${hosts[@]}"; do
  check 200 "$host" /
  [ "${SMOKE_CORE:-}" = 1 ] && continue
  check 200 "$host" /sitemap.xml
  check 200 "$host" /robots.txt
  check 200 "$host" /mapa-strony
  # The panel answers only on PANEL_HOST; a site domain must not expose it.
  check 404 "$host" /admin
  # Biznes routes: 200 on Biznes, 404 elsewhere.
  if [[ "$host" == *biznes* ]]; then expected=200; else expected=404; fi
  for path in /oferta /zapytanie; do
    check "$expected" "$host" "$path"
  done
  # Software routes built in code (SW12): 200 on Software, 404 elsewhere. Not /dobierz, /kontakt,
  # /cennik — they need the wizard rules or pages entered in the panel.
  if [[ "$host" == *software* ]]; then expected=200; else expected=404; fi
  for path in /rozwiazania /api/solutions-index; do
    check "$expected" "$host" "$path"
  done
  # News: Biznes and Software (B11, SW11b).
  if [[ "$host" == *biznes* || "$host" == *software* ]]; then expected=200; else expected=404; fi
  check "$expected" "$host" /aktualnosci
done

if [ "$failures" -gt 0 ]; then
  echo "Smoke test failed: ${failures} check(s)."
  exit 1
fi
echo "Smoke test passed."
