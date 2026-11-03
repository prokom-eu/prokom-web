# ADR-023: Paczki JavaScript per linia (wydajność stron)

- Status: **przyjęta — opcja A** (decyzja Krystiana 03.11.2026); krok 2 wdrożony 03.11 (wynik na końcu)
- Data: 03.11.2026
- Decyduje: Krystian (architektura, strefa wspólna)
- Powiązane: ADR-001 (jedna aplikacja Next.js dla wielu domen), ADR-010 (bloki linii), ADR-022 (elementy wspólne linii), ADR-I001 (strefa wspólna Instalacji), `docs/jakosc.md` (Lighthouse ≥ 90), STAN „Sesja B — BX-RUCH+” (pomiar W4).

## Kontekst
Prompt 2 W4 (sesja B, 03.11) wymaga Lighthouse mobile ≥ 90 dla `/`, `/oferta`, produktu, `/marki/apple`, `/kontakt` i `/plan-firmy` na prokombiznes.pl. Pomiar lokalny na `pnpm build && pnpm start` (lhci 0.15.1 jak w CI, mediana z 3 przebiegów): **74, 78, 82, 81, 78, 81**. Dostępność, dobre praktyki i SEO są w normie; CLS 0; TBT 15–45 ms.

Zaobserwowany LCP (przebieg bez dławienia) to **0,2–0,4 s** — strona maluje się od razu. Wynik 4,7–7,9 s to symulacja Lantern: do LCP dolicza ona czas pobrania wszystkich zasobów zażądanych przed nim w zwolnionej sieci, a skrypty strony idą w `<head>` (`async`). Na stronę Biznesu przypada **~460 KB JavaScriptu (gzip)**.

Przyczyna dużej części tego JS: wszystkie linie dzielą jedną trasę `src/app/(sites)/[domain]` — w szczególności strony z bloków CMS (`[domain]/page.tsx`, `[domain]/[slug]/page.tsx` → `RenderBlocks`). `RenderBlocks` importuje bloki **wszystkich** linii, więc Next.js dołącza do wpisu tej trasy paczki klienckie każdej z nich. Każda strona Biznesu pobiera więc:

| paczka | zawartość (przykłady) | gzip |
|---|---|---|
| Instalacje | ArchHouseScene, NvrDemo, CableLab, DoriCalc, SmartApp, QuoteForm… | ~95 KB |
| Software | PricingTable, AuditForm, HeroBuilder, ProcessExplorer… | ~36 KB |
| Biznes (własne wyspy) | InquiryForm, DepartmentWheel, HeroSearch, FeaturedPills… | ~17 KB |

Instalacje i Software to ~28% JS strony Biznesu, nieużywane na niej wcale. Symetrycznie strony Instalacji i Software pobierają kod pozostałych linii.

**Sprawdzone i odrzucone (03.11):** `next/dynamic` komponentów serwerowych bloków Software i Instalacji w `RenderBlocks`. Paczki się wydzielają, ale nadal trafiają do `<script>` wpisu trasy — przeglądarka pobiera dokładnie tyle samo (pomiar: 462 KB przed i po). Dokumentacja Next 16 („Lazy loading”) mówi o leniwym ładowaniu klienckich dzieci, ale przy wspólnej trasie i tak są wśród zasobów wpisu.

## Decyzja
1. **Ciężki widżet kliencki z bloku CMS ładuje się leniwie po stronie klienta.** Każda linia opakowuje swoje interaktywne widżety (wszystko poza drobnymi przyciskami) w mały moduł `'use client'` z `next/dynamic(() => import('./Widget'))` (SSR zostaje włączony — HTML i SEO bez zmian). Wpis trasy zawiera wtedy tylko lekkie opakowanie; kod widżetu przeglądarka pobiera wyłącznie na stronie, która go renderuje.
2. **Najpierw próba na jednym widżecie Instalacji** (największa paczka) z pomiarem: czy paczka zniknęła z `<script>` wpisu na stronie Biznesu i czy strona Instalacji nadal działa (SSR, hydratacja, brak skoku układu). Dopiero potem reguła dla wszystkich linii.
3. **Wdrożenie w folderach linii** (każda swoje widżety: `src/sites/<linia>/…`), zgodnie z podziałem pracy ADR-022 i ADR-I001 — bez zmian w strefie wspólnej poza ewentualnym helperem.
4. **Osobne trasy per linia (opcja B niżej) zostają na później** — wracamy do nich, jeśli po kroku 1–3 Lighthouse nadal < 90.

