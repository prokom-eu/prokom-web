# K3.1 — produkt 2.0, salony Lenovo i Dell, Plan Twojej firmy z filmami, GoPOS i InsERT 2.0 (25.10.2026, wersja po przeglądzie — wizualizacja v126)

Uzupełnienie K3 (`K3-KATALOG.md`). Wszystko, czego tu nie ma, zostaje bez zmian. Gdy K3.1 i K3 mówią co innego, wygrywa K3.1.
Wzorzec wyglądu: `k31/screens/` (46 zrzutów: 16 desktop + główna + 29 telefon) i `k31/boards/` (plansze do podglądu lokalnego: `cd docs/design/prokombiznes/k31/boards && python -m http.server 8765`, potem `Web-*.dc.html` / `App-*.dc.html` / `Aplikacja.dc.html` / `Main.dc.html`).
Plansza = wzorzec wyglądu i zachowania. Architektury plansz (`<sc-for>`, `DCLogic`, dane w pliku) **nie przenosimy** — dane zawsze z bazy.

## 1. Co się zmienia
| Obszar | K3 | K3.1 |
|---|---|---|
| Katalog Lenovo/Dell | 30 + 22 karty | **+26 kart** (Lenovo 14, Dell 12): ThinkPad X9, P1, T14s 2-in-1, L13 2-in-1, X13 Detachable, ThinkBook 14 2-in-1, ThinkBook 16p, ThinkCentre M (tower/SFF, Tiny, AIO), ThinkStation P3/P4, ThinkVision M, ThinkSmart Core; Dell Pro 14 Premium, Pro 7, Pro 5, Pro Precision 7, Pro Max 16/18 Plus, Pro Max Micro/Tower, Pro Rugged, UltraSharp 4K QD-OLED/6K, monitory Dell Plus, stacje dokujące Dell, kamery i głośnik konferencyjny Dell, PowerEdge R260 |
| Serie | brak | `seria_karty` dla wszystkich 78 kart Lenovo/Dell (każda karta w dokładnie jednej serii salonu) |
| Strona marki | lista produktów | **salon marki** (Lenovo, Dell): działy → serie → produkty, porównanie serii, dobór w 3 pytaniach, film, usługi |
| Strona produktu | galeria + zakładki | **produkt 2.0** (§4) |
| Tło zdjęć | siatka | **studio** — jednolite we wszystkich kartach, galeriach, planszach, zestawach i kartach na stronie głównej (§3) |
| Plan Twojej firmy | 8 scen, 78 punktów, okienko | **12 scen, 186 punktów, 96 produktów**, popup z filmem i szczegółami (§6); **ten sam komponent na stronie głównej** (zastępuje B7b z K3) |
| Filmy | brak | `wideo-k31.json` (§7) |
| GoPOS, InsERT | v20 | **2.0** (§8–9) |
| Stopka | v20 | stopka v20 + linki K3.1 (§11.4) |
| Telefon | M1 | M1 + ekrany K3.1 (§10) |

## 2. Pliki (`seed/prokombiznes/k31/`)
| Plik | Co | Do czego |
|---|---|---|
| `katalog-k31-nowe.json` | 26 kart w formacie K3 (+ `seria`, `seria_salon`, `zdjecia_zrodlo`) | import jak K3 (`seed:biznes --k31`); 6 kart `do-sprawdzenia` (noindex) |
| `marki-salony-k31.json` | `seria_karty` {slug: seria} dla 78 kart Lenovo/Dell + `salony` (działy, serie z opisami „dla kogo / co wyróżnia / klasa”, kolejność, pytania i reguły doboru, usługi, hero) | `Brands.showroom` + `Products.series` |
| `plansze-k31.json` + `plansze-svg/*.svg` + `plansze-svg/fp.css` | 12 scen: SVG rzutu (viewBox 1600×820), punkty {x,y,slug,etykieta,opis}, zestawy | Plan 2.0 (§6) |
| `wideo-k31.json` | `produkty` {slug: [{youtube_id, tytul, kanal, jezyk, dopasowanie}]}, `serie`, `strony` | `Products.videos[]`, `Brands.showroom.videos`, strony GoPOS/InsERT |
| `strony-gopos-insert-k31.json` | treści i struktura stron GoPOS i InsERT 2.0 (moduły, kroki, FAQ, porównanie, KSeF; `insert.ksefSprawdzic` = notatka tylko do panelu) | globals `GoposPage`, `InsertPage` |
| `media/produkty/<slug>/*.webp` + `media-k31.json` | **91 zdjęć dla 24 z 26 nowych kart** (Lenovo z kart elenovo.pl, Dell z dell.com; wycięte tło, kwadrat 1200 px, WebP z przezroczystością) + pochodzenie (`Media.source`) | galerie jak w K3 |
| `firma-k31.json` | dane firmy, liczby, 8 zasad, 4 linie PRO-KOM, autoryzacje, tematy kontaktu, FAQ, punkty mapy dojazdu (§13.4) | globals `Company`, `AboutPage`, `ContactPage` |
| `strona-glowna-k31.json` | lista „Najczęściej wybierane” (8 slugów, §13.3) | global `HomePage.featured` |
| `karty-podzial-k31.json` | podział 6 kart wielomodelowych na 12 (§13.5) | migracja + 301 |
| `tresci-uzupelnienia-k31.json` | uzupełnienia treści 135 kart: 489 nowych FAQ, 24 nowe opisy, 31 dodanych parametrów (+ źródła) (§13.6) | nadpisanie przy imporcie (K31a) |
| `zdjecia-do-pobrania-k31.json` | 2 karty bez zdjęć (ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2) — strony producenta | Krystian pobiera; do tego czasu zastępnik (§4.10) |

