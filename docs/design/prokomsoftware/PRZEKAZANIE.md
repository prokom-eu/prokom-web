# Pakiet dla Claude Code — prokomsoftware.pl z wizualizacji

Stan na 18.10.2026. Pakiet zawiera wszystko, czego Claude Code potrzebuje, żeby zbudować prokomsoftware.pl jak na wizualizacji. Claude Code nie widzi czatu ani artefaktu, więc w repo musi być komplet.

## 1. Co wrzucić do repo `prokom-web`

Skopiuj foldery **z zachowaniem ścieżek** do katalogu głównego repo (nic nie nadpisuje istniejących plików):

| Z pakietu | Do repo | Co to |
|---|---|---|
| `docs/strony/prokomsoftware.md` | to samo | **Specyfikacja:** mapa strony, sekcje, zachowania, formularze, SEO, kryteria, [SZEF] |
| `docs/decyzje/ADR-014-model-tresci-prokomsoftware.md` | to samo | model danych: kolekcje, trasy, bloki, zapytania |
| `docs/decyzje/ADR-015-wyglad-prokomsoftware.md` | to samo | kolory, motyw ciemny, gradient (decyzje SW0) |
| `docs/zadania/prokomsoftware.md` | to samo | **plan sesji SW0–SW12 z promptami** i podziałem pracy |
| `docs/design/prokomsoftware/` | to samo | wzorzec: `README.md`, `tokens.css`, `screens/` (40 zestawów), `stany/` (50), `boards/` (13 plansz + `index.html`), ten plik |
| `seed/prokomsoftware/` | to samo | dane startowe (15 plików JSON, każdy z opisem `_info`) |

Potem w Claude Code (albo ręcznie):
1. Gałąź `docs/prokomsoftware-wizualizacja` → commit „docs: specyfikacja i wzorzec wyglądu prokomsoftware.pl” → PR do `develop` (squash).
2. W `docs/STAN.md` w tabeli celu: prokomsoftware.pl — specyfikacja i wzorzec ✅; w „Następne”: SW0 wg `docs/zadania/prokomsoftware.md`.
3. Rozmiar ok. 25 MB (zrzuty ok. 17 MB, stany ok. 5 MB, plansze ok. 3 MB). **Rekomendacja: zwykły commit** — tak samo jak Biznes (#28), oba komputery mają ten sam wzorzec.

**Prompt do wrzucenia pakietu** (w repo, po skopiowaniu plików):
```
Na nowej gałęzi docs/prokomsoftware-wizualizacja dodaj pliki pakietu prokomsoftware (docs/strony/prokomsoftware.md, docs/decyzje/ADR-014-*.md, ADR-015-*.md, docs/zadania/prokomsoftware.md, docs/design/prokomsoftware/, seed/prokomsoftware/). Nie zmieniaj ich treści. Sprawdź, czy numery ADR-014 i ADR-015 są wolne (jeśli nie — przenumeruj i popraw odwołania we wszystkich plikach pakietu). Zaktualizuj docs/STAN.md (cel + „Następne”: SW0). Pokaż git diff --staged --stat, commit „docs: specyfikacja i wzorzec wyglądu prokomsoftware.pl”, potem /pr.
```

## 2. Jak Claude Code ma z tego korzystać
- **Kolejność czytania:** spec. → `README.md` wzorca → ADR-014 → ADR-015 → plan sesji → przy każdej sekcji zrzuty z `screens/`, stany z `stany/` i fragment planszy z `boards/`.
- **Zrzuty** to obraz celu. **Plansze** to dokładne teksty i wartości. Podgląd: `npx serve docs/design/prokomsoftware/boards` → `index.html`.
- **Teksty z plansz są uzgodnione.** Przenosimy je, nie piszemy od nowa.
- **Placeholdery [OD], [TERMIN], [CZAS ODPOWIEDZI]…** to pola w panelu (spec. §13). Na produkcji nie może zostać żaden.

## 3. Kolejność pracy
1. **Teraz (czat):** decyzje SW0, zadanie dla szefa (ceny, terminy, opieka) — pon. 19.10.
2. **Wrzucenie pakietu** (prompt wyżej) — może być od razu, nie przeszkadza Biznesowi.
3. **SW0** (dokumentacja, bez kodu) — po decyzjach.
4. **SW1–SW12** — po produkcji Biznesu (plan i terminy: `docs/zadania/prokomsoftware.md`).
5. W tym czasie w czacie: treści branż, miejscowości, rozwiązań, wpisów — żeby kod nie czekał.

## 4. Ważne
- **Znak PRO-KOM Software** tylko z `public/brand/` (jest od S6a), nie z plansz.
- **Zdjęcia ludzi** (O firmie) tylko za zgodą. Logo i opinie klientów — nie w etapie 1.
- **Realizacje** na stronie głównej to systemy własne PRO-KOM: prokomserwis.pl, pro-kom.eu, prokombiznes.pl (w budowie) — opis bez danych klientów.
- **Przed B11 Biznesu:** `/aktualnosci` jako trasa wspólna (ADR-014 §2) — dopisz do zadania B11.
- **Fakty do sprawdzenia** przed publikacją: spec. §13 pkt 13–17; poprawki tekstów do decyzji: pkt 18–22.
