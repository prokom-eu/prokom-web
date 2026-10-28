# prokominstalacje.pl — specyfikacja strony

Wersja 1.0 · 27.10.2026 · wzorzec: wizualizacja v4.0 (w repo: `docs/design/prokominstalacje/prototyp/`; w czacie: canvas „prokominstalacje.pl · wizualizacja v3” — nazwa historyczna, treść = v4.0 — i klikalny prototyp).
Linia: **PRO-KOM Instalacje** (projekt, montaż i serwis instalacji niskoprądowych). Repo: `prokom-web` (tenant `instalacje`), praca w worktree `D:\PRO-KOM\repos\prokom-instal` — zasady w ADR-I001.

> **Kolejność ważności dokumentów:** `docs/stan/STAN-instalacje.md` (decyzje z sesji) → ta specyfikacja → ADR-I001…I004 → `docs/design/prokominstalacje/README.md` i dokumenty wzorca → prototyp → `zrodlo/`. Gdy prototyp i specyfikacja się różnią, wygrywa specyfikacja (prototyp pokazuje wygląd, specyfikacja mówi, co jest prawdą biznesową).

## 1. Cel i odbiorcy

**Cel biznesowy:** zapytania o instalacje (monitoring, alarmy, kontrola dostępu, sieci i Wi-Fi, teletechnika, anteny, smart home Ampio, nagłośnienie, ekrany, ładowarki EV) od klientów z Podhala i Małopolski. Miara sukcesu: liczba wysłanych formularzy „Zaplanuj instalację” i telefonów oraz pozycje w Google na frazy lokalne (§9 i `docs/strony/prokominstalacje-SEO.md`).

**Odbiorcy:** właściciele domów i domków letniskowych (także mieszkający daleko), pensjonaty, apartamenty i hotele, restauracje, sklepy, firmy i hale, kościoły, szkoły, gminy, deweloperzy i wykonawcy budów, a także **architekci, projektanci wnętrz, deweloperzy i generalni wykonawcy jako partnerzy** (osobna strona `/dla-architektow`, spec `prokominstalacje-architekci.md`, ADR-I005).

**Zasada strony:** „Dobieramy pod obiekt, nie pod markę”. Strona pokazuje, co instalacja robi w konkretnym obiekcie (interaktywne sceny, kalkulatory, symulatory), a nie katalog sprzętu.

## 2. Decyzje biznesowe, których nie wolno zmienić w kodzie

