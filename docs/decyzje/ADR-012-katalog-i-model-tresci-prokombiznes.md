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
11. **Siatka branż na stronie głównej („Nie widzisz swojej branży?”) — przyjęte 23.10.2026 w B7c (rekomendacja poniżej):**
    - `ZMIANY-v20.md` proponuje `Industries.homeOrder` + `homeVisible` (9 widocznych). Siatka ma jednak **19 kafli** („Gmina, urząd, biblioteka”, „Food truck”, „Apteka”…), każdy z podpisem i ikoną, a `Industries` ma 7 rekordów, z czego 3 aktywne (strony `/branze/*`). Pola na `Industries` wymagałyby 12 nowych rekordów bez własnych stron.
    - **Rekomendacja:** lista kafli w danych bloku sekcji „Plan Twojej firmy” (ADR-006): `name`, `subtitle`, `icon`, `visibleFirst` (9 pierwszych), opcjonalnie `industry` → `Industries` (link do `/branze/…`, gdy branża ma stronę), inaczej link do kreatora. Kolejność = kolejność w tablicy, edytowalna w panelu. `Industries` bez zmian.
    - **Wdrożenie (B7c):** blok `bzPlan` → `industries.tiles[]`: `name`, `note` (podpis), `icon`, `tone`, `visibleFirst` (maks. 9, walidacja w panelu), `industry` → `Industries` tylko tego tenanta. Link do `/branze/…` tylko dla **aktywnej** branży (nieaktywna = „Wkrótce”, bez własnej strony), inaczej kreator (`src/sites/biznes/blocks/BzPlan/tiles.ts`).

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

## Rozstrzygnięcia B10 (24.10.2026)

Decyzje Krystiana z sesji B10 (kategoria, branże, kreator). Obowiązują zamiast sprzecznych fragmentów §1–§3.

13. **Strony kategorii, branż i kreator — model treści:**
    - `CatalogCategories`: sekcje strony jako pola (karty „W cenie” `includedSection.cards`, „Przepisy w pigułce” `facts.items` — karta tylko z nazwą przepisu i linkiem `https://`, nagłówek FAQ, karta pomocy, kontakt). Produkty strony = każdy opublikowany produkt z tą kategorią (jak liczniki menu), nie tylko z kategorią główną.
    - `Industries`: **pola zamiast bloków** (§1 przewidywał `strona` jako bloki). Strona branży to stały szablon (spec. §6.7 „jeden szablon”); sekcje „Dzień w lokalu” i „Jak to działa” używają pól bloków `bzTimeline` i `bzOrderFlow` (te same komponenty co na `/gopos`), „Inne branże” i siatka polecanych liczą się z danych. Bloki wymagałyby przeróbki `RenderBlocks` (adresy okruszków z `/<slug>`) bez zysku dla redaktora.
    - `BiznesSettings.wizard` (kreator): reguły jako dane — propozycje to slugi produktów katalogu, warunki plakietek i usług w cenie oraz mnożnik „N ×” w danych (schemat `lib/catalog/wizard.ts`). Zestaw liczy serwer z odpowiedzi klienta i reguł tenanta; produkty trafiają do `Inquiries.items` z ilościami (ADR-003, uzupełnienie B10c).

## Rozstrzygnięcia K3 i K3.1 (26.10.2026)

Paczki `docs/design/prokombiznes/K3-KATALOG.md` i `K31-ZMIANY.md` (25.10.2026, wizualizacja v126), wniesione w sesji KD. Status: **przyjęte** (Krystian, 26.10.2026 — rekomendacje D1–D5 z planu KD). Obowiązują zamiast sprzecznych fragmentów §1–§3 i rozstrzygnięć 1–13. Paczki używają nazw ze swoich plansz (`Brands`, „globale” `GoposPage`, `/katalog/…`) — poniżej tłumaczenie na model repo; przy sprzeczności wygrywa ten ADR. Szczegóły pól i importu zostają w paczkach (nie kopiujemy ich tutaj).

