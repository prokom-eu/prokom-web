# prokombiznes.pl — runda 14–15.11: aktualizacja działającej strony (przekazanie dla Claude Code)

**Wersja:** 15.11.2026. **Właściciel:** Krystian. **Folder:** `prokom-web-biznes` (Biznes w jednym folderze, PR-y piętrowe).

**Cel:** zaktualizować stronę, która działa w internecie. To NIE jest nowa strona. Obejmuje to:
- stronę główną z nową kolejnością;
- /o-firmie, /kontakt i /marki;
- karty produktów i usług bez zdjęć;
- telefon dopracowany jak aplikacja.

Wynik ma iść na produkcję. Poziom wykonania: perfekcyjny, bez „prawie”.

> Ten plik jest kompletnym promptem sesji (CLAUDE.md → `/zadanie`). Gdy go masz, od razu kod. Zatrzymujesz się tylko przy:
> - decyzji, której ten plik nie rozstrzyga — wtedy pytanie z opcjami;
> - migracji usuwającej dane;
> - nowej zależności.
>
> Braki oznaczasz `TODO(krystian):` i nie zgadujesz.

---

## 0. Pakiet i kolejność ważności źródeł

Pakiet leży w `docs/design/prokombiznes/runda-1411/` (przenosi go sesja R0).

| Ścieżka | Co to jest |
|---|---|
| `PRZEKAZANIE-RUNDA-1411.md` | ten plik — **źródło prawdy dla zakresu i decyzji** |
| `plansze/*.dc.html` | wzorzec wyglądu (format jak plansze huba): dokładne wymiary, kolory, odstępy, teksty, logika animacji w klasie `Component` |
| `obrazy/` | obrazy i fonty, do których odwołują się plansze (`../obrazy/<plik>`). To kopie plików z repo: w kodzie używaj **istniejących** mediów z Payload/seedu, nie tych kopii |
| `dzis/*.png` | zrzuty obecnych stron (punkt wyjścia) |

**Czytanie plansz.** Plansza to HTML z inline-stylami. Zmienne `{{…}}` wypełnia metoda `renderVals()` w skrypcie na dole pliku: tam są listy produktów, kolory, kąty koła i czasy animacji. Plansze są w 1440 px. Układ telefonu opisuje §5 tego pliku plus `MOBILE-APLIKACJA.md`.

**Plansze → sekcje:**

| Plansza | Sekcja na stronie |
|---|---|
| `PoZmianach.dc.html` | cała strona główna po zmianach (kolejność + tagi zmian) — **plansza nadrzędna** |
| `Main.dc.html` | hero: dopracowane koło + pasek uprawnień + 2 numery |
| `Start.dc.html` | „Od czego zaczynasz” |
| `Systemy.dc.html` | „Systemy, które u Ciebie wdrożymy” (nowy blok) |
| `Wybierane.dc.html` | „Najczęściej wybierane” — 3 przewijane rzędy |
| `JakPracujemy.dc.html` | „Jak pracujemy” |
| `Zaufanie.dc.html` | „Od 2004” — uprawnienia ze zdjęciami produktów |
| `Aktualnosci.dc.html` | aktualności |
| `Koniec.dc.html` | „Inne linie PRO-KOM” + FAQ |
| `KontaktHero.dc.html` | /kontakt — górna sekcja |
| `Obszar.dc.html` | obszar działania (TYLKO /kontakt) |
| `OFirmie.dc.html` | /o-firmie — cała podstrona |
| `Marki.dc.html` | /marki — producenci i pozostałe marki |
| `Karty.dc.html` | okładki kart licencji i usług |
| `Oferta`, `Branze`, `Ksef`, `Stopka`, `StronaGlowna`, `Kolejnosc` | historyczne, **nie wdrażać** (zastąpione decyzjami niżej) |

**Kolejność ważności przy sprzeczności:**
1. ten plik;
2. plansze;
3. `docs/design/prokombiznes/K4-FINAL.md` + ADR-017 (wpis „Rozstrzygnięcia 15.11” robi R0);
4. `MOBILE-APLIKACJA.md`;
5. `docs/marka.md`.

Marka jest zamknięta: kolory i kroje tylko z tokenów (ADR-007). Kolory z plansz mapuj na istniejące tokeny Biznesu. Nowy token tylko w `tokens*.css` z testem kontrastu.

---

## 1. Decyzje zamknięte (nie dyskutujemy, nie zmieniamy)

**Cała strona Biznesu**
1. Dwa numery wszędzie: **889 003 889** i **883 200 151**. Dotyczy:
   - górnego paska, hero i paska zobowiązań;
   - CTA sekcji, kontaktu i o-firmie;
   - stopki, dolnego paska na telefonie i JSON-LD (`telephone` + drugi numer jako `contactPoint`).

   Numery są **tylko z panelu** (CompanyData / SiteSettings `shared`). Zero numerów wpisanych w komponent.
2. „Wycena na piśmie” → **„wycena na mailu”** we wszystkich tekstach Biznesu (seed, komponenty, meta, FAQ, stopka). **Tylko Biznes** — teksty Instalacji i Software zostają.
3. **Bez linków „Sprawdź w CEIDG”** i bez kart weryfikacji na Biznesie. Komponenty są wspólne, więc robimy **przełącznik linii**, nie usuwamy dla wszystkich (§3 R1). NIP zostaje jako zwykły tekst.
4. Tylko istniejące statusy:
   - Posnet, Elzab — „Autoryzowany serwis”;
   - GoPOS, InsERT — „Autoryzowany partner”;
   - Optivendi — „Partner”;
   - COMEX — „We współpracy”.
