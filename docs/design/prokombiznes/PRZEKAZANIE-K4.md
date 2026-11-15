# prokombiznes.pl — przekazanie K4 (wersja finalna v150), 30.10.2026

Ten plik mówi Claude Code, **co jest w paczce K4, co zastępuje i w jakiej kolejności budować**. Treść i decyzje: `K4-FINAL.md` (przeczytaj w całości przed każdą sesją K4). Instrukcja dla Krystiana: `START-K4.md`.

Stan repo w chwili przekazania: `develop` @ `8976aa7` — Biznes: etap 1 (B0–B11) i ścieżka K3/K3.1 do **K3c włącznie** (#142) scalone. Paczka K4 wchodzi do repo jednym PR-em `docs/prokombiznes-k4` (wgranie + dokumenty — sesje W-K4 i KD4 zrobione w czacie projektu na prośbę Krystiana).

---

## 1. Zawartość

| Ścieżka | Co to |
|---|---|
| `docs/design/prokombiznes/K4-FINAL.md` | specyfikacja zbiorcza K4: kolejność ważności, zasady, co zastąpione, decyzje, dane, widoki, salon 2.0, telefon, DoD |
| `docs/design/prokombiznes/PRZEKAZANIE-K4.md` | ten plik |
| `docs/design/prokombiznes/START-K4.md` | krok po kroku dla Krystiana |
| `docs/design/prokombiznes/k4/zmiany/K32…K36-ZMIANY.md` | opisy rund K3.2–K3.6 (szczegóły widoków) |
| `docs/design/prokombiznes/k4/audyty/` | audyt v147 i dwa audyty wersji finalnej (treść, wygląd) — lista kontrolna przy odbiorze |
| `docs/design/prokombiznes/k4/boards/` | **plansze v150** (`Strona.dc.html`, `Aplikacja.dc.html`, 52 `Web-*`, 54 `App-*`, `media/`, `support.js`) — podgląd: `K4-FINAL.md` §9 |
| `docs/design/prokombiznes/k4/screens/` | zrzuty v150: `Web-*` 1440 (+ ciemne), `Web390-*` (strona komputerowa na telefonie), `App-*` 390 |
| `seed/prokombiznes/k4/*.json` + `media/` | dane K4 (`K4-FINAL.md` §4) |
| `docs/decyzje/ADR-017-prokombiznes-k4.md` | decyzje K4 (D-K4-1…9), status: przyjęta |

## 2. Co zastępuje
`K4-FINAL.md` §2. W skrócie: **K31e → K4h + K4i**, **K31d → K31d′**, **PROD (kreator → zestaw) → K4g**, rama B3/B4 → **K4b**, strona główna B7 → **K4c**, oferta/kategoria B5/B10a → **K4d**, salon K31c → **K4f** (salon 2.0), `dobierz` → `polecane`. **M1 → M1′**, **PROD → PROD′** (bez analityki — pomiar odłożony).

## 3. Kolejność w repo (od 30.10.2026)

| # | Sesja | Zakres | Gotowe, gdy (+ `K4-FINAL.md` §8) |
|---|---|---|---|
| 0 | ~~**W-K4 + KD4**~~ | paczka w `docs/` i `seed/`, ADR-017, plan sesji (§7 w `docs/zadania/prokombiznes.md`), INDEKS, STAN, CLAUDE.md | ✅ PR `docs/prokombiznes-k4` |
| 1 | **K4a-1** — kategorie i katalog K4 | migracja kategorii (33, podkategorie, `CATEGORY_SLUGS`, 301 starych adresów), pola `Products` (kolory, polecane, `configurator.std/pom/dl` jeśli brak), import `katalog-k4.json` (162 nowe + 260 aktualizacji, zdjęcia i kolory), `mapa-slugow-k4.json` (301), raport | panel: 422 karty K4 + karty z podziału K3.1; import 2× = te same liczby; 0 odwołań do nieistniejących slugów; stary adres podkategorii → 301; test zero cen / zakazane marki |
| 2 | **K4a-2** — marki, salony, listy, plany, zestawy | `Partners` (nowe marki, statusy, logo, grupy `/marki`), kolekcja `Showrooms` + import `salony-k4.json` (+ przeniesienie Lenovo/Dell z `Partners.showroom`), `strona-glowna-k4.json` (16 + grupy, `pop9`, `dzTop9`, koło), `plany-k4.json` → `FloorPlans`, `zestawy-k4.json` → `Bundles` | 39 marek, 20 salonów, 12 scen, 23 zestawy; import 2× bez zmian; testy jednostkowe mapowania |
| 3 | **K4b** — rama | pasek linii (godziny na żywo, bez „Zgłoś awarię”), nagłówek, **mega-menu v147c**, boczny pasek, wyszukiwarka globalna (Ctrl K, „/”), szybki podgląd, szuflada „Twoje zapytanie” (formularz K4), toast, **stopka 6 kolumn**, motyw domyślnie jasny (D-K4-5) | rama 1440/1024/768/390 = plansza; mega-menu mieści się w 1440 × 900; klawiatura w menu i wyszukiwarce; e2e: szukaj → podgląd → dodaj → szuflada → wyślij |
| 4 | **K4c** — strona główna v150 | wszystkie sekcje `Web-Start` (K36 §1, §11, §12, K35 7a, K34 §2) | zrzuty 1440 jasny/ciemny = `Web-Start`; koło: miniatury proste, obrót 120 s, pauza, `prefers-reduced-motion`; liczniki z bazy; jedno H1 |
| 5 | **K4d** — oferta i kategoria | `/oferta` (filtry K34 §4, kolejność K36 §10, puste stany), kategorie K4 (chipy podkategorii / sąsiednich kategorii), „Do czego” i „Seria” wg `K4-FINAL.md` §4.4, okruszki | `Web-Oferta`, `Web-Kategoria*`; filtry w URL; kasy/niszczarki bez „Dobierz laptop” |
| 6 | **K4e** — produkt (zmiany K4) | kolory (K32 §9), pas usług i „Co robimy przy zakupie” wg kategorii, kafel usługi, bento wg reguły, `polecane`, źródła z separatorem | `Web-Produkt*`, `Web-Produkt-COMEX`, usługa `przkas`; e2e: kolor → dodaj → notatka w zapytaniu |
| 7 | **K4f** — `/marki` i salon 2.0 (2 PR-y: **K4f-1** `/marki` + szablon + Posnet, Elzab, Sunmi, Druk, Sieć, NAS, COMEX, ESET, Microsoft, EuroCert; **K4f-2** PolCard, Samsung, Sharp/NEC, Avtek, Apple, Lenovo, Dell, Brother, Logitech, Niszczarki) | jeden szablon sterowany danymi (`K4-FINAL.md` §6), salony tematyczne, 301 marek bez własnego salonu | każdy salon = `Web-Salon-*`; brak bloku w danych = brak sekcji; JSON-LD `Brand` |
| 8 | **K31d′** — Plan Twojej firmy 2.0 | prompt K31d (`PRZEKAZANIE-K31.md` §4) + dane `plany-k4.json`, plan na całą szerokość, lista pod planem, „N punktów”, link z „Firmy każdej wielkości” ustawia scenę | jak K31d w §6.1 planu + `Web-Plan*` K4 |
| 9 | **K4g** — Konfigurator 3.0 | `/konfigurator` (+ 301 z `/kreator`), silnik K35 §1.2 jako czyste funkcje z testami, dane w `BiznesSettings.wizard` (`konfigurator-k4.json`), link `?kr=`, profil w zapytaniu | testy silnika (≥ 10 przypadków z K35 §8), `?kr=gastro|nowa|2||dowozy:1` → GoHub/GoOrder/GoPOS; „Dodaj wszystkie” dodaje N |
| 10 | **K4h** — GoPOS i InsERT | bloki stron + import treści z `strony-k4.json` (`gopos`, `insert`) | `Web-GoPOS`, `Web-InsERT`; „Skonfiguruj pakiet”; InsPunkty i „Który Subiekt” jak w K31e |
| 11 | **K4i** — Opieka IT, O firmie, Kontakt | `strony-k4.json` (`opieka_it`, `firma`) | `Web-Opieka`, `Web-OFirmie`, `Web-Kontakt`; bez kalkulatora i modelu cenowego; formularz kontaktu zapisuje zgłoszenie |
| 12 | **K4j** — automaty, KSeF, ulga | `/automaty-vendingowe`, `/ksef` (wersja po 1.01.2027 z pola „od daty”), `/ulga-na-kase-fiskalna` | `Web-Vending`, `Web-KSeF` (+ `?ksefpo=1`), `Web-Ulga`; licznik dni z bieżącej daty (Europe/Warsaw); FAQPage |
| 13 | **M1′** — telefon jak aplikacja | prompt M1 (`K3-KATALOG.md` §11) + `MOBILE-APLIKACJA.md` + `K4-FINAL.md` §7, plansze `App-*` K4 | 390 vs `k4/screens/App-*` w obu motywach; 0 poziomego przewijania 360/390/414; Lighthouse mobile ≥ 90 |
| 14 | **PROD′** | `AUDYT-PRODUKCJA.md` §9 bez analityki i bez kreatora (zrobione w K4g), z listą „już zrobione” z §6.1 planu | jak PROD w §6.1 planu |
| 15 | **QA-K4** | przegląd zgodności całości z planszami i audytami `k4/audyty/` (wszystkie trasy × 390/768/1024/1280/1440, oba motywy), poprawki w tym samym PR | 0 różnic krytycznych; raport w PR |
| 16 | **Staging** | jak w §6.1 planu | akceptacja szefa w Asanie → `/wdrozenie produkcja` |

**Kolejność cięcia przy braku czasu** (od końca, nie jakość): 1) strona ulgi → treść we wpisie Aktualności; 2) salony Sharp/NEC, Avtek, EuroCert, PolCard → strona marki z K3b′; 3) `/automaty-vendingowe` → zostaje kategoria `vend` z salonem-szablonem; 4) K4g → `/konfigurator` = kreator z B10c pod nowym adresem. **Bez cięć:** K4a, K4b, K4c, K4d, K4e, K4f-1, K31d′, M1′, PROD′, QA-K4.

