# Przyspieszenie budowy — prokombiznes.pl do produkcji (propozycja, 30.10.2026)

> **Status: przyjęta 30.10.2026** (Krystian: „chcę maksymalnie przyspieszyć budowanie”). Kolejka sesji (jeden folder) — `docs/zadania/prokombiznes.md` §7.1; migracje z kilku folderów — `docs/sposob-pracy.md`; import treści — ADR-018 (proponowana); zasady P1–P5 i P7 — `CLAUDE.md` i `.claude/commands/zadanie.md` (tekst zmian: §9).

## 1. Gdzie dziś ucieka czas

| Koszt | Skąd | Ile mniej więcej |
|---|---|---|
| Stały rytuał każdej sesji | start, STAN, eksploracja, plan → czekanie na „ok”, diff przed każdym commitem, `/przeglad`, `/pr`, CI, `/koniec-sesji` | 30–40% czasu sesji; przy 15 sesjach K4 — najwięcej ze wszystkiego |
| Sesje jedna po drugiej | plan §7 to lista 1 → 17, choć część sesji nie zależy od siebie | cała kolejka czeka na najwolniejszy krok |
| Ręczne przenoszenie treści na staging i produkcję | seed jest tam zablokowany, a lista „wpisz w panelu” (STAN → Produkcja, Software „przed stagingiem”) rośnie z każdą sesją | dni ręcznego klikania na końcu, z ryzykiem pomyłek |
| Brak stagingu | S10 czeka od 19.10; Lighthouse, QA i akceptacja szefa przesuwają się na sam koniec | wszystko, co „zmierzyć na stagingu”, spiętrza się przed produkcją |
| Środowisko | port 3000 dzielony z `prokom-web` (Playwright łączy się z cudzym serwerem), zimny serwer przy każdym e2e | kilkanaście minut na sesję |

## 2. Nowy podział sesji Biznesu (zamiast §7 pkt 3–17)

**Jeden folder, sesje po kolei** (decyzja Krystiana 30.10: bez drugiego folderu). Zysk bierze się z połączenia sesji i z PR-ów piętrowych (druga gałąź od pierwszej, bez rytuału pomiędzy), nie z równoległości.

| # | Sesja | Zakres | Uwagi |
|---|---|---|---|
| 1 | **K4bc** | rama (K4b) + strona główna v150 (K4c) | 2 PR-y piętrowo; rama wpływa na każdy widok, więc pierwsza |
| 2 | **K4f** | `/marki` + szablon salonu 2.0 + 20 salonów + usunięcie `Partners.showroom` (K4f-1 + K4f-2) | 2 PR-y; dane z K4a-2 |
| 3 | **K4de** | oferta, kategoria i produkt K4 (K4d + K4e) | wspólna karta produktu |
| 4 | **K4hij** | GoPOS, InsERT, Opieka IT, O firmie, Kontakt, KSeF, ulga, automaty (K4h + K4i + K4j) | 3 PR-y piętrowo |
| 5 | **K4g** + **K31d′** | Konfigurator 3.0 + Plan Twojej firmy | wspólne sceny i dane |
| 6 | **M1′-reszta** | tylko to, czego nie zrobiły sesje UI (dolny pasek aplikacji, przejścia) | |
| 7 | **Odbiór** | PROD′ + QA-K4 na stagingu → import treści (ADR-018) → akceptacja szefa → produkcja | |

**Równolegle, poza kodem:** S10 (serwer i staging) jak najwcześniej; Lighthouse na stagingu po każdej sesji z UI; szef przegląda staging na bieżąco.

**Efekt:** z 15 kroków robi się 7 sesji. Telefon (MOBILE-APLIKACJA §4) jest już Definition of Done każdej sesji z UI, więc M1′ kurczy się do resztek.

**Kolejność cięcia** (§7) zostaje bez zmian — gdy termin goni, tniemy od końca.

## 3. Zmiany w sposobie pracy (propozycja zmian w `CLAUDE.md`)

