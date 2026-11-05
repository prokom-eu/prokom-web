# Elementy wspólne linii i maile — plan sesji Claude Code (prokom-web) · v3 (05.11.2026)

Spec: `docs/design/wspolne/WSPOLNE-ELEMENTY.md` · Decyzja: `docs/decyzje/ADR-022-elementy-wspolne-linii.md` · Wzorzec: `docs/design/wspolne/plansze/` (+ płótno Krystiana https://claude.ai/artifact/7HKNezL1nNmgeZPJum8rQG).
Dotyczy tenantów **biznes, instalacje, software**. Tech (prokomserwis.pl) — osobny plan w `prokom-system/docs/wspolne/`. Gaming — nie dotyczy (poza flagą w `CompanyData.lines`).

**v3 (05.11, decyzja Krystiana) — duże sesje zamiast małych.** Po F0/F0b zostają **trzy rodzaje dużych sesji**: **D1** (dane wspólne + maile), **D2** (wszystkie komponenty wspólne i szablony stron) i **D3** (jedna sesja na linię: powłoka, szyna, wyszukiwarka, Kontakt, O firmie). Każda duża sesja to **jeden plan i kilka PR-ów piętrowych**, robionych przez kilka wieczorów; ciągłość między wieczorami niesie `docs/STAN.md`. Zakres i zasady v2 (część wspólna raz w folderze fundamentu, linie w swoich folderach, linia nie zmienia części wspólnej) zostają bez zmian. Dotychczasowe prompty F1–F4 i L1–L2 (§2, §3) są teraz **krokami szczegółowymi** dużych sesji — duża sesja odsyła do nich zamiast powtarzać treść. Maile: `docs/zadania/maile-linii.md` (spec `MAILE.md`, ADR-024) — część D1.

## 0. Podział i zasady

### Fundament (F0, D1, D2) — raz, w jednym folderze, jedna sesja naraz
- Folder: ten, w którym akurat **nie** trwa sesja linii (np. folder `prokom-web`). Nigdy dwie sesje Claude Code w jednym folderze.
- F robi: dokumenty, **dane i migracje**, tokeny, **wszystkie komponenty wspólne** i **szablony stron z miejscami na sekcje linii**, stronę podglądu komponentów. F **nie wpina** niczego w ramki linii (`src/sites/<linia>/…` bez zmian — wyjątek: seed treści linii w F1).
- Gałęzie `feat/wsp-*` (F0: `docs/wsp-*`), squash do `develop`.

### Sesje linii (D3-B, D3-I, D3-S) — w folderze danej linii, po scaleniu odpowiednich PR-ów D2
- Przed sesją: `git fetch` + rebase/merge `develop` (musi zawierać F).
- L **nie zmienia** `src/components/shared/`, `src/lib/shared/`, tokenów ról ani wspólnych pól panelu i **nie robi migracji wspólnych danych**. Brakuje czegoś we wspólnym komponencie → mały osobny PR `feat/wsp-<co>` do `develop` (z testem), potem linia z niego korzysta. Pola **tylko dla linii** (np. treść sekcji własnej) — w ustawieniach tej linii, własną migracją linii.
- Gałęzie wg konwencji linii (`feat/…`, Instalacje `inst/…`), wpis w STAN linii (`docs/STAN.md` albo `docs/stan/STAN-instalacje.md`).

### Wspólne dla wszystkich sesji
- **Duża sesja = jeden plan, kilka PR-ów.** Plan całości w trybie planowania na początku (akceptuje Krystian), potem PR po PR. Po każdym PR: `/przeglad` → `/koniec-sesji` (STAN: „W toku: D2, scalone D2-1, następny D2-2”) → `/pr`. Następny wieczór: `/zadanie D2 — kontynuacja wg STAN` (bez nowego planu, chyba że coś się zmieniło). Kolejny PR piętrowy startuje od poprzedniego; po scaleniu GitHub przestawia bazę na `develop`.
- Plan w trybie planowania — akceptuje Krystian. Na koniec: `/przeglad` → porównanie z planszami → `/koniec-sesji` → `/pr`.
- **Przed każdą sesją z UI:** zrzuty dotkniętych stron (1440 i 390, jasny/ciemny) do `tmp/zrzuty-przed/`; po sesji porównanie — każda niezamierzona zmiana poza zakresem = błąd.
- Diff > 400 linii → PR-y piętrowe.
- Nie ruszamy: menu linii (dane i mega menu), hero i sekcji sprzedażowych, katalogu, kreatorów. Nowy pomysł → STAN „Pomysły”.
- Kolejność z bieżącą pracą: poprawki po audytach przed stagingiem (Biznes sesje A/B wg `docs/zadania/prokombiznes.md` §7.2, Instalacje I14b → I-T → I-M) kończymy **przed D1** (D1 robi migrację `SiteSettings`).

## 1. Sesje (v3)

| Sesja | Gdzie | PR-y (piętrowo) | Zakres = kroki szczegółowe | Szac. (wieczory) | Warunek |
|---|---|---|---|---|---|
| **F0** ✅ | fundament | — | pakiet, ADR-022, `MAPA-DZIS.md` (#282) | 0,5 | — |
| **F0b** ✅ | fundament | — | szyna, wyszukiwarka, pasek przewijania w pakiecie (#288) | 0,5 | F0 |
| **D1 — dane i maile** | fundament | **D1-1** dane · **D1-2** maile | kroki **F1** (§2) + kroki **FM** (`maile-linii.md`, 1–11); maile czytają dane kontaktowe z loadera F1 | **1,75** | bieżące rundy linii zakończone |
| **D2 — komponenty i szablony** | fundament | **D2-1a** tokeny, pasek przewijania, pasek marki, nagłówek-kapsuła + `/_wspolne` · **D2-1b** stopka, mapa, telefon, strony prawne (podział 05.11, plan D2) · **D2-2a** silnik wyszukiwania w `lib/shared/search` + `SiteRail` z dodatkami 1, 3, 4 · **D2-2b** `SearchDialog`, paleta poleceń, ostatnio oglądane, skróty Ctrl/⌘K i „/” (podział 06.11) · **D2-3** formularz i moduły · **D2-4** szablony Kontakt/O firmie + `/_wspolne` | kroki **F2** + **F3** (§2) | **4,75** | D1-1 scalone |
| **D3-B / D3-I / D3-S — linia na elementach wspólnych** | folder linii | **PR 1** powłoka, szyna, indeks wyszukiwarki (kroki **L1**) · **PR 2** Kontakt, O firmie, formularze specjalne (kroki **L2**) · ostatnia z trzech linii: **PR 3** QA całości (kroki **F4**) | L1 + L2 (§3), F4 | **B 1,5 · I 2 · S 2** (+0,5 QA w ostatniej) | PR 1: D2-2 scalone · PR 2: D2-4 scalone |
| | | | **Razem do zrobienia (po F0/F0b)** | **≈ 12,25** | |

- **Dlaczego duże sesje:** mniej narzutu (jeden plan, jedne zrzuty „przed”, jeden przegląd na całość), a powiązane rzeczy powstają razem — np. maile od razu korzystają z danych F1 zamiast tymczasowego `findMailContext`, a D2 buduje formularz i szablony obok powłoki, na tych samych tokenach. PR-y zostają małe (≤ 400 linii, piętrowo), więc przegląd i CI działają jak dotąd.
- **Koszt:** pierwsza linia gotowa do produkcji później niż w v2 (cała D3 zawiera też Kontakt i O firmie). **Wyjście awaryjne bez zmiany planu:** PR 1 sesji D3 może zostać scalony, a linia pójść na produkcję ze starym Kontaktem/O firmie oczyszczonym przez PR 1 (bez WhatsAppa, zdjęć ludzi i literałów) — PR 2 dochodzi po produkcji.
- **Kolejność:** D1 → D2 → D3 linii w dowolnej kolejności (każda w swoim folderze; D3 jednej linii może iść równolegle z D2-3/D2-4 w folderze fundamentu, gdy D2-2 jest scalone). Ostatnia D3 kończy QA całości.
- **Boczna szyna i wyszukiwarka (02.11):** komponenty w D2-2, wpięcie i indeks wyszukiwarki linii w D3 PR 1. Dodatki przyjęte 02.11: akcja linii z licznikiem, postęp i „Do góry”, „Na tej stronie”, paleta poleceń, ostatnio oglądane (za flagą do opinii prawnika); status i telefon w szynie — nie.
- **Software:** D3-S PR 2 **zastępuje** budowę Kontaktu i O firmie w SW11a/SW11b (tam zostają `/cennik`, `/audyt`, strony prawne). Jeśli Kontakt z SW11a jest już scalony — przenosi go na szablon, zachowując „Twój projekt”.
- **Biznes:** D3-B PR 1 zastępuje górny pasek i stopkę z ramy K4 oraz dolny pasek M1′; PR 2 zastępuje Kontakt i O firmie z K4i.
- **Instalacje:** D3-I PR 1 zastępuje klasy `topb`/`hdr`/`ftr2` i dolny pasek z I14; PR 2 zastępuje `/kontakt` i `/o-firmie` z I11/I12.
- **Bez cięć:** D1, D2-1, D2-2, D3 PR 1, rdzeń formularza z D2-3 (zgoda + walidacja). Przy braku czasu: QA skrócone do testów treści, D3 PR 2 po produkcji linii.

## 1a. Prompty dużych sesji

### D1 — dane wspólne i maile linii
```
/zadanie D1 — dane wspólne i maile linii (duża sesja: kroki F1 + FM, PR-y D1-1 i D1-2)
Folder fundamentu (bez trwającej sesji linii). Pliki pakietu maili są nieśledzone — commit w D1-2. git fetch; D1-1: gałąź feat/wsp-dane od origin/develop; D1-2: feat/wsp-maile od feat/wsp-dane (piętrowo).
Przeczytaj: ten plik §0, §1, kroki F1 (§2), docs/zadania/maile-linii.md (kroki 1–11), docs/design/wspolne/WSPOLNE-ELEMENTY.md (§2, §4, §5.1, §6.3), docs/design/wspolne/MAILE.md, ADR-022, ADR-024, MAPA-DZIS.md (§9, §10.1).
Najpierw JEDEN plan całości w trybie planowania, podzielony na D1-1 i D1-2, z pytaniami do mnie na końcu — czekaj na akceptację.
D1-1 = kroki F1 (dane, shared w SiteSettings z shared.rail, migracja, seed, hook [SZEF, loader getSharedData).
D1-2 = kroki FM, z jedną zmianą: kontekst maila (telefon, e-mail, firma, NIP, adres, godziny, polityka prywatności) bierze loader getSharedData z D1-1 zamiast osobnego findMailContext; teksty linii (obietnica, kroki) zostają w src/lib/mail/lineCopy.ts.
Po każdym PR: /przeglad → /koniec-sesji (STAN: „W toku: D1, …, następny …”) → /pr. Kolejny wieczór: „/zadanie D1 — kontynuacja wg STAN”.
DoD: DoD kroków F1 i FM; CI zielone dla obu PR-ów.
```

### D2 — komponenty wspólne i szablony stron
```
/zadanie D2 — komponenty wspólne i szablony stron (duża sesja: kroki F2 + F3, PR-y D2-1…D2-4)
Warunek: D1-1 scalone. Folder fundamentu. git fetch; gałęzie piętrowe feat/wsp-powloka (D2-1) → feat/wsp-szyna (D2-2) → feat/wsp-moduly (D2-3) → feat/wsp-szablony (D2-4).
Przeczytaj: ten plik §0, §1, kroki F2 i F3 (§2), spec WSPOLNE-ELEMENTY.md (§3, §5, §5.1, §6.0–§6.2, §7), MAPA-DZIS.md (w tym „Dodatki linii” i §10), plansze Chrome, Footer, Telefon, Mapa, Logo, Moduly, Szyna, Kontakt, OFirmie.
Zrzuty „przed” raz na całą sesję. Najpierw JEDEN plan całości w trybie planowania, podzielony na 4 PR-y, z pytaniami na końcu (m.in. sloty szablonów dla dodatków linii z MAPA-DZIS) — czekaj na akceptację.
D2-1 = F2 kroki 1, 2, 4 (tokeny ról, pasek przewijania z poprawką Chrome 121+, komponenty powłoki, strona Cookies).
D2-2 = F2 krok 3a (SiteRail, SearchDialog, wspólny silnik wyszukiwania, dodatki szyny).
D2-3 = F3 kroki 1–3 (ContactForm, wspólne API zgody/walidacji/sukcesu, FaqBlock, Steps, ServiceAreaMap + zones, moduły O firmie).
D2-4 = F2 krok 3 + F3 kroki 4–5 (szablony ContactPage i AboutPage z miejscami na sekcje linii, podgląd /_wspolne, /_wspolne/kontakt, /_wspolne/o-firmie dla 3 tenantów).
Nic nie wpinaj w ramki linii (to D3).
Po każdym PR: /przeglad → porównanie z planszami → /koniec-sesji (STAN) → /pr. Kolejne wieczory: „/zadanie D2 — kontynuacja wg STAN”.
DoD: DoD kroków F2 i F3 dla odpowiednich PR-ów; axe 0; CI zielone.
```

### D3 — linia na elementach wspólnych (wstaw linię)
```
/zadanie D3-<B|I|S> — <Biznes|Instalacje|Software> na elementach wspólnych (duża sesja: kroki L1 + L2, PR 1 i PR 2)
[wspólny początek z §3]
Warunek: PR 1 — D2-2 scalone; PR 2 — D2-4 scalone. Folder tej linii, gałęzie wg konwencji linii (piętrowo: PR 2 od PR 1).
Najpierw JEDEN plan całości w trybie planowania (oba PR-y, lista dodatków linii na Kontakcie i O firmie z MAPA-DZIS) — czekaj na akceptację.
PR 1 = kroki L1 dla tej linii (powłoka, szyna, indeks wyszukiwarki, dodatki szyny, usunięcie WhatsAppa i literałów).
PR 2 = kroki L2 dla tej linii (Kontakt i O firmie na szablonie + sekcje własne, formularze specjalne pod wspólną zgodą/walidacją/sukcesem, usunięcie starych stron i zdjęć ludzi).
Jeśli to ostatnia z trzech linii: PR 3 = kroki F4 (QA całości) w gałęzi feat/wsp-qa.
Po każdym PR: /przeglad → porównanie z planszami → /koniec-sesji (STAN linii) → /pr. Kolejne wieczory: „/zadanie D3-<X> — kontynuacja wg STAN”.
DoD: DoD kroków L1 i L2 (i F4 w ostatniej); CI zielone.
```

---

## 2. Kroki szczegółowe — fundament (używane przez F0, D1, D2; sesje F1–F4 nie są już osobne)

### F0 — pakiet, ADR-022, mapa „dziś → docelowo” (bez kodu)
```
/zadanie F0 — elementy wspólne linii: pakiet, ADR-022, mapa „dziś → docelowo” (BEZ KODU)

Kontekst: Biznes, Instalacje i Software zbudowały pasek marki, nagłówek, stopkę, formularz, Kontakt i O firmie każda po swojemu. Ujednolicamy to: część wspólna powstaje raz (fundament F0–F3, ten folder), a wpięcie w strony i Kontakt/O firmie z dodatkami każdej linii robią sesje linii L1–L2 w ich folderach. Ta sesja to tylko dokumenty i rozpoznanie — żadnych zmian w src/, seedach ani migracjach.

Gałąź: docs/wsp-pakiet od aktualnego origin/develop.

0. Pliki pakietu są w drzewie jako NIEŚLEDZONE: docs/design/wspolne/WSPOLNE-ELEMENTY.md, docs/design/wspolne/plansze/*.dc.html + README.md, docs/decyzje/ADR-022-elementy-wspolne-linii.md, docs/zadania/wspolne-elementy.md (plan v2: F0–F4 + L1–L2). Sprawdź `git status` (13 plików). Jeśli ADR-y leżą gdzie indziej niż docs/adr/ — przenieś ADR-022 obok ADR-019 i popraw odnośniki.

1. Przeczytaj w całości spec, ADR-022 i plan v2. Przejrzyj plansze (HTML z inline style — kolory, wymiary, teksty; dane w obiektach JS na dole plansz). Zasady treści 01.11 (spec §2) obowiązują od teraz: bez WhatsAppa, bez zdjęć ludzi, dane kontaktowe tylko z panelu, bez obietnic [SZEF], pro-kom.eu bez „sklepu”, nazwa „Tech”, Zakopane tylko na Instalacjach, Gaming tylko jako odnośnik z flagą published.

2. docs/design/wspolne/MAPA-DZIS.md — tabela dla biznes, instalacje, software: element → plik(i) → co robimy → sesja (F1–F4 / L1 / L2). Uwzględnij:
   - pasek marki, nagłówek (wymiar znaku — Instalacje 140 px), stopka, pasek prawny i linki prawne (Polityka, Cookies, Dostępność, Mapa strony — które linie mają),
   - dolny pasek i menu na telefonie,
   - formularze: ogólny + specjalne (lista zapytania Biznesu, kreator i „Twój projekt” Software, Zaplanuj Instalacji) — zgoda, walidacja, sukces, adapter Inquiries,
   - mapa OSM z Software v23, ServiceAreaMap z Biznesu, strefy / wyszukiwarka miejscowości z Instalacji,
   - skąd telefon, e-mail, adres, NIP, godziny (panel czy literał — wypisz literały),
   - wystąpienia „WhatsApp”, „wa.me”, click_whatsapp, „i sklep”, „Serwis” jako nazwy linii, „biznes@pro-kom.eu”, „18 267 65 11”, „example.test”,
   - zdjęcia ludzi i zaślepki portretów (także Software v23),
   - klasy prototypu Instalacji topb / hdr / ftr2,
   - (uzupełnione w F0b 02.11 — wynik w MAPA-DZIS §10) boczna szyna: komponent szyny Biznesu (K4b) — dokładne zachowanie (sekcje, podstrony, przycisk Szukaj, ikony, rozwijanie, animacje, progi szerokości), wspólny `RailShell` (Software), szyna sekcji Instalacji; wyszukiwarki: Biznes (`lib/search.ts`, okno K4b), Software („Znajdź swoje rozwiązanie”), Instalacje (wyszukiwarka Oferty). Opisz, co z tego staje się `SiteRail` / `SearchDialog` (spec §5.1) i co zostaje w linii.
   **Osobna sekcja „Dodatki linii na Kontakcie i O firmie”:** dla każdej linii lista sekcji/elementów, które ma dziś w kodzie albo w zaakceptowanej wizualizacji (Biznes K4/v150, Software v23, Instalacje v4.2), a których NIE ma w szablonie (spec §6.1/§6.2). Przy każdej: proponowany slot szablonu (spec §6.0) albo „do usunięcia” (np. zdjęcia ludzi, WhatsApp). To wejście do F3 (sloty) i L2 (sekcje linii).

3. Sprawdź rzeczywiste nazwy kolekcji i globali (CompanyData / SiteSettings, Tenants, *Settings, Inquiries) i istniejące pola kontaktowe — jeśli różne od spec §4, popraw spec i opisz mapowanie (F1 używa istniejących pól, nie dubluje).

4. public/brand/: czy jest znak PRO-KOM główny z zieloną kreską (prokom-glowna_poziome_*), znaki linii jasne/ciemne, znak TECH. Wynik do MAPA-DZIS.md. Niczego nie dorysowuj.

5. ADR-022 → „przyjęta” (albo z poprawkami — jakie). CLAUDE.md — dopisz:
   „Elementy wspólne linii: docs/design/wspolne/WSPOLNE-ELEMENTY.md (+ plansze/, MAPA-DZIS.md), plan docs/zadania/wspolne-elementy.md (F = fundament, L = sesje linii), ADR-022.
   Komponenty wspólne w src/components/shared (bez Payload, bez importów z src/sites/*), loader w src/lib/shared. Sesje linii nie zmieniają tych folderów ani wspólnych pól/migracji — brak → osobny PR feat/wsp-*.
   Zasady 01.11: bez WhatsAppa, bez zdjęć ludzi, dane kontaktowe tylko z panelu, nazwa „Tech”, przy pro-kom.eu bez sklepu, Gaming tylko jako odnośnik.”
   INDEKS / README docs — odnośniki. docs/STAN.md i docs/stan/STAN-instalacje.md — sekcja „Elementy wspólne” (F0 zrobione, następna F1; etap A: F0–F2 + L1 każdej linii przed produkcją; etap B: F3, L2, F4). W planach linii (Biznes PRZEKAZANIE-K4 / plan §7, Software plan SW, Instalacje plan I) dopisz jedną linijkę, które ich sesje zastępują L1/L2 (plan v2 §1).

6. Pytania do mnie zbierz na końcu planu, zanim cokolwiek zmienisz. Czekaj na akceptację.

Nie ruszaj: src/, seed/, migracji. DoD: tylko dokumenty, CI zielone, /przeglad, /koniec-sesji, PR „docs(wspolne): pakiet, ADR-022, mapa dziś” (squash).
```

### F1 — dane
```
/zadanie F1 — elementy wspólne: dane firmy i linii w panelu
Gałąź feat/wsp-dane. Przeczytaj spec §2, §4, §6.3, MAPA-DZIS.md, ADR-022.
1. CompanyData (mapowanie: MAPA-DZIS §9 — name/nip/email/phones[] istnieją): geo, mapsUrl, ceidgUrl, holidays[], rozszerzenie istniejącego locations[] (= salony: + key, geo, parkingNote, published; name/street/postalCode/city/hours[] już są), lines[] (key, name, kind linia|marka, domain, url, color, colorOnDark, logoLabel, description, descriptionLong, published, order), serviceZones[] (name, towns[], note), legal (ścieżki stron prawnych), consentMode (checkbox|info, domyślnie checkbox). Wartości startowe ze spec §4.1 (Gaming i Zakopane published=false).
2. src/fields/sharedLineFields.ts — grupa `shared` (spec §4.2) w kolekcji SiteSettings (decyzja F0, ADR-022; istniejące phone/phone2/email/footer zostają i są częścią kontaktu linii). Znaczniki „[SZEF” / „[Krystian”: loader ukrywa tekst (decyzja 05.11 — bez hooka, ADR-022 „Rozstrzygnięcia D1-1”). Pól dla sekcji własnych linii NIE dodawaj — to robią sesje L2. Grupa `shared.rail` (spec §5.1): seed sekcji szyny każdej linii z MAPA-DZIS (Biznes = obecna szyna) + test, że każdy anchorId istnieje na stronie głównej tenanta.
3. Migracja (rebase na develop przed migrate:create). Bez usuwania istniejących danych; istniejące pola kontaktowe użyj zamiast dublować — mapowanie w PR.
4. Seed: dla każdego tenanta treści z plansz (Kontakt, OFirmie, Footer, Chrome — obiekty danych w skryptach) z poprawkami spec §6.3 (Biznes: kontakt@prokombiznes.pl, 889 003 889 + 883 200 151, bez 18 267 65 11). Seed aktualizuje istniejącą bazę (zapis przy różnicy). Pola z [SZEF] nieopublikowane.
5. src/lib/shared/getSharedData.ts — jeden loader (CompanyData + shared bieżącej linii + published lines), cache jak inne loadery.
6. Testy: loader per tenant; hook [SZEF; test treści (spec §10 pkt 2) dla seedów.
Nie buduj UI. DoD: lint, typecheck, testy, build, CI; STAN.
```

### F2 — tokeny i komponenty powłoki (bez wpinania)
```
/zadanie F2 — elementy wspólne: tokeny i komponenty powłoki + podgląd (bez wpinania w linie)
Gałąź feat/wsp-powloka (diff > 400 linii → PR-y piętrowe). Spec §3, §5 (LineLogo, OpeningStatus, BrandBar, SiteHeader, SiteFooter, LinesBand, LegalBar, AddressMap, TabBar, MenuSheet), §2.4, §7; plansze Chrome, Footer, Telefon, Mapa, Logo, Moduly (status), Szyna.
1. Tokeny ról (spec §3) w src/styles/tokens.css dla biznes/instalacje/software, jasny i ciemny; test kontrastu jak dla innych tokenów. Pasek przewijania w kolorach linii (spec §3 „Pasek przewijania”, plansza Szyna §6) — globalnie z tokenów, wersja cienka dla okien/arkuszy; uogólnij to, co Software ma z v23.
2. src/components/shared/ — komponenty jak w spec §5, czyste (propsy, bez Payload, bez importów z src/sites/*). SiteHeader ze slotami nav/extras/cta; SiteFooter ze slotem kolumn linii i ozdoby krawędzi; TabBar konfigurowany z shared.tabBar; MenuSheet ze slotem listy linii. OpeningStatus: Europe/Warsaw, testy z zamrożonym czasem (spec §10 pkt 3). AddressMap: uogólnij mapę OSM z Software v23 (warianty light/dark, accent, label, height, radius, „© OpenStreetMap contributors”, link mapsUrl rel=noopener); brak kadru ul. Orkana 16B w obu wariantach → wygeneruj z OSM wg planszy Mapa, SVGO < 60 KB. LinesBand: Gaming wg §2.4. Znaki: skopiuj do public/brand/ `prokom-tech_poziome_kolor.svg` i `_negatyw.svg` z paczki znaku (`PRO-KOM_znak_2026-10/01_wektor/SVG/tech/`, ścieżka w docs/marka.md) oraz `prokom-gaming-znak-ciemne.svg` z repo prokom-gaming (`docs/design/prokomgaming/marka/`) — MAPA-DZIS §8.
3. Strona podglądu /_wspolne (tylko gdy nie produkcja; noindex): wszystkie komponenty powłoki dla 3 tenantów, jasny/ciemny, telefon — do porównania z planszami i do testów e2e komponentów.
3a. SiteRail i SearchDialog wg spec §5.1: zachowanie i wygląd szyny Biznesu jako wzorzec (MAPA-DZIS §10), z decyzjami 02.11: na podstronach sekcje strony głównej zamiast menu globalnego Biznesu, 64 → 248 px z clip-path i opóźnieniami 120/250 ms wg planszy, aktywna sekcja z istniejącego railActive.ts, aria-current="location"; rozbudowa istniejącego RailShell zamiast drugiego komponentu, sekcje z shared.rail, na podstronach linki /#sekcja, przycisk Szukaj na górze (puls raz na sesję), Ctrl/Cmd K i „/”. SearchDialog: powłoka + interfejs dostawcy indeksu (empty(), query(q) → grupy). Ogólną część lib/search.ts Biznesu przenieś do src/lib/shared/search/ — testy Biznesu muszą przejść bez zmian. Wyszukiwarki Biznesu NIE przerabiaj (SiteRail tylko ją otwiera). Dodatki ze spec §5.1 (decyzja 02.11): akcja linii z licznikiem, postęp + „Do góry”, grupa „Na tej stronie” z akordeonem „Strona główna” (atrybut data-rail-section), paleta poleceń (wspólna lista akcji + słownik słów, podpinana też do wyszukiwarki Biznesu), ostatnio oglądane (util localStorage + flaga CompanyData.recentlyViewed, domyślnie off). Wygląd i ruch 1:1 z planszą Szyna (w tym sekcja 1b).
4. Strony prawne: sprawdź Polityka/Cookies/Dostępność/Mapa strony w każdej linii; brakującą Cookies dodaj jako stronę z panelu (szkic „do akceptacji”: tylko niezbędne, statystyki bez ciasteczek).
5. NIE wpinaj w ramki linii (to L1).
DoD: zrzuty /_wspolne vs plansze (1440/390, jasny/ciemny) — rozbieżności w PR; testy jednostkowe i e2e komponentów na /_wspolne (aria-current, tylko published linie, SiteRail: aktywna sekcja, rozwijanie z klawiatury, Ctrl K, SearchDialog z indeksem testowym, LegalBar identyczny dla 3 tenantów, LinesBand 5/6 kafelków wg flagi Gaming, tel: z danych, Menu: fokus/Esc); axe 0; CI; STAN.
```

### F3 — moduły i szablony stron z miejscami na sekcje linii
```
/zadanie F3 — elementy wspólne: formularz, moduły i szablony Kontakt / O firmie z miejscami na sekcje linii
Gałąź feat/wsp-moduly (diff > 400 linii → PR 1 moduły, PR 2 szablony). Spec §5, §6.0–§6.2; plansze Moduly, Kontakt, OFirmie; MAPA-DZIS.md sekcja „Dodatki linii”.
1. ContactForm: kolejność pól, rozpoznawanie telefon/e-mail, podpowiedź strefy, honeypot + istniejący limit, błędy (lista role=alert + pod polem + aria-invalid), sukces z numerem i nextSteps, consentMode z CompanyData; slot `formPrefill` (Software „Twój projekt”). Zapis przez istniejący adapter Inquiries (typ kontakt, tenant, temat).
2. Wspólne API dla formularzy specjalnych linii: ConsentField (zgoda/klauzula wg consentMode), walidacja kontaktu (telefon PL / e-mail), SuccessPanel — do użycia w L2 przez listę zapytania Biznesu, kreator Software, Zaplanuj Instalacji. Samych formularzy specjalnych NIE przerabiaj.
3. FaqBlock (+ JSON-LD FAQPage), Steps (pion/poziom), ServiceAreaMap (wzór K31 + wyszukiwarka Instalacji, dane serviceZones), src/lib/shared/zones.ts z testami (Szaflary→Podhale, Raba Wyżna→Podhale, Limanowa→wg danych), Contours (deterministyczne SVG), CompanyCard, StatsStrip (flaga ukryta na produkcji), RulesBento (flex-wrap), FamilyStrip, VerifyCards.
4. ContactPage i AboutPage wg spec §6.1/§6.2 z miejscami na sekcje linii wg spec §6.0 (nazwane sloty, przełączniki sekcji opcjonalnych, slot formPrefill formularza). Jeśli MAPA-DZIS pokazała dodatek, który nie mieści się w żadnym slocie — zapytaj mnie przed dodaniem nowego slotu, potem uzupełnij §6.0 spec.
5. Podgląd /_wspolne/kontakt i /_wspolne/o-firmie dla 3 tenantów z przykładową sekcją w każdym slocie (ramka „slot: nazwa”). Trasy /kontakt i /o-firmie linii NIE zmieniaj (to L2).
DoD: e2e formularza na /_wspolne (błędy, sukces, rekord w Inquiries, mail w Mailpit); testy zones; zrzuty szablonów vs plansze; axe; CI; STAN.
```

### F4 — QA całości (po wszystkich L2)
```
/zadanie F4 — QA elementów wspólnych na 3 liniach
Gałąź feat/wsp-qa. Spec §9, §10. Warunek: L1 i L2 wszystkich trzech linii scalone.
1. Pełny przebieg e2e 3 tenantów (spec §10 pkt 3), testy treści (§10 pkt 2) na całym repo i seedach, axe na trasach z elementami wspólnymi, Lighthouse mobile /kontakt i /o-firmie ×3, 360/390/414 bez przewijania w bok.
2. Porównanie z planszami (wszystkie), lista rozbieżności — drobne popraw w tym PR (tylko w częściach wspólnych), sprawy linii → STAN danej linii.
3. Spec — sekcja „Stan wdrożenia”; STAN; checklista stagingu (CompanyData, shared każdej linii, flaga Gaming po 20.11, consentMode po decyzji prawnika). /_wspolne zostaje tylko na dev/staging.
DoD: raport w PR, CI zielone.
```

---

## 3. Kroki szczegółowe — linie (używane przez D3)

Każdy prompt D3 zaczyna się tym blokiem („wspólny początek”; „L1/L2” = PR 1/PR 2 sesji D3, „F2/F3” = PR-y D2):
```
Warunek: develop zawiera F2 (dla L1) / F3 (dla L2). Najpierw git fetch i rebase (albo merge) origin/develop do gałęzi bazowej linii; sprawdź, że src/components/shared/ istnieje.
Zasada: NIE zmieniasz src/components/shared/, src/lib/shared/, tokenów ról ani wspólnych pól/migracji. Brakuje czegoś wspólnego → zatrzymaj się i zaproponuj mały PR feat/wsp-<co> do develop.
Przeczytaj: docs/design/wspolne/WSPOLNE-ELEMENTY.md (§1, §2, §5–§7, §11), MAPA-DZIS.md (wiersze tej linii i „Dodatki linii”), plansze z wariantem tej linii, docs/zadania/wspolne-elementy.md §0.
Zrzuty przed: główna, /kontakt, /o-firmie + 2 podstrony linii (1440/390, jasny/ciemny) do tmp/zrzuty-przed/.
```

### L1 — powłoka w ramce linii (wstaw linię)
```
/zadanie L1-<B|I|S> — elementy wspólne: powłoka w ramce linii <Biznes|Instalacje|Software>
[wspólny początek]
1. W ramce (Frame/layout) linii zastąp: górny pasek → BrandBar; nagłówek → SiteHeader ze slotami (menu i mega menu linii bez zmian jako nav; dodatki linii jako extras/cta); stopkę → SiteFooter (kolumny z shared.footerColumns, ozdoba krawędzi, jeśli linia ma); dolny pasek i menu telefonu → TabBar + MenuSheet (konfiguracja z shared.tabBar; zachowaj istniejące zachowania, np. chowanie paska przy kreatorze); boczna szyna → SiteRail na wszystkich stronach linii (sekcje z shared.rail; dodaj brakujące id sekcjom strony głównej, jeśli trzeba — bez zmiany ich wyglądu).
   - Biznes: obecny boczny pasek K4b → SiteRail (wygląd i zachowanie bez regresji — zrzuty przed/po), przycisk Szukaj otwiera istniejącą wyszukiwarkę K4b; lupa i „Zapytanie” z licznikiem jako sloty; dolny pasek Start · Oferta · Zapytanie · Kontakt · Menu (Szukaj = lupa w nagłówku telefonu); kolumna „PRO-KOM w regionie” → LinesBand.
   - Instalacje: klasy topb/hdr/ftr2 → komponenty wspólne (martwy CSS usuń tylko z tych elementów); szyna sekcji → SiteRail; lupa w nagłówku (slot extras) poniżej 1400 px otwiera SearchDialog; indeks SearchDialog: usługi, obiekty, 76 rozwiązań, poradnik, realizacje (gdy są), strony, FAQ — budowany na serwerze z danych panelu (< 50 KB gzip), synonimy z panelu linii; znak 180×36; grzbiet gór jako ozdoba stopki; dolny pasek Start · Usługi · Zaplanuj · Kontakt · Menu („Dla kogo” do Menu).
   - Software: BrandBar z SW0 → wspólny („Darmowy audyt” w slocie paska); szyna v23 → SiteRail (bez realizacji); lupa w nagłówku (slot extras) poniżej 1400 px otwiera SearchDialog; indeks SearchDialog: 29 rozwiązań, obszary, branże, miejscowości, aktualności, strony, FAQ (< 50 KB gzip); „Twój projekt” i „Bezpłatna wycena” jako sloty; stopka „Jedna firma, cztery linie” (5 kart) → LinesBand; dolny pasek Start · Oferta · Kreator · Kontakt · Menu.
1a. Dodatki szyny (spec §5.1): akcja linii (shared.tabBar.center + licznik ze store linii), dane akcji palety (telefon/e-mail/trasa/akcja linii z danych), zapis „ostatnio oglądane” na stronach produktów/rozwiązań/usług/obiektów (za flagą), oznaczenie sekcji długich podstron data-rail-section (Biznes: produkt, salon, GoPOS, InsERT, Opieka IT; Instalacje: usługi, obiekty, Dla architektów — pasek kotwic tylko < 1400 px; Software: rozwiązanie, cennik, audyt, O firmie). Biznes: grupa „Akcje” w istniejącej wyszukiwarce K4b (bez zmiany reszty).
2. Usuń z powłoki i stopki linii: WhatsApp (kafelki, wa.me, ikony, click_whatsapp), literały kontaktowe (dane z loadera), „Serwis” jako nazwę linii, „i sklep” przy pro-kom.eu.
3. Jeśli stare /kontakt lub /o-firmie linii mają WhatsApp, zdjęcia ludzi albo literały kontaktowe — usuń/podmień na dane z loadera już teraz (minimalnie, bez przebudowy — przebudowa w L2).
DoD: zrzuty po vs przed i vs plansze Chrome/Footer/Telefon (wariant linii) i planszą „Szyna”; e2e: SiteRail na głównej i 2 podstronach (/#sekcja, „Na tej stronie” + akordeon), licznik akcji linii po dodaniu, „Do góry” po przewinięciu, akcja „tel” w wyszukiwarce, Ctrl K, wyszukiwanie z literówką, brak wyników → „Zapytaj o”; aria-current, tylko published linie, tel: z danych, LegalBar = tekst wspólny, LinesBand 5/6 wg flagi; ≤1080 px pasek marki ukryty; 0 przewijania w bok 360/390/414 na trasach linii; axe 0; CI; STAN linii.
```

### L2 — Kontakt i O firmie linii (wstaw linię)
```
/zadanie L2-<B|I|S> — Kontakt i O firmie linii <Biznes|Instalacje|Software> na wspólnym szablonie, z sekcjami własnymi
[wspólny początek]
1. /kontakt → ContactPage z danymi shared.contact; /o-firmie → AboutPage z shared.about. Treści linii, które dziś są w kodzie/panelu tych stron, przenieś do pól shared (panel/seed linii — bez zmiany definicji pól wspólnych).
2. Sekcje własne linii (lista z MAPA-DZIS „Dodatki linii”, uzgodniona w F0/F3): zbuduj jako komponenty linii w src/sites/<linia>/… i wstaw w sloty szablonu (spec §6.0). Treść — w ustawieniach tej linii (własne pola i migracja linii, jeśli potrzebne). Wygląd: wizualizacja linii, kolory z tokenów ról.
   - Biznes (przykłady — decyduje MAPA-DZIS): autoryzacje i partnerzy, trasy do Planu Twojej firmy / Opieki IT.
   - Instalacje: drugi salon (Zakopane, tylko gdy locations[].published), odnośnik do /dla-architektow, zgłoszenie awarii.
   - Software: „Twój projekt” (?projekt=1) jako prefill formularza — zachowaj zachowanie z SW11a; sekcje z v23 bez portretów.
3. Formularze specjalne linii (Biznes lista zapytania, Software kreator, Instalacje Zaplanuj): podepnij pod wspólne ConsentField, walidację kontaktu i SuccessPanel z F3 — układ formularzy bez zmian.
4. Usuń stare komponenty Kontaktu/O firmie linii (najpierw sprawdź, czy nic innego ich nie używa) i wszystkie zdjęcia/zaślepki ludzi.
5. JSON-LD LocalBusiness / Organization + BreadcrumbList; unikalne H1/lead z danych linii.
DoD: zrzuty 1440/390 jasny/ciemny vs plansze Kontakt/OFirmie (wariant linii) i wizualizacja linii dla sekcji własnych; e2e formularza (błędy, sukces, rekord w Inquiries z tenantem i tematem) + formularza specjalnego; brak <img> portretów; Lighthouse mobile ≥ 90; axe; CI; STAN linii.
```

## 4. Po stronie panelu (staging/produkcja, ręcznie — Krystian)
- CompanyData: dane firmy, salony (Zakopane `published:false` do danych od szefa), linie (Gaming `published:true` w dniu startu 20.11), strefy, `consentMode` po decyzji prawnika.
- Każda linia: grupa `shared` + pola sekcji własnych — sprawdzić treści, usunąć znaczniki [SZEF] po decyzjach.
