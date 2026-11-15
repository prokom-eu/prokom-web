# prokombiznes.pl — zmiany wizualizacji v20 (20.10.2026)

> **Częściowo zastąpione przez K3 i K3.1 (25.10.2026)** — plan firmy, GoPOS, InsERT, O firmie, Kontakt, stopka i telefon wg `K31-ZMIANY.md` i `MOBILE-APLIKACJA.md`; pozostałe części v20 obowiązują. Kolejność ważności: `INDEKS.md`.

- **Status:** zatwierdzone przez Krystiana 20.10.2026 (wizualizacja Claude Design, wersja 111).
- **Pierwszeństwo:** ten plik ma pierwszeństwo przed `docs/strony/prokombiznes.md` §3–§4 i §8.4 oraz przed starymi zrzutami, dopóki spec. nie zostanie zaktualizowana. Sesja D1 (niżej) wnosi te zmiany do spec. i ADR-013.
- **Wzorzec:** zrzuty `screens/*` i plansze `boards/*` w tym pakiecie są już w wersji v20. Główna różnica dotyczy strony głównej (`Main`, `Mobile`). Na pozostałych planszach zmienił się tylko nagłówek i górny pasek.
- **Charakter wyglądu się nie zmienia** (v17): granat, karty, koło działów w hero, kolorowe ikony działów, szyna sekcji na ekranach ≥ 1400 px. Zmiany to porządkowanie, skrócenie i dopracowanie wybranych sekcji.

---

## 1. Zmiany globalne (wszystkie strony)

### 1.1 Nagłówek i menu (spec. §3.2) → poprawka do B3
- **Menu główne, w tej kolejności:**
  - Oferta ▾ (mega menu);
  - Opieka IT;
  - ● GoPOS;
  - ● InsERT;
  - O firmie;
  - Kontakt.
- **„Branże ▾” usunięte z menu**, razem z rozwijaną listą branż, na komputerze i w menu na telefonie.
  - Strony `/branze/*` zostają.
  - Prowadzą do nich: link na dole mega menu Oferta („Rozwiązania dla branż: gastronomia, handel, hotele →”), kafle branż na stronie głównej i stopka.
- **„Aktualności” nie ma w głównym menu.** Zostają w górnym pasku i w stopce, bez zmian.
- **Wyszukiwarka w nagłówku to ikona lupy** (przycisk 44×44 jak przełącznik motywu), z `aria-label` „Szukaj w ofercie (skrót /)”.
  - Szerokie pole „Szukaj w ofercie” usunięte.
  - Klik albo klawisz `/` otwiera tę samą nakładkę wyszukiwarki co dotąd.
- **Pozycje menu nigdy się nie łamią** (`white-space: nowrap`). Odstęp między pozycjami to 26 px.
  - Poniżej 1080 px, jak dotąd, menu pełnoekranowe („hamburger”).
  - Rząd musi się mieścić bez przewijania przy 1100, 1280 i 1440 px (test Playwright: `scrollWidth === innerWidth`).
- **Górny pasek:** usunięty link „Pomoc zdalna”. Zostaje:
  - „Zgłoś awarię” (link do `#kontakt` na stronie głównej, na innych stronach `/kontakt`);
  - „Aktualności”;
  - status godzin;
  - telefon.

### 1.2 Pomoc zdalna
- Pomoc zdalna (AnyDesk, TeamViewer, „pomagamy zdalnie”) **występuje tylko na `/opieka-it`**.
- Na stronie głównej i w nagłówku nie ma o niej ani słowa.
- Teksty z planszy już to uwzględniają (FAQ: „Ustalamy przyczynę i naprawiamy, a gdy trzeba, przyjeżdża serwisant z Rabki.”).

### 1.3 E-mail linii Biznes
- **E-mail kontaktowy Biznesu to `biznes@pro-kom.eu`** (pole w `SiteSettings`, nie na sztywno).
- Na stronie głównej występuje w karcie faktów, w karcie kontaktu przy FAQ i w formularzu.
- **[KRYSTIAN]** Stopka na planszy pokazuje jeszcze `biuro@pro-kom.eu`. Docelowo stopka bierze adres z tego samego pola, więc zmiana nastąpi przez panel.

