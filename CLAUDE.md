# prokom-web — CLAUDE.md

Repozytorium nowych stron PRO-KOM: **prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl**, a w grudniu 2026 **nowa pro-kom.eu** (hub). Jedna aplikacja Next.js z wbudowanym Payload CMS 3 obsługuje wiele domen; treści wszystkich stron edytuje się w jednym panelu (multi-tenant).

Właściciel kodu: firma PRO-KOM Tadeusz Wójciak — organizacja GitHub `prokom-eu` (repo: `github.com/prokom-eu/prokom-web`). Developer: Krystian — **jedna osoba**, dlatego prostota, przewidywalność i łatwe utrzymanie są ważniejsze niż „sprytne” rozwiązania. Każda nowa ruchoma część (usługa, biblioteka, kontener) musi mieć uzasadnienie.

## Zanim zaczniesz zadanie
1. Przeczytaj `docs/STAN.md` — co zrobione, co w toku.
2. Zadanie fundamentu → jego sesja w `docs/zadania/fundament.md` (zakres, poza zakresem, warunki odbioru). **Nie wykraczaj poza zakres sesji.**
3. Zadanie strony → specyfikacja `docs/strony/<domena>.md`. **Specyfikacja jest źródłem prawdy dla treści i zakresu.** Braki oznacz `TODO(krystian):`, nie zgaduj.
4. Decyzje architektoniczne: `docs/decyzje/ADR-*.md`. Nie zmieniaj ich po cichu — jeśli trzeba, zaproponuj nowy ADR.
5. Wygląd: `docs/marka.md`. Kolory i fonty tylko z tokenów.
6. Wersje bibliotek: zanim użyjesz API Payload / Next.js, sprawdź **aktualną dokumentację** zainstalowanej wersji — nie pisz z pamięci (API Payload 3 i Next.js zmieniają się często). Źródła (ADR-008): Next.js → `node_modules/next/dist/docs/`; Payload → `node_modules/payload/skills/payload/SKILL.md`, a dopóki go nie ma — `https://payloadcms.com/llms-full.txt` + typy `node_modules/payload/dist/**/*.d.ts`; inne → README/typy w `node_modules`. Źródło milczy → „nie wiem”.

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
    (sites)/[domain]/...   # publiczne strony; proxy.ts przepisuje host → /<host>/..., layout: host → tenant (baza)
    (payload)/admin/...    # panel Payload — dostępny TYLKO na domenie panelu
    api/inquiry/           # przyjmowanie formularzy (kontrakt ADR-003)
  collections/  globals/  blocks/
  components/              # wspólne komponenty (szkielet: BrandBar, SiteHeader, SiteFooter)
  components/ui/           # komponenty bazowe: Container, Section, Heading, Button, TextLink
  styles/tokens.css        # JEDYNE miejsce z wartościami kolorów (ADR-007, ADR-013); testy kontrastu obok
  sites/<tenant>/          # tylko to, co naprawdę unikalne dla jednej strony
  lib/                     # tenant, brand (linie, motyw), seo, inquiry, env
  proxy.ts                 # Next 16: dawne middleware.ts (lib/tenant/routing)
