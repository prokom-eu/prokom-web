# Audyt prokombiznes.pl — wizualizacja v147 (28.10.2026)

Zakres audytu:
- 19 widoków na komputerze (start, oferta, konfigurator, marki, salony, produkt, kategoria, zestawy, plan, GoPOS, InsERT, vending, Opieka IT, KSeF, ulga, O firmie, kontakt);
- 10 ekranów telefonu;
- testy automatyczne: błędy, poziome przewijanie, kontrast, nagłówki, alt, przyciski bez etykiet;
- katalog: 339 pozycji, 34 marki, 23 kategorie, 23 zestawy.

## Wynik ogólny
- **Działa i jest dopracowane:**
  - zero błędów konsoli na wszystkich widokach;
  - zero poziomego przewijania na 390 / 768 / 1024 / 1280 / 1440 px;
  - kontrast w obu motywach poprawiony;
  - jeden H1 na każdej podstronie;
  - zero cen; daty i fakty o KSeF i uldze mają źródła;
  - liczby GoPOS opisane jako wyniki klientów GoPOS ze źródłem.
- **Ocena:**
  - wizual i układ: 9/10;
  - logika i konwersja: 8,5/10;
  - treści: 8/10;
  - SEO i dostępność: 7/10;
  - „prawdziwość” (zdjęcia, opinie, cytaty): 5/10 — **to największa luka przed produkcją.**

## A. Przed produkcją — obowiązkowe
1. **Prawdziwe zdjęcia** zamiast zastępników:
   - właściciel;
   - sklep w Rabce;
   - serwis;
   - 3–6 realizacji u klientów.
   Bez tego strona wygląda jak szablon.
2. **Opinie:** 1 prawdziwa (Panorama Firm) i 2 zastępniki. Potrzebne 3–6 prawdziwych opinii z Google lub od klientów firmowych za zgodą, z datą i źródłem.
3. **Cytat właściciela** w sekcji O firmie („Prowadzę PRO-KOM w Rabce od 2004 roku…”) — do akceptacji szefa słowo w słowo.
4. **Liczby do potwierdzenia przez szefa:** „100+ firm pod stałą opieką”, „Na Podhalu od 2004”. 60 minut jest potwierdzone.
5. **Logo Apple** — potwierdzić zgodę (bez zmian).
6. **KSeF po 1.01.2027:**
   - licznik dojdzie do zera;
   - strona /ksef, kafel Szybkiego startu i karta w mega-menu muszą się same przełączyć na wersję „KSeF obowiązuje — kary, tryby awaryjne”;
   - to zapisujemy w specyfikacji jako przełączanie po dacie.
7. **Dostępność i SEO:**
   - zdjęcia produktów w kartach (zestawy, plan, kategoria, salony, produkt) mają pusty `alt` — ma być nazwa produktu;
   - 10 przycisków-ikon na stronie głównej bez `aria-label`.
8. **Wideo:** filmy przez youtube-nocookie ładować dopiero po kliknięciu (miniatura + przycisk), żeby nie potrzebować zgody na cookies przy Plausible.

## B. Strona główna — co jeszcze poprawić
1. **Za długa: ok. 14 100 px, 13 sekcji.**
   - Marki są pokazane dwa razy: pasek przewijany i siatka 16 marek. **Rekomendacja:** usunąć pasek przewijany, zostawić siatkę ze statusami (autoryzowany serwis / partner).
   - Sekcja „Ile numerów masz w telefonie do spraw IT?” powtarza Opiekę IT (kafel w Szybkim starcie i karta w „Systemach”). **Rekomendacja:** usunąć albo połączyć z „Systemami”.
   - Efekt: około −1 800 px, mniej powtórzeń.
2. **Konfigurator** znów jest w 4 miejscach treści (hero, Szybki start, karta pod najczęściej wybieranymi, kafle „Dla kogo”). Do decyzji, czy zostawiamy 4, czy kafle „Dla kogo” mają prowadzić do zestawów lub planu danej branży.
3. **H1** „Wszystko, czego potrzebuje Twoja firma.” jest ładne, ale nie mówi, co i gdzie. Propozycja: „Kasy, komputery i programy dla firm z Podhala.” — sens zostaje, a dochodzą słowa kluczowe i lokalizacja.
4. **Boczny pasek nawigacji** ma nieaktualne etykiety: „Pięć działów”, „Realizacje”, „GoPOS, InsERT, opieka”. Ma odpowiadać nowym sekcjom: Działy, Marki, Najczęściej wybierane, Dla kogo, Plan, Jak pracujemy, Opinie, Pytania, Kontakt.
5. **Stopka:** Konfigurator jest w dwóch kolumnach — zostawić raz. Dodać link do usług (przegląd kasy, serwis).

