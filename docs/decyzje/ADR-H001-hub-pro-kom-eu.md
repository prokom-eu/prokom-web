# ADR-H001 — Nowa pro-kom.eu (hub) jako tenant prokom-web

- **Status:** przyjęta (H0, 14.11.2026 — paczka wgrana z czatu za zgodą Krystiana)
- **Data:** 14.11.2026
- **Kontekst decyzji:** dokument fazy 1 zaakceptowany przez szefa 12.10.2026 (nowa pro-kom.eu = hub i integrator, gotowa do 20.12.2026), `decyzje-architektura-stron.md`, ADR-005 (stos), ADR-003 (zapytania w `Inquiries`), ADR-022 (elementy wspólne), ADR-024 (maile linii).
- **Wizualizacja (cel dla kodu):** artefakt „Nowa pro-kom.eu · wizualizacja (wersja prywatna)”, https://claude.ai/artifact/JPYzSjm9XgMNgasPjm8BHx — 17 stron desktop + podglądy telefonu i tabletu. Źródła plansz: `docs/design/prokomeu/plansze/`.

## Problem
pro-kom.eu ma być wejściem do całej firmy: mówi, kim jest PRO-KOM, i w kilka sekund kieruje klienta do właściwej linii (Biznes, Instalacje, Software, Tech, Gaming). Dziś każda linia ma własną stronę, a klient, który zna tylko nazwę „PRO-KOM”, nie wie, gdzie iść. Hub nie może dublować ofert linii ani ich utrzymywać drugi raz — ma je pokazywać i łączyć.

