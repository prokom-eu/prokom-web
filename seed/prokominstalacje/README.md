# Seed prokominstalacje.pl

Treści stron wyciągnięte automatycznie z wizualizacji v4.0 (27.10.2026) — **dokładnie te teksty, które są w prototypie**. Import: `pnpm seed:instalacje` (sesja I2, ADR-I002 §5).

| Plik | Zawartość | Dokąd |
|---|---|---|
| `wspolne.json` | `K` dane kontaktowe (placeholdery `[TELEFON]` itd.), `SV` 10 usług, `SG` 12 obiektów, `HU` kolory usług, `megaCols`/`segCols` menu, `bnav`/`mmore`/`mtabs` nawigacja telefonu, `offerN` liczby oferty | ustawienia firmy/tenanta, `InstServices`, `InstObjects`, nawigacja w kodzie |
| `obiekty/<klucz>.json` (12) | pełne dane stron „Dla kogo”: `hero`, `hs` (opisy punktów sceny), `pr`, `prob`, `day`, `law`, `gory`, `real`, `prep`, `pkgs`, `faq`, `rel`, `anc`, `cta`, `fold`, `title`, `desc` | `InstObjects` |
| `strony-zrzut/<Strona>.json` (32; v4.2: nowy `Architekci.json`, `Main.json` z `arhm` — teksty sekcji `#architekci` — i `arsc` — stan przekroju) | stan początkowy każdej strony (motyw jasny): wszystkie teksty i dane sekcji; `_title`, `_description` = SEO | `InstServices` (hero, `pkgs`, `cena`, `faq`, `rel`, `segRel`, `sx`, cta) + pliki danych widżetów `src/sites/instalacje/dane/*.ts` |
| `architekci/` | strona `/dla-architektow` (v4.2, 28.10.2026): `strona.json` (sekcje), `przekroj.json` (17 punktów z liczbami), `nowe-rozwiazania.json` (20 pozycji `InstArchNews`) — opis w `architekci/README.md`; import w I16a–c (ADR-I005), **nie w `seed:instalacje` z I2** | `dane/architekci.ts`, `dane/przekroj.ts`, `InstArchNews` |
| `oferta-76.json` | **pełna oferta: 76 rozwiązań w 10 obszarach** (z `common.js → offer()`), słownik kategorii filtra | `InstSolutions` |
| `adresy.json` | mapa `X.dc.html` / `slug.html` → adres publiczny; `zdjecia`: `ev/*.webp` → `/instalacje/ev/*.webp` | zamiana linków i ścieżek przy imporcie |

Zasady importu:
- Klucze UI (`cls`, `on`, `pick`, `go`, `tch`, stany widżetów) pomijać — to stan prototypu, nie treść.
- `ikona:<nazwa>` = klucz ikony z `docs/design/prokominstalacje/zrodlo/common.js → icons()`. `[svg-path]` = geometria rysunku (zostaje w komponencie SVG, nie w bazie).
- Źródła-przypisy (`law.items[].src`, `gory.items[].src`, poradnik `ar.src`, listy `src` stron) są **już usunięte**. Pozostałe klucze `src` to dane do importu: zdjęcia ładowarek (`Ladowarki.json`), źródła dźwięku (`Naglosnienie.json`), teksty (`Alarmy.json dm.src`, `Monitoring.json feats[].src`).
- `strony-zrzut/Oferta.json` ma listę zwiniętą (po 3 na obszar) — pełna lista tylko w `oferta-76.json`.
- `strony-zrzut/Seg*.json` dublują `obiekty/*.json` — importujemy z `obiekty/`.
- Realizacje (`Main.json → rl`, `Realizacje.json`) zawierają prawdziwe nazwy klientów — import tylko jako wersje robocze bez zgody (ADR-I002 §2).
- Pełna mapa plik → kolekcja: ADR-I002 §5.
- `[CENA]`, `[TELEFON]`, `[E-MAIL]` itp. to placeholdery do uzupełnienia w panelu przez szefa — test e2e pilnuje, żeby nie trafiły na produkcję.
- Kolejność elementów w tablicach = kolejność na stronie.

Gdy treść trzeba zmienić przed importem — zmieniamy w czacie i oddajemy nowy plik seeda (albo od razu w panelu po imporcie), nie w pliku prototypu.
