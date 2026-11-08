# prokombiznes.pl: Zaopatrzenie firm (AGD i RTV dla firm, Dostawy IT dla firm) + wpis na stronie głównej

Wersja 06.11.2026. Wzorzec: `docs/design/prokombiznes/zaopatrzenie/prototyp.html`. Otwórz w przeglądarce. Przełącznik u góry ma trzy widoki: „AGD i RTV dla firm”, „Dostawy IT dla firm” i „Wpis na głównej”, każdy w motywie jasnym i ciemnym. Prototyp to cel wizualny 1:1. Literały kolorów zamieniasz na tokeny z `tokens.css`. Wyjątek: kolory etykiety energetycznej A–G, które są stałe UE.

Źródło decyzji: raport „AGD/RTV i dostawy IT dla firm” (Claude Docs, 05.11). Zasady bez zmian (K4-FINAL §1):
- zero cen;
- bez finansowania;
- bez zdjęć ludzi;
- statusy marek tylko dozwolone;
- **bez logo Max Elektro i GT Group** (OWS GT §11);
- **AGD bez słowa o montażu**.

## 0. Do potwierdzenia przez szefa przed produkcją (flagi w panelu)
Każdy punkt poniżej jest w prototypie. W kodzie ma być polem albo flagą w panelu, a nie tekstem na sztywno.
1. Kto fizycznie odbiera stary sprzęt 1 za 1: przy AGD i przy IT (ZSEE art. 37). Flaga `oldEquipmentPickup`.
2. Lista usług IT przed dostawą (5 pozycji w konfiguratorze IT). Pole `services[]`.
3. „Zgłoszenie gwarancyjne przyjmujemy na miejscu” (wiersz „Usterka w środku sezonu”, FAQ „Gwarancja”).
4. Czy GT dostarcza LG. Jeśli nie, LG wypada z marek AGD.
5. Logo Whirlpool w wersji konsumenckiej. Obecne ma dopisek „Corporation”.
6. Przykładowe marki w klasach (Ekonomiczny: Amica, Beko; Standard: Samsung, Bosch, Beko; Premium: Bosch, Siemens, Samsung). Pole `clsHint[]`.
7. „Oddzwaniamy w 60 minut” korzysta z obietnicy z `SiteSettings` → „Obietnice”, tak jak reszta strony. Bez wpisu w panelu tekst się nie pokazuje.

## 1. Adresy i SEO
| Strona | Adres | title (≤ 60) | H1 |
|---|---|---|---|
| AGD i RTV | `/agd-rtv-dla-firm` | AGD i RTV dla firm, deweloperów i hoteli \| PRO-KOM Biznes | AGD i RTV dla firm. Na cały obiekt naraz. |
| IT | `/dostawy-it-dla-firm` | Dostawy komputerów i laptopów dla firm \| PRO-KOM Biznes | Komputery dla firm. Gotowe do pracy w dniu dostawy. |

- JSON-LD: `Service` (`areaServed`: Podhale, Małopolska, `provider` = Organization), `FAQPage`, `BreadcrumbList`. **Bez `offers` z ceną.**
- Okruszki: Start / Oferta / Zaopatrzenie firm / … Strona zbiorcza `/zaopatrzenie-firm` nie powstaje. Okruszek „Zaopatrzenie firm” prowadzi do `/oferta`.
- Frazy (naturalnie w treści): „AGD dla deweloperów”, „wyposażenie apartamentów na wynajem”, „AGD do hotelu/pensjonatu”, „telewizory hotelowe”, „dostawa laptopów dla firm”, „komputery dla firm Podhale / Nowy Targ / Zakopane”, „monitory dla firm”, „zestawy komputerowe dla biura”.
- Treść, konfigurator i FAQ renderuje serwer. Interakcje to małe wyspy klienckie. Pełna treść musi być w HTML bez JS.

## 2. Wspólny szablon obu podstron (kolejność sekcji)
Jeden szablon `ProcurementPage` sterowany danymi (`strony-k4.json → zaopatrzenie.agd|it`). Brak bloku w danych = brak sekcji.