## Decyzja
1. **Hub to kolejny tenant w `prokom-web`** (Next.js + Payload 3 multi-tenant, te same wersje co reszta repo). Linia już istnieje w kodzie: `Tenants.line = 'prokom'` (`src/lib/tenant/lines.ts`, znak `prokom-glowna` w `src/lib/brand/lines.ts`, wpis `prokom` w `CompanyData.lines`). Tenant: nazwa „PRO-KOM”, slug `prokom`, linia `prokom`; domena produkcyjna `pro-kom.eu` (+ `www` → 301), lokalnie `prokom.localhost` (dopisać do `SEED_TENANTS` w `src/seed/tenants.ts`). **Folder budowy: worktree `prokom-web-hub`, `PORT=3004`, baza `prokom_web_hub`** (wzór `docs/sposob-pracy.md` → „Dwie strony równolegle”; inne linie pracują równolegle w swoich folderach). Bez osobnego repo (odrzucone jak przy Instalacjach: duplikacja panelu, danych i zapytań).
2. **Hub nie ma własnej oferty produktów.** Pokazuje usługi linii jako krótkie wpisy z linkiem do strony linii („Zobacz na prokombiznes.pl”). Pełne strony usług zostają na stronach linii — żadnych kopii treści (duplikacja = kara w Google i podwójne utrzymanie).
3. **Wspólne elementy z ADR-022 są fundamentem huba** (D1 i D2 scalone — #331, #332, #334, #336, #338, #339, #341–#343): `CompanyData` (linie, `locations[]`, `serviceZones`, `holidays`, `legal`, `consent`), grupa `shared` w `SiteSettings` (sekcje szyny, synonimy, `headerCta`, `tabBar`, `footerColumns`, `contact`, `about`), komponenty `src/components/shared/` — `BrandBar`, `SiteHeader`/`CapsuleShell`, `OpeningStatus` (`lib/shared/openingStatus.ts`: święta i „zamykamy za N min”), `SiteRail`, `SearchDialog` + `buildLineProvider`, `MenuSheet`, `TabBar`, `SiteFooter`, `LinesBand`, `LegalBar`, `AddressMap`, `ContactForm`, `ConsentField`, `SuccessPanel`, `FaqBlock`, `Steps`, `ServiceAreaMap`, `CompanyCard`, `StatsStrip`, `RulesBento`, `VerifyCards`, szablony `ContactPage`/`AboutPage`; maile linii (ADR-024). Hub podaje tylko swoje sloty i dane. Brakujące możliwości wspólnych komponentów → osobny mały PR `feat/wsp-*`, nie zmiany w PR huba.
4. **Kolory i motyw:** hub używa koloru marki PRO-KOM (zieleń #4FB034 / #45A02C) jako akcentu, a kolorów linii wyłącznie do oznaczania linii (kafle, paski, chipy). Kolory linii się nie mieszają (zasada ADR-013). Tokeny: `docs/design/prokomeu/tokens.css` (wyciąg 1:1 z wizualizacji). **Motyw domyślny: ciemny** (jak wizualizacja), przełącznik w nagłówku i w arkuszu menu, wybór zapamiętany (`localStorage`, z `try/catch`), bez mignięcia (skrypt w `<head>`).
5. **Dane huba w panelu** (ADR-H002): globalny `HubSettings` + kolekcje `HubServices`, `HubTools`, `HubHelp`, `HubPlans`. Dane wspólne (telefony, e-maile, godziny, adresy, autoryzacje) tylko z `CompanyData` — żadnych literałów w komponentach (test literałów).
6. **Zapytania** z formularzy huba trafiają do `Inquiries` (ADR-003, `submitInquiry()`) z kategorią `hub-*` i kluczem linii w danych zgłoszenia. Powiadomienie: dla Biznesu, Instalacji i Software — skrzynka zgłoszeń tenanta tej linii (`Tenants.notificationEmail`); dla Tech, Gaming i spraw ogólnych — skrzynka tenanta `prokom` (w panelu `biuro@pro-kom.eu`), z linią w temacie maila. Treść maili wg ADR-024 w marce PRO-KOM (zieleń).
7. **Aktualności:** hub pokazuje zajawki wpisów linii z tej samej bazy (`Posts` tenantów Biznes, Instalacje, Software) + własne wpisy huba. Tech (Django, prokomserwis.pl) i Gaming (osobne repo) — w v1.1 przez publiczny kanał JSON każdej strony z cache; do tego czasu tylko link „Poradniki linii”.
8. **Przekierowania:** wszystkie adresy obecnej pro-kom.eu dostają 301 (wtyczka Redirects) — do odpowiednika na stronie linii albo na hubie. Lista budowana z repo obecnej pro-kom.eu i jej sitemap (zadanie H6).
9. **Analityka:** Umami wg ADR-020 (nasz VPS, bez ciasteczek) — zdarzenia: klik telefonu, wysłanie formularza, użycie narzędzia, wyszukiwanie bez wyniku.
10. **Strony Biznesu o zaopatrzeniu:** prokombiznes.pl ma już `/agd-rtv-dla-firm` i `/dostawy-it-dla-firm` (paczka 0611, D1–D4). Hub `/inwestycje-i-dostawy` jest stroną-zbiorczą dla wielu linii (lista zapytania, obiekty, instytucje, deweloperzy) i **linkuje do tych podstron** przy RTV/AGD i dostawach IT; teksty huba są własne — nie kopiujemy treści między domenami (CLAUDE.md, SEO).

## Konsekwencje
- (+) Jedna aplikacja, jeden panel, jedna skrzynka zapytań; hub korzysta z gotowych komponentów, więc budowa to głównie strony i sekcje.
- (+) Zmiana telefonu albo godzin w `CompanyData` od razu działa na hubie i wszystkich liniach.
- (−) Hub zależy od D1/D2 — nie ruszy wcześniej. Opóźnienie wspólnych elementów przesuwa hub.
- (−) Produkcja wymaga kontroli DNS `pro-kom.eu`. Strefa jest dziś w nazwa.pl, transfer zaplanowany na koniec listopada — **przełączenie huba dopiero po transferze albo przez zmianę rekordu A w nazwa.pl** (nie ruszamy MX/SPF/DKIM/DMARC).
- (−) Obecna pro-kom.eu stoi na nazwa.pl do grudnia — przełączenie musi być przed końcem abonamentu i po sprawdzeniu 301.

## Odrzucone
- **Osobne repo huba** — duplikacja panelu i zapytań.
- **Hub jako zwykły szablon `Pages` z bloków** — strona główna i ścieżki (Dobierz, Załatw online, lista zapytania) są interaktywne i mają własną logikę; bloki dałyby zbyt dużo pól w panelu. Treści edytowalne zostają w panelu (ADR-H002), układ w kodzie.
- **Kopie stron usług linii na hubie** — duplikacja treści.
