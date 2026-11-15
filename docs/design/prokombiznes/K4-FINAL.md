# K4 — prokombiznes.pl, wersja finalna wizualizacji (v150) — specyfikacja zbiorcza

Wersja: 30.10.2026 · wizualizacja v150 zaakceptowana przez Krystiana 30.10.2026 („akceptuję wszystko”).
Ten plik spina **wszystko, co powstało w wizualizacji po paczce K3.1** (rundy K3.2–K3.6, wizualizacje v127–v150), i mówi, co z tego jest obowiązujące. Szczegóły zostają w plikach rund (`k4/zmiany/K32…K36-ZMIANY.md`) — tu jest kolejność ważności, decyzje, co zastąpione, mapa danych i reguły, których nie ma w planszach.

Plan sesji i prompty: `PRZEKAZANIE-K4.md`. Instrukcja dla Krystiana: `START-K4.md`.

---

## 0. Źródła i kolejność ważności

| # | Źródło | Co rozstrzyga |
|---|---|---|
| 1 | **Ten plik** (`K4-FINAL.md`) | decyzje K4, co zastąpione, reguły danych |
| 2 | **Decyzje repo** — ADR-017 (K4), ADR-012 „Rozstrzygnięcia”, spec. `docs/strony/prokombiznes.md` §2 | adresy, nazwy kolekcji, model per tenant — wygrywają z nazwami z paczek |
| 3 | **Plansze K4** — `k4/boards/Strona.dc.html` (komputer) i `k4/boards/Aplikacja.dc.html` (telefon) + `Web-*`/`App-*` | wygląd, teksty szablonu (nagłówki sekcji, przyciski, podpisy), zachowanie, stany |
| 4 | **Dane K4** — `seed/prokombiznes/k4/*.json` | treść kart, marek, salonów, stron, list, planów, zestawów, konfiguratora |
| 5 | `k4/zmiany/K36-ZMIANY.md` → `K35` → `K34` → `K33` → `K32` | opis zmian; nowszy plik wygrywa ze starszym (lista sprzeczności w §2) |
| 6 | `MOBILE-APLIKACJA.md` → `K31-ZMIANY.md` → `K3-KATALOG.md` → `ZMIANY-v20.md` → spec. | to, czego K4 nie zmienia |

- **Zrzuty** `k4/screens/` to tylko podgląd; przy różnicy wygrywa plansza (otwórz ją lokalnie, §9).
- **Dane w planszy = dane w `seed/prokombiznes/k4/`** (ten sam eksport). Teksty, których nie ma w seedzie (nagłówki sekcji, etykiety, mikroteksty), przenosisz z planszy.
- **Nie przenosimy architektury plansz** (`<sc-for>`, `DCLogic`, dane w pliku, parametry `?w=`). Plansza = wzorzec; dane zawsze z bazy.
- Audyty wersji finalnej (co poprawiono i dlaczego): `k4/audyty/AUDYT-TRESCI-v150.md`, `AUDYT-WYGLADU-v150.md`; wcześniejszy `AUDYT-v147.md`. Wszystkie punkty krytyczne i ważne są już w planszach i danych — audyty służą jako lista kontrolna przy odbiorze sesji.

---

## 1. Zasady stałe (twarde — każda sesja, każdy widok)

