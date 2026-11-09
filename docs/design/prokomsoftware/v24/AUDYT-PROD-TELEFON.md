# Software — produkcja na telefonie (10.11.2026): hero, płynność, okno oferty, paski Chrome

Zgłoszenie Krystiana po starcie `prokomsoftware.pl` (telefon, Chrome Android):
1. Układ hero na telefonie wygląda średnio.
2. Animacje się ścinają.
3. „Oferta” nie przewija się na telefonie.
4. Chrome cały czas pokazuje i chowa górny i dolny pasek, a strona laguje.

**Jak sprawdzone.** Produkcja blokuje osadzanie w ramce (`X-Frame-Options`, poprawnie) i z mojego środowiska nie ma do niej dostępu. Pomiary zrobiłem więc na tym samym kodzie lokalnie (`develop` = obraz produkcji) w widoku 390×760 i 390×664, z odczytem animacji, przesunięć układu i przewijania okna oferty. **Dotyku i pasków Chrome nie da się tu odtworzyć.** Punkty 3 i 4 to diagnoza z kodu i pomiarów. Potwierdzenie musi przyjść z prawdziwego telefonu (§5).

## 1. Płynność (P0) — to najpewniej źródło „ścinania” i skaczących pasków Chrome

Zmierzone na stronie głównej (390 px):

| Co | Stan | Dlaczego boli na telefonie |
|---|---|---|
| **19 animacji nieskończonych** (`hx-blink`, `hx-glint`, `mk-drift`, `mk-twinkle` ×8, `mk-travel` ×6, `mk-wipe`) | **działają zawsze, także gdy hero i makiety są daleko poza ekranem** (te same 19 na y = 0, 3000, 8000) | procesor i GPU telefonu pracują przez cały czas czytania strony |
| `mk-travel` (kropki na „kablach” makiet) | animuje **`left`** | `left` to właściwość układu: przeliczenie i odmalowanie w każdej klatce, ×6 elementów |
| `sw-em` (gradient wyróżnionego słowa w H2) | animacja przewijaniem (`animation-timeline: view()`) **`background-position`** | odmalowanie tekstu w każdej klatce przewijania, w każdym widocznym H2, na wątku głównym |
| `sw-rise-blur` (wejście sekcji) | animuje **`filter: blur`** | najdroższy filtr; na telefonie przy szybkim przewijaniu gubi klatki |
| Rozmycia stałe | 12 elementów z `filter: blur`, 6 z `backdrop-filter` (kapsuła, pole hero, podpis, strzałki, wyszukiwarka) | każda warstwa z rozmyciem to dodatkowe przeliczenie przy przewijaniu |
| Nasłuch przewijania | `CapsuleSpy`, `SiteRail`, `SwRail` mierzą sekcje (`getBoundingClientRect`) w każdej klatce przewijania, także na telefonie, gdzie szyny nie widać | wymuszony układ przy każdym ruchu palca |

**Dlaczego paski Chrome „skaczą”.** Chrome na Androidzie chowa paski przy przewijaniu w dół, a pokazuje przy przewijaniu w górę i przy zatrzymaniu gestu. Gdy strona gubi klatki, gest przewijania się rwie. Chrome odczytuje to jako koniec i nowy początek przewijania, więc pasek wraca i znowu znika. Układ jest stabilny: wysokość dokumentu nie zmienia się przy przewijaniu, przesunięcia układu są śladowe (CLS ≈ 0,03), `html`/`body` bez blokady przewijania. Zostaje więc obciążenie, czyli tabela wyżej.

**Czy da się wyłączyć paski Chrome?** Na zwykłej stronie nie. To pasek przeglądarki, a nie strony. Bez pasków działa tylko strona **zainstalowana jako aplikacja** (PWA, `display: standalone`) albo tryb pełnoekranowy po kliknięciu (Fullscreen API). Żadne z nich nie jest dobrym rozwiązaniem dla strony firmowej. Rozwiązanie to płynna strona: wtedy paski chowają się i pokazują raz, gładko, jak na każdej szybkiej stronie.

