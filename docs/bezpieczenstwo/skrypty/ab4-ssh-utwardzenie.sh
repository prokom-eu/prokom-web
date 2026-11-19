#!/usr/bin/env bash
# Audit AB4, S-14 — SSH hardening on the VPS. Run as root (sudo), from a session you keep open:
#   scp docs/bezpieczenstwo/skrypty/ab4-ssh-utwardzenie.sh prokom-vps:/tmp/
#   ssh -t prokom-vps "sudo bash /tmp/ab4-ssh-utwardzenie.sh; rm /tmp/ab4-ssh-utwardzenie.sh"
# What it does (nothing else):
#   1. 50-cloud-init.conf: PasswordAuthentication yes → no (today 10-prokom.conf wins only by file order),
#   2. 10-prokom.conf: + X11Forwarding no,
#   3. /root/.ssh/authorized_keys: the personal key moved to a backup (root login is off anyway),
#   4. `sshd -t` (config test) — on error everything is restored and sshd is NOT reloaded,
#   5. reload sshd (open sessions stay), print the effective settings.
# Afterwards, from a NEW terminal: `ssh prokom-vps true` must still work before closing this one.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo "run with sudo" >&2; exit 1; }

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup="/root/ssh-backup-$stamp"
mkdir -p "$backup"
cp -a /etc/ssh/sshd_config.d "$backup/"
[ -f /root/.ssh/authorized_keys ] && cp -a /root/.ssh/authorized_keys "$backup/root_authorized_keys"
echo "backup: $backup"

restore() {
  echo "restoring the previous SSH config" >&2
  rm -rf /etc/ssh/sshd_config.d && cp -a "$backup/sshd_config.d" /etc/ssh/sshd_config.d
  [ -f "$backup/root_authorized_keys" ] && cp -a "$backup/root_authorized_keys" /root/.ssh/authorized_keys
}

if [ -f /etc/ssh/sshd_config.d/50-cloud-init.conf ]; then
  sed -i 's/^\s*PasswordAuthentication\s\+yes/PasswordAuthentication no/' /etc/ssh/sshd_config.d/50-cloud-init.conf
fi
grep -q '^X11Forwarding' /etc/ssh/sshd_config.d/10-prokom.conf || echo 'X11Forwarding no' >>/etc/ssh/sshd_config.d/10-prokom.conf
if [ -f /root/.ssh/authorized_keys ]; then
  : >/root/.ssh/authorized_keys
fi

if ! sshd -t; then
  restore
  exit 1
fi
systemctl reload ssh
sshd -T | grep -Ei '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|x11forwarding|allowusers) '
echo "done — check from a NEW terminal: ssh prokom-vps true"
