# Software — SWA14: hero bez znikania, okno oferty bez „maskary”, płynność z najwyższej półki, Pulpit firmy (12.11.2026)

Zgłoszenie Krystiana po SWA13. Cel: strona ma działać płynnie i szybko na każdym urządzeniu, z poczuciem premium, i nic nie może się zaciąć ani przyciąć. Do tego zamiana 4. sytuacji na stronie głównej na **panele i pulpity dla firm** oraz nowy slajd hero.

Pomiary: `https://prokomsoftware.pl/` w Chrome na PC (karta pomiarowa ma bardzo szerokie okno, więc bezwzględne czasy klatek są zawyżone; liczą się przebieg i proporcje).

> **Uwagi z rozpoznania kodu (13.11, sesja SWA14):**
> - Na Software karuzela to `.hx-flow` + `.hx-win[data-rank]` (klasa `.hx-deck` jest tylko w Instalacjach) — maska krawędzi idzie na `.hx-flow`.
> - `view-transition-name` kapsuły (`sw-header`) i dolnego paska (`sw-tab-bar`) **zostają**: używają ich przejścia między stronami (`src/sites/software/PageTransition.tsx`) i przełącznik motywu. Po usunięciu View Transitions z okna oferty kapsuła nie ma już jak wisieć nad oknem (§2.4 rozstrzygnięty).
> - Slajdy hero i sytuacje głównej są w bazie (`software_settings.home`); na staging i produkcję trafiają migracją danych z warunkami (PR 3), nie ręcznie w panelu.

## 1. Hero: boczne okna znikają przy zmianie slajdu (P0)

**Pomiar** (przezroczystość okien co 150 ms przy automatycznej zmianie slajdu):

```
przed:  rl 0.50 | r0 1.00 | r1 0.50
po:     rx 0.50 | rl 1.00 | r0 0.50 | r1 0.00   ← prawe okno gaśnie do zera
```

Przy każdym przejściu okno odchodzące z jednej strony **gaśnie do 0 w środku kadru**, a nowe pojawia się z 0 po drugiej stronie. Stąd wrażenie, że okna boczne znikają.

**Jak ma być:** karuzela ciągła, jak bęben.

- 5 pozycji: `skrajne-lewe · lewe · środek · prawe · skrajne-prawe`. Skrajne leżą **za krawędzią sceny**, a krawędź wygasza maska (`mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)`).
- Przy zmianie slajdu **wszystkie okna przesuwają się o jedną pozycję jednocześnie**, z tym samym czasem i krzywą (`transform` + `opacity`, jeden `--dur-hx-slide`, np. 700 ms, `cubic-bezier(.22,.8,.2,1)`). Okno, które odchodzi, wyjeżdża za krawędź i tam gaśnie pod maską. Nowe wjeżdża zza drugiej krawędzi już z boczną jasnością (0,5).
- **W widocznej części sceny żadne okno nie ma przezroczystości < 0,45** w żadnej klatce przejścia (test e2e próbkujący co 50 ms).
- Strzałki ← → i kropki: to samo przesunięcie w obu kierunkach.
- Telefon (≤ 600 px): zostaje jedno okno z SWA12b (przenikanie + przesunięcie), bez zmian.
- Tylko `transform` i `opacity`. `will-change: transform` wyłącznie na czas przejścia, bez filtrów na oknach w ruchu.

## 2. Okno oferty: „maskara” przed pojawieniem się (P0)

**Co widać** (zrzut Krystiana, 1440): przez ułamek sekundy na siebie nakładają się kapsuła nagłówka, tekst strony „Oferta. Cena i termin przy każdej pozycji.”, filtry i karty katalogu oraz treść okna (nazwa, cena, makieta), bez tła i bez przyciemnienia.

**Przyczyna** (`offerTransition.ts` → `openOfferFrom`): otwarcie idzie przez **View Transitions API** (makieta karty „rośnie” w makietę okna).

- Na czas przejścia przeglądarka rysuje w warstwie nakładki elementy z `view-transition-name`. Na stronie mają je, poza makietą, **`.cap-wrap` (`sw-header`)** i **`nav` (`sw-tab-bar`)**. Dlatego kapsuła wisi nad oknem.
- Samo okno (`<dialog>` w top layer) jest w tym czasie żywe pod nakładką, ze startowym stanem wejścia (przezroczyste tło, backdrop jeszcze niewidoczny).
- Pomiar: okno w DOM po 168 ms, ale potem 3 długie klatki (~1 s każda w karcie pomiarowej) **bez skryptu (0 ms)**. To koszt przechwycenia i składania warstw przejścia przy dużym, ciężkim oknie (527 elementów).

