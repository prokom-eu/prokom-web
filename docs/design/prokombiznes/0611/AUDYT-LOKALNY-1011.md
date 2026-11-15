# Audyt lokalny prokombiznes.pl — 10.11.2026

## Zakres
Sprawdzone na biznes.localhost:3000, w przeglądarce Krystiana, na wersji po #484 / #486 / #491:
- 533 adresy z `/mapa-strony` i `sitemap.xml`;
- rendering z leniwymi sekcjami w szerokości 1440;
- porównanie z wzorcem K4 v150 (`docs/design/prokombiznes/k4/screens/Web-*.webp`) i z danymi `seed/prokombiznes/k4/strony-k4.json`.

Telefon (390) nie był sprawdzany w tej rundzie.

## Werdykt w trzech zdaniach
1. **GoPOS, InsERT, Opieka IT, 20 salonów i karty produktów są zgodne z finalną wizualizacją K4 v150 sekcja po sekcji.** Wysokości stron mieszczą się w granicach ±5% wzorca. Salony po #486 wróciły do pełnej wersji.
2. Wrażenie „czegoś brakuje” ma trzy źródła:
   - część treści **wycięto decyzjami K4**: kalkulator przestoju, zestawy gastronomii na GoPOS, osobna sekcja przeglądu IT;
   - część danych jest **przygotowana w paczce, ale nigdzie niewyświetlana** (6 bloków danych);
   - kilka sekcji jest **jaśniejszych i płaskich zamiast premium**, jak we wzorcu (hero InsERT, KSeF na InsERT, „Na start” w Opiece IT).
3. **O firmie i Kontakt są wyraźnie uboższe niż wzorzec K4.** Wspólny szablon wszedł bez sekcji Biznesu: O firmie ma 2 264 znaki, Kontakt 2 603. To dziś największa luka.

## 1. GoPOS (`/gopos`) — 12 sekcji, 10 400 px (wzorzec 9 142 px)
Jest wszystko, co ma wzorzec:
- hero ze sceną i 4 krokami, liczby;
- „Ustawiony pod to, jak pracujesz”, „Cały lokal”, „5 aplikacji”;
- KSeF / offline / utarg, urządzenia, konfigurator modułów, liczby z lokali;
- filmy, wdrożenie w 5 krokach, integracje, FAQ (8), CTA.

Braki i szlif:
- **Zestawy gastronomii.** Dane `gopos.zes` (food truck, kawiarnia, bistro) są w paczce, kod ich nie używa. Zestawy są gotowe i opublikowane.
- **Kolejka zamówień GoHub.** `gopos.ord` (Glovo, Pyszne, Uber Eats, ze statusem i czasem) jest nieużyta, a sekcja „5 aplikacji” jest statyczna.
- Okładki filmów to ciemny prostokąt bez kadru. Wzorzec ma kadr z urządzeniem.

## 2. InsERT (`/insert`) — 10 sekcji, 9 160 px (wzorzec 7 849 px)
Treść jest zgodna z wzorcem (3 pytania, porównanie, KSeF, InsPunkty, programy, wdrożenie, komputer, filmy, FAQ). Szlif:
- **Hero.** Jest płaska siatka 8 kafli z pudełkami. Wzorzec ma kompozycję pudełek w przestrzeni („orbita”, dane `insert.orb` nieużyte). To najbardziej „tania” sekcja na stronie.
- **„Program jest gotowy, przygotujmy firmę”.** Jest jasna, a we wzorcu to granatowy pas premium z osią terminów.
- Okładka filmu bez pudełka nexo, jak w GoPOS.
- Nieużyte dane:
  - `insert.lines`: GT / nexo / nexo PRO / PRO+ z „dla kogo”;
  - `insert.eco`: vendero, Sello NX, InsERT mobile, POS dotykowy, e-Archiwizacja;
  - `insert.fam`.

## 3. Opieka IT (`/opieka-it`) — 8 sekcji, zgodna z wzorcem
Jest:
- hero z raportem przeglądu;
- 8 obszarów, „z opieką i bez”, 4 kroki z przełącznikiem;
- „dla kogo”, „Na start” + „Pilnujemy dat”, FAQ (8), „Ile masz stanowisk?”, CTA.

