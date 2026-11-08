# prokominstalacje.pl — runda v6: porządki, wygląd, teksty po ludzku, Poradnik

Wersja 1.0 · 08.11.2026 · czat → Claude Code. Źródło: uwagi Krystiana 08.11 (zrzuty ekranu) i audyt gotowości 08.11 (`docs/audyty/prokominstalacje-audyt-0811.md`).
**Ten plik ma pierwszeństwo** przed `RUNDA-V5.md` i prototypem tam, gdzie się różnią. Spec §2 (decyzje biznesowe) obowiązuje bez zmian, z jedną zmianą z §1.1 niżej: przepisy znikają ze stron.

Sesje (folder `prokom-instal`, gałęzie `inst/*`, każda od `origin/develop`):

| Sesja | Co | PR-y | Szacunek |
|---|---|---|---|
| **INST-5** | struktura i wygląd: bez przepisów, bez realizacji na podstronach, kafle gwarancji, ikony, nagłówki bez dwóch kolorów, oś „Jak pracujemy”, obrazy (czarne sceny, Nowe rozwiązania), poprawki z audytu 08.11 | 4 | 2 wieczory |
| **INST-6** | teksty całej strony po ludzku + Poradnik i SEO | 4–5 | 3 wieczory |

Kolejność: najpierw INST-5, bo usuwa sekcje, których INST-6 nie musi już przepisywać. Równolegle w folderze `prokom-web` idzie mały PR wspólny z audytu 08.11 (`feat/wsp-szablony-szyna`).

---

## 1. Co zmieniamy i dlaczego

### 1.1 Bez przepisów na stronach (decyzja Krystiana 08.11)
**Usuwamy** wszystkie informacje o prawie: kodeksy, ustawy, rozporządzenia, wyroki (np. TSUE C-212/13), artykuły (np. art. 22² KP), RODO jako przepis, NIS2, Prawo budowlane, warunki techniczne, UKE jako regulator, ZAiKS/STOART i opłaty, koncesje, terminy z ustaw, zdanie „To nie jest porada prawna”.

**Zostaje praktyczna korzyść** bez cytowania prawa, np.:
- zamiast „Kamera… podlega RODO (wyrok TSUE C-212/13, Ryneš)…” → „Ustawimy kadr i maski tak, żeby kamera patrzyła tylko na Twoją posesję.”;
- zamiast bloku o Kodeksie pracy → „Monitorujesz pracowników? Pomożemy ustawić kamery tak, żeby obejmowały tylko to, co trzeba.”

**Nie ruszamy:**
- stron prawnych `/polityka-prywatnosci`, `/cookies`, `/dostepnosc`;
- zgody pod formularzami.

To są wymogi firmy, a nie treść o przepisach.

Miejsca w kodzie, sprawdzone na `develop` 4f0e8ea — każde użycie `LEGAL_NOTE` to blok o prawie:

