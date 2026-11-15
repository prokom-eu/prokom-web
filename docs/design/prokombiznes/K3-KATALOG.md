# K3 — pełna oferta Biznesu: katalog, marki, zestawy, plansze (25.10.2026)

Ten plik ma pierwszeństwo przed `K2-TRESCI.md` i `ZMIANY-katalog-v2.md` w sprawach katalogu, marek, zestawów i planszy „Plan Twojej firmy”. K2 (import opisów) może być już zrobione albo nie — K3 obejmuje wszystko, co było w K2, i idzie dalej. **Jeśli K2 nie było importowane, zrób od razu K3 (pomiń prompt K2).**

## 1. Co się zmienia

| | Było (katalog v2 / K2) | Jest (K3) |
|---|---|---|
| Karty w katalogu | 225 (212 produktów + 13 usług) | **243** (230 produktów i programów + 13 usług) |
| Pełne treści | 0 / 213 | **243**: opis (3 akapity), 10–14 parametrów, wersje, źródła; większość z konfiguratorem wersji, ponad połowa z FAQ |
| Usunięte | — | **79 kart** (decyzje 25.10: Honeywell, Elzab Saturn, kasa Elzab z iiyama, drobne akcesoria, modele wycofane — m.in. Konica 4020i/5020i, Lenovo V14 G4 i IdeaPad Flex 5 — Sunmi D2s Lite) — `usuniete.json` |
| Nowe rodziny | — | Lenovo (ThinkPad, ThinkBook, V, IdeaPad, Yoga, ThinkCentre neo, ThinkVision), Dell (laptopy, komputery, monitory, PowerEdge), Synology, QNAP, APC, Microsoft + Adobe, Samsung (ekrany informacyjne), Sharp/NEC, TP-Link Omada, Avtek, Konica Minolta, Kyocera, GoPOS (moduły), InsERT (pełna linia + InsPunkty) |
| Marki | 32 (z Honeywell, StorageCraft) | **31 marek ze stroną** + PRO-KOM; nowe: **TP-Link, Adobe**; usunięte: Honeywell, StorageCraft |
| Strony marek | brak | **nowe** `/marki/[slug]` — opis, fakty, linie produktów, źródła |
| Gotowe zestawy | brak | **nowe** — 23 zestawy (sklep, gastronomia, noclegi, biuro, gabinet, szkoła, Wi-Fi, kopie, ekrany); 3 `gotowe`, 20 `do-sprawdzenia` do czasu potwierdzenia listy zgodności przez Krystiana |
| Plan Twojej firmy | 79 punktów na starych slugach | **78 punktów** przepiętych na karty K3 + zestawy pod każdą planszą |
| Zdjęcia | 1–8 na kartę, część z białym tłem | nowe galerie z przezroczystym tłem (WebP, kwadrat, maks. 1200 px) dla nowych i odświeżonych kart |

Statusy kart: **230 `gotowe`**, 10 `do-sprawdzenia` (noindex — jak w F1), 3 `do-akceptacji-szefa` (usługi: Opieka informatyczna, Bezpłatny przegląd IT, Kopie zapasowe — **nie publikować** do akceptacji szefa; karta ukryta, adres zwraca 404 albo przekierowanie na `/opieka-it`).

## 2. Pliki w paczce

