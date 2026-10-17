#!/usr/bin/env bash
# Restores a backup made by scripts/backup.sh into a running stack (S9b-2). DESTRUCTIVE for the
# target: its database is dropped and recreated, its media volume emptied.
# Usage: scripts/restore.sh <backup file | rclone remote path> <project> <database>
#   monthly test, on a fresh stack:  scripts/restore.sh offsite:prokom-backups/prod/daily/<file> prokom-restoretest prokom_prod
#   real restore of production:      scripts/restore.sh ../backups/prod/predeploy/<file> prokom-prod prokom_prod
# The target stack must exist (its postgres running); the app is stopped for the restore and
# started again. Pending migrations of a newer image run when it starts (prodMigrations).
# Settings: `.env.backup` (or BACKUP_ENV=<file>) — AGE_IDENTITY: file with the PRIVATE age key,
# taken from the password manager for the restore and deleted afterwards.
# prokom-prod / prokom-staging ask to type the project name; RESTORE_CONFIRM=<project> answers it.
set -euo pipefail
export MSYS_NO_PATHCONV=1 # Git Bash on Windows (local test): keep container paths as they are

source="${1:?usage: scripts/restore.sh <backup file | remote path> <project> <database>}"
project="${2:?usage: scripts/restore.sh <backup file | remote path> <project> <database>}"
db="${3:?usage: scripts/restore.sh <backup file | remote path> <project> <database>}"

root="$(cd "$(dirname "$0")/.." && pwd)"
env_file="${BACKUP_ENV:-$root/.env.backup}"
if [ -f "$env_file" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$env_file"
  set +a
fi
: "${AGE_IDENTITY:?set AGE_IDENTITY (file with the private age key)}"

pg="$project-postgres-1"
app="$project-app-1"
media_volume="${project}_media"
helper_image="$(docker inspect -f '{{.Config.Image}}' "$pg")"

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) restore $project: $*"; }

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

if [ -f "$source" ]; then
  file="$source"
else
  log "download $source"
  rclone copyto "$source" "$work/backup.tar.age"
  file="$work/backup.tar.age"
fi

if ! age -d -i "$AGE_IDENTITY" -o "$work/backup.tar" "$file"; then
  log "cannot decrypt — wrong AGE_IDENTITY or not a backup file; nothing was changed"
  exit 1
fi
tar -C "$work" -xf "$work/backup.tar"
echo "--- manifest"
cat "$work/manifest.txt"
echo "---"

case "$project" in
  prokom-prod | prokom-staging)
    if [ "${RESTORE_CONFIRM:-}" != "$project" ]; then
      read -r -p "This replaces the database and media of $project. Type the project name: " answer
      [ "$answer" = "$project" ] || { echo "Aborted." >&2; exit 1; }
    fi
    ;;
esac

if docker inspect "$app" >/dev/null 2>&1; then
  log "stop app"
  docker stop "$app" >/dev/null
fi

log "database $db (drop, create, restore)"
docker exec "$pg" dropdb -U prokom --if-exists --force "$db"
docker exec "$pg" createdb -U prokom "$db"
docker exec -i "$pg" pg_restore -U prokom -d "$db" --no-owner --exit-on-error <"$work/db.dump"

log "media volume $media_volume"
# uid 1000 = user `node` of the app image, which writes new uploads to this volume.
docker run --rm -i -v "$media_volume:/media" "$helper_image" \
  sh -c 'find /media -mindepth 1 -delete && tar -C /media -xf - && chown -R 1000:1000 /media' \
  <"$work/media.tar"

if docker inspect "$app" >/dev/null 2>&1; then
  log "start app, waiting for health"
  docker start "$app" >/dev/null
  for _ in $(seq 1 60); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$app")"
    [ "$status" = healthy ] && break
    sleep 3
  done
  [ "$status" = healthy ] || { log "app not healthy ($status) — see docker logs $app"; exit 1; }
fi

log "done — now run scripts/smoke.sh against this stack"
