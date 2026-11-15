# prokomsoftware.pl — przekazanie v24 „Aurora” do budowy (06.11.2026)

**Dla kogo:** Claude Code w repo `prokom-web`. **Stan repo:** Software v23 zbudowany (SW0–SW12, SWV1–SWV9 scalone), przed stagingiem. Elementy wspólne linii: D1 scalone, **D2 w toku** (D2-1a otwarte; D2-1b → D2-2 → D2-3 → D2-4 wg `docs/zadania/wspolne-elementy.md`). **Krystian 06.11.2026 zaakceptował wizualizację v24 Aurora** i zlecił przebudowę Software przed stagingiem — większymi sesjami.

Wzorzec: `docs/design/prokomsoftware/v24/` — `README.md`, **`ZMIANY-v24.md` (specyfikacja)**, `boards/` (plansze), `screens/` (zrzuty), `TRESCI-v24.md`, `wzorzec/`.

---

## 0. Zasady pierwszeństwa i decyzje

1. `v24/ZMIANY-v24.md` + `v24/boards` + `v24/screens` wygrywają z v20–v23 wszędzie, gdzie się różnią. ADR-015 i ADR-014 „Rozstrzygnięcia v24” (dopisane w tym PR) zastępują sprzeczne punkty (m.in. zakaz gradientów i poświat z v23).
2. Powłoka (pasek marki, kapsuła, szyna, wyszukiwarka, stopka, dolny pasek, menu telefonu) oraz szablony **O firmie** i **Kontakt** pochodzą z **komponentów wspólnych D2** — Software ich nie kopiuje. Brakuje czegoś we wspólnym komponencie → mały PR `feat/wsp-<co>` (zasada ADR-022), potem linia z niego korzysta. Sesja SWA5 **zastępuje D3-S** z planu elementów wspólnych.
3. To **przeróbka działającego kodu**: przed kodem wypisz, co zostaje, co zmieniasz, co usuwasz. Bez martwego kodu (stare komponenty, klasy, testy i dane usuwane razem z wymianą).
4. Kolory i czasy ruchu tylko w `src/styles/tokens.css` (+ reguły ruchu w `src/styles/motion.css`). `v24/wzorzec/aurora.css` = opis efektu, **nie do wklejenia**.
5. Migracje: `up → down → up`. **Migracja usuwająca dane = pytanie do Krystiana** (CLAUDE.md). Na stagingu seed jest zablokowany → dane opisujesz w STAN jako kroki „przed stagingiem v24” (komendy `pnpm -s software:*-json`).
6. **Hero = priorytet wyglądu** (decyzja Krystiana 06.11): ma być 1:1 jak plansze; **Lighthouse nie blokuje strony głównej Software** (mierzysz i wpisujesz do PR). Szczegóły: ZMIANY §4.1a i §12.

### 0.1 Decyzje przyjęte domyślnie (Krystian może zmienić w planie sesji)
| # | Decyzja | Domyślnie |
|---|---|---|
| D1 | Adresy URL | **zostają**: „Oferta” = `/rozwiazania`, Kreator = `/dobierz`, `/audyt`, `/cennik`, `/o-firmie`, `/kontakt`, `/aktualnosci`, `/polityka-prywatnosci`, `/mapa-strony`; **nowe**: `/regulamin`, `/cookies`, `/dostepnosc` (slugi zgodne z D2-1b, jeśli tam już ustalone) |
| D2 | `/jedna-firma` | treść wchodzi do O firmie (sekcja „Pięć linii i marka PRO-KOM Gaming”, `#linie`), stary adres → **301 na `/o-firmie#linie`** (Przekierowania), strona i jej bloki usunięte |
| D3 | Motyw | **ciemny domyślnie** dla Software (dziś: systemowy); wybór dalej w `pk-theme` |
| D4 | Gradienty i poświaty | dozwolone w zamkniętej liście (ZMIANY §1), tylko z rodziny fioletu Software |
| D5 | Makiety | komponenty `mockups/` zamiast miniatur SVG na kartach; pole `Solutions.preview` {kind, variant} (migracja tylko dodająca), SVG zostaje jako zapas i do OG |
| D6 | Strona główna | 10 sekcji v24 (ZMIANY §4); znikają: obszary (`areas`), „12 rzeczy” (`popular`), podglądy (`livePreviews`), „Jak robimy”, „Dlaczego nie WordPress”, „Technologie” (→ jedna sekcja techniczna), „Zasady” (→ obietnice); usunięcie wariantów bloku = migracja danych → **pytanie do Krystiana** przed wykonaniem |
| D7 | Kategorie wpisów | Software: **Poradnik, Strony, Systemy, Automatyzacje, Bezpieczeństwo** (plansza); stare „Nowości” → Poradnik, „Realizacje” → Strony (migracja danych) |
| D8 | Mapa | zostaje prawdziwa mapa z OpenStreetMap (SWV4, ODbL, podpis) — w kolorach v24; stylizowana mapa z planszy to tylko zastępstwo |
| D9 | Kreator | v3 zastępuje v22 w całości (bez dodatków); stary kształt `wizard` przepisany migracją danych |
| D10 | Kategorie oferty | w UI 4 grupy (Strony / Przebudowa i opieka / Systemy / Automatyzacje), w danych bez zmiany enumu (mapowanie w `lib/software/catalog.ts`) |

