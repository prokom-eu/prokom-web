# prokominstalacje.pl na telefonie — „jak aplikacja”

Wersja 1.0 · 27.10.2026 · wzorzec: prototyp v4.0 + zrzuty `stany-telefonu/`.
**Ten dokument jest częścią Definition of Done każdej sesji z UI.** Telefon to nie poprawka na koniec — każda sekcja powstaje od razu w wersji 390 px i jest sprawdzana przy 360, 390 i 414 px.

Cel (Krystian, 27.10): na telefonie strona ma wyglądać i działać jak **nowoczesna, bardzo dopracowana aplikacja** — nowoczesne menu i nawigacja, płynne przejścia, duże cele dotykowe, nic nie „skacze”.

## 1. Szkielet ekranu (≤ 760 px)
```
┌──────────────────────────────┐
│ Nagłówek (64 px)              │  znak PRO-KOM Instalacje · motyw · telefon · menu
│  — chowa się przy przewijaniu │
│    w dół, wraca w górę        │
├──────────────────────────────┤
│ Pasek kotwic (podstrony)      │  przyklejony; gdy nagłówek schowany → top: 0
├──────────────────────────────┤
│                              │
│ Treść                        │  sekcje, karuzele, widżety dotykowe
│                              │
│                              │
│ ┌──────────────────────────┐ │
│ │ Start Usługi [Zaplanuj] Dla kogo Więcej │  dolny pasek kart (pływający, 10 px od krawędzi + safe-area)
│ └──────────────────────────┘ │
└──────────────────────────────┘
```
Treść ma dolny margines = wysokość paska + 24 px (nic nie chowa się pod paskiem; stopka też).

## 2. Nagłówek
- Wysokość 64 px, tło `var(--hdr)` z `backdrop-filter: blur(14px)`, dolna linia `var(--line)`.
- Elementy: znak (link do `/`), przycisk motywu, przycisk „Zadzwoń” (`tel:`), przycisk menu (otwiera arkusz na zakładce bieżącej sekcji: na usłudze „Usługi”, na obiekcie „Dla kogo”, gdzie indziej „Usługi”).
- **Chowanie:** po przewinięciu > 90 px w dół o więcej niż 8 px → `transform: translateY(-100%)` (0,28 s); przewinięcie w górę o więcej niż 8 px → wraca. Przy otwartym arkuszu zawsze widoczny. Nasłuch `scroll` pasywny, stan zmieniany tylko przy zmianie (bez renderu przy każdym pikselu). Wzorzec: `zrodlo/common.js` (`_onS`, `hdrHide`).
- Pasek kotwic przesuwa się płynnie na `top: 0`, gdy nagłówek schowany.

## 3. Dolny pasek kart
- 5 pozycji: **Start** (link `/`) · **Usługi** (arkusz, zakładka Usługi) · **Zaplanuj** (link `/zaplanuj`, wyróżniony: tło `var(--accent)`, uniesiony o 14 px, cień `var(--glow)`) · **Dla kogo** (arkusz, zakładka Dla kogo) · **Więcej** (arkusz, zakładka Więcej).
- Ikona 21 px w „pigułce” 44×28; etykieta 11,5 px, waga 800. Cel dotykowy każdej pozycji ≥ 54 px wysokości.
- **Stan aktywny:** pigułka `var(--accentSoft)`, ikona `var(--accentText)`, etykieta `var(--text)`. Aktywna karta = sekcja bieżącej strony (strona główna → Start, usługa → Usługi, obiekt → Dla kogo, Realizacje/Serwis/Poradnik/O firmie/Kontakt → Więcej) albo zakładka otwartego arkusza.
- Naciśnięcie: `transform: scale(.94)`.
- Pasek: `position: fixed; left/right: 10px; bottom: calc(10px + env(safe-area-inset-bottom))`, zaokrąglenie 22 px, tło jak nagłówek, cień. Gdy arkusz otwarty — pasek znika (arkusz go zasłania).
- `aria-current="page"` na aktywnym linku, `aria-expanded` na przyciskach arkusza.

