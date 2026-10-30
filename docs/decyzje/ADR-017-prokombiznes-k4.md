# ADR-017: prokombiznes.pl K4 — wersja finalna: kategorie, salony 2.0, konfigurator 3.0, nowe strony

- **Status:** przyjęta (30.10.2026 — Krystian zaakceptował wersję finalną wizualizacji v150 i decyzje D-K4-1…9 z `docs/design/prokombiznes/K4-FINAL.md` §3, „pełna zgoda”)
- **Data:** 2026-10-30
- **Decyduje:** Krystian (technika, treść); szef — treści oznaczone [SZEF] w `K4-FINAL.md` §10

## Kontekst
Po paczce K3.1 (wgranej w #110, zbudowanej do K3c — #142) wizualizacja przeszła rundy K3.2–K3.6 (v127–v150): nowe marki i karty (162), nowy podział kategorii, salon 2.0 dla wszystkich marek, Konfigurator 3.0, nowa strona główna, Oferta 2.0, nowe strony (automaty vendingowe, KSeF, ulga), poprawki po dwóch audytach. Paczka K4 (`docs/design/prokombiznes/K4-FINAL.md`, `PRZEKAZANIE-K4.md`, `k4/`, `seed/prokombiznes/k4/`) przenosi to do repo. Część rozwiązań wymaga decyzji o modelu i adresach, które dotąd zapisywał ADR-012.

## Decyzje
1. **Adresy (D-K4-1).** Zostają adresy z ADR-012 (rozstrz. K3/K3.1): `/produkt/[slug]`, `/zestawy`, `/zestawy/[slug]`, `/oferta`, `/oferta/[kategoria]`, `/oferta/[kategoria]/[podkategoria]`, `/marki/[slug]`, `/plan-firmy`. Nowe: `/marki`, `/konfigurator` (301 z `/kreator`), `/automaty-vendingowe`, `/ksef`, `/ulga-na-kase-fiskalna`. Salony tematyczne: `/marki/druk`, `/marki/siec`, `/marki/nas`, `/marki/niszczarki`; marka należąca do salonu tematycznego → 301 do salonu. Nowe adresy najwyższego poziomu dopisujemy do `RESERVED_PAGE_SLUGS`. Adresy z `K33-ZMIANY.md` §1 (`/gotowe-zestawy`, `/oferta/[kategoria]/[produkt]`, `/plan-twojej-firmy`) **nie obowiązują**.
2. **Kategorie (D-K4-2).** 33 kategorie w 5 działach z `seed/prokombiznes/k4/slowniki-k4.json` zastępują 23 kategorie K3 („Komputery i monitory” → Laptopy, Komputery i All-in-One, Monitory, Tablety, Telefony; nowe: Klawiatury, myszy i słuchawki; Niszczarki; „Drukarki i urządzenia wielofunkcyjne” z podkategoriami). Slugi przez `CATEGORY_SLUGS`, 301 ze starych adresów.
3. **Salony (D-K4-3).** Nowa kolekcja `Showrooms` (per tenant): slug, tytuł, marki[], bloki salonu 2.0 (`K4-FINAL.md` §6, wszystkie opcjonalne). `Partners` zostaje kartą marki (logo, status, opis, fakty). Dane salonów Lenovo/Dell przechodzą z `Partners.showroom` do `Showrooms`; pole usuwamy migracją po przeniesieniu (K4f-2).
4. **Konfigurator (D-K4-4).** Dane Konfiguratora 3.0 w `BiznesSettings.wizard` (rozszerzenie z B10c): rodzaje firm, sytuacje, skale, potrzeby, presety, listy produktów, pytania z nadpisaniami, grupy zestawów, sceny. Silnik (`K35-ZMIANY.md` §1.2) jako czyste funkcje z testami; link do wyniku `?kr=firma|etap|skala|potrzeby|odpowiedzi`.
5. **Motyw (D-K4-5).** Domyślnie jasny; bez dziedziczenia `prefers-color-scheme`; wybór w `localStorage` (odczyt/zapis w `try/catch`).
6. **Opinie (D-K4-6).** Karty opinii z flagą widoczności; zaślepki nie są widoczne na produkcji.
7. **Strony KSeF, ulga, automaty (D-K4-7).** `Pages` z blokami Biznesu (ADR-010). Teksty KSeF w dwóch wersjach z polem „od daty” (przełączenie 1.01.2027, strefa Europe/Warsaw).
8. **Podział kart (D-K4-8).** Podział z K3.1 w repo wygrywa nad kartami niepodzielonymi w wizualizacji; odwołania w danych K4 przepisane wg `mapa-slugow-k4.json`.
9. **Aktualności (D-K4-9).** Zostaje `/aktualnosci` z B11a; stara plansza Aktualności nie wraca.
10. **`polecane` zamiast `dobierz`.** „Do tego zwykle dobierają” bierze jawną listę `{produkt, etykieta}` z danych K4; dopasowanie fraz `dobierz` (K31b-2) przestaje być używane.
11. **Pomiar odłożony.** `K35-ZMIANY.md` §7 (Plausible) to plan na później — bez skryptów analityki w K4 i PROD′.

## Konsekwencje
- Sesje: `docs/zadania/prokombiznes.md` §7 (K4a-1 … Staging). K31e i część PROD zastąpione (§2 `K4-FINAL.md`).
- Migracje: kategorie (z 301), nowe pola `Products`, kolekcja `Showrooms` (na końcu listy kolekcji — nazwy indeksów), rozszerzenie `BiznesSettings.wizard`, usunięcie `Partners.showroom`.
- Treści przenoszone na produkcję w panelu (seed tylko lokalnie) — lista w STAN „Produkcja” rośnie o strony K4.

## Odrzucone
- Salony jako pole `Partners.showroom` dla wszystkich — salon tematyczny łączy kilka marek.
- Nowy global na Konfigurator — sprzeczne z decyzją KD D2 (bez nowych globali).
- Adresy z K33 §1 — zmiana już zbudowanych tras bez korzyści.
