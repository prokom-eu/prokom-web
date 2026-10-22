# ADR-014: Model treści prokomsoftware.pl — rozwiązania, obszary, kreator, branże, miejscowości

- **Status:** przyjęta (22.10.2026, SW0) — rozstrzygnięcia na końcu obowiązują zamiast sprzecznych fragmentów §1–§5
- **Data:** 2026-10-18
- **Decyduje:** Krystian
- **Kontekst:**
  - Wizualizacja prokomsoftware.pl zaakceptowana 18.10.2026 (`docs/design/prokomsoftware/`, spec. `docs/strony/prokomsoftware.md`).
  - Strona ma katalog 30 rozwiązań w 5 kategoriach (filtry, wyszukiwarka, lista „Twój projekt”), 8 obszarów na stronie głównej (grupowanie marketingowe), kreator z regułami, strony branż i miejscowości, aktualności i formularz audytu.
  - Fundament i Biznes już mają: multi-tenant, `Pages` z blokami per linia (ADR-010), `Posts`, `Industries`, `Inquiries` (typy `contact`/`list`/`wizard`/`search`), `SiteSettings` z grupą linii (`SiteSettings.biznes.*` — nawigacja, stopka, kanały, obietnice; ADR-012 rozstrz. 2), `BiznesSettings` (wyszukiwarka i kreator jako JSON z Zod), `lib/search.ts` (B4), store `pk-cart`.
  - Ograniczenia: jedna osoba utrzymuje kod; szef zmienia treści bez programisty; migracje w repo (ADR-009); każde zapytanie filtruje po tenancie.
- **Decyzja (skrót):** ten sam podział co Biznes — dane linii w `SiteSettings.software`, konfiguracja wyszukiwarki i kreatora w `SoftwareSettings`. Nowe kolekcje: `Solutions`, `SolutionAreas`, `Cities`. Ponowne użycie `Posts`, `Industries`, `Inquiries`, `Pages`, wyszukiwarki i store’u listy. Strony redakcyjne (główna, cennik, audyt, o firmie, jedna firma, kontakt) to `Pages` z blokami Software.

## 1. Kolekcje i ustawienia

| Element | Nowy? | Zawartość | Seed (`seed/prokomsoftware/`) |
|---|---|---|---|
| `Solutions` | nowa | 30 rozwiązań (§1.1) | `rozwiazania.json` |
| `SolutionAreas` | nowa | 8 obszarów strony głównej (§1.2) | `obszary.json` |
| `Cities` | nowa | strony miejscowości (§1.5) | `miejscowosci.json` |
| `SiteSettings.software` | nowa grupa pól (widoczna tylko dla linii `software`, wzorzec B1b) | nawigacja i mega menu, stopka, menu na telefonie, teksty szuflady „Twój projekt”, kanały kontaktu Software, obietnice, **fakty [SZEF]** (§1.4) | `nawigacja.json`, `fakty.json` |
| `SoftwareSettings` | nowa (jeden dokument na tenanta, `isGlobal`, jak `BiznesSettings`) | wyszukiwarka (synonimy, pomijane, popularne), kreator (JSON + Zod, §1.3), kolejność „12 rzeczy”, warstwy technologii | `wyszukiwarka.json`, `kreator.json`, `popularne.json`, `technologie.json` |
| `Industries` | istnieje | + grupa pól „Software” (§1.6) | `branze.json` |
| `Posts` | istnieje | + `relatedSolutions`; kategorie Poradnik / Nowości / Realizacje | `wpisy.json` |
| `Inquiries` | istnieje | rozszerzenia (§3) | — |
| `InquiryFiles` | nowa, **opcjonalna** | prywatny plik zgłoszenia z kreatora (§3.2) | — |
| `Pages` | istnieje | bloki Software (§2) | teksty z plansz; `strona-glowna.json`, `faq.json`, `demo-aplikacja-ekip.json` |

