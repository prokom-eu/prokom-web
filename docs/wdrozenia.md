# Wdrożenia

> Serwer: VPS webh.pl, Ubuntu 24.04 (ADR-019); repo na serwerze w `/srv/prokom/prokom-web`, przygotowanie serwera — `docs/runbook.md` §1. Domeny i DNS: Seohost (`docs/dns.md`).

## Środowiska
| Środowisko | Gałąź | Adres | Baza | Indeksowanie |
|---|---|---|---|---|
| lokalne | dowolna | `*.localhost:3000` | Docker lokalnie | — |
| staging | `develop` | `staging.<domena>` (hasło) | `prokom_staging` (stos `prokom-staging`) | `noindex` |
| produkcja | `main` | domeny docelowe | `prokom_prod` (stos `prokom-prod`) | tak |

## Pipeline (GitHub Actions)
1. PR → lint, typecheck, test, build, gitleaks.
2. Merge do `develop` → obraz Docker (tag = SHA) → GHCR (`ghcr.io/prokom-eu/prokom-web`) → **„Deploy staging”** (S10b): przez SSH z kluczem ograniczonym do `deploy staging <SHA>` (bez plików — pliki wdrożenia bramka bierze z obrazu, `/deploy`) → `scripts/deploy.sh` (migracje przy starcie, `healthy`, smoke test na porcie aplikacji, przy błędzie automatyczny powrót, o ile nie weszły nowe migracje) → Lighthouse CI (budżet z `jakosc.md`, S10c). Szczegóły i ręczne uruchomienie: runbook §2.
3. Merge `develop` → `main` **tylko po akceptacji szefa w Asanie** → ten sam obraz (zbudowany z `develop`, nie budowany ponownie) na produkcję → `pg_dump` → migracje → smoke test.
4. Smoke test nie przechodzi → wdrożenie nieudane, automatyczny powrót do poprzedniego obrazu aplikacji (baza bez zmian), alert.

## Obraz i start aplikacji (S9a)
- `Dockerfile` (wieloetapowy): pełna instalacja → `pnpm build` (zmienne tylko atrapy) → obraz z `.next/standalone`, użytkownik `node`, `HEALTHCHECK` na `/api/health`. Lokalnie: `docker build -t prokom-web:local .`.
- `.github/workflows/image.yml`: każdy push do `develop` → `ghcr.io/prokom-eu/prokom-web:<SHA>`. Na `main` obraz **nie** jest budowany: squash do `main` daje nowy SHA, a produkcja ma dostać obraz przetestowany na stagingu — pipeline S10 promuje tag z `develop` (np. `docker buildx imagetools create`).
- `docker/compose.prod.yml`: `app` + `postgres` (wolumeny `pgdata`, `media`; limity pamięci; rotacja logów 5 × 10 MB). Zmienne w `.env.prod` obok repo (wzór: `.env.example`, sekcja „Server only”).
- **Migracje** uruchamia sama aplikacja przy starcie (`prodMigrations` w `payload.config.ts`, tylko `NODE_ENV=production`) — wdrożenie jest gotowe, gdy `/api/health` odpowiada 200. Przed wdrożeniem produkcji: `pg_dump` (skrypt w S9b).
- `/api/health` odpowiada na każdym hoście (200 / 503, bez danych). Każda odpowiedź ma `X-Request-Id` (przyjęty z Nginx `$request_id` albo nowy) — ten sam identyfikator jest w logach.
- Logi: JSON na stdout (`level`, `time`, `msg`, `tenant`, `requestId`) — `lib/log.ts` i logger Payload w produkcji. Odczyt: `docker compose -f docker/compose.prod.yml logs app`.
- Smoke test: `PANEL_HOST=<domena panelu> bash scripts/smoke.sh http://127.0.0.1:3000 <domena> …` (Host w nagłówku; bez domen — trzy lokalne `*.localhost`, panel domyślnie `panel.localhost`). Sprawdza na każdej domenie `/`, `sitemap.xml`, `robots.txt`, `/mapa-strony` i 404 dla `/admin`; domena z „biznes” w nazwie musi dać 200 na `/oferta`, `/zapytanie`, z „software” — na `/rozwiazania` i `/api/solutions-index`, obie na `/aktualnosci`; pozostałe — 404 (strażnik linii). Tylko trasy działające bez treści z panelu, bo błąd smoke cofa wdrożenie.
- **Skan treści przed produkcją (SW12, spec. prokomsoftware §10 pkt 9–10):** `SCAN_AUTH=użytkownik:hasło node scripts/content-scan.mjs https://staging.prokomsoftware.pl` — wszystkie adresy z `sitemap.xml` + `/dziekujemy` + 404: zero zaślepek w nawiasach (`[TELEFON SOFTWARE]`, `[ROK …]`…) i zero nazw konkurencji. Na stagingu zaślepki są widoczne celowo (produkcja chowa niewypełnione fakty) — raport to lista faktów do uzupełnienia w panelu; produkcja dopiero przy pustym raporcie.

