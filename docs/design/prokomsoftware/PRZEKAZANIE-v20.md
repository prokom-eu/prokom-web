# prokomsoftware.pl — przekazanie wizualizacji v20 (25.10.2026)

Wizualizacja v20 zastępuje wzorzec z 18.10 (`boards/`, `screens/`, `stany/` w tym folderze są już nowe). Co się zmieniło i dlaczego: `ZMIANY-v20.md` — **do czasu sesji SWD1 ma pierwszeństwo przed spec. §2–§4, §6–§8, §13, ADR-014 i planem SW.**

## 1. Kolejność w repo

1. **Wgranie łatki** (gałąź `docs/prokomsoftware-v20`, PR do `develop`, sam kopiuj-wklej, bez zmian w kodzie) — prompt 2.1.
2. **SWD1 — wizualizacja v20 w dokumentach** (bez kodu) — prompt 2.2.
3. Dalej plan SW bez zmiany kolejności: **SW2a → SW3 → SW4 → SW9 → SW2b (po scaleniu B8/B10/B11) → SW7 → SW5 → SW6 → SW8a/b → SW10 → SW11a/b → SW12**, z zakresami po SWD1 (tabela 3).

Pauza Software na produkcję Biznesu zostaje. SWD1 to same dokumenty — można zrobić w każdej chwili (w CI pomija e2e).

## 2. Prompty

### 2.1 Wgranie łatki
```
Utwórz gałąź docs/prokomsoftware-v20 od develop. Usuń stare zrzuty: git rm -r -q docs/design/prokomsoftware/screens docs/design/prokomsoftware/stany (v20 ma nowy komplet i inne nazwy stanów). Potem rozpakuję łatkę prokomsoftware v20 do katalogu głównego repo (docs/design/prokomsoftware/ i seed/prokomsoftware/) — poczekaj, aż napiszę „gotowe”. Sprawdź git status: zmienione mają być tylko pliki w docs/design/prokomsoftware/ i seed/prokomsoftware/ — jeśli coś innego, zatrzymaj się i napisz. Nie formatuj seed Prettierem (jest w ignorowanych). Commit „docs(software): wizualizacja v20 — telefon jak aplikacja, ceny, nowe strony”, PR do develop (squash). Nie zmieniaj spec., ADR ani planu — to robi SWD1.
```

### 2.2 SWD1 — wizualizacja v20 w dokumentach (bez kodu)
```
/zadanie SWD1 — wizualizacja v20 prokomsoftware w dokumentach
Przeczytaj CLAUDE.md, docs/STAN.md, docs/design/prokomsoftware/ZMIANY-v20.md (całość), PRZEKAZANIE-v20.md, README.md tego folderu, docs/strony/prokomsoftware.md, docs/decyzje/ADR-014-*.md, ADR-015-*.md, docs/zadania/prokomsoftware.md. Obejrzyj screens/Main-390-light/01–04.jpg, stany/80–89 (telefon), screens/Main-1440-light/01.jpg, Polityka-1440-light/01.jpg. Nie pisz kodu.

Wnieś ZMIANY-v20.md do dokumentów tak, żeby po tej sesji ZMIANY-v20.md był już tylko historią:
1. spec. docs/strony/prokomsoftware.md: §2 (adresy: /polityka-prywatnosci, /dziekujemy, 404; „Rezerwacje online” poza ofertą), §3 (nagłówek ≤1080 px, dolny pasek, arkusz menu, arkusz „Twój projekt”, mega menu z „Dla branż”), §4 (nowa kolejność 12 sekcji, sekcja „Dlaczego nie WordPress i PHP”, przeniesienia na /o-firmie, wzorce mobilne każdej sekcji), §5–§6 (podstrony wg ZMIANY §7), §6.3 (kreator: ceny wg rozmiaru, scopeNotes, „Zapytaj o wycenę”, formularz z imieniem i zgodą, podgląd zwinięty na telefonie), §7 (formularze: błędy, sukces, /dziekujemy), §8 (telefon: zasady z ZMIANY §1 i §3 — przewijane rzędy ze scroll-snap, karuzele 84%, siatki 2×2, sticky elementy kreatora, safe-area), §13 (teksty).
2. ADR-014: nowe pola wg ZMIANY §8 (Solutions.priceNote; rozwiązania z `removed` w seed są pomijane — nie trafiają do bazy, bez nowego statusu; SiteSettings.software.navigation: tabBar, mobileMenu, mobileMenuFooter, headerMobile, projectPill, projectDrawer, mega z rzędem „Dla branż”, footer z linkami prawnymi; SoftwareSettings.home.whyNotWordpress/homeOrder/proceduralMock, wizard.scopeNotes/send.errors, Industries.software.faq/wizardTitle, Cities.faq, strony prawne). Dopisz rozstrzygnięcie „v20 (25.10)”. Ceny w seed są wypełnione (decyzja Krystiana 25.10) — puste pole ceny nadal = „cena po rozmowie”, ceny aplikacji i automatyzacji celowo puste („Zapytaj o wycenę”).
3. ADR-015: pkt 8 bez „oczekiwanej różnicy” (linki-przyciski mają biały napis także w planszach); tokeny warstwy mobilnej (tab bar, arkusze) — tylko istniejące tokeny, bez nowych kolorów.
4. Plan docs/zadania/prokomsoftware.md: zakresy sesji wg tabeli 3 z PRZEKAZANIE-v20.md (SW4: dolny pasek + arkusze; SW8a: zasady + „Dlaczego nie WordPress”; SW11b: /o-firmie z technologiami, „jak robimy” i porównaniem; SW11b: Polityka, 404, Dziękujemy; SW12: zdarzenia analityki z menu i paska).
5. README wzorca jest już zaktualizowany w łatce (16 plansz, stany 01–89, „Telefon (v20)”) — sprawdź tylko spójność ze spec. Oczekiwana różnica „gradient H1 bez błękitu” zostaje (plansze mają błękitną końcówkę); znika tylko różnica o ciemnym napisie przycisków-linków.
6. docs/STAN.md: wpis SWD1 i „Następny krok: SW2a (z polami v20)”.
Na koniec wypisz: co z ZMIANY-v20 nie pasuje do kodu albo przyjętych ADR (sprawdź src/collections/*, lib/brand/theme.ts, src/styles/tokens.css) i wymaga mojej decyzji. Gałąź docs/prokomsoftware-swd1, PR do develop.
```

