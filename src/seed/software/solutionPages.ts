import demo from '../../../seed/prokomsoftware/demo-aplikacja-ekip.json'

/**
 * Texts of the full solution pages (`Solutions.page`, spec. §6.1) from the board `Rozwiazanie`
 * v22 — the package has the demo data (`demo-aplikacja-ekip.json`), the board the rest. Only the
 * field crew app has a full page; the other solutions show the template from their card and
 * window texts until Krystian writes theirs (plan §5).
 * TODO(krystian): pełne treści pozostałych rozwiązań (pisane w czacie, spec. §6.1).
 */

export const FIELD_CREW_SLUG = demo.solution

/** Page fields without the deliverables (their icons are mapped by the seed, `map.ts`). */
export const FIELD_CREW_PAGE = {
  eyebrow: 'Aplikacja · budowlanka, instalatorzy, serwisy',
  title: 'Aplikacja dla ekip w terenie.',
  titleAccent: 'Działa bez zasięgu.',
  lead: 'Zlecenia, zdjęcia, lista zadań i podpis klienta w telefonie pracownika. Bez zasięgu zapisuje, a wysyła, gdy wróci sieć. Biuro widzi wszystko na żywo i od razu wystawia fakturę.',
  priceCaption: 'odpowiedź w [CZAS ODPOWIEDZI], wycena na piśmie w 5–7 dni',
  tiles: [
    { label: 'Pierwszy etap', value: '3–4 tyg.', caption: 'potem co tydzień wersja testowa' },
    { label: 'Działa na', value: 'iOS · Android', caption: 'albo z przeglądarki, bez sklepu' },
    {
      label: 'Opieka',
      value: '790 zł / mies.',
      caption: 'Opieka Systemy: reakcja 4 h, rozwój do 4 h',
    },
  ],
  compare: [
    {
      label: 'Dziś',
      title: 'Zlecenia SMS-em, protokoły na kartkach, zdjęcia na telefonie Marka.',
      text: 'Wieczorem przepisujesz. Klient dzwoni, bo nie wie, kiedy przyjedziecie. Protokół z wtorku zaginął w aucie.',
    },
    {
      label: 'Z aplikacją',
      title: 'Ekipa widzi zlecenie w telefonie. Biuro widzi ekipę na tablicy.',
      text: 'Zdjęcia i podpis lądują w biurze w sekundę. Klient dostaje SMS sam. Faktura jednym kliknięciem.',
    },
    {
      label: 'Efekt (mierzymy po wdrożeniu)',
      title: 'Zero przepisywania wieczorem. Zero zgubionych protokołów.',
      text: 'Ile godzin tygodniowo odzyskasz, policzymy razem na Twoich zleceniach. Nie obiecujemy procentów z internetu.',
    },
  ],
  deliverablesTitle: 'W cenie wdrożenia',
  choice: {
    title: 'Z przeglądarki czy ze sklepu?',
    note: 'Doradzimy, nie dosprzedamy: dla ekip w terenie zwykle wystarczy wersja z przeglądarki.',
    options: [
      {
        name: 'Z przeglądarki (PWA)',
        caption: 'instaluje się z linku, bez App Store i Google Play',
        plus: [
          'szybciej i taniej w zmianach',
          'działa bez zasięgu',
          'dla większości firm wystarczy',
        ],
        minus: [],
      },
      {
        name: 'W sklepach (iOS i Android)',
        caption: 'jeden kod, dwie aplikacje w sklepach',
        plus: ['ikona w sklepie, więcej uprawnień telefonu'],
        minus: [
          'publikacja i konta w sklepach wyceniane osobno',
          'zmiany czekają na akceptację sklepu',
        ],
      },
    ],
  },
  faqEyebrow: 'Pytania o tę aplikację',
  faq: [
    {
      q: 'Co, gdy na budowie nie ma zasięgu?',
      a: 'Aplikacja zapisuje wszystko w telefonie: zadania, zdjęcia, podpis. Gdy wróci sieć, wysyła sama. Pracownik nie musi nic robić.',
    },
    {
      q: 'Czy pracownicy to ogarną?',
      a: 'Ekran ma trzy przyciski. Szkolimy ekipy na ich własnych zleceniach, godzina wystarcza.',
    },
    {
      q: 'Musi być w App Store?',
      a: 'Nie. Wersja z przeglądarki instaluje się z linku i działa bez zasięgu. Sklepy mają sens, gdy chcesz aplikację dla klientów albo głębszego dostępu do telefonu.',
    },
    {
      q: 'A jak mam już program do zleceń?',
      a: 'Zostaje. Dorabiamy aplikację na jego danych albo łączymy oba. Nie wymieniasz tego, za co już płacisz.',
    },
    {
      q: 'Ile to kosztuje i kiedy płacę?',
      a: 'Aplikację wyceniamy po jednej krótkiej rozmowie, podgląd i cenę na piśmie dostajesz w 5–7 dni. Przy podpisaniu 30% zaliczki, resztę płacisz w ratach po odbiorze każdego etapu. Pierwszy etap działa po 3–4 tygodniach. Faktura VAT, przelew 7 dni.',
    },
  ],
  contact: {
    eyebrow: 'Porozmawiajmy o Twoich ekipach',
    title: 'Pokaż nam, jak dziś wygląda dzień ekipy. Wycenimy aplikację pod niego.',
    lead: 'Krótka rozmowa, potem podgląd, cena i plan etapów na piśmie w 5–7 dni. Bez zobowiązań.',
    quoteCaption: 'Opisz ekipy i zlecenia, odpiszemy w [CZAS ODPOWIEDZI]',
  },
  demo: {
    kind: 'fieldCrew' as const,
    steps: demo.steps as [string, string][],
    tasks: demo.tasks,
    flow: [
      { title: 'Ekipa dostaje zlecenie', text: 'adres, kod do bramy, materiały, nawigacja' },
      { title: 'Robota: zadania, zdjęcia', text: 'bez zasięgu też; wyśle się, gdy wróci sieć' },
      {
        title: 'Klient podpisuje w telefonie',
        text: 'protokół PDF od razu w biurze, faktura jednym kliknięciem',
      },
    ],
    intro: {
      eyebrow: 'To nie jest film. Klikaj po telefonie.',
      title: 'Odhaczaj zadania, dodaj zdjęcie, podpisz. Tablica w biurze zmieni się sama.',
      lead: 'Tak będzie wyglądać praca Twojej ekipy. Dane są fikcyjne, mechanika prawdziwa.',
    },
  },
}

/**
 * Icon names of „Co dostajesz”, in the package order. The package draws them as paths; all but
 * „Szkolenie ekip” are paths of `ikony.json` (test in `map.test.ts`), that one is the shared
 * `users` drawing (ADR-014 rozstrz. SW0 8: one icon set).
 */
const FIELD_CREW_ICONS = [
  'phone',
  'panel',
  'sign',
  'globe',
  'chat',
  'box',
  'users',
  'shield',
] as const

/** „Co dostajesz” of the field crew app (`page.deliverables`). */
export const FIELD_CREW_DELIVERABLES = demo.included.map(([title, text], i) => ({
  title: title!,
  text: text ?? null,
  icon: FIELD_CREW_ICONS[i] ?? null,
}))

/** „Wyceniane osobno” = `moreExamples` of the solution (spec. §6.1 v22). */
export const FIELD_CREW_EXTRA = demo.extra
