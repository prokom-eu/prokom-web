# START TUTAJ — prokombiznes.pl K3 + K3.1 w Claude Code (instrukcja dla Krystiana, 25.10.2026)

Ten plik prowadzi Cię od folderu `Pulpit\Materialy-prokombiznes` do gotowej strony na stagingu. Robisz to na komputerze domowym, w repo `prokom-web`, jedna sesja Claude Code naraz.
Szczegóły dla Claude Code są w: `PRZEKAZANIE-K3.md` + `K3-KATALOG.md` (K3) oraz `PRZEKAZANIE-K31.md` + `K31-ZMIANY.md` (K3.1). Ten plik mówi **co Ty robisz i co sprawdzasz**.

---

## 0. Co jest w folderze i co idzie do repo

| Plik w `Materialy-prokombiznes` | Do repo? | Co z nim zrobić |
|---|---|---|
| `prokombiznes-k3.zip` | tak | Etap A — rozpakować w katalogu głównym repo |
| `prokombiznes-k3-zdjecia-1.zip`, `prokombiznes-k3-zdjecia-2.zip` | tak | Etap A — razem z `prokombiznes-k3.zip` (ścieżki się uzupełniają) |
| `prokombiznes-k31.zip` + `prokombiznes-k31-plansze.zip` | tak | razem z paczką K3 w sesji W (ścieżka skrócona, §3); drugi zip to plansze do podglądu (`k31/boards/`) — rozdzielone, bo jeden plik przekraczał limit kopiowania |
| `START-TUTAJ.md` (ten plik, kopia luzem) | — | jest też w paczce: `docs/design/prokombiznes/START-TUTAJ.md` |
| `MOBILE-APLIKACJA.md`, `INDEKS.md` | — | w paczce (`docs/design/prokombiznes/`): **telefon jak aplikacja — pełna specyfikacja** i spis wszystkich materiałów z kolejnością ważności |
| `AUDYT-K31.md` (kopia luzem) | — | audyt danych i wyglądu K3.1; w paczce: `docs/design/prokombiznes/AUDYT-K31.md` |
| `AUDYT-PRODUKCJA.md` (kopia luzem) | — | **audyt gotowości do produkcji** (co blokuje, co dodać/usunąć, sesja PROD, decyzje szefa); w paczce: `docs/design/prokombiznes/AUDYT-PRODUKCJA.md` |
| `K3-przeglad.xlsx`, `K31-przeglad.xlsx` | **nie** | Twoje listy: decyzje, zdjęcia do pobrania, filmy, pytania do szefa |
| `WEWNETRZNE-ceny-orientacyjne-k3.json` | **nigdy** | tylko do Twoich ofert, nie do repo i nie na stronę |
| `prokombiznes-k2-tresci.zip`, `katalog-v1/v2*.zip`, zipy ze zdjęciami producentów | **nie** | historia — K3 je zastępuje |

Zasada: rozpakowujesz **w katalogu głównym repo** (tam, gdzie `package.json`). Paczka sama trafia do `docs/design/prokombiznes/…` i `seed/prokombiznes/…`.

---

## 1. Przygotowanie (raz)

1. `git checkout develop && git pull` — czysty `develop`, bez niezacommitowanych zmian.
2. Uruchom lokalnie (`pnpm dev`, baza, Mailpit) i sprawdź, że strona działa jak po B11.
3. **Dane firmy w panelu** (blokery z audytu B11): PRO-KOM Tadeusz Wójciak, NIP 7352511447, ul. Orkana 16B, 34-700 Rabka-Zdrój (na Biznesie **tylko adres w Rabce**), pn–pt 9:00–17:00, 889 003 889 (oferty, serwis, WhatsApp), 18 267 65 11 (stacjonarny), `biznes@pro-kom.eu`. Bez tego staging nie ma sensu.
4. Jeśli **F1** (poprawki po audycie B11) nie jest jeszcze scalone — zrób F1 pierwsze (prompt w `AUDYT-B11.md`).

---

## 2. Rytuał każdej sesji (zawsze tak samo)

