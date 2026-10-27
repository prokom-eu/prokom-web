# ADR-I001 — Instalacje w prokom-web: osobny worktree i równoległa praca z Biznesem, Software i Gaming

- Status: proponowany (przyjęcie w sesji I0) · Data: 27.10.2026 · Autor: Krystian (z Claude)
- Numer: seria `I` w `docs/decyzje/` (obok ADR-001…016). Osobna seria, bo Biznes i Software dopisują ADR-y równolegle — numer 017+ łatwo by się zdublował.

## Kontekst
- prokominstalacje.pl jest tenantem jednej aplikacji `prokom-web` (Next.js + Payload multi-tenant, decyzje projektu z 9–13.10.2026). Nie zmieniamy tego: wspólny panel, wspólne dane firmy, jedna skrzynka zapytań, jeden obraz na serwerze.
- Równolegle trwają: **Biznes** (prokom-web, worktree `prokom-web-biznes`), **Software** (prokom-web), **Gaming** (osobne repo `prokom-gaming`, porty 3100 / 54321 / 1026 / 8026).
- Krystian chce budować Instalacje równocześnie, w folderze `D:\PRO-KOM\repos\prokom-instal`, bez blokowania pozostałych linii.

## Decyzja

### 1. Folder = git worktree prokom-web (wzór z `docs/sposob-pracy.md` → „Dwie strony równolegle”)
`D:\PRO-KOM\repos\prokom-instal` to **trzeci worktree repozytorium prokom-web** — tak samo jak `prokom-web-biznes`. Zakłada go skrypt `zaloz-prokom-instal.ps1` z pakietu (albo ręcznie):
```powershell
cd D:\PRO-KOM\repos\prokom-web
git fetch origin
git worktree add ..\prokom-instal -b inst/w-pakiet origin/develop
git -C ..\prokom-instal branch --unset-upstream   # żeby git push nie celował w develop
```
Wspólna historia i obiekty git, osobne pliki robocze, osobna gałąź. Na jednej gałęzi może pracować tylko jeden worktree (git tego pilnuje). **Nie uruchamiaj `git worktree prune`** z innego systemu (WSL, maszyna wirtualna) — widzi ścieżki `D:\...` jako nieistniejące i usunąłby wpisy worktree.

### 2. Port i baza — jak w repo (jeden kontener PostgreSQL, osobna baza na folder)
| Folder | Strona | `PORT` w `.env` | Baza w `DATABASE_URL` |
|---|---|---|---|
| `prokom-web-biznes` | prokombiznes.pl | 3000 (domyślny) | `prokom_web` |
| `prokom-web` (główny) | prokomsoftware.pl | 3001 | `prokom_web_software` |
| **`prokom-instal`** | **prokominstalacje.pl** | **3002** | **`prokom_web_instalacje`** |
| `prokom-gaming` (inne repo) | prokomgaming.pl | 3100 | osobny kontener 54321 |

- Kontener PostgreSQL (`127.0.0.1:54320`) i Mailpit (`1025` / `8025`) są **wspólne** dla wszystkich folderów prokom-web (`docker/compose.dev.yml`, stała nazwa projektu `prokom-web-dev`). Każdy folder ma **własną bazę** w tym kontenerze — gałęzie mają różne migracje.
- `pnpm dev` (`scripts/dev.mjs`) i Playwright biorą `PORT` z **`.env`** folderu — w repo to już działa. **Plik to `.env`, nie `.env.local`.**
- `.\scripts\start.ps1` w folderze sam zakłada brakującą bazę z `DATABASE_URL`, instaluje zależności i uruchamia migracje. W nowej bazie potem `pnpm seed` (dane wspólne, tenanty, Biznes), a od I2 `pnpm seed:instalacje`.
- Strona lokalnie: **`http://instalacje.localhost:3002`**, panel: `http://panel.localhost:3002/admin`. Ciasteczko panelu nie rozróżnia portów (znane ograniczenie, `sposob-pracy.md` zasada 6): zalogowanie w `:3002` wylogowuje z `:3000` i `:3001` — logujesz się ponownie, nic się nie psuje.
- `.env` = kopia `.env` z `prokom-web` ze zmienionymi tylko `PORT=3002` i nazwą bazy w `DATABASE_URL` (skrypt zakładający robi to sam, nie wypisując sekretów).

