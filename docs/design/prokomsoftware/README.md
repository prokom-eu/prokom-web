# prokomsoftware.pl — wzorzec wyglądu

> **Stan: v22 (30.10.2026, SWD2).** Plansze, zrzuty i stany w tym folderze to **v22** — jedna cena „od” (bez wersji Na start / Standard), okno szczegółów oferty z 29 miniaturami, kreator w 4 krokach z wyceną na żywo, ciemna stopka, kontakt z blokiem „Twój projekt”, 14 sekcji strony głównej. **Źródłem prawdy dla zakresu i zachowań jest spec. `docs/strony/prokomsoftware.md` + ADR-014 / ADR-015** (v21/v22 wniesione w SWD2). `ZMIANY-v20.md` i `ZMIANY-v21.md` to od SWD2 **historia** (nie czytaj ich jako wymagań). **Wzorcem zostają:** plansze `boards/`, zrzuty `screens/`, stany `stany/`, miniatury `miniatury/` oraz `PRZEKAZANIE-v22.md` §2 (mapa zmian → zbudowany kod) i §3 (prompty sesji SWR). Przy różnicy tekstu między planszą a `seed-v22/` wygrywa plansza (lista znanych różnic: plan `docs/zadania/prokomsoftware.md` §3a).

Wizualizację całej strony przygotował i zaakceptował Krystian 18.10.2026 („cała strona v3”), 25.10.2026 przebudował ją po audycie (**v20** — telefon jak aplikacja, ceny, „Dlaczego nie WordPress i PHP”, strony prawne; 16 plansz), a 28–30.10.2026 zaakceptował **v21 + v22** (kreator, okno oferty, stopka, kontakt, kolejność strony głównej, jedna cena „od”). To **cel wizualny**. Pozostałe dokumenty:
- zakres i zachowania: `docs/strony/prokomsoftware.md`;
- model danych: `docs/decyzje/ADR-014-model-tresci-prokomsoftware.md` (rozstrzygnięcia v21/v22);
- kolory i motyw: `docs/decyzje/ADR-015-wyglad-prokomsoftware.md` (rozstrzygnięcia v22);
- plan sesji i lista przeróbek kodu: `docs/zadania/prokomsoftware.md` (§3, §3a, §3b);
- prompty i mapa zmian v22: `PRZEKAZANIE-v22.md` (starsze: `PRZEKAZANIE-v20.md`, `PRZEKAZANIE.md` — historia).

## Co jest w tym folderze

