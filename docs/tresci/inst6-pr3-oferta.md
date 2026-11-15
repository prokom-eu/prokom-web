# INST-6 PR3 — pełna oferta: było → jest

Strona `/uslugi`, 10 opisów obszarów i 76 rozwiązań (słownik `src/seed/instalacje/teksty/uslugi/oferta.ts`). Hero i pas CTA `/uslugi` — `src/seed/instalacje/formPages.ts`.

# INST-6 PR3 — /uslugi (pełna oferta) i 76 rozwiązań

## Nagłówki i leady strony /uslugi (kod: src/sites/instalacje/dane/oferta.ts)

| Miejsce | Było | Jest |
|---|---|---|
| uslugi · hero nadtytuł (eyebrow, kod) | Pełna oferta · 10 obszarów · 76 rozwiązań | 76 rozwiązań w 10 obszarach |
| uslugi · #zawsze nadtytuł | W każdej instalacji | Jak pracujemy |
| uslugi · #zawsze H2 (`b.h2`) | Nie sprzedajemy pudełek. Oddajemy działający system. | Co dostajesz przy każdej instalacji |
| uslugi · #zawsze lead | Niezależnie od tego, czy to jedna kamera, czy cały pensjonat, zakres jest ten sam: od wizji lokalnej po serwis. Wszystko na piśmie przed montażem. | Przy jednej kamerze i przy całym pensjonacie zakres jest ten sam, od wizji lokalnej po serwis. Wycenę i zakres prac dostajesz na piśmie przed montażem. |
| uslugi · #zawsze punkty | Montaż czysto i w ustalonym terminie / Pokazujemy obsługę i aplikację | Czysty montaż w ustalonym terminie / Pokazujemy, jak obsługiwać system i aplikację |
| uslugi · brak wyników (`b`) | Nie mamy tego na liście. | Nie znaleźliśmy tego w ofercie |
| uslugi · brak wyników tekst | Opisz, czego szukasz — dobierzemy. | Opisz, czego szukasz, a dobierzemy rozwiązanie. |

## Propozycja (NIE wdrożona) — hero i pas CTA /uslugi: blok `instOffer` w panelu, seed w `src/seed/instalacje/formPages.ts` → `uslugi()` (poza TEXT_FIELDS skryptu inst:texts)

| Miejsce | Było | Proponuję |
|---|---|---|
| uslugi · hero H1 (h1a + h1b) | Oferta instalacji na Podhalu: / monitoring, alarmy, sieci, smart home, nagłośnienie. | Instalacje dla domu, pensjonatu i firmy na Podhalu (h1b pusty albo bez drugiej linii) |
| uslugi · hero lead | Od kamery przy furtce po nagłośnienie kościoła i ekrany z treścią zmienianą zdalnie. Wybierz swój obiekt albo wpisz, czego szukasz, a pokażemy tylko to, co ma dla Ciebie sens. | Montujemy monitoring, alarmy, Wi-Fi, smart home, nagłośnienie, ekrany, anteny i ładowarki. Wybierz rodzaj obiektu albo wpisz, czego szukasz, a pokażemy pasujące rozwiązania. |
| uslugi · CTA H2 | Nie wiesz, co wybrać? Pomożemy ułożyć zestaw. | Pomożemy ułożyć zestaw pod Twój obiekt |
| uslugi · CTA tekst | Opisz obiekt. Zaproponujemy, od czego zacząć, i wycenimy na piśmie. | Opisz obiekt, a zaproponujemy, od czego zacząć, i przygotujemy wycenę na piśmie. |

## Opisy obszarów (oferta-76.json obszary[].opis → InstServices.offer.description, widoczne tylko na /uslugi)

