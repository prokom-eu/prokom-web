# prokombiznes.pl — audyt gotowości do produkcji (25.10.2026, po K3 + K3.1, wizualizacja v122)

Pytanie: czy cała strona — po sesjach, które jeszcze zrobi Claude Code — jest gotowa na produkcję, ma najwyższy poziom, czy rozwiązania są dobre i spójne, co poprawić, dodać, usunąć.
Zakres: wszystkie 17 plansz v20 (główna, mapa, katalog, kategoria, produkt, zapytanie, Opieka IT, GoPOS, InsERT, branża, kreator, O firmie, aktualności, wpis, kontakt), plansze K3/K3.1 (14 desktop + 22 telefon), dane seed (269 kart, 23 zestawy, 12 planów), dokumenty przekazania, decyzje w `00-STAN-PROJEKTU.md`, audyt B11.


> **Aktualizacja v124 (25.10):** O firmie i Kontakt mają nowe wzorce (`Web-OFirmie-1440`, `Web-Kontakt-1440`, sesja K31e, K31-ZMIANY §13.4) — formularz kontaktu zapisuje zgłoszenie tak jak zapytanie (status, mail, antyspam z sesji PROD). Karty wielomodelowe: reguła łączenia/rozdzielania i `ProductGroup` w K31-ZMIANY §13.5; podział 6 kart w K31a.

## 1. Werdykt
**Produkt i projekt — tak, poziom wyraźnie wyższy niż u konkurencji z regionu.** Katalog 266 pozycji z treścią ze źródeł producentów, lista zapytania bez cen, gotowe zestawy, interaktywny plan lokalu z filmami, salony marek, telefon jak aplikacja, tryb ciemny — tego lokalni dostawcy kas i IT nie mają.

**Na produkcję — jeszcze nie, i to nie przez kod.** Po sesjach Code strona będzie technicznie kompletna, ale blokują trzy rzeczy spoza kodu:
1. **Treści zaufania i obietnice** — na stronie głównej są zastępniki (FOTO, puste opinie), cytat właściciela bez jego akceptacji, obietnice do potwierdzenia przez szefa.
2. **Prawo i RODO** — stopka linkuje do Polityki prywatności, Cookies i Dostępności, a tych stron nie ma (ani treści, ani planszy).
3. **Obsługa zapytań i pomiar** — strona obiecuje „oddzwaniamy w 60 minut”, a nie ma ustalonego, kto odbiera powiadomienie i jak mierzymy, ile zapytań przychodzi.

**Ryzyko terminu:** do stagingu zostało ok. 12 sesji Code (plus F1), a do 20.11 równolegle idzie PRO-KOM Gaming (ok. 25 wieczorów). Obu w pełnym zakresie przed 20.11 nie da się zrobić — potrzebna decyzja szefa o kolejności (§10).

| Obszar | Ocena | Co blokuje produkcję |
|---|---|---|
| Struktura i nawigacja | dobra | mega menu bez „Plan Twojej firmy” i „Salony marek”; plansza „Mapa strony” nieaktualna (v20) |
| Katalog i karty | bardzo dobra | 16 kart „do sprawdzenia” (noindex — nie blokuje), 2 karty bez zdjęć (zastępnik) |
| Produkt 2.0, salony, plan, GoPOS, InsERT | bardzo dobra | — |
| Strona główna | dobra | zastępniki zdjęć i opinii, cytat właściciela, „Realizacje” bez realizacji, liczniki na sztywno w planszy |
| Telefon (aplikacja) | bardzo dobra | — |
| Treści eksperckie (KSeF, ulgi, terminale) | dobra | fakty do sprawdzenia w dniu publikacji |
| Prawo / RODO | **brak** | polityka prywatności, cookies, klauzula informacyjna przy formularzu, deklaracja dostępności |
| SEO techniczne | dobra (z B11) | przekierowania ze starej pro-kom.eu, Search Console, wizytówka Google |
| Analityka i pomiar | **brak** | brak narzędzia i zdarzeń (zapytanie, telefon, WhatsApp) |
| Obsługa zapytań | **brak procesu** | kto, w jakim czasie, gdzie status |
| Bezpieczeństwo / utrzymanie | częściowo (plan w ADR-005) | antyspam formularza, nagłówki, kopie z testem odtworzenia, monitoring — do zrobienia na stagingu |

