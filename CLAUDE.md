# prokom-web — CLAUDE.md

Repozytorium nowych stron PRO-KOM: **prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl**, a w grudniu 2026 **nowa pro-kom.eu** (hub). Jedna aplikacja Next.js z wbudowanym Payload CMS 3 obsługuje wiele domen; treści wszystkich stron edytuje się w jednym panelu (multi-tenant).

Właściciel kodu: firma PRO-KOM Tadeusz Wójciak — organizacja GitHub `prokom-eu` (repo: `github.com/prokom-eu/prokom-web`). Developer: Krystian — **jedna osoba**, dlatego prostota, przewidywalność i łatwe utrzymanie są ważniejsze niż „sprytne” rozwiązania. Każda nowa ruchoma część (usługa, biblioteka, kontener) musi mieć uzasadnienie.

## Zanim zaczniesz zadanie
1. Przeczytaj `docs/STAN.md` — co zrobione, co w toku.
2. Zadanie fundamentu → jego sesja w `docs/zadania/fundament.md` (zakres, poza zakresem, warunki odbioru). **Nie wykraczaj poza zakres sesji.**
3. Zadanie strony → specyfikacja `docs/strony/<domena>.md`. **Specyfikacja jest źródłem prawdy dla treści i zakresu.** Braki oznacz `TODO(krystian):`, nie zgaduj.
4. Decyzje architektoniczne: `docs/decyzje/ADR-*.md`. Nie zmieniaj ich po cichu — jeśli trzeba, zaproponuj nowy ADR.
5. Wygląd: `docs/marka.md`. Kolory i fonty tylko z tokenów.
6. Wersje bibliotek: zanim użyjesz API Payload / Next.js, sprawdź **aktualną dokumentację** zainstalowanej wersji — nie pisz z pamięci (API Payload 3 i Next.js zmieniają się często).

## Stos (ADR-001, ADR-005)
- Next.js (App Router, TypeScript `strict`) + **Payload CMS 3** w tej samej aplikacji. Wersje: te, które oficjalnie wspiera aktualny Payload 3 (z jego szablonu), **przypięte dokładnie** w `package.json`.
- `@payloadcms/plugin-multi-tenant` — każda strona = tenant; dane firmy wspólne dla wszystkich (global).
- PostgreSQL (`@payloadcms/db-postgres`), **migracje wersjonowane w repo**. Media na dysku (wolumen Dockera).
- Tailwind CSS, komponenty własne w `src/components`, bez ciężkich bibliotek UI.
- Menedżer pakietów: **pnpm** (przez Corepack). Node: wersja z `.nvmrc`.
- Docker Compose, Nginx + Let's Encrypt, GitHub Actions, obrazy w GHCR.
- Testy: Vitest (logika), Playwright (krytyczne ścieżki). Jakość: ESLint + Prettier, gitleaks w CI.

## Struktura (docelowa)
```
src/
  app/
    (sites)/[tenant]/...   # publiczne strony; middleware: host → tenant
    (payload)/admin/...    # panel Payload — dostępny TYLKO na domenie panelu
    api/inquiry/           # przyjmowanie formularzy (kontrakt ADR-003)
  collections/  globals/  blocks/
  components/              # wspólne komponenty
  sites/<tenant>/          # tylko to, co naprawdę unikalne dla jednej strony
  lib/                     # tenant, seo, inquiry, env
  middleware.ts
docs/  docker/  .github/workflows/  public/brand/
```

## Lokalnie
- Domeny dev: `biznes.localhost:3000`, `instalacje.localhost:3000`, `software.localhost:3000`, panel: `panel.localhost:3000/admin`.
- `docker compose -f docker/compose.dev.yml up -d` — PostgreSQL + Mailpit (podgląd maili: `localhost:8025`).
- Komendy (uzupełnij w S1, jeśli się różnią): `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm payload migrate:create`, `pnpm payload migrate`, `pnpm seed` (tylko lokalnie).
- System Krystiana: Windows, repo w `D:\PRO-KOM\repos\prokom-web` (na drugim komputerze może być inna litera dysku). Końce linii: LF (`.gitattributes`).

