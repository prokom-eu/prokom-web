# Specyfikacja strony: prokomsoftware.pl

- **Status:** zaakceptowana przez Krystiana jako wizualizacja 18.10.2026, przebudowana po audycie jako **v20 (25.10.2026)** (telefon jak aplikacja, ceny, „Dlaczego nie WordPress i PHP”, strony prawne), potem **v21 + v22 (zaakceptowane 30.10.2026)**: **jedna cena „od” i jeden termin „od”** (wersji Na start / Standard nie ma nigdzie), okno szczegółów oferty z 29 miniaturami, kreator w 4 krokach z wyceną na żywo, ciemna stopka, kontakt z blokiem „Twój projekt”, 14 sekcji strony głównej. v20 wniesiona w SWD1, v21 + v22 w **SWD2 (30.10)** — `ZMIANY-v20.md` i `ZMIANY-v21.md` to już tylko historia; wzorcem wyglądu zostają plansze, zrzuty i stany v22 oraz `PRZEKAZANIE-v22.md` §2 (mapa zmian → kod). Ceny, terminy, poziomy opieki i czas odpowiedzi wpisał Krystian (25.10, v22 29.10) — przed publikacją akceptacja szefa (§13). Strona idzie na produkcję dopiero po akceptacji szefa w Asanie.
- **Tenant:** `software` · **Linia:** `software` · **Kolor:** Fiolet Kodu (wartości: ADR-015, `docs/design/prokomsoftware/tokens.css`).
- **Wzorzec wyglądu:** `docs/design/prokomsoftware/` (zrzuty, stany, plansze). **Model danych:** ADR-014. **Wygląd:** ADR-015. **Plan sesji:** `docs/zadania/prokomsoftware.md`. **Dane startowe:** `seed/prokomsoftware/`.
- **Cel biznesowy:** zapytania o strony, systemy, aplikacje i automatyzacje od firm z Podhala i Małopolski (zdalnie z całej Polski). Mierzymy:
  - liczbę zgłoszeń z formularzy (kontakt, kreator, „Twój projekt”, audyt) — `Inquiries`, linia `software`;
  - odsetek zgłoszeń z kreatora i z audytu;
  - wejścia z Google na strony rozwiązań, branż i miejscowości (Search Console).
- **Odbiorcy:** właściciele małych i średnich firm (pensjonaty, hotele, gastronomia, budowlanka i ekipy, warsztaty, gabinety, biura, producenci). Nie znają nazw technologii. Chcą zobaczyć efekt, cenę i termin.
- **Pojemność:** 2–3 projekty miesięcznie. Strona ma przyciągać dopasowane zapytania, nie maksymalną liczbę.

## 1. Twarde zasady
1. **Jedna cena „od” i jeden termin „od”, netto, z panelu** (v22: `Solutions.priceFrom`, `Solutions.leadTime` — np. „od 2 tygodni”; nigdy w kodzie ani na sztywno w JSON-ie kreatora). **Wersji Na start / Standard / Pełna nie ma** — ani w kreatorze, ani w oknie oferty, katalogu, na kartach, w cenniku czy w kontakcie. To, co jest w cenie „od”, opisuje lista „W cenie” (`Solutions.included`); więcej → „Potrzebujesz więcej? Np. … — wycenimy na piśmie w 5–7 dni.” (`Solutions.moreExamples`, nigdy z ceną). **Wyjątki z trzema pozycjami to usługi, nie wersje:** opieka (poziomy Podstawowa / **Rozszerzona** / Systemy) i audyt (3 rodzaje) — `Solutions.levels`. Puste pole ceny → **„Zapytaj o wycenę”**, pusty termin → „po krótkiej rozmowie” (`priceDisplay.fallback` / `termFallback`, decyzja SWD1 D1). Aplikacje i automatyzacje mają cenę celowo pustą (decyzja Krystiana 25.10).
2. **Nie podajemy liczby godzin pracy.** Wyceny są od projektu. Poziomy opieki mają „[X] h zmian w miesiącu” tylko wtedy, gdy szef tak zdecyduje.
3. **Nie wymieniamy konkurencji z nazwy.** Porównanie mówi o „freelancerze” i „agencji z dużego miasta”.
4. **SEO i widoczność w asystentach AI są w cenie każdego projektu** (komunikat na stronie: Cennik, FAQ, 8 obszarów). Tak samo ta strona: dane strukturalne, czytelne fakty, szybkość.
5. **Fakty tylko ze źródłem.** Każda liczba o rynku, przepisach albo progach Google ma źródło w treści (wpis, sekcja technologii) albo jest `TODO(krystian)`.
6. **Prywatność:** analityka bez ciasteczek (Umami, `docs/architektura.md`). Dopóki tak jest, liczba „0 banerów cookies” w pasku liczb sekcji Realizacje jest prawdziwa. Każda zmiana analityki = przegląd tego zdania.
7. **Teksty z plansz przenosimy bez zmian.** Zmiana tekstu = decyzja Krystiana w czacie i aktualizacja planszy albo seeda. **Przy różnicy tekstu między planszą v22 a `seed-v22/` wygrywa plansza** (sesja SWR poprawia seed i wypisuje różnice w raporcie; znane — plan §3a). Forma „Ty” w całym serwisie.
8. **Dostępność WCAG 2.1 AA** w obu motywach (axe bez naruszeń, klawiatura, `prefers-reduced-motion`).

## 2. Mapa strony

| Adres | Podstrona | Plansza | Skąd treść | Etap |
|---|---|---|---|---|
| `/` | Strona główna | `Main` | bloki Software w `Pages` (`home`) + kolekcje | 1 |
| `/rozwiazania` | Pełna oferta (29 rozwiązań; „Rezerwacje online na stronie” usunięte z oferty 25.10 — seed `removed`); klik w kartę = okno szczegółów oferty (§5.1) | `Katalog` | `Solutions`, `SolutionAreas` | 1 |
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
- Okno szczegółów oferty (§5.1): proponowany stan w adresie `/rozwiazania?rozwiazanie=<slug>` (do udostępniania; `noindex` + canonical do `/rozwiazania` jak filtry) — **do potwierdzenia przez Krystiana** (plan §3b, decyzja 1). Na stronie głównej i branży okno bez zmiany adresu.
- „Twój projekt” → **`/kontakt?projekt=1#formularz`** (każdy przycisk wysyłki listy; v21).
- Podziękowanie: `/dziekujemy?nr=PKS-RRRR-NNNN` (numer zgłoszenia nie jest daną osobową; bez numeru strona pokazuje ogólne podziękowanie). `noindex`, poza sitemap.
- Odnośniki z plansz (`Katalog.dc.html` itd.) zamieniamy według kolumny „Plansza” (README wzorca).

## 3. Elementy wspólne (każda podstrona)

### 3.0 Pasek górny (desktop > 1080 px, nad nagłówkiem)
Istniejący `BrandBar` (SW0, D15): po lewej „Linia firmy PRO-KOM · od 2004 r. · Rabka-Zdrój i Zakopane”, po prawej linki do innych linii (PRO-KOM Biznes, Instalacje) i telefon linii z `SiteSettings.phone`. Link „Tech” ukryty, dopóki linia Tech nie ma strony. Przy ≤ 1080 px znika (§3.2).

### 3.1 Nagłówek — desktop > 1080 px (plansza `Main`, stan `stany/01-menu-oferta.jpg`)
Kolejność od lewej: znak PRO-KOM Software → **Oferta ▾** → pigułka **Kreator 60 s** → **Darmowy audyt** → **O firmie** → **Aktualności** → **Kontakt** | po prawej: przełącznik motywu → **Twój projekt** (z licznikiem — **tylko przy niepustej liście**) → przycisk **Bezpłatna wycena**.
- **Oferta ▾ (mega menu):** 4 kolumny, 12 pozycji. **Nazwy pozycji = nazwy z `Solutions`** (v21/v22, plansza `Main`: „Strona firmowa z panelem”, „System zleceń i grafik ekip”, „Aplikacje na telefon”; `seed-v22/nawigacja.json` ma jeszcze stare nazwy — poprawia SWR2):
  - Strony (6): wizytówka, firmowa z panelem, rozbudowana, landing page, dla restauracji lub baru, dla hotelu lub pensjonatu;
  - Systemy (4): CRM, z Excela do systemu, zlecenia i grafik ekip, czas pracy;
  - Aplikacje i automatyzacje: aplikacje na telefon, automatyzacje;
  - Po wdrożeniu: Opieka, Cennik, Darmowy audyt;
  - karta bez liczby: „Strony, systemy i aplikacje dla firm z Podhala i nie tylko” → `/rozwiazania`;
  - rząd **„Dla branż”** pod kolumnami: chipy Budowlanka i ekipy, Pensjonaty i hotele, Gastronomia, Warsztaty i serwisy, Gabinety, „Wszystkie →”.
  Dane menu w `SiteSettings.software.navigation` (wzorzec `SiteSettings.biznes` z B3a; seed `nawigacja.json` → `header`, `headerRight`, `mega`), nie na sztywno.
- **Kreator 60 s:** na stronie głównej przewija do `#dobierz`, na podstronach prowadzi do `/dobierz`.
- **Twój projekt ▾** (`stany/02-twoj-projekt.jpg`, `okno-95-po-dodaniu`): lista rozwiązań dodanych z kart i okna oferty. **Nazwy koszyka wszędzie (v21, §13 pkt 31):** „+ Dodaj do wyceny” → „✓ W wycenie” → panel „Twój projekt” → **„Wyślij do wyceny →”** (`/kontakt?projekt=1#formularz`); `aria-label` przycisku „Dodaj do wyceny: <nazwa>”. Toast „Dodano do Twojego projektu” z linkiem „Zobacz projekt →” (bez zmian). Każda pozycja: nazwa, ×. Na dole „Wyślij do wyceny →” i „Wyczyść listę”. Pusta lista: `projectDrawer.empty` („Na razie pusto. Klikaj „+ Dodaj do wyceny” przy rozwiązaniach…” — plansza `Main`). **Nazwa w koszyku bez wersji** (v22); opieka i audyt z poziomem: „Opieka nad stroną i systemem · poziom Rozszerzona”, „Audyt strony lub programu · Pełny”. Stan w `localStorage`: jeden klucz `pk-project` z listą `{ id, name }` (nazwy bez zapytania do API; ADR-014 rozstrz. 9). Synchronizacja między kartami przez zdarzenie `storage`. Ceny pozycji liczy dopiero kontakt (§6.10) z `Solutions`, nigdy z tekstu nazwy.
- **Bezpłatna wycena:** → `#kontakt` na stronie głównej, `/kontakt` na podstronach.
- Przyklejony, tło `--header-bg` z rozmyciem.