1. Nowa gałąź z aktualnego `develop` (nazwę podaje prompt).
2. W Claude Code wklejasz prompt sesji **w całości** (skąd — tabela w §3).
3. Claude Code pokazuje plan (maks. 15 linii) → czytasz → piszesz „ok” albo poprawiasz zakres.
4. Po pracy: Claude Code robi zrzuty Playwright i porównuje z wzorcem (`k3/screens/`, `k31/screens/`).
5. **Ty sprawdzasz** listę „Sprawdź” z §3 (w przeglądarce, jasny i ciemny motyw, 1440 px i 390 px).
6. `/przeglad` → `/koniec-sesji` → `/pr` → merge do `develop`.
7. Nowe pomysły w trakcie = **nowe zadanie**, nie „przy okazji” w tej sesji.

Gdy kod i wzorzec się różnią — **wygrywa wzorzec** (zrzut + plansza). Gdy dane w seed wyglądają źle — Claude Code ma to zgłosić w raporcie, **nie poprawiać na sztywno w kodzie**; poprawka idzie przez seed/panel.

---

## 3. Kolejność sesji — ścieżka skrócona (zalecana, 12 sesji)

Obie paczki wgrywasz i opisujesz w dokumentach naraz, a stronę produktu Claude Code buduje od razu jako „produkt 2.0” (bez budowania wersji K3 i przerabiania jej). Prompty są w trzech plikach — tabela mówi, który wkleić; przy sesjach łączonych wklejasz oba prompty jeden pod drugim.

Na start rozpakuj **wszystkie pięć zipów** w katalogu głównym repo: `prokombiznes-k3.zip`, `-k3-zdjecia-1.zip`, `-k3-zdjecia-2.zip`, `prokombiznes-k31.zip`, `prokombiznes-k31-plansze.zip`.

