# START K4 — prokombiznes.pl, wersja finalna (instrukcja dla Krystiana, 30.10.2026)

Paczka K4 jest już w repo (PR `docs/prokombiznes-k4`, wgrany z czatu projektu). Nic nie rozpakowujesz. Po scaleniu PR-a robisz tylko sesje Claude Code z tabeli — prompty są w `PRZEKAZANIE-K4.md` §4.

## 1. Przed pierwszą sesją (raz)
1. Przejrzyj PR `docs/prokombiznes-k4` (same pliki `docs/`, `seed/`), scal po zielonym CI. Commity z czatu nie są podpisane Twoim kluczem — scalaj przez squash (GitHub podpisze commit scalenia).
2. W folderze Biznesu: `.\scripts\start.ps1` (pobierze `develop`).
3. Zerknij na wersję finalną w przeglądarce: `cd docs\design\prokombiznes\k4\boards` → `python -m http.server 8765` → `http://localhost:8765/Strona.dc.html` i `Aplikacja.dc.html` (okno 390 px). Lista widoków: `K4-FINAL.md` §9.

## 2. Rytuał sesji (bez zmian)
Nowa gałąź od `origin/develop` → prompt z `PRZEKAZANIE-K4.md` §4 w całości (+ dopiski z §6.2 planu i bloku K4) → plan maks. 15 linii → „ok” → praca → zrzuty vs plansza → **Ty sprawdzasz** listę „Sprawdź” niżej → `/przeglad` → `/koniec-sesji` → `/pr` → scalenie.

## 3. Sesje i co sprawdzasz po każdej

| # | Sesja | Sprawdź (przeglądarka, 1440 i 390, jasny i ciemny) |
|---|---|---|
| 1 | K4a-1 | panel: nowe karty (COMEX, Optivendi, Apple, Brother, HP, Logitech, Fellowes, Kobra…) ze zdjęciami; kategorie: Laptopy, Komputery, Monitory, Tablety, Telefony, Klawiatury…, Niszczarki; stary adres `/oferta/komputery-monitory/laptopy` przekierowuje |
| 2 | K4a-2 | panel: marki ze statusami (tylko Posnet, Elzab, GoPOS, InsERT, Optivendi, COMEX), salony w nowej kolekcji, plany i zestawy zaktualizowane |
| 3 | K4b | nagłówek, mega-menu (działy · kategorie · Na skróty), Ctrl K, szuflada zapytania z formularzem, stopka 6 kolumn, motyw zapamiętany |
| 4 | K4c | strona główna jak `Web-Start`: koło kręci się, miniatury proste; Szybki start 5; brak paska logo i „Ile numerów” |
| 5 | K4d | oferta: kolejność „Polecane”, filtry; kategoria Kasy/Niszczarki bez „Dobierz laptop”, okruszek bez powtórzenia |
| 6 | K4e | iPhone 17: kropki kolorów; usługa „Przegląd kasy”: kafel usługi; HP: „Oryginalne tonery i tusze HP na zapas” |
| 7–8 | K4f-1, K4f-2 | `/marki`; każdy salon jak `Web-Salon-*`; Niszczarki jako jeden salon Fellowes + Kobra |
| 9 | K31d′ | plan: 12 scen, popup z filmem, lista pod planem |
| 10 | K4g | `/konfigurator`: 3 pytania i wynik; link `?kr=gastro|nowa|2||dowozy:1` |
| 11 | K4h | GoPOS i InsERT jak wzorzec |
| 12 | K4i | Opieka IT (bez kalkulatora i „abonamentu”), O firmie, Kontakt (formularz działa → Mailpit) |
| 13 | K4j | `/automaty-vendingowe`, `/ksef` (+ wersja po 2027), `/ulga-na-kase-fiskalna` |
| 14 | M1′ | telefon jak aplikacja na każdej trasie; salony z karuzelami |
| 15 | PROD′ | zapytanie → mail + rekord „nowe”; nagłówki bezpieczeństwa |
| 16 | QA-K4 | raport zgodności — 0 krytycznych |
| 17 | Staging | Android + iPhone, mail na biznes@, Lighthouse ≥ 90 → akceptacja szefa |

## 4. Poza kodem (równolegle)
`K4-FINAL.md` §10 — opinie, zdjęcia, model Opieki IT, źródła wpisów, EuroCert, gwarancje, prawa do zdjęć.
