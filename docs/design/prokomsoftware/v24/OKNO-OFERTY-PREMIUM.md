# Okno oferty — runda premium (SWA9, spec. 09.11.2026)

Okno oferty (`src/sites/software/components/offer/SolutionDialog.tsx` + `OfferParts.tsx`, `OfferGallery.tsx`) to miejsce, gdzie klient decyduje. Po SWA7–SWA8 wygląda porządnie, ale to wciąż **ładny dokument**: kafle w kaflach, jedna waga wszystkiego, pasywna makieta. Cel tej rundy: **okno, które samo prowadzi do decyzji**. Pokazuje, co dostajesz, *na makiecie*. Odpowiada na „a co, jeśli potrzebuję więcej” bez dzwonienia. Kończy się jednym oczywistym krokiem.

Zasady bez zmian: marka (ADR-015 v24 — ciemne szkło, fioletowe światło, tokeny), ceny i terminy tylko z `Solutions`, **zero nowych cen** (dodatków nie wyceniamy w oknie — kreator v3 jest bez dodatków), dane kontaktowe z panelu, bez zdjęć ludzi.

## 1. Co jest dziś nie tak (zrzut 09.11, 1440, oferta 4/29 „Strona wizytówka”)

| # | Problem | Dlaczego przeszkadza |
|---|---|---|
| A | Cena, termin i opieka to trzy **równe** kafle | cena to najważniejsza liczba w oknie, a waży tyle co „opieka od” |
| B | Lewa kolumna = 5 prostokątów o tym samym stylu (W cenie, W cenie każdego projektu, Przykład, Dla kogo, Co od Ciebie, FAQ…) | „pudełka w pudełkach”, brak rytmu — oko nie wie, gdzie zacząć; długie przewijanie bez mapy |
| C | „W cenie każdego projektu” z **wypełnionymi fioletowymi checkboxami** | wyglądają jak pola do kliknięcia (fałszywa interakcja) |
| D | Makieta mała, pod nią pusta przestrzeń; prawa kolumna kończy się na „Co dalej”, dalej **pusta połowa okna** | najmocniejszy element (podgląd na żywo) zajmuje mniej miejsca niż lista punktów |
| E | Powiadomienie „Telefon ze strony · 3 min temu” **zasłania kafle makiety** | wygląda jak błąd układu |
| F | „Przykład z życia” + plakietka „Przykład” | ta sama informacja dwa razy |
| G | Pasek dolny: 3 przyciski o podobnej wadze; główny = „Dodaj do wyceny” | cel nr 1 to zapytanie; „Dobierz w kreatorze” to ucieczka z okna, nie krok |
| H | Nawigacja tylko „‹ 4/29 ›” | nie wiadomo, co jest obok, nie da się skoczyć do kategorii ani porównać z sąsiednią ofertą |
| I | Makieta nie reaguje na treść | punkty „W cenie” i podgląd żyją osobno — klient sam musi je połączyć |

## 2. Kierunek — „okno decyzji”

