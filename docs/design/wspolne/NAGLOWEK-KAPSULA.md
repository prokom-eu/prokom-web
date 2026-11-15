# Nagłówek-kapsuła — Biznes, Instalacje, Software (spec · 05.11.2026)

Plansza: `docs/design/wspolne/plansze/Kapsula.dc.html` (płótno: „11 · Nagłówek-kapsuła”). Wzorzec: obecny nagłówek Software (stan ze stagingu, 05.11).
Decyzja Krystiana 05.11: **wspólny `SiteHeader` dostaje wygląd kapsuły** we wszystkich trzech liniach. Zastępuje to wygląd nagłówka z planszy 01 i `WSPOLNE-ELEMENTY.md` §3 w części „nagłówek”. Pasek marki (`BrandBar`) zostaje bez zmian treści.

## 1. Miejsce w planie
- **Budowa:** PR **D2-1** (komponenty powłoki). `SiteHeader` od początku powstaje jako kapsuła. D2 rośnie o ok. 0,25 wieczoru.
- **Wpięcie:** PR 1 każdej sesji **D3** (Biznes, Instalacje, Software) — zamiast obecnych nagłówków linii (`BiznesHeader` + `HeaderNav`, Instalacje `powloka/Header.tsx`, `SoftwareHeader`).
- **Nie w D1.** D1 (dane + maile) nie dotyka nagłówka.
- Nie zmieniamy: pozycji menu i ich danych z panelu, treści mega menu, logiki mega menu linii (opóźnienia, klawiatura), dolnego paska i arkusza na telefonie (plansza 06).

## 2. Anatomia
```
[pasek marki 38 px — przełącznik linii · status · slot linii · telefon]   ← przewija się ze stroną
╭──────────────────────────────────────────────────────────────────────╮
│ znak 180×36 │        menu linii (z panelu)        │ prawe przyciski │ ← kapsuła, sticky top 12 px
╰──────────────────────────────────────────────────────────────────────╯
   ╭ mega menu: ta sama szerokość i promień, 10 px pod kapsułą ╮
```
Sloty (linia podaje dane, komponent jest jeden):
| Slot | Biznes | Instalacje | Software |
|---|---|---|---|
| menu | Oferta ▾ · Marki · Opieka IT · GoPOS · InsERT · O firmie · Kontakt | Usługi ▾ · Dla kogo ▾ · Dla architektów · Realizacje · Poradnik · O firmie · Kontakt | menu Software z panelu (Oferta ▾ …) |
| prawe | Szukaj Ctrl K · motyw · **Zapytanie** z licznikiem | motyw · **Zaplanuj instalację** (ciasno: „Zaplanuj”) | motyw · Twój projekt (gdy są pozycje) · **Bezpłatna wycena** (ciasno/telefon: „Wycena”) |
| mega | `MegaMenuPanel` (K4) | dwa mega menu z `powloka/Header.tsx` | `SwMegaMenu` |

API (propozycja, do potwierdzenia w planie D2): `<SiteHeader logo nav={MenuItem[]} megaFor={(key) => ReactNode} actions={ReactNode} cta={{label, shortLabel, href, count?}} line />`. Mega menu i prawe przyciski przychodzą jako sloty z linii — komponent wspólny daje kapsułę, układ, stany, przyklejenie i dostępność.

## 3. Wymiary (desktop ≥ 1360 px)
| Element | Wartość |
|---|---|
| Kapsuła | szerokość jak kontener (max 1280), wysokość 72, promień 22, padding 0 12 0 26, ramka 1 px |
| Po przewinięciu | wysokość 60, promień 18, padding-left 20, przyciski 40/44, mocniejszy cień |
| Link menu | 15 px / 600, padding 10 × 14, promień 12, odstęp 2 |
| Przycisk ikony / Szukaj / Twój projekt | 44 px, promień 14, ramka 1 px |
| Przycisk akcji | 48 px (po przewinięciu 44), padding 0 22, promień 15, 15 px / 800 |
| Licznik | min 20 × 20, pigułka |
| Mega menu | odstęp 10 pod kapsułą, ta sama szerokość, promień 22, cień `0 30px 70px -30px` |
| Pasek marki | 38 px, bez tła, 12,5 px |

1081–1359 px („ciasno”): odstęp linków 0, link 14 px / padding 9, padding-left kapsuły 20, CTA krótka etykieta. Bez łamania wiersza — test e2e na 1081 i 1180 px dla najdłuższego menu (Instalacje).
≤ 1080 px: znak + krótka akcja + przycisk Menu (arkusz z planszy 06). Telefon: kapsuła 10 px od krawędzi, wysokość 58, promień 18, przyciski 42.
Punkty przełamania: **1081 i 1360** dla wszystkich linii (Instalacje dziś 1101 → wyrównać w D3-I PR 1).

## 4. Tokeny (dodać do tokenów ról w D2-1, jasny + ciemny dla każdej linii)
`--cap-bg`, `--cap-border`, `--cap-highlight`, `--cap-shadow`, `--nav-ink`, `--nav-ink-2`, `--nav-hover`, `--nav-active-bg`, `--nav-active-ink`, `--cta-bg` (gradient), `--cta-ink`, `--cta-glow`.

