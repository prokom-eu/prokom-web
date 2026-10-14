# prokom-web - konfiguracja komputera do pracy (jednorazowo; mozna uruchamiac wielokrotnie)
#
# Uruchom w ZWYKLYM oknie PowerShell (NIE "Administrator"):
#   powershell -ExecutionPolicy Bypass -File .\setup-komputera.ps1
# albo, gdy repo juz jest:
#   .\scripts\setup-komputera.ps1
#
# Co robi:
#  1. instaluje przez winget: Git, PowerShell 7, GitHub CLI, fnm (Node), Starship (prompt), Docker Desktop
#  2. Node LTS przez fnm + pnpm (corepack)
#  3. profil PowerShell 7: fnm (automatyczna wersja Node z .nvmrc) + Starship (galaz i stan repo w prompcie)
#  4. globalna konfiguracja gita (dobre praktyki) + Twoje imie i e-mail
#  5. logowanie gh i klon repo prokom-web (jesli go nie ma) + safe.directory
# Opis: docs/sposob-pracy.md

param(
    [string]$RepoPath = "D:\PRO-KOM\repos\prokom-web",
    [string]$RepoUrl  = "https://github.com/prokom-eu/prokom-web.git"
)

$ErrorActionPreference = 'Continue'

function Info($t)  { Write-Host $t -ForegroundColor Cyan }
function Ok($t)    { Write-Host "  OK  $t" -ForegroundColor Green }
function Warn($t)  { Write-Host "  !!  $t" -ForegroundColor Yellow }
function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
}

Write-Host ""
Info "=== prokom-web: KONFIGURACJA KOMPUTERA ==="

# 0. Nie jako administrator (pliki administratora -> 'dubious ownership' w gicie)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    Warn "To okno dziala jako Administrator. Zamknij je i uruchom skrypt w zwyklym oknie PowerShell."
    Warn "(Instalatory same poprosza o zgode administratora, gdy beda jej potrzebowaly.)"
    exit 1
}

# Pozwolenie na lokalne skrypty dla biezacego uzytkownika
try { Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force -ErrorAction Stop; Ok "ExecutionPolicy: RemoteSigned (CurrentUser)" } catch { Warn "Nie udalo sie ustawic ExecutionPolicy: $_" }

# 1. Programy przez winget
Info "`n[1/5] Programy (winget)"
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Warn "Brak winget - zainstaluj 'Instalator aplikacji' (App Installer) z Microsoft Store i uruchom skrypt ponownie."
    exit 1
}
$packages = @(
    @{ Id = 'Git.Git';               Name = 'Git' },
    @{ Id = 'Microsoft.PowerShell';  Name = 'PowerShell 7' },
    @{ Id = 'GitHub.cli';            Name = 'GitHub CLI (gh)' },
    @{ Id = 'Schniz.fnm';            Name = 'fnm (wersje Node)' },
    @{ Id = 'Starship.Starship';     Name = 'Starship (prompt)' },
    @{ Id = 'Docker.DockerDesktop';  Name = 'Docker Desktop' }
)
foreach ($p in $packages) {
    winget list --id $p.Id --exact --accept-source-agreements *> $null
    if ($LASTEXITCODE -eq 0) {
        Ok "$($p.Name) - juz zainstalowany"
    } else {
        Write-Host "  ->  instaluje $($p.Name)..."
        winget install --id $p.Id --exact --silent --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -eq 0) { Ok "$($p.Name) - zainstalowany" } else { Warn "$($p.Name) - instalacja nie powiodla sie (kod $LASTEXITCODE). Sprobuj recznie: winget install --id $($p.Id)" }
    }
}
Refresh-Path

# 2. Node LTS + pnpm
Info "`n[2/5] Node.js (fnm) i pnpm"
if (Get-Command fnm -ErrorAction SilentlyContinue) {
    fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
    fnm install --lts
    fnm default lts-latest
    fnm use lts-latest
    Ok "Node: $(node --version)"
    if (Get-Command corepack -ErrorAction SilentlyContinue) {
        corepack enable
    } else {
        npm install -g corepack | Out-Null
        corepack enable
    }
    if (Get-Command pnpm -ErrorAction SilentlyContinue) { Ok "pnpm: $(pnpm --version)" } else { Warn "pnpm niedostepny - po restarcie terminala: corepack enable" }
    Write-Host "  (dokladna wersje Node dla projektu ustali plik .nvmrc w repo - fnm przelaczy sie sam)"
} else {
    Warn "fnm niedostepny w tej sesji - zamknij terminal, otworz nowy i uruchom skrypt jeszcze raz."
}

