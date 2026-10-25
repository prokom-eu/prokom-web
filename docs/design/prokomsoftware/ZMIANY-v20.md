# prokomsoftware.pl — zmiany w wizualizacji v20 (25.10.2026)

Źródło: audyt całej strony (25.10.2026), decyzje Krystiana z tego dnia (ceny, „wszystko z audytu”, telefon „jak aplikacja”) i prośba o sekcję „Dlaczego nie WordPress i PHP” na wzór pro-kom.eu. **Do czasu sesji SWD1 ten plik ma pierwszeństwo przed `docs/strony/prokomsoftware.md` §2–§4, §6–§8 i §13.** Wzorzec: plansze `boards/`, zrzuty `screens/`, stany `stany/` (wszystko odświeżone w v20).

## 1. Nawigacja na telefonie i tablecie (≤ 1080 px) — nowa
- **Nagłówek kompaktowy:** tylko znak i przycisk „Wycena” (`/kontakt`; na stronie głównej `#kontakt`). Górny pasek linii PRO-KOM, przełącznik motywu, „Twój projekt” i hamburger znikają z nagłówka.
- **Dolny pasek (tab bar)** przyklejony do dołu ekranu, z marginesem i rozmyciem tła (`--header-bg`, `backdrop-filter`), z `env(safe-area-inset-bottom)`:
  - Start (`/`), Oferta (`/rozwiazania`), **Kreator** — wyróżniony okrągły przycisk na środku w gradiencie akcentu (`/dobierz`; na głównej `#dobierz`), Kontakt (`/kontakt`), Menu (otwiera arkusz).
  - Aktywna pozycja: kolor `--accent-text` + kreska nad ikoną. Etykiety 12 px, cele dotyku ≥ 44 px.
- **Menu = arkusz od dołu** (`<dialog>`, focus trap, Esc, zamknięcie tapnięciem w tło): uchwyt, „Menu” + zamknij, pole „Czego szukasz?” (otwiera wyszukiwarkę katalogu), karta „Dobierz rozwiązanie · 5 krótkich kroków · 60 s”, 4 kafle oferty z ceną „od” (Strony od 999 zł, Systemy od 2 990 zł, Aplikacje i Automatyzacje „zapytaj o wycenę”), lista: Pełna oferta, Dla branż, Cennik, Darmowy audyt (plakietka „0 zł”), lista „Firma”: O firmie, Jedna firma do wszystkiego, Aktualności i poradnik, Kontakt; przełącznik motywu Jasny/Ciemny (segment), „Bezpłatna wycena”, telefon, adres. Dane: `seed/prokomsoftware/nawigacja.json` → `mobileMenu`, `tabBar`.
- **„Twój projekt” na telefonie:** pigułka nad dolnym paskiem tylko, gdy lista nie jest pusta („Twój projekt · 2 · Zobacz →”), otwiera arkusz z listą, „Wyślij do bezpłatnej wyceny” i „Wyczyść listę”. Na desktopie przycisk w nagłówku też tylko przy niepustej liście.
- Stopka na telefonie: linki w dwóch kolumnach, dolny margines pod pasek.
- Stany: `stany/80-mobile-menu.jpg`, `81-mobile-projekt.jpg`, `82-mobile-pasek.jpg` (i kolejne w `stany/`).

## 2. Desktop: nagłówek i mega menu
- Mega menu: karta bez liczby („Strony, systemy i aplikacje dla firm z Podhala i nie tylko”), nowy rząd **„Dla branż”** (chipy: Budowlanka i ekipy, Pensjonaty i hotele, Gastronomia, Warsztaty i serwisy, Gabinety, Wszystkie →).
- „Dla branż” także w stopce (kolumna „Firma”) i w menu na telefonie.

