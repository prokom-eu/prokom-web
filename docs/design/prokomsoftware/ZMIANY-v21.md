# prokomsoftware.pl — zmiany w wizualizacji v21 (29.10.2026)

Źródło: prośby Krystiana z 28.10 (kreator „mega wizualny, prosty, inteligentny”, okno szczegółów oferty, ciemna stopka, kontakt z liniami PRO-KOM, technologie i „Jak robimy” na stronie głównej, strona główna „inteligentnie poukładana”, telefon na tym samym poziomie) i jego decyzje cenowe z 28.10. **v21 ma pierwszeństwo przed `ZMIANY-v20.md`; oba pliki mają pierwszeństwo przed spec. do czasu sesji SWD1.** Wzorzec: `boards/`, `screens/`, `stany/` (odświeżone w v21).

> **29.10 (popołudnie) — v22: jedna cena „od”.** Wersji Na start / Standard już nie ma. **§11 wygrywa nad §1, §3, §4 i §10 wszędzie tam, gdzie mowa o dwóch wersjach, przełączniku, tabeli porównania wersji, `tierScope` albo cenie/terminie Standardu.**

## 1. Ceny — tylko „Na start” i „Standard” (decyzja Krystiana 28.10)
- Wersji „Pełna” nie ma nigdzie (kreator, katalog, okno oferty, cennik, karty). Kwoty Na start i Standard bez zmian (`claude/software-cennik.md`, `seed/prokomsoftware/rozwiazania.json` → `prices`/`leadTimes` mają tylko `start` i `std`).
- Większy zakres niż Standard → „Wycenimy po krótkiej rozmowie” (`kreator.json` → `scopeNotes.moreThanStd`).
- **Pensjonat:** zapytanie o termin w cenie; **rezerwacja z zaliczką online = osobna wycena** (nie ma jej w żadnej wersji). Podgląd „Rezerwacje” na stronie głównej pokazuje zapytanie o termin, nie zaliczkę.
- **Przejęcie po informatyku:** Na start 990 zł (dostępy, kopia, zabezpieczenie; 2–3 dni) · Standard 1 990 zł (+ dokumentacja i przeniesienie na nasz serwer; 1 tydzień).
- Bez zmian (to nie rozmiary): opieka 149 / 299 / 790 zł/mies., audyt 0 / 990 / 1 990 zł.
- **Zakresy wersji** (`rozwiazania.json` → `tierScope.start/std`, ten sam tekst w kreatorze i w oknie oferty) — propozycja do akceptacji razem z cennikiem. Spójność z kartami: wizytówka ma formularz od Na start (bo „formularz i mapa” są w cenie każdej strony), restauracja ma formularz rezerwacji stolika od Na start, pensjonat ma trzy języki (PL · EN · DE) od Na start, strona firmowa: Na start do 5 podstron, Standard do 10. Systemy: Na start = jeden moduł, do 5 użytkowników, bez integracji; Standard = kolejne moduły w jednym etapie, więcej użytkowników i ról, import danych z Excela (połączenie z innym programem = automatyzacja, „Zapytaj o wycenę”).
- Usunięte obietnice spoza zakresu: „formularz na mail i SMS” (SMS = automatyzacja) → „formularz prosto na Twoją skrzynkę”; „dowozy” przy restauracji.

