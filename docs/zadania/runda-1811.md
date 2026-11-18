# Runda 18.11.2026 — pomysły szefa: motyw, pasek linii, szyna, koło Biznesu, katalog Instalacji, ALSEN, punkty Tech, Gaming

Przygotowane w czacie projektu 18.11.2026 (wieczór) na podstawie: Asana „💡 Pomysły” (7 zadań szefa z 18.11) + rozmowa Krystiana z szefem 18.11 + decyzje Krystiana z czatu. **Ten plik jest źródłem prawdy dla sesji tej rundy** (zakres, kolejność, prompty). Przy sprzeczności z wcześniejszymi spec. wygrywa ten plik i ADR-028/029.

Dokumenty rundy:
- `docs/design/wspolne/MOTYW-PASEK-LINII.md` — wspólny kontrakt: przycisk motywu, Auto „w nocy ciemny”, wybór między domenami, pasek linii premium, szyna (też dla Tech i Gaming).
- `docs/decyzje/ADR-028-motyw-wspolny-miedzy-liniami.md`, `docs/decyzje/ADR-029-katalog-i-salony-marek-instalacji.md`.
- `docs/tresci/instalacje-katalog-eltrox.md` — katalog Instalacji: struktura, marki, źródła, format danych.
- `seed/partnerzy/alsen.png` — logo ALSEN od Krystiana (przycięte; docelowo wektor SVG z materiałów partnera ALSEN — `TODO(krystian)`).
- Poza tym repo: `prokom-system/docs/zadania/runda-1811-tech.md` (Tech), `prokom-gaming/docs/zadania/runda-1811-gaming.md` (Gaming).

---

## 1. Decyzje (stan 18.11)

| # | Temat | Decyzja | Kto |
|---|---|---|---|
| D1 | Tablice interaktywne | Kategoria „Ekrany i projektory” (`av`) dzielona na **„Tablice interaktywne”**, **„Projektory”** i **„Ekrany informacyjne i wideokonferencje”**; Avtek Framewings (tablice suchościeralne) jako akcesoria tablic; 301 ze starych adresów | szef + Krystian |
| D2 | Meble akustyczne | Nowa kategoria Biznesu (dział „Komputery i biuro”): budki i parawany akustyczne, materiały Vidis (**zgoda Vidis jest**), opisy po swojemu | szef + Krystian |
| D3 | Katalog Instalacji | Instalacje dostają **katalog i salony marek jak Biznes** (ADR-029); dane z **Eltrox** (partner, zgoda na zdjęcia i opisy) + Neomounts/Edbak/Avtek/Beiks; opisy po swojemu (SEO) | Krystian |
| D4 | ALSEN | PRO-KOM = **autoryzowany partner ALSEN** (zgoda jest). Ładna prezentacja na **Tech** i **pro-kom.eu**, na **Biznesie logo ALSEN jako autoryzowany partner wszędzie, gdzie są autoryzacje**; link do `https://www.alsen.pl/`. **Bez** sklepu kopiującego ceny/stany ALSEN | Krystian |
| D5 | Telefony punktów | Każdy punkt (Rabka, Zakopane) ma **swój telefon** (i e-mail — §7); ogólny numer nazwany „Infolinia” (`TODO` szef: nazwa); na stronie punktu tylko jego kontakt, oba punkty razem tylko w Kontakcie | szef |
| D6 | Koło w hero Biznesu | W środku koła **tylko nazwa działu**; całe środkowe koło klikalne → strona działu; ładnie, intuicyjnie, zsynchronizowane z obrotem | szef |
| D7 | Przycisk motywu | Napis **„Ciemny motyw” / „Jasny motyw”** zamiast ikony, animacja premium, wszystkie linie (ADR-028) | szef |
| D8 | Szyna | Przycisk motywu w szynie po lewej **na każdej stronie** (też podstrony pro-kom.eu) | szef |
| D9 | Auto w nocy | Bez wyboru klienta: **noc w Rabce → ciemny** (wschód/zachód, czas warszawski) | szef |
| D10 | Motyw między liniami | Wybór niesiony linkiem z parametrem `?motyw=` (ADR-028 §5) — **da się**, bez ciasteczek | szef (pomysł), Krystian (forma) |
| D11 | Pasek linii | Zostaje w tym samym miejscu, „premium i mega” (spec §4); **Gaming dostaje pasek** | szef |
| D12 | Instalacje — menu | „Serwis” **usunięty z głównej nawigacji** (strona `/serwis` zostaje: „Zgłoś awarię”, stopka, menu telefonu) | szef |
| D13 | Tech — nagłówek | Kapsuła ma być **przyklejona przy przewijaniu** jak na innych liniach (błąd — diagnoza w spec. Tech) | szef |

## 2. Kolejność i podział na sesje

Zasada: najwyżej **dwie sesje piszące kod naraz** (różne foldery). Krystian woli **duże sesje, kilka PR-ów piętrowo**.

