# prokominstalacje.pl — runda v5 „premium” (03.11.2026)

Źródło: uwagi Krystiana 03.11 (zrzuty hero, pas marek, Dla kogo, architekci) oraz audyt w Chrome (develop 740e233). Decyzje z tego pliku mają pierwszeństwo przed prototypem v4.2 tam, gdzie się różnią. Spec §2 (decyzje biznesowe) obowiązuje bez zmian.

Zasady stałe:
- bez WhatsAppa i bez zdjęć ludzi (decyzja 01.11);
- zero cen sprzętu;
- ruch tylko przez `transform`/`opacity`/`filter`/`clip-path`; jedyny wyjątek to rozwijanie FAQ i sekcji (§9), bo zmianę układu wywołuje tam kliknięcie użytkownika, a CLS jej nie liczy;
- `prefers-reduced-motion` = nic się nie przesuwa;
- kolory tylko z tokenów.

## 0. Kolejność i podział

| Sesja | Zakres | Szacunek | Kiedy |
|---|---|---|---|
| **V5-A** | §1 hero, §2 logo marek, §3 Dla kogo, §9 domknięcie ruchu (FAQ, punkty przekrojów, wjazd na podstronach) | 1,5 wieczoru | **przed stagingiem** |
| **V5-B** | §4 realizacje ze zdjęciami (migracja `photos`), §7 architekci bez przesyłania plików + zdjęcia Nowych rozwiązań | 1,5 | **przed stagingiem** |
| **V5-C** | §5 Na Podhalu, §6 Jak pracujemy, §8 Pełna oferta, §10 Teletechnika (treść) | 1,5–2 | po stagingu, przed produkcją |
| **V5-D** | §11 przegląd podstron: drobne ulepszenia z listy | 0,5–1 | przed produkcją |

**Dlaczego tak:** A i B naprawiają to, co szef zobaczy w pierwszych 10 sekundach (ucięte hero, gołe nazwy marek, martwe karty, ikony zamiast zdjęć). C i D to podniesienie poziomu sekcji, które już działają. Nie blokują one stagingu, więc staging nie czeka na całość.

---

## 1. Hero strony głównej

### 1.1 Problemy (stan 03.11)
- Sekcja `#start` ma **stałą wysokość 1000 px** (113–1113 px od góry) bez względu na ekran. Przy oknie 1440×900, 1366×768, 1536×864, a także na monitorze Krystiana (wysokość ok. 920 px), panel „Na żywo”, pasek instalacji i „Zaplanuj taki zestaw” są **pod linią ekranu**. To jest „ucięte na dole”.
- Podgląd kamery („KAM 3 · Podjazd”) zachodzi na dach i budynek. Na szerokich ekranach (2000 px i więcej) przykrywa środek sceny.
- Etykieta „Osoba 97%” jest kilka razy większa niż reszta etykiet sceny.
- Na hero działa naraz 7 grup elementów: zakładki obiektów, pora dnia, kamera, panel „Na żywo”, pasek instalacji, etykiety, punkty. Za dużo rzeczy konkuruje o uwagę.
- Przy automatycznej zmianie Noc → Zima tekst przez ułamek sekundy jest jasny na jasnym tle.

### 1.2 Tekst
- H1: **„Twój inteligentny obiekt na żywo.”** Akcent (kolor) zostaje na „na żywo.”, łamanie: „Twój inteligentny / obiekt na żywo.”.
- Nadtytuł i lead bez zmian.

### 1.3 Nowy układ (desktop ≥ 1280 px)
Wysokość: `block-size: clamp(640px, calc(100svh - var(--hdr-h)), 920px)`. Cała treść hero mieści się w pierwszym ekranie przy każdej wysokości od 768 px.