| Plik | Co to | Import |
|---|---|---|
| `seed/prokombiznes/k3/katalog-k3.json` | 243 karty (`produkty[]`) | tak — idempotentnie |
| `seed/prokombiznes/k3/slowniki-k3.json` | grupy, kategorie (nowe opisy, podkategorie, liczniki), branże, marki z opisami, kolejność wyróżnionych | tak |
| `seed/prokombiznes/k3/zestawy.json` | 23 zestawy + `sprawdzone_zgodnosci` (tylko panel) | tak |
| `seed/prokombiznes/k3/plansze-k3.json` | 8 plansz × punkty + zestawy pod planszą | tak |
| `seed/prokombiznes/k3/usuniete.json` | 79 usuniętych kart z powodem | tylko do ukrycia + przekierowań |
| `seed/prokombiznes/k3/media-k3.json` | pochodzenie zdjęć (domeny producentów) | `Media.source` |
| `seed/prokombiznes/k3/media/produkty/<slug>/<slug>-NN.webp` | galerie | tak (Media) |
| `seed/prokombiznes/k3/media/marki/` | logo Samsung (brakujące: APC, TP-Link, Adobe — nazwa tekstem) | tak |
| `docs/design/prokombiznes/K3-KATALOG.md` | ten plik | — |
| `docs/design/prokombiznes/PRZEKAZANIE-K3.md` | wgranie paczki, co zastępuje, kolejność, prompty W-K3 i KD | — |
| `docs/design/prokombiznes/k3/screens/`, `k3/boards/` | wzorzec wyglądu K3 (zrzuty + plansze) | — |

**Nie ma w paczce i nie wolno importować:** `ceny-orientacyjne-WEWNETRZNE.json` (zostaje u Krystiana). Pole `uwagi` w kartach i `uwagi_wewnetrzne` / `do_potwierdzenia` w zestawach → tylko panel (`internalNotes`), nigdy na stronie, w JSON-LD ani w indeksie wyszukiwarki.

## 3. Pola karty (`katalog-k3.json`) → `Products`

Pola z K2 bez zmian (tabela w `K2-TRESCI.md`): `slug_seed`, `legacyIds`, `nazwa_poprzednia`, `nazwa`, `podtytul`, `korzysc`, `opis`, `cechy`, `parametry`, `warianty_opis`, `dobierz`, `branze`, `zrodla`, `status`, `uwagi`, `kategoria`, `podkategoria`.

Nowe w K3:

| Pole | W kodzie | Typ | Na stronie |
|---|---|---|---|
| `marka` | relacja `brand` | nazwa marki ze `slowniki-k3.json` → `marki[].marka` | logo + link do `/marki/[slug]` |
| `podkategoria` | `subcategory` | text | chip filtra w kategorii (lista i kolejność: `slowniki-k3.json` → `kategorie[].podkategorie`); w `komp`, `serw`, `av` podkategoria ma też slug → adres `/katalog/komp/laptopy` |
| `konfigurator` | `configurator` (group): `opis` text, `opcje[]` {`nazwa`, `wartosci[]`, `uwaga`?}, `popularne[]` {`nazwa`, `konfiguracja`} | opcjonalne (185 kart) | sekcja „Wybierz wersję” (§5.1) |
| `faq` | `faq[]` {`q`, `a`} | opcjonalne | sekcja „Najczęstsze pytania” + JSON-LD `FAQPage` |
| `warianty_opis` | `variants[]` {`name`, `difference`} | w pliku `{model, roznica}` → `model`→`name`, `roznica`→`difference` | lista „Wersje” |
| `pakiety` | `packages[]` {`nazwa`, `dla_kogo`, `w_abonamencie[]`, `poza_abonamentem[]`, `zasady[]`} — tylko karta `opieka` | opcjonalne | pakiety Start / Firma / Firma+ — **dopiero po akceptacji szefa** (karta dziś nieopublikowana); dopiski `[SZEF]` w tekstach = do uzupełnienia, nigdy na stronie |
| `parametry` | `specs[]` {`label`, `value`} | w pliku `{k, v}` | tabela „Parametry” |

Zasada mapowania kategorii: wartości `kategoria` w K3 to już kody kategorii strony (`kasy`, `druk`, … `dof`). Nic nie przeliczaj.

Branże w K3: `handel`, `gastronomia`, `noclegi`, `biura-uslugi`, `szkoly-instytucje`, `zdrowie-uzdrowiska`, `beauty`, `magazyn-produkcja` (nieaktywna, bez strony). Jeśli w bazie branże mają krótkie slugi z v2 (`gastro`, `uslugi`, `szkoly`, `zdrowie`), zrób tabelę mapowania w imporcie, nie zmieniaj adresów stron branż.

