# Specyfikacja strony: prokomsoftware.pl

- **Status:** zaakceptowana przez Krystiana jako wizualizacja 18.10.2026, przebudowana po audycie jako **v20 (25.10.2026)**: telefon jak aplikacja, ceny, nowa kolejność strony głównej, sekcja „Dlaczego nie WordPress i PHP”, strony prawne. v20 wniesiona do tej spec., ADR-014/015 i planu w SWD1 — `docs/design/prokomsoftware/ZMIANY-v20.md` to już tylko historia. Ceny, terminy, poziomy opieki i czas odpowiedzi wpisał Krystian 25.10 — przed publikacją akceptacja szefa (§13). Strona idzie na produkcję dopiero po akceptacji szefa w Asanie.
- **Tenant:** `software` · **Linia:** `software` · **Kolor:** Fiolet Kodu (wartości: ADR-015, `docs/design/prokomsoftware/tokens.css`).
- **Wzorzec wyglądu:** `docs/design/prokomsoftware/` (zrzuty, stany, plansze). **Model danych:** ADR-014. **Wygląd:** ADR-015. **Plan sesji:** `docs/zadania/prokomsoftware.md`. **Dane startowe:** `seed/prokomsoftware/`.
- **Cel biznesowy:** zapytania o strony, systemy, aplikacje i automatyzacje od firm z Podhala i Małopolski (zdalnie z całej Polski). Mierzymy:
  - liczbę zgłoszeń z formularzy (kontakt, kreator, „Twój projekt”, audyt) — `Inquiries`, linia `software`;
  - odsetek zgłoszeń z kreatora i z audytu;
  - wejścia z Google na strony rozwiązań, branż i miejscowości (Search Console).
- **Odbiorcy:** właściciele małych i średnich firm (pensjonaty, hotele, gastronomia, budowlanka i ekipy, warsztaty, gabinety, biura, producenci). Nie znają nazw technologii. Chcą zobaczyć efekt, cenę i termin.
- **Pojemność:** 2–3 projekty miesięcznie. Strona ma przyciągać dopasowane zapytania, nie maksymalną liczbę.

## 1. Twarde zasady
1. **Ceny „od”, netto, z panelu** (`Solutions.prices`, `leadTimes`; nigdy w kodzie). Puste pole ceny → **„Zapytaj o wycenę”**, pusty termin → „po krótkiej rozmowie” (`kreator.json` → `priceDisplay.fallback` / `termFallback`, decyzja SWD1 D1). Aplikacje i automatyzacje mają cenę celowo pustą (decyzja Krystiana 25.10).
2. **Nie podajemy liczby godzin pracy.** Wyceny są od projektu. Poziomy opieki mają „[X] h zmian w miesiącu” tylko wtedy, gdy szef tak zdecyduje.
3. **Nie wymieniamy konkurencji z nazwy.** Porównanie mówi o „freelancerze” i „agencji z dużego miasta”.
4. **SEO i widoczność w asystentach AI są w cenie każdego projektu** (komunikat na stronie: Cennik, FAQ, 8 obszarów). Tak samo ta strona: dane strukturalne, czytelne fakty, szybkość.
5. **Fakty tylko ze źródłem.** Każda liczba o rynku, przepisach albo progach Google ma źródło w treści (wpis, sekcja technologii) albo jest `TODO(krystian)`.
6. **Prywatność:** analityka bez ciasteczek (Umami, `docs/architektura.md`). Dopóki tak jest, liczba „0 banerów cookies” w pasku liczb sekcji Realizacje jest prawdziwa. Każda zmiana analityki = przegląd tego zdania.
7. **Teksty z plansz przenosimy bez zmian.** Zmiana tekstu = decyzja Krystiana w czacie i aktualizacja planszy albo seeda.
8. **Dostępność WCAG 2.1 AA** w obu motywach (axe bez naruszeń, klawiatura, `prefers-reduced-motion`).

## 2. Mapa strony

| Adres | Podstrona | Plansza | Skąd treść | Etap |
|---|---|---|---|---|
| `/` | Strona główna | `Main` | bloki Software w `Pages` (`home`) + kolekcje | 1 |
| `/rozwiazania` | Pełna oferta (29 rozwiązań; „Rezerwacje online na stronie” usunięte z oferty 25.10 — seed `removed`) | `Katalog` | `Solutions`, `SolutionAreas` | 1 |
| `/rozwiazania/[slug]` | Strona rozwiązania | `Rozwiazanie` | `Solutions` | 1: pełna strona z demo — aplikacja dla ekip w terenie; pozostałe 29 — szablon z danych karty, pełne treści w miarę pisania (plan §5) |
| `/dobierz` | Kreator 60 s | `Kreator` | `SoftwareSettings.wizard` | 1 |
| `/dla-branz/[branza]` | Strona branży | `Branza` | `Industries` (grupa Software) | 1: szablon + aktywne branże z treścią (start: budownictwo i wykończenia); 12 rekordów w seedzie |
| `/miejscowosci/[miasto]` | Strona miejscowości | `Miasto` | `Cities` | 1: Rabka-Zdrój; 2: pozostałe 5 (§6.9) |
| `/cennik` | Cennik | `Cennik` | `Pages` + blok cennika | 1 |
| `/audyt` | Darmowy audyt strony | `Audyt` | `Pages` + blok formularza audytu | 1 |
| `/o-firmie` | O firmie | `ONas` | `Pages` | 1 |
| `/jedna-firma` | Jedna firma do wszystkiego | `Wszystko` | `Pages` | 1 |
| `/aktualnosci`, `/aktualnosci/[slug]` | Aktualności i poradnik (blog) | `Aktualnosci`, `Wpis` | `Posts` (tenant `software`) | 1: lista + 1 wpis; trasa wspólna z Biznesem (powstaje w B11) |
| `/kontakt` | Kontakt i brief | `Kontakt` | `Pages` + `CompanyData` | 1 |
| `/polityka-prywatnosci` | Polityka prywatności (projekt do sprawdzenia przez szefa/prawnika) | `Polityka` | `Pages` | 1 |
| `/dziekujemy` | Po wysłaniu formularza (`noindex`, pomiar konwersji) | `Dziekujemy` | `SoftwareSettings.thanks` (trasa w `(software)`, ADR-014 v20) | 1 |
| 404 | Nie znaleziono strony (status HTTP 404) | `NieZnaleziono` | `SoftwareSettings.notFound` + indeks wyszukiwarki | 1 |
| `/mapa-strony` | Mapa strony | — | lista jak `sitemap.xml` (B11b) | 1 |
| `/realizacje` | Realizacje i opinie | — | — | **2** (decyzja 18.10: na razie nie) |
| `/uslugi/[usluga]` | Strony usług pod frazy | — | — | **2** (strategia, po starcie) |

Zasady adresów:
- Polskie słowa, bez polskich znaków, małe litery, myślniki.
- Filtry katalogu w URL: `/rozwiazania?kategoria=systemy&sytuacja=R&branza=noclegi&podglad=1&q=excel` → `noindex` + `canonical` do `/rozwiazania`.
- Kreator: `/dobierz?potrzeba=firm&firma=nocleg` (parametry opcjonalne, otwierają kreator w danym kroku; plansze ich nie mają — to dodatek kodu, z którego korzystają strony branż i kafle intencji).
- Podziękowanie: `/dziekujemy?nr=PKS-RRRR-NNNN` (numer zgłoszenia nie jest daną osobową; bez numeru strona pokazuje ogólne podziękowanie). `noindex`, poza sitemap.
- Odnośniki z plansz (`Katalog.dc.html` itd.) zamieniamy według kolumny „Plansza” (README wzorca).

## 3. Elementy wspólne (każda podstrona)

### 3.0 Pasek górny (desktop > 1080 px, nad nagłówkiem)
Istniejący `BrandBar` (SW0, D15): po lewej „Linia firmy PRO-KOM · od 2004 r. · Rabka-Zdrój i Zakopane”, po prawej linki do innych linii (PRO-KOM Biznes, Instalacje) i telefon linii z `SiteSettings.phone`. Link „Tech” ukryty, dopóki linia Tech nie ma strony. Przy ≤ 1080 px znika (§3.2).

### 3.1 Nagłówek — desktop > 1080 px (plansza `Main`, stan `stany/01-menu-oferta.jpg`)
Kolejność od lewej: znak PRO-KOM Software → **Oferta ▾** → pigułka **Kreator 60 s** → **Darmowy audyt** → **O firmie** → **Aktualności** → **Kontakt** | po prawej: przełącznik motywu → **Twój projekt** (z licznikiem — **tylko przy niepustej liście**) → przycisk **Bezpłatna wycena**.
- **Oferta ▾ (mega menu):** 4 kolumny, 12 pozycji:
  - Strony (6): wizytówka, firmowa, rozbudowana, landing page, dla restauracji, dla hotelu lub pensjonatu;
  - Systemy (4): zlecenia i grafik, CRM, czas pracy, z Excela do systemu;
  - Aplikacje i automatyzacje: aplikacja na telefon, automatyzacje;
  - Po wdrożeniu: Opieka, Cennik, Darmowy audyt;
  - karta bez liczby: „Strony, systemy i aplikacje dla firm z Podhala i nie tylko” → `/rozwiazania`;
  - rząd **„Dla branż”** pod kolumnami: chipy Budowlanka i ekipy, Pensjonaty i hotele, Gastronomia, Warsztaty i serwisy, Gabinety, „Wszystkie →”.
  Dane menu w `SiteSettings.software.navigation` (wzorzec `SiteSettings.biznes` z B3a; seed `nawigacja.json` → `header`, `headerRight`, `mega`), nie na sztywno.
