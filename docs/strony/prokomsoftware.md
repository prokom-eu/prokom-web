# Specyfikacja strony: prokomsoftware.pl

- **Status:** zaakceptowana przez Krystiana jako wizualizacja 18.10.2026. Treści i zachowania z plansz są uzgodnione. Ceny, terminy, poziomy opieki i czas odpowiedzi czekają na szefa (§13). Strona idzie na produkcję dopiero po akceptacji szefa w Asanie.
- **Tenant:** `software` · **Linia:** `software` · **Kolor:** Fiolet Kodu (wartości: ADR-015, `docs/design/prokomsoftware/tokens.css`).
- **Wzorzec wyglądu:** `docs/design/prokomsoftware/` (zrzuty, stany, plansze). **Model danych:** ADR-014. **Wygląd:** ADR-015. **Plan sesji:** `docs/zadania/prokomsoftware.md`. **Dane startowe:** `seed/prokomsoftware/`.
- **Cel biznesowy:** zapytania o strony, systemy, aplikacje i automatyzacje od firm z Podhala i Małopolski (zdalnie z całej Polski). Mierzymy:
  - liczbę zgłoszeń z formularzy (kontakt, kreator, „Twój projekt”, audyt) — `Inquiries`, linia `software`;
  - odsetek zgłoszeń z kreatora i z audytu;
  - wejścia z Google na strony rozwiązań, branż i miejscowości (Search Console).
- **Odbiorcy:** właściciele małych i średnich firm (pensjonaty, hotele, gastronomia, budowlanka i ekipy, warsztaty, gabinety, biura, producenci). Nie znają nazw technologii. Chcą zobaczyć efekt, cenę i termin.
- **Pojemność:** 2–3 projekty miesięcznie. Strona ma przyciągać dopasowane zapytania, nie maksymalną liczbę.

## 1. Twarde zasady
1. **Ceny tylko „od”, netto, z panelu.** Pola `[OD]`, `[TERMIN]`, `[KWOTA]` są w danych, nie w kodzie. Bez opublikowanych wartości strona pokazuje „cena po rozmowie” zamiast pustego pola (§13).
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
| `/rozwiazania` | Pełna oferta: 30 rozwiązań | `Katalog` | `Solutions`, `SolutionAreas` | 1 |
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
| `/polityka-prywatnosci`, `/mapa-strony` | Strony prawne i mapa | — | `Pages` | 1 |
| `/realizacje` | Realizacje i opinie | — | — | **2** (decyzja 18.10: na razie nie) |
| `/uslugi/[usluga]` | Strony usług pod frazy | — | — | **2** (strategia, po starcie) |

Zasady adresów:
- Polskie słowa, bez polskich znaków, małe litery, myślniki.
- Filtry katalogu w URL: `/rozwiazania?kategoria=systemy&sytuacja=R&branza=noclegi&podglad=1&q=excel` → `noindex` + `canonical` do `/rozwiazania`.
- Kreator: `/dobierz?potrzeba=firm&firma=nocleg` (parametry opcjonalne, otwierają kreator w danym kroku; plansze ich nie mają — to dodatek kodu, z którego korzystają strony branż i kafle intencji).
- Odnośniki z plansz (`Katalog.dc.html` itd.) zamieniamy według kolumny „Plansza” (README wzorca).

## 3. Elementy wspólne (każda podstrona)

### 3.0 Pasek górny (wszystkie zrzuty, nad nagłówkiem)
Istniejący `BrandBar` (SW0, D15): po lewej „Linia firmy PRO-KOM · od 2004 r. · Rabka-Zdrój i Zakopane”, po prawej linki do innych linii (PRO-KOM Biznes, Instalacje) i telefon linii z `SiteSettings.phone`. Link „Tech” ukryty, dopóki linia Tech nie ma strony.

### 3.1 Nagłówek (plansza `Main`, stan `stany/01-menu-oferta.jpg`)
Kolejność od lewej: znak PRO-KOM Software → **Oferta ▾** → pigułka **Kreator 60 s** → **Darmowy audyt** → **O firmie** → **Aktualności** → **Kontakt** | po prawej: przełącznik motywu → **Twój projekt** (z licznikiem) → przycisk **Bezpłatna wycena**.
- **Oferta ▾ (mega menu):** 4 kolumny, 12 pozycji:
  - Strony (6): wizytówka, firmowa, rozbudowana, landing page, dla restauracji, dla hotelu lub pensjonatu;
  - Systemy (4): zlecenia i grafik, CRM, czas pracy, z Excela do systemu;
  - Aplikacje i automatyzacje: aplikacja na telefon, automatyzacje;
  - Po wdrożeniu: Opieka, Cennik, Darmowy audyt;
  - karta „30 rozwiązań” → `/rozwiazania`.
  Dane menu w `SiteSettings.software.navigation` (wzorzec `SiteSettings.biznes` z B3a; seed `nawigacja.json`), nie na sztywno.
