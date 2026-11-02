# Elementy wspólne linii PRO-KOM — specyfikacja (v1, 01.11.2026)

Dotyczy: **prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl** (repo `prokom-web`, tenanty) oraz **prokomserwis.pl** (linia Tech, repo `prokom-system` — kopia komponentów, plan w `prokom-system/docs/wspolne/`).
Nie dotyczy: **prokomgaming.pl** (marka produktowa — patrz §2.4).

Wzorzec wyglądu: płótno Claude Design „PRO-KOM · elementy wspólne linii” — https://claude.ai/artifact/7HKNezL1nNmgeZPJum8rQG (Krystian). Kopia źródeł plansz w repo: `docs/design/wspolne/plansze/*.dc.html` (czytelny HTML z dokładnymi kolorami, wymiarami i tekstami — patrz `plansze/README.md`). Decyzja: `docs/decyzje/ADR-022-elementy-wspolne-linii.md`. Plan sesji: `docs/zadania/wspolne-elementy.md` (v2: fundament F0–F4 raz + sesje linii L1–L2 w folderze każdej linii). Stan kodu przed zmianami, dodatki linii i mapowanie danych: `MAPA-DZIS.md` (F0).

**Kolejność ważności:** dla elementów z tego dokumentu: plansze → ten plik → specyfikacje linii. Dla treści i sekcji, które należą tylko do linii (hero, oferta, kreator, katalog…), wygrywają specyfikacje linii i ich zaakceptowane wizualizacje — tego nie ruszamy.

---

## 0. Po co
Klient przechodzi między stronami PRO-KOM i ma od razu wiedzieć, że to ta sama firma: ten sam pasek marki, ta sama stopka z tymi samymi danymi, ta sama mapa, ten sam formularz. Dziś każda strona robi to inaczej (Instalacje mają własne klasy z prototypu, Software inną stopkę, Biznes inny pasek). Budujemy to **raz**, w jednym folderze komponentów, z danymi z panelu. Zmiana adresu, godzin czy nowej linii = zmiana w panelu, nie w trzech miejscach kodu.

## 1. Trzy poziomy
| Poziom | Co | Zasada |
|---|---|---|
| **Wspólne 1:1** | pasek marki z przełącznikiem linii, status godzin, pas „Jedna firma — linie PRO-KOM”, pasek prawny i linki prawne, mapa adresu, wizytówka firmy (dane, NIP, CEIDG), zgoda/klauzula i ochrona formularza | ten sam kod i ta sama treść; zmienia się tylko podświetlona linia i akcent |
| **Wspólny szkielet, treść z linii** | nagłówek, kolumny stopki, formularz (rdzeń pól + tematy linii), FAQ, „Jak pracujemy”, dolny pasek i arkusz Menu na telefonie, **boczna szyna z wyszukiwarką (≥ 1400 px)**, **szablon Kontakt**, **szablon O firmie** | ten sam układ i zachowanie; linia podaje pozycje, teksty, kroki, pytania |
| **Tylko linia** | hero i H1 strony głównej, oferta/katalog/usługi, kreator/konfigurator/plan, mega menu, tło neutralne linii (Biznes granat, reszta papier/grafit), ilustracje i sceny | nie ujednolicamy; zaakceptowane wizualizacje zostają |

## 2. Zasady treści (decyzje 01.11.2026 — obowiązują wszędzie)
1. **Bez WhatsAppa** — żadnego kafelka, linku `wa.me`, ikony ani wzmianki na żadnej stronie linii (także FAQ, stopka, kontakt, telefon, wyszukiwarka Biznesu, opcja „preferowany kontakt” w formularzach). Zdarzenia `click_whatsapp` w kodzie nie ma (F0) — w analityce nic do usunięcia. Lista miejsc: `MAPA-DZIS.md` §5.
2. **Bez zdjęć ludzi** (szef, Krystian, pracownicy) — nigdzie. Sekcji „Ludzie/Zespół” ze zdjęciami nie ma; miejsca na portrety usuwamy (także zaślepki „zdjęcie właściciela”). Cytat właściciela może zostać bez zdjęcia, jeśli szef zatwierdzi treść.
3. **Dane tylko z panelu** (CompanyData + ustawienia linii): telefon, e-mail, adres, NIP, godziny, salony, opisy linii. Literały w kodzie — test, który je wyłapuje (§10).
4. **Bez obietnic, których szef nie potwierdził** — pola w panelu z blokadą publikacji przy znaczniku `[SZEF` (wzór: hook z `InstArchNews`).
5. **pro-kom.eu = strona główna firmy, wszystkie linie. Nie ma i nie będzie tam sklepu** — nigdzie nie piszemy „i sklep”.
6. **Nazwy linii:** PRO-KOM (marka główna), Biznes, Instalacje, Software, **Tech** (nie „Serwis”), Zakopane. Słowo „serwis” zostaje w treściach Tech (SEO).
7. **Zakopane:** pokazujemy tylko tam, gdzie linia ma salon/obsługę w Zakopanem (Instalacje); Biznes i Software — tylko Rabka (decyzje K4 i v23). Lista salonów linii w panelu.

### 2.4 PRO-KOM Gaming — marka produktowa (poza systemem wspólnym)
- Należy do PRO-KOM, ale ma **wszystko swoje**: nawigację, stopkę, wygląd, repo `prokom-gaming`. Elementy wspólne jej **nie** dotyczą i jej nie zmieniamy.
- Na stronach linii Gaming jest **tylko odnośnikiem**: 6. kafelek w pasie linii (stopka, Kontakt, O firmie), pozycja „Gaming” na końcu przełącznika w pasku marki, chip w arkuszu Menu na telefonie.
- Kafelek Gaming jest wyraźnie inny niż kafelki linii: tło `#080C0B`, ramka `rgba(242,194,48,.45)`, napis „PRO-KOM / GAMING” w złocie `#F2C230` (w kodzie: plik znaku z repo Gaming, nie znak linii), opis „Komputery gamingowe · marka PRO-KOM”.
- Widoczny dopiero po starcie (20.11) — flaga `published` w `CompanyData.lines`.
- Po stronie Gaming (osobne zadanie w tamtym repo): w jego stopce, w jego stylu, linijka „PRO-KOM Gaming to marka PRO-KOM Tadeusz Wójciak · NIP 7352511447 · pro-kom.eu”.

## 3. Tokeny
Kolory linii są już w `src/styles/tokens.css` (`--c-biznes`, `--c-instalacje`…). Dodajemy brakujące tokeny **ról** (nazwy przykładowe — dopasuj do konwencji repo):