- **Zero cen** produktów i usług; bez leasingu, rat, finansowania, „gratis”, „w cenie”. Wyjątki: „terminal bywa za 0 zł” (Polska Bezgotówkowa — warunki przy ofercie); ulga „do 700 zł” / „90% ceny netto” zawsze z dopiskiem, że rozlicza księgowa klienta. Nigdzie „przegląd 0 zł” — tylko „bezpłatny przegląd”.
- **Statusy** (wyłącznie te): Posnet i Elzab — „Autoryzowany serwis”; GoPOS i InsERT — „Autoryzowany partner”; Optivendi — „Partner”; COMEX — „We współpracy”. Żadna inna marka nie ma statusu — w O firmie trzecia grupa to „Pozostałe marki w ofercie”. Skrótów „Aut.” nie używamy.
- **Tylko Rabka:** PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447, tel. 889 003 889 (główny, też WhatsApp) / 883 200 151, pn–pt 9:00–17:00 (sobota i niedziela zamknięte), e-mail wyłącznie `kontakt@prokombiznes.pl` (**decyzja Krystiana 01.11.2026** — zastępuje `biznes@pro-kom.eu`, `biuro@pro-kom.eu` i numer stacjonarny 18 267 65 11; dane w seedzie: `src/seed/biznes/contact.ts`). U innych firm (fakty w salonach) — tylko miasto, bez ulic.
- **Zakazane marki** w treściach publicznych: Novitus, Honeywell, Verifone, Datalogic. Nie wspominamy o Strefie Klienta.
- **HP — tylko oryginalne wkłady** (karty HP, „Serwis drukarek”, „Tusze i tonery”, „Do tego zwykle dobierają”).
- **Opieka IT bez modelu cenowego:** bez „abonamentu”, „stałej opłaty”, pakietów; „Zakres ustalamy w umowie”, „wycena na piśmie”, „bezpłatny przegląd IT”.
- **Obietnice tylko potwierdzone:** „Oddzwaniamy w ciągu 60 minut w godzinach pracy”; liczba klientów jednym brzmieniem: „100+ klientów firmowych” / „Ponad 100 klientów firmowych — firm i instytucji z Podhala i Małopolski”. Bez „paszportu IT”, „zapisujemy w umowie”, czasów typu „w kilkanaście minut”, „wydamy podpis na miejscu”.
- **Język:** zwracamy się „Ty/Twój” (nie „Wasz”), forma neutralna płciowo („firma wcześniej nie używała…”), pauza „—”, „Wi-Fi”, „0–40 °C”, znak cala `"`, „4 w 1”, „przełącznik” zamiast „switch”, odmiana liczebników zawsze (`pl(n, …)`).
- **Jeden H1 na stronę**, w nagłówkach twarda spacja po jednoliterowych słowach (i, w, z, o, u, a), `text-wrap: balance` na H1–H3.
- **Logo Apple** — zgoda jest (K36 §0).
- **Pomiar (Plausible/GA4) — odłożony** (K36 §0); K35 §7 to plan na później, nie zakres K4.

---

## 2. Co K4 zastępuje (w repo i w starszych plikach)

| Było | Teraz | Uwagi |
|---|---|---|
| **K31e** (GoPOS, InsERT, O firmie, Kontakt 2.0 wg K3.1) | **K4h** (GoPOS, InsERT) + **K4i** (Opieka IT, O firmie, Kontakt) | wzorzec K4, dane `strony-k4.json` |
| **K31d** (Plan 2.0) | **K31d′** = prompt K31d + zmiany K4 | dane `plany-k4.json` (sceny po K4), plan na całą szerokość, lista pod planem |
| PROD: „kreator: wynik = gotowy zestaw” | **K4g** — Konfigurator 3.0 | stary `/kreator` (B10c) zastąpiony |
| B3/B4 — nagłówek, mega-menu, wyszukiwarka, szuflada | **K4b** — rama K4 | mega-menu v147c, wyszukiwarka Ctrl K, szybki podgląd, stopka 6 kolumn |
| B7 — strona główna | **K4c** — strona główna v150 | |
| B5/B10a — oferta i kategoria | **K4d** | kategorie K4, filtry, kolejność „Polecane” |
| K31c — salon Lenovo/Dell (szablon serii) | **K4f** — salon 2.0 dla wszystkich (Lenovo i Dell też, K35 §4) | istniejące komponenty `Showroom*` wolno przerobić, jeśli wynik = plansza |
| `dobierz` (frazy dopasowywane do kart, K31b-2) | **`polecane`** w danych K4 (slug + etykieta) | K36 §13 W14 |
| Intencje (4 kafle, K33/K34) i Szybki start v147 (K35 7a) | **Szybki start v149c** (K36 §11): Cała oferta / Konfigurator / Plan Twojej firmy / Salony marek / Zapytaj o wycenę | |
| Karty „Cała oferta” i „Nie wiesz, od czego zacząć?” pod listą (K35 7a, blok `kp7`) | **usunięte w v150** (dublowały Szybki start) | |
| Pasek przewijanych logo (K34 §2.2), sekcja „Ile numerów…” | **usunięte** (K36 §1) | |
| „Najczęściej wybierane” 12 (K34) | **16 z pigułkami filtra** (K35 7a) | |
| H1 strony głównej (K33) | „Kasy, komputery i programy dla firm.” + „Wszystko z jednego miejsca — z Rabki.” (K36 §1), telefon to samo | |
| Konfigurator 2.0 (K33 §5) | **Konfigurator 3.0** (K35 §1) | |
| Mega-menu K33/K34 | **v147c** (K35 7a) | |
| Kalkulator przestoju (K34 §6) | **usunięty** (K35 §0) | dane `kal` nie są w eksporcie |
| Koło w hero (K33 §3) | **K36 §12** (miniatury proste, kontr-obrót, 3 produkty przy dziale) | |
| Kolejność „Polecane” w ofercie | **K36 §10** (wiersze z działów, `pop9`/`dzTop9`) | |
| Adresy z K33 §1 (`/konfigurator`, `/gotowe-zestawy`, `/oferta/[kategoria]/[produkt]`, `/plan-twojej-firmy`) | **decyzje repo** (§3) | |
| Kategoria „Komputery, tablety i telefony” / „Komputery i monitory” | **5 kategorii** (K36 §4) + nowe „Klawiatury, myszy i słuchawki”, „Niszczarki”; „Drukarki i urządzenia wielofunkcyjne” z podkategoriami | §4.2 |
| Nazwa działu „Bezpieczeństwo, sieć i podpis” / „Sieć, ochrona i podpis” | **„Sieć, bezpieczeństwo i podpis”** (w kafelkach skrót „Sieć i bezpieczeństwo”) | |
| „Nowość” na 100 kartach | **tylko 10 premier** (`nowosc: true` w danych) | |
| `cartInit` z 2 pozycjami (demo) | **pusta lista** w produkcji | |