```
┌──────────────────────────────────────────────────────────────────────┐
│ [pill lokalizacji]                     [Dom Pensjonat Hotel … Firma] │  ← zakładki obiektów (prawy górny róg)
│ nadtytuł                                         [Dzień Noc Zima]   │
│ Twój inteligentny                                                    │
│ obiekt na żywo.          ┌──────────── SCENA ─────────────┐          │
│ lead (4 linie)           │   budynek w „strefie bezpiecznej” │ ┌─────┐ │
│ [Zaplanuj] [Telefon]     │   (prawe 58 % sekcji)             │ │ KAM │ │ ← podgląd kamery: prawa krawędź,
│ ✓ od 2004 ✓ salon ✓ …    └───────────────────────────────────┘ └─────┘ │   nigdy nad budynkiem
│ ┌───────────────── DOK (jeden pasek, przyklejony do dołu sekcji) ────┐ │
│ │ ● Na żywo · Dom · Zima — Alarm rozbrojony · Wi-Fi w całym domu  … │ │ ← status (1 linia, zmienia się z przenikaniem)
│ │ [Kamery✓][Alarm✓][Domofon+][Wi-Fi✓][Smart home+][EV+][Dźwięk+][Ekrany+] │ Zaplanuj taki zestaw → │
│ └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

- **Panel „Na żywo” wchodzi do doku** jako górna linia statusu. Dziś to osobna karta, która nachodzi na pasek. Lista „co działa” pokazuje 2 pozycje i „+N” na tej samej linii.
- **Scena:** SVG skalowane do sekcji, budynek zawsze w strefie bezpiecznej: prawa część sekcji, nad dokiem, pod zakładkami. Implementacja: `viewBox` każdej sceny z kotwicą budynku, `preserveAspectRatio="xMaxYMax meet"` dla warstwy budynku; tło (góry, niebo, śnieg) to osobna warstwa `slice` na całą szerokość. Na ekranach ≥ 2000 px scena ma `max-inline-size`, a reszta to samo tło. Koniec z kamerą na środku budynku.
- **Podgląd kamery:** zakotwiczony do prawej krawędzi sceny, pod przełącznikiem pory dnia, szerokość `clamp(220px, 18vw, 300px)`. Ukryty, gdy sekcja ma mniej niż 700 px wysokości albo okno mniej niż 1280 px szerokości (wtedy obraz kamery pokazuje się po kliknięciu punktu kamery).
- **Etykiety na scenie** („Osoba 97%”, „21°”, „20°”): jedna skala `font-size: clamp(11px, .8vw, 13px)`, ten sam styl kapsułki.
- **Hierarchia:** zakładki obiektów i pora dnia jako jedna grupa w prawym górnym rogu (pora dnia pod spodem, mniejsza). Tekst po lewej z lekkim przyciemnieniem tła pod spodem (gradient z tokenów), żeby czytelność nie zależała od sceny.

### 1.4 Szerokości pośrednie
- **1024–1279 px:** bez podglądu kamery; dok w dwóch rzędach (status, a pod nim chipy z przewijaniem w poziomie i snapem); „Zaplanuj taki zestaw” na końcu rzędu chipów.
- **< 1024 px:** obecny układ telefonu bez zmian. Poprawić tylko to, żeby scena nie była ucięta na górze.

### 1.5 Ruch na hero
- **Wejście:** tekst kaskadą co 60 ms; scena z `opacity 0 → 1` i `scale .98 → 1` (520 ms); punkty pojawiają się po kolei co 40 ms; dok wjeżdża 12 px z dołu.
- **Zmiana obiektu:** przenikanie scen 300 ms. Wskaźnik aktywnej zakładki przesuwa się (`SlidingPill`), a pod nią cienki **pasek postępu autoodtwarzania**, żeby było widać, że za chwilę zmieni się obiekt. Pauza przy najechaniu, focusie i dotyku sceny.
- **Pora dnia:** przenikanie nieba i oświetlenia 400 ms. **Kolor tekstu zmienia się w tej samej klatce co tło** (jedna zmienna CSS na `#start`, nie dwie). To naprawia błysk jasnego tekstu na Zimie.
- **Chip instalacji:** ✓ rysuje się (`stroke-dashoffset`), wiązki i zasięgi na scenie pojawiają się przez `opacity` i `clip-path` od źródła.
- **Ograniczenie ruchu:** stan końcowy od razu, bez autoodtwarzania.

### 1.6 Odbiór (test e2e `hero-uklad.e2e.spec.ts`)
Dla 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1080 i 4096×1009:
- tekst, zakładki, pora dnia, kamera i dok mieszczą się w oknie i nie nachodzą na siebie (prostokąty bez części wspólnej);
- budynek nie jest przykryty przez kamerę ani dok;
- dok kończy się nad dolną krawędzią okna.

Zrzuty przed/po w PR.

---

## 2. Pas „Marki, z którymi pracujemy”

