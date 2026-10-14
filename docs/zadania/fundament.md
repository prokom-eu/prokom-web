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
**Zakres:**
- Sprawdź, jaką wersję Next.js i Node oficjalnie wspiera aktualny Payload 3; zaproponuj dokładne wersje. Szkielet z **oficjalnego szablonu Payload** (blank, PostgreSQL) wygenerowany w katalogu tymczasowym i przeniesiony do repo **bez nadpisywania** `docs/`, `CLAUDE.md`, `.claude/`, `.gitignore`, `.gitattributes`.
- pnpm przez Corepack (`packageManager` w `package.json`), `.nvmrc`, dokładne wersje zależności.
- TypeScript `strict`, ESLint, Prettier, skrypty: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `test` (Vitest), `test:e2e` (Playwright).
- `lib/env.ts` — walidacja zmiennych środowiskowych (Zod) przy starcie; `.env.example` z opisem każdej zmiennej.
- `docker/compose.dev.yml`: PostgreSQL (wersja przypięta) + Mailpit.
- `.github/workflows/ci.yml`: install (cache pnpm) → lint → typecheck → test → build → gitleaks. Jedna przeglądarka w Playwright, timeouty, `concurrency` (anulowanie starszych przebiegów).
- `.github/dependabot.yml` (npm + github-actions, grupowanie, Next/Payload ignorowane w aktualizacjach major).
- `.vscode/extensions.json` (ESLint, Prettier, Tailwind).
**Poza zakresem:** kolekcje, tenanci, wygląd, Docker produkcyjny.
**Gotowe, gdy:** `pnpm dev` startuje, `/admin` lokalnie pokazuje ekran tworzenia pierwszego użytkownika; CI zielone na PR; brak `.env` w repo; `docs/STAN.md` i komendy w `CLAUDE.md` zgodne z rzeczywistością.

## S2 — baza, migracje, użytkownicy
**Zakres:**
- Adapter PostgreSQL; **migracje wersjonowane** w repo (`push` tylko w dev — udokumentuj, jak to jest ustawione).
- `Users`: role `admin` / `editor`; limit nieudanych logowań i blokada czasowa; silne hasła.
- Skrypt `seed` (tylko gdy `NODE_ENV !== 'production'` — twarda blokada): admin lokalny.
**Gotowe, gdy:** świeża baza → `pnpm payload migrate` → działa; test Vitest dla blokady seeda na produkcji.

## S3 — tenanci i routing po domenie (najważniejsza sesja)
**Zakres:**
- `Tenants` wg ADR-006, oficjalna wtyczka Multi-Tenant.
- `middleware.ts`: host → tenant (dane z bazy z krótkim cache, nie z kodu); nieznana domena → 404; `/admin` i zapisujące API tylko na domenie panelu (`PANEL_HOST` z env).
- Struktura `app/(sites)/[tenant]/...`, strona startowa tenanta.
- Seed: tenanci `biznes`, `instalacje`, `software` z domenami `*.localhost`.
**Gotowe, gdy:** testy (Vitest + Playwright): (1) treść tenanta A nigdy nie pojawia się na domenie B, (2) nieznany host → 404, (3) `/admin` na domenie strony → 404, (4) panel działa na `panel.localhost`.

## S4 — dane firmy i ustawienia stron
**Zakres:** global `CompanyData`, kolekcja `SiteSettings` (1 na tenanta), helpery pobierania w `lib/`; seed z danymi przykładowymi (oznaczonymi jako przykładowe).
**Gotowe, gdy:** zmiana telefonu w `CompanyData` jest widoczna na wszystkich trzech domenach; zmiana w `SiteSettings` jednej linii — tylko na jej domenie (test).

## S5 — strony z bloków
**Zakres:** `Pages` z blokami generycznymi (ADR-006), wersje robocze, publikacja z datą, podgląd na żywo, renderowanie bloków; odświeżanie (rewalidacja) tylko ścieżek danego tenanta po publikacji.
**Gotowe, gdy:** szkic niewidoczny publicznie; publikacja → zmiana widoczna na właściwej domenie; podgląd na żywo działa; test Playwright ścieżki „edytuj → opublikuj → widać”.

