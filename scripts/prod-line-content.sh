#!/usr/bin/env bash
# Content of ONE line from its package into a production that is ALREADY live (ADR-027, runbook
# §3a „Kolejna linia później”). Run on Krystian's computer (Git Bash), in a checkout of exactly the
# commit production runs, without .env files (e.g. the prokom-web-tresc worktree):
#   SSH=/c/Windows/System32/OpenSSH/ssh.exe bash scripts/prod-line-content.sh biznes
#   ZAMIEN_STRONY=gopos,insert SSH=… bash scripts/prod-line-content.sh biznes   # §2a, once
#   SSH=… bash scripts/prod-line-content.sh prokom      # pro-kom.eu hub (`seed:prokom`, H7-2)
#   SSH=… bash scripts/prod-line-content.sh biznes-wpisy  # only the missing Biznes guide posts
#   SSH=… bash scripts/prod-line-content.sh instalacje-katalog  # catalog of the live Instalacje
# Unlike scripts/staging-content.sh there is no database swap: production keeps taking inquiries
# and panel edits of the live lines, and a swap would lose those of the import window. Instead the
# line's import (`pnpm seed:<line>`, idempotent, tenant-scoped; never touches users, tenants,
# inquiries) writes straight into the production database through an ssh tunnel, with
# SEED_KEEP_COMPANY_DATA=1 (the shared company data stays as edited in the production panel).
# Media: production's files are downloaded first (unique file names are chosen against them); the
# files the import adds go back — ALWAYS once the import has started, also after a failure, since
# the database already points at them. Nothing on the server is deleted. The deploy lock is held
# for the whole run. Refuses once the line has a production domain (its panel edits would be
# overwritten) unless PO_STARCIE=1.
# `biznes-wpisy` (ADR-027 „Rozstrzygnięcia 15.11”): only `seed:biznes-wpisy` — creates the
# Biznes guide posts that are missing, never changes an existing one and has no media, so it runs
# on the live line without PO_STARCIE and without the media download.
# `instalacje-katalog` (INST-K1/K2, ADR-029): only `seed:instalacje-katalog` — the catalog of the
# live prokominstalacje.pl (cards, photos, brands, salons) and the offer's missing solutions
# (created only). The rest of the line is not touched, so it runs on the live line; once the
# tenant has cards (a second run would overwrite their panel edits) only with PO_STARCIE=1.
set -euo pipefail
export MSYS_NO_PATHCONV=1

line="${1:-}"
case "$line" in
  # Lines with a package import into a live production: Biznes (K4 catalogue) and the pro-kom.eu
  # hub (texts, services, tools, help, plans, legal pages, 301 from the old pro-kom.eu).
  biznes | prokom) tenant="$line" seed="$line" media=1 ;;
  # Only adds posts (no media, no change to anything stored): safe on the live Biznes.
  biznes-wpisy) tenant=biznes seed=biznes-wpisy media=0 ;;
  # Catalog of the live Instalacje only (cards and photos): its pages and texts stay.
  instalacje-katalog) tenant=instalacje seed=instalacje-katalog media=1 ;;
  *) echo "usage: scripts/prod-line-content.sh biznes|prokom|biznes-wpisy|instalacje-katalog" >&2; exit 2 ;;
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
remote_sh() { "$SSH" -n "$server" "$@"; }
prod_sql() { remote_sh "docker exec $pg psql -U prokom -d prokom_prod -v ON_ERROR_STOP=1 -tAc \"$1\"" | tr -d '\r'; }
port_open() { (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; }

# 1. Same code as production: the import must match its schema and migrations.
tag="$(remote_sh "sed -n 's/^APP_IMAGE_TAG=//p' $remote/.env.prod" | tr -d '\r')"
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
  <(prod_sql 'select name from payload_migrations' | sort))"
