# Pakiet dla Claude Code — prokombiznes.pl z wizualizacji

> **Rozpakowane 17.10.2026** (gałąź `docs/prokombiznes-wizualizacja`): pliki są już w repo pod ścieżkami z tabeli poniżej; ADR z pakietu to **ADR-012** (w repo ADR-008 był zajęty), decyzja o kolorach i trybie ciemnym — **ADR-013**. Sekcja 1 zostaje jako zapis przekazania.

Stan na 17.10.2026. Ten pakiet zawiera wszystko, czego Claude Code potrzebuje, żeby zbudować prokombiznes.pl jak na wizualizacji. Claude Code nie widzi czatu ani artefaktu, więc w repo musi być komplet.

## 1. Co wrzucić do repo `prokom-web`

Skopiuj foldery **z zachowaniem ścieżek** do katalogu głównego repo:

| Z pakietu | Do repo | Co to |
|---|---|---|
| `docs/strony/prokombiznes.md` | `docs/strony/prokombiznes.md` | **Specyfikacja**: strony, sekcje, zachowania, kryteria akceptacji, etapy |
| `docs/adr/ADR-008-katalog-i-model-tresci.md` | `docs/decyzje/ADR-012-katalog-i-model-tresci-prokombiznes.md` (przenumerowany) | Model danych: kolekcje Payload, adresy, SEO, zapytania, ikony |
| `docs/design/prokombiznes/` | `docs/design/prokombiznes/` | Wygląd: zrzuty (jasny/ciemny, 1440/390), plansze HTML, media, CSS, tokeny |
| `seed/prokombiznes/` | `seed/prokombiznes/` | Dane startowe (JSON): katalog 67 pozycji, kreator, wyszukiwarka, ikony, opis mediów |
| `00-CZYTAJ-NAJPIERW.md` (ten plik) | `docs/design/prokombiznes/PRZEKAZANIE.md` | Plan sesji i gotowe polecenia — żeby Claude Code też je widział |

Potem:
1. Gałąź `docs/prokombiznes-wizualizacja` → commit „docs: specyfikacja i wzorzec wyglądu prokombiznes.pl” → PR do `develop`.
2. W `docs/STAN.md` dopisz w „Następne”: budowa prokombiznes.pl wg `docs/strony/prokombiznes.md`, §10.
3. Rozmiar ok. 25 MB, w tym zrzuty ok. 18 MB i media ok. 5 MB.
   - Jeśli nie chcesz tego w historii gita, wrzuć `docs/design/prokombiznes/screens/` do Git LFS. Albo trzymaj zrzuty lokalnie i dodaj je do `.gitignore`, ale wtedy na drugim komputerze ich nie będzie.
   - **Rekomendacja: zwykły commit.** To jednorazowo 25 MB, a oba komputery mają wtedy ten sam wzorzec.

## 2. Jak Claude Code ma z tego korzystać

- **Kolejność czytania:**
  1. `docs/strony/prokombiznes.md`
  2. `docs/design/prokombiznes/README.md`
  3. `ADR-012`
  4. przy każdej sekcji zrzuty z `screens/` i odpowiedni fragment planszy z `boards/`
- **Zrzuty** to obraz celu.
- **Plansze** to dokładne teksty i wartości.
  - Podgląd na żywo: `npx serve docs/design/prokombiznes/boards`, potem `index.html` w przeglądarce.
  - Działają filtry, mega menu, wyszukiwarka i lista zapytania, więc można sprawdzić zachowanie.
- **Teksty z plansz są uzgodnione.** Przenosimy je, a nie piszemy od nowa.
- Punkty **[SZEF]** budujemy z tekstem z planszy jako pola w panelu. Przed publikacją potwierdzasz je z szefem (lista w spec. §13).

## 3. Proponowany podział na sesje Claude Code

Zasada: jedna sesja = jedno zadanie = jedna gałąź = jeden PR. Kolejność odpowiada §10 specyfikacji.

