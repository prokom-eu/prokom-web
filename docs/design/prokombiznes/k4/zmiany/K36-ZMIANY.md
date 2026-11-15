# K36 — zmiany v148 na prokombiznes.pl (dla Claude Code)

Wersja: 28.10.2026. Uzupełnia K35 (a ten K34 i K33). Czego tu nie ma — robisz według wcześniejszych plików.
Źródło decyzji: rozmowa z Krystianem 28.10, 22:06 (po audycie v147: claude/prokombiznes-audyt-v147.md).

## 0. Decyzje
- **Pomiar (Plausible / GA4) — odkładamy.** Sekcja 7 w K35 nie jest teraz do wdrożenia. Zdarzenia zostają w K35 jako plan na później.
- **Logo Apple** — zgoda jest. Uwaga z K33–K35 nieaktualna.
- **Optivendi** — status „Partner” (zamiast „We współpracy”). COMEX bez zmian: „We współpracy”.
- **Zdjęcia realizacji i firmy** — dochodzą na etapie budowy strony. Zastępniki zostają oznaczone jako „do podmiany”.
- **Niszczarki** — research gotowy (research/niszczarki.md), decyzja Krystiana i szefa. Na stronę nic nie dodajemy.

## 1. Strona główna
- **Usunięty pasek przewijanych logo marek** (marquee). Zostaje siatka „Marki, które znamy od środka” ze statusami. Na telefonie też bez paska.
- **Usunięta sekcja „Ile numerów masz w telefonie do spraw IT?”.** Opieka IT jest w Szybkim starcie i w „Systemach”.
- **H1:** „Kasy, komputery i programy dla firm.” + wyróżniony dopisek „Wszystko z jednego miejsca — z Rabki.” (telefon: ten sam H1).
- **Boczny pasek nawigacji** (12 pozycji, w kolejności sekcji): Start, Działy oferty, Systemy i opieka IT, Marki, Najczęściej wybierane, Dla kogo, Plan Twojej firmy, Jak pracujemy, Opinie, O firmie, Pytania, Kontakt.
- **Stopka — 6 kolumn:**
  - opis firmy;
  - Oferta: cała oferta, zestawy, plan, marki, Konfigurator — raz;
  - **Usługi:** przegląd kasy, serwis kas i drukarek fiskalnych, fiskalizacja, serwis komputerów, Opieka IT, kopie zapasowe, poczta i Microsoft 365;
  - Systemy i tematy: GoPOS, InsERT i KSeF, KSeF 2027, ulga, automaty, O firmie, Aktualności;
  - **PRO-KOM w regionie** (linki zewnętrzne): prokominstalacje.pl (monitoring, sieci, smart home), prokomsoftware.pl (strony, sklepy, aplikacje), prokomserwis.pl, prokomzakopane.pl;
  - Kontakt.

## 2. Dostępność i SEO
- Każde zdjęcie produktu w kartach (siatki, salony, zestawy, plan, podobne, „dobierz”) ma `alt` = nazwa produktu. Zdjęcia czysto dekoracyjne (mozaiki) — `alt=""`.
- Link-obrazek karty ma `aria-label` = nazwa produktu.

## 3. KSeF po 1 stycznia 2027 — przełączanie po dacie
Flaga `ksefPo = teraz >= 2027-01-01` (w podglądzie do testu: `?ksefpo=1`).

