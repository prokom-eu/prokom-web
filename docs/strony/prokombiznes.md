# prokombiznes.pl — specyfikacja strony

- **Status:** zakres i wygląd uzgodnione przez Krystiana 17.10.2026 na podstawie wizualizacji (17 plansz). Akceptacja szefa: Asana. Punkty oznaczone **[SZEF]** wymagają potwierdzenia przed publikacją, ale **nie blokują budowy**: buduj z tekstem z wizualizacji, a pole ma być edytowalne w panelu.
- **Wizualizacja v20 (20.10.2026):** nagłówek, górny pasek, strona główna i formularz kontaktowy według `docs/design/prokombiznes/ZMIANY-v20.md` — wniesione do §1, §3.1, §3.2, §4 i §8.4 (sesja D1). Zrzuty i plansze w repo są w wersji v20.
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
  - e-mail linii Biznes **biznes@pro-kom.eu** (pole w `SiteSettings`, v20) — na stronie głównej w karcie faktów, w karcie kontaktu przy FAQ i w formularzu; stopka bierze adres z tego samego pola (plansza pokazuje jeszcze biuro@pro-kom.eu — zmiana przez panel);
  - adres ul. Orkana 16B, 34-700 Rabka-Zdrój.
- **Godziny:** wizualizacja zakłada pn–pt 9:00–17:00 **[SZEF: potwierdzić; czy sobota?]**. Godziny są w globalu i z nich liczy się status „Otwarte teraz / Zamknięte · otwieramy …”.
- Liczby i obietnice tylko prawdziwe. Każda obietnica oznaczona **[SZEF]** jest polem w panelu, nie stałą w kodzie.
- Bez liczby godzin pracy ani stawek godzinowych.

## 2. Mapa strony i adresy

| Adres | Szablon | Plansza | Etap |
|---|---|---|---|
| `/` | Strona główna | `Main` (1440) + `Mobile` (390) | 1 |
| `/oferta` | Katalog | `Katalog` + `KatalogM` (390) | 1 |
| `/oferta/[kategoria]` | Kategoria (23 kategorie od katalogu v2, ADR-012 rozstrzygnięcie 12; kategoria bez produktów jest ukryta i daje 404, rozstrzygnięcie 7). Wariant rozszerzony dla `kasy-fiskalne` | `Kategoria` | 1 (porównywarka: 2) |
| `/produkt/[slug]` | Produkt / usługa | `Produkt` | 1 |
| `/zapytanie` | Lista zapytania + formularz | `Zapytanie` | 1 |
| `/opieka-it` | Strona usługi flagowej | `Dzial` | 1 |
| `/gopos` | Strona partnera flagowego | `Gopos` | 1 |
| `/insert` | Strona partnera flagowego | `Insert` | 1 |
| `/branze/[branza]` | Branża. Start: `gastronomia`, `handel`, `noclegi`; reszta (w tym `beauty`) „Wkrótce” — slugi wg ADR-012, rozstrzygnięcie 8 | `Branza` (gastronomia) | 1 (3 branże), 2 (reszta) |
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
- linki Zgłoś awarię (na stronie głównej do `#kontakt`, na innych stronach `/kontakt`) i Aktualności — **bez „Pomoc zdalna”** (v20: pomoc zdalna występuje tylko na `/opieka-it`);
- „Oferty i serwis: 889 003 889” jako `tel:` — jeden numer główny; telefony i e-maile działów są w `SiteSettings.contactChannels` (ADR-012, rozstrzygnięcie 6).

### 3.2 Nagłówek (sticky, półprzezroczysty z blur)
- Elementy od lewej:
  - logo (wersja jasna lub ciemna wg motywu);
  - **Oferta ▾** (mega menu);
  - Opieka IT;
  - GoPOS i InsERT, każdy z zieloną kropką „partner”;
  - O firmie;
  - Kontakt;
  - **lupa** — przycisk 44×44 jak przełącznik motywu, `aria-label` „Szukaj w ofercie (skrót /)”; klik albo `/` otwiera nakładkę wyszukiwarki (szerokie pole „Szukaj w ofercie” usunięte w v20);
  - przełącznik motywu;
  - przycisk **Zapytanie** z licznikiem pozycji.
