# prokombiznes.pl — przekazanie K3.1 (produkt 2.0, salony Lenovo/Dell, plan z filmami, GoPOS/InsERT 2.0), 25.10.2026 — wersja po przeglądzie (v126)

> Krystian: zacznij od `START-TUTAJ.md` (zalecana ścieżka skrócona: 12 sesji, §3) i przeczytaj `AUDYT-PRODUKCJA.md` (krok po kroku: co rozpakować, w jakiej kolejności, co sprawdzić po każdej sesji).

Paczka K3.1 **uzupełnia** K3 — najpierw wgrywa się i buduje K3 (`PRZEKAZANIE-K3.md`), potem K3.1. Specyfikacja: `docs/design/prokombiznes/K31-ZMIANY.md` (przeczytaj w całości przed każdą sesją K3.1).

## 1. Zawartość (`prokombiznes-k31.zip` + `prokombiznes-k31-plansze.zip`, oba rozpakować w katalogu głównym repo)
| Ścieżka | Co |
|---|---|
| `docs/design/prokombiznes/PRZEKAZANIE-K31.md` | ten plik |
| `docs/design/prokombiznes/K31-ZMIANY.md` | specyfikacja K3.1 |
| `docs/design/prokombiznes/START-TUTAJ.md` | instrukcja krok po kroku dla Krystiana (K3 + K3.1) |
| `docs/design/prokombiznes/AUDYT-K31.md` | audyt całości 25.10: co mamy, co się zgadza, czego brakuje |
| `docs/design/prokombiznes/AUDYT-PRODUKCJA.md` | audyt gotowości do produkcji: blokery, strony prawne, analityka, obsługa zapytań, lista kontrolna, prompt sesji **PROD** |
| `docs/design/prokombiznes/k31/screens/` | 46 zrzutów: `Web-*-1440.webp` (16 — w tym O firmie i Kontakt 2.0), `Main-1440.webp` (strona główna) i `App-*-390.webp` (29 ekranów telefonu — w tym O firmie, Opieka IT, branża, kreator ×2, aktualności, wpis) |
| `docs/design/prokombiznes/MOBILE-APLIKACJA.md`, `INDEKS.md` | specyfikacja telefonu jak aplikacji (pierwszeństwo w sprawach telefonu) i spis materiałów z kolejnością ważności |
| `docs/design/prokombiznes/k31/boards/` | plansze `.dc.html` (w tym `Main.dc.html`) + `media/` + `_blob/` + `support.js` (podgląd lokalny, jak K3 §4) |
| `seed/prokombiznes/k31/` | `katalog-k31-nowe.json` (26 kart), `marki-salony-k31.json`, `plansze-k31.json` + `plansze-svg/` (12 SVG + `fp.css`), `wideo-k31.json`, `strony-gopos-insert-k31.json`, `zdjecia-do-pobrania-k31.json`, `media/produkty/<slug>/` (91 zdjęć, 24 karty) + `media-k31.json` |

Nie wgrywać: `K31-przeglad.xlsx` (u Krystiana).

## 2. Co zastępuje
| Było | Teraz |
|---|---|
| `k3/screens/Web-Produkt*`, `Web-Kategoria`, `Web-Marka`, `App-Produkt*`, `App-Plan*`, `App-Marka` | odpowiedniki w `k31/screens/` |
| B7b (K3) — rzuty z Main + `plansze-k3.json` | **K31d** — `plansze-k31.json` (12 scen, panel z filmem) |
| `boards/Gopos.dc.html`, `boards/Insert.dc.html` (v20) | **K31e** wg `k31/screens/Web-GoPOS`, `Web-InsERT` |
| siatka za zdjęciami (`linear-gradient` w kratkę) | tło „studio” (`K31-ZMIANY.md` §3) |
| sekcja planu w `boards/Main.dc.html` v20 (8 scen, siatka) | komponent Plan 2.0 na głównej (`k31/screens/Main-1440`, K31d) |
| stopka v20 | nowa stopka (`K31-ZMIANY.md` §11.4, K31b) |

