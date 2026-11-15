# Plan budowy prokombiznes.pl — paczka 05–06.11.2026

Nowe podstrony Zaopatrzenia, poprawiona strona główna, elementy wspólne w wersji Biznes, poprawki po audycie podstron i dokończenie zestawów.

Ścieżka w repo: `docs/zadania/prokombiznes-0611.md`. Ten plik jest **planem i źródłem prawdy** dla wszystkich sesji z tej paczki. Prace idą w **czterech sesjach** (krótka F i trzy duże: BIZ-1, BIZ-2, BIZ-3 — §4), każda przez kilka wieczorów z ciągłością w `docs/STAN.md`. Sekcje §5–§11 opisują zakres PR-ów; nazwy B1…B5 i D3-B to grupy PR-ów wewnątrz dużych sesji.

---

## 0. Jak czytać ten plan

| § | Co | Dla kogo |
|---|---|---|
| 1 | Decyzje Krystiana 05–06.11 — **ostateczne, nie pytasz drugi raz** | każda sesja |
| 2 | Stan wyjściowy repo i co już jest zbudowane (nie budujemy drugi raz) | każda sesja |
| 3 | Pliki paczki — co trafia do repo i gdzie | BIZ-1, PR 0 |
| 4 | Cztery duże sesje: zakres, PR-y, kolejność, ograniczenia | Krystian, każda sesja |
| 5–11 | Szczegółowy zakres każdego PR-a: pliki, dane, testy, odbiór | sesja, która go robi |
| 12 | Wspólne zasady i Definition of Done tej paczki | każda sesja |
| 13 | Otwarte decyzje (flagi w panelu, nie zgadujemy) | Krystian, szef |
| 14 | Prompty do wklejenia (jeden na dużą sesję) | Krystian |

Źródła szczegółów (w repo po PR 0 sesji BIZ-1, §3):
- `docs/design/prokombiznes/0611/ZAOPATRZENIE.md` — specyfikacja dwóch nowych podstron i sekcji na głównej (§0–§11);
- `docs/design/prokombiznes/0611/AUDYT-GLOWNA-0611.md` — audyt strony głównej;
- `docs/design/prokombiznes/0611/AUDYT-PODSTRONY-0611.md` — audyt 121 podstron;
- `docs/design/prokombiznes/0611/ELEMENTY-WSPOLNE-BIZNES.md` — elementy wspólne w wersji Biznes;
- prototypy (cel wizualny 1:1):
  - `0611/prototyp-zaopatrzenie.html` — 3 widoki: AGD, IT, Wpis na głównej;
  - `0611/prototyp-glowna.html` — strona główna, O firmie, Kontakt, kapsuła, mega menu, szyna, Ctrl K, stopka.

Gdy ten plan i starszy dokument (K4-FINAL, K36, MOBILE-APLIKACJA, PROMPTY-PO-AUDYCIE) się różnią, **wygrywa ten plan**. Wpisy „odwraca …” w §1 mówią wprost, co się zmieniło.

---

## 1. Decyzje Krystiana 05–06.11.2026 (ostateczne)

| # | Decyzja | Co odwraca / uzupełnia | Gdzie w planie |
|---|---|---|---|
| D1 | **Zaopatrzenie firm:** dwie nowe podstrony `/agd-rtv-dla-firm` i `/dostawy-it-dla-firm`, tylko dla firm. AGD bez słowa o montażu. Bez logo Max Elektro i GT Group. | nowe | §6 |
| D2 | Pas „Podhale w liczbach” usunięty z podstron Zaopatrzenia. | — | §6 |
| D3 | Zdjęcia AGD/RTV: packshoty producentów wycięte z tła (dostarczone przez Krystiana). | — | §3, §6 |
| D4 | Na głównej nowa sekcja **„Zaopatrzenie firm”** zaraz po Ofercie i Systemach. | K4 v150 (kolejność głównej) | §6.3 |
| D5 | **Marki na głównej: dwa przesuwające się paski** z wszystkimi markami (dziś 39), klikalne logo, wygaszanie prędkości pod kursorem, przeciąganie, pauza. | **odwraca K36 §1** (usunięcie paska logo) i K4-FINAL „Start: bez paska marek” — dopisek do ADR-017 | §6.3 |
| D6 | Obie podstrony Zaopatrzenia wpięte wszędzie, gdzie mają sens (menu, stopka, kategorie IT, karta produktu, branże, konfigurator, formularze, wyszukiwarka, plan firmy, Opieka IT). | — | §6.4 |
| D7 | **Strona główna może być długa, ale każda sekcja musi mieć sens.** Usuwamy powtórzenia, nie skracamy na siłę. | — | §7 |
| D8 | Z audytu głównej przyjęte w całości: **P1** (dublowanie, scalenie Branż z Planem), **P2** (Zaopatrzenie, pas KSeF, Aktualności, Lokalizacja, usunięcie WhatsAppa), **P3** (ruch, niższe hero, leniwe ładowanie). Opinie klientów — **nie** (czekają na decyzję szefa i zgody). | Branże + Plan scalone: zmienia K4 v150, dopisek do ADR-017. **Aktualności wracają na główną**: odwraca K4-FINAL §2. | §7 |
| D9 | **Elementy wspólne** (nagłówek-kapsuła, mega menu, boczna szyna ≥ 1400 px, wyszukiwarka Ctrl K, stopka, O firmie, Kontakt) wdrażamy na Biznesie wg szablonów wspólnych, z elementami wyróżniającymi linię. Mega menu „Oferta” ma być **na najwyższym poziomie wizualnym** (prototyp). | uzupełnia plan D3-B (`docs/zadania/wspolne-elementy.md`) | §8 |
| D10 | **WhatsApp usuwamy wszędzie**: widok wszystkich linii, pola w panelu, dane. Zgoda na migrację usuwającą dane. | zasada 01.11 | §5.1 |
| D11 | `/zestawy/zestaw-szkola-siec` — poprawić przewijanie w bok na telefonie. | — | §5.2 |
| D12 | **Telefon nie chowa treści, którą pokazuje komputer.** Ma być zrobione mądrze: akordeony, rzędy przewijane, kompaktowe karty. | **odwraca decyzję 02.11 „telefon jak plansza”** (`hiddenOnPhone` / `max-md:hidden` dla sekcji bez planszy App-*) | §5.3 |
| D13 | Ikony na `/opieka-it` — poprawić. | — | §5.2 |
| D14 | **Zestawy: dokończyć wszystkie 23** na najwyższym poziomie (dziś „Gotowe” są 4). | — | §9 |
| D15 | Stopka na telefonie (~2 000 px) — skrócić. | — | §8.1 (stopka wspólna) |
| D16 | Zamienniki u Brothera — **potwierdzone, zostają**. | audyt P1/decyzja 6 | §5.2 (tylko wpis w STAN) |
| D17 | Zdanie „Paragon z NIP do 450 zł…” we wpisie KSeF — **usuwamy**. | K4-FINAL [SZEF] | §5.2 |
| D18 | Elementy wspólne na Biznesie, odstępstwa od szablonu: e-mail `kontakt@prokombiznes.pl`, bez salonu Zakopane, „Oddzwonimy w 60 minut” (obietnica Biznesu z panelu), statusy tylko z K4-FINAL §1. | szablon 04/05 (biznes@pro-kom.eu, Zakopane, 24 h) | §8 |

Zasady bez zmian (K4-FINAL §1, 01.11):
- zero cen;
- bez finansowania, leasingu i rat;
- bez zdjęć ludzi;
- bez WhatsAppa;
- statusy marek tylko: Posnet/Elzab „Autoryzowany serwis”, GoPOS/InsERT „Autoryzowany partner”, Optivendi „Partner”, COMEX „We współpracy”;
- HP tylko oryginalne wkłady;
- tylko Rabka, `kontakt@prokombiznes.pl`, 889 003 889 / 883 200 151, pn–pt 9–17;
- nazwa linii „Tech”, Gaming tylko jako odnośnik.

---

## 2. Stan wyjściowy (sprawdź `docs/STAN.md` na starcie każdej sesji)