## 2. Struktura strony (stan docelowy po K3.1)
```
/                         strona główna (hero, 4 potrzeby, marki, 5 działów, najczęściej wybierane, Plan Twojej firmy 2.0, jak pracujemy,
                          jedna firma czy pięć, dla kogo + opinie, fakty, aktualności, FAQ, formularz)
/oferta                   katalog (5 działów, 23 kategorie, filtry, wyszukiwarka)
/oferta/<kategoria>       kategoria (kasy: porównywarka; komputery: podkategorie i filtr serii)
/produkt/<slug>           produkt 2.0 (266 widocznych kart)
/zestawy, /zestawy/<slug> gotowe zestawy (23)
/plan-firmy               Plan Twojej firmy 2.0 (12 scen, 186 punktów) — ta sama komponenta na głównej
/marki/<slug>             strony marek (31); Lenovo i Dell jako salony
/gopos, /insert           strony partnerów 2.0
/opieka-it                Opieka IT (abonament bez pakietów na stronie, przegląd, kalkulator przestoju)
/branze/<branza>          gastronomia, handel, noclegi (reszta w listopadzie)
/kreator                  „Dobierz zestaw w 60 s”
/zapytanie                lista zapytania (koszyk bez cen)
/o-firmie, /aktualnosci (+ wpisy), /kontakt
/polityka-prywatnosci, /cookies, /dostepnosc, /mapa-strony   ← DO DODANIA (§5)
```
**Menu (bez zmian z v20):** Oferta ▾ · Opieka IT · GoPOS · InsERT · O firmie · Kontakt | lupa · Zapytanie.
**Mega menu — dopisać:** w kolumnie działów „Gotowe zestawy” (jest w K3) **oraz „Plan Twojej firmy”**; w dole mega menu „Salony: Lenovo · Dell” obok „Cały katalog” i kreatora. Bez tego plan i salony są osiągalne tylko ze strony głównej i katalogu.

## 3. Co jest dobre — zostaje bez zmian
- Bez cen + lista zapytania z notatką o wybranej wersji — zgodne z decyzją szefa i wygodne dla klienta B2B.
- Treści kart ze stron producentów, z datą sprawdzenia i źródłem; adresy sklepów nigdy nie są pokazywane.
- Jedno tło „studio” dla wszystkich zdjęć — strona wygląda jak jeden produkt, nie zbiór zdjęć z hurtowni.
- Filmy tylko po kliknięciu (youtube-nocookie) — szybka strona i mniej problemów z cookies.
- Telefon jak aplikacja (dolny pasek, arkusze, przyklejone CTA) — większość ruchu lokalnego to telefon.
- `noindex` dla kart „do sprawdzenia” — nie wypuszczamy do Google niepewnych treści.
- Architektura (Next.js + Payload, jeden panel, dane z seed) — właściwa dla jednej osoby; nie zmieniamy.

