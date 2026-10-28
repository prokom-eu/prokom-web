# STAN — prokominstalacje.pl (linia Instalacje)

Ostatnia aktualizacja: 28.10.2026 (sesja I1 — wspólne minimum, gałąź `inst/wsp-fundament` na develop 82ed0a2)
Worktree: `D:\PRO-KOM\repos\prokom-instal` · gałęzie `inst/*` · `PORT=3002`, baza `prokom_web_instalacje` we wspólnym kontenerze PostgreSQL prokom-web (54320), Mailpit wspólny (8025)

## W toku
- Gałąź: `inst/wsp-fundament` (PR wspólny „feat(instalacje): I1 — motyw, ramka i trasy linii” → develop, scalić od razu)
- Niedokończone: — (po scaleniu PR-a I1 nic nie zostaje; w CI do sprawdzenia `build` i pełne e2e)
- Następny krok: **I2** — po scaleniu I1 najpierw PR `inst/wsp-rejestracja` z `origin/develop`, potem `inst/i2-model`; prompt do skopiowania: „Sesja I2 (Instalacje)…” z `docs/zadania/prokominstalacje.md` §3 → I2.
- Znane ograniczenia po I1 (do I3): ramka Instalacji nie ma nawigacji, linków prawnych ani przełącznika motywu (działa motyw systemu) — **stagingu Instalacji nie pokazywać dalej przed I3/I13** (brak polityki prywatności w stopce).

## Zrobione
| Data | Sesja | PR | Co |
|---|---|---|---|
| 27.10.2026 | (czat) | — | wizualizacja v4.0: 31 stron, telefon jak aplikacja (dolny pasek, arkusz 3 zakładki, chowany nagłówek), poprawka hero na telefonie w jasnym motywie, pełna oferta Elzab EcoPower; pakiet: spec, SEO, ADR-I001–I004, plan I0–I15, wzorzec, seed |
| 28.10.2026 | W-I | #125 | pakiet wgrany do repo (squash 33f6e9b) |
| 28.10.2026 | I0 | #126 | ustalenia sprawdzone na develop 33f6e9b; ADR-I001, I004 przyjęte, ADR-I002, I003 przyjęte z poprawkami; plan sesji 1.1; spec §3, §5, §6, §8 uzgodnione |
| 28.10.2026 | I1 | (ten PR) | motyw jasny/ciemny Instalacji w `tokens.css` (za systemem), `InstalacjeFrame` (logo, stopka minimalna), grupa `(instalacje)`, `dla-kogo`/`wyslane` zarezerwowane, `instalacje.css`, `INSTALACJE_BLOCKS`, test dymny e2e; Biznes/Software bez zmian (zrzuty 1440/390, oba motywy: 0,000% różnicy pikseli) |

## Decyzje obowiązujące (skrót — pełna lista: spec §2)
- Gwarancja 24 mies. na montaż; „24 h” = odpowiedź na zgłoszenie w dni robocze, nie przyjazd.
- Bez pakietu odbiorowego; bez oferty i cen sprzętu (wyjątek: modele Elzab EcoPower bez cen); bez list źródeł na stronie.
- Hero strony głównej bez zmian. Kolor linii: turkus.
- Instalacje = tenant prokom-web, praca w osobnym worktree (ADR-I001).
- I0 (28.10): `/wyslane` = trasa linii; poradnik pod `/poradnik/<slug>`; formularze bez uploadu plików w v1; motyw jak system (jak inne linie).
- I1 (28.10): akcent interfejsu Instalacji z wizualizacji (`#007A96` przyciski, `#006A82` tekst w jasnym; `#12B6D8` / `#4CCBE6` w ciemnym), kolory księgi znaku (`--c-instalacje*`) bez zmian. Wartości spoza wizualizacji: `--surface-dark` = `#0B1416` (prototypowe `--ink`), ramka pól i zielony tekst jak w Software. Tokeny scen (`--sg*`, `--ev*`), usług (`--svc-*`) i `--bad` dochodzą w sesjach, które ich używają (I3/I5/I10, `--bad` w I11 z testem kontrastu).

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
- [Krystian] usunąć stare lokalne gałęzie `inst/w-pakiet` (#125) i `inst/i0-ustalenia` (#126) — scalone.

## Pomysły na później (nie robić „przy okazji”)
- `GenericFrame` (ramka linii bez własnego wyglądu) nie ma po I1 żadnego lokalnego tenanta → brak pokrycia e2e; wróci z hubem pro-kom.eu albo z tenantem testowym w seedzie.
- Test e2e „trasy `(instalacje)` → 404 na innych liniach, 200 na Instalacjach” — dodać z pierwszą trasą grupy (I10 `/dla-kogo/…` albo I11 `/wyslane`).
- `--accent-on-dark` Instalacji: jasny `#12B6D8`, ciemny `#4CCBE6` — ujednolicić wg wizualizacji przy pierwszym ciemnym bloku (I5).
- Strony miejscowości z unikalną treścią (etap 2, SEO §1).
- Teksty widżetów edytowalne w panelu (ADR-I002 §1, etap 2).
- Upload plików do zapytań (`InquiryFiles`, wspólny z Software — ADR-014 §3.2): przedmiary, zdjęcia rozdzielnic.
- WhatsApp jako pole wspólne `SiteSettings` (dziś osobno w grupie Biznesu i w `InstalacjeSettings`).
