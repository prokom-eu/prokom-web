# QA przed produkcją — prokombiznes.pl (PRODUKCJA-BIZNES-1211, sesja 5, 13.11.2026)

Pomiar na `pnpm build && pnpm start` (lokalnie, port 3001) po wszystkich PR-ach sesji 1–4 (#515–#539) i po `pnpm seed:biznes`. Skrypty z repo, wyniki do powtórzenia.

## Wyniki

| Sprawdzenie | Skrypt | Wynik |
|---|---|---|
| Wszystkie adresy mapy: status, tytuł 30–60, opis 100–155, 1×H1, JSON-LD, og:image, martwe linki | `node scripts/biznes-seo-audyt.mjs <origin> --links` | **553 strony, 0 uwag; 22 linki spoza mapy, 0 błędnych** |
| 30 typów stron × 1440/390 × jasny/ciemny: przewijanie w bok, alt, 1×H1, konsola, axe (jasny 1440) | `node scripts/biznes-qa.mjs <origin>` | 120 widoków; **0 przewijania w bok, 0 błędów H1 i konsoli**; uwagi niżej |
| 32 karty produktów (≥ 2 z każdej kategorii, lista planu) × 1440/390 | `node scripts/biznes-karty-qa.mjs <origin>` (nowy) | **64/64 bez uwag**: opis ≥ 1000, FAQ ≥ 4, „dobierają” ≥ 3, źródła z datą, przycisk zapytania, bez przewijania w bok |
| Widoczność sekcji po przewinięciu + zrzuty pełnych stron | `node scripts/zrzuty-pelne.mjs <origin>` | **80 zrzutów (20 stron × 1440/390 × jasny/ciemny), wszystkie HTTP 200, 0 niewidocznych sekcji** (`tmp/zrzuty-pelne/index.html`) |
| Lighthouse (telefon) | CI `lighthouse.yml` na stagingu | po wdrożeniu stagingu (lokalnie bez Lighthouse, bez nowej zależności) |

## Problemy

| # | Problem | Strona | Priorytet | Stan |
|---|---|---|---|---|
| 1 | 16 obrazków bez `alt` — pudełka programów w „Wszystkie programy i usługi” (nowe w #518) | `/insert` | P1 | **poprawione** w tym PR (`alt` „Pudełko programu …”) |
| 2 | axe `label-content-name-mismatch` ×1 | `/agd-rtv-dla-firm` (jasny 1440) | P2 | znany z QA 09.11: pasek marek w ruchu, nie powtarza się stale — do obejrzenia przy następnym QA |
| 3 | „Białe bloki” w ciemnym motywie (lista, karta, salony, GoPOS, zestawy) | wiele | — | **celowe**: zdjęcia produktów i ekrany na białej płycie w obu motywach (K35 §6, NAPRAWA-0911 „płyta studia”) — skrypt liczy płyty jako białe bloki |
| 4 | Pierwsze wejście na kartę po zmianie danych pokazuje poprzednią wersję (ISR) | karty | — | zachowanie cache Next.js; na stagingu po imporcie treści: `staging-content.sh` czyści cache (runbook §2a) |
| 5 | Karty „do sprawdzenia” (11, `noindex`, poza mapą) są linkowane z list kategorii i salonów | `/oferta/laptopy`, `/marki/dell`… | P2 | stan z BIZ-3 — rozstrzygnąć karty albo ukryć je w listach (STAN „Pomysły”) |

## Telefon (MOBILE-APLIKACJA §4)
- Automatycznie (390): brak przewijania w bok na 30 typach stron i 32 kartach.
- **Niezmierzone automatycznie:** cele dotykowe ≥ 44 px poza kartami, klawiatura nad polami formularza, arkusze i szuflada zapytania na prawdziwym telefonie. Do ręcznego przejścia na stagingu (Krystian, 10 minut na telefonie: główna, kategoria, karta, salon, GoPOS, Kontakt z formularzem).

## Gotowe do produkcji (Część IV planu) — stan 13.11
- [x] Żadna sekcja nie jest niewidoczna — e2e `biznes-widocznosc` (lokalnie 40/40), zrzuty pełne bez niewidocznych.
- [ ] `--widocznosc` na stagingu — po wdrożeniu i `ZAMIEN_STRONY` (za zgodą).
- [x] GoPOS, InsERT, Opieka IT, Automaty — zrzuty pełne 1440/390 jasny/ciemny (`tmp/zrzuty-pelne/index.html`).
- [~] Karty: opis ≥ 1000, FAQ ≥ 4, polecane ≥ 3 — **cały katalog** (test `catalogThresholds`); parametry obowiązkowe — lista braków 150 kart (`parametry-braki.md`, sprawdzone w `parametry-braki-sprawdzone.md`); **zdjęcia ≥ 3 — 199 z 425** (`zdjecia-do-pozyskania.md`).
- [x] Salony: zero powtórzonych kart w kaflach planu (test), 7 małych salonów pełnych.
- [x] Zestawy: tylko „Gotowe” widoczne (bez zmian od BIZ-3).
- [x] Zero cen, zero WhatsApp, statusy K4-FINAL §1, bez zdjęć ludzi — testy treści zielone; zdjęcia GoPOS z ludźmi i cenami odrzucone (#517).
- [~] Telefon 390/360 — automatycznie bez P0/P1; ręczne przejście na stagingu.
- [x] `biznes-seo-audyt`: 553 adresy 200, tytuły i opisy w normie, JSON-LD, og:image, 0 martwych linków.
- [ ] Lighthouse telefon ≥ 90 — CI na stagingu po wdrożeniu.
- [~] axe — 0 trwałych błędów (1 niestabilny węzeł, P2).
- [ ] Formularze na stagingu (zapis, mail, lista „Do zapytania”) — po wdrożeniu.
- [ ] Prawo: polityka (webh.pl, Seohost, Backblaze), cookies, dostępność — **[prawnik]**.
- [x] Zgoda szefa na materiały producentów 12.11 — w STAN; źródła plików w `media/*/ZRODLA.md` i `media-produkty-v2.json`.
- [ ] Decyzje [SZEF]: „100+ klientów”, link Google, model Opieki IT bez cen.
- [ ] Wdrożenie: staging = treść z kodu, akceptacja szefa w Asanie, kopia, certyfikat, `PROD_*`, §3a + §3a.1, smoke.
- [x] 301 ze starej strony — nie dotyczy (domena bez wcześniejszej strony).
