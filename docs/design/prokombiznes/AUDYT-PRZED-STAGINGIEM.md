# prokombiznes.pl — audyt przed stagingiem (01.11.2026, wieczór)

**Wersja:** `develop` e5788ba (po M1′ #261/#262, przed SWV7 B2 i M1′ PR 3), świeża baza `pnpm payload migrate` + `pnpm seed`, build produkcyjny (`next build` + `next start`). Badane: wszystkie 507 adresów z sitemapy (w tym 409 kart produktów), 28 szablonów w 1440 i 390 px w motywie jasnym i ciemnym porównanych z planszami `docs/design/prokombiznes/k4/screens`, axe (WCAG 2.1 A/AA) na 132 stronach, Lighthouse na 6 stronach, interakcje (mega-menu, Ctrl K, dodanie do zapytania, szuflada, fokus klawiatury, menu telefonu).

## Werdykt
Fundament jest dobry: **0 błędów 404/500 w sitemapie, 0 błędów konsoli, 0 nieudanych żądań, 0 naruszeń axe, 0 poziomego przewijania w 1440 i 390, 0 pustych zdjęć, jeden H1 wszędzie, JSON-LD na każdej stronie, zakazane marki 0, ceny tylko dozwolone (KSeF 10 000 zł, ulga 700 zł)**. Desktop jest w ~85% zgodny z planszami (salony, produkt, oferta, konfigurator, KSeF bardzo blisko).

**Nie jest gotowe na staging w trzech obszarach:**
1. **Telefon** — poza ramą (dolny pasek, menu-arkusz) strony na 390 px to złożona wersja desktopu, nie „aplikacja” z plansz App-*. Strona główna ma 22 000 px wysokości (plansza 5 000), kategoria 12 200 (plansza 2 200), GoPOS 19 000 (7 700). To jest wymóg K4-FINAL §7 / MOBILE-APLIKACJA i największa praca, która została.
2. **Wierność wizualna desktopu** — nagłówki sekcji 1,4–1,5× za duże, koło w hero bez stanu aktywnego działu, brak ciemnych kart hero na kilku podstronach, długie nazwy produktów w kartach, kategoria w starym układzie K3.
3. **Treść** — HP z „zamiennikami”, obietnice „zapisujemy w umowie” i „Wydajemy EuroCert na miejscu”, status Elzab w kategoriach automatów i skanerów, dane firmy.

Wydajność: Lighthouse mobile — `/` 77, produkt 76, salon Apple 79 (poniżej progu 90), oferta 92, kontakt 94, plan 88. Dostępność 100, dobre praktyki 100, SEO 92–100.

## P0 — blokuje staging
| # | Problem | Dowód | Poprawka |
|---|---|---|---|
| P0-1 | **Ekrany telefonu nie są układem aplikacji** (K4-FINAL §7, MOBILE-APLIKACJA §4 = DoD) | 390 px: główna 22 090 px vs `App-Start` 4 967; kategoria 12 237 vs `App-Kategoria` 2 164; oferta 7 366 vs 2 783; GoPOS 19 079 vs 7 670; konfigurator 3 690 vs 900; plan 4 457 vs 2 300; na głównej koło hero, wielkie H2 i karty 1-kolumnowe | sesja M1′-ekrany (prompt 2) |
| P0-2 | **Dane firmy** (decyzja 01.11): 889 003 889 i 883 200 151, kontakt@prokombiznes.pl, pn–pt 9–17 | w seedzie i w kodzie wciąż biznes@pro-kom.eu, biuro@pro-kom.eu (polityka, dostępność), 18 267 65 11, przykładowe +48 000…; stopka „pon., wt., śr., czw., pt. 09:00–17:00” | prompt 1 (A) |

## P1 — przed akceptacją szefa
**Treść i zasady K4-FINAL §1**
- **HP i zamienniki:** na 10 kartach HP w „Do tego zwykle dobierają” jest karta „Tusze i tonery — oryginały i sprawdzone zamienniki” (pod etykietą „Oryginalne tonery i tusze HP na zapas”). Nazwa karty `tusze-tonery` → neutralna „Tusze i tonery”, opis „oryginały; do HP tylko oryginały”; Brother może mieć zamienniki.
- **„zapisujemy w umowie / zapisany w umowie”** — `/`, `/kontakt`, `/o-firmie`, `/opieka-it` (4 strony). → „ustalamy w umowie”.
- **„Wydajemy EuroCert na miejscu”** — `/aktualnosci` (blok KSeF, krok 01). Niepotwierdzone (lista [SZEF]: „czy wydajemy podpis na miejscu”) → „Pomagamy wyrobić podpis EuroCert”.
- **Status w nagłówku kategorii**: „Automaty vendingowe · autoryzowany serwis Elzab”, „Skanery, etykiety i kolektory · autoryzowany serwis Elzab”, „Wagi sklepowe · autoryzowany serwis Elzab” (`categoryPill`).
- Wpis Aktualności: „Ministerstwo Finansów zapowiedziało projekt przedłużenia [braku kar] do końca 2027 (stan na 15.10.2026)” — bez źródła na stronie; lista [SZEF] „źródła wpisów”.
- Zakopane: link w pasku linii i „Sklep w Zakopanem ↗” w stopce (decyzja: usunąć, firma bez salonu w Zakopanem).

**Wygląd desktop vs plansze v150**
- **Nagłówki sekcji (H2) za duże:** plansza `.h2 { font-size: clamp(26px, 2.6vw, 36px) }` → 36 px w 1440; u nas `clamp(1.9rem,3.6vw,3rem)` / `clamp(2rem,4vw,3.4rem)` = 48–54 px na każdej stronie. H1 zgodny (plansza `clamp(34px,4vw,56px)`). Jedna poprawka tokenu/komponentu `Heading` daje największą zmianę odbioru.
- **Hero strony głównej — koło:** plansza: aktywny dział w środku („Dział 1 z 5 · Kasy i sprzedaż · 115 pozycji · Zobacz dział”), węzły działów w kolorach działów, miniatury produktów w kółkach; u nas środek „Twoja firma” — napis wychodzi poza koło, „jeden numer: +48…” ściśnięty, węzły białe, miniatury bez ramek.
- **Hero strony głównej — telefon pod przyciskami:** plansza „889 003 889 · Oddzwaniamy w ciągu 60 minut w godzinach pracy”; u nas sam przycisk z numerem.
- **Szybki start:** plansza = jeden pasek (ciemny panel „Od czego zaczynasz?” + 5 kolumn); u nas nagłówek + 5 osobnych kart.
- **Nazwy produktów w kartach:** pełne nazwy modeli („APC Back-UPS BXR — kasa i komputer (BXR750MI-GR, …)”, „Dell Pro 14 / Dell Pro 16 (PC14250 / …)”, „Microsoft 365 dla firm (Business Basic / …)”) — plansza używa nazwy krótkiej (`krotka` z katalogu K4). Karty i listy → `shortName ?? name`, pełna nazwa w H1 produktu.
- **Kategoria (`/oferta/kasy-fiskalne` i inne):** plansza `Web-kategoria-*`: ciemna karta hero z krótkim H1 („Kasy fiskalne”), chipy kategorii w hero, potem od razu filtry + siatka; u nas stary układ K3: H1 „Kasy fiskalne online. Dobrane, zafiskalizowane, z serwisem w Rabce.”, dobór 4 kafli, sekcje „Kupujesz kasę…”, „Często dobierane razem”, FAQ, „Jedna lista”, formularz — strona 2× dłuższa (7 300 vs 3 450 px). Do decyzji Krystiana: układ z planszy (rekomendacja) czy zostawić dodatkowe sekcje niżej.
- **Ciemne karty hero / sekcji** z planszy brakują: `/kontakt` (mapa w ciemnej karcie z „Wyznacz trasę”), `/opieka-it` (hero w ciemnej karcie z raportem), KSeF „Kary” (bordowa karta), „Te same sytuacje” (nagłówki tabeli czerwony/zielony z ikonami), „Osiem obszarów” (ikony, zdjęcie w panelu), kroki z ikonami.
- **Formularz kontaktu na głównej:** plansza ma chipy „W czym możemy pomóc?” nad polami; u nas bez (są na `/kontakt`).
- **Marki na głównej:** inny dobór/kolejność niż plansza (plansza: GoPOS, InsERT, Posnet, Elzab, ESET, Microsoft, EuroCert, COMEX, Apple, Samsung, Lenovo, Dell, Sunmi, PolCard, Konica Minolta, Ubiquiti) — u nas bez ESET i EuroCert, z Synology i Brother.

**Telefon (oprócz P0-1)**
- Tytuł ekranu w górnym pasku z H1 jest ucięty: „Kasy fiskalne online. …”, „Zadzwoń, napisz alb…”, „Apple dla firm. iPhon…”, „KSeF bez wyjątków o…” → krótka nazwa ekranu (Kasy fiskalne, Kontakt, Apple, KSeF) — pole „tytuł ekranu” albo nazwa kategorii/strony zamiast H1.
- Karta produktu: kafle „W skrócie” po jednym w rzędzie, wielkie (plansza: 2 kolumny, kompakt), brak wiersza „Twoja wersja”.

**Wydajność (Lighthouse mobile, lokalnie)**
- `/` 77: 10 plików CSS blokujących render (w tym style Instalacji — STAN „Pomysły” 1.11), TBT 510 ms, JS 236 KB nieużywanego, opóźnienie renderu LCP 2,2 s.
- Produkt 76 / salon Apple 79: LCP 5,1–5,4 s, z czego 1,1 s „element render delay” zdjęcia hero (sprawdzić `priority`/`fetchPriority="high"` i brak animacji wejścia na zdjęciu LCP).

## P2
- `/branze/*`: strzałka „←” w pasku telefonu prowadzi do `/branze` → **404** (jedyny martwy link w serwisie).
- Brak `meta description` na `/` (Lighthouse SEO 92); 11 opisów > 160 znaków (`/oferta` 171, `/plan-firmy` 174, `/branze/gastronomia` 216, …).
- 207 tytułów > 70 znaków (pełne nazwy modeli + „| PRO-KOM Biznes”) — Google ucina; tytuł karty z nazwy krótkiej.
- 118 stron bez `og:image` (podgląd w Messengerze/WhatsAppie bez obrazka).
- Ten sam `<title>` na `/automaty-vendingowe` i `/oferta/automaty-vendingowe`.
- „40 marek” (główna, mega-menu „Wszystkie · 40”) vs „39 marek” (Szybki start, salony) — jedna liczba.
- Licznik pozycji 433 vs plansza 427 — sprawdzić, czy liczy karty `do-sprawdzenia` (w sitemapie 409 produktów).
- Wyszukiwarka „kasa”: pierwszy wynik „APC Back-UPS BXR — kasa i komputer…”, Posnet Ergo dopiero 3., GoPOS All in One 2. — waga kategorii „Kasy fiskalne” i nazwy powinna wygrywać z opisem.
- `/zapytanie`: „Czego potrzebujesz? *” wymagane + pola „Firma / NIP”, „Jak się skontaktować?”, „Na kiedy?” — K4-FINAL §5: „Imię lub firma *, Telefon * lub e-mail, Wiadomość (opcjonalnie)”. Ujednolicić z szufladą i `/kontakt`.
- 404: sam nagłówek i przycisk; przy krótkiej stronie pod stopką widać czarne tło (`html` w kolorze stopki). Dodać wyszukiwarkę i 4–6 popularnych linków (jak Software), tło strony do końca ekranu.
- „P-4 albo P-5” łamie się po łączniku (`/marki/niszczarki`).
- Godziny w stopce: „pon., wt., śr., czw., pt. 09:00–17:00” → „pn–pt 9:00–17:00”.
- Mega-menu: logo marek w „Marki w dziale” doczytują się z opóźnieniem (puste białe kafle przez ~1 s) — `loading="eager"` w panelu albo wygaszanie.
- Elementy klikalne < 24 px (WCAG 2.2 2.5.8): do 41 na stronie (chipy, ikony w stopce) — sprawdzić najmniejsze.

## P3
- sr-only „(partner)” przy GoPOS/InsERT w menu → „(autoryzowany partner)”.
- Telefon 889 003 889 wpisany w kilkunastu blokach treści — przy zmianie numeru wiele miejsc.
- Opinie i zdjęcie właściciela: zaślepki (lista [SZEF]).

## Co jest zgodne (nie ruszać)
Salony (niszczarki, Apple, Posnet, Brother) — 1:1 z planszą; produkt desktop (galeria, „W skrócie”, „Wybierz wersję”, sekcje); oferta (kafle działów, filtry, siatka); konfigurator (kroki, wynik, `?kr=`); plan firmy; KSeF; motyw domyślnie jasny i ciemny bez kolizji kontrastu; fokus klawiatury 3 px wszędzie; dolny pasek i menu-arkusz telefonu.

## Poza kodem (bez zmian, lista [SZEF])
Opinie, zdjęcia właściciela/zespołu/lokalu, cytat; model Opieki IT; źródła wpisów (kary KSeF, przedłużenie do 2027); EuroCert na miejscu; gwarancje Sunmi D3 PRO / Kobra / Fellowes; prawa do zdjęć i logo; skrzynka kontakt@prokombiznes.pl (SPF/DKIM) przed stagingiem; polityka prywatności z nowym e-mailem.
