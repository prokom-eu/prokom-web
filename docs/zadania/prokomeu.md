# Plan budowy — nowa pro-kom.eu (hub) · duże sesje

Wersja 1.0 · 14.11.2026 · spec: `docs/strony/prokomeu.md` · decyzje: ADR-H001, ADR-H002 · wzorzec: `docs/design/prokomeu/` · seed: `seed/prokomeu/`

## 0. Zasady
- **Duże sesje** (decyzja Krystiana): jedna sesja = jeden plan całości + kilka małych PR-ów piętrowych (≤ ~400 linii zmian każdy), robionych przez kilka wieczorów. Ciągłość niesie `docs/STAN.md` („kontynuacja wg STAN”).
- **Warunek startu H1 spełniony:** D1 i D2 scalone (do #343, 07.11). **H0 zrobione 14.11** (paczka wgrana z czatu, ADR-H001/H002 przyjęte) — zaczynasz od H1.
- **Folder (decyzja H0):** worktree **`prokom-web-hub`**, `PORT=3004`, baza `prokom_web_hub`, host `prokom.localhost:3004`; gałęzie `hub/*` od `origin/develop`. Stan sesji w `docs/STAN.md` → podsekcja „pro-kom.eu (hub)”. Nigdy dwie sesje w jednym folderze; najwyżej dwie sesje piszące kod naraz we wszystkich liniach (CLAUDE.md).
- Pliki wspólne (`src/components/shared/`, `CompanyData`) zmieniamy tylko małym PR `feat/wsp-*`, nie w PR huba.
- **Rytuał po każdym PR:** `/przeglad` → porównanie z planszą (1440 i 390, jasny i ciemny; zrzuty w PR) → `/koniec-sesji` (STAN: co scalone, co następne) → `/pr`. Kolejny wieczór: `/zadanie H… — kontynuacja wg STAN`.
- **Definition of Done każdego PR z UI:** spec §9 (Lighthouse ≥ 90 telefon, axe 0, brak poziomego przewijania 360/390/414/820/1024, reduced-motion, test literałów, e2e ścieżki z PR).
- Nowe pomysły w trakcie → osobne zadanie w STAN, nie „przy okazji”.

## 1. Mapa i szacunek

```
H0 dokumenty ──► (D1 + D2 scalone) ──► H1 fundament ──► H2 główna ──► H3 oferta i ścieżki ──► H4 B2B
                                                                         └──► H5 strony informacyjne
                                         H6 formularze, maile, SEO, 301 (po H4/H5) ──► H7 telefon, QA, staging, produkcja
```

| Sesja | PR-y (piętrowo) | Zakres | Wieczory | Warunek |
|---|---|---|---|---|
| **H0** ✅ | 1 | wgranie paczki, ADR-H001/H002 przyjęte, STAN, CLAUDE.md, decyzja folder (14.11, z czatu) | — | — |
| **H1** | `feat/wsp-linie-kontakt` · H1-1 · H1-2 · H1-3 | kontakt linii Tech/Gaming w `CompanyData` · tenant + routing domeny + model + seed · tokeny, motyw, powłoka (sloty huba, mega menu, szyna, arkusz, dolny pasek, stopka, status godzin) · indeks wyszukiwania + `/szukaj` | 3 | ✅ D1, D2 |
| **H2** | H2-1 · H2-2 · H2-3 | strona główna: hero + Wszystkie linie · Dobierz, Załatw online, Co zrobić gdy, blok Współpraca · Marki, Zasięg, Aktualności, FAQ, Kontakt, Finał | 3,5 | H1 |
| **H3** | H3-1 · H3-2 · H3-3 | `/linie` · `/dla-firm` · `/dla-domu` | 3,5 | H1 (H2 nie blokuje) |
| **H4** | H4-1 · H4-2 | `/inwestycje-i-dostawy` (lista, obiekty, zakres, pasek, kopiuj) · formularz dostaw + `/wspolpraca` | 3 | H1 |
| **H5** | H5-1 · H5-2 · H5-3 | `/zalatw-online`, `/pomoc` + `/pomoc/[slug]` · `/kontakt`, `/o-firmie`, `/partnerzy` · `/gdzie-dzialamy`, `/aktualnosci`, prawne, `/mapa-strony`, 404 | 3,5 | H1 |
| **H6** | H6-1 · H6-2 | wszystkie formularze → `Inquiries` + maile + antyspam · SEO (metadane, JSON-LD, sitemap, robots), 301 ze starej pro-kom.eu, Umami | 2,5 | H4, H5 |
| **H7** | H7-1 · H7-2 | telefon/tablet jak aplikacja + QA całości · staging → akceptacja szefa → przełączenie domeny | 2,5 | H6 |
| | | **Razem** | **≈ 22** | |

**Termin 20.12.2026** (dokument fazy 1). Od 14.11 do 20.12 jest 5 tygodni i ok. 21,5 wieczoru pracy (H0 zrobione) → ok. 4–5 wieczorów tygodniowo przy równoległych produkcjach linii. **Pełny zakres do 20.12 jest mało realny — mówimy to szefowi wprost i od razu planujemy v1 (lista „bez cięć”) + v1.1 w pierwszym tygodniu stycznia.**

**Kolejność cięcia (gdy brakuje czasu, przed 20.12):** `/aktualnosci` (zostaje sekcja na głównej) → `/pomoc/[slug]` (zostaje `/pomoc`) → `/gdzie-dzialamy` (sekcja w Kontakcie) → `/partnerzy` (sekcja w O firmie) → `/mapa-strony` → `/dla-domu` → `/wspolpraca` (architektów obsługuje prokominstalacje.pl/dla-architektow) → `/zalatw-online` (zostaje sekcja 5×2 na głównej). Ucięte strony = ukryte flagą, bez martwych linków; budowa zaraz po starcie (v1.1).
**Bez cięć:** powłoka, `/`, `/linie`, `/dla-firm`, `/inwestycje-i-dostawy`, `/kontakt`, `/o-firmie`, `/szukaj`, prawne, 404, formularze + maile, SEO + 301, telefon.

## 2. Prompty

### H0 — wgranie paczki i dokumenty (bez kodu) — ✅ ZROBIONE 14.11 z czatu (zostawione dla historii)
```
/zadanie H0 — wgranie paczki huba pro-kom.eu (tylko dokumenty, bez kodu).
Paczka leży w katalogu, który podam. Na gałęzi docs/prokomeu:
1. Skopiuj do repo: docs/strony/prokomeu.md, docs/strony/prokomeu-pytania.md, docs/decyzje/ADR-H001-hub-pro-kom-eu.md, docs/decyzje/ADR-H002-model-tresci-huba.md, docs/zadania/prokomeu.md, docs/design/prokomeu/ (README, tokens.css, plansze/), seed/prokomeu/strony/*.json.
2. Przeczytaj ADR-H001/H002 i porównaj z tym, co jest w repo: ADR-022 (CompanyData, SiteHeader, SiteRail, SearchDialog, ContactForm, szablony), ADR-024 (maile), ADR-003 (Inquiries), konwencja hostów lokalnych i tenantów. Wypisz rozbieżności i zaproponuj poprawki do ADR-H00x (np. nazwy pól, które już istnieją). Nie zmieniaj kodu.
3. Zaproponuj decyzję „folder”: hub w folderze fundamentu (gałęzie hub/*) czy worktree prokom-hub (PORT, baza) — z uzasadnieniem przy obecnym obciążeniu (inne linie w produkcji).
4. Dopisz do docs/STAN.md sekcję „pro-kom.eu (hub)” (stan: H0, następne H1 po D1+D2) i 3 linijki do CLAUDE.md: spec huba, kolejność ważności (STAN → spec → plansze → seed), zasady treści (spec §3).
5. INDEKS/MAPA dokumentów: dopisz hub tam, gdzie repo trzyma spis dokumentacji.
Jeden PR „docs: paczka huba pro-kom.eu”. Na koniec lista pytań do mnie, jeśli coś w ADR jest niejasne.
```

### H1 — fundament huba
```
/zadanie H1 — fundament huba pro-kom.eu: kontakt linii, tenant, model, seed, powłoka, wyszukiwarka (spec §2, §4–§5; ADR-H001, ADR-H002; plansze docs/design/prokomeu/plansze/Naglowek.dc.html, Stopka.dc.html, Szukaj.dc.html; seed seed/prokomeu/strony/).
Folder: worktree prokom-web-hub (PORT=3004, baza prokom_web_hub, host prokom.localhost:3004) — jeśli nie istnieje, zatrzymaj się i podaj mi komendy z docs/sposob-pracy.md „Założenie folderu”. Przeczytaj spec w całości, ADR-H001/H002, ADR-022 (z rozstrzygnięciami D2) i docs/design/prokomeu/README.md. Jeden plan całości z podziałem na PR-y → moja akceptacja → kod.

PR 0 (feat/wsp-linie-kontakt, od origin/develop, mały): CompanyData.lines[] + pola phone, email, hours, promise (dla linii bez tenanta: tech, gaming), migracja tylko dodająca, seed company.ts (Tech: 883 200 151, sklep@pro-kom.eu, „pn–pt 9:00–17:00, sob. 9:00–14:00”, „Bezpłatna diagnoza i wycena”; Gaming: 883 200 151, kontakt@prokomgaming.pl, godziny z [SZEF] — puste z TODO(krystian)), testy.
H1-1 (hub/h1-model, od PR 0): tenant „PRO-KOM” slug prokom, linia prokom w SEED_TENANTS (prokom.localhost), flaga publikacji tenanta jak u Instalacji (niewidoczny na produkcji do akceptacji szefa); HubSettings (dokument per tenant, wzór BiznesSettings) + kolekcje HubServices, HubTools, HubHelp, HubPlans wg ADR-H002 (hook blokujący publikację ze znacznikiem [SZEF); SiteSettings tenanta prokom (telefon firmy 883 200 151, biuro@pro-kom.eu, shared: sekcje szyny, tabBar z centrum „Dobierz”, footerColumns, synonimy); kategorie Inquiries hub-* wg kontraktu ADR-003; skrypt pnpm seed:prokom (idempotentny, jak seed:biznes) mapujący seed/prokomeu/strony/*.json → kolekcje (Linie.json services z wyjątkami url b11/b12/i10, Narzedzia.json data, Pomoc.json cases, DlaFirm.json branches + Main.json personas jako jeden wpis na branżę, DlaDomu.json sits, Dostawy/Wspolpraca → HubSettings) — dopisz seed/prokomeu/ do .prettierignore, jeśli jeszcze nie ma; loader getHubData z filtrem tenanta i cache; test izolacji (treść huba nie wycieka na inne domeny i odwrotnie); testy liczb (49 usług, 20 narzędzi, 26 sytuacji, 13 branż, 7 sytuacji domu, 9 obiektów, 6 segmentów dostaw) i blokady [SZEF.
H1-2 (hub/h1-powloka): tokeny huba jako src/styles/tokens-prokom.css z docs/design/prokomeu/tokens.css (ADR-007/ADR-013: kolory tylko z tokenów; ciemny domyślny dla linii prokom — dziś hasDarkTheme('prokom') = false, zmień z testem), kroje Archivo/Manrope jak w innych liniach; powłoka ze wspólnych komponentów: BrandBar + OpeningStatus, SiteHeader ze slotami huba (menu spec §5.2; mega menu „Oferta” z 5 liniami z HubServices + „Zacznij od siebie” + karta Dobierz; ukrywanie „Pomoc” i „O firmie” 1081–1340; flagi stron v1.1), SiteRail tylko na „/” (11 sekcji z shared.rail), MenuSheet ≤1080, TabBar <760 z wyróżnionym „Dobierz”, SiteFooter + LinesBand + LegalBar (spec §5.5); lib/prokom/icons.ts (mapa słów → ikony z lib/shared/icons.ts, test: każda usługa ma ikonę inną niż domyślna). Strona „/” na razie jako szkielet sekcji z kotwicami. e2e: powłoka na 1440/1180/1081/390 bez łamania menu, motyw ciemny/jasny bez mignięcia.
H1-3 (hub/h1-szukaj): indeks huba dla SearchDialog przez buildLineProvider (usługi, narzędzia, pomoc, strony, linie; synonimy z keywords i shared.synonyms), strona /szukaj (filtry linii z licznikami, najlepsze trafienie, grupy, pusty stan z telefonem, noindex), zdarzenie Umami „szukaj-brak-wyniku” (ADR-020).
Każdy PR: zrzuty 1440/1180/390 jasny/ciemny obok planszy (Krystian robi zrzuty planszy z Play, jeśli potrzebujesz — poproś), testy, /przeglad, STAN.
```

### H2 — strona główna
```
/zadanie H2 — strona główna pro-kom.eu (spec §6.1; plansza Main.dc.html; dane Main.json + kolekcje z H1).
Jeden plan całości → akceptacja → PR-y:
H2-1 (hub/h2-hero-linie): hero (kafel PRO-KOM z paskiem 5 kolorów, CTA i chipami; 5 kafli linii ze slajdami co 4,2 s z pauzą na hover/fokus/ukrytą kartę/poza ekranem; winiety; liczby z odliczaniem raz; pasek zaufania tylko z zatwierdzonych faktów) + sekcja „Wszystkie linie” (6 zakładek 5 linii + Razem, autoprzewijanie 9 s zatrzymane po ręcznym wyborze, fakty i usługi z ikonami, „Także”, kroki, 2 narzędzia) + blok „Jeden klient. Kilka linii. Jeden telefon.”
H2-2 (hub/h2-sciezki): Dobierz (persony z HubPlans, plan po liniach + telefon linii), Załatw online (5 paneli po 2 narzędzia z HubTools.featuredOnHome + karta „20 spraw” → /zalatw-online albo ukryta flagą), Co zrobić, gdy… (HubHelp), blok Współpraca/inwestycje (przyciski Inwestycje i dostawy, Współpraca z pracownią; 5 kart).
H2-3 (hub/h2-reszta): Marki (4 autoryzacje + grupy marek), Zasięg, Aktualności (agregacja Posts 3 tenantów; brak wpisów = sekcja ukryta), FAQ (pierwsza otwarta), Kontakt (wiersze linii, salon, chipy tematów → /kontakt?temat=), Finał. Szyna sekcji działa z kotwicami.
Ruch wg spec §8 (CSS animation-timeline w @supports, reduced-motion). Zrzuty całej strony 1440 i 390 w obu motywach obok planszy.
```

### H3 — oferta i ścieżki
```
/zadanie H3 — /linie, /dla-firm, /dla-domu (spec §6.2–§6.4; plansze Linie.dc.html, DlaFirm.dc.html, DlaDomu.dc.html; dane z H1).
Jeden plan → akceptacja → PR-y:
H3-1 /linie: hero z wyszukiwarką oferty, lista HubServices z filtrami (linia, dla kogo, tekst) i licznikami z danych, panel podglądu (?u=klucz w adresie), CTA wg url/ctaLabel (wyjątki z importu: b11, b12 → /inwestycje-i-dostawy; i10 → /wspolpraca), sekcje „Kto czym się zajmuje”, „Tak pracują razem”, „Co dalej”. Na telefonie lista → podgląd jako arkusz.
H3-2 /dla-firm: branże (lista z ikonami + karta planu z HubPlans), obszary w 4 zakładkach linii, sytuacje z przebiegiem, wdrożenie, opieka, porównanie, dofinansowania (bez finansowania), marki, FAQ, formularz hub-dla-firm (ContactForm), Co dalej, Finał.
H3-3 /dla-domu (ukryta flagą do akceptacji, jeśli nie zdążymy): sytuacje, scena 3 linii, przekrój 11 punktów, tematy, gwarancje, FAQ, formularz hub-dla-domu.
Konfiguracja/montaż/szkolenie zawsze jako opcja (spec §3). Zrzuty vs plansze.
```

### H4 — Inwestycje i dostawy + Współpraca
```
/zadanie H4 — /inwestycje-i-dostawy i /wspolpraca (spec §6.5–§6.6; plansze Dostawy.dc.html, Wspolpraca.dc.html; dane HubSettings.deliveries i .cooperation).
Jeden plan → akceptacja → PR-y:
H4-1 (hub/h4-dostawy): hero z 6 segmentami (wybór zmienia panel i formularz), 3 „drogi”, fakty; Co dostarczamy; lista zapytania (stan w komponencie klienckim + sessionStorage z try/catch; − / + / +10, max 999; podsumowanie przyklejone ≥1240 px; usługi opcjonalne; termin; nota RTV/AGD bez montażu; „Kopiuj listę do schowka” z obsługą braku Clipboard API); 9 obiektów w siatce 3×3 z „Wczytaj przykład do listy” (preset nadpisuje, przewija do listy); zakres do wyboru (3 poziomy + 5 zakładek); proces z linią; marki; porównanie + formalności; po dostawie + miejscowości; pływający pasek listy (nad dolnym paskiem <760, chowa się przy widocznym formularzu). Testy: jednostkowe stanu listy (dodaj, max, wyczyść, preset), e2e: dodaj 3 pozycje → wczytaj „Restauracja” → kopiuj → przejdź do formularza.
H4-2 (hub/h4-formularze-wspolpraca): formularz hub-dostawy (pola spec §6.5 pkt 10; lista, usługi i termin w Inquiries.payload; routing Biznes + Instalacje gdy są instalacje; mail z tabelą listy) + /wspolpraca (6 ról z formularzem adaptacyjnym, etapy, zakres w 3 zakładkach, dostawcy, zasady, FAQ, formularz hub-wspolpraca z polem „link do rzutów”, bez uploadu).
Bez cen. Konfiguracja, montaż, szkolenie wyłącznie jako opcje.
```

### H5 — strony informacyjne
```
/zadanie H5 — strony informacyjne huba (spec §6.7–§6.15; plansze Narzedzia, Pomoc, Kontakt, OFirmie, Partnerzy, Zasieg, Aktualnosci, Prawne, MapaStrony, E404).
Jeden plan → akceptacja → PR-y (strony z listy cięcia budujemy na końcu i chowamy flagą, jeśli brak czasu):
H5-1: /zalatw-online (20 narzędzi, filtry „co chcesz zrobić” i linia, wyszukiwanie, podgląd ze ścieżką, „Wkrótce” bez linku zewnętrznego) + /pomoc i /pomoc/[slug] (HubHelp, generateStaticParams, BreadcrumbList, formularz hub-pomoc; „Najczęstsze w tym tygodniu” ręcznie z panelu).
H5-2: /kontakt na szablonie ContactPage (książka linii, formularz hub-kontakt z ?temat=, dojazd z mapą OSM jako obraz w repo, co przygotować, godziny linii z sobotą Tech, dane firmy bez numeru konta, FAQ) + /o-firmie na AboutPage (fakty zatwierdzone, historia bez [ROK], 5 linii, zasady, kroki, autoryzacje z linkami, salon, dane rejestrowe) + /partnerzy.
H5-3: /gdzie-dzialamy (sprawdzanie miejscowości wg stref z CompanyData), /aktualnosci (agregacja, linki do wpisów u źródła, newsletter wyłączony), prawne (treść z HubSettings.legal, noindex do akceptacji prawnika), /mapa-strony (z danych + lista 301), 404.
```

### H6 — formularze, maile, SEO, przekierowania
```
/zadanie H6 — formularze, maile, SEO i przekierowania huba (spec §4, §7; ADR-H001 pkt 6–9; ADR-024).
Jeden plan → akceptacja → PR-y:
H6-1 (hub/h6-formularze): przegląd wszystkich 6 formularzy na wspólnym ContactForm (zgoda wg consentMode, honeypot, limit, komunikaty, sukces z numerem i krokami), routing lineKey → Tenants.notificationEmail linii (tech, gaming, ogólne → skrzynka tenanta prokom) wg ADR-H001 pkt 6, maile potwierdzenia w marce PRO-KOM z obietnicą linii, powiadomienia z payload (lista jako tabela), limit 3/dobę; e2e każdego formularza na Mailpicie.
H6-2 (hub/h6-seo): metadane z tabeli spec §4 (edytowalne w panelu), canonical, JSON-LD (Organization, LocalBusiness salonu z godzinami z CompanyData, BreadcrumbList, FAQPage tylko z widocznymi pytaniami), sitemap.xml (tylko indeksowane i opublikowane), robots.txt; przekierowania 301: zbuduj listę ze starego repo pro-kom.eu (podam ścieżkę) i jego sitemap — tabela stary adres → cel w PR do mojej akceptacji, potem wpisy do Redirects + test e2e każdego 301; Umami (zdarzenia: tel, formularz, narzędzie, szukaj-brak-wyniku).
```

### H7 — telefon, QA, staging, produkcja
```
/zadanie H7 — telefon jak aplikacja, QA całości, staging i produkcja huba (spec §5.4, §9).
H7-1 (hub/h7-qa): audyt każdej strony na 360/390/414/820/1024/1440 w obu motywach (brak poziomego przewijania, dolny pasek, arkusz, chowanie nagłówka, cele dotyku ≥44 px, safe-area), axe 0, Lighthouse telefon ≥90/100/100, e2e całych ścieżek (wyszukiwarka, Dobierz, lista zapytania, formularze), test literałów, zrzuty vs plansze; poprawki w tym samym PR albo lista w STAN.
H7-2 (staging → produkcja): wdrożenie na staging (staging.pro-kom.eu za hasłem, noindex), checklista dla mnie (treści [SZEF], formularze na prawdziwe skrzynki, maile w Gmail/Outlook, mail-tester ≥9/10), akceptacja szefa (Asana „SZEF · Akceptacja nowej pro-kom.eu”), plan przełączenia domeny krok po kroku jako lista komend do odhaczania (rekord A pro-kom.eu i www → 194.28.50.70, bez ruszania MX/SPF/DKIM/DMARC; certyfikat; flaga publikacji tenanta; sprawdzenie 301; Search Console: nowa sitemap). Nic nie robisz sam w DNS ani na serwerze.
```

## 3. Co Krystian robi poza Claude Code
| Kiedy | Co | Czas |
|---|---|---|
| przed H0 | pokazać szefowi wizualizację, Asana „SZEF · Akceptacja wizualizacji pro-kom.eu + pytania” (`prokomeu-pytania.md`) | 30 min |
| po H1-1 | panel lokalny: przejrzeć HubSettings i kolekcje po seedzie, oznaczyć [SZEF] | 20 min |
| po każdym PR z UI | lista „Sprawdź”: plansza obok, telefon w ręku (Chrome DevTools nie wystarcza), ciemny/jasny | 10 min |
| przed H6-2 | ścieżka do repo obecnej pro-kom.eu + eksport adresów z Search Console (Strony → Zindeksowane) | 15 min |
| przed H7-2 | termin transferu DNS pro-kom.eu, abonament nazwa.pl, odpowiedzi szefa i prawnika | — |
