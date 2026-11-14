# Specyfikacja — nowa pro-kom.eu (hub całej firmy)

Wersja 1.0 · 14.11.2026 · kod huba: `src/sites/prokom/`, `src/lib/prokom/`, tenant `prokom` · wizualizacja: https://claude.ai/artifact/JPYzSjm9XgMNgasPjm8BHx (plansze 01–17 + „Telefon/Tablet na żywo”)
Decyzje: `docs/decyzje/ADR-H001-hub-pro-kom-eu.md`, `ADR-H002-model-tresci-huba.md` · Plan i prompty: `docs/zadania/prokomeu.md` · Wzorzec: `docs/design/prokomeu/` · Dane: `seed/prokomeu/`

**Kolejność ważności przy sprzecznościach:** decyzje szefa w `docs/STAN.md` → ten dokument → plansze (`docs/design/prokomeu/plansze/*.dc.html`) → seed. Tekst na planszy wygrywa nad seedem (seed poprawiamy). Wspólne komponenty (ADR-022) wygrywają nad planszą w sprawach technicznych (API, dostępność), plansza wygrywa w wyglądzie.

---

## 1. Cel i miary sukcesu
pro-kom.eu jest wejściem do całej firmy. Ma w 10 sekund odpowiedzieć „czy to tutaj?” i skierować klienta do właściwej linii: telefon, narzędzie online albo strona linii. Nie sprzedaje produktów sama.

Miary (Umami, od startu): odsetek wejść kończących się kliknięciem telefonu, formularzem albo przejściem na stronę linii (cel: > 35% sesji); wyszukiwania bez wyniku (< 10%); formularze z hubu na tydzień; listy zapytania z „Inwestycje i dostawy”.

## 2. Zakres
### 2.1 Wersja 1 (produkcja do 20.12.2026)
Powłoka (nagłówek, mega menu, szyna, arkusz menu, dolny pasek, stopka, wyszukiwarka) · `/` · `/linie` · `/dla-firm` · `/inwestycje-i-dostawy` · `/kontakt` · `/o-firmie` · `/szukaj` · `/polityka-prywatnosci` · `/cookies` · `/dostepnosc` · 404 · SEO techniczne · przekierowania 301 ze starej pro-kom.eu · formularze → `Inquiries` + maile · telefon jak aplikacja.

### 2.2 Wersja 1 — jeśli czas pozwoli (w tej kolejności), inaczej v1.1 zaraz po starcie
`/zalatw-online` → `/dla-domu` → `/wspolpraca` → `/pomoc` + `/pomoc/[slug]` → `/partnerzy` → `/gdzie-dzialamy` → `/aktualnosci` (agregacja) → `/mapa-strony`.
Do czasu zbudowania: linki w menu i stopce do tych stron są ukryte (flaga w `HubSettings`), a sekcje strony głównej linkują do najbliższej istniejącej strony albo do strony linii. **Żadnych martwych linków.**

### 2.3 Poza zakresem
Realizacje (brak materiałów i zgód — wrócą osobnym zadaniem), Strefa Klienta (nie pokazujemy na razie), kariera (`/kariera` → 301 na `/o-firmie`), zdjęcia ludzi, ceny, finansowanie (leasing, raty, odroczony termin), WhatsApp.

## 3. Zasady treści (test literałów w CI)
- **Bez cen**, bez „gratis”, „w cenie”, leasingu, rat, odroczonego terminu, WhatsAppa, zdjęć ludzi.
- **Obietnice tylko te ustalone:** Biznes — oddzwonimy w 60 minut w godzinach pracy; Instalacje — odpowiedź w 24 h w dni robocze (nie przyjazd technika), 24 miesiące gwarancji na wykonany montaż; Software — odpowiedź w 1 dzień roboczy; Tech — bezpłatna diagnoza i wycena, naprawy też kurierem.
- **Konfiguracja, montaż i szkolenie przy dostawach nie są standardem** — zawsze „na życzenie / jeśli tak ustalimy / zakres w ofercie”. RTV i AGD tylko dla firm i instytucji, dostawa pod adres, **bez montażu**.
- Liczby firmy: od 2004, 100+ klientów firmowych, autoryzowany serwis Posnet i Elzab, autoryzowany partner InsERT i GoPOS (COMEX — współpraca, Optivendi — partner). Nic ponad to bez zatwierdzenia (`HubSettings.trust[].approved`).
- Telefony, e-maile, godziny, adresy tylko z `CompanyData`. Test `src/sites/prokom/literaly.test.ts`: w `src/sites/prokom/**` i `src/lib/prokom/**` nie ma numerów telefonów, adresów e-mail, „zł”, „WhatsApp”, „leasing”, „rat”, „gratis”, „w cenie” poza plikami seed i testów.
- Język: zwykły, konkretny, bez żargonu; zdania krótkie. Tytuły bez kropki na końcu tylko tam, gdzie tak jest na planszy.