- **v20:** „Branże ▾” usunięte z menu (desktop i telefon) razem z rozwijaną listą; „Aktualności” nie ma w menu głównym (zostają w górnym pasku i w stopce). Strony `/branze/*` zostają — prowadzą do nich link na dole mega menu, kafle branż na stronie głównej i stopka.
- Pozycje menu nigdy się nie łamią (`white-space: nowrap`), odstęp 26 px. Poniżej 1080 px menu pełnoekranowe. Rząd mieści się bez poziomego przewijania przy 1100, 1280 i 1440 px (test Playwright: `scrollWidth === innerWidth`).
- Aktywna pozycja menu ma podkreślenie (kreska akcentu).
- **Mega menu Oferta:**
  - 5 kolumn = 5 grup katalogu, każda z listą kategorii i liczbą pozycji;
  - **czytelność (uwaga szefa 16.10):** nazwy kategorii min. 15 px, mniej elementów w kolumnie zamiast mniejszej czcionki — kolumna „Kasy i sprzedaż” ma 8 kategorii z vendingiem, więc B3 proponuje limit pozycji w kolumnie i link „Wszystkie w grupie →” (`/oferta?grupa=…`); kategorie bez produktów nie są pokazywane;
  - w kolumnie Oprogramowanie na górze GoPOS i InsERT z etykietą „partner”;
  - w kolumnie Serwis i usługi na górze Opieka IT („abonament”) i Przegląd IT („0 zł”);
  - po prawej karty GoPOS i InsERT;
  - na dole pasek: „Cała oferta (67)”, kreator, telefon oraz link „Rozwiązania dla branż: gastronomia, handel, hotele →” (v20, do `/branze/gastronomia`).
  - Kliknięcie kategorii prowadzi do `/oferta/[kategoria]`, kliknięcie grupy do `/oferta?grupa=…`.
  - Zamykanie: Esc, klik poza menu, zmiana trasy.
- **Wyszukiwarka (nakładka):**
  - otwiera ją klik w lupę albo klawisz `/`, zamyka Esc;
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
- **Menu pełnoekranowe:** wszystkie pozycje menu głównego (§3.2, bez „Branże” od v20), w tym rozwijana Oferta (grupy → kategorie), przełącznik motywu, telefon i WhatsApp.
- **Dolny pasek przyklejony:** Zadzwoń (`tel:`), WhatsApp (`https://wa.me/48889003889`), Zapytanie (licznik).
- Górny pasek i przełącznik motywu w nagłówku są ukryte.
- Wzór: `screens/Mobile-390-*` i `screens/KatalogM-390-light`.

### 3.4 Stopka (5 kolumn)
Układ planszy `Main` (decyzja Krystiana 18.10.2026, B3b; wcześniejsza wersja tej sekcji miała kolumny „Usługi i partnerzy” i „Firma”):
- Kolumny:
  - opis linii, dane firmy z adresem i godzinami, **miejscowości obsługi** (z `SiteSettings`), odznaki statusów partnerów;
  - Oferta: „Cały katalog” + grupy katalogu;
  - Najważniejsze (linki z panelu: Opieka IT, GoPOS, InsERT, przegląd IT, KSeF, kreator);
  - Branże i firma (linki z panelu: branże, O firmie, Aktualności, pozostałe linie PRO-KOM);
  - Kontakt: numer główny, WhatsApp, telefony firmy, e-mail, „Kontakt i dojazd”.
- Odznaki są **tekstowe** jak na planszy („Autoryzowany partner GoPOS”, „Serwis Posnet i Elzab”), tworzone ze statusów partnerów potwierdzonych w panelu [SZEF] — bez statusu nie ma odznaki.
- Na dole: „© rok PRO-KOM Tadeusz Wójciak · NIP **[SZEF: podać]** · Oferta skierowana do przedsiębiorców i instytucji · Logotypy należą do ich właścicieli” oraz linki Mapa strony, Polityka prywatności, Cookies, Dostępność.

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

## 4. Strona główna `/` — kolejność sekcji (v20, zatwierdzona 20.10)

Wzór: `boards/Main.dc.html`, `screens/Main-1440-light/01–09.jpg`, `Main-1440-dark/*`, telefon: `Mobile-390-light/*`, `Mobile-390-dark/*`. Teksty bierz z planszy; są uzgodnione. Szczegóły wyglądu sekcji: `docs/design/prokombiznes/ZMIANY-v20.md` §2. Każda sekcja to blok Payload (ADR-006), więc szef może zmieniać treść bez kodu. Charakter wyglądu z v17 bez zmian: granat, karty, koło działów w hero, kolorowe ikony działów, szyna sekcji ≥ 1400 px.

