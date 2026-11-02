# Elementy wspólne — mapa „dziś → docelowo” (F0, 01.11.2026)

Rozpoznanie kodu na `develop` @ `76f6060` (po SWV9); §10 (szyna, wyszukiwarka, pasek przewijania) — F0b, `develop` @ `ed0af85`. Wejście do F1–F3 (fundament) i L1–L2 (sesje linii). Spec: `WSPOLNE-ELEMENTY.md`, decyzja: `docs/decyzje/ADR-022-elementy-wspolne-linii.md`, plan: `docs/zadania/wspolne-elementy.md`.

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
| **TECH** | nie ma w `public/brand/`; **komplet jest w paczce znaku** (poza repo, `docs/marka.md`): `01_wektor/SVG/tech/prokom-tech_poziome_kolor.svg` / `_negatyw.svg` (+ pionowe, sygnet, slogan, `03_ikony/tech/`) | F2 kopiuje `prokom-tech_poziome_kolor.svg` i `_negatyw.svg` do `public/brand/` (kafelek Tech w `LinesBand`, przełącznik) |
| Gaming | nie ma w `public/brand/`; jest w repo `prokom-gaming`: `docs/design/prokomgaming/marka/prokom-gaming-znak-ciemne.svg` (wersja na ciemne tło; w kodzie Gaming — `src/components/Logo.tsx`) | F2 kopiuje `prokom-gaming-znak-ciemne.svg` do `public/brand/` (kafelek Gaming §2.4 ma ciemne tło `#080C0B`) |
| Zakopane | nie ma w `public/brand/`; jest w paczce znaku (`01_wektor/SVG/zakopane/`) | niepotrzebny, dopóki linia `published: false` |
| Księga znaku | `PRO-KOM_ksiega_znaku.pdf` w folderze marki (poza repo, `docs/marka.md`; też `05_ksiega/` paczki) | źródło zasad znaku; minimum 220 px — druk (decyzja F0: ekran 180×36) |

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

## 10. Boczna szyna, wyszukiwarka, pasek przewijania (F0b, 02.11.2026)

Rozpoznanie na `develop` @ `ed0af85`. Docelowo: `SiteRail` i `SearchDialog` (spec §5.1), reguła paska przewijania (spec §3). Decyzje Krystiana 02.11 po rozpoznaniu: na podstronach sekcje strony głównej (bez menu globalnego Biznesu), wymiary i rozwijanie wg planszy Szyna (64 → 248 px, `clip-path`, 120/250 ms), aktywna sekcja z istniejącego `railActive.ts`, `aria-current="location"`, pasek kotwic Instalacji i `ProductSectionNav` Biznesu zastąpione grupą „Na tej stronie” od 1400 px.

### 10.1 Szyny dziś

