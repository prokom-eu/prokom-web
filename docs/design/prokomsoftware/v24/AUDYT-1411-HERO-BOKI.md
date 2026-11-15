# Software — audyt 14.11.2026: puste boczne okna w hero (produkcja)

## Objaw

Na `https://prokomsoftware.pl/` boczne okna karuzeli hero (`rl`, `r1`) są puste. Widać tylko ich delikatny obrys, środkowe okno wygląda normalnie. Nie jest to decyzja wydajnościowa ani zamierzony wygląd, tylko błąd.

## Przyczyna (zmierzona na produkcji)

- Okna boczne mają poprawną pozycję i przezroczystość (`rl`/`r1` = 0,5, `visibility: visible`) i mają w DOM całą makietę (53–84 elementów).
- Treść makiety jest pominięta przez przeglądarkę. `element.checkVisibility({ contentVisibilityAuto: true })` na treści `.mk` daje `false` dla `rl`, `r1`, `rl2`, `r2`, a w trakcie zmiany slajdu czasem także dla środkowego `r0`:

```
rl2 SKIPPED | rl DRAWN | r0 DRAWN   | r1 SKIPPED | r2 SKIPPED
rl2 SKIPPED | rl DRAWN | r0 SKIPPED | r1 SKIPPED | r2 DRAWN     ← w czasie przejścia
```

- Źródło: `src/sites/software/style/mockups.css` → `.mk { content-visibility: auto; }`, dodane w #494 („makiety renderowane przy ekranie”, Lighthouse 10.11). Na stronie to dobra optymalizacja (30 makiet). W hero okna są jednak przesunięte w 3D (`translateZ(-420px) rotateY(±28deg)`) w kontenerze z `perspective` i `mask-image`. Chrome uznaje je wtedy za „poza ekranem” i nie maluje ich treści. Stąd puste ramki po bokach i ryzyko mignięcia pustego okna w środku przy zmianie slajdu.

## Poprawka (mała, bez pogorszenia wydajności)

1. W hero treść makiet zawsze rysowana, gdy okno jest w kadrze:

   ```css
   .hx-win .mk { content-visibility: visible; }
   .hx-win[data-rank='rx'] .mk { content-visibility: hidden; } /* niewidoczne okna: bez malowania, jak dotąd */
   ```

   W kadrze jest 5 okien (`rl2`, `rl`, `r0`, `r1`, `r2`, skrajne pod maską). Koszt: 4 dodatkowe małe makiety. Reszta strony zachowuje `content-visibility: auto` z #494.

2. To samo dla makiety w oknie oferty (`.sw-offer-shot .mk { content-visibility: visible; }`). Dziś otwiera się poprawnie (pełne okno po 74 ms, treść narysowana), ale okno jest w top layer z animacją wejścia (transform), więc to zabezpieczenie przed pustą klatką.
3. Test e2e (`software-hero`): przez 2 pełne zmiany slajdu (próbkowanie co 100 ms) treść `.mk` w oknach `rl`, `r0`, `r1` ma `checkVisibility({ contentVisibilityAuto: true }) === true`. Na telefonie (≤ 600 px) bez zmian: tam jest jedno okno.
4. Zrzut 1440 i 1920 przed/po do PR: obie strony widać z treścią (przyciemnione 0,5, w 3D).

## Przy okazji sprawdzone na produkcji ✓

- Okno oferty bez View Transitions: pełna widoczność po 74 ms od kliknięcia, bez nakładania strony na okno.
- Slajd „Pulpit firmy” i kafel w hero są. Okno oferty „Pulpit firmy i raporty” działa.
- Cena Pulpitu: od 1 999 zł netto (#558, decyzja po 12.11). Rekomendacja z SWA14 §4.5 była 3 490 zł. Przy 1 999 zł Pulpit jest najtańszym systemem w ofercie, poniżej czasu pracy (2 990 zł) i CRM (3 490 zł). To działa jako produkt na wejście, pod warunkiem że zakres „1 źródło, 6–8 wskaźników” jest na piśmie, a każde kolejne źródło danych wyceniamy osobno.

## Realizacja (14.11)

- `fix/software-hero-boki`: p. 1 w `hero.css`, p. 2 w `subpages.css`, p. 3 w `tests/e2e/software-hero.e2e.spec.ts`.
- Pomiar: Chrome z Playwright (także headless) rysuje treść mimo `content-visibility: auto`; błąd odtwarza się w Chrome na pulpicie. Dlatego test sprawdza też wyliczone `content-visibility` makiety (na starym CSS pada, na nowym przechodzi).
