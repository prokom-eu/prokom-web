# ADR-012: Katalog oferty i model treści prokombiznes.pl

- **Status:** przyjęta (18.10.2026, z rozstrzygnięciami na końcu dokumentu — mają pierwszeństwo przed §1–§3)
- **Data:** 2026-10-17
- **Decyduje:** Krystian
- **Pochodzenie:** pakiet „prokombiznes z wizualizacji” (17.10.2026), tam jako „ADR-008” — przenumerowany, bo ADR-008 w repo to dokumentacja bibliotek. Treść poniżej bez zmian merytorycznych poza miejscami oznaczonymi „rozstrzygnięcie N” (18.10.2026); rozbieżności z przyjętymi ADR-ami — sekcja „Do uzgodnienia”.

- **Kontekst:**
  - prokombiznes.pl ma katalog ok. 70 pozycji bez cen, z filtrami, wyszukiwarką i listą zapytania.
  - Treść edytuje szef i zespół w Payload (ADR-005, ADR-006). Multi-tenant: każda kolekcja ma pole `tenant`.
  - Skrzynka zapytań: ADR-003 (przyjęta; nazwy API rozstrzygnięte w S8a — sekcja „Do uzgodnienia”).
- **Decyzja (skrót):**
  - katalog jako kolekcje Payload;
  - wyszukiwanie i filtrowanie po stronie klienta na indeksie JSON;
  - zgłoszenia do kolekcji `inquiries` za adapterem, który pozwoli później przełączyć zapis na PRO-KOM System;
  - ikony liniowe z wizualizacji jako własny mały zestaw SVG.

## 1. Kolekcje

Wszystkie kolekcje mają pole `tenant`; slugi są unikalne w obrębie tenanta.

| Kolekcja | Pola (najważniejsze) | Uwagi |
|---|---|---|
| `catalog-groups` | `nazwa`, `slug`, `ikona` (select z zestawu ikon), `gradient` [2 kolory], `kolejnosc` | 5 rekordów |
| `catalog-categories` | `nazwa`, `slug`, `grupa` → groups, `opis` (krótki), `hero` (blok), `wCenie` (lista), `faq` (relacja/array), `czestoDobierane` → products[], `seo`, `kolejnosc` | 21 rekordów (rozstrzygnięcie 7) |
| `brands` | `nazwa`, `slug`, `logo` → media, `partner` (select: brak / autoryzowany serwis / autoryzowany partner), `opisStatusu` | 27 rekordów |
| `industries` (Branże) | `nazwa`, `slug`, `aktywna` (bool; false = „Wkrótce”), `strona` (bloki), `polecane` → products[], `seo` | 7 rekordów, aktywne 3 (rozstrzygnięcie 7) |
| `products` | patrz §1.1 | 67 rekordów |
| `posts` (Aktualności) | `tytul`, `slug`, `kategoria` (select), `lead`, `tresc` (rich text z blokami Ważne / Źródło / CTA), `zrodla` [{nazwa, url, dataWeryfikacji}], `powiazane` → products[], `okladka`, `publishedAt`, `updatedAt`, `seo` | wersje robocze + publikacja z datą |
| `pages` | bloki (ADR-006) | strona główna, O firmie, Opieka IT, GoPOS, InsERT, Kontakt, prawne |
| `inquiries` | patrz §3 | tylko odczyt dla redaktora; zapis wyłącznie przez API formularza |
| `media` | plik, `alt` (wymagany), `zrodlo` (tekst), `wymagaZgody` (bool) | `wymagaZgody=true` nie renderuje się publicznie |

### 1.1 `products`
- **Identyfikacja i typ:**
  - `nazwa`, `slug`;
  - `rodzaj` (select: urządzenie / program / usługa);
  - `marka` → brands;
  - `kategorie` → categories[] — pierwsza jest główna (okruszki, „Podobne”).
- **Treść karty:**
  - `korzysc` (1 zdanie na kartę);
  - `cechy` (3 krótkie tagi);
  - `branze` → industries[];
  - `slowaKluczowe` (tekst do wyszukiwarki, niewidoczny);
  - `odznaka` (krótki tekst, opcjonalnie).