- **Logo zamiast samych nazw.** Pliki w pakiecie: `marki/*.webp` (+ `.png`), przycięte, przezroczyste tło, wysokość 120 px (2×). Marki: dahua, hikvision, bcs, satel, ubiquiti, ampio, elzab-ecopower, samsung, apart, rcf, mikrotik. Miejsce w repo: `public/instalacje/marki/`.
- **Kafel zawsze biały w obu motywach** (`--brand-tile` w `tokens.css`, w ciemnym też jasny z delikatną ramką). Część logo jest czarna albo szara, a oryginalne pliki mają białe wnętrza liter, więc na ciemnym tle by zginęły.
- **Spoczynek:** `filter: grayscale(1)` i `opacity: .72`. **Najechanie:** kolor marki, kafel unosi się o 3 px z cieniem (200 ms, `--ease-out`). Pod logo zostaje mała kategoria („KAMERY”) jak dziś.
- Logo wysokości ok. 30–34 px w kaflu, optycznie wyrównane: RCF i Samsung mniejsze, bo mają masywne kształty. Do tego wpis w danych `scale` na markę.
- **Telefon:** rząd przewijany ze snapem i wygaszonymi krawędziami (bez automatycznej karuzeli).
- `alt` = „Logo Dahua” itd.; w dostępności kategoria jako tekst.
- Lista marek z panelu (`InstalacjeSettings` albo dane linii), plik logo przypisany do klucza marki.

---

## 3. „Dla kogo pracujemy” (12 kart)

**Problem:** klikalny jest tylko link „Zobacz rozwiązania →”; obrazek i reszta karty nie prowadzą nigdzie, a ilustracja (góry) jest statyczna.

- **Cała karta jest linkiem** do `/dla-kogo/<slug>`: „stretched link” na tytule. „Pokaż na żywo” zostaje osobnym przyciskiem nad linkiem (przewija do hero i przełącza obiekt) tylko tam, gdzie obiekt jest w hero.
- **Podgląd obiektu:** zamiast gołych gór w prawym dolnym rogu mini-przekrój budynku danego obiektu, uproszczona sylwetka w kolorze karty z 3–4 punktami. SVG z istniejących scen obiektów (`zrodlo/pages/Seg*.body.html`), uproszczone do sylwetki.
- **Najechanie (i focus):** karta unosi się o 4 px z cieniem w kolorze obiektu; sylwetka wyjeżdża o 8 px w górę i punkty zaczynają pulsować kolejno; ikona w kółku skaluje się do 1,06; strzałka „→” przesuwa się o 4 px. Czas 280 ms, `--ease-out`; punkty 1,6 s w pętli tylko podczas najechania.
- **Wejście przy przewijaniu:** kaskada kart co 50 ms (`.rv .ri`).
- **Telefon:** dotknięcie = stan wciśnięcia (`scale .98`), karta prowadzi do strony obiektu.

---

## 4. Realizacje — prawdziwe zdjęcia i opisy z pro-kom.eu

Źródło: https://pro-kom.eu/realizacje — 13 realizacji × 4 zdjęcia (52 pliki). Adres pliku: `https://pro-kom.eu/api/media/file/<nazwa>`. Claude Code pobiera je sam (`curl`), bo z czatu nie da się zapisać ich do repo. Kopie są też w folderze Pobrane Krystiana jako `real-NN-<nazwa>.jpg`.

| # | Realizacja | Opis z pro-kom.eu | Pliki (`.jpg`) |
|---|---|---|---|
| 1 | BLACHOTRAPEZ — Ponice | Sala szkoleniowa. Sprzedaż, montaż instalacji audiowizualnej. | 20160722_111814, 20160722_111423, 20160722_111507, 20160722_111414 |
| 2 | Caffe Europa — Nowy Sącz | Sprzedaż, montaż instalacji reklamowo-wizualnej. Wdrożenie oprogramowania. | 20161208_054739, 20161208_021416, 20161208_021520, 20161208_021427 |
| 3 | Parafia św. Teresy — Rabka-Zdrój | Sprzedaż, montaż instalacji audiowizualnej. | 20160722_160449, 20160722_155532, 20161005_153257, 20160722_155457 |
| 4 | Restauracja Aleksandra — Mszana Dolna | Sprzedaż, montaż instalacji audiowizualnej. | 20170407_201958, 20170407_173508, 20170424_165527, 20170412_161956 |
| 5 | Blachotrapez — Rabka-Zdrój | Sala marketingowa. Sprzedaż, montaż sprzętu projekcyjnego. | 20160318_095426, 20160318_095449, 20160318_095642, 20160318_095436 |
| 6 | Parafia Narodzenia św. Jana Chrzciciela — Ślemień | Montaż systemu nagłośnienia. | 20160531_154017, 20160525_124018, 20160531_154509, 20160531_130442 |
| 7 | Blachotrapez — Rabka-Zdrój | Stanowiska biurowe. Wykonanie instalacji przyłączy IT. | 20170419_154101, 20170419_154130, 20170419_154123, 20170421_142239 |
| 8 | SP im. Adama Mickiewicza — Rabka-Zdrój | Sprzedaż, montaż sprzętu projekcyjnego. | 20160315_162101, 20160315_165433, 20160315_165329, 20160315_170640 |
| 9 | Blachotrapez — Rabka-Zdrój | Samochód reklamowy. Instalacja nagłośnieniowa na zewnątrz pojazdu. | 20160624_095720, 20160624_095816, 20160624_095923, 20160629_085149 |
| 10 | Zakłady Bukmacherskie — Kraków | Sprzedaż, montaż sprzętu projekcyjnego. | 20161221_234424, 20161222_002804, 20161222_002846, zbkrk |
| 11 | Blachotrapez — Rabka-Zdrój | Sala konferencyjna. Audio, projekcja, przyłącza IT. | 20170419_151356, 20170419_153352, 20170419_151403, 20170421_142204 |
| 12 | Dom prywatny — Ponice | Instalacja RTV-SAT. | 20161121_124515, 20161121_124218, 20161121_124455, 20161121_125506 |
| 13 | Parafia św. Teresy — Rabka-Zdrój | Nagłośnienie chóru. | 20170125_133515, 20170127_160252, 20170127_144203, 20170127_160824 |

