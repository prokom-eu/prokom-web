---
description: Start sesji Instalacji w worktree prokom-instal (git, rebase, stos, STAN)
---
Zaczynamy sesję linii Instalacje. Wykonaj po kolei i pokaż krótkie podsumowanie:

1. Sprawdź, że jesteśmy w worktree `prokom-instal` (`git rev-parse --show-toplevel`, `git worktree list`). Jeśli nie — zatrzymaj się i powiedz to.
2. `git status` — jeśli są niezacommitowane zmiany, pokaż je i zapytaj, co z nimi zrobić. Nic nie usuwaj.
3. `git fetch origin` i pokaż, czy `origin/develop` ma nowe commity od ostatniej sesji (szczególnie zmiany w strefie wspólnej z ADR-I001 §3, migracje, `package.json`).
4. Jeśli jesteśmy na gałęzi `inst/*` z otwartą pracą — `git rebase origin/develop` (przy konflikcie w pliku generowanym: weź develop i wygeneruj ponownie; przy konflikcie w migracji: ADR-I001 §4). Jeśli zaczynamy nowe zadanie — utwórz gałąź `inst/<sesja>-<opis>` z `origin/develop`.
5. Środowisko (zwykle zrobione przez `.\scripts\start.ps1` uruchomiony przez Krystiana przed sesją): kontener `docker compose -f docker/compose.dev.yml up -d` (wspólny dla wszystkich folderów prokom-web), `pnpm install`, `pnpm payload migrate` na bazie z `DATABASE_URL` tego folderu (`prokom_web_instalacje`). Sprawdź, że `.env` ma `PORT=3002`. Serwer: `pnpm dev` → `http://instalacje.localhost:3002`, panel `http://panel.localhost:3002/admin`. Nie zatrzymuj kontenera bazy — korzystają z niego Biznes i Software.
6. Przeczytaj `docs/stan/STAN-instalacje.md` i powiedz: co jest w toku, jaki jest następny krok, jakie są otwarte pytania.
7. Przypomnij Definition of Done z `docs/strony/prokominstalacje.md` §10 i `MOBILE-APLIKACJA.md` §10.