### 3.2 Telefon i tablet ≤ 1080 px — „jak aplikacja” (stany `80`–`82`, zrzuty `*-390-*`)
Dane: `nawigacja.json` → `headerMobile`, `tabBar`, `mobileMenu`, `mobileMenuFooter`, `projectPill`, `projectDrawer` (`SiteSettings.software.navigation`).
- **Nagłówek kompaktowy:** tylko znak i przycisk **„Wycena”** (`/kontakt`; na stronie głównej `#kontakt`). Pasek linii (§3.0), pozycje menu, przełącznik motywu, „Twój projekt” i hamburger znikają z nagłówka. Nagłówek przyklejony (§8.6).
- **Dolny pasek** (`stany/82-mobile-pasek.jpg`, ciemny z aktywną „Ofertą”: `82b`): przyklejony do dołu z marginesem 10 px, tło `--header-bg` z rozmyciem, dolny odstęp `env(safe-area-inset-bottom)`. 5 pozycji: **Start** (`/`), **Oferta** (`/rozwiazania`), **Kreator** — wyróżniony okrągły przycisk na środku, wyniesiony nad pasek, w gradiencie akcentu (`/dobierz`; na głównej `#dobierz`), **Kontakt** (`/kontakt`), **Menu** (otwiera arkusz). Aktywna pozycja: kolor `--accent-text` + kreska `--accent` nad ikoną (wg adresu: `/` → Start, `/rozwiazania*` → Oferta, `/kontakt` → Kontakt, `/dobierz` → Kreator). Etykiety 12 px, cele dotyku ≥ 44 px. Treść strony ma dolny odstęp pod pasek.
- **Menu = arkusz od dołu** (`stany/80-mobile-menu.jpg`, `80b-mobile-menu-dol.jpg`): `<dialog>` z focus trap, Esc i zamknięciem tapnięciem w tło (wzorzec `<dialog>` z B3b). Od góry: uchwyt, „Menu” + zamknij; pole „Czego szukasz? np. zlecenia, pensjonat” (otwiera wyszukiwarkę katalogu `/rozwiazania`); karta **„Dobierz rozwiązanie · 4 krótkie kroki · 60 s · cena od razu”** (v21) w gradiencie akcentu; „Oferta”: 4 kafle z ceną „od” z `SolutionAreas` (Strony od 999 zł, Systemy od 2 990 zł, Aplikacje mobilne i Automatyzacje i AI „zapytaj o wycenę”); lista: Pełna oferta, Dla branż, Cennik, Darmowy audyt strony (plakietka „0 zł”); „Firma”: O firmie, Jedna firma do wszystkiego, Aktualności i poradnik, Kontakt; „Wygląd strony” — przełącznik Jasny/Ciemny (segment); przycisk „Bezpłatna wycena →”; telefon linii (`SiteSettings.phone`); stopka arkusza „PRO-KOM · ul. Orkana 16B, Rabka-Zdrój · od 2004 r.” (`mobileMenuFooter`).
- **„Twój projekt” na telefonie** (`stany/81a-mobile-pigulka-projektu.jpg`, `81-mobile-projekt.jpg`, `okno-99-main-modal-390-dodane`): pigułka nad dolnym paskiem **tylko przy niepustej liście** („Twój projekt · 2 · Zobacz →”; akcent „Zobacz →” z przeciwnego motywu — ADR-015 v20 pkt 4, kontrast ≥ 4,5:1) i **nie na `/kontakt`** (tam lista jest w formularzu, v21); otwiera arkusz z listą (nazwa, ×), „Wyślij do wyceny →” (`/kontakt?projekt=1#formularz`) i „Wyczyść listę”. Te same dane i store co na desktopie (§3.1, §8.1). W sekcji kreatora na `/` (i zawsze na `/dobierz`) dolny pasek chowa się, gdy belka ceny kreatora jest aktywna, i wraca po wyjściu z sekcji (§6.3).

### 3.3 Szyna sekcji (tylko strona główna, ≥ 1401 px)
Pionowa nawigacja po lewej z ikonami i nazwami sekcji (nazwy po najechaniu). **v22 — 11 pozycji jak `RAILI` planszy `Main`:** start, oferta, popularne („Najczęściej zamawiane”), podglady, dobierz, **jak-robimy** („Jak robimy”), bez-wordpressa, **technologie** („Z czego budujemy”), realizacje, **zasady** (`id="zasady"`, ZMIANY-v21 §10.4 — zmienia decyzję z 28.10), faq. Plansza v22 nie ma w szynie „proces” ani „kontakt” — w kodzie jak plansza (do potwierdzenia, plan §3b, decyzja 9). Kolejność §4, tylko sekcje obecne na stronie. Aktywna sekcja z `IntersectionObserver`. Do 1400 px włącznie ukryta.

### 3.4 Stopka — ciemna (v21, wszystkie strony)
Wzorzec: dół każdej planszy w `screens/*-1440-*` i `*-390-*`. Dane: `seed-v22/nawigacja.json` → `footer.v21` (SWR2 przenosi je do `SiteSettings.software.navigation.footer` jako nowy kształt — ADR-014 v22 pkt 9). Kolory: ADR-015 v22 (tokeny stopki wyłącznie z istniejącej palety).
- **Zawsze ciemna** (grafit; w ciemnym motywie ciemniejsza), z delikatną fioletową poświatą.
- **Pas CTA** (eyebrow „Masz pomysł albo problem do rozwiązania?”, H „Porozmawiajmy o Twojej firmie.”, tekst, przyciski „Dobierz rozwiązanie · 60 s” → `/dobierz` i „Bezpłatna wycena” → `/kontakt`). **Ukryty** na `/`, `/kontakt`, `/dziekujemy` i na każdej stronie, która kończy się własnym CTA (blok kontaktu §6.0, `swContact`, kreator na `/dobierz`) — **każda strona kończy się jednym CTA**. Reguła z oznaczenia w treści strony (komponent końcowego CTA niesie znacznik, stopka chowa pas), nie lista adresów w komponencie stopki (plan §3b, decyzja 6).
- **Kolumny:** znak + opis („… działającej na Podhalu od 2004 r.”) + 3 gwarancje (kod, domena i dane należą do Ciebie · serwer w Polsce, kopia co noc · cena i termin na piśmie) · Oferta · Firma · Kontakt (telefon i e-mail linii z `SiteSettings.phone` / `email`, Rabka + Zakopane, godziny i czas odpowiedzi, zasięg).
- **„Jedna firma, sześć adresów”:** karty linii PRO-KOM (Główna — pro-kom.eu, Biznes, Instalacje, Software — bieżąca, Tech — prokomserwis.pl, Zakopane) ze znakiem i kreską w kolorze linii **na ciemne** (`--c-<linia>-on-dark`, nie nowe hex). Ukryty na `/kontakt` (tam jest sekcja „Inne linie PRO-KOM”, §6.10). Telefon: karty w przewijanym rzędzie.
- **Pasek dolny:** © 2026, dane firmy z `CompanyData` (PRO-KOM Tadeusz Wójciak · ul. Orkana 16B, 34-700 Rabka-Zdrój · NIP 7352511447), „Polityka prywatności” (cel dotyku 44 px), „Bez ciasteczek śledzących” (prawdziwe, dopóki analityka jest bez ciasteczek — zasada 6), mapa strony.
- **Telefon:** kolumny w 2 kolumnach (Kontakt na całą szerokość), przyciski CTA jeden pod drugim, dolny margines pod dolny pasek.
- Link „Szukasz sprzętu, kas albo KSeF? PRO-KOM Biznes →” z v20 zastępuje karta Biznesu w „Jedna firma, sześć adresów”.

### 3.5 Motyw
Jasny i ciemny (ADR-015). Domyślnie preferencja systemu, wybór w `pk-theme`, skrypt przed pierwszym malowaniem (jest: `THEME_SCRIPT`). `software` jest w `DARK_THEME_LINES` (SW1). Przełącznik: na desktopie w nagłówku, na telefonie w arkuszu menu (§3.2).

## 4. Strona główna (`/`, plansza `Main`)

Kolejność sekcji jest **ustalona** (v21, decyzja Krystiana 30.10 — ścieżka klienta: co możemy zrobić → zobacz → dobierz → co dalej i za ile → dlaczego tak budujemy → dowody → zasady i pytania → kontakt): **14 sekcji** + stopka. Kolejność = kolejność bloków strony `home` w `Pages` (ADR-014 rozstrz. 7 i v20); `strona-glowna.json` → `homeOrder` służy tylko seedowi (v22: `seed-v22/strona-glowna.json`). Nie zmieniamy jej bez decyzji. **„Jak robimy” i „Z czego budujemy” (technologie) wróciły z `/o-firmie` na główną** (budujemy je w SWR5, nie w SW11b); porównanie „Freelancer, agencja czy PRO-KOM?” zostaje na `/o-firmie`. Wysokość: ok. **14 500 px przy 1440** i **17 400 px przy 390** (zrzuty `Main-*` v22) — nie dokładamy sekcji.