---

## 1. Sesje (duże — jeden plan, kilka PR-ów piętrowych)

Folder: **`prokom-web`** (folder Software, port 3001, baza `prokom_web_software`). Sesje D2 elementów wspólnych idą **w innym folderze** (fundament) — najwyżej dwie sesje piszące kod naraz. Każda duża sesja: plan całości w trybie planowania (akceptuje Krystian) → PR-y piętrowe (≤ ~400 linii diffu każdy) → po każdym PR `/przeglad` → `/koniec-sesji` → `/pr`. Następny wieczór: `/zadanie SWA<n> — kontynuacja wg STAN`.

| Sesja | PR-y (piętrowo) | Zakres | Warunek | Szac. (wieczory) |
|---|---|---|---|---|
| **SWA1 — fundament Aurora** | 1a tokeny, motyw, ruch · 1b prymitywy UI + makiety + `Solutions.preview` + narzędzie porównania | ZMIANY §1, §2, §5, §8; strona podglądu `/_software` (dev, 404 na produkcji) | ten PR docs scalony | 1,5 |
| **SWA2 — strona główna** | 2a **hero** (kosmos, kafle, karuzela 3D, podpis, zaufanie, taśma) · 2b obietnice, sytuacje, bento oferty, showroom branż · 2c sekcja techniczna, cennik, proces, FAQ + formularz, nowa kolejność + szyna sekcji + migracja sekcji | ZMIANY §4 (hero §4.1–4.1a) | SWA1 | 2,5 |
| **SWA3 — kreator v3** | 3a dane: Zod `wizard` v3, `wizardFlow` v3 (TDD), seed, migracja danych, zgłoszenie · 3b UI kreatora + podgląd na żywo + `/dobierz` | ZMIANY §7, §9.5 | SWA1 (UI makiet) | 1,5 |
| **SWA4 — oferta, cennik, audyt, treści** | 4a `/rozwiazania` + okno oferty v24 · 4b `/cennik` + `/audyt` · 4c restyl `/rozwiazania/[slug]`, `/dla-branz/[branza]`, `/miejscowosci/[miasto]`, `/aktualnosci` + wpis (kategorie D7) | ZMIANY §6, §9.1, §9.4, §9.8 | SWA1 | 2 |
| **SWA5 — powłoka i szablony wspólne (= D3-S)** | 5a pasek marki, kapsuła + mega menu, szyna, wyszukiwarka, stopka + pas „Zacznij od podglądu”, dolny pasek, menu telefonu; usunięcie starej ramy Software · 5b `/o-firmie` i `/kontakt` na szablonach D2-4 + sloty Software, `/jedna-firma` → 301 | ZMIANY §3, §9.2, §9.3 | 5a: **D2-1b i D2-2 scalone** · 5b: **D2-4 scalone** | 2 |
| **SWA6 — strony prawne, systemowe i QA** | 6a `/polityka-prywatnosci` v24, `/regulamin`, `/cookies`, `/dostepnosc`, `/mapa-strony`, blok tabeli · 6b `/dziekujemy`, 404, klauzule pod formularzami, SEO/OG, content-scan, pełne porównanie z planszami (4 szerokości, 2 motywy), lista „przed stagingiem v24” | ZMIANY §9.6, §9.7, §11, §13 | SWA2–SWA4 (6b także SWA5) | 1,5 |
| | | | **Razem** | **≈ 11** |

