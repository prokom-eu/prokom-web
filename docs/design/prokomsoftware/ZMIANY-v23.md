# prokomsoftware.pl — zmiany v23 (wersja finalna wizualizacji, 01.11.2026)

Decyzje Krystiana z 01.11.2026 po przeglądzie wersji lokalnej. Wizualizacja: artefakt „prokomsoftware.pl · projekt”, wersja 39 (plansze w `boards/`, zrzuty w `screens/` i `stany/` — już v23). Przy różnicy z v22 obowiązuje v23. Jak i kiedy to wprowadzić: `PRZEKAZANIE-v23.md`.

## 1. Dane firmy (wszędzie, jedno źródło w panelu)
- Telefon główny: **883 200 151** (przycisk „Zadzwoń”), drugi: **788 986 074**.
- E-mail: **kontakt@prokomsoftware.pl**.
- Adres: **ul. Orkana 16B, 34-700 Rabka-Zdrój**. Godziny: **pn–pt 9:00–17:00**, sobota i niedziela nieczynne.
- NIP: **7352511447** (suma kontrolna poprawna).
- **Zakopane usunięte z całej strony Software**: pasek linii, hero, kontakt, O firmie, Jedna firma, stopka (karta linii Zakopane), miejscowości w okolicy. Software działa tylko w Rabce.

## 2. Treści
- Hero: „Strony i programy dla firm. **Zobaczysz, zanim zapłacisz.**” Lead: podgląd do klikania w 5–7 dni, cena i termin na piśmie.
- Kontakt (główna): nagłówek „Napisz, czego potrzebujesz. Odpowiemy w 1 dzień roboczy.”
- **Sekcja Realizacje usunięta** ze strony głównej (także z szyny sekcji, stopki i liczb z `[WYNIK]`). Wróci, gdy wystartują Biznes, Gaming i Instalacje.
- O firmie: bez zdjęć „do zrobienia”, bez „Najpierw sprzęt i serwis…” (oś czasu) i „Dwa salony…”. „Kto z Tobą pracuje”: tylko Krystian Potaczek i Tadeusz Wójciak, z prawdziwymi portretami. Hero O firmie: dwa portrety + plakietka prokomserwis.pl.
- Usunięte puste obietnice: `[WYNIK]`, `[MIESIĄC]` (nie wiemy, nie piszemy).
- Teksty nagłówków poprawione na konkretne (8 obszarów, 12 rzeczy, podglądy, proces).

## 3. Kolory (bez „kolorów z generatora AI”)
- Fiolet Software zostaje jako **jeden płaski akcent** (księga znaku). Baza: grafit i papier PRO-KOM.
- Znika: tekst w gradiencie (fiolet–róż–błękit), poświaty i świecące pierścienie w hero, wielokolorowe ikony (intencje, 8 obszarów, kreator, menu, okno oferty), fioletowe mgły w tłach sekcji, fioletowe ciemne bloki (teraz grafit `#151A16`), pastelowe tła miniatur (teraz papier).
- Ikony: tło `--accentSoft`, ikona `--accentText`; aktywna: pełny akcent.
- Pasek przewijania w kolorach strony (cienki, akcent przy najechaniu).
- Miniatury (`public/software/rozwiazania/*.svg`): tła — pierwsze stopnie gradientu `#EFE9FC #E6EEFC #E4F3F1 #FCF1E2 #E7F4E2` → `#F2F3EF`, drugie `#DCCEFA #CCDCF8 #C9E7E2 #F5DDBA #CDE8C3` → `#E3E6DE`, duże koło dekoracyjne `#A98BF0 #7EA6E6 #5DB7AC #E6A65A #77BE66` → `#B9B0D6` (wzorzec: `v23/v23_thumbs.py`). Treść miniatur (makiety) bez zmian.
- W kodzie: tokeny `--accent2 = --accent`, `--glow` neutralny cień, `--stage` neutralny, `--dark` grafit; wzorzec efektu: `v23/zz_v23.css` (nie do wklejenia — zasady przenieść na tokeny i komponenty). Decyzja: ADR-015 „Rozstrzygnięcia v23”.

## 4. Telefon: nowe hero i pierwsza sekcja (≤ 640 px)
- Kolejność: pigułka „Rabka-Zdrój · zdalnie w całej Polsce” → H1 (druga linia w akcencie) → lead → **przyciski: „Dobierz rozwiązanie · 60 s” na całą szerokość, pod nim „Zobacz podglądy” i „Zadzwoń” obok siebie** → karta „Twoja Firma · panel” (3 powiadomienia wjeżdżają po kolei, „Podgląd do klikania w 5–7 dni”) → pasek zaufania w 3 kolumnach.
- Składanka modułów z desktopu na telefonie ukryta.
- Pierwsza sekcja (intencje): lista jak w aplikacji (ikona, tytuł, 2 linie opisu, strzałka) zamiast 4 wysokich kafli.

## 5. Ruch (wspólny system, tylko transform i opacity)
- Płynne przewijanie do kotwic (`scroll-behavior: smooth`, odstęp pod nagłówek 90 px). Szyna sekcji: własne przewijanie z łagodnym hamowaniem (520–1100 ms), po dojechaniu nagłówek sekcji delikatnie „wjeżdża”.
- Nagłówki sekcji, pytania FAQ i mapa wjeżdżają przy przewijaniu (scroll-driven; w przeglądarkach bez wsparcia bez animacji). Karty (≥ 1081 px) wjeżdżają z małym opóźnieniem kolejnych.
- Przejścia między podstronami: View Transitions (przenikanie 0,2–0,3 s), nagłówek i dolny pasek stoją.
- Reakcja na dotyk: `scale(.97)` przycisków, `scale(.985)` kart, bez hover na dotyku, bez szarego prostokąta przy tapnięciu.
- FAQ: odpowiedź rozwija się miękko. `prefers-reduced-motion` = bez animacji.

## 6. Kontakt: mapa i dojazd
- Własna mapa z danych **OpenStreetMap** (bez Google w ramce, bez ciasteczek): ulice, budynki, tory, rzeka; budynek Orkana 16B podświetlony akcentem, pinezka z pulsowaniem; podpisy ul. Orkana, Zakopiańska, Piłsudskiego, dworzec przy pl. św. Mikołaja. Punkt: 49.60994, 19.95339 (OSM, węzeł adresu 16B). Wzorzec: `v23/mk_map.py`, `v23/osm_rabka.json`, `v23/map.svg`, `v23/map.css`. Podpis „© autorzy OpenStreetMap” (wymóg licencji ODbL).
- Przyciski „Wyznacz trasę” (Google Maps, dopiero po kliknięciu) i „Powiększ mapę” (openstreetmap.org).
- Obok: zdjęcie wejścia („Tak wygląda wejście”), godziny, telefony, e-mail, dane firmy. Lead: „Sto metrów od dworca autobusowego i kolejowego…”.
- W kodzie: mapę wygenerować raz z OSM (SVG w repo, kolory z tokenów), nie z zewnętrznego serwisu przy każdym wejściu.

## 7. Zdjęcia
- Portrety: Krystian (`v23/img/krystian.jpg`), Tadeusz Wójciak (`v23/img/tadeusz.jpg`, zdjęcie w garniturze), wejście (`v23/img/wejscie.jpg`). Przed publikacją: pisemna zgoda na wizerunek obu osób.
- Zdjęcie wnętrza z szyldem ALSEN nieużyte (myli markę).

## 8. Sprawdzone
- 16 plansz przy 360 i 390 px, jasny i ciemny: 0 poziomego przewijania, 0 błędów JS; drobne: mały tekst tylko w makietach i znaku.