**Szacunek:** 18 PR-ów. Przy tempie z 26–29.10 (KD → K3c: 10 PR-ów w 4 dni) to ok. 8–10 dni pracy do stagingu.

---

## 4. Prompty

Do **każdego** promptu dopisz blok z §6.2 planu (`docs/zadania/prokombiznes.md`) **i** ten:
```
K4: źródła w kolejności K4-FINAL.md §0 (K4-FINAL → decyzje repo/ADR-017 → plansze k4/boards → seed/prokombiznes/k4 → k4/zmiany/K36…K32 → MOBILE-APLIKACJA → K31 → K3).
Wzorzec: k4/boards/<plansza> (podgląd K4-FINAL §9) i k4/screens/<zrzut>. Teksty szablonu z planszy, dane z bazy (seed K4).
Zasady twarde: K4-FINAL §1. DoD: K4-FINAL §8 + §6.3 planu.
Najpierw sprawdź, co już jest w kodzie (B0–B11, K3a–K3c, K31a–c) — przerabiaj, nie buduj drugi raz.
```

### K4a-1 — kategorie i katalog K4
```
/zadanie K4a-1 — kategorie i katalog K4 (docs/design/prokombiznes/K4-FINAL.md §3 D-K4-2, §4; ADR-017)
Gałąź feat/prokombiznes-k4a-katalog od origin/develop. Bez UI poza tym, co wymusza zmiana kategorii (okruszki, menu biorą dane z bazy).
1. Kategorie: 33 kategorie i podkategorie z seed/prokombiznes/k4/slowniki-k4.json (5 działów). Slugi przez CATEGORY_SLUGS (zaproponuj listę w planie — polskie, krótkie), migracja, 301 ze starych adresów kategorii i podkategorii K3 (np. /oferta/komputery-monitory/laptopy → nowy adres laptopów). Pola „do_czego” i „dobor” kategorii/podkategorii do panelu.
2. Products: pola z K4-FINAL §4.2, których brakuje (kolory[], polecane[] {produkt, etykieta}, podobne, configurator.std/pom/dl, nowosc) — migracja up → down → up czysta.
3. Import seed/biznes: katalog-k4.json wg K4-FINAL §4.3 (upsert po slug_seed, status tylko w przód, zdjęcia nowych kart z media/produkty, kolory z media/kolory, mapa-slugow-k4.json → 301 i ukrycie). polecane zastępuje dopasowanie fraz dobierz (pole dobierz zostaje, nieużywane). Czyste funkcje + testy jak k3.ts.
4. Raport w PR: liczby nowa/zmieniona/drobne, karty bez zdjęcia (12 usług — kafel usługi), odwołania do nieistniejących slugów (0), test zero cen / zakazane marki.
Plan maks. 15 linii, czekaj na „ok”. Diff > 400 linii → zaproponuj podział.
```

