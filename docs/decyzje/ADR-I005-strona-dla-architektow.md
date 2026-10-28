# ADR-I005: Strona „Dla architektów i deweloperów” (`/dla-architektow`)

- Status: **przyjęty** (28.10.2026, W-A; poprawki W-A na końcu)
- Kontekst biznesowy: decyzja szefa 28.10.2026. Współpraca z architektami, projektantami wnętrz, deweloperami i wykonawcami jest kluczowa dla linii Instalacje. Większość architektów nie planuje dobrze instalacji niskoprądowych. Strona ma to zmienić, zachęcić do współpracy i dostarczać nowe rozwiązania do projektów. To jedna z najważniejszych podstron.
- Powiązane: ADR-006, ADR-010, ADR-I002 (model, „Pliki danych w kodzie”, „Poprawki I0”), ADR-I003 (wierność wzorcu), ADR-I004 (telefon), spec `docs/strony/prokominstalacje-architekci.md`, źródła `docs/strony/prokominstalacje-architekci-zrodla.md`, wzorzec `docs/design/prokominstalacje/ARCHITEKCI.md`.

## Decyzja

### 1. Strona w modelu repo
| Co | Jak | Adres |
|---|---|---|
| Strona | `Pages` ze slugiem `dla-architektow` + blok linii **`InstArchitects`** (11. blok Instalacji, na końcu `INSTALACJE_BLOCKS` / `ALL_BLOCKS`). Komponent renderuje całą stronę: 17 sekcji wg `ARCHITEKCI.md`. | `/dla-architektow` |
| Teksty sekcji | `src/sites/instalacje/dane/architekci.ts` (typowany, z `zrodlo/pages/Architekci.js` + `seed/prokominstalacje/architekci/strona.json`, czyszczony `cleanPrototype`), zgodnie z ADR-I002 „Pliki danych w kodzie” | — |
| Przekrój domu | wspólny komponent **`ArchHouseScene`** w `src/sites/instalacje/sekcje/` (używa go `InstArchitects` i sekcja `#architekci` w `InstHome`). Dane: `dane/przekroj.ts` z `seed/prokominstalacje/architekci/przekroj.json`, rysunek SVG z `zrodlo/inc/arscene.html` | — |
| Nowe rozwiązania | kolekcja **`InstArchNews`** (panel: szef lub Krystian dodaje karty bez programisty) | sekcja `#nowosci` |
| Opiekun architektów | nowa grupa pól **`InstalacjeSettings.architects`**: `name`, `role`, `photo` (Media), `phone`, `email`, `quote`, `responseText` | sekcja `#opiekun` |
| SEO | `Pages.seo` strony (tytuł i opis z `strony-zrzut/Architekci.json`, bez dopisku „| PRO-KOM…”, bo dopisuje go szablon) | — |

`dla-architektow` **nie** trafia do `RESERVED_PAGE_SLUGS` (to zwykła strona `Pages`). Nie dodajemy trasy w `(instalacje)`.

### 2. Kolekcja `InstArchNews`
`onlyLineTenant('instalacje', …)`, `versions.drafts`, sortowanie `order`. Pola:
- `title`, `category` (select: `snd` Dźwięk, `scr` Obraz, `smart` Sterowanie, `wifi` Sieć, `kam` Bezpieczeństwo, `ev` Energia, `sz` Szkolenia i oferty; kolor z kolorów usług, `sz` = `--warn`), `type` (Nowość, Rozwiązanie, Szkolenie, Oferta);
- `description`, `params[]` ({ `label`, `value` }, 2–6 pozycji), `planItems[]` ({ `text` }, 1–4), `examples` (tekst), `places[]` ({ `name` });
- `illustration` (ścieżka SVG 200×120, obrys; pole techniczne, w panelu zwinięte), opcjonalnie `image` (Media) na etap 2;
- `order`, `featured` (pierwsza karta na start), `internalNote` (np. „[SZEF: dostępność marki]”, nie renderowane);
- `publishedAt` (pokazywane w panelu, nie na stronie).

**Hook:** dokument z `[SZEF` albo `[CENA` w polach widocznych nie może zostać opublikowany (spójnie z testem e2e braku znaczników na produkcji).

Seed: `seed/prokominstalacje/architekci/nowe-rozwiazania.json` (20 pozycji) → `pnpm seed:instalacje` (idempotentnie, klucz `legacyId` = pozycja w paczce, jak `InstSolutions`). Pozycje z `doPotwierdzenia` jako **wersje robocze**, reszta opublikowana. `internalNote` = treść `doPotwierdzenia`.

### 3. Formularze (zgodnie z „Poprawkami I0”: zapytania bez nowych kolumn, bez uploadu w v1)
| Formularz | `Inquiries.category` | Inne pola |
|---|---|---|
| „Wyślij rzuty” `#wyslij` | „Architekci · projekt” | `wizard` = { rola, etap, obiekt, pracownia, linkDoPlikow }, `city`, `message`, telefon wymagany (jak Biznes) |
| Checklista PDF `#checklista` | „Architekci · checklista PDF” | e-mail, `wizard` = { obiekt, instalacje[] } |
| Nowości e-mail `#nowosci` | „Architekci · nowości” | e-mail + **osobna zgoda na informacje handlowe e-mailem** (nie domyślnie zaznaczona) |