- **Flagi:**
  - `nowosc` (bool);
  - `autoryzacja` (bool) — etykieta zależy od `marka.partner` i `rodzaj`;
  - `popularnosc` (0–100);
  - `featured` (bool) + `featuredOrder` — 8 na stronie głównej (v20; wcześniej 12, rozstrzygnięcie 10).
- **Strona produktu:**
  - `zdjecia` → media[];
  - `hotspoty` [{x%, y%, tytul, opis}];
  - `moduly` [{nazwa, opis, ikona}];
  - `parametry` [{etykieta, wartosc}] — 4 kluczowe w boksie;
  - `specyfikacja` [{grupa, etykieta, wartosc}];
  - `opis` (rich text);
  - `pliki` → media[] (karty katalogowe);
  - `faq`;
  - `wCenie` (lista; domyślnie z kategorii);
  - `pasujeDo` → products[] („Skompletuj stanowisko”);
  - `alternatywy` → products[] („Kiedy wybrać inną”).
- **Tylko kasy (warunkowo, gdy kategoria = kasy-fiskalne):**
  - `typKasy` (multi: mobilna / mała / systemowa / dotykowa);
  - `porownanie` {typ, ekr, kl, plu, dr, lacz, waga, dla}.
- `seo` (wtyczka SEO).

### 1.2 Globale (na tenant)
- `daneFirmy`:
  - nazwa, NIP;
  - telefony (główny, stacjonarny), WhatsApp, e-mail, adres, współrzędne;
  - **godziny** [{dni, od, do}];
  - miejscowości obsługi;
  - linki linii PRO-KOM.

  Wspólne dane firmy są jednym wpisem dla wszystkich stron (decyzja z 09.10); pola specyficzne dla Biznesu są per tenant.
- `obietnice`:
  - czas oddzwonienia;
  - tekst przeglądu IT;
  - „w cenie kasy”;
  - przejęcie serwisu;
  - linia zaufania;
  - flagi widoczności opinii i logo klientów.
- `pasekSezonowy`: `aktywny`, `od`, `do`, `idKampanii`, `tresc`, `link`.
- `wyszukiwarka`: `synonimy` [{fraza, rozwiniecia[]}], `stopSlowa[]`, `popularne[]`.
- `kreator`: rodzaje firm, potrzeby, domyślne potrzeby, propozycje dla potrzeby (rodzaj → produkt), usługi w cenie, plakietki. Start z `seed/prokombiznes/kreator.json`.
- `nawigacja`: kolejność menu, karty w mega menu, branże w menu.

## 2. Adresy, SEO, indeks

### 2.1 Slugi
- Grupy: `sprzedaz`, `komputery-biuro`, `oprogramowanie`, `bezpieczenstwo-siec`, `serwis-uslugi`.
- Kategorie (seed → slug):

| Seed | Slug | Seed | Slug |
|---|---|---|---|
| kasy | kasy-fiskalne | serw | serwery-nas-ups |
| druk | drukarki-fiskalne | mfp | drukarki-wielofunkcyjne |
| pos | stanowiska-pos | av | ekrany-projektory |
| mob | kasoterminale-mobilne | progs | programy-sprzedazowe-erp |
| term | terminale-platnicze | progb | programy-branzowe |
| kiosk | kioski-ekrany-kuchenne | m365 | microsoft-365-licencje |
| akc | akcesoria-pos | siec | siec-wifi |
| komp | komputery-monitory | ochr | antywirus-firewall |
| podpis | podpis-kwalifikowany | it | opieka-it-wdrozenia |
| serwis | serwis-przeglady | dof | dofinansowania |
| vend | automaty-vendingowe | wagi | wagi-sklepowe |
| kody | skanery-kolektory-etykiety | | |

- Produkty: slug z nazwy, np. `posnet-ergo-online`. Seed ma krótkie id (`ergo`); import zapisuje je w `legacyIds` (od katalogu v2 — rozstrzygnięcie 12).

### 2.2 Strony filtrowane
- Indeksowane są tylko `/oferta`, `/oferta/[kategoria]` i `/branze/[branza]`.
- `/oferta?…` z dowolnym filtrem: `noindex,follow` + `canonical` do `/oferta`.
- Paginacja `?strona=N`: indeksowana z `canonical` do siebie.