| Plik | Co usunąć / przerobić |
|---|---|
| `obiekty/ObjectPage.tsx:236–256` | sekcja `#przepisy` na 12 stronach „Dla kogo” — cała, z danymi w `seed/prokominstalacje/obiekty/*.json` i `dane/obiekty.ts` |
| `blocks/InstArchitects/Component.tsx:412`, `dane/architekci.ts` (`przepisy`, `lawAsOf`, kotwica `przepisy`) | sekcja „Przepisy 2026–2028” — cała; zdania o warunkach technicznych w innych sekcjach architektów |
| `widzety/teletechnika/TeletechnikaSections.tsx:188–208`, `dane/teletechnika.ts` | sekcja `#przepisy` — cała; kotwica z paska i z seeda (`ANCHORS_V5`) |
| `widzety/monitoring/MonitoringSections.tsx:137`, `Calculators.tsx:198`, `dane/monitoring.ts` | „Gdzie kamera może patrzeć, a gdzie nie” → sekcja praktyczna (maski, kadr, tabliczka) bez prawa; `R.law` w kalkulatorze |
| `widzety/sieci/SieciSections.tsx:125, 258, 275` | `portal.rodo`, `standards.band`, cała sekcja NIS2 |
| `widzety/dostep/DostepSections.tsx:111, 137` | biometria w firmie (prawo), zamki a ppoż. jako przepis → zostaje praktyka („przy braku prądu drzwi ewakuacyjne się otwierają”) |
| `widzety/alarmy/AlarmySections.tsx:183` | `agency.licence` |
| `widzety/ekrany/EkranySections.tsx:176` | `outdoor.law` (uchwała krajobrazowa) |
| `widzety/ladowarki/LadowarkiSections.tsx:125` | blok formalności/UDT jako przepis → „Pomagamy w formalnościach” jednym zdaniem albo usunąć |
| `widzety/naglosnienie/NaglosnienieSections.tsx:130, 154, 186` | DSO jako wymóg prawny, opłaty ZAiKS/STOART (`licences.fees`) |
| `dane/anteny.ts` | abonament RTV i opłaty za odbiorniki w hotelach (30,50 zł, STOART) |
| `poradnik/GuidePost.tsx:217` | `LEGAL_NOTE` w poście |
| FAQ wszystkich stron, `dane/glownaSekcje.ts`, `seed/prokominstalacje/wspolne.json`, `oferta-76.json` | odpowiedzi cytujące prawo → praktyczne albo usunąć pytanie |
| `dane/prawo.ts`, `dane/stanFaktow.ts` | usunąć, gdy nic ich nie używa |

Test (Vitest na danych + e2e treści na 35 stronach): brak słów `Kodeks`, `art. `, `ustaw`, `rozporządz`, `TSUE`, `Dz.U`, `NIS2`, `porada prawna`, `ZAiKS`, `STOART`, `UKE`. Wyjątek: strony prawne i zgody.

**Poradnik:** kategoria „Przepisy” znika, a z nią krótkie odpowiedzi o prawie z `dane/poradnik.ts`: UKE, UDT, DSO, uchwała krajobrazowa, odcisk palca. Wpis „Monitoring w pensjonacie a RODO” — decyzja **D1** (§4).

### 1.2 Realizacje tylko na `/realizacje` i na stronie głównej
Usuwamy sekcje realizacji ze wszystkich podstron:
- Ekrany `#gdzie`, Sieci `#okablowanie` (`RealizationStrip`);
- Nagłośnienie `#realizacje-n`;
- Teletechnika `#realizacja-t`;
- strony „Dla kogo” `#realizacje-s`;
- architekci (`realizations`, „Wybrane realizacje”), o ile jest.

Razem z nimi idą kotwice w pasku i w szynie, wpisy w seedzie (`ANCHORS_V5`, kotwice obiektów), testy e2e i nieużywane komponenty (`RealizationStrip`, `matchRealization`, `leadPhoto`, jeśli zostaną bez użycia).

**Karty bez zdjęcia nie pokazują się nigdzie** (dziś np. Empik z ikoną głośnika) — decyzja **D2**. Dotyczy `/realizacje` i strony głównej.

### 1.3 Kafle „Gwarancja / Odpowiadamy szybko / Masz już instalację”
`sekcje/GuaranteeSection.tsx` — ten sam blok i nagłówek „24 miesiące gwarancji na montaż. Serwis pod jednym numerem.” na 21 stronach. Kafle są wielkie, puste w środku, a nagłówek się powtarza.

**Nowy wygląd:** jeden niski pas zaufania (wysokość ok. 96–120 px na komputerze). Trzy pozycje w rzędzie, każda złożona z ikony 20 px w kafelku 36 px i jednego zdania z pogrubionym faktem:
- „**24 miesiące** gwarancji na montaż”;
- „**Odpowiadamy w 1 dzień roboczy**”;
- „**Przejmujemy serwis** po innych firmach →”.

