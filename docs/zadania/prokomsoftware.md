# prokomsoftware.pl — plan budowy (sesje SW0–SW12)

- **Stan na:** 18.10.2026. Fundament S1–S9 scalony; Biznes w toku (B3b scalone #50, następne B4). S10 (serwer) po zakupie VPS.
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
| `Posts`, `Industries` per tenant | B1a | grupa pól Software, `relatedSolutions` (SW2) |
| `Inquiries` z `list`/`wizard`, numer `PKS-…`, `submitInquiry()`, maile, retencja | S8, B1b | `audit`, `auditUrl`, `preferredContact`, `items[].solution` (SW2) |
| Wyszukiwarka `lib/search.ts`, store `pk-cart` | B4 (w toku na Biznesie) | indeks rozwiązań, store `pk-project` (SW3, SW4) |
| Nagłówek z mega menu, menu `<dialog>` na telefonie, stopka | B3a/B3b (Biznes) | wersja Software (SW4) — ten sam wzorzec, inne dane |
| SEO per domena, sitemap, JSON-LD, 301 | S7b | `Service`, `ItemList`, `Article`, sitemap z kolekcji (SW12) |
| Docker, CI, smoke, kopie | S9 | strony Software w `smoke.sh` (SW12) |

---

## 2. SW0 — decyzje przed pierwszą linijką kodu (Krystian, w czacie + jedna sesja dokumentacji)

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

| # | Zadanie | Gotowe, gdy | Spec. / plansze |
|---|---|---|---|
| **SW1** | **Tokeny i motyw:** wartości z `tokens.css` do `src/styles/tokens.css`; nowe tokeny semantyczne z wartościami domyślnymi dla wszystkich linii; `software` w `DARK_THEME_LINES`; gradient H1 i poświaty jako tokeny; test kontrastu par Software (z wyjątkami z README). | testy tokenów zielone; strona Software (szkielet) w obu motywach ma kolory planszy; Biznes bez zmian (zrzuty przed/po). | ADR-015; README „Tokeny”, „Kontrast” |
| **SW2** | **Model danych:** `SolutionAreas`, `Solutions` (drafts, `category`, ceny per rozmiar), `Cities`, grupa `SiteSettings.software` (nawigacja, stopka, kanały, obietnice, `facts`) + `fillFacts`, `SoftwareSettings` (wyszukiwarka, kreator JSON + Zod `lib/software/wizard.ts`, popularne, technologie); grupa Software w `Industries`; `Posts.relatedSolutions`; rozszerzenia `Inquiries`; (opcjonalnie) `InquiryFiles`; strażnik `(software)`; `RESERVED_PAGE_SLUGS`. | migracje `up` → `down` → `up` czyste; testy dostępu i izolacji tenantów; trasy Software 404 na innych domenach. | ADR-014 §1–3 |
| **SW3** | **Seed i indeks:** `pnpm seed:software` z `seed/prokomsoftware/` (15 plików, idempotentny po `legacyId`/slug); `GET /api/solutions-index` + rewalidacja; ikony z `ikony.json` w istniejącym `Icon`. | w panelu 8 obszarów, 30 rozwiązań, 12 branż (aktywna 1), 6 miejscowości (aktywna Rabka), 1 wpis, nawigacja, fakty (puste), `SoftwareSettings`; indeks < 30 KB gzip. | ADR-014 §4; seed `_info` |
| **SW4** | **Elementy wspólne:** nagłówek z mega menu (dane z `SiteSettings.software.navigation`), pigułka Kreator, Twój projekt (store `pk-project`, szuflada, toast), menu `<dialog>` na telefonie, szyna sekcji, stopka. Jeśli to możliwe — uogólnić komponenty Biznesu zamiast kopiować. | zgodne z `Main` 01.jpg, `stany/01–03`; klawiatura i axe; stan projektu wspólny dla kart przeglądarki. | spec. §3, §8.1 |
| **SW5** | **Strona główna cz. 1:** bloki `swHero` (makieta „Twój system” z modułami), `swIntents`, `swAreas` (8 obszarów z autoprzełączaniem), `swPopular` (12 rzeczy z filtrami i rozwijaniem). | zgodne z `Main-1440/390` (sekcje 1–3) w obu motywach i `stany/10`, `20`, `21`. | spec. §4 (1–3) |
| **SW6** | **Strona główna cz. 2:** `swLivePreviews` (5 makiet), `swProcess` (5 etapów). | zgodne ze `stany/30`, `40`; `prefers-reduced-motion` wyłącza ruch. | spec. §4 (4–5) |
| **SW7** | **Kreator:** komponent kreatora (5 kroków, reguły z `SoftwareSettings.wizard`, wynik z równymi kolumnami, podgląd, wysyłka `wizard`), blok `swWizard` na głównej i strona `/dobierz` z parametrami URL; plik opcjonalnie (SW0). | 3 ścieżki = `stany/50–52`, „opisz po swojemu” = `53`, ciemny wynik = `54`; e2e każdej ścieżki przy 1440 i 390. | spec. §6.3, §7 |
| **SW8** | **Strona główna cz. 3:** `swTech`, `swHowWeBuild`, `swCompare`, `swGuarantees`, `swShowcase`, FAQ (6) z JSON-LD, `swContact` (formularz z tematami, sukces z numerem). | cała strona główna = `Main-*` i `Main-390-*`; formularz zapisuje `contact` z `topics`. | spec. §4 (7–13), §7 |
| **SW9** | **Katalog `/rozwiazania`:** filtry w URL z licznikami, wyszukiwarka, karty z rozwinięciem, „Dodaj do projektu”, podgląd, pusty wynik, arkusz filtrów na telefonie, `noindex`. | zgodne z `Katalog-*`; kryterium 4. | spec. §5 |
| **SW10** | **Rozwiązanie i branża:** `/rozwiazania/[slug]` (pełna strona z demo telefonu + szablon dla rozwiązań bez treści), `/dla-branz/[branza]` (problemy → rozwiązania, mapa modułów, CTA do kreatora z `?firma=`). | zgodne z `Rozwiazanie-*`, `Branza-*`. | spec. §6.1, §6.2 |
| **SW11** | **Podstrony:** `/cennik`, `/audyt` (formularz `audit`), `/o-firmie`, `/jedna-firma`, `/kontakt` (z `?projekt=1`), `/aktualnosci` + wpis (wspólna trasa), `/miejscowosci/[miasto]`, strony prawne. | zgodne z planszami; formularze audytu i projektu w e2e. | spec. §6.4–6.11 |
| **SW12** | **SEO i jakość:** JSON-LD (`Service`, `ItemList`, `Article`, `BreadcrumbList`), sitemap z kolekcji, opisy meta, 301, analityka cookieless ze zdarzeniami, skan placeholderów i nazw konkurencji, Lighthouse, axe, smoke. | kryteria 6–10 ze spec. §10. | spec. §8.4, §9, §10 |
| — | **Staging → demo dla szefa → poprawki → produkcja** (`/wdrozenie`) | akceptacja szefa w Asanie; brak placeholderów na produkcji. | `docs/wdrozenia.md` |

**Plan cięcia, jeśli brakuje czasu** (tniemy od końca, jakości nie tniemy):
1. plik w kreatorze → „dosłać mailem”;
2. demo telefonu na stronie rozwiązania → statyczna makieta;
3. technologie i porównanie → wersja statyczna bez zakładek;
4. szuflada „Twój projekt” → tylko przycisk „Bezpłatna wycena” (lista po starcie).

(Branże i miejscowości nie są w planie cięcia: szablon budujemy zawsze, a liczba aktywnych stron zależy tylko od gotowych treści.)

---

## 4. Prompty do Claude Code

### 4.1 Każda sesja (podmień numer i nazwę)
```
/zadanie SW<n> — <nazwa z tabeli>
Źródła: docs/strony/prokomsoftware.md (§<sekcja>), docs/design/prokomsoftware/README.md, ADR-014, ADR-015. Wzorzec: docs/design/prokomsoftware/screens/<Plansza>-1440-light, -1440-dark, -390-light (i stany/<NN>-*.jpg), treści i wartości: docs/design/prokomsoftware/boards/<Plansza>.dc.html, dane: seed/prokomsoftware/.
Zasady: teksty przenoś z planszy bez zmian; kolory tylko z tokenów; ceny, terminy i obietnice [SZEF] wyłącznie z panelu (puste = „cena po rozmowie”); bez nazw konkurencji; każde zapytanie filtruje po tenancie; nie przenoś architektury .dc.html. Najpierw sprawdź, co z Biznesu da się użyć albo uogólnić.
Przed PR: zrzuty Playwright (1440 i 390, jasny i ciemny) porównane z screens/ i stany/ — wypisz różnice i popraw. Oczekiwana różnica: gradient H1 bez błękitu (ADR-015).
```

### 4.2 Porównanie z wzorcem (na koniec sesji z UI)
```
Zrób zrzuty Playwright pełnej strony <adres> przy 1440 i 390 px w obu motywach i porównaj je z docs/design/prokomsoftware/screens/<Plansza>-*. Dla interakcji porównaj ze stany/<NN>-*.jpg. Wypisz różnice w kolejności sekcji, tekstach, kolorach, odstępach, wysokościach i brakujących elementach. Popraw to, co odbiega, zanim otworzysz PR.
```

### 4.3 Szczegóły do poszczególnych sesji (dopisz do 4.1)

- **SW1:** „Wartości z docs/design/prokomsoftware/tokens.css przenieś 1:1 według mapy nazw w komentarzu pliku i rozstrzygnięć ADR-015. Nowe tokeny semantyczne muszą mieć wartości domyślne dla linii bez wizualizacji. Rozszerz themes.test.ts o pary z README (sekcja Kontrast). Pokaż zrzuty Biznesu przed i po — mają być identyczne.”
- **SW2:** „Kolekcje i pola dokładnie wg ADR-014 §1 i §3 (nazwy po angielsku, etykiety po polsku). Grupy Software w SiteSettings i Industries widoczne tylko dla linii software (wzorzec SiteSettings.biznes z B1b). fillFacts z testami: podmiana, brak wartości na produkcji = brak renderu. Schemat Zod kreatora sprawdź na seed/prokomsoftware/kreator.json. Migracje up → down → up. Testy dostępu, izolacji i strażnika (software).”
- **SW3:** „Seed wzoruj na pnpm seed:biznes (idempotentny, tylko lokalnie). Przeczytaj _info każdego pliku. Ceny i terminy zostają puste. Industries: 12 rekordów z branze.json → pagesAtStart, aktywny tylko budownictwo-i-wykonczenia z treścią branze.json → budowlanka. Obszary: chipy z relacją do Solutions po slugu. Indeks /api/solutions-index wzoruj na /api/catalog-index.”
- **SW4:** „Nagłówek: kolejność i pozycje ze spec. §3.1, mega menu ze stany/01-menu-oferta.jpg, Twój projekt ze stany/02-twoj-projekt.jpg, telefon ze stany/03-menu-telefon.jpg. Store pk-project — jeśli pk-cart z B4 da się uogólnić do createListStore(key), zrób to w tym PR z testami obu linii.”
- **SW5–SW8:** „Bloki strony głównej w src/sites/software/blocks/, lista dozwolona tylko dla linii software. Kolejność sekcji ze spec. §4 jest ustalona. Autoprzełączanie: pauza przy interakcji i document.hidden, brak przy prefers-reduced-motion, zakładki jako role=tablist ze strzałkami.”
- **SW7:** „Kreator: reguły wyłącznie z SoftwareSettings.wizard (bez if-ów na id potrzeb w komponentach). Odtwórz 3 ścieżki ze stany/50–52 jako testy e2e (te same kliknięcia, ten sam wynik). Kolumny wyniku równej wysokości przy 1440 px. Wysyłka przez submitInquiry() z type wizard i pełnym stanem.”
- **SW11:** „/aktualnosci jako trasa wspólna dla linii (ADR-014 §2) — sprawdź, czy Biznes już ją ma. Miejscowości: strona nieaktywna = 404 i brak w sitemap.”
- **SW12:** „Skan HTML wszystkich opublikowanych stron Software: zero placeholderów w nawiasach kwadratowych i zero nazw konkurencji (spec. §10 pkt 10; listę nazw podam w sesji, trzymaj ją tylko w pliku testu). Lighthouse wg budżetu S10.”

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
