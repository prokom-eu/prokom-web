#!/usr/bin/env bash
# Smoke test after a deploy (S9, run by the pipeline in S10).
# Usage: scripts/smoke.sh <base-url> [site-host ...]
#   scripts/smoke.sh http://127.0.0.1:3000 biznes.localhost instalacje.localhost software.localhost
# Every request goes to <base-url> with the site's domain in `Host`, so it works before DNS and
# behind Nginx alike. Without hosts: the three local dev domains. Exit code 1 on any failure.
set -euo pipefail

base="${1:?usage: scripts/smoke.sh <base-url> [site-host ...]}"
shift
hosts=("$@")
if [ ${#hosts[@]} -eq 0 ]; then
  hosts=(biznes.localhost instalacje.localhost software.localhost)
fi

failures=0

# check <expected status> <host> <path>
check() {
  local expected="$1" host="$2" path="$3" status
  status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -H "Host: ${host}" "${base}${path}" || true)
  if [ "$status" = "$expected" ]; then
    echo "ok    ${status} ${host}${path}"
  else
    echo "FAIL  ${status} ${host}${path} (expected ${expected})"
    failures=$((failures + 1))
  fi
}

check 200 "${hosts[0]}" /api/health
for host in "${hosts[@]}"; do
  check 200 "$host" /
  check 200 "$host" /sitemap.xml
  # The panel answers only on PANEL_HOST; a site domain must not expose it.
  check 404 "$host" /admin
done

if [ "$failures" -gt 0 ]; then
  echo "Smoke test failed: ${failures} check(s)."
  exit 1
fi
echo "Smoke test passed."
