# prokombiznes.pl — brief wizualny (theme lock)

- **Status:** szkic do akceptacji Krystiana · 15.10.2026 · **częściowo zastąpiony 17.10.2026** przez wizualizację `docs/design/prokombiznes/` i ADR-013 (kolory, gradienty, tryb ciemny). Odczucie, ruch, zakazy treściowe i dostępność obowiązują dalej.
- **Uzupełnienie K3.1 (26.10.2026, KD)** — ma pierwszeństwo przed punktami niżej (źródło: `docs/design/prokombiznes/K31-ZMIANY.md` §3, `MOBILE-APLIKACJA.md`; spec. §3.3, §3.8):
  - **kafel produktu (§7):** zamiast tła Papier — jedno tło „studio” (`<ProductStage>`: gradient radialny, „blat”, miękki cień, zdjęcie `contain` 74–80% pola) we wszystkich miejscach ze zdjęciem produktu; siatki i kropki pod zdjęciami usunięte; kolory studio jako tokeny w `src/styles/tokens.css` (K31b);
  - **poświaty (§10 „tła z poświatą”):** dozwolone tylko na ciemnych kartach hero na telefonie (dwie miękkie poświaty zamiast siatki, wzorzec `k31/screens/App-Start-390`) i w hero GoPOS 2.0 (ciepła poświata sceny); jasne tła stron bez poświat jak dotąd;
  - **telefon (§9, §8 pkt 10):** obowiązuje „telefon jak aplikacja” z `MOBILE-APLIKACJA.md` (dolny pasek 5 zakładek, arkusze, przyklejone akcje) zamiast stałego paska „Zadzwoń / Zapytaj o ofertę”;
  - **ikony:** dalej własny zestaw z ADR-012 §4 (nie Lucide) — wyróżniki produktu dobierane słownikiem słów kluczowych z tego zestawu.
- **Do czego służy:** wejście dla `superpowers:brainstorming` i `frontend-design` w Claude Code. Opisuje *jak strona ma wyglądać i działać*; *co* jest na stronie (mapa, treści, zakres) — `docs/strony/prokombiznes.md`. Przy sprzeczności wygrywa specyfikacja, potem `docs/marka.md` i ADR-007.
- **Kierunek pokazany na canvasie:** „prokombiznes.pl · kierunek wizualny” (Claude, 15.10) — strona główna, podstrona pozycji, kreator, telefon. Projekt strony głównej (jasny/ciemny, komputer i telefon): `prokombiznes-strona-glowna-projekt.pdf`.
- **Zasada z poradnika Anthropic „Prompting for frontend aesthetics”:** bez wskazówek model zbiega do generycznego wyglądu („AI slop”). Dlatego poniżej każdy wymiar (typografia, kolor, tło, ruch) jest opisany osobno, z listą zakazów i **zamkniętym motywem** — nie interpretuj marki na nowo.

## 1. Odczucie
Solidny lokalny partner, który po prostu działa. Porządek, precyzja, spokój techniczny — jak dobrze zrobione urządzenie. Nie startup, nie korporacja, nie sklep z promocjami. Klient ma w 5 sekund wiedzieć: *to firma od wszystkiego, czego potrzebuję do sprzedaży i pracy, i wiem, gdzie kliknąć*.

## 2. Motyw zamknięty (nie zmieniać)
- **Kolory** wyłącznie z tokenów `docs/marka.md` przez `data-line="biznes"` → `--accent*`: Granat `#244FB0` (na ciemnym `#4A7BE0`), Grafit `#121613`, Papier `#F4F5F1`, biel. Tekst i przyciski z białym napisem — `--accent-text`.
- **Kroje:** Archivo (nagłówki, liczby, numeracja) + Manrope (tekst). Self-hosted (ADR-007). Żadnych innych krojów.
- **Znak:** pliki z `public/brand/`, bez zmian proporcji, kolorów i efektów.
- **Zdjęcia:** tylko produkty od producentów i oficjalne logo partnerów. Zero zdjęć ludzi, stocków, realizacji.

## 3. Typografia — kontrast, nie średniość
- Skala z dużymi skokami (≥ 3×): H1 Archivo 800, szerokość 110–118 %, `clamp(40px, 5.2vw, 68px)`, interlinia 1.02, tracking −0.02em; tekst Manrope 400, 16–19 px, interlinia 1.6.
- Wagi skrajne: nagłówki 800, tekst 400–500. Nie używać 600 jako „trochę grubszego” nagłówka.
- Eyebrow nad sekcją: Manrope 700, wersaliki, tracking 0.08em, w kolorze akcentu, poprzedzony krótką kreską.
- Liczby zaufania (2004, 100+, 1–2 h) — Archivo 800, 56–64 px: liczby są grafiką strony.
- Numeracja działów `01–05` w Archivo, w kolorze akcentu — stały element nawigacji.