---

## 3. Decyzje K4 — przyjęte 30.10.2026 (ADR-017)

| # | Temat | Decyzja | Dlaczego |
|---|---|---|---|
| D-K4-1 | Adresy | Zostają: `/produkt/[slug]`, `/zestawy`, `/zestawy/[slug]`, `/oferta`, `/oferta/[kategoria]`, `/oferta/[kategoria]/[podkategoria]`, `/marki/[slug]`, `/plan-firmy`. **Nowe:** `/marki` (wszystkie marki), `/konfigurator` (+ 301 z `/kreator`), `/automaty-vendingowe`, `/ksef`, `/ulga-na-kase-fiskalna`. Salony tematyczne pod `/marki/druk`, `/marki/siec`, `/marki/nas`, `/marki/niszczarki`; marka bez własnego salonu, ale w salonie tematycznym (np. Kyocera) → 301 do salonu albo kotwica. | strona nie jest jeszcze na produkcji, więc zmiana nazwy `/kreator` nic nie kosztuje, a w całym UI jest „Konfigurator” |
| D-K4-2 | Kategorie | 33 kategorie K4 (`slowniki-k4.json`) zastępują 23 kategorie K3. Nowe slugi przez `CATEGORY_SLUGS`; 301 ze starych adresów (np. `/oferta/komputery-monitory/laptopy` → `/oferta/laptopy`). | K36 §4 — klient szuka „laptop”, nie „komputery i monitory” |
| D-K4-3 | Salony | Nowa kolekcja **`Showrooms`** (per tenant): slug, tytuł, marki[], bloki salonu 2.0 (§6). Lenovo/Dell przenieść z `Partners.showroom`. `Partners` zostaje dla marki (logo, status, fakty, opis). | salony tematyczne łączą kilka marek (Druk, Sieć, NAS, Niszczarki), a `Partners.showroom` jest per marka |
| D-K4-4 | Konfigurator | Dane w `BiznesSettings.wizard` (rozszerzone o pytania, nadpisania, presety, grupy zestawów, sceny — `konfigurator-k4.json`), silnik jako czyste funkcje z testami. | bez nowego globala (decyzja KD D2), reguły jako dane jak w B10c |
| D-K4-5 | Motyw | **Domyślnie jasny**, bez dziedziczenia z systemu; wybór w `localStorage` (K35 §6). | dziś `globals.css` reaguje na `prefers-color-scheme` — zmiana zachowania |
| D-K4-6 | Opinie-zaślepki | Karty opinii z flagą widoczności; na produkcji ukryte, dopóki nie ma prawdziwych (plansza pokazuje je jako „[do podmiany]”). | zaślepka z gwiazdkami wygląda jak fałszywa opinia |
| D-K4-7 | Strony KSeF / ulga / automaty | `Pages` z blokami Biznesu (jak GoPOS/InsERT), dwie wersje tekstów KSeF z polem „od daty” (K36 §3). | szef zmienia teksty w panelu bez programisty |
| D-K4-8 | Karty niepodzielone w wizualizacji | Podział z K3.1 w repo wygrywa; odwołania w danych K4 przepisane wg `mapa-slugow-k4.json`. | repo jest tu dalej niż wizualizacja |
| D-K4-9 | Aktualności na komputerze | Zostaje `/aktualnosci` z B11a (dane z repo); wygląd kart wg K4 przy K4c (sekcja na głównej usunięta w v150 — w planszy jej nie ma). | stara plansza Aktualności miała zły e-mail i zakazane marki — nie wraca |