1. **Gwarancja PRO-KOM: 24 miesiące na montaż**; sprzęt według gwarancji producenta.
2. **„24 h” = odpowiedź na zgłoszenie w dni robocze** (oddzwonimy, odbierzemy albo odpiszemy). **Nigdy** „technik w 24 h”, „diagnoza do 24 h”, „czas reakcji”. Termin wizyty ustalamy w rozmowie.
3. **Brak „pakietu odbiorowego”** na całej stronie. Zakres dokumentacji ustalamy przed instalacją. Wyjątki świadome: protokoły pomiarów w teletechnice i u dewelopera (wymóg przepisów, część usługi), protokół pomiarów Wi-Fi na stronie Hotel, „zmieniamy hasła fabryczne”.
4. **Na Instalacjach nie ma oferty sprzętu ani cen sprzętu.** Marki (Ubiquiti, TP-Link Omada, Dahua, Hikvision, BCS, Satel, Ampio, APART, Elzab EcoPower) tylko jako informacja i zasada „dobieramy pod obiekt”. Sprzedaż sprzętu dla firm jest na prokombiznes.pl (link, nie kopia treści).
5. **Wyjątek: ładowarki Elzab EcoPower** — decyzja szefa 27.10: pełna oferta modeli (CC Home, CC Wall, CC City) z porównaniem i konfiguratorem wersji, **bez cen**.
6. **PRO-KOM nie montuje SSP ani DSO** (systemy pożarowe) — tylko integracja i współpraca z partnerem.
7. **Ampio:** głos tylko przez Matter; multiroom przez Sonos/HEOS/MusicCast; bez obietnicy 5 lat gwarancji Ampio do czasu potwierdzenia autoryzacji; alarm Ampio bez podanej klasy EN 50131.
8. **APART:** „marka założona w Belgii, dziś w grupie Biamp” — nie piszemy „belgijska jakość”.
9. **Kamery:** tematu dostawców wysokiego ryzyka (KSC) nie poruszamy na stronie (notka usunięta z prototypu 27.10 — nie przywracać).
10. **Na stronie nie ma list źródeł ani przypisów** (decyzja 26.10). Fakty muszą być prawdziwe, ale źródła trzymamy w dokumentacji, nie na stronie. Źródła-przypisy są usunięte z seeda; pozostałe klucze `src` w danych to zdjęcia i teksty (ADR-I002 §5). Przy przepisach tylko zdanie: „Opisujemy przepisy, które dotyczą instalacji. To nie jest porada prawna.”
11. **Ceny „od”** — tylko gdy szef poda; do tego czasu `InstalacjeSettings.pokazCeny = false`, na stronie „Wycena po wizji lokalnej”. Wszystkie znaczniki `[CENA]`, `[TELEFON]`, `[WHATSAPP]`, `[E-MAIL]`, `[ADRES ZAKOPANE]`, `[SZEF: …]` (pełna lista: `docs/strony/prokominstalacje-do-uzupelnienia.md`) — uzupełniane w panelu, nigdy na produkcji (test e2e sprawdza ich brak). Wyjątek dla testu: demo digital signage na stronie Ekrany ma przykładowe ceny smartfonów jako ilustrację ekranu — to nie jest oferta (oznaczone „Demo z przykładowymi cenami”).
12. **Hero strony głównej („Twój obiekt na żywo”) zostaje dokładnie jak w prototypie.**
13. **Kolor linii:** Turkus Instalacji `#0093B3` / `#12B6D8` (księga znaku, decyzja 15.10). Napis PRO-KOM grafitowy/biały, myślnik i kreska w kolorze linii.

## 3. Mapa strony i adresy

32 strony (od v4.2, 28.10.2026: `/dla-architektow`). Pełna lista sekcji każdej strony: `docs/design/prokominstalacje/MAPA-STRON.md`.

| Grupa | Strony i adresy |
|---|---|
| Główna | `/` |
| Usługi (10) | `/monitoring` · `/alarmy` · `/kontrola-dostepu` · `/sieci-wifi` · `/teletechnika` · `/anteny` · `/smart-home` · `/naglosnienie` · `/ekrany` · `/ladowarki-ev` |
| Dla kogo (12) | `/dla-kogo/dom` · `/dla-kogo/apartamenty` · `/dla-kogo/pensjonaty` · `/dla-kogo/hotele` · `/dla-kogo/restauracje` · `/dla-kogo/sklepy` · `/dla-kogo/firmy` · `/dla-kogo/koscioly` · `/dla-kogo/szkoly` · `/dla-kogo/gminy` · `/dla-kogo/deweloperzy` · `/dla-kogo/budowy` |
| Pozostałe | `/uslugi` (pełna oferta, 76 rozwiązań) · `/zaplanuj` · `/realizacje` · `/serwis` · `/poradnik` · `/poradnik/monitoring-a-rodo` · `/o-firmie` · `/kontakt` · **`/dla-architektow`** (Dla architektów i deweloperów) |
| Prawne (do zrobienia w I13) | `/polityka-prywatnosci` · `/cookies` · `/deklaracja-dostepnosci` · 404 · `/wyslane` (po wysłaniu formularza, pomiar konwersji) |

