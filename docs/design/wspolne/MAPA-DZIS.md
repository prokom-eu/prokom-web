# Elementy wspólne — mapa „dziś → docelowo” (F0, 01.11.2026)

Rozpoznanie kodu na `develop` @ `76f6060` (po SWV9). Wejście do F1–F3 (fundament) i L1–L2 (sesje linii). Spec: `WSPOLNE-ELEMENTY.md`, decyzja: `docs/decyzje/ADR-022-elementy-wspolne-linii.md`, plan: `docs/zadania/wspolne-elementy.md`.

Ścieżki względne do katalogu repo; numery linii orientacyjne (stan z dnia rozpoznania). Kolumna „Sesja”: F1 dane · F2 powłoka · F3 moduły i szablony · L1 wpięcie powłoki w linię · L2 Kontakt i O firmie linii · F4 QA.

---

## 1. Biznes (`prokombiznes.pl`)

| Element | Plik(i) | Dziś | Co robimy | Sesja |
|---|---|---|---|---|
| Pasek marki | `src/sites/biznes/components/TopBar.tsx` (w `Frame.tsx:47`) | ukryty < `sm`; lista linii zaszyta w `LINES` (w. 21–31): Biznes · Instalacje · Software · Tech — bez PRO-KOM i Gaming; prawo: `HoursStatus` (`CompanyData.locations[0].hours`), „Konfigurator”, „Oferty i serwis: {SiteSettings.phone}” | `BrandBar` z `CompanyData.lines`; slot „Konfigurator”; `phoneLabel` z panelu; ukryty ≤ 1080 px | F2 → L1 |
| Nagłówek | `components/BiznesHeader.tsx`, `SiteLogo` | 60 px / 76 px od `sm`; znak 30 px / **36 px wys. (≈180 px)**; `SearchOverlay` (przekazuje numer WhatsApp), `ThemeToggle`, `CartButton` „Zapytanie” z licznikiem (pokazuje też 0), `HeaderNav` + `MegaMenuPanel` z panelu | `SiteHeader`: `nav` = menu i mega menu linii bez zmian, `extras` = lupa, `cta` = „Zapytanie” z licznikiem | F2 → L1 |
| Stopka | `components/BiznesFooter.tsx` | 6 kolumn: Firma (adres/godziny z `locations[0]`, odznaki), Oferta (`OFFER_LINKS` w kodzie), Usługi i Systemy (`biznes.footer.*`), **„PRO-KOM w regionie”** (`REGION_LINKS` w kodzie, opisy zamiast nazw linii, Tech jako „Serwis telefonów i laptopów”), Kontakt (telefon, **WhatsApp**, `phone2`, e-mail) | `SiteFooter`: kolumny → `footerColumns`; „PRO-KOM w regionie” → `LinesBand`; Kontakt → wspólna kolumna z `AddressMap` mini; WhatsApp usunąć | F2 → L1 |
| Pasek prawny | `BiznesFooter.tsx:198–215` | „© {rok} {name} · NIP · Oferta skierowana do przedsiębiorców… · Logotypy należą do ich właścicieli”; linki z `SiteSettings.footer.links` | `LegalBar` (tekst 1:1) + `legalNote` linii („Oferta skierowana do przedsiębiorców…”) | F2 → L1 |
| Linki prawne | seed `src/seed/biznes/footer.ts:15–20`, `legal.ts:160–181` | **Polityka · Cookies · Dostępność · Mapa strony** — wszystkie 4; `/mapa-strony` to trasa, pozostałe strony CMS (szkic „do akceptacji”, istnieją po seedzie) | bez zmian treści; kolejność wg `LegalBar` | F2 |
| Dolny pasek (telefon) | `components/mobile/TabBar.tsx`, `src/lib/biznes/mobileNav.ts` | Start · Oferta · **Szukaj** · Zapytanie (licznik) · Kontakt — **bez Menu** | `TabBar`: Start · Oferta · **Zapytanie** (środek) · Kontakt · Menu; Szukaj → lupa w nagłówku telefonu | F2 → L1 |
| Arkusz Menu | `MobileMenu.tsx`, `MobileMenuContent.tsx`, wspólny `src/components/BottomSheet.tsx` | kafle działów, lista (zestawy, Plan, partnerzy, vending), chipy (O firmie, Konfigurator, Aktualności, Kontakt), Jasny/ciemny, „Zadzwoń” | `MenuSheet`: lista linii = slot (treść Biznesu zostaje); część wspólna: karta kontaktu, chipy linii, motyw | F2 → L1 |
| Formularz ogólny | `components/forms/ContactForm.tsx` (w `BzSection/firma/Company.tsx:529`), `forms/fields.tsx:116–125` | checkbox zgody (`CONSENT_CLAUSE` v`2026-10-17`), walidacja klienta `checkRequired` + Zod serwera (`src/lib/inquiry/schema.ts`), sukces „Dziękujemy, zapytanie wysłane.” + „Wyślij kolejne” | `ContactForm` (F3) na `/kontakt` | F3 → L2 |
| Lista zapytania | `components/inquiry/ListForm.tsx` (`/zapytanie` + `CartDrawer.tsx:342`), `src/lib/inquiry/listForm.ts` | ta sama zgoda; pod przyciskiem `INQUIRY_ADMIN_NOTE` („Oddzwaniamy w ciągu 60 minut”); sukces z numerem i 4 krokami (`InquiryPage.tsx:440–500`); `preferredContact` ma opcję `whatsapp` | zostaje swoim komponentem; podpięcie pod `ConsentField` / walidację kontaktu / `SuccessPanel`; usunąć opcję WhatsApp | F3 (API) → L2 |
| Konfigurator | `ConfiguratorForm.tsx` | jak lista (zgoda repo) | jak lista | L2 |
| Mapa okolic | `components/AreaMap.tsx` (w `Company.tsx:491`, `BzLocation/Component.tsx:86`) | **nie ma `ServiceAreaMap`** — statyczny SVG, 9 miejscowości w `TOWNS` (w. 8–18), środek Rabka, przyciski Google (tylko link); pole `SiteSettings.biznes.serviceAreas` nieużywane w UI | wzorzec wyglądu dla `ServiceAreaMap`; dane → `CompanyData.serviceZones` | F1, F3 → L2 |
| Mapa adresu | — | brak (adres tekstem + `AreaMap`) | `AddressMap` (wzór Software) | F2 |
| `/kontakt`, `/o-firmie` | strony CMS `[slug]`; układ `src/seed/biznes/k4Pages.ts` (`aboutK4Layout` ~856, `contactK4Layout` ~952); bloki `BzSection` (`firma/Company.tsx`), `BzLocation` | Kontakt: `contact-hero` (status, **4 kafle z WhatsApp** `Company.tsx:391–429`, drugi telefon, `AreaMap`, godziny, NIP) → „Z czym dzwonisz?” → formularz → FAQ „Pytania o kontakt” → „Inne linie PRO-KOM”. O firmie: `about-hero` (statystyki, Dane firmy, 4 autoryzacje, CEIDG) → „Nie musisz wierzyć nam na słowo” → „Osiem zasad” → „Jedna firma, cztery linie” → „Autoryzacje i partnerzy” (marki) → `bzLocation` → pas „Porozmawiajmy” | szablony `ContactPage` / `AboutPage` + dodatki §6; kafel WhatsApp usunąć już w L1 | L1 (WhatsApp), L2 |

