# Katalog v2 — zmiany w danych i modelu (22.10.2026)

> **Zastąpione przez K3 (25.10.2026) — patrz `PRZEKAZANIE-K3.md` i `K3-KATALOG.md`** (katalog 243 karty + K3.1; wniesione do spec. i ADR-012 w KD, 26.10). Treść poniżej zostaje jako historia.

Ten plik ma pierwszeństwo przed `docs/strony/prokombiznes.md` §5 (katalog) i ADR-012 w sprawach kategorii, liczby produktów i zdjęć — do czasu sesji K1, która wpisze zmiany do spec. i ADR.

Wizualizacja: artefakt „prokombiznes.pl · projekt”, **wersja 112** (plansze `Katalog`, `KatalogM`, `Kategoria` — reszta bez zmian względem v20).
Zrzuty: `screens/katalog-v2/`.

## 1. Co się zmieniło

| | Było (v20) | Jest (v2) |
|---|---|---|
| Pozycje w katalogu | 67 (54 produkty + 13 usług) | **225** (212 produktów + 13 usług) |
| Kategorie | 20 | **23** — nowe: `wagi` Wagi sklepowe, `kody` Skanery, kolektory i etykiety, `vend` Automaty vendingowe (wszystkie w grupie `sprz`) |
| `akc` | „Akcesoria POS i wagi” | „Akcesoria POS” — szuflady, drukarki bonów, sprawdzarki cen, osprzęt |
| Marki | 27 | 32 — nowe: Honeywell, Godex, Dibal, Zebra, SATO (logo w `seed/prokombiznes/media/`) |
| Zdjęcia produktu | 1 na produkt | galeria 1–8 zdjęć: `media/produkty/<slug>/<slug>-01.webp …`, kwadrat, maks. 1200 px, WebP |

**Zmienione pozycje, które już były na stronie** (slug bez zmian):
- `tp` → Lenovo ThinkPad T14s Gen 6;
- `tb` → Lenovo ThinkBook 14 Gen 8;
- `tc` → Lenovo ThinkCentre neo 50;
- `mon` → Lenovo ThinkVision P24qd-40;
- `mfp` → Konica Minolta bizhub C301i / C451i / C551i;
- `waga` (Fawag WS-1) przeniesiona do `wagi`;
- `skaner` (Sunmi NS021) przeniesiony do `kody`.

**Decyzje o asortymencie (Krystian, 21–22.10):**
- **Nie sprzedajemy:** Elo, iiyama, Newland, Novitus, Datalogic, Unitech, CipherLab, POS i monitory ELZAB.
- **Wyrzucone z arkusza:** HiStone, Hisense, 2POS, Evolis, Zebex, Brodit, B2B Soft, Sunso, Brady, Seiko, Unitek, COMP, Avtek TS 9, Honeywell CT45XP/PD45, InsERT Sello, Posnet POS-UP, Lenovo M70q, NEC P435.
- **Bez osobnych kart:**
  - moduły GoPOS (CRM, Room Service, Menu Board, Multilokalizacja) — opis na `/gopos`;
  - licencje MagicINFO — w karcie `ds`;
  - elzAPP POS / Sklep — w kartach Elzab T10 i K2 Pay.

## 2. Nowe pola w `seed/prokombiznes/katalog.json` → model `Products`

| Pole w seedzie | Pole w kodzie (propozycja) | Typ | Uwagi |
|---|---|---|---|
| `podkategoria` | `subcategory` | text, opcjonalne | filtr „chip” wewnątrz kategorii `akc` i `kody` (np. „Skanery kodów”, „Drukarki etykiet i metkownice”, „Kolektory danych i tablety”, „Szuflady kasowe”) |
| `galeria` | `gallery` | relacja do `Media`, wiele, kolejność | `zdjecie` = pierwszy element; galeria na stronie produktu (B6) |
| `warianty` | `variants` | array of text | np. „K10 BT/GPRS, BT/WiFi, różowy” — jedna karta, warianty w zakładce/na liście |
| `zrodla.strona_producenta`, `zrodla.karty_pdf`, `zrodla.sprawdzono` | `sources` (group: `productPages[]`, `datasheets[]`, `checkedAt`) | | linki z arkusza; `checkedAt` wypełnia człowiek po weryfikacji parametrów |
| `partia` | `batch` | select 0/1/2 | 0 = na start, 1 = partia 1, 2 = partia 2 — **wszystkie widoczne w katalogu**, pole tylko do planowania treści |
| `status_tresci` | `contentStatus` | select `gotowe` / `do-sprawdzenia` | `do-sprawdzenia` = opis tymczasowy z arkusza; w panelu filtr, na stronie bez różnicy |
| `id_z_arkusza` | `legacyIds` | array of text | idempotentny import (`seed:biznes`) i dopasowanie do arkusza `materialy-prokombiznes.xlsx` |

Pozostałe pola bez zmian (ADR-012). `media-produkty-v2.json` — źródło każdego zdjęcia (`Media.source`).

## 3. Zasady treści (bez zmian, przypomnienie)
- Opis („korzyść”) w partii 1 i 2 jest **tymczasowy** — ze źródłowego arkusza. Docelowe opisy i parametry przychodzą z czatu „Treści · katalog Biznes” partiami i są wgrywane do seeda albo wpisywane w panelu.
- Parametry tylko ze strony producenta (link w `sources`), z datą sprawdzenia. Bez źródła: pole puste.
- Zero cen. Odznaka `pol` („0 zł przez 12 mies.”) — zostaje tylko po potwierdzeniu szefa ([SZEF]).

## 4. Wpływ na sesje
- **B5 (katalog):** 225 pozycji → „Pokaż kolejne” po 24, liczniki fasetowe, filtr marki z „Pokaż wszystkie marki (32)”, chip podkategorii w `akc` i `kody`.
- **B6 (produkt):** galeria z `gallery` (bez hotspotów dla nowych pozycji), lista `variants`, linki do kart PDF producenta w zakładce „Dokumenty”.
- **Wyszukiwarka (B4):** indeks z 225 pozycji — sprawdzić limit < 50 KB gzip; jeśli przekroczony, skrócić `korzysc` w indeksie do 80 znaków.
- **Mega menu (B3):** kategorie z danych — 3 nowe pojawią się same w grupie „Kasy i sprzedaż”.