| Linia / element | Plik(i) | Dziś | Co robimy | Sesja |
|---|---|---|---|---|
| Wspólny `RailShell` | `src/components/SectionRail.tsx` (`RailShell` l. 63–112, `railLinkClass` l. 33, `SectionRail` l. 136) | `<nav>` `fixed top-1/2 left-4`, `hidden` → `min-[1400px]` / `min-[1401px]:block`; zwinięta `w-11` (44 px), rozwinięta `w-[214px]` na `group-hover` / `group-focus-within`; `transition-[width] duration-200`, `overflow-hidden`, bez opóźnień i bez `clip-path`; ramka `rounded-[22px] bg-card p-1` + cień; pozycje `h-9 rounded-[14px] text-sm font-bold`, ikony `Icon` 20 px; opcjonalny przycisk „Szukaj” (`requestSearch()`, `<kbd>` „Ctrl K lub /”, `aria-keyshortcuts`), bez pulsu; nagłówek grupy widoczny po rozwinięciu; pozycje bez sekcji w DOM odfiltrowane (`useSyncExternalStore`), < 2 pozycje → szyna znika | **rozbudować w `SiteRail`** (spec §5.1): 64 → 248 px, `clip-path` zamiast szerokości, 120/250 ms, tokeny `--dur-*`/`--ease-*`, puls „Szukaj” raz na sesję, `aria-current="location"`; przenieść do `src/components/shared/` | F2 |
| Aktywna sekcja | `src/lib/site/railActive.ts` (+ `railActive.test.ts`) | ostatnia sekcja, której góra minęła 40% okna (`RAIL_LINE = 0.4`), na dole strony ostatnia; pomiar w `requestAnimationFrame` przy scroll/resize | **zostaje** (decyzja 02.11) — używa go `SiteRail`, także w grupie „Na tej stronie” | F2 |
| Biznes — strona główna | `SectionRail` w `src/app/(sites)/[domain]/page.tsx:56` (`search`, `from=1400`), pozycje `src/sites/biznes/components/home/rail.ts:274–321` (`railItems`, + `rail.test.ts`) | 12 pozycji z bloków: `start` Start (rocket) · `oferta` Działy oferty (store) · `systemy` Systemy i opieka IT (server, warunkowo) · `marki` Marki (star) · `wybierane` Najczęściej wybierane (grid) · `dla-kogo` Dla kogo (users, warunkowo) · `plan` Plan Twojej firmy (map) · `jak-pracujemy` Jak pracujemy (compass) · `opinie` Opinie (chat, warunkowo) · `fakty` O firmie (doc) · `faq` Pytania (q) · `kontakt` Kontakt (phone); zwykłe linki `#id`, bez płynącego wskaźnika; `aria-current="true"`; id na stronie głównej zgodne z listą (`BzHero`, `BzOffer`, `BrandsHome`, `BzFeatured`, `BzPlan`, `BzSteps`, `BzReferences`, `BzFacts`, `FaqBiznes`, `BzContact`) | **lista startowa `shared.rail.sections` Biznesu** (seed F1; warunkowe pozycje jak dziś); `SiteRail` na każdej stronie, przycisk Szukaj otwiera wyszukiwarkę K4b | F1, F2 → L1-B |
| Biznes — podstrony | `src/sites/biznes/components/rail/SiteRail.tsx` (w `Frame.tsx:57`, `null` na `/`), `rail/siteRailItems.ts:49–59` (+ test) | „Menu boczne” = **menu globalne**: Strona główna, Oferta, Konfigurator, Plan Twojej firmy, Gotowe zestawy, Opieka IT, O firmie, Kontakt, Marki; `aria-current="page"` (`/produkt/*` → Oferta) | **usunąć** (decyzja 02.11) — zastępuje go wspólny `SiteRail` (sekcje strony głównej `/#id` + „Na tej stronie”). Nazwa pliku koliduje z nowym `SiteRail` — L1-B usuwa stary plik i jego test | L1-B |
| Software — strona główna | ten sam `SectionRail` (`from=1401`, `glide`), pozycje `src/sites/software/components/home/rail.ts:16–28` | 11 pozycji: `start` Start · `oferta` Oferta · `popularne` Najczęściej zamawiane · `podglady` Podglądy na żywo · `dobierz` Dobierz rozwiązanie · `jak-robimy` Jak robimy · `bez-wordpressa` Dlaczego nie WordPress · `technologie` Z czego budujemy · `zasady` Zasady · `faq` Pytania · `kontakt` Kontakt (`proces` bez etykiety — poza szyną); płynący wskaźnik `span[data-rail-marker]` (`--dur-state` 280 ms, `--ease-out`), klik = `glideTo` (`src/lib/software/smoothScroll.ts`) + `pushState` + fokus; **tylko strona główna** | lista startowa `shared.rail.sections` Software (bez realizacji); płynący wskaźnik i `glideTo` → wspólne zachowanie `SiteRail` | F1, F2 → L1-S |
| Instalacje — strona główna | `src/sites/instalacje/widzety/glowna/SectionRail.tsx` (w `blocks/InstHome/Component.tsx:88`), `widzety/glowna/rail.ts`, pozycje `dane/glownaSekcje.ts:496–507`, CSS `sekcje/glowna/glowna-sekcje.css:11–81, 2887` | **własny komponent, bez `RailShell`**: stałe 40 px, bez rozwijania — etykieta jako dymek na hover i `:focus-visible`; pojawia się po `scrollY > 400` (opacity 0,4 s), od 1400 px; aktywna przy 35% okna; `aria-label="Sekcje strony"`, `aria-current="location"`; 10 pozycji: `start` · `dla-kogo` · `uslugi` · `architekci` · `realizacje` · `gory` · `proces` · `serwis` · `faq` · `zaplanuj` (id są; `trust` bez id, `#kontakt` w `PlanSection.tsx:49`) | lista startowa `shared.rail.sections` Instalacji (widoczna od razu, jak w Biznesie); stary komponent, `rail.ts` i CSS `.rail` usunąć | F1, F2 → L1-I |
| Instalacje — pasek kotwic | `src/sites/instalacje/powloka/AnchorsBar.tsx` (`nav.anchors`), CSS `instalacje.css:334–361, 890, 989` | przyklejony (`top: 76px`, ≤ 760 px `64px`, przy schowanym nagłówku `0`), przewijany w poziomie, bez śledzenia aktywnej sekcji, na wszystkich szerokościach; używają: `sekcje/PageHero.tsx:119` → `blocks/InstService` (usługi), `obiekty/ObjectPage.tsx` (Dla kogo), `blocks/InstServiceDesk` (serwis); bezpośrednio `blocks/InstArchitects/Component.tsx:176` | **od 1400 px ukryty** — zastępuje go grupa „Na tej stronie”; poniżej zostaje; sekcje dostają `data-rail-section` | L1-I |
| Biznes — pasek sekcji produktu | `ProductSectionNav.tsx` (strona `(biznes)/produkt/[slug]/page.tsx:177–185`) | przyklejony, od `lg`, `IntersectionObserver` (`rootMargin -35%/-55%`), ok. 12 sekcji | jak pasek kotwic Instalacji: **od 1400 px ukryty**, poniżej zostaje (decyzja 02.11) | L1-B |