```
┌ ‹ 4/29 › · STRONY ● ● ● ○ ○ ○        [Zakres] [Jak to wygląda] [Dla kogo] [Pytania]      ⌘K  ✕ ┐
│                                                                                               │
│  STRONA                                         ┌────────── MAKIETA (duża, 58%) ──────────┐   │
│  Strona wizytówka                               │   ①            ②                        │   │
│  Jedna strona, z której klient od razu dzwoni…  │        ③                                │   │
│                                                 │                     ④                   │   │
│  od 999 zł netto        ⏱ od 1 tygodnia         └─────────────────────────────────────────┘   │
│  ─────────────          ♻ opieka od 149 zł/mies.      [ Komputer | Telefon ]  ● na żywo        │
│                                                                                               │
│  CO DOSTAJESZ  (najechanie = podświetlenie na makiecie)                                       │
│  ① Telefon jednym kliknięciem   ② Mapa i godziny   ③ Formularz   ④ Gotowa pod Google           │
│                                                                                               │
│  POTRZEBUJESZ WIĘCEJ?  [+ Galeria] [+ Opinie] [+ Profil w Google] [+ Inny język]  → do zapytania│
│  …sekcje (Jak to wygląda / Dla kogo / Co od Ciebie / Pytania) — lekkie, bez obramowań         │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│ od 999 zł netto · od 1 tyg.   W zapytaniu: Galeria, Opinie     [+ Do wyceny]  [Zapytaj o tę ofertę →] │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Nagłówek okna (A, H)
- **Cena jako bohater:** `od 999 zł` w kroju display, ~56 px na PC, „netto” małe obok, pod spodem cienka kreska z gradientem akcentu. Termin i opieka jako dwa wiersze z ikoną (bez kafli).
- **Kropki kategorii** obok „4/29”: każda kropka = oferta w kategorii (bieżąca świeci); kropki kolejnych kategorii zwinięte do etykiet. Najechanie na kropkę → nazwa oferty w dymku, klik → przejście.
- **Zakładki sekcji z podświetleniem przy przewijaniu** (`Zakres · Jak to wygląda · Dla kogo · Pytania`) w szklanym nagłówku okna — ten sam mechanizm co szyna (`SlidingMark`), klik przewija treść okna.
- Skróty widoczne raz, delikatnie, przy pierwszym otwarciu w sesji: `← → oferty · Esc zamknij` (znika po 4 s albo po pierwszym użyciu; `sessionStorage` w try/catch).

### 2.2 Makieta jako główny element (D, E, I) — „inteligentny podgląd”
- Prawa kolumna **przyklejona** (sticky) i **większa** (ok. 58% szerokości od 1280 px). Żadnej pustki pod nią — „Co dalej” wchodzi do nagłówka ceny (3 krótkie punkty pod ceną) albo do paska dolnego.
- **Punkty na makiecie:** numerowane znaczniki ①②③④ na elementach makiety. Najechanie (albo fokus klawiatury) na punkt w „Co dostajesz” → na makiecie ten obszar się podświetla (pierścień światła + przyciemnienie reszty 20%), a znacznik pulsuje raz. Działa też w drugą stronę: klik w znacznik na makiecie przewija do punktu.
  - Dane: w makietach Software obszary dostają `data-spot="telefon|mapa|formularz|panel|galeria|opinie|rezerwacja|jezyki|google|…"`. Punkt „W cenie” (`Solutions.included` — dziś tekst `hasMany`) **dopasowuje się do obszaru po słowach kluczowych** w `lib/software/spots.ts` (np. „telefon” → `telefon`, „mapa” → `mapa`, „formularz” → `formularz`, „panel” → `panel`, „Google” → `google`), z testem. **Bez dopasowania albo bez obszaru w makiecie → zwykły punkt bez podświetlenia.** Bez zmiany schematu i bez migracji — dlaczego: `included` to lista tekstów, a osobne pole „spot” wymagałoby przerobienia jej na tablicę obiektów (migracja z przenoszeniem danych) dla efektu, który słowa kluczowe dają za darmo.
- **Komputer | Telefon** jako przełącznik segmentowy z przesuwaną pigułką; zmiana urządzenia = płynne przejście ramki (szerokość/zaokrąglenie), nie podmiana obrazka.
- Powiadomienie makiety („Telefon ze strony · 3 min temu”) **wjeżdża raz** w dolny róg ramki *wewnątrz* makiety, nie nachodzi na jej kafle; ma podpis „przykład” w `aria-label`; po 5 s chowa się.
- Delikatna poświata w kolorze akcentu za ramką makiety (warstwa `aurora` z tokenów) reagująca na kursor (paralaksa ±6 px). `prefers-reduced-motion` → statyczna.

### 2.3 Treść lewej kolumny (B, C, F)
- **Jedna warstwa zamiast pudełek:** sekcje rozdzielone odstępem i cienkim separatorem, bez obramowanych kart. Karta zostaje tylko dla „Przykład z życia” (cytat z lewą kreską, bez plakietki „Przykład”).
- „W cenie każdego projektu” — ikony linii (✓ w kółku, kolor akcentu, 20 px), **nie checkboxy**.
- **„Potrzebujesz więcej?” = chipy wyboru** z listy z `Solutions` (np. „Galeria”, „Opinie klientów”, „Profil Firmy w Google”, „Kolejny język”). Wybrane chipy trafiają do paska dolnego („W zapytaniu: Galeria, Opinie”) i jako lista do formularza Kontaktu przy „Zapytaj o tę ofertę” (`?temat=…&fraza=…` / dołącznik „Twój projekt” z `items`). **Bez cen dodatków** — obok chipów stały tekst „wycenimy w 5–7 dni”. Dane: **już są** — `Solutions.moreExamples` (tekst `hasMany`, maks. 6, „Bez cen — wyceniamy na piśmie”); dziś składane w jedno zdanie przez `offer.common.more`, w oknie stają się chipami.
- Ewentualne porównanie z sąsiadem (P2, poza tą sesją, jeśli czas nie pozwoli): link „Czym różni się od: Strona firmowa z panelem →” — dwie kolumny „W cenie” obok siebie, dane już są.

### 2.4 Pasek dolny (G)
- Lewa strona: cena + termin (jak dziś) **plus stan**: „W zapytaniu: …” albo „W wycenie: 2 pozycje”.
- Przyciski: **główny „Zapytaj o tę ofertę →”** (wypełniony akcentem), drugi „+ Do wyceny” (obrys); po dodaniu morfuje w „✓ W wycenie · Wyślij →” (zachowane obecne zachowanie z fokusem). „Dobierz w kreatorze” → link tekstowy w sekcji „Pytania” („Nie wiesz, czy to dla Ciebie? Kreator 60 s”), nie w pasku.

### 2.5 Ruch (premium, ale szybki)
- **Wejście:** przejście współdzielonego elementu — makieta z karty katalogu rośnie do makiety okna (View Transitions API, `view-transition-name` na karcie i w oknie). Bez wsparcia → obecne wejście z blur (~300 ms).
- **Zmiana oferty ← →:** treść przesuwa się 24 px w kierunku nawigacji z przenikaniem (200 ms), makieta robi krzyżowe przenikanie; cena liczy się do nowej wartości (`PriceTween` już jest).
- Sekcje lewej kolumny wchodzą raz, przy pierwszym otwarciu (stagger 40 ms), nie przy każdej zmianie oferty.
- Wszystkie czasy z tokenów `--dur-*`, `prefers-reduced-motion` → bez przesunięć i paralaksy.

### 2.6 Telefon (≤ 767 px) — arkusz jak w aplikacji
- Arkusz od dołu z uchwytem i dwoma punktami zatrzymania (70% / pełny ekran), przeciąganie w dół zamyka.
- Kolejność: makieta (pełna szerokość, przełącznik urządzenia pod nią) → nazwa + cena-bohater → „Co dostajesz” (stuknięcie punktu = podświetlenie makiety i przewinięcie do niej) → chipy „Potrzebujesz więcej?” → reszta.
- Przesunięcie palcem w poziomie po makiecie = następna/poprzednia oferta (z progiem, żeby nie łapało przewijania).
- Pasek dolny: cena po lewej, jeden główny przycisk „Zapytaj →”, „+” jako ikona 44 px.

### 2.7 Dostępność
- `role="dialog"`, `aria-labelledby` = H2 nazwy (jak dziś, fokus na nazwie bez pierścienia).
- Zakładki sekcji = `nav` z linkami do kotwic w oknie, `aria-current` na aktywnej.
- Znaczniki makiety = przyciski z `aria-label` („Pokaż w cenie: Mapa i godziny”), makieta sama `aria-hidden` poza znacznikami.
- Chipy „Potrzebujesz więcej?” = `aria-pressed`; stan paska dolnego w `aria-live="polite"`.
- Cele dotyku ≥ 44 px, kontrast AA w obu motywach (test kontrastu tokenów obok).

## 3. Dane i schemat — **bez migracji**
- Wszystko z istniejących pól `Solutions`: `included` (punkty + dopasowanie do obszarów), `moreExamples` (chipy), ceny/termin/opieka jak dziś.
- Makiety: `data-spot` na obszarach w komponentach makiet; lista kluczy i słów w jednym miejscu (`lib/software/spots.ts`) + test: dla każdej z 29 ofert z seedu wypisz, ile punktów `included` trafia w obszar jej makiety (cel: ≥ 2 na ofertę; mniej → zgłoś w PR, nie dopisuj na siłę).
- Puste `moreExamples` → sekcja chipów się nie pokazuje (zostaje zdanie jak dziś, jeśli jest).

## 4. Definition of Done
- Porównanie przed/po: zrzuty okna (4 oferty z różnych kategorii) 1440, 1280, 834, 390 × ciemny/jasny → do opisu PR.
- Nagranie Playwright (video on): otwarcie z katalogu, ← → trzy oferty, najechanie na 3 punkty „Co dostajesz”, wybór 2 chipów, „Zapytaj o tę ofertę” → formularz z listą.
- e2e: podświetlenie makiety po fokusie punktu, chipy → formularz z listą, Esc/←/→, arkusz na telefonie (zamknięcie przeciągnięciem — jeśli Playwright nie umie, test przyciskiem ✕ + ręcznie na telefonie).
- Vitest: `spots.ts` (spójność kluczy), budowanie listy do zapytania z chipów.
- Brak długich klatek > 50 ms przy otwarciu i zmianie oferty (DevTools Performance na `pnpm build && pnpm start`), MOBILE-APLIKACJA §5, `lint/typecheck/test`, `/przeglad`.

## 5. Prompt dla Claude Code

```
/zadanie SWA9 — okno oferty premium (docs/design/prokomsoftware/v24/OKNO-OFERTY-PREMIUM.md)
Warunek: SWA8b scalone do develop. Start: git status, git fetch. Folder prokom-web-software (PORT=3003, baza prokom_web_swa).
Gałęzie od origin/develop, piętrowo: 9a feat/swa9a-okno-uklad (§2.1, 2.3 bez chipów, 2.4, 2.6 układ — bez zmian schematu) → 9b feat/swa9b-okno-punkty (§2.2 punkty na makiecie + §2.3 chipy, bez migracji) → 9c feat/swa9c-okno-ruch (§2.5 View Transitions, przejścia ← →, arkusz telefonu z gestami).
Pliki: src/sites/software/components/offer/* , makiety Software, src/lib/software/spots.ts (+ test). Bez zmian schematu i migracji. Strefy wspólnej nie ruszasz.
Zasady: zero nowych cen (chipy bez kwot), dane z Solutions, tokeny i czasy z tokenów, reduced motion.
Zatrzymaj się tylko, gdy uznasz, że czegoś nie da się zrobić bez zmiany schematu — wtedy opcje, nie kod.
DoD wg §4 spec. Po każdej gałęzi lint/typecheck/test; na końcu /przeglad i /pr dla każdej (opis PR: zrzuty przed/po, nagranie, werdykt recenzenta).
```