## 2. Strona główna — nowa kolejność (13 sekcji, ścieżka klienta)
1. Hero + 4 kafle intencji · 2. 8 obszarów · 3. 12 rzeczy (**klik = okno szczegółów**, §4) · 4. Podglądy na żywo · 5. **Kreator** (§3) · 6. Jak pracujemy i jak powstaje cena · 7. **Jak robimy strony i systemy** („Nie składamy z gotowych klocków…” — 3 mierzalne korzyści, wróciło z `/o-firmie`) · 8. Dlaczego nie WordPress i PHP · 9. **Z czego budujemy** („Twój system, warstwa po warstwie” — wróciło z `/o-firmie`) · 10. Realizacje + liczby · 11. Zasady (+ „Czasem powiemy: nie budujcie”) · 12. FAQ · 13. Kontakt · stopka.
- Logika: co możemy zrobić → zobacz → dobierz → co dalej i za ile → dlaczego tak budujemy → dowody → zasady i pytania → kontakt.
- „Jak robimy” bez dawnego podbloku „Dlaczego nie WordPress i podobne kreatory” (powtarzał sekcję 8) — zostały 3 karty i źródło progu szybkości (Google).
- Szyna sekcji (≥ 1400 px) i lista sekcji zaktualizowane (`homeOrder` w `strona-glowna.json` do aktualizacji w SWD1 według tej listy).
- Telefon: „Jak robimy” — karty w karuzeli; „Z czego budujemy” — 6 kafli warstw 2×3 + karta szczegółów; „Zasady” — karty w karuzeli (78% szerokości); blok „Czasem powiemy” zwarty. Wysokość strony przy 390 px ok. 17 700 px (dwie sekcje wróciły, reszta zwarta).
- Na stronie głównej i na `/kontakt` stopka **nie** pokazuje pasa CTA (sekcja kontaktu jest tuż nad nią); na `/kontakt` także bez pasa linii PRO-KOM (jest sekcja na stronie).

## 3. Kreator v21 — 4 kroki, wycena na żywo
- Kroki: **Potrzeba → Szczegóły → Zakres i termin (z opcjonalnym opisem) → Wynik**; „Opisz po swojemu” — 3 kroki. Pigułki kroków z paskiem; na telefonie „Krok X z 4”. Wszędzie jedna obietnica: „4 krótkie kroki · 60 s”.
- Krok 1: duże kafle z ikoną w gradiencie, opisem i ceną od razu („od 999 zł” / „Zapytaj o wycenę”).
- **Wycena na żywo:** desktop — lepka prawa kolumna (podgląd projektu, nazwa, cena, termin, rozmiar, „W cenie”, Twój wybór); telefon — lepka belka nad dolnym paskiem (cena, termin, „Dalej / Pokaż wynik / Wyślij wycenę ↓”), podgląd zwinięty.
- **Na start vs Standard** jako 2 karty z różnicami („+ co dochodzi”); aplikacje i automatyzacje bez rozmiaru („wyceniamy po krótkiej rozmowie”).
- **Inteligencja (reguły jako dane, `kreator.json`):** plakietka „Polecamy” z uzasadnieniem (`recommend` — zależnie od potrzeby, branży, liczby funkcji, tego, co klient ma, terminu); domyślny rozmiar = rekomendacja, dopóki klient nie kliknie (`dzSzT`); uczciwe komunikaty (`honest` — np. Profil Firmy w Google przy wizytówce od zera, arkusz przy małym zespole, najpierw wersja w przeglądarce przy aplikacji); „Co od Ciebie” z licznikiem „Masz X z Y”; „Często dobierane razem” (`addOns`) z „Dodaj”, które trafia do podsumowania formularza; podpowiedzi opisu zależne od potrzeby (`tileHints`).
- Wynik: karta rekomendacji, przełącznik rozmiaru, kafle cena i termin, zakres, „W cenie”; formularz zaczyna się od podsumowania wyceny; sukces PKS + 3 kroki. Zdanie o kopii zgłoszenia mailem usunięte (dopóki kod jej nie wysyła).
- Stan: `DZ_STATE` + `dzSzT`, `dzAdd`, `dzDescOpen`. `kreator.json`: nowe klucze `steps`, `stepsOwn`, `badges`, `tiers`, `recommend`, `honest`, `addOns`, `tileHints` (istniejące bez zmian).
- Stany: `stany/kreator-*` (desktop: d-a pensjonat krok po kroku z błędem i wysłaniem, d-b program, d-c odświeżenie, d-d aplikacja, d-e opisz po swojemu, d-f ciemny; telefon: m-a krok po kroku, m-b ciemny).