14. **Adresy (D1):** podkategorie z własnym adresem to `/oferta/{slug kategorii}/{slug podkategorii}` (np. `/oferta/komputery-monitory/laptopy`), nie `/katalog/{kod}/{podkategoria}` z paczek. Dotyczy `komputery-monitory`, `serwery-nas-ups`, `ekrany-projektory`; w pozostałych kategoriach podkategoria to tylko chip. Indeksowane z canonical na siebie (uzupełnienie §2.2); filtr serii `?seria=` — `noindex` nie jest potrzebny, bo canonical wskazuje adres bez parametru. Nowe trasy: `/zestawy`, `/zestawy/[slug]`, `/marki/[slug]`, `/plan-firmy` — w `RESERVED_PAGE_SLUGS`. Dlaczego: strona, sitemap, okruszki, linki stopki i e2e stoją na `/oferta/[kategoria]`; zmiana prefiksu dałaby 301 dla wszystkich kategorii bez zysku.

15. **Model danych K3/K3.1 (D2 — wszystko per tenant albo w istniejących kolekcjach, bez nowych globali):**
    - **Marki = `Partners`** (od S7a), nie nowa kolekcja `Brands`. Dochodzi grupa pól strony marki: kraj pochodzenia, opis krótki, opis (rich text), fakty [{k, v, źródło}], linie produktów, strona producenta, źródła, `hasPage`; oraz **dane salonu** (`showroom`: działy, serie z opisami i klasą, kolejność, pytania i reguły doboru, usługi, hero, filmy serii) z `marki-salony-k31.json`. `Partners` jest wspólny dla linii (pole `tenants`) — strona marki renderuje się tylko na linii Biznes. Jeśli inna linia będzie potrzebowała własnego opisu tej samej marki — wtedy pola per tenant (nowy ADR).
    - **`Products`** — nowe pola: `configurator` {opis, opcje[{nazwa, wartości[], uwaga, pomoc?}], popularne[{nazwa, konfiguracja}]}; `packages[]` (tylko karta opieki, nieopublikowana do decyzji szefa); `series` (seria salonu; każda karta Lenovo/Dell w dokładnie jednej); `videos[]` (ADR-016); `shortName` (H1 kart wielomodelowych). Zmiana typu: `variants` z listy tekstów na [{name, difference}] (migracja przenosi tekst do `name`). Bez zmian: `brand` (relacja do `partners` jest od B1), `subcategory` (tekst; slug podkategorii z listy kategorii), `specs` (ma już `label`/`value`, `group` opcjonalne), `faq` (jest), `fitsWith` („Skompletuj stanowisko”, relacja), `sources`.
    - **Poprawka K3a (26.10, z danych paczki):** `dobierz` to frazy tekstowe („szuflada kasowa”), nie slugi — osobne pole `suggestions` (tekst, wiele wartości), dopasowanie do kart przy renderze (K31b); `fitsWith` bez zmian. Źródła K3 mają typy `producent / karta-pdf / dystrybutor / przepisy / ministerstwo` — dystrybutorzy w `sources.distributorPages` (tylko panel, nigdy na stronie), reszta jak dotąd w `productPages` i `datasheets`. Dochodzą też `subtitle` (podtytuł) i `internalNotes` (`uwagi` z paczki; kolekcja i tak jest do odczytu tylko dla zalogowanych, widoki stron wybierają pola jawnie). Migracja `k3_model`. Model jest prostszy niż wyliczenie wyżej: kolejność podkategorii i opcji konfiguratora = kolejność wierszy w tablicy (bez pola „kolejność”), a pola `pomoc` w opcjach nie ma — paczki K3 i K3.1 go nie zawierają (słownik wyjaśnień `konf_help` z `K31-ZMIANY.md` §13.7 rozstrzyga K31b). Podkategorie w kategorii: nazwa i adres bez powtórzeń (walidacja w panelu). Źródła strony marki tylko https, jak źródło faktu. **Aliasy modeli** (`Products.aliases` z `K31-ZMIANY.md` §13.5) = istniejące `keywords` — jedno pole dla wyszukiwarki zamiast dwóch.
    - **Status treści (rozstrzygnięte w K3a, 26.10):** `do-sprawdzenia` = `contentStatus` „Do sprawdzenia”: karta widoczna, ale `noindex, follow`, poza `sitemap.xml` **i poza HTML-ową `/mapa-strony`** (obie mapy biorą tę samą listę — `isIndexableProduct` w `lib/catalog/product.ts`; zastępuje „na stronie bez różnicy” z rozstrzygnięcia 12). `do-akceptacji-szefa` = karta nieopublikowana (szkic) z `contentStatus` „Do sprawdzenia” — bez nowej wartości w `contentStatus`; ustawia ją import K3a-2. Do czasu K3a-2 lokalny katalog v2 ma 163 z 225 kart „Do sprawdzenia”, więc te karty nie są w mapach — import K3 przestawia je na statusy z paczki.
    - **`CatalogCategories`**: `subcategories[]` {nazwa, slug?} (kolejność = kolejność wierszy); slug tylko tam, gdzie podkategoria ma adres; nowe nazwy i opisy ze słowników przez import.
    - **`Bundles`** (nowa kolekcja, `tenant`): pola z `K3-KATALOG.md` §7, elementy jako relacja do `Products` (po slugu w imporcie) z rolą, ilością, sugerowaną wersją i flagą obowiązkowy; `status` `gotowe` / `do-sprawdzenia`; pola wewnętrzne (`uwagi_wewnetrzne`, `do_potwierdzenia`, `sprawdzone_zgodnosci`) tylko w panelu — nie trafiają do zapytań odczytu stron.
    - **`FloorPlans`** (nowa kolekcja, `tenant`, rekord = scena): nazwa, ikona, kolejność, SVG rzutu jako pole tekstowe (kod SVG w rekordzie — plan i tak renderuje rzut inline; decyzja Krystiana w K31a, 26.10), punkty[{x, y, produkt, etykieta, opis}], zestawy → `Bundles`. 12 scen z `plansze-k31.json`; `plansze-k3.json` nie jest importowany do planu (zastąpiony). **K31a-2 (27.10):** kod SVG walidowany przy zapisie (`lib/catalog/svg.ts`: tylko rysunek — bez skryptów, stylów, obrazów, linków zewnętrznych i atrybutów `on…`), wygląd z klas CSS strony (`fp.css` → tokeny w K31d); punkt wskazujący kartę źródłową podziału dostaje kartę z celu 301. **Salon (`Partners.showroom`):** działy → serie (nazwa, klasa, dla kogo, wyróżnik, zdjęcie z produktu, produkty jako relacje), pytania i reguły doboru, usługi, filmy serii z nazwą serii jak w paczce (dopasowanie do kafli w K31c); seria wskazująca kartę źródłową podziału dostaje wszystkie nowe karty (decyzje Krystiana 27.10).
    - **Strony GoPOS, InsERT, O firmie, Kontakt** zostają stronami `Pages` z blokami Biznesu (ADR-006, ADR-010) — nowe bloki albo warianty istniejących (`bzPageHero`, `bzLocation`, `bzContactInfo`…); treści `strony-gopos-insert-k31.json` i `firma-k31.json` (z filmami stron z `wideo-k31.json → strony`) wpisuje seed jak w B9/B11c — **w K31e**, razem z blokami (decyzja Krystiana w K31a, 26.10: bloków jeszcze nie ma, schemat bez widoku byłby zgadywany). **Nie** globale `GoposPage`, `InsertPage`, `AboutPage`, `ContactPage`: global Payload jest jeden dla wszystkich domen, a te treści są tylko Biznesu.
    - **Dane firmy** (`Company` z paczki) = `CompanyData` (wspólne: nazwa, NIP, adres, godziny) + `SiteSettings` (per tenant: e-mail biznes@, telefony, miejscowości obsługi, punkty mapy dojazdu). **„Najczęściej wybierane”** (`HomePage.featured`) = istniejące `Products.featured` + `featuredOrder`.
    - Zapytania: notatki wersji, zestawu, planu, pakietu i InsPunktów to `uwaga` pozycji w `Inquiries.items` (bez nowego pola).

