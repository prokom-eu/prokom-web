# K3.2 — zmiany dla prokombiznes.pl (dla Claude Code)

Stan: 27.10.2026, wizualizacja v143. Plansze z prefiksem „K3.2” w artefakcie projektu.
Zasady stałe: bez cen, bez leasingu i rat; treści własne (nie kopiujemy opisów producentów).

**Decyzje szefa z 27.10.2026:** PRO-KOM jest **autoryzowanym partnerem GoPOS i InsERT** oraz **autoryzowanym serwisem Posnet i Elzab** — te sformułowania wolno pisać. Z **COMEX i Optivendi** jest **współpraca, bez autoryzacji** — piszemy „we współpracy z COMEX / Optivendi”, nigdy „autoryzowany”. Obietnica **„oddzwaniamy w ciągu 60 minut”** na stronie głównej — **potwierdzona** (wymaga powiadomienia o nowym zapytaniu na telefon i statusów w panelu — sesja PROD).

## 1. COMEX — zasilacze UPS marki COVER

### Dane
- `seed/prokombiznes/k32/katalog-k32-comex.json`:
  - `karty` — 14 kart produktów w schemacie katalogu K3 (`slug_seed`, `nazwa`, `kategoria: serw`, `podkategoria: ups`, `marka: COMEX`, `seria`, `korzysc`, `podtytul`, `opis[3]`, `cechy[3]`, `parametry[]`, `warianty_opis[]`, `konfigurator`, `faq[]`, `dobierz[]`, `branze[]`, `zrodla[]`, `status`, `uwagi`).
  - `marka` — wpis marki COMEX do tabeli marek (opis, fakty ze źródłami, logo).
- Zdjęcia: `media/produkty/<slug>.webp` — 640×640, przezroczyste tło, po jednym na serię.
- Logo: `media/marki/logo-comex.svg` — wersja ciemna na jasne tło, sam znak bez hasła. `logo-comex-biale-z-haslem.svg` to oryginał (białe logo z hasłem) do ciemnego tła.

### Karty (kolejność na liście „Zasilacze UPS” — od najmniejszych)
Lista wspólna z APC:
1. APC Back-UPS
2. APC Back-UPS Pro
3. **COVER BASIC 1K**
4. APC Smart-UPS (wieża)
5. **COVER WINTER 3K**
6. **COVER CORE ONE 1/2/3K**
7. APC Smart-UPS rack
8. APC SRT
9. **COVER FLIX 6K**
10. **COVER CORE 6/10K**
11. **COVER JR 10K**
12. **COVER INSERT 15–40K**
13. **COVER PS 10–40K**
14. **COVER MY 30K**
15. **COVER FRAME 60–200K**
16. **COVER HS305/HS505**
17. **ATS-16A/30A**
18. **Karty SNMP**
19. **Akumulatory 7STARS**

Serie (pole `seria`): „COVER 1-fazowe”, „COVER 3-fazowe”, „Akcesoria UPS” — chipy serii na liście kategorii.

### Import
1. Dołącz `karty` do importu katalogu (jak `nowe-lenovo` / `nowe-dell`); pole `uwagi` jest WEWNĘTRZNE — nie publikować.
2. Dodaj markę COMEX z `marka` + logo do mediów.
3. Domeny źródeł: `comex.com.pl` → etykieta „Strona producenta — COMEX”.
4. Gwarancja: nie wpisujemy okresu (producent go nie podaje) — dopisać po ustaleniu z COMEX.

### Zmiana w szablonie kategorii (dotyczy wszystkich kategorii)
- Filtr „Do czego” i ramka „Nie wiesz, który?” zależą od kategorii/podkategorii (dotąd były na sztywno laptopowe):
  - `serw/ups`: Kasa i jedno stanowisko · Szafa rack: serwer, NAS, sieć · Cały budynek (3 fazy) · Akumulatory i akcesoria. Ramka: „Nie wiesz, jaki UPS?” → przycisk „Zapytaj o dobór” (formularz kontaktu / zapytania).
  - `serw/nas`, `serw/serwery`: analogicznie (patrz wizualizacja).
  - Pozostałe kategorie: dotychczasowe filtry; ramka z doborem laptopa tylko dla laptopów.