- **Kreator 60 s:** na stronie głównej przewija do `#dobierz`, na podstronach prowadzi do `/dobierz`.
- **Twój projekt ▾** (`stany/02-twoj-projekt.jpg`): lista rozwiązań dodanych z kart (przycisk „+ Do projektu” → „✓ W projekcie”; toast „Dodano do Twojego projektu” z linkiem „Zobacz projekt →”). Każda pozycja: nazwa, ×. Na dole: „Wyślij do bezpłatnej wyceny →” → `/kontakt?projekt=1` (formularz z pozycjami, typ `list`) i „Wyczyść listę”. Pusta lista: tekst z `nawigacja.json` → `projectDrawer.empty` (ujednolicony do „+ Do projektu”, §13 pkt 20). Stan w `localStorage`: jeden klucz `pk-project` z listą `{ id, name }` (nazwy bez zapytania do API; ADR-014 rozstrz. 9). Synchronizacja między kartami przez zdarzenie `storage`.
- **Bezpłatna wycena:** → `#kontakt` na stronie głównej, `/kontakt` na podstronach.
- Przyklejony, tło `--header-bg` z rozmyciem.

### 3.2 Telefon (`stany/03-menu-telefon.jpg`, zrzuty `*-390-*`)
- Menu pełnoekranowe na `<dialog>` (jak Biznes B3b), pozycje jak na `stany/03-menu-telefon.jpg`: Kreator · dobierz w 60 s, Pełna oferta (zwykły link do `/rozwiazania`), Darmowy audyt, O firmie, Aktualności, Kontakt, przycisk „Bezpłatna wycena”, telefon linii (`SiteSettings.phone`).
- Przełącznik motywu i Twój projekt zostają w nagłówku. Bez dolnego paska (plansza go nie ma).

### 3.3 Szyna sekcji (tylko strona główna, ≥ 1401 px)
Pionowa nawigacja po lewej z kropkami i nazwami sekcji: start, oferta, popularne, podglądy, proces, dobierz, technologie, jak-robimy, porównanie, realizacje, faq, kontakt. Aktywna sekcja z `IntersectionObserver`. Poniżej 1400 px ukryta.

### 3.4 Stopka
4 kolumny: opis linii („Strony, systemy, aplikacje i automatyzacje dla firm. Linia firmy PRO-KOM Tadeusz Wójciak.”) · Usługi (5 obszarów) · Firma (O firmie, Jedna firma do wszystkiego, Realizacje → `/#realizacje` do czasu etapu 2, Aktualności, Cennik, Darmowy audyt, Rabka-Zdrój) · Kontakt (telefon i e-mail linii z `SiteSettings.phone` / `SiteSettings.email`, „Rabka-Zdrój · Zakopane · zdalnie w całej Polsce”).
Pasek dolny: dane firmy z `CompanyData` (PRO-KOM Tadeusz Wójciak · ul. Orkana 16B, 34-700 Rabka-Zdrój · NIP 7352511447), link „Szukasz sprzętu, kas albo KSeF? PRO-KOM Biznes →”, polityka prywatności, mapa strony.

### 3.5 Motyw
Jasny i ciemny (ADR-015). Domyślnie preferencja systemu, wybór w `pk-theme`, skrypt przed pierwszym malowaniem (jest: `THEME_SCRIPT`). `software` dochodzi do `DARK_THEME_LINES`.

## 4. Strona główna (`/`, plansza `Main`)

Kolejność sekcji jest **ustalona** (decyzje Krystiana 18.10). Nie zmieniamy jej bez decyzji.

