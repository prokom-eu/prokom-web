# Architektura prokom-web

## W jednym zdaniu
Jedna aplikacja Next.js z wbudowanym Payload CMS 3 obsługuje wiele domen PRO-KOM; domena wybiera tenanta, a treści wszystkich stron edytuje się w jednym panelu.

## Przepływ żądania
```
przeglądarka → Nginx (SSL) → kontener app (Next.js + Payload) → PostgreSQL
                                   │
          middleware: host → tenant (prokombiznes.pl → "biznes"; nieznany host → 404)
                                   │
          app/(sites)/[tenant]/... → Payload Local API (zawsze filtr: tenant)
```
Panel `/admin` i zapisujące API — tylko na domenie panelu.

## Domeny i tenanci
| Domena | Tenant / linia | Status |
|---|---|---|
| prokombiznes.pl | `biznes` | październik 2026 |
| prokominstalacje.pl | `instalacje` | październik 2026 |
| prokomsoftware.pl | `software` | październik 2026 |
| pro-kom.eu (nowa, hub) | `prokom` | do 20.12.2026 |
| panel.pro-kom.eu | panel Payload | z fundamentem (rekord DNS) |
| `staging.<domena>` | jak wyżej | wersja testowa: hasło, `noindex`, osobna baza |
| lokalnie | `biznes.localhost`, `instalacje.localhost`, `software.localhost`, `panel.localhost` | dev |

Mapowanie domen jest w kolekcji `Tenants` (domeny produkcyjne i staging), nie w kodzie — nowa domena = wpis w panelu + DNS + certyfikat.

## Model treści
Fundament: ADR-006 (`Tenants`, `Users`, `CompanyData`, `SiteSettings`, `Pages`, `Media`, `Partners`, `Inquiries`, `Redirects`, bloki generyczne).
Ze specyfikacjami stron dochodzą: `Offers` (oferta Biznesu), `Projects` (realizacje), `Posts` (aktualności huba).

## Formularze i zapytania
Formularze → `POST /api/inquiry` → `submitInquiry()` (Zod, honeypot, czas, limit) → kolekcja `Inquiries` + powiadomienie e-mail. Kontrakt 1:1 z przyszłym modelem Django; w styczniu 2027 zapis przechodzi do PRO-KOM System (ADR-003).

## Połączenia z innymi systemami (później, nie w fundamencie)
- prokomserwis.pl (Django) — odczyt `CompanyData` przez REST API z kluczem.
- PRO-KOM System (2027) — przyjmuje zapytania; pulpit szefa czyta analitykę stron.

## Infrastruktura (ADR-002, ADR-004)
- VPS Seohost 4 vCPU / 8 GB: Docker Compose — `app`, `postgres`, `nginx` (+ certbot), kopie; staging i produkcja jako osobne stosy z osobnymi bazami.
- Obrazy budowane w GitHub Actions → GHCR (prywatnie).
- Kopie: `pg_dump` co noc + media → poza serwer; próbne odtworzenie raz w miesiącu.
- Monitoring: Sentry (błędy), zewnętrzny monitoring dostępności; analityka Umami (bez cookies) — po uruchomieniu serwera.

## Czego świadomie NIE robimy (na teraz)
Sklepu B2B (faza 2), mikroserwisów, Kubernetes, płatnych CMS-ów w chmurze, osobnych repozytoriów na każdą stronę, osobnej aplikacji panelu.