### K4a-2 — marki, salony, listy, plany, zestawy
```
/zadanie K4a-2 — marki, salony 2.0 (dane), strona główna, plany, zestawy (K4-FINAL.md §3 D-K4-3, §4, §6; ADR-017)
Gałąź feat/prokombiznes-k4a-salony od origin/develop.
1. Partners: marki z marki-k4.json (opis krótki, status — tylko z zasady_statusow, logo z media/marki, grupa na /marki, kolejność na głównej).
2. Nowa kolekcja Showrooms (per tenant, na końcu listy kolekcji): slug, tytuł, marki[] i bloki salonu 2.0 z K4-FINAL §6 (pola opcjonalne). Import salony-k4.json; przeniesienie salonów Lenovo/Dell z Partners.showroom (dane K4 wygrywają), Partners.showroom po imporcie nieużywane — usunięcie migracją w K4f-2.
3. strona-glowna-k4.json → Products.featured + grupa „najczęściej wybierane” (16, 4 grupy), pop9/dzTop9 jako kolejność (pole albo dane w BiznesSettings — zaproponuj), produkty koła w hero.
4. plany-k4.json → FloorPlans (aktualizacja punktów/etykiet/opisów), zestawy-k4.json → Bundles (aktualizacja treści).
Import 2× = bez zmian; testy mapowania. Plan maks. 15 linii, czekaj na „ok”.
```