## 4. Import (`seed:biznes --k3`)

1. **Dopasowanie** (kolejno): `legacyIds` → `slug_seed` = slug produktu → `nazwa_poprzednia` = nazwa produktu. Nie znaleziono → **nowa karta**, slug URL = `slug_seed`.
2. **Slug URL istniejących kart bez zmian.** Wyjątek — 4 stare karty zastąpione rodzinami (w K3 mają `legacyIds` ze starym slugiem):

   | Stary slug | Nowa karta | Działanie |
   |---|---|---|
   | `tb` | `lenovo-thinkbook-14-g8-g9` | 301 ze starego adresu |
   | `mon` | `lenovo-thinkvision-p-24-27` | 301 |
   | `aio` | `lenovo-thinkcentre-neo-50a-55a` | 301 |
   | `m365` | `microsoft-365-business` | 301 |
   | `tc` (jeśli istnieje) | `lenovo-thinkcentre-neo-50s-55s` | 301 |
   | `mfp` (jeśli istnieje) | `konica-minolta-bizhub-c301i` | 301 |
   | `nas`, `ds`, `srvT`, `ups`, `proj`, `kyo`, `dell`, `qnap`, `ubnt` (jeśli istnieją) | wg tabeli w §8 (plansze) | 301 |

   Przed importem wypisz w raporcie wszystkie istniejące produkty, które **nie** dopasowały się do żadnej karty K3 ani do `usuniete.json` — nie usuwaj ich automatycznie.
3. **Usunięte** (`usuniete.json`, dopasowanie tak samo): `published = false`, poza katalogiem, sitemap i wyszukiwarką; adres → 301 do strony kategorii (pole `kategoria` z pliku). Nie kasuj rekordów (historia zapytań).
4. **Treść** nadpisuje pola z K3 w całości (opis, parametry, wersje, FAQ, konfigurator, źródła). Pola ustawiane ręcznie w panelu, których K3 nie ma (`popularnosc`, `odznaka`, `wyrozniony_na_glownej`, `parametry_kasy`, `typ_kasy`), zostają.
5. **Zdjęcia:** jeśli w `k3/media/produkty/<slug_seed>/` jest galeria → zastępuje galerię produktu (kolejność po numerze, pierwsze = `zdjecie`). Brak folderu → galeria bez zmian. `alt` = nazwa karty + „ — zdjęcie N”.
6. **Słowniki:** kategorie (nazwy, opisy, podkategorie), marki (nowe pola §6), kolejność wyróżnionych na głównej. Honeywell i StorageCraft: ukryć (pasek marek, filtr, licznik).
7. **Idempotencja:** drugi import = zero zmian. Raport: utworzone / zaktualizowane / ukryte / bez dopasowania / zdjęcia podmienione.
8. **Rewalidacja** stron katalogu, kategorii, marek, zestawów i głównej po imporcie.

## 5. Strona produktu (uzupełnienie B6/K2)

Kolejność pod boksem: **Opis** → **Wybierz wersję** (jeśli `configurator`) → **Parametry** → **Wersje** → **Najczęstsze pytania** (jeśli `faq`) → **W zestawach** (jeśli karta jest w zestawach) → **Dokumenty** (źródła) → **Do tego zwykle dobierają** → Podobne. Telefon: akordeon, Opis otwarty.

### 5.1 Wybierz wersję (konfigurator)
- To **nie jest koszyk** i nie liczy ceny. Pokazuje opcje producenta (`opcje[].nazwa` + `wartosci[]` jako chipy, `uwaga` pod spodem drobnym drukiem) i 3 „Najczęściej wybierane” (`popularne[]`).
- Klient zaznacza po jednej wartości w opcji (nieobowiązkowo) → „Dodaj do zapytania” zapisuje w pozycji zapytania notatkę „Wersja: Procesor = …, Pamięć = …”. „Najczęściej wybierane” to 3 kafle: `popularne[i].nazwa` (tytuł) + `konfiguracja` (opis); klik wypełnia notatkę tekstem „{nazwa}: {konfiguracja}”.
- Notatka trafia do maila z zapytaniem i do panelu. Bez zaznaczeń → zapytanie jak dziś.
- `opis` konfiguratora jako jedno zdanie nad chipami.