[ -z "$pending" ] || { echo "Migrations not applied on production: $pending" >&2; exit 1; }
# A live line is edited in the production panel; the package would overwrite those edits.
live="$(prod_sql "select count(*) from tenants_domains d join tenants t on t.id = d._parent_id
  where t.slug = '$tenant' and d.environment = 'production'")"
if [ "$seed" = instalacje-katalog ]; then
  # The line is live, its catalog is new: the first import adds; a later one overwrites card edits.
  live="$(prod_sql "select count(*) from products p join tenants t on t.id = p.tenant_id
    where t.slug = '$tenant'")"
fi
if [ "$live" != 0 ] && [ "$media" = 1 ] && [ "${PO_STARCIE:-}" != 1 ]; then
  if [ "$seed" = instalacje-katalog ]; then
    echo "Instalacje already has $live catalog cards on production: the import would overwrite" >&2
    echo "their panel edits." >&2
  else
    echo "$line already has a production domain: the import would overwrite its panel edits." >&2
  fi
  echo "Only on Krystian's decision: PO_STARCIE=1 bash scripts/prod-line-content.sh $line" >&2
  exit 1
fi
# The import fills a tenant that exists (created by `pnpm seed` locally); on production the tenant
# and its site settings are made once in the panel — the seed never creates tenants there.
has_tenant="$(prod_sql "select count(*) from tenants t join site_settings s on s.tenant_id = t.id
  where t.slug = '$tenant'")"
if [ "$has_tenant" = 0 ]; then
  echo "Production has no tenant '$tenant' with site settings. First, in the production panel:" >&2
  echo "Strony → nowa (slug $tenant, linia $tenant, e-mail powiadomień), then Ustawienia strony of it." >&2
  exit 1
fi
! port_open || { echo "Port $port is taken (an old tunnel?) — close it first." >&2; exit 1; }
remote_sh "grep -q '^DATABASE_URL=.*@postgres:5432/prokom_prod' $remote/.env.prod" ||
  { echo "DATABASE_URL in .env.prod does not point at postgres:5432/prokom_prod." >&2; exit 1; }

if [ "$media" = 1 ]; then
  echo "Production ${tag:0:7}: the $line package goes straight into its database (other lines and"
  echo "the shared company data stay as they are)${ZAMIEN_STRONY:+; pages replaced: $ZAMIEN_STRONY}."
  [ "$seed" != instalacje-katalog ] ||
    echo "Instalacje is live: only its catalog and the missing offer solutions are added."
else
  [ -z "${ZAMIEN_STRONY:-}" ] || { echo "ZAMIEN_STRONY is for the biznes import, not $line." >&2; exit 1; }
  echo "Production ${tag:0:7}: only the missing Biznes guide posts are created, published at once"
  echo "on the live prokombiznes.pl. Existing posts and everything else stay as they are."
fi
read -r -p "Type prokom-prod to go on: " answer
[ "$answer" = prokom-prod ] || { echo "Aborted." >&2; exit 1; }

