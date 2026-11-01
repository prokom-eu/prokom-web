# Elementy wspólne linii — plan sesji Claude Code (prokom-web) · v2 (01.11.2026)

Spec: `docs/design/wspolne/WSPOLNE-ELEMENTY.md` · Decyzja: `docs/adr/ADR-020-elementy-wspolne-linii.md` · Wzorzec: `docs/design/wspolne/plansze/` (+ płótno Krystiana https://claude.ai/artifact/7HKNezL1nNmgeZPJum8rQG).
Dotyczy tenantów **biznes, instalacje, software**. Tech (prokomserwis.pl) — osobny plan w `prokom-system/docs/wspolne/`. Gaming — nie dotyczy (poza flagą w `CompanyData.lines`).

**v2 zastępuje plan W0–W7.** Zmiana: część wspólna powstaje **raz** (fundament F0–F3), a wpięcie w strony oraz Kontakt i O firmie z własnymi dodatkami każdej linii robią **sesje linii L1–L2** — w folderze i rytmie danej linii.

## 0. Podział i zasady

### Fundament (F) — raz, w jednym folderze, jedna sesja naraz
- Folder: ten, w którym akurat **nie** trwa sesja linii (np. `D:\PRO-KOM\repos\prokom-web`). Nigdy dwie sesje Claude Code w jednym folderze.
- F robi: dokumenty, **dane i migracje**, tokeny, **wszystkie komponenty wspólne** i **szablony stron z miejscami na sekcje linii**, stronę podglądu komponentów. F **nie wpina** niczego w ramki linii (`src/sites/<linia>/…` bez zmian — wyjątek: seed treści linii w F1).
- Gałęzie `feat/wsp-*` (F0: `docs/wsp-*`), squash do `develop`.

### Sesje linii (L) — w folderze danej linii, po scaleniu odpowiedniego F
- Przed sesją: `git fetch` + rebase/merge `develop` (musi zawierać F).
- L **nie zmienia** `src/components/shared/`, `src/lib/shared/`, tokenów ról ani wspólnych pól panelu i **nie robi migracji wspólnych danych**. Brakuje czegoś we wspólnym komponencie → mały osobny PR `feat/wsp-<co>` do `develop` (z testem), potem linia z niego korzysta. Pola **tylko dla linii** (np. treść sekcji własnej) — w ustawieniach tej linii, własną migracją linii.
- Gałęzie wg konwencji linii (`feat/…`, Instalacje `inst/…`), wpis w STAN linii (`docs/STAN.md` albo `docs/stan/STAN-instalacje.md`).

### Wspólne dla F i L
- Plan w trybie planowania — akceptuje Krystian. Na koniec: `/przeglad` → porównanie z planszami → `/koniec-sesji` → `/pr`.
- **Przed każdą sesją z UI:** zrzuty dotkniętych stron (1440 i 390, jasny/ciemny) do `tmp/zrzuty-przed/`; po sesji porównanie — każda niezamierzona zmiana poza zakresem = błąd.
- Diff > 400 linii → PR-y piętrowe.
- Nie ruszamy: menu linii (dane i mega menu), hero i sekcji sprzedażowych, katalogu, kreatorów. Nowy pomysł → STAN „Pomysły”.
- Kolejność z bieżącą pracą: poprawki po audytach przed stagingiem (Biznes prompty 1–4, Instalacje I14b → I-T → I-M) kończymy **przed F1**.

## 1. Sesje

| Sesja | Etap | Gdzie | Zakres | Szac. | Zależy od |
|---|---|---|---|---|---|
| **F0** | A | fundament | pakiet w git, ADR-020, `MAPA-DZIS.md` (z listą dodatków linii na Kontakcie/O firmie), bez kodu | 0,5 | — |
| **F1** | A | fundament | dane: `CompanyData` (linie, salony, strefy, prawne, `consentMode`), grupa `shared` w 3 ustawieniach linii, migracja, seed z prawdziwymi danymi, hook `[SZEF`, loader | 1 | F0 |
| **F2** | A | fundament | tokeny ról + komponenty powłoki: `LineLogo`, `OpeningStatus`, `BrandBar`, `SiteHeader`, `SiteFooter`, `LinesBand`, `LegalBar`, `AddressMap`, `TabBar`, `MenuSheet`; strona podglądu `/_wspolne` (tylko dev/staging); strona Cookies w panelu, jeśli brak | 2 | F1 |
| **L1-B / L1-I / L1-S** | A | linia | wpięcie powłoki w ramkę linii (pasek marki, nagłówek ze slotami, stopka, dolny pasek i arkusz Menu), usunięcie starej powłoki i WhatsAppa | 0,5 × 3 | F2 |
| **F3** | B | fundament | moduły: `ContactForm`, `FaqBlock`, `Steps`, `ServiceAreaMap` + `zones.ts`, `Contours`, `CompanyCard`, `StatsStrip`, `RulesBento`, `FamilyStrip`, `VerifyCards`; **szablony `ContactPage`, `AboutPage` z miejscami na sekcje linii** (spec §6.0); wspólne API zgody/walidacji/sukcesu dla formularzy specjalnych | 2 | F2 |
| **L2-B / L2-I / L2-S** | B | linia | `/kontakt` i `/o-firmie` na szablonie + **sekcje własne linii** w miejscach szablonu; formularze specjalne linii podpięte pod wspólną zgodę/walidację/sukces; usunięcie starych stron i zdjęć ludzi | 1 × 3 | F3, L1 tej linii |
| **F4** | B | fundament | QA całości po wszystkich L2: e2e 3 tenantów, testy treści, axe, Lighthouse, 360/390/414, porównanie z planszami, „Stan wdrożenia” w spec | 0,5 | wszystkie L2 |
| | | | **Razem** | **≈ 10,5** (etap A ≈ 5) | |

- **Etap A** (F0, F1, F2, L1 × 3) — przed produkcją linii. **Etap B** (F3, L2 × 3, F4) — przed produkcją, jeśli czas pozwala; jeśli nie (priorytet Gaming 20.11) — po produkcji (adresy stron się nie zmieniają).
- **Software:** L2-S **zastępuje** budowę Kontaktu i O firmie w SW11a/SW11b (tam zostają `/cennik`, `/audyt`, strony prawne). Jeśli Kontakt z SW11a jest już scalony — L2-S przenosi go na szablon, zachowując „Twój projekt”.
- **Biznes:** L1-B zastępuje górny pasek i stopkę z ramy K4 oraz dolny pasek M1′; L2-B zastępuje Kontakt i O firmie z K4i (treść K4i → pola szablonu + sekcje własne).
- **Instalacje:** L1-I zastępuje klasy `topb`/`hdr`/`ftr2` i dolny pasek z I14; L2-I zastępuje `/kontakt` i `/o-firmie` z I11/I12.
- Kolejność linii w L dowolna (wg tego, która linia ma czas); każda L niezależna od pozostałych linii.
- Cięcie przy braku czasu: F4 skrócone do testów treści → L2 danej linii po produkcji (stare Kontakt/O firmie zostają, ale **bez WhatsAppa, bez zdjęć ludzi i z danymi z panelu** — to robi L1). **Bez cięć:** F0–F2, L1, rdzeń formularza w F3 (zgoda + walidacja).

---

## 2. Prompty — fundament

### F0 — pakiet, ADR-020, mapa „dziś → docelowo” (bez kodu)
```
/zadanie F0 — elementy wspólne linii: pakiet, ADR-020, mapa „dziś → docelowo” (BEZ KODU)

Kontekst: Biznes, Instalacje i Software zbudowały pasek marki, nagłówek, stopkę, formularz, Kontakt i O firmie każda po swojemu. Ujednolicamy to: część wspólna powstaje raz (fundament F0–F3, ten folder), a wpięcie w strony i Kontakt/O firmie z dodatkami każdej linii robią sesje linii L1–L2 w ich folderach. Ta sesja to tylko dokumenty i rozpoznanie — żadnych zmian w src/, seedach ani migracjach.

Gałąź: docs/wsp-pakiet od aktualnego origin/develop.

0. Pliki pakietu są w drzewie jako NIEŚLEDZONE: docs/design/wspolne/WSPOLNE-ELEMENTY.md, docs/design/wspolne/plansze/*.dc.html + README.md, docs/adr/ADR-020-elementy-wspolne-linii.md, docs/zadania/wspolne-elementy.md (plan v2: F0–F4 + L1–L2). Sprawdź `git status` (13 plików). Jeśli ADR-y leżą gdzie indziej niż docs/adr/ — przenieś ADR-020 obok ADR-019 i popraw odnośniki.

1. Przeczytaj w całości spec, ADR-020 i plan v2. Przejrzyj plansze (HTML z inline style — kolory, wymiary, teksty; dane w obiektach JS na dole plansz). Zasady treści 01.11 (spec §2) obowiązują od teraz: bez WhatsAppa, bez zdjęć ludzi, dane kontaktowe tylko z panelu, bez obietnic [SZEF], pro-kom.eu bez „sklepu”, nazwa „Tech”, Zakopane tylko na Instalacjach, Gaming tylko jako odnośnik z flagą published.

2. docs/design/wspolne/MAPA-DZIS.md — tabela dla biznes, instalacje, software: element → plik(i) → co robimy → sesja (F1–F4 / L1 / L2). Uwzględnij:
   - pasek marki, nagłówek (wymiar znaku — Instalacje 140 px), stopka, pasek prawny i linki prawne (Polityka, Cookies, Dostępność, Mapa strony — które linie mają),
   - dolny pasek i menu na telefonie,
   - formularze: ogólny + specjalne (lista zapytania Biznesu, kreator i „Twój projekt” Software, Zaplanuj Instalacji) — zgoda, walidacja, sukces, adapter Inquiries,
   - mapa OSM z Software v23, ServiceAreaMap z Biznesu, strefy / wyszukiwarka miejscowości z Instalacji,
   - skąd telefon, e-mail, adres, NIP, godziny (panel czy literał — wypisz literały),
   - wystąpienia „WhatsApp”, „wa.me”, click_whatsapp, „i sklep”, „Serwis” jako nazwy linii, „biznes@pro-kom.eu”, „18 267 65 11”, „example.test”,
   - zdjęcia ludzi i zaślepki portretów (także Software v23),
   - klasy prototypu Instalacji topb / hdr / ftr2.
   **Osobna sekcja „Dodatki linii na Kontakcie i O firmie”:** dla każdej linii lista sekcji/elementów, które ma dziś w kodzie albo w zaakceptowanej wizualizacji (Biznes K4/v150, Software v23, Instalacje v4.2), a których NIE ma w szablonie (spec §6.1/§6.2). Przy każdej: proponowany slot szablonu (spec §6.0) albo „do usunięcia” (np. zdjęcia ludzi, WhatsApp). To wejście do F3 (sloty) i L2 (sekcje linii).

3. Sprawdź rzeczywiste nazwy kolekcji i globali (CompanyData / SiteSettings, Tenants, *Settings, Inquiries) i istniejące pola kontaktowe — jeśli różne od spec §4, popraw spec i opisz mapowanie (F1 używa istniejących pól, nie dubluje).

4. public/brand/: czy jest znak PRO-KOM główny z zieloną kreską (prokom-glowna_poziome_*), znaki linii jasne/ciemne, znak TECH. Wynik do MAPA-DZIS.md. Niczego nie dorysowuj.

5. ADR-020 → „przyjęta” (albo z poprawkami — jakie). CLAUDE.md — dopisz:
   „Elementy wspólne linii: docs/design/wspolne/WSPOLNE-ELEMENTY.md (+ plansze/, MAPA-DZIS.md), plan docs/zadania/wspolne-elementy.md (F = fundament, L = sesje linii), ADR-020.
   Komponenty wspólne w src/components/shared (bez Payload, bez importów z src/sites/*), loader w src/lib/shared. Sesje linii nie zmieniają tych folderów ani wspólnych pól/migracji — brak → osobny PR feat/wsp-*.
   Zasady 01.11: bez WhatsAppa, bez zdjęć ludzi, dane kontaktowe tylko z panelu, nazwa „Tech”, przy pro-kom.eu bez sklepu, Gaming tylko jako odnośnik.”
   INDEKS / README docs — odnośniki. docs/STAN.md i docs/stan/STAN-instalacje.md — sekcja „Elementy wspólne” (F0 zrobione, następna F1; etap A: F0–F2 + L1 każdej linii przed produkcją; etap B: F3, L2, F4). W planach linii (Biznes PRZEKAZANIE-K4 / plan §7, Software plan SW, Instalacje plan I) dopisz jedną linijkę, które ich sesje zastępują L1/L2 (plan v2 §1).

6. Pytania do mnie zbierz na końcu planu, zanim cokolwiek zmienisz. Czekaj na akceptację.

Nie ruszaj: src/, seed/, migracji. DoD: tylko dokumenty, CI zielone, /przeglad, /koniec-sesji, PR „docs(wspolne): pakiet, ADR-020, mapa dziś” (squash).
```

### F1 — dane
```
/zadanie F1 — elementy wspólne: dane firmy i linii w panelu
Gałąź feat/wsp-dane. Przeczytaj spec §2, §4, §6.3, MAPA-DZIS.md, ADR-020.
1. CompanyData (albo odpowiednik wg MAPA-DZIS): legalName, nip, address, geo, mapsUrl, ceidgUrl, openingHours[], holidays[], salons[] (key, name, address, geo, hours[], parkingNote, published), lines[] (key, name, kind linia|marka, domain, url, color, colorOnDark, logoLabel, description, descriptionLong, published, order), serviceZones[] (name, towns[], note), legal (ścieżki stron prawnych), consentMode (checkbox|info, domyślnie checkbox). Wartości startowe ze spec §4.1 (Gaming i Zakopane published=false).
2. src/fields/sharedLineFields.ts — grupa `shared` (spec §4.2) dołączona do BiznesSettings, InstalacjeSettings, SoftwareSettings. Hook: blokada publikacji, gdy pole zawiera „[SZEF” lub „[Krystian”. Pól dla sekcji własnych linii NIE dodawaj — to robią sesje L2.
3. Migracja (rebase na develop przed migrate:create). Bez usuwania istniejących danych; istniejące pola kontaktowe użyj zamiast dublować — mapowanie w PR.
4. Seed: dla każdego tenanta treści z plansz (Kontakt, OFirmie, Footer, Chrome — obiekty danych w skryptach) z poprawkami spec §6.3 (Biznes: kontakt@prokombiznes.pl, 889 003 889 + 883 200 151, bez 18 267 65 11). Seed aktualizuje istniejącą bazę (zapis przy różnicy). Pola z [SZEF] nieopublikowane.
5. src/lib/shared/getSharedData.ts — jeden loader (CompanyData + shared bieżącej linii + published lines), cache jak inne loadery.
6. Testy: loader per tenant; hook [SZEF; test treści (spec §10 pkt 2) dla seedów.
Nie buduj UI. DoD: lint, typecheck, testy, build, CI; STAN.
```

### F2 — tokeny i komponenty powłoki (bez wpinania)
```
/zadanie F2 — elementy wspólne: tokeny i komponenty powłoki + podgląd (bez wpinania w linie)
Gałąź feat/wsp-powloka (diff > 400 linii → PR-y piętrowe). Spec §3, §5 (LineLogo, OpeningStatus, BrandBar, SiteHeader, SiteFooter, LinesBand, LegalBar, AddressMap, TabBar, MenuSheet), §2.4, §7; plansze Chrome, Footer, Telefon, Mapa, Logo, Moduly (status).
1. Tokeny ról (spec §3) w src/styles/tokens.css dla biznes/instalacje/software, jasny i ciemny; test kontrastu jak dla innych tokenów.
2. src/components/shared/ — komponenty jak w spec §5, czyste (propsy, bez Payload, bez importów z src/sites/*). SiteHeader ze slotami nav/extras/cta; SiteFooter ze slotem kolumn linii i ozdoby krawędzi; TabBar konfigurowany z shared.tabBar; MenuSheet ze slotem listy linii. OpeningStatus: Europe/Warsaw, testy z zamrożonym czasem (spec §10 pkt 3). AddressMap: uogólnij mapę OSM z Software v23 (warianty light/dark, accent, label, height, radius, „© OpenStreetMap contributors”, link mapsUrl rel=noopener); brak kadru ul. Orkana 16B w obu wariantach → wygeneruj z OSM wg planszy Mapa, SVGO < 60 KB. LinesBand: Gaming wg §2.4 (do czasu SVG od Krystiana tekst „PRO-KOM / GAMING”).
3. Strona podglądu /_wspolne (tylko gdy nie produkcja; noindex): wszystkie komponenty powłoki dla 3 tenantów, jasny/ciemny, telefon — do porównania z planszami i do testów e2e komponentów.
4. Strony prawne: sprawdź Polityka/Cookies/Dostępność/Mapa strony w każdej linii; brakującą Cookies dodaj jako stronę z panelu (szkic „do akceptacji”: tylko niezbędne, statystyki bez ciasteczek).
5. NIE wpinaj w ramki linii (to L1).
DoD: zrzuty /_wspolne vs plansze (1440/390, jasny/ciemny) — rozbieżności w PR; testy jednostkowe i e2e komponentów na /_wspolne (aria-current, tylko published linie, LegalBar identyczny dla 3 tenantów, LinesBand 5/6 kafelków wg flagi Gaming, tel: z danych, Menu: fokus/Esc); axe 0; CI; STAN.
```

### F3 — moduły i szablony stron z miejscami na sekcje linii
```
/zadanie F3 — elementy wspólne: formularz, moduły i szablony Kontakt / O firmie z miejscami na sekcje linii
Gałąź feat/wsp-moduly (diff > 400 linii → PR 1 moduły, PR 2 szablony). Spec §5, §6.0–§6.2; plansze Moduly, Kontakt, OFirmie; MAPA-DZIS.md sekcja „Dodatki linii”.
1. ContactForm: kolejność pól, rozpoznawanie telefon/e-mail, podpowiedź strefy, honeypot + istniejący limit, błędy (lista role=alert + pod polem + aria-invalid), sukces z numerem i nextSteps, consentMode z CompanyData; slot `formPrefill` (Software „Twój projekt”). Zapis przez istniejący adapter Inquiries (typ kontakt, tenant, temat).
2. Wspólne API dla formularzy specjalnych linii: ConsentField (zgoda/klauzula wg consentMode), walidacja kontaktu (telefon PL / e-mail), SuccessPanel — do użycia w L2 przez listę zapytania Biznesu, kreator Software, Zaplanuj Instalacji. Samych formularzy specjalnych NIE przerabiaj.
3. FaqBlock (+ JSON-LD FAQPage), Steps (pion/poziom), ServiceAreaMap (wzór K31 + wyszukiwarka Instalacji, dane serviceZones), src/lib/shared/zones.ts z testami (Szaflary→Podhale, Raba Wyżna→Podhale, Limanowa→wg danych), Contours (deterministyczne SVG), CompanyCard, StatsStrip (flaga ukryta na produkcji), RulesBento (flex-wrap), FamilyStrip, VerifyCards.
4. ContactPage i AboutPage wg spec §6.1/§6.2 z miejscami na sekcje linii wg spec §6.0 (nazwane sloty, przełączniki sekcji opcjonalnych, slot formPrefill formularza). Jeśli MAPA-DZIS pokazała dodatek, który nie mieści się w żadnym slocie — zapytaj mnie przed dodaniem nowego slotu, potem uzupełnij §6.0 spec.
5. Podgląd /_wspolne/kontakt i /_wspolne/o-firmie dla 3 tenantów z przykładową sekcją w każdym slocie (ramka „slot: nazwa”). Trasy /kontakt i /o-firmie linii NIE zmieniaj (to L2).
DoD: e2e formularza na /_wspolne (błędy, sukces, rekord w Inquiries, mail w Mailpit); testy zones; zrzuty szablonów vs plansze; axe; CI; STAN.
```

### F4 — QA całości (po wszystkich L2)
```
/zadanie F4 — QA elementów wspólnych na 3 liniach
Gałąź feat/wsp-qa. Spec §9, §10. Warunek: L1 i L2 wszystkich trzech linii scalone.
1. Pełny przebieg e2e 3 tenantów (spec §10 pkt 3), testy treści (§10 pkt 2) na całym repo i seedach, axe na trasach z elementami wspólnymi, Lighthouse mobile /kontakt i /o-firmie ×3, 360/390/414 bez przewijania w bok.
2. Porównanie z planszami (wszystkie), lista rozbieżności — drobne popraw w tym PR (tylko w częściach wspólnych), sprawy linii → STAN danej linii.
3. Spec — sekcja „Stan wdrożenia”; STAN; checklista stagingu (CompanyData, shared każdej linii, flaga Gaming po 20.11, consentMode po decyzji prawnika). /_wspolne zostaje tylko na dev/staging.
DoD: raport w PR, CI zielone.
```

---

## 3. Prompty — sesje linii

Każdy prompt L zaczyna się tym blokiem („wspólny początek”):
```
Warunek: develop zawiera F2 (dla L1) / F3 (dla L2). Najpierw git fetch i rebase (albo merge) origin/develop do gałęzi bazowej linii; sprawdź, że src/components/shared/ istnieje.
Zasada: NIE zmieniasz src/components/shared/, src/lib/shared/, tokenów ról ani wspólnych pól/migracji. Brakuje czegoś wspólnego → zatrzymaj się i zaproponuj mały PR feat/wsp-<co> do develop.
Przeczytaj: docs/design/wspolne/WSPOLNE-ELEMENTY.md (§1, §2, §5–§7, §11), MAPA-DZIS.md (wiersze tej linii i „Dodatki linii”), plansze z wariantem tej linii, docs/zadania/wspolne-elementy.md §0.
Zrzuty przed: główna, /kontakt, /o-firmie + 2 podstrony linii (1440/390, jasny/ciemny) do tmp/zrzuty-przed/.
```

### L1 — powłoka w ramce linii (wstaw linię)
```
/zadanie L1-<B|I|S> — elementy wspólne: powłoka w ramce linii <Biznes|Instalacje|Software>
[wspólny początek]
1. W ramce (Frame/layout) linii zastąp: górny pasek → BrandBar; nagłówek → SiteHeader ze slotami (menu i mega menu linii bez zmian jako nav; dodatki linii jako extras/cta); stopkę → SiteFooter (kolumny z shared.footerColumns, ozdoba krawędzi, jeśli linia ma); dolny pasek i menu telefonu → TabBar + MenuSheet (konfiguracja z shared.tabBar; zachowaj istniejące zachowania, np. chowanie paska przy kreatorze).
   - Biznes: lupa i „Zapytanie” z licznikiem jako sloty; dolny pasek Start · Oferta · Zapytanie · Kontakt · Menu (Szukaj = lupa w nagłówku telefonu); kolumna „PRO-KOM w regionie” → LinesBand.
   - Instalacje: klasy topb/hdr/ftr2 → komponenty wspólne (martwy CSS usuń tylko z tych elementów); znak 180×36; grzbiet gór jako ozdoba stopki; dolny pasek Start · Usługi · Zaplanuj · Kontakt · Menu („Dla kogo” do Menu).
   - Software: BrandBar z SW0 → wspólny („Darmowy audyt” w slocie paska); „Twój projekt” i „Bezpłatna wycena” jako sloty; stopka v21 „Jedna firma, sześć adresów” → LinesBand; dolny pasek Start · Oferta · Kreator · Kontakt · Menu.
2. Usuń z powłoki i stopki linii: WhatsApp (kafelki, wa.me, ikony, click_whatsapp), literały kontaktowe (dane z loadera), „Serwis” jako nazwę linii, „i sklep” przy pro-kom.eu.
3. Jeśli stare /kontakt lub /o-firmie linii mają WhatsApp, zdjęcia ludzi albo literały kontaktowe — usuń/podmień na dane z loadera już teraz (minimalnie, bez przebudowy — przebudowa w L2).
DoD: zrzuty po vs przed i vs plansze Chrome/Footer/Telefon (wariant linii); e2e: aria-current, tylko published linie, tel: z danych, LegalBar = tekst wspólny, LinesBand 5/6 wg flagi; ≤1080 px pasek marki ukryty; 0 przewijania w bok 360/390/414 na trasach linii; axe 0; CI; STAN linii.
```

### L2 — Kontakt i O firmie linii (wstaw linię)
```
/zadanie L2-<B|I|S> — Kontakt i O firmie linii <Biznes|Instalacje|Software> na wspólnym szablonie, z sekcjami własnymi
[wspólny początek]
1. /kontakt → ContactPage z danymi shared.contact; /o-firmie → AboutPage z shared.about. Treści linii, które dziś są w kodzie/panelu tych stron, przenieś do pól shared (panel/seed linii — bez zmiany definicji pól wspólnych).
2. Sekcje własne linii (lista z MAPA-DZIS „Dodatki linii”, uzgodniona w F0/F3): zbuduj jako komponenty linii w src/sites/<linia>/… i wstaw w sloty szablonu (spec §6.0). Treść — w ustawieniach tej linii (własne pola i migracja linii, jeśli potrzebne). Wygląd: wizualizacja linii, kolory z tokenów ról.
   - Biznes (przykłady — decyduje MAPA-DZIS): autoryzacje i partnerzy, trasy do Planu Twojej firmy / Opieki IT.
   - Instalacje: drugi salon (Zakopane, tylko gdy salons[].published), odnośnik do /dla-architektow, zgłoszenie awarii.
   - Software: „Twój projekt” (?projekt=1) jako prefill formularza — zachowaj zachowanie z SW11a; sekcje z v23 bez portretów.
3. Formularze specjalne linii (Biznes lista zapytania, Software kreator, Instalacje Zaplanuj): podepnij pod wspólne ConsentField, walidację kontaktu i SuccessPanel z F3 — układ formularzy bez zmian.
4. Usuń stare komponenty Kontaktu/O firmie linii (najpierw sprawdź, czy nic innego ich nie używa) i wszystkie zdjęcia/zaślepki ludzi.
5. JSON-LD LocalBusiness / Organization + BreadcrumbList; unikalne H1/lead z danych linii.
DoD: zrzuty 1440/390 jasny/ciemny vs plansze Kontakt/OFirmie (wariant linii) i wizualizacja linii dla sekcji własnych; e2e formularza (błędy, sukces, rekord w Inquiries z tenantem i tematem) + formularza specjalnego; brak <img> portretów; Lighthouse mobile ≥ 90; axe; CI; STAN linii.
```

## 4. Po stronie panelu (staging/produkcja, ręcznie — Krystian)
- CompanyData: dane firmy, salony (Zakopane `published:false` do danych od szefa), linie (Gaming `published:true` w dniu startu 20.11), strefy, `consentMode` po decyzji prawnika.
- Każda linia: grupa `shared` + pola sekcji własnych — sprawdzić treści, usunąć znaczniki [SZEF] po decyzjach.
