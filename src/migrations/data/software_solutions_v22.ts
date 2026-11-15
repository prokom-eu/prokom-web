/**
 * Frozen v22 values of the Software solutions for the migration `software_solutions_v22`
 * (ADR-014 v22 pkt 12), by slug — a copy of `seed/prokomsoftware/rozwiazania.json` (SWR1,
 * 30.10.2026). Never import the seed here: the migration must give the same result after the
 * seed changes. Grammar of the terms („od 2 tygodni”) cannot be derived from the old values.
 */
export type V22Solution = {
  leadTime: string | null
  thumbnail: string
  example: string
  included: string[]
  moreExamples: string[]
  benefits: string[]
  needs: string[]
  related: string[]
  levels: {
    name: string
    shortName: string | null
    price: number
    term: string | null
    recommended: boolean
    description: string
  }[]
  levelRows: { label: string; cells: string[] }[]
  faq: { q: string; a: string }[]
}

export const SOLUTIONS_V22: Record<string, V22Solution> = {
  'strona-firmowa-z-panelem': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/strona-firmowa-z-panelem.svg',
    example:
      'Firma remontowa pokazuje realizacje ze zdjęciami i opisem. Klient wypełnia formularz, a zapytanie od razu trafia na skrzynkę szefa. Nową realizację dodajesz sam w panelu, bez dzwonienia do informatyka.',
    included: [
      'Do 5 podstron: oferta, realizacje, opinie, kontakt',
      'Panel do zmian i formularz prosto do Ciebie',
      'Gotowa pod Google i AI',
    ],
    moreExamples: ['więcej niż 5 podstron', 'aktualności i blog', 'kolejny język'],
    benefits: [],
    needs: [],
    related: [
      'opieka-nad-strona-i-systemem',
      'wyceny-i-oferty-z-pdf',
      'crm-dla-malej-i-sredniej-firmy',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'strona-dla-hotelu-lub-pensjonatu': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/strona-dla-hotelu-lub-pensjonatu.svg',
    example:
      'Gość z Niemiec trafia na stronę po niemiecku, ogląda pokoje i wysyła zapytanie o termin. Wiadomość przychodzi prosto do Ciebie, bez prowizji portalu. Ceny i zdjęcia zmieniasz sam w panelu.',
    included: [
      'Pokoje, galeria i okolica: PL · EN · DE',
      'Zapytanie o termin prosto do Ciebie',
      'Panel: ceny i zdjęcia zmieniasz sam',
    ],
    moreExamples: ['cennik sezonowy i oferty specjalne', 'atrakcje w okolicy', 'opinie gości'],
    benefits: [],
    needs: [],
    related: [
      'aplikacja-do-rezerwacji-dla-gosci',
      'powiadomienia-sms-i-e-mail',
      'opieka-nad-strona-i-systemem',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'strona-dla-restauracji-lub-baru': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/strona-dla-restauracji-lub-baru.svg',
    example:
      'Bar zmienia menu dnia w panelu w kilka minut. Gość sprawdza godziny w sezonie, klika „dojazd” i wysyła formularz rezerwacji stolika, a zgłoszenie przychodzi prosto do Ciebie.',
    included: [
      'Menu w panelu, godziny i mapa',
      'Formularz rezerwacji stolika',
      'Telefon i dojazd jednym kliknięciem',
    ],
    moreExamples: ['menu w dwóch językach', 'podstrona imprez okolicznościowych z zapytaniem'],
    benefits: [],
    needs: [],
    related: [
      'powiadomienia-sms-i-e-mail',
      'opieka-nad-strona-i-systemem',
      'strona-firmowa-z-panelem',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'strona-wizytowka': {
    leadTime: 'od 1 tygodnia',
    thumbnail: '/software/rozwiazania/strona-wizytowka.svg',
    example:
      'Hydraulik chce, żeby klient z Google od razu do niego zadzwonił. Jedna strona: usługi, obszar działania, mapa i duży przycisk „Zadzwoń”.',
    included: [
      'Jedna strona: oferta, telefon, mapa i formularz',
      'Wygodna na telefonie',
      'Gotowa pod Google',
    ],
    moreExamples: [
      'galeria i opinie klientów',
      'więcej sekcji',
      'Profil Firmy w Google ustawiony razem ze stroną',
    ],
    benefits: [],
    needs: [],
    related: ['opieka-nad-strona-i-systemem', 'landing-page', 'strona-firmowa-z-panelem'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'przebudowa-starej-strony': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/przebudowa-starej-strony.svg',
    example:
      'Stara strona ładuje się długo i źle działa na telefonie. Budujemy nową, a stare adresy przekierowujemy, żeby klienci z Google trafiali we właściwe miejsce. Starą wyłączamy dopiero po odbiorze.',
    included: ['Nowa strona do 3 podstron', 'Przekierowania starych adresów', 'Panel do zmian'],
    moreExamples: [
      'więcej podstron',
      'przeniesienie wszystkich treści i zdjęć',
      'kontrola pozycji w Google po starcie',
    ],
    benefits: [],
    needs: [],
    related: [
      'audyt-strony-lub-programu',
      'opieka-nad-strona-i-systemem',
      'strona-firmowa-z-panelem',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'rozbudowana-strona-firmowa': {
    leadTime: 'od 5 tygodni',
    thumbnail: '/software/rozwiazania/rozbudowana-strona-firmowa.svg',
    example:
      'Producent z szeroką ofertą ma klientów w Polsce i za granicą. Katalog z filtrami, poradnik pod Google i kolejne języki w jednej stronie, a handlowcy dodają treści ze swoich kont.',
    included: ['Wiele podstron i blog', 'Panel z kontami dla kilku osób', 'Gotowa pod Google i AI'],
    moreExamples: ['kolejne języki', 'katalog albo strefa klienta', 'wyszukiwarka na stronie'],
    benefits: [],
    needs: [],
    related: [
      'opieka-nad-strona-i-systemem',
      'crm-dla-malej-i-sredniej-firmy',
      'asystent-ai-do-zapytan',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'landing-page': {
    leadTime: 'od 1 tygodnia',
    thumbnail: '/software/rozwiazania/landing-page.svg',
    example:
      'Firma montująca pompy ciepła startuje z reklamą przed sezonem. Landing ma jeden cel: zapytanie o wycenę, a formularz i telefon są pod ręką w każdym miejscu strony.',
    included: [
      'Jedna strona pod jedną usługę',
      'Formularz i telefon w każdym miejscu',
      'Gotowa pod kampanię',
    ],
    moreExamples: ['sekcje FAQ i opinii', 'pomiar zgłoszeń z kampanii', 'test dwóch nagłówków'],
    benefits: [],
    needs: [],
    related: ['strona-wizytowka', 'opieka-nad-strona-i-systemem', 'crm-dla-malej-i-sredniej-firmy'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'sklep-internetowy': {
    leadTime: 'od 5 tygodni',
    thumbnail: '/software/rozwiazania/sklep-internetowy.svg',
    example:
      'Lokalny producent sprzedaje online: klient płaci BLIK-iem i wybiera odbiór w sklepie albo dostawę. Zamówienie widzisz od razu w panelu.',
    included: [
      'Produkty, płatności online i BLIK',
      'Dostawa i odbiór osobisty',
      'Zamówienia od razu w panelu',
    ],
    moreExamples: ['faktury automatycznie', 'połączenie z magazynem'],
    benefits: [],
    needs: [],
    related: ['magazyn-i-zamowienia', 'faktury-bez-przepisywania', 'opieka-nad-strona-i-systemem'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'system-zlecen-i-grafik-ekip': {
    leadTime: 'od 3 tygodni',
    thumbnail: '/software/rozwiazania/system-zlecen-i-grafik-ekip.svg',
    example:
      'Biuro widzi w kalendarzu, która ekipa jest gdzie i z jakim materiałem. Monter dodaje zdjęcia i protokół przy zleceniu, a klient sprawdza status pod linkiem. Nikt nie dzwoni do szefa o 21:00.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: [
      'aplikacja-dla-ekip-w-terenie',
      'czas-pracy-i-rozliczenia',
      'powiadomienia-sms-i-e-mail',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'crm-dla-malej-i-sredniej-firmy': {
    leadTime: 'od 3 tygodni',
    thumbnail: '/software/rozwiazania/crm-dla-malej-i-sredniej-firmy.svg',
    example:
      'Zapytanie z formularza trafia do CRM, a system przypomina, kiedy zadzwonić z ofertą. Widzisz całą historię klienta i to, skąd przychodzą nowi.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: ['wyceny-i-oferty-z-pdf', 'powiadomienia-sms-i-e-mail', 'raporty-dla-szefa'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'czas-pracy-i-rozliczenia': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/czas-pracy-i-rozliczenia.svg',
    example:
      'Pracownik klika „start” w telefonie, gdy zaczyna pracę, i „stop”, gdy kończy. Na koniec miesiąca rozliczenie godzin jest gotowe dla księgowej.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: ['system-zlecen-i-grafik-ekip', 'faktury-bez-przepisywania', 'raporty-dla-szefa'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'system-serwisu-i-zgloszen': {
    leadTime: 'od 3 tygodni',
    thumbnail: '/software/rozwiazania/system-serwisu-i-zgloszen.svg',
    example:
      'Klient oddaje laptop do serwisu i dostaje numer zgłoszenia. Status sprawdza sam, a gdy naprawa jest gotowa, dostaje e-mail. Tak działa nasz prokomserwis.pl.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: [
      'powiadomienia-sms-i-e-mail',
      'panel-klienta-i-portal-b2b',
      'faktury-bez-przepisywania',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'z-excela-do-systemu': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/z-excela-do-systemu.svg',
    example:
      'Zlecenia żyją w kilku arkuszach, które ktoś ciągle nadpisuje. Przenosimy dane do jednego panelu, usuwamy duplikaty i ustawiamy, kto co widzi.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: ['raporty-dla-szefa', 'polaczenie-programow', 'opieka-nad-strona-i-systemem'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'magazyn-i-zamowienia': {
    leadTime: 'od 3 tygodni',
    thumbnail: '/software/rozwiazania/magazyn-i-zamowienia.svg',
    example:
      'Magazynier skanuje kod przy wydaniu na zlecenie. Gdy towaru zostaje mniej niż minimum, system przypomina o zamówieniu do hurtowni.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: ['sklep-internetowy', 'faktury-bez-przepisywania', 'polaczenie-programow'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'wyceny-i-oferty-z-pdf': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/wyceny-i-oferty-z-pdf.svg',
    example:
      'Handlowiec wybiera pozycje z cennika i w kilka minut wysyła ofertę w PDF z logo. Widzi, kiedy klient ją otworzył, więc dzwoni we właściwym momencie.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: [
      'crm-dla-malej-i-sredniej-firmy',
      'faktury-bez-przepisywania',
      'system-zlecen-i-grafik-ekip',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'panel-klienta-i-portal-b2b': {
    leadTime: 'od 3 tygodni',
    thumbnail: '/software/rozwiazania/panel-klienta-i-portal-b2b.svg',
    example:
      'Stały klient loguje się do panelu, pobiera fakturę i zamawia ponownie, bez dzwonienia do biura.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: [
      'system-serwisu-i-zgloszen',
      'faktury-bez-przepisywania',
      'opieka-nad-strona-i-systemem',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'grafik-i-rezerwacje-zajec': {
    leadTime: 'od 3 tygodni',
    thumbnail: '/software/rozwiazania/grafik-i-rezerwacje-zajec.svg',
    example:
      'Szkoła narciarska układa grafik instruktorów na sezon. Rodzic zapisuje dziecko przez internet, a instruktor sprawdza listę obecności w telefonie.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: [
      'aplikacja-do-rezerwacji-dla-gosci',
      'powiadomienia-sms-i-e-mail',
      'czas-pracy-i-rozliczenia',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'kalendarz-sal-i-imprez': {
    leadTime: 'od 2 tygodni',
    thumbnail: '/software/rozwiazania/kalendarz-sal-i-imprez.svg',
    example:
      'Dom weselny widzi terminy wszystkich sal w jednym kalendarzu. Przy rezerwacji zapisujesz zaliczkę i umowę, a przed imprezą system pokazuje listę zadań.',
    included: [
      'Jeden moduł na gotowym fundamencie',
      'Do 5 użytkowników',
      'Dostęp z komputera i telefonu',
    ],
    moreExamples: [
      'kolejne moduły',
      'więcej użytkowników i ról',
      'import danych z Excela',
      'połączenia z innymi programami',
    ],
    benefits: [],
    needs: [],
    related: [
      'strona-dla-restauracji-lub-baru',
      'powiadomienia-sms-i-e-mail',
      'faktury-bez-przepisywania',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'aplikacja-dla-ekip-w-terenie': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/aplikacja-dla-ekip-w-terenie.svg',
    example:
      'Monter w piwnicy bez zasięgu robi zdjęcia, odhacza zadania i zbiera podpis klienta. Aplikacja wysyła wszystko do biura, gdy wróci sieć.',
    included: [],
    moreExamples: [],
    benefits: [],
    needs: [],
    related: [
      'system-zlecen-i-grafik-ekip',
      'czas-pracy-i-rozliczenia',
      'powiadomienia-sms-i-e-mail',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'aplikacja-do-rezerwacji-dla-gosci': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/aplikacja-do-rezerwacji-dla-gosci.svg',
    example:
      'Gość rezerwuje pobyt w aplikacji z Twoim logo i dostaje przypomnienie przed przyjazdem. Zakres i cenę ustalamy po krótkiej rozmowie.',
    included: [],
    moreExamples: [],
    benefits: [],
    needs: [],
    related: [
      'strona-dla-hotelu-lub-pensjonatu',
      'grafik-i-rezerwacje-zajec',
      'powiadomienia-sms-i-e-mail',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'aplikacja-do-programu-ktory-masz': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/aplikacja-do-programu-ktory-masz.svg',
    example:
      'Program do zleceń działa tylko na komputerze. Dorabiamy aplikację, która pokazuje ekipie w terenie tylko to, czego potrzebuje, na danych z tego programu.',
    included: [],
    moreExamples: [],
    benefits: [],
    needs: [],
    related: ['polaczenie-programow', 'raporty-dla-szefa', 'opieka-nad-strona-i-systemem'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'powiadomienia-sms-i-e-mail': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/powiadomienia-sms-i-e-mail.svg',
    example:
      'Dzień przed wizytą klient dostaje SMS z godziną, a po naprawie „gotowe do odbioru”. Wysyłka idzie sama z Twojego systemu.',
    included: [],
    moreExamples: [],
    benefits: [
      'Działa z programami, które już masz',
      'Koszty SMS według zużycia widzisz w wycenie, zanim cokolwiek uruchomimy',
    ],
    needs: [],
    related: [
      'system-serwisu-i-zgloszen',
      'system-zlecen-i-grafik-ekip',
      'aplikacja-do-rezerwacji-dla-gosci',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'faktury-bez-przepisywania': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/faktury-bez-przepisywania.svg',
    example:
      'Gdy zlecenie dostaje status „zakończone”, pozycje same trafiają do programu do faktur. Nikt ich nie przepisuje.',
    included: [],
    moreExamples: [],
    benefits: [],
    needs: [],
    related: ['wyceny-i-oferty-z-pdf', 'system-zlecen-i-grafik-ekip', 'magazyn-i-zamowienia'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'asystent-ai-do-zapytan': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/asystent-ai-do-zapytan.svg',
    example:
      'Gość pisze po niemiecku z pytaniem o wolny pokój. Asystent proponuje odpowiedź na podstawie Twojej oferty, a Ty ją sprawdzasz i klikasz „wyślij”.',
    included: [],
    moreExamples: [],
    benefits: [
      'Działa z programami, które już masz',
      'Koszty usług AI według zużycia widzisz w wycenie, zanim cokolwiek uruchomimy',
    ],
    needs: [],
    related: [
      'strona-dla-hotelu-lub-pensjonatu',
      'crm-dla-malej-i-sredniej-firmy',
      'powiadomienia-sms-i-e-mail',
    ],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'raporty-dla-szefa': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/raporty-dla-szefa.svg',
    example:
      'W poniedziałek rano na telefon przychodzi raport: przychód z tygodnia, zlecenia i to, co się opóźnia. Bez dzwonienia po kierownikach.',
    included: [],
    moreExamples: [],
    benefits: [],
    needs: [],
    related: ['crm-dla-malej-i-sredniej-firmy', 'czas-pracy-i-rozliczenia', 'polaczenie-programow'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'polaczenie-programow': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/polaczenie-programow.svg',
    example:
      'Zamówienie ze sklepu samo trafia do CRM i do programu do faktur. Programy zostają, a dane wpisujesz tylko raz.',
    included: [],
    moreExamples: [],
    benefits: [],
    needs: [],
    related: ['faktury-bez-przepisywania', 'aplikacja-do-programu-ktory-masz', 'raporty-dla-szefa'],
    levels: [],
    levelRows: [],
    faq: [],
  },
  'opieka-nad-strona-i-systemem': {
    leadTime: null,
    thumbnail: '/software/rozwiazania/opieka-nad-strona-i-systemem.svg',
    example:
      'Co noc robimy kopię strony i systemu, a monitoring sprawdza, czy wszystko działa. Gdy coś się dzieje, reagujemy w czasie zapisanym w umowie.',
    included: [],
    moreExamples: [],
    benefits: [
      'Serwer w Polsce i domena',
      'Eksport danych na każde żądanie',
      'Czas reakcji zapisany w umowie',
    ],
    needs: [],
    related: [
      'audyt-strony-lub-programu',
      'przejecie-po-innym-wykonawcy',
      'strona-firmowa-z-panelem',
    ],
    levels: [
      {
        name: 'Podstawowa',
        shortName: null,
        price: 149,
        term: 'do końca następnego dnia roboczego',
        recommended: false,
        description:
          'Serwer w Polsce i domena, kopia co noc, aktualizacje, eksport danych na żądanie.',
      },
      {
        name: 'Rozszerzona',
        shortName: null,
        price: 299,
        term: '8 h roboczych',
        recommended: true,
        description:
          'Dochodzi monitoring 24/7, drobne zmiany do 1 h w miesiącu i raport co miesiąc.',
      },
      {
        name: 'Systemy',
        shortName: null,
        price: 790,
        term: '4 h roboczych, na piśmie',
        recommended: false,
        description: 'Dochodzi automatyczny eksport danych co miesiąc i rozwój do 4 h w miesiącu.',
      },
    ],
    levelRows: [
      {
        label: 'Serwer w Polsce i domena',
        cells: ['tak', 'tak', 'tak'],
      },
      {
        label: 'Kopia co noc i aktualizacje',
        cells: ['tak', 'tak', 'tak'],
      },
      {
        label: 'Eksport danych na żądanie',
        cells: ['tak', 'tak', 'tak'],
      },
      {
        label: 'Monitoring 24/7',
        cells: ['nie', 'dochodzi', 'tak'],
      },
      {
        label: 'Drobne zmiany do 1 h w miesiącu',
        cells: ['nie', 'dochodzi', 'tak'],
      },
      {
        label: 'Raport co miesiąc',
        cells: ['nie', 'dochodzi', 'tak'],
      },
      {
        label: 'Eksport danych co miesiąc, sam',
        cells: ['nie', 'nie', 'dochodzi'],
      },
      {
        label: 'Rozwój do 4 h w miesiącu',
        cells: ['nie', 'nie', 'dochodzi'],
      },
      {
        label: 'Czas reakcji',
        cells: ['do końca nast. dnia roboczego', '8 h roboczych', '4 h roboczych, na piśmie'],
      },
    ],
    faq: [
      {
        q: 'Czy opieka jest obowiązkowa?',
        a: 'Nie. Bez opieki płacisz tylko za serwer i domenę, a zmiany zlecasz, kiedy potrzebujesz.',
      },
      {
        q: 'Czym różni się opieka Rozszerzona?',
        a: 'Dochodzi monitoring 24/7, drobne zmiany do 1 h w miesiącu, raport co miesiąc i reakcja w 8 h roboczych.',
      },
      {
        q: 'Czyje są dane?',
        a: 'Twoje. Eksport na każde żądanie; w poziomie Systemy automatycznie co miesiąc.',
      },
    ],
  },
  'przejecie-po-innym-wykonawcy': {
    leadTime: 'od 2 dni',
    thumbnail: '/software/rozwiazania/przejecie-po-innym-wykonawcy.svg',
    example:
      'Poprzedni informatyk nie odbiera telefonu, a nikt w firmie nie zna haseł do serwera. Odzyskujemy dostępy, robimy kopię i zapisujemy wszystko na Twoją firmę.',
    included: [
      'Odzyskanie dostępów do serwera, domeny i panelu',
      'Kopia zapasowa i zabezpieczenie',
      'Dostępy zapisane na Twoją firmę',
    ],
    moreExamples: ['dokumentacja', 'przeniesienie na nasz serwer'],
    benefits: [
      'Pomagamy, nawet jeśli nie masz żadnych haseł',
      'Rozmowa jeszcze dziś albo jutro',
      'Wszystko zapisane na Twoją firmę',
      'Potem opieka od 149 zł / mies., jeśli chcesz',
    ],
    needs: [],
    related: [
      'opieka-nad-strona-i-systemem',
      'audyt-strony-lub-programu',
      'przebudowa-starej-strony',
    ],
    levels: [],
    levelRows: [],
    faq: [
      {
        q: 'Ile to trwa?',
        a: 'Dostępy odzyskujemy zwykle w 2–3 dni robocze, zabezpieczenie robimy zaraz potem.',
      },
      {
        q: 'Ile płacę?',
        a: 'Od 990 zł netto jednorazowo za odzyskanie dostępów, kopię i zabezpieczenie. Dokumentację i przeniesienie na nasz serwer wyceniamy po sprawdzeniu. Potem możesz przejść do opieki od 149 zł / mies., ale nie musisz.',
      },
      {
        q: 'Czyje będą dostępy?',
        a: 'Twoje. Wszystko zapisujemy na Twoją firmę i przekazujemy razem z listą dostępów.',
      },
    ],
  },
  'audyt-strony-lub-programu': {
    leadTime: '2 dni robocze',
    thumbnail: '/software/rozwiazania/audyt-strony-lub-programu.svg',
    example:
      'Zanim zamówisz nową stronę, sprawdzamy obecną: szybkość, Google, bezpieczeństwo. Czasem wystarczy poprawić kilka rzeczy i to też powiemy.',
    included: [],
    moreExamples: [],
    benefits: [
      'Zgłoszenie bez logowania i zobowiązań',
      'Raport jest Twój: możesz go dać komukolwiek',
      'Omówienie raportu przez telefon, jeśli chcesz',
      'Pełny audyt odliczamy od projektu w ciągu 60 dni',
    ],
    needs: ['Adres strony lub programu', 'Telefon albo e-mail do raportu'],
    related: [
      'przebudowa-starej-strony',
      'opieka-nad-strona-i-systemem',
      'przejecie-po-innym-wykonawcy',
    ],
    levels: [
      {
        name: 'Szybki',
        shortName: null,
        price: 0,
        term: '2 dni robocze',
        recommended: false,
        description: 'Szybkość, Google, bezpieczeństwo — to, co widać z zewnątrz.',
      },
      {
        name: 'Pełny',
        shortName: null,
        price: 990,
        term: '1 tydzień',
        recommended: true,
        description: 'Też panel i serwer. Raport z planem naprawy i wyceną.',
      },
      {
        name: 'Strona + program albo dostępność',
        shortName: 'Strona + program / dostępność',
        price: 1990,
        term: '2 tygodnie',
        recommended: false,
        description: 'Strona razem z programem firmy albo audyt dostępności (EAA).',
      },
    ],
    levelRows: [
      {
        label: 'Szybkość, Google, bezpieczeństwo',
        cells: ['tak', 'tak', 'tak'],
      },
      {
        label: 'Raport na piśmie',
        cells: ['tak', 'tak', 'tak'],
      },
      {
        label: 'Panel i serwer',
        cells: ['nie', 'dochodzi', 'tak'],
      },
      {
        label: 'Plan naprawy z wyceną',
        cells: ['nie', 'dochodzi', 'tak'],
      },
      {
        label: 'Program firmy albo dostępność (EAA)',
        cells: ['nie', 'nie', 'dochodzi'],
      },
      {
        label: 'Wynik',
        cells: ['2 dni robocze', '1 tydzień', '2 tygodnie'],
      },
    ],
    faq: [
      {
        q: 'Czym różni się pełny audyt?',
        a: 'Szybki sprawdza to, co widać z zewnątrz. Pełny (990 zł netto) zagląda też do panelu i serwera i kończy się planem naprawy z wyceną.',
      },
      {
        q: 'Czy pełny audyt przepada?',
        a: 'Nie. Jeśli w ciągu 60 dni zamówisz u nas projekt, odliczamy te 990 zł.',
      },
      {
        q: 'Czy muszę coś kupić?',
        a: 'Nie. Raport jest Twój, możesz go dać komukolwiek.',
      },
    ],
  },
}
