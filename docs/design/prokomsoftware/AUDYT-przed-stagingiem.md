# prokomsoftware.pl — audyt przed stagingiem (01.11.2026)

Wersja lokalna `software.localhost:3000` (develop po SWV6 + SWV7 B1, serwer dev). Sprawdzone:
- 42 adresy z `sitemap.xml` i wszystkie linki wewnętrzne;
- każda strona przy 390 px i 1440 px (automat: poziome przewijanie, cele dotyku, etykiety pól, nagłówki, H1);
- strona główna, O firmie, Kontakt, Pełna oferta, podstrona rozwiązania, Cennik, Audyt, Dobierz, Jedna firma, Rabka-Zdrój i 404 — oglądane na zrzutach;
- jasny i ciemny motyw, kontrast, formularz (walidacja bez wysyłki), kreator, menu telefonu;
- SEO (title, description, canonical, OG, JSON-LD), konsola.

Realizacja: sesja SWV8 (PR A = P0 + treści P1 1–11, PR B = wygląd P1 12–24 + P2). Decyzje Krystiana 01.11: Rabka bez zdjęcia — hero bez wizualu (nie `wejscie.jpg`); style Instalacji na Software — osobny PR strefy wspólnej `inst/wsp-*`, nie w SWV8.

## Werdykt
**Staging: tak, po sesji P0 (pół dnia).** Fundament jest bardzo dobry:
- 0 martwych linków;
- 0 poziomego przewijania na 84 widokach;
- H1 i etykiety pól wszędzie poprawne;
- dane firmy zgodne z v23, bez Zakopanego i bez Realizacji;
- ceny zgodne z cennikiem z 29.10;
- kontrast w normie w obu motywach;
- formularz waliduje po ludzku, a kreator działa.

**Produkcja:** po P0 i P1 oraz sprawach szefa (§5).

## P0 — przed stagingiem (błędy widoczne dla klienta)
| # | Gdzie | Problem | Poprawka |
|---|---|---|---|
| 1 | `/rozwiazania` (i 404) | **Błąd hydratacji React** (konsola + czerwony „1 Issue” w dev): `RevealObserver` dopisuje `data-reveal-pending` do kart katalogu, zanim React zhydratuje `Suspense` z `Catalog`. | Oznaczać elementy dopiero po hydratacji (np. `useEffect` w komponencie listy / `requestIdleCallback` po `load`), albo ukrywać przez CSS na kontenerze, nie dopisywać atrybutów do dzieci renderowanych przez React. Test e2e: brak `hydration` w konsoli na `/`, `/rozwiazania`, `/cennik`, 404. |
| 2 | `/miejscowosci/rabka-zdroj` (w sitemapie, link w stopce) | Widoczny placeholder **„ZDJĘCIE DO ZROBIENIA · Zdjęcie z miejscowości Rabka-Zdrój…”** w hero. | Wstawić `wejscie.jpg` (jak na Kontakcie) albo ukryć wizual, gdy brak zdjęcia. Strona ma ok. 330 słów — na start wystarczy, ale nie może mieć placeholdera. |
| 3 | `/aktualnosci` (menu główne, stopka „Aktualności i poradnik”) | **Pusta lista** — jedyny wpis (`wordpress-czy-strona-od-zera`) jest wersją roboczą. | Albo opublikować wpis po sprawdzeniu liczb (`sources[].verifiedAt`), albo ukryć „Aktualności” w menu i stopce, dopóki nie ma 1 opublikowanego wpisu (automatycznie: link tylko przy ≥ 1 wpisie). Rekomendacja: opublikować — wpis „WordPress czy strona od zera” wspiera sprzedaż. |
| 4 | wszystkie strony | **Brak `og:image`** (i `twitter:card=summary` bez obrazka). Link wrzucony na Facebooka / WhatsApp pokaże się bez zdjęcia. | Obraz 1200×630 dla tenanta Software (znak + hasło „Strony i programy dla firm. Zobaczysz, zanim zapłacisz.” na papierze/grafit) — w panelu (ustawienia strony) albo `opengraph-image` per tenant; `twitter:card=summary_large_image`. |
| 5 | Kontakt, notka pod formularzem | **„Odpowiemy w 1 dnia roboczego.”** — błąd gramatyczny (wstawka `[CZAS ODPOWIEDZI]` = „1 dnia roboczego” w zdaniu „Odpowiemy w …”). `src/seed/software/contact.ts:131`. | „Odpowiemy w ciągu [CZAS ODPOWIEDZI].” |
| 6 | Kontakt → „Inne linie PRO-KOM”; stopka | Nazwy linii niespójne: na Kontakcie **„PRO-KOM TECH”** (reszta strony: Serwis) i „PRO-KOM GŁÓWNA”; w stopce **„Jedna firma, pięć linii”**, a O firmie / Jedna firma: „cztery linie”. `src/seed/software/contact.ts:153,160`, `seed/prokomsoftware/nawigacja.json:344,377`. | TECH → **SERWIS**; „GŁÓWNA” → „pro-kom.eu” (to strona firmy, nie linia); stopka: „Jedna firma, cztery linie” + osobno „pro-kom.eu — wszystkie linie”. Migracja danych jak w SWV6. |