## 2. Instalacje (`prokominstalacje.pl`, worktree `prokom-instal`)

| Element | Plik(i) | Dziś | Co robimy | Sesja |
|---|---|---|---|---|
| Pasek marki | `src/sites/instalacje/powloka/TopBar.tsx` (klasa `.topb`) | od 761 px; lewo `HoursLive` + salony z `CompanyData` (`powloka/salons.ts`); prawo: Biznes · Software · „Tech · naprawy sprzętu” · „Zgłoś awarię” · „Instalacje: {tel}”; **brak pro-kom.eu**; lista w `dane/nawigacja.ts:67–74` | `BrandBar`; slot „Zgłoś awarię” | F2 → L1 |
| Nagłówek | `powloka/Header.tsx` (`.hdr`), `SiteLogo` `h-7` (`Frame.tsx:61`) | znak **28 px wys. ≈ 140 px** szer.; mega „Usługi” i „Dla kogo”, pozycje do Kontakt; `ThemeButton`, ikona telefonu (mobile), CTA „Zaplanuj instalację”, przycisk Menu | `SiteHeader`, znak **180×36**; `cta` = „Zaplanuj instalację” | F2 → L1 |
| Stopka | `powloka/Footer.tsx` (`.ftr2`) | grzbiet gór `.ftmt` (w. 32–38), karty kontaktu, kolumny: marka (znak 160 px), Usługi, Dla kogo, Firma, „Strony PRO-KOM” (pro-kom.eu, Biznes, Software, „Tech · naprawy sprzętu”) | `SiteFooter` + ozdoba krawędzi = grzbiet gór; „Strony PRO-KOM” → `LinesBand` | F2 → L1 |
| Pasek prawny | `Footer.tsx:142–144` | „© {rok} {name} · adres · NIP · Logotypy należą do ich właścicieli” + linki z `SiteSettings.footer.links` | `LegalBar` | F2 → L1 |
| Linki prawne | seed `src/seed/instalacje/legal.ts:157–181`, `run.ts:115` | **Polityka · Cookies · Dostępność** + „Do góry ↑”; **brak „Mapa strony”** w stopce (trasa `/mapa-strony` istnieje) | dodać „Mapa strony” przez `LegalBar` | F2 → L1 |
| Dolny pasek | `powloka/TabBar.tsx`, `dane/nawigacja.ts:24–30` | Start · Usługi (arkusz) · **Zaplanuj** (wyróżniony) · Dla kogo (arkusz) · Więcej | Start · Usługi · **Zaplanuj** · Kontakt · Menu („Dla kogo” → Menu) | F2 → L1 |
| Arkusz Menu | `powloka/MenuSheet.tsx` | 3 zakładki: Usługi, Dla kogo, Więcej (`HoursLive`, lista `more`, telefon, `ThemeTile`), na dole „Zaplanuj instalację” | `MenuSheet`: zakładki linii jako slot listy; część wspólna | F2 → L1 |
| Klasy prototypu | `src/sites/instalacje/instalacje.css` | `.topb`/`.topw` w. 101–123 (+ `display:none` ≤ 760 px w. 883); `.hdr`/`.hdrw` w. 140–160, `.hdra` w. 310, mobile w. 886–894, reduced motion w. 1049; `.ftr2` z `.ftmt .ftc .ftci .fg .ftb .fbot .ftl` w. 433–605, mobile w. 903–925 i 1004–1034 | usunąć tylko reguły tych trzech elementów po wpięciu komponentów | L1 |
| Formularz ogólny | `widzety/kontakt/ContactForm.tsx`, `kontaktModel.ts:198` | checkbox `CONSENT_CLAUSE`, honeypot, token, walidacja klienta w `*Model.ts` (bez Zod), sukces → `/wyslane` (`(instalacje)/wyslane/page.tsx`, `dane/wyslane.ts`) | `ContactForm` (F3) | F3 → L2 |
| Zaplanuj | `widzety/zaplanuj/PlannerWizard.tsx`, `plannerModel.ts:279`, `src/lib/instalacje/plan.ts` (`travelZone` w. 210–217) | typ `wizard`, 4 kroki, sukces → `/wyslane?nr=&kontakt=`; `plan.ts:111` zna kontakt WhatsApp | zostaje; `ConsentField` / walidacja / `SuccessPanel`; strefy z `serviceZones`; WhatsApp usunąć | F3 → L2 |
| Inne formularze | `widzety/serwis/FaultForm.tsx`, `glowna/QuickPlanForm.tsx`, `teletechnika/QuoteForm.tsx`, `architekci/ArchitectForm.tsx` + `ConsentText.tsx`, `architekci/EmailForm.tsx` (+ zgoda marketingowa) | typ `contact`, sukces w miejscu | jak Zaplanuj (wspólna zgoda i sukces), układ bez zmian | L2 |
| Strefy / miejscowości | `widzety/kontakt/ContactHero.tsx`, `kontaktModel.ts` (`TOWNS` w. 26–44, regex `zoneKey` w. 66–72), `widzety/kontakt/mapa.ts`, `dane/kontakt.ts:20–30` | lista miast i strefy w kodzie; ta sama logika w `plan.ts` | `CompanyData.serviceZones` + `src/lib/shared/zones.ts` (wzór regexu stąd) | F1, F3 → L2 |
| `/kontakt` | `blocks/InstContact/Component.tsx` | `#hero` (mapa stref, kafle: Telefon, **WhatsApp** w. 52–80, E-mail, Zaplanuj; godziny) → `#napisz` (formularz + salony z „Wyznacz trasę”, NIP) → pas CTA | szablon + dodatki §6; WhatsApp usunąć w L1 | L1, L2 |
| `/o-firmie` | `blocks/InstAbout/Component.tsx`, `dane/oFirmie.ts` | `#hero` (mapa SVG, „jeden salon”) → `#linie` („Tech · serwis”) → `#jak` → `#dane`; prototyp ma też `#historia` | szablon + dodatki §6 | L2 |

