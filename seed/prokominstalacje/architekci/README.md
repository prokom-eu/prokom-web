# seed/prokominstalacje/architekci — treści strony `/dla-architektow` (wizualizacja v4.2)

Wygenerowane z `docs/design/prokominstalacje/zrodlo/pages/Architekci.js` i `zrodlo/common.js` 28.10.2026. Ikony zapisane jako `ikona:<nazwa>` (klucz w `icons()` z `zrodlo/common.js`). Znaczniki `[SZEF: …]` i `[TELEFON]` uzupełnia szef w panelu — nie mogą trafić na produkcję.

| Plik | Co zawiera | Gdzie trafia |
|---|---|---|
| `strona.json` | wszystkie sekcje strony: `dlaKogo`, `problemy`, `bravas`, `etapy`, `wymiana`, `checklista` (obiekty, instalacje, etapy, 31 pozycji z listą obiektów), `liczby` (14 kafli), `instalacje` (kolejność i opisy 10 usług), `deweloperzy`, `przepisy`, `osCzasu`, `doswiadczenie`, `biblioteka`, `prezentacje`, `zasady`, `faq` (10), `formularz` | `src/sites/instalacje/dane/architekci.ts` (I16a–c), FAQ także do JSON-LD |
| `przekroj.json` | 17 punktów przekroju domu (`x`, `y` w `viewBox 0 70 1000 530`, `k` usługa, `e` etap, `t`, `v`, `p`, `s`) i `liczby` (tekst „Liczby do projektu” dla klucza `s`) | `src/sites/instalacje/dane/przekroj.ts` (I16a) |
| `nowe-rozwiazania.json` | 20 pozycji kolekcji `InstArchNews`: kategoria, typ, tytuł, opis, parametry, „W projekcie”, przykłady, gdzie, `doPotwierdzenia`, ilustracja SVG | `pnpm seed:instalacje` (I16b): `doPotwierdzenia` ≠ null → wersja robocza + `internalNote` |

Liczby i fakty: źródła w `docs/strony/prokominstalacje-architekci-zrodla.md`. Zmiana liczby = zmiana tam.
Stan jednego ekranu strony (teksty nagłówków sekcji, SEO): `seed/prokominstalacje/strony-zrzut/Architekci.json`. Sekcja na głównej: `strony-zrzut/Main.json` → `arhm` (teksty) i `arsc` (stan przekroju).