Nazwy w kodzie po angielsku, etykiety w panelu po polsku (CLAUDE.md, ADR-012 rozstrz. 1).

### 1.1 `Solutions`
- `legacyId` (unikalny w tenancie — seed idempotentny), `slug` (unikalny w tenancie, `lib/tenant/uniqueSlug.ts`), `name`, **`category`** (select: `strony`, `systemy`, `aplikacje`, `automatyzacje`, `opieka` — filtr katalogu i zakładki cennika), `label`, `tag`, `lead`, `features` (3), `forWhom`, `situations` (`Z`/`R`/`P`, wiele), `industryGroups` (8 grup, wiele), `keywords`, `hasLivePreview`, `toast`, `cardGradient` (tylko z listy dozwolonych gradientów).
- **Ceny i terminy (liczby z panelu, nigdy placeholder):** `priceFrom` (najniższa cena „od”, netto), `prices` (`start` / `std` / `full` — rozmiary z kreatora), `leadTime`, `leadTimes` (`start`/`std`/`full`), `priceNote`. Puste → strona pokazuje „Cena po krótkiej rozmowie, na piśmie” (`kreator.json` → `priceDisplay.fallback`).
- **Karta „12 rzeczy”:** `featured` (grupa: `name`, `lead`, `features`, `tag`); kolejność i 2 karty ogólne z `SoftwareSettings.popular`.
- **Strona rozwiązania:** `page` (grupa, opcjonalna): `hero`, `today[]` / `withUs[]` / `effects[]`, `included[]`, `extra[]`, `channels`, `related` (maks. 3), `faq[]`, `demo` (klucz dema; na start tylko `aplikacja-ekip`). Bez `page` — szablon z danych karty.
- Wersje robocze (`drafts`) jak `Products`. Publiczny odczyt tylko opublikowanych.

### 1.2 `SolutionAreas` (8 obszarów — grupowanie marketingowe, nie kategorie)
`key` (`www`, `sys`, `app`, `cal`, `plug`, `auto`, `care`, `aud` — też klucz sceny ilustracji), `name`, `short`, `description`, `gain`, `icon`, `gradient` (2 kolory z listy dozwolonych, ADR-015), **`countLabel`** (tekst redakcyjny, np. „7 rozwiązań”, „3 poziomy” — nie licznik), **`chips[]`** (`label` + opcjonalna relacja `solution`; chip bez relacji nie jest linkiem), `priceFrom` (liczba albo puste), `cta` (`label`, `href` — zwykle `/rozwiazania?kategoria=…`), `order`.
Powód: obszary łączą rozwiązania inaczej niż katalog (np. „Sklepy i rezerwacje”, „Rozbudowa i połączenia”) i mają pozycje bez osobnej strony (PWA, moduł do systemu). Liczenie ich z bazy dawałoby inne liczby niż plansza.

### 1.3 `SoftwareSettings.wizard` (kreator jako dane)
Kształt = `kreator.json`: kroki, potrzeby z pytaniami i opcjami, wyniki, rozmiary, terminy i **notki terminu** (`whenNotes` z regułą `zimaBig`/`zimaSmall`), frazy, sposoby kontaktu (z mapowaniem na `Inquiries.preferredContact`), checklisty, marki podglądu, widoki systemu, akcje automatyzacji, `mapping`, `resultToSolutionSlug`, `priceDisplay`. Schemat Zod w `src/lib/software/wizard.ts`; zapis odrzucony, gdy JSON nie przejdzie walidacji albo slug wyniku nie istnieje. Cena w wyniku = `Solutions.prices[rozmiar]`. Świadomie JSON (jak B1b): reguły zmienia Krystian, nie szef.

