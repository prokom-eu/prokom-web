# Architektura prokom-web

## W jednym zdaniu
Jedna aplikacja Next.js z wbudowanym Payload CMS 3 obsługuje wiele domen PRO-KOM; domena wybiera tenanta, a treści wszystkich stron edytuje się w jednym panelu.

## Przepływ żądania
```
przeglądarka → Nginx (SSL) → kontener app (Next.js + Payload) → PostgreSQL
                                   │
          src/proxy.ts (lib/tenant/routing): PANEL_HOST → /admin, /api; inne domeny:
          /admin, /api → 404, /brand/* (public/) bez zmian, reszta → rewrite na /<host>/<ścieżka>
                                   │
          app/(sites)/[domain]/layout: host → tenant (lib/tenant/byHost: baza, cache 60 s,
          czyszczony po zapisie w Tenants; nieznana / nieaktywna domena → 404)
                                   │
          strony → Payload Local API (zawsze filtr: tenant)
```
Panel `/admin` i całe API Payload — tylko na domenie panelu (`PANEL_HOST`). Proxy nie łączy się z bazą: tylko dzieli ruch po hoście; tenanta rozpoznaje layout (Node, Local API), który dodatkowo wymaga, by segment `[domain]` był równy nagłówkowi `Host` — ścieżka `/<inna domena>` nigdy nie pokaże innego tenanta. Foldery z `public/` są jawną listą w `lib/tenant/routing.ts`. Tenanta się nie usuwa, tylko wyłącza (`Aktywna`); usunięcie z przypisanymi użytkownikami jest odrzucane. Host bierzemy z nagłówka `Host` — Nginx musi go przekazywać bez zmian (S10).

Domeny tenanta (`Tenants.domains`): jedna lista wpisów `{ host, environment: production | staging | local }`; host jest unikalny w całej bazie (walidacja w panelu + unikalny indeks).

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

## Infrastruktura (ADR-019, ADR-004)
- VPS webh.pl 4 vCPU / 16 GB / 100 GB NVMe, Ubuntu 24.04 (ADR-019): Docker Compose — `app`, `postgres`, `nginx` (+ certbot), kopie; staging i produkcja jako osobne stosy z osobnymi bazami.
- Obrazy budowane w GitHub Actions → GHCR (prywatnie).
- Kopie: `pg_dump` co noc + media → poza serwer; próbne odtworzenie raz w miesiącu.
- Monitoring: Sentry (błędy), zewnętrzny monitoring dostępności; analityka Umami (bez cookies) — po uruchomieniu serwera.

## Czego świadomie NIE robimy (na teraz)
Sklepu B2B (faza 2), mikroserwisów, Kubernetes, płatnych CMS-ów w chmurze, osobnych repozytoriów na każdą stronę, osobnej aplikacji panelu.
