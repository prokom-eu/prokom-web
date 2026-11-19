# ADR-027: Treść kolejnej linii na działającej produkcji (import paczki przez tunel)

- Status: **przyjęta** (14.11.2026, decyzja Krystiana: „Import jak na staging”)
- Data: 14.11.2026
- Decyduje: Krystian
- Powiązane: ADR-004 (staging → produkcja), ADR-009 (migracje), runbook §2a (`staging-content.sh`), §3a (`prod-content.sh`, „Kolejna linia później”), `scripts/prod-line-content.sh`.

## Kontekst
Produkcja działa od 9.11, na start z samą linią Software. Pierwsza treść produkcji to kopia całej bazy stagingu (`prod-content.sh`), więc baza produkcji ma też treść Biznesu, ale z **9.11**: 437 kart, strony GoPOS / InsERT / Opieka IT w starym układzie. Na stagingu jest treść z 14.11: 455 pozycji, decyzje 14.11, karty Apple, nowy układ stron.

Według runbooka kolejna linia na działającej produkcji dostaje domenę w panelu, a treść „uzupełnia się w panelu”. Przy 455 kartach, zdjęciach i stronach to nierealne. `prod-content.sh` odmawia z założenia: kopia całej bazy stagingu skasowałaby prawdziwe zapytania Software i edycje z panelu produkcji. Zamiana bazy jak w `staging-content.sh` ma ten sam problem: wszystko, co przyszło między zrzutem a zamianą (kilka–kilkanaście minut seeda), znika.

## Decyzja
Import paczki jednej linii (`pnpm seed:biznes`) **zapisuje prosto do bazy produkcji przez tunel SSH**, bez zamiany bazy (`scripts/prod-line-content.sh biznes`, uruchamiany z komputera, w checkoucie commita produkcji):

- **Zakres zapisu:** wszystko, co seed linii zapisuje w tenancie Biznes (karty, strony, media, przekierowania, ustawienia strony). Konta, tenanty i zapytania są nietknięte, tak jak na stagingu.
- **Dane firmy (global `company-data`):** wspólne dla wszystkich linii i edytowane w panelu produkcji, więc import ich nie zmienia (`SEED_KEEP_COMPANY_DATA=1`). Raport seeda mówi, czy paczka się od nich różni (`company-data … (kept, differs)`), a ewentualną poprawkę wpisuje się ręcznie w panelu.
- **Marki (`partners`):** status K4, opis i logo marek pokazywanych na Biznesie zmieniają się jak na stagingu, także gdy marka jest wspólna z inną linią (statusy według K4-FINAL §1 są wspólnymi faktami firmy).
- **Zdjęcia:** najpierw pobierane są wszystkie pliki produkcji (ok. 100 MB), żeby Payload wybierał unikalne nazwy względem nich. Na serwer wracają tylko pliki dodane przez import (`chown` tylko na nich). Nic nie jest usuwane. **Od chwili startu seeda pliki wracają zawsze, także po błędzie**, bo baza już na nie wskazuje. Na koniec skrypt porównuje nazwy plików z bazy (media Biznesu i logo wszystkich marek) z wolumenem i kończy się błędem, gdy czegoś brakuje.
- **Bezpieczniki:**
  - blokada wdrożeń (`../.deploy.lock`) przez cały import: żaden `deploy.sh` nie zrestartuje bazy ani nie zmieni schematu pod seedem. Po stronie serwera blokadę trzyma proces, który kończy się kilka sekund po zerwaniu połączenia SSH, więc przerwany import jej nie zostawia;
  - kopia `predeploy` produkcji przed importem;
  - kod lokalny = commit produkcji i wszystkie migracje tego kodu już zastosowane;
  - odmowa, gdy linia ma już domenę produkcji (edycje z panelu żywej linii zostałyby nadpisane); świadomie tylko z `PO_STARCIE=1`;
  - potwierdzenie `prokom-prod`;
  - adres bazy wzięty z `DATABASE_URL` produkcji (zakodowany), z tunelem zamiast usługi `postgres`; nigdy nie jest wypisywany; zmienne Payload z powłoki (`PAYLOAD_DROP_DATABASE` i podobne) są zerowane;
  - na koniec czyszczenie `fetch-cache` aplikacji, bez restartu. Część pamięciowa pamięci podręcznej zostaje do wygaśnięcia, co dla linii bez domeny nie ma znaczenia; wspólne dane marek odświeżą się na żywych liniach same.