### 2.3 Sitemap, dane strukturalne, przekierowania
- `sitemap.xml` generowany z kolekcji.
- JSON-LD:
  - `LocalBusiness` (globalnie);
  - `Product` bez `offers`;
  - `BreadcrumbList`;
  - `FAQPage`;
  - `Article`.
- Przekierowania 301 ze starych adresów pro-kom.eu przez kolekcję `Redirects` (własna zamiast wtyczki — uzupełnienie ADR-006, S7b); lista w osobnym zadaniu.

### 2.4 Indeks wyszukiwarki
- Indeks to `GET /api/catalog-index` (route handler Next).
- Zwraca JSON wszystkich opublikowanych produktów (pola karty + `hay`), stron specjalnych i kategorii z licznikami.
- Cache z rewalidacją po zapisie produktu (hook `afterChange` → `revalidateTag('catalog')`).
- Rozmiar przy 70 pozycjach ok. 30–40 KB gzip. **Przy > 500 pozycjach** wracamy do tej decyzji (Payload Search / Postgres FTS).

## 3. Zapytania (`inquiries`) i ADR-003

- **Pola:**
  - `numer` (np. PKB-2026-0001);
  - `typ` (kontakt / lista / kreator / zapytaj-o-fraze);
  - `status` (nowe / w toku / oferta wysłana / zamknięte);
  - dane kontaktu (imię, firma, telefon, e-mail, preferowany kontakt);
  - `pozycje` [{produkt → products, nazwaSnapshot, ilosc, uwaga}];
  - `kreator` (JSON wyborów);
  - `wiadomosc`, `tematy[]`, `termin`;
  - `zrodlo` (URL), `utm`;
  - `zgodaRodo` (data + treść klauzuli);
  - `ip` (skrót, retencja 90 dni).
- **Zapis:** `POST /api/inquiries` → walidacja Zod → `InquirySink.save()`.
  - Implementacja na teraz: `PayloadInquirySink`.
  - Później: `ProkomSystemInquirySink` (REST do Django), bez zmian we frontendzie.
  - Po zapisie e-mail do biura (SMTP od dostawcy z ADR-002) i potwierdzenie do klienta.
- **Retencja i RODO:**
  - zgłoszenia bez kontynuacji usuwane po 24 miesiącach (do potwierdzenia w polityce prywatności);
  - eksport i usunięcie na żądanie z panelu.

## 4. Ikony

- Zestaw ikon liniowych z wizualizacji: `seed/prokombiznes/ikony.json` (viewBox 24, stroke 1.9, linecap round).
- Komponent `<Icon name>` renderuje ścieżkę inline. Nie dodajemy biblioteki ikon.
- Brakującą ikonę rysujemy w tym samym stylu albo bierzemy z Lucide (ta sama siatka 24 i obrys), wklejając ścieżkę do zestawu.

## 5. Konsekwencje

- **(+)** Szef dodaje produkt w panelu i od razu ma kartę, filtry, wyszukiwanie i stronę produktu, bez programisty.
- **(+)** Brak dodatkowej infrastruktury (bez Algolii, Meili ani osobnego serwisu).
- **(+)** Zapytania można przełączyć do PRO-KOM System bez przepisywania formularzy.
- **(−)** Filtrowanie po stronie klienta wymaga pobrania indeksu. Akceptowalne do kilkuset pozycji.
- **(−)** Pole `porownanie` jest specyficzne dla kas. Gdy porównywarka obejmie inne kategorie (etap 2), przechodzimy na ogólne `parametry` z flagą „porównywalny”.

## 6. Odrzucone

- **Kategorie jako drzewo dowolnej głębokości:** 2 poziomy (grupa → kategoria) wystarczą, a drzewko szefa zostaje strukturą pod spodem.
- **Payload Search plugin jako jedyne źródło wyszukiwania:** brak literówek i synonimów po polsku bez dodatkowej pracy, więc wraca do rozważenia przy dużym katalogu.
- **Koszyk w bazie (sesja serwerowa):** lista zapytania nie wymaga konta; `localStorage` jest prostszy i nie zbiera danych przed wysłaniem.

