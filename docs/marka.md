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
| `--c-instalacje` (Turkus Morskiego Oka) | `#0093B3` | `#12B6D8` | prokominstalacje.pl |
| `--c-software` (Fiolet Kodu) | `#8B61E3` | `#9670EE` | prokomsoftware.pl |
| `--c-tech` (Czerwień) | `#D13A2E` | `#E2483A` | PRO-KOM Tech (prokomserwis.pl) |
| `--c-zakopane` (Bursztyn) | `#DD8600` | `#F29A00` | PRO-KOM Zakopane |
| `--c-grafit` | `#121613` | — | tekst, napis PRO-KOM, ciemne tła |
| `--c-papier` | `#F4F5F1` | — | jasne tła sekcji |
| `--c-white` | `#FFFFFF` | — | tło |

**W kodzie:** layout tenanta ustawia atrybut `data-line="biznes"` na `<html>`; CSS mapuje go na `--accent`, `--accent-on-dark`, `--accent-text`. Komponenty używają wyłącznie `--accent*`, nigdy konkretnego koloru linii.

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

## Kroje pisma
- **Archivo** — logo, nagłówki. **Manrope** — teksty. Licencja SIL OFL (bezpłatnie, także komercyjnie).
- Hostowane **z naszego serwera** (`next/font/local` lub `next/font/google` w trybie self-host przy buildzie) — żadnych zapytań do Google Fonts z przeglądarki klienta (RODO).

## Pliki znaku (`public/brand/`)
Nazwy jak w paczce: `prokom-<linia>_<układ>_<wersja>.svg`
- linie: `prokom`, `biznes`, `instalacje`, `software`, `tech`, `zakopane`
- układy: `poziome`, `pionowe`, `sygnet`, `sygnet-bez-tla`, `slogan`
- wersje: `kolor`, `negatyw`, `czarny`, `bialy`, `mono`

Do repo trafiają tylko potrzebne SVG (poziome + negatyw dla aktywnych linii, sygnety) oraz favicony i ikony (`favicon.ico`, `favicon.svg`, 180/192/512 px). Rastrów, PDF, EPS i plików źródłowych **nie** trzymamy w repo.

> ⚠️ **Przed użyciem logotypów Instalacje i Zakopane:** pliki w paczce mają kolory sprzed zamiany (Instalacje bursztyn, Zakopane turkus) — trzeba je wygenerować ponownie (Instalacje → turkus, Zakopane → bursztyn). Logotypy PRO-KOM, Biznes, Software i Tech są aktualne.

## Zasady znaku
- Pole ochronne: 0,5 H (H = wysokość napisu PRO-KOM).
- Minimalne rozmiary: poziomy z nazwą linii 220 px, bez nazwy 140 px, pionowy 160 px, sygnet w kafelku 32 px, sygnet bez tła 40 px szerokości. Favicon (16–48 px): wersja uproszczona bez kreski.
- Nie zmieniamy proporcji, kolorów, nie dodajemy cieni ani efektów.
- Slogan: wybór szefa — do czasu decyzji nie używamy wariantu `slogan` na stronach.