**Kolejność:** SWA1 → SWA2 → SWA3 → SWA4 → SWA5 (gdy D2 gotowe) → SWA6. Jeśli D2 się opóźnia, SWA6a może iść przed SWA5. Staging Software po SWA6 (listy „przed stagingiem” SW10–SW12, SWV, SWA w STAN).

---

## 2. Mapa zmian → kod (punkt startu; zweryfikuj w sesji)

| Zmiana v24 | Gdzie dziś (v23) | Sesja |
|---|---|---|
| Tokeny Aurora (szkło, poświaty, `em`, siatka, makiety `--mk-*`), motyw ciemny domyślnie | `src/styles/tokens.css` (sekcja software ~l.37–39, 103–194, 1175, 1309, 1374), `src/lib/brand/theme.ts` (`DARK_THEME_LINES`, `LIGHT_BY_DEFAULT`), skrypt motywu w `(sites)/layout.tsx`, strażniki `src/styles/themes.test.ts`, `no-raw-colors.test.ts`, `tokens.test.ts` | SWA1 |
| Ruch v24 (wejście `view()` na `translate`, przybycie po przejeździe, przebłysk przycisków, view transitions, kosmos) | `src/styles/motion.css`, `lib/software/smoothScroll`, `components/motion/RevealObserver`, `PageTransition` w `SoftwareFrame` | SWA1 |
| Prymitywy (szkło, nagłówek sekcji z `em`, chipy, segment, przyciski v24) | `home/SectionHead`, `components/ui/*`, `software.css` | SWA1 |
| Makiety | nowe `src/sites/software/components/mockups/`; dziś `offer/OfferThumb`, miniatury `public/software/rozwiazania/*.svg`, `home/LivePreviews`/`PreviewScreens`, `HeroBuilder` | SWA1 |
| `Solutions.preview` | `collections/Solutions.ts`, seed `src/seed/software/map.ts`, indeks `solutionsIndex` | SWA1 |
| Hero v24 | `blocks/SwHero` (+`HeroBuilder`, `HeroPanelCard`), `lib/software/heroBuilder.ts`, `SoftwareSettings.home` (`heroModules`, `sections.heroPanel`) | SWA2 |
| Sekcje głównej v24 | `blocks/SwHomeSection`, `lib/software/homeSections.ts`, `home/*` (AreasExplorer, PopularExplorer, LivePreviewTabs, ProcessExplorer, HowWeBuild, WhyNotWordpress, Technologies, Guarantees, FaqSoftware), `SwContact`, seed `src/seed/software/home.ts`, `homeExtras.ts`, `seed/prokomsoftware/strona-glowna.json`, `home/rail.ts`, migracje `software_home_*` | SWA2 |
| Kreator v3 | `lib/software/wizard.ts`, `wizardFlow.ts`, `wizardRules.ts`, `components/wizard/*`, `seed/prokomsoftware/kreator.json`, `src/seed/software/wizardExtras.ts`, `lib/inquiry/wizardForm.ts`, `lib/analytics/events.ts` | SWA3 |
| Oferta, okno oferty | `(software)/rozwiazania/page.tsx`, `catalog/*`, `offer/*` (`SolutionDialog`, `OfferParts`, `OfferThumb`), `lib/software/catalog.ts`, `cardPrice.ts` | SWA4 |
| Cennik, audyt | `blocks/SwPricing` (+`PricingTable`, `pricing/LevelCards`), `blocks/SwAuditForm` (+`AuditForm`) | SWA4 |
| Podstrony bez planszy | `solution/*`, `industry/*`, `(software)/miejscowosci/…`, `news/*` (`SoftwareNews`, `SoftwarePost`, `PostCards`), `Posts.category` | SWA4 |
| Powłoka | `sites/software/Frame.tsx`, `SwTopBar`, `SoftwareHeader`, `SwHeaderNav`, `SwMegaMenu`, `SoftwareFooter`, `PhoneLayer`, `TabBar`, `MenuSearch`, `ThemeSegment`, `SectionRail` (home) → wspólne `BrandBar`, `SiteHeader` (kapsuła), `SiteRail`, `SearchDialog`, `SiteFooter`, `LinesBand`, `LegalBar`, `AddressMap`, `TabBar`, `MenuSheet` (D2); dane `SiteSettings.shared` (seed `src/seed/shared/software.ts`) + `SiteSettings.software.navigation` | SWA5 |
| O firmie, Kontakt, Jedna firma | bloki `SwPageHero`, `SwSteps`, `SwLines`, `SwTeam`, `SwHomeSection:compare`, `SwContactPage` (+`ContactHours`, `OsmMap`, `ProjectBox`), seed `about.ts`, `contact.ts` → szablony D2-4 + sloty | SWA5 |
| Strony prawne, 404, Dziękujemy | `legal.ts` (polityka z bloków), `/mapa-strony` (`SoftwareSiteMap`), `NotFoundSoftware`, `(software)/dziekujemy`, `SoftwareSettings.thanks/notFound`; nowe `/regulamin`, `/cookies`, `/dostepnosc` | SWA6 |