16. **Import K3/K3.1 (`pnpm seed:biznes`):** dopasowanie `legacyIds` → `slug_seed` → `nazwa_poprzednia`; slugi istniejących kart bez zmian (wyjątki — karty zastąpione rodzinami, `K3-KATALOG.md` §4 pkt 2, §8). Treść z paczki nadpisuje pola K3 w całości; pola ustawiane w panelu, których paczka nie ma (popularność, odznaka, typ kasy, porównanie), zostają; **wyróżnienie na głównej** (`featured`, `featuredOrder`) od K3 bierze się z `kolejnosc_wyroznionych` słowników i import je nadpisuje (decyzja Krystiana 26.10 — `K3-KATALOG.md` §4 pkt 6 zamiast pkt 4; K31a przejmie je ze `strona-glowna-k31.json`); `contentStatus` i `checkedAt` dalej tylko „w przód” (rozstrzygnięcie 12). Idempotencja: drugi import = 0 zmian. Raport: utworzone / zaktualizowane / ukryte / bez dopasowania / zdjęcia / 301. Produkty bez dopasowania do K3 ani do `usuniete.json` — tylko w raporcie, nie usuwamy.

    - **Uzupełnienie K3a-2 (26.10, z danych paczki; decyzje Krystiana):** import w `src/seed/biznes/k3.ts` (czyste funkcje) i `run.ts`; `katalog.json` (v2) zostaje źródłem tego, czego K3 nie ma: adresu istniejącej karty, branż, plików wizualizacji i — **tylko przy tworzeniu rekordu** — pól panelu (rodzaj, popularność, odznaka, słowa kluczowe, typ kasy, porównanie, flagi, partia); rodzaj nowej karty z grupy kategorii (`usl` → usługa, `prog` → program, reszta → urządzenie). Rekord v2 zajęty przez kilka kart (`xl2` ← XL2, XL2 A, XL2 B) należy do karty z jego krótkim id, identyfikatory arkusza pozostałych kart odchodzą do nich. Odznaki v2 z ceną („Ulga do 700 zł”, „0 zł przez 12 mies.”) import usuwa (§10 paczki), pozostałe należą do panelu. Wyróżnione na głównej — z kolejności słowników K3. `Products.subcategory` = **nazwa** podkategorii (K3 w `komp`/`serw`/`av` podaje adres — import zamienia go na nazwę z listy kategorii; adres strony podkategorii bierze się z listy). Branża `magazyn-produkcja` (bez rekordu i strony) pomijana — liczba w raporcie. Zdjęcia K3 wgrywane jako `k3-<plik>` (272 nazwy plików pokrywają się z galeriami v2 o innej treści). Status treści dalej tylko „w przód” — raport wypisuje karty, gdzie status K3 nie został zastosowany. Marki Honeywell i StorageCraft: rekord zostaje, bez tenanta Biznes.