### 5.2 FAQ
- Akordeon, pierwsze pytanie otwarte. JSON-LD `FAQPage` tylko na stronie produktu ze statusem `gotowe`.

### 5.3 W zestawach
- Kafle zestawów, w których karta występuje (`zestawy.json` → `elementy[].slug`), maks. 3, link do zestawu.

### 5.4 Strona InsPunktów (`insert-inspunkty-ksef`)
- Paczki InsPunktów są w konfiguratorze karty (opcja z liczbą punktów + 3 typowe zestawienia) — bez kwot; CTA „Zapytaj o paczkę InsPunktów”. Osobnej tabeli nie trzeba.

## 6. Strony marek `/marki/[slug]` (nowe)

Dane: `slowniki-k3.json` → `marki[]` (pola: `marka`, `slug`, `kraj_pochodzenia`, `opis_krotki`, `opis[]` 3 akapity, `fakty[]` {k, v, zrodlo}, `linie_produktow[]`, `kategorie_w_katalogu[]`, `strona_producenta`, `zrodla[]`, `logo`, `liczba_produktow`, `strona_marki`).

- Strona tylko dla `strona_marki = true` (31). `ingenico` — bez strony; jego opis to akapit na stronie PolCard („Terminale Ingenico”). `pro-kom` — bez strony, nie liczyć w licznikach marek.
- Układ: logo + nazwa + `opis_krotki` (H1 „{marka} w PRO-KOM”), opis, „Fakty” (tabela k–v, źródło jako link przy wierszu), „Linie produktów”, siatka kart marki (filtr po kategorii, gdy marka ma ≥ 2 kategorie), „Strona producenta” (link zewnętrzny `rel="noopener"`), FAQ ogólne nie są potrzebne.
- Link z: logo na karcie produktu, filtr marki w katalogu („Zobacz markę”), pasek marek na głównej (logo → strona marki zamiast filtra).
- Logo: z bazy jak dziś; brakujące (`logo_brak` w słownikach: APC, Samsung, TP-Link, Adobe) — logo z `k3/media/marki/`, jeśli jest; jeśli nie — nazwa marki tekstem (bez wymyślania grafiki).
- SEO: title „{marka} — {opis_krotki skrócony do 60 zn.} | PRO-KOM Biznes”, JSON-LD `Brand` + `BreadcrumbList`. Sitemap: dodać.

## 7. Gotowe zestawy (nowe)

Kolekcja `Bundles` z `zestawy.json`:

| Pole | Na stronie |
|---|---|
| `slug`, `nazwa`, `seria`, `poziom`, `kolejnosc` | adres `/zestawy/[slug]`; grupowanie po `seria`, kolejność `kolejnosc`; `poziom` jako etykieta (Mały / Średni / Duży / Standard …) |
| `branza`, `branze[]` | strona branży: sekcja „Gotowe zestawy” |
| `dla_kogo`, `korzysc`, `opis[]` | nagłówek, lead, opis |
| `elementy[]` {`slug`, `rola`, `ilosc`, `wariant_sugerowany`, `obowiazkowy`} | lista: zdjęcie i nazwa karty (relacja po slug), rola, ilość, „sugerowana wersja”; `obowiazkowy=false` → etykieta „opcjonalnie” |
| `zamienniki[]` {`zamiast`, `mozna`, `kiedy`} | „Możesz zamienić”: X → Y, kiedy |
| `uslugi[]` | „Co robimy przy wdrożeniu” — karty usług po slug; karty `do-akceptacji-szefa` pomijać |
| `dlaczego_tak[]` | „Dlaczego taki zestaw” — lista |
| `faq[]` | akordeon + `FAQPage` |
| `powiazane[]` | „Zobacz też” |
| `elementy[].do_potwierdzenia`, `uwagi_wewnetrzne`, `uslugi_po_akceptacji_szefa`, `sprawdzone_zgodnosci` | **tylko panel** |