## Konsekwencje
- **Bez przestoju i bez utraty zapytań** innych linii: aplikacja produkcji działa przez cały import.
- **Błąd w połowie** zostawia linię częściowo zaktualizowaną. Linia nie ma jeszcze domeny produkcji, więc nikt tego nie widzi, a import jest idempotentny: wystarczy uruchomić ponownie (zdjęcia z przerwanego przebiegu są już na serwerze). Odtworzenie kopii `predeploy` (runbook §4 B) to ostateczność: kasuje też zapytania i edycje żywych linii od chwili kopii.
- **Kolejność dla Biznesu:** wdrożenie obrazu ze stagingu na produkcję (`deploy.sh prod`, runbook §3) → `prod-line-content.sh biznes` (pierwszy raz z `ZAMIEN_STRONY=gopos,insert,opieka-it,automaty-vendingowe`) → domena `prokombiznes.pl` w tenancie (panel produkcji) → certyfikat `--expand` i `PROD_SITE_HOSTS` / `PROD_WWW_HOSTS` → smoke, `porownaj-tresc --po-imporcie`, §3a.1.
- **Po starcie linii** treść edytuje się w panelu produkcji. Ponowny import nadpisze pola z paczki (karty: „pola z paczki wygrywają z edycją w panelu”), więc po starcie Biznesu ten skrypt nie jest zwykłym narzędziem: każde użycie wymaga decyzji Krystiana, jak na stagingu.
- Seed na produkcji dalej jest zablokowany (`NODE_ENV=production`). Skrypt uruchamia go na komputerze z `NODE_ENV=development`, tak jak `staging-content.sh`.

## Rozstrzygnięcia 15.11 — wpisy Biznesu po starcie linii
Audyt produkcji 15.11 (P1-3), decyzja Krystiana: 24 wpisy Biznesu, publikowane od razu, na produkcję skryptem, który tylko dodaje brakujące.

- **Tryb `biznes-wpisy`** w `scripts/prod-line-content.sh`: te same bezpieczniki (commit produkcji, migracje, blokada wdrożeń, kopia `predeploy`, tunel, potwierdzenie `prokom-prod`), ale uruchamia tylko `pnpm seed:biznes-wpisy`.
- **Zakres zapisu:** wyłącznie nowe rekordy `posts` tenanta Biznes — wpis o slugu, którego w bazie nie ma (także jako szkic), z listy `src/seed/biznes/wpisy/`. Istniejącego wpisu nie zmienia, niczego nie usuwa, nie dotyka zdjęć, kart ani stron. Dlatego działa na żywej linii bez `PO_STARCIE`.
- **Wycofany wpis** (usunięty albo przemianowany w panelu) trafia do `RETIRED_GUIDE_SLUGS` — inaczej skrypt utworzyłby go ponownie.
- Produkty pod wpisem są szukane po slugu karty w bazie produkcji; brakująca karta jest pomijana z ostrzeżeniem w logu.
- **Daty publikacji:** wpisy jednego przebiegu dostają daty co minutę wstecz od chwili importu, w kolejności `BIZNES_GUIDE_POSTS` (pierwszy = najnowszy, wyróżniony na głównej). Partia uruchomiona później jest w całości nowsza od wcześniejszych — jeśli na górze ma zostać konkretny wpis (np. o KSeF), zmień mu datę w panelu albo uruchom partie razem.

## Rozstrzygnięcia 19.11 — katalog Instalacji po starcie linii

Instalacje działają na produkcji od 13.11, a katalog sprzętu (ADR-029, INST-K0…K2) przychodzi później. Pełny import linii (`seed:instalacje`) nadpisałby strony, usługi i teksty edytowane w panelu, więc:

1. **Osobny import `pnpm seed:instalacje-katalog`** (`scripts/prod-line-content.sh instalacje-katalog`): zapisuje tylko kolekcje katalogu (działy, kategorie, karty, zdjęcia `inst-*`, salony), we wspólnych markach (`partners`) **tylko dopisuje tenanta Instalacji** (nazwy, logo, statusy Biznesu bez zmian; nowe marki — tylko tenant Instalacji), `InstalacjeSettings.homeFeatured` — tylko gdy puste. Dane firmy, strony, usługi, obiekty, ustawienia linii: nietknięte.
2. **Bezpiecznik zamiast „linia ma domenę produkcji”:** odmowa, gdy tenant ma już karty katalogu (drugi przebieg nadpisałby ich edycje z panelu) — wtedy tylko `PO_STARCIE=1` z decyzji Krystiana (także po błędzie w połowie, gdy w panelu nie ma jeszcze edycji kart).
3. **Rozwiązania oferty:** import tylko **tworzy** te dodane do paczki po starcie (`legacyId` > 76, `LIVE_SOLUTIONS_UNTIL` — streaming 77–79), istniejących nie zmienia; rozwiązanie 1–76 usunięte w panelu nie wraca (jak `RETIRED_GUIDE_SLUGS` wpisów Biznesu). Kolejne nowe rozwiązania z paczki: podnieść `LIVE_SOLUTIONS_UNTIL` po ich imporcie.
4. Szyna „Sprzęt” (dane linii w `SiteSettings.shared`) — ręcznie w panelu, import jej nie zmienia.