## 4. Adresy, tytuły i nagłówki (SEO)
Źródło: plansza 14 (`MapaStrony.dc.html`) i `seed/prokomeu/strony/MapaStrony.json`.

| Adres | Strona | `<title>` | H1 | Indeks |
|---|---|---|---|---|
| `/` | Strona główna | PRO-KOM Rabka-Zdrój — IT dla firm, instalacje, serwis | PRO-KOM | tak |
| `/linie` | Cała oferta | Linie PRO-KOM — co gdzie załatwisz | Co gdzie załatwisz. | tak |
| `/dla-firm` | Dla firm | Dla firm: kasy, IT, sieć, kamery, strona \| PRO-KOM | Wszystko dla Twojej firmy w jednej firmie | tak |
| `/dla-domu` | Dla domu | Dla domu: smart home, alarm, serwis, gaming \| PRO-KOM | Wszystko dla domu w jednej firmie | tak |
| `/inwestycje-i-dostawy` | Inwestycje i dostawy | Większe dostawy IT, RTV i AGD dla firm i instytucji \| PRO-KOM | Większe zamówienie albo cały obiekt? | tak |
| `/wspolpraca` | Współpraca | Współpraca: architekci, deweloperzy, instytucje \| PRO-KOM | Projektujesz, budujesz albo zamawiasz? Zróbmy to razem. | tak |
| `/zalatw-online` | Załatw online | Załatw online — zgłoszenia, wyceny, status \| PRO-KOM | Załatw to od razu. Bez dzwonienia. | tak |
| `/pomoc` | Pomoc | Pomoc — co zrobić, gdy coś nie działa \| PRO-KOM | Co zrobić, gdy… | tak |
| `/pomoc/[slug]` | Jedna sytuacja | `{tytuł} — co zrobić \| Pomoc PRO-KOM` | `{tytuł} — co zrobić` | tak |
| `/o-firmie` | O firmie | O firmie PRO-KOM — Rabka-Zdrój, od 2004 roku | Firma z Rabki, która robi technikę od początku do końca. | tak |
| `/partnerzy` | Marki i autoryzacje | Partnerzy i autoryzacje PRO-KOM — Posnet, Elzab, InsERT | Partnerzy i autoryzacje | tak |
| `/gdzie-dzialamy` | Gdzie działamy | Gdzie działamy — Podhale, Małopolska, cała Polska | Gdzie działamy | tak |
| `/kontakt` | Kontakt | Kontakt PRO-KOM — Rabka-Zdrój, ul. Orkana 16B | Jeden numer. Pokierujemy, gdzie trzeba. | tak |
| `/aktualnosci` | Aktualności | Aktualności PRO-KOM — nowości ze wszystkich linii | Co nowego w liniach | tak |
| `/szukaj` | Wyniki | Szukaj w PRO-KOM | Szukasz: „…” | **noindex** |
| `/polityka-prywatnosci`, `/cookies`, `/dostepnosc` | Prawne | wg planszy 13 | — | noindex do akceptacji prawnika, potem tak |
| `/mapa-strony` | Mapa strony | Mapa strony \| PRO-KOM | Wszystko, co jest na pro-kom.eu. | tak |