17. **Usunięte i scalone karty:** `usuniete.json` (79), podział kart wielomodelowych (`karty-podzial-k31.json`) i karty zastąpione rodzinami → `published = false` (rekordy zostają — historia zapytań) + wpis w `Redirects` (301 do kategorii albo nowej karty); poza katalogiem, sitemap i indeksem. Honeywell i StorageCraft — ukryte (pasek marek, filtr, licznik). **K3a-2:** tabela zastąpionych (`REPLACED_PRODUCTS` w `k3.ts`) = §4 pkt 2 i §8 paczki + `nec` (= `proj` z planszy) → `sharp-nec-projektory-sala`, oraz bez pary w paczce (decyzja Krystiana 26.10): `srvr` → `dell-poweredge-r360`, `mslic` → `/oferta/microsoft-365-licencje`. Karta zastąpiona, którą K3 dopasowuje (`tb`, `mon`, `aio`; `mfp` i `srvr` — przez `slug_seed` równy identyfikatorowi z arkusza), przechodzi na nowy adres tym samym rekordem; `m365` miała już adres rodziny — bez reguły. Karty `do-akceptacji-szefa` — szkic **bez** 301 (reguła wygrywa ze stroną, więc po akceptacji zasłaniałaby kartę). Reguła zmieniona w panelu zostaje (raport).