- W panelu: pola `filtry_do_czego[]` i `dobor_tekst / dobor_akcja` na poziomie podkategorii.
- Siatka kategorii: bez sztywnego limitu 16 — paginacja lub „Pokaż więcej” (wizualizacja pokazuje do 24).

### Do decyzji szefa
- ~~Status współpracy z COMEX~~ — rozstrzygnięte 27.10: „we współpracy z COMEX” (plakietka w salonie), bez „autoryzowany”.
- Czy pokazujemy UPS-y 3-fazowe dużej mocy (FRAME, HS) — w wizualizacji są, z dopiskiem „dobór po audycie”.

## 2. Optivendi — automaty vendingowe (nowa podstrona + 22 karty)

### Dane
- `seed/prokombiznes/k32/katalog-k32-optivendi.json`:
  - `karty` — 22 karty; kategoria `vend` z podkategoriami `z-winda` (automaty z windą i mikromarkety, 9 kart), `zywnosc` (automaty spożywcze, 7) i `boxomaty` (boxomaty i skrytki, 6).
  - `marka` — Optivendi (Skoczów, grupa Optimal).
  - `kategoria` — podkategorie i opis dla `vend`.
- `seed/prokombiznes/k32/strona-automaty-vendingowe-k32.json` — cała treść podstrony.
- Zdjęcia:
  - `media/produkty/optivendi-*.webp` — karty, 640×640, przezroczyste tło (Kluczomat to zdjęcie z tłem);
  - `media/zdjecia-strony/ovl-*.webp` — zdjęcia aranżacyjne do podstrony;
  - `media/marki/logo-optivendi.png` — na jasne tło;
  - `media/marki/logo-optivendi-na-ciemne.png` — oryginał na ciemne tło.
- Aptekomat pominięty: nie ma go w menu produktów Optivendi.
- Boxomaty chłodzone: wymiary odczytane z materiałów Optivendi (strony boxomatów blokuje robots.txt).

### Podstrona `/automaty-vendingowe` (widok jak w wizualizacji: Web-Vending, App-Vending)
Kolejność sekcji (zasada: spokojnie, po kolei):
1. Hero: logo Optivendi, plakietka „we współpracy z Optivendi”, H1 „Sprzedaż, która działa całą dobę. Bez obsługi.”, 2 przyciski, 4 korzyści, kolaż 3 zdjęć.
2. „Co chcesz sprzedawać?” — 7 zakładek (produkt → zdjęcie + pasujące automaty z linkiem do karty).
3. „Jak to działa” — 4 kroki.
4. „Automat w Twoim telefonie” — funkcje oprogramowania Optivendi + makieta telefonu (statyczna grafika, bez kwot).
5. „Dla kogo” — 6 kafli + akapit z referencjami Optivendi (ze źródłem).
6. „Cała oferta” — 3 zakładki = 3 podkategorie, siatka kart.
7. FAQ (7) + ramka kontaktu; pasek CTA.
- Linki: stopka „Najważniejsze” → Automaty vendingowe; menu w telefonie; ramka „Nie wiesz, jaki automat?” na liście kategorii `vend` → podstrona.
- Strona główna: kategoria „Automaty vendingowe” — opis i licznik z bazy (nie na sztywno).

### Do decyzji szefa
- ~~Status współpracy z Optivendi~~ — rozstrzygnięte 27.10: „we współpracy z Optivendi”, bez „autoryzowany”. Zostaje: zgoda Optivendi na użycie zdjęć.
- Gwarancja, czas dostawy i zasięg serwisu: Optivendi ich nie podaje — ustalić.

