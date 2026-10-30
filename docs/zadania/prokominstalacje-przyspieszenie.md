# prokominstalacje.pl — plan przyspieszenia do produkcji

Stan: 30.10.2026, w trakcie I6. **Przyjęty w całości przez Krystiana 30.10** — zasady wpisane do `CLAUDE.md` (sekcja „Linia Instalacje”) i `docs/zadania/prokominstalacje.md` §0–§1.

## 1. Gdzie dziś idzie czas
Na podstawie I4–I6 (sesje stron z prototypu):

| Co | Udział | Dlaczego |
|---|---|---|
| Ręczne przenoszenie CSS z `pk.css` i mapowanie kolorów na tokeny | ~35% | setki reguł na sesję (I6: 334 reguły z kolorami), każdy kolor szukany ręcznie w `tokens.css` |
| Czekanie na akceptację (commit, PR, scalenie) przez Remote Control | ~20% | każdy commit czeka na „ok”, każdy PR na ręczne scalenie |
| Cykle CI małych PR-ów strefy wspólnej | ~15% | tokeny każdej strony osobnym PR: CI ~20 min → scalenie → nowa gałąź |
| Czytanie prototypu i porównania `porownaj.mjs` | ~15% | konieczne, da się skrócić narzędziem |
| Logika, testy, przegląd | ~15% | to zostaje — tu jest jakość |

## 2. Narzędzia (jednorazowo, ~0,5 wieczoru, zaraz po I6)
1. **`narzedzia/przenies-css.mjs`** (prototyp gotowy w I6): lista klas sekcji → reguły z `pk.css` jako zagnieżdżony CSS linii; zmienne prototypu → tokeny repo, kolory → `var(--…)` z mapy, `:hover` w `@media (hover: hover)`, `@keyframes` z prefiksem `inst-`; raport kolorów bez tokenu i reguł „tylko jasny motyw”. Zamiast przepisywać — sprawdzam i poprawiam wynik.
2. **`narzedzia/przenies-svg.mjs`**: sceny SVG z `Main.body.html`/`Seg*.body.html` → stałe TS renderowane na serwerze (wzór I5 `backdrop.ts`). Najwięcej daje w I10 (12 przekrojów) i I16a (`ArchHouseScene`).
3. **Jeden e2e „każda strona”** (`tests/e2e/instalacje/strony.e2e.spec.ts`): lista adresów × 360/390/414 — brak poziomego przewijania, cele ≥ 44 px, jeden `h1`, brak `[…]` i list źródeł, `title`/`description` w limitach. Każda sesja dopisuje tylko adres. Przenosi część I13 i I14 na bieżąco.
4. **`porownaj.mjs` hurtem**: wszystkie strony sesji jednym poleceniem + liczbowa różnica wysokości sekcji (ADR-I003 §5 p. 6) w tabeli, gotowej do opisu PR.

## 3. Tokeny hurtem — jeden PR zamiast sześciu
Po narzędziach: **jeden PR `inst/wsp-tokeny-strony`** z tokenami wszystkich pozostałych stron (I7–I12, I16) wygenerowanymi z prototypu + test kontrastu. Potem sesje stron nie dotykają strefy wspólnej → koniec czekania na CI w środku sesji, a dwie sesje stron mogą iść równolegle bez konfliktu w `tokens.css`.

## 4. Proces
- **Małe PR-y** (strefa wspólna bez logiki, dokumenty, poprawki testów): commit i PR bez osobnego „ok”, auto-merge po zielonym CI. Diff czytasz w PR na GitHubie.
- **Duże PR-y z logiką** (formularze, migracje, tenant, dostęp): bez zmian — `/przeglad`, Twój odczyt diffu przed PR. Ale **jedno czytanie na końcu**, nie przy każdym commicie.
- **Plan sesji**: prompt z §3 jest planem — pytam tylko o decyzje, których prompt nie rozstrzyga (jedno pytanie z opcjami), zamiast osobnej rundy „plan → ok”.
- **Recenzent w tle**: `/przeglad` rusza, a ja w tym czasie robię porównania i STAN.
- **Lokalnie**: testy jednostkowe + e2e zmienionej strony; reszta i `build` w CI (już tak jest).
- **Dwie sesje stron naraz** (po §3): np. I7 i I10 w dwóch folderach (drugi worktree `prokom-instal-2`, `PORT=3003`, własna baza). Każda sesja to osobna gałąź i PR.

