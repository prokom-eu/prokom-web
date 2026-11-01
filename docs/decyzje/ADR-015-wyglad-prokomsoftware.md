# ADR-015: Wygląd prokomsoftware.pl z wizualizacji — kolory, motyw ciemny, gradient

- **Status:** przyjęta (22.10.2026, SW0); uzupełniona o wizualizację v20 (25.10.2026, SWD1) i v22 (30.10.2026, SWD2 — pkt [propozycja] do potwierdzenia przez Krystiana) — rozstrzygnięcia na końcu
- **Data:** 2026-10-18
- **Decyduje:** Krystian
- **Rozszerza:** ADR-013 (mechanizm tokenów neutralnych per linia i motywu ciemnego). **Doprecyzowuje dla Software** pkt 3 (kolor interfejsu może być ciemniejszą pochodną koloru linii; znak bez zmian) i pkt 4 (lista miejsc z gradientem — niżej). Po przyjęciu dopisać odsyłacz w ADR-013.

## Kontekst
- 18.10.2026 Krystian zaakceptował wizualizację prokomsoftware.pl (`docs/design/prokomsoftware/`, wartości w `tokens.css`).
- Wizualizacja używa neutralnych kolorów z `docs/marka.md` (grafit `#121613`, papier `#F4F5F1`, biel) i fioletu linii. Ma motyw ciemny (domyślny w planszach) i jasny.
- Różnice względem repo:
  1. **Akcent w jasnym motywie:** wizualizacja `#6E45D4` (przyciski) i `#5B33C4` (tekst w akcencie). Repo: `--c-software` `#8B61E3` (księga) i `--c-software-text` `#7E58CD`.
  2. **Gradient H1** kończy się błękitem `#7FD3FF`, a druga poświata (`--glow2`) jest niebieskawa. ADR-013 (rozstrz. „Gradient H1”): kolory linii się nie mieszają; błękit to Biznes.
  3. **Fraunces** w makietach podglądów (udawane strony pensjonatu i restauracji).
  4. Nowe tokeny, których repo nie ma: `--card-2`, `--ink-soft`, `--accent-soft`, `--accent-line`, `--stage`, `--chip`, `--glow-2`, `--dot`, `--header-bg`, `--shadow`.

## Kontrast (policzone 18.10.2026)
| Para | Wynik |
|---|---|
| biały na `#8B61E3` (księga) | **4,27** — za mało dla napisu przycisku 16 px (AA 4,5) |
| biały na `#7E58CD` (`--c-software-text`) | 5,04 |
| biały na `#6E45D4` (wizualizacja) | 6,06 |
| `#5B33C4` na papierze `#F4F5F1` / na `#ECEEE8` / na `#E3E6DF` | 7,06 / 6,61 / 6,13 |
| `#7E58CD` na papierze | 4,60 |
| `#121613` na `#9670EE` (ciemny przycisk) | 5,09 |
| `#B39BF5` na `#121613` / na `#1A1F1B` | 7,76 / 7,11 |

Wyjątki do pilnowania testem są w README wzorca (sekcja „Kontrast”).

## Opcje dla akcentu w jasnym motywie
| Opcja | Zalety | Wady |
|---|---|---|
| A. Księga: `--accent` `#8B61E3`, `--accent-text` `#7E58CD`, przyciski na `#7E58CD` | zgodność z księgą 1:1 | przycisk jaśniejszy i mniej nasycony niż na wizualizacji; dwa odcienie fioletu obok siebie |
| **B. Wizualizacja: `--accent` `#6E45D4`, `--accent-text` `#5B33C4`** (jak `tokens.css`) | wygląda jak zaakceptowany wzorzec, najlepszy kontrast; znak i logo dalej w `#8B61E3` z `public/brand/` | odejście od księgi w kolorze interfejsu (nie znaku) — wpis w `docs/marka.md` |
| C. Mieszana: `--accent` `#8B61E3` dla ikon i gradientów, przyciski i tekst `#6E45D4` / `#5B33C4` | księga widoczna w ikonach | trzeci odcień, więcej tokenów, trudniej utrzymać |

**Rekomendacja: B.** ADR-013 pkt 3 mówi „kolory linii i znak bez zmian” — znak (pliki w `public/brand/`) zostaje w kolorze księgi. Kolor interfejsu to pochodna ciemniejsza, tak jak `--c-<linia>-text` już dziś jest pochodną (S6a). W motywie ciemnym wizualizacja używa `#9670EE` = `--c-software-on-dark` z księgi — bez zmian.