| # | Sesja | Prompt | Co robi | Sprawdź po sesji |
|---|---|---|---|---|
| 1 | **W** (wgranie) | `PRZEKAZANIE-K3.md` §5 „W-K3” **+** `PRZEKAZANIE-K31.md` §4 „W-K31” | obie paczki na gałęzi `docs/prokombiznes-k3`, bez kodu | PR tylko `docs/` i `seed/`; raport: 243 + 26 kart, 23 zestawy, 12 SVG planów, 46 zrzutów K3.1, zero kwot „zł” i zakazanych marek |
| 2 | **KD** (dokumenty) | „KD” (K3) **+** „KD31” (K3.1) | spec., ADR-012, plan sesji (już w kolejności z tej tabeli), cookies, STAN | PR ma tylko pliki `.md`; B7b oznaczone „zastąpione przez K31d” |
| 3 | **K3a** | `K3-KATALOG.md` §11 | model + import K3, 301 dla starych adresów, ukrycie usuniętych | panel: 243 karty; import 2× = te same liczby; stary adres produktu → 301 |
| 4 | **K31a** | `PRZEKAZANIE-K31.md` §4 | import K3.1: 26 kart (+91 zdjęć), serie, filmy, salony, GoPOS/InsERT, plany | 269 kart / 266 widocznych; 24 nowe karty z galerią; Lenovo 44 i Dell 34 — każda w jednej serii; 12 scen / 186 punktów; produkty z filmem zgodnie z raportem; podział 6 kart wielomodelowych (11 nowych „do sprawdzenia” — przejrzyj je, 5 starych adresów → 301) |
| 5 | **K31b** | `PRZEKAZANIE-K31.md` §4 „K31b” — dopisz: „to jest pierwsza wersja strony produktu po K3 — zbuduj ją od razu wg K31-ZMIANY §4; K3-KATALOG §5 (Wybierz wersję, FAQ, W zestawach) jest w niej zawarty” | produkt 2.0, tło „studio” wszędzie, stopka | ThinkBook 14, Posnet Ergo, ThinkPad X9 (galeria), ThinkPad P1 Gen 9 (bez zdjęcia → zastępnik); **nigdzie siatki za zdjęciem**; zero żądań do youtube.com przed „▶”; stopka jak `Web-*-1440` |
| 6 | **K3b′** | `K3-KATALOG.md` §11 „K3b” — dopisz: „bez strony produktu (jest z K31b)” | strony marek (szablon), kategorie z podkategoriami, wyszukiwarka | 2 marki zgodne z `k3/screens/Web-Marka*`; „laptop” w wyszukiwarce daje laptopy; podkategorie Komputerów mają własne adresy |
| 7 | **K31c** | `PRZEKAZANIE-K31.md` §4 | salony Lenovo i Dell, kategoria Laptopy z seriami | `/marki/lenovo`, `/marki/dell` (dział Akcesoria, seria Dell Plus); klik w serię filtruje; dobór w 3 pytaniach daje sensowną serię |
| 8 | **K3c** | `K3-KATALOG.md` §11 | gotowe zestawy | `/zestawy` i 2 zestawy; „Zapytaj o ten zestaw” → pozycje w zapytaniu |
| 9 | **K31d** | `PRZEKAZANIE-K31.md` §4 | Plan Twojej firmy 2.0 (+ sekcja na głównej) | `/plan-firmy` i główna: 12 scen; klik w urządzenie → popup (film po lewej, szczegóły po prawej), Esc/strzałki; telefon: arkusz z filmem; stary plan v20 zniknął; „Najczęściej wybierane”: Ergo, K10, D3 PRO, ThinkBook 14, ThinkCentre neo, PolCard, Thermal HX, Subiekt nexo |
| 10 | **K31e** | `PRZEKAZANIE-K31.md` §4 | GoPOS (hero 2.0), InsERT z InsPunktami, O firmie i Kontakt 2.0 | hero GoPOS jak wzorzec; pakiet z 3 modułami → 3 pozycje; kalkulator InsPunktów 40+30 → 70 / 840; „Który Subiekt” daje 123 / GT / nexo; `/o-firmie`, `/kontakt` jak wzorzec |
| 11 | **M1** | `K3-KATALOG.md` §11 „M1” **+** dopisek z `PRZEKAZANIE-K31.md` §4 | telefon jako aplikacja | 390 px vs `k3/screens/App-*` i `k31/screens/App-*`: dolny pasek, arkusze, przyklejone CTA, bez siatek, teksty z liczbami bez dziwnych odstępów; Kontakt — tylko adres w Rabce |
| 12 | **PROD** | `AUDYT-PRODUKCJA.md` §9 | strony prawne, klauzule, antyspam, status zapytań, analityka, nagłówki, mega menu, kreator → zestaw | wysłane zapytanie: mail w Mailpit + rekord „nowe”; strony prawne istnieją; nagłówki w odpowiedzi |
| 13 | **Staging** | `AUDYT-PRODUKCJA.md` §9 (lista kontrolna) | formularze i maile na prawdziwym SMTP, Lighthouse, oEmbed filmów, tryb ciemny, urządzenia | zapytanie dochodzi na biznes@ i do Ciebie; Lighthouse telefon ≥ 90; test Android + iPhone → akceptacja szefa → produkcja |

**Gdy brakuje czasu** — kolejność cięcia z `AUDYT-PRODUKCJA.md` §10: najpierw K31c (salony), potem K31e (GoPOS/InsERT zostają w wersji v20). Bez cięć: K3a, K31a, K31b, K3b′, K3c, K31d, M1, PROD.

(Pełna ścieżka z osobnymi W-K3/W-K31 i KD/KD31 też działa — prompty w plikach się nie zmieniają.)

---|---|---|---|---|
| 1 | **W-K3** | `PRZEKAZANIE-K3.md` §5 | wgranie paczki, bez kodu | PR zawiera tylko `docs/` i `seed/`; raport: 243 karty, 23 zestawy, 78 punktów, zero kwot „zł” i zakazanych marek |
| 2 | **KD** | `PRZEKAZANIE-K3.md` §5 | K3 w spec., ADR-012, planie sesji, STAN | PR ma tylko pliki `.md` |
| 3 | **K3a** | `K3-KATALOG.md` §11 | model + import, 301 dla starych adresów, ukrycie usuniętych | panel: 243 karty; import 2× daje te same liczby; stary adres produktu przekierowuje (301) |
| 4 | **K3b** | `K3-KATALOG.md` §11 | strona produktu, strony marek, kategorie z podkategoriami, wyszukiwarka | 3 dowolne produkty i 2 marki zgodne z `k3/screens/`; „laptop” w wyszukiwarce daje laptopy |
| 5 | **K3c** | `K3-KATALOG.md` §11 | gotowe zestawy | `/zestawy` i 2 zestawy; „Zapytaj o ten zestaw” → pozycje w zapytaniu |
| — | ~~B7b (K3)~~ | — | **pomiń** — zastępuje go K31d | — |

