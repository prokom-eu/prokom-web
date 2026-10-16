# ADR-006: Model treści v1 (fundament) i dostęp do panelu

- **Status:** przyjęta
- **Data:** 2026-10-14
- **Decyduje:** Krystian

## Kontekst
Fundament ma obsłużyć wszystkie przyszłe strony linii, zanim powstaną ich specyfikacje. Model musi być mały, ale nie do przebudowy po trzech stronach. Kolekcje specyficzne dla stron (oferta Biznesu, realizacje Instalacji, portfolio Software) powstaną z ich specyfikacjami.

## Decyzja — fundament zawiera tylko to:
| Element | Typ | Zakres |
|---|---|---|
| `Tenants` | kolekcja | nazwa, slug, linia (`prokom`/`biznes`/`instalacje`/`software`), domeny produkcyjne, domeny staging, e-mail powiadomień o zapytaniach, aktywna |
| `Users` | kolekcja z logowaniem | role: `admin` (Krystian — wszystko), `editor` (szef i przyszli edytorzy — treści przypisanych tenantów); limit nieudanych logowań i blokada czasowa |
| `CompanyData` | global (wspólny) | nazwa firmy, NIP, telefony, adresy i godziny Rabka/Zakopane, e-mail ogólny, pasek promocji (tekst, link, od–do) |
| `SiteSettings` | 1 dokument na tenanta | nawigacja, stopka linii, telefon i e-mail linii, domyślne SEO (title template, opis, obraz OG) |
| `Pages` | per tenant | `slug`, tytuł, układ z bloków, SEO, wersje robocze, publikacja z datą, podgląd na żywo |
| `Media` | per tenant | obrazy z **wymaganym** `alt`, rozmiary pod `next/image` |
| `Partners` | wspólna | nazwa, logo (tylko oficjalne pliki), link, na których tenantach widoczny |
| `Inquiries` | per tenant | wg ADR-003 |
| `Redirects` | wtyczka | 301, per domena |

**Bloki generyczne:** Hero, Tekst (rich text), Siatka usług/kafelków, CTA, FAQ, Partnerzy, Formularz, Kontakt.

**Dostęp:**
- Panel `/admin` i zapisujące API Payload **tylko na domenie panelu** (`panel.pro-kom.eu`, lokalnie `panel.localhost`). Na domenach stron: 404.
- Publicznie: odczyt wyłącznie opublikowanych treści; brak odczytu `Users`, `Inquiries`.
- Odświeżanie stron po publikacji: tylko ścieżki danego tenanta (tag/ścieżka rewalidacji z tenantem), nie przebudowa całości.

**Uzupełnienie (16.10.2026, S3):** domeny tenanta to jedna tablica `domains` z wpisami `{ host, environment: production | staging | local }` zamiast osobnych pól „domeny produkcyjne / staging” — jedno wyszukiwanie po hoście, jedna kontrola unikalności (host należy do dokładnie jednego tenanta), a lokalne `*.localhost` mieszczą się w tym samym modelu. Decyzja co do zakresu `Tenants` bez zmian.

## Konsekwencje
- Nowa strona linii = rekord `Tenants` + `SiteSettings` + treści, ewentualnie nowe bloki z jej specyfikacji.
- Kolekcje `Offers`, `Projects` (realizacje), `Posts` (aktualności huba) dodajemy z odpowiednimi specyfikacjami — osobny ADR tylko, jeśli zmieniają ten model.
- Wspólne dane firmy (`CompanyData`) wystawiamy później tylko do odczytu dla prokomserwis.pl (klucz API) — nie w fundamencie.
