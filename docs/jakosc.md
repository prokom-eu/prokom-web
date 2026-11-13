# Jakość — Definition of Done

Zadanie jest skończone, gdy:

## Kod
- [ ] Lokalnie: `pnpm lint`, `typecheck`, `test` i e2e zmienionego obszaru (`pnpm test:e2e tests/e2e/<plik>`). W CI: pełne e2e, `build`, gitleaks — CI blokuje scalenie. `build` lokalnie tylko przy zmianie konfiguracji Next/Payload, zależności, `proxy.ts`, migracji albo Dockera.
- [ ] Brak `any`, brak `console.log`, brak martwego kodu.
- [ ] Każde zapytanie do Payload filtruje po tenancie; test izolacji tenantów zielony.
- [ ] Zmiana schematu bazy ma migrację w repo.
- [ ] Nowe zmienne środowiskowe dopisane do `.env.example`.

## Testy
- **Vitest** — logika: mapowanie domena → tenant, blokada seeda na produkcji, walidacja formularzy, helpery SEO.
- **Playwright (e2e, krytyczne ścieżki każdej strony):** strona główna się ładuje, telefon klikalny (`tel:`), formularz wysyła się i pokazuje potwierdzenie, przekierowania 301 działają.
- Testy e2e uruchamiane na stagingu przed każdym wdrożeniem produkcji.

## Wygląd i UX
- [ ] Telefon 360 px, tablet, komputer — bez poziomego przewijania.
- [ ] Kolory i fonty tylko z tokenów (`docs/marka.md`); tekst w kolorze linii używa `--accent-text`.
- [ ] Teksty zgodne ze specyfikacją strony; brak „lorem ipsum” na produkcji.
- [ ] **prokombiznes.pl — każdy PR z UI (od 12.11, PRODUKCJA-BIZNES-1211 P0):** e2e `tests/e2e/biznes-widocznosc.e2e.spec.ts` zielony i `node scripts/zrzuty-pelne.mjs [origin] [--widths=1440,390] [--themes=light,dark] [--pages=/gopos,…]` — przewijanie jak użytkownik, ruch włączony, nic nie wymuszone; wynik `tmp/zrzuty-pelne/index.html` (zrzuty zmienionych stron w opisie PR). Liczenie H2 w HTML nie widzi sekcji, której nie widać.

## SEO
- [ ] `title` i `description` unikalne dla każdej podstrony.
- [ ] Jeden `h1`, logiczne `h2/h3`.
- [ ] Dane strukturalne (LocalBusiness / Service / Organization) bez błędów w Rich Results Test.
- [ ] `sitemap.xml`, `robots.txt`; staging ma `noindex`.

## Wydajność i dostępność
- [ ] Lighthouse ≥ 90: Performance, SEO, Accessibility, Best Practices; LCP ≤ 2,5 s (cel), CLS ≤ 0,1 (wersja mobilna). Na stagingu pilnuje tego Lighthouse CI (S10): LCP z symulacji blokuje od 4 s, powyżej 2,5 s ostrzeżenie (ADR-025).
- [ ] Widżet kliencki (`'use client'`) importowany z komponentu serwerowego bloku CMS, sekcji albo strony idzie przez leniwe opakowanie `<Plik>Lazy.tsx` w tym samym folderze: `export const X = dynamic(() => import('./Plik').then((m) => m.X), { loading: () => null })` (SSR zostaje; `loading` daje widżetowi własną granicę Suspense, więc reszta strony hydratuje się bez czekania na jego paczkę). Bez tego trafia do wspólnego wpisu trasy `[domain]` i pobiera go każda linia (ADR-023). Wyjątek: drobne przyciski i hooki (kilka linii).
- [ ] Obrazy przez `next/image`, właściwe rozmiary, `alt`.
- [ ] Kontrast WCAG AA, widoczny focus, formularze z etykietami i komunikatami błędów.

### Budżety płynności Software (SWA14 §3)
Cele (główna i `/rozwiazania`, telefon średniej klasy, Chrome, 4G): LCP ≤ 2,0 s, INP ≤ 100 ms (karta, okno oferty, zakładki, kreator), CLS ≤ 0,02, 0 klatek > 50 ms przy przewijaniu poza pierwszym ekranem, otwarcie okna oferty bez klatek > 50 ms (poza jedną klatką renderu ≤ 80 ms). Zasady ruchu: `docs/design/prokomsoftware/v24/ZMIANY-v24.md` §5.3.

CI (`tests/e2e/software-wydajnosc.e2e.spec.ts`, build produkcyjny, Chromium) — progi łagodniejsze, bo maszyna CI:
- [ ] przewinięcie głównej do stopki na telefonie z CPU 4×: 0 długich klatek (LoAF) > 100 ms poza pierwszym ekranem,
- [ ] w trakcie przewijania animacje tylko `transform`/`opacity` (wyjątki z listy w teście), przejścia stanu bez właściwości układu,
- [ ] okno oferty: wejście dokładnie jako przejście CSS 240 ms (transform + opacity, bez View Transitions; `software-catalog`, tam też zegar jako bezpiecznik: render ≤ 150 ms, wejście ≤ 400 ms); po kliknięciu najwyżej dwie klatki > 100 ms (dwa rendery: lekka pierwsza klatka i sekcje po wejściu) i żadna > 250 ms (`software-wydajnosc`). Pomiar 13.11: lokalnie ~31 + ~285 ms, CI ~60 + ~315 ms,
- [ ] **JS głównej przed interakcją ≤ 285 200 B** (gzip, pliki `/_next/static/*.js`, także z `preload`, po uspokojeniu sieci). Pomiar 13.11.2026: **271 631 B, 29 plików** (852 KB po rozpakowaniu), build produkcyjny SWA14 (a–c); próg = pomiar + 5%. Zmiana progu tylko z uzasadnieniem w opisie PR.

Kompresja: odpowiedzi kompresuje Next (`gzip`). Brotli w Nginx tylko wtedy, gdy obraz proxy (`nginx:*-alpine`) ma moduł bez przebudowy (decyzja 11.11) — w SWA14 nie sprawdzone w obrazie (bez pobierania obrazu), zostaje gzip.

## Bezpieczeństwo i RODO
- [ ] Walidacja po stronie serwera, honeypot + limit zgłoszeń.
- [ ] Zgoda RODO przy formularzu + link do polityki prywatności.
- [ ] Nagłówki bezpieczeństwa (CSP, HSTS, X-Content-Type-Options) w Nginx/Next.
- [ ] Uprawnienia kolekcji Payload: publiczny tylko odczyt opublikowanych treści.
- [ ] Dane osobowe (e-mail, telefon, treść zapytania) nie trafiają do logów, komunikatów błędów ani Sentry.

## Dokumentacja
- [ ] `docs/STAN.md` zaktualizowany; decyzja architektoniczna → ADR.