## 3. Software (`prokomsoftware.pl`)

| Element | Plik(i) | Dziś | Co robimy | Sesja |
|---|---|---|---|---|
| Pasek marki | `src/sites/software/components/SwTopBar.tsx` (w `Frame.tsx:65`) | od 1081 px; lewo literał „Linia firmy PRO-KOM · od 2004 r. · Rabka-Zdrój” (w. 19); prawo „Wszystkie linie PRO-KOM →” (`BRAND_LINKS`) + telefon `SiteSettings.phone`; **bez listy linii** | `BrandBar`; slot „Darmowy audyt” | F2 → L1 |
| Nagłówek | `components/SoftwareHeader.tsx` | znak 30 / 28 / 36 px wys. (≈150 / 140 / 180 px; `:38`); `ThemeToggle`, `ProjectMenu` „Twój projekt”, CTA „Bezpłatna wycena”; menu z `SiteSettings.software.navigation` (`seed/prokomsoftware/nawigacja.json:3–40`) | `SiteHeader`, znak 180×36; `extras` = „Twój projekt”, `cta` = „Bezpłatna wycena” | F2 → L1 |
| Stopka | `components/SoftwareFooter.tsx` | pas CTA (w. 103–134), znak 220 px + 3 gwarancje, kolumny Oferta / Firma / Kontakt; `data-footer-lines` (w. 239–282): **„Jedna firma, cztery linie” z 5 kartami** (PRO-KOM, Biznes, Instalacje, Software, Tech) — „sześć adresów” już nie istnieje | `SiteFooter`; karty linii → `LinesBand` (wzór wyglądu kafelków stąd); pas CTA zostaje jako sekcja linii nad stopką | F2 → L1 |
| Pasek prawny | `SoftwareFooter.tsx:289–293` | „© {rok} {name} · adres · NIP” + „Bez ciasteczek śledzących” | `LegalBar` + `legalNote` | F2 → L1 |
| Linki prawne | `nawigacja.json:386–392`, `src/seed/software/legal.ts` | **Polityka · Mapa strony**; **brak Cookies i Dostępność** (stron nie ma) | strony Cookies i Dostępność (F2 pkt 4), linki przez `LegalBar` | F2 → L1 |
| Dolny pasek | `components/TabBar.tsx`, `PhoneLayer.tsx` | Start · Oferta · Kreator · Kontakt · Menu (+ `ProjectPill`) | już zgodny z zasadą; przejście na `TabBar` | L1 |
| Arkusz Menu | `PhoneLayer.tsx:64–146` | wyszukiwarka, „Dobierz rozwiązanie”, 4 kafle oferty z cenami, Oferta, Firma, `ThemeSegment`, „Bezpłatna wycena”, telefon, adres (`Frame.tsx:88`) | `MenuSheet`: treść linii jako slot; część wspólna | F2 → L1 |
| Formularz ogólny | `blocks/SwContact/ContactForm.tsx`, `src/lib/inquiry/contactForm.ts` | checkbox (w. 446/467), honeypot (476); sukces → `/dziekujemy?nr=` (`(software)/dziekujemy/page.tsx`) | `ContactForm` (F3) | F3 → L2 |
| „Twój projekt” | `ContactForm.tsx:131–132, 283` (`ProjectBox`), `src/lib/software/project.ts:12` | `?projekt=1`, wysyłka `type: 'list'` | slot `formPrefill` | F3 → L2 |
| Kreator | `components/wizard/WizardSend.tsx`, `src/lib/inquiry/wizardForm.ts` | checkbox (394/414), honeypot (422), sukces w kreatorze (`Wizard.tsx:177/992`) | `ConsentField` / walidacja / `SuccessPanel`, układ bez zmian | L2 |
| Audyt | `blocks/SwAuditForm/AuditForm.tsx`, `src/lib/inquiry/auditForm.ts` | checkbox (206), → `/dziekujemy` | jak kreator | L2 |
| Mapa adresu | `blocks/SwContactPage/OsmMap.tsx`, `osmMap.generated.ts` ← `scripts/software-osm-map.mjs` | statyczny SVG z OSM, „© autorzy OpenStreetMap”, „Wyznacz trasę” dopiero po kliknięciu (`mapHref`) | **wzorzec `AddressMap`** (uogólnić: light/dark, accent, label, height) | F2 |
| `/kontakt` | `blocks/SwContactPage/Component.tsx`, seed `src/seed/software/contact.ts` | hero (`ContactHours`, 4 kanały: telefon, e-mail, salon, online) → `#formularz` z „Co dalej” → „Inne linie PRO-KOM” (**Tech jako „SERWIS”**, `contact.ts:153`) → `#gdzie` (OsmMap, zdjęcie wejścia, karty godziny/telefon/e-mail/dane) → FAQ | szablon + dodatki §6 | L1 (nazwa Tech), L2 |
| `/o-firmie` | seed `src/seed/software/about.ts` (bloki `swPageHero`, `swSteps`, `swLines`, `swTeam`, `callToAction`) | hero „Robimy dla firm z Podhala” → „PRO-KOM w liczbach” → „Jedna firma, cztery linie” (**„PRO-KOM Serwis”**) → „Co to znaczy dla Ciebie” → **„Ludzie · Kto z Tobą pracuje”** (Krystian, Tadeusz — inicjały) → „Gdzie nas znaleźć” → CTA | szablon + dodatki §6; „Ludzie” usunąć | L1 (nazwa Tech), L2 |
| `/jedna-firma` | `about.ts:184–360` | osobna strona linii o rodzinie PRO-KOM (w tym „Serwis”, przykłady z Podhala) | zostaje stroną linii; nazwa Tech w L1 | L1 |

