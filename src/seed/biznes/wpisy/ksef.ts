import { h2, p, ul } from '../lexical'
import type { BiznesGuidePost } from './types'

const VERIFIED = '2026-11-15'

/** Audyt 15.11 P1-3, partia 1: access for the accountant and employees. */
export const KSEF_PERMISSIONS: BiznesGuidePost = {
  slug: 'uprawnienia-ksef-dla-ksiegowej',
  title: 'Uprawnienia w KSeF dla księgowej i pracowników — krok po kroku',
  category: 'ksef',
  lead: 'Od 1 lutego 2026 firmy otrzymują faktury zakupu w KSeF. Jeśli biuro rachunkowe i pracownicy nie mają uprawnień, nie zobaczą ich ani nie wystawią faktury. Pokazujemy, kto nadaje dostęp, komu i w jakiej kolejności.',
  summary:
    'Uprawnienia nadaje się w Aplikacji Podatnika KSeF 2.0. Można je dać całemu biuru rachunkowemu, a biuro rozdzieli je swoim pracownikom. Spółka bez pieczęci kwalifikowanej zaczyna od formularza ZAW-FA w urzędzie skarbowym.',
  content: [
    h2('Dlaczego to pierwsza rzecz do zrobienia'),
    p(
      'Od 1 lutego 2026 każda firma otrzymuje faktury w KSeF. Coraz więcej faktur zakupu nie przychodzi już mailem w PDF-ie, tylko czeka w systemie (do końca 2026 część firm może jeszcze wystawiać faktury poza KSeF). Kto nie ma uprawnień, ten faktur z KSeF nie widzi. Dotyczy to też biura rachunkowego, które co miesiąc księguje Twoje koszty.',
    ),
    h2('Krok 1. Pierwsza osoba z dostępem'),
    p(
      'Przedsiębiorca na jednoosobowej działalności loguje się sam, na przykład Profilem Zaufanym albo podpisem kwalifikowanym, i od razu może nadawać uprawnienia. Spółka loguje się kwalifikowaną pieczęcią elektroniczną z NIP. Jeśli spółka pieczęci nie ma, składa w urzędzie skarbowym formularz ZAW-FA i wskazuje w nim jedną osobę, która dostanie dostęp jako pierwsza.',
    ),
    p(
      'Urząd musi zgłoszenie z ZAW-FA najpierw sprawdzić i wprowadzić do systemu, więc nie zostawiaj tego na ostatni tydzień. Uprawnienia nadane elektronicznie działają zwykle od razu.',
    ),
    h2('Krok 2. Dostęp dla biura rachunkowego'),
    p(
      'Nie musisz nadawać uprawnień każdej księgowej z osobna. Wystarczy nadać je biuru rachunkowemu jako firmie, po jego NIP. Przy nadawaniu decydujesz:',
    ),
    ul(
      ['czy biuro ma tylko przeglądać faktury, czy także je wystawiać,'],
      ['czy biuro może przekazać uprawnienia dalej, swoim pracownikom.'],
    ),
    p(
      'Druga opcja jest wygodna: gdy w biurze zmienia się księgowa, nie musisz nic robić. Biuro samo odbiera i nadaje dostęp swoim ludziom.',
    ),
    h2('Krok 3. Pracownicy w firmie'),
    p(
      'Osobie, która wystawia faktury, nadajesz uprawnienie do wystawiania. Osobie, która tylko sprawdza faktury zakupu, wystarczy przeglądanie. Uprawnienie do zarządzania uprawnieniami zostaw właścicielowi i jednej zaufanej osobie.',
    ),
    h2('Dwie pułapki, które widzimy najczęściej'),
    ul(
      [
        { bold: 'ZAW-FA z czasów KSeF 1.0 (przed 1 lutego 2026).' },
        ' Taka osoba dostała tylko prawo do zarządzania uprawnieniami. Żeby zobaczyć faktury, musi w zakładce „Uprawnienia” nadać je sobie samej.',
      ],
      [
        { bold: 'Uprawnienia z KSeF 1.0.' },
        ' Nie przechodzą do KSeF 2.0, z wyjątkiem tych nadanych na podstawie ZAW-FA. Trzeba je nadać od nowa.',
      ],
    ),
    h2('Co przygotować przed nadaniem uprawnień'),
    ul(
      ['NIP biura rachunkowego i decyzję, co biuro ma robić w KSeF,'],
      ['listę osób w firmie: kto wystawia, kto tylko przegląda,'],
      ['sposób logowania właściciela: Profil Zaufany, podpis albo pieczęć kwalifikowana.'],
    ),
    p(
      'Podpis i pieczęć kwalifikowaną EuroCert pomożemy wyrobić, a uprawnienia skonfigurujemy razem z Tobą przy ',
      { text: 'wdrożeniu KSeF', href: '/ksef' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'KSeF krok po kroku — księgowi (MF)',
      url: 'https://ksef.podatki.gov.pl/krok-po-kroku-ksiegowi/',
    },
    {
      name: 'Pytania i odpowiedzi KSeF 2.0 — uprawnienia (MF)',
      url: 'https://ksef.podatki.gov.pl/pytania-i-odpowiedzi-ksef-20/?category=Uprawnienia+i+autoryzacja',
    },
    {
      name: 'Podręcznik KSeF 2.0, cz. I (MF)',
      url: 'https://ksef.podatki.gov.pl/media/dmrfdixs/podrecznik-ksef-20-cz-i-rozpoczecie-korzystania-z-ksef-06082026.pdf',
    },
  ],
  products: [
    'podpis-kwalifikowany-eurocert',
    'pieczec-kwalifikowana-eurocert',
    'eurocert-pieczec-chmura',
  ],
  cta: {
    eyebrow: 'Wdrożenie KSeF',
    title: 'Ustawimy uprawnienia razem z Tobą',
    text: 'Logowanie właściciela, dostęp dla biura rachunkowego i pracowników, podpis albo pieczęć EuroCert.',
    link: { label: 'Zapytaj o wdrożenie KSeF', href: '/ksef' },
  },
  contact: {
    heading: 'Księgowa nie widzi faktur w KSeF?',
    lead: 'Napisz, jak logujesz się do KSeF i kto prowadzi Twoje księgi. Sprawdzimy uprawnienia i powiemy, co poprawić.',
  },
  seo: {
    title: 'Uprawnienia w KSeF dla księgowej',
    description:
      'Jak nadać biuru rachunkowemu i pracownikom uprawnienia w KSeF 2.0: kto zaczyna, kiedy potrzebny jest ZAW-FA i jakie pułapki czekają po 1 lutego 2026.',
  },
}

/** Audyt 15.11 P1-3, partia 1: offline24, unavailability and failure of KSeF. */
export const KSEF_FAILURE: BiznesGuidePost = {
  slug: 'ksef-awaria-tryb-offline24',
  title: 'Brak internetu albo awaria KSeF — jak wystawić fakturę i co zrobić potem',
  category: 'ksef',
  lead: 'Internet pada, KSeF ma przerwę techniczną, a klient czeka na fakturę. Przepisy przewidują na to trzy tryby. Każdy ma inny termin wysłania faktury do KSeF. Wyjaśniamy, który kiedy stosować i jak przygotować firmę wcześniej.',
  summary:
    'Przy problemie po Twojej stronie działa offline24: fakturę wysyłasz do KSeF najpóźniej następnego dnia roboczego. Przy niedostępności lub awarii KSeF ogłoszonej przez MF terminy liczy się od końca przerwy. Do faktur offline potrzebny jest certyfikat KSeF typu 2 — warto go mieć, zanim coś się stanie.',
  content: [
    h2('Trzy sytuacje, trzy tryby'),
    ul(
      [
        { bold: 'Problem po Twojej stronie' },
        ' (brak internetu, awaria komputera): tryb offline24. Możesz go użyć zawsze, bez podawania przyczyny. Fakturę wystawiasz w programie, a do KSeF wysyłasz ją najpóźniej w następnym dniu roboczym po wystawieniu.',
      ],
      [
        { bold: 'Niedostępność KSeF' },
        ' (na przykład zapowiedziane prace serwisowe): fakturę wysyłasz najpóźniej w następnym dniu roboczym po zakończeniu niedostępności.',
      ],
      [
        { bold: 'Awaria KSeF' },
        ': fakturę wysyłasz w ciągu 7 dni roboczych od zakończenia awarii.',
      ],
    ),
    p(
      'Niedostępność i awarię Ministerstwo Finansów ogłasza w BIP MF i w programach połączonych z KSeF. Przy awarii całkowitej, ogłoszonej w mediach, faktur nie wysyła się do KSeF wcale — przekazujesz je nabywcy w uzgodniony sposób.',
    ),
    h2('Data faktury się nie przesuwa'),
    p(
      'Datą wystawienia faktury w trybie offline jest data wpisana na fakturze, a nie dzień, w którym trafiła do KSeF. Nie trzeba więc niczego „przedatowywać” ani wystawiać faktury drugi raz.',
    ),
    h2('Dwa kody QR i certyfikat typu 2'),
    p(
      'Faktura przekazana nabywcy, zanim trafi do KSeF, ma dwa kody QR: z napisem „OFFLINE” i z napisem „CERTYFIKAT”. Drugi kod potwierdza, kto wystawił fakturę. Do jego wygenerowania potrzebny jest certyfikat KSeF typu 2.',
    ),
    p(
      'Certyfikat typu 2 generuje się osobno od certyfikatu typu 1, którym program loguje się do KSeF. Jeden certyfikat nie obsługuje obu zastosowań. Każdy jest ważny najdłużej 2 lata, więc zapisz sobie datę wygaśnięcia.',
    ),
    h2('Procedura na jedną kartkę'),
    p('Spisz ją teraz, nie w dniu awarii. Wystarczą odpowiedzi na pięć pytań:'),
    ul(
      ['Kto w firmie decyduje, że przechodzimy na tryb offline?'],
      ['Na którym komputerze i w jakim programie wystawiamy faktury bez internetu?'],
      ['Gdzie jest certyfikat KSeF typu 2 i do kiedy jest ważny?'],
      ['Jak przekazujemy fakturę klientowi: wydruk, PDF mailem?'],
      ['Kto i kiedy wysyła zaległe faktury do KSeF, gdy wszystko wróci?'],
    ),
    p(
      'Przy ',
      { text: 'wdrożeniu KSeF', href: '/ksef' },
      ' przygotowujemy certyfikaty, ustawiamy tryb offline w programie i spisujemy z Tobą taką procedurę. Jeśli problemem bywa internet, sprawdzimy też łącze i sprzęt w ramach ',
      { text: 'opieki IT', href: '/opieka-it' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Tryb offline24 (MF)',
      url: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/tryb-offline24/',
    },
    {
      name: 'Tryb offline — niedostępność KSeF (MF)',
      url: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/tryb-offline-niedostepnosc-ksef/',
    },
    {
      name: 'Tryb awaryjny (MF)',
      url: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/tryb-awaryjny/',
    },
    {
      name: 'Certyfikaty KSeF (MF)',
      url: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/certyfikaty-ksef/',
    },
  ],
  products: ['insert-subiekt-nexo', 'insert-subiekt-gt', 'posnet-ergo-online'],
  cta: {
    eyebrow: 'Wdrożenie KSeF',
    title: 'Przygotujemy firmę na dzień bez internetu',
    text: 'Certyfikaty KSeF, tryb offline w programie i procedura awaryjna spisana razem z Tobą.',
    link: { label: 'Zapytaj o wdrożenie KSeF', href: '/ksef' },
  },
  contact: {
    heading: 'Masz plan na awarię KSeF?',
    lead: 'Powiedz, w jakim programie wystawiasz faktury. Sprawdzimy, czy tryb offline jest gotowy, i pomożemy spisać procedurę.',
  },
  seo: {
    title: 'Awaria KSeF i tryb offline24 — co robić',
    description:
      'Offline24, niedostępność i awaria KSeF: terminy wysłania faktury, dwa kody QR, certyfikat typu 2 i procedura awaryjna na jedną kartkę dla małej firmy.',
  },
}

/** Audyt 15.11 P1-3, partia 1: invoices to receipts from 1 January 2027. */
export const KSEF_RECEIPT_INVOICE: BiznesGuidePost = {
  slug: 'faktura-do-paragonu-od-2027',
  title: 'Faktura do paragonu od 1 stycznia 2027 — co zmienia się przy kasie',
  category: 'ksef',
  lead: 'Do końca 2026 paragon z NIP do 450 zł jest fakturą uproszczoną, a fakturę można wydrukować z kasy — obie poza KSeF. Od 1 stycznia 2027 to się kończy. Sprawdź, jak będzie wyglądać sprzedaż dla firm w sklepie, restauracji czy pensjonacie.',
  summary:
    'Od 1 stycznia 2027 kasa nie wystawi już faktury, a faktura dla firmy — także do paragonu z NIP — musi trafić do KSeF. Paragon z NIP do 450 zł nie zastąpi już faktury poza KSeF. Kasa dalej drukuje paragony dla wszystkich klientów.',
  content: [
    h2('Co działa do 31 grudnia 2026'),
    ul(
      ['Fakturę można wystawić przy użyciu kasy rejestrującej, poza KSeF.'],
      [
        'Paragon z NIP nabywcy na kwotę do 450 zł jest fakturą uproszczoną i też nie trafia do KSeF.',
      ],
    ),
    h2('Co zmienia się 1 stycznia 2027'),
    ul(
      ['Kasa rejestrująca nie wystawi już faktury.'],
      ['Paragon z NIP do 450 zł nie zastąpi już faktury poza KSeF.'],
      ['Fakturę dla firmy wystawiasz w programie albo w aplikacji podłączonej do KSeF.'],
    ),
    p(
      'Kasa nie znika: dalej drukuje paragony i dalej rejestruje sprzedaż dla osób prywatnych. Zmienia się tylko droga faktury dla firmy.',
    ),
    h2('NIP na paragonie wciąż ma znaczenie'),
    p(
      'Jeśli klient firmowy chce faktury do paragonu, NIP musi być na paragonie już przy sprzedaży. Bez tego faktury dla firmy do takiego paragonu wystawić nie można. Personel przy kasie powinien więc nadal pytać: „Czy podać NIP na paragonie?”.',
    ),
    h2('Jak to zorganizować w praktyce'),
    ul(
      [
        { bold: 'Sklep: ' },
        'kasa połączona z programem sprzedaży, na przykład Subiektem, który wystawi fakturę do paragonu w KSeF.',
      ],
      [
        { bold: 'Gastronomia: ' },
        'system POS, w którym fakturę dla firmy wystawia się przy rachunku — tak działa GoPOS.',
      ],
      [{ bold: 'Pensjonat i hotel: ' }, 'faktura z programu hotelowego, na przykład NFHotel.'],
    ),
    p(
      'Faktury dla osób prywatnych nie muszą trafiać do KSeF — obowiązek dotyczy sprzedaży między firmami. Wiele programów pozwala jednak wystawiać w KSeF wszystkie faktury, co upraszcza pracę.',
    ),
    h2('Lista na grudzień'),
    ul(
      ['Sprawdź, w czym dziś wystawiasz faktury do paragonów.'],
      ['Upewnij się, że program jest podłączony do KSeF 2.0 i ma uprawnienia.'],
      ['Pokaż personelowi przy kasie, jak wystawić fakturę do paragonu po nowemu.'],
    ),
    p(
      'Kasy Posnet i Elzab serwisujemy jako autoryzowany serwis, a programy InsERT i GoPOS wdrażamy jako autoryzowany partner. Połączymy kasę z programem i przygotujemy firmę do ',
      { text: 'KSeF', href: '/ksef' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Zakres obowiązkowego KSeF (MF)',
      url: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/zakres-obowiazkowego-ksef/',
    },
    {
      name: 'Pytania i odpowiedzi KSeF 2.0 (MF)',
      url: 'https://ksef.podatki.gov.pl/pytania-i-odpowiedzi-ksef-20/',
    },
    {
      name: 'Kasa fiskalna w firmie — biznes.gov.pl',
      url: 'https://www.biznes.gov.pl/pl/portal/00243',
    },
    {
      name: 'ustawa o VAT',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
    },
  ],
  products: ['insert-subiekt-nexo', 'gopos', 'posnet-ergo-online', 'elzab-k10-online'],
  cta: {
    eyebrow: 'Kasa i KSeF',
    title: 'Połączymy kasę z programem do faktur',
    text: 'Sklep, gastronomia albo pensjonat: ustawimy fakturę do paragonu w KSeF i pokażemy ją personelowi.',
    link: { label: 'Zapytaj o wdrożenie KSeF', href: '/ksef' },
  },
  contact: {
    heading: 'Drukujesz faktury z kasy?',
    lead: 'Napisz, jaką masz kasę i program. Powiemy, co trzeba zmienić przed 1 stycznia 2027.',
  },
  seo: {
    title: 'Faktura do paragonu od 2027 a KSeF',
    description:
      'Od 1 stycznia 2027 kasa nie wystawi faktury, a faktura do paragonu z NIP idzie przez KSeF. Jak to zorganizować w sklepie, lokalu i pensjonacie.',
  },
}

export const KSEF_POSTS = [KSEF_PERMISSIONS, KSEF_FAILURE, KSEF_RECEIPT_INVOICE] as const