## 4. Okno szczegółów oferty (`/rozwiazania` i „12 rzeczy” na głównej)
- Klik w kartę rozwiązania otwiera okno zamiast rozwijania w miejscu. Desktop: duże okno wyśrodkowane, tło rozmyte; tablet ≤ 980 px: jedna kolumna; telefon ≤ 640 px: arkusz od dołu z uchwytem i lepkim paskiem ceny i „Dodaj” nad bezpieczną strefą.
- Treść: pasek z ← / → („6 / 12”) i ×; nagłówek z makietą w kolorze kategorii (7 wariantów: strona, system, aplikacja, automatyzacja, opieka, audyt, ratunek), kategoria, nazwa, lead, plakietki (języki, „podgląd na żywo”); fakty: cena, termin, dla kogo; **„Wybierz wersję”** — karty Na start / Standard z ceną, terminem i zakresem (`tierScope`), Standard z „Najczęściej wybierane”; uwagi (pensjonat, „Potrzebujesz więcej…”); „Co dostajesz”; „Dla kogo” + sytuacje Z / R / P; „Jak to wygląda” (4 kroki: rozmowa → podgląd i wycena na piśmie w 5–7 dni → budowa etapami z wersją testową co tydzień → odbiór i opieka); „Co będzie potrzebne od Ciebie”; 3 pytania z faktami; „Dobrze łączy się z” (`related`, klik przełącza okno); link do pełnej strony rozwiązania; dolny pasek: wybór i cena, „Dobierz w kreatorze”, „Bezpłatna wycena”, „+ Dodaj do projektu” (zapisuje nazwę z rozmiarem).
- Opieka: wybór poziomu (3); przejęcie: Na start / Standard; audyt: 3 rodzaje.
- Dostępność: `role="dialog"`, `aria-modal`, focus trap, powrót fokusu, Esc, klik w tło, ←/→, `prefers-reduced-motion`. W kodzie: jeden komponent okna dla katalogu i strony głównej; adres z parametrem (np. `/rozwiazania?r=<slug>`) jako plus do udostępniania — do decyzji w SWD1.
- Stany: `stany/okno-*` (desktop jasny/ciemny: strona, system, aplikacja „zapytaj”, opieka, dół okna; telefon: góra, środek, dół, system ciemny, automatyzacja, audyt).

## 5. Ciemna stopka (wszystkie strony)
- Zawsze ciemna (Grafit z księgi znaku, w ciemnym motywie ciemniejsza), z delikatną fioletową poświatą. Pas CTA „Porozmawiajmy o Twojej firmie.” + „Dobierz rozwiązanie · 60 s” i „Bezpłatna wycena” (poza stroną główną i kontaktem, §2).
- Kolumny: znak + opis + 3 gwarancje (kod/domena/dane Twoje · serwer w Polsce, kopia co noc · cena i termin na piśmie) · Oferta · Firma · Kontakt (telefon, e-mail, Rabka + Zakopane, godziny i czas odpowiedzi, zasięg).
- **„Jedna firma, sześć adresów”**: karty linii PRO-KOM ze znakiem PRO-KOM i myślnikiem + kreską w kolorze linii (wersje „na ciemne” z księgi): Główna (pro-kom.eu, zieleń), Biznes (granat), Instalacje (turkus), Software (fiolet, bieżąca), Tech (czerwień, prokomserwis.pl), Zakopane (bursztyn). Na telefonie karty w przewijanym rzędzie.
- Pasek dolny: © 2026, dane firmy, NIP, polityka prywatności, „Bez ciasteczek śledzących”.
- Kolory: nowe tokeny stopki (`--footer-bg`, `--footer-text`, `--footer-muted`, `--footer-line`) z Grafitu/Papieru i kolory linii z `docs/marka.md` — do dopisania w ADR-015 (SWD1).

## 6. Kontakt v21 (`/kontakt`)
- Hero „Napisz, zadzwoń albo wpadnij. Odpowiemy z konkretem.” + karta godzin z **żywym statusem** (otwarte / zamknięte, czas w Polsce) + 4 karty kanałów (telefon — „Najszybciej”, e-mail, salon Rabka lub Zakopane, online).
- Formularz (2 kolumny, po lewej ciemny panel z osią „Co dalej po wysłaniu”: 1 dzień roboczy → rozmowa 30 min → podgląd i wycena w 5–7 dni → decyzja, zaliczka 30%; skróty do kreatora i audytu): temat (6 kafli), opis z podpowiedziami zależnymi od tematu, imię i firma, telefon albo e-mail (rozpoznaje, co wpisano), sposób rozmowy, zgoda, lista błędów, sukces z numerem i 3 krokami zależnymi od sposobu kontaktu.
- **Sekcja „Jedna firma, pięć linii”** — karty Biznes, Instalacje, Tech, Zakopane, Wszystkie linie (znak z kolorem linii, opis, link) + „Jedna firma do wszystkiego →”.
- „Gdzie się spotkamy” (mapa z „Nawiguj”, 4 miejsca, dane firmy) i FAQ kontaktowe (4).
- Stany: `stany/kontakt-*`.