Zasady:
- **Zdjęcia:** przegląd każdego pliku. Odrzucić zdjęcia z rozpoznawalnymi twarzami (zasada „bez zdjęć ludzi”), nieostre i z danymi (tablice rejestracyjne → rozmycie). Obróbka: `sharp` → WebP, 1600 px dłuższy bok + miniatura 640 px, lekkie wyrównanie ekspozycji i balansu bieli (zdjęcia z telefonu z 2016–2017), kadr 4:3. Do `seed/prokominstalacje/realizacje/media/<nr>/`.
- **Seed:** 11 realizacji z repo (`Realizacje.json`) pokrywa się z tą listą. Dopisać brakujące: Zakłady Bukmacherskie Kraków (kat. Multimedia i projekcja) i Dom prywatny Ponice (kat. Anteny, `kind` dom), oba ze zgodą jak reszta. Rok z nazw plików (2016–2017). Opisy wg tabeli, przeredagowane w stylu strony (konkret, bez „Sprzedaż, montaż…” na początku każdej). Przykład dla 11: „Sala konferencyjna Blachotrapezu: nagłośnienie, projektor z ekranem i przyłącza sieciowe przy stole.”
- **Model:** `Realizations.photos` (tablica: `image` upload Media, `alt`) + migracja. Pierwsze zdjęcie = okładka.
- **Wygląd:** karta ze zdjęciem 4:3 zamiast ikony. Najechanie: zdjęcie przybliża się do 1,04 w ramce, a nakładka pokazuje „4 zdjęcia →”. Klik otwiera **galerię** (dialog `<dialog>`, strzałki, klawiatura ←/→/Esc, przesunięcie palcem, licznik 1/4, podpis). Na głównej 4 wyróżnione, na `/realizacje` wszystkie z filtrem (przejście filtra: przenikanie + przesunięcie 8 px).
- Te same zdjęcia w sekcjach „Nasze realizacje” stron obiektów i „Realizacje nagłośnienia”.

---

## 5. „Na Podhalu instalacja ma trudniej” (wizualnie wyżej)

- **Tło sekcji:** pełnej szerokości pasmo gór (warstwy SVG w 3 planach). Przy przewijaniu warstwy przesuwają się z różną prędkością (`transform: translateY`, maks. 24 px, scroll-driven animation `animation-timeline: view()`, bez JS; bez wsparcia = statycznie).
- **Karty problemów** (Mróz i śnieg, Burze, Słabe łącze, Domy na wynajem, Przegląd przed sezonem, Salon blisko): każda z małą sceną-ikoną zamiast samej ikony w kółku i liczbą-faktem (te z audytu v4, np. −28,5°C 7.02.2023 w Kotlinie Orawsko-Nowotarskiej). Najechanie odpala krótką animację sceny: śnieg sypie, błysk burzy, sygnał zanika i wraca (600 ms, raz).
- Subtelny opad śniegu w tle sekcji: CSS, 20–30 płatków, tylko gdy sekcja jest w widoku, wyłączony przy ograniczeniu ruchu.
- Układ: 3 + 3 karty, pierwsza para większa (mróz i burze to najmocniejsze argumenty).

