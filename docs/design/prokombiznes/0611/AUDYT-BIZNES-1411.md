# prokombiznes.pl — audyt 14.11.2026 (wersja najnowsza)

## Zakres i metoda
- **Kod:** `develop` 4b1d5dff (#594). Świeża baza (`migrate` + `pnpm seed`), `pnpm build && pnpm start`, czyli tak, jak będzie na produkcji.
  - Wersja u Krystiana (localhost:3001) zgadza się z tym kodem: na GoPOS ten sam zestaw sekcji, na salonie PolCard nowe karty modeli.
- **Wszystkie adresy:** 584 (sitemap 575 + mapa strony 542). Sprawdzone: status, tytuł, opis, canonical, robots, H1, JSON-LD, og:image, alt, zakazane słowa, kwoty.
- **Rendering w przeglądarce:** 46 stron × komputer 1440 i telefon 390. Sprawdzone: przewijanie w bok, niewidoczne sekcje, zepsute zdjęcia, błędy konsoli i sieci, puste sekcje, kolejność nagłówków, małe cele dotykowe.
- **Zdjęcie główne:** wszystkie 438 kart produktów (rozmiar na ekranie, plik).
- **Obejrzane zrzuty:** GoPOS, InsERT, Opieka IT, O firmie, Kontakt, 5 salonów, 2 karty produktu; na telefonie: główna, karta, salon, kontakt.

## Werdykt
**Strona jest blisko produkcji.** Plan z 12.11 jest w większości zrobiony:
- widoczność sekcji;
- GoPOS i InsERT z ekranami programów, Basic/Pro/Unlimited, opieka nad programem;
- karty modeli PolCard, ESET, M365 i EuroCert; małe salony z porównaniami i całą ofertą;
- 455 kart z opisem ≥ 1 000 znaków i FAQ ≥ 4, bez powtórzeń;
- SEO lokalne, strony prawne (wersje robocze), QA.

Technicznie czysto:
- **584/584 adresów działa:** 582 → 200, 2 → 301 (stare Apple na M6);
- 0 przewijania w bok, 0 niewidocznych sekcji, 0 zepsutych zdjęć, 0 błędów konsoli na 92 widokach;
- 0 brakujących `alt`, 0 WhatsApp, 0 cen (kwoty tylko dozwolone: 10 000 zł KSeF, 700 zł ulga, 15 000 zł faktura).

Zostały głównie **zdjęcia** i **drobne niedoróbki treści**, które klient zobaczy, plus decyzje poza kodem.

## P1 — do poprawy przed produkcją
1. **Złe albo zastępcze zdjęcie główne na kartach:**

   | Karta | Co widać | Ma być |
   |---|---|---|
   | `/produkt/m365-business-basic`, `/produkt/m365-business-premium` | logo Microsoft 83×18 px jako zdjęcie produktu | grafika planu z materiałów Microsoft albo czytelny kafel planu |
   | `/produkt/m365-business-standard`, `/produkt/m365-apps-for-business` | zdjęcie **Windows 11 Pro** (inny produkt) | jw. |
   | `/produkt/wymiana-kasy`, `/produkt/wdrozenie-programu-z-przeniesieniem-danych` | pudełko **Subiekt GT** | kafel usługi (jak `przeglad-it`) albo zdjęcie kasy dla wymiany kasy |
   | `/produkt/hp-color-laserjet-pro-mfp-4302fdw` | plik 93×93 px | zdjęcie ≥ 1200 px (HP — ręcznie) |
   | `/produkt/adobe-acrobat-pro-teams` | plik 173×173 px | większy plik |
   | `/produkt/eset-small-business-security` | baner 229×97 | pudełko / grafika pakietu |

   Na 10 kartach (M365 ×5, ESET ×5) w siatkach pojawia się kafel „Bez zdjęcia”.
2. **Galerie.** Zdjęć z nazwą modelu w `alt`, na kartę:

   | Zdjęć | Kart |
   |---|---|
   | 0 | 61 (w tym 12 usług z kaflem — to poprawne) |
   | 1 | 79 |
   | ≥ 3 | 284 |

   Do domknięcia ręcznie: Brother, Dell, HP, COMEX, Logitech, PolCard, Fellowes (lista `docs/zadania/zdjecia-do-pozyskania.md`). Każda karta z głównej, salonów i zestawów — min. 2 ujęcia.
3. **„Skąd są te informacje” — powtórzone etykiety.** 231 kart ma kilka źródeł o tej samej nazwie. Przykład: Subiekt nexo — 10 × „Strona producenta — InsERT”, GoPOS All in One — 6×. Etykieta ma mówić, co jest pod linkiem (np. „InsERT — Subiekt nexo PRO, wymagania”, „Karta katalogowa PDF”), a identyczne linki trzeba scalić.
4. **Sieroty w siatkach (InsERT):**
   - „Wszystkie programy i usługi”, zakładka Sprzedaż i magazyn: 4. karta (Subiekt GT Sfera) sama w drugim rzędzie;
   - „Masz już program InsERT? Przejmiemy opiekę.”: 5 kart w układzie 3 + 2.

   Siatka ma brać liczbę kolumn z liczby kart (4 → 2×2 albo 4 w rzędzie, 5 → 3+2 wyśrodkowane albo 5 w rzędzie na ≥ 1280).
5. **SEO drobne:**
   - 4 tytuły > 65 znaków (`dibal-d-955` 68, `apple-ipad-air-m4` 71, `apple-ipad-pro-m5` 71, `gopos-kds` 66);
   - ten sam tytuł na `/oferta/niszczarki` i `/marki/niszczarki` („Niszczarki dla firm — Rabka-Zdrój i Podhale”) — salon powinien mieć nazwę marek (Fellowes, Kobra).

## P2 — szlif
6. **Cele dotykowe < 32 px na telefonie:** 1–9 na stronę, 14 na `/zestawy/zestaw-sklep-kasa-start` (linki w składzie zestawu, chipy). WCAG 2.2 wymaga min. 24 px, a nasz standard MOBILE-APLIKACJA to 44 px.
7. **Sharp/NEC:** najkrótszy salon (4 057 px, 3 modele). Zgodny z planem (brak „Wszystko w ofercie” przy < 4 kartach). Opcjonalnie blok serwisu lampy i filtrów.
8. **Pamięć podręczna po imporcie treści.** Przy pierwszych wejściach po starcie lokalny build pokazał dane z poprzedniego builda:
   - mapa strony z 2 adresami po 301 i bez 46 nowych kart;
   - 12 kart z `noindex`.

   Po kilku sekundach wszystko było aktualne. Przyczyną jest `.next/cache` z poprzedniego builda (lokalnie). Na stagingu i produkcji po `staging-content.sh` / `prod-content.sh` trzeba **sprawdzić, że mapa strony = sitemap i żadna karta „Gotowe” nie ma `noindex`** — dopisać do smoke (`porownaj-tresc` albo `biznes-qa`).

## Poza kodem (Krystian / szef) — blokuje albo warunkuje produkcję
- [prawnik] polityka prywatności (dostawcy: webh.pl, Seohost, Backblaze B2), cookies, deklaracja dostępności. Cookies i dostępność mają po ok. 1 600 znaków.
- [SZEF]:
  - lista miejscowości w panelu (idzie do danych dla Google);
  - „100+ klientów”;
  - link do wizytówki Google;
  - model Opieki IT (bez cen);
  - **akceptacja w Asanie**.
- Decyzje z STAN:
  - ThinkStation P4 (dostępność w PL);
  - nazwa „Sunmi NT311”;
  - `avtek-ts-9-mate-g` vs osobna karta TS 8.1 Mate G 65;
  - Dell U5226KW;
  - `TODO(krystian)` M365 — limity planów do potwierdzenia na microsoft.com/pl-pl.
- Staging (za zgodą):
  - `ZAMIEN_STRONY=gopos,insert,opieka-it,automaty-vendingowe bash scripts/staging-content.sh biznes`;
  - `porownaj-tresc --widocznosc`;
  - telefon na żywo, formularz → mail.
- Po produkcji: Profil Firmy w Google i opinie, Search Console, Bing, monitory, cron kopii.

## Plan
1. **Sesja DOMKNIECIE-1411** (Claude Code, jedna sesja, 3 PR-y): P1 1, 3–5 i P2 6, 8 (prompt niżej).
2. **Zdjęcia (P1 2):** Krystian ręcznie z press kitów (Brother, Dell, HP, COMEX, PolCard, Logitech, Fellowes) według listy → wrzuca do `seed/prokombiznes/media/` → krótka sesja importu.
3. **Staging** z treścią + `porownaj-tresc --widocznosc` + przejście na telefonie.
4. **Prawnik i szef** → akceptacja w Asanie → produkcja wg runbooka §3 / §3a.
