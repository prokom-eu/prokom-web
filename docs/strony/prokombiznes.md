# prokombiznes.pl — specyfikacja strony

- **Status:** zakres i wygląd uzgodnione przez Krystiana 17.10.2026 na podstawie wizualizacji (17 plansz). Akceptacja szefa: Asana. Punkty oznaczone **[SZEF]** wymagają potwierdzenia przed publikacją, ale **nie blokują budowy**: buduj z tekstem z wizualizacji, a pole ma być edytowalne w panelu.
- **Wygląd:** `docs/design/prokombiznes/` (plansze, zrzuty, tokeny, CSS). **Model treści:** `docs/decyzje/ADR-012-katalog-i-model-tresci-prokombiznes.md`. **Dane startowe:** `seed/prokombiznes/`.
- **Stos:** ADR-005 (Next.js + Payload 3, TS strict). Strony z bloków: ADR-006. Marka i fonty: ADR-007, `docs/marka.md`. Skrzynka zapytań: ADR-003.
- **Kolejność ważności przy sprzeczności:** ta specyfikacja → plansze wizualizacji → ADR-y → wcześniejsze briefy wizualne (brief z 15.10 jest zastąpiony przez wizualizację, patrz §11).
- **Termin:** etap 1 na produkcji 26.10.2026; etap 2 w listopadzie (§10).

## 1. Cel i zasady biznesowe (twarde)

Strona ma zamieniać odwiedziny w **zapytanie albo telefon**. Klient w 5 sekund ma zrozumieć, że PRO-KOM Biznes to jeden lokalny partner od kas, POS, komputerów, programów i opieki IT na Podhalu, oraz wiedzieć, gdzie kliknąć.

- **Zero cen** na całej stronie. Zamiast koszyka jest „lista zapytania” (pozycje, ilości, uwagi, jeden formularz, wycena na piśmie).
- **Nie pokazujemy** leasingu, rat ani finansowania. Z finansowania zostają tylko **dofinansowania**.
- **Brak Strefy Klienta** i logowania klientów na tej stronie.
- **Dane kontaktowe** (wyłącznie z globala w panelu, nigdy na sztywno w komponentach):
  - telefon główny 889 003 889, ten sam numer na WhatsApp;
  - telefon stacjonarny 18 267 65 11;
  - e-mail biuro@pro-kom.eu;
  - adres ul. Orkana 16B, 34-700 Rabka-Zdrój.
- **Godziny:** wizualizacja zakłada pn–pt 9:00–17:00 **[SZEF: potwierdzić; czy sobota?]**. Godziny są w globalu i z nich liczy się status „Otwarte teraz / Zamknięte · otwieramy …”.
- Liczby i obietnice tylko prawdziwe. Każda obietnica oznaczona **[SZEF]** jest polem w panelu, nie stałą w kodzie.
- Bez liczby godzin pracy ani stawek godzinowych.

## 2. Mapa strony i adresy

| Adres | Szablon | Plansza | Etap |
|---|---|---|---|
| `/` | Strona główna | `Main` (1440) + `Mobile` (390) | 1 |
| `/oferta` | Katalog | `Katalog` + `KatalogM` (390) | 1 |
| `/oferta/[kategoria]` | Kategoria (20 kategorii). Wariant rozszerzony dla `kasy-fiskalne` | `Kategoria` | 1 (porównywarka: 2) |
| `/produkt/[slug]` | Produkt / usługa | `Produkt` | 1 |
| `/zapytanie` | Lista zapytania + formularz | `Zapytanie` | 1 |
| `/opieka-it` | Strona usługi flagowej | `Dzial` | 1 |
| `/gopos` | Strona partnera flagowego | `Gopos` | 1 |
| `/insert` | Strona partnera flagowego | `Insert` | 1 |
| `/branze/[branza]` | Branża. Start: `gastronomia`, `handel`, `noclegi` | `Branza` (gastronomia) | 1 (3 branże), 2 (reszta) |
| `/kreator` | Kreator „Dobierz zestaw w 60 s” | `Kreator` | 1 |
| `/o-firmie` | O firmie | `OFirmie` | 1 |
| `/aktualnosci`, `/aktualnosci/[slug]` | Lista i wpis | `Aktualnosci`, `Wpis` | 1 |
| `/kontakt` | Kontakt i dojazd | `Kontakt` | 1 |
| `/polityka-prywatnosci`, `/cookies` | Strony prawne z bloków | brak | 1 |
| `/mapa-strony` | Lista linków (HTML) + `sitemap.xml` | (`Mapa` = plansza robocza, nie strona) | 1 |

Zasady adresów:
- Slugi są po polsku, bez znaków diakrytycznych.
- Adres produktu nie zależy od kategorii, bo produkt może być w kilku.
- Kategorie mają czytelne slugi, np. `kasy-fiskalne`, `terminale-platnicze`. Mapowanie ze skrótów w seedzie (`kasy` → `kasy-fiskalne`) jest w ADR-012.
- Filtry katalogu trafiają do query string (`/oferta?grupa=sprzedaz&marka=posnet`); szczegóły i zasady SEO są w ADR-012.

