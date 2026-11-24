#!/usr/bin/env bash
# Backup of one stack: database + uploaded media, encrypted, copied off the server (S9b-2).
# Usage: scripts/backup.sh <prod|staging> [predeploy]
#   cron, every night:        scripts/backup.sh prod   (and staging)
#   before a production deploy: scripts/backup.sh prod predeploy
# Result: one file prokom-<stack>-<UTC time>.tar.age (inside: db.dump from pg_dump -Fc,
# media.tar, manifest.txt), in BACKUP_DIR/<stack>/<kind>/ and RCLONE_REMOTE/<stack>/<kind>/.
# Kinds and retention: daily 14 days, monthly (the backup of the 1st) ~3 months, predeploy 30 days
# on the server. Off the server (decision 24.11.2026, free 10 GB of B2): predeploy 14 days (the
# shortest Object Lock allows) and at most one per 24 hours — every deploy still gets its copy on
# the server for a rollback; a lost server is covered by the nightly copy. Old off-server copies go
# before the new one is sent, so a full bucket frees itself instead of failing every night.
# Off the server only the production (ADR-019, decision 16.11.2026: the B2 bucket stays in its free
# 10 GB; staging is rebuilt from the code and its copies stay on the server). Staging copies sent
# before are removed from B2 by each staging backup once Object Lock (14 days) lets them go.
# Settings: `.env.backup` in the repo root (or BACKUP_ENV=<file>), see .env.example:
#   AGE_RECIPIENT  public age key (the private one is only in the password manager)
#   RCLONE_REMOTE  off-server target, e.g. offsite:prokom-backups (rclone config on the server)
#   BACKUP_DIR     local copies (default ../backups, next to the repo)
#   BACKUP_LOCAL_ONLY=1  skip the off-server copy (local tests only)
#   BACKUP_OFFSITE_STAGING=1  send the staging copies off the server too (off by default)
#   BACKUP_HEARTBEAT_URL_<STACK>  Better Stack heartbeat (S10c): pinged after a good backup, <url>/fail
#                  on a failed one; no ping for a day = alert on the phone (runbook §1.8)
# Restore: scripts/restore.sh, procedure: docs/runbook.md.
set -euo pipefail
export MSYS_NO_PATHCONV=1 # Git Bash on Windows (local test): keep container paths as they are

stack="${1:?usage: scripts/backup.sh <prod|staging> [predeploy]}"
kind="${2:-daily}"
case "$stack" in prod | staging) ;; *) echo "Unknown stack: $stack" >&2; exit 2 ;; esac
case "$kind" in daily | predeploy) ;; *) echo "Unknown kind: $kind" >&2; exit 2 ;; esac

root="$(cd "$(dirname "$0")/.." && pwd)"
env_file="${BACKUP_ENV:-$root/.env.backup}"
if [ -f "$env_file" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$env_file"
  set +a
fi
log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) backup prokom-$stack: $*"; }

heartbeat_var="BACKUP_HEARTBEAT_URL_$(echo "$stack" | tr '[:lower:]' '[:upper:]')"
heartbeat="${!heartbeat_var:-}"
ping_heartbeat() {
  [ -n "$heartbeat" ] || return 0
  curl -fsS -m 10 --retry 3 -o /dev/null "$heartbeat$1" || log "heartbeat ping failed"
}

# A failed backup (any error under set -e) reports itself at once, not only after a silent day.
on_exit() {
  local status=$?
  rm -rf "${work:-}"
  if [ "$status" -ne 0 ]; then ping_heartbeat /fail; fi
}
trap on_exit EXIT

: "${AGE_RECIPIENT:?set AGE_RECIPIENT (public age key) in .env.backup}"
backup_dir="${BACKUP_DIR:-$root/../backups}"
if [ -z "${RCLONE_REMOTE:-}" ] && [ "${BACKUP_LOCAL_ONLY:-}" != 1 ]; then
  echo "Set RCLONE_REMOTE (off-server copy, ADR-019) or BACKUP_LOCAL_ONLY=1 for a local test." >&2
  exit 2
fi

