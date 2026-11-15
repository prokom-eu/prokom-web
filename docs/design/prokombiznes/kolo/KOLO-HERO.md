# prokombiznes.pl — koło działów w hero, wersja 3 (03.11.2026, zaakceptowane przez Krystiana)

Zastępuje wersję 2 (15 produktów). Wzorzec: `docs/design/prokombiznes/kolo/prototyp.html`. Otwórz go w przeglądarce: „Pokaż strefy” rysuje promienie, a licznik pod kołem pokazuje „Bez nakładania · najmniejszy odstęp N px”.

Komponent: `src/sites/biznes/blocks/BzHero/DepartmentWheel.tsx`.

## Co się zmienia względem tego, co jest dziś na stronie
1. **Pierścień produktów już się nie obraca.** Dziś obraca się przez 120 s, a działy stoją, więc produkty odjeżdżają spod swojego działu i nachodzą na etykiety innych działów.
2. **19 pozycji na jednym równym pierścieniu** zamiast 3 na dział w łukach, które się zderzają. Produkty jednego działu stoją obok siebie, a dział wskazuje środek swojej grupy.
3. **Koło żyje cały czas.**
   - Kursor i najechanie na produkt niczego nie zatrzymują.
   - Klik w dział liczy 6,5 s od nowa.
   - Zatrzymuje je tylko przycisk „Wstrzymaj animację” (wymaga go WCAG 2.2.2) i fokus z klawiatury.
4. **Środek jest lżejszy:**
   - zostają „Dział N z 5”, nazwa działu i „Zobacz dział →”;
   - znikają liczba pozycji i 3 miniatury;
   - nazwa zmniejsza się sama, tak żeby „Bezpieczeństwo, sieć i podpis” i „Oprogramowanie” zawsze mieściły się w kole.
5. **Nazwa produktu po najechaniu** (dymek) jest zawsze na wierzchu, nad całym kołem.
6. **Każdy bąbel to link** do karty produktu albo strony usługi.

## Pozycje na kole (kolejność zgodnie z ruchem wskazówek zegara, od góry)
Zasady wyboru:
- Krystian 03.11: Posnet, Elzab, Sunmi, iPhone 18 Pro burgund, MacBook, ThinkBook, ThinkCentre, GoPOS, Subiekt, Office, ESET, EuroCert, KSeF, przegląd kasy, COMEX, PolCard, Konica, Ubiquiti, Opieka IT.
- Każda pozycja stoi w swoim dziale katalogu. Dlatego COMEX (UPS) jest w „Komputery i biuro”, bo `biuro / serw`.
- Tylko packshoty bez ludzi. Zero cen.

| # | Dział | Pozycja | Slug / adres | Obraz koła |
|---|---|---|---|---|
| 1 | Kasy i sprzedaż | Posnet Ergo Online | `ergo` | `kolo-ergo.webp` |
| 2 | | Elzab K10 Online | `k10` | `kolo-k10.webp` |
| 3 | | Sunmi D3 PRO | `d3` | `kolo-d3.webp` |
| 4 | | Terminal płatniczy PolCard | `pol` | `kolo-pol.webp` |
| 5 | Komputery i biuro | Apple iPhone 18 Pro · burgund | `apple-iphone-18-pro?kolor=burgund` | `kolo-apple-iphone-18-pro.webp` (burgund) |
| 6 | | Apple MacBook Air (M5) | `apple-macbook-air-m5` | `kolo-apple-macbook-air-m5.webp` |
| 7 | | Lenovo ThinkBook 14 | `lenovo-thinkbook-14-g8-g9` | `kolo-lenovo-thinkbook-14-g8-g9.webp` |
| 8 | | Lenovo ThinkCentre neo 50s | `lenovo-thinkcentre-neo-50s-55s` | `kolo-lenovo-thinkcentre-neo-50s-55s.webp` |
| 9 | | Konica Minolta bizhub C3321i | `konica-minolta-bizhub-c3321i` | `kolo-konica-minolta-bizhub-c3321i.webp` |
| 10 | | UPS COMEX COVER CORE ONE | `comex-cover-core-one` | `kolo-comex-cover-core-one.webp` |
| 11 | Oprogramowanie | GoPOS dla gastronomii | `gopos` | `kolo-gopos.webp` |
| 12 | | InsERT Subiekt nexo | `nexo` | `kolo-nexo.webp` |
| 13 | | Microsoft Office 2024 dla firm | `microsoft-office-2024` | `kolo-microsoft-office-2024.webp` |
| 14 | Bezpieczeństwo, sieć i podpis | Ubiquiti UniFi U7 Pro | `u7` | `kolo-u7.webp` |
| 15 | | ESET PROTECT | `eset` | `kolo-eset.webp` |
| 16 | | Podpis kwalifikowany EuroCert | `euro` | `kolo-euro.webp` |
| 17 | Serwis i usługi | Wdrożenie KSeF w firmie | `ksef` | `kolo-ksef.webp` (znak KSeF) |
| 18 | | Przegląd kasy fiskalnej | `przkas` | ikona `receipt` |
| 19 | | Opieka IT dla firm | **link** `/opieka-it` (to strona, nie karta produktu) | ikona `headset` |

