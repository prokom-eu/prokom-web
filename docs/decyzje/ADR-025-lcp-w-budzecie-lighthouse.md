# ADR-025: LCP w budżecie Lighthouse — próg blokujący 4 s, cel 2,5 s jako ostrzeżenie

- Status: **proponowana** (do akceptacji Krystiana w PR `perf/lighthouse-lcp`)
- Data: 09.11.2026
- Decyduje: Krystian
- Powiązane: ADR-021 (Lighthouse CI po wdrożeniu stagingu), ADR-023 (paczki JS i CSS per linia — **zmienia jego stanowisko z opcji D** „nie akceptować wyniku Lantern” wyłącznie dla osobnego progu LCP; wydajność ≥ 90 zostaje), `docs/jakosc.md` (Definition of Done), runbook §3 (zielony Lighthouse = warunek produkcji).

## Kontekst
Czerwony przebieg Lighthouse na stagingu blokuje wdrożenie produkcji. Przebieg 09.11 po wdrożeniu `d2c036d`, już z nową treścią Biznesu, mediana z 3:

| strona | wydajność | LCP (Lantern) |
|---|---|---|
| Biznes `/` | ≥ 0,9 | 2,60 s |
| Biznes `/oferta` | 0,80 | 4,66 s |
| Software `/rozwiazania` | ≥ 0,9 | 2,57 s |
| Instalacje `/`, `/monitoring`, `/ladowarki-ev`, `/dla-architektow` | ≥ 0,9 | 3,46–3,70 s |
| Instalacje `/dla-kogo/pensjonaty` | ≥ 0,9 | 2,57 s |
| pozostałe 4 strony | ≥ 0,9 | ≤ 2,5 s |

Dostępność, dobre praktyki, SEO i CLS: w normie na wszystkich 12 stronach. Poza `/oferta` brakuje wyłącznie LCP ≤ 2,5 s.

**Skąd ta liczba.** Lighthouse domyślnie nie mierzy LCP na wolnym łączu. Wczytuje stronę bez dławienia, a czas „na telefonie w 4G” szacuje symulacją (Lantern). W szacunku LCP Lantern liczy pobranie **każdego zasobu, o który strona poprosiła przed LCP** — z wyjątkiem obrazów o niskim priorytecie. W App Routerze to ~260–310 KB skryptów, o które przeglądarka prosi już z `<head>` (`async`).

Z raportów 09.11 (rzeczywisty czas przebiegu bez dławienia, `observedLargestContentfulPaint`):
- na 11 z 12 stron LCP to tekst hero, malowany **w tej samej klatce co pierwsza treść** (FCP 0,9–1,3 s);
- tekst maluje się fontem zastępczym (`font-display: swap`) i nie czeka na żaden skrypt;
- Lantern dolicza do niego 1–2,4 s pobierania JS, który tego malowania nie blokuje.

Lokalny pomiar 09.11 (build produkcyjny bez kompresji, 3 przebiegi), ta sama strona dwoma metodami:

| | Lantern (jak CI) | DevTools — prawdziwe dławienie 4G + CPU 4× |
|---|---|---|
| Biznes `/` | LCP 5,8–6,8 s, FCP 2,1 s | LCP **= FCP** 2,7 s |
| Biznes `/oferta` (po poprawce zdjęć) | LCP 5,2–5,6 s, FCP 1,8 s | LCP 2,6–2,9 s ≈ FCP 2,5–2,7 s |

Przy prawdziwym dławieniu LCP pokrywa się z FCP. Rozjazd o 3–4 s robi sama symulacja. Liczby lokalne są wyższe niż na stagingu, bo bez gzip, który na serwerze robi Nginx.

**Czego nie robimy.** Żeby zbić sam szacunek do 2,5 s, trzeba by usunąć ~150–250 KB zasobów zażądanych przed pierwszym malowaniem. Do wyboru:
- opóźnić pobieranie skryptów — późniejsza interaktywność;
- zrezygnować z animacji i widżetów;
- przebudować CSS i fonty wszystkich trzech linii.

Pierwsze dwa to strata dla odwiedzającego. Trzecie to praca na kilka sesji w trzech liniach naraz (ADR-023 „Reszta do 90”). Strona by na tym nic nie zyskała: tekst już dziś jest na ekranie w chwili FCP.

