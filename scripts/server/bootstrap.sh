#!/usr/bin/env bash
# One-time hardening of a fresh Ubuntu 24.04 VPS for prokom-web (S10, ADR-019, runbook §1).
# Run as root, copied to the server with scp (the repo is private, so it is not cloned yet).
#
#   bash bootstrap.sh <admin-user>              # phase 1: packages, user, firewall, Docker, swap
#   bash bootstrap.sh --lock-ssh <admin-user>   # phase 2: key-only SSH, no root login
#
# Run phase 2 only after logging in as <admin-user> with your key from a SECOND terminal
# (and checking `sudo -v` there) — keep the root session open until that works.
# Safe to run again: every step checks the current state first.
set -euo pipefail

SWAP_SIZE="${SWAP_SIZE:-4G}"

die() { echo "bootstrap: $*" >&2; exit 1; }
step() { echo; echo "== $*"; }

lock_ssh=0
if [ "${1:-}" = "--lock-ssh" ]; then lock_ssh=1; shift; fi
user="${1:-}"
[ -n "$user" ] || die "usage: bash bootstrap.sh [--lock-ssh] <admin-user>"
[[ "$user" =~ ^[a-z][a-z0-9_-]{1,31}$ ]] || die "invalid user name: $user"
[ "$(id -u)" -eq 0 ] || die "run as root"
# shellcheck source=/dev/null
. /etc/os-release
[ "${ID:-}" = ubuntu ] && [ "${VERSION_ID:-}" = "24.04" ] || die "expected Ubuntu 24.04, got ${PRETTY_NAME:-unknown}"

# --- Phase 2: SSH lockdown --------------------------------------------------------------
if [ "$lock_ssh" -eq 1 ]; then
  id "$user" >/dev/null 2>&1 || die "user $user does not exist — run phase 1 first"
  [ -s "/home/$user/.ssh/authorized_keys" ] || die "/home/$user/.ssh/authorized_keys is empty"
  step "SSH: keys only, no root, only $user"
  # sshd uses the FIRST value it reads and includes sshd_config.d/*.conf in lexical order,
  # so 10-… wins over 50-cloud-init.conf (which may enable passwords).
  cat >/etc/ssh/sshd_config.d/10-prokom.conf <<EOF
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers $user
EOF
  sshd -t || { rm -f /etc/ssh/sshd_config.d/10-prokom.conf; die "sshd config invalid — reverted"; }
  systemctl reload ssh
  sshd -T | grep -E '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|allowusers) '
  echo
  echo "Done. Check from a NEW terminal: ssh $user@<IP> works, ssh root@<IP> is refused."
  exit 0
fi

# --- Phase 1 ----------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive

step "System update and base packages"
apt-get update -q
apt-get -y -q upgrade
apt-get -y -q install ca-certificates curl git ufw fail2ban python3-systemd \
  unattended-upgrades age rclone

step "Admin user $user (sudo, docker)"
if ! id "$user" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$user"
fi
usermod -aG sudo "$user"
install -d -m 700 -o "$user" -g "$user" "/home/$user/.ssh"
keys="/home/$user/.ssh/authorized_keys"
if [ ! -s "$keys" ] && [ -s /root/.ssh/authorized_keys ]; then
  # The provider put your key on root — reuse it for the admin user.
  install -m 600 -o "$user" -g "$user" /root/.ssh/authorized_keys "$keys"
fi
[ -s "$keys" ] || echo "WARNING: $keys is empty — add your public key before phase 2."
if passwd -S "$user" | awk '{exit !($2 == "L" || $2 == "NP")}'; then
  echo "Set a password for sudo (store it in the password manager: \"VPS — webh.pl\"):"
  passwd "$user"
fi

step "Firewall (ufw): SSH, HTTP, HTTPS"
# Docker publishes ports past ufw — that is why compose binds app ports to 127.0.0.1
# and only Nginx (80/443) is public.
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

step "fail2ban (sshd)"
cat >/etc/fail2ban/jail.d/prokom.local <<'EOF'
[sshd]
enabled = true
backend = systemd
maxretry = 5
findtime = 10m
bantime = 1h
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

step "Automatic security updates (no automatic reboot)"
cat >/etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
systemctl enable --now unattended-upgrades

step "Swap $SWAP_SIZE"
if ! swapon --show=NAME --noheadings | grep -q '^/swapfile$'; then
  [ -f /swapfile ] || { fallocate -l "$SWAP_SIZE" /swapfile; chmod 600 /swapfile; mkswap /swapfile; }
  swapon /swapfile
fi
grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >>/etc/fstab
echo 'vm.swappiness=10' >/etc/sysctl.d/90-prokom-swap.conf
sysctl -q --system

step "Docker Engine (official repository)"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    >/etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get -y -q install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
# Default log rotation for containers without their own (compose services set 5 × 10 MB too).
if [ ! -f /etc/docker/daemon.json ]; then
  cat >/etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "5" }
}
EOF
  systemctl restart docker
fi
systemctl enable --now docker
# Membership in `docker` is root-equivalent — only the admin user gets it.
usermod -aG docker "$user"

step "Check"
ufw status verbose | head -12
fail2ban-client status sshd | head -4
swapon --show
docker version --format 'docker {{.Server.Version}}'
docker compose version
timedatectl show -p Timezone --value  # stays UTC: backups and cron use UTC (runbook §1)
echo
echo "Phase 1 done. Next, from a SECOND terminal on your computer:"
echo "  ssh $user@<IP>   then   sudo -v   and   docker run --rm hello-world"
echo "When both work: bash bootstrap.sh --lock-ssh $user  (here, as root)."