| # | Sekcja (id) | Nagłówek | Zachowanie (desktop) | Telefon (≤ 640 px, §8.6) | Dane | Zrzuty / stany |
|---|---|---|---|---|---|---|
| 1 | Hero (`start`) | „Strony, systemy i aplikacje **szyte pod Twoją firmę.**” | Eyebrow „Rabka-Zdrój · Podhale · zdalnie w całej Polsce”. Lead („…zanim zapłacisz. Cena i termin na piśmie. Firma z Rabki, od 2004 r.”), CTA „Dobierz rozwiązanie” (60 s) → `#dobierz`, „Zobacz podglądy” → `#podglady`. Pasek zaufania (odpowiedź w [CZAS ODPOWIEDZI], podgląd przed zakupem, kod i dane należą do Ciebie, firma na Podhalu od 2004) **zawija się** (bez przewijania). Po prawej makieta „Twój system”, która **składa się sama** do pierwszego dotknięcia (7 modułów, licznik, podpowiedź, „ZAKRES · na start / średni / etapami” zamiast „złożoność”); „Chcę taki system” dodaje jedną pozycję („system z N modułów”). | jedna kolumna, przyciski bez łamania; pasek zaufania zawijany; bez nieczytelnej makiety — zamiast niej „Złóż swój system: dotknij modułu” (moduły jako rząd) | `strona-glowna.json` → `heroModules`, blok `swHero` | `Main-1440-*/01.jpg`, `Main-390-*/01.jpg`, `stany/83` |
| 2 | Kafle intencji | 4 kafle | Jak v20 (z opisami; do katalogu z filtrem albo kreatora z potrzebą). | siatka 2×2, bez opisów | blok `swHero` | `01–02.jpg` |
| 3 | Oferta (`oferta`) | „Wszystko dla firmy, w ośmiu obszarach.” | Jak v20 (8 kafli, panel szczegółów, autoprzełączanie 5,5 s, strzałki). Obszar **„Sklepy i zamówienia”** (zamiast „Sklepy i rezerwacje”, bez „rezerwuje sam”). Ceny „od” z `SolutionAreas.priceFrom`/`priceLabel`. | pigułki obszarów w przewijanym rzędzie; **przyciski panelu obok siebie, bez łamania także przy 360 px** | `seed-v22/obszary.json` | `stany/10-obszary-1..8`, `84` |
| 4 | Najczęściej zamawiane (`popularne`) | „12 rzeczy, po które firmy przychodzą najczęściej.” | Filtry Wszystko / Strony / Systemy / Aplikacje / Automatyzacje z licznikami. **Karta z miniaturą** (`Solutions.thumbnail`), kategoria + „podgląd”, nazwa, opis, **„od X zł netto”** i **„od N tygodni”** — nazwa, opis, cena i termin **z danych rozwiązania** (te same co w katalogu; bez osobnych pól `featured`). **Klik w kartę = okno szczegółów oferty** (§5.1, ←/→ „n / 12”). v22: wszystkie 12 kart to rozwiązania — pozycje 11–12 to „Aplikacja dla ekip w terenie” i „Powiadomienia SMS i e-mail” (zamiast kart ogólnych; plansza `Main`). Pod siatką blok „A gdy już masz stronę lub system” (Opieka od 149 zł / mies., Przejęcie, Darmowy audyt) + „Pełna oferta”. | filtry w przewijanym rzędzie; karty w karuzeli 84%; okno jako arkusz od dołu | `SoftwareSettings.home.popular` (kolejność), `Solutions` | `stany/okno-99-main-grid-1440-light`, `-390-light`, `okno-99-main-modal-390-*` |
| 5 | Podglądy (`podglady`) | „Zobacz, jak to będzie wyglądać. Zanim zapłacisz.” | Jak v20; zakładka **„Noclegi”** (dawniej „Rezerwacje”): zapytanie o termin, bez kalendarza wolnych pokoi i zaliczki („Zapytaj o termin”); „Strona”: „Ty dostajesz maila od razu” (SMS = automatyzacja). | jak v20 | `seed-v22/strona-glowna.json` → `livePreviews` | `stany/30-podglad-1..5` |
| 6 | Kreator (`dobierz`) | jak `/dobierz` | §6.3 — ten sam komponent co `/dobierz` (v22: 4 kroki, wycena na żywo). **Przed procesem** (v21). | §6.3 (belka ceny; dolny pasek schowany w sekcji) | `seed-v22/kreator.json` | `stany/kreator-*` |
| 7 | Proces (`proces`) | „Od rozmowy do działającego systemu. **Większość płacisz po odbiorze.**” | Jak v20; budowa „od 1 tyg.”; etap 03: „Strona: 70% po odbiorze. System: rata po każdym odebranym etapie.”; raport „od opieki Rozszerzonej”; makieta wyceny = przykład wyceny na piśmie dla większego zakresu (`proceduralMock` v22). | etapy w przewijanym rzędzie **ze skrawkiem następnego etapu** | `seed-v22/strona-glowna.json` → `process`, `proceduralMock` | `stany/40-proces-etap-1..5` |
| 8 | **Jak robimy** (`jak-robimy`) — wraca z `/o-firmie` | Eyebrow „Jak robimy strony i systemy”, H2 „Nie składamy z gotowych klocków. **Piszemy pod Twoją firmę.**” | Lead + **3 karty**: Szybka („< 2,5 s”, próg Google ze źródłem), Bezpieczna („0 wtyczek”, kopia · aktualizacje · monitoring), Widoczna w Google i AI — każda z „Zyskujesz”. Bez dawnego podbloku „Dlaczego nie WordPress…” (powtarzał sekcję 9). Tło inne niż sekcje 9 i 10 (rytm). Kolory ilustracji ze zmiennych lokalnych z tokenów (`--ok`, `--warn`, `--ink*`). | karty w karuzeli | `SoftwareSettings.home.howWeBuild` (nowy klucz — teksty z planszy `Main` `#jak-robimy`, seed-v22 ich nie ma) | `Main-1440-*` (sekcja `#jak-robimy`) |
| 9 | Dlaczego nie WordPress i PHP (`bez-wordpressa`) | jak v20 | Jak v20 (3 fakty ze źródłem, tabela 6 wierszy, karta „Masz stronę na WordPressie?” z ceną przebudowy z `Solutions`). | jak v20; przyciski wyśrodkowane | `home.whyNotWordpress` | `stany/75`, `76`, `86` |
| 10 | **Z czego budujemy** (`technologie`) — wraca z `/o-firmie` | Eyebrow „Z czego budujemy i co z tego masz”, H2 „Twój system, warstwa po warstwie.” | Zwarte zakładki 6 warstw: co to, co z tego masz („Co zyskujesz”, „Dlaczego tak”), liczby z progami Google i źródłem. | **6 kafli warstw w siatce 2×3 + karta szczegółów** | `home.technologies` (`technologie.json`, bez zmian) | `stany/60-technologie-1..6` |
| 11 | Realizacje (`realizacje`) | „Najpierw zbudowaliśmy to dla siebie.” | Jak v20 (3 systemy własne, pasek liczb, [WYNIK] znika na produkcji). | karuzela, liczby 2×2 | `home.showcase` | |
| 12 | Zasady (`zasady`, **w szynie sekcji**) | „Zasady, których się trzymamy.” (eyebrow „Na piśmie, nie na słowo”) | 6 kart gwarancji + blok **„Czasem powiemy: tego nie buduj.”** (eyebrow „Uczciwa rada przed wyceną”, **wyśrodkowany**, przycisk „Zapytaj, co się opłaca →”) — gradient z palety (ADR-015 v20 pkt 5). | karty w karuzeli (78%); blok „Czasem powiemy” zwarty | `home.guarantees`, `home.sections.guarantees` | |
| 13 | FAQ (`faq`) | „Pytania, które słyszymy najczęściej” | 6 pytań, akordeon, JSON-LD `FAQPage`. **„Ile to trwa?” z terminami „od”** (wizytówka i landing od 1 tygodnia, strona firmowa od 2 tygodni, system od 2 tygodni — pierwszy moduł, rozbudowana i sklep od 5 tygodni) — tekst z planszy `Main` (`faq.json` w seedzie jeszcze stary, poprawia SWR5). | jedna kolumna | `faq.json` → `homeFaq` | |
| 14 | Kontakt (`kontakt`) | „Powiedz, co Cię boli. Resztą zajmiemy się my.” | Jak v20 (blok `swContact`); temat bez domyślnego zaznaczenia (ZMIANY-v21 §9). | jak v20 | `CompanyData`, blok `swContact` | `stany/77` |

Pasek „100+ klientów biznesowych” i rok 2004 są w danych firmy (`CompanyData`), nie w kodzie. Pas CTA stopki na `/` jest ukryty (sekcja kontaktu tuż nad stopką, §3.4).

**Typografia (v21):** twarde spacje po jednoliterowych słowach (w, i, z, o, a, u) w nagłówkach i leadach oraz w „od 2 tygodni”, „od 2 490 zł”, „w 5–7 dni” — w seedzie (nbsp) albo funkcją formatującą przy renderze nagłówków z panelu; etykiety ≥ 12 px na telefonie.

**Dane w skrypcie planszy `Main`, których nie przenosimy:** stare, niewyświetlane struktury `OF`/`ofItems` (dawny przegląd oferty), `KM2` (dawny prosty kreator) i tablica wyszukiwarki `S`. Źródłem treści jest seed.

## 5. Pełna oferta `/rozwiazania` (plansza `Katalog`)
- Eyebrow „Pełna oferta”, **H1 „Cała oferta, z ceną i terminem.”** (v21; bez liczby rozwiązań w tytule; licznik „N rozwiązań w pełnej ofercie” liczony z danych). Okruszki ze spacjami („Start / Pełna oferta”), cel dotyku 44 px.
- **Wyszukiwarka** (placeholder „np. zlecenia, pensjonat, Excel…”): normalizacja polskich znaków, synonimy z `SoftwareSettings.search`, tolerancja literówek. `lib/search.ts` z Biznesu (B4), indeks `/api/solutions-index` — bez drugiej wyszukiwarki.
- **Filtry** (w URL, z **prawdziwymi** licznikami — oznaczenia w `rozwiazania.json`, te same w oknie oferty):
  - kategoria (`?kategoria=`, `Solutions.category`): Wszystko / Strony / Systemy / Aplikacje / Automatyzacje / Opieka i audyt;
  - **„Od czego zaczynasz”** (`?sytuacja=`): Zaczynam od zera (Z, 14) · **Mam już stronę lub program** (R, 13; dawniej „Mam program, brakuje mu czegoś”) · Mam kilka programów (P, 8);
  - branża: 8 grup (`branze.json` → `groups`), 10–14 pozycji każda (opieka, przejęcie, audyt i przebudowa — w każdej); przykład kontrolny: Budowlanka + Zaczynam od zera = 6 pozycji;
  - przełącznik „z podglądem na żywo”.
- **Karta** (`stany/okno-99-katalog-karty-*`): **miniatura** (`Solutions.thumbnail`, §5.2), kategoria + „podgląd”, nazwa, opis, **„od X zł netto”** i **„termin od N tygodni”** (z `priceFrom` / `leadTime`). Bez punktów „Standard: …”, bez rozwinięcia w miejscu i bez listy wersji. **Klik w kartę = okno szczegółów oferty** (§5.1). „+ Dodaj do wyceny” → „✓ W wycenie” (§3.1).
- Ceny wg kategorii (z `Solutions`, nigdy w kodzie): aplikacje i automatyzacje „Zapytaj o wycenę” · „po krótkiej rozmowie” (puste ceny); opieka „od 149 zł / mies.”; przejęcie „od 990 zł” jednorazowo, termin „od 2 dni”; audyt „0 zł” (cena 0 = darmowy, nie „brak ceny”), „2 dni robocze”.
- **Pusty wynik:** „Wyczyść filtry” + „Napisz, czego szukasz” (kontakt) i kreator w trybie „opisz po swojemu”.
- **Jeden blok kontaktu na końcu** (§6.0) — pas CTA stopki ukryty.
- **Telefon** (`stany/88a`, `88b`, `okno-99-katalog-karty-telefon*`): kategorie w przewijanym rzędzie; przyklejony pasek z wyszukiwarką i „Filtry (n)” → arkusz (sytuacja, branża, „Tylko z podglądem na żywo”, „Wyczyść”, „Pokaż N rozwiązań”); karty w jednej kolumnie z miniaturą (wiersz kategorii o stałej wysokości — karty w rzędzie równe).
- JSON-LD `ItemList` z `Service`. `noindex` dla wariantów z parametrami (także `?rozwiazanie=`).

