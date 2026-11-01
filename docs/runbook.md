# Runbook — prokom-web na serwerze

Co robić krok po kroku przy wdrożeniu, cofnięciu, odtworzeniu z kopii i awarii. Opis stosów, Nginx i pipeline: `docs/wdrozenia.md`. Polecenia uruchamiasz w katalogu repo na serwerze (ścieżki w S10). Kroki 2–6 przećwiczone lokalnie 17.10.2026 (S9b-2) na stosach z obrazu.

## 0. Co gdzie jest

| Rzecz | Gdzie | Uwagi |
|---|---|---|
| Stos produkcji | projekt `prokom-prod`: `docker/compose.prod.yml`, zmienne `.env.prod` | kontenery `prokom-prod-app-1`, `prokom-prod-postgres-1` |
| Stos stagingu | projekt `prokom-staging`: `compose.prod.yml` + `compose.staging.yml`, zmienne `.env.staging` | baza `prokom_staging` |
| Nginx + certbot | projekt `prokom-proxy`: `docker/compose.proxy.yml` (staging) + `compose.proxy.prod.yml` (domeny produkcji, od startu produkcji), zmienne `.env.proxy` | jedyny z portami 80/443 |
| Kopie | `scripts/backup.sh`, `scripts/restore.sh`, zmienne `.env.backup` | lokalnie `../backups/`, poza serwerem `RCLONE_REMOTE` |
| Sekrety | `.env.*` w repo (poza Gitem), plik hasła stagingu `../secrets/` | wartości w menedżerze haseł |
| Klucz prywatny `age` | **tylko** menedżer haseł („prokom-web backup age”) | na serwerze jest tylko klucz publiczny |

Skróty używane niżej:
```bash
prod="docker compose --env-file .env.prod -f docker/compose.prod.yml"
staging="docker compose --env-file .env.staging -f docker/compose.prod.yml -f docker/compose.staging.yml"
```

## 1. Jednorazowo na serwerze (S10)

Serwer: VPS webh.pl, Ubuntu 24.04 (ADR-019). Strefa czasu serwera zostaje **UTC** — godziny w cronie niżej są w UTC. Katalogi: pliki wdrożenia w `/srv/prokom/prokom-web` (**nie** klon repo — tylko `docker/`, `scripts/`, `.env.example`, krok 2), obok `../backups` i `../secrets` (ścieżki względne w skryptach i `.env.*` wskazują tam). `<admin>` = Twój użytkownik z kroku 1 (31.10: `krystian`). Na komputerze: klucz `~/.ssh/prokom-vps` (z hasłem, w `ssh-agent`) i skrót `prokom-vps` w `~/.ssh/config`.

0. **Konta:** panel webh.pl i Seohost na firmę, 2FA, hasła i kody w menedżerze haseł („VPS — webh.pl”, „Rejestrator domen — Seohost”). IP serwera wpisz w `docs/dns.md` (PR).
1. **Utwardzenie** — z komputera, klucz SSH już na koncie root. Panel webh.pl → „Do panelu” (VMmanager) nie przyjmuje klucza: gdy nie znasz hasła roota, „⋯” → **Reinstall OS** (Ubuntu 24.04, bez skryptu, wygeneruj nowe hasło → menedżer haseł „VPS — root”), potem `type $HOME\.ssh\prokom-vps.pub | ssh root@<IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"` (PowerShell). Faza 1 może iść przez nieinteraktywne `ssh` — hasło do sudo ustawiasz wtedy osobno: `ssh -t root@<IP> passwd <admin>`.
   ```bash
   scp scripts/server/bootstrap.sh root@<IP>:/root/
   ssh root@<IP>
   bash /root/bootstrap.sh <admin>
   ```
   Skrypt: aktualizacja, użytkownik `<admin>` (sudo, docker, klucz skopiowany z roota, pyta o hasło do sudo), `ufw` (22, 80, 443), `fail2ban`, automatyczne poprawki bezpieczeństwa (bez automatycznego restartu), swap 4 GB, Docker z oficjalnego repozytorium, rotacja logów. **Nie zamykaj sesji roota.** W drugim oknie: `ssh <admin>@<IP>`, `sudo -v`, `docker run --rm hello-world`. Dopiero gdy działa — w oknie roota `bash /root/bootstrap.sh --lock-ssh <admin>` (tylko klucze, bez roota). Sprawdzenie z nowego okna: `ssh root@<IP>` odrzucone.
   **Gdy odetniesz się od SSH:** konsola (VNC) w panelu webh.pl → logowanie jako `<admin>` hasłem do sudo → `sudo rm /etc/ssh/sshd_config.d/10-prokom.conf && sudo systemctl reload ssh`. Przed fazą `--lock-ssh` sprawdź, że ta konsola w ogóle działa. Opcjonalnie `F2B_IGNOREIP="<IP biura>" bash /root/bootstrap.sh <admin>` — fail2ban nie zablokuje Twojego adresu.
   Restart po aktualizacji jądra robisz sam (komunikat `*** System restart required ***` przy logowaniu), poza godzinami kopii.
