# prokominstalacje.pl — checklista produkcji

Przygotował Claude Code 08.11.2026 (decyzja Krystiana 08.11: „przygotuj wszystko tak, żeby strona była gotowa na produkcję”). Plan: `docs/zadania/prokominstalacje-domkniecie.md` §3 „PROD”; procedury: `docs/wdrozenia.md`, `docs/runbook.md`, `docs/dns.md`. Sesja wdrożenia: `/wdrozenie produkcja — prokominstalacje.pl` (prompt PROD w planie §4).

**Nie robi tego Claude bez zgody Krystiana:** merge `develop` → `main`, migracje na serwerze, ręczne wdrożenie, zmiany DNS.

## A. Warunki z planu (stan 08.11.2026)

| Warunek | Stan | Skąd |
|---|---|---|
| Akceptacja szefa w Asanie | ✅ potwierdzona przez Krystiana 10.11; produkcja uruchomiona 10.11 (`docs/stan/STAN-instalacje.md`) | plan §5 |
| Strony prawne | ✅ teksty gotowe (Claude, bez prawnika — decyzja Krystiana 08.11); ☐ wkleić w panelu stagingu i produkcji | `docs/tresci/prokominstalacje-strony-prawne.md` |
| Przepisy na `/dla-architektow`, liczby „Dla kogo” (P1-7) | ✅ pominięte — zostają z datą „stan na” (decyzja Krystiana 08.11) | `dane/stanFaktow.ts` |
| Licencje zdjęć producentów (P1-10) | ✅ w porządku (Krystian 08.11) | — |
| Obraz OG 1200 × 630 (P1-5, D6 = A) | ✅ plik gotowy; ☐ wgrać w panelu | `docs/design/prokominstalacje/og/og-prokominstalacje.png` |
| Zdjęcia realizacji (P1-9) | ✅ startujemy z obecnymi 43 zdjęciami z pro-kom.eu — większych tam nie ma (API mediów: wszystkie 600 × 337), realizacji monitoringu też nie (decyzja Krystiana 08.11: „weź z pro-kom.eu”) | `seed/prokominstalacje/realizacje/` |
| Wyszukiwarka na telefonie (FUND-W PR1) | ☐ sesja fundamentu w toku | `feat/wsp-szukaj-telefon` |
| Budżet Lighthouse (LCP ≤ 2,5 s, SEO ≥ 90, A11y ≥ 90) na stagingu | ☐ sprawdzić run Lighthouse CI na `develop` po #398 | `lighthouserc.json`, runbook §3 |
| Kopia bazy przed wdrożeniem | ☐ w dniu wdrożenia | runbook |
| Umowy powierzenia danych z dostawcami: webh.pl (serwer), Seohost (poczta), Backblaze (kopie), Sentry (błędy) — polityka pisze, że przetwarzają „na nasze zlecenie” | ☐ Krystian: zaakceptować/podpisać DPA w panelach dostawców | polityka prywatności |
| Kopie zapytań w skrzynce `kontakt@prokominstalacje.pl` — usuwane po 24 mies. (tak obiecuje polityka) | ☐ Krystian: reguła/raz na kwartał czyszczenie wiadomości starszych niż 24 mies. (Seohost / klient poczty) | polityka prywatności |

## B. Panel stagingu (przed linkiem dla szefa)
1. Wszystko z `docs/stan/staging-instalacje.md` §1–§11.
2. Strony prawne: `/polityka-prywatnosci`, `/cookies`, `/dostepnosc` — treść z `docs/tresci/prokominstalacje-strony-prawne.md`.
3. Kotwice usługi Teletechnika: Zakres `zakres`, Etapy budowy `etapy`, Odbiór `przy-odbiorze`, Błędy `bledy`, Dla kogo `dla-kogo`, Przepisy `przepisy`, Zapytanie ofertowe `zapytanie`, Pytania `faq`.
4. `SiteSettings` Instalacji → SEO → obraz OG: `og-prokominstalacje.png`.

## C. Dzień wdrożenia (sesja PROD, Krystian zatwierdza każdy krok)
**Kolejność ma znaczenie:** `deploy.sh` robi smoke na wszystkich hostach z `PROD_SITE_HOSTS` (oczekuje 200 na `/`, `/sitemap.xml`, `/robots.txt`, `/mapa-strony`), a nieaktywny lub nieistniejący tenant daje 404 → wdrożenie się cofa. Dlatego domena Instalacji trafia do `PROD_SITE_HOSTS` dopiero, gdy tenant jest aktywny i ma dane.