### 5.1 Okno szczegółów oferty — komponent wspólny (katalog, „12 rzeczy”, branża)
Jeden komponent (`<dialog>`) używany w katalogu (SWR3), w „12 rzeczach” na głównej (SWR5) i na kartach rozwiązań strony branży (SW10). Wzorzec: `stany/okno-90…98` (desktop jasny/ciemny: strona, pensjonat, system, aplikacja „zapytaj”, opieka z poziomami, dół okna, po dodaniu; telefon: góra, „W cenie”, dół, system ciemny, automatyzacja, opieka, audyt). Treść wg ZMIANY-v21 §10.2 z poprawką §11.2 (jedna cena):
- **Pasek górny:** ← / → z licznikiem („1 / 29” w katalogu, „n / 12” na głównej), okruszek „Oferta · <kategoria>”, ×.
- **Nad zgięciem:** plakietka kategorii + „podgląd na żywo”, nazwa (H2 okna), jedno zdanie „co to daje” (`lead`), fakty **„Termin od N tygodni”** i **„Dla kogo”** (`forWhom`); **karta „W cenie”** z ceną **„od X zł netto”**, 3 punktami (`included`) i notą **„Potrzebujesz więcej? Np. <moreExamples> — wycenimy na piśmie w 5–7 dni.”** (przejęcie: „Dokumentacja i przeniesienie na nasz serwer? Wycenimy po sprawdzeniu, co zastaliśmy.”); uwaga rozwiązania (pensjonat: „Zapytanie o termin jest w cenie. Rezerwacja z zaliczką online to osobna wycena.”; opieka: „Opieka nie jest obowiązkowa…”; audyt: „Pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni.”). Obok: miniatura (§5.2), „Zobacz podgląd na żywo” (gdy `hasLivePreview`), **3 gwarancje**: „Wycena na piśmie, ważna 30 dni” · płatność wg typu (strony i sklep: „30% zaliczki, reszta po odbiorze”; systemy, aplikacje, automatyzacje: „30% zaliczki, reszta ratami po etapach”; przejęcie i audyt: „Płacisz po wykonaniu”) · własność wg typu („Kod, domena i dane są Twoje” / „Kod, panel i dane…” / „Kod, aplikacja i dane…”; przejęcie: „Dostępy zapisane na Twoją firmę”).
- **Aplikacje i automatyzacje** (bez ceny): zamiast karty „W cenie” — „Cena zależy od ekranów (programów), które już masz. Po krótkiej rozmowie dostajesz cenę i termin na piśmie.”
- **Opieka i audyt:** zamiast karty „W cenie” — **wybór poziomu / rodzaju** (karty z ceną i czasem reakcji / terminem, plakietka „Polecamy” przy `recommended`; domyślnie opieka Rozszerzona, audyt Szybki; na telefonie polecany pierwszy w rzędzie) i **tabela porównania** (✓ / „+ dochodzi”, klik w kolumnę wybiera poziom) — **tylko tu**, nigdzie indziej tabeli wersji nie ma. W tabelach żadnych zaprzeczeń z ptaszkiem; „Połączenia z innymi programami — osobna wycena” jako przypis.
- **Niżej:** „W cenie każdego projektu” / „Co dostajesz” (4–6 punktów bez powtórzeń z „W cenie”), **„Przykład z życia”** (oznaczony „Przykład”, `example`), „Dla kogo” (tylko pasujące sytuacje Z / R / P), **„Jak to wygląda”** (4 kroki z czasem: rozmowa dziś lub jutro → podgląd i wycena na piśmie 5–7 dni → budowa od N tygodni → odbiór i opieka od 149 zł / mies.; przejęcie, opieka i audyt mają własne kroki), „Co od Ciebie” (strony: logo, zdjęcia, teksty, domena; reszta: krótka rozmowa) z podpowiedzią, **3 pytania** (m.in. „Co jest w cenie od X zł?” i „A jeśli potrzebuję więcej?” z `moreExamples`), **„Dobrze łączy się z”** (`related`, 3 karty z miniaturą — klik przełącza okno; tylko opublikowane rozwiązania tego tenanta). Cień przy dolnej krawędzi = sygnał przewijania.
- **Dolny pasek (lepki):** „od X zł netto · Termin od N tygodni” (opieka: „Opieka · poziom X”, audyt: „Audyt <rodzaj>”, bez ceny: „Cena i termin”) · „Dobierz w kreatorze” (drugorzędny) · **jeden główny przycisk „+ Dodaj do wyceny”** → po dodaniu **„Wyślij do wyceny →”** (`/kontakt?projekt=1#formularz`) i fokus na nim. Koszyk zapisuje nazwę bez wersji (opieka / audyt z poziomem, §3.1).
- **Telefon ≤ 640 px:** arkusz od dołu z uchwytem; nad zgięciem nazwa, fakty, „W cenie” albo wybór poziomu; miniatura pod nimi w pełnej szerokości; lepki pasek ceny z głównym przyciskiem nad bezpieczną strefą. Tablet ≤ 980 px: jedna kolumna.
- **Dostępność:** `<dialog>` (`aria-modal`), focus trap, powrót fokusu na kartę, Esc, klik w tło, ←/→ między rozwiązaniami, `prefers-reduced-motion`; tytuł okna = nazwa (`aria-labelledby`).
- **Adres:** proponowany `?rozwiazanie=<slug>` tylko na `/rozwiazania` (§2) — do potwierdzenia.
- **Źródło treści:** pola `Solutions` (ADR-014 v22 pkt 1–4) i teksty wspólne kategorii (kroki, „Co od Ciebie”, płatność, gwarancje, pytania wzorcowe) — gdzie je trzymać, plan §3b, decyzja 2–3.

### 5.2 Miniatury rozwiązań
29 unikalnych ilustracji (`docs/design/prokomsoftware/miniatury/<slug>.svg`, płaska scena 280×170 w kolorze kategorii, własne tło, bez nazw realnych firm) → w kodzie `public/software/rozwiazania/<slug>.svg` + pole `Solutions.thumbnail` (ścieżka; ADR-014 v22 pkt 3). Używane w kartach katalogu, „12 rzeczach”, kartach branży, nagłówku okna i kartach „Dobrze łączy się z”. Dekoracyjne: `alt=""`, `loading="lazy"` poza pierwszym rzędem; plakietki w ilustracji (np. „EKIPY · STATUS”) nie dublujemy w HTML. W ciemnym motywie lekko przyciemnione (ADR-015 v22 pkt 4). Brak miniatury → scena kategorii (dzisiejszy `CardScene`) do czasu usunięcia w SWR3.

## 6. Podstrony

### 6.0 Zasady wspólne podstron (v20, v21)
- Przyklejony nagłówek (§3, §8.6), okruszki pod nagłówkiem, na końcu **blok kontaktu** (kreator · bezpłatna wycena · telefon linii), stopka z linkami prawnymi.
- **Każda podstrona kończy się jednym CTA** (v21): strona z własnym blokiem kontaktu na końcu ukrywa pas CTA ciemnej stopki (§3.4). Hero podstron wygasa łagodnie, pierwsza sekcja ma odstęp; kontener strony bez sztywnej min-wysokości (koniec strony = stopka).
- Telefon: jedna kolumna, przyciski na całą szerokość, przewijane rzędy zamiast siatek 3–4 kolumn, siatki liczb 2×2 (§8.6). Wzorzec: `screens/<Plansza>-390-light`.
- Ceny i terminy zawsze z `Solutions` (zasada 1): jedna cena „od” (`priceFrom`) i jeden termin „od” (`leadTime`), opieka i audyt z `levels`; w tekstach `{cena:<slug>}` = `priceFrom` rozwiązania (ADR-014 v20, v22 pkt 1).

### 6.1 Rozwiązanie `/rozwiazania/[slug]` (plansza `Rozwiazanie`, wzór: aplikacja dla ekip w terenie)
Sekcje: hero (eyebrow z branżami, H1, lead, CTA „Chcę takie u siebie” (dodaje do projektu) + „Jak to działa, krok po kroku”, 4 kafle danych: cena, pierwszy etap, działa na, opieka) → **klikalne demo telefonu** („To nie jest film. Klikaj po telefonie.”, dane `demo-aplikacja-ekip.json`) → „Dziś / Z aplikacją / Efekt (mierzymy po wdrożeniu)” → „Co dostajesz” (w cenie „od”) i „Wyceniane osobno” → „Z przeglądarki czy ze sklepu?” → „Często łączone z” (3 rozwiązania) → FAQ rozwiązania z zasadami płatności (JSON-LD) → kontakt.
- **v22 (SW10):** ceny i terminy „od” (`priceFrom`, `leadTime`), „Co dostajesz” = `included`, „Wyceniane osobno” = `moreExamples`, „Często łączone z” = `related`; teksty z planszy `Rozwiazanie` v22 (aplikacja: opieka **Systemy 790 zł / mies.**).
- Kafle danych: cena z `Solutions` (aplikacja: „Zapytaj o wycenę · na piśmie, w [CZAS ODPOWIEDZI]”), „Pierwszy etap [CZAS PIERWSZEGO ETAPU]” („3–4 tyg.”), opieka „od [OPIEKA OD] zł / mies.”.
- Demo telefonu tylko dla rozwiązań z `hasLivePreview` i własnym demo; pozostałe pokazują makietę z obszaru (scena z `obszary.json`). **Telefon** (`stany/89a-mobile-rozwiazanie.jpg`): hero w jednej kolumnie, kafle danych 2×2; zamiast pomniejszonego laptopa **interaktywny telefon w czytelnym rozmiarze** + karta „Tablica w biurze, na żywo”.
- Rozwiązania bez pełnej treści: szablon z danych karty (lead, cechy, dla kogo, sytuacje, powiązane) + kontakt. Pełne treści dla pozostałych pisze Krystian w czacie (plan, §5).
- Eksport danych: nie obiecujemy miesięcznego eksportu (§13 pkt 26 — tylko w Opiece Systemy).
- JSON-LD `Service` + `BreadcrumbList` + `FAQPage`; `offers` z ceną „od” tylko, gdy rozwiązanie ma cenę (puste → bez `offers`).

### 6.2 Branża `/dla-branz/[branza]` (plansza `Branza`, wzór: budownictwo i ekipy)
Sekcje: hero (H1 „Oprogramowanie dla firm, które pracują w terenie, nie przy biurku.”) → „Kliknij swój problem. Pokażemy, co na to mamy.” (lista problemów → panel z rozwiązaniem, cechami i CTA) → układ modułów wokół firmy („Na budowie w Zębie nie ma LTE. Aplikacja o tym wie.”) → „Sześć rzeczy, od których zaczynają firmy takie jak Twoja” (ceny na kartach z `Solutions`: zlecenia od 3 490, czas pracy i wyceny PDF od 2 990, strona od 2 490; aplikacja i faktury „Zapytaj o wycenę”) → „Złóż system dla swojej firmy. **W 60 sekund.**” (tytuł z `Industries.software.wizardTitle`, CTA do kreatora z `?firma=`) → **„Zanim zapytasz” — FAQ branży (4 pytania, wspólne pole `Industries.faq`, JSON-LD `FAQPage`)** → ciemny blok kontaktu „Pokaż, jak dziś pracują Twoje ekipy.”.
- **v22 (SW10):** karty rozwiązań z miniaturą (§5.2), „od X zł netto” / „termin od N tygodni” i „+ Dodaj do wyceny”; klik = okno szczegółów oferty (§5.1, `stany/okno-99-branza-karty-1440-light`). Jeden blok kontaktu na końcu; „zaliczka 30%, potem raty po etapach”; bez nazw programów firm trzecich; „W górach zasięg bywa słaby” zamiast nazwy miejscowości.
- Przykładowe kwoty w treściach zamiast `[KWOTA]` (z planszy).
- Telefon: mapa modułów jako siatka 2 kolumn z kartą „3 ekipy” na górze; problemy i „Działa bez zasięgu” w przewijanych rzędach.
- 12 rekordów w seedzie (`branze.json` → `pagesAtStart`, z grupą i rodzajem firmy do kreatora): budownictwo i wykończenia, instalatorzy, ekipy montażowe, pensjonaty i apartamenty, hotele, gastronomia, atrakcje i wypożyczalnie, gabinety i rehabilitacja, warsztaty i serwisy, transport, producenci regionalni, biura rachunkowe.
- Treść budowlanki jest w `branze.json` → `budowlanka`. **Pozostałe 11 = treść do napisania w czacie** (problemy, moduły, 6 rozwiązań), każda unikalna. Strona bez treści nie jest publikowana (`active=false`).

### 6.3 Kreator `/dobierz` i sekcja `#dobierz` (plansza `Kreator`, stany `kreator-d-*`, `kreator-m-*`) — v22
Jeden komponent w dwóch miejscach. Reguły to **dane** (`SoftwareSettings.wizard`, schemat Zod; od SWR4 nowy kształt z `seed-v22/kreator.json` — ADR-014 v22 pkt 6), nie `if` w komponentach. Reguły, które plansza trzyma w skrypcie, dokłada seed jako pola JSON (ADR-014 „Doprecyzowania SW7”, w SWR4 przepisane bez rozmiarów).

**Nagłówek:** eyebrow „Dobierz rozwiązanie · 60 sekund”, H „Kilka kliknięć. Cena, termin i podgląd od razu.”, plakietki **„4 krótkie kroki · cena na żywo · wycena na piśmie”** (`badges`). Wszędzie jedna obietnica: „4 krótkie kroki · 60 s” (karta w menu, strona branży „W 60 sekund”).

