# prokombiznes.pl — wzorzec wyglądu

Wizualizacja całej strony przygotowana i zaakceptowana przez Krystiana 17.10.2026. To **cel wizualny**. Zakres i zachowania są w `docs/strony/prokombiznes.md`, a model danych w `docs/decyzje/ADR-012-katalog-i-model-tresci-prokombiznes.md`.

> **Od K3 i K3.1 (25.10.2026) zacznij od `INDEKS.md`** — spis materiałów i kolejność ważności (`MOBILE-APLIKACJA.md` → `K31-ZMIANY.md` → `K3-KATALOG.md` → `ZMIANY-v20.md` → spec.). Nowy wzorzec: `k31/screens/`, `k31/boards/` oraz `k3/screens/`, `k3/boards/` (tam, gdzie K3.1 nic nie zmienia). Tabela niżej opisuje wzorzec v17/v20 (`screens/`, `boards/`) — dla planu firmy, GoPOS, InsERT, O firmie, Kontaktu, stopki i telefonu to historia.

## Co jest w tym folderze

| Folder / plik | Co to jest | Jak używać |
|---|---|---|
| `screens/<Plansza>-<szerokość>-<motyw>/NN.jpg` | Zrzuty pełnych stron pocięte na kawałki po 1600 px (telefon 1400 px) | **Pierwsze źródło wyglądu.** Czytaj kolejne kawałki przy budowie danej sekcji. |
| `boards/*.dc.html` | Plansze źródłowe: HTML, CSS i logika podglądu | Dokładne teksty, klasy, kolejność, wartości CSS. Szukaj po nagłówku sekcji. |
| `boards/index.html` + `support.js` | Działający podgląd plansz | `npx serve docs/design/prokombiznes/boards` → otwórz `index.html`. Można klikać filtry, mega menu, wyszukiwarkę, listę zapytania. |
| `boards/media/` | Wszystkie obrazy z wizualizacji, nazwy czytelne | Seed wgrywa je do Payload Media (opis: `seed/prokombiznes/media.json`) |
| `css/_wspolny.css`, `css/<Plansza>.css` | CSS wyciągnięty z plansz (wspólny + specyficzny) | Referencja wartości: odstępy, promienie, cienie, gradienty. **Nie kopiuj 1:1.** |
| `tokens.css` | Kolory jasne i ciemne, fonty, promienie, breakpointy | **Kopiuj 1:1** do `styles/tokens` (albo Tailwind `@theme`) |

### Plansze

| Plansza | Strona |
|---|---|
| Main | strona główna, desktop |
| Mobile | strona główna, telefon 390 px |
| Mapa | mapa strony i nawigacja (dokument roboczy) |
| Katalog | `/oferta`, desktop |
| KatalogM | `/oferta`, telefon |
| Kategoria | kasy fiskalne |
| Produkt | Posnet Ergo Online |
| Zapytanie | lista zapytania |
| Dzial | Opieka IT |
| Gopos | GoPOS |
| Insert | InsERT |
| Branza | gastronomia |
| Kreator | kreator |
| OFirmie | O firmie |
| Aktualnosci | Aktualności |
| Wpis | wpis KSeF |
| Kontakt | Kontakt |

### Format plansz (`.dc.html`)
To format wizualizacji, nie Reacta:
- `{{ … }}` to wiązania danych;
- `<sc-for>` i `<sc-if>` to pętle i warunki;
- logika jest w klasie `DCLogic` w `<script>`, a dane katalogu w tablicach `PR`, `CT`, `CG`.

Używaj ich do odczytu treści i zachowań. **Nie przenoś tej architektury do Next.js.**

## Tokeny

**Kolory** (jasny / ciemny):

| Token | Jasny | Ciemny | Do czego |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#060A15` | tło strony |
| `--bg2` | `#F3F5FA` | `#0B1222` | tło sekcji naprzemiennych, kafli produktów |
| `--bg3` | `#E9EDF6` | `#111A30` | pola, wyróżnienia |
| `--ink` | `#0D1326` | `#EEF2FB` | tekst główny |
| `--ink2` | `#4A5470` | `#A6B1C9` | tekst opisowy |
| `--ink3` | `#6B7590` | `#7C88A4` | etykiety, liczniki |
| `--line` | `#E2E6EF` | `#1B2440` | obramowania 1–1.5 px |
| `--acc` | `#244FB0` | `#4A7BE0` | **akcent marki**: CTA, aktywne, linki |
| `--acc2` | `#4A7BE0` | `#8FB0F4` | drugi akcent: gradient nagłówka, hover |
| `--card` | `#FFFFFF` | `#0C1427` | karty |
| `--dark` | `#0A1430` | `#0A1430` | ciemne bloki rytmu, np. karty partnerów i CTA |
| `--dot` | `#45A02C` | `#4FB034` | kropka „partner” / „otwarte” |

- **Gradienty grup** (ikony i karty): `seed/prokombiznes/katalog.json` → `grupy[].gradient`.
  - Sprzedaż `#244FB0→#4FA3F0`
  - Biuro `#0E7C86→#33C2B5`
  - Oprogramowanie `#6D3FD1→#A07BF0`
  - Bezpieczeństwo `#1F7A4A→#46C78B`
  - Usługi `#C2410C→#F59E0B`
