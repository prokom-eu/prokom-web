import { h2, p, ul } from '../lexical'
import type { BiznesGuidePost } from './types'

// Audyt 15.11 P1-3, partia 2: KSeF certificates, KSeF in Subiekt, and four cash register posts.
// Facts checked on 15.11.2026 (ksef.podatki.gov.pl, biznes.gov.pl, insert.com.pl).

const VERIFIED = '2026-11-15'

const KASA_GOV = {
  name: 'Kasa fiskalna w firmie — biznes.gov.pl',
  url: 'https://www.biznes.gov.pl/pl/portal/00243',
}
const CERTS = {
  name: 'Certyfikaty KSeF (MF)',
  url: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/certyfikaty-ksef/',
}

export const KSEF_CERTIFICATES: BiznesGuidePost = {
  slug: 'certyfikat-ksef-typ-1-i-typ-2',
  title: 'Certyfikat KSeF typu 1 i typu 2 — do czego służy i jak go uzyskać',
  category: 'ksef',
  lead: 'Certyfikat KSeF to nie to samo co podpis kwalifikowany. Są dwa rodzaje: jeden do łączenia programu z KSeF, drugi do faktur wystawianych offline. Wyjaśniamy, który jest Ci potrzebny, skąd go wziąć i o czym pamiętać.',
  summary:
    'Certyfikat typu 1 służy do uwierzytelniania programu w KSeF, a typ 2 — do oznaczania kodem QR faktur wystawionych w trybach offline. Oba generuje się osobno w Aplikacji Podatnika KSeF 2.0 i każdy jest ważny najdłużej 2 lata.',
  content: [
    h2('Dwa typy, dwa zastosowania'),
    ul(
      [
        { bold: 'Typ 1 — uwierzytelnianie.' },
        ' Program do faktur używa go, żeby połączyć się z KSeF i wysyłać albo pobierać faktury. Certyfikatem nie zalogujesz się natomiast do Aplikacji Podatnika KSeF.',
      ],
      [
        { bold: 'Typ 2 — offline.' },
        ' Potrzebny do drugiego kodu QR z napisem „CERTYFIKAT” na fakturach wystawionych w trybie offline24, przy niedostępności albo awarii KSeF.',
      ],
    ),
    p(
      'Jednego certyfikatu nie da się użyć do obu celów — każdy typ generuje się osobno. Token KSeF, z którego korzysta wiele programów, MF utrzymało bezterminowo, ale do faktur offline i tak potrzebny jest certyfikat typu 2.',
    ),
    h2('Skąd wziąć certyfikat'),
    p(
      'Wniosek składa się i certyfikat pobiera w Aplikacji Podatnika KSeF 2.0 (albo przez API, z poziomu programu). Najpierw trzeba się uwierzytelnić jako podatnik lub osoba uprawniona — na przykład Profilem Zaufanym, podpisem albo pieczęcią kwalifikowaną.',
    ),
    ul(
      ['Certyfikat z danymi osoby fizycznej może wygenerować tylko ta osoba, dla siebie.'],
      [
        'Spółka uwierzytelniona pieczęcią kwalifikowaną może wygenerować wiele certyfikatów, na przykład osobno dla kilku programów.',
      ],
    ),
    h2('Ważność i porządek w certyfikatach'),
    p(
      'Certyfikat jest ważny najdłużej 2 lata od wygenerowania. Po tym czasie trzeba wystąpić o kolejny. Zapisz daty w kalendarzu — wygasły certyfikat typu 2 wychodzi zwykle dopiero wtedy, gdy pada internet i trzeba wystawić fakturę offline.',
    ),
    p('Przy kilku certyfikatach prowadź prostą listę:'),
    ul(
      ['typ certyfikatu i do czego służy,'],
      ['w którym programie i na którym komputerze jest zainstalowany,'],
      ['kto go wygenerował i do kiedy jest ważny.'],
    ),
    p(
      'Plik certyfikatu z kluczem prywatnym traktuj jak hasło: nie wysyłaj go mailem i nie trzymaj na pulpicie. O tym, co robić przy awarii, piszemy w poradniku ',
      { text: 'o trybie offline24', href: '/aktualnosci/ksef-awaria-tryb-offline24' },
      '.',
    ),
    p(
      'Przy ',
      { text: 'wdrożeniu KSeF', href: '/ksef' },
      ' generujemy z Tobą oba certyfikaty i instalujemy je w programie. Pomożemy też wyrobić podpis albo pieczęć EuroCert, jeśli jeszcze ich nie masz.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    CERTS,
    {
      name: 'Tryb offline24 (MF)',
      url: 'https://ksef.podatki.gov.pl/informacje-ogolne-ksef-20/tryb-offline24/',
    },
  ],
  products: [
    'pieczec-kwalifikowana-eurocert',
    'podpis-kwalifikowany-eurocert',
    'eurocert-ecsigner',
  ],
  cta: {
    eyebrow: 'Wdrożenie KSeF',
    title: 'Wygenerujemy i zainstalujemy certyfikaty',
    text: 'Typ 1 do programu, typ 2 do faktur offline, lista dat ważności i podpis albo pieczęć EuroCert.',
    link: { label: 'Zapytaj o wdrożenie KSeF', href: '/ksef' },
  },
  contact: {
    heading: 'Nie wiesz, czy masz certyfikat KSeF?',
    lead: 'Napisz, w jakim programie wystawiasz faktury. Sprawdzimy, czego brakuje do pracy online i offline.',
  },
  seo: {
    title: 'Certyfikat KSeF typu 1 i typu 2',
    description:
      'Czym różni się certyfikat KSeF typu 1 i typu 2, jak go wygenerować w Aplikacji Podatnika KSeF 2.0, jak długo jest ważny i do czego potrzebny jest offline.',
  },
}

export const KSEF_IN_SUBIEKT: BiznesGuidePost = {
  slug: 'ksef-w-subiekcie-nexo-i-gt',
  title: 'KSeF w Subiekcie nexo i Subiekcie GT — co trzeba ustawić',
  category: 'programy',
  lead: 'Subiekt nexo i Subiekt GT wysyłają faktury do KSeF prosto z programu. Żeby to działało, trzeba jednak podłączyć konto, uprawnienia i certyfikaty, a także zdecydować, czy faktury mają iść same, czy na żądanie.',
  summary:
    'W Subiekcie nexo faktury sprzedaży trafiają do KSeF ręcznie albo automatycznie po zapisie. Paragonów, faktur RR ani not korygujących Subiekt do KSeF nie wysyła. Obsługa KSeF w programach InsERT wymaga abonamentu i InsPunktów.',
  content: [
    h2('Co Subiekt wysyła do KSeF, a czego nie'),
    p('Według InsERT Subiekt nexo wysyła do KSeF:'),
    ul(
      ['faktury sprzedaży, także wystawione do paragonów,'],
      ['faktury zaliczkowe, uproszczone i faktury VAT marża,'],
      ['korekty tych faktur.'],
    ),
    p(
      'Do KSeF nie trafiają paragony, paragony imienne, faktury RR ani noty korygujące — te dokumenty zostają w programie jak dotąd.',
    ),
    h2('Wysyłka ręczna czy automatyczna'),
    ul(
      [
        { bold: 'Ręczna: ' },
        'wysyłasz faktury na żądanie, na przykład na koniec dnia. Dobra, gdy faktur jest mało i chcesz je jeszcze przejrzeć.',
      ],
      [
        { bold: 'Automatyczna: ' },
        'faktura idzie do KSeF zaraz po zapisie. Wygodna przy wielu fakturach — nikt nie musi pamiętać o wysyłce.',
      ],
    ),
    p(
      'Faktura wysłana do KSeF ma numer KSeF i nie da się jej już zmienić — błąd poprawia się fakturą korygującą. Dlatego przy wysyłce automatycznej warto dobrze ustawić dane kontrahentów i towarów.',
    ),
    h2('Co trzeba przygotować'),
    ul(
      ['Konto InsERT podłączone do programu,'],
      ['uprawnienia w KSeF dla osób, które wystawiają faktury,'],
      ['sposób uwierzytelnienia programu (token albo certyfikat KSeF typu 1),'],
      ['certyfikat typu 2, jeśli chcesz wystawiać faktury offline.'],
    ),
    p(
      'O uprawnieniach i certyfikatach piszemy w poradnikach ',
      {
        text: 'o uprawnieniach dla księgowej',
        href: '/aktualnosci/uprawnienia-ksef-dla-ksiegowej',
      },
      ' i ',
      { text: 'o certyfikatach KSeF', href: '/aktualnosci/certyfikat-ksef-typ-1-i-typ-2' },
      '.',
    ),
    h2('Abonament i InsPunkty'),
    p(
      'InsERT podaje, że do obsługi KSeF w programach nexo, nexo PRO i GT potrzebny jest abonament oraz InsPunkty: wysyłka i pobranie faktury zużywają punkty z Portfela InsERT. Subiekt 123 ma obsługę KSeF bez InsPunktów, ale z limitem wysyłanych i pobieranych faktur. Aktualne zasady sprawdzisz na stronie InsERT — ustawimy je z Tobą przy wdrożeniu.',
    ),
    h2('Subiekt nexo czy GT?'),
    p(
      'Oba programy są zintegrowane z KSeF. Subiekt nexo to nowsza linia programów InsERT. Subiekt GT ma wielu wieloletnich użytkowników i też obsługuje KSeF. Jako autoryzowany partner InsERT pomożemy wybrać program, przenieść dane i skonfigurować KSeF — więcej na stronie ',
      { text: 'programów InsERT', href: '/insert' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'InsERT — obsługa KSeF w Subiekcie nexo/PRO',
      url: 'https://www.insert.com.pl/ksef/uzywam_subiekta_nexo_pro_i_prowadze_ksiegowosc.html',
    },
    { name: 'InsERT — KSeF w programach InsERT', url: 'https://www.insert.com.pl/ksef.html' },
    {
      name: 'InsERT — InsPunkty a KSeF',
      url: 'https://www.insert.com.pl/dla_uzytkownikow/portfel_insert/inspunkty_a_ksef.html',
    },
    {
      name: 'InsERT — Subiekt GT',
      url: 'https://www.insert.com.pl/programy_dla_firm/sprzedaz/subiekt_gt/opis.html',
    },
  ],
  products: [
    'insert-subiekt-nexo',
    'insert-subiekt-gt',
    'insert-subiekt-123',
    'insert-inspunkty-ksef',
  ],
  cta: {
    eyebrow: 'Autoryzowany partner InsERT',
    title: 'Skonfigurujemy KSeF w Subiekcie',
    text: 'Konto InsERT, uprawnienia, certyfikaty i wysyłka faktur — sprawdzone na Twoich dokumentach.',
    link: { label: 'Zobacz programy InsERT', href: '/insert' },
  },
  contact: {
    heading: 'Subiekt nie wysyła faktur do KSeF?',
    lead: 'Napisz, którą wersję Subiekta masz i co pokazuje program. Sprawdzimy konfigurację.',
  },
  seo: {
    title: 'KSeF w Subiekcie nexo i Subiekcie GT',
    description:
      'Jak działa KSeF w Subiekcie nexo i GT: które dokumenty idą do KSeF, wysyłka ręczna czy automatyczna, co przygotować oraz abonament i InsPunkty.',
  },
}

export const REGISTER_FISCALIZATION: BiznesGuidePost = {
  slug: 'fiskalizacja-kasy-online-krok-po-kroku',
  title: 'Fiskalizacja kasy online krok po kroku — od zakupu do pierwszego paragonu',
  category: 'kasy',
  lead: 'Kupiłeś kasę online i chcesz zacząć sprzedaż? Zanim wydrukujesz pierwszy paragon, kasę trzeba zafiskalizować. Pokazujemy, jak to wygląda, kto co robi i dlaczego przy kasie online nie trzeba już chodzić do urzędu skarbowego.',
  summary:
    'Fiskalizację kasy online robi serwisant przed rozpoczęciem ewidencji. Kasa łączy się z Centralnym Repozytorium Kas, które samo nadaje numer ewidencyjny. Przy kasie online nie ma obowiązku zgłaszania kasy do naczelnika urzędu skarbowego — chyba że chcesz skorzystać z ulgi na kasę.',
  content: [
    h2('Krok 1. Wybór kasy i miejsca'),
    p(
      'Zanim umówisz fiskalizację, ustal, gdzie kasa będzie stać i jak połączy się z internetem — kablem, przez Wi-Fi albo modem. Kasa online musi stale przesyłać dane do Centralnego Repozytorium Kas (CRK).',
    ),
    h2('Krok 2. Fiskalizacja u serwisanta'),
    p(
      'Fiskalizację przeprowadza serwisant przed rozpoczęciem ewidencji sprzedaży. Wpisuje do pamięci kasy NIP firmy, a kasa wysyła swoje dane do CRK i dostaje z niego numer ewidencyjny. Fiskalizację potwierdza raport fiskalny rozliczeniowy, a serwisant wpisuje ją do książki kasy.',
    ),
    h2('Krok 3. Bez wizyty w urzędzie'),
    p(
      'Przy kasie online nie ma obowiązku zgłaszania kasy do naczelnika urzędu skarbowego — dane trafiają do CRK automatycznie. Zgłoszenie w ciągu 7 dni od fiskalizacji dotyczyło kas starego typu, z papierowym albo elektronicznym zapisem kopii. Wyjątek: jeśli chcesz skorzystać z ulgi na zakup kasy, przed rozpoczęciem ewidencji złóż w urzędzie skarbowym zgłoszenie o liczbie i miejscu używania kas — to warunek ulgi.',
    ),
    p(
      'Więcej w poradniku ',
      { text: 'o błędach przy uldze', href: '/aktualnosci/ulga-na-kase-fiskalna-bledy' },
      '.',
    ),
    h2('Krok 4. Ustawienia przed sprzedażą'),
    ul(
      ['nagłówek paragonu: nazwa i adres firmy,'],
      ['stawki VAT i przypisanie ich do towarów,'],
      ['baza towarów albo połączenie kasy z programem sprzedaży,'],
      ['szkolenie osoby, która będzie obsługiwać kasę.'],
    ),
    h2('Co dalej po fiskalizacji'),
    ul(
      [
        { bold: 'Przegląd: ' },
        'pierwszy obowiązkowy przegląd liczy się od dnia fiskalizacji — najpóźniej po 2 latach.',
      ],
      [
        { bold: 'Ulga: ' },
        'jeśli kupujesz kasę online, możesz skorzystać z ',
        { text: 'ulgi na kasę fiskalną', href: '/ulga-na-kase-fiskalna' },
        ' — sprawdź, czego pilnować, żeby jej nie stracić.',
      ],
      [{ bold: 'Raporty: ' }, 'po każdym dniu sprzedaży kasa robi raport dobowy.'],
    ),
    p(
      'Jesteśmy autoryzowanym serwisem kas Posnet i Elzab w Rabce-Zdroju. Dobierzemy kasę, przeprowadzimy fiskalizację, ustawimy stawki i towary i pokażemy, jak obsługiwać kasę na co dzień.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    KASA_GOV,
    {
      name: 'Rejestracja kasy fiskalnej — biznes.gov.pl',
      url: 'https://www.biznes.gov.pl/pl/portal/ou1575',
    },
    {
      // Art. 111 ust. 4: the notice of the number and place of the registers — the relief's condition.
      name: 'ustawa o VAT (art. 111 ust. 4)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
    },
  ],
  products: ['posnet-ergo-online', 'elzab-k10-online', 'posnet-neo-online', 'elzab-k1-slim-online'],
  cta: {
    eyebrow: 'Kasy fiskalne',
    title: 'Kasa online gotowa do sprzedaży',
    text: 'Dobór kasy Posnet albo Elzab, fiskalizacja, stawki VAT, towary i szkolenie dla obsługi.',
    link: { label: 'Zobacz kasy fiskalne', href: '/oferta/kasy-fiskalne' },
  },
  contact: {
    heading: 'Umów fiskalizację kasy',
    lead: 'Napisz, co sprzedajesz i od kiedy chcesz zacząć. Dobierzemy kasę i ustalimy termin fiskalizacji.',
  },
  seo: {
    title: 'Fiskalizacja kasy online krok po kroku',
    description:
      'Jak wygląda fiskalizacja kasy online: rola serwisanta, numer z Centralnego Repozytorium Kas, brak zgłoszenia do urzędu i ustawienia kasy przed sprzedażą.',
  },
}

export const REGISTER_REPORTS: BiznesGuidePost = {
  slug: 'raport-dobowy-i-miesieczny-kasa-fiskalna',
  title: 'Raport dobowy i miesięczny na kasie fiskalnej — kiedy i po co',
  category: 'kasy',
  lead: 'Raport dobowy po każdym dniu sprzedaży, raport miesięczny raz w miesiącu — to codzienność każdej kasy. Przy kasie online część obowiązków się zmieniła. Zebraliśmy, co i kiedy trzeba zrobić, żeby kontrola nie miała do czego się przyczepić.',
  summary:
    'Raport dobowy robi się po zakończeniu sprzedaży danego dnia, najpóźniej przed pierwszą sprzedażą następnego dnia; przy kasie online nie trzeba go drukować. Raport miesięczny trzeba wystawić najpóźniej do 25. dnia następnego miesiąca.',
  content: [
    h2('Raport dobowy'),
    p(
      'Raport fiskalny dobowy podsumowuje sprzedaż z danego dnia. Robi się go po zakończeniu sprzedaży, najpóźniej przed pierwszą sprzedażą następnego dnia. Jeśli danego dnia nie było sprzedaży, raportu dobowego nie trzeba robić.',
    ),
    p(
      'Kasa online przesyła dane do Centralnego Repozytorium Kas, dlatego przy takiej kasie nie musisz drukować raportów dobowych. Raport nadal powstaje w kasie — wydruk jest potrzebny tylko wtedy, gdy chcesz go mieć na papierze, na przykład dla księgowej.',
    ),
    h2('Raport miesięczny'),
    p(
      'Raport miesięczny podsumowuje sprzedaż z całego miesiąca. Trzeba go wystawić najpóźniej do 25. dnia następnego miesiąca. Najprościej robić go pierwszego roboczego dnia nowego miesiąca, razem z przekazaniem dokumentów księgowej.',
    ),
    h2('Gdy zawieszasz działalność'),
    p(
      'W okresie zawieszenia działalności nie prowadzisz sprzedaży, więc nie robisz ani raportów dobowych, ani miesięcznych.',
    ),
    h2('Prosty rytm dla obsługi kasy'),
    ul(
      ['koniec dnia: raport dobowy, zanim zamkniesz lokal,'],
      ['początek miesiąca: raport miesięczny za poprzedni miesiąc,'],
      ['raz w roku: sprawdzenie w książce kasy, kiedy wypada przegląd.'],
    ),
    p(
      'Jeśli kasa przestaje łączyć się z internetem albo raport się nie drukuje, nie czekaj do kontroli. Jako autoryzowany serwis kas Posnet i Elzab sprawdzimy kasę i jej połączenie. O terminie przeglądu przeczytasz w poradniku ',
      { text: 'o przeglądzie kasy', href: '/aktualnosci/przeglad-kasy-fiskalnej-co-2-lata' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    KASA_GOV,
    {
      name: 'Rozporządzenie w sprawie kas rejestrujących (Dz.U. 2025 poz. 845)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20250000845',
    },
    {
      name: 'ustawa o VAT (art. 111)',
      url: 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20040540535',
    },
  ],
  products: ['posnet-ergo-online', 'elzab-k10-online', 'posnet-temo-online', 'elzab-cube-online'],
  cta: {
    eyebrow: 'Serwis kas',
    title: 'Kasa nie drukuje raportu?',
    text: 'Autoryzowany serwis kas Posnet i Elzab w Rabce-Zdroju: naprawa, połączenie z CRK, przeglądy.',
    link: { label: 'Zgłoś kasę do serwisu', href: '/kontakt' },
  },
  contact: {
    heading: 'Masz problem z raportem na kasie?',
    lead: 'Podaj markę i model kasy oraz to, co wyświetla. Powiemy, co dalej.',
  },
  seo: {
    title: 'Raport dobowy i miesięczny na kasie',
    description:
      'Kiedy zrobić raport dobowy i miesięczny na kasie fiskalnej, czy kasa online musi go drukować, co przy dniu bez sprzedaży i zawieszeniu działalności.',
  },
}

export const REGISTER_CLOSING: BiznesGuidePost = {
  slug: 'zamkniecie-firmy-a-kasa-fiskalna',
  title: 'Zamykasz firmę albo kończysz sprzedaż na kasie — co zrobić z kasą fiskalną',
  category: 'kasy',
  lead: 'Kasy fiskalnej nie wystarczy wyłączyć. Przy zamknięciu firmy albo końcu sprzedaży na kasie trzeba zrobić raporty, odczytać pamięć u serwisanta i wyrejestrować kasę w urzędzie skarbowym. Pokazujemy kolejne kroki i terminy.',
  summary:
    'W ostatnim dniu sprzedaży robisz raport dobowy, a serwisant odczytuje pamięć kasy i sporządza protokół. Protokół i raport rozliczeniowy składasz w urzędzie skarbowym w ciągu 5 dni, razem z wnioskiem o wyrejestrowanie kasy.',
  content: [
    h2('Krok 1. Ostatni dzień sprzedaży'),
    p(
      'Po zakończeniu sprzedaży zrób raport dobowy na każdej kasie. Kasa online po zakończeniu pracy w trybie fiskalnym sama przechodzi w tryb „tylko do odczytu”.',
    ),
    h2('Krok 2. Odczyt pamięci u serwisanta'),
    p(
      'Serwisant odczytuje pamięć kasy: drukuje raport fiskalny rozliczeniowy i sporządza protokół z odczytu. Kasa online musi mieć przy tym połączenie z Centralnym Repozytorium Kas — bez niego wyrejestrowanie nie jest możliwe.',
    ),
    h2('Krok 3. Dokumenty w urzędzie skarbowym — 5 dni'),
    p(
      'W ciągu 5 dni od sporządzenia protokołu i raportu składasz je w urzędzie skarbowym, w którym kasa była zarejestrowana, razem z wnioskiem o wyrejestrowanie kasy. Wniosek można wysłać przez e-Urząd Skarbowy, a protokół i raport złożyć osobiście albo wysłać pocztą.',
    ),
    h2('Gdy pamięci nie da się odczytać'),
    p(
      'Jeśli serwisant nie odczyta pamięci, kasa trafia do serwisu głównego producenta. To on sporządza protokół i przesyła go do urzędu, a Ty dostajesz kopię i od jej otrzymania liczysz 5 dni na wniosek o wyrejestrowanie.',
    ),
    h2('Nie zapomnij o uldze'),
    p(
      'Jeśli przy zakupie kasy skorzystałeś z ',
      { text: 'ulgi na kasę fiskalną', href: '/ulga-na-kase-fiskalna' },
      ', a firmę zamykasz przed upływem 3 lat od rozpoczęcia ewidencji, ulgę trzeba zwrócić. Termin zwrotu ustal z księgową.',
    ),
    h2('Zawieszenie to nie zamknięcie'),
    p(
      'Przy zawieszeniu działalności kasy nie wyrejestrowujesz — po prostu nie prowadzisz sprzedaży i nie robisz raportów. Pamiętaj tylko, że zawieszenie w okresie 3 lat też może mieć wpływ na ulgę — porozmawiaj o tym z księgową.',
    ),
    p(
      'Jako autoryzowany serwis kas Posnet i Elzab odczytamy pamięć kasy, przygotujemy protokół i powiemy, jakie dokumenty złożyć w urzędzie.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Wyrejestruj kasę fiskalną — biznes.gov.pl',
      url: 'https://www.biznes.gov.pl/pl/portal/ou1649',
    },
    KASA_GOV,
  ],
  products: ['posnet-ergo-online', 'elzab-k10-online'],
  cta: {
    eyebrow: 'Serwis kas',
    title: 'Odczytamy pamięć kasy',
    text: 'Raport rozliczeniowy, protokół z odczytu i lista dokumentów do urzędu skarbowego.',
    link: { label: 'Umów odczyt pamięci kasy', href: '/kontakt' },
  },
  contact: {
    heading: 'Kończysz sprzedaż na kasie?',
    lead: 'Podaj markę i model kasy oraz planowany ostatni dzień sprzedaży. Ustalimy termin odczytu.',
  },
  seo: {
    title: 'Zamknięcie firmy a kasa fiskalna',
    description:
      'Co zrobić z kasą fiskalną przy zamknięciu firmy: raport dobowy, odczyt pamięci przez serwisanta, protokół i wniosek o wyrejestrowanie w ciągu 5 dni.',
  },
}

export const REGISTER_OR_PRINTER: BiznesGuidePost = {
  slug: 'kasa-czy-drukarka-fiskalna',
  title: 'Kasa fiskalna czy drukarka fiskalna — co wybrać do sklepu, lokalu i gabinetu',
  category: 'kasy',
  lead: 'Kasa i drukarka fiskalna robią to samo — rejestrują sprzedaż i drukują paragony. Różnią się tym, kto nimi steruje. Podpowiadamy, co sprawdza się w małym sklepie, w gastronomii, w gabinecie i w sklepie z tysiącami towarów.',
  summary:
    'Kasa fiskalna działa samodzielnie i wystarcza tam, gdzie towarów jest niewiele. Drukarka fiskalna pracuje z komputerem i programem sprzedaży, więc lepiej sprawdza się przy dużej bazie towarów, magazynie i fakturach. W gastronomii paragon drukuje zwykle drukarka podłączona do systemu POS.',
  content: [
    h2('Kasa fiskalna — sama sobie sterem'),
    p(
      'Kasa ma własną klawiaturę, wyświetlacz i bazę towarów. Nie potrzebuje komputera, więc dobrze sprawdza się w małym sklepie, kiosku, punkcie usługowym albo w gabinecie, gdzie sprzedajesz kilkadziesiąt pozycji.',
    ),
    ul(
      ['prosta obsługa i szybki start,'],
      ['działa nawet wtedy, gdy komputer w firmie stoi,'],
      ['są modele przenośne, na przykład do sprzedaży w terenie.'],
    ),
    h2('Drukarka fiskalna — razem z programem'),
    p(
      'Drukarką fiskalną steruje program sprzedaży na komputerze, na przykład Subiekt — to on wysyła do niej paragon. Dzięki temu sprzedaż, magazyn i faktury są w jednym miejscu.',
    ),
    ul(
      ['wygodna przy setkach i tysiącach towarów,'],
      ['stany magazynowe zmieniają się przy każdej sprzedaży,'],
      [
        'fakturę do paragonu wystawisz od razu w programie i wyślesz do KSeF (więcej w poradniku ',
        { text: 'o fakturze do paragonu', href: '/aktualnosci/faktura-do-paragonu-od-2027' },
        ').',
      ],
    ),
    h2('Gastronomia: system POS'),
    p(
      'W restauracji czy kawiarni liczą się stoliki, zamówienia na kuchnię i podział rachunku. Tu najlepiej działa system POS, na przykład GoPOS, a paragon drukuje drukarka fiskalna podłączona do systemu.',
    ),
    h2('Jak wybrać w trzech pytaniach'),
    ul(
      ['Ile masz towarów lub usług — kilkadziesiąt czy kilka tysięcy?'],
      ['Czy prowadzisz magazyn i wystawiasz dużo faktur?'],
      ['Czy sprzedajesz w jednym miejscu, czy także w terenie?'],
    ),
    p(
      'Kasy i drukarki fiskalne Posnet i Elzab serwisujemy jako autoryzowany serwis, a programy InsERT i GoPOS wdrażamy jako autoryzowany partner. Dobierzemy urządzenie, przeprowadzimy fiskalizację i połączymy je z programem. Sprawdź też, ',
      {
        text: 'kto musi mieć kasę online',
        href: '/aktualnosci/kto-musi-miec-kase-fiskalna-online',
      },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [KASA_GOV],
  products: [
    'posnet-ergo-online',
    'elzab-k10-online',
    'posnet-thermal-hx-online',
    'elzab-zeta-online',
    'posnet-pospay-2-online',
    'gopos',
  ],
  cta: {
    eyebrow: 'Kasy i drukarki',
    title: 'Dobierzemy urządzenie do Twojej sprzedaży',
    text: 'Kasa, drukarka fiskalna albo system POS — z fiskalizacją, programem i serwisem w Rabce-Zdroju.',
    link: { label: 'Zobacz kasy fiskalne', href: '/oferta/kasy-fiskalne' },
  },
  contact: {
    heading: 'Kasa czy drukarka? Doradzimy',
    lead: 'Napisz, co sprzedajesz, ile masz towarów i czy prowadzisz magazyn. Zaproponujemy rozwiązanie.',
  },
  seo: {
    title: 'Kasa czy drukarka fiskalna — co wybrać',
    description:
      'Kasa fiskalna czy drukarka fiskalna: czym się różnią, co wybrać do małego sklepu, sklepu z magazynem, gabinetu i gastronomii. Poradnik dla firm z Podhala.',
  },
}