**Kroki** (pigułki z paskiem; telefon: „Krok X z 4”): **Potrzeba → Szczegóły → Zakres i termin → Wynik** (`steps`). „Opisz po swojemu”: **Potrzeba → Twój opis → Wynik** (`stepsOwn`). Kroku „Opis” nie ma — opis jest opcjonalny w kroku 3 („Twoje słowa” w wyniku).

1. **Potrzeba** — 8 dużych kafli z ikoną w gradiencie, opisem i **ceną od razu** (`tileHints`: „od 1 999 zł”… / „Zapytaj o wycenę”; kwota z `Solutions`, nie z JSON — plan §3b, decyzja 10): „Strona dla firmy” (firmowa, pensjonat albo lokal), Rozbudowana strona, Strona wizytówka, Landing page, **„Przebudowa starej strony”** (jedna nazwa w całej ofercie), Program dla firmy, Aplikacja, Automatyzacje; pod spodem „Opisz po swojemu”. 4 w rzędzie (telefon 2×2).
2. **Szczegóły** — pytanie zależne od potrzeby (`needs[x].q`, opcje `o`), np. „Jaka to firma?”, „Co dziś najbardziej przeszkadza?”, co nie działa w starej stronie (`rebuildIssues`). „Strona dla firmy” + „Sklep i handel” → **podpowiedź sklepu** „Chcesz sprzedawać online? Sklep internetowy od … zł, od … tygodni” przełączająca wynik na sklep i z powrotem (`shopHint`).
3. **Zakres i termin** — **jedna karta „W cenie od X zł netto · od N tygodni”** z listą „W cenie” (`scope.<wynik>.included`) i **lista „Potrzebujesz czegoś więcej?”** (`scope.<wynik>.moreExamples`, 3–4 pozycje z dopiskiem „do wyceny”; zaznaczenie **nie zmienia ceny „od”**, nota „Dodatki wycenimy na piśmie w 5–7 dni. Cena „od” to podstawa, dopłatę za dodatki zobaczysz w wycenie.”); rozbudowana: wybrane funkcje — w cenie (`featuresInPrice`) albo do „Do wyceny na piśmie”; plakietka **„Twoje rozwiązanie”** i zdanie „dlaczego to” (`recommend`); uczciwy komunikat, gdy może wystarczyć mniej (`honest`); „Co już masz?” / adres obecnej strony (`haves`, `url`); „na kiedy” (Jak najszybciej / Przed sezonem zimowym / Przed latem / Bez pośpiechu) z notką (`whenNotes`; **data „jeśli zaczniemy do 30 listopada” liczona w kodzie z bieżącej daty wg zasady w ustawieniach**, nie wpisana na sztywno — plan §3b, decyzja 11); opcjonalny opis z podpowiedziami (`tileHints`/`phrases`). Aplikacje i automatyzacje: „Aplikację wyceniamy indywidualnie — cenę i termin dostaniesz na piśmie w 5–7 dni.” (`priceDisplay.noPrice`).
4. **Wynik** — karta rozwiązania („Twoje rozwiązanie” + rodzaj), nazwa, „W cenie”, kafle **„Cena od X zł”** („netto · stałą cenę dostaniesz na piśmie”) i **„Termin od N tygodni”** („od podpisania umowy” — tylko przy rozwiązaniach z ceną), uwaga (pensjonat: zaliczka online osobno — `scopeNotes.pensjonat`), „Co będzie potrzebne od Ciebie” z licznikiem „Masz X z Y” (strony: teksty, zdjęcia, domena; reszta: krótka rozmowa), **„Do wyceny na piśmie”** (zaznaczone dodatki), **„Często dobierane razem”** (`addOns`: karta z „+ Dodaj”, trafia do podsumowania wyceny), „Twoje słowa”, notka terminu, „Zacznij od nowa”.

**Wycena na żywo:** desktop — lepka prawa kolumna (podgląd projektu, nazwa, cena „od”, termin „od”, „W cenie”); telefon — lepka belka nad dolną krawędzią (cena, termin, „Dalej / Pokaż wynik / Poproś o wycenę ↓”; bez ceny: „Zapytaj o wycenę”), podgląd zwinięty („Pokaż podgląd projektu”). **Dolny pasek nawigacji chowa się, gdy sekcja kreatora jest w widoku** (na `/dobierz` zawsze), także na tablecie 641–1080 px, i wraca po wyjściu. Do kroku 3 cena „od” potrzeby, od kroku 3 cena „od” rozwiązania — bez plakietki wersji.

**Blok wysyłki** (prawa kolumna wyniku; telefon: pod wynikiem): „Ostatni krok · **Dokąd wysłać wycenę?**” + „Dostaniesz ją na piśmie: zakres, cenę i termin. Decydujesz potem, bez zobowiązań.”; **bilet „Twoja wycena · szkic”** (nazwa, cena netto, termin, „+ do wyceny: …”; **bez pola „Wersja”**; bez ceny: cena „do wyceny”, termin „do ustalenia”); „Jak wolisz rozmawiać?” — segment z ikonami w jednym rzędzie (Telefon · E-mail · Spotkanie · Online); pola z etykietami „Imię” i drugie zależne od sposobu kontaktu; zgoda w jednej linii (klauzula z `consent.ts`); **przycisk zawsze aktywny** „Poproś o wycenę — odezwiemy się w 1 dzień roboczy”, błędy przy polach dopiero po kliknięciu (`send.errors`); 3 ikony zaufania (odpowiedź w 1 dzień roboczy · wycena na piśmie w 5–7 dni · bez zobowiązań, bez newslettera).

**Sukces na miejscu** (decyzja SWD1 D4 bez zmian): „Wysłane · PKS-RRRR-NNNN”, „Dziękujemy, <imię>. Zgłoszenie jest u nas. Wycenę na piśmie dostaniesz w 5–7 dni.”, bilet „przyjęta”, oś czasu (dziś → do 1 dnia roboczego → 5–7 dni), ważność 30 dni. Zdania o kopii zgłoszenia mailem nie ma (dopóki kod jej nie wysyła z kreatora — `confirmationEmail` sprawdzić w SWR4).

- **Stan początkowy podglądu:** „Tu zobaczysz swój projekt” (bez pływających mini-kart przy `prefers-reduced-motion`).
- **Telefon** (`stany/kreator-m-a-*`, `kreator-m-b-*`): kafle 2×2 mieszczą się w ekranie, pigułki kroków przyklejone, belka ceny z pełnym tłem, krótszy wstęp; na `/dobierz` bez dolnego paska.
- **Wysyłka:** `submitInquiry()` z `type: 'wizard'`; przeglądarka wysyła odpowiedzi (potrzeba, szczegóły, „co już masz” / adres, kiedy, **dodatki jako lista id z `moreExamples` i `addOns`**, opis, sposób kontaktu), serwer sprawdza je z regułami tenanta, wybiera wynik, zapisuje rozwiązanie w `items[].solution` i składa `message` (dodatki jako „+ do wyceny: …”); `preferredContact` z `contactPrefs[].inquiryValue`.
- **Parametry URL:** `?potrzeba=`, `?firma=`, `?tryb=opis` (bez zmian).
- Mapowanie potrzeba → wynik (`mapping`, bez zmian względem v20) + wynik **`sklep`** (z podpowiedzi sklepu; w `seed-v22/kreator.json` brakuje wpisu `results.sklep` — SWR4 dopisuje go z planszy).

### 6.4 Cennik `/cennik` (plansza `Cennik`) — v22
H1 „Ceny bez gwiazdek. **Na piśmie.**” (eyebrow „Cennik · ceny netto”; lead „Wszystkie 29 rozwiązań w jednym miejscu. Każde z ceną „od” i terminem. Dokładną kwotę za Twój zakres dostajesz na piśmie w 5–7 dni…”) → „Wybierz, czego szukasz.”: **29 pozycji w 5 zakładkach** (te same dane co katalog), **tabela: rozwiązanie · cena „od” z terminem „od” · „W cenie”** (`priceFrom`, `leadTime`, `included`) — jedna kolumna ceny, bez wersji; aplikacje i automatyzacje „Zapytaj o wycenę” → „Spokój co miesiąc. Bez długich umów.”: opieka, **3 poziomy z `levels`** (Podstawowa 149 · **Rozszerzona** 299 „Polecamy” · Systemy 790 zł / mies.) z czasem reakcji i zakresem; przyciski **„Zapytaj o opiekę Podstawową / Rozszerzoną / Systemy →”** do `/kontakt?poziom=<podstawowa|rozszerzona|systemy>` → audyt 3 rodzaje (0 / 990 / 1 990 zł, `levels`) → „Tego nie dopłacasz” (W cenie każdej strony: projekt pod Twoją firmę, wersja na telefon, formularz i mapa, podstawy SEO i widoczność w AI…) → FAQ o cenach z **„Co oznacza cena „od”?”** → CTA kreator/kontakt.
- Ceny poziomów opieki i rodzajów audytu: `Solutions.levels` (ADR-014 v22 pkt 2) — zastępują „pola bloku cennika” z v20. Pusty poziom → wiersz ukryty. Rozwiązania bez ceny → „Zapytaj o wycenę” (zasada 1). Bez przekierowania 302.
- Eksport danych co miesiąc tylko w poziomie Systemy; **raport co miesiąc od poziomu Rozszerzona**; w pozostałych „eksport na każde żądanie” (§13 pkt 26). Na telefonie polecany poziom pierwszy w rzędzie.
- Telefon (`stany/89b-mobile-cennik.jpg`): tabela jako karty.

### 6.5 Darmowy audyt `/audyt` (plansza `Audyt`)
H1 „Sprawdzimy Twoją stronę. Za darmo.” → formularz z etykietami: adres strony + **„Imię”** + e-mail/telefon + **checkbox zgody** (ADR-014 rozstrz. 6; od v20 też w planszy), walidacja (lista błędów, §7.2) → po wysłaniu `/dziekujemy` (§7.2; plansza pokazuje też stan „Przyjęte. Raport dla {adres} wyślemy w ciągu [CZAS].” z 3 krokami) → przykład raportu (5 obszarów: szybkość, telefon, Google i AI, bezpieczeństwo, dostępność) → „Pięć rzeczy, które decydują, czy strona zarabia.” (5 kart + wyróżniona karta „Raport na piśmie”) → „Zacznij za darmo. Głębiej, gdy trzeba.”: **3 rodzaje z `Solutions.levels` audytu** — Szybki 0 zł · 2 dni robocze, **Pełny 990 zł · 1 tydzień („Polecamy”**, nie „Najczęściej”), Strona + program albo dostępność 1 990 zł · 2 tygodnie — z dopiskiem „pełny audyt odliczamy od projektu zamówionego w ciągu 60 dni” → „Trzy kroki. Zero zobowiązań.” → FAQ → CTA „Wolisz od razu nową stronę?”.
- Wysyłka: `type: 'audit'`, pole `auditUrl` (walidacja: http/https, domena), `message` składa serwer („Audyt strony: <adres>”), bez pobierania tej strony przez serwer (audyt robi człowiek; automatyzacja = etap 2).
- Zdanie o dostępności: „Od 28.06.2025 część usług cyfrowych musi to spełniać” — sprawdzić brzmienie z ustawą o zapewnianiu spełniania wymagań dostępności (§13).