work="$(mktemp -d "${TMPDIR:-/tmp}/prod-line-content-XXXXXX")"
lock='' tunnel='' started=0 uploaded=0
[ "$media" = 1 ] || uploaded=1 # no media in this import: nothing to upload
# Media the import added: up to the server (additive), owned by the app's user. Called on success
# and from the exit trap — whatever happens after the import started, the files must get there.
upload_media() {
  [ "$started" = 1 ] && [ "$uploaded" = 0 ] || return 0
  uploaded=1
  (cd "$work/media" && find . -type f -newer "$work/before" -print0 | tar --null -cf "$work/new-media.tar" -T -)
  local files
  files="$(tar -tf "$work/new-media.tar" | grep -vc '/$' || true)"
  echo "   media added by the import: $files files"
  [ "$files" != 0 ] || return 0
  local helper inbox="$remote/../.prod-line-content"
  helper="$(remote_sh "docker inspect -f '{{.Config.Image}}' $pg")"
  remote_sh "mkdir -p $inbox && chmod 700 $inbox"
  "$SSH" "$server" "cat > $inbox/media.tar" <"$work/new-media.tar"
  # Unpacked as root without the archive's owners, then only these files given to the app's user.
  remote_sh "docker run --rm -v $volume:/m -v $inbox:/in:ro $helper sh -ec \
    'tar -C /m --no-same-owner -xf /in/media.tar; cd /m
     tar -tf /in/media.tar | while IFS= read -r f; do chown 1000:1000 \"\$f\"; done'"
}
cleanup() {
  local rc=$?
  set +e
  [ -z "$tunnel" ] || kill "$tunnel" 2>/dev/null
  if [ "$started" = 1 ] && [ "$uploaded" = 0 ]; then
    log "the import stopped half way — uploading the media it already made"
    upload_media || echo "   UPLOAD FAILED — the files are in $work/media (newer than $work/before)" >&2
  fi
  [ -z "$lock" ] || kill "$lock" 2>/dev/null
  if [ "$rc" -ne 0 ] && [ "$started" = 1 ] && [ "$media" = 0 ]; then
    echo "Failed after the import started: some posts may already be published on the live site" >&2
    echo "(the page cache was not cleared). Run again once the cause is fixed — it creates only" >&2
    echo "the missing posts." >&2
    rm -rf "$work"
  elif [ "$rc" -ne 0 ] && [ "$started" = 1 ]; then
    echo "Failed after the import started: $work kept. The line is partly updated (no production" >&2
    echo "domain, nobody sees it) — run again (idempotent) once the cause is fixed." >&2
  else
    rm -rf "$work"
  fi
  [ -s .env ] || rm -f .env # the empty one from below
  "$SSH" -n "$server" "rm -rf $remote/../.prod-line-content" >/dev/null 2>&1
  exit "$rc"
}
trap cleanup EXIT
: >.env # empty: payload then reads no .env from parent folders (removed in cleanup)

log "deploy lock (held until the end — no deploy can restart production meanwhile)"
# The server side waits while this ssh session lives: its parent (sshd) ends with the connection,
# so a killed or crashed run frees the lock within seconds.
"$SSH" -n "$server" "p=\$PPID; exec flock -n $remote/../.deploy.lock sh -c \
  'echo locked; while kill -0 \$1 2>/dev/null; do sleep 5; done' sh \$p" >"$work/lock.out" 2>&1 &
lock=$!
for _ in $(seq 1 20); do
  grep -q locked "$work/lock.out" 2>/dev/null && break
  kill -0 "$lock" 2>/dev/null || break
  sleep 1
done
grep -q locked "$work/lock.out" || { echo "A deploy is running — try again later." >&2; exit 1; }

log "dependencies of this commit (pnpm install --frozen-lockfile)"
pnpm install --frozen-lockfile --reporter=silent

log "backup of production (predeploy, to B2)"
remote_sh "cd $remote && scripts/backup.sh prod predeploy" | tail -1

mkdir "$work/media"
if [ "$media" = 1 ]; then
  log "download: media of production"
  helper="$(remote_sh "docker inspect -f '{{.Config.Image}}' $pg")"
  remote_sh "docker run --rm -v $volume:/m:ro $helper tar -C /m -cf - ." | tar -C "$work/media" -xf -
  touch "$work/before"
  sleep 1 # file times have a resolution of a second on some file systems
  echo "   media $(du -sh "$work/media" | cut -f1)"
fi

log "tunnel to the production database on 127.0.0.1:$port"
read -r -a ips <<<"$(remote_sh "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' $pg" | tr -d '\r')"
[ "${#ips[@]}" = 1 ] || { echo "postgres has ${#ips[@]} network addresses — expected one." >&2; exit 1; }
"$SSH" -n -N -o ExitOnForwardFailure=yes -L "127.0.0.1:$port:${ips[0]}:5432" "$server" &
tunnel=$!
for _ in $(seq 1 30); do
  port_open && break
  kill -0 "$tunnel" 2>/dev/null || break
  sleep 1