| # | Dziś | Propozycja | Dlaczego bez utraty jakości |
|---|---|---|---|
| P1 | Plan → czekam na „ok” zawsze | Gdy prompt w `PRZEKAZANIE-*.md` jest kompletny, piszę plan (maks. 15 linii) i od razu zaczynam. Zatrzymuję się tylko przy decyzji (pytanie z opcjami) albo przy migracji, która usuwa dane | prompt jest planem zaakceptowanym wcześniej; decyzje dalej są Twoje (jak dziś: model salonu, logo SVG) |
| P2 | Diff i Twoja zgoda przed **każdym** commitem | Commituję sam małymi commitami (Conventional, podpisane); **całość czytasz raz, przed `/pr`** | scalamy przez squash — liczy się diff PR-a; zasada „rozumiesz każdą linię” zostaje na poziomie PR |
| P3 | Jedna sesja = jeden PR | Sesja może wydać 2–3 PR-y piętrowo (pkt 2) | rytuał startu i końca raz zamiast trzech razy |
| P4 | `/przeglad`, `/koniec-sesji` na prośbę | Na końcu sesji z kodem sam uruchamiam recenzenta i aktualizuję STAN; dostajesz jedną wiadomość: diff, werdykt recenzenta, moja ocena każdej uwagi | recenzent zostaje obowiązkowy — zmienia się tylko to, kto go woła |
| P5 | Tryb planu z eksploracją na starcie każdej sesji | Bez trybu planu, gdy jest gotowy prompt; eksploracja tylko plików z zakresu | ciągłość niesie STAN i prompt — eksploracja całości powtarzała się co sesję |
| P6 | Migracje z dwóch folderów bez zasady | Przed `/pr` sesja z migracją robi rebase na `origin/develop`, usuwa swoją migrację i tworzy ją od nowa (`migrate:create`) | Payload liczy nową migrację od ostatniego snapshotu `.json`; dwie gałęzie od tej samej bazy dałyby po scaleniu snapshot bez zmian drugiej — następna migracja tworzyłaby tabele drugi raz |
| P7 | e2e na porcie z `.env`, często 3000 | Każdy folder ma własny `PORT` w `.env` (Biznes: 3001); lokalnie testy jednostkowe + spec e2e zmienianego obszaru, reszta w CI | koniec fałszywych błędów z cudzego serwera; pełne e2e i tak blokuje scalenie w CI |

**Bez zmian:** recenzent przy logice, tenantach, formularzach i migracjach; testy mapowania danych i izolacji tenantów; DoD telefonu i dostępności; produkcja tylko po akceptacji szefa i tylko przez pipeline; zakaz pushowania na `main`/`develop`.

## 4. ADR-018 (do napisania): jednorazowy import treści na staging i produkcję

**Problem:** seed działa tylko lokalnie, więc wszystko, co wpisuje (katalog K4, kategorie, 301, salony, zestawy, plany, strony GoPOS/InsERT/Kontakt, reguły kreatora, ustawienia Software), trzeba przed produkcją przepisać ręcznie. Lista rośnie z każdą sesją.

**Propozycja:**
- **Komenda importu z jawną flagą,** np. `pnpm seed:biznes --target=staging|production`, uruchamiana w kontenerze. Wymaga potwierdzenia nazwy bazy i świeżej kopii (`scripts/backup.sh`).
- **Jednorazowo:** raz na staging (powtarzalnie, aż szef zaakceptuje) i raz na produkcję przed startem.
- **Potem panel jest właścicielem treści,** a import na produkcji zostaje zablokowany na stałe (flaga w bazie po pierwszym przebiegu).
- **Konta, zgłoszenia i dane osobowe** — import ich nie dotyka.

**Dlaczego:** seed jest już idempotentny i testowany (drugi przebieg = 0 zmian). To bezpieczniejsze niż setki ręcznych wpisów i daje stagingowi te same dane co lokalnie.

**Ryzyko:** pomyłka bazy docelowej — stąd flaga, potwierdzenie nazwy, kopia przed importem i blokada po pierwszym przebiegu.

## 5. Środowisko — do zrobienia raz

- **Krystian:** `PORT=3001` w `.env` folderu `prokom-web-biznes` (Claude nie edytuje `.env`).
- **`.claude/launch.json`** z serwerem dev tego folderu — jeden działający `pnpm dev` na sesję, e2e go używają, zamiast kompilować wszystko od zera.
- **CI** — przyspieszone 30.10 (`chore/ci-szybciej`), bez zmian.

## 6. Pozostałe linie (Software, Instalacje)

- **Te same zasady P1–P7.** Linie i tak pracują w osobnych folderach.
- **Wąskim gardłem jest Twoja uwaga, nie liczba sesji:** proponuję **najwyżej dwie sesje piszące kod naraz** we wszystkich liniach razem. Trzecia w tym czasie robi rzeczy bez diffu do czytania: dokumenty, dane, staging.
- **Import treści (ADR-018)** obejmuje też Software („przed stagingiem: uzupełnić w panelu…” z `docs/STAN.md`).

## 7. Ryzyka tej propozycji