| Kolejność | Sesja | Repo / folder | Zakres | PR-y (piętrowo) | Szacunek |
|---|---|---|---|---|---|
| 1 | **WSP-M** | prokom-web / `prokom-web` (fundament) | motyw, Auto w nocy, wybór między domenami, szyna, pasek linii premium | `feat/wsp-motyw` → `feat/wsp-motyw-szyna` → `feat/wsp-pasek-linii` | 2–2,5 wieczoru |
| 1 (równolegle) | **BZ-R1** | prokom-web / `prokom-web-biznes` | koło, tablice/projektory, ALSEN na Biznesie, meble akustyczne | `feat/biznes-kolo-nazwa` → `feat/biznes-tablice-projektory` → `feat/biznes-alsen` → `feat/biznes-meble-akustyczne` | 2–2,5 |
| 2 | **T-R1** | prokom-system (Tech) | przyklejona kapsuła, telefony punktów, przycisk motywu + szyna + Auto + wybór między domenami, pasek linii premium, ALSEN | wg `runda-1811-tech.md` | 1,5–2 |
| 2 | **HUB-R1** | prokom-web / `prokom-web-hub` | ALSEN na pro-kom.eu, Tech z telefonami punktów na hubie, szyna na wszystkich stronach huba (pozycja motywu przychodzi z WSP-M) | `hub/r1-alsen` → `hub/r1-szyna-punkty` | 1 |
| 3 | **INST-K0** | prokom-web / `prokom-instal` (bez kodu aplikacji) | dane katalogu Instalacji z Eltrox i producentów → seed | `inst/k0-katalog-dane` (seed + media) | 2 (dużo pracy danych, mało kodu) |
| 4 | **INST-K1** | prokom-web / `prokom-instal` + mały PR wspólny | silnik katalogu dla 2 linii (ADR-029), import seeda Instalacji, menu „Sprzęt”, usunięcie „Serwis” z menu | `inst/wsp-katalog-linie` (strefa wspólna) → `inst/k1-katalog` → `inst/k1-menu` | 2,5–3 |
| 5 | **INST-K2** | prokom-web / `prokom-instal` | salony marek Instalacji, zestawy, usługa „Transmisje i streaming”, „Sprzęt” w szukajce, SEO | `inst/k2-salony` → `inst/k2-streaming` | 2 |
| 6 | **GM-R1** | prokom-gaming | pasek linii + odbiór parametru motywu | wg `runda-1811-gaming.md` | 0,5–1 |

**Dlaczego tak:** WSP-M idzie pierwsza, bo zmienia komponenty wspólne (`ThemeToggle`, `SiteRail`, `BrandBar`) — linie dostają efekt same, a Tech i Gaming kopiują gotowy, sprawdzony wygląd. BZ-R1 nie dotyka komponentów wspólnych, więc może iść równolegle. INST-K0 to praca na danych — dobrze ją zrobić przed refaktorem tras (INST-K1), żeby od razu testować na prawdziwych kartach.

**Tech: zamrożenie do 29.11** (prokom-system/STAN: „nic z develop nie trafia do master przed 29.11”) — T-R1 idzie do `develop`, produkcja po przełączeniu 29.11 i akceptacji szefa.

**Produkcja każdej linii:** jak zawsze — staging → akceptacja szefa w Asanie → pipeline (CLAUDE.md). Treść paczek na produkcji: `scripts/prod-line-content.sh <linia>` (ADR-027).

---

## 3. Zakres sesji prokom-web

### 3.1. WSP-M — motyw, szyna, pasek linii (folder fundamentu)
Spec: `docs/design/wspolne/MOTYW-PASEK-LINII.md` §1–§4, §6–§7; ADR-028.
- **PR 1 `feat/wsp-motyw`:** `src/lib/brand/theme.ts` (reguła Auto §2.1, skrypt zawsze ustawia `data-theme`, odbiór `?motyw`), `src/lib/shared/daylight.ts` + test (NOAA, tablica 24 wartości generowana skryptem i commitowana jako `daylight.generated.ts` + test zgodności z funkcją), `src/components/ThemeToggle.tsx` (napis akcji, obie etykiety w HTML, `aria-live`), `useTheme`/`useThemeChoice` (Auto z nową regułą, ponowne sprawdzenie przy `visibilitychange`), `lib/motion/themeReveal.ts` (koło dla wszystkich `DARK_THEME_LINES`, czas 600 ms, ruch ikony i napisu), `MenuSheet` (podpis „Motyw strony” + opis Auto), wyspa `ThemeCarry` (dopisywanie `motyw` do linków naszych domen w chwili kliknięcia, czyszczenie adresu po hydratacji), aktualizacja `theme-color`. Zmiana D-K4-5 → wpis w ADR-017 „Zmiany po K4” z odnośnikiem do ADR-028.
- **PR 2 `feat/wsp-motyw-szyna`:** pozycja motywu w `SiteRail` (zwinięta/rozwinięta, przełącznik Jasny · Ciemny · Auto), testy e2e szyny wszystkich linii.
- **PR 3 `feat/wsp-pasek-linii`:** `BrandBar` premium (pigułka za kursorem i fokusem, żywa kreska, dymek z opisem, wejście raz na sesję), pole `tagline` w `CompanyData.lines[]` (migracja dodająca, seed: krótkie opisy linii z danych huba — bez nowych obietnic), test kontrastu, budżet JS.
- **Poza zakresem:** Gaming i Tech (osobne repo), treści stron, zmiany kolorów linii.

