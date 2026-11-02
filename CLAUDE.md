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
- Domeny dev: `biznes.localhost:3000`, `instalacje.localhost:3002` (folder prokom-instal), `software.localhost:3000`, panel: `panel.localhost:3000/admin` (`PANEL_HOST=panel.localhost` w `.env`). Sam `localhost:3000` to nieznana domena → 404. Port to `PORT` z `.env` folderu (`prokom-web-biznes`: 3001, drugi folder strony: kolejny wolny) — `pnpm dev` i Playwright biorą go stamtąd. Każdy folder ma **własny** port: Playwright (`reuseExistingServer`) podłącza się do każdego serwera na porcie, także z innego folderu. Jeden folder = jeden `pnpm dev`; gdy serwer działa już na innym porcie niż `PORT` z `.env`, uruchom Playwright z `PORT=<port> pnpm test:e2e …`. W `pnpm dev` dane z Payload nie są cache'owane (`lib/cache.ts`), więc wynik `pnpm seed*` widać od razu.
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
- **Biznes w jednym folderze (decyzja Krystiana 30.10):** sesje po kolei wg kolejki `docs/zadania/prokombiznes.md` §7.1 — sesje połączone, 2–3 PR-y piętrowo w jednej sesji, bez drugiego folderu. Po audycie 01.11 (decyzja 01.11): prompty 2–5 w dwóch sesjach §7.2, sesja A do 6 PR-ów. Najwyżej dwie sesje piszące kod naraz we wszystkich liniach (Biznes, Software, Instalacje).
- **Dwie strony równolegle = dwa foldery (git worktree)**, każdy z własną gałęzią, `PORT` i bazą (`docs/sposob-pracy.md` → „Dwie strony równolegle”). Pracujesz tylko w folderze swojej sesji: nie przełączasz go na gałąź drugiej strony, nie otwierasz `develop`, nowe gałęzie zakładasz od `origin/develop`. W `docs/STAN.md` edytujesz tylko podsekcję swojej strony.

## Zasady kodu
- TypeScript strict, bez `any` (wyjątek z komentarzem dla typów z zewnętrznych bibliotek).
- Server Components domyślnie; `"use client"` tylko przy interakcji.
- Treści z Payload przez Local API po stronie serwera, **zawsze z filtrem tenanta** (helpery w `lib/tenant`). Treść jednej domeny nigdy nie może pojawić się na innej — pilnuje tego test izolacji.
- Nieznana domena → 404, nigdy domyślny tenant.
- Zmiana schematu bazy = migracja w repo (`pnpm payload migrate:create`), także lokalnie — `push` wyłączony wszędzie (ADR-009). Przed `/pr` gałąź z migracją: rebase na `origin/develop`, usunięcie własnej migracji i `migrate:create` od nowa (`docs/sposob-pracy.md` → „Migracje z kilku folderów”).
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
- Conventional Commits, po polsku lub angielsku — konsekwentnie w obrębie PR. Jedno zadanie = jedna gałąź = jeden PR; sesja może wydać 2–3 takie PR-y piętrowo (druga gałąź od pierwszej).
- Po każdej akcji na GitHubie (utworzenie PR, edycja, scalenie) **zweryfikuj ją** (`gh pr view` / `gh pr list`) i podaj link — nie raportuj sukcesu bez sprawdzenia.
- Testy najpierw dla logiki biznesowej (rozpoznawanie domeny, izolacja tenantów, walidacja formularzy): najpierw test, który nie przechodzi, potem kod.
- Commity są podpisywane kluczem SSH (`commit.gpgsign`). Jeśli podpis się nie uda — **nie wyłączaj go** i nie używaj `--no-gpg-sign`; powiedz mi.
- Commity robisz sam w trakcie sesji: małe, logiczne, Conventional, podpisane, po zielonym `lint/typecheck/test`. Po zielonych testach i recenzencie sam otwierasz PR (`/pr`) — opis PR zawiera werdykt recenzenta i Twoją ocenę każdej uwagi; **diff czytam w PR, scalam ja**. Pytasz mnie tylko o decyzje produktowe, nowe zależności, migracje usuwające dane, scalenie i wdrożenie. Wyjątki linii Instalacje — sekcja „Linia Instalacje” niżej.
- Zmiany DNS: najpierw `docs/dns.md`, potem dostawca — nigdy odwrotnie.

## Jak ze mną pracujesz (rzemiosło)
- **Krystian ma rozumieć każdą linię, którą commituje.** Przy nieoczywistej decyzji (wzorzec, biblioteka, kompromis) dodaj 1–2 zdania „dlaczego tak” — w odpowiedzi, nie w komentarzach do kodu.
- **Jedna rzecz naraz.** Pomysł spoza zakresu sesji → wpis w `docs/STAN.md` → „Pomysły na później”, nie implementujesz go „przy okazji”.
- **Małe kroki:** plan → test → kod → `lint/typecheck/test` → commit. Gdy zmiana rośnie powyżej ~400 linii diffu, podziel ją na PR-y piętrowe w tej samej sesji (druga gałąź od pierwszej), bez rytuału startu i końca pomiędzy.
- **`/przeglad` (subagent `recenzent`)** uruchamiasz sam na końcu sesji z kodem (poprawki z przeglądu — po mojej zgodzie): zawsze przy logice biznesowej, tenantach, formularzach, dostępie, migracjach albo diffie powyżej ~100 linii. Drobne zmiany (dokumentacja, kilka linii bez logiki) — bez recenzenta.
- Gdy nie jesteś pewien API biblioteki — sprawdź dokumentację zainstalowanej wersji albo powiedz, że nie wiesz. Nie zgaduj.

