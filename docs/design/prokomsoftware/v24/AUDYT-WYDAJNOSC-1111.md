# Software — audyt wydajności produkcji (11.11.2026, po SWA12a/b)

Mierzone na `https://prokomsoftware.pl/` w Chrome na PC: Navigation/Resource Timing, Long Animation Frames, `document.getAnimations()`, nagłówki HTTP.
Karta pomiarowa ma bardzo szerokie okno (4096 px), więc **bezwzględne czasy klatek są zawyżone**. Wiarygodne są: liczby żądań i bajtów, lista animacji, co działa poza ekranem, proporcje skrypt/układ/malowanie. Telefonu nie da się tu zmierzyć (§5 w `AUDYT-PROD-TELEFON.md`, zdalne debugowanie).

## Co SWA12 poprawiło (potwierdzone na produkcji) ✓
- Animacje nieskończone poza ekranem **zatrzymane**. Przy stopce 0 nieskończonych w ruchu, wcześniej 41 animacji, w tym 19 nieskończonych.
- `mk-travel` na `transform` zamiast `left`.
- Przewijanie skryptem od góry do stopki: **~56 kl./s** w tej samej karcie, w której 10.11 było ~8 kl./s. Skrypt ~1 ms na długą klatkę: JavaScript nie jest wąskim gardłem.
- Ładowanie (z pamięci podręcznej): TTFB 290 ms, DOMContentLoaded 365 ms, `load` 774 ms, HTTP/2, statyczne pliki `immutable` na rok.

## Co jeszcze kosztuje

| # | Problem | Pomiar | Wpływ |
|---|---|---|---|
| 1 | **Zakładki, które przełączają się same, działają poza ekranem** (`#technologia`, `#proces`) | przy stopce wciąż chodzą `v-tab-progress`, `v-swap`, `v-arc`, `v-needle` oraz przejścia kolorów i ramek przycisków zakładek (`background-color`, `color`, `border-*`, `width`), a sekcje są 1,5–5,5 tys. px nad ekranem | co kilka sekund render Reacta i przejścia CSS na stronie, której nikt nie ogląda; długie klatki także przy stopce |
| 2 | **Prefetch 35 stron na starcie** | **43 żądania `fetch` po wejściu na główną:** 29 × `/rozwiazania?rozwiazanie=…&_rsc` (każde okno oferty), 6 stron (`/rozwiazania`, `/dobierz`, `/audyt`, `/o-firmie`, `/kontakt`), `/api/solutions-index` | na telefonie to transfer danych i parsowanie RSC w tle, akurat gdy klient zaczyna przewijać hero. Okno oferty i tak otwiera się po stronie klienta |
| 3 | **Hero: 12 animacji nieskończonych jednocześnie** | `hx-twinkle`, `hx-drift`, `hx-ribbon-1/2`, `hx-spin`, `hx-beam`, `hx-blink`, `hx-glint`, `hx-band`, `mk-drift`, `mk-twinkle`, `mk-travel` + **`hx-fill` animuje `width`** (właściwość układu) | pierwszy ekran to najcięższy moment strony. Na słabym telefonie to właśnie ten ekran „ścina” |
| 4 | Rozmycia | 18 elementów z `filter: blur` / `backdrop-filter` | koszt malowania przy każdej zmianie pod nimi |
| 5 | `sw-em` i `sw-rise-blur` na PC | `background-position` (8 nagłówków) i `filter` (6 wejść) w animacji przewijaniem | celowo zostawione na PC (SWA12). Na laptopach ze słabą grafiką zintegrowaną to nadal malowanie w każdej klatce |
| 6 | **JavaScript na głównej** | 30 plików, **~1,07 MB po rozpakowaniu** (największe: 229 KB, 155 KB, 109 KB z `zod`, 64 KB i 63 KB z `motion`) | czas parsowania i kompilacji na telefonie. Ile z tego to kod okna oferty, kreatora i wyszukiwarki, którego klient może nie użyć, trzeba sprawdzić analizą paczek |
| 7 | HTML | 345 KB po rozpakowaniu (65 KB gzip), `Cache-Control: no-store`, render na każde żądanie; DOM 3650 elementów | strona główna zawiera z góry treści, których nie widać (wszystkie slajdy hero, panele zakładek, makiety) |
| 8 | Kompresja | `gzip`, bez Brotli | Brotli zwykle zmniejsza HTML, JS i CSS o kolejne 15–20% (CSS 322 KB, JS ~1 MB po rozpakowaniu) |

## Poprawki (kolejność = zysk / koszt)

**SWA13a `fix/swa13-ruch-poza-ekranem`** (najtańsze, największy efekt na telefonie):
1. `useAutoTabs`: pauza, gdy sekcja jest poza ekranem (`IntersectionObserver`) i gdy `document.hidden`. Wznowienie od bieżącej zakładki. Test Vitest na logikę pauzy.
2. `hx-fill`: `transform: scaleX()` z `transform-origin: left` zamiast `width`.
3. Hero na telefonie (≤ 767 px) i przy `(pointer: coarse)`: z 12 animacji nieskończonych zostają 3–4, które niosą klimat (np. `hx-twinkle`, `hx-glint`, `hx-blink`, jedna wstęga). Wstęgi, wirowanie, wiązka i pasmo stoją w kadrze. Na PC bez zmian.
4. Kontrola po zmianie: e2e „po przewinięciu 2 ekranów pod hero oraz przy stopce `document.getAnimations()` nie ma `running` z sekcji poza ekranem”. Rozszerza test SWA12a o zakładki i przejścia.