## 3. Kolejność w repo
**Zalecana ścieżka skrócona (START-TUTAJ §3):** W (W-K3 + W-K31) → KD (KD + KD31) → K3a → K31a → K31b (produkt 2.0 jako pierwsza wersja strony produktu po K3) → K3b′ (marki, kategorie, wyszukiwarka — bez produktu) → K31c → K3c → K31d → K31e → M1 → **PROD** (`AUDYT-PRODUKCJA.md` §9) → staging. Pełna ścieżka poniżej też działa.

1. … K3: W-K3 → KD → K3a → K3b → K3c (bez B7b z K3).
2. **W-K31** — wgranie paczki K3.1 (bez kodu).
3. **KD31** — dokumenty (spec, ADR-012, plan sesji, STAN).
4. **K31a** — dane: 26 kart, serie, filmy, salony, strony GoPOS/InsERT (import, bez UI).
5. **K31b** — produkt 2.0 + `<ProductStage>` (studio) w całym serwisie.
6. **K31c** — salony Lenovo/Dell + kategoria z seriami.
7. **K31d** — Plan Twojej firmy 2.0 (zamiast B7b).
8. **K31e** — GoPOS i InsERT 2.0.
9. **M1** (telefon) — z dopiskiem K3.1 (ekrany `k31/screens/App-*`).
10. Staging: formularze, maile, Lighthouse, oEmbed filmów, tryb ciemny → akceptacja szefa → produkcja.

Jedna sesja = jedna gałąź = jeden PR. Każda sesja: plan maks. 15 linii, czekaj na „ok”; na koniec zrzuty Playwright porównane z `k31/screens/`, `/przeglad`, `/koniec-sesji`, `/pr`.

## 4. Prompty

### W-K31
```
/zadanie W-K31 — wgranie paczki K3.1 (bez kodu)
Gałąź docs/prokombiznes-k31 z develop. Rozpakowałem prokombiznes-k31.zip i prokombiznes-k31-plansze.zip w katalogu głównym.
1. Sprawdź: docs/design/prokombiznes/PRZEKAZANIE-K31.md, K31-ZMIANY.md, k31/screens (35), k31/boards (+media, support.js), seed/prokombiznes/k31/*.json, plansze-svg (12 SVG + fp.css).
2. JSON: każdy plik się wczytuje; katalog-k31-nowe.json = 26 kart; slugi nie kolidują z K3; w polach publicznych brak kwot „zł”, „w cenie”, „gratis”, Novitus, Honeywell, Verifone, Datalogic; wypisz wynik.
3. Commit „docs: paczka K3.1 prokombiznes (produkt 2.0, salony, plan z filmami, GoPOS/InsERT)”, PR do develop z listą plików i wynikiem kontroli.
Bez zmian w src/. Plan maks. 10 linii, czekaj na „ok”.
```