---

## 3. Prompty

### 3.0 Wspólny blok każdej sesji SWA (wklejany przez prompt sesji)
```
Źródła (czytaj w tej kolejności): docs/STAN.md (podsekcja prokomsoftware.pl), docs/design/prokomsoftware/PRZEKAZANIE-v24.md (§0, §1, wiersze §2 tej sesji, §4–§6), docs/design/prokomsoftware/v24/ZMIANY-v24.md (§ tej sesji + §0, §1, §5), ADR-015 i ADR-014 „Rozstrzygnięcia v24”, MOBILE-APLIKACJA.md §4–§5.
Wzorzec: plansze docs/design/prokomsoftware/v24/boards (uruchom: cd docs/design/prokomsoftware/v24/boards && python3 -m http.server 8765), zrzuty v24/screens, teksty v24/TRESCI-v24.md, efekt i dane: v24/wzorzec/aurora.css, aurora.js, sekcje/*.html.
Zasady: przeróbka działającego kodu (najpierw: zostaje / zmieniam / usuwam), bez martwego kodu; kolory i czasy tylko z tokenów; ceny i terminy z Solutions; migracje up → down → up, migracja usuwająca dane = pytanie do mnie; dane, których seed nie zmieni na stagingu, opisz w STAN jako kroki „przed stagingiem v24”; testy Biznesu i Instalacji muszą zostać zielone; komponentów wspólnych (src/components/shared, src/lib/shared) nie zmieniasz — brak = mały PR feat/wsp-*.
Przed PR: zrzuty Playwright 1440, 1280, 834, 390 (ciemny i jasny) porównane z v24/screens i planszami (narzędzie z SWA1b), 360 bez poziomego przewijania, MOBILE-APLIKACJA §5, axe bez błędów, Lighthouse zmierzony i wpisany do PR (strona główna — informacyjnie, nie blokuje).
```

### 3.1 SWA1 — fundament Aurora
```
/zadanie SWA1 — fundament Aurora (duża sesja: PR-y 1a i 1b piętrowo)
git fetch; gałąź feat/swa1-tokeny-ruch od origin/develop; potem feat/swa1-makiety od niej.
[blok 3.0]
Najpierw JEDEN plan całości w trybie planowania (1a + 1b), z pytaniami na końcu — czekaj na akceptację.
1a (ZMIANY §1, §2, §5): tokeny Aurora w tokens.css (role z tabeli §1, oba motywy; --glow wraca jako fiolet, nowe --glass, --glass-card, --grid, --em-* dla gradientu nagłówków, --mk-<motyw>-* dla makiet), motyw ciemny domyślnie dla Software (theme.ts + skrypt motywu; test), strażniki themes.test.ts zamienione na v24 (gradienty tylko z rodziny fioletu, kontrast na szkle i CTA ≥ 4,5:1), typografia nagłówków (em z gradientem, skala §2), ruch v24 w motion.css (wejście view() na właściwości translate, gradient em przy przewijaniu, przebłysk przycisków, przybycie po przejeździe + rozszerzenie lib/software/smoothScroll: easeInOutQuint, 520–1250 ms, odstęp 104/78 px), przejścia stron (sprawdź w node_modules/next/dist/docs/ wsparcie View Transitions w tej wersji; jeśli wymaga flagi eksperymentalnej — zapytaj), reduced motion.
1b (ZMIANY §8): prymitywy v24 (szkło, SectionHead z em, chipy, segment, przyciski z przebłyskiem) i komponent Mockup (src/sites/software/components/mockups/, server components, układ 640×420 skalowany do kontenera, kind site/dash/flow/care/before/phone z wariantami z Vis.dc.html, ilustracje tła hero makiet, animacje CSS: słupki, przepływ, wpisy, suwak przed/po), strona podglądu /_software (wszystkie makiety i prymitywy, dev, 404 na produkcji — jak /_wspolne), pole Solutions.preview {kind, variant} (migracja tylko dodająca) + seed wg PRZEKAZANIE-v24 §5 + indeks rozwiązań; narzędzie porównania zrzutów (skrypt w scripts/, Playwright: lista stron × szerokości × motywy → tmp/zrzuty-v24/ obok v24/screens).
Nie zmieniasz jeszcze sekcji strony ani powłoki — tylko fundament, z którego korzystają SWA2–SWA6. Stare miniatury SVG zostają (zapas).
DoD: lint/typecheck/test zielone, e2e software-* zielone (zrzuty starych sekcji mogą się zmienić kolorystycznie — opisz to w PR), /_software porównane z boards/Vis.dc.html (wszystkie warianty, nic nie ucięte przy Archivo/Manrope).
```

