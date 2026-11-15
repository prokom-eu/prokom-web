# Audyt całości prokombiznes.pl — K3 + K3.1 (25.10.2026, wizualizacja v122)

Cel: sprawdzić, czy mamy wszystko do budowy w Claude Code, czy dane się zgadzają i czy całość trzyma wysoki poziom. Kontrola automatyczna (skrypt na danych seed i planszach) + przegląd każdego widoku na 1440 px i 390 px, w jasnym i ciemnym motywie.

## Wynik w jednym zdaniu
**Do budowy jest wszystko** (dane, wzorzec, specyfikacja, prompty, instrukcja). Spójność danych: zero błędów. **Do publikacji brakuje rzeczy spoza kodu:** zdjęć 2 kart, decyzji szefa o kilku tekstach na głównej, danych firmy w panelu i części filmów.

## 1. Co mamy (stan danych)
| Obszar | Stan | Szczegóły |
|---|---|---|
| Karty | ✅ | 269 kart, 266 widocznych: 250 gotowych, 16 do sprawdzenia (noindex), 3 do akceptacji szefa (ukryte) |
| Treść kart | ✅ | każda widoczna karta: opis w 3 akapitach; 209 z wyborem wersji, 153 z FAQ; mniej niż 8 parametrów tylko usługi i moduły programów (13) |
| Źródła | ✅ | tylko domeny producentów; bez źródła wyłącznie 6 naszych usług (sekcja się nie pokazuje) |
| Zdjęcia | ✅ / ⚠️ | **24 z 26 nowych kart ze zdjęciami** (91 zdjęć: Lenovo z elenovo.pl, Dell z dell.com; wycięte tło, kwadrat, WebP); bez zdjęć 2 (ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2) → zastępnik; usługi mają ikony |
| Filmy | ⚠️ | **122 z 266** pozycji z oficjalnym filmem (było 88; +34 w tej rundzie), wszystkie sprawdzone oEmbed; 73 o modelu, 45 o serii, 4 o marce; 38 po polsku, 83 po angielsku, 1 po niemiecku (Samsung WAF) |
| Plan Twojej firmy | ✅ | 12 scen, 186 punktów, 96 produktów, 0 punktów bez karty, każdy punkt ze zdjęciem; **57 z 96** produktów na planach z filmem |
| Gotowe zestawy | ✅ / ⚠️ | 23 zestawy, 0 elementów bez karty; 20 czeka na potwierdzenie listy zgodności |
| Salony Lenovo / Dell | ✅ | 44 + 34 karty, każda w dokładnie jednej serii |
| Zakazane treści | ✅ | 0 × Novitus, Honeywell, Verifone, Datalogic, nazwy sklepów, „w cenie”, „gratis”, leasing, raty; „zł” tylko w progu KSeF (przepis) |

## 2. Co poprawiłem w tym audycie
**Błędy danych**
- Salon Dell: stacje dokujące i wideokonferencje były wśród **laptopów**, monitory Dell Plus wśród **laptopów „Dell”**, Tower/Slim Essential wśród **laptopów Essential** → nowy dział **Akcesoria**, seria **Dell Plus** w Monitorach, Essential → **Dell Pro Desktop** (poprawione także w `marki-salony-k31.json`).
- ThinkCentre M „pożyczał” zdjęcie z ThinkCentre neo → ikona działu do czasu własnych zdjęć.
- Strona główna pokazywała „225 pozycji, 30 marek” (stan z 22.10) → 266 pozycji, 31 marek; w kodzie liczniki z bazy.
- Na stronie InsERT widniała robocza notatka „sprawdzić brzmienie przed publikacją” → publiczny podpis „Źródło: ksef.podatki.gov.pl · stan na 25.10.2026”; notatka tylko w panelu.
- Źródła Sharp/NEC nie przechodziły filtra domen → dodane `sharpdisplays.eu`.
- Filmy w obcym języku przy dopasowaniu „seria” (np. Dell Japan, Zebra po hiszpańsku) i instrukcja wymiany baterii odrzucone automatycznie.