| Folder / plik | Co to jest | Jak używać |
|---|---|---|
| `MOBILE-APLIKACJA.md` | **Telefon i tablet „jak najlepsza aplikacja”** (30.10): szkielet, komponenty, ekrany z wzorcami i sesjami, odczucie aplikacji, Definition of Done telefonu. | W sprawach telefonu wygrywa nad spec. §8.6 i planszami. |
| `screens/<Plansza>-<szerokość>-<motyw>/NN.jpg` | Zrzuty pełnych stron v22 pocięte na kawałki (1440: 1600 px, telefon: 1400 px). Dla każdej planszy: 1440 jasny, 1440 ciemny, 390 jasny; strona główna także 390 ciemny (49 kompletów). **Wysokość strony głównej: ok. 14 500 px przy 1440 (10 kawałków) i ok. 17 400 px przy 390 (13 kawałków).** | **Pierwsze źródło wyglądu.** Dół każdej planszy = ciemna stopka (SWR2). |
| `stany/NN-*.jpg` | Stany v20, które v22 nie zmieniło: 01 mega menu, 02 Twój projekt, 10 8 obszarów, 30 podglądy, 40 proces, 60 technologie (od v21 na głównej), 70 porównanie (`/o-firmie`), 75–76 „Dlaczego nie WordPress”, 77 błąd zgody w kontakcie; **telefon (390 px, @2x):** 80 menu, 81 Twój projekt, 82 dolny pasek, 83 hero, 84 obszary, 85 12 rzeczy (układ; karty v22 — `okno-99-main-grid-390-light`), 86 bez WordPressa, 88 katalog i arkusz filtrów, 89 rozwiązanie, cennik, kontakt. | Wzorzec zachowania tam, gdzie zrzut pełnej strony pokazuje tylko stan początkowy. |
| `stany/kreator-*.jpg` | **Kreator v22** (zastępują dawne 50–55 i 87): desktop `kreator-d-a-*` (pensjonat krok po kroku: start, branża, zakres, zakres wypełniony, wynik, wynik z dodatkami, błąd, wysłane), `d-b` (program: szczegóły, zakres, „więcej”, wynik), `d-c` (przebudowa: problemy, zakres, wynik), `d-d` (aplikacja „Zapytaj o wycenę”), `d-e` (opisz po swojemu), `d-f` (ciemny); telefon `kreator-m-a-*` (start, kafle, branża, zakres, wynik, formularz, błąd, wysłane, podgląd), `m-b` (ciemny). | Ścieżki e2e SWR4 (te same kliknięcia, cena i termin „od”, dodatki „do wyceny”). |
| `stany/okno-*.jpg` | **Okno szczegółów oferty** (SWR3): `okno-90` strona firmowa, `91` pensjonat, `92` system zleceń, `93` aplikacja „zapytaj”, `94` opieka z poziomami (każde jasny i `-ciemny`), `95` dół okna i po dodaniu, `96–98` telefon (pensjonat góra / „W cenie” / dół, automatyzacja, opieka — porównanie, system ciemny, audyt ciemny), `99-katalog-karty-*` (karty katalogu, desktop/telefon, oba motywy), `99-main-grid-*` i `99-main-modal-390-*` („12 rzeczy” i okno na telefonie; zastępują dawne 20–21), `99-branza-karty-1440-light` (karty branży, SW10). | Wzorzec komponentu okna i kart z miniaturą. |
| `stany/kontakt-*.jpg` | **Kontakt v21** (SW11a): `kontakt-90` hero (jasny/ciemny), `91` formularz, `92` linie PRO-KOM, `93` błąd, `94` wypełniony, `95` wysłane, `96–99` telefon (hero, formularz, błąd, linie, „gdzie”), `99b` / `99c` blok „Twój projekt” (1440 / 390). | Wzorzec `/kontakt` i bloku „Twój projekt”. |
| `miniatury/<slug>.svg` | **29 ilustracji rozwiązań** (płaska scena 280×170 w kolorze kategorii, własne tło, bez nazw realnych firm). | SWR1 kopiuje do `public/software/rozwiazania/<slug>.svg` (pole `Solutions.thumbnail`, ADR-014 v22 pkt 3); dekoracyjne (`alt=""`). |
| ~~`seed-v22/*.json`~~ | Nowy seed v22 — **przeniesiony do `seed/prokomsoftware/` w SWR1–SWR5, folder usunięty (SWR5, 31.10.2026)**. | Poprawki wg plansz opisane w `_info` plików seeda. |
| `boards/*.dc.html` + `support.js` | Plansze źródłowe v22: HTML, CSS i logika podglądu | Dokładne teksty, klasy, kolejność, wartości CSS. Teksty okna oferty (szablony kategorii, poziomy, pytania) są w skrypcie planszy `Katalog` (tablice `OM_*`) — seed ich nie ma. |
| `boards/index.html` | Spis plansz | `npx serve docs/design/prokomsoftware/boards` → `index.html`. Działają: mega menu, Twój projekt, 8 obszarów, 12 rzeczy z oknem, podglądy, proces, kreator v22, katalog z filtrami, wyszukiwarką i oknem, kontakt z „Twoim projektem”, motyw. |
| `tokens.css` | Kolory jasne i ciemne z mapą nazw na tokeny repo, fonty, miary (bez zmian od v20) | Przeniesione w SW1. v21/v22 nie dodają kolorów (ADR-015 v22). |
| `seed/prokomsoftware/*.json` (w katalogu głównym repo) | Treści z plansz (v22 od SWR5: pięć plików przeniesionych z dawnego `seed-v22/`; `popularne.json` i `faq.json` poprawione wg planszy). Każdy plik ma `_info`. | Seed (`pnpm seed:software`). Teksty uzgodnione — nie piszemy od nowa. |
| `ZMIANY-v20.md`, `ZMIANY-v21.md` | Opis zmian v20 i v21/v22 | **Historia** (wniesione w SWD1 i SWD2). |
| `PRZEKAZANIE-v22.md` | Kolejność sesji W-v22 → SWD2 → SWR1–SWR5 → SW10–SW12, mapa zmian → kod (§2), prompty (§3) | **Wzorzec** razem z planszami (nie zmieniamy). |

### Plansze

