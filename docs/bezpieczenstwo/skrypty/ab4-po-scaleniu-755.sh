#!/usr/bin/env bash
# Audit AB4 — server steps after prokom-web #755 is merged AND staging is deployed (the pipeline
# copies the new docker/ and scripts/ to /srv/prokom/prokom-web). No sudo. From the repo folder:
#   scp docs/bezpieczenstwo/skrypty/ab4-po-scaleniu-755.sh prokom-vps:/tmp/
#   ssh prokom-vps "bash /tmp/ab4-po-scaleniu-755.sh; rm /tmp/ab4-po-scaleniu-755.sh"
# Steps:
#   1. the new deploy gate (in-place docker/nginx, S-02) → ~/bin/prokom-deploy-gate,
#   2. `nginx -t` in a throwaway container with the same compose files as the running proxy,
#   3. only if 2 passed: recreate the proxy (a few seconds) — the `login` zone and the GraphQL
#      block on the panel go live,
#   4. check every domain.
set -euo pipefail
repo=/srv/prokom/prokom-web
cd "$repo"

grep -q 'nginx-in-place' scripts/server/deploy-gate.sh || {
  echo "scripts/server/deploy-gate.sh here is not the #755 version yet — deploy staging first" >&2
  exit 1
}
cp ~/bin/prokom-deploy-gate ~/bin/prokom-deploy-gate.przed-ab4
install -m 700 scripts/server/deploy-gate.sh ~/bin/prokom-deploy-gate
echo "1. gate installed (previous: ~/bin/prokom-deploy-gate.przed-ab4)"

files="$(docker inspect prokom-proxy-nginx-1 --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}')"
args=""
for f in $(echo "$files" | tr ',' ' '); do args="$args -f $f"; done
# shellcheck disable=SC2086
docker compose --env-file .env.proxy -p prokom-proxy $args run --rm --no-deps nginx nginx -t
echo "2. nginx -t ok"

# shellcheck disable=SC2086
docker compose --env-file .env.proxy -p prokom-proxy $args up -d --force-recreate --no-deps nginx
sleep 3
docker exec prokom-proxy-nginx-1 nginx -t
echo "3. proxy recreated"

for d in prokombiznes.pl prokominstalacje.pl prokomsoftware.pl pro-kom.eu prokomgaming.pl prokomserwis.pl panel.prokombiznes.pl; do
  printf '%-24s %s\n' "$d" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$d/")"
done
printf '%-24s %s (expected 404)\n' "panel /api/graphql" "$(curl -s -o /dev/null -w '%{http_code}' -X POST https://panel.prokombiznes.pl/api/graphql)"
echo "4. done"