# 3. Profil PowerShell 7 (fnm + Starship)
Info "`n[3/5] Profil PowerShell 7"
$docs = [Environment]::GetFolderPath('MyDocuments')
$profilePath = Join-Path $docs 'PowerShell\Microsoft.PowerShell_profile.ps1'
New-Item -ItemType Directory -Force -Path (Split-Path $profilePath) | Out-Null
if (-not (Test-Path $profilePath)) { New-Item -ItemType File -Path $profilePath | Out-Null }
$profileText = Get-Content $profilePath -Raw
if ($null -eq $profileText) { $profileText = '' }
$marker = '# >>> prokom-web <<<'
if ($profileText -notmatch [regex]::Escape($marker)) {
    $block = @"

$marker
if (Get-Command fnm -ErrorAction SilentlyContinue) { fnm env --use-on-cd --version-file-strategy=recursive --shell powershell | Out-String | Invoke-Expression }
if (Get-Command starship -ErrorAction SilentlyContinue) { Invoke-Expression (&starship init powershell) }
# <<< prokom-web >>>
"@
    Add-Content -Path $profilePath -Value $block -Encoding UTF8
    Ok "Dopisano fnm + Starship do: $profilePath"
} else {
    Ok "Profil juz skonfigurowany: $profilePath"
}

# 4. Git - konfiguracja globalna
Info "`n[4/5] Git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Warn "git niedostepny w tej sesji - otworz nowy terminal i uruchom skrypt ponownie."; exit 1 }
$name  = git config --global user.name
$email = git config --global user.email
if (-not $name)  { $name  = Read-Host "  Imie i nazwisko do commitow (np. Krystian Potaczek)"; git config --global user.name  "$name" }
if (-not $email) { $email = Read-Host "  E-mail z konta GitHub";                             git config --global user.email "$email" }
git config --global init.defaultBranch main
git config --global pull.ff only
git config --global fetch.prune true
git config --global push.autoSetupRemote true
git config --global rerere.enabled true
git config --global core.autocrlf false
git config --global alias.lg "log --oneline --graph --decorate -20"
git config --global alias.st "status -sb"
Ok "Git: $name <$email>; pull.ff only, fetch.prune, push.autoSetupRemote, rerere, aliasy lg/st"

# 5. GitHub CLI + repo
Info "`n[5/5] GitHub i repozytorium"
if (Get-Command gh -ErrorAction SilentlyContinue) {
    gh auth status *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ->  logowanie do GitHuba (HTTPS, 'Authenticate Git' = Yes, przez przegladarke)"
        gh auth login --hostname github.com --git-protocol https --web
    }
    gh auth status *> $null
    if ($LASTEXITCODE -eq 0) { Ok "gh zalogowany" } else { Warn "gh niezalogowany - uruchom: gh auth login" }
} else {
    Warn "gh niedostepny w tej sesji - otworz nowy terminal i uruchom skrypt ponownie."
}

if (-not (Test-Path (Join-Path $RepoPath '.git'))) {
    New-Item -ItemType Directory -Force -Path (Split-Path $RepoPath) | Out-Null
    git clone $RepoUrl $RepoPath
    if ($LASTEXITCODE -eq 0) { Ok "Sklonowano repo do $RepoPath" } else { Warn "Klonowanie nie powiodlo sie - sprawdz logowanie gh i dostep do prokom-eu." }
} else {
    Ok "Repo juz jest: $RepoPath"
}
$safe = ($RepoPath -replace '\\','/')
$existing = git config --global --get-all safe.directory
if ($existing -notcontains $safe) { git config --global --add safe.directory $safe }
Ok "safe.directory: $safe"

# Podsumowanie
Write-Host ""
Info "=== GOTOWE ==="
Write-Host "Zrob jeszcze recznie (jednorazowo):" -ForegroundColor Yellow
Write-Host "  1. Windows Terminal -> Ctrl+, -> Uruchamianie -> Profil domyslny: 'PowerShell' (czarna ikona) -> Zapisz."
Write-Host "     Profile -> PowerShell -> Katalog startowy: $RepoPath ; 'Uruchom jako Administrator' = wylaczone."
Write-Host "  2. Docker Desktop: uruchom raz i przejdz konfiguracje (WSL 2)."
Write-Host "  3. Claude Code: sprawdz 'claude --version' i zaloguj sie, jesli trzeba."
Write-Host "  4. .env: skopiuj .env.example do .env (gdy bedzie w repo) i uzupelnij z menedzera hasel."
Write-Host "  5. Zamknij ten terminal i otworz nowy - zaladuje sie profil (fnm + Starship)."
Write-Host ""
Write-Host "Potem w repo: .\scripts\start.ps1" -ForegroundColor Cyan
