# prokombiznes.pl — specyfikacja strony

- **Status:** zakres i wygląd uzgodnione przez Krystiana 17.10.2026 na podstawie wizualizacji (17 plansz). Akceptacja szefa: Asana. Punkty oznaczone **[SZEF]** wymagają potwierdzenia przed publikacją, ale **nie blokują budowy**: buduj z tekstem z wizualizacji, a pole ma być edytowalne w panelu.
- **Wizualizacja v20 (20.10.2026):** nagłówek, górny pasek, strona główna i formularz kontaktowy według `docs/design/prokombiznes/ZMIANY-v20.md` — wniesione do §1, §3.1, §3.2, §4 i §8.4 (sesja D1). Zrzuty i plansze w repo są w wersji v20.
- **K3 i K3.1 (25.10.2026, wniesione w KD 26.10):** pełna oferta (katalog, zestawy, strony marek, plan firmy), produkt 2.0, salony Lenovo i Dell, Plan Twojej firmy 2.0 z filmami, GoPOS i InsERT 2.0, O firmie i Kontakt 2.0, telefon jak aplikacja. Spis materiałów i **kolejność ważności dokumentów wzorca**: `docs/design/prokombiznes/INDEKS.md` (MOBILE-APLIKACJA → K31-ZMIANY → K3-KATALOG → ZMIANY-v20 → ta specyfikacja). Ta specyfikacja streszcza K3/K3.1 i zapisuje decyzje repo (adresy, model); szczegóły zostają w `K3-KATALOG.md`, `K31-ZMIANY.md` i `MOBILE-APLIKACJA.md` — nie kopiujemy ich tutaj, żeby nie mieć dwóch źródeł prawdy. Sekcje z K3/K3.1 mają w nagłówku „źródło: …”.
- **Wygląd:** `docs/design/prokombiznes/` (plansze, zrzuty, tokeny, CSS; od K3: `k3/` i `k31/` — zrzut + plansza wygrywa z opisem słownym). **Model treści:** `docs/decyzje/ADR-012-katalog-i-model-tresci-prokombiznes.md` (z „Rozstrzygnięciami K3 i K3.1”), filmy: ADR-016. **Dane startowe:** `seed/prokombiznes/` (od K3: `seed/prokombiznes/k3/`, `seed/prokombiznes/k31/`).
- **Stos:** ADR-005 (Next.js + Payload 3, TS strict). Strony z bloków: ADR-006. Marka i fonty: ADR-007, `docs/marka.md`. Skrzynka zapytań: ADR-003.
- **Kolejność ważności przy sprzeczności:** ta specyfikacja → plansze wizualizacji → ADR-y → wcześniejsze briefy wizualne (brief z 15.10 jest zastąpiony przez wizualizację, patrz §11). Wyjątek: decyzje repo zapisane tu i w ADR-012 (adresy `/oferta/…`, model per tenant) wygrywają z nazwami z paczek K3/K3.1 (`/katalog/…`, „globale”).
- **Termin:** etap 1 (B0–B11) zbudowany 25.10.2026; produkcja po sesjach K3/K3.1 (`docs/zadania/prokombiznes.md` §6) — **TODO(krystian): nowy termin produkcji po decyzji szefa o kolejności Biznes vs Gaming do 20.11** (`AUDYT-PRODUKCJA.md` §10). Etapy: §10.

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
- **Zasady treści K3/K3.1** (źródło: `K3-KATALOG.md` §10, `K31-ZMIANY.md` §13.4, `INDEKS.md` §5):
  - poza zakazem cen: bez „0 zł”, „gratis”, „w cenie” (wyjątek: terminal 0 zł z Polskiej Bezgotówkowej — decyzja szefa 16.10, warunki sprawdzane w dniu publikacji);
  - marki zakazane w treściach publicznych: Novitus, Honeywell, Verifone, Datalogic, Barracuda, Streamsoft — test treści z listą zakazanych słów (K3a);
  - na Biznesie **tylko adres w Rabce** (bez Zakopanego) i **jeden e-mail biznes@pro-kom.eu** na całej stronie;
  - bez obietnic czasu („oddzwonimy w 60 min”) do decyzji szefa — czas reakcji tylko z umowy opieki IT;
  - Opieka IT bez pakietów na stronie; usługi ze statusem „do akceptacji szefa” (Opieka informatyczna, Bezpłatny przegląd IT, Kopie zapasowe) nieopublikowane, linki do nich ukryte;
  - pola wewnętrzne paczek (`uwagi`, `uwagi_wewnetrzne`, `do_potwierdzenia`, `sprawdzone_zgodnosci`, `ksefSprawdzic`) tylko w panelu — nigdy na stronie, w JSON-LD ani w indeksie wyszukiwarki;
  - liczniki (pozycje, marki, działy) zawsze z bazy, jedna funkcja; teksty z liczbą składane w całości, liczebniki z odmianą (1 / 2–4 / 5+, 12–14).
  - **Do zmiany w istniejącym kodzie** (dziś „w cenie” / „0 zł” z etapu 1): nagłówek „W cenie” w kategorii (B10a) → K3b′; „W PRO-KOM w cenie” w boksie produktu → K31b („Co robimy przy zakupie”); „W cenie zestawu” w kreatorze → PROD (kreator → zestaw); „Przegląd IT („0 zł”)” w mega menu i plakietka „0 zł przegląd” na głównej → PROD (usługa nieopublikowana). Nowe nazwy sekcji — z plansz K3.1.

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
| `/polityka-prywatnosci`, `/cookies`, `/dostepnosc` | Strony prawne z bloków (B11b) | brak | 1 |
| `/mapa-strony` | Lista linków (HTML) + `sitemap.xml` | (`Mapa` = plansza robocza, nie strona) | 1 |
| `/oferta/[kategoria]/[podkategoria]` | Podkategoria z własnym adresem, H1 i canonical — tylko w `komputery-monitory`, `serwery-nas-ups`, `ekrany-projektory` (np. `/oferta/komputery-monitory/laptopy`); źródło: `K3-KATALOG.md` §9, `K31-ZMIANY.md` §5 | `k31/screens/Web-Kategoria-1440` | K3b′, K31c |
| `/zestawy`, `/zestawy/[slug]` | Gotowe zestawy (§6.10) | `k3/screens/Web-Zestawy-*`, `Web-Zestaw-*` | K3c |
| `/marki/[slug]` | Strona marki (szablon K3) albo salon marki (Lenovo, Dell) (§6.11) | `k3/screens/Web-Marka-*`, `k31/screens/Web-Marka-1440`, `Web-Marka-Dell-1440` | K3b′, K31c |
| `/plan-firmy` | Plan Twojej firmy 2.0 — ta sama komponenta co sekcja na głównej (§6.12) | `k31/screens/Web-Plan-*` | K31d |