## Rozważone opcje
- **A. Leniwe widżety po stronie klienta w każdej linii (wybrane).** Małe, niezależne PR-y w folderach linii; bez zmian routingu, `proxy.ts`, adresów i testów tenantów. Działa też symetrycznie (Instalacje i Software przestają pobierać kod Biznesu). Ryzyko: każdy leniwy widżet to osobne żądanie przy pierwszej interakcji na stronie, która go ma — przy SSR treść jest widoczna od razu, opóźnia się tylko interaktywność (ułamek sekundy). Koszt utrzymania: jedna reguła w `docs/sposob-pracy.md` i w przeglądzie (`recenzent`).
- **B. Osobne trasy (wpisy) per linia.** `proxy.ts` przepisuje host na ścieżkę z segmentem linii (np. `/<host>/l-biznes/…`), a strony CMS mają osobny `page.tsx` i `RenderBlocks` dla każdej linii. Najczystszy podział — każda linia ma własne paczki z definicji. Odrzucone na teraz: `proxy.ts` musiałby znać linię hosta przy każdym żądaniu (dziś decyzja zapada po samym hoście), przeniesienie wszystkich tras stron CMS i 404, zmiana testu izolacji tenantów i e2e trzech linii — duża zmiana strefy wspólnej przy pracy trzech linii naraz.
- **C. Osobne aplikacje / obrazy per linia.** Odrzucone: przeczy ADR-001 (jeden panel, jedna aplikacja, jeden deploy dla jednej osoby), trzy pipeline'y i trzy obrazy.
- **D. Nic nie zmieniać, akceptować wynik Lantern.** Odrzucone: `docs/jakosc.md` wymaga ≥ 90, a Lighthouse CI na stagingu pokazuje to samo (Biznes główna 0,73).

## Konsekwencje
- + Strona Biznesu bez ~131 KB gzip cudzego JS (oczekiwane ~460 → ~330 KB) i bez kodu własnych widżetów na stronach, które ich nie mają. Symetrycznie dla Instalacji i Software.
- + Bez zmian adresów, SEO, panelu i modelu danych. Każda linia robi swoją część w swoim folderze.
- − Praca w trzech liniach (koordynacja kolejki: Instalacje najpierw — największa paczka). − Reguła do pilnowania w przeglądach („nowy ciężki widżet = leniwe opakowanie”).
- Nie wiadomo, czy samo to wystarczy do ≥ 90 na głównej Biznesu (zostaje m.in. react-dom ~71 KB i zod ~30 KB w formularzach) — stąd pomiar po kroku 2 i ewentualny powrót do opcji B.

## Plan wdrożenia i odbiór
1. **Próba (strefa wspólna/Instalacje, mały PR):** jeden widżet Instalacji w leniwym opakowaniu; pomiar `<script>` wpisu i pobranego JS na `/kontakt` Biznesu oraz test strony Instalacji z tym widżetem (zrzut 1440/390, e2e Instalacji).
2. **Instalacje → Software → Biznes:** po jednym PR na linię (widżety z bloków CMS i stron), e2e danej linii zielone.
3. **Pomiar końcowy** jak w sesji B (`pnpm build && pnpm start`, lhci 0.15.1, 6 stron Biznesu + po 2 strony Instalacji i Software): wynik przed/po w PR i w STAN.
4. **Odbiór:** strona Biznesu nie ładuje paczek Instalacji ani Software; Lighthouse mobile ≥ 90 na 6 stronach Biznesu albo udokumentowana reszta różnicy i decyzja o opcji B.

## Wynik kroku 2 (03.11.2026, `perf/prokombiznes-leniwe-widzety`)
Zrobione w jednym PR (decyzja Krystiana 03.11: Instalacje i Software też tutaj, osobne commity):
- **Leniwe opakowania** `<Plik>Lazy.tsx` dla 60 modułów klienckich osiągalnych z `RenderBlocks` (Biznes 14, Instalacje 34, Software 11, wspólny `InquiryForm`); importy podmienione tylko w modułach serwerowych, nazwy eksportów bez zmian. Reguła w `docs/jakosc.md` i liście kontrolnej `recenzent`.
- **zod poza wspólnym wpisem:** ramka Biznesu (nagłówek, wyszukiwarka, szyna) ciągnęła zod przez `catalogIndex → wizard`. `brandLogo` i stałe kreatora są teraz w lekkich modułach (`lib/catalog/brandLogo.ts`, `wizardOptions.ts`).
- **Lżejsze fonty** (decyzja Krystiana 03.11): Archivo tylko z osią szerokości 100–125 % (tyle używa strona), pliki `latin-ext` tylko Latin Extended-A — 216 → 127 KB. Wygląd bez zmian.

