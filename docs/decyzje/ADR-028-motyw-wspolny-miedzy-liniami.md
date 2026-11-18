# ADR-028: Motyw wspólny dla linii — przycisk z napisem, Auto „w nocy ciemny”, wybór niesiony między domenami

- Status: **przyjęta** (18.11.2026, sesja WSP-M; proponowana z czatu tego samego dnia)
- Data: 18.11.2026
- Decyduje: Krystian (zmiana D-K4-5 dla Biznesu — informacyjnie do szefa, to jego pomysł)
- Powiązane: ADR-013 (ciemny motyw linii), ADR-015 v24 (Software ciemny), ADR-017 K4 (D-K4-5: Biznes jasny), ADR-H001 pkt 4 (hub ciemny), ADR-022 (elementy wspólne), ADR-023 (JS per linia). Spec: `docs/design/wspolne/MOTYW-PASEK-LINII.md`.

## Kontekst
Szef (18.11) chce: (1) przycisk „Jasny motyw / Ciemny motyw” zamiast ikony, z animacją premium, na wszystkich liniach; (2) przycisk motywu w szynie po lewej na każdej stronie; (3) strony same w ciemnym motywie, gdy jest noc; (4) wybór motywu na jednej linii obowiązujący na pozostałych.

Dziś: `ThemeToggle` (ikona) w 4 nagłówkach prokom-web, `useThemeChoice` z Auto w `MenuSheet`, klucz `localStorage['pk-theme']`, skrypt w `<head>` (`lib/brand/theme.ts`). Koło przy zmianie mają tylko Software i Instalacje (`lib/motion/themeReveal.ts`). Tech ma ten sam klucz i własne koło. Gaming ma tylko ciemny projekt.

## Decyzja
1. **Przycisk z napisem akcji** we wspólnym `ThemeToggle` (jedna zmiana = 4 linie prokom-web), pełna/skrócona etykieta zależnie od szerokości, obie etykiety w HTML, wybór przez CSS z `data-theme` (bez mignięcia).
2. **Koło przy zmianie dla wszystkich linii** z ciemnym projektem (`LINES_WITH_REVEAL` → wszystkie z `DARK_THEME_LINES`).
3. **Auto = brak zapisanego wyboru**, z nową regułą: ciemny domyślny linii → ciemny; system ciemny → ciemny; **noc w Rabce (wschód/zachód, czas warszawski) → ciemny**; inaczej jasny. Skrypt zawsze ustawia `data-theme`. Zmienia to D-K4-5 (Biznes bez wyboru był zawsze jasny): w dzień nadal jasny, w nocy ciemny.
4. **Noc liczona lokalnie z tablicy 24 wartości** (wygenerowanej z funkcji NOAA w TS, testowanej) — bez geolokalizacji, bez zewnętrznych API, bez wysyłania czegokolwiek.
5. **Wybór niesiony między naszymi domenami parametrem `?motyw=`** dopisywanym do linku tylko w chwili kliknięcia (globalny nasłuch), odbieranym w skrypcie `<head>` i usuwanym z adresu po hydratacji natywnym `history.replaceState`.
6. **Gaming bez jasnego motywu** — tylko usuwa parametr (rekomendacja; decyzja §7 planu rundy).
7. **Szyna:** pozycja motywu we wspólnym `SiteRail`; hub montuje szynę na wszystkich stronach.

## Rozważone alternatywy
- **Ciasteczko na wspólnej domenie** — nasze strony to różne domeny (nie subdomeny), ciasteczka między nimi to ciasteczka stron trzecich, blokowane przez przeglądarki. Odrzucone.
- **Ukryta ramka (iframe) z jedną domeną „pamięci motywu”** — partycjonowanie pamięci w przeglądarkach (Safari, Chrome) to blokuje, a do tego wymagałoby nowej usługi i polityki prywatności. Odrzucone.
- **Godzina na sztywno (np. 19–7)** — w czerwcu o 19:00 jest jasno, w grudniu o 16:00 ciemno; szef mówi „gdy jest ciemno”. Odrzucone na rzecz wschodu/zachodu.
- **Geolokalizacja przeglądarki** — pytanie o zgodę dla motywu to zła wymiana i problem RODO. Odrzucone.
- **Automatyczne przełączanie w trakcie czytania o zachodzie** — zaskakuje; sprawdzamy tylko przy powrocie na kartę.