Zasady adresów:
- Slugi są po polsku, bez znaków diakrytycznych.
- Adres produktu nie zależy od kategorii, bo produkt może być w kilku.
- Kategorie mają czytelne slugi, np. `kasy-fiskalne`, `terminale-platnicze`. Mapowanie ze skrótów w seedzie (`kasy` → `kasy-fiskalne`) jest w ADR-012.
- **Paczki K3/K3.1 piszą `/katalog/{kod}/{podkategoria}` (np. `/katalog/komp/laptopy`) — w repo to `/oferta/{slug kategorii}/{slug podkategorii}`** (decyzja Krystiana 26.10, KD, ADR-012 „Rozstrzygnięcia K3 i K3.1” pkt 1): cała strona, sitemap, okruszki i e2e stoją na `/oferta/[kategoria]` ze slugami z ADR-012 §2.1. Kody K3 (`komp`, `serw`, `av`) mapuje import przez `CATEGORY_SLUGS`.
- Filtr serii w kategorii: `?seria=<slug>` z canonical bez parametru (K31c).
- Nowe trasy najwyższego poziomu (`zestawy`, `marki`, `plan-firmy`) trafiają do zarezerwowanych slugów stron (`RESERVED_PAGE_SLUGS`), żeby strona z panelu nie zajęła adresu.
- Stare adresy usuniętych i scalonych kart → 301 przez kolekcję `Redirects` (§6.2, ADR-012).
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
  - **K3/K3.1** (źródło: `K3-KATALOG.md` §9, `AUDYT-PRODUKCJA.md` §2): w grupie „Komputery i biuro” pod kategoriami podkategorie z adresem (Laptopy, Komputery i All-in-One, Stacje robocze, Monitory, Serwery, NAS, UPS, Monitory interaktywne, Ekrany informacyjne, Projektory, Wideokonferencje) — K3b′; pozycja „Gotowe zestawy” — K3c; „Plan Twojej firmy” i na dole „Salony: Lenovo · Dell” obok „Cały katalog” i kreatora — PROD; „Przegląd IT („0 zł”)” znika do decyzji szefa (usługa nieopublikowana) — PROD. Liczba w „Cały katalog (N)” z bazy.
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

### 3.3 Telefon — „jak aplikacja” (< 768 px; źródło: `docs/design/prokombiznes/MOBILE-APLIKACJA.md`)
**Stan etapu 1 (B3b):** nagłówek z logo, lupą, licznikiem i hamburgerem; menu pełnoekranowe; dolny pasek Zadzwoń · WhatsApp · Zapytanie (≤ 640 px; wzór `screens/Mobile-390-*`). **Zastępuje go M1** wg `MOBILE-APLIKACJA.md` — ten plik ma pierwszeństwo we wszystkim, co dotyczy telefonu. Streszczenie:
- **Zasada:** poniżej 768 px strona to osobny układ, nie pomniejszony desktop. Desktop się nie zmienia. Szerokość płynna 360–430 px.
- **Szkielet:** górny pasek 60 px (główna: logo · lupa · menu; podstrony: ← wstecz + tytuł · lupa · menu); **dolny pasek 5 zakładek** Start · Oferta · Szukaj · Zapytanie (licznik) · Kontakt; na produkcie, zestawie, zapytaniu, kreatorze i wpisie zamiast zakładek **przyklejona akcja** („Dodaj do zapytania”, „Zapytaj o ten zestaw · N poz.”, „Wyślij zapytanie · N poz.” …).
- **Arkusze od dołu** (`<dialog>`): menu, filtry („Pokaż N pozycji”), punkt planu (film + szczegóły); zamykanie tłem, przyciskiem, Esc i gestem w dół; focus trap.
- **Menu (arkusz):** 5 działów kafelkami, Gotowe zestawy, Plan Twojej firmy, Opieka IT, GoPOS, InsERT, Salony Lenovo/Dell, chipy (O firmie · Dobierz zestaw · Branże · Aktualności · Kontakt i dojazd), przełącznik motywu, „Zadzwoń · 889 003 889”.
- **Komponenty:** ciemne hero z poświatami (bez siatek), karuzele na scroll-snap (bez bibliotek), przyklejone chipy (w konfiguratorze chipy się zawijają), karta produktu 2 kolumny na tle studio z „+”, akordeony, kafle 2 × 2, toast `role="status"`.
- **29 ekranów z wzorcem** `k31/screens/App-*-390` (lista: `MOBILE-APLIKACJA.md` §3) — także O firmie, Opieka IT, branża, kreator (krok i wynik), aktualności, wpis; strony prawne i mapa strony jak wpis.
- **Definition of Done każdej sesji z UI** (`MOBILE-APLIKACJA.md` §4): zero poziomego przewijania przy 360/390/414 px (test Playwright na każdej trasie), cele dotykowe ≥ 44 px (w gęstych rzędach ≥ 40 px, linki ≥ 24 px), safe-area, Lighthouse mobile ≥ 90, filmy tylko po dotknięciu, `prefers-reduced-motion`, tryb ciemny bez białych plam, składane teksty z liczbami, pola nad klawiaturą ekranową.
- Ukryte na telefonie: koło działów, „Pięć firm czy jedna”, długa lista branż, animowany pasek marek.
- PWA (manifest, bez service workera) — opcjonalnie w PROD.

### 3.4 Stopka (5 kolumn)
Układ planszy `Main` (decyzja Krystiana 18.10.2026, B3b; wcześniejsza wersja tej sekcji miała kolumny „Usługi i partnerzy” i „Firma”):
- Kolumny:
  - opis linii, dane firmy z adresem i godzinami, **miejscowości obsługi** (z `SiteSettings`), odznaki statusów partnerów;
  - Oferta: „Cały katalog” + grupy katalogu;
  - Najważniejsze (linki z panelu: Opieka IT, GoPOS, InsERT, przegląd IT, KSeF, kreator — do K3.1; od K31b bez przeglądu IT, niżej „Stopka K3.1”);
  - Branże i firma (linki z panelu: branże, O firmie, Aktualności, pozostałe linie PRO-KOM);
  - Kontakt: numer główny, WhatsApp, telefony firmy, e-mail, „Kontakt i dojazd”.
- Odznaki są **tekstowe** jak na planszy („Autoryzowany partner GoPOS”, „Serwis Posnet i Elzab”), tworzone ze statusów partnerów potwierdzonych w panelu [SZEF] — bez statusu nie ma odznaki.
- Na dole: „© rok PRO-KOM Tadeusz Wójciak · NIP **[SZEF: podać]** · Oferta skierowana do przedsiębiorców i instytucji · Logotypy należą do ich właścicieli” oraz linki Mapa strony, Polityka prywatności, Cookies, Dostępność.
- **Stopka K3.1** (źródło: `K31-ZMIANY.md` §11.4, sesja K31b; wzorzec: stopka w `k31/screens/Web-*-1440`): układ v20 bez zmian, poza treścią kolumn — „Oferta” = Cały katalog · Gotowe zestawy · Plan Twojej firmy · Salon Lenovo · Salon Dell; „Najważniejsze” = Opieka IT · GoPOS · InsERT i KSeF · KSeF 2027 · Dobierz zestaw w 60 s; „Branże i firma” bez zmian; „Kontakt”: 889 003 889 (oferty i serwis), WhatsApp, 18 267 65 11, biznes@pro-kom.eu, Kontakt i dojazd; pod znakiem adres w Rabce i godziny + 3 plakietki partnerów. Linki do usług „do akceptacji szefa” (Bezpłatny przegląd IT) ukryte. Linki stopki są danymi w panelu (`biznesFooter`), więc K31b zmienia seed i domyślne linki, nie układ.

### 3.8 Tło „studio” pod zdjęciami produktów (źródło: `K31-ZMIANY.md` §3, sesja K31b)
- Jeden komponent `<ProductStage>` (gradient radialny, „blat” od 70% wysokości, miękki cień pod produktem, zdjęcie `contain` 74–80% pola) we **wszystkich** miejscach ze zdjęciem produktu: karty katalogu, galeria i miniatury, zestawy, salony, plan (punkty i popup), GoPOS/InsERT, wyszukiwarka, lista zapytania, „Najczęściej wybierane” na głównej.
- Siatki i kropki pod zdjęciami usunięte z kodu (także z ciemnych kart hero na telefonie — tam dwie poświaty). Wyjątek: rzuty lokali w planie (to podłoga).
- Kolory tła studio jako tokeny w `src/styles/tokens.css` (ADR-007, ADR-013) — wartości z `K31-ZMIANY.md` §3, dopisuje K31b.
- Karta bez zdjęcia: zastępnik na studio (ikona kategorii, „Zdjęcie producenta pojawi się wkrótce”) — nigdy pusty `<img>`.

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