### 1.4 Fakty [SZEF] i placeholdery w tekstach
Teksty z plansz zawierają placeholdery (`[CZAS ODPOWIEDZI]`, `[ZASADY PŁATNOŚCI]`, `[TERMIN]`…) w miejscach, gdzie liczba jest częścią zdania (FAQ, proces, cechy). Zamiast przepisywać zdania:
- `SiteSettings.software.facts` — lista `klucz → wartość` (klucze w `fakty.json`), edytowana w panelu;
- funkcja `fillFacts(text, facts)` podmienia `[KLUCZ]`; **tekst z nierozwiązanym placeholderem na produkcji (`SITE_ENV=production`) nie jest renderowany** (element pominięty, ostrzeżenie w logu bez danych osobowych); na stagingu widać placeholder;
- skan przed wdrożeniem (spec. §10 pkt 9) wyłapuje braki.
Pola liczbowe (`priceFrom`, `prices`, `leadTime`) nigdy nie zawierają placeholderów.

### 1.5 `Cities`
`slug`, `name`, `locative` („z Rabki-Zdroju”), `active`, `hero`, `who[]` (branże lokalne z relacją `solution`), `local[]` („dlaczego lokalnie”), `faq[]`, `nearby[]` (tekst), `cta`, `seo`. `active=false` → 404 i brak w sitemap. Zasada: bez unikalnej treści strona nie jest aktywna (spec. §6.9).

### 1.6 `Industries` — grupa „Software”
Rekordy per tenant (osobne od Biznesu). Pola Biznesu (`wizardBusinessType`, `featuredProducts`) ukryte dla linii `software`, grupa `software` ukryta dla `biznes` (wzorzec `SiteSettings` z B1b).
Grupa `software`: `group` (jedna z 8 grup katalogu), `hero`, `problems[]` (pytanie, dopowiedzenie, ikona, rozwiązanie: nagłówek, opis, cechy, relacja `Solutions`, CTA), `moduleMap[]` (nazwa, ikona, pozycja x/y, opóźnienie animacji), `offline[]` (3 kroki), `topSolutions[]` (relacje, 6), `wizardFirm` (rodzaj firmy w kreatorze) — CTA „Złóż system” → `/dobierz?firma=<wizardFirm>`.
Seed: 12 rekordów (`branze.json` → `pagesAtStart`), aktywny tylko ten z treścią (budownictwo i wykończenia).

## 2. Trasy i bloki

| Adres | Gdzie w `src/app/(sites)/[domain]/` | Uwagi |
|---|---|---|
| `/rozwiazania`, `/rozwiazania/[slug]`, `/dobierz`, `/dla-branz/[branza]`, `/miejscowosci/[miasto]` | `(software)/…` | strażnik `requireLine(params, 'software')` w layoucie grupy |
| `/aktualnosci`, `/aktualnosci/[slug]` | **trasa wspólna** poza grupami linii | Biznes buduje ją w **B11 (przed SW)**. ADR-012 rozstrz. 5 przypisuje ją do `(biznes)` — Next nie pozwoli na ten sam adres w dwóch grupach. **Decyzja przed B11:** zbudować od razu jako wspólną (układ wg linii tenanta, wpisy z `Posts` tenanta), dopisać zmianę do ADR-012. SW11 tylko dokłada wygląd Software. |
| `/`, `/cennik`, `/audyt`, `/o-firmie`, `/jedna-firma`, `/kontakt`, prawne | `[slug]` (`Pages`) | bloki Software w rejestrze (ADR-010) |

