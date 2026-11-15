import { h2, p, ul } from '../lexical'
import type { BiznesGuidePost } from './types'

// Audyt 15.11 P1-3, partia 4: programs (GoPOS, NFHotel, the two together, InsERT for payroll and
// accounting) and IT in the company (Microsoft 365, ESET PROTECT). Facts checked on 15.11.2026
// on the producers' own sites (gopos.pl, nfhotel.pl, insert.com.pl, microsoft.com, eset.com).

const VERIFIED = '2026-11-15'

export const GOPOS_GASTRO: BiznesGuidePost = {
  slug: 'gopos-system-pos-dla-gastronomii',
  title: 'GoPOS w lokalu gastronomicznym — co potrafi system POS i od czego zacząć',
  category: 'programy',
  lead: 'Kelner przyjmuje zamówienie na terminalu, kuchnia widzi je na ekranie, a zamówienia z Pyszne.pl czy Glovo wpadają do tego samego systemu. Tak może działać GoPOS z dodatkowymi modułami. Pokazujemy, z czego się składa i co ustawić przed startem.',
  summary:
    'GoPOS to system sprzedaży dla gastronomii na terminalach z Androidem: sprzedaż, paragony fiskalne, ekran kuchenny, zamówienia online i platformy dostaw w jednym miejscu, raporty w chmurze. Przy chwilowym braku internetu sprzedaż trwa dalej. Faktury wystawia się na POS albo w aplikacji webowej.',
  content: [
    h2('Jeden system zamiast kilku'),
    p(
      'GoPOS łączy sprzedaż przy stoliku i przy barze, paragony, faktury, magazyn i raporty. Właściciel sprawdza raporty w chmurze z dowolnego urządzenia, także poza lokalem.',
    ),
    h2('Z czego się składa'),
    ul(
      [
        { bold: 'Terminal All in One' },
        ' — terminal POS, kasa fiskalna i terminal płatniczy w jednym,',
      ],
      [{ bold: 'GoKDS' }, ' — ekran w kuchni zamiast papierowych bonów,'],
      [{ bold: 'GoOrder' }, ' — zamówienia online ze strony lokalu,'],
      [{ bold: 'GoKiosk' }, ' — samoobsługowe składanie zamówień,'],
      [{ bold: 'GoStock' }, ' — stany magazynowe i koszty produktów,'],
      [{ bold: 'GoCRM' }, ' — karty stałego klienta i vouchery.'],
    ),
    h2('Platformy dostaw w jednym panelu'),
    p(
      'Zamówienia z platform dostaw — m.in. Uber Eats, Glovo, Wolt, Bolt Food i Pyszne.pl — trafiają do jednego panelu GoHub zamiast na kilka tabletów przy barze.',
    ),
    h2('Gdy pada internet'),
    p(
      'Producent podaje, że GoPOS działa także przy chwilowym braku internetu i sprzedaż trwa dalej. Warto jednak mieć łącze zapasowe, bo zamówienia online i platformy dostaw bez internetu nie działają.',
    ),
    h2('Faktury i KSeF'),
    p(
      'Faktury wystawia się bezpośrednio na POS albo w aplikacji webowej. Do połączenia z KSeF potrzebny jest token KSeF 2.0 z Aplikacji Podatnika, wklejony w ustawieniach faktur. Tryby offline KSeF wymagają ',
      { text: 'certyfikatu KSeF', href: '/aktualnosci/certyfikat-ksef-typ-1-i-typ-2' },
      '; według producenta GoPOS pracuje nad ich wdrożeniem (stan na dzień sprawdzenia).',
    ),
    p(
      'Jako autoryzowany partner GoPOS dobierzemy urządzenia, skonfigurujemy menu, drukarki, platformy dostaw i KSeF, a potem pokażemy obsłudze, jak z tego korzystać. Zobacz ',
      { text: 'GoPOS', href: '/gopos' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    { name: 'GoPOS — system dla gastronomii', url: 'https://gopos.pl/' },
    { name: 'GoPOS — terminal All in One', url: 'https://gopos.pl/all-in-one' },
    { name: 'GoPOS — integracje', url: 'https://gopos.pl/integrations' },
    { name: 'GoPOS — KSeF', url: 'https://gopos.pl/ksef' },
  ],
  products: [
    'gopos-all-in-one',
    'gopos-kds',
    'gopos-goorder',
    'gopos-gokiosk',
    'gopos-gostock',
    'gopos-gocrm',
  ],
  cta: {
    eyebrow: 'GoPOS',
    title: 'Wdrożymy GoPOS w Twoim lokalu',
    text: 'Dobór urządzeń, menu, drukarki, platformy dostaw i KSeF — skonfigurowane i sprawdzone przed otwarciem.',
    link: { label: 'Zobacz GoPOS', href: '/gopos' },
  },
  contact: {
    heading: 'Planujesz GoPOS w lokalu?',
    lead: 'Napisz, ile masz stolików i czy przyjmujesz zamówienia online. Dobierzemy zestaw.',
  },
  seo: {
    title: 'GoPOS — system POS dla gastronomii',
    description:
      'Co potrafi GoPOS w restauracji: terminal All in One, ekran kuchenny, zamówienia online, platformy dostaw, praca bez internetu i faktury do KSeF.',
  },
}

export const NFHOTEL_PENSION: BiznesGuidePost = {
  slug: 'program-hotelowy-nfhotel-pensjonat',
  title: 'Program hotelowy dla pensjonatu i apartamentów — NFHotel w praktyce',
  category: 'programy',
  lead: 'Rezerwacje z Booking.com, z telefonu i z własnej strony zapisane w trzech miejscach to prosta droga do nadrezerwacji. Program hotelowy zbiera je w jednym kalendarzu. Pokazujemy, co daje NFHotel w pensjonacie, apartamentach i małym hotelu.',
  summary:
    'NFHotel to program hotelowy w chmurze dla hoteli, pensjonatów, apartamentów i domków. Channel manager pobiera rezerwacje z portali i od razu aktualizuje dostępność, silnik rezerwacji przyjmuje rezerwacje i płatności na stronie obiektu, a faktury trafiają automatycznie do KSeF.',
  content: [
    h2('Jeden kalendarz zamiast kilku'),
    p(
      'NFHotel to program hotelowy (PMS) dostępny z komputera i telefonu. Recepcja widzi rezerwacje, płatności i obłożenie w jednym miejscu, a właściciel może je sprawdzić zdalnie.',
    ),
    h2('Channel manager — portale bez nadrezerwacji'),
    p(
      'Rezerwacje z Booking.com, Airbnb, Expedii i innych portali trafiają do programu automatycznie. Gdy ktoś zarezerwuje pokój, dostępność zmienia się od razu we wszystkich kanałach sprzedaży.',
    ),
    h2('Rezerwacje na własnej stronie'),
    p(
      'Silnik rezerwacji to widżet na stronie obiektu: gość wybiera termin i pokój i płaci online, m.in. BLIK-iem, kartą albo przez Przelewy24. Rezerwacja trafia od razu do kalendarza, bez pośrednictwa portalu.',
    ),
    h2('Meldunek online i opłata miejscowa'),
    p(
      'Gość może opłacić pobyt i zameldować się online przed przyjazdem. Przy rezerwacji program nalicza opłatę miejscową — w miejscowościach turystycznych to mniej pracy dla recepcji.',
    ),
    h2('Faktury i KSeF'),
    p(
      'NFHotel wystawia faktury, także zaliczkowe i końcowe, i wysyła je do KSeF automatycznie — od razu albo z opóźnieniem. Dane dla księgowości można wyeksportować do plików JPK i CSV.',
    ),
    h2('Restauracja w obiekcie'),
    p(
      'Jeśli w obiekcie działa restauracja albo bar, NFHotel łączy się z systemem GoPOS — piszemy o tym w poradniku ',
      {
        text: 'o rachunku z restauracji na pokój',
        href: '/aktualnosci/gopos-nfhotel-rachunek-na-pokoj',
      },
      '.',
    ),
    p(
      'Wdrożymy NFHotel: pokoje i sezony, channel manager, silnik rezerwacji na stronie i KSeF, a potem pokażemy recepcji, jak z niego korzystać. Zobacz ',
      { text: 'NFHotel', href: '/marki/nfhotel' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    { name: 'NFHotel — program hotelowy', url: 'https://nfhotel.pl/' },
    { name: 'NFHotel — channel manager', url: 'https://nfhotel.pl/produkt/channel-manager' },
    { name: 'NFHotel — silnik rezerwacji', url: 'https://nfhotel.pl/produkt/booking-engine' },
    { name: 'NFHotel — faktury i KSeF', url: 'https://nfhotel.pl/produkt/faktury' },
  ],
  products: ['nfhotel'],
  cta: {
    eyebrow: 'Program hotelowy',
    title: 'NFHotel w Twoim obiekcie',
    text: 'Kalendarz, portale, rezerwacje na stronie i faktury do KSeF — skonfigurowane przed sezonem.',
    link: { label: 'Zobacz NFHotel', href: '/marki/nfhotel' },
  },
  contact: {
    heading: 'Ile masz pokoi i gdzie sprzedajesz?',
    lead: 'Napisz, z jakich portali korzystasz i czy masz restaurację. Zaproponujemy wdrożenie NFHotel.',
  },
  seo: {
    title: 'NFHotel — program dla pensjonatu',
    description:
      'Program hotelowy NFHotel w pensjonacie i apartamentach: channel manager z Booking.com i Airbnb, rezerwacje na stronie, meldunek online i faktury do KSeF.',
  },
}

export const GOPOS_NFHOTEL: BiznesGuidePost = {
  slug: 'gopos-nfhotel-rachunek-na-pokoj',
  title: 'Restauracja w hotelu — rachunek z baru na pokój gościa (GoPOS i NFHotel)',
  category: 'programy',
  lead: 'Gość zjada kolację, mówi „proszę na pokój”, a recepcja przy wymeldowaniu szuka karteczki z baru. Połączenie systemu restauracji z programem hotelowym załatwia to samo. Wyjaśniamy, jak działa integracja GoPOS z NFHotel.',
  summary:
    'Po połączeniu GoPOS z NFHotel zamówienia z restauracji, baru czy room service trafiają do rezerwacji gościa w programie hotelowym. Przy wymeldowaniu wszystko jest na jednym rachunku, bez przepisywania. Integrację opisują obaj producenci.',
  content: [
    h2('Dwa systemy, jeden gość'),
    p(
      'Restauracja sprzedaje w swoim systemie, recepcja rozlicza pobyt w programie hotelowym. Gdy gość prosi o dopisanie rachunku do pokoju, ktoś musi to przenieść ręcznie — i łatwo coś zgubić.',
    ),
    h2('Jak działa integracja'),
    p(
      'Kelner w GoPOS przypisuje zamówienie do pokoju, a ono trafia do rezerwacji gościa w NFHotel. Tak samo zamówienia z baru i room service. Recepcja widzi je przy wymeldowaniu na jednym rachunku.',
    ),
    h2('Co zyskujesz'),
    ul(
      ['brak karteczek i przepisywania rachunków,'],
      ['jeden rachunek za pobyt i posiłki przy wymeldowaniu,'],
      ['mniej pomyłek i sporów z gośćmi o to, co zamawiali.'],
    ),
    h2('Gdy pada internet'),
    p(
      'NFHotel podaje, że GoPOS pozwala nabijać rachunki także podczas awarii internetu, a operacje synchronizują się później z chmurą. Mimo to warto mieć łącze zapasowe.',
    ),
    h2('Co ustalić przed wdrożeniem'),
    ul(
      ['punkty sprzedaży: restauracja, bar, room service,'],
      ['kto potwierdza, że zamówienie ma iść na pokój,'],
      ['jak rozliczasz gościa przy wymeldowaniu: paragon czy faktura.'],
    ),
    p(
      'Wdrożymy oba systemy i połączymy je ze sobą — GoPOS jako jego autoryzowany partner. Zobacz ',
      { text: 'GoPOS', href: '/gopos' },
      ' i ',
      { text: 'NFHotel', href: '/marki/nfhotel' },
      ', a o samym programie hotelowym przeczytasz w poradniku ',
      { text: 'o NFHotel w pensjonacie', href: '/aktualnosci/program-hotelowy-nfhotel-pensjonat' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    { name: 'GoPOS — integracje (NFHotel)', url: 'https://gopos.pl/integrations' },
    { name: 'NFHotel — integracja z GoPOS', url: 'https://nfhotel.pl/integracje/gopos' },
  ],
  products: ['gopos-all-in-one', 'nfhotel'],
  cta: {
    eyebrow: 'GoPOS i NFHotel',
    title: 'Restauracja i hotel na jednym rachunku',
    text: 'Wdrożymy GoPOS i NFHotel i połączymy je, żeby zamówienia trafiały na pokój gościa.',
    link: { label: 'Zobacz GoPOS', href: '/gopos' },
  },
  contact: {
    heading: 'Masz restaurację przy hotelu?',
    lead: 'Napisz, jakich programów używasz dziś w recepcji i w restauracji. Powiemy, co da się połączyć.',
  },
  seo: {
    title: 'Rachunek z restauracji na pokój gościa',
    description:
      'Jak działa integracja GoPOS z NFHotel: zamówienia z restauracji, baru i room service trafiają do rezerwacji gościa i na jeden rachunek przy wymeldowaniu.',
  },
}

export const INSERT_ACCOUNTING: BiznesGuidePost = {
  slug: 'gratyfikant-rachmistrz-rewizor-ktory-program',
  title: 'Gratyfikant, Rachmistrz czy Rewizor — który program InsERT do kadr i księgowości',
  category: 'programy',
  lead: 'Subiekt do sprzedaży już jest, a teraz trzeba wybrać program do płac albo do księgowości. InsERT ma trzy: Gratyfikanta, Rachmistrza i Rewizora. Wyjaśniamy, czym się różnią i który wybrać.',
  summary:
    'Gratyfikant nexo służy do kadr i płac (także PPK i współpraca z programem Płatnik), Rachmistrz nexo do książki przychodów i rozchodów albo ryczałtu, a Rewizor nexo do pełnej księgowości z pobieraniem faktur z KSeF. Biuro rachunkowe dla wielu firm dokłada Biuro nexo.',
  content: [
    h2('Gratyfikant nexo — kadry i płace'),
    p(
      'Program do kadr i płac w małych i średnich firmach: umowy o pracę i cywilnoprawne, listy płac, ewidencja czasu pracy i nieobecności, zgłoszenia i raporty z wpłatami do PPK. Deklaracje ZUS przygotowuje we współpracy z programem Płatnik, a deklaracje podatkowe, np. PIT-11 i PIT-4R, wysyła elektronicznie.',
    ),
    p(
      'Wersja nexo PRO dodaje m.in. hierarchiczną strukturę firmy, rejestr wypadków i własne staże urlopowe.',
    ),
    h2('Rachmistrz nexo — KPiR i ryczałt'),
    p(
      'Dla firm na uproszczonej księgowości: prowadzi książkę przychodów i rozchodów albo ewidencję przychodów przy ryczałcie.',
    ),
    h2('Rewizor nexo — pełna księgowość'),
    p(
      'Program do ksiąg rachunkowych z KSeF: pobiera faktury z rządowego systemu, rozlicza VAT plikiem JPK_V7 i wysyła go do MF. Producent podkreśla płynne przejście z księgowości uproszczonej na księgi rachunkowe.',
    ),
    h2('Współpraca z Subiektem'),
    p(
      'Rewizor współpracuje z Subiektem nexo i Subiektem 123, więc dokumentów sprzedaży nie przepisuje się ręcznie. Jak przygotować samego Subiekta do KSeF, piszemy w poradniku ',
      { text: 'o KSeF w Subiekcie', href: '/aktualnosci/ksef-w-subiekcie-nexo-i-gt' },
      '.',
    ),
    h2('Biuro rachunkowe — wiele firm'),
    p(
      'Biuro, które prowadzi księgi kilku klientom, może dołożyć Biuro nexo — program automatyzuje pracę na wielu podmiotach w systemie InsERT nexo.',
    ),
    h2('Jak wybrać'),
    ul(
      ['zatrudniasz pracowników — Gratyfikant,'],
      ['KPiR albo ryczałt — Rachmistrz,'],
      ['pełne księgi rachunkowe — Rewizor,'],
      ['biuro rachunkowe — Rewizor albo Rachmistrz razem z Biurem nexo.'],
    ),
    p(
      'Jako autoryzowany partner InsERT zainstalujemy i skonfigurujemy programy, przeniesiemy dane i pokażemy, jak z nich korzystać. Zobacz ',
      { text: 'programy InsERT', href: '/insert' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'InsERT — Gratyfikant nexo',
      url: 'https://www.insert.com.pl/programy_dla_firm/kadry_i_place/gratyfikant_nexo/opis.html',
    },
    {
      name: 'InsERT — Gratyfikant nexo i nexo PRO, porównanie',
      url: 'https://www.insert.com.pl/programy_dla_firm/kadry_i_place/gratyfikant_nexo/porownanie.html',
    },
    {
      name: 'InsERT — Rachmistrz nexo',
      url: 'https://www.insert.com.pl/programy_dla_firm/ksiegowosc_i_finanse/rachmistrz_nexo/opis.html',
    },
    {
      name: 'InsERT — Rewizor nexo',
      url: 'https://www.insert.com.pl/programy_dla_firm/ksiegowosc_i_finanse/rewizor_nexo/opis.html',
    },
    {
      name: 'InsERT — Biuro nexo',
      url: 'https://www.insert.com.pl/programy_dla_firm/ksiegowosc_i_finanse/biuro_nexo/opis.html',
    },
  ],
  products: [
    'insert-gratyfikant-nexo-gt',
    'insert-rachmistrz-nexo-gt',
    'insert-rewizor-nexo-gt',
    'insert-biuro-nexo-gt',
    'insert-subiekt-nexo',
  ],
  cta: {
    eyebrow: 'InsERT',
    title: 'Dobierzemy program do kadr i księgowości',
    text: 'Gratyfikant, Rachmistrz albo Rewizor — instalacja, konfiguracja, przeniesienie danych i połączenie z Subiektem.',
    link: { label: 'Zobacz programy InsERT', href: '/insert' },
  },
  contact: {
    heading: 'Który program InsERT wybrać?',
    lead: 'Napisz, jaką masz formę księgowości i ilu pracowników zatrudniasz. Doradzimy zestaw programów.',
  },
  seo: {
    title: 'Gratyfikant, Rachmistrz czy Rewizor',
    description:
      'Czym różnią się programy InsERT: Gratyfikant nexo do kadr i płac, Rachmistrz nexo do KPiR i ryczałtu, Rewizor nexo do pełnej księgowości z KSeF.',
  },
}

export const MICROSOFT_365: BiznesGuidePost = {
  slug: 'microsoft-365-business-basic-standard-premium',
  title: 'Microsoft 365 dla firm — Business Basic, Standard czy Premium',
  category: 'it-w-firmie',
  lead: 'Firmowa poczta we własnej domenie, Word i Excel na każdym komputerze, pliki w chmurze — to wszystko jest w Microsoft 365. Plany Business różnią się jednak tym, co dostajesz. Wyjaśniamy, który wybrać.',
  summary:
    'Plany Business obejmują pocztę 50 GB we własnej domenie i 1 TB w OneDrive na użytkownika. Basic ma aplikacje w przeglądarce i telefonie, Standard dokłada pełne aplikacje na komputer, a Premium (dla firm do 300 użytkowników) także ochronę przed zagrożeniami i zarządzanie urządzeniami.',
  content: [
    h2('Co jest w każdym planie Business'),
    ul(
      ['poczta Exchange ze skrzynką 50 GB i adresem we własnej domenie,'],
      ['1 TB miejsca w OneDrive na użytkownika,'],
      [
        'Microsoft Teams do spotkań i wspólnej pracy — w wersji planu z Teams (Microsoft sprzedaje plany także bez Teams).',
      ],
    ),
    h2('Business Basic — przeglądarka i telefon'),
    p(
      'Word, Excel, PowerPoint i Outlook działają w przeglądarce i w aplikacjach mobilnych, bez instalacji na komputerze. Wystarcza, gdy pracownicy głównie piszą maile i czasem otwierają dokumenty.',
    ),
    h2('Business Standard — pełne aplikacje'),
    p(
      'Dokłada aplikacje instalowane na komputerze: Outlook, Word, Excel, PowerPoint i OneNote. Każdy użytkownik może je zainstalować na 5 komputerach PC lub Mac, 5 tabletach i 5 telefonach.',
    ),
    h2('Business Premium — bezpieczeństwo'),
    p(
      'Plan dla firm do 300 użytkowników. Do aplikacji ze Standard dokłada ochronę przed phishingiem, ransomware i utratą danych oraz zarządzanie urządzeniami firmowymi z Windows, macOS, iOS i Androidem. Przydaje się, gdy laptopy wychodzą poza biuro albo w firmie są dane klientów.',
    ),
    h2('Na co uważać przy wdrożeniu'),
    ul(
      ['przeniesienie starej poczty tak, żeby nie zgubić wiadomości,'],
      ['ustawienia domeny, żeby maile z firmy nie trafiały do spamu,'],
      ['logowanie dwuetapowe dla wszystkich kont,'],
      [
        'kopie danych — chmura to nie to samo co ',
        { text: 'kopia zapasowa', href: '/aktualnosci/kopia-zapasowa-3-2-1-nas' },
        '.',
      ],
    ),
    p(
      'Wdrożymy Microsoft 365: domena, przeniesienie poczty, konta i zabezpieczenia, a na co dzień pomożemy w ramach ',
      { text: 'opieki IT', href: '/opieka-it' },
      '. Zobacz też ',
      { text: 'Microsoft', href: '/marki/microsoft' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'Microsoft Learn — Microsoft 365 dla firm, przegląd',
      url: 'https://learn.microsoft.com/pl-pl/microsoft-365/admin/admin-overview/what-is-microsoft-365-for-business',
    },
    {
      name: 'Microsoft Learn — dlaczego Microsoft 365 Business Premium',
      url: 'https://learn.microsoft.com/pl-pl/microsoft-365/admin/security-and-compliance/m365bp-security-benefits',
    },
  ],
  products: ['m365-business-basic', 'm365-business-standard', 'm365-business-premium'],
  cta: {
    eyebrow: 'Microsoft 365',
    title: 'Poczta i Office dla firmy',
    text: 'Dobór planu, domena, przeniesienie poczty, konta i logowanie dwuetapowe — wdrożone i sprawdzone.',
    link: { label: 'Zobacz Microsoft', href: '/marki/microsoft' },
  },
  contact: {
    heading: 'Który plan Microsoft 365 wybrać?',
    lead: 'Napisz, ilu masz pracowników i gdzie dziś trzymasz pocztę. Doradzimy plan i przeniesiemy dane.',
  },
  seo: {
    title: 'Microsoft 365 Business — który plan',
    description:
      'Czym różnią się Microsoft 365 Business Basic, Standard i Premium: poczta 50 GB, OneDrive 1 TB, aplikacje na komputer, ochrona i zarządzanie urządzeniami.',
  },
}

export const ESET_PROTECT: BiznesGuidePost = {
  slug: 'eset-protect-antywirus-w-firmie',
  title: 'Antywirus w firmie — ESET PROTECT Entry, Advanced czy Complete',
  category: 'it-w-firmie',
  lead: 'Gdy każdy komputer ma inny antywirus, nikt nie wie, czy ochrona działa wszędzie. ESET PROTECT ma jedną konsolę dla wszystkich urządzeń i kilka poziomów ochrony. Wyjaśniamy, czym różnią się Entry, Advanced i Complete.',
  summary:
    'ESET PROTECT to ochrona komputerów i serwerów zarządzana z jednej konsoli w chmurze albo na serwerze w firmie. Entry chroni stacje robocze i serwery plików, Advanced dokłada m.in. szyfrowanie dysków i analizę podejrzanych plików w chmurze, a Complete także ochronę poczty i aplikacji chmurowych, np. Microsoft 365.',
  content: [
    h2('Jedna konsola dla wszystkich komputerów'),
    p(
      'W konsoli ESET PROTECT widać każdy komputer i serwer: czy ochrona jest włączona, aktualna i czy coś wykryła. Zarządza się nią z chmury albo z serwera w firmie — bez chodzenia od biurka do biurka.',
    ),
    h2('Entry — podstawa'),
    p(
      'Ochrona stacji roboczych i serwerów plików przed złośliwym oprogramowaniem i phishingiem, z zarządzaniem z konsoli.',
    ),
    h2('Advanced — więcej ochrony'),
    p(
      'Dokłada m.in. szyfrowanie dysków — przy kradzieży laptopa dane zostają zabezpieczone — i analizę podejrzanych plików w chmurowej piaskownicy, która pomaga zatrzymać ransomware i nowe zagrożenia.',
    ),
    h2('Complete — poczta i chmura'),
    p(
      'Do tego ochrona serwera poczty i aplikacji chmurowych, np. Microsoft 365 i OneDrive, oraz zarządzanie podatnościami i poprawkami.',
    ),
    h2('Antywirus to nie wszystko'),
    ul(
      [
        'aktualny system — o tym w poradniku ',
        {
          text: 'o końcu wsparcia Windows 10',
          href: '/aktualnosci/windows-10-koniec-wsparcia-firma',
        },
        ',',
      ],
      [
        'kopia danych poza komputerem — zobacz ',
        { text: 'zasadę 3-2-1', href: '/aktualnosci/kopia-zapasowa-3-2-1-nas' },
        ',',
      ],
      ['logowanie dwuetapowe do poczty i banku,'],
      ['pracownicy, którzy wiedzą, jak rozpoznać podejrzany mail.'],
    ),
    p(
      'Dobierzemy poziom ESET PROTECT i zainstalujemy ochronę na komputerach i serwerach, a w ramach ',
      { text: 'opieki IT', href: '/opieka-it' },
      ' możemy pilnować konsoli. Zobacz ',
      { text: 'ESET', href: '/marki/eset' },
      '.',
    ),
  ],
  verifiedAt: VERIFIED,
  sources: [
    {
      name: 'ESET — platforma ESET PROTECT',
      url: 'https://www.eset.com/pl/business/protect-platform/',
    },
    {
      name: 'ESET — ESET PROTECT Entry',
      url: 'https://www.eset.com/pl/business/entry-protection/',
    },
    {
      name: 'ESET — poziomy ochrony ESET PROTECT (KB3104)',
      url: 'https://support.eset.com/en/kb3104-eset-business-bundles-and-packsfaq',
    },
  ],
  products: ['eset-protect', 'eset-pakiet-entry', 'eset-pakiet-advanced', 'eset-pakiet-complete'],
  cta: {
    eyebrow: 'ESET',
    title: 'Ochrona komputerów z jednej konsoli',
    text: 'Dobór poziomu ESET PROTECT, instalacja na komputerach i serwerach, konsola w chmurze i sprawdzenie, że ochrona działa wszędzie.',
    link: { label: 'Zobacz ESET', href: '/marki/eset' },
  },
  contact: {
    heading: 'Ile komputerów chcesz chronić?',
    lead: 'Napisz, ile masz komputerów i serwerów i czy używasz Microsoft 365. Doradzimy poziom ESET PROTECT.',
  },
  seo: {
    title: 'ESET PROTECT — który poziom dla firmy',
    description:
      'Czym różnią się ESET PROTECT Entry, Advanced i Complete: konsola w chmurze, szyfrowanie dysków, piaskownica w chmurze, ochrona poczty i Microsoft 365.',
  },
}