**Zmiany K3/K3.1 na stronie głównej** (źródło: `K31-ZMIANY.md` §6, §11.6, §13.3; wzorzec `k31/screens/Main-1440`, telefon `App-Start-390`):
- sekcja 6 „Plan Twojej firmy” = **komponent Plan 2.0** (§6.12, wszystkie 12 scen, bez okruszków i własnego nagłówka) zamiast planu z B7c — sesja K31d; siatka branż i pasek dofinansowań pod planem zostają, dopóki plansza `Main-1440` ich nie usuwa (K31d porównuje ze wzorcem). Rozważenie „6 scen na głównej + Wszystkie” — P2 z `AUDYT-PRODUKCJA.md` §4, decyzja w `K31-przeglad.xlsx`;
- sekcja 5 „Najczęściej wybierane” = 8 kart z panelu w kolejności: Posnet Ergo Online, Elzab K10 Online, Sunmi D3 PRO, Lenovo ThinkBook 14 G8/G9, Lenovo ThinkCentre neo 50s/55s, terminal PolCard, Posnet Thermal HX Online, InsERT Subiekt nexo (`seed/prokombiznes/k31/strona-glowna-k31.json`; w repo `Products.featured` + `featuredOrder`), karty na tle studio, tylko prawdziwe karty z bazy (bez pozycji zbiorczych);
- liczniki w leadach („N pozycji od M marek”) z bazy — nigdy „225 pozycji, 30 marek” na sztywno;
- szyna sekcji: „Realizacje” → „Dla kogo” (PROD); kafel „Stała opieka IT” bez plakietki „0 zł przegląd” do decyzji szefa (PROD).

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

Wzór: `Katalog`, `KatalogM`, `screens/Katalog-1440-*`, `screens/KatalogM-390-light`; telefon od M1: `k31/screens/App-Oferta-390`, `App-Kategoria-390`, `App-Filtry-390`.

**Katalog K3/K3.1** (źródło: `K3-KATALOG.md` §1–4, `K31-ZMIANY.md` §1–2, §13.5–13.6; import w sesjach K3a i K31a):
- **K3:** 243 karty (230 produktów i programów + 13 usług) z pełną treścią (opis 3 akapity, 10–14 parametrów, wersje, źródła; większość z konfiguratorem, część z FAQ); statusy: 230 `gotowe`, 10 `do-sprawdzenia` (widoczne, `noindex`), 3 `do-akceptacji-szefa` (nieopublikowane); 79 kart usuniętych (`usuniete.json`) → ukryte + 301 do kategorii; **31 marek ze stroną** (nowe TP-Link, Adobe; Honeywell i StorageCraft ukryte).
- **K3.1:** +26 kart Lenovo/Dell (6 `do-sprawdzenia`), każda z 78 kart Lenovo/Dell w dokładnie jednej serii salonu; podział 6 kart wielomodelowych (`karty-podzial-k31.json`: nowe karty `do-sprawdzenia`, stare adresy → 301); uzupełnienia treści 135 kart (`tresci-uzupelnienia-k31.json`: każda widoczna karta ≥ 3 FAQ). Stan wg paczki: 269 kart, 266 widocznych przed podziałem — **na stronie liczby zawsze z bazy**.
- **Podkategorie:** chipy w `akcesoria-pos`, `skanery-kolektory-etykiety`, `wagi-sklepowe` (bez własnych adresów); w `komputery-monitory`, `serwery-nas-ups`, `ekrany-projektory` podkategoria ma slug, własny adres `/oferta/{kategoria}/{podkategoria}`, H1 i canonical (lista i kolejność: `slowniki-k3.json` → `kategorie[].podkategorie`; K3.1 dokłada `stacje-robocze` i `wideokonferencje`).
- Karta w katalogu: zdjęcie na tle studio (§3.8), znaczek „film”, gdy karta ma film (§6.13); karta bez zdjęcia — zastępnik (§3.8).
- Wyszukiwarka obejmuje też zestawy i marki (§8.2).

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

Wdrożenie B10a (decyzje Krystiana 24.10.2026):
- teksty sekcji w kategorii (zakładka „Strona kategorii — sekcje”); puste pola = ogólne teksty z nazwą kategorii;
- „W cenie” jako karty (ikona, tytuł, opis); bez kart — karty z samych pozycji listy „W cenie”;
- karta przepisu pokazuje się tylko z nazwą przepisu i linkiem do niego;
- dobór kas pokazuje się, gdy co najmniej 2 produkty kategorii mają typ kasy (decydują dane, nie adres); stan doboru i marki tylko w przeglądarce, strona ma jeden adres;
- „Często dobierane” = kafle kategorii polecanych produktów (z licznikiem pozycji);
- kontakt to formularz v20 (jak w katalogu), nie 3-krokowy z planszy.

**K3/K3.1 — podkategorie i serie** (źródło: `K3-KATALOG.md` §9, `K31-ZMIANY.md` §5; wzorzec `k31/screens/Web-Kategoria-1440`, `App-Kategoria-390`):
- chipy podkategorii w każdej kategorii, która je ma; w `komputery-monitory`, `serwery-nas-ups`, `ekrany-projektory` chip prowadzi do adresu podkategorii (np. „Laptopy dla firm — Lenovo i Dell” jako H1), canonical na siebie — K3b′;
- kategoria/podkategoria komputerów (K31c): ciemne hero z chipami podkategorii, **filtr serii** z licznikami (`?seria=`, canonical bez parametru), filtry marki i „Do czego”, karta „Nie wiesz, który?” → dobór w salonie marki (`/marki/<marka>#dobor`), karty z cechami i znaczkiem „film”;
- nowe nazwy i opisy kategorii ze słowników K3 (m.in. `kody` „Skanery, etykiety i kolektory”, `m365` „Licencje i oprogramowanie biurowe”) — import, nie kod;
- nagłówek sekcji „W cenie” zmienia nazwę (zasady treści, §1) — K3b′.

### 6.2 Produkt `/produkt/[slug]` — produkt 2.0 (źródło: `K31-ZMIANY.md` §4, §7, §13.5, §13.7 i `K3-KATALOG.md` §5)
**Obowiązuje produkt 2.0** (sesja K31b, pierwsza wersja strony produktu po K3 — wersji K3 nie budujemy osobno; `K3-KATALOG.md` §5 „Wybierz wersję”, FAQ, „W zestawach” jest w niej zawarty). Wzorzec: `k31/screens/Web-Produkt-1440` (ThinkBook 14), `Web-Produkt-ergo-1440`, `Web-Produkt-nowy-1440` (karta bez zdjęcia), `Web-Produkt-ciemny-1440`, telefon `App-Produkt-390`, `App-Produkt-caly-390`, `App-Produkt-ergo-390`; wartości i stany: `k31/boards/Strona.dc.html` (widok produkt).