### 1.4 Przyciski — błąd planszy, nie wzorzec
- Na niektórych planszach (Plan firmy: „Przygotuj zapytanie: …”, `Dzial`, `Produkt`, `Insert`, `Kategoria`) przycisk główny będący linkiem ma ciemny tekst na niebieskim tle.
- To błąd planszy. **W kodzie tekst przycisku głównego zawsze ma kolor `--accInk`** (biały w jasnym motywie). Test kontrastu axe ma to wyłapać.

---

## 2. Strona główna — nowa kolejność i wygląd (zastępuje spec. §4)

| # | Sekcja | Kotwica | Tło | Zmiana względem v17 |
|---|---|---|---|---|
| 1 | Hero | `#start` | jasne | patrz 2.1 |
| 2 | 4 kafelki potrzeb | — | jasne | bez zmian |
| 3 | Marki (pasek) | — | jasne | bez zmian |
| 4 | **Oferta** | `#oferta` | białe | **nowa**, patrz 2.2 |
| 5 | **Najczęściej wybierane** | `#wybierane` | `--bg2` | **nowa**, patrz 2.3 |
| 6 | Plan Twojej firmy + branże + dofinansowania | `#plan` | jasne | branże skrócone, patrz 2.4 |
| 7 | Jak pracujemy | `#jak-pracujemy` | jasne | bez zmian |
| 8 | Pięć firm czy jedna | `#jeden` | granat | **krótsza**, patrz 2.5 |
| 9 | Dla kogo pracujemy | `#referencje` | `--bg2` | bez zmian |
| 10 | Fakty: słowo właściciela + **karta faktów** | `#fakty` | jasne | **nowa karta**, patrz 2.6 |
| 11 | **Ostatnio w Aktualnościach** | — | jasne | **3 karty**, patrz 2.7 |
| 12 | **FAQ** | `#faq` | `--bg2` | **nowy wygląd**, patrz 2.8 |
| 13 | **Formularz kontaktowy** | `#kontakt` | jasne | **nowy, jeden ekran**, patrz 2.9 |

**Usunięte:**
- sekcja „Masz konkretną sprawę? Wybierz — załatwimy ją szybciej” (Zgłoś awarię / Zmień serwis kasy / Przypomnij o przeglądzie / Pomoc zdalna);
- stary blok faktów z dużymi kaflami (22 lata / 100+ / autoryzacje / numer telefonu) i mapą okolicy;
- przewijany pasek „Ostatnio u nas”.

Wzorzec: `screens/Main-1440-light/01–09.jpg`, `Main-1440-dark/*`, `Mobile-390-light/*`, `Mobile-390-dark/*`. Teksty: `boards/Main.dc.html`.

### 2.1 Hero
- **Druga część H1 („Jeden telefon do wszystkiego.”) jednolitym kolorem akcentu:** `--acc`, w ciemnym motywie `#8FB0F4`. **Bez gradientu.** Wymaga dopisku do ADR-013 (patrz §4).
- Bez rozmytych poświat w tle hero. Siatka kropek i koło działów zostają.
- Przycisk „Dobierz zestaw w 60 sekund” bez pigułki „60 s” w środku.
- Lead: „Dobieramy, wdrażamy i serwisujemy wszystko, na czym pracuje Twoja firma: od kasy fiskalnej po serwer. Jeden partner z Rabki zamiast kilku firm i infolinii.”

### 2.2 Oferta `#oferta`
- **Nagłówek sekcji:**
  - etykieta „Oferta” i H2 „Wszystko dla firmy, w pięciu działach.”;
  - lead: „67 produktów i usług od 25 marek. Cen nie ma na stronie: dodajesz pozycje do zapytania, a wycenę dostajesz na piśmie, pod swoją firmę.” (liczby z bazy);
  - po prawej przycisk obrysowany „Cały katalog · 67 pozycji →”.
