# STAN — prokominstalacje.pl (linia Instalacje)

Ostatnia aktualizacja: 30.10.2026 (sesja I4 — sekcje wspólne + strona Anteny, gałąź `inst/i4-anteny` na develop f00ff04)
Worktree: `D:\PRO-KOM\repos\prokom-instal` · gałęzie `inst/*` · `PORT=3002`, baza `prokom_web_instalacje` we wspólnym kontenerze PostgreSQL prokom-web (54320), Mailpit wspólny (8025)

## W toku
- Gałąź: `inst/i4-anteny` (PR „feat(instalacje): I4 — sekcje wspólne usług i strona Anteny” → develop). Strefa wspólna I4 już na develop: blok `instService` + migracja (#147), tokeny + test kontrastu (#150).
- Niedokończone I4:
  - Lighthouse mobile ≥ 90 dla `/anteny` — na stagingu (lokalnie nie mierzone).
  - Test na prawdziwym telefonie (Android + iPhone) `/anteny`: zwijanie sekcji, karuzele zestawów i „Powiązanych”, symulator dotykiem (MOBILE §10).
  - `TODO(krystian)` w `src/sites/instalacje/dane/anteny.ts` (karta „Dwie opłaty”): zdanie wzorca o poradzie prawnej vs spec §2 „To nie jest porada prawna.” — decyzja.
  - `TODO(krystian)` w `src/lib/instalacje/seo.ts`: `areaServed` i `provider` (LocalBusiness) do panelu w I13.
- Następny krok: po scaleniu PR I4 — `/inst-start` na nowej gałęzi od `origin/develop` z promptem sesji I5 z `docs/zadania/prokominstalacje.md` §3 („Sesja I5 (Instalacje) — hero strony głównej…”). Sekcje wspólne usług (`src/sites/instalacje/sekcje/`) i układ strony usługi (`blocks/InstService`, rejestr `LAYOUTS` + `SERVICE_SECTION_IDS`) są gotowe dla I7–I9.
- Znane ograniczenia: podgląd szkicu strony usługi pokazuje tylko opublikowaną usługę (szkic usługi → 404 w podglądzie); linki „Zaplanuj” (`/zaplanuj?usluga=…`), „Serwis” i obiektów (`/dla-kogo/…`) prowadzą do stron z I10–I11 (dziś 404); pas CTA ramki zostaje w HTML jako ukryty, gdy strona ma własny.

## Zrobione
| Data | Sesja | PR | Co |
|---|---|---|---|
| 27.10.2026 | (czat) | — | wizualizacja v4.0: 31 stron, telefon jak aplikacja (dolny pasek, arkusz 3 zakładki, chowany nagłówek), poprawka hero na telefonie w jasnym motywie, pełna oferta Elzab EcoPower; pakiet: spec, SEO, ADR-I001–I004, plan I0–I15, wzorzec, seed |
| 28.10.2026 | W-I | #125 | pakiet wgrany do repo (squash 33f6e9b) |
| 28.10.2026 | I0 | #126 | ustalenia sprawdzone na develop 33f6e9b; ADR-I001, I004 przyjęte, ADR-I002, I003 przyjęte z poprawkami; plan sesji 1.1; spec §3, §5, §6, §8 uzgodnione |
| 28.10.2026 | I1 | #128 | motyw jasny/ciemny Instalacji w `tokens.css` (za systemem), `InstalacjeFrame` (logo, stopka minimalna), grupa `(instalacje)`, `dla-kogo`/`wyslane` zarezerwowane, `instalacje.css`, `INSTALACJE_BLOCKS`, test dymny e2e; Biznes/Software bez zmian (zrzuty 1440/390, oba motywy: 0,000% różnicy pikseli) |
| 28.10.2026 | I2 (1/3) | #131 | kolekcje `InstalacjeSettings`, `InstServices`, `InstObjects`, `InstSolutions`, `Realizations` + migracja `instalacje_collections`, rejestracja w configu i `Tenants`, szkielet `pnpm seed:instalacje` (ustawienia linii); realizacja bez zgody klienta nie jest publikowana (hook + testy); mapa pól w ADR-I002 |
| 28.10.2026 | I2 (2/3) | #134 | `pnpm seed:instalacje` importuje paczkę: 10 usług, 12 obiektów, 76 rozwiązań (opublikowane), 11 realizacji (wersje robocze bez zgody, 4 wyróżnione), 16 pustych wersji roboczych `Pages` z tytułem i SEO (`home`/`kontakt` z `pnpm seed` nietknięte); idempotentny (drugi przebieg: 0 zmian); testy mapowania na plikach seeda; rozstrzygnięcia importu w ADR-I002 |
| 28.10.2026 | I2 (3/3) | #135 | `dane/nawigacja.ts` (układ menu, dolny pasek, „Więcej”, CTA; typy w `dane/types.ts`, test reguł pliku), pomocnik `cleanPrototype` dla sesji stron, skrypt `write-dane.ts` (raz, bez nadpisywania); zmiana planu: pliki `dane/<strona>.ts` w sesjach stron ze źródła JS |
| 28.10.2026 | (czat) | — | wizualizacja v4.2: strona `/dla-architektow` (32. strona) + sekcja `#architekci` na głównej, „Dla architektów” w menu wszystkich stron; research: liczby do projektu, nowe rozwiązania, deweloperzy, przepisy 2026–2028 (źródła w `docs/strony/prokominstalacje-architekci-zrodla.md`) |
| 28.10.2026 | W-A | #137 | pakiet architektów w repo: spec `prokominstalacje-architekci.md` + źródła, ADR-I005 (przyjęty), zadania I16a–c, wzorzec v4.2 (prototyp 32 stron, `ARCHITEKCI.md`, stany telefonu 21–25), seed `architekci/` + `strony-zrzut/Architekci.json`, `Main.json` z `arhm`/`arsc`; dopiski do spec linii, ADR-I002, planu, SEO, do-uzupełnienia, MAPA, KOMPONENTY, README |
| 28.10.2026 | I3 (wsp) | #139 | `BottomSheet` wspólny w `src/components` (`desktopQuery`, `header`, `footer`, `panelClassName`, `backdropClassName`, `dragToClose`), Software bez zmian zachowania; `theme-color` + `viewport-fit=cover` i `/manifest.webmanifest` dla Instalacji (`src/lib/brand/themeColor.ts`); e2e Software i ramki Instalacji zielone |
| 29.10.2026 | I3 (wsp) | #141 | tokeny powłoki w `tokens.css`: ciemny pas CTA i stopka (te same w obu motywach), tło arkusza, cienie; test kontrastu AA; karta „Zaplanuj” w stopce z ciemnym tekstem (biały 2,4:1) |
| 29.10.2026 | I3 | #143 | powłoka w `src/sites/instalacje/powloka/`: górny pasek z godzinami na żywo, nagłówek z mega menu (most, 280 ms, klik, Esc, focus-trap), motyw (+ `theme-color` za ręcznym wyborem), pas CTA, stopka; telefon: chowany nagłówek, dolny pasek 5 kart, arkusz 3 zakładki na wspólnym `BottomSheet` (×, tło, gest, Esc, wstecz, blokada przewijania), `AnchorsBar`, View Transitions; menu = `dane/nawigacja.ts` + panel (`getInstalacjeMenu`, `buildMenu`, `activeSection`), „Dla architektów” (ADR-I005 §4); ikony `icons.ts`/`InstIcon`; e2e powłoki 22 testy; nagłówek i stopka zgodne ze wzorcem v4.2 (1440/390, oba motywy) |
| 30.10.2026 | I4 (wsp) | #147 | blok `instService` (strona usługi = `Pages` + blok, ADR-I002 §0) + migracja `inst_service_block`, loader `getInstalacjeService` (tenant + opublikowane), brak usługi → 404 |
| 30.10.2026 | I4 (wsp) | #150 | tokeny stron usług w `tokens.css` (scena anteny, miernik, widmo, przełączniki, wyniki quizu) + test kontrastu AA w obu motywach |
| 30.10.2026 | I4 | (ten PR) | sekcje wspólne usług w `src/sites/instalacje/sekcje/` (PageHero ze slotem, Gwarancja, Zestawy z `displayPrice`, Cena, FAQ + FAQPage, Powiązane z `extraLink`, `InstSection` = reveal + Fold ≤ 700 px, `useReveal`, `useInterval` z pauzą); pełna `/anteny`: symulator ustawiania anteny, quiz telewizora, filtr LTE/5G, `dane/anteny.ts`, Service + BreadcrumbList; walidacja kotwic, `InstServices.seo` ukryte; `.wrap` w `content-box` (cała linia 1344 px jak wzorzec); 14 sekcji zgodnych w 1440/390, jasny i ciemny |

## Decyzje obowiązujące (skrót — pełna lista: spec §2)
- Gwarancja 24 mies. na montaż; „24 h” = odpowiedź na zgłoszenie w dni robocze, nie przyjazd.
- Bez pakietu odbiorowego; bez oferty i cen sprzętu (wyjątek: modele Elzab EcoPower bez cen); bez list źródeł na stronie.
- Hero strony głównej bez zmian. Kolor linii: turkus.
- Instalacje = tenant prokom-web, praca w osobnym worktree (ADR-I001).
- I0 (28.10): `/wyslane` = trasa linii; poradnik pod `/poradnik/<slug>`; formularze bez uploadu plików w v1; motyw jak system (jak inne linie).
- I1 (28.10): akcent interfejsu Instalacji z wizualizacji (`#007A96` przyciski, `#006A82` tekst w jasnym; `#12B6D8` / `#4CCBE6` w ciemnym), kolory księgi znaku (`--c-instalacje*`) bez zmian. Wartości spoza wizualizacji: `--surface-dark` = `#0B1416` (prototypowe `--ink`), ramka pól i zielony tekst jak w Software. Tokeny scen (`--sg*`, `--ev*`), usług (`--svc-*`) i `--bad` dochodzą w sesjach, które ich używają (I3/I5/I10, `--bad` w I11 z testem kontrastu).
- I2 (28.10): I2 w 3 PR-ach (wsp-rejestracja → i2-model → i2-dane). Pola wg ADR-I002 „Mapa pól (I2)”: FAQ zwykłym tekstem, SEO bez obrazu OG, realizacja — jedno `place`, obszar oferty w `InstServices.offer`, `liczbaRozwiazan` liczona przy renderowaniu. Klucz usługi/obiektu ustawiany raz (panel go nie zmienia). `CompanyData` nietknięte w I2.
- I2 import (28.10, ADR-I002 „Import (I2)”): SEO usług w `Pages.seo` (nie `InstServices.seo`), bez dopisku „| PRO-KOM…”; telefon i e-mail linii wpisuje szef w panelu (`SiteSettings`), seed ich nie rusza; realizacje z `Realizacje.json`; tekst bez cyfry i `[CENA]` to nie cena; istniejących stron (`home`, `kontakt` — przykładowe, test izolacji) import nie rusza; ich SEO z paczki w I6/I11.
- I2 dane (28.10, ADR-I002 „Pliki danych w kodzie”): zrzuty to stan jednego ekranu prototypu (widżety niepełne) → w I2 tylko nawigacja; każda sesja strony pisze swój `dane/<strona>.ts` z `zrodlo/pages/<Strona>.js`, typowany, czyszczony `cleanPrototype`. Menu: układ w kodzie, nazwy/ikony/kolory z panelu po kluczu.
- Architekci (28.10, decyzja szefa, ADR-I005): `/dla-architektow` = `Pages` + `InstArchitects` (11. blok linii), kolekcja `InstArchNews`, opiekun w `InstalacjeSettings.architects`, formularze w `Inquiries` (3 kategorie „Architekci · …”, zgoda na nowości osobno i niezaznaczona), bez uploadu w v1 (pole „Link do rzutów”), link w menu w I3, sekcja `#architekci` na głównej w I16c; nie obiecujemy wyższej ceny lokalu; liczby tylko z pliku źródeł; przepisy z datą stanu i zdaniem „To nie jest porada prawna”.
- I3 (28.10, ADR-I004 „Doprecyzowanie I3”): próg arkusza Instalacji 1101 px (tablet też ma arkusz, spec §4), nie 760; historia „wstecz” i blokada przewijania po stronie `MenuSheet`; chowanie nagłówka = hook własny (w Software go nie ma); komponenty powłoki w `src/sites/instalacje/powloka/` (także `TabBar`); `theme-color` = kopie `--surface` w `LINE_THEME_COLORS`, pilnowane testem; manifest tylko dla linii z wpisem; tokeny powłoki osobnym PR `inst/wsp-tokeny`.
- I3 powłoka (29.10): CSS powłoki przeniesiony z `pk.css` dosłownie z nazwami klas prototypu (zakres `[data-line='instalacje']`, kolory tylko z tokenów) zamiast tłumaczenia na Tailwind — łatwiejsze porównanie 1:1; hover tylko `@media (hover: hover)`. Godziny ze wspólnego `openingStatus` („Otwarte teraz · do 17:00”, „otwieramy jutro o 9:00”) zamiast tekstów prototypu. Logo = znak z księgi (nie tekstowe logo prototypu). Stopka pokazuje telefon linii, nie e-mail (jak wzorzec; e-mail na Kontakcie). Pas CTA i stopka z `data-surface="dark"` (focus na ciemnym). Teksty powłoki (pasek, mega promo, CTA, stopka) w `dane/nawigacja.ts` 1:1 ze `zrodlo/` — seed ich nie ma.

- I4 (30.10): strona usługi = blok `instService` (PR wsp) + układ per usługa w kodzie (`LAYOUTS` w `blocks/InstService/Component.tsx`, id sekcji w `lib/instalacje/anchors.ts`); kotwice walidowane tylko dla usług z gotową stroną. Fold ≤ 700 px jak CSS prototypu (ADR-I003 §2 poprawiony). Prototyp nie ma resetu `box-sizing` → `.wrap`, `.pkg`, `.relc` w `content-box`, SVG w liście zestawu i miniaturach satelity `inline`/`baseline` (ADR-I003 §5 p. 6); sprawdzaj wysokości sekcji liczbowo. Cena: „Wycena po wizji lokalnej” z ustawień (spec), nie „Cena…” z prototypu (zestawy na telefonie o jedną linię wyższe). Telefon nie dostaje klasy `.ph` (w prototypie = placeholder, bursztyn). Przyciski trybu symulatora = `aria-pressed`, nie zakładki; notatka czytana dopiero po dotknięciu. Pas CTA usługi z `InstServices.cta` (`CtaBandView page`), ramkowy chowany CSS `:has`. SEO usług z `Pages.seo`, tytuł 61 znaków.

## Ustalenia I0 (28.10.2026, develop 33f6e9b)
**Potwierdzone**
- **Worktree i porty:** jeden kontener PostgreSQL `prokom-web-dev` (54320) i Mailpit (1025/8025), osobna baza i `PORT` w `.env` każdego folderu; Instalacje 3002 / `prokom_web_instalacje` (ADR-I001 §2). `.env` nie był czytany w I0 — `PORT=3002` potwierdza Krystian.
- **Routing:** `src/proxy.ts` → `src/app/(sites)/[domain]`. Grupy: `(biznes)` — oferta, produkt, branze, kreator, zapytanie; `(software)` — rozwiazania, dziekujemy. Wspólne: `[slug]` (Pages), `aktualnosci`, `mapa-strony`, `podglad`, `sitemap.xml`, `robots.txt`.
- **Wolne adresy:** `RESERVED_PAGE_SLUGS` (`src/lib/pages/slug.ts`) = podglad, oferta, produkt, branze, aktualnosci, kreator, zapytanie, rozwiazania, dobierz, dla-branz, miejscowosci, dziekujemy, mapa-strony → `/uslugi`, `/wyslane`, `/zaplanuj`, `/serwis`, `/realizacje`, `/poradnik`, `/dla-kogo`, `/kontakt`, `/o-firmie` są wolne.
- **Tenant** `instalacje` w `src/seed/tenants.ts` (`instalacje.localhost`); `Tenants.active` istnieje (nieaktywna = 404) → niewidoczność do odbioru bez nowej flagi.
- **Wygląd:** Tailwind 4 + `src/styles/tokens.css` (`data-line`, `data-theme`); kolory Instalacji są, ciemnych wartości brak (`DARK_THEME_LINES = ['biznes','software']`) → I1. CSS w `src/` tylko `globals.css` i `tokens.css`. Fonty Archivo i Manrope już lokalnie (`next/font/local`).
- **SW2b scalone** (#124) — `Inquiries`/`Industries`/ADR-003 wolne.
- **Seed:** wzór `src/seed/software/{index,run,map,pages}.ts` + skrypt `seed:software`; `pnpm seed` woła `seedSoftware` z `src/seed/index.ts`; porównanie „zapis tylko przy różnicy” w `src/seed/compare.ts`.

**Zmienione / doprecyzowane** (szczegóły: ADR-I002 „Poprawki I0”, ADR-I003 §6, ADR-I004)
1. **Rejestr bloków:** na develop tylko bloki wspólne i Biznesu — Software jeszcze bez bloków (SW5/SW6). Instalacje mogą wejść pierwsze; nowe bloki na końcu `ALL_BLOCKS`.
2. **Ramka:** layout wybiera ją po grupie `SiteSettings.biznes` / `.software` → `InstalacjeFrame` po `tenant.line === 'instalacje'`, bez grupy `SiteSettings.instalacje` i bez migracji w I1.
3. **`/wyslane`:** trasa `(instalacje)/wyslane` (noindex, poza sitemap), nie `Pages` + `InstSent` → **10 bloków** linii.
4. **Poradnik:** `/poradnik/[slug]` w `(instalacje)`; wspólne `postHref()` daje dziś zawsze `/aktualnosci/…` → PR wsp w I12 (adres per linia + kategorie Instalacji w `POST_CATEGORIES`, migracja enumu). `poradnik` nie idzie do `RESERVED_PAGE_SLUGS` (lista = strona `Pages`).
5. **Zapytania bez nowych kolumn:** źródło → `category` (etykieta PL), usługi → `topics[]`, kreator/obiekt/konfiguracja → `wizard`, miejscowość → `city`, pilność → `deadline`; `meta` nie istnieje i nie dochodzi. Zmiany w `lib/inquiry` w **I11**, po scaleniu **SW7** (ten sam `submit.ts`). I2 bez PR-a zapytań.
6. **Pliki:** bez uploadu w v1 (przedmiar/zdjęcia mailem po zgłoszeniu).
7. **Motyw:** za systemem jak Biznes/Software (zmienia „domyślnie ciemny” z ADR-I003).
8. **Kontakt:** telefon/e-mail z `SiteSettings`, salony z `CompanyData.locations`, WhatsApp w `InstalacjeSettings.whatsapp`.
9. **Industries:** Instalacje ich nie używają.
10. **Mobile (I3):** `BottomSheet` → wspólny `src/components` (PR `inst/wsp-arkusz`, próg jako prop); `TabBar` → własny.
11. **Strefa wspólna** uzupełniona o `Tenants.ts` (lista kolekcji tenanta), `src/seed/index.ts`, `src/lib/posts/**`, `src/lib/inquiry/**` (ADR-I001 §3).

## Pytania do Krystiana / szefa
- [SZEF] telefon, e-mail, WhatsApp Instalacji; adres salonu w Zakopanem; ceny „od” czy bez cen; zgody na realizacje i zdjęcia.
- [SZEF] telefon wymagany w formularzach Instalacji? (dziś reguła „e-mail lub telefon”; Biznes wymaga telefonu) — przed I11.
- [Krystian] test na prawdziwym telefonie (Android + iPhone): powłoka (I3) i `/anteny` (I4) — MOBILE-APLIKACJA §10.
- [Krystian/SZEF] karta „Dwie opłaty” na Antenach: zdanie wzorca „…nie zastępujemy porady prawnej” czy spec §2 „To nie jest porada prawna.”?
- [Krystian] usunąć scalone lokalne gałęzie `inst/i3-powloka` (#143) i `inst/wsp-tokeny-uslugi` (#150).
- [Krystian] usunąć stare lokalne gałęzie `inst/w-pakiet` (#125), `inst/i0-ustalenia` (#126), `inst/wsp-fundament` (#128), `inst/wsp-rejestracja` (#131), `inst/i2-model` (#134) i `inst/i2-dane` (#135) — scalone; pliki `tmp/check-i2.ts`, `tmp/check-i2-model.ts`, `tmp/diff-objects.ts`, `tmp/restore-sample-pages.ts` (skrypty sprawdzające I2, ignorowane przez git) można skasować.
- [SZEF] strona dla architektów, przed I16c: opiekun (imię, zdjęcie, telefon, e-mail architekci@), dostępność marek (Sonance, Amina, KEF, B&W, ELAC, Molecule, Future Automation, Nuki), partner Sonos, warunki dla pracowni, bezpłatna konsultacja, pokaz w salonie, realizacje z projektem architekta, autoryzacje Ampio i Satel — lista w `prokominstalacje-do-uzupelnienia.md`.

## Pomysły na później (nie robić „przy okazji”)
- `HoursLive` (Instalacje) ≈ `HoursStatus` (Biznes) — dwie linie, ten sam komponent → wspólny w `src/components` (PR `inst/wsp-*`, ADR-010).
- **I5/I6:** `CtaBand` jest kliencki tylko po to, żeby ukryć się na `/` — gdy strona główna dostanie własny układ, wystarczy prop z serwera.
- Ostrzeżenie „Encountered a script tag while rendering React component” na stronach 404 (także Software, nie z I3) — sprawdzić wspólną 404 (`[domain]/not-found.tsx`).
- Nieznane adresy z dwoma segmentami (np. `/dla-kogo/dom` przed I10, `/a/b`) → ogólna 404 Next poza ramką domeny; rozważyć catch-all 404 w `[domain]` (strefa wspólna).
- Niestabilny test Software `tests/e2e/software-catalog.e2e.spec.ts` „Back after „Wyczyść filtry” brings the search back” (1 na 3 przebiegi czerwony, 28.10; wyszukiwarka z opóźnieniem 300 ms + „wstecz”) — zgłosić linii Software, nie poprawiać z Instalacji.
- `GenericFrame` (ramka linii bez własnego wyglądu) nie ma po I1 żadnego lokalnego tenanta → brak pokrycia e2e; wróci z hubem pro-kom.eu albo z tenantem testowym w seedzie.
- Test e2e „trasy `(instalacje)` → 404 na innych liniach, 200 na Instalacjach” — dodać z pierwszą trasą grupy (I10 `/dla-kogo/…` albo I11 `/wyslane`).
- `--accent-on-dark` Instalacji: jasny `#12B6D8`, ciemny `#4CCBE6` — ujednolicić wg wizualizacji przy pierwszym ciemnym bloku (I5).
- Strony miejscowości z unikalną treścią (etap 2, SEO §1).
- Teksty widżetów edytowalne w panelu (ADR-I002 §1, etap 2).
- Upload plików do zapytań (`InquiryFiles`, wspólny z Software — ADR-014 §3.2): przedmiary, zdjęcia rozdzielnic.
- WhatsApp jako pole wspólne `SiteSettings` (dziś osobno w grupie Biznesu i w `InstalacjeSettings`).
- Walidacja id kotwic obiektów (`InstObjects.anchors`) — z I10 (usługi: od I4).
- Obraz OG w SEO kolekcji Instalacji — jeśli I13 go wymaga (dziś `seoGroup` repo bez obrazu).
- **I9 / I7:** karty „Powiązane” bez klucza usługi (Monitoring, Alarmy → Serwis; Nagłośnienie → Realizacje) — stała karta albo pole linków w `InstServices`; Anteny ich nie mają.
- **I7–I9:** jeden rejestr stron usług zamiast dwóch (`LAYOUTS` + `SERVICE_SECTION_IDS`) albo test spójności; lista zwijanych sekcji dziś rozbita (`LAYOUTS.folded` + `fold` w sekcjach strony).
- `InstServices.seo`: kolumny ukryte (I4) — usunąć z migracją, gdy będzie inna zmiana schematu kolekcji.
- `salons` liczone w `Frame.tsx` i `blocks/InstService/Component.tsx` — wspólny helper przy następnej zmianie.
- Okruszek „Usługi” → `/#uslugi`; po I12 `/uslugi` (także w BreadcrumbList).
- Hooki rewalidacji kolekcji Instalacji — dopiero gdy loadery dostaną `unstable_cache` (dziś dane świeże na żądanie).
- **I6 / I11:** SEO stron `home` i `kontakt` z paczki (`Main.json`, `Kontakt.json`) — import ich nie rusza (strony przykładowe, test izolacji `tests/e2e/tenants.e2e.spec.ts` sprawdza tytuł = nazwa strony; zmiana testu = PR wsp). Szablon tytułu działa tylko na podstronach, więc strona główna potrzebuje pełnego tytułu.
