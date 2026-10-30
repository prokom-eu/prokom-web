# K35 — zmiany v146 na prokombiznes.pl (dla Claude Code)

Wersja: 28.10.2026. Wizualizacja: artefakt „Podgląd” (wersja 12) i artefakt projektu (wersja 152).
Ten plik **uzupełnia K34-ZMIANY.md** (a ten K33). Czego tu nie ma — robisz według K34/K33.

## 0. Zmiany w zasadach

- **Kalkulator przestoju na Opiece IT jest usunięty** (decyzja Krystiana 28.10). Usuń sekcję, dane i zdarzenia z nim związane. Punkt o kalkulatorze z K34 §0 nie obowiązuje.
- Na stronie nie ma napisów „0 zł”. Zamiast „przegląd 0 zł” piszemy „bezpłatny przegląd”. Wyjątek bez zmian: terminal „bywa za 0 zł” tylko tam, gdzie był w K33.
- Ulga na kasę: zawsze dopisek, że **ulgę rozlicza księgowa / biuro rachunkowe klienta**. Nie obiecujemy kwoty zwrotu — piszemy „do 700 zł”, „90% ceny netto”.
- Konfigurator na stronie głównej ma **3 wejścia w treści**: przycisk w hero, karta „Nie wiesz, od czego zacząć?”, kafle w sekcji „Dla kogo pracujemy”. Do tego link w górnym pasku i w stopce. Szósty kafel działów prowadzi do Planu firmy, nie do Konfiguratora.
- Pod kołem działów w hero nie ma już chipów z kategoriami.
- Intencja „Otwieram firmę” prowadzi do Gotowych zestawów, intencja „KSeF” do nowej strony /ksef.

## 1. Konfigurator 3.0 (komputer i telefon)

Cel: jeden konfigurator dla każdej firmy — prosty, szybki, wizualny. Klient w każdej chwili widzi, na którym jest kroku, co już wybrał i **dlaczego** coś mu polecamy.

### 1.1 Kroki

| Krok | Co widzi klient | Zachowanie |
|---|---|---|
| 1. Firma | 9 kafli z ikoną: Sklep, Gastronomia, Hotel lub pensjonat, Biuro i usługi, Gabinet lub salon, Szkoła lub instytucja, Warsztat i serwis, Produkcja i magazyn, Inna firma | Kliknięcie kafla od razu przechodzi dalej (bez „Dalej”). |
| 2. Sytuacja i skala | Sytuacja: Otwieram firmę lub lokal / Wymieniam lub rozbudowuję / Coś nie działa / Przygotowuję się do KSeF. Skala: 1 stanowisko / 2–3 / 4–10 / Ponad 10 | Po wybraniu obu przechodzi dalej sam. „Coś nie działa” pokazuje panel z telefonem serwisu i „Zgłoś awarię” — klient może iść dalej albo zadzwonić. |
| 3. Pytania i potrzeby | 3–5 pytań Tak/Nie zależnych od rodzaju firmy (np. gastronomia: obsługa przy stolikach, osobna kuchnia, dowozy, Wi-Fi dla gości, menu na ekranie) + siatka potrzeb z kropką „skąd to się wzięło” | Każda odpowiedź od razu zmienia listę potrzeb i polecane produkty. Potrzebę można ręcznie dodać albo wyłączyć. |
| 4. Wynik | Profil (chipy z „zmień”), „Dodaj wszystkie polecane · N”, „Skopiuj link do wyniku”, karty potrzeb, pasujący gotowy zestaw i plan lokalu, „Co dalej” | Opis niżej. |

- Pasek postępu z nazwami kroków; kroki już przejdzione są klikalne.
- Z boku (komputer) panel **„Twój zestaw na żywo”** z miniaturami wybranych produktów; na wyniku w tym miejscu jest formularz zapytania.
- Telefon: przyklejony dolny pasek z krokiem, liczbą pozycji i głównym przyciskiem. Kafle min. 44 px, jedna kolumna przy pytaniach.

### 1.2 Silnik dopasowania (logika do przeniesienia 1:1)

Wejście: `{ firma, etap, skala, odpowiedzi: {id: true/false}, recznie: {potrzeba: true/false} }`.