## 7. Pozostałe podstrony
- **Cennik:** 2 kolumny (Na start / Standard) dla stron, systemów i przejęcia; opieka 3 poziomy, audyt 3 rodzaje; FAQ „Czym różni się Na start od Standardu?”.
- **O firmie:** bez „Jak robimy” i „Z czego budujemy” (wróciły na główną); porównanie „Freelancer, agencja czy PRO-KOM” zostaje.
- **Pełna oferta:** karty z ceną „od” i terminem Na start, klik = okno (§4), „Kreator w 60 sekund · 4 krótkie kroki”.
- Wszystkie podstrony mają nową stopkę.

## 8. Model treści — co dochodzi (do ADR-014 w SWD1)
| Gdzie | Pole | Po co |
|---|---|---|
| `Solutions` | `prices`/`leadTimes` tylko `start`, `std` | §1 |
| `Solutions` | `tierScope.start`, `tierScope.std` (tekst) | karty wersji w oknie i kreatorze |
| `Solutions` | `related` (relacja do 3 rozwiązań) | „Dobrze łączy się z” |
| `SoftwareSettings.wizard` | `tiers`, `recommend`, `honest`, `addOns`, `tileHints`, `steps`, `stepsOwn`, `scopeNotes.moreThanStd` | §3 |
| `SiteSettings.software.navigation.footer` | CTA, gwarancje, linie PRO-KOM (nazwa, opis, adres, kolor linii) | §5 |
| `SoftwareSettings.home.homeOrder` | kolejność z §2 | §2 |

## 9. Poprawki po audycie v21 (29.10)
- **Spójność cen w kreatorze:** do kroku „Zakres” kreator pokazuje cenę „od” (wersja Na start); cena wybranej wersji dopiero od kroku „Zakres”. Kafel „Strona dla firmy” (firmowa, pensjonat albo lokal) „od 1 999 zł”; „Przebudowa starej strony” zamiast „Odświeżenie obecnej strony” (jedna nazwa w całej ofercie). Termin w wyniku: „od podpisania umowy” tylko przy rozwiązaniach z ceną; podpowiedź „co od Ciebie” zależna od rodzaju (strony: teksty, zdjęcia, domena; reszta: krótka rozmowa).
- **Bez obietnic spoza oferty:** podgląd „Noclegi” (dawniej „Rezerwacje”) pokazuje zapytanie o termin, bez kalendarza wolnych pokoi i zaliczki; obszar „Sklepy i rezerwacje” bez „rezerwuje sam”; pensjonat bez „połączenia z kalendarzami portali”; rozbudowana strona: „Formularze zapytań i zamówień” zamiast „Rezerwacje”; formularz strony: „mail od razu” (SMS = automatyzacja); restauracja bez „dowozów”; „Jedna firma”: „strona z zapytaniem o termin w kilku językach”.
- **Teksty:** proces „Większość płacisz po odbiorze.” (zamiast „Płacisz po każdym etapie”); „Polecamy” zamiast „Najczęściej wybierane” (nie do sprawdzenia przy nowej linii); cennik „Dwa warianty każdej strony…”; O firmie — „Ciągłość” bez obietnicy zastępstwa („kod, dostępy i dokumentacja uporządkowane i zapisane w umowie — projekt przejmie każdy programista”), „Pracujesz z firmą, która działa od 2004 r.”; branża „W górach zasięg bywa słaby” (zamiast nazwy miejscowości); hero „ZAKRES · na start / średni / etapami” (zamiast „złożoność: wysoka”); odmiana „od 2 tygodni / od 1 tygodnia”; różne daty wpisów w Aktualnościach.
- **Formularze:** temat w kontakcie (główna, /kontakt) bez domyślnego zaznaczenia; „Dziękujemy” bez zdania o potwierdzeniu e-mailem i bez pasa CTA w stopce.
- **Typografia:** twarde spacje po jednoliterowych słowach (w, i, z, o, a, u) w nagłówkach i leadach — w kodzie: funkcja formatująca treści z panelu (np. przy renderze nagłówków) albo `text-wrap: pretty` + nbsp w seedzie.
- **Telefon:** karuzele z `scroll-padding-inline: 18px` (pierwsza karta przy marginesie, nie przy krawędzi); przyciski obszarów obok siebie bez łamania; przyciski sekcji WordPress wyśrodkowane; stempel „NA PIŚMIE” w makiecie wyceny w prawym górnym rogu (nie zasłania sumy); wiersz kategorii z plakietką „podgląd” o stałej wysokości (karty w rzędzie równe); kreator: belka wyceny z pełnym tłem, na `/dobierz` bez dolnego paska nawigacji, krótszy wstęp.