2. **Pliki wdrożenia** — serwer nie ma dostępu do repo (organizacja `prokom-eu` ma wyłączone klucze wdrożeniowe, a serwer kodu nie potrzebuje: aplikacja przychodzi jako obraz z GHCR). Katalogi:
   ```bash
   sudo install -d -o <admin> -g <admin> /srv/prokom /srv/prokom/backups
   install -d -m 700 /srv/prokom/secrets
   ```
   Pliki z komputera (Git Bash w katalogu repo, gałąź z wersją do wdrożenia; nadpisuje tylko pliki z repo, `.env.*` zostają):
   ```bash
   git archive --format=tar HEAD docker scripts .env.example | ssh prokom-vps 'tar -x -C /srv/prokom/prokom-web && echo "$(git rev-parse --short HEAD)" > /srv/prokom/prokom-web/REVISION'
   ```
   Wersja na serwerze: `ssh prokom-vps cat /srv/prokom/prokom-web/REVISION`. W S10b robi to pipeline przy każdym wdrożeniu.
3. **Zmienne:** `.env.staging`, `.env.proxy` (później `.env.prod`, `.env.backup`) w katalogu repo wg `.env.example`, `chmod 600 .env.*`. Wartości z menedżera haseł — nie przez czat ani repo. Na start w `.env.proxy` tylko zmienne stagingu (`PROD_*` czyta dopiero nakładka produkcji).
4. **GHCR:** `docker login ghcr.io -u <konto GitHub>` z tokenem **tylko** `read:packages` (osobny token, nie główny; w menedżerze haseł). Pakiet w GHCR jest prywatny.
5. **DNS:** rekordy `staging` i panelu stagingu wg `docs/dns.md` (najpierw PR, potem panel Seohost: **DNS → Strefy DNS → Dodaj** z IP serwera, ⚙ → „Dodaj nowy rekord”, potem w domenie **Ustawienia DNS → delegacja `dns1/dns2.microhost.pl`** — strefy z panelu obsługują serwery microhost, a `ns1/ns2.seohost.pl` zwracają parking). Sprawdzenie: `Resolve-DnsName staging.prokombiznes.pl -Type A` = IP serwera — dopiero wtedy certyfikaty.
6. `docker network create prokom-proxy`, plik hasła stagingu (`chmod 644` — Nginx w kontenerze czyta go jako inny użytkownik; hasło jest w nim zahaszowane) i certyfikat **tylko stagingu** (`prokom-staging`), Nginx bez nakładki produkcji — `docs/wdrozenia.md` → „Nginx i staging”. Domeny produkcji (rekordy `@`, panel, certyfikat `prokom-prod`) dochodzą przy pierwszym wdrożeniu produkcji (§3).
7. Staging — §2.
8. **Kopie** (ustawione 1.11.2026; `age` i `rclone` instaluje `bootstrap.sh`):
   - **Backblaze B2** (ADR-019 „Rozstrzygnięcie”): konto na firmę w regionie **EU Central** (wybór przy rejestracji, potem nie do zmiany), 2FA, wpis „Backblaze B2”. Kosz `prokom-backups-r7k2`: Private, szyfrowanie, **Object Lock** (tylko przy tworzeniu) z domyślną retencją **Compliance 14 dni**, Lifecycle „Keep only the last version”. Klucz aplikacji `prokom-vps-backup`: tylko ten kosz, Read and Write → keyID i applicationKey do menedżera haseł.
   - klucz B2 w rclone (remote `offsite`, plik `~/.config/rclone/rclone.conf`, 600) — wpisujesz sam, klucz nie trafia do historii ani czatu:
     ```bash
     ssh -t prokom-vps 'bash /srv/prokom/prokom-web/scripts/server/b2-key.sh prokom-backups-r7k2'
     ```
     W PowerShell komenda w **pojedynczych** cudzysłowach (w podwójnych PowerShell podmienia `$zmienne` na puste), klucz wklejasz prawym przyciskiem.
   - klucz szyfrujący: `ssh -t prokom-vps 'bash /srv/prokom/prokom-web/scripts/server/age-new.sh'` — **tylko przy pierwszej konfiguracji** (przy odbudowie serwera nie — §6 „Serwer stracony”); klucz prywatny raz na ekranie → menedżer haseł „prokom-web backup age”; na serwerze zostaje tylko publiczny `../secrets/age.pub`. Skrypt odmawia, gdy `age.pub` już jest; planowana zmiana klucza: `--force` (nowa para = tylko nowe kopie, starsze czyta stary klucz — zostaw go w menedżerze haseł, dopóki są kopie nim zaszyfrowane, czyli ~93 dni).
   - `.env.backup` (600): `AGE_RECIPIENT="$(cat /srv/prokom/secrets/age.pub)"` (plik jest wczytywany przez powłokę, więc klucz publiczny ma jedno źródło — `age.pub`), `RCLONE_REMOTE=offsite:prokom-backups-r7k2`; próba: `scripts/backup.sh staging` → `done`, plik w `rclone lsf offsite:prokom-backups-r7k2/staging/daily/`.
   - cron użytkownika `<admin>` (`crontab -e`), noc w UTC, poza godziną zadania retencji zapytań (03:00); linia `prod` dochodzi przy pierwszym wdrożeniu produkcji (§3):
     ```
     30 2 * * * cd /srv/prokom/prokom-web && scripts/backup.sh prod >> ../backups/backup.log 2>&1
     45 2 * * * cd /srv/prokom/prokom-web && scripts/backup.sh staging >> ../backups/backup.log 2>&1
     10 4 * * * /usr/sbin/logrotate -s /srv/prokom/backups/.logrotate.state /srv/prokom/backups/logrotate.conf
     ```
     rotacja logu bez `sudo`: `../backups/logrotate.conf` z `/srv/prokom/backups/backup.log { monthly rotate 6 compress missingok notifempty }`;
   - kopia `monthly` powstaje tylko z przebiegu nocnego 1. dnia miesiąca (UTC) — jeśli ten się nie uda, w danym miesiącu jej nie ma; dlatego alarm o braku świeżej kopii (S10c);
   - Object Lock: pliku w B2 nie da się usunąć przez 14 dni od wysłania — także kluczem z serwera (sprawdzone 1.11). `backup.sh` usuwa kopie dopiero po 14/30/93 dniach, więc blokada mu nie przeszkadza; usunięty plik B2 najpierw ukrywa, a Lifecycle kasuje go po wygaśnięciu blokady.

