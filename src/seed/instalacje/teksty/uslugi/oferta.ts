/**
 * INST-6 PR3: texts of the package for `oferta` → new wording (runda v6 §2): the areas'
 * descriptions (`obszary[].opis` → `InstServices.offer.description`) and the 76 solutions
 * (`nazwa`/`opis` → `InstSolutions.name`/`description`). Names used elsewhere in the package (e.g.
 * „Okablowanie strukturalne” on Sieci and Teletechnika) stay: the dictionary is global.
 */
export const OFERTA: Readonly<Record<string, string>> = {
  // --- kam ---
  'Kompletny system, a nie same kamery: rejestrator, dyski do pracy 24/7, zasilanie PoE, UPS i aplikacja w telefonie.':
    'Kamery razem z rejestratorem, dyskami do pracy całą dobę i zasilaczem awaryjnym (UPS). Obraz i nagrania oglądasz w aplikacji w telefonie.',
  'Podjazd, furtka i ogród. Podgląd i nagrania w telefonie.':
    'Kamery na podjazd, furtkę i ogród domu albo domku letniskowego. Obraz i nagrania oglądasz w telefonie.',
  'Parking, wejścia i narciarnia, bez zaglądania do pokoi gości.':
    'Kamery na parking, wejścia i narciarnię. Pokoje gości zostają poza kadrem.',
  'Wjazd, rampa, magazyn i kasy. Nagrania jako dowód.':
    'Kamery na wjazd, rampę, magazyn i kasy. Nagranie przyda się jako dowód przy kradzieży albo szkodzie.',
  'Kamery z kolorem w nocy i detekcją AI': 'Kamery z kolorem w nocy i wykrywaniem ludzi',
  'Rozpoznają ludzi i auta, dzięki czemu jest mniej fałszywych alarmów od zwierząt, liści i śniegu.':
    'Kamera odróżnia człowieka i auto od zwierzęcia, liści i śniegu, więc dostajesz mniej fałszywych powiadomień.',
  'Rejestratory NVR i dyski do monitoringu': 'Rejestrator i dyski na nagrania',
  'Dysk dobrany do liczby kamer i czasu przechowywania nagrań.':
    'Rejestrator (NVR) zapisuje obraz ze wszystkich kamer. Dysk dobieramy do liczby kamer i tego, ile dni nagrań chcesz trzymać.',
  'Switche PoE, UPS i szafa rack': 'Zasilanie kamer, UPS i szafa na sprzęt',
  'Kamera zasilana tym samym kablem, którym przesyła obraz. Z zasilaczem UPS system działa jeszcze przez pewien czas po zaniku prądu.':
    'Kamera dostaje prąd tym samym kablem, którym wysyła obraz (PoE). Zasilacz awaryjny UPS podtrzymuje system przez pewien czas po zaniku prądu.',
  'Wjazd na parking, brama albo szlaban i historia aut.':
    'Kamera odczytuje tablice aut przy wjeździe, bramie albo szlabanie. Widzisz, które auto i kiedy wjechało.',
  'Most radiowy do odległej bramy albo łącze komórkowe na budowę.':
    'Obraz z odległej bramy przesyła most radiowy, a z budowy łącze komórkowe. Nie trzeba kopać rowu pod kabel.',
  'Maski prywatności, czas nagrań i miejsca na tabliczki.':
    'Zasłaniamy w obrazie okna sąsiadów i ulicę. Ustawiamy, po ilu dniach nagrania się kasują, i wskazujemy miejsca na tabliczki.',
  'Przejęcie i modernizacja starego monitoringu': 'Unowocześnienie starego monitoringu',
  'Wymiana kamer analogowych, pomoc w odzyskaniu dostępu, nowy rejestrator.':
    'Wymieniamy stare kamery analogowe i rejestrator na nowe. Pomagamy też odzyskać dostęp, gdy nie masz hasła do rejestratora.',

  // --- alarm ---
  'Czujki, syreny i powiadomienia na telefon, a przy furtce wideodomofon, który odbierasz z dowolnego miejsca.':
    'Alarm powiadamia Cię na telefonie, gdy ktoś wejdzie do domu albo firmy. Wideodomofon przy furtce odbierasz z dowolnego miejsca.',
  'Czujki ruchu i otwarcia, syrena, sterowanie z aplikacji.':
    'Czujki ruchu i otwarcia drzwi lub okien, syrena i powiadomienie na telefon. Alarm włączasz i wyłączasz w aplikacji.',
  'Do wykończonego domu, apartamentu i biura.':
    'Montaż bez kabli w ścianach, więc nadaje się do wykończonego domu, apartamentu i biura.',
  'Czujki zalania, dymu i spadku temperatury działające całą dobę.':
    'Czujki zalania, dymu i spadku temperatury pilnują domu całą dobę. Gdy coś się dzieje, dostajesz powiadomienie na telefon.',
  'Strefy, harmonogram uzbrojenia i opcjonalnie agencja ochrony.':
    'Osobne strefy, np. biuro i magazyn, i alarm włączany o stałej godzinie. Na życzenie podłączamy agencję ochrony.',
  'Wideodomofon na starych dwóch przewodach': 'Nowy wideodomofon na starym kablu',
  'Modernizacja bez kucia, jeśli przewód się nada.':
    'Jeśli stary dwużyłowy przewód się nada, wymieniamy domofon bez kucia ścian. Sprawdzamy to przed montażem.',
  'Panel z listą lokatorów, kody, breloki i aplikacja.':
    'Panel przy wejściu z listą lokatorów. Drzwi otwierasz kodem, brelokiem albo w aplikacji.',
  'Brama i furtka sterowane z telefonu': 'Brama i furtka otwierane telefonem',
  'Otwieranie z aplikacji wideodomofonu albo z panelu.':
    'Otwierasz je w aplikacji wideodomofonu albo z panelu.',

  // --- kd ---
  'Kody, karty i zamki elektroniczne. Gość albo pracownik wchodzi sam, a Ty wiesz, kto i kiedy.':
    'Zamki na kod i na karty. Gość albo pracownik wchodzi sam, a Ty wiesz, kto i kiedy otworzył drzwi.',
  'Kod ważny tylko w czasie pobytu, wysyłany automatycznie, jeśli Twój system rezerwacji to obsługuje.':
    'Gość dostaje kod ważny tylko na czas pobytu. Jeśli Twój system rezerwacji to obsługuje, kod wysyła się sam.',
  'Koder kart na recepcji i rejestr otwarć.':
    'Recepcja koduje kartę dla gościa, a system zapisuje każde otwarcie drzwi.',
  'Strefy, godziny wejść, blokada zgubionej karty od ręki.':
    'Każdy pracownik wchodzi tylko do swoich stref i w swoich godzinach. Zgubioną kartę blokujesz od ręki.',
  'Kontrola wjazdu': 'Wjazd przez bramę i szlaban',
  'Brama i szlaban na pilota, kartę albo aplikację.':
    'Bramę albo szlaban otwierasz pilotem, kartą albo w aplikacji.',
  'Kontrola dostępu we wspólnocie': 'Karty do drzwi we wspólnocie',
  'Karty do klatek, garaży i śmietników.':
    'Mieszkańcy otwierają kartą klatkę, garaż i wiatę śmietnikową.',
  'Harmonogramy i historia wejść': 'Historia wejść i godziny otwarcia drzwi',
  'Kto, kiedy i którymi drzwiami.':
    'Widzisz, kto, kiedy i którymi drzwiami wszedł. Drzwi mogą być otwarte tylko w ustalonych godzinach.',

  // --- wifi ---
  'Sieć, która działa w każdym pokoju i nie pada w sezonie: okablowanie, szafy, światłowód, Wi-Fi i łącze zapasowe.':
    'Wi-Fi w każdym pokoju i sieć, która wytrzymuje pełny obiekt w sezonie. Kładziemy kable i światłowód, montujemy szafy i łącze zapasowe.',
  'Bez martwych stref, jedna nazwa sieci.':
    'Telefon łapie Wi-Fi w każdym pokoju i w ogrodzie, a sieć ma jedną nazwę w całym domu.',
  'Wi-Fi dla gości z portalem logowania': 'Wi-Fi dla gości z ekranem logowania',
  'Osobna sieć gości, logo obiektu, vouchery na czas pobytu.':
    'Goście mają osobną sieć z logo Twojego obiektu. Dostęp dajesz kodem ważnym na czas pobytu.',
  'Sieć firmowa i bezpieczeństwo': 'Bezpieczna sieć w firmie',
  'Router, firewall i osobne sieci dla kas, kamer i gości.':
    'Router z zaporą (firewall) i osobne sieci dla kas, kamer i gości. Gość nie dostanie się do kasy ani kamer.',
  'Gniazda, patchpanele i pomiary torów. Zakres dokumentacji ustalamy przed instalacją.':
    'Gniazda sieciowe w pokojach, kable opisane w szafie i każdy tor sprawdzony miernikiem. Zakres dokumentacji ustalamy przed instalacją.',
  'Szafy rack i porządek w kablach': 'Szafa na sprzęt i porządek w kablach',
  'Opisane porty, zasilanie awaryjne, wentylacja.':
    'Opisujemy każdy port, dodajemy wentylację i zasilanie awaryjne. Przy awarii od razu wiadomo, który kabel dokąd prowadzi.',
  'Światłowód i spawanie': 'Światłowód między budynkami',
  'Między budynkami i na dłuższych odcinkach, odporny na przepięcia.':
    'Łączy budynki i sprawdza się na dłuższych odcinkach. Jest odporny na przepięcia, np. po burzy.',
  'Mosty radiowe między budynkami': 'Most radiowy między budynkami',
  'Internet i kamery w drugim budynku bez kopania rowu.':
    'Dwie anteny przesyłają internet i obraz z kamer do drugiego budynku. Nie trzeba kopać rowu pod kabel.',
  'Gdy padnie główne łącze, sieć przełącza się na zapasowe.':
    'Gdy padnie główny internet, sieć sama przełącza się na zapasowe łącze.',
  'Zdalny nadzór nad siecią': 'Zdalna opieka nad siecią',
  'Przy umowie z nadzorem często widzimy awarię, zanim zadzwonisz. Wiele rzeczy naprawiamy zdalnie.':
    'Przy umowie na opiekę często widzimy awarię, zanim zadzwonisz. Wiele usterek naprawiamy zdalnie, bez przyjazdu.',

  // --- tel ---
  'Dla deweloperów, wykonawców i inwestorów: instalacje słaboprądowe budynku z pomiarami i dokumentacją do odbioru.':
    'Internet, telewizja, domofony i sieć w nowym budynku, z pomiarami i dokumentacją do odbioru. Dla deweloperów, wykonawców i inwestorów.',
  'Instalacja telekomunikacyjna w nowym budynku': 'Internet i telewizja w nowym budynku',
  'Gotowa na internet, telefon i telewizję od wielu operatorów, ze światłowodem do każdego mieszkania.':
    'Każde mieszkanie dostaje światłowód i może wybrać jednego z wielu operatorów internetu, telefonu i telewizji.',
  'Od punktu styku do każdego mieszkania i lokalu.':
    'Światłowód od punktu styku, czyli miejsca, w którym operatorzy wchodzą do budynku, do każdego mieszkania i lokalu.',
  'Jedna antena, sygnał w każdym lokalu.':
    'Jedna wspólna antena na dachu daje telewizję w każdym lokalu.',
  'Panele wejściowe, unifony i monitory.':
    'Panel przy wejściu do klatki i słuchawka albo monitor w każdym mieszkaniu.',
  'Okablowanie biur i lokali usługowych': 'Sieć w biurach i lokalach usługowych',
  'Gniazda, szafa, punkty dostępowe.':
    'Gniazda sieciowe przy biurkach, szafa na sprzęt i Wi-Fi w całym lokalu.',
  'Pomiary i dokumentacja powykonawcza': 'Pomiary i dokumentacja do odbioru',
  'Protokoły pomiarów i opis tras do odbioru budynku. W firmach i instytucjach zakres dokumentacji ustalamy przed instalacją.':
    'Protokoły pomiarów i opis, którędy biegną kable, gotowe do odbioru budynku. W firmach i instytucjach zakres dokumentacji ustalamy przed instalacją.',

  // --- ant ---
  'Anteny ustawiane miernikiem i montowane z zapasem na halny. Od domu po telewizję w każdym pokoju pensjonatu.':
    'Anteny ustawiamy miernikiem i mocujemy tak, żeby wytrzymały halny. Montujemy je w domach i w pensjonatach, z telewizją w każdym pokoju.',
  'Ustawienie miernikiem na Hot Bird 13°E.':
    'Talerz ustawiony miernikiem na satelitę Hot Bird 13°E.',
  'Dobór kierunku i nadajnika na Podhalu.':
    'DVB-T2 to naziemna telewizja cyfrowa. Wybieramy nadajnik, który u Ciebie najlepiej odbiera, i ustawiamy w jego stronę antenę.',
  'Instalacje zbiorcze': 'Jedna antena na cały budynek',
  'Multiswitch i rozprowadzenie w budynku.':
    'Multiswitch rozdziela sygnał z jednej anteny na wiele telewizorów w budynku.',
  'Ten sam zestaw kanałów w każdym pokoju.': 'Goście mają w każdym pokoju ten sam zestaw kanałów.',
  'Ponowne ustawienie, wymiana konwertera i okablowania.':
    'Ustawiamy antenę od nowa, wymieniamy uszkodzony konwerter albo kable.',

  // --- smart ---
  'Polski system Ampio. Światło, ogrzewanie, rolety, brama, alarm i kamery w jednej aplikacji. Działa także bez internetu.':
    'Polski system Ampio: światło, ogrzewanie, rolety, bramę, alarm i kamery obsługujesz w jednej aplikacji. Dom działa także bez internetu.',
  'Projekt przed tynkami, okablowanie i rozdzielnica.':
    'Planujemy instalację przed tynkami, kładziemy kable i montujemy rozdzielnicę.',
  'Modernizacja bez przebudowy całego domu.':
    'Dokładamy sterowanie do domu, w którym już mieszkasz, bez przebudowy wszystkich instalacji.',
  'Jednym dotknięciem: przyjazd, wyjście, noc, kino.':
    'Jednym dotknięciem ustawiasz światło na przyjazd, wyjście, noc albo seans filmu.',
  'Ogrzewanie strefowe i pompa ciepła': 'Ogrzewanie pokój po pokoju',
  'Każdy pokój osobno, harmonogramy i tryb oszczędny.':
    'Każdy pokój ma swoją temperaturę i godziny grzania, także z pompą ciepła. Gdy nikogo nie ma, dom grzeje oszczędniej.',
  'Według godziny, słońca i wiatru.':
    'Rolety i markizy same się podnoszą i opuszczają według godziny, słońca i wiatru.',
  'Fotowoltaika i zarządzanie energią': 'Fotowoltaika i zużycie prądu',
  'Prąd ze słońca tam, gdzie się opłaca.':
    'Prąd z paneli słonecznych kierujemy tam, gdzie w danej chwili najbardziej się opłaca.',
  'Szklane panele Ampio M-DOT': 'Szklane włączniki Ampio M-DOT',
  'Własne ikony, podpisy i kolor szkła.':
    'Na szklanym włączniku sam wybierasz ikony, podpisy i kolor szkła.',
  'Integracja z alarmem, kamerami i bramą': 'Połączenie z alarmem, kamerami i bramą',
  'Jedna aplikacja zamiast pięciu.':
    'Alarm, kamery i bramę obsługujesz w tej samej aplikacji co światło i ogrzewanie.',
  'Smart apartament i pensjonat': 'Smart home w apartamencie i pensjonacie',
  'Puste pokoje w trybie oszczędnym, nagrzanie przed przyjazdem.':
    'Pusty pokój grzeje oszczędnie, a przed przyjazdem gościa sam się nagrzewa.',
  'Sterowanie głosem i Matter': 'Sterowanie domem głosem',
  'Apple, Google i Alexa, jeśli lubisz mówić do domu.':
    'Mówisz do telefonu albo głośnika Apple, Google lub Alexa. Urządzenia różnych marek łączy standard Matter.',

  // --- snd ---
  'Stałe nagłośnienie APART i innych marek: muzyka w tle, komunikaty i mowa zrozumiała w ostatniej ławce.':
    'Stałe nagłośnienie APART i innych marek do muzyki w tle i komunikatów. W kościele mowę dobrze słychać także w ostatniej ławce.',
  'Sala, bar, taras i toalety z osobną głośnością.':
    'Muzyka na sali, przy barze, na tarasie i w toaletach, każda strefa z osobną głośnością.',
  'Jadalnia, recepcja, SPA i sala, komunikaty do wybranych stref.':
    'Muzyka w jadalni, recepcji, SPA i na sali. Komunikat puszczasz tylko tam, gdzie trzeba.',
  'Zrozumiała mowa, a nie tylko głośniej.':
    'Kazanie i czytania słychać wyraźnie w każdej ławce, także z tyłu kościoła.',
  'Sale konferencyjne i sale obrad': 'Nagłośnienie sali konferencyjnej i sali obrad',
  'Mikrofony, nagrywanie i transmisja.':
    'Mikrofony dla mówców, nagranie spotkania i transmisja do internetu.',
  'Sklepy: muzyka i komunikaty': 'Muzyka i komunikaty w sklepie',
  'Tło dla klientów i komunikaty dla obsługi.':
    'Muzyka w tle dla klientów i komunikaty do obsługi, np. prośba o otwarcie drugiej kasy.',
  'Szkoły i hale sportowe': 'Nagłośnienie szkoły i hali sportowej',
  'Dzwonki, komunikaty i nagłośnienie apeli.':
    'Dzwonki na przerwy, komunikaty z sekretariatu i nagłośnienie apeli.',
  'Ogrody, tarasy i baseny': 'Głośniki w ogrodzie, na tarasie i przy basenie',
  'Głośniki zewnętrzne odporne na pogodę.':
    'Głośniki zewnętrzne, którym nie szkodzi deszcz ani mróz.',
  'Przewodowe, bezprzewodowe i stołowe.':
    'Mikrofony przewodowe, bezprzewodowe i stołowe, dobrane do sali i liczby mówców.',

  // --- scr --- (the area's key keeps the salon sentence; `withoutSalonClaim` runs after this)
  'Ekrany profesjonalne do pracy wiele godzin dziennie i treść zmieniana zdalnie. Wdrażamy to w naszym salonie.':
    'Ekrany zrobione do pracy przez wiele godzin dziennie. Treść zmieniasz zdalnie, z komputera.',
  'Jasne ekrany czytelne w słońcu, sterowane harmonogramem.':
    'Jasny ekran, który widać nawet w słońcu. Włącza się i zmienia treść według ustalonych godzin.',
  'Menu board w gastronomii': 'Menu na ekranie (menu board)',
  'Ceny i menu zmieniane z komputera, bez drukowania.':
    'Menu i ceny dań zmieniasz z komputera, bez drukowania nowych kart.',
  'Pogoda, stoki, atrakcje i oferta obiektu.':
    'Gość widzi pogodę, warunki na stokach, atrakcje w okolicy i ofertę Twojego obiektu.',
  'Kilka ekranów jako jeden obraz.': 'Kilka ekranów połączonych w jeden duży obraz.',
  'Do szkół i sal spotkań.': 'Duży dotykowy ekran do klasy i sali spotkań.',
  'Totemy informacyjne': 'Ekrany wolnostojące (totemy)',
  'Wolnostojące ekrany przy wejściu.':
    'Ekran na własnej podstawie przy wejściu, z informacją albo ofertą.',
  'Zarządzanie treścią na wielu ekranach': 'Zmiana treści na wielu ekranach naraz',
  'Jedna zmiana trafia na ekrany w kilku lokalizacjach.':
    'Zmieniasz treść raz, a pojawia się na ekranach we wszystkich Twoich lokalizacjach.',
  'Sale konferencyjne, szkoły, kościoły.':
    'Projektor z ekranem do sali konferencyjnej, szkoły albo kościoła.',

  // --- ev ---
  'Pełna oferta ładowarek Elzab EcoPower produkowanych w Polsce: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Z doborem mocy do przyłącza i montażem.':
    'Ładowarki Elzab EcoPower produkowane w Polsce: CC Home do garażu, CC Wall dla firm i obiektów, CC City na parking. Dobieramy moc do Twojego przyłącza i montujemy.',
  'Ładowarka w domu': 'Ładowarka do auta w garażu',
  'Elzab CC Home w garażu: 3,7, 7,4 albo 11 kW.':
    'Elzab CC Home o mocy 3,7, 7,4 albo 11 kW. Moc dobieramy do przyłącza domu.',
  'Ładowarka ścienna z dwoma punktami': 'Ładowarka na dwa auta naraz',
  'Elzab CC Wall, do 2×22 kW, na ścianę albo podstawę.':
    'Elzab CC Wall ładuje dwa auta, każde z mocą do 22 kW. Montujemy ją na ścianie albo na podstawie.',
  'Ładowarki dla firm i floty': 'Ładowarki dla aut firmowych',
  'Karty RFID, aplikacja, dzielenie mocy przyłącza.':
    'Kierowcy ładują na kartę zbliżeniową (RFID) albo w aplikacji. Ładowarki dzielą między siebie moc przyłącza.',
  'Stacja wolnostojąca na parking': 'Stacja ładowania na parking',
  'Elzab CC City z licznikiem MID, dwa auta naraz.':
    'Elzab CC City ładuje dwa auta naraz. Ma certyfikowany licznik (MID), więc możesz rozliczać pobrany prąd.',
  'OCPP i aplikacja, gdy ładowanie dla gości ma być płatne.':
    'Gdy goście mają płacić za ładowanie, łączymy ładowarkę z aplikacją do rozliczeń (przez protokół OCPP).',
  'Dozór techniczny, zgoda wspólnoty, moc przyłącza.':
    'Pomagamy uzyskać zgodę wspólnoty, sprawdzić moc przyłącza i przygotować ładowarkę do odbioru przez dozór techniczny.',
}
