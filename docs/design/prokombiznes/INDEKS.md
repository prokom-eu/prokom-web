# prokombiznes.pl — indeks materiałów dla Claude Code (25.10.2026, wizualizacja v126)

Czytaj od góry. Gdy dokumenty mówią co innego, kolejność ważności: **MOBILE-APLIKACJA.md (telefon) → K31-ZMIANY.md → K3-KATALOG.md → ZMIANY-v20.md → docs/strony/prokombiznes.md**. Wzorzec (zrzut + plansza) wygrywa z opisem słownym.

## 1. Od czego zacząć
| Plik | Po co |
|---|---|
| `START-TUTAJ.md` | kolejność sesji (ścieżka 12 sesji), co sprawdzić po każdej, praca poza kodem |
| `PRZEKAZANIE-K3.md`, `PRZEKAZANIE-K31.md` | gotowe prompty sesji (W, KD, K3a–c, K31a–e, M1) |
| `AUDYT-PRODUKCJA.md` | co blokuje produkcję, sesja **PROD** (strony prawne, zapytania, analityka), lista kontrolna stagingu |
| `INDEKS.md` | ten plik |

## 2. Specyfikacje
| Plik | Zakres |
|---|---|
| `K3-KATALOG.md` | katalog 243 kart, zestawy, marki, kategorie, wyszukiwarka, M1 (podstawa) |
| `K31-ZMIANY.md` | K3.1: produkt 2.0, tło studio, salony Lenovo/Dell, Plan 2.0, filmy, GoPOS/InsERT 2.0, stopka; **§13 runda v124**: hero GoPOS, InsPunkty, Najczęściej wybierane, O firmie/Kontakt 2.0, karty wielomodelowe + `ProductGroup`, treści kart, **konfigurator 2.0** |
| **`MOBILE-APLIKACJA.md`** | **telefon jak aplikacja — szkielet, komponenty, wszystkie 29 ekranów (z O firmie, Opieka IT, branża, kreator, aktualności, wpis), wymagania techniczne, testy** |
| `ZMIANY-v20.md` (z łatki v20) | strona główna i nawigacja v20 — w częściach niezmienionych przez K3/K3.1 |
| `AUDYT-K31.md` | audyt danych i wyglądu (co poprawione, co zostaje) |

## 3. Wzorzec wyglądu
| Ścieżka | Co |
|---|---|
| `k31/screens/Web-*-1440.webp` | desktop: produkt (4 stany), kategoria, salony ×2, plan ×3, GoPOS, InsERT, zestawy, zestaw, **O firmie, Kontakt** |
| `k31/screens/Main-1440.webp` | strona główna K3.1 |
| `k31/screens/App-*-390.webp` | **telefon: 29 ekranów** |
| `k31/boards/` | plansze do podglądu lokalnego (`python -m http.server 8765` w tym katalogu): `Strona.dc.html` (desktop, wszystkie widoki), `Aplikacja.dc.html` (telefon, klikalny prototyp), `Main.dc.html`, `Web-*.dc.html`, `App-*.dc.html` |
| `k3/screens/`, `k3/boards/` | wzorzec K3 (tam, gdzie K3.1 nic nie zmienia) |

## 4. Dane (seed)
| Plik | Do czego |
|---|---|
| `seed/prokombiznes/k3/*.json` | katalog K3, zestawy, marki, plansze K3, media K3 |
| `seed/prokombiznes/k31/katalog-k31-nowe.json` | 26 nowych kart Lenovo/Dell |
| `…/k31/tresci-uzupelnienia-k31.json` | FAQ, opisy, parametry dodane w v124 (nadpisanie przy imporcie) |
| `…/k31/karty-podzial-k31.json` | podział 6 kart wielomodelowych (11 nowych + 301) |
| `…/k31/marki-salony-k31.json` | serie i salony Lenovo/Dell |
| `…/k31/plansze-k31.json` + `plansze-svg/` | Plan 2.0: 12 scen, 186 punktów |
| `…/k31/wideo-k31.json` | filmy producentów (122 pozycje) |
| `…/k31/strony-gopos-insert-k31.json` | GoPOS (z `hero`) i InsERT (z `insp` — InsPunkty) |
| `…/k31/firma-k31.json` | dane firmy, O firmie, Kontakt, mapa dojazdu |
| `…/k31/strona-glowna-k31.json` | „Najczęściej wybierane” (8) |
| `…/k31/media/produkty/` + `media-k31.json` | 91 zdjęć nowych kart |
| `…/k31/zdjecia-do-pobrania-k31.json` | 2 karty bez zdjęć (zastępnik) |

## 5. Twarde zasady (każda sesja)
- **Zero cen** na stronie; bez leasingu, rat i finansowania (Polska Bezgotówkowa — terminal 0 zł — dozwolona). Nigdy: Novitus, Honeywell, Verifone, Datalogic. `WEWNETRZNE-ceny…` nie trafia do repo.
- Na Biznesie tylko adres w Rabce; jeden e-mail **biznes@pro-kom.eu**; bez obietnic czasu („oddzwonimy w 60 min”) do decyzji szefa; Opieka IT bez pakietów; Strefa Klienta niewspominana.
- Dane zawsze z bazy/panelu (liczniki, listy, teksty) — plansze to wzorzec wyglądu, nie architektura.
- **Telefon jest częścią zakresu każdej sesji z UI** (nie poprawką na koniec): `MOBILE-APLIKACJA.md` §4 = Definition of Done.