## 3. Tło „studio” (zamiast siatki) — jeden komponent `<ProductStage>`
- Tło: `radial-gradient(120% 90% at 50% 18%, var(--st1) 0%, var(--st2) 50%, var(--st3) 100%)`; jasny: `#FFFFFF / #F2F5FB / #E1E8F4`, ciemny: `#1C2A4D / #111B35 / #0A1226`.
- „Blat”: od 70% wysokości pas `linear-gradient(180deg, var(--sth), transparent)` z linią 1 px (`--sth`: jasny `rgba(36,79,176,.055)`, ciemny `rgba(143,176,244,.06)`).
- Cień pod produktem: elipsa `left/right 20%`, `bottom 11%`, `height 7%`, `radial-gradient(closest-side, var(--shd), transparent)` (`--shd`: `rgba(13,19,38,.26)` / `rgba(0,0,0,.6)`).
- Zdjęcie `object-fit: contain`, 74–80% pola, delikatny `drop-shadow`. Stosuj wszędzie: karty katalogu, galeria produktu, miniatury, plansze (punkty), zestawy, salony marek, GoPOS/InsERT, **karty „Najczęściej wybierane” na stronie głównej**.
- Siatki (`linear-gradient` w kratkę, kropki) usunąć z kodu — także z ciemnych kart hero na telefonie (zamiast siatki: dwie miękkie poświaty `radial-gradient`, wzorzec `App-Start-390`). Wyjątek: rzuty lokali w planie (to podłoga, nie tło produktu).

