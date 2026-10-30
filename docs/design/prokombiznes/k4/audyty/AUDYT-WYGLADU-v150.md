# Audyt wizualny i UX — prokombiznes.pl (komputer + telefon), runda 9

Data: 29.10.2026 · Zakres: Strona.dc.html (wszystkie widoki z listy) przy 1440 / 1024 / 768 / 390, tryb ciemny (`?dk=1`), `?ksefpo=1`, 29 ekranów aplikacji `App-*.dc.html` (390×844), ścieżki kliknięć.
Folder zrzutów: `/tmp/claude-0/-home-claude/0f1a5762-3d21-5c87-8225-cf2f34242856/scratchpad/viz/shots/` (dalej: **SHOTS/**). Pełne strony: `SHOTS/audyt9_d_<n>.png` (komputer 1440, n = kolejność z listy URL-i niżej), `SHOTS/audyt9_dk_<n>.png` (ciemny/ksefpo), `SHOTS/audyt9_m_<n>.png` (aplikacja), `SHOTS/audyt9_r390_*`, `audyt9_r768_*`, `audyt9_r1024_*`. Kadry i zbliżenia: `SHOTS/a9c/`.

Indeks `audyt9_d_<n>`: 0 start, 1 oferta, 2 kreator, 3 marki, 4 plan, 5 gopos, 6 insert, 7 zestawy, 8 ofirmie, 9 kontakt, 10 opieka, 11 vending, 12 ksef, 13 ulga, 14–19 kategorie (laptopy, mfp, kasy, niszczarki, serw, akcesoria-biuro), 20–25 marki (Brother, Apple, Lenovo, Posnet, Fellowes, Logitech), 26–29 produkty (ergo, iphone-17, brother-mfc, przkas).

Co sprawdziłem i działa (bez przewijania w bok na wszystkich 30 widokach × 4 szerokości, brak błędów JS, obrazki lazy doładowują się po przewinięciu, ścieżka start → dział → kategoria → produkt → „Dodaj do zapytania” → koszyk działa, Szybki start: 5/5 kafli prowadzi we właściwe miejsca, mega-menu, wyszukiwarka, „Pokaż kolejne” 24→48, filtr i sortowanie działają, konfigurator przechodzi do wyniku). Poniżej wyłącznie problemy.

---

## KRYTYCZNE (5)

### K1. Główne CTA mają ciemny tekst na niebieskim — reset `.site button{color:inherit}` wygrywa z klasami przycisków
- **Widok / szerokość:** wszystkie strony, wszystkie szerokości, tryb jasny.
- **Co jest źle:** reguła `.site button{color:inherit}` ma specyficzność (0,1,1), a `.g4zq{color:var(--accInk)}` i `.addb{color:var(--accInk)}` tylko (0,1,0). Efekt: przycisk **„Zapytanie”** w nagłówku (`.g4zq`), wszystkie **„+ Do zapytania”** na kartach (`.addb`, 22 na /oferta), przycisk wyszukiwania w bocznej szynie (`.g4rs`) mają tekst/ikonę `#0B1124` na `#244FB0`: kontrast **2,5:1** (WCAG wymaga 4,5:1). Najważniejszy przycisk na stronie wygląda jak wyłączony. Ten sam reset psuje też inne elementy: placeholder w kafelku „Wpisz, czego potrzebujesz” `.s5dzxs` (jasny `#C9D3EA` na białym polu — **1,5:1**, praktycznie niewidoczny), link „+ 2 pozycje z listy” `.s4ktl2` (miał być niebieski), `.kp7s`, `.s4nb`, `.g4mb`.
- **Naprawa:** zmienić reset na zerową specyficzność: `.site :where(button){color:inherit}` (analogicznie `.site :where(a)` jeśli istnieje). Jedna linia naprawia wszystkie przypadki naraz. Po zmianie sprawdzić, czy `--accInk` = `#FFF` w trybie jasnym (jest) i `#06102A` w ciemnym (jest).
- **Zrzuty:** `SHOTS/a9c/z_btns.png` (Zapytanie + szyna), `SHOTS/a9c/z_addb.png`, `SHOTS/a9c/z_s5dzxs.png`.

### K2. W koszyku zapytania pole „Wiadomość” jest wypełnione tekstem `[object Object]`
- **Widok:** szuflada „Twoje zapytanie” (klik „Zapytanie” w nagłówku albo kafel „Zapytaj o wycenę”), każda strona, 1440.
- **Co jest źle:** `[role=dialog][aria-label="Twoje zapytanie"] textarea` ma `value="[object Object]"` (placeholder „Np. liczba stanowisk, termin otwarcia…” w ogóle się nie pokazuje). Klient widzi śmieć w formularzu, który ma wysłać.
- **Naprawa:** w powiązaniu wartości textarea podawać string (np. `note.text ?? ''`), nie obiekt; domyślnie pusty string.
- **Zrzut:** `SHOTS/a9c/cart.png` (pełny: `SHOTS/audyt9_cart.png`).

### K3. Strony kategorii mają treści z kategorii „Laptopy” i zdublowany okruszek
- **Widok:** `?w=kategoria&k=mfp|kasy|niszczarki|serw|akcesoria-biuro` (i każda kategoria wybrana z menu), wszystkie szerokości.
- **Co jest źle:** na każdej kategorii widać filtr **„DO CZEGO: Biuro i recepcja / Praca w terenie / Grafika i CAD / Szkoła / Dla szefa”**, filtr „SERIA” i blok **„Nie wiesz, który? — Odpowiedz na 3 pytania w salonie marki — podpowiemy serię. [Dobierz laptop]”**. Na kasach fiskalnych i niszczarkach przycisk „Dobierz laptop” to kompromitacja. Okruszek ma ostatni element dwa razy: „Start / Oferta / Kasy fiskalne / **Kasy fiskalne**”.
- **Naprawa:** zastosowania („Do czego”), serie i tekst CTA trzymać w danych kategorii; gdy kategoria ich nie ma — ukryć sekcję (`v-if`), CTA ustawić na „Dobierz {nazwa w bierniku}” albo „Zapytaj o dobór”. Okruszek: nie dopisywać bieżącej kategorii drugi raz (ostatni element = nazwa kategorii, bez linku).
- **Zrzuty:** `SHOTS/audyt9_d_16.png` (kasy), `SHOTS/audyt9_d_17.png` (niszczarki), `SHOTS/a9c/d17-0.png`.

### K4. Na produkcji zostały teksty-zaślepki
- **Widok:** start (sekcja „Co mówią klienci” `#s4-opinie .s4q` i „Słowo od właściciela” `#s4-fakty .s4own`), O firmie, 1440 i niżej.
- **Co jest źle:** 2 z 3 opinii to „Miejsce na opinię z Google — wklejamy oryginalny tekst, bez zmian.” / „Imię i inicjał · opinia Google · data” oraz „Miejsce na wypowiedź klienta firmowego…” / „Imię, firma · klient od roku …” — z pięcioma gwiazdkami. Zamiast zdjęcia właściciela: szare paski i „Zdjęcie właściciela — wkrótce”. Na O firmie: „zdjęcia zespołu i lokalu — wkrótce”. Pięć gwiazdek przy zaślepce wygląda jak fałszywa opinia.
- **Naprawa:** do czasu zebrania opinii pokazać jedną prawdziwą opinię (Panorama Firm) jako szeroki cytat + link „Zobacz opinie w Google” zamiast pustych kart; zdjęcie właściciela zrobić przed publikacją albo zastąpić blok zdjęciem lokalu / mapą Rabki. Żadnych gwiazdek bez prawdziwej oceny.
- **Zrzut:** `SHOTS/a9c/z_opinie.png`.

### K5. Strona WWW na telefonie (390 px): sekcje dwu- i czterokolumnowe się nie składają — tekst po jednym słowie w linii, nakładanie
- **Widok / szerokość:** 390 px (dotyczy każdego, kto wejdzie na stronę WWW z telefonu, nie do „apki”), częściowo 768 px.
- **Co jest źle (zmierzone w DOM, kolumny poniżej 120 px z długim tekstem):**
  - Produkt `?p=ergo` (i każdy produkt): hero `section.phero` zostaje w dwóch kolumnach — galeria 50 px i tytuł „Posnet / Ergo / Online” w trzech liniach, opis po jednym słowie, kafelki cech `0,6 kg / WiFi lub LTE…` po 40 px, „Gwarancja producenta / Gotowe do pracy / Serwis” nachodzą na siebie; bento „W skrócie” 3 kolumny po ~60 px; „Wybierz wersję” w 60-pikselowej kolumnie; `div.two` (opis + „Dla kogo”) 167/111 px; `section.band` 107/83 px.
  - Salon marki `?w=marka&m=Brother` (wszystkie salony): hero `.sl3-g` ucina tytuł („Drukar… skaner… etykiet”), lista „Kupujesz drukarkę” wychodzi na zdjęcie; `div.sl3-pl.four.big` — 4 karty po 71 px (nazwy modeli ucięte), `div.sl3-dob`, `section.sl3-srv.ex` 2×93 px.
  - GoPOS `?w=gopos`: hero nakładanie warstw (karty „Stolik 4”, „GoPOS Now”, kroki 1–4 na tekście), `ol.gph-flow` 4×54 px, `section.gp3-hub`, `div.gp3-k3`, `div.gp3-cs` 4×70 px, `div.steps5` 5×56 px, `div.ig3` 4×71 px, statystyki „6000+ / od 2016 / 30+ / 4,5/5” w 4 kolumnach.
  - InsERT: `section.dh` 2×93 px (hero), `div.picker`, `div.isp-notes`, `div.tiles6`, `div.in3-req.wide`.
  - Start i Plan: `div.plst` („Na tym planie”) 4×68 px — nazwy „Wi-Fi w sali”, „Ekran w witrynie” łamane po literach.
  - Vending: `ol.vd3-st` 4×70 px, `section.vd3-soft`, `div.vd3-dla` 3×100 px. Kontakt: `div.ktm` 3×100 px. Wszędzie: `div.two`, `section.band` (2 kolumny).
  - 768 px, produkt: trzy kroki „Zacznij od gotowej konfiguracji / Czego nie wiesz / Dodaj do zapytania” obcięte („konfigurac”, „Doradzc”), cechy pod przyciskiem zgniecione.
- **Naprawa:** jedna wspólna reguła breakpointów zamiast poprawiania sekcja po sekcji: `@media (max-width:760px){ .two,.band,.phero,.sl3-g,.dh,.gp3-hub,.vd3-soft,.in3-req{grid-template-columns:1fr} .sl3-pl.four,.gp3-cs,.ig3,.tiles6,.vd3-dla,.ktm,.isp-notes,.gp3-k3{grid-template-columns:repeat(2,1fr)} .plst,.gph-flow,.steps5,.vd3-st{grid-template-columns:1fr} }`; serie w salonach i `sl3-pl` lepiej jako poziomy `scroll-snap` (karta 78% szerokości). Hero GoPOS: na <760 px schować pływające karty (`display:none`) i zostawić jedno zdjęcie. Docelowo: z telefonu przekierowywać na wersję „apki”, ale WWW i tak musi się poprawnie składać (Google ocenia mobile-first).
- **Zrzuty:** `SHOTS/a9c/r390_2-0.png` (produkt), `SHOTS/a9c/r390_3-0.png` (Brother), `SHOTS/a9c/r390_4-0.png` (GoPOS), `SHOTS/a9c/r390_0-2.png` (plan na starcie), `SHOTS/a9c/r768_2.png` (produkt 768). Pełne: `SHOTS/audyt9_r390_0..5.png`.

---

## WAŻNE (15)

### W1. Strona startowa jest za długa i powtarza te same wejścia
- **Widok:** start, 1440: **13 086 px ≈ 14,5 ekranu**, 15 sekcji (390 px: 25 182 px).
- **Co jest źle:** konfigurator jest proponowany 4× (przycisk w hero, kafel Szybki start, blok `.kp7` „Nie wiesz, od czego zacząć? Wybierz rodzaj firmy”, „Dobierz rozwiązanie” w branżach); wyszukiwarka 4× (nagłówek, szyna, kafel `.s5dzxs` w siatce działów, `.kp7s`); „Cała oferta · 427” 5×; lista branż 3× (`.kp7` chipy, „Obsługujemy każdą firmę” 12 kafli, zakładki planu 18 typów); orbita działów w hero dubluje siatkę działów pod spodem. Pełny osadzony Plan (`#s4-plan`, 1611 px) w środku strony startowej.
- **Naprawa:** usunąć cały blok `.kp7` (Szybki start to już robi); w siatce działów zamiast kafla-wyszukiwarki dać 6. dział albo „Gotowe zestawy”; Plan zastąpić kartą-zajawką (zdjęcie planu + „Zobacz plan dla swojej firmy →”); „Opinie” i „Słowo od właściciela” połączyć w jedną sekcję. Cel: ≤ 8 ekranów na 1440.
- **Zrzuty:** `SHOTS/a9c/st0.png`, `st1.png`, `st2.png` (przegląd całej strony).

### W2. Filtr „Marka” na /oferta: kafel Brother jest pusty (sam numer „28”)
- **Widok:** `?w=oferta` i kategorie, 1440/1024, jasny i ciemny.
- **Co jest źle:** `.of5brl img` z `logo-brother.svg` ma wyliczone 0×0 px (SVG ma tylko `viewBox`, w kontenerze flex z `max-width:100%` nie dostaje szerokości). Kafel PRO-KOM ma sam tekst zamiast logo — niespójnie.
- **Naprawa:** `.of5brl img{height:22px;width:auto;max-width:96px}` albo dopisać `width="359" height="82"` w pliku SVG; PRO-KOM — użyć logotypu jak w stopce.
- **Zrzut:** `SHOTS/a9c/of_side.png` (jeśli brak — `SHOTS/audyt9_oferta_side.png`), ciemny: `SHOTS/a9c/dk1-0.png`.

### W3. Tryb ciemny: logo PRO-KOM na karcie „Opieka IT w abonamencie” znika
- **Widok:** start `?dk=1`, sekcja „Systemy, które wdrażamy”, karta 3; 1440.
- **Co jest źle:** `.nxlg` ma białą plakietkę `rgb(255,255,255)`, a w środku `brand-prokom-biznes-ciemne.svg` (wersja z białym napisem na ciemne tło) — widać tylko niebieską kreskę i „BIZNES”.
- **Naprawa:** w `.nxlg` zawsze używać wersji jasnej logo (ciemny napis), bo plakietka jest biała w obu trybach; albo w `.dk .nxlg{background:transparent}` i zostawić wersję ciemną.
- **Zrzut:** `SHOTS/a9c/z_dkopieka.png`.

### W4. Konfigurator: licznik „Krok X z 3” przy czterech krokach
- **Widok:** `?w=kreator` (komputer: „KONFIGURATOR · KROK 2 Z 3” nad paskiem z 4 etapami Firma / Sytuacja / Szczegóły / Wynik) i `App-Kreator` („Krok 1 z 3”, pasek 4 segmenty).
- **Naprawa:** liczyć „Krok 1 z 4 … Wynik” albo pasek mieć z 3 segmentów i wynik jako stan końcowy (bez numeru). Jedna logika na obu platformach.
- **Zrzuty:** `SHOTS/a9c/kre1-0.png`, `SHOTS/a9c/m_single.png` (5. ekran).

### W5. Vending: numery kroków „Od pomysłu do pierwszej sprzedaży” prawie niewidoczne
- **Widok:** `?w=vending`, 1440.
- **Co jest źle:** `ol.vd3-st li > i > span` ma kolor `#46506B` na granatowym kółku `#0A1430` (~2:1), mimo że `i` ma `#FFB27A` — jakaś reguła nadpisuje `span`.
- **Naprawa:** `.vd3-st i span{color:inherit}` (albo `#fff`).
- **Zrzut:** `SHOTS/audyt9_d_11.png` (sekcja ok. y=1850), `SHOTS/a9c/ov_ov.png`.

### W6. Wersja `?ksefpo=1` (po 1.01.2027) zostawia teksty sprzed terminu
- **Widok:** `?w=ksef&ksefpo=1`, 1440.
- **Co jest źle:** przełączają się tylko hero, licznik i statusy osi czasu. Zostaje: pytanie w quizie „Ile sprzedajesz na fakturach poza KSeF miesięcznie? do 10 000 zł brutto / więcej” (limitu już nie ma), wynik „Obowiązek… działa od 1 kwietnia 2026 r. … od 1 stycznia 2027 r. za błędy grożą kary” (czas przyszły), karta kar „W 2026 r. obowiązuje okres przejściowy bez tych kar”, FAQ „Do 31 grudnia 2026 r. można jeszcze wystawiać poza KSeF…”, „Stan na 28.10.2026”. Na starcie i w stopce dalej „KSeF 2027”.
- **Naprawa:** w trybie po terminie ukryć pytanie o limit, przepisać 3 zdania na czas przeszły („Od 1 stycznia 2027 r. …”), datę „stan na” aktualizować przy przełączeniu; etykietę w stopce zmienić na „KSeF”.
- **Zrzut:** `SHOTS/a9c/dk7-0.png` (pełny `SHOTS/audyt9_dk_7.png`).

### W7. /oferta przy 1024 px: filtry rozłożone nad wynikami (~600 px zanim pojawi się pierwszy produkt)
- **Widok:** `?w=oferta`, 1024 (i kategorie).
- **Co jest źle:** boczny panel `aside.of4sd` przechodzi w pełną szerokość nad siatką; pierwsza karta produktu dopiero na ~1400 px. Przy 1440 ten sam panel ma `max-height:790px; overflow:auto` przy treści 979 px — drugi pasek przewijania wewnątrz panelu.
- **Naprawa:** poniżej 1200 px: przycisk „Filtry (n)” otwierający szufladę + aktywne filtry jako chipy nad wynikami; przy 1440 skrócić panel (Marka: 6 kafli + „Pokaż wszystkie”) zamiast przewijania wewnętrznego.
- **Zrzut:** `SHOTS/a9c/r1024_1.png`.

### W8. Typografia nagłówków: wiszące słowa i jednoliterowe spójniki na końcu linii (systemowo)
- **Widok:** wiele stron, wszystkie szerokości (390 px: do 19 przypadków na stronę).
- **Przykłady 1440:** h1 startu kończy linię na „i” („Kasy, komputery i / programy”), `#s4-jak h2` kończy linię na „—”, kreator „…rozwiązanie dla / Twojej firmy”, zestawy h1 „—” i „i” na końcu linii + wiszące „razem.”, InsERT h1 „…KSeF. I / gotowe”, h2 „Przygotujmy / firmę.”, GoPOS h2 „Jedna / kolejka.”, Opieka h1 „…gdy coś / stanie.”, O firmie h1 „na / lata.”, Vending baner „Cię nie / ma.”, KSeF h2 „mojej / firmy?”, wspólny baner produktu „…całego / stanowiska?” (na każdym produkcie), tytuł produktu „Brother MFC-L2922DW / / MFC-L2862DW”, salony: „…pracy w / całym biurze”, „gotowe do / spotkań”, tabela Fellowes 4× wiszące słowo.
- **Naprawa:** globalnie `h1,h2,h3,.h1,.h2{text-wrap:balance}` i `p{text-wrap:pretty}`; w danych/szablonie wstawiać twardą spację po jednoliterowych słowach i przed „—” (`/ ([aiouwz]) /gi → ' $1 '`).
- **Zrzuty:** `SHOTS/a9c/d6-0.png` (InsERT), `SHOTS/a9c/ov_ov.png` (vending), `SHOTS/audyt9_d_26.png` (baner produktu).

### W9. Aplikacja: ten sam błąd resetu kolorów — kafle i przyciski z ciemnym tekstem
- **Widok:** `App-Start`, `App-Kreator-wynik`, `App-Marka` i inne.
- **Co jest źle:** `.ap a, .ap button{color:inherit}` nadpisuje: kafle Szybki start `.m5i` (miał być biały tekst na gradiencie — jest granatowy), przycisk **„Wyślij”** na przyklejonym pasku wyniku konfiguratora `.m7nb.ok` (granatowy tekst na zielonym, przyklejony do górnej krawędzi zamiast wyśrodkowany), linki „Wszystkie kategorie” `.m5dall` w kolorach działów, „Zapytaj o ten wariant” `.m35-ask` (miał być niebieski), `.m5op`, `.m5dof`.
- **Naprawa:** `.ap :where(a,button){color:inherit}`; dla `.m7nb` dodać `display:inline-flex;align-items:center;justify-content:center`.
- **Zrzuty:** `SHOTS/a9c/z_m5i.png`, `SHOTS/a9c/z_krebar.png`.

### W10. Aplikacja: podtytuł w hero powtarza H1; inny przekaz niż na komputerze
- **Widok:** `App-Start`, `App-Start-ciemny`.
- **Co jest źle:** H1 „Kasy, komputery i programy dla firm.” + podtytuł „Kasy, komputery i programy — z jednego miejsca.” (te same słowa dwa razy). Komputer: „Wszystko z jednego miejsca — z Rabki.”
- **Naprawa:** w aplikacji użyć tego samego podtytułu co na komputerze („Wszystko z jednego miejsca — z Rabki.”).
- **Zrzut:** `SHOTS/a9c/m0-0.png`.

### W11. Ramki aplikacji: wysokość nie pasuje do treści — ucięte karty albo puste płótno
- **Widok:** prezentacja ekranów `App-*` (to widzi szef).
- **Co jest źle (wys. ramki vs treść):** ucięte w połowie elementu: App-Start 2900 vs 4801 (urwane karty „Najczęściej wybierane”), App-Marka 3454 vs 7757, App-Zestawy 2200 vs 7858, App-Kreator-wynik 3200 vs 4338, App-Salon-Niszczarki 7000 vs 7816, App-Oferta 2100 vs 2617, App-Kontakt 2800 vs 2872 (FAQ pod paskiem), App-Zestaw 3500 vs 3566, App-KSeF i App-Ulga (linia „Źródła:” schowana pod dolnym paskiem). Puste płótno: App-Branza 3400 vs 2276 (~1050 px bieli), App-Aktualnosci 1400 vs 816.
- **Naprawa:** ustawić `wys` = wysokość treści + dolny pasek (albo celowo ciąć na granicy sekcji i dodać gradient „ciąg dalszy”); tam, gdzie treść krótsza — zmniejszyć ramkę.
- **Zrzuty:** `SHOTS/a9c/m0-0.png`, `SHOTS/a9c/m18-0.png`, `SHOTS/a9c/m21-0.png`.

### W12. Aplikacja: salony marek to długie pionowe listy jednakowych kart z małymi miniaturami — nie wygląda jak „apka”
- **Widok:** `App-Salon-Brother` (7800 px), `App-Salon-Niszczarki` (7000 px), `App-Marka` (Lenovo), `App-Salon-Apple`.
- **Co jest źle:** 20–25 kart w jednej kolumnie, każda z miniaturą ~60 px i 3 punktami; produkty (drukarki, niszczarki) w tej skali są nierozróżnialne; przewijanie bez końca, brak struktury.
- **Naprawa:** każda grupa (np. „Drukarki laserowe”, „A3, skanery, etykiety”) jako poziomy karuzel `scroll-snap` z kartą 75% szerokości i zdjęciem 160–180 px; na górze segment (Lasery / Atrament / Skanery / Etykiety); porównanie w tabeli jako osobny ekran/arkusz. Docelowo ekran salonu ≤ 3 ekrany.
- **Zrzuty:** `SHOTS/a9c/m25-0.png`, `SHOTS/a9c/m26-0.png`, `SHOTS/a9c/m7-0.png`.

### W13. Trzy różne formularze zapytania (pola i zgoda RODO niespójne)
- **Widok:** szuflada koszyka (komputer), panel „Wyślij zapytanie” w wyniku konfiguratora (komputer), `App-Zapytanie`.
- **Co jest źle:** koszyk: „Imię i nazwisko lub firma / Telefon / E-mail / Wiadomość”, bez zgody; konfigurator: „Imię lub firma* / Telefon lub e-mail* / Dodatkowe informacje”; aplikacja: „Imię i nazwisko* / Telefon* / Firma / Wiadomość” + checkbox zgody z administratorem danych. Klauzula informacyjna jest tylko w aplikacji.
- **Naprawa:** jeden komponent formularza: Imię lub firma*, Telefon*, E-mail (opcjonalnie), Wiadomość, pod spodem ta sama klauzula (link do polityki prywatności). Bez checkboxa (podstawa: przygotowanie oferty na prośbę klienta) albo z checkboxem — ale wszędzie tak samo.
- **Zrzuty:** `SHOTS/a9c/cart.png`, `SHOTS/a9c/kre3-0.png`, `SHOTS/a9c/m14-0.png`.

### W14. Produkt przy 768 px — galeria i cechy za małe
- **Widok:** `?p=ergo`, 768.
- **Co jest źle:** zdjęcie główne ~140 px, cechy pod przyciskiem w 3 kolumnach po ~60 px (ikony nachodzą na tekst „Gwarancja producenta”, „przeniesienie danych” po słowie w linii).
- **Naprawa:** poniżej 900 px hero w jednej kolumnie (galeria na pełną szerokość, potem dane), cechy jako lista pionowa.
- **Zrzut:** `SHOTS/a9c/r768_2.png`.

### W15. Siatki z sierotami w ostatnim rzędzie
- **Widok:** 1440. Vending „Wszystkie automaty” — 9 kart w 4 kolumnach (1 sama: „Sklep samoobsługowy 24/7”); Brother „Wszystko w ofercie” — 10 kart w 4 kolumnach (2 same); „Na tym planie” `.plst` — 17 pozycji w 4 kolumnach (1 sama, „Router UniFi”).
- **Naprawa:** vending: 3 kolumny (3×3) albo 5. kafel „Nie widzisz automatu? Zapytaj”; Brother: 5 kolumn lub karta „Zobacz pełną ofertę”; plan: 3 kolumny przy 17 → 6 rzędów, ewentualnie ostatni kafel „Dodaj cały plan”.
- **Zrzuty:** `SHOTS/a9c/ov_ov.png`, `SHOTS/a9c/ov_salon1.png`, `SHOTS/a9c/z_plst.png`.

---

## DROBNE (12)

1. **Przyciski/chipy łamane na 2–3 linie** — start `.kp7fi a` („Hotel lub pensjonat”, „Szkoła lub instytucja”… w 156 px — 3 linie); InsERT `.in3-pcg button` i Opieka `.oi3-ps button` („Lenovo ThinkCentre neo 50s / 55s” — 3 linie); KSeF `.kx-hp button` („Kwalifikowany podpis elektroniczny EuroCert” — 3 linie). Naprawa: skrócić etykiety („Hotel, pensjonat”, „ThinkCentre neo 50s”) albo `grid-template-columns:repeat(auto-fill,minmax(200px,1fr))`. Zrzut: `SHOTS/a9c/d6-2.png`, `SHOTS/audyt9_d_0.png` (y≈6600).
2. **Ucięte etykiety na kartach /oferta** — `.pc4k` „BROTHER · DRUKARKI I URZĄDZENIA WIEL…”, „MICROSOFT · LICENCJE I OPROGRAMOWA…”. Naprawa: krótka etykieta kategorii w danych („Drukarki”, „Licencje”). Zrzut: `SHOTS/a9c/dk1-0.png`.
3. **Pusty wynik na /oferta** — przy samym wyszukiwaniu nagłówek „Nic nie pasuje do tych filtrów” (to nie filtry), sekcje „Kategoria” i „Marka” rozwinięte, ale puste. W wyszukiwarce: przycisk „Zapytaj o „ qwzxv ”” ze spacjami wewnątrz cudzysłowu. Naprawa: „Nie znaleźliśmy „{fraza}””; puste grupy filtrów chować; usunąć spacje w szablonie. Zrzuty: `SHOTS/a9c/empty.png`, `SHOTS/a9c/empty2.png`.
4. **„Na tym planie”** — niespójne zakończenia pozycji (raz przycisk „film”, raz strzałka „›”), pigułka „film” przy pozycji 4 dotyka krawędzi karty. Naprawa: zawsze strzałka, „film” jako mała ikona ▶ przy miniaturze; `padding-right` w `.pli`. Zrzut: `SHOTS/a9c/z_plst.png`.
5. **Za mały tekst 10,5 px** — `.s6sit em` („427 POZYCJI”, „OK. 1 MINUTA”…), `.g4rh` („NA TEJ STRONIE”), `.s4ck`, `.s5doft em`. Naprawa: min. 11,5–12 px. Zrzut: `SHOTS/a9c/d0-0.png`.
6. **Słaby kontrast drobnych elementów** — Kontakt: `.ln4n` „Zakopane” 2,6:1, `.ln4u` „prokomzakopane.pl” 2,8:1; gwiazdki opinii `.s4qs` 2,3:1. Naprawa: przyciemnić do `--ink2`/`#B7791F`. Zrzut: `SHOTS/audyt9_d_9.png`.
7. **Produkt — bento „W skrócie”** — największy kafel to „Ekran operatora: graficzny 192×64 px”, a obok „Ekran klienta” z tą samą wartością (powtórzenie, zła hierarchia); ikona „strzałka w górę” użyta jako „waga” (w hero i w bento). Naprawa: duży kafel dla najważniejszej cechy (np. „Mobilna, akumulator 2150 mAh”), połączyć ekrany w jeden kafel; ikona wagi (odważnik). Zrzut: `SHOTS/a9c/dk2-0.png`.
8. **Półprzezroczysty nagłówek** — przy przewinięciu przez `.g4h` (biel 84%) prześwitują liczniki „427 / 39” ze strony. Naprawa: `backdrop-filter:saturate(1.4) blur(12px)` albo tło 96%. Zrzut: `SHOTS/a9c/empty.png` (prawy górny róg).
9. **Aplikacja — Aktualności tylko tekstem** — 5 wpisów bez miniatur, połowa ramki pusta; nie spełnia „bardzo wizualnej apki”. Naprawa: miniatura 72×72 przy każdym wpisie lub karty z obrazem. Zrzut: `SHOTS/a9c/m21-0.png`.
10. **Różne nazwy tych samych rzeczy komputer ↔ aplikacja** — „Terminal płatniczy PolCard” vs „Terminal płatniczy PolCard (Ingenico)”; działy „Kasy i sprzedaż / Komputery i biuro / Oprogramowanie” vs w aplikacji „Sprzedaż / Biuro / Programy”. Naprawa: jedno źródło nazw (krótka i pełna wersja w danych). Zrzuty: `SHOTS/a9c/m14-0.png`, `SHOTS/a9c/m2-0.png`.
11. **„Wszystkie kategorie · 10” vs brak tego przycisku** w karcie „Oprogramowanie” (3 kategorie) i „Serwis i usługi” na starcie — karty tej samej siatki mają różne dolne paski. Naprawa: w każdej karcie ten sam układ stopki (przycisk „Cały dział” wyrównany do dołu, `margin-top:auto`). Zrzut: `SHOTS/a9c/st0.png`.
12. **Strona produktu, okruszek w wersji WWW 390** zawija „Posnet Ergo Online” do osobnej linii z dużym odstępem; przy produkcie z długą nazwą okruszek zajmuje 3 linie. Naprawa: na <760 px pokazywać tylko „‹ Kasy fiskalne”. Zrzut: `SHOTS/a9c/r390_2-0.png`.

---

## Podsumowanie

KRYTYCZNE: 5 · WAŻNE: 15 · DROBNE: 12 (razem 32; powtarzalne zgrupowane — np. W8 to ~40 nagłówków, K5 to ~35 siatek).

Najszybsze zyski (jedna linia CSS = wiele poprawek): K1 + W9 (`:where()` w resetach), W8 (`text-wrap:balance`), K5 (wspólny blok `@media (max-width:760px)`).
