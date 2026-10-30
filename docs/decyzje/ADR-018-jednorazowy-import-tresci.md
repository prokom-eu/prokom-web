# ADR-018: Jednorazowy import treści z seeda na staging i produkcję

- **Status:** proponowana (30.10.2026). Kierunek zaakceptował Krystian („maksymalnie przyspieszyć”); szczegóły do potwierdzenia przed S10.
- **Data:** 2026-10-30
- **Decyduje:** Krystian (technika); szef — akceptacja treści na stagingu przed produkcją

## Kontekst
`pnpm seed` i `pnpm seed:biznes` działają tylko lokalnie (`assertSeedAllowed` blokuje `NODE_ENV=production`). Treści, które wpisuje seed, trzeba więc przed stagingiem i produkcją przepisać w panelu ręcznie. To katalog K4, kategorie i podkategorie, przekierowania 301, marki, salony, zestawy, plany, strony GoPOS/InsERT/Kontakt/Opieka IT, reguły kreatora, a w Software ustawienia strony głównej i kreatora. Lista w `docs/STAN.md` („Produkcja”, „przed stagingiem”) rośnie z każdą sesją. Ręczne przepisanie setek rekordów zajęłoby dni i grozi pomyłkami. Seed jest już idempotentny: drugi przebieg daje 0 zmian, a testy pokrywają mapowanie danych.

## Decyzja
1. **Import jawną komendą** w kontenerze aplikacji, np. `pnpm seed:biznes --target=staging|production`. Bez flagi zostaje obecna blokada.
2. **Warunki uruchomienia na serwerze:**
   - potwierdzenie nazwy bazy docelowej (wpisanej ręcznie, porównanej z `DATABASE_URL`);
   - świeża kopia z `scripts/backup.sh`, nie starsza niż 1 h;
   - zapis w logu, kto i kiedy uruchomił.
3. **Staging:** import powtarzalny, aż szef zaakceptuje treści.
4. **Produkcja: jeden raz,** przed startem. Po pierwszym przebiegu flaga w bazie blokuje kolejne importy na stałe — od tej chwili treścią rządzi panel.
5. **Import nie dotyka** kont (`users`), zgłoszeń (`inquiries`) ani żadnych danych osobowych. Admin z `SEED_ADMIN_*` nie powstaje na serwerze.
6. **Uruchamianie** tylko przez Krystiana, wg procedury w `docs/runbook.md`, nigdy z CI.

## Konsekwencje
- **Plusy:**
  - staging ma te same dane co lokalnie, więc QA i Lighthouse mierzą prawdziwą stronę;
  - znika ręczna lista „wpisz w panelu”;
  - błąd w danych poprawia się w paczce i ponownym imporcie na stagingu.
- **Minusy i ryzyka:**
  - pomyłka bazy docelowej — stąd potwierdzenie nazwy, kopia i blokada po pierwszym przebiegu;
  - import wygrywa z edycją w panelu tylko do pierwszego przebiegu na produkcji.
- **Do zrobienia** (sesja po S10, przed falą 4 z `docs/zadania/przyspieszenie.md`):
  - flaga i warunki w `src/seed/config.ts`;
  - procedura w `docs/runbook.md`;
  - test blokady.

## Rozważone alternatywy
- **Ręczne wpisywanie w panelu** — dni pracy, błędy, rośnie z każdą sesją.
- **Kopia lokalnej bazy (`pg_dump`) na serwer** — przenosi też konta i dane testowe, a schemat musiałby być identyczny co do bajtu. Gorsze niż idempotentny import.
- **Import przez API Payload z zewnątrz** — dodatkowa ruchoma część i token do panelu.