## 2. Wdrożenie stagingu (pipeline, S10b)

Każdy merge do `develop`: „Image” buduje obraz `<SHA>` (z plikami wdrożenia tego commita w `/deploy`: `docker/`, `scripts/`, `.env.example`) → **„Deploy staging”** (`.github/workflows/deploy-staging.yml`) łączy się z serwerem kluczem, który może wywołać tylko bramkę `deploy staging <SHA>` — **nie wysyła żadnych plików**. Bramka (`~/bin/prokom-deploy-gate` = `scripts/server/deploy-gate.sh`) pod blokadą `../.deploy.lock` pobiera obraz, kopiuje z niego `/deploy` w miejsce `docker/` i `scripts/` (`.env.*` zostają; `REVISION` = wersja plików) i uruchamia `scripts/deploy.sh staging <SHA>`: pobranie obrazu → `APP_IMAGE_TAG` w `.env.staging` → `up -d app` → `healthy` (migracje przy starcie, do 5 min) → pełny smoke test tego commita na porcie aplikacji (`127.0.0.1:<APP_PORT>`, domeny z `STAGING_SITE_HOSTS` w `.env.proxy`, bez hasła stagingu). Błąd po zmianie tagu:
- **bez nowych migracji** → automatyczny powrót do poprzedniego tagu (tylko aplikacja), sprawdzony podstawowym smoke testem (`SMOKE_CORE=1`: zdrowie, panel, strony główne — trasy, które ma każda wersja); przebieg w Actions czerwony;
- **nowe migracje już weszły** → **bez powrotu**: stary obraz może nie działać na nowym schemacie (1.11: obraz z 31.10 na bazie po 13 migracjach dawał 500). Nowy obraz zostaje, przebieg czerwony — sprawdź go i zdecyduj: poprawka w nowym PR albo §4B z kopią;
- **powrót się nie udał** → skrypt wraca do nowego obrazu, żeby staging nie leżał, i kończy się błędem.