| # | Sekcja | AGD | IT |
|---|---|---|---|
| 1 | Hero (granat, scena zdjęć, 3 pigułki, 3 liczby) | ✓ | ✓ |
| 2 | Pasek marek pod hero (rAF, klikalny, pauza) | ✓ | ✓ |
| 3 | Pasek „Na tej stronie” (przyklejony, aktywny link, postęp przewijania) | ✓ | ✓ |
| 4 | Dla kogo: 4 zakładki ze sceną zdjęć i punktami (Hotele: pasek sezonów) | ✓ | — |
| 4′ | Co dostarczamy: 6 kategorii z licznikami z katalogu | — | ✓ |
| 5 | **Ułóż zestaw / Policz stanowiska**: konfigurator (§3) | ✓ | ✓ |
| 6 | Przygotowanie: lista kontrolna z animacją (§5) | — | ✓ |
| 7 | **Podgląd oferty**: dokument liczony z konfiguratora (§4) | ✓ | ✓ |
| 7′ | Trzy klasy sprzętu: karty ustawiające klasę w konfiguratorze | ✓ | — |
| 8 | Na co patrzymy: 6 kart | ✓ | ✓ |
| 9 | Z nami i bez: tabela (na telefonie karty) | ✓ | ✓ |
| 10 | Jak pracujemy: 4 kroki + **Twój harmonogram** liczony z konfiguratora (§6) | ✓ | ✓ |
| 11 | Programy (InsERT, Microsoft, ESET, Comarch) | — | ✓ |
| 12 | Dla kogo: 5 kart branż | — | ✓ |
| 13 | Po dostawie: Opieka IT (panel statusów) | — | ✓ |
| 14 | Apartament to nie tylko AGD (Wi-Fi, terminal, kasa) | ✓ | — |
| 15 | Marki: siatka logo (kolorowe, błysk po najechaniu) | ✓ | ✓ |
| 16 | Fakty (liczniki) + „Z każdą dostawą” | ✓ | ✓ |
| 17 | Pytania: wyszukiwarka + 6 pytań, pierwsze otwarte | ✓ | ✓ |
| 18 | Formularz + „Co dalej” w lewej kolumnie + karta drugiej podstrony | ✓ | ✓ |

Pas „Podhale w liczbach” został **usunięty** (decyzja Krystiana 06.11). Liczby z Zakopanego zostają tylko w raporcie dla szefa.

## 3. Konfigurator (jeden stan napędza całą stronę)
Stan: `type`, `count` (1–500), `off` (odznaczone pozycje), `cls` (AGD) lub `services[]` (IT), `delivery`, `more` (tekst „Coś jeszcze?”), `variant` (IT, wariant w podglądzie).
- **Kontrolki:**
  - Typ lokalu albo rodzaj stanowiska (segment);
  - Liczba (stepper);
  - Klasa sprzętu (AGD);
  - Dostawa: AGD Naraz / 2 / 3 / 4 etapy, domyślnie 3; IT Jedna / 2 / 3 tury, domyślnie 2;
  - pod spodem „Przykładowe marki w tej klasie” (AGD);
  - siatka pozycji ze zdjęciami (klik = odznacz, licznik × N);
  - pole „Coś jeszcze?” (wolny tekst, trafia do listy i wiadomości);
  - IT: przełączniki usług.
- **Podsumowanie** (granatowa karta, przyklejona na komputerze, na telefonie pod pozycjami):
  - liczba urządzeń i rodzajów (liczy się płynnie);
  - lista;
  - klasa albo usługi;
  - „Dostawa: 3 etapy po ok. 4 lokale”;
  - przyciski: „Wyślij do wyceny” wpisuje listę do formularza (`f-msg`, `f-cnt`) i pokazuje komunikat; „Kopiuj” kopiuje listę do schowka;
  - link „Zobacz harmonogram”.