## Decyzja (proponowana)
1. Tokeny Software 1:1 z `docs/design/prokomsoftware/tokens.css` w `src/styles/tokens.css` (`--c-software-light-*`, `--c-software-night-*`) i zmienne semantyczne w `[data-line='software']` i `[data-line='software'][data-theme='dark']` (+ `prefers-color-scheme`).
2. Akcent jasny: opcja **B**. `docs/marka.md`: dopisek „interfejs prokomsoftware.pl: `#6E45D4` / `#5B33C4` (ADR-015); znak bez zmian”.
3. **Gradient H1:** `--accent-text → --accent-2 → --accent` (bez `#7FD3FF`). `--glow-2` fioletowa (`tokens.css`, komentarz „rekomendacja”). Wygląd do porównania ze zrzutem `Main-1440-*/01.jpg` — różnica ma być minimalna.
4. Nowe tokeny semantyczne (lista w kontekście) dochodzą do mechanizmu ADR-013 dla wszystkich linii z wartościami domyślnymi (dla linii bez wizualizacji: `--card-2` = `--surface-2`, `--accent-soft` = przezroczysty akcent 10%, itd.), żeby komponenty nie znały linii.
5. `software` w `DARK_THEME_LINES`. Domyślnie preferencja systemu.
6. Makiety podglądów: zamiast Fraunces systemowy szeryf (`Georgia, 'Times New Roman', serif`). Marka zostaje przy dwóch krojach.
7. **Gradienty — lista dozwolonych miejsc** (ADR-013 pkt 4 dla Software):
   - fragment H1 z klasą `.grad` na 5 stronach z plansz: główna, `/rozwiazania`, strona rozwiązania, strona branży, `/kontakt` (`--grad-h1`);
   - kafle ikon 8 obszarów (`obszary.json` → `gradient`) i karty rozwiązań (`cardGradient`) — wielobarwne, bo rozróżniają obszary, tak jak gradienty grup katalogu Biznesu (tam też jest fiolet). Tylko tło ikony/kafla, nigdy tekst. Lista par kolorów jako tokeny `--grad-area-<key>`; **[SW0]** zostawić wielobarwne (rekomendacja) albo zamienić na odcienie fioletu;
   - poświaty `--glow`, `--glow-2` i siatka `--grid` w hero, kontakcie i ciemnych kartach — jak w planszach.
8. **Napis na przycisku w akcencie zawsze `--accent-ink`.** (Do v19 reguła `.pk a{color:inherit}` w planszach dawała linkom-przyciskom ciemny napis na fiolecie. **W v20 plansze mają biały napis** — dla przycisków to już nie jest różnica; wyjątki w rozstrz. v20.)
9. Test kontrastu (`themes.test.ts`) obejmuje pary Software z README wzorca, łącznie z wyjątkami (`--warn`, `--ok` tylko jako kropki na `surface-3` / `stage` / `accent-soft`).

## Konsekwencje
- SW1 = tokeny + motyw + test kontrastu, bez zmian w komponentach Biznesu.
- Oczekiwane różnice przy porównaniu zrzutów w PR: pełna lista w rozstrz. 8 (z poprawką v20).

