# ADR-013: Wygląd linii z wizualizacji — neutralne kolory per linia, gradienty, tryb ciemny

- **Status:** proponowana (szkic do akceptacji Krystiana)
- **Data:** 2026-10-17
- **Decyduje:** Krystian
- **Częściowo zastępuje:** ADR-007 (punkt „tokeny z księgi znaku” w zakresie kolorów neutralnych i efektów) oraz brief `docs/strony/prokombiznes-design.md` z 15.10.2026 (§2 „Motyw zamknięty”, §4 „bez gradientów”, §10 „gradienty, tła z poświatą”).

## Kontekst
- ADR-007 i `docs/marka.md` (S6a) dają każdej linii jeden kolor akcentu, a tła i tekst są wspólne: grafit `#121613`, papier `#F4F5F1`, biel. Brief z 15.10 zakazywał gradientów i poświat.
- 17.10.2026 Krystian zaakceptował wizualizację całej strony prokombiznes.pl (`docs/design/prokombiznes/`, `tokens.css` tamże). Pakiet stwierdza, że wizualizacja zastępuje brief z 15.10.
- Wizualizacja ma:
  - własne kolory neutralne Biznesu (granatowy tekst `#0D1326`, niebieskawe tła `#F3F5FA` / `#E9EDF6`, ciemne bloki `#0A1430`);
  - gradienty (fragment H1, ikony grup katalogu) i poświatę;
  - motyw ciemny (`data-theme` + `prefers-color-scheme`);
  - trzeci krój (Caveat, podpis właściciela).
- Pozostałe linie (Instalacje, Software, hub) nie mają jeszcze wizualizacji.
- Ograniczenia: jedna aplikacja dla wszystkich domen, komponenty nie znają koloru linii (ADR-007), WCAG AA, jedna osoba utrzymuje kod.

## Opcje
| Opcja | Zalety | Wady |
|---|---|---|
| A. Zostać przy ADR-007 (grafit/papier dla wszystkich, bez gradientów) | spójność, nic do zmiany | rozjazd z zaakceptowaną wizualizacją, strona Biznes nie wygląda jak wzorzec |
| B. **Neutralne kolory jako tokeny per linia** + motyw ciemny per linia + gradienty w wyznaczonych miejscach | wzorzec 1:1 dla Biznesu, mechanizm gotowy dla kolejnych linii, komponenty dalej nie znają linii | więcej tokenów, testy kontrastu dla dwóch motywów |
| C. Osobny arkusz/komponenty dla Biznesu (`src/sites/biznes`) | szybko | dwa systemy wyglądu, rozjazd stron, łamie „jedna firma” z ADR-007 |