- **Kreator 60 s:** na stronie głównej przewija do `#dobierz`, na podstronach prowadzi do `/dobierz`.
- **Twój projekt ▾** (`stany/02-twoj-projekt.jpg`): lista rozwiązań dodanych z kart (przycisk „+ Do projektu” → „✓ W projekcie”; toast „Dodano do Twojego projektu” z linkiem „Zobacz projekt →”). Każda pozycja: nazwa, ×. Na dole: „Wyślij do bezpłatnej wyceny →” → `/kontakt?projekt=1` (formularz z pozycjami, typ `list`) i „Wyczyść listę”. Pusta lista: tekst z `nawigacja.json` → `projectDrawer.empty` (ujednolicony do „+ Do projektu”, §13 pkt 20). Stan w `localStorage`: jeden klucz `pk-project` z listą `{ id, name }` (nazwy bez zapytania do API; ADR-014 rozstrz. 9). Synchronizacja między kartami przez zdarzenie `storage`.
- **Bezpłatna wycena:** → `#kontakt` na stronie głównej, `/kontakt` na podstronach.
- Przyklejony, tło `--header-bg` z rozmyciem.

### 3.2 Telefon i tablet ≤ 1080 px — „jak aplikacja” (stany `80`–`82`, zrzuty `*-390-*`)
Dane: `nawigacja.json` → `headerMobile`, `tabBar`, `mobileMenu`, `mobileMenuFooter`, `projectPill`, `projectDrawer` (`SiteSettings.software.navigation`).
- **Nagłówek kompaktowy:** tylko znak i przycisk **„Wycena”** (`/kontakt`; na stronie głównej `#kontakt`). Pasek linii (§3.0), pozycje menu, przełącznik motywu, „Twój projekt” i hamburger znikają z nagłówka. Nagłówek przyklejony (§8.6).
- **Dolny pasek** (`stany/82-mobile-pasek.jpg`, ciemny z aktywną „Ofertą”: `82b`): przyklejony do dołu z marginesem 10 px, tło `--header-bg` z rozmyciem, dolny odstęp `env(safe-area-inset-bottom)`. 5 pozycji: **Start** (`/`), **Oferta** (`/rozwiazania`), **Kreator** — wyróżniony okrągły przycisk na środku, wyniesiony nad pasek, w gradiencie akcentu (`/dobierz`; na głównej `#dobierz`), **Kontakt** (`/kontakt`), **Menu** (otwiera arkusz). Aktywna pozycja: kolor `--accent-text` + kreska `--accent` nad ikoną (wg adresu: `/` → Start, `/rozwiazania*` → Oferta, `/kontakt` → Kontakt, `/dobierz` → Kreator). Etykiety 12 px, cele dotyku ≥ 44 px. Treść strony ma dolny odstęp pod pasek.
- **Menu = arkusz od dołu** (`stany/80-mobile-menu.jpg`, `80b-mobile-menu-dol.jpg`): `<dialog>` z focus trap, Esc i zamknięciem tapnięciem w tło (wzorzec `<dialog>` z B3b). Od góry: uchwyt, „Menu” + zamknij; pole „Czego szukasz? np. zlecenia, pensjonat” (otwiera wyszukiwarkę katalogu `/rozwiazania`); karta **„Dobierz rozwiązanie · 5 krótkich kroków · 60 s · cena od razu”** w gradiencie akcentu; „Oferta”: 4 kafle z ceną „od” z `SolutionAreas` (Strony od 999 zł, Systemy od 2 990 zł, Aplikacje mobilne i Automatyzacje i AI „zapytaj o wycenę”); lista: Pełna oferta, Dla branż, Cennik, Darmowy audyt strony (plakietka „0 zł”); „Firma”: O firmie, Jedna firma do wszystkiego, Aktualności i poradnik, Kontakt; „Wygląd strony” — przełącznik Jasny/Ciemny (segment); przycisk „Bezpłatna wycena →”; telefon linii (`SiteSettings.phone`); stopka arkusza „PRO-KOM · ul. Orkana 16B, Rabka-Zdrój · od 2004 r.” (`mobileMenuFooter`).
- **„Twój projekt” na telefonie** (`stany/81a-mobile-pigulka-projektu.jpg`, `81-mobile-projekt.jpg`): pigułka nad dolnym paskiem **tylko przy niepustej liście** („Twój projekt · 2 · Zobacz →”); otwiera arkusz z listą (nazwa, ×), „Wyślij do bezpłatnej wyceny →” (`/kontakt?projekt=1`) i „Wyczyść listę”. Te same dane i store co na desktopie (§3.1, §8.1).

### 3.3 Szyna sekcji (tylko strona główna, ≥ 1401 px)
Pionowa nawigacja po lewej z kropkami i nazwami sekcji: start, oferta, popularne, podglądy, proces, dobierz, bez-wordpressa, zasady, realizacje, faq, kontakt (kolejność §4). Aktywna sekcja z `IntersectionObserver`. Poniżej 1400 px ukryta.

### 3.4 Stopka
4 kolumny: opis linii („Strony, systemy, aplikacje i automatyzacje dla firm. Linia firmy PRO-KOM Tadeusz Wójciak.”) · Usługi (5 kategorii katalogu) · Firma (O firmie, Jedna firma do wszystkiego, **Dla branż**, Realizacje → `/#realizacje` do czasu etapu 2, Aktualności, Cennik, Darmowy audyt, Rabka-Zdrój) · Kontakt (telefon i e-mail linii z `SiteSettings.phone` / `SiteSettings.email`, „Rabka-Zdrój · Zakopane · zdalnie w całej Polsce”). Dane: `nawigacja.json` → `footer`.
Pasek dolny: dane firmy z `CompanyData` (PRO-KOM Tadeusz Wójciak · ul. Orkana 16B, 34-700 Rabka-Zdrój · NIP 7352511447), link „Szukasz sprzętu, kas albo KSeF? PRO-KOM Biznes →”, linki prawne: polityka prywatności, mapa strony.
Telefon: linki w dwóch kolumnach, dolny margines pod dolny pasek.

### 3.5 Motyw
Jasny i ciemny (ADR-015). Domyślnie preferencja systemu, wybór w `pk-theme`, skrypt przed pierwszym malowaniem (jest: `THEME_SCRIPT`). `software` jest w `DARK_THEME_LINES` (SW1). Przełącznik: na desktopie w nagłówku, na telefonie w arkuszu menu (§3.2).

## 4. Strona główna (`/`, plansza `Main`)

Kolejność sekcji jest **ustalona** (v20, decyzja Krystiana 25.10): **12 sekcji** + stopka. Kolejność = kolejność bloków strony `home` w `Pages` (ADR-014 rozstrz. 7 i v20); `strona-glowna.json` → `homeOrder` służy tylko seedowi. Nie zmieniamy jej bez decyzji. **Technologie, „Jak robimy” i porównanie przeniesione na `/o-firmie`** (§6.6). Wysokość przy 390 px: ok. 15 500 px (wcześniej ok. 28 500) — nie dokładamy sekcji.