### 10.2 Wyszukiwarki dziś

| Linia | Plik(i) | Dziś | Co robimy | Sesja |
|---|---|---|---|---|
| Biznes (K4b) | `src/sites/biznes/components/SearchOverlay.tsx` (w `BiznesHeader.tsx:71`), `src/lib/site/searchShortcut.ts`, `src/lib/site/searchOpen.ts`, indeks `GET /api/catalog-index` (`src/app/api/catalog-index/route.ts`, `src/lib/catalog/useCatalogIndex.ts`, `catalogIndex.ts`), synonimy / stop-słowa / popularne z panelu (`src/collections/searchGroup.ts` w `BiznesSettings.search`) | modalny `<dialog>`; Ctrl/Cmd K wszędzie, „/” poza polami; ↑/↓, Esc, klik tła; pusty stan: Najczęściej szukane · Na skróty (6 kategorii + Konfigurator + Plan) · Salony marek; wyniki: Produkty i usługi (7, „Podgląd” → `QuickView`, „Pokaż wszystkie” → `/oferta?szukaj=`) + Strony i usługi (3), Kategorie (4), Marki (3), Gotowe zestawy (2); brak wyników → „Zapytaj o «…»” (`/zapytanie?fraza=`) i **„Napisz na WhatsApp”** | **zostaje** (spec §5.1); dochodzi grupa „Akcje” (paleta poleceń, dodatek 5) na górze; WhatsApp usunąć; otwierana też przyciskiem `SiteRail` | L1-B |
| Silnik | `src/lib/search.ts` (+ `search.test.ts`), `src/lib/catalog/normalize.ts` | **ogólne:** `normalizeText` (małe litery, ł→l, bez znaków diakrytycznych), `damerauLevenshtein` (od 4 znaków 1 edycja, od 7 — 2), `tokenize`, `prepareItems`, `searchItems`, `resultsLabel`; wagi: nazwa 3, tekst 1, synonim 1, literówka 0,6, popularność `+p/200`; **Biznes (katalog):** `prepareSearch`, `searchProducts`, `matchCategories`, `matchPages`, `matchBrands`; część ogólną używa już `src/lib/software/search.ts` | część ogólną przenieść do `src/lib/shared/search/` bez zmiany zachowania (testy Biznesu zielone); część katalogowa zostaje w Biznesie | F2 |
| Software | katalog `/rozwiazania` (`components/catalog/Catalog.tsx:164–187`, `src/lib/software/search.ts`, stan w `?q=`); `components/MenuSearch.tsx` (w `PhoneLayer.tsx:72` i na 404; `/api/solutions-index`, 5 podpowiedzi, Enter → `/rozwiazania?q=`) | filtr katalogu i podpowiedzi w menu telefonu; **brak okna wyszukiwania i skrótów** (hasła „Znajdź swoje rozwiązanie” w kodzie nie ma) | `SearchDialog` + indeks linii; filtr katalogu zostaje; `MenuSearch` → otwiera `SearchDialog` albo zostaje polem w arkuszu (L1-S) | F2 → L1-S |
| Instalacje | `/uslugi`: `widzety/oferta/OfferWidgets.tsx` (`OfferBar`, `.ofbar`, `.ofs`), `offerModel.ts:118` (`offerView`) | filtr klienta na stronie Oferty (normalizacja, `SYNONYMS`/`stem`, chipy obiektów, stan w module, bez URL); **brak okna wyszukiwania i skrótów** | `SearchDialog` + indeks linii; filtr Oferty zostaje; słownik `SYNONYMS` → synonimy linii w panelu | F2 → L1-I |

