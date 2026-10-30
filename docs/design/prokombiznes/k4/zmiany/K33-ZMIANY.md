# K3.3 — prokombiznes.pl: nowa strona główna, Oferta 2.0, Konfigurator 2.0, Marki, mega-menu, wyszukiwarka (wizualizacja v144)

Stan: 27.10.2026 · źródło prawdy wyglądu: artefakt Design „prokombiznes.pl” (plansze z prefiksem „v144 ·”) i podgląd do przeklikania (link w czacie).
Ten plik trafia do `docs/` w repo `prokom-web`. Kod powstaje w Claude Code; poniżej zakres, zachowanie i reguły — bez gotowego kodu.

## 0. Zasady, które nadal obowiązują (nie zmieniać)
- Zero cen na stronie; brak leasingu, rat i finansowania (wyjątek: „terminal w programie Polska Bezgotówkowa bywa za 0 zł — warunki sprawdzamy przy ofercie”).
- Statusy: Posnet i Elzab — **autoryzowany serwis**; GoPOS i InsERT — **autoryzowany partner**; COMEX i Optivendi — **we współpracy** (nigdy „autoryzowany”).
- Obietnica: „Oddzwaniamy w ciągu 60 minut w godzinach pracy (pn–pt 9–17)”.
- Biznes pokazuje tylko adres w Rabce: PRO-KOM Tadeusz Wójciak, ul. Orkana 16B, 34-700 Rabka-Zdrój, NIP 7352511447, tel. 889 003 889 / 18 267 65 11, e-mail tylko biznes@pro-kom.eu.
- Novitus, Honeywell, Verifone, Datalogic — nigdy w treściach publicznych. Strefa Klienta — nie wspominamy.
- Ulga do 700 zł za kasę online — „rozlicza Twoja księgowa”.
- **Logo Apple**: w wizualizacji użyte na prośbę Krystiana (27.10). Zasady Apple dopuszczają logo tylko dla Apple, autoryzowanych sprzedawców i licencjobiorców (https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html). **Przed produkcją**: potwierdzić status/umowę PRO-KOM z Apple; bez niej — elegancki napis „Apple” (klasa `wordmark`) zamiast znaku.

## 1. Architektura i adresy (ważne dla SEO)
Każdy widok z wizualizacji = osobna trasa Next.js (App Router), renderowana na serwerze (SSG/ISR z Payload). Parametry `?w=` z makiety **nie** trafiają do produkcji.

| Widok w makiecie | Trasa produkcyjna | Uwagi |
|---|---|---|
| start | `/` | jeden H1 |
| oferta | `/oferta` | filtry jako parametry: `/oferta?dzial=…&kategoria=…&marka=…&branza=…&rodzaj=…&q=…&sort=…` — strona z filtrami ma `canonical` do `/oferta` lub do strony kategorii/marki, `noindex` dla kombinacji >1 filtra |
| oferta + 1 kategoria | `/oferta/[kategoria]` | indeksowana, własny title/opis |
| oferta + 1 dział | `/oferta/dzial/[dzial]` | indeksowana |
| kreator | `/konfigurator` | `noindex` dla kroków/wyników (stan w kliencie) |
| marki | `/marki` | indeksowana |
| marka / salon | `/marki/[marka]` (salony tematyczne: `/marki/druk`, `/marki/siec`, `/marki/nas`) | indeksowana |
| produkt | `/oferta/[kategoria]/[produkt]` | indeksowana |
| plan | `/plan-twojej-firmy` + `/plan-twojej-firmy/[scena]` | |
| gopos / insert / opieka / vending | `/gopos`, `/insert`, `/opieka-it`, `/automaty-vendingowe` | |
| zestawy / zestaw | `/gotowe-zestawy`, `/gotowe-zestawy/[zestaw]` | |
| ofirmie / kontakt | `/o-firmie`, `/kontakt` | |