| Plansza | Adres w Next.js | Co pokazuje |
|---|---|---|
| `Main` | `/` | strona główna — 14 sekcji v21 (desktop; telefon = zrzuty 390 i stany 80–89, `okno-99-main-*`) |
| `Katalog` | `/rozwiazania` | pełna oferta: 29 rozwiązań z miniaturą, ceną i terminem „od”, filtry „Od czego zaczynasz” i branże, wyszukiwarka, **okno szczegółów oferty**, arkusz filtrów na telefonie |
| `Rozwiazanie` | `/rozwiazania/[slug]` | wzór: aplikacja dla ekip w terenie (z klikalnym demo telefonu) |
| `Branza` | `/dla-branz/[branza]` | wzór: budownictwo, wykończenia, instalatorzy, ekipy |
| `Kreator` | `/dobierz` | kreator v22 „Dobierz rozwiązanie · 60 s” (4 kroki, wycena na żywo, blok wysyłki) jako osobna strona |
| `Cennik` | `/cennik` | jedna cena „od” z terminem i „W cenie”, opieka Podstawowa / Rozszerzona / Systemy, audyt 3 rodzaje, „Tego nie dopłacasz” |
| `Audyt` | `/audyt` | darmowy audyt strony (lead magnet) |
| `ONas` | `/o-firmie` | O firmie + porównanie „Freelancer, agencja czy PRO-KOM?” (od v21 bez „Jak robimy” i technologii — są na głównej), oś czasu z `[ROK]` |
| `Wszystko` | `/jedna-firma` | „Jedna firma do wszystkiego” — 5 linii PRO-KOM (z „Tech”) |
| `Aktualnosci` | `/aktualnosci` | aktualności i poradnik (blog) |
| `Wpis` | `/aktualnosci/[slug]` | wzór wpisu: „WordPress czy strona pisana od zera?” |
| `Miasto` | `/miejscowosci/[miasto]` | wzór: Rabka-Zdrój |
| `Kontakt` | `/kontakt` | kontakt v21: żywy status godzin, kanały, formularz z osią „Co dalej”, blok „Twój projekt”, „Inne linie PRO-KOM”, „Gdzie się spotkamy”, FAQ |
| `Polityka` | `/polityka-prywatnosci` | polityka prywatności — **projekt do sprawdzenia przez szefa/prawnika** |
| `NieZnaleziono` | 404 | strona błędu z wyszukiwarką |
| `Dziekujemy` | `/dziekujemy` | po wysłaniu formularza (`noindex`, konwersja) |

Odnośniki w planszach prowadzą do plików `.dc.html` — w kodzie zamień je na adresy z tabeli.

### Format plansz (`.dc.html`)
To format wizualizacji, nie Reacta:
- `{{ … }}` to wiązania danych;
- `<sc-for>` i `<sc-if>` to pętle i warunki;
- logika jest w klasie `DCLogic` w `<script>`, a dane w tablicach (np. `OXD` — 8 obszarów, `POPD` — 12 rzeczy (nazwy kart w kodzie z `Solutions`), `ST` — proces, `CMP` — porównanie, `H` — podglądy, `RAILI` — szyna sekcji; w `Katalog` tablica `D` — 29 rozwiązań i tablice okna oferty `OM_INC`, `OM_MORE`, `OM_EX`, `OM_CARE`, `OM_CMP`, `OM_NOTE`, `OM_REL`, `OM_PLUS`, `OM_TH`).

Używaj ich do odczytu treści i zachowań. **Nie przenoś tej architektury do Next.js.**

## Tokeny

Pełna lista i mapa nazw: `tokens.css`. Najważniejsze:

