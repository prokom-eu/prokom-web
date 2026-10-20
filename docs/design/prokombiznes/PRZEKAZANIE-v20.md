# Łatka v20 — jak wgrać i gotowe polecenia dla Claude Code (20.10.2026)

## Kolejność (nie przerywamy B4)
1. **B4 kończysz normalnie:** `/przeglad` → `/pr` → merge → `.\scripts\start.ps1`.
2. **Wgrywasz łatkę na nowej gałęzi** (patrz niżej) i robisz sesję **D1**, czyli same dokumenty, bez kodu.
3. **B3c**: mała poprawka nagłówka (menu bez Branż, lupa, górny pasek bez „Pomoc zdalna”).
4. Dalej według planu: **B5 → B6 → B7** (strona główna według v20) **→ B8** (formularz według v20) → …

Dlaczego nie teraz w B4: B4 to lista zapytania i wyszukiwarka. Łatka nie zmienia niczego w B4 (nakładka wyszukiwarki jest ta sama, zmienia się tylko przycisk, który ją otwiera, i to robi B3c). Mieszanie dokumentów z kodem w jednym PR utrudnia przegląd.

## Wgranie plików (po merge B4)
```powershell
.\scripts\start.ps1
git switch -c docs/prokombiznes-v20
# usuń stare zrzuty (zmieniła się liczba kawałków)
Remove-Item -Recurse -Force docs\design\prokombiznes\screens
# skopiuj z łatki z zachowaniem ścieżek: boards\*.dc.html, boards\index.html, boards\support.js, screens\, css\, ZMIANY-v20.md, PRZEKAZANIE-v20.md
# boards\media\ jest bez zmian — zostaw w repo
claude
```

## D1 — dokumenty (wklej w trybie planowania)
```
/zadanie D1 — wizualizacja prokombiznes v20 (tylko dokumentacja, bez kodu)
Pliki łatki są już skopiowane do docs/design/prokombiznes/ (boards, screens, css, ZMIANY-v20.md, PRZEKAZANIE-v20.md) — sprawdź git status i potwierdź, że boards/media/ jest nietknięte.
Przeczytaj docs/design/prokombiznes/ZMIANY-v20.md (całość) i wykonaj jego §4:
1. docs/strony/prokombiznes.md — §3.1, §3.2, §4 (zastąp kolejność i opisy sekcji tabelą i opisami z ZMIANY §2), §8.4 (formularz kontaktowy jednoekranowy, bez tematów), §1 (e-mail Biznesu biznes@pro-kom.eu z SiteSettings), §11 dopisek „v20 (20.10.2026)”. Zachowaj zmiany z B0 (beauty, vending, uwagi szefa).
2. ADR-013 — rozstrzygnięcie: H1 bez gradientu (jednolity --acc, ciemny #8FB0F4), bez poświat w hero.
3. ADR-012 — CatalogGroups.showcase, Industries.homeOrder/homeVisible (9 widocznych na głównej), featured = 8.
4. seed/prokombiznes/katalog.json — tylko kolejnosc_wyroznionych i flagi wyrozniony_na_glownej (ergo, k10, pol, d3, hx, tp, euro, nas). Nie nadpisuj reszty pliku.
5. docs/zadania/prokombiznes.md — dodaj B3c (poprawka nagłówka wg ZMIANY §1.1–1.2) przed B5; w B7 i B8 odwołanie do ZMIANY-v20.md; w B7 usuń „szybkie sprawy” i „pasek Ostatnio u nas”.
6. docs/STAN.md — „Następne”: B3c → B5.
Gałąź docs/prokombiznes-v20. Pokaż diff (--stat i zmiany w spec.) przed commitem.
```