- Nowe ścieżki do `RESERVED_PAGE_SLUGS` (`src/lib/pages/slug.ts`): `rozwiazania`, `dobierz`, `dla-branz`, `miejscowosci` (`aktualnosci` — w B11).
- **Bloki Software** (`src/sites/software/blocks/`, lista dozwolona tylko dla linii `software`): `swHero`, `swIntents`, `swAreas`, `swPopular`, `swLivePreviews`, `swProcess`, `swWizard`, `swTech`, `swHowWeBuild`, `swCompare`, `swGuarantees`, `swShowcase`, `swFaq` (lub istniejący FAQ z wyglądem Software), `swContact`, `swPricing`, `swCare`, `swIncluded`, `swAuditForm`, `swAuditChecks`, `swStats`, `swTeam`, `swLines`, `swSteps`. Teksty sekcji w polach bloku (wartości startowe: `strona-glowna.json` — `process`, `guarantees`, `compare`, `livePreviews`, `heroModules`, `showcase`); listy (obszary, rozwiązania) z kolekcji.
- Komponenty linii: `src/sites/software/components/` (`SoftwareHeader`, `MegaMenu`, `ProjectDrawer`, `SectionRail`, `SoftwareFooter`, `MobileMenu`). Najpierw sprawdzić, co z B3a/B3b da się uogólnić.

## 3. Zapytania (`Inquiries`)

### 3.1 Rozszerzenia
| Zmiana | Po co |
|---|---|
| `type` + `audit` | formularz `/audyt` |
| `auditUrl` (tekst, http/https) | adres do audytu i „mam już stronę” w kreatorze |
| `preferredContact` + `meeting`, `online` | kreator: mapowanie `tel→phone`, `mail→email`, `salon→meeting`, `online→online` (`kreator.json` → `contactPrefs[].inquiryValue`) |
| `items[].solution` (relacja, opcjonalna) | „Twój projekt”; `nameSnapshot` zostaje obowiązkowe (pozycja „system z N modułów” nie ma rekordu) |
| `topics` — wartości Software | `strona`, `system`, `mobile`, `laczenie`, `opieka`, `audyt` |

Numer `PKS-RRRR-NNNN` jest od B1b. Typy `contact`, `list`, `wizard` bez zmian.

### 3.2 `InquiryFiles` (opcjonalna — pierwsza do cięcia)
Upload w katalogu poza publicznym `MEDIA_DIR`, odczyt tylko `admin`, bez publicznego URL; relacja do zgłoszenia; maks. 10 MB; `.xlsx`, `.xls`, `.csv`, `.pdf`, `.docx` (MIME + rozszerzenie); usuwany z zgłoszeniem i przez retencję (ADR-003). Plik nie trafia do maila — tylko informacja i link do panelu.

## 4. Wyszukiwarka i indeks
- `GET /api/solutions-index` (tylko domena Software, tag `tenant:<id>:solutions`, `max-age=60`): rozwiązania (pola karty + `hay` z `lib/catalog/normalize.ts`), kategorie z licznikami, grupy branż, synonimy. Cel < 30 KB gzip.
- `lib/search.ts` z B4 bez kopii — zmiany wspólne, z testami obu linii.

## 5. „Twój projekt” (przeglądarka)
Store jak `pk-cart` (B4), klucze `pk-project` (identyfikatory: slug albo `build-…`) i `pk-project-n` (nazwy). Na serwer trafia dopiero z formularzem. Jeśli `pk-cart` da się uogólnić (`createListStore(key)`), robimy to zamiast kopii.

## 6. Konsekwencje
- 3 nowe kolekcje, `SoftwareSettings`, grupa `SiteSettings.software`, rozszerzenia `Industries`, `Posts`, `Inquiries` — migracje `up` → `down` → `up`.
- Treści branż, miejscowości, stron rozwiązań i wpisów piszemy w czacie i wgrywamy seedem albo w panelu; kod nie czeka na treść (`active=false`).
- Wgranie seeda na produkcję: tak samo jak Biznes (decyzja z sesji B o imporcie danych na serwer).

