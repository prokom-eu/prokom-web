# prokombiznes.pl — pełny audyt i plan do produkcji (12.11.2026)

Ten plik wklejasz do repo jako `docs/design/prokombiznes/0611/PRODUKCJA-BIZNES-1211.md`; robi to sesja 1 w pierwszym PR. Każda kolejna sesja zaczyna od jego przeczytania.

- Część I to audyt: co jest źle i dlaczego.
- Część II to kolejność sesji.
- Część III to prompty do wklejenia, po jednym na sesję (5 dużych sesji, decyzja 12.11).
- Część IV to lista „gotowe do produkcji”, którą trzeba odhaczyć przed pierwszym wdrożeniem.

---

# CZĘŚĆ I — AUDYT

Stan: `develop` 9fb8651, po PREMIUM-1011 (#500–#510). Sprawdzone 10–12.11 na biznes.localhost (port 3000 i 3001):
- rendering 1440 w przeglądarce;
- pomiar 20 salonów;
- dane całego katalogu z paczki (`katalog-k4.json`, `salony-k4.json`, `media-produkty-v2.json`, `zestawy-k4.json`);
- crawl 533 adresów z 10.11.

**Niesprawdzone w tej rundzie:** telefon 390 i wybrane karty produktów na żywo. Lokalny serwer przestał odpowiadać w trakcie. Robi to sesja 5 (dawne F), skryptami, na `build + start`.

## P0 — sekcje niewidoczne (puste przestrzenie)
- **Objaw:** puste białe pola na GoPOS, InsERT, Opiece IT i Automatach (zrzut Krystiana 12.11, pod „GoPOS w liczbach”).
- **Przyczyna:**
  - reguła `src/styles/motion.css:486` `@media (prefers-reduced-motion: no-preference) { [data-line='biznes'] [data-rail-label] { opacity: 0; translate: -6px 0 } }` jest przeznaczona dla podpisów bocznej szyny (pojawiają się po najechaniu na `nav`);
  - od #366 (08.11) `src/sites/biznes/blocks/BzSection/ui.tsx:112` daje **każdej sekcji K4 z kotwicą i nagłówkiem** atrybut `data-rail-label`;
  - reguła ukrywa więc całe sekcje, bez końca.
- **Zmierzone na `/gopos`:** opacity 0 mają „Twój lokal”, „Moduły GoPOS”, „Gotowe zestawy”, „Konfigurator pakietu”, „Filmy GoPOS”.
- **Z danych seeda (`k4Pages.ts`, sekcje z `anchor`):**
  - InsERT: `ktory`, `ksef`, `inspunkty`;
  - Opieka IT: `przeglad`, `zakres`, `przeglad-it`;
  - Automaty: `co`.
- **Zasięg:** staging od 08.11. Produkcji Biznesu nie ma.
- **Dlaczego nie złapały tego testy:** `porownaj-tresc`, smoke i e2e liczą H2 w HTML, a nie to, co widać. Moje zrzuty 10.11 wymuszały widoczność, a puste miejsca uznałem za błąd pomiaru. Nowy obowiązkowy test: **widoczność** po przewinięciu.

## 1. Produkty (411 gotowych kart, 11 „do sprawdzenia”)
Każda słabość karty przenosi się na salony, zestawy, kategorie, Ctrl K i główną.

| Obszar | Stan (dane z paczki) | Wymóg „gotowe do produkcji” |
|---|---|---|
| Zdjęcia | 144 karty bez galerii, 160 z 1 zdjęciem, 37 z 2, tylko 70 z ≥ 3. 249 z 567 plików źródłowych < 500 px szerokości | ≥ 3 ujęcia (przód, bok/porty, detal lub w użyciu bez ludzi), ≥ 1200 px, wycięte tło, alt „Marka Model – ujęcie” |
| Parametry | mediana 12, p10 8, 69 kart < 10. Przykład: Kyocera TASKalfa 2320 — 9, bez wymiarów, wagi, pamięci, interfejsów i panelu | komplet kluczy obowiązkowych kategorii (sesja A) |
| Wersje | „model z tej samej serii (wspólna karta katalogowa producenta)” zamiast różnicy (TASKalfa 2020) | tabela różnic z parametrów |
| Opis | 303 karty < 1 000 znaków, 102 < 800 | ≥ 1 000 znaków: dla kogo → co dostajesz → jak wdrażamy / co robimy przy zakupie |
| FAQ | 121 kart < 4 | ≥ 4, pytania klienta, odpowiedzi z faktów |
| „Do tego zwykle dobierają” | 333 karty < 3. Kyocera: 2 granatowe kafle-zaślepki „USŁUGA PRO-KOM”, brak tonera i podajnika | ≥ 3: eksploatacja/akcesoria z katalogu + usługa jako jasny kafel |
| „W skrócie” | każdy kafel z tą samą ikoną gwiazdki, wartości dublują parametry | ikona według rodzaju parametru, bez powtórzeń z hero |
| Film | 301 kart bez filmu | film producenta, gdzie istnieje |
| Źródła | 17 usług bez `zrodla` (dopuszczalne) | usługi: fakty z paczki, bez źródeł zewnętrznych |
| Status | 11 kart „do-sprawdzenia” (poza mapą, `noindex`) | rozstrzygnąć albo zostawić ukryte, lista w STAN |

## 2. Salony marek (20)
- **Jedna karta zamiast modeli.** Na salonie każdy model pokazuje to samo zdjęcie i ten sam alt, a „Szczegóły” prowadzi w to samo miejsce:
  - PolCard: 5 terminali → `pol`, 7 × to samo zdjęcie `pol-01` i alt „Terminal płatniczy PolCard”;
  - ESET: 5 pakietów → `eset`;
  - Microsoft: 4 plany → `microsoft-365-business`;
  - EuroCert: 4 → `euro` (+2 × `piecz`).
- **Hero PolCard:** zdjęcie terminala z białym prostokątem na granacie.
- **Kafle „Która…?”:** `im` puste w 136 z 141 kafli, zdjęcie małe na środku dużej płyty.
- **Małe salony** (PolCard, ESET, EuroCert, Microsoft, Samsung, Avtek, Sharp/NEC; 3 000–4 600 znaków):
  - brak tabeli porównania (PolCard ma 6 modeli i nie ma tabeli);
  - brak „Wszystko w ofercie”;
  - część bez serwisu lub wdrożenia.
- **Duże salony** (Posnet, Elzab, Sunmi, Lenovo, Dell, Brother, Druk, Sieć, NAS, COMEX, Logitech, Niszczarki, Apple) mają pełną treść. Poprawią je zdjęcia i parametry z §1.

## 3. GoPOS
1. **P0** (pięć sekcji niewidocznych).
2. Zakładka „Restauracja” w „Ustawiony pod to, jak pracujesz” powtarza H1 słowo w słowo. To powrót przez cofnięcie #486.
3. H1 ma 4 wiersze („GoPOS dla gastronomii: sala, kuchnia i dowozy w jednym systemie”). Wzorzec K31 §13.1: „Sala, kuchnia i dowozy. Jeden system.”. Frazy kluczowe mogą zostać w tytule SEO i w pigułce.
4. Brak prawdziwych ekranów GoPOS poza hero: panelu, raportów, GoPOS Now w telefonie, KDS, E-Menu. „Lokal w telefonie” jest bez telefonu, „Faktury do KSeF” bez dokumentu.
5. Rytm: liczby → 3 karty KSeF → … → wdrożenie → integracje to białe kafle z samym tekstem.
6. Tabela Basic / Pro / Unlimited jest schowana pod przyciskiem.
7. Integracje to same chipy tekstowe, kroki wdrożenia to małe karty bez osi.

## 4. InsERT
1. **P0** („Trzy pytania”, KSeF, InsPunkty niewidoczne).
2. Brak zrzutów ekranu programów (Subiekt nexo, GT, Rachmistrz, Rewizor, Gratyfikant).
3. „Wszystkie programy i usługi”: karty z jednym zdaniem, bez pudełka i punktów.
4. „Licencja to dopiero początek”: 6 kart bez ikon.
5. „Masz już program InsERT?”: na końcu tylko telefon, brak oferty opieki nad programem.
6. Pas liczb biały bez ikon, taki sam jak na GoPOS. Pudełka w hero małe, dużo pustego granatu.

## 5. Opieka IT, O firmie, Kontakt, główna, zestawy
- **Opieka IT:** P0 (3 sekcje). Poza tym zgodna z planem 10.11 (#509).
- **O firmie i Kontakt:** zgodne z PREMIUM-1011 (#502, #504). Otwarte:
  - link do wizytówki Google: karta „Opinie Google” ukryta, `TODO(krystian)`;
  - „100+ klientów” z flagą szefa: na produkcji ukryte;
  - sekcja `#formularz` bez `aria-labelledby` (strefa wspólna).
- **Główna:** po #510 w porządku. Do sprawdzenia w sesji 5: telefon.
- **Zestawy:** 20/23 gotowe. 3 czekają na dystrybutorów (elzAPP/Zebra, Dibal G-325, kiosk GoKiosk), są ukryte poprawnie.

## 6. Produkcja — otwarte rzeczy spoza wyglądu (z `docs/STAN.md`)
- **Strony prawne:**
  - polityka prywatności wymienia hosting Seohost, a serwer to webh.pl — poprawić;
  - `/dostepnosc` (~1 000 znaków) i `/cookies` krótkie — uzupełnić wg stanu strony;
  - [prawnik] akceptacja.
- **Panel produkcji:** tytuły SEO stron z `pageSeo.ts` (seed na produkcji nie działa — treść produkcji = kopia stagingu, §3a runbooka).
- **Staging:** po każdej zmianie layoutu stron w seedzie `ZAMIEN_STRONY=…` + `porownaj-tresc` + (nowy) test widoczności.
- **Infrastruktura:**
  - certyfikat `prokom-prod --expand` o `prokombiznes.pl`, `www`;
  - `PROD_SITE_HOSTS` / `PROD_WWW_HOSTS`, `prod-content.sh biznes` (pierwszy raz) albo §3a „kolejna linia”;
  - cron kopii, Better Stack, Search Console (TXT najpierw w `docs/dns.md`), Umami tylko po akapicie w polityce;
  - Nginx `snippets/` po wdrożeniach stagingu (runbook §0).
- **Stara strona prokombiznes.pl (jeśli istnieje pod domeną):** mapa przekierowań 301 starych adresów → nowe (otwarte §13 #5). Bez tego tracimy pozycje w Google.
- **Akceptacja szefa w Asanie** przed produkcją (zasada repo).

---

# CZĘŚĆ II — KOLEJNOŚĆ SESJI (folder `prokom-web-biznes`, po kolei)

**Decyzja Krystiana 12.11:** pracujemy w większych sesjach. Pierwotne sesje 0, A–G i 8 partii E połączono w **5 sesji**. W nawiasach podano dawne litery, bo Część I odwołuje się do nich.

| # | Sesja | Łączy | PR-y (piętrowo) | Zależy od | Wynik |
|---|---|---|---|---|---|
| 1 | WIDOCZNOSC-GOPOS-INSERT | 0 + D | 4 | — | sekcje widoczne, test widoczności, zrzuty pełnych stron, GoPOS i InsERT gotowe do produkcji |
| 2 | KATALOG-KARTA-SALONY | A + B + C | 5–6 | — (najlepiej po 1) | karty modeli, obowiązkowe parametry, lista zdjęć, szablon karty premium, kafle salonów, 7 małych salonów pełnych |
| 3 | KATALOG-DANE-2a | E, partie 1–4 | 4 | 2 (co najmniej PR 2) | zdjęcia, opisy, FAQ, „dobierają”, filmy: kasy/fiskalne/terminale, POS/kioski/skanery/wagi, komputery, MFP |
| 4 | KATALOG-DANE-2b | E, partie 5–8 | 4 | 2 | to samo: sieć/NAS/serwery/UPS, biuro/AV, vending, programy/usługi/Microsoft/ESET/EuroCert |
| 5 | QA-PRZED-PRODUKCJA | F + G | 3–5 | 1–4 | QA telefonu i 30 kart, poprawki P0/P1, strony prawne, 301, runbook „Biznes”, staging zielony, checklista IV |

**Zgoda szefa na materiały producentów** (zdjęcia, zrzuty programów, filmy) jest od 12.11. Źródło każdego pliku zapisujemy w danych.

**Dlaczego tak połączone:**
- **1 = 0 + D:** dotyczą tych samych stron (GoPOS, InsERT). Test widoczności z pierwszego PR od razu pilnuje zmian w kolejnych. D zależało tylko od 0.
- **2 = A + B + C:** to jeden łańcuch dane → szablon → salony, na tych samych plikach (`katalog-k4.json`, `salony-k4.json`, karta produktu). Rozdzielony wymagałby trzech wczytań tego samego kontekstu. Kolejność w sesji nadal obowiązuje: najpierw dane, potem szablon, żeby szablon nie powstał pod puste pola.
- **3 i 4 = E:** po 4 partie na sesję. Karty z głównej, salonów i zestawów idą najpierw (sesja 3).
- **5 = F + G:** G zależało tylko od F. Kroki na stagingu są ostatnie i tylko za zgodą.

**Zasady dużej sesji:**
- PR-y idą piętrowo: każda gałąź od poprzedniej, `/pr` po każdej. Krystian scala je w trakcie sesji. Force push jest zablokowany, więc po rebase gałąź dostaje sufiks `-1`.
- `/przeglad` przy każdym PR z logiką (`requiredSpecs.ts`, `related.ts`, testy progów, formularze), w pozostałych przypadkach raz na koniec sesji na całym stosie.
- Każdy PR z UI przechodzi e2e `biznes-widocznosc` i `scripts/zrzuty-pelne.mjs` (oba powstają w PR 1 sesji 1).
- Lokalnie: lint, typecheck, unit i e2e zmienionego obszaru. Pełne e2e i build w CI.
- Diff powyżej ~400 linii → dodatkowy PR piętrowy w tej samej sesji, bez rytuału startu i końca.
- Sesja urwana w połowie: `/koniec-sesji` zapisuje w STAN ostatni scalony i ostatni otwarty PR. Następna sesja wkleja ten sam prompt i rusza od następnego punktu.
- Biznes zostaje w jednym folderze, więc sesje idą po kolei. Sesja 1 nie zależy od 2, więc w razie potrzeby można je zamienić miejscami.

---

# CZĘŚĆ III — PROMPTY

Każdy prompt wklejasz do nowej sesji Claude Code w folderze `prokom-web-biznes`. Wspólne zasady są w CLAUDE.md, tutaj w skrócie:
- zero cen, statusy z K4-FINAL §1, bez zdjęć ludzi, bez WhatsAppa, kontakt tylko z panelu;
- fakty tylko ze źródeł producenta (WebFetch), z linkiem i datą w „Skąd są te informacje”;
- test najpierw dla logiki;
- zrzuty przed/po 1440 i 390, jasny i ciemny, MOBILE-APLIKACJA §4 jako DoD;
- /przeglad przed /pr (zasady dużej sesji wyżej);
- seed idempotentny, migracje tylko dodające;
- **nowa reguła od 12.11: każdy PR z UI przechodzi `scripts/zrzuty-pelne.mjs` i e2e `biznes-widocznosc` (z sesji 1).**

## Sesja 1 — WIDOCZNOSC-GOPOS-INSERT (dawne 0 + D)
```
/zadanie WIDOCZNOSC-GOPOS-INSERT — sekcje K4 widoczne + GoPOS i InsERT do poziomu produkcji (PRODUKCJA-BIZNES-1211 Część I P0, §3–§4). Duża sesja: 4 PR-y piętrowo, każdy z /pr; Krystian scala w trakcie. Zgoda szefa na materiały producentów jest — źródło każdego pliku w danych Media.

1. fix/biznes-sekcje-widoczne (od origin/develop)
   Skopiuj tmp/PRODUKCJA-BIZNES-1211.md do docs/design/prokombiznes/0611/ w tym PR.
   Przyczyna: src/styles/motion.css:486 `[data-line='biznes'] [data-rail-label] { opacity: 0 }` (podpisy bocznej szyny) trafia w sekcje K4, bo od #366 src/sites/biznes/blocks/BzSection/ui.tsx:112 daje sekcji `data-rail-label`. Niewidoczne: GoPOS (lokal, moduły, zestawy, pakiet, filmy), InsERT (ktory, ksef, inspunkty), Opieka IT (przeglad, zakres, przeglad-it), Automaty (co).
   a) Najpierw test, który nie przechodzi — e2e `tests/e2e/biznes-widocznosc.spec.ts`, bez reduced motion, 1440 i 390:
      /, /gopos, /insert, /opieka-it, /automaty-vendingowe, /ksef, /ulga-na-kase-fiskalna, /o-firmie, /kontakt, /zestawy, /zestawy/<gotowy>, /marki/posnet, /marki/polcard, /oferta, /oferta/kasy-fiskalne, /produkt/posnet-ergo-online, /agd-rtv-dla-firm, /dostawy-it-dla-firm, /branze/gastronomia, /aktualnosci.
      Dla każdej strony: przewijaj jak użytkownik (krokami po wysokości okna), dla każdego `main section`, `[data-reveal]` i dziecka `[data-reveal-cards]` po wejściu w widok i 1 s oczekiwania: computed opacity ≥ 0.99, visibility visible, element nie poza ekranem przez translate. Błąd wypisuje stronę, sekcję (id/aria-label) i regułę.
   b) Poprawka: reguły szyny w motion.css zawężone do szyny (`[data-rail-box]` / `nav[aria-label…]`). Sekcja zostaje z `data-rail-label` (czyta go SectionRail). Przejrzyj cały CSS (src/styles, src/sites/*/style) pod kątem selektorów atrybutów, które mogą trafić w treść (`[data-rail-*]`, `[data-reveal*]`, `[data-surface]`, `[data-line] [data-*]`) — tabela w opisie PR: selektor → gdzie trafia → czy zamierzone.
   c) `scripts/zrzuty-pelne.mjs [origin] [--widths=1440,390] [--themes=light,dark]`: Playwright, przewijanie jak użytkownik (bez wymuszania widoczności), zrzut pełnej strony dla listy z pkt a → tmp/zrzuty-pelne/index.html (miniatury, link do pełnego). Dopisz do docs/jakosc.md jako obowiązkowe przed PR z UI.
   d) Staging: do `scripts/porownaj-tresc.mjs` (albo smoke z SMOKE_CONTENT=1) dodaj tryb `--widocznosc` (Playwright przez login stagingu) — sekcje z opacity 0 po przewinięciu = błąd. Runbook §2b: obowiązkowo po każdym imporcie treści.
   e) /przeglad (CSS + test), /pr. W opisie: zrzuty /gopos, /insert, /opieka-it przed/po (1440, 390).

2. fix/biznes-gopos-h1 (od 1)
   - H1 wizualnie „Sala, kuchnia i dowozy. Jeden system.” (K31 §13.1, drugi wiersz akcentem), „GoPOS dla gastronomii” w pigułce, frazy kluczowe w tytule SEO i lead;
   - zakładka „Restauracja” w „Ustawiony pod to, jak pracujesz” nie powtarza H1 (nazwa lokalu + własne zdanie z danych `seg`);
   - test: tekst H1 występuje na stronie dokładnie raz.

3. feat/biznes-gopos-ekrany (od 2)
   - prawdziwe ekrany z materiałów GoPOS (gopos.pl, kanał producenta): panel/raport, GoPOS Now w telefonie, KDS, E-Menu, GoHub — w kartach „Lokal w telefonie” (makieta telefonu z ekranem), „Faktury do KSeF” (dokument/podgląd), „Cały lokal” (ekran wybranego obszaru);
   - tabela modułów Basic / Pro / Unlimited (bez cen) widoczna na stronie (z danych `ext`/pakietów), telefon = karty;
   - rytm: pas liczb z ikonami (albo na granacie), integracje jako kafle z ikoną kategorii i liczbą, wdrożenie jako oś z numerami — zasada: nie więcej niż 2 sekcje „białe kafle z tekstem” pod rząd (sprawdź w opisie PR listą sekcji z tłem).

4. feat/biznes-insert-ekrany (od 3)
   - nowa sekcja „Zobacz program w działaniu”: przełącznik programów (Subiekt nexo, Subiekt GT, Rachmistrz, Rewizor, Gratyfikant) — zrzut z materiałów InsERT + 3 punkty + „Dodaj do zapytania”;
   - „Wszystkie programy i usługi”: karta z pudełkiem, „dla kogo” i 3 punktami z danych (`fam`, `lines`, `all`);
   - „Licencja to dopiero początek”: ikony;
   - „Masz już program InsERT?” → sekcja „Opieka nad programem”: aktualizacje i odnowienia, przeniesienie danych, pomoc zdalna, KSeF w programie, przejęcie opieki od innego partnera + CTA z tematem formularza (?temat=);
   - hero: pudełka większe, mniej pustego granatu (plansza k4/screens/Web-insert), plakietki partnera bez zasłaniania;
   - pas liczb jak na GoPOS (ikony).

PR-y 2–4: e2e widoczności zielony, zrzuty-pelne 1440/390 jasny/ciemny w opisie; /przeglad na stosie 2–4 przed ostatnim /pr.
Koniec sesji: w STAN `ZAMIEN_STRONY=gopos,insert,opieka-it,automaty-vendingowe` na stagingu (za zgodą Krystiana).
```

## Sesja 2 — KATALOG-KARTA-SALONY (dawne A + B + C)
```
/zadanie KATALOG-KARTA-SALONY — karty modeli, obowiązkowe parametry, lista zdjęć, szablon karty premium, małe salony (PRODUKCJA-BIZNES-1211 §1–§2). Duża sesja: 5–6 PR-ów piętrowo, każdy z /pr; Krystian scala w trakcie. Kolejność obowiązkowa: dane → szablon → salony. Zgoda szefa na materiały producentów jest.

1. feat/biznes-karty-modeli (od origin/develop) — osobne karty zamiast zbiorczych:
   - PolCard: każdy terminal z kafli salonu osobno (Ingenico Move 2500, Move 3500, Axium DX8000, Axium DX4000 Portable, Desk 3200 + Desk 1500); PolCard Go zostaje.
   - ESET, Microsoft 365, EuroCert: każdy pakiet / plan / produkt, który salon pokazuje w kaflach planu, osobno — nazwy i zakres tylko z oficjalnych stron (eset.com/pl, microsoft.com/pl-pl, eurocert.pl).
   - Każda nowa karta: opis ≥ 1 000 znaków (dla kogo → co dostajesz → jak wdrażamy), parametry obowiązkowe (pkt 2), FAQ ≥ 4, „polecane” ≥ 3, źródła z datą, zdjęcia producenta (źródło w media-produkty-v2.json); bez zdjęcia → czytelny kafel produktu, nigdy zdjęcie innego modelu.
   - Stara karta zbiorcza zostaje jako karta rodziny: krótki wstęp + kafle modeli z linkami (bez 404, bez łamania zestawów). Zestawy i „polecane” wskazujące kartę zbiorczą → podmień na konkretny model, gdy skład zestawu to rozstrzyga (zgodność ze źródłem z docs/zadania/zestawy-zgodnosci.md), inaczej zostaw rodzinę i wpisz do STAN.
   - salony-k4.json: kafle „Która…?” wskazują nowe karty; pole `im` wypełnione zdjęciem modelu we WSZYSTKICH 20 salonach (dziś puste w 136/141).
   - Testy: w żadnym salonie dwa kafle planu nie prowadzą do tej samej karty; każdy kafel planu ma zdjęcie albo jawny wyjątek z powodem.

2. feat/biznes-parametry-kategorii (od 1):
   - `src/lib/biznes/requiredSpecs.ts` — obowiązkowe klucze dla każdej kategorii katalogu (MFP i drukarki, laptopy, komputery, monitory, serwery, NAS, sieć, kasy, drukarki fiskalne, terminale, stanowiska POS, kioski/KDS, skanery i etykiety, wagi, niszczarki, UPS, tablety/telefony, AV, vending, akcesoria; programy i usługi osobne zestawy kluczy). Np. MFP: typ, format, kolor, prędkość A4, rozdzielczość druku, skanowanie, podajnik, dupleks, pamięć/dysk, panel, interfejsy, obciążenie miesięczne, papier (pojemność), wymiary, waga, zużycie energii, eksploatacja (wydajność tonera).
   - Uzupełnij wartości w seed/prokombiznes/k4/katalog-k4.json ze stron/PDF producenta, każda karta z linkiem w `zrodla` (+ data `sprawdzono`). Nie da się ustalić → docs/zadania/parametry-braki.md (slug, klucz, gdzie szukano), bez zgadywania. Zakres w tej sesji: karty z głównej, salonów i zestawów; reszta kategoriami w sesjach 3–4.
   - „Czym różnią się wersje”: różnice z parametrów (np. TASKalfa 2020 vs 2320 — prędkość), zakaz tekstów typu „wspólna karta katalogowa”.
   - Test: każda gotowa karta ma wszystkie obowiązkowe klucze kategorii albo jest na liście wyjątków z powodem; żadna `warianty_opis.roznica` nie zawiera fraz-zaślepek.
   - /przeglad po tym PR (logika).

3. docs/biznes-zdjecia-lista (od 2):
   - `scripts/zdjecia-braki.mjs` — dla każdej gotowej karty: liczba zdjęć, szerokość oryginału, przezroczystość/białe tło (sharp z projektu).
   - `docs/zadania/zdjecia-do-pozyskania.md`, kolejność: karty z głównej → salonów → zestawów → reszta; kolumny: slug, jest, brakuje, < 1200 px, adres materiałów producenta (media/press kit), uwagi.

4. feat/biznes-karta-premium (od 3):
   - Galeria: miniatury pod zdjęciem przy ≥ 2 zdjęciach, powiększenie w dialogu (strzałki, Esc, focus trap, licznik „2 / 5”), zdjęcia na białej płycie z tokenów; przy 1 zdjęciu brak paska miniatur i brak pustego miejsca. Telefon: przewijanie palcem z kropkami.
   - „W skrócie”: mapa klucz parametru → ikona z istniejącego zestawu ikon (bez nowej biblioteki); wartości nie powtarzają 3 wyróżników z hero; < 3 sensownych wartości → sekcja węższa albo pominięta.
   - „Czym różnią się wersje”: tabela (wiersz = parametr różniący, kolumna = wersja), telefon = karty; pokazuj tylko parametry, które się różnią.
   - „Do tego zwykle dobierają”: `src/lib/biznes/related.ts` (+ test najpierw): najpierw `polecane` z danych, dopełnienie do min. 3: eksploatacja → akcesoria tej marki/kategorii → zestaw z tą kartą → usługa kategorii. Usługa jako jasny kafel z ikoną, nazwą i 1 zdaniem — koniec granatowych zaślepek „USŁUGA PRO-KOM”.
   - „Skąd są te informacje”: data sprawdzenia przy każdym źródle, link otwiera się w nowej karcie z opisem dostępnym.
   - Kafle salonu „Która…?”: zdjęcie z `im` na całą płytę (object-contain, margines ~8%); hero salonu — zdjęcie na białej płycie albo wycięte, nigdy biały prostokąt na granacie (PolCard).
   - Karta rodziny (z pkt 1): siatka modeli z kluczowymi parametrami i „Porównaj”.
   - Diff > ~400 linii → kafle salonu i karta rodziny osobno jako feat/biznes-salon-kafle (od 4).
   - e2e: karta z ≥ 3 zdjęciami — miniatury i dialog z klawiatury; karta z 1 zdjęciem — brak paska; Kyocera TASKalfa — ≥ 3 „dobierają”, w tym eksploatacja; salon PolCard — każdy kafel inne zdjęcie.
   - Zrzuty 1440/390 jasny/ciemny: Posnet Ergo, Kyocera TASKalfa, Lenovo ThinkBook, usługa (przeglad-it), program (Subiekt nexo), karta rodziny PolCard.
   - /przeglad po tym PR (related.ts, dialog/dostępność).

5. feat/biznes-salony-male (od 4 lub salon-kafle) — PolCard, ESET, EuroCert, Microsoft, Samsung, Avtek, Sharp/NEC:
   - tabela porównania modeli z parametrów (jak Posnet), gdy modeli ≥ 3; telefon = karuzela kart;
   - „Wszystko w ofercie” z zakładkami rodzajów, gdy marka ma ≥ 4 karty;
   - blok wdrożenia (4 kroki) i — gdzie dotyczy — serwisu, z faktów marki i oferty PRO-KOM w paczce, bez obietnic bez źródła;
   - FAQ ≥ 4, „O marce” z faktami ze źródłem;
   - bez powtarzania tego samego modelu w dwóch sąsiednich sekcjach.
   - Wszystkie 20 salonów: test „zero powtórzonego zdjęcia w kaflach planu”, alt = marka + model, H1/H2 ze skali BZ.
   - Zrzuty 1440/390 każdego z 7 salonów przed/po w opisie PR.

Raport liczb przed/po (karty, parametry, zdjęcia, `im`) w opisie każdego PR. Każdy PR z UI: e2e biznes-widocznosc + zrzuty-pelne.
```

## Sesja 3 i 4 — KATALOG-DANE-2a / 2b (dawne E)
Ten sam prompt, różni się listą partii:
- **sesja 3:** partie 1–4;
- **sesja 4:** partie 5–8.

```
/zadanie KATALOG-DANE-2<a|b> — zdjęcia i treści kart katalogu, partie <1–4 | 5–8> (PRODUKCJA-BIZNES-1211 §1). Duża sesja: jedna partia = jeden PR piętrowo (feat/biznes-katalog-<kategorie>), każdy z /pr; Krystian scala w trakcie. Zgoda szefa na materiały producentów jest.

Partie:
 1) kasy + drukarki fiskalne + terminale; 2) POS, kioski/KDS, skanery, wagi; 3) laptopy + komputery + monitory; 4) MFP + drukarki + eksploatacja;
 5) sieć + NAS + serwery + UPS; 6) niszczarki + akcesoria biurowe + AV; 7) vending; 8) programy + usługi + Microsoft/ESET/EuroCert.

Dla każdej gotowej karty partii:
- zdjęcia: ≥ 3 ujęcia, ≥ 1200 px, oficjalne materiały producenta (lista z docs/zadania/zdjecia-do-pozyskania.md), wycięte/oczyszczone tło przez sharp (bez nowej zależności), WebP, źródło w media-produkty-v2.json; nie da się pobrać → lista dla Krystiana, nigdy zdjęcie innego modelu;
- opis ≥ 1 000 znaków (dla kogo → co dostajesz → jak wdrażamy / co robimy przy zakupie), bez kopiowania tekstu producenta (własne zdania, fakty ze źródłem);
- parametry obowiązkowe kompletne (requiredSpecs.ts z sesji 2);
- FAQ ≥ 4; „polecane” ≥ 3 prawdziwe karty; film z oficjalnego kanału, gdzie istnieje;
- AGD bez montażu, HP tylko oryginały, zero cen.
Test progu dla partii (opis, FAQ, polecane, parametry, zdjęcia ≥ 3 albo wyjątek z powodem). Raport przed/po w opisie PR. Karty z kafli głównej, salonów i zestawów w danej partii — zrzut karty 1440/390 w opisie.
/przeglad raz na koniec sesji na całym stosie (test progu = logika). Sesja urwana → w STAN numer ostatniej partii.
```

## Sesja 5 — QA-PRZED-PRODUKCJA (dawne F + G)
```
/zadanie QA-PRZED-PRODUKCJA — pełny przegląd i domknięcie Biznesu przed pierwszym wdrożeniem (PRODUKCJA-BIZNES-1211 Część I §6 i Część IV), na `pnpm build && pnpm start` (nie dev). Duża sesja: PR-y piętrowo, każdy z /pr; Krystian scala w trakcie.

A. QA (dawne F)
1. Automaty: `node scripts/biznes-qa.mjs` (wszystkie adresy z mapy: status, tytuł 30–60, opis 100–155, 1×H1, JSON-LD, og:image, linki spoza mapy, alt), e2e `biznes-widocznosc`, `scripts/zrzuty-pelne.mjs` 1440 i 390 jasny/ciemny dla 30 typów stron, axe bez błędów krytycznych.
2. Telefon 390 i 360 — każdy typ strony wg MOBILE-APLIKACJA §4: brak przewijania w bok, cele dotykowe ≥ 44 px, dolny pasek nie zasłania treści ani przycisków, arkusze i Ctrl K/szukaj, szuflada zapytania, formularze (klawiatura nie zasłania pól), karuzele z marginesem 16 px, stopka, kapsuła i szyna bez skoków, tabela porównania jako karty.
3. Produkty ręcznie (zrzut + lista uwag): po 2 karty z każdej kategorii katalogu (≥ 30), w tym Posnet Ergo, Elzab K10, Sunmi D3 PRO, PolCard Move 3500, Lenovo ThinkBook 14, Dell Pro 14, Kyocera TASKalfa 2320, Brother MFC-L2922DW, Synology DS, UniFi U7, COMEX COVER, Fellowes LX210, Optivendi automat, Subiekt nexo, Microsoft 365 Business Standard, przegląd IT. Sprawdź: galeria, parametry obowiązkowe, wersje, opis, FAQ, „dobierają”, źródła, przycisk zapytania z wersją, telefon.
4. Lighthouse (telefon) 12 stron ≥ 90 we wszystkich kategoriach.
5. Wynik: `docs/design/prokombiznes/0611/QA-PRODUKCJA.md` (tabela problem → strona → zrzut → priorytet). Poprawki P0/P1 w tej sesji (fix/biznes-qa-<obszar>, małe PR-y piętrowo), P2 do STAN.

B. Przed produkcją (dawne G)
6. docs/biznes-strony-prawne: polityka prywatności (hosting webh.pl zamiast Seohost, aktualni procesorzy, formularze i zapytania, cookies), /cookies i /dostepnosc uzupełnione wg stanu strony (deklaracja dostępności z wynikami axe/Lighthouse z pkt 1 i 4 i kontaktem); teksty do akceptacji prawnika — oznacz [prawnik] w STAN.
7. 301 ze starej strony: jeśli pod prokombiznes.pl działa stara strona — zbierz jej adresy (sitemap / crawl), mapa stary → nowy w konfiguracji Nginx produkcji (plik w repo, runbook), test curl -I w smoke produkcji. Jeśli domena była pusta — wpis w STAN, że 301 nie dotyczy.
8. Panel produkcji: lista pól do ręcznego wpisania po kopii stagingu (tytuły SEO z pageSeo.ts, link Google, e-mail powiadomień tenanta, hasło admina) — w runbooku §3a sekcja „Biznes”.
9. Staging (TYLKO za zgodą Krystiana, jako ostatni krok): `ZAMIEN_STRONY=gopos,insert,opieka-it,automaty-vendingowe bash scripts/staging-content.sh biznes`, potem `porownaj-tresc --widocznosc` lokalnie ↔ staging zielony, smoke, Lighthouse stagingu.
10. Odhacz Część IV tego pliku w STAN (z linkami do dowodów). Produkcja dopiero po akceptacji szefa w Asanie i wg runbooka §3 (certyfikat --expand, PROD_SITE_HOSTS/PROD_WWW_HOSTS, prod-content §3a, deploy.sh prod, smoke, kopia, monitory, Search Console) — poza tą sesją.

/przeglad przy poprawkach z logiką i przy 301/Nginx; dokumenty prawne bez recenzenta.
```

---

# CZĘŚĆ IV — GOTOWE DO PRODUKCJI (checklista)

**Treść i wygląd**
- [ ] Żadna sekcja nie jest niewidoczna. e2e `biznes-widocznosc` zielony lokalnie i `--widocznosc` na stagingu.
- [ ] GoPOS, InsERT, Opieka IT, Automaty: zrzuty pełne 1440/390, jasny i ciemny, bez pustych pól.
- [ ] 411 kart przechodzi progi: opis ≥ 1 000, FAQ ≥ 4, polecane ≥ 3, parametry obowiązkowe, zdjęcia ≥ 3 (wyjątki na liście z powodem).
- [ ] Salony: zero powtórzonych zdjęć w kaflach planu, 7 małych salonów pełnych.
- [ ] Zestawy: tylko „Gotowe” widoczne, źródła zgodności działają.
- [ ] Zero cen poza dozwolonymi kwotami, zero WhatsApp, statusy z K4-FINAL §1, bez zdjęć ludzi (test).
- [ ] Telefon 390/360: QA-PRODUKCJA bez P0/P1.

**Jakość techniczna**
- [ ] `biznes-qa.mjs`: wszystkie adresy 200, tytuły i opisy w normie, 1×H1, JSON-LD, og:image, brak martwych linków.
- [ ] Lighthouse telefon ≥ 90 na 12 stronach.
- [ ] axe bez błędów krytycznych.
- [ ] Formularze: zapis w `Inquiries`, mail (Mailpit lokalnie, test na stagingu), lista „Do zapytania” dołączona, honeypot i limit.

**Prawo i dane**
- [ ] Polityka prywatności (webh.pl), cookies, dostępność — zaakceptowane [prawnik].
- [ ] Zgoda szefa na materiały producentów zapisana w STAN (12.11), źródło każdego zdjęcia w danych.
- [ ] Decyzje [SZEF]: „100+ klientów”, link Google, model Opieki IT bez cen — stan w STAN.

**Wdrożenie**
- [ ] Staging = treść z kodu (`porownaj-tresc` + widoczność zielone).
- [ ] Akceptacja szefa w Asanie.
- [ ] Kopia bazy przed wdrożeniem, możliwość cofnięcia obrazu.
- [ ] Certyfikat (`--expand` o prokombiznes.pl, www), `PROD_SITE_HOSTS` i `PROD_WWW_HOSTS`, treść §3a, `deploy.sh prod`, smoke.
- [ ] 301 ze starej strony (albo wpis „nie dotyczy”).
- [ ] Po wdrożeniu: cron kopii, Better Stack, Search Console z sitemap, ręczne pola panelu, próbne zapytanie z formularza.