- **v1 bez uploadu plików:** zamiast pola pliku jest pole „Link do rzutów (opcjonalnie)” i informacja po wysłaniu: „Rzuty możesz też wysłać na [E-MAIL] w odpowiedzi na potwierdzenie.” Upload = etap 2 (pomysł `InquiryFiles` w STAN).
- Checklista PDF w v1: zgłoszenie trafia do skrzynki, PDF wysyła opiekun (plik `docs/tresci/prokominstalacje-checklista.pdf` przygotowany w czacie przed I16b). Automatyczna wysyłka = etap 2.
- Zmiany w `lib/inquiry` robi **I11** (po SW7). I16c tylko podpina formularze do gotowych reguł Instalacji.

### 4. Nawigacja (dane/nawigacja.ts)
- Desktop: pozycja „Dla architektów” między „Dla kogo ▾” a „Realizacje”, w kolorze akcentu (klasa jak w prototypie `.nav a.arn`).
- Mega menu „Dla kogo”: link „Architekt lub projektant? Współpraca →” w panelu promocyjnym.
- Telefon: arkusz „Więcej” — pierwsza pozycja „Dla architektów” (ikona `ruler`).
- Stopka: kolumna „Firma” — pierwsza pozycja „Dla architektów”.
- Strona główna: szyna sekcji dostaje pozycję `architekci` (ikona `ruler`) po „Usługi”.

### 5. Strona główna
Sekcja `#architekci` w `InstHome` po `#uslugi`, przed `#realizacje` (wzorzec: `prototyp/start.html`, źródło `zrodlo/pages/Main.body.html` i `Main.js` → `arhm`, `arsc`). Używa `ArchHouseScene` w wersji kompaktowej (bez paska warstw, karta pod rysunkiem). Bez ograniczenia ruchu: autoodtwarzanie widoków co ok. 4 s, do pierwszego dotknięcia.

### 6. Treść i fakty
- Każda liczba i zdanie o przepisach ma źródło w `prokominstalacje-architekci-zrodla.md`. Na stronie brak przypisów. Przy przepisach zdanie: „Opisujemy przepisy, które dotyczą instalacji. To nie jest porada prawna. Stan na …” z datą z `dane/architekci.ts` (`przepisyStan`).
- **Nie piszemy, że smart home podnosi cenę lokalu** (Otodom 2023 pokazuje coś odwrotnego).
- Marki spoza obecnej oferty tylko jako „np. …”. Karty z niepotwierdzoną dostępnością są wersjami roboczymi do decyzji szefa.
- Zgodność ze spec §2 (24 h = odpowiedź, gwarancja 24 mies. na montaż, bez pakietu odbiorowego, bez cen sprzętu, bez list źródeł).

## Konsekwencje
- Instalacje mają **11 bloków** (było 10 po „Poprawkach I0”).
- Nowa kolekcja i grupa pól ustawień = migracja (`migrate:create` po rebase na develop, ADR-009).
- Plan: sesje **W-A** (docs) i **I16a/b/c** (≈4,5 wieczoru), zmiany w promptach I3, I6, I13, I14. Razem ≈ 31,5 wieczoru.
- Ryzyko: długa strona na telefonie → sekcje zwijane (`fold.json`), przekrój przesuwany palcem, karta punktu pod rysunkiem.
- Ryzyko prawne: przepisy się zmieniają → I13 ma punkt kontrolny „sprawdź stan WT/GIA/EPBD/najmu”, a data stanu jest widoczna na stronie.

## Poprawki W-A (28.10.2026, develop 787876b — po scaleniu I2)
Sprawdzone na repo po I0–I2; pakiet dopasowany do stanu kodu:
1. **Liczba bloków:** ADR-I002 liczył „10 bloków” razem z opcjonalnym `InstCta` (9 pewnych + `InstCta` ewentualnie). Po W-A: **10 pewnych + `InstCta` ewentualnie** — razem 11, w ADR-I002 §0 dopisany `InstArchitects`. Nadal daleko poniżej progu ADR-010.
2. **Nawigacja:** `dane/nawigacja.ts` z I2 nie zna jeszcze pozycji „Dla architektów”, a `seed/prokominstalacje/wspolne.json` zostaje bez zmian (v4.0). I3 dopisuje pozycje z §4 ręcznie w `dane/nawigacja.ts` (wzorzec: `prototyp/*.html` v4.2, `zrodlo/common.js` → `mmore`, `zrodlo/header.html`, `zrodlo/footer.html`); `write-dane.ts` nie nadpisuje ręcznie edytowanego pliku.
3. **Strona w seedzie:** `seed:instalacje` (I2) tworzy puste wersje robocze stron z listy `PAGE_FILES` w `src/seed/instalacje/map.ts`. `dla-architektow` dopisuje tam I16a (prompt I16a pkt 1) — W-A nie zmienia kodu.
4. **Zrzuty seeda:** `strony-zrzut/Architekci.json` i nowe klucze `Main.json` (`arhm`, `arsc`) zapisane bez kluczy wspólnych (`K`, `SV`, `nav`, `mmore`…), tak jak pozostałe zrzuty — te są w `wspolne.json`. Import I2 czyta z `Main.json` tylko `dane.u` i `dane.rl`, więc nowe klucze go nie zmieniają.
5. **Formularze:** bez zmian względem §3 — zgodne z „Poprawkami I0” (kategorie w `category`, bez nowych kolumn, bez uploadu w v1); reguły linii powstają w I11, dlatego formularze strony są w I16c.