### 3. Strefa własna i strefa wspólna (zapobieganie konfliktom)
**Strefa własna Instalacji** — zmieniamy swobodnie, nikt inny tu nie pisze:
- `src/app/(sites)/[domain]/(instalacje)/**` (trasy tylko tej linii, layout z `requireLine(params, 'instalacje')` — wzór: `(software)/layout.tsx`),
- `src/sites/instalacje/**` (Frame, bloki linii `blocks/`, komponenty, widżety, arkusz CSS linii),
- kolekcje tylko tej linii (ADR-I002: `InstalacjeSettings`, `InstServices`, `InstObjects`, `InstSolutions`, `Realizations`) i `src/seed/instalacje/**`,
- `seed/prokominstalacje/**`, `public/instalacje/**`,
- `docs/**/prokominstalacje*`, `docs/design/prokominstalacje/**`, `docs/stan/STAN-instalacje.md`, `docs/decyzje/ADR-I*`,
- `tests/e2e/instalacje/**`, `.claude/commands/inst-*.md`.

**Wyjątek:** sesja W-I w jednym PR `inst/w-pakiet` dopisuje 7 linijek do `CLAUDE.md`, jedną linię do `docs/STAN.md`, `tmp/` do `.gitignore` i `seed/prokominstalacje/` do `.prettierignore` (jak `seed/prokombiznes/`) — to jedyna zmiana strefy wspólnej poza PR-em `wsp`. (`docs/**` jest już wyłączone z ESLint i Prettiera.)

**Strefa wspólna** — zmiany tylko w małych, osobnych PR-ach `inst/wsp-<opis>`, scalanych szybko (ten sam wieczór), zanim zbuduje się na nich więcej:
- `src/payload.config.ts` (rejestracja kolekcji), `src/blocks/registry.ts` (bloki linii Instalacje — rejestr ADR-010), `src/lib/pages/slug.ts` (`RESERVED_PAGE_SLUGS` dla tras `(instalacje)`), `src/app/(sites)/[domain]/layout.tsx` (wpięcie `InstalacjeFrame`), `src/lib/brand/theme.ts` + `src/styles/tokens.css` (motyw ciemny Instalacji), kolekcje współdzielone (`Inquiries`, `Pages`, `Posts`, `SiteSettings`, `Tenants`, `Industries`, `Redirects`), `src/proxy.ts` i `src/lib/tenant/**`, `src/components/**` (wspólne — np. arkusz i dolny pasek, jeśli przenosimy je z Software), `package.json`/`pnpm-lock.yaml`, konfiguracje (Next, TS, ESLint, Playwright, CI), `docker/**`, `CLAUDE.md`, `docs/STAN.md`, `docs/sposob-pracy.md`.
- **Uwaga 27.10:** Software (gałąź `feat/sw2b-model-wspolny`) zmienia właśnie `Inquiries`, `Industries` i ADR-003. Zmiany Instalacji w tych plikach dopiero po scaleniu SW2b.
- Zasada: **zanim zmienisz plik wspólny, zrób `git fetch` i rebase na `origin/develop`**. Nowa zależność npm = osobny PR wspólny.

### 4. Migracje i pliki generowane
- Migracje Payload tylko z `pnpm payload migrate:create` (ADR-009 repo: bez `push`). **Przed utworzeniem migracji: rebase na `origin/develop`**, potem `migrate` na swojej bazie, potem `migrate:create`. Jedna migracja na PR.
- Gdy po rebase `develop` ma nowszą migrację niż Twoja: (1) cofnij swoją na lokalnej bazie `pnpm payload migrate:down` (albo, gdy baza i tak jest testowa: `pnpm payload migrate:fresh` + `pnpm seed:instalacje`), (2) usuń pliki swojej migracji (`.ts` i `.json` adaptera Postgres), (3) `pnpm payload migrate` (migracje z develop), (4) `pnpm payload migrate:create <nazwa>` od nowa. Pełna procedura repo: `docs/sposob-pracy.md` → „Zmiana schematu bazy”. Nigdy nie poprawiaj ręcznie cudzej migracji.
- Pliki generowane: `payload-types.ts`, `src/migrations/index.ts` (lista migracji), `importMap.js` — przy konflikcie **nie scalaj ręcznie**: weź wersję z develop i wygeneruj ponownie (`pnpm generate:types`, `pnpm generate:importmap`). Lista migracji w `index.ts` po rebase musi zawierać migracje z develop i Twoją na końcu.

### 5. Gałęzie, PR i kolejka scalania
- Gałęzie: `inst/<sesja>-<opis>` (np. `inst/i5-hero-glowna`), zawsze z `origin/develop`. Jedna sesja = jedna gałąź = jeden PR do `develop`, squash merge (jak w całym repo).
- **Scalanie do develop po kolei, nigdy dwa PR-y naraz bez rebase:** przed kliknięciem „Squash and merge” gałąź musi być aktualna z develop i mieć zielone CI. Kolejność, gdy czekają PR-y kilku linii: wspólne (`wsp`) → poprawki produkcyjne → reszta w kolejności otwarcia.
- Rebase codziennie na starcie sesji (`inst-start` to robi), żeby konflikty były małe.
- **Gałąź zadania zakładaj z develop dopiero po scaleniu PR-a `wsp`**, na którym się opiera. Jeśli musiała powstać na gałęzi `wsp`, po jej scaleniu (squash zmienia commity) przenieś ją: `git rebase --onto origin/develop inst/wsp-<opis> inst/<sesja>-<opis>`.

