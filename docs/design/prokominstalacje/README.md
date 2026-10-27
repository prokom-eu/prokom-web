# Wzorzec wyglądu prokominstalacje.pl (wizualizacja v4.0, 27.10.2026)

Wszystko, czego Claude Code potrzebuje, żeby zbudować stronę 1:1 z wizualizacją. Canvas i prototyp z czatu są tu w całości — Claude Code nie musi (i nie może) zaglądać do czatu.

## Co tu jest i do czego służy
| Ścieżka | Co to jest | Kiedy używać |
|---|---|---|
| `prototyp/*.html` | **klikalny prototyp 31 stron** (desktop i telefon, oba motywy, wszystkie interakcje), działa po otwarciu pliku w przeglądarce | zawsze: to jest cel; przed i po każdej sekcji |
| `MAPA-STRON.md` | lista 31 stron: adres publiczny, plik prototypu, sekcje z `id` w kolejności, wysokości | planowanie sesji, kontrola kompletności |
| `KOMPONENTY.md` | mapa części prototypu → komponenty React, stany widżetów | planowanie każdej sesji z UI |
| `MOBILE-APLIKACJA.md` | telefon jak aplikacja: szkielet, nagłówek, dolny pasek, arkusz, przejścia, odbiór | każda sesja z UI (Definition of Done) |
| `stany-telefonu/*.webp` | 10 stanów telefonu × jasny/ciemny (arkusz, chowany nagłówek, aktywna karta…) | I3, I14 i przy każdej zmianie powłoki |
| `tokens.css` | kolory, motywy, kolory usług, sceny | I1 i wszędzie (kolory tylko przez zmienne) |
| `pk.css` | pełny arkusz prototypu (źródło reguł do przeniesienia) | przy przenoszeniu każdej sekcji — szukaj jej klas |
| `zrodlo/` | źródło prototypu: `pages/<Nazwa>.body.html` (szablon), `<Nazwa>.js` (stan, logika, treści), `.meta.json` (tytuł, opis, wysokości), `inc/` (sekcje wspólne), `header.html`, `footer.html`, `common.js` (powłoka, ikony, usługi, obiekty, menu), `fold.json` (sekcje zwijane na telefonie), `generator-obiektow/` (dane i sceny 12 stron „Dla kogo”) | logika widżetów, dokładne klasy i struktura |
| `narzedzia/zrzuty-wzorca.mjs` | zrzuty prototypu (1440/390, jasny/ciemny) do `tmp/wzorzec/` | przed sesją |
| `narzedzia/porownaj.mjs` | wzorzec obok kodu, sekcja po sekcji, do `tmp/porownanie/` | po każdej sekcji, przed PR |

Treści do bazy: `seed/prokominstalacje/` (opis w `seed/prokominstalacje/README.md`). Zdjęcia ładowarek: `public/instalacje/ev/`.

## Kolejność ważności
`docs/stan/STAN-instalacje.md` → `docs/strony/prokominstalacje.md` (+ `-SEO.md`) → ADR-I001…I004 → ten folder (MOBILE, KOMPONENTY, MAPA) → prototyp → `zrodlo/`.
Prototyp pokazuje wygląd i zachowanie. Gdy treść w prototypie jest sprzeczna ze specyfikacją §2 (decyzje biznesowe) — wygrywa specyfikacja i trzeba to zgłosić w PR.

## Jak otworzyć prototyp
Prototyp ładuje fonty Archivo i Manrope z Google Fonts — otwieraj go i rób zrzuty wzorca **z dostępem do internetu** (offline wyjdą fonty zastępcze i porównanie będzie mylące). Narzędzia wymagają przeglądarki Playwright: `pnpm exec playwright install chromium`.

Dwuklik na `prototyp/start.html` (albo `npx serve docs/design/prokominstalacje/prototyp`). Motyw: przełącznik w nagłówku. Telefon: narzędzia deweloperskie przeglądarki, szerokość 390 px, odśwież. Linki między stronami działają (pliki `.html`, nie adresy publiczne — adresy publiczne w `MAPA-STRON.md`).

## Czego nie przenosić
- Silnika szablonów prototypu (`{{…}}`, `sc-for`, `sc-if`, `pkrt.js`, `morphdom`) — w repo jest React.
- Przełącznika `ceny` z prototypu jako parametru adresu — w repo to `InstalacjeSettings.pokazCeny`.
- List źródeł (w źródle prototypu: `src: [[tytuł, link], …]` w `zrodlo/pages/*.js`) — na stronie nie ma list źródeł. W seedzie są już usunięte.
- Plików `.dc.html` (format canvasu z czatu) — nie są potrzebne, prototyp zawiera to samo.