- Meta description: z kolumny „opis” planszy 14, 140–160 znaków; edytowalne w panelu (wtyczka SEO).
- `canonical` na każdej stronie; `www.pro-kom.eu` → 301 na `pro-kom.eu`; ukośnik końcowy wg konwencji repo.
- JSON-LD: `Organization` (logo, `sameAs` = domeny linii) na `/`; `LocalBusiness` dla salonu w Rabce (adres, godziny z `CompanyData`, `geo`) na `/kontakt` i `/o-firmie`; `BreadcrumbList` na podstronach; `FAQPage` tylko tam, gdzie pytania i odpowiedzi są widoczne na stronie. Bez ocen i opinii w schemacie (nie mamy prawdziwych).
- `sitemap.xml` tylko stron indeksowanych i opublikowanych; `robots.txt` z adresem sitemap; strony v1.1 niewidoczne → poza sitemap.
- **Przekierowania 301** (plansza 14, sekcja „Żaden adres, który zna Google, nie zniknie”): przykłady `/uslugi/montaz-instalacje/monitoring` → prokominstalacje.pl (usługa), `/produkt/reseller/kasy-fiskalne` → prokombiznes.pl (kategoria), `/uslugi/serwis` → prokomserwis.pl, `/tworzenie-stron-internetowych` → prokomsoftware.pl, `/firma` → `/o-firmie`, `/realizacje` → `/`, `/kariera` → `/o-firmie`. **Pełna lista z repo i sitemap obecnej pro-kom.eu** (zadanie H6) — każdy adres z ruchem w Google musi mieć cel.

## 5. Powłoka (wszystkie strony)
Plansze: `Naglowek.dc.html`, `Stopka.dc.html`. Komponenty z ADR-022; hub podaje sloty.

### 5.1 Pasek marki (nad kapsułą, przewija się)
Wspólny `BrandBar` (D2-1a). Lewa: przełącznik linii z `CompanyData.lines` (PRO-KOM · Biznes · Instalacje · Software · Tech · Gaming; Gaming ostatni — `withGamingLast`). Prawa: `OpeningStatus` („Otwarte · do 17:00” / „Zamknięte · pn–pt 9:00–17:00”, święta z `CompanyData.holidays`), Aktualności, Status naprawy (link do prokomserwis.pl), „Firma: 883 200 151” (z `SiteSettings` tenanta `prokom`).

### 5.2 Kapsuła (`SiteHeader`)
Wspólny `SiteHeader` (kapsuła) ze slotami huba. Menu: **Oferta ▾ · Dla firm · Dla domu · Inwestycje i dostawy · Załatw online · Pomoc · O firmie · Kontakt**. Prawa: Szukaj (Ctrl K) · motyw · CTA **„Dobierz w 10 s”** (→ `/#dobierz`).
- 1081–1340 px: chowamy „Pomoc” i „O firmie” (są w stopce i w arkuszu), mniejszy odstęp linków. Test e2e: brak łamania wiersza na 1081, 1180, 1340.
- Pozycje stron v1.1 ukryte flagą, dopóki strony nie istnieją.
- **Mega menu „Oferta”:** 5 kolumn linii (kolor, nazwa, 4–6 usług z ikonami z `HubServices`, link „Wszystko w {linia} ↗”) + kolumna „Zacznij od siebie” (Dla firm, Dla domu, Inwestycje i dostawy, Współpraca, Załatw online) + zielona karta „Dobierz w 10 sekund”. Ikony usług: mapa słów kluczowych → ścieżka SVG (`icOf` w planszy; przenieść jako `src/lib/prokom/icons.ts` z testem, że każda usługa dostaje ikonę inną niż domyślna).

### 5.3 Szyna sekcji (`SiteRail`, ≥ 1400 px, tylko strona główna)
11 pozycji: Start, Linie, Dobierz, Załatw online, Co zrobić, gdy…, Współpraca, Marki, Zasięg, Aktualności, Pytania, Kontakt — numery 01–11, rozwijanie na hover/fokus (52 → 232 px).

### 5.4 Telefon i tablet — „jak aplikacja”
- ≤ 1080 px: kapsuła = znak + Szukaj + przycisk **Menu** (wspólny `MenuSheet` na `BottomSheet`). Arkusz menu od dołu (≥ 761 px: panel z prawej, 440 px): pole szukania, 5 kafli linii (nazwa wersalikami, kolor), linki „Zacznij od siebie” z ikonami (Dla firm, Dla domu, Inwestycje i dostawy, Współpraca, Załatw online, Co zrobić, gdy…, O firmie, Kontakt, Aktualności), przyciski telefonu (firma, Biznes/Instalacje), przełącznik motywu, status godzin.
- < 760 px: **dolny pasek** (wspólny `TabBar`, `shared.tabBar` z centrum „Dobierz”) Start · Oferta (`/linie`) · **Dobierz** (wyróżniony środek) · Załatw · Menu; `safe-area-inset-bottom`; stopka ma odstęp 92 px, żeby pasek niczego nie zasłaniał. Na stronie „Inwestycje i dostawy” pływający pasek listy stoi nad dolnym paskiem.
- Nagłówek chowa się przy przewijaniu w dół i wraca w górę (`useHideOnScroll` z D2-1).
- Cele dotyku ≥ 44 px, brak poziomego przewijania na 360/390/414/820/1024, przewijane rzędy kart bez widocznego paska.

