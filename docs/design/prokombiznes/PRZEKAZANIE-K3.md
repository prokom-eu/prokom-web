# prokombiznes.pl — przekazanie K3 (pełna oferta + telefon jako aplikacja), 25.10.2026

Ten plik mówi Claude Code, **co jest w paczce K3, gdzie to wgrać, co zastępuje i w jakiej kolejności budować**. Szczegóły modelu, importu i stron: `docs/design/prokombiznes/K3-KATALOG.md` (przeczytaj w całości przed każdą sesją K3).

## 1. Zawartość (po rozpakowaniu w katalogu głównym repo)

| Ścieżka | Co to |
|---|---|
| `docs/design/prokombiznes/PRZEKAZANIE-K3.md` | ten plik |
| `docs/design/prokombiznes/K3-KATALOG.md` | specyfikacja K3: pola, import, przekierowania, strony produktu / marek / zestawów, plansze, telefon, polecenia sesji |
| `docs/design/prokombiznes/k3/screens/` | **wzorzec wyglądu — 24 zrzuty**: `App-*-390-light/dark.webp` (aplikacja na telefon, 17 stanów) i `Web-*-1440-light/dark.webp` (produkt, kategoria, zestawy, zestaw, marka) |
| `docs/design/prokombiznes/k3/boards/` | plansze źródłowe `.dc.html` z obrazami w `media/` i `support.js` — podgląd lokalny (§4); teksty, odstępy, kolory i stany do odczytania z kodu planszy |
| `seed/prokombiznes/k3/katalog-k3.json` | 243 karty (230 produktów i programów + 13 usług) |
| `seed/prokombiznes/k3/slowniki-k3.json` | grupy, kategorie z podkategoriami, branże, 32 marki z opisami (31 ze stroną) |
| `seed/prokombiznes/k3/zestawy.json` | 23 gotowe zestawy (+ pola wewnętrzne tylko do panelu) |
| `seed/prokombiznes/k3/plansze-k3.json` | 8 plansz „Plan Twojej firmy”, 78 punktów + zestawy pod planszą |
| `seed/prokombiznes/k3/usuniete.json` | 79 kart do ukrycia + przekierowań |
| `seed/prokombiznes/k3/media/produkty/<slug>/` | galerie (WebP, przezroczyste tło, kwadrat, maks. 1200 px) |
| `seed/prokombiznes/k3/media-k3.json` | pochodzenie zdjęć → `Media.source` |

Paczka przychodzi w trzech plikach (limit 30 MB): `prokombiznes-k3.zip` (docs + JSON + wzorzec), `prokombiznes-k3-zdjecia-1.zip`, `prokombiznes-k3-zdjecia-2.zip` — rozpakować wszystkie trzy do katalogu głównego repo (ścieżki się uzupełniają).

**Nie wgrywać:** `WEWNETRZNE-ceny-orientacyjne-k3.json`, `K3-przeglad.xlsx` (zostają u Krystiana).

## 2. Co zastępuje

| Było | Teraz |
|---|---|
| `K2-TRESCI.md` + `seed/prokombiznes/tresci-k2*.json` | **K3** — jeśli K2 nie było importowane, pomiń K2 całkowicie; jeśli było, K3a nadpisze treści (dopasowanie po `legacyIds`) |
| prompt B7b w `AUDYT-B11.md` §9 (dane z `FPS` w `boards/Main.dc.html`) | B7b w `K3-KATALOG.md` §11 — punkty z `plansze-k3.json`, bez `PINFO` |
| `AUDYT-B11.md` §5 „Telefon — kierunek” i `boards/Mobile.dc.html` | **M1 wg `k3/screens/App-*`** (dolny pasek 5 zakładek, menu-arkusz, przyklejone CTA) |
| `ZMIANY-katalog-v2.md` §1 (225 pozycji, 32 marki, Honeywell) | `K3-KATALOG.md` §1 (243 karty, 31 marek ze stroną, bez Honeywell i StorageCraft) |
| Elementy wspólne v20 (nagłówek, stopka, mega menu, Main) | **bez zmian** — plansze K3 desktop mają uproszczony nagłówek tylko dla czytelności; w kodzie zostają komponenty z B3 |

## 3. Kolejność w repo

1. **W-K3** — wgranie paczki (gałąź `docs/prokombiznes-k3`, tylko pliki, bez kodu) → PR → merge.
2. Dane firmy w panelu + **F1** (jeśli jeszcze nie scalone) — bez zmian względem `AUDYT-B11.md`.
3. **KD** — tylko dokumenty: K3 wpisane do spec., ADR-012, planu sesji i STAN (prompt niżej).
4. **K3a** → **K3b** → **K3c** → **B7b (K3)** → **M1** — prompty w `K3-KATALOG.md` §11.
5. Staging: formularze, maile, Lighthouse, tryb ciemny → akceptacja szefa w Asanie → produkcja.

Jedna sesja = jedna gałąź = jeden PR. Każda sesja: plan maks. 15 linii, czekaj na „ok”; na koniec zrzuty Playwright porównane z `k3/screens/` (i z `screens/` v20 dla stron, których K3 nie zmienia), `/przeglad`, `/koniec-sesji`, `/pr`.

## 4. Jak oglądać plansze lokalnie

Plansze `.dc.html` działają w przeglądarce przez `support.js` (bez budowania):
```
cd docs/design/prokombiznes/k3/boards
python -m http.server 8765        # albo: npx serve -l 8765
```
Otwórz `http://localhost:8765/Aplikacja.dc.html` (klikalny prototyp telefonu — ustaw okno na 390 px) albo `App-*.dc.html` / `Web-*.dc.html`. `Strona.dc.html` i `Aplikacja.dc.html` to komponenty-źródła; pozostałe pliki tylko je wczytują z innym stanem (`ekran`, `arkusz`, `widok`, `ciemny`).
**Nie przenosimy architektury plansz** (`<sc-for>`, `DCLogic`, dane w pliku) — plansza = wzorzec wyglądu i zachowania; dane zawsze z bazy (seed K3).

