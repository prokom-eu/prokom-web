# STAN — prokominstalacje.pl (linia Instalacje)

Ostatnia aktualizacja: 27.10.2026 (pakiet wizualizacji v4.0 przygotowany w czacie, przed W-I)
Worktree: `D:\PRO-KOM\repos\prokom-instal` · gałęzie `inst/*` · `PORT=3002`, baza `prokom_web_instalacje` we wspólnym kontenerze PostgreSQL prokom-web (54320), Mailpit wspólny (8025)

## W toku
- Gałąź: —
- Niedokończone: —
- Następny krok: **W-I** (wgranie pakietu), potem **I0** (prompty w `docs/zadania/prokominstalacje.md` §3)

## Zrobione
| Data | Sesja | PR | Co |
|---|---|---|---|
| 27.10.2026 | (czat) | — | wizualizacja v4.0: 31 stron, telefon jak aplikacja (dolny pasek, arkusz 3 zakładki, chowany nagłówek), poprawka hero na telefonie w jasnym motywie, pełna oferta Elzab EcoPower; pakiet: spec, SEO, ADR-I001–I004, plan I0–I15, wzorzec, seed |

## Decyzje obowiązujące (skrót — pełna lista: spec §2)
- Gwarancja 24 mies. na montaż; „24 h” = odpowiedź na zgłoszenie w dni robocze, nie przyjazd.
- Bez pakietu odbiorowego; bez oferty i cen sprzętu (wyjątek: modele Elzab EcoPower bez cen); bez list źródeł na stronie.
- Hero strony głównej bez zmian. Kolor linii: turkus.
- Instalacje = tenant prokom-web, praca w osobnym worktree (ADR-I001).

## Ustalenia I0 — wstępne (czat, 27.10.2026, na podstawie origin/develop 18f33b3; I0 potwierdza)
- **Worktree i porty:** repo obsługuje kilka folderów (`docs/sposob-pracy.md` → „Dwie strony równolegle”): jeden kontener PostgreSQL `prokom-web-dev` (54320) i Mailpit (1025/8025), osobna baza i `PORT` w `.env` każdego folderu; `scripts/dev.mjs` czyta `PORT` z `.env`, `start.ps1` zakłada brakującą bazę. Biznes: 3000 / `prokom_web`; Software: 3001 / `prokom_web_software`; **Instalacje: 3002 / `prokom_web_instalacje`**.
- **Routing:** `src/proxy.ts` → `/<host>/<ścieżka>` → `src/app/(sites)/[domain]`. Grupy tras linii: `(biznes)` (oferta, produkt, branze, kreator, zapytanie), `(software)` (rozwiazania, dziekujemy). Wspólne: `[slug]` (Pages), `aktualnosci`, `mapa-strony`, `podglad`. `RESERVED_PAGE_SLUGS` w `src/lib/pages/slug.ts`. **Wniosek:** pełna oferta Instalacji pod `/uslugi`, strona po wysłaniu `/wyslane`; trasy linii tylko `dla-kogo/[obiekt]` i `poradnik/[slug]`.
- **Strony = `Pages` + bloki linii** (ADR-006, ADR-010, rejestr `src/blocks/registry.ts`, bloki w `src/sites/<linia>/blocks`); Software ma sekcje strony głównej jako jeden blok + teksty w `SoftwareSettings` (ADR-014 rozstrz. 7) → Instalacje: 11 bloków (ADR-I002 §0).
- **Tenant** `instalacje` jest już w seedzie (`src/seed/tenants.ts`, `instalacje.localhost`); pole `active` w `Tenants` (nieaktywna = 404) → niewidoczność do odbioru bez nowej flagi.
- **Wygląd:** Tailwind 4 + `src/styles/tokens.css` (`data-line`, `data-theme`); Instalacje mają już kolory linii, ale **nie mają motywu ciemnego** (`DARK_THEME_LINES = ['biznes','software']` w `src/lib/brand/theme.ts`) → I1. Brak arkuszy CSS w `src/` poza `globals.css`.
- **Mobile:** Software ma `BottomSheet`, `TabBar`, `PhoneLayer` w `src/sites/software/components` → decyzja w I3 (przenieść do wspólnych albo własne).
- **Lint/format:** `docs/**` już poza ESLint i Prettierem; `seed/prokombiznes/`, `seed/prokomsoftware/` w `.prettierignore` → dopisać `seed/prokominstalacje/` (W-I). `tmp/` nie ma w `.gitignore` → dopisać (W-I).
- **Uwaga:** 27.10 w `prokom-web` trwa SW2b (Software) ze zmianami w `Inquiries`, `Industries`, ADR-003 — zmiany Instalacji w tych plikach po scaleniu SW2b.
- **ADR:** katalog `docs/decyzje/`, ADR-001…016 zajęte → Instalacje w serii `ADR-I001…I004`.

## Pytania do Krystiana / szefa
- [SZEF] telefon, e-mail, WhatsApp Instalacji; adres salonu w Zakopanem; ceny „od” czy bez cen; zgody na realizacje i zdjęcia.

## Pomysły na później (nie robić „przy okazji”)
- Strony miejscowości z unikalną treścią (etap 2, SEO §1).
- Teksty widżetów edytowalne w panelu (ADR-I002 §1, etap 2).