5. Zasady 01.11 bez zmian: zero cen, bez WhatsAppa, bez zdjęć ludzi, kontakt@prokombiznes.pl, pn–pt 9–17, tylko Rabka.

**Strona główna — nowa kolejność**

| # | Sekcja | Status |
|---|---|---|
| 1 | Hero — dopracowane OBECNE koło + pasek uprawnień + 2 numery | zmiana |
| 2 | Od czego zaczynasz | dopracowanie |
| 3 | Oferta — działy, **bez** podsekcji „Systemy, które wdrażamy od początku do końca” | zmiana |
| 4 | **Systemy, które u Ciebie wdrożymy** (GoPOS · InsERT · Stała opieka IT) | nowe — zastępuje usuniętą podsekcję |
| 5 | Najczęściej wybierane — 3 rzędy × 8, przewijane, **bez zakładek** | zmiana |
| 6 | Plan Twojej firmy | bez zmian |
| 7 | Jak pracujemy | nowy wygląd |
| 8 | Od 2004 — uprawnienia ze zdjęciami produktów | zmiana |
| 9 | Marki (blok `partners`) | bez zmian, przeniesiony |
| 10 | Zaopatrzenie firm | bez zmian, przeniesione niżej |
| 11 | Aktualności | zmiana; KSeF jako wyróżniony wpis |
| 12 | Inne linie PRO-KOM + FAQ | nowe / nowy wygląd |
| 13 | Formularz, kontakt, stopka | teksty: „na mailu”, 2 numery |

Usunięte z głównej:
- pasek KSeF (`bzKsef`); strona /ksef zostaje;
- mapa obszaru działania (zostaje tylko na /kontakt);
- `bzReferences` zostaje ukryte przełącznikiem.

**Hero — koło (decyzja: koncepcja zostaje, dopracowujemy)**
- Na każdy dział dokładnie 3 produkty, wszystkie jako zdjęcia:

  | Dział | Produkty |
  |---|---|
  | Kasy i sprzedaż | kasa Posnet (Ergo), terminal PolCard, Sunmi |
  | Komputery i biuro | MacBook, Lenovo ThinkCentre neo 50s, Konica Minolta |
  | Oprogramowanie | GoPOS, InsERT (nexo), Office |
  | Sieć i ochrona | EuroCert, ESET, Ubiquiti |
  | Serwis i usługi | KSeF, fiskalizacja kasy, opieka IT |

- Większe odstępy. W środku **bez** liczby pozycji i bez dubla nazwy działu.
- Animacje co najmniej tak płynne jak dziś na produkcji („wjazd” jak dziś).

**Jak pracujemy**
- Bez wiersza „Zajmuje się …” i bez inicjałów.
- Zobowiązania: **60 minut · Wycena na mailu · Przypomnimy o przeglądzie · Bez infolinii** + dwa przyciski z numerami.

**Od 2004**
- Bez rzędu Optivendi/COMEX.
- Kafle producentów ze zdjęciem produktu w osobnym jasnym panelu. Tekst **nigdy** nie nachodzi na zdjęcie, status w jednej linii.

**Najczęściej wybierane:** szczegóły w R5.

**/o-firmie:**
- nowy układ (R6);
- sekcja „Nie musisz wierzyć nam na słowo” **usunięta**;
- punkt „Jawne dane firmy” → „Przypomnimy o przeglądzie”.

**/kontakt:**
- 2 równe kafle numerów;
- pasek bez łamania;
- 7 dni godzin;
- nowa mapa obszaru;
- bez CEIDG.

**/marki:** Optivendi i COMEX trafiają do siatki „Pozostałe marki” ze znaczkiem statusu (bez osobnych rzędów).

**Karty bez zdjęcia:**
- licencje dostają okładkę „klucz licencji”;
- usługi dostają obraz tego, czego dotyczą;
- Office 2024 rozdzielony na osobne karty: słowo „bezterminowa” (nie „dożywotnia”), wsparcie do 10.2029.

---

## 2. Zasady wykonania — każda sesja, każdy PR

**Rytuał**
1. Na start: `git status`, `git fetch`. Gałąź za `origin` albo brudna → powiedz Krystianowi i stop. Potem `docs/STAN.md` → „W toku”.
2. Gałęzie od `origin/develop`, piętrowo (druga od pierwszej). Diff > ~400 linii → dziel. Conventional Commits po polsku, podpisane. Nigdy push na `develop`/`main`.
3. Przed `/pr`:
   - `pnpm lint && pnpm typecheck && pnpm test`;
   - e2e zmienionego obszaru;
   - `build` lokalnie przy zmianie migracji, konfiguracji albo zależności;
   - `/przeglad` (recenzent) — zawsze przy blokach, migracjach i strefie wspólnej.

   Opis PR: werdykt recenzenta + ocena każdej uwagi.
4. Zrzuty **przed/po** do opisu PR:
   - 1440, 1280, 834, 390 i 360 px, jasny i ciemny motyw;
   - porównanie z planszą obok (ta sama szerokość).
5. Po każdej akcji na GitHubie: `gh pr view` + link. Krystian czyta diff i scala.