18. **Karty wielomodelowe** (`K31-ZMIANY.md` §13.5): reguła łączenia i rozdzielania z paczki; `?wersja=<model>` ustawia konfigurator, canonical na kartę, JSON-LD `ProductGroup` (`variesBy`, `hasVariant`), kody modeli w `keywords`. Gdy model zacznie mieć osobny popyt — rozdzielamy, a `?wersja=` dostaje 301 na nową kartę.
    - **K31a (26.10):** treść 12 kart z podziału nie jest liczona automatem (prefiksy modeli w paczce są niespójne) — jest w `seed/prokombiznes/k31/karty-podzial-tresci.json`, napisana tylko z faktów karty źródłowej; test pilnuje, że każda liczba nowej karty występuje w karcie źródłowej (decyzja Krystiana). Kategoria, marka, branże, seria i filmy — z karty źródłowej; status zawsze „Do sprawdzenia”. Karta źródłowa → szkic + 301 na pierwszą nową; `avtek-ts-9-mate-g` zostaje tym samym rekordem (status tylko „w przód”, więc zostaje „Gotowe”).

19. **Źródła na stronie:** tylko domeny producentów z listy dozwolonych w kodzie (`K31-ZMIANY.md` §4 pkt 9); adresy sklepów i resellerów z `sources` zostają w panelu, ale nie są renderowane; etykieta liczona z adresu. Filtr przy renderze, nie w imporcie — dane źródłowe zostają kompletne. **K31a:** `publicSources` w `lib/catalog/sources.ts` (zakładka „Dokumenty” od razu, etykiety z adresu — K31b); lista z paczki („m.in.”) uzupełniona o strony producentów kart z katalogu (Avtek, Subiekt 123, Insoft, Comarch, Stormshield, NFHotel, SATO, Rice Lake, Adobe); pośrednicy plików (vidis, labelident, directindustry) i marka zakazana (Datalogic) nie są na liście.

20. **Indeks wyszukiwarki:** + zestawy i marki ze stroną; limit < 50 KB gzip (§2.4); pola wewnętrzne nigdy w indeksie.

21. **Filmy (D3):** osobna decyzja — ADR-016 (YouTube jako usługa zewnętrzna: fasada, youtube-nocookie, sprawdzanie oEmbed zadaniem Payload z ADR-011).

**Konsekwencje:** migracje w K3a (pola `Products`, `Partners`, `CatalogCategories`, zmiana typu `variants`), K31a (`series`, `videos`, `shortName`, `showroom`, `FloorPlans`), K3c (`Bundles` + relacja `FloorPlans.bundles` i import zestawów scen — w ścieżce skróconej K31a idzie przed K3c, więc K31a importuje plany bez zestawów); każda `up → down → up` czysta. `noindex` dla `do-sprawdzenia` (produkty) robi K3a, jeśli nie zrobiło go wcześniej F1. Test izolacji obejmuje `Bundles` i `FloorPlans`. Test „zero cen” i lista zakazanych marek obejmuje seed, strony marek, zestawy i plan.
