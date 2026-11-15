# prokomsoftware.pl — audyt po SWA7 (08.11.2026, wieczór) i sesja SWA8

**Sprawdzone:** `software.localhost:3004` po scaleniu SWA7 (#428), Chrome, motyw jasny (wybór Krystiana) i hero na 6 rozmiarach ekranu (1920×1080, 1440×900, 1366×768, 1280×720, 834×1112, 390×844), 17 adresów (strona główna, oferta, kreator, audyt, cennik, O firmie, Kontakt, aktualności, 4 strony prawne, mapa strony, dziękujemy, rozwiązanie, miejscowość, 404), wyszukiwarka i okno oferty.

**Ograniczenie pomiaru:** karta przeglądarki w trakcie audytu była dławiona przez Chrome (1 klatka/s), więc **płynności animacji nie dało się zmierzyć** — część zrzutów złapała hero w połowie przejścia (np. pusta druga linia H1, nachodzące okna). Ruch trzeba ocenić na żywo (Krystian) albo w Playwright z nagraniem (prompt niżej).

## Co z audytu 08.11 jest naprawione ✓
- Hero nie staje po najechaniu myszą; zegar slajdów 4,2 s (zmierzone: 4,24 s), strzałki ← → przy karuzeli są.
- Szyna nie zasłania już H1 i treści podstron (H1 O firmie od 92 px, szyna do ~80 px).
- Wyszukiwarka czytelna: jaśniejsze okno, mocniejsze tło, akcje słowne („Zadzwoń”, „Drugi numer”, „Kopiuj numer”…).
- Okno oferty szersze (1336 px przy 1440), układ 7/5 z przyklejoną makietą i paskiem dolnym.
- Kapsuła po przewinięciu ma pełne tło.
- H1 O firmie i Kontakt z wyróżnieniem, wizytówka z nagłówkiem i logo, stopka z kolorowymi kreskami linii, Regulamin w pasku prawnym.
- Wszystkie podstrony 200, 404 = 404, jeden H1 na stronę, brak poziomego przewijania na 1440 i 390, brak obrazów bez `alt`, brak `TODO`/`[FAKT]`/`{cena:}` w treści.

## P1 — do poprawy

| # | Problem | Pomiar | Poprawka |
|---|---|---|---|
| 1 | **Makiety hero na laptopach są za małe** — po dopasowaniu do wysokości okno ma 462 px (1366×768) i 388 px (1280×720); tekst makiety nieczytelny, efekt „premium” znika | okno: 1920 → 760 px, 1440 → 667, 1366 → 462, 1280 → 388 | Najpierw kurczymy tekst i kafle, dopiero potem okno: przy `max-height: 820px` H1 `clamp(48px, 9.5vh, 72px)`, lead 1 linia, kafle zwarte 56 px (ikona + nazwa w rzędzie), mniejszy odstęp pigułki; **minimalna szerokość okna 560 px** (przy ≥ 1280 px szerokości). Cel: 1366×768 i 1280×720 — okno ≥ 560 px, widoczna co najmniej górna połowa |
| 2 | **Na dużym monitorze 1920×1080 widać tylko ~⅔ makiety** (okno 754–1253 px) — cel z audytu 08.11 to całe okno | | Przy `min-height: 1000px` mniej powietrza nad H1 i między leadem a kaflami (≈ 120 px łącznie) — okno ma się kończyć ≤ 1060 px |
| 3 | **Telefon: dolny pasek zasłania dół makiety hero** (pasek od 766 px, okno do 791 px przy 390×844) | | Okno ma kończyć się ≥ 16 px nad dolnym paskiem: lead 2 linie, kafle niższe (≈ 72 px) albo okno 320 px; test e2e `win.bottom ≤ tabBar.top − 16` |
| 4 | **Szyna zasłania stopkę i pas „Zacznij od podglądu”** — szyna jest przyklejona i przy dojechaniu do stopki leży na logo i tekście stopki („Strony, systemy…” zaczyna się pod szyną) | stopka od x ≈ 62 px, szyna do ≈ 80 px | Szyna **chowa się płynnie** (opacity + przesunięcie w lewo 0,35 s), gdy pas nad stopką / stopka wchodzi w okno (IntersectionObserver) — premium i bez kolizji; alternatywa: stopka z tym samym odstępem od szyny co treść |
| 5 | **Nagłówki sekcji bez wyróżnienia `em`** — wzór v24 (eyebrow → H2 z drugą częścią w gradiencie) jest tylko w 3 z 9 sekcji głównej i w H1 podstron | brak `em`: „Z czym do nas przychodzisz?”, „Tak może wyglądać Twoja strona albo system”, „Policz swój projekt.”, „Większość płacisz po odbiorze”, „Zanim napiszesz”, „Napisz po swojemu”; Oferta: „Bez dopłat za rzeczy oczywiste”; Audyt: „Pięć rzeczy…”, „Trzy poziomy audytu…”, „Jak wygląda darmowy audyt”, „Zanim zamówisz audyt”; Cennik: „Opieka po wdrożeniu…”, „Trzy poziomy audytu…”, „Zanim zapytasz o wycenę”; O firmie: „Freelancer, agencja czy PRO-KOM?” | Druga część każdego H2 w `em` wg plansz/`TRESCI-v24.md` (np. „Z czym **do nas przychodzisz?**”, „Tak może wyglądać **Twoja strona albo system**”, „Policz swój projekt. **Bez dzwonienia.**”, „Większość płacisz **po odbiorze**”, „Freelancer, agencja **czy PRO-KOM?**”). Reguła „jedno »A. B.« na stronę” (copyBudget) dotyczy kropki, nie `em` |
| 6 | **Podwójne wezwanie do działania na Audycie** — pas „Wolisz od razu nową stronę?” zaraz przed pasem „Zacznij od podglądu” | | Usunąć pas „Wolisz od razu…” albo zamienić pas nad stopką na tej stronie (jeden CTA przed stopką) |
| 7 | **Okno oferty: cena trzy razy** (kafel „Cena”, karta pod makietą, pasek dolny) | | Zostaw kafel + pasek dolny; kartę pod makietą zamień na „Co dalej” (3 kroki: wycena 30 dni / zaliczka / kod Twój) albo usuń |
| 8 | **Okno oferty otwiera się z pierścieniem fokusu na „←”** (wygląda jak błąd) | | Fokus początkowy na tytule okna (`tabIndex=-1`) albo pierścień tylko przy `:focus-visible` z klawiatury |
| 9 | **Wyszukiwarka: przy aktywnym polu dwie pionowe fioletowe kreski po bokach pola** (pierścień fokusu pola rysuje się jako boki) | | Pierścień fokusu na całym wierszu wyszukiwania (dolna linia akcentu już jest) — pole `outline: none` tylko gdy wiersz pokazuje fokus (`:focus-within`) |
| 10 | **Stopka: duże puste pole pod kolumnami Oferta/Firma** (Firma ma 4 linki, kolumna Kontakt 2× wyższa) | | Kolumny Oferta i Firma w jednej kolumnie „Na skróty” (2 podkolumny) albo kolumna Kontakt w poziomie (mapa obok danych); cel: wyrównane dolne krawędzie ±40 px |
| 11 | O firmie: „Django” w „Na czym budujemy” | | **Decyzja Krystiana** (z audytu 08.11, #14 — nadal otwarta) |

## P2 — ruch (do sprawdzenia na żywo, bo pomiar był dławiony)
Lista kontrolna, którą sesja SWA8 przechodzi z nagraniem Playwright (`video: 'on'`, 1440 i 390, 60 fps, karta na pierwszym planie):
1. Zmiana slajdu hero: słowo w H1 wjeżdża od razu (bez pustej linii dłuższej niż 0,2 s), okna przesuwają się bez nakładania tekstu na tekst, podpis przenika.
2. Wejścia sekcji (eyebrow → H2 → lead → karty kolejno) na każdej sekcji głównej i podstron.
3. Hover kart, przycisków (przebłysk), chipów; FAQ; filtry cennika/oferty (FLIP bez skoku siatki); kreator (przesunięcie kroku, podgląd).
4. Okna: oferta, wyszukiwarka, menu telefonu — wejście z rozmycia, wyjście 0,2 s.
5. Szyna: kreska wskazuje aktywną sekcję także przy szybkim przewijaniu i po kliknięciu.
6. Brak długich klatek > 50 ms przy przewijaniu (Performance) na 1440 i 390.

## Prompt — sesja SWA8 (folder `prokom-web-software`)
```
/zadanie SWA8 — poprawki po audycie po SWA7 (jedna sesja, PR 8a hero i szyna, PR 8b nagłówki, okno oferty, stopka, ruch)
Start: git status, git fetch. Gałęzie od origin/develop: feat/swa8-hero-szyna (8a), feat/swa8-szlif (8b, od 8a).
Źródła: docs/design/prokomsoftware/v24/AUDYT-0811-PO-SWA7.md (CAŁY), AUDYT-0811.md (#0, #8 dla kontekstu), ZMIANY-v24.md §4.1–4.1a, §5, TRESCI-v24.md (H2 z em), plansze v24/boards.
Najpierw krótki plan (8a + 8b) z pytaniem o #11 (Django) — czekaj na akceptację.
8a: hero na niskich ekranach (#1: najpierw kurczy tekst i kafle, okno min. 560 px przy ≥ 1280), duży monitor (#2: okno kończy się ≤ 1060 px przy 1920×1080), telefon (#3: okno nad dolnym paskiem), szyna chowa się płynnie przy stopce (#4). Test e2e: pozycje okna na 1920×1080, 1440×900, 1366×768, 1280×720, 390×844.
8b: em w H2 wszystkich sekcji i podstron (#5, teksty z TRESCI-v24), jeden CTA przed stopką na Audycie (#6), okno oferty bez potrójnej ceny i bez pierścienia na start (#7, #8), pierścień fokusu wyszukiwarki (#9 — wspólny komponent → mały PR feat/wsp-*), stopka bez pustego pola (#10). Lista ruchu P2 1–6 przejdź z nagraniem Playwright (video on, 1440 i 390) i popraw, co odstaje; nagrania do opisu PR.
DoD: blok 3.0 z PRZEKAZANIE-v24, zrzuty pierwszego ekranu w 5 rozmiarach, nagrania ruchu, e2e software-* zielone. Potem /przeglad → /koniec-sesji → /pr. Następnie SWA6b (jeśli niescalone) i staging Software.
```