### 3.2 SWA2 — strona główna (hero = priorytet)
```
/zadanie SWA2 — strona główna Aurora (duża sesja: PR-y 2a, 2b, 2c piętrowo)
Warunek: SWA1 scalone. git fetch; feat/swa2-hero od origin/develop → feat/swa2-sekcje → feat/swa2-sekcje-2.
[blok 3.0]
Najpierw JEDEN plan całości (2a + 2b + 2c), z pytaniami na końcu — czekaj na akceptację. W planie: nowy kształt SoftwareSettings.home (hero, bento, showroom, sytuacje, sekcja techniczna) i co dzieje się ze starymi kluczami/wariantami bloku (migracja danych usuwająca warianty = pytanie do mnie).
2a HERO (ZMIANY §4.1 i §4.1a — wygląd 1:1 z planszami AU-pc/AU-laptop/AU-tablet/AU-mobile, oba motywy): SwHero v24 (server) + HeroCosmos (CSS) + HeroStage (klient: kafle, zegar 4,2 s, pozycje r0/r1/rl, słowo H1, podpis, pauza, klawiatura, przesunięcie palcem) + 7 makiet z SWA1; dane home.hero (slajdy z solution + mockup). Lighthouse nie blokuje — nie upraszczaj efektów. Porównanie zrzutem slajdów 1, 4 i 7 na 4 szerokościach.
2b: obietnice, „Z czym do nas przychodzisz?” (z dotychczasowych intencji), bento „Cztery rzeczy…” (warianty na żywo, przed/po z suwakiem), showroom branż (10 branż × Strona / Na telefonie / System, „Policz dla tej branży” → /dobierz?firma=).
2c: sekcja techniczna (4 zakładki z animowanymi wizualizacjami — zastępuje HowWeBuild, WhyNotWordpress, Technologies), cennik na głównej (filtry z licznikami, karty z makietą → okno oferty), proces (restyl), FAQ + formularz (ContactForm w nowym wyglądzie, klauzula z linkiem do polityki), nowa kolejność sekcji (seed home + migracja), szyna sekcji z nowymi id (zachowaj #dobierz, #oferta, #proces, #faq, #kontakt).
Usuń komponenty, dane i testy sekcji, które znikają (lista D6). Teksty z TRESCI-v24.md; zaktualizuj copyBudget.test.ts.
DoD: blok 3.0 + e2e software-home i software-motion przepisane na v24, kliknięcie kafla zmienia H1/makietę/podpis (cena z Solutions), brak błędów hydratacji (software-console).
```