project="prokom-$stack"
db="prokom_$stack"
pg="$project-postgres-1"
media_volume="${project}_media"
# The PostgreSQL image of the stack also serves as the throwaway container for the media volume.
helper_image="$(docker inspect -f '{{.Config.Image}}' "$pg")"

# The unencrypted dump holds personal data (inquiries): kept next to the backups (not in /tmp)
# and removed on exit.
mkdir -p "$backup_dir"
work="$(mktemp -d "$backup_dir/.backup-XXXXXX")"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
name="$project-$stamp.tar.age"

log "database $db"
docker exec "$pg" pg_dump -U prokom -d "$db" -Fc >"$work/db.dump"
# A dump pg_restore cannot read is no backup: check it before it replaces older ones.
docker exec -i "$pg" pg_restore --list >/dev/null <"$work/db.dump"

log "media volume $media_volume"
docker run --rm -v "$media_volume:/media:ro" "$helper_image" tar -C /media -cf - . >"$work/media.tar"

{
  echo "stack=$stack"
  echo "kind=$kind"
  echo "created=$stamp"
  echo "database=$db"
  echo "app_image=$(docker inspect -f '{{.Config.Image}}' "$project-app-1" 2>/dev/null || echo unknown)"
  echo "migrations:"
  docker exec "$pg" psql -U prokom -d "$db" -tAc 'select name from payload_migrations order by name'
} >"$work/manifest.txt"

kinds=("$kind")
# The first backup of a month is kept longer as the monthly one.
[ "$kind" = daily ] && [ "$(date -u +%d)" = 01 ] && kinds+=(monthly)

target="$backup_dir/$stack/$kind"
mkdir -p "$target"
tar -C "$work" -cf - db.dump media.tar manifest.txt | age -r "$AGE_RECIPIENT" >"$target/$name"
log "written $target/$name ($(du -h "$target/$name" | cut -f1))"
for extra in "${kinds[@]:1}"; do
  mkdir -p "$backup_dir/$stack/$extra"
  cp "$target/$name" "$backup_dir/$stack/$extra/$name"
done

retention_days() {
  case "$1" in daily) echo 14 ;; monthly) echo 93 ;; predeploy) echo 30 ;; esac
}

# Days off the server: predeploy only as long as Object Lock (14 days) holds it.
offsite_days() {
  case "$1" in predeploy) echo 14 ;; *) retention_days "$1" ;; esac
}

# An off-server predeploy copy from the last 24 hours already there?
recent_offsite() {
  [ -n "$(rclone lsf --files-only --max-age 24h "$1" 2>/dev/null)" ]
}

offsite=0
if [ -n "${RCLONE_REMOTE:-}" ] && { [ "$stack" = prod ] || [ "${BACKUP_OFFSITE_STAGING:-}" = 1 ]; }; then
  offsite=1
fi

for k in "${kinds[@]}"; do
  days="$(retention_days "$k")"
  if [ "$offsite" = 1 ]; then
    remote="$RCLONE_REMOTE/$stack/$k/"
    # Old copies first: a full bucket gets its room back before the new copy (403 storage cap).
    rclone delete --min-age "$(offsite_days "$k")d" "$remote" ||
      log "old off-server copies in $k: not removed yet (Object Lock or none)"
    if [ "$k" = predeploy ] && recent_offsite "$remote"; then
      log "off-server predeploy copy from the last 24 h already there; this one stays on the server"
    else
      log "off-server copy to $remote"
      rclone copy "$backup_dir/$stack/$k/$name" "$remote"
    fi
  fi
  find "$backup_dir/$stack/$k" -name '*.tar.age' -mtime +"$days" -delete
done

# Staging no longer goes off the server: its older off-server copies go as soon as Object Lock
# (14 days) allows. A locked or missing file is no failure of the backup.
if [ "$offsite" = 0 ] && [ -n "${RCLONE_REMOTE:-}" ]; then
  log "local only; old off-server copies of $stack removed after 14 days"
  for k in daily monthly predeploy; do
    rclone delete --min-age 14d "$RCLONE_REMOTE/$stack/$k/" 2>/dev/null ||
      log "old off-server copies in $k: not removed yet (Object Lock or none)"
  done
fi

ping_heartbeat ""
log "done"