- **5 kart działów** (siatka 5 kolumn, odstęp 16 px), od góry:
  1. **Witryna** (wysokość 150 px, promień 19 px):
     - tło w kolorze działu (gradient z koloru grupy rozjaśniony do `--bg2`);
     - 2 zdjęcia produktów: większe z lewej na dole, mniejsze z prawej u góry; po najechaniu lekko się unoszą;
     - zdjęcia na start: sprzedaż `ergo`+`d3`, biuro `tp`+`srvT`, oprogramowanie `nexo`+`goposScr`, bezpieczeństwo `u7`+`eset`;
     - **Serwis i usługi zamiast zdjęć ma 2 białe paski statusu:** „● Opieka IT · aktywna”, „● Przegląd kasy · za 43 dni”.
     - Pole `CatalogGroups.showcase` (2 relacje do Media) albo konfiguracja w panelu.
  2. **Ikona działu** 46×46 w kolorze grupy, zachodząca na dolną krawędź witryny (ujemny margines −23 px, biała obwódka 4 px).
  3. **Nazwa** 18 px Archivo 800 i opis 14,5 px.
  4. Linia, a pod nią **3 największe kategorie działu jako linki** z liczbą pozycji w małym szarym znaczniku (liczone z bazy, sortowane malejąco).
  5. Na dole pasek w `--bg2`: „25 pozycji · Cały dział →”. Po najechaniu wypełnia się akcentem, tekst biały.
  - **Telefon:** każdy dział to jeden wiersz: ikona 48 px, nazwa, liczba pozycji. Bez witryny, opisu i kategorii.
- **Podtytuł:** „Systemy, które wdrażamy od początku do końca” · po prawej „Dwa autoryzowane partnerstwa i nasza usługa opieki IT”.
- **3 jednakowe karty flagowe** (ten sam komponent, siatka 3 kolumn, granat `#0A1430`, bez poświat):
  - u góry obraz (180 px);
  - pod nim wiersz: białe logo + plakietka „✓ Autoryzowany partner” / „✓ Usługa PRO-KOM”;
  - tytuł biały, opis, link.

  | Karta | Obraz | Tytuł | Opis | Link |
  |---|---|---|---|---|
  | GoPOS | zestaw GoPOS | „GoPOS dla gastronomii” | „Jeden system na salę, kuchnię i dowozy. Sprzęt Sunmi i Posnet, szkolenie w lokalu i serwis w sezonie.” | „Poznaj GoPOS z PRO-KOM →” |
  | InsERT | pudełko Subiekt nexo | „Subiekt i programy InsERT” | „Dobieramy program, przenosimy dane i łączymy go z kasą i KSeF. Szkolimy na Twoich dokumentach.” | „Który Subiekt dla mnie?” |
  | **Opieka IT** | **mini panel 3 statusów** (Kopia danych z nocy · sprawdzona; Aktualizacje na 4 komputerach · gotowe; Przegląd kasy fiskalnej · za 43 dni) | „Opieka IT w abonamencie” | „Informatyk na telefon w stałej opłacie: monitoring, kopie, aktualizacje i serwis. Zaczynamy od bezpłatnego przeglądu.” | „Umów bezpłatny przegląd IT →” |

  - Nagłówki kart są **zawsze białe** (także w jasnym motywie).
  - Na telefonie i tablecie karty idą jedna pod drugą.

### 2.3 Najczęściej wybierane `#wybierane` (tło `--bg2`)
- **Nagłówek:**
  - etykieta „Najczęściej wybierane” i H2 „Osiem pozycji, o które firmy pytają najczęściej.”;
  - lead: „Każdą dodasz do zapytania jednym kliknięciem. Resztę oferty znajdziesz w katalogu.”;
  - przycisk „Cały katalog · 67 pozycji →”.
- **8 produktów, 4 w rzędzie** (karta katalogu jak na `/oferta`):
  - zdjęcie 180 px, logo marki, nazwa 17 px;
  - **jedno zdanie korzyści** (2 linie max);
  - maks. 1 odznaka;
  - „Szczegóły →” i „+ Do zapytania”.
  - Bez tagów.