**Poprawki (P0):**
1. **Animacje nieskończone tylko na ekranie.** `IntersectionObserver` na hero (`.hx`) i na każdej makiecie (`.mk-*`). Poza ekranem atrybut `data-still` daje `animation-play-state: paused` dla potomków. Tak samo przy `document.hidden`.
2. `mk-travel`: `transform: translateX(...)` zamiast `left` (szerokość ścieżki przez `--mk-path` albo `calc(100cqw - 10px)` z `container-type: inline-size` na kablu).
3. `sw-em` na dotyku (`(hover: none) and (pointer: coarse)` albo ≤ 767 px): bez animacji przewijaniem, gradient stoi w położeniu końcowym. Na PC może zostać.
4. Wejścia sekcji na telefonie: tylko `translate` + `opacity`, bez `filter: blur` (`sw-rise-blur` → `sw-rise`).
5. Rozmycia na telefonie: `backdrop-filter` zostaje tylko na kapsule i dolnym pasku. W polu hero i podpisie tło półprzezroczyste bez rozmycia. Stałe `filter: blur` (poświaty, kosmos) zamienić na gotowe gradienty radialne (bez filtra) albo zmniejszyć promień i liczbę na ≤ 767 px.
6. Nasłuch przewijania: `SiteRail` / `SwRail` nie mierzą, gdy szyna jest ukryta (`matchMedia` w efekcie, odpięcie słuchaczy). `CapsuleSpy` tylko wtedy, gdy kapsuła pokazuje linki (PC). **Wspólne komponenty → osobny mały PR `feat/wsp-*`.**

Cel po poprawce: zero długich klatek (> 50 ms) przy przewijaniu strony głównej od góry do stopki na średnim Androidzie (nagranie Performance w zdalnym debugowaniu, §5) oraz 0 animacji `running` po przewinięciu 2 ekranów poniżej hero.

## 2. Okno oferty na telefonie (P0) — „nie przewija się”

Zmierzone: arkusz (`<dialog>`) ma 532 px wysokości, treść 4451 px, przewijanie programowe działa, `html` zablokowany pod spodem (poprawnie). Na czym polega problem przy dotyku:
- **Arkusz zmienia wysokość w środku gestu.** Startuje z `max-h-[70dvh]`. Pierwsze przewinięcie o 8 px (`sheet.scrollTop > 8`) przełącza go na `94dvh`. Arkusz jest przyklejony do dołu, więc jego góra skacze o ~¼ ekranu, gdy palec jeszcze przewija. Chrome przerywa wtedy gest i wygląda to tak, jakby treść „nie chciała się przewinąć” albo wracała.
- **`dvh` zmienia się razem z paskami Chrome.** Każde pokazanie lub schowanie paska zmienia wysokość arkusza i panelu (`h-[min(920px,calc(100dvh-40px))]`, `max-h-[70dvh]`/`[94dvh]`, `subpages.css` `100dvh - 40px`). Treść przeskakuje.
- **Cały nagłówek arkusza ma `touch-none`** (strzałki, kropki, zakładki „Zakres · Jak to wygląda…”). Gest zaczęty na nagłówku nic nie przewija, a zakładki nie przesuwają się palcem w bok.

**Poprawki (P0):**
7. Na telefonie arkusz **od razu na pełną wysokość** (`max-h-[92svh]`, jak aplikacja), bez stanu 70% i bez zmiany wysokości przy przewijaniu. Usunąć `expanded` / `pullUp` dla telefonu. Przeciągnięcie w dół za uchwyt nadal zamyka.
8. Wszystkie wysokości okna i arkusza w **`svh`** zamiast `dvh`. `svh` nie zmienia się przy chowaniu pasków.
9. `touch-none` tylko na **uchwycie** (pasek 44 × 24 px nad nagłówkiem), nie na całym nagłówku. Zakładki z `touch-action: pan-x`.

> Jeśli „oferta” w zgłoszeniu to coś innego niż okno oferty (np. sekcja „Oferta”/bento na głównej albo `/rozwiazania`), Krystian dopisze w PR, co dokładnie. Na `/rozwiazania` i w bento poziomych przewijaczy z blokadą dotyku nie znalazłem.

## 3. Hero na telefonie (P1) — „jak najlepsza aplikacja”

Stan (390×760, ciemny):
- H1 zaczyna się **dokładnie przy dolnej krawędzi kapsuły** (kapsuła do 68 px, H1 od 68 px). Zero oddechu, nagłówek „klei się” do menu.
- Za oknem głównym wystają **ucięte boczne okna** (karuzela 3D z PC). Na 390 px to dwa paski po bokach, nieczytelne i wyglądające jak błąd.
- Karta podpisu („07 Automatyzacje i AI”) kończy się **pod dolnym paskiem**, widać tylko połowę.
- „automatyzacje i AI.” łamie się na 3 wiersze H1 (sierota „AI.”). Rezerwa 2 wierszy trzyma układ, ale wygląda to nierówno.
- Rząd kafli ucięty w połowie trzeciego kafla bez sygnału, że przewija się w bok.

