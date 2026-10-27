# ADR-I004 — Telefon jak aplikacja (prokominstalacje.pl)

- Status: proponowany (przyjęcie w I0) · Data: 27.10.2026

## Kontekst
Większość ruchu lokalnego przychodzi z telefonu. Krystian (27.10): wersja na telefon ma wyglądać i działać jak nowoczesna, bardzo dopracowana aplikacja. Biznes, Software i Gaming przyjęły już ten wzorzec (dolny pasek kart, arkusze od dołu).

## Decyzja
- Na ekranach ≤ 760 px strona ma powłokę aplikacji: chowany nagłówek, **dolny pasek kart (Start · Usługi · Zaplanuj · Dla kogo · Więcej)**, menu jako **arkusz od dołu z 3 zakładkami**, przejścia View Transitions, manifest i `theme-color`.
- Wzorzec wizualny: prototyp v4.0 i zrzuty `docs/design/prokominstalacje/stany-telefonu/`. Wymagania i odbiór: `docs/design/prokominstalacje/MOBILE-APLIKACJA.md` — część Definition of Done każdej sesji z UI.
- Telefon budujemy w każdej sesji razem z desktopem, nie na końcu (sesja I14 to tylko audyt całości).

## Konsekwencje
- (+) Spójność z pozostałymi liniami PRO-KOM; szybka nawigacja jednym kciukiem; „Zaplanuj” zawsze pod ręką.
- (−) Więcej stanów do testowania (arkusz, gesty, historia) — pokryte testami e2e w I3.