Dziennik: `../deploys.log` (`<czas> staging <stary> -> <nowy> ok | FAILED, rolled back | FAILED, not rolled back (migrations applied) | FAILED, rollback failed, …`), pełny przebieg: `../deploy-output.log`. Zerwane połączenie z GitHubem nie przerywa wdrożenia. Po udanym wdrożeniu usuwane są obrazy aplikacji inne niż obecny, poprzedni i te z `.env.staging`/`.env.prod` (starszy obraz pobiera się z GHCR przy cofnięciu).

- **Ręcznie z GitHuba:** Actions → „Deploy staging” → Run workflow → pełny SHA z `develop` (ponowne wdrożenie albo cofnięcie do starszego obrazu). Workflow sprawdza, że commit jest w historii `develop`.
- **Ręcznie na serwerze** (ta sama droga co pipeline): `ssh prokom-vps 'SSH_ORIGINAL_COMMAND="deploy staging <SHA>" ~/bin/prokom-deploy-gate'`. Obrazy sprzed S10b nie mają `/deploy` — bramka odmawia; wtedy pliki z komputera (`git archive <SHA> docker scripts .env.example | ssh prokom-vps 'cd /srv/prokom/prokom-web && rm -rf docker scripts && tar -x'`) i `scripts/deploy.sh staging <SHA>`. `deploy.sh` i smoke test muszą być z **tego samego** commita co obraz.
- **Test powrotu:** `scripts/deploy.sh staging <SHA> --fail-smoke-for-test` (udaje błąd smoke testu po starcie nowego obrazu). Powrót następuje tylko, gdy nowy obraz nie dodał migracji (`git diff --stat <stary> <nowy> -- src/migrations`). Wynik 1.11: `a7c8856 -> 51ab27a` — powrót do `a7c8856`, podstawowy smoke zielony, potem `51ab27a` wdrożony normalnie.

**Klucz pipeline'u (raz, zrobione 1.11):** środowisko GitHub `staging` (Settings → Environments; wdrożenia tylko z gałęzi `develop`) z sekretem `STAGING_SSH_KEY` (klucz prywatny ed25519, wygenerowany na serwerze i przekazany wprost do `gh secret set` — nigdzie nie zapisany) oraz zmiennymi `STAGING_SSH_TARGET=<admin>@<IP>` i `STAGING_SSH_KNOWN_HOSTS=<IP> ssh-ed25519 …` (z `/etc/ssh/ssh_host_ed25519_key.pub` serwera — przypięty klucz hosta). Na serwerze w `~/.ssh/authorized_keys` admina: `restrict,command="/home/<admin>/bin/prokom-deploy-gate" ssh-ed25519 … github-deploy-staging` (`restrict` wyłącza też scp/sftp, przekierowania i terminal). Bramka leży poza plikami wdrożenia, więc wdrożenie jej nie podmienia — zmiana bramki: `install -m 700 scripts/server/deploy-gate.sh ~/bin/prokom-deploy-gate` ręcznie. Klucz pozwala tylko wybrać obraz z GHCR (zbudowany przez „Image” z `develop`); kto może scalić do `develop`, ten wdraża kod na serwer — dlatego `develop` tylko przez PR z zielonym CI. Nowy klucz: usuń linię `github-deploy-staging`, wygeneruj parę jak wyżej.