## 3. GoPOS i InsERT — wersja spokojniejsza (v130)
- Hero wraca do wersji v126 (zaakceptowanej wizualnie przez Krystiana). Plakietki (v142, decyzja szefa 27.10): „Autoryzowany partner GoPOS · Podhale i Małopolska” i „Autoryzowany partner InsERT · wdrożenia i opieka”.
- GoPOS, kolejność:
  1. hero → liczby;
  2. **Twój lokal** (5 rodzajów lokalu: opis, pakiet na start, podgląd zamówienia);
  3. **Cały lokal** (4 zakładki obszarów; pod spodem rozwijane „Moduły rozszerzające”);
  4. GoHub;
  5. KSeF / offline / telefon;
  6. urządzenia (4 + „Pokaż wszystkie”);
  7. konfigurator (pod nim rozwijane „Porównaj Basic i Pro”);
  8. wyniki klientów → filmy → wdrożenie;
  9. integracje (3 grupy + „Pokaż wszystkie”) → FAQ → CTA.
- Usunięte z GoPOS: sekcja zestawów gastronomicznych (są w „Gotowe zestawy”).
- InsERT, kolejność: hero → liczby → który Subiekt → porównanie → KSeF → InsPunkty (zasady Portfela rozwijane) → cała oferta → wdrożenie → wymagania → filmy → FAQ.
- Usunięte z InsERT: „Linie programów” i „Rodzina programów” (zawiera je „Cała oferta”).
- Komponent „rozwijany blok” (przycisk z chevronem + treść) — wspólny dla całej strony; domyślnie zwinięty.
- Stopka i menu (v142): „Autoryzowany partner GoPOS / InsERT” — potwierdzone przez szefa 27.10.

## 4. Zasada dla wszystkich nowych podstron (ustalona 26.10.2026)
Czyste hero z jedną myślą, potem treść w kolejności, w jakiej czyta klient. Szczegóły w zakładkach i rozwijanych blokach, bez ścian kart i bez powtórzeń.

## 5. Salon marki 2.0 — Posnet, Elzab, Sunmi (v133)
Nowy, wspólny szablon salonu marki, sterowany danymi. Lenovo i Dell zostają na dotychczasowym salonie z seriami. Kolejne marki (Druk, Sieć, NAS, COMEX, ESET…) dostają ten sam szablon.
- Adres jak dotąd: `/marki/<slug>`. Jeśli marka ma dane „salon 2.0”, renderuje się nowy układ.
- Dane: `seed/prokombiznes/k32/salony-k32.json` (wygenerowany, 14 salonów — patrz §6):
  - `pill`, `h1a`, `h1b`, `lead`;
  - `hero` — 3 produkty + podpisy;
  - `fk` — 3 krótkie fakty w hero;
  - `fam` — zakładki: tytuł + kategorie katalogu; produkty liczone z bazy po marce i kategorii;
  - `dob` — jedno pytanie, 4 odpowiedzi → modele + uzasadnienie;
  - `serwis` (Posnet, Elzab) albo `extra` (Sunmi i GoPOS);
  - `faq`; fakty i opis marki z tabeli marek.
- Kolejność sekcji:
  1. hero;
  2. oferta w zakładkach (siatka kart);
  3. „Pomóż mi wybrać” (pytanie → podpowiedź → modele → „Zapytaj o te modele”);
  4. blok serwisu: **„Autoryzowany serwis Posnet / Elzab w Rabce-Zdroju” — status potwierdzony przez Krystiana 26.10.2026**; fiskalizacja, przeglądy, naprawy, przejęcie serwisu; przycisk „Zgłoś kasę do serwisu”;
  5. O marce (fakty + pierwszy akapit; reszta w rozwijanym bloku; źródła);
  6. FAQ + ramka kontaktu.
- Telefon: ten sam porządek. Oferta to siatka 2 kolumn z zakładkami przewijanymi w bok, a wybór to lista opcji.
- Treści kart: usunięte nazwy skanerów marki spoza oferty publicznej przy wagach Elzab (wago-skaner Neptun 2 — „skaner bioptyczny standard / wyższej klasy”).
- Strona główna v20: usunięte 45 pozycji Honeywell z listy wyszukiwarki i wzmianka o czytniku innej marki.

