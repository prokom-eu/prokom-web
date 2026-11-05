# prokomsoftware.pl — ZMIANY v24 „Aurora” (06.11.2026)

**Status:** wizualizacja finalna zaakceptowana przez Krystiana 06.11.2026. **Punkt wyjścia w kodzie:** v23 (SW0–SW12 + SWV1–SWV9 scalone). **Wzorzec:** `boards/` (32 plansze), `screens/` (zrzuty), `wzorzec/aurora.css` + `aurora.js` (efekt i dane), `TRESCI-v24.md` (teksty). Plan budowy: `../PRZEKAZANIE-v24.md`.

v24 to **zmiana kierunku wizualnego** (ciemne szkło + kontrolowane fioletowe światło, „premium jak aplikacja”), **nowa strona główna**, **nowy kreator**, **nowe hero** i **dopasowanie do elementów wspólnych linii** (kapsuła, szyna, wyszukiwarka, stopka, O firmie, Kontakt). Model treści (ADR-014: `Solutions`, `SoftwareSettings`, `Inquiries`…) zostaje — rozszerzamy go, nie budujemy od nowa. Adresy URL zostają.

---

## 0. Zasady nadrzędne (nie do zmiany w sesjach)
1. **Fiolet linii Software to jedyny kolor akcentu** (`#6E45D4` / `#9670EE` / `#5B33C4` / `#ECE7FB` z palety; wartości tylko w `src/styles/tokens.css`). Światło, poświaty i gradienty — **wyłącznie z tej rodziny** (fiolet → lawenda → biel). Bez różu i błękitu (to był problem v20 „jak z generatora AI”).
2. **Domyślnie ciemny motyw.** Jasny zostaje (przełącznik w nagłówku i w menu telefonu), wybór pamiętany jak dziś (`pk-theme` w localStorage, bez ciasteczek).
3. **Dla każdej firmy, nie dla jednej branży.** Przykłady w makietach są ogólne („Twoja Firma”, `twojafirma.pl`) albo pokazują typ (pensjonat, restauracja). Żadnych remontów/ekip jako głównego motywu.
4. **Bez zdjęć ludzi, bez WhatsAppa, dane kontaktowe z panelu, „Tech” (nie „Serwis”), Gaming tylko jako odnośnik** (zasady 01.11, ADR-022).
5. **Ceny i terminy zawsze z `Solutions`** (`priceFrom`, `leadTime`, `{cena:<slug>}`, `{termin:<slug>}`); w planszach są wpisane tekstem tylko do pokazu.
6. **Ruch premium, ale wyłączalny:** każda animacja ma wariant dla `prefers-reduced-motion: reduce` (brak ruchu, stan końcowy od razu).
7. **Telefon = aplikacja** (MOBILE-APLIKACJA §4–§5): kapsuła 58 px, dolny pasek z centralnym „+” (Kreator), arkusze od dołu, gest w dół zamyka.
8. **Hero ma być spektakularne — efekt wizualny ma pierwszeństwo przed wynikiem Lighthouse** (decyzja Krystiana 06.11.2026: wyjątek od DoD „Lighthouse ≥ 90” dla strony głównej Software). Nie upraszczamy hero ani makiet dla punktów. Optymalizacje z §12 robimy tylko te, które **nie zabierają nic z wyglądu** (płynność, brak skoków układu, pauza poza ekranem).

---

## 1. Kolory i tokeny (ADR-015 „Rozstrzygnięcia v24”)

Wzorzec wartości: `wzorzec/aurora.css` → `.au.dark` / `.au.light` (+ blok „SHARED SHELL” z tokenami kapsuły). W kodzie: **nowe/zmienione tokeny semantyczne** w `src/styles/tokens.css` (sekcja `[data-line='software']` jasny / `[data-theme='dark']` ciemny). Mapa ról:

| Rola (plansza) | Ciemny | Jasny | Token w kodzie (propozycja; dobierz nazwy do istniejących) |
|---|---|---|---|
| tło strony `--bg` / `--bg2` | `#0b0d0c` / `#101211` | `#f4f5f1` / `#eceee8` | `--bg`, `--surface-2` |
| tekst `--fg` / `--fg2` / `--fg3` | `#eef0ec` / `#b3b9b3` / `#7f867f` | `#121613` / `#4f5650` / `#7a817b` | `--ink`, `--ink-soft`, `--ink-mute` |
| szkło karty `--card` | gradient biel 6% → 2% | biel 95% → 70% | `--glass-card` (nowy) |
| szkło paneli `--glass` | `rgba(20,22,21,.66)` | `rgba(255,255,255,.72)` | `--glass` (nowy) |
| obrys / obrys aktywny `--gb` / `--gbh` | biel 10% / fiolet 50% | grafit 10% / fiolet 45% | `--border`, `--accent-line` |
| akcent tekstu `--vt` | `#c9b8ff` | `#5b33c4` | `--accent-text` |
| tło akcentu miękkie `--vs` | fiolet 16% | `#ece7fb` | `--accent-soft` |
| poświata `--glow` | `rgba(110,69,212,.42)` | `rgba(150,112,238,.28)` | `--glow` (wraca jako fiolet — cofnięcie v23 pkt 2) |
| siatka tła `--grid` | biel 4% | grafit 5% | `--grid` (nowy) |
| przycisk główny | `#9670ee` + tekst `#0b0d0c` | `#6e45d4` + tekst biały | `--accent`, `--accent-ink` |
| CTA kapsuły | gradient `#8a62ea → #6b42d8` | `#7b52e0 → #6238cf` | `--cap-cta-*` (z D2-1a — wartości Software) |
| stopka (oba motywy) | `#161a17`, akcent `#9670ee` | jak ciemny | `--footer-bg` / `--line-dark` (D2-1a) |

**Gradienty dozwolone (lista zamknięta):**
1. Wyróżnione słowo nagłówka (`em` w H1/H2): jasny `linear-gradient(100deg,#5b33c4,#7b52e0 45%,#a07ef2)`; ciemny `linear-gradient(100deg,#8f9690,#a79bd6 70%,#c3abfa)`; H1 podstron (hero ciemne) `#d9ccff → #9670ee`. Przy przewijaniu gradient „przesuwa się” (scroll-driven, §5).
2. Poświaty hero i warstwa kosmiczna (§4.1), pas „Zacznij od podglądu” nad stopką, kafel/karta wyróżniona (np. „01 Nowa strona albo system”, „Klikasz w podgląd…”, poziom audytu „Polecamy”).
3. Szkło kart (`--glass-card`: biel o niskim kryciu) i CTA kapsuły.
4. Ilustracje kategorii Aktualności (`.au-pc-art`) — **jedyne miejsce z innymi barwami** (turkus, złoto, czerwień, granat) w roli kodu kategorii; poświata zawsze z tej samej barwy.

**Kolory makiet** („Twoja Firma”, pensjonat, restauracja…) — każda makieta ma motyw przykładowej firmy (tabela `T` w `boards/Vis.dc.html`: a niebieski, b zieleń+złoto, c terakota, d butelkowa zieleń+żółć, e grafit+fiolet, f lawenda). To **cofnięcie decyzji z 28.10** („makiety w kolorach tokenów”) — v24 pokazuje marki przykładowych firm. Wartości jako tokeny `--mk-<motyw>-<rola>` w `tokens.css` (strażnik `no-raw-colors` zostaje).