## Decyzja (proponowana): B
1. **Tokeny neutralne per linia.** Obok `--accent*` każda linia ustawia przez `[data-line]` także: `--surface`, `--surface-2`, `--surface-3`, `--ink`, `--ink-2`, `--ink-3`, `--border`, `--surface-dark` (ciemne bloki rytmu). Domyślnie (wszystkie linie bez własnej wizualizacji): biel / papier / grafit z `docs/marka.md`. Biznes: wartości z `docs/design/prokombiznes/tokens.css` (nazwy wizualizacji `--bg`, `--bg2`, `--ink`… mapujemy na nasze; wartości bez zmian).
2. **Motyw ciemny** przez `data-theme="dark"` na `<html>` i `prefers-color-scheme: dark` (gdy użytkownik nie wybrał). Włączony tylko dla linii, która ma zaprojektowany motyw ciemny (dziś Biznes); pozostałe linie zostają jasne. Przełącznik motywu: zapis wyboru w `localStorage` (bez ciasteczek, bez danych osobowych).
3. **Kolory linii i znak bez zmian:** akcent Biznesu to nadal `#244FB0` / `#4A7BE0` z księgi (wizualizacja używa tych samych). Napis PRO-KOM i pliki znaku tylko z `public/brand/` — nie z `docs/design/prokombiznes/boards/media/brand-*`.
4. **Gradienty i poświata tylko w wyznaczonych miejscach** (jako tokeny, nie dowolne wartości w komponentach): fragment H1 strony głównej, kafelki ikon grup katalogu (`catalog-groups.gradient`, ADR-012), poświata hero. Nigdy na znaku, tekście ciągłym ani przyciskach.
5. **Kontrast (WCAG AA) obowiązuje w obu motywach** i jest sprawdzany testem tokenów (jak w S6a) dla każdej pary tekst/tło używanej w komponentach. Ograniczenia wynikające z wartości wizualizacji (policzone 17.10.2026):

   | Token Biznes | Jasny: na `bg` / `bg2` / `bg3` | Ciemny: na `bg` / `bg2` / `bg3` | Wniosek |
   |---|---|---|---|
   | `--ink` `#0D1326` / `#EEF2FB` | 18,45 / 16,91 / 15,73 | 17,64 / 16,67 / 15,42 | tekst — OK |
   | `--ink2` `#4A5470` / `#A6B1C9` | 7,52 / 6,89 / 6,41 | 9,18 / 8,68 / 8,03 | tekst — OK |
   | `--ink3` `#6B7590` / `#7C88A4` | 4,59 / **4,21 / 3,92** | 5,57 / 5,26 / 4,87 | jasny: mały tekst tylko na `bg`/`card`; na `bg2`/`bg3` tylko ≥ 24 px albo przyciemnić |
   | `--acc` `#244FB0` / `#4A7BE0` | 7,45 / 6,83 / 6,35 | 4,90 / 4,63 / **4,28** | ciemny: mały tekst w akcencie nie na `bg3` |
   | `--acc2` `#4A7BE0` / `#8FB0F4` | **4,04 / 3,70 / 3,44** | 9,12 / 8,62 / 7,98 | jasny: tylko dekoracja i duże elementy (≥ 3:1), nie tekst |
   | biały / `#EEF2FB` na `--dark` `#0A1430` | 18,17 / 16,21 | — | tekst na ciemnych kartach — OK |

   `--accInk` na `--acc` (napis przycisku): jasny 7,45, ciemny 4,66 — OK. Obramowania `--line` (1,25–1,29) są dekoracyjne; pola formularzy muszą mieć obramowanie ≥ 3:1 (WCAG 1.4.11) — osobny token.
6. **Tailwind** dalej zna tylko tokeny (S6a); nowe tokeny dochodzą do `@theme`, wartości tylko w `src/styles/tokens.css`.

## Do decyzji Krystiana (przed implementacją)
- **Gradient H1** w wizualizacji: `--acc → --acc2 → fiolet`. Fiolet to kolor linii Software — mieszanie kolorów linii łamie zasadę „każda linia ma swój kolor” z księgi. Propozycja: `--acc → --acc2` bez fioletu.
- **Caveat** (trzeci krój, tylko podpis właściciela): `docs/marka.md` przewiduje dwa kroje. Propozycja: dopuścić wyłącznie do tego jednego elementu, self-hosted jak pozostałe; albo podpis jako obraz SVG (zero dodatkowego fontu).
- **Poświata i siatka tła** (`--glow`, `--grid`, rgba) — dopuszczone jak w wizualizacji czy tylko hero.

## Konsekwencje
- S6b (szkielet strony) dostaje tokeny neutralne per linia i mechanizm motywu ciemnego; wygląd ogólny dla wszystkich domen, wartości Biznesu z wizualizacji. Komponenty używają `--surface*`, `--ink*`, `--accent*`, nigdy wartości.
- `docs/marka.md` opisuje mechanizm i odsyła tu; tabela `--accent-text` z S6a obowiązuje dla linii bez własnej wizualizacji.
- Nowa wizualizacja innej linii = jej wartości w `tokens.css` + test kontrastu, bez zmian w komponentach.
- Brief `prokombiznes-design.md` zostaje jako zapis (odczucie, ruch, zakazy treściowe nadal obowiązują), ale w kolorach i efektach wygrywa wizualizacja + ten ADR.