### 2.3 Dopisek do każdej sesji z UI (do promptu 4.1 z planu)
```
Wzorzec telefonu jest częścią zakresu, nie poprawką na koniec: zrzuty 390 px (screens/<Plansza>-390-light, Main także -390-dark) i stany 8x–9x. Przed PR zrób zrzuty Playwright przy 390 i 360 px i sprawdź: zero poziomego przewijania strony (document.scrollingElement.scrollWidth = szerokość okna), żaden element nie wystaje poza ekran, cele dotyku ≥ 44 px, tekst ≥ 12 px, dolny pasek nie zasłania treści (padding-bottom pod pasek), arkusze z focus trap i Esc.
```

## 3. Zakresy sesji po v20 (do wpisania w plan w SWD1)

| Sesja | Co dochodzi / zmienia się w v20 |
|---|---|
| SW2a | pola z ZMIANY §8: `Solutions.priceNote`, `SiteSettings.software.navigation` (tabBar, mobileMenu, mobileMenuFooter, headerMobile, projectPill, projectDrawer, mega, footer), `SoftwareSettings.home` (whyNotWordpress, homeOrder, proceduralMock), `wizard.scopeNotes`, `wizard.send.errors` |
| SW2b | `Industries.software.faq`, `wizardTitle`; `Cities.faq` |
| SW3 | seed v20 (ceny wypełnione, „Rezerwacje online” pominięte przy imporcie, branża z FAQ); test: żadne rozwiązanie z `removed` nie trafia do bazy ani indeksu |
| SW4 | **telefon jak aplikacja:** nagłówek kompaktowy (znak + „Wycena”), dolny pasek 5 pozycji z wyróżnionym Kreatorem, arkusz menu (`<dialog>`), pigułka i arkusz „Twój projekt”, przełącznik motywu w arkuszu, stopka 2 kolumny; desktop: mega menu z rzędem „Dla branż”, „Twój projekt” tylko przy niepustej liście. Stany 80–82. |
| SW9 | katalog na telefonie wg ZMIANY §7 (arkusz filtrów, chipy w przewijanym rzędzie, karty) |
| SW7 | ceny wg rozmiaru z `prices`, `scopeNotes`, „Zapytaj o wycenę”, formularz z imieniem, zgodą i błędami, sukces z 3 krokami; telefon: kafle 2×2, przyklejone kroki i „Dalej”, podgląd zwinięty |
| SW5 | nowa kolejność; wzorce mobilne sekcji 1–3 (pigułki obszarów, karuzela 12 rzeczy) |
| SW6 | podglądy: laptop przycięty na telefonie; proces: przewijane etapy, makieta wyceny z cennika |
| SW8a | **zasady + „Dlaczego nie WordPress i PHP”** (technologie, jak robimy i porównanie przechodzą do SW11b) |
| SW8b | realizacje w karuzeli, liczby 2×2, FAQ jedna kolumna, kontakt z błędami i sukcesem |
| SW10 | rozwiązanie i branża wg ZMIANY §7 (FAQ branży, „W 60 sekund”, ceny z `Solutions`) |
| SW11a | kontakt (adres, NIP, godziny, mapa z „Nawiguj”), audyt, cennik (ceny z panelu, opieka 149/299/790) |
| SW11b | /o-firmie z sekcjami technologie, jak robimy, porównanie; /jedna-firma; aktualności i wpis; miejscowość; **/polityka-prywatnosci, 404, /dziekujemy** |
| SW12 | zdarzenia: `menu_open`, `tabbar_click`, `wizard_step`, `form_error`, `form_sent`, wejście na `/dziekujemy` jako konwersja |

## 4. Przed produkcją (bez zmian w zasadzie)
- Ceny i terminy: **akceptacja szefa**; jeden cennik dla pro-kom.eu i prokomsoftware.pl (`ZMIANY-v20.md` §5).
- Placeholdery do uzupełnienia w panelu: `[TELEFON SOFTWARE]`, `[E-MAIL SOFTWARE]`, `[ADRES SALONU W ZAKOPANEM]`, `[TELEFON ZAKOPANE]`, `[OKRES PRZECHOWYWANIA]`, `[DATA AKTUALIZACJI]`, `[IMIĘ I NAZWISKO]` (osoba z obsługi), `[WYNIK]`. Skan SW12 blokuje produkcję, jeśli zostaną.
- Polityka prywatności: projekt — sprawdzenie przez szefa/prawnika.
