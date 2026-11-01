import type { InstIconName } from '../icons'

/*
 * Texts of the contact page `/kontakt` (`zrodlo/pages/Kontakt.body.html` + `Kontakt.js`), 1:1
 * with the prototype except: phone, e-mail, WhatsApp, salons, hours and NIP come from the panel
 * (`SiteSettings`, `InstalacjeSettings`, `CompanyData`) instead of the prototype's
 * placeholders; no `[SZEF…]` notes on the page (travel rules, Saturday hours,
 * parking — open questions for the boss); the consent is `CONSENT_CLAUSE`. The hero and the
 * band before the footer are edited in the panel (`instContact` block).
 */

export const kontakt = {
  map: {
    townPlaceholder: 'Wpisz miejscowość, np. Szczawnica',
    town: 'Miejscowość',
    empty: 'Wpisz miejscowość (min. 3 litery)',
    emptyText: 'Pokażemy strefę dojazdu i najbliższy salon.',
    label: 'Mapa stref dojazdu: Rabka-Zdrój, Podhale, Tatry i Małopolska',
  },
  // TODO(krystian): travel rules per zone from the boss (prototype: „[SZEF: zasady dojazdu]”,
  // „Wizja lokalna zwykle w kilka dni. [SZEF]”); until then only what the page can promise.
  zones: {
    r: { name: 'Rabka-Zdrój i okolice', text: 'Najbliżej salonu w Rabce.' },
    // One salon (boss 01.11.2026, no salon in Zakopane): the Tatra zone is served from Rabka.
    z: { name: 'Zakopane i Tatry', text: 'Dojeżdżamy z Rabki-Zdroju.' },
    p: { name: 'Podhale', text: 'Dojazd z Rabki-Zdroju.' },
    m: {
      name: 'Małopolska · dojazd ustalimy',
      text: 'Przy większych inwestycjach jedziemy dalej. Dojazd ustalamy indywidualnie.',
    },
  },
  cards: {
    phone: { icon: 'phone', title: 'Telefon', text: 'Instalacje i serwis' },
    whatsapp: {
      icon: 'chat',
      title: 'WhatsApp',
      text: 'Zdjęcia obiektu i pytania',
      message: 'Dzień dobry, mam pytanie o instalację w obiekcie: ',
    },
    email: {
      icon: 'mail',
      title: 'E-mail',
      text: 'Zapytania i dokumenty',
      subject: 'Pytanie o instalację',
    },
    planner: {
      icon: 'plane',
      title: 'Kreator',
      text: 'Zaplanuj instalację w 2 minuty',
      href: '/zaplanuj',
    },
  } satisfies Record<
    string,
    { icon: InstIconName; title: string; text: string; [extra: string]: string }
  >,
  hours: { title: 'Godziny otwarcia salonów', sunday: 'Niedziela', closed: 'nieczynne' },
  form: {
    eyebrow: 'Napisz do nas',
    heading: 'Krótka wiadomość wystarczy.',
    planner: 'Wolisz kreator z pytaniami? →',
    region: 'Formularz kontaktowy',
    topicTitle: 'W jakiej sprawie?',
    topics: ['Nowa instalacja', 'Awaria lub serwis', 'Współpraca dla firm budowlanych', 'Inne'],
    name: 'Imię',
    namePlaceholder: 'np. Anna',
    phone: 'Telefon',
    phonePlaceholder: 'np. 600 000 000',
    message: 'Wiadomość',
    messagePlaceholder: 'Opisz krótko obiekt i to, czego potrzebujesz',
    send: 'Wyślij wiadomość',
    sending: 'Wysyłamy…',
    category: 'Instalacje — kontakt',
    errors: {
      name: 'Podaj imię, żebyśmy wiedzieli, jak się do Ciebie zwracać.',
      phone: 'Podaj numer telefonu (9 cyfr), żebyśmy mogli oddzwonić.',
      consent: 'Zaznacz zgodę na kontakt w sprawie wiadomości.',
      failed: 'Nie udało się wysłać. Spróbuj ponownie albo zadzwoń.',
      limit: 'Za dużo zgłoszeń z tego adresu. Spróbuj za chwilę albo zadzwoń.',
    },
  },
  salons: { route: 'Wyznacz trasę →' },
} as const