- Adresy usług bez prefiksu (krótkie, mocne frazy). Adresy obiektów pod `/dla-kogo/`. Polskie słowa bez znaków diakrytycznych, małe litery, myślniki.
- Prototyp ma pliki o nazwach `dom.html`, `hotele.html` itd. — to tylko nazwy plików wzorca, adresem publicznym jest tabela wyżej.
- **Routing domen (repo):** `proxy.ts` przepisuje host na `/<host>/<ścieżka>`, segment `[domain]` wybiera tenanta. Strony = dokumenty `Pages` z blokami linii (slug unikalny w ramach tenanta, więc `/kontakt` czy `/o-firmie` Instalacji nie kolidują z Biznesem). Trasy statyczne grup linii są wspólne dla wszystkich domen i rezerwują adres (`RESERVED_PAGE_SLUGS`): **`/oferta` należy do Biznesu, `/dziekujemy` i `/rozwiazania` do Software** — dlatego pełna oferta Instalacji to **`/uslugi`**, a strona po wysłaniu formularza **`/wyslane`**. Instalacje dodają tylko trzy trasy linii: `/dla-kogo/[obiekt]`, `/poradnik/[slug]` i `/wyslane` (noindex, poza sitemap — `Pages` nie ma przełącznika noindex). Szczegóły: ADR-I002 §0 i „Poprawki I0”. `/dla-architektow` to zwykła strona `Pages` z blokiem `InstArchitects` — Instalacje mają **11 bloków** (ADR-I005).

## 4. Nawigacja

### Desktop (≥ 1101 px)
- Górny pasek: godziny na żywo („Otwarte teraz, do 17:00” / „Zamknięte · otwieramy o 9:00”), „Tech · naprawy sprzętu” (link prokomserwis.pl), „Zgłoś awarię” → `/serwis#zglos`, telefon.
- Menu: **Usługi ▾** (mega menu: 10 usług w 3 kolumnach Bezpieczeństwo / Sieci i technika / Komfort i obraz, każda z ikoną i kolorem usługi, podpisem; na dole „Pełna oferta: 76 rozwiązań”) · **Dla kogo ▾** (12 obiektów w 4 grupach: Dom i noclegi / Firmy / Instytucje / Budownictwo; w panelu promocyjnym link „Architekt lub projektant? Współpraca →”) · **Dla architektów** (link w kolorze akcentu, ADR-I005 §4) · Realizacje · Serwis · Poradnik · O firmie · Kontakt | przełącznik motywu | „Zaplanuj instalację”.
- **Mega menu musi mieć niewidoczny „most”** nad panelem i opóźnienie zamykania 250–300 ms, klik przełącza (otwarte ponad 600 ms → zamyka), Esc zamyka, focus-trap w panelu. To był realny błąd w wizualizacji — test e2e: najazd na „Usługi”, przesunięcie kursora na pozycję, klik działa.
- Na stronie głównej po lewej szyna sekcji (≥ 1400 px), pojawia się po przewinięciu 400 px, podświetla aktywną sekcję.
- Na podstronach pod hero przyklejony pasek kotwic sekcji (pod nagłówkiem).

### Tablet (761–1100 px)
Nagłówek z przyciskiem menu; menu jako arkusz (ten sam komponent co na telefonie, wyśrodkowany, max 560 px).

### Telefon (≤ 760 px) — „jak aplikacja”
Szczegóły i definicja ukończenia: `docs/design/prokominstalacje/MOBILE-APLIKACJA.md`. W skrócie:
- Kompaktowy nagłówek (znak, motyw, telefon, menu), **chowany przy przewijaniu w dół, wraca przy przewijaniu w górę**.
- **Dolny pasek kart:** Start · Usługi · **Zaplanuj** (wyróżniony środek) · Dla kogo · Więcej. Usługi, Dla kogo i Więcej otwierają **arkusz od dołu** z trzema zakładkami.
- Arkusz „Więcej” zaczyna się od pozycji „Dla architektów”. Stopka (kolumna „Firma”): pierwsza pozycja „Dla architektów”.
- Interaktywne sekcje (sceny, kalkulatory) działają dotykiem; długie sekcje zwinięte (`fold.json`).

## 5. Strony — zakres i zachowanie

Dokładny wygląd: prototyp. Dokładne treści: `seed/` (zrzut z wizualizacji). Dokładna logika interakcji: `zrodlo/pages/<Nazwa>.js`. Poniżej to, czego nie widać na pierwszy rzut oka.

