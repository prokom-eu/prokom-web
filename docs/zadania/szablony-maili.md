# Zadanie SM — szablony ręcznych odpowiedzi v2 (5 linii, Thunderbird + Quicktext)

Spec: `docs/design/szablony/SZABLONY-MAILI.md` · treści: `tools/szablony-maili/tresci/*.yaml` · wzorzec: `docs/design/szablony/probka-wzorzec.png` (+ `.html`).
Zastępuje paczkę `szablony-maili` v1 (03.11, poza repo). Gaming poza zakresem.

> **Stan 17.11.2026:** zakres zawężony do 4 linii (bez Tech — decyzja Krystiana 16.11). Zamiast 3 PR-ów piętrowych jest jeden PR `feat/szablony-silnik`: silnik, treści, testy, `START-TUTAJ.md`, runbook (§10). Odstępstwa od spec: `SZABLONY-MAILI.md` §0. SM-3 (Tech) czeka na osobną decyzję. Prompt poniżej zostaje jako historia.

## Miejsce w planie
- **Osobna duża sesja SM**, niezależna od D1/D2/D3 i od sesji linii: dotyka tylko `tools/szablony-maili/**`, `docs/design/szablony/**`, `package.json` (skrypty, ewentualnie devDependencies), `.gitignore`, `docs/runbook.md`, `docs/STAN.md`. Nie zmienia `src/**`, kolekcji, migracji ani maili automatycznych (ADR-024).
- **Folder:** dowolny wolny folder `prokom-web` (fundament albo worktree `../prokom-web-szablony`). Pliki pakietu są nieśledzone — commit w SM-1.
- **Szacunek:** ok. 1,5 wieczoru, 3 PR-y piętrowe. PR-y z treściami YAML mogą przekroczyć 400 linii — to dane, nie kod; kod w każdym PR ≤ 400 linii.
- Tech (prokomserwis.pl) jest w innym repo, ale szablony Thunderbirda są plikami poza stroną — budujemy je tutaj, w jednym narzędziu dla 5 skrzynek.