## S6 — system wyglądu
**Zakres:** tokeny z `docs/marka.md`, Tailwind tylko na tokenach, `data-line` → `--accent*`; wyliczenie `--accent-text` (≥ 4,5:1) dla każdej linii i wpisanie wartości do `docs/marka.md`; fonty Archivo/Manrope self-hosted; szkielet strony: pasek marki (linki do linii), nagłówek z logo linii, stopka z `CompanyData`; SVG znaków i favicony w `public/brand/` (Krystian dostarcza pliki); komponenty bazowe (Button, Container, Section, Heading, Link); test axe w Playwright.
**Gotowe, gdy:** trzy domeny w trzech kolorach linii; zero błędów axe; kontrasty w testach.

## S7 — media, SEO, przekierowania
**Zakres:** `Media` (wymagany `alt`, rozmiary, WebP/AVIF, zapis na dysku), `Partners`; metadane z `SiteSettings` + `Pages`; `sitemap.xml` i `robots.txt` per domena; dane strukturalne `LocalBusiness`/`Organization` z `CompanyData`; canonical; wtyczka Redirects (301 per domena); własne 404 i strona błędu; `noindex` gdy `SITE_ENV=staging`.
**Gotowe, gdy:** sitemap i robots poprawne dla każdej domeny; staging ma `noindex`; test przekierowania 301.

## S8 — skrzynka zapytań
**Zakres:** dokładnie wg ADR-003: `POST /api/inquiry`, `submitInquiry()`, schemat Zod, `Inquiries`, honeypot + minimalny czas + limit, powiadomienie e-mail (SMTP z env) + potwierdzenie dla klienta, widok w panelu (edycja tylko statusu), komponent `InquiryForm` (dostępny, z komunikatami błędów i zgodą RODO z wersją klauzuli).
**Gotowe, gdy:** Playwright: wysłanie formularza → rekord w panelu → mail w Mailpit; spam (honeypot / za szybko / limit) odrzucony; publicznie nie da się odczytać zapytań.

## S9 — gotowość produkcyjna (bez serwera)
**Zakres:** `Dockerfile` wieloetapowy (Next `standalone`, użytkownik nie-root), `/api/health`; workflow budujący obraz do GHCR (tag = SHA, tylko na `main`/`develop`); `docker/compose.prod.yml` i `compose.staging.yml` (app, postgres, nginx; limity pamięci; wolumeny na bazę i media); migracje przy starcie wdrożenia; konfiguracja Nginx (nagłówki bezpieczeństwa, basic auth dla stagingu); skrypty kopii (`pg_dump` + media, szyfrowanie, wysyłka poza serwer) i odtworzenia; `docs/runbook.md` (wdrożenie, rollback, odtworzenie, „strona nie działa”).
**Gotowe, gdy:** lokalnie `compose.prod.yml` uruchamia aplikację z obrazu; kopia wykonana i **odtworzona na czystej bazie**; runbook przetestowany krok po kroku.

## S10 — serwer (po dostawie VPS)
**Zakres:** utwardzenie (aktualizacja do Ubuntu 24.04, SSH tylko kluczem, firewall, fail2ban, automatyczne poprawki bezpieczeństwa, swap); Docker; DNS `staging.prokombiznes.pl` (i pozostałych domen) + `panel.pro-kom.eu`; certyfikaty; wdrożenie stagingu z workflow; kopie z harmonogramem; Sentry; zewnętrzny monitoring dostępności.
**Gotowe, gdy:** staging działa za hasłem z `noindex`; wdrożenie i rollback przetestowane; **test odtworzenia z kopii na serwerze** zaliczony; alert monitoringu dochodzi na telefon.

---

## Definicja „fundament gotowy”
- [ ] 3 tenanty na osobnych domenach, test izolacji zielony
- [ ] `CompanyData` zmienione w panelu → widoczne wszędzie
- [ ] strona z bloków: szkic, podgląd, publikacja
- [ ] formularz → zapis → mail (test e2e)
- [ ] sitemap, robots, dane strukturalne per domena
- [ ] CI zielone, obraz w GHCR, produkcyjny compose działa
- [ ] kopia zapasowa wykonana i odtworzona
- [ ] ADR-y i runbook aktualne

## Świadomie NIE w fundamencie
Wersje językowe, wyszukiwarka (hub, grudzień), Redis, S3, Kubernetes, osobna aplikacja panelu, zewnętrzna CAPTCHA, PRO-KOM System, Umami (dopiero na serwerze), API dla prokomserwis.pl, kolekcje specyficzne dla stron (`Offers`, `Projects`, `Posts`).