## P1 — przed produkcją (spójność treści i wygląd)
**Treści**
1. **Liczby obszarów nie zgadzają się z cennikiem.** Strona główna, „Osiem rzeczy”: Strony 7, Systemy 8, Aplikacje 4, Automatyzacje 3. Cennik i Pełna oferta: Strony 8, Systemy 10, Aplikacje 3, Automatyzacje 5. Klient porównuje i widzi inne liczby. Albo te same kategorie i liczby wszędzie, albo usuń liczby z kafli obszarów.
2. **Nazwy poziomów opieki.** Karta „Opieka i rozwój” na głównej podaje: Opieka podstawowa / z monitoringiem / nad systemem. Cennik podaje: Podstawowa / Rozszerzona / Systemy. Ujednolić do nazw z cennika.
3. **Jedno narzędzie ma kilka nazw.** W menu jest „Kreator”, w przyciskach „Dobierz rozwiązanie”. Na `/rozwiazania` jest opisane jako „Kreator w 60 sekund · 5 krótkich pytań, widełki ceny od razu”, a kreator ma **4 kroki** i pokazuje **cenę „od”**, nie widełki (`ContactBlock.tsx:30`). Poprawić na „4 krótkie kroki, cena „od” od razu”.
4. Kreator, „Rozbudowana strona”: „Wiele podstron, blog, języki, **rezerwacje**”. Rezerwacje online są wycofane z oferty (cennik 28.10), więc usunąć słowo „rezerwacje” (`kreator.json:73`).
5. Podgląd „Noclegi”, telefon: „Nowa rezerwacja… **Zaliczka opłacona online**”. To sprzeczne z „rezerwacja z zaliczką = osobna wycena”. Zmienić na „Nowe zapytanie o termin · 12–15 stycznia · 2 osoby” (`PreviewScreens.tsx:481`).
6. Strona główna: „Wszystkie 29 rozwiązań **są** w pełnej ofercie” to błąd → „Wszystkie 29 rozwiązań znajdziesz w pełnej ofercie.” W tym samym miejscu „Kliknij kartę, żeby zobaczyć szczegóły” powtarza się dwa razy (lead i licznik), więc z licznika usunąć.
7. O firmie, hero: „…serwis sprzętu, a **od tej strony** także strony, systemy i aplikacje” jest dwuznaczne. Propozycja: „…instalacje i serwis sprzętu. Software to nasza linia od stron, systemów i aplikacji dla firm.”
8. O firmie, tabela porównania: na ekranie widać „na Podhalu i w Małopolsce, **tak**”, „tak, **tak**, zapisane w umowie” (doklejone „tak”). Zostawić ikonę ✓ i sam opis.
9. Nagłówek FAQ „Pytania, które słyszymy najczęściej” nie ma kropki, a pozostałe H2 mają. Ujednolicić.
10. Górny pasek: „PRO-KOM Biznes · Instalacje”. Brakuje Serwisu i pro-kom.eu. Dodać albo zostawić tylko „Wszystkie linie PRO-KOM →”.
11. Mega menu „Dla branż” ma jedną pozycję (Budowlanka) i wygląda na niedokończone. Do czasu kolejnych branż: przenieść link do kolumny „Oferta” jako „Dla budowlanki i ekip” albo pokazać kolumnę przy ≥ 3 branżach. `/dla-branz` (lista) daje 404, ale nic tam nie linkuje — OK.

**Wygląd (desktop 1440)**

