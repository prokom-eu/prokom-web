# Audyt stagingu prokombiznes.pl — 09.11.2026 (wieczór)

Zakres:
- **531 adresów** ze stagingu: wszystkie linki z `/mapa-strony` i `/oferta` (19 stron, 41 kategorii, 33 marki/salony, 21 zestawów, 3 branże, 412 kart produktu, 2 wpisy);
- rendering w przeglądarce (z leniwymi widżetami) dla stron, na które była skarga;
- porównanie z kodem `develop` (9049ffd) uruchomionym lokalnie na tej samej wersji.

## 1. Najważniejsze: co się stało z GoPOS, InsERT, Opieka IT, O firmie i Kontaktem

**Kod jest cały. Na stagingu leżą stare wersje tych stron w bazie.**

| Strona | Staging (dziś) | Ten sam kod lokalnie |
|---|---|---|
| `/gopos` | 4 sekcje: stary nagłówek, „Jak to działa”, oś wdrożenia, FAQ, formularz (4 271 px) | 12 sekcji: lokale, cały lokal, 5 aplikacji, KSeF/offline/utarg, urządzenia, konfigurator modułów, liczby, filmy, oś, integracje, FAQ, CTA |
| `/insert` | 3 sekcje: licznik KSeF, FAQ, formularz | 10+ sekcji: 3 pytania, Subiekt 123/GT/nexo, KSeF, InsPunkty, programy i usługi, wdrożenie, komputer do nexo, filmy, FAQ, „Masz już program?” |
| `/opieka-it` | 2 sekcje: 10 pytań, formularz | 9 sekcji: 8 obszarów, sytuacje z opieką i bez, kroki, branże, „Zanim podpiszesz”, kalkulator stanowisk, formularz |
| `/o-firmie` | stary układ: nagłówek, mapa, formularz | szablon: źródła, 8 zasad, linie PRO-KOM, marki, wizyta, formularz |
| `/kontakt` | stary układ: formularz, FAQ | szablon wspólny z sekcjami Biznesu |

**Przyczyna (sprawdzona w kodzie):**
- Seed nigdy nie nadpisuje strony, która „wygląda na edytowaną w panelu”:
  - `upsertK4Page` w `src/seed/biznes/page.ts` pomija stronę bez bloku `bzSection`;
  - `templateLayout` w `src/seed/biznes/templatePages.ts` pomija stronę z „obcymi” blokami.
- Na stagingu te pięć stron powstało ze starego seeda (bloki sprzed K4: `bzOrderFlow`, `bzTimeline` itd.).
- Dziś `scripts/staging-content.sh biznes` uruchomił seed na kopii stagingu. Seed uznał strony za edytowane i zostawił je bez zmian. W raporcie seeda jest to tylko notatka „strona K4 edytowana w panelu — bez zmian”, nie błąd.
- Ten sam mechanizm zostawił na stagingu zdanie „Paragon z NIP do 450 zł” we wpisie KSeF (D17). W kodzie jest usunięte.

**Ryzyko krytyczne:** `scripts/prod-content.sh` robi produkcję jako **kopię stagingu**. Bez naprawy produkcja wystartuje z tymi pustymi stronami. **Nie wdrażać produkcji, dopóki staging nie ma pełnych stron** (§5, PR 1).

**Czego nie dopilnowałem w planie 0611:** plan sprawdzał wszystko na lokalnej bazie i nie miał kroku „porównaj treść stagingu z lokalną” po imporcie. To moja luka — dopisuję ją do naprawy jako stały test.

## 2. Salony marek — przycięte przez „bez powtórzeń” (B5-3b, #458)
To skutek mojej rekomendacji z audytu 06.11 (P1-3 „dublowanie”). Za mocno ją sformułowałem. PR #458 zrobił dokładnie to, co plan kazał:
- karta w hero salonu: tylko 2 tytuły, bez opisów i bez chipów;
- z „Całej oferty” usunięte modele, które są już w kartach „Która kasa…?”;
- serwis i wdrożenie scalone w jeden blok, kroki wdrożenia powtarzające serwis usunięte.

