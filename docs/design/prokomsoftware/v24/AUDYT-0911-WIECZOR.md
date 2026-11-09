# Software v24 — audyt 09.11.2026 wieczór (po SWA8c #459, SWA9a #460, SWA9b+9c #462)

Sprawdzone na żywo: `software.localhost:3003`. **46 adresów** (cały `sitemap.xml` + `/dziekujemy` + 404) × **1440×900 i 390×844**, hero na 7 rozmiarach (1920×1080, 1440×900, 1366×768, 1280×720, 1024×768, 834×1112, 390×844), okno oferty na PC i na telefonie.
Ruch: karta Chrome dławi animacje do ~1 kl./s, więc płynności tu nie oceniam. Pomiary z buildu są w STAN (SWA9c: zmiana oferty 0 długich klatek, otwarcie 2 klatki po 80–100 ms).

## Werdykt
**Gotowe na staging.** Brak błędów blokujących: na każdej stronie jeden H1, zero poziomego przewijania na 1440 i 390, wszystkie obrazy z `alt`, zero zaślepek, NaN i TODO. Poniżej lista szlifów. Żaden nie blokuje stagingu, część lepiej zrobić przed pokazaniem strony szefowi.

## Naprawione od audytu 09.11 (rano) ✓
- `em` w H2 podstron: /dobierz, /o-firmie, /kontakt, /rozwiazania/[slug] („Jak to **wygląda**”, „Zanim **zapytasz**”), /miejscowosci (FAQ) (SWA8c).
- Cele dotyku: CEIDG i trasy w wizytówce firmy (#464).
- Okno oferty premium: cena-bohater, kropki kategorii, zakładki z podświetleniem przy przewijaniu, punkty „W cenie” ①②③ na makiecie, przełącznik Komputer | Telefon, chipy „Potrzebujesz więcej?” bez cen, pasek z głównym „Zapytaj o tę ofertę →”, arkusz na telefonie (SWA9a–c). Na 1440 wygląda czysto i nowocześnie.

## P1 — przed pokazaniem szefowi

1. **Hero na laptopach nie mieści całego okna.** Dolna krawędź okna makiety vs wysokość ekranu:
   | Ekran | Okno makiety (góra–dół) | Widać |
   |---|---|---|
   | 1920×1080 | 573–1053 | całe ✓ |
   | 1440×900 | 611–1049 | ~66% |
   | 1366×768 | 496–863 | ~74% |
   | 1280×720 | 488–856 | ~63% |
   | 1024×768 | 558–862 | ~69% |
   | 834×1112 | 654–1021 | całe ✓ |
   | 390×844 | 526–736 | całe ✓ (pasek kart niżej) |

   To zgodne z celem SWA8a (widać > ½ okna). Krystian chciał jednak od początku, żeby „wszystko było na pierwszym ekranie”. **Decyzja:** (a) zostaje tak — okno „wychodzi” spod zgięcia, co zachęca do przewinięcia; (b) dociągnąć do całego okna na 1366–1440: mniejszy odstęp H1 → pole „Czego potrzebuje Twoja firma?” → okno, kafle w jednym wierszu bez podpisów przy wysokości ≤ 900. Rekomendacja: **(b) tylko dla 1440×900 i 1366×768** (najpopularniejsze laptopy). 1280×720 i 1024×768 zostają, jak jest.
2. **Okno oferty dla systemów, aplikacji i automatyzacji: zero punktów na makiecie.** Te 10+ ofert pokazuje numerowane punkty „W cenie”, ale nic nie podświetla się na makiecie. To otwarta decyzja z SWA9. Rekomendacja: dopisać `data-spot` w makietach paneli (pulpit, lista klientów, wykres, „do kogo zadzwonić”, powiadomienie) i dopasować słowa w `spots.ts`. Przeredagowanie `included` w panelu odpada, bo dotyka cen i zakresu.
3. **Ostatnie H2 bez `em`** (styl v24: każdy nagłówek sekcji z wyróżnieniem):
   - pas końcowy wszystkich `/rozwiazania/[slug]`: „Powiedz, co chcesz usprawnić, a resztę dobierzemy…”,
   - `/rozwiazania/aplikacja-dla-ekip-w-terenie`: „Jak to działa, krok po kroku”, „Z przeglądarki czy ze sklepu?”, „Pokaż nam dzień ekipy…”,
   - `/dla-branz/budownictwo-i-wykonczenia`: „Moduły jednego systemu”, „Kliknij swój problem…”, „Na budowie w górach…”, „Sześć rzeczy…”, „Pokaż, jak dziś pracują Twoje ekipy”,
   - `/miejscowosci/rabka-zdroj`: „Wpadnij do salonu przy Orkana 16B”,
   - `/dziekujemy`: kroki „Odpowiadamy”, „Rozmowa 30 min”, „Podgląd i wycena” — to kroki, mogą zostać bez wyróżnienia (decyzja jak na mapie strony).
   - Bez zmian: nadtytuł „Często łączone z” i „Pracujemy też w okolicy” (decyzja 09.11), grupy na mapie strony, H2 tylko dla czytników („Nasze obietnice”, „Cennik rozwiązań”, „Rozwiązania”).

## P2 — szlif

4. **Telefon, pasek okna oferty:** „od 3 490 zł netto” łamie się na 2 wiersze obok „+” i „Zapytaj”. Daj „netto” małe pod kwotą albo zmniejsz kwotę do jednej linii (`white-space: nowrap`, kwota ~20 px).
5. **Stopka na telefonie:** linki w rozwiniętych grupach mają 21 px wysokości, „Drugi numer” i e-mail po 20 px. MOBILE-APLIKACJA §5 wymaga 44 px. To wspólny `SiteFooter`, więc poprawka idzie małym PR-em `feat/wsp-*`.
6. **„Do góry ↑” w pasku prawnym** to `<a href="#">`. Zamień na `href="#top"` (kotwica na `body`/skip-target) albo `button` z przewinięciem. Dzisiejszy zapis zmienia adres na `…/#` i to jedyny link `#` na stronie. Wspólny komponent → PR `feat/wsp-*`.
7. **Pasek marki na PC** (PRO-KOM · Biznes · Instalacje · Software · Tech): linki po 19 px wysokości. Na PC to wzorzec innych linii, więc zostaje. Na tablecie dotykowym (834) warto 24 px. Wspólne → razem z #5.
8. Przełącznik **Komputer | Telefon** w oknie oferty: pigułka wypełniona pełnym fioletem jest najcięższym elementem okna, cięższym niż „Zapytaj o tę ofertę”. Lepiej szkło z obrysem akcentu, a pełny fiolet zostawić tylko dla głównego CTA.

## Prompt dla Claude Code

```
/zadanie SWA10 — szlif po audycie 09.11 wieczór (docs/design/prokomsoftware/v24/AUDYT-0911-WIECZOR.md)
Start: git status, git fetch. Folder prokom-web-software (PORT=3003, baza prokom_web_swa). Gałęzie od origin/develop.
Najpierw zapytaj o #1 (hero 1440×900 i 1366×768 — opcja a/b) i #2 (data-spot w makietach paneli) — jedno pytanie z opcjami, potem kod.
PR 1 feat/swa10-szlif (Software): #1 wg decyzji (e2e software-hero: na 1440×900 i 1366×768 dolna krawędź okna ≤ wysokość ekranu), #2 data-spot w makietach systemów/aplikacji/automatyzacji + słowa w spots.ts (test: pokrycie ≥ 2 punkty na ofertę albo lista wyjątków w PR), #3 em w H2 z listy (teksty z panelu/seedu; dopisek „Przed stagingiem” dla pól SoftwareSettings), #4 pasek okna oferty na telefonie w jednej linii, #8 przełącznik urządzenia jako szkło z obrysem.
PR 2 feat/wsp-stopka-dotyk (wspólne): #5 cele 44 px w stopce na telefonie, #6 „Do góry” bez href="#", #7 pasek marki 24 px na dotyku. Bez zmiany wyglądu na PC w innych liniach (zrzuty Biznes/Instalacje przed/po).
DoD: lint/typecheck/test, e2e zmienionych obszarów, scripts/software-porownaj.mjs 1440/390 × ciemny/jasny, MOBILE-APLIKACJA §5, /przeglad (diff > 100 linii), /pr.
```
