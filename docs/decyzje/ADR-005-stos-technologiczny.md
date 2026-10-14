# ADR-005: Stos technologiczny i minimum jakości

- **Status:** przyjęta
- **Data:** 2026-10-13

## Decyzja
- **Strony:** Next.js + Payload CMS 3 (TypeScript). Odrzucone: sam React (SEO, brak Payload 3), Astro (dwie rzeczy do utrzymania), WordPress.
- **Systemy biznesowe** (prokomserwis.pl, PRO-KOM System, Strefa Klienta): Python + Django (+ DRF). Odrzucone: Java/Spring, .NET, NestJS, FastAPI, Laravel, Rails — wolniejsze tempo lub trzeci język bez korzyści przy tej skali.
- **Infrastruktura:** PostgreSQL, Docker, Nginx; Redis + Celery tylko tam, gdzie są potrzebne zadania w tle (nie w prokom-web na start).
- **n8n:** tylko warstwa integracji (import xlsx z hurtowni, powiadomienia), najwcześniej w listopadzie 2026. Logika biznesowa i dane — zawsze w Django.
- **Zasada:** żaden nowy język, framework, baza ani usługa zewnętrzna bez osobnego ADR.

## Minimum jakości w każdym repo
- TypeScript `strict` (w Django: mypy + django-stubs); ESLint + Prettier (w Django: ruff).
- Testy: Vitest/pytest dla logiki, Playwright dla krytycznych ścieżek (formularze).
- GitHub Actions na każdym PR: lint, typy, testy, build, **gitleaks** (wykrywanie sekretów — skanowanie sekretów GitHuba dla repo prywatnych jest płatne).
- Dependabot (alerty i poprawki bezpieczeństwa). Next.js i Payload aktualizujemy ręcznie, świadomie, wersje przypięte dokładnie.
- Sentry (błędy) i zewnętrzny monitoring dostępności.
- Przetestowane odtworzenie kopii zapasowej przed pierwszą produkcją.