Sekcja nie ma nagłówka H2. Na telefonie pozycje układają się w pionie albo w poziomym rzędzie ze snapem. Pas stoi tuż nad pasem CTA (jedno miejsce na stronie) i nie występuje na stronach, które mają już własną sekcję serwisu (`/serwis`).

**„24 h”:** zostaje tylko jako odpowiedź na zgłoszenie (spec §2). W nowym pasie piszemy „w 1 dzień roboczy”, bo „Do 24 h” w kaflu wyglądało jak czas przyjazdu.

### 1.4 Nagłówki bez dwóch kolorów
Dziś część H1/H2 ma drugą połowę w kolorze akcentu (`.acc` w `PageHero.tsx:77`, `SectionHead.tsx:21`, `SplitHero.tsx:50`, `GuaranteeSection`, karty i inne `<em>`/`.acc`). Wygląda to jak „wygenerowane przez AI”.

**Zmiana:** nagłówki w jednym kolorze tekstu (`--ink` / w ciemnym `--on-dark`). Wyróżnienie, jeśli w ogóle jest, to tylko podkreślenie jednego słowa, a nie kolor:
- `.acc` → `color: inherit`;
- usunięte gradienty i kolor tekstu w nagłówkach;
- pole `h1b` w danych zostaje, ale składa się z `h1a` w jedno zdanie bez wyróżnienia.

Nadtytuł (`.eye`) może zostać w kolorze usługi, ale krótszy (§2.2). Kontrast musi zostać ≥ 4,5:1 (test kontrastu bez zmian).

### 1.5 Ikony — przegląd całej strony
Przykład z `/alarmy` (zestaw „Dom letniskowy”):
- puste kafelki ikon przy pozycjach spoza zestawu;
- „×” jako ikona zbicia szyby;
- kółko jako czujka zewnętrzna;
- tarcza przy agencji ochrony.

**Zasady:**
1. Jeden zestaw ikon (`InstIcon`, kreska 1,75–2 px, 20–24 px w kafelku 40 px), ten sam kafelek w całej linii.
2. Pozycja nieaktywna (poza zestawem) = cała karta przygaszona (`opacity` ok. 0,55 + etykieta „poza zestawem”), nigdy pusty albo wyblakły sam kafelek ikony.
3. Ikona mówi, co to jest. Do dorysowania w `icons.ts`: zbicie szyby (szyba z pęknięciem), czujka zewnętrzna (czujka z drzewkiem/słońcem), agencja ochrony (słuchawka z gwiazdką albo samochód patrolu), klawiatura alarmu (klawiatura numeryczna), centrala (skrzynka z falą), sygnalizator (lampa z falami), zalanie (kropla z falą), LTE (antena z kreskami sygnału). Bez „×”, „○” i pustych kwadratów jako ikon.
4. Przegląd każdej strony: lista „strona → sekcja → ikona → co oznacza → zmiana” w opisie PR. Ikony bez znaczenia (ozdobne przy każdym akapicie) usuwamy.
5. Wyszukiwarka: grupa „Usługi” ma dziś tarczę przy każdej usłudze (np. Ładowarki) — ikona usługi z danych usług.

### 1.6 Oś „Jak pracujemy”
`ProcessAxis.tsx`, główna `#proces` i Teletechnika `#etapy`. Dziś linia wypełnia się przy przewijaniu (scroll-driven). W połowie drogi wygląda to na zepsute (węzeł 06 pusty, odcinek szary), a ruch jest ledwo widoczny.

**Nowe zachowanie:**
- **Raz przy wejściu w widok** (IntersectionObserver, próg 0,35): linia rysuje się od lewej w 1,2 s; węzły 01→06 wypełniają się kolorem kolejno co 150 ms z lekkim „pop” (`scale` 0,85 → 1 sprężyną); karty pod węzłami wjeżdżają kaskadą (12 px w górę + przenikanie, co 70 ms).
- **Stan końcowy zawsze pełny:** wszystkie węzły wypełnione, cała linia w kolorze — żadnych półstanów zależnych od przewinięcia.
- **Najechanie na kartę:** jej węzeł rośnie (1,1), karta unosi się 4 px z obramowaniem w kolorze akcentu; reszta bez zmian.
- **Telefon:** oś pionowa, ta sama sekwencja.
- **Reduced motion:** od razu stan końcowy.
- **Tekst sekcji:** nagłówek bez wyliczanki „Rozmowa, wizja lokalna, projekt, montaż, odbiór, serwis.” → np. „Jak wygląda współpraca: od telefonu do serwisu” (ostateczne brzmienie w INST-6).

