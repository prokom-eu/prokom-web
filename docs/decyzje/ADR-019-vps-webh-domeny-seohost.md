# ADR-019: VPS w webh.pl, domeny w Seohost

- **Status:** przyjęta (zastępuje część „serwer” w ADR-002; domeny i poczta — bez zmian)
- **Data:** 2026-10-31
- **Decyduje:** Krystian (technika), szef (koszty — VPS już kupiony)

## Kontekst
ADR-002 zakładał jednego dostawcę (Seohost) na serwer, domeny i pocztę: VPS 4 vCPU / 8 GB / 150 GB + backup 250 GB, Ubuntu 22.04 → aktualizacja do 24.04. Ostatecznie kupiony został **VPS w webh.pl: 4 vCPU, 16 GB RAM, 100 GB NVMe, Ubuntu 24.04**. Domeny prokombiznes.pl, prokominstalacje.pl i prokomsoftware.pl są kupione w **Seohost** (rejestrator i DNS). S10 (`docs/zadania/fundament.md`) stawia na tym serwerze staging, później produkcję.

## Opcje
| Opcja | Zalety | Wady | Koszt |
|---|---|---|---|
| A. VPS webh.pl (kupiony) + domeny Seohost | 2× więcej RAM, NVMe, Ubuntu 24.04 od razu; łatwiej trzymać kopie u innego dostawcy niż serwer | dwa panele zamiast jednego; mniejszy dysk (100 GB); brak backupu dostawcy w pakiecie | VPS już opłacony |
| B. Zostać przy VPS Seohost (ADR-002) | jeden dostawca | drugi VPS do opłacenia, mniej RAM | dodatkowy abonament |

## Decyzja
Wybieramy **A**. Serwer już jest, ma więcej pamięci, a rozdzielenie dostawców serwera i domen nie zwiększa pracy przy stosie Docker Compose: DNS zmieniamy rzadko, wyłącznie przez `docs/dns.md`.

## Konsekwencje
- **System:** Ubuntu 24.04 od razu — znika krok `do-release-upgrade` z ADR-002. Utwardzenie i Docker: `scripts/server/bootstrap.sh` (runbook §1).
- **Pamięć:** 16 GB. Obecne limity kontenerów (prod: app 1536 MB, baza 768 MB; staging: 1024 / 512 MB; proxy 2 × 128 MB; test odtworzenia ~2,3 GB) mieszczą się z dużym zapasem na prokomserwis.pl i kolejne systemy. Limitów nie podnosimy na zapas — dopiero gdy pokażą to `docker stats` albo zabójstwa OOM w logach. Swap 4 GB zostaje jako bufor.
- **Dysk:** 100 GB zamiast 150 GB, bez osobnego backupu dostawcy. Najwięcej zajmują obrazy Dockera (czyszczenie: `docker image prune` w runbooku §8) i kopie lokalne (`../backups`, retencja 14/93/30 dni). Lokalne kopie to tylko szybki powrót — kopią „na wypadek utraty serwera” jest cel poza serwerem.
- **Kopie poza serwerem:** wymóg z ADR-002 (inny dostawca niż serwer) zostaje. Cel `rclone`: Backblaze B2 EU — „Rozstrzygnięcie” niżej.
- **Domeny:** rejestrator i DNS — Seohost. Rekordy A wskazują IP VPS webh.pl (`docs/dns.md`). pro-kom.eu i poczta firmy — bez zmian, wg ADR-002.
- **Poczta:** bez zmian (ADR-002). Serwer nie wysyła poczty sam (bez lokalnego MTA) — aplikacja wysyła przez SMTP dostawcy poczty, więc reputacja IP VPS nie ma znaczenia dla dostarczalności.
- **Dostęp:** konto w webh.pl na firmę (dane firmy, e-mail firmowy), 2FA, hasło i kody w menedżerze haseł (wpis „VPS — webh.pl”), tak jak konto rejestratora (`docs/dns.md` → zasady własności).
- **Wracamy do decyzji**, gdy: dysk regularnie przekracza 70%, RAM nie wystarcza po dodaniu kolejnego systemu albo webh.pl ma poważną awarię.

## Rozstrzygnięcie: kopie poza serwerem (1.11.2026, decyzja Krystiana)
**Backblaze B2, region EU Central (Amsterdam).** Inny dostawca niż serwer, dane w UE (kopie zawierają zapytania klientów). Pierwsze 10 GB bez opłat — kopie stagingu i produkcji to kilka GB. Kosz z **Object Lock (Compliance, 14 dni)**: pliku nie usunie nikt przez 14 dni od wysłania, także ktoś, kto przejmie serwer razem z kluczem B2 — kopie z ostatnich dwóch tygodni zostają. Klucz aplikacji tylko do tego kosza. Kopie są szyfrowane `age` przed wysłaniem (klucz prywatny tylko w menedżerze haseł). Odrzucone: Hetzner Storage Box (stała opłata, bez blokady usuwania), Seohost (wymagałby osobnego pakietu hostingu z miejscem na pliki, zwykle bez blokady usuwania). Konfiguracja: runbook §1.8; test odtworzenia z B2: runbook §7.