- **Lista startowa:** `ergo, k10, pol, d3, hx, tp, euro, nas` (pole `featured` + `featuredOrder`). **Zastępuje listę 12 pozycji z seeda.** **[SZEF]** Lista docelowa ma wynikać z faktycznej sprzedaży.
- **Telefon:** produkty w poziomo przewijanym pasku (scroll-snap, karta 78% szerokości).
- **Pod produktami 2 karty CTA** (niższe niż w v17, bez licznika 67/25/20 i bez ikony zegara):
  - „Cała oferta” (granat, mozaika miniatur, przycisk „Poznaj całą ofertę”);
  - kreator (ciemna zieleń, podgląd 4 kroków, przycisk „Dobierz zestaw w 60 sekund”).

### 2.4 Plan Twojej firmy — siatka branż
- Siatka „Nie widzisz swojej branży? Obsługujemy każdą firmę.” **pokazuje 9 branż i dziesiąty kafel „Pokaż wszystkie branże · jeszcze 10 i każda inna firma”** (biały, granatowa ramka).
  - Klik rozwija na miejscu resztę branż i kafel „Każda inna firma” (→ kreator).
  - Na telefonie widać 5 branż + ten kafel.
- **Kolejność 9 widocznych:**
  1. Sklep spożywczy
  2. Sklep odzieżowy i branżowy
  3. Restauracja, bar, kawiarnia
  4. Pensjonat, hotel, apartamenty
  5. Fryzjer, kosmetyka, beauty
  6. **Gmina, urząd, biblioteka**
  7. Biuro rachunkowe
  8. Gabinet, przychodnia
  9. Szkoła, przedszkole
- **Po rozwinięciu:**
  - Stragan, handel obwoźny
  - Food truck
  - Mechanik i serwis
  - Zakład produkcyjny
  - Hurtownia
  - Firma transportowa
  - Kancelaria
  - Sklep internetowy
  - Apteka
  - Stacja paliw, myjnia
  - Każda inna firma
- Kolejność to dane (lista w panelu), nie kod.
- Szerokość sekcji planu jak reszta strony (kontener 1280 px).

### 2.5 Pięć firm czy jedna `#jeden` — krótsza
- **Telefon z animacją kontaktów, przełącznik „Osobne firmy / Jeden partner: PRO-KOM” i dymki zostają bez zmian.**
- **Usunięty** pasek liczb „Numery do spraw IT 6 → 1 / Firmy do koordynowania 6 → 1 / Kto zna całą firmę”.
- **Przyciski** „Chcę jeden numer do wszystkiego” i „889 003 889” są w lewej kolumnie pod wierszami. Nie ma osobnego pasa na dole, a zdanie podsumowania jest usunięte.
- Wiersze zwarte (ikona 40 px, padding 11×14, opis 14,5 px). Podpowiedź „Przełącza się samo” jest ukryta.
- **Telefon (390 px):**
  - wiersze jako siatka 2×2 z samymi tytułami, bez opisów i bez pigułek „osobno / z PRO-KOM”;
  - telefon pomniejszony do ok. 86%;
  - przyciski na pełną szerokość.
- Docelowa wysokość: ok. 1 040 px na desktopie i ok. 1 450 px na telefonie (było 1 490 / 2 590).

### 2.6 Fakty `#fakty`
- **Karta „Słowo od właściciela” zostaje.** Placeholder zdjęcia pokazujemy tylko za flagą. **[SZEF]** Decyzja: zdjęcie czy ikona.
- **Pod nią jedna niska, granatowa karta faktów** (promień 28 px, ok. 200 px wysokości, 3 kolumny oddzielone cienkimi liniami):
  1. **Liczby:** „100+ / firm pod stałą opieką” i „4 / autoryzacje i partnerstwa” (Archivo 38 px, biały). „2004” nie powtarzamy, bo jest w karcie właściciela.
  2. **Kontakt** (ikona w kafelku 32 px + tekst):
     - 889 003 889 (`tel:`);
     - biznes@pro-kom.eu (`mailto:`);
     - ul. Orkana 16B, Rabka-Zdrój (link do trasy w Mapach Google);
     - „pn–pt 9:00–17:00 · {status na żywo}” z kropką statusu.
  3. **Autoryzacje:**
     - podpis „Autoryzowany serwis i partner”;
     - 4 logo na białych kafelkach 40 px: Posnet, Elzab, InsERT, GoPOS;
     - zdanie „Dojeżdżamy do firm na całym Podhalu i w Małopolsce.” + link „Kontakt i dojazd →”.