### 3.2. BZ-R1 — Biznes (folder `prokom-web-biznes`)
- **PR 1 `feat/biznes-kolo-nazwa` — koło w hero (D6)** (`src/sites/biznes/blocks/BzHero/DepartmentWheel.tsx`, style `bzw-*` w `src/sites/biznes/style/biznes.css`):
  - Środek koła (`.bzw-core`) pokazuje **tylko nazwę działu** (`current.label`, duża, wyważona `nameSize`). Usunąć: „Dział N z 5”, listę 3 produktów (`.bzw-names`), przycisk „Zobacz dział”.
  - **Całe środkowe koło = link** (`<Link href={current.href}>`) do strony działu, z `aria-label="Przejdź do działu: {nazwa}"`; tabpanel zostaje kontenerem (`role="tabpanel"` na otoczce, link w środku).
  - Premium i intuicyjnie: kursor `pointer`, przy wskazaniu lekkie powiększenie rdzenia (`scale(1.03)`, 220 ms), rozjaśnienie pierścienia postępu i poświata w kolorze działu, mała strzałka pojawiająca się **pod nazwą tylko przy wskazaniu/fokusie** (bez stałego tekstu — w spoczynku w środku jest tylko nazwa). Na dotyku: stan wciśnięcia `scale(.97)`.
  - **Synchronizacja:** zmiana nazwy w środku dokładnie w chwili, gdy łuk dojeżdża do działu (to samo `state.run`, przenikanie nazwy 280 ms z lekkim rozmyciem → ostrość); kliknięcie w dział na kole albo w bańkę nie rusza już nazwy osobno (jedno źródło stanu, jak dziś). Pierścień postępu 6,5 s zostaje.
  - Klawiatura: strzałki dalej wybierają dział (zakładki), Tab przechodzi na link środka; czytnik ekranu: zmiana działu ogłaszana jak dziś tylko po wyborze człowieka.
  - Linki do 3 produktów znikają ze środka — bańki produktów zostają linkami dla myszy; nic więcej nie dodajemy. Zrzuty 1440 jasny/ciemny + telefon (na telefonie koło ma swój układ — sprawdzić, że rdzeń też jest tylko nazwą i linkiem).
- **PR 2 `feat/biznes-tablice-projektory` — D1:**
  - Kategoria `av` („Ekrany i projektory”, adres `/oferta/ekrany-projektory/...`) → trzy kategorie: **„Tablice interaktywne”** (`/oferta/tablice-interaktywne`, podkategorie: „Monitory interaktywne”, „Tablice suchościeralne i akcesoria”), **„Projektory”** (`/oferta/projektory`), **„Ekrany informacyjne i wideokonferencje”** (`/oferta/ekrany-informacyjne`, podkategorie: „Ekrany informacyjne”, „Wideokonferencje”). Przypisanie istniejących kart wg dzisiejszych podkategorii.
  - W H1 i opisie kategorii tablic obie frazy: „Tablice interaktywne i monitory interaktywne dla szkół i firm” (SEO — szkoły i gminy szukają „tablicy interaktywnej”).
  - **Projektory mają dziś 3 karty** — za mało na osobną kategorię. W tej samej sesji dołożyć aktualne projektory marek, które już mamy (Sharp/NEC — tylko aktualne modele, dane ze strony producenta, bez cen) do min. 6 kart; brak danych → `TODO(krystian)` i kategoria zostaje z tym, co jest.
  - Avtek Framewings (`https://www.vidis.pl/produkty/uchwyty/scienny-system-montazowy-avtek-framewings-75,1mv156`, zgoda Vidis) — karta w „Tablice suchościeralne i akcesoria”; opis po swojemu, parametry od producenta/Vidis, zdjęcia z Vidis ze źródłem.
  - **301:** `/oferta/ekrany-projektory` → `/oferta/tablice-interaktywne`; `/oferta/ekrany-projektory/monitory-interaktywne` → `/oferta/tablice-interaktywne`; `/projektory` → `/oferta/projektory`; `/ekrany-informacyjne` i `/wideokonferencje` → `/oferta/ekrany-informacyjne` (+ podkategoria). Kolekcja `Redirects` (jak K4), seed idempotentny, e2e 301.
  - Mega menu, koło w hero (dział „Komputery i biuro” — przykłady), Plan Twojej firmy (sala konferencyjna, szkoła), wyszukiwarka (synonimy: „tablica multimedialna”, „monitor dotykowy”, „ekran interaktywny”) — przepiąć na nowe kategorie.
  - Dane: zmiana w `seed/prokombiznes/k4/slowniki-k4.json` + `katalog-k4.json` (pola `kategoria`/podkategoria) **albo** osobna łatka `seed/prokombiznes/runda-1811/` — wg tego, jak dziś import obsługuje zmiany (sprawdzić `pnpm seed:biznes`; zasada: idempotentnie, pola paczki wygrywają).