## Nginx i staging (S9b-1)
Trzy stosy Docker Compose na jednym serwerze, połączone siecią `prokom-proxy`:
- `docker/compose.proxy.yml` (`prokom-proxy`): Nginx + certbot, jedyny z portami 80/443. Konfiguracja w `docker/nginx/`: `nginx.conf`, `snippets/`, `templates/` (domeny z `.env.proxy`). Sam plik obsługuje **staging**; domeny produkcji dodaje nakładka `docker/compose.proxy.prod.yml` (szablon `prod.conf.template`, zmienne `PROD_*`); `www.<domena>` z `PROD_WWW_HOSTS` odpowiada 301 na domenę bez `www` (nazwy `www` muszą być w certyfikacie `prokom-prod`, tenant zna tylko domenę bez `www`) — dołączana przy starcie produkcji, bo Nginx nie wstaje z blokiem `server`, którego certyfikatu jeszcze nie ma (S10, wariant „produkcja osobno”). Aplikacje znajduje po nazwie kontenera (`prokom-prod-app-1`, `prokom-staging-app-1`) w chwili żądania, więc startuje także, gdy jeden stos nie działa.
- **PRO-KOM Gaming** (repo `prokom-gaming`, sesja G16): nakładki `docker/compose.proxy.gaming-staging.yml` (`GAMING_STAGING_HOST`, certyfikat `prokom-gaming-staging`) i `compose.proxy.gaming-prod.yml` (`GAMING_PROD_HOST`, certyfikat `prokom-gaming-prod`, `www` → 301), wspólny fragment `snippets/gaming.conf`: strona i panel na jednej domenie (`/admin`), body 1 MB (`/admin`, `/api/` 20 MB), `/admin/create-first-user` i `/api/users/first-register` zawsze 404, `/_s/script.js` i `/_s/api/send` → kontener Umami stosu Gaming, limity `/api/inquiry` i `/api/konto/`. Staging Gaming za tym samym plikiem hasła; `/admin/sw.js` i `/admin/manifest.webmanifest` bez hasła (pobiera je przeglądarka w tle — push, ADR-G010 Gaming). Kontenery: `prokom-gaming-<stos>-app-1`, `-umami-1`. Procedury: `prokom-gaming/docs/runbook.md`.
- **PRO-KOM Tech** (`prokomserwis.pl`, repo `prokom-system`, `docs/tech/WDROZENIE.md` tam): nakładki `docker/compose.proxy.tech-staging.yml` (`TECH_STAGING_HOST`, certyfikat `prokom-tech-staging`) i `compose.proxy.tech-prod.yml` (`TECH_PROD_HOST`, certyfikat `prokom-tech-prod` na domenę i `www`), wspólny fragment `snippets/tech.conf`: cały ruch do wewnętrznego routera stosu Tech `prokom-tech-<stos>-gateway-1:80` (nginx bez TLS — dzieli Django i Next), body 20 MB na całym vhoście (zdjęcia w panelu serwisu), `X-Forwarded-Proto` z `proxy.conf` (Django ma `SECURE_SSL_REDIRECT`). **Bez `headers-common.conf`:** Django wysyła HSTS (`includeSubDomains`, `preload`), `X-Frame-Options` i `nosniff`, Next własne nagłówki — drugi HSTS/`X-Frame-Options` z proxy byłby zdublowanym nagłówkiem (tak jest na Hetznerze). Produkcja: `prokomserwis.pl` i `www` obsługiwane tak samo, **bez 301** (1:1 z Hetznerem). Staging za tym samym plikiem hasła i z `noindex`, poza `/api/` (API Django bez hasła: front wysyła `Authorization: Token …`, a przeglądarka ma jeden nagłówek `Authorization` — basic auth dawałby 401 po zalogowaniu; API i tak wymaga tokena, `noindex` zostaje). Certyfikaty bez zatrzymywania Nginx (`docs/runbook.md` §0); nakładka produkcji dochodzi do polecenia startu proxy dopiero przy przełączeniu z Hetznera (29.11, `docs/runbook.md` §9).
- `docker/compose.prod.yml` (`prokom-prod`) i ta sama definicja + `docker/compose.staging.yml` (`prokom-staging`): osobne bazy, wolumeny i limity pamięci. Staging zawsze czyta `.env.staging` (na sztywno w nakładce), więc nie może dostać sekretów produkcji.