## 3. Strona główna — nowa kolejność (12 sekcji)
1. Hero + 4 kafle intencji · 2. 8 obszarów · 3. 12 rzeczy · 4. Podglądy na żywo · 5. Jak pracujemy i cena · 6. Kreator · **7. Dlaczego nie WordPress i PHP (nowa)** · 8. Zasady (+ „Czasem powiemy: nie budujcie”) · 9. Realizacje + liczby · 10. FAQ (6) · 11. Kontakt · stopka.
- **Przeniesione na `/o-firmie`:** „Z czego budujemy” (technologie), „Jak robimy strony i systemy”, „Freelancer, agencja czy PRO-KOM”. Szyna sekcji (≥ 1400 px) zaktualizowana.
- **Sekcja „Dlaczego nie WordPress i PHP”** (treść: `strona-glowna.json` → `whyNotWordpress`): 3 fakty ze źródłem (7 966 luk w 2024 r. — Patchstack; 72 h na zgłoszenie wycieku i kary — RODO art. 33 i 83; „0 wtyczek”), tabela porównania 6 wierszy, karta „Masz stronę na WordPressie?” z przyciskami „Sprawdź swoją stronę za darmo” i „Przebudowa od 1 499 zł”, link do wpisu. Na telefonie fakty w karuzeli, tabela jako karty.
- Teksty: „zdalnie w całej Polsce”; eyebrow podglądów „Podglądy na żywo · zanim zapłacisz”; podgląd strony „treść w mniej niż 2,5 s” (próg Google zamiast „1,5 sekundy”); opis prokombiznes.pl w realizacjach bez „porównywarki”; makieta wyceny w procesie z kwotami z cennika (przykład, `strona-glowna.json` → `proceduralMock`).
- **Wzorce mobilne strony głównej** (wysokość przy 390 px spadła z ok. 28 500 px do ok. 15 500 px):
  - hero: jedna kolumna, przyciski na całą szerokość, punkty zaufania jako przewijany rząd pigułek, moduły makiety jako przewijany rząd;
  - 4 kafle intencji w siatce 2×2 (bez opisów);
  - 8 obszarów: pigułki obszarów w przewijanym rzędzie (scroll-snap) + panel szczegółów pod spodem;
  - 12 rzeczy: filtry w przewijanym rzędzie, karty w karuzeli (84% szerokości, podgląd następnej);
  - podglądy: laptop przycięty do szerokości ekranu (bez telefonu i pływających kart);
  - proces: etapy w przewijanym rzędzie, bez makiety „szkic systemu”;
  - realizacje w karuzeli, liczby w siatce 2×2; FAQ w jednej kolumnie.

## 4. Kreator (`/dobierz` i `#dobierz`)
- Plakietki: „5 krótkich kroków · podgląd na żywo · wycena na piśmie” (wszędzie jedna obietnica: 60 s / 5 kroków; strona branży „Złóż system… W 60 sekund”).
- Wynik: cena dla rozmiaru z `Solutions.prices`, termin z `leadTimes`, linia zakresu pod ceną (`kreator.json` → `scopeNotes`); aplikacje, automatyzacje i rozbudowa → „Zapytaj o wycenę”, termin „po krótkiej rozmowie”; opieka „od 149 zł / mies.”.
- Formularz wyceny: sposób kontaktu, **Imię**, telefon albo e-mail, **zgoda** (pole 22 px), komunikaty błędów (`kreator.json` → `send.errors`), przycisk na całą szerokość. Sukces: karta z numerem zgłoszenia i 3 kolejnymi krokami.
- Pominięte kroki w „Opisz po swojemu” wyszarzone (bez przekreślenia). Zmiana potrzeby czyści opis z poprzedniej ścieżki.
- Telefon: kafle 2×2 mieszczą się w ekranie, pigułki kroków przyklejone pod nagłówkiem, „Dalej” przyklejone nad dolnym paskiem, w wyniku najpierw rekomendacja i formularz, **podgląd projektu zwinięty** pod „Pokaż podgląd projektu”.

## 5. Ceny i fakty
- Ceny: `claude/software-cennik.md` / `seed/prokomsoftware/rozwiazania.json` (`prices`, `leadTimes`, `priceNote`), `obszary.json` (`priceFrom`, `priceLabel`). „Rezerwacje online na stronie” usunięte z oferty (`rozwiazania.json` → `removed`), liczby „30 rozwiązań” usunięte z tekstów.
- Fakty: `fakty.json` wypełnione (czas odpowiedzi 1 dzień roboczy, raport z audytu 2 dni robocze, 5–7 dni, 2–12 tyg., 30%, zasady płatności, opieka od 149 zł, 3–4 tygodnie, godziny pn–pt 9:00–17:00, 30 listopada, adres Rabka). Zostają do decyzji szefa: telefon i e-mail Software, adres salonu w Zakopanem, osoba z obsługi, `[WYNIK]`.
- **Jeden cennik (decyzja Krystiana 25.10.2026): obowiązuje cennik z v20.** pro-kom.eu/tworzenie-stron-internetowych wyrównujemy do niego **osobnym zadaniem** (poza SWD1 i poza v20; ceny nie są w kodzie repo, tylko w treści w panelu pro-kom.eu): landing 1 499 → 1 299, strona firmowa z CMS 2 399 → 2 490, rozbudowana 3 499 → 6 990; wizytówka 999 bez zmian.
- **Przed publikacją cen na obu stronach: akceptacja szefa** (Asana „SZEF · Software: cennik”).

