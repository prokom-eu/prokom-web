# prokomsoftware.pl — teksty na najwyższy poziom (SWV9, decyzja Krystiana 01.11.2026)

Przegląd tekstów (Claude, czat 01.11): strona główna, `/o-firmie`, `/kontakt`, `/cennik`, `/jedna-firma`, `/audyt`, `/dobierz`, `/rozwiazania`.
Ocena **8/10**. Treść jest konkretna i po ludzku: ceny „od”, terminy, płatności, źródła, język klienta. Do 10/10 brakuje trzech rzeczy:
1. Rytm nagłówków zdradza AI (szablon „Krótkie zdanie. Drugie krótkie zdanie.”).
2. Kilka haseł jest powtarzanych do znudzenia.
3. Jest parę ogólników i wpadek językowych.

**Nie zmieniamy treści merytorycznej** (cen, terminów, danych firmy, zakresów, decyzji v23). Zmieniamy tylko **jak** to jest napisane.

Zakres sesji: tylko teksty (seed + migracja danych jak w SWV6, żeby staging i produkcja dostały je z pipeline'u). Bez zmian układu i komponentów, z wyjątkiem tekstów zaszytych w komponentach (wymienione niżej).

---

## 1. Zasady (obowiązują w całym SWV9 i w każdym nowym tekście Software)

1. **Szablon „A. B.” (dwa krótkie zdania w nagłówku): najwyżej 1 na stronę.** Hero strony głównej ma do niego prawo. Reszta nagłówków to zwykłe zdanie, pytanie albo nazwa rzeczy.
2. **Budżet haseł na całą domenę** (wszystkie strony razem, bez FAQ i stopki):
   - „zanim zapłacisz” / „potem zapłacisz”: **najwyżej 3** (hero, kontakt na głównej, etap 02 procesu albo podglądy — wybierz 3, resztę przepisz);
   - „na piśmie”: dziś **81 wystąpień** w seedach. Zostaje tam, gdzie chodzi o dokument (wycena, umowa, raport audytu, czas reakcji w opiece). W pozostałych miejscach usunąć albo zastąpić konkretem („w umowie”, „w mailu z wyceną”). Cel: ≤ 25;
   - „robi się samo / robią się same / składa się samo”: **najwyżej 2**;
   - „Klient nie czeka i nie ucieka do konkurencji”: **1 raz**.
3. **Bez gier słów i zdań z banku haseł:** „a nie kurz”, „w kieszeni każdego pracownika”, „cała firma w jednym panelu”, „warstwa po warstwie”, „rośnie z firmą”, „robią całość”.
4. **Najwyżej jedna trójka (wyliczenie po trzy) na sekcję.**
5. **Każda liczba i twierdzenie o rynku ma źródło na stronie albo znika.** Wyjątek: dane własne PRO-KOM.
6. **„Co boli” nie używamy** (Krystian odrzucił „Powiedz, co Cię boli”). Zamiast tego: „co dziś zabiera Wam czas / pieniądze”, „co nie działa”.
7. Polski poprawny (wołacz, „ile kosztuje”, „znajdziesz”), twarde spacje przed jednoliterowymi wyrazami i w „60 s”, „1 dzień”.
8. Ton jak rozmowa w salonie w Rabce: konkretnie, życzliwie, bez wykrzykników i bez „rewolucjonizuje”, „kompleksowo”, „innowacyjne”.

**Zostawić bez zmian (to najlepsze zdania na stronie):**
- „Czasem powiemy: tego nie buduj.”
- „Co, jeśli wszystko jest dobrze? To napiszemy, że jest dobrze.”
- „Nie słyszysz »to nie u nas«.”
- „Żadnych telefonów »strona nie działa« w środku sezonu.”
- „Kawa w Rabce albo 30 minut online.”
- „Opisz krótko, po swojemu.”
- „Tego nie dopłacasz.”
- „Pięć rzeczy, które decydują, czy strona zarabia.”
- „Napisz, zadzwoń albo wpadnij. Odpowiemy z konkretem.”
- hero „Strony i programy dla firm. Zobaczysz, zanim zapłacisz.”

---

## 2. Nagłówki do zamiany (1:1)

| # | Gdzie (plik) | Teraz | Nowe |
|---|---|---|---|
| N1 | Główna, Oferta (`src/seed/software/homeExtras.ts`) | Osiem rzeczy, które robimy dla firm. | Co możemy dla Ciebie zrobić |
| N2 | Główna, Najczęściej zamawiane (`homeExtras.ts`, `run.ts`, `printHome.ts`) | 12 rzeczy, po które firmy przychodzą najczęściej. | Najczęściej zamawiane — z ceną i terminem |
| N3 | Cennik, hero (`src/seed/software/pricing.ts`) | Ceny bez gwiazdek. Na piśmie. | Ile to kosztuje — bez małego druku |
| N4 | Cennik, opieka (`pricing.ts`, tekst też w `components/pricing/LevelCards.tsx`) | Spokój co miesiąc. Bez długich umów. | Opieka po wdrożeniu: wybierasz poziom, rezygnujesz, kiedy chcesz |
| N5 | O firmie, hero (`src/seed/software/about.ts`) | Firma z Rabki. Od 2004 roku. | Robimy dla firm z Podhala od 2004 roku |
| N6 | Główna, proces, etap 05 (`seed/prokomsoftware/strona-glowna.json`) | Działa także za rok. I rośnie z firmą. | Po starcie nie zostajesz sam |
| N7 | Główna, WordPress (`strona-glowna.json`) | Bez wtyczek do łatania. Bez nocnych aktualizacji. | Dlaczego nie robimy stron na WordPressie |
| N8 | Główna, podglądy „Strona” (`strona-glowna.json`) | Strona, która zbiera zapytania, a nie kurz | Strona, z której klienci dzwonią i piszą |
| N9 | Główna, podglądy „System” (`strona-glowna.json`) | Cała firma w jednym panelu | Zlecenia, ekipy i faktury w jednym miejscu |
| N10 | Główna, podglądy „Aplikacja” (`strona-glowna.json`) | Aplikacja w kieszeni każdego pracownika | Ekipa ma zlecenie w telefonie, biuro od razu ma protokół |
| N11 | Główna, podglądy „Automatyzacje” (`strona-glowna.json`; w kreatorze `kreator.json:548`) | Powtarzalna robota robi się sama | SMS-y, faktury i raporty bez przepisywania |
| N12 | Audyt, kroki (`src/seed/software/audit.ts`) | Trzy kroki. Zero zobowiązań. | Jak wygląda darmowy audyt |
| N13 | Audyt i Cennik, poziomy (`audit.ts`, `pricing.ts`) | Zacznij za darmo. Głębiej, gdy trzeba. | Trzy poziomy audytu — pierwszy za darmo |
| N14 | O firmie i Jedna firma, linie (`about.ts`, domyślny tekst w `blocks/SwLines/config.ts` i `Component.tsx`) | Każda robi swoje. Razem robią całość. | Co załatwisz w PRO-KOM poza stroną |
| N15 | Jedna firma, hero (`about.ts`) | Strona, program, sprzęt i serwis. W jednej firmie. | Stronę, kasę, sieć i naprawę laptopa załatwisz w jednej firmie |
| N16 | Główna, technologie (`homeExtras.ts`) | Twój system, warstwa po warstwie. | Z czego budujemy — i co z tego masz |
| N17 | Główna, Jak robimy (`homeExtras.ts`) | Nie składamy z gotowych klocków. Piszemy pod Twoją firmę. | Piszemy stronę pod Twoją firmę, nie składamy jej z szablonu |
| N18 | Główna, proces etap 02 (`strona-glowna.json:25`) | Zobaczysz, jak to będzie wyglądać. Zanim zapłacisz. | Najpierw szkic do klikania i wycena, potem decyzja |
| N19 | Główna, proces etap 03 (`strona-glowna.json`) | Co tydzień klikasz nową wersję. Nie czytasz raportów. | Co tydzień dostajesz nową wersję do klikania |
| N20 | Główna, FAQ | Pytania, które słyszymy najczęściej | Pytania, które słyszymy najczęściej. (kropka jak w pozostałych H2) |

Po zamianie sprawdź regułę 1. Na każdej stronie może zostać najwyżej jeden nagłówek „A. B.”. Jeśli zostaje więcej, przepisz go w tym samym duchu co tabela.

---

## 3. Zdania do poprawy

| # | Gdzie | Teraz | Nowe |
|---|---|---|---|
| Z1 | Makieta hero i podglądów (`blocks/SwHero/HeroBuilder.tsx`, `components/home/PreviewScreens.tsx`) | Dzień dobry, **Anna** | Dzień dobry, **Anno** |
| Z2 | Główna, Oferta lead (`homeExtras.ts`) | …co z tego masz i **od ilu kosztuje**. | …co z tego masz i ile kosztuje. |
| Z3 | Główna, proces etap 01 (`strona-glowna.json:8`) | Pytamy o to, co boli, i o programy, które już masz. | Pytamy, co dziś zabiera Wam czas, i jakich programów już używacie. |
| Z4 | Główna, proces (`strona-glowna.json:97`) | Opowiadasz, jak pracuje firma i co boli. | Opowiadasz, jak pracuje firma i co nie działa. |
| Z5 | Branża (`components/industry/IndustrySections.tsx:72`) | Zobacz, co boli i co na to mamy | Typowe kłopoty w branży i co na nie mamy |
| Z6 | Główna, 12 rzeczy lead (`homeExtras.ts:19`) | …Kliknij kartę, żeby zobaczyć szczegóły. Wszystkie 29 rozwiązań **są** w pełnej ofercie. | Każda z ceną „od”, terminem i listą tego, co jest w cenie. Wszystkie 29 rozwiązań znajdziesz w pełnej ofercie. (zdanie o kliknięciu zostaje tylko w liczniku pod filtrami) |
| Z7 | Kontakt, notka (`src/seed/software/contact.ts:131`) | Odpowiemy w [CZAS ODPOWIEDZI]. | Odpowiemy w ciągu [CZAS ODPOWIEDZI]. |
| Z8 | Główna, Jak robimy lead (`homeExtras.ts:76`) | **Większość stron w Polsce** powstaje z gotowego szablonu i kilkunastu wtyczek. | Wiele firmowych stron powstaje z gotowego szablonu i kilkunastu wtyczek. (brak źródła na „większość”) |
| Z9 | Audyt, „Telefon” (`audit.ts:65`) | …Większość klientów wchodzi z komórki. | …Klienci coraz częściej wchodzą z telefonu. (albo dane ze źródłem, np. Gemius/StatCounter, z linkiem — wtedy „większość” może zostać) |
| Z10 | O firmie, tabela porównania (`strona-glowna.json:176,200` i podobne) | „tak, zapisane w umowie”, „na Podhalu i w Małopolsce, tak” (na ekranie z ikoną ✓ czytane jako „tak, tak”) | Komórki bez „tak”/„nie” w tekście — znaczenie niesie ikona + `sr-only` „tak”/„nie”: „zapisane w umowie”, „na Podhalu i w Małopolsce”. |
| Z11 | Technologie (`seed/prokomsoftware/technologie.json:62`) | …robią się same, także w nocy. | SMS-y, przypomnienia, raporty i kopie wysyłają się automatycznie, także w nocy. |
| Z12 | Obszary (`seed/prokomsoftware/obszary.json:215`) | SMS-y, maile, faktury i raporty robią się same. | SMS-y, maile, faktury i raporty bez ręcznego przepisywania. |
| Z13 | Kreator (`kreator.json:296, 474`) | „…robią się same”, „Rozliczenie miesiąca robi się samo” | „…wysyłają się automatycznie”, „Rozliczenie miesiąca bez liczenia godzin z kartek” |
| Z14 | Rozwiązanie „Czas pracy” (`rozwiazania.json:498`) | Rozliczenie miesiąca robi się samo. | Rozliczenie miesiąca gotowe jednym kliknięciem. |
| Z15 | Jak robimy, „Szybka” (`homeExtras.ts:83`) i technologie | „Klient nie czeka i nie ucieka do konkurencji…” (2×) | Zostaw w „Jak robimy”. W technologiach: „Strona otwiera się od razu, także na słabym zasięgu. Google lepiej ocenia szybkie strony.” |
| Z16 | Kontakt na głównej (`home.ts:88`) | Najpierw zobaczysz, potem zapłacisz. | Zostaje (jedno z 3 haseł) — chyba że budżet z reguły 2 wypada inaczej. |
| Z17 | Podglądy eyebrow (`homeExtras.ts:48`) | Podglądy na żywo · zanim zapłacisz | Podglądy na żywo · kliknij i sprawdź |
| Z18 | Rabka-Zdrój (`miejscowosci.json:13`) | …jak to może wyglądać, zanim zapłacisz. | …jak to może u Ciebie wyglądać. |
| Z19 | /rozwiazania, blok kontaktu (`components/ContactBlock.tsx:30`) | 5 krótkich pytań, widełki ceny od razu | 4 krótkie kroki, cena „od” od razu |
| Z20 | Kreator, „Rozbudowana strona” (`kreator.json:73`) | Wiele podstron, blog, języki, rezerwacje. | Wiele podstron, blog i języki. (rezerwacje online wycofane z oferty) |
| Z21 | Podgląd „Noclegi”, telefon (`PreviewScreens.tsx:481`) | Nowa rezerwacja · …Zaliczka opłacona online. | Nowe zapytanie o termin · 12–15 stycznia · 2 osoby. |

---

## 4. Dowód zamiast obietnicy (nowe zdanie)
Po usunięciu Realizacji strona składa się z samych obietnic. Jedyny prawdziwy dowód to **prokomserwis.pl, własny system PRO-KOM, który działa na co dzień**. Dodaj jedno zdanie z linkiem w sekcji „Jak robimy” na głównej, pod trzema kartami (nad źródłem progu szybkości):

> Tak budujemy też dla siebie: nasz serwis działa na własnym systemie — sprawdź status naprawy na prokomserwis.pl →

Link: `https://prokomserwis.pl`, w nowym oknie, z dopiskiem dla czytników „(nowe okno)”. `TODO(krystian):` ewentualnie dopisz, od kiedy system działa („od 2025 r.”), jeśli chcesz podać datę. Bez daty zdanie też jest poprawne.

---

## 5. Kontrola jakości (Definition of Done)
1. **Test Vitest „budżet haseł”** (`src/lib/software/copyBudget.test.ts`). Czyta seedy Software (`seed/prokomsoftware/*.json`, `src/seed/software/*.ts`) i sprawdza:
   - „zanim zapłacisz|potem zapłacisz” ≤ 3;
   - „robi się sam|robią się same|składa się sam” ≤ 2;
   - „co boli” = 0;
   - „na piśmie” ≤ 25;
   - „Klient nie czeka i nie ucieka” ≤ 1;
   - brak „od ilu kosztuje”, „Dzień dobry, Anna”, „rezerwacje.” w kreatorze.

   Najpierw test czerwony, potem zmiany.
2. Migracja danych `software_swv9_copy` (bez zmiany schematu) podmienia teksty w zapisanych blokach i ustawieniach. Wzór: `software_swv6_industry_links`. `down` nic nie przywraca.
3. Po zmianach przeczytaj na głos nagłówki każdej strony po kolei (lista H1/H2 w opisie PR). Na stronę najwyżej jeden „A. B.”, żadne hasło nie powtarza się w sąsiednich sekcjach.
4. Zrzuty 1440 i 390 sekcji, w których zmieniła się długość nagłówka. Nowe nagłówki są dłuższe, więc sprawdź łamanie i to, czy nic się nie ucina.
5. `lint`, `typecheck`, `test`, e2e `software-*` zielone; `/przeglad`; `/pr`; `docs/STAN.md` z listą „Przed stagingiem SWV9” (co poprawić ręcznie w panelu, jeśli migracja czegoś nie obejmie).

---

## 6. Prompt dla Claude Code

```
/zadanie SWV9 — teksty Software na najwyższy poziom wg docs/design/prokomsoftware/TEKSTY-SWV9.md.
Gałąź feat/software-swv9-teksty od origin/develop (po scaleniu SWV8; jeśli SWV8 jeszcze w toku — od niego, piętrowo).
Prompt jest kompletny — od razu kod, bez rundy planu.
Kolejność:
1. Test copyBudget (§5 pkt 1) — czerwony.
2. Zamiany 1:1 z tabel §2 (N1–N20) i §3 (Z1–Z21), w plikach wskazanych w kolumnie „Gdzie”; brakujące wystąpienia znajdź grepem po całym src/ i seed/ (Software).
3. Reguły §1: po zamianach przejrzyj wszystkie teksty Software i dociągnij budżety (szczególnie „na piśmie” do ≤ 25 — zostaw przy wycenie, umowie, raporcie audytu i czasie reakcji).
4. §4: zdanie o prokomserwis.pl w „Jak robimy” (TODO(krystian) na datę).
5. Migracja danych software_swv9_copy (wzór SWV6), test zielony.
6. Zrzuty 1440/390 zmienionych sekcji, lista H1/H2 każdej strony w opisie PR.
Nie zmieniaj: cen, terminów, danych firmy, zakresów, układu i komponentów (poza tekstami w nich zaszytymi).
Na koniec /przeglad, /pr, STAN.md.
```