**Treść i dane**
- Treści zmieniasz w seedzie Biznesu jako **upgrade idempotentny** (wzorzec `homeKsefNews.ts` / `homeBiz2.ts`): rekord zapisywany tylko przy różnicy, z testem. Produkcja dostaje treść przez import wg `docs/runbook.md` §3 — robi to Krystian, nie Ty. Nie dotykasz serwera.
- Zmiana schematu (nowy blok, nowe pole) = migracja w repo (`pnpm payload migrate:create`). Przed `/pr` rebase na `origin/develop` i migracja od nowa (`docs/sposob-pracy.md`).
- Dane kontaktowe, statusy i liczby (455 pozycji, 39 marek) — z danych, nie na sztywno.
- Strefa wspólna (`src/components/shared`, `src/lib/shared`, CompanyData, grupa `shared`) — tylko w PR `feat/wsp-*`, ze zrzutami **Instalacji i Software** przed/po (nic nie może się im zepsuć).

**Jakość, której nie negocjujemy**
- Lighthouse ≥ 90 (mobile i desktop) na: `/`, `/o-firmie`, `/kontakt`, `/marki` i jednej karcie produktu. LCP strony głównej nie gorszy niż dziś (≈ 0,55 s): koło nie może opóźnić LCP; obrazy koła przez `next/image`, `sizes`, lazy poza aktywnym działem.
- Animacje:
  - tylko `transform`/`opacity`, bez zmian layoutu w pętli;
  - pauza poza widokiem (IntersectionObserver) i przy ukrytej karcie przeglądarki (`visibilitychange`);
  - `prefers-reduced-motion` = statycznie;
  - CLS = 0.
- Dostępność WCAG 2.2 AA:
  - kontrast z tokenów;
  - widoczny focus;
  - klawiatura;
  - każdy samoruch z pauzą (2.2.2);
  - cele dotyku ≥ 44 px;
  - `alt` na obrazach;
  - etykiety przycisków-ikon.
- Server Components domyślnie; `"use client"` tylko w małych wyspach (koło, rząd przewijany, kopiuj e-mail).
- Zero nowych zależności. Jeśli naprawdę trzeba — pytanie do Krystiana z uzasadnieniem.
- Treść jednej domeny nigdy na innej (test izolacji zielony).

**Definition of Done telefonu:** `MOBILE-APLIKACJA.md` §4 plus §5 tego pliku. Telefon to osobny układ jak aplikacja, nie „zwężona strona”.

---

## 3. Plan PR-ów (kolejność i zależności)

```
R0 docs ─► R1 wsp (kontakt, numery, przełącznik CEIDG, mapa) ─► R2 hero ─► R3 układ głównej ─► R4 sekcje głównej
                                                           └─► R5 wybierane   R6 o-firmie   R7 marki   R8 okładki
                                                                                          └──────────► R9 QA + staging ─► (SZEF) produkcja
```

| PR | Gałąź | Zakres | Strefa wspólna | Migracja |
|---|---|---|---|---|
| R0 | `docs/biznes-runda-1411` | pakiet do docs, ADR-017 „Rozstrzygnięcia 15.11”, INDEKS, kolejka §7.4, STAN | — | — |
| R1 | `feat/wsp-biznes-kontakt-1411` | 2 numery we wspólnych komponentach + JSON-LD; przełącznik linii „linki weryfikacji / CEIDG”; ContactPage góra; ServiceAreaMap; OpeningStatus | **tak** | tak (pole przełącznika) |
| R2 | `feat/biznes-hero-1411` | koło + pasek uprawnień + 2 numery w hero | — | możliwa (lista produktów koła) |
| R3 | `feat/biznes-glowna-uklad-1411` | kolejność bloków, usunięcie bzKsef i starej podsekcji, nowy blok `bzSystems`, „Od czego zaczynasz”, „na mailu”, CEIDG off | — | **tak** (nowy blok) |
| R4 | `feat/biznes-glowna-sekcje-1411` | bzSteps, bzFacts, bzNewsHome, nowy `bzLines` + FAQ | — | tak (`bzLines`) |
| R5 | `feat/biznes-wybierane-1411` | bzFeatured: 3 rzędy × 8 | — | możliwa (grupa w seedzie) |
| R6 | `feat/biznes-o-firmie-1411` | /o-firmie | jeśli trzeba — wydzielić `feat/wsp-*` | możliwa |
| R7 | `feat/biznes-marki-1411` | /marki | — | — |
| R8 | `feat/biznes-okladki-1411` | okładki licencji i usług, Office 2024 | — | możliwa |
| R9 | `chore/biznes-runda-1411-qa` | przegląd telefonu i całości, Lighthouse, e2e, poprawki | — | — |

**Podział na sesje Claude Code** (decyzja 01.11: do 6 PR-ów w sesji):
- **Sesja A:** R0 + R1 + R2.
- **Sesja B:** R3 + R4 + R5.
- **Sesja C:** R6 + R7 + R8.
- **Sesja D:** R9 + staging.

Kolejna sesja startuje dopiero, gdy PR-y poprzedniej są scalone albo gdy piętruje na nich świadomie (opis w STAN).

---

## 4. Prompty sesji (wklej do Claude Code w folderze `prokom-web-biznes`)

