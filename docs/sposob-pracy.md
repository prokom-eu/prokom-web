# Sposób pracy — dwa komputery (firma + dom)

Krystian pracuje nad projektem na komputerze w firmie (Rabka) i w domu, także wieczorami i w weekendy. Cel: na każdym komputerze w każdej chwili jest **to samo**, bez ręcznego kopiowania i bez „to zostało na tamtym komputerze”.

## Zasada główna
Każdy rodzaj rzeczy ma **jedno** miejsce i **jeden** kanał synchronizacji. Niczego nie kopiujemy ręcznie (pendrive, mail do siebie).

| Co | Gdzie żyje | Jak się synchronizuje |
|---|---|---|
| Czaty, projekt Claude „PRO-KOM Cyfryzacja”, `00-STAN-PROJEKTU`, dokument FINAL, pamięć Claude | claude.ai (to samo konto) | automatycznie |
| Zadania, terminy, akceptacje szefa | Asana (firmowa) | automatycznie |
| Kod i dokumentacja techniczna (`CLAUDE.md`, `docs/`, ADR, `STAN.md`) | GitHub `prokom-eu/prokom-web` | **git**: `pull` na start, `push` na koniec |
| Pliki nie-kodowe: `marka`, `materialy`, `notatki` | dysk w chmurze | automatycznie (aplikacja dysku) |
| Hasła, wartości `.env`, kody odzyskiwania 2FA | menedżer haseł | automatycznie |
| Lokalna baza i media testowe | Docker na każdym komputerze | **nie synchronizujemy** — odtwarza je `pnpm seed` |
| Dane produkcyjne (zapytania klientów) | tylko serwer | nigdy nie kopiujemy na komputery (RODO) |

**Historia sesji Claude Code jest lokalna** (zostaje na komputerze, na którym pracowałem). Ciągłość między komputerami niesie `docs/STAN.md` — `/koniec-sesji` zapisuje tam dokładny następny krok, a nowa sesja na drugim komputerze zaczyna od jego przeczytania.

## Układ folderów (identyczny na obu komputerach)
```
D:\PRO-KOM\            (albo C:\PRO-KOM\, jeśli nie ma dysku D:)
├─ repos\              ← TYLKO git. NIGDY w folderze synchronizowanym chmurą.
│  └─ prokom-web\
├─ marka\              ┐
├─ materialy\          ├─ synchronizowane dyskiem w chmurze
└─ notatki\            ┘
```
**Dlaczego repo nie w chmurze:** OneDrive / Google Drive synchronizują pliki w trakcie pracy gita i `pnpm` — psują `.git`, tworzą konflikty i mielą tysiące plików z `node_modules`. Repo synchronizuje wyłącznie git.

## Rytm dnia

### Start pracy
```powershell
cd D:\PRO-KOM\repos\prokom-web
.\scripts\start.ps1
```
Skrypt: pobiera zmiany z GitHuba (`develop` i bieżącą gałąź), ostrzega o niezacommitowanych zmianach, uruchamia lokalną bazę w Dockerze, instaluje zależności i uruchamia migracje, jeśli na drugim komputerze doszły nowe.
Potem Claude Code: nowa sesja, „przeczytaj docs/STAN.md, kontynuujemy”, albo `/zadanie S<n>` przy nowej sesji fundamentu.

### Koniec pracy — ZAWSZE, także w połowie zadania
1. W Claude Code: `/koniec-sesji` (aktualizuje `docs/STAN.md` z następnym krokiem).
2. W PowerShell:
```powershell
.\scripts\koniec.ps1 "krótko: co zostało w toku"
```
Skrypt: robi commit `wip: …` na gałęzi zadania i wypycha go na GitHub; sprawdza, czy na żadnej gałęzi nie zostały niewypchnięte commity. Na `main` / `develop` nic nie commituje (tam tylko przez PR).

### Zasady
1. **Nigdy nie wychodzę od komputera z niewypchniętą pracą.** Commity `wip:` na gałęzi zadania są OK — przy squash merge sklejają się w jeden.
2. **Jedno zadanie = jedna gałąź**, kontynuowana na obu komputerach. Na drugim komputerze: `git switch <ta-sama-gałąź>` (skrypt start robi `pull`).
3. Zadanie skończone → w Claude Code `/przeglad`, potem `/pr` (gotowy tytuł i opis, PR zakładany przez `gh`) → zielone CI → **Squash and merge** → `.\scripts\start.ps1` (wraca na aktualny `develop`). Tytuł PR zostaje w historii `develop` — nigdy „wip”.
4. Konflikt albo „coś się rozjechało” → nie kombinuję z `--force`; `git status`, zrzut ekranu i pytanie w czacie.

## Konfiguracja nowego komputera (jednorazowo, ok. 30 min)
1. Zainstaluj: Git for Windows, Node.js (wersja z `.nvmrc`), Docker Desktop, Claude Code, GitHub CLI (`winget install GitHub.cli`).
2. `corepack enable` (pnpm w wersji z `package.json`).
3. `gh auth login` — moje konto GitHub (2FA).
4. Pozwolenie na skrypty (raz, dla mojego użytkownika): `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
5. Klon: `git clone https://github.com/prokom-eu/prokom-web.git D:\PRO-KOM\repos\prokom-web`.
6. W repo:
   ```powershell
   git config user.name "Krystian Potaczek"
   git config user.email "<e-mail z konta GitHub>"
   git config core.autocrlf false
   git config pull.ff only
   ```
7. `.env` — skopiuj `.env.example` do `.env` i uzupełnij wartości lokalne z menedżera haseł (wpis „prokom-web .env lokalny”).
8. `.\scripts\start.ps1`, potem `pnpm seed` (dane testowe).
9. Aplikacja dysku w chmurze: synchronizuj `marka`, `materialy`, `notatki` — NIE `repos`.

## Bezpieczeństwo
- Konto GitHub i menedżer haseł z 2FA na obu komputerach.
- Komputer domowy: szyfrowanie dysku (BitLocker / szyfrowanie urządzenia), hasło do konta Windows, blokada ekranu.
- `.env` nigdy w gicie (pilnuje `.gitignore` i gitleaks w CI); wartości przenoszę tylko przez menedżer haseł.
- Na komputery nie ściągamy kopii baz produkcyjnych ani danych klientów — praca na `pnpm seed` i stagingu.

## Gdy coś nie gra
| Objaw | Co zrobić |
|---|---|
| `start.ps1`: „masz niezacommitowane zmiany” | sprawdź `git status`; jeśli to Twoja praca — `.\scripts\koniec.ps1 "opis"` i ponownie start |
| `git pull` odmawia (rozjechana historia) | nie używaj `--force`; `git status` + `git log --oneline -5` → pytanie w czacie |
| Na drugim komputerze brakuje danych w panelu | normalne — lokalna baza jest per komputer; `pnpm seed` |
| Błąd migracji po `pull` | `pnpm payload migrate`; jeśli dalej błąd — lokalnie można odtworzyć bazę od zera (`docker compose ... down -v`, `up -d`, `migrate`, `seed`) |
| Zapomniałem wypchnąć pracę z drugiego komputera | nie zaczynaj tej samej gałęzi od nowa — dokończ na tamtym komputerze albo zacznij inną sesję/zadanie |
