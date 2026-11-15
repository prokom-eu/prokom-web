# prokombiznes.pl — audyt strony na produkcji (14.11.2026, noc)

**Zakres:** https://prokombiznes.pl. Sprawdzone:
- 578 adresów: wszystkie z sitemap, mapy strony, `/zapytanie`, `/llms.txt`, `/robots.txt` i 404;
- przekierowania, nagłówki, dane strukturalne i treść;
- 33 kluczowe strony w 7 szerokościach: 360, 390 (telefon), 768, 1024 (tablet), 1280, 1440 (laptop), 1920 (PC);
- wyszukiwarka, lista zapytania, ciemny motyw, panel.

**Metoda:**
- Przeglądarka Chrome na produkcji.
- Widoki w różnych szerokościach renderowane z HTML i CSS produkcji (bez JS — strona blokuje ramki, `X-Frame-Options: DENY`), co wystarcza do sprawdzenia układu.
- Elementy interaktywne sprawdzone na żywo na komputerze.
- **Formularza nie wysyłałem** — poszedłby prawdziwy mail do firmy.

## Werdykt
Strona działa i jest w bardzo dobrym stanie. Jest **1 błąd widoczny dla klientów** (Kontakt na telefonie wieczorem i w weekendy) i kilka drobiazgów SEO. Nic nie wymaga cofania wdrożenia.

## Do poprawy

### P1 — Kontakt na telefonie: tekst ucięty z prawej (gdy firma jest zamknięta)
- **Gdzie:** `/kontakt`, szerokość 360–390 px.
- **Kiedy:** tylko gdy firma jest zamknięta, czyli w praktyce **pn–pt po 17:00, noce i weekendy** — wtedy, kiedy ludzie najczęściej przeglądają.
- **Co widać:** w hero ucina się po ok. 25–30 px z prawej:
  - nagłówek („…ustalimy na”);
  - opis („…jede|”);
  - przycisk „Napisz do nas”;
  - sam status („…w poniedziałek o 9:0”).
- **Przyczyna:**
  - status „Zamknięte · otwieramy w poniedziałek o 9:00” ma `white-space: nowrap` (`src/styles/wspolne.css`, `.oh-status`), a w pigułce jest szerszy niż telefon;
  - siatka hero w `src/components/shared/ContactPage.tsx` (`grid … min-[1000px]:grid-cols-[…]`) poniżej 1000 px nie ma `grid-cols-1` / `min-w-0`, więc kolumna rozpycha się do szerokości pigułki (407 px przy ekranie 390);
  - sekcja ma `overflow-hidden`, więc nie ma przewijania w bok, tylko obcięcie.
- **Poprawka (strefa wspólna → osobny PR `feat/wsp-*`):**
  - siatka: `grid-cols-1` (lub `grid-cols-[minmax(0,1fr)]`) + `min-w-0` na kolumnie;
  - `.oh-status--pill`: `white-space: normal` (zawijanie w pigułce) albo krótszy tekst na wąskim ekranie;
  - test e2e: `/kontakt` w 360 px z zegarem ustawionym na sobotę 22:00 → brak elementów wychodzących poza ekran.
- Komponent jest wspólny, więc warto sprawdzić to samo na stronach kontaktu Instalacji i Software.

### P2 — SEO
1. **`/kontakt` nie ma meta description** (jedyna strona z 575). W `src/seed/biznes/contact.ts` brak opisu SEO. Dopisać w seedzie i panelu, np. „Kontakt z PRO-KOM Biznes w Rabce-Zdroju: tel. 889 003 889, kontakt@prokombiznes.pl, ul. Orkana 16B. Pn–pt 9–17, odpowiedź w 60 minut w godzinach pracy.” Do sprawdzenia: czy „60 minut” jest w ustaleniach — jest na stronie.
2. **Dane strukturalne kart produktów (`ProductGroup`) bez `offers`.** Search Console prawdopodobnie zgłosi to w raporcie „Fragmenty produktów” jako błąd („brak offers / review / aggregateRating”). Przy zasadzie „zero cen” to nie uszkodzi indeksowania, ale raport będzie czerwony. Decyzja: zostawić i zignorować albo zmienić typ na `Product` bez fragmentów / `Thing` z opisem. Rekomendacja: zostawić, sprawdzić raport po 2–3 tygodniach.
3. **`/kontakt` ma dwa bloki `BreadcrumbList`** (zdublowane). Kosmetyka, jeden do usunięcia.
4. **`/favicon.ico` → 404.** Ikony są pod `/brand/…` i strona je deklaruje, ale część robotów i czytników (Bing, stare przeglądarki, podglądy linków) pyta wprost o `/favicon.ico`. Wystarczy plik w `public/` albo przepisanie w `proxy.ts`.

