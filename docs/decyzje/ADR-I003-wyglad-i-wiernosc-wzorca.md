# ADR-I003 — Wygląd prokominstalacje.pl: jak przenieść wizualizację do kodu 1:1

- Status: **przyjęty z poprawkami** (I0, 28.10.2026: §4 fonty, §6 motyw domyślny) · Data: 27.10.2026

## Kontekst
- Wizualizacja (prototyp) jest kompletna: 31 stron, desktop i telefon, jasny i ciemny motyw, wszystkie interakcje działają. To **cel** — strona ma wyglądać i działać tak samo.
- Prototyp to HTML + CSS (`pk.css`, ok. 320 KB, ok. 100 animacji) + logika w klasach JS (`zrodlo/pages/*.js`) uruchamiana prostym silnikiem szablonów (`{{x}}`, `sc-for`, `sc-if`). Ten silnik **nie** trafia do repo — przenosimy szablony do React (Next.js App Router), a logikę do hooków.
- Claude Code nie widzi canvasu z czatu. Widzi: prototyp w repo (`docs/design/prokominstalacje/prototyp/`), źródło (`zrodlo/`), tokeny, zrzuty stanów telefonu i narzędzia do zrzutów i porównań.

## Decyzja

### 1. Komponenty = części prototypu
Mapa części prototypu na komponenty React: `docs/design/prokominstalacje/KOMPONENTY.md`. Zasady:
- Każdy plik `zrodlo/inc/*.html` = jeden komponent wspólny (`PageHero`, `GuaranteeSection`, `Packages`, `PriceFactors`, `Faq`, `Related`).
- Każda strona `zrodlo/pages/<Nazwa>.body.html` = jeden komponent strony, złożony z sekcji; sekcja z interakcją = osobny komponent kliencki (`'use client'`) w `src/sites/instalacje/widzety/`.
- Nagłówek, stopka, dolny pasek, arkusz menu = powłoka linii (`src/sites/instalacje/powloka/`).
- Struktura HTML i **nazwy identyfikatorów sekcji jak w prototypie** (ułatwia porównanie i linki `#kotwice`).

### 2. Szablony → JSX
| Prototyp | React |
|---|---|
| `{{x.y}}` | prop / pole z danych |
| `<sc-for list="{{a}}" as="b">` | `a.map((b) => …)` z kluczem |
| `<sc-if value="{{c}}">` | `{c && …}` |
| `onClick="{{fn}}"` | handler w komponencie klienckim |
| `<!--i:P.name:18-->` | `<Icon name="name" size={18} />` (ścieżki z `common.js → icons()` przeniesione do `icons.ts`) |
| `class="{{rv.x}}" data-rv` | hook `useReveal()` (IntersectionObserver, klasa `on`) |
| sekcje z `fold.json` | komponent `Fold` (tylko ≤ 700 px jak CSS prototypu — decyzja I4, 30.10.2026; treść w HTML) |
| `this.every(ms, fn)` | `useInterval` z pauzą: karta niewidoczna, sekcja poza ekranem, `prefers-reduced-motion`, interakcja użytkownika (`touched`) |
| `initState()` | `useState` z **tymi samymi wartościami początkowymi** (wygląd po załadowaniu = jak w prototypie) |
| `page(P, c)` | czysta funkcja wyliczająca widok ze stanu i danych (łatwa do testu jednostkowego) |

### 3. CSS
- Tokeny: wartości z `docs/design/prokominstalacje/tokens.css` przenosimy do **`src/styles/tokens.css`** (jedyne miejsce z kolorami w repo, ADR-007/013) pod `[data-line='instalacje']` i motyw ciemny/jasny tak, jak zrobiono to dla Biznesu i Software. Kolory **tylko** przez zmienne.
- Repo stoi na **Tailwind 4** (Biznes i Software nie mają własnych arkuszy poza `globals.css`). Instalacje: układ, odstępy, typografia, karty — **Tailwind** jak w pozostałych liniach; sceny SVG, animacje (`@keyframes`), złożone efekty z `pk.css` (poświaty, maski, przejścia scen) — **dosłownie** w jednym arkuszu linii `src/sites/instalacje/instalacje.css` z zakresem `[data-line='instalacje']`, importowanym przez `InstalacjeFrame` (nie w `globals.css` — to plik wspólny). Przy przenoszeniu wartości z `pk.css` (px, kolory, czasy) zachowujemy 1:1 — Tailwind z wartościami dowolnymi (`[…]`), gdy nie ma odpowiednika w skali.
- Przenosimy tylko reguły używane przez dany komponent (przy przenoszeniu sekcji szukamy jej klas w `pk.css`). Reguły nadpisujące się kilka razy (plik rósł warstwami v2 → v4.0) scalamy w jedną, **zachowując wynik ostatniej**.
- Breakpointy: 1300, 1240, 1100, 900, 760, 700 px — jak w `pk.css`. Telefon = ≤ 760 px.
- `overflow-x: clip` (nie `hidden`) na kontenerze strony — inaczej psuje się `position: sticky` nagłówka i paska kotwic (błąd poprawiony w v4.0).