| Token roli | Biznes | Instalacje | Software | Tech |
|---|---|---|---|---|
| `accent` (przyciski, tło akcentu) | #244FB0 | #007A96 | #6E45D4 | #C4362B |
| `accent-text` (tekst w kolorze linii) | #244FB0 | #006A82 | #5B33C4 | #B3301F |
| `accent-soft` (tło chipów, „dziś”) | #E9EDF6 | #E1F2F6 | #ECE7FB | #FBE9E6 |
| `on-dark` (przycisk na ciemnym) | #4A7BE0 | #12B6D8 | #9670EE | #E2483A |
| `on-dark-text` (tekst akcentu na ciemnym) | #8DADF0 | #4CCBE6 | #B49BF5 | #F29185 |
| `on-dark-ink` (tekst NA przycisku on-dark) | #06102A | #06181C | #120A26 | #1A0806 |
| `surface` | #FFFFFF | #F4F5F1 | #F4F5F1 | #F4F5F1 |
| `surface-2` | #F3F5FA | #ECEEE8 | #ECEEE8 | #ECEEE8 |
| `ink` / `ink-2` | #0D1326 / #4A5470 | #121613 / #4F5650 | #121613 / #4F5650 | #121613 / #4F5650 |
| `border` | #E2E6EF | #DCDFD8 | #E3E6DF | #E3E6DF |
| **`line-dark`** (stopka, ciemne pasy, hero Kontakt/O firmie) | #0A1430 | #071214 | #161A17 | #1A1312 |
| `line-dark-text` | #AEB8D2 | #9FB0B4 | #A9AFA9 | #B9AEAC |

Kolory znaku (pas linii, przełącznik): PRO-KOM #45A02C / #4FB034 · Biznes #244FB0 / #4A7BE0 · Instalacje #0093B3 / #12B6D8 · Software #8B61E3 / #9670EE · Tech #D13A2E / #E2483A · Zakopane #DD8600 / #F29A00 · Gaming (marka) złoto #F2C230 na #080C0B (w pasku marki na jasnym tle kreska #D9A400).

**Zasada „ciemny kolor linii”:** każda stopka i każdy ciemny pas to `line-dark` danej linii (Biznes granat, Instalacje turkusowa czerń, Software grafit, Tech ciepły grafit). Nie mieszamy kolorów linii.

**Skala tekstu (wspólna od H2 w dół, H1 hero zostaje linii):** H2 `clamp(32px, 3.8vw, 48px)` / 1.0 / 800 / -0.025em (Archivo, `font-stretch: 108%`); H3 20–24 / 800; nadtytuł 12 / 800 / +0.12em / wersaliki / `accent-text`; tekst 16 / 1.6 Manrope; mały 14 / 1.5. **Waga nagłówków 800 wszędzie** (Instalacje dziś 900 → 800 przy okazji F2/L1 tylko w elementach wspólnych; nagłówki sekcji linii ruszamy dopiero, gdy Krystian zdecyduje).

**Przyciski:** duży 56–58 px (promień 16), średni 44 (14), mały 40 (14), waga 800, zawsze tekst + opcjonalna ikona. Na ciemnym: `on-dark` + `on-dark-ink`. Obrys: 1.5 px `border` (na ciemnym `rgba(255,255,255,.26)`).

**Wymiary:** pasek marki 40 px, nagłówek 76 px, kontener 1280 px (padding boczny 32 px), promienie 10/14/16/22/28, cel dotyku ≥ 44 px (pola formularza ≥ 52 px), odstęp sekcji 72–80 px.

**Pasek przewijania (decyzja Krystiana 02.11, plansza „07 · Szyna” §6):** każda linia ma pasek przewijania strony w swoich kolorach — tor `surface-2`, suwak = akcent linii zmieszany ~68% z torem (`color-mix`), pełny akcent po najechaniu, zaokrąglony, 14 px z 3 px obramowaniem w kolorze toru; w oknach, mega menu, arkuszach i wynikach wyszukiwarki wersja cienka 8 px. Ciemny motyw: suwak w `on-dark`. Dotyczy **głównego paska przewijania okna przeglądarki po prawej** (dziś domyślny szary) i pasków wewnątrz okien. Chrome/Edge/Safari: `::-webkit-scrollbar*` (zaokrąglony suwak z obramowaniem); Firefox: `scrollbar-color` (+ `scrollbar-width: thin` w oknach) **tylko w `@supports not selector(::-webkit-scrollbar)`** — od Chrome 121 samo `scrollbar-color` wyłącza style `::-webkit-scrollbar` i suwak wraca do prostego wyglądu. Reguła raz w globalnych stylach z tokenów (`html[data-line=…]`), bez JS. Ograniczenia: telefony i macOS z ukrytymi paskami („pokaż paski: automatycznie”) pokazują systemowy, nakładany pasek — tam bez zmian. Software ma kolorowy pasek z v23 (`src/app/(sites)/globals.css:385–409`), ale z opisanym wyżej błędem: `scrollbar-color` stoi bezwarunkowo, więc w Chrome/Edge 121+ jego `::-webkit-scrollbar` nie działa (F0b, `MAPA-DZIS.md` §10.3) — F2 zastępuje go regułą wspólną dla 3 linii. Przewijaki ukryte samym `[scrollbar-width:none]` (ok. 20 w Software, 2 w Biznesie) potrzebują też `::-webkit-scrollbar { display: none }`, inaczej reguła wspólna pokaże w nich pasek. Test: kontrast suwaka do toru ≥ 3:1 (WCAG 1.4.11) w obu motywach.

**Ruch:** tylko `transform`/`opacity`, `prefers-reduced-motion` wyłącza wszystko (zgodnie z systemem ruchu Software v23).

## 4. Dane (panel)
Nazwy sprawdzone w F0 (mapowanie pole po polu: `MAPA-DZIS.md` §9): firma — global `CompanyData` (`company-data`); linia — kolekcja `SiteSettings` (`site-settings`, jeden dokument na tenant, już ma `phone`, `phone2`, `email`, `footer`, `navigation`); `BiznesSettings`/`InstalacjeSettings`/`SoftwareSettings` nie mają pól kontaktowych; zapytania — `Inquiries` (typ `contact`, nie „kontakt”). F1 używa istniejących pól, nie dubluje. Kształt docelowy:

### 4.1 Wspólne (jedna kopia dla całej firmy) — rozszerzenie `CompanyData`
- `name` (istnieje; = nazwa prawna „PRO-KOM Tadeusz Wójciak”), `nip` (istnieje) „7352511447”, adres = pierwsza lokalizacja `locations[]` (`key: rabka`: `street` „ul. Orkana 16B”, `postalCode` „34-700”, `city` „Rabka-Zdrój”), `geo` (lat, lng — z OSM), `mapsUrl` (link „Wyznacz trasę”: `https://www.google.com/maps/dir/?api=1&destination=<adres zakodowany>`), `ceidgUrl`.
- Godziny: istniejące `locations[].hours[]` {`days`, `opens`, `closes`} — godziny firmy = godziny lokalizacji `rabka` (pn–pt 9:00–17:00, sob–nd zamknięte); nowe `holidays[]` (daty zamknięte) — używa `OpeningStatus`.
- **Salony = istniejące `locations[]`** (decyzja F0 — bez nowego `salons[]`), rozszerzone o `key`, `geo`, `parkingNote`, `published`; mają już `name`, `street`, `postalCode`, `city`, `hours[]` (osobne dla każdego salonu). W spec dalej „salon” = element `locations[]`.
- `lines[]` (pas linii, przełącznik, rodzina na O firmie): `key` (prokom|biznes|instalacje|software|tech|zakopane|gaming), `name`, `kind` (`linia` | `marka`), `domain`, `url`, `color`, `colorOnDark`, `logoLabel` („BIZNES”… dla PRO-KOM i Gaming puste), `description` (krótki: „Kasy, komputery, opieka IT”), `descriptionLong` (O firmie), `published`, `order`.
  - Wartości startowe: PRO-KOM — pro-kom.eu — „Wszystkie linie PRO-KOM” / „Strona główna firmy — wszystkie linie PRO-KOM w jednym miejscu.” · Biznes — prokombiznes.pl — „Kasy, komputery, opieka IT” · Instalacje — prokominstalacje.pl — „Monitoring, sieci, smart home” · Software — prokomsoftware.pl — „Strony, systemy, aplikacje” · Tech — prokomserwis.pl — „Naprawy telefonów i komputerów” · Gaming (`kind: marka`) — prokomgaming.pl — „Komputery gamingowe · marka PRO-KOM”, `published: false` do 20.11 · Zakopane — `published: false` (brak strony).
- `serviceZones[]` (jedna lista stref dojazdu dla mapy zasięgu, formularzy i FAQ wszystkich linii): `name` (np. „Podhale”, „Małopolska”), `towns[]`, `note`. Logika dopasowania miejscowości — jedna funkcja w `src/lib/` (wzór: regex z kreatora Instalacji); wynik „Szaflary · strefa Podhale”.
- `legal`: adresy stron Polityka prywatności, Cookies, Dostępność, Mapa strony (te same ścieżki we wszystkich liniach). Dziś są per tenant w `SiteSettings.footer.links` — F1 wybiera jedno źródło, bez dublowania.
- `consentMode` (`checkbox` | `info`) + tekst i wersja klauzuli (dziś stała `CONSENT_CLAUSE` w `src/lib/inquiry/consent.ts`).

### 4.2 Linia — wspólna grupa pól `shared` w `SiteSettings`
Jedna definicja pól (np. `src/fields/sharedLineFields.ts`) w kolekcji `SiteSettings` — jeden dokument na tenant, więc każda linia ma własne wartości (decyzja F0; ustawienia linii `*Settings` zostają dla treści tylko tej linii):
- **Kontakt linii:** istniejące `SiteSettings.phone`, `phone2`, `email` (nie dublujemy) + nowe `phoneLabel` („Biznes:”), `hours` (pusty = z CompanyData), `responsePromise` (krótki tekst pod przyciskiem formularza).
- **Pasek marki:** `brandBarSlot` {label, href} (Biznes „Konfigurator”, Instalacje „Zgłoś awarię”, Software „Darmowy audyt”).
- **Nagłówek:** `headerCta` {label, href, counter: none|inquiry|project}; menu linii — jak dziś (nie ruszamy danych menu).
- **Telefon:** `tabBar` {second: {label, href}, center: {label, href, icon}} — pozostałe pozycje stałe (Start, Kontakt, Menu).
- **Boczna szyna:** `rail` {sections[] {anchorId, label, icon}, searchPopular[], searchShortcuts[] {label, href}, synonyms[]} — §5.1. W `CompanyData`: `recentlyViewed` (flaga, domyślnie false).
- **Stopka:** `footerDescription` (= istniejące `footer.text`), `footerPromises[3]`, `footerColumns[]` ({heading, links[{label, href}]}), `legalNote`.
- **Kontakt (szablon):** `contact` {h1, lead, writeCta, placeKind („Salon” | „Spotkanie” | „Serwis”), facts[3] {label, value, icon}, routes[3] {title, text, cta, href}, topics[] (chipy formularza), formTitle, placeholder, sendLabel, nextSteps[4] {title, text}, mapTitle, mapLead, salonKeys[], faq[] }.
- **O firmie (szablon):** `about` {h1, lead, authTitle, auth[], stats[2] {value, label, flag}, rules[6] {title, text}, steps[4] {title, text}, verify[4] {title, text, href}, visitText}.
- Hook: blokada publikacji, gdy którekolwiek pole zawiera `[SZEF` / `[Krystian`.

Treści startowe dla wszystkich pól są w §6 (seed F1 wpisuje je per tenant; dane prawdziwe, nie przykładowe).

## 5. Komponenty
Folder: `src/components/shared/` (nazwy przykładowe). **Zasada przenośności:** komponenty wspólne nie importują Payload ani niczego z `src/sites/<linia>` — dostają gotowe dane przez propsy (loader danych osobno w `src/lib/shared/`). Dzięki temu da się je skopiować do prokom-system (Next.js 14). Style: Tailwind + tokeny CSS (bez nowych bibliotek). Ikony: istniejący zestaw ikon repo, obrysowe.

