# prokomsoftware.pl — przekazanie v23 do budowy (01.11.2026)

**Dla kogo:** Claude Code w repo `prokom-web`. **Stan repo:** SW0–SW12 scalone (wszystko wg v22). **Krystian 01.11.2026 zaakceptował wizualizację v23** (wersja finalna) i dał zgodę na przekazanie. Co się zmienia — `ZMIANY-v23.md` (ten folder). Ten plik mówi, **jak i w jakiej kolejności** to wprowadzić w działający kod.

## 0. Zasady pierwszeństwa
1. `ZMIANY-v23.md` wygrywa z ZMIANY-v21/v22, spec. i ADR tam, gdzie się różnią. Plansze w `boards/` i zrzuty w `screens/` + `stany/` to już v23 (stare v22 zastąpione).
2. Telefon: `MOBILE-APLIKACJA.md` (dopisane §3a „Hero i pierwsza sekcja v23” i §4 pkt 10 „Ruch v23”) — jego §5 to dalej Definition of Done każdej sesji z UI.
3. Kolory: ADR-015 „Rozstrzygnięcia v23” — **zastępują** punkty v20/v22 o gradientach, poświatach i kolorach obszarów.
4. Materiały v23 leżą w `docs/design/prokomsoftware/v23/` (CSS warstwy kolorów i ruchu z wizualizacji jako wzorzec, mapa z danymi OSM i skrypt, zdjęcia). Sesja, która je wykorzystuje, przenosi je na właściwe miejsce (`public/…`, Media, `scripts/`) i **nie zostawia kopii w `docs/`** poza plikiem README folderu.
5. Wartości kolorów tylko w `src/styles/tokens.css` (ADR-007). Warstwa `v23/zz_v23.css` to opis efektu, **nie** do wklejenia — przenosisz zasady na tokeny i komponenty.

## 1. Kolejność sesji
SWV1 → SWV2 → SWV3 → SWV4 → SWV5 → staging Software (listy „Przed stagingiem” SW10–SW12 + SWV)

| # | Sesja | Co | Dlaczego tu |
|---|---|---|---|
| 1 | **SWV1** | **Kolory v23** — tokeny i komponenty: płaski akcent, grafit, bez gradientów i poświat, ikony jednym kolorem, miniatury na papierze, pasek przewijania | fundament wyglądu, reszta sesji porównuje zrzuty już z nowymi kolorami |
| 2 | **SWV2** | **Dane i treści** — telefony, e-mail, godziny, NIP; Zakopane usunięte; Realizacje usunięte; O firmie i Jedna firma; nowe nagłówki i teksty | głównie seed + panel + kilka komponentów; bez nowego UI |
| 3 | **SWV3** | **Telefon: hero i pierwsza sekcja** — nowy układ hero ≤ 640 px, karta „panel na żywo”, przyciski, pasek zaufania 3 kolumny, intencje jako lista | najważniejszy ekran telefonu |
| 4 | **SWV4** | **Kontakt: mapa i zdjęcia** — mapa z OSM (SVG generowany skryptem), zdjęcie wejścia, karty danych; portrety w O firmie | zależy od danych z SWV2 |
| 5 | **SWV5** | **Ruch** — płynne przewijanie i szyna, wjazd sekcji, przejścia stron, reakcja na dotyk, FAQ, reduced motion | na końcu, na gotowym wyglądzie |

Każda sesja = osobna gałąź od `origin/develop`, osobny PR. SWV2 może wyjść większa (seed + migracja usunięcia bloku `showcase`) — wtedy podział 2a (dane, Zakopane) / 2b (Realizacje, O firmie, teksty), Krystian akceptuje w planie.

## 2. Mapa zmian → kod (punkt startu; zweryfikuj w sesji)