| # | Zadanie | Gotowe, gdy |
|---|---|---|
| 1 | Tokeny, fonty, motyw jasny/ciemny, kontener, przyciski, karty, ikony | strona testowa z komponentami wygląda jak `screens/` |
| 2 | Kolekcje Payload z ADR-012 + seed z `seed/prokombiznes/` | panel ma 67 produktów ze zdjęciami, 20 kategorii, 27 marek |
| 3 | Nagłówek, mega menu, Branże ▾, stopka, górny pasek, menu i dolny pasek na telefonie, pasek sezonowy | zgodne z `Main` i `Mobile` (01.jpg) |
| 4 | Lista zapytania (store + szuflada + toast) i wyszukiwarka (`lib/search.ts` + testy) | kryteria 2 i 3 ze spec. §9 |
| 5 | Katalog `/oferta` + karta produktu | kryterium 4, zgodne z `Katalog` i `KatalogM` |
| 6 | Strona produktu | zgodne z `Produkt` |
| 7 | Strona główna (sekcje 1–12) | zgodne z `Main` i `Mobile`, jasny i ciemny |
| 8 | `/zapytanie`, `/kontakt`, API zapytań + e-mail + Playwright | kryterium 5 |
| 9 | `/opieka-it`, `/gopos`, `/insert` | zgodne z planszami |
| 10 | Kategoria (bez porównywarki), branże ×3, kreator | zgodne z planszami |
| 11 | O firmie, aktualności + wpis KSeF, strony prawne, sitemap, JSON-LD, Lighthouse | kryteria 6–9 |

**Jeśli zabraknie czasu do 26.10**, tniemy od końca: plan firmy statyczny → branże 2–3 → kreator. Jakości nie tniemy.

## 4. Gotowe polecenia do Claude Code

**Sesja 0, przegląd pakietu** (bez kodu, po wrzuceniu plików):
```
Przeczytaj CLAUDE.md, docs/STAN.md, docs/strony/prokombiznes.md, docs/design/prokombiznes/README.md i docs/decyzje/ADR-012-katalog-i-model-tresci-prokombiznes.md. Obejrzyj zrzuty docs/design/prokombiznes/screens/Main-1440-light/01.jpg–03.jpg i Katalog-1440-light/01.jpg. Nie pisz kodu. Napisz: (1) co jest niejasne albo sprzeczne z istniejącymi ADR-ami i docs/marka.md, (2) plan zadań 1–11 z docs/design/prokombiznes/PRZEKAZANIE.md z oceną ryzyka terminu 26.10, (3) jakie komponenty wspólne wydzielisz.
```

**Każda kolejna sesja** (podmień numer i nazwę):
```
/zadanie prokombiznes #<N> — <nazwa zadania>
Źródła: docs/strony/prokombiznes.md (§<numer sekcji>), docs/design/prokombiznes/README.md, ADR-012. Wzorzec wyglądu: docs/design/prokombiznes/screens/<Plansza>-1440-light/ i -390 / -dark, treści i wartości: docs/design/prokombiznes/boards/<Plansza>.dc.html.
Zasady: teksty przenoś z planszy bez zmian; tokeny tylko z tokens.css; brak cen, leasingu i rat; dane kontaktowe i obietnice [SZEF] z globali Payload. Po zbudowaniu porównaj zrzut Playwright (1440 i 390, jasny i ciemny) ze screens/ i wypisz różnice przed PR.
```

**Porównanie z wzorcem** (na koniec każdej sesji z UI):
```
Zrób zrzuty Playwright pełnej strony <adres> przy 1440 i 390 px w obu motywach i porównaj je z docs/design/prokombiznes/screens/<Plansza>-*. Wypisz różnice w kolejności sekcji, kolorach, odstępach i brakujących elementach. Popraw to, co odbiega, zanim otworzysz PR.
```

## 5. Ważne

- **Media:**
  - zdjęcia produktów i logo pochodzą od producentów i partnerów; przed publikacją potwierdź, że możemy ich używać (materiały partnerskie);
  - **logo klientów** (`klient-*`) idą na produkcję tylko z pisemną zgodą — w seedzie mają `wymagaZgody`;
  - znak PRO-KOM bierz z paczki `PRO-KOM_znak_2026-10` (`public/brand/`), a nie z `brand-*` w mediach.
- **Kolory:** wizualizacja zastępuje brief z 15.10 (tam był grafit i papier, bez gradientów). Jeśli `docs/marka.md` ma inne tło i tekst dla Biznesu, Claude Code poprawi `marka.md` w PR #1, a Ty to zatwierdzasz.
- **Skrzynka zapytań (ADR-003)** jest nadal otwarta. Spec zakłada adapter: na 26.10 zapis do Payload, później przełączenie na PRO-KOM System bez zmian we frontendzie.
- **Fakty do sprawdzenia przed publikacją** (spec. §13):
  - ulga 700 zł;
  - parametry Elzab i Fawag;
  - statusy partnerów;
  - liczby GoPOS na stronie GoPOS;
  - przepisy we wpisie KSeF (każdy z linkiem do źródła).