**Testy do zmiany:** `src/styles/themes.test.ts` — strażnik „Software has no gradient tokens left” i `--glow-2 = transparent` zastąpić strażnikiem v24: (a) gradienty i poświaty Software tylko z barw `--c-software*` (sprawdzenie, że tokeny `--glow*`, `--glass*`, `--em-*` mają odcień fioletu albo neutralny), (b) kontrast tekstu na szkle i na pasie CTA ≥ 4,5:1 w obu motywach. Kontrast policz dla: `--ink*` na `--bg` i na `--glass-card`, `--accent-text` na `--bg`, tekst przycisku na `--accent`.

---

## 2. Typografia
- Kroje bez zmian: **Archivo** (nagłówki, 900, letter-spacing −0,04…−0,05em) i **Manrope** (tekst) — już samohostowane w `(sites)/fonts.ts`.
- Skala (desktop → telefon): H1 hero 100 → 84 (≤1200) → 68 (≤960) → 40–44 (≤600); H1 podstron 72–76 → 52–56 → 38–40; H2 sekcji 60 → 52 → 44 → 34; eyebrow 11–12 px, 800, `letter-spacing .14–.16em`, wersaliki, kolor `--accent-text`.
- Wzór nagłówka sekcji: **eyebrow → H2 z drugą częścią w `em`** (gradient z §1). Jeden nagłówek „A. B.” na stronę (reguła SWV9 zostaje — budżet haseł `copyBudget.test.ts` aktualizujesz o nowe teksty).

---

## 3. Powłoka (wszystkie strony) — na komponentach wspólnych D2

Software **nie buduje własnej powłoki**. Używa komponentów wspólnych z D2 (`src/components/shared/`), motywowanych tokenami Software i wypełnionych danymi z `SiteSettings.shared` + `SiteSettings.software.navigation`. Po wpięciu usuwamy `SwTopBar`, `SoftwareHeader`, `SwHeaderNav`, `SoftwareFooter`, `TabBar`/`PhoneLayer` Software (bez martwego kodu). Wzorzec: plansze wspólne (Nagłówek-kapsuła 11, Szyna 07, Stopka 02, O firmie 05, Kontakt 04) + plansze v24.

### 3.1 Pasek marki (38 px, odjeżdża przy przewijaniu)
Linie PRO-KOM z kolorowymi kreskami (pro-kom.eu, Biznes, Instalacje, **Software — pogrubione**, Tech, Gaming); po prawej: status godzin (`OpeningStatus` — „Otwarte · do 17:00” / „Zamknięte · otwieramy w dzień roboczy o 9:00”), „Darmowy audyt →”, „Software: **883 200 151**” (z panelu). Telefon: ukryty (≤ 600), ≤ 1080 tylko bieżąca linia.

### 3.2 Kapsuła (`SiteHeader`)
Wymiary wg spec kapsuły: max 1280, wys. 72 (po przewinięciu 60), promień 22, sticky 12 px, szkło `--cap-bg` + blur 18 px. Zawartość Software:
- logo (wersja na ciemne / jasne tło);
- menu: **Oferta ▾** (mega menu), **Kreator** jako pigułka akcentu z plakietką **„60 s”** (wyróżnik linii), Darmowy audyt, O firmie, Kontakt; aktywna strona = `--nav-act-bg` / `--nav-act-ink`;
- akcje: lupa „Ctrl K” (wyszukiwarka), przełącznik motywu, **„Twój projekt” z licznikiem** (tylko gdy lista niepusta; istniejący `pk-project`), CTA **„Bezpłatna wycena”** (≤ 1360: „Wycena”), ≤ 1080: logo + „Wycena” + „Menu”.
- **Mega menu Oferta** (10 px pod kapsułą, ta sama szerokość, promień 22): 4 kolumny (Strony / Przebudowa i opieka / Systemy / Automatyzacje) z pozycjami z oferty (nazwa + cena „od” z `Solutions`) + karta promo „Nie wiesz, od czego zacząć?” → Kreator / Oferta / Audyt. Klik pozycji otwiera **okno oferty** (§6.1). Treść z `SiteSettings.software.navigation.mega` (już istnieje — dopasuj kształt).

### 3.3 Wyszukiwarka (`SearchDialog`, Ctrl/⌘ K, lupa, „Szukaj” w szynie)
Pole z podpowiedzią, Esc zamyka. Bez zapytania: **szybkie akcje** (Zadzwoń, Napisz e-mail, Wyznacz trasę, Kreator 60 s, Motyw jasny/ciemny, Kontakt), **najczęściej szukane** (chipy), **ostatnio oglądane** (za flagą `CompanyData.recentlyViewed`, decyzja D2). Z zapytaniem: grupy Akcje / Oferta (z `Solutions`, klik = okno oferty) / Strony (wszystkie podstrony, w tym prawne). Brak wyników: „Nie mamy jeszcze „q” na stronie” + „Zapytaj o „q”” (→ `/kontakt?temat=…`) + telefon. Indeks: istniejący `SoftwareSettings.search` (synonimy, popularne).

### 3.4 Szyna boczna (`SiteRail`, ≥ 1400 px)
64 px, rozwija się do ~250 px po najechaniu/fokusie (etykiety). Góra: **„Szukaj” (wyróżniony, akcent) + Ctrl K**. Lista sekcji bieżącej strony z ikonami, aktywna sekcja podświetlona (znacznik z poświatą); **Kreator 60 s wyróżniony** na głównej. Pasek postępu przewijania (pionowy, akcent). Dół: **„Twój projekt”** (licznik) i „Do góry”. Podstrony: grupa „Na tej stronie” + „Strona główna” (skróty do sekcji głównej). Sekcje głównej: Start, Od czego zaczynasz, Oferta, Podglądy na żywo, Jak robimy, Kreator 60 s, Cennik, Jak pracujemy, Pytania, Kontakt (anchor ids: `start`, `sytuacje`, `oferta`, `podglady`, `technologia`, `dobierz`, `cennik`, `proces`, `faq`, `kontakt` — **zachowaj istniejące `#dobierz`, `#oferta`, `#proces`, `#faq`, `#kontakt`**). Podstrony — listy w planszach (`wzorzec/aurora.js` nie ma ich; są w `build`/planszach: `boards/AU-<strona>.dc.html`, element `aside.au-rail`).

**Kliknięcie w szynie / kotwicę = przejazd premium** (§5.2).

### 3.5 Pas „Zacznij od podglądu, nie od faktury.” (nad stopką — slot linii)
Karta szkła z poświatą (gradient z §1 pkt 2): eyebrow „Masz pomysł?”, nagłówek z `em`, przyciski „Kreator 60 s →” i telefon. Na wszystkich stronach **poza** 404, „Dziękujemy” i Aktualnościami (tam własne CTA). Jeśli `SiteFooter` z D2 nie ma slotu nad stopką — mały PR `feat/wsp-*` (slot), nie kopia stopki.