### 3.3 SWA3 — kreator v3
```
/zadanie SWA3 — kreator v3 (duża sesja: PR-y 3a i 3b piętrowo)
Warunek: SWA1 scalone (makiety). git fetch; feat/swa3-kreator-dane od origin/develop → feat/swa3-kreator-ui.
[blok 3.0]
Najpierw JEDEN plan (3a + 3b) — czekaj na akceptację. Wzorzec zachowań i danych: v24/wzorzec/aurora.js (stałe T, FEAT, OPT, STEPS, LBL, SZ, IND, reguły tip, podgląd vkind/vvar, podsumowanie sum) i plansza AU-kreator / AU-pc § kreator.
3a (TDD): nowy kształt SoftwareSettings.wizard v3 (Zod, ZMIANY §7.2 — reguły podpowiedzi jako dane {when, text}, nie kod), lib/software/wizardFlow v3 (kroki zależne od grupy site/redo/sys/auto/idk, wybory wielokrotne z wyłącznym „Zaczynamy od zera”, wielkość zespołu tylko w sys, SEO zawsze w cenie — podpowiedź, nie opcja, wynik → Solution przez slug, podsumowanie, podgląd → mockup), seed kreator.json v3 + wizardExtras, migracja danych przepisująca stary wizard (pytanie do mnie, jeśli usuwa dane, których v3 nie przenosi), zgłoszenie Inquiries typ wizard (JSON odpowiedzi v3 + items[].solution, temat i opis dla maila), zdarzenia analityki bez kreator_dodatek, pnpm -s software:wizard-json.
3b: UI kreatora v24 (pasek kroków, kafle, chipy wielokrotne, podgląd na żywo z makietą, podpowiedź, wynik z formularzem i polem „Napisz po swojemu”), /dobierz (hero + kreator bez drugiego nagłówka + „Cztery kroki do startu”), sekcja #dobierz na głównej, telefon (podgląd zwinięty w pasek ceny, Wstecz/Dalej), ?firma= z showroomu, wysyłka → /dziekujemy.
DoD: blok 3.0 + vitest wizardFlow (każda grupa, wyłączność, brak pytania o zespół poza sys), e2e software-wizard przepisany (pełna ścieżka każdej grupy, wysłanie → numer PKS na /dziekujemy).
```

### 3.4 SWA4 — oferta, cennik, audyt, treści
```
/zadanie SWA4 — oferta, cennik, audyt i podstrony treści (duża sesja: PR-y 4a, 4b, 4c piętrowo)
Warunek: SWA1 scalone (SWA2 zalecane — wspólne karty cennika). git fetch; feat/swa4-oferta od origin/develop → feat/swa4-cennik-audyt → feat/swa4-podstrony.
[blok 3.0]
Najpierw JEDEN plan (4a + 4b + 4c) — czekaj na akceptację.
4a (ZMIANY §6.1–6.2): /rozwiazania wg AU-oferta (hero podstrony, 4 kafle grup, filtry z licznikami, wyszukiwarka i stan w URL bez zmian, karty z makietą, „Bez dopłat za rzeczy oczywiste”), mapowanie 5 kategorii danych → 4 grupy UI w lib/software/catalog.ts (D10), okno oferty v24 (SolutionDialog: galeria makiet, kafle cena/termin/opieka, W cenie, Często łączone z, + Dodaj do wyceny).
4b (§6.3, §9.1): /cennik (siatka kart, poziomy opieki, rodzaje audytu, FAQ), /audyt wg AU-audyt (formularz szybkiego audytu, karta demonstracyjnego skanu z animacją i podpisem „przykład”, 5 rzeczy, 3 poziomy z danych levels, jak to działa; przycisk formularza „Zamów darmowy audyt →” → /dziekujemy).
4c (§9.4, §9.8): restyl /rozwiazania/[slug], /dla-branz/[branza], /miejscowosci/[miasto] na system v24 (bez zmiany treści), /aktualnosci wg AU-aktualnosci (działający filtr kategorii, wpis wyróżniony, ilustracje kategorii .au-pc-art), wpis stylem au-prose, kategorie Posts D7 (migracja danych — pytanie do mnie przed wykonaniem).
DoD: blok 3.0 + e2e software-catalog, -pricing, -audit, -solution, -industry, -news-city zielone na v24.
```