- Ten sam stan aktualizuje plakietkę w hero (AGD: „12 × kawalerka · 84 szt.”), dolny przycisk na telefonie („Wyślij zestaw · 84 urządzenia”), **podgląd oferty** i **harmonogram**.
- Wejście ze strony głównej: `?typ=<slug>&n=<liczba>` ustawia stan i przewija do konfiguratora (prototyp: `handoff`). Nieznane wartości = domyślne. Test Vitest dla parsera.
- Logika jako czyste funkcje z testami: `procurementTotals(state, data)`, `deliverySplit(n, stages)`, `scheduleRows(state, data)`, `offerRows(state, data)`.

## 4. Podgląd oferty (dokument)
Biała kartka, zawsze jasna, także w ciemnym motywie. Pod spodem dwie kartki stosu, lekki obrót −0,5°, po najechaniu 0°. Znak wodny „PRZYKŁAD”.
- **Nagłówek:** logo, „Oferta handlowa”, numer i ważność (przykładowe). Meta: „Dla: Twoja firma · NIP” oraz „Kawalerka × 12 lokali”.
- **Warianty:**
  - AGD: A Ekonomiczny / B Standard / C Premium — **to ta sama klasa co w konfiguratorze**;
  - IT: A Optymalny / B Wydajniejszy.
- **Wiersze = wybrane pozycje:**
  - kolumny: nazwa, parametry (AGD: pole `spec` pozycji, np. „177 cm, do zabudowy”; IT: opis pozycji), klasa energetyczna (AGD: znaczek w kształcie strzałki A–G), szt.;
  - **cena zakryta** (szare paski) — na stronie nigdy nie ma kwot;
  - IT: osobne wiersze „Usługa” z wybranych usług.
- **Stopka:** dostawa z konfiguratora, odbiór starego, faktura, karty produktów (AGD) albo przygotowanie w Rabce i lista seryjnych (IT). Pod spodem „Razem N urządzeń” i „Ceny w ofercie na piśmie”.
- **Objaśnienia 1–4** obok kartki. Najechanie, fokus albo dotknięcie podświetla na kartce kolumnę lub obszar o tym samym numerze. Gdy kartka jest widoczna i nikt nie dotyka objaśnień, podświetlenie przechodzi samo co 2,6 s. Reduced motion: bez automatu.
- Pod objaśnieniami: „Ceny nie są publikowane na stronie…”.
- Telefon: wiersz w dwóch liniach (nazwa · klasa · szt. / parametry · cena), bez nagłówka kolumn.
- **Dane przykładowe** (parametry, klasy) są w danych strony, a nie w kodzie. Szef może je zmienić.

## 5. Przygotowanie (IT): lista kontrolna
- Lewa kolumna: scena granatowa z laptopem, plakietka „Stanowisko 07 · Księgowość” i pasek postępu („Krok 3 z 8 · Programy do pracy”, procent). Po zakończeniu pojawia się zielona plakietka „Gotowe do pracy”.
- Prawa kolumna: 8 kroków, pole wyboru ze zmianą stanu.
- Gdy sekcja wejdzie w widok (35%), kroki odhaczają się po kolei co 560 ms. Przycisk „Pokaż jeszcze raz”. Reduced motion: od razu wszystko odhaczone.
- Kroki z danych (`prep.list`), zgodne z usługami z §0 pkt 2.

## 6. Twój harmonogram
- Liczony z liczby i trybu dostawy.
- **AGD:** „Lokal pokazowy” (tydz. 1, zielony, tylko przy ≥ 2 etapach), potem etapy z zakresem lokali i liczbą kompletów. Podział liczby na etapy prawie równy (`deliverySplit`).
- **IT** (dni robocze): „Przygotowanie w Rabce”, potem tury z zakresem stanowisk, „Odbiór starego sprzętu” tylko gdy ta usługa jest zaznaczona.
- Paski rosną od lewej, gdy sekcja wejdzie w widok (`clip-path`).
- Opis: „Liczony z zestawu powyżej · przykład, terminy ustalamy w ofercie · zmień w zestawie ↑”.

## 7. Ruch i dopracowanie (wszystko wyłącza `prefers-reduced-motion`)
- **Hero:**
  - zdjęcia wchodzą kaskadą (opacity, 34 px, skala .94; 110 ms odstępu);
  - pigułki „wyskakują” po 750 ms;
  - teksty wchodzą od dołu;
  - głębia za myszą (`--mx/--my`, każde zdjęcie z własną głębokością `--z`), tylko przy `pointer: fine`.
