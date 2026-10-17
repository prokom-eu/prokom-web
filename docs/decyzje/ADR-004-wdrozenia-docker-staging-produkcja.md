# ADR-004: Wdrożenia — Docker Compose, staging i produkcja na jednym VPS, GitHub Actions

- **Status:** przyjęta
- **Data:** 2026-10-12, aktualizacja 2026-10-14, uzupełnienie 2026-10-17 (S9)

## Kontekst
Jedna osoba, kilka stron, niski budżet. Szef musi oglądać każdą stronę przed publikacją, a wdrożenie musi dać się cofnąć w minutę.

## Decyzja
- Obraz Docker (Next.js `standalone`) budowany w GitHub Actions, przechowywany w GHCR (prywatnie, `ghcr.io/prokom-eu/prokom-web`), tag = SHA commita. **Uzupełnienie 17.10 (S9a):** obraz budowany tylko z `develop`; produkcja dostaje ten sam, przetestowany obraz przez promocję tagu (squash do `main` zmienia SHA).
- Na VPS dwa stosy Docker Compose: `staging` (gałąź `develop`, `noindex`, hasło basic auth) i `prod` (gałąź `main`), **osobne bazy PostgreSQL**.
- Nginx + Let's Encrypt jako reverse proxy dla wszystkich domen; panel Payload tylko pod domeną panelu. **Uzupełnienie 17.10 (S9b):** Nginx i certbot to trzeci, wspólny stos Compose (`docker/compose.proxy.yml`) — jedyny z portami 80/443 — połączony ze stosami `prokom-prod` i `prokom-staging` siecią `prokom-proxy`. Dwa stosy aplikacji nie mogą mieć każdy własnego Nginx na tych samych portach.
- Migracje uruchamiane przy wdrożeniu, przed startem nowej wersji; na produkcji poprzedzone automatycznym `pg_dump`. **Uzupełnienie 17.10 (S9a):** migracje uruchamia sama aplikacja przy starcie (`prodMigrations` Payload), bo obraz standalone nie ma CLI; wdrożenie czeka na `/api/health` = 200.
- Produkcja tylko po akceptacji szefa w Asanie.
- Rollback = poprzedni tag obrazu (+ ewentualnie odtworzenie bazy z kopii — decyzja ręczna).
- Staging: `staging.<domena>` dla każdej strony (np. `staging.prokombiznes.pl`); domeny stagingu i produkcji są polami tenanta.

## Odrzucone
- Vercel / serverless — koszt przy wielu domenach, Payload + PostgreSQL i tak wymagają serwera, dane poza firmą.
- Kubernetes / Coolify — przerost dla jednej osoby i jednego serwera.
- Budowanie obrazów na serwerze — `next build` zjada RAM produkcji.

## Konsekwencje
Serwer musi mieć zapas pamięci na dwa stosy (8 GB RAM, swap, limity kontenerów). Szczegóły: `docs/wdrozenia.md`.
