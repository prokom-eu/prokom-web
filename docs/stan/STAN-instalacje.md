# STAN — prokominstalacje.pl (linia Instalacje)

Ostatnia aktualizacja: 28.10.2026 (sesja I3, część 1 — PR wspólny `inst/wsp-arkusz` na develop 787876b)
Worktree: `D:\PRO-KOM\repos\prokom-instal` · gałęzie `inst/*` · `PORT=3002`, baza `prokom_web_instalacje` we wspólnym kontenerze PostgreSQL prokom-web (54320), Mailpit wspólny (8025)

## W toku
- Gałąź: `inst/wsp-arkusz` (PR „feat(wsp): wspólny arkusz od dołu, theme-color i manifest Instalacji” → develop). Przegląd recenzenta: gotowe do PR, uwagi 1–3 poprawione (commit 2389645).
- Plan I3 (zatwierdzony 28.10): 3 PR-y — `inst/wsp-arkusz` (ten) → `inst/wsp-tokeny` → jeden `inst/i3-powloka` (decyzja Krystiana: bez podziału na desktop/telefon).
- Niedokończone I3:
  - `inst/wsp-tokeny`: tokeny powłoki pod `[data-line='instalacje']` w `src/styles/tokens.css` (kolory pasa CTA, stopki, arkusza i dolnego paska z `pk.css`: ok. 40 wartości, m.in. `#4CCBE6`, `#9FB0B4`, `#F2B84B`, tło arkusza `rgba(5,10,9,.52)`) + test kontrastu. Wyliczane przy budowie komponentów, scalane przed `i3-powloka` (ADR-I001 §5, `rebase --onto`).
  - `inst/i3-powloka` — **także pozycja „Dla architektów” w menu** (W-A, ADR-I005 §4: dopisz ją ręcznie w `dane/nawigacja.ts`; `write-dane.ts` nie nadpisuje ręcznie edytowanego pliku): cała powłoka wg planu w `docs/zadania/prokominstalacje.md` §3 → I3 i ADR-I004 „Doprecyzowanie I3”: `src/sites/instalacje/powloka/` (TopBar, Header + MegaMenu, chowany nagłówek, TabBar, MenuSheet na wspólnym `BottomSheet` z `desktopQuery="(min-width: 1101px)"`, `header`, `footer`, `backdropClassName`, `dragToClose`; ThemeButton, AnchorsBar, CtaBand, Footer, View Transitions), `src/sites/instalacje/icons.ts`, `src/lib/instalacje/menu.ts` (publiczny odczyt `InstServices`/`InstObjects` z filtrem tenanta), testy jednostkowe (`buildMenu`, `activeSection`, `nextHeaderHidden`, `hoursText`) i e2e `tests/e2e/instalacje/shell.e2e.spec.ts`. Zrzuty wzorca `start` i `monitoring` są w `tmp/wzorzec/` (lokalnie, poza gitem).
