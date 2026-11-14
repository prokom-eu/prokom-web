# Wzorzec wyglądu — nowa pro-kom.eu

- **Na żywo (do oglądania):** https://claude.ai/artifact/JPYzSjm9XgMNgasPjm8BHx — tryb Play na każdej planszy; rząd „Telefon/Tablet na żywo” pokazuje te same strony w 390 × 844 i 820 × 1180 (wersja prywatna Krystiana; Claude Code nie ma do niej dostępu — zrzuty robi Krystian).
- **Źródła plansz:** `plansze/*.dc.html` — kod HTML/CSS i dane (blok `<script type="text/x-dc">`, metoda `renderVals()`). To jest wzorzec znaczników, klas, odstępów, ruchu i tekstów. Pliki nie uruchamiają się poza narzędziem projektowym (składnia `{{…}}`, `<sc-for>`, `<sc-if>`, `<dc-import>`), ale czyta się je jak zwykły HTML z szablonem.
- **Tokeny:** `tokens.css` (wyciąg 1:1 z planszy głównej: kolory `--k-*`, RGB `--r-*`, motyw jasny, wspólny ruch).
- **Dane:** `seed/prokomeu/strony/*.json` — migawka danych każdej planszy (`renderVals` w stanie domyślnym + `stany` = treść pozostałych zakładek + metody z listami, np. `services`, `data`, `cases`, `branches`).

## Mapa plansz → adresy → sesje

| Plansza (płótno) | Plik | Adres | Sesja |
|---|---|---|---|
| 01 · Strona główna | `Main.dc.html` | `/` | H2 |
| 02 · Cała oferta | `Linie.dc.html` | `/linie` | H3-1 |
| 03 · Dla firm | `DlaFirm.dc.html` | `/dla-firm` | H3-2 |
| 04 · Dla domu | `DlaDomu.dc.html` | `/dla-domu` | H3-3 |
| 05 · Załatw online | `Narzedzia.dc.html` | `/zalatw-online` | H5-1 |
| 06 · Pomoc | `Pomoc.dc.html` | `/pomoc`, `/pomoc/[slug]` | H5-1 |
| 07 · O firmie | `OFirmie.dc.html` | `/o-firmie` | H5-2 |
| 08 · Marki i autoryzacje | `Partnerzy.dc.html` | `/partnerzy` | H5-2 |
| 09 · Gdzie działamy | `Zasieg.dc.html` | `/gdzie-dzialamy` | H5-3 |
| 10 · Kontakt | `Kontakt.dc.html` | `/kontakt` | H5-2 |
| 11 · Aktualności | `Aktualnosci.dc.html` | `/aktualnosci` | H5-3 |
| 12 · Wyniki wyszukiwania | `Szukaj.dc.html` | `/szukaj` | H1-3 |
| 13 · Strony prawne | `Prawne.dc.html` | `/polityka-prywatnosci`, `/cookies`, `/dostepnosc` | H5-3 |
| 14 · Mapa strony i SEO | `MapaStrony.dc.html` | `/mapa-strony` (+ tabela adresów i 301) | H5-3, H6-2 |
| 15 · 404 | `E404.dc.html` | 404 | H5-3 |
| 16 · Współpraca | `Wspolpraca.dc.html` | `/wspolpraca` | H4-2 |
| 17 · Inwestycje i dostawy | `Dostawy.dc.html` | `/inwestycje-i-dostawy` | H4-1 |
| Wspólne · nagłówek | `Naglowek.dc.html` | powłoka (pasek marki, kapsuła, mega menu, szyna, arkusz, dolny pasek, wyszukiwarka) | H1-2 |
| Wspólne · stopka | `Stopka.dc.html` | stopka | H1-2 |
| Telefon/Tablet na żywo | `Tel-*.dc.html`, `Tab-*.dc.html` | te same strony w 390 i 820 px (opakowania) | H7-1 |

## Jak czytać planszę
- Style globalne strony są w `<helmet><style>`; bloki `/*PKTHEME*/` (tokeny), `/*PKX*/` (ruch kart), `/*PKCALM*/` (wyciszenie efektów — obowiązuje: bez „błysku”, uniesienie −4 px), sekcje stron mają własne klasy (np. `/*DV*/` na stronie dostaw).
- `{{x.y}}` = wartość z `renderVals()`; `<sc-for list="{{lista}}" as="el">` = pętla; `<sc-if value="{{warunek}}">` = warunek; `onClick="{{fn}}"` = obsługa kliknięcia (logika w `renderVals`).
- Kolory linii: `--k-b` Biznes, `--k-i` Instalacje, `--k-s` Software, `--k-t` Tech, `--k-y` Gaming, `--k-g` PRO-KOM; warianty `t` (tekst), `d` (ciemne tło karty), `i` (tekst na kolorze).
- Responsywność jest w `@media` w każdej planszy (główne progi: 1400, 1240, 1080, 1000, 760, 640) — przenosimy na progi wspólne z ADR-022 (1081 / 1360 dla nagłówka) tam, gdzie się różnią.

## Czego nie przenosić 1:1
- Przykładowych tytułów Aktualności i liczb bez zatwierdzenia (spec §3).
- Rozwiązań tymczasowych planszy: `setInterval` bez pauzy przy ukrytej karcie, style inline — w kodzie klasy CSS/moduły i komponenty.
- Opakowań `Tel-*`/`Tab-*` — to tylko podgląd.
