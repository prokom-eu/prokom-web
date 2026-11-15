# prokominstalacje.pl — audyt przed stagingiem (01.11.2026)

Zakres: lokalna wersja `instalacje.localhost:3002` po I14 (develop e5788ba), 36 adresów z `sitemap.xml`.
Sprawdzone w Chrome: HTML każdej strony, linki, kotwice, konsola, SEO, dane strukturalne, formularze (bez wysyłki), 390 / 1440 / 4096 px, jasny i ciemny. Do tego porównanie wysokości każdej sekcji z prototypem v4.2 i przegląd treści pod kątem decyzji ze spec §2.

## Werdykt

Strona jest gotowa na staging, ale przed I15 trzeba zrobić **2 poprawki P1**. Technicznie jest bardzo czysto:
- 36/36 stron zwraca 200, 0 martwych linków i kotwic;
- 0 błędów w konsoli na stronach treści;
- 0 przewijania w bok przy 390 i 1440 px;
- każda strona ma 1 H1, title ≤ 66 znaków, description 71–155 znaków, poprawny JSON-LD;
- wszystkie obrazy mają `alt`, żadnych zewnętrznych hostów (fonty i skrypty lokalne).

**Zgodność z wizualizacją:** wysokości sekcji 1440 px zgadzają się z prototypem v4.2 na wszystkich 32 stronach w granicy ±12%. Wyjątki są świadome: brak „dwóch salonów” na Ekranach i „historii” na O firmie (decyzja: jeden salon), krótsza sekcja Doświadczenie u architektów (brak zdjęć) i +98 px w „Powiązanych” (link dla architektów).

Największa luka jakościowa to nie błędy, tylko **brak warstwy ruchu**:
- tylko 46% klikalnych elementów na głównej ma płynne przejście;
- w CSS całej strony jest 5 reguł stanu „wciśnięty”;
- żadna sekcja nie wjeżdża przy przewijaniu.