### 5.1 Strona główna `/`
- **Hero „Twój obiekt na żywo”** — scena SVG obiektu (dom, pensjonat, hotel, restauracja, sklep, firma) w trybie dzień/noc/zima, warstwy instalacji do włączania (kamery, Wi-Fi, alarm, dostęp, smart home, EV, nagłośnienie, ekrany), podgląd kamery „REC”, panel „Na żywo · <obiekt>” ze zdarzeniami, przycisk „Zaplanuj instalację” przenosi wybrany obiekt i warstwy do kreatora (`/zaplanuj#obiekt=pens&uslugi=kam,wifi`). Autoodtwarzanie zmienia obiekty, dopóki użytkownik nie dotknie sceny. Na telefonie scena nad tekstem, tło sekcji zgodne z porą sceny (noc ciemne, dzień/zima jasne) niezależnie od motywu strony.
- Dalej: Dla kogo (12 kafli), Usługi (10 kart z mini-ilustracjami), Realizacje, „Robimy to w górach” (mróz, burze, słabe łącze…), Jak pracujemy (6 kroków), **Dla architektów, projektantów i deweloperów** (`#architekci`, przekrój domu w wersji kompaktowej + karta „Nowość” — budowana w I16c, ADR-I005 §5), Realizacje… — kolejność wg `MAPA-STRON.md`: Dla kogo, Usługi, Architekci, Realizacje, Góry, Jak pracujemy, Serwis i przeglądy, FAQ, formularz „Zaplanuj instalację · 2 minuty” (usługi, obiekt, miejscowość, telefon, zgoda).

### 5.2 Strony usług (10)
Wspólny szkielet (komponenty w `zrodlo/inc/`): hero z ilustracją lub widżetem po prawej (`pheroA/pheroB`), pasek kotwic, sekcje własne usługi, **„Gwarancja i serwis”** (`odbsec`: gwarancja 24 mies., odpowiedź do 24 h w dni robocze, „Masz już instalację?” — przejęcie i odzyskanie dostępu), **przykładowe zestawy** (`pkgs`), **„Od czego zależy cena”** (`cena`, przycisk np. „Wyślij zdjęcia do wyceny”), **FAQ** (`faqsec`), **powiązane** (`relsec`: usługi + „Podobne obiekty”).
Sekcje własne (wszystkie interaktywne — logika w `zrodlo/pages/*.js`):
- **Monitoring:** wersje instalacji (schemat systemu z elementami do kliknięcia), rodzaje kamer, kalkulator „ile widać” (rozdzielczość, obiektyw, odległość → twarz/sylwetka), kalkulator dni nagrań, RODO (gdzie kamera może patrzeć), sprzęt (Dahua, Hikvision, BCS — informacyjnie).
- **Alarmy:** symulator zdarzeń (wejście, zalanie, mróz, brak prądu), tryby czuwania, wideodomofon.
- **Kontrola dostępu:** zakładki (apartament, firma…), symulator klawiatury z kodem i historią wejść.
- **Sieci i Wi-Fi:** kalkulator punktów dostępowych, osobne sieci (VLAN), łącze, światłowód.
- **Teletechnika:** warstwy instalacji w budynku, etapy budowy, formularz przedmiaru dla dewelopera (typ inwestycji, zakres; w wersji 1 bez uploadu — przedmiar mailem po zgłoszeniu, ADR-I002 §4) — działa i wysyła zapytanie.
- **Anteny:** SAT/DVB-T2, ustawianie azymutu i elewacji, quiz „co wybrać”.
- **Smart home Ampio:** mapa 12 obszarów sterowania, scenariusze, integracje.
- **Nagłośnienie (APART):** strefy z osobną głośnością, priorytet komunikatów, kalkulator dla kościoła/sali.
- **Ekrany i digital signage:** harmonogram treści, kalkulator, przykłady (menu board, recepcja).
- **Ładowarki Elzab EcoPower:** prezentacja 3 modeli ze zdjęciami (autoodtwarzanie), karty oferty, **konfigurator wersji** (model, punkty, moc, wyjście, montaż, kolor CC Wall z dopiskiem o dostępności) z wymaganiami przyłącza i przyciskiem do kreatora (konfiguracja przekazywana w `#konf=…`, ADR-I002 §4), porównanie 13 parametrów, kalkulator czasu ładowania, formalności (przyłącze, UDT, wspólnota, stacja ogólnodostępna). Zdjęcia: `public/instalacje/ev/{home,wall,city}.webp`.

