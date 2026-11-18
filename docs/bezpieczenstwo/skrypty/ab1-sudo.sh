#!/usr/bin/env bash
# AB1 security audit — READ-ONLY checks that need root. Changes nothing on the server.
# Prints settings and counts only; no secret values.
set -u
echo "== sshd -T (effective)"
sshd -T 2>/dev/null | grep -Ei '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication|allowusers|maxauthtries|x11forwarding|port|permitemptypasswords|authenticationmethods) '
echo "== 50-cloud-init.conf"; cat /etc/ssh/sshd_config.d/50-cloud-init.conf
echo "== root authorized_keys"; [ -f /root/.ssh/authorized_keys ] && awk '{print $1, $NF}' /root/.ssh/authorized_keys || echo "none"
echo "== sudoers (non-comment)"; grep -hvE '^\s*(#|$)' /etc/sudoers /etc/sudoers.d/* 2>/dev/null
echo "== ufw"; ufw status verbose
echo "== fail2ban sshd"; fail2ban-client status sshd
echo "== failed logins (btmp) last 7 days: count, top sources"
lastb -s -7days 2>/dev/null | awk 'NF>3{print $3}' | sort | uniq -c | sort -rn | head -5
lastb -s -7days 2>/dev/null | grep -c .
echo "== unattended-upgrades log (last runs)"
grep -hE 'Packages that will be upgraded|All upgrades installed|No packages found|ERROR' /var/log/unattended-upgrades/unattended-upgrades.log 2>/dev/null | tail -6
echo "== docker daemon: userns / live-restore / icc"
docker info --format 'userns={{.SecurityOptions}} live-restore={{.LiveRestoreEnabled}}' 2>/dev/null
echo "== nftables DOCKER chains bypassing ufw (published ports)"
iptables -t nat -S DOCKER 2>/dev/null | grep -- '--dport' | sed -E 's/-j DNAT --to-destination .*//' | head -20
echo "== listening sockets with processes"
ss -tlnpH | awk '{print $4, $6}' | sed -E 's/users:\(\("([^"]+)".*/\1/' | sort -u
echo "== letsencrypt renewal configs"
ls /var/lib/docker/volumes/prokom-proxy_letsencrypt/_data/renewal/ 2>/dev/null
echo "== END"