## 6. Salon 2.0 — rozszerzenia (v135–v138) i nowe salony
Szablon z §5 dostał opcjonalne bloki. Każdy salon włącza tylko te, które mają sens dla marki.
- `heroCard` — szklana karta w hero z 3–4 najważniejszymi informacjami (np. „Jedna licencja chroni…”, „Przyjmiesz płatności…” + plakietki kart). Przy karcie hero ma 1–2 zdjęcia produktów, bez podpisów.
- `plans` — warianty na kartach zamiast siatki produktów: nagłówek (dla kogo + nazwa), 3–4 punkty, „Zapytaj” (dodaje do zapytania) i „Szczegóły” (karta produktu). `alt: true` → osobna sekcja „Poza głównymi…” w 2 kolumnach. Przy 4 głównych wariantach siatka ma 4 kolumny. `tag` — plakietka tylko dla wariantu, który polecamy („polecamy na start”). Nie piszemy „najczęściej wybierany”, bo nie mamy na to danych.
- `cmp` — tabela porównania pod wariantami. Na komputerze domyślnie rozwinięta (przycisk „Zwiń tabelę”), w telefonie zwinięta. Wartości: 1 = ✓, 0 = —, tekst = wartość.
- `dob` — opcjonalny. Gdy go nie ma, drugi przycisk w hero to „Zapytaj o ofertę” (przewija do ramki kontaktu).
- `extra.steps` — wdrożenie w 4 krokach zamiast zdjęć produktów.
- Zdjęcie wariantu: `p` = slug karty albo `im` = osobny plik (`media/produkty/ing-*.webp` — terminale Ingenico dla PolCard).

Salony w tej wersji (adres `/marki/<slug>`):
| Salon | Bloki | Uwagi |
|---|---|---|
| ESET | heroCard, plans (3 + 2 alt), cmp Entry/Advanced/Complete, steps | Elite i Small Business Security jako „alt” |
| Microsoft | heroCard, plans (4 × Microsoft 365 + 2 alt: Office 2024, Windows 11 Pro), cmp, dob, steps | info o anulowaniu subskrypcji tylko w pierwszych 7 dniach (NCE) |
| EuroCert | heroCard, plans (6), dob, steps | bez deklaracji „punkt partnerski” |
| PolCard | heroCard + plakietki kart, plans (6, osobne zdjęcia Ingenico), dob, steps | PolCard Go nie wystawia paragonu — napisane wprost |
| Samsung | heroCard, plans (4 ekrany + WAF alt), cmp, steps | Galaxy S / Tab S dojdą po researchu |
| Sharp/NEC | heroCard, plans (3 linie), cmp, steps | — |
| Avtek | heroCard, plans (6 + OPS i akcesoria alt), cmp, steps | „nie podano” tam, gdzie producent nie podaje EDLA |

Poprawki w salonach z §5:
- Krótsze nagłówki (2 linie), kolumna tekstu w hero szersza (1,08 : 0,92).
- Logotypy: poziome Ubiquiti i Konica Minolta (stare miało wtopioną szachownicę), oficjalne „Omada by tp-link” (przekolorowane na ciemne), Samsung. Pliki są w `media/marki/`.
- Salon „Sieć”: zdjęcie w hero to Switch Pro Max 24 PoE. Switch Pro 24 PoE nie ma dostaw u producenta.

## 7. Salon Lenovo i Dell (v139–v140)
Zostaje dotychczasowy układ z działami i seriami, ale:
- hero w stylu salonu 2.0 (`pill`, `h1a`/`h1b`, `heroCard` „Kupujesz sprzęt — dostajesz…”, 2 zdjęcia) — dane w `salony-k32.json` → `lenovo_dell_hero`;
- **domyślnie wybrana jest pierwsza seria działu.** Wcześniej siatka pokazywała cały dział, np. 28 laptopów. Strona Lenovo skróciła się z ok. 8 900 px do 5 000 px, w telefonie z 7 000 do 3 300 px;
- tabela „Porównanie serii” jest w bloku rozwijanym.

