# ADR-I004 — Telefon jak aplikacja (prokominstalacje.pl)

- Status: **przyjęty** (I0, 28.10.2026, z decyzją o komponentach poniżej) · Data: 27.10.2026

## Kontekst
Większość ruchu lokalnego przychodzi z telefonu. Krystian (27.10): wersja na telefon ma wyglądać i działać jak nowoczesna, bardzo dopracowana aplikacja. Biznes, Software i Gaming przyjęły już ten wzorzec (dolny pasek kart, arkusze od dołu).

## Decyzja
- Na ekranach ≤ 760 px strona ma powłokę aplikacji: chowany nagłówek, **dolny pasek kart (Start · Usługi · Zaplanuj · Dla kogo · Więcej)**, menu jako **arkusz od dołu z 3 zakładkami**, przejścia View Transitions, manifest i `theme-color`.
- Wzorzec wizualny: prototyp v4.0 i zrzuty `docs/design/prokominstalacje/stany-telefonu/`. Wymagania i odbiór: `docs/design/prokominstalacje/MOBILE-APLIKACJA.md` — część Definition of Done każdej sesji z UI.
- Telefon budujemy w każdej sesji razem z desktopem, nie na końcu (sesja I14 to tylko audyt całości).

### Komponenty wspólne z Software (I0, dla I3)
Sprawdzone na develop 33f6e9b (`src/sites/software/components/`):
- **`BottomSheet` → wspólny.** Jest ogólny: natywny `<dialog>` (focus, Esc, powrót focusu), tytuł, `children`, zamknięcie tłem, zmianą adresu i kliknięciem linku. Jedyna zależność od Software to próg `DESKTOP_QUERY` (1080 px) z `layer.ts`. W I3 osobny mały PR `inst/wsp-arkusz`: przeniesienie do `src/components/BottomSheet.tsx` z progiem jako propem (Software 1080 px, Instalacje 760 px), import w Software podmieniony, testy Software zielone — gdy Software nie pracuje akurat na tym pliku. Trzy zakładki arkusza Instalacji (i gest w dół) to treść/rozszerzenie po stronie Instalacji (`children`), nie zmiana API arkusza. Zgodnie z ADR-010: komponent dwóch linii → wspólny.
- **`TabBar` → własny** `src/sites/instalacje/components/TabBar.tsx`. Wersja Software jest związana z jej układem: stałe ikony w kolejności planszy, środkowy przycisk kreatora, aktywna karta z `lib/software/mobileNav`, próg 1080 px. Instalacje mają inne karty (Start · Usługi · Zaplanuj · Dla kogo · Więcej) i inny wygląd — wspólny komponent wymagałby tylu parametrów, że byłby trudniejszy niż dwa proste.
- `PhoneLayer` (chowanie nagłówka, warstwa telefonu) — w I3 sprawdzić, czy logika chowania przy przewijaniu da się wydzielić jako hook wspólny; domyślnie własny w Instalacjach.

## Konsekwencje
- (+) Spójność z pozostałymi liniami PRO-KOM; szybka nawigacja jednym kciukiem; „Zaplanuj” zawsze pod ręką.
- (−) Więcej stanów do testowania (arkusz, gesty, historia) — pokryte testami e2e w I3.