| Komponent | Plansza | Co | Szczegóły |
|---|---|---|---|
| `LineLogo` | Logo | znak linii | pliki z `public/brand/prokom-<linia>_poziome_<wersja>.svg`; **180×36 px w nagłówku na wszystkich liniach** (Instalacje dziś 140 → 180; decyzja F0 — minimum 220 px z księgi dotyczy druku); wariant jasny/ciemny wg tła. **PRO-KOM główna: znak z zieloną kreską pod napisem, bez nazwy linii** — `prokom-glowna_poziome_kolor.svg` / `_negatyw.svg` mają kreskę (sprawdzone w F0). Znaków TECH i Gaming nie ma jeszcze w `public/brand/` — F2 kopiuje je z gotowych plików (nie dorysowujemy): TECH z paczki znaku (`PRO-KOM_znak_2026-10/01_wektor/SVG/tech/`, poza repo — `docs/marka.md`), Gaming z repo `prokom-gaming` (`docs/design/prokomgaming/marka/prokom-gaming-znak-ciemne.svg`). Źródła: `MAPA-DZIS.md` §8. |
| `OpeningStatus` | Moduły | kropka + tekst | stany: „Otwarte · do 17:00” (zielony `#2E7A1E`, tło `#EAF5E6`), „Zamykamy za N min · do 17:00” (≤ 30 min, `#C77800`), „Zamknięte · otwieramy jutro o 9:00” / „…w poniedziałek o 9:00” (`#B45309`); strefa `Europe/Warsaw`; godziny linii albo salonu; święta z panelu; render na serwerze + odświeżenie co minutę po stronie klienta (bez skoku układu). Na ciemnym: kropka `#7BD36A`, tekst biały, tło `rgba(255,255,255,.07)`. |
| `BrandBar` | Chrome | pasek nad nagłówkiem | 40 px, tło `surface-2`, dół `border`, 13 px. Lewo: przełącznik linii — wszystkie `lines` z `published`, kolejność `order`, każda z kreską 12×3 px w kolorze znaku, bieżąca pogrubiona + `aria-current="page"`, linki zewnętrzne, Gaming ostatni. Prawo: `OpeningStatus` → slot linii (link) → „{phoneLabel} **{phone}**” (`tel:`). `<nav aria-label="Linie PRO-KOM">`. Ukryty ≤ 1080 px (na telefonie te treści są w arkuszu Menu). |
| `SiteHeader` | Chrome | szkielet nagłówka | 76 px, przyklejony, tło `surface` 92% + blur, dół `border`. Kolejność: znak → menu linii (komponent linii, bez zmian) → [wyszukiwarka tylko Biznes] → przełącznik motywu 40×40 → [„Twój projekt” tylko Software] → przycisk akcji 40 px (promień 14, waga 800, licznik opcjonalny). Sloty: `nav`, `extras`, `cta`. „O firmie · Kontakt” zawsze na końcu menu. |
| `SiteFooter` | Footer | stopka | tło `line-dark`; kontener 1280. **A (linia):** siatka: kolumna marki (znak ciemny + `footerDescription` + 3 obietnice z ✓ w `on-dark-text`) · `footerColumns` · kolumna **Kontakt**: `AddressMap` mini (118 px, ciemna, bez etykiety, przycisk „Wyznacz trasę ↗”), telefon (Archivo 22), e-mail, adres, `OpeningStatus` z godzinami, `responsePromise`. **B (1:1):** `LinesBand`. **C (1:1):** `LegalBar`. Opcjonalna ozdoba górnej krawędzi (grzbiet gór Instalacji) jako slot. |
| `LinesBand` | Footer, Telefon | pas linii | nagłówek „Jedna firma — linie PRO-KOM” + „Każda linia ma swój zespół i swój numer”; 6 kafelków (5 linii + Gaming), każdy: mini znak (`LineLogo` 15 px ciemny), opis, domena, ikona ↗; bieżąca: ramka w kolorze linii, tło `rgba(255,255,255,.08)`, plakietka „Jesteś tutaj”; Gaming wg §2.4. Telefon: przewijany rząd kafelków 150 px. |
| `LegalBar` | Footer | pasek prawny | lewo: „© {rok} PRO-KOM Tadeusz Wójciak · ul. Orkana 16B, 34-700 Rabka-Zdrój · NIP 7352511447” + druga linijka `legalNote` linii; prawo: Polityka prywatności · Cookies · Dostępność · Mapa strony · „Do góry ↑”. Ta sama kolejność na każdej stronie. |
| `AddressMap` | Mapa | mapa adresu | **jeden komponent**, wzorzec: mapa OSM z Software v23 (SVG wygenerowany z OpenStreetMap, plik w repo, **bez Google w ramce, bez ciasteczek**). Uogólnij: propsy `accent` (pinezka), `variant` light/dark, `label` (karta „PRO-KOM · ul. Orkana 16B, Rabka-Zdrój”), `height`, `radius`. Pinezka w środku + 2 pierścienie akcentu; nazwa „ul. Orkana” przy ulicy; podpis **„© OpenStreetMap contributors”** (wymóg licencji ODbL). Klik/przycisk = `mapsUrl` w nowej karcie. Używana: stopka (mini), Kontakt (hero, 290 px, z etykietą), O firmie (400 px, ciemna), telefon (100–112 px), sekcja kontaktu na głównych, gdzie jest. Drugi salon = druga pinezka na tej samej mapie, gdy salon jest w zasięgu kadru; inaczej osobna karta salonu. |
| `ServiceAreaMap` | Kontakt | mapa zasięgu | wzorzec: `AreaMap.tsx` Biznesu (K31; komponentu `ServiceAreaMap` w repo nie ma) + wyszukiwarka miejscowości z Instalacji (`kontaktModel.ts`); dane = `serviceZones`; tło `line-dark` + warstwice; Rabka w środku, linie przerywane do miejscowości; etykiety jako HTML (nie `<text>`); pole „Sprawdź swoją miejscowość” → wynik „{miejscowość} · strefa {nazwa}” (szukaj od 3 znaków). Na telefonie: najpierw pole i wynik, mapa mniejsza. Bez czasów dojazdu (nie mamy źródła). |
| `Contours` | Kontakt, O firmie | tło z warstwicami | statyczne SVG generowane deterministycznie (bez losowości): 13 pierścieni, r = 40 + k·64, punkt = r·(1 + 0,075·sin(3θ + 0,7k) + 0,045·sin(5θ − 1,1k)), skala x 1,3, y 0,82, środek (1090, 330) w viewBox 1440×760, `stroke` = `on-dark`, krycie 0,10–0,16. Liczone raz (build/serwer), `aria-hidden`. |
| `ContactForm` | Moduły, Kontakt | rdzeń formularza | pola w tej kolejności: [chipy tematu z `topics`, opcjonalne] → **Imię i firma*** → **Telefon lub e-mail*** (rozpoznaje, co wpisano; walidacja numeru PL 9 cyfr albo e-maila) → Miejscowość (opcjonalna, podpowiedź strefy z `serviceZones`) → Wiadomość (placeholder z linii) → zgoda/klauzula → przycisk `sendLabel` 58 px → pod nim ✓ `responsePromise`. Honeypot (ukryte pole) + limit prób (jest w repo). Błędy: lista u góry (`role="alert"`, linki do pól) + komunikat pod polem + `aria-invalid`. Sukces: numer zgłoszenia, „Potwierdzenie wysłaliśmy na podany adres” (gdy e-mail), 3 kroki „Co dalej” z `nextSteps`, „Wyślij kolejne”. Zapis przez istniejący adapter zapytań (`submitInquiry` → `Inquiries`, typ `contact`, linia = tenant, temat = chip). **`consentMode`: `checkbox` (dziś) | `info`** — do decyzji prawnika (przy samej odpowiedzi na zapytanie podstawą może być art. 6 ust. 1 lit. b/f RODO i wystarczy klauzula informacyjna); tekst z panelu: „Zgadzam się na przetwarzanie danych przez PRO-KOM Tadeusz Wójciak w celu odpowiedzi na zapytanie. Szczegóły w polityce prywatności.” Pola 52–54 px, `autocomplete` (name, tel/email), tekst 16 px na telefonie. **Formularze specjalne linii (lista zapytania Biznesu, kreator Software, Zaplanuj Instalacji) używają tego samego pola zgody, walidacji i ekranu sukcesu**, ale zostają swoimi komponentami. |
| `FaqBlock` | Moduły, Kontakt | pytania | lewo (przyklejone): nadtytuł, H2 („Zanim zadzwonisz”), lead, opcjonalna karta kontaktu (status + telefon + e-mail); prawo: karty `<details>` z numerem 01–N w `accent-text`, okrągły przycisk 32–34 px (+ → × na tle akcentu), pierwsza otwarta, karta otwarta z ramką akcentu; JSON-LD `FAQPage`. Tło sekcji `surface-2`. |
| `Steps` | Moduły, O firmie | „Jak pracujemy” | 4 kroki: numer w kafelku 40–52 px (pierwszy w akcencie), linia łącząca, tytuł, opcjonalny czas, opis; wersja pionowa (ciemne tło) i pozioma (O firmie). |
| `TabBar` + `MenuSheet` | Telefon | telefon | **zasada:** Start · {second linii} · **{center linii — wyróżniony, 52 px, w akcencie, uniesiony}** · Kontakt · Menu. Biznes: Oferta / **Zapytanie** (licznik; Szukaj zostaje lupą w nagłówku); Instalacje: Usługi / **Zaplanuj** („Dla kogo” przechodzi do Menu); Software: Oferta / **Kreator**; Tech: Usługi / **Zgłoś**. Arkusz Menu od dołu: uchwyt, „Menu”, zamknij (40 px), lista linii (ramka = slot linii), **część wspólna:** karta kontaktu (status + numer + „Zadzwoń”), chipy „Linie PRO-KOM” (z Gaming), przełącznik motywu Jasny/Ciemny/Auto. Safe-area, ≥ 44 px, fokus zamknięty w arkuszu, Esc/gest w dół/tło zamyka. |
| `SiteRail` | Szyna | boczna szyna (≥ 1400 px) | wg §5.1 — **na każdej stronie linii**, zawsze nawiguje po sekcjach strony głównej, na górze wyróżniony przycisk **Szukaj**; wzorzec: szyna Biznesu (K4b, K33 §2.4) + istniejący wspólny `RailShell` (płynący wskaźnik, rozwijanie przez `clip-path`). |
| `SearchDialog` | Szyna | wyszukiwarka (Ctrl/Cmd K, „/”) | wspólna powłoka okna wyszukiwania dla Instalacji i Software (§5.1); Biznes zostaje przy swojej wyszukiwarce K4b (z podglądem produktu) i tylko podpina ją pod przycisk w `SiteRail`. |
| `CompanyCard` | O firmie | wizytówka | wiersze: Firma, Adres, NIP, Telefon (linii), E-mail (linii), Godziny; „{authTitle}” + plakietki z tarczą; link „Dane sprawdzisz w CEIDG po numerze NIP →”. |
| `StatsStrip`, `RulesBento`, `FamilyStrip`, `VerifyCards` | O firmie | sekcje | §6.2 |
| `ContactPage`, `AboutPage` | Kontakt, O firmie | szablony stron | §6.1, §6.2; trasa `/kontakt` i `/o-firmie` w każdej linii renderuje szablon z danymi linii. |

