# ADR-007: Wygląd — tokeny marki, kolor linii przez atrybut, fonty u nas

- **Status:** przyjęta
- **Data:** 2026-10-14

## Kontekst
Wszystkie strony mają wyglądać jak jedna firma (wspólny pasek marki, nagłówek, stopka, formularze, fonty, odstępy), a różnić się kolorem linii i treścią. Część kolorów linii nie spełnia WCAG AA dla zwykłego tekstu (patrz `docs/marka.md`).

## Decyzja
- Tokeny z księgi znaku jako zmienne CSS w jednym pliku + konfiguracja Tailwinda tylko na tokenach (żadnych „gołych” kolorów w komponentach).
- Layout tenanta ustawia `data-line="<linia>"` na `<html>`; CSS mapuje to na `--accent`, `--accent-on-dark`, `--accent-text`. Zmiana linii = zmiana jednego atrybutu.
- `--accent-text` — przyciemniony wariant koloru linii z kontrastem ≥ 4,5:1 na białym i papierze; do tekstu, linków i przycisków z białym napisem. Kolor z księgi — do logo, kresek, ikon i dużych nagłówków.
- Fonty Archivo i Manrope hostowane z naszego serwera (bez zapytań do Google z przeglądarki klienta).
- Pliki znaku: wybrane SVG + favicony w `public/brand/`.
- Automatyczny test dostępności (axe w Playwright) dla każdej linii.

## Konsekwencje
- Komponent nigdy nie zna koloru konkretnej linii.
- Hub pro-kom.eu używa linii `prokom` (zieleń).