Uwaga szefa 16.10: kafelki „Oferta” i „Opieka IT” (karty działów w hero, kafelkach i kartach grup) mają wyglądać spójnie — jeden komponent karty.

| # | Sekcja | Kotwica | Tło |
|---|---|---|---|
| 1 | Hero | `#start` | jasne |
| 2 | 4 kafelki potrzeb | — | jasne |
| 3 | Marki (pasek) | — | jasne |
| 4 | Oferta | `#oferta` | białe |
| 5 | Najczęściej wybierane | `#wybierane` | `--bg2` |
| 6 | Plan Twojej firmy + branże + dofinansowania | `#plan` | jasne |
| 7 | Jak pracujemy | `#jak-pracujemy` | jasne |
| 8 | Pięć firm czy jedna | `#jeden` | granat |
| 9 | Dla kogo pracujemy | `#referencje` | `--bg2` |
| 10 | Fakty: słowo właściciela + karta faktów | `#fakty` | jasne |
| 11 | Ostatnio w Aktualnościach | — | jasne |
| 12 | FAQ | `#faq` | `--bg2` |
| 13 | Formularz kontaktowy | `#kontakt` | jasne |

1. **Hero** `#start`
   - Elementy:
     - H1 „Kasy, komputery i opieka IT. Jeden telefon do wszystkiego.” — druga część jednolitym kolorem akcentu (`--acc`, w ciemnym motywie `#8FB0F4`), **bez gradientu** (ADR-013);
     - lead: „Dobieramy, wdrażamy i serwisujemy wszystko, na czym pracuje Twoja firma: od kasy fiskalnej po serwer. Jeden partner z Rabki zamiast kilku firm i infolinii.”;
     - CTA „Dobierz zestaw w 60 sekund” (→ `/kreator`, bez pigułki „60 s” w przycisku) i telefon;
     - „Oddzwaniamy w ciągu 60 minut w godzinach pracy” **[SZEF]**;
     - linia zaufania „Serwis Posnet i Elzab · partner GoPOS i InsERT” **[SZEF: dokładna nazwa statusów]**;
     - „Na Podhalu od 2004”;
     - „100+ firm pod stałą opieką”.
   - Bez rozmytych poświat w tle; siatka kropek zostaje.
   - Po prawej **koło 5 działów**:
     - działy = 5 grup katalogu, w środku aktywna grupa z liczbą pozycji;
     - wokół miniatury produktów;
     - autoprzełączanie co kilka sekund, kliknięcie wybiera dział;
     - link „Zobacz plan Twojej firmy ↓”.
   - Na telefonie to samo koło, pomniejszone, z samymi ikonami działów (nazwy dla czytników ekranu) — jak na zrzutach `Mobile-390-*` v20 (decyzja Krystiana 23.10, B7a).
2. **4 kafelki potrzeb:**
   - Otwieram firmę lub lokal, z plakietkami „700 zł zwrotu za kasę online” **[SZEF: ulga — potwierdzić w ustawie]** i „0 zł terminal przez 12 mies.”;
   - Coś przestało działać;
   - KSeF, z licznikiem dni **[SZEF: treść kafla do korekty — §13]**;
   - Stała opieka IT, z plakietką „0 zł przegląd”.
   - Każdy kafelek prowadzi do właściwej strony.
3. **Marki:** jeden rząd logo w pasku przewijanym (marquee), pauza na hover, `prefers-reduced-motion` = statyczny rząd.
4. **Oferta** `#oferta`
   - Etykieta „Oferta”, H2 „Wszystko dla firmy, w pięciu działach.”, lead „67 produktów i usług od 25 marek. Cen nie ma na stronie: dodajesz pozycje do zapytania, a wycenę dostajesz na piśmie, pod swoją firmę.” (liczby z bazy), po prawej przycisk obrysowany „Cały katalog · 67 pozycji →”.
   - **5 kart działów** (5 kolumn, odstęp 16 px):
     - **witryna** 150 px w kolorze działu z 2 zdjęciami produktów (`CatalogGroups.showcase`, ADR-012); Serwis i usługi zamiast zdjęć ma 2 białe paski statusu („● Opieka IT · aktywna”, „● Przegląd kasy · za 43 dni”);
     - ikona działu 46×46 zachodząca na dolną krawędź witryny;
     - nazwa i opis;
     - 3 największe kategorie działu jako linki z liczbą pozycji (z bazy, malejąco);
     - pasek „25 pozycji · Cały dział →” (po najechaniu wypełnia się akcentem).
     - Telefon: każdy dział to jeden wiersz (ikona 48 px, nazwa, liczba pozycji).
   - Podtytuł „Systemy, które wdrażamy od początku do końca” · „Dwa autoryzowane partnerstwa i nasza usługa opieki IT”.
   - **3 jednakowe karty flagowe** (jeden komponent, granat `#0A1430`, nagłówki zawsze białe): GoPOS, InsERT, Opieka IT (zamiast obrazu mini panel 3 statusów). Teksty i linki: `ZMIANY-v20.md` §2.2. Na telefonie i tablecie jedna pod drugą.