---

## 4. Dane K4 — `seed/prokombiznes/k4/`

### 4.1 Pliki

| Plik | Zawartość |
|---|---|
| `katalog-k4.json` | **422 karty** (pełny stan wizualizacji v150, schemat jak `katalog-k3.json` + pola K4). `zmiana_k4`: `nowa` (162), `zmieniona` (129), `drobne` (131 — tylko typografia). |
| `mapa-slugow-k4.json` | karty niepodzielone (5 — zostaje podział z repo), zmiany slugów usług (`przeglad` → `przeglad-it`, `kopie` → `kopie-zapasowe`), karty do ukrycia z 301 (`opieka` → `/opieka-it`, `ux` → `ubiquiti-unifi-express-7`) |
| `slowniki-k4.json` | 5 działów, 33 kategorie (kod, dział, nazwa, opis, ikona, podkategorie, „Do czego”, „Nie wiesz, co wybrać?”), branże, rodzaje, sortowanie |
| `marki-k4.json` | 39 marek: opis, status, salon, logo (`media/marki/`), grupy na `/marki`, kolejność na głównej |
| `salony-k4.json` | 20 salonów (klucz salonu) + `salon_marki` (marka → salon) |
| `strony-k4.json` | GoPOS, InsERT, Opieka IT (bez kalkulatora), automaty vendingowe, dane firmy (O firmie, Kontakt, FAQ, tematy, autoryzacje), teksty tylko-telefon, wyszukiwarka (strony, synonimy, popularne) |
| `strona-glowna-k4.json` | 16 „najczęściej wybieranych”, kolejność w kategorii (`pop9`), top działu (`dzTop9`), produkty koła w hero, liczniki |
| `plany-k4.json` | 12 scen Planu Twojej firmy (punkty, etykiety, opisy po K4) |
| `zestawy-k4.json` | 23 zestawy po poprawkach K4 |
| `konfigurator-k4.json` | Konfigurator 3.0: rodzaje firm, sytuacje, skale, potrzeby, presety, listy produktów, pytania Tak/Nie z nadpisaniami, grupy zestawów, sceny |
| `media/produkty/` | zdjęcia **nowych** kart (640 × 640, WebP, przezroczyste tło; galerie jako `<slug>-2…`). Karty z repo mają galerie z K3/K3.1. |
| `media/kolory/` | zdjęcia wersji kolorystycznych (Apple, Samsung) |
| `media/marki/` | logo marek (wersja na jasne tło) |

### 4.2 Pola karty (różnice względem `katalog-k3.json`)

| Pole K4 | Znaczenie / mapowanie |
|---|---|
| `dzial`, `kategoria`, `podkategoria` | kody K4 (`slowniki-k4.json`); `kategoria` → slug przez `CATEGORY_SLUGS` (D-K4-2) |
| `krotka` | krótka nazwa = „Marka Model” (→ `Products.shortName`); opis po „—” jest w `podtytul` |
| `seria`, `rodzaj` (`Urządzenia` / `Oprogramowanie` / `Usługi`) | filtr serii, segment „Rodzaj” |
| `konfigurator` | jak K3 + `std` (wartości stałe, pokazywane jako parametry), `pom` (wyjaśnienie opcji zwykłym językiem), `dl` (długie wartości jako wiersze) |
| `polecane` | „Do tego zwykle dobierają” — lista `{slug, etykieta}`; **zastępuje dopasowanie fraz `dobierz`** |
| `podobne` | karty „Podobne / z tej samej rodziny” |
| `zestawy` | slugi zestawów, w których jest karta |
| `zrodla` | `{url, etykieta, host}` — gotowe etykiety; separator na stronie „ · ”, etykieta sekcji „Źródła:” |
| `wyrozniki` | 3 wyróżniki w hero karty |
| `w_skrocie_wzorzec` | to, co plansza pokazuje w „W skrócie” — **do porównania**, repo liczy bento samo wg reguły §4.4 |
| `nowosc` | `true` tylko dla 10 premier |
| `kolory` | `{nazwa, hex, plik}` — galeria = kolory, wybór koloru trafia do notatki w zapytaniu (K32 §9) |
| `wideo` | filmy YouTube (ADR-016) |
| `status` | jak w repo: `gotowe` / `do-sprawdzenia` / `do-akceptacji-szefa`; tylko „w przód” |
| `zmiana_k4` | do raportu importu; nie trafia do bazy |