| # | Sekcja (id) | Nagłówek | Zachowanie (desktop) | Telefon (≤ 640 px, §8.6) | Dane | Zrzuty / stany |
|---|---|---|---|---|---|---|
| 1 | Hero (`start`) | „Strony, systemy i aplikacje **szyte pod Twoją firmę.**” | Eyebrow „Rabka-Zdrój · Podhale · zdalnie w całej Polsce”. Lead, CTA „Dobierz rozwiązanie” (60 s) → `#dobierz`, „Zobacz podglądy na żywo” → `#podglady`. Pasek zaufania: odpowiedź w [CZAS ODPOWIEDZI], podgląd przed zakupem, kod i dane należą do Ciebie, firma na Podhalu od 2004. Po prawej makieta „Twój system”: 7 modułów do włączania (strona, zlecenia, aplikacja ekipy, program do faktur, SMS, raport, asystent AI); licznik modułów, podpowiedź i „złożoność”; przycisk „Chcę taki system” dodaje zestaw do „Twój projekt” jako jedną pozycję („system z N modułów”), potem „✓ W Twoim projekcie”. | jedna kolumna, przyciski na całą szerokość; punkty zaufania jako przewijany rząd pigułek; makieta pod tekstem, moduły jako przewijany rząd | `strona-glowna.json` → `heroModules` | `Main-1440-*/01.jpg`, `stany/83` |
| 2 | Kafle intencji | 4 kafle | „Potrzebuję strony, która sprzedaje” · „Chcę system, który ogarnie firmę” · „Mam program, ale czegoś mu brakuje” · „Chcę aplikację na telefon” (z opisami). Każdy prowadzi do katalogu z filtrem albo kreatora z wybraną potrzebą. | siatka 2×2, bez opisów | plansza | `01–02.jpg`, `stany/82` |
| 3 | Oferta (`oferta`) | „Wszystko dla firmy, w ośmiu obszarach.” | 8 kafli z ikoną w gradiencie i krótkim opisem + panel szczegółów (scena ilustracji, „co zyskujesz”, chipy rozwiązań — z linkiem, jeśli mają stronę — cena „od” z `SolutionAreas.priceFrom`/`priceLabel`, 2 CTA). Autoprzełączanie co 5,5 s, stop po kliknięciu/najechaniu; klawiatura: strzałki. Etykieta „N rozwiązań” to tekst z panelu (`countLabel`), nie licznik — obszary to inny podział niż 5 kategorii katalogu (ADR-014 §1.2). | pigułki obszarów w przewijanym rzędzie (`scroll-snap`) + panel szczegółów pod spodem | `obszary.json` | `stany/10-obszary-1..8.jpg`, `84` |
| 4 | Popularne (`popularne`) | „12 rzeczy, po które firmy przychodzą najczęściej.” | Filtry: Wszystko / Strony / Systemy / Aplikacje / Automatyzacje. Karta rozwija się po kliknięciu (warianty ukryte, gdy zwinięta). Na karcie: nazwa, lead, 3 cechy, cena „od” i termin (z `Solutions`), „+ Do projektu”, link do strony rozwiązania. Pozycje 11–12 to karty ogólne (filtr obszaru). Pod siatką blok „A gdy już masz stronę lub system”: Opieka i rozwój (od [OPIEKA OD] zł / mies.), Przejęcie po kimś, kto zniknął, Darmowy audyt strony + przycisk „Pełna oferta”. | filtry w przewijanym rzędzie; karty w karuzeli (84% szerokości, widać brzeg następnej) | `popularne.json` (kolejność), `rozwiazania.json` | `stany/20-*.jpg`, `21-*.jpg`, `85` |
| 5 | Podglądy (`podglady`) | „Zobacz, jak to będzie wyglądać. Zanim zapłacisz.” | Eyebrow „Podglądy na żywo · zanim zapłacisz”. 5 zakładek: Strona, Rezerwacje, System firmowy, Aplikacja mobilna, Automatyzacje i AI. Każda: animowana makieta + 3 kroki + 2 „toasty”. Autoprzełączanie, stop po dotknięciu. Krok podglądu „Strona”: „treść w mniej niż 2,5 s” (próg Google). | zakładki w przewijanym rzędzie; laptop przycięty do szerokości ekranu, bez telefonu i pływających kart | `strona-glowna.json` → `livePreviews` | `stany/30-podglad-1..5.jpg` |
| 6 | Proces (`proces`) | „Od rozmowy do działającego systemu. Płacisz po każdym etapie.” | Eyebrow „Jak pracujemy i jak powstaje cena”. 5 etapów (Rozmowa 30 min, Podgląd i wycena [DNI] dni, Budowa [TYGODNIE] tyg. — z wersją testową co tydzień, Wdrożenie, Opieka). Panel etapu: co dostajesz, co robisz Ty, ile płacisz ([ZASADY PŁATNOŚCI]). Makieta wyceny z kwotami z cennika — przykład (`proceduralMock`: połączenie z programem do faktur bez kwoty, „po sprawdzeniu programu”; suma etapów 1–2 = 8 980 zł netto). Autoprzełączanie, stop po kliknięciu. | etapy w przewijanym rzędzie, bez makiety „szkic systemu” | `process`, `processShort`, `proceduralMock` | `stany/40-proces-etap-1..5.jpg` |
| 7 | Kreator (`dobierz`) | „Kliknij kilka razy. Zobacz, co dla Ciebie zbudujemy.” | §6.3 — ten sam komponent co `/dobierz`. | §6.3 | `kreator.json` | `stany/50–55-*.jpg`, `87a–f` |
| 8 | **Dlaczego nie WordPress i PHP** (`bez-wordpressa`) — nowa w v20 | Eyebrow „Dlaczego nie WordPress i PHP”, H2 „Bez wtyczek do łatania. Bez nocnych aktualizacji.” | Lead; **3 fakty ze źródłem** (7 966 luk w WordPressie i wtyczkach w 2024 r. — Patchstack „State of WordPress Security in 2025”; 72 h na zgłoszenie wycieku i kara do 10 mln euro albo 2% obrotu — RODO art. 33 i art. 83 ust. 4; „0 wtyczek”); **tabela porównania 6 wierszy** „WordPress z wtyczkami” ✕ / „Strona od PRO-KOM” ✓ (szybkość, bezpieczeństwo, aktualizacje, wygląd, Google i AI, zmiana treści); karta „Masz stronę na WordPressie?” z przyciskami „Sprawdź swoją stronę za darmo” (`/audyt`) i „Przebudowa od {cena:przebudowa-starej-strony} zł →” (cena z `Solutions`, ADR-014 v20), link do wpisu „WordPress czy strona od zera”. | fakty w karuzeli, tabela jako karty (wiersz = karta z ✕ i ✓) | `strona-glowna.json` → `whyNotWordpress` | `stany/75`, `76` (ciemny), `86` |
| 9 | Zasady (`zasady`) | „Zasady, których się trzymamy.” | 6 kart gwarancji z ikonami + blok **„Czasem powiemy: nie budujcie”** w ciemniejszym fiolecie (kontrast ≥ 4,5:1, ADR-015 v20). | jedna kolumna | `guarantees` | |
| 10 | Realizacje (`realizacje`) | „Najpierw zbudowaliśmy to dla siebie.” | 3 systemy własne PRO-KOM z makietami: prokomserwis.pl (działa), pro-kom.eu (działa), prokombiznes.pl (w budowie; opis bez „porównywarki”, §13 pkt 22). Pasek liczb: 2004, 100+, [WYNIK] (Lighthouse), „0 banerów cookies” (zasada 6). Opinie klientów — **nie teraz**. | realizacje w karuzeli; liczby w siatce 2×2 | `strona-glowna.json` → `showcase` | |
| 11 | FAQ (`faq`) | „Pytania, które słyszymy najczęściej” | **6 pytań** (ustalone), akordeon, JSON-LD `FAQPage`. | jedna kolumna | `faq.json` → `homeFaq` | |
| 12 | Kontakt (`kontakt`) | „Powiedz, co Cię boli. Resztą zajmiemy się my.” | Ciemny blok. Lewa: obietnice ([CZAS ODPOWIEDZI], spotkanie, [MIESIĄC]), link do audytu („Masz już stronę?”), telefon. Prawa: formularz z §7 z tematami; błędy i sukces wg §7.2. | jedna kolumna, formularz pod obietnicami | `CompanyData`, `SoftwareSettings` | `stany/77` (błąd zgody) |

Pasek „100+ klientów biznesowych” i rok 2004 są w danych firmy (`CompanyData`), nie w kodzie.

**Dane w skrypcie planszy `Main`, których nie przenosimy:** stare, niewyświetlane struktury `OF`/`ofItems` (dawny przegląd oferty), `KM2` (dawny prosty kreator) i tablica wyszukiwarki `S`. Źródłem treści jest seed.

## 5. Pełna oferta `/rozwiazania` (plansza `Katalog`)
- Eyebrow „Pełna oferta”, H1: „Wszystko, co programujemy. **Ceny, terminy, podgląd.**” (bez liczby rozwiązań w tytule; licznik „N rozwiązań w pełnej ofercie” liczony z danych).
- **Wyszukiwarka** (placeholder „np. zlecenia, pensjonat, Excel…”): normalizacja polskich znaków, synonimy z `SoftwareSettings.search`, tolerancja literówek. Użyj `lib/search.ts` z Biznesu (B4), z innym indeksem — nie pisz drugiej wyszukiwarki.
- **Filtry** (w URL, z licznikami):
  - kategoria (`?kategoria=`, `Solutions.category`): Wszystko / Strony / Systemy / Aplikacje / Automatyzacje / Opieka i audyt;
  - sytuacja: „zaczynam od zera” (Z) / „mam program, brakuje mu czegoś” (R) / „mam kilka programów” (P);
  - branża: 8 grup (`branze.json` → `groups`);
  - przełącznik „z podglądem na żywo”.
- **Karta:** etykieta, tag, nazwa, lead, 3 cechy, cena „od” i termin wersji „Na start”, „Dodaj do projektu”, rozwinięcie z „dla kogo”, sytuacjami i **3 wersjami** (Na start / Standard / Pełna — cena i termin każdej), linia zakresu (`priceNote`), „Otwórz podgląd” (jeśli `hasLivePreview`), link do strony rozwiązania.
- Ceny wg kategorii (z `Solutions`, nigdy w kodzie): aplikacje i automatyzacje „Zapytaj o wycenę” · „po krótkiej rozmowie” (puste ceny); opieka „od 149 zł / mies.” (`priceDisplay.monthTemplate`); przejęcie „od 990 zł jednorazowo”; audyt „szybki 0 zł” (cena 0 = darmowy, nie „brak ceny”).
- Pusty wynik: „Nie widzisz swojej sytuacji?” → kreator (tryb „opisz po swojemu”) i kontakt.
- Na końcu blok kontaktu (§6.0).
- **Telefon** (`stany/88a-mobile-katalog.jpg`, `88b-mobile-katalog-filtry.jpg`): kategorie w przewijanym rzędzie; przyklejony pasek z wyszukiwarką i przyciskiem „Filtry (n)” → arkusz od dołu (sytuacja, branża, „Tylko z podglądem na żywo”, „Wyczyść”, „Pokaż N rozwiązań”); karty w jednej kolumnie z miniaturą w kolorze kategorii.
- JSON-LD `ItemList` z `Service`. `noindex` dla wariantów z parametrami.

