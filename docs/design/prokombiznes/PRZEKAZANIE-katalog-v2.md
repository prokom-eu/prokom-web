# Katalog v2 — jak wgrać i polecenie dla Claude Code (22.10.2026)

## Kolejność
1. Kończysz bieżącą sesję normalnie (`/przeglad` → `/pr` → merge).
2. Łatka v20 i **D1** (jeśli jeszcze nie zrobione) — bez zmian.
3. **K1 — katalog v2: dane i model** (ta łatka). Robimy **przed B5**, żeby katalog i strona produktu powstały od razu na 225 pozycjach.
4. Dalej według planu: B3c → B5 → B6 → …

## Wgranie plików (komputer domowy)
```powershell
.\scripts\start.ps1
git switch -c feat/katalog-v2
# skopiuj z paczki z zachowaniem ścieżek:
#   seed\prokombiznes\katalog.json            (nadpisuje — zawiera wszystkie 225 pozycji)
#   seed\prokombiznes\media-produkty-v2.json  (nowy)
#   seed\prokombiznes\media\produkty\         (nowy katalog, 567 zdjęć)
#   seed\prokombiznes\media\logo-*.svg|webp   (5 nowych logo)
#   docs\design\prokombiznes\ZMIANY-katalog-v2.md, PRZEKAZANIE-katalog-v2.md
#   docs\design\prokombiznes\screens\katalog-v2\
# stare zdjęcia p-*.webp zostają (usługi i strona główna z nich korzystają)
claude
```

## K1 — polecenie (wklej w trybie planowania)
```
/zadanie K1 — katalog v2: 225 pozycji, 23 kategorie, galerie (docs/design/prokombiznes/ZMIANY-katalog-v2.md)
Pliki łatki są już w repo (seed/prokombiznes/katalog.json, media-produkty-v2.json, media/produkty/, screens/katalog-v2/) — sprawdź git status.
Przeczytaj ZMIANY-katalog-v2.md w całości. Zakres:
1. Model Products (ADR-012): pola subcategory, gallery (Media, wiele, kolejność), variants, sources {productPages[], datasheets[], checkedAt}, batch (0/1/2), contentStatus (gotowe/do-sprawdzenia), legacyIds. Migracja up → down → up czysta.
2. CatalogCategories: 3 nowe rekordy (wagi, kody, vend) w grupie sprz, zmiana nazwy i opisu akc — z seeda.
3. seed:biznes: idempotentny import 225 pozycji (dopasowanie po slug, potem legacyIds), 32 marek, 23 kategorii; Media z media-produkty-v2.json (source = pole „zrodlo”). Usługi i produkty z v20 aktualizowane, nie dublowane.
4. catalog-index: sprawdź rozmiar (< 50 KB gzip); jeśli większy — skróć korzysc w indeksie do 80 znaków.
5. ADR-012: dopisz „Rozstrzygnięcia 22.10 — katalog v2” (pola i kategorie z ZMIANY §1–2). Spec docs/strony/prokombiznes.md §5: 23 kategorie, 225 pozycji, podkategorie w akc i kody. docs/zadania/prokombiznes.md: K1 przed B5, w B5/B6 odwołanie do ZMIANY-katalog-v2 §4. docs/STAN.md: „Następne”.
Bez UI (katalog i produkt robią B5/B6). Gotowe: testy seeda (dwa uruchomienia = te same liczby), w panelu 225 pozycji z galeriami, test „zero cen” przechodzi. Gałąź feat/katalog-v2. Plan maks. 15 linii, czekaj na „ok”.
```

## Dopiski do promptów B5 i B6
- **B5:** „Dane z katalogu v2: 225 pozycji, 23 kategorie, chip podkategorii w `akc` i `kody` (ZMIANY-katalog-v2 §4). Wzorzec: `screens/katalog-v2/`.”
- **B6:** „Galeria z `gallery`, lista `variants`, zakładka Dokumenty z `sources.datasheets` (linki do producenta). Pozycje z `contentStatus = do-sprawdzenia` wyglądają tak samo.”