| Zmiana v23 | Gdzie dziś w kodzie (stan po SW12) | Sesja |
|---|---|---|
| Gradient H1 (`--grad-h1`), `--grad-area-*`, `--glow`, `--glow-2`, `--accent-2` | `src/styles/tokens.css` (sekcja software), komponenty z `text-grad-h1`, `bg-[image:var(--grad-area-…)]` | SWV1 |
| Ikony obszarów, intencji, potrzeb w kreatorze, kafle menu, kategoria w oknie oferty | `home/AreasExplorer`, `SwHero` (intencje), `wizard/*`, `ProjectMenu`/`PhoneLayer` (menu), `offer/*` (`SolutionDialog`) | SWV1 |
| Ciemne bloki (kontakt, stopka, „Czasem powiemy”, bilet wyceny) — grafit zamiast fioletowo-czarnego | tokeny `--surface-dark`, `--footer-bg` (ADR-015 v22 pkt 1), `WhyNotWordpress`, `SwContact`, kreator | SWV1 |
| Miniatury rozwiązań — tło papier zamiast pastelowego koloru kategorii | `public/software/rozwiazania/*.svg` (29 plików) — skrypt podmienia kolory tła wg `ZMIANY-v23` §3 | SWV1 |
| Pasek przewijania w kolorach strony | `src/app/(sites)/globals.css` (Software przez `data-line`) | SWV1 |
| Telefony, e-mail, godziny, NIP | `CompanyData` (globalne) + ustawienia Software (telefon linii), seed `src/seed/software/*`, `SwTopBar`, `SoftwareFooter`, `SwContact`, `SwContactPage` | SWV2 |
| Zakopane | `SwTopBar`, `src/seed/software/{home,contact,about}.ts`, `SwContactPage/config.ts`, `seed/prokomsoftware/{strona-glowna,nawigacja,miejscowosci}.json`, `lib/software/{cities,compare,aboutBlocks}` (+ testy) | SWV2 |
| Realizacje | `home/Showcase.tsx`, `lib/software/showcase.ts`, `homeSections.ts`, `home/rail.ts`, `SwHomeSection`, seed `home`, stopka (link) | SWV2 |
| O firmie / Jedna firma | `about/*`, `SwTeam`, `SwLines`, `src/seed/software/about.ts`, `lib/software/aboutBlocks.ts` | SWV2 (treści) + SWV4 (portrety) |
| Hero na telefonie, intencje | `SwHero` (+ `home/*`), CSS warstwy telefonu | SWV3 |
| Mapa kontaktu | `SwContactPage` (mapa schematyczna na tokenach `--map-*`) | SWV4 |
| Ruch | `globals.css`, `home/rail.ts`, `FaqSection`/`FaqSoftware`, `BottomSheet`, layout (`viewTransition` — sprawdź w `node_modules/next/dist/docs/`) | SWV5 |

## 3. Prompty

### 3.1 Każda sesja SWV (dopisz do promptu 4.1 z planu)
```
/zadanie SWV<n> — <nazwa z planu>
Źródła: docs/design/prokomsoftware/ZMIANY-v23.md (§ tej sesji), PRZEKAZANIE-v23.md §2 (wiersze tej sesji), ADR-015 „Rozstrzygnięcia v23”, MOBILE-APLIKACJA.md (§3a, §4, §5). Wzorzec: screens/<Plansza>-1440-light, -1440-dark, -390-light (v23) i stany/ (v23-* oraz odświeżone 01–99). Materiały: docs/design/prokomsoftware/v23/.
To przeróbka działającego kodu: najpierw wypisz, co zostaje, co zmieniasz, co usuwasz (bez martwego kodu). Kolory tylko z tokenów; żadnych nowych wartości poza src/styles/tokens.css. Migracje up → down → up, jeśli zmienia się schemat. Dane, których seed nie zmieni na stagingu (seed zablokowany), opisz w STAN jako kroki przed wdrożeniem (komenda JSON, jeśli trzeba).
Przed PR: zrzuty Playwright 1440 i 390 (jasny i ciemny) + 360 porównane z screens/ i stany/ v23; MOBILE-APLIKACJA §5; axe; testy Biznesu i Instalacji zielone.
```

