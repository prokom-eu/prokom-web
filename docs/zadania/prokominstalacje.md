# prokominstalacje.pl — plan budowy w Claude Code (sesje I0–I15)

Wersja 1.1 · 28.10.2026 (poprawki I0: ADR-I002 „Poprawki I0”, ADR-I003 §6, ADR-I004). Repo `prokom-web`, worktree `D:\PRO-KOM\repos\prokom-instal`, gałęzie `inst/*` (ADR-I001).
Wzorzec: `docs/design/prokominstalacje/` (prototyp v4.2, 32 strony). Specyfikacja: `docs/strony/prokominstalacje.md`. Stan: `docs/stan/STAN-instalacje.md`.
Strona dla architektów i deweloperów (`/dla-architektow`, decyzja szefa 28.10): sesje W-A, I16a–c — `docs/zadania/prokominstalacje-architekci.md` (prompty), spec `docs/strony/prokominstalacje-architekci.md`, ADR-I005.

## 0. Rytuał każdej sesji (bez wyjątków)
1. Terminal w `D:\PRO-KOM\repos\prokom-instal` → `.\scripts\start.ps1` (baza `prokom_web_instalacje`, zależności, migracje). Nowa sesja Claude Code → `/inst-start` (git status, fetch, rebase na `origin/develop`, odczyt STAN).
2. Wklej prompt sesji z §3. Claude Code najpierw pokazuje **plan** (pliki, kolejność, ryzyka) — akceptujesz, dopiero potem kod.
3. Każda sekcja z UI: zrzuty wzorca → budowa → `porownaj.mjs` (1440 i 390, jasny i ciemny) → poprawki do zgodności.
4. **Zadanie skończone:** `/przeglad` → `/inst-koniec` (STAN w tym samym PR) → `/pr` (opis z tabelą „sekcja: zgodna / różnica + powód”) → zielone CI → rebase, jeśli develop się zmienił → Squash and merge.
5. **Zadanie niedokończone (wieczór się kończy):** `/inst-koniec` (STAN: co zostało, następny krok) → `scripts\koniec.ps1 "co w toku"` (push gałęzi). PR następnego dnia. Nigdy nie commituj STAN na gałęzi już scalonej.

Pliki danych widżetów (ADR-I002 „Pliki danych w kodzie”): każda sesja strony pisze swój `src/sites/instalacje/dane/<strona>.ts` z pełnego źródła `zrodlo/pages/<Strona>.js` (zrzuty to stan jednego ekranu), typowany, czyszczony `cleanPrototype` z `src/seed/instalacje/dane.ts`; nawigacja jest już w `dane/nawigacja.ts`.

Zasady stałe: jedna sesja = jedno zadanie = jedna gałąź = jeden PR. Zmiana w strefie wspólnej (ADR-I001 §3) = osobny mały PR `inst/wsp-*` scalony od razu. Nowy pomysł w trakcie = wpis w STAN („Pomysły”), nie „przy okazji”. Telefon w każdej sesji z UI (MOBILE-APLIKACJA §10). SEO w każdej sesji z nową stroną (SEO §2.2–2.3).