### K4b — rama
```
/zadanie K4b — rama strony K4 (K4-FINAL.md §5 „Rama”, K33 §2, K35 7a mega-menu v147c, K36 §1 stopka, K35 §6 motyw; ADR-017 D-K4-5)
Gałąź feat/prokombiznes-k4b-rama. Wzorzec: k4/boards/Strona.dc.html (dowolny widok) 1440/1024/768/390, Web-Start-ciemny.
Przerabiasz komponenty z B3/B4/K31b-1 (nagłówek, mega-menu, wyszukiwarka, szuflada, stopka) do K4. Formularz szuflady wg K4-FINAL §5 (jedna nazwa „Zapytanie”). Motyw domyślnie jasny, wybór w localStorage (try/catch), bez prefers-color-scheme.
Testy: e2e szukaj → podgląd → dodaj → szuflada → wyślij (Mailpit); klawiatura (Esc, strzałki, Ctrl K, „/”); 0 poziomego przewijania; axe. Plan maks. 15 linii, czekaj na „ok”.
```

### K4c — strona główna v150
```
/zadanie K4c — strona główna v150 (K36 §1, §11, §12; K35 7a; K34 §2; K4-FINAL §2 — co usunięte)
Gałąź feat/prokombiznes-k4c-glowna. Wzorzec: Web-Start, Web-Start-ciemny, Web390-start.
Sekcje: hero z kołem działów (3 produkty przy dziale, kontr-obrót, 120 s, pauza po najechaniu), Szybki start (5), działy, Systemy, Marki (16 + kafel „Zobacz wszystkie”), O to firmy pytają najczęściej (16 + pigułki), Firmy każdej wielkości + dofinansowania, Plan (komponent z K31d′ albo jego miejsce), Jak pracujemy + zobowiązania, Opinie (flaga D-K4-6), Słowo od właściciela, FAQ, Kontakt. Bez: paska logo, „Ile numerów”, kart „Cała oferta/Konfigurator” pod listą (v150).
Plan maks. 15 linii, czekaj na „ok”.
```

