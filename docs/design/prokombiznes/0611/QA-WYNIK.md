# QA prokombiznes.pl — wynik (BIZ-3, §11)

Data: 09.11.2026 (noc). Kod: gałąź `docs/biznes-qa-0611` = `develop` + B5-1…B5-3b (#454, #458) + poprawki z tego QA. Pomiar na `pnpm build && pnpm start` z lokalną bazą po `pnpm seed:biznes`.

Narzędzia (w repo, do powtórzenia):
- `node scripts/biznes-seo-audyt.mjs [origin] --links` — każdy adres z `sitemap.xml`: tytuł 30–60, opis 100–155, `BreadcrumbList` przy okruszkach, `og:image`; linki wewnętrzne spoza sitemap ze statusem.
- `node scripts/biznes-qa.mjs [origin]` — 30 stron (każdy typ) × 1440/390 × jasny/ciemny: przewijanie w bok, białe bloki w ciemnym, zdjęcia bez `alt`, jedno H1, błędy konsoli, axe WCAG 2.1 AA (jasny 1440).
- Lighthouse mobile (`@lhci/cli@0.15.1` jak CI, 1 przebieg) — 9 stron z §11.3.

Paczka pomiarowa audytu (`crawl.mjs`) nie trafiła do repo — skrypty wyżej ją zastępują.

## 1. Pełny pomiar SEO — 532 adresy z `sitemap.xml`

Po poprawkach z QA: **525 z 532 adresów w normie.**

- 7 uwag: krótkie tytuły produktów (25–29 znaków z dopiskiem, np. „Sunmi L3 | PRO-KOM Biznes”, „Elzab KW3 | …”, „FAWAGscan | …”) — nazwa modelu bez rozszerzenia; do decyzji (§7).
- Opisy 100–155: wszystkie w normie. `BreadcrumbList` na każdej stronie z okruszkami. `og:image` na każdej stronie.
- Pomiar przed poprawkami QA: 8 uwag (do tego `/konfigurator` bez `BreadcrumbList` i `og:image` — poprawione).
- Dla porównania audyt 06.11: 49 tytułów poza 30–60, 61 opisów < 100, 13 stron bez `BreadcrumbList`, 0/41 kategorii z `ItemList` (B5-2).

## 2. Typy stron × 4 widoki (30 stron, 120 widoków)

Po poprawkach z QA: **112 ze 120 widoków bez uwag.**

- Przewijanie w bok: 0 (360/390 sprawdzane też w e2e). Jedno H1 na każdej stronie. Błędy konsoli: 0.
- Zdjęcia z biblioteki mediów z pustym `alt`: 0. Przed poprawkami QA 17 na głównej (koło działów) i 3 + 7 na stronach Zaopatrzenia — były to zdjęcia dekoracyjne z `alt=""` (poprawne wg WCAG, axe ich nie zgłaszał); dostały opis „Marka Model” dla wyszukiwarek i `aria-hidden`, jak reszta zdjęć produktów (B5-1).
- axe WCAG 2.1 AA (jasny 1440): 0 na 30 stronach w drugim przebiegu; w pierwszym `/marki` `label-content-name-mismatch` ×40 (poprawione) i 1 węzeł na `/agd-rtv-dla-firm`, który nie powtórzył się w osobnym przebiegu (prawdopodobnie pasek marek w ruchu).
- Białe bloki w ciemnym motywie (8 widoków): celowo — logo marki na białym kaflu (`/marki/dibal`), „papier” podglądu oferty i panel na stronach Zaopatrzenia; **do rozważenia:** kafle automatów na `/automaty-vendingowe` (3 × biały kafel z packshotem — przy zdjęciach z białym tłem zostają, przy wyciętych można przejść na tło studia jak w B5-1).
- Wysokość `main` na telefonie (390): np. `/marki/posnet` 5 474 px (cel ≤ ~6 000), `/` 9 881 px.

## 3. Linki spoza sitemap

Linki wewnętrzne zebrane ze wszystkich 532 stron, spoza `sitemap.xml` (audyt 06.11 podawał 39 — liczone na 121 stronach i przed B4-2/B5, które zmieniły listy zestawów, branż i okruszki; tu pomiar na całej mapie):

- **przed poprawką: 29, w tym 7 × 404** — wszystkie na stronach Zaopatrzenia: `/oferta/siec`, `/oferta/term`, `/oferta/kasy` (AGD → „Do recepcji”), `/oferta/mfp`, `/branze/biura-uslugi`, `/branze/szkoly-instytucje`, `/branze/magazyn-produkcja` (IT → „Dla kogo”, „Co dostarczamy”);
- **po poprawce: 22, błędnych 0** — reszta to `/zapytanie` (celowo poza mapą), `/kreator` (301 do konfiguratora), `/manifest.webmanifest` i 17 kart produktów „do sprawdzenia” spoza mapy, linkowanych z list kategorii i marek (plan §13 #6 — bez zmian, karty odpowiadają 200).

## 4. Obszary, których audyt nie sprawdził (ręcznie, w przeglądarce)

| Obszar | Wynik | Uwagi |
|---|---|---|
| Ctrl K | ✅ | Podgląd produktu, literówki („laptp lenvo” → ThinkPad), Enter otwiera wynik, brak wyników → uczciwy komunikat „Nie znaleźliśmy…” z „Zapytaj o …” i telefonem. Drobiazg: po ponownym otwarciu pole trzyma poprzednie zapytanie (dopisuje się do niego) — strefa wspólna (`SearchDialog`). |
| Szuflada zapytania | ✅ | Lista z ilościami, usuwanie, „Często dobierane razem”. W dev lista ładuje się 2–4 s („Wczytuję listę…”), na buildzie od razu. |
| Konfigurator do wyniku | ✅ | Gastronomia → Otwieram lokal → 2–3 stanowiska → szczegóły → wynik z 5 potrzebami, uzasadnieniami i linkiem do wyniku (`?kr=`). **Do decyzji:** w wyniku są kwoty „odzyskać do 700 zł” (ulga) i „terminal … bywa za 0 zł” (Polska Bezgotówkowa) — zasada „zero cen” (K4-FINAL §1); oraz ogólne „Terminal łączymy z kasą, żeby kwota przechodziła sama” — po badaniu zgodności (B4-1) wiadomo, że z częścią kas i z GoPOS terminal PolCard działa samodzielnie. |
| Arkusz Filtry (telefon) | ✅ | Grupy Rodzaj / Kategoria / Marka / Branża, fokus w arkuszu, Esc zamyka i wraca na przycisk. |
| Arkusz Menu (telefon) | ✅ | Działy, strony, godziny, telefon; fokus na nagłówku, Esc wraca na przycisk. |
| `/konfigurator`, `/zapytanie` | ✅ | `/zapytanie` z `?fraza=` z wyszukiwarki, lista, uwagi, formularz. `/konfigurator` dostał w QA `BreadcrumbList` i `og:image`. |
| Ciemny motyw — typy stron | ✅ z uwagami | Białe kafle zostają tylko celowo: logo marki na białym (`/marki/dibal`, oficjalne pliki mają białe tło) i „papier” podglądu oferty w Zaopatrzeniu. Hero kategorii po B5-1 na tle studia. |

## 5. Lighthouse mobile (`build + start`, 1 przebieg)

Przed poprawką okruszka „Start” (pomiar 1):

| Strona | Wydajność | Dostępność | Dobre praktyki | SEO | LCP |
|---|---|---|---|---|---|
| `/` | 72 | 100 | 100 | 100 | 6,1 s |
| `/oferta` | 78 | 100 | 100 | 89 | 5,5 s |
| `/produkt/posnet-ergo-online` | 83 | 100 | 100 | 89 | 4,7 s |
| `/marki/apple` | 82 | 100 | 100 | 100 | 4,8 s |
| `/kontakt` | 84 | 100 | 100 | 100 | 4,4 s |
| `/plan-firmy` | 79 | 100 | 100 | 100 | 5,5 s |
| `/agd-rtv-dla-firm` | 79 | 100 | 100 | 89 | 5,7 s |
| `/dostawy-it-dla-firm` | 79 | 100 | 100 | 89 | 5,7 s |
| `/zestawy` | 81 | 100 | 100 | 100 | 5,0 s |

- TBT 20–30 ms, CLS 0 wszędzie.
- SEO 89 = audyt „link-text”: okruszek „Start” (link do `/`) — **poprawione w QA** na „Strona główna” (`/oferta`, kategorie, produkt, Zaopatrzenie); te strony mają teraz te same okruszki co reszta serwisu.
- **Po poprawce (pomiar 2):** `/oferta` 78/100/100/**100**, produkt 83/100/100/**100**, `/agd-rtv-dla-firm` 79/100/100/**100**, `/dostawy-it-dla-firm` 79/100/100/**100** — SEO 100 na wszystkich 9 stronach.
- Wydajność 72–84: bez zmiany względem pomiarów BIZ-2 — przyczyny w ADR-023 (CSS wszystkich linii w jednym arkuszu, runtime React/Next; LCP to symulacja Lantern doliczająca pobrany JS). Cel 90 wymaga osobnego zadania (ADR-023 „Reszta do 90”, „Pomysły na później”), nie poprawek treści.

## 6. Poprawione w QA (commity na tej gałęzi)

- Mega menu „23 zestawy” i Ctrl K z ukrytymi zestawami → indeks katalogu tylko z „Gotowymi” (19).
- 7 martwych linków (404) na `/agd-rtv-dla-firm` i `/dostawy-it-dla-firm` (kody kategorii z paczki, nieaktywne branże) → slugi w paczce + `pruneDeadLinks` (opcjonalny link kafla do strony, której nie ma, znika i kafel renderuje się bez linku — działa też na danych z panelu stagingu; wymagane linki przycisków zostają).
- Okruszek „Start” → „Strona główna” (Lighthouse SEO 89 → 100).
- `/marki`: nazwa linku kafla bez widocznego tekstu (axe `label-content-name-mismatch` ×40, WCAG 2.5.3) → widoczny tekst + dopisek dla czytników.
- Koło działów na głównej i kafle Zaopatrzenia: dekoracyjne zdjęcia (`alt=""`) dostały opis dla wyszukiwarek + `aria-hidden` (17 + 10).
- `/konfigurator`: `BreadcrumbList` i `og:image`.
- Wcześniej w nocy (CI #454): `alt` z B5-1 w przycisku zmieniał jego nazwę („Posnet … Sklep z dużą liczbą towarów”) → zdjęcia w przyciskach i linkach z tekstem `aria-hidden`.

## 7. Do decyzji / otwarte

- **Zestawy ukryte (4)** — pytania do Insoft, Elzab, GoPOS: `docs/STAN.md` (B4-1).
- **GoPOS:** scalenie listy modułów z konfiguratorem pakietu (§10.3) — niezrobione, opis w #458 i STAN.
- **Konfigurator:** kwoty 700 zł / 0 zł i zdanie o łączeniu terminala z kasą (wyżej, §4).
- **7 krótkich tytułów produktów** (< 30 znaków z dopiskiem, np. „Sunmi L3 | PRO-KOM Biznes”) — nazwa produktu bez dopisku „dla firm”; do uzupełnienia w panelu (SEO → Tytuł) albo zostawić (krótka nazwa modelu jest czytelna).
- §13: #4 (zdjęcia GoPOS z ludźmi), #5 (301 `/marki/gopos`, `/marki/insert`), #10 („czas reakcji ustalamy w umowie”) — bez zmian, czekają.
- Strefa wspólna (`feat/wsp-*`): telefon i e-mail w `CompanyCard` 19 px; `SearchDialog` — pole zostaje wypełnione po ponownym otwarciu; H2 ukrytych okien (`SearchDialog`, `BottomSheet`) — zamówienie z B3-3.
- Wydajność < 90 — ADR-023.

## 8. `/wdrozenie staging` — checklista

| # | Punkt | Stan | Uwagi |
|---|---|---|---|
| 1 | CI zielone | ⚠️ | #445, #447 w `develop`. #454 (B5-1 + B5-2 + B5-3a) — e2e po poprawkach w toku; #458 i PR QA — CI uruchomi się na `develop` po scaleniu do #454 (PR-y piętrowe). |
| 2 | Migracje | ✅ | BIZ-3 dodaje jedną: `20261108_230919_biznes_zestawy_zrodla` (już w `develop`, tylko `ADD COLUMN url`). B5-x i QA bez migracji. |
| 3 | Zmienne środowiskowe | ✅ | Brak nowych. |
| 4 | Przekierowania 301 | ✅ | Brak nowych (301 `/marki/gopos` → `/gopos` czeka na decyzję §13 #5). |
| 5 | Formularze | ✅ | Bez zmian w formularzach i `submitInquiry`; po wdrożeniu — jedno próbne zapytanie z `/zestawy` („Dodaj zestaw do zapytania”). |
| 6 | SEO | ✅ | Staging: `noindex` + hasło bez zmian. Mapa bez ukrytych zestawów, z `/konfigurator`; tytuły/opisy/JSON-LD — pomiar §1. |
| 7 | Kopia bazy | ✅ | Staging — kopia `predeploy` robi `scripts/deploy.sh` (runbook §2). |
| 8 | Plan cofnięcia | ✅ | Poprzedni tag obrazu (`deploys.log`); migracja tylko dodaje kolumnę — powrót obrazu bez cofania bazy (runbook §4, §5). |
| 9 | Produkcja | — | Nie dotyczy (staging). |

**Treści w panelu stagingu (seed tam nie działa)** — pełne listy w `docs/STAN.md` („Po B4-1”, „Po B5-2”, „Po B5-3a”):
- statusy 19 zestawów na „Gotowe” i zmiany składu z `zestawy-k4.json` (UPS, skaner, Avtek OPS, teksty PolCard), poprawione karty (All in One, numerki, InsPunkty, Samsung OM, dyski HAT, szuflada), zgodności z adresami źródeł;
- tytuły i opisy SEO 10 stron (`src/seed/biznes/pageSeo.ts`);
- „Polecane” karty Ergo (sieć na końcu).
Najprościej: `scripts/staging-content.sh biznes` (runbook §2a) — **najpierw zgoda szefa**, bo import nadpisuje też Dane firmy.

Komendy (uruchamia Krystian, po scaleniu #454 do `develop` pipeline wdraża staging sam):
```bash
gh pr merge 458 --squash
```
```bash
gh pr merge 463 --squash
```
```bash
gh pr merge 454 --squash
```
```bash
SSH=/c/Windows/System32/OpenSSH/ssh.exe bash scripts/staging-content.sh biznes
```
