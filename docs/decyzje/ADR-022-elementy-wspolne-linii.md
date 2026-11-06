# ADR-022: Elementy wspólne linii PRO-KOM

- Status: przyjęta z poprawkami (F0, 01.11.2026 — sekcja „Poprawki w F0”)
- Data: 01.11.2026
- Decydują: Krystian (architektura), szef (treści oznaczone [SZEF])
- Powiązane: ADR-010 (bloki linii), ADR-012/017 (Biznes), ADR-013/015 (kolory i motywy), ADR-014 (Software), ADR-I001…I005 (Instalacje), ADR-019 (serwer), ADR-020 (analityka Umami — bez ciasteczek, ważne dla strony Cookies). Rozpoznanie: `docs/design/wspolne/MAPA-DZIS.md`.

## Kontekst
Trzy linie w `prokom-web` (Biznes, Instalacje, Software) zbudowały pasek marki, nagłówek, stopkę, formularz, Kontakt i O firmie każda po swojemu. Przegląd 01.11 (na żywo, 3 strony): trzy różne paski marki (inna kolejność linii, inne treści), trzy różne stopki (linie pokazane na trzy sposoby, różne linki prawne, „Serwis” zamiast „Tech”), różne wymiary znaku (Instalacje 140 px), różne wagi nagłówków, trzy różne formularze. Instalacje mają przeniesiony CSS prototypu (`topb`, `hdr`, `ftr2`), Biznes i Software — Tailwind. Dokument zaakceptowany przez szefa 12.10 zakładał wspólny pasek marki, wspólną stopkę z danymi firmy i formularze w jednym układzie.

## Decyzja
1. **Jeden folder komponentów wspólnych** `src/components/shared/` + loader danych `src/lib/shared/`. Komponenty są „czyste” (propsy, bez Payload, bez importów z `src/sites/*`), żeby dało się je skopiować do `prokom-system` (Tech).
2. **Trzy poziomy** (spec §1): wspólne 1:1 / wspólny szkielet z treścią linii / tylko linia. Wygląd i treści sprzedażowe linii zostają.
3. **Dane w panelu:** firma w `CompanyData` (adres, NIP, godziny, salony, linie i marki, strefy dojazdu), linia w grupie pól `shared` w `SiteSettings` (kolekcja per tenant — jedna definicja pól dla wszystkich linii; poprawka F0). Zero literałów kontaktowych w kodzie.
4. **Szablony stron Kontakt i O firmie wspólne** — ten sam układ sekcji, treści z pól linii, **miejsca (sloty) na sekcje własne linii** (spec §6.0); unikalne H1/lead per linia.
5. **Mapa adresu = jeden komponent** z SVG z OpenStreetMap trzymanym w repo (wzór Software v23); bez Google w ramce i bez ciasteczek; link „Wyznacz trasę” otwiera mapy dopiero po kliknięciu.
6. **Tokeny ról** (accent, accent-text, accent-soft, on-dark…, `line-dark`) dla każdej linii; stopka i ciemne pasy = `line-dark` linii.
7. **PRO-KOM Gaming = marka produktowa poza systemem** — w systemie tylko jako odnośnik (kafelek w pasie linii, pozycja w przełączniku, chip w menu), sterowany flagą `published`.
8. **Tech (prokomserwis.pl)** dostaje te same elementy jako kopię komponentów w `prokom-system` z oznaczeniem wersji (`wspolne v1 @ <commit prokom-web>`), nie wspólną paczkę npm.
9. **Zasady treści 01.11:** bez WhatsAppa, bez zdjęć ludzi, bez „sklepu” przy pro-kom.eu, nazwa „Tech”, dane z panelu.

## Rozważone opcje
- **A. Wspólny folder w prokom-web + kopia w prokom-system (wybrane).** Jedna implementacja dla 3 stron, Tech kopiuje gotowe komponenty raz. Koszt utrzymania: przy zmianie wspólnego elementu ręczna aktualizacja kopii w Tech (rzadko — elementy są stabilne).
- B. Pakiet npm w monorepo/prywatnym rejestrze dla prokom-web, prokom-system i prokom-gaming. Odrzucone teraz: różne wersje Next/React (14 vs 16), dodatkowa infrastruktura (publikacja, wersjonowanie) dla jednej osoby. Wrócić, gdy powstanie PRO-KOM System (2027) i trzecie repo będzie potrzebować tych samych komponentów.
- C. Zostawić każdą linię osobno, tylko wyrównać treści. Odrzucone: dane rozjadą się znowu (już raz się rozjechały: godziny, strefy, nazwy linii), trzy razy więcej pracy przy każdej zmianie.

