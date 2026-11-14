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
- **Zdjęcia:** najpierw pobierane są wszystkie pliki produkcji (ok. 100 MB), żeby Payload wybierał unikalne nazwy względem nich. Na serwer wracają tylko pliki dodane lub zastąpione przez import. Nic nie jest usuwane.
- **Bezpieczniki:**
  - kopia `predeploy` produkcji przed importem;
  - kod lokalny = commit produkcji i wszystkie migracje tego kodu już zastosowane;
  - potwierdzenie `prokom-prod`;
  - zdjęcia nie wejdą, jeśli w trakcie importu zmienił się obraz produkcji;
  - na koniec czyszczenie `fetch-cache` aplikacji, bez restartu.

## Konsekwencje
- **Bez przestoju i bez utraty zapytań** innych linii: aplikacja produkcji działa przez cały import.
- **Błąd w połowie** zostawia linię częściowo zaktualizowaną. Linia nie ma jeszcze domeny produkcji, więc nikt tego nie widzi, a import jest idempotentny: wystarczy uruchomić ponownie albo odtworzyć kopię `predeploy` (runbook §4 B).
- **Kolejność dla Biznesu:** wdrożenie obrazu ze stagingu na produkcję (`deploy.sh prod`, runbook §3) → `prod-line-content.sh biznes` (pierwszy raz z `ZAMIEN_STRONY=gopos,insert,opieka-it,automaty-vendingowe`) → domena `prokombiznes.pl` w tenancie (panel produkcji) → certyfikat `--expand` i `PROD_SITE_HOSTS` / `PROD_WWW_HOSTS` → smoke, `porownaj-tresc --po-imporcie`, §3a.1.
- **Po starcie linii** treść edytuje się w panelu produkcji. Ponowny import nadpisze pola z paczki (karty: „pola z paczki wygrywają z edycją w panelu”), więc po starcie Biznesu ten skrypt nie jest zwykłym narzędziem: każde użycie wymaga decyzji Krystiana, jak na stagingu.
- Seed na produkcji dalej jest zablokowany (`NODE_ENV=production`). Skrypt uruchamia go na komputerze z `NODE_ENV=development`, tak jak `staging-content.sh`.