Plansza `Mapa` to dokument roboczy z adnotacjami nawigacji i demem wyszukiwarki. **Nie budujemy jej jako podstrony.**

## 3. Elementy wspólne (każda podstrona)

Wygląd: `screens/*/01.jpg` i `css/_wspolny.css`.

### 3.1 Górny pasek (desktop, ukryty ≤ 640 px)
Zawiera:
- linki do linii PRO-KOM (Biznes aktywny; Instalacje, Software, Tech · naprawy, Zakopane jako linki zewnętrzne);
- status godzin na żywo (zielona/pomarańczowa kropka);
- linki Pomoc zdalna, Zgłoś awarię i Aktualności;
- „Oferty i serwis: 889 003 889” jako `tel:`.

### 3.2 Nagłówek (sticky, półprzezroczysty z blur)
- Elementy od lewej:
  - logo (wersja jasna lub ciemna wg motywu);
  - **Oferta ▾** (mega menu);
  - Opieka IT;
  - GoPOS i InsERT, każdy z zieloną kropką „partner”;
  - **Branże ▾**;
  - O firmie;
  - Kontakt;
  - pole „Szukaj w ofercie” ze skrótem `/`;
  - przełącznik motywu;
  - przycisk **Zapytanie** z licznikiem pozycji.
- Aktywna pozycja menu ma podkreślenie (kreska akcentu).
- **Mega menu Oferta:**
  - 5 kolumn = 5 grup katalogu, każda z listą kategorii i liczbą pozycji;
  - w kolumnie Oprogramowanie na górze GoPOS i InsERT z etykietą „partner”;
  - w kolumnie Serwis i usługi na górze Opieka IT („abonament”) i Przegląd IT („0 zł”);
  - po prawej karty GoPOS i InsERT;
  - na dole pasek: „Cała oferta (67)”, kreator, telefon.
  - Kliknięcie kategorii prowadzi do `/oferta/[kategoria]`, kliknięcie grupy do `/oferta?grupa=…`.
  - Zamykanie: Esc, klik poza menu, zmiana trasy.
- **Branże ▾:** 3 karty ze zdjęciem (Gastronomia, Handel i sklepy, Hotele i pensjonaty), a pod nimi „Wkrótce: …”.
- **Wyszukiwarka (nakładka):**
  - otwiera ją klik w pole albo klawisz `/`, zamyka Esc;
  - wyniki na żywo: do 6 produktów, a obok kategorie z liczbą trafień i strony (GoPOS, InsERT, Opieka IT, KSeF, Kreator, Kontakt);
  - przy pustym polu: „Popularne” i najczęściej wybierane;
  - brak wyniku: „Nie znaleźliśmy „X”. **Zapytaj o X**” — przycisk przenosi frazę do formularza zapytania.
  - Algorytm: §8.2.
- **Szuflada „Zapytanie”** wysuwana z prawej:
  - pozycje z miniaturą, ilością (−/+), usuwaniem;
  - podpowiedzi „Często dobierane” zależne od kategorii pozycji;
  - przycisk „Przejdź do zapytania”, a przy pustej liście „Napisz do nas”, który prowadzi do `/kontakt#formularz`.
- **Toast** „Dodano: <nazwa>” po dodaniu pozycji, ok. 2,5 s.

### 3.3 Telefon (≤ 640 px)
- **Nagłówek:** logo, lupa, przycisk zapytania z licznikiem, hamburger.
- **Menu pełnoekranowe:** wszystkie pozycje, w tym rozwijana Oferta (grupy → kategorie), przełącznik motywu, telefon i WhatsApp.
- **Dolny pasek przyklejony:** Zadzwoń (`tel:`), WhatsApp (`https://wa.me/48889003889`), Zapytanie (licznik).
- Górny pasek i przełącznik motywu w nagłówku są ukryte.
- Wzór: `screens/Mobile-390-*` i `screens/KatalogM-390-light`.

### 3.4 Stopka (5 kolumn)
- Zawartość:
  - dane firmy i godziny;
  - Oferta (5 grup);
  - Usługi i partnerzy;
  - Firma (O firmie, Aktualności, Kontakt, Mapa strony, Polityka prywatności, Cookies);
  - miejscowości obsługi.
- Odznaki partnerów (Posnet, Elzab, GoPOS, InsERT) z oficjalnymi logo.
- Linki do pozostałych linii PRO-KOM.
- Na dole: „PRO-KOM Tadeusz Wójciak”, NIP **[SZEF: podać]**, rok.