### 1.7 Obrazy
1. **Czarne prostokąty w „Zwykle idzie w parze” / „Co jeszcze montujemy…”** (`sekcje/Related.tsx`, sceny `SERVICE_SCENES`) na stronach usług i obiektów. Style scen (`.sx*`, tokeny `--sx-*`) są w `sekcje/glowna/glowna-sekcje.css`, który nie ładuje się na podstronach. SVG bez klas = czarne wypełnienie. Poprawka: style scen do osobnego arkusza (np. `sekcje/sceny.css`) importowanego przez `Related` i przez główną; e2e: na `/monitoring` i `/dla-kogo/budowy` wypełnienie pierwszego `rect` w `#powiazane` ≠ `rgb(0, 0, 0)`.
2. **„Co warto pokazać inwestorowi w tym sezonie”** (`/dla-architektow`, Nowe rozwiązania): u Krystiana lokalnie puste obrazki (ikona zepsutego obrazu). W świeżym buildzie z `pnpm seed` obrazy się ładują. Najpewniej w bazie są rekordy `Media`, a pliku nie ma w folderze mediów tego folderu (worktree). Do sprawdzenia i naprawy:
   - seed ponownie wgrywa plik, gdy rekord istnieje, a pliku brak;
   - karta z niedostępnym obrazem pokazuje rysunek SVG zamiast zepsutego `<img>` (`onError` → zapasowa ilustracja, test).

   Na stagingu i produkcji zdjęcia są w panelu (checklista).
3. **Logo marek („Marki, z którymi pracujemy”) — zawsze w kolorach marki** (decyzja Krystiana 08.11). Dziś są szare i kolor pojawia się dopiero po najechaniu. Zmiany:
   - usunąć filtr `grayscale` i spadek przezroczystości w obu motywach, także na telefonie;
   - wszystkie kafle tej samej szerokości (dziś kafel Hikvision jest dwa razy szerszy);
   - logo wyśrodkowane w polu o stałej wysokości 30–34 px (RUNDA-V5 §2);
   - za małe `sizes` (plik 119–220 px na 177–392 px) → `sizes` wg rzeczywistej szerokości kafla, warianty 2×;
   - pliki w kolorze z `public/instalacje/marki/` — gdzie plik jest szary albo przycięty (np. Ubiquiti), wziąć oficjalną kolorową wersję z pakietu `docs/design/prokominstalacje/v5/marki/` albo zgłosić brak w PR.

### 1.8 Z audytu 08.11 (część linii)
- `/ekrany` „Wdrażamy to u siebie”: twierdzenie o salonie bez potwierdzenia (`TODO(krystian)`) i ceny telefonów z podpisem „PRO-KOM · salon”. → decyzja **D3**.
- Teletechnika „W jakich standardach pracujemy”: zobowiązania z `TODO(krystian)` (rodzaj światłowodu, raport z pomiarów) — usuwamy zdania, których szef nie potwierdził (spec: nie obiecujemy rzeczy niepotwierdzonych).
- Tabele i rzędy przewijane na telefonie (`.tblw`, `.brands`, `.gorg`, `.bmg`, `.artlw`, `ol` w Serwisie): `tabindex="0"`, `role="region"`, `aria-label` (axe `scrollable-region-focusable`).
- `/o-firmie`: „2004 · na Podhalu” i „20+ · lat na Podhalu — od 2004” mówią to samo → jedna liczba, w drugim kaflu inny fakt z panelu.
- LCP strony głównej ≤ 2,5 s na stagingu (dziś 3,6 s): sceny SVG spoza pierwszego ekranu z HTML do leniwego ładowania po przewinięciu, pomiar przed/po (Lighthouse lokalnie A/B + CI stagingu). `/ladowarki-ev` (2,56 s) — obraz LCP z `fetchPriority="high"`.
- Seed `strony-zrzut/Oferta.json`, `Poradnik.json`: „Opisz obiekt albo wyślij zdjęcia”, „Wyślij zdjęcie obiektu albo opisz sytuację” → zamiana w `src/seed/instalacje/map.ts` + test treści (bez „wyślij zdję”).