### KD31
```
/zadanie KD31 — K3.1 w dokumentacji (K31-ZMIANY.md)
Tylko .md, zero zmian w src/.
1. docs/strony/prokombiznes.md: §6.2 produkt → „Produkt 2.0” wg K31-ZMIANY §4; strony marek → „Salon marki” (§5) dla marek z showroom; Plan Twojej firmy → 2.0 (§6, strona /plan-firmy + sekcja na głównej); GoPOS i InsERT → 2.0 (§8–9); zasada tła „studio” (§3) i filmów (§7). W nagłówkach sekcji „źródło: K31-ZMIANY.md”.
2. ADR-012 — „Zmiany K3.1”: Products.series, Products.videos[] {youtube_id,title,channel,lang,match,active}, Brands.showroom (działy, serie, wizard, usługi, hero), FloorPlans 2.0 (12 scen, svg, punkty), globals GoposPage/InsertPage; filmy: fasada + youtube-nocookie, cron oEmbed. Status: przyjęta.
3. docs/zadania/prokombiznes.md — sesje W-K31, KD31, K31a–K31e z kryteriami „Gotowe” z PRZEKAZANIE-K31 §4; B7b (K3) oznacz „zastąpione przez K31d”; dopisek do M1 (K31-ZMIANY §10 + MOBILE-APLIKACJA.md). W każdej sesji z UI dopisz kryterium: „telefon wg MOBILE-APLIKACJA.md §4 (0 poziomego przewijania przy 360/390/414, cele ≥ 44 px, zrzut 390 zgodny z App-*)”.
3a. docs/strony/prokombiznes.md: nowy rozdział „Telefon” = streszczenie MOBILE-APLIKACJA.md z odnośnikiem; strony O firmie i Kontakt → 2.0 (K31-ZMIANY §13.4), konfigurator 2.0 (§13.7), karty wielomodelowe (§13.5).
3b. CLAUDE.md (repo) — sekcja „prokombiznes.pl”: 3 linijki: „Wzorzec: docs/design/prokombiznes/INDEKS.md (kolejność ważności dokumentów). Telefon = osobny układ jak aplikacja (MOBILE-APLIKACJA.md), jego §4 to Definition of Done każdej sesji z UI. Zero cen, tylko Rabka, biznes@pro-kom.eu.”
4. Polityka cookies — dopisek o YouTube (odtwarzanie po kliknięciu), szkic do akceptacji.
5. docs/STAN.md — „Następne”: kolejność z PRZEKAZANIE-K31 §3.
Gotowe: PR z samymi .md, w opisie lista zmienionych sekcji.
```

### K31a — dane
```
/zadanie K31a — import K3.1 (K31-ZMIANY.md §1–2, §7)
1. seed:biznes --k31: katalog-k31-nowe.json jak karty K3 (te same mapowania pól; statusy; nowe podkategorie komp/stacje-robocze i av/wideokonferencje w Categories); galerie z media/produkty/<slug>/ i Media.source z media-k31.json (jak media-k3.json); 2 karty bez zdjęć → zastępnik.
2. Products.series z marki-salony-k31.json → seria_karty (wszystkie karty Lenovo/Dell); Brands.showroom z → salony (Lenovo, Dell).
3. Products.videos[] z wideo-k31.json → produkty; seria → Brands.showroom.videos; strony → globals. Cron oEmbed (raz w tygodniu): nieaktywne filmy → active=false + mail.
4. GoposPage / InsertPage z strony-gopos-insert-k31.json (moduły jako relacje do kart; teksty edytowalne).
5. FloorPlans: 12 scen z plansze-k31.json (svg jako plik/pole, punkty → relacja slug, zestawy → relacja Bundles); karty ukryte = punkty ukryte.
6. Lista dozwolonych domen źródeł (K31-ZMIANY §4 pkt 8) — filtr przy renderze `zrodla`.
7. (v124) Globals: Company + AboutPage + ContactPage z firma-k31.json, HomePage.featured z strona-glowna-k31.json (relacje do kart).
8. (v124) Podział kart wg karty-podzial-k31.json (K31-ZMIANY §13.5): nowe karty z treści karty źródłowej — parametry z prefiksem modelu („Pro 7: …; Pro 9: …”) dzielisz, wspólne kopiujesz, warianty i wartości konfiguratora wg „klucz_modelu”, opis i FAQ przepisujesz pod jeden model WYŁĄCZNIE z faktów karty źródłowej i jej źródeł producenta (nic nie dopisujesz z pamięci); status do-sprawdzenia; stare adresy → 301 (avtek-ts-9-mate-g zostaje pod tym samym adresem). Products.aliases = kody modeli z nazwy i wariantów (wyszukiwarka).
9. (v124) tresci-uzupelnienia-k31.json (K31-ZMIANY §13.6): faq dopisz, opis zastąp, parametry_dodaj wstaw przed „przed”, zrodla_dodaj dopisz; raport: każda widoczna karta ma ≥ 3 FAQ.
Gotowe: import 2× = te same liczby (269 kart z K3.1 / 266 widocznych przed podziałem; po podziale +11 nowych kart do-sprawdzenia i 5 przekierowań 301 — w raporcie, 122 produktów z filmem, 12 scen / 186 punktów, 0 punktów bez karty, każda karta Lenovo/Dell w dokładnie jednej serii: 44 + 34); test „zero cen” i zakazanych marek zielony; raport.
```