- **Kafelki sekcji** wchodzą kaskadą: klasa `stg` i `--i` na dzieciach. Animacja z `fill-mode: backwards`, żeby nie blokować przesunięcia przy najechaniu.
- **Liczniki:** hero i fakty liczą od zera. Wyjątki: lata (1900–2100) i liczby poniżej 10.
- **Pasek „Na tej stronie”:** cienka linia postępu przewijania (akcent → zieleń).
- **Formularz:**
  - NIP sprawdzany sumą kontrolną z podpowiedzią pod polem;
  - błędy przy polach;
  - po wysłaniu karta „Dziękujemy, {firma}” z „Co dalej” (1, 2, 3);
  - komunikaty na dole ekranu, nad przyciskiem na telefonie.

## 8. Strona główna — nowa sekcja „Zaopatrzenie firm”
**Miejsce:** zaraz po bloku `bzOffer` (5 działów + „Systemy, które wdrażamy”), przed `partners` (Marki). Nowy blok `bzProcurement`.
**Dlaczego tu:**
1. Klient widzi działy i systemy, a zaraz potem dostaje odpowiedź na pytanie „a jak potrzebuję tego dużo?”.
2. To trzeci rodzaj oferty, po katalogu i systemach.
3. Nie konkuruje z hero ani z „Najczęściej wybierane”.

**Zawartość:**
- H2 „Wyposażasz cały obiekt albo całe biuro? Dostarczymy wszystko naraz.” i lead.
- **Dwie granatowe karty** (H3), każda z:
  - plakietką odbiorców;
  - tytułem z akcentem (AGD w kolorze `--coral-2`, IT w `--accent-2`);
  - opisem;
  - sceną zdjęć z głębią za myszą (po najechaniu zdjęcia lekko się unoszą);
  - 3 pigułkami;
  - **mini-kalkulatorem**: rodzaj (3) × liczba → „84 urządzenia · 12 lokali”, wynik liczy się płynnie;
  - przyciskiem „AGD i RTV dla firm →” / „Dostawy IT dla firm →” z parametrami `?typ=&n=`.
- **Pasek 4 korzyści** pod kartami: jedna faktura, terminy, odbiór starego, oddzwanianie (obietnica z panelu).
- Telefon: karty jedna pod drugą, przycisk na całą szerokość.

## 9. Strona główna — Marki w dwóch paskach (decyzja Krystiana 06.11)
Zastępuje siatkę 16 kafli z opisem i licznikiem (K4 v150). **Odwraca decyzję K36 §1 o usunięciu paska logo.** Dopisz to do ADR-017.
- Nagłówek bez zmian („Marki, które znamy od środka.”), lead skrócony, link „Wszystkie marki · {N}” (N z bazy, dziś 39).
- **Dwa paski, wszystkie marki** z `Partners`:
  - kolejność: najpierw `kolejnosc_na_glownej`, potem reszta wg liczby pozycji;
  - marki rozdzielone na zmianę między paski (parzyste/nieparzyste), żeby oba zaczynały się od autoryzacji.
- **Ruch:**
  - pasek górny jedzie w lewo (34 px/s), dolny w prawo (28 px/s);
  - pętla `requestAnimationFrame`, nie animacja CSS — dzięki temu **pod kursorem pasek płynnie zwalnia do zera** (wygaszanie prędkości) i rusza z tego samego miejsca;
  - można go przeciągnąć palcem albo myszą; po przeciągnięciu klik nie otwiera linku;
  - zatrzymuje się przy fokusie z klawiatury;
  - przycisk „Wstrzymaj animację” (WCAG 2.2.2) zatrzymuje oba paski;
  - reduced motion: paski stoją, przeciąganie działa;
  - krawędzie wygaszone maską.
- **Kafel 212 × 114** (telefon 158 × 94):
  - kolorowe logo na białym tle;
  - plakietka statusu tylko dla marek ze statusem w `Partners` (Autoryzowany serwis / Autoryzowany partner / Partner / We współpracy);
  - **po najechaniu:** kafel unosi się o 6 px, logo jedzie w górę i lekko maleje, od dołu wjeżdża opis i „N pozycji →”, po kaflu przechodzi błysk światła.
