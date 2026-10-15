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
- **Decyzje przed S2.** Gałąź: `docs/decyzje-przed-s2`. Zrobione: ADR-008 przyjęty (dokumentacja bibliotek z `node_modules`, kolejność źródeł w `CLAUDE.md`), ADR-009 (`push` wyłączony także lokalnie, schemat tylko przez migracje), zasady logowania w S2 (5 prób → blokada 15 min, hasło min. 12 znaków), projekt strony głównej prokombiznes (PDF) w `docs/strony/`. Następny krok: PR → scalenie → nowa sesja `/zadanie S2`. Do sprawdzenia przy okazji: hak Prettiera w nowej sesji Claude Code (edycja `.ts` ze złym formatem); log pierwszego przebiegu Dependabota.

## Zrobione
- 15.10.2026 — S1b scalone (#9): CI (lint/format/typecheck/test/build/e2e + gitleaks), kontrola tytułu PR, Dependabot, haki git (husky + lint-staged + gitleaks), hak Prettiera i subagent `recenzent` w Claude Code. CI na `develop` zielone. Dependabot otworzył pierwsze PR-y (#10–#14; #7 — poprawki bezpieczeństwa do scalenia po zielonym CI).
- 15.10.2026 — S1a scalone (#6): szkielet Next 16.3.8 + Payload 3.90.2, pnpm 11, TS strict, ESLint/Prettier, Vitest, Playwright, `lib/env.ts`, `docker/compose.dev.yml`.
- 15.10.2026 — brief wizualny prokombiznes.pl (szkic do akceptacji) przeniesiony do `docs/strony/prokombiznes-design.md`, link w specyfikacji.
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
- Przy pierwszej produkcji: komenda `/raport-tygodnia` — scalone PR-y z tygodnia + STAN → 5 linijek statusu do Asany (prostym językiem dla szefa).
- S2: gdy będą migracje — e2e w CI na zbudowanej aplikacji (`pnpm start` + `payload migrate`) zamiast `pnpm dev` (bliżej produkcji, szybciej).
- CI: `--max-old-space-size=8000` w skrypcie `build` (z szablonu) przekracza RAM runnera GitHub (~8 GB) — obniżyć do ~6144, gdy build urośnie albo pojawi się exit 137.

## Otwarte pytania
- **16.10 (Krystian, przy zakupie):** domeny na firmę (abonent PRO-KOM) i konto rejestratora na firmowy e-mail z 2FA i autoodnawianiem (`docs/dns.md`).
- Z jakiego adresu wychodzą maile z formularzy (domena nadawcy) — decyzja w S8.
- Okres retencji zapytań (domyślnie 24 miesiące, ADR-003) — potwierdzić przy polityce prywatności.
- Telefony i adresy e-mail dla każdej strony; kto odbiera powiadomienia o zapytaniach.
- Serwery i sieć: Biznes czy Instalacje? Ceny na stronie czy „Zapytaj o ofertę”? (do specyfikacji Biznes)