---

## 2. Teksty po ludzku (INST-6) — zasady redakcji

### 2.1 Cel
Każdy nagłówek i akapit ma odpowiadać na pytanie klienta: co dostanę, dla kogo to jest, ile to trwa, co mam zrobić. Czyta to właściciel domu, pensjonatu, sklepu albo proboszcz — nie inżynier ani copywriter.

### 2.2 Zasady
1. **Nagłówek mówi, o czym jest sekcja.** Temat + korzyść w jednym zdaniu, maks. ok. 60 znaków. Bez sloganów z dwóch zdań, bez zagadek, bez metafor.
2. **Zakazane chwyty** (brzmią jak AI):
   - „nie X, tylko Y” / „X, a nie Y”;
   - wyliczanki z przecinkami („Rozmowa, wizja, projekt, montaż…”);
   - trójki rytmiczne („Kamery. Alarm. Spokój.”);
   - zdania-pointy z kropką po dwóch słowach;
   - „Twój inteligentny…”, „na żywo”, „bez kompromisów”, „kompleksowo”, „innowacyjny”, „najwyższa jakość”;
   - pytania retoryczne w co drugim nagłówku.
3. **Konkret zamiast przymiotnika:** liczba, nazwa miejsca, przykład z życia. Tylko fakty prawdziwe — z danych w repo albo ze strony producenta (bez cen sprzętu, bez list źródeł na stronie).
4. **Słowa klienta:** „kamera przy furtce”, „Wi-Fi w każdym pokoju”, „alarm w domku, w którym nikt nie mieszka”. Bez żargonu bez wyjaśnienia (PoE, NVR, DVB-T2 — przy pierwszym użyciu jedno słowo wyjaśnienia).
5. **Akapit:** 1–3 zdania, najważniejsze na początku. Lead pod H1 — 2 zdania: co robimy + gdzie/dla kogo.
6. **Nadtytuły (`.eye`):** 1–3 słowa („Monitoring”, „Dla pensjonatów”, „Jak pracujemy”). Bez „· RABKA-ZDRÓJ, PODHALE I TATRY” przy każdej usłudze. Miejsce raz w H1 albo w leadzie, dla SEO.
7. **SEO bez upychania:** H1 = usługa + region („Monitoring domu i firmy na Podhalu”); H2 z naturalnymi frazami, których ludzie szukają („Ile kamer potrzebuje dom”, „Kamera Wi-Fi czy przewodowa”). Każdy tytuł strony ≤ 60 znaków, opis 140–155 znaków, oba unikalne.
8. **CTA:** czasownik + co się stanie. Na przykład „Zaplanuj instalację”, „Zadzwoń: 889 003 889”, „Opisz obiekt — oddzwonimy w 1 dzień roboczy”. Ten sam nagłówek pasa CTA może być na wszystkich stronach, ale bez sloganu.
9. **Bez powtórzeń między stronami:** bloki powtarzane na 15 stronach (gwarancja, FAQ „Wyślij zdjęcie…”, „Do 24 h odpowiadamy…”) piszemy raz albo w wariantach (P2-19).
10. **Ton:** „Ty”, krótko, życzliwie, bez wykrzykników i emotek.