5. **Najczęściej wybierane** `#wybierane`
   - Etykieta, H2 „Osiem pozycji, o które firmy pytają najczęściej.”, lead „Każdą dodasz do zapytania jednym kliknięciem. Resztę oferty znajdziesz w katalogu.”, przycisk „Cały katalog · 67 pozycji →”.
   - **8 produktów, 4 w rzędzie** — karta katalogu jak na `/oferta`, ale bez tagów: zdjęcie, logo marki, nazwa, jedno zdanie korzyści (max 2 linie), max 1 odznaka, „Szczegóły →” i „+ Do zapytania”.
   - Lista startowa `ergo, k10, pol, d3, hx, tp, euro, nas` (flaga `featured` + `featuredOrder`; seed: `kolejnosc_wyroznionych`) **[SZEF: wg faktycznej sprzedaży]**.
   - Telefon: poziomo przewijany pasek (scroll-snap, karta 78% szerokości).
   - Pod produktami 2 niższe karty CTA (bez licznika 67/25/20 i bez ikony zegara):
     - **„Cała oferta”** (granat, mozaika miniatur, „Poznaj całą ofertę”) → `/oferta`;
     - **kreator** (ciemna zieleń, podgląd 4 kroków, „Dobierz zestaw w 60 sekund”) → `/kreator`.
6. **Plan Twojej firmy** `#plan`
   - Interaktywny rzut lokalu: rodzaj firmy (zakładki), punkty na planie, karta szczegółu. Etap 1: wersja uproszczona (zakładki + statyczne punkty z opisem). Etap 2: pełna interakcja jak na planszy.
   - **Siatka branż** „Nie widzisz swojej branży? Obsługujemy każdą firmę.”: 9 branż i dziesiąty kafel „Pokaż wszystkie branże · jeszcze 10 i każda inna firma”; klik rozwija na miejscu resztę i kafel „Każda inna firma” (→ kreator). Telefon: 5 branż + ten kafel.
     - Widoczne, w kolejności: Sklep spożywczy · Sklep odzieżowy i branżowy · Restauracja, bar, kawiarnia · Pensjonat, hotel, apartamenty · Fryzjer, kosmetyka, beauty · Gmina, urząd, biblioteka · Biuro rachunkowe · Gabinet, przychodnia · Szkoła, przedszkole.
     - Po rozwinięciu: Stragan, handel obwoźny · Food truck · Mechanik i serwis · Zakład produkcyjny · Hurtownia · Firma transportowa · Kancelaria · Sklep internetowy · Apteka · Stacja paliw, myjnia · Każda inna firma.
     - Kolejność i widoczność to dane w panelu (ADR-012), nie kod.
   - Pod spodem pasek dofinansowań. Szerokość sekcji jak reszta strony (kontener 1280 px).
7. **Jak pracujemy** `#jak-pracujemy`: 4 kroki z kreską postępu.
8. **Pięć firm czy jedna** `#jeden` (wersja krótsza):
   - telefon z animacją kontaktów, przełącznik „Osobne firmy / Jeden partner: PRO-KOM” i dymki — bez zmian;
   - bez paska liczb 6 → 1 i bez zdania podsumowania; przyciski „Chcę jeden numer do wszystkiego” i telefon w lewej kolumnie pod wierszami;
   - telefon (390 px): wiersze jako siatka 2×2 z samymi tytułami, telefon pomniejszony do ok. 86%, przyciski na pełną szerokość.
9. **Dla kogo pracujemy** `#referencje`: 6 rodzajów firm, opinie, logo klientów.
   - **[SZEF: 2 opinie Google 1:1 z linkiem do źródła, 4–6 logo klientów tylko za pisemną zgodą]**.
   - Do czasu zgód sekcja pokazuje rodzaje firm bez logo; flaga w panelu.
   - Uwaga szefa 16.10: referencje i polecenia od razu na starcie — opinie i logo klientów mają osobne flagi widoczności w `SiteSettings` (włączane po zgodach).