## 4. Co poprawiamy
### P1 — przed produkcją
| # | Co | Dlaczego | Kto / gdzie |
|---|---|---|---|
| 1 | **Strona główna: zastępniki** — „FOTO” przy rolach w „Jak pracujemy”, 2 puste opinie, „Zdjęcie właściciela — wkrótce”, napis o logotypach klientów | zastępnik na produkcji wygląda jak niedokończona strona i obniża zaufanie | decyzja 15.10 „bez własnych zdjęć”: **ikony ról zamiast FOTO**; opinie — tylko prawdziwe (dziś 1 z Panoramy Firm), puste karty ukryć; zdjęcie właściciela — ukryć do sesji zdjęciowej |
| 2 | **Cytat właściciela** | tekst przypisany prawdziwej osobie musi zaakceptować ta osoba | szef akceptuje albo sekcja bez cytatu |
| 3 | **Obietnice**: „oddzwaniamy w 60 minut” (w stopce, formularzu, hero), „kasa w cenie z fiskalizacją i szkoleniem”, „czas reakcji w umowie” | to zobowiązania wobec klienta | szef potwierdza; „60 minut” tylko z procesem (§5.3) |
| 4 | **Liczniki** — w planszach v20 „225 pozycji”, działy 159/16/25/12/13, „9 z 103 pozycji” (branża) | dane się zmieniły (266 / 31 marek) | w kodzie zawsze z bazy (F1 pkt 6 + K31d) |
| 5 | **„Realizacje” w szynie sekcji głównej** — sekcja to „Dla kogo pracujemy” + opinie, realizacji nie ma | obietnica w nawigacji bez treści | zmienić na „Dla kogo” albo dodać 2–3 realizacje (§5.4) |
| 6 | **Link „Bezpłatny przegląd IT”** w stopce v20 | karta usługi „do akceptacji szefa” (nieopublikowana) | link ukryty do akceptacji |
| 7 | **E-mail w stopce** — v20: biuro@, reszta strony: biznes@ | dwa adresy wyglądają na błąd | jeden: biznes@pro-kom.eu (decyzja 16.10); biuro@ tylko w danych firmy |
| 8 | **Plakietki** „ulga do 700 zł” i „0 zł przez 12 mies.” | Polska Bezgotówkowa — szef dopuścił 16.10; program działa (strona programu, wpisy z 10.2026), 12 mies. za 0 zł dotyczy terminala w telefonie. Ulga — nadal w art. 111 ust. 4 ustawy o VAT, ale wniosek robi księgowa klienta | zostają; teksty: „Ulga na pierwszą kasę online — doradzimy” i „Terminal w programie Polska Bezgotówkowa”; daty i warunki sprawdzić w dniu publikacji |
| 9 | **Fakty w Aktualnościach** — kary KSeF (projekt MF), „paragon z NIP do 450 zł” od 2027, PUP — do 6× przeciętnego wynagrodzenia | przepisy i programy się zmieniają | sprawdzić i podać datę „stan na” w dniu publikacji |
| 10 | **Plansza „Mapa strony”** (v20) — Branże w menu, „Pomoc zdalna”, 225 pozycji, brak zestawów/planu/salonów | to dokument dla szefa i specyfikacji | obowiązuje struktura z §2; plansza oznaczona jako historia |
| 11 | **Zakopane** — w K3.1 stopka i ekran Kontakt pokazywały salon w Zakopanem | decyzja: na Biznesie tylko adres w Rabce | poprawione w v122 (Kontakt: ul. Orkana 16B, pn–pt 9–17, tel. 18 267 65 11) |
| 12 | **Stopka** | plansza K3.1 miała własną, inną stopkę | poprawione w v122: stopka v20 + linki Gotowe zestawy, Plan Twojej firmy, Salony (K31-ZMIANY §11.4) |

### P2 — przed produkcją albo w pierwszym tygodniu
- Strona główna jest długa (desktop ok. 13 000 px). Plan 2.0 z 12 scenami to ok. 1 500 px — rozważyć na głównej 6 najczęstszych scen + „Wszystkie rodzaje firm” (decyzja w `K31-przeglad.xlsx`).
- Aktualności: min. 3 wpisy na start (są: KSeF 2027, kary KSeF, Polska Bezgotówkowa, ulga 700 zł — wystarczy po sprawdzeniu faktów).
- 16 kart „do sprawdzenia” i 20 zestawów „do potwierdzenia zgodności” — można publikować z `noindex`/bez zestawów niepotwierdzonych, ale lista do zamknięcia w 2 tygodnie.

## 5. Co dodajemy
### 5.1 Strony prawne (blokują produkcję)
- **Polityka prywatności** — administrator (PRO-KOM Tadeusz Wójciak, NIP, adres), cele i podstawy (art. 6 ust. 1 lit. b i f RODO — odpowiedź na zapytanie), odbiorcy (hosting, poczta), okres przechowywania zapytań (propozycja: 12 miesięcy od ostatniego kontaktu, potem usunięcie w panelu), prawa osoby, kontakt. Wzór: projekt polityki z prokomsoftware.pl (v20) — ten sam administrator. **Do sprawdzenia przez szefa/prawnika.**
- **Cookies** — strona bez reklam i bez Google Analytics może działać bez banera zgód, jeśli używa tylko niezbędnych plików i analityki bez cookies (§5.2); YouTube ładuje się dopiero po kliknięciu — opisać.
- **Klauzula przy formularzach** — pod przyciskiem „Wyślij”: kto administruje danymi, po co, link do polityki. Dotyczy: formularz na głównej, /kontakt, /zapytanie, kreator.
- **Dostępność** — prawny obowiązek z ustawy o dostępności (od 28.06.2025) dotyczy m.in. usług handlu elektronicznego dla konsumentów i nie obejmuje mikroprzedsiębiorców; prokombiznes.pl jest skierowana do firm i nie zawiera umów online, więc najpewniej nie podlega — ale link w stopce jest, więc strona musi istnieć: krótka informacja, że stosujemy WCAG 2.1 AA, i kontakt w sprawie barier. (Nie jestem prawnikiem — w razie wątpliwości potwierdzić.)
- **Mapa strony** (HTML) — automatycznie z tych samych danych co sitemap.xml.