| Token repo | Jasny | Ciemny | Do czego |
|---|---|---|---|
| `--surface` | `#F4F5F1` | `#121613` | tło strony |
| `--surface-2` | `#ECEEE8` | `#161A17` | sekcje naprzemienne |
| `--surface-3` | `#E3E6DF` | `#1C211D` | pola, wyróżnienia |
| `--card` / `--card-2` | `#FFFFFF` / `#F7F8F5` | `#1A1F1B` / `#20261F` | karty / wnętrza paneli |
| `--ink` | `#121613` | `#F4F5F1` | tekst główny |
| `--ink-soft` | `#2E342F` | `#D9DDD8` | tekst półmocny |
| `--ink-2` = `--ink-3` | `#4F5650` | `#B5BBB5` | tekst opisowy, etykiety |
| `--border` | `#DCDFD8` | `#2A302B` | obramowania dekoracyjne |
| `--accent` | `#6E45D4` (ADR-015) | `#9670EE` | CTA, aktywne, ikony |
| `--accent-2` | `#A24BD8` | `#C9A9FF` | gradienty, hover |
| `--accent-text` | `#5B33C4` (ADR-015; też `--c-software-text`) | `#B39BF5` | eyebrow, linki, liczby |
| `--accent-ink` | `#FFFFFF` | `#121613` | napis na przycisku w akcencie |
| `--accent-soft` / `--accent-line` | `#ECE7FB` / `#CFC2F5` | `#241E36` / `#4A3C74` | chipy i kafle aktywne / ich obramowanie |
| `--stage` | `#E9E3FA` | `#1E1A2B` | tło podglądów (mock ekranów) |
| `--surface-dark` | `#171226` | `#0E0B18` | ciemne bloki (kontakt, CTA) |

- **Motyw domyślny:** preferencja systemu (`prefers-color-scheme`), wybór zapisany w `pk-theme`. Plansze startują w ciemnym, bo tak je oglądano. Strona ma wyglądać dobrze w obu.
- **Sekcja „Jak robimy strony i systemy”** (`#jak-robimy` w `Main`, od v21 na głównej) ma własne zmienne `--jt`, `--jm`, `--jgrn`, `--jred`… — to kolory ilustracji „dziś / z nami”. W kodzie: zmienne lokalne bloku liczone z tokenów (`--ok`, `--warn`, `--ink*`), nie nowe tokeny globalne.

### Kontrast (WCAG AA) — policzone 18.10.2026
Wszystkie pary tekst/tło z plansz mają ≥ 4,5:1, z wyjątkami poniżej. Test tokenów (`themes.test.ts`) ma je pilnować.

| Para | Wynik | Wniosek |
|---|---|---|
| jasny `--warn` `#A86A00` na `surface-2` / `surface-3` / `stage` / `accent-soft` | 3,5–3,8 | tylko kropki i ikony (≥ 3:1); tekst ostrzeżenia w `--ink` |
| jasny `--ok` `#2E7A1E` na `surface-3` / `accent-soft` / `stage` | 4,25–4,44 | mały zielony tekst tylko na `card` / `surface` / `surface-2`; albo `--ok-text` ciemniejszy |
| ciemny `--accent` `#9670EE` jako tekst na `card-2` / `accent-soft` | 4,31 / 4,45 | tekst w akcencie zawsze `--accent-text` (`#B39BF5`, ≥ 7:1) |
| biały na `#8B61E3` (kolor z księgi) | 4,27 | dlatego wizualizacja ma w jasnym motywie `#6E45D4` (6,06) — decyzja SW0 |
| `--accent-ink` `#121613` na ciemnym `--accent` `#9670EE` | 5,09 | OK |
| `--border` (1,23–1,35) | — | dekoracyjne; pola formularzy dostają `--border-input` ≥ 3:1 |

## Typografia

- **Archivo** (variable, oś `wdth` obowiązkowa): nagłówki, liczby, numeracja.
  - H1 (`.disp`): waga 900, `font-stretch: 122%`, `letter-spacing: -.025em`, `clamp(42px, 5.2vw, 72px)`, interlinia .98.
  - H2 (`.h2`): 900, `font-stretch: 115%`, `-.02em`, `clamp(32px, 3.8vw, 54px)`, 1.02.
  - Mniejsze tytuły kart: 800–900, `font-stretch` 108–118%.
  - Fragment H1 (`.grad`) na 5 stronach (główna, katalog, rozwiązanie, branża, kontakt) ma w planszach gradient `--accent-text → --accent-2 → #7FD3FF`. **W kodzie bez niebieskiej końcówki:** `--accent-text → --accent-2 → --accent` (ADR-015, rozstrz. 2). Lista miejsc z gradientem: ADR-015 pkt 7.
- **Manrope:** tekst.
  - lead: `clamp(17px, 1.4vw, 20px)`, interlinia 1.6, kolor `--ink-2`, max 62ch;
  - treść 15–17 px; przyciski i etykiety 700–800.
- **Eyebrow** nad sekcją: Manrope 800, wersaliki, 13,5 px, tracking .1em, kolor `--accent-text`.
- **Fraunces** występuje tylko w mockach podglądów (udawane strony klientów: pensjonat, restauracja). **W kodzie** zamiast niego systemowy szeryf (`Georgia, 'Times New Roman', serif`) — bez trzeciego pobieranego kroju (ADR-015, rozstrz. 5).
- Fonty self-hosted (ADR-007), jak na Biznesie (`next/font/local`).