## 1. Sesje i szacunek
| Sesja | Zakres | Wieczory | Zależy od |
|---|---|---|---|
| **W-I** ✅ | wgranie pakietu do repo (same pliki, PR #125, scalone) | 0,25 | — |
| **I0** ✅ | dokumenty i decyzje, bez kodu (PR `inst/i0-ustalenia`) | 0,5 | W-I |
| **I1** | wspólne minimum: motyw ciemny linii, Frame Instalacji (pusty), grupa tras `(instalacje)`, arkusz CSS linii, rejestr bloków, test dymny | 1 | I0 |
| **I2** | model treści, import seeda, pliki danych widżetów (zapytania → I11) | 1,5 | I1 |
| **I3** | powłoka: nagłówek, mega menu, górny pasek, stopka, motyw; telefon: nagłówek chowany, dolny pasek, arkusz; 404 | 2 | I1 |
| **I4** | sekcje wspólne + pierwsza pełna strona usługi: Anteny | 1,5 | I2, I3 |
| **I5** | strona główna: hero „Twój obiekt na żywo” | 2,5 | I3 |
| **I6** | strona główna: pozostałe sekcje + mini-formularz | 1,5 | I4, I5 |
| **I7** | Monitoring, Alarmy | 2 | I4 |
| **I8** | Kontrola dostępu, Sieci i Wi-Fi, Teletechnika (z formularzem przedmiaru) | 2 | I4 |
| **I9** | Smart home, Nagłośnienie, Ekrany, Ładowarki EV | 2,5 | I4 |
| **I10** | Dla kogo: szablon, 12 przekrojów SVG, Pensjonaty | 2,5 | I4 |
| **I11** | Zaplanuj (kreator), Kontakt, Serwis, reguły zapytań Instalacji, maile, `/wyslane` (bez plików w v1) | 2 | I2, I3, SW7 scalone |
| **I12** | Pełna oferta `/uslugi` (76), Realizacje, O firmie, Poradnik + wpis RODO (PR wsp: adres wpisu per linia) | 1,5 | I4 |
| **I13** | SEO techniczne, strony prawne, analityka, 301, wydajność, dostępność, e2e całości | 1,5 | I5–I12 |
| **I14** | telefon: audyt 32 stron × 360/390/414, test na urządzeniach, poprawki | 1 | I13 |
| **W-A** ✅ | wgranie pakietu architektów + dopiski do dokumentów (same pliki, PR `inst/w-architekci`) | 0,25 | I2 |
| **I16a** | `/dla-architektow` cz. 1: blok `InstArchitects`, `ArchHouseScene`, hero i sekcje 1–6 (`prokominstalacje-architekci.md`) | 2 | I3, I4 |
| **I16b** | cz. 2: kolekcja `InstArchNews` + seed, Nowe rozwiązania, Checklista, Liczby, Deweloperzy, Przepisy | 1,5 | I16a |
| **I16c** | cz. 3: Opiekun, formularze, FAQ, sekcja `#architekci` na głównej (`ArchTeaser`), linki, SEO | 1 | I16b, I6, I11 |
| **I15** | staging → akceptacja szefa → produkcja | 1 | I14 + [SZEF] |
| | **Razem** | **≈ 31,5** | |

**Uczciwie o terminie:** ≈ 31,5 wieczoru (27 + 4,75 na stronę dla architektów, W-A + I16a–c) to sama budowa bez bufora. Terminy poniżej liczone dla 27 — I16 przesuwa je o ok. 2 tygodnie przy 2–3 sesjach w tygodniu. Równoległa praca nad Biznesem (produkcja), Gaming (20.11) i Software nie skraca tej liczby — rozkłada ją w czasie. Przy 2–3 sesjach Instalacji w tygodniu produkcja wypada w styczniu; przy 4–5 w tygodniu — w połowie grudnia. Kolejność linii ustala szef (Asana). **Kolejność cięcia, jeśli trzeba zdążyć z wersją 1:** Realizacje (zostają placeholdery, bez strony) → Poradnik (sam wpis RODO) → Oferta bez wyszukiwarki literówek → strony obiektów 9–12 (gminy, kościoły, szkoły, budowy) jako druga fala. **Bez cięć:** strona główna z hero, 10 usług, Zaplanuj, Kontakt, Serwis, telefon jak aplikacja, SEO techniczne, strony prawne.

**I16 (strona dla architektów) — priorytet szefa:** najlepiej zaraz po I11 (I16a można zacząć już po I4). Kolejność cięcia przy braku czasu: najpierw Biblioteka (zostają same linki producentów), potem Doświadczenie łączone z O firmie; przekrój domu, Nowe rozwiązania, Deweloperzy, Przepisy i formularz bez cięć.

Sesje I5 i I7–I10 mogą iść w dowolnej kolejności po I4. I11 można zrobić wcześniej (zaraz po I3), jeśli szef chce szybko zbierać zapytania.

## 2. Co robi Krystian poza Claude Code (równolegle, w pracy)
- [SZEF] telefon, e-mail, WhatsApp Instalacji; adres salonu w Zakopanem; ceny „od” (albo decyzja: bez cen); zgoda na realizacje i zdjęcia; opinie Google; autoryzacja Ampio — przed I13.
- [Krystian] treść polityki prywatności, cookies, deklaracji dostępności (czat → `docs/tresci/`) — przed I13; mapa 301 (czat → `docs/tresci/prokominstalacje-301.md`) — przed I13; potwierdzenie danych Elzab — przed I9; zakup/konfiguracja domeny `prokominstalacje.pl` na VPS — przed I15.
- [SZEF] strona dla architektów: opiekun (imię, zdjęcie, telefon, e-mail architekci@), marki spoza oferty, partner Sonos, warunki dla pracowni, bezpłatna konsultacja, pokaz w salonie, realizacje z projektem architekta, autoryzacje — **przed I16c** (`prokominstalacje-architekci.md` §2).
- [czat] treść PDF „Checklista projektanta” (`docs/tresci/`) — przed I16b; wpisy Poradnika o projektowaniu — po I12; ponowna weryfikacja przepisów na `/dla-architektow` — przed I13.
- Po każdej sesji: przegląd PR na telefonie (GitHub tylko do odczytu w pracy), lista uwag do czatu.

## 3. Prompty sesji (kopiuj w całości)

### W-I — wgranie pakietu (bez kodu)
Pakiet jest już w worktree — skopiował go skrypt `zaloz-prokom-instal.ps1` (albo ręcznie: `robocopy D:\PRO-KOM\notatki\do-repo\prokominstalacje . /E /XF START-TUTAJ.md CLAUDE-dopisek.md zaloz-prokom-instal.ps1`).
```
Sesja W-I (Instalacje). Jesteśmy w worktree prokom-instal, gałąź inst/w-pakiet z origin/develop. Pakiet dokumentacji jest już skopiowany do katalogu roboczego (git status pokaże nowe pliki).
Zadanie: przygotować commit pakietu, bez zmian w kodzie aplikacji.
1. Sprawdź, że nowe są dokładnie te ścieżki: docs/strony/prokominstalacje.md, prokominstalacje-SEO.md, prokominstalacje-do-uzupelnienia.md, docs/decyzje/ADR-I001…I004, docs/zadania/prokominstalacje.md, docs/stan/STAN-instalacje.md, docs/design/prokominstalacje/**, seed/prokominstalacje/**, public/instalacje/**, .claude/commands/inst-start.md, .claude/commands/inst-koniec.md. Nic poza nimi.
2. Dopisz do CLAUDE.md (na końcu) sekcję z pliku D:\PRO-KOM\notatki\do-repo\prokominstalacje\CLAUDE-dopisek.md — nic więcej w CLAUDE.md nie zmieniaj. W sekcji „Lokalnie” CLAUDE.md zamień przykład `instalacje.localhost:3000` na `instalacje.localhost:3002 (folder prokom-instal)`.
3. Dopisz do docs/STAN.md jedną linię: „Instalacje: stan w docs/stan/STAN-instalacje.md (worktree prokom-instal, gałęzie inst/*)”. Do tabeli w docs/sposob-pracy.md („Dwie strony równolegle”) dopisz wiersz: prokom-instal · prokominstalacje.pl · 3002 · prokom_web_instalacje.
4. Ignory (jedyny wyjątek od zasady PR-ów wsp, ADR-I001 §3): tmp/ w .gitignore; seed/prokominstalacje/ w .prettierignore (obok seed/prokombiznes/ i seed/prokomsoftware/). docs/** jest już poza ESLint i Prettierem. Sprawdź `pnpm format:check`, `pnpm lint` i hak przed commitem (gitleaks!).
5. Sprawdź, czy prototyp otwiera się lokalnie: docs/design/prokominstalacje/prototyp/start.html.
6. Commit „docs(instalacje): pakiet wizualizacji v4.0, spec, ADR-I001–I004, plan I0–I15”, PR do develop. Bez kodu aplikacji, bez zależności.
```

### I0 — dokumenty i decyzje (bez kodu)
```
Sesja I0 (Instalacje) — tylko dokumenty, bez kodu aplikacji. Przeczytaj: CLAUDE.md, docs/sposob-pracy.md (Dwie strony równolegle, Zmiana schematu bazy), docs/stan/STAN-instalacje.md (sekcja „Ustalenia I0 — wstępne” spisana w czacie 27.10 na podstawie origin/develop 18f33b3), docs/strony/prokominstalacje.md, docs/strony/prokominstalacje-SEO.md, docs/decyzje/ADR-006, ADR-010, ADR-014 (rozstrz. 7), ADR-I001…I004, docs/design/prokominstalacje/README.md, MOBILE-APLIKACJA.md, KOMPONENTY.md, MAPA-STRON.md, docs/zadania/prokominstalacje.md.
Zadanie: zweryfikuj na aktualnym develop każde z „Ustaleń I0 — wstępnych” i popraw dokumenty, jeśli coś się zmieniło:
1. Routing i strony: Pages + bloki linii (rejestr src/blocks/registry.ts), RESERVED_PAGE_SLUGS, trasy (biznes)/(software); czy /uslugi, /wyslane, /zaplanuj, /serwis, /realizacje, /poradnik, /dla-kogo są wolne (nie ma ich w RESERVED_PAGE_SLUGS ani jako trasy innej linii); lista 11 bloków z ADR-I002 §0.
2. Kolekcje wspólne: Inquiries (kontrakt ADR-003 — czy przyjmie pola z ADR-I002 §4 albo meta), Pages, Posts, SiteSettings, Tenants (pole active), Industries. Sprawdź, czy SW2b (Software) jest już scalone — zmiany Instalacji w Inquiries/Industries dopiero po nim.
3. Wygląd: jak Biznes i Software stylują (Tailwind + src/styles/tokens.css + data-line/data-theme; własne arkusze?), motyw ciemny tylko dla biznes/software (src/lib/brand/theme.ts) — zaplanuj dodanie Instalacji w I1. Czy BottomSheet/TabBar z src/sites/software/components nadają się do przeniesienia do wspólnych (ADR-010: blok/komponent dwóch linii → wspólny) — zapisz decyzję dla I3.
4. Seed: wzór src/seed/software/index.ts i skrypt seed:software → plan dla seed:instalacje.
5. Popraw plan I1–I15 i ADR-I002, jeśli coś z powyższego wygląda inaczej. ADR-I001…I004 → status „przyjęty” (albo z poprawkami).
Na koniec: STAN uzupełniony (sekcja „Ustalenia I0” — potwierdzone/zmienione), PR „docs(instalacje): I0 ustalenia”. Pytania do mnie zbierz w jednym miejscu, zanim cokolwiek założysz.
DoD: same dokumenty; /inst-koniec przed /pr.
```

### I1 — wspólne minimum
```
Sesja I1 (Instalacje). Przeczytaj CLAUDE.md, docs/stan/STAN-instalacje.md (Ustalenia I0), ADR-I001, ADR-I002 §0, ADR-I003 §3–§6, wzory: src/sites/software/Frame.tsx, src/app/(sites)/[domain]/(software)/layout.tsx, src/lib/brand/theme.ts, src/styles/tokens.css.
Port 3002 i baza prokom_web_instalacje działają już z .env (repo obsługuje worktree) — nie zmieniaj portów ani Compose.
Zakres (PR wspólny inst/wsp-fundament, mały i szybki do scalenia):
1. Motyw ciemny Instalacji: 'instalacje' w DARK_THEME_LINES + wartości ciemne/jasne w src/styles/tokens.css z docs/design/prokominstalacje/tokens.css. Domyślny motyw jak w Biznesie i Software: bez wyboru gościa za systemem (prefers-color-scheme) — ADR-I003 §6. Testy kontrastu jak dla innych linii.
2. InstalacjeFrame (na razie: znak, pusty nagłówek, stopka minimalna) w src/sites/instalacje/Frame.tsx, wpięty w [domain]/layout.tsx obok BiznesFrame i SoftwareFrame — wybierany po tenant.line === 'instalacje' (bez grupy SiteSettings.instalacje i bez migracji; ADR-I002 §0).
3. Grupa tras src/app/(sites)/[domain]/(instalacje)/layout.tsx z requireLine(params, 'instalacje'); slugi dla-kogo i wyslane do RESERVED_PAGE_SLUGS (z komentarzem jak przy Software). poradnik NIE — lista /poradnik to strona Pages, trasa grupy obsłuży tylko /poradnik/[slug] (ADR-I002 §0).
4. Arkusz CSS linii src/sites/instalacje/instalacje.css (sceny, keyframes, rzeczy trudne w Tailwind — ADR-I003 §3) importowany przez Frame; overflow-x: clip na kontenerze strony.
5. Rejestr bloków: miejsce na bloki linii Instalacje (INSTALACJE_BLOCKS pusta + ALLOWED_BLOCKS.instalacje = bloki generyczne + linii; nowe bloki zawsze na końcu ALL_BLOCKS).
6. Test dymny e2e: http://instalacje.localhost:3002 zwraca 200 i ma data-line="instalacje"; tenant z active=false → 404.
Nie buduj jeszcze nagłówka ani stron. DoD: lint, typecheck, testy, build, CI zielone; strony Biznesu (prokom-web-biznes, :3000) i Software (prokom-web, :3001) bez zmian wizualnych (zrzut przed/po ich stron głównych).
```

### I2 — model treści i import
```
Sesja I2 (Instalacje). Przeczytaj ADR-I002 w całości, seed/prokominstalacje/README.md, Ustalenia I0 w STAN.
Zakres:
1. Kolekcje InstalacjeSettings (z polem whatsapp — ADR-I002 §3), InstServices, InstObjects, InstSolutions, Realizations w src/collections/ (wzór SoftwareSettings/Solutions, onlyLineTenant('instalacje'), tenant, SEO tam, gdzie mają stronę) oraz dokumenty Pages tenanta Instalacji z ADR-I002 §0 (slugi i puste bloki — komponenty bloków powstają w kolejnych sesjach). Telefon i e-mail linii do SiteSettings.phone/email, salony do CompanyData.locations (placeholdery). Hook: realizacja bez zgody klienta nie może być opublikowana. Idempotencja jak w seedzie Biznesu/Software (src/seed/compare.ts).
2. PR wspólny inst/wsp-rejestracja (osobno, scalany przed resztą): rejestracja kolekcji linii w src/payload.config.ts, dopisanie ich do listy kolekcji tenanta w src/collections/Tenants.ts, skrypt "seed:instalacje" w package.json (src/seed/instalacje/{index,run,map}.ts, wzór src/seed/software/) i wywołanie seedInstalacje w src/seed/index.ts (jak seedSoftware). Zapytania NIE w I2 — bez nowych kolumn, reguły w I11 (ADR-I002 §4). Dopiero po scaleniu gałąź inst/i2-model z develop (albo rebase --onto, ADR-I001 §5).
3. Skrypt pnpm seed:instalacje (idempotentny) dokładnie wg mapy plików w ADR-I002 §5: wspolne.json, obiekty/*.json (źródło prawdy obiektów), strony-zrzut usług, oferta-76.json (NIE Oferta.json), realizacje jako wersje robocze bez zgody, wpis RODO; linki .dc.html i zdjęcia ev/*.webp przez seed/prokominstalacje/adresy.json; klucze UI pomijane; klucze src importowane normalnie (źródła-przypisy są już usunięte z seeda).
4. Generator src/sites/instalacje/dane/<strona>.ts z kluczy, które wg mapy w ADR-I002 §5 nie idą do panelu — typowane, commitowane.
5. Testy: import dwa razy z rzędu nie tworzy duplikatów; liczności: 10 usług, 12 obiektów, 76 rozwiązań w 10 obszarach; brak „[svg-path]” i „.dc.html” w bazie; zdjęcia ładowarek wskazują /instalacje/ev/*.webp; żadna realizacja nie jest opublikowana.
DoD: migracje w repo (bez push), lint, typecheck, testy, CI.
```

### I3 — powłoka (desktop + telefon jak aplikacja)
```
Sesja I3 (Instalacje) — powłoka. Przeczytaj: MOBILE-APLIKACJA.md (cały), KOMPONENTY.md §1, ADR-I003, spec §4. Wzorzec: prototyp/start.html, prototyp/monitoring.html, zrodlo/header.html, zrodlo/footer.html, zrodlo/common.js (common(), mg, BN, openSheet, _onS, toggleTheme), stany-telefonu/*.webp.
Decyzja z I0 (ADR-I004): BottomSheet → wspólny src/components/BottomSheet.tsx z progiem jako propem (osobny mały PR inst/wsp-arkusz, gdy Software nie pracuje na tym pliku; testy Software zielone), 3 zakładki = treść Instalacji; TabBar → własny src/sites/instalacje/components/TabBar.tsx; logika chowania nagłówka z PhoneLayer — sprawdź, czy da się wydzielić hook, domyślnie własna.
Zakres: TopBar, Header + MegaMenu (most nad panelem, opóźnienie 280 ms, klik przełącza, Esc, focus-trap), MobileHeader (chowany przy przewijaniu), BottomTabBar (5 kart, stan aktywny), BottomSheet + MenuSheet (3 zakładki, gest w dół, Esc, wstecz, blokada przewijania), ThemeToggle, AnchorsBar, CtaBand, Footer, strona 404, manifest + theme-color, View Transitions.
Nawigacja: pozycja „Dla architektów” (desktop po „Dla kogo ▾”, w kolorze akcentu; w mega „Dla kogo” link „Architekt lub projektant? Współpraca →” w panelu promo; w arkuszu „Więcej” na telefonie pierwsza; w stopce „Firma” pierwsza) — z dane/nawigacja.ts, ADR-I005 §4, wzorzec prototyp/*.html v4.2. Link prowadzi do /dla-architektow (strona powstaje w I16a).
Najpierw: node docs/design/prokominstalacje/narzedzia/zrzuty-wzorca.mjs start i monitoring. Na koniec porównaj nagłówek (#naglowek), stopkę (#stopka) przez porownaj.mjs (start / i monitoring /monitoring, 1440 i 390, oba motywy), a elementy przyklejone (dolny pasek, arkusz w 3 zakładkach, schowany/wracający nagłówek) zrzutem ekranu 390×844 obok stany-telefonu/02–07.
Testy e2e: mega menu (najazd, przejście kursorem na pozycję, klik działa), arkusz (otwórz każdą zakładką, zamknij ×, tłem, Esc), nagłówek chowa się i wraca, brak poziomego przewijania przy 360/390/414. Test na prawdziwym telefonie przed scaleniem.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I4 — sekcje wspólne + Anteny
```
Sesja I4 (Instalacje). Przeczytaj KOMPONENTY.md §2 i §4 (Anteny), ADR-I003 §2. Wzorzec: zrodlo/inc/*.html, zrodlo/pages/Anteny.*, prototyp/anteny.html, seed strony-zrzut/Anteny.json.
Zakres: PageHero (slot na widżet), GuaranteeSection, Packages (cena wg InstalacjeSettings.pokazCeny), PriceFactors, Faq (+ FAQPage JSON-LD), Related (+ „Podobne obiekty”), Fold (telefon), useReveal, useInterval z pauzą. Potem pełna strona /anteny: dane z InstServices + src/sites/instalacje/dane/anteny.ts, widżety (ustawianie anteny, quiz), SEO (title, description, Service + BreadcrumbList).
Sekcja „Powiązane” przyjmuje opcjonalny link dodatkowy (I16c doda „Projektujesz? Współpraca dla architektów →”).
Porównanie: porownaj.mjs anteny /anteny — 1440 i 390, jasny i ciemny; każda sekcja zgodna. Telefon wg MOBILE-APLIKACJA §10.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I5 — strona główna: hero
```
Sesja I5 (Instalacje) — hero „Twój obiekt na żywo”. Hero ma wyglądać i działać DOKŁADNIE jak w prototypie (decyzja szefa). Wzorzec: prototyp/start.html, zrodlo/pages/Main.body.html (#start), Main.js (initState: obj, mode, layers, touched; sceny sc, pip, otabs, modes, chips; mountPage — autoodtwarzanie), pk.css (klasy hx*, sceny).
Zakres: LiveObjectHero jako komponent kliencki: scena SVG (6 obiektów × dzień/noc/zima), warstwy instalacji, podgląd kamery, panel „Na żywo”, autoodtwarzanie do pierwszego dotyku, przycisk „Zaplanuj instalację” z #obiekt=…&uslugi=…; na serwerze HTML z treścią tekstową hero (SEO), scena hydratowana. Telefon: scena nad tekstem, tło sekcji wg pory sceny (MOBILE §6).
Wydajność: LCP z H1 (nie ze sceny), scena bez skoków układu, animacje na transform/opacity, pauza poza ekranem i przy reduced-motion.
Porównanie: porownaj.mjs start / (sekcja #start) w 1440 i 390, oba motywy, dla 3 stanów (noc pensjonat — stan początkowy; dzień dom; zima hotel — przełączone ręcznie w obu). Lighthouse mobile lokalnie.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I6 — strona główna: reszta
```
Sesja I6 (Instalacje). Wzorzec: prototyp/start.html, Main.body.html (#dla-kogo, #uslugi, #realizacje, #gory, #proces, #serwis, #faq, #zaplanuj), Main.js, KOMPONENTY.md §3.
Zakres: ForWhoGrid, ServicesGrid (karty z mini-ilustracjami, kolory usług), Realizations (placeholdery), MountainsSection, ProcessSteps, ServiceTeaser, Faq, QuickPlanForm (walidacja, zgoda, antyspam, zapis przez adapter: źródło inst-glowna, uslugi[], obiekt, miejscowosc), SectionRail (≥ 1400 px), JSON-LD Organization + LocalBusiness + WebSite.
Sekcja #architekci (po #uslugi) i jej pozycja w szynie powstają w I16c (ArchTeaser, ADR-I005 §5): w I6 zostaw w InstHome miejsce (zaślepka zwracająca null). Jeśli I16c jest już scalone — wstaw gotowy komponent.
Porównanie całej strony głównej 1440/390 × jasny/ciemny (bez #architekci, jeśli I16c jeszcze nie scalone). e2e: wysłanie mini-formularza zapisuje zapytanie z tenant=instalacje.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I7 — Monitoring, Alarmy
```
Sesja I7 (Instalacje). Wzorzec: prototyp/monitoring.html, alarmy.html; zrodlo/pages/Monitoring.*, Alarmy.*; KOMPONENTY.md §4.
Notka o dostawcach wysokiego ryzyka (KSC) została usunięta z prototypu — nie dodawaj jej (spec §2.9).
Zakres: obie strony w całości — widżety z tym samym stanem początkowym i logiką co w źródle (kalkulator ile widać, kalkulator dni nagrań, schemat wersji instalacji, RODO, symulator alarmu, wideodomofon), sekcje wspólne z I4, SEO strony. Logika kalkulatorów jako czyste funkcje z testami jednostkowymi (wyniki porównane z prototypem dla 3–5 zestawów danych).
Porównanie każdej strony 1440/390 × oba motywy; telefon wg MOBILE §10.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I8 — Kontrola dostępu, Sieci, Teletechnika
```
Sesja I8 (Instalacje). Wzorzec: prototyp/kontrola-dostepu.html, sieci-wifi.html, teletechnika.html; zrodlo/pages/Dostep.*, Sieci.*, Teletechnika.*.
Zakres: trzy strony w całości. Teletechnika: formularz przedmiaru BEZ uploadu w v1 (ADR-I002 §4: zdanie „przedmiar prześlij mailem po zgłoszeniu”), walidacja, zgoda, zapis przez adapter: category „Teletechnika — przedmiar”, type contact (reguły zapytań Instalacji dochodzą w I11 — jeśli I8 idzie przed I11, formularz wysyła zwykły kontakt z category). Na stronie Sieci żadnej sprzedaży sprzętu (decyzja: informacja i „dobieramy pod obiekt”).
Porównanie 1440/390 × oba motywy; e2e formularza przedmiaru.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I9 — Smart home, Nagłośnienie, Ekrany, Ładowarki
```
Sesja I9 (Instalacje). Wzorzec: prototyp/smart-home.html, naglosnienie.html, ekrany.html, ladowarki-ev.html; zrodlo/pages/SmartHome.*, Naglosnienie.*, Multimedia.*, Ladowarki.*; zdjęcia public/instalacje/ev/.
Zakres: cztery strony. Sprawdź treści z decyzjami spec §2 (Ampio: głos tylko przez Matter, bez obietnicy 5 lat; APART: „marka założona w Belgii, dziś w grupie Biamp”; Ładowarki: bez cen, kolory z dopiskiem o dostępności, nie piszemy, że ładowarki mają wyświetlacz). Ekrany: demo digital signage z przykładowymi cenami smartfonów to ilustracja ekranu, nie oferta — zostaje z podpisem „Demo”. Ładowarki: prezentacja modeli, konfigurator wersji (wyliczenia prądu jak w Ladowarki.js, testy jednostkowe), przycisk „Zapytaj o tę wersję” → /zaplanuj#obiekt=…&uslugi=ev&konf=<base64url JSON> (ADR-I002 §4), tabela porównania, kalkulator czasu ładowania. Schemat: Product bez ceny albo Service (SEO §2.3) — sprawdź w Rich Results Test.
Porównanie każdej strony 1440/390 × oba motywy.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I10 — Dla kogo
```
Sesja I10 (Instalacje). Przeczytaj KOMPONENTY.md §5. Wzorzec: prototyp/dom.html (i pozostałe 11), zrodlo/pages/Seg*.body.html (SVG scen), zrodlo/generator-obiektow/build_seg.py (BODY i JS szablonu, calm()), Noclegowe.* dla /dla-kogo/pensjonaty; dane z InstObjects.
Zakres: szablon ObjectPage, 12 komponentów SVG przekrojów (skopiowane z prototypu, hotspoty z polem dotyku r=24, legenda warstw, autoodtwarzanie z pauzą), DayTimeline, LawCards (bez źródeł + zdanie o poradzie prawnej), PrepChecklist, podobne obiekty; strona pensjonatów z sekcjami dodatkowymi; generateStaticParams dla 12 adresów; SEO (Service, FAQPage, BreadcrumbList).
Porównanie: dom, pensjonaty, hotele, gminy w pełni (1440/390 × oba motywy); pozostałe 8 — 1440 jasny + 390 ciemny.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I11 — formularze i kontakt
```
Sesja I11 (Instalacje). Wzorzec: prototyp/zaplanuj.html, kontakt.html, serwis.html; zrodlo/pages/Zaplanuj.*, Kontakt.*, Serwis.*; spec §6; ADR-I002 §4.
Najpierw: SW7 (kreator Software) scalony? — ten sam src/lib/inquiry/submit.ts. Potem mały PR wsp inst/wsp-zapytania: reguły linii instalacje w lib/inquiry/schema.ts (klucze usług w topics[]) i gałąź kreatora Instalacji w submit.ts (odpowiedzi → podsumowanie w wizard) — bez nowych kolumn i migracji, mapa pól w ADR-I002 §4.
Zakres: kreator Zaplanuj (4 kroki, odczyt #obiekt=&uslugi=&konf= — konfiguracja ładowarki pokazana w kroku Szczegóły i wysłana w odpowiedziach wizard, ADR-I002 §4, jeden krok na ekran na telefonie, przyklejone Wstecz/Dalej), Kontakt (formularz, salony z CompanyData.locations, godziny, mapa dojazdu bez zewnętrznych skryptów — statyczna grafika/link do Map), Serwis (#zglos, pilność → deadline), trasa (instalacje)/wyslane (noindex, poza sitemap, teksty w dane/wyslane.ts; /dziekujemy należy do Software), powiadomienie e-mail (Mailpit lokalnie: http://localhost:8025), antyspam, limit. Bez uploadu plików w v1. Wszystko przez istniejący adapter zapytań z tenant=instalacje.
e2e: każdy formularz — błędy walidacji, wysyłka, zapis w panelu, e-mail w Mailpit. Porównanie 1440/390 × oba motywy.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I12 — Oferta, Realizacje, O firmie, Poradnik
```
Sesja I12 (Instalacje). Wzorzec: prototyp/oferta.html, realizacje.html, o-firmie.html, poradnik.html, poradnik-monitoring-rodo.html; źródła w zrodlo/pages/.
Zakres: pełna oferta pod /uslugi (Pages + blok InstOffer; /oferta należy do Biznesu) — 76 rozwiązań z InstSolutions, filtr po obiekcie, wyszukiwarka z normalizacją polskich znaków i literówek, nawigacja obszarów), Realizacje (filtr; placeholdery do czasu zdjęć — bez fikcyjnych realizacji), O firmie, Poradnik (lista z kategorią) i wpis RODO z quizem (Article JSON-LD, autor, data aktualizacji, zdanie „To nie jest porada prawna”). Przed tym mały PR wsp inst/wsp-poradnik: postHref/sitemap zależne od linii w src/lib/posts/list.ts (Instalacje → /poradnik/<slug>, reszta bez zmian, testy obu linii) + kategorie Instalacji w POST_CATEGORIES (migracja enumu); potem trasa (instalacje)/poradnik/[slug].
Porównanie 1440/390 × oba motywy.
DoD: docs/strony/prokominstalacje.md §10 + MOBILE-APLIKACJA.md §10 + SEO strony (title, description, JSON-LD); /inst-koniec przed /pr.
```

### I13 — SEO, prawo, wydajność, jakość
```
Sesja I13 (Instalacje). Przeczytaj docs/strony/prokominstalacje-SEO.md w całości.
Zakres: meta i OG dla 32 stron (z panelu, domyślne z seeda), JSON-LD wg §2.3 (walidacja), sitemap.xml i robots.txt tenanta, llms.txt, canonical, 301 z docs/tresci/prokominstalacje-301.md (wtyczka Redirects), strony prawne z docs/tresci/ (polityka prywatności, cookies, deklaracja dostępności) + linki w stopce i przy formularzach, analityka bez cookies (wzorzec repo, zdarzenia z SEO §5), nagłówki bezpieczeństwa wg repo, test e2e „brak placeholderów [ ] i list źródeł na stronach”, Lighthouse mobile ≥ 90 na 5 stronach z SEO §6 (wyniki w PR).
Strona /dla-architektow (prokominstalacje-architekci.md §1): przepisy — sprawdź stan nowych WT, ustawy GIA, wdrożenia EPBD i ustawy o najmie (weryfikacja w czacie przed sesją), zaktualizuj przepisyStan i plik źródeł; żadna opublikowana pozycja InstArchNews nie zawiera „[SZEF” ani „[CENA”.
```

### I14 — telefon: audyt końcowy
```
Sesja I14 (Instalacje). Przeczytaj MOBILE-APLIKACJA.md §10. Przejdź wszystkie 32 strony (z /dla-architektow; wzorzec telefonu dla niej: stany-telefonu/21–25) przy 360, 390 i 414 px w obu motywach: poziome przewijanie, cele dotykowe, dolny pasek i arkusz, chowany nagłówek, pasek kotwic, sekcje zwinięte, formularze z klawiaturą, karuzele, widżety dotykiem. Skrypt e2e, który to sprawdza automatycznie dla wszystkich adresów. Poprawki w tej samej gałęzi. Raport w PR: tabela strona × szerokość.
```

### I15 — staging i produkcja
```
Sesja I15 (Instalacje). Przeczytaj docs/wdrozenia.md i ADR-I001 §6, §9.
Zakres: Nginx server_name prokominstalacje.pl (PR wspólny), certyfikat, staging z hasłem i noindex, dane z panelu stagingu (telefon, e-mail, adresy — od szefa), lista kontrolna SEO §6, test na telefonach. Po akceptacji szefa w Asanie: /wdrozenie produkcja, flaga published=true, Search Console (domena, sitemap), Bing, Profil Firmy w Google → link do strony. Wpis w STAN i Asana.
```