- **PR 3 `feat/biznes-alsen` — D4 (Biznes):**
  - Rekord w `partners` (wspólna kolekcja): „ALSEN”, `slug: alsen`, `website: https://www.alsen.pl/`, `partnerStatus: authorized-partner`, `tenants`: Biznes, pro-kom.eu (i Tech nie dotyczy — inne repo), `brandPage.hasPage: false` (ALSEN to sieć, nie marka produktów — bez strony `/marki/alsen` i bez salonu), logo z `seed/partnerzy/alsen.png` (w panelu docelowo SVG).
  - Wyświetlanie: **wszędzie, gdzie Biznes pokazuje autoryzacje** (sprawdzić `getPartners`/`getPartnerStatuses` w `src/lib/partners/data.ts` i komponenty z autoryzacjami: bloki `BzFacts` i `BzOffer`, odznaki w stopce, `/o-firmie`, `/kontakt`, sekcja autoryzacji na `/marki`, `llms.txt` Biznesu) — logo + „Autoryzowany partner”. Na `/marki` ALSEN w osobnym rzędzie „Sieci partnerskie” (nie między markami produktów), logo prowadzi do alsen.pl (`rel="noopener"`, nowa karta).
  - **K4-FINAL §1** (lista dozwolonych statusów) — dopisać ALSEN „Autoryzowany partner” z datą decyzji 18.11.2026 (Krystian) w `docs/design/prokombiznes/K4-FINAL.md` i w `CLAUDE.md` (sekcja prokombiznes.pl, zdanie o statusach).
  - Fakt „4 autoryzacje” na stronie (BzFacts, hub) — liczba ma wynikać z danych (`partners` ze statusem), nie z tekstu; jeśli gdzieś jest wpisana na sztywno — poprawić na liczoną albo `TODO(krystian)` (ALSEN to autoryzacja innego rodzaju niż producent — Krystian decyduje, czy liczy się do „autoryzacji”).
- **PR 4 `feat/biznes-meble-akustyczne` — D2:**
  - Nowa kategoria „Meble akustyczne” (dział „Komputery i biuro”, adres `/oferta/meble-akustyczne`, podkategorie „Budki akustyczne”, „Parawany akustyczne”).
  - Dane: z kategorii Vidis wskazanych przez szefa (`docs/tresci/instalacje-katalog-eltrox.md` §4 pkt 4) — **pobieranie stron w tej sesji tylko po zgodzie Krystiana**; 6–12 kart (rodziny, nie każdy kolor osobno), opisy po swojemu w formacie K4 (3 akapity, 10–14 parametrów, ≥ 3 FAQ, `zrodla`), zdjęcia z Vidis (zgoda) w obróbce K4 (przezroczyste tło jeśli się da; meble mają często zdjęcia aranżacyjne — wtedy `zdjecia_premium` jako aranżacje, bez wycinania). Producent/marka mebli — z karty Vidis; brak → `TODO(krystian)`.
  - Plan Twojej firmy: punkt „Budka akustyczna” w scenie biura / sali konferencyjnej (jeśli scena ma miejsce), mega menu, wyszukiwarka („budka do rozmów”, „phone booth”, „ścianka akustyczna”).
- **Poza zakresem:** Instalacje, hub, sklep z cenami.

### 3.3. HUB-R1 — pro-kom.eu (folder `prokom-web-hub`)
- **PR 1 `hub/r1-alsen`:** ALSEN (rekord z BZ-R1 PR 3 — jeśli BZ-R1 jeszcze nie scalone, ten PR czeka albo dodaje rekord w seedzie huba tym samym kluczem `slug: alsen`, bez duplikatu) w sekcji „Marki” na głównej (autoryzacje — fakt widoczny), na `/o-firmie` krótka sekcja **„Autoryzowany partner ALSEN”**: 2–3 zdania (co to znaczy dla klienta: sieć ponad 350 sklepów komputerowych w Polsce związana z dystrybutorem AB — `TODO(krystian)`: potwierdzić liczbę na stronie ALSEN w dniu publikacji; salon w Rabce-Zdroju jako punkt partnerski — `TODO(krystian)`: czy punkt ALSEN = salon ul. Orkana 16B), logo, link do alsen.pl. Na `/kontakt` pod kartą salonu drobna linia „Punkt partnerski ALSEN” (jeśli Krystian potwierdzi adres). Przekierowanie ze starej strony „partnerstwa Alsen/Komputronik → `/o-firmie`” (`src/seed/prokom/redirects.ts`) — sprawdzić, że ląduje na sekcji (kotwica `#alsen`).
- **PR 2 `hub/r1-szyna-punkty`:**
  - Szyna na **wszystkich stronach huba** (dziś tylko `/`): wzorem linii (podstrony: zwinięta „Strona główna”, „Na tej stronie” od 3 sekcji, motyw z WSP-M, „Do góry”). Zmiana decyzji H1-2 → wpis w ADR-H001 „Zmiany”.
  - **Telefony punktów Tech na hubie (zadanie szefa „w TECH brakuje telefonów”, przypięte pod pro-kom.eu):** wszędzie, gdzie hub pokazuje kontakt Tech (wiersz Tech w Kontakcie na głównej i na `/kontakt`, panel Tech w „Wszystkie linie”, mega menu), pokazujemy **„Rabka-Zdrój 18 541 20 55 · Zakopane 18 541 20 15 · Infolinia 883 200 151”** (numery z `HubSettings.extraPhones`/`branch` i `CompanyData.lines` — bez wpisywania w kod; nazwa „Infolinia” `TODO` szef). Zrzut z zadania Asany nie był dostępny z czatu — **Krystian potwierdza na początku sesji, który ekran pokazywał szef**, i od niego zaczynamy.
