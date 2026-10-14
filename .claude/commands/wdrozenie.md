---
description: Checklista przed wdrożeniem na staging lub produkcję
argument-hint: staging | produkcja
---

Przygotowujemy wdrożenie na: **$ARGUMENTS**. Przejdź checklistę z `docs/wdrozenia.md` i zaraportuj każdy punkt (✅ / ❌ / ⚠️):

1. CI zielone (`lint`, `typecheck`, `test`, `build`, gitleaks).
2. Migracje bazy: są w repo? Bezpieczne na danych? Lista migracji do uruchomienia.
3. Nowe zmienne środowiskowe: w `.env.example` i w sekretach serwera?
4. Przekierowania 301 (jeśli zmieniają się adresy) — lista i test.
5. Formularze: zapis do skrzynki zapytań i powiadomienie działają na stagingu.
6. SEO: sitemap, robots (staging = `noindex` + hasło), metadane, dane strukturalne.
7. Kopia bazy przed wdrożeniem — komenda i miejsce kopii.
8. Plan cofnięcia: poprzedni tag obrazu i komenda rollbacku.
9. **Produkcja:** czy zadanie „SZEF · Akceptacja …” w Asanie jest odhaczone? Jeśli nie — STOP.

Nie uruchamiaj wdrożenia sam. Na końcu podaj dokładne komendy, które uruchomię ja.
