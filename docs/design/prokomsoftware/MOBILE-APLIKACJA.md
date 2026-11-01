# prokomsoftware.pl na telefonie — „jak najlepsza aplikacja” (decyzja Krystiana 30.10.2026, wzorzec v22)

Jeden plik ze **wszystkim o telefonie i tablecie**: zasada, szkielet, komponenty, każdy ekran z plikiem wzorca, wymagania „odczucia aplikacji” i Definition of Done. Zbiera to, co jest rozproszone w spec. §3.2 i §8.6, ADR-015 v20/v22 i stanach `80`–`99`, i dokłada poprzeczkę jakości z 30.10. **Przy różnicy w sprawach telefonu wygrywa ten plik**, potem spec., potem plansze.

> Krystian, 30.10.2026: „na mobile ten panel też ma być mega nowoczesny jak apka i mega wizualnie zrobiony i mega dopasowany do mobile, żeby się z tego korzystało jak z najlepszej aplikacji”.

**Zasada nadrzędna:** poniżej 1081 px strona **nie jest pomniejszonym desktopem**. To osobny układ, który ma się czuć jak dobra aplikacja banku albo sklepu: dolny pasek, arkusze od dołu, karty przewijane palcem, przyklejone akcje, natychmiastowa reakcja na dotyk, płynny ruch. Desktop się nie zmienia. Telefon jest **częścią zakresu każdej sesji z UI**, nie poprawką na koniec — sesja bez telefonu wg §5 nie jest skończona.

Wzorce: `screens/<Plansza>-390-light` (17 plansz; `Main` także `-390-dark`) + `stany/80`–`89`, `stany/kreator-m-*`, `stany/okno-96`–`99`, `stany/kontakt-96`–`99c`. W kodzie szerokość płynna 360–430 px (i tablet 641–1080 px), nie sztywne 390.

---

## 1. Szkielet (każda strona ≤ 1080 px)

| Element | Zachowanie | Wzorzec |
|---|---|---|
| **Nagłówek kompaktowy** | tylko znak i przycisk „Wycena” (spec. §3.2); przyklejony (`position: sticky`, kontener strony `overflow-x: clip`), tło `--header-bg` z `backdrop-filter: blur()`; ikony i przycisk ≥ 44 × 44 | `stany/83`, `screens/*-390-*` (góra) |
| **Dolny pasek** | 5 pozycji: Start · Oferta · **Kreator** (okrągły, wyniesiony, w gradiencie akcentu) · Kontakt · Menu; aktywna pozycja `--accent-text` + kreska; margines 10 px, rozmycie, `env(safe-area-inset-bottom)`; treść ma dolny odstęp pod pasek | `stany/82`, `82b` (ciemny) |
| **Przyklejona akcja zamiast paska** | kreator: belka ceny (pasek chowa się w sekcji kreatora, na `/dobierz` zawsze); okno oferty: pasek ceny z „+ Dodaj do wyceny”; nic nie zasłania pól ani przycisków | `kreator-m-a-*`, `okno-96-*` |
| **Pigułka „Twój projekt”** | nad paskiem tylko przy niepustej liście, nie na `/kontakt`; licznik pozycji | `stany/81a` |
| **Arkusze od dołu** | menu, Twój projekt, filtry katalogu, okno oferty: `BottomSheet` (`src/components/BottomSheet.tsx`) — `<dialog>`, focus trap, Esc, tapnięcie w tło, uchwyt, maks. 92% wysokości, przewijanie w środku | `stany/80`, `80b`, `81`, `88b`, `okno-96`–`98` |
| **Toast** | „Dodano do Twojego projektu” + „Zobacz projekt →”, nad paskiem, `role="status"`, ok. 2,6 s | `okno-99-main-modal-390-dodane` |

## 2. Komponenty mobilne (wspólne, jako komponenty — nie kopia CSS)