## Do uzgodnienia z przyjętymi ADR-ami (przed sesją kolekcji, zadanie #2 z `docs/design/prokombiznes/PRZEKAZANIE.md`)
Do czasu rozstrzygnięcia obowiązują przyjęte ADR-y. Rozstrzygnięcie = poprawka tego ADR albo nowy ADR, nie zmiana kodu po cichu.
- ~~**ADR-003 (skrzynka zapytań):** `POST /api/inquiries` + `InquirySink.save()` a `POST /api/inquiry` + `submitInquiry()`~~ — **rozstrzygnięte 17.10.2026 (S8a):** obowiązują nazwy z ADR-003 (`POST /api/inquiry`, `submitInquiry()` w `lib/inquiry`, kolekcja `Inquiries`); `InquirySink` = zależność `save` w `submitInquiryWith`. Pełne IP nie jest zapisywane wcale (limit liczy skrót IP w pamięci), więc „IP 90 dni” odpada. Pola z §3 spoza ADR-003 (`numer`, `typ`, `pozycje`, `kreator`, `tematy`, `termin`, preferowany kontakt) — dopisać migracją przy formularzach Biznesu (lista zapytania, kreator).
- ~~**ADR-006 (model treści v1):** `daneFirmy` = istniejący global `CompanyData` (S4) — pola specyficzne dla Biznesu (WhatsApp, współrzędne, miejscowości obsługi) dodać do `SiteSettings` albo `CompanyData`, nie tworzyć drugiego globalu. `pasekSezonowy` = istniejący pasek promocji w `CompanyData` (ma od–do). `nawigacja` = `SiteSettings.navigation`. „Globale na tenant” w Payload to kolekcje z jednym dokumentem na tenanta (jak `SiteSettings`), nie globale.~~ — **rozstrzygnięte 18.10.2026 (B0):** rozstrzygnięcia 2 i 3.
- ~~**ADR-006 / S7:** `media` i `brands` a `Partners`~~ — **rozstrzygnięte 17.10.2026 (S7a, uzupełnienie ADR-006):** `media` = kolekcja `Media` z polami `source` (= `zrodlo`) i `requiresConsent` (= `wymagaZgody`); `brands` = kolekcja `Partners` (jedna dla partnerów i marek), `partner` = `partnerStatus`, logo = plik rekordu. `products.marka` wskaże na `partners`.
- ~~**ADR-007 / ADR-013:** gradient grup (`catalog-groups.gradient`) i kolory — według ADR-013.~~ — **rozstrzygnięte 18.10.2026 (B0):** gradient to dane rekordu `CatalogGroups` (2 kolory z seeda, edytowalne w panelu), wyświetlany wg ADR-013; to jedyny wyjątek od „kolory tylko z tokenów”, test „bez gołych kolorów” nadal obejmuje kod.
- ~~Nazwy pól po polsku (`nazwa`, `kolejnosc`) a dotychczasowy kod po angielsku (`name`, `order`)~~ — **rozstrzygnięte 18.10.2026 (B0):** rozstrzygnięcie 1.

## Rozstrzygnięcia (18.10.2026)

Decyzje Krystiana z sesji B0 (na podstawie `docs/zadania/prokombiznes.md` §2). Obowiązują zamiast sprzecznych fragmentów §1–§3.