### 2.3 Przykłady (obecne → kierunek)
| Obecnie | Kierunek |
|---|---|
| Twój inteligentny obiekt na żywo. | Monitoring, alarmy, Wi-Fi i smart home na Podhalu |
| Rozmowa, wizja lokalna, projekt, montaż, odbiór, serwis. | Jak wygląda współpraca: od telefonu do serwisu |
| Twarz przy furtce, tablica przy bramie. Bez podglądania sąsiada. | Co zobaczysz na kamerze przy furtce i przy bramie |
| Pięć rodzajów kamer. Każda do innego miejsca. | Jakie kamery montujemy i gdzie się sprawdzają |
| Alarm, który budzi złodzieja, a nie Ciebie. | Alarm do domu, mieszkania i firmy na Podhalu |
| Nikogo nie ma od miesiąca. Alarm i tak pilnuje. | Alarm w domu, w którym nikt nie mieszka na stałe |
| Stok zasłania nadajnik, halny szarpie masztem. | Dlaczego w górach antenę ustawiamy miernikiem |
| Mocniejszy router zwykle nie pomaga. Pomaga plan. | Dlaczego Wi-Fi nie działa w całym domu i jak to naprawić |
| Gość nie zobaczy Twoich kamer ani kasy. | Osobna sieć dla gości, kamer i kasy |
| Antena ustawiona miernikiem, nie na oko. | Anteny satelitarne i DVB-T2 na Podhalu |
| Powiedz, co planujesz. Przyjedziemy i wszystko policzymy. | Zaplanuj instalację — oddzwonimy w 1 dzień roboczy |
| Monitoring na Podhalu, który widzi w nocy, w śniegu i tylko to, co trzeba. | Monitoring domu i firmy na Podhalu |

### 2.4 Gdzie są teksty
- `src/sites/instalacje/dane/*.ts`;
- `seed/prokominstalacje/obiekty/*.json`, `oferta-76.json`, `wspolne.json`, `strony-zrzut/*.json` (te, które seed importuje);
- `src/seed/instalacje/*.ts`;
- SEO w `lib/instalacje/seo.ts` i seedzie stron.

Seed nie nadpisuje ułożonych stron w panelu, więc każdy PR kończy się **plikiem zmian do panelu** (decyzja **D4**: skrypt).

---

## 3. Poradnik — więcej konkretu i najlepsze SEO (INST-6)

### 3.1 Wpisy (8 nowych, praktyczne, bez prawa)
| # | Tytuł roboczy (≤ 60 zn.) | Fraza główna | Linki wewnętrzne |
|---|---|---|---|
| 1 | Ile kamer potrzebuje dom i gdzie je powiesić | ile kamer do domu | `/monitoring`, `/dla-kogo/dom` |
| 2 | Kamera Wi-Fi czy przewodowa? Co wybrać do domu | kamera wifi czy przewodowa | `/monitoring`, `/sieci-wifi` |
| 3 | Alarm w domku letniskowym: jak pilnować pustego domu | alarm domek letniskowy | `/alarmy`, `/dla-kogo/apartamenty` |
| 4 | Wi-Fi w pensjonacie, które działa w każdym pokoju | wifi w pensjonacie | `/sieci-wifi`, `/dla-kogo/pensjonaty` |
| 5 | Smart home przed tynkami: co zaplanować w budowie | smart home w nowym domu | `/smart-home`, `/dla-architektow` |
| 6 | Ładowarka do auta w domu: co sprawdzić przed montażem | ładowarka do samochodu elektrycznego w domu | `/ladowarki-ev` |
| 7 | Monitoring zimą w górach: mróz, śnieg i wiatr | kamera na mróz | `/monitoring`, `/dla-kogo/hotele` |
| 8 | Antena satelitarna czy DVB-T2 na Podhalu | antena satelitarna czy naziemna | `/anteny` |

Istniejące „krótkie odpowiedzi” zostają tylko te bez prawa i są przerobione na konkretne (3–5 zdań + link do usługi).