### 5.5 Stopka
Wspólny `SiteFooter` (+ `LinesBand`, `LegalBar`, mini mapa `AddressMap`) z kolumnami z `shared.footerColumns`. Kolumny: PRO-KOM (opis, salon, godziny bez etykiety „Otwarte”), **Cała oferta** (5 linii), Zacznij od siebie (Dla firm, Dla domu, Inwestycje i dostawy, Współpraca, Załatw online, Pomoc), Firma (O firmie, Partnerzy, Gdzie działamy, Kontakt, Aktualności, Mapa strony), prawne (Polityka prywatności, Cookies, Dostępność), pas kolorów linii. Dane z `CompanyData`.

### 5.6 Wyszukiwarka (`SearchDialog` + `/szukaj`)
Wspólny `SearchDialog` + `buildLineProvider` z indeksem huba. Ctrl K / „/” otwiera okno; wyniki na żywo pogrupowane (Linie, Usługi, Załatw online, Pomoc, Strony) z akcjami (Zadzwoń, Przejdź, Napisz). `/szukaj?q=`: filtry po linii z licznikami, karta „najlepsze trafienie”, grupy, pusty stan „Zadzwoń — pokierujemy” + numer firmy, panel boczny (najczęstsze sprawy). Indeks: ADR-H002 §4. Plansza 12, seed `Szukaj.json` (69 pozycji: 49 usług, 20 narzędzi i strony huba).

## 6. Strony

Dla każdej strony: plansza = wygląd i teksty, seed = dane. Kolejność sekcji jak niżej.

### 6.1 `/` — strona główna (plansza 01, `Main.dc.html`, seed `Main.json`)
1. **Hero** (`#start`): kafel PRO-KOM (pasek 5 kolorów linii, kropki, CTA „Dobierz w 10 s” + telefon firmy, chipy podpowiedzi) + 5 kafli linii ze slajdami (3 slajdy na linię, `heroSlides`, autoprzewijanie co 4,2 s, pauza na hover/fokus i gdy karta niewidoczna), winiety, liczby firmy z animacją odliczania (ok. 1,4 s, raz), pasek zaufania (autoryzacje).
2. **Wszystkie linie** (`#linie`): scena linii — 6 zakładek (5 linii + „Razem”), autoprzewijanie co 9 s z pauzą na hover, zatrzymane na stałe po ręcznym wyborze zakładki; dla każdej linii: H2, opis, fakty z ikonami, usługi z ikonami, „Także”, kroki współpracy, 2 narzędzia online; blok „Jeden klient. Kilka linii. Jeden telefon.”
3. **Dobierz** (`#dobierz`): „Wybierz, co jest najbliżej Ciebie.” — 13 person (`HubPlans` typ `persona`), po wyborze plan z punktami pogrupowanymi po liniach + telefon właściwej linii.
4. **Załatw online** (`#narzedzia`): 5 paneli linii po 2 narzędzia (`HubTools.featuredOnHome`), karta „20 spraw” → `/zalatw-online`, licznik narzędzi, obietnice linii.
5. **Co zrobić, gdy…** (`#pomoc`): wybór sytuacji → kroki, „co przygotować”, telefon linii.
6. **Współpraca / inwestycje** (`#wspolpraca`): blok „Projektujesz, budujesz albo zamawiasz więcej?” z przyciskami **Inwestycje i dostawy →** i **Współpraca z pracownią →** + 5 kart (Architekci i projektanci, Deweloperzy i inwestorzy, Wykonawcy, Firmy i instytucje, Dostawcy).
7. **Marki** (`#marki`): 4 karty autoryzacji + grupy marek (Biznes / Instalacje / Tech).
8. **Zasięg** (`#zasieg`): „Na miejscu na Podhalu. Zdalnie w całej Polsce.”
9. **Aktualności** (`#aktualnosci`): 3 zajawki (z agregacji; do v1.1 z 3 linii prokom-web; przy braku wpisów sekcja ukryta — nie pokazujemy przykładowych tytułów z planszy).
10. **FAQ** (`#pytania`): „Zanim zadzwonisz”, pierwsza otwarta.
11. **Kontakt** (`#kontakt`): wiersze linii (nazwa, telefon, godziny, obietnica), karta salonu, chipy tematów w kolorach linii → `/kontakt?temat=`.
12. **Finał**: „Powiedz, czego potrzebujesz. Resztą zajmie się właściwy zespół.”