## 6. Podstrony

### 6.0 Zasady wspólne podstron (v20)
- Przyklejony nagłówek (§3, §8.6), okruszki pod nagłówkiem, na końcu **blok kontaktu** (kreator · bezpłatna wycena · telefon linii), stopka z linkami prawnymi.
- Telefon: jedna kolumna, przyciski na całą szerokość, przewijane rzędy zamiast siatek 3–4 kolumn, siatki liczb 2×2 (§8.6). Wzorzec: `screens/<Plansza>-390-light`.
- Ceny i terminy zawsze z `Solutions` (zasada 1); w tekstach `{cena:<slug>}` = cena „od” rozwiązania (ADR-014 v20).

### 6.1 Rozwiązanie `/rozwiazania/[slug]` (plansza `Rozwiazanie`, wzór: aplikacja dla ekip w terenie)
Sekcje: hero (eyebrow z branżami, H1, lead, CTA „Chcę takie u siebie” (dodaje do projektu) + „Jak to działa, krok po kroku”, 4 kafle danych: cena, pierwszy etap, działa na, opieka) → **klikalne demo telefonu** („To nie jest film. Klikaj po telefonie.”, dane `demo-aplikacja-ekip.json`) → „Dziś / Z aplikacją / Efekt (mierzymy po wdrożeniu)” → „Co dostajesz” (w cenie „od”) i „Wyceniane osobno” → „Z przeglądarki czy ze sklepu?” → „Często łączone z” (3 rozwiązania) → FAQ rozwiązania z zasadami płatności (JSON-LD) → kontakt.
- Kafle danych: cena z `Solutions` (aplikacja: „Zapytaj o wycenę · na piśmie, w [CZAS ODPOWIEDZI]”), „Pierwszy etap [CZAS PIERWSZEGO ETAPU]” („3–4 tyg.”), opieka „od [OPIEKA OD] zł / mies.”.
- Demo telefonu tylko dla rozwiązań z `hasLivePreview` i własnym demo; pozostałe pokazują makietę z obszaru (scena z `obszary.json`). **Telefon** (`stany/89a-mobile-rozwiazanie.jpg`): hero w jednej kolumnie, kafle danych 2×2; zamiast pomniejszonego laptopa **interaktywny telefon w czytelnym rozmiarze** + karta „Tablica w biurze, na żywo”.
- Rozwiązania bez pełnej treści: szablon z danych karty (lead, cechy, dla kogo, sytuacje, powiązane) + kontakt. Pełne treści dla pozostałych pisze Krystian w czacie (plan, §5).
- Eksport danych: nie obiecujemy miesięcznego eksportu (§13 pkt 26 — tylko w Opiece Systemy).
- JSON-LD `Service` + `BreadcrumbList` + `FAQPage`; `offers` z ceną „od” tylko, gdy rozwiązanie ma cenę (puste → bez `offers`).

### 6.2 Branża `/dla-branz/[branza]` (plansza `Branza`, wzór: budownictwo i ekipy)
Sekcje: hero (H1 „Oprogramowanie dla firm, które pracują w terenie, nie przy biurku.”) → „Kliknij swój problem. Pokażemy, co na to mamy.” (lista problemów → panel z rozwiązaniem, cechami i CTA) → układ modułów wokół firmy („Na budowie w Zębie nie ma LTE. Aplikacja o tym wie.”) → „Sześć rzeczy, od których zaczynają firmy takie jak Twoja” (ceny na kartach z `Solutions`: zlecenia od 3 490, czas pracy i wyceny PDF od 2 990, strona od 2 490; aplikacja i faktury „Zapytaj o wycenę”) → „Złóż system dla swojej firmy. **W 60 sekund.**” (tytuł z `Industries.software.wizardTitle`, CTA do kreatora z `?firma=`) → **„Zanim zapytasz” — FAQ branży (4 pytania, wspólne pole `Industries.faq`, JSON-LD `FAQPage`)** → ciemny blok kontaktu „Pokaż, jak dziś pracują Twoje ekipy.”.
- Przykładowe kwoty w treściach zamiast `[KWOTA]` (z planszy).
- Telefon: mapa modułów jako siatka 2 kolumn z kartą „3 ekipy” na górze; problemy i „Działa bez zasięgu” w przewijanych rzędach.
- 12 rekordów w seedzie (`branze.json` → `pagesAtStart`, z grupą i rodzajem firmy do kreatora): budownictwo i wykończenia, instalatorzy, ekipy montażowe, pensjonaty i apartamenty, hotele, gastronomia, atrakcje i wypożyczalnie, gabinety i rehabilitacja, warsztaty i serwisy, transport, producenci regionalni, biura rachunkowe.
- Treść budowlanki jest w `branze.json` → `budowlanka`. **Pozostałe 11 = treść do napisania w czacie** (problemy, moduły, 6 rozwiązań), każda unikalna. Strona bez treści nie jest publikowana (`active=false`).

### 6.3 Kreator `/dobierz` i sekcja `#dobierz` (plansza `Kreator`, stany `50–55`, telefon `87a–f`)
Jeden komponent w dwóch miejscach. Reguły to **dane** (`kreator.json` → `SoftwareSettings.wizard`, schemat Zod), nie `if` w komponentach.

**Plakietki** nad kreatorem: „5 krótkich kroków · podgląd na żywo · wycena na piśmie” (`badges`). Wszędzie jedna obietnica: 60 s / 5 kroków (karta w menu, strona branży „W 60 sekund”).

**Kroki** (pigułki u góry, zakończone z ptaszkiem): Potrzeba → Szczegóły → Zakres → Opis → Wynik.

1. **Potrzeba** — 8 kafli, 4 w rzędzie (telefon: 2):
   - wiersz „Nowa strona internetowa”: Strona firmowa (`firm`), Rozbudowana strona (`rozb`), Strona wizytówka (`wiz`), Landing page (`land`);
   - wiersz „Odświeżenie, program, aplikacja”: Odświeżenie obecnej strony (`odsw`), Program dla firmy (`prog`), Aplikacja (`app`), Automatyzacje (`auto`);
   - pod spodem: „Opisz po swojemu” (`own`) — przechodzi od razu do kroku Opis.
2. **Szczegóły** — pytanie zależne od potrzeby (`needs[x].q`, opcje `o`): np. „Jaka to firma?” (10 rodzajów firm), dla programu „Co dziś najbardziej przeszkadza?” (zlecenia, klienci, czas pracy, zgłoszenia, Excel), dla odświeżenia: co dziś nie działa (`rebuildIssues`).
3. **Zakres** — rozmiar (Na start / Standard / Pełna wersja), „mam już stronę” + pole adresu (dla odświeżenia), dla programów zdanie „Plik możesz dosłać mailem po kontakcie” (bez pola pliku — §7.3), „na kiedy” (Jak najszybciej / Przed sezonem zimowym / Przed latem / Bez pośpiechu).
4. **Opis** — pole tekstowe + gotowe frazy do kliknięcia (`phrases`). W „Opisz po swojemu” pominięte kroki są wyszarzone (bez przekreślenia). Zmiana potrzeby czyści opis z poprzedniej ścieżki.
5. **Wynik** — dwie kolumny o **równej wysokości**:
   - lewa: rekomendowane rozwiązanie (`mapping` → `results` → `resultToSolutionSlug`), przełącznik rozmiaru, **cena wg `priceDisplay`**: wybrany rozmiar → `Solutions.prices[rozmiar]` bez „od” („{cena} zł netto”), rozmiar niewybrany → cena „Na start” z „od”, pusta cena → „Zapytaj o wycenę”; termin z `leadTimes[rozmiar]` (pusty → „po krótkiej rozmowie”); pod ceną **linia zakresu** (`scopeNotes`, zależna od wyniku i rozmiaru, np. systemy „Na start: jeden moduł na gotowym fundamencie, do 5 użytkowników, bez integracji”); aplikacje, automatyzacje i rozbudowa → „Zapytaj o wycenę” (`stany/55`); opieka „od 149 zł / mies.”; notka do „na kiedy” (`whenNotes`), „Co będzie potrzebne” (checklista `needsChecklist`), „Twoje potrzeby”, „Twój wybór”;
   - prawa: podgląd projektu (rośnie do wysokości lewej kolumny; marka podglądu z `previewBrands` dla rodzaju firmy, widoki systemu z `systemViews`, akcje automatyzacji z `automationActions`) + „Chcesz wycenę na piśmie?” (`send`): sposób kontaktu (Telefon / E-mail / Spotkanie w salonie / Online), **„Imię”**, „Telefon albo e-mail”, **checkbox zgody** (pole 22 px, link do `/polityka-prywatnosci`; ADR-014 rozstrz. 6 — od v20 są też w planszy), przycisk „Wyślij mi wycenę na piśmie →” na całą szerokość (nieaktywny wygląd na `--chip`), zdanie „Odpowiadamy w ciągu [CZAS ODPOWIEDZI]. Dane tylko do tej wyceny, bez newslettera.”;
   - błędy pod polami i w ramce (`send.errors`: brak kontaktu, brak zgody — `stany/50-…-5-blad`, `87e`);
   - po wysłaniu (sukces **na miejscu**, bez przejścia na `/dziekujemy` — decyzja SWD1 D4): karta „Wysłane · PKS-RRRR-NNNN”, „Gotowe. Wycena jest w drodze.” i 3 kolejne kroki (`send.success`), zdanie o kopii na e-mail (wysyła ją `confirmationEmail`, gdy podano e-mail) i telefon linii (`stany/50-…-6-wyslane`, `87f`).
