---
description: Przygotuj i otwórz pull request do develop — tytuł i opis gotowe do scalenia
---

Przygotowujemy pull request z bieżącej gałęzi do `develop`.

1. **Sprawdzenia (przerwij i powiedz mi, jeśli coś nie gra):**
   - bieżąca gałąź nie jest `main` ani `develop`;
   - brak niezacommitowanych zmian (`git status`) — jeśli są, zaproponuj commit;
   - gałąź jest wypchnięta (`git status` / `git log origin/<gałąź>..HEAD`);
   - jeśli to zadanie z kodem: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` przechodzą — podaj wynik.
2. **Zbierz kontekst:** `git log develop..HEAD --oneline`, `git diff develop...HEAD --stat`, przejrzyj diff, `docs/STAN.md` („W toku”), sesję w `docs/zadania/fundament.md` albo specyfikację strony.
3. **Tytuł** — Conventional Commits, po polsku, max ~70 znaków, opisuje efekt całej gałęzi (nie ostatni commit, nigdy „wip”):
   - `feat(zakres): …` nowa funkcja · `fix(zakres): …` poprawka · `chore: …` konfiguracja/narzędzia · `docs: …` dokumentacja · `refactor: …` · `test: …`
   - zakres (opcjonalny): `fundament`, `tenant`, `panel`, `formularze`, `seo`, `marka`, `biznes`, `ci`, `docker` …
   - przykład: `feat(fundament): S3 — tenanci i routing po domenie`
4. **Opis** — wypełnij szablon `.github/pull_request_template.md`. Konkretnie, bez lania wody, bez sekcji „N/D” jeśli nic nie wnosi:
   - **Co** — 3–7 punktów: co zmienia się w zachowaniu / strukturze (nie lista plików),
   - **Dlaczego** — 1–2 zdania + odnośnik do sesji / specyfikacji / ADR,
   - **Jak sprawdzić** — kroki, które ja (albo szef na stagingu) mogę wykonać,
   - **Checklista** — zaznacz `[x]` tylko to, co faktycznie sprawdziłeś,
   - **Ryzyka i uwagi** — migracje, nowe zmienne środowiskowe, rzeczy celowo poza zakresem.
5. Pokaż mi tytuł i opis. **Czekaj na „ok”** (mogę poprawić).
6. Po akceptacji: zapisz opis do pliku tymczasowego poza repo i uruchom
   `gh pr create --base develop --head <gałąź> --title "<tytuł>" --body-file <plik>`,
   a jeśli PR już istnieje — `gh pr edit --title … --body-file …`. Podaj link do PR.
7. Przypomnij: scalam przez **Squash and merge** dopiero przy zielonym CI; potem `.\scripts\start.ps1`.