### 6.2 `/linie` — Cała oferta (plansza 02, `Linie.dc.html`, seed `Linie.json`)
Hero z wyszukiwarką oferty → katalog: lista usług (`HubServices`, 49) z filtrami (linia, dla kogo: firma/dom, tekst) i liczbami liczonymi z danych; panel podglądu wybranej usługi (opis, „w zakresie”, kroki linii, telefon, powiązane usługi, CTA `ctaLabel` → `url`). Dla `b11`, `b12` CTA → `/inwestycje-i-dostawy`, dla `i10` → `/wspolpraca` (wyjątki ustawiane przy imporcie seeda — ADR-H002 §3). Sekcje: „Kto czym się zajmuje” (5 linii), „Tak pracują razem”, „Nie wiesz, od czego zacząć?”. Adres usługi w URL (`?u=b11`) — można wysłać link do konkretnej pozycji.

### 6.3 `/dla-firm` (plansza 03, `DlaFirm.dc.html`, seed `DlaFirm.json`)
Hero → **Wybierz branżę** (lista 13 branż z ikonami po lewej, karta planu po prawej: punkty po liniach, „od czego zaczynamy”, pytania na start) → **Obszary** (6 obszarów w 4 zakładkach linii, usługi z ikonami; obszar „Dostawy i instytucje” linkuje do `/inwestycje-i-dostawy`) → **Sytuacje** (kafle z ikonami → przebieg krok po kroku z tagami linii) → Wdrożenie → Opieka → Porównanie „Kilku wykonawców czy jeden?” → Dofinansowania („przygotujemy papiery” — kosztorys i dokumenty, bez finansowania) → Marki → FAQ → formularz (`hub-dla-firm`) → Co dalej → Finał.

### 6.4 `/dla-domu` (plansza 04, `DlaDomu.dc.html`, seed `DlaDomu.json`) — v1 jeśli czas
Hero → Sytuacja (7 sytuacji, np. „Buduję dom”) → scena 3 linii (Instalacje, Tech, Gaming; fakty i usługi z ikonami) → przekrój domu (11 punktów) → tematy instalacji → „Jeden dom. Kilka linii.” → gwarancje 2×2 i salon → FAQ (10) → formularz (`hub-dla-domu`) → Co dalej → Finał (numery linii).

