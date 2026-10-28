---
description: Koniec sesji Instalacji — aktualizacja STAN-instalacje.md (przed /pr)
---
Kończymy sesję linii Instalacje. Ta komenda idzie **przed `/pr`**, żeby STAN był w tym samym PR co praca. Jeśli gałąź jest już scalona — zatrzymaj się i powiedz to (STAN zapisze następna sesja na nowej gałęzi).

1. `git status` i `git log origin/develop..HEAD --oneline` — podsumuj, co zrobiliśmy.
2. Zaktualizuj `docs/stan/STAN-instalacje.md`:
   - data i sesja w „Ostatnia aktualizacja”,
   - „W toku”: gałąź, co niedokończone (konkretnie: plik, sekcja, co zostało), **następny krok jednym zdaniem z promptem do skopiowania**,
   - „Zrobione”: wiersz z datą, sesją, numerem PR (jeśli jest) i jednym zdaniem,
   - nowe decyzje (krótko) i nowe pytania do Krystiana/szefa,
   - pomysły spoza zakresu → „Pomysły na później”.
3. Nie aktualizuj `docs/STAN.md` (to plik innych linii) — chyba że zmieniło się coś wspólnego dla całego repo; wtedy jedno zdanie.
4. Commit zmian w STAN na bieżącej gałęzi („docs(instalacje): stan po <sesja>”).
5. Zadanie skończone → teraz `/pr`. Zadanie niedokończone → przypomnij: `scripts\koniec.ps1 "<co w toku>"` (push gałęzi). Zamknij `pnpm dev` tego folderu, jeśli nie będzie potrzebny (kontenera bazy nie zatrzymuj — jest wspólny).
