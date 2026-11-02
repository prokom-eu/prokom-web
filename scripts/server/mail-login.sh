#!/usr/bin/env bash
# Mail of a stack (S10d, docs/dns.md „Poczta”): SMTP of the Seohost mail hosting in .env.<stack>,
# with the kontakt@ mailbox of every site as its sender. Run it yourself — the passwords are typed
# here, checked with a real SMTP login and written only into the env file (never echoed):
#   ssh -t prokom-vps 'bash /srv/prokom/prokom-web/scripts/server/mail-login.sh staging'
# Then restart the app: docker compose … up -d app (runbook §1.10).
set -euo pipefail
stack="${1:?usage: mail-login.sh <staging|prod>}"
case "$stack" in staging | prod) ;; *) echo "Unknown stack: $stack"; exit 2 ;; esac
repo="$(cd "$(dirname "$0")/../.." && pwd)"
env_file="$repo/.env.$stack"
[ -f "$env_file" ] || { echo "No $env_file"; exit 1; }

host=srv128408.seohost.com.pl # the certificate of the mail server is issued for this name
port=465
default=kontakt@prokombiznes.pl
declare -A box=([BIZNES]=kontakt@prokombiznes.pl [SOFTWARE]=kontakt@prokomsoftware.pl
  [INSTALACJE]=kontakt@prokominstalacje.pl)

# A real SMTP login, the password passed in the environment (not on the command line).
check() {
  SMTP_CHECK_USER="$1" SMTP_CHECK_PASS="$2" python3 - "$host" "$port" <<'PY'
import os, smtplib, ssl, sys
try:
    with smtplib.SMTP_SSL(sys.argv[1], int(sys.argv[2]), context=ssl.create_default_context(), timeout=15) as s:
        s.login(os.environ["SMTP_CHECK_USER"], os.environ["SMTP_CHECK_PASS"])
except smtplib.SMTPAuthenticationError:
    sys.exit("wrong password")
PY
}

declare -A pass
for line in BIZNES SOFTWARE INSTALACJE; do
  read -rsp "Password of ${box[$line]} (paste: right click): " raw
  echo
  # Drop bracketed-paste escape codes and line ends around the value.
  p="$(printf '%s' "$raw" | sed -e 's/\x1b\[20[01]~//g' | tr -d '\r\n')"
  unset raw
  case "$p" in *"'"*) echo "The password contains ' — change it in the hosting panel."; exit 1 ;; esac
  if ! check "${box[$line]}" "$p"; then echo "Login of ${box[$line]} failed — nothing written."; exit 1; fi
  echo "OK: ${box[$line]}"
  pass[$line]="$p"
done
unset p

# Rewrite only the mail lines; single quotes = taken literally by docker compose.
tmp="$(mktemp "$env_file.XXXXXX")"
trap 'rm -f "$tmp"' EXIT
grep -vE '^(SMTP_HOST|SMTP_PORT|SMTP_SECURE|SMTP_USER|SMTP_PASS|SMTP_PASS_[A-Z]+|MAIL_FROM_ADDRESS|MAIL_SENDERS)=' "$env_file" >"$tmp" || true
{
  echo "SMTP_HOST=$host"
  echo "SMTP_PORT=$port"
  echo "SMTP_SECURE=true"
  echo "SMTP_USER=$default"
  echo "SMTP_PASS='${pass[BIZNES]}'"
  echo "MAIL_FROM_ADDRESS=$default"
  echo "MAIL_SENDERS=biznes=${box[BIZNES]},software=${box[SOFTWARE]},instalacje=${box[INSTALACJE]}"
  echo "SMTP_PASS_SOFTWARE='${pass[SOFTWARE]}'"
  echo "SMTP_PASS_INSTALACJE='${pass[INSTALACJE]}'"
} >>"$tmp"
chmod 600 "$tmp"
mv "$tmp" "$env_file"
trap - EXIT
unset pass
echo "Saved in $env_file (mail lines only). Restart the app to use it."