### Sesja A — R0 + R1 + R2
```
/zadanie Runda 14–15.11 Biznesu, Sesja A (R0, R1, R2) wg docs/design/prokombiznes/runda-1411/PRZEKAZANIE-RUNDA-1411.md
(jeśli pakiet jest jeszcze w tmp/runda-1411 — R0 go przenosi). Przeczytaj CAŁY plik przekazania, potem plansze
wskazane w danym PR. Prompt jest kompletny: od razu kod, pytasz tylko o decyzje spoza pliku.

R0 docs/biznes-runda-1411 (bez kodu):
- tmp/runda-1411/* → docs/design/prokombiznes/runda-1411/ (plansze/, obrazy/, dzis/, ten plik). obrazy/ są
  kopią mediów z repo — dodaj do .gitattributes/.prettierignore jak inne plansze, nie formatuj .dc.html.
- ADR-017: sekcja „Rozstrzygnięcia 15.11” — lista decyzji z §1 przekazania (krótko, z odnośnikiem).
- docs/design/prokombiznes/INDEKS.md: runda-1411 na górze kolejności ważności.
- docs/zadania/prokombiznes.md: §7.4 „Runda 1411” = tabela PR R0–R9 i sesje A–D.
- docs/STAN.md (podsekcja Biznesu): W toku → Sesja A.

R1 feat/wsp-biznes-kontakt-1411 (strefa wspólna, zrzuty Instalacji i Software przed/po w PR):
- Najpierw sprawdź git log: jeśli PR-y z audytu 14.11 (kontakt na wąskim ekranie, meta /kontakt, jeden
  BreadcrumbList, favicon.ico) są scalone — pomiń je; jeśli nie — zrób je tu z testami (tmp/AUDYT-BIZNES-PRODUKCJA-1411.md).
- Dwa numery: wspólne komponenty (SiteHeader górny pasek, SiteFooter, TabBar/MenuSheet — przycisk „Zadzwoń” na
  telefonie otwiera arkusz z OBOMA numerami, ContactPage, CompanyCard, AboutPage, JSON-LD Organization/LocalBusiness:
  telephone = główny, drugi jako contactPoint) czytają numery z CompanyData; drugi numer opcjonalny — linia bez
  drugiego numeru wygląda jak dziś. Test: Biznes /, /kontakt, /o-firmie mają oba numery jako tel:; Instalacje bez zmian.
- Przełącznik w SiteSettings.shared: „Pokazuj linki weryfikacji (CEIDG)” (domyślnie: true — zachowanie dziś),
  dla Biznesu seed ustawia false. Gdy false: CompanyCard bez „Dane sprawdzisz w CEIDG”, ContactPage bez „Sprawdź w
  CEIDG”, VerifyCards nie renderuje się. Migracja w repo. Test jednostkowy przełącznika + e2e Biznesu: brak „CEIDG”
  w HTML /, /o-firmie, /kontakt.
- ContactPage — górna sekcja wg plansze/KontaktHero.dc.html:
  · dwa RÓWNE kafle-przyciski tel: („Numer główny” wypełniony kolorem linii, „Drugi numer” z obrysem), ikona,
    etykieta nad numerem, numer jedną linią; hover: uniesienie + krótki „dzwonek” ikony (reduced-motion: brak);
    zastępują duży napis numeru i „Zadzwoń teraz”;
  · pasek 3 pól: E-mail (white-space:nowrap, przycisk „Kopiuj” — navigator.clipboard w handlerze kliknięcia, przy
    błędzie zaznacz tekst; komunikat „Skopiowano” przez aria-live), Godziny, „Oddzwonimy w” / „60 minut”; etykieta
    nad wartością, wartość nigdy się nie łamie; pod paskiem „Oddzwaniamy w godzinach pracy” + link do formularza;
  · OpeningStatus jako pigułka z pulsującą kropką (zielona otwarte / pomarańczowa zamknięte);
  · karta salonu: mapa (jak dziś AddressMap), adres, godziny jako 7 kafelków dni z podświetlonym dzisiejszym,
    stopka „<nazwa firmy> · NIP …”.
  · Teksty z danych linii (lead „Wycenę przygotujemy i wyślemy mailem.” tylko w seedzie Biznesu).
- ServiceAreaMap (/kontakt) wg plansze/Obszar.dc.html: punkty wg współrzędnych (lat/lon w danych, rzut w kodzie),
  pierścienie 15/35/55 km, etykiety bez nakładania (prosty algorytm odpychania + test), lista miejscowości obok,
  oba numery. Test: odległości z Rabki ≈ Zakopane 34 km, Kraków 50 km, Nowy Sącz 54 km (±3).
- Telefon wg §5 przekazania (kafle numerów jeden pod drugim, pasek w 1 kolumnie, dni godzin w 7 kolumnach bez
  łamania). e2e 360/390: brak poziomego przewijania, numery i e-mail w jednej linii.

R2 feat/biznes-hero-1411 wg plansze/Main.dc.html (+ §1 „Hero”, §5):
- src/sites/biznes/blocks/BzHero/DepartmentWheel.tsx + wheelGeometry. Koncepcja zostaje. 15 produktów (3 na dział,
  lista §1), wszystkie jako zdjęcia z katalogu (bez ikon, bez miniatury-tekstu „KSeF” — KSeF to obraz k4-kolo-ksef).
  Geometria: działy na okręgu r≈165, produkty r≈290 pod kątami działu −20°/0°/+20°; aktywne ≈76 px z obwódką w
  kolorze działu, łuk + przerywane linie, pozostałe ≈54 px.
- Środek: „DZIAŁ n Z 5”, nazwa, nazwy 3 produktów, „Zobacz dział →”, postęp 6,5 s jako okrąg. BEZ liczby pozycji,
  bez drugiej etykiety z nazwą działu.
- Animacje (wartości w Component planszy): wjazd kolejno (działy, potem produkty, stagger ≈60 ms, lekki
  „przeskok”), dymek + ×1,12 na hover/focus, „pływanie” ±4 px aktywnych, fala w kolorze działu, przenikanie środka,
  zewnętrzny pierścień obraca się 90 s. Zachowaj dzisiejszą paralaksę. Pauza: okrągły przycisk z aria-label,
  poza widokiem i przy ukrytej karcie auto-stop; reduced-motion: statycznie, bez przełączania.
- Klik w produkt = wybór jego działu; klawiatura jak dziś; dane listy produktów z seedu (kolo_hero) — idempotentny upgrade.
- Pod hero pasek uprawnień: 4 kafle (logo na białej plakietce + status w jednej linii) + granatowe „2004 · w
  Rabce-Zdroju” i „10 000+ · klientów”. Dane z Partners/CompanyData.
- W hero dwa przyciski z numerami + „Oddzwaniamy w 60 minut w godzinach pracy”.
- Test: geometria (kąty, brak kolizji kółek przy r i rozmiarach), brak liczby pozycji w środku, reduced-motion.
  Lighthouse strony głównej mobile/desktop ≥ 90, LCP nie gorszy niż przed zmianą (pomiar przed/po w PR).

Na koniec: /przeglad, /pr dla każdego PR (piętrowo), docs/STAN.md → następny krok = Sesja B.
```

