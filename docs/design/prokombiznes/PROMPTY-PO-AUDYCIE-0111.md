# prokombiznes.pl — prompty po audycie 01.11.2026 (z czatu projektu)

Źródło: czat projektu, 01.11.2026 wieczorem. Raport audytu: `AUDYT-PRZED-STAGINGIEM.md`. Prompt 1 (dane firmy, treść, SEO) zrobiony w PR #267 (z #272 i #275). **Kolejność i grupowanie sesji: `docs/zadania/prokombiznes.md` §7.2** (decyzja Krystiana 01.11: prompty 2–5 w dwóch sesjach). Prompty niżej to pełny zakres i kryteria odbioru — połączone prompty sesji w §7.2 odsyłają do nich.

## Prompt 2 — wierność desktopu z planszami v150 + wydajność

```
/zadanie feat/prokombiznes-wiernosc-v150 — desktop zgodny z planszami K4 + Lighthouse ≥ 90
Gałąź od origin/develop (po scaleniu fix/prokombiznes-audyt-0111). Raport: AUDYT-PRZED-STAGINGIEM.md §P1 „Wygląd desktop”, plansze docs/design/prokombiznes/k4/boards (podgląd K4-FINAL §9) i k4/screens/Web-*. Wartości (rozmiary, odstępy, kolory) czytaj z CSS planszy `Strona.dc.html`, nie z oka. PR-y piętrowe: W1 (typografia + karty), W2 (główna), W3 (podstrony), W4 (wydajność).

W1. Typografia: nagłówki sekcji H2 wg planszy `.h2 { font-size: clamp(26px,2.6vw,36px); line-height:1.05; letter-spacing:-.02em; font-stretch:112% }` — dziś `clamp(1.9rem,3.6vw,3rem)` / `clamp(2rem,4vw,3.4rem)` (48–54 px). Jedno miejsce (komponent/klasa nagłówka sekcji Biznesu), bez zmian Software/Instalacji. Sprawdź też lead (`clamp(16px,1.25vw,19px)`) i H1 kategorii/podstron (plansza: krótki H1 w karcie hero). Karty produktów: nazwa krótka (z PR 1), układ karty jak `Web-oferta` (zdjęcie z „+ Do zapytania” w rogu, „Podgląd”).
W2. Strona główna (`Web-start`, `Web-start-ciemny`): (a) koło hero — stan aktywnego działu w środku („Dział 1 z 5”, nazwa, liczba pozycji, „Zobacz dział”), węzły w kolorach działów, miniatury produktów w kółkach, klik/hover zmienia aktywny dział; bez „Twoja firma” wychodzącego poza koło; (b) pod przyciskami: numer + „Oddzwaniamy w ciągu 60 minut w godzinach pracy”; (c) Szybki start jako jeden pasek (ciemny panel + 5 kolumn); (d) marki: dobór i kolejność z planszy (GoPOS, InsERT, Posnet, Elzab, ESET, Microsoft, EuroCert, COMEX, Apple, Samsung, Lenovo, Dell, Sunmi, PolCard, Konica Minolta, Ubiquiti) + ciemny pas „Zobacz wszystkie marki · 39”; (e) formularz kontaktu z chipami „W czym możemy pomóc?”.
W3. Podstrony: kategoria wg `Web-kategoria-*` (ciemna karta hero z krótkim H1 i chipami kategorii, potem filtry + siatka; dodatkowe sekcje K3 — dobór kas, „Kupujesz kasę”, FAQ — zostają niżej tylko tam, gdzie plansza je ma; w razie wątpliwości zapytaj Krystiana z 2 opcjami); /kontakt (mapa w ciemnej karcie z „Wyznacz trasę”, karty kanałów jak plansza); /opieka-it (hero w ciemnej karcie z raportem, „Osiem obszarów” z ikonami i zdjęciem, tabela „Z opieką i bez” z nagłówkami czerwony/zielony i ikonami, kroki z ikonami); KSeF „Kary” jako karta bordowa; /zapytanie — pola jak K4-FINAL §5 (Imię lub firma *, Telefon * lub e-mail, Wiadomość opcjonalnie), wspólne z szufladą.
W4. Wydajność (Lighthouse mobile lokalnie na `pnpm build && pnpm start`: / 77, produkt 76, salon Apple 79): style Instalacji poza stronami Biznesu (STAN „Pomysły” 1.11 — `next/dynamic` / CSS przez layout grupy, uzgodnij strefę wspólną), mniej JS na głównej (koło, plan, karuzele — tylko wyspy klienckie, reszta serwer), zdjęcie LCP produktu i salonu z `priority` / fetchPriority high i bez animacji wejścia (dziś 1,1 s render delay). Cel: ≥ 90 dla /, /oferta, /produkt/posnet-ergo-online, /marki/apple, /kontakt, /plan-firmy (podaj przed/po).
DoD: `narzedzia/porownaj.mjs` (albo zrzuty Playwright) 1440 jasny i ciemny vs plansza dla każdej zmienionej strony — lista różnic w PR; Software i Instalacje bez zmian (e2e); lint/typecheck/test; /przeglad.
```

