# prokomsoftware.pl — wzorzec wyglądu

Wizualizację całej strony przygotował i zaakceptował Krystian 18.10.2026 („cała strona v3”), a 25.10.2026 przebudował ją po audycie: **v20 — telefon jak aplikacja, ceny, nowa kolejność strony głównej, sekcja „Dlaczego nie WordPress i PHP”, strony prawne (16 plansz)**. Co się zmieniło: `ZMIANY-v20.md` — **wniesione do spec., ADR-014/015 i planu w SWD1 (25.10.2026); dziś tylko historia, źródłem prawdy jest spec.**; prompty: `PRZEKAZANIE-v20.md`. To **cel wizualny**. Pozostałe dokumenty:
- zakres i zachowania: `docs/strony/prokomsoftware.md`;
- model danych: `docs/decyzje/ADR-014-model-tresci-prokomsoftware.md`;
- kolory i motyw: `docs/decyzje/ADR-015-wyglad-prokomsoftware.md`;
- plan sesji: `docs/zadania/prokomsoftware.md`.

## Co jest w tym folderze

| Folder / plik | Co to jest | Jak używać |
|---|---|---|
| `screens/<Plansza>-<szerokość>-<motyw>/NN.jpg` | Zrzuty pełnych stron pocięte na kawałki po 1600 px (telefon 1400 px). Dla każdej planszy: 1440 jasny, 1440 ciemny, 390 jasny; strona główna także 390 ciemny. | **Pierwsze źródło wyglądu.** Czytaj kolejne kawałki przy budowie danej sekcji. |
| `stany/NN-*.jpg` | 77 zrzutów stanów (v20): 01 mega menu, 02 Twój projekt, 10 8 obszarów, 20–21 12 rzeczy, 30 podglądy, 40 proces, 50–52 kreator (3 ścieżki krok po kroku z błędem formularza i wysłaniem), 53 „opisz po swojemu”, 54 wynik w ciemnym, 55 wynik „Zapytaj o wycenę”, 60 technologie i 70 porównanie (na `/o-firmie`), 75–76 „Dlaczego nie WordPress”, 77 błąd zgody w kontakcie; **telefon (390 px, @2x):** 80 menu (arkusz), 81 Twój projekt (pigułka i arkusz), 82 dolny pasek (także aktywna „Oferta” w ciemnym), 83 hero, 84 obszary, 85 12 rzeczy, 86 bez WordPressa, 87 kreator krok po kroku (start, krok 2, wynik, podgląd, błąd, wysłane), 88 katalog i arkusz filtrów, 89 rozwiązanie, cennik, kontakt | Wzorzec zachowania tam, gdzie zrzut pełnej strony pokazuje tylko stan początkowy. |
| `boards/*.dc.html` + `support.js` | Plansze źródłowe: HTML, CSS i logika podglądu | Dokładne teksty, klasy, kolejność, wartości CSS. Szukaj po nagłówku sekcji. |
| `boards/index.html` | Spis plansz | `npx serve docs/design/prokomsoftware/boards` → `index.html`. Działają: mega menu, Twój projekt, 8 obszarów, filtry 12 rzeczy, podglądy, proces, kreator, katalog z filtrami i wyszukiwarką, motyw. |
| `tokens.css` | Kolory jasne i ciemne z mapą nazw na tokeny repo, fonty, miary (bez zmian w v20 — plik zostaje w repo, nie ma go w łatce) | Przeniesione w SW1. v20 nie dodaje kolorów. |
| `seed/prokomsoftware/*.json` (w katalogu głównym repo) | Treści wyciągnięte z plansz (15 plików): rozwiązania, obszary, 12 rzeczy, kreator, branże, miejscowości, wpisy, nawigacja, wyszukiwarka, fakty [SZEF], FAQ, technologie, sekcje strony głównej, demo aplikacji, ikony. Każdy plik ma `_info` z opisem. | Seed w SW3 (branże i wpis w SW2b). Teksty uzgodnione — nie piszemy od nowa. |

### Plansze

