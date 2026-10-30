# K34 — zmiany v145 na prokombiznes.pl (dla Claude Code)

Wersja: 28.10.2026. Wizualizacja: artefakt „Podgląd” (wersja 6) i artefakt projektu (wersja 145).
Ten plik **uzupełnia K33-ZMIANY.md**. Wszystko, czego tu nie ma, robisz według K33: trasy, SEO, zasady treści i kolejność prac.

## 0. Zasady, które dalej obowiązują

- Na stronie nie ma cen produktów ani usług. Nie piszemy o leasingu, ratach ani finansowaniu.
  - Wyjątki dopuszczone (do potwierdzenia przez Krystiana): „do 700 zł ulgi za kasę” oraz „bezpłatny przegląd IT”.
  - Kalkulator przestoju na Opiece IT liczy koszt klienta z danych, które wpisze klient — to nie jest nasza cena.
- Statusy partnerów:
  - Posnet i Elzab — autoryzowany serwis;
  - GoPOS i InsERT — autoryzowany partner;
  - COMEX i Optivendi — tylko „we współpracy”.
- Nie pokazujemy marek Novitus, Honeywell, Verifone ani Datalogic. Nie wspominamy o Strefie Klienta.
- Logo Apple jest użyte na prośbę Krystiana. Przed produkcją trzeba potwierdzić umowę z Apple.
- Na podstronach jest jeden H1. Na stronie głównej sekcje mają H2, a karty H3.

## 1. Responsywność — wymaganie ogólne (nowe)

Strona ma działać jak nowoczesna aplikacja na telefonie i być dopracowana na tablecie i laptopie.

- Progi szerokości: 390 (telefon) · 640 · 768 (tablet pionowo) · 900 · 1024 (tablet poziomo) · 1240 · 1280–1440 (laptop i desktop).
- **Na żadnej szerokości nie ma poziomego przewijania strony.** Sprawdzaj to testem w Playwright: `scrollWidth === innerWidth` na każdym widoku i każdym progu.
- **Telefon (do 760 px)** — układ jak w artboardach „Telefon · …” (komponent Aplikacja):
  - dolny pasek kart: Start, Oferta, Szukaj, Zapytanie, Kontakt;
  - przyklejony nagłówek z wyszukiwarką;
  - karuzele przewijane palcem, z przyciąganiem do kart (scroll-snap);
  - arkusze wysuwane od dołu zamiast nowych podstron dla list typu „wszystkie kategorie”;
  - cele dotyku co najmniej 44 px;
  - `prefers-reduced-motion` wyłącza animacje, np. pasek marek.
- **Tablet poziomo (901–1240 px):** hero zostaje w dwóch kolumnach, a koło działów jest pomniejszone (okolice 430 px). Siatki mają 2–3 kolumny.
- **Tablet pionowo (641–900 px):** jedna kolumna w hero. Siatki mają 2 kolumny. Menu otwiera się jako panel z prawej.

## 2. Strona główna — kolejność sekcji (v145)

1. Hero z kołem działów, a pod nim 4 kafelki intencji. Bez zmian względem K33.
2. **Pasek marek (nowy):**
   - nagłówek „Marki, które sprzedajemy, wdrażamy i serwisujemy”, dopisek „Najedź, żeby zatrzymać” i link „Wszystkie marki · N”;
   - dwa rzędy logo przesuwające się w przeciwnych kierunkach i zatrzymujące po najechaniu;
   - wszystkie marki, które mają logo;
   - kliknięcie logo prowadzi do salonu marki albo do oferty filtrowanej po marce.
3. **Działy „Od kasy po serwer — w pięciu działach”:**
   - siatka 3 × 2 (tablet 2 kolumny, telefon karuzela);
   - każdy kafel ma kolorową część wizualną (zdjęcia produktów, ikona, liczba pozycji), opis, do 6 kategorii z licznikami, przycisk „Wszystkie kategorie · N” rozwijający pełną listę w kaflu oraz „Cały dział”;
   - stan rozwinięcia jest osobny dla każdego działu;
   - szósty kafel „Nie wiesz, w którym dziale szukać?” zawiera wyszukiwarkę, popularne frazy i skróty do Konfiguratora, Gotowych zestawów i Całej oferty;
   - na telefonie „Wszystkie kategorie” otwiera arkusz od dołu z listą kategorii (miniatura, nazwa, licznik).
4. „Systemy, które wdrażamy od początku do końca” — bez zmian.
5. **Marki, które znamy od środka:**
   - 16 kafli w tej kolejności: GoPOS, InsERT, Posnet, Elzab, ESET, Microsoft, EuroCert, COMEX, Apple, Samsung, Lenovo, Dell, Sunmi, PolCard, Konica Minolta, Ubiquiti;
   - pod nimi wyróżniony kafel na całą szerokość „Zobacz wszystkie marki · N”: ciemny gradient, logo pozostałych marek i białe CTA;
   - mały przycisk z nagłówka usunięty.