1. **Potrzeby** zbierane są z pięciu źródeł i każda pamięta swoje źródła:
   - `typ` — zestaw typowy dla rodzaju firmy (preset),
   - `ans` — odpowiedź „Tak” na pytanie (pytanie ma listę potrzeb do dodania i etykietę powodu, np. „dowozy i zamówienia online”),
   - `etap` — sytuacja (KSeF → Faktury i KSeF; Coś nie działa → Opieka; Otwieram + sklep/gastro/gabinet/warsztat → Płatności kartą),
   - `skala` — 4–10 i ponad 10 stanowisk → Kopie danych i Opieka; ponad 10 → także UPS,
   - `man` — ręczne zaznaczenie.
   Ręczne wyłączenie zawsze wygrywa ze źródłami automatycznymi.
2. **Produkty dla potrzeby** — lista kandydatów w kolejności:
   1. nadpisania z odpowiedzi (np. „dowozy” → GoHub, GoOrder, GoPOS),
   2. lista dla rodzaju firmy,
   3. lista dla skali,
   4. lista domyślna potrzeby.
   Pierwszy dostępny produkt = **„Nasz wybór”**, kolejne dwa = alternatywy. Produkt nie powtarza się w obrębie potrzeby.
3. **Powody** („Dopasowane, bo:”) — maks. 3: źródło listy, z której pochodzi wybór (np. „gastronomia”), etykiety odpowiedzi, „typowe: <rodzaj firmy>”, „zaznaczone przez Ciebie”.
4. **Gotowy zestaw** — z grupy zestawów dla rodzaju firmy; poziom według skali (1 → Mały, 2–3 → Standard, 4–10 → Średni, 10+ → Duży, z kolejnymi wyborami zapasowymi).
5. **Scena planu lokalu** — według rodzaju firmy (sklep, gastro, hotel, biuro, gabinet, szkoła…).

Dane pytań, nadpisań i zestawów są w wizualizacji w `k3_engine.py` (SQ, ZG, SCN). W produkcji trzymaj je w Payload (kolekcja „Konfigurator — pytania”), żeby Krystian mógł je zmieniać bez wdrożenia.

### 1.3 Link do wyniku

Format parametru: `?kr=firma|etap|skala|potrzeby|odpowiedzi`, np.
`/konfigurator?kr=gastro|nowa|2|pos,plat,prog,ksef,siec|dowozy:1`

- Puste pole potrzeb = policz automatycznie.
- Link otwiera od razu wynik. Przycisk „Skopiuj link do wyniku” kopiuje adres do schowka i pokazuje potwierdzenie.
- Wynik dodany do zapytania trafia do nas z profilem (firma, sytuacja, skala, odpowiedzi) — handlowiec widzi, skąd wzięła się lista.

### 1.4 Uwagi wynikowe

- KSeF w wyniku → link do /ksef. Kasa w wyniku → link do strony o uldze.
- Bez cen. Przycisk przy produkcie: „+ Do zapytania” / „✓ Na liście”.

## 2. Nowa strona /ksef

H1: „KSeF bez wyjątków od 1 stycznia 2027. Przygotuj firmę teraz.”

1. **Hero:** licznik dni do 1.01.2027 liczony z bieżącej daty; oś czasu:
   - 1.02.2026 — najwięksi podatnicy (obowiązuje),
   - 1.04.2026 — pozostali podatnicy VAT (obowiązuje),
   - 31.12.2026 — koniec wyjątków (następne),
   - 1.01.2027 — KSeF bez wyjątków (wkrótce).
2. **„Czy KSeF dotyczy mojej firmy?”** — 3 pytania Tak/Nie i wynik z listą działań.
3. **6 kroków do gotowości** — lista z odhaczaniem i paskiem postępu (stan w przeglądarce).
4. **Kary od 1.01.2027** — do 100% VAT z faktury, do 18,7% kwoty brutto, gdy faktura jest bez VAT (art. 106ni ustawy o VAT). Obok „Jak pomagamy” i produkty: program InsERT z KSeF, certyfikat i podpis.
5. FAQ, źródła, pas z przyciskiem „Przygotujcie moją firmę” (dodaje usługę KSeF do zapytania i otwiera szufladę).

