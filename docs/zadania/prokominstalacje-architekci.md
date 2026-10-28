# prokominstalacje.pl — strona „Dla architektów i deweloperów”: plan i prompty (W-A, I16a–c)

Wersja 1.0 · 28.10.2026 (czat). Uzupełnia `docs/zadania/prokominstalacje.md` (rytuał §0 obowiązuje bez zmian). Spec: `docs/strony/prokominstalacje-architekci.md`. ADR: `ADR-I005`. Wzorzec: `docs/design/prokominstalacje/ARCHITEKCI.md` + `prototyp/dla-architektow.html`. Źródła: `docs/strony/prokominstalacje-architekci-zrodla.md`.

## 1. Kiedy co robić
| Sesja | Zakres | Wieczory | Zależy od | Kiedy |
|---|---|---|---|---|
| **W-A** ✅ | wgranie pakietu architektów do repo + dopiski do istniejących dokumentów (same pliki, PR `inst/w-architekci`) | 0,25 | I2 scalone | zrobione 28.10, przed I3 |
| **I16a** | strona `/dla-architektow` cz. 1: blok `InstArchitects`, `dane/architekci.ts`, `dane/przekroj.ts`, **ArchHouseScene**, hero, Dla kogo, Problemy, Etapy, Wymiana, Instalacje, kotwice | 2 | I3, I4 | po I4 (najwcześniej), rekomendowane po I11 |
| **I16b** | cz. 2: kolekcja **`InstArchNews`** + migracja + seed (20) + hook znaczników; Nowe rozwiązania, Checklista (bez wysyłki), Liczby, Deweloperzy, Przepisy | 1,5 | I16a | po I16a |
| **I16c** | cz. 3: Doświadczenie, Biblioteka, Prezentacje, Zasady, **Opiekun** (`InstalacjeSettings.architects` + migracja), FAQ, formularze (rzuty, checklista PDF, nowości) na regułach I11, sekcja **`#architekci` na głównej** (`ArchTeaser`), linki z usług/obiektów, SEO, telefon | 1 | I16b, I6, I11 | po I16b |
| | **Razem** | **≈ 4,75** | | plan linii: ≈ 27 + 4,75 ≈ **31,5** wieczoru |

Zmiany w innych sesjach (dopisane w W-A do promptów w `prokominstalacje.md` §3):
- **I3:** pozycja „Dla architektów” w menu desktop (akcent), w mega „Dla kogo” (link w panelu promo), w arkuszu „Więcej” (pierwsza) i w stopce („Firma”, pierwsza) — z `dane/nawigacja.ts`. Link prowadzi do `/dla-architektow` (strona powstaje w I16a; do tego czasu 404 na stagingu jest akceptowalne, bo staging Instalacji jest ukryty do I13).
- **I6:** sekcja `#architekci` po `#uslugi` jest częścią wzorca strony głównej, ale budujemy ją w **I16c** (potrzebuje `ArchHouseScene` i `InstArchNews`). I6 zostawia w `InstHome` miejsce (komponent-zaślepka zwracający `null`) i pozycję w szynie dodaje I16c. Jeśli I16 zostanie zrobione przed I6 — I6 wstawia gotowy `ArchTeaser`.
- **I4:** wspólna sekcja „Powiązane” przyjmuje dodatkowy link „Projektujesz? Współpraca dla architektów →” (dodaje go I16c, gdy strona istnieje).
- **I13:** punkt kontrolny „przepisy na `/dla-architektow`: sprawdź stan nowych WT, ustawy GIA, wdrożenia EPBD i ustawy o najmie; zaktualizuj `przepisyStan` i plik źródeł”; brak `[SZEF` w `InstArchNews` opublikowanych.
- **I14:** audyt telefonu obejmuje 32 strony (z `dla-architektow`), stany `21–25`.