| Miejsce | Do 31.12.2026 | Od 1.01.2027 |
|---|---|---|
| /ksef H1 | KSeF bez wyjątków od 1 stycznia 2027. *Przygotuj firmę teraz.* | KSeF obowiązuje wszystkie firmy. *Sprawdźmy, czy u Ciebie wszystko działa.* |
| /ksef lead | o limicie 10 000 zł i wyjątku dla kas | brak limitu i wyjątku, kary z art. 106ni, tryb offline |
| licznik | N dni do 1 stycznia 2027 | ✓ KSeF · obowiązuje od 1 stycznia 2027; oś czasu: wszystko „obowiązuje” |
| pas na dole | Zdążmy przed 1 stycznia. | Sprawdźmy Twój KSeF. |
| Szybki start | KSeF bez wyjątków od 2027 · N dni do 2027 | KSeF — czy wszystko działa? · obowiązuje od 1.01.2027 |
| mega-menu (Oprogramowanie) | N dni do końca wyjątków | Faktury w KSeF bez przestojów |
| telefon (kafel) | KSeF bez wyjątków · N dni | KSeF obowiązuje · od 1.01.2027 |

W produkcji obie wersje tekstów trzymaj w Payload (pole „od daty”). Test „Czy KSeF dotyczy mojej firmy?” po 2027 ma pytać o tryb offline i awaryjny, a nie o limit — do przygotowania treści w grudniu 2026.

## 4. Oferta — nowe kategorie
**„Komputery, tablety i telefony” (83 pozycje) dzielimy na 5 kategorii działu „Komputery i biuro”:**
- Laptopy;
- Komputery i All-in-One (tu też stacje robocze stacjonarne);
- Monitory;
- Tablety;
- Telefony.

Mobilne stacje robocze (Dell Pro Precision, Dell Pro Max 16/18, ThinkPad P) trafiają do Laptopów; seria jest filtrem.

- Kategoria bez podkategorii pokazuje w nagłówku **chipy sąsiednich kategorii działu** (np. Laptopy · Komputery · Monitory · Tablety · Telefony · Serwery · Drukarki · Ekrany · Klawiatury…). Tak samo na telefonie.
- Domyślna kategoria widoku „Kategoria” = Laptopy.
- Szybkie skróty wyszukiwarki: „Laptopy” zamiast „Komputery i telefony”.

**Inne zmiany kategorii:**
- **Nowa kategoria „Klawiatury, myszy i słuchawki”** (dział Komputery i biuro), podkategorie: Klawiatury, Myszy, Zestawy klawiatura i mysz, Kamery internetowe, Słuchawki i zestawy słuchawkowe, Głośniki i mikrofony.
- **„Drukarki wielofunkcyjne” → „Drukarki i urządzenia wielofunkcyjne”**, podkategorie: Laserowe czarno-białe, Laserowe kolorowe, Atramentowe, Skanery dokumentów, Do biura i działów (A4/A3 — Konica Minolta, Kyocera).
- Drukarki etykiet i mobilne Brother → kategoria „Skanery, etykiety i kolektory” / „Drukarki etykiet i metkownice”.
- Systemy wideokonferencyjne Logitech → „Ekrany i projektory” / „Wideokonferencje”.

## 5. Nowe usługi (dział Serwis i usługi)

| Karta | Kategoria |
|---|---|
| Fiskalizacja kasy i zaprogramowanie towarów | Serwis i przeglądy |
| Wymiana kasy i zakończenie pracy starej kasy | Serwis i przeglądy |
| Połączenie kasy z programem, wagą i terminalem | Serwis i przeglądy |
| Serwis drukarek i urządzeń wielofunkcyjnych | Serwis i przeglądy |
| Modernizacja komputera: dysk SSD i pamięć RAM | Serwis i przeglądy |
| Montaż i konfiguracja sieci oraz Wi-Fi dla gości (z linkiem do PRO-KOM Instalacje) | Opieka IT i wdrożenia |
| Kopie zapasowe z testem odtworzenia | Opieka IT i wdrożenia |
| Poczta firmowa i wdrożenie Microsoft 365 | Opieka IT i wdrożenia |
| Przygotowanie komputera do pracy | Opieka IT i wdrożenia |
| Bezpłatny przegląd IT | Opieka IT i wdrożenia |
| Pomoc zdalna | Opieka IT i wdrożenia |
| **Tusze i tonery — oryginały i sprawdzone zamienniki** (jeden kafel informacyjny, bez listy materiałów) | Drukarki |