## 6. Formularze, strony prawne, ciemny motyw
- Wszystkie formularze: zgoda (`cbx`), komunikat błędu (`ferr`), stan sukcesu z kolejnymi krokami (`fok`), link do `/polityka-prywatnosci`.
- Nowe plansze: **Polityka** (polityka prywatności + analityka bez ciasteczek — wersja robocza do sprawdzenia), **NieZnaleziono** (404), **Dziekujemy** (strona po wysłaniu formularza, osobny adres do pomiaru konwersji).
- Ciemny motyw: makiety (wycena, podgląd kreatora, realizacje) przyciemnione; blok „Czasem powiemy” w ciemniejszym fiolecie (kontrast ≥ 4,5:1); nieaktywne przyciski na `--chip`. **Linki-przyciski mają teraz biały napis także w planszach** (błąd z v19 naprawiony, ADR-015 pkt 8 bez „oczekiwanej różnicy”).

## 7. Podstrony
Zasada dla wszystkich: przyklejony nagłówek (`.pk` ma `overflow-x: clip`, nie `hidden` — `hidden` psuje `position: sticky`), okruszki, na końcu blok kontaktu (kreator · bezpłatna wycena · telefon), stopka z linkami prawnymi. Na telefonie: jedna kolumna, przyciski na całą szerokość, przewijane rzędy zamiast siatek 3–4 kolumn, siatki liczb 2×2. Wzorzec: `screens/<Plansza>-390-light`.