### Etap B — K3.1 (produkt 2.0, salony, plan z filmami, GoPOS/InsERT)
Po scaleniu K3c rozpakuj `prokombiznes-k31.zip` i `prokombiznes-k31-plansze.zip` w katalogu głównym repo.

| # | Sesja | Prompt | Co robi | Sprawdź po sesji |
|---|---|---|---|---|
| 6 | **W-K31** | `PRZEKAZANIE-K31.md` §4 | wgranie paczki K3.1, bez kodu | raport: 26 nowych kart, slugi nie kolidują z K3, 12 SVG planów, 46 zrzutów |
| 7 | **KD31** | `PRZEKAZANIE-K31.md` §4 | K3.1 w dokumentacji (spec., ADR-012, plan, cookies, STAN) | tylko `.md`; w polityce cookies szkic o YouTube |
| 8 | **K31a** | `PRZEKAZANIE-K31.md` §4 | import: 26 kart (+91 zdjęć), serie, filmy, salony, strony GoPOS/InsERT, plany | 269 kart / 266 widocznych; 24 nowe karty z galerią; każda karta Lenovo (44) i Dell (34) w jednej serii; 12 scen / 186 punktów; liczba produktów z filmem zgodna z raportem; podział 6 kart wielomodelowych (11 nowych „do sprawdzenia”, 5 × 301) |
| 9 | **K31b** | `PRZEKAZANIE-K31.md` §4 | produkt 2.0, tło „studio” wszędzie, stopka | ThinkBook 14, Posnet Ergo, ThinkPad X9 (galeria), ThinkPad P1 Gen 9 (bez zdjęcia → zastępnik, nigdy zepsuty obrazek); **nigdzie siatki za zdjęciem**; w narzędziach przeglądarki (Sieć) zero żądań do youtube.com przed kliknięciem „▶”; nowa stopka |
| 10 | **K31c** | `PRZEKAZANIE-K31.md` §4 | salony Lenovo i Dell, kategoria Laptopy z seriami | `/marki/lenovo`, `/marki/dell` (dział Akcesoria, seria Dell Plus); klik w serię filtruje; dobór w 3 pytaniach daje sensowną serię |
| 11 | **K31d** | `PRZEKAZANIE-K31.md` §4 | Plan Twojej firmy 2.0 + sekcja na głównej | `/plan-firmy` i strona główna: 12 scen; klik w urządzenie → popup (film po lewej, szczegóły po prawej), Esc/strzałki działają; telefon: arkusz z filmem na górze; stary plan v20 zniknął; „Najczęściej wybierane” = 8 pozycji z panelu |
| 12 | **K31e** | `PRZEKAZANIE-K31.md` §4 | GoPOS (hero 2.0), InsERT z InsPunktami, O firmie i Kontakt 2.0 | hero GoPOS jak `Web-GoPOS-1440` (scena urządzeń, klik w krok podświetla urządzenie); pakiet z 3 modułami → 3 pozycje; kalkulator InsPunktów 40+30 → 70 / 840; „Który Subiekt” daje 123 / GT / nexo; `/o-firmie` i `/kontakt` jak wzorzec, mapa z 9 miejscowościami, tylko Rabka i biznes@ |
| 13 | **M1** | `K3-KATALOG.md` §11 **+ dopisek** z `PRZEKAZANIE-K31.md` §4 | telefon jako aplikacja | telefon 390 px vs `k3/screens/App-*` i `k31/screens/App-*`: dolny pasek 5 zakładek, menu i filtry jako arkusze, przyklejone CTA, bez siatek, teksty typu „Pokaż 39 pozycji” bez dziwnych odstępów; **wszystkie 29 ekranów z `MOBILE-APLIKACJA.md` §3 (także O firmie, Opieka IT, branża, kreator, aktualności, wpis)**; na swoim telefonie: zero przewijania w bok, menu i filtry zamykane gestem w dół |
| 14 | **Staging** | `PRZEKAZANIE-K31.md` §3 pkt 10 | formularze, maile, Lighthouse, oEmbed filmów, tryb ciemny | wysłane zapytanie dochodzi mailem; Lighthouse telefon ≥ 90 na produkcie; tryb ciemny bez białych plam → akceptacja szefa → produkcja |