### 4.3 Reguły importu (K4a)
1. Upsert po `slug_seed`; pola z paczki wygrywają z panelem (jak `seed:biznes`), status i data sprawdzenia tylko „w przód”.
2. Karty z `mapa-slugow-k4.json → niepodzielone` **nie są w pliku** — w repo zostają karty z podziału K3.1. Każde odwołanie w pozostałych plikach K4 jest już przepisane na slug z podziału.
3. `przeglad` → `przeglad-it`, `kopie` → `kopie-zapasowe`: nowa karta + 301 ze starego adresu; `opieka` (nieopublikowana) → 301 na `/opieka-it`; `ux` → 301 na `ubiquiti-unifi-express-7`.
4. Karty z repo, których nie ma w K4 i nie ma ich w mapie (podział K3.1), zostają bez zmian.
5. Kategorie: przypisanie wg `kategoria`/`podkategoria` K4; stare podkategorie „Komputery i monitory” znikają (301).
6. Usługi bez zdjęcia (12 kart PRO-KOM, rodzaj „Usługi”, `zdjecia_brak`) — na stronie granatowy kafel „Usługa PRO-KOM” (K36 §5), nigdy pusty obrazek.
7. Raport importu: liczby `nowa / zmieniona / drobne`, karty bez zdjęcia, odwołania do nieistniejących slugów (powinno być 0), test „zero cen” i zakazanych marek na polach publicznych.

### 4.4 Reguły, których nie widać w danych
- **„W skrócie” (bento):** wartość parametru z wariantami „Model: wartość; Model: wartość” → wszystkie wartości („203 / 300 dpi”), a gdy razem > 60 znaków — „zależnie od modelu (N wersji)”. Nigdy sama wartość pierwszego modelu, nigdy ucięcie po „:”.
- **Pas usług i „Co robimy przy zakupie” zależą od kategorii** (K36 §13): przeniesienie danych tylko przy laptopach, komputerach, telefonach, tabletach, programach, POS, kioskach, serwerach i NAS; kasy i drukarki fiskalne — „fiskalizacja i szkolenie”; automaty — „dobór i uruchomienie z Optivendi”, serwis Optivendi; usługi — „Usługa PRO-KOM”.
- **Kolejność „Polecane” w ofercie** (K36 §10): bez filtrów — wiersze z działów na przemian (3 na komputerze, 2 ≤ 1100 px), w dziale najpierw `dzTop9`, potem kategorie na przemian wg `pop9`; z filtrami — kolejność działów i kategorii jak w menu, w kategorii wg `pop9`.
- **Filtr „Do czego” i „Dobierz laptop”** tylko w laptopach i komputerach (lub gdy kategoria ma wpis w `do_czego`); gdzie indziej „Nie wiesz, co wybrać? … Zapytaj o dobór” (otwiera zapytanie z nazwą kategorii). Filtr „Seria” tylko, gdy kategoria ma ≥ 2 serie. Okruszek bez powtórzenia ostatniego elementu.
- **KSeF po dacie** (K36 §3 + v150): po 1.01.2027 znika pytanie o limit 10 000 zł, wynik i karta kar w czasie przeszłym, w stopce „KSeF” (bez „2027”).
- **Liczniki** (pozycje, marki, działy, kategorie) zawsze z bazy.

---

## 5. Widoki — stan docelowy i gdzie szukać szczegółów