Wpis trasy stron CMS (`[domain]/page`, `[slug]/page`): **314 → 105 KB gzip** JS; na stronie Biznesu nie ma już paczek Instalacji ani Software (JS pobierany przez `/` wg Lighthouse: ~460 → 232 KB gzip).

Lighthouse mobile (lokalnie `pnpm build && pnpm start`, lhci 0.15.1, mediana z 3):

| strona | przed | widżety | + zod + fonty |
|---|---|---|---|
| Biznes `/` | 75 | 77 | 79 |
| `/oferta` | 76 | 78 | 79 |
| `/produkt/posnet-ergo-online` | 81 | 81 | 84 |
| `/marki/apple` | 81 | 81 | 83 |
| `/kontakt` | 78 | 83 | 87 |
| `/plan-firmy` | 81 | 79 | 84 |
| Instalacje `/`, `/kontakt` | 79, 79 | 84, 84 | 87, 87 |
| Software `/`, `/rozwiazania` | 79, 84 | 84, 84 | 86, 86 |

Kolumna „+ zod + fonty” to próbny build z obiema zmianami (deklaracja `font-stretch` dostosowana po pomiarze, bez wpływu na wagę). W lokalnej bazie Instalacji są tylko `/` i `/kontakt`.

**Reszta różnicy do 90 (udokumentowana, decyzja Krystiana 03.11: później, osobne zadania):**
1. **CSS wszystkich linii** w jednym arkuszu: 382 KB (56 KB gzip), blokuje render — Tailwind skanuje cały `src`, do tego CSS Instalacji z `style/blocks.tsx`.
2. **HTML i RSC strony głównej:** 982 KB (130 KB gzip); największa pozycja to dane „Planu Twojej firmy” dla wszystkich scen (~124 KB surowe w propsach `FloorPlan`) plus podwójne układy telefon/komputer.
3. Runtime React/Next (~150 KB gzip), wspólny dla wszystkich linii.

**Opcja B** (trasy per linia) niczego z tego nie usuwa — cudzy JS jest już wycięty — więc zostaje odłożona.

## Dopisek: CSS per linia (03.11.2026, `perf/css-linii`)
**Problem:** jeden arkusz `globals.css` (386 KB, 57,6 KB gzip) ze stylami wszystkich linii blokował render każdej strony: Tailwind skanował cały projekt, a w `tokens.css` były tokeny Instalacji (~11 KB gzip).

**Decyzja (Krystian 03.11, opcja A z dwóch):** jeden arkusz Tailwind **per linia**.
- Część wspólna: `src/styles/site.css` (tokeny, `motion.css`, `@theme`, warstwy `base`/`components`, wspólne reguły, `@source` kodu wspólnego: `app`, `blocks`, `components`, `lib`). Nie jest wpisem.
- Wpisy: `src/sites/biznes/style/biznes.css`, `src/sites/software/style/software.css`, `src/sites/instalacje/style/tailwind.css` (+ `styles/tokens-instalacje.css`) i `src/app/(sites)/globals.css` (bez linii: hub, nieznana domena, błąd globalny). Każdy: `@import 'tailwindcss' source(none)` → `site.css` → `@source '..'` (folder linii) → reguły tylko tej linii.
- Ładowanie: główny layout nie importuje CSS; `src/app/(sites)/LineSheet.tsx` (`'use client'`, `next/dynamic`) renderuje arkusz linii hosta — ten sam mechanizm co style Instalacji (`LineStyles.tsx`, 01.11). `global-error.tsx` też przez `next/dynamic` (statyczny import byłby wstępnie ładowany na każdej stronie). Pilnuje `src/app/(sites)/lineSheet.test.ts`.
- Na stronie jest dokładnie jeden Tailwind, więc kolejność klas się nie miesza (dwa arkusze utility — wspólny i linii — mogłyby nadpisać `md:flex` klasą `hidden` z drugiego pliku).
- Tokeny: reguły `[data-line='instalacje']` (jasny, ciemny, ciemny systemowy) w `src/styles/tokens-instalacje.css`; prymitywy `--c-instalacje-*` zostają w `tokens.css`. Uzupełnienie ADR-007: wartości kolorów tylko w `src/styles/tokens*.css`; testy kontrastu czytają oba pliki (`parse-tokens.ts`).

**Wynik (arkusz blokujący render, gzip):** Biznes 57,6 → 38,7 KB, Software → 32,5 KB, Instalacje → 31,0 KB (+ jej arkusze ramki bez zmian). Wygląd bez zmian: style obliczone wszystkich elementów identyczne na 23 stronach (Biznes 10, Software 5, Instalacje 4, nieznana domena) w 1440 i 390, jasny i ciemny.