### K31b — produkt 2.0
```
/zadanie K31b — produkt 2.0 i tło „studio” (K31-ZMIANY.md §3, §4, §7)
Wzorzec: k31/screens/Web-Produkt-1440, Web-Produkt-ergo-1440, Web-Produkt-nowy-1440 (karta bez zdjęcia), Web-Produkt-ciemny-1440, App-Produkt-390, App-Produkt-caly-390, App-Produkt-ergo-390; wartości i stany: k31/boards/Strona.dc.html (widok produkt).
1. Komponent <ProductStage> (studio) i podmiana we WSZYSTKICH miejscach ze zdjęciem produktu (karty, galeria, miniatury, zestawy, wyszukiwarka, lista zapytania); usunąć siatki.
2. Strona produktu w kolejności §4: hero (galeria + miniatura Film, 3 wyróżniki z ikonami, Twoja wersja, CTA, pas usług), przyklejona nawigacja sekcji z mini-CTA, bento „W skrócie”, opis + panel, konfigurator z przyklejonym podsumowaniem, film (fasada, youtube-nocookie po kliknięciu), parametry, wersje, w zestawach, dobierz (karty wg mapy), z tej samej rodziny, FAQ, źródła (tylko domeny producentów), pas CTA.
3. JSON-LD: Product (bez offers), FAQPage (gotowe), VideoObject; dla kart z ≥ 2 wariantami ProductGroup (variesBy, hasVariant z name/mpn/url ?wersja=) — K31-ZMIANY §13.5.
3b. (v124) Konfigurator 2.0 (K31-ZMIANY §13.7): 3 kroki, gotowe konfiguracje wypełniają opcje, wyjaśnienie pod każdą opcją, chip „Doradźcie”, długie wartości jako wiersze, wszystkie opcje z ≥ 2 wartościami (nic nie ukrywamy), „W każdej wersji”, postęp „Wybrano X z N”, notatka „opcja: wartość”.
3a. (v124) Karta wielomodelowa: H1 = nazwa krótka, gdy pełna > 62 znaki; pod H1 chipy „W tej karcie” z modelami (klik → wybór wersji, ?wersja= ustawia konfigurator); <title> = nazwa krótka + 2–3 modele; canonical na kartę.
4. Bento 5 kafli i skracanie bez „…” (§4.3); zastępnik zdjęcia w galerii i we wszystkich listach (§4.10); źródła: dozwolone domeny, etykieta z adresu, sekcja znika bez źródeł (§4.9).
5. Stopka (§11.4): stopka v20 + linki K3.1, jeden e-mail biznes@, tylko adres w Rabce, ukryte linki do usług „do akceptacji szefa”.
Gotowe: zrzuty 1440/390 jasny/ciemny dla ThinkBook 14 G8/G9, Posnet Ergo, ThinkPad X9 (galeria 6 zdjęć) i ThinkPad P1 Gen 9 (bez zdjęcia → zastępnik) zgodne ze wzorcem; 0 pustych <img> w całym serwisie; brak żądań do youtube.com przed kliknięciem (test sieci); Lighthouse produkt ≥ 90 (telefon); axe bez błędów; e2e: wersja → dodaj → notatka w zapytaniu.
```