## Rozstrzygnięcia (SW0, Krystian 22.10.2026)
1. **Akcent w jasnym motywie: opcja B** (D1). `--accent` `#6E45D4` (biały napis 6,06), `--accent-text` `#5B33C4` (7,73 na białym, 7,06 na papierze). Do tego **`--c-software-text` = `#5B33C4`** zamiast `#7E58CD` — jeden odcień tekstu Software na wszystkich stronach (dziś token używa tylko test). Znak i pliki `public/brand/` bez zmian (`#8B61E3`). Ciemny motyw: `#9670EE` / `#B39BF5` jak w `tokens.css`.
2. **Gradient H1 bez błękitu** (D2): `--grad-h1` = `--accent-text → --accent-2 → --accent`, tylko na 5 stronach z pkt 7.
3. **`--glow-2` fioletowa** (D3), jak rekomendacja w `tokens.css`.
4. **Gradienty 8 obszarów, kafli intencji i kart rozwiązań zostają wielobarwne** (D4) — wyłącznie jako tło kafla ikony lub miniatury karty, nigdy tekst ani przycisk; pary kolorów jako tokeny `--grad-area-<key>` (wartości z `obszary.json`), tak jak gradienty grup katalogu Biznesu.
5. **Fraunces → `Georgia, 'Times New Roman', serif`** w makietach podglądów (D5). Marka zostaje przy dwóch krojach.
6. Pkt 8 decyzji (biały napis na przyciskach-linkach) i pkt 9 (test kontrastu z wyjątkami z README) bez zmian.
7. **Ikony:** wspólny zestaw z Biznesem, przy kolizji nazw rysunek Biznesu (ADR-014, rozstrz. 8) — oczekiwana różnica przy porównaniu zrzutów.
8. **Oczekiwane różnice przy porównaniu zrzutów** (pełna lista, po v20): gradient H1 bez błękitnej końcówki (plansze v20 nadal mają `#7FD3FF`); rysunki 11 ikon; brak pola pliku w kreatorze; poprawione teksty ze spec. §13 pkt 18–22; różnice z rozstrz. v20 pkt 3–5 niżej. (Biały napis na przyciskach-linkach oraz pole „Imię” i checkbox zgody nie są już różnicą — v20 ma je w planszach.)

## Rozstrzygnięcia v20 (SWD1, Krystian 25.10.2026)
1. **Pkt 8 decyzji bez „oczekiwanej różnicy” dla przycisków-linków** — w v20 plansze mają biały napis. Zasada `--accent-ink` na akcencie zostaje.
2. **Warstwa mobilna (dolny pasek, arkusze, pigułka „Twój projekt”) — tylko istniejące tokeny, bez nowych kolorów:** pasek `--header-bg` + rozmycie, obrys `--border`; etykiety `--ink-2`, aktywna `--accent-text` + kreska `--accent`; arkusze `--surface` / `--card` / `--chip` / `--accent-soft`; przyciemnienie tła arkusza — przezroczysta czerń (jak tło `<dialog>` w B3b), nie token koloru. v20 nie dodaje kolorów do `tokens.css`.
3. **Nowe miejsca z gradientem** (dopisane do listy z pkt 7): okrągły przycisk **Kreator** w dolnym pasku i karta **„Dobierz rozwiązanie”** w arkuszu menu — gradient `--accent → --accent-2` (jak plansza). Napis i ikona na tym gradiencie: **`--accent-ink`** (jasny: biały; ciemny: grafit). Oczekiwane różnice: w ciemnym motywie plansza ma białą ikonę Kreatora na jasnym gradiencie (`stany/82b`, ok. 2–3,6:1 — za mało), a w jasnym karta w menu ma ciemny napis na fiolecie (`stany/80`, ok. 3:1).
4. **Pigułka „Twój projekt”** ma odwrócone kolory (tło `--ink`, tekst `--surface`). Akcent „Zobacz →” z planszy (`--accent-2` na odwróconym tle) ma za mały kontrast w obu motywach (ok. 3,9:1 w jasnym, ok. 1,8:1 w ciemnym) — w kodzie `--accent-text` **przeciwnego motywu** z istniejącej palety (`--c-software-night-accent-text` w jasnym, `--c-software-light-accent-text` w ciemnym; ≥ 7:1). Oczekiwana różnica.
5. **Blok „Czasem powiemy: nie budujcie”** (zasady): plansza ma gradient z wartości spoza tokenów (`#7E3FC4`, `#8B4ACB`). W kodzie gradient z istniejącej palety: `--c-software-light-accent-text → --c-software-light-accent` w obu motywach, biały napis (≥ 6:1). Różnica odcienia minimalna.
6. **Test kontrastu** (`themes.test.ts`, SW4) dostaje pary z pkt 3–5 (napis/ikona na gradiencie akcentu w obu motywach, akcent pigułki, napis bloku „Czasem powiemy”).

## Rozstrzygnięcia v22 (SWD2, 30.10.2026)

Wizualizacja v21 + v22 (ciemna stopka, okno szczegółów oferty z miniaturami, kreator z biletem wyceny). Zasada bez zmian: **żadnych nowych wartości kolorów** — nowe tokeny semantyczne to wyłącznie odwołania (`var(...)`) do istniejącej palety w `src/styles/tokens.css`. Plansze v22 mają w stopce i bilecie wartości spoza palety (`#0B0E0C`, `#101411`, `#AEB5AF`, `#C7B5FA`, gradient `#7C55E6 → #9A5BD8`) — w kodzie zastępujemy je niżej (oczekiwane różnice, pkt 6). Pkt oznaczone **[propozycja]** potwierdza Krystian (plan §3b); kontrasty policzone 30.10.2026 wzorem WCAG 2.1.

