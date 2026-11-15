# prokom-web - konfiguracja komputera do pracy (jednorazowo; mozna uruchamiac wielokrotnie)
#
# Uruchom w ZWYKLYM oknie PowerShell (NIE "Administrator"):
#   powershell -ExecutionPolicy Bypass -File .\setup-komputera.ps1
# albo, gdy repo juz jest:
#   .\scripts\setup-komputera.ps1
#
# Co robi:
#  1. instaluje przez winget: Git, PowerShell 7, GitHub CLI, fnm (Node), Starship (prompt), Docker Desktop, gitleaks
#  2. Node LTS przez fnm + pnpm (corepack)
#  3. profil PowerShell 7: fnm (automatyczna wersja Node z .nvmrc) + Starship (galaz i stan repo w prompcie)
#  4. globalna konfiguracja gita (dobre praktyki) + Twoje imie i e-mail
#  5. logowanie gh i klon repo prokom-web (jesli go nie ma) + safe.directory
#  6. podpisywanie commitow kluczem SSH (znaczek "Verified" na GitHubie)
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
Info "`n[1/6] Programy (winget)"
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
    @{ Id = 'Docker.DockerDesktop';  Name = 'Docker Desktop' },
    @{ Id = 'Gitleaks.Gitleaks';     Name = 'gitleaks (hak przed commitem)' }
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
Info "`n[2/6] Node.js (fnm) i pnpm"
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
Info "`n[3/6] Profil PowerShell 7"
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
Info "`n[4/6] Git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Warn "git niedostepny w tej sesji - otworz nowy terminal i uruchom skrypt ponownie."; exit 1 }
$name  = git config --global user.name
$email = git config --global user.email
if (-not $name)  { $name  = Read-Host "  Imie i nazwisko do commitow (np. Krystian Potaczek)"; git config --global user.name  "$name" }
if (-not $email) { $email = Read-Host "  E-mail z konta GitHub (zweryfikowany)";             git config --global user.email "$email" }
if ($name -notmatch ' ') { Warn "user.name = '$name' - wpisz pelne imie i nazwisko: git config --global user.name `"Imie Nazwisko`"" }
git config --global init.defaultBranch main
git config --global pull.ff only
git config --global fetch.prune true
git config --global push.autoSetupRemote true
git config --global rerere.enabled true
git config --global core.autocrlf false
git config --global alias.lg "log --oneline --graph --decorate -20"
git config --global alias.st "status -sb"
git config --global merge.conflictstyle zdiff3
git config --global diff.algorithm histogram
git config --global diff.colorMoved zebra
git config --global rebase.autoStash true
git config --global branch.sort -committerdate
git config --global commit.verbose true
Ok "Git: $name <$email>; pull.ff only, fetch.prune, push.autoSetupRemote, rerere, zdiff3, histogram, autoStash, aliasy lg/st"

# 5. GitHub CLI + repo
Info "`n[5/6] GitHub i repozytorium"
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

# 6. Podpisywanie commitow kluczem SSH
Info "`n[6/6] Podpisywanie commitow (SSH)"
$sshDir  = Join-Path $HOME '.ssh'
$keyPath = Join-Path $sshDir 'id_ed25519_signing'
$pubPath = "$keyPath.pub"
if (-not (Get-Command ssh-keygen -ErrorAction SilentlyContinue)) {
    Warn "Brak ssh-keygen. Ustawienia -> System -> Funkcje opcjonalne -> 'Klient OpenSSH' -> zainstaluj, potem uruchom skrypt ponownie."
} else {
    New-Item -ItemType Directory -Force -Path $sshDir | Out-Null
    if (-not (Test-Path $pubPath)) {
        Write-Host "  ->  tworze klucz do podpisywania commitow (osobny dla tego komputera)."
        Write-Host "      Na pytanie o haslo (passphrase) nacisnij Enter dwa razy - klucz sluzy tylko do podpisu."
        ssh-keygen -t ed25519 -C "$email" -f "$keyPath"
    }
    if (Test-Path $pubPath) {
        git config --global gpg.format ssh
        git config --global user.signingkey ($keyPath -replace '\\','/')
        git config --global commit.gpgsign true
        git config --global tag.gpgsign true
        # lokalna weryfikacja podpisow (git log --show-signature)
        $allowed = Join-Path $sshDir 'allowed_signers'
        $pubKey  = (Get-Content $pubPath -Raw).Trim()
        if (-not (Test-Path $allowed) -or -not (Select-String -Path $allowed -SimpleMatch $pubKey -Quiet)) {
            Add-Content -Path $allowed -Value "$email namespaces=`"git`" $pubKey" -Encoding ascii
        }
        git config --global gpg.ssh.allowedSignersFile ($allowed -replace '\\','/')
        Ok "git podpisuje commity kluczem $pubPath"

        # Klucz na GitHub jako 'Signing key' (raz na komputer)
        $marker = git config --global --get prokom.signingKeyOnGithub
        if ($marker -eq $pubKey) {
            Ok "klucz do podpisu juz jest na GitHubie"
        } elseif (Get-Command gh -ErrorAction SilentlyContinue) {
            $title = "podpis-$env:COMPUTERNAME"
            gh ssh-key add $pubPath --type signing --title $title *> $null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ->  GitHub prosi o zgode na dodawanie kluczy do podpisu (przegladarka, jednorazowo)"
                gh auth refresh --hostname github.com --scopes admin:ssh_signing_key
                gh ssh-key add $pubPath --type signing --title $title
            }
            if ($LASTEXITCODE -eq 0) {
                git config --global prokom.signingKeyOnGithub "$pubKey"
                Ok "klucz dodany na GitHub jako Signing key ($title)"
            } else {
                Warn "Nie udalo sie dodac klucza przez gh. Jesli komunikat mowi, ze klucz juz istnieje - jest OK."
                Warn "Inaczej recznie: GitHub -> Settings -> SSH and GPG keys -> New SSH key -> Key type: Signing Key -> wklej zawartosc $pubPath"
            }
        }
    }
}

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
Write-Host "  6. Kody odzyskiwania 2FA (GitHub, rejestrator domen, Seohost) zapisz w menedzerze hasel."
Write-Host "  7. Pierwszy commit: na GitHubie przy commicie ma byc znaczek 'Verified'."
Write-Host ""
Write-Host "Potem w repo: .\scripts\start.ps1" -ForegroundColor Cyan