### K4d — oferta i kategoria
```
/zadanie K4d — oferta i kategoria K4 (K33 §4, K34 §4, K36 §4, §10, §13; K4-FINAL §4.4)
Gałąź feat/prokombiznes-k4d-oferta. Wzorzec: Web-Oferta, Web-Oferta (ciemny), Web-Kategoria*, kategoria-* w k4/screens.
Kolejność „Polecane” wg K36 §10 jako czysta funkcja z testem. Filtry: Rodzaj (segment), Nowości, Kategoria, Marka (kafle z logo — szerokość logo jawna), Branża; w URL. Kategoria: „Do czego” i „Dobierz laptop” tylko laptopy/komputery, „Seria” gdy ≥ 2 serie, okruszek bez powtórzenia, pusty wynik „Nie znaleźliśmy „…””.
Plan maks. 15 linii, czekaj na „ok”.
```

### K4e — produkt
```
/zadanie K4e — produkt: zmiany K4 (K32 §9, K36 §5, §13; K4-FINAL §4.2, §4.4)
Gałąź feat/prokombiznes-k4e-produkt. Wzorzec: Web-Produkt*, produkt-* w k4/screens.
Kolory w galerii i w notatce zapytania; pas usług i „Co robimy przy zakupie” wg kategorii; kafel usługi (bez zdjęcia); „W skrócie” wg reguły wariantów; „Do tego zwykle dobierają” z polecane; źródła „Źródła: … · …”.
Plan maks. 15 linii, czekaj na „ok”.
```

### K4f-1 / K4f-2 — `/marki` i salon 2.0
```
/zadanie K4f-1 — /marki i szablon salonu 2.0 (K33 §6, K32 §5–§12, K4-FINAL §6; ADR-017 D-K4-1, D-K4-3)
Gałąź feat/prokombiznes-k4f-salony-1. Wzorzec: Web-Marki, Web-Salon-* (Posnet, Elzab, Sunmi, Druk, Siec, NAS, COMEX, ESET, Microsoft, EuroCert).
Jeden komponent salonu sterowany danymi Showrooms (brak bloku = brak sekcji), salony tematyczne (kilka marek), /marki/[slug] marki → salon (salon_marki), marka bez salonu → strona marki z K3b′. JSON-LD Brand.
Plan maks. 15 linii, czekaj na „ok”.
```
K4f-2 — to samo dla: PolCard, Samsung (z `plans2`), Sharp/NEC, Avtek, Apple, Lenovo, Dell (K35 §4 — ten sam szablon; usunięcie `Partners.showroom` migracją), Brother, Logitech, Niszczarki (nagłówki `h*`, K36 §8).

### K31d′ — Plan Twojej firmy 2.0
Prompt K31d z `PRZEKAZANIE-K31.md` §4 + dopisek:
```
K4: dane z FloorPlans po K4a-2 (plany-k4.json), plan na całą szerokość kontenera, lista „Na tym planie” pod planem (3 kolumny przy 17 punktach — bez sieroty), licznik „N punktów”, kafle „Firmy każdej wielkości” ustawiają scenę i przewijają do planu. Wzorzec: k4/boards Web-Plan*, k4/screens/Web-plan.
```