**Wygląd — desktop**
- Bento „W skrócie”: 5 kafli zamiast 6 (bez osieroconego kafla), skróty bez „…”.
- Karty bez zdjęcia: zastępnik zamiast zepsutego obrazka (galeria, katalog, salon, rodzina, dobierz, GoPOS, InsERT, wyniki doboru); bez licznika „1 / 0”.
- Źródła: czytelne etykiety („Specyfikacja PSREF — ThinkBook 14 G9 AHP”, „Dokument PDF — Posnet”), host i ścieżka; sekcja znika, gdy brak źródeł.
- GoPOS: numery kroków wdrożenia były niewidoczne → widoczne.
- Salon: siatka serii bez osieroconych kart, plakietka klasy nie nachodzi na zdjęcie, poprawna odmiana „6 działów”.
- „Wszystkie Lenovo” → „Cała oferta Lenovo →”.
- **Nowa stopka** (4 kolumny: firma + CTA, Oferta, Programy, Kontakt; pas prawny).
- **Strona główna:** stary plan v20 (8 scen, siatka) zastąpiony Planem 2.0 (12 scen, popup z filmem) — ten sam komponent; karty „Najczęściej wybierane” na tle studio.

**Wygląd — telefon**
- Ciemne karty na Start (hero, Plan) miały siatkę → miękkie poświaty.
- Arkusz punktu planu: tekst przyklejony do krawędzi ekranu → margines 16 px.
- Dziwne odstępy w „Szukaj w 266 pozycjach”, „Pokaż 39 pozycji”, „Wyślij zapytanie · 2 poz.”, „Zapytaj o ten zestaw”, „Dodaj cały plan” → teksty składane w całości (zasada w spec.).
- „Marki w ofercie → Lenovo” → „Wszystkie 31”.

**Zdjęcia (25.10, po audycie):** na prośbę Krystiana pobrane przez Chrome — 12 kart Lenovo z elenovo.pl i 12 kart Dell z dell.com (91 zdjęć), obrobione jak w K3 i dodane do paczki, artefaktu i plansz. Plansza „karta bez zdjęcia” pokazuje teraz ThinkPad P1 Gen 9.

## 3. Czy wszystko się zgadza (spójność)
| Sprawdzenie | Wynik |
|---|---|
| Punkty planów wskazują istniejące, widoczne karty | 186 / 186 |
| Elementy zestawów wskazują istniejące karty | 100% |
| Karty Lenovo/Dell w salonie (bez dubli i bez sierot) | 78 / 78 |
| Zdublowane nazwy kart | 0 |
| Puste kategorie | 0 |
| Nieprawidłowe ID filmów | 0 |
| Liczby w dokumentach = liczby w danych (`PRZEKAZANIE-K31`, `K31-ZMIANY`, `START-TUTAJ`, xlsx) | tak |

## 4. Czego brakuje — lista do zamknięcia
| # | Co | Kto | Blokuje |
|---|---|---|---|
| 1 | Zdjęcia 2 kart (ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2) + przejrzenie 3 kart ze zdjęciami „rodziny” (X9 → X9 15p, P3 Tower → P4, Dell Plus bez frontu) | Krystian | nic (zastępnik) |
| 2 | Dane firmy w panelu: NIP, adresy i godziny salonów | Krystian / szef | staging |
| 3 | Plakietki „ulga do 700 zł”, „0 zł przez 12 mies.” i wpis „Terminal za 0 zł” na głównej — zostają czy znikają (zasada „bez cen”) | szef | publikację głównej |
| 4 | 20 zestawów — lista zgodności (kable szuflad, protokoły wag, PolCard + GoPOS) | Krystian | publikację tych zestawów |
| 5 | 16 kart „do sprawdzenia” (10 z K3, 6 z K3.1) | Krystian | indeksowanie tych kart |
| 6 | Filmy: 144 pozycje bez filmu — dopisywać w panelu (wyszukiwarka nie pokazuje filmów osadzonych na stronach Synology, Kyocera, APC, Microsoft, PolCard, Sharp/NEC — trzeba wybrać ręcznie z ich kanałów); przejrzeć 4 filmy „seria” wskazane w xlsx | Krystian | nic (sekcja bez filmu się nie pokazuje) |
| 7 | Oś KSeF i fakty GoPOS w dniu publikacji | Krystian | publikację stron GoPOS/InsERT |
| 8 | Pytania do szefa z K3 (opieka IT, obietnice, status partnera) | szef | publikację usług |

