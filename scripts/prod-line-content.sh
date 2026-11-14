#!/usr/bin/env bash
# Content of ONE line from its package into a production that is ALREADY live (ADR-027, runbook
# §3a „Kolejna linia później”). Run on Krystian's computer (Git Bash), in a checkout of exactly the
# commit production runs, without .env files (e.g. the prokom-web-tresc worktree):
#   SSH=/c/Windows/System32/OpenSSH/ssh.exe bash scripts/prod-line-content.sh biznes
#   ZAMIEN_STRONY=gopos,insert SSH=… bash scripts/prod-line-content.sh biznes   # §2a, once
# Unlike scripts/staging-content.sh there is no database swap: production keeps taking inquiries
# and panel edits of the live lines, and a swap would lose those of the import window. Instead the
# line's import (`pnpm seed:biznes`, idempotent, tenant-scoped; never touches users, tenants,
# inquiries) writes straight into the production database through an ssh tunnel, with
# SEED_KEEP_COMPANY_DATA=1 (the shared company data stays as edited in the production panel).
# Media: production's files are downloaded first (unique file names are chosen against them), the
# files the import adds or replaces go back; nothing on the server is deleted.
# Before: backup (predeploy, to B2). A failure half way leaves part of the line updated — the line
# is not live yet (no production domain), the import is idempotent: run it again, or restore.
set -euo pipefail
export MSYS_NO_PATHCONV=1

line="${1:-}"
case "$line" in
  biznes) ;; # the only line with a package import into a live production so far
  *) echo "usage: scripts/prod-line-content.sh biznes" >&2; exit 2 ;;
esac

SSH="${SSH:-ssh}" # Git Bash on Windows: SSH=/c/Windows/System32/OpenSSH/ssh.exe (key in the agent)
server="${SERVER:-prokom-vps}"
remote=/srv/prokom/prokom-web
pg=prokom-prod-postgres-1
app=prokom-prod-app-1
volume=prokom-prod_media
port=54332
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

log() { echo "== $*"; }
remote_sh() { "$SSH" "$server" "$@"; }

# 1. Same code as production: the import must match its schema and migrations.
tag="$(remote_sh "sed -n 's/^APP_IMAGE_TAG=//p' $remote/.env.prod")"
code=(src seed docs/design package.json pnpm-lock.yaml)
git cat-file -e "$tag^{commit}" 2>/dev/null || git fetch -q origin
if ! git diff --quiet "$tag" -- "${code[@]}"; then
  echo "This checkout differs from the production commit ${tag:0:7} in src/, seed/, docs/design or" >&2
  echo "dependencies. First: git fetch && git switch --detach $tag   (then run this again)" >&2
  exit 1
fi
for f in .env .env.local .env.development .env.development.local; do
  [ ! -e "$f" ] || { echo "This folder has $f — run from a checkout without .env files." >&2; exit 1; }
done
[ -z "$(git status --porcelain -- "${code[@]}")" ] ||
  { echo "Uncommitted changes in ${code[*]} — commit or stash them first." >&2; exit 1; }
# Every migration of this code must already be applied on production (the app runs them on start).
pending="$(comm -23 \
  <(find src/migrations -maxdepth 1 -name '20*.ts' -printf '%f\n' | sed 's/\.ts$//' | sort) \
  <(remote_sh "docker exec $pg psql -U prokom -d prokom_prod -tAc 'select name from payload_migrations'" | tr -d '\r' | sort))"
[ -z "$pending" ] || { echo "Migrations not applied on production: $pending" >&2; exit 1; }

echo "Production ${tag:0:7}: the $line package goes straight into its database (other lines and"
echo "the shared company data stay as they are)${ZAMIEN_STRONY:+; pages replaced: $ZAMIEN_STRONY}."
read -r -p "Type prokom-prod to go on: " answer
[ "$answer" = prokom-prod ] || { echo "Aborted." >&2; exit 1; }

work="$(mktemp -d "${TMPDIR:-/tmp}/prod-line-content-XXXXXX")"
tunnel=''
cleanup() {
  [ -z "$tunnel" ] || kill "$tunnel" 2>/dev/null || true
  rm -rf "$work"
  [ -s .env ] || rm -f .env # the empty one from below
  remote_sh "rm -rf $remote/../.prod-line-content" >/dev/null 2>&1 || true
}
trap cleanup EXIT
: >.env # empty: payload then reads no .env from parent folders (removed in cleanup)

