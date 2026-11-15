# Elementy wspólne linii — wersja Biznes (prototyp 06.11.2026)

Prototyp: artefakt „Strona główna Biznes” (v2) — przełącznik u góry: Strona główna / O firmie / Kontakt, Jasny / Ciemny.
Źródła: szablony 02 Stopka, 04 Kontakt, 05 O firmie, 07 Boczna szyna i wyszukiwarka, 11 Nagłówek-kapsuła; `docs/marka.md`, ADR-007, ADR-022, K4-FINAL §1, decyzje 01.11.

## 1. Co jest w prototypie

| Element | Zgodnie z szablonem | Co dodałem albo zmieniłem dla Biznesu |
|---|---|---|
| **Pasek marki** 38 px | linie PRO-KOM · Biznes · Instalacje · Software · Tech · Gaming, status na żywo, „Konfigurator →”, „Biznes: 889 003 889”, bez tła, odjeżdża | ≤ 1180 px chowa „Konfigurator”, ≤ 1080 px chowa status (żeby nie łamać wiersza) |
| **Kapsuła** | 1280 px / 72 → 60 po 24 px (wartownik IntersectionObserver), promień 22 → 18, tło 72–78% + rozmycie 18 px + nasycenie 160%, refleks u góry 1 px, bez `backdrop-filter` → krycie 96% | Pigułka aktywnej pozycji **płynie** między linkami (scroll-spy: Oferta / Marki / O firmie / Kontakt); przycisk motywu słońce/księżyc; „Zapytanie” z licznikiem, gradient #4472DC → #2D5BC8 i poświata |
| **Mega menu „Oferta”** | panel 10 px pod kapsułą, ta sama szerokość i promień; DZIAŁY · kategorie z miniaturami + „Cały dział” · NA SKRÓTY; zamykanie po 280 ms, Esc | Wskaźnik działu przesuwa się sprężyście; miniatury kategorii (zdjęcia z `boards/media`, ikony tam, gdzie zdjęcia brak); pod nazwą kategorii marki z katalogu K4 (np. „Posnet · Elzab · Fawag”); tło kolumny barwi się kolorem działu; karta „Najczęściej wybierane w dziale” (Posnet Ergo, ThinkBook, Subiekt nexo, ESET, w Serwisie „Bezpłatny przegląd IT”); grupa **Zaopatrzenie firm** (AGD i RTV, Dostawy IT — „nowe”); pasek dolny: „Szukasz konkretnego modelu? Ctrl K” + autoryzacje. Klawiatura: ↓ z przycisku otwiera, ↑↓ działy, → do kategorii, ← wraca, Esc zamyka i oddaje fokus |
| **Boczna szyna ≥ 1400 px** | kolumna ikon 64 px, „Szukaj” na górze, rozwija się po 120 ms kaskadą (clip-path, bez skoku układu), zwija 250 ms po zjechaniu; Tab rozwija, Esc zwija; na dole akcja linii z licznikiem, linia postępu (CSS scroll-driven, zapas w JS), „Do góry” po 1 ekranie | Lista sekcji = **obecna** kolejność głównej po audycie (12): Start, Oferta, Zaopatrzenie firm, Marki, Najczęściej wybierane, KSeF 2027, Plan Twojej firmy, Jak pracujemy, O firmie, Aktualności, Pytania, Kontakt. Na podstronach: „Na tej stronie” + akordeon „Strona główna” (stan pamiętany do końca wizyty). Treść i kapsuła dostają `--rail-offset`, więc nic na siebie nie nachodzi |
| **Wyszukiwarka Ctrl K / „/”** | akcje (Zadzwoń, Drugi numer, Skopiuj numer, Napisz e-mail, Wyznacz trasę, Konfigurator, Motyw), literówki („lapotp” → „laptop”), „Nie mamy jeszcze…” + „Zapytaj o…” i drugi numer, ostatnio oglądane z „Wyczyść” | Podgląd po prawej dla **każdego** wyniku (produkt: zdjęcie, logo marki, status, korzyść, „Do zapytania”); polskie odmiany („kasa” znajduje „Kasy fiskalne”); „Zapytaj o…” otwiera Kontakt z wpisaną treścią. „Ostatnio oglądane” tylko w pamięci strony — zapis w przeglądarce dopiero po opinii prawnika (flaga z decyzji 02.11) |
| **Arkusz „Menu”** ≤ 1080 px | znak + krótka akcja + Menu | Działy jako rozwijane listy kategorii, skróty, blok kontaktu ze statusem; na telefonie wyjeżdża od dołu. Kapsuła na telefonie: 10 px od krawędzi, 58 px, chowa się przy przewijaniu w dół. Dolny pasek: środek = „Zapytanie” z licznikiem |
| **Stopka** | góra linii (granat #0A1430, ramka przerywana), kolumny Oferta / Usługi / Firma / Kontakt z mini-mapą, pas 6 linii z „Jesteś tutaj”, pasek prawny, „Do góry” | W Ofercie „AGD i RTV dla firm” i „Dostawy IT dla firm” (nowe); statusy pełnym brzmieniem z K4-FINAL; mapa w kolorach ciemnych z tokenów `--am-*` |
| **O firmie** | wizytówka firmy, 4 liczby, „Czego możesz od nas oczekiwać” (6), krok po kroku (4), rodzina linii, „Sprawdź sam”, „Odwiedź nas” z mapą | Logotypy autoryzacji w wizytówce, kopiowanie NIP jednym kliknięciem, lekkie przechylenie wizytówki za kursorem, kartka „wyceny” w kafelku 01, linia kroków rysuje się przy wejściu |
| **Kontakt** | telefon na pierwszym planie, karta salonu z mapą i dniami tygodnia (dziś podświetlone), „Z czym dzwonisz?”, formularz z „Co dalej”, zasięg z mapą miejscowości, inne linie, „Zanim zadzwonisz” | 4 sprawy zamiast 3 (doszła „Większa dostawa sprzętu”); kliknięcie sprawy zaznacza temat w formularzu i przewija do niego; lista z „Dodaj do zapytania” dołącza się do formularza; walidacja i ekran podziękowania |

## 2. Gdzie świadomie odszedłem od szablonu (zgodnie z naszymi decyzjami)
1. **E-mail:** `kontakt@prokombiznes.pl` (szablon miał biznes@pro-kom.eu) — decyzja 01.11.
2. **Bez „Salonu Zakopane”** na Kontakcie — Biznes: tylko Rabka (decyzja 01.11).
3. **Czas odpowiedzi:** „Oddzwonimy w 60 minut w godzinach pracy” (obietnica Biznesu ze strony głównej) zamiast „24 h” z wzoru Instalacji.
4. **Statusy** wyłącznie: Posnet/Elzab „Autoryzowany serwis”, GoPOS/InsERT „Autoryzowany partner” (K4-FINAL §1).
5. **Szyna:** sekcje z dzisiejszej głównej (po audycie 06.11), a nie lista startowa z szablonu (tam były „Systemy”, „Dla firm”, „Słowo właściciela”, których po przebudowie nie ma).
6. Zero cen, bez WhatsAppa, bez zdjęć ludzi, Gaming tylko jako odnośnik.

## 3. Do uzupełnienia (TODO, nie zgadywałem)
- `TODO(krystian):` liczba „100+ klientów firmowych” — do potwierdzenia przez szefa.
- `TODO(krystian):` link do listy serwisów Posnet, wyszukiwarki partnerów InsERT i wizytówki w Mapach Google.
- `TODO(krystian):` opis parkingu i wejścia (pole w panelu przy adresie, wspólne dla wszystkich stron).
- Link CEIDG prowadzi do wyszukiwarki CEIDG (wyszukanie po NIP robi użytkownik).

## 4. Dla Claude Code (gdy przyjdzie sesja F/L)
- Komponenty wspólne → `src/components/shared` (ADR-022); dane linii (sekcje szyny, akcja z licznikiem, skróty w mega menu) → `SiteSettings.shared`; firma, salon, godziny → `CompanyData`.
- Mega menu Biznesu: dane działów i kategorii z kolekcji katalogu (liczby z bazy, nie na sztywno); miniatura kategorii = pole obrazu w kategorii.
- Wyszukiwarka Biznesu = istniejąca K4b + grupa „Akcje” na górze (słowa: tel, telefon, dzwoń, mail, trasa, dojazd, motyw).
- Bez nowych bibliotek: wszystko to CSS + kilka obserwatorów (IntersectionObserver), zgodnie z kartą „Wydajność” szablonu 11.
- Sprawdzone w prototypie: 360, 390, 768, 820, 1024, 1100, 1200, 1366, 1400, 1440, 1920 px na trzech widokach — bez przewijania w poziomie i bez błędów JS; jasny i ciemny motyw.
