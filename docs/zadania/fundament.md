# Fundament prokom-web — plan sesji S1–S10

Zasady:
- **Jedna sesja = jedna gałąź = jeden PR.** Kolejność obowiązkowa — każda sesja stoi na poprzedniej.
- Start każdej sesji: `/zadanie S<n>` w **nowej** sesji Claude Code, w trybie planowania. Kod dopiero po akceptacji planu.
- Koniec sesji: warunki odbioru spełnione, CI zielone, `/przeglad`, PR, merge (squash), `/koniec-sesji`.
- Zakres jest zamknięty. Rzeczy spoza zakresu → `docs/STAN.md` → „Pomysły na później”.
- Wersje i API: sprawdzaj w dokumentacji zainstalowanej wersji Payload 3 i Next.js.

ADR do przeczytania przed fundamentem: 001, 003, 004, 005, 006, 007.

---

## S1 — szkielet i bramka jakości
**Cel:** puste, ale profesjonalne repo, w którym każdy PR przechodzi przez automat.
**Podział (15.10.2026), dwa osobne PR-y:** **S1a** — szkielet aplikacji i lokalna bramka jakości (wersje, szablon Payload, pnpm, TS/ESLint/Prettier, Vitest, Playwright, `lib/env.ts`, `.env.example`, `docker/compose.dev.yml`, `.vscode`). **S1b** — reszta zakresu: CI, Dependabot, haki git, kontrola tytułu PR, hak Prettiera i recenzent w Claude Code, ADR o MCP z dokumentacją.
**Zakres:**
- Sprawdź, jaką wersję Next.js i Node oficjalnie wspiera aktualny Payload 3; zaproponuj dokładne wersje. Szkielet z **oficjalnego szablonu Payload** (blank, PostgreSQL) wygenerowany w katalogu tymczasowym i przeniesiony do repo **bez nadpisywania** `docs/`, `CLAUDE.md`, `.claude/`, `.gitignore`, `.gitattributes`.
- pnpm przez Corepack (`packageManager` w `package.json`), `.nvmrc`, dokładne wersje zależności.
- TypeScript `strict`, ESLint, Prettier, skrypty: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test` (Vitest), `test:e2e` (Playwright).
- `lib/env.ts` — walidacja zmiennych środowiskowych (Zod) przy starcie; `.env.example` z opisem każdej zmiennej.
- `docker/compose.dev.yml`: PostgreSQL (wersja przypięta) + Mailpit.
- `.github/workflows/ci.yml`: install (cache pnpm) → lint → typecheck → test → build → gitleaks. Jedna przeglądarka w Playwright, timeouty, `concurrency` (anulowanie starszych przebiegów).
- `.github/dependabot.yml` (npm + github-actions, grupowanie, Next/Payload ignorowane w aktualizacjach major).
- `.vscode/extensions.json` (ESLint, Prettier, Tailwind).
- `.nvmrc` z wersją Node wspieraną przez Payload 3 (fnm na obu komputerach przełącza się automatycznie; CI czyta tę samą wersję).
- **Haki git (husky + lint-staged):** przed commitem — Prettier i ESLint tylko na zmienionych plikach, gitleaks na staged (blokada sekretów). Szybkie (sekundy); nie uruchamiać pełnych testów w haku.
- **Kontrola tytułu PR w CI:** osobny job sprawdza, czy tytuł PR pasuje do Conventional Commits (`typ(zakres)?: opis`, typy: feat, fix, chore, docs, refactor, test, perf, ci, build) — prosty skrypt w workflow, bez zewnętrznej akcji. Przy squash merge tytuł PR = historia `develop`.
- **Claude Code — hak po edycji:** w `.claude/settings.json` hak `PostToolUse` dla Edit/Write uruchamiający Prettier na zmienionym pliku (szczegóły i składnię sprawdź w aktualnej dokumentacji Claude Code). Uwaga: plików w `.claude/` Krystian zapisuje lokalnie — przygotuj treść, on zatwierdzi.
- **Claude Code — recenzent:** subagent `.claude/agents/recenzent.md` (czysty kontekst: tylko diff, specyfikacja/sesja, ADR-y, `jakosc.md`); `/przeglad` korzysta z niego. Zasada: autor nie recenzuje sam siebie.
- **Aktualna dokumentacja bibliotek dla Claude Code:** sprawdź i zaproponuj (ADR) serwer MCP z aktualną dokumentacją bibliotek (np. Context7) — Payload 3 / Next.js zmieniają API; decyzja przed S2.
**Poza zakresem:** kolekcje, tenanci, wygląd, Docker produkcyjny, wersjonowanie/changelog (przy pierwszej produkcji).
**Gotowe, gdy:** `pnpm dev` startuje, `/admin` lokalnie pokazuje ekran tworzenia pierwszego użytkownika; CI zielone na PR (łącznie z kontrolą tytułu); commit z błędem formatowania albo przykładowym sekretem jest blokowany przez hak; `docs/STAN.md` i komendy w `CLAUDE.md` zgodne z rzeczywistością.

## S2 — baza, migracje, użytkownicy
**Zakres:**
- **Testy najpierw** dla logiki (tu: blokada seeda na produkcji, walidacja haseł/ról) — najpierw test, który nie przechodzi, potem kod. Ta zasada obowiązuje dalej w S3 (rozpoznawanie domeny, izolacja tenantów) i S8 (walidacja formularza, antyspam).
- Adapter PostgreSQL; **migracje wersjonowane** w repo; `push: false` wszędzie, także lokalnie (ADR-009) — schemat zmienia się tylko przez `migrate:create` + `migrate`. Udokumentuj, jak to jest ustawione.
- `Users`: role `admin` / `editor`; limit nieudanych logowań i blokada czasowa (decyzja 15.10.2026: **5 nieudanych prób → blokada 15 min**); silne hasła (**min. 12 znaków**, bez wymogu znaków specjalnych — długość daje więcej niż reguły).
- Skrypt `seed` (tylko gdy `NODE_ENV !== 'production'` — twarda blokada): admin lokalny.
**Gotowe, gdy:** świeża baza → `pnpm payload migrate` → działa; test Vitest dla blokady seeda na produkcji.

## S3 — tenanci i routing po domenie (najważniejsza sesja)
**Zakres:**
- `Tenants` wg ADR-006, oficjalna wtyczka Multi-Tenant.
- `middleware.ts` (w Next 16: `proxy.ts`): host → tenant (dane z bazy z krótkim cache, nie z kodu); nieznana domena → 404; `/admin` i zapisujące API tylko na domenie panelu (`PANEL_HOST` z env).
- Struktura `app/(sites)/[tenant]/...` (zrealizowane jako `[domain]` — parametrem jest host), strona startowa tenanta.
- Seed: tenanci `biznes`, `instalacje`, `software` z domenami `*.localhost`.
**Gotowe, gdy:** testy (Vitest + Playwright): (1) treść tenanta A nigdy nie pojawia się na domenie B, (2) nieznany host → 404, (3) `/admin` na domenie strony → 404, (4) panel działa na `panel.localhost`.

## S4 — dane firmy i ustawienia stron
**Zakres:** global `CompanyData`, kolekcja `SiteSettings` (1 na tenanta), helpery pobierania w `lib/`; seed z danymi przykładowymi (oznaczonymi jako przykładowe).
**Gotowe, gdy:** zmiana telefonu w `CompanyData` jest widoczna na wszystkich trzech domenach; zmiana w `SiteSettings` jednej linii — tylko na jej domenie (test).

## S5 — strony z bloków
**Zakres:** `Pages` z blokami generycznymi (ADR-006), wersje robocze, publikacja z datą, podgląd na żywo, renderowanie bloków; odświeżanie (rewalidacja) tylko ścieżek danego tenanta po publikacji; **rejestr bloków z listą dozwolonych per linia (ADR-010)** — na start każda linia ma wszystkie bloki generyczne.
**Gotowe, gdy:** szkic niewidoczny publicznie; publikacja → zmiana widoczna na właściwej domenie; podgląd na żywo działa; test Playwright ścieżki „edytuj → opublikuj → widać”; blok spoza listy linii jest odrzucany przy zapisie (test).

## S6 — system wyglądu
**Zakres:** tokeny z `docs/marka.md`, Tailwind tylko na tokenach, `data-line` → `--accent*`; wyliczenie `--accent-text` (≥ 4,5:1) dla każdej linii i wpisanie wartości do `docs/marka.md`; fonty Archivo/Manrope self-hosted; szkielet strony: pasek marki (linki do linii), nagłówek z logo linii, stopka z `CompanyData`; SVG znaków i favicony w `public/brand/` (Krystian dostarcza pliki); komponenty bazowe (Button, Container, Section, Heading, Link); test axe w Playwright.
**Gotowe, gdy:** trzy domeny w trzech kolorach linii; zero błędów axe; kontrasty w testach.

## S7 — media, SEO, przekierowania
**Zakres:** `Media` (wymagany `alt`, rozmiary, WebP/AVIF, zapis na dysku), `Partners`; metadane z `SiteSettings` + `Pages`; `sitemap.xml` i `robots.txt` per domena; dane strukturalne `LocalBusiness`/`Organization` z `CompanyData`; canonical; przekierowania `Redirects` (301 per domena; własna kolekcja zamiast wtyczki — uzupełnienie ADR-006, S7b); własne 404 i strona błędu; `noindex` gdy `SITE_ENV=staging`.
**Gotowe, gdy:** sitemap i robots poprawne dla każdej domeny; staging ma `noindex`; test przekierowania 301.

## S8 — skrzynka zapytań
**Zakres:** dokładnie wg ADR-003: `POST /api/inquiry`, `submitInquiry()`, schemat Zod, `Inquiries`, honeypot + minimalny czas + limit, powiadomienie e-mail (SMTP z env) + potwierdzenie dla klienta, widok w panelu (edycja tylko statusu), komponent `InquiryForm` (dostępny, z komunikatami błędów i zgodą RODO z wersją klauzuli).
- **Retencja (RODO, ADR-003):** zadanie cykliczne usuwa zapytania o statusie `closed` starsze niż okres retencji (wartość z env, domyślnie 24 miesiące); usunięcie pojedynczego zapytania na żądanie osoby — akcja w panelu tylko dla roli `admin`, z wpisem kto i kiedy (bez treści zapytania). Mechanizm zadań: wbudowany w Payload, jeśli wystarcza — bez nowych usług.
- **Nadawca maili:** adres w domenie, dla której ustawimy SPF/DKIM/DMARC (`docs/dns.md`); adres nadawcy i odbiorcy z env / ustawień tenanta, nigdy na sztywno w kodzie.
- **Odbiorcy (ADR-003, uzupełnienie 16.10):** powiadomienie idzie na `notificationEmail` tenanta (skrzynki linii, np. `biznes@pro-kom.eu`); `Reply-To` = e-mail klienta, temat z linią i kategorią, link do rekordu w panelu — obsługa w Thunderbirdzie. Tenant bez `notificationEmail` → zapis i tak się udaje, a w logach ostrzeżenie (bez danych osobowych).
- **Dane osobowe poza logami:** e-mail, telefon, imię i treść zapytania nie trafiają do logów ani komunikatów błędów.
**Gotowe, gdy:** Playwright: wysłanie formularza → rekord w panelu → mail w Mailpit; spam (honeypot / za szybko / limit) odrzucony; publicznie nie da się odczytać zapytań; test Vitest retencji (stare `closed` usunięte, `new`/`in_progress` nietknięte).

## S9 — gotowość produkcyjna (bez serwera)
**Zakres:** `Dockerfile` wieloetapowy (Next `standalone`, użytkownik nie-root), `/api/health`; workflow budujący obraz do GHCR (tag = SHA, tylko na `main`/`develop`); `docker/compose.prod.yml` i `compose.staging.yml` (app, postgres, nginx; limity pamięci; wolumeny na bazę i media); migracje przy starcie wdrożenia; konfiguracja Nginx (nagłówki bezpieczeństwa, basic auth dla stagingu); skrypty kopii (`pg_dump` + media, szyfrowanie, wysyłka poza serwer) i odtworzenia; `docs/runbook.md` (wdrożenie, rollback, odtworzenie, „strona nie działa”).
- **Logi strukturalne:** jeden lekki logger (JSON na stdout) z polami `level`, `time`, `tenant`, `requestId`, `msg`; `requestId` nadawany w middleware i zwracany w nagłówku odpowiedzi. Bez danych osobowych. Rotacja logów Dockera (`max-size`, `max-file`) w compose, żeby logi nie zapchały dysku.
- **Smoke test** jako skrypt w repo (`scripts/smoke.sh <adres>`): `/api/health`, strona główna każdego tenanta (200), `/sitemap.xml`, `/admin` na domenie strony → 404. Uruchamiany lokalnie na `compose.prod.yml` i w pipeline po każdym wdrożeniu (S10).
**Gotowe, gdy:** lokalnie `compose.prod.yml` uruchamia aplikację z obrazu; `scripts/smoke.sh` przechodzi; logi w formacie JSON z `tenant` i `requestId`; kopia wykonana i **odtworzona na czystej bazie**; runbook przetestowany krok po kroku.

## S10 — serwer (po dostawie VPS)
**Zakres:** utwardzenie (aktualizacja do Ubuntu 24.04, SSH tylko kluczem, firewall, fail2ban, automatyczne poprawki bezpieczeństwa, swap); Docker; DNS `staging.prokombiznes.pl` (i pozostałych domen) + `panel.pro-kom.eu`; certyfikaty; wdrożenie stagingu z workflow; kopie z harmonogramem; Sentry; zewnętrzny monitoring dostępności.
- **DNS jako dokumentacja:** każdy rekord najpierw w `docs/dns.md` (PR), potem u dostawcy.
- **Poczta wychodząca:** SPF, DKIM i DMARC (na start `p=none` z raportami, po 2–4 tygodniach bez problemów `p=quarantine`) dla domeny nadawcy powiadomień; test wysyłki np. w mail-tester.com — wynik zapisany w `docs/dns.md`.
- **Smoke test w pipeline:** po każdym wdrożeniu `scripts/smoke.sh`; błąd → wdrożenie oznaczone jako nieudane i automatyczny powrót do poprzedniego obrazu (tylko aplikacja — baza bez zmian).
- **Budżet wydajności:** Lighthouse CI po wdrożeniu stagingu, dla strony głównej i jednej podstrony każdego tenanta (wersja mobilna); próg: Performance, Accessibility, SEO, Best Practices ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1. Przekroczenie = czerwony przebieg, który blokuje wdrożenie produkcji.
**Gotowe, gdy:** staging działa za hasłem z `noindex`; wdrożenie i rollback przetestowane (także automatyczny po celowo zepsutym smoke teście); Lighthouse CI raportuje i blokuje przy przekroczeniu budżetu; mail z formularza na stagingu dochodzi do skrzynki Gmail i Outlook **poza spamem**; **test odtworzenia z kopii na serwerze** zaliczony; alert monitoringu dochodzi na telefon.

---

## Definicja „fundament gotowy”
- [ ] 3 tenanty na osobnych domenach, test izolacji zielony
- [ ] `CompanyData` zmienione w panelu → widoczne wszędzie
- [ ] strona z bloków: szkic, podgląd, publikacja
- [ ] formularz → zapis → mail (test e2e)
- [ ] sitemap, robots, dane strukturalne per domena
- [ ] CI zielone, obraz w GHCR, produkcyjny compose działa
- [ ] kopia zapasowa wykonana i odtworzona
- [ ] po wdrożeniu: smoke test i Lighthouse CI (budżet) w pipeline, automatyczny powrót przy błędzie
- [ ] maile z formularza poza spamem (SPF, DKIM, DMARC); retencja zapytań działa
- [ ] `docs/dns.md` zgodny z rzeczywistością
- [ ] ADR-y i runbook aktualne

## Świadomie NIE w fundamencie
Wersje językowe, wyszukiwarka (hub, grudzień), Redis, S3, Kubernetes, osobna aplikacja panelu, zewnętrzna CAPTCHA, PRO-KOM System, Umami (dopiero na serwerze), API dla prokomserwis.pl, kolekcje specyficzne dla stron (`Offers`, `Projects`, `Posts`).