## 4. Produkt 2.0 (`/produkt/[slug]`) — wzorzec `Web-Produkt-1440`, `Web-Produkt-ergo-1440`, `Web-Produkt-nowy-1440`, `App-Produkt-caly-390`
Kolejność sekcji (pusta sekcja się nie renderuje):
1. Hero: galeria (miniatury pionowo + miniatura „Film”, licznik 1/N **tylko przy 2+ zdjęciach**, logo marki, „Zobacz film”) | marka (link do salonu) · seria · kategoria, H1, podtytuł, **3 wyróżniki z ikonami** (z `cechy`, ikona dobierana słownikiem słów kluczowych), „Twoja wersja” (do 4 wybranych opcji, link „Zmień wersję”) albo korzyść, CTA „Dodaj do zapytania” + telefon, pas usług.
2. Przyklejona nawigacja sekcji: Przegląd · Opis · Wybierz wersję · Film · Parametry · Wersje · W zestawach · FAQ · Źródła (pozycja tylko, gdy sekcja istnieje) + mini-karta z CTA (miniatura tylko, gdy jest zdjęcie).
3. „W skrócie” — **bento 5 kafli** z `parametry`: priorytet Ekran, Procesor, Pamięć RAM, Dysk, Karta graficzna, Porty, Łączność, Bateria, Waga, Bezpieczeństwo; uzupełnienie kolejnymi parametrami do 5. Układ: 1. kafel ciemny podwójnej wysokości + 4 kafle 2×2 (bez osieroconego kafla). Skracanie wartości: 1. człon do „;”, maks. ~60 znaków (1. kafel ~70), cięcie na ostatnim „, ” / „ (” / „ — ” / „ / ” **bez wielokropka**; wielokropek tylko przy cięciu w środku zdania; niedomknięty nawias usuwany.
4. Opis (1. akapit większy) + panel: Dla kogo (`branze`), Wyróżnia się (`cechy`), Producent, „Co robimy przy zakupie”.
5. Wybierz wersję (jak K3 §5.1) + **przyklejone podsumowanie „Twoja konfiguracja”**.
6. Film (§7): duża fasada z plakatem + lista filmów (maks. 2).
7. Pełne parametry (2 kolumny), Wersje (karty, siatka `auto-fill, minmax(300px,1fr)` — pojedyncza wersja się nie rozciąga), W zestawach, **Do tego zwykle dobierają** (karty wg mapy `dobierz` → slug; bez dopasowania → chip tekstowy), **Z tej samej rodziny** (ta sama marka i seria, potem podkategoria; maks. 4; przycisk „Cała oferta <marka> →” do salonu).
8. FAQ (2 kolumny z kartą kontaktu).
9. **Źródła** — tylko domeny producentów (lista dozwolonych domen w kodzie; m.in. lenovo, dell, posnet, elzab, sunmi, gopos, insert, ui.com, synology, qnap, apc/se.com, microsoft, eset, sharpdisplays/sharpnecdisplays, konicaminolta, kyocera, samsung, tp-link/omada, eurocert, zebra, godex, dibal, gov.pl). Adresy sklepów i resellerów z `zrodla` (dellowo, elenovo, senetic, delkom, ui.pl, sharp24 itd.) **nigdy nie są pokazywane**. Strony z cenami (`pricing|cennik|/price|/ceny`) pokazujemy tylko wtedy, gdy nie ma innego źródła. **Etykieta liczona z adresu**: PSREF → „Specyfikacja PSREF — <model z nazwy pliku>”, PDF → „Karta katalogowa (PDF) — <marka>” / „Instrukcja (PDF) — <marka>” / „Dokument PDF — <marka>”, `support`/manuals → „Dokumentacja producenta — <marka>”, gov.pl → „Informacja urzędowa — <host>”, reszta → „Strona producenta — <marka>”. Obok: host + ścieżka (≤ 40 znaków) albo „host · PDF”. Data „sprawdzono 25.10.2026”. **Brak źródeł producenta (nasze usługi) → sekcja i pozycja w nawigacji znikają.**
10. **Karta bez zdjęcia** (dziś 2 karty: ThinkPad P1 Gen 9 i T14s 2-in-1 Gen 2; zasada na przyszłość dla każdej nowej karty; wzorzec `Web-Produkt-nowy-1440`): w galerii zastępnik na studio — ikona kategorii w kafelku, nazwa, „Zdjęcie producenta pojawi się wkrótce. Pełna specyfikacja — poniżej.”; bez licznika i miniatur; w kartach list (katalog, salon, rodzina, dobierz, GoPOS, InsERT, wyniki doboru) — ikona kategorii + „Zdjęcie producenta wkrótce”. Nigdy pusty `<img>` ani ikona zepsutego obrazka.
11. Pas CTA „Potrzebujesz kilku sztuk albo całego stanowiska?”.
SEO: `Product` (bez `offers`), `FAQPage` tylko dla `gotowe`, `VideoObject` dla filmu (name, thumbnailUrl z i.ytimg.com, embedUrl youtube-nocookie, uploadDate z oEmbed/API).

## 5. Salon marki `/marki/lenovo`, `/marki/dell` — wzorzec `Web-Marka-1440`, `Web-Marka-Dell-1440`, `App-Marka-390`, `App-Marka-Dell-390`
Pozostałe marki zostają na szablonie K3 §6; salon włącza się, gdy marka ma `showroom` w danych.
1. Hero ciemny: logo, H1/lead z `salony.<marka>`, „Zobacz ofertę” / „Dobierz w 3 pytaniach”, liczniki (pozycje, serie, działy — **odmiana**: 2–4 działy, 5+ działów), kolaż 3 zdjęć (`hero`) na studio.
2. Działy z licznikami → karty serii (zdjęcie, klasa: Podstawowa/Biznes/Biznes+/Premium/Pro, dla kogo, liczba) — klik filtruje siatkę; ponowny klik zdejmuje filtr. **Działy:** Lenovo — Laptopy · Komputery · Stacje robocze · Monitory · Sale spotkań; Dell — Laptopy · Komputery · Stacje robocze · Monitory · **Akcesoria** (Stacje dokujące, Wideokonferencje) · Serwery. Monitory Dell mają serię **Dell Plus**; Dell Pro Tower/Slim Essential należy do **Dell Pro Desktop** (nie do laptopów Essential).
   Siatka kart serii: ≤ 6 serii → wszystkie w jednym rzędzie (min. 3 kolumny), > 6 → `ceil(n/2)` kolumn (Lenovo Laptopy: 5 + 4). Plakietka klasy nie nachodzi na zdjęcie (zdjęcie maks. `100% − 96px`). Seria bez zdjęcia (np. ThinkCentre M, ThinkStation do czasu zdjęć) → ikona działu w kafelku, nie zdjęcie innej serii.
3. Siatka produktów (karta: marka · seria, nazwa, korzyść, 3 cechy, znaczek „film”).
4. Porównanie serii (tabela) — wiersz wybranej serii podświetlony.
5. Dobór w 3 pytaniach → reguły z `wizRules` (pierwsza pasująca, ostatnia = domyślna) → seria + 2 produkty; dopisek „to podpowiedź”.
6. Film serii (z `wideo-k31.json → serie`; brak filmu → sekcja znika), usługi (6 kafli), pas CTA „Kilka stanowisk naraz?”.
Kategoria `/katalog/komp/laptopy` (wzorzec `Web-Kategoria-1440`): hero ciemny z chipami podkategorii, **filtr serii** (chipy z licznikami), filtry marki i „Do czego”, karta „Nie wiesz, który?” → dobór w salonie, karty z cechami i znaczkiem filmu. Nowe podkategorie: `stacje-robocze` (komp), `wideokonferencje` (av).

## 6. Plan Twojej firmy 2.0 — wzorzec `Web-Plan-1440`, `Web-Plan-punkt-1440`, `Web-Plan-bilety-1440`, `Main-1440` (sekcja planu), `App-Plan-390`, `App-Plan-punkt-390`, `App-Plan-apteka-390`
Zastępuje B7b z K3. Dane: `plansze-k31.json`. Strona `/plan-firmy` + **ta sama komponenta na stronie głównej** (wszystkie 12 scen, wyrównana do siatki strony głównej, bez okruszków i bez własnego nagłówka/stopki; w wizualizacji: `Main.dc.html` pokazuje plan w ramce `Plan-osadz.dc.html` (widok planu ze `Strona.dc.html`, `osadz="true"`); w kodzie to zwykły komponent, bez ramki).
- Wybór sceny: siatka 6×2 kafli (ikona, nazwa, liczba punktów); telefon: przewijane chipy z ikoną, przyklejone.
- Rzut: SVG z pliku (inline, style z `fp.css` przepisane na tokeny i tryb ciemny), punkty = kółka ze **zdjęciem produktu** + numer; hover = podpis; aktywny punkt powiększony z pulsującym pierścieniem (bez pulsu przy `prefers-reduced-motion`), pozostałe przygaszone.
- **Obok rzutu lista „Na tym planie”** (numer, miniatura studio, etykieta, opis, znaczek „film”; aktywna pozycja obrysowana).
- **Klik w urządzenie → popup (modal, max 1240 px)**: pasek „rola w lokalu · 3 z 19 · ‹ › ×”; **po lewej film** (fasada §7; brak filmu → duże zdjęcie na studio), **po prawej szczegóły**: marka, nazwa, korzyść, 3 cechy, 4 parametry (skrócone), „Dodaj do zapytania” (notatka „Plan: <scena>”), „Zobacz produkt”, „Następne na planie: <nazwa> →”. Zamknięcie: ×, tło, Esc; ←/→; fokus uwięziony i wraca do punktu. Zmiana urządzenia zatrzymuje film.
- Telefon: rzut 720 px w poziomym przewijaniu („Przesuń plan palcem →”), lista punktów pod spodem, punkt → **arkusz od dołu: film na górze, szczegóły pod filmem** (treść z marginesem 16 px), ‹ ›.
- Pod planem: „Dodaj cały plan do zapytania · N poz.” + „Gotowe zestawy: <scena>”.
- Punkt z kartą ukrytą/usuniętą znika automatycznie. Kiosk Sunmi K2 nie jest na planszach do decyzji (GoKiosk).

## 7. Filmy — zasady
- Tylko z `wideo-k31.json` (oficjalne kanały producentów, sprawdzone oEmbed 25.10.2026). Brak filmu = sekcja się nie renderuje (w planszy: zdjęcie).
- **Fasada**: plakat (zdjęcie produktu na ciemnym tle + tytuł, kanał, język, ▶); iframe `https://www.youtube-nocookie.com/embed/<id>?autoplay=1&rel=0&playsinline=1` dopiero po kliknięciu. Bez skryptów YouTube przy wejściu na stronę.
- Polityka cookies: dopisać YouTube (odtwarzanie na żądanie użytkownika).
- Cron raz w tygodniu: oEmbed dla każdego `youtube_id`; 404/401 → `videos[].active = false` + mail do admina.
- `Products.videos[]` {`youtube_id`, `title`, `channel`, `lang`, `match`: model|seria|marka, `active`} edytowalne w panelu.

## 8. GoPOS 2.0 (`/gopos`) — wzorzec `Web-GoPOS-1440`, `App-GoPOS-390`
**Hero 2.0 (§13.1)** z wbudowanymi 4 krokami „Jedno zamówienie” → **konfigurator pakietu** (GoPOS zawsze; „Zapytaj o ten pakiet” dodaje moduły z notatką „Pakiet GoPOS”) → sprzęt pod GoPOS (8 kart) → filmy GoPOS (5, po polsku) → zestawy gastronomii → **wdrożenie w 5 krokach (numery w kółkach widoczne — biały numer na kolorze akcentu)** → FAQ (+ karta „Hotel z restauracją?”) → pas CTA. Bez liczb niepotwierdzonych w kartach.

## 9. InsERT 2.0 (`/insert`) — wzorzec `Web-InsERT-1440`, `App-InsERT-390`
Hero z „orbitą” programów → **„Który Subiekt dla mnie?”** (3 pytania → reguły) → porównanie Subiekt 123 / GT / nexo → rodzina programów (9 kart) → **KSeF** (oś czasu: 1.02.2026, 1.04.2026, 1.01.2027; pod osią publiczny podpis „Źródło: ksef.podatki.gov.pl · stan na <data sprawdzenia>”; notatka „sprawdzić przed publikacją” tylko w panelu, nigdy na stronie; 6 kroków, CTA) → **InsPunkty (§13.2)** → wdrożenie (6 kafli) → filmy (5) → FAQ.

## 10. Telefon (dopisek do M1) — pełna specyfikacja: `MOBILE-APLIKACJA.md`
Ekrany K3.1 według `k31/screens/App-*-390`: produkt, salon marki, plan (przewijany rzut + arkusz z filmem), GoPOS, InsERT; w menu GoPOS/InsERT otwierają strony w aplikacji.
- Ciemne karty hero (Start, Plan na Start) — poświaty zamiast siatki.
- Teksty z liczbą w przyciskach i polach składać w całości w kodzie (np. „Szukaj w 266 pozycjach”, „Pokaż 39 pozycji”, „Wyślij zapytanie · 2 poz.”, „Zapytaj o ten zestaw · 10 poz.”, „Dodaj cały plan do zapytania · 17 poz.”) — w elementach `flex` z `gap` osobne węzły tekstu dostają odstęp.
- Liczebniki z odmianą: 1 pozycja / 2–4 pozycje / 5+ pozycji (12–14 → pozycji).
- „Marki w ofercie” → link „Wszystkie <N>” do Oferty (nie do jednej marki).
- Liczba pozycji katalogu zawsze z bazy (w wizualizacji 266 widocznych), nigdy wpisana na sztywno.

## 11. Poprawki po przeglądzie całości (25.10, wizualizacja v122)
1. Bento 5 kafli zamiast 6, skracanie wartości bez „…” (§4.3).
2. Zastępnik zdjęcia we wszystkich listach i w galerii (§4.10).
3. Źródła: etykiety z adresu, host+ścieżka, ukrywanie sekcji bez źródeł (§4.9).
4. **Stopka (wszystkie strony)** — zostaje stopka v20 (B3; wzorzec `boards/Main.dc.html` v20) z jedną zmianą: kolumna „Oferta” = Cały katalog · Gotowe zestawy · Plan Twojej firmy · Salon Lenovo · Salon Dell; „Najważniejsze” = Opieka IT · GoPOS · InsERT i KSeF · KSeF 2027 · Dobierz zestaw w 60 s; „Branże i firma” bez zmian; „Kontakt”: 889 003 889 (oferty i serwis), WhatsApp, 18 267 65 11, **biznes@pro-kom.eu** (jeden adres na całej stronie), Kontakt i dojazd; pod znakiem adres w Rabce i godziny + 3 plakietki partnerów; pas dolny: © · NIP · „Oferta skierowana do przedsiębiorców i instytucji” · Mapa strony · Polityka prywatności · Cookies · Dostępność. Linki do usług ze statusem „do akceptacji szefa” (np. Bezpłatny przegląd IT) ukryte. Na Biznesie **tylko adres w Rabce** (bez Zakopanego). Wzorzec v122: stopka w `Web-*-1440`.
5. Salony: dział Akcesoria (Dell), seria Dell Plus, Tower/Slim Essential → Dell Pro Desktop, ThinkCentre M bez pożyczonego zdjęcia, siatka serii bez osieroconych kart, odmiana „działów” (§5).
6. Strona główna: sekcja planu = komponent Plan 2.0 (12 scen) zamiast starego planu v20; karty „Najczęściej wybierane” na studio; liczniki katalogu z bazy (było na sztywno „225 pozycji, 30 marek”; stan danych: 266 widocznych pozycji, 31 marek ze stroną).
7. GoPOS: widoczne numery kroków wdrożenia.
8. InsERT: publiczny podpis źródła KSeF bez notatek roboczych.
9. Telefon: bez siatek, składane teksty z liczbami, odmiana, link „Wszystkie” przy markach, margines treści w arkuszu punktu planu (§10).

## 12. Do potwierdzenia przed publikacją (pełna lista produkcyjna: `AUDYT-PRODUKCJA.md`) (lista także w `K31-przeglad.xlsx` u Krystiana)
- 6 nowych kart `do-sprawdzenia`: ThinkBook 14 2-in-1 G6 (porty), ThinkVision M (M16), ThinkSmart Core Gen 2 (dostępność w PL), Dell Pro Rugged (brak IP/MIL-STD na stronie modelu), Dell Pro Max Micro/Tower T2 (dostępność), monitory Dell Plus (warianty PL).
- Zdjęcia 2 kart: ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2 (adresy w `zdjecia-do-pobrania-k31.json`). Do przejrzenia: ThinkPad X9 ma zdjęcia X9 15p, P3 Tower Gen 2 / P4 — zdjęcia P4, monitory Dell Plus — tylko widoki z tyłu i z boku.
- Filmy: pozycje bez filmu (lista w xlsx) — uzupełniać w panelu; słabsze dopasowania (seria/marka, po angielsku, Lenovo Brasil/ID, Dibal po hiszpańsku) — zostawić albo usunąć.
- Oś KSeF (§9) i fakty GoPOS — w dniu publikacji z aktualnymi źródłami.
- Strona główna (z v20, decyzja szefa): plakietki „ulga do 700 zł” i „0 zł przez 12 mies.” przy terminalu oraz wpis „Terminal za 0 zł z Polskiej Bezgotówkowej” — potwierdzić aktualność programów i zgodność z zasadą „bez cen”.
- Kontakt: dane firmy z panelu (global `Company`) — na Biznesie tylko Rabka-Zdrój, ul. Orkana 16B, pn–pt 9:00–17:00 (§13.4).


## 13. Runda v124 (25.10, po uwagach Krystiana)
### 13.1 GoPOS — hero 2.0 (`Web-GoPOS-1440`, `App-GoPOS-390`)
- Ciemna scena bez kafelków: urządzenia (wycięte zdjęcia, `drop-shadow`) ustawione jak na ladzie — Sunmi D3 PRO (kasa i raporty), ekran kuchni FLEX 3 KDS z tyłu, Sunmi V3 MIX (sala) i terminal PolCard (płatność) z przodu; ciepła poświata „restauracji” (`rgba(255,163,77,.2)`) + podłoga.
- Lewa kolumna: logo + pigułka „Autoryzowany partner GoPOS · Podhale i Małopolska”, H1 „Sala, kuchnia i dowozy. **Jeden system.**” (drugi wiersz gradientem `#FFD9AE → #FF8E4D`), lead, 2 przyciski (Umów prezentację = dodaje pakiet do zapytania; Złóż swój pakiet = kotwica), 4 fakty z ikonami (offline; GoHub: Pyszne.pl, Glovo, Uber Eats, Wolt, Bolt Food; KSeF; GoPOS Now).
- Na scenie: etykiety urządzeń z numerem kroku, „bilecik” zamówienia (stolik → status Przyjęte/Kuchnia/Gotowe/Zapłacone), karta „GoPOS Now · utarg dziś” (słupki bez kwot), przycisk „Zobacz GoPOS w akcji” (kotwica do filmów).
- Dół hero: pasek 4 kroków (Sala → Kuchnia → Płatność → Raport). Kliknięcie kroku lub urządzenia podświetla urządzenie, przygasza resztę (`opacity .38`) i przesuwa status bilecika. Osobna sekcja „Jedno zamówienie” usunięta (jest w hero).
- Telefon: ta sama scena bez etykiet i bilecika, przyciski „Umów prezentację” + „Film”, kroki w siatce 2×2, fakty jako 4 kafle pod hero.
- Dane: `strony-gopos-insert-k31.json → gopos.hero` (teksty, fakty, pozycje urządzeń desktop/telefon, mapowanie urządzenie → krok).

### 13.2 InsERT — sekcja InsPunkty (`#inspunkty`, `Web-InsERT-1440`, `App-InsERT-390`)
- Nazwa: **InsPunkty** (Portfel InsERT) — nie „inCoiny”. Źródło: insert.com.pl, „InsPunkty a KSeF” (stan 25.10.2026).
- Fakty: od 1.04.2026 1 InsPunkt za wysłanie i 1 za pobranie e-faktury w KSeF (Subiekt, Rachmistrz, Rewizor); 100 InsPunktów z każdym kupionym Abonamentem; Subiekt 123 kupiony przez firmę — bez InsPunktów (limit dokumentów); biuro rachunkowe — własny Portfel; to opłata InsERT, nie państwowa.
- Układ: lewa karta „Jak to działa” (5 kroków na osi), prawa ciemna „Policz w 10 sekund”: presety (Mała firma usługowa 15+10, Sklep 40+30, Hurtownia 250+120), dwa liczniki ± 5 (faktury sprzedaży wysyłane / zakupu pobierane w miesiącu), wynik miesięcznie i rocznie z odmianą (1 InsPunkt / 2–4 InsPunkty / 5+ InsPunktów), pasek „pula z Abonamentu 100 vs zużycie roczne”, zdanie „100 InsPunktów z Abonamentu wystarczy na ok. X miesiąca”, CTA „Zapytaj o paczkę InsPunktów” (dodaje kartę `insert-inspunkty-ksef` z notatką „InsPunkty: N / mies.”) + link do karty. Pod spodem 3 notatki i podpis źródła. **Bez cen paczek.**
- Dane: `insert.insp` w `strony-gopos-insert-k31.json`.

### 13.3 Strona główna — „Najczęściej wybierane” (8)
Posnet Ergo Online, Elzab K10 Online, Sunmi D3 PRO, Lenovo ThinkBook 14 G8/G9, Lenovo ThinkCentre neo 50s/55s, terminal PolCard, Posnet Thermal HX Online, InsERT Subiekt nexo (`strona-glowna-k31.json`; ta sama lista w aplikacji na Start). Lista w panelu (`HomePage.featured`), karty z bazy. W wizualizacji usunięto też stare zbiorcze pozycje v20 („Konica Minolta bizhub C301i / C451i / C551i”, „Urządzenia wielofunkcyjne Kyocera”) — w katalogu bizhuby są osobnymi kartami (C251i, C301i, C3301i, C3321i, C3351i, C268i, 4051i, 4221i, 5021i), a na stronie głównej i w wyszukiwarce pokazujemy wyłącznie prawdziwe karty z bazy (żadnych „wirtualnych” pozycji zbiorczych).

### 13.4 O firmie 2.0 i Kontakt 2.0 (`Web-OFirmie-1440`, `Web-Kontakt-1440`, `App-Kontakt-390`)
- **O firmie** `/o-firmie`: hero (pigułka „PRO-KOM Tadeusz Wójciak · Rabka-Zdrój, od 2004”, H1 „22 lata na Podhalu. Ten sam adres i numer.”, scena z produktami z oferty + 3 plakietki: od 2004 / serwis Posnet i Elzab / partner GoPOS i InsERT) → pas 4 liczb (2004, 100+, 2 autoryzacje, 4 linie) → 8 zasad (karty z numerem i ikoną) → Rodzina PRO-KOM (4 linie, Biznes wyróżniony „jesteś tutaj”) → Autoryzacje i partnerzy (3 wiersze: autoryzowany serwis, autoryzowany partner, partnerzy handlowi — tylko marki z katalogu) → „Gdzie nas znaleźć” + mapa dojazdu → pas CTA.
- **Kontakt** `/kontakt`: hero z kartą adresu i godzin („Wyznacz trasę” → Google Maps) i 4 kafle kontaktu (główny biały: 889 003 889; WhatsApp; 18 267 65 11; biznes@pro-kom.eu) → „Z czym dzwonisz?” (awaria / nowa firma → kreator / przegląd kasy → formularz) → formularz (tematy jako chipy, imię, telefon, firma i miejscowość, wiadomość, informacja RODO z linkiem do polityki; przycisk „Wyślij · N tematy”) → dojazd z mapą, godziny, dane firmy, NIP → FAQ + karta „Masz listę pozycji z katalogu?”.
- **Mapa dojazdu** `<ServiceAreaMap>`: SVG (viewBox 640×420), Rabka w środku, 9 miejscowości z liniami przerywanymi, etykiety jako HTML w procentach (nie `<text>` w SVG), pasek „Dojeżdżamy na całe Podhale i Małopolskę” + „Wyznacz trasę”. Dane: `firma-k31.json`.
- Telefon: ekran Kontakt = kontakt + dojazd + skrót „O firmie” (liczby, 4 zasady, logotypy autoryzacji) + FAQ.
- Zasady treści: tylko adres w Rabce; jeden e-mail **biznes@pro-kom.eu**; bez obietnic czasu („oddzwonimy w 60 minut” usunięte — czas reakcji tylko z umowy opieki IT); bez „w cenie”; bez cytatów, których szef nie zatwierdził. Plansze v20 `OFirmie` i `Kontakt` = historia.

### 13.5 Karty wielomodelowe — kiedy łączymy, kiedy rozdzielamy
**Reguła łączenia (jedna karta + wybór wersji):** ten sam projekt / karta katalogowa producenta, a wersje różnią się rozmiarem, przekątną, prędkością, pojemnością, łącznością (przewód/bez), generacją sprzedawaną równolegle albo edycją licencji. Tak klient wybiera („który rozmiar?”), a my nie mnożymy prawie identycznych stron.
**Reguła rozdzielania:** inna klasa lub segment (Yoga Pro 7 vs Pro 9, ThinkStation P3 vs P4), inna forma (laptop vs 2 w 1), inny typ produktu (dyski vs obudowy), dwie generacje w jednej karcie (Avtek TS 9 i 8.1), produkty niezwiązane poza nazwą serii (UltraSharp 32 OLED i 52 6K), albo gdy mniej niż połowa parametrów jest wspólna.
**Wynik przeglądu 210 kart wielomodelowych** (arkusz „Karty wielomodelowe” w `K31-przeglad.xlsx`): **6 do rozdzielenia** (→ 12 kart, `karty-podzial-k31.json`: przypisanie wersji, klucz modelu, 301 ze starego adresu, status `do-sprawdzenia` do akceptacji), **49 zostaje z krótkim H1**, 155 zostaje bez zmian. Bizhuby i Kyocera — zostają jak są (osobne karty / rodziny tej samej platformy).
**Jak pokazujemy kartę wielomodelową:**
- H1 = nazwa krótka (`krotka`), gdy pełna nazwa > 62 znaki; pełna lista modeli pod H1 jako chipy „W tej karcie” (link do wyboru wersji; `?wersja=<model>` ustawia konfigurator).
- SEO: `<title>` = nazwa krótka + 2–3 najważniejsze modele; dane strukturalne **`ProductGroup`** (`variesBy`, `hasVariant` → `Product` z `name`, `mpn`/`sku` = kod modelu, `url` z `?wersja=`); canonical na adres karty (bez duplikatów stron wersji); każdy kod modelu w indeksie wyszukiwarki i w aliasach (`Products.aliases`), żeby „U2724D” albo „C301i” znajdował właściwą kartę; w sitemapie tylko karta.
- Gdy jakiś model zacznie mieć osobny popyt (zapytania, wyszukiwania) — rozdzielamy według reguły wyżej, ze starego `?wersja=` robimy 301 na nową kartę.
- `short()` (nazwa krótka) musi obsługiwać zagnieżdżone nawiasy, np. „TS-464U(-RP)”.

### 13.6 Treści kart — audyt i uzupełnienia
- Sprawdzone wszystkie 266 widocznych kart: opis (3 akapity, długość, konkret), korzyść, cechy, parametry (liczba, wartości, kluczowe pola dla typu: laptop — procesor, RAM, dysk, ekran, porty, łączność, waga, bateria, system; monitor — przekątna, rozdzielczość, złącza, regulacja, jasność; kasa/drukarka — PLU, papier, zasilanie, CRK), wybór wersji, FAQ, źródła, zakazane słowa.
- Wynik przed: 131 kart z mniej niż 3 FAQ (113 bez FAQ — głównie Lenovo/Dell, serwery, drukarki wielofunkcyjne, ekrany), 23 karty z za krótkim opisem lub akapitem (m.in. bizhuby, Kyocera), brak parametru „Procesor” w ThinkBook 14/16, brak „System” w 24 laptopach, brak jasności w 3 kartach ThinkVision, brak wagi XPS 16, sprzeczność obiektyw/bez obiektywu w projektorach instalacyjnych Sharp/NEC.
- Uzupełnione (`tresci-uzupelnienia-k31.json`): **każda karta ma co najmniej 3 FAQ** (nowe pytania praktyczne, pod konkretny produkt), 24 nowe opisy, „Procesor”/„System” z danych konfiguratora, jasność ThinkVision z PSREF, waga XPS 16 ze specyfikacji Dell, ujednolicony opis Sharp/NEC. Zasada: nowe teksty tylko z faktów karty — każda liczba sprawdzona skryptem względem danych karty.
- Zostaje świadomie: usługi i moduły programów mają mniej parametrów i mało liczb (to nie sprzęt); 6 naszych usług bez źródeł producenta.
- Import (K31a): `faq` dopisuj do istniejących, `opis` zastępuje, `parametry_dodaj` wstaw przed kluczem `przed` (gdy brak — na koniec), `zrodla_dodaj` dopisz.

### 13.7 Konfigurator 2.0 (wybór wersji) — `Web-Produkt-1440`, `App-Produkt-caly-390`
Cel: klient bez wiedzy technicznej wie, co wybiera, i może nie wybierać wszystkiego.
- Nad opcjami 3 kroki: „Zacznij od gotowej konfiguracji albo wybieraj po kolei” · „Czego nie wiesz — kliknij »Doradźcie«” · „Dodaj do zapytania — wycenę dostaniesz na piśmie”. Lead kończy się zdaniem „Nie musisz znać wszystkich parametrów.”
- **Gotowe konfiguracje** (najczęściej wybierane): kliknięcie **wypełnia pasujące opcje** (dopasowanie wartości opcji do opisu konfiguracji) i oznacza kartę „✓ wybrana”; drugie kliknięcie czyści.
- Każda opcja: numer, nazwa, **jedno zdanie wyjaśnienia** zwykłym językiem (słownik `konf_help`: procesor, RAM, dysk, ekran, system, gwarancja, karta graficzna, LTE, łączność z CRK, przekątna, wersja/model, licencja, stanowiska, montaż), wartości, chip **„Doradźcie”** (przerywana ramka), podpowiedź producenta jako „Podpowiedź: …”. Wartości dłuższe niż 40 znaków — jako pełne wiersze (radio), krótkie — chipy z zawijaniem (także na telefonie, bez przewijania w bok).
- **Nic nie jest ukrywane:** wcześniej opcje z wartościami > 64 znaki znikały (np. „Generacja i platforma” w ThinkBook, której dotyczył opis). Teraz pokazujemy wszystkie opcje z ≥ 2 wartościami; opcje z 1 wartością → pasek „W każdej wersji: …”.
- Podsumowanie: pasek postępu „Wybrano X z N · resztę możemy dobrać za Ciebie”, wiersze: wartość / „doradźcie” / „do wyboru” (wyszarzone), gotowa konfiguracja jako pierwszy wiersz, „Dodaj do zapytania”, „Wyczyść wybór”.
- Notatka w zapytaniu: „Wersja: <gotowa konfiguracja> · Procesor: … · Ekran: doradźcie · …” (nazwa opcji + wartość — handlowiec widzi, czego klient nie wybrał).
- Liczby: 209 kart z konfiguratorem, 167 opcji w układzie wierszowym, 125 parametrów „w każdej wersji”.

### 13.8 Telefon — komplet ekranów (v126)
Dodane ekrany aplikacji dla stron, które miały tylko wzorzec desktop: **O firmie, Opieka IT, branża (gastronomia), kreator (krok i wynik = gotowy zestaw), aktualności, wpis**; produkt na telefonie z krótkim H1 i chipami „W tej karcie”; menu prowadzi do tych ekranów. Prototyp ma płynną szerokość 360–430 px; test 29 ekranów × 360/390/414 px: 0 poziomego przewijania, cele dotykowe poprawione (przyciski ≥ 40–44 px, linki ≥ 24 px). Wszystko opisane w `MOBILE-APLIKACJA.md` (ma pierwszeństwo w sprawach telefonu).