### 5.2 Analityka i pomiar
- Narzędzie bez cookies (np. Umami lub Plausible — Umami można postawić na tym samym VPS bez opłat licencyjnych), żeby nie potrzebować banera zgód.
- Zdarzenia: dodanie do zapytania, wysłanie zapytania (z liczbą pozycji i źródłem: produkt / zestaw / plan / kreator), klik „Zadzwoń”, klik WhatsApp, klik e-mail, odtworzenie filmu, użycie wyszukiwarki bez wyniku (lista brakujących produktów).
- Raport dla szefa raz w miesiącu: zapytania, telefony z telefonu, najczęściej oglądane produkty, frazy bez wyniku.

### 5.3 Obsługa zapytań (proces, nie kod — ale kod musi go wspierać)
- Powiadomienie o zapytaniu: e-mail na biznes@ + Krystian + **powiadomienie na telefon szefa** (np. e-mail na telefon z osobnym dźwiękiem) — inaczej „60 minut” jest nie do dotrzymania.
- W panelu: status zapytania (nowe → w toku → oferta wysłana → wygrane / przegrane) i pole „kto prowadzi”. Daje szefowi liczby: ile zapytań, ile ofert, ile sprzedaży ze strony.
- Zastępstwo w urlopie / poza godzinami: autoodpowiedź z informacją, kiedy oddzwonimy.

### 5.4 Zaufanie (największa dźwignia sprzedaży B2B lokalnie)
- **2–3 realizacje** z ostatnich 12 miesięcy (np. kawiarnia z GoPOS, pensjonat z Wi-Fi i NFHotel, biuro z serwerem) — zdjęcie lub ikona, 3 zdania, branża, miejscowość, za zgodą klienta. Docelowo osobna strona `/realizacje` (listopad).
- **Opinie Google** — prośba do 10 stałych klientów o opinię w wizytówce; na stronie link „Zobacz opinie w Google” + 2 oryginalne cytaty.
- **Wizytówka Google (Profil Firmy)** — adres strony zmieniony na prokombiznes.pl (dla działu Biznes), kategorie, godziny, zdjęcia; te same dane (nazwa, adres, telefon) co na stronie i w Panoramie Firm.

### 5.5 SEO przy starcie
- **Przekierowania 301** ze starej pro-kom.eu (podstrony o kasach, terminalach, programach, opiece IT) na odpowiedniki w prokombiznes.pl — lista adresów do zebrania ze starej strony i z Google Search Console.
- Search Console dla prokombiznes.pl, zgłoszenie sitemap.xml; dane strukturalne (są z B11: Organization, LocalBusiness, Product bez ofert, FAQ, Breadcrumb; dochodzi VideoObject).
- Teksty kart nie mogą się powtarzać na innych stronach PRO-KOM (pro-kom.eu po przebudowie w grudniu tylko linkuje do Biznesu).

## 6. Co usuwamy / upraszczamy
- Zastępniki z §4 P1 pkt 1 (FOTO, puste opinie, „wkrótce”) — nigdy na produkcję.
- „Realizacje” z szyny sekcji (do czasu realizacji).
- Link do nieopublikowanego „Bezpłatnego przeglądu IT”.
- Planszę „Mapa strony” v20 jako źródło — zastępuje §2.
- **Nie dodajemy teraz**: konta klienta, czatu, porównywarki poza kasami, kolejnych branż — to listopad i później.

## 7. Czy wszystko do siebie pasuje — narzędzia doboru
Na stronie jest sześć sposobów „dobierz mi”: kreator 60 s, gotowe zestawy, Plan Twojej firmy, strony branż, dobór w salonie marki, „Który Subiekt”. To dużo, ale ma sens, **jeśli każde ma jedną rolę i wspólne dane**:

| Narzędzie | Rola | Dane |
|---|---|---|
| Plan Twojej firmy | inspiracja: „co jest w takim lokalu” | punkty planu → karty |
| Gotowe zestawy | konkretny pakiet do zapytania | zestawy (23) |
| Kreator 60 s | najszybsza ścieżka do **gotowego zestawu** | **wynik = zestaw z bazy** (+ scena planu), a nie osobna lista |
| Branża (`/branze/…`) | strona pod Google dla branży | **złożona z istniejących klocków**: scena planu + zestawy branży + produkty z tagiem branży + FAQ — bez osobnych treści do utrzymania |
| Dobór w salonie | wybór serii laptopa | reguły salonu |
| Który Subiekt | wybór programu | reguły InsERT |

