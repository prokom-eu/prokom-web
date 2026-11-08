# Software v24 — audyt 09.11.2026 (po SWA8a #451 i wsp #449)

Sprawdzone na żywo: `software.localhost:3004`, 17 stron × 1440 i 390, hero na 6 rozmiarach, okno oferty, szyna, stopka, wyszukiwarka, Audyt. Poprzednie audyty: `AUDYT-0811.md`, `AUDYT-0811-PO-SWA7.md`.

> Ruchu (płynność animacji) nie da się zmierzyć w tej karcie Chrome — przeglądarka dławi ją do ~1 kl./s. Lista ruchu P2 z `AUDYT-0811-PO-SWA7.md` zostaje do sprawdzenia nagraniem Playwright (video on, 1440 i 390).

## Naprawione ✓

| # (po SWA7) | Co | Wynik pomiaru |
|---|---|---|
| 1, 2, 3 | Hero na pierwszym ekranie | 1920×1080: okno 572–1052 (w 731) · 1440×900: 610–1048 (w 666) · 1366×768 i 1280×720: okno 560 px szer., całe nad zgięciem · 834×1112: 653–1021 · 390×844: makieta do 736, pasek kart od 766 (30 px oddechu) |
| 4 | Szyna przy stopce | znika (`opacity 0`, `visibility hidden`, bez kliknięć) |
| 5 (część) | `em` w H2 | strona główna i Audyt — komplet |
| 6 | Audyt — podwójny CTA | po FAQ jeden pas „Zacznij od podglądu…” |
| 7 | Okno oferty — potrójna cena | cena raz w nagłówku + raz w dolnym pasku CTA (+ w pytaniu FAQ „Co jest w cenie…”) — akceptowalne |
| 8 | Pierścień fokusu na start okna | fokus na H2 tytułu, `outline-none` — brak pierścienia |
| 9 | Wyszukiwarka — boczne kreski | tylko dolna fioletowa linia (inset), bez bocznych |
| 10 | Stopka — puste pole | kolumny + pas linii wypełniają szerokość |
| — | Struktura | każda z 17 stron: dokładnie jeden H1, brak poziomego przewijania (1440, 390), wszystkie obrazy z `alt`, brak placeholderów/NaN/TODO |

## Do poprawy — P1 (SWA8b)

1. **`em` w H2 na podstronach** (styl v24: jedno słowo wyróżnione fioletem). Brakuje w:
   - `/dobierz`: „Czego potrzebujesz?”, „Cztery kroki do startu”
   - `/o-firmie`: „Dlaczego PRO-KOM”, „Jak to wygląda krok po kroku”, „5 linii PRO-KOM”, „Nie musisz wierzyć nam na słowo”, „Wpadnij do nas — ul. Orkana 16B, Rabka-Zdrój.”
   - `/kontakt`: „Z czym dzwonisz?”, „Opisz, co chcesz usprawnić”, „Kod nie zna granic. Kawa jest w Rabce.”, „Inna sprawa? Każda linia ma swój zespół.”, „Zanim zadzwonisz”
   - `/rozwiazania/[slug]`: „Jak to wygląda”, „W cenie każdego projektu”, „Często łączone z”, „Zanim zapytasz”
   - `/miejscowosci/[miasto]`: „Dla kogo pracujemy najczęściej”, „Blisko, czyli prościej”, „Najczęściej pytacie o to”, „Pracujemy też w okolicy”
   - Bez zmian (OK): numerowane H2 stron prawnych, grupy na mapie strony, kroki na „Dziękujemy”.
   - Uwaga: część z tych nagłówków pochodzi ze wspólnych komponentów (O firmie, Kontakt, „Każda linia ma swój zespół”) — `em` przez slot/prop linii, zmiana komponentu wspólnego = osobny mały PR `feat/wsp-*`.
2. **Decyzja #11 (Django na O firmie)** — nadal otwarta, czeka na Krystiana.

## P2 (przy okazji SWA8b, jeśli tanie)

3. **Małe cele dotyku na Kontakcie / O firmie** (19–20 px): „Darmowy audyt”, „Software: 883 200 151”, „Sprawdź w CEIDG →”. Linki w treści akapitu są zwolnione z WCAG 2.5.8, ale te stoją samodzielnie — dodać `py-2` / `min-h-11` na telefonie.
4. Pas przed stopką na Audycie prowadzi do kreatora („Kreator 60 s”) — rozważyć wariant „Zamów darmowy audyt” (to strona audytu). Decyzja treści, nie błąd.
5. **Ruch** — lista P2 1–6 z `AUDYT-0811-PO-SWA7.md` (hero: przejścia okien, wpisywanie komendy, pasek szyny, wejścia sekcji, okno oferty, tab bar telefonu) do sprawdzenia nagraniem.

## Prompt dla Claude Code

```
/zadanie SWA8b — szlif po audycie 09.11 (docs/design/prokomsoftware/v24/AUDYT-0911.md)
Start: git status, git fetch. Gałąź od origin/develop: feat/swa8-szlif. Folder prokom-web-software (PORT=3003, baza prokom_web_swa).
Zakres: P1 #1 — em w H2 na /dobierz, /o-firmie, /kontakt, /rozwiazania/[slug], /miejscowosci/[miasto] (teksty i wyróżnione słowo wg TRESCI-v24.md; brak w TRESCI → wybierz rzeczownik-klucz i wypisz listę w opisie PR). Nagłówki ze wspólnych komponentów (O firmie, Kontakt, linie) → osobny mały PR feat/wsp-h2-em (prop/slot z wyróżnieniem, bez zmiany wyglądu innych linii).
P2 #3 — cele dotyku ≥ 44 px na telefonie dla samodzielnych linków na Kontakcie/O firmie.
P2 #5 — nagraj Playwright (video on, 1440 i 390, ciemny) stronę główną i okno oferty; popraw, co szarpie; nagrania do opisu PR.
Nie ruszaj: hero i szyny (8a zamknięte), #11 Django (czeka na decyzję), #4 (decyzja treści).
DoD: lint/typecheck/test zielone, e2e Software, porównanie scripts/software-porownaj.mjs 1440/390 × ciemny/jasny dla zmienionych stron, MOBILE-APLIKACJA §5, /przeglad przy diffie > 100 linii, potem /pr.
```
