# prokomsoftware.pl — plan budowy (sesje SW0–SW12)

- **Stan na:** 25.10.2026 — SW0 i SW1 scalone (#64, #67); wizualizacja v20 wgrana (#102) i wniesiona do spec., ADR-014/015 i tego planu (SWD1). Budowa Software wznowiona 25.10 (Biznes czeka na poprawki). Wcześniej, 22.10: SW0 — kolejność i podział sesji w §3. Wcześniej, 18.10: Fundament S1–S9 scalony; Biznes w toku (B3b scalone #50, następne B4). S10 (serwer) po zakupie VPS.
- **Termin:** w `docs/STAN.md` jest 31.10 — **nierealny** przy 13 sesjach i Biznesie do 26.10. Propozycja (do potwierdzenia z szefem w Asanie): start SW1 po produkcji Biznesu (27.10), wersja testowa na stagingu ok. 10.11, produkcja po akceptacji szefa ok. 13.11. Kolejność względem Instalacji — decyzja szefa.
- **Źródła prawdy (w tej kolejności):** `docs/strony/prokomsoftware.md` (spec) → `docs/design/prokomsoftware/` (zrzuty, stany, plansze) → ADR-014 i ADR-015 → ADR-010, ADR-012, ADR-013 → reszta.

Zasady jak w Biznesie:
- jedna sesja = jedna gałąź = jeden PR (squash do `develop`);
- `/zadanie SW<n>` w nowej sesji, w trybie planowania; plan akceptuje Krystian;
- na koniec: `/przeglad` (recenzent) → porównanie ze zrzutami (sesje z UI) → `/koniec-sesji` → `/pr`;
- produkcja tylko po akceptacji szefa w Asanie, przez `/wdrozenie`.

---

## 1. Co już jest (nie budujemy drugi raz)

| Potrzeba Software | Gdzie jest | Co zostaje |
|---|---|---|
| Tokeny per linia, motyw ciemny, `pk-theme`, skrypt bez mignięcia | `src/styles/tokens.css`, `lib/brand/theme.ts` (S6b, ADR-013) | wartości Software + nowe tokeny + `DARK_THEME_LINES` (SW1) |
| Fonty Archivo/Manrope lokalnie | S9a | — |
| `Pages` z blokami per linia, podgląd na żywo | S5, ADR-010, ADR-011 | bloki Software (SW5–SW8, SW11) |
| `Posts`, `Industries` per tenant | B1a | grupa pól Software, `relatedSolutions` (SW2b) |
| `Inquiries` z `list`/`wizard`, numer `PKS-…`, `submitInquiry()`, maile, retencja | S8, B1b | `audit`, `auditUrl`, `preferredContact`, `items[].solution` (SW2b) |
| Wyszukiwarka `lib/search.ts`, store `pk-cart` | B4 (w toku na Biznesie) | indeks rozwiązań, store `pk-project` (SW3, SW4) |
| Nagłówek z mega menu, menu `<dialog>` na telefonie, stopka | B3a/B3b (Biznes) | wersja Software (SW4) — ten sam wzorzec, inne dane |
| SEO per domena, sitemap, JSON-LD, 301 | S7b | `Service`, `ItemList`, `Article`, sitemap z kolekcji (SW12) |
| Docker, CI, smoke, kopie | S9 | strony Software w `smoke.sh` (SW12) |

---

## 2. SW0 — decyzje przed pierwszą linijką kodu (Krystian, w czacie + jedna sesja dokumentacji)

> **Zrobione 22.10.2026.** Decyzje D1–D18 (wszystkie wg rekomendacji przeglądu) są w sekcjach „Rozstrzygnięcia” ADR-014 i ADR-015; kolejność sesji — §3. Termin i kolejność Software vs Instalacje (pkt 4) dalej czekają na szefa w Asanie. Lista niżej zostaje jako zapis.

1. **ADR-015:** akcent jasny (rekomendacja B: `#6E45D4` / `#5B33C4`), gradient H1 bez błękitu, `--glow-2` fioletowa, Fraunces → Georgia.
2. **ADR-014:** `Industries` z grupą Software (rekomendacja) czy osobna kolekcja; `InquiryFiles` w etapie 1 czy plik „dosłać mailem”; placeholdery przez `facts` + `fillFacts` (rekomendacja).
2a. **Poprawki tekstów z plansz** (spec. §13 pkt 18–22) i gradienty obszarów (ADR-015 pkt 7).
3. **Wspólna trasa `/aktualnosci`:** Biznes buduje ją w B11 (przed SW). **Przed B11** dopisz do zadania B11: „/aktualnosci jako trasa wspólna dla linii, nie w (biznes)” + zmiana ADR-012 rozstrz. 5. SW11 tylko dokłada wygląd Software.
4. **Termin** i kolejność Software vs Instalacje — zadanie w Asanie dla szefa.
5. Przyjąć ADR-014 i ADR-015 (status „przyjęta”, sekcja „Rozstrzygnięcia”), dopisać w `docs/STAN.md` „Następne”.

**Prompt (sesja dokumentacji, bez kodu):**
```
Przeczytaj CLAUDE.md, docs/STAN.md, docs/strony/prokomsoftware.md, docs/design/prokomsoftware/README.md, docs/decyzje/ADR-014-model-tresci-prokomsoftware.md, docs/decyzje/ADR-015-wyglad-prokomsoftware.md, docs/zadania/prokomsoftware.md oraz ADR-010, ADR-012, ADR-013. Obejrzyj docs/design/prokomsoftware/screens/Main-1440-light/01.jpg–03.jpg, Main-1440-dark/01.jpg, Katalog-1440-light/01.jpg i stany/50-kreator-strona-pensjonat-4-wynik.jpg. Nie pisz kodu.
Napisz: (1) co jest niejasne albo sprzeczne z kodem i przyjętymi ADR-ami (sprawdź src/collections/Inquiries.ts, Industries.ts, Posts.ts, src/lib/pages/slug.ts, src/lib/brand/theme.ts, src/styles/tokens.css); (2) co z Biznesu (B3a, B3b, B4) da się użyć wprost, a co trzeba uogólnić; (3) ryzyka planu SW1–SW12.
Potem wpisz moje rozstrzygnięcia: <tu wklejam decyzje z czatu> do sekcji „Rozstrzygnięcia” ADR-014 i ADR-015, zmień ich status na „przyjęta”, zaktualizuj docs/marka.md (kolor interfejsu Software) i docs/STAN.md. Gałąź docs/prokomsoftware-sw0, PR do develop.
```

---

## 3. Sesje

**Kolejność = kolejność wierszy** (SW0 22.10, podział SW2 22.10, v20 w SWD1 25.10; ADR-014 rozstrz. 13). Numery sesji zostają, zmienia się tylko kolejność: najpierw ścieżki, które dają zapytania (katalog → „Twój projekt” → kontakt, kreator), potem sekcje strony głównej, które używają gotowej karty rozwiązania i kreatora. SW2b rusza po SW9 (B8, B10, B11 scalone — nic już nie blokuje).

**Wzorzec telefonu w każdej sesji z UI** (v20): zakres sesji obejmuje zrzuty 390 px i stany 8x–9x, nie tylko desktop — prompt 4.1 + dopisek „wzorzec telefonu”.

| # | Zadanie | Gotowe, gdy | Spec. / plansze |
|---|---|---|---|
| **SW1** ✅ | **Tokeny i motyw** (#67): wartości z `tokens.css` wg ADR-015, nowe tokeny semantyczne, `software` w `DARK_THEME_LINES`, test kontrastu. | zrobione 22.10. | ADR-015 |
| **SW2a** | **Model danych — nowe elementy Software:** `SolutionAreas` (+ `priceLabel`), `Solutions` (drafts, `category`, tylko `prices`/`leadTimes` — `priceFrom`/`leadTime` liczone, `priceNote`), `Cities` (z `faq`), grupa `SiteSettings.software` (nawigacja v20: `header`, `headerRight`, `mega`, `footer`, `headerMobile`, `tabBar`, `mobileMenu`, `mobileMenuFooter`, `projectPill`, `projectDrawer`; obietnice; `facts`) + `fillFacts`, `{termin}` i `{cena:<slug>}`, `SoftwareSettings` (wyszukiwarka; kreator JSON + Zod `lib/software/wizard.ts` z `priceDisplay`, `scopeNotes`, `mobile`, `badges`, `send`; `home` JSON + Zod z `whyNotWordpress`, `proceduralMock`; `notFound`, `thanks`; popularne, technologie); strażnik `(software)`; `RESERVED_PAGE_SLUGS` (+ `dziekujemy`). Bez `Inquiries`/`Industries`/`Posts`. | migracje `up` → `down` → `up` czyste; testy dostępu, izolacji tenantów i ukrywania pól per linia; `fillFacts` i `{cena:}` z testami (pusta cena / zły slug = brak renderu na produkcji); Zod przechodzi na seedzie v20; trasy Software 404 na innych domenach. | ADR-014 §1, §2 + rozstrz. SW0 1–7 i v20 1–7, 10–11 |
| **SW3** | **Seed, ikony i indeks:** `pnpm seed:software` z `seed/prokomsoftware/` v20 (idempotentny po `legacyId`/slug; ceny wypełnione; **rozwiązania z `removed` pominięte**; `homeOrder` → kolejność bloków `home`); 27 nowych ikon w `ICON_NAMES` (migracja; przy kolizji rysunek Biznesu); usunąć `seed/prokomsoftware/` z `DOCS_ONLY` w `.github/workflows/ci.yml`; `GET /api/solutions-index` + rewalidacja; `lib/search.ts` uogólnione do `{ name, hay, popularity? }` z testami obu linii. | w panelu 8 obszarów, 29 rozwiązań z cenami, 6 miejscowości (aktywna Rabka), nawigacja v20, fakty, `SoftwareSettings`; **test: żadne rozwiązanie z `removed` nie trafia do bazy ani indeksu**; indeks < 30 KB gzip. Branże i wpis — seed w SW2b (gdy są pola). | ADR-014 §4, rozstrz. SW0 8, 10, v20 2; seed `_info` |
| **SW4** | **Elementy wspólne — telefon jak aplikacja:** ramka strony per linia (zamiast warunków w `[domain]/layout.tsx`); desktop: pasek górny (`BrandBar`), nagłówek z mega menu z rzędem „Dla branż”, pigułka Kreator, „Twój projekt” **tylko przy niepustej liście** (`createListStore` wydzielony z `lib/cart/store.ts`, klucz `pk-project` z `{ id, name }`, szuflada, toast), szyna sekcji, stopka; **≤ 1080 px:** nagłówek kompaktowy (znak + „Wycena”), **dolny pasek** 5 pozycji z wyróżnionym Kreatorem (safe-area, aktywna pozycja wg adresu), **arkusz menu** (`<dialog>`, focus trap, Esc, przełącznik motywu, wyszukiwarka, kafle oferty z ceną), **pigułka i arkusz „Twój projekt”**, stopka w 2 kolumnach; przyciski Software (`--accent` + `--accent-ink`). | zgodne z `Main` 01.jpg, `stany/01–02` i **`80–82`** (w obu motywach); klawiatura i axe (także arkusze); stan projektu wspólny dla kart przeglądarki; testy listy Biznesu dalej zielone; pary kontrastu z ADR-015 v20 w `themes.test.ts`. | spec. §3, §8.1, §8.6; ADR-014 rozstrz. SW0 9, 12, v20 4; ADR-015 v20 |
| **SW9** | **Katalog `/rozwiazania`:** filtry w URL z licznikami, wyszukiwarka, karta rozwiązania z rozwinięciem i 3 wersjami (cena, termin, `priceNote`; komponent używany potem w „12 rzeczach”), „+ Do projektu”, podgląd, pusty wynik, blok kontaktu, `noindex`; **telefon:** kategorie w przewijanym rzędzie, przyklejony pasek wyszukiwarki z „Filtry (n)”, arkusz filtrów, karty z miniaturą. | zgodne z `Katalog-*` i `stany/88a–b`; kryterium 4. | spec. §5 |
| **SW2b** | **Model danych — kolekcje wspólne z Biznesem:** rozszerzenia `Inquiries` (`audit`, `auditUrl`, `preferredContact` + `meeting`/`online`, `items[].solution`, tematy Software — na bazie B8), ukryte `line` + grupa Software w `Industries` (`group`, `problems`, `moduleMap`, `offline`, `topSolutions`, `wizardFirm`, **`wizardTitle`**; FAQ branży we wspólnym `faq`), `line` + `relatedSolutions` w `Posts`, kategorie Software z walidacją per linia; seed branż (12, aktywna budowlanka z FAQ) i wpisu. | migracje `up` → `down` → `up` czyste; testy dostępu, izolacji i ukrywania pól per linia; testy Biznesu (formularze, branże, aktualności) zielone. | ADR-014 §1.6, §3 + rozstrz. SW0 1–2, 6, v20 8 |
| **SW7** | **Kreator:** komponent kreatora (5 kroków, reguły z `SoftwareSettings.wizard`, plakietki), wynik z równymi kolumnami, **cena wg rozmiaru z `prices`** (`priceDisplay`), **`scopeNotes`**, „Zapytaj o wycenę” dla pustej ceny, podgląd, formularz z „Imię”, zgodą i **błędami** (`send.errors`), **sukces na miejscu z 3 krokami**, wysyłka `wizard` z `message` składanym przez serwer; strona `/dobierz` z parametrami URL; sekcja na głównej to ten sam komponent. **Telefon:** kafle 2×2, przyklejone pigułki kroków i „Dalej”, podgląd zwinięty. Bez pliku. | 3 ścieżki = `stany/50–52` (z błędem i wysłaniem), „opisz po swojemu” = `53`, ciemny wynik = `54`, „Zapytaj o wycenę” = `55`, telefon = `87a–f`; e2e każdej ścieżki przy 1440 i 390. | spec. §6.3, §7; ADR-014 rozstrz. SW0 3, 6, v20 1, 7, 12 |
| **SW5** | **Strona główna cz. 1:** blok `swHero` (makieta „Twój system” z modułami + kafle intencji), blok `swHomeSection` (wybór sekcji) i **nowa kolejność 12 sekcji**; sekcje: 8 obszarów z autoprzełączaniem (ceny z `priceFrom`/`priceLabel`), 12 rzeczy z filtrami (karta z SW9), kreator (z SW7). **Telefon sekcji 1–4:** hero w jednej kolumnie z pigułkami zaufania, kafle intencji 2×2, pigułki obszarów w przewijanym rzędzie, karuzela 12 rzeczy (84%). | zgodne z `Main-1440/390` (sekcje 1–4, 7) w obu motywach i `stany/10`, `20`, `21`, `83–85`. | spec. §4 (1–4, 7); ADR-014 rozstrz. SW0 7, v20 6 |
| **SW6** | **Strona główna cz. 2:** podglądy na żywo (5 makiet; na telefonie laptop przycięty do szerokości ekranu, bez telefonu i pływających kart) i proces (5 etapów; makieta wyceny z cennika — `proceduralMock`; na telefonie przewijane etapy, bez makiety „szkic systemu”). | zgodne ze `stany/30`, `40` i `Main-390-*`; `prefers-reduced-motion` wyłącza ruch. | spec. §4 (5–6) |
| **SW8a** | **Strona główna cz. 3a: zasady + „Dlaczego nie WordPress i PHP”** (fakty ze źródłem, tabela 6 wierszy, CTA z ceną przebudowy; blok „Czasem powiemy” wg ADR-015 v20 pkt 5; telefon: fakty w karuzeli, tabela jako karty). Technologie, „jak robimy” i porównanie przechodzą do SW11b (`/o-firmie`). | zgodne z `Main-*` (sekcje 8–9) i `stany/75`, `76`, `86`. | spec. §4 (8–9) |
| **SW8b** | **Strona główna cz. 3b:** realizacje (telefon: karuzela, liczby 2×2), FAQ (6) z JSON-LD (jedna kolumna), blok `swContact` (formularz z tematami, błędy, sukces → `/dziekujemy`). | cała strona główna = `Main-*` i `Main-390-*` (ok. 15 500 px przy 390); formularz zapisuje `contact` z `topics`; `stany/77`. | spec. §4 (10–12), §7 |
| **SW10** | **Rozwiązanie i branża:** `/rozwiazania/[slug]` (pełna strona z demo telefonu + szablon dla rozwiązań bez treści; kafle danych z cenami z `Solutions`; telefon: interaktywny telefon w czytelnym rozmiarze, kafle 2×2), `/dla-branz/[branza]` (problemy → rozwiązania, mapa modułów, „Złóż system… **W 60 sekund**” z `?firma=`, **FAQ branży z JSON-LD**, ceny na kartach z `Solutions`). | zgodne z `Rozwiazanie-*`, `Branza-*`, `stany/89a`. | spec. §6.1, §6.2 |
| **SW11a** | **Podstrony z formularzami:** `/kontakt` (adres, NIP, godziny, mapa z „Nawiguj”, `?projekt=1`, `?poziom=`, błędy, sukces → `/dziekujemy`), `/audyt` (blok `swAuditForm`, „Imię” + zgoda, walidacja, typ `audit`, rodzaje audytu 0/990/1 990), `/cennik` (blok `swPricing`, ceny z panelu, opieka 149/299/790 z „Wybieram X →”, telefon: tabela jako karty). | zgodne z planszami i `stany/89b–c`; formularze audytu i projektu w e2e. | spec. §6.4, §6.5, §6.10, §7 |
| **SW11b** | **Pozostałe podstrony:** `/o-firmie` (`swTeam`; **technologie, „jak robimy” i porównanie** jako sekcje `swHomeSection` — karuzele na telefonie, `stany/60`, `70`), `/jedna-firma` (`swLines`, `swSteps`, „Dwa salony”), `/aktualnosci` + wpis (wygląd Software na wspólnej trasie z B11), `/miejscowosci/[miasto]`, **`/polityka-prywatnosci`, 404, `/dziekujemy`**, mapa strony. | zgodne z planszami (w tym `Polityka-*`, `NieZnaleziono-*`, `Dziekujemy-*`); miejscowość nieaktywna = 404 i brak w sitemap; 404 zwraca status 404; `/dziekujemy` z `noindex`. | spec. §6.6–6.9, §6.11 |
| **SW12** | **SEO i jakość:** JSON-LD (`Service`, `ItemList`, `Article`, `BreadcrumbList`), sitemap z kolekcji, opisy meta, 301, analityka cookieless (**najpierw ADR-016 — Umami**) ze zdarzeniami ze spec. §8.4 (także `menu_otworz`, `pasek_klik`, `formularz_blad`; konwersja = wejście na `/dziekujemy` + `kreator_wyslij`), skan placeholderów i nazw konkurencji, Lighthouse, axe, smoke. | kryteria 6–10 ze spec. §10. | spec. §8.4, §9, §10 |
| — | **Staging → demo dla szefa → poprawki → produkcja** (`/wdrozenie`) | akceptacja szefa w Asanie (także cennik i polityka prywatności); brak placeholderów na produkcji. | `docs/wdrozenia.md` |

**Plan cięcia, jeśli brakuje czasu** (tniemy od końca, jakości nie tniemy; plik w kreatorze wypadł już w SW0):
1. demo telefonu na stronie rozwiązania → statyczna makieta;
2. technologie i porównanie → wersja statyczna bez zakładek;
3. szuflada „Twój projekt” → tylko przycisk „Bezpłatna wycena” (lista po starcie).

(Branże i miejscowości nie są w planie cięcia: szablon budujemy zawsze, a liczba aktywnych stron zależy tylko od gotowych treści.)

---

## 4. Prompty do Claude Code

### 4.1 Każda sesja (podmień numer i nazwę)
```
/zadanie SW<n> — <nazwa z tabeli>
Źródła: docs/strony/prokomsoftware.md (§<sekcja>), docs/design/prokomsoftware/README.md, ADR-014, ADR-015. Wzorzec: docs/design/prokomsoftware/screens/<Plansza>-1440-light, -1440-dark, -390-light (i stany/<NN>-*.jpg), treści i wartości: docs/design/prokomsoftware/boards/<Plansza>.dc.html, dane: seed/prokomsoftware/.
Zasady: teksty przenoś z planszy bez zmian; kolory tylko z tokenów; ceny, terminy i obietnice [SZEF] wyłącznie z panelu (puste = „cena po rozmowie”); bez nazw konkurencji; każde zapytanie filtruje po tenancie; nie przenoś architektury .dc.html. Najpierw sprawdź, co z Biznesu da się użyć albo uogólnić.
Przed PR: zrzuty Playwright (1440 i 390, jasny i ciemny) porównane z screens/ i stany/ — wypisz różnice i popraw. Oczekiwane różnice: ADR-015 rozstrz. 8 i v20 (m.in. gradient H1 bez błękitu).
```

**Dopisek do każdej sesji z UI — wzorzec telefonu (v20, prompt 2.3 z `PRZEKAZANIE-v20.md`):**
```
Wzorzec telefonu jest częścią zakresu, nie poprawką na koniec: zrzuty 390 px (screens/<Plansza>-390-light, Main także -390-dark) i stany 8x–9x. Przed PR zrób zrzuty Playwright przy 390 i 360 px i sprawdź: zero poziomego przewijania strony (document.scrollingElement.scrollWidth = szerokość okna), żaden element nie wystaje poza ekran, cele dotyku ≥ 44 px, tekst ≥ 12 px, dolny pasek nie zasłania treści (padding-bottom pod pasek), arkusze z focus trap i Esc.
```

### 4.2 Porównanie z wzorcem (na koniec sesji z UI)
```
Zrób zrzuty Playwright pełnej strony <adres> przy 1440 i 390 px w obu motywach i porównaj je z docs/design/prokomsoftware/screens/<Plansza>-*. Dla interakcji porównaj ze stany/<NN>-*.jpg. Wypisz różnice w kolejności sekcji, tekstach, kolorach, odstępach, wysokościach i brakujących elementach. Popraw to, co odbiega, zanim otworzysz PR.
```

### 4.3 Szczegóły do poszczególnych sesji (dopisz do 4.1)

- **SW1:** „Wartości z docs/design/prokomsoftware/tokens.css przenieś 1:1 według mapy nazw w komentarzu pliku i rozstrzygnięć ADR-015. Nowe tokeny semantyczne muszą mieć wartości domyślne dla linii bez wizualizacji. Rozszerz themes.test.ts o pary z README (sekcja Kontrast). Pokaż zrzuty Biznesu przed i po — mają być identyczne.”
- **SW2a / SW2b:** „Kolekcje i pola dokładnie wg ADR-014 §1 i §3 oraz rozstrzygnięć SW0 1–7 i v20 (nazwy po angielsku, etykiety po polsku). Grupy Software w SiteSettings i Industries widoczne tylko dla linii software (wzorzec SiteSettings.biznes z B1b). fillFacts i {cena:<slug>} z testami: podmiana, brak wartości / zły slug na produkcji = brak renderu. Schematy Zod kreatora, home i nawigacji sprawdź na seed/prokomsoftware/ v20. Migracje up → down → up. Testy dostępu, izolacji i strażnika (software).”
- **SW3:** „Seed wzoruj na pnpm seed:biznes (idempotentny, tylko lokalnie); priceFrom/leadTime z seeda mapuj na rozmiar start (ADR-014 rozstrz. 5), ikony wg rozstrz. 8, wyszukiwarka wg rozstrz. 10. Przeczytaj _info każdego pliku. Ceny i terminy z seeda v20 (wypełnione 25.10); rozwiązania z rozwiazania.json → removed pomiń (ADR-014 v20 pkt 2) i sprawdź to testem. Industries (w SW2b): 12 rekordów z branze.json → pagesAtStart, aktywny tylko budownictwo-i-wykonczenia z treścią branze.json → budowlanka (FAQ do wspólnego pola faq). Obszary: chipy z relacją do Solutions po slugu. Indeks /api/solutions-index wzoruj na /api/catalog-index.”
- **SW4:** „Nagłówek: kolejność i pozycje ze spec. §3.1, mega menu ze stany/01-menu-oferta.jpg, Twój projekt ze stany/02-twoj-projekt.jpg; telefon (≤ 1080 px) wg spec. §3.2 i §8.6: nagłówek kompaktowy, dolny pasek, arkusz menu i „Twój projekt” ze stany/80–82 (82b — ciemny). Tokeny warstwy mobilnej i kontrast wg ADR-015 v20. Wydziel createListStore(key, parse) z lib/cart/store.ts (ADR-014 rozstrz. 9) z testami obu linii; klucz pk-project z { id, name }. Ramka strony per linia zamiast kolejnych warunków w [domain]/layout.tsx (rozstrz. 12).”
- **SW5–SW8b:** „Bloki tylko wg ADR-014 rozstrz. 7 (≤ 10 bloków Software, w src/sites/software/blocks/, lista dozwolona tylko dla linii software); sekcje o stałej kolejności to komponenty wstawiane blokiem swHomeSection, teksty z SoftwareSettings.home. Kolejność 12 sekcji ze spec. §4 (v20) jest ustalona i wynika z kolejności bloków; wzorce mobilne każdej sekcji — kolumna „Telefon” w spec. §4. Autoprzełączanie: pauza przy interakcji i document.hidden, brak przy prefers-reduced-motion, zakładki jako role=tablist ze strzałkami.”
- **SW7:** „Kreator: reguły wyłącznie z SoftwareSettings.wizard (bez if-ów na id potrzeb w komponentach). Odtwórz 3 ścieżki ze stany/50–52 jako testy e2e (te same kliknięcia, ten sam wynik i cena wg priceDisplay, błąd formularza, wysłanie). Kolumny wyniku równej wysokości przy 1440 px. Pole „Imię” i checkbox zgody (ADR-014 rozstrz. 6), bez pliku. Wysyłka przez submitInquiry() z type wizard i pełnym stanem; message składa serwer.”
- **SW11a/SW11b:** „/aktualnosci to trasa wspólna z B11 (ADR-012 rozstrz. 5) — dołóż tylko wygląd Software. Audyt: pole „Imię” + zgoda, message składa serwer. Kontakt i audyt po wysłaniu → /dziekujemy?nr=… Cennik: ceny z panelu, pusta = „Zapytaj o wycenę”, bez przekierowania. /o-firmie: technologie, „jak robimy” i porównanie to te same komponenty co dawniej na głównej (swHomeSection). Polityka: projekt z planszy, baner „wersja robocza” nie na produkcję. /dziekujemy: trasa w (software), noindex. 404: wersja Software w ramce linii, status 404. Miejscowości: strona nieaktywna = 404 i brak w sitemap.”
- **SW12:** „Najpierw ADR-016 (analityka Umami, nowy kontener). Zdarzenia ze spec. §8.4 (z menu_otworz, pasek_klik, formularz_blad), konwersja = /dziekujemy + kreator_wyslij. Skan HTML wszystkich opublikowanych stron Software: zero placeholderów w nawiasach kwadratowych i zero nazw konkurencji (spec. §10 pkt 10; listę nazw podam w sesji, trzymaj ją tylko w pliku testu). Lighthouse wg budżetu S10.”

---

## 5. Podział pracy: czat ↔ Claude Code

| W czacie (projekt „PRO-KOM Cyfryzacja”) | W Claude Code (repo `prokom-web`) |
|---|---|
| decyzje SW0 (kolory, model, terminy) i ich uzasadnienie | wpisanie decyzji do ADR, `STAN.md`, `marka.md` |
| ceny, terminy, poziomy opieki — przygotowanie dla szefa, zadania „SZEF ·” w Asanie | pola w panelu, logika „cena po rozmowie” |
| treści: 11 branż, 5 miejscowości, pełne strony 18 rozwiązań, wpisy, opisy meta, polityka prywatności | seed albo wpisanie w panelu (bez zmiany kodu) |
| sprawdzanie faktów i źródeł (dostępność, W3Techs, progi Google) | wstawienie źródeł do `Posts.sources` |
| zmiany wyglądu: najpierw plansza w wizualizacji, potem nowe zrzuty do `docs/design/` | budowa według zrzutów |
| przegląd zrzutów z PR (wklejasz do czatu, oceniamy) | poprawki |
| raport dla szefa i demo | staging, `/wdrozenie` po akceptacji |

Zasada: nowy pomysł w trakcie sesji = osobne zadanie w Asanie, nie „przy okazji” w bieżącym PR.