Co robi Nginx:
- HTTP → HTTPS (301), poza `/.well-known/acme-challenge/` (odnawianie certyfikatów).
- Obce hosty: brak odpowiedzi (444, a przez HTTPS bez certyfikatu).
- Nadpisuje nagłówki od klienta: `Host`, `X-Real-IP` (limit zapytań w aplikacji), `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Request-Id` (`$request_id` — ten sam identyfikator w logu Nginx i aplikacji).
- Nagłówki: HSTS (bez `includeSubDomains`, bo pro-kom.eu ma inne usługi), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, bazowe CSP (`frame-ancestors`, `base-uri`, `object-src`, `form-action`). Strony: ramki zabronione, poza `/podglad/` (tylko z domeny panelu). Panel: ramki tylko z własnej domeny.
- Limity: body 64 KB na domenach stron, 20 MB na panelu (obrazy); `/api/health` 1 żądanie/s na IP (zapas 10), `/api/inquiry` 10/min na IP (zapas 5) — odpowiedź 429.
- Staging: hasło (basic auth) i `X-Robots-Tag: noindex, nofollow` na wszystkim.
- Logi dostępu JSON na stdout, adres **bez query** (tokeny podglądu nie trafiają do access logu). Wyjątek: log błędów Nginx przy błędzie aplikacji (502, restart) zapisuje pełną linię żądania, także z tokenem podglądu — token jest podpisany i krótkotrwały, a log błędów rotowany jak reszta.

Pierwsze uruchomienie na serwerze (S10, szczegóły w runbooku):
1. `docker network create prokom-proxy` (raz).
2. Plik hasła stagingu poza repo (ścieżka w `STAGING_HTPASSWD_FILE`, względna do `docker/`); `openssl` zapyta o hasło:
   ```bash
   printf 'szef:%s\n' "$(openssl passwd -apr1)" > ../secrets/staging.htpasswd
   ```
3. Pierwsze certyfikaty, zanim wystartuje Nginx (bez nich nie ruszy) — certbot z kontenera, na wolumenie `prokom-proxy_letsencrypt`, port 80 wolny:
   ```bash
   docker compose --env-file .env.proxy -f docker/compose.proxy.yml run --rm -p 80:80 --entrypoint certbot certbot certonly --standalone --cert-name prokom-prod -d prokombiznes.pl -d …
   ```
   W S10 najpierw tylko `--cert-name prokom-staging` (domeny stagingu i panel stagingu); `--cert-name prokom-prod` dla domen produkcji i `panel.prokombiznes.pl` — przy pierwszym wdrożeniu produkcji (runbook §3), gdy ich rekordy wskazują serwer. Później odnawia kontener `certbot` (`renew --webroot`, co 12 h; przy odnowieniu zapisuje webroot w miejsce `standalone`), a Nginx przeładowuje się co 6 h.