Liczba pozycji w działach: 4 · 6 · 3 · 3 · 3. W tooltipie i `aria-label` stoją nazwy z tabeli (krótsze niż pełne nazwy kart).

## Geometria (jednostki projektu, 640 = szerokość koła; w kodzie `--u: calc(100cqw / 640)`)
| Warstwa | Wartość | Uwagi |
|---|---|---|
| Rdzeń | średnica 164 | kolumna tekstu 128 |
| Pierścień postępu | 7 poza rdzeniem, 2,6 px | odmierza 6,5 s |
| Działy (ikona 56) | R = **168** | kąt = **środek grupy jego produktów** (nie co 72°) |
| Produkty (bąbel **56**) | R = 282, krok **360/19 = 18,95°** | wszystkie 19 równo; pierwsza grupa wyśrodkowana na −90° |
| Łuk aktywnego działu | R = 282 | długość = rozpiętość grupy ± 7°; przy zmianie działu przebudowany i obrócony najkrótszą drogą |
| Etykieta działu | jedna linia, skrócona nazwa | dolne działy (y > 100) mają etykietę nad ikoną, pozostałe pod ikoną |

Wzory (jak w prototypie):
- `STEP = 360 / TOTAL`
- `FIRST[i]` = suma pozycji działów przed `i`
- `OFFSET = −90 − (n₀ − 1) / 2 · STEP`
- produkt `k` działu `i`: `OFFSET + (FIRST[i] + k) · STEP`
- dział `i`: `OFFSET + (FIRST[i] + (nᵢ − 1) / 2) · STEP`

Geometria **musi liczyć się z danych**. Zmiana listy w panelu (np. 3 → 4 produkty) nie może psuć układu.

Wynik prototypu: 5 działów × 1440 / 1180 / 820 × jasny / ciemny, **0 nakładań, najmniejszy odstęp 10–16 px**.

### Bąble
- Wycięte zdjęcia (przezroczysty WebP, 320 px) na „porcelanowym” dysku: `radial-gradient` biały → 9% koloru działu, cień pod produktem, `drop-shadow` zdjęcia. Zdjęcie zajmuje 70% × 66% bąbla.
- Usługa bez zdjęcia: ikona na dysku z gradientem działu.
- Aktywny dział: jego bąble mają skalę 1,1, obwódkę 2,2 i aureolę 4 w kolorze działu. Pozostałe bąble mają skalę 0,9 i lekko odbarwione zdjęcie (`saturate(.75)`, **bez przezroczystości**).
- Hover: skala 1,16.
- Unoszenie 4 px, każdy bąbel we własnym tempie (6–9,2 s).
- Paralaksa za myszą: produkty 7, działy 3,5, rdzeń −2 jednostki.

### Rdzeń
- `Dział N z 5`: 9,5 jednostki, odstęp .18em.
- Nazwa działu: rozmiar `min(16, 124 / (0,6 · najdłuższe słowo))` jednostek, maks. 2 linie, `text-wrap: balance`.
- „Zobacz dział”: pigułka 11,5 jednostki z białym kółkiem i granatową strzałką, po najechaniu strzałka przesuwa się o 3 px.
- **Bez liczby pozycji.** Liczba zostaje tylko w `aria-label` przycisku działu.
- Test: żaden róg elementu treści nie wychodzi poza okrąg rdzenia minus 6 px. Prototyp sprawdza to w `check()`.

### Dymek z nazwą (tooltip)
- **Jeden** element `.tip` w warstwie nad całym kołem (z-index najwyższy, `pointer-events: none`). Nigdy w bąblu: wtedy chowa się pod działami przez konteksty nakładania.
- Pozycja: na zewnątrz koła, w poziomie, gdy `|dx| > 1,2·|dy|`, inaczej nad albo pod. Przycięty do okna.
- Pokazuje się przy najechaniu i `:focus-visible`. Kończy się „→”.