- `status` zestawu (nowe pole, panel): import ustawia `gotowe`, gdy żaden element nie ma `do_potwierdzenia`, inaczej `do-sprawdzenia` (widoczny, `noindex`, poza sitemap — jak produkty). Krystian zmienia status po sprawdzeniu listy.
- CTA: **„Zapytaj o ten zestaw”** dodaje do zapytania wszystkie elementy obowiązkowe (opcjonalne — checkboxy, domyślnie odznaczone) z notatką „Zestaw: {nazwa}; wersja: {wariant_sugerowany}”. Zero cen, zero sum.
- `/zestawy` — lista z filtrem po serii (Sklep, Gastronomia, Noclegi, Biuro, Gabinet, Szkoła, Sieć, Kopie, Ekrany). Wejście: menu „Oferta” → „Gotowe zestawy”, strony branż, plansze, kreator (§9).
- Brak karty elementu (ukryta/usunięta) → element znika, a zestaw dostaje w panelu ostrzeżenie; zestaw bez żadnego obowiązkowego elementu → ukryty.
- JSON-LD: `ItemList` elementów (bez `offers`).

## 8. Plan Twojej firmy — plansze (aktualizacja B7b)

Dane: `plansze-k3.json` → `sceny.{sklep,gastro,hotel,biuro,szkola,gabinet,warsztat,produkcja}`:
- `punkty[]` {`x`, `y`, `slug`, `etykieta`, `opis`, `dodatkowe[]`} — współrzędne w tym samym układzie co `FPS` w `boards/Main.dc.html` (1:1).
- `zestawy[]` — pod rzutem: „Gotowe zestawy dla {sceny}” (kafle).
- Okienko punktu: zdjęcie (1. z galerii), `etykieta`, `opis`, `korzysc` karty, „Dodaj do zapytania” (dodaje `slug` + `dodatkowe[]`), „Zobacz produkt”.
- **Usuń `PINFO` z wzorca** — opisy brać z katalogu (stare teksty miały „w cenie”, „0 zł na start”).
- Punkt z kartą ukrytą/usuniętą → niewidoczny. Pod planszą pokazuj tylko zestawy ze statusem `gotowe`.
- Punkty edytowalne w panelu (kolekcja `FloorPlanPoints` albo pole array w globalu `FloorPlans`), import z pliku idempotentny.

Stare slugi z FPS → K3 (do przekierowań §4, jeśli takie produkty istnieją): `ubnt`→`u7`, `ds`→`samsung-qbc`, `nas`→`synology-diskstation-plus-2-4`, `srvT`→`dell-poweredge-t160-t360`, `ups`→`apc-smart-ups-wieza`, `goposSet`→`gopos`, `drukS`→`druks`, `tc`→`lenovo-thinkcentre-neo-50s-55s`, `mon`→`lenovo-thinkvision-p-24-27`, `mfp`→`konica-minolta-bizhub-c301i`, `proj`→`sharp-nec-projektory-sala`, `kyo`→`kyocera-ecosys-ma4000x-fx-wifx`, `dell`→`dell-pro-essential-14-15`, `qnap`→`qnap-nas-2-4`.

## 9. Pozostałe miejsca na stronie