## 5. Ocena poziomu
- **Produkt, salony, plan, GoPOS, InsERT, aplikacja** — spójny system: jedno tło studio, jeden język kart, filmy tylko po kliknięciu, ciemny motyw bez białych plam, telefon jak aplikacja (dolny pasek, arkusze, przyklejone CTA).
- **Ryzyka jakości do pilnowania w kodzie:** zastępnik zdjęć (żadnych pustych `<img>`), brak żądań do YouTube przed kliknięciem, liczniki z bazy, składanie tekstów z liczbami, odmiana liczebników.
- **Na później (osobne zadania, nie teraz):** porównywarka kas, filtry po parametrach, zdjęcia z wdrożeń i opinie klientów, filmy po polsku tam, gdzie producent je doda.

## 6. Runda v124 (25.10, po uwagach Krystiana)
- **GoPOS:** nowe hero — scena urządzeń zamiast kafelków, kroki zamówienia w hero (klik podświetla urządzenie), bilecik i „GoPOS Now”; telefon w tym samym stylu.
- **InsERT:** sekcja **InsPunkty** (nie „inCoiny”) — jak działa w 5 krokach + kalkulator zużycia (presety, liczniki, odmiana), notatki o Subiekcie 123, biurach i charakterze opłaty; fakty z insert.com.pl, bez cen.
- **Strona główna:** „Najczęściej wybierane” = Posnet Ergo, Elzab K10, Sunmi D3 PRO, ThinkBook 14, ThinkCentre neo 50s/55s, terminal PolCard, Posnet Thermal HX, Subiekt nexo; usunięte stare zbiorcze pozycje v20 (bizhub C301i/C451i/C551i, „Urządzenia wielofunkcyjne Kyocera”) — zastąpione prawdziwymi kartami.
- **O firmie i Kontakt 2.0:** nowe widoki (hero, liczby, 8 zasad, 4 linie, autoryzacje, mapa dojazdu, formularz z RODO, FAQ); telefon: Kontakt z dojazdem i skrótem O firmie. Tylko Rabka, jeden e-mail, bez obietnic czasu.
- **Karty wielomodelowe:** przegląd 210 kart — 6 do rozdzielenia (→ 11 nowych + 5 × 301), 49 z krótkim H1 i chipami „W tej karcie”, 155 bez zmian; SEO przez `ProductGroup` + aliasy modeli (K31-ZMIANY §13.5, arkusz „Karty wielomodelowe”).
- Poprawka danych: nazwa krótka dla nazw z zagnieżdżonym nawiasem (QNAP „TS-464U(-RP)”).
- **Treści kart (audyt 266 kart):** każda karta ma teraz ≥ 3 FAQ (489 nowych pytań w 134 kartach), 24 nowe opisy, brakujące parametry (procesor, system, jasność monitorów, waga XPS 16) uzupełnione z danych konfiguratora i oficjalnych specyfikacji; arkusz „Treści kart” w xlsx.
- **Konfigurator 2.0:** prostszy i czytelny — 3 kroki, gotowe konfiguracje wypełniają opcje, wyjaśnienie każdej opcji, „Doradźcie”, nic nie jest ukryte (wcześniej znikały opcje z długimi nazwami, m.in. generacja ThinkBooka), postęp wyboru.
- **Telefon — komplet (v126):** dodane ekrany O firmie, Opieka IT, branża, kreator (krok + wynik), aktualności, wpis; produkt z chipami „W tej karcie”; prototyp o płynnej szerokości; test 29 ekranów × 360/390/414 px — 0 poziomego przewijania, cele dotykowe poprawione. Pełna specyfikacja: `MOBILE-APLIKACJA.md`, spis materiałów: `INDEKS.md`.