## 7. Odrzucone
- **Rozwiązania jako `Products` z Biznesu** — inny kształt; wspólne zostają wyszukiwarka, store listy i wzorzec ustawień.
- **Obszary liczone z kategorii** — obszary i kategorie to różne podziały (§1.2).
- **Kreator jako pola panelu** — szef nie zmienia reguł; JSON z Zod jest krótszy i testowalny.
- **Placeholdery przepisane na osobne pola** — dziesiątki pól dla pojedynczych liczb w zdaniach; `facts` + `fillFacts` jest prostsze i pilnowane skanem.
- **Miejscowości jako `Pages`** — potrzebne pola strukturalne i reguła aktywności.
- **Osobna kolekcja `SoftwareIndustries`** — dwie kolekcje o tej samej roli; wybrana grupa pól w `Industries` (do potwierdzenia w SW0).

## Rozstrzygnięcia (SW0, Krystian 22.10.2026)

Decyzje z przeglądu SW0 (numery D6–D18 jak w przeglądzie). Obowiązują zamiast sprzecznych fragmentów §1–§5.

1. **Branże Software = grupa pól w `Industries`** (D6), bez osobnej kolekcji.
   - `Industries` dostaje ukryte pole `line` i hook kopiujący linię tenanta — ten sam wzorzec co `SiteSettings` (`copyTenantLine`), bo `admin.condition` widzi tylko bieżący dokument.
   - Wspólne pola zostają wspólne: `name`, `slug`, `active`, `hero` (istniejące — grupa `software` **nie** ma własnego `hero`), `faq`, `order`, `seo`.
   - Pola Biznesu (`wizardBusinessType`, `featuredProducts`) ukryte dla linii `software`; grupa `software` (`group`, `problems[]`, `moduleMap[]`, `offline[]`, `topSolutions[]`, `wizardFirm`) ukryta dla `biznes`.
   - Seed ma test spójności: `group` należy do 8 grup katalogu, `wizardFirm` do rodzajów firm z `kreator.json`.
2. **`Posts`:** ten sam ukryty `line` z hookiem; `relatedProducts` tylko dla Biznesu, `relatedSolutions` tylko dla Software. Kategorie Software (`poradnik`, `nowosci`, `realizacje`) dochodzą do wspólnego enumu `POST_CATEGORIES`; walidacja zapisu odrzuca kategorię innej linii.
3. **Bez pliku w kreatorze w etapie 1** (D7). `InquiryFiles` (§3.2) wypada; w kreatorze zdanie „Plik możesz dosłać mailem po kontakcie”. Wraca jako osobne zadanie, jeśli zgłoszenia o programy będą tego wymagać.
4. **Placeholdery** (D8, doprecyzowanie §1.4):
   - `facts` + `fillFacts` zostają, ale **jeden klucz = jedna wartość w całej stronie**. Klucze wieloznaczne zastąpione: `[TERMIN]` w procesie i FAQ → `[CZAS PIERWSZEGO ETAPU]`; `[OD]` w procesie i FAQ → `[OPIEKA OD]`. Klucze `OD`, `TERMIN`, `X`, `Y` usunięte z `fakty.json`.
   - W tekstach rozwiązania `{termin}` oznacza **`leadTime` tego rozwiązania** (np. cecha „Gotowa w {termin}”). Pusty `leadTime` → cecha nie jest renderowana na produkcji (jak nierozwiązany fakt).
   - „Szybkość: było [X], jest [Y]” (toast przebudowy) → „Szybkość: mierzona przed i po przebudowie”.
   - Telefon i e-mail linii tylko z istniejących `SiteSettings.phone` / `SiteSettings.email` (klucze `TELEFON SOFTWARE`, `E-MAIL SOFTWARE` usunięte z `fakty.json`).
   - Ceny i czasy reakcji 3 poziomów opieki to pola bloku cennika, nie fakty.