## 10. Wersja finalna v21 — okno oferty, miniatury, kreator, szlify (29.10)
**Zasada dla SWD1 i sesji z UI: przy różnicy tekstów między planszą v21 a seedem wygrywa plansza** (szlify tekstów z 29.10 są w planszach; seed zaktualizować w SW3 według plansz).

### 10.1 Miniatury rozwiązań (29, unikalne)
- Każde rozwiązanie ma własną ilustrację (płaska scena 280×170 w kolorze kategorii, własne tło — działa w obu motywach, bez nazw realnych firm): `miniatury/<slug>.svg`. Używane w: kartach `/rozwiazania`, „12 rzeczach” na głównej, kartach rozwiązań na stronach branż, nagłówku okna i kartach „Dobrze łączy się z”. Plakietki typu „EKIPY · STATUS” są częścią ilustracji (nie dublować).
- W kodzie: pliki SVG w `public/software/rozwiazania/<slug>.svg` (albo `Solutions.thumbnail` → Media) i `<Image>`/`<img>` z `alt=""` (dekoracyjne), `loading="lazy"` poza pierwszym rzędem. Seed: dodać pole `thumbnail` = ścieżka.

### 10.2 Okno szczegółów oferty — układ finalny (zastępuje opis z §4 tam, gdzie się różni)
- Nad zgięciem: kategoria + „podgląd na żywo”, nazwa, jedno zdanie „co to daje”, 3 fakty (cena wybranej wersji, termin, dla kogo), duży przełącznik **Na start / Standard** z cenami (domyślnie Standard; wizytówka i landing — Na start; audyt — Szybki; przejęcie — Standard), uwaga (pensjonat — zaliczka osobno), obok ilustracja + „Zobacz podgląd na żywo” + 3 gwarancje (wycena na piśmie ważna 30 dni · płacisz po odbiorze etapów · kod, domena i dane Twoje).
- Niżej: **„Co jest w której wersji”** — tabela ✓ / „+ dochodzi” (klik w kolumnę wybiera wersję; opieka 3 poziomy z czasem reakcji, audyt 3 rodzaje), **„W każdej wersji dostajesz”** (4–6 punktów, bez powtórzeń z tabelą), **„Przykład z życia”** (oznaczony jako przykład), **„Dla kogo”** (tylko pasujące sytuacje), **„Jak to wygląda”** (4 kroki z czasem: rozmowa dziś/jutro → podgląd i wycena 5–7 dni → budowa w terminie wybranej wersji → odbiór i opieka od 149 zł/mies.), „Co od Ciebie”, 3 pytania, „Dobrze łączy się z” (miniatury). Cień przy dolnej krawędzi = sygnał przewijania.
- Dolny pasek: wybrana wersja i cena · „Dobierz w kreatorze” (drugorzędny) · **jeden główny przycisk „+ Dodaj do wyceny”**, po dodaniu → **„Wyślij do wyceny →”** (do `/kontakt?projekt=1`). Zapisuje nazwę z wersją (`{ id, name: "<nazwa> · <wersja>" }`).
- Telefon: arkusz od dołu; nad zgięciem nazwa, przełącznik wersji z cenami, pasek ceny z głównym przyciskiem; ilustracja pod przełącznikiem w pełnej szerokości.
- Model: `Solutions` → `tierScope`, `related`, `thumbnail` + teksty okna: `benefits` (W każdej wersji dostajesz), `example` (Przykład z życia), `needs` (Co od Ciebie), `faq` (3). Do ADR-014 w SWD1.