- **Poza zakresem:** zmiany stron Tech (prokom-system).

### 3.4. INST-K0, INST-K1, INST-K2 — katalog Instalacji (folder `prokom-instal`)
Plan treści: `docs/tresci/instalacje-katalog-eltrox.md`; decyzja: ADR-029. Rytuał Instalacji (`/inst-start`, `/inst-koniec`, STAN-instalacje) bez zmian.
- **INST-K0 — dane (bez kodu aplikacji):** lista kandydatów (marki z §0, kategorie z §2), zaznaczenie przez Krystiana, pobranie danych (plik partnera Eltrox → strony eltrox.pl za zgodą → producenci), opisy po swojemu, zdjęcia w obróbce K4, seed `seed/prokominstalacje/katalog/`, przegląd xlsx (poza repo). Odbiór: §6 planu treści. Jeden PR `inst/k0-katalog-dane` (seed + media; duże pliki — jak w K3: podział na kilka commitów, każdy < 30 MB).
- **INST-K1 — silnik dla 2 linii + import + menu:**
  - `inst/wsp-katalog-linie` (strefa wspólna, osobny mały PR — ADR-I001 §3): `requireLine` z listą linii, teksty katalogu z ustawień linii (migracja dodająca, wartości Biznesu 1:1), arkusz stylów katalogu wspólny dla Biznesu i Instalacji, kategoria zapytań „Instalacje · Sprzęt”. **Warunek:** Biznes bez zmian wizualnych (zrzuty `/oferta`, kategoria, produkt, `/marki`, `/zapytanie` przed/po) i zielone e2e Biznesu.
  - `inst/k1-katalog`: import `seed/prokominstalacje/katalog/` (`pnpm seed:instalacje-katalog`, idempotentny, wzór `seed:biznes`), trasy `/oferta`, kategorie, `/produkt`, `/zapytanie` na domenie Instalacji, wyszukiwarka Instalacji z kartami katalogu, sitemap, JSON-LD `Product` bez `offers` (jak Biznes).
  - `inst/k1-menu`: **„Serwis” usunięty z `header`** w `src/sites/instalacje/dane/nawigacja.ts` (D12; `/serwis` zostaje w topBar „Zgłoś awarię”, stopce i arkuszu menu), nowa pozycja **„Sprzęt”** → `/oferta` (z mega menu działów katalogu), tekst „Pełna oferta / Zobacz pełną ofertę” przy `/uslugi` → „Wszystkie usługi”.
- **INST-K2 — salony, zestawy, streaming:** `/marki` i salony 2.0 dla marek Instalacji (Dahua, Hikvision, BCS, Ubiquiti, Satel, Ajax, Neomounts, Edbak, Avtek — wg listy zatwierdzonej w K0; zasada ADR-029 pkt 6: osobny tekst marki na każdej domenie), gotowe zestawy Instalacji, **usługa „Transmisje i streaming”** (msze, sesje rady gminy, wydarzenia) jako nowe rozwiązanie/strona usługi Instalacji powiązana z Nagłośnieniem i stroną „Kościół” (`InstServices`/`InstSolutions` wg ADR-I002), linki usług → kategorie katalogu („Zobacz sprzęt”), SEO (`docs/strony/prokominstalacje-SEO.md`).

---

## 4. Prompty dla Claude Code (wklej po `/zadanie` albo `/inst-start`)