## C. Oferta i kategorie (architektura)
1. Kategoria **„Komputery, tablety i telefony” ma 83 pozycje** — za szeroka. Podzielić na: Laptopy, Komputery i All-in-One, Monitory, Tablety, Telefony. Podkategorie już są w danych, trzeba je pokazać w mega-menu i ofercie.
2. **Dział „Serwis i usługi” ma 10 pozycji**, a to wizytówka firmy z serwisem — patrz D.
3. **Cienkie kategorie:**
   - Terminale płatnicze — 3;
   - Kioski i ekrany kuchenne — 2;
   - Antywirus i firewall — 2;
   - Podpis — 2;
   - Licencje biurowe — 5.
   Albo je uzupełnić, albo połączyć, żeby nie wyglądały na puste.
4. **Automaty vendingowe** — 23 pozycje, w tym 22 Optivendi (tylko „we współpracy”). To 7% katalogu. Do decyzji szefa, czy to faktycznie kierunek sprzedaży.

## D. Propozycje rozbudowy oferty (do potwierdzenia, co PRO-KOM faktycznie robi i od kogo kupuje)

**Usługi** — najszybszy zysk, bo nie wymagają nowych dostawców:
- fiskalizacja kasy i zaprogramowanie towarów oraz stawek VAT;
- wymiana kasy i zakończenie pracy starej kasy (odczyt pamięci) — przy zmianie kasy albo likwidacji firmy;
- integracja kasy z programem, wagą i terminalem;
- montaż i konfiguracja sieci oraz Wi-Fi dla gości (z linkiem do PRO-KOM Instalacje);
- kopie zapasowe — konfiguracja NAS i kopii w chmurze z testem odtworzenia;
- poczta firmowa i Microsoft 365 — przeniesienie i konfiguracja;
- przygotowanie komputera do pracy: konfiguracja, przeniesienie danych, konta;
- przegląd IT i audyt bezpieczeństwa jako osobna pozycja (dziś jest tylko w Opiece IT);
- linki krzyżowe: monitoring (Instalacje), strona i sklep internetowy (Software).

**Producenci popularni w małych firmach, których dziś brak:**
- HP — laptopy i drukarki biurowe;
- Brother — drukarki laserowe i etykiet;
- Epson — drukarki i projektory;
- Logitech — kamery i zestawy słuchawkowe do wideokonferencji;
- dodatkowi operatorzy terminali płatniczych — tylko jeśli PRO-KOM ma z nimi umowy.

Nie dodajemy niczego, czego firma nie sprzedaje. Najlepsze źródło decyzji to raport sprzedaży z Subiekta GT za ostatnie 12 miesięcy: top 30 pozycji i top 10 marek. Z niego ustawiamy też „Najczęściej wybierane”.

## E. Telefon (aplikacja)
- **Mocne:**
  - dolny pasek;
  - Szybki start z 5 sytuacjami;
  - oferta jak w aplikacji;
  - Konfigurator krokami;
  - przyklejone przyciski.
- **Do poprawy:**
  1. „Najczęściej wybierane” na telefonie ma starą listę — wyrównać do 16 z komputera, z tym samym filtrem.
  2. Ekran Opieki IT jest bardzo długi — zwinąć „Zakres opieki” i „Dla kogo” w akordeony.
  3. Ekran produktu — dodać przycisk „Zadzwoń” obok „Dodaj do zapytania” w dolnym pasku, bo przy sprzęcie dla firm telefon konwertuje lepiej.
  4. Ostateczny test na prawdziwym telefonie (Safari na iOS i Chrome na Androidzie) — dopiero na wdrożeniu testowym.

## F. Do zrobienia w ostatecznej wizualizacji (kolejność)
1. Usunięcie paska marek i sekcji „Ile numerów…”, nowe H1, poprawione etykiety bocznego paska, stopka bez powtórzeń.
2. Podział kategorii komputerów na 5 kategorii (mega-menu i oferta).
3. Nowe usługi w dziale „Serwis i usługi” — po potwierdzeniu listy.
4. `alt` w kartach produktów, `aria-label` w przyciskach-ikonach, wideo ładowane po kliknięciu.
5. Przełączanie KSeF po 1.01.2027.
6. Telefon: najczęściej wybierane, akordeony w Opiece, „Zadzwoń” na produkcie.
7. Zastępniki zdjęć i opinii oznaczone wyraźnie jako „do podmiany” — prawdziwe treści dostarcza firma.