### 10.3 Kreator — blok wysyłki (zastępuje formularz z §3)
- **Bez bloku „W cenie”** (w wyniku i w wycenie na żywo) — zakres tylko w kartach Na start / Standard („+ co dochodzi”).
- Blok wysyłki: „Ostatni krok · Dokąd wysłać wycenę?” + „Dostaniesz ją na piśmie: zakres, cenę i termin. Decydujesz potem, bez zobowiązań.”; **karta-bilet** „Twoja wycena · szkic” (nazwa, wersja, cena netto, termin, dodatki); sposób kontaktu jako segment z ikonami w jednym rzędzie (Telefon · E-mail · Spotkanie · Online); pola z etykietami (drugie pole zależne od sposobu kontaktu); zgoda w jednej linii; **przycisk zawsze aktywny** „Wyślij wycenę — odezwiemy się w 1 dzień roboczy”, błędy przy polach po kliknięciu; 3 ikony zaufania (odpowiedź w 1 dzień roboczy · wycena na piśmie w 5–7 dni · bez zobowiązań, bez newslettera). Sukces: „Wysłane · PKS-…”, „Dziękujemy, <imię>. Wycena jest w drodze.”, bilet „przyjęta”, oś czasu (dziś → do 1 dnia roboczego → 5–7 dni), ważność 30 dni.
- Ceny: do kroku „Zakres” — „od” (Na start), potem cena wybranej wersji.

### 10.4 Szlify finalne (plansze)
- Strona główna: hero bez nieczytelnej makiety na telefonie („Złóż swój system: dotknij modułu”), przyciski bez łamania; obszar **„Sklepy i zamówienia”** (zamiast „Sklepy i rezerwacje”); podgląd pensjonatu „Zapytaj o termin” bez „wolny w tym terminie”; proces etap 03 „Strona: 70% po odbiorze. System: rata po każdym odebranym etapie.”; rytm sekcji (różne tła „Jak robimy” / „WordPress” / „Z czego budujemy”); „Czasem powiemy” wyśrodkowane z przyciskiem „Zapytaj, co się opłaca →”; sekcja „Zasady” z `id="zasady"` w szynie sekcji; etykiety ≥ 12 px na telefonie.
- Podstrony: każda kończy się jednym CTA (pas CTA stopki ukryty tam, gdzie strona ma własne); O firmie bez obietnicy zespołu developerów; „Jedna firma” — pięć linii z „Tech” zamiast „Serwis”; Polityka bez newslettera; Dziękujemy bez bloku „Porozmawiajmy” i bez KSeF; Rozwiązanie (aplikacja) — opieka **Systemy 790 zł/mies.**; Audyt „Polecamy” zamiast „Najczęściej”.

### 10.5 Katalog, branża, kontakt — szlify finalne
- **Filtry katalogu zawężają naprawdę** (oznaczenia w seed `rozwiazania.json`, te same w oknie oferty): „Od czego zaczynasz” — Zaczynam od zera (14) · **Mam już stronę lub program** (13; dawniej „Mam program, brakuje mu czegoś”) · Mam kilka programów (8); branże 10–14 pozycji każda (opieka, przejęcie, audyt i przebudowa — w każdej). Przykład: Budowlanka + Zaczynam od zera = 6 pozycji.
- Katalog: H1 „Cała oferta, z ceną i terminem.”; pusty wynik → „Wyczyść filtry” + „Napisz, czego szukasz”; jeden blok kontaktu na końcu.
- **Bez obietnic spoza cennika:** SMS w zleceniach i serwisie → status pod linkiem i e-mail; bez płatności online w grafiku zajęć; aplikacja dla gości — „płatności ustalamy w wycenie”; funkcje Standardu opisane z dopiskiem „Standard:”; bez „najszybszy start w Google”, „w 2 minuty”, „< 2,5 s”.
- Seed: pole **`example`** („Przykład z życia”, 29 pozycji) — do ADR-014 w SWD1 razem z `tierScope`, `related`, `thumbnail`, `benefits`, `needs`, `faq`.
- Branża: jeden blok kontaktu na końcu; „zaliczka 30%, potem raty po etapach”; bez nazw programów firm trzecich.
- Kontakt: sekcja „Inne linie PRO-KOM” z nazwami jak w stopce; na telefonie formularz przed „Co dalej po wysłaniu”; „Opisz, co chcesz usprawnić.”; bez listy miejscowości dojazdu (do decyzji).
- Czytelność: etykiety ≥ 12 px (poza znakiem i makietami ekranów), okruszki i link „Polityka prywatności” w stopce z celem dotyku 44 px.