1. **Nazwy w kodzie po angielsku, etykiety w panelu po polsku** (CLAUDE.md).
   - Kolekcje: `CatalogGroups` (`catalog-groups`), `CatalogCategories` (`catalog-categories`), `Industries` (`industries`), `Products` (`products`), `Posts` (`posts`); marki = istniejące `Partners`, media = `Media`, zapytania = `Inquiries`.
   - Pola tłumaczymy 1:1, np.:

     | ADR (PL) | Kod (EN) | ADR (PL) | Kod (EN) |
     |---|---|---|---|
     | `nazwa` / `tytul` | `name` / `title` | `kolejnosc` | `order` |
     | `grupa` | `group` | `opis` | `description` |
     | `wCenie` | `included` | `czestoDobierane` | `frequentlyBoughtWith` |
     | `aktywna` | `active` | `strona` | `layout` |
     | `polecane` | `featuredProducts` | `rodzaj` | `kind` |
     | `marka` | `brand` (→ `partners`) | `kategorie` | `categories` |
     | `korzysc` | `benefit` | `cechy` | `features` |
     | `branze` | `industries` | `slowaKluczowe` | `keywords` |
     | `odznaka` | `badge` | `nowosc` | `isNew` |
     | `autoryzacja` | `authorized` | `popularnosc` | `popularity` |
     | `zdjecia` | `images` | `hotspoty` | `hotspots` |
     | `moduly` | `modules` | `parametry` | `keyParams` |
     | `specyfikacja` | `specs` | `pliki` | `files` |
     | `pasujeDo` | `fitsWith` | `alternatywy` | `alternatives` |
     | `typKasy` | `registerTypes` | `porownanie` | `comparison` |
     | `kategoria` (wpisu) | `category` | `tresc` | `content` |
     | `zrodla` | `sources` | `powiazane` | `relatedProducts` |
     | `okladka` | `cover` | `numer` | `number` |
     | `typ` | `type` | `pozycje` | `items` (`product`, `nameSnapshot`, `quantity`, `note`) |
     | `kreator` | `wizard` | `tematy` / `termin` | `topics` / `deadline` |

   - Dokładne nazwy pól ustala B1 według tej zasady; odstępstwa — w opisie PR B1.
2. **Bez nowych globali** („globale na tenant” z §1.2):
   - wspólne dane firmy (`daneFirmy`) → istniejący global `CompanyData`;
   - dane linii (kanały kontaktu działów, WhatsApp, miejscowości obsługi, `obietnice` [SZEF], linia zaufania, flagi opinii i logo klientów, `nawigacja` mega menu) → `SiteSettings`, w grupach pól widocznych w panelu tylko dla linii biznes;
   - `wyszukiwarka` i `kreator` → nowa kolekcja `BiznesSettings` (jeden dokument na tenanta, jak `SiteSettings`), żeby `SiteSettings` innych linii nie puchło. Dokument może mieć tylko tenant linii biznes (walidacja i dostęp w B1).
3. **Pasek sezonowy** (`pasekSezonowy`) = istniejący `CompanyData.promoBar` (ma od–do) + nowe pola:
   - `campaignId` — zamknięcie zapamiętane w `localStorage` jako `pk-sz-closed` = `campaignId`;
   - `lines` (wielokrotny wybór linii; puste = wszystkie linie) — `CompanyData` jest jednym globalem dla wszystkich domen, więc bez tego kampania Biznesu (np. kasy przed sezonem) pokazałaby się też na Instalacjach i Software. Layout renderuje pasek tylko dla linii z listy (B1: pole + migracja + test; dziś pasek idzie na każdą domenę).
4. **Strony specjalne** `/opieka-it`, `/gopos`, `/insert`, `/o-firmie`, `/kontakt` to `Pages` z blokami Biznesu (ADR-010). Logika (kalkulator przestoju, eksplorator modułów, dobór programu InsERT) w komponentach bloków; w panelu tylko treści i konfiguracja.
5. **Trasy katalogu tylko na domenie Biznesu:** `/oferta`, `/oferta/[kategoria]`, `/produkt/[slug]`, `/branze/[branza]`, `/kreator`, `/zapytanie`. Strażnik linii zwraca 404 na innych domenach; test izolacji jak w S3.
   - **Zmiana 22.10.2026 (SW0, ADR-014 rozstrz. 11):** `/aktualnosci` i `/aktualnosci/[slug]` to **trasa wspólna dla linii**, poza grupą `(biznes)` — Next nie pozwala na ten sam adres w dwóch grupach tras, a Software też ma Aktualności. Trasa czyta `Posts` tenanta (zawsze z filtrem tenanta), układ wybiera po linii; na linii bez Aktualności (dziś Instalacje i hub) — 404. Powstaje w B11.