## Konsekwencje
- + Zmiana adresu/godzin/nowej linii = panel. + Spójność marki i danych NAP (SEO lokalne). + Mniej kodu w liniach.
- − Jednorazowa przeróbka powłoki trzech linii (Instalacje najwięcej — z klas prototypu). − Ryzyko regresji wyglądu — ograniczamy zrzutami przed/po i małymi PR-ami.
- **Podział pracy (v2, 01.11):** część wspólna (dane, migracje, komponenty, szablony z miejscami na sekcje linii) powstaje raz w sesjach fundamentu F0–F4; wpięcie w ramkę linii (L1) i Kontakt/O firmie z sekcjami własnymi (L2) robią sesje w folderze danej linii. Sesje linii nie zmieniają części wspólnej ani wspólnych migracji — brak = osobny PR `feat/wsp-*`. Powód: jedna wersja części wspólnej i brak konfliktów migracji przy równoległej pracy linii, a każda linia zachowuje swoje dodatki.
- Etap A (F0–F2 + L1 każdej linii) przed produkcją linii; etap B (F3, L2, F4) może wejść po produkcji bez zmiany adresów. Plan: `docs/zadania/wspolne-elementy.md`.

## Poprawki w F0 (decyzje Krystiana 01.11.2026, po rozpoznaniu `MAPA-DZIS.md`)
1. **Numer i folder:** pakiet zakładał `docs/adr/ADR-020`. ADR-y leżą w `docs/decyzje/`, a numer 020 zajmuje analityka Umami (021 — Sentry) → ten dokument to **ADR-022** w `docs/decyzje/`.
2. **Grupa `shared` linii w `SiteSettings`**, nie w `BiznesSettings`/`InstalacjeSettings`/`SoftwareSettings`. Powód: telefon, e-mail, stopka i linki prawne linii już są w `SiteSettings` (jeden dokument na tenant); ustawienia linii nie mają pól kontaktowych. Jedna definicja, jedna tabela, jedna migracja, bez dublowania `phone`/`phone2`/`email`.
3. **Salony = rozszerzone `CompanyData.locations[]`** (dochodzą `key`, `geo`, `parkingNote`, `published`), bez nowego `salons[]`. Powód: `locations[]` czytają już paski i stopki wszystkich linii — bez przenoszenia danych.
4. **Znak w nagłówku 180×36 px na wszystkich liniach** (Instalacje 140 → 180). Minimum 220 px z księgi znaku dotyczy druku.
5. Rozpoznanie: zdarzenia `click_whatsapp` w kodzie nie ma (nic do usunięcia w analityce); Biznes nie ma `ServiceAreaMap` — wzorcem jest `AreaMap.tsx`; znak główny z zieloną kreską jest w `public/brand/`; znaki TECH (paczka znaku poza repo, `docs/marka.md`) i Gaming (repo `prokom-gaming`) są gotowe — F2 kopiuje je do `public/brand/`.

## Rozstrzygnięcia D1-1 (decyzje Krystiana 05.11.2026)
1. **Znaczniki `[SZEF…]` / `[Krystian…]` bez wersji roboczych.** `CompanyData` i `SiteSettings` nie mają drafts, a włączenie ich dla jednego pola blokowałoby całe ustawienia linii i dokładało tabele wersji. Zapis tekstu ze znacznikiem jest dozwolony, ale tekst nie wychodzi z `getSharedData` (`src/lib/shared/markers.ts`): znacznik w tekście głównym wiersza (nazwa, ulica, tytuł, treść, wartość, pytanie, odpowiedź, link…) ukrywa cały wiersz, w polu opcjonalnym (np. `parkingNote`, `descriptionLong`) zeruje tylko to pole. Nazwa lub NIP firmy ze znacznikiem = dane firmy niegotowe (loader zwraca `null`). Hook blokujący publikację (wzór `InstArchNews`) zostaje dla kolekcji z wersjami roboczymi.
2. **Pola WhatsApp zostają** (`SiteSettings.biznes.whatsapp`, `InstalacjeSettings.whatsapp`). Usunięcie = migracja usuwająca dane — osobny PR `feat/wsp-*` po tym, jak D3 każdej linii zdejmie WhatsApp z UI.
3. **Fakty w hero Kontaktu mają rodzaj** (`text` | `email` | `phone` | `phone2`): e-mail i telefony linii nie są przepisywane do faktów, loader bierze je z pól linii (jedno źródło danych kontaktowych).
4. **Ścieżki stron prawnych** — jedno źródło: `CompanyData.legal` (te same ścieżki we wszystkich liniach). `SiteSettings.footer.links` zostaje do D3 (L1 przechodzi na `legal`).
5. **Salon w Zakopanem nie jest seedowany** (decyzja Instalacji 01.11: firma nie ma salonu w Zakopanem); linia `zakopane` w `CompanyData.lines` istnieje z `published: false`.
6. **Liczby z plakietką (`about.stats[].flag`)** loader przepuszcza; ukrycie na produkcji robi `StatsStrip` w D2 (spec §6.2 pkt 2) — z testem.

