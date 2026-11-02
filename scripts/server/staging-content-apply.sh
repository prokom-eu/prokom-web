#!/usr/bin/env bash
# Server half of scripts/staging-content.sh (runbook §2a): puts a prepared database and media
# into the staging stack. Called over ssh with the files already in ../.staging-content/:
#   bash scripts/server/staging-content-apply.sh <sha> "<lines>"
# Everything that can fail runs while the app still serves the old content: the new database is
# restored next to the old one (prokom_staging_new) and the media unpacked next to the old ones.
# Only then a short switch: app stopped, databases and media swapped by rename, app started,
# health + smoke test. Any failure after the switch puts the old database and media back.
# Staging only — every name below is the staging stack's.
set -euo pipefail

sha="${1:?usage: staging-content-apply.sh <sha> <lines>}"
lines="${2:-}"
# STAGING_REPO when the script comes over stdin (bash -s) from scripts/staging-content.sh.
repo="${STAGING_REPO:-$(cd "$(dirname "$0")/../.." && pwd)}"
dir="$repo/../.staging-content"
app=prokom-staging-app-1
pg=prokom-staging-postgres-1
volume=prokom-staging_media
db=prokom_staging
helper="$(docker inspect -f '{{.Config.Image}}' "$pg")" # postgres image: tar, find, chown

log() { echo "   $*"; }
psql_admin() { docker exec "$pg" psql -U prokom -d postgres -v ON_ERROR_STOP=1 -qtAc "$1"; }
# Input only from an explicit redirect: without one, stdin must be /dev/null — this script itself
# may arrive on stdin (bash -s over ssh), and `docker run -i` would swallow the rest of it.
media_sh() { docker run --rm -i -v "$volume:/m" "$helper" sh -ec "$1"; }
env_value() { sed -n "s/^$2=//p" "$repo/$1" | tail -1; }

[ -s "$dir/db.dump" ] && [ -s "$dir/media.tar" ] || { echo "No prepared files in $dir"; exit 1; }

# The same lock as deploys, and the code must still be the one the content was made with.
exec 9>"$repo/../.deploy.lock"
flock -w 600 9 || { echo "A deploy is running — try again later."; exit 1; }
tag="$(env_value .env.staging APP_IMAGE_TAG)"
[ "$tag" = "$sha" ] || { echo "Staging now runs ${tag:0:7}, the content was made at ${sha:0:7} — run again."; exit 1; }

log "prepare next to the live content (app still running)"
psql_admin "drop database if exists ${db}_new with (force)"
docker exec "$pg" createdb -U prokom "${db}_new"
docker exec -i "$pg" pg_restore -U prokom -d "${db}_new" --no-owner --single-transaction --exit-on-error <"$dir/db.dump"
media_sh 'rm -rf /m/.incoming /m/.old; mkdir /m/.incoming; tar -C /m/.incoming -xf -; chown -R 1000:1000 /m/.incoming' <"$dir/media.tar"

switched=0
rollback() {
  [ "$switched" = 1 ] || return 0
  log "FAILED — old database and media back"
  docker stop "$app" >/dev/null 2>&1 || true
  psql_admin "alter database $db rename to ${db}_failed" || true
  psql_admin "alter database ${db}_old rename to $db" || true
  media_sh 'mkdir -p /m/.failed; find /m -mindepth 1 -maxdepth 1 ! -name .old ! -name .failed -exec mv {} /m/.failed/ \;; find /m/.old -mindepth 1 -maxdepth 1 -exec mv {} /m/ \;; rmdir /m/.old' </dev/null || true
  docker start "$app" >/dev/null 2>&1 || true
  log "old content back; failed copy kept as ${db}_failed and media .failed (remove when checked)"
}
on_exit() {
  local rc=$?
  if [ "$rc" -ne 0 ]; then rollback; fi
  exit "$rc"
}
trap on_exit EXIT

log "switch (app stopped for a moment)"
docker stop "$app" >/dev/null
switched=1
psql_admin "drop database if exists ${db}_old with (force)"
psql_admin "alter database $db rename to ${db}_old"
psql_admin "alter database ${db}_new rename to $db"
media_sh 'mkdir /m/.old; find /m -mindepth 1 -maxdepth 1 ! -name .incoming ! -name .old -exec mv {} /m/.old/ \;; find /m/.incoming -mindepth 1 -maxdepth 1 -exec mv {} /m/ \;; rmdir /m/.incoming' </dev/null
docker start "$app" >/dev/null

status=''
for _ in $(seq 1 60); do
  status="$(docker inspect -f '{{.State.Health.Status}}' "$app")"
  [ "$status" = healthy ] && break
  sleep 5
done
[ "$status" = healthy ] || { log "app not healthy ($status)"; exit 1; }
log "app healthy"
read -r -a hosts <<<"$(env_value .env.proxy STAGING_SITE_HOSTS)"
PANEL_HOST="$(env_value .env.staging PANEL_HOST)" \
  bash "$repo/scripts/smoke.sh" "http://127.0.0.1:$(env_value .env.staging APP_PORT)" "${hosts[@]}" >"$dir/smoke.log" ||
  { tail -5 "$dir/smoke.log"; exit 1; }
log "$(tail -1 "$dir/smoke.log")"

# Success: the old copies go; the uploaded files (personal data) too.
switched=0
psql_admin "drop database if exists ${db}_old with (force)"
media_sh 'rm -rf /m/.old' </dev/null
rm -rf "$dir"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) staging content refreshed ($lines) at ${sha:0:7}" >>"$repo/../deploys.log"
log "done"