log "dependencies of this commit (pnpm install --frozen-lockfile)"
pnpm install --frozen-lockfile --reporter=silent

log "backup of production (predeploy, to B2)"
remote_sh "cd $remote && scripts/backup.sh prod predeploy" | tail -1

log "download: media of production"
mkdir "$work/media"
remote_sh "docker run --rm -v $volume:/m:ro $(remote_sh "docker inspect -f '{{.Config.Image}}' $pg") tar -C /m -cf - ." |
  tar -C "$work/media" -xf -
touch "$work/before"
sleep 1 # file times have a resolution of a second on some file systems
echo "   media $(du -sh "$work/media" | cut -f1)"

log "tunnel to the production database on 127.0.0.1:$port"
pg_ip="$(remote_sh "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $pg")"
"$SSH" -N -o ExitOnForwardFailure=yes -L "127.0.0.1:$port:$pg_ip:5432" "$server" &
tunnel=$!
ready=0
for _ in $(seq 1 30); do
  (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null && { ready=1; break; }
  sleep 1
done
[ "$ready" = 1 ] || { echo "The tunnel did not open." >&2; exit 1; }

log "import: $line"
# Values for this run only (see scripts/staging-content.sh): the empty .env stops payload's search.
# The password is read on the server and never printed.
pass="$(remote_sh "sed -n 's/^POSTGRES_PASSWORD=//p' $remote/.env.prod | tail -1")"
DATABASE_URL="postgresql://prokom:$pass@127.0.0.1:$port/prokom_prod"
unset pass
export DATABASE_URL
MEDIA_DIR="$(cygpath -m "$work/media" 2>/dev/null || echo "$work/media")"
export MEDIA_DIR
PAYLOAD_SECRET="$(openssl rand -hex 32)"
export PAYLOAD_SECRET
export PANEL_HOST=panel.prokombiznes.pl SITE_ENV=production NODE_ENV=development
export SMTP_HOST=127.0.0.1 SMTP_PORT=1025 MAIL_FROM_ADDRESS=seed@example.invalid
export SEED_KEEP_COMPANY_DATA=1
unset MAIL_SENDERS SMTP_USER SMTP_PASS SMTP_PASS_PROKOM SMTP_PASS_BIZNES SMTP_PASS_SOFTWARE \
  SMTP_PASS_INSTALACJE SENTRY_DSN SEED_GALLERY_LIMIT UMAMI_URL UMAMI_WEBSITES
export ZAMIEN_STRONY="${ZAMIEN_STRONY:-}"
pnpm "seed:$line"
kill "$tunnel" 2>/dev/null || true
tunnel=''

log "upload: media the import added or replaced"
(cd "$work/media" && find . -type f -newer "$work/before" -print0 | tar --null -cf "$work/new-media.tar" -T -)
echo "   $(tar -tf "$work/new-media.tar" | wc -l | tr -d ' ') files"
[ "$(remote_sh "sed -n 's/^APP_IMAGE_TAG=//p' $remote/.env.prod")" = "$tag" ] ||
  { echo "Production changed its image during the import — media not uploaded, run again." >&2; exit 1; }
remote_sh "mkdir -p $remote/../.prod-line-content && chmod 700 $remote/../.prod-line-content"
remote_sh "cat > $remote/../.prod-line-content/media.tar" <"$work/new-media.tar"
helper="$(remote_sh "docker inspect -f '{{.Config.Image}}' $pg")"
remote_sh "docker run --rm -i -v $volume:/m $helper sh -ec 'tar -C /m -xf - && chown -R 1000:1000 /m' \
  <$remote/../.prod-line-content/media.tar"

log "app cache (fetch-cache) cleared — no restart"
remote_sh "docker exec $app sh -c 'rm -rf /app/.next/cache/fetch-cache/*'"
remote_sh "echo \"\$(date -u +%Y-%m-%dT%H:%M:%SZ) prod content of $line imported at ${tag:0:7}\" >>$remote/../deploys.log"
log "done — next: runbook §3a (domain in the panel, smoke, porownaj-tresc --po-imporcie, §3a.1)"