### 5.1 Boczna szyna (`SiteRail`) i wyszukiwarka (`SearchDialog`) — decyzja Krystiana 02.11
**Cel:** to, co Biznes ma dziś po lewej (szyna z sekcjami strony głównej i wyróżnionym „Szukaj”), mają też Instalacje i Software — ten sam komponent, dopasowany do linii (sekcje, ikony, akcent, źródło wyszukiwania). Stan Biznesu, istniejącego `RailShell` (Software) i szyny Instalacji spisało F0b w `MAPA-DZIS.md` §10 — przy różnicy z tym opisem **zachowanie Biznesu jest wzorcem**, a ten opis je porządkuje.

**Zachowanie (wszystkie linie):**
- Widoczna ≥ 1400 px, przyklejona po lewej, pionowo wyśrodkowana; poniżej 1400 px ukryta (na telefonie jej rolę pełnią `TabBar` + `MenuSheet`). Nie zmienia układu strony (nakłada się na wolny margines; w stanie rozwiniętym nad treścią, z cieniem).
- **Na każdej stronie linii** pokazuje **sekcje strony głównej**. Na stronie głównej: klik = płynne przewinięcie (`scroll-margin-top` pod nagłówek), aktywna sekcja jak dziś z `src/lib/site/railActive.ts` (ostatnia sekcja, której góra minęła 40% wysokości okna; pomiar w `requestAnimationFrame` — decyzja 02.11 po F0b, zamiast `IntersectionObserver`), `aria-current="location"` (dziś `"true"` — zmiana w F2). Na podstronie: klik = przejście na `/#<sekcja>` (strona główna otwiera się od razu przy tej sekcji, bez migania od góry). **Menu globalne, które Biznes ma dziś w szynie podstron (`rail/SiteRail.tsx`: Strona główna, Oferta, Konfigurator…), znika** — te strony są w nagłówku i mega menu (decyzja 02.11 po F0b).
- **Na górze — wyróżniony przycisk „Szukaj”**: pełny akcent linii (płaski — zgodnie z v23 bez gradientów i poświat w Software; Biznes może zostać przy swoim wyglądzie), jeden spokojny „puls” obrysu przy pierwszym wejściu na stronę (raz na sesję, nie w pętli), podpowiedź „Ctrl K lub /” (na Macu „⌘K”). Klik / skrót otwiera wyszukiwarkę linii.
- **Stan zwinięty:** kolumna ikon (obrysowe, z zestawu ikon repo, 20 px, jednolita grubość) szerokości **64 px**, po rozwinięciu **248 px** (wg planszy Szyna — decyzja 02.11 po F0b; dziś `RailShell` 44 → 214 px z animacją szerokości), pionowa linia postępu z **płynącym wskaźnikiem** aktywnej sekcji. **Rozwinięta** po najechaniu albo fokusie klawiatury (opóźnienie 120 ms, zamykanie 250 ms — jak most w mega menu): etykiety sekcji odsłaniane przez `clip-path` (bez animowania szerokości), kaskada 20 ms. Z klawiatury: Tab przechodzi po pozycjach, Esc zwija.
- **Ruch:** tylko `transform`/`opacity`/`clip-path`, tokeny `--dur-*`/`--ease-*` z `motion.css`; `prefers-reduced-motion` → bez przesuwania i pulsu (zostaje zmiana koloru).
- Dostępność: `<nav aria-label="Sekcje strony">`, każda ikona z etykietą tekstową (widoczną po rozwinięciu i dla czytników zawsze), cele ≥ 44 px, kontrast ikon ≥ 3:1, fokus widoczny.

**Dane (panel, grupa `shared.rail` linii):** `sections[]` {anchorId, label, icon} — kolejność = kolejność sekcji strony głównej; test pilnuje, że każdy `anchorId` istnieje na stronie głównej (inaczej pozycja się nie pokazuje). Listy startowe (sprawdzone z kodem w F0b — **źródłem `anchorId` jest `MAPA-DZIS.md` §10.1**):
- Biznes: jak dziś w szynie Biznesu.
- Software: z szyny v23 — `start`, `oferta`, `popularne`, `podglady`, `dobierz`, `jak-robimy`, `bez-wordpressa`, `technologie`, `zasady`, `faq`, `kontakt` (bez realizacji, decyzja v23; `proces` nie ma etykiety, sekcji „porównanie” na głównej nie ma).
- Instalacje: z szyny sekcji strony głównej (pojawiała się po 400 px — od teraz od razu, jak w Biznesie), łącznie z `#architekci`.

