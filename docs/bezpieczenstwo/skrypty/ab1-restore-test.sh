#!/usr/bin/env bash
# AB1 security audit — restore test of the newest OFF-SITE production backup of each stack
# (prokom-web, gaming, tech) into a THROWAWAY postgres container with no network.
# Production is only read (row counts). Nothing else on the server changes; the container, the
# decrypted files and the private key are removed at the end (also on error / Ctrl+C).
# Output: per stack — file, download+decrypt+restore time, tables and rows restored vs live,
# tables whose counts differ (names and numbers only), media file count. No personal data.
set -euo pipefail

REMOTE="offsite:prokom-backups-r7k2"
WORK="$(mktemp -d /srv/prokom/backups/.ab1-restore-XXXXXX)" # next to backups: holds personal data
KEY="$(mktemp /dev/shm/ab1-age-XXXXXX)"                     # RAM only
chmod 600 "$KEY"
CONTAINERS=()
cleanup() {
  for c in "${CONTAINERS[@]:-}"; do [ -n "$c" ] && docker rm -f "$c" >/dev/null 2>&1 || true; done
  shred -u "$KEY" 2>/dev/null || rm -f "$KEY"
  rm -rf "$WORK"
  echo "cleanup: container(s), decrypted files and key removed"
}
trap cleanup EXIT INT TERM

echo "Paste the PRIVATE age key (line starting AGE-SECRET-KEY-1…) and press Enter. Input is hidden."
read -rs line
printf '%s\n' "$line" >"$KEY"
unset line
grep -q '^AGE-SECRET-KEY-1' "$KEY" || { echo "that does not look like an age private key"; exit 1; }

# exact row count of every public table, as "table count" lines
COUNT_SQL="select table_name || ' ' || (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', table_schema, table_name), false, true, '')))[1]::text from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1"

test_stack() { # name prefix live_container live_db
  local name=$1 prefix=$2 live=$3 db=$4
  echo
  echo "================ $name"
  local file
  file="$(rclone lsf "$REMOTE/$prefix/daily/" | sort | tail -1)"
  [ -n "$file" ] || { echo "NO OFF-SITE BACKUP in $prefix/daily"; return; }
  echo "backup: $prefix/daily/$file"
  local t0 t1 t2 t3
  t0=$(date +%s)
  rclone copyto "$REMOTE/$prefix/daily/$file" "$WORK/$name.tar.age"
  t1=$(date +%s)
  mkdir -p "$WORK/$name"
  age -d -i "$KEY" "$WORK/$name.tar.age" | tar -C "$WORK/$name" -xf -
  rm -f "$WORK/$name.tar.age"
  t2=$(date +%s)
  grep -E '^(stack|created|database|app_image)=' "$WORK/$name/manifest.txt" || true

  local image c
  image="$(docker inspect -f '{{.Config.Image}}' "$live")"
  c="ab1-restore-$name"
  CONTAINERS+=("$c")
  docker run -d --name "$c" --network none -e POSTGRES_USER=prokom \
    -e POSTGRES_PASSWORD="$(head -c 18 /dev/urandom | base64)" -e POSTGRES_DB="$db" "$image" >/dev/null
  for _ in $(seq 60); do docker exec "$c" pg_isready -U prokom -d "$db" >/dev/null 2>&1 && break; sleep 1; done
  docker exec -i "$c" pg_restore -U prokom -d "$db" --no-owner --no-privileges --exit-on-error <"$WORK/$name/db.dump"
  t3=$(date +%s)
  echo "time: download $((t1 - t0)) s, decrypt $((t2 - t1)) s, restore $((t3 - t2)) s, total $((t3 - t0)) s"

  docker exec "$c" psql -U prokom -d "$db" -tAc "$COUNT_SQL" | sort >"$WORK/$name.restored"
  docker exec "$live" psql -U prokom -d "$db" -tAc "$COUNT_SQL" | sort >"$WORK/$name.live"
  echo "restored: $(wc -l <"$WORK/$name.restored") tables, $(awk '{s+=$2} END{print s+0}' "$WORK/$name.restored") rows"
  echo "live now: $(wc -l <"$WORK/$name.live") tables, $(awk '{s+=$2} END{print s+0}' "$WORK/$name.live") rows"
  echo "tables that differ (table restored live) — changes since the backup are expected:"
  join -a1 -a2 -e MISSING -o 0,1.2,2.2 "$WORK/$name.restored" "$WORK/$name.live" | awk '$2!=$3' | head -20
  [ -f "$WORK/$name/media.tar" ] && echo "media files in backup: $(tar -tf "$WORK/$name/media.tar" | grep -vc '/$')"
  docker rm -f "$c" >/dev/null
  rm -rf "$WORK/$name" "$WORK/$name.restored" "$WORK/$name.live"
}

test_stack web prod prokom-prod-postgres-1 prokom_prod
test_stack gaming gaming-prod prokom-gaming-prod-postgres-1 prokom_gaming_prod
test_stack tech tech-prod prokom-tech-prod-db-1 prokom_tech_prod
echo
echo "== DONE"