## Konsekwencje
- (+) Spełnia wszystkie 4 pomysły szefa bez nowych usług, bez ciasteczek, bez zmian w polityce prywatności (wybór motywu w `localStorage` i parametr w adresie to nie dane osobowe).
- (+) Jedna zmiana w komponentach wspólnych = Biznes, Instalacje, Software, hub naraz.
- (−) Skrypt w `<head>` rośnie o ~0,6 kB (tablica + logika) — mieści się w budżecie; test pilnuje rozmiaru (< 1,5 kB).
- (−) Synchronizacja tylko przy przejściu naszym linkiem (świadomie, §3.4 spec).
- (−) Tech i Gaming wdrażają ten sam kontrakt we własnych repo (osobne sesje).
- Ryzyko: `history.replaceState` przed hydratacją mogłoby rozjechać router Next — dlatego czyszczenie dopiero po hydratacji; sesja sprawdza zachowanie w dokumentacji zainstalowanej wersji Next.

## Rozstrzygnięcia przy wdrożeniu (WSP-M, 18.11.2026)
- **`replaceState(null, …)`, nie `window.history.state`** (zmiana spec §3.3): dokumentacja zainstalowanego Next 16.4 („Linking and Navigating” → Native History API) potwierdza, że natywne `pushState`/`replaceState` są zsynchronizowane z routerem — ale kod routera (`app-router.js`) pomija synchronizację, gdy w stanie jest jego własny znacznik (`__NA`), który niesie `window.history.state`. Dlatego `null`, jak w przykładach dokumentacji; Next sam dopisuje swoje dane. Wołane zadanie później (`setTimeout 0`): efekt wyspy działa przed efektem routera, który dopiero wtedy zakłada łatkę na `replaceState` — wcześniejsze wywołanie zgubiłoby stan routera i „Wstecz” (przegląd PR 1).
- **Noc w czasie zimowym UTC+1 przez cały rok:** tablica i skrypt liczą minuty doby w stałym przesunięciu +1 h (noc jest astronomiczna), więc zmiana czasu nie przesuwa granic i skrypt nie potrzebuje `Intl`. Dokładność tablicy z interpolacją ±10 min (test na każdym dniu roku), `sunTimes` w teście ±3 min od sunrise-sunset.org.
- **Opis linii w dymku paska = istniejące pole `CompanyData.lines[].description`** (spec §4 pkt 3: „jeśli brak pola opisu”) — bez nowego pola `tagline` i bez migracji.
- **Biznes bez JavaScriptu zostaje jasny** (jego tokeny nie mają bloku `prefers-color-scheme`); Instalacje bez JavaScriptu jak dziś za systemem.
- **Kapsuła bez miejsca → sama ikona** (zmiana spec §1, CI PR 1): pigułka z napisem (149 px zamiast 44 px) nie mieści się w ciasnej kapsule (najdłuższe menu Instalacji przy 1081 px) ani w pełnej kapsule Software z „Twój projekt” przy 1440 px. Dlatego 1081–1359 px: ikona (CSS, bez skoku przy wczytaniu; napis zostaje nazwą dostępną), od 1360 px napis, a gdy rząd kapsuły i tak się przepełnia (np. po pojawieniu się „Twój projekt”), `ThemeToggle` sam przechodzi na ikonę (`ResizeObserver`, liczenie wolnego miejsca rzędu). W szynie i arkuszu menu napis zawsze.
- **Budżet JS Software +2 000 B** (`software-wydajnosc`, `docs/jakosc.md`): CI po PR 1 zmierzyło 285 598 B przy progu 285 200 B; motyw wspólny (PR 1–3) to ~1,9 kB gz, w granicy „~2 kB” z kontraktu.
- `theme-color` po zmianie motywu: wspólna wyspa `ThemeCarry` dla linii z kolorem paska (Biznes, Instalacje, Software); hub nie ma `theme-color` — bez zmian.