## 8. Nowe karty z researchu salonów (v141, po decyzjach 27.10) — 38 kart + 26 poprawek
- `katalog-k32-salony-b1.json` (2): Posnet Netpay, Posnet POS-UP.
- `katalog-k32-salony-b2.json` (22): Kyocera 5, Ubiquiti 7 (w tym UniFi Express 7), TP-Link Omada 5, Synology 1, QNAP 4.
- **Usunięte 27.10 (decyzja Krystiana — brak w Polsce albo nie pokazujemy; nie importować):** Sunmi T3 PRO/MAX, V3 PLUS, D3 MINI, CPad, K2 MINI; Konica Minolta bizhub C4051i/C4751i, C361i, 301i/258i/328i, 4201i/5001i/C3100i; Kyocera TASKalfa 2554ci–7054ci; Posnet Vendi; Elzab kasa samoobsługowa ONLINE i elzAPP POS; Synology ActiveProtect DP320/DP340.
- `katalog-k32-apple-samsung.json` (14): iPhone 17, iPhone 18 Pro / Pro Max, iPad Air (M4), iPad Pro (M5), MacBook Air (M5), MacBook Pro (M5), Mac mini, iMac 24", Mac Studio, Studio Display, Studio Display XDR, Galaxy S26 / S26+, Galaxy S26 Ultra, Galaxy Tab S12+ / S12 Ultra.
- `poprawki-k32-salony.json`: `{slug, pole, bylo, ma_byc, powod}` — m.in. `ux` → status „wycofany” (następca UX7, adres zostaje dla przekierowania), `usw24` → „wycofany-brak-dostaw” (następca `usw24max`), dopisane warianty Pro Max 16/48, OC400, ER7406/ER7412-M2/ER8411, Synology neo+.
- Wszystkie 38 kart mają status `gotowe`. 27.10 sprawdzone u producenta: Galaxy S26 / S26+ / S26 Ultra (tabela specyfikacji samsung.com/pl — Bluetooth 5.4 / 6.0, SIM, czasy pracy, aktualizacje zabezpieczeń do 28.02.2033), Galaxy Tab S12+ / Ultra (strony produktów samsung.com/pl — aktualizacje do 30.09.2033, kolory szary i srebrny), QNAP TVS-h474 / h874 i TS-h1065eU (specyfikacje qnap.com). UDM-Pro-Max i Synology DS2422+/RS2825RP+ publikujemy z danymi, które są (decyzja Krystiana).
- Nowe podkategorie w `komp`: `tablety`, `smartfony`; nazwa kategorii `komp` → „Komputery, tablety i telefony”.
- Marki bez wpisu w słowniku: Apple (bez logo na stronie — wytyczne Apple dla resellerów sprawdzić przed użyciem znaku), Samsung (logo w `media/marki/logo-samsung.svg`).
- Zdjęcia: `media/produkty/<slug>.webp`. Bez zdjęcia (zastępnik): tylko Kyocera TASKalfa 5004i/6004i.
- Zdjęcia pochodzą ze stron producentów (Apple, Samsung, Ubiquiti, TP-Link, Synology, QNAP, Kyocera, Posnet) — prawo do użycia potwierdzić (materiały partnerskie).

