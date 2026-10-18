# prokombiznes.pl — plan budowy (sesje B0–B11)

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
| **B3** | 19.10 | **Elementy wspólne:**<br>• górny pasek z godzinami na żywo;<br>• nagłówek z mega menu Oferta i Branże ▾ — **z danymi mega menu w `SiteSettings` (`nawigacja` z ADR-012: kolejność menu, karty, branże w menu; przesunięte z B1b) + migracja**;<br>• stopka 5 kolumn;<br>• telefon: menu pełnoekranowe i dolny pasek;<br>• pasek sezonowy z zamykaniem. | zgodne z `Main` 01.jpg i `Mobile`; mega menu i menu działają z klawiatury; axe bez naruszeń. | spec. §3; `Main`, `Mobile`, `Mapa` |
| **B4** | 19–20.10 | **Lista zapytania i wyszukiwarka:**<br>• store `pk-cart` (`useSyncExternalStore`), szuflada, toast;<br>• `lib/search.ts` (normalizacja, synonimy, Damerau-Levenshtein, punktacja) z testami na przykładach ze spec. §9;<br>• nakładka wyszukiwarki z obsługą `/` i Esc. | kryteria 2 i 3 ze spec. §9. | spec. §8.1–8.2; `__pk17` w `Main.dc.html` |
| **B5** | 20.10 | **Katalog `/oferta`:**<br>• filtry w URL z licznikami fasetowymi;<br>• sortowanie, siatka i lista, „Pokaż kolejne” + `?strona=`;<br>• karta produktu i karty promocyjne;<br>• pusty wynik;<br>• arkusz filtrów na telefonie;<br>• `noindex` + `canonical` dla filtrów. | kryterium 4; zgodne z `Katalog`, `KatalogM`. | spec. §5; ADR-012 §2.2 |
| **B6** | 20.10 | **Produkt `/produkt/[slug]`:**<br>• galeria z hotspotami;<br>• boks sticky, zakładki;<br>• „Skompletuj stanowisko”, alternatywy, podobne;<br>• JSON-LD `Product` bez `offers` + `BreadcrumbList`. | zgodne z `Produkt` jasny i ciemny. | spec. §6.2 |
| **B7** | 21.10 | **Strona główna (sekcje 1–12):**<br>• bloki Biznesu;<br>• koło 5 działów;<br>• plan firmy w wersji statycznej;<br>• FAQ z JSON-LD;<br>• 3 ostatnie wpisy;<br>• flagi opinii i logo klientów. | zgodne z `Main` i `Mobile` w obu motywach; animacje wyłączane przez `prefers-reduced-motion`. | spec. §4 |
| **B8** | 21.10 | **Formularze:**<br>• `/zapytanie` (pozycje, uwagi, pola dodatkowe, ekran sukcesu z numerem zgłoszenia);<br>• `/kontakt` (statyczna mapa, karty kanałów, LocalBusiness);<br>• kontakt na stronie głównej;<br>• 3 typy przez `submitInquiry()`, mail z pełną listą. | kryterium 5; testy Playwright 3 typów i walidacji, także przy 390 px. | spec. §6.3, §6.9, §8.4 |
| **B9** | 22.10 | **`/opieka-it`, `/gopos`, `/insert`:**<br>• bloki z kalkulatorem przestoju (liczony w przeglądarce);<br>• eksplorator modułów, 3 zestawy „Dodaj zestaw do zapytania”;<br>• dobór programu InsERT;<br>• licznik dni do KSeF. | zgodne z `Dzial`, `Gopos`, `Insert`. | spec. §6.4–6.6 |
| **B10** | 22.10 | **Kategoria, branże i kreator:**<br>• szablon kategorii (bez porównywarki), dobór kas;<br>• 3 branże aktywne i „Wkrótce” dla reszty, CTA do kreatora z parametrem;<br>• kreator z regułami jako danymi. | zgodne z `Kategoria`, `Branza`, `Kreator`. | spec. §6.1, §6.7, §6.8 |
| **B11** | 23.10 rano | **O firmie, Aktualności, wpis KSeF, strony prawne, mapa strony:**<br>• sitemap z katalogu, `Article`;<br>• Lighthouse (telefon) i axe na wszystkich szablonach;<br>• `smoke.sh` ze stronami Biznesu. | kryteria 6–9; zrzuty wszystkich plansz porównane. | spec. §6.9, §9 |

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