4. `docker compose --env-file .env.proxy -f docker/compose.proxy.yml up -d` (od startu produkcji: dodatkowo `-f docker/compose.proxy.prod.yml`; od stagingu Gaming: `-f docker/compose.proxy.gaming-staging.yml`, od produkcji Gaming także `-f docker/compose.proxy.gaming-prod.yml`; Tech: `-f docker/compose.proxy.tech-staging.yml`, od przełączenia produkcji Tech także `-f docker/compose.proxy.tech-prod.yml`), potem stosy aplikacji.
5. Smoke przez Nginx: `PANEL_HOST=<panel> bash scripts/smoke.sh https://127.0.0.1 <domeny…>` (staging: `SMOKE_AUTH=użytkownik:hasło`).

Test lokalny (S9b-1, 17.10): certyfikaty self-signed, porty 18080/18443, `SMOKE_INSECURE=1` — smoke zielony, nagłówki jak wyżej, staging 401 bez hasła, obcy host 444, 413 dla dużego body, 429 na health, ten sam `requestId` w obu logach.

## Kopie zapasowe (S9b-2)
- `scripts/backup.sh <prod|staging> [predeploy]`: `pg_dump -Fc` (sprawdzony `pg_restore --list`) + wolumen mediów + manifest (data, obraz, lista migracji) w jednym pliku, szyfrowanym `age` kluczem publicznym → `../backups/<stos>/<rodzaj>/` i `RCLONE_REMOTE/<stos>/<rodzaj>/` (poza serwerem, inny dostawca niż serwer — ADR-019; cel: `TODO(krystian)`).
- Rodzaje i retencja (usuwanie po wieku, lokalnie i zdalnie): `daily` 14 dni, `monthly` (kopia z 1. dnia miesiąca) 93 dni, `predeploy` 30 dni.
- Co noc z crona (prod i staging); przed każdym wdrożeniem produkcji `backup.sh prod predeploy`.
- `scripts/restore.sh <plik|zdalna ścieżka> <projekt> <baza>`: odszyfrowanie kluczem prywatnym (tylko menedżer haseł), baza od nowa (`pg_restore`), wolumen mediów od nowa, aplikacja z powrotem `healthy`. Na `prokom-prod`/`prokom-staging` pyta o nazwę projektu.
- Raz w miesiącu: próbne odtworzenie na osobnym stosie `prokom-restoretest` (runbook §7).
- Test 17.10 (lokalnie): kopia stosu z obrazu → wysyłka `rclone` → odtworzenie na czystym stosie: liczby rekordów i suma kontrolna mediów zgodne, smoke zielony, logowanie admina działa; zły klucz przerywa przed zmianami; retencja usuwa stare pliki.
- Procedury krok po kroku: `docs/runbook.md`.

## Teksty Instalacji w panelu (runda v6 D4)
Seed działa tylko lokalnie, więc teksty linii Instalacje przechowywane w panelu (usługi, obiekty, 76 rozwiązań, SEO stron, wpis Poradnika, liczby „O firmie”) przenosi na staging i produkcję `pnpm inst:texts` (`src/seed/instalacje/inst-texts.ts`, REST panelu). Ceny, relacje, kolory i media zostają z panelu.
1. Po wdrożeniu obrazu: `INST_TEXTS_EMAIL` i `INST_TEXTS_PASSWORD` (admin tego panelu, z menedżera haseł) tylko na czas uruchomienia.
2. Podgląd: `pnpm inst:texts https://<panel> --out=docs/tresci/inst-texts-<data>.md`. Domyślnie nic nie zapisuje, a raport „pole: było → będzie” czytamy przed zapisem.
3. Zapis: `pnpm inst:texts https://<panel> --write --yes`. Poza komputerem lokalnym wymagane są `https` i `--yes`.
4. Rekordy ze szkicem czekającym w panelu (np. ceny szefa) są pomijane i wypisane w raporcie: sprawdzić ręcznie. Strony i wpisy zachowują status publikacji, a szkic dostaje nową wersję szkicu. Na produkcji: po kopii `predeploy`.