| Obszar | Było | Jest |
|---|---|---|
| kam | Kompletny system, a nie same kamery: rejestrator, dyski do pracy 24/7, zasilanie PoE, UPS i aplikacja w telefonie. | Kamery razem z rejestratorem, dyskami do pracy całą dobę i zasilaczem awaryjnym (UPS). Obraz i nagrania oglądasz w aplikacji w telefonie. |
| alarm | Czujki, syreny i powiadomienia na telefon, a przy furtce wideodomofon, który odbierasz z dowolnego miejsca. | Alarm powiadamia Cię na telefonie, gdy ktoś wejdzie do domu albo firmy. Wideodomofon przy furtce odbierasz z dowolnego miejsca. |
| kd | Kody, karty i zamki elektroniczne. Gość albo pracownik wchodzi sam, a Ty wiesz, kto i kiedy. | Zamki na kod i na karty. Gość albo pracownik wchodzi sam, a Ty wiesz, kto i kiedy otworzył drzwi. |
| wifi | Sieć, która działa w każdym pokoju i nie pada w sezonie: okablowanie, szafy, światłowód, Wi-Fi i łącze zapasowe. | Wi-Fi w każdym pokoju i sieć, która wytrzymuje pełny obiekt w sezonie. Kładziemy kable i światłowód, montujemy szafy i łącze zapasowe. |
| tel | Dla deweloperów, wykonawców i inwestorów: instalacje słaboprądowe budynku z pomiarami i dokumentacją do odbioru. | Internet, telewizja, domofony i sieć w nowym budynku, z pomiarami i dokumentacją do odbioru. Dla deweloperów, wykonawców i inwestorów. |
| ant | Anteny ustawiane miernikiem i montowane z zapasem na halny. Od domu po telewizję w każdym pokoju pensjonatu. | Anteny ustawiamy miernikiem i mocujemy tak, żeby wytrzymały halny. Montujemy je w domach i w pensjonatach, z telewizją w każdym pokoju. |
| smart | Polski system Ampio. Światło, ogrzewanie, rolety, brama, alarm i kamery w jednej aplikacji. Działa także bez internetu. | Polski system Ampio: światło, ogrzewanie, rolety, bramę, alarm i kamery obsługujesz w jednej aplikacji. Dom działa także bez internetu. |
| snd | Stałe nagłośnienie APART i innych marek: muzyka w tle, komunikaty i mowa zrozumiała w ostatniej ławce. | Stałe nagłośnienie APART i innych marek do muzyki w tle i komunikatów. W kościele mowę dobrze słychać także w ostatniej ławce. |
| scr | Ekrany profesjonalne do pracy wiele godzin dziennie i treść zmieniana zdalnie. Wdrażamy to w naszym salonie. | Ekrany zrobione do pracy przez wiele godzin dziennie. Treść zmieniasz zdalnie, z komputera. |
| ev | Pełna oferta ładowarek Elzab EcoPower produkowanych w Polsce: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Z doborem mocy do przyłącza i montażem. | Ładowarki Elzab EcoPower produkowane w Polsce: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Dobieramy moc do Twojego przyłącza i montujemy. |

## 76 rozwiązań (InstSolutions.name / description)