| Linia · motyw | `--cap-bg` | `--nav-active-bg` / `-ink` | `--cta-bg` | `--cta-ink` | `--cta-glow` |
|---|---|---|---|---|---|
| Biznes · jasny | rgba(255,255,255,.78) | #E9EDF6 / #244FB0 | #2F5BC2 → #1F45A0 | #FFF | rgba(36,79,176,.55) |
| Biznes · ciemny | rgba(17,28,60,.66) | rgba(74,123,224,.18) / #8FB0F5 | #4472DC → #2D5BC8 | #FFF | rgba(74,123,224,.6) |
| Instalacje · jasny | rgba(255,255,255,.74) | #E1F2F6 / #006A82 | #0A8AA8 → #006F89 | #FFF | rgba(0,122,150,.5) |
| Instalacje · ciemny | rgba(14,32,36,.68) | rgba(18,182,216,.16) / #5ED3EC | #2CC4E3 → #10A8C9 | **#04181C** | rgba(18,182,216,.55) |
| Software · jasny | rgba(255,255,255,.74) | #ECE7FB / #5B33C4 | #7B52E0 → #6238CF | #FFF | rgba(110,69,212,.5) |
| Software · ciemny | rgba(24,27,25,.72) | rgba(150,112,238,.18) / #C3ABFA | #8A62EA → #6B42D8 | #FFF | rgba(150,112,238,.6) |

Ramka: jasny `rgba(ink,.09)`, ciemny `rgba(255,255,255,.08–.09)`. Refleks: inset `0 1px 0` biały 90 % (jasny) / 5–6 % (ciemny).
Cień kapsuły: `inset 0 1px 0 var(--cap-highlight), 0 1px 2px rgba(0,0,0,.05), 0 22px 44px -30px var(--cap-shadow)`.
CTA: `inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.08), 0 10px 26px -10px var(--cta-glow), 0 0 34px -10px var(--cta-glow)`.
**Kontrast:** tekst CTA ≥ 4,5:1 na środku gradientu — sprawdzić testem (np. obliczenie z tokenów). Jasny fiolet #9670EE z białym tekstem (3,6:1) tylko w poświacie, nie jako tło napisu.

## 5. Zachowanie
- **Przyklejenie:** `position: sticky; top: 12px` na opakowaniu kapsuły; pasek marki nad nim w normalnym przepływie (odjeżdża).
- **Stan „po przewinięciu”:** `data-scrolled` ustawiany przez `IntersectionObserver` na wartowniku 24 px pod paskiem marki (bez nasłuchu `scroll`). Przejścia wysokości/promienia/cienia 220 ms `cubic-bezier(.2,.8,.2,1)`; `prefers-reduced-motion` → bez przejść.
- **Telefon (≤ 1080 px):** chowanie przy przewijaniu w dół, powrót w górę (jak dziś Instalacje `ShellProvider`) — przeniesione do wspólnego hooka.
- **Bez `backdrop-filter`:** `@supports not (backdrop-filter: blur(1px))` → tło kapsuły z kryciem 96 %.
- **Szyna ≥ 1400 px:** kapsuła i szyna mają ten sam promień 22 i ramkę; opakowanie nagłówka uwzględnia `--rail-offset` (z D2-2), żeby nie nachodziły.
- **Bieżąca strona:** pigułka `--nav-active-*`, `aria-current="page"`; dla sekcji strony głównej (szyna) bez pigułki w nagłówku.
- **Mega menu:** panel w opakowaniu kapsuły, `position:absolute; top: calc(100% + 10px)`, niewidzialny mostek nad odstępem (jak `.mega::before` w Instalacjach); otwarty przycisk: tło hover + obrócona strzałka. Logika otwierania/zamykania zostaje w komponentach linii.

## 6. Dostępność
- `<header>` z `<nav aria-label="Menu główne">`; przyciski mega `aria-expanded` + `aria-controls`; Esc zamyka i wraca fokusem; Tab nie wychodzi z otwartego panelu poza przycisk.
- Fokus: `outline: 2px solid var(--nav-active-ink); outline-offset: 2px` na linkach i przyciskach.
- Cele dotyku ≥ 44 px (telefon 42 px przycisk + odstęp ≥ 2 px — sprawdzić axe).
- Kolejność Tab: znak → menu → prawe przyciski → CTA.

## 7. Wydajność
- Sam CSS + jeden mały komponent kliencki (wartownik i mega); bez bibliotek animacji.
- CLS 0: wysokość kapsuły zarezerwowana (72 + 12), zmiana na 60 nie przesuwa treści (kapsuła jest sticky nad treścią, opakowanie ma stałą wysokość).
- Logo jako `<img>`/SVG z wymiarami; brak nowych fontów.

## 8. Kroki
**D2-1 (fundament):** tokeny z §4 dla trzech linii (jasny/ciemny) → `SiteHeader` (kapsuła, sloty, stany, wartownik, fallback) → hook `useHideOnScroll` dla ≤ 1080 px → podgląd `/_wspolne` z trzema liniami × motyw × stan (góra / po przewinięciu / ciasno 1180 / telefon 390) → testy: render slotów, `data-scrolled`, `aria-current`, kontrast CTA z tokenów, e2e brak łamania wiersza na 1081 i 1180 (menu Instalacji).
**D3 PR 1 (każda linia):** zamiana nagłówka linii na `SiteHeader` ze slotami linii; mega menu linii podpięte do slotu bez zmiany treści i logiki; usunięcie starego nagłówka; zrzuty przed/po 1440 / 1180 / 390, jasny i ciemny.

## 9. Odbiór (Krystian)
- Wygląd jak plansza 11 w obu motywach, trzy linie.
- Przewinięcie: pasek marki znika, kapsuła zostaje 12 px od góry i robi się niższa — płynnie, bez skoku treści.
- Mega menu otwiera się pod kapsułą, Esc zamyka.
- 1180 px: menu Instalacji w jednym wierszu. Telefon: kapsuła + dolny pasek.
- axe 0, Lighthouse CLS 0.