## 3. Wdrożenie produkcji

Tylko po akceptacji szefa w Asanie i tylko obraz, który przeszedł staging (ADR-004).

**Pierwsze wdrożenie produkcji (raz):** rekordy `@`, `www` i panelu produkcji wg `docs/dns.md` (PR, potem Seohost) → certyfikat `prokom-prod` (`docs/wdrozenia.md` → „Nginx i staging”, krok 3) → zmienne `PROD_*` w `.env.proxy` → Nginx z nakładką: `docker compose --env-file .env.proxy -f docker/compose.proxy.yml -f docker/compose.proxy.prod.yml up -d`. Od tej chwili proxy uruchamiasz zawsze z oboma plikami. Do crona dopisz linię `backup.sh prod` (§1.8).
1. Kopia przed wdrożeniem: `scripts/backup.sh prod predeploy` — musi się skończyć `done`.
2. Zapisz obecny tag (punkt powrotu): `grep APP_IMAGE_TAG .env.prod`.
3. W `.env.prod`: `APP_IMAGE_TAG=<SHA ze stagingu>`.
4. `$prod pull app && $prod up -d app`
5. Zdrowie jak wyżej (`prokom-prod-app-1`), potem smoke: `PANEL_HOST=<panel> bash scripts/smoke.sh https://127.0.0.1 <domeny…>`.
6. Smoke czerwony albo aplikacja nie wstaje w ~3 min → **4. Cofnięcie**.

## 4. Cofnięcie wdrożenia

**A. Tylko obraz** (migracje nowej wersji były zgodne wstecz — patrz 5):
1. W `.env.prod` poprzedni `APP_IMAGE_TAG` (z kroku 3.2). Staging: „Deploy staging” → Run workflow z poprzednim SHA (§2) — nic więcej.
2. `$prod up -d app`, zdrowie, smoke.

**B. Obraz + baza** (migracja niezgodna wstecz albo zepsute dane):
1. Jak A, krok 1 (poprzedni tag w `.env.prod`).
2. `scripts/restore.sh --no-start ../backups/prod/predeploy/<plik> prokom-prod prokom_prod` — zapyta o nazwę projektu; potrzebny klucz prywatny `age` (6.1). **`--no-start` jest konieczne:** bez niego skrypt uruchomiłby z powrotem ten sam kontener, czyli **nowy** obraz, który od razu ponowiłby niezgodną migrację.
3. `$prod up -d app` — kontener powstaje od nowa z poprzednim tagiem, na odtworzonej bazie.
4. Zdrowie, smoke. Zapytania z formularzy, które przyszły między kopią a cofnięciem, giną — sprawdź w Mailpit/skrzynkach powiadomień i wpisz ręcznie, jeśli trzeba.

## 5. Migracje — zasada „expand / contract”

Aplikacja migruje bazę sama przy starcie (`prodMigrations`). Żeby cofnięcie samego obrazu (4A) działało:
- **Wersja N** tylko **dodaje**: nowa tabela, nowa kolumna (nullable albo z domyślną wartością), nowy indeks. Stary kod ich nie zna i działa dalej.
- **Wersja N+1** (osobne wdrożenie, gdy N jest stabilna) **usuwa** albo zmienia: kasowanie kolumn, `NOT NULL`, zmiana typu.
- Zmiana nazwy = dodaj nową → przepisz dane i kod → usuń starą w kolejnym wdrożeniu.
- Migracja, której nie da się tak podzielić, oznacza: cofnięcie = 4B. Napisz to w opisie PR.