## Komponenty i miary

- **Kontener:** max 1280 px, padding 32 px (≤ 640 px: 18 px). Powyżej 1400 px po lewej jest **szyna nawigacji sekcji** (v22: 11 pozycji `RAILI` — `#start` … `#faq`, z „Jak robimy”, „Z czego budujemy” i „Zasady”); poniżej 1400 px znika.
- **Sekcje:** padding pionowy 96 px, tła naprzemienne `--surface` / `--surface-2` (rytm v21: różne tła „Jak robimy” / „WordPress” / „Z czego budujemy”), kontakt na `--surface-dark`; **stopka zawsze ciemna** (tokeny `--footer-*`, ADR-015 v22).
- **Przyciski:** wysokość 56 px (telefon 52 px i pełna szerokość), promień 16 px, Manrope 800 16 px. Główny: `--accent` + cień z `--glow`, hover −2 px. Drugorzędny: obramowanie 1,5 px `--border`, hover `--accent`.
- **Karty:** promień 22 px (duże panele 28–36 px), obramowanie 1 px `--border`, tło `--card`. Hover: obramowanie `--accent-line` i cień, **bez skalowania**. W jasnym motywie karty są **białe** na tle `#F4F5F1` (prośba Krystiana).
- **Chipy:** pełne zaokrąglenie, tło `--chip` albo `--accent-soft` (aktywne), obramowanie `--accent-line`.
- **Ikony:** liniowe 24×24, `stroke-width 2`, `currentColor` (`seed/prokomsoftware/ikony.json` + ścieżki w seedach). W kaflach obszarów: kwadrat 48–56 px, promień 14–16 px, gradient obszaru (`obszary.json`), ikona biała.
- **Nagłówek:** ok. 76 px, tło `--header-bg` + `backdrop-filter: blur(14px)`, przyklejony.
- **Breakpointy:** 1400 px (szyna), 1080 px (tablet: jedna kolumna w hero, kreator w jednej kolumnie), 640 px (telefon).

## Ruch
- wejścia sekcji kaskadowo (klasy `.in`, `.d1`…`.d4`);
- 8 obszarów: autoprzełączanie co 5,5 s, stop po kliknięciu albo najechaniu;
- podglądy: animowane „toasty” i kroki w mocku;
- kreator: płynne przejścia kroków, pływające mini-karty w stanie początkowym podglądu, wycena na żywo (lepka kolumna / belka na telefonie);
- makieta hero „Twój system” składa się sama do pierwszego dotknięcia;
- okno oferty: wejście okna (desktop) / arkusza (telefon);
- przy `prefers-reduced-motion: reduce` wszystko wyłączone (plansze tak robią — kopiuj tę regułę).