Stare adresy (pro-kom.pl, Main/Katalog/Kreator z makiety) → 301 na odpowiedniki (lista przekierowań w osobnym zadaniu migracji domen).

## 2. Rama strony (wszystkie widoki)
1. **Pasek linii** (40 px): Biznes (aktywna) · Instalacje · Software · Tech · Zakopane — kolory linii z księgi znaku (Biznes #244FB0, Instalacje #0093B3, Software #8B61E3, Tech #D13A2E, Zakopane #DD8600); po prawej status „Otwarte teraz · do 17:00 / Zamknięte · otwieramy …” (liczony z godzin pn–pt 9–17, strefa Europe/Warsaw), „Zgłoś awarię”, „Konfigurator”, telefon.
2. **Nagłówek** (sticky, 74 px): logo → `/`; nawigacja: **Oferta ▾** (mega-menu) · Marki · Opieka IT · GoPOS · InsERT · O firmie · Kontakt; przycisk „Szukaj · Ctrl K”; motyw jasny/ciemny; „Zapytanie (n)” otwiera szufladę.
3. **Mega-menu „Oferta”** (klik; zamyka Esc/klik w tło):
   - lewa kolumna: 5 działów (najechanie/fokus przełącza środek), pod nimi: Cała oferta · Gotowe zestawy · Plan Twojej firmy · Konfigurator;
   - środek: nazwa działu, opis, „Cały dział · N pozycji”, kafle kategorii ze zdjęciem i liczbą, wyróżnione linki (np. Salon Posnet / Elzab „autoryzowany serwis”, GoPOS / InsERT „autoryzowany partner”, Opieka IT „abonament · przegląd 0 zł”);
   - prawa kolumna (≥1320 px): 3 polecane produkty działu + przycisk wyszukiwarki;
   - dół: **Salony marek** — wszystkie 23 logotypy w kolejności: Apple, Samsung, Lenovo, Dell, Posnet, Elzab, Sunmi, PolCard, GoPOS, InsERT, Microsoft, ESET, EuroCert, Ubiquiti, TP-Link, Synology, QNAP, Konica Minolta, Kyocera, COMEX, Avtek, Sharp/NEC, Optivendi + „Wszystkie marki · 34”.
   - <1320 px: znika prawa kolumna; <1180 px: zamiast nawigacji „burger” → panel boczny (jak aplikacja): szukajka, 4 szybkie kafle (Oferta, Marki, Konfigurator, Plan), rozwijane działy z kategoriami, przewijany pasek logotypów, linki firmy, przyciski „Zadzwoń” i „Zapytanie”.
4. **Menu boczne (rail)** (≥1400 px): na górze wyróżniony przycisk **Szukaj** (gradient, pulsujący obrys, „Ctrl K lub /”); na stronie głównej — kotwice sekcji; na podstronach — globalne menu z zaznaczeniem bieżącej.
5. **Wyszukiwarka globalna** (okno modalne; Ctrl/Cmd+K, „/”, przycisk w nagłówku i w rail):
   - puste pole: „Najczęściej szukane” (10 haseł), „Na skróty” (6 kategorii + Konfigurator + Plan), logotypy salonów;
   - wyniki na żywo: baner salonu, gdy zapytanie zaczyna się od marki; **Produkty i usługi** (7 najlepszych, z „Podglądem”); **Strony i usługi** (GoPOS, InsERT, Opieka IT, KSeF, Kontakt…); **Kategorie** (dopasowane albo „w których kategoriach są trafienia”); **Marki** (logotypy); **Gotowe zestawy**;
   - klawiatura: ↑/↓, Enter, Esc; „Pokaż wszystkie wyniki w ofercie” → `/oferta?q=`;
   - brak wyników: „Nie mamy jeszcze „…” na stronie” + „Zapytaj o „…”” (otwiera szufladę z wpisaną wiadomością) + telefon;
   - algorytm (do przeniesienia 1:1 albo na Postgres FTS/Meilisearch — decyzja w Code): normalizacja bez polskich znaków, słowa pomijane, synonimy (słownik w Payload, np. „kasa” → kasy fiskalne, „wifi” → UniFi/Omada, „faktury” → Subiekt/KSeF), dopasowanie rdzenia (odmiana: „laptopa”, „drukarki”), literówki (Damerau-Levenshtein ≤1/≤2), krótkie słowa (≤3 znaki) tylko od początku wyrazu, premia za trafienie w nazwie i w kategorii, kolejność „Polecane”.
6. **Szybki podgląd produktu** (modal): zdjęcie na tle „studio”, logo marki, „Nowość”, kategoria, nazwa, korzyść, opcjonalnie „Dlaczego to polecamy” (z konfiguratora), 3–4 cechy, 4 parametry, „Dodaj do zapytania” / „✓ Na liście zapytania” (drugi klik otwiera szufladę), „Pełna karta →”; strzałki ←/→ i licznik, gdy otwarty z listy.
7. **Szuflada „Twoje zapytanie”** (z prawej): pozycje z ilością (−/+), usuwanie, notatka (np. „Konfigurator: Dotykowy system POS”), blok „Z konfiguratora” (opis firmy i potrzeb), formularz: imię lub firma*, telefon lub e-mail*, wiadomość; walidacja; stan „Dziękujemy…” (60 minut). Lista zapytania zapisywana w `localStorage` (`pk-cart2`); wysyłka → endpoint zapytań (później PRO-KOM System).
8. Toast „Dodano do zapytania” z przyciskiem „Zobacz zapytanie”.

## 3. Strona główna `/`
Kolejność sekcji (id kotwic w nawiasach):
1. **Hero** (`s4-top`): H1 „Wszystko, czego potrzebuje Twoja firma.” + podtytuł w gradiencie „Kasy, komputery i programy — z jednego miejsca.”; lead; CTA „Dobierz rozwiązanie dla firmy” (→ konfigurator) i „Przeglądaj ofertę · N”; telefon + „Oddzwaniamy w ciągu 60 minut w godzinach pracy”; zaufanie: autoryzowany serwis Posnet i Elzab · partner GoPOS i InsERT · na Podhalu od 2004 · 100+ firm pod stałą opieką.
   **Koło działów** (600 px): zewnętrzna orbita 12 produktów (wolny obrót 140 s, pauza po najechaniu, klik → szybki podgląd), 5 węzłów działów (klik wybiera; automatyczna zmiana co 6,5 s z paskiem postępu wokół aktywnego; ręczny wybór wyłącza automat), środek w kolorze działu: „Dział n z 5”, 3 produkty (podgląd), nazwa, liczba pozycji, „Zobacz dział”. Pod kołem opis działu i chipy kategorii z liczbami. `prefers-reduced-motion` → bez obrotu i automatu.
2. **Intencje**: 4 karty — Otwieram firmę („do 700 zł ulgi za kasę”), Coś przestało działać, KSeF od 1 stycznia 2027 (licznik dni), Stała opieka IT („przegląd 0 zł”).
3. **Działy** (`s4-dz`) — sekcja ze starej głównej, na życzenie Krystiana: nagłówek „Od kasy po serwer — w pięciu działach.”, 5 kart (zdjęcia, ikona, opis, 3 największe kategorie + „Rozwiń · jeszcze n kategorii”, „N pozycji · Cały dział”), pod spodem **„Systemy, które wdrażamy od początku do końca”** (`s4-sys`): 3 ciemne karty GoPOS / InsERT (autoryzowany partner) / Opieka IT (usługa PRO-KOM, z przykładową listą „Kopia z nocy · sprawdzona” itd.).
4. **Marki** (`s4-marki`): „Marki, które znamy od środka.” — 12 kafli (logo albo napis, opis, status, liczba pozycji) + „Wszystkie marki · 34”.
5. **Najczęściej wybierane** (`s4-pop`) — karty ze starej głównej (8 pozycji; „Podgląd” i „Do zapytania”) + dwie karty: „Cała oferta” (mozaika zdjęć) i „Nie wiesz, od czego zacząć?” (4 kroki konfiguratora, „Otwórz konfigurator”; bez obietnicy „60 sekund” i bez „zestaw trafia do nas sam”).
6. **Plan Twojej firmy** (`s4-plan`) — ten sam komponent co `/plan-twojej-firmy`, na całą szerokość; lista urządzeń **pod** planem (4 kolumny); na głównej H2 zamiast H1, bez sekcji zestawów sceny.
7. Jak pracujemy (4 kroki + gwarancje) · Pięć firm czy jedna? (przełącznik „Osobne firmy / Jeden partner”) · Dla kogo pracujemy (6 branż → plan sceny; opinia z Panorama Firm + 2 miejsca na opinie po zgodach) · Słowo od właściciela + fakty (2004, 100+, 2 autoryzowane serwisy, 2 autoryzowane partnerstwa) · FAQ (6) · Kontakt (formularz: potrzeby jako chipy, imię*, telefon*, wiadomość; dołącza listę zapytania).

## 4. Oferta 2.0 `/oferta`
- Nagłówek zależny od kontekstu: „Cała oferta dla firm” / nazwa działu / kategorii / „Marka — oferta dla firm” (eyebrow = status marki) / „Wyniki wyszukiwania”; liczniki: pozycje, marki, działy.
- Duże pole wyszukiwania (wyniki na żywo, ten sam algorytm), „Popularne:” chipy.
- Kafle działów (Wszystkie + 5) z licznikami uwzględniającymi pozostałe filtry; dział z 0 wyników przygaszony.
- Panel filtrów (sticky): Tylko nowości (przełącznik z licznikiem) · Kategoria · Marka · Branża · Rodzaj (Urządzenia / Oprogramowanie / Usługi) — checkboxy z licznikami fasetowymi, „Pokaż wszystkie (n)”, „Wyczyść”; pod filtrami karta „Nie wiesz, co wybrać?” → konfigurator.
- Pasek wyników: liczba, „dla „q””, sortowanie (Polecane/Najtrafniejsze, Nowości, Nazwa A–Z, Marka A–Z), siatka/lista; chipy aktywnych filtrów + „Wyczyść wszystko”.
- Baner salonu przy jednej marce z salonem; nagłówek kategorii (zdjęcie, podkategorie, „Serie i porównanie →” do strony kategorii) przy jednej kategorii.
- Karta produktu (siatka 3 kol.): logo marki, „Nowość”, „Podgląd” (najechanie), „+ Do zapytania”, marka · kategoria, nazwa, korzyść (2 linie), 2 cechy. Lista: zdjęcie, opis, „Podgląd”, „Do zapytania”.
- „Pokaż kolejne 24” z paskiem postępu; pusty wynik: „Nic nie pasuje…” + „Wyczyść filtry” / „Zapytaj o produkt”; na dole „Nie widzisz tego, czego szukasz?”.

## 5. Konfigurator 2.0 `/konfigurator`
**Zasada: nic nie trafia do zapytania bez kliknięcia klienta.**
- Krok 1 Firma (9 rodzajów) → zaznacza typowe potrzeby (preset, tylko jeśli klient ich jeszcze nie zmieniał) i przechodzi dalej.
- Krok 2 Sytuacja: Otwieram firmę / Wymieniam lub rozbudowuję / Coś nie działa / Przygotowuję się do KSeF — z notatką (ulga do 700 zł rozlicza księgowa + Polska Bezgotówkowa; awaria: telefon i 60 minut; KSeF: termin 1.01.2027). „Coś nie działa” zatrzymuje się na kroku z przyciskiem „Zadzwoń” i „Dobierz też rozwiązanie”.
- Krok 3 Skala: 1 / 2–3 / 4–10 / 10+.
- Krok 4 Potrzeby: 16 chipów z ikonami, oznaczenie „typowe”; „Pokaż rekomendacje · n potrzeb”.
- Wynik: profil + „Zmień odpowiedzi”; dla każdej potrzeby karta: tytuł, uzasadnienie, 3 produkty dobrane do rodzaju firmy lub skali (kolejność: branża → skala → domyślne), klik = szybki podgląd z „Dlaczego to polecamy”, przycisk „+ Do zapytania”, linki „Zobacz też” (salony, GoPOS, InsERT…).
- Panel boczny: kroki 1–4 „Twój profil” (z „zmień”), informacja „Nic nie dodajemy za Ciebie”, telefon; w wyniku — formularz zapytania (opis firmy i potrzeb dołączany automatycznie, miniatury wybranych pozycji, „edytuj” → szuflada) i stan „Zapytanie wysłane”.
- Dane rekomendacji (`kr2`) w Payload jako kolekcja `Configurator` (rodzaje firm, sytuacje, skale, potrzeby, reguły produktów, linki) — edytowalne przez szefa.

## 6. Marki `/marki` i salony `/marki/[marka]`
- `/marki`: ciemny nagłówek z wyszukiwarką marek i 4 kartami statusów (Posnet, Elzab — autoryzowany serwis; GoPOS, InsERT — autoryzowany partner); przyklejone zakładki grup; 6 grup (Kasy, POS i płatności · Komputery, telefony i druk · Sieć, serwery i zasilanie · Programy, ochrona i podpis · Sale, ekrany i automaty · Wagi, etykiety i kody) + „Pozostałe marki”; kafel: logo/napis, opis, 3 zdjęcia produktów, status, liczba, „Wejdź do salonu” (znaczek „Salon”) albo „Zobacz ofertę” (→ `/oferta?marka=`); stan pusty i CTA „Zapytaj o markę”.
- Salony marek bez zmian względem K3.2 (Salon 2.0 dla 15 salonów + Lenovo/Dell w układzie serii); Apple: logo w hero (patrz §0).

## 7. Pozostałe zmiany
- **InsERT — hero**: zamiast schematu pudełka programów (Subiekt nexo z przodu, Rachmistrz, Rewizor, Gratyfikant, GT, 123; klik → karta produktu) + 3 pływające etykiety (Autoryzowany partner InsERT, KSeF w programie, Szkolenie na Waszych dokumentach).
- **O firmie**: sekcja „Jedna firma, pięć linii” — karty linii w kolorach księgi znaku (znak PRO–KOM z kreską w kolorze linii), opis, dla kogo, domena; Biznes „Jesteś tutaj”; pasek „pro-kom.eu — wspólne wejście… pod koniec 2026”; statystyka „5 linii”.
- **Kontakt**: na dole te same karty linii („Szukasz monitoringu, strony albo naprawy telefonu?”).
- **Plan Twojej firmy**: plansza na całą szerokość kontenera, lista „Na tym planie” pod planem (4 kolumny).
- **Stopka**: „Cała oferta”, „Wszystkie marki”, „Konfigurator” (zamiast „Salon Lenovo/Dell” i „Dobierz zestaw w 60 s”).
- **Telefon** (aplikacja): nowe hasło w hero, „Salony marek” na starcie i w menu (wszystkie logotypy, Apple pierwszy), „Konfigurator” zamiast „Dobierz zestaw w 60 sekund”.

## 8. SEO — wymagania twarde („najwyżej we wszystkim”)
Strona sama nie gwarantuje pierwszego miejsca, ale musi nie zostawić Google żadnego powodu, żeby nas obniżyć. Lista kontrolna na koniec każdego etapu:
1. **Renderowanie**: SSG/ISR; pełna treść, linki i dane strukturalne w HTML bez JS; interakcje (koło, filtry, podgląd) tylko jako warstwa nad treścią.
2. **Adresy**: polskie, krótkie, bez parametrów dla stron indeksowanych (§1); `canonical` na każdej stronie; filtry wielokrotne `noindex,follow`; paginacja ofert jako kolejne adresy z linkami.
3. **Metadane**: unikalny `title` (≤60 znaków, „… | PRO-KOM Biznes Rabka-Zdrój”) i `description` (≤155) dla każdej strony, kategorii, marki i produktu — pola w Payload z podpowiedzią długości; Open Graph + obraz 1200×630.
4. **Nagłówki**: dokładnie jeden H1 na stronę (na głównej: hasło hero), logiczna hierarchia H2/H3.
5. **Dane strukturalne (JSON-LD)**: `Organization` + `LocalBusiness` (adres w Rabce, telefon, godziny, `areaServed`: Podhale/Małopolska), `BreadcrumbList` wszędzie, `Product` (marka, kategoria, zdjęcia — **bez `offers` z ceną**), `FAQPage` przy FAQ, `ItemList` w kategoriach, `WebSite` + `SearchAction` (wyszukiwarka → `/oferta?q=`). Walidacja w Rich Results Test.
6. **Wydajność (Core Web Vitals, telefon)**: LCP < 2,5 s, INP < 200 ms, CLS < 0,1; `next/image` (AVIF/WebP, `sizes`, wymiary), `priority` tylko dla obrazu LCP, czcionki przez `next/font` z `display: swap`, obrót koła na CSS (bez JS w pętli), mega-menu i modale ładowane leniwie.
7. **Obrazy**: opisowe `alt` (marka + model + kontekst), nazwy plików słowne (`posnet-ergo-online-kasa.webp`).
8. **Linkowanie wewnętrzne**: dział → kategoria → produkt → salon marki i z powrotem; okruszki; „Inne z rodziny”, „Zobacz też”; stopka z linkami do kluczowych stron.
9. **Lokalność**: frazy „Rabka-Zdrój”, „Nowy Targ”, „Zakopane”, „Podhale” naturalnie w treściach (dojazd, FAQ, O firmie, Kontakt); spójne NAP (nazwa, adres, telefon) na stronie, w wizytówce Google i katalogach.
10. **Mapa strony i roboty**: `sitemap.xml` (generowana z Payload, z `lastmod`), `robots.txt`, zgłoszenie w Google Search Console i Bing Webmaster Tools; 404 z wyszukiwarką.
11. **Migracja**: 301 ze wszystkich adresów pro-kom.pl na nowe odpowiedniki (mapa przekierowań przed przełączeniem), monitoring błędów indeksowania przez 8 tygodni.
12. **Poza stroną** (do planu marketingu, nie do kodu): wizytówka Google Business Profile (kategorie, zdjęcia, posty, odpowiedzi na opinie), prośby o opinie po wdrożeniach, regularne aktualności (KSeF, sezon), wpisy w katalogach branżowych i u partnerów (GoPOS, InsERT, Posnet, Elzab — listy partnerów/serwisów).

## 9. Kolejność prac w Claude Code (propozycja)
1. Rama: nagłówek, mega-menu, burger, szuflada zapytania, toast, rail (komponenty + dane z Payload).
2. Wyszukiwarka (API `/api/search`, indeks + słownik synonimów w Payload) i szybki podgląd.
3. `/oferta` (fasety po stronie serwera, URL-e §1, SEO).
4. `/` (sekcje §3; koło działów jako komponent kliencki).
5. `/konfigurator` (kolekcja `Configurator`, formularz → endpoint zapytań).
6. `/marki`, zmiany InsERT / O firmie / Kontakt / Plan / stopka.
7. Lista kontrolna SEO §8 i testy (Lighthouse telefon ≥ 90 we wszystkich kategoriach, Rich Results bez błędów).
