# ADR-029: Katalog sprzętu i salony marek na prokominstalacje.pl (silnik katalogu Biznesu dla dwóch linii)

- Status: **proponowana** (18.11.2026, z czatu — do przyjęcia przez Krystiana w sesji INST-K1)
- Data: 18.11.2026
- Decyduje: Krystian (pomysł szefa z Asany 18.11 „MARKA w instalacjach”, potwierdzony przez Krystiana: „Instalacje mają dostać katalog i salony marek jak w Biznesie”)
- Zmienia: spec. Instalacji §2 („na Instalacjach nie ma oferty sprzętu — dobieramy pod obiekt, nie pod markę”) — od teraz jest katalog sprzętu, ale **bez cen** i z tą samą zasadą doboru w tekstach. Powiązane: ADR-012, ADR-017 (K4: `Products`, `CatalogGroups`, `CatalogCategories`, `Showrooms`, `Partners`), ADR-I002 (model Instalacji), ADR-003 (zapytania), ADR-023 (CSS/JS per linia). Plan treści: `docs/tresci/instalacje-katalog-eltrox.md`.

## Kontekst
Kolekcje katalogu są już **per tenant** (`products`, `catalog-groups`, `catalog-categories`, `showrooms` w konfiguracji multi-tenant), a `partners` jest wspólne z polem `tenants`. Trasy katalogu (`/oferta`, `/oferta/[kategoria]/[podkategoria]`, `/produkt/[slug]`, `/marki`, `/marki/[slug]`, `/zapytanie`) leżą w grupie `(biznes)` i wołają `requireLine(params, 'biznes')`. Komponenty są w `src/sites/biznes/components/catalog/…` i mają teksty Biznesu wpisane w trasach (np. `TITLE`, `LEAD`, „Rabka-Zdrój i Podhale”) oraz style w arkuszu Biznesu.

## Decyzja
1. **Jeden silnik katalogu dla dwóch linii.** Dane Instalacji w tych samych kolekcjach z tenantem Instalacje. Żadnej drugiej kopii kolekcji ani komponentów.
2. **Te same adresy na obu domenach:** `/oferta`, `/oferta/[kategoria]/[podkategoria]`, `/produkt/[slug]`, `/marki`, `/marki/[slug]`, `/zapytanie`. Trasy przyjmują linię `biznes` **albo** `instalacje` (`requireLine` z listą). W menu Instalacji pozycja nazywa się **„Sprzęt”** i prowadzi do `/oferta`; teksty Instalacji, które dziś mówią „pełna oferta” o `/uslugi`, zmieniają się na „wszystkie usługi”, żeby nie mylić z katalogiem.
3. **Teksty linii poza kodem tras:** nagłówki, leady, opisy meta, region w tytule, nazwy przycisków i puste stany katalogu w grupie `catalog` ustawień linii (`BiznesSettings`/`InstalacjeSettings` albo `SiteSettings.shared` — decyzja sesji wg istniejącego wzorca), z migracją dodającą i wartościami Biznesu przeniesionymi 1:1 (Biznes wygląda identycznie — test zrzutów/e2e).
4. **Style katalogu wspólne:** reguły katalogu wyjęte z arkusza Biznesu do arkusza katalogu dołączanego przez obie linie (ADR-023: per linia, więc import w obu arkuszach linii). Kolory wyłącznie z tokenów linii — na Instalacjach katalog dostaje turkus Instalacji sam.
5. **Zapytania:** lista zapytania osobna na każdej domenie (pamięć przeglądarki per domena), wysyłka przez `submitInquiry()` z nową kategorią „Instalacje · Sprzęt” (ADR-003, lista kategorii). Powiadomienie na skrzynkę tenanta Instalacji.
6. **Marki (`partners`) a duplikaty treści między domenami:** strona marki (`brandPage`) jest dziś wspólna dla wszystkich tenantów. Marka, która ma stronę na obu liniach (np. Ubiquiti), dostaje **osobny opis per linia** (pole nadpisania per tenant albo osobny dokument salonu `showrooms` z własnym tekstem) — ten sam tekst na dwóch domenach jest zakazany (CLAUDE.md: „nie kopiuj tekstów między domenami”). Jeśli nie ma czasu na nadpisanie: strona marki tylko na jednej linii.
7. **Bez cen, bez koszyka zakupowego** — jak Biznes. Zasady Instalacji zostają: zero cen sprzętu, „24 h” tylko jako odpowiedź na zgłoszenie, gwarancja 24 mies. na montaż (przy produkcie: gwarancja producenta).
8. **Produkty sieciowe** (switche, punkty dostępowe, routery) zostają w katalogu Biznesu; Instalacje linkują do nich zamiast powielać karty. Kamery UniFi Protect i rejestratory UniFi — w Instalacjach.

## Rozważone alternatywy
- **Własne adresy Instalacji (`/sprzet/...`)** — ładniejsze słowo, ale wymaga przepisania wszystkich linków w komponentach (`CATALOG_PATH`, okruszki, JSON-LD) na zależne od linii i nowych tras. Odrzucone na start; można dodać później aliasem 301, jeśli SEO pokaże potrzebę.
- **Osobne kolekcje Instalacji** — podwójne utrzymanie, sprzeczne z ADR-001 i z zasadą „jedna osoba”. Odrzucone.
- **Brak katalogu, tylko linki do Eltrox** — wypuszcza klienta do hurtowni i nie buduje SEO PRO-KOM. Odrzucone.

## Konsekwencje
- (+) Instalacje dostają w kilka wieczorów to, co Biznes budował tygodniami (katalog, filtry, karta produktu, salony, lista zapytania).
- (+) Każda poprawka silnika katalogu działa na obu liniach.
- (−) Refaktor tras i tekstów Biznesu niesie ryzyko regresji Biznesu (produkcja) — warunek: e2e katalogu Biznesu zielone i porównanie zrzutów `/oferta`, kategorii, produktu, `/marki` przed/po.
- (−) Ryzyko KSC: Hikvision i Dahua na liście dostawców wysokiego ryzyka mogą być problemem w ofertach dla gmin (spec. Instalacji: „sprawdzamy przy ofertach dla gmin”). Katalog pokazuje marki informacyjnie; w treści dla gmin bez rekomendacji tych marek — `TODO(krystian)` do decyzji szefa.
