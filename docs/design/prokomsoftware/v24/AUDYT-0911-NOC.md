# Software v24 — audyt 09.11.2026, noc (po SWA10 #477 i wsp #478)

Sprawdzone na żywo: `software.localhost:3003`.
- **46 adresów** (cały `sitemap.xml` + `/dziekujemy` + 404) na **PC 1440×900** i **telefonie 390×844**.
- **15 stron głównych** (bez stron pojedynczych rozwiązań, branż, miejscowości i wpisów) dodatkowo na **laptopie 1280×720** i **tablecie 834×1112**.
- Hero na **14 rozmiarach** ekranu.
- Okno oferty systemu (punkty na pulpicie).

Ruchu nie oceniam: karta Chrome dławi animacje do ok. 1 klatki na sekundę.

## Werdykt
**Gotowe na staging.** Na wszystkich rozmiarach:
- jeden H1 na stronę,
- zero poziomego przewijania,
- obrazy z `alt`,
- zero zaślepek i NaN,
- `em` we wszystkich H2 poza świadomymi wyjątkami,
- brak linków `#`.

Zostaje jedna rzecz ważna dla klientów z telefonu (P1 #1). Poprawka jest mała i nie musi blokować stagingu.

## Naprawione od audytu „wieczór” ✓
- Hero na 1440×900 (okno 492–886) i 1366×768 (393–761) mieści się całe. Na 1536×864 i 1920×1080 też.
- Systemy w oknie oferty: 3 punkty na makiecie pulpitu (moduł, użytkownicy, telefon).
- `em` w pasach kontaktu rozwiązań, branżach i CTA miejscowości.
- Pasek okna oferty na telefonie w jednej linii, przełącznik Komputer | Telefon jako szkło.
- Stopka na telefonie 44 px, „Do góry” bez `href="#"`, pasek marki na dotyku (wspólne #478).

## P1

1. **Hero na telefonie nie liczy wysokości ekranu — dolny pasek zasłania okno makiety.** Okno ma zawsze pozycję 526–736 px, niezależnie od wysokości:
   | Telefon (viewport) | Okno makiety | Dolny pasek od | Zasłonięte |
   |---|---|---|---|
   | 412×915 | 526–736 | 838 | 0 ✓ |
   | 390×844 | 526–736 | 767 | 0 ✓ |
   | 360×800 | 526–736 | 723 | 13 px |
   | 360×740 | 526–736 | 663 | 73 px (35%) |
   | 375×667 (iPhone SE) | 526–736 | 590 | 146 px (70%) |

   **Ważne:** w prawdziwym Safari i Chrome na iPhonie 390×844 widoczna wysokość z paskami przeglądarki to ok. 660–750 px, a nie 844. Większość klientów z telefonu widzi więc tylko górny pasek okna. To ten sam problem, który rozwiązaliśmy na PC w SWA8a/SWA10, tylko po stronie telefonu.
   **Poprawka:** rytm hero telefonu według `100svh`/`100dvh`, tak jak na PC według wysokości. Przy niskim ekranie zmniejszamy odstęp nadtytuł → H1 → lead → pole, H1 o 1–2 stopnie, a okno o 10–15%. Cel: **dolna krawędź okna ≤ górna krawędź dolnego paska** dla 360×640, 375×667, 390×664 (Safari z paskami) i 390×844. e2e `software-hero` dostaje te 4 rozmiary.

## P2

2. **Tablet poziomo:** 1180×820 (iPad Air) — okno 614–970, widać ~58%. 1024×768 (iPad poziomo) — 558–862, ~69%. Na 1280×720 (~63%) zostawiliśmy tak decyzją 09.11. Tablet poziomo to częsty sposób oglądania stron przez właścicieli firm, więc warto objąć go regułą z SWA10 (szerokość okna z wysokości pod panelem) od 1024 px wzwyż przy wysokości ≤ 900. Decyzja Krystiana: (a) zostaje, (b) objąć 1024–1279.
3. **Znaczniki ①②③ na makiecie pulpitu zasłaniają treść:** ② leży na awatarze „AN”, ③ na ikonie plakietki „Telefon”. Przesunąć je na róg obszaru, na zewnątrz (`translate(-50%, -50%)` względem rogu), tak jak na makietach stron.

## P3
4. Okruszki („Strona główna”, „Kreator”) na /kontakt, /o-firmie i /dobierz mają 19–20 px wysokości. Na telefonie warto dać `min-h-6` (24 px, WCAG 2.5.8) — 44 px nie jest potrzebne, bo to nawigacja pomocnicza.

## Prompt dla Claude Code

```
/zadanie SWA11 — hero telefonu wg wysokości + drobiazgi (docs/design/prokomsoftware/v24/AUDYT-0911-NOC.md)
Start: git status, git fetch. Folder prokom-web-software (PORT=3003, baza prokom_web_swa). Gałąź od origin/develop: feat/swa11-hero-telefon.
Najpierw jedno pytanie: #2 tablet poziomo (a) zostaje / (b) reguła wysokości od 1024 px.
#1: rytm hero ≤ 767 px wg 100svh (fallback 100vh) — przy niskim ekranie mniejsze odstępy, H1 o 1–2 stopnie, okno makiety do ~85%; bez zmian na ≥ 390×844 tam, gdzie już się mieści. e2e software-hero: 360×640, 375×667, 390×664, 390×844 — dolna krawędź .hx-win[data-rank=r0] ≤ górna krawędź dolnego paska (nav fixed bottom).
#2 wg decyzji. #3 znaczniki makiety pulpitu na rogach obszarów, bez zasłaniania treści (zrzut przed/po). #4 okruszki min-h-6 (komponent wspólny → osobny mały PR feat/wsp-*, jeśli tam leży).
DoD: lint/typecheck/test, e2e software-hero, scripts/software-porownaj.mjs 390 i 1440 × ciemny/jasny dla Glowna, MOBILE-APLIKACJA §5, /pr (bez /przeglad, jeśli diff < 100 linii bez logiki).
```
