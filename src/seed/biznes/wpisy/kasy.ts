import { h2, p, ul } from '../lexical'
import type { BiznesGuidePost } from './types'

const VERIFIED = '2026-11-15'

const KASA_GOV = {
  name: 'Kasa fiskalna w firmie — biznes.gov.pl',
  url: 'https://www.biznes.gov.pl/pl/portal/00243',
}

/** Audyt 15.11 P1-3, partia 1: the mandatory technical review of a cash register. */
export const CASH_REGISTER_REVIEW: BiznesGuidePost = {
  slug: 'przeglad-kasy-fiskalnej-co-2-lata',
  title: 'Przegląd kasy fiskalnej co 2 lata — kiedy, u kogo i co grozi za spóźnienie',
  category: 'kasy',
  lead: 'Obowiązkowy przegląd kasy fiskalnej łatwo przeoczyć, bo zdarza się raz na dwa lata. Spóźnienie kosztuje karę i może oznaczać zwrot ulgi na kasę. Sprawdź, jak policzyć termin i jak przebiega przegląd.',
  summary:
    'Kasę trzeba oddać do przeglądu co najmniej raz na 2 lata, licząc od fiskalizacji albo od ostatniego przeglądu. Serwisant ma na niego 3 dni od zgłoszenia i wpisuje go do książki kasy. Za brak przeglądu w terminie urząd skarbowy może nałożyć karę 300 zł.',
  content: [
    h2('Jak policzyć termin'),
    p(
      'Pierwszy przegląd liczy się od dnia fiskalizacji kasy, każdy następny — od ostatniego obowiązkowego przeglądu. Datę znajdziesz w książce kasy: serwisant wpisuje tam fiskalizację i każdy przegląd.',
    ),
    p(
      'Masz kilka kas? Każda ma własny termin. Najprościej wpisać wszystkie daty do kalendarza z przypomnieniem miesiąc wcześniej.',
    ),
    h2('Kto robi przegląd'),
    p(
      'Przegląd robi serwisant uprawniony do serwisu danej marki kasy, na podstawie Twojego zgłoszenia. Powinien go wykonać w ciągu 3 dni od zgłoszenia, więc nie zostawiaj tego na ostatni dzień terminu.',
    ),
    h2('Co sprawdza serwisant'),
    ul(
      ['czy kasa działa poprawnie i nie ma śladów ingerencji,'],
      ['plomby i stan urządzenia,'],
      ['połączenie kasy online z Centralnym Repozytorium Kas,'],
      ['wpis przeglądu w książce kasy.'],
    ),
    p(
      'To dobry moment, żeby przy okazji zaktualizować oprogramowanie kasy, sprawdzić stawki VAT i nazwy towarów.',
    ),
    h2('Co grozi za spóźnienie'),
    ul(
      [
        { bold: 'Kara pieniężna: ' },
        'naczelnik urzędu skarbowego może nałożyć na podatnika karę 300 zł za kasę, która nie przeszła przeglądu w terminie.',
      ],
      [
        { bold: 'Zwrot ulgi: ' },
        'jeśli przy zakupie kasy skorzystałeś z ',
        { text: 'ulgi na kasę fiskalną', href: '/ulga-na-kase-fiskalna' },
        ', brak przeglądu co 2 lata oznacza obowiązek jej zwrotu.',
      ],
    ),
    h2('Przegląd kasy w Rabce-Zdroju'),
    p(
      'Jesteśmy autoryzowanym serwisem kas Posnet i Elzab. Zrobimy przegląd, wpiszemy go do książki kasy i powiemy, kiedy wypada następny. Jeśli kasa jest stara albo coraz częściej się psuje, doradzimy, czy warto ją jeszcze naprawiać.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    KASA_GOV,
    {
      name: 'Rozporządzenie w sprawie kas rejestrujących (Dz.U. 2025 poz. 845)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000845',
    },
  ],
  products: ['posnet-ergo-online', 'elzab-k10-online', 'posnet-neo-online', 'elzab-mini-online'],
  cta: {
    eyebrow: 'Serwis kas',
    title: 'Zbliża się termin przeglądu?',
    text: 'Autoryzowany serwis kas Posnet i Elzab w Rabce-Zdroju. Przegląd z wpisem do książki kasy.',
    link: { label: 'Umów przegląd kasy', href: '/kontakt' },
  },
  contact: {
    heading: 'Umów przegląd kasy fiskalnej',
    lead: 'Podaj markę i model kasy oraz datę ostatniego przeglądu z książki kasy. Ustalimy termin.',
  },
  seo: {
    title: 'Przegląd kasy fiskalnej co 2 lata',
    description:
      'Kiedy wypada przegląd kasy fiskalnej, kto go robi i co grozi za spóźnienie: kara 300 zł i zwrot ulgi. Autoryzowany serwis Posnet i Elzab w Rabce.',
  },
}

/** Audyt 15.11 P1-3, partia 1: mistakes that cost the cash register relief. */
export const CASH_REGISTER_RELIEF: BiznesGuidePost = {
  slug: 'ulga-na-kase-fiskalna-bledy',
  title: 'Ulga na kasę fiskalną — 5 błędów, przez które trzeba ją oddać',
  category: 'dofinansowania',
  lead: 'Ulga na kasę online to zwrot do 90% ceny netto, najwyżej 700 zł na kasę. Łatwo ją jednak stracić — czasem dopiero po kilku latach. Zebraliśmy błędy, które najczęściej kończą się zwrotem ulgi do urzędu.',
  summary:
    'Ulga przysługuje tylko przy zakupie kasy online, zgłoszonej w urzędzie i używanej od początku ewidencji. Trzeba ją oddać, jeśli w ciągu 3 lat przestaniesz używać kasy, pominiesz przegląd co 2 lata albo kasa nie będzie łączyć się z Centralnym Repozytorium Kas.',
  content: [
    h2('Ile wynosi ulga i kto może z niej skorzystać'),
    p(
      'Ulga wynosi 90% ceny netto kasy, nie więcej niż 700 zł na jedno urządzenie. Przysługuje wyłącznie przy zakupie kasy online firmom, które zaczynają ewidencję sprzedaży na kasie. Czynny podatnik VAT odlicza ją w deklaracji, a zwolniony z VAT składa wniosek do naczelnika urzędu skarbowego. Szczegóły opisujemy na stronie ',
      { text: 'ulga na kasę fiskalną', href: '/ulga-na-kase-fiskalna' },
      '.',
    ),
    h2('Błąd 1. Kasa w leasingu albo wynajęta'),
    p(
      'Ulga dotyczy kasy kupionej. Przy kasie używanej na podstawie najmu, dzierżawy albo leasingu nie przysługuje.',
    ),
    h2('Błąd 2. Za późny zakup albo brak zgłoszenia'),
    p(
      'Kasę trzeba kupić i zacząć na niej ewidencję w terminie: nie później niż 6 miesięcy od rozpoczęcia ewidencji. Kasa musi być też zgłoszona naczelnikowi urzędu skarbowego. Zachowaj fakturę zakupu i dowód zapłaty całej kwoty — bez nich ulgi nie odliczysz.',
    ),
    h2('Błąd 3. Kasa odstawiona przed upływem 3 lat'),
    p(
      'Jeśli w ciągu 3 lat od rozpoczęcia ewidencji przestaniesz używać kasy, ulgę trzeba zwrócić. Dotyczy to też zamknięcia albo zawieszenia działalności w tym okresie — przed taką decyzją porozmawiaj z księgową.',
    ),
    h2('Błąd 4. Pominięty przegląd techniczny'),
    p(
      'Kasa musi przejść ',
      { text: 'przegląd techniczny', href: '/aktualnosci/przeglad-kasy-fiskalnej-co-2-lata' },
      ' co najmniej raz na 2 lata. Brak przeglądu w terminie to nie tylko kara, ale też obowiązek zwrotu ulgi.',
    ),
    h2('Błąd 5. Kasa bez połączenia z CRK'),
    p(
      'Kasa online przesyła dane do Centralnego Repozytorium Kas. Jeśli nie zapewnisz jej połączenia z internetem, możesz stracić ulgę. Dlatego przy montażu kasy sprawdzamy, jak łączy się z siecią w Twoim lokalu.',
    ),
    h2('Kiedy oddaje się ulgę'),
    p(
      'Zwrot rozlicza się w deklaracji VAT za okres, w którym powstał obowiązek zwrotu, zwykle do 25. dnia następnego miesiąca. Najprościej ustalić to z księgową.',
    ),
    p(
      'Sprzedajemy i fiskalizujemy kasy online Posnet i Elzab, robimy przeglądy i pilnujemy połączenia kasy z siecią. Dzięki temu warunki ulgi masz spełnione od pierwszego dnia.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    KASA_GOV,
    {
      name: 'Ewidencja sprzedaży z wykorzystaniem kas rejestrujących — podatki.gov.pl',
      url: 'https://podatki.gov.pl/podatki-firmowe/vat/poradniki-i-informatory/ewidencja-sprzedazy-z-wykorzystaniem-kas-rejestrujacych',
    },
    {
      name: 'Zwrot kosztów na zakup kasy fiskalnej online — biznes.gov.pl',
      url: 'https://www.biznes.gov.pl/pl/portal/ou1650',
    },
    {
      name: 'ustawa o VAT (art. 111)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
    },
  ],
  products: ['posnet-ergo-online', 'elzab-k10-online', 'posnet-temo-online', 'elzab-cube-online'],
  cta: {
    eyebrow: 'Kasa z ulgą',
    title: 'Kasa online z fiskalizacją i przeglądami',
    text: 'Dobierzemy kasę Posnet albo Elzab, zgłosimy fiskalizację i przypilnujemy warunków ulgi.',
    link: { label: 'Zapytaj o kasę online', href: '/ulga-na-kase-fiskalna' },
  },
  contact: {
    heading: 'Zaczynasz sprzedaż na kasie?',
    lead: 'Napisz, co sprzedajesz i od kiedy. Dobierzemy kasę online i powiemy, jak nie stracić ulgi.',
  },
  seo: {
    title: 'Ulga na kasę fiskalną — 5 błędów',
    description:
      'Ulga na kasę online to do 700 zł zwrotu. Sprawdź 5 błędów, przez które trzeba ją oddać: leasing, termin zakupu, przegląd co 2 lata, brak połączenia z CRK.',
  },
}

/** Audyt 15.11 P1-3, partia 1: who needs a cash register (online). */
export const WHO_NEEDS_REGISTER: BiznesGuidePost = {
  slug: 'kto-musi-miec-kase-fiskalna-online',
  title: 'Kasa fiskalna online — kto musi ją mieć, a kto może jeszcze poczekać',
  category: 'kasy',
  lead: 'Zakładasz działalność albo rośnie Ci sprzedaż dla klientów prywatnych? Sprawdź, kiedy potrzebna jest kasa fiskalna, kiedy działa zwolnienie do 20 000 zł i które branże muszą mieć kasę online.',
  summary:
    'Kasa jest potrzebna przy sprzedaży osobom prywatnym i rolnikom ryczałtowym. Ze zwolnienia skorzystasz, jeśli taka sprzedaż nie przekroczyła 20 000 zł w poprzednim roku, ale części towarów i usług trzeba ewidencjonować zawsze. Wybrane branże muszą używać kas online.',
  content: [
    h2('Zasada: sprzedaż dla osób prywatnych'),
    p(
      'Kasy fiskalnej potrzebujesz, gdy sprzedajesz towary lub usługi osobom fizycznym nieprowadzącym działalności albo rolnikom ryczałtowym. Sprzedaż wyłącznie dla firm co do zasady kasy nie wymaga — tu dokumentem jest faktura.',
    ),
    h2('Zwolnienie do 20 000 zł'),
    p(
      'Możesz nie mieć kasy, jeśli sprzedaż dla osób prywatnych i rolników ryczałtowych nie przekroczyła w poprzednim roku 20 000 zł. Gdy zaczynasz działalność w trakcie roku, limit liczy się proporcjonalnie do liczby dni działalności.',
    ),
    p(
      'Po przekroczeniu limitu zwolnienie traci moc po upływie 2 miesięcy od końca miesiąca, w którym to się stało. To czas na zakup, fiskalizację i zgłoszenie kasy — lepiej zacząć wcześniej.',
    ),
    h2('Kiedy zwolnienie nie działa'),
    p(
      'Część towarów i usług trzeba ewidencjonować na kasie zawsze, bez względu na obroty — od pierwszej sprzedaży. Ich listę zawiera § 4 rozporządzenia w sprawie zwolnień z obowiązku prowadzenia ewidencji przy użyciu kas. Zanim zaczniesz sprzedaż, sprawdź, czy Twoja branża się na niej znajduje, albo zapytaj księgową.',
    ),
    h2('Branże, które muszą mieć kasę online'),
    p(
      'Kasa online przesyła dane do Centralnego Repozytorium Kas. Muszą jej używać między innymi firmy, które:',
    ),
    ul(
      ['sprzedają paliwa albo naprawiają pojazdy,'],
      ['prowadzą gastronomię albo krótkotrwałe zakwaterowanie,'],
      ['sprzedają węgiel,'],
      ['świadczą usługi fryzjerskie, kosmetyczne, budowlane, medyczne albo prawnicze.'],
    ),
    p(
      'Firmy spoza tych branż mogą używać starszej kasy, dopóki działa. Nowe kasy są dziś kasami online.',
    ),
    h2('Kasa, drukarka fiskalna czy system POS?'),
    ul(
      [{ bold: 'Kasa' }, ' wystarczy w małym sklepie, punkcie usługowym czy w gabinecie.'],
      [
        { bold: 'Drukarka fiskalna' },
        ' pracuje z komputerem i programem sprzedaży — dobra tam, gdzie jest dużo towarów.',
      ],
      [
        { bold: 'System POS' },
        ' w gastronomii obsługuje sale, kuchnię i zamówienia, a paragon drukuje przez drukarkę fiskalną.',
      ],
    ),
    p(
      'Pomożemy wybrać urządzenie do Twojej branży, zfiskalizujemy je i podpowiemy, jak skorzystać z ',
      { text: 'ulgi na kasę', href: '/ulga-na-kase-fiskalna' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    KASA_GOV,
    {
      name: 'Rozporządzenie w sprawie zwolnień z obowiązku prowadzenia ewidencji przy użyciu kas rejestrujących (Dz.U. 2024 poz. 1902)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20240001902',
    },
    {
      name: 'Kasy online — podatki.gov.pl',
      url: 'https://www.podatki.gov.pl/vat/kasy-rejestrujace/kasy-online-informacje/',
    },
    {
      name: 'ustawa o VAT (art. 111, 145b)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
    },
  ],
  products: [
    'posnet-ergo-online',
    'elzab-mini-online',
    'posnet-neo-online',
    'posnet-temo-online',
    'gopos',
  ],
  cta: {
    eyebrow: 'Kasy fiskalne',
    title: 'Dobierzemy kasę do Twojej branży',
    text: 'Kasa, drukarka fiskalna albo system POS — z fiskalizacją i serwisem w Rabce-Zdroju.',
    link: { label: 'Zobacz kasy fiskalne', href: '/oferta/kasy-fiskalne' },
  },
  contact: {
    heading: 'Nie wiesz, czy potrzebujesz kasy?',
    lead: 'Napisz, co sprzedajesz i komu. Powiemy, czy potrzebna jest kasa i jaka.',
  },
  seo: {
    title: 'Kto musi mieć kasę fiskalną online',
    description:
      'Kiedy potrzebna jest kasa fiskalna, jak działa zwolnienie do 20 000 zł, kiedy nie działa i które branże muszą mieć kasę online. Poradnik dla małej firmy.',
  },
}

export const KASY_POSTS = [CASH_REGISTER_REVIEW, CASH_REGISTER_RELIEF, WHO_NEEDS_REGISTER] as const