| Plansza | Adres w Next.js | Co pokazuje |
|---|---|---|
| `Main` | `/` | strona główna (desktop; telefon = te same plansze w zrzutach 390 i stanach 80–89) |
| `Katalog` | `/rozwiazania` | pełna oferta: 29 rozwiązań z cenami, filtry, wyszukiwarka, arkusz filtrów na telefonie |
| `Rozwiazanie` | `/rozwiazania/[slug]` | wzór: aplikacja dla ekip w terenie (z klikalnym demo telefonu) |
| `Branza` | `/dla-branz/[branza]` | wzór: budownictwo, wykończenia, instalatorzy, ekipy |
| `Kreator` | `/dobierz` | kreator „Dobierz rozwiązanie · 60 s” jako osobna strona |
| `Cennik` | `/cennik` | ceny „od”, poziomy opieki, „w cenie każdego projektu” |
| `Audyt` | `/audyt` | darmowy audyt strony (lead magnet) |
| `ONas` | `/o-firmie` | O firmie + (od v20) jak robimy, technologie, porównanie |
| `Wszystko` | `/jedna-firma` | „Jedna firma do wszystkiego” — 5 linii PRO-KOM |
| `Aktualnosci` | `/aktualnosci` | aktualności i poradnik (blog) |
| `Wpis` | `/aktualnosci/[slug]` | wzór wpisu: „WordPress czy strona pisana od zera?” |
| `Miasto` | `/miejscowosci/[miasto]` | wzór: Rabka-Zdrój |
| `Kontakt` | `/kontakt` | kontakt i brief |
| `Polityka` | `/polityka-prywatnosci` | polityka prywatności — **projekt do sprawdzenia przez szefa/prawnika** |
| `NieZnaleziono` | 404 | strona błędu z wyszukiwarką |
| `Dziekujemy` | `/dziekujemy` | po wysłaniu formularza (`noindex`, konwersja) |

Odnośniki w planszach prowadzą do plików `.dc.html` — w kodzie zamień je na adresy z tabeli.

### Format plansz (`.dc.html`)
To format wizualizacji, nie Reacta:
- `{{ … }}` to wiązania danych;
- `<sc-for>` i `<sc-if>` to pętle i warunki;
- logika jest w klasie `DCLogic` w `<script>`, a dane w tablicach (np. `OXD` — 8 obszarów, `POPD` — 12 rzeczy, `ST` — proces, `CMP` — porównanie, `H` — podglądy; w `Katalog` tablica `D` — 29 rozwiązań).

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
- **Sekcja „Jak robimy strony i systemy”** (`.jx` w `Main`) ma własne zmienne `--jt`, `--jm`, `--jgrn`, `--jred`… — to kolory ilustracji „dziś / z nami”. W kodzie: zmienne lokalne bloku liczone z tokenów (`--ok`, `--warn`, `--ink*`), nie nowe tokeny globalne.

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

- **Kontener:** max 1280 px, padding 32 px (≤ 640 px: 18 px). Powyżej 1400 px po lewej jest **szyna nawigacji sekcji** (kropki z nazwami, `#start` … `#kontakt`); poniżej 1400 px znika.
- **Sekcje:** padding pionowy 96 px, tła naprzemienne `--surface` / `--surface-2`, kontakt na `--surface-dark`.
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
- kreator: płynne przejścia kroków, pływające mini-karty w stanie początkowym podglądu;
- przy `prefers-reduced-motion: reduce` wszystko wyłączone (plansze tak robią — kopiuj tę regułę).