- Treści: research/uslugi.json (pełne karty: opis, parametry, FAQ, „dobierz”).
- Do potwierdzenia przed publikacją (pole `uwagi`):
  - formalności przy odczycie pamięci kasy;
  - zasięg bezpłatnego przeglądu IT;
  - zakres marek w serwisie drukarek.
- **Karta usługi** zamiast „zdjęcie producenta pojawi się wkrótce” pokazuje granatowy kafel z ikoną, nazwą i dopiskiem „Usługa PRO-KOM · u Ciebie w firmie albo w serwisie w Rabce-Zdroju”.
- Pod przyciskami karty usługi są 3 obietnice: Zakres na piśmie / Oddzwaniamy w 60 min / Na miejscu. Nie ma tam „Gwarancji producenta”.

## 6. Telefon
- Start:
  - bez paska marek;
  - „Najczęściej wybierane” = te same 16 pozycji co na komputerze, z pigułkami filtra: Wszystkie 16 / Kasy i płatności 5 / Komputery i telefony 5 / Programy i ochrona 4 / UPS 2;
  - H1 jak na komputerze.
- Opieka IT: sekcje „Z opieką i bez”, „Dla kogo” i „Pilnujemy terminów” są zwinięte (rozwijane `<details>`, z podtytułem).
- Karta produktu: w dolnym pasku „Zadzwoń” z napisem (obok „Dodaj do zapytania”).
- Kategoria: chipy sąsiednich kategorii działu, gdy kategoria nie ma podkategorii.

## 7. Brother, HP, Logitech

