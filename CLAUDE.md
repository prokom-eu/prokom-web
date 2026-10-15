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
- Automaty (S1b): CI `.github/workflows/ci.yml` (lint → format:check → typecheck → test → build → e2e + gitleaks) i `pr-title.yml` (tytuł PR wg Conventional Commits); Dependabot do `develop`. Hak przed commitem (husky + lint-staged): gitleaks na staged + Prettier/ESLint na zmienionych plikach — bez autopoprawek, błąd = `pnpm format` i ponowny commit; bez gitleaks w PATH commit jest blokowany (`winget install --id Gitleaks.Gitleaks`). Claude Code: hak `PostToolUse` formatuje edytowane pliki (`.claude/hooks/format.mjs`), `/przeglad` używa subagenta `recenzent`.

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
- `docker compose -f docker/compose.dev.yml up -d` — PostgreSQL (na hoście port **54320**, bo 5432/5433 bywają zajęte przez natywny PostgreSQL) + Mailpit (SMTP `localhost:1025`, podgląd maili: `localhost:8025`).
- Komendy: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm format` / `pnpm format:check`, `pnpm test` (Vitest, `src/**/*.test.ts`), `pnpm test:e2e` (Playwright, `tests/e2e`, wymaga działającej bazy), `pnpm generate:types`, `pnpm generate:importmap`; od S2: `pnpm payload migrate:create`, `pnpm payload migrate`, `pnpm seed` (tylko lokalnie).
- pnpm: wersja z `packageManager` (11.x). Wywołuj `pnpm` bezpośrednio — sam przełącza się na przypiętą wersję. Nie używaj `corepack pnpm`: psuje `webServer` w Playwright.
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
- Dane osobowe (e-mail, telefon, imię, treść zapytania) nigdy w logach, komunikatach błędów ani Sentry. Logi: logger z `lib/` (JSON, `tenant`, `requestId`), nie `console.log`.

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
- Po każdej akcji na GitHubie (utworzenie PR, edycja, scalenie) **zweryfikuj ją** (`gh pr view` / `gh pr list`) i podaj link — nie raportuj sukcesu bez sprawdzenia.
- Testy najpierw dla logiki biznesowej (rozpoznawanie domeny, izolacja tenantów, walidacja formularzy): najpierw test, który nie przechodzi, potem kod.
- Commity są podpisywane kluczem SSH (`commit.gpgsign`). Jeśli podpis się nie uda — **nie wyłączaj go** i nie używaj `--no-gpg-sign`; powiedz mi.
- Przed każdym commitem pokaż mi `git diff --staged --stat` i 1–3 zdania: co i dlaczego. Commit dopiero, gdy Krystian przeczyta zmiany.
- Zmiany DNS: najpierw `docs/dns.md`, potem dostawca — nigdy odwrotnie.

## Jak ze mną pracujesz (rzemiosło)
- **Krystian ma rozumieć każdą linię, którą commituje.** Przy nieoczywistej decyzji (wzorzec, biblioteka, kompromis) dodaj 1–2 zdania „dlaczego tak” — w odpowiedzi, nie w komentarzach do kodu.
- **Jedna rzecz naraz.** Pomysł spoza zakresu sesji → wpis w `docs/STAN.md` → „Pomysły na później”, nie implementujesz go „przy okazji”.
- **Małe kroki:** plan → test → kod → `lint/typecheck/test` → pokazanie diffu. Gdy zmiana rośnie powyżej ~400 linii diffu, zaproponuj podział na osobne PR.
- Gdy nie jesteś pewien API biblioteki — sprawdź dokumentację zainstalowanej wersji albo powiedz, że nie wiesz. Nie zgaduj.

## Komendy projektu
- `/zadanie <sesja lub opis>` — kontekst, plan, czekasz na „ok”, potem kod.
- `/przeglad` — przegląd zmian przed PR.
- `/pr` — tytuł (Conventional Commits) i opis wg `.github/pull_request_template.md`, po mojej akceptacji `gh pr create --base develop`.
- `/wdrozenie staging|produkcja` — checklista przed wdrożeniem.
- `/koniec-sesji` — aktualizacja `docs/STAN.md` (z następnym krokiem) i podsumowanie.
- Skrypty Krystiana (nie uruchamiaj ich sam): `scripts\start.ps1` — start pracy; `scripts\koniec.ps1` — koniec pracy.

## Wtyczki Claude Code
- frontend-design: stosuj przy każdym UI, ALE marka jest zamknięta: kolory, kroje i znak
  wyłącznie wg docs/marka.md, ADR-007 i docs/strony/<domena>-design.md. Przy sprzeczności wygrywa marka.
- Superpowers: używamy brainstorming, writing-plans, systematic-debugging,
  verification-before-completion. NIE używamy worktree, subagent-driven-development,
  finishing-a-development-branch — obowiązuje nasz flow (/zadanie → plan → PR, /przeglad).
  TDD wg docs/jakosc.md i fundament.md (od S2 dla logiki), nie dla szkieletu z szablonu.
- Przy sprzeczności skilla z tym plikiem albo ze specyfikacją wygrywa ten plik i specyfikacja.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