| # | Sekcja (id) | Nagłówek | Zachowanie | Dane | Zrzuty / stany |
|---|---|---|---|---|---|
| 1 | Hero (`start`) | „Strony, systemy i aplikacje **szyte pod Twoją firmę.**” | Lead, CTA „Dobierz rozwiązanie” (60 s) → `#dobierz`, „Zobacz podglądy na żywo” → `#podglady`. Pasek zaufania: odpowiedź w [CZAS ODPOWIEDZI], podgląd przed zakupem, kod i dane należą do Ciebie, firma na Podhalu od 2004. Po prawej makieta „Twój system”: 7 modułów do włączania (strona, zlecenia, aplikacja ekipy, program do faktur, SMS, raport, asystent AI); licznik modułów, podpowiedź i „złożoność”; przycisk „Chcę taki system” dodaje zestaw do „Twój projekt” jako jedną pozycję („system z N modułów”), potem „✓ W Twoim projekcie”. Poniżej 4 kafle intencji. | `strona-glowna.json` → `heroModules`; teksty kafli w planszy | `Main-1440-*/01.jpg` |
| 1a | Kafle intencji | 4 kafle | „Potrzebuję strony, która sprzedaje” · „Chcę system, który ogarnie firmę” · „Mam program, ale czegoś mu brakuje” · „Chcę aplikację na telefon”. Każdy prowadzi do katalogu z filtrem albo kreatora z wybraną potrzebą. | plansza | `01–02.jpg` |
| 2 | Oferta (`oferta`) | „Wszystko dla firmy, w ośmiu obszarach.” | 8 kafli z ikoną w gradiencie i krótkim opisem + panel szczegółów (scena ilustracji, „co zyskujesz”, chipy rozwiązań — z linkiem, jeśli mają stronę — cena „od”, 2 CTA). Autoprzełączanie co 5,5 s, stop po kliknięciu/najechaniu; klawiatura: strzałki. Etykieta „N rozwiązań” to tekst z panelu (`countLabel`), nie licznik — obszary to inny podział niż 5 kategorii katalogu (ADR-014 §1.2). | `obszary.json` | `stany/10-obszary-1..8.jpg` |
| 3 | Popularne (`popularne`) | „12 rzeczy, po które firmy przychodzą najczęściej.” | Filtry: Wszystko / Strony / Systemy / Aplikacje / Automatyzacje. Karta rozwija się po kliknięciu (warianty ukryte, gdy zwinięta). Na karcie: nazwa, lead, 3 cechy, cena „od”, „+ Do projektu”, link do strony rozwiązania. Pozycje 11–12 to karty ogólne (filtr obszaru). Pod siatką 3 kafle: Opieka, Przejęcie po innym wykonawcy, Darmowy audyt + przycisk „Pełna oferta”. | `popularne.json` (kolejność), `rozwiazania.json` | `stany/20-*.jpg`, `21-*.jpg` |
| 4 | Podglądy (`podglady`) | „Zobacz, jak to będzie wyglądać. Zanim zapłacisz.” | 5 zakładek: Strona, Rezerwacje, System firmowy, Aplikacja mobilna, Automatyzacje i AI. Każda: animowana makieta + 3 kroki + 2 „toasty”. Autoprzełączanie, stop po dotknięciu. | `strona-glowna.json` → `livePreviews` | `stany/30-podglad-1..5.jpg` |
| 5 | Proces (`proces`) | „Od rozmowy do działającego systemu. Płacisz po każdym etapie.” | 5 etapów (Rozmowa, Podgląd i wycena, Budowa — z wersją testową co tydzień, Wdrożenie, Opieka). Panel etapu: co dostajesz, co robisz Ty, ile płacisz ([ZASADY PŁATNOŚCI] od szefa). Autoprzełączanie, stop po kliknięciu. | `process` | `stany/40-proces-etap-1..5.jpg` |
| 6 | Kreator (`dobierz`) | „Kliknij kilka razy. Zobacz, co dla Ciebie zbudujemy.” | §6.3 — ten sam komponent co `/dobierz`. | `kreator.json` | `stany/50–54-*.jpg` |
| 7 | Technologie (`technologie`) | „Twój system, warstwa po warstwie.” | Zwarte zakładki (6 warstw): co to, co z tego masz, liczby z progami Google i źródłem. | `technologie.json` | `stany/60-technologie-1..6.jpg` |
| 8 | Jak robimy (`jak-robimy`) | „Nie składamy z gotowych klocków. Piszemy pod Twoją firmę.” | Dwa bloki „dziś / z nami” na białych kartach w jasnym motywie (prośba Krystiana). Kolory ilustracji z tokenów. | plansza | `Main-1440-*/` |
| 9 | Porównanie (`porownanie`) | „Freelancer, agencja czy PRO-KOM?” | Tabela 3 kolumn; na telefonie przełącznik kolumny. Bez nazw firm. | `compare` | `stany/70-porownanie-agencja.jpg` |
| 10 | Zasady | „Zasady, których się trzymamy.” | 6 kart gwarancji z ikonami. | `guarantees` | |
| 11 | Realizacje (`realizacje`) | „Najpierw zbudowaliśmy to dla siebie.” | 3 systemy własne PRO-KOM z makietami: prokomserwis.pl (działa), pro-kom.eu (działa), prokombiznes.pl (w budowie). Pasek liczb: 2004, 100+, [WYNIK] (Lighthouse), „0 banerów cookies” (zasada 6). Opinie klientów — **nie teraz**. | `strona-glowna.json` → `showcase` | |
| 12 | FAQ (`faq`) | „Pytania, które słyszymy najczęściej” | **6 pytań** (ustalone), akordeon, JSON-LD `FAQPage`. | `faq.json` → `homeFaq` | |
| 13 | Kontakt (`kontakt`) | „Powiedz, co Cię boli. Resztą zajmiemy się my.” | Ciemny blok. Lewa: obietnice ([CZAS ODPOWIEDZI], spotkanie, [MIESIĄC]), link do audytu („Masz już stronę?”), telefon. Prawa: formularz z §7 z tematami. Sukces: „Zgłoszenie PKS-RRRR-NNNN”. | `CompanyData`, `SoftwareSettings` | |

Pasek „100+ klientów biznesowych” i rok 2004 są w danych firmy (`CompanyData`), nie w kodzie.

