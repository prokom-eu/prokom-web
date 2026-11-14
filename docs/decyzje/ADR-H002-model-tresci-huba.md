# ADR-H002 — Model treści huba pro-kom.eu (Payload)

- **Status:** przyjęta (H0, 14.11.2026; ostateczny kształt pól w planie H1-1)
- **Data:** 14.11.2026
- **Zależy od:** ADR-H001, ADR-022 (`CompanyData`, `SiteSettings.shared`), ADR-003 (`Inquiries`), ADR-024 (maile).

## Zasada
Układ i logika stron są w kodzie. Wszystko, co szef albo Krystian może chcieć zmienić bez programisty (teksty, listy, kolejność, widoczność), jest w panelu. Dane firmy wyłącznie z `CompanyData`. Znaczniki `[SZEF` w treści blokują publikację (hook jak w innych liniach).

Seed z wizualizacji: `seed/prokomeu/strony/*.json` (migawki danych każdej planszy — teksty 1:1). Import w H1-1 skryptem `pnpm seed:prokom` (idempotentny, po `slug`/`key`).

## 1. Dane wspólne — `CompanyData` i `SiteSettings` (stan repo po D1/D2)
Już jest: `CompanyData.lines[]` (`key` z `SHARED_LINE_KEYS`: prokom, biznes, instalacje, software, tech, zakopane, gaming; `name`, `kind`, `order`, `domain`, `url`, `logoLabel`, `color`, `colorOnDark`, `published`, `description`, `descriptionLong`), `company.locations[]` (salony z godzinami i `geo`), `serviceZones`, `holidays`, `legal`, `consent`. Telefon, drugi telefon, e-mail i godziny **linii z własną stroną** są w `SiteSettings` tej linii (`phone`, `phone2`, `email`, `shared.contact.hours` itd.) — hub czyta je stamtąd (jedno źródło).
**Brakuje dla linii bez strony w tej aplikacji (Tech, Gaming)** — dopisać w H1-1 osobnym małym PR `feat/wsp-linie-kontakt` (migracja tylko dodająca): w `CompanyData.lines[]` pola `phone`, `email`, `hours` (tekst, np. „pn–pt 9:00–17:00, sob. 9:00–14:00”), `promise` (krótkie zdanie o czasie odpowiedzi). Dla linii z tenantem pola zostają puste (źródłem jest `SiteSettings`). Status „Otwarte” liczy wspólny `lib/shared/openingStatus.ts` z godzin salonu i `holidays`.

| Linia | Domena | Telefon | E-mail | Godziny | Obietnica (z ustaleń) |
|---|---|---|---|---|---|
| Biznes | prokombiznes.pl | 889 003 889 | kontakt@prokombiznes.pl | pn–pt 9–17 | w godzinach pracy oddzwonimy w 60 minut |
| Instalacje | prokominstalacje.pl | 889 003 889 | kontakt@prokominstalacje.pl | pn–pt 9–17 | odpowiedź w 24 h w dni robocze (nie przyjazd technika) |
| Software | prokomsoftware.pl | 883 200 151 | kontakt@prokomsoftware.pl | pn–pt 9–17 | odpowiedź w 1 dzień roboczy |
| Tech | prokomserwis.pl | 883 200 151 | sklep@pro-kom.eu | pn–pt 9–17, sob 9–14 | bezpłatna diagnoza i wycena; naprawy też kurierem |
| Gaming | prokomgaming.pl | 883 200 151 | kontakt@prokomgaming.pl | [SZEF: „codziennie 8–22”?] | — |
| Firma (hub) | pro-kom.eu | 883 200 151 | biuro@pro-kom.eu | pn–pt 9–17 | — |