## Wpisy Software w panelu (SEO 15.11)
Wpisy poradnika Software są w repo jako Markdown (`seed/prokomsoftware/wpisy/*.md`). Lokalnie wgrywa je `pnpm seed:software`, na staging i produkcję przenosi je `pnpm software:posts` (`src/seed/software/software-posts.ts`, REST panelu). Brakujący wpis skrypt tworzy jako opublikowany z datą z pliku. Wpis z przyszłą datą jest ukryty do tego dnia, także w `sitemap.xml`, i pojawia się sam po wygaśnięciu pamięci podręcznej. Wpisu, który już jest w panelu, skrypt nie zmienia: w raporcie ma „różni się od pliku”, a nadpisuje go dopiero `--update`. Szkiców nie rusza nigdy.
1. Kopia `predeploy` (produkcja). `INST_TEXTS_EMAIL` / `INST_TEXTS_PASSWORD` (admin panelu, ta sama para co `inst:texts`) tylko na czas uruchomienia, na stagingu także `INST_TEXTS_BASIC`.
2. Podgląd: `pnpm software:posts https://<panel> --out=docs/tresci/software-posts-<data>.md` — tabela „utworzyć / bez zmian / różni się / szkic”.
3. Zapis: `pnpm software:posts https://<panel> --write --yes`. Przebieg jest powtarzalny: drugi niczego nie dubluje.
4. Poprawka tekstu po publikacji: w pliku `.md` i `--write --update --only=<slug> --yes` (`--only` ogranicza przebieg do tych wpisów, więc nie cofa edycji innych wpisów z panelu), albo w panelu (wtedy plik w repo trzeba poprawić tak samo, inaczej następne `--update` cofnie zmianę).
5. Kolejność wpisów z jednego dnia niesie godzina w `publishedAt` pliku (`2026-11-15 12:00`, czas polski). Pole w panelu pokazuje sam dzień, więc ręczna zmiana daty może zgubić godzinę. Kolejność przywraca `--write --update --only=<slug> --yes`.

## Realizacje Instalacji w panelu
Realizacje ze zdjęciami tworzy lokalnie tylko seed, więc na produkcji `/realizacje` i pas „Realizacje” na głównej były puste (12.11). Przenosi je `pnpm inst:realizacje` (`src/seed/instalacje/inst-realizacje.ts`, REST panelu): tworzy brakujące realizacje (opublikowane, ze zgodą klientów, decyzja szefa 01.11) i wgrywa ich zdjęcia z repo. Realizacji z panelu nie nadpisuje, zdjęcia dodaje tylko tym bez zdjęć, a szkice pomija.
1. Kopia `predeploy` (produkcja). `INST_TEXTS_EMAIL` / `INST_TEXTS_PASSWORD` (admin panelu) tylko na czas uruchomienia, na stagingu także `INST_TEXTS_BASIC` (hasło Nginx, `użytkownik:hasło`).
2. Podgląd: `pnpm inst:realizacje https://<panel> --out=docs/tresci/inst-realizacje-<data>.md` — tabela „utworzyć / dodać zdjęcia / bez zmian” i realizacje z panelu bez pary w repo (możliwy duplikat).
3. Zapis: `pnpm inst:realizacje https://<panel> --write --yes`. Uruchomienie jest powtarzalne: drugi przebieg niczego nie dubluje.

## pro-kom.eu — dzień startu

