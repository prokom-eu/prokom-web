# ADR-023: Paczki JavaScript per linia (wydajność stron)

- Status: **przyjęta — opcja A** (decyzja Krystiana 03.11.2026)
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