## 2. `HubSettings` (dokument per tenant `prokom`, wzór `BiznesSettings`/`SoftwareSettings`/`InstalacjeSettings`)
Grupy pól odpowiadają stronom; każda grupa ma `visible` dla sekcji, które można wyłączyć.
- `home`: hero (kafel PRO-KOM, slajdy linii `heroSlides` — 3 na linię, winiety, liczby), pasek zaufania, kolejność i widoczność sekcji, FAQ (lista), finał. Seed: `Main.json`.
- `dobierz`: używa `HubPlans` (typ `persona`).
- `trust`: liczby firmy — „od 2004”, „100+ klientów firmowych”, autoryzacje (Posnet, Elzab — autoryzowany serwis; InsERT, GoPOS — autoryzowany partner). Każda liczba z polem `source` (wewnętrzne) i `approved` (bez zatwierdzenia nie wyświetla się na produkcji).
- `brands`: grupy marek (Biznes / Instalacje / Tech) z opisem „do czego” — seed `Main.json`, `Partnerzy.json`, `Dostawy.json`.
- `deliveries` (strona Inwestycje i dostawy): segmenty (6), grupy listy zapytania (IT / RTV i AGD / Instalacje) z pozycjami `{key, name, hint}`, usługi dodatkowe (opcjonalne), terminy, obiekty (9, z `preset` ilości), zakres do wyboru (3 poziomy + zakładki „co możemy dodać”), proces (6 kroków), formalności, „po dostawie”, miejscowości, FAQ. Seed: `Dostawy.json` (+ `stany` dla wszystkich zakładek).
- `cooperation` (Współpraca): role (6), etapy (5), zakres (3 zakładki), dostawcy, zasady, FAQ. Seed: `Wspolpraca.json`.
- `about`, `partners`, `coverage` (miejscowości, specyfika Podhala), `contact` (tematy formularza → linia), `forHome` (sytuacje, przekrój domu — 11 punktów, tematy instalacji, gwarancje), `forBusiness` (obszary, wdrożenie, opieka, porównanie, dofinansowania). Seedy: odpowiednie pliki.
- `legal`: treści stron prawnych (projekt — do prawnika).

## 3. Kolekcje
### `HubServices` — „Cała oferta” (49 wpisów)
Pola: `key` (np. `b11`), `line` (biznes|instalacje|software|tech|gaming), `title`, `short`, `long`, `audience` (firma|dom|oba), `includes[]` (3 chipy), `related[]` (relacja do `HubServices`), `keywords` (synonimy do wyszukiwarki), `url` (adres na stronie linii; puste = strona główna linii), `ctaLabel` (np. „Zobacz na prokombiznes.pl”, „Złóż listę zapytania”), `order`, `visible`.
Seed: `Linie.json` → `services` (krotka `[id, line, title, short, long, aud, incl, rel, keywords]`). Seed nie ma adresów pojedynczych usług — `url` domyślnie = strona główna linii; wyjątki w imporcie: `b11`, `b12` → `/inwestycje-i-dostawy` („Złóż listę zapytania”), `i10` → `/wspolpraca` („Współpraca z pracownią”). Dokładne adresy podstron linii Krystian uzupełnia w panelu po starcie linii.
Używane przez: `/linie`, mega menu „Oferta” (liczniki), `/szukaj`, karty „Wszystkie linie” na głównej.

### `HubTools` — „Załatw online” (20 narzędzi)
Pola: `line`, `action` (zglos|sprawdz|policz|zaplanuj|zapytaj), `title`, `desc`, `inputs[]` („co przygotować”), `result` („co dostajesz”), `ctaLabel`, `url` (głęboki link do narzędzia na stronie linii), `preview` (rodzaj podglądu: form|steps|rows|grid|win + dane), `badge` (np. „Wkrótce”, „33 gry”), `featuredOnHome` (2 na linię = sekcja 5×2 na głównej), `order`.
Seed: `Narzedzia.json` → `data` (krotka `[line, act, title, desc, inputs, result, cta, preview, badge]`) + ścieżki `PATHS`.
**Narzędzie z plakietką „Wkrótce” nie linkuje** do nieistniejącej strony — przycisk prowadzi do formularza kontaktu z tematem.

### `HubHelp` — „Co zrobić, gdy…” (26 sytuacji)
Pola: `slug`, `group`, `line`, `title`, `steps[]`, `prep[]` (co przygotować), `ctaLabel`, `relatedTool` (relacja do `HubTools`), `seoTitle`, `seoDescription`, `published`.
Seed: `Pomoc.json` → `cases`. Każda sytuacja ma własną stronę `/pomoc/[slug]` (pod frazy z Google, np. „kamera nie nagrywa co zrobić”).