Hub (tenant `prokom`) wchodzi na produkcję, która już działa (Biznes, Instalacje, Software). Plan i kolejność: `docs/STAN.md` → „pro-kom.eu (hub)” → H7-2, `docs/dns.md` → „pro-kom.eu”, `docs/strony/prokomeu-seo-przeniesienie.md`. Polecenia z komputera Krystiana (Git Bash). Wszędzie `ssh` = `/c/Windows/System32/OpenSSH/ssh.exe` (klucz z agenta Windows).

**Warunki wejścia — bez nich STOP:**

- [ ] Zadanie Asany „SZEF · Akceptacja nowej pro-kom.eu” odhaczone.
- [ ] Poczta przestawiona w nazwa.pl **co najmniej 24 h wcześniej** (`docs/dns.md` → „pro-kom.eu”, kroki (a) i (b)):
  - `A mail`;
  - MX `mail.pro-kom.eu`;
  - SPF bez `a`;
  - test poczty w obie strony;
  - programy pocztowe pracowników przestawione;
  - TTL `A @` i `A www` = 300.
- [ ] Ostatni przebieg „Lighthouse” po wdrożeniu stagingu tym obrazem zielony dla adresów `staging.pro-kom.eu` (runbook §3). Gdy czerwona jest strona innej linii — decyduje Krystian.
- [ ] Na produkcji tenant `prokom` z Ustawieniami strony. Panel produkcji → Strony → nowa: slug `prokom`, linia `prokom`, e-mail powiadomień; potem Ustawienia strony. `prod-line-content.sh prokom` to sprawdza.
- [ ] Najlepiej dzień roboczy rano: ktoś odbiera telefony.

**Kroki:**

1. **Zapisz dwa obrazy.**
   - Obraz do wydania = SHA stagingu: `ssh prokom-vps "docker inspect prokom-staging-app-1 --format '{{.Config.Image}}'"` (część po `:`).
   - Punkt powrotu = obecny obraz produkcji: to samo dla `prokom-prod-app-1`.
2. **Kod na produkcję.** `scripts/deploy.sh` robi kopię `predeploy`, ustawia tag, uruchamia migracje przy starcie, robi smoke test i automatycznie wraca do poprzedniego obrazu, jeśli nowe migracje nie weszły:

   ```bash
   ssh prokom-vps 'cd /srv/prokom/prokom-web && bash scripts/deploy.sh prod <SHA stagingu>'
   ```

   Pliki `docker/` i `scripts/` na serwerze są z tego samego commita co staging (bramka stagingu je podmieniła), więc `deploy.sh` i smoke test pasują do obrazu. Wynik: ostatnia linia `../deploys.log` = `prod <stary> -> <SHA> ok`.

3. **Treść huba** (runbook §3a „Kolejna linia później”). Uruchamiasz z checkoutu commita produkcji, bez `.env`:

   ```bash
   git fetch && git worktree add --detach ../prokom-web-tresc <SHA stagingu>
   cd ../prokom-web-tresc && pnpm install --frozen-lockfile
   SSH=/c/Windows/System32/OpenSSH/ssh.exe bash scripts/prod-line-content.sh prokom
   cd - && git worktree remove ../prokom-web-tresc
   ```

   Skrypt robi kopię `predeploy`, otwiera tunel do bazy produkcji i uruchamia `seed:prokom` z `SEED_KEEP_COMPANY_DATA=1`. Wgrywa: teksty huba, narzędzia, pomoc, plany, 301 starej strony, numery stacjonarne i Zakopane. Potwierdzasz wpisując `prokom-prod`.

   Uruchom **przed** krokiem 6 (domena tenanta). Gdy tenant ma już domenę produkcji, skrypt odmawia; `PO_STARCIE=1` tylko z decyzji Krystiana.