1. **Ciemna stopka — tokeny z istniejącej palety [propozycja]** (SWR2). Nowe tokeny semantyczne z wartościami domyślnymi dla wszystkich linii (pkt 4 decyzji — komponent nie zna linii), stopka ma `data-surface="dark"` (linki i obrys fokusu na `--accent-on-dark`):

   | Token | Jasny motyw | Ciemny motyw | Kontrast |
   |---|---|---|---|
   | `--footer-bg` | `--c-grafit` (`#121613`) | `--c-software-night-surface-dark` (`#0E0B18`, ciemniejsza od tła strony `#121613` — plansza: „w ciemnym motywie ciemniejsza”, delikatnie fioletowa) | — |
   | `--footer-text` | `--c-papier` | `--c-papier` | 16,68 / 17,76 |
   | `--footer-muted` | `--c-software-night-ink-2` (`#B5BBB5`) | to samo | 9,34 / 9,95 |
   | `--footer-line` | `--c-software-night-border` (dekoracyjna kreska i obrys kart) | to samo | — |
   | `--footer-eyebrow` | `--c-software-night-accent-text` (`#B39BF5`) | to samo | 7,76 / 8,26 |
   | `--footer-ok` (SWR2: ptaszki gwarancji, plakietka „0 zł” na własnym tle `/16`) | `--c-software-night-ok-text` (`#7BD36A`) | to samo | ≥ 4,5 — test `themes.test.ts` (także na tle plakietki) |

   - **Kolory linii w „Jedna firma, sześć adresów”**: wyłącznie `--c-<linia>-on-dark` z księgi (`prokom`, `biznes`, `instalacje`, `software`, `tech`, `zakopane`) — kreska i znak; nazwa i opis karty w `--footer-text` / `--footer-muted` (Biznes 4,52 / 4,82 i Tech 4,54 / 4,84 — na granicy AA, więc kolor linii nie niesie tekstu).
   - **Główny przycisk pasa CTA:** gradient `--c-software-light-accent-text → --c-software-light-accent` w obu motywach, biały napis (7,73 / 6,06) — jak blok „Czasem powiemy” (v20 pkt 5). Drugorzędny: obrys `--footer-line`, napis `--footer-text`.
   - **Poświata:** `--glow` / `--glow-2` (pkt 7 decyzji — dopisujemy stopkę do listy miejsc z poświatą).
2. **Akcent pigułki „Twój projekt” — z przeciwnego motywu** (potwierdza v20 pkt 4, bez zmian w tokenach): „Zobacz →” w `--c-software-night-accent-text` (jasny motyw) / `--c-software-light-accent-text` (ciemny), ≥ 7:1. v21 dokłada tylko zachowanie: pigułka ukryta na `/kontakt` (spec. §3.2).
3. **Okno szczegółów oferty** (SWR3): tło okna `--surface` / `--card`, przyciemnienie tła strony — przezroczysta czerń z rozmyciem (jak `<dialog>` w B3b i v20 pkt 2, nie token koloru); nagłówek w kolorze kategorii — 7 wariantów z istniejących `--grad-area-<key>` (strona → `www`, system → `sys`, aplikacja → `app`, automatyzacja → `auto`, opieka → `care`, audyt → `aud`, ratunek/przejęcie → `plug`) — tylko tło, nigdy tekst (pkt 7 decyzji); karta „W cenie” `--accent-soft` + obrys `--accent-line`, ✓ na `--ok` (kropka/ikona), „+ dochodzi” w `--accent-text`; lepki pasek `--header-bg` z rozmyciem; cień przy dolnej krawędzi = `--shadow-raised`.
4. **Miniatury rozwiązań w ciemnym motywie [propozycja]:** pliki SVG mają własne tło (działają w obu motywach); w ciemnym motywie lekko przyciemnione filtrem jasności (`filter: brightness(…)` przez klasę narzędziową pod `[data-theme='dark']`) — bez nowych kolorów i bez drugiego kompletu plików. Kolory wewnątrz SVG to ilustracja (jak zdjęcie), nie kolory interfejsu — nie przechodzą przez tokeny; SWR1 sprawdza, że strażnik surowych kolorów nie skanuje `public/software/rozwiazania/` (albo dodaje wyjątek z komentarzem).
5. **Bilet „Twoja wycena” w kreatorze i plakietki wyceny [propozycja]** (SWR4): gradient jak główny przycisk stopki (pkt 1) z białym napisem w obu motywach — gradient `--accent → --accent-2` w ciemnym motywie dałby biały napis na jasnym fiolecie (< 3:1, ten sam problem co v20 pkt 3). Belka ceny na telefonie: `--header-bg` z rozmyciem i pełnym tłem (v21), obrys `--border`.
6. **Oczekiwane różnice przy porównaniu zrzutów (dopisane do rozstrz. SW0 8):** stopka — tło grafitowe / `#0E0B18` zamiast `#101411` / `#0B0E0C`, opisy `#B5BBB5` zamiast `#AEB5AF`, eyebrow `#B39BF5` zamiast `#C7B5FA`, przycisk pasa CTA w gradiencie z palety zamiast `#7C55E6 → #9A5BD8`; bilet kreatora w gradiencie z palety; gradient H1 nadal bez błękitnej końcówki (plansze v22 też ją mają).
7. **Test kontrastu** (`themes.test.ts`, SWR2–SWR4) dostaje pary: `--footer-text`, `--footer-muted`, `--footer-eyebrow` na `--footer-bg` (oba motywy), napis na gradiencie przycisku stopki i biletu, `--c-<linia>-on-dark` na `--footer-bg` (≥ 3:1 dla kreski, informacyjnie AA).