| Widok (plansza) | Szczegóły | Najważniejsze w K4 |
|---|---|---|
| **Rama** (każdy widok) | K33 §2, K35 7a (mega-menu v147c), K36 §1 (stopka 6 kolumn), K35 §6 (motyw) | pasek linii z godzinami na żywo (bez „Zgłoś awarię”); nagłówek: Oferta ▾ · Marki · Opieka IT · GoPOS · InsERT · O firmie · Kontakt, „Szukaj · Ctrl K”, motyw, „Zapytanie (n)”; boczny pasek (≥ 1400 px); wyszukiwarka globalna; szybki podgląd; szuflada „Twoje zapytanie”; toast |
| **Strona główna** (`Web-Start`) | K36 §1, §11, §12; K35 7a; K34 §2 | hero z kołem (v149c), Szybki start (5), działy, Systemy (GoPOS, InsERT, Opieka IT), Marki (16 + „Zobacz wszystkie”), O to firmy pytają najczęściej (16 + pigułki), Firmy każdej wielkości + dofinansowania, Plan, Jak pracujemy + zobowiązania, Opinie, Słowo od właściciela, FAQ, Kontakt |
| **Oferta** (`Web-Oferta`) | K33 §4, K34 §4, K36 §10 | kafle działów, filtry w jednej karcie (Rodzaj, Nowości, Kategoria, Marka-kafle z logo, Branża), „Nie znaleźliśmy „…”” przy samym wyszukiwaniu |
| **Kategoria** (`Web-Kategoria*`) | K32 §1, K36 §4, §13 | chipy podkategorii albo sąsiednich kategorii; „Do czego” tylko laptopy/komputery; „Seria” gdy ma sens |
| **Produkt** (`Web-Produkt*`) | K31-ZMIANY §4 (jest w repo), K32 §9 (kolory), K36 §5, §13 | pas usług wg kategorii, kafel usługi, bento wg §4.4, „Do tego zwykle dobierają” z `polecane` |
| **Marki** (`Web-Marki`) | K33 §6 | grupy, kafle, statusy, „Wejdź do salonu” / „Zobacz ofertę” |
| **Salony** (`Web-Salon-*`, `Web-Marka*`) | K32 §5–§12, K35 §4, K36 §7–§8 | jeden szablon salonu 2.0 sterowany danymi (§6) |
| **Konfigurator** (`Web-Kreator*`) | K35 §1 | 3 pytania + wynik („Pytanie 1 z 3”), silnik 1:1, link `?kr=`, „sam decydujesz, co trafi do zapytania” |
| **Plan Twojej firmy** (`Web-Plan*`) | K31-ZMIANY (Plan 2.0), K33 §7, K34 §2.7 | 12 scen z `plany-k4.json`, lista pod planem, licznik „N punktów” |
| **Zestawy** (`Web-Zestaw*`) | K3c w repo | dane `zestawy-k4.json` (aktualizacja treści) |
| **GoPOS** (`Web-GoPOS`) | K32 §3, K34 §5 | spokojna wersja, moduły w 4 obszarach, „Skonfiguruj pakiet” (jedna nazwa) |
| **InsERT** (`Web-InsERT`) | K32 §3, K33 §7 | hero z pudełkami programów, InsPunkty, „Który Subiekt” |
| **Opieka IT** (`Web-Opieka`) | K34 §6 (bez kalkulatora), K36 §13 | „Te same sytuacje. Dwa różne dni w firmie.”, bez modelu cenowego |
| **O firmie** (`Web-OFirmie`) | K33 §7, K34 §7, K36 §13 | wizytówka, „Nie musisz wierzyć nam na słowo”, autoryzacje + „Pozostałe marki w ofercie” |
| **Kontakt** (`Web-Kontakt`) | K34 §8, K36 §13 | formularz: Imię lub firma *, Telefon * (albo e-mail), Miejscowość, Wiadomość |
| **Automaty vendingowe** (`Web-Vending`) | K32 §2 | „Partner Optivendi”, bez rabatu w makiecie |
| **KSeF** (`Web-KSeF`) | K35 §2, K36 §3 | licznik, oś, test, 6 kroków, kary, wersja po 1.01.2027 |
| **Ulga** (`Web-Ulga`) | K35 §3 | 4 kroki, „kiedy oddać”, dopisek o księgowej |
| **Telefon** (`App-*`) | `MOBILE-APLIKACJA.md`, K34 §1/§9, K35 §5, K36 §6, §13 | §7 niżej |