### 10.3 Pasek przewijania dziś

| Linia | Plik(i) | Dziś | Co robimy | Sesja |
|---|---|---|---|---|
| Software (v23) | `src/app/(sites)/globals.css:385–409` | `[data-line='software']` (atrybut na `<html>`, `layout.tsx:25`): `--scrollbar-thumb: color-mix(in srgb, var(--accent) 45%, var(--border))`, **`scrollbar-color` i `scrollbar-width: thin` bezwarunkowo** (l. 390–394), do tego `::-webkit-scrollbar` 10 px, tor przezroczysty, suwak z 2 px obramowaniem i `radius 999`, akcent po najechaniu. **Błąd:** właściwości standardowe dziedziczą się, więc w Chrome/Edge 121+ reguły `::-webkit-scrollbar*` są martwe — zostaje zwykły cienki pasek w kolorze, bez zaokrąglenia, obramowania i zmiany po najechaniu | wspólna reguła 3 linii wg spec §3: `::-webkit-scrollbar*` (14 px, 3 px obramowanie w kolorze toru `surface-2`, suwak = akcent ~68% z torem, akcent po najechaniu; cienka 8 px w oknach, mega menu, arkuszach, wynikach), standard `scrollbar-color` **tylko w `@supports not selector(::-webkit-scrollbar)`**; ciemny motyw — `on-dark`; test kontrastu suwak/tor ≥ 3:1 | F2 |
| Biznes | — | brak stylu paska; tylko `[scrollbar-width:none]` (`category/CategoryGrid.tsx:279`, `plan/FloorPlan.tsx:157`) i `[scrollbar-width:thin]` (`FloorPlan.tsx:219`) | dostaje regułę wspólną | F2 |
| Instalacje | m.in. `instalacje.css:347/351`, `obiekty/obiekty.css`, `sekcje/glowna/glowna-sekcje.css`, `sekcje/sekcje.css`, `widzety/*/*.css` | brak stylu głównego paska; poziome przewijaki ukryte parą `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` | dostaje regułę wspólną; ukryte przewijaki bez zmian | F2 |
| Ukryte przewijaki Biznesu i Software | `[scrollbar-width:none]` w ok. 20 komponentach Software (`Catalog.tsx:204`, `PricingTable.tsx:39`, `home/*Explorer.tsx`, `SoftwareFooter.tsx:253`…) i 2 Biznesu | bez pary `::-webkit-scrollbar { display: none }` — po wprowadzeniu reguły wspólnej (webkit poza `@supports`) **pokazałyby paski** w Chrome | F2: wspólna klasa „ukryty pasek” (obie reguły) albo reguła dla `[scrollbar-width:none]`; zrzuty przed/po | F2 |

### 10.4 Długie podstrony — kandydaci do „Na tej stronie” (spec §5.1 pkt 4, próg ≥ 3 sekcje)