- **Na ciemnych kartach** (`--dark`, karty partnerów, CTA) nagłówki i pogrubienia są zawsze `#FFFFFF`, a tekst `#EEF2FB` / `rgba(238,242,251,.75)`.

## Typografia

- **Archivo** (variable, oś `wdth`): nagłówki, liczby, numeracja.
  - H1: waga 800, `font-stretch: 118%`, `letter-spacing: -.025em`, `clamp(40px, 4.3vw, 64px)`, interlinia .98.
  - H2: 800, `font-stretch: 112%`, `-.02em`, `clamp(32px, 3.8vw, 52px)`, 1.02.
  - Druga część H1 („Jeden telefon do wszystkiego.”) ma gradient `--acc → --acc2 → fiolet` przez `background-clip: text`. **ADR-013: bez fioletu — tylko `--acc → --acc2`.** Wzór: `screens/Main-1440-light/01.jpg`.
- **Manrope:** tekst.
  - lead: `clamp(17px, 1.4vw, 20px)`, interlinia 1.6, kolor `--ink2`, max 62ch;
  - treść: 15–17 px;
  - przyciski i etykiety: 700–800.
- **Caveat:** wyłącznie podpis właściciela w sekcji Fakty. **ADR-013: podpis jako SVG, bez kroju Caveat.**
- **Eyebrow nad sekcją:** Manrope 800, wersaliki, 12–13 px, tracking .08em, kolor akcentu.
- Fonty **self-hosted** (ADR-007), przez `next/font/local` albo pakiety `@fontsource-variable/archivo`, `@fontsource-variable/manrope`, `@fontsource/caveat`. Podzbiór latin + latin-ext. **Archivo musi mieć oś szerokości** (plik „standard” zawiera wght i wdth).

## Komponenty i miary

- **Kontener:** max 1280 px, boczny padding 32 px (≤ 640 px: 18 px).
- **Sekcje:** padding pionowy 96 px desktop (`.sec`), 56 px sekcje ciasne (`.sec-tight`), 64 px telefon. Tła naprzemienne `--bg` / `--bg2`, akcenty `--dark`.
- **Przyciski:**
  - wysokość min. 54 px, promień 14 px, Manrope 800 16 px;
  - główny: `--acc` z cieniem `0 12px 30px -10px var(--glow)`, hover −2 px;
  - drugorzędny: obramowanie 1.5 px `--line`, hover obramowanie `--acc`.
- **Chipy:** wysokość 44 px, pełne zaokrąglenie, obramowanie 1.5 px. Aktywny: tło `--ink`, tekst `--bg`.
- **Karty:**
  - promień 20–24 px, obramowanie 1 px `--line`, tło `--card`;
  - hover: cień `--shadow` i kolor obramowania; **bez skalowania**;
  - kafel zdjęcia produktu: tło `--bg2`, produkt z cieniem `drop-shadow(0 24px 30px rgba(13,19,38,.22))` (ciemny motyw: mocniejszy + niebieska poświata).
- **Ikony:** liniowe 24-siatka (`seed/prokombiznes/ikony.json`). W kafelkach siedzą w kwadracie 40–48 px z promieniem 12–14 px i gradientem grupy, ikona biała.
- **Odznaki na kartach** (maks. 2):

  | Odznaka | Tło |
  |---|---|
  | „Autoryzowany …” | granat |
  | odznaka marketingowa, np. „Ulga do 700 zł” | pomarańcz |
  | Nowość | zieleń |
  | Usługa | szary |

- **Breakpointy:** 1080 px (tablet: jedna kolumna w hero, filtry jako arkusz) i 640 px (telefon: dolny pasek, ukryty górny pasek).
- **Nagłówek:** wysokość ok. 76 px, tło `--hdr` (biel 78% / granat 72%) + `backdrop-filter: blur(14px)`.

## Ruch
Szczegóły w specyfikacji, §8.5. Krótko:
- wejścia sekcji kaskadowo;
- marquee marek;
- autoprzełączanie koła w hero;
- toast po dodaniu do zapytania;
- przy `prefers-reduced-motion` wszystko wyłączone.

## Na co uważać (z doświadczeń przy wizualizacji)

- Dwie strony głównej (desktop i telefon) to **jedna** responsywna strona. Plansza `Mobile` pokazuje, jak ma wyglądać przy 390 px.
- Karty z ciemnym tłem: pogrubienia (`<b>`) dziedziczą globalny kolor, więc trzeba je jawnie ustawić na biały.
- Siatki produktów nie mogą zostawiać dziur. W kategorii puste miejsce wypełnia karta „Nie wiesz, którą wybrać?”, a w mozaice „Cała oferta” nie rozciągamy pojedynczych kafli.
- Logo marek w oryginalnych kolorach, na białych kaflach, z równą wysokością optyczną. Bez przerabiania na monochrom.
- Plansze używały `localStorage` do przekazywania filtrów między stronami (`pk-kf`, `pk-ask`, `pk-branza`). **W Next.js tylko URL.** `localStorage` zostaje wyłącznie dla `pk-cart`, `pk-theme`, `pk-sz-closed`.