### 6.5 `/inwestycje-i-dostawy` (plansza 17, `Dostawy.dc.html`, seed `Dostawy.json`)
Najważniejsza strona B2B huba (pomysł szefa: większe dostawy IT oraz RTV/AGD dla firm, instytucji, inwestorów, deweloperów). **Związek z Biznesem:** prokombiznes.pl ma już `/agd-rtv-dla-firm` i `/dostawy-it-dla-firm` — w sekcji „Co dostarczamy” i przy grupach listy zapytania dodaj odnośniki „Szczegóły na prokombiznes.pl ↗” do tych podstron; teksty huba zostają własne (bez kopiowania między domenami).
1. **Hero:** H1, trzy „drogi” (Mam listę sprzętu → `#lista`, Mam specyfikację albo SWZ → `#formularz`, Wyposażam obiekt → `#obiekty`), wybór „Dla kogo zamawiasz?” — 6 segmentów (Firma, Instytucja, Hotel i pensjonat, Inwestor, Deweloper, Architekt); wybór zmienia panel (4 punkty, „zaczynamy od”, link) **i formularz** (nagłówek, etykiety, przykładowy opis). Pasek 5 faktów.
2. **Co dostarczamy:** 4 obszary (Sprzęt IT, RTV i AGD dla firm, Instalacje w obiekcie, Programy i strona) z linią, chipami i „Jak dostarczamy” — **zawsze z zastrzeżeniem, że konfiguracja/montaż/szkolenie są według ustaleń**.
3. **Lista zapytania** (`#lista`): 3 grupy (Sprzęt IT, RTV i AGD dla firm, Instalacje) × pozycje z ilością (− / + / +10, max 999); podsumowanie z boku (przyklejone ≥ 1240 px): sztuki, pozycje, wybrane linie, usługi opcjonalne (konfiguracja, montaż i uruchomienie, szkolenie, opieka IT, oferta do przetargu, strona lub panel), termin (4 opcje), nota o RTV/AGD bez montażu (gdy wybrano), „Dołącz listę do zapytania”, „Kopiuj listę do schowka” (tekst listy). Stan listy: w pamięci strony + `sessionStorage` (z `try/catch`), czyszczenie przyciskiem. **Bez cen.**
4. **Wyposażenie obiektu** (`#obiekty`): 9 obiektów (siatka 3×3) — hotel/pensjonat, szkoła/pracownia, biuro, budynek z lokalami, urząd, apartamenty, restauracja, sklep, gabinety — każdy z przykładem („pensjonat, 20 pokoi”), 4 kolumnami po liniach i przyciskiem „Wczytaj przykład do listy” (nadpisuje ilości `preset`, przewija do listy). Dopisek: ilości przykładowe.
5. **Zakres do wyboru:** 3 poziomy (Sama dostawa / Dostawa z przygotowaniem / Pełne wdrożenie — „gdy tak ustalimy w ofercie”) + zakładki „Co możemy dodać” (komputery i laptopy, serwery i sieć, kasy i programy, instalacje, RTV i AGD) po 6 punktów; dopisek „każda usługa jest opcjonalna”.
6. **Proces:** 6 kroków z linią łączącą (desktop).
7. **Marki, które znamy od strony serwisu:** 4 grupy (tylko marki z ustaleń); RTV/AGD bez nazw marek.
8. **Dlaczego jedna firma** (tabela porównania) + **Instytucje i formalności** (6 kafli: oferty w postępowaniach, faktura VAT i protokół, karty katalogowe, gwarancja producenta, warunki na piśmie, spotkanie przed ofertą).
9. **Po dostawie:** 4 kafle serwisu + miejscowości (Rabka-Zdrój i Zakopane z salonem, Nowy Targ, Limanowa, Myślenice, Nowy Sącz, Kraków) + link do zasięgu.
10. **FAQ (7) + formularz** `hub-dostawy`: segment, podsumowanie listy (zmień listę ↑), nazwa firmy/instytucji, NIP (opcjonalnie), imię i nazwisko, telefon lub e-mail, miejsce dostawy, link do specyfikacji/SWZ, opis, zgoda RODO. Wysyłka zapisuje listę, usługi i termin w `Inquiries.payload`.
11. **Pływający pasek listy** (gdy lista niepusta): „Lista: N szt. · M pozycji · linie” + „Wyślij zapytanie →”; < 760 px nad dolnym paskiem. Chowa się, gdy formularz jest widoczny (IntersectionObserver).

### 6.6 `/wspolpraca` (plansza 16, `Wspolpraca.dc.html`, seed `Wspolpraca.json`) — v1 jeśli czas
Architekci, projektanci wnętrz, deweloperzy, wykonawcy, instytucje, dostawcy. Hero z 6 rolami (panel roli + formularz adaptacyjny) → Etapy (5, „co robimy my / czego potrzebujemy od Ciebie”) → Zakres (3 zakładki) + odnośnik do prokominstalacje.pl/dla-architektow → Instytucje i większe dostawy (krótko + link do `/inwestycje-i-dostawy`) → Dostawcy i producenci → Zasady (6; bez obietnicy „opiekuna” do decyzji szefa) → FAQ + formularz `hub-wspolpraca` (pole „link do rzutów”, bez uploadu plików w v1) → Co dalej.

### 6.7 `/zalatw-online` (plansza 05, `Narzedzia.dc.html`, seed `Narzedzia.json`)
Hero → lista 20 narzędzi w 2 kolumnach z filtrami „co chcesz zrobić” (Zgłosić, Sprawdzić, Policzyć i dobrać, Zaplanować, Zapytać) i linii + wyszukiwanie; podgląd wybranego narzędzia (kroki „ścieżki”, co przygotować, co dostajesz, podgląd formularza/kroków, telefon i godziny linii, CTA → `url`); „Na tej stronie też coś załatwisz” (skróty 2×2); „Nie ma tu Twojej sprawy?” (telefony); FAQ; Co dalej. Narzędzia „Wkrótce” bez linku zewnętrznego.