### 3.2 Dopiski do poszczególnych sesji
- **SWV1 — kolory:** „Wg ADR-015 Rozstrzygnięcia v23 i ZMIANY-v23 §3. Tokeny: `--accent-2` = `--accent`, `--glow`/`--glow-2` neutralne (cień, bez fioletu), `--stage` neutralny, `--surface-dark` i `--footer-bg` grafit w obu motywach, `--grad-h1` = płaski `--accent-text` (zostaw token, żeby komponenty się nie zmieniały), `--grad-area-*` usunięte albo zastąpione jednym płaskim tłem ikony (`--accent-soft` + ikona `--accent-text`, aktywna: `--accent` + `--accent-ink`) — usuń klasy i propsy kolorów obszarów, które przestają mieć sens. Ciemne bloki (kontakt, CTA, „Czasem powiemy”, bilet wyceny) — płaskie tła z palety, bez poświat i obracających się gradientów. Miniatury: skrypt w `scripts/` podmienia kolory tła w `public/software/rozwiazania/*.svg` wg tabeli ZMIANY-v23 §3 (idempotentny; zapisz go, bo przyda się przy nowych miniaturach). Pasek przewijania (`scrollbar-color`, `::-webkit-scrollbar`) dla linii software. Zaktualizuj `themes.test.ts` (pary kontrastu bez gradientów) i oczekiwane różnice w STAN. Sprawdź: zero `linear-gradient`/`radial-gradient` z fioletem w komponentach Software (wyjątek: makiety ekranów w podglądach — ich kolory to treść makiety).”
- **SWV2 — dane i treści:** „Dane z ZMIANY-v23 §1 do `CompanyData` / ustawień Software i seeda (telefon główny 883 200 151 = przycisk „Zadzwoń” i `tel:+48883200151`; drugi 788 986 074 obok; e-mail kontakt@prokomsoftware.pl; godziny pn–pt 9:00–17:00, sobota i niedziela nieczynne — status godzin w kontakcie liczony z tych danych; NIP 7352511447). Zakopane: usuń z całej linii Software (pasek, hero, kontakt, O firmie, Jedna firma, stopka — karta linii Zakopane, „Jedna firma, pięć adresów”, miejscowości w okolicy) razem z polami i testami, które istnieją tylko dla Zakopanego (`ROK ZAKOPANE`, adres salonu). Realizacje: usuń sekcję `showcase` z kolejności strony głównej, szyny sekcji i seeda; kod `Showcase`/`lib/software/showcase.ts` usuń, jeśli nic innego go nie używa (migracja, jeśli znika wariant bloku; na stagingu instrukcja w STAN). O firmie: bez osi czasu („Najpierw sprzęt i serwis…”), bez sekcji salonów („Dwa salony…”), zespół = Krystian Potaczek i Tadeusz Wójciak (teksty z planszy `ONas`), „Gdzie nas znaleźć” = jedno miejsce. Teksty: hero, nagłówek kontaktu, 8 obszarów, 12 rzeczy, podglądy, proces — dokładnie z ZMIANY-v23 §2 i plansz. Usuń puste obietnice `[WYNIK]`, `[MIESIĄC]` (i pola, które je niosą, jeśli zostają puste). Skan treści (`scripts/content-scan.mjs`) bez nowych zaślepek.”
- **SWV3 — hero na telefonie:** „Wg MOBILE-APLIKACJA §3a i stanów `stany/v23-01…v23-04` (390 i 360, jasny i ciemny). ≤ 640 px: kolejność pigułka → H1 (druga linia w akcencie, nowa linia) → lead → przyciski (główny na całą szerokość, „Zobacz podglądy” i „Zadzwoń” obok siebie) → karta „Twoja Firma · panel” (3 powiadomienia wjeżdżają po kolei, teksty z planszy; dane z `SoftwareSettings.home`, nie na sztywno w komponencie) → pasek zaufania w 3 kolumnach. Składanka modułów desktopu na telefonie ukryta (nie renderowana, nie tylko `display:none`, jeśli to możliwe bez dwóch drzew — wybierz i uzasadnij). Intencje na telefonie jako lista (ikona, tytuł, 2 linie opisu, strzałka), desktop bez zmian. Bez poziomego przewijania przy 360.”
- **SWV4 — mapa i zdjęcia:** „Mapa: `v23/mk_map.py` + `v23/osm_rabka.json` to wzorzec. Napisz skrypt w `scripts/` (Node albo Python — jak reszta repo), który z danych OpenStreetMap (API `api.openstreetmap.org/api/0.6/map?bbox=19.9468,49.6068,19.9600,49.6131`, uruchamiany ręcznie, wynik zapisany w repo) generuje SVG mapy z klasami zamiast kolorów; kolory przez tokeny `--map-*` (dopisz brakujące: budynek, rzeka, tory, ulice główne/boczne, etykieta — w obu motywach). Budynek Orkana 16B podświetlony akcentem + pinezka z pulsem (bez pulsu przy reduced motion). Podpis „© autorzy OpenStreetMap” zawsze widoczny (ODbL). „Wyznacz trasę” → Google Maps (link, dopiero po kliknięciu), „Powiększ mapę” → openstreetmap.org. Bez zewnętrznych skryptów i ramek. Zdjęcia `v23/img/` → Media (Payload) albo `public/software/` (zdecyduj wg tego, jak inne linie trzymają zdjęcia zespołu; portrety edytowalne w panelu), `next/image` z `alt` i `sizes`; zdjęcie wejścia z opisem „Tak wygląda wejście”. Portrety w hero O firmie (dwie karty) i w „Kto z Tobą pracuje”. Zgoda na wizerunek — wpis w STAN „przed produkcją”.”
- **SWV5 — ruch:** „Wg MOBILE-APLIKACJA §4 pkt 10 i ZMIANY-v23 §5. CSS najpierw: `scroll-behavior: smooth` + `scroll-padding-top` pod nagłówek; szyna sekcji — przewijanie z łagodnym hamowaniem (wzorzec funkcji `pkScroll` w planszy `Main`: 520–1100 ms, easeInOutCubic) i krótki wjazd nagłówka sekcji po dojechaniu. Wjazd sekcji przy przewijaniu przez `animation-timeline: view()` (bez bibliotek; przeglądarki bez wsparcia — bez animacji); karty z opóźnieniem tylko ≥ 1081 px (na telefonie karuzele mają własny scroller — nie animuj ich kart). Przejścia między stronami: sprawdź w `node_modules/next/dist/docs/` aktualne wsparcie View Transitions w tej wersji Next (eksperymentalne `viewTransition` albo CSS `@view-transition { navigation: auto }`); jeśli wymaga flagi eksperymentalnej — zaproponuj w PR i zapytaj Krystiana. Reakcja na dotyk (`:active` scale), hover tylko `@media (hover:hover)`, FAQ rozwija się miękko. `prefers-reduced-motion`: wszystko bez animacji — test e2e z `reducedMotion: 'reduce'`. Tylko `transform`/`opacity`; CLS < 0,1.”

## 4. Przed stagingiem i produkcją (dopisać do STAN w każdej sesji)
- Panel na stagingu (seed zablokowany): dane firmy i Software (telefony, e-mail, godziny, NIP), usunięcie bloku „Realizacje” ze strony głównej, nowe teksty `home`, O firmie i Jedna firma, portrety i zdjęcie wejścia w Media.
- Przed produkcją: pisemna zgoda na wizerunek Krystiana i Tadeusza Wójciaka; skrzynka kontakt@prokomsoftware.pl działa i odbiera powiadomienia z formularzy (ADR-003); polityka prywatności z nowym e-mailem.