- Na tablecie: 2 kolumny, autoryzacje pod spodem. Na telefonie: jedna kolumna, logo 2×2.
- **Wszystkie dane z `CompanyData` / `SiteSettings` i `Partners`**, nic na sztywno.

### 2.7 Ostatnio w Aktualnościach
- Nagłówek „Ostatnio w Aktualnościach” + link „Wszystkie aktualności →”.
- **3 karty** (3 ostatnie wpisy `Posts`): kategoria w znaczniku, data, tytuł 19 px, „Czytaj →”.
- Na telefonie i tablecie karty idą jedna pod drugą.
- Gdy wpisów jest mniej niż 3, pokazujemy tyle, ile jest. Przy 0 sekcja jest ukryta.

### 2.8 FAQ `#faq`
- **Lewa kolumna (sticky):**
  - etykieta, H2 „Zanim zadzwonisz”;
  - lead: „Najczęstsze pytania od firm z Podhala. Nie ma tu Twojego pytania? Zadzwoń albo napisz, odpowiemy od ręki.”;
  - **mała biała karta kontaktu:** status godzin, duży przycisk „📞 889 003 889”, pod nim linki WhatsApp i biznes@pro-kom.eu.
- **Prawa kolumna:** każde pytanie to osobna biała karta (promień 18 px, odstęp 10 px):
  - numer „01–06” w akcencie, pytanie 16,5 px 800;
  - po prawej okrągły przycisk „+” 34 px, który po otwarciu obraca się w „×” na tle akcentu;
  - karta otwarta ma ramkę akcentu i cień;
  - **pierwsze pytanie otwarte na start.**
- `<details>/<summary>` + JSON-LD `FAQPage` jak w spec.
- Pytania jak w v17 (6 szt.), z poprawioną odpowiedzią „Co, gdy coś przestanie działać?” (bez pracy zdalnej).

### 2.9 Formularz kontaktowy `#kontakt` — ogólny, jeden ekran (zastępuje formularz w 3 krokach)
- **Lewa strona (granat):**
  - status godzin;
  - H2 „Napisz, czego potrzebujesz. Odezwiemy się szybko.”;
  - lead: „Jedna wiadomość wystarczy. Oddzwonimy w ciągu 60 minut w godzinach pracy, a wycenę przygotujemy na piśmie.”;
  - 3 kafle: Telefon 889 003 889 · WhatsApp 889 003 889 · E-mail biznes@pro-kom.eu;
  - na dole „ul. Orkana 16B, Rabka-Zdrój · pn–pt 9:00–17:00”.
- **Prawa strona (biała):**
  - nagłówek „Formularz zapytania”, podtytuł „Pola z gwiazdką są wymagane. Resztę dopiszemy razem przez telefon.”, linia;
  - **pola z ikonami po lewej** (osoba, telefon, budynek, koperta), wysokość 54 px, białe tło, ramka 1,5 px `--line`; po najechaniu ramka ciemnieje, po focusie ramka akcentu i obwódka 4 px `rgba(36,79,176,.12)`;
  - siatka 2×2:
    - **Imię \*** | **Telefon \***
    - Firma | E-mail
  - **„W czym możemy pomóc? \*”**: textarea min. 130 px, placeholder z przykładem („Otwieramy kawiarnię w grudniu, potrzebujemy kasy i terminala”);
  - zgoda RODO (checkbox z linkiem do polityki);
  - przycisk „Wyślij zapytanie →” (56 px, cień);
  - pod nim 3 zielone potwierdzenia: „Odpowiedź w 60 min · Wycena na piśmie · Bez zobowiązań”.
