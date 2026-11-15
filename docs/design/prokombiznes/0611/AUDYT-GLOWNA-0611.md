# Audyt strony głównej prokombiznes.pl (06.11.2026)

Stan: `origin/develop` 0703b69 (po #336), uruchomiony lokalnie z `pnpm seed`. Zrzuty 1440 jasny i ciemny oraz 390. Staging był niedostępny. Wydajności nie mierzyłem, bo tryb dev jej nie pokazuje. Lighthouse trzeba zrobić na stagingu.

## Werdykt
Fundament jest mocny i wyróżnia się na tle lokalnej konkurencji:
- koło działów;
- prawdziwe zdjęcia;
- plan lokalu;
- dopracowany ciemny motyw;
- żadnego przewijania w bok.

Problemem nie jest wygląd ani długość, tylko **powtórzenia**:
- komputer: 13 550 px, czyli ok. 15 ekranów;
- 205 linków w treści;
- te same ścieżki pokazane 3–4 razy;
- „60 minut” 5 razy.

Jednocześnie brakuje dwóch rzeczy, które sprzedają najmocniej: **dowodu od klientów** (opinie są wyłączone, nic ich nie zastępuje) i **pilnego powodu** (KSeF). Telefon dodatkowo chowa FAQ i „O firmie”.

## Wysokości sekcji (komputer → telefon, px)
| Sekcja | 1440 | 390 |
|---|---|---|
| Hero z kołem | 855 | 426 |
| Szybki start | 313 | 285 |
| Oferta: 5 działów + kafel szukania + Systemy | **2089** | 659 |
| Marki (16 kafli + baner) | **1176** | 542 |
| Najczęściej wybierane (16) | **2120** | 483 |
| Firmy każdej wielkości (12 branż) + dofinansowania | 993 | 713 |
| Plan Twojej firmy (plan + 17 punktów) | **1844** | 378 |
| Jak pracujemy + zobowiązania | 935 | 1132 |
| O firmie | 490 | **brak** |
| FAQ | 722 | **brak** |
| Kontakt | 1197 | 223 |

## P0 — błędy i złamane zasady
1. **WhatsApp na stronie**: 3 miejsca na komputerze (karta przy FAQ, lewa kolumna formularza, stopka) i 1 na telefonie. To łamie zasadę z 01.11 („bez WhatsAppa” — WSPOLNE-ELEMENTY §1). Usunięcie z widoku to PR `feat/wsp-*`. Usunięcie pola z panelu to migracja usuwająca dane i wymaga decyzji Krystiana.
2. **„O firmie” odwołuje się do czegoś, czego nie ma**: tekst mówi „Uprawnienia producentów widzisz obok”, a obok są tylko 2 liczby. Brakuje 4 kafli autoryzacji z POPRAWKI-0311 §C. Albo PR 3 nie wszedł, albo `Partners` nie ma statusów. Sprawdzić i dokończyć.
3. **Telefon ukrywa FAQ i „O firmie”** (sprawdzone: oba są w HTML, ale niewidoczne na 390 px). Google indeksuje wersję mobilną, a dane strukturalne `FAQPage` opisują treść, której użytkownik telefonu nie widzi. To ryzyko utraty wyniku rozszerzonego, a klient traci odpowiedzi i dowód zaufania. Pokazać: FAQ jako akordeon, „O firmie” jako kompaktowa karta.
3a. **Tytuł strony głównej to samo „PRO-KOM Biznes”.** Najcenniejsza strona nie ma słów kluczowych w `<title>`. Propozycja (≤ 60 znaków): „Kasy fiskalne, komputery i opieka IT — Rabka | PRO-KOM Biznes” (K33 §8 pkt 3). Pole SEO w panelu: uzupełnić i dodać test, że tytuł głównej ≠ nazwa firmy.
3b. **Brak `WebSite` + `SearchAction`** w JSON-LD. Jest tylko `Organization+LocalBusiness` i `FAQPage`, a K33 §8 pkt 5 wymaga wyszukiwarki (`/oferta?q=`).
4. **Nagłówki:** 20 elementów H2, w tym ukryte okna („Szukaj w ofercie”, „Menu”, „Twoje zapytanie (0)”) i środek koła („Kasy i sprzedaż”). Okna powinny dostawać nagłówek dopiero po otwarciu albo mieć `role="dialog"` z `aria-labelledby` bez H2 w drzewie. Środek koła nie powinien być H2.
5. **Alt obrazów:** 151 z 169 ma pusty `alt`. Ozdobniki mogą, ale sprawdziłem, że puste są też zdjęcia produktów: `k3-ergo-01`, `k3-k10-01` w „Najczęściej wybierane” oraz `p-sunmi-d3-pro`, `p-posnet-ergo`, `p-lenovo-thinkpad`, `p-gopos-ekran`, `p-insert-subiekt-nexo`, `p-ubiquiti-u7` w witrynach działów. Potrzebny opis „marka + model” z pola produktu (K33 §8 pkt 7).
6. **Telefon, „Najczęściej wybierane”:** pierwsza karta zaczyna się w x = 0 (pomiar w Playwright), czyli bez 16 px marginesu, jaki mają inne karuzele (MOBILE-APLIKACJA). Dodać `padding-inline` i `scroll-padding` jak w pozostałych paskach.

## P1 — uporządkować: usunąć dublowanie, nie skracać na siłę
Zasada od Krystiana (06.11): **strona może być długa, ale każda sekcja musi mieć sens.** Test dla każdej sekcji: na jakie pytanie klienta odpowiada i czy żadna inna sekcja nie odpowiada już na nie wyżej. Długość nie jest celem. Celem jest brak powtórzeń i jasna droga od „kim jesteście” do „wysyłam zapytanie”.
1. **Cztery „huby nawigacji” robią to samo:**
   - Szybki start;
   - kafel „Nie wiesz, w którym dziale szukać?” (Plan / Zestawy / Cała oferta);
   - baner „Zobacz wszystkie marki · 39”;
   - przyciski „Zobacz plan” w każdej branży.

   Zostaje Szybki start. Z kafla zostaje samo pole szukania i podpowiedzi. Baner marek zastępuje link w nagłówku Marek.
2. **Branże + Plan to ta sama treść dwa razy.** Plan ma już 12 przycisków branż. Scalić w jedną sekcję:
   - przełącznik branż z ikonami i opisami;
   - plan;
   - przycisk „Gotowy zestaw dla tej branży” (dane `zestawy_na_glownej` są w paczce, a dziś nigdzie ich nie widać);
   - lista punktów 6 + „Pokaż wszystkie”;
   - pas dofinansowań.
3. **Działy:** liczba kategorii zostaje (to cenne linki wewnętrzne dla SEO). Poprawić tylko wyrównanie wysokości, bo karta „Serwis i usługi” ma pustą przestrzeń.
4. **Najczęściej wybierane:** 16 może zostać, bo pigułki filtrów dają sens. Na telefonie poprawić margines karuzeli.
5. **Marki:** dwa paski z prototypu (decyzja 06.11). Pokazują wszystkie 39 marek, a nie 16.
6. **„60 minut” 5 razy:** zostawić w hero, w zobowiązaniach i w formularzu.

## P2 — dodać
1. **Sekcja „Zaopatrzenie firm”** po Ofercie/Systemach (gotowa w prototypie, `ZAOPATRZENIE.md` §8). Daje też jeden ciemny, mocny pas w środku strony.
2. **Dowód od klientów, największa luka.** Opinie są za flagą (D-K4-6) i nic ich nie zastępuje. Minimum to jedno z:
   - ocena i liczba opinii z wizytówki Google, tylko prawdziwa i z linkiem;
   - 2–3 opinie z imieniem i firmą po zgodach;
   - pasek „Zaufali nam” z logotypami klientów za zgodą.

   Decyzja i zgody: szef.
3. **KSeF jako pilny powód:** wąski pas z terminem z panelu („Przygotujemy Twoją firmę do KSeF”), prowadzący do /ksef. Blok `BzKsef` istnieje, ale na głównej (komputer) go nie ma. Telefon ma tylko skrót „KSeF 2027”. Termin wpisuje się w panelu po sprawdzeniu w źródle (MF), bez wpisywania na sztywno.
4. **Aktualności (3 karty):** świeża treść dla SEO i powód, żeby Google wracał. Były w planie B7, na głównej ich nie ma.
5. **Lokalizacja:** mapa, zdjęcie salonu bez ludzi, „dziś otwarte do 17:00”. To lokalne SEO (spójne dane: nazwa, adres, telefon). Blok `BzLocation` istnieje. Najlepiej w lewej kolumnie formularza zamiast kafli kontaktu, które dublują stopkę.

## P3 — wygląd i ruch
- **Hero** zostaje. Lewa kolumna kończy się 4 drobnymi wierszami zaufania: można je zebrać w jeden rząd z ikonami, żeby hero było niższe (855 → ok. 760).
- **Rytm tła** jest dobry (białe i szare pasy). Brakuje jednego ciemnego „oddechu” w połowie strony. Da go Zaopatrzenie (granatowe karty), więc kolejnego nie dokładać.
- **Ruch:** wejście kaskadą kafli we wszystkich sekcjach, liczniki w „O firmie”, paski marek z wygaszaniem prędkości. Wszystko wyłączane przez `prefers-reduced-motion`, z jednym przyciskiem pauzy na sekcję z ruchem ciągłym.
- **Wydajność:** 169 obrazów i 205 linków. Sprawdzić `loading="lazy"` i `sizes` poniżej pierwszego ekranu i zmierzyć Lighthouse na stagingu (cel ≥ 90, telefon).

## Proponowana kolejność — strona jako odpowiedzi na pytania klienta
| # | Pytanie klienta | Sekcja |
|---|---|---|
| 1 | Kim jesteście i co robicie? | Hero z kołem |
| 2 | Od czego mam zacząć? | Szybki start |
| 3 | Co dokładnie macie? | Oferta: 5 działów + Systemy (GoPOS, InsERT, Opieka IT) |
| 4 | A jak potrzebuję tego dużo? | **Zaopatrzenie firm** (AGD i RTV, dostawy IT) |
| 5 | Czy to porządne marki? | **Marki w dwóch paskach** (39, ze statusami) |
| 6 | Co biorą inni? | Najczęściej wybierane (16 z filtrami) |
| 7 | Czy coś mnie goni? | **Pas KSeF** z terminem z panelu |
| 8 | Jak to będzie wyglądać u mnie? | Plan Twojej firmy z branżami, gotowym zestawem branży i dofinansowaniami |
| 9 | Jak się z wami pracuje? | Jak pracujemy + zobowiązania |
| 10 | Czy innym się opłaciło? | **Opinie klientów** (po zgodach) |
| 11 | Czy wam można ufać? | O firmie z 4 autoryzacjami |
| 12 | Czy jesteście na bieżąco? | **Aktualności** (3) |
| 13 | A jeśli mam wątpliwości? | FAQ |
| 14 | Jak się skontaktować i gdzie jesteście? | Kontakt z mapą, zdjęciem salonu i „dziś otwarte do” |

Telefon ma tę samą kolejność, z widocznym FAQ i „O firmie”. Długość wyjdzie podobna do dzisiejszej albo większa, ale bez sekcji, które się powtarzają.

## Do decyzji (Krystian / szef)
1. Usunięcie pól WhatsApp z panelu (migracja usuwająca dane).
2. Forma dowodu od klientów i zgody.
3. Treść i termin pasa KSeF.
4. Scalenie Branż z Planem (zmienia K4 v150 i wymaga dopisku do ADR-017).