6. **Najczęściej wybierane — 12 pozycji:** dotychczasowe 8 oraz MacBook Air, UniFi U7 Pro, ESET PROTECT i Microsoft 365. Siatka 4 × 3.
7. **Dla kogo pracujemy (nowa, przed Planem):**
   - H2 „Obsługujemy każdą firmę. Od straganu po urząd gminy.”;
   - 21 rodzajów działalności na kolorowych kaflach z ikonami;
   - domyślnie widać 11 kafli i kafel „Pokaż wszystkie branże”; po rozwinięciu wszystkie oraz kafel „Każda inna firma” na 3 kolumny;
   - kafel z planem lokalu przewija do sekcji Planu i ustawia scenę: sklep, gastro, hotel, biuro, gabinet, szkoła, urząd, warsztat, apteka, produkcja, bilety, konferencja;
   - pozostałe kafle otwierają Konfigurator z wybraną branżą;
   - pod kaflami zielony baner Dofinansowania: „Masz dofinansowanie na sprzęt lub oprogramowanie? Zrealizujesz je u nas.” z chipami: szkoły, gminy, szpitale i uzdrowiska, firmy.
8. Plan Twojej firmy — bez zmian.
9. **Jak pracujemy (nowy układ):**
   - 4 karty połączone linią postępu: Rozmowa, Oferta, Wdrożenie, Opieka;
   - każda karta: duża ikona z numerem, etap, opis, „Zajmuje się” (Doradca / ten sam doradca / Wdrożeniowiec / Serwisant i opiekun IT) oraz „Dostajesz”;
   - pod kartami ciemny pas „Nasze zobowiązania”: 60 minut (w godzinach pracy), wycena na piśmie, kasa gotowa do pracy, jeden numer.
10. „Pięć firm czy jedna?” — bez zmian.
11. **Opinie:** osobna sekcja z dotychczasowymi trzema miejscami na opinie. Dwa z nich to placeholdery — zostają do czasu zebrania prawdziwych opinii.
12. Słowo od właściciela, FAQ i formularz kontaktowy — bez zmian.

## 3. Mega-menu (Oferta ▾)

- Kolumna „Polecane w dziale” usunięta. Układ: lewa kolumna z działami (268 px) i szeroka część z kategoriami.
- W nagłówku działu: pole „Szukaj w N pozycjach” (skrót „/”) i przycisk „Cały dział · N”.
- Kategorie w 3 kolumnach (od 1320 px w dół: 2 kolumny). Kafle mają miniaturę 52 px.
- Dolny pas „Salony marek”: siatka 12 × 2 — 23 logo i kafel „Wszystkie · N marek”. Przy 1320 px: 8 kolumn, przy 1180 px: 6.
- Całe menu mieści się w wysokości 900 px na laptopie 1440 px.

## 4. Oferta — panel filtrów

- Filtry są jedną kartą (sticky, z ukrytym paskiem przewijania). W nagłówku: licznik aktywnych filtrów i „Wyczyść”.
- Rodzaj to przełącznik segmentowy: Wszystko / Sprzęt / Programy / Usługi.
- Nowości to przełącznik.
- Kategoria: lista z checkboxami i licznikami.
- **Marka: kafle z logo w 2 kolumnach**, zaznaczony kafel ma niebieską ramkę i ✓.
- Branża: chipy.
- Grupy można zwijać. Nagłówek grupy ma ikonę i licznik wybranych pozycji.
- Na telefonie działy są karuzelą, a siatka produktów ma 2 kolumny.

## 5. GoPOS — „Moduły GoPOS · Cały lokal w jednym systemie”

- Po lewej 4 obszary jako duże przyciski (ikona, nazwa, podpis, liczba modułów). Pod nimi notka „Zaczynasz od sprzedaży…”.
- Po prawej panel obszaru:
  - kolorowy nagłówek z nazwą i do 3 zdjęć sprzętu (klik otwiera kartę produktu);
  - lista modułów w 2 kolumnach: nazwa, opis, „w pakiecie” (według konfiguracji z kalkulatora) i przycisk „Karta”.
- Rozwijane szczegóły modułów rozszerzających — bez zmian.

## 6. Opieka IT

- **Hero:**
  - H1 „Komputery, sieć i kasy pod jedną opieką. Jeden numer, gdy coś stanie.”;
  - CTA „Umów bezpłatny przegląd IT” i telefon;
  - trzy liczby: 8 obszarów, 60 min, 1 numer;
  - po prawej karta „Raport z przeglądu IT — przykład”: 6 wierszy ze statusem (do poprawy / w porządku / pilne / termin) i podsumowanie „3 sprawy do poprawy”.
  - Karta jest oznaczona jako przykład.