## 5. Prompty

### W-K3 — wgranie paczki
```
/zadanie W-K3 — wgranie paczki K3 (bez kodu)
Gałąź docs/prokombiznes-k3 z develop. Rozpakowałem do katalogu głównego: prokombiznes-k3.zip, prokombiznes-k3-zdjecia-1.zip, prokombiznes-k3-zdjecia-2.zip.
1. Sprawdź, że są: docs/design/prokombiznes/PRZEKAZANIE-K3.md, K3-KATALOG.md, k3/screens (24 pliki), k3/boards (+ media, support.js), seed/prokombiznes/k3/*.json, seed/prokombiznes/k3/media/produkty (≈215 folderów).
2. JSON: każdy plik się wczytuje; w katalog-k3.json 243 karty; w polach publicznych (poza uwagi, zrodla, uwagi_wewnetrzne, do_potwierdzenia) brak: „zł” z kwotą, „w cenie”, „gratis”, Novitus, Honeywell, Verifone, Datalogic — wypisz wynik.
3. Nie dodawaj WEWNETRZNE-ceny-orientacyjne-k3.json ani xlsx (dopisz do .gitignore wzorzec *WEWNETRZNE*).
4. Commit „docs: paczka K3 prokombiznes (katalog 243, zestawy, marki, plansze, telefon)”, PR do develop z listą plików i wynikiem kontroli.
Bez zmian w src/. Plan maks. 10 linii, czekaj na „ok”.
```

### KD — dokumenty K3 (bez kodu)
```
/zadanie KD — K3 w dokumentacji (docs/design/prokombiznes/PRZEKAZANIE-K3.md, K3-KATALOG.md)
Tylko dokumenty, zero zmian w src/ i w migracjach.
1. docs/strony/prokombiznes.md: §5 katalog (243 karty, podkategorie w komp/serw/av z adresami /katalog/{kat}/{podkat}, chipy w akc/kody/wagi, 31 marek), §6.2 produkt (sekcje wg K3-KATALOG §5: Wybierz wersję, FAQ, W zestawach), nowe podrozdziały: Gotowe zestawy (/zestawy, /zestawy/[slug]), Strony marek (/marki/[slug]), Plan Twojej firmy (dane z plansze-k3.json), Telefon jako aplikacja (wg k3/screens/App-*); w nagłówku sekcji wpisz „źródło: K3-KATALOG.md”.
2. ADR-012 — dopisz „Zmiany K3 (25.10)”: Products (brand, subcategory, configurator, faq, packages, variants {name,difference}, specs {label,value}), Brands (pola z §6), nowa kolekcja Bundles (§7, status gotowe/do-sprawdzenia), FloorPlans/punkty (§8), ukrywanie usuniętych + 301. Status: przyjęta.
3. docs/zadania/prokombiznes.md — dopisz sesje W-K3, KD, K3a, K3b, K3c, B7b (K3), M1 z kryteriami „Gotowe” z K3-KATALOG §11; K2 oznacz „zastąpione przez K3”, stare B7b z AUDYT-B11 „zastąpione”.
4. K2-TRESCI.md, ZMIANY-katalog-v2.md, AUDYT-B11.md §5 i §9 (B7b) — na górze dopisek „Zastąpione przez K3 (25.10) — patrz PRZEKAZANIE-K3.md” (bez usuwania treści).
5. docs/STAN.md — sekcja „Następne”: kolejność z PRZEKAZANIE-K3 §3.
Gotowe: PR z samymi plikami .md, w opisie lista zmienionych sekcji. Plan maks. 15 linii, czekaj na „ok”.
```

### K3a, K3b, K3c, B7b (K3), M1
W `K3-KATALOG.md` §11 — skopiuj dosłownie. Do każdego promptu z UI dopisz:
```
Wzorzec: docs/design/prokombiznes/k3/screens/<plik> (zrzuty 1440/390, jasny/ciemny); wartości i stany: k3/boards/<plik>.dc.html (podgląd: PRZEKAZANIE-K3 §4). Teksty i odstępy przenosimy z planszy; dane z bazy.
```
Mapowanie zrzutów: K3b → `Web-Produkt-*`, `Web-Kategoria-*`, `Web-Marka-*`; K3c → `Web-Zestawy-*`, `Web-Zestaw-*`; B7b → plansza `Main` v20 (rzuty) + dane `plansze-k3.json`; M1 → wszystkie `App-*` (`App-Produkt-caly`, `App-Zestaw`, `App-Start` w całej długości).

## 6. Przed produkcją (poza kodem)
- Decyzje Krystiana i pytania do szefa: `K3-przeglad.xlsx` (u Krystiana) — m.in. lista zgodności w 20 zestawach (do tego czasu `do-sprawdzenia` = widoczne bez indeksowania), Neptun 2 (skaner Datalogic), Sunmi K2 + GoKiosk, zdjęcia Dibal VC (logo CELY), „reakcja do 1 h” w kartach serwisu, pakiety opieki IT.
- 3 usługi `do-akceptacji-szefa` (opieka, przegląd IT, kopie) — nieopublikowane do decyzji szefa.
- Logo APC, TP-Link, Adobe — brak plików; na stronie nazwa tekstem.
- Dane z panelu: adresy i godziny sklepów (na planszach [ADRES] / [GODZINY]).