**Wyszukiwarka:**
- **Biznes** — bez zmian (globalna wyszukiwarka K4b: produkty, strony, kategorie, marki, zestawy, podgląd). `SiteRail` tylko ją otwiera.
- **Instalacje i Software** — wspólna powłoka `SearchDialog` (okno modalne, pole, grupy wyników, ↑/↓/Enter/Esc, „brak wyników” → „Zapytaj o „…”” → formularz kontaktu z wpisaną treścią + telefon) z **indeksem linii** budowanym na serwerze (mały JSON, cel < 50 KB gzip):
  - Software: rozwiązania (29), obszary, branże, miejscowości, aktualności, strony (kreator, cennik, audyt, kontakt), pytania FAQ;
  - Instalacje: usługi (10), obiekty „Dla kogo” (12), rozwiązania (76), poradnik, realizacje (gdy są), strony (Zaplanuj, Serwis, Dla architektów, kontakt), pytania FAQ.
  - Silnik: ogólna część `lib/search.ts` Biznesu (normalizacja bez polskich znaków, literówki, synonimy, punktacja) przeniesiona do `src/lib/shared/search/` **bez zmiany zachowania Biznesu** (testy Biznesu zielone); słownik synonimów per linia w panelu.
  - Pusty stan: „Najczęściej szukane” (z panelu linii) i „Na skróty” (główne strony linii).
- Wzorzec wyglądu: plansza **„07 · Boczna szyna, wyszukiwarka i pasek przewijania”** (Tweaks: linia, dodatki; sekcja 1b — podstrona).

**Dodatki — decyzja Krystiana 02.11 (wchodzą 1, 3, 4, 5, 6; nr 2 „status i telefon w szynie” — nie):** mają być dopracowane wizualnie jak plansza, intuicyjne, z ruchem z systemu `motion.css`.
1. **Akcja linii z licznikiem** — na dole szyny, oddzielona kreską: Biznes „Zapytanie” (licznik z `pk-cart`, otwiera szufladę), Instalacje „Zaplanuj” (→ `/zaplanuj`, podświetlona na tej stronie), Software „Twój projekt” (licznik, otwiera listę). Dane: `shared.tabBar.center` (ta sama akcja co środek dolnego paska). Plakietka licznika na ikonie (widoczna też w stanie zwiniętym), przy zmianie liczby jeden „podskok” (scale 1 → 1.28 → 1), `aria-live="polite"` z tekstem „W zapytaniu: 3”.
3. **Postęp strony i „Do góry”** — linia postępu wzdłuż lewej krawędzi szyny (`animation-timeline: scroll()`; gdy przeglądarka nie wspiera — lekki odczyt przewinięcia przez `requestAnimationFrame`, bez nasłuchu w pętli). „Do góry” wjeżdża (opacity + 6 px) dopiero po przewinięciu ponad 1 wysokość ekranu, płynnie przewija na górę i przenosi fokus na początek treści (`#main`), bez skoku przy `prefers-reduced-motion` (wtedy przewinięcie natychmiastowe).
4. **„Na tej stronie” na podstronach** — gdy podstrona ma ≥ 3 sekcje oznaczone `data-rail-section` (id + etykieta + opcjonalna ikona), szyna pokazuje grupę „Na tej stronie” (aktywna sekcja z `railActive.ts`, jak na stronie głównej — decyzja 02.11 po F0b; maks. 10 pozycji, dłuższa lista przewija się w cienkim pasku), a pod nią **„Strona główna” zwiniętą w jeden wiersz-akordeon** („10 sekcji ▾”; rozwinięcie pokazuje sekcje głównej ze strzałką ↗; stan zapamiętany w `sessionStorage` do końca wizyty). Podstrony z < 3 sekcjami: od razu sekcje strony głównej (jak dziś w Biznesie). **Od 1400 px grupa zastępuje przyklejony pasek kotwic** (Instalacje — strony usług, obiektów, serwisu i Dla architektów; Biznes — `ProductSectionNav` na stronie produktu, decyzja 02.11 po F0b); poniżej 1400 px pasek kotwic zostaje. Spis treści artykułów (poradnik Instalacji, wpisy Software) zostaje bez zmian. Podpisy grup („Na tej stronie”, „Strona główna”) widoczne tylko w stanie rozwiniętym; w zwiniętym — kreska i ikony.
5. **Paleta poleceń w wyszukiwarce** (wszystkie 3 linie — w Biznesie jako pierwsza grupa w obecnej wyszukiwarce K4b): akcje „Zadzwoń” (`tel:` linii; Biznes też drugi numer), „Skopiuj numer”, „Napisz e-mail” (`mailto:` linii), „Wyznacz trasę” (`mapsUrl`), główna akcja linii (Zapytanie / Zaplanuj / Kreator), „Kontakt”, „Motyw jasny/ciemny”. Pusty stan: akcje jako rząd przycisków z ikonami i słowem-skrótem (tel, mail, trasa, motyw); po wpisaniu: grupa „Akcje” na górze, gdy pasuje słowo kluczowe (słownik w kodzie: tel, telefon, dzwoń, numer, mail, e-mail, napisz, trasa, dojazd, mapa, jak dojechać, motyw, ciemny, jasny + nazwa akcji linii). Enter wykonuje akcję; wszystkie dane z panelu.
6. **Ostatnio oglądane** — do 5 pozycji (produkt, rozwiązanie, usługa, obiekt, strona; tytuł, adres, rodzaj, czas) w `localStorage` pod kluczem linii (`pk-recent-<linia>`, try/catch), tylko w tej przeglądarce, bez serwera i ciasteczek; w pustym stanie wyszukiwarki grupa „Ostatnio oglądane” z „Wyczyść”. **Flaga w panelu (`CompanyData.recentlyViewed`, domyślnie wyłączona)** — włączamy po opinii prawnika, czy zapis na urządzeniu użytkownika dla tej funkcji wymaga zgody (ustawa Prawo komunikacji elektronicznej); przy włączeniu dopisek w polityce prywatności.

## 6. Szablony stron

### 6.0 Miejsca na sekcje linii (sloty) — wspólne dla Kontaktu i O firmie
Szablon daje wspólny szkielet; **linia wstawia własne sekcje w nazwanych miejscach** (komponenty linii w `src/sites/<linia>/…`, treść w ustawieniach linii). Szablon nie zna treści linii — dostaje gotowe elementy przez propsy. Sloty startowe (lista ostateczna po `MAPA-DZIS.md` w F0, nowy slot tylko po zgodzie Krystiana):
- **ContactPage:** `heroAside` (pod kartą adresu, np. drugi salon), `afterRoutes` (po „Z czym dzwonisz?”), `formPrefill` (np. Software „Twój projekt”), `afterForm` (przed „Dojazd i zasięg”), `beforeFaq`, przełączniki sekcji opcjonalnych: `showServiceArea`, `showOtherLines`.
- **AboutPage:** `afterStats`, `afterRules` (np. autoryzacje i partnerzy), `afterSteps`, `beforeVisit`, przełącznik `showVerify`.
- Sekcja w slocie używa tokenów ról i skali tekstu z §3 (wygląda jak część strony), ale treść i układ ma z wizualizacji swojej linii.
- Kolejność i obecność sekcji wspólnych się nie zmienia (spójność między domenami); linia może tylko wyłączyć sekcje oznaczone jako opcjonalne.