12. **Ucięte opisy z wielokropkiem w miejscach, gdzie tekst sprzedaje.** Dotyczy 4 intencji pod hero („Szybka, w kilku językach,…”, „Koniec z Excelem, kartka…”), kafli obszarów („Sprawdzimy i powiemy uczciwie…”) i zakładek warstw („Python · Django · R…”, „Docker · VPS w Pol…”). Pokazać pełny tekst (2–3 linie) albo skrócić tekst w seedzie, zamiast obcinać.
13. **Zawijanie w przyciskach:** „Dobierz w 60 **s**” (s w drugiej linii, desktop i telefon), „Pełna oferta **→**”, „Zapytaj o **wycenę**” w kafelkach kreatora. Dać `white-space: nowrap` w przyciskach, a „60 s” zapisać z twardą spacją.
14. Karty „12 rzeczy”: różne wysokości, przez co cena i termin nie stoją w jednej linii. Wyrównać (flex, cena na dole).
15. Kafle „Osiem rzeczy” są za wąskie przy 1440: nagłówki łamią się na 2–3 linie, cena „od 149 zł / mies.” na 2 linie. Kafle na 3 kolumny albo panel szczegółów węższy.
16. Podstrona rozwiązania: blok „W cenie” zajmuje lewą kolumnę, prawa jest pusta (duża dziura). Info-boksy w hero układają się 2 + 1. Poprawić siatkę (np. „W cenie” na pełną szerokość albo prawa kolumna: „Często łączone z” / CTA).
17. Podglądy: przy automatycznym przełączaniu cały panel jest przez chwilę **pusty** (lawendowe pole bez treści), bo stary ekran znika, zanim pojawi się nowy. Przenikanie powinno się nakładać (oba ekrany w jednym miejscu, `opacity` krzyżowo).
18. Podglądy, „Aplikacja mobilna”: na laptopie są puste szare prostokąty zamiast panelu biura. Wygląda na niedokończone, więc dać prawdziwą treść (lista zleceń, protokół).
19. Automatyczne przełączanie w trzech miejscach naraz (Osiem rzeczy, Podglądy, Proces). Zrzut złapał podświetlony kafel inny niż otwarty panel. Zatrzymać po pierwszym kliknięciu lub najechaniu, na telefonie nie przełączać wcale (użytkownik czyta). Podświetlenie zawsze z tego samego stanu.
20. Makieta hero: dymek „SMS wysłany” nachodzi na tekst karty „Zlecenia”. Przesunąć.

**Telefon (390)**

21. Kontakt: e-mail łamie się w środku słowa („kontakt@prokom|software.pl”); na desktopie „prokomsoftware.|pl”. Dać `overflow-wrap: anywhere` tylko po „@” albo mniejszą czcionkę i `white-space: nowrap`.
22. Podglądy: makieta to zmniejszony zrzut desktopu, a tekst w niej jest nieczytelny. Na telefonie pokazać ekran telefonu (już jest w makiecie) zamiast laptopa.
23. Proces: kroki 04 i 05 są poza ekranem bez żadnej wskazówki. Dać kropki/licznik albo zawinąć w 2 rzędy.
24. Karuzele (12 rzeczy, liczby WordPress, karty linii w stopce) nie mają wskaźnika. Pomysł już jest w „Pomysłach na później” (SWV7), warto zrobić przed produkcją.

**Zdjęcie wejścia** (Kontakt): na pierwszym planie są duże szyldy **ALSEN** i naklejka z ceną. Na stronie PRO-KOM Software to myli markę (z tego powodu w v23 odrzuciliśmy zdjęcie wnętrza). Kadr: wyciąć tak, żeby było widać drzwi i szyld PRO-KOM, a ALSEN był jak najmniejszy. Najlepiej zrobić nowe zdjęcie przy dziennym świetle.