- **Pełna oferta `/rozwiazania` (Katalog):** 29 pozycji (bez „Rezerwacje online”). Karta: cena „od” i termin wersji „Na start”, po rozwinięciu 3 wersje (Na start / Standard / Pełna) z ceną i terminem, linia zakresu (`priceNote`); aplikacje i automatyzacje „Zapytaj o wycenę” · „po krótkiej rozmowie”; opieka „od 149 zł / mies.”, przejęcie „od 990 zł jednorazowo”, audyt „szybki 0 zł”. Eyebrow „Pełna oferta”, tytuł bez liczby. **Telefon:** przyklejony pasek z wyszukiwarką i przyciskiem „Filtry (n)” → arkusz od dołu (`stany/88b`), karty w jednej kolumnie z miniaturą w kolorze kategorii (`stany/88a`). Na końcu blok kontaktu.
- **Rozwiązanie `/rozwiazania/[slug]`:** hero w jednej kolumnie, 4 kafle danych 2×2; demo: na telefonie **interaktywny telefon w czytelnym rozmiarze** zamiast pomniejszonego laptopa + karta „Tablica w biurze, na żywo” (`stany/89a`); cena z `Solutions` (aplikacja: „Zapytaj o wycenę”), „pierwszy etap po 3–4 tygodniach”, opieka od 149 zł; FAQ z zasadami płatności; bez zdania z `[WIEK]`.
- **Branża `/dla-branz/[branza]`:** mapa modułów na telefonie jako siatka 2 kolumn z kartą „3 ekipy” na górze; problemy i „Działa bez zasięgu” w przewijanych rzędach; „Złóż system… **W 60 sekund**”; ceny na kartach z `Solutions` (zlecenia od 3 490, czas pracy i wyceny PDF od 2 990, strona od 2 490; aplikacja i faktury „Zapytaj o wycenę”); przykładowe kwoty zamiast `[KWOTA]`; **FAQ (4 pytania, `branze.json` → `budowlanka.faq`, JSON-LD)**; ciemny blok kontaktu na końcu.
- **Kontakt `/kontakt`:** prawdziwy adres, NIP, godziny pn–pt 9:00–17:00, czas odpowiedzi 1 dzień roboczy; formularz z imieniem, zgodą, błędami i sukcesem (numer + 3 kroki) → przekierowanie na `/dziekujemy`; makieta mapy z przyciskiem „Nawiguj” (link do Map Google — w kodzie prawdziwe osadzenie albo statyczny obraz z linkiem, bez ciasteczek przed zgodą); lista miejsc spotkań; link do polityki.
- **O firmie `/o-firmie`:** hero z kolażem zdjęć (salony, zespół) zamiast liczb — liczby tylko w „W liczbach”; zespół i oba salony ze zdjęciami (komponent `.photo` = miejsce na zdjęcie z opisem, co ma na nim być); **dochodzą sekcje z głównej: „Jak robimy strony i systemy”, „Z czego budujemy” (technologie), „Freelancer, agencja czy PRO-KOM”** — na telefonie jako karuzele (`stany/60`, `70`); historia: „Potem” zamiast nieznanych lat.
- **Jedna firma `/jedna-firma`:** nowa sekcja „Na miejscu” ze zdjęciami obu salonów; linki do linii PRO-KOM prawdziwe (prokombiznes.pl, prokominstalacje.pl, prokomserwis.pl).
- **Audyt `/audyt`:** formularz z etykietami, zgodą, walidacją (czerwone pola + lista błędów) i sukcesem z 3 krokami; „Pięć rzeczy” = 5 kart + wyróżniona karta „Raport na piśmie”; rodzaje audytu 0 / 990 / 1 990 zł z dopiskiem „pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni”; raport w 2 dni robocze.
- **Cennik `/cennik`:** 29 pozycji w 5 zakładkach, każda z 3 cenami i terminami; zakres systemów pod zakładką; aplikacje i automatyzacje „Zapytaj o wycenę”; opieka 149 / 299 / 790 zł z czasem reakcji, przyciski „Wybieram X →” prowadzą do `/kontakt` z wybranym poziomem; „W cenie każdej strony” (8 pozycji); na telefonie tabela jako karty (`stany/89b`).
- **Aktualności `/aktualnosci`:** osobna ilustracja dla każdej kategorii; na telefonie lista kompaktowa. Daty wpisów z `Posts.publishedAt` (w planszy przykładowe, przeszłe).
- **Wpis:** autor i data, CTA audytu w środku tekstu, źródła z datą sprawdzenia i linkami („Ostatnie sprawdzenie danych” = data weryfikacji źródeł, nie przyszła), ramka autora ze zdjęciem, 3 powiązane wpisy.
- **Miasto `/miejscowosci/[miasto]`:** zdjęcie salonu przy Orkana 16B; okoliczne miejscowości jako chipy (bez linków do nieaktywnych stron); ceny z `Solutions` na kartach i w FAQ.
- **Nowe — Polityka `/polityka-prywatnosci`:** baner „wersja robocza”, spis treści (na telefonie przewijane chipy), administrator, cele i podstawy z RODO, odbiorcy, okres przechowywania `[OKRES PRZECHOWYWANIA]`, prawa z art. 15–21, analityka Umami bez ciasteczek, `[DATA AKTUALIZACJI]`. **Projekt — przed produkcją akceptacja szefa/prawnika** (jak strony prawne Biznesu z B11b).
- **Nowe — 404:** wyszukiwarka z podpowiedziami, karta kreatora, 6 kafli popularnych miejsc. Status HTTP 404.
- **Nowe — Dziękujemy `/dziekujemy`:** numer zgłoszenia, 3 kroki, linki do podglądów i aktualności; `noindex`; osobny adres = pomiar konwersji. Zdanie o potwierdzeniu e-mailem tylko, jeśli kod wysyła potwierdzenie (fundament S8 wysyła maile — sprawdzić w SW11a; inaczej usunąć zdanie).

Placeholdery, które zostają do decyzji szefa: `[TELEFON SOFTWARE]`, `[E-MAIL SOFTWARE]`, `[ADRES SALONU W ZAKOPANEM]`, `[TELEFON ZAKOPANE]`, `[OKRES PRZECHOWYWANIA]`, `[DATA AKTUALIZACJI]`, `[WYNIK]`, `[IMIĘ I NAZWISKO]` — osoba z obsługi (zdjęcie i zgoda). Zdjęcia: wszystkie miejsca `.photo` mają opis, co ma być na zdjęciu — sesja zdjęciowa przed produkcją (salony, zespół, praca przy komputerze).

