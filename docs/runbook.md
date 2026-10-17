# Runbook — prokom-web na serwerze

Co robić krok po kroku przy wdrożeniu, cofnięciu, odtworzeniu z kopii i awarii. Opis stosów, Nginx i pipeline: `docs/wdrozenia.md`. Polecenia uruchamiasz w katalogu repo na serwerze (ścieżki w S10). Kroki 2–6 przećwiczone lokalnie 17.10.2026 (S9b-2) na stosach z obrazu.

## 0. Co gdzie jest

| Rzecz | Gdzie | Uwagi |
|---|---|---|
| Stos produkcji | projekt `prokom-prod`: `docker/compose.prod.yml`, zmienne `.env.prod` | kontenery `prokom-prod-app-1`, `prokom-prod-postgres-1` |
| Stos stagingu | projekt `prokom-staging`: `compose.prod.yml` + `compose.staging.yml`, zmienne `.env.staging` | baza `prokom_staging` |
| Nginx + certbot | projekt `prokom-proxy`: `docker/compose.proxy.yml`, zmienne `.env.proxy` | jedyny z portami 80/443 |
| Kopie | `scripts/backup.sh`, `scripts/restore.sh`, zmienne `.env.backup` | lokalnie `../backups/`, poza serwerem `RCLONE_REMOTE` |
| Sekrety | `.env.*` w repo (poza Gitem), plik hasła stagingu `../secrets/` | wartości w menedżerze haseł |
| Klucz prywatny `age` | **tylko** menedżer haseł („prokom-web backup age”) | na serwerze jest tylko klucz publiczny |

Skróty używane niżej:
```bash
prod="docker compose --env-file .env.prod -f docker/compose.prod.yml"
staging="docker compose --env-file .env.staging -f docker/compose.prod.yml -f docker/compose.staging.yml"
```

## 1. Jednorazowo na serwerze (S10)

1. `docker login ghcr.io -u <konto GitHub>` z tokenem **tylko** `read:packages` (osobny token, nie główny; w menedżerze haseł). Pakiet w GHCR jest prywatny.
2. `docker network create prokom-proxy`, plik hasła stagingu i pierwsze certyfikaty — `docs/wdrozenia.md` → „Nginx i staging”.
3. Kopie:
   - `sudo apt install age rclone`;
   - `rclone config` — cel poza serwerem (`TODO(S10)`: dostawca inny niż Seohost, ADR-002), nazwa np. `offsite`;
   - `.env.backup` wg `.env.example` (sekcja „Backup”): `AGE_RECIPIENT` = klucz publiczny z `age-keygen` (klucz prywatny od razu do menedżera haseł i usunąć z serwera), `RCLONE_REMOTE=offsite:prokom-backups`;
   - `mkdir -p ../backups` (cron zapisuje log tam, zanim skrypt cokolwiek utworzy);
   - cron (`crontab -e`), noc, poza godziną zadania retencji zapytań (03:00):
     ```
     30 2 * * * cd <repo> && scripts/backup.sh prod >> ../backups/backup.log 2>&1
     45 2 * * * cd <repo> && scripts/backup.sh staging >> ../backups/backup.log 2>&1
     ```
   - rotacja logu: `/etc/logrotate.d/prokom-backup` z `<repo>/../backups/backup.log { monthly rotate 6 compress missingok notifempty }`;
   - kopia `monthly` powstaje tylko z przebiegu nocnego 1. dnia miesiąca (UTC) — jeśli ten się nie uda, w danym miesiącu jej nie ma; dlatego alarm o braku świeżej kopii (S10).

## 2. Wdrożenie stagingu (ręcznie, zanim zrobi to pipeline w S10)

1. Tag obrazu = SHA commita z `develop` (lista: zakładka Actions → „Image” albo GHCR).
2. W `.env.staging`: `APP_IMAGE_TAG=<SHA>`.
3. `$staging pull app && $staging up -d`
4. Czekaj na zdrowie (migracje uruchamia aplikacja przy starcie): `docker inspect -f '{{.State.Health.Status}}' prokom-staging-app-1` → `healthy`.
5. `SMOKE_AUTH=szef:<hasło> PANEL_HOST=<panel stagingu> bash scripts/smoke.sh https://127.0.0.1 <domeny stagingu…>`