### 3.5 Motyw jasny / ciemny
- Domyślnie wg `prefers-color-scheme`. Ręczny wybór zapisany w `localStorage` (`pk-theme`), synchronizowany między kartami.
- Bez mignięcia: atrybut `data-theme` ustawiany skryptem inline w `<head>` przed renderem.
- Oba motywy są wzorcem: zrzuty `*-dark` dla Main, Katalog, Produkt, GoPOS i Mobile.

### 3.6 Pasek sezonowy
- Wąski pasek nad nagłówkiem z treścią sezonową (np. przed sezonem zimowym).
- Pokazywany tylko w zakresie dat z panelu; domyślnie 1 listopada – 28/29 lutego.
- Zamknięcie zapamiętane w `localStorage` (`pk-sz-closed`, wartość = id kampanii, żeby nowa kampania pokazała się znowu).
- Bez cen.

### 3.7 Pływająca nawigacja sekcji (tylko strona główna, desktop ≥ 1080 px)
- Pionowa szyna ikon po lewej z kotwicami sekcji: start, oferta, plan, jak-pracujemy, jeden, referencje, fakty, faq, kontakt.
- Aktywna ikona zmienia się wg przewijania (IntersectionObserver).
- Na telefonie jej nie ma.

## 4. Strona główna `/` — kolejność sekcji (zatwierdzona 17.10)

Wzór: `boards/Main.dc.html`, `screens/Main-1440-*` (9 stron), telefon: `Mobile`. Teksty bierz z planszy; są uzgodnione. Każda sekcja to blok Payload (ADR-006), więc szef może zmieniać treść bez kodu.

1. **Hero** `#start`
   - Elementy:
     - H1 „Kasy, komputery i opieka IT. Jeden telefon do wszystkiego.”;
     - lead;
     - CTA „Dobierz zestaw w 60 sekund” (→ `/kreator`) i telefon;
     - „Oddzwaniamy w ciągu 60 minut w godzinach pracy” **[SZEF]**;
     - linia zaufania „Serwis Posnet i Elzab · partner GoPOS i InsERT” **[SZEF: dokładna nazwa statusów]**;
     - „Na Podhalu od 2004”;
     - „100+ firm pod stałą opieką”.
   - Po prawej **koło 5 działów**:
     - działy = 5 grup katalogu, w środku aktywna grupa z liczbą pozycji;
     - wokół miniatury produktów;
     - autoprzełączanie co kilka sekund, kliknięcie wybiera dział;
     - link „Zobacz plan Twojej firmy ↓”.
   - Na telefonie koło zastępuje lista grup.
2. **4 kafelki potrzeb:**
   - Otwieram firmę lub lokal, z plakietkami „700 zł zwrotu za kasę online” **[SZEF: ulga — potwierdzić w ustawie]** i „0 zł terminal przez 12 mies.”;
   - Coś przestało działać;
   - KSeF od 1 stycznia 2027, z licznikiem dni do 1.01.2027;
   - Stała opieka IT, z plakietką „0 zł przegląd”.
   - Każdy kafelek prowadzi do właściwej strony.
3. **Marki:** jeden rząd logo w pasku przewijanym (marquee), pauza na hover, `prefers-reduced-motion` = statyczny rząd.
4. **Oferta · katalog w pigułce** `#oferta`
   - H2 „Wszystko dla firmy, w pięciu działach.” i licznik „67 produktów i usług od 25 marek” (liczby z bazy, nie stałe).
   - 5 kart grup.
   - 2 duże karty partnerów GoPOS i InsERT z etykietą „Autoryzowany partner”.
   - „Najczęściej wybierane”: 12 produktów w **2 rzędach** (flaga `featured` + kolejność w panelu; startowa lista w `seed/…/katalog.json` → `kolejnosc_wyroznionych`) **[SZEF: wg faktycznej sprzedaży]**.
   - Na końcu dwie duże karty CTA:
     - **„Poznaj całą ofertę”**: mozaika miniatur i przycisk → `/oferta`;
     - **„Dobierz zestaw w 60 s”**: podgląd kroków kreatora → `/kreator`.
5. **Plan Twojej firmy** `#plan`
   - Interaktywny rzut lokalu: rodzaj firmy (zakładki), punkty na planie, karta szczegółu.
   - Pod spodem pasek dofinansowań.
   - Etap 1: wersja uproszczona (zakładki + statyczne punkty z opisem). Etap 2: pełna interakcja jak na planszy.
6. **Jak pracujemy** `#jak-pracujemy`: 4 kroki z kreską postępu.
7. **Pięć firm czy jedna** `#jeden`: porównanie „5 numerów do spraw IT” vs „jeden PRO-KOM”.
8. **Dla kogo pracujemy** `#referencje`: 6 rodzajów firm, opinie, logo klientów.
   - **[SZEF: 2 opinie Google 1:1 z linkiem do źródła, 4–6 logo klientów tylko za pisemną zgodą]**.
   - Do czasu zgód sekcja pokazuje rodzaje firm bez logo; flaga w panelu.