## B3c — poprawka nagłówka (nowa sesja, po D1)
```
/zadanie B3c — nagłówek prokombiznes wg docs/design/prokombiznes/ZMIANY-v20.md §1.1–1.2
Wzorzec: screens/Main-1440-light/01.jpg, Main-1440-dark/01.jpg, Mobile-390-light/01.jpg; boards/Main.dc.html (nagłówek „nx…”).
Zakres: menu = Oferta ▾ · Opieka IT · GoPOS · InsERT · O firmie · Kontakt (usuń Branże ▾ i jego listę, także z menu na telefonie); na dole mega menu link „Rozwiązania dla branż: gastronomia, handel, hotele →” do /branze/gastronomia; wyszukiwarka jako ikona 44×44 (aria-label „Szukaj w ofercie (skrót /)”), ta sama nakładka i skrót „/”; nowrap pozycji, gap 26 px; górny pasek bez „Pomoc zdalna”.
Gotowe: test Playwright — brak poziomego przewijania przy 1100, 1280, 1440 px; menu z klawiatury; axe bez naruszeń; zrzuty porównane ze screens/.
```

## B7 — strona główna (podmień prompt z planu)
```
/zadanie B7 — strona główna prokombiznes wg wizualizacji v20 (plan §3, B7; spec §4 po D1; docs/design/prokombiznes/ZMIANY-v20.md §2 — ma pierwszeństwo)
Wzorzec: screens/Main-1440-light/01–09.jpg, Main-1440-dark/*, Mobile-390-light/*, Mobile-390-dark/*; treści: boards/Main.dc.html (teksty przenoś bez zmian).
Sekcje w kolejności z ZMIANY §2 (13 sekcji): hero (H1 bez gradientu, bez poświat), 4 kafelki, marki, OFERTA (5 kart działów z witryną i 3 kategoriami, 3 karty flagowe GoPOS/InsERT/Opieka IT jednym komponentem), NAJCZĘŚCIEJ WYBIERANE (8 × 4 w rzędzie, telefon: pasek przewijany, 2 karty CTA), plan firmy — WERSJA STATYCZNA + branże 9 + „Pokaż wszystkie” + dofinansowania, jak pracujemy, pięć firm czy jedna (wersja krótsza, bez paska 6→1), dla kogo (opinie i logo za flagami), fakty (karta właściciela + granatowa karta faktów z danymi z CompanyData/SiteSettings/Partners), ostatnio w Aktualnościach (3 karty Posts), FAQ (karty z numerami, pierwsza otwarta, FAQPage), formularz kontaktowy — tylko układ i statyczne pola (logika w B8).
Bez sekcji „Masz konkretną sprawę?” i bez pomocy zdalnej. Bloki Biznesu w src/sites/biznes/blocks/, małe wyspy klienta (koło, marquee, licznik KSeF, rozwijanie branż, przełącznik „pięć firm”), reszta serwer. prefers-reduced-motion wyłącza animacje. Przycisk główny-link zawsze z białym tekstem (ZMIANY §1.4).
Gotowe: zgodne ze zrzutami (1440/390, jasny/ciemny); Lighthouse telefon — podaj wynik (cel ≥ 90); axe bez naruszeń.
```

## B8 — formularze (podmień prompt z planu)
```
/zadanie B8 — /zapytanie, /kontakt i formularze Biznesu (plan §3, B8; spec §6.3, §6.9, §8.4 po D1; ZMIANY-v20 §2.9 dla formularza kontaktowego)
Formularz kontaktowy (strona główna #kontakt i /kontakt — ten sam komponent): jeden ekran, pola Imię*, Telefon*, Firma, E-mail, „W czym możemy pomóc?”*, zgoda RODO; bez tematów i bez kroków; ekran sukcesu z planszy; typ „kontakt”; e-mail kontaktowy z SiteSettings (biznes@pro-kom.eu).
/zapytanie (lista) jak w spec §6.3. „Zapytaj o X” z wyszukiwarki uzupełnia wiadomość formularza.
Reszta jak w poprzednim prompcie B8 (mail z pełną listą, potwierdzenie do klienta, Playwright: sukces + błędy walidacji, także 390 px, Mailpit).
```
