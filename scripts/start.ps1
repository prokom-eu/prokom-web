# prokom-web - start pracy (firma lub dom)
# Uzycie:  .\scripts\start.ps1
# Pobiera zmiany z GitHuba, sprawdza stan repo, uruchamia lokalna baze i zaleznosci.
# Opis: docs/sposob-pracy.md

$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host ""
Write-Host "=== prokom-web: START PRACY ===" -ForegroundColor Cyan

# 1. Niezacommitowane zmiany - zatrzymaj, zeby niczego nie nadpisac
$dirty = git status --porcelain
if ($dirty) {
    Write-Warning "Masz niezacommitowane zmiany:"
    git status --short
    Write-Warning "Najpierw je zapisz: .\scripts\koniec.ps1 `"opis`"  (albo git stash). Przerywam."
    exit 1
}

# 2. Pobierz wszystko z GitHuba
git fetch --prune --quiet
if ($LASTEXITCODE -ne 0) { Write-Warning "Nie udalo sie pobrac zmian z GitHuba (internet / logowanie?)."; exit 1 }

$branch = (git rev-parse --abbrev-ref HEAD).Trim()

# 3. Zaktualizuj develop
git switch develop --quiet
git pull --ff-only --quiet
if ($LASTEXITCODE -ne 0) { Write-Warning "develop nie da sie zaktualizowac bez scalania - sprawdz git status i zapytaj w czacie."; exit 1 }

# 4. Wroc na galaz zadania i ja zaktualizuj
if ($branch -ne 'develop') {
    git rev-parse --verify --quiet "refs/remotes/origin/$branch" *> $null
    $hasRemote = ($LASTEXITCODE -eq 0)
    git rev-parse --verify --quiet "refs/heads/$branch" *> $null
    $hasLocal = ($LASTEXITCODE -eq 0)

    if ($hasLocal -and -not $hasRemote -and $branch -ne 'main') {
        Write-Host "Galaz '$branch' nie istnieje juz na GitHubie (pewnie scalona). Zostajesz na develop." -ForegroundColor Yellow
        Write-Host "Usun ja lokalnie, jesli scalona:  git branch -D $branch" -ForegroundColor Yellow
        $branch = 'develop'
    } else {
        git switch $branch --quiet
        if ($hasRemote) {
            git pull --ff-only --quiet
            if ($LASTEXITCODE -ne 0) { Write-Warning "Galaz '$branch' rozjechala sie z GitHubem - nie uzywaj --force, zapytaj w czacie."; exit 1 }
        }
    }
}

Write-Host ""
Write-Host "Galaz: $branch" -ForegroundColor Green
git log --oneline -3

# 5. Docker (lokalna baza + Mailpit)
docker info *> $null
$dockerOk = ($LASTEXITCODE -eq 0)
if (-not $dockerOk) {
    Write-Warning "Docker Desktop nie dziala - uruchom go i odpal skrypt jeszcze raz."
} elseif (Test-Path "docker/compose.dev.yml") {
    docker compose -f docker/compose.dev.yml up -d
}

# 6. Zaleznosci i migracje (gdy projekt juz ma kod - od sesji S1)
if (Test-Path "package.json") {
    pnpm install --frozen-lockfile
    if ((Test-Path ".env") -and $dockerOk) {
        pnpm payload migrate
    } elseif (-not (Test-Path ".env")) {
        Write-Warning "Brak pliku .env - skopiuj .env.example do .env i uzupelnij wartosci z menedzera hasel."
    }
}

# 7. Co dalej
Write-Host ""
Write-Host "Gotowe. Nastepny krok wg docs/STAN.md:" -ForegroundColor Cyan
$stan = Get-Content "docs/STAN.md" -Encoding UTF8
$start = ($stan | Select-String -Pattern '^## W toku' | Select-Object -First 1).LineNumber
if ($start) {
    foreach ($line in ($stan | Select-Object -Skip $start)) {
        if ($line -match '^## ') { break }
        Write-Host $line
    }
}
Write-Host ""
Write-Host "Claude Code: nowa sesja -> 'Przeczytaj docs/STAN.md, kontynuujemy' albo /zadanie S<n>" -ForegroundColor Cyan
