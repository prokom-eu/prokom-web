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

## Konfiguracja nowego komputera (jednorazowo, ok. 15 min)
Wszystko robi `scripts/setup-komputera.ps1` (można uruchamiać wielokrotnie — pomija to, co już jest).

1. **Zwykłe** okno PowerShell (NIE „Administrator”). Na nowym komputerze, gdzie repo jeszcze nie ma: pobierz `scripts/setup-komputera.ps1` z GitHuba (repo → plik → „Download raw file”) i uruchom:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\setup-komputera.ps1
   ```
   Gdy repo już jest: `.\scripts\setup-komputera.ps1`.
2. Skrypt:
   - instaluje (winget): Git, PowerShell 7, GitHub CLI, fnm (wersje Node), Starship (prompt z gałęzią), Docker Desktop;
   - Node LTS przez fnm + pnpm (corepack); dokładną wersję dla projektu ustala `.nvmrc`, a fnm przełącza ją sam po wejściu do repo;
   - dopisuje do profilu PowerShell 7: fnm + Starship;
   - ustawia globalnie gita: `pull.ff only`, `fetch.prune`, `push.autoSetupRemote`, `rerere`, `core.autocrlf false`, czytelniejsze konflikty (`merge.conflictstyle zdiff3`) i diffy (`diff.algorithm histogram`, `diff.colorMoved`), `rebase.autoStash`, gałęzie od najnowszych (`branch.sort`), diff w edytorze opisu commita (`commit.verbose`), aliasy `git lg` i `git st`, imię i e-mail;
   - loguje `gh` (HTTPS, przez przeglądarkę), klonuje repo do `D:\PRO-KOM\repos\prokom-web`, dodaje `safe.directory`;
   - **podpisywanie commitów kluczem SSH:** tworzy klucz `~/.ssh/id_ed25519_signing` (osobny na każdym komputerze, bez hasła — służy tylko do podpisu), włącza `commit.gpgsign`, dodaje klucz na GitHub jako *Signing key* (raz poprosi w przeglądarce o zgodę `admin:ssh_signing_key`). Efekt: commity na GitHubie mają znaczek **Verified**; squash merge robi GitHub i podpisuje go sam.
3. Ręcznie (skrypt przypomina na końcu):
   - Windows Terminal → Ctrl+, → Uruchamianie → Profil domyślny: „PowerShell” (czarna ikona, nie „Windows PowerShell”); Profile → PowerShell → Katalog startowy = folder repo; „Uruchom jako Administrator” = wyłączone;
   - Docker Desktop — pierwsze uruchomienie (WSL 2);
   - Claude Code — `claude --version`, logowanie;
   - `.env` — `.env.example` → `.env`, wartości z menedżera haseł (wpis „prokom-web .env lokalny”);
   - aplikacja dysku w chmurze: synchronizuj `marka`, `materialy`, `notatki` — NIE `repos`;
   - e-mail w gicie (`git config user.email` w repo) = e-mail **zweryfikowany** na koncie GitHub — inaczej podpis nie da znaczka Verified.
4. Nowy terminal → `.\scripts\start.ps1` → `pnpm seed` (gdy projekt ma już kod).

**Do pracy nad projektem NIGDY nie używaj okna „Administrator”** — pliki utworzone jako administrator należą do innego właściciela i git zgłasza „dubious ownership”. Administrator tylko do instalowania programów (instalatory same o to poproszą).

## Nawyki (tak pracuje senior)
1. **Czytam diff przed każdym commitem:** `git diff --staged` — linia po linii. Nie commituję kodu, którego nie umiem wyjaśnić. Claude Code pisze szybko, odpowiedzialność za kod jest moja.
2. **Jedna rzecz naraz:** jedna gałąź w toku. Pomysł w trakcie → `docs/STAN.md` → „Pomysły na później”, powrót do zadania.
3. **Świeży kontekst:** w Claude Code `/clear` (albo nowa sesja) między zadaniami; każde zadanie zaczyna się od planu (`/zadanie`) w trybie planowania.
4. **Test najpierw tam, gdzie błąd kosztuje pieniądze** (izolacja tenantów, formularz, retencja, seed). Gdzie indziej testów nie dopisujemy na siłę.
5. **Małe PR-y:** do ~400 linii diffu; większe dzielę. Mały PR łatwiej sprawdzić i łatwiej cofnąć.
6. **Kopia działa tylko wtedy, gdy była odtworzona:** próbne odtworzenie raz w miesiącu (`docs/wdrozenia.md`).
7. **Narzędzia zamrożone do 26.10:** nowe pomysły na narzędzia i automaty → „Pomysły na później”. Najpierw dowozimy strony.

## Bezpieczeństwo
- Konto GitHub i menedżer haseł z 2FA na obu komputerach. **Kody odzyskiwania 2FA** (GitHub, rejestrator domen, Seohost, menedżer haseł) zapisane w menedżerze haseł — zgubiony telefon nie może oznaczać utraty konta.
- Domeny i konta dostawców (rejestrator, Seohost) na dane i e-mail firmy, nie prywatne — `docs/dns.md`.
- Komputer domowy: szyfrowanie dysku (BitLocker / szyfrowanie urządzenia), hasło do konta Windows, blokada ekranu.
- `.env` nigdy w gicie (pilnuje `.gitignore` i gitleaks w CI); wartości przenoszę tylko przez menedżer haseł.
- Na komputery nie ściągamy kopii baz produkcyjnych ani danych klientów — praca na `pnpm seed` i stagingu.

## Gdy coś nie gra
| Objaw | Co zrobić |
|---|---|
| `dubious ownership` przy komendach git | okno było „Administrator” albo repo założone jako admin → zwykły terminal + `git config --global --add safe.directory <ścieżka-repo-z-ukośnikami-/>` |
| krzaki zamiast polskich znaków w commitach | używasz starego „Windows PowerShell” 5.1 → przełącz na PowerShell 7 |
| w terminalu pojawia się `>>` | wkleiłeś kilka linii naraz — wklejaj po jednej komendzie |
| `start.ps1`: „masz niezacommitowane zmiany” | sprawdź `git status`; jeśli to Twoja praca — `.\scripts\koniec.ps1 "opis"` i ponownie start |
| `git pull` odmawia (rozjechana historia) | nie używaj `--force`; `git status` + `git log --oneline -5` → pytanie w czacie |
| Na drugim komputerze brakuje danych w panelu | normalne — lokalna baza jest per komputer; `pnpm seed` |
| Błąd migracji po `pull` | `pnpm payload migrate`; jeśli dalej błąd — lokalnie można odtworzyć bazę od zera (`docker compose ... down -v`, `up -d`, `migrate`, `seed`) |
| Commit bez znaczka **Verified** na GitHubie | `git config user.email` ≠ e-mail zweryfikowany na GitHubie albo klucz nie dodany jako *Signing key* (GitHub → Settings → SSH and GPG keys) → uruchom ponownie `.\scripts\setup-komputera.ps1` |
| `error: ... ssh-keygen` / `failed to write commit object` przy commicie | brak klienta OpenSSH: Ustawienia → System → Funkcje opcjonalne → „Klient OpenSSH” → zainstaluj; nie wyłączaj podpisywania |
| Zapomniałem wypchnąć pracę z drugiego komputera | nie zaczynaj tej samej gałęzi od nowa — dokończ na tamtym komputerze albo zacznij inną sesję/zadanie |