9. **Fakty** `#fakty`: liczby, słowo właściciela z podpisem (font Caveat) **[SZEF: treść cytatu]**, 9 miejscowości.
10. **Ostatnio u nas:** 3 ostatnie wpisy z Aktualności.
11. **FAQ** `#faq`: 6 pytań, `<details>` + JSON-LD `FAQPage`.
12. **Szybkie sprawy + formularz** `#kontakt`
    - Kafle szybkich spraw: awaria, przeniesienie serwisu kasy, przegląd kasy, KSeF.
    - Formularz kontaktowy (§8.4).

**Przeniesione z głównej (nie przywracać):**
- bezpłatny przegląd IT i kalkulator przestoju → `/opieka-it`;
- pasek „Przenieś serwis kasy” → Szybkie sprawy i kategoria kas;
- pełna lista miejscowości → stopka i Kontakt;
- stare realizacje AV z lat 2016–17 → wracają dopiero po świeżych zdjęciach i zgodach.

## 5. Katalog `/oferta`

Wzór: `Katalog`, `KatalogM`, `screens/Katalog-1440-*`, `screens/KatalogM-390-light`.

### 5.1 Nagłówek strony
- Okruszki, eyebrow „Katalog PRO-KOM Biznes · bez cen, wycena na piśmie”.
- H1 „Wszystko dla firmy. W jednym miejscu.”, lead.
- Duże pole wyszukiwania i chipy „Popularne”.
- Statystyki: 67 produktów i usług, 25 marek, 2 autoryzowane partnerstwa, 60 min oddzwonienia.
- Kafle grup: „Wszystko” + 5 grup z liczbą pozycji.

### 5.2 Filtry (lewa kolumna, sticky)
- **Rodzaj:** Wszystko / Urządzenia / Oprogramowanie / Usługi (radio, z licznikami).
- **Kategoria:** pogrupowana wg 5 grup, checkboxy, liczniki.
- **Marka:** logo w siatce, multi-select.
- **Branża:** chipy, multi-select.
- **Przełączniki:** „Autoryzowany serwis/partner”, „Nowości”.
- Liczniki przeliczają się wg pozostałych filtrów (faceting). Zero wyników = pozycja wyszarzona, ale klikalna.
- Aktywne filtry jako chipy nad listą z „×” i „Wyczyść wszystko”.
- Na telefonie filtry są w wysuwanym arkuszu od dołu z przyciskiem „Pokaż N pozycji”.

### 5.3 Lista
- Sortowanie: Polecane (popularność) / Nazwa A–Z / Nowości.
- Widok: siatka / lista.
- Paginacja „Pokaż kolejne” po 12 pozycji, z adresem `?strona=2` dla SEO.
- **Karta produktu:**
  - zdjęcie na jasnym tle z cieniem;
  - maks. 2 odznaki (Usługa, Nowość, odznaka marketingowa, Autoryzowany serwis/partner);
  - logo marki, kategoria;
  - nazwa, korzyść w 1 zdaniu, 3 cechy jako tagi;
  - „Szczegóły →” i przycisk **„+ Do zapytania”**, który po dodaniu zmienia się w „✓ W zapytaniu” i działa jako przełącznik.
  - Gdy produkt nie ma zdjęcia: ikona kategorii na gradiencie grupy.
- **Karty promocyjne wplecione w siatkę:** kreator (po 5. pozycji) i partner (GoPOS/InsERT wg filtra). Na ciemnych kartach nagłówki zawsze białe.
- **Pusty wynik:** ilustracja, „Nie mamy „X” w katalogu — zapytaj, często mamy więcej niż na stronie”, przycisk „Zapytaj o X”.

### 5.4 Pod listą
- Sekcja „Jedna lista, jeden formularz, wycena na piśmie”: 3 kroki, wspólne dla katalogu, kategorii i produktu (komponent `HowInquiryWorks`).
- Kontakt „Szukasz czegoś, czego nie ma w katalogu?”.

### 5.5 Przekazanie filtrów
Mega menu, kafle grup na głównej i karty branż ustawiają filtr przez URL (`/oferta?grupa=…`, `?branza=gastronomia`). W wizualizacji robił to `localStorage pk-kf`; w kodzie **tylko URL**.

## 6. Podstrony

### 6.1 Kategoria `/oferta/[kategoria]` (wzór: kasy fiskalne)
Wzór: `Kategoria`, `screens/Kategoria-1440-light`.

Szablon ogólny dla wszystkich 20 kategorii:
- hero kategorii (H1, lead, 3 zalety);
- siatka produktów z filtrem marek;
- „W cenie” (co dostaje klient);
- FAQ kategorii;
- „Do kategorii często dobierane”;
- jak działa zapytanie;
- kontakt.
- Jeśli siatka nie wypełnia rzędu, ostatnie pole zajmuje karta „Nie wiesz, którą wybrać? Zadzwoń” (`ctHelp`).

