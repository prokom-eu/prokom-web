# prokombiznes.pl na telefonie — „jak nowoczesna aplikacja” (wzorzec M1, stan 25.10.2026, wizualizacja v126)

Jeden plik, w którym jest **wszystko o telefonie**: zasady, komponenty, każdy ekran i sposób sprawdzania. Uzupełnia `K3-KATALOG.md` §11 „M1” i `K31-ZMIANY.md` §10/§13. Gdy coś się różni — wygrywa ten plik.

Wzorzec: `k31/screens/App-*-390.webp` (29 ekranów) + klikalny prototyp `k31/boards/Aplikacja.dc.html` (ten sam komponent, wszystkie stany; plansze `App-*.dc.html` to ten prototyp z ustawionym ekranem). W prototypie szerokość jest płynna (360–430 px) — tak samo ma być w kodzie.

**Zasada nadrzędna:** poniżej 768 px strona **nie jest pomniejszonym desktopem**. To osobny układ: dolny pasek, arkusze, karty przewijane palcem, przyklejone akcje — jak w aplikacji sklepu albo banku. Desktop się nie zmienia.

---

## 1. Szkielet (każda strona)

| Element | Zachowanie |
|---|---|
| **Górny pasek** 60 px | Strona główna: logo · lupa · menu. Podstrony: ← wstecz + tytuł ekranu · lupa · menu. Półprzezroczysty z `backdrop-filter: blur(16px)`, przyklejony. Ikony 44 × 44. |
| **Dolny pasek zakładek** | 5 pozycji: **Start · Oferta · Szukaj · Zapytanie (licznik) · Kontakt**. Aktywna zakładka z pigułką. Ikona + podpis, cel ≥ 44 px, `padding-bottom: env(safe-area-inset-bottom)`. |
| **Przyklejona akcja** zamiast paska zakładek | Produkt („Dodaj do zapytania”), zestaw („Zapytaj o ten zestaw”), zapytanie („Wyślij zapytanie · N poz.”), kreator („Dalej” / „Pokaż mój zestaw”), wpis („Zapytaj o wdrożenie KSeF”). Pasek akcji z blur, nad safe-area. |
| **Arkusze od dołu** (`<dialog>`) | Menu, Filtry („Pokaż N pozycji”), punkt planu (film + szczegóły), w przyszłości koszyk. Uchwyt u góry, zamykanie: tło, przycisk, Esc, gest w dół. Focus trap, przywrócenie focusu. |
| **Menu (arkusz)** | 5 działów kafelkami · Gotowe zestawy · Plan Twojej firmy · Opieka IT · GoPOS · InsERT · Salony Lenovo/Dell · chipy: **O firmie · Dobierz zestaw · Branże · Aktualności · Kontakt i dojazd** · przełącznik Jasny/Ciemny · „Zadzwoń · 889 003 889”. |
| **Toast** | „Dodano do zapytania” itp., 2,6 s, nad paskiem, `role="status"`. |
| **Historia** | Przycisk wstecz wraca do poprzedniego ekranu z zachowanym przewinięciem (Next: `scroll` przywracany; listy z `key`). |

## 2. Komponenty mobilne (wspólne)

- **Hero ciemne** (`mgp`): karta 28 px zaokrąglenia, granat + miękkie poświaty (bez siatek), pigułka z kropką, H1 31 px z drugim wierszem w gradiencie, lead 14,5 px, **scena urządzeń** (wycięte zdjęcia z cieniem, bez kafelków), 2 przyciski obok siebie (główny biały, drugi szklany) — **teksty przycisków krótkie** (max ok. 16 znaków), `min-width: 0`.
- **Karuzela poziomo** (`hs`): `scroll-snap-type: x mandatory`, karta widoczna częściowo z prawej (sygnał „przewiń”), bez paska przewijania, przewijanie w obrębie sekcji (strona nigdy nie przewija się w bok).
- **Chipy** w przyklejonym pasku (kategorie, działy, kategorie wpisów) — przewijane w bok. **Wyjątek:** w konfiguratorze chipy się **zawijają** (wszystkie opcje widoczne, „Doradźcie” zawsze w zasięgu).
- **Karta produktu** 2 kolumny w siatce / 160–170 px w karuzeli: zdjęcie na tle studio, „+” do zapytania (44 px, zmienia się w ✓), marka, nazwa 2 linie.
- **Akordeony** FAQ (pierwszy otwarty), **kafle 2 × 2** (liczby, fakty, „Co dostajesz”), **oś czasu** (kroki, „dzień w lokalu”), **lista z ikonami** (zasady).
- **Formularze:** pola 48 px, `inputmode`/`autocomplete` (tel, name), etykiety nad polem, błędy pod polem, przycisk wysyłki przyklejony.