**Rozważone i odrzucone:** cały pomiar metodą DevTools. Prawdziwe 4× spowolnienie CPU na runnerze GitHub zawyża TBT i wydajność spada poniżej 90. Lokalnie główna Biznesu wychodzi 84–86 przy TBT 280–365 ms, a w Lantern 92–93. Do tego wyniki DevTools wahają się z przebiegu na przebieg bardziej niż Lantern.

## Decyzja
1. **Wydajność ≥ 90 zostaje błędem** (bez zmian). Ocena wydajności nadal zawiera LCP z Lanterna z wagą 25%, więc strona z naprawdę wolnym LCP nie przejdzie.
2. **LCP z Lanterna:**
   - **osobna asercja: błąd od 4 s** — granica „słabego” LCP wg Google;
   - **cel 2,5 s zostaje** jako ostrzeżenie: przebieg pokazuje strony powyżej 2,5 s (adnotacja w Actions), ale nie blokuje produkcji.
   - **Faktyczny limit jest ostrzejszy.** Krzywa LCP na telefonie ma 2,5 s = wynik 0,9 i 4 s = 0,5. Przy LCP 4 s wydajność wynosi najwyżej ~87, czyli poniżej 90. W praktyce blokuje więc **LCP powyżej ~3,6 s, przez wydajność ≥ 90**, a próg 4 s jest tylko zabezpieczeniem. Instalacje (3,46–3,70 s) nie mają zapasu: drobna regresja zrobi przebieg czerwonym.
3. **Założenie tej decyzji pilnowane w przebiegu:**
   - **`lcp-lazy-loaded` = błąd** — zdjęcie, które jest LCP, nie może się ładować leniwie (dokładnie dzisiejszy błąd `/oferta`);
   - **ostrzeżenie, gdy zaobserwowany LCP przychodzi > 300 ms po pierwszej treści** — wtedy LCP nie jest tekstem z klatki FCP i rozjazd może być prawdziwy, nie tylko z symulacji.
4. **Prawdziwe wolne LCP poprawiamy w kodzie.** Pierwsza poprawka w tym samym PR: na `/oferta` elementem LCP było zdjęcie pierwszej karty z `loading="lazy"`. Teraz:
   - pierwszy rząd katalogu i kategorii ładuje się od razu (`loading="eager"`);
   - wysoki priorytet (`fetchPriority="high"`) ma tylko pierwsza karta `/oferta`, czyli element LCP. W kategoriach siatka jest pod nagłówkiem, a więcej obrazów o wysokim priorytecie konkurowałoby z CSS i fontami.
5. CLS ≤ 0,1, dostępność, dobre praktyki i SEO ≥ 90 — bez zmian.

## Konsekwencje
- \+ Bramka produkcji przepuszcza strony, które naprawdę malują treść w ~1 s, i nadal zatrzymuje stronę z prawdziwym problemem. Przykład: `/oferta` przed poprawką — wydajność 0,80, LCP 4,66 s.
- \+ Strony nic nie tracą: animacje, widżety i układ zostają.
- − Szacunek LCP między 2,5 a ~3,6 s (powyżej blokuje już wydajność) nie blokuje. Ostrzeżenia w przebiegu trzeba czytać. Przestaje być wykrywana regresja LCP z obrazu, który ładuje się od razu, ale wolno (np. ciężkie zdjęcie hero), dopóki wydajność ≥ 90 — sygnałem jest ostrzeżenie „LCP … ms after FCP”.
- − Do poprawy osobno (wpisy w `docs/STAN.md` → „Pomysły na później”). Każda z tych rzeczy obniża też szacunek LCP:
  - CSS Instalacji w 11 arkuszach blokujących render (115 KB);
  - 4 wstępnie ładowane pliki fontów (126 KB) — przycięcie osi wagi do używanych;
  - HTML strony głównej Biznesu (125 KB gzip).
- **Wracamy do decyzji**, gdy:
  - strony będą miały dane od prawdziwych odwiedzających (CrUX w Search Console) — wtedy liczą się one;
  - albo Lighthouse zmieni sposób szacowania LCP.