Szlif:
- **„Co porządkujemy w pierwszych tygodniach”.** Jest jasną kartą, a we wzorcu to granatowy panel z kafelkami 2×3.
- **„Ile masz stanowisk?”.** We wzorcu to karta obok FAQ, lokalnie osobna, pusta sekcja. Mniej premium i luka w rytmie.
- **Brak sekcji przeglądu IT.** Bezpłatny przegląd IT jest głównym CTA, ale nie ma sekcji „co sprawdzamy / co dostajesz”. Wolno ją mieć (K4-FINAL: „bezpłatny przegląd IT”), dane są w karcie `przeglad-it`.

## 4. O firmie (`/o-firmie`) — szablon wspólny bez slotów Biznesu
Jest:
- hero z wizytówką i 4 logo autoryzacji;
- liczby, „Dlaczego PRO-KOM” (6), krok po kroku (4);
- 5 linii, „Nie musisz wierzyć” (**2 karty z 4**), wizyta z mapą.

Brakuje względem K4 (`Web-o-firmie`):
- **„Marki, które sprzedajemy, wdrażamy i serwisujemy”:**
  - wiersze statusów: Autoryzowany serwis (Posnet, Elzab), Autoryzowany partner (GoPOS, InsERT), Partner (Optivendi), We współpracy (COMEX);
  - pod spodem „Pozostałe marki w ofercie” jako ściana logo z katalogu.
- **Karty weryfikacji.** Są 2 z 4: brak „Autoryzowany serwis Posnet i Elzab” i „Autoryzowany partner GoPOS / InsERT” z linkami do list producentów (puste linki w panelu → karta ukryta).
- **Pas „Opowiedz, jak pracuje Twoja firma”** (telefon + „Napisz do nas”) przed stopką.
- „5 linii PRO-KOM” powtarza pasek linii ze stopki 300 px niżej.

Liczba „100+ klientów” ma znacznik „do potwierdzenia przez szefa”. Na produkcji jest ukryta (flaga), ale decyzja szefa jest nadal otwarta.

## 5. Kontakt (`/kontakt`) — szablon wspólny
Jest:
- hero z telefonem i kartą salonu z mapą;
- 4 sprawy, formularz z chipami;
- zasięg z polem miejscowości, „Inna sprawa”.

Brakuje względem planu 0611 §8.2 i K4:
- **„Zanim zadzwonisz” (FAQ).** Był w planie §8.2, nie wszedł. Wzorzec: dojazd, kasa do serwisu, czas odpowiedzi, wycena bez wizyty.
- **Karta „Masz listę pozycji z katalogu?”** z licznikiem zapytania i przyciskiem do `/zapytanie`.
- **Formularz.** Formularz na stronie głównej (granatowa kolumna z mapą, ikony w polach) jest ładniejszy niż ten na Kontakcie. Kontakt powinien mieć wersję co najmniej tak dobrą.
- „Inna sprawa? Każda linia ma swój zespół.” to 3 karty + 1 sierota w drugim rzędzie. Do tego pasek linii w stopce zaraz pod spodem.
- Karta salonu: godziny jako 3 kafle (pn–pt / sob / nd). We wzorcu jest tabela dni z podświetlonym „dziś”.

## 6. Salony marek — 20 salonów
- Po #486 Posnet i Elzab są 1:1 z wzorcem:
  - karta w hero z opisami;
  - „Która kasa”, tabela, drukarki, „Wszystko w ofercie” (24 pozycje);
  - „Jak sprzedajesz?”;
  - osobno Serwis i Wdrożenie, O marce, FAQ.
- Wysokości wszystkich 20 salonów są zgodne z wzorcem.
- Krótkie zgodnie z wzorcem (3 000–3 500 znaków, 4–5 sekcji): Sharp/NEC, EuroCert, ESET, Avtek, PolCard, Samsung, Microsoft. Nie mają „Wszystko w ofercie”, a część nie ma bloku wdrożenia. To miejsce na rozbudowę, nie błąd.

