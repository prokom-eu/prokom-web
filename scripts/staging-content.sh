#!/usr/bin/env bash
# Refresh the CONTENT of staging from the line packages (runbook §2a). Run on Krystian's computer
# (Git Bash), in a checkout of exactly the commit that runs on staging:
#   bash scripts/staging-content.sh            # all three lines
#   bash scripts/staging-content.sh instalacje # only some: biznes software instalacje
# Why here and not on the server: the image has no `seed/` packages or `docs/design` photos, and
# the seed is blocked there on purpose. So: staging DB + media → a throwaway local Postgres →
# the line imports (`pnpm seed:<line>`, idempotent; they read tenants, never touch users,
# tenants or inquiries) → back to staging. Accounts, inquiries and panel settings (Strony →
# e-mail powiadomień) come back with the dump; catalog fields from the Biznes package win over
# panel edits, as they do locally.
# Steps on the server: backup (predeploy, to B2) → app stopped ~1–2 min → DB and media replaced
# → app started → smoke test. Inquiries sent in between are lost (the backup keeps them).
# The local copy holds test inquiries and password hashes: removed at the end, also on failure.
set -euo pipefail
export MSYS_NO_PATHCONV=1

lines=("$@")
[ ${#lines[@]} -gt 0 ] || lines=(biznes software instalacje)
for l in "${lines[@]}"; do
  case "$l" in biznes | software | instalacje) ;; *) echo "Unknown line: $l" >&2; exit 2 ;; esac
done

SSH="${SSH:-ssh}" # Git Bash on Windows: SSH=/c/Windows/System32/OpenSSH/ssh.exe (key in the agent)
server="${SERVER:-prokom-vps}"
remote=/srv/prokom/prokom-web
pg_image=postgres:17.11-alpine # the staging stack's image (docker/compose.prod.yml)
port=54331
pg=prokom-stagingcontent-pg
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

log() { echo "== $*"; }
remote_sh() { "$SSH" "$server" "$@"; }

# 1. Same code as staging: the imports must match its schema and migrations.
tag="$(remote_sh "sed -n 's/^APP_IMAGE_TAG=//p' $remote/.env.staging")"
head="$(git rev-parse HEAD)"
if [ "$tag" != "$head" ]; then
  echo "Staging runs ${tag:0:7}, this checkout is ${head:0:7}." >&2
  echo "First: git fetch && git switch --detach $tag   (then run this again)" >&2
  exit 1
fi
[ -z "$(git status --porcelain -- src seed docs/design)" ] ||
  { echo "Uncommitted changes in src/, seed/ or docs/design/ — commit or stash them first." >&2; exit 1; }

work="$(mktemp -d "${TMPDIR:-/tmp}/staging-content-XXXXXX")"
cleanup() {
  docker rm -f "$pg" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

log "backup of staging (predeploy, to B2)"
remote_sh "cd $remote && scripts/backup.sh staging predeploy" | tail -1

log "download: database and media of staging"
remote_sh "docker exec prokom-staging-postgres-1 pg_dump -U prokom -d prokom_staging -Fc" >"$work/db.dump"
remote_sh "docker run --rm -v prokom-staging_media:/m:ro $pg_image tar -C /m -cf - ." >"$work/media.tar"
mkdir "$work/media"
tar -C "$work/media" -xf "$work/media.tar"
echo "   db $(du -h "$work/db.dump" | cut -f1), media $(du -sh "$work/media" | cut -f1)"

log "throwaway local Postgres on 127.0.0.1:$port"
docker rm -f "$pg" >/dev/null 2>&1 || true
pass="$(openssl rand -hex 16)"
docker run -d --name "$pg" -e POSTGRES_USER=prokom -e POSTGRES_PASSWORD="$pass" \
  -e POSTGRES_DB=prokom_staging -p "127.0.0.1:$port:5432" "$pg_image" >/dev/null
for _ in $(seq 1 30); do docker exec "$pg" pg_isready -U prokom -d prokom_staging >/dev/null 2>&1 && break; sleep 1; done
docker exec -i "$pg" pg_restore -U prokom -d prokom_staging --no-owner --exit-on-error <"$work/db.dump"

log "line imports: ${lines[*]}"
# Values for the throwaway run only; no .env of this folder is read for them (exported first).
export DATABASE_URL="postgresql://prokom:$pass@127.0.0.1:$port/prokom_staging"
# Node on Windows needs C:/… paths, not Git Bash /tmp/….
MEDIA_DIR="$(cygpath -m "$work/media" 2>/dev/null || echo "$work/media")"
export MEDIA_DIR
PAYLOAD_SECRET="$(openssl rand -hex 32)"
export PAYLOAD_SECRET
export PANEL_HOST=panel.staging.prokombiznes.pl SITE_ENV=staging NODE_ENV=development
export SMTP_HOST=127.0.0.1 SMTP_PORT=1025 MAIL_FROM_ADDRESS=seed@example.invalid
unset MAIL_SENDERS SMTP_USER SMTP_PASS SMTP_PASS_BIZNES SMTP_PASS_SOFTWARE SMTP_PASS_INSTALACJE SENTRY_DSN
pnpm payload migrate
for l in "${lines[@]}"; do pnpm "seed:$l"; done

log "upload: database and media back to staging"
docker exec "$pg" pg_dump -U prokom -d prokom_staging -Fc >"$work/new.dump"
docker exec -i "$pg" pg_restore --list >/dev/null <"$work/new.dump" # a dump pg_restore can read
tar -C "$work/media" -cf "$work/new-media.tar" .
remote_sh "mkdir -p $remote/../.staging-content && chmod 700 $remote/../.staging-content"
remote_sh "cat > $remote/../.staging-content/db.dump" <"$work/new.dump"
remote_sh "cat > $remote/../.staging-content/media.tar" <"$work/new-media.tar"

log "replace on staging (app stopped for a moment)"
remote_sh "set -e; d=$remote/../.staging-content; trap 'rm -rf \$d' EXIT
  exec 9>$remote/../.deploy.lock; flock -w 600 9
  docker stop prokom-staging-app-1 >/dev/null
  docker exec prokom-staging-postgres-1 dropdb -U prokom --if-exists --force prokom_staging
  docker exec prokom-staging-postgres-1 createdb -U prokom prokom_staging
  docker exec -i prokom-staging-postgres-1 pg_restore -U prokom -d prokom_staging --no-owner --exit-on-error < \$d/db.dump
  # node (uid 1000) in the app container owns the uploads
  docker run --rm -i -v prokom-staging_media:/m $pg_image sh -c 'find /m -mindepth 1 -delete && tar -C /m -xf - && chown -R 1000:1000 /m' < \$d/media.tar
  docker start prokom-staging-app-1 >/dev/null
  for i in \$(seq 1 60); do s=\$(docker inspect -f '{{.State.Health.Status}}' prokom-staging-app-1); [ \"\$s\" = healthy ] && break; sleep 5; done
  echo \"   app: \$s\"
  cd $remote
  hosts=\$(sed -n 's/^STAGING_SITE_HOSTS=//p' .env.proxy)
  PANEL_HOST=\$(sed -n 's/^PANEL_HOST=//p' .env.staging) bash scripts/smoke.sh http://127.0.0.1:\$(sed -n 's/^APP_PORT=//p' .env.staging) \$hosts | tail -1
  echo \"\$(date -u +%Y-%m-%dT%H:%M:%SZ) staging content refreshed (${lines[*]}) at ${head:0:7}\" >> $remote/../deploys.log"

log "done — local copy removed"