10. **Fakty** `#fakty`
    - Karta „Słowo od właściciela” z podpisem (font Caveat) **[SZEF: treść cytatu; zdjęcie czy ikona — placeholder zdjęcia tylko za flagą]**.
    - Pod nią jedna niska granatowa **karta faktów** (3 kolumny):
      - liczby „100+ / firm pod stałą opieką” i „4 / autoryzacje i partnerstwa” (bez „2004”, który jest w karcie właściciela);
      - kontakt: telefon (`tel:`), biznes@pro-kom.eu (`mailto:`), adres z linkiem do trasy w Mapach Google, godziny ze statusem na żywo;
      - autoryzacje: 4 logo (Posnet, Elzab, InsERT, GoPOS), „Dojeżdżamy do firm na całym Podhalu i w Małopolsce.” + „Kontakt i dojazd →”.
    - Tablet: 2 kolumny, autoryzacje pod spodem; telefon: jedna kolumna, logo 2×2.
    - Wszystkie dane z `CompanyData` / `SiteSettings` i `Partners`, nic na sztywno.
11. **Ostatnio w Aktualnościach:** nagłówek + „Wszystkie aktualności →”, 3 karty z 3 ostatnich wpisów `Posts` (kategoria, data, tytuł, „Czytaj →”). Mniej wpisów = tyle kart; 0 = sekcja ukryta.
12. **FAQ** `#faq`
    - Lewa kolumna (sticky): H2 „Zanim zadzwonisz”, lead, mała biała karta kontaktu (status godzin, przycisk z telefonem, WhatsApp i biznes@pro-kom.eu).
    - Prawa kolumna: każde pytanie to osobna biała karta z numerem 01–06 i okrągłym przyciskiem „+” (po otwarciu „×”); pierwsze pytanie otwarte na start.
    - 6 pytań, `<details>/<summary>` + JSON-LD `FAQPage`; odpowiedź „Co, gdy coś przestanie działać?” bez pracy zdalnej.
13. **Formularz kontaktowy** `#kontakt`: jeden ekran, bez kroków i bez tematów (§8.4). Lewa strona granatowa (status godzin, H2 „Napisz, czego potrzebujesz. Odezwiemy się szybko.”, 3 kafle: telefon, WhatsApp, e-mail), prawa biała z formularzem. Szczegóły wyglądu: `ZMIANY-v20.md` §2.9.

**Usunięte w v20 (nie przywracać):**
- sekcja „Masz konkretną sprawę? Wybierz — załatwimy ją szybciej” (szybkie sprawy: awaria, serwis kasy, przegląd, pomoc zdalna);
- stary blok faktów z dużymi kaflami i mapą okolicy;
- przewijany pasek „Ostatnio u nas”;
- pomoc zdalna na stronie głównej i w nagłówku (zostaje tylko na `/opieka-it`).

**Przeniesione z głównej (nie przywracać):**
- bezpłatny przegląd IT i kalkulator przestoju → `/opieka-it`;
- pasek „Przenieś serwis kasy” → kategoria kas;
- pełna lista miejscowości → stopka i Kontakt;
- stare realizacje AV z lat 2016–17 → wracają dopiero po świeżych zdjęciach i zgodach.

**Przyciski:** przycisk główny będący linkiem ma zawsze tekst w kolorze `--accInk` (biały w jasnym motywie). Plansze `Main` (plan firmy), `Dzial`, `Produkt`, `Insert`, `Kategoria` mają tu błąd (ciemny tekst na niebieskim) — to nie wzorzec; axe ma to wyłapać.

## 5. Katalog `/oferta`

Wzór: `Katalog`, `KatalogM`, `screens/Katalog-1440-*`, `screens/KatalogM-390-light`.

### 5.1 Nagłówek strony
- Okruszki, eyebrow „Katalog PRO-KOM Biznes · bez cen, wycena na piśmie”.
- H1 „Wszystko dla firmy. W jednym miejscu.”, lead.
- Duże pole wyszukiwania i chipy „Popularne”.
- Statystyki: liczba produktów i usług (225), liczba marek, autoryzowane partnerstwa, 60 min oddzwonienia — liczby zawsze z bazy.
- Kafle grup: „Wszystko” + 5 grup z liczbą pozycji.