### K4g — Konfigurator 3.0
```
/zadanie K4g — Konfigurator 3.0 (K35 §1; konfigurator-k4.json; ADR-017 D-K4-1, D-K4-4)
Gałąź feat/prokombiznes-k4g-konfigurator. Wzorzec: Web-Kreator, Web-Kreator-wynik, App-Kreator*, konfigurator-* w k4/screens.
Silnik K35 §1.2 jako czyste funkcje (potrzeby z 5 źródeł, kandydaci, powody, zestaw wg skali, scena) — najpierw testy. Dane w BiznesSettings.wizard (rozszerzenie B10c). /konfigurator + 301 z /kreator. „Pytanie 1 z 3” → Wynik; link ?kr=; „Dodaj wszystkie polecane”; profil konfiguratora w zapytaniu.
Plan maks. 15 linii, czekaj na „ok”.
```

### K4h — GoPOS i InsERT
```
/zadanie K4h — GoPOS i InsERT (K32 §3, K33 §7, K34 §5; strony-k4.json gopos/insert; zastępuje K31e cz. 1)
Gałąź feat/prokombiznes-k4h-gopos-insert. Wzorzec: Web-GoPOS, Web-InsERT. Kryteria K31e z §6.1 planu (pakiet → pozycje, KDS, InsPunkty, „Który Subiekt”) + K4. Bloki stron i import treści.
Plan maks. 15 linii, czekaj na „ok”.
```

### K4i — Opieka IT, O firmie, Kontakt
```
/zadanie K4i — Opieka IT, O firmie, Kontakt (K34 §6–§8, K35 §0, K36 §13; strony-k4.json opieka_it/firma; zastępuje K31e cz. 2)
Gałąź feat/prokombiznes-k4i-firma. Wzorzec: Web-Opieka, Web-OFirmie, Web-Kontakt. Bez kalkulatora przestoju i bez modelu cenowego; autoryzacje + „Pozostałe marki w ofercie”; formularz kontaktu wg K4-FINAL §5; godziny „dziś” w Europe/Warsaw.
Plan maks. 15 linii, czekaj na „ok”.
```

### K4j — automaty, KSeF, ulga
```
/zadanie K4j — /automaty-vendingowe, /ksef, /ulga-na-kase-fiskalna (K32 §2, K35 §2–§3, K36 §3; strony-k4.json automaty_vendingowe)
Gałąź feat/prokombiznes-k4j-strony. Wzorzec: Web-Vending, Web-KSeF (+ ksef-po-2027), Web-Ulga. Pages z blokami (D-K4-7), teksty KSeF w dwóch wersjach z polem „od daty”; po 1.01.2027 bez pytania o limit. FAQPage. Źródła tylko z linkiem.
Plan maks. 15 linii, czekaj na „ok”.
```

### M1′, PROD′, QA-K4
- **M1′:** prompt M1 z `K3-KATALOG.md` §11 + dopisek z `PRZEKAZANIE-K31.md` §4 + „K4: `K4-FINAL.md` §7, plansze `k4/boards/App-*`, zrzuty `k4/screens/App-*`”.
- **PROD′:** prompt PROD z `AUDYT-PRODUKCJA.md` §9 + „bez analityki (ADR-017 — pomiar odłożony), kreator zrobiony w K4g”.
- **QA-K4:**
```
/zadanie QA-K4 — odbiór całości K4 (K4-FINAL §8, k4/audyty/*)
Gałąź fix/prokombiznes-qa-k4. Dla każdej trasy Biznesu: zrzut 1440/1024/768/390 w obu motywach vs plansza, test poziomego przewijania, axe, zero cen/zakazane marki/„abonament” przy Opiece IT/„Aut.”, jedno H1, alt. Przejdź listy KRYTYCZNE i WAŻNE z AUDYT-TRESCI-v150 i AUDYT-WYGLADU-v150 — każdy punkt: „jest w kodzie” / „poprawione”. Poprawki w tym PR, raport w opisie.
```
