# ADR-003: Skrzynka zapytań w październiku 2026 — kolekcja w Payload za stałym kontraktem

- **Status:** przyjęta
- **Data:** 2026-10-12, decyzja 2026-10-13
- **Decyduje:** Krystian

## Kontekst
Docelowo zapytania żyją w PRO-KOM System (Django, styczeń 2027). Pierwsza strona startuje 26.10.2026 i od pierwszego dnia żadne zapytanie nie może zginąć. Fundament i strona Biznes powstają w jednym, bardzo ciasnym oknie, budowane przez jedną osobę.

## Opcje
| Opcja | Zalety | Wady |
|---|---|---|
| A. **Kolekcja `Inquiries` w Payload** za stałym kontraktem | jedna aplikacja, jedno wdrożenie; kilka godzin pracy | w styczniu migracja danych do Django (małe dane: dziesiątki–setki rekordów) |
| B. Zalążek PRO-KOM System w Django | dane od początku w docelowym miejscu | druga aplikacja, baza, wdrożenie i API w najciaśniejszym tygodniu |
| C. Tylko e-mail | zero pracy | brak historii, statusów i liczb — odpada |

## Decyzja
**Opcja A.** Przy jednej osobie liczba ruchomych części w tygodniu wdrożenia jest ważniejsza niż docelowe umiejscowienie danych. Stabilna ma być **granica**, nie miejsce zapisu:

- Wszystkie formularze wysyłają dane do `POST /api/inquiry`; logika w jednej funkcji `submitInquiry()` w `lib/inquiry`.
- Schemat danych (Zod) jest **1:1 z przyszłym modelem `Inquiry` w Django**:
  - `tenant` (strona), `line` (linia), `category` (opcjonalnie), `source` (URL strony, UTM: source/medium/campaign),
  - `company` (opcjonalnie), `nip` (opcjonalnie, walidacja sumy kontrolnej), `name`, `email`, `phone` (co najmniej jedno z dwóch), `message`,
  - `consent`: `{ accepted: true, clauseVersion, acceptedAt }`, `marketingConsent` (osobno, domyślnie false),
  - systemowe: `status` (`new` → `in_progress` → `closed`), `createdAt`.
- Ochrona: honeypot, minimalny czas wypełnienia, limit zgłoszeń na adres IP (licznik w pamięci/bazie, **bez trwałego zapisu pełnego IP**).
- Po zapisie: powiadomienie e-mail (SMTP z `.env`) do adresu z ustawień tenanta + potwierdzenie dla klienta z obiecanym czasem odpowiedzi.
- Panel: kolekcja tylko do odczytu, edytowalne wyłącznie pole `status`; filtr po linii i statusie. Publicznie: tylko tworzenie przez endpoint, brak odczytu.
- Retencja (RODO): zapytania bez dalszej współpracy — usuwane po 24 miesiącach (do potwierdzenia przy polityce prywatności). Szczegóły — sekcja „Retencja” niżej.

## Retencja i prawa osób (uzupełnienie 2026-10-15)
- **Okres:** zapytanie o statusie `closed` jest usuwane trwale po okresie retencji liczonym od ostatniej zmiany statusu. Wartość w env (`INQUIRY_RETENTION_MONTHS`, domyślnie 24), żeby zmiana po decyzji przy polityce prywatności nie wymagała zmiany kodu. Zapytania `new` i `in_progress` nie są usuwane automatycznie.
- **Mechanizm:** zadanie cykliczne raz na dobę (mechanizm zadań Payload, bez nowych usług), z wpisem w logach: ile rekordów usunięto (bez danych osobowych).
- **Usunięcie na żądanie** (prawo do usunięcia danych): akcja w panelu tylko dla roli `admin`; zostaje ślad „kto, kiedy, ID rekordu”, bez treści zapytania.
- **Kopie zapasowe:** usunięte rekordy znikają z kopii wraz z ich rotacją (`docs/wdrozenia.md`: 14 dziennych + 3 miesięczne) — opisujemy to w polityce prywatności.
- **Logi:** dane osobowe z zapytań nigdy nie trafiają do logów ani do Sentry.
- **Migracja 2027:** te same zasady przechodzą do PRO-KOM System razem z modelem `Inquiry`.

## Konsekwencje
- Styczeń 2027: `submitInquiry()` zapisuje do API PRO-KOM System; jednorazowy skrypt migruje istniejące rekordy. Formularze bez zmian.
- Zasada „Payload tylko treści” ma świadomy, czasowy wyjątek — kolekcja `Inquiries` zostanie usunięta po migracji.
