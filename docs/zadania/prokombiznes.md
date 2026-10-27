# prokombiznes.pl — plan budowy (sesje B0–B11, potem K3/K3.1)

- **Aktualizacja 26.10.2026 (KD):** B0–B11 zbudowane i scalone (#45–#100). Przed produkcją dochodzą sesje K3/K3.1 — **§6** (ścieżka skrócona z `docs/design/prokombiznes/START-TUTAJ.md` §3). Sekcje §1–§5 to historia etapu 1.
- **Stan na:** 17.10.2026, wieczór. Fundament S1–S8, S9a (#39) i S9b-1 (#40) scalone; zostaje S9b-2 (kopie, runbook) i S10 (serwer).
- **Termin:** produkcja 26.10.2026; wersja testowa na demo 23.10.
- **Źródła prawdy (w tej kolejności):** `docs/strony/prokombiznes.md` (spec) → `docs/design/prokombiznes/` (zrzuty i plansze) → ADR-012 i ADR-013 → pozostałe ADR-y.
- **Sprawdzone 17.10:** plansze w `docs/design/prokombiznes/boards/` są identyczne z aktualną wizualizacją w Claude Design („projekt v17”, strona główna v18). Różnią się tylko adresami obrazów (`./media/…` zamiast adresów wizualizacji). Nie trzeba niczego dociągać.

Zasady jak w fundamencie:
- jedna sesja = jedna gałąź = jeden PR;
- `/zadanie B<n>` w nowej sesji, w trybie planowania;
- na koniec `/przeglad` (recenzent), porównanie ze zrzutami, `/koniec-sesji`, `/pr`.

---

## 1. Co już jest z fundamentu (nie budujemy drugi raz)

| Element spec. | Gdzie jest | Co zostaje do zrobienia w B |
|---|---|---|
| Tokeny Biznesu jasny/ciemny, gradient H1, poświata (ADR-013) | `src/styles/tokens.css`, S6b-1 | tokeny gradientów grup katalogu (B1/B3) |
| Fonty Archivo/Manrope lokalnie | S9a `next/font/local` | — |
| Motyw jasny/ciemny, `pk-theme`, skrypt bez mignięcia | `lib/brand/theme.ts`, `ThemeToggle` | przełącznik do menu pełnoekranowego na telefonie (B3) |
| Komponenty bazowe | `components/ui/*` | karty, odznaki, chipy, `Icon` (B2/B3) |
| Pasek marki, nagłówek, stopka (szkielet) | `BrandBar`, `SiteHeader`, `SiteFooter` | mega menu, Branże ▾, wyszukiwarka, licznik zapytania, stopka 5 kolumn, górny pasek z godzinami na żywo (B3) |
| Pasek promocji z datami od–do | `CompanyData.promoBar`, `PromoBar` | zamykanie z `pk-sz-closed` + id kampanii (B3) |
| Strony z bloków, rejestr bloków per linia, podgląd na żywo | S5, ADR-010, ADR-011 | bloki Biznesu w `src/sites/biznes/blocks/` (B7, B9) |
| Media z `source` i `requiresConsent`, Partners (= marki) | S7a | `Partners.slug` (+ migracja), import 93 plików (B2) |
| SEO per domena, sitemap, robots, JSON-LD Organization/LocalBusiness/FAQ, 301 | S7b | sitemap z katalogu, `Product`/`BreadcrumbList`/`Article`, `noindex` filtrów (B5, B6, B11) |
| `POST /api/inquiry`, `submitInquiry()`, antyspam, maile, retencja | S8a/S8b | pola Biznesu w `Inquiries` + 3 typy formularzy (B1, B8) |
| Obraz Docker, health, logi, smoke | S9a | strony Biznesu w `smoke.sh` (B11) |

---

## 2. B0 — decyzje przed pierwszą linijką kodu (Krystian, ok. 1 h, niedziela 18.10) — ✅ wpisane 18.10 (ADR-012 „Rozstrzygnięcia”, spec. §11)

Bez nich sesja B1 zbuduje model, który trzeba będzie przerabiać migracjami. Każdą decyzję wpisz w ADR-012 („Rozstrzygnięcia”) albo w spec. i zmień status ADR-012 na „przyjęta”.

### 2.1 ADR-012: ostatnie rozbieżności (rekomendacje)
1. **Nazwy w kodzie po angielsku, etykiety w panelu po polsku** (zgodnie z CLAUDE.md):
   - kolekcje `CatalogGroups`, `CatalogCategories`, `Industries`, `Products`, `Posts`;
   - nazwy pól z ADR-012 tłumaczymy 1:1 (`nazwa` → `name`, `kolejnosc` → `order`, `pasujeDo` → `fitsWith` itd.).
2. **„Globale na tenant” nie powstają jako nowe globale:**
   - wspólne dane firmy → `CompanyData`;
   - dane linii (telefon i e-mail działów, WhatsApp, miejscowości, obietnice, linia zaufania, nawigacja) → `SiteSettings`, w grupach pól widocznych tylko dla linii Biznes;
   - konfiguracja wyszukiwarki i kreatora → jedna kolekcja `BiznesSettings` (jeden dokument na tenanta, jak `SiteSettings`), żeby `SiteSettings` innych linii nie puchło.
3. **Pasek sezonowy = istniejący `CompanyData.promoBar`** plus pole `campaignId`.
4. **Strony specjalne `/opieka-it`, `/gopos`, `/insert`, `/o-firmie`, `/kontakt` to `Pages` z blokami Biznesu (ADR-010):**
   - szef zmienia teksty bez programisty;
   - logika (kalkulator, eksplorator modułów, dobór programu InsERT) jest w komponencie bloku, a w panelu są tylko treści i konfiguracja.
5. **Trasy katalogu tylko na domenie Biznesu:**
   - dotyczy `/oferta`, `/oferta/[kategoria]`, `/produkt/[slug]`, `/branze/[branza]`, `/aktualnosci`, `/kreator`, `/zapytanie`;
   - mają strażnika linii, więc na innych domenach zwracają 404;
   - test izolacji jak w S3.

### 2.2 Uwagi szefa z 16.10 (Asana „Biznes: wprowadzenie uwag szefa z wizualizacji”), których nie ma w spec.
| Uwaga | Rekomendacja na 26.10 | Wpływ na B1/B2 |
|---|---|---|
| Nowa branża: beauty | 7. rekord `Industries` „Beauty i usługi” z `active=false` („Wkrótce”); w kreatorze już jest | +1 rekord w seedzie |
| Nowa kategoria: maszyny vendingowe (Elzab) | 21. kategoria w grupie „Kasy i sprzedaż”, 1–2 produkty po sprawdzeniu oferty Elzab | +1 kategoria, +produkty (fakty ze źródłem) |
| Połączyć „Branże” i „Dobierz rozwiązanie” | na stronie branży CTA „Przygotuj ofertę dla [branża]”, które otwiera kreator z wybranym rodzajem firmy (`/kreator?firma=gastro` — wartość to rodzaj firmy z kreatora, nie slug branży; ADR-012 rozstrzygnięcie 8); bez przeprojektowania | parametr w kreatorze (B10) |
| Kafelki „Oferta” i „Opieka IT” spójne | ten sam komponent karty w hero/kafelkach | B7 |
| Oferta czytelniejsza, większa czcionka | mega menu i katalog: min. 15–16 px dla nazw kategorii, mniej elementów na kolumnę | B3, B5 |
| Produkt w kilku branżach, widoczny tylko w nich | jest w modelu (`Products.industries`) | B1 |
| Referencje i polecenia od razu | sekcja 8 strony głównej z flagą widoczności | B7 |
| Tryb ciemny na całej stronie | jest (S6b-1) | — |
| Osobna podstrona Kontakt | jest w spec. | B8 |

### 2.3 Telefony, e-maile i godziny działów (zadanie Asana na 20.10, odpowiedź szefa)
- **Model (rekomendacja):** w `SiteSettings` lista `contactChannels` z polami: dział (opieka IT, kasy fiskalne, oprogramowanie, sprzęt, dofinansowania), telefon, e-mail, godziny i flaga „pokaż w stopce”. Strony działów i formularz z danym tematem biorą kanał działu, a w nagłówku zostaje jeden numer główny.
- **Poziomy godzin z umów (standard 9–17, PRO 7–21, VIP 24/7) to treść strony `/opieka-it`, nie godziny otwarcia.** Status „Otwarte teraz” liczymy z godzin biura.
- B1 buduje pola. Wartości wpisuje szef albo Krystian w panelu, kiedy będą znane, bez blokowania kodu.

### 2.4 Do przyjęcia
- **ADR-011** (podgląd przez token, cron w procesie) — dziś „proponowana”, a działa w kodzie od S5. Przyjąć.

---

## 3. Sesje

| # | Kiedy | Zadanie | Gotowe, gdy | Plansze / spec. |
|---|---|---|---|---|
| **B1** | 18.10 | **Model danych:**<br>• kolekcje z ADR-012 (po B0);<br>• `Partners.slug` (+ migracja; `partnerStatus` jest od S7a);<br>• pola Biznesu w `SiteSettings`, `BiznesSettings`;<br>• rozszerzenie `Inquiries` (`number`, `type`, `items[]`, `wizard`, `topics`, `deadline`, `preferredContact`);<br>• dostęp wg ról, indeksy z prefiksem;<br>• strażnik linii dla tras katalogu. | migracje `up` → `down` → `up` czyste; testy dostępu i izolacji; w panelu widać kolekcje. | ADR-012 §1–3, spec. §8.4 |
| **B2** | 18–19.10 | **Import danych i indeks:**<br>• `pnpm seed:biznes` z `seed/prokombiznes/` (idempotentny, `legacyId`): 67 produktów, 27 marek, 5 grup, 93 obrazy do `Media` ze `source` i `requiresConsent`;<br>• kategorie: 20 z paczki + „maszyny vendingowe” (decyzja B0), branże: 6 z paczki + „Beauty i usługi” (`active=false`) — dopisane w seedzie, bo paczka ich nie ma; produkty vendingowe Elzab tylko ze źródłem, inaczej `TODO(krystian)`;<br>• `GET /api/catalog-index` z tagiem `catalog`;<br>• komponent `Icon` z `ikony.json`. | w panelu 67 produktów ze zdjęciami; indeks ma mniej niż 50 KB gzip; logo klientów niewidoczne publicznie. | ADR-012 §2.4, §4; `media.json` |
| **B3** | 19.10 | **Elementy wspólne** (podział 18.10: **B3a** — dane `nawigacja` + migracja, górny pasek z godzinami, nagłówek desktop z mega menu Oferta i Branże ▾; **B3b** — menu pełnoekranowe i dolny pasek na telefonie, stopka 5 kolumn, pasek sezonowy z zamykaniem)**:**<br>• górny pasek z godzinami na żywo;<br>• nagłówek z mega menu Oferta i Branże ▾ — **z danymi mega menu w `SiteSettings` (`nawigacja` z ADR-012: kolejność menu, karty, branże w menu; przesunięte z B1b) + migracja**;<br>• stopka 5 kolumn;<br>• telefon: menu pełnoekranowe i dolny pasek;<br>• pasek sezonowy z zamykaniem. | zgodne z `Main` 01.jpg i `Mobile`; mega menu i menu działają z klawiatury; axe bez naruszeń. | spec. §3; `Main`, `Mobile`, `Mapa` |
| **B4** | 19–20.10 | **Lista zapytania i wyszukiwarka** (podział 20.10: **B4a** — `lib/search.ts` i nakładka wyszukiwarki; **B4b** — store `pk-cart`, szuflada, toast, liczniki)**:**<br>• store `pk-cart` (`useSyncExternalStore`), szuflada, toast;<br>• `lib/search.ts` (normalizacja, synonimy, Damerau-Levenshtein, punktacja) z testami na przykładach ze spec. §9;<br>• nakładka wyszukiwarki z obsługą `/` i Esc. | kryteria 2 i 3 ze spec. §9. | spec. §8.1–8.2; `__pk17` w `Main.dc.html` |
| **B3c** | 21.10 | **Poprawka nagłówka wg v20** (`docs/design/prokombiznes/ZMIANY-v20.md` §1.1–1.2; prompt: `PRZEKAZANIE-v20.md`)**:**<br>• menu: Oferta ▾ · Opieka IT · GoPOS · InsERT · O firmie · Kontakt — bez „Branże ▾” i jego listy (także w menu na telefonie);<br>• na dole mega menu „Rozwiązania dla branż: gastronomia, handel, hotele →”;<br>• wyszukiwarka jako lupa 44×44 („Szukaj w ofercie (skrót /)”), ta sama nakładka;<br>• `nowrap`, odstęp 26 px, hamburger poniżej 1080 px;<br>• górny pasek bez „Pomoc zdalna”. | Playwright: brak poziomego przewijania przy 1100, 1280, 1440 px; menu z klawiatury; axe bez naruszeń; zgodne ze `screens/Main-1440-*/01.jpg`, `Mobile-390-light/01.jpg`. | spec. §3.1–3.2 (v20) |
| **B5** | 20.10 | **Katalog `/oferta`** (dane katalogu v2 po K1 — `ZMIANY-katalog-v2.md` §4: chip podkategorii w `akc` i `kody` do dołożenia; „Pokaż kolejne”, liczniki i „Pokaż wszystkie marki” działają na 225 pozycjach) (podział 21.10: **B5a** — logika filtrów i URL, strona, filtry na desktopie, karty z „+ Do zapytania”, „Pokaż kolejne” + `?strona=`, SEO, prosty pusty wynik; **B5b** — arkusz filtrów na telefonie, widok listy, karty promocyjne, pełny pusty wynik, `HowInquiryWorks`; sekcja „Szukasz czegoś, czego nie ma w katalogu?” z formularzem → B8; 12 pozycji na stronę wg spec. §5.3, plansza ma 18)**:**<br>• filtry w URL z licznikami fasetowymi;<br>• sortowanie, siatka i lista, „Pokaż kolejne” + `?strona=`;<br>• karta produktu i karty promocyjne;<br>• pusty wynik;<br>• arkusz filtrów na telefonie;<br>• `noindex` + `canonical` dla filtrów. | kryterium 4; zgodne z `Katalog`, `KatalogM`. | spec. §5; ADR-012 §2.2 |
| **K1** | 22.10 | **Katalog v2 — dane i model** (`docs/design/prokombiznes/ZMIANY-katalog-v2.md`, prompt: `PRZEKAZANIE-katalog-v2.md`; łatka przyszła po B5, więc K1 idzie przed B6)**:**<br>• `Products`: `subcategory`, `variants`, `sources`, `contentStatus`, `batch`, `legacyIds` (galeria = `images`) + migracje;<br>• kategorie `wagi`, `kody`, nowe nazwy `akc` i `vend`;<br>• `seed:biznes`: 225 pozycji, 32 marki, 23 kategorie, 567 zdjęć galerii; aktualizacja zamiast duplikatów. | migracje `up` → `down` → `up` czyste; dwa uruchomienia seeda = te same liczby; 225 pozycji w bazie z galeriami; indeks < 50 KB gzip; test „zero cen”. | ADR-012 rozstrz. 12; spec. §5, §7 |
| **B4c** | przed 26.10 | **Wyszukiwarka na 225 pozycjach** (znalezione w K1)**:**<br>• nazwa grupy jest w `hay` każdego produktu — „kasa” trafia we wszystkie 159 pozycji „Kasy i sprzedaż”, liczniki kategorii stawiają „Skanery…” (74) przed kasami;<br>• niższa waga trafienia tylko w nazwę grupy albo kategorie z trafień w nazwę/kategorię/cechy. | „kasa” → kasy fiskalne pierwsze w kategoriach; test „KNOWN BUG” w `src/lib/search.test.ts` zamieniony na oczekiwanie `kasy-fiskalne`; frazy spec. §9 dalej zielone. | spec. §8.2, §9 |
| **B6** | 20.10 | **Produkt `/produkt/[slug]`** (dane katalogu v2 — `ZMIANY-katalog-v2.md` §4: galeria z `images` bez hotspotów dla nowych pozycji, lista `variants`, zakładka „Dokumenty” z linkami `sources.datasheets`; pozycje „Do sprawdzenia” wyglądają tak samo)**:**<br>• galeria z hotspotami;<br>• boks sticky, zakładki;<br>• „Skompletuj stanowisko”, alternatywy, podobne;<br>• JSON-LD `Product` bez `offers` + `BreadcrumbList`. | zgodne z `Produkt` jasny i ciemny. | spec. §6.2 |
| **B7** | 21.10 | **Strona główna według v20 (13 sekcji, `ZMIANY-v20.md` §2 ma pierwszeństwo; prompt: `PRZEKAZANIE-v20.md`):**<br>• bloki Biznesu;<br>• koło 5 działów;<br>• Oferta (5 kart działów z witryną, 3 karty flagowe) i Najczęściej wybierane (8 pozycji);<br>• plan firmy w wersji statycznej + siatka branż (ADR-012 rozstrzygnięcie 11) + dofinansowania;<br>• krótsza „Pięć firm czy jedna”;<br>• karta faktów, 3 ostatnie wpisy, FAQ w kartach z JSON-LD;<br>• układ formularza kontaktowego (logika w B8);<br>• flagi opinii i logo klientów;<br>• **bez** „Masz konkretną sprawę?” (szybkie sprawy), paska „Ostatnio u nas” i pomocy zdalnej. | zgodne z `Main` i `Mobile` (v20) w obu motywach; animacje wyłączane przez `prefers-reduced-motion`; przycisk główny-link zawsze z białym tekstem (axe). | spec. §4 (v20); `ZMIANY-v20.md` §2 |
| **B8** | 21.10 | **Formularze:**<br>• `/zapytanie` (pozycje, uwagi, pola dodatkowe, ekran sukcesu z numerem zgłoszenia);<br>• `/kontakt` (statyczna mapa, karty kanałów, LocalBusiness);<br>• formularz kontaktowy według v20 (jeden ekran, bez tematów; ten sam komponent na stronie głównej i `/kontakt`; e-mail z `SiteSettings`);<br>• 3 typy przez `submitInquiry()`, mail z pełną listą. | kryterium 5; testy Playwright 3 typów i walidacji, także przy 390 px. | spec. §6.3, §6.9, §8.4 (v20); `ZMIANY-v20.md` §2.9 |
| **B9** | 22.10 | **`/opieka-it`, `/gopos`, `/insert`:**<br>• bloki z kalkulatorem przestoju (liczony w przeglądarce);<br>• eksplorator modułów, 3 zestawy „Dodaj zestaw do zapytania”;<br>• dobór programu InsERT;<br>• licznik dni do KSeF. | zgodne z `Dzial`, `Gopos`, `Insert`. | spec. §6.4–6.6 |
| **B10** | 22.10 | **Kategoria, branże i kreator:**<br>• szablon kategorii (bez porównywarki), dobór kas;<br>• 3 branże aktywne i „Wkrótce” dla reszty, CTA do kreatora z parametrem;<br>• kreator z regułami jako danymi. | zgodne z `Kategoria`, `Branza`, `Kreator`. | spec. §6.1, §6.7, §6.8 |
| **B11** | 23.10 rano | **O firmie, Aktualności, wpis KSeF, strony prawne, mapa strony:**<br>• **`/aktualnosci` i `/aktualnosci/[slug]` jako trasa wspólna dla linii, poza `(biznes)`** — układ wg linii tenanta, wpisy z `Posts` tenanta, 404 na linii bez Aktualności (ADR-012 rozstrz. 5, zmiana 22.10.2026; Software dokłada wygląd w SW11b);<br>• sitemap z katalogu, `Article`;<br>• Lighthouse (telefon) i axe na wszystkich szablonach;<br>• `smoke.sh` ze stronami Biznesu. | kryteria 6–9; zrzuty wszystkich plansz porównane. | spec. §6.9, §9 |

**Równolegle (infrastruktura, bez nich nie ma demo ani produkcji):**

| Kiedy | Co | Uwaga |
|---|---|---|
| 18–19.10 | S9b-2 (kopie, odtworzenie, runbook) | S9b-1 scalone (#40); S9b-2 może iść równolegle z B1/B2 w osobnej gałęzi |
| **pn 19.10 rano** | **zakup 3 domen + zamówienie VPS w Seohost** | potwierdzone 17.10: domeny i VPS w poniedziałek 19.10; termin w Asanie (23.10) byłby za późno na DNS, certyfikaty i staging przed demo |
| 20–21.10 | S10: serwer, DNS, certyfikaty, staging, kopie, monitoring | staging potrzebny do demo #2 (23.10) |
| do 22.10 | skrzynka `biznes@pro-kom.eu`, SPF/DKIM/DMARC domeny nadawcy, test mail-tester | formularze bez tego lądują w spamie |
| 23.10 | demo #2 na stagingu → uwagi szefa | |
| 24–25.10 | poprawki z demo, treści [SZEF], polityka prywatności | |
| 26.10 | produkcja wg `/wdrozenie produkcja` | akceptacja szefa w Asanie przed merge do `main` |

**Plan awaryjny** (spec. §10, tniemy od końca, nie jakość):
1. Plan firmy zostaje statyczny.
2. Wypadają branże 2 i 3.
3. Wypada kreator: CTA prowadzi wtedy do formularza.
4. Ostatecznie B9 wchodzi ze stronami GoPOS/InsERT bez interaktywnych dodatków (eksplorator, dobór).

Katalog, produkt, zapytanie i kontakt nie podlegają cięciu.

**Ryzyko terminu:** 11 sesji B w 6 dni (18–23.10) obok S9b-2, S10, DNS i poczty — wykonalne tylko przy B0 skończonym w niedzielę i odpowiedziach szefa (§2.3, §13 spec.) do 20.10. Plan cięcia pokazać szefowi od razu, nie 25.10.

---

## 4. Zasady dla każdej sesji B (dopisz do promptu)

- **Teksty z plansz przenosimy bez zmian.** Punkty [SZEF] to pola w panelu z tekstem z planszy.
- **Nie przenosimy architektury `.dc.html`** (`<sc-for>`, `DCLogic`, globalne tablice).
  - Server Components domyślnie.
  - Interaktywne wyspy (mega menu, wyszukiwarka, koszyk, filtry, koło, kreator, kalkulator) jako małe `"use client"`.
  - Strona główna nie może ładować całego katalogu do przeglądarki. Indeks pobierany jest dopiero przy otwarciu wyszukiwarki albo na `/oferta`.
- **Kolory tylko z tokenów** (test „bez gołych kolorów”). Gradienty grup jako tokeny albo dane z `CatalogGroups`.
- **Zero cen, słów „leasing” i „raty” oraz logowania klientów.** Dopisz test e2e, który przeszukuje tekst wszystkich szablonów.
- **Każda nowa trasa katalogu działa tylko na domenie Biznesu** i ma na to test.
- **Obrazy:**
  - przez `MediaImage`;
  - wymagany `alt`;
  - `requiresConsent=true` nigdy nie renderuje się publicznie.
- **Fakty prawne i liczby partnerów** (KSeF, ulga, statystyki GoPOS) tylko ze źródłem w treści albo w polu „źródło”. Bez źródła: `TODO(krystian)`, a pole zostaje puste.
- **Na koniec sesji z UI:**
  - zrzuty Playwright 1440 i 390 px w obu motywach, porównane z `docs/design/prokombiznes/screens/`;
  - w opisie PR lista różnic.

### Prompt startowy sesji (wzór)
```
/zadanie B<n> — <nazwa> (docs/zadania/prokombiznes.md)
Źródła: docs/strony/prokombiznes.md §<…>, docs/design/prokombiznes/README.md, ADR-012 (z rozstrzygnięciami B0), ADR-013.
Wzorzec: docs/design/prokombiznes/screens/<Plansza>-1440-light/ (+ -390, -dark), treści i wartości: boards/<Plansza>.dc.html.
Najpierw sprawdź, co z tej sesji już istnieje w kodzie (tabela §1 planu) — nie buduj drugi raz.
Zasady: §4 planu. Plan maks. 15 linii, czekaj na „ok”.
```

---

## 5. Przed produkcją 26.10 — lista nie-kodowa (Krystian + szef)

1. **[SZEF] ze spec. §13:**
   - godziny i NIP;
   - obietnice (60 min, przegląd IT, kasa w cenie, przejęcie serwisu);
   - nazwy statusów partnerów (skany);
   - ulga 700 zł ze źródłem;
   - 2 opinie Google;
   - logo klientów (pisemne zgody);
   - cytat właściciela;
   - 12 wyróżnionych produktów.
2. **Kanały kontaktu działów i godziny** (§2.3).
3. **Treść polityki prywatności i strony cookies:**
   - administrator danych, cele, retencja zapytań 24 mies., logi Nginx;
   - `TODO(krystian)` w `src/lib/inquiry/consent.ts`.
4. **Wpis KSeF i min. 2 kolejne wpisy w Aktualnościach**, każdy fakt z linkiem i datą weryfikacji.
5. **Parametry Elzab i Fawag** sprawdzone na stronach producentów; produkty vendingowe Elzab.
6. **Prawo do zdjęć i logo producentów** (materiały partnerskie). Przy każdym obrazie wypełnione `source`.
7. **Panel:**
   - konto szefa (rola `editor`);
   - ochrona ostatniego admina (pomysł z S2 — przed produkcją);
   - panel po polsku (`i18n`) — opcjonalnie, ale szef będzie z niego korzystał.
8. **Po starcie:** Search Console, sitemap, Profil Firmy w Google (zadanie w Asanie na 21.10).

---

## 6. Etap K3/K3.1 — sesje przed produkcją (od 26.10.2026)

Źródła: `docs/design/prokombiznes/INDEKS.md` (kolejność ważności: `MOBILE-APLIKACJA.md` → `K31-ZMIANY.md` → `K3-KATALOG.md` → `ZMIANY-v20.md` → spec.), spec. `docs/strony/prokombiznes.md` (streszczenie K3/K3.1 i decyzje repo), ADR-012 „Rozstrzygnięcia K3 i K3.1” (rozstrz. 14–21), ADR-016 (filmy). Gotowe prompty: `PRZEKAZANIE-K3.md` §5, `K3-KATALOG.md` §11, `PRZEKAZANIE-K31.md` §4, `AUDYT-PRODUKCJA.md` §9 — wklejasz je **z dopiskami z §6.2**.

**Zastąpione (nie budujemy):** K2 (import treści katalogu v2) — zastąpione przez K3 (nie było importowane); B7b z `AUDYT-B11.md` §9 — zastąpione przez K3; **B7b (K3)** z `K3-KATALOG.md` §11 — zastąpione przez **K31d**; strona produktu w wersji K3 (`K3b`) — budowana od razu jako produkt 2.0 w K31b, a reszta K3b jako **K3b′**.

### 6.1 Sesje (ścieżka skrócona)

| # | Sesja | Prompt | Zakres | Gotowe, gdy (+ wspólne kryteria §6.3) |
|---|---|---|---|---|
| 1 | ~~**W**~~ — wgranie K3 + K3.1 | `PRZEKAZANIE-K3.md` §5 W-K3 + `PRZEKAZANIE-K31.md` §4 W-K31 | paczki w `docs/` i `seed/`, bez kodu | ✅ #110 (25.10) |
| 2 | ~~**KD**~~ — dokumenty K3 + K3.1 | „KD” + „KD31” | spec., ADR-012, ADR-016, ten plan, CLAUDE.md, STAN | ✅ ten PR (26.10) |
| 3 | **F1** — poprawki po audycie B11 | `AUDYT-B11.md` | **TODO(krystian): status nieustalony** — pliku `AUDYT-B11.md` nie ma w repo, w historii brak F1. Przed K3a: zrobione / odpuszczone / wgrać plik i dopisać zakres. Z F1 wiemy tylko tyle, co cytują paczki: `noindex` dla kart „do sprawdzenia” i liczniki z bazy (F1 pkt 6) — jeśli F1 odpada, te dwie rzeczy robią K3a i K31d | — |
| 4 | **K3a** — model i import K3 | `K3-KATALOG.md` §11 „K3a” | pola `Products`/`Partners`/`CatalogCategories` (ADR-012 rozstrz. 15), migracja, `seed:biznes` z `seed/prokombiznes/k3/`, 301 dla usuniętych i zastąpionych, karty `do-akceptacji-szefa` nieopublikowane, `noindex` dla `do-sprawdzenia`, test „zero cen” + zakazane marki | panel: 243 karty (3 nieopublikowane); import 2× = te same liczby; stary adres produktu → 301 (test); raport bez dopasowania; zrzuty katalogu 1440/390 |
| 5 | **K31a** — import K3.1, w 2 PR-ach (26.10): **K31a-1** katalog (karty, serie, filmy produktów, podział, uzupełnienia, wyróżnione, filtr źródeł), **K31a-2** salony, plany, zadanie oEmbed | `PRZEKAZANIE-K31.md` §4 „K31a” | 26 kart + 91 zdjęć, `series`, `videos` (+ zadanie oEmbed, ADR-016), dane salonów w `Partners`, ~~treści GoPOS/InsERT/O firmie/Kontakt do bloków stron~~ (→ K31e, decyzja 26.10), `FloorPlans` (12 scen, bez zestawów — te w K3c), podział 6 kart (+ 301), uzupełnienia treści, `featured` z `strona-glowna-k31.json`, filtr dozwolonych domen źródeł | 269 kart / 266 widocznych przed podziałem; po podziale +11 `do-sprawdzenia` i 5 × 301 (raport); 24 nowe karty z galerią; Lenovo 44 i Dell 34 — każda w jednej serii; 12 scen / 186 punktów, 0 punktów bez karty; liczba produktów z filmem zgodna z raportem (122); każda widoczna karta ≥ 3 FAQ; import 2× = te same liczby |
| 6 | **K31b** — produkt 2.0, studio, stopka | `PRZEKAZANIE-K31.md` §4 „K31b” + dopisek „to jest pierwsza wersja strony produktu po K3 — zbuduj ją od razu wg K31-ZMIANY §4; K3-KATALOG §5 (Wybierz wersję, FAQ, W zestawach) jest w niej zawarty” | spec. §6.2, §3.8, §3.4, §6.13; akapit o YouTube w `/cookies` (seed `legal.ts`); nazwa sekcji zamiast „W PRO-KOM w cenie” | ThinkBook 14 G8/G9, Posnet Ergo, ThinkPad X9 (galeria), ThinkPad P1 Gen 9 (zastępnik) zgodne z `k31/screens/Web-Produkt-*`; nigdzie siatki za zdjęciem; 0 pustych `<img>`; zero żądań do YouTube przed „▶” (test sieci); e2e: wersja → dodaj → notatka w zapytaniu i w mailu (Mailpit); stopka jak `Web-*-1440` |
| 7 | **K3b′** — marki, kategorie, wyszukiwarka | `K3-KATALOG.md` §11 „K3b” + dopisek „bez strony produktu (jest z K31b)” | `/marki/[slug]` (szablon), podkategorie (chipy + adresy `/oferta/{kategoria}/{podkategoria}`), mega menu z podkategoriami, wyszukiwarka z markami i aliasami (< 50 KB gzip), sitemap; nazwa sekcji „W cenie” w kategorii; **stopka „Oferta”: Salon Lenovo, Salon Dell** (K31b zostawił je do czasu trasy, decyzja 27.10) | 2 marki zgodne z `k3/screens/Web-Marka*`; „laptop” daje laptopy; podkategorie komputerów mają własne adresy z canonical; JSON-LD `Brand` bez błędów |
| 8 | **K31c** — salony Lenovo i Dell | `PRZEKAZANIE-K31.md` §4 „K31c” | salon na `/marki/lenovo`, `/marki/dell`; kategoria komputerów z filtrem serii (`?seria=`) | dział Akcesoria i seria Dell Plus; klik w serię filtruje; dobór w 3 pytaniach: 3 kombinacje → oczekiwane serie (test jednostkowy reguł); zrzuty zgodne z `Web-Marka-*`, `Web-Kategoria-1440` |
| 9 | **K3c** — gotowe zestawy | `K3-KATALOG.md` §11 „K3c” | `Bundles` + import, `/zestawy`, `/zestawy/[slug]`, „W zestawach” na produkcie, sekcja na stronach branż, zestawy w wyniku kreatora, „Gotowe zestawy” w menu, **relacja `FloorPlans.bundles` + import zestawów scen** (ADR-012 konsekwencje); stopka „Oferta”: Gotowe zestawy | `/zestawy` i 2 zestawy zgodne ze wzorcem; „Zapytaj o ten zestaw” na `zestaw-kawiarnia-lada` dodaje 5 obowiązkowych pozycji (+ zaznaczone opcjonalne) z notatką; `ItemList` bez błędów; test „zero cen” zielony |
| 10 | **K31d** — Plan Twojej firmy 2.0 | `PRZEKAZANIE-K31.md` §4 „K31d” | spec. §6.12; komponent na `/plan-firmy` i na głównej (zamiast planu z B7c); „Najczęściej wybierane” na studio; liczniki z bazy; stopka „Oferta”: Plan Twojej firmy — wtedy kolumna = 5 linków z K31-ZMIANY §11.4 zamiast grup katalogu | 12 scen = 186 punktów, każdy z kartą i zdjęciem; popup: film po lewej (iframe dopiero po kliknięciu), Esc/strzałki, focus trap; telefon: arkusz z filmem; stary plan v20 zniknął; „Najczęściej wybierane” = 8 pozycji z panelu; e2e: punkt → film → dodaj |
| 11 | **K31e** — GoPOS, InsERT, O firmie, Kontakt 2.0 | `PRZEKAZANIE-K31.md` §4 „K31e” | spec. §6.5, §6.6, §6.9 — bloki stron (nie globale) **i import ich treści** (`strony-gopos-insert-k31.json`, `firma-k31.json`, filmy `wideo-k31.json → strony`; przeniesione z K31a 26.10); przy dużym zakresie O firmie i Kontakt jako **K31f** | hero GoPOS jak wzorzec; pakiet z 3 modułami → 3 pozycje; klik „Kuchnia” podświetla KDS; InsPunkty 40 + 30 → 70 / 840; „Który Subiekt”: 3 kombinacje → 123 / GT / nexo; formularz kontaktu zapisuje zgłoszenie; `/o-firmie`, `/kontakt` jak wzorzec — tylko Rabka i biznes@ |
| 12 | **M1** — telefon jak aplikacja | `K3-KATALOG.md` §11 „M1” + dopisek z `PRZEKAZANIE-K31.md` §4 | `MOBILE-APLIKACJA.md` w całości (ma pierwszeństwo przed promptem): szkielet, arkusze, 29 ekranów | 390 px vs `k31/screens/App-*` (i `k3/screens/App-*`) w obu motywach; dolny pasek, menu i filtry jako arkusze (gest w dół), przyklejone CTA; 0 poziomego przewijania przy 360/390/414 na każdej trasie; Lighthouse mobile ≥ 90; e2e: produkt → wersja → dodaj → zapytanie → wyślij |
| 13 | **PROD** — gotowość produkcyjna | `AUDYT-PRODUKCJA.md` §9 „PROD” — **po odjęciu tego, co już jest** (niżej) | status i opiekun zapytań (`Inquiries.status`, `owner`); analityka bez cookies (**najpierw ADR** — Umami to nowy kontener); nagłówki bezpieczeństwa (CSP z `frame-src` youtube-nocookie, ADR-016), `robots` bez `/admin` i `/api`; mega menu (Plan, Salony), szyna „Realizacje” → „Dla kogo”, ukryty przegląd IT (stopka, mega menu, plakietka „0 zł”); **kreator: wynik = gotowy zestaw**; opcjonalnie manifest PWA | e2e: wysłane zapytanie → mail w Mailpit + rekord „nowe”; brak skryptu analityki bez env; nagłówki w odpowiedzi; zrzuty mega menu i stopki |
| 14 | **Staging** | `AUDYT-PRODUKCJA.md` §9 (lista kontrolna), `/wdrozenie staging` | formularze i maile na prawdziwym SMTP (migracja poczty 30.10), Lighthouse, oEmbed filmów, tryb ciemny, Android + iPhone; przeniesienie treści (STAN „W toku” → „Produkcja”) | zapytanie dochodzi na biznes@ i do Krystiana; Lighthouse telefon ≥ 90 (główna, katalog, produkt, plan, GoPOS); akceptacja szefa w Asanie → `/wdrozenie produkcja` |

**Już zrobione z listy PROD** (`AUDYT-PRODUKCJA.md` pisze, że brak — stan repo 26.10): strony `/polityka-prywatnosci`, `/cookies`, `/dostepnosc` i `/mapa-strony` (B11b, #99 — treści prawne to projekty do akceptacji); zgoda RODO z wersją klauzuli przy formularzach (S8b); honeypot, minimalny czas i limit zgłoszeń z IP (S8a); mail do biura i potwierdzenie dla klienta (S8/B8a). PROD sprawdza je, nie buduje drugi raz; klauzula informacyjna pod formularzem — porównać z `consent.ts` i dopisać tylko brakujące.

**Kolejność cięcia przy braku czasu** (`AUDYT-PRODUKCJA.md` §10 — od końca, nie jakość): 1) K31c (do czasu salonu — szablon marki z K3b′); 2) K31e (GoPOS/InsERT, O firmie i Kontakt zostają z etapu 1); 3) kreator i branże poza gastronomią → listopad. **Bez cięć:** K3a, K31a, K31b, K3b′, K3c, K31d, M1, PROD. Decyzja szefa: kolejność Biznes vs Gaming do 20.11 (**TODO(krystian)**).

### 6.2 Dopiski do każdego promptu z paczek
Paczki piszą nazwami swoich plansz. Do promptu sesji dopisz:
```
Decyzje repo (ADR-012 „Rozstrzygnięcia K3 i K3.1”, spec. §2) wygrywają z nazwami z paczki:
- adresy: /oferta/{slug kategorii}/{slug podkategorii}, nie /katalog/{kod}/…; kody K3 → slugi przez CATEGORY_SLUGS;
- marki = kolekcja Partners (nie Brands); „globale” GoposPage/InsertPage/AboutPage/ContactPage = strony Pages z blokami Biznesu; Company = CompanyData + SiteSettings; HomePage.featured = Products.featured + featuredOrder; Products.aliases = Products.keywords; Bundles i FloorPlans = kolekcje z tenantem;
- notatki (wersja, zestaw, plan, pakiet) = uwaga pozycji listy zapytania;
- filmy wg ADR-016.
Wzorzec: k31/screens/<plik> (gdzie K3.1 nic nie zmienia — k3/screens/), wartości i stany: k31/boards/ albo k3/boards/<plik>.dc.html (podgląd: PRZEKAZANIE-K3 §4). Teksty i odstępy z planszy; dane z bazy.
Najpierw sprawdź, co już jest w kodzie (B0–B11) — nie buduj drugi raz.
```

### 6.3 Wspólne kryteria „Gotowe” (każda sesja z UI)
- **Telefon wg `MOBILE-APLIKACJA.md` §4:** 0 poziomego przewijania przy 360/390/414 px (test Playwright na zmienionych trasach), cele dotykowe ≥ 44 px, zrzut 390 zgodny z `App-*` — telefon jest częścią zakresu sesji, nie poprawką na koniec (M1 dokłada szkielet aplikacji i ekrany, których nie dotknęła żadna sesja).
- Zrzuty Playwright 1440 i 390 px w obu motywach porównane z `k31/screens/` (potem `k3/screens/`, `screens/` v20); w opisie PR lista różnic.
- axe bez błędów; test „zero cen” i zakazane marki zielone; dane z bazy, nic na sztywno; pola wewnętrzne paczek nigdy na stronie.
- `/przeglad` (recenzent), `/koniec-sesji`, `/pr`; jedna sesja = jedna gałąź (od `origin/develop`) = jeden PR; plan maks. 15 linii przed kodem.
- Dane w seedzie wyglądają źle → raport w PR, poprawka przez seed/panel, nie na sztywno w kodzie. Pomysł spoza zakresu → STAN „Pomysły na później”.

### 6.4 Poza kodem (równolegle)
Listy: `START-TUTAJ.md` §5, `PRZEKAZANIE-K3.md` §6, `PRZEKAZANIE-K31.md` §5, `AUDYT-PRODUKCJA.md` §5 i §11; arkusze `K3-przeglad.xlsx`, `K31-przeglad.xlsx` (u Krystiana, poza repo). Zbiorczo w spec. §13 pkt 13–20.