### 5.3 Strony „Dla kogo” (12)
Jeden szablon + dane (`seed/prokominstalacje/obiekty/<klucz>.json`). Sekcje: hero, **interaktywny przekrój obiektu** (SVG z punktami-hotspotami, legenda warstw, opis wybranego punktu, autoodtwarzanie wyłączane poza ekranem i przy „ogranicz ruch”), 6 problemów, **doba z instalacjami** (oś czasu), przepisy (karty z artykułem i treścią, bez linków do źródeł), specyfika Podhala, zestawy, „co przygotować” (lista z odhaczaniem), FAQ (8), podobne obiekty. Pensjonat (`/dla-kogo/pensjonaty`) to rozbudowana strona „Obiekty noclegowe” (osobne źródło `Noclegowe.*`).
SVG przekrojów: gotowe w `zrodlo/pages/Seg*.body.html` (wygenerowane z `zrodlo/generator-obiektow/`) — przenieść jako komponenty SVG, bez rysowania od nowa.

### 5.4 Pozostałe
- **Pełna oferta `/uslugi`:** 76 rozwiązań w 10 obszarach, filtr po obiekcie, wyszukiwarka (literówki, polskie znaki), „Pokaż wszystkie”, nawigacja obszarów, lista „Zawsze w cenie”.
- **Zaplanuj `/zaplanuj`:** kreator 4 kroków (Instalacje → Obiekt → Szczegóły → Kontakt) z podpowiedziami, przyjmuje `#obiekt=…&uslugi=…` z innych stron, na końcu numer zgłoszenia i 3 kroki „co dalej”. Zapis przez adapter zapytań (ADR-003 repo), pola w ADR-I002.
- **Realizacje:** filtr po usłudze i obiekcie; na start placeholdery do czasu zdjęć i zgód (szef). Realizacje z seeda mają prawdziwe nazwy klientów — importowane jako wersje robocze bez zgody, niewidoczne (ADR-I002 §2).
- **Serwis:** formularz zgłoszenia (kto, system, objaw, pilność) — kotwica `#zglos`; przeglądy, przejęcie instalacji.
- **Poradnik + wpis „Monitoring a RODO”:** wpis z quizem; na końcu zdanie „To nie jest porada prawna”. Wpisy w kolekcji wpisów repo (tenant `instalacje`).
- **Dla architektów i deweloperów `/dla-architektow`:** cała specyfikacja w `prokominstalacje-architekci.md` (18 sekcji: przekrój domu z 17 punktami, etapy projektu, checklista, liczby do projektu, 10 instalacji, nowe rozwiązania z kolekcji `InstArchNews`, deweloperzy, przepisy 2026–2028, doświadczenie, biblioteka, opiekun, formularz „Wyślij rzuty”). Sesje I16a–c.
- **O firmie, Kontakt:** dane z ustawień (telefon, e-mail, adresy salonów Rabka i Zakopane, godziny), formularz kontaktowy z walidacją.

## 6. Formularze i zapytania
Wszystkie formularze: imię (gdzie jest), telefon (walidacja PL), zgoda RODO z linkiem do polityki, antyspam (honeypot + limit), komunikaty błędów przy polu, stan „wysłane” z numerem zgłoszenia. Zapis do skrzynki zapytań przez **istniejący adapter (ADR-003 w repo)** z `tenant = instalacje`, źródłem formularza (`inst-zaplanuj`, `inst-glowna`, `inst-kontakt`, `inst-serwis`, `inst-teletechnika-przedmiar`, `inst-usluga` → pole `category` jako etykieta po polsku) i danymi w istniejących polach kontraktu (mapa w ADR-I002 §4 — bez nowych kolumn). Powiadomienie e-mail na adres Instalacji z panelu. **Pliki (zdjęcia rozdzielnicy, rzuty, przedmiary) — nie w wersji 1** (decyzja I0, 28.10.2026): przy formularzach zdanie „prześlij mailem po zgłoszeniu — adres w potwierdzeniu”; upload jako osobne zadanie później.

