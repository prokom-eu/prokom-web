---
description: Start zadania — kontekst, plan, kod (stop tylko przy decyzjach)
argument-hint: <sesja fundamentu, np. S1, albo opis zadania>
---

Zaczynamy zadanie: **$ARGUMENTS**

0. Sprawdź `git status` i `git fetch`; jeśli gałąź jest za `origin` albo są niezacommitowane zmiany — powiedz mi i poczekaj (rozwiązanie: `.\scripts\start.ps1`).
1. Przeczytaj `docs/STAN.md` (zwłaszcza „W toku” → „Następny krok”). Jeśli to sesja fundamentu — jej opis w `docs/zadania/fundament.md`. Jeśli strona — specyfikację w `docs/strony/`. Sprawdź powiązane ADR w `docs/decyzje/`.
2. Gdy zadanie dotyczy API Payload / Next.js — sprawdź dokumentację zainstalowanej wersji, nie pisz z pamięci.
3. Napisz krótko (max 15 linijek):
   - cel własnymi słowami i warunki odbioru („gotowe, gdy…”),
   - pliki, które dodasz lub zmienisz,
   - nowe zależności (z uzasadnieniem) i nowe zmienne środowiskowe,
   - ryzyka i pytania — jeśli czegoś brakuje, wypisz, nie zgaduj.
4. Zaproponuj nazwę gałęzi (`feat/...`, `chore/...`, `fix/...`).
5. **Gdy prompt sesji (`PRZEKAZANIE-*.md`) jest kompletny i nie ma otwartych pytań — od razu zaczynasz kod** (bez trybu planu). Zatrzymaj się i czekaj na moją odpowiedź tylko, gdy: jest decyzja do podjęcia (pytanie z opcjami i rekomendacją), brakuje treści biznesowej albo migracja usuwa dane.
6. Małe kroki, po każdym `pnpm lint && pnpm typecheck`; commity robisz sam (małe, Conventional) po zielonych testach. Testy dla logiki, izolacji tenantów i formularzy. Na końcu sesji z kodem: `/przeglad`, aktualizacja `docs/STAN.md`, potem pokazujesz mi diff całości i czekasz na „tak” przed `/pr`. Nie wychodź poza zakres — pomysły spoza zakresu zapisz w `docs/STAN.md` → „Pomysły na później”.