### 3.5 SWA5 — powłoka i szablony wspólne (zastępuje D3-S)
```
/zadanie SWA5 — powłoka v24 na elementach wspólnych (duża sesja = D3-S: PR-y 5a i 5b piętrowo)
Warunek: 5a — D2-1b i D2-2 scalone; 5b — D2-4 scalone (sprawdź w docs/STAN.md → Elementy wspólne). git fetch; feat/swa5-powloka od origin/develop → feat/swa5-firma-kontakt.
[blok 3.0] + docs/zadania/wspolne-elementy.md (§0, §1, kroki L1 i L2 w §3), docs/design/wspolne/WSPOLNE-ELEMENTY.md, MAPA-DZIS.md (Software), plansze wspólne 02, 04, 05, 07, 11.
Najpierw JEDEN plan (5a + 5b) — czekaj na akceptację.
5a (ZMIANY §3): SoftwareFrame na komponentach wspólnych — BrandBar, SiteHeader (kapsuła z tokenami Software: pigułka „Kreator 60 s”, „Twój projekt” z licznikiem z pk-project, CTA, mega menu Oferta z danych navigation.mega → okno oferty), SiteRail (sekcje strony + „Na tej stronie” + „Strona główna”, Kreator wyróżniony, postęp, „Do góry”, przejazd premium z SWA1), SearchDialog z indeksem Software (akcje, oferta, strony — także prawne), SiteFooter (góra linii wg planszy 02, LinesBand, LegalBar, AddressMap z danymi OSM — D8) + pas „Zacznij od podglądu” (slot linii; brak slotu = PR feat/wsp-*), TabBar i MenuSheet (≤ 960, tablet wyśrodkowany). Usuń SwTopBar, SoftwareHeader, SwHeaderNav, SoftwareFooter, PhoneLayer/TabBar/MenuSearch Software (i ich testy) — bez martwego kodu.
5b (§9.2, §9.3): /o-firmie i /kontakt na szablonach D2-4 + sloty Software (porównanie Freelancer/agencja/PRO-KOM, sekcja techniczna z głównej, „Z czym dzwonisz?”, „Kod nie zna granic…” z mapą zasięgu; formularz kontaktu z „Twoim projektem” i drugim numerem 788 986 074), „100+ firm…” bez plakietki, /jedna-firma → 301 na /o-firmie#linie (D2) i usunięcie strony/bloków (migracja danych = pytanie do mnie).
DoD: blok 3.0 + DoD kroków L1/L2 z wspolne-elementy.md, e2e software-frame, -mobile, -about, -contact, -links, wspolne-powloka zielone.
```

### 3.6 SWA6 — strony prawne, systemowe i QA przed stagingiem
```
/zadanie SWA6 — strony prawne, systemowe i QA przed stagingiem (duża sesja: PR-y 6a i 6b piętrowo)
Warunek: SWA2–SWA4 scalone (6b po SWA5). git fetch; feat/swa6-prawne od origin/develop → feat/swa6-qa.
[blok 3.0]
Najpierw JEDEN plan — czekaj na akceptację.
6a (ZMIANY §9.6): układ stron prawnych (hero z plakietkami, spis treści sticky + karta pytań, au-prose, ≤ 960 chipy), blok tabeli (swTable — nagłówki + wiersze; albo uzasadniona alternatywa), treści z TRESCI-v24.md jako projekt do akceptacji: /polityka-prywatnosci (zastępuje treść z legal.ts — zachowaj TODO(krystian) przy okresie przechowywania i dacie), /regulamin, /cookies, /dostepnosc (uzgodnij ze szkicami D2-1b — jeden wspólny kształt), /mapa-strony (6 grup); baner „wersja robocza” poza produkcją jak dziś.
6b (§9.7, §11, §13): /dziekujemy i 404 wg plansz, klauzula z linkiem do polityki pod każdym formularzem (główna, kontakt, kreator, audyt), SEO nowych stron (tytuły, opisy, noindex /dziekujemy, sitemap), zdarzenia analityki v24 (hero_slajd, oferta_wariant, branza_podglad, audyt_skan), content-scan, axe, Lighthouse (zapis), pełne porównanie wszystkich stron z planszami (4 szerokości × 2 motywy) i poprawki rozjazdów, lista „przed stagingiem v24” w STAN (panel: home, wizard, navigation, shared, strony, przekierowania).
DoD: blok 3.0 + e2e software-pages, -links, -content-scan, -og zielone; raport porównania w opisie PR.
```

---