Rozszerzenia tylko dla kas fiskalnych:
- **Dobór „Wybierz, a pokażemy pasujące kasy”:** 4 opcje (mobilna/na baterii, mała do lady, systemowa do dużego sklepu, z ekranem dotykowym), które filtrują siatkę. Mapowanie typów: `seed/katalog.json` → `typ_kasy`. Etap 1.
- **Porównywarka:**
  - pasek „Porównaj” na dole z miniaturami, maks. 3 kasy;
  - tabela parametr po parametrze (etykiety w `porownanie_kas_etykiety`);
  - różnice podświetlone.
  - **Etap 2.**
- „Trzy rzeczy, które warto wiedzieć przed zakupem” (przepisy: kasy online, ulga, przeglądy). **[SZEF + źródła: każdy przepis z linkiem do aktu prawnego]**.

### 6.2 Produkt `/produkt/[slug]`
Wzór: `Produkt` (Posnet Ergo Online), zrzuty jasny i ciemny.

- **Galeria** z punktami (hotspoty) na zdjęciu: moduły i cechy. Klik pokazuje opis; pod zdjęciem karty modułów, np. WiFi, LTE, BLIK.
- **Sticky boks** po prawej:
  - logo marki, kategoria;
  - H1, opis 2–3 zdania;
  - 4 parametry kluczowe;
  - „Dla:” chipy branż;
  - **„Dodaj do zapytania”** (przełącznik) i „Na liście”;
  - telefon i WhatsApp;
  - „W PRO-KOM w cenie” (lista usług) **[SZEF: „kasa w cenie z fiskalizacją, programowaniem i szkoleniem”]**;
  - „Bez cen — wycenę przygotujemy na piśmie”.
- **Zakładki:** Opis · Specyfikacja · Do pobrania · Pytania. Treść ze sterowanego bloku rich text; specyfikacja jako tabela par klucz–wartość.
- „Kiedy wybrać inną kasę?”: linki do alternatyw.
- „Skompletuj stanowisko jednym kliknięciem”: 4–5 akcesoriów (relacja `pasujeDo`) i przycisk „Dodaj wszystko do zapytania”.
- „Podobne”: 4 produkty z tej samej kategorii.
- JSON-LD `Product` **bez `offers`** (brak cen), z `brand` i `image`, plus `BreadcrumbList`.

### 6.3 Lista zapytania `/zapytanie`
Wzór: `Zapytanie`.

- **Lewa kolumna:** pozycje z miniaturą, ilością −/+, **uwagą do pozycji** (rozwijane pole „Dodaj uwagę, np. kolor, model, termin”), usuwaniem. Poniżej „Często dobierane do Twojej listy”.
- **Prawa kolumna:** formularz zapytania (§8.4) z dodatkowymi polami:
  - rodzaj firmy;
  - termin („Na otwarcie lokalu / przed sezonem / jak najszybciej / na spokojnie”);
  - preferowany kontakt (telefon / e-mail / WhatsApp).
- **Po wysłaniu:**
  - ekran sukcesu z osią czasu „Teraz → do 60 min telefon → wycena na piśmie” **[SZEF: 60 min]**;
  - numer zapytania;
  - lista jest czyszczona.
- Pusta lista: zachęta i przyciski „Przeglądaj ofertę” / „Dobierz w kreatorze”.
- Na planszy jest też podgląd skrzynki admina („Tak zapytanie trafia do skrzynki PRO-KOM”). To wzór widoku w panelu (ADR-003 / ADR-012), **nie sekcja strony publicznej**.

### 6.4 Opieka IT `/opieka-it`
Wzór: `Dzial`.

Sekcje, w kolejności:
1. Hero „Informatyk, który zna Twoją firmę. Na telefon, w abonamencie.” z kartą „Jak to działa”.
2. „Widzimy problemy, zanim Ty je zauważysz”: makieta panelu monitoringu.
3. **Kalkulator przestoju:**
   - wejścia: dzienny utarg, godziny otwarcia, czas przestoju;
   - wynik: koszt godziny = utarg ÷ godziny; koszt awarii = koszt godziny × czas przestoju;
   - wszystko liczone po stronie klienta, dane nie opuszczają przeglądarki.
4. „Nie informatyk od awarii”: porównanie.
5. **Bezpłatny przegląd IT** `#przeglad` **[SZEF: zakres i raport]**: co sprawdzamy, przykładowy raport, CTA.
6. FAQ: „10 pytań, które warto zadać każdemu informatykowi”.
7. Doradztwo, serwery, szkolenia.
8. Kontakt z nagłówkiem „Zacznijmy od bezpłatnego przeglądu IT.”

### 6.5 GoPOS `/gopos`
Wzór: `Gopos`.