## 3. Ekrany (każdy ma plik wzorca)

| Ekran (adres) | Wzorzec | Najważniejsze |
|---|---|---|
| Start `/` | `App-Start-390`, `App-Start-ciemny-390`, `App-Menu-390` | hero z wyszukiwarką, 3 szybkie akcje, działy (kafle kolorowe), **Najczęściej wybierane** (karuzela 8: Ergo, K10, D3 PRO, ThinkBook 14, ThinkCentre neo, PolCard, Thermal HX, Subiekt nexo), Gotowe zestawy, Plan (wybór lokalu), Jak pracujemy, marki „Wszystkie N”. Ukryte: koło działów, „Pięć firm czy jedna”, długa lista branż. |
| Oferta `/oferta` | `App-Oferta-390` | działy → kategorie z liczbą pozycji |
| Kategoria | `App-Kategoria-390`, `App-Filtry-390` | przyklejone chipy podkategorii/serii, siatka 2 kol., arkusz filtrów „Pokaż N pozycji” |
| Produkt | `App-Produkt-390`, `App-Produkt-caly-390`, `App-Produkt-ergo-390`, `App-Produkt-ciemny-390` | galeria przesuwana palcem (kropki, miniatura „Film”), **krótki H1 + chipy „W tej karcie”** (karty wielomodelowe), 3 wyróżniki, „Twoja wersja”, **konfigurator 2.0** (numer + wyjaśnienie opcji, chipy zawijane, długie wartości jako wiersze, „Doradźcie”, gotowe konfiguracje wypełniają opcje, „wybrano X z N”), film (fasada), parametry (6 + „Pokaż wszystkie”), wersje (karuzela), FAQ, źródła; przyklejone „Dodaj do zapytania”. |
| Salon marki | `App-Marka-390`, `App-Marka-Dell-390` | hero, przyklejone działy, karuzela serii, dobór w 3 pytaniach |
| Plan Twojej firmy | `App-Plan-390`, `App-Plan-punkt-390`, `App-Plan-apteka-390` | rzut przewijany, punkty ≥ 44 px z numerami, arkusz punktu: film na górze, szczegóły, ‹ › |
| GoPOS | `App-GoPOS-390` | **hero 2.0** (scena urządzeń, „Umów prezentację” + „Film”, kroki 2 × 2 podświetlające urządzenia), fakty 2 × 2, pakiet, sprzęt, filmy, zestawy, wdrożenie, FAQ |
| InsERT | `App-InsERT-390` | dobór Subiekta, porównanie (karuzela kart), KSeF, **InsPunkty** (kalkulator: presety, liczniki ± 40 px, wynik, pasek puli) |
| Zestawy / zestaw | `App-Zestawy-390`, `App-Zestaw-390` | lista z filtrem grup, zestaw z elementami i opcjami, „Zapytaj o ten zestaw · N poz.” |
| Szukaj | `App-Szukaj-390` | pole z autofocusem, popularne, wyniki na żywo, „Zapytaj o X” |
| Zapytanie | `App-Zapytanie-390` | lista z ilością (− +) i „Usuń” (44 px), formularz, „Wyślij zapytanie · N poz.” |
| Kontakt `/kontakt` | `App-Kontakt-390` | hero z dużym numerem (biała karta = dzwonienie jednym dotknięciem), WhatsApp / stacjonarny / e-mail, „Z czym dzwonisz?”, mapa dojazdu + „Wyznacz trasę”, skrót O firmie + „Więcej o PRO-KOM”, FAQ, dane firmy |
| **O firmie** `/o-firmie` | **`App-OFirmie-390`** (nowy) | hero ze sceną produktów, Zadzwoń / Dojazd, liczby 2 × 2, 8 zasad (lista z ikonami), 4 linie (karuzela, Biznes wyróżniony), autoryzacje (logotypy 2 + 3 kol.), CTA |
| **Opieka IT** `/opieka-it` | **`App-Opieka-390`** (nowy) | hero z „panelem opieki” (statusy), „Umów przegląd” + „Zadzwoń”, tagi, 4 kroki, „Co dostajesz” 2 × 2, karta „Bezpłatny przegląd IT”, FAQ. **[SZEF] treści do akceptacji** — układ obowiązuje. |
| **Branża** `/branze/<slug>` | **`App-Branza-390`** (nowy, gastronomia) | hero ze sceną, „Dobierz zestaw” + „Zadzwoń”, tagi, sprzęt i programy (karuzela kart), „Dzień w lokalu” (oś czasu), zestawy branży, FAQ, inne branże. Ten sam szablon dla handlu i noclegów. |
| **Kreator** `/kreator` | **`App-Kreator-390`, `App-Kreator-wynik-390`** (nowe) | jedno pytanie na ekran, pasek postępu „Krok X z 3”, kafle 2 kol. z ✓ (pytanie 3 wielokrotnego wyboru), przyklejone „Wstecz / Dalej” („Dalej” nieaktywne bez odpowiedzi); **wynik = gotowy zestaw** (grupa + wielkość), „Dobierz też” (Wi-Fi, kopie wg odpowiedzi), inne zestawy branży, „Zapytaj o ten zestaw” (dodaje elementy obowiązkowe z notatką „Zestaw: …”). |
| **Aktualności** `/aktualnosci` | **`App-Aktualnosci-390`** (nowy) | przyklejone chipy kategorii, wyróżniony wpis (ciemna karta), lista wpisów (kategoria · data, tytuł) |
| **Wpis** | **`App-Wpis-390`** (nowy) | kategoria · data · czas czytania, H1 25 px, ramka „W skrócie”, nagłówki z numerami, tekst 16 px / 1,62, źródła i data sprawdzenia, przyklejone CTA z tematu wpisu |
| Strony prawne, mapa strony | (bez planszy) | szablon jak Wpis: kolumna tekstu 16 px, spis treści na górze jako akordeon |