### 6.1 Kontakt `/kontakt` (plansza „04 · Kontakt”, przełącznik linii w Tweaks)
1. **Hero (`line-dark` + `Contours`):** okruszki; `OpeningStatus` (ciemny); H1 linii (clamp 42–74 px, biały); lead; „Najszybciej — zadzwoń” + numer jako duży napis (44–66 px, `tel:`); przyciski „Zadzwoń teraz” (`on-dark`) i `writeCta` (obrys, przewija do formularza); pasek 3 faktów (`facts`, szkło `rgba(255,255,255,.05)`). Prawo: **karta adresu** (biała, promień 28): `AddressMap` 290 px z etykietą → „{placeKind} · Rabka-Zdrój”, „ul. Orkana 16B”, „34-700 Rabka-Zdrój”, przycisk „Wyznacz trasę” → 3 kafelki godzin (Pon–Pt z „dziś” w `accent-soft` + ramka akcentu, Sobota, Niedziela) → „PRO-KOM Tadeusz Wójciak · NIP 7352511447” + „Sprawdź w CEIDG →”. Drugi salon (Instalacje): karta pod spodem (dane z panelu).
2. **„Z czym dzwonisz?”** — 3 karty `routes` (min. 250 px): duża cyfra-kontur (64 px), tytuł, opis, CTA + okrągła strzałka; **pierwsza karta w akcencie**.
3. **Formularz** — karta dwudzielna (promień 30): lewo `line-dark` + warstwice: „Formularz”, `formTitle`, „Co dalej po wysłaniu” (`nextSteps` pionowo); prawo `ContactForm`.
4. **Dojazd i zasięg** — tekst (`mapTitle`, `mapLead`, pole miejscowości, wynik) + `ServiceAreaMap`.
5. **„Inna sprawa? Każda linia ma swój zespół.”** — kafelki pozostałych linii (bez bieżącej, z Gaming), kreska 4 px u góry w kolorze linii.
6. **FAQ kontaktowe** (`FaqBlock`, 4 pytania: parking, dojazd do klienta, co przygotować, czy bez umawiania — treści z panelu; opis parkingu jeden w `locations[].parkingNote`).
- JSON-LD `LocalBusiness` z CompanyData (+ `openingHoursSpecification` linii), `BreadcrumbList`.