## 6. „Jak pracujemy” (oś procesu)

- **Pozioma oś** z linią rysującą się przy przewijaniu (scroll-driven, `stroke-dashoffset`), 6 węzłów z numerami, które wypełniają się kolorem, gdy linia do nich dojdzie.
- Każdy krok:
  - ikona;
  - tytuł;
  - 1 zdanie;
  - pod spodem „Co dostajesz”, np. Wizja lokalna → „pomiary i lista uwag”, Projekt i wycena → „plan urządzeń i wycena w wariantach”, Odbiór → „pokazujemy działanie i aplikację”, Serwis → „jeden numer, 24 mies. gwarancji na montaż”.
- Najechanie na krok: podświetlenie węzła i odcinka linii.
- **Telefon:** oś pionowa, ta sama logika.
- Pod osią jedna linijka zaufania: „Wycena na piśmie przed montażem · bez niespodzianek w połowie roboty” i CTA „Zaplanuj instalację”.

## 7. Dla architektów — bez przesyłania plików, premium wszędzie

### 7.1 Bez funkcji przesyłania plików (decyzja 03.11)
Klient nie wysyła nam rzutów, zrzutów ani PDF-ów przez stronę.

| Gdzie | Jest | Ma być |
|---|---|---|
| Hero, przycisk główny | „Wyślij rzuty do konsultacji” (ikona wysyłania) | „Umów konsultację projektu” (ikona kalendarza) → `#wyslij` |
| Hero, przycisk drugi | „Umów prezentację dla pracowni” | bez zmian |
| `#wyslij` nagłówek | „Wyślij rzuty. Prześlij projekt. Oddzwonimy z konkretami.” | „Porozmawiajmy o projekcie. Oddzwonimy z konkretami.” |
| Formularz | pole „Link do rzutów” | **usunąć** (pole, walidacja, mapowanie w zapytaniu). Zostaje: imię, pracownia, telefon/e-mail, etap projektu, rodzaj obiektu, opis, zgoda |
| `#wymiana` „Co od Ciebie, co od nas” | o przesyłaniu plików | „Rzuty pokażesz nam na spotkaniu albo online; w zamian dostajesz plan urządzeń i wytyczne do projektu” |
| Inne miejsca z „wyślij rzuty”, „prześlij projekt”, „wrzuć PDF” na stronie i na głównej (`#architekci`) | | według tego samego wzoru |

**Bez zmian:** „Checklista w PDF” to my wysyłamy PDF do pracowni (zapis e-mailem), to jest inny kierunek. Formularz przedmiaru na Teletechnice też już nie ma uploadu („przedmiar prześlij mailem po zgłoszeniu”).

### 7.2 Nowe rozwiązania — zdjęcia

Karta z ilustracją SVG → **karta ze zdjęciem produktu** (proporcja 4:3, tło jasne neutralne). Najechanie: przybliżenie zdjęcia do 1,04, w panelu szczegółów zdjęcie duże. Zdjęcia tylko z oficjalnych stron producentów: obraz `og:image` albo główne zdjęcie produktu ze strony. Claude Code pobiera je z adresów poniżej, kadruje na 4:3 (produkt wyśrodkowany, tło dopełnione do jasnego), WebP 1200 px + 600 px, zapisuje do `seed/prokominstalacje/architekci/media/` i dopisuje pole `zdjecie` w `nowe-rozwiazania.json`. Kolekcja `InstArchNews` dostaje `image` (upload) + migrację. `ilustracja` SVG zostaje jako zapas, gdy zdjęcia nie ma.

