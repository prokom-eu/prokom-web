import type { Feature, SectionHead } from './anteny'

/**
 * Fixed texts of the Kontrola dostępu page (ADR-I002 §1): the sections that are not in
 * `InstServices` and the widgets. Transcribed from `zrodlo/pages/Dostep.js` + `Dostep.body.html`
 * (v4.2) the way `cleanPrototype` cleans a snapshot: without UI keys and without the source list
 * (`src`) — spec §2: no source lists on the site. Edited by hand from now on.
 */

export type AccessTab = 'apt' | 'fir' | 'wsp'
/** A bar of the week schedule: from day + hour to day + hour, label, state. */
export type ScheduleBar = {
  from: [day: number, hour: number]
  to: [day: number, hour: number]
  label: string
  state: '' | 'cur' | 'off'
}

export const dostep = {
  /** Keypad lock with the code schedule in the hero (`kd`). */
  lock: {
    label: 'Interaktywny zamek z kodem i harmonogram kodów',
    tabsLabel: 'Rodzaj obiektu',
    keysLabel: { clear: 'Wyczyść', ok: 'Zatwierdź', digit: 'Cyfra' },
    hint: 'Wpisz kod gościa:',
    guestCode: '2468',
    expiredCode: '1357',
    empty: '— — — —',
    status: {
      ok: 'Otwarte · witamy!',
      expired: 'Kod wygasł',
      bad: 'Błędny kod',
      typed: 'Naciśnij OK',
      idle: 'Wpisz kod',
    },
    messages: {
      ok: 'kod poprawny, drzwi otwarte',
      expired: 'kod wygasł po wymeldowaniu',
      bad: 'błędny kod',
    },
    now: 'Teraz',
    days: ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'],
    tabs: {
      apt: {
        name: 'Apartamenty',
        icon: 'bed',
        door: 'APARTAMENT 4',
        badge: 'Integracja z rezerwacjami',
        calTitle: 'Kody gości · ten tydzień',
        calSub: 'kod działa od zameldowania do wymeldowania',
        rows: [
          {
            name: 'Ap. 4',
            bars: [
              { from: [0, 15], to: [2, 11], label: 'Kowalska · wygasł', state: 'off' },
              { from: [4, 15], to: [6, 11], label: 'Nowak · 2468', state: 'cur' },
            ],
          },
          {
            name: 'Ap. 2',
            bars: [{ from: [1, 15], to: [5, 11], label: 'Müller · 7310', state: '' }],
          },
          {
            name: 'Sprzątanie',
            bars: [
              { from: [2, 11], to: [2, 14], label: '11–14', state: '' },
              { from: [6, 11], to: [6, 14], label: '11–14', state: '' },
            ],
          },
        ],
        log: [
          { when: 'Pt 15:42', text: 'Nowak · Ap. 4 · kod gościa', icon: 'key' },
          { when: 'Pt 12:05', text: 'Sprzątanie · Ap. 4', icon: 'key' },
          { when: 'Śr 10:51', text: 'Kowalska · kod wygasł', icon: 'clock' },
        ],
      },
      fir: {
        name: 'Firma',
        icon: 'office',
        door: 'MAGAZYN',
        badge: 'Karty, strefy, harmonogram',
        calTitle: 'Uprawnienia · ten tydzień',
        calSub: 'karta działa w wybranych strefach i godzinach',
        rows: [
          {
            name: 'Magazyn',
            bars: [0, 1, 2, 3, 4].map((d) => ({
              from: [d, 6],
              to: [d, 15],
              label: '6–15',
              state: 'cur',
            })),
          },
          {
            name: 'Biuro',
            bars: [{ from: [0, 7], to: [4, 17], label: 'pn–pt 7–17 · wszyscy', state: '' }],
          },
          {
            name: 'Serwis',
            bars: [{ from: [2, 9], to: [2, 13], label: 'jednorazowo', state: '' }],
          },
        ],
        log: [
          { when: '07:52', text: 'Jan K. · Magazyn · karta', icon: 'card' },
          { when: '07:31', text: 'Anna W. · Biuro · karta', icon: 'card' },
          { when: 'Wt 22:14', text: 'Karta #31 · poza godzinami', icon: 'x' },
        ],
      },
      wsp: {
        name: 'Wspólnota',
        icon: 'users',
        door: 'KLATKA B',
        badge: 'Brama, furtka, klatki',
        calTitle: 'Dostęp · ten tydzień',
        calSub: 'breloki mieszkańców, kody dla kurierów',
        rows: [
          {
            name: 'Mieszkańcy',
            bars: [{ from: [0, 0], to: [6, 24], label: 'cały tydzień · breloki', state: 'cur' }],
          },
          {
            name: 'Kurierzy',
            bars: [
              ...[0, 1, 2, 3, 4].map((d) => ({ from: [d, 8], to: [d, 18], label: '', state: '' })),
              { from: [5, 8], to: [5, 14], label: '', state: '' },
            ],
          },
          {
            name: 'Brelok #14',
            bars: [{ from: [2, 9], to: [6, 24], label: 'zgubiony · zablokowany', state: 'off' }],
          },
        ],
        log: [
          { when: '18:20', text: 'Lokal 12 · brelok · Brama', icon: 'key' },
          { when: '14:03', text: 'Kurier · kod dzienny · Klatka B', icon: 'key' },
          { when: 'Śr 09:12', text: 'Brelok #14 zablokowany', icon: 'x' },
        ],
      },
    } as Record<
      AccessTab,
      {
        name: string
        icon: string
        door: string
        badge: string
        calTitle: string
        calSub: string
        rows: { name: string; bars: ScheduleBar[] }[]
        log: { when: string; text: string; icon: string }[]
      }
    >,
  },

  methods: {
    head: {
      eyebrow: 'Czym się otwiera',
      heading: 'Kod, karta, telefon. Klucz zostaje na wszelki wypadek.',
      lead: 'Dobieramy sposób otwierania do ludzi, którzy będą wchodzić: gości, pracowników, mieszkańców, serwisu.',
    } satisfies SectionHead,
    items: [
      {
        icon: 'grid',
        title: 'Kod PIN',
        text: 'Stały dla domowników, czasowy dla gości i serwisu. Wygasa sam.',
        tag: 'Apartamenty, pensjonaty',
      },
      {
        icon: 'card',
        title: 'Karta lub brelok',
        text: 'Najwygodniejsze dla pracowników i mieszkańców. W systemach online zgubioną blokujesz zdalnie.',
        tag: 'Firmy, wspólnoty, hotele',
      },
      {
        icon: 'phone',
        title: 'Telefon',
        text: 'Otwieranie z aplikacji, także zdalnie dla gościa, który utknął przy drzwiach.',
        tag: 'Domy, apartamenty',
      },
      {
        icon: 'key',
        title: 'Klucz awaryjny',
        text: 'Mechaniczne otwarcie albo zasilanie awaryjne, gdy wyczerpie się bateria.',
        tag: 'Każde drzwi',
      },
    ],
  },

  apartments: {
    head: {
      eyebrow: 'Apartamenty i pensjonaty',
      heading: 'Rezerwacja wpada, kod wysyła się sam.',
      lead: 'Zamek połączony z systemem rezerwacji tworzy kod ważny tylko w czasie pobytu i wysyła go gościowi. Ty nie jedziesz o 22:00 przekazać klucza.',
    } satisfies SectionHead,
    flow: [
      {
        icon: 'cal',
        title: 'Rezerwacja',
        text: 'Gość rezerwuje przez Booking, Airbnb albo Twoją stronę.',
      },
      {
        icon: 'cpu',
        title: 'System rezerwacji',
        text: 'Tworzy kod ważny od zameldowania do wymeldowania.',
      },
      {
        icon: 'send',
        title: 'Wiadomość do gościa',
        text: 'Kod przychodzi mailem lub SMS-em przed przyjazdem.',
      },
      {
        icon: 'lock',
        title: 'Przyjazd i wyjazd',
        text: 'Gość wchodzi sam, a po wymeldowaniu kod przestaje działać.',
      },
    ] satisfies Feature[],
    columns: ['System rezerwacji', 'Zamki, które obsługuje', 'Uwagi'],
    systems: [
      {
        name: 'Smoobu',
        locks: 'Nuki, TTLock, Yale, Salto KS, igloohome, Tedee i inne',
        note: 'Funkcja w planie Pro, 4 € miesięcznie za zamek. Nuki wymaga też abonamentu Smart Hosting.',
      },
      {
        name: 'Beds24',
        locks: '31 integracji, m.in. Nuki, TTLock, Salto, Yale, Igloohome',
        note: 'Lista w dokumentacji Beds24.',
      },
      {
        name: 'Hotres',
        locks: 'Moduł zamków hotelowych z kodem wysyłanym mailem lub SMS-em',
        note: 'Partnerów sprawdzamy przy wycenie.',
      },
      {
        name: 'Hotel na karty',
        locks: 'Zamki hotelowe RFID, np. dormakaba',
        note: 'Karty kodowane w recepcji, integracja z systemem hotelowym.',
      },
    ],
    note: 'Przed zakupem zamka sprawdzamy integrację z Twoim systemem.',
  },

  company: {
    eyebrow: 'Firma, hala, wspólnota',
    heading: 'Każdy wchodzi tam, gdzie powinien. I o tej porze.',
    lead: 'Karty albo breloki dla pracowników i mieszkańców, strefy, harmonogramy i historia wejść. W systemach online zgubioną kartę blokujesz od razu, bez wymiany zamków.',
    list: [
      {
        title: 'Strefy',
        text: 'Biuro, magazyn, serwerownia, zaplecze. Każda grupa osób ma swoje.',
      },
      {
        title: 'Harmonogramy',
        text: 'Karta działa w godzinach pracy, serwis tylko w dniu wizyty.',
      },
      {
        title: 'Historia wejść',
        text: 'Kto, którędy i kiedy. Przydaje się przy incydentach i kontroli dostępu do stref.',
      },
      {
        title: 'Brama i szlaban',
        text: 'Wjazd na plac i parking na pilota, kartę albo odczyt tablic.',
      },
    ],
    register:
      'Rejestr wejść pracowników może być uznany za „inną formę monitorowania” (art. 22³ § 4 Kp), dlatego stosujemy te same zasady informowania co przy kamerach.',
    biometrics:
      'Odcisk palca pracownika można przetwarzać tylko z jego inicjatywy albo do dostępu do szczególnie ważnych informacji lub pomieszczeń (art. 22¹ᵃ § 3 i 22¹ᵇ Kp). Według stanowiska UODO rejestracja czasu pracy na podstawie biometrii nie jest zgodna z RODO. Dlatego w firmach proponujemy karty i breloki.',
    battery:
      'Zamki mają zasilanie bateryjne lub awaryjne i ostrzegają o słabej baterii. Przy każdych drzwiach planujemy też awaryjne otwarcie.',
  },

  ids: {
    head: {
      eyebrow: 'Brelok, karta, telefon, palec',
      heading: 'Nie każda karta jest bezpieczna.',
      accent: 'Sprawdź, czym się różnią.',
      lead: 'Popularny brelok 125 kHz da się skopiować w kilkanaście sekund. Wybierz identyfikator, a pokażemy, gdzie ma sens.',
    } satisfies SectionHead,
    tabsLabel: 'Identyfikatory',
    resistance: 'Odporność na skopiowanie',
    fits: 'Gdzie pasuje',
    careful: 'Na co uważać',
    items: [
      {
        name: 'Brelok 125 kHz',
        sub: 'najtańszy, popularny',
        icon: 'key',
        level: 1,
        levelText: 'Niska',
        text: 'Dane na kartach 125 kHz nie są szyfrowane. Producent ICT sklonował taką kartę w ok. 15 sekund skanerem za ok. 30 USD.',
        fits: 'Furtka, śmietnik, komórki lokatorskie',
        careful: 'Każdy może zrobić kopię. Nie do biura ani serwerowni.',
        hue: 'var(--il-false)',
      },
      {
        name: 'MIFARE Classic',
        sub: 'karta 13,56 MHz',
        icon: 'card',
        level: 2,
        levelText: 'Średnio-niska',
        text: 'Producent układów, NXP, uznał w 2015 r. zabezpieczenie Crypto1 za tylko częściowo skuteczne i odradza Classic tam, gdzie liczy się bezpieczeństwo. Zaleca przejście na MIFARE Plus lub DESFire.',
        fits: 'Istniejące systemy, mało wrażliwe drzwi',
        careful: 'Przy nowej instalacji lepiej od razu DESFire albo Plus.',
        hue: 'var(--inst-il-sgloop-line)',
      },
      {
        name: 'MIFARE DESFire / Plus',
        sub: 'szyfrowanie AES',
        icon: 'shield',
        level: 4,
        levelText: 'Wysoka',
        text: 'Karty z szyfrowaniem AES znacznie utrudniają klonowanie. W połączeniu z kodem PIN dają uwierzytelnianie dwuskładnikowe. Obsługuje je m.in. polski system Roger RACS 5.',
        fits: 'Biuro, firma, szkoła, magazyn',
        careful: 'Karta jest droższa niż brelok 125 kHz.',
        hue: 'var(--inst-scene-beam-ok)',
      },
      {
        name: 'Telefon',
        sub: 'BLE, NFC, kod QR',
        icon: 'phone',
        level: 4,
        levelText: 'Wysoka',
        text: 'Telefon jako klucz: przez Bluetooth działa z kilku metrów, więc kierowca otwiera bramę bez wysiadania z auta. Dostęp nadajesz i odbierasz zdalnie, bez zbierania kart.',
        fits: 'Brama wjazdowa, firmy, apartamenty',
        careful: 'Gość musi mieć aplikację i naładowany telefon.',
        hue: 'var(--inst-hue-blue)',
      },
      {
        name: 'Kod PIN',
        sub: 'klawiatura przy drzwiach',
        icon: 'grid',
        level: 3,
        levelText: 'Zależy od kodu',
        text: 'W apartamentach to podstawowa metoda: system rezerwacji generuje kod ważny tylko w czasie pobytu i wysyła go gościowi.',
        fits: 'Apartamenty, domy, pensjonaty',
        careful: 'Kod można podejrzeć albo przekazać dalej. Najlepiej kody czasowe.',
        hue: 'var(--inst-promo-warm)',
      },
      {
        name: 'Odcisk palca',
        sub: 'biometria',
        icon: 'finger',
        level: 4,
        levelText: 'Wysoka technicznie',
        text: 'Odcisku nie da się zgubić ani pożyczyć, ale to dane szczególnej kategorii według RODO. W firmie można go stosować tylko z inicjatywy pracownika albo do dostępu do szczególnie ważnych informacji lub pomieszczeń (art. 22¹ᵃ § 3 i 22¹ᵇ Kp).',
        fits: 'Serwerownia, archiwum, sejf',
        careful: 'Nie do ewidencji czasu pracy (stanowisko UODO).',
        hue: 'var(--inst-hue-violet)',
      },
    ],
  },

  locks: {
    head: {
      eyebrow: 'Zwora, elektrozaczep, zamek',
      heading: 'Co się dzieje z drzwiami,',
      accent: 'gdy zabraknie prądu?',
      lead: 'To pierwsze pytanie przy każdych drzwiach. Na drodze ewakuacyjnej drzwi mają się otworzyć, w magazynie raczej zostać zamknięte. Przełącz zasilanie.',
    } satisfies SectionHead,
    power: 'Zasilanie',
    on: 'Prąd jest',
    off: 'Brak prądu',
    hintOn: 'Wszystkie drzwi są zamknięte i czekają na kartę lub kod.',
    hintOff: 'Tak zachowają się drzwi przy zaniku zasilania, jeśli nie ma akumulatora rezerwowego.',
    open: 'Otwarte',
    closed: 'Zamknięte',
    where: 'Gdzie:',
    /** `failOpen`: opens without power; the rest = device and LED position in the drawing. */
    items: [
      {
        name: 'Zwora elektromagnetyczna',
        text: 'Trzyma drzwi polem magnetycznym, siła trzymania np. ok. 280 kg. Bez prądu puszcza.',
        failOpen: true,
        where:
          'Drzwi szklane. Wyjście ewakuacyjne tylko z przyciskiem awaryjnym i zwolnieniem z systemu pożarowego',
        device: { x: 112, y: 22, w: 26, h: 10 },
        led: { x: 125, y: 27 },
      },
      {
        name: 'Elektrozaczep NO (rewersyjny)',
        text: 'Pod napięciem zablokowany, po zaniku zasilania odblokowany.',
        failOpen: true,
        where: 'Klatki schodowe, drogi ewakuacyjne (po uzgodnieniu z rzeczoznawcą ppoż.)',
        device: { x: 130, y: 52, w: 8, h: 24 },
        led: { x: 134, y: 46 },
      },
      {
        name: 'Elektrozaczep zwykły (NC)',
        text: 'Odblokowuje się tylko pod napięciem. Bez prądu drzwi zostają zamknięte.',
        failOpen: false,
        where: 'Magazyn, biuro, komórki, furtka',
        device: { x: 130, y: 52, w: 8, h: 24 },
        led: { x: 134, y: 46 },
      },
      {
        name: 'Zamek silnikowy / na wkładkę',
        text: 'Rygluje silnikiem, zasilanie z baterii lub przewodu. Zawsze z awaryjnym kluczem.',
        failOpen: false,
        where: 'Dom, apartament, drzwi wejściowe',
        device: { x: 108, y: 56, w: 18, h: 18 },
        led: { x: 117, y: 52 },
      },
    ],
    fire: {
      title: 'Drzwi ewakuacyjne:',
      text: 'przepisy przeciwpożarowe zabraniają zamykania ich w sposób, który uniemożliwia natychmiastowe użycie (§ 4 ust. 1 pkt 14 rozporządzenia o ochronie ppoż.). W pomieszczeniach dla ponad 300 osób przepisy techniczno-budowlane wymagają zamknięć przeciwpanicznych (norma PN-EN 1125). Rozwiązanie dla takich drzwi uzgadniamy z rzeczoznawcą ds. zabezpieczeń ppoż.',
    },
  },

  failures: {
    eyebrow: 'Gdy coś zawiedzie',
    heading: 'Bateria, internet, prąd. Na każdy wypadek jest plan B.',
    items: [
      {
        icon: 'battery',
        title: 'Bateria w zamku',
        text: 'Zamki na wkładkę, np. Nuki czy Yale Linus, działają na bateriach i wcześniej ostrzegają w aplikacji (Nuki przy 20%). Gdy bateria się wyczerpie, Nuki otworzysz zwykłym kluczem.',
      },
      {
        icon: 'cloud',
        title: 'Brak internetu',
        text: 'Systemy takie jak Salto KS dalej działają według reguł zapisanych w zamkach. Kody PIN działają offline.',
      },
      {
        icon: 'bolt',
        title: 'Brak prądu',
        text: 'Kontrolery z akumulatorem rezerwowym działają dalej. Bez niego zwora puszcza, a elektrozaczep zwykły (NC) trzyma drzwi.',
      },
      {
        icon: 'key',
        title: 'Gość bez telefonu',
        text: 'Kod na klawiaturze albo karta z recepcji. Zawsze zostawiamy drugą drogę wejścia.',
      },
    ] satisfies Feature[],
    check: {
      eyebrow: 'Wizja lokalna',
      heading: 'Co sprawdzamy przy drzwiach, zanim podamy cenę.',
      items: [
        {
          title: 'Drzwi',
          text: 'Kierunek otwierania, materiał, samozamykacz, czy są na drodze ewakuacyjnej.',
        },
        { title: 'Wkładka', text: 'Typ, długość, funkcja awaryjna (otwarcie z kluczem w środku).' },
        {
          title: 'Ościeżnica',
          text: 'Miejsce na elektrozaczep lub zworę, przejście przewodu przez zawias.',
        },
        {
          title: 'Kable i zasilanie',
          text: 'Trasa do kontrolera, zasilacz z akumulatorem, gniazdo w pobliżu.',
        },
        { title: 'Sieć', text: 'Zasięg Wi-Fi lub Bluetooth przy drzwiach dla zamków z bramką.' },
        {
          title: 'Integracje',
          text: 'Alarm, kamery, program kadrowy, system rezerwacji (Hotres, Beds24, Smoobu, Airbnb).',
        },
      ],
    },
  },
}