## P2 — SEO i drobne
- Title strony głównej ma 78 znaków (Google utnie po ok. 60). Propozycja: „Strony i systemy dla firm — Rabka-Zdrój | PRO-KOM Software” (58). Title > 65 znaków mają też: `/rozwiazania` 69, `/rozwiazania/aplikacja-dla-ekip-w-terenie` 68, `/dla-branz/budownictwo-i-wykonczenia` 71.
- Description < 70 znaków: crm-dla-malej-i-sredniej-firmy (69), przebudowa-starej-strony (68), z-excela-do-systemu (63). Wydłużyć do 120–155.
- `/rozwiazania`: dwa H1 w HTML (wersja telefon i desktop). Drugie ukryte, ale lepiej jedno H1.
- `/rozwiazania`: w HTML z serwera jest 11 z 29 linków do rozwiązań, a reszta dochodzi w przeglądarce. Google zobaczy wszystkie przez sitemapę, ale lepiej wyrenderować wszystkie karty na serwerze (filtrowanie po stronie klienta zostaje).
- JSON-LD `LocalBusiness`: telefon w formacie `+48883200151`, dodać `email`, `geo` (49.60994, 19.95339), `image` (wejście), `areaServed`. `Service` na podstronach: dodać `areaServed` i `offers` z `price` dla rozwiązań z ceną „od”.
- Przycisk motywu: w ciemnym motywie nadal pokazuje księżyc, a powinien słońce.
- Pole zgody (checkbox) ma 22×22 px. Sprawdzić, czy cała etykieta jest klikalna, wtedy jest OK. Link „autorzy OpenStreetMap” ma 15 px wysokości, przy minimum 24 px.
- Style Instalacji (ok. 370 KB) ładują się na Software. Jest już w „Pomysłach na później” jako osobne zadanie strefy wspólnej i warto je zrobić przed produkcją (Lighthouse).

## Animacje (stan po SWV7 B1)
- Wszystkie elementy klikalne mają przejście (149/149 na głównej, 100% na podstronach).
- Wjazd sekcji: główna 10/13, O firmie 5/8, Cennik 5/7, Kontakt 2/5, podstrona rozwiązania 1/5. Resztę ma dać B2 (sekcje i podstrony). Po scaleniu B2 sprawdzić Kontakt i podstrony rozwiązań.
- Z „Pomysłów na później” warto zrobić przed produkcją: kropki pod karuzelami na telefonie, miękkie zamykanie FAQ, szkielet ładowania mapy.

## Sprawy szefa i poza kodem (blokują produkcję, nie staging)
1. Polityka prywatności: **[OKRES PRZECHOWYWANIA]** i **[DATA AKTUALIZACJI]**. Decyzja szefa (propozycja: zapytania bez umowy 12 mies.; data = dzień publikacji).
2. Akceptacja szefa: cennik (jedna cena „od”), O firmie, polityka.
3. Skrzynka kontakt@prokomsoftware.pl działa i odbiera powiadomienia z formularzy (S10d-1).
4. Wpis „WordPress czy strona od zera”: sprawdzić liczby (Patchstack 2025: 7 966 luk w 2024 r., 96% we wtyczkach) i opublikować (P0 #3).
5. Zdjęcie wejścia bez dominującego ALSEN (P1).

## Prompt dla Claude Code (SWV8)
```
/zadanie SWV8 — poprawki z audytu przed stagingiem Software (docs/design/prokomsoftware/AUDYT-przed-stagingiem.md).
Gałąź fix/software-swv8 od origin/develop (po scaleniu SWV7 B2). Dwa PR-y piętrowe: A = P0 + treści P1 (1–11), B = wygląd P1 (12–24) + P2.
Zakres: dokładnie tabele P0, P1 i P2 z pliku audytu, w tej kolejności. Zasady:
- Teksty zmieniasz w seedzie + migracja danych (jak SWV6), żeby staging/produkcja dostały je z pipeline'u.
- P0 #1 (hydratacja): najpierw test e2e, który łapie błąd hydratacji w konsoli na /, /rozwiazania, /cennik, 404 — potem poprawka RevealObserver.
- P0 #3: link „Aktualności” w menu i stopce tylko, gdy jest ≥ 1 opublikowany wpis (test). Wpisu nie publikujesz sam — to decyzja Krystiana po sprawdzeniu liczb.
- P0 #4: obraz OG 1200×630 tylko z tokenów i znaku (bez nowych zależności); jeśli wymaga nowej biblioteki — zapytaj.
- P1 #12–20: zrzuty przed/po w 1440 i 390, jasny i ciemny, w opisie PR.
- Nie ruszaj: cen (zgodne z cennikiem 29.10), danych firmy, decyzji v23.
- Polityka [OKRES PRZECHOWYWANIA]/[DATA AKTUALIZACJI] zostaje jako TODO(krystian) — decyzja szefa.
Na koniec /przeglad, /pr, STAN.md (lista „Przed stagingiem SWV8”).
```