## Rozstrzygnięcia D2-1a (05.11.2026, plan D2 zaakceptowany przez Krystiana)
1. **Podział D2-1** na D2-1a (tokeny, pasek przewijania, `LineLogo`, `OpeningStatus`, `BrandBar`, `SiteHeader`-kapsuła) i D2-1b (stopka, mapa, telefon, strony prawne) — PR ≤ ~800 linii. `/_wspolne` powstaje od D2-1a i rośnie z każdym PR (e2e komponentów).
2. **Pasek przewijania:** suwak 80 % akcentu zamiast ~68 % ze spec §3 — przy 68 % cztery pary linia/motyw nie osiągają 3:1 (WCAG 1.4.11); 14 px tylko pasek strony, wewnątrz strony 8 px.
3. **Status „Zamykamy za N min”:** `#C27500` zamiast `#C77800` — 3:1 także na papierowym `surface-2` Instalacji i Software. Tekst statusu zawsze w kolorze tekstu, stan niesie kropka i słowa.
4. **Tokeny kapsuły** `--cap-*`, `--nav-*`, `--cap-cta-*` (nie `--cta-*` z NAGLOWEK-KAPSULA §4 — `--cta-bg` zajmują płaskie CTA Software).
5. **Wspólna funkcja statusu** (`src/lib/shared/openingStatus.ts`, święta i „Zamykamy za”) obok `lib/site/hours.ts` linii — linie przechodzą na nią w D3, potem stara znika. Tak samo `lib/shared/hideOnScroll.ts` (kopia reguły z powłoki Instalacji).
6. **Telefon (≤ 1080 px):** wg planszy 11 — znak, krótka akcja, Menu; prawe przyciski (z lupą) w arkuszu Menu. Spec §7 (02.11) chciał lupy w nagłówku poniżej 1400 px — do potwierdzenia.
7. **Krótka etykieta akcji** (`headerCta.shortLabel`) nie ma pola w panelu — dodaje je D3 PR 1 (migracja tylko dodająca); do tego czasu podgląd bierze ją z `demo.ts`.

## Rozstrzygnięcia D2-1b (06.11.2026, po przeglądzie — decyzja Krystiana: mapa jako plik)
1. **Mapa adresu jako statyczny plik** `public/brand/mapa-orkana.svg` (46 KB, ok. 16 KB gzip), rysowany przez `<svg><use href="…#map"/></svg>` — przeglądarka pobiera go raz i trzyma w pamięci podręcznej między stronami, zamiast ok. 60 KB ścieżek w HTML i danych RSC każdej strony (stopka jest wszędzie). Plik generuje `scripts/address-map-svg.mjs` z rysunku OSM (`src/lib/shared/osmMap.generated.ts`, przeniesiony z Software; Software czyta go przez re-eksport do D3-S); test pilnuje zgodności i limitu 60 KB (spec §9). Kolory w pliku przez `style="…var(--am-…)"`, więc wariant jasny/ciemny działa. Katalog `/brand`, bo `proxy.ts` przepuszcza tylko jawną listę katalogów `public/`.
2. **Akcent mapy wynika z wariantu** (`light` → `--accent`, `dark` → `--on-dark`), bez osobnego propu `accent` ze spec §5 — mapa zawsze stoi w kolorach linii.
3. **Dolny pasek (`TabBar`) zostawia pod stroną miejsce na siebie** (WCAG 2.4.11) — ramki linii nie dodają własnego odstępu.
4. **Kolumny stopki dwa razy w DOM:** lista na komputerze i akordeon `<details>` na telefonie (spec §7); ukryta wersja jest `display: none`, więc poza drzewem dostępności.
5. **Przełącznik motywu (Jasny / Ciemny / Auto) w arkuszu Menu tylko w liniach z ciemnym motywem** (ADR-013); „Auto” usuwa zapisany wybór (`useThemeChoice`).
6. **Pas linii ma tyle kolumn, ile linii** (5 dziś, 6 po publikacji Gaming) — bez pustego miejsca.
7. **Druga pinezka salonu** (spec §5 `AddressMap`) — nie teraz: jedyny drugi salon (Zakopane) ma `published: false`; wraca w D3, gdy salon powstanie.