| # | Pozycja | Źródło zdjęcia (oficjalne) |
|---|---|---|
| 1 | Głośniki pod gładzią (Amina) | strona producenta amina.co.uk — wybrać zdjęcie z serii Edge/Evolution (CC nie wczytało strony: pobrać ręcznie z galerii produktu) |
| 2 | Głośniki sufitowe bez ramki (KEF Ci) | https://eu.kef.com/products/ci200rr → `og:image` (`ci200rr_sp3836a_product__front.jpg`) |
| 3 | Subwoofer w ścianie (KEF Ci200QSb-THX) | https://eu.kef.com/products/ci200qsb → `og:image` |
| 4 | Głośniki w suficie jako strefa Sonos (Amp Multi) | https://www.sonos.com/pl-pl/shop/amp-multi → `og:image` |
| 5 | Hi-Fi jako rzeźba (Molecule) | https://www.molecule-audio.com/ → `og:image` |
| 6 | Telewizor jak obraz (Samsung The Frame) | https://www.samsung.com/pl/lifestyle-tvs/the-frame/highlights/ → `og:image` |
| 7 | Projektor laserowy przy ścianie (Epson EH-LS800B) | strona produktu na epson.pl (wyszukać „EH-LS800B”) → `og:image` |
| 8 | TV chowany w suficie (Future Automation) | https://www.futureautomation.co.uk/ → zdjęcie gamy „Audio-Visual” (`…/Product/Range/Audio-Visual.jpg`) albo zdjęcie podnośnika sufitowego z karty produktu |
| 9 | Ekran w witrynie (Samsung Smart Signage) | samsung.com/pl/business — wyświetlacz do witryn (seria wysokiej jasności) → `og:image` |
| 10 | Szklane panele z ikonami (Ampio M-DOT) | https://ampio.com/pl/sterowanie/panele-dotykowe-ampio → `/assets/control/ampio-touch-panels/hero.jpg` |
| 11 | Smart home z Apple, Google, Alexą (Ampio + Matter) | ampio.com → `/assets/_common/interior_with_panel.jpg` |
| 12 | Wi-Fi 7 z sufitu (UniFi U7 Pro) | https://store.ui.com/us/en/products/u7-pro → `og:image` |
| 13 | Wi-Fi w puszce (UniFi In-Wall) | **najpierw sprawdzić model**: jeśli nie ma „U7 In-Wall”, zmienić przykład na aktualny ścienny punkt UniFi (np. „U7 Pro Wall”) w treści i wziąć jego `og:image` ze store.ui.com |
| 14 | Kamery w kolorze elewacji, z AI (Hikvision ColorVu 3.0) | https://www.hikvision.com/en/products/IP-Products/Network-Cameras/colorvu-products/ → zdjęcie kamery z serii (nie grafika „Low-light card”) |
| 15 | Wideodomofon z rozpoznawaniem twarzy (Hikvision DS-KV9503-WBE1) | karta produktu na hikvision.com (wyszukać model) → zdjęcie produktu |
| 16 | Zamek bez klucza (Nuki Smart Lock) | https://nuki.io/pl/smart-lock/ → główne zdjęcie (`media.crystallize.com/…`) |
| 17 | Włączniki i alarm w kolorach wnętrza (Ajax LightSwitch) | https://ajax.systems/products/lightswitch-1-gang-jeweller/ → `og:image` (`ls_1gang_share_…jpg`) |
| 18 | Ładowarki z podziałem mocy (Elzab EcoPower) | zdjęcia już w repo: `public/instalacje/ev/` |
| 19–20 | Prezentacja i oferta dla pracowni | bez zdjęcia produktu; ilustracja SVG zostaje |

**Prawa do zdjęć:** to materiały producentów do prezentacji ich produktów, które sprzedawcy zwykle mogą wykorzystywać. Przed produkcją Krystian potwierdza u dystrybutorów (Ampio, Hikvision, Ubiquiti przez hurtownię) albo zamienia je na zdjęcia z pakietów dla partnerów. Pozycje z `doPotwierdzenia` (dostępność marki) zostają wersjami roboczymi, zdjęcie tego nie zmienia. **Nie** bierzemy zdjęć z Google Grafika ani ze sklepów internetowych.

### 7.3 Ruch na stronie architektów (domknięcie)
- **Punkty przekroju** `.arhs` (strona i `#architekci` na głównej): hover/focus jak `.hs` — powiększenie 1,18 ze sprężyną, podświetlenie pierścienia, karta punktu zmienia treść z przenikaniem.
- **Zakładki trybów i etapów:** przesuwana pigułka (`SlidingPill`).
- **Checklista:** zaznaczenie rysuje ✓; licznik „0/20” odlicza; wybór obiektu przenika listę.
- **Nowe rozwiązania:** filtr kategorii przenika siatkę; wybrana karta podnosi się z obramowaniem w kolorze kategorii; panel szczegółów wjeżdża 12 px.
- **Liczby do projektu:** kafle wjeżdżają kaskadą, wartości liczą (`CountUp`) przy wejściu w widok.
- Wszystkie CTA strony: ten sam ruch przycisków co w reszcie linii.