- **Kategorie:** nowe nazwy i opisy ze słowników (m.in. `kody` „Skanery, etykiety i kolektory”, `m365` „Licencje i oprogramowanie biurowe”, `siec` z TP-Link Omada). Chipy podkategorii w `akc`, `kody`, `wagi`, `komp`, `serw`, `av`; w `komp`/`serw`/`av` podkategoria ma własny adres i H1 (np. „Laptopy dla firm — Lenovo i Dell”), canonical na siebie.
- **Mega menu:** w grupie „Komputery i biuro” pod kategoriami pokazać podkategorie (Laptopy, Komputery i All-in-One, Monitory, Serwery, NAS, UPS, Monitory interaktywne, Ekrany informacyjne, Projektory). Dodać pozycję „Gotowe zestawy”.
- **Strony branż:** sekcja „Gotowe zestawy” (zestawy z `branze` zawierającą branżę, maks. 6) nad listą produktów.
- **Kreator „Dobierz zestaw”:** na ekranie wyniku pokaż pasujące gotowe zestawy: `sklep`→seria sklep*, `gastro`→gastronomia/restauracja/bar, `hotel`→noclegi, `biuro`→biuro*, `gabinet`→`zestaw-gabinet`, `szkola`→szkola, `truck`→`zestaw-gastro-foodtruck`, `warsztat`/`produkcja`→`zestaw-biuro-3-5`, `zestaw-kopie-zapasowe`. Kreator dalej wysyła swoje zapytanie jak dziś.
- **Strony /gopos i /insert:** listy modułów brać z kart (`progb` marki GoPOS; `progs` marki InsERT + `insert-inspunkty-ksef`) zamiast tekstu na sztywno, jeśli dziś są na sztywno.
- **Liczniki** („240 pozycji”, „31 marek”) z danych, jedna funkcja.
- **Wyszukiwarka:** indeks z 240 kart + 23 zestawy + 31 marek; limit < 50 KB gzip — jeśli przekroczony, `korzysc` w indeksie skrócona do 80 znaków, parametry poza indeksem.
- **Sitemap:** + `/marki/*`, `/zestawy`, `/zestawy/*` (bez `do-sprawdzenia`), − usunięte.

## 10. Zasady (nie zmieniać przy imporcie)
- Treści nie edytować w kodzie — tylko import; poprawki w panelu.
- Zero cen, rat, leasingu, „0 zł”, „gratis”, „w cenie” — test „zero cen” rozszerzyć o strony marek, zestawów i plansze.
- Novitus, Honeywell, Datalogic, Barracuda, Streamsoft, Verifone nie występują w treściach publicznych — dodać do testu treści (lista zakazanych słów).
- `uwagi`, `do_potwierdzenia`, `uwagi_wewnetrzne` nigdy na stronie.

## 11. Polecenia dla Claude Code

Kolejność: **W-K3 → KD → K3a → K3b → K3c → B7b (wersja K3) → M1 (telefon jako aplikacja)** — W-K3 i KD w `PRZEKAZANIE-K3.md` §5. Do każdego promptu z UI dopisz wzorzec z `k3/screens/` (mapowanie: PRZEKAZANIE-K3 §5). Każde osobno, plan maks. 15 linii, czekaj na „ok”.

```
/zadanie K3a — import pełnej oferty (docs/design/prokombiznes/K3-KATALOG.md §1–4)
Pliki: seed/prokombiznes/k3/*.json i k3/media/. Przeczytaj K3-KATALOG.md w całości (K2-TRESCI.md tylko jako tło).
1. Model Products: brand (relacja), subcategory, configurator {opis, opcje[{nazwa, wartosci[], uwaga}], popularne[{nazwa, konfiguracja}]}, faq[{q,a}], packages[] (tylko opieka), variants {name,difference} (z {model, roznica}), specs [{label,value}] (z parametry {k,v}) (+ pola K2, jeśli ich nie ma). Brands: kraj_pochodzenia, opis_krotki, opis (rich text), fakty[{k,v,zrodlo}], linie_produktow[], strona_producenta, zrodla[], hasPage. Categories: podkategorie[{slug,nazwa}]. Migracja up→down→up czysta.
2. seed:biznes --k3: dopasowanie legacyIds → slug_seed → nazwa_poprzednia; nowe karty ze slug_seed; usunięte → published=false + 301 do kategorii; 301 dla starych slugów (§4 pkt 2, §8); galerie z k3/media; słowniki; Honeywell i StorageCraft ukryte. Raport jak w §4 pkt 7.
3. Karty do-akceptacji-szefa (opieka, przeglad, kopie) — nieopublikowane.
4. Test „zero cen” i lista zakazanych marek (§10) na całym seedzie i wyrenderowanych stronach.
Gotowe: import 2× = te same liczby; 243 karty, z tego 3 nieopublikowane; 0 bez dopasowania z istniejących (albo lista w raporcie); 301 działają (test); zrzuty: katalog 1440/390, kategoria komp/laptopy.
```