Formularz zapytania (szuflada i strona): „Imię lub firma *”, „Telefon *” i „lub e-mail” (wystarczy jedno z dwóch), „Wiadomość (opcjonalnie)”, pod przyciskiem: „Oddzwaniamy w ciągu 60 minut w godzinach pracy. Dane wykorzystamy tylko do przygotowania oferty; administrator: PRO-KOM Tadeusz Wójciak, Rabka-Zdrój.” + klauzula z `consent.ts`. Jedna nazwa koszyka: „Zapytanie”; stany „+ Do zapytania” / „✓ W zapytaniu”; nagłówek „Twoje zapytanie (n)”.

---

## 6. Salon 2.0 — jeden szablon, dane w `salony-k4.json`

Salon = zestaw opcjonalnych bloków; każdy salon włącza tylko te, które ma w danych. Kolejność sekcji: hero → polecane modele + tabela → drugorzędne → pełna oferta → „Pomóż mi wybrać” → serwis → wdrożenie → o marce → FAQ.

| Pole | Blok |
|---|---|
| `title` | nazwa salonu tematycznego (np. „Niszczarki”) — w tytule paska telefonu i w H1 |
| `pill`, `h1a`, `h1b`, `lead`, `logo`/`logos`, `hero` | hero (1–3 zdjęcia produktów; salon tematyczny — kilka logo) |
| `heroCard` | szklana karta w hero („Kupujesz X — dostajesz…”) |
| `fk` | 3 krótkie fakty w hero (liczby z odmianą) |
| `plans` (+ `alt: true`) | polecane modele (karty: dla kogo, nazwa, 3–4 punkty, „Zapytaj” / „Szczegóły”, `tag` tylko „polecamy na start”); `alt` = sekcja drugorzędna |
| `plans2`, `big` | druga sekcja wariantów (np. Galaxy w salonie Samsung), duże zdjęcia |
| `cmp` | tabela porównania (1 = ✓, 0 = —, tekst = wartość); komputer rozwinięta, telefon zwinięta |
| `fam` | pełna oferta w zakładkach rodzajów (produkty liczone z bazy po marce i kategorii) |
| `dob` | „Pomóż mi wybrać” — pytanie, odpowiedzi → modele + uzasadnienie; brak `dob` → drugi przycisk w hero „Zapytaj o ofertę” |
| `serwis` / `extra` (`extra.steps`) | blok serwisu (Posnet, Elzab) albo wdrożenie w 4 krokach |
| `fakty`, `opis`, `src` | o marce (miasto, nie adres), źródła |
| `faq` | pytania |
| `hFaq`, `hFakty`, `hOferta`, `hMore`, `hAsk` | nagłówki salonu tematycznego (K36 §8) — gdy brak, domyślne „Pytania o …”, „… w faktach” itd. |

Salony w danych: Posnet, Elzab, Sunmi, Druk (Konica Minolta + Kyocera), Sieć (Ubiquiti + TP-Link Omada), NAS (Synology + QNAP), COMEX, ESET, Microsoft, EuroCert, PolCard, Samsung, Sharp/NEC, Avtek, Apple, Lenovo, Dell, Brother, Logitech, Niszczarki (Fellowes + Kobra). HP — bez salonu (kafel marki → oferta z filtrem HP).

---

## 7. Telefon (aplikacja) — co dochodzi do `MOBILE-APLIKACJA.md`

- Szkielet bez zmian: dolny pasek Start · Oferta · Szukaj · Zapytanie (licznik) · Kontakt, menu i filtry jako arkusze, przyklejone CTA, tryb ciemny.
- **Start:** H1 jak na komputerze + „Wszystko z jednego miejsca — z Rabki.”; Szybki start (5 kafli w karuzeli: Cała oferta, Konfigurator, Plan Twojej firmy, Salony marek, Zapytaj o wycenę); skróty: Zadzwoń, KSeF, Zestawy, Opieka IT; bez paska marek; 16 „najczęściej wybieranych” z pigułkami; „Firmy każdej wielkości”.
- **Oferta / Kategoria / Szukaj:** K35 §5 (przyklejona wyszukiwarka, działy-karty, pigułki, „Pokaż kolejne 10”, „wszystkie słowa” w wyszukiwaniu).
- **Salony:** produkty jako **poziome karuzele** (`scroll-snap`, karta 80% szerokości, zdjęcie 168 px), salon ≤ ok. 6 000 px.
- **Statusy pełnym brzmieniem** („Autoryzowany serwis/partner”, „Partner Optivendi”, „We współpracy z COMEX · dobór i montaż”).
- **Konfigurator:** „Pytanie 1 z 3” … „Wynik”, przycisk „Wyślij” na pasku wyśrodkowany.
- **Potwierdzenie zapytania:** „Oddzwonimy w ciągu 60 minut w godzinach pracy i przygotujemy ofertę na piśmie.” (bez kopii na e-mail — formularz telefonu nie ma pola e-mail).
- **Wpis:** pod treścią linia źródeł (nie notatka programisty).
- Ramki plansz `App-*` mają wysokość dopasowaną do treści — zrzut 390 = cały ekran.