---

## 4. Skąd dane kontaktowe (panel vs literał)

| Dana | Biznes | Instalacje | Software |
|---|---|---|---|
| Telefon(y) | `SiteSettings.phone`, `phone2` | `SiteSettings.phone` | `SiteSettings.phone`, `phone2` |
| E-mail | `SiteSettings.email ?? CompanyData.email` | `SiteSettings.email` | `SiteSettings.email` |
| WhatsApp | `SiteSettings.biznes.whatsapp` | `InstalacjeSettings.whatsapp` | — |
| Adres, godziny, NIP, nazwa | `CompanyData` (`locations[0]`, `nip`, `name`) | `CompanyData` (`locations[]`) | `CompanyData` (`locations[0]`) |
| Strefy | `TOWNS` w `AreaMap.tsx` (+ nieużywane `SiteSettings.biznes.serviceAreas`) | `TOWNS` w `kontaktModel.ts`, `plan.ts` | — |
| Lista linii | `TopBar.tsx` `LINES`, `BiznesFooter.tsx` `REGION_LINKS` | `dane/nawigacja.ts`, `dane/oFirmie.ts` | `nawigacja.json`, `about.ts`, `contact.ts`, `src/lib/software/industryLinks.ts` |
| Wspólne | `src/lib/brand/lines.ts` `BRAND_LINKS` (PRO-KOM, Biznes, Instalacje, Software, „Tech · naprawy”) |||