### 6.6 O firmie `/o-firmie` (plansza `ONas`)
H1 „Firma z Rabki. Od 2004 roku.” — hero z **kolażem zdjęć** (salony, zespół) zamiast liczb → „Konkretnie, bez dmuchania.” (liczby tylko tu: 2004, 100+, 2 salony, 5 linii) → „Pracujesz z firmą. Nie z jedną osobą.” (ciągłość, na miejscu, na piśmie) → **„Freelancer, agencja czy PRO-KOM?”** (porównanie: tabela 3 kolumn, na telefonie przełącznik kolumny, bez nazw firm; `compare`; `stany/70-porownanie-agencja.jpg`; sekcja `swHomeSection`) — **v21: „Jak robimy” i „Z czego budujemy” wróciły na stronę główną (§4, sekcje 8 i 10; SWR5)**, na `/o-firmie` ich nie ma
→ historia „Najpierw sprzęt i serwis. Potem własne systemy.” — **oś czasu z `[ROK]`** przy wydarzeniach bez potwierdzonej daty (salon w Zakopanem, autoryzowany serwis kas; uzupełnia szef — §13 pkt 32), linie z „Tech” (nie „Serwis”); „Ciągłość” bez obietnicy zastępstwa („kod, dostępy i dokumentacja uporządkowane i zapisane w umowie — projekt przejmie każdy programista”), „Pracujesz z firmą, która działa od 2004 r.”; bez obietnicy zespołu developerów → „Kto z Tobą pracuje.” (Krystian Potaczek, Tadeusz Wójciak, [IMIĘ I NAZWISKO] — zdjęcia tylko za zgodą) → „Dwa salony. Ludzie na miejscu.” (Rabka, Zakopane [ADRES SALONU W ZAKOPANEM], ze zdjęciami) → CTA.
- Miejsca na zdjęcia (komponent zdjęcia z opisem, co ma na nim być) — do sesji zdjęciowej przed produkcją (§13 pkt 25). Bez zdjęcia: opis-zaślepka nie trafia na produkcję.
- Telefon: porównanie jako karuzela / przełącznik kolumny (`stany/70`).

### 6.7 Jedna firma do wszystkiego `/jedna-firma` (plansza `Wszystko`)
H1 „Strona, program, sprzęt i serwis. W jednej firmie.” → „Każda robi swoje. Razem robią całość.” (5 linii PRO-KOM; odnośniki tylko do istniejących domen: prokombiznes.pl, prokominstalacje.pl, prokomserwis.pl) → „Dwa przykłady z Podhala.” (opisowe, bez nazw klientów do czasu zgody) → „Jeden kontakt zamiast pięciu.” → **„Dwa salony z ludźmi na miejscu.”** (nowa w v20, zdjęcia obu salonów) → CTA. Nazwy linii zgodne z `docs/marka.md`: **pięć linii z „Tech” zamiast „Serwis”** (v21); przykład pensjonatu: „strona z zapytaniem o termin w kilku językach” (bez rezerwacji z zaliczką).

### 6.8 Aktualności `/aktualnosci` i wpis (plansze `Aktualnosci`, `Wpis`)
- Blog jest w Aktualnościach (decyzja 18.10). Lista (H1 „Konkretnie o stronach i systemach.”): wyróżniony wpis + siatka, kategorie (Poradnik, Nowości, Realizacje) z **osobną ilustracją dla każdej kategorii**, daty z `Posts.publishedAt` (w planszy przykładowe); na telefonie lista kompaktowa.
- Wpis: H1, lead, **autor i data**, czas czytania, treść z nagłówkami H2, **CTA audytu w środku tekstu**, **źródła z datą sprawdzenia i linkami** (`Posts.sources`; „Ostatnie sprawdzenie danych” = data weryfikacji źródeł, nigdy przyszła), **ramka autora ze zdjęciem**, **3 powiązane wpisy**, powiązane rozwiązania. JSON-LD `Article` + `BreadcrumbList`.
- **Jedna data na wpis** (lista i wpis zgodne; różne daty wpisów w liście — v21).
- Na start 1 wpis: „WordPress czy strona pisana od zera?” (dane W3Techs i Patchstack — przed publikacją ponownie sprawdzić liczby i datę).
- Trasa wspólna z Biznesem (B11a, ADR-012 rozstrz. 5) — SW11b dokłada tylko wygląd Software.

### 6.9 Miejscowości `/miejscowosci/[miasto]` (plansza `Miasto`, wzór: Rabka-Zdrój)
H1 „Strony i systemy dla firm z Rabki-Zdroju.” → „Dla kogo pracujemy najczęściej.” (branże lokalne, ceny na kartach z `Solutions`) → „Blisko, czyli prościej.” → „Najczęściej pytacie o to” (FAQ lokalne `Cities.faq`, ceny przez `{cena:<slug>}`) → „Pracujemy też w okolicy” (okoliczne miejscowości jako chipy, **bez linków** do nieaktywnych stron) → „Wpadnij do salonu przy Orkana 16B.” (zdjęcie salonu).
- Na start: **Rabka-Zdrój**. Potem: Zakopane, Nowy Targ, Mszana Dolna, Limanowa, Nowy Sącz.
- **Zasada przeciw „doorway pages”** (wytyczne Google o spamie): każda strona ma unikalną treść (lokalne branże, dojazd/spotkanie, lokalne pytania, realne powiązanie z firmą). Strona bez unikalnej treści nie jest publikowana. Raba Wyżna, Chabówka, Skomielna Biała itp. tylko na liście „w okolicy”, bez własnych stron.
- JSON-LD `Service` z `areaServed` (miasto). Bez fałszywych adresów: `LocalBusiness` tylko z prawdziwymi oddziałami.

### 6.10 Kontakt `/kontakt` (plansza `Kontakt`) — v21
Wzorzec: `screens/Kontakt-*`, `stany/kontakt-90…99c`.
- **Hero:** H1 „Napisz, zadzwoń albo wpadnij. **Odpowiemy z konkretem.**” + lead („…w 1 dzień roboczy odezwie się osoba, która potem buduje Twój projekt”) + **karta godzin z żywym statusem** (otwarte / zamknięte, czas w Polsce; [GODZINY] „pn–pt 9:00–17:00”) + **4 karty kanałów**: telefon linii (`SiteSettings.phone`, „Najszybciej”), e-mail linii (`SiteSettings.email`, „odpowiedź w ciągu [CZAS ODPOWIEDZI]”), salon Rabka lub Zakopane, online.
- **Formularz `#formularz`** (2 kolumny; po lewej ciemny panel z osią **„Co dalej po wysłaniu”**: 1 dzień roboczy — odpowiadamy → 30 minut — krótka rozmowa → 5–7 dni — podgląd i wycena na piśmie → Ty decydujesz, zaliczka 30%; skróty do kreatora i audytu; na telefonie formularz **przed** osią). Nagłówek „Formularz · **Opisz, co chcesz usprawnić.**”. Pola: temat (6 kafli: Strona, System lub panel, Aplikacja, Rozbudowa, Opieka lub ratunek, Audyt — **bez domyślnego zaznaczenia**), opis z podpowiedziami zależnymi od tematu, „Imię i firma”, „Telefon albo e-mail” (rozpoznaje, co wpisano), sposób rozmowy, zgoda; lista błędów (`stany/kontakt-93-blad`, `97b`); sukces z numerem i 3 krokami zależnymi od sposobu kontaktu → `/dziekujemy?nr=…` (decyzja SWD1 D4 bez zmian).
- **Blok „Twój projekt”** nad polami (gdy lista `pk-project` jest niepusta albo adres ma `?projekt=1`; `stany/kontakt-99b-twoj-projekt-1440`, `99c-…-390`): pozycje z miniaturą, nazwą, „termin od N tygodni”, **„od X zł”** i ×; **suma „Razem od (netto)”** (jednorazowe; opieka osobno „zł/mies.” — cena poziomu z nazwy albo „od 149 zł/mies.”; aplikacje i automatyzacje „po rozmowie”); „+ Dodaj coś jeszcze” → `/rozwiazania`; nota „Lista pójdzie razem ze zgłoszeniem. Dokładną cenę i termin dostaniesz na piśmie w 5–7 dni.”. **Temat ustawia się sam** wg pierwszej pozycji (klient może zmienić); przy niepustej liście opis jest **opcjonalny** („Dodaj kilka słów o firmie (opcjonalnie)”) — `message` składa wtedy serwer z tematu i listy. Lista idzie ze zgłoszeniem jako `items` (`[{ id, name }]` → `Inquiries.items` z relacją `solution`, ceny liczone z `Solutions`, nie z tekstu nazwy). Sukces „Wysłane razem z: …”, potem lista `pk-project` czyszczona. Pusty `?projekt=1` → komunikat z linkiem do oferty. Adres z `?projekt=1` przewija do `#formularz`.
- `?poziom=<podstawowa|rozszerzona|systemy>` (z „Zapytaj o opiekę X →” w cenniku): temat „Opieka lub ratunek” i poziom wpisany do opisu.
- **„Inne linie PRO-KOM”** („Potrzebujesz czegoś innego niż oprogramowanie?”; karty Biznes, Instalacje, Tech, Zakopane, Wszystkie linie — znak z kolorem linii, opis, link; nazwy jak w stopce) + „Jedna firma do wszystkiego →”. Na `/kontakt` stopka bez pasa CTA i bez pasa linii (§3.4); pigułka „Twój projekt” na telefonie ukryta (§3.2).
- **„Gdzie się spotkamy”**: makieta mapy z „Nawiguj” (statyczny obraz z linkiem do Map Google, bez ciasteczek), 4 miejsca (Rabka-Zdrój — salon, ul. Orkana 16B; Zakopane — [ADRES SALONU W ZAKOPANEM]; u Ciebie w firmie — Podhale i Małopolska; online), dane firmy, NIP; bez listy miejscowości dojazdu (ZMIANY-v21 §10.5 — „do decyzji”; w planszy jej nie ma, więc nie budujemy). **FAQ kontaktowe (4)**. JSON-LD `LocalBusiness` z `CompanyData`.
- Telefon: `stany/kontakt-96…99`, `89c-mobile-kontakt.jpg`.

### 6.11 Strony prawne, podziękowanie i 404
- **Polityka prywatności `/polityka-prywatnosci`** (plansza `Polityka`, H1 „Twoje dane. Krótko i po ludzku.”): baner „Wersja robocza do sprawdzenia przed publikacją”, chipy zaufania, spis treści (8 punktów; na telefonie przewijane chipy), administrator, jakie dane zbieramy, cele i podstawy z RODO (tabela), okres przechowywania [OKRES PRZECHOWYWANIA], odbiorcy, prawa z art. 15–21, cookies i statystyki (analityka bez ciasteczek), [DATA AKTUALIZACJI]. **v21: bez punktu o newsletterze** (strony go nie ma). Własna strona tenanta `software` w `Pages` (jak strony prawne Biznesu z B11b, `src/seed/biznes/legal.ts`), nie wspólna treść. **Projekt — przed produkcją akceptacja szefa/prawnika**; baner „wersja robocza” nie trafia na produkcję. Treść do sprawdzenia: §13 pkt 24.
- **Mapa strony `/mapa-strony`** — jak Biznes (B11b: ta sama lista co `sitemap.xml`).
- Bez strony cookies, dopóki nie ma ciasteczek innych niż niezbędne.
- **Dziękujemy `/dziekujemy`** (plansza `Dziekujemy`, H1 „Dziękujemy, mamy to.”): numer zgłoszenia z `?nr=` (§2), 3 kolejne kroki, linki do podglądów i aktualności („Zobacz, jak to wygląda u innych.”); `noindex`, poza sitemap; wejście = konwersja (§8.4). **v21: bez zdania o potwierdzeniu e-mailem, bez bloku „Porozmawiajmy”, bez KSeF i bez pasa CTA w stopce** (zastępuje wcześniejszą zasadę o kopii e-mail na tej stronie).
- **404** (plansza `NieZnaleziono`, H1 „Tej strony tu nie ma. Reszta jest.”): wyszukiwarka z podpowiedziami (indeks katalogu §8.2), karta kreatora, „Dokąd chcesz pójść?” — 6 kafli popularnych miejsc. Status HTTP 404 (`not-found.tsx` w ramce linii — dziś wspólny tekst dla wszystkich linii; wersja Software w SW11b). Treść kafli: `SoftwareSettings` (ADR-014 v20).