## 3. Wdrożenie produkcji

Tylko po akceptacji szefa w Asanie i tylko obraz, który przeszedł staging (ADR-004).
1. Kopia przed wdrożeniem: `scripts/backup.sh prod predeploy` — musi się skończyć `done`.
2. Zapisz obecny tag (punkt powrotu): `grep APP_IMAGE_TAG .env.prod`.
3. W `.env.prod`: `APP_IMAGE_TAG=<SHA ze stagingu>`.
4. `$prod pull app && $prod up -d app`
5. Zdrowie jak wyżej (`prokom-prod-app-1`), potem smoke: `PANEL_HOST=<panel> bash scripts/smoke.sh https://127.0.0.1 <domeny…>`.
6. Smoke czerwony albo aplikacja nie wstaje w ~3 min → **4. Cofnięcie**.

## 4. Cofnięcie wdrożenia

**A. Tylko obraz** (migracje nowej wersji były zgodne wstecz — patrz 5):
1. W `.env.prod` poprzedni `APP_IMAGE_TAG` (z kroku 3.2).
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

1. Klucz prywatny z menedżera haseł do pliku tylko na czas odtworzenia: `install -m 600 /dev/null ../secrets/age.key`, wklej, w `.env.backup` `AGE_IDENTITY=../secrets/age.key`. **Po odtworzeniu usuń plik.**
2. Wybór kopii: lokalnie `ls ../backups/prod/{daily,monthly,predeploy}/`, poza serwerem `rclone ls offsite:prokom-backups/prod/`.
3. `scripts/restore.sh <plik albo offsite:prokom-backups/prod/daily/<plik>> prokom-prod prokom_prod`
   - uruchamia potem **ten sam kontener** (obraz, z którego powstał); jeśli w `.env.prod` jest inny tag, użyj `--no-start` i `$prod up -d app`;
   - baza z manifestu musi się zgadzać z podaną (`prokom_prod`) — kopia stagingu nie trafi na produkcję przez pomyłkę;
   - pokazuje manifest (data, obraz, lista migracji) i pyta o nazwę projektu;
   - zły klucz → „cannot decrypt … nothing was changed”;
   - zatrzymuje aplikację, odtwarza bazę (`pg_restore` na nowo utworzoną) i wolumen mediów, uruchamia aplikację i czeka na `healthy`.
4. Smoke (krok 3.5).

Serwer stracony w całości: nowy serwer wg 1 → stosy wg 2/3 z ostatnim tagiem z manifestu (`app_image`) → 6.

## 7. Comiesięczny test odtworzenia

Na osobnym stosie — produkcja i staging zostają nietknięte.
1. `.env.restoretest` = kopia `.env.prod` z `APP_PORT=3200`, dopisanym `ENV_FILE=../.env.restoretest` (żeby kontener nie czytał `.env.prod`) i **`SMTP_HOST=127.0.0.1`** — odtworzona baza ma prawdziwe zapytania, a stos testowy nie może wysyłać maili do klientów ani skrzynek. Inne hasło bazy dozwolone, byle zgodne z `DATABASE_URL`.
2. `docker compose -p prokom-restoretest --env-file .env.restoretest -f docker/compose.prod.yml up -d`, czekaj na `healthy` (`prokom-restoretest-app-1`).
3. `scripts/restore.sh offsite:prokom-backups/prod/daily/<najnowszy> prokom-restoretest prokom_prod` (klucz jak w 6.1).
4. `PANEL_HOST=<panel> bash scripts/smoke.sh http://127.0.0.1:3200 <domeny…>` i porównanie liczby stron/zapytań z produkcją (`docker exec prokom-prod-postgres-1 psql -U prokom -d prokom_prod -c 'select count(*) from pages'`).
5. **Od razu** `docker compose -p prokom-restoretest … down -v` — stos zajmuje do ~2,3 GB RAM obok produkcji i stagingu, a jego zadania w tle (np. retencja zapytań) działają na kopii danych osobowych. Usuń klucz, wpisz datę testu w `docs/STAN.md`.

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