## 7. Produkty — 414 kart
- 414/414 = 200, zero pustych `alt`, zero `noindex`.
- Każda karta ma: Opis, Pełne parametry, FAQ, „Potrzebujesz kilku sztuk”; 393 mają też „Skąd są te informacje”.
- Opis: mediana 1 109 znaków, 10. percentyl 902, minimum 613. Brak powtarzanych opisów.
- **39 kart z opisem < 900 znaków**, głównie usługi, QNAP, Optivendi, Fellowes, Brother i Kyocera:
  - pomoc-zdalna, tusze-tonery, modernizacja-komputera, przeglad-it, qnap-ts-855x, przygotowanie-komputera, integracja-kasy, omada-switche-agile-es, qnap-ts-262a-ts-462a, kopie-zapasowe;
  - m365-poczta, serwis-drukarek, fellowes-automax-100m, qnap-ts-h765eu-h1065eu, optivendi-lodomat, kyocera-taskalfa-2320-2020, optivendi-pizzomat, fellowes-lx220, siec-wifi-montaz, kyocera-ecosys-pa4000x-pa4500x;
  - fellowes-lx211, brother-hl-l6210dw-hl-l6410dn, kyocera-ecosys-ma2600cwfx, logitech-c925e, brother-hl-l2460dn-hl-l2442dw-hl-l2402d, brother-ads-1300-ads-1800w, optivendi-smartvend-49, qnap-tvs-h474-h674-h874, brother-mfc-l2802dw-mfc-l2802dn, wymiana-kasy;
  - brother-mfc-b7810dw, optivendi-sklep-samoobslugowy, optivendi-kluczomat, optivendi-kwiatomat, fellowes-automax-350c, fellowes-lx210, logitech-mk295-silent-wireless-combo, optivendi-ksiazkomat, comex-cover-ps.
- **19 kart z FAQ 2–3:**
  - Optivendi: winda-2026, chlebomat;
  - COMEX: akumulatory-7stars, karty-snmp, cover-ats, cover-core-one, cover-basic-1k, cover-winter-3k;
  - usługi: tusze-tonery, przeglad-it, kopie-zapasowe, m365-poczta, siec-wifi-montaz, przygotowanie-komputera, pomoc-zdalna, modernizacja-komputera, integracja-kasy, serwis-drukarek, wymiana-kasy.
- **Białe prostokąty zdjęć.** Tokeny białej płyty weszły (#485), ale karty jej jeszcze nie używają: PolCard w „Do tego zwykle dobierają” nadal ma biały prostokąt.

## 8. Zestawy — 19 na stronie
- Każdy ma: W zestawie, Możesz zamienić, Dlaczego taki zestaw, FAQ (4–5).
- 14 ma „Sprawdzone zgodności”. Bez nich: food truck, bistro, kwatera, Wi-Fi Omada.
- 4 ukryte czekają na dystrybutora (PC-Market/Godex, PC-POS, elzAPP, kiosk GoKiosk).
- Dokument zgodności mówi o 20 gotowych, a lokalnie widać 19. Do sprawdzenia, czy lokalna baza jest po ostatnim `seed:biznes`.

## 9. Strona główna — w porządku, dwa błędy
- **Marki:** pigułka statusu („Autoryzowany serwis”, „We współpracy”) nachodzi na opis pod logo w kaflach Posnet, Elzab, InsERT, GoPOS i COMEX. Tekst jest nieczytelny.
- **Aktualności:** okładka KSeF to surowy napis „KSeF” na białym tle, ucięty. Karta Instalacji jest bez zdjęcia. To PR 4 z naprawy 09.11, nadal niescalony.

## 10. Kolejność
1. O firmie i Kontakt premium (największa luka, strony zaufania).
2. GoPOS i InsERT: zestawy, kolejka, hero InsERT, granatowy KSeF, okładki filmów.
3. Opieka IT: panel „Na start”, karta stanowisk przy FAQ, sekcja przeglądu IT.
4. Główna: pigułki marek, Aktualności (PR 4 z 09.11).
5. Zdjęcia na białej płycie we wszystkich kartach (PR 3 z 09.11).
6. Treści: 39 opisów i 19 FAQ.
7. Małe salony: rozbudowa (opcjonalnie).
