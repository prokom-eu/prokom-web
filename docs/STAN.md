# STAN — prokom-web

Aktualizuj po każdej sesji (`/koniec-sesji`). Najnowsze na górze.

## Cel października 2026
| Etap | Termin | Status |
|---|---|---|
| Fundament (S1–S9 lokalnie, S10 na serwerze) — `docs/zadania/fundament.md` | S1–S9: 15–21.10 · S10: po dostawie VPS | ⏳ start |
| prokombiznes.pl — specyfikacja (czat „Spec · prokombiznes.pl”) | po fundamencie | ⏳ szkic w `strony/prokombiznes.md` |
| prokombiznes.pl — wdrożenie | 26.10 | ⏳ |
| prokominstalacje.pl | 29.10 | ⏳ |
| prokomsoftware.pl | 31.10 | ⏳ |

## W toku
- S1 podzielona na dwa PR-y (`docs/zadania/fundament.md` → S1).
  - **S1a — szkielet aplikacji i lokalna bramka jakości.** Gałąź: `feat/fundament-s1a-szkielet`. Zrobione: Payload 3.90.2 + Next 16.3.8 (szablon blank/PostgreSQL), Node 24.22.0 (`.nvmrc`), pnpm 11.28.2 (`packageManager`, ustawienia w `pnpm-workspace.yaml`), ESLint/Prettier/TS strict, Vitest (test `lib/env`), Playwright (strona i `/admin` startują), `src/lib/env.ts` (Zod) + `.env.example`, `docker/compose.dev.yml` (PostgreSQL 17 na porcie 54320 + Mailpit). Lint/typecheck/test/build/test:e2e zielone, `/admin` pokazuje „Create first user”. Następny krok: przegląd diffu przez Krystiana → commit → `/przeglad` → `/pr`.
  - **S1b — automaty (osobny PR, po scaleniu S1a):** `.github/workflows/ci.yml` (install → lint → typecheck → test → build → gitleaks; build z testowymi wartościami env), Dependabot, husky + lint-staged + gitleaks w haku, kontrola tytułu PR, hak Prettiera w `.claude/settings.json`, subagent `recenzent`, ADR o MCP z aktualną dokumentacją bibliotek. Następny krok: `/zadanie S1b` w trybie planowania.

## Zrobione
- 15.10.2026 — uzupełnienia fundamentu: `docs/dns.md` (własność domen, rekordy, SPF/DKIM/DMARC); retencja zapytań w ADR-003 i S8; logi strukturalne i smoke test w S9; budżet Lighthouse CI, poczta i automatyczny powrót w S10; podpisywanie commitów SSH i lepsze ustawienia gita w `setup-komputera.ps1`; nawyki pracy w `CLAUDE.md` i `sposob-pracy.md`.
- 14.10.2026 — `scripts/setup-komputera.ps1` (konfiguracja komputera jedną komendą); `start.ps1` przełącza Node z `.nvmrc` (fnm); zakres S1 rozszerzony o haki git, kontrolę tytułu PR, haki i recenzenta w Claude Code.
- 14.10.2026 — sposób pracy na dwóch komputerach (`docs/sposob-pracy.md`, `scripts/start.ps1`, `scripts/koniec.ps1`).
- 14.10.2026 — organizacja GitHub firmy `prokom-eu` skonfigurowana (2FA wymagane, uprawnienia członków ograniczone, Actions tylko GitHub + zweryfikowani twórcy). Aktualizacja dokumentacji: ADR-002 (Seohost), ADR-003 (decyzja), ADR-005, ADR-006, ADR-007, plan fundamentu, tokeny marki.
- 12.10.2026 — założenie dokumentacji repo (CLAUDE.md, docs/, komendy).

## Następne kroki
1. S1 → S9 według `docs/zadania/fundament.md`, po kolei, każda sesja = jeden PR.
2. Domeny (prokombiznes.pl, prokominstalacje.pl, prokomsoftware.pl) — zakup 16.10.
3. VPS Seohost — zamówienie w tygodniu 19–23.10 → S10 (staging).

## Pomysły na później (poza zakresem bieżących sesji)
- Przy pierwszej produkcji (26.10): wersje i lista zmian — tag `vX.Y.Z` przy wdrożeniu na `main`, automatyczny changelog z tytułów PR (dla szefa: „co nowego”, dla nas: punkt rollbacku).
- Gdy dojdzie druga osoba do kodu: plan GitHub Team (prawdziwa ochrona gałęzi `main`/`develop` w prywatnym repo). Dziś wystarcza blokada w `.claude/settings.json` + CI.
- S1b (ADR o dokumentacji bibliotek): `create-payload-app -a claude` instaluje oficjalny skill Payload dla Claude Code — rozważyć obok MCP.
- Przy pierwszej produkcji: komenda `/raport-tygodnia` — scalone PR-y z tygodnia + STAN → 5 linijek statusu do Asany (prostym językiem dla szefa).

## Otwarte pytania
- **Przed zakupem 16.10:** domeny na firmę (abonent PRO-KOM) i konto rejestratora na firmowy e-mail z 2FA i autoodnawianiem (`docs/dns.md`).
- Z jakiego adresu wychodzą maile z formularzy (domena nadawcy) — decyzja w S8.
- Okres retencji zapytań (domyślnie 24 miesiące, ADR-003) — potwierdzić przy polityce prywatności.
- Telefony i adresy e-mail dla każdej strony; kto odbiera powiadomienia o zapytaniach.
- Serwery i sieć: Biznes czy Instalacje? Ceny na stronie czy „Zapytaj o ofertę”? (do specyfikacji Biznes)