## 4. Kontrola jakości (każda sesja)
- **Porównanie z planszami:** narzędzie z SWA1b (zrzuty 1440 / 1280 / 834 / 390, ciemny i jasny) vs `v24/screens` i plansze. Różnice zamierzone wpisz w PR jako „oczekiwane różnice” (jak w SW8b/SW11b) — reszta to błędy.
- **Telefon:** MOBILE-APLIKACJA §5 + 360 px bez poziomego przewijania; prawdziwy telefon przed scaleniem (Krystian).
- **Ruch:** sprawdź reduced motion (Playwright `reducedMotion: 'reduce'`) — stan końcowy, nic nie znika.
- **Treść:** `content-scan`, `copyBudget.test.ts`, brak nierozwiązanych `[FAKT]`/`{cena:}` na produkcji.

## 5. Makiety dla rozwiązań (`Solutions.preview` — seed)
| slug | kind | variant |
|---|---|---|
| strona-wizytowka | site | wizytowka |
| strona-firmowa-z-panelem | site | firmowa |
| rozbudowana-strona-firmowa | site | rozbudowana |
| landing-page | site | landing |
| strona-dla-hotelu-lub-pensjonatu | site | pensjonat |
| strona-dla-restauracji-lub-baru | site | restauracja |
| przebudowa-starej-strony | before | przebudowa |
| sklep-internetowy | site | sklep |
| system-zlecen-i-grafik-ekip | dash | zamowienia |
| crm-dla-malej-i-sredniej-firmy | dash | crm |
| czas-pracy-i-rozliczenia | dash | czas |
| system-serwisu-i-zgloszen | dash | zamowienia |
| z-excela-do-systemu | dash | excel |
| magazyn-i-zamowienia | dash | excel |
| wyceny-i-oferty-z-pdf | dash | crm |
| panel-klienta-i-portal-b2b | dash | crm |
| grafik-i-rezerwacje-zajec | dash | czas |
| kalendarz-sal-i-imprez | dash | czas |
| aplikacja-dla-ekip-w-terenie | phone | budowlanka |
| aplikacja-do-rezerwacji-dla-gosci | phone | pensjonat |
| aplikacja-do-programu-ktory-masz | phone | firmowa |
| powiadomienia-sms-i-e-mail | flow | sms |
| faktury-bez-przepisywania | flow | faktury |
| asystent-ai-do-zapytan | flow | ai |
| raporty-dla-szefa | flow | raporty |
| polaczenie-programow | flow | faktury |
| opieka-nad-strona-i-systemem | care | — |
| przejecie-po-innym-wykonawcy | care | — |
| audyt-strony-lub-programu | before | przebudowa |

Slajdy hero (kolejność): wizytówka → `strona-wizytowka`, firmowa → `strona-firmowa-z-panelem`, rozbudowana → `rozbudowana-strona-firmowa`, hotel → `strona-dla-hotelu-lub-pensjonatu`, restauracja → `strona-dla-restauracji-lub-baru`, system → `system-zlecen-i-grafik-ekip` (makieta `dash/zamowienia`), automatyzacje → `asystent-ai-do-zapytan` (makieta `flow/ai`).

## 6. Przed stagingiem v24 (każda sesja dopisuje swoje kroki do STAN)
Seed na stagingu jest zablokowany — po `pnpm payload migrate` z pipeline’u w panelu: `SoftwareSettings.home` (`pnpm -s software:home-json`), `SoftwareSettings.wizard` (`pnpm -s software:wizard-json`), `SiteSettings.software.navigation` (`pnpm -s software:navigation-json`), `SiteSettings.shared` (Software), `Solutions.preview` (jeśli migracja nie ustawi), strony prawne (bloki), przekierowanie `/jedna-firma` → `/o-firmie#linie`, kategorie wpisów.

## 7. Do akceptacji szefa / prawnika przed produkcją
Treści prawne v24 (polityka, regulamin, cookies, dostępność) to **projekt** — przed produkcją akceptacja szefa albo prawnika. Do potwierdzenia: okres przechowywania zapytań (propozycja 12 miesięcy), logi serwera (propozycja 30 dni), data obowiązywania, nazwa dostawcy serwera (dziś: „serwer w Polsce”). Ceny audytu 990 / 1 990 zł i poziomy opieki — z danych `levels` (akceptacja cennika jak dotąd). Wpisy w Aktualnościach — tylko prawdziwe, opublikowane.