### 3.6 Stopka (`SiteFooter` wg planszy 02 — „góra linii, dół wspólny”)
Tło `#161a17` w obu motywach (token D2), akcent `#9670ee`.
- **Góra (linia):** logo Software, „Strony, systemy, aplikacje i automatyzacje dla firm. Zobaczysz, zanim zapłacisz.” + 3 punkty ✓ (Kod, domena i dane należą do Ciebie · Serwer w Polsce, kopia co noc · Cena i termin na piśmie); kolumny **Oferta** (Strony internetowe, Systemy i panele, Aplikacje mobilne, Automatyzacje i AI, Opieka i utrzymanie, Cennik) i **Firma** (O firmie, Jedna firma do wszystkiego → `/o-firmie#linie`, Aktualności — tylko gdy ≥ 1 wpis, Darmowy audyt, Kreator 60 s); **Kontakt**: mini-mapa (wspólny `AddressMap` z danymi OSM — patrz §8.6), „Wyznacz trasę ↗”, **883 200 151** (duży), e-mail w akcencie, adres, status godzin, „Odpowiedź w 1 dzień roboczy”.
- **Pas linii PRO-KOM (1:1 ze wspólnego `LinesBand`):** 6 kart ze znakami linii (`LineLogo`), opis, domena, ↗; Software = „Jesteś tutaj” (plakietka na górnej krawędzi), Gaming złota ramka.
- **Pasek prawny (1:1 `LegalBar`):** © 2026 PRO-KOM Tadeusz Wójciak · adres · NIP; „Statystyki bez ciasteczek śledzących”; linki: Polityka prywatności, Regulamin, Cookies, Dostępność, Mapa strony, „Do góry ↑”.
- Telefon: kolumny w 2 kolumnach, pas linii jako przewijana karuzela (74% szerokości karty), odstęp pod dolnym paskiem.

### 3.7 Telefon i tablet (≤ 1080 / ≤ 960 / ≤ 600)
- Kapsuła 10 px od krawędzi, wys. 58, promień 18: logo, motyw, „Wycena”, „Menu”.
- **Dolny pasek** (`TabBar` wspólny, ≤ 960 — także tablet, wyśrodkowany max 520 px): Start, Oferta, **„+” Kreator** (wypukły, akcent), Audyt, Kontakt; aktywna pozycja w akcencie. Pasek „szklany”, sticky 12 px od dołu.
- **Menu** (`MenuSheet`): arkusz od dołu z listą stron (duże pozycje), motyw, „Wycena”.
- Okno oferty i arkusze: od dołu, uchwyt, gest w dół zamyka, „wstecz” zamyka (już w `BottomSheet`).

---

## 4. Strona główna `/` (plansze `AU-pc`, `AU-laptop`, `AU-tablet`, `AU-mobile`, `*-light`)

Kolejność sekcji v24 (zastępuje kolejność v21/v23):

