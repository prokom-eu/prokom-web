# prokominstalacje.pl — plan domknięcia: od L1-I do produkcji

Wersja 1.0 · 06.11.2026 · czat „PRO-KOM Cyfryzacja” → Claude Code.
Obejmuje: rozmowy z 05.11 (runda v5, połączenie sesji w INST-1 / FUND / INST-2 / INST-3 / PROD) i 06.11 (audyt develop, L1-I, galeria, błąd wyszukiwarki na telefonie).

**Ten plik ma pierwszeństwo** przed tabelą sesji w `docs/zadania/prokominstalacje.md` §1 i przed „Następnym krokiem” w `docs/stan/STAN-instalacje.md` z 05.11. Spec §2 (decyzje biznesowe), `RUNDA-V5.md` i zasady z `CLAUDE.md` obowiązują bez zmian.

Źródła, które sesje czytają (kolejność ważności):
1. ten plik;
2. `docs/stan/STAN-instalacje.md` — „W toku” (wpisy L1-I z 06.11);
3. audyt develop 06.11 — w repo: `docs/audyty/prokominstalacje-audyt-0611.md` (kopia raportu z projektu; numery P0-1 … P3-26 niżej odnoszą się do niego);
4. `docs/design/prokominstalacje/RUNDA-V5.md` (§5, §6, §8, §10, §11 — jeszcze do zrobienia);
5. elementy wspólne: `docs/design/wspolne/WSPOLNE-ELEMENTY.md`, `MAPA-DZIS.md` (wiersze Instalacji), `docs/zadania/wspolne-elementy.md` §3 (kroki L2);
6. `docs/strony/prokominstalacje.md` (spec, §2 = decyzje nie do zmiany), ADR-I001 (strefa wspólna, migracje).

Galeria całej strony po L1-I (35 stron × komputer/telefon × jasny/ciemny + 12 stanów): artefakt „Galeria prokominstalacje.pl” w projekcie czatu — punkt odniesienia „przed” dla INST-2.

---

## 0. Co ustaliliśmy 05–06.11 (w skrócie)