0. **Czy produkcja prokom-web już działa?** Jeśli to pierwsza produkcja (żadna linia jeszcze nie jest na `main`) — najpierw runbook §3 „Pierwsze wdrożenie produkcji (raz)”: rekord panelu produkcji w `docs/dns.md` (dziś TODO), certyfikat `prokom-prod`, zmienne `PROD_*` w `.env.proxy`, nakładka `compose.proxy.prod.yml`, `.env.prod`, konto admina, cron `backup.sh prod`.
1. **Kopia bazy** produkcji: `backup.sh prod predeploy` (runbook §3 pkt 1) i sprawdzenie, że jest w B2.
2. **Wdrożenie przez pipeline** (po akceptacji szefa): PR `develop` → `main`, obraz z `develop` promowany na produkcję, migracje przy starcie, smoke na **dotychczasowych** domenach (`docs/wdrozenia.md` → Pipeline). `PROD_SITE_HOSTS` jeszcze bez Instalacji.
3. **Tenant `instalacje`** w panelu produkcji: domena `prokominstalacje.pl` (bez `www` — `www` przekierowuje Nginx, krok 6). Pole **„Aktywna” (`active`)** może być włączone — strona i tak nie jest dostępna publicznie, dopóki Nginx nie obsługuje domeny.
4. **Dane w panelu produkcji** — ta sama lista co B: dane wspólne, `SiteSettings`, `CompanyData`, `InstalacjeSettings`, strona główna, tytuły SEO, usługi, obiekty, strony do ułożenia, realizacje (zdjęcia z `seed/prokominstalacje/realizacje/media/` z opisami z `zdjecia.json`), Nowe rozwiązania, strony prawne, kotwice Teletechniki, obraz OG. Seed na produkcji jest zablokowany.
5. **Certyfikat** `prokom-prod` poszerzony o `prokominstalacje.pl` i `www.prokominstalacje.pl`. Przy działającym Nginx: `certbot certonly --webroot` z `--cert-name prokom-prod --expand` i pełną listą domen certyfikatu (runbook opisuje dziś tylko `--standalone` z wolnym portem 80 — dopisać komendę do runbooka przy pierwszym użyciu). DNS `@` i `www` już wskazują serwer (`docs/dns.md`, 31.10.2026).
6. **`.env.proxy`:** `prokominstalacje.pl` do `PROD_SITE_HOSTS`, `www.prokominstalacje.pl` do `PROD_WWW_HOSTS` (przekierowanie 301 na domenę bez `www` — PR `inst/wsp-www`), restart proxy z nakładką (runbook §3).
7. **Smoke produkcji:** `PANEL_HOST=<panel produkcji> bash scripts/smoke.sh http://127.0.0.1:3000 prokominstalacje.pl` + ręcznie: 35 adresów z `tests/e2e/instalacje/pages.ts` (200), `sitemap.xml` (tylko `https://prokominstalacje.pl`), `robots.txt` (bez `Disallow: /`), brak `noindex`, `https://www.prokominstalacje.pl/` → 301, `/llms.txt`, 404 linii, formularz Kontakt i kreator `/zaplanuj` (potwierdzenie od `kontakt@prokominstalacje.pl`, rekord w panelu).
8. **Google:** Search Console (domena, weryfikacja DNS TXT — najpierw wpis w `docs/dns.md`), wysłanie `sitemap.xml`; Bing Webmaster (import z Search Console); Profil Firmy w Google — link do strony.
9. **301 ze starych adresów pro-kom.eu** — wg `docs/tresci/prokominstalacje-301.md`, na obecnym serwerze pro-kom.eu (do czasu huba).
10. **Better Stack:** monitor `https://prokominstalacje.pl/api/health` (alert e-mail).
11. **Umami:** wpis `instalacje=<id>` w `UMAMI_WEBSITES` produkcji (gdy kontener Umami działa — dziś nie ma go w `compose.prod.yml`).
12. **DMARC** `quarantine` dla prokominstalacje.pl — wg planu w `docs/dns.md` (ok. 30.11), osobno.
13. **Wpis w STAN i Asanie** („SZEF · Akceptacja produkcji prokominstalacje.pl” → zamknięte), link do strony.

## D. Cofnięcie
Poprzedni obraz aplikacji: `docs/wdrozenia.md` → „Cofnięcie wdrożenia”. Wyłączenie pola „Aktywna” (`active`) tenanta chowa stronę (404) bez wdrożenia — ale wtedy domenę trzeba też zdjąć z `PROD_SITE_HOSTS`, inaczej następne wdrożenie cofnie smoke.