| # | Sekcja (id) | Co | Skąd v23 |
|---|---|---|---|
| 1 | **Hero** (`start`) | warstwa kosmiczna, H1 „Zrobimy Ci / <rodzaj>.”, wybór 7 rozwiązań, karuzela 3D makiet, kapsuła podpisu, pasek zaufania, taśma branż | `swHero` — nowy układ |
| 2 | **Obietnice** (bez id) | 3 karty: Widzisz, zanim zapłacisz · Stała cena na piśmie · Wszystko jest Twoje | zastępuje `guarantees` (#zasady) |
| 3 | **Z czym do nas przychodzisz?** (`sytuacje`) | 4 sytuacje (Nie mam strony / Mam starą stronę / Toniemy w Excelach / Za dużo przepisywania) z ceną „od”, linkiem „Zobacz ofertę →” i makietą w pierwszej | z intencji hero (`SwHero.intents`) |
| 4 | **Cztery rzeczy. Zrobione najlepiej.** (`oferta`) | bento 4 kart: Strony internetowe (warianty), Przebudowa strony (przed/po), Systemy dla firm (warianty), Automatyzacje i AI (warianty) — makiety zmieniają się na żywo | zastępuje `areas` (8 obszarów) i `popular` (12 rzeczy) |
| 5 | **Tak może wyglądać Twoja strona albo system** (`podglady`) | showroom: 10 branż (lista z ikonami) × 3 widoki (Strona / Na telefonie / System) + 4 cechy + „Policz dla tej branży” | zastępuje `livePreviews` |
| 6 | **Nie składamy stron z szablonu. Piszemy je pod Twoją firmę.** (`technologia`) | jedna sekcja, 4 zakładki: Szybka / Bezpieczna / Widoczna w Google i AI / Na czym budujemy — wizualizacja + tekst + porównanie „WordPress z wtyczkami” vs „Strona od PRO-KOM” + liczba | łączy `howWeBuild` + `whyNotWordpress` + `technologies` |
| 7 | **Policz swój projekt. Bez dzwonienia.** (`dobierz`) | kreator v3 (§7) | `wizard` |
| 8 | **Cena i termin. Od razu.** (`cennik`) | filtry kategorii z licznikami + siatka kart z makietą (cena „od”, termin, kategoria) → okno oferty | nowy na głównej (dane z `Solutions`) |
| 9 | **Większość płacisz po odbiorze** (`proces`) | 5 etapów (Rozmowa 30 min · Podgląd i wycena 5–7 dni · Budowa od 1 tyg. · Wdrożenie 1–2 dni · Opieka co miesiąc) + karta szczegółów etapu (cena etapu, np. „0 zł”) | `process` (restyl) |
| 10 | **Zanim napiszesz** (`faq`) + **Napisz po swojemu** (`kontakt`) | dwie kolumny: FAQ (6 pytań, pierwsze otwarte) i formularz (tematy jako chipy, opis, imię i firma, e-mail lub telefon, klauzula, „Wyślij wiadomość →”) | `faq` + `swContact` |

Pas „Zacznij od podglądu” i stopka — powłoka (§3.5–3.6).

### 4.1 Hero — szczegóły
- **Warstwa kosmiczna** (`.au-cos` w `aurora.css`): dwie warstwy gwiazd (różne tempo), 3 „wstęgi” zorzy (rozmyte elipsy fioletu, wolny dryf), 2 orby z pierścieniem, wiązka światła, „planeta” (łuk horyzontu) pod karuzelą; poświata oddechu za H1 (`auBreath` 9 s); siatka 72 px z maską radialną. Wszystko `pointer-events:none`, `aria-hidden`, tylko `transform`/`opacity`.
- **Pigułka:** „Dla każdej firmy, z każdej branży · od 2004”.
- **H1:** „Zrobimy Ci” + w nowej linii **zmieniające się słowo** z gradientem: stronę wizytówkę. / stronę firmową. / rozbudowaną stronę. / stronę hotelu. / stronę restauracji. / system dla firmy. / automatyzacje i AI. — wjazd słowa z rozmycia (`kinIn`), zmiana razem ze slajdem.
- **Lead:** „Strony, przebudowy, systemy i automatyzacje. Najpierw klikasz podgląd swojego projektu, potem decydujesz.”
- **Panel wyboru** (`.au-cmd`): pole „Czego potrzebuje Twoja firma? **<nazwa>**▍” (kursor miga) + **7 kafli w jednym rzędzie** (ikona w kwadracie, numer 01–07, nazwa; aktywny: ikona w gradiencie z poświatą, pasek postępu 4,2 s na dole kafla). ≤ 960 kafle przewijane poziomo (snap), bez osieroconego kafla.
- **Karuzela makiet** (`.au-flow`): 7 okien (makiety §8), aktywne na środku (760 × 499 na 1440; 660 × 433 ≤ 1200; 560 × 368 ≤ 960; 340 × 223 ≤ 600), sąsiednie po bokach w 3D (`rotateY ±28°`, `translateZ −420 px`, krycie .5), pozostałe ukryte. Zmiana co **4,2 s** (stop po kliknięciu kafla, wznowienie po 12 s bez interakcji; stop poza ekranem i przy reduced motion). Aktywne okno: szklana obwódka (gradient fiolet→przezroczysty), przebłysk światła po zmianie. **Bez dymków / chipów na slajdach.** Makieta zawsze cała w ramce (nic nie ucięte — sprawdzone na 4 szerokościach).
- **Kapsuła podpisu** pod karuzelą: numer slajdu, nazwa + opis, cena „od” + termin (z `Solutions`), „Zobacz ofertę →” (okno oferty).
- **Pasek zaufania:** 5–7 dni · podgląd do klikania | < 2,5 s · strona na telefonie | 100% · kod i dane Twoje.
- **Taśma branż** (marquee, pauza po najechaniu, reduced motion = statycznie): lista branż z `Industries` (Software) albo z `home.hero.industries`.
- Dane: `SoftwareSettings.home.hero` (nowy klucz): `slides[]` = { `word` (np. „stronę firmową.”), `solution` (slug → nazwa, cena, termin), `mockup` {kind, variant}, `caption` }, `pill`, `lead`, `trust[]`, `industries[]`. Kolejność i liczba slajdów z danych (plansza: 7).
- Telefon: H1 ~40 px, panel wyboru jako przewijany rząd kafli, okno 340 px bez bocznych slajdów (widać krawędzie), kapsuła podpisu pod spodem w kolumnie, przycisk na całą szerokość.

### 4.1a Hero — jak to zbudować (priorytet nr 1 wyglądu, decyzja 06.11)
Hero to wizytówka linii — ma wyglądać **1:1 jak plansza `AU-pc`** (i `AU-laptop`/`AU-tablet`/`AU-mobile`), w obu motywach. Porównanie zrzutem na 4 szerokościach w trzech momentach animacji (slajd 1, 4, 7) jest warunkiem odbioru sesji.
- **Podział komponentów:** `SwHeroV24` (server) renderuje tekst (pigułka, H1 ze słowem pierwszego slajdu, lead), pasek zaufania, taśmę branż, warstwę kosmiczną (`HeroCosmos`, czysty CSS) i **wszystkie 7 makiet** (server components). Interakcję robi jeden mały klient `HeroStage` (kafle, stan slajdu, zegar 4,2 s, klasy `r0/r1/r2/r3/rl/rx`, słowo H1, kapsuła podpisu, pauza po interakcji/poza ekranem, klawiatura ←/→, przesunięcie palcem na telefonie). Makiety dostaje jako `children` — klient nie ciągnie kodu makiet.
- **Pozycje 3D:** stan slajdu `i`, pozycja okna `r = (k − i + 7·9) mod 7` → `r0` środek, `r1` prawo, `r6` = `rl` lewo, reszta ukryta (`translateZ(−900px)`, `opacity 0`, `visibility hidden`). Wartości przesunięć/obrotów i wymiary okien na breakpointach — `wzorzec/aurora.css` (`.au-flow …`, bloki 1200/960/600 i „hero fix” na końcu pliku). Kontener `perspective: 2200px` (telefon 1200 px).
- **Okno makiety:** stały układ 640 × 420 skalowany do okna (`scale = szerokość okna / 640`; 1440: 1,1875 → 760 × 499), tekst wyrównany do lewej (nie dziedziczy wyśrodkowania hero), zaokrąglenie 18 px, aktywne: obwódka gradientowa (maska `content-box`), poświata `0 0 90px −24px` fiolet, przebłysk po zmianie (pas światła przejeżdża ukośnie).
- **Słowo w H1:** jeden `span` z kluczem slajdu → animacja wejścia `kinIn` (rozmycie 8 px → 0, `translateY 12px → 0`, 0,6 s `--ease`); gradient `em` z §1. Szerokość linii rezerwowana (`min-height:1.1em`), żeby H1 nie skakał.
- **Panel wyboru:** kafle `role="tablist"`/`role="tab"` + `aria-selected`; pasek postępu aktywnego kafla = `animation: auFill 4.2s linear` (restart przy zmianie przez klucz). Kursor w polu miga (`auBlink`).
- **Warstwa kosmiczna (`.au-cos` + `.au-hero::before/::after`):** gwiazdy (2 warstwy `radial-gradient` w tle, różne rozmiary i dryf), 3 wstęgi zorzy (`.rb` — rozmyte elipsy, `filter: blur`, dryf 18–26 s), 2 orby z pierścieniem (`.orb`), wiązka (`.beam`), łuk planety (`.planet` pod karuzelą), oddech poświaty za H1 (`auBreath` 9 s), siatka 72 px z maską. Wszystko z planszy — przenieś keyframes do `motion.css`, kolory do tokenów.
- **Reduced motion:** slajd 1 statycznie, brak zegara (kafle dalej przełączają ręcznie, bez animacji 3D — przenikanie), kosmos bez ruchu.
- **Testy:** vitest dla funkcji pozycji (`rankOf(k, i, n)`) i zegara (pauza/wznowienie); e2e: kliknięcie kafla 05 → H1 „stronę restauracji.”, aktywna makieta restauracji, podpis z ceną z `Solutions`; brak błędów hydratacji; zrzuty porównawcze.

### 4.2 Pozostałe sekcje
Treści: `TRESCI-v24.md` (§ Strona główna). Zachowania:
- **Bento oferty:** każda z 4 kart ma chipy wariantów; klik zmienia makietę (przejście krzyżowe) i cenę. Strony: Wizytówka, Firmowa, Rozbudowana, Landing page, Pensjonat, Restauracja. Systemy: Zamówienia, CRM, Czas pracy, Z Excela. Automatyzacje: SMS i e-mail, Faktury, Raporty, Asystent AI. Przebudowa: makieta „przed/po” z suwakiem (przeciągnij; automatyczne przesuwanie w pętli do pierwszej interakcji). „Szczegóły →” = okno oferty wariantu. Dane: `home.bento[]` = { tytuł, kategoria, warianty[{label, solution, mockup}] }.
- **Showroom branż:** lista 10 branż (ikona + nazwa; aktywna podświetlona), przełącznik Strona / Na telefonie / System, makieta branży, 4 cechy z ✓, „Policz dla tej branży →” (kreator z ustawioną branżą: `/dobierz?firma=<branża>`). Branże: Pensjonat/hotel/apartamenty · Restauracja/bar/kawiarnia · Budowlanka i remonty · Turystyka i atrakcje · Uroda i zdrowie · Warsztat i motoryzacja · Sklep i handel · Biuro i usługi dla firm · Produkcja i rzemiosło · Inna firma (dane: tablica `IND` w `aurora.js` → `home.showroom` albo `Industries.software`).
- **Sekcja techniczna (4 zakładki):** autoprzełączanie jak dziś (`useAutoTabs`), wizualizacje animowane: licznik prędkości „< 2,5 s” (wskazówka dojeżdża), tarcza bezpieczeństwa, wynik w Google/AI (karta wyniku), stos technologii (Next.js, Payload, PostgreSQL, serwer w Polsce). Pod spodem 2 karty porównania (szara: „WordPress z wtyczkami — motyw i wtyczki ładują się po kolei”; fioletowa: „Strona od PRO-KOM — treść w mniej niż 2,5 s, zmierzona przy odbiorze”).
- **Cennik na głównej:** filtry „Wszystko · 16 | Strony · 6 | Przebudowa i opieka · 3 | Systemy · 4 | Automatyzacje · 3” (liczniki z danych), karty 4 kolumny z makietą u góry, kategoria (eyebrow), nazwa, opis, cena „od” + termin; miesięczne „od 149 zł / mies.”; „wycena po rozmowie” dla pustej ceny (`priceDisplay.fallback`).
- **Proces:** lista 5 etapów (aktywny w akcencie) + karta „ETAP 01 · 30 MIN — Opowiadasz, jak pracuje firma. My słuchamy.” z ceną etapu. Dane: istniejące `home.process`.
- **FAQ + formularz:** FAQ jak dziś (`FaqSoftware`, dane `faq`), formularz = istniejący `ContactForm` (temat opcjonalny) w nowym wyglądzie; klauzula pod formularzem z linkiem do polityki; sukces → `/dziekujemy?nr=`.

---

## 5. Ruch premium (zastępuje SWV5/SWV7 tam, gdzie się różni)

### 5.1 Zasady
Tokeny ruchu z SWV7 zostają (`--ease-out`, `--spring`, czasy). Dochodzi (wzorzec `aurora.css` blok „v5: ruch premium”):
- **Wejście przy przewijaniu** (bez JS, `animation-timeline: view()`, `@supports`): eyebrow, H2, lead, karty szkła, kroki, elementy stopki — `opacity 0→1`, `translate 0 38px→0`, `scale .98→1`; kolejne karty z przesuniętym zakresem (`entry 2–18% → 60–84%`). **Animujemy właściwość `translate`, nie `transform`** — `transform` zostaje dla hover (unoszenie kart), więc nic się nie gryzie.
- **Gradient `em` w nagłówku** przesuwa się wraz z przewijaniem (`background-position`, `animation-range: entry 20% cover 40%`).
- **Przyciski:** przebłysk światła przy najechaniu (pseudo-element, `translate −120% → 120%`, 0,7 s), wciśnięcie `scale(.97)`.
- **Karty:** uniesienie 3–4 px + obrys akcentu przy najechaniu (tylko `(hover:hover) and (pointer:fine)`).
- **Przejścia między podstronami:** View Transitions (`@view-transition { navigation: auto }` albo mechanizm Next — sprawdź `node_modules/next/dist/docs/`; dziś jest `PageTransition` z SWV5): stara strona odjeżdża w górę z rozmyciem (0,32 s), nowa wjeżdża (0,55 s); **kapsuła i szyna zostają na miejscu** (`view-transition-name`).
- Reduced motion: wszystko powyżej wyłączone.

### 5.2 Przejazd do sekcji (szyna, kotwice, mega menu)
Istniejący `lib/software/smoothScroll` (SWV5) zostaje i dostaje: krzywą `easeInOutQuint`, czas 520–1250 ms zależny od odległości (`dist × 0,32`), odstęp pod kapsułą 104 px (telefon 78 px), przerwanie kółkiem/dotykiem/klawiszem. **Po dojechaniu „przybycie”:** eyebrow i H2 sekcji wjeżdżają z rozmycia (0,95 s), nad sekcją przelatuje fioletowa wiązka światła (2 px, poświata, 1,4 s). Aktywna pozycja szyny przechodzi płynnie. Fokus na sekcji + `pushState` jak dziś.

---

## 6. Oferta i okno oferty

### 6.1 Okno oferty (`SolutionDialog` — wygląd v24, plansza: klik dowolnej karty oferty/cennika)
Desktop: modal szkła (promień 28, tło przyciemnione + blur), telefon: arkusz od dołu. Zawartość (dane z `Solutions` + `SoftwareSettings.offer`): galeria makiet (duża + miniatury wariantów), kategoria, nazwa, opis, „Dla kogo”, „Co dostajesz” (lista ✓), 3 kafle (cena „od”, termin, opieka od), „W cenie” (chipy), przykład / „Potrzebujesz więcej?”, „Często łączone z” (powiązane), przyciski „+ Dodaj do wyceny” (Twój projekt) i „Zapytaj o tę ofertę →”. Ciężar danych bez zmian (SW v22) — zmienia się wygląd i miniatury (makiety zamiast SVG, §8).

### 6.2 `/rozwiazania` = „Oferta” (plansze `AU-oferta`, `AU-oferta-m`)
- Hero podstrony (ciemne, gradient): okruszki, eyebrow „Pełna oferta · <liczba> rozwiązań”, H1 „Oferta. **Cena i termin przy każdej pozycji.**”, lead.
- 4 kafle kategorii (01 Strony internetowe · 02 Przebudowa i opieka · 03 Systemy dla firm · 04 Automatyzacje i AI) — klik = filtr.
- Filtry (chipy z licznikami) + licznik „<n> rozwiązań z ceną” + istniejąca wyszukiwarka i stan w URL (`lib/software/catalog.ts` — zostaje).
- Siatka kart jak cennik na głównej (makieta, kategoria, nazwa, opis, cena, termin) → okno oferty.
- „Bez dopłat za rzeczy oczywiste”: 4 karty W cenie każdej strony (Wersja na telefon · SEO i dane dla AI · Panel po polsku · SSL i szybkość).
- **Kategorie:** v24 grupuje w 4 (strony / przebudowa i opieka / systemy / automatyzacje); dane mają 5 (`strony, systemy, aplikacje, automatyzacje, opieka`). Mapowanie: przebudowa = rozwiązania z kategorią `strony` i tagiem przebudowy + `opieka`; `aplikacje` → „Systemy dla firm”. Zrób mapowanie w `lib/software/catalog.ts` (jedno miejsce), bez zmiany enumu.

### 6.3 `/cennik`
Zostaje jako podstrona (link w stopce): hero podstrony + siatka cennika jak na głównej (wszystkie pozycje, zakładki = filtry) + poziomy opieki (149 / 299 / 790 zł z czasem reakcji — dane `levels`) + „Rodzaje audytu” + FAQ. Wygląd kart jak §4.2 „Cennik”.

---

## 7. Kreator v3 (`/dobierz` i sekcja `#dobierz`) — plansze `AU-kreator`, `AU-pc` § kreator

**Zastępuje kreator v22** (4 kroki: potrzeba → szczegóły → zakres → wynik + dodatki). Cel: inteligentny, intuicyjny, ogólny; **bez dodatków**; pytania zależne od rodzaju; klient może napisać po swojemu.

### 7.1 Kroki (zależne od grupy rodzaju)
| Grupa | Rodzaje (krok 1) | Kroki |
|---|---|---|
| `site` | Strona wizytówka · Strona firmowa · Rozbudowana strona · Landing page | Rodzaj → Branża → **Co już masz** → **Co ma umieć** → Wynik |
| `redo` | Przebudowa starej strony | Rodzaj → Branża → **Twoja strona** → **Co poprawić** → Wynik |
| `sys` | System dla firmy | Rodzaj → Branża → **Jak pracujecie** → **Co ma robić** (+ wielkość zespołu) → Wynik |
| `auto` | Automatyzacje i AI | Rodzaj → Branża → **Co ułatwić** (+ jakie programy) → Wynik |
| `idk` | Nie wiem jeszcze | Rodzaj → Branża → **Opisz** → Wynik |

- **Krok 1 Rodzaj:** 8 kafli (nazwa, opis, cena „od” z `Solutions`; „Nie wiem jeszcze” = 0 zł / rozmowa 30 min).
- **Krok 2 Branża:** 10 branż jak w showroomie (ikony) — opcjonalnie „Pomiń”.
- **Co już masz** (`site`): Domena · Logo · Zdjęcia · Teksty · Stara strona · **Zaczynamy od zera** (wyklucza pozostałe). **Wielkości zespołu NIE pytamy przy stronach** (tylko `sys`).
- **Co ma umieć** (`site`): lista zależna od rodzaju (`FEAT` w `aurora.js`) + 2 cechy z wybranej branży; SEO nie jest opcją — jest w cenie każdej strony (podpowiedź o tym w kroku).
- **redo:** dostęp do domeny / treści / logo / „Nie wiem, kto ma dostępy”; co poprawić: wolno się ładuje / źle na telefonie / nikt nie dzwoni z Google / trudno zmienić treści / przestarzały wygląd / bezpieczeństwo.
- **sys:** dziś: Excel / papier / gotowy program, który nie wystarcza / maile i telefony / dopiero zaczynamy; system ma: zamówienia, klienci i oferty, kalendarz, czas pracy, magazyn, faktury do programu, raporty, aplikacja dla pracowników; użytkownicy: 1–3 / 4–10 / 11–30 / 30+.
- **auto:** SMS i e-maile, faktury bez przepisywania, raporty, odpowiedzi AI, przypomnienia o płatnościach; programy: Subiekt lub inny do faktur, Excel, Gmail/Outlook, własny system, nie wiem.
- **idk:** tematy (Nie mamy strony, Wszystko w Excelu, Strona nic nie daje, Informatyk zniknął, Za dużo przepisywania, Nie wiem, od czego zacząć) + **pole „Opisz po swojemu”**.
- **Wynik:** rozwiązanie (z `Solutions`), cena „od” + termin, 3 punkty co dostajesz, **podsumowanie wyborów** (chipy), **inteligentna podpowiedź** (reguły `tip` w `aurora.js` — np. „Zaczynamy od zera? Pomożemy z domeną, logo i tekstami…”, „Najpierw sprawdzimy, czy Twój program da się rozbudować…”), pole „Coś jeszcze? Napisz po swojemu” (opcjonalne), adres strony (redo), imię i firma, e-mail lub telefon, klauzula, „Wyślij do wyceny →” → `/dziekujemy`.
- **Podgląd na żywo** (prawa kolumna, „Twój projekt na żywo · krok n z m”): makieta zależna od wyborów (rodzaj + branża → wariant; `redo` → przed/po; `sys` → panel wg branży; `auto` → przepływ wg wybranego automatu), nazwa, cena, 3 punkty, podpowiedź, „Zobacz pełną ofertę →”. Telefon: podgląd zwinięty w pasek ceny nad przyciskami „Wstecz / Dalej”.
- Pasek kroków z numerami (klikalne wstecz), pasek postępu, „Wstecz / Dalej” (Dalej aktywne po wyborze, gdzie wybór wymagany).

### 7.2 Dane
- `SoftwareSettings.wizard` — **nowy kształt v3** (Zod w `lib/software/wizard.ts`): `types[]` {id, group, solution, label, desc}, `groups` {site|redo|sys|auto|idk: steps[]}, `stepLabels`, `options` {have, featByType, redo, fix, today, sysf, sizes, auto, prog, desc}, `exclusive` (np. „Zaczynamy od zera”), `industries` (klucze + cechy), `tips[]` {when, text} (reguły jak dziś `recommend/honest` — dane, nie kod), `preview` (mapowanie → makieta), `send` (teksty). Ceny/terminy nadal przez `resultToSolutionSlug`/`solution`.
- **Zgłoszenie:** `Inquiries` typ `wizard` — pole `wizard` (JSON) dostaje odpowiedzi v3 (`type`, `industry`, `answers{…}`, `note`) + `items[].solution`; temat/opis dla maila z `send`. Zdarzenia analityki: `kreator_start`, `kreator_krok`, `kreator_wynik`, `kreator_wyslij` (bez `kreator_dodatek` — dodatki znikają).
- **Migracja danych:** stary kształt `wizard` w bazie odrzuci walidacja → migracja danych przepisująca `wizard` na v3 z seeda (jak SW7) + instrukcja w STAN (`pnpm -s software:wizard-json`).

---

## 8. Makiety (zastępują miniatury SVG na kartach, w hero, bento, showroomie, kreatorze, oknie oferty)

Wzorzec: `boards/Vis.dc.html` (komponent planszy). W kodzie: `src/sites/software/components/mockups/` — **server components bez JS** (animacje CSS), jeden komponent `Mockup` z `kind` + `variant`, rysowany w stałym układzie 640 × 420 i skalowany do kontenera (CSS `container`/`cqw` jak dziś `LivePreviews` albo `transform: scale` z obliczonym `--k`; bez mierzenia w JS). Rodzaje:

| kind | warianty | co pokazuje |
|---|---|---|
| `site` | wizytowka, firmowa, rozbudowana, landing, pensjonat, restauracja, przebudowa, budowlanka, turystyka, uroda, warsztat, sklep, biuro, produkcja | przeglądarka (pasek z adresem), nawigacja, ciemny/jasny hero z tytułem, leadem i przyciskami, widżet po prawej (formularz/menu/pokój/wyceny), 3 cechy na dole; **tło hero z ilustracją wariantu** (mapa z pinezką — wizytówka; zorza — firmowa; globus PL/EN/DE — rozbudowana; Gorce nocą z gwiazdami i księżycem — pensjonat; talerz z parą — restauracja; tarcza — landing; linie prędkości — przebudowa) |
| `dash` | zamowienia, crm, czas, excel | panel: boczne menu, 3 KPI, wykres słupkowy (słupki rosną po kolei), lista ostatnich ze statusami |
| `flow` | sms, faktury, raporty, ai | 3 węzły (kiedy → automat → efekt) z kropką płynącą po przewodzie, historia dzisiaj (wpisy wjeżdżają), rząd „Działa 24/7 · Pod kontrolą · Pełna historia” |
| `care` | — | opieka: dostępność 30 dni, kopie, aktualizacje |
| `before` | przebudowa | stara strona vs nowa z suwakiem |
| `phone` | jak `site` | telefon z wersją mobilną (+ opcjonalny toast „Nowe zapytanie”) |

**Zasada układu:** treść makiety mieści się w 640 × 420 przy fontach Archivo/Manrope (tytuł 27 px, 3 linie max); hero makiety elastyczny (flex), pas cech stały na dole — nic się nie ucina (to był błąd poprawiony 05.11). Teksty makiet = przykłady z `Vis.dc.html` (`V`, `D`, `F`) — w kodzie jako stałe w module makiet (to grafika, nie treść z panelu).
**Dane:** `Solutions.preview` = { `kind` (select), `variant` (select) } — nowe pola (migracja tylko dodająca); puste → dotychczasowa miniatura SVG (`thumbnail`) jako zapas. Seed ustawia `preview` dla 29 rozwiązań (mapa w `PRZEKAZANIE-v24.md` §5).

---

## 9. Podstrony

### 9.1 Darmowy audyt `/audyt` (plansze `AU-audyt*`)
Hero dwukolumnowe: H1 „Sprawdzimy Twoją stronę. **Za darmo.**”, lead, **formularz „Szybki audyt · 0 zł”** (adres strony + „Skanuj podgląd →”, imię, e-mail lub telefon, zgoda z linkiem do polityki, „Zamów darmowy audyt →” → `/dziekujemy`); po prawej **karta „Audyt strony · przykład”**: po „Skanuj” pasek skanowania przesuwa się, 5 wierszy (Szybkość, Telefon, Google i AI, Bezpieczeństwo, Dostępność) dostaje kolejno plakietki „do poprawy” / „dobrze” (to **demonstracja** z przykładowymi wynikami — podpis „przykład”; prawdziwy wynik przychodzi w raporcie). „Pięć rzeczy, które decydują, czy strona zarabia” (5 kart + karta wyróżniona „Wynik: raport”), „Trzy poziomy audytu” (Szybki 0 zł · Pełny 990 zł „Polecamy” · Strona + program albo dostępność 1 990 zł; ceny z danych `levels`, dopisek „Pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni”), „Jak wygląda darmowy audyt” (3 kroki). Istniejący `SwAuditForm`/`AuditForm` — nowy wygląd, ta sama logika.

### 9.2 O firmie `/o-firmie` (plansze `AU-firma*`) — szablon wspólny D2-4 + sloty Software
Kolejność: ciemne hero „Nie agencja z open space’u. **Firma z Rabki, od 2004 r.**” + karta **Wizytówka firmy** (dane z `CompanyData`: firma, adres, NIP, telefon, e-mail, godziny, umowa; „Dane sprawdzisz w CEIDG po numerze NIP →”) → liczby (2004 · **100+ firm z Podhala i Małopolski, które z nami pracują** — potwierdzone przez Krystiana 05.11, bez plakietki · 0 gotowych szablonów · 5 linii) → „Pięć rzeczy, które wpisujemy do umowy” (bento: duża karta 01 + 02–05 + pas „Mówimy wprost, gdy coś się nie opłaca.”) → **slot Software: „Freelancer, agencja czy PRO-KOM?”** (porównanie z przełącznikiem — istniejący `Compare`) → **slot Software: sekcja techniczna** „Nie składamy stron z szablonu…” (ta sama co na głównej) → „Jak to wygląda krok po kroku” (4 kroki) → „Pięć linii i marka PRO-KOM Gaming” (6 kart z kolorem linii, Software „Jesteś tu”) → „Nie musisz wierzyć nam na słowo” (CEIDG, Podglądy na żywo, Darmowy audyt, Opinie Google) → karta „Wpadnij do Rabki, ul. Orkana 16B.” (godziny, Wyznacz trasę, Kontakt, mapa).

### 9.3 Kontakt `/kontakt` (plansze `AU-kontakt*`) — szablon wspólny D2-4 + sloty Software
Ciemne hero: status godzin, H1 „Porozmawiajmy o **Twoim projekcie.**”, lead, „Najszybciej — zadzwoń” + **883 200 151** (duży, `tel:`) + „albo 788 986 074 · pn–pt 9:00–17:00” (drugi numer zostaje — decyzja 05.11), „Zadzwoń teraz” / „Opisz projekt ↓”, 3 kafle (1 dzień roboczy · e-mail · 30 min za darmo); po prawej karta: mapa, „Salon i biuro — ul. Orkana 16B”, godziny pn–pt / sobota / niedziela (**sobota i niedziela nieczynne** — v23), NIP + „Sprawdź w CEIDG →”. → **slot Software „Z czym dzwonisz?”** (3 karty: Nowa strona albo system → Kreator · Stara strona do przebudowy → Audyt · Zmiany i opieka → formularz) → formularz (istniejący `SwContactPage`: oś „Co dalej po wysłaniu” 4 kroki, „Wolisz klikać niż pisać?”, „Masz już stronę?”; tematy jako chipy; **„Twój projekt” zostaje**) → **slot Software „Kod nie zna granic. Kawa jest w Rabce.”** (zdalnie cała Polska, dojazd Podhale i Małopolska — chipy miejscowości + mapa zasięgu z pierścieniami) → „Każda linia ma swój zespół” (karty linii) → FAQ „Zanim zadzwonisz”.

### 9.4 Aktualności `/aktualnosci` (plansze `AU-aktualnosci*`)
Hero „Aktualności **bez lania wody.**”; filtry kategorii (chipy, działające: Wszystkie + kategorie) + licznik wpisów; **wpis wyróżniony** (duża karta: ilustracja kategorii, tag, tytuł, lead, data · czas czytania · autor, „Czytaj wpis →”); siatka 3 kolumn kart; CTA „Darmowy audyt Twojej strony” (zamiast pasa nad stopką). Ilustracje kategorii: `.au-pc-art` (orby + pierścień, barwa wg kategorii — §1 pkt 4). Wpis (`/aktualnosci/[slug]`) — bez planszy: hero podstrony + treść stylem `au-prose` (§9.6) + autor + źródła + powiązane. **Kategorie:** plansza: Poradnik, Strony, Systemy, Automatyzacje, Bezpieczeństwo; dziś `Posts.category` Software: Poradnik / Nowości / Realizacje → decyzja D7 w PRZEKAZANIE. Tytuły wpisów w planszy to **przykłady** — publikujemy tylko prawdziwe wpisy (reguła SWV8: link „Aktualności” tylko przy ≥ 1 opublikowanym).

### 9.5 Kreator `/dobierz` (plansze `AU-kreator*`)
Hero „Zobacz cenę i termin, **zanim zadzwonisz.**” + kreator v3 (§7) bez drugiego nagłówka sekcji + „Cztery kroki do startu” (01 Odpowiadamy · 02 Krótka rozmowa · 03 Podgląd i wycena · 04 Ty decydujesz).

### 9.6 Strony prawne (plansze `AU-polityka*`, `AU-regulamin*`, `AU-cookies*`, `AU-dostepnosc*`)
Wspólny układ: hero (okruszki, eyebrow, H1 z `em`, lead, plakietki: wersja, aktualizacja, czas czytania) → dwie kolumny: **spis treści sticky** (numerowany, + karta „Masz pytanie o dane?” z e-mailem i telefonem) + artykuł `au-prose` (H2 z numerem, akapity 16,5 px/1,75, listy z fioletowym znacznikiem, **tabele** (cele i podstawy, okresy przechowywania, lista zapisów), notki z ikoną). ≤ 960: spis jako przewijane chipy pod kapsułą. Treści: `TRESCI-v24.md` (projekt do akceptacji szefa/prawnika — patrz PRZEKAZANIE §7). Dane: bloki strony z panelu (`hero` + `richText` jak dziś `legal.ts`) — **tabele**: edytor nie ma tabel (SW11b) → dodaj prosty blok `swTable` (nagłówki + wiersze) albo wariant listy definicji; zdecyduj w SWA6 (preferuj blok — tabele RODO są czytelniejsze).
- `/polityka-prywatnosci` — 11 sekcji (administrator, dane, cele i podstawy, odbiorcy, okres, prawa, dobrowolność, decyzje automatyczne, statystyki i cookies, bezpieczeństwo, zmiany).
- `/regulamin` (**nowa**) — regulamin świadczenia usług drogą elektroniczną (art. 8 UŚUDE): 9 paragrafów.
- `/cookies` (**nowa**; koordynacja z D2-1b — szkic wspólny) — „nie śledzimy”, tabela zapisów (`pk-theme`, `pk-project`, sesja panelu), Umami bez cookies, treści zewnętrzne tylko po kliknięciu.
- `/dostepnosc` (**nowa**; koordynacja z D2-1b) — deklaracja: WCAG 2.1 AA, co zrobiliśmy, ograniczenia, zgłoś barierę, dostępność salonu.
- `/mapa-strony` — 6 grup kart (Strona główna, Oferta, Narzędzia, Firma, Informacje, Linie PRO-KOM) z linkami.

### 9.7 Dziękujemy `/dziekujemy` i 404
- **Dziękujemy:** warstwa kosmiczna, rysujący się znaczek ✓ (okrąg + ptaszek, `stroke-dashoffset`), „Zgłoszenie przyjęte · nr PKS-…”, H1 „Dziękujemy. **Odezwiemy się w 1 dzień roboczy.**”, 3 karty kroków, przyciski (Zobacz podglądy · Aktualności · telefon). Bez pasa nad stopką. `noindex`.
- **404:** „4 [planeta] 4” (kula w gradiencie z pierścieniem, unosi się), „Błąd 404 — Tej strony **tu nie ma.**”, pole wyszukiwania (otwiera `SearchDialog`), 6 kafli (Oferta, Kreator 60 s, Darmowy audyt, Podglądy, Aktualności, Kontakt), „Strona główna →” + telefon. Status HTTP 404. Bez pasa nad stopką.

### 9.8 Podstrony bez planszy v24 (restyl na system v24, bez zmiany treści i układu informacji)
`/rozwiazania/[slug]`, `/dla-branz/[branza]`, `/miejscowosci/[miasto]`, wpis aktualności, `/jedna-firma` (decyzja D2 — domyślnie przekierowanie 301 na `/o-firmie#linie`). Zasady: hero podstrony jak `/rozwiazania` (ciemne z poświatą, H1 z `em`), sekcje na kartach szkła, nagłówki eyebrow + H2 z `em`, przyciski i chipy v24, makiety zamiast miniatur SVG, ruch §5. Porównanie: z najbliższą planszą v24 (np. rozwiązanie ↔ okno oferty + `AU-oferta`, branża ↔ showroom).

---

## 10. Telefon (≤ 600) — skrót różnic (pełne ekrany: plansze `*-390-*`, `AU-mobile*`)
- Hero: H1 ~40 px, pigułka, lead, panel wyboru w poziomym przewijaniu, karuzela tylko środkowa makieta (340 × 223), kapsuła podpisu w kolumnie z przyciskiem na całą szerokość, pasek zaufania 3 kolumny, taśma branż.
- Karty sekcji w kolumnie; cennik i karty linii w karuzelach (snap); liczby w O firmie 2 × 2; pas „Mówimy wprost” w kolumnie; tabele prawne z mniejszym paddingiem (przewijane w poziomie, gdy trzeba).
- Dolny pasek i arkusze (§3.7). Bez poziomego przewijania przy 360 px.

## 11. Dostępność
- Kontrast AA w obu motywach (także tekst na szkle i na gradientach — test §1).
- Fokus widoczny (`outline 2px` akcent, offset 3 px); wszystkie interakcje klawiaturą (kafle hero = `role="tab"`, karuzela = przyciski z `aria-label`, przełączniki = `aria-pressed`/`aria-selected`).
- Karuzela hero: `aria-live="polite"` tylko na podpisie (nie na makietach), pauza po fokusie; makiety `aria-hidden` z tekstem obok (nazwa/opis w kapsule podpisu).
- Formularze: etykiety (nie tylko placeholdery — plansza skraca, kod ma `label`), błędy jak dziś (`FieldError`).
- Reduced motion: §5.

## 12. Wydajność — płynność bez cięcia efektów
**Decyzja Krystiana 06.11.2026:** hero i makiety Software mają wyglądać dokładnie jak na planszach — **Lighthouse nie jest kryterium odbioru strony głównej Software** (mierzymy i zapisujemy wynik w PR, ale nie blokuje). Podstrony: dalej staramy się o ≥ 90, bez upraszczania wyglądu. Techniki poniżej służą **płynności** (60 fps, bez szarpania i skoków), nie oszczędzaniu na efektach:
- Karuzela: wszystkie 7 makiet wyrenderowane od razu (żadnego „doczytywania” przy zmianie slajdu), animacje tylko `transform`/`opacity`/`filter` z `will-change` na aktywnych oknach; przejście 1,1 s `--ease`.
- Warstwa kosmiczna: pseudo-elementy i warstwy z `transform/opacity` (GPU), pełny efekt jak w planszy; canvas/WebGL dopuszczalny tylko, jeśli CSS nie da tego samego efektu — wtedy z uzasadnieniem w PR (to nowa ruchoma część).
- Autoprzełączanie i animacje kosmosu pauzują poza ekranem (`IntersectionObserver`) i na ukrytej karcie (`visibilitychange`) — wracają od razu po powrocie.
- Rezerwuj wysokość hero, karuzeli i makiet (CLS 0) — H1 i pigułka renderowane od razu z serwera, kreator i okno oferty leniwie (ADR-023).
- Makiety = HTML/CSS + inline SVG, bez obrazów rastrowych.
- `backdrop-filter`: kapsuła, szyna, okna, dolny pasek, panel wyboru hero; karty sekcji — półprzezroczyste tło (wygląd ten sam, mniej przeliczeń).

## 13. SEO i analityka
- Tytuły i opisy — istniejące `seo.ts`; nowe strony prawne: tytuły „Regulamin | PRO-KOM Software” itd., `noindex` dla `/dziekujemy`. Dane strukturalne bez zmian (Service, FAQPage, BreadcrumbList); hero nie generuje `Service` dla slajdów.
- Zdarzenia Umami (lista w `lib/analytics/events.ts`): zostają; dochodzą `hero_slajd` (klik kafla, z numerem), `oferta_wariant` (bento), `branza_podglad` (showroom), `audyt_skan` (demo skanu); usuwasz `kreator_dodatek`. Strażnik danych bez zmian (bez danych osobowych).