## Na co uważać (z doświadczeń przy wizualizacji)
- **Oczekiwane różnice przy porównaniu zrzutów** (pełna lista: ADR-015, rozstrz. 8)**:** (1) gradient H1 bez błękitnej końcówki (ADR-015) — plansze v20 nadal mają końcówkę `#7FD3FF`, w kodzie jej nie ma; (2) kontrast w warstwie mobilnej i bloku „Czasem powiemy” — napis i ikona na gradiencie akcentu w `--accent-ink`, akcent pigułki „Twój projekt”, gradient bloku z palety (ADR-015, rozstrz. v20 pkt 3–5). (Od v20 przyciski-linki mają biały napis także w planszach — dawna różnica o ciemnym napisie zniknęła.)
- **Dwa podziały oferty:** katalog ma **5 kategorii** (`Solutions.category`), strona główna **8 obszarów** (`SolutionAreas`, grupowanie marketingowe z chipami). Nie liczymy obszarów z kategorii (ADR-014 §1.2).
- **Strona główna to jedna responsywna strona.** Zrzuty `Main-390-*` pokazują wygląd przy 390 px (od v20 ok. 15 600 px wysokości — nie dokładaj sekcji).
- **Style interpolacji:** w planszach tekst z danych siedzi w `<span class="sc-interp">`, dlatego wszystkie elementy mają jawne klasy. W Reakcie nie używaj selektorów typu `.x span`.
- **Kreator:** kolumny wyniku muszą mieć równą wysokość (podgląd rośnie do wysokości lewej kolumny). Kafle potrzeby: 4 w rzędzie na desktopie, 2 na telefonie.
- **Jasny motyw:** numery w zakończonych krokach kreatora były białe na białym — w kodzie test kontrastu dla stanów `done`.
- **Na telefonie:** strzałki w kaflach oferty są ukryte (nachodziły na tekst), „Jak robimy” w jednej kolumnie.
- **`localStorage` tylko dla:** `pk-theme` (motyw), `pk-project` (lista „Twój projekt” jako `{ id, name }` — jeden klucz zamiast `pk-project` + `pk-project-n` z plansz; ADR-014, rozstrz. 9). Filtry katalogu i parametry kreatora **tylko w URL**.
- **Placeholdery** w nawiasach kwadratowych (od v20 zostają: `[TELEFON SOFTWARE]`, `[E-MAIL SOFTWARE]`, `[ADRES SALONU W ZAKOPANEM]`, `[TELEFON ZAKOPANE]`, `[OKRES PRZECHOWYWANIA]`, `[DATA AKTUALIZACJI]`, `[WYNIK]`, `[IMIĘ I NAZWISKO]`; ceny i terminy są w seed) to pola w panelu — nie wpisuj w kod żadnych liczb w ich miejsce. Lista: spec. §13.
- **Nazw konkurencji nie ma na stronie** (porównanie: „freelancer” i „agencja z dużego miasta”). Tak zostaje.


## Telefon (v20) — zasady wspólne dla wszystkich stron
Warstwa mobilna to jedna sekcja CSS na końcu każdej planszy (`v20 · warstwa mobilna`). W kodzie: komponenty, nie kopia CSS.
- **≤ 1080 px:** nagłówek kompaktowy (znak + „Wycena”), znika pasek linii, ikony i szyna sekcji; **dolny pasek** (`.tbar`) przyklejony z marginesem, rozmycie tła, `env(safe-area-inset-bottom)`, 5 pozycji, środkowy Kreator wyniesiony; **arkusze** od dołu (`.msh` menu, `.pjsh` Twój projekt) — w kodzie `<dialog>` z focus trap i Esc, zamknięcie tapnięciem w tło; treść strony ma dolny odstęp pod pasek.
- **≤ 640 px:** jedna kolumna, przyciski na całą szerokość, przewijane rzędy ze `scroll-snap` zamiast siatek (pigułki obszarów, filtry, etapy procesu, karuzele kart 84% szerokości z podglądem następnej), liczby w siatce 2×2, FAQ w jednej kolumnie, stopka w dwóch kolumnach.
- **Nagłówek przyklejony** (`position: sticky`) na każdej stronie: kontener strony z `overflow-x: clip`, nie `hidden` (hidden psuje sticky).
- Kryteria przed PR: brak poziomego przewijania przy 390 i 360 px, nic nie wystaje poza ekran, cele dotyku ≥ 44 px (wyjątek: linki w zdaniu), tekst ≥ 12 px (wyjątek: miniatury w makietach), elementy przyklejone nie zasłaniają przycisków.