**Literały w kodzie renderującym** (do usunięcia w L1/L2 — dane z loadera `src/lib/shared`):
- wspólne: `src/lib/inquiry/consent.ts:11, 34, 35` („PRO-KOM Tadeusz Wójciak”, „Rabka-Zdrój”, obietnica „Oddzwaniamy w ciągu 60 minut” — potwierdzona przez szefa 27.10 dla Biznesu (`docs/design/prokombiznes/INDEKS.md`), docelowo `responsePromise` linii z panelu).
- Biznes: `src/lib/biznes/seo.ts:7` („Rabka-Zdrój”).
- Instalacje: `dane/oFirmie.ts:24` („salon · ul. Orkana 16B”), `dane/glownaSekcje.ts:486` (fallback „pn–pt 9:00–17:00”), `dane/nawigacja.ts:51, 104` („Rabka-Zdrój”, „Tadeusz Wójciak, od 2004”).
- Software: `SwTopBar.tsx:19` („od 2004 r. · Rabka-Zdrój”).
- Nie są danymi firmy (zostają): demo `FieldCrewDemo.tsx:241` („ul. Orkana 12”), makieta `WizardPreview.tsx:172` („123 456 789”), placeholdery pól „np. 600 000 000”.

**Literały w seedach** (zostają do F1, potem seed bierze dane z jednej stałej): `src/seed/biznes/contact.ts:34–63`, `legal.ts:34` (adres i NIP wprost w tekście), `src/seed/instalacje/contact.ts:10–12`, `src/seed/software/map.ts:432–434`, `contact.ts:61, 168, 172, 179`, `about.ts:~153`, `legal.ts:~27`, `src/seed/sample.ts`.

## 5. Zakazane frazy (spec §2, §10 pkt 2)

Bez migracji, `src/payload-types.ts` i `docs/`. „Zostaje” = nie łamie zasady.