### 6.8 `/pomoc` i `/pomoc/[slug]` (plansza 06, `Pomoc.dc.html`, seed `Pomoc.json`)
Lista sytuacji pogrupowana (26), wybrana sytuacja: kroki, „co przygotować”, telefon linii, powiązane narzędzie; „Najczęstsze w tym tygodniu” (ręcznie wybrane w panelu — nie udajemy statystyk); słownik w 30 s; FAQ; „Napisz, co się dzieje” (formularz `hub-pomoc`); Co dalej. `/pomoc/[slug]` = ta sama treść jako osobna strona z H1 pod frazę i `BreadcrumbList`.

### 6.9 `/o-firmie` (plansza 07, `OFirmie.dc.html`, seed `OFirmie.json`)
Hero → fakty (od 2004, 100+ klientów firmowych, autoryzacje — tylko zatwierdzone) → historia (kamienie milowe — tylko potwierdzone daty, bez `[ROK]`) → 5 linii („Jeden znak. Kolor mówi, która to linia.”) → 6 zasad → 6 kroków współpracy → autoryzacje z linkami do weryfikacji u producentów → salon (Rabka-Zdrój; Zakopane gdy opublikowane) → dane rejestrowe (bez REGON i numeru konta) + FAQ → finał → Co dalej. Szablon `AboutPage` z D2-4.

### 6.10 `/partnerzy` (plansza 08) — v1.1
Autoryzacje (co z nich masz) → zasada „dobieramy pod obiekt, nie pod markę” → ściana marek z opisem „do czego” → serwis i gwarancja → „sprawdź nas u producentów” → FAQ → finał.

### 6.11 `/gdzie-dzialamy` (plansza 09) — v1.1
„Czy do Ciebie dojedziemy?” (sprawdzenie miejscowości → odpowiedź wg stref z `CompanyData`) → tabela „pięć linii, trzy sposoby obsługi” (na miejscu / kurier / zdalnie) → salon → miejscowości → specyfika Podhala → cała Polska (3 linie zdalnie) → FAQ → CTA. Treść stron miejscowości tylko unikalna (bez „doorway pages”).

### 6.12 `/kontakt` (plansza 10, `Kontakt.dc.html`, seed `Kontakt.json`)
Hero → „książka linii” (5 linii: telefon, e-mail, godziny, obietnica; klik = `tel:`) → formularz `hub-kontakt` z wyborem tematu (temat → linia → skrzynka; parametr `?temat=` z chipów strony głównej ustawia wybór) → dojazd i zasięg (mapa z OpenStreetMap jako statyczny SVG/obraz w repo, bez Google w ramce) → „co przygotować” → godziny linii (Tech z sobotą) → dane firmy (CEIDG link, bez numeru konta) + inne sposoby (narzędzia) → FAQ (z parkingiem) → Co dalej. Szablon `ContactPage` z D2-4.

### 6.13 `/aktualnosci` (plansza 11) — v1.1
Filtry po linii, wyróżniony wpis, siatka zajawek (każda prowadzi do wpisu u źródła — na stronie linii), tematy, „poradniki linii”, „nowe wpisy na e-mail” (**tylko gdy szef zatwierdzi newsletter** — domyślnie sekcja wyłączona; obecne formularze mówią „bez newslettera”).

### 6.14 `/szukaj` (plansza 12) — §5.6.

### 6.15 Prawne (plansza 13) i `/mapa-strony` (plansza 14), 404 (plansza 15)
Prawne: administrator danych (PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój), cele, okresy przechowywania, odbiorcy (hosting: VPS webh.pl, Łódź), Umami bez cookies, prawa osób — **projekt do prawnika**, do akceptacji `noindex`. Mapa strony: drzewo stron + linie + przekierowania (z danych, nie ręcznie). 404: komunikat, wyszukiwarka, 5 linii, telefon.