## 8. Model treści i seed — co dochodzi (do ADR-014 w SWD1, kod w SW2a/SW2b/SW3)
| Gdzie | Pole / plik | Po co |
|---|---|---|
| `Solutions` | `prices` i `leadTimes` wypełnione (`rozwiazania.json`); `priceNote` (linia zakresu przy cenie, np. systemy „Na start = jeden moduł na gotowym fundamencie, do 5 użytkowników, bez integracji”) | cena „od” i kreator; `priceFrom`/`leadTime` w seed tylko informacyjnie — w kodzie liczone (ADR-014 rozstrz.) |
| `Solutions` | pusta cena celowo dla aplikacji (3) i automatyzacji (5) → „Zapytaj o wycenę”, termin „po krótkiej rozmowie” | decyzja Krystiana 25.10 |
| seed | `rozwiazania.json` → `removed` (Rezerwacje online na stronie) — **seed pomija**, nie trafia do bazy, indeksu ani sitemap | usunięte z oferty 25.10 |
| `SolutionAreas` | `priceFrom`, `priceLabel` (`obszary.json`) | kafle obszarów i menu („od 999 zł”, „od 2 990 zł”, „zapytaj o wycenę”) |
| `SiteSettings.software.navigation` | `tabBar`, `mobileMenu`, `mobileMenuFooter`, `headerMobile`, `projectPill`, `projectDrawer`, `mega` (rząd „Dla branż”), `footer` („Dla branż”, linki prawne) — `nawigacja.json` | §1–§2 |
| `SiteSettings.software.facts` | `fakty.json` wypełnione; zostają puste: telefon i e-mail Software, adres Zakopane, osoba z obsługi, `[WYNIK]` | §5 |
| `SoftwareSettings.home` | `whyNotWordpress` (fakty ze źródłami, tabela, CTA), `homeOrder` (kolejność 12 sekcji), `proceduralMock` (makieta wyceny w procesie) — `strona-glowna.json` | §3 |
| `SoftwareSettings.wizard` | `scopeNotes`, `priceDisplay` (wybrany rozmiar: cena bez „od”; bez rozmiaru: „od” ceny Na start; brak ceny: „Zapytaj o wycenę”), `mobile`, `badges`, `send` (pola, `errors`, sukces) — `kreator.json` | §4 |
| `Industries` (grupa Software) | `faq` (4 pytania budowlanki, JSON-LD `FAQPage`), `wizardTitle`; w tekstach `{cena:<slug>}` = cena „od” rozwiązania | §7 |
| strony prawne | `/polityka-prywatnosci` (projekt do sprawdzenia), `/dziekujemy` (`noindex`), 404 — treść z plansz Polityka, Dziekujemy, NieZnaleziono | §6 |

## 9. Poprawki po niezależnym przeglądzie (25.10)
- **Eksport danych:** co miesiąc tylko w Opiece Systemy (790 zł); wszędzie indziej „eksport na każde żądanie”, raport co miesiąc od poziomu Standard. Nie obiecywać miesięcznego eksportu w FAQ, zasadach, technologiach ani na stronie rozwiązania.
- **Terminy:** odpowiedź 1 dzień roboczy ≠ wycena. Podgląd i wycena na piśmie: 5–7 dni. Budowa: 1–14 tygodni (wizytówka – portal B2B).
- **RODO w sekcji „Dlaczego nie WordPress”:** za brak zgłoszenia naruszenia (art. 33) kara do 10 mln euro albo 2% obrotu — art. 83 ust. 4 (nie 20 mln / 4%).
- **Pensjonat:** „Na start” i Standard = zapytanie o termin; zaliczka online tylko w wersji Pełnej — także w opisach obszaru „Sklepy i rezerwacje”.
- **Makieta wyceny w procesie:** połączenie z programem do faktur bez kwoty („po sprawdzeniu programu”), suma etapów 1–2 = 8 980 zł netto.
- **Main — dane, których nie przenosić:** w skrypcie planszy zostały stare, niewyświetlane struktury (`OF`/`ofItems` — dawny przegląd oferty, `KM2` — dawny prosty kreator, tablica wyszukiwarki `S`). Źródłem treści jest seed, nie te tablice.