| Fraza | Gdzie (poza testami) | Ocena |
|---|---|---|
| WhatsApp / `wa.me` | **Biznes:** `Frame.tsx:8, 42`, `BzContact/config.ts:5`, `Company.tsx:14–49, 401–407`, `BiznesFooter.tsx:21–22, 155–158`, `BiznesHeader.tsx:28–29, 71`, `SearchOverlay.tsx` (kilkanaście miejsc), `forms/ContactPanel.tsx:10, 48, 56–58`, `home/FaqBiznes.tsx:5, 24, 55, 68–76`; seed `src/seed/biznes/contact.ts:40, 92–99`, `k4PagesRun.ts:69`, `run.ts:1117`, `seed/prokombiznes/k4/strony-k4.json:2252`, `k31/firma-k31.json:10`. **Instalacje:** `InstContact/Component.tsx:13–78`, `InstHome/Component.tsx:10, 60, 150–163`, `dane/glownaSekcje.ts:382–385, 487`, `dane/kontakt.ts:5, 34, 36`, `dane/obiekty.ts:260, 263`, `dane/wyslane.ts:14`, `sekcje/glowna/PlanSection.tsx:22–69`, `src/lib/instalacje/data.ts:207–257`, `plan.ts:111`; seed `src/seed/instalacje/contact.ts:12, 41–53`, `legal.ts:75`, `run.ts:41`, `seed/prokominstalacje/wspolne.json:7–8`, `strony-zrzut/*.json` (Kontakt + 13 stron). **Wspólne:** `SiteSettings.ts:92–96`, `InstalacjeSettings.ts:60–64`, `src/lib/site/link.ts:36–43` (`toWhatsAppHref`), `src/lib/site/public.ts:66, 92`, `src/lib/inquiry/types.ts:20, 25` (`preferredContact`), `listForm.ts:69, 73`. **Software:** tylko komentarz `scripts/software-og.mjs:2`. | usunąć z UI w L1 (powłoka, kafle, FAQ, wyszukiwarka) i L2 (formularze); pola w panelu, `toWhatsAppHref`, opcja `preferredContact` — usunięcie danych = migracja, **F1 albo osobny PR `feat/wsp-*`, po decyzji Krystiana** (najpierw ukryć w UI w L1) |
| `click_whatsapp` | **0 trafień** — w `src/lib/analytics/events.ts` takiego zdarzenia nie ma | nic do usunięcia |
| „i sklep” | `seed/prokomsoftware/faq.json:9` („strona i sklep”), `seed/prokominstalacje/strony-zrzut/Alarmy.json:360` / `dane/alarmy.ts:222` („Firma i sklep”), katalog Biznesu | zostaje — żadne nie dotyczy pro-kom.eu |
| „Serwis” jako nazwa linii | **Software:** `src/seed/software/about.ts:70, 197, 246, 284, 302` („PRO-KOM Serwis”, `name: 'Serwis'`), `contact.ts:153` (`label: 'SERWIS'`), `src/lib/software/industryLinks.ts:53` (`withServiceLineName`). **Biznes:** `BiznesFooter.tsx:53` („Serwis telefonów i laptopów” jako opis linii). **Instalacje:** `dane/oFirmie.ts:47` („Tech · serwis” — nazwa poprawna, opis do sprawdzenia) | na „Tech” w L1 (Software: seed + `industryLinks` + testy `about.test.ts:57, 84`, `industryLinks.test.ts:54`, e2e `software-about`, `software-frame`) |
| `biznes@pro-kom.eu` | `src/seed/biznes/textFixes.ts:13` (zamiana na nowy adres), komentarz `src/seed/tenants.ts:7`, testy | zostaje (strażnik) |
| `18 267 65 11` | `src/seed/biznes/textFixes.ts:15–16` + testy-strażnicy | zostaje (strażnik) |
| `example.test` | `src/seed/sample.ts:8, 14, 37`, `src/seed/tenants.ts:10`, `isSample()` w `src/seed/instalacje/contact.ts:27` i `src/seed/software/map.ts:442`, `.env.example`, CI | zostaje (dane przykładowe tylko lokalnie; seed linii je nadpisuje) — test treści w F1 sprawdza seedy tenantów, nie `sample.ts` |
| `000 000` | `src/seed/sample.ts:16–17, 36` („(przykład)”), placeholdery „np. 600 000 000” w Instalacjach i `seed/prokomsoftware/kreator.json:1065` | zostaje; test treści F1 wyklucza placeholdery `np. …` |

## 6. Zdjęcia ludzi i zaślepki portretów

| Linia | Gdzie | Dziś | Co robimy | Sesja |
|---|---|---|---|---|
| Biznes | `blocks/BzFacts/config.ts:50`, `Component.tsx:55`, seed `src/seed/biznes/homeFacts.ts:36–48` | `owner.photoPlaceholder` — po włączeniu „Zdjęcie właściciela — wkrótce”; seed `false` z `TODO` | usunąć pole i zaślepkę (cytat bez zdjęcia — po decyzji szefa) | L2 |
| Biznes | `firma/Company.tsx:227` | opcjonalne `photoNote` (seed nie ustawia) | usunąć | L2 |
| Software | `blocks/SwTeam` (`config.ts:49` `photoFields`, `Component.tsx:16`), seed `about.ts:119–137` | „Ludzie · Kto z Tobą pracuje” — Krystian, Tadeusz, inicjały bez portretów (SWV6). **Wizualizacja v23 zakłada prawdziwe portrety** (`ZMIANY-v23.md` §2) — uchylone decyzją 01.11 | usunąć sekcję i `photoFields` | L2 |
| Software | `components/about/Photo.tsx:36–50` | „Zdjęcie do zrobienia” — zdjęcia hero i wejścia (nie ludzie) | zostaje jako dodatek „zdjęcie wejścia” (§7) — tylko budynek | L2 |
| Instalacje | `InstalacjeSettings.ts:96` `architects.photo`, `InstArchitects/Component.tsx:593–600` (sylwetka SVG), seed `contact.ts:17` (Tadeusz Wójciak) | opiekun architektów na `/dla-architektow` | usunąć `photo` i sylwetkę (imię i rola zostają) — **poza Kontaktem/O firmie, osobny PR linii** | L2-I |
| — | `public/`, `seed/` | brak plików z portretami | — | — |

## 7. Dodatki linii na Kontakcie i O firmie