## 5. Harmonogram po zmianach
| Sesja | Było (wieczory) | Po zmianach | Uwagi |
|---|---|---|---|
| I6 (reszta) | 1,5 | 1 | w toku |
| narzędzia + tokeny hurtem | — | 0,5 | §2, §3 |
| I7 Monitoring, Alarmy | 2 | 1,25 | |
| I8 Dostęp, Sieci, Teletechnika | 2 | 1,25 | |
| I9 Smart home, Nagłośnienie, Ekrany, EV | 2,5 | 1,5 | |
| I10 Dla kogo (12 przekrojów) | 2,5 | 1,5 | SVG narzędziem |
| I11 formularze i kontakt | 2 | 1,5 | logika — mało do zautomatyzowania |
| I16a–c dla architektów | 4,5 | 3 | priorytet szefa: zaraz po I11 |
| I12 Oferta, Realizacje, O firmie, Poradnik | 1,5 | 1 | |
| I13 SEO, prawo, wydajność | 1,5 | 1 | część kontroli już w e2e „każda strona” |
| I14 telefon: audyt | 1 | 0,5 | jw. |
| I15 staging i produkcja | 1 | 1 | zależy od szefa |
| **Razem** | **≈ 22** | **≈ 15** | |

Przy 3 sesjach w tygodniu: ≈ 5 tygodni zamiast ≈ 7,5. Z dwiema sesjami stron równolegle (I7–I10, I12) — ok. tydzień mniej.

**Kolejność:** I6 → narzędzia + tokeny hurtem → I7, I8, I9, I10 (po dwie naraz) → I11 → I16a → I16b → I16c → I12 → I13 → I14 → I15.

## 6. Czego nie przyspieszamy
- `/przeglad` przy formularzach, migracjach, izolacji tenantów i dostępie.
- Test na prawdziwym telefonie (MOBILE §10) i porównanie z wzorcem przed PR.
- Decyzje szefa — to **prawdziwa ścieżka krytyczna** produkcji. Lista z `docs/stan/STAN-instalacje.md` → „Pytania” warto wysłać szefowi teraz jednym mailem/zadaniem w Asanie: telefon/e-mail/WhatsApp Instalacji, adres w Zakopanem, zgody na realizacje i zdjęcia, zasady wizji lokalnej i dojazdu (FAQ strony głównej), klauzula RODO formularzy, dane strony dla architektów. Bez nich I13/I15 staną niezależnie od tempa kodu.

## 7. Decyzje (przyjęte 30.10.2026)
- [x] Narzędzia z §2 (przenies-css, przenies-svg, e2e „każda strona”, porownaj hurtem) — jedna sesja po I6.
- [x] Tokeny wszystkich stron jednym PR (§3).
- [x] Małe PR-y bez osobnego „ok” + auto-merge po zielonym CI (§4) — zmiana reguły w `CLAUDE.md` („Przed każdym commitem pokaż mi…”) tylko dla PR-ów `inst/wsp-*` bez logiki, dokumentów i poprawek testów.
- [x] Duże PR-y: jedno czytanie diffu przed PR zamiast przy każdym commicie.
- [x] Bez osobnej rundy „plan → ok” dla sesji stron z gotowym promptem.
- [x] Drugi folder Instalacji do pracy równoległej (po tokenach hurtem).
- [x] Lista pytań do szefa wysłana teraz (§6).