Sekcje:
1. Hero ze zdjęciem lokalu i etykietą „Autoryzowany partner GoPOS” **[SZEF: nazwa statusu]**.
2. Statystyki — **każda liczba ze źródłem GoPOS albo usunąć**.
3. „Program to połowa sukcesu…”: 4 karty usług.
4. **Eksplorator modułów:** lista po lewej, podgląd ekranu po prawej.
5. „Jak to działa”.
6. **3 zestawy:** bar, restauracja, sezonowy — bez cen; „Dodaj zestaw do zapytania” dodaje komplet pozycji.
7. Kroki od prezentacji do pierwszego sezonu.
8. Migracja z innego systemu.
9. FAQ.
10. Kontakt „Umówmy prezentację”.

### 6.6 InsERT `/insert`
Wzór: `Insert`.

Sekcje:
1. Hero „Subiekt dobrany do firmy. I podłączony do KSeF.” z zrzutem programu.
2. **Dobór programu:** checkboxy cech firmy wybierają rekomendowany program (Subiekt 123 / nexo / GT itd.).
3. Rodzina programów: sprzedaż, księgowość, kadry.
4. KSeF z licznikiem dni.
5. Usługi wdrożeniowe.
6. FAQ.
7. Kontakt.

**[SZEF: nazwa statusu partnera]**. Zrzuty ekranu programu tylko z materiałów InsERT.

### 6.7 Branża `/branze/[branza]`
Wzór: `Branza` (gastronomia). Jeden szablon dla wszystkich branż; treść z kolekcji Branże.

Sekcje:
- Hero.
- „Od lady po kuchnię” — schemat urządzeń.
- Dzień w lokalu (oś czasu).
- „Jak to działa”.
- Polecane produkty z katalogu: relacja do produktów i link „Zobacz wszystko dla gastronomii” → `/oferta?branza=gastronomia`.
- FAQ.
- Inne branże: 3 aktywne i „Wkrótce” dla reszty.
- Kontakt.

Na start gastronomia, handel i noclegi. Treści handlu i noclegów piszemy wg wzoru gastronomii.

### 6.8 Kreator `/kreator`
Wzór: `Kreator`; dane w `seed/prokombiznes/kreator.json`.

- **4 kroki z paskiem postępu:**
  1. Firma: 10 rodzajów firm.
  2. Skala: stanowiska sprzedaży, komputery, nowy lokal / działa.
  3. Potrzeby: 13 potrzeb; domyślne zaznaczenia zależą od rodzaju firmy.
  4. Kontakt: termin, imię, telefon lub e-mail, zgoda.
- **Panel podsumowania po prawej** (sticky; na telefonie pod krokami):
  - zestaw na żywo: pozycje ze zdjęciami, mnożnik ilości;
  - „W cenie zestawu”;
  - plakietki (700 zł **[SZEF]**, terminal 0 zł, KSeF).
- **Wysłanie:**
  - zapytanie z typem `kreator` i pełnym zestawem;
  - ekran „Zestaw wysłany. Dziękujemy!”.
  - Etap 2: przycisk „Dodaj zestaw do listy zapytania”.
- Reguły doboru są danymi (JSON / global w panelu), nie `if`-ami w komponentach.

### 6.9 O firmie, Aktualności, Wpis, Kontakt
- **O firmie** (`OFirmie`):
  - hero „22 lata na Podhalu…” **[SZEF: liczba lat liczona od 2004, automatycznie]**;
  - zasady, które łatwo sprawdzić;
  - 4 linie PRO-KOM;
  - marki;
  - mapa i adres;
  - kontakt;
  - **zdjęcia ludzi [SZEF]:** decyzja 15.10 „bez własnych zdjęć na Biznes”, więc domyślnie ikony ról zamiast zdjęć.
- **Aktualności** (`Aktualnosci`):
  - wpis wyróżniony;
  - filtry kategorii (KSeF, Kasy, Terminale, Dofinansowania, Programy);
  - siatka wpisów;
  - zapis na powiadomienia — **etap 2, bez newslettera na start**.
- **Wpis** (`Wpis`):
  - spis treści przyklejony z boku;
  - czas czytania, data aktualizacji;
  - ramki „Ważne” i „Źródło”;
  - CTA w treści;
  - powiązane produkty;
  - JSON-LD `Article`;
  - **każdy fakt prawny ze źródłem (link do aktu, MF, podatki.gov.pl) i datą weryfikacji**.
- **Kontakt** (`Kontakt`):
  - karty: telefon, WhatsApp, e-mail, adres;
  - mapa jako statyczny obraz z linkiem do Map Google — bez osadzania iframe Google przed zgodą cookies;
  - godziny;
  - formularz;
  - „Dojazd, godziny, wyceny” (FAQ);
  - miejscowości obsługi;
  - JSON-LD `LocalBusiness`.

## 7. Treści

- **Teksty:** z plansz (uzgodnione). Przy przenoszeniu nie poprawiaj stylu; zmieniasz tylko punkty **[SZEF]**.
- **Katalog:** `seed/prokombiznes/katalog.json`:
  - 67 pozycji, 25 marek, 20 kategorii, 5 grup, 6 branż;
  - źródło: `biznes-produkty-fakty.md`, stan 15.10.2026;
  - parametry Elzab i Fawag do sprawdzenia u producentów.