- **Bez chipów z tematami i bez kroków.**
- **Po wysłaniu:** ekran „Dziękujemy, zapytanie wysłane.” z tekstem „Oddzwonimy w ciągu 60 minut w godzinach pracy. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.” i przyciskiem „Wyślij kolejne”.
- **Walidacja:** wymagane imię, telefon i wiadomość. E-mail opcjonalny, ale gdy podany, sprawdzany jest jego format. Typ zgłoszenia `kontakt`.
- **Telefon:** jedna kolumna, przycisk na pełną szerokość.
- **Uwaga:** to zmienia spec. §8.4 dla formularza kontaktowego.
  - Pole „tematy” zostaje w modelu `Inquiries` (używa go np. „Zapytaj o X”), ale ten formularz go nie wysyła.
  - Formularz `/zapytanie` (lista) i kreator bez zmian.
  - Na `/kontakt` używamy tego samego komponentu.

---

## 3. Nie zmieniamy (żeby nie było wątpliwości)
- Kolory działów (5 kolorów grup), kolorowe ikony branż i kafelków potrzeb, szyna sekcji ≥ 1400 px, koło działów w hero, „Plan Twojej firmy”, „Jak pracujemy”, „Dla kogo pracujemy”.
- Katalog, produkt, kategoria, GoPOS, InsERT, Opieka IT, kreator, O firmie, Aktualności, wpis, Kontakt: bez zmian poza nagłówkiem i górnym paskiem.
- **Animacje wejścia sekcji** zostają w kodzie (spec. §8.5). Na planszach są wyłączone tylko dlatego, że plansza się nie przewija; to nie jest zmiana wzorca.

## 4. Do wniesienia w dokumentach (sesja D1)
1. **`docs/strony/prokombiznes.md`:**
   - §3.2 według §1.1;
   - §3.1 górny pasek według §1.1;
   - §4 zastąpić tabelą i opisami z §2;
   - §8.4 według §2.9;
   - §1 e-mail Biznesu według §1.3;
   - w §11 dopisać „v20 (20.10.2026)”.
2. **ADR-013 (kolory):** rozstrzygnięcie „H1 bez gradientu: druga część nagłówka hero jednolitym `--acc` (ciemny: `#8FB0F4`); usunięte poświaty hero”. Tokeny gradientu H1 usunąć, jeśli nieużywane.
3. **ADR-012:** `CatalogGroups.showcase` (do 2 zdjęć lub tryb „statusy”), `Industries.homeOrder` + `homeVisible` (9 widocznych), `featured` = 8 pozycji.
4. **`seed/prokombiznes/katalog.json`:** `kolejnosc_wyroznionych` = `ergo, k10, pol, d3, hx, tp, euro, nas`, flagi `wyrozniony_na_glownej` odpowiednio. **Nie nadpisywać pliku z pakietu**, tylko zmienić te pola, bo B0 dopisał beauty i vending.
5. **`docs/zadania/prokombiznes.md`:**
   - B3c (poprawka nagłówka) przed B5;
   - B7 i B8 według promptów w `PRZEKAZANIE.md` / czacie.

## 5. [SZEF] — bez zmian, przypomnienie
- Lista 8 wyróżnionych wg sprzedaży.
- Zdjęcie właściciela czy ikona.
- Opinie i logo klientów (zgody).
- Ulga 700 zł ze źródłem.
- Statusy partnerów.
- Godziny i NIP.
- Treść kafla KSeF: obecny tekst „KSeF od 1 stycznia 2027” jest nieścisły. Od 1.04.2026 obowiązek mają wszyscy, a do końca 2026 r. trwają tylko wyjątki dla faktur z kas i firm do 10 000 zł miesięcznie (MF, pytania i odpowiedzi KSeF 2.0). Do korekty treści w panelu przed publikacją.
