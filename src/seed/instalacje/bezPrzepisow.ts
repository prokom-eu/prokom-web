/**
 * Runda v6 §1.1 (decision 08.11.2026): no law on the Instalacje pages — codes, acts, rulings,
 * articles, GDPR as a regulation, the regulator, licence fees, deadlines from acts. The package
 * (`seed/prokominstalacje/`, 1:1 from the prototype, not edited) still has them, so the seed
 * cleans every imported file: an exact text → a practical sentence, or `null` = the entry is left
 * out (an array item that is, or directly holds, such a text — e.g. a FAQ pair or an anchor).
 * Generated once from the package paths; edit by hand from now on.
 */
export const LAW_TEXTS: Readonly<Record<string, string | null>> = {
  'Przy wynajmie na doby autonomiczna czujka dymu jest obowiązkowa od 30.06.2026. Może też wysłać powiadomienie na Twój telefon.':
    'Autonomiczna czujka dymu w apartamencie na wynajem. Może też wysłać powiadomienie na Twój telefon.',
  'W środku nie. Zamiast kamery proponujemy czujnik hałasu, który niczego nie nagrywa, albo ujawnioną kamerę przy wejściu na Twoim terenie. Zasady Airbnb opisujemy w sekcji „Przepisy”.':
    'W środku nie. Zamiast kamery proponujemy czujnik hałasu, który niczego nie nagrywa, albo ujawnioną kamerę przy wejściu na Twoim terenie.',
  'Na zamek w drzwiach lokalu nie, na części wspólne tak (szczegóły w sekcji „Przepisy”). Pomagamy przygotować opis dla zarządu, a montujemy po zgodzie.':
    'Na zamek w drzwiach lokalu nie, na części wspólne tak. Pomagamy przygotować opis dla zarządu, a montujemy po zgodzie.',
  'Czy czujka dymu jest w apartamencie obowiązkowa?': 'Jaką czujkę dymu wybrać do apartamentu?',
  'Tak, jeśli wynajmujesz na doby. Przy piecyku gazowym z otwartą komorą albo kominku potrzebna jest też czujka czadu. Terminy są w sekcji „Przepisy”. Dobieramy czujki, które mogą też powiadomić Cię na telefonie.':
    'Autonomiczną, która może też powiadomić Cię na telefonie. Przy piecyku gazowym z otwartą komorą albo kominku dokładamy czujkę czadu.',
  'Tak, jeśli celem jest ochrona mienia, teren jest oznaczony, a na tabliczce jest informacja o administratorze. Kto nim jest, inwestor czy wykonawca, ustalamy na starcie. Zasady dla własnych pracowników opisujemy w sekcji przepisów.':
    'Tak. Kamery obejmują plac budowy, a przy wjeździe wieszamy tabliczkę o monitoringu. Kto odpowiada za nagrania, inwestor czy wykonawca, ustalamy na starcie.',
  'Instalacja telekomunikacyjna według § 192e warunków technicznych: punkt styku dla wielu operatorów, światłowód, skrętka i koncentryk do każdego mieszkania, zbiorcza antena naziemna i satelitarna, domofony, karty do garażu i protokoły pomiarów do odbioru.':
    'Instalacja telekomunikacyjna w budynku wielorodzinnym: punkt styku dla wielu operatorów, światłowód, skrętka i koncentryk do każdego mieszkania, zbiorcza antena naziemna i satelitarna, domofony, karty do garażu i protokoły pomiarów do odbioru.',
  '§ 192e warunków technicznych': 'Punkt styku dla wielu operatorów',
  'Brelok albo karta do furtki, klatek, garażu i rowerowni, z wyjściem ewakuacyjnym zgodnym z przepisami.':
    'Brelok albo karta do furtki, klatek, garażu i rowerowni, z wyjściem ewakuacyjnym, które przy braku prądu się otwiera.',
  'Dobór zamków i zwolnień zgodny z przepisami, uzgodniony z projektantem.':
    'Dobór zamków i zwolnień uzgodniony z projektantem.',
  'Warunki techniczne wymagają odbioru z co najmniej 2 satelitów. W górach liczy się widoczność południa, więc maszt i czasza muszą stać w dobrym miejscu.':
    'Zbiorczą antenę ustawiamy na odbiór z 2 satelitów. W górach liczy się widoczność południa, więc maszt i czasza muszą stać w dobrym miejscu.',
  'W skrócie: punkt styku, światłowód, skrętkę i koncentryk do skrzynki przy każdym mieszkaniu, zbiorczą antenę z masztem na dachu i sygnalizację dzwonkową. Szczegóły z § 192a, § 192e i § 192f są w sekcji przepisów. Wykonujemy całość z pomiarami.':
    'W skrócie: punkt styku, światłowód, skrętkę i koncentryk do skrzynki przy każdym mieszkaniu, zbiorczą antenę z masztem na dachu i sygnalizację dzwonkową. Wykonujemy całość z pomiarami.',
  'Według jakich warunków technicznych projektujecie?': null,
  'Przed odbiorami lokatorskimi testujemy każde gniazdo, wideodomofon i sygnał TV i oddajemy listę wyników dla działu obsługi klienta. Mniej wad przy odbiorze to mniej terminów z ustawy deweloperskiej do pilnowania.':
    'Przed odbiorami lokatorskimi testujemy każde gniazdo, wideodomofon i sygnał TV i oddajemy listę wyników dla działu obsługi klienta. Mniej wad przy odbiorze to mniej poprawek po przekazaniu mieszkań.',
  'Nie powinna. Ustawiamy kadr na Twoją posesję i zasłaniamy w obrazie resztę. Dlaczego to ważne, piszemy w sekcji „Przepisy” wyżej.':
    'Nie powinna. Ustawiamy kadr na Twoją posesję i zasłaniamy w obrazie resztę.',
  'Czy czujka dymu jest obowiązkowa w domu?': 'Czy warto mieć czujkę dymu w domu?',
  'W domku na wynajem tak, a w domu, w którym mieszkasz, warto ją mieć niezależnie od terminów. Daty i szczegóły są w sekcji „Przepisy”. Dobieramy czujki zgodne z normą, które wysyłają powiadomienie na telefon.':
    'Tak, w domu na wynajem i w tym, w którym mieszkasz. Dobieramy czujki, które wysyłają powiadomienie na telefon.',
  'Transmisja i nagrywanie sesji (art. 20 ust. 1b u.s.g.), mikrofony, połączenie z systemem głosowania, pętla indukcyjna, monitoring placów i sieć urzędu.':
    'Transmisja i nagrywanie sesji, mikrofony, połączenie z systemem głosowania, pętla indukcyjna, monitoring placów i sieć urzędu.',
  'Sala obrad z mikrofonami, kamerami i transmisją, połączona z systemem do głosowania elektronicznego z imiennym wykazem głosowań. Pętla indukcyjna w punkcie obsługi, monitoring placów i przystanków w celach z art. 9a, sieć urzędu z zapisem lokalnym i łączem zapasowym.':
    'Sala obrad z mikrofonami, kamerami i transmisją, połączona z systemem do głosowania elektronicznego z imiennym wykazem głosowań. Pętla indukcyjna w punkcie obsługi, monitoring placów i przystanków, sieć urzędu z zapisem lokalnym i łączem zapasowym.',
  'na dostosowanie nagrania sesji, np. napisy (art. 5a)': null,
  'Plac, przystanek i parking w celach z art. 9a, za zgodą zarządcy terenu, z oznakowaniem i nagraniami do 3 miesięcy. Kamery odporne na mróz i przepięcia.':
    'Plac, przystanek i parking za zgodą zarządcy terenu, z oznakowaniem i nagraniami do 3 miesięcy. Kamery odporne na mróz i przepięcia.',
  'Pętla indukcyjna przesyła mowę urzędnika prosto do aparatu słuchowego. Podmiot publiczny zapewnia takie urządzenia z ustawy o dostępności.':
    'Pętla indukcyjna przesyła mowę urzędnika prosto do aparatu słuchowego.',
  'Transmisja, głosowanie, dostępność i monitoring mają w gminie podstawę w ustawie. Projektujemy tak, żeby gminie łatwiej było spełnić przepisy, a sesja nie stawała.':
    'Transmisja, głosowanie, dostępność i monitoring muszą działać na każdej sesji. Projektujemy tak, żeby sesja nie stawała, a obsługa była prosta.',
  'Gdy urządzenia zawiodą, ustawa przewiduje głosowanie imienne bez urządzeń, co wydłuża sesję i grozi błędem w protokole.':
    'Gdy urządzenia zawiodą, radni głosują imiennie bez urządzeń, co wydłuża sesję i grozi błędem w protokole.',
  'Monitoring w celach z art. 9a, nagrania do 3 miesięcy i przekazywanie fragmentów na wniosek.':
    'Monitoring placów i przystanków, nagrania do 3 miesięcy i przekazywanie fragmentów na wniosek.',
  'Kamery placu i przystanku nagrywają w celach z art. 9a. Fragment nagrania przekazuje się policji na wniosek.':
    'Kamery placu i przystanku nagrywają obraz. Fragment nagrania przekazuje się policji na wniosek.',
  'Parkingi, deptaki i punkty widokowe są oblegane w sezonie. Monitoring tylko w celach z art. 9a.':
    'Parkingi, deptaki i punkty widokowe są oblegane w sezonie.',
  'Napisy przygotowuje gmina albo jej dostawca. My odpowiadamy za tor dźwięku: każdy radny mówi do swojego mikrofonu, a dźwięk idzie z miksera, więc napisy są dokładniejsze. Zakres obowiązku warto potwierdzić z koordynatorem dostępności.':
    'Napisy przygotowuje gmina albo jej dostawca. My odpowiadamy za tor dźwięku: każdy radny mówi do swojego mikrofonu, a dźwięk idzie z miksera, więc napisy są dokładniejsze.',
  'Bierzemy udział w zapytaniach ofertowych i przetargach. Możemy obejrzeć salę i pomóc opisać potrzeby. Jeśli zamówienie podlega Pzp, taka pomoc musi być ujawniona, a gmina zapewnia, że nie zakłóci ona konkurencji (art. 85 Pzp). W skrajnym razie grozi to wykluczeniem wykonawcy (art. 108 ust. 1 pkt 6), dlatego mówimy o tym otwarcie od początku. Warunki gwarancji i szkolenia wpisujemy do oferty zgodnie z zapytaniem.':
    'Bierzemy udział w zapytaniach ofertowych i przetargach. Możemy obejrzeć salę i pomóc opisać potrzeby, a o takiej pomocy mówimy otwarcie od początku. Warunki gwarancji i szkolenia wpisujemy do oferty zgodnie z zapytaniem.',
  'Nowe przepisy pozwalają hotelom 3* zastąpić nocną recepcję całodobowym samodzielnym meldowaniem. Potrzebny jest system rezerwacji połączony z zamkami i wideodomofon przy wejściu.':
    'Samodzielne meldowanie o każdej porze: system rezerwacji połączony z zamkami i wideodomofon przy wejściu.',
  'Czy Wi-Fi w hotelu jest teraz obowiązkowe?': 'Jak sprawdzić, czy Wi-Fi działa w każdym pokoju?',
  'Tak, w pokojach i strefach wspólnych. Hotele już skategoryzowane mają czas do 15.03.2027 (szczegóły w sekcji „Przepisy”). Robimy pomiar zasięgu i pojemności i zostawiamy protokół pomiarów.':
    'Robimy pomiar zasięgu i pojemności w pokojach i strefach wspólnych i zostawiamy protokół pomiarów.',
  'Mamy 3 gwiazdki. Czy możemy zrezygnować z nocnej recepcji?':
    'Czy gość może zameldować się w nocy bez recepcji?',
  'Nowe przepisy pozwalają, żeby w hotelu 3* całodobowe samodzielne zameldowanie i wymeldowanie zastąpiło recepcję 24 h. Technicznie potrzebny jest system rezerwacji połączony z zamkami lub automatem i wideodomofon przy wejściu. Spełnienie wymogu warto potwierdzić przy kategoryzacji.':
    'Tak, przy samodzielnym meldowaniu. Potrzebny jest system rezerwacji połączony z zamkami lub automatem i wideodomofon przy wejściu.',
  'To zależy od układu: wjazd, parking, wejścia, lobby, korytarze, zaplecze. Przy pracownikach nagrania najwyżej 3 miesiące, a zasady informowania są w sekcji „Przepisy”. Czas nadpisywania ustawiamy przy montażu.':
    'To zależy od układu: wjazd, parking, wejścia, lobby, korytarze, zaplecze. Czas nadpisywania nagrań ustawiamy przy montażu.',
  'Za telewizory płacimy abonament i licencje. Da się to ograniczyć?': null,
  'Czujki są wymagane od 30.06.2026. Większy obiekt może potrzebować systemu sygnalizacji pożarowej (szczegóły w sekcji „Przepisy”).':
    'Czujki dymu w pokojach gości to podstawa. Większy obiekt może potrzebować systemu sygnalizacji pożarowej.',
  'Czy czujki dymu w pokojach są obowiązkowe?': 'Jakie czujki dymu dać do pokoi gości?',
  'Tak, w każdym pokoju gości (szczegóły w sekcji „Przepisy”). Dobieramy czujki zgodne z normą, które mogą też powiadomić Cię na telefonie, a w kotłowni lub sali kominkowej czujkę czadu.':
    'Do każdego pokoju czujkę dymu, która może też powiadomić Cię na telefonie, a do kotłowni lub sali kominkowej czujkę czadu.',
  'Kiedy potrzebuję systemu sygnalizacji pożarowej, a nie samych czujek?':
    'Czy montujecie system sygnalizacji pożarowej?',
  'Czy muszę płacić abonament za każdy telewizor?': null,
  'Czy za muzykę w restauracji trzeba płacić, nawet za radio?': null,
  'Tak, ale nie w szatni, toalecie ani pomieszczeniu socjalnym. Terminy informowania pracowników są w sekcji „Przepisy”. Kadry, maski i czas nadpisywania ustawiamy my, regulamin przygotowuje pracodawca.':
    'Tak, ale nie w szatni, toalecie ani pomieszczeniu socjalnym. Kadry, maski i czas nadpisywania ustawiamy my.',
  'Nagrania obejmujące pracowników najwyżej 3 miesiące, chyba że są dowodem w sprawie. Wytyczne europejskie zalecają zwykle kilka dni. Ustawiamy automatyczne nadpisywanie zgodne z Twoim regulaminem.':
    'Zwykle wystarcza kilka dni. Ustawiamy automatyczne nadpisywanie po tylu dniach, ile potrzebujesz.',
  'Czy Wi-Fi dla gości wymaga rejestracji w UKE?': null,
  'Czy dom weselny musi mieć system sygnalizacji pożarowej?':
    'Czy montujecie system sygnalizacji pożarowej?',
  'Tak, jeśli w budynku jest ponad 300 miejsc gastronomicznych (szczegóły w sekcji „Przepisy”). Zakres potwierdza projektant lub rzeczoznawca ppoż. Systemów pożarowych nie montujemy: wskażemy firmę z uprawnieniami, a nagłośnienie przygotujemy do współpracy z jej systemem.':
    'Nie. Wskażemy firmę z uprawnieniami, a nagłośnienie przygotujemy do współpracy z jej systemem.',
  'Tak, w celu ochrony mienia, jeśli oznaczysz teren i podasz informację o monitoringu (jak to zrobić, piszemy w sekcji „Przepisy”). Bez kamer w przymierzalniach i toaletach.':
    'Tak. Oznaczamy teren tabliczką o monitoringu i ustawiamy kamery na wejście i salę sprzedaży. Bez kamer w przymierzalniach i toaletach.',
  'Nagrania obejmujące pracowników najwyżej 3 miesiące, dłużej tylko jako dowód w sprawie. Wytyczne zalecają zwykle kilka dni. Ustawiamy automatyczne nadpisywanie i pokazujemy, jak szybko zabezpieczyć nagranie z kradzieży.':
    'Zwykle wystarcza kilka dni. Ustawiamy automatyczne nadpisywanie i pokazujemy, jak szybko zabezpieczyć nagranie z kradzieży.',
  'Czy za muzykę w sklepie trzeba płacić?': null,
  'Monitoring pod art. 108a Prawa oświatowego, wideodomofon, dzwonki z kalendarzem i komunikaty, Wi-Fi w klasach za routerem OSE i monitory interaktywne.':
    'Monitoring holu i wejść, wideodomofon, dzwonki z kalendarzem i komunikaty, Wi-Fi w klasach za routerem OSE i monitory interaktywne.',
  'Wideodomofon i kontrola wejścia, kamery rozmieszczone pod wymagania art. 108a Prawa oświatowego, dzwonki z kalendarzem ferii i komunikaty z sekretariatu, sieć w klasach za routerem OSE, monitory interaktywne i nagłośnienie sali gimnastycznej.':
    'Wideodomofon i kontrola wejścia, kamery w holu i przy wejściach, dzwonki z kalendarzem ferii i komunikaty z sekretariatu, sieć w klasach za routerem OSE, monitory interaktywne i nagłośnienie sali gimnastycznej.',
  'Monitoring pod art. 108a': 'Monitoring holu i wejść',
  'Hol i wejście to miejsca, które art. 108a pozwala monitorować dla bezpieczeństwa uczniów i pracowników.':
    'Kamery w holu i przy wejściu pilnują bezpieczeństwa uczniów i pracowników.',
  'Szkoła ma swoje przepisy o monitoringu i swój rytm roku. Projektujemy pod wymagania art. 108a i montujemy w ferie albo wakacje.':
    'Szkoła ma swój rytm roku. Projektujemy monitoring dla bezpieczeństwa uczniów i montujemy w ferie albo wakacje.',
  'Wizja lokalna, rzut kamer przygotowany pod art. 108a, wycena na piśmie i montaż w ferie albo wakacje.':
    'Wizja lokalna, rzut kamer, wycena na piśmie i montaż w ferie albo wakacje.',
  'Projektujemy, montujemy i serwisujemy kamery dla domów, pensjonatów, firm i gmin. Wykrywanie ludzi i aut, kolor w nocy, podgląd w telefonie i nagrania w Twoim obiekcie, ustawione tak, żeby ułatwić Ci spełnienie RODO.':
    'Projektujemy, montujemy i serwisujemy kamery dla domów, pensjonatów, firm i gmin. Wykrywanie ludzi i aut, kolor w nocy, podgląd w telefonie i nagrania w Twoim obiekcie. Kadr i maski ustawiamy tak, żeby kamera patrzyła tylko na Twój teren.',
  RODO: 'Prywatność',
  'Strefy i maski RODO, czas nagrań': 'Strefy i maski prywatności, czas nagrań',
  'Tyle, ile wynika z celu monitoringu. EROD zaleca, by nagrania co do zasady usuwać automatycznie po kilku dniach, a dłuższy czas, zwłaszcza ponad 72 godziny, uzasadnić celem. Przy monitoringu pracowników Kodeks pracy pozwala najwyżej na 3 miesiące, chyba że nagranie jest dowodem w postępowaniu.':
    'Zwykle wystarcza kilka dni. Ustawiamy automatyczne nadpisywanie po tylu dniach, ile potrzebujesz, i pokazujemy, jak zabezpieczyć ważny fragment.',
  'Biometria pracowników jest dopuszczalna tylko w wąskich przypadkach. Według stanowiska UODO rejestracja czasu pracy biometrią nie jest zgodna z RODO. Proponujemy karty lub breloki.':
    'Można, ale w firmach proponujemy karty i breloki. Odcisk palca zostawiamy do serwerowni, archiwum albo sejfu.',
  'Czy w Zakopanem mogę mieć ekran w witrynie?': null,
  'Czy gmina musi nagrywać i transmitować sesje rady?': null,
  'Czy w pensjonacie potrzebny jest DSO?': null,
  'Muzyka w lokalu': null,
  'Czy budynek musi mieć światłowód?': 'Czy nowy budynek powinien mieć światłowód?',
  'Co do zasady tak. Od 12.02.2026 nowe budynki, dla których wniosek o pozwolenie złożono po tej dacie, mają mieć wewnętrzną instalację światłowodową, a budynki wielorodzinne także punkt dostępu dla operatorów (rozporządzenie UE 2024/1309, art. 10). Wyjątki i szczegóły sprawdzamy w projekcie.':
    'Tak. Nowy budynek warto od razu wyposażyć w światłowód do każdego lokalu, a budynek wielorodzinny także w punkt dostępu dla operatorów. Zakres ustalamy w projekcie.',
  'Pomoc w sprawie UDT': 'Pomoc w formalnościach',
  'Pomoc w sprawie badania UDT': 'Pomoc w formalnościach przed uruchomieniem',
  'Zgłoszenie do UDT, uzgodnienia ze wspólnotą.': 'Formalności i uzgodnienia ze wspólnotą.',
  'Czy ładowarka dla gości pensjonatu wymaga UDT?': null,
  'Czy Wi-Fi dla gości trzeba zgłaszać do UKE?': null,
  'Maski prywatności i czas nagrań ustawione pod RODO':
    'Maski prywatności i czas nagrań dopasowane do obiektu',
  'Gotowa na internet, telefon i telewizję, zgodnie z przepisami o instalacji telekomunikacyjnej w nowych budynkach (tzw. megaustawa).':
    'Gotowa na internet, telefon i telewizję od wielu operatorów, ze światłowodem do każdego mieszkania.',
  'Poradnik PRO-KOM Instalacje: monitoring a RODO, Wi-Fi w pensjonacie, alarm w domu letniskowym, anteny po halnym i więcej.':
    'Poradnik PRO-KOM Instalacje: gdzie powiesić kamery, Wi-Fi w pensjonacie, alarm w domu letniskowym, anteny po halnym i więcej.',
  'Monitoring ustawiony pod RODO': 'Monitoring z maskami prywatności',
  'Kto, kiedy i którymi drzwiami. Ustawione pod RODO.': 'Kto, kiedy i którymi drzwiami.',
  'Nie, jeśli sprzęt pracuje w paśmie dopuszczonym bez pozwolenia, np. 5470–5725 MHz na zewnątrz do 1 W EIRP z mechanizmem DFS. Dobieramy sprzęt i ustawienia zgodnie z przepisami.':
    'Nie, jeśli sprzęt pracuje w paśmie, które nie wymaga pozwolenia, np. 5470–5725 MHz na zewnątrz do 1 W EIRP z mechanizmem DFS. Taki sprzęt dobieramy i ustawiamy.',
  'Wejścia i wyjścia z czytników eksportujemy do programu rejestracji czasu pracy. Przed ofertą sprawdzamy, czy Twój program przyjmie eksport. Używamy kart, nie odcisku palca, zgodnie ze stanowiskiem UODO.':
    'Wejścia i wyjścia z czytników eksportujemy do programu rejestracji czasu pracy. Przed ofertą sprawdzamy, czy Twój program przyjmie eksport. Do rejestracji czasu pracy używamy kart.',
  'Nagrania z transmisji na żywo trzeba dostosować w 14 dni, najpóźniej w 2 miesiące.':
    'Nagrania sesji często trzeba potem poprawiać, np. dodawać napisy.',
  'UODO uznał, że gmina nie może dać policji stałego dostępu do obrazu na żywo.':
    'Fragmenty nagrań przekazuje się na wniosek, bez stałego podglądu z zewnątrz.',
  'Teletechnika dla deweloperów, § 192e | PRO-KOM Instalacje':
    'Teletechnika dla deweloperów na Podhalu | PRO-KOM Instalacje',
  'Instalacja telekomunikacyjna według § 192e: punkt styku, światłowód, skrętka i koncentryk do mieszkań, RTV/SAT, domofony i protokoły pomiarów do odbioru.':
    'Instalacja telekomunikacyjna dla deweloperów: punkt styku, światłowód, skrętka i koncentryk do mieszkań, RTV/SAT, domofony i protokoły pomiarów.',
  'Unifon albo wideodomofon z aplikacją w każdym mieszkaniu. Sygnalizacja dzwonkowa do mieszkań jest w § 192a.':
    'Unifon albo wideodomofon z aplikacją w każdym mieszkaniu, z sygnalizacją dzwonkową do mieszkań.',
  'Instalacja według § 192e z punktem styku i dostępem dla wielu operatorów.':
    'Instalacja z punktem styku i dostępem dla wielu operatorów.',
  'Liczymy kable, skrzynki i piony według § 192e i proponujemy przygotowanie pod smart i ładowarki.':
    'Liczymy kable, skrzynki i piony i proponujemy przygotowanie pod smart i ładowarki.',
  'Instalacja według § 192e i § 192f': 'Instalacja telekomunikacyjna do odbioru',
  'Lepiej nie. Kamera, która obejmuje drogę lub posesję sąsiada, podlega RODO. Ustawiamy kadr na Twoją posesję, a resztę maskujemy w obrazie.':
    'Lepiej nie. Ustawiamy kadr na Twoją posesję, a resztę maskujemy w obrazie.',
  'Od zgodności z warunkami technicznymi po osiedle premium.':
    'Od podstawowej instalacji po osiedle premium.',
  'Zgodnie z warunkami technicznymi.': 'Z pomiarami do odbioru.',
  // INST-6 PR3: licence fees for music are a topic of law too (runda v6 §1.1).
  'Czy muszę płacić za muzykę w restauracji?': null,
  przepisy: null,
  Przepisy: null,
  '#przepisy': null,
  'Przepisy lokalne': null,
}