Nieudana migracja: kontener działa, ale `/api/health` = 503, a healthcheck co 15 s ponawia start Payload (i migrację). W logach (`docker logs prokom-prod-app-1`) jest nazwa migracji. Postępowanie: 4A, potem poprawka migracji w nowym PR.

## 6. Odtworzenie z kopii

1. Klucz prywatny z menedżera haseł do pliku tylko na czas odtworzenia: `ssh -t prokom-vps 'bash /srv/prokom/prokom-web/scripts/server/age-key-temp.sh'` (sprawdza, czy pasuje do `age.pub`), potem z katalogu `/srv/prokom/prokom-web`: `AGE_IDENTITY=../secrets/age.key` przed komendą `restore.sh` albo w `.env.backup`. **Po odtworzeniu: `shred -u ../secrets/age.key`.**
2. Wybór kopii: lokalnie `ls ../backups/prod/{daily,monthly,predeploy}/`, poza serwerem `rclone lsf offsite:prokom-backups-r7k2/prod/daily/`.
3. `scripts/restore.sh <plik albo offsite:prokom-backups-r7k2/prod/daily/<plik>> prokom-prod prokom_prod`
   - uruchamia potem **ten sam kontener** (obraz, z którego powstał); jeśli w `.env.prod` jest inny tag, użyj `--no-start` i `$prod up -d app`;
   - baza z manifestu musi się zgadzać z podaną (`prokom_prod`) — kopia stagingu nie trafi na produkcję przez pomyłkę;
   - pokazuje manifest (data, obraz, lista migracji) i pyta o nazwę projektu;
   - zły klucz → „cannot decrypt … nothing was changed”;
   - zatrzymuje aplikację, odtwarza bazę (`pg_restore` na nowo utworzoną) i wolumen mediów, uruchamia aplikację i czeka na `healthy`.
4. Smoke (krok 3.5).

Serwer stracony w całości: nowy serwer wg 1 → stosy wg 2/3 z ostatnim tagiem z manifestu (`app_image`) → 6. W kroku 1.8 **nie** uruchamiaj `age-new.sh`: najpierw klucz B2 (`b2-key.sh`), potem `age-key-temp.sh` z kluczem z menedżera haseł (bez `age.pub` zostawi go bez porównania), `age-keygen -y ../secrets/age.key > ../secrets/age.pub`, `.env.backup` jak w 1.8 — nowe kopie szyfruje ten sam klucz.

**Podejrzenie przejęcia serwera albo klucza B2:** Object Lock blokuje usunięcie kopii przez 14 dni, ale nie ich **ukrycie** — kluczem z serwera da się ukryć wszystkie pliki (`rclone lsf` i `restore.sh offsite:…` ich nie widzą), a reguła Lifecycle usuwa ukrytą wersję dzień po końcu blokady. Od razu w panelu B2: **Application Keys → usuń `prokom-vps-backup`** i **Lifecycle Settings kosza → „Keep all versions”**. Ukryte kopie: `rclone lsf --b2-versions offsite:prokom-backups-r7k2/prod/daily/` (nowym kluczem, z komputera albo nowego serwera), pobranie wersji: `rclone copyto --b2-version-at <czas sprzed ataku> offsite:prokom-backups-r7k2/prod/daily/<plik> <plik>` albo w panelu B2 (Browse Files → pokaż wersje → przywróć). Kopie `monthly` (93 dni) blokada chroni tylko przez pierwsze 14 dni. Po sprzątaniu: nowy klucz (`b2-key.sh`) i Lifecycle z powrotem.

## 7. Comiesięczny test odtworzenia