### Sesja B — R3 + R4 + R5
```
/zadanie Runda 1411 Biznesu, Sesja B (R3, R4, R5) wg docs/design/prokombiznes/runda-1411/PRZEKAZANIE-RUNDA-1411.md.
Plansza nadrzędna: plansze/PoZmianach.dc.html. Prompt kompletny — od razu kod.

R3 feat/biznes-glowna-uklad-1411:
- Kolejność bloków strony głównej dokładnie wg §1 (tabela 1–13). Upgrade seedu idempotentny (HOME_ORDER w
  src/seed/biznes/homeBiz2.ts + nowy upgrade): bzHero → bzNeeds → bzOffer → bzSystems → bzFeatured → bzPlan →
  bzSteps → bzFacts → partners → bzProcurement → bzNewsHome → bzLines (R4; do tego czasu pomiń) → faq → bzContact.
  Usuwa bzKsef ze strony głównej (strona /ksef bez zmian), bzReferences ukryty. Test kolejności i braku bzKsef.
- bzOffer: usuń podsekcję „Systemy, które wdrażamy od początku do końca” (nie dublujemy).
- Nowy blok bzSystems wg plansze/Systemy.dc.html: 3 granatowe karty (GoPOS · InsERT · Stała opieka IT), u góry
  duży obraz z poświatą i wolnym „pływaniem” (zestaw GoPOS / pudełko nexo + „gotowe na KSeF” / karty statusów
  opieki IT — teksty statusów z planszy jako przykład, oznacz TODO(krystian) do akceptacji), pod spodem logo +
  odznaka statusu, tytuł, tekst i CTA przeniesione z usuniętej podsekcji (bez nowych obietnic). Migracja.
- bzNeeds „Od czego zaczynasz” wg plansze/Start.dc.html: granatowy panel z polem otwierającym ISTNIEJĄCĄ
  wyszukiwarkę (Ctrl K), 5 kart równej wysokości, ikona 48 px w kolorze karty, etykieta, tytuł, opis, CTA
  przypięte do dołu (przerywana linia + kółko ze strzałką), hover: tło, rozwijany pasek u góry, ikona w górę,
  strzałka w prawo. Liczby (455 pozycji, 39 marek, 12 rodzajów firm) z danych. Karta 5: „WYCENA NA MAILU”,
  „Dobierzemy, wycenimy i odeślemy mailem.”
- „Wycena na piśmie” → „na mailu” we WSZYSTKICH tekstach Biznesu (src/seed/biznes/*, src/seed/shared/biznes.ts,
  homeFacts, k4Pages, textFixes, komponenty Biznesu, meta). Zaktualizuj testy tekstów (homeV150.test,
  textFixes.test, redaction.test) i dodaj test: brak „na piśmie” w treściach tenanta Biznes. Instalacje/Software
  nie ruszasz.

R4 feat/biznes-glowna-sekcje-1411:
- bzSteps wg plansze/JakPracujemy.dc.html: oś 01–04 (jeden kolor, kółka z białym tłem — linia nie przechodzi przez
  cyfry), karty z ikoną, tytułem, tekstem i panelem „DOSTAJESZ”; BEZ „Zajmuje się” i inicjałów. Granatowy pasek
  „Tak pracujemy na co dzień”: 60 minut · Wycena na mailu · Przypomnimy o przeglądzie · Bez infolinii + 2 numery.
- bzFacts wg plansze/Zaufanie.dc.html: lewa kolumna (tytuł, lead, granatowy „10 000+ klientów”, „2004 w Rabce-Zdroju”,
  link „Poznaj PRO-KOM” → /o-firmie, bez CEIDG); prawa siatka 2×2: jasny panel ze zdjęciem produktu (Posnet → Ergo,
  Elzab → K10, GoPOS → zestaw, InsERT → nexo) + logo na białej plakietce w rogu panelu, pod panelem ikona + status i
  zakres w jednej linii. Bez rzędu Optivendi/COMEX, bez pustego miejsca po „Słowie od właściciela”. Napraw puste
  authorizations (seed szuka marek po nazwie przy każdym imporcie, idempotentnie, test) — jeśli nie zrobione wcześniej.
- bzNewsHome wg plansze/Aktualnosci.dc.html: wyróżniony wpis KSeF z okładką (termin 1.01.2027) + 3 wpisy, równe
  wysokości, etykieta linii (kolorowa kropka + nazwa) zamiast logo w nagłówku; na Biznesie wpisy linii z tagiem
  „dla firm” (bez wpisów dla domów).
- Nowy blok bzLines + nowy wygląd FAQ wg plansze/Koniec.dc.html: 3 kafle (Instalacje, Software, Tech) z kolorowym
  nagłówkiem linii i linkiem do domeny — opisy krótkie, własne (nie kopiujemy treści linii), dane z panelu; FAQ z
  granatowym panelem (2 numery) i numerowanym akordeonem (natywne <details>/<summary> albo przycisk z aria-expanded).
  Migracja; dopisz bzLines do kolejności z R3.

R5 feat/biznes-wybierane-1411 wg plansze/Wybierane.dc.html:
- BEZ zakładek. 3 rzędy × 8 pozycji, nagłówek rzędu = grupa: Kasy i sprzedaż · Komputery i telefony · Programy,
  ochrona i zasilanie. Skład i kolejność z seedu najczesciej_wybierane (pola grupa + kolejność, idempotentnie).
  Pierwsze 4 w rzędzie = dzisiejsze 12; dodatkowe 4 na rząd: TODO(krystian) potwierdzić — propozycja z planszy
  (Posnet Thermal HX, Posnet Neo, Posnet Bingo, czytnik Elzab BS80 / Dell Pro 14, ThinkPad T14, Dell Pro Tower,
  Konica Minolta / APC Back-UPS, Synology DS+, UniFi U7, EuroCert). Tylko pozycje, które są w katalogu.
- Desktop/tablet: widoczne 4 karty (834: 2–3). Rząd przesuwa się o JEDNĄ kartę co 4,5 s (translateX, 0,8 s,
  cubic-bezier(.65,0,.35,1)); rzędy przesunięte w czasie o 1,5 s i naprzemiennie 1 ←, 2 →, 3 ←. Pętla bez końca
  (lista podwojona, po końcu reset indeksu bez animacji). Hover/focus w rzędzie = pauza tego rzędu; przycisk
  „Zatrzymaj / Wznów” dla sekcji (aria-pressed); strzałki ‹ › przy rzędzie; kropki postępu (aria-hidden); karty poza
  widokiem inert. Auto-ruch tylko gdy sekcja w widoku i karta przeglądarki aktywna. reduced-motion: bez auto-ruchu.
- Telefon: każdy rząd = poziomy scroll-snap palcem, karta ≈ 78% szerokości (widać kawałek następnej), BEZ auto-ruchu.
- Karta jak dziś (logo-chip, odznaka, „+ Do zapytania”, marka, nazwa w 1 linii), hover: uniesienie 6 px, zdjęcie
  ×1,07. Karta M365 z okładką „klucz licencji” (z R8; do tego czasu obecna).
- Mała wyspa kliencka BzFeaturedRow, dane z serwera. Vitest: logika indeksu (pętla w obie strony, reset, pauza).
  e2e: przycisk „Zatrzymaj” wstrzymuje przesuw; reduced-motion nie przewija.

Na koniec: /przeglad, /pr, STAN → Sesja C.
```