## 5. Pełna oferta `/rozwiazania` (plansza `Katalog`)
- H1: „Wszystko, co programujemy. **Z ceną „od” i podglądem.**”
- **Wyszukiwarka** (placeholder „np. zlecenia, pensjonat, Excel…”): normalizacja polskich znaków, synonimy z `SoftwareSettings.search`, tolerancja literówek. Użyj `lib/search.ts` z Biznesu (B4), z innym indeksem — nie pisz drugiej wyszukiwarki.
- **Filtry** (w URL, z licznikami):
  - kategoria (`?kategoria=`, `Solutions.category`): Wszystko / Strony / Systemy / Aplikacje / Automatyzacje / Opieka i audyt;
  - sytuacja: „zaczynam od zera” (Z) / „mam program, brakuje mu czegoś” (R) / „mam kilka programów” (P);
  - branża: 8 grup (`branze.json` → `groups`);
  - przełącznik „z podglądem na żywo”.
- **Karta:** etykieta, tag, nazwa, lead, 3 cechy, cena „od”, termin, „Dodaj do projektu”, rozwinięcie z „dla kogo” i sytuacjami, „Otwórz podgląd” (jeśli `hasLivePreview`), link do strony rozwiązania.
- Pusty wynik: „Nie widzisz swojej sytuacji?” → kreator (tryb „opisz po swojemu”) i kontakt.
- Telefon: filtry w arkuszu.
- JSON-LD `ItemList` z `Service`. `noindex` dla wariantów z parametrami.

## 6. Podstrony

### 6.1 Rozwiązanie `/rozwiazania/[slug]` (plansza `Rozwiazanie`, wzór: aplikacja dla ekip w terenie)
Sekcje: hero (eyebrow z branżami, H1, lead, CTA „Dodaj do projektu” + „Bezpłatna wycena”) → **klikalne demo telefonu** („To nie jest film. Klikaj po telefonie.”, dane `demo-aplikacja-ekip.json`) → „Dziś / Z aplikacją / Efekt (mierzymy po wdrożeniu)” → „Co dostajesz” (w cenie „od”) i „Wyceniane osobno” → „Z przeglądarki czy ze sklepu?” → „Często łączone z” (3 rozwiązania) → FAQ rozwiązania (JSON-LD) → kontakt.
- Demo telefonu tylko dla rozwiązań z `hasLivePreview` i własnym demo; pozostałe pokazują makietę z obszaru (scena z `obszary.json`).
- Rozwiązania bez pełnej treści: szablon z danych karty (lead, cechy, dla kogo, sytuacje, powiązane) + kontakt. Pełne treści dla pozostałych pisze Krystian w czacie (plan, §5).
- JSON-LD `Service` (bez `offers`, dopóki ceny są [OD]) + `BreadcrumbList` + `FAQPage`.

### 6.2 Branża `/dla-branz/[branza]` (plansza `Branza`, wzór: budownictwo i ekipy)
Sekcje: hero (H1 „Oprogramowanie dla firm, które pracują w terenie, nie przy biurku.”) → „Kliknij swój problem. Pokażemy, co na to mamy.” (lista problemów → panel z rozwiązaniem, cechami i CTA) → układ modułów wokół firmy („Na budowie w Zębie nie ma LTE. Aplikacja o tym wie.”) → „Sześć rzeczy, od których zaczynają firmy takie jak Twoja” → „Złóż system dla swojej firmy. W 3 minuty.” (CTA do kreatora z `?firma=`) → kontakt.
- 12 rekordów w seedzie (`branze.json` → `pagesAtStart`, z grupą i rodzajem firmy do kreatora): budownictwo i wykończenia, instalatorzy, ekipy montażowe, pensjonaty i apartamenty, hotele, gastronomia, atrakcje i wypożyczalnie, gabinety i rehabilitacja, warsztaty i serwisy, transport, producenci regionalni, biura rachunkowe.
- Treść budowlanki jest w `branze.json` → `budowlanka`. **Pozostałe 11 = treść do napisania w czacie** (problemy, moduły, 6 rozwiązań), każda unikalna. Strona bez treści nie jest publikowana (`active=false`).

### 6.3 Kreator `/dobierz` i sekcja `#dobierz` (plansza `Kreator`, stany `50–54`)
Jeden komponent w dwóch miejscach. Reguły to **dane** (`kreator.json` → `SoftwareSettings.wizard`, schemat Zod), nie `if` w komponentach.

**Kroki** (pigułki u góry, zakończone z ptaszkiem): Potrzeba → Szczegóły → Zakres → Opis → Wynik.

1. **Potrzeba** — 8 kafli, 4 w rzędzie (telefon: 2):
   - wiersz „Nowa strona internetowa”: Strona firmowa (`firm`), Rozbudowana strona (`rozb`), Strona wizytówka (`wiz`), Landing page (`land`);
   - wiersz „Odświeżenie, program, aplikacja”: Odświeżenie obecnej strony (`odsw`), Program dla firmy (`prog`), Aplikacja (`app`), Automatyzacje (`auto`);
   - pod spodem: „Opisz po swojemu” (`own`) — przechodzi od razu do kroku Opis.