### 5.2 Filtry (lewa kolumna, sticky)
- **Rodzaj:** Wszystko / Urządzenia / Oprogramowanie / Usługi (radio, z licznikami).
- **Kategoria:** pogrupowana wg 5 grup, checkboxy, liczniki. W `akc` i `kody` dodatkowo chipy podkategorii (`Products.subcategory`, np. „Szuflady kasowe”, „Skanery kodów”) — `ZMIANY-katalog-v2.md` §4.
- **Marka:** logo w siatce, multi-select; „Pokaż wszystkie marki (N)”.
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
  - czytelność (uwaga szefa 16.10): nazwa produktu i nazwy w filtrach min. 15 px, bez zmiany układu planszy;
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

Szablon ogólny dla wszystkich 21 kategorii (kategoria bez opublikowanych produktów → 404, ADR-012 rozstrzygnięcie 7):
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
- **Zakładki:** Opis · Specyfikacja · Dokumenty · Pytania. Treść ze sterowanego bloku rich text; specyfikacja jako tabela par klucz–wartość. „Dokumenty” (zamiast „Do pobrania” z planszy, `ZMIANY-katalog-v2.md` §4): karty PDF i strony producenta (`sources`), otwierane u producenta. Widoczne są tylko zakładki z treścią; jedna zakładka = zwykła sekcja z nagłówkiem.
- „Kiedy wybrać inną kasę?”: linki do alternatyw.
- „Skompletuj stanowisko jednym kliknięciem”: 4–5 akcesoriów (relacja `pasujeDo`) i przycisk „Dodaj wszystko do zapytania”.
- „Podobne”: 4 produkty z tej samej kategorii.
- JSON-LD `Product` **bez `offers`** (brak cen), z `brand` i `image`, plus `BreadcrumbList`.

### 6.3 Lista zapytania `/zapytanie`
Wzór: `Zapytanie`.

- **Lewa kolumna:** pozycje z miniaturą, ilością −/+, **uwagą do pozycji** (rozwijane pole „Dodaj uwagę, np. kolor, model, termin”), usuwaniem. Poniżej „Często dobierane razem” (tekst planszy).
- **Prawa kolumna:** formularz „Dane do kontaktu” według planszy `Zapytanie` (decyzja Krystiana 24.10.2026, B8; zastępuje wcześniejsze „rodzaj firmy” i inne nazwy terminów):
  - **Imię \***, **Telefon \***, Firma / NIP, Miejscowość, E-mail (na wycenę, opcjonalnie);
  - „Jak się skontaktować?”: Telefon / WhatsApp / E-mail;
  - „Na kiedy?”: Pilne / W tym miesiącu / Przed sezonem / Bez pośpiechu;
  - uwagi (opcjonalnie), zgoda RODO, przycisk „Wyślij zapytanie (n pozycji)”.
- **Po wysłaniu:**
  - ekran sukcesu z osią czasu „Teraz → do 60 min telefon → wycena na piśmie” **[SZEF: 60 min]**;
  - numer zapytania;
  - lista jest czyszczona.
- Pusta lista: zachęta i przyciski „Przejdź do katalogu” / „Dobierz zestaw w 60 s”; formularz obok zostaje („albo po prostu napisz w formularzu obok”) i wysyła zwykły kontakt z wymaganą wiadomością.
- „Zapytaj o X” (`?fraza=`): ramka „Szukałeś: „X” — dopiszemy to do zapytania” z przyciskiem usunięcia; fraza idzie w tematach zgłoszenia (przy pustej liście typ `search`).
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
Wzór: `Gopos`. Sekcje wg planszy (B9b, decyzje Krystiana 24.10):
1. Hero ze zdjęciem lokalu, logo GoPOS i plakietką „Autoryzowany partner GoPOS” **[SZEF: nazwa statusu]** — plakietka to status z kolekcji Partnerzy (bez statusu — bez plakietki).
2. Statystyki w pasku hero — **każda liczba ze źródłem GoPOS (pole „źródło” w panelu) albo nie ma jej na stronie**; na start pas jest pusty.
3. „Program to połowa sukcesu…”: 4 karty usług.
4. **Eksplorator modułów:** lista po lewej, podgląd ekranu po prawej (8 modułów z planszy; CRM, Room Service, Menu Board i Multilokalizacja do dopisania w panelu, gdy będą teksty).
5. „Jak to działa”: jedno zamówienie w 4 krokach.
6. **3 zestawy z planszy:** kawiarnia/food truck, restauracja („Polecany na start”), fast food/samoobsługa — bez cen; pozycje to produkty katalogu; „Dodaj zestaw do zapytania” dodaje komplet pozycji.
7. Kroki od prezentacji do pierwszego sezonu.
8. Migracja z innego systemu i GoPOS + NFHotel (dwa panele).
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
- CTA „Przygotuj ofertę dla [branża]” → `/kreator?firma=<rodzaj firmy>` (uwaga szefa 16.10: połączyć Branże z doborem; rodzaj firmy z pola branży `wizardBusinessType`, ADR-012 rozstrzygnięcie 8). Bez przeprojektowania strony.
- Inne branże: 3 aktywne i „Wkrótce” dla reszty (7 branż, w tym „Beauty i usługi”).
- Kontakt.