## 2. Co robi Krystian poza Claude Code
- [SZEF] opiekun architektów (imię, zdjęcie, telefon, e-mail architekci@), marki Hi-Fi i inne spoza oferty, partner Sonos, warunki dla pracowni, bezpłatna konsultacja, pokaz w salonie, realizacje z projektem architekta, autoryzacje — **przed I16c**.
- [czat] treść PDF „Checklista projektanta” → `docs/tresci/prokominstalacje-checklista.pdf` — przed I16b; wpisy Poradnika o projektowaniu — po I12.
- [czat] przed I13: ponowna weryfikacja przepisów (plik źródeł, oznaczenia [S]).

## 3. Prompty (kopiuj w całości)

### W-A — wgranie pakietu architektów (bez kodu) ✅
Zrobione 28.10.2026 z czatu: gałąź `inst/w-architekci` z `origin/develop` 787876b (po scaleniu I2, #135), pakiet wgrany, dopiski naniesione w spec linii, ADR-I002, planie, SEO, liście `[SZEF]`, MAPA-STRON, KOMPONENTY, README wzorca i seeda oraz STAN. Następny krok bez zmian: **I3** (z pozycją menu z ADR-I005 §4).

### I16a — Dla architektów: przekrój domu i sekcje 1–8
```
Sesja I16a (Instalacje). /inst-start. Przeczytaj: CLAUDE.md, STAN-instalacje.md, docs/strony/prokominstalacje-architekci.md (całość), ADR-I005, ADR-I002 („Pliki danych w kodzie”, „Poprawki I0”), ADR-I003, ADR-I004, docs/design/prokominstalacje/ARCHITEKCI.md, MOBILE-APLIKACJA.md, źródło: zrodlo/pages/Architekci.{body.html,js,meta.json}, zrodlo/inc/arscene.html, zrodlo/common.js (arHotspots, arScene, arSpecs), pk.css (bloki ar-/ars), seed/prokominstalacje/architekci/{strona,przekroj}.json.
Zrzuty wzorca: node docs/design/prokominstalacje/narzedzia/zrzuty-wzorca.mjs dla-architektow.
Zakres (gałąź inst/i16a-architekci):
1. Pages „dla-architektow” w seed:instalacje (wersja robocza z SEO z strony-zrzut/Architekci.json) + blok InstArchitects w rejestrze (na końcu), komponent strony.
2. dane/architekci.ts i dane/przekroj.ts (typowane, z prototypu przez cleanPrototype; liczby 1:1 z pliku źródeł — nic nie zaokrąglaj).
3. ArchHouseScene (sekcje/): SVG z arscene.html przeniesione do JSX 1:1 (te same współrzędne i klasy przeniesione do instalacje.css albo Tailwind), 3 widoki, 10 warstw, 17 punktów, karta punktu, strzałki, autoodtwarzanie z pauzą poza ekranem i bez ruchu przy prefers-reduced-motion (start: „Wszystkie instalacje”, punkt 1), telefon: poziome przewijanie z podpowiedzią. Tokeny scen --sg* z tokens.css (jeśli nie ma — dodaj z wzorca, ADR-I003). Wariant compact (do użycia w I16c).
4. Sekcje: hero (#hero), kotwice, #dla-ciebie, #problemy, #etapy, #wymiana, #instalacje — zakładki dostępne z klawiatury (tablist), link „Pełna strona” do stron usług.
5. Testy: jednostkowe logiki przekroju (widoczne punkty po wyłączeniu warstwy, nawigacja strzałkami, reset przy zmianie widoku), e2e: /dla-architektow 200, przełączenie widoku i kliknięcie punktu zmienia kartę; brak błędów w konsoli.
DoD: porownaj.mjs dla-architektow 1440/390 jasny i ciemny dla sekcji 1–8 zgodne (tabela w PR), Lighthouse telefon tej strony ≥ 90, lint/typecheck/testy/build/CI zielone. Najpierw plan, potem kod. /inst-koniec przed /pr.
```

### I16b — Dla architektów: Nowe rozwiązania (kolekcja) i sekcje wiedzy
```
Sesja I16b (Instalacje). /inst-start. Przeczytaj: STAN, spec architektów §2, §4 (sekcje 6, 7, 9, 10, 11), ADR-I005 §2, §6, ARCHITEKCI.md, seed/prokominstalacje/architekci/{nowe-rozwiazania,strona}.json, plik źródeł.
Zakres (gałąź inst/i16b-nowe-rozwiazania; zmiana schematu wg docs/sposob-pracy.md „Zmiana schematu bazy”: rebase na develop przed migrate:create):
1. Kolekcja InstArchNews (pola z ADR-I005 §2, onlyLineTenant, wersje robocze, kolejność, hook: brak publikacji ze znacznikiem [SZEF/[CENA w polach widocznych, rewalidacja strony /dla-architektow i głównej po zmianie) + migracja + rejestracja w configu i Tenants.
2. seed:instalacje: 20 pozycji idempotentnie (legacyId), pozycje z doPotwierdzenia jako wersje robocze, internalNote = doPotwierdzenia.
3. Sekcje: #nowosci (SolutionsExplorer z danych kolekcji: filtr z licznikami, lista + panel, strzałki, karuzela na telefonie; zapis na nowości jako formularz-zaślepka do I16c), #checklista (logika z prototypu; odhaczenia w localStorage z try/catch; formularz PDF jako zaślepka do I16c), #liczby, #deweloperzy (ciemny blok), #przepisy (oś + karty, data stanu z dane/architekci.ts).
4. Testy: hook znaczników, seed idempotentny (drugi przebieg: 0 zmian), filtr i licznik, checklista (liczba pozycji dla dom + domyślne instalacje = 20 — jak w prototypie).
DoD: jak I16a dla sekcji 6, 7, 9, 10, 11; dodanie karty w panelu → widoczna po publikacji. Najpierw plan. /inst-koniec przed /pr.
```

### I16c — Dla architektów: kontakt, formularze, główna, SEO
```
Sesja I16c (Instalacje). /inst-start. Warunek: I11 (reguły zapytań Instalacji) i I6 scalone — sprawdź w STAN. Przeczytaj: spec architektów (całość), ADR-I005 §1, §3, §4, §5, ARCHITEKCI.md, zrodlo/pages/Main.* (sekcja #architekci: arhm, arsc), prokominstalacje-SEO.md, reguły zapytań z I11.
Zakres (gałąź inst/i16c-architekci-kontakt; migracja dla InstalacjeSettings.architects):
1. InstalacjeSettings.architects (name, role, photo, phone, email, quote, responseText) + migracja; seed z placeholderami [SZEF] (tylko lokalnie/staging).
2. Sekcje: #doswiadczenie, #biblioteka, #pokaz, #zasady, #opiekun, #faq (10 pytań, FAQPage JSON-LD), #wyslij.
3. Formularze na regułach I11 (ADR-I005 §3): „Wyślij rzuty” (bez uploadu, pole link), checklista PDF, nowości e-mail z osobną niezaznaczoną zgodą na informacje handlowe; kategorie w Inquiries; maile jak inne formularze; telefon wymagany w „Wyślij rzuty”.
4. Główna: ArchTeaser (#architekci po #uslugi, ArchHouseScene compact, karta „Nowość” z wyróżnionej pozycji InstArchNews), pozycja w szynie.
5. Linki: „Powiązane” na stronach usług + blok na /dla-kogo/deweloperzy i /dla-kogo/budowy (jeśli te strony już są — inaczej wpis w STAN dla I10). Pozycja „Dla architektów” w nawigacji — sprawdź, że jest (I3); jeśli nie, dodaj w dane/nawigacja.ts.
6. SEO: Service z audience/areaServed/provider, BreadcrumbList, ItemList nowych rozwiązań; sitemap; tytuł/opis z Pages.seo. Telefon: audyt strony 360/390/414 (stany 21–25).
DoD: spec §10 w całości, porownaj.mjs całej strony i #architekci na głównej, e2e formularzy (zapis w Inquiries z kategorią), brak [SZEF na produkcji (test istniejący), CI zielone. /inst-koniec przed /pr.
```