## 4. Wymagania techniczne (Definition of Done każdej sesji z UI)

1. **Zero poziomego przewijania strony** przy 360, 390 i 414 px: `document.scrollingElement.scrollWidth <= innerWidth` (test Playwright na każdej trasie). Przewijanie w bok tylko wewnątrz karuzel/chipów.
2. **Cele dotykowe:** przyciski i ikony ≥ 44 × 44 px (w gęstych rzędach ≥ 40 px), linki tekstowe ≥ 24 px wysokości (WCAG 2.2 AA 2.5.8) — przez padding, nie przez powiększanie czcionki.
3. Tekst ≥ 12 px (treść 14,5–16 px), kontrast ≥ AA w obu motywach; brak tekstu „przyklejonego” do krawędzi (margines 16 px).
4. **Safe-area** (iPhone): dolny pasek i paski akcji z `env(safe-area-inset-bottom)`; `viewport-fit=cover`; treść ma `padding-bottom` pod pasek.
5. **Wydajność:** Lighthouse mobile ≥ 90 (Performance, Accessibility, Best Practices, SEO) na: głównej, produkcie, kategorii, GoPOS; LCP < 2,5 s na 4G; obrazy `next/image` z `sizes` (karuzela ok. 170 px, hero 100vw), AVIF/WebP; czcionki `display: swap` + preload; **filmy tylko po dotknięciu** (youtube-nocookie, `playsinline`); karuzele bez bibliotek (CSS scroll-snap).
6. **Gesty i ruch:** `prefers-reduced-motion` (bez animacji wejścia i pulsowania), arkusze z gestem w dół, `overscroll-behavior: contain` w arkuszach, brak „podwójnego” przewijania.
7. **Tryb ciemny** z tokenów (bez białych plam: zdjęcia na tle studio w wersji ciemnej, logotypy na białych kafelkach).
8. **Teksty z liczbami** składane w całości w kodzie („Pokaż 39 pozycji”, „Wyślij zapytanie · 2 poz.”, „Wybrano 3 z 7”), liczebniki z odmianą (1 / 2–4 / 5+, 12–14).
9. **Klawiatura ekranowa:** pola nie chowają się pod klawiaturą (`scrollIntoView` przy focusie), przyklejony przycisk nad klawiaturą nie zasłania pola (`visualViewport`).
10. **PWA lekkie (opcjonalnie w PROD):** `manifest.webmanifest` (nazwa, ikony z `public/brand/`, `theme_color` = granat, `display: standalone`), ikona na ekran główny. Bez service workera offline na start.

## 5. Jak sprawdzać (Claude Code + Krystian)

- Claude Code: zrzuty Playwright każdej trasy przy **390 × 844** (jasny i ciemny) + test braku poziomego przewijania przy **360/390/414** + axe; porównanie z `k31/screens/App-*`.
- Krystian: telefon Android (Chrome) i iPhone (Safari) — przejście „Start → kategoria → produkt → wersja → dodaj → zapytanie → wyślij”, kreator do wyniku, menu i filtry (gest w dół), tryb ciemny, obrót ekranu.
- Wzorzec przeszedł ten sam test w wizualizacji: 29 ekranów × 3 szerokości — 0 przypadków poziomego przewijania, cele dotykowe poprawione (v126).
