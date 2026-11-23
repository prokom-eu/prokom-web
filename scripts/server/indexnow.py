#!/usr/bin/env python3
"""IndexNow for every PRO-KOM domain (ADR-030): tell Bing, Yandex, Seznam and Naver which
addresses are new, changed or gone, so they crawl them within minutes instead of days.

How it works, per domain:
  1. the key file https://<domain>/<KEY>.txt must answer with the key (else the domain is skipped);
  2. sitemap.xml (and sitemaps it lists) → {address: lastmod};
  3. compared with the last state sent (<state>/<domain>.json): new, changed (lastmod) and removed
     addresses go to https://api.indexnow.org/indexnow (the shared endpoint passes them on);
  4. the state is saved only after a 200/202, so a failed send is retried on the next run.
The first run of a domain sends all its addresses once.

Run from cron on the server (runbook §1.8), times in UTC:
  17 * * * * cd /srv/prokom/prokom-web && python3 scripts/server/indexnow.py >> ../indexnow/indexnow.log 2>&1
By hand: `python3 scripts/server/indexnow.py --dry-run` (counts only, nothing sent or saved),
`python3 scripts/server/indexnow.py prokomserwis.pl` (one domain).
Standard library only — no packages on the server.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit

# Public by protocol (it is served on every domain); the same constant as src/lib/seo/indexnow.ts.
KEY = "1a909fcf3fdf8b994d75221027393cf8"  # gitleaks:allow
ENDPOINT = "https://api.indexnow.org/indexnow"
DOMAINS = [
    "pro-kom.eu",
    "prokombiznes.pl",
    "prokominstalacje.pl",
    "prokomsoftware.pl",
    "prokomserwis.pl",
    # Skipped until its repo serves the key file (the script checks it every run).
    "prokomgaming.pl",
]
BATCH = 10_000  # protocol limit per request
UA = "prokom-indexnow/1.0 (+https://pro-kom.eu/)"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
ROOT = Path(__file__).resolve().parents[2]
STATE_DIR = Path(os.environ.get("INDEXNOW_STATE", ROOT.parent / "indexnow"))


def log(domain: str, message: str) -> None:
    stamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    print(f"{stamp} indexnow {domain}: {message}", flush=True)


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def key_file_ok(domain: str) -> bool:
    try:
        return fetch(f"https://{domain}/{KEY}.txt").decode().strip() == KEY
    except (urllib.error.URLError, TimeoutError, UnicodeDecodeError):
        return False


def sitemap_entries(url: str, depth: int = 0) -> dict[str, str]:
    """{address: lastmod or ''} of a sitemap; a sitemap index is followed one level down."""
    root = ET.fromstring(fetch(url))
    entries: dict[str, str] = {}
    if root.tag == f"{NS}sitemapindex" and depth == 0:
        for node in root.findall(f"{NS}sitemap/{NS}loc"):
            if node.text:
                entries.update(sitemap_entries(node.text.strip(), depth + 1))
        return entries
    for node in root.findall(f"{NS}url"):
        loc = node.findtext(f"{NS}loc")
        if loc:
            entries[loc.strip()] = (node.findtext(f"{NS}lastmod") or "").strip()
    return entries


def changed(previous: dict[str, str], current: dict[str, str]) -> list[str]:
    """New or changed addresses first, then removed ones (engines recheck them and drop a 404)."""
    fresh = [url for url, mod in current.items() if previous.get(url) != mod]
    gone = [url for url in previous if url not in current]
    return fresh + gone


def submit(domain: str, urls: list[str]) -> tuple[bool, str]:
    for start in range(0, len(urls), BATCH):
        body = json.dumps(
            {
                "host": domain,
                "key": KEY,
                "keyLocation": f"https://{domain}/{KEY}.txt",
                "urlList": urls[start : start + BATCH],
            }
        ).encode()
        request = urllib.request.Request(
            ENDPOINT,
            data=body,
            method="POST",
            headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": UA},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                if response.status not in (200, 202):
                    return False, f"HTTP {response.status}"
        except urllib.error.HTTPError as error:
            # 400 bad request, 403 key not valid, 422 urls of another host, 429 too many requests.
            return False, f"HTTP {error.code}"
        except (urllib.error.URLError, TimeoutError) as error:
            return False, f"network: {error}"
    return True, "ok"


def run(domain: str, dry_run: bool) -> bool:
    if not key_file_ok(domain):
        log(domain, f"skipped - no key file https://{domain}/{KEY}.txt")
        return True
    try:
        current = sitemap_entries(f"https://{domain}/sitemap.xml")
    except (urllib.error.URLError, TimeoutError, ET.ParseError) as error:
        log(domain, f"FAILED - sitemap: {error}")
        return False
    # IndexNow takes only addresses of the key's host.
    current = {url: mod for url, mod in current.items() if urlsplit(url).hostname == domain}
    state_file = STATE_DIR / f"{domain}.json"
    previous = json.loads(state_file.read_text()) if state_file.exists() else {}
    urls = changed(previous, current)
    if not urls:
        log(domain, f"no changes ({len(current)} addresses)")
        return True
    if dry_run:
        log(domain, f"dry run - would send {len(urls)} of {len(current)} addresses")
        return True
    ok, detail = submit(domain, urls)
    if not ok:
        log(domain, f"FAILED - {detail}; {len(urls)} addresses kept for the next run")
        return False
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = state_file.with_suffix(".tmp")
    tmp.write_text(json.dumps(current, indent=0, sort_keys=True))
    tmp.replace(state_file)
    log(domain, f"sent {len(urls)} addresses ({len(current)} in the sitemap)")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("domains", nargs="*", default=DOMAINS)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    results = [run(domain, args.dry_run) for domain in args.domains]
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