---

## 8. Definition of Done każdej sesji K4 (dopisz do §6.3 planu)

- Zrzuty Playwright 1440 i 390 w obu motywach porównane z planszą (`k4/boards`, podgląd §9) — w PR lista różnic.
- **0 poziomego przewijania** na 390 / 768 / 1024 / 1280 / 1440 (`scrollWidth === innerWidth`) na zmienionych trasach; strona komputerowa otwarta na telefonie też się składa (wspólny breakpoint ≤ 760 px), a układ „aplikacji” to osobny komponent (M1′).
- Kontrast WCAG AA w obu motywach (przyciski: biały tekst na `--acc` — reset `color: inherit` z zerową specyficznością, `:where(button)`).
- Test „zero cen” (kwoty „zł” poza dozwolonymi), zakazane marki, „abonament”/„stała opłata” w opisie Opieki IT PRO-KOM (abonamenty producentów, np. Microsoft 365, GoPOS, kas wirtualnych, są w porządku), „Aut.” — zielone.
- Jeden H1, `alt` = nazwa produktu na zdjęciach w kartach, `aria-label` na kartach-linkach (K36 §2).
- Dane z bazy, nic na sztywno; pola wewnętrzne (`uwagi`, `internalNotes`, `zmiana_k4`, `w_skrocie_wzorzec`) nigdy na stronie.
- `/przeglad` (recenzent), `/koniec-sesji`, `/pr`; jedna sesja = jedna gałąź (od `origin/develop`) = jeden PR; plan maks. 15 linii.

---

## 9. Jak oglądać plansze K4 lokalnie

```
cd docs/design/prokombiznes/k4/boards
python -m http.server 8765        # albo: npx serve -l 8765
```
- Komputer: `http://localhost:8765/Strona.dc.html?w=<widok>` — widoki: (start) · `oferta` · `kreator` (`&kr=gastro|nowa|2||dowozy:1` = wynik) · `marki` · `marka&m=<Marka>` · `plan` · `gopos` · `insert` · `zestawy` · `ofirmie` · `kontakt` · `opieka` · `vending` · `ksef` (`&ksefpo=1` = po 1.01.2027) · `ulga` · `kategoria&k=<kod>` · `?p=<slug>` (produkt) · `&dk=1` (ciemny).
- Telefon: `Aplikacja.dc.html` (okno 390 px) albo `App-*.dc.html`.
- Plansze `Web-*`/`App-*` tylko wczytują `Strona`/`Aplikacja` z innym stanem.

---

## 10. Poza kodem (przed produkcją)

- [SZEF] prawdziwe opinie (Google, Panorama Firm), zdjęcie właściciela, zdjęcia zespołu i lokalu; cytat właściciela.
- [SZEF] model rozliczenia Opieki IT (stała opłata czy wycena od zakresu) — do tego czasu neutralne brzmienie.
- [SZEF] Aktualności: kary KSeF (projekt MF), paragon z NIP do 450 zł, „Cyfrowy Uczeń 2027”, warunki Polskiej Bezgotówkowej — każde ze źródłem albo usunąć.
- [SZEF] czy PRO-KOM jest punktem rejestracji EuroCert; gwarancja Sunmi D3 PRO (Elzab vs Posnet); dostępność Fellowes 225Mi; gwarancje Kobra/Fellowes; prawo do zdjęć producentów i logo; zgoda Optivendi na zdjęcia.
- [Krystian] zdjęcia 2 kart z K3.1 (ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2), linki „Nie musisz wierzyć nam na słowo” na bezpośrednie listy serwisów/partnerów.
- [prawnik] polityka prywatności, cookies, dostępność (projekty z B11b).