### P3 — kosmetyka (po starcie, bez pośpiechu)
- `/o-firmie` (390 px): w tabeli danych etykieta „Telefon” stoi wyżej niż wartość. Do tego pigułka „…Rabka-Zdrój, od 2004” łamie się na „od / 2004” — lepiej z niełamliwą spacją.
- Na bardzo szerokich ekranach (powyżej 1920 px) boczna szyna nawigacji przy lewej krawędzi jest daleko od treści (treść ma max 1344 px). Przy 1920 px wygląda poprawnie.
- Galerie: część kart (np. ThinkPad P1 Gen 9) ma miniatury z ujęciem z boku, które wyglądają jak cienka kreska. Znane z audytu wieczornego — materiały producenta.
- Najmniejszy tekst w treści ma 10,5–11 px (etykiety). Czytelne, ale na granicy.

## Co działa (sprawdzone)
| Obszar | Wynik |
|---|---|
| Dostępność adresów | 577 × 200, prawdziwe 404 dla nieznanych adresów; 0 zepsutych linków wewnętrznych |
| Przekierowania | `http://www.…/gopos/` → `https://prokombiznes.pl/gopos` (jeden skok: http→https, www→apex, bez końcowego `/`); stare adresy z mapy slugów (Dell Pro 7, U5226KW, ThinkStation P4, Yoga Pro, Synology) → 301 na nowe karty |
| Szybkość | TTFB strony głównej 0,3–0,5 s, LCP 0,55 s, CLS 0; HTML 148 KB, ok. 350 KB przy pierwszym wejściu; po rozgrzaniu strony 120–200 ms; 0 zewnętrznych hostów |
| Nagłówki bezpieczeństwa | HSTS (1 rok), `X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy, CSP, bez `x-powered-by` |
| Panel | `panel.prokombiznes.pl/admin` → logowanie Payload, `noindex`; `/admin` na domenie strony → 404 |
| SEO | po 1 H1 na stronę, tytuły unikalne i ≤ 65 znaków, canonical + og:image wszędzie (poza `/zapytanie` — zamierzone `noindex`); `lang="pl"` wszędzie; sitemap 574 adresy = mapa strony; `robots.txt` i `llms.txt` poprawne |
| Dane strukturalne | poprawne JSON na wszystkich stronach: Organization + LocalBusiness (adres, godziny), WebSite, FAQPage, BreadcrumbList, Service, ItemList, ProductGroup, VideoObject |
| Treść | 0 cen (tylko KSeF 10 000 zł, ulga 700 zł, faktura 15 000 zł; „1 zł” to „1 złącze”), 0 WhatsApp, 0 „lorem”, 0 obrazów bez `alt` |
| Układ 33 stron × 7 szerokości | 0 przewijania w bok, 0 zepsutych obrazów, 0 ukrytych sekcji (poza błędem Kontaktu wyżej) |
| Wygląd | telefon (dolny pasek jak w aplikacji), tablet 834 px, laptop 1440 px i PC 1920 px — spójnie, bez dziur |
| Interakcje | wyszukiwarka (Ctrl K, podgląd karty, „Do zapytania”), lista zapytania (dodaj / usuń, licznik), przełącznik ciemnego motywu — działają; 0 błędów konsoli |

## Czego nie dało się sprawdzić stąd
- **Wysłanie formularza na produkcji** — zrób jedno zgłoszenie testowe sam (dopisek „TEST”) i sprawdź, czy mail doszedł na `kontakt@prokombiznes.pl` i czy zgłoszenie jest w panelu.
- **Lighthouse na telefonie** (Chrome DevTools → Lighthouse → Mobile) dla `/`, `/gopos`, `/kontakt`, jednej karty. Lokalnie było ≥ 90.
- **Search Console i Bing:** dodać domenę, wysłać `sitemap.xml`, po kilku dniach sprawdzić „Strony” i „Fragmenty produktów”.
- Runbook §3a: kopie zapasowe (cron), Better Stack, Profil Firmy w Google.
