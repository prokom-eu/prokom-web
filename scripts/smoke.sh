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
#   SMOKE_CONTENT=1  also the content of the Biznes pages from the seed: at least N H2 in <main>
#                    (NAPRAWA-0911). Only the content imports turn it on (staging-content-apply.sh,
#                    prod-content-apply.sh) — not deploy.sh, whose database may still hold old pages.
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

# check_h2 <minimum> <host> <path>: H2 in <main> of the page (content imports only).
check_h2() {
  local min="$1" host="$2" path="$3" count=0 attempt opts=(-s --max-time 30)
  [ -n "${SMOKE_AUTH:-}" ] && opts+=(-u "$SMOKE_AUTH")
  [ "${SMOKE_INSECURE:-}" = 1 ] && opts+=(-k)
  # Right after a content import the app may answer from its data cache (stale-while-revalidate,
  # PAGE_CACHE_SECONDS): the first request serves the old page and refreshes it in the background.
  # So a page below the minimum is asked again, up to 4 times, 5 s apart.
  for attempt in 1 2 3 4; do
    # One line, then only what is between <main …> and </main> (frame headings left out).
    count=$(curl "${opts[@]}" --connect-to "${host}:${port}:${address}:${port}" \
      "${scheme}://${host}:${port}${path}" | tr '\n' ' ' |
      sed -n 's/.*<main[ >]\(.*\)<\/main>.*/\1/p' | grep -o '<h2[ >]' | wc -l || true)
    count="${count//[[:space:]]/}"
    [ "${count:-0}" -ge "$min" ] && break
    [ "$attempt" -lt 4 ] && sleep 5
  done
  if [ "${count:-0}" -ge "$min" ]; then
    echo "ok    h2=${count} ${host}${path} (min ${min})"
  else
    echo "FAIL  h2=${count:-0} ${host}${path} (expected at least ${min} — page from an older seed?)"
    failures=$((failures + 1))
  fi
}

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
  # Full pages 09.11: 12 / 10 / 9 / 5 / 4 H2; the 31.10 pages: 5 / 4 / 3 / 3 / 3. /kontakt has no
  # margin — a heading removed from the shared contact template needs this threshold lowered.
  if [ "${SMOKE_CONTENT:-}" = 1 ] && [[ "$host" == *biznes* ]]; then
    check_h2 8 "$host" /gopos
    check_h2 8 "$host" /insert
    check_h2 6 "$host" /opieka-it
    check_h2 4 "$host" /o-firmie
    check_h2 4 "$host" /kontakt
  fi
done

if [ "$failures" -gt 0 ]; then
  echo "Smoke test failed: ${failures} check(s)."
  exit 1
fi
echo "Smoke test passed."