Na start gastronomia, handel i noclegi. Treści handlu i noclegów piszemy wg wzoru gastronomii.

### 6.8 Kreator `/kreator`
Wzór: `Kreator`; dane w `seed/prokombiznes/kreator.json`.

- **4 kroki z paskiem postępu:**
  1. Firma: 10 rodzajów firm. Parametr `?firma=<id>` (id z `rodzaje_firm`) zaznacza rodzaj od razu; nieznany id jest ignorowany.
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
  - karty: telefon, WhatsApp, e-mail, adres oraz kanały działów z `SiteSettings.contactChannels` (dział, telefon, e-mail, godziny);
  - mapa jako statyczny obraz z linkiem do Map Google — bez osadzania iframe Google przed zgodą cookies;
  - godziny;
  - formularz;
  - „Dojazd, godziny, wyceny” (FAQ);
  - miejscowości obsługi;
  - JSON-LD `LocalBusiness`.

## 7. Treści

- **Teksty:** z plansz (uzgodnione). Przy przenoszeniu nie poprawiaj stylu; zmieniasz tylko punkty **[SZEF]**.
- **Katalog:** `seed/prokombiznes/katalog.json`:
  - **katalog v2 (22.10.2026):** 225 pozycji (212 produktów + 13 usług), 32 marki (31 z produktami; liczby na stronie zawsze z bazy), 23 kategorie (nowe: „Wagi sklepowe”, „Skanery, kolektory i etykiety”; „Akcesoria POS” bez wag; „Automaty vendingowe” z 1 produktem), 5 grup, 7 branż (w tym „Beauty i usługi”, nieaktywna);
  - podkategorie (chipy) w `akc` i `kody`; warianty na jednej karcie; linki do stron i kart PDF producenta (`sources`);
  - opisy pozycji z partii 1 i 2 są tymczasowe (z arkusza, `contentStatus` „Do sprawdzenia”); docelowe opisy i parametry przychodzą partiami z czatu „Treści · katalog Biznes”;
  - parametry tylko ze strony producenta (link w `sources`), z datą sprawdzenia; bez źródła pole puste;
  - zmiany i decyzje o asortymencie: `docs/design/prokombiznes/ZMIANY-katalog-v2.md`; model: ADR-012 rozstrzygnięcie 12.
- **Media:** `docs/design/prokombiznes/boards/media/` i opis w `seed/prokombiznes/media.json`; galerie produktów katalogu v2 w `seed/prokombiznes/media/produkty/` (opis i źródło każdego pliku: `media-produkty-v2.json`).
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

- **Formularz kontaktowy (v20)** — strona główna `#kontakt` i `/kontakt`, ten sam komponent; jeden ekran, **bez kroków i bez chipów z tematami**:
  - **Imię \***, **Telefon \*** (siatka 2×2 z polami Firma i E-mail);
  - Firma (opcjonalnie);
  - E-mail (opcjonalnie; gdy podany — sprawdzany format);
  - **„W czym możemy pomóc?” \*** (textarea, placeholder z przykładem);
  - zgoda RODO z linkiem do polityki;
  - ukryte: źródło (adres strony), UTM.
  - Typ zgłoszenia `kontakt`. Po wysłaniu ekran „Dziękujemy, zapytanie wysłane.” z przyciskiem „Wyślij kolejne”. Wygląd: `ZMIANY-v20.md` §2.9.
  - Pole „tematy” zostaje w modelu `Inquiries` (używa go np. „Zapytaj o X”), ale ten formularz go nie wysyła.