Software ma już gotowy system ruchu (SWV7, #264). Rozszerzenie go na Instalacje to najtańsza droga do efektu „premium” (§3).

## 1. Do poprawy przed stagingiem

### P1 — blokery
1. **Znaczniki `[SZEF: …]` na stronie `/dla-kogo/budowy`**, w FAQ i w danych strukturalnych FAQPage (Google je zobaczy):
   - FAQ 07: „…możemy przekazywać alarmy **[SZEF: partner — agencja ochrony]**”;
   - FAQ 08: „Wynajem na czas budowy: **[SZEF: czy oferujemy wynajem; jeśli nie, napisać to wprost]**”.

   Źródło: `seed/prokominstalacje/obiekty/bud.json` (l. 326, 330). Do czasu decyzji szefa usuń te fragmenty zdania, nie zostawiaj znacznika. Pytania są w liście [SZEF] niżej.
2. **Test e2e „brak znaczników” ich nie wyłapał.** `tests/e2e/instalacje/strony.e2e.spec.ts` sprawdza `main.innerText()`, a odpowiedzi w zwiniętych FAQ (`<details>`) i sekcje zwinięte nie są w `innerText`.
   - Poprawka: sprawdzać `textContent` całego `main` i treść bloków JSON-LD.
   - Dopisać ten sam test dla `/dla-kogo/*` (dziś tylko `strony.e2e`).
3. **Pasek „Marki, z którymi pracujemy” na głównej jest rozsypany** (1440 i 390 px): nazwy sklejone z kategorią („Dahuakamery”, „Hikvisionkamery”), a „APART”, „RCF” i „MikroTik” nachodzą na siebie.
   - Przyczyna: w `glowna-sekcje.css` jest tylko `.brands`; brakuje reguł `.brand`, `.brand b` i `.brand span` z prototypu (`pk.css` l. 287–290: karta, `flex-direction: column`, kroje, hover).
   - Na telefonie (`.trust .brands`, przewijany rząd) potrzebne są te same reguły kart.

### P2 — poprawić w I15 albo przed nim
4. **Pas CTA na każdej stronie (35 stron):** „**Salony:** Rabka-Zdrój, ul. Orkana 16B” — salon jest jeden.
   - W `CtaBandView.tsx` liczba pojedyncza przy jednej lokalizacji („Salon: …”).
   - Tak samo w `dane/kontakt.ts` (`eyebrow: 'Salony'`).
5. **Strona 404:**
   - Tytuł karty to sam „PRO-KOM Instalacje”, bez „Nie znaleziono strony”.
   - W konsoli jest błąd React „Encountered a script tag while rendering React component” (skrypt, prawdopodobnie JSON-LD albo motyw, renderowany w granicy not-found).
   - Strona jest uboga: dodaj 4–6 linków (usługi, Dla kogo, Kontakt, Zaplanuj).
6. **Mini-formularz na głównej:** po wysłaniu pustego focus nie przechodzi na pierwsze błędne pole (zostaje na `body`). Pozostałe formularze (Kontakt, Serwis, Teletechnika, 3 × Architekci) działają poprawnie: błędy, focus, honeypot, zgoda, brak wysyłki.
7. **Dane strukturalne `LocalBusiness`:** brak `image` (Google go zaleca), `geo` i `areaServed`. Brak obrazu OG na wszystkich stronach (znane z I13). Przy udostępnieniu linku na Facebooku czy WhatsAppie nie będzie podglądu. Minimum przed produkcją: jeden obraz OG 1200×630 w `SiteSettings.seo.ogImage`.
8. **Realizacje (strona i sekcja na głównej):** 11 realizacji z ikonami zamiast zdjęć. Działa, ale to najsłabszy wizualnie fragment strony; potrzebne zdjęcia od szefa. Na stronie „Pokaż wszystkie (11)” przy 6 widocznych jest OK.

### P3 — dopracowanie
9. **Karuzele na telefonie** („Doba w ferie”, „Usługi, które łączymy”, zestawy): widać szary pasek przewijania i nie ma `scroll-snap`. W prototypie pasek jest ukryty. Dodaj `scrollbar-width: none`, `scroll-snap-type: x mandatory`, wygaszenie krawędzi.
10. **Hero głównej, autoodtwarzanie Noc → Zima:** przez ułamek sekundy tło jest już zimowe, a tekst jeszcze jasny (słaby kontrast w trakcie zmiany). Zsynchronizuj przejście koloru tekstu z tłem.
11. **Monitor 4096 px** (ultrawide): podgląd kamery w hero zasłania budynek, bo scena jest wyśrodkowana, a karta pozycjonowana od kontenera. Rzadki przypadek; wystarczy ograniczyć szerokość sceny.
12. **Cele dotykowe:** pojedyncze linki „Zobacz rozwiązania →” na kartach obiektów mają 20 px wysokości (WCAG 2.5.8 wymaga 24 px poza tekstem ciągłym). Wystarczy dodać padding.
13. **Mega menu Usługi:** „Nie wiesz, od czego zacząć? Zaplanuj →” łamie strzałkę do nowej linii.

## 2. Treści i decyzje ze spec §2 — przegląd

Sprawdzone automatycznie na wszystkich stronach:
- **Bez naruszeń:** brak „pakietu odbiorowego”, „diagnozy do 24 h” i „czasu reakcji”, brak KSC, brak „belgijskiej jakości”, brak „multiroom Ampio”, brak obietnicy wyższej ceny lokalu, brak list źródeł. „24 h” występuje tylko jako odpowiedź na zgłoszenie, „Gwarancja 24 mies.” spójnie.
- **Kwoty „zł” to tylko fakty i ekrany demo, nie ceny sprzętu:**
  - abonament RTV 30,50 zł;
  - opłaty ZAiKS;
  - kara UODO 26 711 zł;
  - koszt pracy GUS 10 736 zł (sprawdzony w audycie v4);
  - próg Pzp 170 000 zł od 1.01.2026 (potwierdzony: nowelizacja z 25.07.2025, [e-prawnik](https://e-prawnik.pl/porady-prawne/wartosc-zamowienia-netto-czy-brutto.html));
  - ceny na makietach ekranów (menu, witryna).
- **Szkice stron prawnych** (`src/seed/instalacje/legal.ts`): polityka prywatności, cookies, deklaracja dostępności. Treść jest rzeczowa i zgodna z formularzami, ale to **szkic Claude — przed produkcją akceptacja szefa** (prawnik według uznania).
- **Otwarte `TODO(krystian)` w kodzie (decyzje szefa)** — strona działa bez nich, w tych miejscach jest krótsza:

| Strona | Czego brakuje |
|---|---|
| Kontakt, główna (FAQ), Serwis | zasady dojazdu i wizji lokalnej, stawki, „po godzinach”, jak często zdalna kontrola |
| O firmie | zespół instalacji: 2–3 osoby, zdjęcia, uprawnienia SEP |
| Architekci | co bezpłatnie przy montażu, marki Hi-Fi, zdjęcia domów z projektem architekta, autoryzacja Satel, co na pokazie w salonie, warunki dla pracowni |
| Alarmy | agencja partnerska |
| Teletechnika | kontakt dla firm budowlanych |
| Ekrany | ekrany w naszych salonach, zakres i cena usługi treści |
| Nagłośnienie | 5 lat gwarancji Biamp, partner systemu głosowania, firma DSO |
| Anteny | karta „Dwie opłaty” |
| Budowy | agencja ochrony, wynajem zestawu (P1 wyżej) |

## 3. Ruch i mikrointerakcje — „premium” (prośba Krystiana 01.11)

**Stan:**
- na głównej 87 ze 188 klikalnych elementów ma przejście (46%);
- w CSS strony jest 64 reguł hover, 5 reguł `:active` i 0 elementów wjeżdżających przy przewijaniu;
- animacje są tam, gdzie były w prototypie (sceny, hero, widżety), ale drobne interakcje (karty, przyciski, linki, zakładki, FAQ, arkusze) są „suche”.

**Rekomendacja:** nie budować drugiego systemu, tylko **rozszerzyć system ruchu Software (SWV7, #264) na linię Instalacje**. Jest gotowy, przetestowany i zgodny z zasadami:
- animuje tylko `transform`, `opacity`, `filter`, więc nie powoduje przesunięć układu (CLS);
- hover tylko przy myszce, na dotyku stan „wciśnięty”;
- przy `prefers-reduced-motion` nic się nie rusza.

Dziś `src/styles/motion.css` działa tylko pod `[data-line='software']`. Linia Instalacje ma już `data-line="instalacje"`, więc to głównie selektory, znaczniki w komponentach i `RevealObserver` w ramie.

Zakres (jedna sesja **I-M „ruch”**, 2 PR-y):

**PR 1 — strefa wspólna `inst/wsp-ruch` (mały, auto-merge):**
- `motion.css`: selektory `:where([data-line='software'], [data-line='instalacje'])` dla reguł ogólnych (§1 każdy klikalny element zmienia się płynnie, focus „wrastający” 0 → 3 px, przyciski `data-motion`, karty `data-card`, wjazd `data-reveal` / `data-reveal-cards`, arkusze);
- tokeny ruchu (`--ease-*`, `--dur-*`) dostępne dla obu linii;
- `RevealObserver` i `lib/motion/*` przeniesione do wspólnego miejsca (albo import z Software, jeśli prostszy);
- testy Software bez zmian.

**PR 2 — `inst/i-ruch`, oznaczenie komponentów Instalacji i ruch własny linii:**

| Gdzie | Co ma się dziać |
|---|---|
| Przyciski (wszystkie `.btn`, CTA, dolny pasek „Zaplanuj”) | hover: lekkie uniesienie 1–2 px i cień; wciśnięcie: `scale(.97)` ze sprężyną; ikona strzałki przesuwa się o 3 px |
| Karty (usługi, obiekty, rozwiązania, realizacje, zestawy, InstArchNews) | hover: uniesienie 3–4 px, cień, obramowanie w kolorze usługi; ilustracja w karcie powiększa się 1,03; wciśnięcie na telefonie: `scale(.98)` |
| Linki tekstowe i „Zobacz →” | podkreślenie rysujące się od lewej, strzałka +3 px |
| Nagłówek i mega menu | panel wjeżdża 8 px w dół z przezroczystości (180 ms), pozycje kaskadowo co 20 ms; aktywna pozycja menu z przesuwanym wskaźnikiem (jak `SlidingPill` w Software) |
| Zakładki i filtry (hero: obiekty, pora dnia; oferta; architekci: tryby przekroju, kategorie nowości; Dla kogo: warstwy) | przesuwana „pigułka” zaznaczenia zamiast skoku tła; treść pod zakładką z przejściem 150 ms |
| FAQ i sekcje zwinięte „Pokaż całą sekcję” | płynne rozwijanie wysokości (`grid-template-rows: 0fr → 1fr`), plus obraca się w ×, zwinięta sekcja z wygaszeniem dołu |
| Przewijanie | sekcje i rzędy kart wjeżdżają raz (16 px w górę + opacity, kaskada 60 ms); liczniki („od 2004”, „76 rozwiązań”, „10 instalacji”, „17 punktów”) odliczają; szyna sekcji ≥ 1400 px płynnie przesuwa znacznik aktywnej sekcji |
| Karuzele na telefonie | `scroll-snap`, ukryty pasek, wygaszone krawędzie, kropki postępu |
| Przekroje i sceny (Dla kogo, architekci, hero) | punkt: hover i focus pulsuje i powiększa się; karta punktu zmienia treść z przejściem; przełączanie warstw jako przenikanie |
| Formularze i kreator | pole: obramowanie i etykieta płynnie w kolor akcentu; błąd: delikatne potrząśnięcie pola (raz, 200 ms); zaznaczenie zgody i kafla usługi z rysującym się ✓; kroki kreatora przesuwane w poziomie; po wysłaniu animowany ✓ |
| Telefon: dolny pasek i arkusz | aktywna karta z przesuwanym wskaźnikiem; arkusz od dołu ze sprężyną i przyciemnieniem tła (już jest — ujednolicić z tokenami) |
| Przełącznik motywu | przejście koloru całej strony 200 ms (jak `themeReveal` w Software) |

Definition of Done I-M:
- `prefers-reduced-motion` wyłącza ruch (test e2e: zmiana koloru tak, ruch nie);
- 0 CLS z animacji (Lighthouse);
- żadnej nowej zależności (bez Framer Motion, tylko CSS + małe hooki);
- porównanie z prototypem bez zmian wysokości;
- odczucie sprawdzone na prawdziwym telefonie.

Szacunek: ok. 1,5 wieczoru. Dlaczego przed I15, a nie po: szef ocenia stronę na stagingu, a pierwsze wrażenie robi właśnie ta warstwa.

## 4. Czego nie dało się sprawdzić lokalnie
- **Lighthouse i Core Web Vitals:** tryb dev nie daje miarodajnych wyników. Strona główna ma 508 kB HTML przed kompresją (111 kB po), głównie inline SVG scen. Zmierzyć na stagingu (`lighthouserc.json` z #257). Jeśli LCP > 2,5 s na telefonie, przenieść sceny spoza pierwszego ekranu do ładowania po przewinięciu.
- **Prawdziwe telefony (Android, iPhone):** gest arkusza, safe-area, klawiatura — w I15.
- **Wysyłka formularzy i maile (Mailpit):** pokryte e2e w CI; tu nie wysyłałem zgłoszeń.
- **Staging:** `robots.txt` dziś pozwala indeksować (`Allow: /`) — na stagingu musi być `noindex` i hasło (prompt I15).

## 5. Prompty sesji (kolejność)

```
Sesja I14b (Instalacje) — poprawki z audytu przed stagingiem. Przeczytaj docs/audyty/prokominstalacje-audyt-przed-stagingiem.md §1.
Zakres (PR inst/i14b-audyt): P1 1–3 (seed bud.json bez znaczników [SZEF] w FAQ 07 i 08 — usuń fragmenty zdania, nie wymyślaj odpowiedzi; test e2e znaczników na textContent main + JSON-LD dla wszystkich adresów z pages.ts; karty marek .brand/.brand b/.brand span z pk.css 287–290 i wersja telefonu), P2 4–6 (Salon/Salony wg liczby lokalizacji, 404: tytuł, linki, błąd <script> w not-found, focus na pierwszym błędnym polu mini-formularza), P3 9, 12, 13.
Porównanie: porownaj.mjs start / (sekcja z markami) 1440 i 390, oba motywy. /inst-koniec przed /pr.
```

```
Sesja I-M (Instalacje) — ruch i mikrointerakcje. Przeczytaj docs/audyty/prokominstalacje-audyt-przed-stagingiem.md §3, src/styles/motion.css, src/sites/software/RevealObserver.tsx, src/lib/motion/*.
Najpierw PR wspólny inst/wsp-ruch (selektory motion.css dla [data-line='instalacje'], tokeny ruchu, RevealObserver/lib/motion we wspólnym miejscu; testy Software zielone), potem inst/i-ruch: znaczniki data-motion/data-card/data-reveal w komponentach Instalacji wg tabeli §3, pigułki zakładek, rozwijanie FAQ i sekcji zwiniętych, liczniki, karuzele ze snapem, punkty przekrojów, formularze i kreator. Bez nowych zależności, tylko transform/opacity/filter, reduced-motion = bez ruchu (test e2e). Porównanie wysokości 1440/390 bez zmian. /inst-koniec przed /pr.
```

Potem I15 bez zmian (staging, dane w panelu, lista SEO §6, telefony, Lighthouse).

## 6. Pytania do szefa (do wpisania w panelu albo w seed)

**Przed stagingiem:**
1. Monitoring budowy: czy wynajmujemy zestaw na czas budowy?
2. Z jaką agencją ochrony współpracujemy (budowy, alarmy)?
3. Zdjęcia realizacji (11 kart).
4. Obraz do udostępnień (OG).
5. Akceptacja polityki prywatności, cookies i deklaracji dostępności.

**Przed produkcją:** pozostałe pozycje z tabeli TODO w §2.

## 7. Teksty i nagłówki — redakcja (dopisane 01.11, wieczór)

Przejrzane: wszystkie H1, H2 i H3 na 36 stronach (ok. 43 tys. słów) oraz cały tekst pod kątem schematów typowych dla tekstów pisanych przez AI.

**Werdykt:** treść jest dobra. Jest konkretna, lokalna, z liczbami, scenami z życia klienta (23:00, sobota 21:00, ferie, halny) i przepisami. Nie ma korporacyjnej waty: „kompleksowo”, „innowacyjny”, „bezproblemowo” i „idealny” pojawiają się 0 razy, „profesjonalny” tylko 7 razy na 43 tys. słów.

To, co zdradza AI, to nie słownictwo, tylko **rytm**: te same konstrukcje powtarzane w kółko. Pojedynczo wyglądają świetnie, razem brzmią jak szablon.

### Schematy do ograniczenia
| Schemat | Ile razy | Co zrobić |
|---|---|---|
| „X, a nie Y” / „nie na oko” / „nie pod markę” | 32 + 12 | zostawić 6–8 najlepszych, resztę zamienić na zdanie twierdzące z konkretem |
| Dwa zdania-antyteza w nagłówku („Widzą to, co trzeba. I nie widzą tego, czego nie wolno.”) | ok. 15 H2 | zamienić część na konkret: kto, gdzie, kiedy |
| „…sam” („pilnuje się sam”, „wchodzi sam”, „działa sam”) | 34 | zostawić w 2–3 miejscach |
| „Dlatego…” na początku zdania | 32 | połowę wyciąć albo połączyć ze zdaniem wcześniej |
| „Sześć rzeczy / problemów / spraw…” | 7 stron Dla kogo | zostawić, ale różnić słowa po liczbie |
| Ten sam H2 na wielu stronach | 21× „Po montażu nie znikamy…”, 12× „Przygotuj to…”, 12× „Usługi, które łączymy…”, 10× „Zanim zadzwonisz.” | H2 z nazwą usługi lub obiektu (lepiej też dla SEO), np. „Pytania o monitoring”, „Co jeszcze montujemy w pensjonatach” |

### Konkretne poprawki nagłówków (propozycje)
**Zostają, bo są najlepsze:**
- „Alarm, który budzi złodzieja, a nie Ciebie o trzeciej w nocy.”
- „Antena ustawiona miernikiem, nie na oko.”
- „Twój obiekt na żywo.”
- „Teletechnika budynku od pionu do gniazdka.”
- „Głośniej nie znaczy wyraźniej.”
- „Na Podhalu instalacja ma trudniej.”

**Do zmiany:**

| Strona / sekcja | Jest | Propozycja |
|---|---|---|
| Kontrola dostępu — H1 | Gość wchodzi sam o 23:00. Ty śpisz spokojnie. | Kod, karta albo telefon zamiast klucza pod wycieraczką. (dziś to samo zdanie jest w H1 Apartamentów) |
| Apartamenty — H1 | …Ty widzisz, że dotarł, i śpisz spokojnie. | Gość wchodzi sam o 23:00, a Ty dostajesz powiadomienie, że dotarł. |
| Nagłośnienie — H1 | Muzyka tam, gdzie trzeba. Cisza tam, gdzie ma być cicho. | Muzyka na sali, komunikat w holu, cisza na zapleczu. Każda strefa osobno. |
| Restauracje — H1 | Muzyka tam, gdzie trzeba. Kasa i Wi-Fi mają zapas… | Sobota, 21:00, pełna sala. Muzyka gra, kasa przyjmuje karty, Wi-Fi działa. |
| Ekrany — H1 | Ekrany, które mówią za Ciebie. Menu, pogoda, oferta. | Menu, cena dnia i warunki na stokach. Zmieniasz je z telefonu. |
| Ekrany — #gdzie | Ekran, który pracuje, a nie tylko świeci. | Witryna, kasa, recepcja. Każde miejsce potrzebuje innego ekranu. |
| Monitoring — #co-dostajesz | Kamery, które widzą to, co trzeba. I nie widzą tego, czego nie wolno. | Twarz przy furtce, tablica przy bramie. Bez podglądania sąsiada. |
| Kontrola dostępu — #firma | Każdy wchodzi tam, gdzie powinien. I o tej porze. | Magazynier do magazynu od 6:00, ekipa sprzątająca do biura po 18:00. |
| Alarmy — #przewod | Dobieramy system do budynku, a nie odwrotnie. | Przewody tam, gdzie się da. Radio tam, gdzie szkoda ścian. |
| Alarmy — baner | Zaprojektujemy alarm, który chroni, a nie denerwuje. | Strefy, tryb nocny i czujki, które nie reagują na kota. |
| Smart home — #integracje | …Wszystko się dogada. | Pompa ciepła, rekuperacja, alarm i kamery w jednej aplikacji Ampio. |
| Nagłośnienie — eyebrow | APART · nasz mocny punkt | APART · nagłośnienie montowane na stałe |
| Architekci — H1 (128 znaków) | Dla architektów, projektantów wnętrz, deweloperów i wykonawców: Technika… | H1: „Technika, która nie psuje projektu. Zaplanujmy ją przed tynkami.”; grupa odbiorców w nadtytule poza H1 (fraza jest w title) |
| Architekci — #pokaz | Najlepiej przekonuje pokaz na żywo. | Posłuchaj głośników w suficie, zanim wpiszesz je w projekt. (po potwierdzeniu, co jest w salonie) |
| Teletechnika — nadtytuł | Teletechnika · dla deweloperów… (słowo 2× w H1) | Dla deweloperów i wykonawców · Małopolska |
| Ładowarki — nadtytuł | Elzab EcoPower · … (marka 2× w H1) | Ładowarki do aut elektrycznych · Podhale |
| Realizacje — H1 | Wybrane realizacje PRO-KOM. | Realizacje: nagłośnienie, multimedia i sieci od Krakowa po Zakopane. |
| Kontrola dostępu — #cena | Od czego zależy cena. | Od czego zależy cena kontroli dostępu. |
| Usługi — FAQ (10×) | Zanim zadzwonisz. | Pytania o monitoring / alarm / … („Zanim zadzwonisz.” zostaje na głównej) |
| Dla kogo — #powiazane (12×) | Usługi, które łączymy w tym obiekcie. | Co jeszcze montujemy w pensjonatach / hotelach / … |
| Usługi — #odbior (21×) | Po montażu nie znikamy. Masz numer, pod który dzwonisz. | 24 miesiące gwarancji na montaż. Serwis pod jednym numerem. (konkret zamiast hasła; powtarzalność bloku jest OK) |

### Reguły dla każdej przyszłej treści (do `docs/strony/prokominstalacje.md` §8)
1. Najpierw konkret (kto, gdzie, kiedy, ile), potem obietnica. Hasło bez konkretu wyrzucamy.
2. Najwyżej jedna antyteza „X, a nie Y” na ekran.
3. Bez „śpisz spokojnie”, „mówi za Ciebie”, „wszystko się dogada”, „mocny punkt”, „najlepiej przekonuje”.
4. H2 sekcji powtarzalnej zawiera nazwę usługi albo obiektu.
5. H1 bez powtórzonego słowa i maks. ok. 90 znaków razem z nadtytułem, jeśli ten jest w H1.
6. Zdanie zaczynające się od „Dlatego” — tylko gdy naprawdę wynika z poprzedniego.

### Jak to wdrożyć
Teksty siedzą w trzech miejscach: `src/sites/instalacje/dane/*.ts`; seed (`seed/prokominstalacje/obiekty/*.json`, `strony-zrzut`); panel (tytuły i SEO).

1. Czat przygotowuje plik `docs/tresci/prokominstalacje-redakcja.md` z każdą zmianą: strona, pole, jest → ma być.
2. Claude Code w jednej sesji **I-T** nanosi zmiany w `dane/` i seedzie i puszcza `pnpm seed:instalacje`.
3. Na stagingu teksty z panelu poprawia się ręcznie według tej samej listy.

Szacunek: 0,5 wieczoru w kodzie. Kolejność: **I14b → I-T → I-M → I15**.