### 6.2 O firmie `/o-firmie` (plansza „05 · O firmie”)
1. **Hero (`line-dark` + `Contours` + kontur „2004” 360 px, krycie 0,1):** pigułka „PRO-KOM Tadeusz Wójciak · Rabka-Zdrój, od 2004”; H1; lead; przyciski: telefon (`on-dark`) i „Jak pracujemy” (#wspolpraca). Prawo: `CompanyCard`.
2. **`StatsStrip`** — 4 karty nachodzące na hero (−36 px): „2004 · na Podhalu, w Rabce-Zdroju” + 2 liczby linii (`about.stats`) + „5 · linii w jednej firmie”; plakietka `flag` (np. „do potwierdzenia przez szefa”) widoczna tylko w podglądzie/stagingu, na produkcji liczba z flagą się nie pokazuje.
3. **„Dlaczego PRO-KOM” (`RulesBento`)** — reguła 1 jako duża karta w akcencie z warstwicami (min. 380 px), reguły 2–5 w siatce 2×2, reguła 6 jako ciemny pasek na całą szerokość. Układ na `flex-wrap` (działa na telefonie).
4. **„Jak to wygląda krok po kroku” (`Steps` poziomo)**.
5. **„Pięć linii i marka PRO-KOM Gaming” (`FamilyStrip`)** — pasek 6 odcinków (bieżąca linia szersza), pod nim 6 kart (bieżąca: `accent-soft` + „Jesteś tutaj”; Gaming wg §2.4).
6. **„Nie musisz wierzyć nam na słowo” (`VerifyCards`)** — 4 karty z linkiem zewnętrznym (`about.verify`).
7. **„Wpadnij do Rabki, ul. Orkana 16B.”** — karta dwudzielna: lewo `line-dark` + warstwice (`visitText`, „Wyznacz trasę”, „Kontakt”), prawo `AddressMap` 400 px ciemna z etykietą.
- **Bez sekcji „Ludzie” i bez zdjęć.** JSON-LD `Organization` + `BreadcrumbList`. H1 i lead różne w każdej linii (SEO: nie kopiujemy całych akapitów między domenami).

### 6.3 Treści startowe (seed F1)
Teksty są w planszach (`plansze/Kontakt.dc.html` i `OFirmie.dc.html`, obiekty `D` w skrypcie — czytelne JSON) i obowiązują jako start. **Poprawki danych wobec plansz:**
- **Biznes (decyzja 01.11):** telefony **889 003 889** (główny) i **883 200 151**; e-mail **kontakt@prokombiznes.pl** (nie biznes@pro-kom.eu); **18 267 65 11 nie pokazujemy**. W planszy Kontakt fakt „Stacjonarny 18 267 65 11” → „Drugi numer 883 200 151”.
- Instalacje: 889 003 889, kontakt@prokominstalacje.pl; drugi salon Zakopane — adres i godziny `[SZEF]` (nie publikować pustego).
- Software: 883 200 151 i 788 986 074, kontakt@prokomsoftware.pl.
- Tech (prokom-system): 883 200 151, e-mail do decyzji (dziś sklep@pro-kom.eu; docelowo kontakt@prokomserwis.pl po sprawdzeniu DNS/MX), soboty 9:00–14:00.
- Liczby z flagą: Biznes „100+ klientów firmowych” `[SZEF]`; Tech „10 000+ naprawionych urządzeń” `[SZEF]`.
- `[Krystian]` linki: lista serwisów Posnet, wyszukiwarka partnerów InsERT; `[SZEF]` autoryzacje Satel/Ampio.

## 7. Telefon (≤ 1080 px)
- Boczna szyna (`SiteRail`) ukryta poniżej 1400 px; wyszukiwarka dostępna z nagłówka i z arkusza Menu. **Lupa w `SiteHeader` (slot `extras`) we wszystkich liniach poniżej 1400 px** (decyzja 02.11 po F0b) — dziś ma ją tylko Biznes; bez niej Instalacje i Software między 1081 a 1399 px i na telefonie nie miałyby wejścia do wyszukiwarki (sam Ctrl K jest niewidoczny).
- Pasek marki znika; jego treść (status, telefon, linie, motyw) jest w arkuszu Menu.
- `TabBar` wg §5; stopka: kolumny zwijane (akordeon), `LinesBand` jako przewijany rząd, `LegalBar` z linkami w 2 rzędach (każdy link ≥ 24 px wysokości).
- Kontakt na telefonie: status → H1 → duży przycisk telefonu (cała karta klikalna) → kafelki e-mail / drugi numer → karta salonu z `AddressMap` 100–112 px → reszta jak desktop w jednej kolumnie.
- Wymagania jak `MOBILE-APLIKACJA.md` Biznesu: 0 poziomego przewijania przy 360/390/414, safe-area, cele ≥ 44 px, tekst pól 16 px.

## 8. SEO
- Dane NAP (nazwa, adres, telefon) identyczne na wszystkich domenach — z CompanyData (pomaga w lokalnym wyszukiwaniu).
- Unikalne H1 i lead Kontaktu i O firmie per linia; reszta sekcji może się powtarzać (to elementy nawigacyjne/zaufania, nie główna treść).
- `LocalBusiness` tylko z prawdziwymi oddziałami (salony z `published`).
- Linki do innych linii w pasie linii: zwykłe `<a>` (bez `nofollow`), `rel="noopener"` przy nowej karcie.

## 9. Dostępność i wydajność
- axe: 0 naruszeń; kontrast ≥ 4,5:1 (także szare podpisy 11–13 px na ciemnym — wartości `line-dark-text` sprawdzone w tokenach, przy zmianie testuj).
- Kolor nie jest jedynym nośnikiem znaczenia (status: kropka + tekst; bieżąca linia: pogrubienie + `aria-current`).
- Mapa: SVG statyczny, `role="img"` + `aria-label` z adresem; bez skryptów map zewnętrznych.
- Lighthouse mobile ≥ 90 na `/kontakt` i `/o-firmie` każdej linii; SVG warstwic i mapy < 60 KB każdy (zoptymalizowane SVGO).

## 10. Definition of Done (każda sesja F i L) i testy
1. Lint, typecheck, testy, build, CI zielone; strony innych linii bez niezamierzonych zmian (zrzuty przed/po strony głównej każdego tenanta).
2. **Testy treści (nowe, wspólne):** brak „WhatsApp”, „wa.me”, „i sklep” (przy pro-kom.eu), „Serwis” jako nazwy linii w pasie linii, „biznes@pro-kom.eu”, „18 267 65 11”, „example.test”, „000 000” w treściach i seedach tenantów; telefony/e-maile w komponentach tylko z danych.
3. e2e (Playwright, wszystkie 3 tenanty): pasek marki pokazuje tylko `published` linie, bieżąca ma `aria-current`; `LegalBar` ma identyczny tekst na 3 domenach; `LinesBand` ma 5 kafelków przy Gaming `published:false` i 6 przy `true`; `OpeningStatus` dla zamrożonego czasu (pn 10:00 → otwarte, pn 16:40 → zamykamy za 20 min, sob 10:00 → zamknięte · w poniedziałek); formularz: błędy + sukces + rekord w `Inquiries` z tenantem i tematem; mapa: link „Wyznacz trasę” = `mapsUrl`; telefon: 0 przewijania w bok przy 360/390/414; arkusz Menu: fokus, Esc; `SiteRail` (≥ 1400 px): obecna na stronie głównej i 2 podstronach, aktywna sekcja zmienia się przy przewijaniu, klik na podstronie → `/#sekcja` z widoczną sekcją, Ctrl K i „/” otwierają wyszukiwarkę, Esc zamyka i wraca fokus, wyszukiwanie z literówką znajduje wynik, brak wyników → „Zapytaj o”.
4. Porównanie z planszami (sekcja po sekcji, jasny i ciemny motyw) — rozbieżności wpisane w PR.
5. `docs/STAN.md` (i `docs/stan/STAN-instalacje.md`, jeśli dotyczy Instalacji) zaktualizowane w tym samym PR.

## 11. Co to zastępuje w specyfikacjach linii
- **Biznes:** górny pasek (spec §3.1/K4 rama), stopka K4 (kolumny zostają jako `footerColumns`, kolumna „PRO-KOM w regionie” → `LinesBand`), `/kontakt` i `/o-firmie` z K4i → szablony §6 (treści przenieść do pól `contact`/`about`), dolny pasek M1′ → zasada §5, boczny pasek K4b → `SiteRail` (wygląd i zachowanie Biznesu = wzorzec, wyszukiwarka K4b zostaje), kafelki WhatsApp — usunięte.
- **Software:** `BrandBar` SW0 → wspólny; szyna sekcji (spec Software §3.3, tylko główna) → `SiteRail` na wszystkich stronach + wyszukiwarka (nowość); stopka „Jedna firma, cztery linie” (5 kart; wcześniej v21 „sześć adresów”) → `LinesBand` (wzór wyglądu kafelków stąd), pasek prawny → `LegalBar` (dochodzą Cookies i Dostępność), Kontakt v21/v23 i O firmie SW11b → szablony §6 („Twój projekt” w formularzu Kontaktu zostaje jako rozszerzenie `ContactForm` przez slot `formPrefill`), O firmie bez portretów (zmiana wobec v23 — decyzja 01.11).
- **Instalacje:** klasy prototypu `topb`, `hdr`, `ftr2` (pasek, nagłówek, stopka) → komponenty wspólne; grzbiet gór zostaje jako ozdoba stopki; `/kontakt` i `/o-firmie` (I11/I12) → szablony §6; strefy dojazdu → `serviceZones`; dolny pasek → zasada §5; szyna sekcji strony głównej → `SiteRail` na wszystkich stronach + wyszukiwarka (nowość).
- **Kto co robi:** komponenty i szablony — fundament (F2, F3); wpięcie powłoki — L1 linii; Kontakt i O firmie z sekcjami własnymi (sloty §6.0) — L2 linii.
- Wszystko inne w specyfikacjach linii obowiązuje bez zmian.

## 12. Otwarte
- [prawnik] „Ostatnio oglądane” (§5.1 pkt 6) — czy zapis w localStorage wymaga zgody; do tego czasu flaga wyłączona.
- [prawnik] zgoda checkbox czy klauzula informacyjna (`consentMode`); treść klauzuli; strona Cookies (bez ciasteczek śledzących — Umami).
- [SZEF] liczby z flagą (100+, 10 000+); adres i godziny salonu Zakopane; autoryzacje Satel/Ampio; cytat właściciela (bez zdjęcia) — zostaje czy znika.
- [Krystian] e-mail Tech; linki weryfikacji (Posnet, InsERT); pliki znaku TECH i Gaming do `public/brand/` — źródła znalezione (`MAPA-DZIS.md` §8), kopiuje F2; usunięcie pól WhatsApp z panelu (migracja usuwająca dane we wspólnych polach — w F1 albo osobnym PR `feat/wsp-*`, nigdy w sesji L; zawsze po decyzji Krystiana).
- Zamknięte w F0: znak z zieloną kreską jest w paczce; znak w nagłówku 180×36; `shared` w `SiteSettings`; salony = `CompanyData.locations[]`.