## Komendy projektu
- `/zadanie <sesja lub opis>` — kontekst i plan (maks. 15 linii). Gdy prompt sesji w `PRZEKAZANIE-*.md` jest kompletny, od razu kod; zatrzymujesz się tylko przy decyzji (pytanie z opcjami) albo migracji usuwającej dane. Bez trybu planu przy gotowym prompcie.
- `/przeglad` — przegląd zmian przed PR.
- `/pr` — tytuł (Conventional Commits) i opis wg `.github/pull_request_template.md`, od razu `gh pr create --base develop` (bez czekania na „ok”); ja czytam diff i scalam.
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

## Elementy wspólne linii (Biznes, Instalacje, Software)
- Spec `docs/design/wspolne/WSPOLNE-ELEMENTY.md` (+ `plansze/`, `MAPA-DZIS.md`), plan `docs/zadania/wspolne-elementy.md` (F = fundament, L = sesje linii), ADR-022.
- Komponenty wspólne w `src/components/shared` (bez Payload, bez importów z `src/sites/*`), loader w `src/lib/shared`. Sesje linii nie zmieniają tych folderów ani wspólnych pól/migracji — brak → osobny PR `feat/wsp-*`.
- Dane: firma w `CompanyData` (salony = `locations[]`), linia w grupie `shared` w `SiteSettings` (ADR-022 „Poprawki w F0”).
- Zasady 01.11: bez WhatsAppa, bez zdjęć ludzi, dane kontaktowe tylko z panelu, nazwa „Tech”, przy pro-kom.eu bez sklepu, Gaming tylko jako odnośnik.

## prokombiznes.pl
- **Od 30.10.2026 etap K4 (wersja finalna v150):** `docs/design/prokombiznes/K4-FINAL.md` + `PRZEKAZANIE-K4.md`, decyzje — ADR-017, plan sesji — `docs/zadania/prokombiznes.md` §7.
- Wzorzec: `docs/design/prokombiznes/INDEKS.md` (kolejność ważności dokumentów); decyzje repo (adresy `/oferta/…`, model per tenant) — ADR-017 i ADR-012 „Rozstrzygnięcia”, plan sesji — `docs/zadania/prokombiznes.md` §7 (historia: §6).
- Telefon = osobny układ jak aplikacja (`MOBILE-APLIKACJA.md`), jego §4 to Definition of Done każdej sesji z UI.
- Zero cen, tylko Rabka, kontakt@prokombiznes.pl, tel. 889 003 889 i 883 200 151, pn–pt 9–17 (decyzja 01.11.2026); statusy tylko: Posnet/Elzab „Autoryzowany serwis”, GoPOS/InsERT „Autoryzowany partner”, Optivendi „Partner”, COMEX „We współpracy”; HP tylko oryginalne wkłady (K4-FINAL §1).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## prokomsoftware.pl
- Plan sesji: `docs/zadania/prokomsoftware.md`. **Od 01.11.2026 wersja finalna v23:** `docs/design/prokomsoftware/ZMIANY-v23.md` + `PRZEKAZANIE-v23.md` (sesje SWV1–SWV5), kolory — ADR-015 „Rozstrzygnięcia v23”. Historia: `PRZEKAZANIE-v22.md`.
- **Telefon = osobny układ „jak najlepsza aplikacja”** (`docs/design/prokomsoftware/MOBILE-APLIKACJA.md`); jego §5 to Definition of Done każdej sesji z UI.

## Linia Instalacje (prokominstalacje.pl) — worktree `prokom-instal`

Jeśli pracujesz w folderze `prokom-instal` albo na gałęzi `inst/*`:
- Najpierw przeczytaj `docs/stan/STAN-instalacje.md`, potem `docs/zadania/prokominstalacje.md` (rytuał i prompty), `docs/strony/prokominstalacje.md` (spec, §2 = decyzje nie do zmiany) i ADR-I001 w `docs/decyzje/` (worktree, `PORT=3002`, baza `prokom_web_instalacje`, strefa wspólna, migracje).
- Wzorzec wyglądu = `docs/design/prokominstalacje/` (prototyp v4.0 + `MOBILE-APLIKACJA.md`, `KOMPONENTY.md`, `MAPA-STRON.md`). Każda sekcja z UI: `narzedzia/porownaj.mjs` w 1440 i 390, jasny i ciemny, przed PR.
- Pliki strefy wspólnej (ADR-I001 §3) zmieniasz tylko w osobnym małym PR `inst/wsp-*`. Stan sesji zapisujesz w `docs/stan/STAN-instalacje.md` (`/inst-koniec`), nie w `docs/STAN.md`.
- Na stronie Instalacji: zero cen sprzętu, zero list źródeł, „24 h” tylko jako odpowiedź na zgłoszenie, gwarancja 24 mies. na montaż.
- **Tryb szybki (decyzja Krystiana 30.10, `docs/zadania/prokominstalacje-przyspieszenie.md`):** małe PR-y bez logiki (strefa wspólna `inst/wsp-*`: tokeny + test, dokumenty, poprawki testów) — commit, PR i auto-merge po zielonym CI bez osobnego „ok” (diff czyta w PR). Duże PR-y z logiką: commity na gałęzi bez pytania, Krystian czyta diff raz przed `/pr`; `/przeglad` bez zmian (formularze, migracje, tenant, dostęp). Sesja z gotowym promptem z §3: bez osobnej rundy „plan → ok”, pytanie tylko o decyzję, której prompt nie rozstrzyga.
