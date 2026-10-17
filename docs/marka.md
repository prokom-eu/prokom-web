# Marka PRO-KOM — tokeny i zasady dla kodu

> Źródło: księga znaku PRO-KOM, wersja 1.0 (13.10.2026), zaakceptowana przez szefa 14.10.2026, z **zamianą kolorów Instalacje ↔ Zakopane** (decyzja 14.10.2026).
> Pliki źródłowe (poza repo): `D:\PRO-KOM\marka\PRO-KOM_znak_2026-10` i `PRO-KOM_ksiega_znaku.pdf`.

## Architektura znaku
- Napis **PRO-KOM** (Archivo, szerokość 118, ExtraBold 800, zamieniony na krzywe) — zawsze grafitowy; na ciemnym tle biały.
- **Myślnik w kolorze linii** (grubość 70%), pod napisem **kreska w kolorze linii** i **nazwa linii wersalikami**, wyrównana do prawej.
- Zmienia się tylko kolor myślnika i kreski oraz nazwa linii. Napis PRO-KOM nigdy nie przyjmuje koloru linii.
- Linie: PRO-KOM (marka główna, bez nazwy), Biznes, Instalacje, Software, Tech (dawniej Serwis), Zakopane.

## Kolory
| Token | Na jasne tło | Na ciemne tło | Użycie |
|---|---|---|---|
| `--c-prokom` (Zieleń Dioda) | `#45A02C` | `#4FB034` | marka główna, hub pro-kom.eu |
| `--c-biznes` (Granat) | `#244FB0` | `#4A7BE0` | prokombiznes.pl |
| `--c-instalacje` (Turkus Instalacji) | `#0093B3` | `#12B6D8` | prokominstalacje.pl |
| `--c-software` (Fiolet Kodu) | `#8B61E3` | `#9670EE` | prokomsoftware.pl |
| `--c-tech` (Czerwień) | `#D13A2E` | `#E2483A` | PRO-KOM Tech (prokomserwis.pl) |
| `--c-zakopane` (Bursztyn Podhala) | `#DD8600` | `#F29A00` | PRO-KOM Zakopane |
| `--c-grafit` | `#121613` | — | tekst, napis PRO-KOM, ciemne tła |
| `--c-papier` | `#F4F5F1` | — | jasne tła sekcji |
| `--c-white` | `#FFFFFF` | — | tło |

**W kodzie:** layout tenanta ustawia atrybut `data-line="biznes"` na `<html>`; CSS mapuje go na `--accent`, `--accent-on-dark`, `--accent-text`. Komponenty używają wyłącznie `--accent*`, nigdy konkretnego koloru linii.
Pliki: tokeny `src/styles/tokens.css` (jedyne miejsce z wartościami kolorów), Tailwind `src/app/(sites)/globals.css` — zna tylko tokeny (`bg-accent-text`, `text-grafit`, `bg-papier`, `border-border`…; domyślna paleta Tailwinda jest wyłączona). Ciemna sekcja ma `data-surface="dark"` — linki i obrys fokusu przechodzą wtedy na `--accent-on-dark`. Brak `data-line` (nieznana domena) = zieleń PRO-KOM.

### Kontrast — ważne (WCAG AA)
Policzone dla kolorów „na jasne tło” (14.10.2026):

| Kolor | na białym | na papierze | biały tekst na kolorze | Mały tekst / przycisk z białym napisem |
|---|---|---|---|---|
| Biznes `#244FB0` | 7,45 | 6,80 | 7,45 | ✅ OK |
| Tech `#D13A2E` | 4,82 | 4,40 | 4,82 | ✅ na białym; ⚠️ na papierze |
| Software `#8B61E3` | 4,27 | 3,90 | 4,27 | ❌ potrzebny ciemniejszy wariant |
| Instalacje `#0093B3` | 3,61 | 3,29 | 3,61 | ❌ potrzebny ciemniejszy wariant |
| PRO-KOM `#45A02C` | 3,32 | 3,04 | 3,32 | ❌ potrzebny ciemniejszy wariant |
| Zakopane `#DD8600` | 2,81 | 2,56 | 2,81 | ❌ potrzebny ciemniejszy wariant |

Zasada: kolory z księgi stosujemy do **logo, kresek, ikon, dużych nagłówków (≥ 24 px lub ≥ 19 px pogrubione) i elementów graficznych** (próg 3:1). Do **zwykłego tekstu, linków i przycisków z białym napisem** każda linia ma token `--accent-text` — przyciemniony odcień tego samego koloru z kontrastem ≥ 4,5:1 na białym i papierze (wyliczany w S6, zapisany tutaj w tabeli i sprawdzany testem).