## 7. Formularze i zapytania
Wspólny `ContactForm` (D2-3): walidacja, zgoda wg `consentMode` (checkbox albo klauzula — decyzja prawnika), honeypot + limit prób, komunikaty błędów przy polach, sukces z numerem zgłoszenia i 3 krokami „co dalej” (z obietnicą linii), zdarzenie Umami.

| Formularz | Kategoria | Pola specyficzne | Routing |
|---|---|---|---|
| Kontakt | `hub-kontakt` | temat (lista z `HubSettings.contact`) | temat → linia |
| Dla firm | `hub-dla-firm` | branża (z planu), opis | Biznes, kopia do linii z planu |
| Dla domu | `hub-dla-domu` | sytuacja | Instalacje albo Tech wg sytuacji |
| Pomoc | `hub-pomoc` | sytuacja | linia sytuacji |
| Inwestycje i dostawy | `hub-dostawy` | segment, lista, usługi, termin, NIP, miejsce dostawy, link SWZ | Biznes (IT, RTV/AGD) + Instalacje, gdy w liście są instalacje |
| Współpraca | `hub-wspolpraca` | rola, link do rzutów | rola → linia (architekt/deweloper/wykonawca → Instalacje, instytucja → Biznes, dostawca → biuro) |

Maile (ADR-024): potwierdzenie dla klienta w marce PRO-KOM (zieleń) z obietnicą właściwej linii; powiadomienie dla linii z całym `payload` (lista jako tabela). Limit 3 maili/dobę na adres jak w liniach.

## 8. Wygląd, ruch, motyw
- Tokeny: `docs/design/prokomeu/tokens.css` (`--k-*` kolory, `--r-*` RGB do przezroczystości). Kroje: Archivo (nagłówki, `font-stretch` 112–118%, 800) i Manrope (tekst) przez `next/font`.
- Promienie: karty 16–28 px, przyciski 14–16 px, pigułki 999 px. Kontener max 1560 px, padding `clamp(20px, 3vw, 48px)`.
- **Ruch** (tylko `transform` i `opacity`, 0,3–0,9 s, `cubic-bezier(.2,.8,.2,1)`):
  - pojawianie sekcji przy przewijaniu: CSS `animation-timeline: view()` w `@supports` — bez wsparcia treść po prostu widoczna (bez JS);
  - kaskada dzieci (`.stg`), wejście H1 i leadu w hero;
  - uniesienie kart na hover (−4 px) z ramką w kolorze linii; bez „błysku” (wyłączony w wizualizacji);
  - przełączanie zakładek: płynna zamiana treści (klasy `sa`/`sb`, 0,7 s);
  - autoprzewijanie (slajdy hero, scena linii, podglądy narzędzi): pauza na hover/fokus, gdy karta przeglądarki ukryta (`visibilitychange`) i gdy sekcja poza ekranem;
  - pulsujące kropki statusu, rysowanie linii osi czasu, przyciski „− / +”.
  - `prefers-reduced-motion: reduce` → bez animacji i przejść, autoprzewijanie wyłączone.
- Motyw: domyślnie ciemny; jasny przez `html[data-theme="light"]` (tokeny jasne w `tokens.css`). Oba motywy muszą przejść kontrast AA.

## 9. Wydajność i dostępność (Definition of Done każdej strony)
- Lighthouse (telefon): wydajność ≥ 90, dostępność 100, SEO 100; CLS < 0,05; LCP < 2,5 s na stagingu.
- Server Components domyślnie; interakcje w małych komponentach klienckich; dane z Payload w RSC z `revalidate`.
- Obrazy: SVG/WebP z wymiarami; bez zewnętrznych ramek (mapy, filmy) bez kliknięcia.
- axe: 0 błędów; nawigacja klawiaturą (zakładki, listy wyboru jako `role="tablist"`/`aria-selected`, akordeony `aria-expanded`); fokus widoczny.
- Brak poziomego przewijania 360/390/414/820/1024/1440; porównanie z planszą (desktop 1440, telefon 390) w jasnym i ciemnym motywie — zrzuty w PR.
- Test literałów (§3) zielony; e2e: nawigacja, wyszukiwarka, lista zapytania (dodaj → wczytaj przykład → wyślij), formularz kontaktu z routingiem.

## 10. Otwarte decyzje [SZEF] / [prawnik] — blokują publikację, nie kod
Pełna lista: `docs/strony/prokomeu-pytania.md`.