- **Zapytanie z listą (`/zapytanie`)** — pola według §6.3 (plansza `Zapytanie`, decyzja 24.10.2026): **imię \***, **telefon \*** (oddzwaniamy), wiadomość opcjonalna (uwagi do listy), pozycje z ilościami i uwagami; ukryte: źródło (adres strony), UTM. „Zapytaj o X” z wyszukiwarki (`/zapytanie?fraza=X`) przy pustej liście wysyła typ `search` z frazą w tematach.
- **Kreator** — pola ustala B10; do tego czasu serwer wymaga imienia i telefonu lub e-maila.
- Reguły pól i typy zgłoszeń: ADR-003, uzupełnienie 24.10.2026.
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
- Stopka (§3.4): układ planszy `Main` zamiast pierwotnej listy kolumn, odznaki tekstowe zamiast logo (decyzja 18.10.2026, B3b).
- **Uwagi szefa z 16.10** (Asana „Biznes: wprowadzenie uwag szefa z wizualizacji”, wprowadzone w B0 18.10.2026; model: ADR-012 „Rozstrzygnięcia”):
  - nowa branża „Beauty i usługi” jako 7. branża „Wkrótce” (§2, §3.2, §6.7);
  - nowa kategoria „Maszyny vendingowe” (21.) w grupie „Kasy i sprzedaż”; produkty Elzab dopiero z danymi ze źródłem (§2, §7, §13) — od katalogu v2 (22.10) „Automaty vendingowe” (`automaty-vendingowe`) z 1 produktem;
  - Branże połączone z doborem: CTA „Przygotuj ofertę dla …” → `/kreator?firma=…` (§6.7, §6.8);
  - kafelki „Oferta” i „Opieka IT” jednym komponentem (§4);
  - czytelniejsza oferta: min. 15 px dla nazw w mega menu, na kartach i w filtrach (§3.2, §5.3);
  - referencje i polecenia od razu, za flagami widoczności (§4, sekcja 8);
  - kanały kontaktu działów w `SiteSettings`, w nagłówku jeden numer (§3.1, §6.9).
- **v20 (20.10.2026)** — wizualizacja Claude Design wersja 111, zatwierdzona przez Krystiana; zmiany: `docs/design/prokombiznes/ZMIANY-v20.md`, wniesione w D1:
  - nagłówek bez „Branże ▾”, wyszukiwarka jako lupa, menu bez łamania; górny pasek bez „Pomoc zdalna” (§3.1, §3.2);
  - pomoc zdalna tylko na `/opieka-it`; e-mail linii Biznes biznes@pro-kom.eu z `SiteSettings` (§1);
  - strona główna: 13 sekcji, nowe „Oferta” i „Najczęściej wybierane” (8 pozycji zamiast 12), krótsza „Pięć firm czy jedna”, karta faktów, 3 karty Aktualności, FAQ w kartach; usunięte „Masz konkretną sprawę?”, stary blok faktów i pasek „Ostatnio u nas” (§4);
  - H1 hero bez gradientu, bez poświat (ADR-013);
  - formularz kontaktowy w jednym ekranie, bez tematów (§8.4).

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
6. 8 produktów wyróżnionych wg faktycznej sprzedaży (v20; start: `ergo, k10, pol, d3, hx, tp, euro, nas`).
7. Rozważyć zdanie „orientacyjną wycenę podamy w pierwszej rozmowie”.
8. Automaty vendingowe (było: Maszyny vendingowe): katalog v2 ma 1 produkt (Elzab KW3, opis „Do sprawdzenia”, źródło `fiskalizujemyvending.pl`) i opis kategorii „fiskalizacja automatów” — **TODO(krystian):** sprawdzić parametry u producenta (`sources.checkedAt`), potwierdzić opis.
9. Kanały kontaktu działów: telefon, e-mail i godziny każdego działu (Asana, termin 20.10).
10. Nazwy branż „Wkrótce”: „Beauty i usługi” obok „Biura i usługi” — potwierdzić, że się nie mylą (od v20 bez menu „Branże ▾”: na stronach branż i w stopce).
11. Kafel KSeF na stronie głównej (v20): tekst „KSeF od 1 stycznia 2027” jest nieścisły — od 1.04.2026 obowiązek mają wszyscy, do końca 2026 r. trwają tylko wyjątki dla faktur z kas i firm do 10 000 zł miesięcznie (MF, pytania i odpowiedzi KSeF 2.0). Korekta treści w panelu przed publikacją.
12. Słowo właściciela: zdjęcie czy ikona (v20 — placeholder zdjęcia tylko za flagą).