Kolejność sekcji (pusta sekcja się nie renderuje):
1. **Hero:** galeria (miniatury pionowo + miniatura „Film”, licznik tylko przy 2+ zdjęciach, logo marki) | marka (link do strony marki/salonu) · seria · kategoria, H1, podtytuł, 3 wyróżniki z ikonami (z `cechy`), „Twoja wersja” (do 4 wybranych opcji) albo korzyść, „Dodaj do zapytania” + telefon, pas usług.
2. **Przyklejona nawigacja sekcji** (tylko istniejące sekcje) z mini-CTA.
3. **„W skrócie”** — bento 5 kafli z parametrów (1. ciemny podwójnej wysokości + 4 kafle 2 × 2), skracanie wartości bez wielokropka (`K31-ZMIANY.md` §4.3).
4. **Opis** + panel: Dla kogo (branże), Wyróżnia się (cechy), Producent, „Co robimy przy zakupie”.
5. **Wybierz wersję — konfigurator 2.0** (`K31-ZMIANY.md` §13.7): 3 kroki nad opcjami, gotowe konfiguracje wypełniają pasujące opcje, każda opcja z numerem i jednym zdaniem wyjaśnienia, chip „Doradźcie”, długie wartości (> 40 znaków) jako wiersze, wszystkie opcje z ≥ 2 wartościami (opcje z 1 wartością → „W każdej wersji”), przyklejone podsumowanie „Wybrano X z N”. **To nie koszyk i nie liczy ceny.** „Dodaj do zapytania” zapisuje notatkę „Wersja: <gotowa konfiguracja> · Procesor: … · Ekran: doradźcie · …” jako **uwagę pozycji** listy zapytania (`pk-cart`, §8.1) — trafia do maila i panelu bez nowego pola.
6. **Film** (§6.13): fasada + lista (maks. 2).
7. **Parametry** (2 kolumny), **Wersje** (karty), **W zestawach** (maks. 3, po K3c), **Do tego zwykle dobierają** (karty wg `dobierz`; bez dopasowania — chip tekstowy), **Z tej samej rodziny** (marka + seria, potem podkategoria; maks. 4; „Cała oferta <marka> →”).
8. **FAQ** (2 kolumny z kartą kontaktu; pierwsze otwarte).
9. **Źródła** — tylko domeny producentów z listy dozwolonych w kodzie; adresy sklepów i resellerów nigdy; etykieta liczona z adresu; data „sprawdzono”; brak źródeł producenta → sekcja i pozycja nawigacji znikają (`K31-ZMIANY.md` §4.9).
10. **Pas CTA** „Potrzebujesz kilku sztuk albo całego stanowiska?”.
- **Karta wielomodelowa** (`K31-ZMIANY.md` §13.5): H1 = nazwa krótka, gdy pełna > 62 znaki; chipy „W tej karcie” z modelami; `?wersja=<model>` ustawia konfigurator; canonical na kartę; kody modeli w aliasach (wyszukiwarka).
- **SEO:** `Product` bez `offers`, `BreadcrumbList`, `FAQPage` tylko dla kart `gotowe`, `VideoObject` dla filmu, `ProductGroup` (`variesBy`, `hasVariant` z `?wersja=`) dla kart z ≥ 2 wariantami; karty `do-sprawdzenia` — `noindex`, poza sitemap.
- **Telefon:** galeria przesuwana palcem, krótki H1 + chipy, konfigurator z zawijanymi chipami, parametry „6 + Pokaż wszystkie”, przyklejone „Dodaj do zapytania” (`MOBILE-APLIKACJA.md` §3).
- **Usunięte/scalone karty:** adres → 301 (do kategorii albo nowej karty); karta `do-akceptacji-szefa` → 404 albo 301 na `/opieka-it`.
- Z etapu 1 (B6) znikają: hotspoty i moduły na zdjęciu (pola usunięte migracją `k31b_drop_hotspots`, K31b), zakładki (zastępuje je nawigacja sekcji), „W PRO-KOM w cenie” (zasady treści, §1; jego miejsce zajmuje „Co robimy przy zakupie” w panelu opisu), „Podobne” (zastępuje je „Z tej samej rodziny”), „Kiedy wybrać coś innego?” i „Skompletuj stanowisko” (decyzja Krystiana 28.10: relacje `alternatives` i `fitsWith` zostają w panelu; produkty z „pasuje do” dochodzą do „Do tego zwykle dobierają” po kartach dopasowanych do fraz `dobierz`, a fraza bez dopasowania zostaje chipem; przy kilku trafieniach wygrywa karta tej samej marki).
- `VideoObject` bez `uploadDate` — daty publikacji nie ma ani w paczce, ani w oEmbed (decyzja 28.10; wraca, jeśli dojdzie pole w panelu albo zadanie pobierze ją z YouTube Data API — wymaga ADR).

**Etap 1 (B6, historia — zastąpione przez produkt 2.0):**
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

Telefon (M1): `k31/screens/App-Opieka-390` — hero z „panelem opieki”, 4 kroki, „Co dostajesz” 2 × 2, karta przeglądu, FAQ. Opieka IT **bez pakietów** na stronie; treści [SZEF] do akceptacji, układ obowiązuje (`MOBILE-APLIKACJA.md` §3).

### 6.5 GoPOS `/gopos`
**GoPOS 2.0** (źródło: `K31-ZMIANY.md` §8, §13.1; sesja K31e; wzorzec `k31/screens/Web-GoPOS-1440`, `App-GoPOS-390`; treści: `seed/prokombiznes/k31/strony-gopos-insert-k31.json` → `gopos`):
- **hero 2.0:** ciemna scena urządzeń bez kafelków (Sunmi D3 PRO, FLEX 3 KDS, Sunmi V3 MIX, terminal PolCard), pigułka partnera (status z `Partners` [SZEF]), H1 „Sala, kuchnia i dowozy. Jeden system.”, 2 przyciski, 4 fakty, „bilecik” zamówienia, karta „GoPOS Now” bez kwot, **pasek 4 kroków w hero** (klik w krok/urządzenie podświetla urządzenie i przesuwa status) — osobnej sekcji „Jedno zamówienie” nie ma;
- **konfigurator pakietu** (GoPOS zawsze + moduły z kart GoPOS; „Zapytaj o ten pakiet” dodaje pozycje z notatką „Pakiet GoPOS”) → sprzęt pod GoPOS (8 kart) → filmy GoPOS → zestawy gastronomii (§6.10) → wdrożenie w 5 krokach (widoczne numery) → FAQ (+ „Hotel z restauracją?”) → pas CTA;
- listy modułów z kart katalogu, nie z tekstu na sztywno; bez liczb niepotwierdzonych w kartach;
- strona zostaje stroną `Pages` z blokami Biznesu (nowe bloki/warianty 2.0) — nie global (ADR-012 „Rozstrzygnięcia K3 i K3.1” pkt 3).

**Etap 1 (B9b, historia — zastąpione przez GoPOS 2.0):**
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
**InsERT 2.0** (źródło: `K31-ZMIANY.md` §9, §13.2; sesja K31e; wzorzec `k31/screens/Web-InsERT-1440`, `App-InsERT-390`; treści: `strony-gopos-insert-k31.json` → `insert`):
- hero z „orbitą” programów → **„Który Subiekt dla mnie?”** (3 pytania → reguły z danych → Subiekt 123 / GT / nexo) → porównanie 123 / GT / nexo (tabela; telefon: karuzela kart) → rodzina programów (9 kart z katalogu) → **KSeF** (oś czasu 1.02.2026, 1.04.2026, 1.01.2027; podpis „Źródło: ksef.podatki.gov.pl · stan na <data>” z pola „sprawdzono” w panelu; notatka `ksefSprawdzic` tylko w panelu; 6 kroków, CTA) → **InsPunkty** `#inspunkty` → wdrożenie (6 kafli) → filmy → FAQ;
- **InsPunkty** (nie „inCoiny”): „Jak to działa” (5 kroków) + kalkulator „Policz w 10 sekund” (presety, liczniki ± 5, wynik miesięcznie i rocznie z odmianą „InsPunkt/-y/-ów”, pasek puli 100 z Abonamentu); „Zapytaj o paczkę InsPunktów” dodaje kartę `insert-inspunkty-ksef` z notatką „InsPunkty: N / mies.”; **bez cen paczek**;
- strona zostaje stroną `Pages` z blokami Biznesu (nowe bloki/warianty 2.0).