Fakty do treści (sprawdzone):
- obowiązek od 1.02.2026 (najwięksi) i od 1.04.2026 (pozostali);
- do 31.12.2026 można jeszcze wystawiać poza KSeF faktury do 10 000 zł brutto miesięcznie, a faktury z kas fiskalnych mogą zostać poza KSeF;
- od 1.01.2027 te wyjątki znikają i zaczynają obowiązywać kary;
- tryb offline24: dosłanie do następnego dnia roboczego; awaria KSeF: do 7 dni roboczych.

Źródła: [ksef.podatki.gov.pl](https://ksef.podatki.gov.pl), [ustawa o VAT — ISAP](https://isap.sejm.gov.pl), komunikaty MF (pytania i odpowiedzi KSeF 2.0).

SEO: title „KSeF 2027 — co musi zrobić firma | PRO-KOM Rabka-Zdrój”, FAQPage w JSON-LD, link z Programów, InsERT, stopki i wpisu o KSeF.

## 3. Nowa strona „Ulga na kasę fiskalną”

H1: „Ulga na kasę fiskalną. Do 700 zł zwrotu za każdą kasę.”

- **Hero:** karty „90% ceny netto” i „do 700 zł na kasę”, „Kasa online”, „Rozlicza księgowa”.
- **Komu przysługuje:** tak / nie.
- **4 kroki:** zakup kasy online → zgłoszenie do urzędu skarbowego przed rozpoczęciem ewidencji → start ewidencji → rozliczenie przez księgową.
  - czynny podatnik VAT odlicza w JPK_V7;
  - zwolniony z VAT składa wniosek o zwrot do urzędu skarbowego.
- **„Kiedy trzeba oddać ulgę”** — w ciągu 3 lat w razie:
  - zaprzestania działalności, likwidacji albo upadłości;
  - niedopilnowania obowiązkowego przeglądu kasy.
- 4 kasy jako karty produktów, FAQ, źródła, pas „Dobierzemy kasę na dzień otwarcia”.

Źródło: art. 111 ust. 4 i 6 ustawy o VAT (ISAP). Treść nie zastępuje porady podatkowej; jest dopisek „szczegóły potwierdź z księgową”.

## 4. Salony Lenovo i Dell — na poziomie pozostałych

Generowane z danych serii w tym samym szablonie co Apple/Samsung. Elementy salonu:

- hero z rodzinami serii;
- „Który laptop …?” — karty planów;
- druga grupa planów: stacjonarne i monitory;
- tabela porównania (Klasa / Dla kogo / Wyróżnik / Modeli);
- „Do czego potrzebujesz?”;
- sekcja „Komputer gotowy do pracy od pierwszego dnia”;
- fakty, FAQ;
- wszystkie serie z licznikami.

Treści wyłącznie z naszych opisów serii — nie kopiujemy tekstów producenta.

## 5. Oferta na telefonie — jak w aplikacji

Ekrany: Oferta, Kategoria, Szukaj (artboardy „Telefon · Oferta / Kategoria / Szukaj”).

- **Oferta:**
  - przyklejona wyszukiwarka;
  - działy jako przewijane karty z kolorem działu, zdjęciami i licznikiem — wybrany dział podświetlony;
  - skróty w pigułkach: Konfigurator, Gotowe zestawy, KSeF 2027, Ulga na kasę, Plan firmy;
  - kafle kategorii działu (zdjęcie, nazwa, licznik);
  - „Popularne w dziale”;
  - karta Gotowych zestawów;
  - siatka salonów marek.
- **Kategoria:**
  - przyklejony pasek z podkategoriami (licznik);
  - przycisk „Filtry” (arkusz od dołu, licznik aktywnych filtrów);
  - sortowanie: Polecane / A–Z / Nowości;
  - przełącznik siatka/lista;
  - pigułki marek z logo;
  - „Pokaż kolejne 10” z paskiem „Widzisz X z Y”;
  - karta „Nie widzisz tego, czego szukasz? → Zapytaj o produkt”.
- **Szukaj:**
  - wyniki pasują, gdy zgadzają się **wszystkie słowa** zapytania (bez polskich znaków, bez wielkości liter);
  - nad wynikami kategorie pasujące do zapytania;
  - przy każdym wyniku szybkie „+” do zapytania;
  - przed wpisaniem: popularne frazy, kafle kategorii, karta Konfiguratora.
- Wszystko bez poziomego przewijania strony; karuzele z przyciąganiem (scroll-snap).

## 6. Tryb ciemny

- **Domyślnie strona jest jasna.** Przełącznik w nagłówku (słońce/księżyc, `aria-label` „Włącz ciemny/jasny motyw”); na telefonie w menu (Jasny / Ciemny).
- Wybór zapamiętujemy w `localStorage` (`pk-motyw` = `jasny`/`ciemny`), odczyt i zapis w `try/catch`. Bez zapisu strona działa normalnie (jasna).
- Na pierwszym wejściu **nie** włączamy ciemnego z ustawień systemu (decyzja: domyślnie jasno). Parametr `?dk=1` / `?dk=0` tylko do testów.
- Zmienne kolorów na `.site` / `.site.dk` (tak jak w wizualizacji), `color-scheme: dark`, widoczny focus, kolor zaznaczenia, płynne przejście 0,25 s (wyłączone przy `prefers-reduced-motion`).
- Logo marek zostają na jasnych kafelkach (czytelność). Logo PRO-KOM — wersja jasna na ciemnym tle.
- Test kontrastu: tekst min. 4,5:1 (mały) i 3:1 (duży), w obu motywach. W wizualizacji sprawdzone automatycznie na 18 widokach.
- Dodatkowo w v146 poprawiony kontrast w jasnym motywie: pasek dofinansowań, etykiety „Jak pracujemy”, liczby planu, rdzeń GoHub.

## 7. Pomiar: rekomendacja Plausible + lista zdarzeń

### 7.1 Porównanie

| | **Plausible (chmura, UE)** — rekomendacja | GA4 | Plausible na własnym serwerze |
|---|---|---|---|
| Koszt | Starter 9 USD/mies. (1 strona), Growth 14 USD (do 3 stron), Business 19 USD (do 10 stron, lejki) — przy 10 tys. odsłon/mies.; rocznie 2 miesiące gratis | 0 zł | 0 zł za licencję, ale serwer i utrzymanie po naszej stronie |
| Cookies / baner | bez cookies i identyfikatorów — według producenta baner zgody nie jest potrzebny | cookies → potrzebna zgoda (art. 399 Prawa komunikacji elektronicznej), baner i Consent Mode; bez zgody część danych znika | jak chmura |
| Dane | serwery w UE | Google, USA | nasz serwer |
| Obsługa | prosty panel, zdarzenia i cele w planie Starter | rozbudowany, trudniejszy | aktualizacje, kopie i monitoring na nas |

**Rekomendacja:** Plausible w chmurze, plan **Growth** (3 strony: biznes, instalacje, software) lub **Business**, jeśli chcemy mieć lejek Konfiguratora i więcej domen. Mniej pracy przy RODO, czysty panel dla szefa. GA4 tylko wtedy, gdy ruszą kampanie Google Ads, które jej wymagają.

Do decyzji szefa: plan i płatność (karta firmowa).

Ryzyko: brak banera opieramy na deklaracji producenta. Przed startem potwierdzamy to z osobą odpowiedzialną za RODO w firmie i dopisujemy Plausible do polityki prywatności.

Źródła:
- [plausible.io — cennik i informacje o cookies](https://plausible.io/#pricing)
- [Prawo komunikacji elektronicznej, art. 398–400](https://edlaw.eduverse.com/docs/jurisdiction/nat/pl/pke)

### 7.2 Zdarzenia (nazwy jak w Plausible, właściwości w nawiasie)

| Zdarzenie | Kiedy |
|---|---|
| `Telefon` (miejsce) | klik w każdy `tel:` |
| `WhatsApp` (miejsce) | klik w link WhatsApp |
| `E-mail` (miejsce) | klik w `mailto:` |
| `Zapytanie: dodano` (produkt, kategoria, źródło: karta / szybki podgląd / konfigurator / szukaj) | dodanie pozycji do zapytania |
| `Zapytanie: wysłane` (liczba pozycji, źródło) | **cel główny** — wysłany formularz zapytania |
| `Kontakt: wysłany` (temat) | wysłany formularz kontaktowy |
| `Konfigurator: krok` (krok 1–4, firma) | wejście na krok |
| `Konfigurator: wynik` (firma, etap, skala, liczba potrzeb) | pokazanie wyniku |
| `Konfigurator: dodaj wszystkie` (liczba) | klik „Dodaj wszystkie polecane” |
| `Konfigurator: link` | skopiowanie linku do wyniku |
| `KSeF: sprawdzenie` (wynik) | wynik „Czy KSeF dotyczy mojej firmy?” |
| `Szukaj` (fraza, liczba wyników) | wyszukanie (fraza bez danych osobowych; przy 0 wyników osobne `Szukaj: brak wyników`) |
| `Plan: urządzenie` (scena, produkt) | klik w urządzenie na planie |
| `Awaria: zgłoszenie` | klik „Zgłoś awarię” |
| `Motyw` (jasny/ciemny) | zmiana motywu |

Implementacja: jedna funkcja `track(nazwa, props)` w kliencie, która woła `window.plausible` tylko, gdy skrypt jest załadowany. Bez wysyłania imion, telefonów i e-maili.

## 7a. Strona główna — Szybki start, Najczęściej wybierane, karty, dofinansowania, mega-menu (v147)

### Szybki start (zastępuje 4 kafle intencji z K33/K34)
- Jeden panel pod hero: lewa granatowa kolumna („Szybki start / Z czym do nas przychodzisz?”), obok **5 pól** rozdzielonych linią. Na desktopie panel lekko nachodzi na hero; od 1240 px w dół bez nachodzenia.
- Każde pole: ikona w kolorze sytuacji, nadtytuł z konkretem, tytuł, jedno zdanie i **CTA tekstem** (nie sama strzałka). Po najechaniu delikatne tło i pasek 3 px u góry.

| Pole | Nadtytuł | Opis | CTA → cel |
|---|---|---|---|
| Otwieram firmę lub lokal | do 700 zł ulgi | Kasa, terminal, program i komputer — gotowe na dzień otwarcia. | Dobierz na otwarcie → Konfigurator z ustawioną sytuacją „Otwieram” |
| Przegląd kasy fiskalnej | co najmniej co 2 lata | Obowiązkowy dla każdej kasy. Autoryzowany serwis Posnet i Elzab. | Umów przegląd kasy → karta usługi „Przegląd kasy fiskalnej” |
| Coś przestało działać | oddzwonimy w 60 min | Kasa, komputer, drukarka albo sieć. Serwis z Rabki: 889 003 889. | Zadzwoń teraz → `tel:+48889003889` |
| KSeF bez wyjątków od 2027 | N dni do 2027 (licznik) | Program, certyfikat i uprawnienia — zanim wejdą kary. | Sprawdź swoją firmę → /ksef |
| Stała opieka IT | przegląd IT bezpłatny | Jeden numer do komputerów, sieci, kopii i kas. | Umów przegląd IT → Opieka IT |

- Responsywność:
  - ≤1240 px — nagłówek panelu w jednym wierszu nad polami;
  - ≤1100 px — 3 + 2 pola;
  - ≤640 px — lista wierszy.
- Telefon: karuzela intencji z tymi samymi 5 sytuacjami.
- Z górnego paska usunięty link „Zgłoś awarię” (zastępuje go pole „Coś przestało działać”).

### Nagłówek działów
- Nadtytuł „Oferta · 5 działów · N pozycji”.
- H2 „Kasy, komputery, programy, sieć i serwis — wybierz dział.”
- Telefon: „Wybierz dział oferty”.

### O to firmy pytają najczęściej — 16 pozycji z filtrem
- Kolejność:
  - **Kasy i płatności:** Posnet Ergo Online, Elzab K10 Online, Sunmi D3 PRO, Sunmi V3 MIX, terminal PolCard;
  - **Komputery i telefony:** Lenovo ThinkBook 14, Lenovo ThinkCentre neo 50s/55s, Dell Pro 14/16, MacBook Air, iPhone 17;
  - **Programy, ochrona i podpis:** Subiekt nexo / nexo PRO, Microsoft 365, ESET PROTECT, podpis EuroCert;
  - **Zasilanie awaryjne:** APC Back-UPS, COMEX COVER CORE ONE.
- Nad siatką pigułki filtra z licznikami: Wszystkie 16 / Kasy i płatności 5 / Komputery i telefony 5 / Programy, ochrona i podpis 4 / Zasilanie awaryjne 2. Siatka 4 kolumny.
- Lista jest edytowalna w Payload (kolekcja „Strona główna — najczęściej wybierane”, pole grupa).

### Karty pod listą
- **Cała oferta** (jasna karta):
  - H3 „N pozycji dla firm. Znajdź swoje w kilka sekund.”;
  - pole wyszukiwania (otwiera wyszukiwarkę, Ctrl K);
  - pigułki 5 działów z licznikami;
  - przycisk „Przeglądaj całą ofertę”;
  - mozaika 6 zdjęć.
- **Konfigurator** (fiolet → granat):
  - „Nie wiesz, od czego zacząć? Wybierz rodzaj firmy.”;
  - 9 kafli rodzajów firmy — klik otwiera Konfigurator od razu na kroku 2 z wybraną firmą;
  - pod spodem 4 kroki: Firma, Sytuacja, Pytania, Wynik.
- Od 1240 px w dół karty jedna pod drugą; od 900 px bez mozaiki.

### Dofinansowania — niski pasek
- Ikona 44 px, nadtytuł, tytuł 16,5 px i pigułki w jednym rzędzie, przycisk 42 px.
- Bez zdania pomocniczego. Wysokość około 80 px.

### Mega-menu „Oferta” (v147c)
- **Trzy kolumny:**
  1. **Działy** — lista 5 działów z ikoną i licznikiem; najechanie przełącza dział.
  2. **Kategorie działu:**
     - nagłówek działu z opisem i przyciskiem „Cały dział · N”;
     - duże kafle kategorii w 2 kolumnach: miniatura 50 px na jasnym tle, nazwa 15 px, licznik, strzałka po najechaniu;
     - pod spodem **mały pasek „Marki w dziale”**: do 6 logo w kafelkach 76 × 32 px (najpierw lista ustalona dla działu, potem marki z największą liczbą pozycji) i link „Wszystkie · N”.
  3. **Na skróty** — 4 duże karty:
     - **Konfigurator** (wyróżniony, fiolet → granat, „Dobierzemy rozwiązanie w około minutę”);
     - Gotowe zestawy („N zestawów: sklep, gastronomia, biuro, hotel”);
     - Plan Twojej firmy;
     - Cała oferta („N pozycji · filtry po marce i branży”).
     Na dole telefon do doradcy z godzinami (`tel:`).
- **Usunięte:**
  - karta ulgi;
  - dolna ściana logo;
  - druga wyszukiwarka;
  - rząd chipów;
  - linki na dole kolumny działów (przeniesione do kart).
- Otwarte menu ma `z-index` nad bocznym paskiem nawigacji.
- ≤1180 px: karty skrótów idą w jeden rząd 4 kart pod kategoriami, bez telefonu.

## 8. Testy akceptacyjne v146

- Playwright: brak błędów w konsoli na wszystkich widokach (komputer) i ekranach (telefon).
- Brak poziomego przewijania na 390 / 768 / 1024 / 1280 / 1440 (`scrollWidth === innerWidth`). Na karcie produktu przy ≤1280 pasek zakładek przewija się w poziomie, a miniatura produktu w pasku chowa się przy ≤1100.
- Konfigurator:
  - link `?kr=gastro|nowa|2||dowozy:1` otwiera wynik z GoHub/GoOrder/GoPOS w „Programie do sprzedaży”;
  - zmiana odpowiedzi od razu zmienia wynik;
  - „Dodaj wszystkie” dodaje N pozycji.
- Licznik /ksef = liczba dni do 1.01.2027 z bieżącej daty.
- Tryb ciemny:
  - po przełączeniu i odświeżeniu motyw zostaje;
  - w trybie prywatnym nie ma błędu i strona jest jasna.
- Brak „0 zł” w treściach (poza wyjątkiem terminala z K33), brak kalkulatora przestoju.