2. **Szczegóły** — pytanie zależne od potrzeby (`needs[x].q`, opcje `o`): np. „Jaka to firma?” (10 rodzajów firm), dla programu „Co dziś najbardziej przeszkadza?” (zlecenia, klienci, czas pracy, zgłoszenia, Excel), dla odświeżenia: co dziś nie działa (`rebuildIssues`).
3. **Zakres** — rozmiar (Na start / Standard / Pełna wersja), „mam już stronę” + pole adresu (dla odświeżenia), dla programów zdanie „Plik możesz dosłać mailem po kontakcie” (bez pola pliku — §7.3), „na kiedy” (Jak najszybciej / Przed sezonem zimowym / Przed latem / Bez pośpiechu).
4. **Opis** — pole tekstowe + gotowe frazy do kliknięcia (`phrases`).
5. **Wynik** — dwie kolumny o **równej wysokości**:
   - lewa: rekomendowane rozwiązanie (`mapping` → `results` → `resultToSolutionSlug`), przełącznik rozmiaru, cena „od” dla rozmiaru (`Solutions.prices[rozmiar]`, puste → `priceDisplay.fallback`) i termin, notka do „na kiedy” (`whenNotes`), „Co będzie potrzebne” (checklista `needsChecklist`), „Twoje potrzeby”, „Twój wybór”;
   - prawa: podgląd projektu (rośnie do wysokości lewej kolumny; marka podglądu z `previewBrands` dla rodzaju firmy, widoki systemu z `systemViews`, akcje automatyzacji z `automationActions`) + „Chcesz wycenę na piśmie?”: sposób kontaktu (Telefon / E-mail / Spotkanie w salonie / Online), **„Imię”**, pole kontaktu, **checkbox zgody** (oba spoza planszy — SW0, ADR-014 rozstrz. 6), „Wyślij”;
   - po wysłaniu: stan „Wysłane” z numerem zgłoszenia.
- **Stan początkowy podglądu:** „Tu zobaczysz swój projekt” z 4 pływającymi mini-kartami (wyłączone przy `prefers-reduced-motion`).
- **Wysyłka:** `submitInquiry()` z `type: 'wizard'`, `wizard` = pełny stan (potrzeba, szczegóły, rozmiar, kiedy, opis, wynik), `preferredContact` (mapowanie `contactPrefs[].inquiryValue`), `url` (jeśli podany); `message` składa serwer z podsumowania kreatora.
- **Parametry URL:** `?potrzeba=` i `?firma=` ustawiają kroki 1–2 (używają ich strony branż).
- Mapowanie potrzeba → wynik (z `kreator.json`): `firm` + nocleg → strona dla pensjonatu; `firm` + gastro → restauracja; `firm` + inne → firmowa; `rozb` → rozbudowana; `wiz` → wizytówka; `land` → landing; `odsw` → przebudowa; `prog` + zlecenia/klienci/czas/zgłoszenia/Excel → odpowiedni system; `app` → aplikacja; `auto` → automatyzacje; `own` → bez rekomendacji, tylko formularz.

### 6.4 Cennik `/cennik` (plansza `Cennik`)
H1 „Ceny bez gwiazdek. Na piśmie.” → cennik rozwiązań z zakładkami obszarów (te same dane co katalog) → opieka po wdrożeniu: 3 poziomy (Podstawowa, Standard „Polecamy”, Systemy) z [OD] zł/mies., czasem reakcji [X] h i zakresem → „Tego nie dopłacasz” (SEO i AI, panel i szkolenie, wersja testowa co tydzień, własność kodu i danych, dokumentacja, szybkość w protokole) → FAQ o cenach → CTA kreator/kontakt.
Wartości poziomów opieki = [SZEF]; są polami bloku cennika (nie faktami). **Cennik publikujemy od startu** (SW0, D11): rozwiązania bez ceny pokazują „cena po rozmowie” (zasada 1), a tabela poziomów opieki jest ukryta, dopóki szef nie poda wartości. Bez przekierowania 302.

### 6.5 Darmowy audyt `/audyt` (plansza `Audyt`)
H1 „Sprawdzimy Twoją stronę. Za darmo.” → pole adresu + **„Imię”** + e-mail/telefon + **checkbox zgody** (imię i checkbox spoza planszy — SW0, ADR-014 rozstrz. 6) → stan „Przyjęte. Raport dla {adres} wyślemy w ciągu [CZAS].” → przykład raportu (5 obszarów: szybkość, telefon, Google i AI, bezpieczeństwo, dostępność) → „Co sprawdzamy” (5 kart) → „Trzy kroki. Zero zobowiązań.” → FAQ → CTA „Wolisz od razu nową stronę?”.
- Wysyłka: `type: 'audit'`, pole `auditUrl` (walidacja: http/https, domena), `message` składa serwer („Audyt strony: <adres>”), bez pobierania tej strony przez serwer (audyt robi człowiek; automatyzacja = etap 2).
- Zdanie o dostępności: „Od 28.06.2025 część usług cyfrowych musi to spełniać” — sprawdzić brzmienie z ustawą o zapewnianiu spełniania wymagań dostępności (§13).

