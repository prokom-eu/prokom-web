# ADR-004: Wdrożenia — Docker Compose, staging i produkcja na jednym VPS, GitHub Actions

- **Status:** przyjęta
- **Data:** 2026-10-12, aktualizacja 2026-10-14

## Kontekst
Jedna osoba, kilka stron, niski budżet. Szef musi oglądać każdą stronę przed publikacją, a wdrożenie musi dać się cofnąć w minutę.

## Decyzja
- Obraz Docker (Next.js `standalone`) budowany w GitHub Actions, przechowywany w GHCR (prywatnie, `ghcr.io/prokom-eu/prokom-web`), tag = SHA commita.
- Na VPS dwa stosy Docker Compose: `staging` (gałąź `develop`, `noindex`, hasło basic auth) i `prod` (gałąź `main`), **osobne bazy PostgreSQL**.
- Nginx + Let's Encrypt jako reverse proxy dla wszystkich domen; panel Payload tylko pod domeną panelu.
- Migracje uruchamiane przy wdrożeniu, przed startem nowej wersji; na produkcji poprzedzone automatycznym `pg_dump`.
- Produkcja tylko po akceptacji szefa w Asanie.
- Rollback = poprzedni tag obrazu (+ ewentualnie odtworzenie bazy z kopii — decyzja ręczna).
- Staging: `staging.<domena>` dla każdej strony (np. `staging.prokombiznes.pl`); domeny stagingu i produkcji są polami tenanta.

## Odrzucone
- Vercel / serverless — koszt przy wielu domenach, Payload + PostgreSQL i tak wymagają serwera, dane poza firmą.
- Kubernetes / Coolify — przerost dla jednej osoby i jednego serwera.
- Budowanie obrazów na serwerze — `next build` zjada RAM produkcji.

## Konsekwencje
Serwer musi mieć zapas pamięci na dwa stosy (8 GB RAM, swap, limity kontenerów). Szczegóły: `docs/wdrozenia.md`.