- **Każdy kafel jest linkiem:** marka z salonem → salon (`/marki/<slug>`), bez salonu → strona marki. APC i Adobe nie mają logo, więc kafel pokazuje nazwę.
- Druga kopia paska (pętla) ma `aria-hidden` i `tabindex=-1`. Czytnik ekranu dostaje jedną listę.
- Test e2e: wszystkie marki z bazy są linkami; pasek pod kursorem po 1 s stoi (transform bez zmian); po „Wstrzymaj” stoi; brak poziomego przewijania strony na 360/390/1024/1440.

## 10. Wpięcie w resztę strony (gdzie jeszcze pojawiają się obie oferty)
| # | Miejsce | Co | Do |
|---|---|---|---|
| 1 | Mega-menu „Oferta” | kolumna „Zaopatrzenie firm” pod działami: 2 linki z ikonami | obie |
| 2 | Kategorie Laptopy, Komputery, Monitory, Stacje dokujące | pas „Kupujesz 5 sztuk lub więcej? Dostawy IT…” nad siatką (telefon: po 6. karcie) | IT |
| 3 | Karta produktu w tych kategoriach | pod „Do zapytania”: „Potrzebujesz kilku sztuk? Policz stanowiska →” | IT |
| 4 | Branża Hotele i pensjonaty | kafel „Telewizory i lodówki do pokoi” w rozwiązaniach | AGD |
| 4b | Branże Gastronomia (kuchnia zaplecza), Biura (kuchnia socjalna + IT), Szkoły (pracownie) | kafel | AGD/IT |
| 5 | Konfigurator — wynik | przy skali „10+” karta „Przy tej skali zrobimy dostawę” (noclegi: także AGD) | IT/AGD |
| 6 | Formularz kontaktu i szuflada „Zapytanie” | nowy chip „Większa dostawa sprzętu” | temat zapytania |
| 7 | Stopka, kolumna „Oferta” | „AGD i RTV dla firm”, „Dostawy IT dla firm” | obie |
| 8 | Plan Twojej firmy — scena Hotel / Biuro | punkt „Telewizory w pokojach” / „Kuchnia socjalna” z linkiem | AGD |
| 9 | Opieka IT | w sekcji „Nowy sprzęt?”: link „Dostawy IT — gotowe do pracy” | IT |
| 10 | Wyszukiwarka (Ctrl K) | frazy „agd”, „lodówka”, „telewizor”, „pralka”, „dostawa laptopów”, „hurtowo”, „dla dewelopera” → podpowiedź-link na górze wyników | obie |
| 11 | `sitemap.xml`, okruszki, JSON-LD | obie strony w mapie, `BreadcrumbList` | obie |

Teksty z tabeli trafiają do pól w panelu (SiteSettings → „Zaopatrzenie — linki”), nie na sztywno.

## 11. Kolejność budowy (sesja Biznesu, PR-y piętrowo)
1. `feat/biznes-zaopatrzenie-szablon` — dane, czyste funkcje i testy (§3, §4, §6), szablon i sekcje statyczne, strona AGD.
2. `feat/biznes-zaopatrzenie-it` — strona IT, Przygotowanie (§5), wejście `?typ=&n=`.
3. `feat/biznes-glowna-zaopatrzenie-marki` — sekcja §8, Marki §9, wpięcia §10 (menu, stopka, kategorie, produkt, branże, chip formularza, wyszukiwarka).

Każdy PR:
- lint/typecheck/test i e2e zmienionego obszaru;
- zrzuty 390 i 1440, jasny i ciemny, obok prototypu;
- Lighthouse ≥ 90;
- 0 poziomego przewijania;
- axe bez naruszeń;
- `/przeglad` (logika, formularz).

Bez nowych zależności. Zdjęcia: `seed/prokombiznes/zaopatrzenie/media/*.webp` (packshoty wycięte z tła; nazwy w prototypie `p-*`).
