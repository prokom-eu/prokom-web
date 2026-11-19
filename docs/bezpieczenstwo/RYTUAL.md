# Rytuał bezpieczeństwa — stałe czynności

Krótkie, powtarzalne czynności, żeby stan z audytu (`STAN-BEZPIECZENSTWA.md`) się nie rozjechał. Kto: Krystian. Polecenia uruchamiasz z komputera (`ssh prokom-vps …`) albo na serwerze w `/srv/prokom/…`. Wynik każdej czynności miesięcznej i kwartalnej — jedna linijka w tabeli „Dziennik” na końcu.

## Co tydzień (poniedziałek, 10 min)

1. **Alarmy:** Better Stack (dostępność, certyfikaty, heartbeat kopii), Sentry — czy coś czeka.
2. **Kopie:** `ssh prokom-vps 'grep -E "done|ERROR|403" /srv/prokom/backups/backup.log | tail -12'` — 6× `done` z ostatniej nocy, bez `ERROR`.
3. **Restart po aktualizacjach:** `ssh prokom-vps 'ls /var/run/reboot-required 2>/dev/null && cat /var/run/reboot-required.pkgs'` — jeśli plik jest: restart poza oknem kopii (02:30–03:45 UTC), po kopii (runbook).
4. **Nginx przeładowuje się:** `ssh prokom-vps 'docker exec prokom-proxy-nginx-1 nginx -t'` → `test is successful` (AB1 S-02).

## Co miesiąc (pierwszy poniedziałek, ok. 1 h)

1. **Aktualizacje zależności:** scalić PR-y Dependabota w prokom-web, prokom-gaming i prokom-system (po zielonym CI); `pnpm audit --prod` w obu repo Next i `pip-audit` dla Tech (`docs/bezpieczenstwo/AUDYT-PLAN.md` AB2 pkt 1) — nowe High/Critical → PR w tym tygodniu.
2. **System:** `apt list --upgradable` na serwerze; poprawki bezpieczeństwa instalują się same (`unattended-upgrades`), restart wg punktu tygodniowego.
3. **Test odtworzenia jednego stosu** rotacyjnie (Gaming → Tech → prokom-web): `docs/bezpieczenstwo/skrypty/ab1-restore-test.sh` (wszystkie trzy naraz, ok. 1 min) albo runbook §7 dla pełnego stosu z aplikacją. Wpis w runbook §7.
4. **Konta:** lista użytkowników paneli (Payload prokom-web i Gaming, Django Tech: staff i superuser) — usunąć zbędne i testowe, role minimalne.
5. **Wiek kopii poza serwerem i miejsce w B2:** `rclone size offsite:prokom-backups-r7k2` (limit — AB1 S-05).

## Co kwartał (luty, maj, sierpień, listopad)

1. **Rotacja kluczy:** sekrety aplikacji (`PAYLOAD_SECRET`, `SECRET_KEY` Django, hasła baz i SMTP, klucz Anthropic, tokeny GHCR) — nowe wartości w menedżerze haseł, potem `.env.*` na serwerze i wdrożenie; tokeny osobiste GitHub z datą ważności.
2. **Przegląd dostępów:** `DOSTEPY.md` — 2FA wszędzie, kto ma dostęp, kody zapasowe w menedżerze haseł, daty odnowienia domen i usług.
3. **Skany z zewnątrz:** `nmap -sT -Pn --top-ports 1000 194.28.50.70` (oczekiwane 22, 80, 443), SSL Labs i Mozilla HTTP Observatory dla każdej domeny, `gitleaks git` na pełnej historii trzech repo, `docs/bezpieczenstwo/skrypty/ab1-sudo.sh` (SSH, zapora, fail2ban).
4. **Powtórka skróconego przeglądu** każdego nowego systemu przed produkcją (AUDYT-PLAN §7).

## Po odejściu pracownika lub zakończeniu współpracy (tego samego dnia)

1. Konta w panelach (Payload, Django) — dezaktywacja, nie usuwanie (historia zmian).
2. Hasła, które znał (skrzynki `kontakt@`, Wi-Fi, konta usług) — zmiana i nowe wartości w menedżerze haseł.
3. GitHub, webh.pl, Seohost, Google, Better Stack — usunięcie z organizacji/kont.
4. Wpis w `DOSTEPY.md`.

## Kalendarz na najbliższe 3 miesiące

| Data | Czynność |
| --- | --- |
| pon. 23.11.2026 | tygodniowe; po scaleniu #755: nowa bramka wdrożenia na serwerze i `nginx -t` + odtworzenie proxy (S-02, limity logowania) |
| do 25.11.2026 | nazwa.pl: archiwum zaszyfrowane starych serwisów i baz → usunięcie z hostingu (S-01, część K) |
| do 25.11.2026 | Tech: PR aktualizacji backendu do Django 5.2 LTS (T-03) |
| pon. 30.11.2026 | tygodniowe; **Hetzner (stara Tech): ostatni zrzut do zaszyfrowanego archiwum → usunięcie serwera → rotacja `SECRET_KEY`, hasła bazy, hasła SMTP Tech** (T-20); heartbeat kopii prod web i Tech, limit B2 (S-04, S-05) |
| pon. 07.12.2026 | **miesięczne**: Dependabot + audyty, test odtworzenia **Gaming**, przegląd kont |
| do 14.12.2026 | nazwa.pl: decyzja o hostingu poczty przed końcem abonamentu (14.12, `docs/dns.md`) |
| do 15.12.2026 | Tech: aktualizacja frontu Next.js 14 → wspierana linia (T-03) |
| pon. 14.12.2026 | tygodniowe; DMARC: po czystych raportach `p=quarantine` w domenach linii (S-12) |
| do 18.12.2026 | CSP z ograniczeniem skryptów (W-03, G-04), pliki napraw za logowaniem (T-10), `/admin/` Tech (T-13) |
| pon. 04.01.2027 | **miesięczne**: test odtworzenia **Tech**; sprawdzić, że certyfikaty odnowiły się same (pierwsze odnowienia ok. 01.01) — daty w `openssl s_client` |
| pon. 01.02.2027 | **miesięczne**: test odtworzenia **prokom-web** |
| do 15.02.2027 | **kwartalne**: rotacja kluczy, przegląd dostępów, skany z zewnątrz |

## Dziennik

| Data | Czynność | Wynik | Kto |
| --- | --- | --- | --- |
| 18.11.2026 | audyt AB1–AB4, test odtworzenia trzech produkcji | zgodne; znaleziska w `ZNALEZISKA-2026-11.md` | Krystian + Claude |