Liczba sekcji najwyższego poziomu; „bez id” = trzeba nadać id i `data-rail-section` w L1 (bez zmiany wyglądu).

| Linia | Strona | Plik | Sekcji | Uwagi |
|---|---|---|---|---|
| Biznes | produkt | `(biznes)/produkt/[slug]/page.tsx:65–76` | ok. 12 | id są (przeglad, opis, wybierz-wersje, film, parametry, wersje, zestawy, dobierz, rodzina, faq, zrodla, pas-cta); dziś `ProductSectionNav` |
| Biznes | GoPOS | `[slug]`, układ `src/seed/biznes/k4Pages.ts:191–395` | 14 | id z pola `anchor` albo `sekcja-<blockId>` (`BzSection/ui.tsx:53`); nazwane: lokal, moduly, pakiet, film-gopos |
| Biznes | InsERT | `k4Pages.ts:408–560` | 12 | nazwane: ktory, ksef, inspunkty |
| Biznes | automaty vendingowe | `k4Pages.ts:1037–1140` | 10 | nazwane: co |
| Biznes | salon marki | `marki/[slug]/page.tsx:225–275` | 9 | id: oferta, oferta2, oferta-cala, dobor, serwis, wdrozenie; bez id: hero, O marce, FAQ |
| Biznes | Opieka IT | `k4Pages.ts:725–850` | 9 | nazwane: przeglad, zakres |
| Biznes | ulga na kasę | `k4Pages.ts` | 9 | — |
| Biznes | kategoria | `oferta/[kategoria]` → `CategoryPageView.tsx` | ok. 8 | id tylko faq, kontakt |
| Biznes | KSeF | `k4Pages.ts:1149–1410` | 7 | bez nazwanych kotwic |
| Biznes | Plan Twojej firmy | `plan-firmy/page.tsx`, `FloorPlan.tsx:196, 277, 363` | 3 | id z `useId` — nadać stałe |
| Biznes | Konfigurator, `/oferta` | — | 0–1 | kreator / katalog — bez grupy |
| Instalacje | Dla architektów | `blocks/InstArchitects` | 17 | pasek kotwic ma 12 pozycji (`dane/architekci.ts:53`); szyna pokazuje maks. 10, dłuższa lista przewija się |
| Instalacje | usługa (np. monitoring) | `blocks/InstService`, `src/lib/instalacje/anchors.ts` | 12 | id są |
| Instalacje | obiekt (np. pensjonaty) | `obiekty/ObjectPage.tsx:171–364` | do 10 | zależnie od danych |
| Instalacje | serwis | `blocks/InstServiceDesk` | 6 | — |
| Instalacje | O firmie | `blocks/InstAbout` | 4 | L2 zmienia na szablon |
| Instalacje | kontakt, zaplanuj | — | 1–3 | bez grupy |
| Instalacje | poradnik (artykuł) | `poradnik/GuidePost.tsx:146` | — | własny spis treści `nav.toc` — zostaje |
| Software | O firmie | `src/seed/software/about.ts:170–181` | 8 | bloki Sw* bez id; L2 zmienia na szablon |
| Software | rozwiązanie | `rozwiazania/[slug]/page.tsx:117–160` | 6 (+ demo) | id: jak-dziala, pytania, kontakt; bez id: hero, porównanie, oferta |
| Software | cennik | `SwPricing` + FAQ | 6 | id: opieka, audyt, faq |
| Software | branża | `dla-branz/[branza]` | ok. 6 | id: problemy, pytania, kontakt |
| Software | miasto | — | 6 | id tylko pytania |
| Software | jedna firma | `about.ts:356–365` | 6 | bez id |
| Software | audyt | `SwAuditForm` + FAQ | 5 | id: formularz, rodzaje, faq |
| Software | kreator `/dobierz` | — | 0 | kreator — bez grupy |
| Software | wpisy | `SoftwarePost.tsx:157`, `SwRichText.tsx:53` | — | własny spis treści — zostaje |

Plan v2 w L1 (pkt 1a) wymienia część z nich; ta tabela jest pełną listą — zakres oznaczania ustala sesja L danej linii.
