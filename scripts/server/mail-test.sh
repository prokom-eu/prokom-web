#!/usr/bin/env bash
# Test mail of a stack (S10d): one short message from every site's sender (MAIL_SENDERS) with its
# own SMTP login from .env.<stack>, to one address — e.g. the one mail-tester.com shows, or your
# Gmail / Outlook (spam check, docs/dns.md „Poczta”). Prints no password.
#   ssh prokom-vps 'bash /srv/prokom/prokom-web/scripts/server/mail-test.sh staging <address> [line]'
set -euo pipefail
stack="${1:?usage: mail-test.sh <staging|prod> <to-address> [biznes|software|instalacje]}"
to="${2:?usage: mail-test.sh <staging|prod> <to-address> [line]}"
only="${3:-}"
case "$stack" in staging | prod) ;; *) echo "Unknown stack: $stack"; exit 2 ;; esac
[[ "$to" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] || { echo "Not an e-mail address: $to"; exit 2; }
env_file="$(cd "$(dirname "$0")/../.." && pwd)/.env.$stack"
[ -f "$env_file" ] || { echo "No $env_file"; exit 1; }

# The env file is read by Python (not sourced by the shell): values stay out of argv and output.
ENV_FILE="$env_file" MAIL_TO="$to" ONLY="$only" python3 - <<'PY'
import os, smtplib, ssl, sys
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

env = {}
for line in open(os.environ["ENV_FILE"], encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
        value = value[1:-1]
    env[key] = value

host, port = env["SMTP_HOST"], int(env["SMTP_PORT"])
senders = dict(part.split("=", 1) for part in env.get("MAIL_SENDERS", "").split(",") if "=" in part)
names = {"biznes": "PRO-KOM Biznes", "software": "PRO-KOM Software", "instalacje": "PRO-KOM Instalacje"}
failed = False
for line, address in senders.items():
    if os.environ["ONLY"] and line != os.environ["ONLY"]:
        continue
    password = env.get(f"SMTP_PASS_{line.upper()}") or (env["SMTP_PASS"] if address == env.get("SMTP_USER") else None)
    if not password:
        print(f"{line}: no password for {address}")
        failed = True
        continue
    msg = EmailMessage()
    msg["From"] = f"{names.get(line, 'PRO-KOM')} <{address}>"
    msg["To"] = os.environ["MAIL_TO"]
    msg["Subject"] = f"Test poczty {names.get(line, line)}"
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=address.split("@")[1])
    msg.set_content(
        "Dzień dobry,\n\n"
        f"to wiadomość testowa z adresu {address} — sprawdzenie, czy poczta ze strony "
        "dociera do skrzynki odbiorczej, a nie do spamu.\n\n"
        "Pozdrawiamy\nPRO-KOM, Rabka-Zdrój\n"
    )
    try:
        with smtplib.SMTP_SSL(host, port, context=ssl.create_default_context(), timeout=20) as s:
            s.login(address, password)
            s.send_message(msg)
        print(f"{line}: sent from {address}")
    except Exception as e:  # no message body or password in the output
        print(f"{line}: FAILED {type(e).__name__}")
        failed = True
sys.exit(1 if failed else 0)
PY