Sekcje i elementy, które linia ma dziś w kodzie albo w zaakceptowanej wizualizacji (Biznes K4/v150, Software v23, Instalacje prototyp v4.x), a których **nie ma** w szablonie (spec §6.1 / §6.2). Sloty wg spec §6.0. Wejście do F3 (sloty) i L2 (sekcje linii).

### 7.1 Kontakt (`ContactPage`)
| Linia | Dodatek | Skąd | Propozycja |
|---|---|---|---|
| Biznes | kafel WhatsApp w hero | `Company.tsx:391–429` | **do usunięcia** |
| Biznes | 4 kafle kanałów (Telefon, E-mail, Formularz + drugi telefon) | `contact-hero` | wchodzi w hero szablonu (numer + `facts`); osobnej sekcji nie ma |
| Biznes | `AreaMap` w hero | `Company.tsx:491` | → wspólny `ServiceAreaMap` (sekcja 4 szablonu) |
| Biznes | trasy „Z czym dzwonisz?” do Planu Twojej firmy / Opieki IT | `contactK4Layout` `cards` | wchodzi w `routes` (3 karty z panelu) — bez slotu |
| Instalacje | kafel WhatsApp | `InstContact/Component.tsx:52–80` | **do usunięcia** |
| Instalacje | „Zaplanuj” jako kanał kontaktu | hero `InstContact` | `routes[0]` („Zaplanuj instalację”) — bez slotu |
| Instalacje | mapa stref + wyszukiwarka miejscowości w hero | `ContactHero.tsx`, `kontaktModel.ts` | → wspólny `ServiceAreaMap` + `serviceZones` (`showServiceArea`) |
| Instalacje | drugi salon (Zakopane) | prototyp `#hero` „salony w Rabce-Zdroju i Zakopanem” | `heroAside`, tylko gdy `locations[].published` |
| Instalacje | „Zgłoś awarię” (`/serwis#zglos`) | pasek marki, `/serwis` | `routes` albo `afterRoutes` — do wyboru w L2-I |
| Instalacje | pas CTA na dole | `CtaBandView` | **do usunięcia** (szablon kończy się FAQ; CTA dubluje hero) — albo `beforeFaq`, decyzja L2-I |
| Software | „Twój projekt” (`?projekt=1`, `ProjectBox`) | `SwContact/ContactForm.tsx:131, 283` | `formPrefill` |
| Software | kanał „Online” (spotkanie online) | hero `SwContactPage` | `facts` / `routes` (z panelu) — bez slotu |
| Software | mapa OSM z budynkiem, „Powiększ mapę” | `OsmMap.tsx` | → wspólny `AddressMap` w karcie adresu |
| Software | zdjęcie wejścia „Tak wygląda wejście” | `#gdzie`, `Photo.tsx` | `heroAside` (pod kartą adresu) — tylko budynek, bez ludzi |
| Software | lead „Sto metrów od dworca…” | `ZMIANY-v23.md` §6 | `locations[].parkingNote` / FAQ dojazdu — bez slotu |

### 7.2 O firmie (`AboutPage`)
| Linia | Dodatek | Skąd | Propozycja |
|---|---|---|---|
| Biznes | 4 autoryzacje w hero (Posnet, Elzab, GoPOS, InsERT) | `about-hero` | `CompanyCard` → `auth[]` (statusy wg K4-FINAL §1) — bez slotu |
| Biznes | „Autoryzacje i partnerzy” (marki, „Cała oferta”) | `aboutK4Layout` `brands` | `afterRules` |
| Biznes | „Osiem zasad” (szablon: 6 reguł) | `cards` | `rules[6]` — **8 → 6** (wybór w L2-B) albo propozycja: `RulesBento` przyjmuje 6–8 — decyzja w F3 |
| Biznes | `bzLocation` + pas „Porozmawiajmy” | `aboutK4Layout` | sekcja 7 szablonu („Wpadnij do Rabki”) — **pas do usunięcia** |
| Instalacje | `#historia` „Ponad 20 lat na Podhalu” | prototyp | `afterStats` (tylko treści potwierdzone; bez osi czasu z `[SZEF]`) |
| Instalacje | mapa SVG w hero | `InstAbout #hero` | **do usunięcia** (hero szablonu ma `CompanyCard`; mapa jest w sekcji 7) |
| Instalacje | salony (`#dane`) | `InstAbout #dane` | `CompanyCard` + sekcja 7; drugi salon → `beforeVisit` gdy `published` |
| Software | „Ludzie · Kto z Tobą pracuje” | `about.ts:119` | **do usunięcia** (decyzja 01.11; v23 zakładał portrety) |
| Software | portrety w hero (v23) | `ZMIANY-v23.md` §2 | **do usunięcia** |
| Software | „Co to znaczy dla Ciebie” (Ciągłość, Na miejscu, Na piśmie) | `about.ts:96` | `afterSteps` albo w `rules` — L2-S |
| Software | CTA „Poznajmy się. Kawa w Rabce albo 30 minut online” | `about.ts:160` | sekcja 7 szablonu (`visitText`) — bez slotu |
| Software | odnośnik do `/jedna-firma` | strona linii | link w `FamilyStrip` — bez slotu |

