# prokomsoftware.pl — v24 „Aurora” (wersja finalna 06.11.2026)

Krystian zaakceptował wizualizację **v24 Aurora** 06.11.2026 (płótno Claude: https://claude.ai/artifact/AJQ3raZVxHTSQNiFho6EUY). Ten folder to wzorzec wyglądu i treści do przebudowy działającego kodu Software (stan po SW0–SW12 i SWV1–SWV9, v23).

## Co tu jest

| Ścieżka | Co | Jak używać |
|---|---|---|
| `ZMIANY-v24.md` | **Specyfikacja zmian** v23 → v24: zasady, kolory, ruch, powłoka, każda strona i sekcja, makiety, dane, telefon, dostępność, wydajność | źródło prawdy dla wyglądu i zachowania v24 |
| `../PRZEKAZANIE-v24.md` | **Plan budowy** (sesje SWA1–SWA6), mapa zmian → kod, prompty, listy „przed stagingiem” | kolejność pracy w Claude Code |
| `TRESCI-v24.md` | Teksty wszystkich stron z plansz (sekcja po sekcji) | do seedów i panelu; ceny i terminy zawsze z `Solutions` |
| `boards/` | **Plansze interaktywne** — 32 pliki: strona główna (PC 1440, laptop 1280, tablet 834, telefon 390; ciemny + jasny) i 13 podstron (PC + telefon, ciemny) | `cd boards && python3 -m http.server 8765` → `http://localhost:8765/` (lista). Linki między stronami działają, motyw przełącza ikona w nagłówku |
| `screens/` | Zrzuty całych stron (JPG): `<Strona>-<szerokość>-<motyw>.jpg` | porównanie po sesji (Playwright) |
| `wzorzec/aurora.css` | Pełny arkusz wizualizacji (tokeny `.au.dark` / `.au.light`, wszystkie komponenty, breakpointy 1360 / 1200 / 1080 / 960 / 600) | **opis efektu, nie do wklejenia** — wartości przenosisz na tokeny (`src/styles/tokens.css`), reguły na komponenty |
| `wzorzec/aurora.js` | Logika plansz: dane ofert, branż, slajdów hero, kreatora v3, FAQ, wyszukiwarki, przewijania | wzorzec zachowań i danych startowych do seedów; w kodzie dane idą z Payload |
| `wzorzec/sekcje/*.html` | Źródła sekcji plansz (markup jednej sekcji / strony) | szybkie odnalezienie struktury sekcji |

Plansze (`boards/*.dc.html`) korzystają z `boards/support.js` (silnik plansz, ten sam co w v20–v23) i z `Vis.dc.html` (makiety).

## Pierwszeństwo dokumentów (od 06.11.2026)
1. `ZMIANY-v24.md` + plansze `v24/boards` + zrzuty `v24/screens` — **wygrywają** z v20–v23 (`ZMIANY-v2x`, `boards/`, `screens/`, `stany/` w folderze nadrzędnym) wszędzie, gdzie się różnią.
2. ADR-015 „Rozstrzygnięcia v24” (wygląd) i ADR-014 „Rozstrzygnięcia v24” (dane) — zastępują sprzeczne punkty wcześniejszych rozstrzygnięć (w tym zakaz gradientów i poświat z v23).
3. Spec `docs/strony/prokomsoftware.md` — dalej obowiązuje tam, gdzie v24 nic nie zmienia (zasady formularzy §7, SEO §9, „Twój projekt” §8.1, analityka §8.4, [SZEF] §13).
4. `MOBILE-APLIKACJA.md` — §4 (odczucie aplikacji) i §5 (Definition of Done telefonu) obowiązują dalej; ekrany telefonu = plansze `*-390-*` v24.
5. Elementy wspólne linii (ADR-022, `docs/design/wspolne/`) — powłoka (kapsuła, pasek marki, szyna, wyszukiwarka, stopka, Kontakt, O firmie) **pochodzi z komponentów wspólnych D2**; v24 opisuje tylko, jak Software je motywuje i co wkłada w sloty linii.

Stare materiały v20–v23 zostają w repo jako historia (tak jak dotąd) — nie kasujemy ich w tej paczce.

## Porównanie z kodem (SWA1b)
`node scripts/software-porownaj.mjs [Glowna Oferta …]` — zrzuty strony z kodu (1440, 1280, 834, 390; ciemny i jasny; ruch ograniczony) obok zrzutów z `screens/` w `tmp/zrzuty-v24/index.html`. Zawężenie: `SW_WIDTHS=1440,390 SW_THEMES=dark`. Podgląd fundamentu (prymitywy i wszystkie makiety): `/_software` (nazwa `Podglad`, bez wzorca — porównuj z `boards/Vis.dc.html`).