### 3.2 Każdy wpis
- **Długość:** 900–1500 słów.
- **Pierwsze 2 zdania** to odpowiedź na pytanie z tytułu.
- **Spis treści** z kotwicami, H2 jako pytania, które ludzie wpisują w Google.
- **Lista kontrolna** albo tabela porównawcza (bez cen sprzętu).
- **„Jak to robimy w PRO-KOM”:** 3–4 punkty.
- **FAQ:** 4–6 pytań (`FAQPage`), CTA do `/zaplanuj` z gotowym opisem (`?opis=`).
- **Ilustracja:** SVG w stylu linii, z `alt`. Bez zdjęć ludzi, bez zdjęć z sieci.
- **Fakty** tylko z danych w repo albo ze stron producentów. Niepewne → `TODO(krystian)` i bez liczby.

### 3.3 SEO techniczne Poradnika
- `Article` JSON-LD: `headline`, `datePublished`, `dateModified`, `author`/`publisher` = Organization PRO-KOM, `image`.
- `BreadcrumbList`, `FAQPage`.
- `title` ≤ 60, `description` 140–155, kanoniczny adres, obraz OG wpisu (domyślny linii, jeśli brak).
- Strona `/poradnik` jako hub: kategorie bez „Przepisy” (Monitoring, Alarmy, Sieci, Smart home, Ładowarki, Anteny, Dla obiektów noclegowych), filtr działa bez JS, wpisy z datą aktualizacji i czasem czytania.
- Na każdej stronie usługi blok „Z Poradnika” z 2–3 wpisami tej kategorii (linkowanie wewnętrzne w obie strony).
- `sitemap.xml` z `lastModified` wpisów, `/llms.txt` z listą wpisów.
- Lighthouse SEO 100 i A11y ≥ 95 dla `/poradnik` i 2 wpisów.

---

## 4. Decyzje (domyślne, jeśli Krystian nie zmieni)
| # | Decyzja | Domyślnie | Dlaczego |
|---|---|---|---|
| D1 | Wpis „Monitoring w pensjonacie a RODO” | **przerobić na praktyczny** „Gdzie powiesić kamery w pensjonacie, żeby goście czuli się dobrze” — bez artykułów i wyroków; adres i 301 ze starego | Krystian: bez przepisów. Temat ma ruch w Google, więc zostaje jako poradnik ustawienia kamer. |
| D2 | Realizacje bez zdjęcia (Empik) | **ukryte**, dopóki nie ma zdjęcia | Ikona głośnika zamiast zdjęcia obniża jakość całej sekcji. |
| D3 | `/ekrany` „Wdrażamy to u siebie” | **neutralnie:** nagłówek „Jedna zmiana ceny — wszystkie ekrany w sklepie”, podpis demo „Przykładowy sklep”, bez zdania o naszym salonie | Bez potwierdzenia szefa nie piszemy, że coś działa u nas. Ceny sprzętu PRO-KOM nie mogą się pojawić. |
| D4 | Jak przenieść nowe teksty do panelu stagingu i produkcji | **skrypt** `pnpm inst:texts <adres> --dry-run` (REST Payload, login admina z env, tylko pola tekstowe Instalacji z listy, raport różnic przed zapisem) | 35 stron ręcznie w panelu = godziny i błędy. Skrypt przyda się też przy pierwszej produkcji. Bez nowej zależności (fetch). |

---

## 5. Prompty

Prompty sesji INST-5, INST-6 i PR-a fundamentu `feat/wsp-szablony-szyna` — w czacie projektu (wersja 1.0, 08.11.2026). Plan sesji INST-5: PR1 `inst/v6-bez-przepisow` → PR2 `inst/v6-realizacje` → PR3 `inst/v6-wyglad` → PR4 `inst/v6-audyt`; INST-6: PR1 `inst/v6-skrypt-tekstow` → PR2 `inst/v6-teksty-glowna` → PR3 `inst/v6-teksty-uslugi` → PR4 `inst/v6-teksty-obiekty` → PR5 `inst/v6-poradnik`.