**Jak ma być:**

1. **Bez View Transitions przy otwieraniu okna oferty.** Proste, eleganckie wejście w CSS: backdrop `opacity 0 → 1` w 180 ms, panel `translateY(16px) scale(.985) → 0/1` + `opacity` w 240 ms, `cubic-bezier(.2,.8,.2,1)`. Zamknięcie odwrotnie w 160 ms. To samo na każdej stronie, z której okno się otwiera (główna, `/rozwiazania`, branże, miejscowości).
2. **Pierwsza klatka lekka:** od razu nagłówek okna, nazwa, cena i makieta. Reszta treści (zakres, „Jak to wygląda”, FAQ, „Często łączone”) dochodzi w następnej klatce lub w `startTransition`. Animacje makiety ruszają **po** wejściu panelu (`animationend` / 240 ms), nie w trakcie.
3. Przełącznik **Komputer | Telefon**: też bez View Transitions. Ramka zmienia się przez `transform: scale` i przenikanie (180 ms).
4. `view-transition-name` na `.cap-wrap` i `nav` (Software): usunąć, jeśli Software nie ma przejść między stronami. Sprawdzić: żadne inne miejsce ich nie używa. → **Rozstrzygnięte: zostają** (przejścia między stronami, uwaga na górze).
5. Test e2e: od kliknięcia karty do pełnej widoczności panelu (opacity 1) ≤ 300 ms. W żadnej klatce między kliknięciem a końcem wejścia kapsuła nie jest nad backdropem: zrzut w 120 ms pokazuje przyciemnione tło i panel, bez tekstu strony na wierzchu.

## 3. Płynność „z najwyższej półki”: budżety i reguły (P0, cała strona)

Po SWA12–13 ruch poza ekranem stoi, prefetch jest przy zamiarze, DOM głównej ma 2225 elementów. Zostaje domknięcie **budżetów**, które pilnuje CI.

**Budżety (główna i `/rozwiazania`, telefon średniej klasy, Chrome, 4G):**

| Miara                                                                    | Cel                                                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| LCP                                                                      | ≤ 2,0 s                                                                |
| INP (kliknięcie karty, otwarcie okna, zakładki, kreator)                 | ≤ 100 ms                                                               |
| CLS                                                                      | ≤ 0,02                                                                 |
| Długie klatki > 50 ms przy przewijaniu od góry do stopki                 | 0 poza pierwszym ekranem                                               |
| Otwarcie okna oferty                                                     | 0 klatek > 50 ms po kliknięciu (poza jedną klatką renderu ≤ 80 ms)     |
| JS głównej przed interakcją                                              | nie więcej niż po SWA13b (zapisać liczbę w `docs/jakosc.md`)           |

**Reguły ruchu (do `ZMIANY-v24.md` §5, „Ruch — zasady wydajności”):**

- Animujemy **tylko `transform` i `opacity`**. Wyjątek z komentarzem: `sw-em` i `sw-rise-blur` na PC (decyzja SWA12). Bez animacji `width`, `left`, `top`, `height`, `background-position`, `filter` na telefonie.
- Ruch nieskończony **tylko na ekranie** (`data-still`, SWA12a/13a). Każdy nowy element ruchu dostaje ten sam mechanizm.
- Rozmycia (`backdrop-filter`) tylko na kapsule, dolnym pasku i backdropie okna. Na elementach w ruchu nigdy.
- Okna i arkusze: wysokości w `svh`, nie `dvh` (SWA12a).
- Każde wejście/wyjście ≤ 300 ms, przewijanie i ślizg kotwic 500–700 ms z `ease-out`. Jedna skala czasów z tokenów `--dur-*`.

**Kontrola w CI (nowy test `tests/e2e/software-wydajnosc.spec.ts`):**

- licznik długich klatek (Long Animation Frames API w Chromium) przy przewinięciu głównej z CPU throttling 4×: 0 klatek > 100 ms poza pierwszym ekranem (próg CI łagodniejszy niż budżet, bo maszyna CI),
- `document.getAnimations()` bez animacji `running` animujących właściwości spoza listy (`transform`, `opacity`, `translate`, `scale`, `rotate`; wyjątki z listy),
- otwarcie okna oferty: czas do pełnej widoczności i brak klatek > 100 ms.

**Serwer:** Brotli w Nginx tylko wtedy, gdy obraz proxy ma moduł bez przebudowy (decyzja 11.11). Inaczej zostaje gzip.

## 4. Strona główna: zamiana 4. sytuacji na „Pulpit firmy” + nowy slajd hero (P1)