```
/zadanie K3b — strona produktu i strony marek (K3-KATALOG.md §5, §6, §9 kategorie/mega menu/liczniki/wyszukiwarka/sitemap)
1. Produkt: sekcje Wybierz wersję (notatka do pozycji zapytania; zapytanie i mail pokazują notatkę), FAQ (+FAQPage tylko dla gotowe), W zestawach (po K3c pusta lista nie renderuje się), InsPunkty — paczki w konfiguratorze. Telefon: akordeon.
2. /marki/[slug] wg §6 + linki z karty produktu, filtra i paska marek; JSON-LD Brand; sitemap.
3. Kategorie: chipy podkategorii, adresy /katalog/{komp|serw|av}/{podkategoria} z H1 i canonical; mega menu z podkategoriami.
4. Wyszukiwarka: + marki; limit < 50 KB gzip.
Gotowe: zrzuty 1440/390 — Lenovo ThinkBook 14 G8/G9 (konfigurator), Posnet Ergo (FAQ), InsPunkty, /marki/dibal, /katalog/komp/laptopy; e2e: wybór wersji → notatka w zapytaniu i w mailu (Mailpit); axe bez błędów; Rich Results: FAQPage i Product bez błędów.
```

```
/zadanie K3c — gotowe zestawy (K3-KATALOG.md §7, §9 branże i kreator)
1. Kolekcja Bundles z zestawy.json (import idempotentny w seed:biznes --k3), status gotowe/do-sprawdzenia wg §7; pola wewnętrzne tylko w panelu.
2. /zestawy (filtr serii) i /zestawy/[slug]: elementy z kartami, zamienniki, usługi, dlaczego tak, FAQ, „Zapytaj o ten zestaw” (obowiązkowe + zaznaczone opcjonalne, notatka z nazwą zestawu i wersją).
3. Sekcja „Gotowe zestawy” na stronach branż, „W zestawach” na stronie produktu, wynik kreatora wg §9, pozycja w menu.
4. JSON-LD ItemList; sitemap bez do-sprawdzenia.
Gotowe: zrzuty 1440/390 — /zestawy, zestaw-kawiarnia-lada, zestaw-biuro-3-5, strona branży gastronomia; e2e: „Zapytaj o ten zestaw” na zestaw-kawiarnia-lada dodaje 5 obowiązkowych pozycji (+ zaznaczone opcjonalne) z notatką; test „zero cen” zielony.
```

```
/zadanie B7b — Plan Twojej firmy: rzuty lokali (wersja K3: dane z seed/prokombiznes/k3/plansze-k3.json; K3-KATALOG.md §8)
Wzorzec rzutów: docs/design/prokombiznes/boards/Main.dc.html, sekcja #plan (8 × <svg class="fpsvg">). Punkty NIE z FPS/PINFO, tylko z plansze-k3.json.
1. 8 rzutów 1:1 jako komponenty SVG (tokeny, tryb ciemny), ładowane tylko dla aktywnej zakładki.
2. Punkty z pliku → panel (edytowalne), relacja po slug; karta ukryta = punkt ukryty.
3. Desktop: klik → okienko (zdjęcie, etykieta, opis, korzyść karty, „Dodaj do zapytania” = slug + dodatkowe, link do produktu); Tab/Enter/Esc.
4. Telefon (<640 px): rzut na pełną szerokość, punkty ≥ 44 px z numerami, karta od dołu, lista pod spodem zwinięta „Pokaż wszystkie (N)”.
5. Pod rzutem kafle „Gotowe zestawy” ze sceny (po K3c; wcześniej sekcja ukryta). prefers-reduced-motion bez pulsowania.
Gotowe: zrzuty 1440/390 w obu motywach, axe bez błędów, e2e: klik punktu dodaje produkt (i dodatkowe) do zapytania.
```

