---
description: Zamknięcie sesji — aktualizacja docs/STAN.md i podsumowanie
---

Kończymy sesję.

1. Zaktualizuj `docs/STAN.md`: zrobione (z datą) do „Zrobione”, „Następne kroki”, „Pomysły na później”, „Otwarte pytania”. W sekcji **„W toku”** zapisz dla bieżącego zadania:
   - `Gałąź:` nazwa gałęzi,
   - `Zrobione w tej sesji:` 1–3 punkty,
   - `Niedokończone:` co jest w połowie (pliki, testy, które jeszcze nie przechodzą),
   - `Następny krok:` jedno konkretne zdanie — tak, żeby nowa sesja na **drugim komputerze** (firma/dom) ruszyła bez pytań. Historia tej sesji nie przejdzie na drugi komputer — liczy się tylko to, co zapiszesz.
2. Jeśli zapadła decyzja architektoniczna — zaproponuj ADR w `docs/decyzje/` (szablon ADR-000).
3. Jeśli zmieniły się komendy, zmienne środowiskowe albo struktura — zaktualizuj `CLAUDE.md` i `.env.example`.
4. Daj mi krótkie podsumowanie (3–6 linijek): co zrobione, co dalej, czego potrzebuję — nadaje się na komentarz w Asanie.
5. Przypomnij mi o końcu pracy: `.\scripts\koniec.ps1 "<krótki opis tego, co w toku>"` — podaj gotowy opis. Jeśli zadanie jest skończone — zamiast tego zaproponuj commit (Conventional Commits) i treść PR do `develop`.