- **Media:** `docs/design/prokombiznes/boards/media/` i opis w `seed/prokombiznes/media.json`.
  - Seed wgrywa je do kolekcji Media w Payload.
  - Logo klientów **nie** idą na produkcję bez zgody (flaga `wymagaZgody`).
- **Znak PRO-KOM:** docelowo pliki z `public/brand/` (paczka `PRO-KOM_znak_2026-10`). Pliki `brand-*` w mediach to tylko podgląd z wizualizacji.

## 8. Zachowania i logika

### 8.1 Lista zapytania (koszyk bez cen)
- **Stan po stronie klienta:** `localStorage` `pk-cart` = `[{ id: slug, q: liczba, uwaga?: tekst }]`.
  - Synchronizacja między kartami przez zdarzenie `storage`.
  - Walidacja: nieznane slugi usuwane po załadowaniu katalogu.
- **Akcje:** dodaj/usuń (przełącznik), dodaj bez przełączania (dla „Dodaj wszystko”), ilość ±1 (min 1), usuń, uwaga.
- Licznik w nagłówku = liczba pozycji, nie suma sztuk.
- Wizualizacja startuje z 3 pozycjami demonstracyjnymi. **W kodzie lista startuje pusta.**
- Implementacja: mały store (np. Zustand albo `useSyncExternalStore`), bez Reduxa.

### 8.2 Wyszukiwarka
- **Indeks:** lekki JSON generowany przy buildzie / rewalidacji z Payload (slug, nazwa, marka, kategoria, grupa, tagi, korzyść, słowa kluczowe, branże, popularność). Do 200 pozycji całość po stronie klienta, bez serwera wyszukiwania.
- **Normalizacja:** małe litery, `ł→l`, usunięcie diakrytyków (NFD).
- **Tokeny:**
  - podział po znakach nie-alfanumerycznych;
  - stop-słowa i synonimy z `seed/…/wyszukiwarka.json` (docelowo global w panelu);
  - każdy token musi trafić (AND).
- **Punktacja tokenu:**
  - trafienie w nazwie/marce = 3;
  - w reszcie opisu = 1;
  - przez synonim = 1;
  - literówka = 0,6;
  - dodatkowo `popularnosc/200`.
- **Literówki:** Damerau-Levenshtein, i to zarówno na całym słowie, jak i na prefiksie tej samej długości.
  - Dla tokenów 4–6 znaków limit 1, dla 7+ znaków limit 2.
  - Przykład: „kasa fiskalan” → kasy fiskalne.
- Odmiana licznika: 1 wynik / 2–4 wyniki / 5+ wyników (z wyjątkiem 12–14).
- Implementacja referencyjna: `boards/Main.dc.html`, szukaj `__pk17`. Przepisz do TS jako `lib/search.ts` z testami jednostkowymi na przykładach z §9.

### 8.3 Filtry katalogu
- Filtrowanie po stronie klienta na tym samym indeksie.
- Stan filtrów w URL (shallow routing), więc odświeżenie i link zachowują widok.
- Liczniki fasetowe: dla każdej grupy filtrów liczone z pominięciem tej grupy.

### 8.4 Formularze
Trzy formularze: kontakt, zapytanie z listą, kreator. Wszystkie idą do jednego endpointu z polem `typ`.

- **Pola wspólne:**
  - imię;
  - firma (opcjonalnie);
  - telefon **lub** e-mail (co najmniej jedno);
  - wiadomość;
  - tematy (chipy);
  - zgoda RODO z linkiem do polityki;
  - ukryte: źródło (adres strony), UTM.
- **Ochrona:** honeypot, limit zgłoszeń z IP, walidacja Zod na serwerze. Bez CAPTCHA na start.
- **Po wysłaniu:**
  - zapis w skrzynce (ADR-003);
  - e-mail do biuro@pro-kom.eu z pełną listą;
  - potwierdzenie do klienta, gdy podał e-mail.
- Brak skrzynki do 26.10 = **kolekcja `inquiries` w Payload** (ADR-012, zgodnie z opcją awaryjną ADR-003).
- Testy Playwright: wysłanie każdego z 3 typów, walidacja błędów, telefon 390 px.

### 8.5 Ruch i animacje
- Wejście sekcji: opacity + 8–16 px przesunięcia, opóźnienia kaskadowe 40–80 ms, raz na element.
- Hover kart: lekki cień i kolor, bez skalowania.
- Marquee marek i autoprzełączanie koła w hero.
- `prefers-reduced-motion: reduce` wyłącza wszystkie animacje i autoprzełączanie.
- Tylko CSS i IntersectionObserver, bez bibliotek animacji.

## 9. Kryteria akceptacji (etap 1)