Nowe karty produktów (treści w repo projektu: research/brother.json, hp.json, logitech.json; fakty o markach: research/*-marka.json):

| Marka | Kart | Gdzie | Salon |
|---|---|---|---|
| Brother | 28 | Drukarki i urządzenia wielofunkcyjne (laser mono 10, laser kolor 8, atramentowe 3, skanery 2), Skanery, etykiety i kolektory → Drukarki etykiet (5: etykiety 3, mobilne 2) | **Tak** — pełny salon jak Apple/Lenovo |
| HP | 10 | Drukarki i urządzenia wielofunkcyjne (laser mono 4, laser kolor 4, atramentowe 2) | Nie — kafel marki prowadzi do oferty z filtrem HP |
| Logitech | 22 | Klawiatury, myszy i słuchawki (18), Ekrany i projektory → Wideokonferencje (4) | **Tak** — mały salon B2B |

**Salon Brother:**
- hero: „Brother dla firm. Drukarki, skanery i etykiety.”;
- karta „Kupujesz drukarkę — dostajesz”: dobór, uruchomienie, skanowanie, tusze i tonery;
- dwa bloki modeli:
  - Laser — 4 główne i 2 dodatkowe;
  - A3, skanery, etykiety i druk w terenie — 4 główne i 2 dodatkowe;
- porównanie 4 rodzajów: laser mono, laser kolor, atrament biznesowy, etykiety i mobilne;
- „Do czego potrzebujesz?” — 7 sytuacji;
- „Wszystko w ofercie” z zakładkami według rodzaju;
- wdrożenie w 4 krokach;
- 6 faktów o marce ze źródłami;
- 5 pytań.

**Salon Logitech:**
- hero: „Logitech dla firm. Biurko i sala spotkań.”;
- Biurko — 4 główne i 4 dodatkowe;
- Sale spotkań: MeetUp 2, Rally Bar Huddle, Rally Bar Mini, Tap IP;
- „Do czego potrzebujesz?” — 6 sytuacji;
- 6 faktów;
- 4 pytania.

Dlaczego Logitech ma salon: łączy biurko z salą spotkań i montażem, a to usługa, nie tylko towar.

**Marki:**
- grupa „Komputery, telefony i druk” → **„Komputery, druk i akcesoria”**: Apple, Lenovo, Dell, Samsung, Brother, HP, Konica Minolta, Kyocera, Logitech;
- mega-menu „Komputery i biuro” — marki w dziale: Lenovo, Dell, Apple, Samsung, Brother, HP, Logitech, Konica Minolta;
- „Polecane” w drukarkach: najpierw Brother i HP (MFC-L2922DW, MFC-L5710DW, MFC-L8390CDW, HP 3102fdw…), potem Konica Minolta i Kyocera.

**Logo:**
- Brother — oficjalne SVG z brother.pl, przekolorowane na granat Brother, bez hasła „at your side”;
- HP — oficjalne SVG;
- Logitech — „Logitech for Business” przycięty do znaku.

Użycie logo potwierdzić z dystrybutorem lub partnerem.

**Zdjęcia:**
- packshoty producentów: Brother CDN i brothersklep.pl, HP, Logitech;
- HP OfficeJet Pro 9132e — usunięty z kartki baner promocji Instant Ink;
- w produkcji brać zdjęcia z materiałów dystrybutora.

**Do potwierdzenia przed publikacją (najważniejsze):**
1. **HP — dynamiczne zabezpieczenia:** drukarki LaserJet Pro i Color LaserJet Pro przyjmują tylko wkłady z układem HP. Aktualizacja może zablokować zamienniki, które wcześniej działały. Kafel „Tusze i tonery — sprawdzone zamienniki” **nie może obiecywać zamienników do HP** — przy HP mówimy o oryginałach. Przy modelach „e” (OfficeJet Pro 9132e) — HP+ jest opcjonalne przy konfiguracji; dla firm konfigurujemy bez HP+, chyba że klient chce.
2. **Logitech — polski układ klawiatur:** na stronie Logitech PL nie ma polskiego układu. Numery dotyczą angielskiego międzynarodowego QWERTY, który w Polsce jest standardem, ale trzeba to potwierdzić u dystrybutora. Kilka pozycji ma na stronie „Powiadom mnie” — sprawdzić dostępność.
3. **Logitech Rally Bar Huddle** — nie piszemy „certyfikowany dla Teams/Zoom”, dopóki nie sprawdzimy listy certyfikacji.
4. **Brother:**
   - okres gwarancji (3 lub 5 lat po rejestracji) potwierdzić dla każdego modelu;
   - ADS-1800W według brothersklep.pl ma 12 mies. — sprawdzić;
   - QL-820NWBc / QL-1110NWBc i TD-4420DN miały w brothersklep.pl status „brak” — potwierdzić dostępność w dystrybucji;
   - MFC-L8340CDW — czy ma Ethernet.
5. Wszystkie parametry z pola `uwagi` w kartach (sprzeczne dane na stronach producenta zostały pominięte, nie zgadywane).

## 8. Niszczarki — Fellowes i Kobra (decyzja Krystiana 28.10, 23:15)

Tylko dwie marki: **Fellowes i Kobra**.
- Treści: research/fellowes.json (9 kart), kobra.json (7 kart), fellowes-marka.json, kobra-marka.json.
- Szerszy research rynku: research/niszczarki.md.

**Nowa kategoria „Niszczarki”** w dziale „Komputery i biuro”, za drukarkami. Podkategorie:

| Podkategoria | Modele |
|---|---|
| Małe biuro i stanowisko | Fellowes LX200, LX210, Kobra +1 CC4 ES |
| Biuro i zespół | Fellowes LX220, Kobra +3 CC4 ES, Kobra 240 C4 Turbo ES |
| Z automatycznym podawaniem | Fellowes AutoMax 100M, 200C, 350C, Kobra AF+1 40 |
| Dział i praca ciągła | Fellowes Powershred 225Ci, Kobra 300.1 C4 ES |
| Wysokie bezpieczeństwo (P-5+) | Fellowes LX211, Powershred 225Mi, Kobra +2 CC2 ES, Kobra 240.1 C2 ES |

**Salon tematyczny „Niszczarki” (Fellowes + Kobra)** — jeden, wspólny, jak „Druk w biurze”. Obie marki prowadzą do niego.
- Hero: „Niszczarki dla firm. P-4 albo P-5 — dobrane do dokumentów.”
- Bloki „Do biura” i „Automat i dane wrażliwe” (po 4 modele główne i 4 dodatkowe).
- Tabela „Jaka niszczarka do jakiej pracy?”.
- Sekcja „Co niszczysz?” (5 sytuacji).
- Wdrożenie w 4 krokach, 6 faktów o markach ze źródłami.
- 5 pytań: P-4 czy P-5, czy RODO wymaga konkretnej niszczarki, Fellowes czy Kobra, oliwienie, zszywki i karty.

Salon tematyczny ma własne nagłówki: „Zanim wybierzesz niszczarkę”, „Fellowes i Kobra w kilku faktach”, „Zapytaj o niszczarkę”, a na telefonie tytuł paska „Niszczarki”. Pola `hFaq`, `hFakty`, `hOferta`, `hMore`, `hAsk`, `title`.

**Dlaczego jeden salon, a nie dwa:**
- 9 i 7 modeli to za mało na osobne salony marek;
- klient szuka „niszczarki do RODO”, a nie marki;
- wartością jest doradztwo przy wyborze poziomu P-4 albo P-5.

**Do potwierdzenia przed publikacją:**
1. **Gwarancja Kobra.** Argo S.A. (Gdańsk, kontakt producenta w Polsce) podaje 3 lata na urządzenie i dożywotnio na noże, a niszczarka.net w części tabel 2 lata i 20 lat na noże. W kartach wpisano jako „wg polskiego dystrybutora”.
2. **Gwarancja Fellowes.** Instrukcje podają 2 lata na urządzenie, a na noże 20 lat (225Ci) i 7 lat (225Mi). „3 lata po rejestracji” i „dożywotnie noże” ze sklepów nie są potwierdzone przez Fellowes, więc ich nie wpisano.
3. **Dostępność:**
   - Fellowes 225Mi jest wycofana w x-kom (zamiennik: LX221);
   - AutoMax 350C — „chwilowo niedostępna”;
   - 225Ci — tylko w części sklepów.
4. **Karty Kobra (PDF z 2019 r.)** dotyczą wersji sprzed „ES”. Parametry sprawdzono z aktualnymi stronami kobra.com (en-GB). Sprzeczne wartości pominięto (pole `uwagi`).
5. **Zdjęcia i logo:**
   - zdjęcia Kobra z argo.pl, Fellowes z oficjalnego CDN;
   - Kobra +2 CC2 i +3 CC4 mają to samo zdjęcie (ta sama obudowa);
   - logo Fellowes z nagłówka strony fellowes.com (przekolorowane na ciemne), logo Kobra z kobra.com;
   - prawo do logo potwierdzić z dystrybutorami.

## 9. HP — tylko oryginały (decyzja Krystiana 28.10, 23:15)
- Do drukarek HP **nie oferujemy zamienników**.
- Każda karta HP ma w pytaniach: „Czy oferujecie zamienniki tonerów/tuszy? — Nie. Do drukarek HP oferujemy wyłącznie oryginalne wkłady HP”.
- „Dobierz” w kartach HP: „oryginalne tonery/tusze HP na zapas”.
- Karta „Tusze i tonery”:
  - parametr „Do wyboru: oryginał albo sprawdzony zamiennik; do HP tylko oryginały”;
  - pytanie „Czy macie zamienniki do drukarek HP? — Nie…”.

## 10. Oferta — sensowna kolejność „Polecane” (29.10, poprawione o 00:32)

Bez nagłówków i grup — zwykła lista, tylko dobrze ułożona.

**Cała oferta bez filtrów, sortowanie „Polecane”** — lista układa się wierszami:
- jeden wiersz siatki to produkty z jednego działu, kolejne wiersze na przemian z kolejnych działów (Kasy i sprzedaż → Komputery i biuro → Oprogramowanie → Bezpieczeństwo i sieć → Serwis i usługi → znowu Kasy…);
- długość wiersza to 3 na komputerze i 2 na tablecie i telefonie;
- w dziale najpierw czołówka (`dzTop9`), potem na przemian po jednej z każdej kategorii, w kategorii według popularności (`pop9`).

Efekt: pierwszy ekran to Posnet Ergo, Elzab K10, Sunmi D3 PRO; ThinkBook 14, iPhone 17, Brother MFC-L2922DW; Subiekt nexo, GoPOS, Microsoft 365; UniFi Dream Router 7, U7 Pro, ESET; przegląd kasy, serwis kas, przegląd IT.

**Z filtrami** (dział, kategoria, marka, branża, rodzaj, nowości) — kolejność kategorii jak w menu, w kategorii popularność.

**Wyszukiwanie** — trafność. **A–Z, Marka, Nowości** — bez zmian.

**Popularność (`pop9`):**
- Każda kategoria ma ręcznie wybrane 3–6 najczęściej wybieranych pozycji.
- W produkcji to pole „Kolejność” w Payload, docelowo z raportu sprzedaży Subiekta GT.
- Ta sama kolejność obowiązuje w listach kategorii, w „Wszystko w ofercie” w salonach i w „Popularne w dziale” na telefonie.

**Karty usług bez zdjęcia:** granatowy kafel z ikoną i napisem „Usługa PRO-KOM”.

## 11. Szybki start (29.10)
**Komputer — „Szybki start · Od czego zaczynasz?”:**

| Kafel | Opis | Akcja |
|---|---|---|
| Cała oferta | {liczba} pozycji | oferta |
| Konfigurator | ok. 1 minuta | konfigurator |
| Plan Twojej firmy | 12 rodzajów firm | plan |
| Salony marek | {liczba} marek | wszystkie marki |
| Zapytaj o wycenę | oddzwonimy w 60 min | otwiera formularz zapytania |

**Telefon:**
- Szybki start: te same 5 kafli przewijane w bok. „Salony marek” prowadzi do oferty z siatką salonów.
- Skróty pod nim: Zadzwoń, KSeF 2027, Zestawy, Opieka IT. Konfigurator i Plan są już w kaflach, więc nie dublujemy ich w skrótach.

## 12. Koło w hero (29.10)
- **Miniatury zawsze proste.** Poprzedni błąd: animacja kontr-obrotu nadpisywała obrót startowy, więc każda miniatura stała przechylona o swój kąt.
- **Koło wiruje powoli** (pełny obrót 120 s, pauza po najechaniu myszą i przy „ogranicz ruch” w systemie). Każda miniatura ma przeciwny obrót, więc zdjęcia zawsze stoją prosto. Na starcie przy każdym dziale stoją jego 3 produkty, w łuku przy ikonie działu:
  - Kasy: Ergo, D3 PRO, PolCard;
  - Komputery: ThinkBook, iPhone 17, Brother;
  - Programy: nexo, GoPOS, Microsoft 365;
  - Sieć: U7, UDR7, ESET;
  - Serwis: K10, Synology, ThinkCentre.
- **Aktywny dział** (auto-przełączanie albo kliknięcie): jego produkty powiększone z obwódką w kolorze działu, pozostałe lekko przygaszone. Po najechaniu na koło wszystkie wracają do pełnej widoczności.
- **Miniatury:** 64 px, białe kółko z delikatnym gradientem, zdjęcie 80%. Delikatne „unoszenie” (3 px, 5,5 s), wyłączone przy „ogranicz ruch” w systemie.
- **Promień** orbity powiększony, żeby miniatury nie nachodziły na etykiety dolnych działów.

## 13. Wersja finalna — poprawki po dwóch audytach (29.10)
Przed oddaniem przeszły dwa niezależne audyty: treści (cały obiekt D, szablony, wszystkie widoki) i wyglądu/UX (30 widoków × 4 szerokości, tryb ciemny, 54 ekrany aplikacji). Poniżej lista tego, co zmieniło się w danych i szablonach — do przeniesienia 1:1 do Payload/Next.

**Twarde zasady**
- Fakty o markach w salonach: tylko miasto siedziby, bez ulic i kodów (Posnet, COMEX, EuroCert, PolCard, Avtek, Dell, Microsoft, Konica Minolta).
- O firmie → „Autoryzacje i partnerzy”: trzecia grupa to „Pozostałe marki w ofercie” (bez statusu partnerskiego dla 20 marek).
- HP tylko oryginały także w kartach „Serwis drukarek” i „Tusze i tonery” (bento, korzyść, cechy).
- Ze stopki zniknęły linki do starych plansz „Aktualności” i „Mapa strony” (miały zły e-mail i zakazane marki w danych wyszukiwarki). Aktualności na komputerze trzeba złożyć od nowa na szablonie strony; mapa strony = zwykła lista linków.
- Notatka programisty pod wpisem w aplikacji zamieniona na linię źródeł.
- Statusy wszędzie pełnym brzmieniem: „Autoryzowany serwis Posnet i Elzab”, „Autoryzowany partner GoPOS i InsERT”, „Partner Optivendi”, „We współpracy z COMEX”.
- Liczba klientów jednym brzmieniem: „100+ klientów firmowych” / „Ponad 100 klientów firmowych — firm i instytucji z Podhala i Małopolski”.
- Opieka IT bez deklaracji modelu cenowego: „Stała opieka IT”, „Zakres ustalamy w umowie”, „wycena na piśmie” (bez „abonamentu” i „stałej opłaty”).
- Oddzwonienie w 60 minut także w FAQ kontaktu i w potwierdzeniu wysłania zapytania na telefonie (bez obietnicy kopii na e-mail).
- Obietnice niesprawdzalne usunięte: „zapisujemy w ofercie i w umowie”, „paszport IT”, „często w kilkanaście minut”, „wydamy podpis na miejscu” (→ „pomożemy zamówić podpis i ustawimy go w programach”), rabat „−20%” w makiecie automatu, porównania cen („tańszy”, „za ułamek ceny”).

**Logika i dane**
- Kategorie: panel „Do czego” i przycisk „Dobierz laptop” tylko w laptopach i komputerach. W pozostałych: „Nie wiesz, co wybrać? … Zapytaj o dobór” (otwiera zapytanie z nazwą kategorii). Filtr „Seria” chowa się, gdy kategoria nie ma serii. Okruszek bez zdublowanej nazwy.
- Karta produktu: „Gotowe do pracy” i „Co robimy przy zakupie” zależą od kategorii (przeniesienie danych tylko przy komputerach, telefonach, programach, serwerach i NAS; kasy — fiskalizacja; automaty — uruchomienie i serwis Optivendi; usługi — „Usługa PRO-KOM”).
- „Najważniejsze” (bento): przy kartach z kilkoma modelami pokazujemy wszystkie wartości („203 / 300 dpi”) albo „zależnie od modelu (N wersji)” — nigdy samą wartość pierwszego modelu ani ucięcie po dwukropku.
- Krótka nazwa karty = „Marka Model” (HP, Logitech, Samsung, APC, COMEX, Optivendi…), opis idzie do podtytułu.
- Źródła uzupełnione w 87 kartach (Brother, HP, Logitech, Fellowes, Kobra, Apple). Separator „ · ”, etykieta „Źródła:”.
- FAQ dodane w 30 kartach (COMEX — UPS, ATS, karty SNMP, akumulatory; Optivendi — towar, płatności, serwis).
- PUSH i PULL Optivendi rozróżnione (podajniki spiralne vs popychacz, głębokość 87 / 79 cm).
- „Do tego zwykle dobierają”: drukarki → tusze i tonery (przy HP oryginalne) + serwis drukarek; serwery i NAS → UPS + kopie zapasowe; UPS COMEX → karta SNMP + akumulatory; bez routera przy drukarkach i automatach.
- „Nowość” tylko dla 10 premier rynkowych; filtr „Tylko nowości · 10 premier na rynku”.
- Plan „Sklep spożywczy”: Elzab Jota Online zamiast Ergo; apteka: „klienci osobno od kas i danych”; licznik „17 punktów”.
- Konfigurator: „pytanie 1 z 3” + wynik (komputer i telefon), „sam decydujesz, co trafi do zapytania”.
- Jeden dział: „Sieć, bezpieczeństwo i podpis” (w kafelkach skrót „Sieć i bezpieczeństwo”). Okruszek KSeF: „Start / Oprogramowanie / KSeF”.
- Tryb po 1.01.2027: znika pytanie o limit 10 000 zł, wynik i karta kar w czasie przeszłym.
- Odmiana liczebników wszędzie (elementy, zestawy, pozycje, parametry, punkty, rekomendacje).
- Jedna nazwa koszyka: „Zapytanie”; stany „+ Do zapytania” / „✓ W zapytaniu”. Formularze: „Imię lub firma *”, „Telefon *” (albo e-mail), wiadomość opcjonalna, ta sama klauzula.
- W produkcji lista zapytania startuje pusta.
- Typografia w danych: pauza „—”, „Wi-Fi”, „0–40 °C”, znak cala `"`, „4 w 1”, „pn–pt 9:00–17:00”, „przełącznik” zamiast „switch”, forma „Ty/Twój”, tryb oznajmujący w Kyocerze.

**Wygląd**
- Przyciski: tekst w kolorze przycisku (reset `color:inherit` ma zerową specyficzność) — „Zapytanie” i „+ Do zapytania” znowu białe na niebieskim; to samo w aplikacji.
- Formularz zapytania: naprawione pole „Wiadomość” (pokazywało „[object Object]”).
- Opinie-zaślepki bez gwiazdek, oznaczone „[do podmiany]”.
- Start krótszy: usunięty blok, który dublował Szybki start (oferta + konfigurator + rodzaje firm).
- Strona WWW na telefonie (≤ 760 px): sekcje dwu- i czterokolumnowe składają się do 1–2 kolumn, marginesy 16 px, hero produktu i salonów w jednej kolumnie.
- Nagłówki bez wiszących spójników (twarda spacja po „i”, „w”, „z”, „o”, „u”, „a”), `text-wrap: balance`.
- Logo Brother w filtrze marek, logo PRO-KOM na karcie Opieka IT w trybie ciemnym, kontrast numerów kroków w vendingu, czytelniejsza gwiazdka opinii, minimalny rozmiar drobnego tekstu 11,5 px.
- Aplikacja: produkty w salonach marek jako poziome karuzele ze zdjęciem 168 px (salony krótsze o 15–25%), ramki ekranów dopasowane do treści, H1 „Wszystko z jednego miejsca — z Rabki.”, przycisk „Wyślij” wyśrodkowany.
- Tytuły stron i plansz bez numerów wersji.
- Zdjęcie Kyocera TASKalfa 5004i / 6004i.

**Do decyzji szefa / przed publikacją (bez zmian na stronie)**
- Prawdziwe opinie (Google, Panorama Firm), zdjęcie właściciela, zdjęcia zespołu i lokalu.
- Model rozliczenia Opieki IT (stała opłata czy wycena od zakresu).
- Aktualności: kary KSeF (projekt MF), paragon z NIP do 450 zł, „Cyfrowy Uczeń 2027”, warunki Polskiej Bezgotówkowej — każde ze źródłem albo do usunięcia.
- Czy PRO-KOM jest punktem rejestracji EuroCert.
- Gwarancja Sunmi D3 PRO (dystrybutor Elzab vs Posnet).