**Bez slotu i bez decyzji** (do F3): Biznes „Osiem zasad” vs `rules[6]`. Nowego slotu nie proponuję — wszystkie dodatki mieszczą się w slotach §6.0.

## 8. `public/brand/`

| Znak | Plik(i) | Wynik |
|---|---|---|
| PRO-KOM główna | `prokom-glowna_poziome_kolor.svg`, `_negatyw.svg` (+ sygnet, favicony) | **jest zielona kreska pod napisem** (`#45A02C`, negatyw `#4FB034`), bez nazwy linii — zgodnie ze spec §5 `LineLogo` |
| Biznes, Instalacje, Software | `prokom-<linia>_poziome_kolor.svg` / `_negatyw.svg` (+ sygnet, favicony; Software też `_og.png`) | są, jasny i ciemny |
| **TECH** | — | **brak** (potrzebny tylko przy kafelku Tech w `LinesBand` / przełączniku; do czasu pliku: kreska w kolorze + tekst „TECH”) |
| Gaming | — | brak (spec §2.4: plik z repo `prokom-gaming`; do czasu pliku tekst „PRO-KOM / GAMING”) |
| Zakopane | — | brak (linia `published: false`) |

Proporcje plików poziomych: 836×167 (`src/lib/brand/lines.ts:28`) → **180×36** w nagłówku (decyzja 01.11).

## 9. Model danych: spec §4 → istniejące pola (wejście F1)

Decyzje 01.11: grupa `shared` linii w **`SiteSettings`**; salony = **rozszerzone `CompanyData.locations[]`**.

| Spec §4 | Dziś | F1 |
|---|---|---|
| `CompanyData.legalName` | `CompanyData.name` | użyć `name` |
| `nip` | `CompanyData.nip` | bez zmian |
| `address` | `locations[0]` (street, postalCode, city) | adres firmy = pierwsza lokalizacja (`key: rabka`) |
| `geo`, `mapsUrl`, `ceidgUrl` | brak | nowe pola (`geo` per lokalizacja) |
| `openingHours[]` | `locations[].hours[]` {days, opens, closes} | godziny salonu = godziny firmy dla `rabka` |
| `holidays[]` | brak | nowe |
| `salons[]` | `locations[]` | dodać `key`, `geo`, `parkingNote`, `published` |
| `lines[]` | `src/lib/brand/lines.ts` `BRAND_LINKS` + listy w liniach (§4) | nowe pole w `CompanyData`; `BRAND_LINKS` → po L1 do usunięcia |
| `serviceZones[]` | `SiteSettings.biznes.serviceAreas` (text hasMany), `TOWNS` w kodzie | nowe w `CompanyData`; `serviceAreas` → do usunięcia po L2-B |
| `legal` | `SiteSettings.footer.links` (per tenant) | zostaje per tenant (`footer.links`) albo `CompanyData.legal` — F1 wybiera jedno, bez dublowania |
| `consentMode` | brak; `CONSENT_CLAUSE` w kodzie (`consent.ts`) | nowe w `CompanyData`; tekst klauzuli z wersją — F1 |
| `email`, `phones[]` (firma) | `CompanyData.email`, `phones[]` | bez zmian |
| `shared.phone`, `phone2`, `email` | `SiteSettings.phone`, `phone2`, `email` | **użyć istniejących** (nie dublować) |
| `shared.footer*`, `legalNote` | `SiteSettings.footer.text`, Biznes `biznes.footer.*` | `footerDescription` = `footer.text`; kolumny w `shared` |
| `shared.brandBarSlot`, `headerCta`, `tabBar` | Software: `software.navigation` (JSON); Biznes/Instalacje: kod | nowe w `shared`; Software JSON — migracja danych w L1-S |
| `shared.contact`, `shared.about` | strony CMS (bloki) | nowe w `shared`; treść przenosi L2 |
| WhatsApp | `SiteSettings.biznes.whatsapp`, `InstalacjeSettings.whatsapp` | ukryć w UI (L1); usunięcie pól = migracja usuwająca dane we wspólnych polach — F1 albo osobny PR `feat/wsp-*` (nie sesja L), decyzja Krystiana |
| `Inquiries` | typy `contact | list | wizard | search | audit`; `consent` {accepted, clauseVersion, acceptedAt} | bez zmian (spec „typ `kontakt`” = `contact`) |

Loader: dziś `getCompanyData()` i `getSiteSettings(tenantId)` w `src/lib/site/data.ts` (+ `toPublic*` w `public.ts`). `src/lib/shared/getSharedData.ts` (F1) **składa** te dwa loadery, nie dubluje zapytań.
