# prokominstalacje.pl — SEO i widoczność w asystentach AI

Wersja 1.0 · 27.10.2026. Cel: **pierwsze miejsca w Google na Podhalu i w Małopolsce** dla instalacji niskoprądowych oraz częste wskazywanie PRO-KOM w odpowiedziach asystentów AI (ChatGPT, Gemini, Copilot, Perplexity, AI Overviews).

Uczciwie: pozycji nikt nie gwarantuje. Na wynik składają się trzy rzeczy — **technika** (to robi kod, sesje I1–I15), **treść i dowody** (to robimy w czacie i w panelu), **wizytówka Google i opinie** (to robi firma). Kod sam pierwszego miejsca nie da, ale zła technika potrafi je odebrać. Dlatego technika ma być bez zarzutu.

## 1. Frazy i mapowanie na strony

Zasada: **jedna intencja = jedna strona**. Dwie strony na tę samą frazę konkurują ze sobą.

| Intencja | Strona docelowa | Przykładowe frazy (do weryfikacji w Search Console po starcie) |
|---|---|---|
| ogólna lokalna | `/` | instalacje niskoprądowe Podhale, monitoring alarm Wi-Fi Rabka-Zdrój, instalacje Zakopane |
| usługa | `/monitoring` … `/ladowarki-ev` | montaż monitoringu Zakopane, kamery Nowy Targ, alarm do domu Podhale, kontrola dostępu apartamenty, Wi-Fi w pensjonacie, smart home Ampio Małopolska, nagłośnienie kościoła, digital signage, ładowarka Elzab montaż, teletechnika dla dewelopera, montaż anteny satelitarnej Rabka |
| obiekt | `/dla-kogo/*` | monitoring pensjonatu, alarm domku letniskowego, Wi-Fi dla hotelu, nagłośnienie restauracji, instalacje dla dewelopera |
| problem / wiedza | `/poradnik/*` | monitoring a RODO, ile dni nagrań, jaka kamera do domu |
| architekci i deweloperzy (współpraca przy projekcie) | `/dla-architektow` | smart home dla architektów, współpraca z architektami instalacje, projekt instalacji niskoprądowych, przygotowanie instalacji pod smart home na etapie budowy, głośniki do zabudowy w suficie projekt, okablowanie strukturalne dom jednorodzinny, teletechnika dla dewelopera; lokalnie: Zakopane, Nowy Targ, Podhale, Kraków (spec `prokominstalacje-architekci.md` §7) |
| marka | `/o-firmie`, `/kontakt` | PRO-KOM instalacje, PRO-KOM Rabka |

- Miejscowości: Rabka-Zdrój, Zakopane, Nowy Targ, Jordanów, Mszana Dolna, Limanowa, Szczawnica, Białka Tatrzańska, Bukowina Tatrzańska, Poronin. **Nie robimy stron-klonów pod miejscowości** (wytyczne Google o stronach przejściowych). Miejscowości występują naturalnie w treści, w danych strukturalnych (`areaServed`) i na Kontakcie (mapa dojazdu). Osobne strony miejscowości — tylko z unikalną treścią (np. realizacje z danej miejscowości), w etapie 2.
- Rozdział `/dla-kogo/deweloperzy` ↔ `/dla-architektow`: strona obiektu = co dostaje inwestycja i jej mieszkańcy (zestawy, przekrój budynku); strona dla architektów = współpraca przy projekcie (etapy, liczby do projektu, wymiana plików, przepisy). Nie powtarzamy tekstów, linkujemy w obie strony.
- Kanibalizacja z prokombiznes.pl: sprzedaż sprzętu dla firm → Biznes; projekt i montaż → Instalacje. Linkujemy krzyżowo, nie kopiujemy tekstów.

## 2. Technika (zakres kodu — sprawdzane w I13 i w DoD każdej sesji)

### 2.1 Renderowanie i adresy
- Każda strona renderowana na serwerze (SSG/ISR) — pełna treść w HTML bez JavaScriptu. Widżety (sceny, kalkulatory) hydratują się po stronie klienta, ale **ich treść opisowa (nagłówki, opisy punktów, wyniki domyślne) jest w HTML**.
- Sekcje zwinięte na telefonie są w HTML (zwijanie CSS-em), nie doładowywane.
- Adresy z §3 specyfikacji, kanoniczne bez końcowego ukośnika, bez parametrów. `https://prokominstalacje.pl` jako jedyny host (przekierowanie `www` → bez `www`, http → https, 301).
- `rel=canonical` na każdej stronie; parametry `#obiekt=…` w kreatorze to fragment (nie trafia do Google).

