---
description: Samodzielny przegląd zmian przed PR (jak wymagający senior)
---

Zrób przegląd bieżących zmian (`git diff develop...HEAD` oraz niezacommitowanych; jeśli `develop` jeszcze nie istnieje — względem `main`):

1. **Zakres:** czy zmiany robią dokładnie to, co sesja/specyfikacja — nie mniej, nie więcej?
2. **Poprawność:** przypadki brzegowe, puste dane z panelu, błędy sieci/bazy.
3. **Tenant:** czy każde zapytanie do Payload filtruje po tenancie? Czy panel i API zapisu są niedostępne z domen stron? Czy nieznana domena daje 404?
4. **Baza:** czy zmiana schematu ma migrację w repo? Czy migracja jest bezpieczna na danych produkcyjnych?
5. **Bezpieczeństwo i RODO:** walidacja wejścia na serwerze, uprawnienia kolekcji (publicznie tylko odczyt opublikowanych treści), brak sekretów w kodzie, minimum danych osobowych.
6. **SEO i dostępność:** metadane, jeden H1, `alt`, kontrast, etykiety formularzy, sitemap/robots per domena.
7. **Wydajność:** `next/image`, zbędne komponenty klienckie, cache i odświeżanie per tenant.
8. **Prostota:** czy da się prościej? Martwy kod, duplikaty, zbędne zależności.
9. Uruchom `pnpm lint && pnpm typecheck && pnpm test && pnpm build` i podaj wynik.

Wynik: lista problemów od najpoważniejszych (plik:linia, co nie tak, propozycja poprawki). Nie poprawiaj sam bez mojej zgody, poza oczywistymi literówkami.