### `HubPlans` — plany dla branż i sytuacji
Pola: `key`, `type` (persona|branza|sytuacja-firma|sytuacja-dom), `name`, `title`, `lead`, `groups` (lista: `line` + punkty), `start[]` (od czego zaczynamy), `questions[]` (pytania na start), `order`.
Seed: `DlaFirm.json` → `branches` (13), `Main.json` → `personas` (13 — te same branże, krótsze listy), `DlaDomu.json` → `sits` (7), sytuacje firmowe z `DlaFirm.json` (`renderVals`/`stany`).
**Jedna branża = jeden wpis** (`persona` na głównej to skrócony widok tego samego wpisu: pierwsze 3 punkty na linię) — nie dublujemy danych.

### `Posts` (istniejąca) — wpisy huba
Tenant `prokom` dostaje własne wpisy (rzadko). Agregacja zajawek z innych tenantów — ADR-H001 pkt 7.

### `Inquiries` (istniejąca) — kategorie huba
`hub-kontakt`, `hub-dla-firm`, `hub-dla-domu`, `hub-pomoc`, `hub-dostawy`, `hub-wspolpraca` (dopisać do listy kategorii zgodnie z kontraktem ADR-003; sprawdzić w H1-1, jak dziś zapisane są dane dodatkowe zgłoszenia, i użyć tego samego mechanizmu). Dane dodatkowe: `lineKey` (do której linii), `topic`, `role`/`segment`, `list[]` (pozycje listy zapytania `{key, name, qty}`), `services[]`, `term`, `deliveryPlace`, `nip`, `link`. Routing powiadomień: `lineKey` ∈ {biznes, instalacje, software} → `Tenants.notificationEmail` tenanta tej linii; tech, gaming, brak → skrzynka tenanta `prokom`.

## 4. Indeks wyszukiwania
Silnik z D2-2. Źródła dla huba: `HubServices` (z `keywords`), `HubTools`, `HubHelp`, strony huba (lista z `MapaStrony.json`), linie (`Naglowek.json` → `index`, 27 pozycji). Normalizacja polskich znaków (`ł`→`l`, NFD), synonimy z `keywords`. Wynik bez trafienia → „Zadzwoń — pokierujemy” z numerem firmy + zapis zdarzenia w Umami (bez treści zapytania w logach serwera dłużej niż potrzeba).

## Rozstrzygnięcia H1 (14.11.2026, decyzje Krystiana przy planie H1)
1. **Persony i branże osobno.** `Main.json` → `personas` i `DlaFirm.json` → `branches` to różne zbiory (8 wspólnych kluczy; tylko persony: restauracja, pensjonat, dom, ekipy, gracz; tylko branże: gastro, hotel, budowa, teren, gmina) z innymi punktami i kluczami linii. `HubPlans` ma 13 wpisów `persona` i 13 `branza` (+ 7 `sytuacja-dom`), teksty 1:1 z paczki — zamiast „jedna branża = jeden wpis” z §3.
2. **Bez pola publikacji na `Tenants`.** Hub jest niewidoczny na produkcji tak jak Instalacje przed startem: seed daje tylko `prokom.localhost`, domena `pro-kom.eu` (+ Nginx, `PROD_SITE_HOSTS`) dochodzi w H7-2 po akceptacji szefa, `active` zostaje wyłącznikiem.
3. **`HubSettings` rośnie ze stronami.** W H1-1b: `pages` (przełączniki 8 stron v1.1, domyślnie wyłączone; `isHubLinkLive` filtruje linki) i `trust` (`approved`, na produkcji tylko zatwierdzone). `deliveries` i `cooperation` — osobny PR H1-1c; `home`, `brands`, `about`, `partners`, `coverage`, `contact`, `forHome`, `forBusiness`, `legal` — w sesjach stron H2–H5 (migracje tylko dodające).
4. **Kategorie zapytań** `hub-*` jako stała `HUB_INQUIRY_CATEGORIES` (`src/lib/prokom/inquiry.ts`): `Inquiries.category` to wolny tekst, bez migracji.
5. **Blokada `[SZEF`/`[CENA`** we wszystkich kolekcjach `hub-*` przez wspólny `blockedByMarker` (`src/lib/shared/publishMarker.ts`, wzór `InstArchNews`).
6. **Dolny pasek i ikony (PR `feat/wsp-hub-sloty`):** wspólny `TabBar` ma opcjonalny 4. slot (`shared.tabBar.fourth`, hub: „Załatw”), etykieta pierwszej pozycji zostaje „Główna” (SEO 08.11); 22 ikony plansz huba dochodzą do wspólnego zestawu (`seed/prokomeu/ikony.json`).