4. **DNS w nazwa.pl.** Panel Klienta → Domeny → pro-kom.eu → Konfiguruj domenę → „Dodatkowy rekord DNS”. **Nie** zmieniaj trybu u góry strony.
   - Rekordy: `A @` → `194.28.50.70` i `A www` → `194.28.50.70`.
   - Czekaj na propagację: najpierw `nslookup pro-kom.eu ns1.nazwa.pl`, potem `nslookup pro-kom.eu 8.8.8.8`.
   - Od tej chwili pro-kom.eu na nowym IP odpowiada 444 (Nginx nie ma jeszcze bloku tej domeny). Dlatego kroki 5–7 robisz od razu po propagacji.
5. **Certyfikat** `prokom-prod`, poszerzony o `pro-kom.eu` i `www.pro-kom.eu` (runbook §0 „Nowy certyfikat bez zatrzymywania Nginx”). Let's Encrypt sprawdza domenę przez HTTP na nowym IP, więc tylko po kroku 4.
   - Obecne domeny certyfikatu (15.11): `prokomsoftware.pl panel.prokombiznes.pl prokombiznes.pl prokominstalacje.pl www.prokombiznes.pl www.prokominstalacje.pl www.prokomsoftware.pl`.
   - Przed poszerzeniem sprawdź listę: `… run --rm --entrypoint certbot certbot certificates`.

   ```bash
   ssh prokom-vps
   cd /srv/prokom/prokom-web
   docker exec prokom-proxy-nginx-1 nginx -t      # błąd „snippets”: runbook §0, --force-recreate
   docker exec prokom-proxy-nginx-1 sh -c 'printf "server {\n  listen 80;\n  server_name pro-kom.eu www.pro-kom.eu;\n  include /etc/nginx/snippets/acme.conf;\n}\n" > /etc/nginx/sites/zz-acme-tmp.conf && nginx -t && nginx -s reload'
   docker compose --env-file .env.proxy -f docker/compose.proxy.yml run --rm --entrypoint certbot certbot \
     certonly --webroot -w /var/www/certbot --cert-name prokom-prod --expand --non-interactive --agree-tos \
     -d prokomsoftware.pl -d panel.prokombiznes.pl -d prokombiznes.pl -d prokominstalacje.pl \
     -d www.prokombiznes.pl -d www.prokominstalacje.pl -d www.prokomsoftware.pl -d pro-kom.eu -d www.pro-kom.eu
   docker exec prokom-proxy-nginx-1 sh -c 'rm -f /etc/nginx/sites/zz-acme-tmp.conf && nginx -t && nginx -s reload'
   ```

6. **Nginx i domena tenanta.**
   - W `.env.proxy`: `pro-kom.eu` do `PROD_SITE_HOSTS`, `www.pro-kom.eu` do `PROD_WWW_HOSTS`. Najpierw kopia: `cp -p .env.proxy .env.proxy.bak-hub`.
   - Test i start z pełnym zestawem nakładek. Lista z 15.11 jest niżej. Sprawdź ją przed startem: `docker inspect prokom-proxy-nginx-1 --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}'`.

     ```bash
     P="docker compose --env-file .env.proxy -f docker/compose.proxy.yml -f docker/compose.proxy.prod.yml -f docker/compose.proxy.gaming-staging.yml -f docker/compose.proxy.gaming-prod.yml -f docker/compose.proxy.tech-staging.yml"
     $P run --rm --no-deps nginx nginx -t        # dalej tylko po „test is successful”:
     $P up -d --force-recreate --no-deps nginx   # kilka sekund przerwy wszystkich domen
     $P ps nginx
     ```

   - Panel produkcji (`panel.prokombiznes.pl`) → Strony → `prokom` → Domeny: `pro-kom.eu`, środowisko „Produkcja”. Bez `www` — 301 z `www` robi Nginx.

