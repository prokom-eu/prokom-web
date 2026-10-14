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
2. Merge do `develop` → obraz Docker (tag = SHA) → GHCR (`ghcr.io/prokom-eu/prokom-web`) → wdrożenie na staging przez SSH → migracje → testy e2e.
3. Merge `develop` → `main` **tylko po akceptacji szefa w Asanie** → ten sam obraz na produkcję → `pg_dump` → migracje → smoke test.

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
2. Rekord A/AAAA → IP serwera; **nie ruszamy MX/SPF/DKIM/DMARC**.
3. Domeny (prod + staging) w rekordzie `Tenants`.
4. Certyfikat Let's Encrypt, blok `server` w Nginx.
5. Search Console: weryfikacja DNS, sitemap.
6. Monitoring dostępności.