### 4.1 Dziś

Karta „04 · Za dużo przepisywania” (`homeV24.ts` → `situations.items[3]`) prowadzi do `powiadomienia-sms-i-e-mail`. To rozwiązanie nie ma ceny (`priceFrom: null`), więc w miejscu ceny stoi **„Zapytaj o wycenę” dużym fioletowym krojem ceny**. Wygląda jak nagłówek, a nie jak informacja. Problem dotyczy każdego miejsca, gdzie rozwiązanie nie ma ceny (aplikacje, automatyzacje, audyt).

**Poprawka ogólna:** gdy brak `priceFrom`, w slocie ceny stoi mała plakietka „Wycena po rozmowie” (kolor `ink-2`, krój zwykły, ten sam co „od 2 tygodni”), nie krój ceny.

### 4.2 Nowa karta 04 (treść)

- **Krótko (zakładka):** `Brak liczb na bieżąco`
- **Pytanie:** `Ile zarobiliśmy w tym miesiącu? Odpowiedź zajmuje pół dnia`
- **Odpowiedź:** `Pulpit firmy zbiera sprzedaż, zlecenia, koszty i pracę zespołu na jednym ekranie. Liczby odświeżają się same: sprawdzasz je w telefonie w 10 sekund, a w poniedziałek o 7:00 raport przychodzi sam.`
- **Cena / termin w karcie:** `od 3 490 zł` · `od 3 tygodni` (z `Solutions`, po akceptacji szefa, §4.5)
- **Link:** `Zobacz pulpit →` (otwiera okno oferty `pulpit-firmy`)
- **Makieta (nowy wariant `dash: 'pulpit'`):** jasny pulpit w stylu makiet v24.
  - 4 kafle KPI: „Przychód · listopad **184 200 zł** ↑ 12%”, „Zlecenia w toku **37**”, „Do zapłaty **3 faktury**”, „Marża **31%**”.
  - Wykres słupkowy tygodnia (pn–nd) z wyróżnionym dniem.
  - Lista „Wymaga uwagi”: „2 zlecenia po terminie”, „Faktura FV/11/082 — 7 dni po terminie”, „Ekipa B — 96% grafiku”.
  - W rogu plakietka „na żywo” z kropką (`mk-blink` tylko na ekranie).
  - Dane przykładowe jak w innych makietach (bez prawdziwych firm).
- Dotychczasowa treść o SMS-ach i AI zostaje w ofercie (bento „Automatyzacje i AI”, rozwiązania 22–27). Nic nie znika z oferty.

### 4.3 Nowy slajd hero (8.)

- Słowo w H1 „Zrobimy Ci …”: **`pulpit firmy.`** (krótkie, mieści się w 1 wierszu na 360 px).
- Podpis slajdu: `08 · Pulpit firmy` / `Sprzedaż, zlecenia i koszty na jednym ekranie. Na żywo.`
- Kafel w rzędzie kafli hero: `Pulpit firmy` (ikona wykresu), wybiera slajd 8.
- Okno: ta sama makieta `dash: 'pulpit'` w ramce przeglądarki (PC) i telefonu (telefon).
- Kolejność slajdów: po „System dla firmy”, przed „Automatyzacje i AI”.

### 4.4 Rozwiązanie w ofercie (zamiast „Raporty dla szefa”)

Przebudowa rozwiązania 26 `raporty-dla-szefa` na pełnoprawny system z ceną:

| Pole                     | Wartość                                                                                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`                   | `pulpit-firmy` (stary adres → **301** przez kolekcję `Redirects`: `/rozwiazania/raporty-dla-szefa` → `/rozwiazania/pulpit-firmy`; parametr `?rozwiazanie=raporty-dla-szefa` mapowany w oknie na nowy)        |
| `name`                   | `Pulpit firmy i raporty`                                                                                                                                                                                       |
| `label` / `category`     | `System` / `systemy` (licznik kategorii: Systemy 11, Automatyzacje 4)                                                                                                                                          |
| `tag`                    | `LICZBY NA ŻYWO`                                                                                                                                                                                               |
| `lead`                   | `Sprzedaż, zlecenia, koszty i zespół na jednym ekranie. Na komputerze i w telefonie, bez Excela i bez dzwonienia po ludziach.`                                                                                 |
| `features`               | `Wskaźniki Twojej firmy na żywo` · `Raport co poniedziałek o 7:00` · `Alert, gdy coś się opóźnia`                                                                                                              |
| `forWhom`                | `właściciele i kierownicy, którzy chcą widzieć firmę w liczbach`                                                                                                                                               |
| `priceFrom` / `leadTime` | `3490` / `od 3 tygodni`                                                                                                                                                                                        |
| `included`               | `Pulpit z 6–8 wskaźnikami ustalonymi z Tobą` · `Dane z jednego źródła: Twój program, Excel albo nasz system` · `Raport e-mailem co tydzień` · `Do 5 użytkowników, komputer i telefon`                          |
| `moreExamples`           | `kolejne źródła danych (sklep, księgowość, CRM)` · `alerty SMS` · `osobne widoki dla kierowników` · `eksport PDF dla wspólnika lub banku`                                                                       |
| `example`                | `Właściciel firmy usługowej rano otwiera telefon: przychód miesiąca, 37 zleceń w toku, 2 po terminie i jedna faktura do przypomnienia. Wcześniej zbierał to z trzech arkuszy w piątek po południu.`             |
| `related`                | `crm-dla-malej-i-sredniej-firmy`, `czas-pracy-i-rozliczenia`, `polaczenie-programow`                                                                                                                           |
| `keywords`               | `pulpit dashboard panel zarzadczy statystyki raport szef wlasciciel kpi wskazniki`                                                                                                                             |
| makieta oferty           | `dash: 'pulpit'` + `data-spot`: `kpi`, `wykres`, `uwaga`, `raport` (punkty ① ② ③ w oknie)                                                                                                                       |

### 4.5 Cena — propozycja do akceptacji szefa

**Rynek (polski, 2025–2026):**

- Wdrożenie Power BI dla małej lub średniej firmy: **średnio 7 357 zł, zakres 4 500–12 000 zł** (7 ofert, czas 2 tygodnie – 2 miesiące). Do tego licencje Microsoft kupowane osobno ([cenauslug.pl, 03.06.2026](https://cenauslug.pl/firma-i-biuro/wdrozenie-systemu-analitycznego-microsoft-power-bi)).
- Licencja Power BI Pro od 1.04.2025: **14 USD za użytkownika miesięcznie**, wcześniej 10 USD, podwyżka o 40% ([The Register, 2.04.2025](https://www.theregister.com/software/2025/04/02/microsoft-ups-the-price-for-power-bi-pro-by-40-percent/881318)). Przy 3 osobach to ok. 504 USD rocznie, co roku.
- Polska firma (Semtak) wycenia „mały panel z podstawowym dashboardem” na **1 199–2 399 GBP netto**, a „średni panel z dashboardem KPI i raportami” na 2 399–3 599 GBP ([semtak.pl](https://semtak.pl/en/services/custom-systems/admin-panels/)).

**Opcje:**

| Opcja                | Cena                  | Zakres                                                   | Ocena                                                                                                                                                                         |
| -------------------- | --------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A                    | od 2 990 zł netto     | 1 źródło, 4–6 wskaźników, bez raportu e-mail             | najniższy próg wejścia, ale poniżej naszych systemów i ryzyko „taniej zabawki”                                                                                                |
| **B (rekomendacja)** | **od 3 490 zł netto** | 1 źródło, 6–8 wskaźników, raport co tydzień, 5 użytkowników | równo z CRM / systemem zleceń (spójny cennik). Wyraźnie poniżej średniej rynku wdrożenia BI (7 357 zł) i **bez opłat za użytkownika** (hosting w opiece od 149 zł/mies.)   |
| C                    | od 4 990 zł netto     | 2 źródła danych + alerty                                 | lepsza marża, ale wyższy próg dla małej firmy z Podhala                                                                                                                       |

Każde kolejne źródło danych wyceniamy osobno, na piśmie, w 5–7 dni (tak jak `moreExamples` w innych systemach). **Cena idzie na stronę dopiero po akceptacji w Asanie** („SZEF · Software: cena Pulpitu firmy”).

## 5. Kolejność sesji (PR-y piętrowo)

1. **SWA14a `fix/swa14-okno-i-hero`** — §2 (okno bez View Transitions, lekka pierwsza klatka, przełącznik bez VT, nazwy VT) i §1 (karuzela ciągła). Najbardziej widoczne dla klienta.
2. **SWA14b `perf/swa14-budzety`** — §3: test wydajności w CI, reguły ruchu w ZMIANY-v24, próg JS w `docs/jakosc.md`.
3. **SWA14c `feat/swa14-pulpit-firmy`** — §4: plakietka zamiast „Zapytaj o wycenę”, makieta `dash: 'pulpit'`, nowe rozwiązanie + przekierowanie, karta 04, slajd 8. Cena: w seedzie `3490`, ale **na produkcję dopiero po akceptacji szefa** (do tego czasu `priceFrom: null` + plakietka).