### `--accent-text` — tekst, linki, przyciski z białym napisem (S6, 17.10.2026)
Ten sam odcień co kolor z księgi, przyciemniony do ≥ 4,5:1 na białym **i** papierze. Wartości w `src/styles/tokens.css` (`--c-<linia>-text`), sprawdzane przez `src/styles/tokens.test.ts`.

| Linia | Kolor z księgi | `--accent-text` | na białym | na papierze |
|---|---|---|---|---|
| PRO-KOM | `#45A02C` | `#367E23` | 5,04 | 4,60 |
| Biznes | `#244FB0` | `#244FB0` (bez zmian) | 7,45 | 6,80 |
| Instalacje | `#0093B3` | `#007994` | 5,04 | 4,61 |
| Software | `#8B61E3` | `#7E58CD` | 5,04 | 4,60 |
| Tech | `#D13A2E` | `#CB382D` | 5,07 | 4,63 |
| Zakopane | `#DD8600` | `#9F6000` | 5,06 | 4,62 |

- Kolory „na ciemne tło” mają ≥ 4,5:1 na grafitowym (Biznes 4,52 i Tech 4,54 — na granicy, ale OK), więc nadają się do linków w ciemnych sekcjach i stopce.
- ⚠️ **Zakopane:** bursztyn z księgi ma 2,81:1 na białym — nie spełnia nawet progu 3:1 dla dużych elementów. Gdy powstanie strona Zakopanego, także duże nagłówki w kolorze linii muszą używać `--accent-text`.

### Kolory pomocnicze
| Token | Wartość | Użycie |
|---|---|---|
| `--c-border` | `#E3E6DF` | obramowania kart i pól (1,5 px) — z briefu `strony/prokombiznes-design.md` |

### Linie z własną wizualizacją (ADR-013, proponowana 17.10.2026)
Linia z zaakceptowaną wizualizacją może mieć własne kolory neutralne (tła, tekst, ciemne bloki) i motyw ciemny — dziś Biznes (`docs/design/prokombiznes/tokens.css`). Kolor linii z księgi i znak bez zmian. Szczegóły i ograniczenia kontrastu: `docs/decyzje/ADR-013-wyglad-linii-z-wizualizacji.md`.

## Kroje pisma
- **Archivo** — logo, nagłówki. **Manrope** — teksty. Licencja SIL OFL (bezpłatnie, także komercyjnie).
- Hostowane **z naszego serwera** (`next/font/local` lub `next/font/google` w trybie self-host przy buildzie) — żadnych zapytań do Google Fonts z przeglądarki klienta (RODO).
- **Wybrane w S6:** `next/font/google` (`src/app/(sites)/fonts.ts`) — Next pobiera pliki przy buildzie i serwuje je z `/_next/static/media`; podzbiory `latin` + `latin-ext` (polskie znaki), Archivo z osią szerokości (`font-stretch-112%`). Build wymaga dostępu do sieci.

## Pliki znaku (`public/brand/`)
Nazwy jak w paczce: `prokom-<linia>_<układ>_<wersja>.svg`
- linie: `glowna` (w kodzie linia `prokom`), `biznes`, `instalacje`, `software`, `tech`, `zakopane` — mapowanie w `src/lib/brand/lines.ts`
- w repo (S6, 17.10.2026): dla `glowna`, `biznes`, `instalacje`, `software` — `poziome_kolor`, `poziome_negatyw`, `sygnet_kolor` (SVG) oraz `favicon.svg`, `favicon.ico`, `apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png`; kreska Instalacji sprawdzona (turkus `#0093B3`)
- układy: `poziome`, `pionowe`, `sygnet`, `sygnet-bez-tla`, `slogan`
- wersje: `kolor`, `negatyw`, `czarny`, `bialy`, `mono`

Do repo trafiają tylko potrzebne SVG (poziome + negatyw dla aktywnych linii, sygnety) oraz favicony i ikony (`favicon.ico`, `favicon.svg`, 180/192/512 px). Rastrów, PDF, EPS i plików źródłowych **nie** trzymamy w repo.

> Paczka plików i księga zostały przegenerowane po zamianie kolorów Instalacje ↔ Zakopane (14.10.2026) — przed skopiowaniem SVG do repo sprawdź, czy kreska Instalacji jest turkusowa, a Zakopanego bursztynowa.

## Zasady znaku
- Pole ochronne: 0,5 H (H = wysokość napisu PRO-KOM).
- Minimalne rozmiary: poziomy z nazwą linii 220 px, bez nazwy 140 px, pionowy 160 px, sygnet w kafelku 32 px, sygnet bez tła 40 px szerokości. Favicon (16–48 px): wersja uproszczona bez kreski.
- Nie zmieniamy proporcji, kolorów, nie dodajemy cieni ani efektów.
- Slogan: wybór szefa — do czasu decyzji nie używamy wariantu `slogan` na stronach.