Stan `origin/develop` 08.11 (851336a):
- **Dane wspólne i maile:** D1-1 (#331), D1-2 (#332), e2e maili (#335) — scalone.
- **Komponenty wspólne — fundament D2 zakończony:**
  - D2-1a (#334): tokeny, pasek przewijania, `BrandBar`, `SiteHeader` = kapsuła;
  - D2-1b (#336): `AddressMap`, `SiteFooter` z akordeonem na telefonie, `LinesBand`, `LegalBar`, `TabBar`, `MenuSheet`;
  - D2-2a (#338): `SiteRail` i silnik `lib/shared/search`;
  - D2-2b (#339): `SearchDialog`, paleta, ostatnio oglądane za flagą;
  - D2-3a/b (#341, #342): `ContactForm`, `ConsentField`, `SuccessPanel`, strefy dojazdu, `FaqBlock`, `Steps`, `ServiceAreaMap`, `CompanyCard`, `StatsStrip`, `RulesBento`, `FamilyStrip`, `VerifyCards`;
  - D2-4 (#343): szablony `ContactPage` i `AboutPage`.

  Wszystko scalone. **Na Biznesie jeszcze niewpięte** — to robi D3-B (oba PR-y mogą ruszyć).
- **Instalacje już przeszły na powłokę wspólną:** L1-I (#349, scalone), indeks wyszukiwarki L1-I (#348, otwarty). **Wzór dla D3-B Biznesu** — przeczytaj diff #349 przed planem BIZ-1 (co zastąpiono, jak wpięto szynę i stopkę, jakie były pułapki).
- **WhatsApp nadal jest w kodzie** (m.in. `SiteSettings.ts`, `InstalacjeSettings.ts`, `lib/inquiry/listForm.ts`) — usuwa go W1 (§5.1).
- **Biznes (folder `prokom-web-biznes`):** K4 v150, sesje A i B (BX-WYGLAD, BX-RUCH+), koło v3, scena GoPOS, „O firmie” bez cytatu, leniwe widżety (ADR-023), ruch R1. Sprawdź w STAN, czy #321, #324, #306, #310, #311 są scalone. Jeśli nie, najpierw scal albo zrób rebase.
- **Ważne konsekwencje:**
  - Stopka wspólna `SiteFooter` **ma już akordeon na telefonie**. Problem „stopka 2 000 px” rozwiązuje wpięcie stopki wspólnej w D3-B PR 1, a nie poprawianie starej `BiznesFooter`. Wyjątek: jeśli D3-B ma wejść po stagingu Biznesu, robimy szybką poprawkę starej stopki (§8.1, wariant awaryjny).
  - Reguły telefonu Biznesu są w `src/lib/biznes/pages/phone.ts` (`hiddenOnPhone`, `foldedOnPhone`, `FoldOnPhone`, `data-folded`) — tu zmienia się D12.
  - Ikony `/opieka-it`: przyczyna sprawdzona 06.11 — `hardSpacesDeep` (`src/seed/biznes/k4Pages.ts`) wstawia twarde spacje do `iconPath`. „…” z audytu to ucięty komunikat Chrome, w danych go nie ma.
  - Zestawy: status liczy `bundleStatus()` (`src/seed/biznes/k3Bundles.ts`) — „needs-review”, gdy element ma `do_potwierdzenia` w `seed/prokombiznes/k3/zestawy.json`. Otwartych pytań jest 42 w 19 zestawach.

---

## 3. Pliki paczki → repo (BIZ-1, PR 0 `docs/biznes-paczka-0611`)

| Plik w paczce | Cel w repo |
|---|---|
| `PLAN-BUDOWY-0611.md` (ten plik) | `docs/zadania/prokombiznes-0611.md` |
| `ZAOPATRZENIE.md` | `docs/design/prokombiznes/0611/ZAOPATRZENIE.md` |
| `AUDYT-GLOWNA-0611.md` | `docs/design/prokombiznes/0611/AUDYT-GLOWNA-0611.md` |
| `AUDYT-PODSTRONY-0611.md` | `docs/design/prokombiznes/0611/AUDYT-PODSTRONY-0611.md` |
| `ELEMENTY-WSPOLNE-BIZNES.md` | `docs/design/prokombiznes/0611/ELEMENTY-WSPOLNE-BIZNES.md` |
| `prototyp-zaopatrzenie.html` | `docs/design/prokombiznes/0611/prototyp-zaopatrzenie.html` |
| `prototyp-glowna.html` | `docs/design/prokombiznes/0611/prototyp-glowna.html` |
| `media/zaopatrzenie/*.webp` (packshoty AGD/RTV, nazwy `p-*`) | `seed/prokombiznes/zaopatrzenie/media/` |

W tym samym PR:
1. Dopisek do `docs/design/prokombiznes/INDEKS.md`: paczka 0611 ma pierwszeństwo przed K4 v150 dla głównej, Zaopatrzenia i elementów wspólnych.
2. Dopisek do ADR-017 „Rozstrzygnięcia 06.11”:
   - Marki w dwóch paskach (odwraca K36 §1 i „bez paska marek” na telefonie);
   - Branże scalone z Planem;
   - Aktualności na głównej (odwraca K4-FINAL §2);
   - telefon nie chowa treści (odwraca „telefon jak plansza” z 02.11).
3. Wpis do `docs/STAN.md` → „Decyzje”: D1–D18 jednym akapitem z odsyłaczem do tego planu.
4. `docs/zadania/prokombiznes.md` → nowa podsekcja „§7.3 Paczka 0611” z odsyłaczem do tego planu.

Prototypy otwierasz w przeglądarce:
- `prototyp-glowna.html` ma u góry przełącznik Strona główna / O firmie / Kontakt / Jasny / Ciemny;
- `prototyp-zaopatrzenie.html` ma widoki AGD / IT / Wpis na głównej.

Literały kolorów z prototypów → tokeny (`tokens.css`). Wyjątek: kolory etykiety energetycznej A–G (stałe UE).

---

## 4. Mapa sesji i PR-ów — krótka F i trzy duże sesje Biznesu (decyzja Krystiana 06.11: większe i dłuższe sesje; aktualizacja 08.11)

**Zasada dużej sesji** (jak v3 elementów wspólnych i §7.2 Biznesu — tu wyjątek od „2–3 PR-y na sesję” z CLAUDE.md):
- **jeden plan całości** w trybie planowania na starcie (akceptuje Krystian), potem PR po PR przez kilka wieczorów;
- PR-y piętrowe, każdy ≤ ~400 linii diffu, **do 8 PR-ów w sesji**;
- między PR-ami bez rytuału startu i końca; `/przeglad` przed `/pr` każdego PR-a z logiką, formularzem, migracją albo diffem > 100 linii;
- **na koniec każdego wieczoru** `/koniec-sesji` (STAN: „W toku: BIZ-2, scalone B2-1, B2-2, następny B2-3 — …”), a następnego `/zadanie BIZ-2 — kontynuacja wg STAN` (bez nowego planu, chyba że coś się zmieniło);
- przystanki tylko przy decyzji, której plan nie rozstrzyga (pytanie z opcjami), i przy migracji usuwającej dane.

### 4.1 Sesje

| Sesja | Folder | Zakres (§) | PR-y (piętrowo) | Wieczory | Warunek startu |
|---|---|---|---|---|---|
| **F — fundament: WhatsApp** | `prokom-web` | §5.1 | W1 `feat/wsp-bez-whatsapp` (+ małe `feat/wsp-*` zamówione przez BIZ, np. `feat/wsp-szukaj-odmiany`) | ≈ 0,5 | od razu |
| **BIZ-1 — porządek, nowa powłoka, Kontakt i O firmie** | `prokom-web-biznes` | §3, §5.2, §5.3, §8.1, §8.2 | DOC `docs/biznes-paczka-0611` → B1-1 `fix/biznes-twarde-zasady` → B1-2 `fix/biznes-telefon-tresc` → D3-B 1a `feat/biznes-powloka-wspolna` (pasek marki, kapsuła, szyna, stopka, dolny pasek) → D3-B 1b `feat/biznes-mega-menu-szukaj` (mega menu premium + Ctrl K) → D3-B 2 `feat/biznes-kontakt-o-firmie` (nowe strony Kontakt i O firmie na szablonach) | ≈ 4 | wolne miejsce na drugą sesję (§4.3) |
| **BIZ-2 — Zaopatrzenie i nowa strona główna** | `prokom-web-biznes` | §6, §7 (+ §9.1, jeśli zostanie czas) | B2-1 `feat/biznes-zaopatrzenie-szablon` (nowa podstrona AGD i RTV dla firm) → B2-2 `feat/biznes-zaopatrzenie-it` (nowa podstrona Dostawy IT dla firm) → B2-3 `feat/biznes-glowna-zaopatrzenie-marki` → B3-1 `feat/biznes-glowna-struktura` → B3-2 `feat/biznes-glowna-ksef-aktualnosci-kontakt` → B3-3 `fix/biznes-glowna-seo-a11y-ruch` | ≈ 3,5 | BIZ-1 scalone (powłoka w `develop`) |
| **BIZ-3 — zestawy, jakość, QA** | `prokom-web-biznes` | §9, §10, §11 | B4-1 `docs/biznes-zestawy-zgodnosci` → B4-2 `feat/biznes-zestawy-strona` (nowa strona `/zestawy` i karty zestawów) → B5-1 `fix/biznes-alt-a11y` → B5-2 `feat/biznes-seo-podstrony` → B5-3 `refactor/biznes-bez-dubli` (2 PR-y, jeśli > 400 linii) → QA (raport + `/wdrozenie staging`) | ≈ 3,5 | BIZ-2 scalone |
| | | | | **≈ 11,5 razem** | |

```
WIECZORY →   1     2     3     4     5     6     7     8     9    10    11
prokom-web   [F: W1]
biznes       [BIZ-1: DOC·B1·B1·powłoka·mega·Kontakt/O firmie]  [BIZ-2: Zaop×3 · Główna×3 ───]  [BIZ-3: zestawy·jakość·QA ──]
```

### 4.2 Dlaczego tak
1. **BIZ-1 łączy wszystko, co porządkuje „ramę” strony.** Poprawki twarde, treść na telefonie i nowa powłoka dotykają tych samych miejsc (ramka, telefon, stopka, menu). W jednej sesji robi się zrzuty „przed” raz i raz porównuje całość.
2. **Powłoka przed Zaopatrzeniem i główną.** Mega menu, stopka, szyna i wyszukiwarka to miejsca, w które wpinamy Zaopatrzenie (§6.4) i nowe sekcje głównej. Odwrotnie wpinalibyśmy dwa razy. Warunek (D2-2 scalone) jest spełniony.
3. **BIZ-2 = jedna opowieść „co sprzedajemy i jak to pokazujemy”.** Zaopatrzenie dodaje sekcję i Marki na główną, a zaraz potem B3 układa resztę głównej wokół nich — bez przerwy między sesjami, kiedy stan głównej jest „w połowie”.
4. **Kontakt i O firmie w BIZ-1** (zmiana 08.11): szablony D2-4 są już scalone, a nowe strony korzystają z tej samej powłoki — robimy je od razu po niej, przy tych samych zrzutach „przed”.
5. **BIZ-3 domyka resztę:** zestawy (badanie źródeł), jakość całego serwisu (mierzona na gotowym układzie) i QA ze stagingiem.
6. **Badanie zestawów (B4-1) można przesunąć do BIZ-2**, jeśli zostanie wieczór — to dane i dokument bez UI. Wtedy scalony „Plan + branże” od razu pokaże gotowe zestawy branży.

### 4.3 Ograniczenie: najwyżej dwie sesje piszące kod naraz (CLAUDE.md)
Stan 08.11: otwarte są Software SWA2 (#351) i Instalacje L1 (#348) — to już dwie sesje. **BIZ-1 rusza, gdy jedna z nich się zakończy albo zatrzyma** (wpis w jej STAN).
- F (W1) to ok. pół wieczoru — najlepiej zaraz po scaleniu #348, zanim Instalacje zaczną L2 (W1 zmienia też `InstalacjeSettings`, więc Instalacje i tak muszą po nim zrobić rebase).
- Potem BIZ-1 → BIZ-2 → BIZ-3 jedna po drugiej w folderze Biznesu; obok nich może pracować najwyżej jedna sesja innej linii.

### 4.4 Rozmiar PR-ów
D3-B PR 1 z planu wspólnego jest tu podzielony na **1a (powłoka) i 1b (mega menu + wyszukiwarka)**, bo razem przekroczyłby ~400 linii. B5-3 może wyjść jako dwa PR-y. Reszta mieści się w limicie.

## 5. Poprawki twarde (W1 w sesji F; B1 w sesji BIZ-1)

### 5.1 W1 — `feat/wsp-bez-whatsapp` (folder fundamentu, migracja usuwająca dane)
**Cel:** w żadnej linii nie ma WhatsAppa — ani w widoku, ani w panelu, ani w danych (D10).

1. **Schemat.** Usuń pole(a) WhatsApp z `CompanyData`, `SiteSettings.shared` i każdego innego miejsca. Lista: `grep -rni "whatsapp\|wa\.me" src seed`.
   - Migracja: `pnpm payload migrate:create usun-whatsapp`.
   - W opisie PR: „migracja usuwająca dane — zgoda Krystiana 06.11”.
   - `down` odtwarza kolumny, bez danych.
2. **Widok — wszystkie linie.** Usunięcie pola wymaga usunięcia użyć, więc to wyjątek od zasady „fundament nie wpina w ramki linii” — tylko usuwanie, bez nowych funkcji.
   - **Biznes:**
     - `components/BiznesFooter.tsx`;
     - `components/BiznesHeader.tsx` (menu telefonu);
     - `Frame.tsx`;
     - `components/forms/ContactPanel.tsx`;
     - `components/home/FaqBiznes.tsx`;
     - `blocks/BzSection/firma/Company.tsx`;
     - `components/SearchOverlay.tsx` (akcja);
     - `blocks/BzContact/config.ts`;
     - opcja „WhatsApp” w `listForm`;
     - opis meta `/kontakt`.
   - **Instalacje:** `sites/instalacje/dane/kontakt.ts`, `dane/wyslane.ts`, `sekcje/glowna/PlanSection.tsx`.
   - **Software:** co znajdzie grep.
   - **Wspólne:** `src/components/shared/*`, `lib/shared/*` (jeśli są użycia).
3. **Seedy i testy.** `src/seed/biznes/{contact,run,k4PagesRun}.ts`, `src/seed/instalacje/{contact,legal,run}.ts` + `contact.test.ts`, `src/seed/shared/shared.test.ts`. Potem `pnpm generate:types`, a jeśli trzeba, też `generate:importmap`.
4. **Układ po usunięciu.** Kafle kontaktu: telefon · drugi numer · e-mail. Siatka bez pustego miejsca (3 kolumny albo 1 + 2).
5. **Testy:**
   - Vitest: dane seeda żadnej linii nie zawierają `whatsapp` ani `wa.me`;
   - e2e: `/`, `/kontakt` i jedna kategoria każdej linii nie mają w HTML `wa.me` ani słowa „WhatsApp”.
6. **Opis PR:**
   - foldery `prokom-web-biznes`, `prokom-instal`, `prokom-web-software` robią rebase i `pnpm payload migrate` po scaleniu;
   - na stagingu migracja usunie dane pola.

**Odbiór:**
- `grep -rni "whatsapp\|wa\.me" src seed` zwraca tylko migrację i test;
- CI zielone;
- recenzent (migracja).

### 5.2 B1 / PR 1 — `fix/biznes-twarde-zasady`
1. **Ikony `/opieka-it` (D13).**
   - Test najpierw: `hardSpaces` nie zmienia ścieżki SVG; żaden `iconPath` w danych stron Biznesu nie zawiera ` `.
   - Poprawka w `src/lib/text/hardSpace.ts`: `hardSpacesDeep` pomija klucze `iconPath`, `ic`, `d` oraz wartości, dla których `isSvgPath(value)` (z `lib/catalog/svg.ts`).
   - Sprawdź pozostałe sekcje z ikonami z seeda (salony, konfigurator, branże, plan) — ta sama przyczyna.
   - `pnpm seed:biznes` naprawia istniejące rekordy (idempotentnie, rekord zapisywany tylko przy różnicy).
   - e2e: `/opieka-it` bez błędów konsoli, 8 kafli obszarów z ikoną (także „Sieć i Wi-Fi”).
2. **Przewijanie w bok `/zestawy/zestaw-szkola-siec` (D11)** — przy 390 px strona ma 444 px.
   - Playwright 390: wypisz elementy z `right > 390`, które nie są w kontenerze z `overflow`.
   - Popraw w komponencie strony zestawu, nie w jednym rekordzie: `min-width: 0` w siatkach, `overflow-wrap: anywhere` dla długich nazw modeli (`USW-24-Max`, `DS923+`…), tabele w kontenerze przewijanym.
   - e2e: każdy `/zestawy/*` (z bazy) przy 360 i 390 ma `scrollWidth ≤ szerokość`.
3. **Wpis KSeF (D17).**
   - Usuń zdanie „Paragon z NIP do 450 zł przestaje być fakturą uproszczoną w B2B.” (`src/seed/biznes/posts.ts`, ok. l. 61). Akapit ma dalej czytać się płynnie.
   - Seed aktualizuje istniejący wpis.
   - Test: treść wpisu nie zawiera „450 zł”.
4. **Ulga „do 700 zł”** (K4-FINAL §1; FAQ `/oferta/kasy-fiskalne` i wpis KSeF): jedno krótkie zdanie, że ulgę rozlicza się w deklaracji VAT / z księgową. Bez nowych obietnic.
5. **Brother (D16):** bez zmian w kodzie. Wpis w `docs/STAN.md` → „Decyzje”.

### 5.3 B1 / PR 2 — `fix/biznes-telefon-tresc` (D12)
**Dziś na 390 px znika** (pomiar audytu):

| Strona | Co znika |
|---|---|
| `/kontakt` | formularz |
| `/ksef` | FAQ i końcowe CTA |
| `/ulga-na-kase-fiskalna` | FAQ |
| `/oferta/kasy-fiskalne` | FAQ, „Co dostajesz”, „Często dobierane” |
| `/o-firmie` | adres i mapa |
| 41 kategorii, 3 branże, 20 marek bez salonu | pomoc w doborze (`ListForm` / `FoldOnPhone` — H2 „Nie wiesz, co wybrać?…” niewidoczny) |
| strona główna | FAQ i „O firmie” (audyt głównej P0-3 — robi B3, ale wzorzec powstaje tutaj) |

JSON-LD `FAQPage` zostaje w HTML, choć pytań nie widać.

**Zasada (zastępuje 02.11):** na telefonie nic nie jest `display:none` „bo telefon”. Długie bloki skracamy formą, nie usuwamy.

| Wzorzec | Kiedy | Jak |
|---|---|---|
| **Akordeon** | FAQ, długie opisy | `<details><summary>`: pierwsze pytanie otwarte, reszta zwinięta; `summary` ≥ 44 px; treść w DOM (dlatego `FAQPage` jest uczciwe); bez JS |
| **Rząd przewijany** | karty („Często dobierane”, zestawy, polecane) | `scroll-snap`, `padding-inline` 16 px + `scroll-padding`, wskaźnik postępu, karta ~78% szerokości |
| **Lista kompaktowa** | „Co dostajesz”, korzyści | 2 kolumny, ikona 20 px, 1 linia |
| **Karta pomocy** | kategorie, marki bez salonu, branże | jedna karta „Nie wiesz, co wybrać?”: „Zadzwoń” + „Opisz, czego potrzebujesz” (otwiera szufladę zapytania z wybraną kategorią). Zastępuje schowany formularz i kartę boczną (bez dublowania) |
| **Wizytówka** | `/o-firmie` | adres, godziny, NIP, telefon widoczne; mapa jako statyczny obraz `AddressMap` z „Wyznacz trasę ↗” |
| **Formularz** | `/kontakt` | kolejność: status + „Zadzwoń” (duży) → kafle kontaktu → **formularz** (temat chipami, imię/firma, telefon lub e-mail, wiadomość, zgoda) → mapa i godziny |

**Zmiany w kodzie:**
- `src/lib/biznes/pages/phone.ts`: `hiddenOnPhone` usuń dla wymienionych sekcji. `foldedOnPhone` zmień tak, żeby `FoldOnPhone` renderował widoczny nagłówek: tekst H2 jako `summary`, z `id` do `aria-labelledby`, a `data-folded` nie ukrywał H2 przed czytnikiem.
- `ListForm` → karta pomocy na telefonie, pełny formularz na komputerze.
- `/ksef`: końcowe CTA widoczne. Pole `ask` sekcji „KSeF: kary i pomoc” — patrz STAN „Staging i produkcja”.

**Testy:**
- e2e `biznes-telefon-tresc` (390 px) dla wymienionych stron: każdy H2 widoczny na 1440 jest widoczny na 390 albo jest `summary` rozwijanego elementu;
- `FAQPage` tylko tam, gdzie pytania są w DOM;
- brak przewijania w bok;
- wysokość strony na 390 ≤ 1,3 × wysokość na 1440 (jeśli więcej — lista w opisie PR).

**Odbiór:**
- MOBILE-APLIKACJA §4 (karty, odstępy, cele dotykowe ≥ 44 px);
- desktop 1440 bez zmian (pomiar wysokości bloków przed i po);
- recenzent (formularz).

---

## 6. Zaopatrzenie firm (sesja BIZ-2, PR-y 1–3) — spec `0611/ZAOPATRZENIE.md`

Pełny zakres jest w spec (§0–§11). Tu tylko podział na PR-y, punkty krytyczne i to, co zmieniła powłoka D3-B.

**Warunek startu:** decyzje szefa z ZAOPATRZENIE §0 albo flagi w panelu wyłączone do czasu decyzji. Tekst warunkowy nie może pojawić się bez wpisu w panelu.

### 6.1 PR B2-1 — `feat/biznes-zaopatrzenie-szablon`
- **Dane:** `strony-k4.json → zaopatrzenie.agd|it` (+ import w seedzie, idempotentny).
  - Nowe pola panelu wymagają migracji **dodającej**:
    - flagi §0: `oldEquipmentPickup`, `services[]`, `clsHint[]`, gwarancja na miejscu, LG, logo Whirlpool;
    - SiteSettings → „Zaopatrzenie — linki” (§10).
- **Czyste funkcje, najpierw testy Vitest** (`src/lib/biznes/procurement/`):
  - `procurementTotals(state, data)`;
  - `deliverySplit(n, stages)` — prawie równy podział, suma = n;
  - `scheduleRows(state, data)`;
  - `offerRows(state, data)`;
  - `parseHandoff(searchParams)` — `?typ=&n=`, nieznane → domyślne, `n` 1–500.
- **Szablon `ProcurementPage`** (§2 spec), sterowany danymi: brak bloku = brak sekcji. Kolejność sekcji 1–18 z tabeli spec §2.
- **Konfigurator** (§3), **podgląd oferty** (§4: biała kartka zawsze jasna, cena zakryta paskami, objaśnienia 1–4 z podświetleniem), **harmonogram** (§6). Wszystko jako jedna wyspa kliencka ze wspólnym stanem. Treść i FAQ renderuje serwer.
- **Formularz** przez `submitInquiry()` z tematem „Większa dostawa sprzętu” i listą z konfiguratora (`f-msg`, `f-cnt`). NIP sprawdzany sumą kontrolną.
- **Strona AGD** `/agd-rtv-dla-firm`:
  - metadane i JSON-LD: `Service`, `FAQPage`, `BreadcrumbList` (bez `offers`);
  - okruszki Start / Oferta / Zaopatrzenie firm (→ `/oferta`).
- **Ruch** (§7 spec), wszystko z `prefers-reduced-motion`.
- **Zdjęcia** z `seed/prokombiznes/zaopatrzenie/media/` do Media (nazwy `zaop-*`).

### 6.2 PR B2-2 — `feat/biznes-zaopatrzenie-it`
- Strona IT `/dostawy-it-dla-firm`: sekcje 4′, 6, 11, 12, 13.
- Lista kontrolna „Przygotowanie” (§5 spec; kroki z `prep.list`, zgodne z `services[]`).
- Wejście `?typ=&n=` dla obu stron (przewija do konfiguratora).
- Karta drugiej podstrony pod formularzem.

### 6.3 PR B2-3 — `feat/biznes-glowna-zaopatrzenie-marki`
- **Blok `bzProcurement`** (§8 spec) zaraz po `bzOffer`, przed `partners`:
  - dwie granatowe karty z mini-kalkulatorem (rodzaj × liczba → wynik płynnie);
  - przyciski z `?typ=&n=`;
  - pasek 4 korzyści, w tym obietnica 60 min z panelu;
  - nowy blok = migracja dodająca.
- **Marki w dwóch paskach** (§9 spec, D5):
  - pętla `requestAnimationFrame`, prędkości 34/28 px/s, wygaszanie pod kursorem, przeciąganie (po przeciągnięciu klik nie otwiera), stop przy fokusie, przycisk „Wstrzymaj animację” (WCAG 2.2.2), maska krawędzi;
  - kafel 212 × 114 (telefon 158 × 94), plakietka statusu z `Partners`;
  - każdy kafel to link: salon → `/marki/<slug>`, bez salonu → strona marki;
  - druga kopia z `aria-hidden` i `tabindex=-1`;
  - **na telefonie też paski** (D5 odwraca K4-FINAL).
- **Wpięcia z §10 spec** (§6.4 niżej).
- Test e2e (spec §9):
  - wszystkie marki z bazy są linkami;
  - pod kursorem po 1 s pasek stoi;
  - po „Wstrzymaj” stoi;
  - 360/390/1024/1440 bez przewijania w bok.

### 6.4 Wpięcia Zaopatrzenia (zaktualizowane o powłokę D3-B)

| # | Miejsce | Co |
|---|---|---|
| 1 | **Mega menu „Oferta”** (nowe z D3-B, §8.1) | grupa „Zaopatrzenie firm” w kolumnie NA SKRÓTY: 2 linki z ikonami i plakietką „nowe” |
| 2 | Kategorie Laptopy, Komputery, Monitory, Stacje dokujące | pas „Kupujesz 5 sztuk lub więcej? Dostawy IT…” nad siatką (telefon: po 6. karcie) |
| 3 | Karta produktu w tych kategoriach | pod „Do zapytania”: „Potrzebujesz kilku sztuk? Policz stanowiska →” |
| 4 | Branże: Hotele i pensjonaty (AGD), Gastronomia, Biura, Szkoły | kafel w rozwiązaniach |
| 5 | Konfigurator — wynik | przy skali „10+” karta „Przy tej skali zrobimy dostawę” |
| 6 | Formularz kontaktu i szuflada „Zapytanie” | chip „Większa dostawa sprzętu” |
| 7 | **Stopka wspólna** (z D3-B) → kolumna Oferta | „AGD i RTV dla firm”, „Dostawy IT dla firm” (plakietka „nowe”) |
| 8 | Plan Twojej firmy — Hotel / Biuro | punkt „Telewizory w pokojach” / „Kuchnia socjalna” |
| 9 | Opieka IT, sekcja „Nowy sprzęt?” | link „Dostawy IT — gotowe do pracy” |
| 10 | **Wyszukiwarka Ctrl K** (z D3-B) | frazy „agd”, „lodówka”, „telewizor”, „pralka”, „dostawa laptopów”, „hurtowo”, „dla dewelopera” → podpowiedź-link na górze wyników |
| 11 | `sitemap.xml`, okruszki, JSON-LD, szyna podstron | obie strony w mapie; „Na tej stronie” szyny z `[data-rail-section]` |

Teksty z tabeli trafiają do pól w panelu, nie na sztywno.

**Odbiór B2 (każdy PR):**
- zrzuty 390 i 1440, jasny i ciemny, obok prototypu w opisie PR;
- Lighthouse ≥ 90;
- axe 0;
- 0 przewijania w bok;
- `/przeglad` dla B2-1 i B2-3.

---

## 7. Strona główna po audycie (sesja BIZ-2, PR-y 4–6) — audyt `0611/AUDYT-GLOWNA-0611.md`, wzorzec `0611/prototyp-glowna.html`

### 7.1 Docelowa kolejność (każda sekcja odpowiada na jedno pytanie klienta — D7)

| # | Pytanie klienta | Sekcja | Zmiana względem dziś |
|---|---|---|---|
| 1 | Kim jesteście? | **Hero z kołem** | wiersze zaufania w jednym rzędzie z ikonami; hero ok. 855 → 760 px |
| 2 | Od czego zacząć? | **Szybki start** | bez zmian; jedyny „hub nawigacji” |
| 3 | Co macie? | **Oferta: 5 działów + Systemy** | z kafla „Nie wiesz, w którym dziale szukać?” zostaje **samo pole szukania z podpowiedziami** (otwiera Ctrl K); bez Plan / Zestawy / Cała oferta; wyrównanie wysokości kart (Serwis i usługi bez pustki) |
| 4 | A jak potrzebuję dużo? | **Zaopatrzenie firm** | nowe (B2-3) |
| 5 | Porządne marki? | **Marki w dwóch paskach** | nowe (B2-3); baner „Zobacz wszystkie marki · 39” usunięty, link w nagłówku sekcji |
| 6 | Co biorą inni? | **Najczęściej wybierane** (16, pigułki) | telefon: `padding-inline` 16 px i `scroll-padding` (dziś pierwsza karta przy x = 0); „+ do zapytania” z animacją lotu do licznika |
| 7 | Czy coś mnie goni? | **Pas KSeF** | nowe na komputerze: odliczanie do terminu z panelu + 6 kroków (z `BzKsef`) → `/ksef`; termin i tekst z panelu, po dacie wersja „po” (K36 §3) |
| 8 | Jak to wygląda u mnie? | **Plan Twojej firmy scalony z branżami** | jedna sekcja (D8): przełącznik 12 branż z ikonami i opisem → plan (jasny/ciemny) z punktami → „Gotowy zestaw dla tej branży” (z `zestawy_na_glownej`, tylko „Gotowe”) → lista 6 punktów + „Pokaż wszystkie” → „Dodaj cały plan do zapytania” → pas dofinansowań; osobna sekcja „Firmy każdej wielkości” znika |
| 9 | Jak się pracuje? | **Jak pracujemy + zobowiązania** | bez zmian; „60 minut” tylko tu, w hero i w formularzu (dziś 5×) |
| 10 | Czy innym się opłaciło? | *Opinie* | **slot wyłączony** (flaga, decyzja szefa §13) — sekcja się nie renderuje |
| 11 | Czy można wam ufać? | **O firmie** | 2 liczby + **4 kafle autoryzacji ze statusem** (sprawdź #324 — jeśli brak, dokończ); na telefonie widoczna jako kompaktowa karta |
| 12 | Jesteście na bieżąco? | **Aktualności (3 karty)** | wracają (D8); najnowsze wpisy Biznesu z panelu. Gdy wpisów Biznesu < 3, karty linków do wpisów Instalacji/Software (tylko tytuł + link do ich domeny, bez kopiowania treści — zasada SEO). Pusto = sekcja się nie renderuje |
| 13 | A wątpliwości? | **FAQ** | bez WhatsAppa (W1); na telefonie akordeon (wzorzec §5.3) |
| 14 | Kontakt i gdzie jesteście? | **Kontakt z lokalizacją** | lewa kolumna formularza: `AddressMap` z pinezką, „dziś otwarte do 17:00” na żywo, adres, telefon, „Wyznacz trasę ↗” (zamiast kafli dublujących stopkę); chip „Większa dostawa sprzętu” |

Na telefonie ta sama kolejność, z widocznym FAQ i „O firmie”. Długość może zostać podobna albo większa — liczy się brak powtórzeń.

### 7.2 PR-y
- **B3-1 `feat/biznes-glowna-struktura`:**
  - kolejność §7.1, usunięcie hubów nawigacji (kafel → samo pole szukania, baner marek);
  - scalenie Plan + Branże jako jeden blok `bzPlan` z przełącznikiem branż, zestawem branży i dofinansowaniami (migracja dodająca, jeśli trzeba; stary blok branż usuwany z układu strony w seedzie, nie z bazy);
  - „60 minut” 3×.
- **B3-2 `feat/biznes-glowna-ksef-aktualnosci-kontakt`:**
  - pas KSeF (pole „termin” w panelu, odliczanie liczone po stronie klienta, bez skoku układu);
  - Aktualności (3 karty z bazy);
  - Kontakt z lokalizacją;
  - „O firmie” z 4 autoryzacjami;
  - FAQ i „O firmie” widoczne na telefonie.
- **B3-3 `fix/biznes-glowna-seo-a11y-ruch`:**
  - `<title>` głównej ≤ 60 znaków z frazami, np. „Kasy fiskalne, komputery i opieka IT — Rabka | PRO-KOM Biznes” — pole SEO w panelu + test, że tytuł ≠ nazwa firmy;
  - JSON-LD `WebSite` + `SearchAction` (`/oferta?szukaj={search_term_string}` — tak działa wyszukiwarka oferty);
  - nagłówki:
    - okna (`Szukaj w ofercie`, `Menu`, `Twoje zapytanie`) bez H2 w drzewie: `role="dialog"` + `aria-labelledby`, nagłówek po otwarciu;
    - środek koła nie jest H2;
  - `alt` = „Marka Model” dla zdjęć produktów (Najczęściej wybierane, witryny działów);
  - ruch P3: kaskada kafli, liczniki w „O firmie”, `prefers-reduced-motion`, jedna pauza na sekcję z ruchem ciągłym;
  - leniwe ładowanie i `sizes` poniżej pierwszego ekranu.

**Odbiór B3:**
- porównanie z `prototyp-glowna.html` (1440 i 390, jasny i ciemny);
- e2e:
  - kolejność sekcji;
  - FAQ i „O firmie” widoczne na 390;
  - brak „Firmy każdej wielkości” jako osobnej sekcji;
  - pas KSeF z datą z panelu;
- Lighthouse ≥ 90 na `pnpm build && pnpm start`;
- `/przeglad`.

---

## 8. Elementy wspólne na Biznesie (D3-B) — spec `0611/ELEMENTY-WSPOLNE-BIZNES.md`, plan `docs/zadania/wspolne-elementy.md` §3 (kroki L1, L2)

D3-B to sesja linii: **nie zmienia** `src/components/shared/`, `src/lib/shared/`, wspólnych tokenów ani wspólnych pól. Brakuje czegoś we wspólnym komponencie → osobny mały PR `feat/wsp-<co>` w folderze fundamentu, potem z niego korzystasz.

### 8.1 D3-B PR 1 — w sesji BIZ-1 jako dwa PR-y: 1a `feat/biznes-powloka-wspolna` (pkt 1, 2, 4, 6, 7, 8) i 1b `feat/biznes-mega-menu-szukaj` (pkt 3, 5) — kroki L1 + Biznes
**Zastępuje** górny pasek i stopkę z ramy K4, dolny pasek M1′, `SectionRail` / `RailShell` i szynę podstron Biznesu (`src/sites/biznes/components/rail/`) oraz starą `SearchOverlay` jako okno (indeks K4b zostaje jako dostawca).

1. **Pasek marki** (`BrandBar`):
   - linie PRO-KOM · Biznes · Instalacje · Software · Tech · Gaming;
   - status na żywo, „Konfigurator →”, „Biznes: 889 003 889”;
   - ≤ 1180 px chowa „Konfigurator”, ≤ 1080 px chowa status.
2. **Kapsuła** (`SiteHeader`):
   - menu: Oferta ▾, Marki, Opieka IT, GoPOS, InsERT, O firmie, Kontakt;
   - prawa strona: Szukaj (Ctrl K), motyw, „Zapytanie” z licznikiem (gradient + poświata z tokenów `--cap-cta-*`);
   - pigułka aktywnej pozycji płynie między linkami (scroll-spy: Oferta ← oferta/zaopatrzenie/wybierane, Marki, O firmie, Kontakt; na podstronach `aria-current="page"`);
   - ≤ 1080 px: logo + „Zapytanie” + Menu (`MenuSheet`);
   - telefon: 10 px od krawędzi, 58 px, chowa się przy przewijaniu w dół; schowana kapsuła `inert` (uwaga z D2-1a).
3. **Mega menu „Oferta” — premium (D9), wzorzec: prototyp → „Oferta” w kapsule.** Komponent Biznesu w `src/sites/biznes/components/menu/`, z klasami `CAPSULE` dla mega menu.
   - **Panel:** 10 px pod kapsułą, ta sama szerokość i promień (22 px), wejście `clip-path` z góry (≈ 0,5 s, `--ease`), mostek nad szczeliną (żeby kursor nie gubił panelu), zamykanie po 280 ms.
   - **Kolumna DZIAŁY** (262 px):
     - 5 działów z ikoną w gradiencie działu, nazwą i „N pozycji” (z bazy);
     - wskaźnik aktywnego działu przesuwa się sprężyście;
     - zmiana działu po 90 ms najechania (intencja), kliknięciem lub fokusem;
     - na dole karta **„Najczęściej wybierane w dziale”** (zdjęcie, nazwa, status; dla Serwisu „Bezpłatny przegląd IT”) z danych panelu.
   - **Kolumna kategorii:**
     - nagłówek „DZIAŁ · N kategorii” + opis działu;
     - siatka 2 kolumny: miniatura kategorii 52 px na jasnym tle studia (pole obrazu kategorii; brak = ikona w kolorze działu), nazwa, pod spodem **2–4 marki z katalogu** dla tej kategorii (liczone z bazy, bez „PRO-KOM”);
     - kafle wchodzą kaskadą (22 ms);
     - tło kolumny barwi się kolorem działu (`@property --tint`, przejście 0,5 s);
     - na dole „Cały dział X →” i liczba pozycji.
   - **Kolumna NA SKRÓTY** (300 px):
     - Konfigurator (karta w gradiencie akcentu, „ok. 1 minuta”), Gotowe zestawy, Plan Twojej firmy, Cała oferta · N;
     - grupa **Zaopatrzenie firm** (AGD i RTV, Dostawy IT — „nowe”; linki aktywne po B2, do tego czasu ukryte flagą).
   - **Pasek dolny:** „Szukasz konkretnego modelu? Ctrl K” (otwiera wyszukiwarkę) + autoryzacje „Autoryzowany serwis Posnet i Elzab · Autoryzowany partner GoPOS i InsERT”.
   - **Klawiatura:**
     - ↓ na przycisku otwiera i ustawia fokus na aktywnym dziale;
     - ↑↓ / Home / End w działach (`role="tablist"`, `aria-orientation="vertical"`);
     - → do pierwszej kategorii, ← wraca;
     - Esc zamyka i oddaje fokus przyciskowi;
     - wyjście fokusu poza kapsułę zamyka.
   - Dotyk: klik otwiera i zamyka (bez otwierania przy najechaniu).
   - **Dane:** z kolekcji katalogu (działy, kategorie, liczby, miniatury) i z panelu (karta działu, skróty). Bez list na sztywno.
   - **Test e2e:**
     - klawiatura (sekwencja wyżej);
     - liczba kategorii każdego działu = baza;
     - zamknięcie po wyjściu kursora (> 280 ms);
     - axe 0 w otwartym panelu;
     - 1180 i 1440 bez przewijania w bok.
4. **Boczna szyna ≥ 1400 px** (`SiteRail`):
   - sekcje głównej (12, po B3): Start, Oferta, Zaopatrzenie firm, Marki, Najczęściej wybierane, KSeF, Plan Twojej firmy, Jak pracujemy, O firmie, Aktualności, Pytania, Kontakt. Do czasu B2/B3 lista z bieżących sekcji; sekcje bez bloku na stronie są pomijane;
   - akcja linii „Zapytanie” z licznikiem;
   - na podstronach „Na tej stronie” z `[data-rail-section]` + zwinięta „Strona główna”;
   - `--rail-offset` odsuwa kapsułę i treść.
5. **Wyszukiwarka Ctrl K / „/”** (`SearchDialog` + dostawca Biznesu z indeksu K4b):
   - grupa **Akcje** na górze: Zadzwoń 889 003 889, Drugi numer, Skopiuj numer, Napisz e-mail, Wyznacz trasę, Konfigurator, Zmień motyw, Zapytanie;
   - słowa wyzwalające: tel, telefon, dzwoń, numer, mail, trasa, dojazd, motyw;
   - produkty z **podglądem** po prawej (zdjęcie, logo marki, status, korzyść, „Do zapytania”, „Karta”); dla innych wyników podgląd ikony lub obrazu z akcją;
   - kategorie, strony, sekcje;
   - literówki (odległość z transpozycją: „lapotp” → „laptop”) i polskie odmiany („kasa” znajduje „Kasy fiskalne”) — sprawdź, co już robi `lib/shared/search/normalize.ts`; brak → mały PR `feat/wsp-szukaj-odmiany`;
   - brak wyników: „Nie mamy jeszcze „x” na stronie” + „Zapytaj o „x”” (`?fraza=` → formularz) + drugi numer;
   - ostatnio oglądane za flagą (do opinii prawnika);
   - frazy Zaopatrzenia (§6.4 #10) po B2.
6. **Stopka wspólna** (`SiteFooter` + `LinesBand` + `LegalBar`):
   - granat `--line-dark`, ramka przerywana;
   - kolumny Oferta / Usługi / Firma / Kontakt (mini mapa `AddressMap`, telefon, e-mail, adres, status, „drugi numer 883 200 151”);
   - pas 6 linii z „Jesteś tutaj”;
   - pasek prawny z NIP i „Oferta skierowana do przedsiębiorców”;
   - **na telefonie akordeony** (już w D2-1b) → rozwiązuje D15;
   - cel: ≤ ok. 900 px przy 390 px. Test e2e: wysokość stopki na 390 < 1000 px na 3 stronach.
   - **Wariant awaryjny D15** (tylko jeśli D3-B przesuwa się za staging Biznesu): w starej `BiznesFooter` na ≤ 767 px kontakt zawsze widoczny, kolumny jako `<details>`, pas linii jako rząd `scroll-snap`.
7. **Dolny pasek telefonu:** do decyzji §13 #9 — prototyp ma **wspólny** (Start · Oferta · **Zapytanie na środku z licznikiem** · Szukaj · Kontakt). Bez decyzji zostaje układ K4.
8. **Usunięcie starego:** `SectionRail.tsx`, `rail/` Biznesu, stara górna rama, `BiznesFooter` (po przeniesieniu kolumn do danych `shared`), stary dolny pasek. Test: brak importów starych komponentów.

**Odbiór PR 1:**
- zrzuty „przed” i „po” 1440/1400/1180/1024/390, jasny i ciemny;
- e2e `wspolne-*` przechodzą też na tenancie Biznesu;
- axe 0;
- Lighthouse bez spadku;
- `/przeglad`.

### 8.2 D3-B PR 2 — `feat/biznes-kontakt-o-firmie` (sesja BIZ-1, PR 5; kroki L2 — D2-4 scalone 07.11)

**O firmie** (`AboutPage` + sekcje Biznesu):
- **Hero granat z warstwicami:**
  - okruszki, pigułka „PRO-KOM Tadeusz Wójciak · Rabka-Zdrój, od 2004”;
  - H1 „Lokalna firma IT, która zostaje z klientem na lata.” z akcentem;
  - lead, przyciski „889 003 889” i „Jak pracujemy”;
  - kontur „2004” w tle.
- **Wizytówka** (`CompanyCard`):
  - firma, adres, NIP (kopiowanie jednym kliknięciem), telefony, e-mail, godziny;
  - **4 logo autoryzacji** z podpisem statusu;
  - „Dane sprawdzisz w CEIDG po numerze NIP ↗”;
  - lekkie przechylenie za kursorem (tylko `pointer: fine`, bez reduced motion).
- **Liczby** (`StatsStrip`): 2004 · 100+ (**flaga** — §13) · 2 autoryzowane serwisy kas · 5 linii + Gaming.
- **„Czego możesz od nas oczekiwać”** (`RulesBento`, 6 zasad, kafel 01 z kartką „wyceny”).
- **„Krok po kroku”** (`Steps`, linia rysuje się przy wejściu).
- **„Pięć linii i marka PRO-KOM Gaming”** (`FamilyStrip`).
- **„Nie musisz wierzyć nam na słowo”** (`VerifyCards`): CEIDG, lista serwisów Posnet, partnerzy InsERT, wizytówka Google — linki z panelu, puste = karta ukryta.
- **„Odwiedź nas”** (granat + `AddressMap`).

**Kontakt** (`ContactPage` + sekcje Biznesu):
- **Hero:**
  - status na żywo;
  - H1 „Powiedz, czego potrzebuje firma. Resztę ustalimy na miejscu.”;
  - lead z obietnicą z panelu;
  - **telefon na pierwszym planie**;
  - pasek E-MAIL · DRUGI NUMER · ODPOWIEDŹ.
- **Karta salonu:** mapa z pinezką, ul. Orkana 16B, „Wyznacz trasę”, dni tygodnia z podświetlonym „dziś”, firma i NIP + CEIDG. **Bez Zakopanego.**
- **„Z czym dzwonisz?” — 4 sprawy:**
  1. Kasa, POS albo terminal;
  2. Awaria albo serwis;
  3. KSeF, programy i opieka IT;
  4. Większa dostawa sprzętu.

  Kliknięcie zaznacza temat w formularzu i przewija do niego.
- **Formularz** (`ContactForm`):
  - lewa kolumna „Co dalej” (4 kroki);
  - **lista z „Dodaj do zapytania” dołączona do wiadomości**;
  - chipy tematów, walidacja, ekran podziękowania.
- **„Dojazd i zasięg”** (`ServiceAreaMap` + `zones`): pole miejscowości → „strefa Podhale / Małopolska — dojeżdżamy”; nieznana: „Jeśli to Małopolska — dojeżdżamy. Zadzwoń”.
- **„Inna sprawa? Każda linia ma swój zespół.”** (`FamilyStrip` bez Biznesu).
- **„Zanim zadzwonisz”** (`FaqBlock`): parking (pole w panelu, TODO), dojazd do klienta, co przygotować, wizyta bez umawiania.

Usunięcie starych stron Kontakt/O firmie z K4i i zdjęć ludzi. Test e2e formularza: rekord w `Inquiries`, mail w Mailpit, temat z „Z czym dzwonisz?”.

---

## 9. Zestawy — wszystkie 23 gotowe (sesja BIZ-3, PR-y 1–2; D14)

### 9.1 PR B4-1 — `docs/biznes-zestawy-zgodnosci` + dane (bez UI)
1. Skrypt wypisuje 42 otwarte pytania (`seed/prokombiznes/k3/zestawy.json`, `elementy[].do_potwierdzenia`) i karty ze statusem „do-sprawdzenia” użyte w zestawach:
   - `synology-dyski-rozszerzenia` (6 zestawów);
   - `gopos-all-in-one`;
   - `samsung-om`;
   - `insert-inspunkty-ksef`;
   - `numerki`.
2. **Każde pytanie rozstrzygasz ze źródłem oficjalnym** (WebSearch/WebFetch): strona lub PDF producenta, lista zgodności, baza wiedzy GoPOS / NFHotel / InsERT / Synology / Ubiquiti / TP-Link / Samsung / APC, PolCard / eService. Dla każdego jeden werdykt:
   - **potwierdzone** → wpis w `sprawdzone_zgodnosci` (status `potwierdzona`, źródło), usuń `do_potwierdzenia`;
   - **zmiana składu** → tylko na kartę, która jest w `katalog-k4.json`, np.:
     - kiosk i ekran KDS z listy urządzeń GoKiosk / GoKDS;
     - dyski z listy zgodności Synology dla NAS z zestawu;

     Zaktualizuj `el` / `zam` / `why` / `faq` w `zestawy-k4.json`;
   - **zapis uczciwy** → element działa bez integracji i treść mówi to wprost. Przykład dla terminala PolCard (9 pytań): „Terminal działa samodzielnie — kwotę wpisujesz na terminalu.” W zestawach GoPOS dopisz o terminalach z listy GoPOS tylko wtedy, gdy źródło GoPOS to mówi;
   - **nie da się bez dystrybutora** → zostaje `do_potwierdzenia`; dokładne pytanie i adresat do `docs/STAN.md`.
3. Karty „do-sprawdzenia” popraw albo zastąp. Zestaw nie jest „Gotowy” z niegotową kartą.
4. Wynik w `docs/zadania/zestawy-zgodnosci.md`: tabela zestaw · element · werdykt · źródło · cytat ≤ 15 słów · zmiana.
5. Testy Vitest: `bundleStatus` dla każdego zestawu po zmianach; żaden zestaw „Gotowe” nie zawiera karty „do-sprawdzenia”.
6. Zero cen, zero obietnic bez źródła, statusy marek z K4-FINAL §1. Status tylko „w przód” (`nextBundleStatus`).

### 9.2 PR B4-2 — `feat/biznes-zestawy-strona`
- **`/zestawy`:**
  - tylko „Gotowe” (niegotowe nie są linkowane ani w sitemap);
  - grupy z liczbą zestawów;
  - filtr po branży i poziomie (Mały / Średni / Duży);
  - karta: zdjęcie, nazwa, „dla kogo”, 3–4 elementy, „Dodaj zestaw do zapytania”;
  - liczby z bazy.
- **Karta zestawu:**
  - elementy z rolą i wariantem (bez przewijania w bok — B1);
  - „Możesz zamienić”, „Dlaczego taki zestaw”;
  - **źródła zgodności** jako dyskretne linki „Źródło ↗”, cel dotykowy ≥ 24 px;
  - FAQ akordeonem.
- **Branże:**
  - „Gotowe zestawy” bierze zestawy branży (gastronomia → kawiarnia, bistro, restauracja, food truck, bar);
  - siatka bez pustych miejsc (1 → karta szeroka, 2 → dwie kolumny);
  - usuń „Wkrótce: …” z `IndustrySections.tsx` (pokazujemy tylko aktywne branże).
- **Główna:** „Gotowy zestaw dla tej branży” w scalonym Planie (B3) zaczyna się pokazywać.
- e2e:
  - `/zestawy` (liczba kart = gotowe w bazie);
  - `/branze/gastronomia` (≥ 2 zestawy gastro, brak „Wkrótce”);
  - 360/390 bez przewijania w bok.

**Cel:** 23/23 „Gotowe”. Każdy zestaw, którego nie da się domknąć bez odpowiedzi dystrybutora, zostaje ukryty i jest na liście w `docs/STAN.md`.

---

## 10. Jakość podstron z audytu (sesja BIZ-3, PR-y 3–5) — `0611/AUDYT-PODSTRONY-0611.md`

Po D3-B i B2–B4, żeby nie poprawiać dwa razy.

### 10.1 PR B5-1 — `fix/biznes-alt-a11y`
- `alt` = „Marka Model” w kartach produktów. Dziś puste jest ok. 780 z ok. 960 zdjęć: 41 kategorii, `/oferta`, `/zestawy`, salony, `/gopos`, `/automaty-vendingowe`, `/ulga-…`, branże. Test: żadne zdjęcie w karcie produktu nie ma pustego `alt`.
- Cele dotykowe:
  - chipy wersji w karcie produktu ≥ 40 px (pojedyncze ≥ 44);
  - linki „Źródło: …” ≥ 24 px;
  - telefon i e-mail w wizytówce `/o-firmie`;
  - nazwy w tabeli salonu.
- Etykiety serii bez wersalików („ThinkPad T/X13” zamiast „THINKPAD T I X13”).
- Ciemny motyw: zdjęcia w hero kategorii bez białych kafli (tło studio w wersji ciemnej, MOBILE §4.7).

### 10.2 PR B5-2 — `feat/biznes-seo-podstrony`
- **Tytuły i opisy:**
  - pole SEO w panelu z licznikiem;
  - test: tytuł 30–60 znaków, opis 100–155;
  - poprawki: 34 za długie, 15 za krótkie, 61 opisów < 100 (propozycje w audycie P1-8).
- **JSON-LD:**
  - `BreadcrumbList` na 13 stronach z okruszkami;
  - `ItemList` w 41 kategoriach;
  - OG image dla `/aktualnosci` i `/mapa-strony`.
- `/konfigurator` w `sitemap.xml` i `/mapa-strony` (`siteLinks`).
- Sformułowania „czas reakcji ustalamy w umowie” (O firmie, opis meta `/opieka-it`) — tylko po akceptacji szefa (§13).

### 10.3 PR B5-3 — `refactor/biznes-bez-dubli` (duży → 2 PR-y piętrowo, jeśli > 400 linii)
- **Kategorie:** jeden blok pomocy (formularz z 3 krokami jako nagłówkiem). Karta boczna tylko tam, gdzie nie ma doboru.
- **Salony:** serwis i wdrożenie w jednym bloku, karta w hero skrócona do 2 linii, modele polecane bez powtórki.
- **GoPOS:**
  - lista modułów + konfigurator pakietu scalone (opis modułu po kliknięciu);
  - bez bloku powtarzającego H1;
  - na branży link do `/gopos` zamiast kroków.
- **Strony marek bez salonu (20):** jedno CTA na końcu (dziś na telefonie dłuższe niż na komputerze).
- **Karta produktu:**
  - bento nie powtarza wyróżników z hero;
  - kolejność `polecane` (akcesoria kasy przed routerem).
- Salony na telefonie ≤ ok. 6 000 px (MOBILE §7).

---

## 11. QA całości (sesja BIZ-3, ostatni PR)
1. Pełny pomiar skryptem audytu (`crawl.mjs` z paczki audytu: 121+ stron × 1440/390). Na serwerze dev ustaw `NODE_OPTIONS=--max-old-space-size=6144` — przy poprzednim pomiarze serwer padł na 4,2 GB.
2. Dokończ, czego audyt nie sprawdził:
   - Ctrl K, szuflada zapytania;
   - konfigurator do wyniku;
   - arkusze Filtry i Menu na telefonie;
   - `/konfigurator`, `/zapytanie`;
   - ciemny motyw wszystkich typów stron;
   - 39 linków spoza sitemap.
3. Lighthouse mobile na `pnpm build && pnpm start` (cel ≥ 90): `/`, `/oferta`, produkt, `/marki/apple`, `/kontakt`, `/plan-firmy`, `/agd-rtv-dla-firm`, `/dostawy-it-dla-firm`, `/zestawy`.
4. Raport do `docs/design/prokombiznes/0611/QA-WYNIK.md`. Potem `/wdrozenie staging` (STAN: treści do uzupełnienia w panelu, flagi §13).

---

## 12. Zasady i Definition of Done tej paczki
- **Rytuał każdej sesji:**
  - `git status`, `git fetch`, `docs/STAN.md` („W toku” → „Następny krok”);
  - gałęzie od `origin/develop`, PR-y piętrowo, każdy ≤ ~400 linii diffu;
  - najpierw test, który nie przechodzi (logika, tenant, formularze, parsery, podział dostaw, status zestawu).
- **Migracje:**
  - tylko przez `pnpm payload migrate:create`;
  - nowe pola = migracje dodające, jedyna usuwająca to W1;
  - przed `/pr` gałęzi z migracją: rebase na `origin/develop`, usuń własną migrację i `migrate:create` od nowa (`docs/sposob-pracy.md` → „Migracje z kilku folderów”).
- **Dane:**
  - treść w seedzie i panelu, nie na sztywno;
  - seed idempotentny, pola z paczki wygrywają, status tylko „w przód”;
  - teksty warunkowe (flagi §13) bez wpisu w panelu się nie pokazują.
- **Wygląd:**
  - prototyp 1:1, kolory i fonty tylko z tokenów;
  - jasny i ciemny;
  - 360 / 390 / 1024 / 1180 / 1400 / 1440 bez przewijania w bok;
  - MOBILE-APLIKACJA §4 dla każdego UI.
- **Ruch:** tylko `transform` / `opacity` / `clip-path`, wszystko wyłącza `prefers-reduced-motion`, ruch ciągły ma pauzę (WCAG 2.2.2), treść nie zależy od animacji (jest w HTML).
- **Dostępność:** axe 0, widoczny fokus, cele ≥ 44 px (gęste ≥ 40), `aria-current`, `aria-expanded`, okna bez H2 w drzewie do otwarcia.
- **SEO:** metadane, `sitemap.xml`, JSON-LD dla nowych stron; bez kopiowania tekstów między domenami.
- **Formularze:** Zod na serwerze, honeypot + minimalny czas + limit, zgoda z wersją klauzuli, `submitInquiry()`. Dane osobowe nigdy w logach.
- **Bez nowych zależności** (wszystko CSS + kilka obserwatorów). Jeśli konieczna — uzasadnienie w PR i pytanie do Krystiana.
- **Każdy PR:**
  - zielone `lint` / `typecheck` / `test` i e2e obszaru;
  - zrzuty 390 i 1440 (jasny i ciemny) obok prototypu w opisie;
  - `/przeglad` przy logice, formularzach, migracjach, tenantach lub diffie > 100 linii;
  - opis z werdyktem recenzenta i oceną każdej uwagi;
  - `gh pr view` + link.
- **Koniec sesji** (`/koniec-sesji`): STAN z gałęzią, scalonymi i otwartymi PR-ami, dokładnym następnym krokiem i rzeczami niedokończonymi. Pomysły spoza zakresu → „Pomysły na później”.

---

## 13. Otwarte decyzje (flagi w panelu — nie zgadujemy)

| # | Decyzja | Kto | Do czasu decyzji |
|---|---|---|---|
| 1 | Zaopatrzenie §0: odbiór starego 1 za 1 (AGD i IT), lista usług IT, „gwarancja na miejscu”, LG w GT, logo Whirlpool, marki w klasach | szef | flagi wyłączone, tekst się nie pokazuje |
| 2 | Opinie klientów na głównej (forma i zgody) | szef | slot wyłączony |
| 3 | Treść i termin pasa KSeF (źródło MF) | Krystian | pas pokazuje się tylko z terminem w panelu |
| 4 | Zdjęcia GoPOS z ludźmi (stock producenta) → zdjęcia urządzeń `k4-gopos-*` | Krystian | bez zmian (rekomendacja: podmienić) |
| 5 | 301 `/marki/gopos` → `/gopos`, `/marki/insert` → `/insert` | Krystian | bez zmian (rekomendacja: 301) |
| 6 | 26 pozycji „do-sprawdzenia” na listach, spoza sitemap | Krystian | bez zmian |
| 7 | „100+ klientów firmowych” (O firmie) | szef | `StatsStrip` z flagą, ukryte na produkcji |
| 8 | Linki: lista serwisów Posnet, wyszukiwarka partnerów InsERT, wizytówka Google; opis parkingu | Krystian | karty / odpowiedź ukryte, gdy puste |
| 9 | Dolny pasek telefonu: K4 czy wspólny (Zapytanie na środku) | Krystian | **rozstrzygnięte 08.11: wspólny** `TabBar` (Start · Oferta · Zapytanie · Kontakt · Menu; Szukaj = lupa w kapsule) |
| 10 | „Czas reakcji ustalamy w umowie” (O firmie, Opieka IT) | szef | bez zmian |
| 11 | Zestawy, których nie da się domknąć bez dystrybutora | Krystian | ukryte, pytania w STAN |

---

## 14. Prompty do wklejenia (jeden na dużą sesję + kontynuacja)

Każdy kolejny wieczór tej samej sesji: `/zadanie <SESJA> — kontynuacja wg STAN` (bez nowego planu).

### F — fundament (folder `prokom-web`)
```
/zadanie F — WhatsApp usunięty wszędzie (docs/zadania/prokombiznes-0611.md §5.1; plan jest w tmp/paczka-0611/PLAN-BUDOWY-0611.md, jeśli PR 0 sesji BIZ-1 jeszcze nie wszedł)
Folder fundamentu. Gałąź feat/wsp-bez-whatsapp od origin/develop. Decyzja D10 — zgoda na migrację usuwającą dane.
Najpierw test, który nie przechodzi (dane seeda bez whatsapp/wa.me + e2e /, /kontakt i kategoria każdej linii), potem schemat (SiteSettings, InstalacjeSettings, CompanyData, inne z grep), migracja usun-whatsapp, widok wszystkich linii, listForm, seedy i ich testy, generate:types. Kafle kontaktu po usunięciu bez pustych miejsc.
/przeglad (migracja) → /pr z notatką: foldery prokom-web-biznes, prokom-instal, prokom-web-software robią rebase i pnpm payload migrate. /koniec-sesji.
```

### BIZ-1 — porządek, nowa powłoka, Kontakt i O firmie (folder `prokom-web-biznes`)
```
/zadanie BIZ-1 — porządek, nowa powłoka Biznesu, Kontakt i O firmie (duża sesja; docs/zadania/prokombiznes-0611.md §3, §5.2, §5.3, §8.1, §8.2; wzorzec docs/design/prokombiznes/0611/prototyp-glowna.html)
Folder prokom-web-biznes. Paczka rozpakowana w tmp/paczka-0611/ (PR 0 przenosi ją do repo wg §3 — zacznij od przeczytania tmp/paczka-0611/PLAN-BUDOWY-0611.md w całości). Przeczytaj też diff PR #349 (Instalacje na powłoce wspólnej) — to wzór wpięcia.
Zrzuty „przed” raz na sesję: główna, /kontakt, /o-firmie, /ksef, /oferta/kasy-fiskalne, jedna kategoria, /zestawy/zestaw-szkola-siec, /opieka-it — 1440/1400/1180/1024/390, jasny i ciemny.
Najpierw JEDEN plan całości w trybie planowania (6 PR-ów, lista zastępowanych komponentów, dane mega menu, dostawca wyszukiwarki, sekcje Biznesu na Kontakcie i O firmie, pytania na końcu) — czekaj na akceptację. Potem PR po PR, piętrowo od origin/develop, każdy ≤ ~400 linii:
0. docs/biznes-paczka-0611 — §3 (pliki, INDEKS, ADR-017 „Rozstrzygnięcia 06.11”, STAN „Decyzje” D1–D18, prokombiznes.md §7.3). Bez recenzenta.
1. fix/biznes-twarde-zasady — §5.2 (ikony przez hardSpacesDeep, przewijanie zestawu szkolnego, zdanie 450 zł, dopisek ulgi, wpis Brother).
2. fix/biznes-telefon-tresc — §5.3 (D12: wzorce telefonu, phone.ts, FoldOnPhone z widocznym nagłówkiem, ListForm → karta pomocy, e2e biznes-telefon-tresc).
3. feat/biznes-powloka-wspolna — §8.1 pkt 1, 2, 4, 6, 7, 8 (pasek marki, kapsuła, szyna, stopka wspólna z akordeonem — D15, dolny pasek wg decyzji §13 #9, usunięcie starej ramy).
4. feat/biznes-mega-menu-szukaj — §8.1 pkt 3 i 5 (mega menu premium 1:1 z prototypem + e2e klawiatury; Ctrl K z akcjami, podglądem, literówkami i odmianami).
5. feat/biznes-kontakt-o-firmie — §8.2 (nowe strony na szablonach ContactPage/AboutPage z sekcjami Biznesu, odstępstwa D18, flagi §13 #7 i #8, usunięcie starych stron K4i, e2e formularza Inquiries + Mailpit).
WhatsApp usuwa sesja F (W1) — tu go nie ruszasz; po scaleniu W1 rebase. Nie zmieniasz src/components/shared ani lib/shared — brak → wpis w STAN „zamówienie dla F” i mały PR feat/wsp-<co>.
Test najpierw dla logiki. /przeglad przed /pr PR-ów 1–5. Na koniec każdego wieczoru /koniec-sesji.
```

### BIZ-2 — Zaopatrzenie i nowa strona główna
```
/zadanie BIZ-2 — Zaopatrzenie firm i strona główna po audycie (duża sesja; docs/zadania/prokombiznes-0611.md §6, §7; spec docs/design/prokombiznes/0611/ZAOPATRZENIE.md; audyt 0611/AUDYT-GLOWNA-0611.md; wzorce 0611/prototyp-zaopatrzenie.html i 0611/prototyp-glowna.html)
Folder prokom-web-biznes, warunek: BIZ-1 scalone. Zrzuty „przed” raz na sesję (główna, kategorie IT, karta produktu IT, branże, /konfigurator, /kontakt).
Najpierw JEDEN plan całości w trybie planowania (6 PR-ów, nowe pola panelu i migracje dodające, flagi §0 spec i §13 planu, pytania na końcu) — czekaj na akceptację. Potem PR po PR, piętrowo od origin/develop, każdy ≤ ~400 linii:
1. feat/biznes-zaopatrzenie-szablon — §6.1 (dane, czyste funkcje z testami najpierw: procurementTotals, deliverySplit, scheduleRows, offerRows, parseHandoff; ProcurementPage, konfigurator, podgląd oferty, harmonogram, formularz; strona AGD).
2. feat/biznes-zaopatrzenie-it — §6.2.
3. feat/biznes-glowna-zaopatrzenie-marki — §6.3 i wpięcia §6.4 (w mega menu i stopkę z BIZ-1).
4. feat/biznes-glowna-struktura — §7.1 i §7.2 B3-1 (kolejność, huby, Plan + Branże jako jedna sekcja, Opinie jako wyłączony slot).
5. feat/biznes-glowna-ksef-aktualnosci-kontakt — §7.2 B3-2.
6. fix/biznes-glowna-seo-a11y-ruch — §7.2 B3-3.
Jeśli zostanie wieczór: B4-1 (§9.1, badanie zestawów — dane bez UI) jako PR 7.
Każdy PR: zrzuty obok prototypu (390 i 1440, jasny i ciemny), 0 przewijania w bok, axe 0; Lighthouse ≥ 90 na build+start po PR 3 i PR 6. /przeglad przed /pr PR-ów 1, 3, 4, 5, 6. Na koniec każdego wieczoru /koniec-sesji.
```

### BIZ-3 — zestawy, jakość, QA
```
/zadanie BIZ-3 — zestawy, jakość podstron, QA (duża sesja; docs/zadania/prokombiznes-0611.md §9, §10, §11; audyt 0611/AUDYT-PODSTRONY-0611.md)
Folder prokom-web-biznes, warunek: BIZ-2 scalone. Sprawdź w STAN decyzje z §13 (#4, #5, #10) — co niepodjęte, zostaje za flagą.
Najpierw JEDEN plan całości w trybie planowania (6 PR-ów, lista 42 pytań zestawów, pytania na końcu) — czekaj na akceptację. Potem PR po PR, piętrowo od origin/develop:
1. docs/biznes-zestawy-zgodnosci — §9.1 (badanie ze źródłami oficjalnymi przez WebSearch/WebFetch, werdykty, dane k3/k4, docs/zadania/zestawy-zgodnosci.md, testy bundleStatus). Pomiń, jeśli zrobione w BIZ-2.
2. feat/biznes-zestawy-strona — §9.2 (nowa /zestawy, karta zestawu, branże bez „Wkrótce”, zestaw branży na głównej).
3. fix/biznes-alt-a11y — §10.1.
4. feat/biznes-seo-podstrony — §10.2.
5. refactor/biznes-bez-dubli — §10.3 (dwa PR-y, jeśli > 400 linii).
6. QA — §11: pełny pomiar (dev z NODE_OPTIONS=--max-old-space-size=6144), niesprawdzone obszary audytu, Lighthouse 9 stron, raport 0611/QA-WYNIK.md, checklista /wdrozenie staging (bez wdrażania bez mojej zgody).
Zero cen i obietnic bez źródła. /przeglad przed /pr PR-ów 1–5. Na koniec każdego wieczoru /koniec-sesji.
```