## 4. Arkusz od dołu (menu)
Wzorzec: `stany-telefonu/02–04`. Komponent `BottomSheet`.
- Tło przyciemnione `rgba(5,10,9,.52)` z lekkim rozmyciem; klik w tło zamyka.
- Panel: zaokrąglenie 28 px u góry, uchwyt 42×5 px, max wysokość `min(88vh, 860px)`, wjazd od dołu 0,34 s `cubic-bezier(.2,.9,.25,1)`.
- Nagłówek arkusza: przełącznik 3 zakładek **Usługi · Dla kogo · Więcej** + przycisk zamknięcia (×, 46 px).
- **Usługi:** 3 grupy (Bezpieczeństwo, Sieci i technika, Komfort i obraz), kafle 2 w rzędzie z ikoną w kolorze usługi, „Pełna oferta: 76 rozwiązań →”.
- **Dla kogo:** 4 grupy, 12 kafli obiektów.
- **Więcej:** status godzin na żywo, lista: Realizacje, Serwis i przeglądy, Poradnik, O firmie, Kontakt i dojazd, Pełna oferta (ikona, nazwa, podpis, strzałka); kafle „Zadzwoń” i „Motyw”.
- Stopka arkusza (przyklejona): „Zaplanuj instalację” na całą szerokość.
- Zachowanie: blokada przewijania strony pod spodem (`overflow: hidden` na `html`, bez skoku — kompensacja paska przewijania niepotrzebna na telefonie), przewijanie wewnątrz z `overscroll-behavior: contain`, **przeciągnięcie w dół zamyka** (gest: > 80 px albo szybki ruch), Esc zamyka, focus przenoszony do arkusza i z powrotem na przycisk, `role="dialog" aria-modal="true"`, powrót przyciskiem „wstecz” w przeglądarce zamyka arkusz (wpis w historii przy otwarciu — `history.pushState`).
- Na tablecie (761–1100 px) ten sam arkusz, wyśrodkowany, max 560 px; na desktopie arkusza nie ma (mega menu).
- `prefers-reduced-motion`: bez animacji wjazdu.

## 5. Przejścia i odczucie aplikacji
- **Przejścia między stronami:** View Transitions (Next.js `viewTransition` / CSS `@view-transition { navigation: auto; }`) — krótkie przenikanie 180 ms; nagłówek i dolny pasek bez animacji (stałe elementy z `view-transition-name`). Fallback: brak animacji.
- **Prefetch** linków z dolnego paska i arkusza (domyślne w `next/link`).
- **Bez skoków układu:** zarezerwowane wymiary scen, zdjęć i widżetów (CLS < 0,1); fonty z `size-adjust` przez `next/font`.
- **Stany naciśnięcia** na wszystkich kafelkach i przyciskach (`:active` scale .97), **bez** efektów hover na dotyku (`@media (hover: hover)`).
- `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` na przyciskach (bez opóźnienia).
- Pasek stanu: `<meta name="theme-color">` w kolorze tła motywu (jasny/ciemny), `viewport-fit=cover` + safe-area.
- **Manifest** (`manifest.webmanifest`): nazwa „PRO-KOM Instalacje”, ikony z księgi znaku (192/512, maskable), `display: standalone`, kolor motywu. Bez service workera w etapie 1 (brak sensu offline dla strony usługowej).
- Przycisk „Do góry” niepotrzebny — nagłówek wraca przy przewinięciu w górę.