Do poprawy w kodzie: **kreator ma zwracać gotowy zestaw** (branże kreatora: sklep, gastronomia, pensjonat, biuro, gabinet, szkoła, food truck mają zestawy; warsztat i produkcja — wynik = scena planu + rozmowa). Dzięki temu nie utrzymujemy dwóch list „co zwykle ustawiamy”.

## 8. Ocena rozwiązań technicznych
- **Dobre:** dane w seed i panelu (bez treści w kodzie), noindex dla niepewnych kart, filmy po kliknięciu, jeden komponent planu dla głównej i `/plan-firmy`, SVG ładowany tylko dla aktywnej sceny, indeks wyszukiwarki 27 KB.
- **Ryzyko 1 — utrzymanie treści:** 269 kart z generacjami sprzętu się starzeje (Lenovo/Dell zmieniają generacje co rok). Potrzebny **przegląd kwartalny**: raport w panelu „karty sprawdzone ponad 6 miesięcy temu”, „karty bez zdjęcia”, „filmy nieaktywne” (cron oEmbed z K31a). Właściciel: Krystian, 1 popołudnie na kwartał.
- **Ryzyko 2 — zdjęcia:** galerie 1200 px — w kodzie obowiązkowo `next/image` z rozmiarami (karty 400–600 px), inaczej katalog będzie ciężki na telefonie.
- **Ryzyko 3 — poczta:** formularze wysyłają maile z domeny pro-kom.eu, a 30.10 jest migracja poczty do Seohost. Przed produkcją: wysyłka przez SMTP nowego dostawcy, SPF/DKIM/DMARC, test dostarczenia do Gmaila i Outlooka.
- **Ryzyko 4 — zależność od jednej osoby:** instrukcja dla szefa/pracownika „jak dodać produkt, zdjęcie, wpis i odpowiedzieć na zapytanie w panelu” (1 strona + 5-minutowe nagranie ekranu).

## 9. Lista kontrolna produkcji (sesja PROD przed stagingiem — prompt niżej)
- [ ] Dane firmy z panelu wszędzie (NIP, adres, godziny, telefony, e-mail biznes@) — zero „przykładowe”.
- [ ] Strony: polityka prywatności, cookies, dostępność, mapa strony; klauzula pod każdym formularzem.
- [ ] Formularze: honeypot + limit zgłoszeń z jednego IP; potwierdzenie dla klienta mailem; powiadomienie do biznes@ i Krystiana; status zapytania w panelu.
- [ ] Analityka bez cookies + zdarzenia z §5.2.
- [ ] Nagłówki bezpieczeństwa (HSTS, CSP z wyjątkiem youtube-nocookie.com dla ramek, X-Content-Type-Options, Referrer-Policy), panel `/admin` za silnym hasłem, brak indeksowania `/admin` i `/api`.
- [ ] Lighthouse (telefon) ≥ 90: główna, katalog, produkt, plan; CLS < 0,1; zdjęcia przez `next/image`.
- [ ] axe bez błędów na 10 kluczowych stronach; nawigacja klawiaturą w popupie planu i arkuszach.
- [ ] 301 ze starej pro-kom.eu; sitemap.xml w Search Console; 404 z wyszukiwarką.
- [ ] Kopia zapasowa bazy i mediów codziennie poza serwerem + **przetestowane odtworzenie**; monitoring dostępności i błędów (Uptime Kuma, Sentry — ADR-005).
- [ ] Test na prawdziwych urządzeniach: Android + iPhone, tryb ciemny.
- [ ] Akceptacja szefa (Asana „SZEF · Akceptacja prokombiznes.pl do publikacji”).

