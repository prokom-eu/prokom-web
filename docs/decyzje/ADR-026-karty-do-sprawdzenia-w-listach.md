# ADR-026: Karty „Do sprawdzenia” w listach Biznesu przed produkcją

- Status: **proponowana** (do decyzji Krystiana; noc 14.11.2026, raport QA-PRODUKCJA pkt 5)
- Data: 14.11.2026
- Decyduje: Krystian
- Powiązane: ADR-012 rozstrzygnięcie 15 (status treści, K3a 26.10: karta „Do sprawdzenia” widoczna, `noindex, follow`, poza mapami), `docs/design/prokombiznes/0611/QA-PRODUKCJA.md` pkt 5, `docs/zadania/zdjecia-do-pozyskania.md`.

## Kontekst
Przed produkcją w katalogu jest **11 kart „Do sprawdzenia”**: `druks`, `lenovo-thinkbook-14-2-in-1-g6`, `dell-pro-rugged`, `dell-pro-max-desktop`, `lenovo-thinkvision-m-przenosne`, `dell-plus-monitory`, `kyocera-ecosys-ma4500x-fx-ifx`, `kyocera-ecosys-ma3500cix-cifx-ma4000cix`, `avtek-ts-8-1-easy`, `lenovo-thinksmart-core-gen-2`, `nexo`.

Według ADR-012 (rozstrzygnięcie 15) karta jest widoczna na stronie i w listach, ale ma `noindex` i nie ma jej w mapach. Stan tych kart na 14.11:

- **zdjęcia:** każda ma 0 (na liście i w karcie pusta płyta albo zaślepka);
- **opis:** 709–1146 znaków, dziewięć poniżej progu 1000 z `catalogThresholds`;
- **polecane:** 0–4, większość poniżej 3;
- **fakty:** niesprawdzone przez człowieka, stąd status.

Prowadzą do nich linki z list kategorii i salonów (`/oferta/laptopy`, `/marki/dell`…). Klient trafia więc na kartę bez zdjęcia, a Google widzi linki do stron `noindex`. To nie jest błąd SEO, ale marnuje część budżetu indeksowania i obniża wrażenie jakości.

## Opcje
1. **A — zostawić jak w ADR-012.** Zero pracy. Na produkcji w listach jest 11 kart bez zdjęć.
2. **B — ukryć karty „Do sprawdzenia” w listach, wyszukiwarce, menu i „polecanych”, dopóki nie są gotowe.** Karta dalej działa pod swoim adresem (z `noindex`) i jest w panelu, więc można ją sprawdzić i podejrzeć. Praca: jeden filtr w indeksie katalogu (`isIndexableProduct` przy budowie list) i test, że lista nie linkuje karty `needs-review`.
3. **C — dokończyć 11 kart przed produkcją.** Potrzebne są zdjęcia producentów (Dell blokuje automaty, więc ręcznie), sprawdzenie faktów przez człowieka, dopisanie opisów do progów i polecanych. To kilka godzin pracy ręcznej, w części niezależnej od kodu.

## Rekomendacja
**B teraz, C jako zwykła praca nad treścią.** Produkcja nie pokazuje wtedy kart, które nie są gotowe. Każda karta po przestawieniu na „Gotowe” w panelu sama pojawia się w listach i mapach, bez wdrożenia. To zmienia rozstrzygnięcie 15 tylko w jednym punkcie: „widoczna w listach” → „widoczna tylko pod adresem”. `noindex` i mapy zostają bez zmian.

## Konsekwencje (przy B)
- Liczniki kategorii i salonów spadają o karty „Do sprawdzenia”, bo liczone są tylko gotowe.
- Przekierowanie 301 z karty źródłowej podziału (K31a) na pierwszą nową kartę „Do sprawdzenia” dalej działa, bo karta odpowiada pod adresem.
- Implementacja w osobnym PR `feat/biznes-karty-gotowe-w-listach` po akceptacji tego ADR.
