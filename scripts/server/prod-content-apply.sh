#!/usr/bin/env bash
# Server half of scripts/prod-content.sh (runbook §3a): the FIRST content of production is a copy
# of staging — the content the boss accepted there — without its test traffic. Called over ssh:
#   CONTENT_CONFIRM=prokom-prod bash scripts/server/prod-content-apply.sh <line…>
# Lines: biznes software instalacje. Each named line gets its production domain in its tenant
# (environment „production”); a line not named keeps only local/staging domains, so production
# answers 404 for it. A later line is launched by adding its production domain in the panel of
# production — not with this script (its content is then edited there).
# What the copy leaves out: inquiries (and their deletion log), login sessions and edit locks —
# their rows never leave staging. Accounts (Users) come along: review them after (runbook §3a).
# Safety:
#   - only for the first launch: it refuses when production already has a production domain,
#     an inquiry or an entry of the deletion log (checked again after the app is stopped);
#   - production and staging run the same image tag (the same schema and migrations);
#   - always CONTENT_CONFIRM=prokom-prod (the local wrapper asks to type it); a predeploy backup
#     when production already has tables;
#   - prepared next to the live database, then a short switch; a failure undoes exactly the steps
#     of the switch that were done.
set -euo pipefail

[ $# -gt 0 ] || { echo "usage: prod-content-apply.sh <biznes|software|instalacje>…" >&2; exit 2; }
declare -A HOSTS=(
  [biznes]=prokombiznes.pl
  [software]=prokomsoftware.pl
  [instalacje]=prokominstalacje.pl
)
for line in "$@"; do
  [ -n "${HOSTS[$line]:-}" ] || { echo "Unknown line: $line" >&2; exit 2; }
done
[ "${CONTENT_CONFIRM:-}" = prokom-prod ] || { echo "Set CONTENT_CONFIRM=prokom-prod (scripts/prod-content.sh asks for it)." >&2; exit 2; }

# PROD_REPO when the script comes over stdin (bash -s) from scripts/prod-content.sh.
repo="${PROD_REPO:-$(cd "$(dirname "$0")/../.." && pwd)}"
# Stack names; the defaults are the server's. Overridden only by a local test on throwaway stacks.
src="${CONTENT_SRC:-prokom-staging}"
dst="${CONTENT_DST:-prokom-prod}"
src_db="${src//-/_}"
dst_db="${dst//-/_}"
src_pg="$src-postgres-1"
src_app="$src-app-1"
dst_pg="$dst-postgres-1"
dst_app="$dst-app-1"
src_media="${src}_media"
dst_media="${dst}_media"
src_env=".env.${src#prokom-}"
dst_env=".env.${dst#prokom-}"
work="$repo/../.prod-content"

log() { echo "   $*"; }
env_value() { sed -n "s/^$2=//p" "$repo/$1" 2>/dev/null | tail -1; }
psql_dst() { docker exec "$dst_pg" psql -U prokom -d "$1" -v ON_ERROR_STOP=1 -qtAc "$2"; }
# Input only from an explicit redirect (this script itself may arrive on stdin).
media_dst() { docker run --rm -i -v "$dst_media:/m" "$helper" sh -ec "$1"; }

docker inspect "$src_pg" >/dev/null 2>&1 || { echo "No $src_pg — is staging running?" >&2; exit 1; }
docker inspect "$dst_pg" >/dev/null 2>&1 ||
  { echo "No $dst_pg — start the production database first (runbook §3, first launch)." >&2; exit 1; }
helper="$(docker inspect -f '{{.Config.Image}}' "$dst_pg")" # postgres image: tar, find, chown
app_exists=0
docker inspect "$dst_app" >/dev/null 2>&1 && app_exists=1
if [ "$app_exists" = 1 ]; then
  for name in APP_PORT PANEL_HOST; do
    [ -n "$(env_value "$dst_env" "$name")" ] || { echo "$name is empty in $dst_env." >&2; exit 1; }
  done
fi

exec 9>"$repo/../.deploy.lock"
flock -w 600 9 || { echo "A deploy is running — try again later." >&2; exit 1; }

# Same code: the dump must fit the schema production migrates to — also what staging really runs.
src_tag="$(env_value "$src_env" APP_IMAGE_TAG)"
dst_tag="$(env_value "$dst_env" APP_IMAGE_TAG)"
[ -n "$src_tag" ] && [ "$src_tag" = "$dst_tag" ] || {
  echo "Staging runs ${src_tag:0:7}, production is set to ${dst_tag:-nothing} — set APP_IMAGE_TAG in $dst_env to the staging tag first." >&2
  exit 1
}
running="$(docker inspect -f '{{.Config.Image}}' "$src_app" 2>/dev/null || true)"
[ "${running##*:}" = "$src_tag" ] ||
  { echo "Staging's container runs ${running##*:}, not ${src_tag:0:7} from $src_env — wait for the deploy to finish." >&2; exit 1; }

# Only the first launch: production content is edited in its panel from then on.
first_launch_guard() {
  local db="$1"
  [ "$(psql_dst "$db" "select count(*) from information_schema.tables where table_schema='public' and table_name='tenants'")" = 1 ] || return 0
  local live
  live="$(psql_dst "$db" "select (select count(*) from inquiries) + (select count(*) from inquiry_deletions) + (select count(*) from tenants_domains where environment = 'production')")"
  [ "$live" = 0 ] || {
    echo "Production is live (production domains, inquiries or deletions: $live) — this script is only for the first launch. A next line: add its production domain in the panel. Nothing changed." >&2
    return 1
  }
}
first_launch_guard "$dst_db"
has_tables="$(psql_dst "$dst_db" "select count(*) from information_schema.tables where table_schema='public' and table_name='tenants'")"

mkdir -p "$work" && chmod 700 "$work"
switched=0
db_moved=0
db_new_in=0
media_swapped=0
# Before the switch: nothing live was touched — drop what was prepared. After it: undo exactly
# the steps done (a failed rename must not move live media or drop the live database).
rollback() {
  if [ "$switched" = 0 ]; then
    psql_dst postgres "drop database if exists ${dst_db}_new with (force)" >/dev/null 2>&1 || true
    media_dst 'rm -rf /m/.incoming' </dev/null >/dev/null 2>&1 || true
    return 0
  fi
  log "FAILED — undoing the switch"
  [ "$app_exists" = 0 ] || docker stop "$dst_app" >/dev/null 2>&1 || true
  if [ "$media_swapped" = 1 ]; then
    media_dst 'mkdir -p /m/.failed; find /m -mindepth 1 -maxdepth 1 ! -name .old ! -name .failed -exec mv {} /m/.failed/ \;; find /m/.old -mindepth 1 -maxdepth 1 -exec mv {} /m/ \;; rmdir /m/.old' </dev/null || true
  else
    media_dst 'rm -rf /m/.incoming' </dev/null || true
  fi
  if [ "$db_new_in" = 1 ]; then
    psql_dst postgres "alter database $dst_db rename to ${dst_db}_failed" || true
  fi
  if [ "$db_moved" = 1 ]; then
    psql_dst postgres "alter database ${dst_db}_old rename to $dst_db" || true
  fi
  psql_dst postgres "drop database if exists ${dst_db}_new with (force)" || true
  [ "$app_exists" = 0 ] || docker start "$dst_app" >/dev/null 2>&1 || true
  log "old content back (failed copy, if any: ${dst_db}_failed, media .failed — remove when checked)"
}
on_exit() {
  local rc=$?
  [ "$rc" -eq 0 ] || rollback
  rm -rf "$work"
  exit "$rc"
}
trap on_exit EXIT

if [ "$has_tables" = 1 ]; then
  log "backup of production (predeploy)"
  "$repo/scripts/backup.sh" "${dst#prokom-}" predeploy </dev/null >"$work/backup.log" 2>&1 ||
    { tail -5 "$work/backup.log"; exit 1; }
  log "$(tail -1 "$work/backup.log")"
fi

log "copy of staging next to production (the app still runs)"
# The rows with personal data never leave staging; the truncate below is only a second guard.
docker exec "$src_pg" pg_dump -U prokom -d "$src_db" -Fc \
  --exclude-table-data='inquir*' --exclude-table-data=users_sessions \
  --exclude-table-data='payload_locked_documents*' >"$work/db.dump"
psql_dst postgres "drop database if exists ${dst_db}_new with (force)"
docker exec "$dst_pg" createdb -U prokom "${dst_db}_new"
docker exec -i "$dst_pg" pg_restore -U prokom -d "${dst_db}_new" --no-owner --single-transaction --exit-on-error <"$work/db.dump"
rm -f "$work/db.dump"
psql_dst "${dst_db}_new" "truncate inquiries, inquiry_deletions, users_sessions, payload_locked_documents cascade"

for line in "$@"; do
  host="${HOSTS[$line]}"
  log "domain $host → tenant $line (production)"
  psql_dst "${dst_db}_new" "
    insert into tenants_domains (_order, _parent_id, id, host, environment)
    select coalesce((select max(_order) from tenants_domains where _parent_id = t.id), 0) + 1,
           t.id, substr(md5(random()::text), 1, 24), '$host', 'production'
    from tenants t where t.slug = '$line'
    and not exists (select 1 from tenants_domains where host = '$host')"
  [ "$(psql_dst "${dst_db}_new" "select count(*) from tenants_domains d join tenants t on t.id = d._parent_id where t.slug = '$line' and d.host = '$host' and d.environment = 'production'")" = 1 ] ||
    { echo "Tenant $line has no production domain $host after the insert (another tenant holds it?)." >&2; exit 1; }
done
log "accounts that come along (review in the panel): $(psql_dst "${dst_db}_new" "select coalesce(string_agg(role || ' ' || n, ', '), 'none') from (select coalesce(role::text, '?') role, count(*) n from users group by 1) r")"
leftovers="$(docker exec "$dst_pg" pg_dump -U prokom -d "${dst_db}_new" --data-only | grep -c 'https\?://staging\.' || true)"
[ "$leftovers" = 0 ] || log "WARNING: $leftovers rows mention a staging address — check the content in the panel"

# Without leftovers of earlier runs on staging's volume (.old/.failed/.incoming).
docker run --rm -v "$src_media:/s:ro" "$helper" \
  tar -C /s --exclude=./.old --exclude=./.failed --exclude=./.incoming -cf - . |
  media_dst 'rm -rf /m/.incoming /m/.old; mkdir /m/.incoming; tar -C /m/.incoming -xf -; chown -R 1000:1000 /m/.incoming'

log "switch"
[ "$app_exists" = 0 ] || docker stop "$dst_app" >/dev/null
# An inquiry may have come in while the copy was made: the app is stopped now, check again.
if ! first_launch_guard "$dst_db"; then
  [ "$app_exists" = 0 ] || docker start "$dst_app" >/dev/null
  exit 1
fi
switched=1
psql_dst postgres "drop database if exists ${dst_db}_old with (force)"
psql_dst postgres "alter database $dst_db rename to ${dst_db}_old"
db_moved=1
psql_dst postgres "alter database ${dst_db}_new rename to $dst_db"
db_new_in=1
media_dst 'mkdir /m/.old; find /m -mindepth 1 -maxdepth 1 ! -name .incoming ! -name .old -exec mv {} /m/.old/ \;; find /m/.incoming -mindepth 1 -maxdepth 1 -exec mv {} /m/ \;; rmdir /m/.incoming' </dev/null
media_swapped=1

hosts=()
for line in "$@"; do hosts+=("${HOSTS[$line]}"); done
if [ "$app_exists" = 1 ]; then
  docker start "$dst_app" >/dev/null
  status=''
  for _ in $(seq 1 60); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$dst_app")"
    [ "$status" = healthy ] && break
    sleep 5
  done
  [ "$status" = healthy ] || { log "app not healthy ($status)"; exit 1; }
  log "app healthy"
  PANEL_HOST="$(env_value "$dst_env" PANEL_HOST)" \
    SMOKE_CONTENT=1 bash "$repo/scripts/smoke.sh" "http://127.0.0.1:$(env_value "$dst_env" APP_PORT)" "${hosts[@]}" </dev/null >"$work/smoke.log" ||
    { grep FAIL "$work/smoke.log" || tail -5 "$work/smoke.log"; exit 1; }
  log "$(tail -1 "$work/smoke.log")"
else
  log "no app container yet — next: up -d app, health and smoke test (runbook §3)"
fi

switched=0
psql_dst postgres "drop database if exists ${dst_db}_old with (force)"
media_dst 'rm -rf /m/.old' </dev/null
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) ${dst#prokom-} content from staging ${src_tag:0:7} ($*)" >>"$repo/../deploys.log"
log "done — production content = staging ${src_tag:0:7}, domains: ${hosts[*]}"