### Prompt — sesja PROD
```
/zadanie PROD — gotowość produkcyjna prokombiznes.pl (docs/design/prokombiznes/AUDYT-PRODUKCJA.md §5, §9)
1. Strony /polityka-prywatnosci, /cookies, /dostepnosc, /mapa-strony — treść z panelu (Pages), szkic treści polityki na wzór prokomsoftware (administrator PRO-KOM Tadeusz Wójciak), oznaczony „do akceptacji”.
2. Klauzula informacyjna pod każdym formularzem (główna, /kontakt, /zapytanie, /kreator) — jeden komponent, tekst z panelu.
3. Formularze: honeypot + rate limit (IP), mail potwierdzający do klienta, powiadomienie do adresów z panelu; Inquiries.status (nowe/w toku/oferta/wygrane/przegrane) + Inquiries.owner.
4. Analityka bez cookies (adapter: Umami — URL i ID z env; brak env = brak skryptu) + zdarzenia: add_to_inquiry, inquiry_sent{items,source}, click_tel, click_whatsapp, click_mail, video_play, search_no_results{q}.
5. Nagłówki bezpieczeństwa w next.config (HSTS, CSP: frame-src youtube-nocookie.com; img-src self data i.ytimg.com), robots: Disallow /admin i /api.
6. Mega menu: „Plan Twojej firmy” i „Salony: Lenovo · Dell”; szyna sekcji głównej: „Realizacje” → „Dla kogo”; stopka: ukryj link do usług ze statusem do-akceptacji-szefa.
7. Kreator: wynik = gotowy zestaw z bazy (mapa branża → zestaw, warsztat/produkcja → scena planu).
Gotowe: testy zielone; e2e: wysłanie zapytania → mail w Mailpit + rekord ze statusem „nowe”; brak skryptu analityki bez env; nagłówki widoczne w odpowiedzi; zrzuty mega menu i stopki.
```

## 10. Plan startu (realny) i kolejność cięcia
Sesje do stagingu (ścieżka skrócona, `START-TUTAJ.md` §3): **W → KD → K3a → K31a → K31b → K3b′ → K31c → K3c → K31d → K31e → M1 → PROD → staging** = 12 sesji. Oszczędność: wgranie i dokumenty obu paczek naraz, a strona produktu budowana od razu jako 2.0 (bez budowania wersji K3 i przebudowy).

Jeśli trzeba skrócić (np. pierwszeństwo Gaming do 20.11), tniemy od końca, nie jakość:
1. Salony Lenovo/Dell (K31c) → do czasu salonu strony marek z szablonu K3.
2. GoPOS/InsERT 2.0 (K31e) → do czasu wersje v20 z B-sesji.
3. Kreator i branże poza gastronomią → listopad.
**Bez cięć:** katalog, produkt 2.0, zapytanie, zestawy, Plan 2.0, telefon, strony prawne, analityka, obsługa zapytań.

**Decyzja szefa potrzebna teraz:** kolejność Biznes vs Gaming do 20.11. Rekomendacja: Biznes do stagingu w pierwszej kolejności (strona dla istniejącej sprzedaży, zapytania od firm są pewniejsze niż nowa linia), Gaming równolegle tylko w zakresie bez cięć z jego planu.

## 11. Decyzje dla szefa (zebrane)
1. Kolejność Biznes vs Gaming do 20.11 (§10).
2. Obietnice: oddzwonienie w 60 min (z procesem §5.3), „kasa z fiskalizacją, programowaniem i szkoleniem”, czas reakcji w umowie opieki.
3. Cytat właściciela — akceptacja tekstu albo usunięcie.
4. Zgoda na 2–3 realizacje i prośba do klientów o opinie Google.
5. Polityka prywatności — akceptacja (lub prawnik), okres przechowywania zapytań.
6. Status partnera GoPOS i InsERT — dokładna nazwa (skan umowy/certyfikatu).
7. Bezpłatny przegląd IT i zakres opieki IT — publikujemy czy nie.

## Źródła
- Polska Bezgotówkowa — strona programu (oferta „terminal w telefonie 12 miesięcy za 0 zł”, wpisy z 10.2026): [polskabezgotowkowa.pl](https://www.polskabezgotowkowa.pl/)
- Ulga na kasę online 90% / maks. 700 zł, art. 111 ust. 4 ustawy o VAT: [poradnikprzedsiebiorcy.pl](https://poradnikprzedsiebiorcy.pl/-ulga-na-zakup-kasy-fiskalnej-kiedy)
- Ustawa o zapewnianiu spełniania wymagań dostępności (od 28.06.2025; usługi handlu elektronicznego dla konsumentów; wyłączenie mikroprzedsiębiorców): [ifirma.pl](https://www.ifirma.pl/blog/ustawa-o-dostepnosci-juz-uchwalona-sprawdz-obowiazki.html)
- Etapy KSeF: [ksef.podatki.gov.pl](https://ksef.podatki.gov.pl/etapy-wdrozenia-ksef)