## 6. Treść na telefonie
- **Hero podstron:** eyebrow, H1 (max 3–4 linie), lead, przyciski jeden pod drugim (główny pełnej szerokości), liczby (kv), tagi, widżet hero pod tekstem.
- **Hero strony głównej:** scena na górze, pod nią tekst na tle zgodnym z porą sceny (noc → `#0D1412`, dzień/zima → `#EAF1F0`) niezależnie od motywu strony (błąd z jasnego motywu poprawiony w v4.0).
- **Karuzele** zamiast długich siatek tam, gdzie prototyp je ma (przewijanie w bok z przyciąganiem `scroll-snap`, widoczny skrawek następnej karty, bez paska przewijania).
- **Sekcje zwinięte** (`fold.json`): pokazujemy ok. 640 px (albo wartość z pliku), gradient i przycisk „Pokaż całą sekcję” / „Zwiń sekcję”; treść w HTML (SEO).
- **Tabele** (porównania): przewijane w bok z podpowiedzią „Przesuń tabelę w bok”; pierwsza kolumna przyklejona.
- **Widżety** (sceny z punktami, kalkulatory, symulatory): dotyk zamiast hover; punkty sceny ≥ 44 px pola dotyku (przezroczyste koło `r=24` w SVG jak w prototypie); legenda warstw jako przewijany rząd chipów pod sceną; panel opisu punktu o stałej min. wysokości (bez skakania).
- **Formularze:** pola 16 px (bez zoomu iOS), właściwe `type`/`inputmode`/`autocomplete` (`tel`, `email`, `name`, `address-level2`), etykiety nad polem, błąd pod polem, przycisk wysyłki widoczny nad klawiaturą (`scrollIntoView` pola z błędem), kreator „Zaplanuj”: jeden krok na ekran, pasek postępu, „Wstecz/Dalej” przyklejone na dole nad dolnym paskiem.

## 7. Ekrany wzorcowe (`stany-telefonu/`, jasny i ciemny)
| Plik | Co pokazuje |
|---|---|
| `01-start` | strona główna, hero ze sceną |
| `02-arkusz-uslugi` | arkusz, zakładka Usługi |
| `03-arkusz-dla-kogo` | arkusz, zakładka Dla kogo |
| `04-arkusz-wiecej` | arkusz, zakładka Więcej |
| `05-usluga-naglowek-schowany` | usługa po przewinięciu w dół: nagłówek schowany, aktywna karta Usługi |
| `06-usluga-naglowek-wraca` | po przewinięciu w górę: nagłówek wraca |
| `07-obiekt-dla-kogo` | strona obiektu, aktywna karta Dla kogo |
| `08-zaplanuj` | kreator |
| `09-kontakt` | kontakt |
| `10-ladowarki-konfigurator` | konfigurator ładowarki pod paskiem kotwic |

## 8. Wydajność na telefonie
LCP < 2,5 s, INP < 200 ms, CLS < 0,1 (staging, Lighthouse „mobile”, ograniczenie 4G). Sceny i widżety poniżej pierwszego ekranu ładowane przy zbliżeniu do widoku; autoodtwarzanie tylko, gdy widoczne.

## 9. Dostępność
Kontrast AA w obu motywach, focus widoczny (także w arkuszu), czytnik ekranu: etykiety przycisków paska i arkusza, ogłaszanie zmiany zakładki (`aria-pressed`), widżety z opisem tekstowym wyniku (`aria-live="polite"` dla wyników kalkulatorów).

## 10. Odbiór każdej sesji z UI (telefon)
- [ ] 360 / 390 / 414 px: brak poziomego przewijania (`document.documentElement.scrollWidth === innerWidth`).
- [ ] Cele dotykowe ≥ 44 px (przyciski, chipy, punkty scen), linki w tekście ≥ 24 px wysokości wiersza.
- [ ] Nic nie chowa się pod dolnym paskiem; arkusz otwiera się, zamyka (×, tło, gest, Esc, wstecz).
- [ ] Nagłówek chowa się i wraca; pasek kotwic nie zostawia przerwy.
- [ ] Zrzuty 390 w obu motywach porównane ze wzorcem (`porownaj.mjs … 390 light|dark`).
- [ ] Lighthouse mobile ≥ 90 na zmienionych stronach (lokalnie orientacyjnie, na stagingu wiążąco).
- [ ] Test na prawdziwym telefonie (Android + iPhone) przed scaleniem sesji powłoki (I3) i przed produkcją.