## 9. Kolory produktów (v141)
- `kolory-k32.json`: dla 9 kart (iPhone 17, iPhone 18 Pro, iPad Air, iPad Pro, MacBook Air, MacBook Pro, Galaxy S26, S26 Ultra, Tab S12) lista `{nazwa, hex, plik}`; zdjęcia w `media/produkty/kolory/`.
- Karta produktu: galeria = wszystkie kolory, pod nagłówkiem wiersz „Kolor: <nazwa> · N kolorów” z kropkami. Klik w kropkę zmienia zdjęcie; wybrany kolor dopisuje się do zapytania („Kolor: burgund · Wersja: …”). Telefon: kropki pod galerią, klik przewija galerię.
- Karty wariantów w salonach pokazują kropki dostępnych kolorów.
- Nazwy kolorów Apple jak na apple.com/pl; Samsung — kolory w zwykłej sprzedaży (Złoty i Srebrny tylko w sklepach Samsung — pominięte).
- Pole w panelu: `Products.kolory[]` (nazwa, hex, media) — kolejność = kolejność w galerii.

## 10. Salon Apple i Galaxy w salonie Samsung (v141)
- Salon Apple: hero z kartą „Apple Business w firmie” (konta firmowe, MDM, aplikacje, gotowe po włączeniu — z zastrzeżeniem przypisania przy zakupie), dwie sekcje wariantów z dużymi zdjęciami (iPhone i iPad · Mac i monitory), dobór (5 sytuacji), wdrożenie w 4 krokach, fakty z apple.com (Apple Business bezpłatne od 14.04.2026, 5 lat aktualizacji, AppleCare for Enterprise), FAQ.
- Nie piszemy: AppleCare+ for Business, iCloud dla firm, Siri / Apple Intelligence (niedostępne w PL / UE), „autoryzowany reseller”.
- Salon Samsung: druga sekcja „Telefony i tablety Galaxy” (S26 / S26+, S26 Ultra, Tab S12+ / Ultra) z Knox; Enterprise Edition tylko po potwierdzeniu u dystrybutora.
- Szablon: `plans2` = druga sekcja wariantów (bez tabeli), `big: true` = duże zdjęcia w kartach.

## 11. Do zrobienia po stronie danych
- Strona marki Ubiquiti: w `marki-k3.json` → `linie_produktow` zamienić „UniFi Express” na „UniFi Express 7”.
- Zdjęcie Kyocera TASKalfa 5004i/6004i [Krystian].
- Potwierdzić u dystrybutorów: Galaxy Enterprise Edition (na stronie się nie pokazuje), przypisywanie urządzeń Apple do Apple Business przy zakupie przez PRO-KOM.

## 12. Siedem starszych salonów na poziomie 2.0 (v143)
Posnet, Elzab, Sunmi, Druk (Konica Minolta + Kyocera), Sieć (Ubiquiti + TP-Link Omada), NAS (Synology + QNAP) i COMEX dostały to samo, co salony z v135–v141:
- **hero z kartą** (`heroCard`): kasy — „Kupujesz kasę X — dostajesz” (fiskalizacja, szkolenie, przeglądy, autoryzowany serwis); Sunmi — wdrożenie; Druk — co ustawiamy przy wdrożeniu; Sieć — jedna sieć, jeden panel; NAS — co obejmuje wdrożenie; COMEX — dobór UPS-a;
- **polecane modele** (`plans`): 4 karty ze zdjęciem i 3 cechami, jedna z plakietką „polecamy na start”, plus sekcja drugorzędna (`alt`, np. drukarki fiskalne, TP-Link Omada, UPS-y trójfazowe);
- **tabela porównania** (`cmp`) 4 modeli (Sieć: 3 bramy UniFi) — liczby wyłącznie z kart produktów;
- **wdrożenie w 4 krokach** (`extra.steps`).

Zmiana w szablonie: gdy salon ma i `plans`, i `fam`, pod polecanymi pokazuje się **pełna siatka** z zakładkami rodzajów — nagłówek „Pełna oferta · N pozycji” / „Wszystko w ofercie, według rodzaju” (id `oferta-cala`). Salony bez `fam` (ESET, Microsoft, Apple…) bez zmian. Kolejność sekcji: hero → polecane + tabela → drugorzędne → pełna oferta → „Pomóż mi wybrać” → serwis → wdrożenie → o marce → FAQ.

Dane: `salony-k32.json` (wszystkie 15 salonów, wersja v143).