- **Rzędy przewijane w bok** (`scroll-snap-type: x mandatory`, bez paska przewijania, `scroll-padding-inline: 18px`): pigułki obszarów, filtry, zakładki podglądów, etapy procesu (widać skrawek następnego), punkty zaufania, problemy branży. Strona nigdy nie przewija się w bok — tylko rząd.
- **Karuzele kart 84%** z brzegiem następnej (12 rzeczy, realizacje, fakty „bez WordPressa”, „Jak robimy”; „Zasady” 78%). Bez bibliotek.
- **Siatki 2 × 2**: kafle intencji, liczby, kafle danych rozwiązania, kafle potrzeby w kreatorze; technologie 2 × 3.
- **Tabele jako karty** (porównanie, cennik, poziomy opieki i audytu w oknie oferty), FAQ akordeonem (pierwsze otwarte), stopka w 2 kolumnach.
- **Przyciski** 52 px, na całą szerokość, krótkie teksty (bez łamania na 360 px).
- **Formularze** (wspólny `Field` z `src/components/ui/`): pola ≥ 44 px, tekst 16 px, etykiety nad polem, błędy pod polem, `autocomplete` / `inputmode` / `enterkeyhint`, przycisk wysyłki widoczny nad klawiaturą.

## 3. Ekrany (każdy ma plik wzorca)

| Ekran | Wzorzec telefonu | Sesja |
|---|---|---|
| Ramka: nagłówek, dolny pasek, menu, Twój projekt, stopka | `stany/80`, `80b`, `81`, `81a`, `82`, `82b`; dół każdego `screens/*-390-*` (ciemna stopka v21, 2 kolumny) | SWR2 |
| Okno szczegółów oferty (arkusz) | `okno-96-telefon-pensjonat-gora` / `-w-cenie` / `-dol`, `okno-97-*`, `okno-98-telefon-audyt-ciemny`, `okno-99-main-modal-390-*` | SWR3 |
| Katalog `/rozwiazania` | `Katalog-390-light`, `88a`, `88b` (arkusz filtrów), `okno-99-katalog-karty-telefon(-ciemny)` | SWR3 |
| Kreator `/dobierz` i sekcja na `/` | `Kreator-390-light`, `kreator-m-a-0` … `-5-podglad`, `kreator-m-b-*` (ciemny) | SWR4 |
| Strona główna `/` | `Main-390-light`, `Main-390-dark`, `83`, `84`, `85`, `86`, `okno-99-main-grid-390-light` | SWR5 |
| Rozwiązanie `/rozwiazania/[slug]` | `Rozwiazanie-390-light`, `89a` | SW10 |
| Branża | `Branza-390-light` | SW10 |
| Kontakt `/kontakt` | `Kontakt-390-light`, `89c`, `kontakt-96`, `97`, `97b`, `98`, `99`, `99c` („Twój projekt” 390) | SW11a |
| Cennik, Audyt | `Cennik-390-light`, `89b`; `Audyt-390-light` | SW11a |
| O firmie, Jedna firma do wszystkiego, Aktualności, Wpis, Miejscowość, Polityka, Dziękujemy, 404 | `ONas-`, `Wszystko-`, `Aktualnosci-`, `Wpis-`, `Miasto-`, `Polityka-`, `Dziekujemy-`, `NieZnaleziono-390-light` | SW11b |

## 3a. Hero i pierwsza sekcja v23 (01.11.2026, sesja SWV3)

Wzorzec: `screens/Main-390-*` (v23), `stany/v23-01…v23-04`. Na telefonie (≤ 640 px) hero to osobny układ:

1. Pigułka „● Rabka-Zdrój · zdalnie w całej Polsce” (tło karty, obrys).
2. H1 „Strony i programy dla firm.” + w nowej linii akcent „Zobaczysz, zanim zapłacisz.” (34–42 px).
3. Lead 16 px.
4. **Przyciski:** „Dobierz rozwiązanie · 60 s” na całą szerokość; pod nim dwa obok siebie: „Zobacz podglądy” i **„Zadzwoń”** (`tel:+48883200151`). Wysokość 52 px.
5. **Karta „Twoja Firma · panel”** (grafit, zaokrąglenie 24 px): 3 powiadomienia wjeżdżają po kolei (0,35 / 0,75 / 1,15 s) — „Nowe zapytanie ze strony”, „Ekipa Marka na miejscu”, „Faktura wysłana sama”; stopka „Podgląd do klikania · w 5–7 dni”. Przy reduced motion widoczne od razu.
6. Pasek zaufania w 3 kolumnach (ikona nad tekstem, 12 px): „Podgląd przed zakupem”, „Kod i dane należą do Ciebie”, „Firma na Podhalu od 2004”.
7. Składanka modułów z desktopu na telefonie nie występuje.
8. **Pierwsza sekcja (intencje):** jedna karta-lista: wiersze 72 px (ikona 44 px, tytuł, 2 linie opisu, strzałka), separator między wierszami, stan wciśnięcia tłem.