### 6. Niewidoczność do czasu odbioru
Kod Instalacji trafia do `develop` i `main` razem z Biznesem i Software (jedna aplikacja). Dopóki szef nie zaakceptuje strony:
- tenant `instalacje` na produkcji ma **`active = false`** (pole już istnieje w `Tenants`: „Nieaktywna strona zwraca 404 na wszystkich swoich domenach”) albo domena nie jest skierowana na serwer;
- na stagingu strona widoczna za hasłem, `noindex`.
Dzięki temu wdrożenie Biznesu nigdy nie czeka na Instalacje i odwrotnie.

### 7. Stan sesji osobno dla linii
- Instalacje zapisują stan w **`docs/stan/STAN-instalacje.md`** (nie w `docs/STAN.md`, które piszą inne linie — inaczej konflikt przy każdym PR). W `docs/STAN.md` jedna linijka z linkiem (dodana w W-I).
- **STAN aktualizujemy w tym samym PR co pracę:** `/inst-koniec` przed `/pr`, gdy zadanie skończone. Gdy praca zostaje na jutro — `/inst-koniec` i push gałęzi (`koniec.ps1`), PR jutro. Nigdy commit STAN na gałęzi już scalonej.
- Komendy: `/inst-start` i `/inst-koniec` (pliki `.claude/commands/inst-*.md`) — odpowiedniki `/koniec-sesji` dla Instalacji. `/zadanie`, `/przeglad`, `/pr`, `/wdrozenie` — wspólne, bez zmian.

### 8. Równoległe sesje Claude Code — ile naraz
- **Nigdy dwie sesje Claude Code w tym samym folderze.** Każda linia w swoim folderze i swoim oknie terminala.
- Technicznie można prowadzić sesje w kilku worktree naraz. Ograniczeniem jest RAM i uwaga: serwer deweloperski Next.js z Payload zużywa zwykle 1,5–3 GB, PostgreSQL kilkaset MB. Przy 16 GB RAM — **maksymalnie 2 uruchomione stosy**, przy 32 GB — 3. Kontener bazy jest jeden dla prokom-web, więc kosztem jest głównie `pnpm dev` — zamykaj serwer deweloperski folderu, w którym akurat nie pracujesz (Ctrl+C).
- **Zalecany rytm:** jedna sesja „budująca” (UI, dużo kodu, Twoja uwaga) + najwyżej jedna „spokojna” (dokumenty, seed, testy, poprawki z przeglądu) w innym repo/worktree. Dwie sesje UI naraz = dwa razy mniej uwagi na porównanie ze wzorcem, a to ono decyduje o jakości.
- Równoległość nie skraca łącznej pracy — zmienia tylko kolejność. Priorytety linii ustala szef (Gaming 20.11, produkcja Biznesu).

### 9. Serwer
Ten sam obraz `prokom-web`, ten sam stos produkcyjny i stagingowy. Nginx już przewiduje domenę (`PROD_SITE_HOSTS=prokombiznes.pl prokominstalacje.pl prokomsoftware.pl` w `.env.example`) — w I15 tylko DNS, certyfikat i `active = true`. Bez osobnej bazy na serwerze — tenant w tej samej bazie prokom-web.

## Konsekwencje
- (+) Brak drugiej aplikacji do utrzymania, wspólny panel i dane; brak blokowania Biznesu/Software.
- (+) Konflikty ograniczone do strefy wspólnej, która zmienia się rzadko i w małych PR-ach.
- (−) Dyscyplina: rebase przed migracją i przed scaleniem, PR-y wspólne od razu scalane.
- (−) RAM przy kilku stosach naraz.

## Odrzucone
- **Osobne repo `prokom-instal` (jak Gaming)** — duplikacja panelu, danych firmy, skrzynki zapytań i wdrożeń; sprzeczne z decyzją o jednym panelu multi-tenant. Gaming jest osobno, bo to sklep z własnym modelem i terminem 20.11; Instalacje to strona tej samej rodziny co Biznes i Software.
- **Praca w tym samym folderze co Software, przełączanie gałęzi** — jedna baza dla różnych migracji, przerwane sesje, brak równoległości.
- **Wspólna baza dla wszystkich worktree** — migracje z różnych gałęzi psują schemat.
- **Osobny kontener PostgreSQL / Mailpit dla Instalacji** — niepotrzebny: repo już obsługuje osobne bazy w jednym kontenerze (`start.ps1` zakłada bazę), a drugi kontener to tylko więcej RAM i portów.