## Ruch (decyzja 03.11: koło ma się ruszać cały czas)
- **Auto-przełączanie co 6,5 s, także pod kursorem.** Pierścień postępu (`animationend`) przełącza dział. Bez `setInterval`.
- **Klik w dział** wybiera go i startuje odliczanie od zera. Nie zatrzymuje koła na stałe.
- **Przycisk „Wstrzymaj animację” / „Wznów animację”** pod kołem, w linii podpowiedzi. `aria-pressed`, widoczny fokus. Zatrzymuje auto-przełączanie, unoszenie i dryf orbity.
- **Fokus z klawiatury** (`:focus-visible`) w kole zatrzymuje ruch, dopóki fokus jest w środku. Klik myszą tego nie robi.
- Zmiana działu: łuk płynie najkrótszą drogą (0,9 s) i rysuje się na nowo. Treść rdzenia wjeżdża (opacity + 8 px). Kolor przechodzi płynnie przez `@property --tint`.
- Wejście raz po załadowaniu: kaskada (spring). Pierwsza klatka jest kompletna.
- `prefers-reduced-motion`: bez auto-przełączania, unoszenia i dryfu.

## Dostępność
- Działy: `tablist` / `tab` (`aria-selected`, roving tabIndex, strzałki, Home, End). Rdzeń: `tabpanel` z `aria-labelledby`. `aria-live="polite"` tylko po wyborze użytkownika.
- Bąble: linki z `aria-label` „<nazwa> — zobacz produkt”.
- Warstwy działów i produktów: `pointer-events: none`, same przyciski i bąble: `auto`.
- Kontrast AA w obu motywach.

## Dane
- `strona-glowna-k4.json → kolo_hero`: lista z tabeli, zachowując kolejność.
  - Dziś w paczce dział `usl` ma `k10`, `synology…` i `thinkcentre`, czyli produkty spoza działu. Filtr grupy je wycina, więc „Serwis” na kole jest pusty. **Popraw na `ksef`, `przkas`.**
  - Pole `link` dla Opieki IT.
- `CatalogGroups.wheelProducts`:
  - `maxRows` 3 → **6** (zmiana walidacji, kolumny bez zmian).
  - Nowa opcjonalna grupa pól **`wheelLink`** `{ label, href, icon }`: dodatkowy bąbel na końcu działu, w Serwisie „Opieka IT dla firm” → `/opieka-it`, ikona `headset`. To migracja **dodająca** kolumny.
- **Obraz koła:**
  - Nowe opcjonalne pole `Products.wheelImage` (upload do Media, opis w panelu: „Wycięte zdjęcie bez tła do koła na stronie głównej”). Migracja dodająca kolumnę.
  - Seed wgrywa `seed/prokombiznes/k4/media/kolo/kolo-<slug>.webp` i ustawia pole idempotentnie (wzorzec `k4-logo-*`).
  - Brak pola → pierwsze zdjęcie galerii.
- Usługa bez zdjęcia (`przkas`) → ikona usługi, jak kafel usługi.
- **Link z kolorem:** wpis `apple-iphone-18-pro?kolor=burgund`. Karta produktu przy `?kolor=<nazwa>` wybiera ten kolor w `ColorPicker`: zdjęcie i podpis, nazwa porównywana bez wielkości liter i polskich znaków. Nieznany kolor = zachowanie domyślne.
- Skrócona etykieta: `CatalogGroups.shortName` („Sieć i ochrona”), migracja dodająca kolumnę.
- Kolory działów z `CatalogGroups.gradient`.

## Testy (Playwright `biznes-wheel`)
- Każdy z 19 bąbli: środek bąbla należy do bąbla (`elementFromPoint`), klik prowadzi pod właściwy adres (200). iPhone otwiera się z wybranym burgundem.
- 1024 / 1280 / 1440 × jasny / ciemny × 5 działów: ikony, etykiety, bąble i rdzeń się nie przecinają, odstęp ≥ 8 px, treść rdzenia mieści się w kole (algorytm `check()`).
- Dymek: dla każdego bąbla `elementFromPoint` w środku dymka trafia w dymek (przy teście włącz mu `pointer-events`) i dymek mieści się w oknie.
- Ruch: przy najechaniu na bąbel dział zmienia się po 6,5 s. Po „Wstrzymaj” się nie zmienia. Po „Wznów” znowu tak. Z `reducedMotion: 'reduce'` brak przełączania.
- Vitest: funkcja geometrii (kąty z liczebności działów) i `nameSize`.