## 8. Pełna oferta `/uslugi` (nowocześnie, premium)
- **Hero:** jedna linijka H1 i duże pole wyszukiwania (wysokość 60 px, ikona, podpowiedzi przykładów zmieniające się co 3 s: „kamera do domku”, „Wi-Fi dla gości”, „nagłośnienie kościoła”). Pod polem licznik „76 rozwiązań” zmieniający się przy filtrowaniu.
- **Przyklejony pasek filtrów** (pod nagłówkiem strony): chipy obiektów z ikonami w kolorach obiektów, przewijane na telefonie. Aktywny chip ma pigułkę przesuwaną.
- **Nawigacja obszarów** (lewa kolumna ≥ 1200 px) z przewijaniem do sekcji i paskiem postępu czytania przy aktywnym obszarze.
- **Nagłówek obszaru:** pasek z kolorem usługi, ikoną, 1 zdaniem i małą ilustracją z karty usługi (te z głównej). „Strona usługi →” jako przycisk.
- **Karty rozwiązań:** 3 w rzędzie, każda z kolorowym znacznikiem usługi, ikoną, tytułem, 2 linijkami opisu i chipami obiektów. Najechanie: uniesienie, obramowanie w kolorze usługi. „Pokaż wszystkie (10)” rozwija resztę z kaskadą.
- **Filtrowanie i wyszukiwanie:** wyniki przenikają (wychodzące 120 ms, wchodzące 200 ms z przesunięciem 6 px); dopasowane słowa podkreślone w tytułach.
- **Pusty wynik:** „Nie mamy tego na liście. Opisz, czego szukasz — dobierzemy.” z przyciskiem do `/zaplanuj` (wpisana fraza przenosi się do opisu).
- **Telefon:** wyszukiwarka przyklejona u góry po przewinięciu, filtry w arkuszu od dołu.

## 9. Domknięcie systemu ruchu (z audytu 03.11)
1. **Pytania FAQ:** najechanie = tło w odcieniu akcentu i ramka; plus przesuwa się o 2 px i obraca w × po otwarciu (jest).
2. **Rozwijanie FAQ i „Pokaż całą sekcję”:** płynna wysokość przez `interpolate-size: allow-keywords` + `details::details-content { transition: block-size .28s var(--ease-out), content-visibility .28s allow-discrete }`. Bez wsparcia = skok jak dziś. Przy ograniczeniu ruchu bez animacji.
3. **Punkty schematu `/monitoring`** (`.sye`): hover jak `.hs`.
4. **Wjazd sekcji** (`.rv .ri`) na `/realizacje`, `/poradnik`, wpisie poradnika, `/kontakt`, `/zaplanuj` (nagłówki i karty).
5. 87 przejść z krzywą `ease` → `--ease-out`.

## 10. Teletechnika — więcej treści
Nowe sekcje (po `#zakres`, przed `#przepisy`). Fakty tylko ogólne i sprawdzalne, bez nowych liczb bez źródła:
1. **„Na każdym etapie budowy”** (oś jak §6): projekt i uzgodnienia → stan surowy (piony, przepusty, rury z zapasem) → przed tynkami (okablowanie lokali, skrzynki mieszkaniowe) → montaż osprzętu → pomiary każdego toru → dokumentacja powykonawcza → przekazanie wspólnocie. Przy każdym etapie zdanie, co robimy i co sprawdzamy.
2. **„Co dostajesz przy odbiorze”:**
   - raport z pomiarów każdego toru (miedź i światłowód);
   - opis gniazd i paneli zgodny z dokumentacją;
   - schematy pionów;
   - dokumentacja powykonawcza w PDF i na papierze;
   - lista sprzętu z numerami seryjnymi tam, gdzie to ma znaczenie.
3. **„W jakich standardach pracujemy”:**
   - okablowanie strukturalne wg norm z rodziny PN-EN 50173 (projektowanie) i PN-EN 50174 (instalacja);
   - pomiary miernikiem z raportem;
   - światłowód jednomodowy z włóknem odpornym na zginanie w lokalach.

   Bez numerów klas, jeśli spec ich nie potwierdza; dokładne brzmienie do sprawdzenia przy redakcji.
4. **„Błędy, które zatrzymują odbiór”** (4 karty): rury bez zapasu i pilota; zasilanie i teletechnika w jednej rurze; brak opisów na panelach i gniazdach; za mała skrzynka mieszkaniowa. Każda z jednym zdaniem „jak tego unikamy”.
5. **„Także w częściach wspólnych”:** domofony i wideodomofony, kontrola dostępu do klatek i garażu, monitoring garażu i wejść, instalacja RTV/SAT zbiorcza. Linki do stron usług.
6. **„Jak liczymy ofertę”:** przedmiar albo projekt → pytania o stan budowy → wycena pozycja po pozycji → termin wejścia ekipy. Przedmiar mailem po pierwszym kontakcie, bez uploadu.
7. **Realizacja:** Blachotrapez — przyłącza IT stanowisk biurowych (zdjęcia z §4, realizacja 7).