## 4. Odczucie aplikacji (poprzeczka jakości z 30.10 — obowiązuje w każdej sesji z UI)

Plansze pokazują wygląd; ta lista mówi, jak ma się **zachowywać** pod palcem. Wszystko CSS + to, co już jest w repo — bez nowych bibliotek animacji, karuzel ani gestów.

1. **Natychmiastowa reakcja na dotyk.** Każdy przycisk, kafel, karta, pozycja paska i menu ma stan wciśnięcia (`:active` — `scale(.97)` albo lekkie przyciemnienie, ≤ 120 ms). `-webkit-tap-highlight-color: transparent` (zamiast szarego prostokąta — własny stan), `touch-action: manipulation` (bez opóźnienia i zoomu przy podwójnym tapnięciu). Efekty hover tylko w `@media (hover: hover)` — na dotyku nic nie „zawisa” podświetlone.
2. **Arkusze jak w aplikacji.** Wjazd od dołu (`transform`, ok. 0,3 s, łagodne hamowanie), tło przyciemnia się płynnie. **Przeciągnięcie w dół zamyka** — w Software włączyć `dragToClose` we wszystkich arkuszach (menu, Twój projekt, filtry, okno oferty); dziś Software go nie przekazuje. `overscroll-behavior: contain` w środku, blokada przewijania strony pod arkuszem bez skoku. Fokus wraca na przycisk, który otworzył arkusz.
3. **Płynny ruch, nic nie skacze.** Animowane tylko `transform` i `opacity` (60 kl./s na słabszym Androidzie). CLS < 0,1: miniatury, makiety i obrazy z zarezerwowanym miejscem; pigułka, toast, belka ceny i dolny pasek pojawiają się nad treścią, nie przesuwają jej. Chowanie dolnego paska w kreatorze — przesunięcie w dół, nie mignięcie. `prefers-reduced-motion` = bez animacji (wszystko działa natychmiast).
4. **Informacja zwrotna od razu.** „+ Dodaj do wyceny” zmienia się w „✓ W wycenie” w tej samej klatce (lista w `localStorage`, bez czekania), licznik pigułki rośnie, toast potwierdza. Wysyłka formularza: przycisk zablokowany ze stanem „Wysyłam…”, błędy przy polach z przewinięciem do pierwszego błędu, sukces na `/dziekujemy` bez pustego ekranu po drodze.
5. **Klawiatura ekranowa.** Pola mają **tekst ≥ 16 px** (iPhone nie powiększa wtedy strony przy wejściu w pole). Pole w focusie nie chowa się pod klawiaturą ani pod przyklejoną belką (`scrollIntoView` / `visualViewport`); `enterkeyhint` („dalej”, „wyślij”).
6. **Nawigacja jak w aplikacji.** Przycisk „wstecz” przeglądarki zamyka otwarty arkusz zamiast wychodzić ze strony (wpis w historii przy otwarciu — `BottomSheet` dziś tego nie ma: dołożyć jako opcję wyłączoną domyślnie, żeby Instalacje i Biznes działały bez zmian, z testem; zmiana pliku wspólnego = osobny commit z opisem w PR); powrót z podstrony wraca do tego samego miejsca listy; kotwice (`#formularz`, `#dobierz`, `#kontakt`) przewijają z odstępem pod nagłówek; linki paska i menu z prefetchem (`next/link`).
7. **Wygląd na poziomie plansz.** Te same zaokrąglenia, cienie, rozmycie paska i nagłówka, gradient kreatora, miniatury — nic „uproszczonego na telefon”. Tryb ciemny bez białych plam (miniatury lekko przyciemnione, makiety w tokenach). Kolory tylko z tokenów.
8. **Pasek przeglądarki i ekran główny.** `theme-color` w kolorze tła motywu (jasny/ciemny) i `viewport-fit=cover` — dopisać linię `software` w `src/lib/brand/themeColor.ts` (mechanizm Instalacji, wartości z `tokens.css`, test pilnuje zgodności). Manifest (`display: standalone`, ikony `prokom-software_icon-192/512.png` z `public/brand/`) — bez service workera. Robi SWR2 (ramka).
10. **Ruch v23 (sesja SWV5):** płynne przewijanie do kotwic z odstępem pod nagłówek; szyna sekcji przewija z hamowaniem (520–1100 ms) i nagłówek sekcji krótko „wjeżdża” po dojechaniu (`v23/pkScroll.js`); nagłówki sekcji, pytania FAQ i mapa wjeżdżają przy przewijaniu (`animation-timeline: view()`, bez bibliotek; karty z opóźnieniem tylko ≥ 1081 px — na telefonie karuzele mają własny scroller); przejścia między podstronami (View Transitions, jeśli wersja Next to wspiera — inaczej CSS `@view-transition`), nagłówek i dolny pasek stoją; FAQ rozwija się miękko. Reduced motion = bez animacji.
9. **Tablet 641–1080 px.** Ten sam układ telefonu (pasek, arkusze), arkusze wyśrodkowane i węższe, siatki 2–3 kolumny tam, gdzie plansza 390 pokazuje 1–2; obrót ekranu zamyka arkusz przy przejściu na desktop (zachowanie `BottomSheet`).