- **Stan początkowy podglądu:** „Tu zobaczysz swój projekt” z 4 pływającymi mini-kartami (wyłączone przy `prefers-reduced-motion`).
- **Telefon** (`stany/87a–f`, `kreator.json` → `mobile`): kafle potrzeby 2×2 mieszczą się w ekranie; pigułki kroków przyklejone pod nagłówkiem; „Dalej” przyklejone nad dolnym paskiem; w wyniku najpierw rekomendacja i formularz, **podgląd projektu zwinięty** pod „Pokaż podgląd projektu” / „Ukryj podgląd projektu”. Na `/dobierz` aktywna pozycja paska to Kreator. Kafle szczegółów (`87b`) w planszy łamią tekst po jednym słowie — w kodzie ikona nad tekstem albo tekst w pełnej szerokości kafla.
- **Wysyłka:** `submitInquiry()` z `type: 'wizard'`, `wizard` = pełny stan (potrzeba, szczegóły, rozmiar, kiedy, opis, wynik), `preferredContact` (mapowanie `contactPrefs[].inquiryValue`), `url` (jeśli podany); `message` składa serwer z podsumowania kreatora.
- **Parametry URL:** `?potrzeba=` i `?firma=` ustawiają kroki 1–2 (używają ich strony branż).
- Mapowanie potrzeba → wynik (z `kreator.json`): `firm` + nocleg → strona dla pensjonatu; `firm` + gastro → restauracja; `firm` + inne → firmowa; `rozb` → rozbudowana; `wiz` → wizytówka; `land` → landing; `odsw` → przebudowa; `prog` + zlecenia/klienci/czas/zgłoszenia/Excel → odpowiedni system; `app` → aplikacja; `auto` → automatyzacje; `own` → bez rekomendacji, tylko formularz.

### 6.4 Cennik `/cennik` (plansza `Cennik`)
H1 „Ceny bez gwiazdek. Na piśmie.” (eyebrow „Cennik · ceny netto”) → „Wybierz, czego szukasz.”: **29 pozycji w 5 zakładkach** (te same dane co katalog), każda z 3 cenami i terminami (Na start / Standard / Pełna), zakres systemów pod zakładką, aplikacje i automatyzacje „Zapytaj o wycenę” → „Spokój co miesiąc. Bez długich umów.”: opieka po wdrożeniu, 3 poziomy (Podstawowa 149, Standard „Polecamy” 299, Systemy 790 zł / mies.) z czasem reakcji i zakresem; przyciski „Wybieram X →” prowadzą do `/kontakt` z wybranym poziomem → „Tego nie dopłacasz” (8 pozycji „W cenie każdej strony”: SEO i AI, panel i szkolenie, wersja testowa co tydzień, własność kodu i danych, dokumentacja, szybkość w protokole…) → FAQ o cenach → CTA kreator/kontakt.
- Ceny poziomów opieki są polami bloku cennika (nie faktami); wpisane w seedzie wg cennika z 25.10 (przed publikacją akceptacja szefa, §13). Pusty poziom → wiersz ukryty. Rozwiązania bez ceny → „Zapytaj o wycenę” (zasada 1). Bez przekierowania 302.
- Eksport danych co miesiąc tylko w poziomie Systemy; raport co miesiąc od poziomu Standard; w pozostałych „eksport na każde żądanie” (§13 pkt 26).
- Telefon (`stany/89b-mobile-cennik.jpg`): tabela jako karty.

### 6.5 Darmowy audyt `/audyt` (plansza `Audyt`)
H1 „Sprawdzimy Twoją stronę. Za darmo.” → formularz z etykietami: adres strony + **„Imię”** + e-mail/telefon + **checkbox zgody** (ADR-014 rozstrz. 6; od v20 też w planszy), walidacja (czerwone pola + lista błędów, §7.2) → po wysłaniu `/dziekujemy` (§7.2; plansza pokazuje też stan „Przyjęte. Raport dla {adres} wyślemy w ciągu [CZAS].” z 3 krokami) → przykład raportu (5 obszarów: szybkość, telefon, Google i AI, bezpieczeństwo, dostępność) → „Pięć rzeczy, które decydują, czy strona zarabia.” (5 kart + wyróżniona karta „Raport na piśmie”) → „Zacznij za darmo. Głębiej, gdy trzeba.”: rodzaje audytu 0 / 990 / 1 990 zł (ceny z `Solutions` — audyt) z dopiskiem „pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni”, raport w [CZAS] („2 dni robocze”) → „Trzy kroki. Zero zobowiązań.” → FAQ → CTA „Wolisz od razu nową stronę?”.
- Wysyłka: `type: 'audit'`, pole `auditUrl` (walidacja: http/https, domena), `message` składa serwer („Audyt strony: <adres>”), bez pobierania tej strony przez serwer (audyt robi człowiek; automatyzacja = etap 2).
- Zdanie o dostępności: „Od 28.06.2025 część usług cyfrowych musi to spełniać” — sprawdzić brzmienie z ustawą o zapewnianiu spełniania wymagań dostępności (§13).

### 6.6 O firmie `/o-firmie` (plansza `ONas`)
H1 „Firma z Rabki. Od 2004 roku.” — hero z **kolażem zdjęć** (salony, zespół) zamiast liczb → „Konkretnie, bez dmuchania.” (liczby tylko tu: 2004, 100+, 2 salony, 5 linii) → „Pracujesz z firmą. Nie z jedną osobą.” (ciągłość, na miejscu, na piśmie) → **przeniesione ze strony głównej (v20):**
  - „Nie składamy z gotowych klocków. Piszemy pod Twoją firmę.” (jak robimy: dwa bloki „dziś / z nami” na białych kartach w jasnym motywie; kolory ilustracji z tokenów — zmienne lokalne bloku z `--ok`, `--warn`, `--ink*`);
  - „Twój system, warstwa po warstwie.” (technologie: zwarte zakładki, 6 warstw: co to, co z tego masz, liczby z progami Google i źródłem; `technologie.json`; `stany/60-technologie-1..6.jpg`);
  - „Freelancer, agencja czy PRO-KOM?” (porównanie: tabela 3 kolumn, na telefonie przełącznik kolumny, bez nazw firm; `compare`; `stany/70-porownanie-agencja.jpg`);
→ historia „Najpierw sprzęt i serwis. Potem własne systemy.” („Potem” zamiast nieznanych lat) → „Kto z Tobą pracuje.” (Krystian Potaczek, Tadeusz Wójciak, [IMIĘ I NAZWISKO] — zdjęcia tylko za zgodą) → „Dwa salony. Ludzie na miejscu.” (Rabka, Zakopane [ADRES SALONU W ZAKOPANEM], ze zdjęciami) → CTA.
- Miejsca na zdjęcia (komponent zdjęcia z opisem, co ma na nim być) — do sesji zdjęciowej przed produkcją (§13 pkt 25). Bez zdjęcia: opis-zaślepka nie trafia na produkcję.
- Telefon: technologie, „jak robimy” i porównanie jako karuzele (`stany/60`, `70`).

### 6.7 Jedna firma do wszystkiego `/jedna-firma` (plansza `Wszystko`)
H1 „Strona, program, sprzęt i serwis. W jednej firmie.” → „Każda robi swoje. Razem robią całość.” (5 linii PRO-KOM; odnośniki tylko do istniejących domen: prokombiznes.pl, prokominstalacje.pl, prokomserwis.pl) → „Dwa przykłady z Podhala.” (opisowe, bez nazw klientów do czasu zgody) → „Jeden kontakt zamiast pięciu.” → **„Dwa salony z ludźmi na miejscu.”** (nowa w v20, zdjęcia obu salonów) → CTA. Nazwy linii zgodne z `docs/marka.md` (tam „Tech (dawniej Serwis)” — §13).

### 6.8 Aktualności `/aktualnosci` i wpis (plansze `Aktualnosci`, `Wpis`)
- Blog jest w Aktualnościach (decyzja 18.10). Lista (H1 „Konkretnie o stronach i systemach.”): wyróżniony wpis + siatka, kategorie (Poradnik, Nowości, Realizacje) z **osobną ilustracją dla każdej kategorii**, daty z `Posts.publishedAt` (w planszy przykładowe); na telefonie lista kompaktowa.
- Wpis: H1, lead, **autor i data**, czas czytania, treść z nagłówkami H2, **CTA audytu w środku tekstu**, **źródła z datą sprawdzenia i linkami** (`Posts.sources`; „Ostatnie sprawdzenie danych” = data weryfikacji źródeł, nigdy przyszła), **ramka autora ze zdjęciem**, **3 powiązane wpisy**, powiązane rozwiązania. JSON-LD `Article` + `BreadcrumbList`.
- Na start 1 wpis: „WordPress czy strona pisana od zera?” (dane W3Techs i Patchstack — przed publikacją ponownie sprawdzić liczby i datę).
- Trasa wspólna z Biznesem (B11a, ADR-012 rozstrz. 5) — SW11b dokłada tylko wygląd Software.