- Następny krok: po scaleniu tego PR `/inst-start` na nowej gałęzi `inst/i3-powloka` od `origin/develop` i prompt: „Sesja I3 (Instalacje) — powłoka, część 2: `inst/i3-powloka` wg planu z STAN „W toku” i ADR-I004 „Doprecyzowanie I3”; `BottomSheet`, `theme-color` i manifest są już na develop; tokeny powłoki zbierz przy budowie i wydziel do `inst/wsp-tokeny` przed PR powłoki.”
- Znane ograniczenia (do I3/I13): ramka Instalacji nadal bez nawigacji, linków prawnych i przełącznika motywu — **stagingu Instalacji nie pokazywać dalej przed I3/I13** (brak polityki prywatności w stopce).

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
| 28.10.2026 | I3 (wsp) | (ten PR) | `BottomSheet` wspólny w `src/components` (`desktopQuery`, `header`, `footer`, `panelClassName`, `backdropClassName`, `dragToClose`), Software bez zmian zachowania; `theme-color` + `viewport-fit=cover` i `/manifest.webmanifest` dla Instalacji (`src/lib/brand/themeColor.ts`); e2e Software i ramki Instalacji zielone |

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
- [Krystian] test na prawdziwym telefonie (Android + iPhone) przed scaleniem `inst/i3-powloka` (MOBILE-APLIKACJA §10).
- [Krystian] usunąć stare lokalne gałęzie `inst/w-pakiet` (#125), `inst/i0-ustalenia` (#126), `inst/wsp-fundament` (#128), `inst/wsp-rejestracja` (#131), `inst/i2-model` (#134) i `inst/i2-dane` (#135) — scalone; pliki `tmp/check-i2.ts`, `tmp/check-i2-model.ts`, `tmp/diff-objects.ts`, `tmp/restore-sample-pages.ts` (skrypty sprawdzające I2, ignorowane przez git) można skasować.
- [SZEF] strona dla architektów, przed I16c: opiekun (imię, zdjęcie, telefon, e-mail architekci@), dostępność marek (Sonance, Amina, KEF, B&W, ELAC, Molecule, Future Automation, Nuki), partner Sonos, warunki dla pracowni, bezpłatna konsultacja, pokaz w salonie, realizacje z projektem architekta, autoryzacje Ampio i Satel — lista w `prokominstalacje-do-uzupelnienia.md`.

## Pomysły na później (nie robić „przy okazji”)
- **I3:** przełącznik motywu ma też nadpisywać `meta[name=theme-color]` — dziś kolor paska idzie tylko za motywem systemu (uwaga recenzenta).
- **I3 → I4:** `AnchorsBar` powstaje w I3 bez strony, która go pokazuje; test „pasek kotwic nie zostawia przerwy” (MOBILE §10) z pierwszą stroną usługi (Anteny).
- Niestabilny test Software `tests/e2e/software-catalog.e2e.spec.ts` „Back after „Wyczyść filtry” brings the search back” (1 na 3 przebiegi czerwony, 28.10; wyszukiwarka z opóźnieniem 300 ms + „wstecz”) — zgłosić linii Software, nie poprawiać z Instalacji.
- `GenericFrame` (ramka linii bez własnego wyglądu) nie ma po I1 żadnego lokalnego tenanta → brak pokrycia e2e; wróci z hubem pro-kom.eu albo z tenantem testowym w seedzie.
- Test e2e „trasy `(instalacje)` → 404 na innych liniach, 200 na Instalacjach” — dodać z pierwszą trasą grupy (I10 `/dla-kogo/…` albo I11 `/wyslane`).
- `--accent-on-dark` Instalacji: jasny `#12B6D8`, ciemny `#4CCBE6` — ujednolicić wg wizualizacji przy pierwszym ciemnym bloku (I5).
- Strony miejscowości z unikalną treścią (etap 2, SEO §1).
- Teksty widżetów edytowalne w panelu (ADR-I002 §1, etap 2).
- Upload plików do zapytań (`InquiryFiles`, wspólny z Software — ADR-014 §3.2): przedmiary, zdjęcia rozdzielnic.
- WhatsApp jako pole wspólne `SiteSettings` (dziś osobno w grupie Biznesu i w `InstalacjeSettings`).
- Hooki rewalidacji dla kolekcji Instalacji (jak `solutionsRevalidationHooks` Software) — z pierwszym komponentem, który czyta te dane (I4).
- Walidacja id kotwic (`anchors`) względem sekcji komponentu strony (ADR-I002 §2) — gdy powstaną komponenty usług i obiektów (I4/I10).
- Obraz OG w SEO kolekcji Instalacji — jeśli I13 go wymaga (dziś `seoGroup` repo bez obrazu).
- **I4:** `InstServices.seo` jest puste (SEO usług w `Pages`) — usunąć pole z migracją albo ukryć (`admin.hidden`), żeby szef nie edytował nie tam.
- **I4:** komponent zestawów/kafli traktuje znacznik `[CENA]` jak brak ceny (przy `showPrices=true` bez podmiany pokazałby „od [CENA] zł”).
- **I4:** karty „Powiązane” do stron Serwis (Monitoring, Alarmy) i Realizacje (Nagłośnienie) z prototypu — pominięte w imporcie (nie są usługami); stała karta w komponencie albo pole linków w `InstServices`.
- **I6 / I11:** SEO stron `home` i `kontakt` z paczki (`Main.json`, `Kontakt.json`) — import ich nie rusza (strony przykładowe, test izolacji `tests/e2e/tenants.e2e.spec.ts` sprawdza tytuł = nazwa strony; zmiana testu = PR wsp). Szablon tytułu działa tylko na podstronach, więc strona główna potrzebuje pełnego tytułu.
