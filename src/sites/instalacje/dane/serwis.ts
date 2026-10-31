import type { ServiceKey } from '@/lib/instalacje/options'

import type { InstIconName } from '../icons'

/*
 * Texts of the service desk page `/serwis` (`zrodlo/pages/Serwis.body.html` + `Serwis.js`), 1:1
 * with the prototype except: no `[SZEF…]` / `[CENA]` notes on the page (travel rules and rates,
 * after-hours rules, how often remote checks run — open questions for the boss), no prices of
 * the care plans (spec §2: „Cena po rozmowie” as the prototype shows without prices), the
 * consent is `CONSENT_CLAUSE`, the form asks for a name (the inquiry needs it). The hero and the
 * band before the footer are edited in the panel (`instServiceDesk` block).
 */

type System = { label: string; icon: InstIconName; service: ServiceKey | null; symptoms: string[] }

export const serwis = {
  anchors: [
    { anchorId: 'plany', name: 'Opieka serwisowa' },
    { anchorId: 'przejecie', name: 'Przejęcie instalacji' },
    { anchorId: 'zdalnie', name: 'Zdalnie i na miejscu' },
    { anchorId: 'faq', name: 'Pytania' },
  ],
  form: {
    region: 'Formularz zgłoszenia awarii',
    title: 'Zgłoś awarię',
    who: ['Montowaliście u mnie', 'Inna firma'],
    systemTitle: 'Co nie działa?',
    symptomTitle: 'Co się dzieje?',
    urgencyTitle: 'Jak pilne?',
    systems: [
      {
        label: 'Kamery',
        icon: 'cam',
        service: 'kam',
        symptoms: ['Brak obrazu', 'Nie nagrywa', 'Brak podglądu w telefonie', 'Inne'],
      },
      {
        label: 'Alarm',
        icon: 'bell',
        service: 'alarm',
        symptoms: ['Fałszywe alarmy', 'Nie da się uzbroić', 'Brak powiadomień', 'Inne'],
      },
      {
        label: 'Wi-Fi i sieć',
        icon: 'wifi',
        service: 'wifi',
        symptoms: ['Brak internetu', 'Słaby zasięg', 'Goście nie mogą się połączyć', 'Inne'],
      },
      {
        label: 'Zamki',
        icon: 'lock',
        service: 'kd',
        symptoms: ['Kod nie działa', 'Słaba bateria', 'Brak połączenia z rezerwacjami', 'Inne'],
      },
      {
        label: 'Smart home',
        icon: 'home',
        service: 'smart',
        symptoms: ['Scena nie działa', 'Brak sterowania z telefonu', 'Ogrzewanie', 'Inne'],
      },
      {
        label: 'Nagłośnienie',
        icon: 'spk',
        service: 'snd',
        symptoms: ['Brak dźwięku', 'Szumy, trzaski', 'Mikrofon', 'Inne'],
      },
      {
        label: 'Ekrany',
        icon: 'scr',
        service: 'scr',
        symptoms: ['Czarny ekran', 'Stara treść', 'Brak połączenia', 'Inne'],
      },
      {
        label: 'Ładowarka',
        icon: 'bolt',
        service: 'ev',
        symptoms: ['Nie ładuje', 'Karta nie działa', 'Błąd na diodzie', 'Inne'],
      },
      {
        label: 'Antena i TV',
        icon: 'dish',
        service: 'ant',
        symptoms: ['Brak sygnału', 'Obraz się rwie', 'Nowy telewizor', 'Inne'],
      },
      { label: 'Inne', icon: 'wrench', service: null, symptoms: ['Opiszę w rozmowie'] },
    ] satisfies System[],
    urgency: [
      'Pilne: obiekt bez zabezpieczenia',
      'W ciągu kilku dni',
      'Przy najbliższym przeglądzie',
    ],
    urgentNote: {
      lead: 'Pilne? Zadzwoń:',
      text: '(w godzinach pracy). Formularz też wyślij, żeby zgłoszenie zostało zapisane.',
    },
    name: 'Imię',
    namePlaceholder: 'np. Anna',
    phone: 'Telefon',
    phonePlaceholder: 'np. 600 000 000',
    town: 'Miejscowość',
    townPlaceholder: 'np. Zakopane',
    send: 'Wyślij zgłoszenie',
    sending: 'Wysyłamy…',
    // TODO(krystian): after-hours rules from the boss (prototype: „Po godzinach: [SZEF: zasady]”).
    footer: 'Pilne sprawy w godzinach pracy: zadzwoń',
    category: 'Instalacje — serwis',
    errors: {
      name: 'Podaj imię, żebyśmy wiedzieli, jak się do Ciebie zwracać.',
      phone: 'Podaj numer telefonu (9 cyfr), żebyśmy mogli oddzwonić.',
      consent: 'Zaznacz zgodę na kontakt w sprawie zgłoszenia.',
      failed: 'Nie udało się wysłać. Spróbuj ponownie albo zadzwoń.',
      limit: 'Za dużo zgłoszeń z tego adresu. Spróbuj za chwilę albo zadzwoń.',
    },
  },
  track: {
    title: 'Dziękujemy, zgłoszenie przyjęte',
    again: 'Nowe zgłoszenie',
    text: 'Odpowiemy do 24 h w dni robocze: oddzwonimy albo odpiszemy. To czas na odpowiedź, termin ewentualnej wizyty ustalimy w rozmowie.',
    number: 'Numer zgłoszenia:',
    system: 'System',
    symptom: 'Objaw',
    urgency: 'Pilność',
    steps: [
      { title: 'Przyjęte', text: 'Zgłoszenie jest u nas', icon: 'check' },
      {
        title: 'Odpowiedź',
        text: 'Do 24 h w dni robocze oddzwonimy albo odpiszemy',
        icon: 'phone',
      },
      {
        title: 'Diagnoza lub wizyta',
        text: 'Najpierw zdalnie, za Twoją zgodą. Jeśli trzeba, ustalamy termin przyjazdu',
        icon: 'cal',
      },
      { title: 'Naprawione', text: 'Potwierdzamy zakres wykonanych prac', icon: 'star' },
    ] satisfies { title: string; text: string; icon: InstIconName }[],
    note: 'Tak zwykle przebiega zgłoszenie.',
  },
  plans: {
    eyebrow: 'Opieka serwisowa',
    heading: 'Instalacja ma działać w sezonie, a nie tylko w dniu odbioru.',
    lead: 'Wybierz poziom opieki. Zakres i terminy przyjazdu zapisujemy w umowie.',
    hot: 'Najczęściej wybierany',
    price: 'Cena po rozmowie',
    items: [
      {
        name: 'Przegląd',
        text: 'Dla domów i małych instalacji.',
        features: [
          'Przegląd raz w roku, przed zimą',
          'Czyszczenie kamer i test nagrywania',
          'Zdalna pomoc w godzinach pracy',
        ],
        hot: false,
      },
      {
        name: 'Sezon',
        text: 'Dla pensjonatów, restauracji i sklepów.',
        // TODO(krystian): how often the remote checks run (prototype: „[SZEF: jak często]”).
        features: [
          'Dwa przeglądy: przed zimą i przed latem',
          'Zdalne sprawdzanie nagrywania i dysków',
          'Pierwszeństwo w terminach w sezonie',
        ],
        hot: true,
      },
      {
        name: 'Pełna opieka',
        text: 'Dla hoteli, firm i instytucji.',
        features: [
          'Przeglądy według ustaleń',
          'Stały opiekun i raport po wizycie',
          'Naprawy w pierwszej kolejności',
          'Odpowiedź do 24 h w dni robocze, przyjazd w terminie z umowy',
        ],
        hot: false,
      },
    ],
  },
  takeover: {
    eyebrow: 'Instalacja od innej firmy',
    heading: 'Przejmiemy serwis. Bez wymiany wszystkiego.',
    lead: 'Firma, która montowała, zniknęła albo nie odbiera? Zaczynamy od sprawdzenia, co jest, a dopiero potem proponujemy zmiany.',
    steps: [
      {
        n: '01',
        title: 'Inwentaryzacja',
        text: 'Spisujemy, co jest zamontowane: urządzenia, modele, okablowanie, stan.',
      },
      {
        n: '02',
        title: 'Dostęp',
        text: 'Pomagamy odzyskać dostęp do rejestratorów, routerów i central: za zgodą właściciela, także procedurą producenta.',
      },
      {
        n: '03',
        title: 'Raport',
        text: 'Co działa, co trzeba naprawić od razu, a co może poczekać.',
      },
      {
        n: '04',
        title: 'Propozycja',
        text: 'Naprawa, rozbudowa albo wymiana tylko tego, co faktycznie trzeba.',
      },
    ],
  },
  remote: {
    eyebrow: 'Zdalnie i na miejscu',
    heading: 'Dużo naprawiamy, zanim ktokolwiek wsiądzie do auta.',
    lead: 'Za Twoją zgodą łączymy się z urządzeniami zdalnie. Jeśli trzeba przyjechać, jedziemy z najbliższego salonu: z Rabki albo z Zakopanego.',
    items: [
      { icon: 'cam', title: 'Kamery', text: 'Ustawienia, nagrywanie, aplikacja.' },
      { icon: 'wifi', title: 'Sieć i Wi-Fi', text: 'Punkty dostępowe, vouchery, aktualizacje.' },
      { icon: 'home', title: 'Smart home', text: 'Sceny, harmonogramy, zmiany ustawień.' },
      { icon: 'scr', title: 'Ekrany', text: 'Treści i harmonogramy.' },
      { icon: 'lock', title: 'Zamki', text: 'Kody, integracje, historia.' },
      { icon: 'bolt', title: 'Ładowarki', text: 'Karty RFID i konfiguracja (modele online).' },
    ] satisfies { icon: InstIconName; title: string; text: string }[],
  },
  faqHeading: 'Pytania o serwis.',
  faqAside: {
    title: 'Coś nie działa?',
    text: 'Opisz usterkę w formularzu. Odpowiemy do 24 h w dni robocze: oddzwonimy albo odpiszemy.',
    button: 'Zgłoś usterkę',
    href: '#zglos',
  },
  faq: [
    {
      question: 'Ile kosztuje przyjazd serwisu?',
      // TODO(krystian): travel rules and rates (prototype: „[SZEF: zasady dojazdu i stawki]”).
      answer:
        'Zależy od miejscowości i tego, czy masz umowę serwisową. Wiele usterek sprawdzamy najpierw zdalnie, bez kosztów dojazdu.',
    },
    {
      question: 'Czy naprawicie instalację po innej firmie?',
      answer:
        'Tak. Zaczynamy od inwentaryzacji i pomocy w odzyskaniu dostępu do urządzeń, a potem proponujemy naprawę albo rozsądną rozbudowę.',
    },
    {
      question: 'Co, jeśli nie znam haseł do rejestratora?',
      answer:
        'Często da się odzyskać dostęp procedurą producenta. Zawsze potwierdzamy, że jesteś właścicielem albo zarządcą obiektu.',
    },
    {
      question: 'Czy robicie przeglądy przed sezonem?',
      answer:
        'Tak. To najczęstsza usługa dla pensjonatów: kamery, dyski, Wi-Fi, zamki, ładowarka i ekrany sprawdzone, zanim przyjadą goście.',
    },
    {
      question: 'Jak szybko reagujecie?',
      answer:
        'Na każde zgłoszenie odpowiadamy do 24 h w dni robocze: oddzwonimy albo odpiszemy. To czas na odpowiedź, a nie na przyjazd technika. Część usterek da się rozwiązać zdalnie, a gdy potrzebny jest przyjazd, termin ustalamy w rozmowie. Przy umowie serwisowej masz pierwszeństwo.',
    },
    {
      question: 'Czy naprawy w gwarancji są bezpłatne?',
      answer:
        'Usterki montażu przez 24 miesiące usuwamy w ramach gwarancji PRO-KOM. Wady sprzętu zgłaszamy razem z Tobą do producenta w ramach jego gwarancji. Nie ogranicza to Twoich uprawnień ustawowych, np. z tytułu niezgodności towaru z umową.',
    },
    {
      question: 'Czy umowa serwisowa jest obowiązkowa?',
      answer:
        'Nie. Usterki możesz zgłaszać jednorazowo. Umowa daje stałe przeglądy, pierwszeństwo w sezonie i kogoś, kto zna Twoją instalację.',
    },
    {
      question: 'Co przygotować przed przyjazdem serwisu?',
      answer:
        'Opis objawów, zdjęcie urządzenia i komunikatu błędu, dostęp do rejestratora albo szafy i dane logowania, jeśli je masz. Często to wystarczy, żeby rozwiązać problem zdalnie.',
    },
  ],
  relatedHeading: 'Serwisujemy wszystko, co montujemy.',
  related: ['kam', 'alarm', 'wifi', 'smart'] satisfies ServiceKey[],
  bandButton: { label: 'Zgłoś usterkę', href: '#zglos' },
} as const
