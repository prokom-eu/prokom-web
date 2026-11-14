# START — nowa pro-kom.eu (hub) w Claude Code

14.11.2026 · dla Krystiana. Wizualizacja: https://claude.ai/artifact/JPYzSjm9XgMNgasPjm8BHx

**H0 jest zrobione z czatu:** dokumentacja huba jest w repo (PR `docs/prokomeu` → `develop`), ADR-H001/H002 przyjęte, `CLAUDE.md`, `docs/STAN.md`, `docs/README.md` i `docs/sposob-pracy.md` uzupełnione. D1 i D2 (elementy wspólne) są scalone — nic nie blokuje startu.

## Co robisz (raz, ok. 10 min)
1. Scal PR `docs: paczka huba pro-kom.eu (H0)` na GitHubie (squash).
2. W głównym folderze repo `prokom-web` (PowerShell):
   ```
   git fetch
   git worktree add ..\prokom-web-hub -b hub/h1-start origin/develop
   git -C ..\prokom-web-hub branch --unset-upstream
   Copy-Item .env ..\prokom-web-hub\.env
   ```
3. W `..\prokom-web-hub\.env` ustaw `PORT=3004` i w `DATABASE_URL` bazę `prokom_web_hub`.
4. `cd ..\prokom-web-hub` → `.\scripts\start.ps1` (zależności, baza, migracje) → `pnpm seed`.
5. Otwórz Claude Code w `prokom-web-hub` i wklej prompt **H1** z `docs/zadania/prokomeu.md` §2.

## Dalej
H1 → H2 → H4 → H3 → H5 → H6 → H7 (prompty w tym samym pliku). Każda sesja: jeden plan → Twoja akceptacja → PR-y piętrowo; kolejne wieczory `/zadanie H… — kontynuacja wg STAN`.
Po każdym PR z UI (5–10 min): plansza w Play obok, ciemny i jasny motyw, telefon w ręku; żadnych cen, WhatsAppa, „gratis”, zdjęć ludzi; konfiguracja/montaż/szkolenie tylko jako opcja.

## Zanim H7-2 (produkcja)
Akceptacja szefa · transfer DNS pro-kom.eu z nazwa.pl (albo dostęp do rekordu A) · polityka prywatności od prawnika · decyzje z `docs/strony/prokomeu-pytania.md`.