Efekt: salony (Posnet, Elzab i reszta z salonem) są krótsze i uboższe niż przed 08.11. **Rekomendacja: przywrócić salony do stanu sprzed #458** — pełna karta hero, chipy, cała oferta, osobne bloki serwisu i wdrożenia. Testy e2e i dokumenty z #458 zostają.

## 3. Zdjęcia produktów z białym prostokątem (zrzuty Krystiana)
- PolCard Move/2500 i Sunmi D3 PRO (oraz inne packshoty z białym tłem, nie przezroczystym) stoją na jasnoniebieskiej karcie, więc widać biały prostokąt.
- Sunmi D3 ma do tego biały „obłok” wokół podstawy — źle wycięte zdjęcie.

**Naprawa:**
- (a) w kartach produktu zdjęcie zawsze na białej „płycie studia” — zaokrąglony kafel na całą wysokość obrazu, z miękkim cieniem. Biały prostokąt staje się częścią projektu, a nie błędem;
- (b) lista zdjęć z białym tłem lub otoczką → ponowne wycięcie (przezroczysty PNG/WebP) albo podmiana na zdjęcie producenta z przezroczystością. Najpierw Sunmi D3 PRO, PolCard.

## 4. Pozostałe ustalenia z 531 adresów

| Obszar | Wynik |
|---|---|
| Statusy HTTP | 531/531 = 200 |
| H1 | dokładnie 1 na każdej stronie |
| Tytuły i opisy | wszystkie 30–60 znaków; jeden opis < 100 (`/dostepnosc`) |
| WhatsApp | 0 (W1 działa) |
| Ceny | brak cen produktów; kwoty tylko dozwolone (limit KSeF 10 000 zł, ulga 700 zł, próg 15 000 zł na Dostawach IT); **„450 zł” zostało we wpisie KSeF** (§1) |
| Puste `alt` | karty produktów OK (B5-1); bez opisu zostają zdjęcia poza kartami: na głównej, w kategoriach (miniatury, logo), w `/automaty-vendingowe` — do sprawdzenia, które są dekoracyjne |
| **Aktualności na głównej** | karty wpisów Instalacji bez zdjęcia i bez leadu, sztywna wysokość → dwie wielkie puste białe karty (zrzut Krystiana). Mój pomysł z §7.1 #12 („karty linków do innych linii”) wyszedł źle — trzeba go poprawić |
| Fonty | wszędzie te same kroje (Archivo 112% + Manrope) — technicznie spójne. Brzydko wyglądają stare strony z §1: mały nagłówek 36 px w ramce okruszków, akapity grubości 800 w 13 px — to zniknie po przywróceniu stron. Na innych stronach potrzebne są przykłady (zrzut + adres) |
| Strony prawne | `/dostepnosc` bardzo krótka (985 znaków), `/cookies` krótka — do przeglądu przed produkcją |
| Salony bez salonu (marki) | 13 marek po 1 600–4 000 znaków (Adobe, Comarch, NFHotel, SATO, Stormshield…) — krótkie, ale zgodne z planem |

## 5. Naprawa — kolejność
1. **Staging = treść z kodu** — przywrócić 5 stron i wpis KSeF, plus stały test zgodności staging ↔ lokalnie. **Blokuje produkcję.**
2. **Salony do stanu sprzed #458.**
3. **Zdjęcia w kartach** — płyta studia + lista do ponownego wycięcia.
4. **Aktualności na głównej** — tylko karty ze zdjęciem i leadem; karty innych linii zwarte.
5. **Typografia** — przegląd po pkt 1 na podstawie przykładów od Krystiana.

Prompt dla Claude Code: `claude/prokombiznes-naprawa-staging-0911.md`.