### K31c — salony marek
```
/zadanie K31c — salon marki Lenovo/Dell i kategoria z seriami (K31-ZMIANY.md §5)
Wzorzec: k31/screens/Web-Marka-1440, Web-Marka-Dell-1440, Web-Kategoria-1440, App-Marka-390, App-Marka-Dell-390, App-Kategoria-390.
1. /marki/[slug]: gdy Brands.showroom — salon (hero, działy, serie-filtry, siatka, porównanie, dobór w 3 pytaniach wg wizRules, film serii, usługi, CTA); inne marki bez zmian (K3 §6). Działy i serie wyłącznie z danych (Dell: Akcesoria, Dell Plus — §5); siatka serii bez osieroconych kart; seria bez zdjęcia → ikona działu.
2. /katalog/komp/{laptopy|komputery|stacje-robocze|monitory}: hero, chipy podkategorii, filtr serii z licznikami, filtry marka / „Do czego”, karta „Nie wiesz, który?” → #dobor w salonie, karty z cechami i znaczkiem „film”.
3. Adres filtra serii w query (?seria=thinkpad-t) z canonical bez parametru.
Gotowe: zrzuty zgodne ze wzorcem (jasny/ciemny); dobór: 3 kombinacje odpowiedzi dają oczekiwane serie (test jednostkowy reguł); axe bez błędów.
```

### K31d — Plan Twojej firmy 2.0
```
/zadanie K31d — Plan Twojej firmy 2.0 (K31-ZMIANY.md §6–7; zastępuje B7b z K3)
Wzorzec: k31/screens/Web-Plan-1440, Web-Plan-punkt-1440, Web-Plan-bilety-1440, App-Plan-390, App-Plan-punkt-390, App-Plan-apteka-390; SVG: seed/prokombiznes/k31/plansze-svg/*.svg + fp.css.
1. Komponent planu (strona /plan-firmy i ta sama komponenta jako sekcja na głównej — wszystkie 12 scen, wzorzec k31/screens/Main-1440; usuń stary plan v20 z głównej): kafle scen 6×2, rzut SVG inline (style z fp.css → tokeny + tryb ciemny; ładowany tylko aktywny), punkty ze zdjęciem i numerem, hover-podpis, aktywny punkt.
2. Lista „Na tym planie” obok rzutu; klik w urządzenie → popup (modal): film po lewej (fasada, iframe po kliknięciu), szczegóły po prawej (marka, nazwa, korzyść, cechy, 4 parametry, „Dodaj do zapytania” z notatką „Plan: <scena>”, „Zobacz produkt”, „Następne na planie”), ‹ › ×, Esc, ←/→, focus trap.
3. Telefon: chipy scen, rzut 720 px w poziomym przewijaniu, lista z miniaturami i znaczkiem „film”, popup od dołu: film na górze, szczegóły pod nim, ‹ ›.
4. „Dodaj cały plan do zapytania · N poz.”, zestawy sceny pod planem; prefers-reduced-motion bez pulsu.
5. Strona główna: karty „Najczęściej wybierane” na <ProductStage>, liczniki katalogu z bazy (bez „225 pozycji, 30 marek” na sztywno).
(v124) Na głównej sekcja „Najczęściej wybierane” = HomePage.featured (8 kart, K31-ZMIANY §13.3), karty z bazy na tle studio — żadnych pozycji zbiorczych spoza katalogu.
Gotowe: 12 scen = 186 punktów, każdy punkt z kartą i zdjęciem; zrzuty zgodne ze wzorcem (jasny/ciemny); e2e: punkt → film (iframe dopiero po kliknięciu) → dodaj; axe bez błędów.
```

