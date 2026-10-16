# STAN — prokom-web

Aktualizuj po każdej sesji (`/koniec-sesji`). Najnowsze na górze.

## Cel października 2026
| Etap | Termin | Status |
|---|---|---|
| Fundament (S1–S9 lokalnie, S10 na serwerze) — `docs/zadania/fundament.md` | S1–S9: 15–21.10 · S10: po dostawie VPS | ⏳ S1–S4 gotowe, następna S5 |
| prokombiznes.pl — specyfikacja (czat „Spec · prokombiznes.pl”) | po fundamencie | ⏳ szkic w `strony/prokombiznes.md` |
| prokombiznes.pl — wdrożenie | 26.10 | ⏳ |
| prokominstalacje.pl | 29.10 | ⏳ |
| prokomsoftware.pl | 31.10 | ⏳ |

## W toku
- **Nic w toku — S4 zamknięte.** Gałąź: brak (pracujemy z `develop`). Zrobione w tej sesji: S4 scalone (#22) — `CompanyData`, `SiteSettings` per tenant, stopka z danymi; poprawione `down` migracji S3/S4. Niedokończone: nic. Na drugim komputerze **raz**: `.\scripts\start.ps1`, `pnpm payload migrate`, `pnpm seed` (doda ustawienia stron i przykładowe dane firmy); e2e wymagają `SEED_ADMIN_*` w `.env`. **Następny krok:** nowa sesja Claude Code → `/zadanie S5` (strony z bloków: `Pages`, wersje robocze, podgląd, rewalidacja per tenant, **rejestr bloków per linia wg ADR-010** — strony linii będą bardzo różne); w S5 dopisz `Pages` do `collections` wtyczki Multi-Tenant i do licznika w `preventDeleteWhileInUse` (`src/collections/Tenants.ts`, `TODO(S5/S7)`), a przy cache uwzględnij okno paska promocji (Pomysły na później).

## Zrobione
- 16.10.2026 — S4 scalone (#22): global `CompanyData` (NIP z sumą kontrolną, telefony, oddziały z godzinami, pasek promocji od–do; edytuje admin i edytor — uzupełnienie ADR-006), kolekcja `SiteSettings` (1 na tenanta, unikalny `tenant_id`), odczyt w `lib/site/data.ts` z filtrem tenanta, minimalna nawigacja/stopka/pasek w layoucie, seed z danymi przykładowymi, blokada usunięcia tenanta z ustawieniami. Przegląd `recenzent`: poprawione `down` migracji S3 i S4 (sprawdzone `migrate:down` → `migrate`), walidator linków odrzuca `\`. Testy: 122 Vitest, 17 e2e. CI zielone.
- 16.10.2026 — S3 scalone (#19): kolekcja `Tenants` (domeny `{ host, environment }`, host unikalny — walidacja + indeks; uzupełnienie ADR-006), oficjalna wtyczka Multi-Tenant (admin — wszyscy tenanci, edytor — przypisani; usunięcie tenanta nie kasuje treści, a z przypisanymi użytkownikami jest odrzucane), `src/proxy.ts` + `lib/tenant/routing.ts` (panel i API Payload tylko na `PANEL_HOST`), `(sites)/[domain]` z tenantem z bazy (cache 60 s) i kontrolą `Host`, seed 3 tenantów, nowa zmienna `PANEL_HOST`. Testy: 70 Vitest, 15 e2e (izolacja, nieznany host, panel). Przegląd `recenzent` znalazł obejście routingu ścieżką `/<inna domena>` — poprawione w tym samym PR. CI zielone.
- 15.10.2026 — S2 scalone (#16): migracje zamiast `push` (pierwsza migracja, `migrate` w CI), `Users` z rolami `admin`/`editor` i dostępem wg ról, blokada po 5 nieudanych logowaniach na 15 min, hasło min. 12 znaków (także przy resecie), `pnpm seed` z blokadą na produkcji. Przegląd subagentem `recenzent`, poprawki w tym samym PR. Lokalna baza odtworzona z migracji, logowanie adminem z seeda sprawdzone.
- 15.10.2026 — S1b scalone (#9): CI (lint/format/typecheck/test/build/e2e + gitleaks), kontrola tytułu PR, Dependabot, haki git (husky + lint-staged + gitleaks), hak Prettiera i subagent `recenzent` w Claude Code. CI na `develop` zielone. Dependabot otworzył pierwsze PR-y (#10–#14; #7 — poprawki bezpieczeństwa do scalenia po zielonym CI).
- 15.10.2026 — S1a scalone (#6): szkielet Next 16.3.8 + Payload 3.90.2, pnpm 11, TS strict, ESLint/Prettier, Vitest, Playwright, `lib/env.ts`, `docker/compose.dev.yml`.
- 15.10.2026 — brief wizualny prokombiznes.pl (szkic do akceptacji) przeniesiony do `docs/strony/prokombiznes-design.md`, link w specyfikacji.
- 15.10.2026 — uzupełnienia fundamentu: `docs/dns.md` (własność domen, rekordy, SPF/DKIM/DMARC); retencja zapytań w ADR-003 i S8; logi strukturalne i smoke test w S9; budżet Lighthouse CI, poczta i automatyczny powrót w S10; podpisywanie commitów SSH i lepsze ustawienia gita w `setup-komputera.ps1`; nawyki pracy w `CLAUDE.md` i `sposob-pracy.md`.
- 14.10.2026 — `scripts/setup-komputera.ps1` (konfiguracja komputera jedną komendą); `start.ps1` przełącza Node z `.nvmrc` (fnm); zakres S1 rozszerzony o haki git, kontrolę tytułu PR, haki i recenzenta w Claude Code.
- 14.10.2026 — sposób pracy na dwóch komputerach (`docs/sposob-pracy.md`, `scripts/start.ps1`, `scripts/koniec.ps1`).
- 14.10.2026 — organizacja GitHub firmy `prokom-eu` skonfigurowana (2FA wymagane, uprawnienia członków ograniczone, Actions tylko GitHub + zweryfikowani twórcy). Aktualizacja dokumentacji: ADR-002 (Seohost), ADR-003 (decyzja), ADR-005, ADR-006, ADR-007, plan fundamentu, tokeny marki.
- 12.10.2026 — założenie dokumentacji repo (CLAUDE.md, docs/, komendy).

## Następne kroki
1. S1 → S9 według `docs/zadania/fundament.md`, po kolei, każda sesja = jeden PR.
2. Domeny (prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl) — zakup 16.10.
3. VPS Seohost — zamówienie w tygodniu 19–23.10 → S10 (staging).
4. Skrzynki `biznes@`, `instalacje@`, `software@pro-kom.eu` — założyć przed 26.10 (Krystian + szef, Thunderbird); dopisać do listy skrzynek przy migracji poczty do Seohost (ADR-002).

## Pomysły na później (poza zakresem bieżących sesji)
- Z S4 → S5: przy cache/ISR stron pasek promocji liczy okno od–do w chwili renderowania — rewalidacja musi uwzględnić `startsAt`/`endsAt` (albo pasek renderowany dynamicznie).
- Z S4 (ADR-006): `CompanyData` tylko do odczytu dla prokomserwis.pl (klucz API) — po fundamencie.
- Z S4 → S7: domyślny obraz OG w `SiteSettings.seo` (`TODO(S7)`, wymaga `Media`).
- Z S4: generator migracji Payload pisze `down` z `DROP CONSTRAINT` po `DROP TABLE … CASCADE` — każdą nową migrację sprawdzać lokalnie `migrate:down` → `migrate` (kandydat do `docs/sposob-pracy.md` → „Zmiana schematu bazy”).
- Z S3 → S7: `robots.txt` i `sitemap.xml` per domena mają rozszerzenie, więc `decideRoute` (`lib/tenant/routing.ts`) puszcza je dziś jako plik z `public/` — dodać wyjątek (rewrite na `/<host>/...`) z testem.
- Z S3 → S8: proxy blokuje na domenach stron całe `/api`; `/api/inquiry` (ADR-003) wymaga wyjątku w `decideRoute` z testem.
- Z S3 → S7: 404 z proxy (`/admin`, `/api` na domenie strony) to goły tekst „Not Found”, a 404 z layoutu to strona `(sites)/not-found.tsx` — ujednolicić przy własnej stronie 404.
- Z S3 → S10: pliki z `public/brand/` odpowiadają 200 także na obcym hoście (proxy ich nie przepisuje) — Nginx z `server_name` tylko dla naszych domen odetnie obce hosty; przy okazji cache tenantów przestanie się czyścić od losowych hostów.
- Z S3 → S10: Nginx musi przekazywać oryginalny nagłówek `Host` (`proxy_set_header Host $host`) — od niego zależy wybór tenanta.
- Przy pierwszej produkcji (26.10): wersje i lista zmian — tag `vX.Y.Z` przy wdrożeniu na `main`, automatyczny changelog z tytułów PR (dla szefa: „co nowego”, dla nas: punkt rollbacku).
- Gdy dojdzie druga osoba do kodu: plan GitHub Team (prawdziwa ochrona gałęzi `main`/`develop` w prywatnym repo). Dziś wystarcza blokada w `.claude/settings.json` + CI.
- Przy pierwszej produkcji: komenda `/raport-tygodnia` — scalone PR-y z tygodnia + STAN → 5 linijek statusu do Asany (prostym językiem dla szefa).
- Po S2 (najpóźniej w S9, przy obrazie produkcyjnym): e2e w CI na zbudowanej aplikacji (`pnpm start` + `payload migrate`) zamiast `pnpm dev` (bliżej produkcji, szybciej).
- CI: `--max-old-space-size=8000` w skrypcie `build` (z szablonu) przekracza RAM runnera GitHub (~8 GB) — obniżyć do ~6144, gdy build urośnie albo pojawi się exit 137.
- CI: kontrola „schemat = migracje” — job, który na zmigrowanej bazie uruchamia `migrate:create` i failuje, gdy powstałaby niepusta migracja (złapie zmianę kolekcji bez migracji).
- Ochrona ostatniego admina (z przeglądu S2): hak `beforeChange`/`beforeDelete` w `Users` odrzuca zmianę roli lub usunięcie, gdy po niej nie zostałby żaden admin — przed dodaniem drugiego użytkownika-admina, najpóźniej przed produkcją 26.10.

## Otwarte pytania
- **16.10 (Krystian, przy zakupie):** domeny na firmę (abonent PRO-KOM) i konto rejestratora na firmowy e-mail z 2FA i autoodnawianiem (`docs/dns.md`).
- Z jakiego adresu wychodzą maile z formularzy (domena nadawcy) — decyzja w S8.
- Okres retencji zapytań (domyślnie 24 miesiące, ADR-003) — potwierdzić przy polityce prywatności.
- Telefony i adresy e-mail dla każdej strony. Powiadomienia o zapytaniach — **ustalone 16.10** (ADR-003): skrzynki `biznes@`, `instalacje@`, `software@pro-kom.eu`, obsługują Krystian i szef w Thunderbirdzie; otwarte: skrzynka huba pro-kom.eu.
- Serwery i sieć: Biznes czy Instalacje? Ceny na stronie czy „Zapytaj o ofertę”? (do specyfikacji Biznes)
