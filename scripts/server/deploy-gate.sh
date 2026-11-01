#!/usr/bin/env bash
# Forced command of the pipeline's SSH key (S10b, runbook §2 „Klucz pipeline'u”). The key in
# GitHub can run only this, and only as `deploy staging <sha>`. It sends no files: the deploy
# files (docker/, scripts/, .env.example) come out of the image ghcr.io/prokom-eu/prokom-web:<sha>
# (/deploy, Dockerfile), which only the "Image" workflow builds from develop. So the key can only
# choose which develop image runs on staging.
# Installed OUTSIDE the deploy files, so a deploy never replaces it:
#   install -m 700 scripts/server/deploy-gate.sh ~/bin/prokom-deploy-gate
# authorized_keys line: restrict,command="/home/<admin>/bin/prokom-deploy-gate" ssh-ed25519 …
# By hand on the server (same path as the pipeline):
#   SSH_ORIGINAL_COMMAND="deploy staging <sha>" ~/bin/prokom-deploy-gate
set -euo pipefail

repo=/srv/prokom/prokom-web
image=ghcr.io/prokom-eu/prokom-web
read -r -a cmd <<<"${SSH_ORIGINAL_COMMAND:-}"
if [ ${#cmd[@]} -ne 3 ] || [ "${cmd[0]}" != deploy ] || [ "${cmd[1]}" != staging ] ||
  [[ ! "${cmd[2]}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "deploy-gate: only 'deploy staging <40-char sha>' is allowed" >&2
  exit 2
fi
sha="${cmd[2]}"

# One deploy at a time — the same lock as deploy.sh, held from the file swap to the end.
exec 9>"$repo/../.deploy.lock"
flock -w 600 9 || { echo "deploy-gate: another deploy still running" >&2; exit 1; }
export DEPLOY_LOCK_HELD=1

work="$(mktemp -d "$repo/../.deploy-files-XXXXXX")"
cid=''
cleanup() {
  if [ -n "$cid" ]; then docker rm -f "$cid" >/dev/null 2>&1 || true; fi
  rm -rf "$work"
}
trap cleanup EXIT

docker pull -q "$image:$sha" >/dev/null || { echo "deploy-gate: image $image:$sha not found" >&2; exit 1; }
cid="$(docker create "$image:$sha")"
if ! docker cp -q "$cid:/deploy" "$work/new" 2>/dev/null; then
  echo "deploy-gate: $image:$sha has no /deploy (image older than S10b) — deploy it by hand, runbook §2" >&2
  exit 1
fi
for p in docker scripts/deploy.sh scripts/smoke.sh .env.example; do
  [ -e "$work/new/$p" ] || { echo "deploy-gate: /deploy/$p missing in the image" >&2; exit 1; }
done

# Swap the deploy files with two renames (.env.* and everything else in the repo stay).
mkdir "$work/old"
for d in docker scripts; do
  [ -e "$repo/$d" ] && mv "$repo/$d" "$work/old/$d"
  mv "$work/new/$d" "$repo/$d"
done
cp "$work/new/.env.example" "$repo/.env.example"
echo "${sha:0:7}" >"$repo/REVISION" # version of the deploy files (deploys.log: running image)

cleanup
trap - EXIT
exec bash "$repo/scripts/deploy.sh" staging "$sha"