6. **Kontakt działów:** w `SiteSettings` lista `contactChannels` — dział (opieka IT, kasy fiskalne, oprogramowanie, sprzęt, dofinansowania), telefon, e-mail, godziny, flaga „pokaż w stopce”.
   - Strony działów i formularz z danym tematem biorą kanał działu; w nagłówku i górnym pasku jeden numer główny.
   - Poziomy godzin z umów (standard 9–17, PRO 7–21, VIP 24/7) to treść `/opieka-it`, nie godziny otwarcia. Status „Otwarte teraz” liczony z godzin biura w `CompanyData`.
   - B1 buduje pola; wartości wpisuje szef albo Krystian w panelu.
7. **Uwagi szefa z 16.10** (szczegóły w spec. §11):
   - `Industries`: 7 rekordów — nowa „Beauty i usługi” (`beauty`, `active=false`, „Wkrótce”); aktywne zostają gastronomia, handel, noclegi.
   - `CatalogCategories`: 21 rekordów — nowa „Maszyny vendingowe” (`vend` → `maszyny-vendingowe`) w grupie sprzedaży. Produkty dopiero z danymi ze źródłem (strona producenta); do tego czasu kategoria bez produktów i bez opisu (pusty `opis` w seedzie importer B2 traktuje jak brak pola).
   - **Pusta kategoria jest niewidoczna:** kategoria bez opublikowanych produktów nie pojawia się w mega menu, filtrach, kaflach ani w `sitemap.xml`, a `/oferta/[kategoria]` zwraca 404 — do czasu pierwszego produktu. Dotyczy każdej kategorii, nie tylko vendingu (B3, B5, B10, B11).
   - Strona branży: CTA „Przygotuj ofertę dla [branża]” otwiera kreator z wybranym rodzajem firmy (rozstrzygnięcie 8).
   - Kafelki „Oferta” i „Opieka IT” jednym komponentem; nazwy kategorii w mega menu i katalogu ≥ 15 px; referencje na stronie głównej za flagą widoczności (B3, B5, B7).
8. **Branże: adresy i powiązanie z kreatorem.** Slugi w seedzie są skrótami; adres `/branze/[branza]` i filtr `?branza=` używają pełnych slugów:

   | Seed | Slug | Rodzaj firmy w kreatorze (`wizardBusinessType`) |
   |---|---|---|
   | gastro | gastronomia | gastro |
   | handel | handel | sklep |
   | noclegi | noclegi | hotel |
   | uslugi | biura-uslugi | biuro |
   | szkoly | szkoly-instytucje | szkola |
   | zdrowie | zdrowie-uzdrowiska | gabinet |
   | beauty | beauty | gabinet |

   - `Industries` dostaje pole `wizardBusinessType` (id z `rodzaje_firm` w `kreator.json`); w seedzie to pole `kreator` przy branży.
   - CTA branży → `/kreator?firma=<wizardBusinessType>`; nieznana wartość `?firma=` jest ignorowana (krok 1 bez wyboru).
9. **ADR-011** przyjęta (18.10.2026).

## Rozstrzygnięcia v20 (20.10.2026)

Wizualizacja v20 (`docs/design/prokombiznes/ZMIANY-v20.md` §4 pkt 3), sesja D1. Pola dodaje sesja, która ich potrzebuje (B7), z migracją.

10. **Strona główna — dane sekcji „Oferta” i „Najczęściej wybierane”:**
    - `CatalogGroups.showcase` — witryna karty działu: do 2 zdjęć (relacje do `Media`, większe i mniejsze) **albo** tryb „statusy” z 2 krótkimi wierszami tekstu (Serwis i usługi: „Opieka IT · aktywna”, „Przegląd kasy · za 43 dni”). Na start zdjęcia: sprzedaż `ergo`+`d3`, biuro `tp`+`srvT`, oprogramowanie `nexo`+`goposScr`, bezpieczeństwo `u7`+`eset`.
    - `Products.featured` + `featuredOrder` — **8 pozycji** (było 12): `ergo, k10, pol, d3, hx, tp, euro, nas` (seed: `kolejnosc_wyroznionych`). **[SZEF]** lista wg sprzedaży.