**Etap 1 (B9c, historia — zastąpione przez InsERT 2.0):**
Wzór: `Insert`. Sekcje wg planszy (B9c, decyzja Krystiana 24.10):
1. Hero „Subiekt dobrany do firmy. I podłączony do KSeF.” ze zrzutem programu w ramce laptopa, pudełkiem i dwiema notkami; logo InsERT i plakietka statusu partnera z kolekcji Partnerzy (bez statusu — bez plakietki).
2. **Dobór programu** `#dobor`: 4 kafle jednokrotnego wyboru (cecha firmy → jeden program: Subiekt 123 / nexo / nexo PRO / GT), na start nexo; pod spodem rekomendacja z punktami i przełącznikiem „Dodaj do zapytania” (nexo PRO dodaje Subiekta nexo — osobnego produktu nie ma) i pasek programów.
3. Rodzina programów: sprzedaż, księgowość, kadry (kafle ze skrótami).
4. KSeF z licznikiem dni `#ksef` (liczony w przeglądarce) i listą rzeczy do przygotowania; przycisk do wpisu KSeF po B11.
5. Usługi wdrożeniowe.
6. FAQ.
7. Kontakt.

**[SZEF: nazwa statusu partnera]**. Zrzuty ekranu programu tylko z materiałów InsERT (na start zaślepki z planszy).

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

Wdrożenie B10b (decyzje Krystiana 24.10.2026):
- stały szablon z pól branży (zakładka „Strona branży — sekcje”), nie z bloków; sekcja bez nagłówka nie pokazuje się;
- kolejność wg planszy: hero → zestaw (polecane produkty) → dzień w lokalu → jak to działa → FAQ → inne branże → kontakt;
- „Od lady po kuchnię” to siatka kart polecanych produktów (jak na planszy), z liczbą pozycji branży w katalogu i linkiem do `/oferta?branza=…`;
- okruszek „Branże” prowadzi do siatki branż na stronie głównej (`/#plan`); strony z listą branż nie ma;
- przycisk do kreatora: etykieta z panelu (gastronomia: „Przygotuj zapytanie dla lokalu” z planszy), puste pole = „Przygotuj zapytanie”;
- handel i noclegi — szkic tekstów do akceptacji szefa; kontakt to formularz v20.

**K3/K3.1:** sekcja **„Gotowe zestawy”** (zestawy, których `branze` zawiera branżę, maks. 6, tylko `gotowe`) nad polecanymi produktami — K3c. Telefon: `k31/screens/App-Branza-390` (ten sam szablon dla handlu i noclegów). Kierunek z `AUDYT-PRODUKCJA.md` §7 — branża złożona z istniejących klocków (scena planu + zestawy + produkty z tagiem branży + FAQ) — do rozważenia po K31d, bez nowej sesji w tym etapie. Branże K3 mają dłuższe slugi (`biura-uslugi`, `szkoly-instytucje`, `zdrowie-uzdrowiska`, `magazyn-produkcja`) — import mapuje je na istniejące rekordy, adresy stron branż się nie zmieniają (`K3-KATALOG.md` §3).

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

Wdrożenie B10c (decyzje Krystiana 24.10.2026):
- krok 4 jak na planszy: Imię \*, Telefon \*, Miejscowość, „Na kiedy?” i zgoda (bez e-maila); zgłoszenie typu `wizard`;
- zestaw liczy serwer z reguł `BiznesSettings.wizard` i odpowiedzi (przeglądarka wysyła tylko odpowiedzi); produkty trafiają do zgłoszenia jako pozycje z ilościami, odpowiedzi — jako podsumowanie po polsku;
- propozycje w regułach to adresy produktów katalogu; produkt nieopublikowany = sama potrzeba, bez zdjęcia;
- „Dodaj zestaw do listy zapytania” już w etapie 1 (po 1 sztuce każdej pozycji);
- plakietki tylko ze źródłem przy fakcie (700 zł: art. 111 ust. 4 ustawy o VAT); „Terminal 0 zł” do czasu warunków programu pominięta, KSeF bez daty;
- zwykły nagłówek i stopka strony; `noindex` jak `/zapytanie`.

**K3/K3.1 — wynik kreatora = gotowy zestaw** (źródło: `K3-KATALOG.md` §9, `AUDYT-PRODUKCJA.md` §7, `MOBILE-APLIKACJA.md` §3):
- K3c: na ekranie wyniku pasujące gotowe zestawy (mapa rodzaj firmy → seria zestawów z `K3-KATALOG.md` §9); kreator dalej wysyła swoje zgłoszenie `wizard`;
- PROD: **wynik = zestaw z bazy** (rodzaj firmy + skala → zestaw; warsztat i produkcja → scena planu + rozmowa) zamiast osobnej listy reguł „co zwykle ustawiamy” — jedna lista do utrzymania; „W cenie zestawu” zmienia nazwę (zasady treści, §1);
- telefon (M1): jedno pytanie na ekran, „Krok X z 3”, przyklejone „Wstecz / Dalej”, wynik z „Zapytaj o ten zestaw” (`App-Kreator-390`, `App-Kreator-wynik-390`). Liczba kroków na telefonie wg wzorca — PROD/M1 porównuje z obecnymi 4 krokami i zgłasza różnicę, zanim ją wprowadzi.

### 6.9 O firmie, Aktualności, Wpis, Kontakt
**O firmie 2.0 i Kontakt 2.0** (źródło: `K31-ZMIANY.md` §13.4; sesja K31e — część 2a, przy dużym zakresie osobna K31f; wzorzec `k31/screens/Web-OFirmie-1440`, `Web-Kontakt-1440`, `App-OFirmie-390`, `App-Kontakt-390`; dane: `seed/prokombiznes/k31/firma-k31.json`). Plansze v20 `OFirmie` i `Kontakt` = historia.
- **O firmie:** hero (pigułka „PRO-KOM Tadeusz Wójciak · Rabka-Zdrój, od 2004”, H1 z latami liczonymi od 2004, scena produktów + 3 plakietki) → pas 4 liczb → 8 zasad → Rodzina PRO-KOM (4 linie, Biznes „jesteś tutaj”) → autoryzacje i partnerzy (3 wiersze; tylko marki z katalogu, statusy z `Partners` [SZEF]) → „Gdzie nas znaleźć” + mapa dojazdu → pas CTA.
- **Kontakt:** hero z kartą adresu i godzin („Wyznacz trasę”) i 4 kafle (889 003 889, WhatsApp, 18 267 65 11, biznes@pro-kom.eu) → „Z czym dzwonisz?” (awaria / nowa firma → kreator / przegląd kasy → formularz) → formularz z **tematami jako chipy** (imię, telefon, firma i miejscowość, wiadomość, informacja RODO; „Wyślij · N tematy”), zapis jak zapytanie (ADR-003; status — PROD) → dojazd z mapą, godziny, dane firmy, NIP → FAQ + karta „Masz listę pozycji z katalogu?”.
  - Chipy tematów to zmiana względem formularza v20 „bez tematów” (§8.4) — dotyczy tylko `/kontakt` 2.0; formularz na głównej zostaje bez tematów, dopóki wzorzec `Main-1440` go nie zmienia. Pole `tematy` jest w modelu `Inquiries`.
