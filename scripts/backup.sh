#!/usr/bin/env bash
# Backup of one stack: database + uploaded media, encrypted, copied off the server (S9b-2).
# Usage: scripts/backup.sh <prod|staging> [predeploy]
#   cron, every night:        scripts/backup.sh prod   (and staging)
#   before a production deploy: scripts/backup.sh prod predeploy
# Result: one file prokom-<stack>-<UTC time>.tar.age (inside: db.dump from pg_dump -Fc,
# media.tar, manifest.txt), in BACKUP_DIR/<stack>/<kind>/ and RCLONE_REMOTE/<stack>/<kind>/.
# Kinds and retention: daily 14 days, monthly (the backup of the 1st) ~3 months, predeploy 30 days.
# Settings: `.env.backup` in the repo root (or BACKUP_ENV=<file>), see .env.example:
#   AGE_RECIPIENT  public age key (the private one is only in the password manager)
#   RCLONE_REMOTE  off-server target, e.g. offsite:prokom-backups (rclone config on the server)
#   BACKUP_DIR     local copies (default ../backups, next to the repo)
#   BACKUP_LOCAL_ONLY=1  skip the off-server copy (local tests only)
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

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) backup $project: $*"; }

# The unencrypted dump holds personal data (inquiries): kept next to the backups (not in /tmp)
# and removed on exit.
mkdir -p "$backup_dir"
work="$(mktemp -d "$backup_dir/.backup-XXXXXX")"
trap 'rm -rf "$work"' EXIT

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

for k in "${kinds[@]}"; do
  days="$(retention_days "$k")"
  if [ -n "${RCLONE_REMOTE:-}" ]; then
    log "off-server copy to $RCLONE_REMOTE/$stack/$k/"
    rclone copy "$backup_dir/$stack/$k/$name" "$RCLONE_REMOTE/$stack/$k/"
    rclone delete --min-age "${days}d" "$RCLONE_REMOTE/$stack/$k/"
  fi
  find "$backup_dir/$stack/$k" -name '*.tar.age' -mtime +"$days" -delete
done

log "done"
