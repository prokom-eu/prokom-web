# ADR-014: Model treści prokomsoftware.pl — rozwiązania, obszary, kreator, branże, miejscowości

- **Status:** proponowana (18.10.2026) — do przyjęcia w SW0, rozstrzygnięcia dopisać na końcu
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

## Rozstrzygnięcia (SW0)
_Do uzupełnienia przez Krystiana w SW0._