## 4. Kolor i rytm
- Dominanta: biel i Papier; Grafit jako mocne bloki rytmu (pasek marki, sekcja kreatora, stopka, jeden kafel bento). Granat to **ostry akcent** (~10 % powierzchni): CTA, numeracja, kreski, jeden kafel bento, blok zapytania.
- Głębia **bez gradientów** (marka zabrania efektów): przemienność tła biel → Papier → Grafit, układ bento, zaokrąglenia 16–28 px, obramowania 1.5 px `#E3E6DF`, cień tylko na panelu formularza.

## 5. Motyw sygnaturowy: kreska i myślnik z logo
Element, który odróżnia stronę od szablonów — wszędzie ten sam kształt (zaokrąglony prostokąt, grubość 4–8 px):
- przed eyebrow nad sekcjami,
- pasek postępu w krokach „Jak pracujemy” i w kreatorze,
- podkreślenie aktywnej pozycji menu i hover linków nawigacji,
- zakończenie tablicy działów w hero i kafli produktów (wyrównane do prawej, jak w logo),
- znacznik aktywnej linii w pasku marki.

## 6. Ruch — mało, ale celowo
- Jedno wejście strony: elementy hero pojawiają się kolejno (opacity + 8 px w górę, `animation-delay` co 60–80 ms); kreska pod tablicą działów „rysuje się” od prawej (scaleX).
- Kroki procesu: kreski wypełniają się przy wejściu w widok (raz).
- Hover: zmiana koloru + kreska; bez skalowania kart.
- Tylko CSS (bez bibliotek animacji), `prefers-reduced-motion: reduce` → brak animacji. Budżet: Lighthouse ≥ 90 na telefonie, CLS ≤ 0.1 (S10).

## 7. Obrazy i ikony
- **Kafel produktu:** tło Papier, jednakowy kadr (3:4 albo 1:1), produkt wycięty z zachowaniem marginesu 12 %, tag marki w rogu, kreska w prawym dolnym rogu. Spójność kadrów daje efekt premium bez własnej sesji.
- **Logo partnerów:** oryginalne pliki, oryginalne kolory, białe kafle o równej wysokości optycznej; bez przerabiania na monochrom (ESET i inni zabraniają modyfikacji). Każde logo da się ukryć w panelu.
- **Ikony:** jeden zestaw liniowy, grubość kreski 1.75, rozmiary 24/32 px, kolor akcentu (propozycja: Lucide — decyzja w ADR-008).

## 8. Komponenty sygnaturowe (wszystkie z canvasu)
1. Pasek marki (linie PRO-KOM, telefony, godziny).
2. Hero z pytaniem „Czego potrzebuje Twoja firma?” i chipami potrzeb → filtr `/oferta`.
3. Tablica działów 01–05 (hero).
4. Bento zaufania: 2004 · 100+ · Autoryzowany serwis Posnet i Elzab · 1–2 h.
5. Pas KSeF z datą i źródłem.
6. Siatka działów (dział 03 jako duży blok z grupami).
7. Kafle branż z ikoną.
8. Kreator „Dobierz rozwiązanie” (3 kroki → wynik → gotowe zapytanie).
9. Kroki „Jak pracujemy” z kreskami postępu.
10. Panel zapytania: na desktopie przyklejony z boku podstrony pozycji, temat uzupełniony; na telefonie stały dolny pasek „Zadzwoń / Zapytaj o ofertę”.
11. FAQ na `<details>` z danymi strukturalnymi.
12. Stopka z linkami do innych linii PRO-KOM.

## 9. Telefon najpierw
Strona projektowana od 390 px: hero mieści pytanie i pierwsze chipy nad zgięciem; chipy i branże przewijane poziomo; działy jako lista wierszy; dolny pasek akcji zawsze widoczny i nie zasłania stopki (dolny padding). Cele dotyku ≥ 44 px.

## 10. Czego unikać (lista zakazów)
- Inter, Roboto, Arial, Open Sans, Lato, kroje systemowe; fiolet i gradienty; tła z „poświatą”.
- Slider w hero, popupy, czat-boty, animowane liczniki, emoji, „Czytaj więcej” bez celu.
- Karty z kolorową lewą ramką, stocki „ludzie przy laptopie”, ikony z różnych zestawów.
- Teksty skopiowane od producentów, superlatywy bez pokrycia („lider”, „najtańsi”), liczby, których szef nie potwierdził.
- Ściany tekstu na podstronach: każda pozycja = stały szablon ze specyfikacji (korzyść, dla kogo, co obejmuje, marki, kroki, finansowanie, FAQ, powiązane, formularz).

## 11. Dostępność (warunek odbioru)
WCAG 2.1 AA: kontrast tekstu ≥ 4.5:1 (`--accent-text`), duże nagłówki ≥ 3:1; prawdziwe `<button>`, `<a>`, `<label>`; widoczny focus (kreska + obrys); axe w Playwright bez błędów (ADR-007).
