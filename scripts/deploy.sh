#!/usr/bin/env bash
# Deploy one image (commit SHA from GHCR) to a stack, with automatic rollback (S10b, ADR-004).
# Usage: scripts/deploy.sh <staging|prod> <sha> [--fail-smoke-for-test]
#   run by the pipeline (deploy-staging.yml through scripts/server/deploy-gate.sh) or by hand.
# Steps: (prod: backup predeploy) → pull → APP_IMAGE_TAG in .env.<stack> → up -d app → healthy
# → smoke test on the app port. Any failure after the tag change: the previous tag back, app
# restarted and checked, exit 1. Only the app goes back — the database stays as the new version
# left it (migrations must be backward compatible, runbook §5; otherwise runbook §4B).
# --fail-smoke-for-test: pretend the smoke test failed (test of the rollback, runbook §2).
# Log: ../deploys.log (one line per deploy). Never prints the content of .env files.
set -euo pipefail

stack="${1:?usage: scripts/deploy.sh <staging|prod> <sha> [--fail-smoke-for-test]}"
sha="${2:?usage: scripts/deploy.sh <staging|prod> <sha> [--fail-smoke-for-test]}"
fail_smoke="${3:-}"
case "$stack" in staging | prod) ;; *) echo "Unknown stack: $stack" >&2; exit 2 ;; esac
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo "Not a full commit SHA: $sha" >&2; exit 2; }
case "$fail_smoke" in '' | --fail-smoke-for-test) ;; *) echo "Unknown option: $fail_smoke" >&2; exit 2 ;; esac

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
env_file=".env.$stack"
[ -f "$env_file" ] || { echo "Missing $root/$env_file" >&2; exit 2; }
image="ghcr.io/prokom-eu/prokom-web"
app="prokom-$stack-app-1"
compose=(docker compose --env-file "$env_file" -f docker/compose.prod.yml)
[ "$stack" = staging ] && compose+=(-f docker/compose.staging.yml)

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) deploy $stack: $*"; }
# One value from an env file, without sourcing it (the file holds secrets).
env_value() { sed -n "s/^$2=//p" "$1" | tail -1; }

# One deploy at a time per server (pipeline and a manual run must not overlap).
exec 9>"$root/../.deploy.lock"
flock -w 600 9 || { log "another deploy still running"; exit 1; }

prev="$(env_value "$env_file" APP_IMAGE_TAG)"
port="$(env_value "$env_file" APP_PORT)"
panel="$(env_value "$env_file" PANEL_HOST)"
upper="$(echo "$stack" | tr '[:lower:]' '[:upper:]')"
read -r -a hosts <<<"$(env_value .env.proxy "${upper}_SITE_HOSTS")"
[ -n "$port" ] && [ -n "$panel" ] && [ ${#hosts[@]} -gt 0 ] ||
  { log "APP_PORT / PANEL_HOST in $env_file or ${upper}_SITE_HOSTS in .env.proxy missing"; exit 2; }

record() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $stack ${prev:0:7} -> ${sha:0:7} $1" >>"$root/../deploys.log"; }

set_tag() {
  # sed -i keeps the file mode (600) and owner.
  sed -i "s/^APP_IMAGE_TAG=.*/APP_IMAGE_TAG=$1/" "$env_file"
  [ "$(env_value "$env_file" APP_IMAGE_TAG)" = "$1" ]
}

wait_healthy() {
  local status=''
  for _ in $(seq 1 60); do # migrations run at start: up to 5 minutes
    status="$(docker inspect -f '{{.State.Health.Status}}' "$app" 2>/dev/null || echo missing)"
    [ "$status" = healthy ] && return 0
    sleep 5
  done
  log "app not healthy ($status) — docker logs $app"
  return 1
}

smoke() {
  PANEL_HOST="$panel" bash scripts/smoke.sh "http://127.0.0.1:$port" "${hosts[@]}"
}

start() {
  "${compose[@]}" up -d app && wait_healthy
}

rollback() {
  log "FAILED — back to ${prev:0:7}"
  if set_tag "$prev" && start && smoke; then
    log "rollback done, ${prev:0:7} is running"
    record "FAILED, rolled back"
  else
    log "ROLLBACK FAILED — manual action: runbook §4 / §8"
    record "FAILED, rollback failed"
  fi
  exit 1
}

[[ "$prev" =~ ^[0-9a-f]{40}$ ]] || { log "APP_IMAGE_TAG in $env_file is not a SHA: '$prev'"; exit 2; }
log "${prev:0:7} -> ${sha:0:7}"

if [ "$stack" = prod ]; then
  log "backup before the deploy"
  scripts/backup.sh prod predeploy
fi

# Pull first: a missing image stops the deploy before anything changes.
docker pull -q "$image:$sha" >/dev/null || { log "image $image:$sha not found"; exit 1; }

set_tag "$sha" || rollback
start || rollback
if [ "$fail_smoke" = --fail-smoke-for-test ]; then
  log "smoke test failure forced (--fail-smoke-for-test)"
  rollback
fi
smoke || rollback

log "done, ${sha:0:7} is running"
record "ok"
# Old images fill the disk: keep the running one and anything from the last 14 days.
docker image prune -af --filter "until=336h" >/dev/null 2>&1 || true
