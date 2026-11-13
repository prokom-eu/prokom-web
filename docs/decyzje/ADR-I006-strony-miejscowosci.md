# ADR-I006 — Strony miejscowości prokominstalacje.pl (`/obszar/<miasto>`)

- Status: **przyjęty** · Data: 13.11.2026 · Decyzja: Krystian (13.11.2026) · Zmienia: `docs/strony/prokominstalacje-SEO.md` §1 („bez stron-klonów pod miejscowości”) i komentarz `AREA_SERVED` w `src/lib/instalacje/seo.ts`

## Kontekst
- Audyt SEO produkcji 13.11.2026: Lighthouse SEO 100, dane strukturalne na każdej stronie, Search Console zweryfikowane. Słabość: miejscowości są tylko w `areaServed` i w kilku zdaniach; zapytania „<usługa> Nowy Targ / Myślenice / Kraków” nie mają strony, która na nie odpowiada.
- Spec SEO §1 zakazywał stron-klonów (wytyczne Google o stronach przejściowych, *doorway pages*) i dopuszczał strony miejscowości „tylko z unikalną treścią, w etapie 2”. Krystian 13.11 zdecydował: robimy etap 2 — strony z unikalną treścią, obszar od Podhala aż po Kraków.
- Software ma już strony miejscowości (`(software)/miejscowosci/[miasto]`, kolekcja `Cities` w panelu, 404 dla miasta bez własnego tekstu).

## Decyzja

### 1. Adres: `/obszar/<miasto>` i lista `/obszar`
- `/miejscowosci/[miasto]` zajmuje trasa Software w tym samym segmencie `[domain]` — dwie grupy tras z tą samą ścieżką to błąd budowania Next.js. Wspólna trasa rozdzielana po linii mieszałaby kod dwóch linii.
- Dlatego `/obszar/<slug>` (np. `/obszar/nowy-targ`) i lista `/obszar` (hub linkowania: wszystkie miejscowości z jednym zdaniem). Slug bez polskich znaków. `obszar` w `RESERVED_PAGE_SLUGS` (PR wspólny `inst/wsp-obszar`).

### 2. Model danych: kod, nie panel
- Lista miejscowości: `src/lib/instalacje/area.ts` (slug + nazwa; używa jej sitemap i mapa strony). Treść: `src/sites/instalacje/dane/miejscowosci.ts` — typowany plik danych jak pozostałe `dane/*.ts` (ADR-I002 §1).
- Dlaczego nie kolekcja jak `Cities` w Software: 17 stron pisanych raz, rzadko zmienianych; kolekcja to migracja, pola panelu, seed i `inst:texts` — więcej ruchomych części dla jednej osoby. Panel dla tych stron — gdy szef zechce je edytować (wtedy kolekcja + import z tego pliku, bez zmiany komponentu).
- Z panelu (nie z kodu) idą: dane kontaktowe i adres salonu (`CompanyData`), telefon (`SiteSettings`), nazwy i adresy usług (`InstServices`), realizacje (`Realizations`, tylko opublikowane, ze zgodą klienta i zdjęciem).

### 3. Lista miejscowości (17)
Rabka-Zdrój, Nowy Targ, Zakopane, Jordanów, Mszana Dolna, Lubień, Pcim, Myślenice, Dobczyce, Kraków, Wieliczka, Skawina, Limanowa, Poronin, Bukowina Tatrzańska, Białka Tatrzańska, Szczawnica.
- **Kraków jako jedna strona, bez dzielnic.** Strony „Kraków-Podgórze”, „Kraków-Nowa Huta” miałyby tę samą treść ze zmienioną nazwą — to dokładnie strony przejściowe. Dzielnice mogą pojawić się w treści strony Kraków, gdy będą realizacje w konkretnych miejscach.
- Nie dodajemy wsi i dzielnic, o których nie mamy nic własnego do powiedzenia. Nowa miejscowość = nowy wpis w obu plikach z pełną własną treścią (test pilnuje).
- Strefa dojazdu bez zmian (Kontakt, `glownaSekcje.ts`): Podhale i okolice na co dzień; dalej (Myślenice, Dobczyce, Kraków, Wieliczka, Skawina, Limanowa) dojazd ustalamy indywidualnie, zwykle przy większych inwestycjach. Strony tych miejscowości mówią to wprost — nie obiecujemy więcej niż Kontakt.

### 4. Zasady unikalności treści (żadnych przejściówek)
Każda strona ma własne, pisane ręcznie: lead, opis meta, 3 cechy okolicy („czym ta okolica się różni” — Podhale: pensjonaty, mróz, halny; Kraków: mieszkania, biura, deweloperzy; Myślenice/Dobczyce: domy jednorodzinne), dobór i kolejność usług z jednym zdaniem „dlaczego tu”, opis dojazdu z salonu w Rabce-Zdroju i 3 pytania FAQ.
- Zakazane: szablon „Instalacje w {miasto}” z podmienianą nazwą, wymyślone realizacje, opinie, liczby (klientów, montaży, minut dojazdu), ceny sprzętu. Fakty tylko z tego, co strona już mówi (gwarancja 24 mies. na montaż, odpowiedź do 24 h na zgłoszenie, wycena na piśmie po wizji lokalnej). Braki: `TODO(krystian):`.
- Realizacje z okolicy — tylko z bazy (`Realizations` opublikowane), dopasowane po polu „miejsce”; brak = sekcja się nie pokazuje.
- Test Vitest: żadne zdanie (lead, cechy, usługi, dojazd, FAQ) nie powtarza się między miastami; opis meta ≤ 160; tytuł z dopiskiem ≤ 60.

### 5. Tytuł i H1
- H1: „Instalacje <miasto>: monitoring, alarmy, smart home”.
- `<title>`: ten sam wzór nie mieści się w 60 znakach z dopiskiem „ | PRO-KOM Instalacje” (21 znaków; Rabka-Zdrój dałoby 64). Tytuł bierze najdłuższy wariant, który się mieści: „Instalacje <miasto>: monitoring, alarmy” → „Instalacje <miasto>: monitoring” → „<miasto>: monitoring” (Białka i Bukowina Tatrzańska). „Smart home” zostaje w H1 i opisie.

### 6. Linkowanie wewnętrzne
- Strona miejscowości → strony usług (karty usług z panelu), `/zaplanuj`, `/kontakt`, sąsiednie miejscowości (z linkami — każda z nich ma własną stronę).
- Do stron miejscowości: każda strona usługi (pasek „Obszar działania” nad stopką), stopka (link „Obszar działania” → `/obszar` na końcu ostatniej kolumny z panelu — czwarta kolumna ściska stopkę między 900 a 1100 px), `/obszar`, `/mapa-strony`, `llms.txt`.

### 7. Sitemap i dane strukturalne
- `sitemap.xml` i `/mapa-strony` z tej samej listy (`buildSiteMap` → sekcja „Obszar działania”).
- Strona miejscowości: `Service` (dostawca `/#oddzial-1`, `areaServed` = to miasto jako `City`), `BreadcrumbList` (Strona główna → Obszar działania → miasto), `FAQPage` z pytań strony. `LocalBusiness` zostaje jeden (salon w Rabce-Zdroju, w layoucie) — nie udajemy oddziałów w innych miastach.

## Konsekwencje
- +18 stron w indeksie; każda kolejna miejscowość to praca redakcyjna, nie kopia.
- Treść w kodzie: zmiana tekstu = PR (jak teksty widżetów). Przeniesienie do panelu możliwe później bez zmiany komponentu.
- Spec SEO §1 i komentarz w `seo.ts` zaktualizowane, żeby nie przeczyły temu ADR.