### 6.6 O firmie `/o-firmie` (plansza `ONas`)
H1 „Firma z Rabki. Od 2004 roku.” → liczby (2004, 100+, 2 salony, 5 linii) → „Pracujesz z firmą. Nie z jedną osobą.” (ciągłość, na miejscu, na piśmie) → historia → ludzie (Krystian Potaczek, Tadeusz Wójciak, [IMIĘ I NAZWISKO] — zdjęcia [ZDJĘCIE] tylko za zgodą) → dwa salony (Rabka, Zakopane [ADRES SALONU W ZAKOPANEM]) → CTA.

### 6.7 Jedna firma do wszystkiego `/jedna-firma` (plansza `Wszystko`)
H1 „Strona, program, sprzęt i serwis. W jednej firmie.” → 5 linii PRO-KOM z odnośnikami do ich domen → dwa przykłady z Podhala (opisowe, bez nazw klientów do czasu zgody) → „Jeden kontakt zamiast pięciu” → CTA. Nazwy linii zgodne z `docs/marka.md` (tam „Tech (dawniej Serwis)” — §13).

### 6.8 Aktualności `/aktualnosci` i wpis (plansze `Aktualnosci`, `Wpis`)
- Blog jest w Aktualnościach (decyzja 18.10). Lista: wyróżniony wpis + siatka, kategorie (Poradnik, Nowości, Realizacje), [DATA].
- Wpis: H1, lead, czas czytania, treść z nagłówkami H2, **źródła z datą sprawdzenia** (`Posts.sources`), CTA do audytu, powiązane rozwiązania. JSON-LD `Article` + `BreadcrumbList`.
- Na start 1 wpis: „WordPress czy strona pisana od zera?” (dane W3Techs i Patchstack — przed publikacją ponownie sprawdzić liczby i datę).
- **Uwaga techniczna:** Biznes buduje `/aktualnosci` w B11, przed Software. Trasa musi powstać od razu jako wspólna dla linii (ADR-014 §2) — dopisek do zadania B11.

### 6.9 Miejscowości `/miejscowosci/[miasto]` (plansza `Miasto`, wzór: Rabka-Zdrój)
H1 „Strony i systemy dla firm z Rabki-Zdroju.” → „Dla kogo pracujemy najczęściej” (branże lokalne) → „Blisko, czyli prościej” → FAQ lokalne → „Pracujemy też w okolicy” (lista miejscowości) → „Wpadnij do salonu przy Orkana 16B.”
- Na start: **Rabka-Zdrój**. Potem: Zakopane, Nowy Targ, Mszana Dolna, Limanowa, Nowy Sącz.
- **Zasada przeciw „doorway pages”** (wytyczne Google o spamie): każda strona ma unikalną treść (lokalne branże, dojazd/spotkanie, lokalne pytania, realne powiązanie z firmą). Strona bez unikalnej treści nie jest publikowana. Raba Wyżna, Chabówka, Skomielna Biała itp. tylko na liście „w okolicy”, bez własnych stron.
- JSON-LD `Service` z `areaServed` (miasto). Bez fałszywych adresów: `LocalBusiness` tylko z prawdziwymi oddziałami.

### 6.10 Kontakt `/kontakt` (plansza `Kontakt`)
H1 „Napisz, co Cię boli. Odpowiemy z konkretem.” → kanały (telefon, e-mail, odpowiedź w [CZAS ODPOWIEDZI]) → formularz z §7 (ten sam co na stronie głównej) → „Gdzie się spotkamy” (Rabka [ADRES], Zakopane, dojazd do klienta: Kraków, Nowy Targ, Mszana Dolna, Nowy Sącz; statyczna mapa jak Biznes) → „Co się stanie po wysłaniu” (3 kroki; wycena ważna 30 dni) → dane firmy. JSON-LD `LocalBusiness` z `CompanyData`.
- `?projekt=1`: formularz pokazuje pozycje z „Twój projekt” (edytowalne) i wysyła `type: 'list'`.

### 6.11 Strony prawne
Polityka prywatności (wspólna treść z Biznesem, `TODO(krystian)` z S8b), mapa strony. Bez strony cookies, dopóki nie ma ciasteczek innych niż niezbędne.

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
- Bez danych osobowych w logach. Zgoda: treść z `consent.ts` (`TODO(krystian)` z S8b).

### 7.2 Ekrany sukcesu
„Dziękujemy, mamy to. Zgłoszenie PKS-RRRR-NNNN. Odezwiemy się w ciągu [CZAS ODPOWIEDZI].” + „Wyślij kolejne”. Kreator: stan „Wysłane” w prawej kolumnie wyniku.

### 7.3 Plik w kreatorze — poza etapem 1 (SW0, D7)
- W etapie 1 **nie ma pola pliku**; przy „Program dla firmy” kreator mówi: „Plik możesz dosłać mailem po kontakcie”.
- Powód: prywatny magazyn plików (`InquiryFiles`, ADR-014 §3.2) to nowy katalog poza `Media`, kopie, retencja i testy. Wraca jako osobne zadanie, jeśli zgłoszenia o programy będą tego wymagać (wtedy: `.xlsx`, `.xls`, `.csv`, `.pdf`, `.docx`, maks. 10 MB, 1 plik, dostęp tylko admin).