### 2.2 Meta
- `title` ≤ 65 znaków, `description` ≤ 155 znaków, unikalne, z panelu (domyślne z `seed` — `_title`, `_description`).
- Open Graph i Twitter Card: tytuł, opis, obraz 1200×630 dla każdej strony (generowany `opengraph-image` z tytułem i kolorem linii albo z panelu).
- `lang="pl"`, `hreflang` niepotrzebny (jedna wersja językowa).

### 2.3 Dane strukturalne (JSON-LD, walidacja w Rich Results Test w I13)
- **Cała strona:** `Organization` (PRO-KOM Tadeusz Wójciak, logo, `sameAs`: Facebook, TikTok, pro-kom.eu, prokombiznes.pl) + `WebSite`.
- **Strona główna, Kontakt:** `LocalBusiness` (podtyp `HomeAndConstructionBusiness` albo `ProfessionalService` — wybór w I13), dwie lokalizacje (Rabka-Zdrój ul. Orkana 16B, Zakopane — adres od szefa), `openingHoursSpecification`, `telephone`, `geo`, `areaServed` (powiat nowotarski, tatrzański, limanowski, suski, myślenicki — lista w panelu), `priceRange` tylko jeśli szef zgodzi się na ceny.
- **Usługi:** `Service` (`serviceType`, `provider` → LocalBusiness, `areaServed`, `offers` bez ceny), `FAQPage` z FAQ strony, `BreadcrumbList`.
- **Obiekty:** `Service` + `FAQPage` + `BreadcrumbList`.
- **Ładowarki:** `Product` dla CC Home/Wall/City **bez `offers` z ceną** (tylko `brand`, `model`, `description`, `image`) — albo `Service` z `itemOffered`; decyzja w I9 po sprawdzeniu, czy Google nie zgłasza błędów brakującej ceny.
- **Poradnik:** `Article` (autor = osoba z PRO-KOM z biogramem, data publikacji i aktualizacji).
- **Realizacje:** `CreativeWork`/`ImageObject` z miejscowością (gdy będą zdjęcia i zgody).
- Opinie (`AggregateRating`) **tylko z prawdziwych, własnych opinii zbieranych na stronie** — oceny z Google nie wolno kopiować do schematu.

### 2.4 Mapa strony i roboty
- `sitemap.xml` dla tenanta `instalacje` (wszystkie strony z §3, `lastmod` z panelu), `robots.txt` z adresem mapy. Staging: `noindex` + blokada w robots + hasło.
- `llms.txt` (krótki opis firmy, linie, usługi, obszar, kontakt i lista najważniejszych stron) — tani sygnał dla asystentów AI.
- Strona 404 z wyszukiwarką i linkami do usług; 410 dla usuniętych treści.

### 2.5 Przekierowania 301
Mapa ze starych adresów pro-kom.eu (kategorie i strony o monitoringu, alarmach, sieciach, antenach, nagłośnieniu) i pro-kom.pl → nowe adresy. Lista przygotowywana w czacie (`docs/tresci/prokominstalacje-301.md`), wdrożenie przez wtyczkę Redirects w panelu. Przed przełączeniem: zrzut zaindeksowanych adresów z Search Console starej domeny.

### 2.6 Szybkość (Core Web Vitals — czynnik rankingowy i konwersji)
- Cel na stagingu (telefon, Lighthouse i PageSpeed): LCP < 2,5 s, INP < 200 ms, CLS < 0,1, wynik ≥ 90.
- Sceny SVG: inline tylko scena widoczna w hero; pozostałe ładowane przy przewinięciu (`IntersectionObserver`), animacje na `transform/opacity`.
- Obrazy przez `next/image` (AVIF/WebP, `sizes`), zdjęcia ładowarek z `priority` tylko w hero.
- Fonty self-hosted (`next/font`), `display: swap`, tylko używane wagi.
- JavaScript: widżety jako osobne komponenty klienckie ładowane dynamicznie; żadnych bibliotek animacji, jeśli CSS wystarczy.
- Bez zewnętrznych skryptów śledzących; analityka bez cookies (Umami na VPS — decyzja projektu).