Telefon: sekcje zwinięte wg zasad `fold`.

## 11. Przegląd podstron — co jeszcze poprawić (V5-D)
- **Strony usług:** sekcje „Realizacje nagłośnienia” i podobne ze zdjęciami z §4; w „Powiązanych” miniatury ilustracji usług zamiast samych ikon.
- **Strony obiektów:**
  - „Nasze realizacje” ze zdjęciami (sklepy: Empik — brak zdjęć na pro-kom.eu, zostaje ikona; restauracje: Aleksandra; kościoły: św. Teresa, Ślemień; szkoły: SP Rabka; firmy: Blachotrapez);
  - „Doba w …” na desktopie z przesuwaną osią godzin, jak §6.
- **O firmie:** bez zdjęć ludzi. Zamiast nich galeria 6 zdjęć realizacji z §4 i mapa zasięgu z animowanym rysowaniem tras przy wejściu.
- **Kontakt:** mapa z animowanym pinem salonu i trasą rysującą się przy wejściu; godziny otwarcia z żywym statusem jak w górnym pasku.
- **Serwis:** plany opieki jako 3 karty z wyróżnioną środkową i animowanym przełączeniem szczegółów.
- **Poradnik:** jest 1 wpis. Dopisać 4 wpisy z planu SEO (czat przygotuje treść), karty wpisów z ilustracjami kategorii.
- **404:** 6 linków (usługi, Dla kogo, Zaplanuj, Kontakt, Realizacje, Poradnik) jako karty i wyszukiwarka oferty.
- **Ładowarki:** konfigurator z płynnym przejściem zdjęcia przy zmianie koloru i wersji (przenikanie).

## 12. Prompty dla Claude Code

```
Sesja V5-A (Instalacje) — hero, marki, Dla kogo, domknięcie ruchu. Przeczytaj docs/design/prokominstalacje/RUNDA-V5.md §0–§3 i §9 (ma pierwszeństwo przed prototypem). Logo marek: docs/design/prokominstalacje/v5/marki/ → public/instalacje/marki/.
Kolejność: (1) PR inst/v5-hero: H1, wysokość clamp, dok z linią statusu, strefa bezpieczna budynku, kamera przy prawej krawędzi i reguły ukrywania, skala etykiet, ruch wejścia/zmiany obiektu/pory dnia (jedna zmienna koloru tekstu), e2e hero-uklad dla 6 rozmiarów; (2) PR inst/v5-marki-dlakogo: kafle logo (biały kafel w obu motywach, grayscale→kolor), karty Dla kogo jako link z mini-przekrojem i animacją; (3) PR inst/v5-ruch: §9 pkt 1–5. Strefa wspólna (tokens.css) osobno w inst/wsp-v5-tokeny. Zrzuty przed/po w PR, porownaj.mjs tam, gdzie układ ma zostać.
```

```
Sesja V5-B (Instalacje) — realizacje i architekci. Przeczytaj RUNDA-V5.md §4 i §7.
(1) PR inst/wsp-v5-photos (strefa wspólna, migracja): Realizations.photos (image+alt), InstArchNews.image; (2) PR inst/v5-realizacje: pobranie 52 zdjęć z pro-kom.eu wg tabeli §4 (curl), przegląd (bez twarzy, rozmycie tablic), sharp → WebP 1600/640, seed + 2 brakujące realizacje, karta ze zdjęciem + galeria <dialog>; (3) PR inst/v5-architekci: §7.1 (usunięcie pola „Link do rzutów” i wszystkich wezwań do przesyłania plików — także w lib/inquiry mapowaniu i testach), §7.2 zdjęcia z tabeli (og:image ze stron producentów; gdy strona nie daje obrazu — zapisz w PR i zostaw SVG, nie szukaj w innych źródłach), §7.3 ruch. /przeglad (formularz, migracja) przed /pr.
```

```
Sesja V5-C (Instalacje) — Na Podhalu, Jak pracujemy, Pełna oferta, Teletechnika. Przeczytaj RUNDA-V5.md §5, §6, §8, §10. Treści §10 jako dane w dane/teletechnika.ts (TODO(krystian) przy każdym zdaniu z normą do sprawdzenia). Scroll-driven animacje z fallbackiem statycznym. Zrzuty przed/po.
```

V5-D: lista §11 — czat doda prompt po V5-C.