### 6.9 Miejscowości `/miejscowosci/[miasto]` (plansza `Miasto`, wzór: Rabka-Zdrój)
H1 „Strony i systemy dla firm z Rabki-Zdroju.” → „Dla kogo pracujemy najczęściej.” (branże lokalne, ceny na kartach z `Solutions`) → „Blisko, czyli prościej.” → „Najczęściej pytacie o to” (FAQ lokalne `Cities.faq`, ceny przez `{cena:<slug>}`) → „Pracujemy też w okolicy” (okoliczne miejscowości jako chipy, **bez linków** do nieaktywnych stron) → „Wpadnij do salonu przy Orkana 16B.” (zdjęcie salonu).
- Na start: **Rabka-Zdrój**. Potem: Zakopane, Nowy Targ, Mszana Dolna, Limanowa, Nowy Sącz.
- **Zasada przeciw „doorway pages”** (wytyczne Google o spamie): każda strona ma unikalną treść (lokalne branże, dojazd/spotkanie, lokalne pytania, realne powiązanie z firmą). Strona bez unikalnej treści nie jest publikowana. Raba Wyżna, Chabówka, Skomielna Biała itp. tylko na liście „w okolicy”, bez własnych stron.
- JSON-LD `Service` z `areaServed` (miasto). Bez fałszywych adresów: `LocalBusiness` tylko z prawdziwymi oddziałami.

### 6.10 Kontakt `/kontakt` (plansza `Kontakt`)
H1 „Napisz, co Cię boli. Odpowiemy z konkretem.” (eyebrow „Kontakt · Rabka-Zdrój · Zakopane · online”) → kanały: telefon linii (`SiteSettings.phone`) z godzinami [GODZINY] („pn–pt 9:00–17:00”), e-mail linii z „odpowiedź w ciągu [CZAS ODPOWIEDZI]” → „Najpierw zobaczysz, potem zapłacisz.” + formularz z §7 (ten sam co na stronie głównej; błędy i sukces → `/dziekujemy`) → „Gdzie się spotkamy”: prawdziwy adres Rabki ([ADRES]), NIP, makieta mapy z przyciskiem „Nawiguj” (link do Map Google; w kodzie statyczny obraz z linkiem jak Biznes — bez ciasteczek przed zgodą), lista miejsc spotkań (Zakopane, dojazd do klienta: Kraków, Nowy Targ, Mszana Dolna, Nowy Sącz) → „Co się stanie po wysłaniu” (3 kroki; wycena ważna 30 dni) → link do polityki prywatności → dane firmy. JSON-LD `LocalBusiness` z `CompanyData`.
- `?projekt=1`: formularz pokazuje pozycje z „Twój projekt” (edytowalne) i wysyła `type: 'list'`.
- `?poziom=<podstawowa|standard|systemy>` (z przycisków „Wybieram X →” w cenniku): temat „Opieka lub ratunek” i poziom wpisany do opisu.
- Telefon: `stany/89c-mobile-kontakt.jpg`.

### 6.11 Strony prawne, podziękowanie i 404
- **Polityka prywatności `/polityka-prywatnosci`** (plansza `Polityka`, H1 „Twoje dane. Krótko i po ludzku.”): baner „Wersja robocza do sprawdzenia przed publikacją”, chipy zaufania, spis treści (8 punktów; na telefonie przewijane chipy), administrator, jakie dane zbieramy, cele i podstawy z RODO (tabela), okres przechowywania [OKRES PRZECHOWYWANIA], odbiorcy, prawa z art. 15–21, cookies i statystyki (analityka bez ciasteczek), [DATA AKTUALIZACJI]. Własna strona tenanta `software` w `Pages` (jak strony prawne Biznesu z B11b, `src/seed/biznes/legal.ts`), nie wspólna treść. **Projekt — przed produkcją akceptacja szefa/prawnika**; baner „wersja robocza” nie trafia na produkcję. Treść do sprawdzenia: §13 pkt 24.
- **Mapa strony `/mapa-strony`** — jak Biznes (B11b: ta sama lista co `sitemap.xml`).
- Bez strony cookies, dopóki nie ma ciasteczek innych niż niezbędne.
- **Dziękujemy `/dziekujemy`** (plansza `Dziekujemy`, H1 „Dziękujemy, mamy to.”): numer zgłoszenia z `?nr=` (§2), 3 kolejne kroki, linki do podglądów i aktualności („Zobacz, jak to wygląda u innych.”); `noindex`, poza sitemap; wejście = konwersja (§8.4). Zdanie o kopii na e-mail zostaje — `confirmationEmail` (S8) wysyła ją, gdy zgłoszenie ma e-mail.
- **404** (plansza `NieZnaleziono`, H1 „Tej strony tu nie ma. Reszta jest.”): wyszukiwarka z podpowiedziami (indeks katalogu §8.2), karta kreatora, „Dokąd chcesz pójść?” — 6 kafli popularnych miejsc. Status HTTP 404 (`not-found.tsx` w ramce linii — dziś wspólny tekst dla wszystkich linii; wersja Software w SW11b). Treść kafli: `SoftwareSettings` (ADR-014 v20).

## 7. Formularze

| Formularz | Pola | Typ (`Inquiries.type`) | Gdzie trafia | Kto dostaje powiadomienie |
|---|---|---|---|---|
| Kontakt (główna, `/kontakt`) | temat (Strona, System lub panel, Aplikacja mobilna, Rozbudowa, Opieka lub ratunek, Audyt), opis, imię i firma, e-mail albo telefon, zgoda | `contact` (`topics`) | `Inquiries`, linia `software` | `software@pro-kom.eu` (+ kopia szefa — §13) |
| Twój projekt (`/kontakt?projekt=1`) | jak wyżej + pozycje (nazwy i slugi rozwiązań) | `list` (`items[]` z `nameSnapshot`, opcjonalnie relacja `solution`) | jw. | jw. |
| Kreator | stan kreatora, opis, sposób kontaktu, imię, kontakt, zgoda, opcjonalnie adres strony | `wizard` | jw. | jw. |
| Audyt | adres strony, imię, e-mail albo telefon, zgoda | `audit` (nowy) | jw. | jw. |

### 7.1 Zasady wspólne
- Wszystko przez `submitInquiry()` i `POST /api/inquiry` (ADR-003): honeypot, podpisany token, limit, maile, retencja. Numer `PKS-RRRR-NNNN` (jest od B1b).
- Jedno pole „E-mail albo telefon” → rozpoznanie po formacie, zapis do `email` albo `phone`.
- `preferredContact`: rozszerzyć o `meeting` (spotkanie w salonie) i `online`; kreator mapuje `tel→phone`, `mail→email`, `salon→meeting`, `online→online`.
- Bez danych osobowych w logach. Zgoda: treść z `consent.ts` (`TODO(krystian)` z S8b), checkbox przy **każdym** formularzu z linkiem do `/polityka-prywatnosci`.

### 7.2 Błędy i sukces (v20)
- **Błędy:** etykiety nad polami; przy błędzie czerwone obramowanie pola, komunikat pod polem i ramka z listą błędów nad przyciskiem (fokus na pierwszym błędnym polu). Teksty błędów kreatora w `kreator.json` → `send.errors` (brak kontaktu, brak zgody); pozostałe formularze — te same teksty. Stany: `stany/77-kontakt-blad-zgody.jpg`, `50–52-…-5-blad`, `87e`. Nieaktywny przycisk wysyłki: tło `--chip`, wyraźnie nieaktywny.
- **Sukces — kontakt, „Twój projekt” i audyt:** przejście na `/dziekujemy?nr=PKS-RRRR-NNNN` (§6.11; decyzja SWD1 D4). Plansze pokazują też kartę sukcesu na miejscu (numer + 3 kroki) — to treść strony `/dziekujemy`.
- **Sukces — kreator:** na miejscu, w kolumnie wyniku: „Wysłane · PKS-RRRR-NNNN”, „Gotowe. Wycena jest w drodze.” i 3 kroki (`send.success`, §6.3).
### 7.3 Plik w kreatorze — poza etapem 1 (SW0, D7)
- W etapie 1 **nie ma pola pliku**; przy „Program dla firmy” kreator mówi: „Plik możesz dosłać mailem po kontakcie”.
- Powód: prywatny magazyn plików (`InquiryFiles`, ADR-014 §3.2) to nowy katalog poza `Media`, kopie, retencja i testy. Wraca jako osobne zadanie, jeśli zgłoszenia o programy będą tego wymagać (wtedy: `.xlsx`, `.xls`, `.csv`, `.pdf`, `.docx`, maks. 10 MB, 1 plik, dostęp tylko admin).

## 8. Zachowania techniczne

### 8.1 „Twój projekt”
Wspólny `createListStore(key, parse)` wydzielony ze store'u `pk-cart` Biznesu (`useSyncExternalStore`), jeden klucz `pk-project` z `{ id, name }` (ADR-014 rozstrz. 9). Toast „Dodano do projektu” z akcją „Zobacz”. Maks. 30 pozycji.

### 8.2 Wyszukiwarka katalogu
`lib/search.ts` (Biznes B4) z indeksem `GET /api/solutions-index` (tylko domena Software, tag `solutions`, < 30 KB gzip). Synonimy startowe w `SoftwareSettings.search` (np. „excel” → z Excela do systemu; „grafik” → zlecenia, czas pracy; „rezerwacje” → strona dla hotelu lub pensjonatu, aplikacja do rezerwacji dla gości — „Rezerwacje online na stronie” wypadły z oferty w v20). Indeks i synonimy nie zawierają rozwiązań z `removed`. Ta sama wyszukiwarka w arkuszu menu (§3.2) i na stronie 404 (§6.11).