### 4.1. WSP-M (folder `prokom-web`)
```
/zadanie WSP-M — runda 18.11: motyw wspólny, szyna, pasek linii.
Przeczytaj: docs/zadania/runda-1811.md (§1, §3.1), docs/design/wspolne/MOTYW-PASEK-LINII.md (całość), docs/decyzje/ADR-028-motyw-wspolny-miedzy-liniami.md, ADR-022, ADR-023, ADR-013, ADR-017 (D-K4-5).
Zrób trzy PR-y piętrowo od origin/develop: feat/wsp-motyw → feat/wsp-motyw-szyna → feat/wsp-pasek-linii, wg §3.1.
Najpierw testy (Vitest) dla: sunTimes (4 daty referencyjne ze źródłem w komentarzu testu), reguły Auto (tablica przypadków §2.1), dopisywania i czyszczenia parametru motyw (tylko nasze domeny). Przed użyciem window.history.replaceState z routerem App Router sprawdź w node_modules/next/dist/docs/, jak zainstalowana wersja synchronizuje natywne History API — jeśli dokumentacja milczy, powiedz mi przed implementacją.
ADR-028 ustaw na „przyjęta” w PR 1 i dopisz w ADR-017 zmianę D-K4-5.
Sprawdź na żywo: biznes.localhost, instalacje.localhost, software.localhost, prokom.localhost — 1440 i 360, jasny/ciemny, page.clock 22:00 i 12:00, przejście linkiem z paska linii między hostami (parametr w żądaniu, czysty pasek adresu po wczytaniu), reduced-motion.
Budżet JS linii nie może urosnąć o więcej niż ~2 kB gz na PR. /przeglad przed każdym /pr. Pytaj tylko o decyzje, których plik nie rozstrzyga.
```

### 4.2. BZ-R1 (folder `prokom-web-biznes`)
```
/zadanie BZ-R1 — runda 18.11, Biznes: koło w hero, tablice interaktywne i projektory, ALSEN, meble akustyczne.
Przeczytaj: docs/zadania/runda-1811.md (§1 D1, D2, D4, D6; §3.2), docs/tresci/instalacje-katalog-eltrox.md §1 i §4 pkt 4, K4-FINAL.md §1, ADR-017, ADR-026, docs/zadania/prokombiznes.md §7 (stan kolejki).
Cztery PR-y piętrowo od origin/develop: feat/biznes-kolo-nazwa → feat/biznes-tablice-projektory → feat/biznes-alsen → feat/biznes-meble-akustyczne, dokładnie wg §3.2.
Koło: w środku tylko nazwa działu, całe środkowe koło to link do działu, strzałka tylko przy wskazaniu/fokusie, zmiana nazwy zsynchronizowana z łukiem (to samo state.run). Zrzuty 1440 jasny/ciemny i telefon przed/po w opisie PR.
Tablice/projektory: 301 dla wszystkich starych adresów kategorii av (e2e), przepięcie mega menu, koła, Planu firmy i synonimów wyszukiwarki. Projektory poniżej 6 kart — dołóż aktualne modele Sharp/NEC ze strony producenta albo zostaw TODO(krystian).
Pobieranie stron Vidis (Framewings, meble akustyczne) — zapytaj mnie o zgodę w tej sesji, zanim pobierzesz; opisy po swojemu (żadnych zdań 1:1), zdjęcia z Vidis ze źródłem w zrodla (zgoda Vidis jest).
ALSEN: rekord w partners (hasPage false, autoryzowany partner, tenants Biznes + pro-kom.eu), logo z seed/partnerzy/alsen.png, wszędzie gdzie Biznes pokazuje autoryzacje, osobny rząd „Sieci partnerskie” na /marki; dopisz ALSEN do K4-FINAL §1 i CLAUDE.md.
Zero cen, tylko Rabka (K4-FINAL). /przeglad przed /pr.
```

### 4.3. HUB-R1 (folder `prokom-web-hub`)
```
/zadanie HUB-R1 — runda 18.11, pro-kom.eu: ALSEN, szyna na wszystkich stronach, telefony punktów Tech.
Przeczytaj: docs/zadania/runda-1811.md (§1 D4, D5, D8; §3.3), ADR-H001, ADR-H002, docs/STAN.md → „pro-kom.eu (hub)” (H18: numery stacjonarne i Zakopane), MOTYW-PASEK-LINII.md §6.
Najpierw zapytaj mnie, który ekran huba pokazywał szef w zadaniu „w TECH brakuje telefonów” (zrzut nie był dostępny z czatu).
Dwa PR-y piętrowo od origin/develop: hub/r1-alsen → hub/r1-szyna-punkty, wg §3.3. Jeśli rekord ALSEN z BZ-R1 nie jest jeszcze w develop — użyj tego samego slug: alsen w seedzie huba (bez duplikatu po scaleniu).
Numery tylko z danych (HubSettings, CompanyData), żadnych literałów w komponentach. Nazwa „Infolinia” jako stała z TODO(krystian) do decyzji szefa.
Teksty o ALSEN: fakty z TODO(krystian) do potwierdzenia (liczba sklepów, punkt w Rabce). /przeglad przed /pr.
```

