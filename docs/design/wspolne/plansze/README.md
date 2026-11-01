# Plansze elementów wspólnych — jak czytać

Źródła plansz z płótna Claude Design „PRO-KOM · elementy wspólne linii” (stan 01.11.2026). Podgląd na żywo (z przełącznikiem linii w Kontakcie i O firmie): https://claude.ai/artifact/7HKNezL1nNmgeZPJum8rQG — dostęp ma Krystian. Zrzuty PNG może wyeksportować z płótna do `docs/design/wspolne/zrzuty/`.

Pliki `.dc.html` nie otworzą się samodzielnie w przeglądarce (potrzebują środowiska edytora), ale są zwykłym HTML-em:
- **wygląd** — każdy element ma pełny `style="…"` (kolory hex, wymiary w px, promienie, cienie, kroje),
- **dane i teksty** — w skrypcie na dole pliku (`renderVals()`), obiekty JS z treściami per linia (`T` = tokeny, `D` = treści),
- `{{…}}` to podstawienia z tych danych, `<sc-for>` = pętla, `<sc-if>` = warunek, `<dc-import name="Logo">` / `name="Mapa"` = komponenty (`Logo.dc.html`, `Mapa.dc.html`).

| Plik | Co pokazuje |
|---|---|
| `Main.dc.html` | 00 · zasady, trzy poziomy, tokeny 4 linii, skala tekstu, wymiary, pas o PRO-KOM Gaming |
| `Chrome.dc.html` | 01 · pasek marki + nagłówek dla Biznes, Instalacje, Software, Tech + anatomia (8 elementów) |
| `Footer.dc.html` | 02 · stopki 4 linii (A kolumny linii, B pas linii z Gaming, C pasek prawny, mapa w kolumnie Kontakt) |
| `Telefon.dc.html` | 06 · telefon: Biznes Kontakt, Instalacje arkusz Menu, Software stopka, Tech strona główna — dolny pasek wg jednej zasady |
| `Moduly.dc.html` | 03 · status godzin, przyciski 4 linii, formularz (wypełnianie / błędy / wysłane), FAQ, kroki |
| `Kontakt.dc.html` | 04 · szablon Kontakt (zmienna `linia`: Biznes / Instalacje / Software / Tech) |
| `OFirmie.dc.html` | 05 · szablon O firmie (zmienna `linia`) |
| `Logo.dc.html` | znak linii (w kodzie używamy plików z `public/brand/`, nie tego rysunku) |
| `Mapa.dc.html` | mapa adresu — schemat ulic; w kodzie prawdziwa geometria z OSM (spec §5 AddressMap) |

**Uwaga — dane w planszach vs spec:** gdzie plansza i `WSPOLNE-ELEMENTY.md` §6.3 różnią się danymi kontaktowymi (Biznes: e-mail i telefony), wygrywa spec.