## 8. Zachowania techniczne

### 8.1 „Twój projekt”
Wspólny `createListStore(key, parse)` wydzielony ze store'u `pk-cart` Biznesu (`useSyncExternalStore`), jeden klucz `pk-project` z `{ id, name }` (ADR-014 rozstrz. 9). Toast „Dodano do projektu” z akcją „Zobacz”. Maks. 30 pozycji.

### 8.2 Wyszukiwarka katalogu
`lib/search.ts` (Biznes B4) z indeksem `GET /api/solutions-index` (tylko domena Software, tag `solutions`, < 30 KB gzip). Synonimy startowe w `SoftwareSettings.search` (np. „excel” → z Excela do systemu; „grafik” → zlecenia, czas pracy; „rezerwacje” → hotel, rezerwacje online).

### 8.3 Interakcje z autoprzełączaniem
8 obszarów (5,5 s), podglądy, proces, technologie: zatrzymanie po interakcji, pauza przy ukrytej karcie (`document.hidden`), brak przy `prefers-reduced-motion`. Wszystkie zakładki to prawdziwe `role="tablist"` z obsługą strzałek.

### 8.4 Analityka (cookieless)
Zdarzenia (bez danych osobowych): `kreator_start`, `kreator_krok` (numer), `kreator_wynik` (wynik), `kreator_wyslij`, `projekt_dodaj`, `projekt_wyslij`, `audyt_wyslij`, `kontakt_wyslij`, `podglad_otworz`. Narzędzie wg `docs/architektura.md` (Umami). Bez banera — dopóki narzędzie nie stawia ciasteczek.

### 8.5 Wydajność
Budżet jak w S10 (Lighthouse CI). Animacje tylko `transform`/`opacity`. Makiety podglądów to HTML/SVG, nie obrazy. Strona główna statyczna z rewalidacją (dane z Payload, tagi `tenant:<id>:…`). Kreator i interaktywne sekcje jako komponenty klienckie ładowane przy przewinięciu.

## 9. SEO i widoczność w AI

| Podstrona | title | description (do 155 znaków) | frazy główne |
|---|---|---|---|
| `/` | Strony, systemy i aplikacje dla firm — Rabka-Zdrój, Podhale \| PRO-KOM Software | `TODO(krystian)` w SW12 | strony internetowe Podhale, systemy dla firm, aplikacje dla firm |
| `/rozwiazania` | Pełna oferta: 30 rozwiązań dla firm \| PRO-KOM Software | `TODO` | oprogramowanie dla firm, CRM dla małej firmy |
| `/rozwiazania/[slug]` | `<nazwa> \| PRO-KOM Software` | z leadu | nazwa rozwiązania + branża |
| `/dla-branz/[branza]` | jak `Branza` | `TODO` | program dla <branży> |
| `/miejscowosci/rabka-zdroj` | Strony internetowe Rabka-Zdrój \| PRO-KOM Software | `TODO` | strony internetowe Rabka, programista Rabka-Zdrój |
| `/dobierz` | Dobierz rozwiązanie w 60 sekund \| PRO-KOM Software | `TODO` | — |
| `/cennik` | Cennik stron, systemów i opieki \| PRO-KOM Software | `TODO` | ile kosztuje strona internetowa |
| `/audyt` | Darmowy audyt strony \| PRO-KOM Software | `TODO` | audyt strony internetowej |
| `/aktualnosci/[slug]` | tytuł wpisu | lead | temat wpisu |

- Tytuły z plansz (`<title>`) są punktem wyjścia; opisy pisze Krystian w czacie przed SW12.
- JSON-LD: `Organization` + `LocalBusiness` (są z S7b), `Service` (rozwiązania, miejscowości), `FAQPage` (FAQ), `Article` (wpisy), `BreadcrumbList`, `ItemList` (katalog).
- **Widoczność w AI:** te same fakty w HTML (nie tylko w JS): kim jesteśmy, gdzie, co robimy, dla kogo, jak się skontaktować. Strony renderowane po stronie serwera. `robots.txt` nie blokuje botów wyszukiwarek AI, chyba że szef zdecyduje inaczej (§13).
- Sitemap z kolekcji (rozwiązania, branże aktywne, miejscowości aktywne, wpisy).
- Przekierowania 301: obecna prokomsoftware.pl — `TODO(krystian)`: lista starych adresów przed SW12 (sprawdzić, co jest dziś pod domeną).