### 8.3 Interakcje z autoprzełączaniem
8 obszarów (5,5 s), podglądy, proces, technologie: zatrzymanie po interakcji, pauza przy ukrytej karcie (`document.hidden`), brak przy `prefers-reduced-motion`. Wszystkie zakładki to prawdziwe `role="tablist"` z obsługą strzałek.

### 8.4 Analityka (cookieless)
Zdarzenia (bez danych osobowych): `kreator_start`, `kreator_krok` (numer), `kreator_wynik` (wynik), `kreator_wyslij`, `projekt_dodaj`, `projekt_wyslij`, `audyt_wyslij`, `kontakt_wyslij`, `podglad_otworz`; od v20 także `menu_otworz` (arkusz menu), `pasek_klik` (pozycja dolnego paska), `formularz_blad` (formularz i pole, bez wartości). **Konwersja** = wejście na `/dziekujemy` + `kreator_wyslij`. Narzędzie wg `docs/architektura.md` (Umami, ADR-016 w SW12). Bez banera — dopóki narzędzie nie stawia ciasteczek.

### 8.5 Wydajność
Budżet jak w S10 (Lighthouse CI). Animacje tylko `transform`/`opacity`. Makiety podglądów to HTML/SVG, nie obrazy. Strona główna statyczna z rewalidacją (dane z Payload, tagi `tenant:<id>:…`). Kreator i interaktywne sekcje jako komponenty klienckie ładowane przy przewinięciu.

### 8.6 Telefon i tablet (v20) — zasady wspólne dla wszystkich stron
Plansze mają warstwę mobilną jako jedną sekcję CSS na końcu (`v20 · warstwa mobilna`). W kodzie: **komponenty**, nie kopia CSS.
- **≤ 1080 px:** nagłówek kompaktowy, dolny pasek i arkusze (§3.2); znika pasek linii, pozycje menu i szyna sekcji; hero i kreator w jednej kolumnie.
- **≤ 640 px:**
  - jedna kolumna, przyciski na całą szerokość (52 px wysokości);
  - **przewijane rzędy ze `scroll-snap`** zamiast siatek: pigułki obszarów, filtry, zakładki podglądów, etapy procesu, punkty zaufania, problemy branży;
  - **karuzele kart 84% szerokości** z widocznym brzegiem następnej (12 rzeczy, realizacje, fakty „bez WordPressa”, technologie i porównanie na `/o-firmie`);
  - **siatki 2×2**: kafle intencji, liczby, kafle danych rozwiązania, kafle potrzeby w kreatorze;
  - tabele jako karty (porównanie „bez WordPressa”, cennik); FAQ w jednej kolumnie; stopka w dwóch kolumnach.
- **Elementy przyklejone:** nagłówek (`position: sticky` na każdej stronie — kontener strony z `overflow-x: clip`, nie `hidden`, bo `hidden` psuje sticky); pigułki kroków kreatora pod nagłówkiem; „Dalej” w kreatorze i pigułka „Twój projekt” nad dolnym paskiem; pasek wyszukiwarki katalogu. Nie zasłaniają przycisków ani pól.
- **Safe area:** dolny pasek, pigułka i arkusze z `env(safe-area-inset-bottom)`; treść ma dolny odstęp pod pasek.
- **Arkusze** (menu, Twój projekt, filtry katalogu): `<dialog>`, focus trap, Esc, zamknięcie tapnięciem w tło, uchwyt u góry, maks. 92% wysokości ekranu z przewijaniem w środku.
- **Kryteria przed PR każdej sesji z UI** (plan, prompt „wzorzec telefonu”): przy 390 i 360 px brak poziomego przewijania strony (`document.scrollingElement.scrollWidth` = szerokość okna), nic nie wystaje poza ekran, cele dotyku ≥ 44 px (wyjątek: linki w zdaniu), tekst ≥ 12 px (wyjątek: miniatury w makietach), dolny pasek nie zasłania treści.

## 9. SEO i widoczność w AI

| Podstrona | title | description (do 155 znaków) | frazy główne |
|---|---|---|---|
| `/` | Strony, systemy i aplikacje dla firm — Rabka-Zdrój, Podhale \| PRO-KOM Software | `TODO(krystian)` w SW12 | strony internetowe Podhale, systemy dla firm, aplikacje dla firm |
| `/rozwiazania` | Pełna oferta: strony, systemy i aplikacje dla firm \| PRO-KOM Software (bez liczby — v20) | `TODO` | oprogramowanie dla firm, CRM dla małej firmy |
| `/rozwiazania/[slug]` | `<nazwa> \| PRO-KOM Software` | z leadu | nazwa rozwiązania + branża |
| `/dla-branz/[branza]` | jak `Branza` | `TODO` | program dla <branży> |
| `/miejscowosci/rabka-zdroj` | Strony internetowe Rabka-Zdrój \| PRO-KOM Software | `TODO` | strony internetowe Rabka, programista Rabka-Zdrój |
| `/dobierz` | Dobierz rozwiązanie w 60 sekund \| PRO-KOM Software | `TODO` | — |
| `/cennik` | Cennik stron, systemów i opieki \| PRO-KOM Software | `TODO` | ile kosztuje strona internetowa |
| `/audyt` | Darmowy audyt strony \| PRO-KOM Software | `TODO` | audyt strony internetowej |
| `/aktualnosci/[slug]` | tytuł wpisu | lead | temat wpisu |
| `/polityka-prywatnosci` | Polityka prywatności \| PRO-KOM Software | `TODO` | — |
| `/dziekujemy` | Dziękujemy \| PRO-KOM Software (`noindex`, poza sitemap) | — | — |

- Tytuły z plansz (`<title>`) są punktem wyjścia; opisy pisze Krystian w czacie przed SW12.
- JSON-LD: `Organization` + `LocalBusiness` (są z S7b), `Service` (rozwiązania, miejscowości), `FAQPage` (FAQ), `Article` (wpisy), `BreadcrumbList`, `ItemList` (katalog).
- **Widoczność w AI:** te same fakty w HTML (nie tylko w JS): kim jesteśmy, gdzie, co robimy, dla kogo, jak się skontaktować. Strony renderowane po stronie serwera. `robots.txt` nie blokuje botów wyszukiwarek AI, chyba że szef zdecyduje inaczej (§13).
- Sitemap z kolekcji (rozwiązania, branże aktywne, miejscowości aktywne, wpisy).
- Przekierowania 301: obecna prokomsoftware.pl — `TODO(krystian)`: lista starych adresów przed SW12 (sprawdzić, co jest dziś pod domeną).

## 10. Kryteria akceptacji
1. Strona główna i podstrony z mapy (etap 1, 16 plansz) wyglądają jak zrzuty przy 1440 i 390 px w obu motywach (porównanie Playwright, różnice wypisane w PR; oczekiwane różnice — ADR-015 rozstrz. 8 i v20).
2. Kreator: 3 ścieżki ze `stany/50–52` (z błędem formularza i wysłaniem) dają ten sam wynik i cenę co plansza; „Zapytaj o wycenę” = `stany/55`; „opisz po swojemu” wysyła formularz bez rekomendacji; zgłoszenie trafia do `Inquiries` z pełnym stanem; test e2e każdej ścieżki, także przy 390 px (`stany/87a–f`).
3. „Twój projekt”: dodaj z karty → licznik (desktop) / pigułka (telefon) → lista → wyślij → zgłoszenie z pozycjami → `/dziekujemy`; stan przetrwa przeładowanie i jest wspólny dla kart przeglądarki.
4. Katalog: filtry w URL, liczniki, wyszukiwanie z literówką („exel” → „Z Excela do systemu”), pusty wynik, arkusz filtrów na telefonie; `noindex` dla parametrów; „Rezerwacje online na stronie” nie istnieje w bazie, indeksie ani sitemap.
5. Formularze kontaktu i audytu: walidacja z komunikatami (§7.2), przejście na `/dziekujemy` z numerem `PKS-…`, mail do skrzynki Software.
6. axe bez naruszeń na `/`, `/rozwiazania`, `/dobierz`, `/kontakt`, `/audyt`, `/polityka-prywatnosci`, `/dziekujemy` i 404 w obu motywach; obsługa z klawiatury: mega menu, Twój projekt, zakładki, kreator, dolny pasek i arkusze (focus trap, Esc).
6a. Telefon: kryteria z §8.6 przy 390 i 360 px na każdej stronie (zero poziomego przewijania, cele dotyku ≥ 44 px, tekst ≥ 12 px, dolny pasek nie zasłania treści).
7. Lighthouse (telefon) na `/`, `/rozwiazania`, jednym rozwiązaniu: wydajność ≥ 90, dostępność 100, SEO 100 (budżet S10).
8. Trasy Software zwracają 404 na domenach innych linii (test izolacji jak S3/B1a); dane Software niewidoczne na innych domenach.
9. Na produkcji nie ma żadnego `[OD]`, `[TERMIN]`, `[X]`, `[CZAS…]`, `[TELEFON…]` itd. Teksty z placeholderami biorą wartości z `SiteSettings.software.facts` (`fillFacts`, ADR-014 §1.4); nierozwiązane nie są renderowane. Test: skan HTML przed wdrożeniem.
10. Brak nazw konkurencji w treściach (test: lista nazw z czatu w skanie treści).