| Kiedy | Co | Skutek dla planu |
|---|---|---|
| 05.11 | Za dużo małych sesji → **duże sesje** (jak Biznes 30.10 / 01.11): jedna sesja = jeden plan i kilka PR-ów piętrowych przez kilka wieczorów. | Zostają 4 sesje Instalacji + 1 mała sesja fundamentu. |
| 05.11 | **INST-1** = runda v5 przed stagingiem (V5-A + V5-B). | ✅ Scalone #322, #323, #325, #327, #328, #329. |
| 06.11 | **Audyt develop** (35 stron × 4 widoki, axe, CLS/LCP, SEO, treści, przegląd kodu). Werdykt: technicznie bardzo dobrze, przed pokazaniem szefowi blokują **treści**. | P0–P3 rozpisane w sesjach niżej (mapa w §8). |
| 06.11 | **L1-I** (powłoka na elementach wspólnych: kapsuła z dwoma mega menu, szyna + wyszukiwarka z indeksem linii, stopka z grzbietem gór, pasek aplikacji, arkusz Menu; bez WhatsAppa w UI; obietnice „wyślij zdjęcia” przeredagowane). | PR #348 (`inst/l1-szukaj`) + #349 (`inst/l1-powloka`, piętrowo). Czekają na scalenie (§1). |
| 06.11 | **Galeria** całej strony po L1-I. | Wykryty błąd: **na telefonie i tablecie (≤ 1080 px) nie da się otworzyć wyszukiwarki** — sesja FUND-W. |
| 06.11 | **L2-I** (Kontakt, O firmie na szablonach) czeka na D2-3 (#341) i D2-4 (#343). | Pierwszy PR sesji INST-2. |

**Zmiana nazw (żeby nie mylić):** stary „INST-2 = staging” z 05.11 to teraz **INST-3**; stary „INST-3 = V5-C + V5-D” to teraz **INST-4**. Nowy **INST-2** = domknięcie przed stagingiem (L2-I + poprawki z audytu), bo audyt pokazał, że bez niego szef zobaczy na stagingu rzeczy niegotowe.

---

## 1. Stan na 06.11 (sprawdzony na GitHubie)

| PR | Gałąź | Co | CI | Co dalej |
|---|---|---|---|---|
| #341 | `feat/wsp-formularz` | D2-3a: wspólny formularz kontaktu, zgoda, strefy dojazdu; **poprawia też `SearchDialog` i e2e `/_wspolne`** | zielone | Krystian scala jako pierwszy |
| #343 | `feat/wsp-szablony` (baza `feat/wsp-formularz`) | D2-4: szablony Kontakt i O firmie | tylko tytuł (piętrowy) | po #341: baza → `develop`, pełne CI, scalenie |
| #348 | `inst/l1-szukaj` | indeks wyszukiwarki Instalacji + `/api/inst-search-index` | e2e 6/6 czerwone w testach `/_wspolne` (nie z tego PR) | po #341: rebase na `develop` → CI powinno być zielone → scalenie |
| #349 | `inst/l1-powloka` (baza `inst/l1-szukaj`) | powłoka L1-I, bez WhatsAppa w UI, testy, STAN | tylko tytuł | po #348: baza → `develop`, pełne CI, scalenie |

Audyt 06.11 po L1-I: **P0-1** (WhatsApp w UI) i **P0-2** (obietnica zdjęć w formularzu) zrobione w #349. Do zrobienia: P0-3, P1-4…P1-10, P2, P3 (mapa w §8).

---

## 2. Kolejność i podział

```
KROK 0 (Krystian, bez Claude Code): scal #341 → #343 → #348 → #349
        │
        ├──► FUND-W  (folder prokom-web, fundament; mały, 0,5–0,75 wieczoru)
        │      wyszukiwarka na telefonie, szyna w stopce, ikony, porządki
        │
        └──► INST-2  (folder prokom-instal; 3–3,5 wieczoru, 5 PR-ów)
               PR1 L2-I Kontakt i O firmie · PR2 treści i jakość z audytu
               PR3 kontrast i logo marek · PR4 hero (dostępność, telefon, v5)
               PR5 resztki WhatsAppa w danych (tylko po decyzji D1)
                       │   (FUND-W scalone)
                       ▼
               INST-3  staging i odbiór (1–1,5 wieczoru + praca w panelu)
                       │   (szef ogląda staging, zbieramy uwagi)
                       ▼
               INST-4  runda v5 cz. 2: V5-C + V5-D + uwagi szefa (2,5–3 wieczory)
                       │   (akceptacja szefa w Asanie)
                       ▼
               PROD    produkcja (0,5–1 wieczoru + DNS/Google)
```

- **Równolegle:** FUND-W (prokom-web) i INST-2 (prokom-instal) mogą iść naraz — to dwie sesje piszące kod, więcej nie (zasada z `CLAUDE.md`: najwyżej dwie naraz we wszystkich liniach; jeśli w tym czasie trwa SWA w `prokom-web-software`, FUND-W czeka).
- **Razem ok. 8–10 wieczorów** do produkcji Instalacji, plus czas szefa na staging. Przy 3–4 sesjach w tygodniu: staging ok. 13–15.11, produkcja ok. 25–30.11 (termin zależy od akceptacji szefa i zdjęć).
- **Bez cięć:** L2-I, P0-3, kontrast (P1-4), wyszukiwarka na telefonie, staging z odbiorem, strony prawne. **Kolejność cięcia, gdy brakuje czasu:** V5-D (§11) → V5-C §8 Pełna oferta → V5-C §5 Na Podhalu → hero §1.5 wiązki. Te rzeczy mogą wejść po produkcji (adresy się nie zmieniają).

---

## 3. Sesje

### KROK 0 — scalenie PR-ów (Krystian, 15–20 minut)
1. #341 → Squash and merge (CI zielone).
2. #343 → „Edit” → baza `develop` → poczekaj na pełne CI → scal.
3. #348 → `git fetch && git rebase origin/develop` na `inst/l1-szukaj` (albo „Update branch” w GitHubie) → CI. Jeśli e2e 6/6 nadal czerwone w `/_wspolne` — to sprawa fundamentu, nie Instalacji: zgłoś w FUND-W (pkt 0).
4. #349 → baza `develop` (GitHub zmieni ją sam po usunięciu gałęzi #348) → pełne CI → scal.
5. Usuń zbędną gałąź `origin/inst/wsp-v5` (audyt P3-26).

**Sprawdź:** `develop` ma `src/sites/instalacje/powloka/InstHeader.tsx` i `src/components/shared/ContactPage*` (albo odpowiednik z D2-4).

### FUND-W — poprawki wspólne po galerii i L1-I (folder `prokom-web`)
- **Cel:** zamknąć braki we wspólnych komponentach, które wyszły przy wpinaniu Instalacji. Dotyczą wszystkich linii, dlatego nie robi tego sesja Instalacji (zasada ADR-022: linia nie zmienia `src/components/shared/`).
- **Warunek:** KROK 0 zrobiony (D2-4 na `develop`).
- **PR-y (małe, `feat/wsp-*`, każdy z testem):**
  0. (tylko jeśli CI #348 po rebase dalej czerwone) `fix/wsp-e2e-szukaj` — e2e `/_wspolne` zgodne z `SearchDialog` (etykiety chipów `aria-label` vs widoczny `action.short`, `wspolne-stopka`).
  1. **`feat/wsp-szukaj-telefon` (bez cięć):** do 1080 px kapsuła chowa `.cap__extras` (lupa, motyw), a komentarz w `wspolne.css` obiecuje, że lupa przechodzi do arkusza — `MenuSheet` jej nie ma. Dodać przycisk „Szukaj” w `MenuSheet` (na górze arkusza, pełna szerokość, wygląd pola wyszukiwania; klik zamyka arkusz i woła `requestSearch()`) **albo** ikonę lupy w kapsule na telefonie obok „Menu”. Rekomendacja: przycisk w arkuszu + lupa w kapsule tylko gdy linia poda `searchInCapsule` (Biznes ma lupę w nagłówku telefonu wg L1). Decyzja w planie sesji. e2e: 390 px → Menu → Szukaj → okno wyszukiwania z fokusem w polu; Esc wraca do strony.
     **Decyzja (08.11, sesja FUND-W):** przycisk w arkuszu (prop `search` w `MenuSheet`), bez `searchInCapsule` — żadna linia nie ma dziś lupy w kapsule telefonu, Biznes przeszedł z własnego `SheetSearch` na wspólny przycisk. Software ma własne menu telefonu z polem wyszukiwania (nie dotyczy).
  2. `feat/wsp-stopka-szyna`: treść stopki przy 1400–1535 px nachodzi na szynę — przenieść odsunięcie `padding-left: calc(32px + var(--rail-offset, 0px))` z `src/sites/instalacje/instalacje.css` do `wspolne.css` dla wszystkich linii (Instalacje potem usuwają swoją regułę w INST-2 PR2). Zrzut 1440 i 1536 dla trzech linii.
  3. `fix/wsp-ikony-seed`: w `src/seed/shared/biznes.ts` (`tabBar.center.icon: 'list'`) i `software.ts` (`'wand'`) ikony spoza `ICON_NAMES` → szyna pokazuje „dokument”. Podmiana na istniejące nazwy (np. `doc`/`grid`, decyzja z planszami) + test jak `shared.test.ts` dla Instalacji. Na stagingu — to samo w panelu (lista w PR).
  4. `docs/wsp-reveal`: komentarz w `src/components/motion/RevealObserver.tsx` („placed in each line's frame”) nieprawdziwy dla Instalacji — poprawić opis.
- **Poza zakresem:** usunięcie pól WhatsApp z bazy (decyzja D1, osobno); generator obrazów OG (pomysł na później, §6 D6).
- **DoD:** lint, typecheck, test, e2e `/_wspolne` + trzy linie na 390/1440; CI zielone; `docs/STAN.md` (sekcja fundamentu).

### INST-2 — domknięcie przed stagingiem (folder `prokom-instal`, gałęzie `inst/*`)
- **Cel:** szef na stagingu widzi stronę bez rzeczy niegotowych, bez starego Kontaktu i O firmie, z poprawnym kontrastem i hero, które spełnia dostępność.
- **Warunek:** KROK 0 zrobiony. PR1 wymaga D2-4 na `develop`. PR2–PR4 mogą ruszyć od razu (od `origin/develop`), kolejność w planie sesji.
- **Zasady sesji:** jeden plan całości na start (maks. 15 linii, potem kod — prompt jest kompletny). PR-y piętrowo tylko tam, gdzie zależą od siebie; strefa wspólna (`tokens-instalacje.css`, migracje, `src/lib/tenant`, kolekcje) tylko w osobnym małym PR `inst/wsp-*` (ADR-I001 §3). Każda sekcja z UI: `docs/design/prokominstalacje/narzedzia/porownaj.mjs` w 1440 i 390, jasny i ciemny, przed PR; galeria 06.11 = „przed”.

**PR1 `inst/l2-kontakt-ofirmie` — L2-I (kroki L2 z `docs/zadania/wspolne-elementy.md` §3, wariant Instalacji)**
1. `/kontakt` → wspólny szablon Kontaktu z danymi `shared.contact`; `/o-firmie` → szablon O firmie z `shared.about`. Treści linii, które dziś są w `blocks/InstContact`, `blocks/InstAbout`, `dane/kontakt.ts`, `dane/oFirmie.ts`, przenieść do pól `shared` (seed linii + lista do panelu stagingu).
2. Sekcje własne Instalacji w slotach szablonu (MAPA-DZIS „Dodatki linii”):
   - mapa stref z wyszukiwarką miejscowości → wspólny `ServiceAreaMap` + `serviceZones` (bez własnej kopii);
   - drugi salon (Zakopane) w `heroAside` — **tylko gdy `CompanyData.locations[].published`** (dziś nieopublikowany, więc niewidoczny);
   - „Zgłoś awarię” (`/serwis#zglos`) w `routes` albo `afterRoutes` (rekomendacja: `routes`, drugi kanał po „Zaplanuj instalację”);
   - odnośnik do `/dla-architektow` (karta w `afterRoutes`);
   - O firmie: „Ponad 20 lat na Podhalu” w `afterStats` tylko z treści potwierdzonych (bez osi czasu ze znacznikami `[SZEF]`); mapa SVG z hero — usunąć (mapa jest w sekcji szablonu); bez zdjęć ludzi.
3. Pas CTA (`CtaBand`) na `/kontakt`: **usunąć z tej strony** (szablon kończy się FAQ, CTA dubluje hero; MAPA-DZIS) — na innych stronach zostaje. Wspólna stopka na `/kontakt` nie może powtarzać kolumny kontaktu pod sekcją kontaktu (uwaga z L1-I) — sprawdzić po wpięciu szablonu; jeśli powtarza, zgłosić jako `feat/wsp-*` zamiast łatać CSS-em linii.
4. Formularz „Zaplanuj” (`/zaplanuj`, kreator) i mini-formularz głównej: wspólne `ConsentField`, walidacja kontaktu i `SuccessPanel` z D2-3 — **układ formularzy bez zmian**.
5. Opiekun architektów na `/dla-architektow`: usunąć zdjęcie (`InstalacjeSettings.architects.photo` z UI) i sylwetkę SVG w `blocks/InstArchitects/Component.tsx` — imię i rola zostają (zasada 01.11 „bez zdjęć ludzi”). Samo pole w bazie zostaje do decyzji D1 (usunięcie = migracja usuwająca dane).
6. Usuń stare komponenty Kontaktu/O firmie linii (najpierw `grep`, czy nic innego ich nie używa), `SiteSettings.footer.links` przestaje być używane (wspólna stopka bierze linki prawne z `CompanyData.legal`) — w seedzie przestać je zapisywać.
7. JSON-LD `LocalBusiness` + `BreadcrumbList` na obu stronach, unikalne H1 i lead z danych linii.
- **DoD PR1:** zrzuty 1440/390 jasny/ciemny vs plansze Kontakt i O firmie (wariant Instalacji) i galeria 06.11; e2e formularza Kontaktu (błędy, sukces z numerem, rekord w `Inquiries` z tenantem Instalacji i tematem) + kreator `/zaplanuj` przechodzi na `/wyslane`; brak `<img>` portretów (test); Lighthouse mobile ≥ 90 dla `/kontakt` i `/o-firmie`; axe 0; `/przeglad` (formularze, dostęp).

**PR2 `inst/audyt-tresci-jakosc` — treści i jakość z audytu 06.11**
1. **P0-3 (bez cięć):** `/dla-architektow` — trzy karty biblioteki „W przygotowaniu” (Symbole DWG/PDF, Opisy DOCX, Wytyczne rack; `dane/architekci.ts` ~w. 1042–1056) **ukryć** (filtr po statusie, dane zostają do czasu plików) oraz karta 896. Checklista PDF: jeśli w repo nie ma pliku w `public/instalacje/` — formularz „Wyślij PDF” zostaje (zapis e-mailem, wysyłka ręczna), ale tekst mówi „Wyślemy checklistę mailem w ciągu 1 dnia roboczego”, nie „pobierz”. Decyzja D2 może to zmienić.
2. **P1-7 (część w kodzie):** daty „stan na październik 2026” są dziś wpisane w zdania w kilku plikach: `dane/teletechnika.ts:177` („nowego do października 2026 nie ogłoszono”), `dane/architekci.ts:664, 882, 962` (+ `lawAsOf` w `blocks/InstArchitects/Component.tsx:413`), `dane/anteny.ts:123, 126`, `dane/smartHome.ts:366`. Jedna stała daty stanu w `dane/` (np. `STAN_FAKTOW`) używana we wszystkich tych miejscach, zdania przepisane tak, żeby nie kłamały po miesiącu („Stan na {data}. Sprawdzamy przy każdym projekcie.”); test, że żaden tekst Instalacji nie zawiera twardego „październik 2026”. Treść przepisów sprawdza czat przed produkcją (§5) i wtedy zmienia się tylko stała.
3. **P1-9 (część w kodzie):** karty realizacji — `sizes` w `next/image` tak, żeby karta 415 px dostawała wariant ≥ 828 px na ekranach 2×; zdjęcie 16:9 w karcie 4:3 — `object-fit: cover` z punktem ostrości z danych (jeśli brak pola — środek); zdjęcie kartonu mikrofonów (`2/20170125_133515`) wyłączyć z galerii w seedzie (lista dla panelu stagingu).
4. **P2-14:** przekrój architektów, widok „Wszystkie instalacje” — numery punktów nie zasłaniają nazw pokoi (przesunięcie etykiet albo numerów; zrzut 1440 i 390).
5. **P2-16:** w ciemnym pasie CTA pole „Salon: Rabka-Zdrój…” nie może wyglądać jak wyłączone pole formularza (tekst + ikona pinezki zamiast ramki pola); newsletter architektów — przycisk pod zgodami, nie nad nimi.
6. **P2-18:** galeria realizacji — czytnik ekranu słyszy opis zdjęcia (`alt` z panelu) + „2 z 17”, nie samo „2 / 17”.
7. **P2-21:** `/dla-kogo/szkoly` na telefonie — CLS 0,27 po przewinięciu (leniwy widżet): zarezerwować wysokość; test CLS w e2e telefonu dla tej strony.
8. **P3-23:** tytuły SEO > 60 znaków (`/`, `/alarmy`, `/dla-kogo/firmy`, `/dla-architektow`, `/dla-kogo/koscioly`, `/dla-kogo/budowy`) — krótsze wersje w seedzie (`lib/instalacje/seo.ts` / paczka), lista do panelu stagingu w PR.
9. **P3-25:** `/serwis` — kolejność nagłówków (`#sv-sys`); `/dla-architektow` — link w tekście `.mut > a` podkreślony (WCAG 1.4.1).
10. **P3-24 (sprawdzenie):** axe `region` i `landmark-unique` miały zniknąć z nową powłoką — potwierdzić na 35 stronach (`docs/design/prokominstalacje/narzedzia/`, axe), resztę poprawić.
11. Po FUND-W PR2 (jeśli scalony): usunąć z `instalacje.css` własne odsunięcie stopki od szyny.
12. Test treści (e2e lub Vitest na danych): na żadnej stronie Instalacji nie ma słów „WhatsApp”, „wa.me”, „W przygotowaniu”, „wyślij zdjęcia”, „prześlij rzuty”, „[SZEF”, „przykładowe”.
- **DoD PR2:** zrzuty zmienionych sekcji; e2e `strony` 35/35; Lighthouse ≥ 90 dla `/dla-architektow` i `/dla-kogo/szkoly` (telefon); bez recenzenta, jeśli diff < 100 linii logiki, inaczej `/przeglad`.

**PR3 `inst/wsp-kontrast-marki` (strefa wspólna, mały) + `inst/marki-kontrast` (linia)**
1. **P1-4 (bez cięć):** w `src/styles/tokens-instalacje.css` ciemniejsze warianty tekstu kolorów usług dla jasnego motywu (`--h-*-text` albo odpowiednik) tak, żeby nadtytuły `.eye`, `.sgwho`, chipy `.sgchip` i wyróżnienia `em` w scenach miały ≥ 4,5:1 na `#f4f5f1` i `#fdf2df` (dziś 1,8–4,3:1, 229 elementów na 24 stronach). Kolor tła/ikon usług bez zmian — zmienia się tylko kolor **tekstu**. Ciemny motyw: 11 elementów — to samo. Test kontrastu obok tokenów (wzór: istniejące testy `src/styles/*.test.ts`) dla każdej pary tekst/tło.
2. **P1-6:** pas „Marki, z którymi pracujemy” — logo za małe (11 kolumn → Hikvision ~10 px wysokości; spec RUNDA-V5 §2: 30–34 px), Ubiquiti przycięte. Układ: 2 rzędy × 6 na desktopie albo kafel stałej szerokości z przewijaniem; tokeny kafla (`--inst-brand-tile*`) w PR strefy wspólnej, układ w `sekcje/glowna/ServicesGrid.tsx` / `glowna-sekcje.css` w PR linii.
- **DoD PR3:** axe kontrast 0 na 35 stronach w obu motywach (raport w PR: przed 229/11 → po 0/0); zrzut pasa marek 1440/1024/390.

**PR4 `inst/hero-dostepnosc` — hero strony głównej**
1. **P2-11:** przycisk „Pauza / Wznów” autoodtwarzania (WCAG 2.2.2) w doku hero, widoczny focus; pasek postępu zatrzymuje się razem z pauzą (dziś CSS `transition` jedzie dalej); podgląd kamery w trybie compact zamyka się Esc; przy powiększeniu czcionki 200% tekst hero się nie ucina (zamiast stałej wysokości z `overflow: hidden` — `min-block-size`).
2. **P2-12:** hero na telefonie — najpierw H1, lead i przyciski (pierwszy ekran 390×844), scena pod spodem; hero ≤ ok. 1,3 ekranu zamiast 2,5.
3. **RUNDA-V5 nieodhaczone (P2-20):** §1.3 przyciemnienie tła pod tekstem hero (gradient z tokenów, kontrast tekstu ≥ 4,5:1 przy każdej porze dnia), §1.5 wiązki kamer `clip-path`. §2 „lista marek z panelu” — tylko po decyzji D3 (migracja), inaczej zostaje lista w kodzie.
- **DoD PR4:** e2e `hero-uklad` 6 rozmiarów zielone + nowy test pauzy (klik → pasek i scena stoją, `aria-pressed`); reduced motion: nic się nie rusza; Lighthouse `/` mobile ≥ 90; `/przeglad` (dostępność).

**PR5 `inst/wsp-bez-whatsapp` — tylko po decyzji D1 (migracja usuwająca dane)**
- Resztki z L1-I: `lib/instalacje/data.ts` pobiera `whatsapp`; `/wyslane?kontakt=whatsapp` ma tekst (`dane/wyslane.ts`); schemat zapytania przyjmuje `via=1` (WhatsApp) — usunąć z kodu Instalacji (bez migracji, w PR2, jeśli D1 = „zostawiamy pole”). Jeśli D1 = „usuwamy”: migracja usuwająca `InstalacjeSettings.whatsapp` (+ wspólne pola z MAPA-DZIS: `SiteSettings.biznes.whatsapp`, `preferredContact: 'whatsapp'`, `toWhatsAppHref`) w PR fundamentu `feat/wsp-bez-whatsapp`, nie w linii — skoordynować z Biznesem.

- **Na koniec INST-2:** `/inst-koniec` → STAN: lista do panelu stagingu (wszystkie PR-y), następny krok = INST-3.

### INST-3 — staging i odbiór (folder `prokom-instal` + panel stagingu)
- **Cel:** Instalacje na stagingu (`staging.prokominstalacje.pl`, hasło, `noindex`) w stanie do pokazania szefowi, zmierzone na prawdziwych telefonach.
- **Warunek:** INST-2 PR1–PR4 i FUND-W PR1 scalone (pipeline S10b wdraża `develop` na staging).
- **Zakres (Claude Code):**
  1. Lista do panelu stagingu (seed tam nie działa) zebrana w jeden plik `docs/stan/staging-instalacje.md` z punktów STAN (INST-1, L1-I, INST-2): grupa `shared` (ikony szyny `grid`, `compass`, `star`, `mountain`, `q`, `cal`), `footer.text`, hero „Twój inteligentny obiekt”, zdjęcia realizacji i Nowych rozwiązań, SEO tytułów, FAQ budów, H1 `/realizacje`, polityka prywatności bez „linku do rzutów”, `InstalacjeSettings.whatsapp` pusty. Format: checklista do odhaczenia (Krystian robi w panelu, ok. 30–45 minut).
  2. Smoke stagingu: `bash scripts/smoke.sh <adres> staging.prokominstalacje.pl` (składnia: `scripts/smoke.sh <base-url> [site-host …]`, `docs/wdrozenia.md`) + 35 adresów 200, `sitemap.xml`, `robots.txt` (na stagingu `Disallow`), `/llms.txt`, 404 linii.
  3. Pomiary na stagingu: Lighthouse mobile ≥ 90 i CLS 0 dla `/`, `/monitoring`, `/dla-architektow`, `/zaplanuj`, `/kontakt`, `/dla-kogo/pensjonaty`, `/ladowarki-ev`; **P1-8 LCP** (CI 42140299033: `/` 2,8 s, `/ladowarki-ev` 3,3 s; budżet 2,5 s) — sprawdzić TTFB (`Cache-Control` stron), preload kroju display, priorytet obrazu LCP; poprawki w PR `inst/staging-wydajnosc` (zmiany cache/ISR w `lib/cache.ts` = strefa wspólna → `inst/wsp-*`).
  4. Rich Results Test (JSON-LD: Organization, LocalBusiness, Service, FAQPage, BreadcrumbList) — wyniki w PR.
  5. Formularze na stagingu: Kontakt, kreator `/zaplanuj`, mini-formularz głównej, 3 formularze architektów, przedmiar Teletechniki, zgłoszenie serwisu — potwierdzenie przychodzi od `kontakt@prokominstalacje.pl`, powiadomienie trafia do skrzynki linii (S10d działa od 2.11), rekord w panelu z tenantem.
  6. Umami: wpis `instalacje=<id>` w `UMAMI_WEBSITES` (Krystian, `.env` serwera) → zdarzenia `kreator_*`, `kontakt_wyslij`, `pasek_klik`, `menu_otworz` widoczne.
- **Zakres (Krystian, z telefonem):** Android + iPhone wg `MOBILE-APLIKACJA.md` §10: hero, pasek aplikacji, arkusz Menu z „Szukaj”, galeria realizacji (przesuwanie palcem), kreator z klawiaturą, ciemny motyw. Uwagi → lista do czatu.
- **Szef:** link do stagingu + 5 rzeczy do sprawdzenia (główna, usługa, Dla kogo, architekci, Kontakt) + lista pytań z §5. Uwagi szefa → czat → zakres INST-4.
- **DoD:** wszystkie punkty listy panelu odhaczone; Lighthouse/CLS w tabeli w STAN; formularze sprawdzone; zadanie w Asanie „SZEF · Przegląd stagingu prokominstalacje.pl” utworzone (po zgodzie Krystiana).

### INST-4 — runda v5 cz. 2 + uwagi szefa (folder `prokom-instal`)
- **Cel:** podnieść poziom sekcji, które działają, ale nie są jeszcze „premium”, i wnieść uwagi szefa ze stagingu.
- **Warunek:** INST-3 zrobione, uwagi szefa spisane w czacie (dopisek do tego planu albo `RUNDA-V5.md`).
- **PR-y:**
  1. `inst/v5c-podhale-proces` — RUNDA-V5 §5 „Na Podhalu instalacja ma trudniej” (pasmo gór w 3 planach, scroll-driven bez JS z fallbackiem statycznym, karty-sceny 3+3, śnieg tylko w widoku i bez reduced motion) i §6 „Jak pracujemy” (oś rysowana przy przewijaniu, „Co dostajesz” przy każdym kroku, telefon pionowo).
  2. `inst/v5c-oferta` — §8 Pełna oferta `/uslugi` (wyszukiwarka 60 px z podpowiedziami, przyklejone filtry, nawigacja obszarów, karty z przenikaniem, pusty wynik → `/zaplanuj` z frazą w opisie, telefon: filtry w arkuszu).
  3. `inst/v5c-teletechnika` — §10 treść Teletechniki jako dane w `dane/teletechnika.ts`, `TODO(krystian)` przy każdym zdaniu z normą; realizacja Blachotrapez ze zdjęciami.
  4. `inst/v5d-podstrony` — §11 bez punktów O firmie i Kontakt (te strony są od INST-2 na wspólnych szablonach — zmiany tylko w slotach linii): realizacje ze zdjęciami na stronach usług i obiektów, „Doba w …” z osią godzin, Serwis 3 karty planów, 404 jako karty + wyszukiwarka, Ładowarki przenikanie zdjęć; **P2-15** „Pokaż na żywo” na wszystkich 14 kartach Dla kogo albo na żadnej.
  5. `inst/tresci-seo` — **P2-19** powtórzenia (blok „Gwarancja / Odpowiadamy szybko / Masz już instalację” na 15 stronach, „Do 24 h odpowiadamy…” 15×, FAQ „Wyślij zdjęcie…” 15×) → warianty per usługa z czatu (`docs/tresci/prokominstalacje-warianty.md`); **P2-22** Poradnik +4 wpisy (treści z czatu, kategorie z ilustracjami).
  6. Uwagi szefa ze stagingu — osobny PR albo dopisane do pasujących PR-ów wyżej.
- **Kolejność cięcia:** PR4 → PR2 → PR1 §5; PR5 i uwagi szefa bez cięć.
- **DoD:** jak w `RUNDA-V5.md` (ruch tylko transform/opacity/filter/clip-path, reduced motion), `porownaj.mjs` 1440/390 obu motywów, Lighthouse ≥ 90, e2e zmienionych stron.

### PROD — produkcja (folder `prokom-instal` + serwer przez pipeline)
- **Warunek (wszystko odhaczone):** akceptacja szefa w Asanie; strony prawne zaakceptowane (szkice z I13 — `src/seed/instalacje/legal.ts`); przepisy na `/dla-architektow` i liczby „Dla kogo” zweryfikowane ze źródłami w `docs/tresci/` (P1-7); licencje zdjęć producentów potwierdzone u dystrybutorów (P1-10); obraz OG ustawiony (P1-5); zdjęcia realizacji (oryginały, 2–3 realizacje monitoringu — P1-9) albo świadoma decyzja „startujemy z obecnymi”; kopia bazy przed wdrożeniem.
- **Zakres:** `/wdrozenie produkcja` (checklista `docs/wdrozenia.md`) → Nginx `server_name prokominstalacje.pl` i `www` (PR wspólny, jeśli jeszcze nie ma) → certyfikat → dane produkcji w panelu (lista z INST-3 jeszcze raz) → tenant `published=true` → smoke → Search Console (domena, sitemap), Bing Webmaster, Profil Firmy w Google → link do strony → 301 ze starych adresów pro-kom.eu (`docs/tresci/prokominstalacje-301.md`, na obecnym serwerze pro-kom.eu do czasu huba) → Better Stack monitor produkcji Instalacji → wpis w STAN i Asanie.
- **Nie robić bez zgody Krystiana:** migracji na serwerze, ręcznego wdrożenia, zmian DNS (najpierw `docs/dns.md`, potem dostawca).

---

## 4. Prompty (kopiuj w całości)

### FUND-W
```
/zadanie FUND-W — poprawki wspólne po L1-I i galerii Instalacji (folder prokom-web, gałęzie feat/wsp-*, od origin/develop)
Przeczytaj: docs/zadania/prokominstalacje-domkniecie.md §3 „FUND-W”, docs/STAN.md (fundament), docs/stan/STAN-instalacje.md (wpisy L1-I z 06.11: „Uwaga dla D3-B / D3-S i fundamentu”), docs/design/wspolne/WSPOLNE-ELEMENTY.md §5 (szyna, wyszukiwarka) i plansza 06 (arkusz Menu).
Warunek: develop zawiera D2-4 (#343) i L1-I (#348, #349). Sprawdź CI #348 po rebase — jeśli e2e /_wspolne dalej czerwone, PR 0 z planu.
PR-y (każdy mały, z testem, osobno do develop): (1) feat/wsp-szukaj-telefon — wejście do SearchDialog na ≤ 1080 px (przycisk „Szukaj” w MenuSheet; lupa w kapsule telefonu tylko na życzenie linii) + e2e 390 px na trzech liniach; (2) feat/wsp-stopka-szyna — odsunięcie treści stopki od szyny (--rail-offset) w wspolne.css dla wszystkich linii, zrzuty 1440/1536; (3) fix/wsp-ikony-seed — ikony tabBar.center 'list' (Biznes) i 'wand' (Software) → nazwy z ICON_NAMES + test; (4) docs/wsp-reveal — komentarz RevealObserver.
Bez usuwania pól WhatsApp z bazy (decyzja Krystiana, osobno). Plan maks. 15 linii, potem kod. Po każdym PR: /przeglad (PR 1), /koniec-sesji, /pr.
DoD: lint, typecheck, test, e2e /_wspolne + 3 linie 390/1440; CI zielone; docs/STAN.md.
```

### INST-2
```
/zadanie INST-2 — domknięcie przed stagingiem (folder prokom-instal, gałęzie inst/*, od origin/develop)
Najpierw /inst-start. Przeczytaj: docs/zadania/prokominstalacje-domkniecie.md (cały, §3 „INST-2” to zakres), docs/stan/STAN-instalacje.md „W toku”, docs/audyty/prokominstalacje-audyt-0611.md, docs/zadania/wspolne-elementy.md §3 (L2, wariant Instalacji), docs/design/wspolne/MAPA-DZIS.md (wiersze Instalacji, „Dodatki linii”), plansze Kontakt i O firmie (wariant Instalacji), RUNDA-V5.md §1–§2.
Warunek: develop zawiera D2-3 (#341), D2-4 (#343) i L1-I (#348, #349). Jeśli D2-4 nie jest scalone — zacznij od PR2–PR4, PR1 na końcu.
PR-y wg planu: PR1 inst/l2-kontakt-ofirmie (L2-I), PR2 inst/audyt-tresci-jakosc (P0-3, P1-7 tekst, P1-9 sizes, P2-14, P2-16, P2-18, P2-21, P3-23, P3-25, sprawdzenie P3-24, test treści), PR3 inst/wsp-kontrast-marki (strefa wspólna: tokeny + test kontrastu) + inst/marki-kontrast (pas marek), PR4 inst/hero-dostepnosc (P2-11, P2-12, RUNDA-V5 §1.3 i §1.5). PR5 tylko po decyzji D1 — zapytaj, jeśli nie ma jej w STAN.
Zasady: strefa wspólna tylko w małych PR-ach inst/wsp-*; nie zmieniasz src/components/shared/ ani src/lib/shared/ — brakuje czegoś wspólnego → zatrzymaj się i zaproponuj feat/wsp-*. Bez WhatsAppa, bez zdjęć ludzi, dane kontaktowe tylko z panelu, zero cen sprzętu, „24 h” tylko jako odpowiedź na zgłoszenie, gwarancja 24 mies. na montaż.
Każda sekcja z UI: docs/design/prokominstalacje/narzedzia/porownaj.mjs 1440 i 390, jasny i ciemny, przed PR. Plan całości maks. 15 linii, potem kod (prompt jest kompletny; pytaj tylko o decyzje D1–D6 z planu, jeśli STAN ich nie rozstrzyga).
Po każdym PR: /przeglad (PR1, PR3, PR4 obowiązkowo), /inst-koniec, /pr. Kolejne wieczory: „/zadanie INST-2 — kontynuacja wg STAN”.
DoD: DoD każdego PR z planu; e2e strony 35/35, telefon, shell; Lighthouse mobile ≥ 90 dla zmienionych stron; axe 0 (także kontrast w obu motywach); CI zielone; STAN z listą do panelu stagingu.
```

### INST-3
```
/zadanie INST-3 — staging i odbiór prokominstalacje.pl (folder prokom-instal)
Najpierw /inst-start. Przeczytaj: docs/zadania/prokominstalacje-domkniecie.md §3 „INST-3”, docs/stan/STAN-instalacje.md (wszystkie „Na stagingu po …”), docs/wdrozenia.md, docs/audyty/prokominstalacje-audyt-przed-stagingiem.md §4–§6, MOBILE-APLIKACJA.md §10.
Warunek: INST-2 PR1–PR4 i FUND-W PR1 scalone, pipeline wdrożył develop na staging.
Zakres: (1) docs/stan/staging-instalacje.md — jedna checklista panelu stagingu ze wszystkich wpisów STAN; (2) smoke stagingu (scripts/smoke.sh, 35 adresów, sitemap, robots, llms.txt, 404); (3) Lighthouse mobile i CLS dla 7 stron z planu na stagingu + diagnoza LCP (TTFB, cache, preload kroju, obraz LCP) i poprawki w osobnym PR (cache = strefa wspólna → inst/wsp-*); (4) Rich Results Test; (5) formularze na stagingu (lista z planu) — potwierdzenia od kontakt@prokominstalacje.pl, rekordy w panelu; (6) instrukcja Umami dla Krystiana.
Nie uruchamiaj migracji na serwerze i nie wdrażaj ręcznie. Wyniki: tabela w STAN (strona × Lighthouse × CLS × LCP) i lista rzeczy dla szefa.
DoD: checklista panelu gotowa do odhaczenia, smoke zielony, pomiary w STAN, PR wydajności (jeśli potrzebny) z CI zielonym.
```

### INST-4
```
/zadanie INST-4 — runda v5 cz. 2 i uwagi szefa (folder prokom-instal, gałęzie inst/*, od origin/develop)
Najpierw /inst-start. Przeczytaj: docs/zadania/prokominstalacje-domkniecie.md §3 „INST-4”, docs/design/prokominstalacje/RUNDA-V5.md §5, §6, §8, §10, §11 (ma pierwszeństwo przed prototypem), uwagi szefa ze stagingu (dopisek w planie albo STAN), docs/tresci/ (warianty bloków, wpisy Poradnika).
PR-y wg planu: inst/v5c-podhale-proces, inst/v5c-oferta, inst/v5c-teletechnika, inst/v5d-podstrony (bez zmian w O firmie i Kontakcie poza slotami linii), inst/tresci-seo, uwagi szefa. Kolejność cięcia z planu.
Ruch tylko transform/opacity/filter/clip-path, scroll-driven z fallbackiem statycznym, reduced motion = nic się nie przesuwa, kolory z tokenów. Każda sekcja: porownaj.mjs 1440/390, oba motywy, zrzuty przed/po w PR.
Po każdym PR: /przeglad przy logice, /inst-koniec, /pr. Kolejne wieczory: „/zadanie INST-4 — kontynuacja wg STAN”.
DoD: jak w RUNDA-V5 i w planie; Lighthouse ≥ 90 i CLS 0 zmienionych stron; CI zielone; STAN.
```

### PROD
```
/wdrozenie produkcja — prokominstalacje.pl
Przeczytaj: docs/zadania/prokominstalacje-domkniecie.md §3 „PROD” (warunki), docs/wdrozenia.md, docs/dns.md, docs/runbook.md, docs/tresci/prokominstalacje-301.md, docs/stan/staging-instalacje.md.
Najpierw sprawdź i wypisz każdy warunek z planu (akceptacja szefa w Asanie, strony prawne, przepisy, licencje zdjęć, OG, zdjęcia realizacji, kopia bazy) — jeśli któryś nieodhaczony, zatrzymaj się.
Potem checklista: Nginx server_name prokominstalacje.pl i www (PR wspólny, jeśli brak), certyfikat, wdrożenie tylko przez pipeline, dane produkcji w panelu wg checklisty, tenant published=true, smoke, Search Console + sitemap, Bing, Profil Firmy w Google, 301 ze starych adresów pro-kom.eu, monitor Better Stack, wpis w STAN i Asanie.
Bez migracji na serwerze, bez ręcznego wdrożenia i bez zmian DNS bez mojej zgody.
```

---

## 5. Poza Claude Code (Krystian, szef, czat)

| Kto | Co | Do kiedy |
|---|---|---|
| Krystian | KROK 0 — scalenie #341 → #343 → #348 → #349, usunięcie `origin/inst/wsp-v5` | przed FUND-W i INST-2 |
| Krystian | decyzje D1–D6 (§6) — wpis w STAN albo odpowiedź w czacie | przed INST-2 PR2 |
| Krystian | panel stagingu wg `docs/stan/staging-instalacje.md` (ok. 30–45 min) | w INST-3 |
| Krystian | test na Androidzie i iPhonie (MOBILE §10), `UMAMI_WEBSITES` na serwerze | w INST-3 |
| szef | przegląd stagingu (5 stron), uwagi | po INST-3 |
| szef | **zdjęcia realizacji**: oryginały (dziś 600×337 z pro-kom.eu) + 2–3 realizacje monitoringu/alarmów (główna usługa linii nie ma ani jednego zdjęcia), zdjęcie Empiku | przed PROD (albo decyzja „startujemy bez”) |
| szef | pytania otwarte: wynajem monitoringu na budowę (FAQ 08 budów), agencja ochrony (FAQ 07 budów, alarmy), autoryzacja Ampio i Satel, salon Zakopane (adres, godziny → `published`) | przed INST-4 |
| szef / prawnik | akceptacja polityki prywatności, cookies, deklaracji dostępności (szkice z I13); `consentMode` | przed PROD |
| Krystian | licencje zdjęć producentów (Nowe rozwiązania): Ampio, Hikvision, Ubiquiti przez hurtownię, KEF/Sonos/Samsung/Epson/Nuki/Ajax — zgoda albo zdjęcia z pakietów partnerskich | przed PROD |
| czat | weryfikacja przepisów i liczb (P1-7): WT 2002 i okres przejściowy, czujki dymu w pensjonatach (rozporządzenie MSWiA — „w każdym pokoju” czy „co najmniej jedna”), Wi-Fi hotele 15.03.2027, liczby „Dla kogo” (Zakopane 6 031 miejsc, zalania ~60%, kradzieże ~320 tys., deweloperzy 64,2%, szkoły 20,5 tys., mieszkania 321/849) → `docs/strony/prokominstalacje-architekci-zrodla.md` (istniejący plik źródeł) + nowy `docs/tresci/prokominstalacje-zrodla.md` dla liczb „Dla kogo” | przed PROD |
| czat | obraz OG 1200×630 dla Instalacji (projekt w marce) → Krystian wgrywa w `SiteSettings.seo.ogImage` | przed PROD |
| czat | warianty bloków powtarzanych na 15 stronach (P2-19) i 4 wpisy Poradnika (P2-22) | przed INST-4 PR5 |
| Krystian | Asana: zadanie „SZEF · Przegląd stagingu prokominstalacje.pl” i „SZEF · Akceptacja produkcji prokominstalacje.pl” (po zgodzie w czacie) | INST-3 / przed PROD |

---

## 6. Decyzje do podjęcia (Krystian)

| # | Decyzja | Opcje | Rekomendacja |
|---|---|---|---|
| D1 | Pola WhatsApp w bazie (`InstalacjeSettings.whatsapp`, `SiteSettings.biznes.whatsapp`, `preferredContact: 'whatsapp'`) | A: zostają puste i nieużywane (zero ryzyka, odrobina martwego kodu) · B: migracja usuwająca dane w PR fundamentu `feat/wsp-bez-whatsapp`, razem z Biznesem | **A teraz, B po produkcji obu linii** — usunięcie danych to jedyna nieodwracalna zmiana w planie, a nic nie zyskujemy przed produkcją. W kodzie Instalacji usuwamy odczyt i `via=1` już w INST-2 PR2. |
| D2 | Checklista projektanta PDF (`/dla-architektow`) | A: formularz zostaje, wysyłka ręczna mailem w 1 dzień roboczy · B: czat przygotowuje PDF, plik w repo, wysyłka automatyczna w mailu potwierdzenia · C: ukryć do czasu pliku | **B** (treść jest w planie od I16b, PDF to ok. 1 godzina czatu) — do tego czasu A. |
| D3 | Lista marek w pasie „Marki” z panelu (RUNDA-V5 §2) | A: zostaje w kodzie (zmiana = PR) · B: pole w `InstalacjeSettings` + migracja (strefa wspólna) | **A** — marki zmieniają się rzadko, migracja przed stagingiem to zbędne ryzyko. |
| D4 | „Zgłoś awarię” na `/kontakt` | `routes` (drugi kanał) · `afterRoutes` (karta pod kanałami) | **`routes`** — awaria to drugi najczęstszy powód kontaktu po wycenie. |
| D5 | Pas CTA na `/kontakt` | usunąć · zostawić w `beforeFaq` | **usunąć** (dubluje hero szablonu; MAPA-DZIS). |
| D6 | Obraz OG | A: jeden obraz linii w panelu (minimum, bez kodu) · B: generator `opengraph-image` per strona (zmiana wspólna, wszystkie linie) | **A przed produkcją**, B jako pomysł na później (`docs/STAN.md` → „Pomysły”). |

---

## 7. Ryzyka

- **Piętrowe PR-y fundamentu (#341 → #343) blokują L2-I.** Jeśli D2-4 utknie, INST-2 robi PR2–PR4, a staging rusza ze starym Kontaktem/O firmie oczyszczonym w L1-I (plan v3 elementów wspólnych dopuszcza to wyjście). L2-I wtedy po stagingu.
- **CI #348 czerwone przez testy `/_wspolne`.** #341 zmienia `SearchDialog` i te testy (CI #341 zielone) — po rebase #348 powinno przejść. Jeśli nie: FUND-W PR 0, nie łatać testów fundamentu w gałęzi Instalacji.
- **Hak gitleaks w chmurze.** Sesje Claude Code w chmurze nie mają gitleaks — commit wymaga zgody Krystiana na `--no-verify` dla danej gałęzi (gitleaks i tak działa w CI). Na Windowsie Krystiana hak działa normalnie.
- **Treści przepisów się starzeją** (WT, czujki, Wi-Fi hoteli). Po produkcji: przegląd raz w miesiącu (zadanie cykliczne w Asanie), data „stan na” z panelu.
- **Zdjęcia.** Bez zdjęć monitoringu główna usługa linii wygląda słabiej niż reszta. Jeśli szef nie da zdjęć do PROD — świadoma decyzja w Asanie, nie cicha zgoda.
- **Zakres.** Nowe pomysły w trakcie → `docs/stan/STAN-instalacje.md` „Pomysły”, nie „przy okazji”.

---

## 8. Mapa: audyt 06.11 → gdzie załatwione

| Punkt | Temat | Gdzie |
|---|---|---|
| P0-1 | WhatsApp w UI | ✅ #349 (L1-I krok 2–3); resztki w kodzie → INST-2 PR2; pola w bazie → D1 |
| P0-2 | „Zdjęcia w formularzu” bez funkcji | ✅ #349; test treści → INST-2 PR2 |
| P0-3 | „W przygotowaniu” ×3 + checklista PDF | INST-2 PR2 + D2 |
| P1-4 | kontrast 229 / 11 | INST-2 PR3 |
| P1-5 | brak obrazu OG | czat + panel (D6), przed PROD |
| P1-6 | logo marek za małe | INST-2 PR3 |
| P1-7 | daty i przepisy | tekst „stan na” → INST-2 PR2; weryfikacja → czat przed PROD |
| P1-8 | LCP na stagingu | INST-3 |
| P1-9 | zdjęcia realizacji | `sizes`/kadr → INST-2 PR2; oryginały i monitoring → szef przed PROD |
| P1-10 | licencje zdjęć producentów | Krystian przed PROD |
| P2-11 | hero: pauza, pasek, Esc, powiększenie | INST-2 PR4 |
| P2-12 | hero na telefonie | INST-2 PR4 |
| P2-13 | bardzo długie strony | ✅ #349 (szyna + „Na tej stronie”); dalsze skrócenia → INST-4 |
| P2-14 | numery na przekroju architektów | INST-2 PR2 |
| P2-15 | „Pokaż na żywo” na 6 z 14 kart | INST-4 PR4 |
| P2-16 | pole „Salon” w CTA, newsletter | INST-2 PR2 |
| P2-17 | `/kontakt` | INST-2 PR1 (L2-I) |
| P2-18 | galeria a czytnik ekranu | INST-2 PR2 |
| P2-19 | powtórzenia SEO | INST-4 PR5 (treści z czatu) |
| P2-20 | RUNDA-V5 §1.3, §1.5, §2 | INST-2 PR4 (§1.3, §1.5); §2 → D3 |
| P2-21 | CLS `/dla-kogo/szkoly` telefon | INST-2 PR2 |
| P2-22 | Poradnik: 1 wpis | INST-4 PR5 (treści z czatu) |
| P3-23 | tytuły > 60 znaków | INST-2 PR2 + panel stagingu |
| P3-24 | axe `region`, `landmark-unique` | ✅ #349 (stara powłoka usunięta); potwierdzenie → INST-2 PR2 |
| P3-25 | nagłówki `/serwis`, link bez podkreślenia | INST-2 PR2 |
| P3-26 | historia gita, gałąź `inst/wsp-v5` | KROK 0 (Krystian) |
| nowe 06.11 | brak wyszukiwarki na telefonie (≤ 1080 px) | FUND-W PR1 |
| nowe 06.11 | stopka nachodzi na szynę 1400–1535 px (wszystkie linie) | FUND-W PR2 |
| nowe 06.11 | ikony `list` / `wand` spoza zestawu (Biznes, Software) | FUND-W PR3 |
| nowe 06.11 | komentarz `RevealObserver` | FUND-W PR4 |
| nowe 06.11 | kolumna kontaktu stopki pod sekcją kontaktu na `/kontakt` | INST-2 PR1 (pkt 3) |