## 5. Definition of Done telefonu (każda sesja z UI: SWR2–SWR5, SW10, SW11a, SW11b)

1. **Zero poziomego przewijania** przy 360, 390 i 414 px na każdej zmienionej trasie: `document.scrollingElement.scrollWidth <= innerWidth` (test Playwright). Nic nie wystaje poza ekran.
2. **Cele dotyku ≥ 44 × 44 px** (wyjątek: linki w zdaniu ≥ 24 px wysokości), przez padding.
3. **Tekst ≥ 12 px** (treść 14,5–16 px; pola formularzy ≥ 16 px), kontrast AA w obu motywach, margines od krawędzi ≥ 16 px.
4. **Safe area** i dolny odstęp pod pasek; przyklejone elementy nie zasłaniają przycisków ani pól.
5. **Arkusze:** focus trap, Esc, tło, przycisk, **gest w dół**, „wstecz” przeglądarki, przywrócenie fokusu (§4 pkt 2, 6).
6. **Odczucie aplikacji** wg §4 pkt 1–5 na każdym nowym elemencie dotykowym (stany wciśnięcia, bez hover na dotyku, ruch tylko `transform`/`opacity`, reduced motion).
7. **Zrzuty Playwright** 390 (jasny i ciemny) i 360 porównane z wzorcem z §3 — w opisie PR lista różnic i co poprawione; oczekiwane różnice wg ADR-015.
8. **axe** bez błędów na zmienionych trasach przy 390 px.
9. **Wydajność:** Lighthouse mobile ≥ 90 dla zmienionych stron (lokalnie, jeśli się da; inaczej na stagingu — wpis w STAN), LCP < 2,5 s, INP < 200 ms, CLS < 0,1.
10. Testy e2e telefonu uruchamiane z emulacją dotyku (`hasTouch: true`, `isMobile: true`, np. `devices['iPhone 13']` / `devices['Pixel 7']` w danym teście) i `tap()` tam, gdzie zachowanie zależy od dotyku.

## 6. Jak sprawdzać

- **Claude Code** (przed PR): §5 pkt 1–10; wynik w opisie PR („Telefon: 360/390/414 bez przewijania w bok, zrzuty porównane, różnice: …”).
- **Krystian** (przed scaleniem większych sesji: SWR2, SWR3, SWR4b, SWR5, SW11a): prawdziwy telefon — Android (Chrome) i iPhone (Safari), jeśli jest pod ręką:
  - Start → Oferta → okno oferty → „+ Dodaj do wyceny” → pigułka → arkusz „Twój projekt” → „Wyślij do wyceny →” → formularz w Kontakcie → wysłanie;
  - kreator do wyniku i wysłania (belka ceny, chowanie paska, klawiatura nad polami);
  - menu i filtry: zamknięcie gestem w dół, tłem i „wstecz”;
  - tryb ciemny, obrót ekranu, przewijanie karuzel kciukiem.
- Gdy coś „nie czuje się jak aplikacja”, a nie łamie §5 — wpis do STAN → „Pomysły na później” z nazwą ekranu, nie poprawka „przy okazji” w innej sesji.