### 10.6 Po audycie końcowym (29.10) — zachowania do odwzorowania w kodzie
- **Kontakt odbiera „Twój projekt” (SW11a):** gdy lista projektu jest niepusta albo adres ma `?projekt=1`, nad polami formularza blok „Twój projekt”: pozycje (miniatura, nazwa, wersja, cena orientacyjna, ✕), suma jednorazowa netto (opieka osobno „zł/mies.”, aplikacje i automatyzacje „po rozmowie”), „+ Dodaj coś jeszcze” → `/rozwiazania`; temat zgłoszenia ustawia się sam wg pierwszej pozycji (klient może zmienić); lista idzie jako pole zgłoszenia (`[{ id, name }]`), cenę liczymy z `Solutions`, nie z tekstu nazwy; sukces: „Wysłane razem z: …”, lista czyszczona. Pusty `?projekt=1` → komunikat z linkiem do oferty. Wszystkie przyciski wysyłki projektu prowadzą do `/kontakt?projekt=1#formularz`.
- **Nazwy koszyka wszędzie:** „+ Dodaj do wyceny” → „✓ W wycenie” → panel „Twój projekt” → „Wyślij do wyceny →”.
- **Okno oferty:** płatność zależna od typu — strony i sklep „30% zaliczki, reszta po odbiorze”, systemy/aplikacje/automatyzacje „30% zaliczki, reszta ratami po etapach”; trzecia gwarancja „Kod, domena i dane” / „Kod, panel i dane” / „Kod, aplikacja i dane”; w tabelach żadnych zaprzeczeń z ptaszkiem — „Połączenia z innymi programami — osobna wycena” jako przypis; przejęcie „Dostępy · 1–3 dni”; audyt — czasy 2 dni robocze / 1 tydzień / 2 tygodnie.
- **Kreator:** pozycje bez ceny — krok „Zakres i termin”, „Aplikację wyceniamy indywidualnie — cenę i termin dostaniesz na piśmie w 5–7 dni.”, bilet: wersja „na miarę”, cena „do wyceny”, termin „do ustalenia”; plakietka wersji przy cenie dopiero od kroku „Zakres”; „Zaznaczone funkcje: N”; „Polecamy” tylko przy wersji polecanej, inaczej „Dobrane dla Ciebie”; przycisk „Poproś o wycenę — odezwiemy się w 1 dzień roboczy”; sukces „Zgłoszenie jest u nas. Wycenę na piśmie dostaniesz w 5–7 dni.”; na telefonie na `/` dolny pasek chowa się, gdy belka ceny kreatora jest aktywna, i wraca po wyjściu z sekcji. Data „jeśli zaczniemy do 30 listopada” liczona w kodzie (nie wpisana na sztywno).
- **Strona główna:** nazwy kart = nazwy w `Solutions` (karty biorą nazwę, opis, cenę i termin z danych rozwiązania); terminy-zakresy bez „od” („1–2 tygodnie”); FAQ „Ile to trwa?” z konkretnymi terminami; pasek zaufania w hero zawija się (bez przewijania); proces na telefonie pokazuje skrawek następnego etapu; forma „Ty” w całym serwisie.
- **Podstrony:** `.pk` bez sztywnej min-wysokości (koniec strony = stopka); hero podstron wygasa łagodnie, pierwsza sekcja ma odstęp; na telefonie polecany plan (opieka Standard, audyt pełny) pierwszy w rzędzie; oś czasu O firmie z `[ROK]` do uzupełnienia przez szefa; jedna data na wpis (lista i wpis zgodne).