### 4. Grafika
- Sceny SVG (hero strony głównej, przekroje obiektów, ilustracje usług) **kopiujemy z prototypu** jako komponenty SVG (wartości dynamiczne → propsy). Nie rysujemy od nowa.
- Zdjęcia: tylko ładowarki Elzab (`public/instalacje/ev/*.webp`, wycięte tło). `next/image`, wymiary jawne.
- Ikony: jeden zestaw z `icons.ts` (obrys 2 px, końcówki zaokrąglone).
- Fonty: Archivo (wdth 62–125, wght 400–900) i Manrope (400–800) — **już są w repo** jako pliki lokalne (`src/app/(sites)/fonts/`, `fonts.ts`, `next/font/local`); Instalacje używają ich, bez `next/font/google` (poprawka I0).

### 5. Wierność — jak sprawdzamy
1. Przed sesją: `node docs/design/prokominstalacje/narzedzia/zrzuty-wzorca.mjs <plik-prototypu>` → zrzuty wzorca w `tmp/wzorzec/` (1440/390, jasny/ciemny, kawałki po 1600 px).
2. Po zbudowaniu sekcji: `node docs/design/prokominstalacje/narzedzia/porownaj.mjs <plik-prototypu> <adres>` (dla 1440 i 390, oba motywy) → `tmp/porownanie/` wzorzec obok kodu, sekcja po sekcji. Claude Code ogląda każdą parę i poprawia różnice.
3. Telefon: stany z `stany-telefonu/*.webp` (arkusz, chowany nagłówek, aktywna karta) sprawdzane ręcznie na zrzucie ekranu 390×844.
4. Dopuszczalne różnice: renderowanie fontów, piksele antyaliasingu, treści z panelu (jeśli celowo zmienione). Niedopuszczalne: inny układ, kolor, odstęp widoczny gołym okiem, brak stanu (hover, aktywny, błąd, pusty), inna kolejność sekcji.
5. W opisie PR: lista sekcji „zgodne / różnice + powód”.
6. Pudełko elementów (I4, 30.10.2026): prototyp nie ma resetu `box-sizing` (wszystko `content-box`), a Tailwind ustawia `border-box`. Dlatego `.wrap` ma `box-sizing: content-box` (1280 px treści + wcięcia = 1344 px, jak wzorzec), a karty mierzone `flex-basis` (`.pkg`, `.relc`) też liczą wcięcie na zewnątrz. Podobnie preflight robi z SVG bloki ze środkowym wyrównaniem — gdzie wiersz tekstu ustala wysokość (lista zestawu, miniatury satelity), SVG wraca do `inline`/`baseline`. Przy przenoszeniu kolejnych sekcji sprawdzaj wysokości sekcji liczbowo (wzorzec vs kod), nie tylko na oko.

### 6. Motyw
Bez wyboru gościa motyw **za ustawieniem systemu** (`prefers-color-scheme`), tak jak Biznes i Software (decyzja Krystiana w I0, 28.10.2026 — zmienia pierwotne „domyślnie ciemny”). W `src/styles/tokens.css` wartości ciemne Instalacji pod `[data-line='instalacje'][data-theme='dark']` i w `@media (prefers-color-scheme: dark)` dla `:not([data-theme='light'])`, `'instalacje'` w `DARK_THEME_LINES` (I1). Przełącznik w nagłówku i w arkuszu „Więcej”; zapis w `localStorage` (`pk-theme`) + skrypt w `<head>` ustawiający `data-theme` przed pierwszym malowaniem (bez mignięcia). Scena hero ma własną porę (dzień/noc/zima) niezależną od motywu.

## Konsekwencje
- (+) Najkrótsza droga do wyglądu 1:1; logika już przetestowana w prototypie.
- (+) Narzędzie porównania daje obiektywny odbiór każdej sesji.
- (−) Arkusz CSS linii będzie duży — porządkujemy go przy przenoszeniu, nie wcześniej.