## Rozstrzygnięcia D2-2a (06.11.2026, po przeglądzie)
1. **Podział D2-2** na D2-2a (silnik wyszukiwania w `lib/shared/search` + `SiteRail` z dodatkami 1, 3, 4) i D2-2b (`SearchDialog`, paleta poleceń, ostatnio oglądane, skróty) — PR ≤ ~900 linii.
2. **Szyna czyta sekcje strony po każdej nawigacji** (`usePathname`), bo w D3 zostaje zamontowana w ramce linii, gdy App Router podmienia stronę; do pierwszego odczytu liczą się wszystkie sekcje strony głównej.
3. **Esc zwija szynę i zostawia fokus** (WCAG 2.4.3); następny ruch fokusu albo kursor nad szyną rozwija ją znowu.
4. **Jedna nazwa nawigacji „Sekcje strony”** na każdej stronie; grupy w środku (`role="group"`): „Na tej stronie” i „Strona główna”.
5. **Ruch z tokenów** `--dur-*` / `--ease-*`; stałe zostają tylko dla opóźnień mostu (otwarcie = `--dur-press` 120 ms, zamknięcie 250 ms) i jednorazowego pulsu Szukaj. Linia postępu: `animation-timeline: scroll()` tam, gdzie przeglądarka umie, odczyt raz na klatkę jako zapas.
6. **Obwódka szyny wewnątrz (`border`), cień na opakowaniu (`drop-shadow`)** — `clip-path` zwiniętej szyny ucinał pierścień i cień.

## Rozstrzygnięcia D2-2b (06.11.2026, po przeglądzie)
1. **„Zapytaj o …” → `/kontakt?fraza=<fraza>`** (`contactWithPhrase`, `PHRASE_PARAM` w `lib/shared/search/provider.ts`) — ten sam parametr, który czyta już Biznes. Wspólny `ContactForm` (D2-3) wypełnia nim treść wiadomości.
2. **Okno nie otwiera się, gdy jest otwarty inny `<dialog>`** (arkusz Menu, podgląd) — w D3 lupa w arkuszu najpierw zamyka arkusz, potem woła `requestSearch()`.
3. **Enter otwiera wynik z fokusem** (strzałki z pola), jak w wyszukiwarce Biznesu — Enter w samym polu nic nie robi; stopka okna podpowiada klawisze.
4. **„Ostatnio oglądane” zapisuje tylko wspólny `RecordRecent`** (`recordRecent` sprawdza `CompanyData.recentlyViewed`) — linie nie piszą własnego kodu pamięci przeglądarki, więc flagi pilnuje jedno miejsce.
5. **Słowa kluczowe palety tylko całymi wyrazami** (fraza = słowo albo zaczyna się słowem i spacją; token ≥ 3 litery jako początek słowa) — „telewizja”, „alarm do domu” nie wyciągają akcji.
6. **Wpięcie w D3** przez leniwie ładowany komponent (jak ADR-023 „CSS per linia”: okno w ramce linii nie powinno obciążać pierwszego wczytania strony); indeks linii przez `buildLineProvider`.