docs/  docker/  .github/workflows/  public/brand/
docs/design/<strona>/      # wzorzec wyglądu strony (zrzuty, plansze, tokeny) — cel wizualny
seed/<strona>/             # dane startowe strony z pakietu (JSON 1:1, poza Prettierem)
```

## Lokalnie
- Domeny dev: `biznes.localhost:3000`, `instalacje.localhost:3000`, `software.localhost:3000`, panel: `panel.localhost:3000/admin` (`PANEL_HOST=panel.localhost` w `.env`). Sam `localhost:3000` to nieznana domena → 404. Port to `PORT` z `.env` folderu (drugi folder: 3001) — `pnpm dev` i Playwright biorą go stamtąd.
- `docker compose -f docker/compose.dev.yml up -d` — PostgreSQL (na hoście port **54320**, bo 5432/5433 bywają zajęte przez natywny PostgreSQL) + Mailpit (SMTP `localhost:1025`, podgląd maili: `localhost:8025`).
- Komendy: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm format` / `pnpm format:check`, `pnpm test` (Vitest, `src/**/*.test.ts`), `pnpm test:e2e` (Playwright, `tests/e2e`, wymaga działającej bazy po `pnpm seed`; testy edytujące treść logują się adminem z `SEED_ADMIN_*` — Playwright sam wczytuje `.env`), `pnpm generate:types`, `pnpm generate:importmap`, `pnpm payload migrate:create <nazwa>`, `pnpm payload migrate`, `docker build -t prokom-web:local .`, `bash scripts/smoke.sh <adres> [domeny…]` (S9a: obraz i smoke test, `docs/wdrozenia.md`), `scripts/backup.sh` / `scripts/restore.sh` (S9b-2: kopie na serwerze — procedury w `docs/runbook.md`), `pnpm seed` (tylko lokalnie; admin z `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, na produkcji zablokowany; na końcu importuje katalog Biznesu), `pnpm seed:biznes` (sam katalog Biznesu z `seed/prokombiznes/` + obrazy z `docs/design/prokombiznes/boards/media/` i galerie z `seed/prokombiznes/media/`, idempotentny: pola z paczki wygrywają z edycją w panelu, rekord zapisywany tylko przy różnicy; status treści i data sprawdzenia tylko „w przód”). Zmiana schematu: `docs/sposob-pracy.md` → „Zmiana schematu bazy”.
- pnpm: wersja z `packageManager` (11.x). Wywołuj `pnpm` bezpośrednio — sam przełącza się na przypiętą wersję. Nie używaj `corepack pnpm`: psuje `webServer` w Playwright.
- System Krystiana: Windows, repo w `D:\PRO-KOM\repos\prokom-web`. Końce linii: LF (`.gitattributes`).

## Sposób pracy (jeden komputer) — `docs/sposob-pracy.md`
Krystian pracuje na jednym komputerze. **GitHub to kopia kodu i jedyna droga na serwer** (CI, obrazy) — praca w toku wypychana na koniec dnia. Kolejna sesja Claude Code nie zna historii poprzedniej — ciągłość niesie `docs/STAN.md`.
- **Na początku każdej sesji:** uruchom `git status` i `git fetch`. Jeśli gałąź jest za `origin` albo są niezacommitowane zmiany — powiedz mi o tym, zanim zaczniesz (rozwiązanie: `scripts\start.ps1`). Przeczytaj w `docs/STAN.md` sekcję „W toku” → „Następny krok”.
- **Na końcu każdej sesji** (`/koniec-sesji`): w `docs/STAN.md` → „W toku” zapisz gałąź, co zrobione, **dokładny następny krok** i rzeczy niedokończone — tak, żeby następna sesja ruszyła bez pytań. Przypomnij o `scripts\koniec.ps1` (commit `wip:` + push).
- Nie zakładaj, że lokalna baza ma jakieś dane — dane testowe tylko z `pnpm seed` (powtarzalny, idempotentny). Każda migracja w repo, bo CI, staging i produkcja odtwarzają bazę z migracji.
- Żadnych ścieżek bezwzględnych (`D:\...`, `C:\Users\...`) w kodzie, skryptach ani dokumentacji — tylko ścieżki względne do katalogu repo.
- Nowa zmienna środowiskowa → `.env.example` z opisem (Krystian przenosi wartości przez menedżer haseł).
- **Dwie strony równolegle = dwa foldery (git worktree)**, każdy z własną gałęzią, `PORT` i bazą (`docs/sposob-pracy.md` → „Dwie strony równolegle”). Pracujesz tylko w folderze swojej sesji: nie przełączasz go na gałąź drugiej strony, nie otwierasz `develop`, nowe gałęzie zakładasz od `origin/develop`. W `docs/STAN.md` edytujesz tylko podsekcję swojej strony.

## Zasady kodu
- TypeScript strict, bez `any` (wyjątek z komentarzem dla typów z zewnętrznych bibliotek).
- Server Components domyślnie; `"use client"` tylko przy interakcji.
- Treści z Payload przez Local API po stronie serwera, **zawsze z filtrem tenanta** (helpery w `lib/tenant`). Treść jednej domeny nigdy nie może pojawić się na innej — pilnuje tego test izolacji.
- Nieznana domena → 404, nigdy domyślny tenant.
- Zmiana schematu bazy = migracja w repo (`pnpm payload migrate:create`), także lokalnie — `push` wyłączony wszędzie (ADR-009).
- Każda strona: metadane, `sitemap.xml` i `robots.txt` per domena, dane strukturalne, obrazy przez `next/image` z `alt`.
- Dostępność: kontrast WCAG AA, semantyczny HTML, widoczny focus, etykiety formularzy.
- Formularze: walidacja Zod na serwerze, honeypot + minimalny czas + limit zgłoszeń, zgoda RODO z wersją klauzuli, zapis przez `submitInquiry()` (ADR-003). Żadnych zewnętrznych usług (CAPTCHA, analityka, fonty z CDN) bez ADR.
- Teksty po polsku; nie kopiuj tekstów między domenami (SEO).
- Nowa zależność = uzasadnienie w opisie PR.
- Dane osobowe (e-mail, telefon, imię, treść zapytania) nigdy w logach, komunikatach błędów ani Sentry. Logi: logger z `lib/` (JSON, `tenant`, `requestId`), nie `console.log`.

## Definition of Done
- `lint`, `typecheck`, `test` i e2e zmienionego obszaru zielone lokalnie; pełne e2e i `build` — w CI (CI blokuje scalenie). `build` lokalnie tylko przy zmianie konfiguracji Next/Payload, zależności, `proxy.ts`, migracji albo Dockera.
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
- **`/przeglad` (subagent `recenzent`)** przed PR z kodem: zawsze przy logice biznesowej, tenantach, formularzach, dostępie, migracjach albo diffie powyżej ~100 linii. Drobne zmiany (dokumentacja, kilka linii bez logiki) — bez recenzenta.
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
  verification-before-completion. NIE używamy skilla worktree (foldery stron zakładamy wg `docs/sposob-pracy.md`), subagent-driven-development,
  finishing-a-development-branch — obowiązuje nasz flow (/zadanie → plan → PR, /przeglad).
  TDD wg docs/jakosc.md i fundament.md (od S2 dla logiki), nie dla szkieletu z szablonu.
- Przy sprzeczności skilla z tym plikiem albo ze specyfikacją wygrywa ten plik i specyfikacja.

## prokombiznes.pl
- Wzorzec: `docs/design/prokombiznes/INDEKS.md` (kolejność ważności dokumentów); decyzje repo (adresy `/oferta/…`, model per tenant) — ADR-012 „Rozstrzygnięcia K3 i K3.1”, plan sesji — `docs/zadania/prokombiznes.md` §6.
- Telefon = osobny układ jak aplikacja (`MOBILE-APLIKACJA.md`), jego §4 to Definition of Done każdej sesji z UI.
- Zero cen, tylko Rabka, biznes@pro-kom.eu.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