11. **Siatka branż na stronie głównej („Nie widzisz swojej branży?”) — do decyzji w B7. TODO(krystian):**
    - `ZMIANY-v20.md` proponuje `Industries.homeOrder` + `homeVisible` (9 widocznych). Siatka ma jednak **19 kafli** („Gmina, urząd, biblioteka”, „Food truck”, „Apteka”…), każdy z podpisem i ikoną, a `Industries` ma 7 rekordów, z czego 3 aktywne (strony `/branze/*`). Pola na `Industries` wymagałyby 12 nowych rekordów bez własnych stron.
    - **Rekomendacja:** lista kafli w danych bloku sekcji „Plan Twojej firmy” (ADR-006): `name`, `subtitle`, `icon`, `visibleFirst` (9 pierwszych), opcjonalnie `industry` → `Industries` (link do `/branze/…`, gdy branża ma stronę), inaczej link do kreatora. Kolejność = kolejność w tablicy, edytowalna w panelu. `Industries` bez zmian.

## Rozstrzygnięcia 22.10 — katalog v2 (22.10.2026)

Łatka `docs/design/prokombiznes/ZMIANY-katalog-v2.md`, sesja K1. Od tej chwili źródłem prawdy jest ten ADR i spec. §5, §7.

12. **Katalog v2 — dane i model:**
    - **225 pozycji** (212 produktów + 13 usług), **23 kategorie**, 32 marki (nowe: Honeywell, Godex, Dibal, Zebra, SATO).
    - Nowe kategorie w grupie `sprz`: `wagi` → `wagi-sklepowe`, `kody` → `skanery-kolektory-etykiety`. `akc` → „Akcesoria POS” (`akcesoria-pos`, było `akcesoria-pos-wagi`), `vend` → „Automaty vendingowe” (`automaty-vendingowe`, było `maszyny-vendingowe`; ma 1 produkt). Adresy zmienione przed produkcją, więc bez przekierowań; seed rozpoznaje stare adresy w lokalnej bazie (`PREVIOUS_CATEGORY_SLUGS`).
    - `Products` — nowe pola: `subcategory` (tekst; chip wewnątrz `akc` i `kody`), `variants` (lista tekstów), `sources` (grupa: `productPages[]`, `datasheets[]` — tylko linki http(s), `checkedAt` — wypełnia człowiek), `contentStatus` (`ready` / `needs-review` = „Gotowe” / „Do sprawdzenia”, filtr w panelu, na stronie bez różnicy), `batch` (`0` / `1` / `2` — tylko planowanie treści, widoczne wszystkie), `legacyIds` (krótkie id z seeda, potem id z arkusza; zastępuje `legacyId`, migracja przenosi wartości).
    - **Galeria = istniejące `images`** (wiele, kolejność zachowana, pierwsze = zdjęcie karty), bez osobnego pola `gallery` — jedno pole zamiast dwóch o tym samym znaczeniu; karty i indeks już czytają `images`.
    - **Seed aktualizuje** kategorie i produkty: pola, które dostarcza paczka (nazwa, korzyść, odznaka, kategoria, zdjęcia, linki źródeł…), **wygrywają z edycją w panelu**; rekord jest zapisywany tylko wtedy, gdy różni się od paczki (bez nowej wersji przy kolejnym uruchomieniu). Pól, których paczka nie ma (opis, specyfikacja, punkty na zdjęciu, FAQ, „Skompletuj stanowisko”), seed nie dotyka. `contentStatus` i `sources.checkedAt` ustawia człowiek — z paczki przechodzą tylko „w przód” („Gotowe”, data sprawdzenia), nigdy nie cofają wartości z panelu. Tylko lokalnie (seed na produkcji zablokowany).
    - Zdjęcia: `seed/prokombiznes/media/produkty/<slug>/` (567 plików, WebP, kwadrat do 1200 px), źródło każdego w `Media.source` (`media-produkty-v2.json` → `zrodlo`). Prawo użycia materiałów producentów do potwierdzenia przed produkcją. Usługi bez galerii zostają przy plikach z wizualizacji.
    - Loga Honeywell i Zebra są tylko w SVG, którego `Partners` nie przyjmuje — marka pokazuje nazwę tekstem. TODO(krystian): wersja bitmapowa logo od producenta.
    - Indeks wyszukiwarki z 225 pozycjami: 24 KB gzip (limit 50 KB) — `korzysc` bez skracania.
