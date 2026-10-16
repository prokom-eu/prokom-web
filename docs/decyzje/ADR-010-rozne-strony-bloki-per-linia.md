# ADR-010: Bardzo różne strony w jednej aplikacji — bloki i układ per linia

- **Status:** przyjęta
- **Data:** 2026-10-16
- **Decyduje:** Krystian

## Kontekst
Strony linii nie będą wariantami jednego szablonu. Biznes powstaje stopniowo i będzie bardzo rozbudowany (kategorie oferty, branże, partnerzy, formularz z wybraną kategorią). Instalacje, Software i hub pro-kom.eu będą wyglądać i działać inaczej, a ich specyfikacji jeszcze nie ma. ADR-006 daje wspólny model (`Pages` + bloki generyczne, kolekcje per specyfikacja), ale nie mówi, **gdzie mieszkają różnice** w blokach i układzie. Ograniczenia: jedna osoba, jeden panel dla szefa, jedna baza z migracjami (ADR-001, ADR-009), wspólna marka (ADR-007).

## Opcje
| Opcja | Zalety | Wady | Koszt |
|---|---|---|---|
| A. Tylko bloki generyczne, różnice przez opcje bloków (warianty) | najmniej kodu | bloki puchną od przełączników, strony zaczynają wyglądać podobnie, każda zmiana dotyka wszystkich linii | niski na start, rosnący |
| B. Wspólne `Pages` + **rejestr bloków z listą dozwolonych per linia**; bloki jednej linii w `src/sites/<linia>/blocks`; własny nagłówek/stopka/układ per linia | jeden panel i jedna baza; linia dostaje swoje bloki bez wpływu na inne; edytor widzi tylko bloki swojej strony | rejestr do zbudowania w S5; więcej bloków = więcej tabel w bazie | mały (S5), potem 1 blok = 1 wpis + migracja |
| C. Osobne kolekcje stron per linia (`BiznesPages`, …) | pełna swoboda modelu | duplikacja pól, wersji i podglądu ×4; migracje ×4; trudniej o wspólne komponenty | wysoki |
| D. Osobne aplikacje per strona | pełna niezależność | przeczy ADR-001: 4 wdrożenia, 4 panele | bardzo wysoki |

## Decyzja
Wybieramy **B**, ponieważ różnice między stronami są głównie w blokach i układzie, a nie w samym modelu strony (szkic, publikacja, SEO, podgląd są wszędzie takie same). Zasady:
- **Rejestr bloków** (S5): jedna lista wszystkich bloków + mapa `linia → dozwolone bloki` (klucz: pole `line` tenanta: `prokom`, `biznes`, `instalacje`, `software`). Pole bloków w `Pages` używa `filterOptions` (Payload 3.90: dostaje dokument z `tenant`, blok spoza listy odrzuca walidacja przy zapisie — reguła działa też po stronie serwera, nie tylko w panelu).
- **Gdzie leży blok:** blok używany przez jedną linię — `src/sites/<linia>/blocks/`; do `src/blocks/` (wspólne) trafia dopiero, gdy potrzebują go co najmniej dwie linie. Nie kopiujemy bloku między liniami — przenosimy go do wspólnych.
- **Układ per linia:** nagłówek, stopka i szkielet strony mogą być własne dla linii (`src/sites/<linia>/`), z domyślnym wspólnym. Kolory, kroje i znak zawsze z tokenów marki (ADR-007).
- **Kolekcje specyficzne** (oferta Biznesu, realizacje Instalacji, portfolio Software) — jak w ADR-006: ze specyfikacją strony, włączone tylko dla swojej linii.
- Na start S5 każda linia ma dozwolone wszystkie bloki generyczne.

## Konsekwencje
- S5 rozszerza się o rejestr bloków i test: blok spoza listy linii jest odrzucany przy zapisie, a renderer nie wyświetla bloku nieznanego dla linii.
- Nowy blok dla jednej linii = komponent w `src/sites/<linia>/blocks` + wpis w rejestrze + migracja (każdy blok to tabele w PostgreSQL). Usunięcie bloku z listy nie kasuje treści, ale strona z takim blokiem nie zapisze się, dopóki edytor go nie usunie.
- Nie modelujemy z góry Instalacji, Software ani huba — ich bloki powstają z ich specyfikacjami.
- Wracamy do decyzji, gdy: liczba bloków przekroczy ~30 i panel stanie się nieczytelny, albo któraś linia będzie potrzebować innego modelu stron niż `Pages` (wtedy nowy ADR, nie zmiana po cichu).