### 4.4. INST-K0 (folder `prokom-instal`, sesja danych)
```
/inst-start, potem: sesja INST-K0 — dane katalogu Instalacji (bez kodu aplikacji).
Przeczytaj: docs/tresci/instalacje-katalog-eltrox.md (całość), docs/decyzje/ADR-029-katalog-i-salony-marek-instalacji.md, seed/prokombiznes/k4/katalog-k4.json (format kart — wzorzec), seed/prokombiznes/k4/salony-k4.json, slowniki-k4.json.
Kroki: (1) zapytaj mnie, czy mam już plik produktów od Eltrox (XML/CSV) — jeśli tak, podam ścieżkę; (2) jeśli nie: przygotuj listę kategorii eltrox.pl do przejrzenia dla marek Dahua, Hikvision, BCS, Ubiquiti, Satel, Ajax (+ inne, które potwierdzę), zapytaj o zgodę na pobieranie stron w tej sesji, pobieraj spokojnie (≥ 2 s między żądaniami), tylko pola z §1 pkt 2; (3) arkusz kandydatów tmp/instalacje-k0/kandydaci.xlsx do mojego zaznaczenia (top 5–8 na podkategorię i markę + to, co montujemy); (4) po moim zaznaczeniu: karty w formacie K4 (opisy po swojemu, parametry sprawdzone u producenta z linkiem i datą, ≥ 3 FAQ, warianty w konfiguratorze), zdjęcia w obróbce K4, salony 2.0 marek, 10–12 zestawów, Neomounts/Edbak/Avtek/Beiks wg §4.
Wynik: seed/prokominstalacje/katalog/ (+ media), przegląd xlsx tylko w tmp/. Zero cen, zero stanów, żadnych zdań 1:1 z eltrox.pl (sprawdź automatycznie: najdłuższy wspólny fragment < 12 słów). Jeden PR inst/k0-katalog-dane, commity < 30 MB.
Na końcu /inst-koniec z listą kart do sprawdzenia i decyzji.
```

### 4.5. INST-K1 (folder `prokom-instal`)
```
/inst-start, potem: sesja INST-K1 — silnik katalogu dla dwóch linii, import katalogu Instalacji, menu.
Przeczytaj: ADR-029 (całość — ustaw na „przyjęta”), docs/zadania/runda-1811.md §3.4, ADR-I001 §3 (strefa wspólna), ADR-012, ADR-017, ADR-023, ADR-003, docs/tresci/instalacje-katalog-eltrox.md §5.
Trzy PR-y: inst/wsp-katalog-linie (strefa wspólna, mały, osobno) → inst/k1-katalog → inst/k1-menu.
Warunek bezpieczeństwa: Biznes bez zmian wizualnych — zrób zrzuty /oferta, kategorii, produktu, /marki, /zapytanie Biznesu przed zmianą i porównaj po; e2e katalogu Biznesu zielone.
Teksty katalogu z ustawień linii (migracja dodająca), style katalogu we wspólnym arkuszu dołączanym przez obie linie, requireLine z listą linii, kategoria zapytań „Instalacje · Sprzęt”.
Menu Instalacji: usuń „Serwis” z header (strona zostaje), dodaj „Sprzęt” → /oferta, „Pełna oferta” przy /uslugi → „Wszystkie usługi”. Telefon jak aplikacja (MOBILE-APLIKACJA.md Instalacji) w tej samej sesji. /przeglad przed /pr.
```

### 4.6. INST-K2 (folder `prokom-instal`)
```
/inst-start, potem: sesja INST-K2 — salony marek Instalacji, zestawy, usługa „Transmisje i streaming”.
Przeczytaj: docs/zadania/runda-1811.md §3.4 (INST-K2), ADR-029 pkt 6 (osobny tekst marki na każdej domenie), ADR-I002, salony z seed/prokominstalacje/katalog/salony-inst.json, docs/strony/prokominstalacje-SEO.md.
Dwa PR-y: inst/k2-salony → inst/k2-streaming. Streaming: nowa usługa/rozwiązanie (msze, sesje rady gminy, wydarzenia) powiązana z Nagłośnieniem i stroną „Kościół”, sprzęt z kategorii streaming; bez cen; teksty bez obietnic spoza spec. Instalacji (§2). Linki usług → „Zobacz sprzęt” w katalogu. /przeglad przed /pr.
```

Prompty T-R1 i GM-R1 są w swoich repo (`runda-1811-tech.md`, `runda-1811-gaming.md`).

---

## 5. Instrukcja dla Krystiana (krok po kroku)