- **Mapa dojazdu `<ServiceAreaMap>`:** SVG 640 × 420, Rabka w środku, 9 miejscowości z liniami, etykiety jako HTML w procentach (nie `<text>`), „Dojeżdżamy na całe Podhale i Małopolskę” + „Wyznacz trasę”; wspólna dla O firmie i Kontaktu (zastępuje `AreaMap` z B11c, jeśli wzorzec się różni). Bez iframe Google.
- Tylko adres w Rabce, jeden e-mail biznes@, bez „oddzwonimy w 60 minut”, bez cytatów niezatwierdzonych przez szefa (§1). Dane firmy z `CompanyData` + `SiteSettings` (ADR-012 „Rozstrzygnięcia K3 i K3.1” pkt 3).
- Strony zostają stronami `Pages` z blokami Biznesu (bloki 2.0 albo nowe warianty istniejących `bzPageHero`, `bzLocation`, `bzContactInfo`).
- Telefon: `App-Kontakt-390` = kontakt + dojazd + skrót O firmie + FAQ; `App-Aktualnosci-390`, `App-Wpis-390` dla aktualności i wpisu (M1).

**Etap 1 (B8c, B11a, B11c):**
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

### 6.10 Gotowe zestawy `/zestawy`, `/zestawy/[slug]` (źródło: `K3-KATALOG.md` §7, §9; sesja K3c)
Wzorzec: `k3/screens/Web-Zestawy-*`, `Web-Zestaw-*` (Kawiarnia), telefon `k31/screens/App-Zestawy-390`, `App-Zestaw-390`. Dane: `seed/prokombiznes/k3/zestawy.json` (23 zestawy) → kolekcja `Bundles` (per tenant, ADR-012).
- **`/zestawy`:** lista z filtrem po **obszarze** — 8 jak wzorzec `Web-Zestawy-1440` (decyzja Krystiana 28.10, K3c): Sklep, Gastronomia, Noclegi, Biuro i usługi (z kopiami zapasowymi), Gabinet, Szkoła, Sieć i Wi-Fi, Ekrany; obszar ustawia import z `seria` (`Bundles.area`, edytowalny w panelu), kolejność z danych. Wejścia: mega menu „Gotowe zestawy”, strony branż, plan, kreator.
- **`/zestawy/[slug]`:** nagłówek (dla kogo, korzyść), opis; **elementy** (zdjęcie i nazwa karty, rola, ilość, „sugerowana wersja”, „opcjonalnie”); „Możesz zamienić” (X → Y, kiedy); „Co robimy przy wdrożeniu” (karty usług, bez `do-akceptacji-szefa`); „Dlaczego taki zestaw”; FAQ; „Zobacz też”.
- **„Zapytaj o ten zestaw · N poz.”** dodaje wszystkie elementy obowiązkowe + zaznaczone opcjonalne (checkboxy, domyślnie odznaczone) z uwagą pozycji „Zestaw: {nazwa}; wersja: {wariant_sugerowany}”. Zero cen i sum. Ilość elementu bywa opisem („wg stanowisk”, „1–2”) — wtedy pozycja ma ilość 1, a uwaga dopisek „ilość: {opis}” (K3c). Element już na liście zachowuje ilość i dostaje uwagę tylko, gdy jej nie miał. „Zobacz też” (`powiazane`) to kategorie katalogu.
- **Status zestawu:** import ustawia `gotowe`, gdy żaden element nie ma `do_potwierdzenia`, inaczej `do-sprawdzenia` (widoczny, `noindex`, poza sitemap); Krystian zmienia status w panelu po sprawdzeniu listy zgodności. Pod planem i na stronach branż tylko `gotowe`.
- Element z kartą ukrytą/usuniętą znika, zestaw dostaje ostrzeżenie w panelu; zestaw bez elementu obowiązkowego — ukryty.
- JSON-LD `ItemList` (bez `offers`) + `FAQPage` (tylko `gotowe`); sitemap bez `do-sprawdzenia`.
- „W zestawach” na stronie produktu (§6.2) i „Gotowe zestawy” na stronie branży (§6.7).

### 6.11 Strony marek i salony `/marki/[slug]` (źródło: `K3-KATALOG.md` §6, `K31-ZMIANY.md` §5; sesje K3b′ i K31c)
- **Szablon marki (K3b′; wzorzec `k3/screens/Web-Marka-*`):** strona tylko dla marek z `strona_marki = true` (31); H1 „{marka} w PRO-KOM”, logo, `opis_krotki`, opis, „Fakty” (tabela ze źródłem przy wierszu), „Linie produktów”, siatka kart marki (filtr po kategorii przy ≥ 2 kategoriach), „Strona producenta” (`rel="noopener"`). Ingenico bez strony (akapit na stronie PolCard), PRO-KOM bez strony i poza licznikami marek. Brak logo → logo z `k3/media/marki/` albo nazwa tekstem.
- Linki do strony marki: logo na karcie produktu, filtr marki w katalogu („Zobacz markę”), pasek marek na głównej (logo → strona marki zamiast filtra).
- SEO: title „{marka} — {opis_krotki do 60 zn.} | PRO-KOM Biznes”, JSON-LD `Brand` + `BreadcrumbList`, sitemap.
- **Salon marki (K31c; Lenovo, Dell; wzorzec `k31/screens/Web-Marka-1440`, `Web-Marka-Dell-1440`, `App-Marka-390`, `App-Marka-Dell-390`):** włącza się, gdy marka ma dane salonu. Ciemne hero (liczniki z odmianą, kolaż 3 zdjęć na studio) → działy z licznikami → karty serii (klasa, dla kogo, liczba; klik filtruje siatkę, ponowny zdejmuje filtr) → siatka produktów → porównanie serii → **dobór w 3 pytaniach** (`#dobor`; reguły z danych, pierwsza pasująca, ostatnia domyślna → seria + 2 produkty, „to podpowiedź”) → film serii → usługi → pas CTA. Działy i serie wyłącznie z danych (Dell: Akcesoria, Dell Plus; `K31-ZMIANY.md` §5 pkt 2); seria bez zdjęcia → ikona działu.
- Dane marek w kolekcji `Partners` (marki = partnerzy od S7a), nie w nowej kolekcji `Brands` z paczki (ADR-012 „Rozstrzygnięcia K3 i K3.1” pkt 2).