### K31e — GoPOS, InsERT, O firmie i Kontakt 2.0
```
/zadanie K31e — strony GoPOS i InsERT 2.0 + O firmie i Kontakt 2.0 (K31-ZMIANY.md §8–9, §13.1, §13.2, §13.4)
Wzorzec: k31/screens/Web-GoPOS-1440, Web-InsERT-1440, Web-OFirmie-1440, Web-Kontakt-1440, App-GoPOS-390, App-InsERT-390, App-Kontakt-390; treści: GoposPage / InsertPage / AboutPage / ContactPage / Company (K31a).
1. /gopos: hero 2.0 (§13.1: scena urządzeń bez kafelków, bilecik, GoPOS Now, pasek 4 kroków w hero — krok ↔ urządzenie ↔ status; osobnej sekcji „Jedno zamówienie” nie ma), konfigurator pakietu (GoPOS stały + moduły; podsumowanie ze sprzętem; „Zapytaj o ten pakiet” → pozycje z notatką), sprzęt, filmy (lista + fasada), zestawy gastronomii, wdrożenie 5 kroków (widoczne numery), FAQ, CTA.
2. /insert: hero z orbitą programów, „Który Subiekt dla mnie?” (reguły z danych), porównanie 123/GT/nexo (tabela; telefon: karuzela kart), rodzina programów, KSeF (oś czasu, 6 kroków, CTA), sekcja InsPunkty #inspunkty (§13.2: 5 kroków + kalkulator z presetami i licznikami, odmiana „InsPunkt/-y/-ów”, bez cen), wdrożenie, filmy, FAQ.
2a. /o-firmie i /kontakt (§13.4; telefon: App-OFirmie-390, App-Kontakt-390): hero, liczby, 8 zasad, 4 linie, autoryzacje (tylko marki z katalogu), komponent <ServiceAreaMap> (etykiety HTML, nie <text>), formularz kontaktu z chipami tematów i informacją RODO (zapis jak zapytanie: status „nowe”, mail — wg PROD), FAQ; tylko adres w Rabce, jeden e-mail biznes@; telefon: ekran Kontakt z dojazdem i skrótem O firmie. Gdy sesja za duża — 2a jako osobna sesja K31f.
3. Teksty bez liczb niepotwierdzonych w kartach; oś KSeF z polem „sprawdzono” w panelu; na stronie tylko „Źródło: ksef.podatki.gov.pl · stan na <data>” (notatka `ksefSprawdzic` nie trafia na stronę).
Gotowe: zrzuty zgodne ze wzorcem (jasny/ciemny); e2e: pakiet GoPOS z 3 modułami → 3 pozycje w zapytaniu; klik w krok „Kuchnia” podświetla ekran KDS; kalkulator InsPunktów 40 + 30 → „70 InsPunktów” / „840 InsPunktów”; dobór Subiekta: 3 kombinacje → 123 / GT / nexo; formularz kontaktu zapisuje zgłoszenie; axe bez błędów.
```

### Dopisek do M1
```
Najpierw przeczytaj docs/design/prokombiznes/MOBILE-APLIKACJA.md — to pełna specyfikacja telefonu (szkielet, komponenty, 29 ekranów z wzorcem, wymagania i testy); ma pierwszeństwo przed tym dopiskiem. Nowe ekrany v126: O firmie, Opieka IT, branża, kreator (krok + wynik = gotowy zestaw), aktualności, wpis. Dodatkowo (K3.1): ekrany wg k31/screens/App-* — produkt 2.0, salon marki, plan z arkuszem filmu, GoPOS (hero 2.0), InsERT (z InsPunktami), Kontakt (z dojazdem i skrótem O firmie) (w menu otwierają strony); tło studio wszędzie; bez siatek na ciemnych kartach (poświaty); filmy tylko po dotknięciu (playsinline); teksty z liczbami składane w całości + odmiana liczebników; „Marki w ofercie → Wszystkie N” (K31-ZMIANY §10).
```

## 5. Przed produkcją (poza kodem)
- Zdjęcia 2 kart (`zdjecia-do-pobrania-k31.json`: ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2) — do `seed/prokombiznes/k31/media/produkty/<slug>/` i ponowny import.
- Filmy: uzupełnić w panelu pozycje bez filmu (lista w `K31-przeglad.xlsx`); zdecydować o słabszych dopasowaniach.
- 6 kart `do-sprawdzenia` z K3.1 — potwierdzić u dystrybutorów.
- Oś KSeF i fakty GoPOS — sprawdzić w dniu publikacji.
- Strona główna: plakietki 700 zł / 0 zł i wpis o terminalu za 0 zł — decyzja szefa (K31-ZMIANY §12).
- Adresy i godziny salonów, NIP — w panelu (Kontakt i stopka).
