# Przyspieszenie budowy — prokombiznes.pl do produkcji (propozycja, 30.10.2026)

> **Status: przyjęta 30.10.2026** (Krystian: „chcę maksymalnie przyspieszyć budowanie”). Fale — `docs/zadania/prokombiznes.md` §7.1; dwa tory i migracje — `docs/sposob-pracy.md`; import treści — ADR-018 (proponowana). **Zmiany P1–P5 i P7 w `CLAUDE.md` oraz `.claude/commands/zadanie.md` wprowadza Krystian** — Claude nie zmienia własnych instrukcji (blokada uprawnień); gotowy tekst: §9.

## 1. Gdzie dziś ucieka czas

| Koszt | Skąd | Ile mniej więcej |
|---|---|---|
| Stały rytuał każdej sesji | start, STAN, eksploracja, plan → czekanie na „ok”, diff przed każdym commitem, `/przeglad`, `/pr`, CI, `/koniec-sesji` | 30–40% czasu sesji; przy 15 sesjach K4 — najwięcej ze wszystkiego |
| Sesje jedna po drugiej | plan §7 to lista 1 → 17, choć część sesji nie zależy od siebie | cała kolejka czeka na najwolniejszy krok |
| Ręczne przenoszenie treści na staging i produkcję | seed jest tam zablokowany, a lista „wpisz w panelu” (STAN → Produkcja, Software „przed stagingiem”) rośnie z każdą sesją | dni ręcznego klikania na końcu, z ryzykiem pomyłek |
| Brak stagingu | S10 czeka od 19.10; Lighthouse, QA i akceptacja szefa przesuwają się na sam koniec | wszystko, co „zmierzyć na stagingu”, spiętrza się przed produkcją |
| Środowisko | port 3000 dzielony z `prokom-web` (Playwright łączy się z cudzym serwerem), zimny serwer przy każdym e2e | kilkanaście minut na sesję |

## 2. Nowy podział sesji Biznesu (zamiast §7 pkt 3–17)

Dwa tory w dwóch sesjach naraz. **Tor A** — sesje ze zmianą danych i schematu, po kolei, w folderze `prokom-web-biznes`. **Tor B** — rama i strony, w drugiej sesji (osobny folder albo worktree wg `docs/sposob-pracy.md`). Jedna sesja może wydać 2–3 PR-y „piętrowo” (druga gałąź od pierwszej), bez rytuału pomiędzy nimi.

| Fala | Tor A (dane, migracje) | Tor B (UI) | Poza kodem |
|---|---|---|---|
| **0 — teraz** | K4a-2 (w przeglądzie) | — | **S10: serwer i staging** (Krystian + sesja wg `docs/runbook.md` §1) · **ADR-018: import treści** (pkt 4) |
| **1** | **K4f** — `/marki` + szablon salonu 2.0 + 20 salonów + usunięcie `Partners.showroom` (było K4f-1 + K4f-2) | **K4bc** — rama + strona główna v150 (było K4b + K4c; 2 PR-y) | staging działa → każdy PR od razu na `develop`/staging |
| **2** | **K4de** — oferta, kategoria i produkt K4 (było K4d + K4e; wspólna karta produktu) | **K4hij** — strony z blokami: GoPOS, InsERT, Opieka IT, O firmie, Kontakt, KSeF, ulga, automaty (było K4h + K4i + K4j; 3 PR-y) | Lighthouse na stagingu po każdej fali, nie na końcu |
| **3** | **K4g** — Konfigurator 3.0 + **K31d′** Plan (wspólne sceny i dane) | **M1′-reszta** — tylko to, czego nie zrobiły sesje UI (dolny pasek aplikacji, przejścia) | szef przegląda staging na bieżąco (Asana) |
| **4** | **Odbiór** — PROD′ + QA-K4 w jednej sesji, na stagingu | — | import treści (ADR-018) → akceptacja szefa → `/wdrozenie produkcja` |

**Efekt:** z 15 kroków po kolei robi się 8 sesji w 4 falach. Telefon (MOBILE-APLIKACJA §4) jest już Definition of Done każdej sesji z UI, więc M1′ kurczy się do resztek.

**Kolejność cięcia** (§7) zostaje bez zmian — gdy termin goni, tniemy od końca.

### Kto jest właścicielem plików wspólnych w danej fali

Żeby dwie sesje nie pisały tych samych plików:
- **Fala 1:** K4bc ma `globals.css`, motyw, nagłówek, stopkę i bloki strony głównej; K4f ma trasy `/marki` i komponenty salonów.
- **Fala 2:** K4de ma kartę produktu (`ProductCard`, `ProductStage`) — K4hij jej używa, nie zmienia; K4hij ma nowe bloki `Pages`.
- **Zawsze po kolei:** `src/seed/biznes/run.ts`, `src/payload-types.ts`, `src/migrations/*`. Zasada migracji — pkt 3, P6.

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
- **Konflikty przy scalaniu dwóch torów** (`run.ts`, `payload-types.ts`, migracje) — łagodzą to właściciele plików w fali i zasada P6.
- **P2 oznacza mniej punktów kontrolnych w trakcie sesji.** Jeśli wolisz, P2 można włączyć tylko dla sesji UI, a przy migracjach zostać przy diffie przed commitem.

## 8. Co weszło (PR `docs/przyspieszenie`)

- `docs/zadania/prokombiznes.md` §7.1 — fale i tory.
- `docs/sposob-pracy.md` — dwa tory, własny port na folder, zasada migracji (P6), bezpieczny test `down`.
- ADR-018 — jednorazowy import treści (proponowana).
- **Nie weszło — do wprowadzenia przez Krystiana:** `CLAUDE.md` i `.claude/commands/zadanie.md` (§9). Do tego czasu stare zasady (plan → „ok”, diff przed commitem) dalej obowiązują.
- **Krystian, poza repo:** `PORT=3001` w `.env` folderu `prokom-web-biznes`; drugi folder Biznesu dla toru B (`docs/sposob-pracy.md` → „Dwie strony równolegle”); start S10.

## 9. Gotowy tekst zmian w `CLAUDE.md` i `.claude/commands/zadanie.md`

Każda pozycja: **zamień** zdanie z `CLAUDE.md` na nowe.

1. Sekcja „Sposób pracy”, przed punktem „Dwie strony równolegle” — **dopisz:**
   > - **Dwa tory naraz (`docs/zadania/przyspieszenie.md`):** tor A — sesje ze zmianą danych i schematu, po kolei; tor B — rama i strony, w drugim folderze. Najwyżej dwie sesje piszące kod naraz we wszystkich liniach. W fali każdy plik wspólny ma jednego właściciela; `run.ts`, `payload-types.ts` i migracje zawsze po kolei.
2. „Zasady kodu”, punkt o migracji — **dopisz na końcu:**
   > Przed `/pr` gałąź z migracją: rebase na `origin/develop`, usunięcie własnej migracji i `migrate:create` od nowa (`docs/sposob-pracy.md` → „Dwa tory i migracje”).
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

Możesz też pozwolić Claude wprowadzić te zmiany: zatwierdź edycję `CLAUDE.md` w oknie uprawnień, gdy o nią poproszę.
