#!/usr/bin/env bash
# Forced command of the pipeline's SSH key (S10b, runbook §1.9). The key in GitHub can run only
# this, with the command `deploy staging <sha>` and the deploy files (tar of docker/, scripts/,
# .env.example from that commit) on stdin. Installed OUTSIDE the deploy files, so a deploy never
# replaces it:
#   install -m 700 scripts/server/deploy-gate.sh ~/bin/prokom-deploy-gate
# authorized_keys line: restrict,command="/home/<admin>/bin/prokom-deploy-gate" ssh-ed25519 …
set -euo pipefail

repo=/srv/prokom/prokom-web
read -r -a cmd <<<"${SSH_ORIGINAL_COMMAND:-}"
if [ ${#cmd[@]} -ne 3 ] || [ "${cmd[0]}" != deploy ] || [ "${cmd[1]}" != staging ] ||
  [[ ! "${cmd[2]}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "deploy-gate: only 'deploy staging <40-char sha>' is allowed" >&2
  exit 2
fi
sha="${cmd[2]}"

work="$(mktemp -d "$repo/../.deploy-files-XXXXXX")"
trap 'rm -rf "$work"' EXIT
# At most 20 MB — the deploy files are a few hundred KB.
head -c 20000000 >"$work/files.tar"
# Only these paths, no absolute paths, no `..`, no links (a link could point outside the repo).
if tar -tvf "$work/files.tar" | grep -qvE '^[-d]'; then
  echo "deploy-gate: links or special files in the archive" >&2
  exit 2
fi
if tar -tf "$work/files.tar" | grep -qvE '^(docker|scripts)(/|$)|^\.env\.example$' ||
  tar -tf "$work/files.tar" | grep -qE '(^|/)\.\.(/|$)'; then
  echo "deploy-gate: unexpected paths in the archive" >&2
  exit 2
fi
mkdir "$work/files"
tar -xf "$work/files.tar" -C "$work/files" --no-same-owner --no-same-permissions
[ -f "$work/files/scripts/deploy.sh" ] || { echo "deploy-gate: scripts/deploy.sh missing" >&2; exit 2; }

# Replace the deploy files (.env.* and everything else in the repo directory stay).
rm -rf "$repo/docker" "$repo/scripts"
cp -R "$work/files/." "$repo/"
echo "${sha:0:7}" >"$repo/REVISION"

exec bash "$repo/scripts/deploy.sh" staging "$sha"