5. **Jedno źródło ceny i terminu** (§1.1): przechowujemy tylko `prices` (`start`/`std`/`full`) i `leadTimes`. `priceFrom` i `leadTime` są **liczone** (najniższa podana cena; termin rozmiaru `start`, a gdy pusty — pierwszy podany), nie zapisywane. Seed mapuje dotychczasowe `priceFrom`/`leadTime` na `start`.
6. **Formularze kreatora i audytu** (D9): na obu dochodzi pole „Imię” i checkbox zgody (wersja klauzuli z `consent.ts`) — oczekiwana różnica względem plansz. `name` i `message` zostają wymagane (ADR-003 bez zmian); `message` dla `audit` i `wizard` składa serwer z danych (adres strony / podsumowanie kreatora). `Inquiries.items.quantity` dla linii `software` = 1 (pole zostaje wymagane). Pola `type`, `items`, `wizard`, `topics`, `preferredContact` w `inquiryInputSchema` dokłada B8 Biznesu — SW2 rozszerza je, nie pisze od nowa.
7. **Bloki — mniej niż w §2** (D10, doprecyzowanie ADR-010 dla Software): blok tylko tam, gdzie szef zmienia treść albo kolejność. **Cel: ≤ 10 bloków Software.**
   - Bloki: `swHero` (z makietą modułów i kaflami intencji), `swPricing` (cennik rozwiązań + poziomy opieki), `swAuditForm`, `swContact`, `swTeam`, `swLines`, `swSteps`; FAQ, CTA i tekst — istniejące bloki wspólne z wyglądem Software.
   - Sekcje z logiką i stałą kolejnością (spec. §4: obszary, 12 rzeczy, podglądy, proces, kreator, technologie, jak robimy, porównanie, zasady, realizacje) to **komponenty** wstawiane jednym blokiem `swHomeSection` (pole `section`: select z listy sekcji). Ich teksty są w `SoftwareSettings.home` (JSON + Zod, jak kreator; wartości startowe z `strona-glowna.json`, `technologie.json`, `popularne.json`), listy z kolekcji.
   - Dlaczego: sekcje mają ustaloną kolejność i teksty zmieniane tylko decyzją Krystiana (spec. §1 pkt 7) — 23 bloki dałyby dziesiątki tabel i przekroczyły próg ~30 bloków z ADR-010 bez korzyści dla szefa.
8. **Ikony** (D14): jeden zestaw dla wszystkich linii (`ICON_NAMES`, `src/components/ui/icons.ts`). 27 nowych nazw z `seed/prokomsoftware/ikony.json` dochodzi do enumu (migracja). Przy 11 nazwach z innym rysunkiem w obu seedach (phone, cal, chat, clock, doc, shield, users, grad, wrench, life, bell) zostaje rysunek Biznesu — oczekiwana różnica przy porównaniu zrzutów.
9. **„Twój projekt”** (D17, zmienia §5): jeden klucz `localStorage` `pk-project` z listą `{ id, name }` (bez `pk-project-n`). Wspólny `createListStore(key, parse)` wydzielony z `lib/cart/store.ts` (subskrypcja, `storage`, zapas w pamięci, zdarzenia toastu i szuflady), z testami obu linii; operacje listy Biznesu (ilości, uwagi) zostają w `lib/cart/cart.ts`.
10. **Wyszukiwarka** (§4): `prepareSearch`/`searchProducts` z `lib/search.ts` uogólnione do elementów `{ name, hay, popularity? }` w SW3/SW9, z testami obu linii.
11. **`/aktualnosci` — trasa wspólna** (D12, §2): zbudowana w B11 Biznesu poza grupą `(biznes)` (ADR-012 rozstrz. 5 zmienione 22.10.2026); SW11 dokłada wygląd Software.
12. **Ramka strony per linia:** `src/app/(sites)/[domain]/layout.tsx` wybiera dziś ramkę po `settings.biznes`. SW4 wydziela ramkę linii (`src/sites/<linia>/Frame.tsx` albo równoważny podział) zamiast kolejnych warunków.
13. **Kolejność sesji** (D18): SW2 dopiero po scaleniu B11 (wspólne `Inquiries`, `Industries`, `Posts` i migracje). Pełna kolejność: `docs/zadania/prokomsoftware.md` §3.