## 7. Formularze

| Formularz | Pola | Typ (`Inquiries.type`) | Gdzie trafia | Kto dostaje powiadomienie |
|---|---|---|---|---|
| Kontakt (główna, `/kontakt`) | temat (Strona, System lub panel, Aplikacja mobilna, Rozbudowa, Opieka lub ratunek, Audyt), opis, imię i firma, e-mail albo telefon, zgoda | `contact` (`topics`) | `Inquiries`, linia `software` | `software@pro-kom.eu` (+ kopia szefa — §13) |
| Twój projekt (`/kontakt?projekt=1#formularz`, v21 — ten sam formularz z blokiem „Twój projekt”, §6.10) | jak wyżej + pozycje (`[{ id, name }]`); opis opcjonalny przy niepustej liście | `list` (`items[]` z `nameSnapshot` i relacją `solution`; temat w `topics`) — kształt potwierdzić w SW11a (dziś `list` nie niesie tematu) | jw. | jw. |
| Kreator (v22) | odpowiedzi (potrzeba, szczegóły, co już masz / adres, kiedy, **dodatki „do wyceny”**, opis), sposób kontaktu, imię, kontakt, zgoda | `wizard` | jw. | jw. |
| Audyt | adres strony, imię, e-mail albo telefon, zgoda | `audit` (nowy) | jw. | jw. |

### 7.1 Zasady wspólne
- Wszystko przez `submitInquiry()` i `POST /api/inquiry` (ADR-003): honeypot, podpisany token, limit, maile, retencja. Numer `PKS-RRRR-NNNN` (jest od B1b).
- Jedno pole „E-mail albo telefon” → rozpoznanie po formacie, zapis do `email` albo `phone`.
- Kontakt: temat to jeden wybór, **bez domyślnego zaznaczenia** (v21; zmienia doprecyzowanie SW8b pkt 4 — sesja SWR5 dla strony głównej, SW11a dla `/kontakt`); wymagane: temat, opis (poza listą „Twój projekt”), imię, kontakt, zgoda.
- `preferredContact`: rozszerzyć o `meeting` (spotkanie w salonie) i `online`; kreator mapuje `tel→phone`, `mail→email`, `salon→meeting`, `online→online`.
- Bez danych osobowych w logach. Zgoda: treść z `consent.ts` (`TODO(krystian)` z S8b), checkbox przy **każdym** formularzu z linkiem do `/polityka-prywatnosci`.

### 7.2 Błędy i sukces (v20)
- **Błędy:** etykiety nad polami; przy błędzie czerwone obramowanie pola, komunikat pod polem i ramka z listą błędów nad przyciskiem (fokus na pierwszym błędnym polu). Teksty błędów kreatora w `kreator.json` → `send.errors` (brak kontaktu, brak zgody); pozostałe formularze — te same teksty. Stany: `stany/77-kontakt-blad-zgody.jpg`, `kontakt-93-blad`, `kontakt-97b-mobile-blad`, `kreator-d-a-4-blad`, `kreator-m-a-4-blad`. Nieaktywny przycisk wysyłki: tło `--chip`, wyraźnie nieaktywny.
- **Sukces — kontakt, „Twój projekt” i audyt:** przejście na `/dziekujemy?nr=PKS-RRRR-NNNN` (§6.11; decyzja SWD1 D4). Plansze pokazują też kartę sukcesu na miejscu (numer + 3 kroki) — to treść strony `/dziekujemy`.
- **Sukces — kreator:** na miejscu (v22, §6.3): „Wysłane · PKS-RRRR-NNNN”, „Dziękujemy, <imię>. Zgłoszenie jest u nas. Wycenę na piśmie dostaniesz w 5–7 dni.”, bilet „przyjęta”, oś czasu.
- **Błędy kreatora v22:** przycisk wysyłki zawsze aktywny, błędy przy polach po kliknięciu (`stany/kreator-d-a-4-blad`, `kreator-m-a-4-blad`).
### 7.3 Plik w kreatorze — poza etapem 1 (SW0, D7)
- W etapie 1 **nie ma pola pliku**; przy „Program dla firmy” kreator mówi: „Plik możesz dosłać mailem po kontakcie”.
- Powód: prywatny magazyn plików (`InquiryFiles`, ADR-014 §3.2) to nowy katalog poza `Media`, kopie, retencja i testy. Wraca jako osobne zadanie, jeśli zgłoszenia o programy będą tego wymagać (wtedy: `.xlsx`, `.xls`, `.csv`, `.pdf`, `.docx`, maks. 10 MB, 1 plik, dostęp tylko admin).

## 8. Zachowania techniczne

### 8.1 „Twój projekt”
Wspólny `createListStore(key, parse)` wydzielony ze store'u `pk-cart` Biznesu (`useSyncExternalStore`), jeden klucz `pk-project` z `{ id, name }` (ADR-014 rozstrz. 9). Toast „Dodano do Twojego projektu” z akcją „Zobacz projekt →”. Maks. 30 pozycji. **v21/v22:** przyciski „+ Dodaj do wyceny” / „✓ W wycenie”, wysyłka „Wyślij do wyceny →” do `/kontakt?projekt=1#formularz`; nazwa bez wersji (opieka / audyt z poziomem: „… · poziom Rozszerzona”); po wysłaniu z kontaktu lista czyszczona.

### 8.2 Wyszukiwarka katalogu
`lib/search.ts` (Biznes B4) z indeksem `GET /api/solutions-index` (tylko domena Software, tag `solutions`, < 30 KB gzip). Synonimy startowe w `SoftwareSettings.search` (np. „excel” → z Excela do systemu; „grafik” → zlecenia, czas pracy; „rezerwacje” → strona dla hotelu lub pensjonatu, aplikacja do rezerwacji dla gości — „Rezerwacje online na stronie” wypadły z oferty w v20). Indeks i synonimy nie zawierają rozwiązań z `removed`. Ta sama wyszukiwarka w arkuszu menu (§3.2) i na stronie 404 (§6.11).

### 8.3 Interakcje z autoprzełączaniem
8 obszarów (5,5 s), podglądy, proces, technologie (na głównej od v21), makieta hero (składa się sama): zatrzymanie po interakcji, pauza przy ukrytej karcie (`document.hidden`), brak przy `prefers-reduced-motion`. Wszystkie zakładki to prawdziwe `role="tablist"` z obsługą strzałek.

### 8.4 Analityka (cookieless)
Zdarzenia (bez danych osobowych): `kreator_start`, `kreator_krok` (numer), `kreator_wynik` (wynik), `kreator_wyslij`, `projekt_dodaj`, `projekt_wyslij`, `audyt_wyslij`, `kontakt_wyslij`, `podglad_otworz`; od v20 także `menu_otworz` (arkusz menu), `pasek_klik` (pozycja dolnego paska), `formularz_blad` (formularz i pole, bez wartości); **od v22 `oferta_okno` (otwarcie okna szczegółów, slug), `oferta_dodaj` (dodanie z okna), `kreator_dodatek` (zaznaczenie „Potrzebujesz czegoś więcej?”, id dodatku)**. **Konwersja** = wejście na `/dziekujemy` + `kreator_wyslij`. Narzędzie wg `docs/architektura.md` (Umami, ADR-016 w SW12). Bez banera — dopóki narzędzie nie stawia ciasteczek.

### 8.5 Wydajność
Budżet jak w S10 (Lighthouse CI). Animacje tylko `transform`/`opacity`. Makiety podglądów to HTML/SVG, nie obrazy. Strona główna statyczna z rewalidacją (dane z Payload, tagi `tenant:<id>:…`). Kreator i interaktywne sekcje jako komponenty klienckie ładowane przy przewinięciu.

### 8.6 Telefon i tablet (v20) — zasady wspólne dla wszystkich stron
Plansze mają warstwę mobilną jako jedną sekcję CSS na końcu (`v20 · warstwa mobilna`). W kodzie: **komponenty**, nie kopia CSS.
- **≤ 1080 px:** nagłówek kompaktowy, dolny pasek i arkusze (§3.2); znika pasek linii, pozycje menu i szyna sekcji; hero i kreator w jednej kolumnie.
- **≤ 640 px:**
  - jedna kolumna, przyciski na całą szerokość (52 px wysokości);
  - **przewijane rzędy ze `scroll-snap`** zamiast siatek: pigułki obszarów, filtry, zakładki podglądów, etapy procesu, punkty zaufania, problemy branży;
  - **karuzele kart 84% szerokości** z widocznym brzegiem następnej (12 rzeczy, realizacje, fakty „bez WordPressa”, „Jak robimy”, porównanie na `/o-firmie`; „Zasady” 78%), `scroll-padding-inline: 18px` (pierwsza karta przy marginesie);
  - **siatki 2×2**: kafle intencji, liczby, kafle danych rozwiązania, kafle potrzeby w kreatorze; warstwy technologii 2×3;
  - tabele jako karty (porównanie „bez WordPressa”, cennik); FAQ w jednej kolumnie; stopka w dwóch kolumnach.