## 11. v22 — jedna cena „od” (decyzja Krystiana 29.10.2026)
**W kreatorze, w oknie oferty, w katalogu, na kartach, w cenniku i w Kontakcie każde rozwiązanie ma jedną cenę „od” i jeden termin „od”. Wersji Na start / Standard nie ma.**

### 11.1 Dane
| Rozwiązanie | Cena od (netto) | Termin od |
|---|---|---|
| Strona wizytówka | 999 zł | od 1 tygodnia |
| Landing page | 1 299 zł | od 1 tygodnia |
| Strona firmowa z panelem | 2 490 zł | od 2 tygodni |
| Przebudowa starej strony | 1 499 zł | od 2 tygodni |
| Strona dla restauracji lub baru · dla pensjonatu lub hotelu | 1 999 zł | od 2 tygodni |
| Rozbudowana strona firmowa | 6 990 zł | od 5 tygodni |
| Sklep internetowy | 8 990 zł | od 5 tygodni |
| Wyceny i oferty z PDF · Z Excela do systemu · Czas pracy · Kalendarz sal | 2 990 zł | od 2 tygodni |
| Grafik zajęć · CRM · Serwis · Zlecenia · Magazyn · Portal B2B | 3 490 zł | od 3 tygodni |
| Aplikacje (3), automatyzacje i AI (5) | „Zapytaj o wycenę” | po krótkiej rozmowie |
| Przejęcie po informatyku | od 990 zł | od 2 dni |
| Opieka — **3 poziomy (to poziomy usługi, nie wersje)** | Podstawowa 149 · **Rozszerzona** 299 · Systemy 790 zł/mies. | — |
| Audyt — **3 rodzaje** | 0 · 990 · 1 990 zł | 2 dni robocze · 1 tydz. · 2 tyg. |

- **Poziom opieki „Standard” przemianowany na „Rozszerzona”** (żeby nie mylił się z usuniętą wersją projektu).
- Seed `rozwiazania.json`: `priceFrom` i `leadTime` — jedna wartość; **zamiast `prices`/`leadTimes`/`tierScope`: `included` (lista „W cenie”) i `moreExamples` (przykłady „Potrzebujesz więcej?”)**; opieka i audyt — `levels`. Seed `kreator.json`: bez `sizes` i `tiers`, `scope.<wynik>.included` / `moreExamples`. Do ADR-014 w SWD1 (pola `Solutions.included`, `Solutions.moreExamples`, `Solutions.levels`; brak `priceStd`).

### 11.2 Zachowanie
- **Okno oferty:** fakty „Termin od N tygodni” i „Dla kogo”; karta **„W cenie”** z ceną „od X zł netto”, 3 punktami i notą „Potrzebujesz więcej? Np. … — wycenimy na piśmie w 5–7 dni.”; tabela porównania tylko dla opieki i audytu; FAQ „Co jest w cenie od X zł?” i „A jeśli potrzebuję więcej?”; pasek: „od X zł netto · od N tygodni” · „Dobierz w kreatorze” · „+ Dodaj do wyceny” → „Wyślij do wyceny →”. Koszyk zapisuje nazwę **bez wersji**.
- **Kreator:** krok „Zakres i termin” = jedna karta „W cenie od X zł netto · od N tygodni” + lista „Potrzebujesz czegoś więcej?” (3–4 pozycje z dopiskiem „do wyceny”; zaznaczenie **nie zmienia ceny „od”**, w wyniku blok „Do wyceny na piśmie”); plakietka „Twoje rozwiązanie”; bilet bez pola „Wersja”, z „+ do wyceny: …”.
- **Cennik:** tabela: rozwiązanie · cena „od” z terminem „od” · „W cenie”; FAQ „Co oznacza cena „od”?”; opieka 3 poziomy, audyt 3 rodzaje.
- **Kontakt „Twój projekt”:** „od X zł” i „termin od N tygodni” przy pozycji, suma „Razem od (netto)”; opieka — cena poziomu z nazwy albo „od 149 zł/mies.”.
- **Karty** (katalog, „12 rzeczy”, branże): „od X zł netto”, „termin od N tygodni”, bez punktów „Standard: …”.
