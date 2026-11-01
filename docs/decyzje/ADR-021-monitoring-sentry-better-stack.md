# ADR-021: Monitoring — Sentry (EU), Better Stack, Lighthouse CI

- **Status:** przyjęta
- **Data:** 2026-11-01
- **Decyduje:** Krystian (S10c)

## Kontekst
ADR-005 przewiduje Sentry (błędy) i zewnętrzny monitoring dostępności, a S10 (`docs/zadania/fundament.md`) wymaga: Sentry, monitoringu z alertem na telefon, alarmu o braku świeżej kopii (runbook §1.8) i Lighthouse CI z budżetem po wdrożeniu stagingu. Każda usługa zewnętrzna wymaga ADR (CLAUDE.md), a dane osobowe nie mogą trafić do logów ani Sentry (ADR-003).

## Opcje
| Obszar | Wybór | Odrzucone |
|---|---|---|
| Dostępność + alarm kopii | **Better Stack** (firma z UE, darmowy plan: 10 monitorów i heartbeatów, co 3 min, aplikacja z powiadomieniami push) — jedno konto na oba | UptimeRobot (heartbeat tylko płatny → drugi serwis do kopii); healthchecks.io + UptimeRobot (dwa konta) |
| Błędy aplikacji | **Sentry, region EU (Frankfurt), darmowy plan**, `@sentry/nextjs` tylko na serwerze | GlitchTip na własnym serwerze (kolejny kontener i baza do utrzymania); bez Sentry (błędy tylko w `docker logs`) |
| Budżet wydajności | **Lighthouse CI** (`@lhci/cli` przez `npx` w GitHub Actions, przypięta wersja), raporty jako artefakt | publiczne serwery raportów LHCI (raport ze stagingu za hasłem byłby publiczny) |

## Decyzja
- **Sentry tylko po stronie serwera** (`src/instrumentation.ts`): błędy Server Components, route handlerów, proxy i Payload. Bez SDK w przeglądarce — przeglądarki odwiedzających nie łączą się z żadną firmą trzecią (bez zmiany w polityce prywatności i bez zgody). Włączany zmienną `SENTRY_DSN` (pusta = wyłączony). Bez danych osobowych: SDK nie zbiera użytkownika, ciasteczek, nagłówków, zapytań URL, treści żądań, wartości z bazy ani zmiennych lokalnych; `scrubEvent` usuwa resztę (`src/lib/sentry.ts`, test). Bez śledzenia wydajności (`tracesSampleRate: 0`) — spany mogą nieść zapytania. Bez `withSentryConfig` (wysyłka map źródeł wymagałaby tokenu w buildzie — stos błędów wskazuje kod skompilowany; wrócimy, gdy to przeszkodzi).
- **Better Stack:** monitor HTTP stagingu (`/api/health` z osobnym loginem) i heartbeat kopii na stos (`BACKUP_HEARTBEAT_URL_<STOS>` w `.env.backup`; `backup.sh` pinguje po udanej kopii, `/fail` po błędzie). Od startu produkcji: monitory domen produkcji i heartbeat `prod`.
- **Lighthouse CI** po każdym udanym „Deploy staging”: strona główna + 1 podstrona każdej strony, wersja mobilna, 3 przebiegi; budżet z `docs/jakosc.md`. Na stagingu pomijany jest audyt `is-crawlable` (staging ma `noindex` celowo). Osobny login stagingu `lighthouse` (sekret `STAGING_BASIC_AUTH` w środowisku GitHub `staging`).

## Konsekwencje
- Konta w Sentry i Better Stack na firmę, 2FA, wpisy w menedżerze haseł (jak ADR-019 „Dostęp”). DSN Sentry nie jest tajny (identyfikuje projekt, nie daje odczytu), mimo to tylko w `.env.*` na serwerze.
- Nowa zależność `@sentry/nextjs` (przypięta). Uruchamia się tylko z DSN; bez niego `onRequestError` nic nie wysyła.
- Czerwony przebieg Lighthouse blokuje wdrożenie produkcji (runbook §3) — także gdy powodem jest sieć runnera; wtedy ponowne uruchomienie (Actions → Lighthouse → Re-run).
- **Wracamy do decyzji**, gdy darmowe limity (Sentry 5 tys. błędów/mies., Better Stack 10 monitorów) przestaną wystarczać albo gdy będą potrzebne błędy z przeglądarki (wtedy ADR o SDK w przeglądarce i polityce prywatności).
