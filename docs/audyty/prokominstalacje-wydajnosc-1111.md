# prokominstalacje.pl — wydajność i płynność (11.11.2026)

Skrót raportu, na podstawie którego powstał PR `inst/plynnosc`. Pomiar: Pixel 7, procesor ×4 (CDP), build produkcyjny `develop` 9fb8651.

## Stan

- **Główna:** 263 animacje działają także przewinięte poza ekran → procesor 98–100% w bezczynności, przewijanie 38 ms/klatkę (p95 67 ms), INP 280 ms, TBT 412 ms.
- W bezczynności: Monitoring 45%, Dla architektów 40%, Pensjonaty 33%.

## Przyczyny

- 187 migających gwiazd i świateł w hero głównej (`inst-hx-tw`, opacity każdego elementu SVG osobno).
- 15 linii przepływu w „Architekci” (`stroke-dashoffset`), 10 orbit w „Usługi”, pierścienie, stożki, chmury, mgła, dym, zorza.
- `inst-ping` animuje `box-shadow`.
- Monitoring: marsz kabli, auta, przechodnie, `inst-mon-scan` na `left`, `inst-mon-strobe` na `fill`.
- Pauza `.hx.still` włącza się tylko przyciskiem „Wstrzymaj animację”.
- `/dla-kogo/pensjonaty`: przy `prefers-reduced-motion` działa nadal 18 animacji (`inst-ring`, `inst-hsp`, `inst-conef`, `inst-sgfl`).

## Cel

- Procesor w bezczynności ≤ 10%, gdy animowana sekcja jest poza ekranem, i ≤ 35% na głównej z hero w kadrze.
- Przewijanie głównej p95 ≤ 20 ms przy CPU×4; INP ≤ 200 ms; wygląd bez zmian.

## Zalecenia

1. Pauza poza ekranem (IntersectionObserver, `data-off`, `animation-play-state: paused`), także przy ukrytej karcie; zegary JS scen stają poza ekranem.
2. Gwiazdy hero animowane grupami, na telefonie ok. 60.
3. `inst-ping`, `inst-mon-scan`, `inst-mon-strobe` na transform/opacity; `stroke-dashoffset` może zostać (po pkt 1 działa tylko w kadrze).
4. Reguły reduced motion na wszystkich stronach „Dla kogo”; test e2e `document.getAnimations()` = 0.
5. Pomiar przed/po (`docs/design/prokominstalacje/narzedzia/pomiar-plynnosc.mjs`).

## Poza zakresem PR (do zrobienia osobno)

- Nginx: `/brand/*`, ikony i manifest z `max-age=0` — proponowane `expires 7d`, opcjonalnie Brotli (Krystian, serwer).
- HTML głównej 536 KB po rozpakowaniu (dane RSC dublują sceny SVG) — wrócić, jeśli po PR TBT głównej na telefonie > 300 ms.