1. **Scal PR-y z dokumentami** tej rundy: prokom-web `docs/runda-1811` i prokom-gaming `docs/runda-1811` (same dokumenty; commity z czatu są niepodpisane Twoim kluczem → scalanie przez squash). Tech: pliki są już w Twoim folderze `D:\PRO-KOM\repos\prokom-system\docs\` (nieśledzone) i kopia w `D:\PRO-KOM\notatki\do-repo\runda-1811\` — sesja T-R1 zaczyna od commitu tych plików.
2. **Wieczór 1 (dwie sesje naraz):** WSP-M w `prokom-web` + BZ-R1 w `prokom-web-biznes`. Po każdym PR-ze sprawdź listę „Sprawdź” (§6).
3. **Wieczór 2–3:** dokończenie WSP-M/BZ-R1 → T-R1 (Tech, do `develop`) + HUB-R1.
4. **Przed INST-K0:** wyślij wiadomość do Eltrox (§8) — plik produktów oszczędzi pół sesji. Przygotuj listę marek, które naprawdę montujemy (do odhaczenia w arkuszu).
5. **INST-K0 → INST-K1 → INST-K2** po kolei w `prokom-instal` (dane → silnik → salony).
6. **GM-R1** w dowolny wolny wieczór (mała sesja).
7. Każda linia: staging → szef akceptuje w Asanie → produkcja (Tech dopiero po 29.11).

## 6. „Sprawdź” po sesjach (Ty, na stagingu albo lokalnie)
- **WSP-M:** przycisk mówi „Ciemny motyw”/„Jasny motyw” na 4 liniach; koło przy zmianie na Biznesie i hubie; o 22:00 bez wyboru strona ciemna, o 12:00 jasna (Biznes, Instalacje); zmiana motywu na Biznesie → klik w „Software” w pasku linii → Software w tym samym motywie, w pasku adresu bez `?motyw`; szyna ma motyw na stronie głównej i podstronie; pasek linii: pigułka za kursorem, dymek z opisem; telefon 360 px bez przewijania w bok.
- **BZ-R1:** w środku koła tylko nazwa, klik w środek → dział; stare adresy ekranów/projektorów przekierowują; ALSEN widoczny przy autoryzacjach i na `/marki`; meble akustyczne w ofercie i wyszukiwarce.
- **HUB-R1:** szyna na podstronach huba; ALSEN na `/o-firmie` i w Markach; numery punktów Tech tam, gdzie wskazał szef.
- **INST-K1/K2:** Biznes wygląda jak przed; na Instalacjach „Sprzęt” w menu, „Serwis” zniknął z menu (ale „Zgłoś awarię” działa); karta produktu bez ceny; zapytanie dochodzi na skrzynkę Instalacji.
- **T-R1:** kapsuła Tech zostaje u góry przy przewijaniu; strona Rabki pokazuje tylko kontakt Rabki, Zakopanego — tylko Zakopanego.

## 7. Do decyzji (szef / Krystian) — przed albo w trakcie sesji
1. **[SZEF] Nazwa ogólnego numeru Tech:** „Infolinia” (rekomendacja) / „Numer ogólny” / „Centrala”.
2. **[SZEF] Numer Rabki dla Tech:** 18 541 20 55 jako numer punktu Rabka (na hubie już jest jako „serwis PRO-KOM Tech Rabka”) — potwierdzić.
3. **[SZEF] E-maile punktów:** `rabka@prokomserwis.pl` i `zakopane@prokomserwis.pl` — aliasy do `kontakt@` (rekomendacja, zasada 31.10) czy **prawdziwa skrzynka Zakopanego** (jeśli ktoś w Zakopanem sam odpisuje)?
4. **[SZEF/Krystian] Gaming bez jasnego motywu** (rekomendacja: tak — jasny Gaming to nowy projekt całej strony, kilka wieczorów, bez wpływu na sprzedaż).
5. **[Krystian] ALSEN:** czy salon ul. Orkana 16B = punkt partnerski ALSEN (adres na stronie); czy ALSEN liczy się do „autoryzacji” w liczbach na stronie; wektorowe logo SVG od ALSEN.
6. **[SZEF] KSC:** Hikvision/Dahua w katalogu Instalacji — informacyjnie OK, ale w ofertach dla gmin bez rekomendacji tych marek?
7. **[SZEF] Nazwa linii „Tech” vs domena prokomserwis.pl** (zadanie szefa „prokomserwis ???” z 18.11) — **poza tą rundą**: rekomendacja z czatu 18.11 to powrót do nazwy „PRO-KOM Serwis” przed szyldami i oklejeniem aut; do czasu decyzji zostaje „Tech” (zasada 01.11).
8. **[Krystian] Marki Instalacji:** pełna lista marek, które montujemy (do zaznaczenia w INST-K0), w tym domofony, kontrola dostępu, przesył AV, streaming (Beiks — które marki?).

## 8. Wiadomość do opiekuna Eltrox (do wysłania przez Krystiana)
```
Dzień dobry,
jako partner Eltrox przygotowujemy katalog sprzętu (monitoring, alarmy, kontrola dostępu) na naszej stronie prokominstalacje.pl — bez cen, z odesłaniem do zapytania.
Czy możemy dostać plik z ofertą dla partnerów (XML albo CSV — np. w schemacie Ceneo/IOF) z nazwami, kodami producenta, EAN, parametrami i adresami zdjęć? Jeśli jest dostępny w panelu partnera, proszę o wskazanie, gdzie go znaleźć.
Pozdrawiam,
Krystian Potaczek, PRO-KOM Rabka-Zdrój
```