## Prompt (wklej w Claude Code)
```
/zadanie SM — szablony ręcznych odpowiedzi v2 dla 5 linii (Biznes, Instalacje, Software, PRO-KOM, Tech) — Thunderbird + Quicktext
Duża sesja, 3 PR-y piętrowe: SM-1 feat/szablony-silnik (od origin/develop) → SM-2 feat/szablony-linie → SM-3 feat/szablony-tech.
Przeczytaj CAŁE: docs/zadania/szablony-maili.md, docs/design/szablony/SZABLONY-MAILI.md, wszystkie tools/szablony-maili/tresci/*.yaml; obejrzyj docs/design/szablony/probka-wzorzec.png i otwórz probka-wzorzec.html (to wynik, do którego dążymy — HTML komponentów jest tam dokładnie taki, jak w spec §4).
Zasada nadrzędna: TREŚCI W YAML SĄ ZAAKCEPTOWANE. Nie zmieniaj słów, kolejności ani obietnic. Jeśli coś jest technicznie niewykonalne (np. Quicktext) albo test treści się nie zgadza — zatrzymaj się i opisz w planie/PR, nie poprawiaj treści sam.
Najpierw JEDEN plan całości w trybie planowania (pliki, zależności, API generatora, podział na PR-y, pytania na końcu) — czekaj na akceptację.

SM-1 — silnik + dane + wspólne + Biznes:
1. tools/szablony-maili/: schema.ts (zod: dane.yaml i pliki szablonów wg spec §3), load.ts (scalanie wspolne + linia wg pola `linie`, grupy wspólne 1–7, potem grupy linii), dsl.ts (treść → bloki: karta, kroki, info/uwaga/ok, przycisk, pozycje, lista, lista punktowana, akapit; pola I/S/M/?; zmienne linii, odwołania {linia.POLE}, {PYTANIA}, {S_PUNKT}), html.ts (komponenty DOKŁADNIE wg spec §4 — style inline, tabele, role="presentation"), quicktext.ts (XML wg spec §6, CDATA bezpieczne dla "]]>"), podpis.ts (spec §5), logo.ts (SVG z public/brand → PNG 3×, 528 px, białe tło — użyj sharp, jeśli jest w repo), preview.ts (podglad-szablonow.html wg spec §6 — zakładki, wyszukiwarka, „kiedy”, temat, podpis; logo jako data URI), katalog.ts (KATALOG-SZABLONOW.md + autoodpowiedzi), build.ts (CLI: --line <id|all> --strict --logo-base <url> --no-href-input --out <dir>; domyślnie dist/).
2. package.json: "szablony:build", "szablony:copy" (kopiuje dist/ do D:\PRO-KOM\maile albo --to <dir>; działa na Windows i Linux). Używaj istniejących zależności; nowe tylko jako devDependencies i tylko jeśli konieczne (np. `yaml`, `parse5`) — wypisz je w planie.
3. .gitignore: tools/szablony-maili/dist/.
4. Testy wg spec §8 (wszystkie punkty, które dotyczą dane + wspolne + biznes) + migawka 2 szablonów ze wzorca (biznes/oferta, wspólne/potwierdz).
5. Build dla biznes: dist/biznes + podgląd z zakładką Biznes. Porównaj z probka-wzorzec (Biznes · „Oferta w załączniku”) — zrzut 1440 i 390 w PR.

SM-2 — Instalacje, Software, PRO-KOM:
1. Włącz linie instalacje, software, prokom (treści już są). Podpisy z oficjalnymi znakami (PRO-KOM: prokom-glowna_poziome_kolor.svg).
2. Testy literałów i zasad linii (spec §8: Instalacje bez „technik w 24…”, PRO-KOM/Biznes RTV/AGD bez montażu itd.) + migawki: software/opieka, instalacje/pomontazu, prokom/dostawy-lista.
3. Zrzuty podglądu każdej linii (1440, 390) i porównanie z probka-wzorzec w PR.

SM-3 — Tech + dokumentacja:
1. Linia tech: {S_PUNKT} z PUNKTY (published), wordmark HTML w podpisie, dopóki LOGO = [DO UZUPEŁNIENIA] (spec §5); ostrzeżenia dla MAIL/LOGO/Zakopane/KURIER; --strict przerywa.
2. Jeśli w D:\PRO-KOM\repos\prokom-system (albo ../prokom-system) jest kod serwisu: TYLKO ODCZYT backend/apps/communications/** — wypisz w PR, jakie maile system wysyła automatycznie (zdarzenie → temat), i zaznacz w podglądzie szablony Tech, które je dublują (plakietka „jest też mail automatyczny: …”). Nie zmieniaj prokom-system.
3. Migawki: tech/wycena, tech/kurier-jak. Testy Tech (spec §8).
4. dist/START-TUTAJ.md wg spec §7 (liczby z budowy), docs/runbook.md (sekcja „Szablony maili w Thunderbirdzie”: build, copy, import, aktualizacja treści), docs/STAN.md.
5. Pełny build --line all; w PR: liczby szablonów per linia (oczekiwane: B 45, I 43, S 42, P 42, T 41), lista ostrzeżeń [DO UZUPEŁNIENIA]/[SZEF], zrzuty podglądu Tech.

Po każdym PR: /przeglad → porównanie z wzorcem → /koniec-sesji (STAN: „W toku: SM, scalone SM-1…, następny …”) → /pr. Kolejne wieczory: „/zadanie SM — kontynuacja wg STAN”.
Lista „Sprawdź ręcznie” (spec §9) jako checklista w opisie SM-3 — odhacza Krystian.
DoD: lint, typecheck, testy, CI zielone; pnpm szablony:build --line all bez błędów (ostrzeżenia dozwolone); podgląd zgodny z wzorcem.
```

## Po scaleniu (Krystian, ok. 30 minut)
1. `pnpm szablony:build --line all` → `pnpm szablony:copy` (do `D:\PRO-KOM\maile\`).
2. Otwórz `podglad-szablonow.html` i przejrzyj linie.
3. Thunderbird: w Quicktext usuń grupy z v1, zaimportuj `quicktext-<linia>.xml` dla skrzynek na tym komputerze; podpisy wg `START-TUTAJ.md`; podmień `[Imię i nazwisko]`.
4. Checklista ręczna z PR SM-3 (spec §9): Quicktext pyta o pola, przycisk z polem w adresie, Gmail i Outlook, ciemny motyw na telefonie.
5. Uzupełnij `dane.yaml`, gdy będą: skrzynka Tech i znak PRO-KOM TECH, Zakopane, zasady kurierskie, regulamin (nieodebrany sprzęt) → build → ponowny import Tech.
