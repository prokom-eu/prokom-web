# ADR-011: Podgląd na żywo przez podpisany token i zadania Payload w procesie aplikacji

- **Status:** proponowana
- **Data:** 2026-10-17
- **Decyduje:** Krystian

## Kontekst
S5 wymaga podglądu na żywo i publikacji z datą. Panel działa na własnej domenie (`panel.pro-kom.eu`, ADR-006), a strony na domenach linii, więc podgląd w panelu to iframe z **innej domeny**. Standardowy draft mode Next.js trzyma dostęp do szkiców w ciasteczku — w takim iframe byłoby to ciasteczko stron trzecich, które przeglądarki blokują (dokumentacja Next 16 sama o tym wspomina). Publikacja z datą w Payload (`schedulePublish`) to zadanie w kolejce, które ktoś musi uruchomić. Ograniczenia: jedna osoba, jeden kontener aplikacji (ADR-004), żadnych nowych usług bez potrzeby.

## Opcje
| Opcja | Zalety | Wady | Koszt |
|---|---|---|---|
| A. Draft mode Next (ciasteczko) | standard z dokumentacji | nie działa w iframe z innej domeny bez ciasteczek stron trzecich | niski, ale nie spełnia warunku |
| B. Panel i strony pod jedną domeną (np. `/admin` na każdej domenie) | ciasteczka „własne” | przeczy ADR-006 (panel tylko na domenie panelu) | wysoki |
| C. **Podpisany token w adresie podglądu** (HMAC z `PAYLOAD_SECRET`, związany ze stroną i tenantem, ważny ≥ 1 h) | działa w każdej przeglądarce; brak stanu; dostęp tylko do jednej strony jednego tenanta | token w adresie (logi, historia) — krótki czas życia, `no-referrer`, `noindex` | mały |
| Zadania: D. **`jobs.autoRun` w procesie aplikacji** (cron co minutę) | bez nowej usługi; wbudowane w Payload | przy kilku replikach każda uruchamia cron; `revalidateTag` poza żądaniem nie działa | mały |
| Zadania: E. Osobny kontener / systemowy cron wołający endpoint | niezależne od aplikacji | nowa ruchoma część do utrzymania | średni |

## Decyzja
Wybieramy **C** i **D**:
- Podgląd: `/podglad/<id>?token=…` na domenie strony (`lib/preview/token.ts`, `lib/preview/url.ts`). Token stały w 10-minutowych przedziałach, żeby panel nie przeładowywał iframe przy każdym autozapisie; odświeżanie po zapisie przez `RefreshRouteOnSave` (`@payloadcms/live-preview-react`).
- Zadania: `jobs.autoRun: [{ cron: '* * * * *', queue: 'default' }]` w `payload.config.ts`. Ponieważ publikacja z crona nie może wywołać `revalidateTag`, cache stron ma TTL 60 s (`lib/pages/data.ts`).

## Konsekwencje
- Zmiana publikowana z datą pojawia się na stronie po ≤ 1 min (cron) + ≤ 60 s (TTL).
- S10: Nginx musi przekazywać `Host` i `X-Forwarded-Proto`, nie może ustawiać `X-Frame-Options: DENY` / `frame-ancestors 'none'` dla `/podglad/*` i powinien przycinać query tej ścieżki w access logach.
- Zmiana `PAYLOAD_SECRET` unieważnia otwarte podglądy (wystarczy odświeżyć panel).
- Wracamy do decyzji, gdy aplikacja dostanie więcej niż jedną replikę (wtedy E albo `autoRun` tylko na jednej instancji) albo gdy panel i strony trafią pod wspólną domenę.