done
port_open && kill -0 "$tunnel" 2>/dev/null || { echo "The tunnel did not open." >&2; exit 1; }

log "import: $line"
# Values for this run only (see scripts/staging-content.sh): the empty .env stops payload's search,
# and variables of this shell that payload reads are unset. The database address is production's
# own (already encoded), with the tunnel instead of the `postgres` service; it is never printed.
url="$(remote_sh "sed -n 's/^DATABASE_URL=//p' $remote/.env.prod | tail -1" | tr -d '\r')"
url="${url%\"}" && url="${url#\"}"
DATABASE_URL="${url/@postgres:5432\//@127.0.0.1:$port/}"
unset url
export DATABASE_URL
MEDIA_DIR="$(cygpath -m "$work/media" 2>/dev/null || echo "$work/media")"
export MEDIA_DIR
PAYLOAD_SECRET="$(openssl rand -hex 32)"
export PAYLOAD_SECRET
export PANEL_HOST=panel.prokombiznes.pl SITE_ENV=production NODE_ENV=development
export SMTP_HOST=127.0.0.1 SMTP_PORT=1025 MAIL_FROM_ADDRESS=seed@example.invalid
export SEED_KEEP_COMPANY_DATA=1
unset MAIL_SENDERS SMTP_USER SMTP_PASS SMTP_PASS_PROKOM SMTP_PASS_BIZNES SMTP_PASS_SOFTWARE \
  SMTP_PASS_INSTALACJE SENTRY_DSN SEED_GALLERY_LIMIT UMAMI_URL UMAMI_WEBSITES \
  PAYLOAD_DROP_DATABASE PAYLOAD_MIGRATING PAYLOAD_FORCE_DRIZZLE_PUSH
export ZAMIEN_STRONY="${ZAMIEN_STRONY:-}" # Biznes only (§2a); the hub import ignores it
started=1
pnpm "seed:$seed"
kill "$tunnel" 2>/dev/null || true
tunnel=''

if [ "$media" = 1 ]; then
log "upload: media the import added"
upload_media

log "check: every media file of $line and every brand logo is on the server"
tenant_files="select filename from media where tenant_id = (select id from tenants where slug = '$tenant')"
for size in small medium large; do tenant_files+=" union select sizes_${size}_filename from media where tenant_id = (select id from tenants where slug = '$tenant')"; done
missing="$(comm -23 \
  <(prod_sql "select 'media/' || f from ($tenant_files) x(f) where f is not null
    union select 'partners/' || filename from partners where filename is not null
    union select 'partners/' || sizes_logo_filename from partners where sizes_logo_filename is not null" | sort -u) \
  <(remote_sh "docker run --rm -v $volume:/m:ro $helper sh -c 'cd /m && find media partners -type f'" | tr -d '\r' | sort -u))"
if [ -n "$missing" ]; then
  echo "Files the database points at but the server lacks ($(wc -l <<<"$missing")):" >&2
  head -20 <<<"$missing" >&2
  exit 1
fi
echo "   all files present"
fi

log "app cache: fetch-cache cleared (the in-memory part expires on its own — no restart)"
remote_sh "docker exec $app sh -c 'rm -rf /app/.next/cache/fetch-cache/*'"
remote_sh "echo \"\$(date -u +%Y-%m-%dT%H:%M:%SZ) prod content of $seed imported at ${tag:0:7}\" >>$remote/../deploys.log"
if [ "$seed" = instalacje-katalog ]; then
  log "done — check https://prokominstalacje.pl/oferta, a salon (/marki/dahua) and the home section"
  log "„Sprzęt i marki”; the rail entry „Sprzęt” goes in by hand in the panel (runbook §3a)"
elif [ "$media" = 1 ]; then
  log "done — next: runbook §3a (domain in the panel, smoke, porownaj-tresc --po-imporcie, §3a.1)"
else
  log "done — check https://prokombiznes.pl/aktualnosci (new posts, home page news)"
fi
