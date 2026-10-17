# Wdrożenia

> Serwer: VPS Seohost (ADR-002). Adresy, użytkownik SSH i ścieżki uzupełniamy w S10.

## Środowiska
| Środowisko | Gałąź | Adres | Baza | Indeksowanie |
|---|---|---|---|---|
| lokalne | dowolna | `*.localhost:3000` | Docker lokalnie | — |
| staging | `develop` | `staging.<domena>` (hasło) | `prokom_staging` | `noindex` |
| produkcja | `main` | domeny docelowe | `prokom_prod` | tak |

## Pipeline (GitHub Actions)
1. PR → lint, typecheck, test, build, gitleaks.
2. Merge do `develop` → obraz Docker (tag = SHA) → GHCR (`ghcr.io/prokom-eu/prokom-web`) → wdrożenie na staging przez SSH → migracje → smoke test (`scripts/smoke.sh`) → testy e2e → Lighthouse CI (budżet z `jakosc.md`).
3. Merge `develop` → `main` **tylko po akceptacji szefa w Asanie** → ten sam obraz (zbudowany z `develop`, nie budowany ponownie) na produkcję → `pg_dump` → migracje → smoke test.
4. Smoke test nie przechodzi → wdrożenie nieudane, automatyczny powrót do poprzedniego obrazu aplikacji (baza bez zmian), alert.

## Obraz i start aplikacji (S9a)
- `Dockerfile` (wieloetapowy): pełna instalacja → `pnpm build` (zmienne tylko atrapy) → obraz z `.next/standalone`, użytkownik `node`, `HEALTHCHECK` na `/api/health`. Lokalnie: `docker build -t prokom-web:local .`.
- `.github/workflows/image.yml`: każdy push do `develop` → `ghcr.io/prokom-eu/prokom-web:<SHA>`. Na `main` obraz **nie** jest budowany: squash do `main` daje nowy SHA, a produkcja ma dostać obraz przetestowany na stagingu — pipeline S10 promuje tag z `develop` (np. `docker buildx imagetools create`).
- `docker/compose.prod.yml`: `app` + `postgres` (wolumeny `pgdata`, `media`; limity pamięci; rotacja logów 5 × 10 MB). Zmienne w `.env.prod` obok repo (wzór: `.env.example`, sekcja „Server only”).
- **Migracje** uruchamia sama aplikacja przy starcie (`prodMigrations` w `payload.config.ts`, tylko `NODE_ENV=production`) — wdrożenie jest gotowe, gdy `/api/health` odpowiada 200. Przed wdrożeniem produkcji: `pg_dump` (skrypt w S9b).
- `/api/health` odpowiada na każdym hoście (200 / 503, bez danych). Każda odpowiedź ma `X-Request-Id` (przyjęty z Nginx `$request_id` albo nowy) — ten sam identyfikator jest w logach.
- Logi: JSON na stdout (`level`, `time`, `msg`, `tenant`, `requestId`) — `lib/log.ts` i logger Payload w produkcji. Odczyt: `docker compose -f docker/compose.prod.yml logs app`.
- Smoke test: `PANEL_HOST=<domena panelu> bash scripts/smoke.sh http://127.0.0.1:3000 <domena> …` (Host w nagłówku; bez domen — trzy lokalne `*.localhost`, panel domyślnie `panel.localhost`).

## Kopie zapasowe
- Co noc: `pg_dump` (prod i staging) + katalog mediów → poza serwer (inna lokalizacja/dostawca), szyfrowane. Retencja: 14 dziennych + 3 miesięczne.
- Przed każdym wdrożeniem produkcji: dodatkowy `pg_dump`.
- Raz w miesiącu: próbne odtworzenie na stagingu.

## Cofnięcie wdrożenia
1. Ustaw poprzedni tag obrazu (`APP_IMAGE_TAG`).
2. `docker compose -f docker/compose.prod.yml up -d app`.
3. Jeśli migracja zmieniła dane — odtworzenie bazy z kopii sprzed wdrożenia (decyzja ręczna).

## Nowa domena — checklista
1. Domena kupiona u Seohost (abonent: firma).
2. Najpierw wpis w `docs/dns.md` (PR), potem rekord A/AAAA → IP serwera. Przy istniejących domenach z pocztą **nie ruszamy MX/SPF/DKIM/DMARC** bez osobnego planu (ADR-002).
2a. Domena wysyłająca powiadomienia z formularzy: SPF, DKIM, DMARC wg `docs/dns.md`, test w mail-tester.com.
3. Domeny (prod + staging) w rekordzie `Tenants`.
4. Certyfikat Let's Encrypt, blok `server` w Nginx.
5. Search Console: weryfikacja DNS, sitemap.
6. Monitoring dostępności.