### 6.12 Plan Twojej firmy 2.0 `/plan-firmy` i sekcja na głównej (źródło: `K31-ZMIANY.md` §6–7; sesja K31d — zastępuje B7b z K3 i plan z B7c)
Wzorzec: `k31/screens/Web-Plan-1440`, `Web-Plan-punkt-1440`, `Web-Plan-bilety-1440`, `Main-1440` (sekcja planu), telefon `App-Plan-390`, `App-Plan-punkt-390`, `App-Plan-apteka-390`. Dane: `seed/prokombiznes/k31/plansze-k31.json` (12 scen, 186 punktów) + `plansze-svg/*.svg` + `fp.css` → kolekcja `FloorPlans` (per tenant, ADR-012). `plansze-k3.json` (8 scen) jest zastąpiony.
- **Jeden komponent** na `/plan-firmy` i na stronie głównej (tam bez okruszków i własnego nagłówka/stopki).
- Wybór sceny: siatka 6 × 2 kafli (ikona, nazwa, liczba punktów); telefon: przyklejone chipy.
- **Rzut:** SVG inline z pliku (style `fp.css` przepisane na tokeny i tryb ciemny), ładowany tylko dla aktywnej sceny; punkty = kółka ze zdjęciem produktu i numerem, podpis po najechaniu, aktywny powiększony z pulsem (bez pulsu przy `prefers-reduced-motion`).
- Obok rzutu lista „Na tym planie” (numer, miniatura studio, etykieta, opis, znaczek „film”).
- **Klik w urządzenie → popup** (modal, maks. 1240 px): pasek „rola · 3 z 19 · ‹ › ×”; po lewej film (fasada; brak filmu → zdjęcie na studio), po prawej marka, nazwa, korzyść, 3 cechy, 4 parametry, „Dodaj do zapytania” (uwaga pozycji „Plan: <scena>”), „Zobacz produkt”, „Następne na planie”. Zamknięcie ×, tłem, Esc; ←/→; focus trap z powrotem do punktu; zmiana urządzenia zatrzymuje film.
- **Telefon:** rzut 720 px w poziomym przewijaniu wewnątrz sekcji, lista pod spodem, punkt → arkusz od dołu (film na górze, szczegóły pod nim, ‹ ›).
- Pod planem: „Dodaj cały plan do zapytania · N poz.” + „Gotowe zestawy: <scena>” (tylko `gotowe`).
- Punkt z kartą ukrytą/usuniętą znika automatycznie; punkty edytowalne w panelu, import idempotentny. Opisy z katalogu, bez `PINFO` z planszy v20.

### 6.13 Filmy producentów (źródło: `K31-ZMIANY.md` §7; ADR-016)
- Tylko z `seed/prokombiznes/k31/wideo-k31.json` (oficjalne kanały producentów) i z panelu; `Products.videos[]` {`youtube_id`, `title`, `channel`, `lang`, `match`: model|seria|marka, `active`}; filmy serii w danych salonu, filmy stron GoPOS/InsERT w ich blokach.
- **Fasada:** plakat (zdjęcie produktu na ciemnym tle, tytuł, kanał, język, ▶); iframe `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&playsinline=1` dopiero po kliknięciu. **Zero żądań do YouTube przed kliknięciem** (test sieci w e2e).
- Brak aktywnego filmu = sekcja się nie renderuje.
- Raz w tygodniu sprawdzanie oEmbed każdego filmu; niedostępny → `active = false` + mail do administratora (zadanie Payload, ADR-011; ADR-016).
- Polityka cookies: akapit o YouTube (odtwarzanie dopiero po kliknięciu, tryb youtube-nocookie) — **szkic do akceptacji szefa/prawnika**; trafia do treści strony `/cookies` (seed `src/seed/biznes/legal.ts` i panel) w sesji K31b, razem z pierwszym filmem. Szkic:
  > Na stronach produktów i w Planie Twojej firmy możesz obejrzeć filmy producentów z serwisu YouTube. Film ładuje się dopiero, gdy klikniesz przycisk odtwarzania — wcześniej strona nie łączy się z YouTube. Używamy trybu youtube-nocookie.com, w którym YouTube według swoich zasad nie zapisuje plików cookie przed odtworzeniem filmu; po kliknięciu obowiązują zasady Google (link do polityki prywatności Google). TODO(krystian): akceptacja szefa/prawnika.

## 7. Treści

- **Teksty:** z plansz (uzgodnione). Przy przenoszeniu nie poprawiaj stylu; zmieniasz tylko punkty **[SZEF]**.
- **Katalog:** `seed/prokombiznes/katalog.json`:
  - **katalog v2 (22.10.2026):** 225 pozycji (212 produktów + 13 usług), 32 marki (31 z produktami; liczby na stronie zawsze z bazy), 23 kategorie (nowe: „Wagi sklepowe”, „Skanery, kolektory i etykiety”; „Akcesoria POS” bez wag; „Automaty vendingowe” z 1 produktem), 5 grup, 7 branż (w tym „Beauty i usługi”, nieaktywna);
  - podkategorie (chipy) w `akc` i `kody`; warianty na jednej karcie; linki do stron i kart PDF producenta (`sources`);
  - opisy pozycji z partii 1 i 2 są tymczasowe (z arkusza, `contentStatus` „Do sprawdzenia”); docelowe opisy i parametry przychodzą partiami z czatu „Treści · katalog Biznes”;
  - parametry tylko ze strony producenta (link w `sources`), z datą sprawdzenia; bez źródła pole puste;
  - zmiany i decyzje o asortymencie: `docs/design/prokombiznes/ZMIANY-katalog-v2.md`; model: ADR-012 rozstrzygnięcie 12.
  - **od K3 (25.10.2026) katalog v2 jest zastąpiony** przez `seed/prokombiznes/k3/` i `seed/prokombiznes/k31/` (§5, `K3-KATALOG.md`, `K31-ZMIANY.md`): treści kart przychodzą z importu (`pnpm seed:biznes`), poprawki w panelu — nigdy w kodzie; dane, które wyglądają źle, sesja zgłasza w raporcie zamiast poprawiać na sztywno. K2 (`tresci-k2*.json`) nie był importowany — pomijamy go w całości.
  - **Nie trafiają do repo:** `WEWNETRZNE-ceny-orientacyjne-k3.json` i arkusze `K3-przeglad.xlsx`, `K31-przeglad.xlsx` (u Krystiana; `.gitignore` ma wzorzec `*WEWNETRZNE*`).
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
- **K3/K3.1:** notatki z konfiguratora („Wersja: …”), zestawu („Zestaw: …”), planu („Plan: …”), pakietu GoPOS i InsPunktów zapisują się w `uwaga` pozycji — ten sam kanał co uwaga wpisana ręcznie; dodanie pozycji, która już jest na liście, dopisuje notatkę zamiast ją nadpisać (reguła do ustalenia w K31b z testem). Akcja „dodaj wiele” (zestaw, plan, pakiet) — jak „Dodaj wszystko”.

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
  - tylko w nazwie grupy (dokładnie, przez synonim albo z literówką) = 0,05 — także przy popularności 100 niżej niż jakiekolwiek trafienie w sam produkt (B4c, 24.10.2026: „kasa” nie może stawiać skanerów z grupy „Kasy i sprzedaż” na równi z kasami);
  - dodatkowo `popularnosc/200`.
- **Kategorie w wynikach (nakładka):** najpierw te, których nazwa trafia więcej tokenów frazy (te same reguły: dokładnie, synonim, literówka), potem te z większą liczbą trafień; przy remisie kolejność katalogu. Przykład: „kasa” → Kasy fiskalne przed Skanerami, kolektorami i etykietami.
- **Literówki:** Damerau-Levenshtein, i to zarówno na całym słowie, jak i na prefiksie tej samej długości.
  - Dla tokenów 4–6 znaków limit 1, dla 7+ znaków limit 2.
  - Przykład: „kasa fiskalan” → kasy fiskalne.