### 2.7 Dostępność (pośrednio SEO, bezpośrednio prawo i konwersja)
Kontrast AA, nagłówki w kolejności (jeden H1), etykiety formularzy, `alt` opisowe (np. „Ładowarka Elzab EcoPower CC Wall, biała obudowa z czarnym frontem”), widżety z opisem tekstowym dla czytników.

### 2.8 Linkowanie wewnętrzne
- Usługa → obiekty, w których jest najważniejsza (sekcja „Podobne obiekty”/powiązane) i odwrotnie (zestawy na stronie obiektu linkują do usług).
- Każda strona usługi linkuje do kreatora z parametrami i do 2–3 wpisów poradnika.
- Każda strona usługi (sekcja „Powiązane”, I4/I16c) → `/dla-architektow` („Projektujesz? Współpraca dla architektów →”); `/dla-kogo/deweloperzy` i `/dla-kogo/budowy` → blok „Dla architektów i deweloperów”; wpisy Poradnika o projektowaniu → `/dla-architektow`.
- Okruszki (breadcrumbs) na wszystkich podstronach.
- Stopka: wszystkie usługi i obiekty (crawl), strony PRO-KOM (Biznes, Software, Tech, pro-kom.eu).

## 3. Treść, która wygrywa (czat + panel, nie kod)
- **Konkret lokalny:** mróz, śnieg, burze, słabe łącze w górach, domki letniskowe, pensjonaty — to już jest w treściach i odróżnia nas od ogólnopolskich stron.
- **E-E-A-T (doświadczenie, ekspertyza, wiarygodność):** prawdziwe realizacje ze zdjęciami (zgody), osoby z imienia na „O firmie”, autoryzacje i certyfikaty (skany), rok założenia, dwa salony, NIP w stopce.
- **Odpowiedzi wprost:** FAQ pisane pełnymi zdaniami, pierwsze zdanie = odpowiedź. To lubią i Google (fragmenty z odpowiedzią), i asystenci AI.
- **Aktualność:** data aktualizacji przy przepisach i poradnikach; przegląd treści co kwartał.
- Poradnik: 1 wpis na start (RODO), plan 6–8 wpisów na pierwsze 3 miesiące (lista w czacie „Spec · prokominstalacje.pl”).
- Poradnik dla projektantów (po I12, treść z czatu → `docs/tresci/`): „Co przewidzieć w projekcie domu: instalacje niskoprądowe”, „Głośniki w suficie: jak zaplanować na etapie projektu”, „Okablowanie strukturalne w domu jednorodzinnym”, „Warunki techniczne 2026–2028 a teletechnika”.

## 4. Poza stroną (firma)
- **Profil Firmy w Google** dla Rabki i Zakopanego: kategorie (np. „Instalator systemów bezpieczeństwa”, „Usługi instalacji systemów monitoringu”), link do prokominstalacje.pl (z UTM), zdjęcia z montaży, posty, pytania i odpowiedzi.
- **Opinie Google:** prośba po każdym montażu (link/QR w protokole i mailu) — najsilniejszy czynnik w wynikach lokalnych obok odległości i trafności.
- **NAP** (nazwa, adres, telefon) identyczne wszędzie: strona, Google, Facebook, katalogi (Panorama Firm, pkt.pl), strony producentów (lista instalatorów Ampio, Satel, Elzab, jeśli dostępna).
- Linki lokalne: partnerzy, deweloperzy, gminy (realizacje), lokalne media.

## 5. Pomiar
- Google Search Console (domena), Bing Webmaster Tools, Umami (zdarzenia: wysłanie formularza, klik telefonu, start kreatora, użycie kalkulatora).
- Raport miesięczny w czacie „Szef · raporty”: wyświetlenia, kliknięcia, średnia pozycja dla 20 fraz z §1, liczba zapytań.

## 6. Lista kontrolna przed produkcją (I13/I15)
- [ ] Każda z 32 stron: unikalny title/description, H1, canonical, OG, JSON-LD bez błędów w Rich Results Test.
- [ ] sitemap.xml i robots.txt poprawne; staging `noindex`.
- [ ] 301 ze starych adresów działają (test listy).
- [ ] Lighthouse telefon ≥ 90 na: `/`, `/monitoring`, `/dla-kogo/pensjonaty`, `/ladowarki-ev`, `/zaplanuj`.
- [ ] Brak placeholderów `[...]`, brak list źródeł na stronie.
- [ ] Search Console: dodana domena, wysłana mapa strony.