## 7. Treści i dane
- Treść każdej strony jest w `seed/prokominstalacje/` (zrzut danych z wizualizacji). Seed jest **jedynym źródłem tekstów** — nie przepisywać tekstów „z pamięci” ani ze zrzutów ekranu.
- Dane wspólne: `seed/prokominstalacje/wspolne.json` (usługi, obiekty, kolory, nawigacja, dane kontaktowe z placeholderami).
- Edytowalne w panelu (Payload, tenant `instalacje`): dane kontaktowe i godziny, teksty hero i sekcji, FAQ, zestawy, czynniki ceny, ceny „od” (z przełącznikiem), realizacje, wpisy, SEO każdej strony. W kodzie: układ, sceny SVG, logika kalkulatorów i symulatorów (ADR-I002).

## 8. Wygląd
- Tokeny: `docs/design/prokominstalacje/tokens.css` → `src/styles/tokens.css` (bez wyboru gościa motyw za ustawieniem systemu, jak Biznes i Software — decyzja I0, ADR-I003 §6; przełącznik zapamiętany). Kroje: Archivo (nagłówki) i Manrope (tekst) — pliki lokalne już w repo (`next/font/local`).
- Wierność wzorcowi i sposób przenoszenia CSS: ADR-I003. Każda sesja z UI kończy się porównaniem `narzedzia/porownaj.mjs` (1440 i 390, jasny i ciemny).
- Animacje: wejście sekcji przy przewinięciu, autoodtwarzanie scen — **wszystko wyłączane przy `prefers-reduced-motion`** i wstrzymywane poza ekranem.

## 9. SEO (cel: najwyżej w Google na Podhalu i w Małopolsce)
Pełna strategia i lista techniczna: `docs/strony/prokominstalacje-SEO.md`. Minimum w każdej sesji z nową stroną: unikalny `title` (≤ 65 znaków) i `description` (≤ 155) z panelu, jeden H1, dane strukturalne (§ w dokumencie SEO), linkowanie wewnętrzne usługa ↔ obiekt, obrazy z `alt`, brak treści ukrytej przed Google (sekcje zwinięte na telefonie są w HTML).

## 10. Jakość i odbiór (Definition of Done każdej sesji)
- `pnpm lint`, `typecheck`, testy i build zielone; e2e zmienionych stron (formularze obowiązkowo).
- Porównanie ze wzorcem (`porownaj.mjs`) 1440 i 390 w obu motywach — rozbieżności opisane w PR albo poprawione.
- Telefon: 360, 390, 414 px bez poziomego przewijania; cele dotykowe ≥ 44 px; dolny pasek i arkusze działają (MOBILE-APLIKACJA.md §10).
- Lighthouse (telefon) ≥ 90 we wszystkich kategoriach na zmienionych stronach; CLS < 0,1; LCP < 2,5 s na stagingu.
- Dostępność: kontrast AA, focus widoczny, klawiatura w menu i arkuszach, `aria-*` w widżetach.
- Brak placeholderów `[...]` w treściach produkcyjnych (test).

## 11. Poza zakresem
Sklep i ceny sprzętu, panel klienta, czat na żywo, wersja angielska, płatności online, monitoring budowy jako usługa abonamentowa (do decyzji szefa), integracja z PRO-KOM System (2027 — zapytania trafiają do skrzynki repo).

## 12. Otwarte (do zamknięcia przed produkcją)
Pełna lista znaczników do uzupełnienia: `docs/strony/prokominstalacje-do-uzupelnienia.md`.
- [SZEF] telefon, e-mail i WhatsApp Instalacji; adres salonu w Zakopanem; ceny „od”; opinie Google i zdjęcia z montaży; 3–5 realizacji ze zgodą; autoryzacja Ampio; partner agencji ochrony, DSO i systemu głosowania; monitoring budowy (wynajem czy sprzedaż); dłuższa gwarancja w przetargach gmin; kto podpisuje protokoły pomiarów teletechniki.
- [Krystian] APART — dystrybutor i harmonogram w matrycach; Elzab — modele ze zdjęć 4–5, lepsze zdjęcie CC City, potwierdzenie parametrów i kolorów; polityka prywatności, cookies, deklaracja dostępności (treść); mapa przekierowań 301 ze starych adresów pro-kom.eu / pro-kom.pl dotyczących instalacji.