Na osobnym stosie — produkcja i staging zostają nietknięte.
1. `.env.restoretest` = kopia `.env.prod` z `APP_PORT=3200`, dopisanym `ENV_FILE=../.env.restoretest` (żeby kontener nie czytał `.env.prod`) i **`SMTP_HOST=127.0.0.1`** — odtworzona baza ma prawdziwe zapytania, a stos testowy nie może wysyłać maili do klientów ani skrzynek. Inne hasło bazy dozwolone, byle zgodne z `DATABASE_URL`.
2. `docker compose -p prokom-restoretest --env-file .env.restoretest -f docker/compose.prod.yml up -d`, czekaj na `healthy` (`prokom-restoretest-app-1`).
3. `scripts/restore.sh offsite:prokom-backups-r7k2/prod/daily/<najnowszy> prokom-restoretest prokom_prod` (klucz jak w 6.1; bez pytania: `RESTORE_CONFIRM=prokom-restoretest`).
4. `PANEL_HOST=<panel> bash scripts/smoke.sh http://127.0.0.1:3200 <domeny…>` i porównanie liczby stron/zapytań z produkcją (`docker exec prokom-prod-postgres-1 psql -U prokom -d prokom_prod -c 'select count(*) from pages'`).
5. **Od razu** `docker compose -p prokom-restoretest … down -v` — stos zajmuje do ~2,3 GB RAM obok produkcji i stagingu, a jego zadania w tle (np. retencja zapytań) działają na kopii danych osobowych. Potem `rm .env.restoretest`, `shred -u ../secrets/age.key` i wpis w tabeli niżej.

**Dopóki nie ma produkcji — test na kopii stagingu:** `.env.restoretest` = kopia `.env.staging` z `APP_PORT=3200` (`SMTP_HOST` stagingu i tak wskazuje `127.0.0.1`), stos `docker compose -p prokom-restoretest --env-file .env.restoretest -f docker/compose.prod.yml -f docker/compose.staging.yml up -d` (baza `prokom_staging`), `restore.sh offsite:prokom-backups-r7k2/staging/daily/<najnowszy> prokom-restoretest prokom_staging`, smoke na `http://127.0.0.1:3200` z domenami stagingu, porównanie liczby rekordów z `prokom-staging-postgres-1`; sprzątanie jak w 5 (`down -v` z oboma plikami compose). Nginx nie widzi stosu testowego — kieruje ruch po nazwach kontenerów `prokom-staging-app-1` / `prokom-prod-app-1`.

| Data | Kopia | Wynik |
|---|---|---|
| 1.11.2026 | `staging/daily/prokom-staging-20261101T133300Z` z B2 | zgodne: 3 tenanty, 29 stron, 437 produktów, 1370 mediów (3641 plików), 54 migracje; smoke zielony |

## 8. „Strona nie działa”

Po kolei, od zewnątrz do środka:
1. **Co dokładnie?** Jedna domena czy wszystkie, strona czy panel, błąd czy brak odpowiedzi. Identyfikator z nagłówka `X-Request-Id` (narzędzia przeglądarki) prowadzi do linii w logach.
2. **DNS i certyfikat:** `curl -sI https://<domena>` — błąd TLS/certyfikatu → `docker logs prokom-proxy-certbot-1`, data ważności: `echo | openssl s_client -connect <domena>:443 -servername <domena> 2>/dev/null | openssl x509 -noout -enddate`.
3. **Kontenery:** `docker ps --format '{{.Names}} {{.Status}}'` — każdy `Up`, aplikacja `(healthy)`.
4. **Nginx:** `docker logs --tail 50 prokom-proxy-nginx-1` — 502 = aplikacja nie odpowiada (krok 5); 444/brak odpowiedzi = domena nie ma bloku `server` (`.env.proxy`).
5. **Aplikacja:** `curl -s -H 'Host: <domena>' http://127.0.0.1:3000/api/health` (staging: 3001) — 503 = baza; `docker logs --tail 100 prokom-prod-app-1` (JSON: `level`, `msg`, `requestId`, `errorCode`).
6. **Baza:** `docker exec prokom-prod-postgres-1 pg_isready -U prokom` i `docker logs --tail 50 prokom-prod-postgres-1`.
7. **Zasoby:** `df -h` (pełny dysk = logi, kopie w `../backups`, obrazy: `docker image prune`), `free -m`, `docker stats --no-stream`.
8. **Ostatnie zmiany:** co i kiedy wdrożono — jeśli awaria zaczęła się po wdrożeniu, najpierw **4A**, diagnoza potem.
9. Jedna domena pokazuje 404 na `/`: brak opublikowanej strony `home` tego tenanta albo domena nie jest wpisana w `Tenants` (panel).