```
/zadanie M1 — telefon jako aplikacja (wizualizacja: rząd „Aplikacja na telefon — wersja do budowy (M1)”, artboardy Aplikacja.dc.html i App-*.dc.html; K3-KATALOG.md §12)
Dotyczy wszystkich stron Biznesu poniżej 768 px. Desktop bez zmian.
1. Dolny pasek nawigacji (5 zakładek: Start · Oferta · Szukaj · Zapytanie z licznikiem · Kontakt), aktywna zakładka z pigułką; górny pasek 60 px: logo albo „wstecz + tytuł”, lupa, menu. Na stronie produktu, zestawu i zapytania pasek zakładek zastępuje przyklejony przycisk akcji.
2. Menu jako arkusz od dołu (5 działów kafelkami, Gotowe zestawy, Plan, Opieka IT, GoPOS, InsERT, Marki, linki, przełącznik Jasny/Ciemny, „Zadzwoń”). Arkusze: Filtry (Pokaż N pozycji), punkt planu. Zamknięcie: tło, przycisk, Esc, gest w dół.
3. Start według App-Start: hero z wyszukiwarką, 3 szybkie akcje, działy, Najczęściej wybierane (karuzela), Gotowe zestawy (karuzela), Plan Twojej firmy (kafel z wyborem lokalu), Jak pracujemy, marki, kontakt. Ukryte na telefonie: koło działów, „Pięć firm czy jedna”, długa lista branż, pasek marek animowany.
4. Oferta / kategoria / produkt / zestaw / plan / szukaj / zapytanie / kontakt / marka według App-*: przyklejone chipy, siatka 2 kolumny, galeria przesuwana palcem (scroll-snap + kropki), „Wybierz wersję” (chipy + Najczęściej wybierane → notatka w zapytaniu), akordeony, lista zapytania z licznikami i formularzem.
5. Cele dotykowe ≥ 44 px, safe-area (env(safe-area-inset-bottom)) pod paskami, prefers-reduced-motion, tryb ciemny z tokenów.
Gotowe: zrzuty 390×844 każdego ekranu z wizualizacji w obu motywach; Lighthouse telefon ≥ 90; axe bez błędów; e2e: produkt → wersja → dodaj → zapytanie → wyślij; brak poziomego przewijania przy 360 px.
```

## 12. Wizualizacja (artefakt „prokombiznes.pl · projekt K3”) — w repo: `k3/screens/` (24 zrzuty) i `k3/boards/` (plansze do podglądu lokalnego, PRZEKAZANIE-K3 §4)
- **Rząd „K3 · nowe i zmienione strony (desktop)”**: Web-Produkt (ThinkBook 14 — wybór wersji, parametry, FAQ, w zestawach), Web-Kategoria (Laptopy — podkategorie, filtry), Web-Zestawy, Web-Zestaw (Kawiarnia), Web-Marka (Lenovo). Źródło widoków: `Strona.dc.html` (dane z K3). Nagłówek i stopka w tych artboardach są uproszczone — w kodzie zostają komponenty z Main.
- **Rząd „Aplikacja na telefon — wersja do budowy (M1)”**: `Aplikacja.dc.html` (klikalny prototyp) + 17 ekranów `App-*` (te same dane i komponent, różne stany: menu, filtry, punkt planu, tryb ciemny, ekrany w całej długości).
- **Main.dc.html** — plansze „Plan Twojej firmy” mają już punkty K3 (78) i opisy z katalogu (bez PINFO v20). Mobile.dc.html (stara strona główna na telefonie) zostaje tylko jako historia — obowiązuje rząd aplikacji.
- Teksty na ekranach pochodzą z danych K3; miejsca do uzupełnienia oznaczone [ADRES] / [GODZINY] (dane z panelu).