### Sesja C — R6 + R7 + R8
```
/zadanie Runda 1411 Biznesu, Sesja C (R6, R7, R8) wg docs/design/prokombiznes/runda-1411/PRZEKAZANIE-RUNDA-1411.md.
Prompt kompletny — od razu kod.

R6 feat/biznes-o-firmie-1411 wg plansze/OFirmie.dc.html (BzAboutPage + components/about; wspólne AboutPage/
CompanyCard/VerifyCards zmieniasz tylko przez osobny feat/wsp-* jeśli konieczne). Kolejność:
1. Hero granatowe z konturowym „2004” w tle (dekoracja aria-hidden): chip, H1 (bez zmian), lead, dwa przyciski
   tel: + „Jak pracujemy ↓”. Po prawej „Wizytówka firmy”: status otwarcia, nazwa, 6 pól w kafelkach (adres, NIP,
   2 telefony, e-mail, godziny), 4 autoryzacje (logo + ✓ status). Bez CEIDG (przełącznik z R1).
2. 4 liczby nachodzące na hero (2004 / 10 000+ / 2 + 2 autoryzacje / 5 linii) z ikonami, środkowa w kolorze marki.
3. „Dlaczego PRO-KOM” bento: duża karta 01 „Wycena na mailu, zanim zdecydujesz” z pływającą makietą maila
   (zakres / termin / bez zobowiązań — dekoracja aria-hidden, treść w tekście karty), 4 karty z ikonami: Tylko to,
   czego potrzebujesz · Jedna rozmowa do wszystkiego · Serwis na miejscu · Przypomnimy o przeglądzie; pas 06
   „Mówimy wprost, gdy coś się nie opłaca”.
4. Marki: 4 duże karty autoryzacji (logo, status, 1 zdanie — TODO(krystian) potwierdzić zdania) + „Pozostałe marki”
   6×2 (logo szare → kolor na hover/focus), Optivendi „Partner” i COMEX „We współpracy” jako znaczki, ostatni kafel
   „+ N marek →” do /marki (N z danych).
5. Krok po kroku: oś z kółkami 01–04, krok 3 „Wycena na mailu”.
6. 5 linii PRO-KOM: 5 kart z kolorowym paskiem u góry, „Jesteś tutaj” na Biznesie, domeny z danych.
7. Blok końcowy: CTA (2 numery, Napisz do nas, Wyznacz trasę) + mapa salonu (AddressMap jak dziś).
USUŃ sekcję „Nie musisz wierzyć nam na słowo”. Metadane i JSON-LD (AboutPage + Organization) bez zmian treści poza
numerami. e2e: brak CEIDG, oba numery, brak poziomego przewijania 360.

R7 feat/biznes-marki-1411 wg plansze/Marki.dc.html (/marki, (biznes)/marki + AboutBrands/Sections k4j):
- Góra: „Producenci, z którymi pracujemy” — 4 karty autoryzacji (Posnet, Elzab — Autoryzowany serwis; GoPOS,
  InsERT — Autoryzowany partner) z logo, statusem, zakresem i linkiem do salonu marki.
- „Pozostałe marki w ofercie”: jedna równa siatka (6 kolumn desktop, 3 telefon), Optivendi i COMEX w tej siatce
  ze znaczkiem statusu — bez osobnych rzędów „Partner”/„We współpracy”. Kafel = logo + liczba pozycji (z danych),
  link do salonu marki; sortowanie wg liczby pozycji, potem alfabetycznie. Stopka „Logotypy należą do ich właścicieli.”
- Test: Optivendi i COMEX mają swoje statusy i są w siatce pozostałych; brak pustych kafli.

R8 feat/biznes-okladki-1411 wg plansze/Karty.dc.html (src/sites/biznes/components/ProductStage.tsx + product/):
- Licencje (Microsoft 365, ESET, Adobe, Windows, Office): zamiast pustej ikony „Licencja elektroniczna” okładka
  „klucz licencji” — biała karta z logo producenta i nazwą planu na tle z siatką w kolorze producenta (kolor z
  danych marki, kontrast sprawdzony), etykieta „Subskrypcja · na użytkownika” albo „Licencja bezterminowa ·
  jednorazowo”. Generowana z danych karty (marka, nazwa, model licencji) — bez ręcznych grafik. Jedna okładka
  działa w karcie listy, karcie produktu, wyszukiwarce i „Najczęściej wybierane”.
- Usługi: zamiast „Usługa PRO-KOM” granatowa okładka z siatką, chip „Usługa”, wyśrodkowany obraz tego, czego
  dotyczy, z poświatą (przegląd kasy → kasa, fiskalizacja → kasa, KSeF → plakietka KSeF, przegląd IT → laptop,
  opieka IT → schemat/karty statusów), odznaka „Autoryzowany serwis” tylko przy kasach Posnet/Elzab, pasek 3 słów
  na dole; bez dużych napisów na okładce. Mapa usługa → obraz w danych (pole w katalogu albo mapa w lib z testem).
- Office 2024: rozdziel zbiorczą kartę microsoft-office-2024 na „Office Home & Business 2024” i „Office LTSC
  Standard / Professional Plus 2024” (301 ze starego adresu na Home & Business), zdjęcie pudełka
  k4-kolo-microsoft-office-2024. Słowo „bezterminowa”, nie „dożywotnia”; wsparcie do 10.2029. TODO(krystian):
  potwierdzić wersje w sprzedaży (do tego czasu karty w seedzie z draft albo za przełącznikiem).
- Test: żadna karta w katalogu Biznesu nie renderuje pustej ikony zastępczej (test na całym katalogu seedu).

Na koniec: /przeglad, /pr, STAN → Sesja D.
```