**Poprawki (P1)**, plansze telefonu v24 (`v24/boards/*-390-*`) i MOBILE-APLIKACJA §4–5:
10. Odstęp kapsuła → H1: 20–24 px (przy wysokości ≤ 700: 12 px).
11. **Telefon (≤ 600 px): jedno okno**, bez bocznych w karuzeli. Zmiana slajdu = przenikanie i delikatne przesunięcie okna (transform + opacity). Pod oknem kropki slajdów (jak `CarouselDots`), przesunięcie palcem po oknie = następny slajd.
12. Podpis slajdu (numer + nazwa + jedno zdanie) **wewnątrz dolnej krawędzi okna** jako szklany pasek albo tuż pod oknem. Całość (okno + podpis + kropki) zawsze nad dolnym paskiem: e2e `software-hero` dla 360×640, 375×667, 390×664, 390×844, 412×915.
13. Rząd kafli: maska wygaszania na prawej krawędzi (`mask-image: linear-gradient(...)`) i `scroll-snap`, żeby było widać, że jedzie w bok. Alternatywa: siatka 2×3 małych kafli bez przewijania (decyzja przy zrzutach).
14. Słowo H1 na telefonie: krótsza wersja dla „automatyzacje i AI.” (pole `wordShort` w danych slajdu albo `automatyzacje.`), żeby każde słowo mieściło się w 1 wierszu przy 38–42 px.

## 4. Kolejność i zakres sesji
- **SWA12a `fix/swa12-plynnosc-telefon`** (P0 #1–#5, #7–#9; Software) i **`fix/wsp-przewijanie-telefon`** (#6, wspólne). Te dwa najpierw, bo naprawiają lag i przewijanie u każdego klienta.
- **SWA12b `feat/swa12-hero-telefon`** (P1 #10–#14), od 12a.
- Produkcja: hotfix przez normalny pipeline (`develop` → staging → **szybka akceptacja szefa** → `main`). To poprawka działania, nie nowa funkcja.

## 5. Sprawdzenie na prawdziwym telefonie (Krystian, 10 minut)
1. Telefon z Androidem przez USB, na telefonie Opcje programisty → Debugowanie USB.
2. Na PC w Chrome: `chrome://inspect` → urządzenie → „inspect” przy karcie `prokomsoftware.pl`.
3. DevTools → **Performance** → nagrywanie → przewiń stronę główną od góry do stopki → stop. Szukaj czerwonych klatek („Long task”, „Layout”, „Paint”).
4. DevTools → Rendering → **Paint flashing** i **Layout Shift Regions**: zielone migotanie w czasie przewijania = odmalowywanie (punkty 2–5 w §1).
5. Nagranie przed i po SWA12a do opisu PR.

## Prompt dla Claude Code

```
/zadanie SWA12 — płynność i hero na telefonie po starcie produkcji (docs/design/prokomsoftware/v24/AUDYT-PROD-TELEFON.md)
Start: git status, git fetch. Folder prokom-web-software (PORT=3003, baza prokom_web_swa). Gałęzie od origin/develop.
PR 1 fix/swa12-plynnosc-telefon (Software): §1 #1–#5 (animacje nieskończone tylko na ekranie przez IntersectionObserver + document.hidden, mk-travel na transform, sw-em bez animacji przewijaniem na dotyku, wejścia bez filter: blur na telefonie, rozmycia na ≤ 767 px), §2 #7–#9 (arkusz oferty od razu 92svh bez stanu 70% i bez zmiany wysokości przy przewijaniu; svh zamiast dvh w oknie i arkuszu; touch-none tylko na uchwycie, zakładki pan-x). Test Vitest dla logiki widoczności, e2e Playwright z isMobile/hasTouch: arkusz oferty przewija się gestem (touchscreen.swipe albo dispatch) i nie zmienia wysokości; po przewinięciu 2 ekranów pod hero document.getAnimations() bez running o iterations=Infinity.
PR 2 fix/wsp-przewijanie-telefon (wspólne): §1 #6 — SiteRail / SwRail / CapsuleSpy bez pomiarów i słuchaczy, gdy szyna/linki są ukryte (matchMedia). Bez zmiany zachowania na PC (e2e szyny i kapsuły zielone).
PR 3 feat/swa12-hero-telefon (od PR 1): §3 #10–#14 — przed kodem pokaż 2 zrzuty propozycji (390×844, 375×667) i zapytaj o #13 (maska + przewijanie vs siatka 2×3).
Pomiar przed/po: Chrome DevTools Performance (CPU 4× slowdown, 390×844, przewijanie głównej do stopki) — liczba długich klatek > 50 ms do opisu PR.
DoD: lint/typecheck/test, e2e software-hero + nowe, scripts/software-porownaj.mjs 390 i 1440 × ciemny/jasny, MOBILE-APLIKACJA §5, /przeglad, /pr. Po scaleniu: staging → szybka akceptacja szefa → produkcja przez pipeline.
```