- **Nowa sekcja „Z opieką i bez”:** tabela 5 sytuacji, każda w dwóch wariantach: bez stałej opieki i z opieką PRO-KOM. Na telefonie są to karty w karuzeli.
- **Nowy kalkulator „Ile kosztuje Cię godzina, w której nic nie działa?”:**
  - 4 suwaki: osoby, koszt godziny pracy, utracona sprzedaż na godzinę, czas przestoju;
  - wynik = (osoby × koszt + sprzedaż) × godziny;
  - dopisek, że kalkulator liczy tylko dane klienta.
  - **Do decyzji Krystiana i szefa**, czy zostaje (patrz audyt).
- **„Jak to działa” z przełącznikiem:** „Start opieki” (4 kroki) albo „Gdy coś się dzieje” (zgłoszenie → diagnoza zdalna → na miejscu → zamknięte i zapisane).
- Pozostałe sekcje bez zmian.

## 7. O firmie

- **Hero:**
  - H1 „Lokalna firma IT, która zostaje z klientem na lata.”;
  - opis firmy, CTA (telefon, „Jak pracujemy”) i 4 liczby;
  - po prawej „wizytówka”: dane firmy (nazwa, adres, NIP, telefony, e-mail, godziny), 4 logo autoryzacji z podpisem i link „Dane sprawdzisz w CEIDG po numerze NIP”;
  - pod wizytówką miejsce na zdjęcie salonu i zespołu („wkrótce”).
- **Nowa sekcja „Nie musisz wierzyć nam na słowo”:** 4 karty z linkami zewnętrznymi (CEIDG, Posnet, InsERT, opinie Google).
  - **Do zrobienia:** podmienić linki na bezpośrednie strony list serwisów i partnerów u producentów, kiedy Krystian je zweryfikuje.

## 8. Kontakt

- **Hero:**
  - po lewej status „otwarte / zamknięte” na żywo, H1 „Zadzwoń, napisz albo wpadnij do Rabki.”, opis z obietnicą 60 minut i 4 karty działań (telefon — wyróżniony, WhatsApp, e-mail, formularz) oraz telefon stacjonarny;
  - po prawej karta z mapą dojazdu, adresem, godzinami na każdy dzień (dzisiejszy dzień wyróżniony), notką o przyjeździe z kasą i danymi firmy.
- Zdublowana sekcja „Dojazd” niżej na stronie usunięta.
- Przycisk „Dobierz zestaw” w „Z czym dzwonisz?” prowadzi do Konfiguratora (wcześniej był martwy link).

## 9. Telefon (komponent Aplikacja)

- **Start:**
  - hero;
  - karuzela 4 intencji (kolorowe karty);
  - 4 szybkie akcje: Zadzwoń, Konfigurator, Zestawy, Plan firmy;
  - pasek marek;
  - działy w karuzeli z arkuszem „Wszystkie kategorie”;
  - 12 najczęściej wybieranych;
  - „Obsługujemy każdą firmę”: 22 kafle w 2 rzędach przewijanych w bok oraz baner dofinansowań;
  - gotowe zestawy i plan;
  - „Jak pracujemy”: oś z ikonami, „Dostajesz” i 4 zobowiązania;
  - 16 marek w kolejności z p. 2.5 i kafel „Zobacz wszystkie marki”;
  - karta Opieki IT;
  - CTA.
- **O firmie:** nowe H1, wizytówka z danymi i autoryzacjami, karuzela „Nie musisz wierzyć nam na słowo”, 5 linii PRO-KOM (dodane Zakopane).
- **Kontakt:** nowe H1, godziny z „dziś” w karcie dojazdu.
- **Opieka IT:** nowe H1 i CTA „Bezpłatny przegląd IT”, przykładowy raport, karuzela „Z opieką i bez”.

## 10. Testy przed oddaniem (dopisz do checklisty z K33)

- [ ] Brak poziomego przewijania na 390 / 768 / 1024 / 1280 / 1440 dla każdego widoku.
- [ ] Mega-menu mieści się w 1440 × 900. Na tablecie menu otwiera się jako panel, a etykiety kafli są czytelne.
- [ ] „Dla kogo”: każdy kafel z planem ustawia właściwą scenę i przewija do planu. Kafle Konfiguratora przekazują branżę.
- [ ] Działy: rozwijanie kategorii jest niezależne dla każdego kafla. Arkusz na telefonie zamyka się tłem i przyciskiem X.
- [ ] Filtry oferty: licznik aktywnych filtrów, segment „Rodzaj” i kafle marek działają razem z URL (`?brand=`, `?cat=`, `?q=`).
- [ ] Kontakt: „dziś” liczone w strefie Europe/Warsaw, a nie w strefie przeglądarki.
- [ ] Kalkulator przestoju: wynik formatowany po polsku (spacja tysięcy, „zł”). Suwaki działają z klawiatury.
- [ ] Lighthouse na telefonie: Performance ≥ 90, Accessibility ≥ 95, SEO 100.