- **Elementy przyklejone:** nagłówek (`position: sticky` na każdej stronie — kontener strony z `overflow-x: clip`, nie `hidden`, bo `hidden` psuje sticky); pigułki kroków kreatora pod nagłówkiem; belka ceny kreatora (dolny pasek wtedy schowany, §6.3) i pigułka „Twój projekt” nad dolnym paskiem; lepki pasek ceny w arkuszu okna oferty; pasek wyszukiwarki katalogu. Nie zasłaniają przycisków ani pól.
- **Safe area:** dolny pasek, pigułka i arkusze z `env(safe-area-inset-bottom)`; treść ma dolny odstęp pod pasek.
- **Arkusze** (menu, Twój projekt, filtry katalogu, okno oferty na telefonie): `<dialog>`, focus trap, Esc, zamknięcie tapnięciem w tło, uchwyt u góry, maks. 92% wysokości ekranu z przewijaniem w środku.
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
1. Strona główna i podstrony z mapy (etap 1, 16 plansz) wyglądają jak zrzuty przy 1440 i 390 px w obu motywach (porównanie Playwright z planszami v22, różnice wypisane w PR; oczekiwane różnice — ADR-015 rozstrz. 8, v20 i v22).
2. Kreator (v22): ścieżki ze `stany/kreator-d-a…d-f` (pensjonat krok po kroku z błędem i wysłaniem, program, przebudowa, aplikacja „Zapytaj o wycenę”, „opisz po swojemu”, ciemny) i `kreator-m-a`, `m-b` dają tę samą cenę „od”, termin „od”, „W cenie” i dodatki „do wyceny” co plansza; zaznaczony dodatek nie zmienia ceny; zgłoszenie trafia do `Inquiries` z odpowiedziami i dodatkami; test e2e każdej ścieżki przy 1440 i 390 px; na telefonie dolny pasek schowany w sekcji kreatora.
3. „Twój projekt”: „+ Dodaj do wyceny” z karty albo okna → licznik (desktop) / pigułka (telefon) → lista → „Wyślij do wyceny →” → `/kontakt?projekt=1#formularz` z blokiem „Twój projekt” (suma „Razem od (netto)”) → zgłoszenie z pozycjami → `/dziekujemy`, lista wyczyszczona; stan przetrwa przeładowanie i jest wspólny dla kart przeglądarki.
3a. Okno szczegółów oferty (§5.1): otwiera się z karty katalogu, „12 rzeczy” i branży; klawiatura (Tab w pułapce, Esc, ←/→), powrót fokusu, po dodaniu fokus na „Wyślij do wyceny →”; tabela poziomów tylko dla opieki i audytu; axe w obu motywach, także jako arkusz przy 390 px.
4. Katalog: filtry w URL, prawdziwe liczniki (Z 14 · R 13 · P 8; Budowlanka + Zaczynam od zera = 6), wyszukiwanie z literówką („exel” → „Z Excela do systemu”), pusty wynik, arkusz filtrów na telefonie; `noindex` dla parametrów; „Rezerwacje online na stronie” nie istnieje w bazie, indeksie ani sitemap.
5. Formularze kontaktu i audytu: walidacja z komunikatami (§7.2), przejście na `/dziekujemy` z numerem `PKS-…`, mail do skrzynki Software.
6. axe bez naruszeń na `/`, `/rozwiazania`, `/dobierz`, `/kontakt`, `/audyt`, `/polityka-prywatnosci`, `/dziekujemy` i 404 w obu motywach; obsługa z klawiatury: mega menu, Twój projekt, zakładki, kreator, dolny pasek i arkusze (focus trap, Esc).
6a. Telefon: kryteria z §8.6 przy 390 i 360 px na każdej stronie (zero poziomego przewijania, cele dotyku ≥ 44 px, tekst ≥ 12 px, dolny pasek nie zasłania treści).
7. Lighthouse (telefon) na `/`, `/rozwiazania`, jednym rozwiązaniu: wydajność ≥ 90, dostępność 100, SEO 100 (budżet S10).
8. Trasy Software zwracają 404 na domenach innych linii (test izolacji jak S3/B1a); dane Software niewidoczne na innych domenach.
9. Na produkcji nie ma żadnego `[OD]`, `[TERMIN]`, `[X]`, `[CZAS…]`, `[TELEFON…]`, `[ROK]` itd. Teksty z placeholderami biorą wartości z `SiteSettings.software.facts` (`fillFacts`, ADR-014 §1.4); nierozwiązane nie są renderowane. Test: skan HTML przed wdrożeniem.
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

Numery punktów są stałe (odsyłają do nich inne dokumenty); stan po v20 i v22 w treści punktu.

**Ceny, terminy i fakty — wpisane przez Krystiana 25.10 (v20), przed publikacją akceptacja szefa** (Asana „SZEF · Software: cennik”):
1. Ceny i terminy 29 rozwiązań — **wpisane**; od v22 **jedna cena „od” i jeden termin „od”** (`Solutions.priceFrom` / `leadTime` w `seed-v22/rozwiazania.json`, tabela ZMIANY-v21 §11.1: wizytówka 999 · od 1 tygodnia, landing 1 299 · od 1 tygodnia, strona firmowa z panelem 2 490 · od 2 tygodni, przebudowa 1 499 · od 2 tygodni, restauracja i pensjonat 1 999 · od 2 tygodni, rozbudowana 6 990 · od 5 tygodni, sklep 8 990 · od 5 tygodni, wyceny PDF / Excel / czas pracy / kalendarz sal 2 990 · od 2 tygodni, grafik zajęć / CRM / serwis / zlecenia / magazyn / portal B2B 3 490 · od 3 tygodni, przejęcie od 990 · od 2 dni); aplikacje i automatyzacje celowo bez ceny („Zapytaj o wycenę”). Zakresy „W cenie” (`included`) i „Przykład z życia” (`example`) — do akceptacji szefa razem z cennikiem.
2. Poziomy opieki — **wpisane**: Podstawowa 149, **Rozszerzona** (v22, dawniej „Standard”) 299, Systemy 790 zł / mies., z czasem reakcji (do końca następnego dnia roboczego / 8 h / 4 h roboczych) — `Solutions.levels`; audyt: Szybki 0 · 2 dni robocze, Pełny 990 · 1 tydzień, Strona + program albo dostępność 1 990 · 2 tygodnie. Nazwa „Rozszerzona” — do akceptacji szefa.
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
20. Pusta szuflada „Twój projekt”: „Chcę takie u siebie” → „+ Do projektu” (jak na kartach). **v21: „+ Dodaj do wyceny” — pkt 31.**
21. FAQ rozwiązania: zdanie „Najstarszy użytkownik naszego systemu serwisowego ma [WIEK] lat” usunięte.
22. Realizacje: opis prokombiznes.pl bez „porównywarki” (listopadowy etap Biznesu) i bez liczby produktów, która się zmienia (katalog v2): „Katalog sprzętu i programów z wyszukiwarką, filtrami i listą zapytań ofertowych.”

**v20 (25.10.2026) — decyzje i poprawki po audycie i niezależnym przeglądzie.** Obowiązują w kodzie i seedzie:
23. **Jeden cennik** dla prokomsoftware.pl i pro-kom.eu (decyzja Krystiana 25.10): obowiązuje cennik v20. pro-kom.eu/tworzenie-stron-internetowych wyrównujemy **osobnym zadaniem** (treść w panelu pro-kom.eu, poza tym repo): landing 1 499 → 1 299, strona firmowa z CMS 2 399 → 2 490, rozbudowana 3 499 → 6 990, wizytówka 999 bez zmian. Przed publikacją cen na obu stronach — akceptacja szefa.
24. **Polityka prywatności** (plansza `Polityka`) to projekt — akceptacja szefa/prawnika, `[OKRES PRZECHOWYWANIA]`, `[DATA AKTUALIZACJI]`. Do sprawdzenia zdania z planszy: chip „Serwery w Polsce” (dostawca hostingu — ADR-002 „przyjęta wstępnie”), punkt o newsletterze (strona go nie ma; kreator mówi „bez newslettera”), „budżet” w danych kreatora (kreator o budżet nie pyta), opis analityki (Umami — ADR-016 w SW12).
25. **Zdjęcia:** sesja przed produkcją (salony, zespół, praca przy komputerze) — każde miejsce na zdjęcie ma opis, co ma na nim być.
26. **Eksport danych:** co miesiąc tylko w Opiece Systemy (790 zł); wszędzie indziej „eksport na każde żądanie”, raport co miesiąc od poziomu **Rozszerzona** (v22). Nie obiecujemy miesięcznego eksportu w FAQ, zasadach, technologiach ani na stronie rozwiązania.
27. **Terminy:** odpowiedź w 1 dzień roboczy ≠ wycena. Podgląd i wycena na piśmie: 5–7 dni (`[DNI]`). Budowa: 1–14 tygodni (`[TYGODNIE]`, wizytówka – portal B2B).
28. **RODO w „Dlaczego nie WordPress”:** za brak zgłoszenia naruszenia (art. 33) kara do 10 mln euro albo 2% obrotu — art. 83 ust. 4 (nie 20 mln / 4%).
29. **Pensjonat:** ~~„Na start” i Standard = zapytanie o termin; zaliczka online tylko w wersji Pełnej~~ — **v21/v22:** zapytanie o termin jest w cenie, **rezerwacja z zaliczką online = osobna wycena** (nie ma jej w żadnej wersji); obszar „Sklepy i zamówienia” bez „rezerwuje sam”; `scopeNotes.pensjonat`, `priceNote` pensjonatu.
30. **Liczby rozwiązań:** „30 rozwiązań” usunięte z tekstów (tytuły, mega menu, SEO); licznik w katalogu liczony z danych.

**v21 + v22 (28–30.10.2026, SWD2) — decyzje i poprawki.** Obowiązują w kodzie i seedzie (sesje SWR1–SWR5, SW10–SW12):
31. **Nazwy koszyka wszędzie:** „+ Dodaj do wyceny” → „✓ W wycenie” → „Twój projekt” → „Wyślij do wyceny →” (`/kontakt?projekt=1#formularz`); zastępuje pkt 20 („+ Do projektu”).
32. **`[ROK]`** — nowy placeholder na osi czasu `/o-firmie` (wydarzenia bez potwierdzonej daty: salon w Zakopanem, autoryzowany serwis kas) — uzupełnia szef; klucz `ROK` w `fakty.json` dochodzi w SW11b (jedna wartość na stronę nie wystarczy przy dwóch latach → jeśli lata są różne, dwa klucze, np. `ROK ZAKOPANE`, `ROK SERWIS KAS` — `TODO(krystian)` w SW11b); skan placeholderów (SW12) obejmuje `[ROK]`.
33. **Bez obietnic spoza cennika:** SMS w zleceniach i serwisie → status pod linkiem i e-mail; formularz „mail od razu” (SMS = automatyzacja); restauracja bez „dowozów”; pensjonat bez „połączenia z kalendarzami portali”; grafik zajęć bez płatności online; aplikacja dla gości — „płatności ustalamy w wycenie”; bez „najszybszy start w Google”, „w 2 minuty”, „< 2,5 s” w opisach rozwiązań (próg 2,5 s zostaje tylko jako próg Google ze źródłem — „Jak robimy”, podgląd „Strona”).
34. **Nazwy:** „Przebudowa starej strony” (zamiast „Odświeżenie obecnej strony”) w całej ofercie; obszar „Sklepy i zamówienia”; podgląd „Noclegi”; „Polecamy” zamiast „Najczęściej wybierane” (nie do sprawdzenia przy nowej linii); „Mam już stronę lub program” (filtr i sytuacja R); „Jedna firma, sześć adresów” (stopka) i „pięć linii” z „Tech” (`/jedna-firma`, kontakt).
35. **Teksty po audycie:** proces „Większość płacisz po odbiorze.”, budowa „od 1 tyg.”, etap 03 „Strona: 70% po odbiorze. System: rata po każdym odebranym etapie.”; hero „ZAKRES · na start / średni / etapami”; „Czasem powiemy: tego nie buduj.” + „Zapytaj, co się opłaca →”; odmiana „od 2 tygodni / od 1 tygodnia”; terminy-zakresy bez „od” („1–2 tygodnie”); forma „Ty” w całym serwisie; twarde spacje (§4).
36. **Ceny w JSON-ie kreatora i w tekstach** (`tileHints`, `addOns`, `shopHint`, `recommend`, FAQ „Ile to trwa?”) — dziś wpisane tekstem w `seed-v22/`; w kodzie z `Solutions` albo tokenami `{cena:<slug>}` / `{termin:<slug>}` (plan §3b, decyzja 10), żeby jedna zmiana ceny w panelu zmieniała całą stronę (zasada 1).
37. **Wyrównanie pro-kom.eu** (pkt 23) — teraz do jednej ceny „od” v22 (zadanie poza repo, akceptacja szefa).