- **Większe PR-y do czytania** — łagodzi to recenzent i podział na PR-y piętrowe w jednej sesji.
- **P2 oznacza mniej punktów kontrolnych w trakcie sesji.** Jeśli wolisz, P2 można włączyć tylko dla sesji UI, a przy migracjach zostać przy diffie przed commitem.

## 8. Co weszło (PR `docs/przyspieszenie`)

- `docs/zadania/prokombiznes.md` §7.1 — fale i tory.
- `docs/sposob-pracy.md` — migracje z kilku folderów, własny port na folder, zasada migracji (P6), bezpieczny test `down`.
- ADR-018 — jednorazowy import treści (proponowana).
- `CLAUDE.md` i `.claude/commands/zadanie.md` — zasady P1–P5 i P7 (§9; wprowadzone po zgodzie Krystiana w oknie uprawnień).
- **Krystian, poza repo:** `PORT=3001` w `.env` folderu `prokom-web-biznes`; drugi folder Biznesu dla toru B (`docs/sposob-pracy.md` → „Dwie strony równolegle”); start S10.

## 9. Gotowy tekst zmian w `CLAUDE.md` i `.claude/commands/zadanie.md`

Każda pozycja: **zamień** zdanie z `CLAUDE.md` na nowe.

1. Sekcja „Sposób pracy”, przed punktem „Dwie strony równolegle” — **dopisz:**
   > - **Biznes w jednym folderze (decyzja Krystiana 30.10):** sesje po kolei wg kolejki `docs/zadania/prokombiznes.md` §7.1 — sesje połączone, 2–3 PR-y piętrowo w jednej sesji, bez drugiego folderu. Najwyżej dwie sesje piszące kod naraz we wszystkich liniach (Biznes, Software, Instalacje).
2. „Zasady kodu”, punkt o migracji — **dopisz na końcu:**
   > Przed `/pr` gałąź z migracją: rebase na `origin/develop`, usunięcie własnej migracji i `migrate:create` od nowa (`docs/sposob-pracy.md` → „Migracje z kilku folderów”).
3. „Git” — **zamień** „Przed każdym commitem pokaż mi `git diff --staged --stat`… Commit dopiero, gdy Krystian przeczyta zmiany.” **na:**
   > - Commity robisz sam w trakcie sesji: małe, logiczne, Conventional, podpisane, po zielonym `lint/typecheck/test`. **Całość czytam raz, przed `/pr`:** `git diff origin/develop...HEAD --stat`, werdykt recenzenta i Twoja ocena każdej uwagi. PR dopiero po moim „tak”.
4. „Rzemiosło”, „Małe kroki” — **zamień na:**
   > - **Małe kroki:** plan → test → kod → `lint/typecheck/test` → commit. Gdy zmiana rośnie powyżej ~400 linii diffu, podziel ją na PR-y piętrowe w tej samej sesji (druga gałąź od pierwszej), bez rytuału startu i końca pomiędzy.
5. „Rzemiosło”, `/przeglad` — **zamień** „przed PR z kodem” **na:**
   > uruchamiasz sam na końcu sesji z kodem (…); poprawki z przeglądu — po mojej zgodzie.
6. „Komendy projektu”, `/zadanie` — **zamień na:**
   > - `/zadanie <sesja lub opis>` — kontekst i plan (maks. 15 linii). Gdy prompt sesji w `PRZEKAZANIE-*.md` jest kompletny, od razu kod; zatrzymujesz się tylko przy decyzji (pytanie z opcjami) albo migracji usuwającej dane. Bez trybu planu przy gotowym prompcie.
7. „Lokalnie”, zdanie o porcie — **zamień na:**
   > Port to `PORT` z `.env` folderu (`prokom-web-biznes`: 3001, drugi folder strony: kolejny wolny). Każdy folder ma **własny** port: Playwright (`reuseExistingServer`) podłącza się do każdego serwera na porcie, także z innego folderu.
8. `.claude/commands/zadanie.md`, punkty 5–6 — **zamień na:**
   > 5. Gdy prompt sesji (`PRZEKAZANIE-*.md`) jest kompletny i nie ma otwartych pytań — od razu zaczynasz kod. Zatrzymaj się tylko, gdy jest decyzja do podjęcia (pytanie z opcjami i rekomendacją), brakuje treści biznesowej albo migracja usuwa dane.
   > 6. Małe kroki, po każdym `pnpm lint && pnpm typecheck`; commity robisz sam po zielonych testach. Na końcu sesji z kodem: `/przeglad`, aktualizacja `docs/STAN.md`, potem diff całości i czekasz na „tak” przed `/pr`.

Wprowadzone 30.10 w tym samym PR.