## Rozstrzygnięcia v23 (Krystian, 01.11.2026 — wizualizacja finalna)

Krystian po przeglądzie wersji lokalnej: kolory wyglądają „jak z generatora AI” — gradienty fiolet–róż–błękit, poświaty, wielokolorowe ikony. Decyzja: **fiolet Software zostaje jako jeden płaski akcent** (księga znaku, `--c-software*`), baza to grafit i papier PRO-KOM. Te punkty **zastępują** zapisy v20 pkt 3–5 i v22 pkt 1, 3, 5 tam, gdzie mówią o gradientach i poświatach. Zasada bez zmian: żadnych nowych wartości poza `src/styles/tokens.css`.

1. **Bez gradientów akcentu:** `--grad-h1` = płaski `--accent-text`; przyciski, plakietki, bilet wyceny, „Czasem powiemy”, pas CTA stopki — płaskie tło (`--accent` z `--accent-ink` albo ciemny fiolet `--c-software-light-accent-text` z białym napisem, jeśli potrzebny kontrast ≥ 4,5:1 w obu motywach).
2. **Bez poświat i pierścieni:** `--glow` = neutralny cień (czerń z przezroczystością), `--glow-2` przezroczysty; poświaty hero, pierścienie makiety, „podłogi” pod makietami, obracające się gradienty w ciemnych blokach — usunięte.
3. **Ikony jednym kolorem:** obszary, intencje, potrzeby w kreatorze, kafle menu, kategoria w oknie oferty — tło `--accent-soft`, ikona `--accent-text`; aktywna / najechana: `--accent` + `--accent-ink`. `--grad-area-*` znikają (kolory obszarów nie są już używane w UI).
4. **Ciemne bloki grafitowe:** `--surface-dark` i `--footer-bg` w obu motywach z grafitu księgi (wizualizacja: `#151A16`, wartość dobrać z palety: `--c-grafit` lub jego ciemniejszy wariant — bez fioletowego `#0E0B18`/`#171226`).
5. **Tła sekcji płaskie:** `--stage` neutralny (`--surface-2`), żadnych fioletowych mgieł (`radial-gradient` z akcentem) w tłach sekcji i kart.
6. **Miniatury rozwiązań:** tła na papierze (tabela w `ZMIANY-v23` §3), w ciemnym motywie dalej lekko przyciemnione (v22 pkt 4).
7. **Pasek przewijania** linii Software: cienki, kciuk z akcentu zmieszanego z `--border`, przy najechaniu `--accent`.
8. **Oczekiwane różnice przy porównaniu zrzutów** — znikają te z v20/v22 dotyczące gradientów; kod ma wyglądać jak zrzuty v23.
9. **Test kontrastu** (`themes.test.ts`): pary na płaskich tłach zamiast par na gradientach.