| # | Obszar | Nazwa było | Nazwa jest | Opis było | Opis jest |
|---|---|---|---|---|---|
| 1 | kam | Monitoring domu i posesji | = bez zmian | Podjazd, furtka i ogród. Podgląd i nagrania w telefonie. | Kamery na podjazd, furtkę i ogród domu albo domku letniskowego. Obraz i nagrania oglądasz w telefonie. |
| 2 | kam | Monitoring pensjonatu i hotelu | = bez zmian | Parking, wejścia i narciarnia, bez zaglądania do pokoi gości. | Kamery na parking, wejścia i narciarnię. Pokoje gości zostają poza kadrem. |
| 3 | kam | Monitoring firmy, hali i placu | = bez zmian | Wjazd, rampa, magazyn i kasy. Nagrania jako dowód. | Kamery na wjazd, rampę, magazyn i kasy. Nagranie przyda się jako dowód przy kradzieży albo szkodzie. |
| 4 | kam | Kamery z kolorem w nocy i detekcją AI | Kamery z kolorem w nocy i wykrywaniem ludzi | Rozpoznają ludzi i auta, dzięki czemu jest mniej fałszywych alarmów od zwierząt, liści i śniegu. | Kamera odróżnia człowieka i auto od zwierzęcia, liści i śniegu, więc dostajesz mniej fałszywych powiadomień. |
| 5 | kam | Rejestratory NVR i dyski do monitoringu | Rejestrator i dyski na nagrania | Dysk dobrany do liczby kamer i czasu przechowywania nagrań. | Rejestrator (NVR) zapisuje obraz ze wszystkich kamer. Dysk dobieramy do liczby kamer i tego, ile dni nagrań chcesz trzymać. |
| 6 | kam | Switche PoE, UPS i szafa rack | Zasilanie kamer, UPS i szafa na sprzęt | Kamera zasilana tym samym kablem, którym przesyła obraz. Z zasilaczem UPS system działa jeszcze przez pewien czas po zaniku prądu. | Kamera dostaje prąd tym samym kablem, którym wysyła obraz (PoE). Zasilacz awaryjny UPS podtrzymuje system przez pewien czas po zaniku prądu. |
| 7 | kam | Rozpoznawanie tablic rejestracyjnych | = bez zmian | Wjazd na parking, brama albo szlaban i historia aut. | Kamera odczytuje tablice aut przy wjeździe, bramie albo szlabanie. Widzisz, które auto i kiedy wjechało. |
| 8 | kam | Kamery tam, gdzie nie ma kabla | = bez zmian | Most radiowy do odległej bramy albo łącze komórkowe na budowę. | Obraz z odległej bramy przesyła most radiowy, a z budowy łącze komórkowe. Nie trzeba kopać rowu pod kabel. |
| 9 | kam | Monitoring z maskami prywatności | = bez zmian | Maski prywatności, czas nagrań i miejsca na tabliczki. | Zasłaniamy w obrazie okna sąsiadów i ulicę. Ustawiamy, po ilu dniach nagrania się kasują, i wskazujemy miejsca na tabliczki. |
| 10 | kam | Przejęcie i modernizacja starego monitoringu | Unowocześnienie starego monitoringu | Wymiana kamer analogowych, pomoc w odzyskaniu dostępu, nowy rejestrator. | Wymieniamy stare kamery analogowe i rejestrator na nowe. Pomagamy też odzyskać dostęp, gdy nie masz hasła do rejestratora. |
| 11 | alarm | Alarm do domu i mieszkania | = bez zmian | Czujki ruchu i otwarcia, syrena, sterowanie z aplikacji. | Czujki ruchu i otwarcia drzwi lub okien, syrena i powiadomienie na telefon. Alarm włączasz i wyłączasz w aplikacji. |
| 12 | alarm | Alarm bezprzewodowy bez kucia ścian | = bez zmian | Do wykończonego domu, apartamentu i biura. | Montaż bez kabli w ścianach, więc nadaje się do wykończonego domu, apartamentu i biura. |
| 13 | alarm | Ochrona domu letniskowego | = bez zmian | Czujki zalania, dymu i spadku temperatury działające całą dobę. | Czujki zalania, dymu i spadku temperatury pilnują domu całą dobę. Gdy coś się dzieje, dostajesz powiadomienie na telefon. |
| 14 | alarm | Alarm dla firmy i sklepu | = bez zmian | Strefy, harmonogram uzbrojenia i opcjonalnie agencja ochrony. | Osobne strefy, np. biuro i magazyn, i alarm włączany o stałej godzinie. Na życzenie podłączamy agencję ochrony. |
| 15 | alarm | Wideodomofon z aplikacją | = bez zmian | Widzisz, kto stoi przy furtce, i otwierasz z telefonu. | = bez zmian |
| 16 | alarm | Wideodomofon na starych dwóch przewodach | Nowy wideodomofon na starym kablu | Modernizacja bez kucia, jeśli przewód się nada. | Jeśli stary dwużyłowy przewód się nada, wymieniamy domofon bez kucia ścian. Sprawdzamy to przed montażem. |
| 17 | alarm | Domofony dla wspólnot i budynków | = bez zmian | Panel z listą lokatorów, kody, breloki i aplikacja. | Panel przy wejściu z listą lokatorów. Drzwi otwierasz kodem, brelokiem albo w aplikacji. |
| 18 | alarm | Brama i furtka sterowane z telefonu | Brama i furtka otwierane telefonem | Otwieranie z aplikacji wideodomofonu albo z panelu. | Otwierasz je w aplikacji wideodomofonu albo z panelu. |
| 19 | kd | Zamki z kodem do apartamentów | = bez zmian | Kod ważny tylko w czasie pobytu, wysyłany automatycznie, jeśli Twój system rezerwacji to obsługuje. | Gość dostaje kod ważny tylko na czas pobytu. Jeśli Twój system rezerwacji to obsługuje, kod wysyła się sam. |
| 20 | kd | Hotelowe zamki na karty | = bez zmian | Koder kart na recepcji i rejestr otwarć. | Recepcja koduje kartę dla gościa, a system zapisuje każde otwarcie drzwi. |
| 21 | kd | Karty i breloki dla pracowników | = bez zmian | Strefy, godziny wejść, blokada zgubionej karty od ręki. | Każdy pracownik wchodzi tylko do swoich stref i w swoich godzinach. Zgubioną kartę blokujesz od ręki. |
| 22 | kd | Kontrola wjazdu | Wjazd przez bramę i szlaban | Brama i szlaban na pilota, kartę albo aplikację. | Bramę albo szlaban otwierasz pilotem, kartą albo w aplikacji. |
| 23 | kd | Kontrola dostępu we wspólnocie | Karty do drzwi we wspólnocie | Karty do klatek, garaży i śmietników. | Mieszkańcy otwierają kartą klatkę, garaż i wiatę śmietnikową. |
| 24 | kd | Harmonogramy i historia wejść | Historia wejść i godziny otwarcia drzwi | Kto, kiedy i którymi drzwiami. | Widzisz, kto, kiedy i którymi drzwiami wszedł. Drzwi mogą być otwarte tylko w ustalonych godzinach. |
| 25 | wifi | Wi-Fi w całym domu i ogrodzie | = bez zmian | Bez martwych stref, jedna nazwa sieci. | Telefon łapie Wi-Fi w każdym pokoju i w ogrodzie, a sieć ma jedną nazwę w całym domu. |
| 26 | wifi | Wi-Fi dla gości z portalem logowania | Wi-Fi dla gości z ekranem logowania | Osobna sieć gości, logo obiektu, vouchery na czas pobytu. | Goście mają osobną sieć z logo Twojego obiektu. Dostęp dajesz kodem ważnym na czas pobytu. |
| 27 | wifi | Sieć firmowa i bezpieczeństwo | Bezpieczna sieć w firmie | Router, firewall i osobne sieci dla kas, kamer i gości. | Router z zaporą (firewall) i osobne sieci dla kas, kamer i gości. Gość nie dostanie się do kasy ani kamer. |
| 28 | wifi | Okablowanie strukturalne | = bez zmian | Gniazda, patchpanele i pomiary torów. Zakres dokumentacji ustalamy przed instalacją. | Gniazda sieciowe w pokojach, kable opisane w szafie i każdy tor sprawdzony miernikiem. Zakres dokumentacji ustalamy przed instalacją. |
| 29 | wifi | Szafy rack i porządek w kablach | Szafa na sprzęt i porządek w kablach | Opisane porty, zasilanie awaryjne, wentylacja. | Opisujemy każdy port, dodajemy wentylację i zasilanie awaryjne. Przy awarii od razu wiadomo, który kabel dokąd prowadzi. |
| 30 | wifi | Światłowód i spawanie | Światłowód między budynkami | Między budynkami i na dłuższych odcinkach, odporny na przepięcia. | Łączy budynki i sprawdza się na dłuższych odcinkach. Jest odporny na przepięcia, np. po burzy. |
| 31 | wifi | Mosty radiowe między budynkami | Most radiowy między budynkami | Internet i kamery w drugim budynku bez kopania rowu. | Dwie anteny przesyłają internet i obraz z kamer do drugiego budynku. Nie trzeba kopać rowu pod kabel. |
| 32 | wifi | Łącze zapasowe | = bez zmian | Gdy padnie główne łącze, sieć przełącza się na zapasowe. | Gdy padnie główny internet, sieć sama przełącza się na zapasowe łącze. |
| 33 | wifi | Zdalny nadzór nad siecią | Zdalna opieka nad siecią | Przy umowie z nadzorem często widzimy awarię, zanim zadzwonisz. Wiele rzeczy naprawiamy zdalnie. | Przy umowie na opiekę często widzimy awarię, zanim zadzwonisz. Wiele usterek naprawiamy zdalnie, bez przyjazdu. |
| 34 | tel | Instalacja telekomunikacyjna w nowym budynku | Internet i telewizja w nowym budynku | Gotowa na internet, telefon i telewizję od wielu operatorów, ze światłowodem do każdego mieszkania. | Każde mieszkanie dostaje światłowód i może wybrać jednego z wielu operatorów internetu, telefonu i telewizji. |
| 35 | tel | Światłowód do lokali | = bez zmian | Od punktu styku do każdego mieszkania i lokalu. | Światłowód od punktu styku, czyli miejsca, w którym operatorzy wchodzą do budynku, do każdego mieszkania i lokalu. |
| 36 | tel | RTV/SAT zbiorcza | = bez zmian | Jedna antena, sygnał w każdym lokalu. | Jedna wspólna antena na dachu daje telewizję w każdym lokalu. |
| 37 | tel | Domofony i wideodomofony w klatkach | = bez zmian | Panele wejściowe, unifony i monitory. | Panel przy wejściu do klatki i słuchawka albo monitor w każdym mieszkaniu. |
| 38 | tel | Okablowanie biur i lokali usługowych | Sieć w biurach i lokalach usługowych | Gniazda, szafa, punkty dostępowe. | Gniazda sieciowe przy biurkach, szafa na sprzęt i Wi-Fi w całym lokalu. |
| 39 | tel | Pomiary i dokumentacja powykonawcza | Pomiary i dokumentacja do odbioru | Protokoły pomiarów i opis tras do odbioru budynku. W firmach i instytucjach zakres dokumentacji ustalamy przed instalacją. | Protokoły pomiarów i opis, którędy biegną kable, gotowe do odbioru budynku. W firmach i instytucjach zakres dokumentacji ustalamy przed instalacją. |
| 40 | ant | Anteny satelitarne | = bez zmian | Ustawienie miernikiem na Hot Bird 13°E. | Talerz ustawiony miernikiem na satelitę Hot Bird 13°E. |
| 41 | ant | Anteny naziemne DVB-T2 | = bez zmian | Dobór kierunku i nadajnika na Podhalu. | DVB-T2 to naziemna telewizja cyfrowa. Wybieramy nadajnik, który u Ciebie najlepiej odbiera, i ustawiamy w jego stronę antenę. |
| 42 | ant | Instalacje zbiorcze | Jedna antena na cały budynek | Multiswitch i rozprowadzenie w budynku. | Multiswitch rozdziela sygnał z jednej anteny na wiele telewizorów w budynku. |
| 43 | ant | Telewizja w pensjonacie i hotelu | = bez zmian | Ten sam zestaw kanałów w każdym pokoju. | Goście mają w każdym pokoju ten sam zestaw kanałów. |
| 44 | ant | Serwis po halnym i burzy | = bez zmian | Ponowne ustawienie, wymiana konwertera i okablowania. | Ustawiamy antenę od nowa, wymieniamy uszkodzony konwerter albo kable. |
| 45 | smart | Smart home w nowym domu | = bez zmian | Projekt przed tynkami, okablowanie i rozdzielnica. | Planujemy instalację przed tynkami, kładziemy kable i montujemy rozdzielnicę. |
| 46 | smart | Smart home w remoncie | = bez zmian | Modernizacja bez przebudowy całego domu. | Dokładamy sterowanie do domu, w którym już mieszkasz, bez przebudowy wszystkich instalacji. |
| 47 | smart | Oświetlenie i sceny | = bez zmian | Jednym dotknięciem: przyjazd, wyjście, noc, kino. | Jednym dotknięciem ustawiasz światło na przyjazd, wyjście, noc albo seans filmu. |
| 48 | smart | Ogrzewanie strefowe i pompa ciepła | Ogrzewanie pokój po pokoju | Każdy pokój osobno, harmonogramy i tryb oszczędny. | Każdy pokój ma swoją temperaturę i godziny grzania, także z pompą ciepła. Gdy nikogo nie ma, dom grzeje oszczędniej. |
| 49 | smart | Rolety, żaluzje i markizy | = bez zmian | Według godziny, słońca i wiatru. | Rolety i markizy same się podnoszą i opuszczają według godziny, słońca i wiatru. |
| 50 | smart | Fotowoltaika i zarządzanie energią | Fotowoltaika i zużycie prądu | Prąd ze słońca tam, gdzie się opłaca. | Prąd z paneli słonecznych kierujemy tam, gdzie w danej chwili najbardziej się opłaca. |
| 51 | smart | Szklane panele Ampio M-DOT | Szklane włączniki Ampio M-DOT | Własne ikony, podpisy i kolor szkła. | Na szklanym włączniku sam wybierasz ikony, podpisy i kolor szkła. |
| 52 | smart | Integracja z alarmem, kamerami i bramą | Połączenie z alarmem, kamerami i bramą | Jedna aplikacja zamiast pięciu. | Alarm, kamery i bramę obsługujesz w tej samej aplikacji co światło i ogrzewanie. |
| 53 | smart | Smart apartament i pensjonat | Smart home w apartamencie i pensjonacie | Puste pokoje w trybie oszczędnym, nagrzanie przed przyjazdem. | Pusty pokój grzeje oszczędnie, a przed przyjazdem gościa sam się nagrzewa. |
| 54 | smart | Sterowanie głosem i Matter | Sterowanie domem głosem | Apple, Google i Alexa, jeśli lubisz mówić do domu. | Mówisz do telefonu albo głośnika Apple, Google lub Alexa. Urządzenia różnych marek łączy standard Matter. |
| 55 | snd | Muzyka w restauracji i kawiarni | = bez zmian | Sala, bar, taras i toalety z osobną głośnością. | Muzyka na sali, przy barze, na tarasie i w toaletach, każda strefa z osobną głośnością. |
| 56 | snd | Nagłośnienie hotelu i pensjonatu | = bez zmian | Jadalnia, recepcja, SPA i sala, komunikaty do wybranych stref. | Muzyka w jadalni, recepcji, SPA i na sali. Komunikat puszczasz tylko tam, gdzie trzeba. |
| 57 | snd | Nagłośnienie kościoła | = bez zmian | Zrozumiała mowa, a nie tylko głośniej. | Kazanie i czytania słychać wyraźnie w każdej ławce, także z tyłu kościoła. |
| 58 | snd | Sale konferencyjne i sale obrad | Nagłośnienie sali konferencyjnej i sali obrad | Mikrofony, nagrywanie i transmisja. | Mikrofony dla mówców, nagranie spotkania i transmisja do internetu. |
| 59 | snd | Sklepy: muzyka i komunikaty | Muzyka i komunikaty w sklepie | Tło dla klientów i komunikaty dla obsługi. | Muzyka w tle dla klientów i komunikaty do obsługi, np. prośba o otwarcie drugiej kasy. |
| 60 | snd | Szkoły i hale sportowe | Nagłośnienie szkoły i hali sportowej | Dzwonki, komunikaty i nagłośnienie apeli. | Dzwonki na przerwy, komunikaty z sekretariatu i nagłośnienie apeli. |
| 61 | snd | Ogrody, tarasy i baseny | Głośniki w ogrodzie, na tarasie i przy basenie | Głośniki zewnętrzne odporne na pogodę. | Głośniki zewnętrzne, którym nie szkodzi deszcz ani mróz. |
| 62 | snd | Mikrofony i systemy konferencyjne | = bez zmian | Przewodowe, bezprzewodowe i stołowe. | Mikrofony przewodowe, bezprzewodowe i stołowe, dobrane do sali i liczby mówców. |
| 63 | scr | Ekrany w witrynie | = bez zmian | Jasne ekrany czytelne w słońcu, sterowane harmonogramem. | Jasny ekran, który widać nawet w słońcu. Włącza się i zmienia treść według ustalonych godzin. |
| 64 | scr | Menu board w gastronomii | Menu na ekranie (menu board) | Ceny i menu zmieniane z komputera, bez drukowania. | Menu i ceny dań zmieniasz z komputera, bez drukowania nowych kart. |
| 65 | scr | Ekran w recepcji hotelu | = bez zmian | Pogoda, stoki, atrakcje i oferta obiektu. | Gość widzi pogodę, warunki na stokach, atrakcje w okolicy i ofertę Twojego obiektu. |
| 66 | scr | Ściany wideo | = bez zmian | Kilka ekranów jako jeden obraz. | Kilka ekranów połączonych w jeden duży obraz. |
| 67 | scr | Monitory interaktywne | = bez zmian | Do szkół i sal spotkań. | Duży dotykowy ekran do klasy i sali spotkań. |
| 68 | scr | Totemy informacyjne | Ekrany wolnostojące (totemy) | Wolnostojące ekrany przy wejściu. | Ekran na własnej podstawie przy wejściu, z informacją albo ofertą. |
| 69 | scr | Zarządzanie treścią na wielu ekranach | Zmiana treści na wielu ekranach naraz | Jedna zmiana trafia na ekrany w kilku lokalizacjach. | Zmieniasz treść raz, a pojawia się na ekranach we wszystkich Twoich lokalizacjach. |
| 70 | scr | Projektory i ekrany projekcyjne | = bez zmian | Sale konferencyjne, szkoły, kościoły. | Projektor z ekranem do sali konferencyjnej, szkoły albo kościoła. |
| 71 | ev | Ładowarka w domu | Ładowarka do auta w garażu | Elzab CC Home w garażu: 3,7, 7,4 albo 11 kW. | Elzab CC Home o mocy 3,7, 7,4 albo 11 kW. Moc dobieramy do przyłącza domu. |
| 72 | ev | Ładowarka ścienna z dwoma punktami | Ładowarka na dwa auta naraz | Elzab CC Wall, do 2×22 kW, na ścianę albo podstawę. | Elzab CC Wall ładuje dwa auta, każde z mocą do 22 kW. Montujemy ją na ścianie albo na podstawie. |
| 73 | ev | Ładowarki dla firm i floty | Ładowarki dla aut firmowych | Karty RFID, aplikacja, dzielenie mocy przyłącza. | Kierowcy ładują na kartę zbliżeniową (RFID) albo w aplikacji. Ładowarki dzielą między siebie moc przyłącza. |
| 74 | ev | Stacja wolnostojąca na parking | Stacja ładowania na parking | Elzab CC City z licznikiem MID, dwa auta naraz. | Elzab CC City ładuje dwa auta naraz. Ma certyfikowany licznik (MID), więc możesz rozliczać pobrany prąd. |
| 75 | ev | Rozliczanie ładowania | = bez zmian | OCPP i aplikacja, gdy ładowanie dla gości ma być płatne. | Gdy goście mają płacić za ładowanie, łączymy ładowarkę z aplikacją do rozliczeń (przez protokół OCPP). |
| 76 | ev | Pomoc w formalnościach | = bez zmian | Dozór techniczny, zgoda wspólnoty, moc przyłącza. | Pomagamy uzyskać zgodę wspólnoty, sprawdzić moc przyłącza i przygotować ładowarkę do odbioru przez dozór techniczny. |

Nazwy bez zmian, bo ten sam tekst jest w innym pliku paczki (słownik działa globalnie): Monitoring z maskami prywatności (PoradnikRodo.json), Wideodomofon z aplikacją (Alarmy.json), Okablowanie strukturalne (Sieci, Teletechnika), Łącze zapasowe (gmina, sklep, SegGmina, SegSklep), Światłowód do lokali i RTV/SAT zbiorcza (Teletechnika), Oświetlenie i sceny (SmartHome), Ściany wideo (Multimedia), Monitory interaktywne (szk, SegSzkola), Rozliczanie ładowania i Pomoc w formalnościach (Ladowarki).