/** Parts of longer texts removed wherever they occur. */
export const LAW_FRAGMENTS: readonly (readonly [string, string])[] = [
  [' (szczegóły w sekcji „Przepisy”)', ''],
  [' (progi w sekcji „Przepisy”)', ''],
  [
    'Powyżej 50 miejsc noclegowych, a zakres potwierdza projektant lub rzeczoznawca ppoż. (szczegóły w sekcji „Przepisy”). ',
    '',
  ],
  [' Zasady dla pracowników i gości są w sekcji „Przepisy”.', ''],
  [' W Zakopanem sprawdzamy też zgodność z uchwałą krajobrazową.', ''],
  [' To nie jest dźwiękowy system ostrzegawczy (DSO).', ''],
  [' (abonament RTV obowiązuje niezależnie od sposobu odbioru)', ''],
]

const cleanText = (text: string): string | null => {
  if (text in LAW_TEXTS) return LAW_TEXTS[text] ?? null
  return LAW_FRAGMENTS.reduce((t, [from, to]) => t.replaceAll(from, to), text)
}

/**
 * An array item to leave out. Broad on purpose: an object or tuple goes when any of its own texts
 * is a `null` entry — in the package those are only anchors, folds and tabs of the gone law
 * sections (`przepisy`, `Przepisy`, `#przepisy`) and the questions of dropped FAQ pairs.
 */
const isDropped = (value: unknown): boolean =>
  typeof value === 'string'
    ? cleanText(value) === null
    : Array.isArray(value)
      ? value.some((v) => typeof v === 'string' && cleanText(v) === null)
      : typeof value === 'object' && value !== null
        ? Object.values(value).some((v) => typeof v === 'string' && cleanText(v) === null)
        : false

/** A deep copy of a package file without law (see the file comment). */
export function withoutLaw<T>(value: T): T {
  if (typeof value === 'string') return (cleanText(value) ?? '') as T
  if (Array.isArray(value)) return value.filter((v) => !isDropped(v)).map(withoutLaw) as T
  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withoutLaw(v)])) as T
  return value
}