## Prompt 3 — telefon: ekrany jak aplikacja (M1′-ekrany)

```
/zadanie feat/prokombiznes-m1-ekrany — ekrany telefonu jak plansze App-* (K4-FINAL §7, MOBILE-APLIKACJA §4 = DoD)
Gałąź od origin/develop (po M1′ PR 1–3 i po prompcie 2). Rama (dolny pasek, menu-arkusz, StickyAction, przejścia) jest — teraz TREŚĆ ekranów < 768 px. Wzorzec: docs/design/prokombiznes/k4/screens/App-*.webp i boards/App-*.dc.html (wartości z CSS planszy). Osobne układy telefonu jako komponenty pokazywane < 768 px (CSS, bez drugiego drzewa tylko w przeglądarce — bez skoku układu), dane te same co desktop.
Stan dziś (390 px, audyt 01.11): główna 22 090 px vs App-Start 4 967; kategoria 12 237 vs 2 164; oferta 7 366 vs 2 783; GoPOS 19 079 vs 7 670; konfigurator 3 690 vs 900; plan 4 457 vs 2 300; produkt 12 429 vs 8 260; salony ~10 800 vs 6 000–6 800.
PR-y piętrowe:
E1. Start (App-Start, App-Start-ciemny): ciemna karta hero z wyszukiwarką, przewijane kafle Cała oferta / Konfigurator / Plan, rząd ikon Zadzwoń · KSeF 2027 · Zestawy · Opieka IT, działy jako karuzela, „Najczęściej wybierane” karuzela z „+”, „Firmy każdej wielkości” siatka 3×2, dofinansowania, Gotowe zestawy karuzela, Plan (chipy scen), Jak pracujemy (oś pionowa), zobowiązania 2×2, marki siatka 4×4 + „Zobacz wszystkie marki”, Opieka IT, „Nie wiesz, co wybrać?” z Zadzwoń. Bez koła hero na telefonie.
E2. Oferta, kategoria, filtry (App-Oferta, App-Kategoria, App-Kategoria-Druk, App-Filtry): chipy kategorii w jednym przewijanym rzędzie, pasek Filtry · Polecane · A–Z · Nowości · widok, marki jako chipy z logo, siatka 2 kolumny, „Widzisz 10 z N” + „Pokaż kolejne 10”, „Nie widzisz tego, czego szukasz?”; filtry w arkuszu.
E3. Produkt (App-Produkt, App-Produkt-caly, App-Produkt-ciemny, App-Produkt-COMEX): galeria z kropkami, „W tej karcie” chipy, 3 kafle cech, „Twoja wersja” z „Zmień ↓”, przewijane zakładki sekcji, „W skrócie” 2 kolumny (dziś 1 kolumna, wielkie kafle), opis, parametry jako lista.
E4. Salony i marki (App-Marka, App-Salon-*): hero kompakt, serie i modele jako karuzele (scroll-snap, kropki/licznik), porównanie jako przewijana tabela.
E5. Pozostałe: GoPOS, InsERT, Opieka, KSeF, Ulga, Vending, Kontakt, O firmie, Zestaw/Zestawy, Plan i punkt planu, Konfigurator i wynik, Zapytanie, Szukaj, Aktualności/Wpis, Branża — wg App-* (sekcje skrócone, tabele → karuzele/listy, H2 jak plansza).
Też: tytuł ekranu w górnym pasku = krótka nazwa (nazwa kategorii/marki/strony albo nowe pole „tytuł ekranu”), nie ucięty H1 (dziś „Kasy fiskalne online. …”, „Zadzwoń, napisz alb…”, „Apple dla firm. iPhon…”, „KSeF bez wyjątków o…”).
DoD na każdy PR: MOBILE-APLIKACJA §4 w całości; wysokość ekranu ±25% planszy; zrzuty 390 jasny i ciemny vs App-* (lista różnic); 0 przewijania w bok na 360/390/414; Lighthouse mobile ≥ 90 dla Start, Oferta, Produkt; desktop bez zmian (zrzuty 1440 przed/po); /przeglad.
```