## 10. Kryteria akceptacji
1. Strona główna i 12 podstron z mapy (etap 1) wyglądają jak zrzuty przy 1440 i 390 px w obu motywach (porównanie Playwright, różnice wypisane w PR).
2. Kreator: 3 ścieżki ze `stany/50–52` dają ten sam wynik co plansza; „opisz po swojemu” wysyła formularz bez rekomendacji; zgłoszenie trafia do `Inquiries` z pełnym stanem; test e2e każdej ścieżki, także przy 390 px.
3. „Twój projekt”: dodaj z karty → licznik → lista → wyślij → zgłoszenie z pozycjami; stan przetrwa przeładowanie i jest wspólny dla kart przeglądarki.
4. Katalog: filtry w URL, liczniki, wyszukiwanie z literówką („exel” → „Z Excela do systemu”), pusty wynik; `noindex` dla parametrów.
5. Formularze kontaktu i audytu: walidacja, ekran sukcesu z numerem `PKS-…`, mail do skrzynki Software.
6. axe bez naruszeń na `/`, `/rozwiazania`, `/dobierz`, `/kontakt`, `/audyt` w obu motywach; obsługa z klawiatury: mega menu, Twój projekt, zakładki, kreator.
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

**Od szefa (Asana „SZEF · Software: ceny, terminy, opieka”, pon. 19.10):**
1. Ceny „od” 30 rozwiązań (`[OD]`) i terminy (`[TERMIN]`).
2. Poziomy opieki: nazwy, ceny miesięczne, czas reakcji (`[X] h`), zakres.
3. Zasady płatności po etapach (`[ZASADY PŁATNOŚCI]`, `[ZALICZKA]`).
4. Czas odpowiedzi na zgłoszenie (`[CZAS ODPOWIEDZI]`) i na audyt (`[CZAS]`).
5. Telefon, e-mail i godziny linii Software (`SiteSettings.phone`, `SiteSettings.email`, `[GODZINY]`).
6. Adres salonu w Zakopanem.
7. Osoba z obsługi klienta na stronie O firmie (imię, nazwisko, zdjęcie — zgoda).
8. Kto dostaje kopię powiadomień o zgłoszeniach Software.
9. Czy strona pozwala botom AI na indeksowanie (rekomendacja: tak).

**Krystian:**
10. `[WYNIK]` w PageSpeed — wpisać dopiero zmierzony wynik tej strony na produkcji.
11. `[MIESIĄC]` „najbliższy wolny termin” — pole w panelu, aktualizowane ręcznie (albo ukryte).
12. `[PRZYCHÓD]`, `[KWOTA]` w makietach — zostają jako przykładowe, wyraźnie fikcyjne kwoty albo zastąpione opisem (decyzja w SW5).

**Fakty do sprawdzenia (każdy ze źródłem):**
13. „w 1,5 sekundy strona jest gotowa” (podgląd „Strona”) — zamienić na próg Google (LCP < 2,5 s) albo na zmierzony wynik.
14. Dostępność: data 28.06.2025 i zakres podmiotów (ustawa z 26.04.2024 o zapewnianiu spełniania wymagań dostępności niektórych produktów i usług) — brzmienie zdania na `/audyt`, w katalogu i w ofercie.
15. Liczby we wpisie WordPress (W3Techs, Patchstack) — ponownie w dniu publikacji.
16. Nazwy linii PRO-KOM („Serwis” vs „Tech”) na `/o-firmie` i `/jedna-firma` — zgodnie z `docs/marka.md`.
17. „100+ klientów biznesowych” i „od 2004 r.” — potwierdzone przez szefa (są w danych firmy).

**Klucze faktów:** wszystkie placeholdery z tekstów są w `seed/prokomsoftware/fakty.json` (wartość = null); jeden klucz = jedna wartość w całej stronie (ADR-014 rozstrz. 4: `[CZAS PIERWSZEGO ETAPU]`, `[OPIEKA OD]`; `{termin}` w tekstach rozwiązania = jego `leadTime`). Telefon i e-mail linii nie są faktami — `SiteSettings.phone` / `email`. Uzupełnienie = wpis w panelu (`SiteSettings.software.facts`).

**Poprawki tekstów z plansz — przyjęte w SW0 (22.10.2026, D13), wszystkie wg propozycji.** W kodzie obowiązuje tekst po poprawce; teksty z seeda poprawione w SW0, pozostałe (hero, eyebrow podglądów) przenosi sesja, która buduje sekcję. Przy porównaniu zrzutów to oczekiwane różnice:
18. Hero: „zdalnie cała Polska” → „zdalnie w całej Polsce”.
19. Eyebrow podglądów: „tego nie ma nikt na Podhalu” (nie do sprawdzenia, zasada 5) → „Podglądy na żywo · zanim zapłacisz”.
20. Pusta szuflada „Twój projekt”: „Chcę takie u siebie” → „+ Do projektu” (jak na kartach).
21. FAQ rozwiązania: zdanie „Najstarszy użytkownik naszego systemu serwisowego ma [WIEK] lat” usunięte.
22. Realizacje: opis prokombiznes.pl bez „porównywarki” (listopadowy etap Biznesu) i bez liczby produktów, która się zmienia (katalog v2): „Katalog sprzętu i programów z wyszukiwarką, filtrami i listą zapytań ofertowych.”