## Rozstrzygnięcia D2-3a (06.11.2026, po przeglądzie — decyzja Krystiana)
1. **Podział D2-3** na D2-3a (`ContactForm`, `ConsentField`, `SuccessPanel`, walidacja kontaktu, strefy) i D2-3b (moduły Kontaktu i O firmie).
2. **Zgoda w formularzach wspólnych — do opinii prawnika i osobnego ADR:** zawsze klauzula z kodu (`CONSENT_CLAUSE`, wersja, którą zapisuje serwer; git trzyma każde brzmienie) i zawsze pole do zaznaczenia (`formConsent` w `lib/shared/consent.ts`). Pola `CompanyData.consent.mode/clause/version` czekają — inaczej zmiana tekstu w panelu bez zmiany wersji albo tryb „info” dałyby w rekordzie zgodę, której klient nie widział albo nie wyraził. Opis pola w panelu to mówi.
3. **Wybrany chip tematu idzie jako `category` (temat) zapytania**, nie `topics` — serwer Software i Instalacji przyjmuje w `topics` tylko własne klucze (`schema.ts`).
4. **Reguły linii z jednego miejsca:** `ContactForm` dostaje linię, `sharedRulesFor(line)` daje te same reguły co serwer (Instalacje — telefon, Biznes — wiadomość opcjonalna).
5. **Strefy tylko z panelu** (`findZone`): cała nazwa albo — od 3 liter — początek, gdy pasuje dokładnie jedna miejscowość. Seed: Raba Wyżna w strefie Podhale (spec F3 pkt 3; wcześniejszy wzorzec Instalacji przypisywał ją do Rabki).
6. **Potwierdzenie mailem** na ekranie sukcesu jako zapowiedź („wyślemy”) — serwer może je wstrzymać (limit 3 na dobę).

## Rozstrzygnięcia D2-3b (06.11.2026, po przeglądzie — w nocnej sesji bez Krystiana: **decyzje do potwierdzenia rano**)
1. **`RulesBento` przyjmuje 6–8 reguł** (`RULES_MAX = 8`), Biznes zostaje przy „Ośmiu zasadach” (MAPA-DZIS: „6–8” albo „8 → 6” do F3). Jedna lista `<ol>` (czytnik liczy wszystkie reguły), siatka: duża karta obok siatki 2 kolumn od 1000 px, ostatnia reguła jako ciemny pasek.
2. **Mapa zasięgu bez geografii:** `layoutTowns` rozkłada miejscowości stref na pierścieniach wokół salonu (strefa = pierścień). Panel ma tylko nazwy, więc nowa miejscowość pojawia się bez kodu. Miejscowość salonu i powtórki są pomijane. Na telefonie (< 768 px) zamiast 20 etykiet są kropki, a etykieta tylko przy znalezionej miejscowości. Warstwice przychodzą z serwera (`background`), poza paczką JS.
3. **„Liczba linii” w `StatsStrip` liczy opublikowane linie** (`kind: 'linia'`) z odmianą („4 linie”, „5 linii”). Plansza mówi „5”, bo zakłada Zakopane — liczba dojdzie sama po publikacji.
4. **Rok „2004” nie ma pola w panelu** — na razie w kodzie podglądu i szablonu (`TODO(krystian)`); pole w `CompanyData` dopiero po decyzji (migracja).
5. **`FaqBlock` znika bez odpowiedzi** — odpowiedzi seeda mają znacznik `[Krystian…]`, więc FAQ pokaże się po uzupełnieniu w panelu.

## Rozstrzygnięcia D2-4 (06.11.2026, po przeglądzie — w nocnej sesji bez Krystiana: **decyzje do potwierdzenia rano**)
1. **Bez nowych slotów:** szablony mają dokładnie sloty z §6.0 (`ContactPage`: `heroAside`, `afterRoutes`, `formPrefill`, `afterForm`, `beforeFaq`, `showServiceArea`, `showOtherLines`; `AboutPage`: `afterStats`, `afterRules`, `afterSteps`, `beforeVisit`, `showVerify`). Drugi salon (Instalacje) idzie do `heroAside`; karta adresu pokazuje pierwszy salon z `contact.salonKeys`, a JSON-LD `LocalBusiness` — wszystkie salony linii.
2. **Nagłówek wizyty „Wpadnij do nas — {ulica}, {miasto}.”** zamiast planszowego „Wpadnij do Rabki, …” — panel nie ma odmiany nazwy miasta.
3. **Nagłówek pasa linii z liczby:** „{n} linie/linii PRO-KOM”, z Gaming — „… i marka PRO-KOM Gaming” (plansza: „Pięć linii…” słownie).
4. **Rok i opis „od 2004” w stałej `FOUNDED`** (`lib/shared/pages.ts`, `TODO(krystian)`) do czasu pola w `CompanyData`.
5. **Podgląd szablonów** na `/_wspolne/kontakt` i `/_wspolne/o-firmie` (w ramie linii, 404 na produkcji, `noindex`), każdy slot jako ramka „slot: nazwa”. Trasy `/kontakt` i `/o-firmie` linii zmienia D3.
