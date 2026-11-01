# ADR-022: Elementy wspólne linii PRO-KOM

- Status: przyjęta z poprawkami (F0, 01.11.2026 — sekcja „Poprawki w F0”)
- Data: 01.11.2026
- Decydują: Krystian (architektura), szef (treści oznaczone [SZEF])
- Powiązane: ADR-010 (bloki linii), ADR-012/017 (Biznes), ADR-013/015 (kolory i motywy), ADR-014 (Software), ADR-I001…I005 (Instalacje), ADR-019 (serwer)., ADR-020 (analityka Umami — bez ciasteczek, ważne dla strony Cookies). Rozpoznanie: `docs/design/wspolne/MAPA-DZIS.md`.

## Kontekst
Trzy linie w `prokom-web` (Biznes, Instalacje, Software) zbudowały pasek marki, nagłówek, stopkę, formularz, Kontakt i O firmie każda po swojemu. Przegląd 01.11 (na żywo, 3 strony): trzy różne paski marki (inna kolejność linii, inne treści), trzy różne stopki (linie pokazane na trzy sposoby, różne linki prawne, „Serwis” zamiast „Tech”), różne wymiary znaku (Instalacje 140 px), różne wagi nagłówków, trzy różne formularze. Instalacje mają przeniesiony CSS prototypu (`topb`, `hdr`, `ftr2`), Biznes i Software — Tailwind. Dokument zaakceptowany przez szefa 12.10 zakładał wspólny pasek marki, wspólną stopkę z danymi firmy i formularze w jednym układzie.

## Decyzja
1. **Jeden folder komponentów wspólnych** `src/components/shared/` + loader danych `src/lib/shared/`. Komponenty są „czyste” (propsy, bez Payload, bez importów z `src/sites/*`), żeby dało się je skopiować do `prokom-system` (Tech).
2. **Trzy poziomy** (spec §1): wspólne 1:1 / wspólny szkielet z treścią linii / tylko linia. Wygląd i treści sprzedażowe linii zostają.
3. **Dane w panelu:** firma w `CompanyData` (adres, NIP, godziny, salony, linie i marki, strefy dojazdu), linia w grupie pól `shared` w `SiteSettings` (kolekcja per tenant — jedna definicja pól dla wszystkich linii; poprawka F0). Zero literałów kontaktowych w kodzie.
4. **Szablony stron Kontakt i O firmie wspólne** — ten sam układ sekcji, treści z pól linii, **miejsca (sloty) na sekcje własne linii** (spec §6.0); unikalne H1/lead per linia.
5. **Mapa adresu = jeden komponent** z SVG z OpenStreetMap trzymanym w repo (wzór Software v23); bez Google w ramce i bez ciasteczek; link „Wyznacz trasę” otwiera mapy dopiero po kliknięciu.
6. **Tokeny ról** (accent, accent-text, accent-soft, on-dark…, `line-dark`) dla każdej linii; stopka i ciemne pasy = `line-dark` linii.
7. **PRO-KOM Gaming = marka produktowa poza systemem** — w systemie tylko jako odnośnik (kafelek w pasie linii, pozycja w przełączniku, chip w menu), sterowany flagą `published`.
8. **Tech (prokomserwis.pl)** dostaje te same elementy jako kopię komponentów w `prokom-system` z oznaczeniem wersji (`wspolne v1 @ <commit prokom-web>`), nie wspólną paczkę npm.
9. **Zasady treści 01.11:** bez WhatsAppa, bez zdjęć ludzi, bez „sklepu” przy pro-kom.eu, nazwa „Tech”, dane z panelu.

## Rozważone opcje
- **A. Wspólny folder w prokom-web + kopia w prokom-system (wybrane).** Jedna implementacja dla 3 stron, Tech kopiuje gotowe komponenty raz. Koszt utrzymania: przy zmianie wspólnego elementu ręczna aktualizacja kopii w Tech (rzadko — elementy są stabilne).
- B. Pakiet npm w monorepo/prywatnym rejestrze dla prokom-web, prokom-system i prokom-gaming. Odrzucone teraz: różne wersje Next/React (14 vs 16), dodatkowa infrastruktura (publikacja, wersjonowanie) dla jednej osoby. Wrócić, gdy powstanie PRO-KOM System (2027) i trzecie repo będzie potrzebować tych samych komponentów.
- C. Zostawić każdą linię osobno, tylko wyrównać treści. Odrzucone: dane rozjadą się znowu (już raz się rozjechały: godziny, strefy, nazwy linii), trzy razy więcej pracy przy każdej zmianie.

## Konsekwencje
- + Zmiana adresu/godzin/nowej linii = panel. + Spójność marki i danych NAP (SEO lokalne). + Mniej kodu w liniach.
- − Jednorazowa przeróbka powłoki trzech linii (Instalacje najwięcej — z klas prototypu). − Ryzyko regresji wyglądu — ograniczamy zrzutami przed/po i małymi PR-ami.
- **Podział pracy (v2, 01.11):** część wspólna (dane, migracje, komponenty, szablony z miejscami na sekcje linii) powstaje raz w sesjach fundamentu F0–F4; wpięcie w ramkę linii (L1) i Kontakt/O firmie z sekcjami własnymi (L2) robią sesje w folderze danej linii. Sesje linii nie zmieniają części wspólnej ani wspólnych migracji — brak = osobny PR `feat/wsp-*`. Powód: jedna wersja części wspólnej i brak konfliktów migracji przy równoległej pracy linii, a każda linia zachowuje swoje dodatki.
- Etap A (F0–F2 + L1 każdej linii) przed produkcją linii; etap B (F3, L2, F4) może wejść po produkcji bez zmiany adresów. Plan: `docs/zadania/wspolne-elementy.md`.

## Poprawki w F0 (decyzje Krystiana 01.11.2026, po rozpoznaniu `MAPA-DZIS.md`)
1. **Numer i folder:** pakiet zakładał `docs/adr/ADR-020`. ADR-y leżą w `docs/decyzje/`, a numer 020 zajmuje analityka Umami (021 — Sentry) → ten dokument to **ADR-022** w `docs/decyzje/`.
2. **Grupa `shared` linii w `SiteSettings`**, nie w `BiznesSettings`/`InstalacjeSettings`/`SoftwareSettings`. Powód: telefon, e-mail, stopka i linki prawne linii już są w `SiteSettings` (jeden dokument na tenant); ustawienia linii nie mają pól kontaktowych. Jedna definicja, jedna tabela, jedna migracja, bez dublowania `phone`/`phone2`/`email`.
3. **Salony = rozszerzone `CompanyData.locations[]`** (dochodzą `key`, `geo`, `parkingNote`, `published`), bez nowego `salons[]`. Powód: `locations[]` czytają już paski i stopki wszystkich linii — bez przenoszenia danych.
4. **Znak w nagłówku 180×36 px na wszystkich liniach** (Instalacje 140 → 180). Minimum 220 px z księgi znaku dotyczy druku.
5. Rozpoznanie: zdarzenia `click_whatsapp` w kodzie nie ma (nic do usunięcia w analityce); Biznes nie ma `ServiceAreaMap` — wzorcem jest `AreaMap.tsx`; znak główny z zieloną kreską jest w `public/brand/`, znaku TECH brak.