**Lighthouse mobile** (lokalnie `pnpm build && pnpm start`, lhci 0.15.1, mediana z 3, baza: develop po #313): Biznes `/` 80 → 82, `/oferta` 83 → 83, produkt 85 → 86, `/marki/apple` 86 → 86, `/kontakt` 86 → 87, `/plan-firmy` 86 → 86; Instalacje `/`, `/kontakt` 87 → 87; Software `/`, `/rozwiazania` 86 → 87. Mały zysk, bo FCP był już ~1,2 s — resztę różnicy opisuje dopisek „Dane planu firmy” niżej.

**Reguła:** klasa Tailwind użyta w folderze jednej linii trafia tylko do jej arkusza; kod wspólny (`components`, `blocks`, `lib`, `app`) jest w każdym. Komponent jednej linii renderowany przez drugą wymaga `@source` w arkuszu drugiej (dziś: `news/` Biznesu w Software) — pilnuje tego `lineSheet.test.ts` (każdy plik innej linii osiągalny z importów linii musi być objęty jej `@source`).

## Dopisek: Dane planu firmy poza HTML głównej (03.11.2026, `perf/biznes-plan-dane`)
**Problem:** blok `bzPlan` na głównej Biznesu wysyłał w HTML/RSC cały plan: 12 scen z punktami i produkty wszystkich scen (~125 KB surowe, z czego produkty ~96 KB).

**Decyzja:** główna wysyła wszystkie sceny (kafle, liczniki, punkty), ale produkty i zestawy tylko pierwszej sceny (`planForScenes`, `src/sites/biznes/components/plan/planScenes.ts`). Pozostałe sceny dochodzą z `GET /api/plan-scene/<scena>` — ten sam wzór co `/api/plan-svg`: tylko domena Biznesu, slug sprawdzany z listą scen tenanta, plan czytany z tenantem hosta (`loadFloorPlan`), `Cache-Control: public, max-age=300`. `FloorPlan` pobiera scenę przy wyborze i z wyprzedzeniem przy najechaniu/fokusie na kafel; w trakcie ładowania liczniki ze sceny, przycisk „Dodaj cały plan” nieaktywny, po błędzie komunikat z „Spróbuj ponownie”. `/plan-firmy` i `?scena=` bez zmian (strona dostaje cały plan, nie pyta trasy — e2e).

**Wynik:** dane planu w HTML głównej 125 → 42 KB surowe, HTML głównej 131 → 106 KB gzip.

## Lighthouse po CSS per linia i danych planu (03.11.2026)
Lokalnie `pnpm build && pnpm start`, lhci 0.15.1, mediana z 3, baza: develop po #313.

| strona | przed | CSS per linia | + dane planu | próba: preload tylko Manrope latin |
|---|---|---|---|---|
| Biznes `/` | 80 | 82 | 81 | 81 |
| `/oferta` | 83 | 83 | 85 | 80 |
| `/produkt/posnet-ergo-online` | 85 | 86 | 86 | 84 |
| `/marki/apple` | 86 | 86 | 86 | 85 |
| `/kontakt` | 86 | 87 | 87 | 85 |
| `/plan-firmy` | 86 | 86 | 86 | 83 |
| Instalacje `/`, `/kontakt` | 87, 87 | 87, 87 | 87, 87 | 86, 86 |
| Software `/`, `/rozwiazania` | 86, 86 | 87, 87 | 87, 87 | 86, 85 |

**Reszta różnicy do 90 (wszystkie linie, każda strona):** FCP i Speed Index ~1,2 s (ocena 0,99–1), TBT ~13 ms, CLS 0 — całą różnicę robi **LCP ~4,0 s** (ocena ~0,5). Elementem LCP jest akapit tekstu (lead pod H1); zmierzone bez symulacji FCP = LCP ≈ 0,2 s, ale symulacja wolnego 4G (Lantern) wlicza w LCP tekstu wszystkie żądania rozpoczęte przed nim, w tym 4 pliki fontów (128 KB). Próba bez preloadu trzech fontów nie pomogła (fonty i tak startują z CSS przed pierwszym malowaniem; wynik −1…−3, CLS do 0,04) — nie wchodzi. Dalsze kroki to decyzja Krystiana (pytanie w STAN): pomiar na stagingu (prawdziwy serwer: HTTP/2, kompresja) zanim cokolwiek dalej, albo zmiana strategii fontów (decyzja marki, ADR-007).