## 11. Etapy
- **Etap 1 (produkcja):** wszystko z mapy oznaczone „1”. Treści (branże, miejscowości, strony rozwiązań, wpisy) dochodzą w panelu bez zmian w kodzie — szablony muszą być gotowe, treści nie blokują wdrożenia. Kolejność budowy i plan cięcia: `docs/zadania/prokomsoftware.md`.
- **Etap 2:** `/realizacje` z opiniami (gdy będą zgody), pozostałe 5 miejscowości, `/uslugi/*`, automatyczny wstępny audyt (pobranie wyników PageSpeed Insights API), kolejne wpisy, pełne treści pozostałych 18 rozwiązań.

## 12. Poza zakresem (świadomie)
- Płatności i konta klientów na stronie.
- Czat na żywo i chatbot (asystent AI jest ofertą, nie funkcją tej strony).
- Opinie klientów i logo klientów (do czasu pisemnych zgód).
- Ceny w kodzie, kalkulator kwot (ceny „od” z panelu wystarczą).
- Wersje językowe.

## 13. [SZEF] i fakty do sprawdzenia przed publikacją

Numery punktów są stałe (odsyłają do nich inne dokumenty); stan po v20 w treści punktu.

**Ceny, terminy i fakty — wpisane przez Krystiana 25.10 (v20), przed publikacją akceptacja szefa** (Asana „SZEF · Software: cennik”):
1. Ceny i terminy 29 rozwiązań — **wpisane** (`Solutions.prices` / `leadTimes` w seedzie, cennik `claude/software-cennik.md`); aplikacje i automatyzacje celowo bez ceny („Zapytaj o wycenę”).
2. Poziomy opieki — **wpisane**: Podstawowa 149, Standard 299, Systemy 790 zł / mies., z czasem reakcji i zakresem (pola bloku cennika).
3. Zasady płatności — **wpisane** (`[ZASADY PŁATNOŚCI]`: przy stronach 70% po odbiorze, przy systemach raty po każdym etapie; `[ZALICZKA]` 30%).
4. Czas odpowiedzi — **wpisany**: 1 dzień roboczy (`[CZAS ODPOWIEDZI]`), raport z audytu 2 dni robocze (`[CZAS]`).
5. Telefon i e-mail linii Software — **otwarte** (`SiteSettings.phone`, `SiteSettings.email`; w planszach `[TELEFON SOFTWARE]`, `[E-MAIL SOFTWARE]`); godziny **wpisane**: pn–pt 9:00–17:00 (`[GODZINY]`).

**Od szefa (otwarte):**
6. Adres i telefon salonu w Zakopanem (`[ADRES SALONU W ZAKOPANEM]`, `[TELEFON ZAKOPANE]`).
7. Osoba z obsługi klienta na stronie O firmie (`[IMIĘ I NAZWISKO]`, zdjęcie — zgoda).
8. Kto dostaje kopię powiadomień o zgłoszeniach Software.
9. Czy strona pozwala botom AI na indeksowanie (rekomendacja: tak).

**Krystian:**
10. `[WYNIK]` w PageSpeed — wpisać dopiero zmierzony wynik tej strony na produkcji.
11. `[MIESIĄC]` „najbliższy wolny termin” — pole w panelu, aktualizowane ręcznie (albo ukryte).
12. `[PRZYCHÓD]`, `[KWOTA]` w makietach — przykładowe, wyraźnie fikcyjne kwoty (`PRZYCHÓD` = „48 200 zł” w `fakty.json`; w branży przykładowe kwoty z planszy; makieta wyceny w procesie z kwotami z cennika — `proceduralMock`).

**Fakty do sprawdzenia (każdy ze źródłem):**
13. Próg szybkości — **zrobione w v20**: „treść w mniej niż 2,5 s” (próg Google LCP) w podglądzie „Strona” i w porównaniu „bez WordPressa”, zamiast „1,5 sekundy”.
14. Dostępność: data 28.06.2025 i zakres podmiotów (ustawa z 26.04.2024 o zapewnianiu spełniania wymagań dostępności niektórych produktów i usług) — brzmienie zdania na `/audyt`, w katalogu i w ofercie.
15. Liczby we wpisie WordPress i w sekcji „Dlaczego nie WordPress” (W3Techs, Patchstack: 7 966 luk w 2024 r.) — ponownie w dniu publikacji.
16. Nazwy linii PRO-KOM („Serwis” vs „Tech”) na `/o-firmie` i `/jedna-firma` — zgodnie z `docs/marka.md`.
17. „100+ klientów biznesowych” i „od 2004 r.” — potwierdzone przez szefa (są w danych firmy).

**Klucze faktów:** wszystkie placeholdery z tekstów są w `seed/prokomsoftware/fakty.json` (od v20 wypełnione wg §13 pkt 1–5; `null` = element ukryty na produkcji); jeden klucz = jedna wartość w całej stronie (ADR-014 rozstrz. 4: `[CZAS PIERWSZEGO ETAPU]`, `[OPIEKA OD]`; `{termin}` w tekstach rozwiązania = jego `leadTime`). Telefon i e-mail linii nie są faktami — `SiteSettings.phone` / `email`. Uzupełnienie = wpis w panelu (`SiteSettings.software.facts`). Nowe klucze v20: `[TELEFON ZAKOPANE]`, `[OKRES PRZECHOWYWANIA]`, `[DATA AKTUALIZACJI]`. Ceny w zdaniach: `{cena:<slug>}` = cena „od” rozwiązania z `Solutions` (ADR-014 v20), nie fakt.

**Poprawki tekstów z plansz — przyjęte w SW0 (22.10.2026, D13), wszystkie wg propozycji.** W kodzie obowiązuje tekst po poprawce; teksty z seeda poprawione w SW0, pozostałe (hero, eyebrow podglądów) przenosi sesja, która buduje sekcję. Przy porównaniu zrzutów to oczekiwane różnice:
18. Hero: „zdalnie cała Polska” → „zdalnie w całej Polsce”.
19. Eyebrow podglądów: „tego nie ma nikt na Podhalu” (nie do sprawdzenia, zasada 5) → „Podglądy na żywo · zanim zapłacisz”.
20. Pusta szuflada „Twój projekt”: „Chcę takie u siebie” → „+ Do projektu” (jak na kartach).
21. FAQ rozwiązania: zdanie „Najstarszy użytkownik naszego systemu serwisowego ma [WIEK] lat” usunięte.
22. Realizacje: opis prokombiznes.pl bez „porównywarki” (listopadowy etap Biznesu) i bez liczby produktów, która się zmienia (katalog v2): „Katalog sprzętu i programów z wyszukiwarką, filtrami i listą zapytań ofertowych.”

**v20 (25.10.2026) — decyzje i poprawki po audycie i niezależnym przeglądzie.** Obowiązują w kodzie i seedzie:
23. **Jeden cennik** dla prokomsoftware.pl i pro-kom.eu (decyzja Krystiana 25.10): obowiązuje cennik v20. pro-kom.eu/tworzenie-stron-internetowych wyrównujemy **osobnym zadaniem** (treść w panelu pro-kom.eu, poza tym repo): landing 1 499 → 1 299, strona firmowa z CMS 2 399 → 2 490, rozbudowana 3 499 → 6 990, wizytówka 999 bez zmian. Przed publikacją cen na obu stronach — akceptacja szefa.
24. **Polityka prywatności** (plansza `Polityka`) to projekt — akceptacja szefa/prawnika, `[OKRES PRZECHOWYWANIA]`, `[DATA AKTUALIZACJI]`. Do sprawdzenia zdania z planszy: chip „Serwery w Polsce” (dostawca hostingu — ADR-002 „przyjęta wstępnie”), punkt o newsletterze (strona go nie ma; kreator mówi „bez newslettera”), „budżet” w danych kreatora (kreator o budżet nie pyta), opis analityki (Umami — ADR-016 w SW12).
25. **Zdjęcia:** sesja przed produkcją (salony, zespół, praca przy komputerze) — każde miejsce na zdjęcie ma opis, co ma na nim być.
26. **Eksport danych:** co miesiąc tylko w Opiece Systemy (790 zł); wszędzie indziej „eksport na każde żądanie”, raport co miesiąc od poziomu Standard. Nie obiecujemy miesięcznego eksportu w FAQ, zasadach, technologiach ani na stronie rozwiązania.
27. **Terminy:** odpowiedź w 1 dzień roboczy ≠ wycena. Podgląd i wycena na piśmie: 5–7 dni (`[DNI]`). Budowa: 1–14 tygodni (`[TYGODNIE]`, wizytówka – portal B2B).
28. **RODO w „Dlaczego nie WordPress”:** za brak zgłoszenia naruszenia (art. 33) kara do 10 mln euro albo 2% obrotu — art. 83 ust. 4 (nie 20 mln / 4%).
29. **Pensjonat:** „Na start” i Standard = zapytanie o termin; zaliczka online tylko w wersji Pełnej — także w opisach obszaru „Sklepy i rezerwacje” (`scopeNotes.pensjonatStartStd`).
30. **Liczby rozwiązań:** „30 rozwiązań” usunięte z tekstów (tytuły, mega menu, SEO); licznik w katalogu liczony z danych.