### Sesja D — R9: telefon, całość, staging
```
/zadanie Runda 1411 Biznesu, Sesja D (R9) wg docs/design/prokombiznes/runda-1411/PRZEKAZANIE-RUNDA-1411.md §5–§6.
Wszystkie PR-y R1–R8 scalone do develop. Cel: wynik gotowy do internetu.
1. Przejdź KAŻDĄ zmienioną stronę (/, /o-firmie, /kontakt, /marki, 3 karty produktów: licencja, usługa, sprzęt,
   wyszukiwarka, „Najczęściej wybierane”) w 360, 390, 430, 834, 1280, 1440 × jasny/ciemny. Lista usterek →
   poprawki w tym PR (chore/biznes-runda-1411-qa), każda z zrzutem przed/po.
2. Checklista §5 i MOBILE-APLIKACJA §4 punkt po punkcie — wynik jako tabela w opisie PR (✓/✗ + dowód).
3. Lighthouse mobile i desktop ≥ 90 (Performance, Accessibility, Best Practices, SEO) dla 5 stron — wyniki w PR.
   LCP i CLS strony głównej przed/po rundą.
4. Pełne e2e lokalnie zielone; dodaj brakujące: kolejność bloków głównej, oba numery na 3 stronach, brak „CEIDG” i
   „na piśmie” w treściach Biznesu, pauza przewijanych rzędów, brak poziomego przewijania 360 na 5 stronach.
5. Klawiatura: przejście Tab przez hero, rzędy, akordeon FAQ, kafle numerów — focus widoczny, kolejność logiczna.
6. sitemap/robots/JSON-LD bez błędów (walidacja w teście), 301 Office 2024 działa.
7. /przeglad, /pr. Po scaleniu: /wdrozenie staging — checklista, smoke (bash scripts/smoke.sh), import treści na
   staging wg runbooka §3 (Krystian uruchamia), zrzuty ze stagingu w 390 i 1440 do STAN.
Produkcja: dopiero po akceptacji szefa w Asanie („SZEF · Akceptacja rundy 1411 Biznesu”), kopia bazy, pipeline,
import treści wg runbooka §3 — robi Krystian. Ty przygotowujesz listę kontrolną i plan cofnięcia (poprzedni obraz).
```