- Odmiana licznika: 1 wynik / 2–4 wyniki / 5+ wyników (z wyjątkiem 12–14).
- Implementacja referencyjna: `boards/Main.dc.html`, szukaj `__pk17`. Przepisz do TS jako `lib/search.ts` z testami jednostkowymi na przykładach z §9.
- **K3/K3.1** (źródło: `K3-KATALOG.md` §9, `K31-ZMIANY.md` §13.5; sesja K3b′, zestawy — K3c): indeks obejmuje widoczne karty + zestawy (`gotowe` i `do-sprawdzenia`) + marki ze stroną; kody modeli z kart wielomodelowych w `Products.aliases` (np. „U2724D”, „C301i” znajdują właściwą kartę); limit indeksu **< 50 KB gzip** (przy przekroczeniu `korzysc` skrócona do 80 znaków, parametry poza indeksem); pola wewnętrzne nigdy w indeksie. Kryterium K3b′: „laptop” daje laptopy.

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
- **Kreator** (B10c, §6.8): Imię \*, Telefon \*, Miejscowość, „Na kiedy?”, opcjonalna wiadomość i zgoda; zestaw liczy serwer z reguł (ADR-003, uzupełnienie B10c).
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

**Dodatkowo od K3/K3.1** (kryteria sesji: `docs/zadania/prokombiznes.md` §6):
10. Strony porównane ze zrzutami `k31/screens/` (a gdzie K3.1 nic nie zmienia — `k3/screens/`, potem `screens/` v20) przy 1440 i 390 px, w obu motywach.
11. Telefon wg `MOBILE-APLIKACJA.md` §4 na każdej zmienionej trasie: 0 poziomego przewijania przy 360/390/414 px, cele ≥ 44 px, zrzut 390 zgodny z `App-*`.
12. Test „zero cen” i lista zakazanych marek (§1) na seedzie i wyrenderowanych stronach (katalog, produkt, marki, zestawy, plan).
13. Brak żądań do youtube.com / youtube-nocookie.com przed kliknięciem „▶”; 0 pustych `<img>` w serwisie.
14. Import 2× = te same liczby (raport `seed:biznes`); każdy stary adres z `usuniete.json` i z podziału kart → 301.

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

**Etap 1 zbudowany 25.10.2026 (B0–B11). Przed produkcją dochodzi etap K3/K3.1** (ścieżka skrócona z `START-TUTAJ.md` §3; plan sesji: `docs/zadania/prokombiznes.md` §6):
1. ~~W — wgranie paczek K3 i K3.1~~ (#110) · ~~KD — dokumenty~~ (ten PR);
2. F1 — poprawki po audycie B11 (**TODO(krystian): status nieustalony**, `AUDYT-B11.md` nie ma w repo);
3. K3a — model i import K3, 301, ukrycie usuniętych;
4. K31a — import K3.1 (karty, serie, filmy, salony, strony GoPOS/InsERT, plany, podział kart, uzupełnienia treści);
5. K31b — produkt 2.0, tło studio, stopka;
6. K3b′ — strony marek, kategorie z podkategoriami, wyszukiwarka (bez strony produktu);
7. K31c — salony Lenovo i Dell, kategoria z seriami;
8. K3c — gotowe zestawy;
9. K31d — Plan Twojej firmy 2.0 (+ sekcja na głównej);
10. K31e — GoPOS i InsERT 2.0, O firmie i Kontakt 2.0 (przy dużym zakresie O firmie/Kontakt jako K31f);
11. M1 — telefon jak aplikacja;
12. PROD — gotowość produkcyjna (`AUDYT-PRODUKCJA.md` §9, bez tego, co już zrobione w B11b i S8);
13. staging → akceptacja szefa → produkcja.

**Kolejność cięcia przy braku czasu** (`AUDYT-PRODUKCJA.md` §10 — tniemy od końca, nie jakość): najpierw K31c (do czasu salonu — szablon marki K3), potem K31e (GoPOS/InsERT, O firmie i Kontakt zostają w wersji etapu 1), potem kreator i branże poza gastronomią. **Bez cięć:** katalog, produkt 2.0, zapytanie, zestawy, Plan 2.0, telefon, strony prawne, analityka, obsługa zapytań.

Z listy etapu 2 przechodzą do K3/K3.1: pełny interaktywny plan firmy (K31d), kreator z zestawem (K3c/PROD). Zostają w etapie 2: porównywarka kas, filtry po parametrach, kolejne branże, powiadomienia o wpisach, `/realizacje`.

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
- **K3 i K3.1 (25.10.2026)** — paczki `K3-KATALOG.md` i `K31-ZMIANY.md` (wizualizacja v126), wniesione w KD (26.10.2026; decyzje Krystiana 26.10: adresy `/oferta/…`, model per tenant, osobny ADR-016 dla filmów, akapit cookies o YouTube w K31b):
  - katalog 243 + 26 kart z pełną treścią, 79 kart usuniętych (301), podkategorie z adresem w 3 kategoriach, 31 marek ze stroną (§5, §6.1);
  - produkt 2.0 zamiast strony z B6 (§6.2); tło studio zamiast siatek (§3.8); stopka K3.1 (§3.4);
  - nowe: gotowe zestawy (§6.10), strony marek i salony Lenovo/Dell (§6.11), Plan Twojej firmy 2.0 na `/plan-firmy` i na głównej — zastępuje plan z B7c i B7b z K3 (§6.12), filmy producentów (§6.13);
  - GoPOS i InsERT 2.0 (§6.5, §6.6), O firmie i Kontakt 2.0 (§6.9), wynik kreatora = gotowy zestaw (§6.8);
  - telefon jak aplikacja zamiast menu pełnoekranowego i paska Zadzwoń/WhatsApp/Zapytanie (§3.3, `MOBILE-APLIKACJA.md`);
  - zasady treści: bez „0 zł”, „gratis”, „w cenie”, tylko Rabka, jeden e-mail biznes@, bez obietnic czasu do decyzji szefa (§1);
  - plansze v20 `OFirmie`, `Kontakt`, `Gopos`, `Insert`, `Mobile`, `Mapa` oraz plan w `Main` (8 scen, `FPS`/`PINFO`) = historia; `ZMIANY-katalog-v2.md` — zastąpione (dopisek w pliku).

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

**Dochodzą z K3/K3.1** (pełne listy: `AUDYT-PRODUKCJA.md` §11, `K31-ZMIANY.md` §12, `PRZEKAZANIE-K3.md` §6; arkusze `K3-przeglad.xlsx`, `K31-przeglad.xlsx` u Krystiana):
13. Kolejność Biznes vs PRO-KOM Gaming do 20.11 (od niej termin produkcji Biznesu).
14. Usługi `do-akceptacji-szefa` (Opieka informatyczna z pakietami, Bezpłatny przegląd IT, Kopie zapasowe) — publikujemy czy nie; zakres opieki IT.
15. Cytat właściciela — akceptacja tekstu albo sekcja bez cytatu.
16. Zgoda na 2–3 realizacje i prośba do klientów o opinie Google.
17. Polityka prywatności (projekt z B11b) i akapit cookies o YouTube (§6.13) — akceptacja; okres przechowywania zapytań.
18. Proces obsługi zapytań: kto odbiera powiadomienie, kto oddzwania, statusy (`AUDYT-PRODUKCJA.md` §5.3) — warunek obietnicy „60 minut”.
19. Plakietki „ulga do 700 zł” i terminal z Polskiej Bezgotówkowej — aktualność programów w dniu publikacji.
20. Krystian (nie szef): 16 kart `do-sprawdzenia` (10 z K3, 6 z K3.1), 20 zestawów do potwierdzenia listy zgodności, zdjęcia 2 kart (ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2), filmy dla pozycji bez filmu, logo APC/TP-Link/Adobe.
