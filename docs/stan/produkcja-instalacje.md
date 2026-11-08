# prokominstalacje.pl — checklista produkcji

Przygotował Claude Code 08.11.2026 (decyzja Krystiana 08.11: „przygotuj wszystko tak, żeby strona była gotowa na produkcję”). Plan: `docs/zadania/prokominstalacje-domkniecie.md` §3 „PROD”; procedury: `docs/wdrozenia.md`, `docs/runbook.md`, `docs/dns.md`. Sesja wdrożenia: `/wdrozenie produkcja — prokominstalacje.pl` (prompt PROD w planie §4).

**Nie robi tego Claude bez zgody Krystiana:** merge `develop` → `main`, migracje na serwerze, ręczne wdrożenie, zmiany DNS.

## A. Warunki z planu (stan 08.11.2026)

| Warunek | Stan | Skąd |
|---|---|---|
| Akceptacja szefa w Asanie | ☐ czeka na przegląd stagingu | plan §5 |
| Strony prawne | ✅ teksty gotowe (Claude, bez prawnika — decyzja Krystiana 08.11); ☐ wkleić w panelu stagingu i produkcji | `docs/tresci/prokominstalacje-strony-prawne.md` |
| Przepisy na `/dla-architektow`, liczby „Dla kogo” (P1-7) | ✅ pominięte — zostają z datą „stan na” (decyzja Krystiana 08.11) | `dane/stanFaktow.ts` |
| Licencje zdjęć producentów (P1-10) | ✅ w porządku (Krystian 08.11) | — |
| Obraz OG 1200 × 630 (P1-5, D6 = A) | ✅ plik gotowy; ☐ wgrać w panelu | `docs/design/prokominstalacje/og/og-prokominstalacje.png` |
| Zdjęcia realizacji (P1-9) | ✅ startujemy z obecnymi 43 zdjęciami z pro-kom.eu — większych tam nie ma (API mediów: wszystkie 600 × 337), realizacji monitoringu też nie (decyzja Krystiana 08.11: „weź z pro-kom.eu”) | `seed/prokominstalacje/realizacje/` |
| Wyszukiwarka na telefonie (FUND-W PR1) | ☐ sesja fundamentu w toku | `feat/wsp-szukaj-telefon` |
| Budżet Lighthouse (LCP ≤ 2,5 s, SEO ≥ 90, A11y ≥ 90) na stagingu | ☐ sprawdzić run Lighthouse CI na `develop` po #398 | `lighthouserc.json`, runbook §3 |
| Kopia bazy przed wdrożeniem | ☐ w dniu wdrożenia | runbook |

## B. Panel stagingu (przed linkiem dla szefa)
1. Wszystko z `docs/stan/staging-instalacje.md` §1–§11.
2. Strony prawne: `/polityka-prywatnosci`, `/cookies`, `/dostepnosc` — treść z `docs/tresci/prokominstalacje-strony-prawne.md`.
3. Kotwice usługi Teletechnika: Zakres `zakres`, Etapy budowy `etapy`, Odbiór `przy-odbiorze`, Błędy `bledy`, Dla kogo `dla-kogo`, Przepisy `przepisy`, Zapytanie ofertowe `zapytanie`, Pytania `faq`.
4. `SiteSettings` Instalacji → SEO → obraz OG: `og-prokominstalacje.png`.

## C. Dzień wdrożenia (sesja PROD, Krystian zatwierdza każdy krok)
1. **Kopia bazy** produkcji (`scripts/backup.sh`, runbook §1.8) i sprawdzenie, że jest w B2.
2. **`.env.proxy` na serwerze:** `PROD_SITE_HOSTS` z `prokominstalacje.pl www.prokominstalacje.pl` (obok pozostałych domen produkcji), certyfikat `prokom-prod` rozszerzony o obie nazwy (certbot, runbook). DNS `@` i `www` już wskazują serwer (`docs/dns.md`, 31.10.2026) — bez zmian DNS.
3. **Tenant `instalacje`** w panelu produkcji: domena produkcyjna `prokominstalacje.pl` (i `www`, jeśli tenant ma listę), `published = true` dopiero po kroku 5.
4. **Wdrożenie przez pipeline:** PR `develop` → `main` (po akceptacji szefa), obraz z `develop` promowany na produkcję, migracje przy starcie, smoke test (`docs/wdrozenia.md` → Pipeline).
5. **Dane w panelu produkcji** — ta sama lista co B (staging → produkcja): dane wspólne, `SiteSettings`, `CompanyData`, `InstalacjeSettings`, strona główna, tytuły SEO, usługi, obiekty, strony do ułożenia, realizacje (zdjęcia z `seed/prokominstalacje/realizacje/media/` z opisami z `zdjecia.json`), Nowe rozwiązania, strony prawne, kotwice Teletechniki, obraz OG. Seed na produkcji jest zablokowany.
6. **Smoke produkcji:** `PANEL_HOST=<panel produkcji> bash scripts/smoke.sh http://127.0.0.1:3000 prokominstalacje.pl` + ręcznie: 35 adresów z `tests/e2e/instalacje/pages.ts` (200), `sitemap.xml` (tylko `https://prokominstalacje.pl`), `robots.txt` (bez `Disallow: /`), brak `noindex`, `/llms.txt`, 404 linii, formularz Kontakt i kreator `/zaplanuj` (potwierdzenie od `kontakt@prokominstalacje.pl`, rekord w panelu).
7. **Tenant `published = true`.**
8. **Google:** Search Console (domena, weryfikacja DNS TXT — najpierw wpis w `docs/dns.md`), wysłanie `sitemap.xml`; Bing Webmaster (import z Search Console); Profil Firmy w Google — link do strony.
9. **301 ze starych adresów pro-kom.eu** — wg `docs/tresci/prokominstalacje-301.md`, na obecnym serwerze pro-kom.eu (do czasu huba).
10. **Better Stack:** monitor `https://prokominstalacje.pl/api/health` (alert e-mail).
11. **Umami:** wpis `instalacje=<id>` w `UMAMI_WEBSITES` produkcji (jeśli kontener działa).
12. **DMARC** `quarantine` dla prokominstalacje.pl — wg planu w `docs/dns.md` (ok. 30.11), osobno.
13. **Wpis w STAN i Asanie** („SZEF · Akceptacja produkcji prokominstalacje.pl” → zamknięte), link do strony.

## D. Cofnięcie
Poprzedni obraz aplikacji: `docs/wdrozenia.md` → „Cofnięcie wdrożenia”. Tenant `published = false` chowa stronę (404) bez wdrożenia.