## Praca na dwóch komputerach (firma + dom) — `docs/sposob-pracy.md`
Krystian pracuje na komputerze w firmie i w domu. **Jedynym kanałem synchronizacji kodu jest GitHub.** Historia sesji Claude Code NIE przechodzi między komputerami — ciągłość niesie `docs/STAN.md`.
- **Na początku każdej sesji:** uruchom `git status` i `git fetch`. Jeśli gałąź jest za `origin` albo są niezacommitowane zmiany — powiedz mi o tym, zanim zaczniesz (rozwiązanie: `scripts\start.ps1`). Przeczytaj w `docs/STAN.md` sekcję „W toku” → „Następny krok”.
- **Na końcu każdej sesji** (`/koniec-sesji`): w `docs/STAN.md` → „W toku” zapisz gałąź, co zrobione, **dokładny następny krok** i rzeczy niedokończone — tak, żeby nowa sesja na drugim komputerze ruszyła bez pytań. Przypomnij o `scripts\koniec.ps1` (commit `wip:` + push).
- Nie zakładaj, że lokalna baza ma jakieś dane — dane testowe tylko z `pnpm seed` (powtarzalny, idempotentny). Każda migracja w repo, bo drugi komputer odtwarza bazę z migracji.
- Żadnych ścieżek bezwzględnych (`D:\...`, `C:\Users\...`) w kodzie, skryptach ani dokumentacji — tylko ścieżki względne do katalogu repo.
- Nowa zmienna środowiskowa → `.env.example` z opisem (Krystian przenosi wartości przez menedżer haseł).

## Zasady kodu
- TypeScript strict, bez `any` (wyjątek z komentarzem dla typów z zewnętrznych bibliotek).
- Server Components domyślnie; `"use client"` tylko przy interakcji.
- Treści z Payload przez Local API po stronie serwera, **zawsze z filtrem tenanta** (helpery w `lib/tenant`). Treść jednej domeny nigdy nie może pojawić się na innej — pilnuje tego test izolacji.
- Nieznana domena → 404, nigdy domyślny tenant.
- Zmiana schematu bazy = migracja w repo. `push` schematu tylko lokalnie.
- Każda strona: metadane, `sitemap.xml` i `robots.txt` per domena, dane strukturalne, obrazy przez `next/image` z `alt`.
- Dostępność: kontrast WCAG AA, semantyczny HTML, widoczny focus, etykiety formularzy.
- Formularze: walidacja Zod na serwerze, honeypot + minimalny czas + limit zgłoszeń, zgoda RODO z wersją klauzuli, zapis przez `submitInquiry()` (ADR-003). Żadnych zewnętrznych usług (CAPTCHA, analityka, fonty z CDN) bez ADR.
- Teksty po polsku; nie kopiuj tekstów między domenami (SEO).
- Nowa zależność = uzasadnienie w opisie PR.

## Definition of Done
- `lint`, `typecheck`, `test`, `build` zielone lokalnie i w CI.
- Telefon 360 px i komputer; Lighthouse ≥ 90 dla zmienionych stron.
- Zgodne ze specyfikacją / zakresem sesji; `docs/STAN.md` zaktualizowany.
- Pełna lista: `docs/jakosc.md`.

## Bezpieczeństwo i produkcja
- Sekrety tylko w `.env*` (nie commitujemy). Wzór: `.env.example` — aktualizuj przy każdej nowej zmiennej. Aplikacja nie startuje bez wymaganych zmiennych (walidacja w `lib/env`).
- Nie czytaj i nie edytuj `.env*` poza `.env.example`.
- **Produkcja tylko po akceptacji szefa w Asanie** i tylko przez pipeline (`docs/wdrozenia.md`). Nie wdrażaj ręcznie, nie uruchamiaj migracji na serwerze bez mojej zgody.
- Przed wdrożeniem produkcji: kopia bazy. Każde wdrożenie da się cofnąć do poprzedniego obrazu.

## Git
- `main` = produkcja, `develop` = staging. Gałęzie: `feat/<opis>`, `fix/<opis>`, `chore/<opis>`, `docs/<opis>`.
- **Nigdy nie pushuj bezpośrednio na `main` ani `develop`** — tylko PR z zielonym CI, scalanie przez squash.
- Conventional Commits, po polsku lub angielsku — konsekwentnie w obrębie PR. Jedno zadanie = jedna gałąź = jeden PR.

## Komendy projektu
- `/zadanie <sesja lub opis>` — kontekst, plan, czekasz na „ok”, potem kod.
- `/przeglad` — przegląd zmian przed PR.
- `/pr` — tytuł (Conventional Commits) i opis wg `.github/pull_request_template.md`, po mojej akceptacji `gh pr create --base develop`.
- `/wdrozenie staging|produkcja` — checklista przed wdrożeniem.
- `/koniec-sesji` — aktualizacja `docs/STAN.md` (z następnym krokiem) i podsumowanie.
- Skrypty Krystiana (nie uruchamiaj ich sam): `scripts\start.ps1` — start pracy; `scripts\koniec.ps1` — koniec pracy.