---

## 4. Jak obejrzeć wzorzec u siebie
```
cd docs/design/prokombiznes/k31/boards
python -m http.server 8765
```
Otwórz `http://localhost:8765/Web-Produkt.dc.html` (i inne `Web-*`), `Main.dc.html` (strona główna z Planem 2.0), `Aplikacja.dc.html` (klikalny telefon — okno 390 px), `App-*.dc.html`. Plansza K3: to samo w `k3/boards`. Na żywo (klikalnie, z filmami): artefakt „prokombiznes.pl · projekt K3.1”, wersja 122.

---

## 5. Poza kodem — do zrobienia równolegle

| Kto | Co | Gdzie jest lista |
|---|---|---|
| Krystian | zdjęcia 2 kart: ThinkPad P1 Gen 9, T14s 2-in-1 Gen 2 (pozostałe 24 są w paczce) → `seed/prokombiznes/k31/media/produkty/<slug>/` → ponowny import | `K31-przeglad.xlsx` → „Zdjęcia do pobrania” |
| Krystian | filmy dla pozycji bez filmu — dopisywać w panelu; decyzja o słabszych dopasowaniach | `K31-przeglad.xlsx` → „Filmy”, „Do decyzji” |
| Krystian | 6 kart K3.1 + 10 kart K3 „do sprawdzenia” — potwierdzić u dystrybutorów | `K31-przeglad.xlsx` → „Nowe karty”, `K3-przeglad.xlsx` |
| Krystian | 20 zestawów „do potwierdzenia listy zgodności” (kable szuflad, protokoły wag, PolCard + GoPOS) | `K3-przeglad.xlsx` |
| Szef | kolejność Biznes vs Gaming do 20.11; obietnice (oddzwonienie 60 min, kasa z fiskalizacją i szkoleniem, przegląd IT); status partnera GoPOS/InsERT; zakres opieki IT; cytat właściciela | `00-STAN-PROJEKTU.md` → „Do potwierdzenia przed publikacją”, `K3-przeglad.xlsx` → „Pytania do szefa” |
| Szef / Ty | polityka prywatności (akceptacja), realizacje 2–3 za zgodą klientów, prośba o opinie Google, wizytówka Google → prokombiznes.pl, proces obsługi zapytań (kto oddzwania w 60 min) | `AUDYT-PRODUKCJA.md` §5, §11 |
| W dniu publikacji | oś KSeF (ksef.podatki.gov.pl), fakty w Aktualnościach (kary KSeF, paragon z NIP, PUP), Polska Bezgotówkowa i ulga — warunki, test oEmbed filmów | `K31-ZMIANY.md` §12, `AUDYT-PRODUKCJA.md` §4 pkt 8–9 |

---

## 6. Gdy coś idzie nie tak
- Claude Code proponuje więcej niż prompt → „tylko zakres z promptu, resztę zapisz jako nowe zadanie”.
- Sesja się rozrosła → zakończ na tym, co działa (`/koniec-sesji`), resztę w następnej gałęzi.
- Import daje inne liczby niż w tabeli → stop, raport, nie idź dalej (zwykle seed nie wgrany w całości albo stara baza — `seed:biznes` od zera na kopii).
- Wygląd odbiega od wzorca → wskaż konkretny zrzut i sekcję (np. „`Web-Produkt-1440`, sekcja W skrócie — 5 kafli, pierwszy ciemny”).