---

## 5. Telefon — jak ma wyglądać każda sekcja (Definition of Done)

Ogólne (plus `MOBILE-APLIKACJA.md` §4):
- 360–430 px;
- boczny margines 16 px;
- zero poziomego przewijania strony (przewijają się tylko rzędy przeznaczone do tego, ze scroll-snap);
- cele dotyku ≥ 44 px;
- tekst min. 15 px (etykiety 11–12 px z letter-spacing);
- numery i e-mail nigdy się nie łamią;
- dolny pasek aplikacji nie zasłania CTA (padding na dole + `env(safe-area-inset-bottom)`);
- przycisk „Zadzwoń” w dolnym pasku otwiera arkusz z OBOMA numerami.

| Sekcja | Telefon |
|---|---|
| Hero | Bez koła (jak dziś). Kolejno: tytuł, lead, dwa pełnoszerokie przyciski z numerami (główny wypełniony), „Oddzwaniamy w 60 minut”. Pod spodem 5 działów jako przewijany rząd kafli z miniaturą produktu i kolorem działu. Pasek uprawnień: poziomy rząd kafli (scroll-snap), wartości w 1 linii |
| Od czego zaczynasz | Granatowy panel z polem wyszukiwania na całą szerokość; pod nim 5 kart w poziomym rzędzie (karta ≈ 78%, widać następną), równa wysokość |
| Oferta | jak dziś (bez usuniętej podsekcji) |
| Systemy | 3 karty jedna pod drugą, obraz u góry max 200 px wysokości, „pływanie” wyłączone poniżej 600 px (oszczędność baterii) |
| Najczęściej wybierane | 3 rzędy, każdy scroll-snap palcem, BEZ auto-ruchu i bez strzałek; nagłówek grupy nad rzędem |
| Plan | jak dziś |
| Jak pracujemy | oś pionowa po lewej (kółka 01–04), karty pod sobą; pasek zobowiązań 2×2 + 2 przyciski z numerami pełnej szerokości |
| Od 2004 | lewa kolumna nad siatką; kafle producentów 2×2 (panel zdjęcia 96 px), status w 1 linii (skrót „Autoryz. serwis” niedozwolony — zmniejsz font do 12 px zamiast) |
| Marki, Zaopatrzenie | jak dziś |
| Aktualności | wyróżniony wpis na górze, 3 wpisy jako lista z miniaturą 72 px |
| Inne linie + FAQ | linie jako 3 kafle pod sobą (kolorowy pasek), FAQ: panel z numerami nad akordeonem |
| /kontakt góra | status, tytuł (40 px), lead; dwa kafle numerów pod sobą pełnej szerokości; pasek: 3 wiersze (e-mail z „Kopiuj”, godziny, 60 minut); karta salonu pod spodem; dni godzin w 7 kolumnach (Pn…Nd + skrót godzin), bez łamania |
| /kontakt obszar | schemat mapy na pełną szerokość (wysokość 280 px), lista miejscowości pod nim w 2 kolumnach |
| /o-firmie | hero: tytuł 40 px, przyciski z numerami pod sobą; wizytówka pod hero; liczby 2×2; bento: duża karta + 4 karty pod sobą; marki: karty autoryzacji 2×2, pozostałe 3 kolumny; kroki pionowo; linie jako poziomy rząd scroll-snap; CTA i mapa pod sobą |
| /marki | autoryzacje 2×2, siatka pozostałych 3 kolumny |
| Okładki kart | czytelne od 140 px szerokości karty (logo i nazwa planu nie ucięte) |

---

## 6. Lista „gotowe do internetu” (Sesja D odhacza w PR)
- [ ] Wszystkie decyzje z §1 widoczne na stagingu, zrzuty 390 i 1440 w STAN.
- [ ] Brak „CEIDG”, „na piśmie” i „dożywotnia” w HTML stron Biznesu (test).
- [ ] Oba numery jako `tel:` na /, /o-firmie, /kontakt, w stopce i w dolnym pasku; JSON-LD z `contactPoint`.
- [ ] Lighthouse ≥ 90 × 5 stron × mobile/desktop; LCP głównej ≤ przed rundą; CLS 0.
- [ ] e2e pełne zielone w CI; test izolacji tenantów zielony.
- [ ] Instalacje i Software: zrzuty kontaktu i o-firmie bez regresji (R1).
- [ ] Samoruch (koło, rzędy) ma pauzę, staje poza widokiem, reduced-motion statyczne.
- [ ] Zero poziomego przewijania 360 px na 5 stronach.
- [ ] Wszystkie `TODO(krystian)` rozstrzygnięte albo świadomie odłożone (lista w STAN).
- [ ] Akceptacja szefa w Asanie → kopia bazy → wdrożenie pipeline'em → import treści (runbook §3) → smoke na produkcji → plan cofnięcia gotowy.

---

## 7. Do decyzji Krystiana / szefa (TODO zbiorczo)
1. 4 dodatkowe pozycje na rząd w „Najczęściej wybierane” (R5).
2. Teksty kart statusów opieki IT w bloku Systemy (R3).
3. Jedno zdanie o każdej autoryzacji na /o-firmie i /marki (R6, R7).
4. Wersje Office 2024 w sprzedaży (R8).
5. Akceptacja całości przez szefa: canvas „PRO-KOM Biznes — nowe sekcje strony głównej” (zadanie w Asanie).