## Prompt 4 — ruch premium

```
/zadanie BX-RUCH — ruch premium na prokombiznes.pl (na systemie ruchu SWV7, bez nowych bibliotek)
Gałąź feat/prokombiznes-ruch od origin/develop (po scaleniu fix/prokombiznes-audyt-0111 albo równolegle — inne pliki). Dwa PR-y piętrowe: R1 = system i elementy wspólne, R2 = sekcje i podstrony. Bez migracji.

CEL (decyzja Krystiana 01.11): wszystko, co klikalne, najeżdżane i przewijane, reaguje płynnie i naturalnie — drobne rzeczy, które razem dają „premium”. Ruch ma pomagać zrozumieć (co się otworzyło, skąd przyszło, co zostało dodane), nie zwracać na siebie uwagi.

ZASADY (twarde, te same co SWV7 — przeczytaj `src/styles/motion.css` nagłówek, `src/lib/motion/*`, `src/sites/software/RevealObserver.tsx`, STAN „SWV7 B1/B2”):
- Jeden system: tokeny `--ease-out / --ease-in-out / --ease-spring`, `--dur-press 120 / hover 200 / state 280 / enter 520 / sheet 420` z `tokens.css`. Zero nowych krzywych i czasów w komponentach. Zero nowych zależności (framer-motion, GSAP, Lenis — NIE).
- Ruszają się tylko transform/translate/scale, opacity, filter, clip-path. Nic nie zmienia układu → CLS = 0. Nie animujemy width/height/top/left/margin.
- Hover tylko `@media (hover:hover) and (pointer:fine)`; na dotyku — stan wciśnięcia (`:active`, scale .97, sprężysty powrót). Bez szarego prostokąta przy dotknięciu.
- `prefers-reduced-motion: reduce` → nic nie jedzie ani nie skacze; zostają szybkie (150 ms) zmiany kolorów i cieni. Bez JS i na wydruku wszystko widać.
- Wjazd przy przewijaniu tylko RAZ i tylko dla tego, co startuje poniżej ekranu; nic nie znika z powrotem przy przewijaniu w górę. Pierwszy ekran (hero) bez czekania na JS — LCP nie może się pogorszyć.
- Linki tekstowe w treści zostają z podkreśleniem (WCAG 1.4.1). Fokus klawiatury zawsze widoczny (outline-offset z systemu).
- Kolory i cienie tylko z tokenów Biznesu (marka zamknięta, docs/marka.md, ADR-007).

R1 — SYSTEM DLA BIZNESU (strefa wspólna: Software nie może się zmienić — e2e `software-transitions` zielone)
1. `motion.css`: reguły dziś zawężone do `[data-line='software']` udostępnij Biznesowi — `:is([data-line='software'],[data-line='biznes'])` albo wspólny atrybut (np. `data-motion-system` na <html> w obu ramkach). Rzeczy tylko-Software (szyna `glide`, okrągłe odsłanianie motywu) zostają tylko Software, chyba że punkt niżej mówi inaczej.
2. UWAGA kolizja: Biznes używa `data-card={position}` w `ProductCard` jako indeksu do fokusu (`Catalog.tsx:100`). Nie dopinaj do tego reguł kart — przenieś indeks na `data-card-index` (i popraw selektor fokusu) albo użyj innego haka ruchu.
3. `RevealObserver` przenieś do wspólnych (`src/components/motion/`) i podłącz w ramce Biznesu (BiznesFrame / layout Biznesu).
4. Elementy wspólne Biznesu: przyciski (`Button` z `data-motion`), strzałki `data-icon="arrow"` (+3 px na hover), ikony w kafelkach, pola formularzy (poświata fokusu, potrząśnięcie pola z błędem, spinner → ptaszek przy wysyłce), przełącznik motywu (płynna pigułka), dolny pasek telefonu (płynąca kreska aktywnej zakładki, ikona unosi się), arkusze (`BottomSheet` `motion: sheet|dialog`: od dołu / ze skali .96, tło płynnie), mega menu (panel wjeżdża, kolumny po kolei 40 ms), nagłówek przy przewijaniu (cień + mniejsze logo, scroll-driven, bez zmiany wysokości), szyna sekcji ≥ 1400 px (płynący wskaźnik — `RailShell` jest wspólny: rozwijanie przez clip-path zamiast szerokości, pomysł z STAN 1.11).
5. Test e2e `biznes-transitions` (wzór: `software-transitions`): 0 elementów klikalnych bez przejścia na 5 stronach (/, /oferta, /produkt/posnet-ergo-online, /marki/apple, /kontakt) × desktop/telefon; test reduced motion: brak animacji transform.

R2 — SEKCJE I PODSTRONY BIZNESU (każda pozycja: hover / klik / przewijanie)
- Strona główna: koło „Twoja firma” — dział po najechaniu lekko rośnie (1.04) i podświetla swoje miniatury, kliknięcie: płynne przejście do panelu działu; Szybki start i karty działów — uniesienie 4 px + miękki cień + strzałka; liczniki („433 pozycje”, „100+”, „od 2004”) liczą się raz przy wjeździe (`CountUp`, tekst z serwera dla SEO i czytników); marki — logo z szarości do koloru na hover; „Najczęściej wybierane” — płynąca pigułka filtra (`SlidingPill`), karty wjeżdżają kaskadą (40–60 ms); Plan Twojej firmy — punkt na planie pulsuje delikatnie raz przy wjeździe, hover powiększa punkt i podświetla wiersz listy (i odwrotnie), popup z filmem wjeżdża ze skali .96.
- Karty produktów (wszędzie): uniesienie 4 px, zdjęcie 1.03 w ramce, „Do zapytania”: po kliknięciu przycisk zmienia się w ptaszek („Dodano”), licznik w nagłówku/dolnym pasku podskakuje raz (scale 1→1.15→1), toast z dołu. Szybki podgląd — wjazd ze skali .96 z tła.
- Oferta i kategoria: filtry — pigułka i liczniki zmieniają się płynnie, siatka po zmianie filtra: stare karty wygasają, nowe wjeżdżają (bez skoku wysokości — View Transitions API tylko jeśli dostępne w zainstalowanym Next 16, sprawdź docs; inaczej opacity/translate); chipy podkategorii z płynną pigułką.
- Produkt: galeria — płynna zmiana zdjęcia (crossfade 280 ms), miniatury z ramką płynącą; kropki kolorów — pigułka i crossfade zdjęcia koloru; „Wybierz wersję” — płynąca pigułka; zakładki sekcji produktu — wskaźnik płynie; FAQ — miękkie otwieranie (`::details-content` / `interpolate-size` jeśli przeglądarka wspiera, inaczej opacity + translate treści), ikona + obraca się w ×; przyklejony pasek CTA na telefonie wjeżdża od dołu po minięciu hero.
- Salony marek: hero — logo marki i zdjęcia wjeżdżają kaskadą; serie — karty z uniesieniem; karuzele (telefon) — scroll-snap z kropkami/licznikiem pod spodem (pomysł z STAN SWV7, „nie zrobione”); porównanie serii — płynąca pigułka.
- Konfigurator: przejście między krokami w poziomie (translate + opacity), pasek postępu przez scaleX, wybrana odpowiedź — ptaszek rysowany (stroke-dashoffset), wynik „wskakuje” kaskadą, „Dodaj wszystkie polecane” → licznik zapytania podskakuje.
- GoPOS / InsERT / Opieka IT: eksplorator modułów i 8 obszarów opieki — płynąca pigułka i crossfade treści obszaru; raport przeglądu IT — wiersze statusów wjeżdżają kolejno (raz); kalkulator InsPunktów — liczby liczą się płynnie przy zmianie suwaka.
- KSeF / ulga / automaty: oś czasu KSeF rysuje się przy przewijaniu (scroll-driven, scaleY linii); „90% / do 700 zł” — CountUp raz.
- Szuflada zapytania i strona /zapytanie: pozycja dodana — wjazd z góry, usunięta — zwija się (opacity + scaleY na wrapperze, bez skoku: animuj grid-template-rows 0fr→1fr tylko jeśli nie psuje CLS, inaczej opacity); wysłanie — spinner → ptaszek → ekran sukcesu z numerem.
- Wyszukiwarka (Ctrl K): nakładka z blur tła i skali .98, wyniki kaskadą (30 ms), podświetlenie wybranego wyniku płynie przy strzałkach.
- Klik w telefon/e-mail: komunikat „Dzwonimy…/Otwieram pocztę” (jak `ContactToast` Software) — opcjonalnie.

POMIAR I ODBIÓR (DoD)
- CPU 4× wolniej (DevTools) na serwerze produkcyjnym (`pnpm build && pnpm start`): przewijanie strony głównej i produktu ≥ 55 kl./s, p95 klatki ≤ 20 ms, CLS 0, INP najdłuższej interakcji ≤ 200 ms; Lighthouse mobile ≥ 90 dla /, /oferta, /produkt/posnet-ergo-online (bez spadku vs przed zmianą — podaj oba wyniki).
- Nagrania (krótkie filmy Playwright `recordVideo`, 1440 i 390): główna (koło, karty, plan), dodanie do zapytania z licznikiem, filtr oferty, galeria produktu, mega menu, arkusz menu na telefonie, konfigurator — w opisie PR.
- reduced motion: zrzut/nagranie, że nic nie jedzie.
- e2e `biznes-transitions` + `software-transitions` zielone; lint/typecheck/test; /przeglad (recenzent: wydajność, dostępność, CLS, strefa wspólna), /koniec-sesji, /pr.
- Czego NIE robimy: paralaksy całych sekcji, animacji przy każdym przewinięciu w górę/dół, „pływających” elementów w tle, automatycznie przewijanych karuzel, dźwięków, kursorów-efektów.
```

## Prompt 5 — redakcja treści

```
/zadanie fix/prokombiznes-redakcja — teksty i nagłówki po ludzku (audyt treści 01.11)
Gałąź od origin/develop. Zmieniasz TYLKO teksty (seed K4, k4Pages.ts, homeFacts.ts, homePlan.ts, seed/prokombiznes/k4/*.json, stałe w komponentach) — bez zmian układu. Najpierw lista zmian (tabela przed → po) do akceptacji Krystiana, potem kod.

Diagnoza (cały serwis, 22 tys. słów): treść jest konkretna i w formie „Ty”, ale ma wyraźne cechy tekstu z AI:
- pauza „—” 334 razy = 15 na 1000 słów (tekst pisany przez człowieka: 2–4);
- 44 nagłówki H1/H2 w jednej formule „Zdanie. Puenta.” („Sala, kuchnia i dowozy. Jeden system.”, „Program to licencja. Spokój to wdrożenie.”, „Sprzedaż, która działa całą dobę. Bez obsługi.”), „Wszystko ze sobą rozmawia.” 3 razy;
- powtórki: „na piśmie” 51× na 18 stronach, „bez zobowiązań” 17×, „gotow…” 45×, „nie z Krakowa / nie z Warszawy”, „a nie infolinia” na kilku stronach;
- te same nagłówki na dwóch stronach: „Marki, które znamy od środka.” (główna i /marki H1), „Zobacz, co ustawimy w Twoim lokalu.” (główna i /plan-firmy H1), H1 branży powtórzony jako H2 na tej samej stronie;
- szablonowe H2 na wszystkich salonach: „Zanim wybierzesz X”, „X w kilku faktach”.

Zasady redakcji:
1. Pauza „—” tylko tam, gdzie naprawdę wtrąca; reszta → kropka, przecinek albo dwukropek. Cel ≤ 5 na 1000 słów. Test liczący.
2. Nagłówki: maks. 1/3 w formule „Zdanie. Puenta.”; reszta zwykłe zdanie albo rzeczownik. H1 stron systemowych zawiera słowo, którego szuka klient: /gopos → „GoPOS dla gastronomii: sala, kuchnia i dowozy w jednym systemie”, /automaty-vendingowe → „Automaty vendingowe dla firm. Sprzedaż przez całą dobę”, /o-firmie → „PRO-KOM z Rabki-Zdroju: kasy, komputery i IT dla firm od 2004 roku”, /insert → zostaje.
3. Żaden H1/H2 nie powtarza się na dwóch stronach. /marki H1 → „Wszystkie marki w ofercie”; /plan-firmy H1 → „Plan Twojej firmy: kliknij urządzenie i zobacz, co pasuje”; H2 na branży nie powtarza H1.
4. „Na piśmie” raz na stronę (w CTA lub przy formularzu); „bez zobowiązań” raz na stronę. „Nie z Krakowa/Warszawy”, „a nie infolinia” — tylko na głównej i w O firmie.
5. Salony: H2 „Zanim wybierzesz X” → pytania z nazwą marki („Pytania o kasy Posnet”); „X w kilku faktach” → „O marce X”.
6. Obietnice tylko potwierdzone (K4-FINAL §1): usuń „odpowiemy od ręki” (główna, FAQ), „dobierzemy w 5 minut rozmowy” (kategoria kas), „Odezwiemy się szybko” → „Oddzwonimy w ciągu 60 minut w godzinach pracy”.
7. „Słowo od właściciela” (cytat Tadeusza Wójciaka na głównej): tekst napisany przez nas — flaga `TODO(krystian): cytat do akceptacji szefa`, na produkcji ukryty, dopóki szef nie zatwierdzi (jak opinie, D-K4-6).
8. Puste obietnice i ogólniki zamień na fakt albo usuń: „Nowa strona PRO-KOM — wkrótce” (O firmie), „Elementy zestawu sprawdzamy pod kątem zgodności” → co konkretnie sprawdzamy, „nowoczesny program” (13×) → co program robi.
9. Nazwy produktów w tekstach i kartach: nazwa krótka (bez list kodów modeli).
10. Bez zmian: fakty producentów ze źródłami, liczby, statusy, teksty prawne.
DoD: tabela zmian w PR (przed → po, strona), test pauz i powtórek nagłówków (Vitest na seedzie), zrzuty 1440/390 głównej i 3 podstron, /przeglad.
```