1. Każda strona z §2 (etap 1) wygląda jak plansza:
   - porównanie ze zrzutami w `screens/` przy 1440 i 390 px, w motywie jasnym i ciemnym;
   - akceptowalne różnice: dane z bazy, drobne odstępy;
   - nieakceptowalne: inna kolejność sekcji, inne kolory, brak elementu.
2. Wyszukiwarka:
   - „kasa fiskalan”, „terminal”, „subiekt”, „kasa na baterie”, „restauracja”, „wifi”, „ksef” zwracają sensowne wyniki;
   - fraza bez wyników pokazuje „Zapytaj o …”.
3. Lista zapytania:
   - dodanie z karty, z produktu, z „Dodaj wszystko” i z szuflady działa;
   - stan przeżywa odświeżenie i jest wspólny dla kart przeglądarki;
   - wysłane zapytanie zawiera pozycje, ilości i uwagi.
4. Filtry katalogu działają łącznie, liczniki się zgadzają, a URL odtwarza widok.
5. Formularze zapisują zgłoszenie i wysyłają e-mail. Testy Playwright są zielone.
6. **Lighthouse (telefon):** Performance ≥ 90, Accessibility ≥ 95, SEO 100. CLS ≤ 0,1.
7. Klawiatura:
   - mega menu, wyszukiwarka, szuflada i arkusz filtrów obsługiwane klawiaturą;
   - focus widoczny;
   - Esc zamyka nakładki.
8. Na stronie nie ma żadnej ceny, słowa „leasing” ani „raty”, ani logowania klientów.
9. Kontakt, godziny i obietnice **[SZEF]** pochodzą z panelu; zmiana w panelu zmienia stronę bez deployu.

## 10. Etapy

**Etap 1 — do 26.10.2026** (kolejność budowy):
1. Fundament i dane:
   - tokeny i fonty (self-hosted, ADR-007);
   - kolekcje Payload z ADR-012;
   - seed z `seed/prokombiznes/`.
2. Elementy wspólne: nagłówek, mega menu, stopka, telefon, motyw, lista zapytania, wyszukiwarka.
3. Katalog i produkt.
4. Strona główna.
5. Zapytanie, kontakt, formularze.
6. Opieka IT, GoPOS, InsERT.
7. Kategoria (bez porównywarki), 3 branże, kreator.
8. O firmie, aktualności z wpisem KSeF, strony prawne.
9. SEO, przekierowania, testy, Lighthouse.

**Etap 2 — listopad 2026:**
- porównywarka kas;
- filtry po parametrach (kategorie z 15+ produktami);
- kolejne branże;
- pełny interaktywny plan firmy;
- kreator „dodaj zestaw do listy”;
- powiadomienia o nowych wpisach.

Jeśli 26.10 jest zagrożone, **tniemy od końca listy etapu 1, nie jakość**. Najpierw przesuwamy plan firmy (wersja statyczna), potem branże 2 i 3, na końcu kreator (wtedy CTA prowadzi do formularza).

## 11. Poprzednie ustalenia, które ta specyfikacja zmienia

- Brief wizualny z 15.10 („bez gradientów”, kolory Grafit `#121613` / Papier `#F4F5F1`) jest **zastąpiony** wizualizacją. Obowiązują tokeny z `docs/design/prokombiznes/tokens.css` (granat `#244FB0` bez zmian).
  - Jeśli `docs/marka.md` ma inne wartości tła i tekstu dla linii Biznes, zaktualizuj `marka.md` w tym samym PR i zaznacz to w opisie PR.
- „Sklep dla firm” został zastąpiony katalogiem z listą zapytania. Sklep B2B z cenami to faza 2 (2027).
- Podstrona „Dla Twojej firmy” → **Branże**.

## 12. Poza zakresem
- Ceny, koszyk z płatnością, konta klientów, Strefa Klienta.
- Leasing, raty.
- Newsletter.
- Chat na żywo.
- Wersja angielska.
- Import z hurtowni (n8n, listopad+).
- Integracja z PRO-KOM System poza skrzynką zapytań (ADR-003).

## 13. Otwarte punkty dla szefa [SZEF]
Zbiorczo, wszystkie edytowalne w panelu:
1. Godziny otwarcia (sobota?) i NIP w stopce.
2. Obietnice:
   - oddzwonienie w 60 min w godzinach pracy;
   - bezpłatny przegląd IT z raportem;
   - kasa w cenie z fiskalizacją, programowaniem i szkoleniem;
   - przejęcie serwisu kasy z formalnościami po naszej stronie.
3. Dokładna nazwa statusów: GoPOS i InsERT (skany certyfikatów), serwis Posnet i Elzab.
4. Ulga 700 zł: potwierdzić w ustawie; dodać link do źródła.
5. Opinie (2 z Google), logo klientów (zgody), cytat właściciela, zdjęcia ludzi czy ikony ról.
6. 12 produktów wyróżnionych wg faktycznej sprzedaży.
7. Rozważyć zdanie „orientacyjną wycenę podamy w pierwszej rozmowie”.