**SWA13b `perf/swa13-prefetch-i-paczki`:**
5. Prefetch: karty ofert (29 × `?rozwiazanie=`) **bez prefetchu na starcie**. Okno otwiera stan klienta, a dane przychodzą z `/api/solutions-index` albo przy zamiarze (najechanie / `touchstart` / fokus). Linki stron główna → podstrony: prefetch tylko przy zamiarze. Przed kodem sprawdź w `node_modules/next/dist/docs/` aktualne opcje `<Link prefetch>` w Next 16. Cel: **≤ 5 żądań w tle** po wejściu na główną.
6. Analiza paczek (`next build` z analizatorem dostępnym w zainstalowanym Next 16; jeśli trzeba `@next/bundle-analyzer` jako devDependency → uzasadnienie w PR). Okno oferty, kreator, wyszukiwarka (Ctrl K) i walidacja formularza (`zod`) **ładowane przy pierwszym użyciu** (`next/dynamic` / `import()` na zamiar). Cel: JS na głównej przed interakcją **−30%**. Wynik przed i po do opisu PR.
7. DOM hero: niewidoczne slajdy renderowane leniwie (aktywny + następny), panele zakładek tylko aktywny + sąsiedni. Cel: DOM głównej < 2500 elementów.

**Serwer (osobny mały PR `chore/nginx-brotli`, za zgodą Krystiana — zmiana konfiguracji produkcji):**
8. Brotli w Nginx (moduł `ngx_brotli` w obrazie proxy albo prekompresja statycznych plików). Jeśli obraz Nginx nie ma modułu bez przebudowy, **zostaje gzip**. Zysk ok. 15–20%, nie warto dla niego komplikować utrzymania.
9. HTML `no-store`: zostaje (multi-tenant po hoście, formularze, CSRF). Ewentualnie później ISR/`revalidateTag` po zapisie w Payload, ale to osobny ADR, nie teraz.

**Bez zmian (świadomie):** `sw-em` i `sw-rise-blur` na PC (decyzja SWA12). Wrócić, jeśli pomiar na laptopie z grafiką zintegrowaną (§DoD) pokaże długie klatki.

## Definition of Done
- Telefon (zdalne debugowanie, Android, Chrome, ta sama strona przed/po): Performance → przewinięcie głównej od góry do stopki, **0 klatek > 50 ms poza pierwszym ekranem**, pierwszy ekran ≤ 3 klatki > 50 ms w 5 s spoczynku. Zrzuty do PR.
- Lighthouse mobilny produkcji/stagingu: podstrony ≥ 90 (bez zmian), główna — zapisany wynik przed i po (TBT i LCP w PR).
- `lint`, `typecheck`, `test`, e2e (nowe testy z p. 1, 4, 5), `scripts/software-porownaj.mjs` 390/1440 bez zmian wyglądu, `/przeglad`, `/pr`.

## Prompt dla Claude Code

```
/zadanie SWA13 — wydajność po SWA12 (docs/design/prokomsoftware/v24/AUDYT-WYDAJNOSC-1111.md)
Start: git status, git fetch. Folder prokom-web-software (PORT=3003, baza prokom_web_swa). Gałęzie od origin/develop, piętrowo.
PR 1 fix/swa13-ruch-poza-ekranem: p. 1–4 (useAutoTabs pauza poza ekranem i przy document.hidden + test Vitest; hx-fill na scaleX; hero na telefonie/pointer coarse 3–4 animacje nieskończone zamiast 12, PC bez zmian; e2e: brak running animacji i przejść z sekcji poza ekranem po przewinięciu i przy stopce).
PR 2 perf/swa13-prefetch-i-paczki: p. 5–7 — najpierw sprawdź w node_modules/next/dist/docs/ opcje Link prefetch w Next 16 i zapisz w PR, co wybrałeś i dlaczego. Cel: ≤ 5 żądań w tle po wejściu na główną (e2e licznik żądań), okno oferty / kreator / Ctrl K / zod przy pierwszym użyciu, JS głównej przed interakcją −30% (analiza paczek przed/po w PR; nowa devDependency tylko z uzasadnieniem), DOM głównej < 2500.
Nie ruszaj: wyglądu (zrzuty porównawcze bez różnic), sw-em/sw-rise-blur na PC, konfiguracji Nginx (p. 8 osobno, po mojej zgodzie).
DoD wg sekcji „Definition of Done” — pomiar Performance z telefonu przez chrome://inspect zrobię ja; ty przygotuj Lighthouse mobilny lokalnie na buildzie (pnpm build && pnpm start) przed/po.
```
