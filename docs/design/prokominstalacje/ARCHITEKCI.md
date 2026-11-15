# Wzorzec: strona „Dla architektów i deweloperów” (v4.2, 28.10.2026)

Prototyp: `prototyp/dla-architektow.html`, a sekcja na stronie głównej w `prototyp/start.html#architekci`.
Źródło: `zrodlo/pages/Architekci.body.html` (szablon), `Architekci.js` (stan, logika, treści), `Architekci.meta.json`, `zrodlo/inc/arscene.html` (przekrój domu), `zrodlo/common.js` → `arHotspots()`, `arScene()`, `arSpecs()` (dane i logika przekroju, wspólne z główną), `zrodlo/pages/Main.*` (sekcja `#architekci`: `arhm`, `arsc`, auto-widoki z `tick`).
Style: `pk.css` (bloki „v4.1 · Dla architektów (ar-)”, „v4.2 · przekrój domu (ars)” i następne). Klasy z prefiksem `ar`.
Treści do kodu i seeda: `seed/prokominstalacje/architekci/` (strona.json, przekroj.json, nowe-rozwiazania.json) i `seed/prokominstalacje/strony-zrzut/Architekci.json` (stan jednego ekranu).
Stany telefonu: `stany-telefonu/21…25-architekci-*-{light,dark}.webp`.

## Wysokości (orientacyjnie, ±10%)
Desktop 1440: całość ok. 20 000 px · hero ok. 1 150 · dla-ciebie 552 · problemy 920 · etapy 815 · wymiana 810 · checklista 1 743 · liczby 1 247 · instalacje 1 005 · nowosci 1 712 · deweloperzy 1 248 · przepisy 1 690 · doswiadczenie 1 117 · biblioteka 883 · pokaz 691 · zasady 741 · opiekun 490 · faq 1 093 · wyslij 1 100.
Telefon 390: ok. 25 000 px po zwinięciu sekcji z `fold.json`.

## Komponenty (propozycja ścieżek — sesja I16a dopasowuje do repo)
| Komponent | Źródło w prototypie | Uwagi |
|---|---|---|
| `ArchHouseScene` (`sekcje/`) | `inc/arscene.html`, `common.js` (`arHotspots`, `arScene`, `arSpecs`) | SVG `viewBox="0 70 1000 530"`; warstwy: tło i Tatry, grunt, dach z anteną, ściany i stropy, okna, garaż z autem, wyposażenie (`.fin`), urządzenia (`.ardevs`), elementy „przed tynkami” (`.arbox`: puszki, ramki, wnęki, przerywana pomarańczowa linia), kable (`.arcabs`: `.arw.L-<usługa>`, rura `.arpipe` + światłowód `.arfib`), szafa rack (`.arrackg`), podpisy pomieszczeń (`.arrn`), punkty (`.arhsg`). Widoki = klasa `m-kl` / `m-ty` / `m-in` na korzeniu, warstwy = `off-<usługa>`. Wariant `compact` dla głównej (karta pod rysunkiem, bez paska warstw). |
| `ArchHero` | `Architekci.body.html` → `.arhead`, `.arstage`, `.arkvs` | H1 z nadtytułem `h1k`, lead i przyciski po prawej |
| `AudienceTabs` | `#dla-ciebie` (`ar.aud`) | 4 role |
| `ProblemCards` + `BravasStrip` | `#problemy` (`ar.prob`, `ar.br`) | |
| `StageTimeline` | `#etapy` (`ar.et`) | oś postępu `width:%` |
| `ExchangeColumns` | `#wymiana` (`ar.wy`) | prawa kolumna ciemna |
| `DesignerChecklist` | `#checklista` (`ar.ck`) | stan odhaczeń w `localStorage` (try/catch), formularz PDF |
| `SpecTiles` | `#liczby` (`ar.lz`) | kolor kafla = kolor usługi (`--hc`) |
| `InstallationsExplorer` | `#instalacje` (`ar.ins`) | lista + panel, `position: sticky` tylko desktop |
| `SolutionsExplorer` | `#nowosci` (`ar.nw`) | dane z `InstArchNews`; lista + panel; filtr z licznikami; zapis na nowości |
| `DeveloperBlock` | `#deweloperzy` (`ar.dv`) | ciemny blok z lokalnymi tokenami (klasa `.ardvb`) |
| `LawTimeline` + `LawCards` | `#przepisy` (`ar.tl`, `ar.prz`) | statusy: `ok` / `warn` / `mut` |
| `ExperienceBlock` | `#doswiadczenie` (`ar.exp`) | |
| `DesignerLibrary` | `#biblioteka` (`ar.lib`) | linki zewnętrzne `target="_blank" rel="noopener"` |
| `PresentationCards`, `CooperationRules`, `ArchitectContact` | `#pokaz`, `#zasady`, `#opiekun` | opiekun z `InstalacjeSettings.architects` |
| `Faq` (wspólny z I4) | `inc/faqsec.html` | 10 pytań, pierwsze otwarte |
| `ArchitectForm` | `#wyslij` (`ar.fm`) | bez pola pliku w v1: „Link do rzutów (opcjonalnie)” |
| `ArchTeaser` (w `InstHome`) | `Main.body.html` `#architekci` | `ArchHouseScene compact` + karta „Nowość” |

## Interakcje i stany
- Przekrój: `m` ∈ {kl, ty, in}, `hs` (indeks punktu), `off[]` (wyłączone warstwy). Kliknięcie punktu w widoku „Gotowy dom” przełącza na „Wszystkie instalacje”. Strzałki chodzą tylko po widocznych punktach. Karta: numer w kolorze usługi, tytuł, chip usługi, chip etapu, trzy bloki tekstu.
- Autoodtwarzanie (bez ograniczenia ruchu): strona — po 2,6 s widok „in”, potem kolejny punkt co 3,4 s, stop po pierwszej interakcji. Główna — cykl widoków kl → ty → in co ok. 3 takty (4 s) i punktu co 3 widoki. Poza ekranem pauza (IntersectionObserver), przy `prefers-reduced-motion` brak.
- Checklista: wybór obiektu czyści odhaczenia; wybór instalacji przelicza listę; licznik „N rzeczy do przewidzenia” z odmianą (`plw`).
- Nowe rozwiązania: zmiana filtra wybiera pierwszą kartę filtra; strzałki w obrębie filtra; licznik „x / n”.
- Formularze: walidacja telefonu (9 cyfr) i zgody jak w Kontakcie; komunikat `role="alert"`.

## Telefon
Patrz spec §6. Kluczowe reguły z `pk.css` (media ≤760 px): `.arsvgw{overflow-x:auto}`, `.ars .arsvg{width:820px}`, `.ars .arbar{position:sticky}`, podpowiedź `::after`, karuzele `.arnxl`, `.araudtabs`, `.ardvtabs`, `.artlw`; `.arpr`, `.arlibo` jako jedna kolumna.

## Czego nie przenosić
- Generowania stanów w `renderVals` (prototyp liczy wszystko w jednej funkcji): w React rozbij na komponenty z lokalnym stanem.
- Przykładowych wartości formularzy i komunikatu „W wizualizacji to tylko pokaz działania” (to tekst prototypu).