7. **Sprawdzenie** (plan SEO, „W dniu przełączenia”):

   ```bash
   for p in / /firma /produkt/reseller/kasy-fiskalne /index.php/firma /index.php /uslugi/serwis /produkty/muzyczne/ambiset; do
     curl -sI "https://pro-kom.eu$p" | grep -iE "^(HTTP|location)"; done
   curl -sI http://www.pro-kom.eu/firma | grep -iE "^(HTTP|location)"
   curl -s https://pro-kom.eu/robots.txt
   ssh prokom-vps 'cd /srv/prokom/prokom-web && PANEL_HOST=panel.prokombiznes.pl bash scripts/smoke.sh https://127.0.0.1 pro-kom.eu www.pro-kom.eu'
   ```

   Oczekiwane:
   - `/` → 200;
   - stare adresy → 301 jednym skokiem;
   - produkt sklepu → 404;
   - `robots.txt` produkcji: bez `Disallow: /`, z adresem sitemap.

   Potem ręcznie:
   - strony `/`, `/linie`, `/dla-firm`, `/inwestycje-i-dostawy`, `/kontakt` (numery, Zakopane, sobota), `/o-firmie`;
   - jedno zapytanie z formularza → wpis w Zapytaniach i mail na skrzynkę huba;
   - mail testowy na adres `@pro-kom.eu` (poczta dalej działa).

8. **Search Console i monitoring.**
   - Search Console: właściwość domeny `pro-kom.eu` (rekord TXT — najpierw wpis w `docs/dns.md`).
   - Mapy witryn: `https://pro-kom.eu/sitemap.xml`.
   - Sprawdzanie adresu URL, prośba o zindeksowanie: `/`, `/dla-firm`, `/inwestycje-i-dostawy`, `/kontakt`, `/o-firmie`.
   - Better Stack: monitor `https://pro-kom.eu/api/health`.
   - Umami: dopisać hub do `UMAMI_WEBSITES`.

**STOP — cofnięcie** (runbook §4):

- **Strona po starcie nie działa:** najszybciej przywrócić DNS w nazwa.pl. Usuń jawne `A @` i `A www` (albo ustaw je na `85.128.169.153`). Stara strona wraca po TTL (300 s). Poczta działa niezależnie (MX na `mail.pro-kom.eu`).
- **Wada kodu po kroku 2:** runbook §4 A. Poprzedni tag (z kroku 1) do `.env.prod`, `$prod up -d app`, zdrowie, smoke test. Migracja huba z 15.11 (`hub_kontakt_zakopane`) tylko dodaje, więc obraz można cofnąć bez cofania bazy.
- **Zepsute dane po kroku 3:** runbook §4 B, kopia `predeploy` z kroku 3. Ostateczność: kasuje zapytania i edycje żywych linii od chwili kopii.

**Po starcie (4–8 tygodni):**

- Codziennie przez tydzień, potem co tydzień: Search Console → „Nie znaleziono (404)” i „Strona z przekierowaniem” oraz logi Nginx (404 na `pro-kom.eu`).
- Brakujące reguły dopisujesz tylko w panelu (Przekierowania, tenant `prokom`). Reguł 301 nie usuwasz.
- Stary hosting nazwa.pl zostaje, bo trzyma pocztę: przedłużyć do 14.12.2026, decyzja o poczcie po listopadzie.

## Cofnięcie wdrożenia
Tylko obraz (migracje zgodne wstecz) albo obraz + baza z kopii `predeploy` — `docs/runbook.md` §4 i zasada migracji §5.

## Nowa domena — checklista
1. Domena kupiona u Seohost (abonent: firma); rekordy wskazują VPS webh.pl.
2. Najpierw wpis w `docs/dns.md` (PR), potem rekord A/AAAA → IP serwera. Przy istniejących domenach z pocztą **nie ruszamy MX/SPF/DKIM/DMARC** bez osobnego planu (ADR-002).
2a. Domena wysyłająca powiadomienia z formularzy: SPF, DKIM, DMARC wg `docs/dns.md`, test w mail-tester.com.
3. Domeny (prod + staging) w rekordzie `Tenants`.
4. Certyfikat Let's Encrypt, blok `server` w Nginx.
5. Search Console: weryfikacja DNS, sitemap.
6. Monitoring dostępności.
