# Software v24 — audyt przed publikacją (09.11.2026, 22:30, po SWA11 #482 i wsp #483)

## Werdykt
**Kod jest gotowy do publikacji.** Lokalnie nie ma nic do poprawienia przed stagingiem. Brakuje tylko kroków, których nie da się zrobić w kodzie: stagingu z treścią, testów na stagingu i akceptacji szefa (lista niżej).

## Zakres pomiaru (`software.localhost:3003`)
- **152 przebiegi stron:**
  - 46 adresów (cały `sitemap.xml`, `/dziekujemy`, 404) na PC 1440×900 i telefonie 390×844,
  - 15 stron głównych na laptopie 1280×720, tablecie poziomo 1024×768, tablecie pionowo 834×1112 i małym telefonie 360×740.
- Hero na 9 rozmiarach, w tym wysokość Safari z paskami (390×664) i iPhone SE (375×667).
- SEO każdej strony, statusy HTTP, okno oferty na PC i telefonie.
- Ruchu nie oceniam, bo karta Chrome dławi animacje. Pomiary z buildu są w STAN SWA9c.

## Wyniki
| Obszar | Wynik |
|---|---|
| Struktura | każda strona: dokładnie 1 H1; **zero poziomego przewijania** na 6 rozmiarach; wszystkie `img` z `alt`; zero zaślepek, NaN, TODO; zero linków `#` |
| Nagłówki | `em` w każdym H2 poza świadomymi wyjątkami (nadtytuły, kroki, H2 dla czytników, grupy mapy strony) |
| Hero — całe okno makiety na 1. ekranie | 1440×900 ✓ (492–886) · 1366×768 ✓ (393–761) · 1180×820 ✓ · 1024×768 ✓ (355–723) · 834×1112 ✓ · 390×844 ✓ (do 736, pasek 767) · 390×664 ✓ (do 573, pasek 587) · 375×667 ✓ (576/590) · 360×640 ✓ (553/563). 1280×720 — ~63% (decyzja 09.11) |
| SEO | każda strona: `<title>` 26–59 znaków, opis 104–154 znaki, `canonical`, Open Graph z obrazem, JSON-LD (1–4 bloki), `lang="pl"` |
| HTTP | `/` 200, nieznany adres **404**, `/sitemap.xml` i `/robots.txt` 200, `/api/health` 200, **`/admin` na domenie strony 404** (panel tylko na domenie panelu) |
| Formularze | wszystkie pola z etykietą (jedyne pole bez etykiety to pułapka `website` — poprawnie) |
| Dotyk | elementy ≥ 24 px; na telefonie stopka i okruszki 24–44 px |
| Okno oferty | cena-bohater, zakładki, punkty na makiecie (strony 2–3, systemy 3), chipy bez cen, arkusz na telefonie z ceną w jednej linii |

Drobiazg (nie blokuje, P3): na `/rozwiazania` samo pole wyszukiwania „np. zlecenia, pensjonat…” ma 23 px wysokości (ramka wokół jest większa — klikalne jest całe pole?). Do sprawdzenia przy okazji, nie osobną sesją.

## Droga do publikacji (po kolei)

**A. Staging Software (1 wieczór)**
1. Scalone wszystko do `develop` (jest). Pipeline sam wdroży obraz na staging.
2. Kopia bazy stagingu (`backup.sh staging`) — migracje SWA2–SWA5 usuwają dane.
3. Treść: `scripts/staging-content.sh software`. Zastępuje ręczną listę z dopisków SWA5–SWA10. Po nim sprawdź w panelu 3 rzeczy z dopisku SWA8c (`SoftwareSettings`: kreator „Czego **potrzebujesz?**”, `stepsTitle`, `benefitsTitle`), bo seed wpisuje tylko puste pola.
4. `SCAN_AUTH=… node scripts/content-scan.mjs https://staging.prokomsoftware.pl` → **pusty raport** (zero `[…]`, zero nazw konkurencji).
5. Lighthouse stagingu: podstrony ≥ 90. Strona główna z hero nie blokuje (ADR-015 v24 pkt 7), ale zapisz wynik.

**B. Testy na stagingu (z telefonem w ręku)**
6. Formularz Kontaktu od początku do końca: zgłoszenie w panelu, mail na `kontakt@prokomsoftware.pl`, potwierdzenie do klienta. Sprawdź Gmail i Outlook (folder spam).
7. „Twój projekt”: dodaj 2 oferty i chipy → formularz z listą → zgłoszenie typu lista.
8. Prawdziwy iPhone i Android: hero z paskami przeglądarki, menu, dolny pasek, okno oferty (arkusz, przesuwanie palcem), strony prawne (chipy), 404, `/dziekujemy`.
9. Płynność: otwarcie okna oferty i przewijanie strony głównej na słabszym laptopie i telefonie. Jeśli coś szarpie → nagranie, osobny PR.

**C. Akceptacja szefa — w Asanie (blokuje produkcję)**
10. „SZEF · Software: cennik”: ceny i terminy 29 rozwiązań, poziomy opieki (149 / 299 / 790 zł, nazwa „Rozszerzona”), audyt (0 / 990 / 1 990 zł), zasady płatności (30% zaliczki).
11. Otwarte punkty spec. §13:
    - pkt 6: Zakopane — na stronie Software jest tylko Rabka, więc punkt jest nieaktualny, trzeba go zamknąć,
    - pkt 7: osoba z obsługi — zasada 01.11 „bez zdjęć ludzi”, punkt do zamknięcia,
    - pkt 8: kto dostaje kopię powiadomień o zgłoszeniach,
    - pkt 9: czy wpuszczamy boty AI (rekomendacja: tak).
12. Pokaz stagingu szefowi (link + hasło), odhaczenie zadania.

**D. Dzień publikacji**
13. Fakty ze źródłem, sprawdzone tego dnia: §13 pkt 14 (dostępność — ustawa z 26.04.2024, obowiązki od 28.06.2025) i pkt 15 (liczby W3Techs i Patchstack we wpisie o WordPressie).
14. `[WYNIK]` PageSpeed: zostaje ukryty do pomiaru na produkcji (pkt 10).
15. Produkcja według runbooka §3. `prokomsoftware.pl` i `www` w certyfikacie `prokom-prod` oraz `PROD_*` w `.env.proxy`. Najprościej razem z Biznesem albo zaraz po nim, bo ten sam stos i to samo pierwsze wdrożenie. `scripts/prod-content.sh software` (§3a), smoke.
16. Po starcie: Search Console + `sitemap.xml`, monitor Better Stack domeny, test formularza na produkcji, kopia `backup.sh prod` w cronie (już po Biznesie).

## Odpowiedź na „czy idziemy na publikację?”
**Tak, z kodem idziemy.** Kolejność: staging (A–B) → szef (C) → produkcja (D). Bez kolejnej sesji poprawek przed stagingiem. Następna runda uwag powinna wynikać z prawdziwego telefonu i reakcji szefa na stagingu, a nie z lokalnego szlifu. Realnie: staging jutro, pokaz szefowi w ciągu 1–2 dni, produkcja po odhaczeniu w Asanie.
