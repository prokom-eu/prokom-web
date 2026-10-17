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

**Uzupełnienie (16.10.2026, S4):** `CompanyData` edytują admin **i edytor** (także edytor przypisany tylko do jednej linii) — szef sam aktualizuje telefony, godziny i pasek promocji. Świadomy kompromis: zmiana jest widoczna na wszystkich domenach naraz, więc edytorami zostają tylko zaufane osoby. Gdy dojdzie edytor spoza ścisłego kierownictwa — zawęzić `update` do admina (nowy ADR). `SiteSettings` edytor zmienia tylko dla przypisanych tenantów (wtyczka Multi-Tenant), usuwa je tylko admin.

**Uzupełnienie (17.10.2026, S7a):**
- `Media` (per tenant) ma oprócz wymaganego `alt` pola `source` (źródło/autor) i `requiresConsent` (np. logo klienta bez pisemnej zgody) — z ADR-012. Publicznie plik jest serwowany tylko na domenie swojego tenanta i tylko bez `requiresConsent` (dostęp `read` Payload, sprawdzany też przy serwowaniu pliku). Na domenach stron otwarte jest wyłącznie `GET/HEAD /api/{media,partners}/file/<plik>`; reszta API nadal 404. Formaty: JPEG, PNG, WebP (bez SVG — skrypt w SVG wykonałby się na domenie strony). Rozmiary 480/960/1600 px w WebP robi Payload przy wgraniu; `next/image` dostaje je przez własny loader zamiast optymalizatora Next (jego wewnętrzne żądanie nie ma nagłówka `Host`, od którego zależą routing i dostęp). AVIF — nie teraz.
- `Partners` to **jedna kolekcja dla partnerów i marek** (także `brands` z ADR-012): rekord jest plikiem logo (upload), `name`, `website`, `partnerStatus` (marka / autoryzowany serwis / autoryzowany partner), `tenants` (gdzie widoczny), `order`. Edytuje admin i edytor (jak `CompanyData` — zaufane osoby), usuwa admin.

## Konsekwencje
- Nowa strona linii = rekord `Tenants` + `SiteSettings` + treści, ewentualnie nowe bloki z jej specyfikacji.
- Kolekcje `Offers`, `Projects` (realizacje), `Posts` (aktualności huba) dodajemy z odpowiednimi specyfikacjami — osobny ADR tylko, jeśli zmieniają ten model.
- Wspólne dane firmy (`CompanyData`) wystawiamy później tylko do odczytu dla prokomserwis.pl (klucz API) — nie w fundamencie.