## Na co uważać (z doświadczeń przy wizualizacji)
- **Oczekiwane różnice przy porównaniu zrzutów** (pełna lista: ADR-015, rozstrz. 8 i v22 pkt 6)**:** (1) gradient H1 bez błękitnej końcówki (ADR-015) — plansze v22 nadal mają końcówkę `#7FD3FF`, w kodzie jej nie ma; (2) kontrast w warstwie mobilnej i bloku „Czasem powiemy” — napis i ikona na gradiencie akcentu w `--accent-ink`, akcent pigułki „Twój projekt”, gradient bloku z palety (ADR-015, rozstrz. v20 pkt 3–5); (3) ciemna stopka i bilet kreatora na tokenach z palety zamiast wartości planszy (ADR-015 v22 pkt 1, 5). (Od v20 przyciski-linki mają biały napis także w planszach — dawna różnica o ciemnym napisie zniknęła.)
- **Dwa podziały oferty:** katalog ma **5 kategorii** (`Solutions.category`), strona główna **8 obszarów** (`SolutionAreas`, grupowanie marketingowe z chipami). Nie liczymy obszarów z kategorii (ADR-014 §1.2).
- **Strona główna to jedna responsywna strona.** v22: 14 sekcji, ok. **14 500 px przy 1440** i **17 400 px przy 390** (zrzuty `Main-*`) — nie dokładaj sekcji.
- **Jedna cena „od” (v22):** nigdzie nie ma wersji Na start / Standard / Pełna ani tabeli porównania wersji; jedyne tabele poziomów to opieka (Podstawowa / Rozszerzona / Systemy) i audyt (3 rodzaje). Ceny i terminy zawsze z `Solutions` — także te, które plansza i `seed-v22/kreator.json` mają wpisane tekstem (kafle kreatora, „Często dobierane razem”, podpowiedź sklepu).
- **Style interpolacji:** w planszach tekst z danych siedzi w `<span class="sc-interp">`, dlatego wszystkie elementy mają jawne klasy. W Reakcie nie używaj selektorów typu `.x span`.
- **Kreator (v22):** 4 kroki; lewa kolumna kroków, prawa — wycena na żywo (lepka), w wyniku blok wysyłki z biletem. Kafle potrzeby: 4 w rzędzie na desktopie, 2 na telefonie. Na telefonie dolny pasek chowa się, gdy belka ceny kreatora jest aktywna.
- **Okno oferty:** jeden komponent dla katalogu, „12 rzeczy” i branży; na telefonie arkusz od dołu z lepkim paskiem ceny.
- **Jasny motyw:** numery w zakończonych krokach kreatora były białe na białym — w kodzie test kontrastu dla stanów `done`.
- **Na telefonie:** strzałki w kaflach oferty są ukryte (nachodziły na tekst), „Jak robimy” i „Zasady” w karuzeli, „Z czego budujemy” — kafle 2×3 + karta szczegółów, przyciski 8 obszarów obok siebie bez łamania przy 360 px, proces pokazuje skrawek następnego etapu.
- **`localStorage` tylko dla:** `pk-theme` (motyw), `pk-project` (lista „Twój projekt” jako `{ id, name }` — jeden klucz zamiast `pk-project` + `pk-project-n` z plansz; ADR-014, rozstrz. 9). Filtry katalogu i parametry kreatora **tylko w URL**.
- **Placeholdery** w nawiasach kwadratowych (zostają: `[TELEFON SOFTWARE]`, `[E-MAIL SOFTWARE]`, `[ADRES SALONU W ZAKOPANEM]`, `[TELEFON ZAKOPANE]`, `[OKRES PRZECHOWYWANIA]`, `[DATA AKTUALIZACJI]`, `[WYNIK]`, `[IMIĘ I NAZWISKO]`, od v21 **`[ROK]`** na osi czasu `/o-firmie`; ceny i terminy są w seed) to pola w panelu — nie wpisuj w kod żadnych liczb w ich miejsce. Lista: spec. §13.
- **Nazw konkurencji nie ma na stronie** (porównanie: „freelancer” i „agencja z dużego miasta”). Tak zostaje.


## Telefon (v20, v21) — zasady wspólne dla wszystkich stron
Warstwa mobilna to jedna sekcja CSS na końcu każdej planszy (`v20 · warstwa mobilna`, uzupełniona w v21). W kodzie: komponenty, nie kopia CSS.
- **≤ 1080 px:** nagłówek kompaktowy (znak + „Wycena”), znika pasek linii, ikony i szyna sekcji; **dolny pasek** (`.tbar`) przyklejony z marginesem, rozmycie tła, `env(safe-area-inset-bottom)`, 5 pozycji, środkowy Kreator wyniesiony; **arkusze** od dołu (`.msh` menu, `.pjsh` Twój projekt, okno oferty) — w kodzie `<dialog>` z focus trap i Esc, zamknięcie tapnięciem w tło; treść strony ma dolny odstęp pod pasek.
- **≤ 640 px:** jedna kolumna, przyciski na całą szerokość, przewijane rzędy ze `scroll-snap` zamiast siatek (pigułki obszarów, filtry, etapy procesu, karuzele kart 84% szerokości z podglądem następnej), liczby w siatce 2×2, FAQ w jednej kolumnie, stopka w dwóch kolumnach (karty linii w przewijanym rzędzie); karuzele z `scroll-padding-inline: 18px`.
- **Nagłówek przyklejony** (`position: sticky`) na każdej stronie: kontener strony z `overflow-x: clip`, nie `hidden` (hidden psuje sticky).
- Kryteria przed PR: brak poziomego przewijania przy 390 i 360 px, nic nie wystaje poza ekran, cele dotyku ≥ 44 px (wyjątek: linki w zdaniu), tekst ≥ 12 px (wyjątek: miniatury w makietach), elementy przyklejone nie zasłaniają przycisków.
