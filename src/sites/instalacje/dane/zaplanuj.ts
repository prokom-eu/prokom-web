import type { PlannerObject } from '@/lib/instalacje/plan'

import type { InstIconName } from '../icons'
import type { ServiceKey } from './types'

/*
 * Texts of the planner `/zaplanuj` (`zrodlo/pages/Zaplanuj.body.html` + `Zaplanuj.js`), 1:1
 * with the prototype except: no photo upload in v1 (ADR-I002 §4 — the photos go by e-mail after
 * the inquiry), the consent is `CONSENT_CLAUSE`, the phone comes from `SiteSettings`. The rules
 * the server checks (objects, sizes, stages, questions) live in `lib/instalacje/plan`; the hero
 * and the band before the footer are edited in the panel (`instPlanner` block).
 */

export const PLANNER_OBJECT_ICONS: Record<PlannerObject, InstIconName> = {
  dom: 'home',
  pens: 'bed',
  apt: 'key',
  hotel: 'hotel',
  rest: 'food',
  sklep: 'shop',
  firma: 'factory',
  gmina: 'school',
  dew: 'crane',
}

/** Service hues of the planner (`HUE`) — used when the panel has no colour. */
export const PLANNER_HUES: Record<ServiceKey, string> = {
  kam: '#12B6D8',
  alarm: '#F07A6A',
  kd: '#F2B84B',
  wifi: '#5B8CF0',
  tel: '#9AA8AD',
  ant: '#B58CF0',
  smart: '#7BD36A',
  snd: '#F29A4B',
  scr: '#E86FB0',
  ev: '#5FD0B0',
}

export type PlannerPreset = {
  label: string
  description: string
  icon: InstIconName
  services: ServiceKey[]
  object: PlannerObject
}

export const zaplanuj = {
  trust: [
    { icon: 'clock', title: '2 minuty', text: 'klikasz zamiast pisać' },
    { icon: 'shield', title: 'Bez zobowiązań', text: 'wycena po wizji lokalnej' },
    { icon: 'doc', title: 'Na piśmie', text: 'zakres i cena przed montażem' },
  ] satisfies { icon: InstIconName; title: string; text: string }[],
  steps: ['Instalacje', 'Obiekt', 'Szczegóły', 'Kontakt'],
  step1: {
    heading: 'Co planujesz?',
    text: 'Zaznacz jedną albo kilka rzeczy. Nie musisz znać nazw technicznych.',
    presetsLabel: 'Szybki wybór',
    presets: [
      {
        label: 'Nowy dom',
        description: 'smart home, alarm, kamery, Wi-Fi',
        icon: 'home',
        services: ['smart', 'alarm', 'kam', 'wifi'],
        object: 'dom',
      },
      {
        label: 'Pensjonat, apartamenty',
        description: 'kamery, Wi-Fi gości, zamki, alarm',
        icon: 'bed',
        services: ['kam', 'wifi', 'kd', 'alarm'],
        object: 'pens',
      },
      {
        label: 'Firma, sklep, biuro',
        description: 'kamery, alarm, sieć, dostęp',
        icon: 'shop',
        services: ['kam', 'alarm', 'wifi', 'kd'],
        object: 'firma',
      },
      {
        label: 'Restauracja, hotel, sala',
        description: 'nagłośnienie, ekrany, Wi-Fi',
        icon: 'food',
        services: ['snd', 'scr', 'wifi'],
        object: 'rest',
      },
    ] satisfies PlannerPreset[],
    unsure: {
      title: 'Nie wiem, doradźcie mi',
      text: 'Opiszesz problem, a my zaproponujemy rozwiązanie',
    },
  },
  step2: {
    heading: 'Gdzie to będzie?',
    text: 'Rodzaj obiektu i miejscowość wystarczą, żebyśmy się przygotowali.',
    size: 'Wielkość',
    stage: 'Etap',
    town: 'Miejscowość',
    townPlaceholder: 'Wpisz, np. Nowy Targ',
    zoneEmpty: 'strefa dojazdu',
    towns: ['Rabka-Zdrój', 'Nowy Targ', 'Zakopane', 'Jordanów', 'Mszana Dolna', 'Limanowa'],
  },
  step3: {
    heading: 'Kilka szczegółów',
    text: 'Pytamy tylko o to, co wybrałeś. Jeśli nie wiesz, kliknij „Nie wiem”, to normalne.',
    noServices:
      'Nie wybrałeś konkretnej instalacji. Napisz poniżej, co chcesz poprawić albo co Cię martwi.',
    more: 'Coś jeszcze?',
    optional: 'opcjonalnie',
    morePlaceholder: 'np. kamery na parking i narciarnię, Wi-Fi nie działa na drugim piętrze',
    // Prototype: „Dodaj zdjęcia obiektu” — no upload in v1 (ADR-I002 §4, I0).
    photos: {
      title: 'Zdjęcia obiektu',
      text: 'bardzo pomagają w wycenie · prześlij mailem po zgłoszeniu, adres podamy w odpowiedzi',
    },
    tipsTitle: 'Co warto sfotografować',
    tips: {
      kam: 'miejsca do obserwacji: wjazd, parking, wejścia',
      alarm: 'drzwi wejściowe i okna parteru',
      kd: 'drzwi z obu stron i bok skrzydła z zamkiem',
      wifi: 'router i szafkę, w której stoi',
      tel: 'rzuty albo przedmiar',
      ev: 'rozdzielnicę i miejsce na ładowarkę',
      smart: 'rozdzielnicę i projekt elektryki',
      ant: 'dach i liczbę telewizorów',
      snd: 'wnętrze z kilku stron i sufit',
      scr: 'ścianę lub witrynę pod ekran',
    } satisfies Record<ServiceKey, string>,
    tipOutside: 'budynek z zewnątrz, z dwóch stron',
    charger: 'Wybrana ładowarka',
  },
  step4: {
    heading: 'Jak się z Tobą skontaktować?',
    text: 'Wystarczy imię i telefon. Nie wysyłamy reklam.',
    name: 'Imię',
    namePlaceholder: 'np. Anna',
    phone: 'Telefon',
    phonePlaceholder: 'np. 600 000 000',
    email: 'E-mail',
    emailOptional: 'opcjonalnie',
    emailRequired: 'wymagany przy kontakcie e-mailem',
    emailPlaceholder: 'np. anna@example.pl',
    via: 'Wolisz kontakt przez',
    viaIcons: ['phone', 'chat', 'mail'] satisfies InstIconName[],
    when: 'Kiedy najlepiej?',
  },
  errors: {
    services: 'Zaznacz przynajmniej jedną instalację albo „Nie wiem, doradźcie mi”.',
    phone: 'Podaj numer telefonu, żebyśmy mogli oddzwonić.',
    email: 'Wybrałeś kontakt e-mailem: wpisz poprawny adres e-mail.',
    consent: 'Zaznacz zgodę na kontakt, wtedy wyślemy zgłoszenie.',
    name: 'Podaj imię, żebyśmy wiedzieli, jak się do Ciebie zwracać.',
    failed: 'Nie udało się wysłać. Spróbuj ponownie albo zadzwoń.',
    limit: 'Za dużo zgłoszeń z tego adresu. Spróbuj za chwilę albo zadzwoń.',
  },
  nav: {
    back: '← Wstecz',
    next: 'Dalej →',
    send: 'Wyślij zgłoszenie',
    sending: 'Wysyłamy…',
  },
  hints: {
    fromLink: 'Zaznaczyliśmy instalacje wybrane na poprzedniej stronie. Możesz je zmienić.',
    empty:
      'Nie wiesz, od czego zacząć? Kliknij szybki wybór, a zaznaczymy typowy zestaw. Potem możesz go zmienić.',
    unsure:
      'Nie musisz znać się na technice. Opisz w szczegółach, co Cię martwi, a zaproponujemy rozwiązanie.',
    build:
      'Najtaniej teraz: kable i puszki kładziemy w stanie surowym, a osprzęt montujemy po wykończeniu.',
    kam: 'Kamery na zewnątrz dobieramy do mrozu i śniegu. Do rejestratora warto dodać zasilacz UPS, żeby kamery nagrywały także przy krótkim zaniku prądu.',
    wifi: 'Robimy osobną sieć dla gości i osobną dla kamer. Goście nie widzą Twoich urządzeń.',
    kd: 'Zamki na kod lub kartę: gość wchodzi bez odbierania kluczy, a kod wygasa po wyjeździe.',
    smart:
      'Ampio działa lokalnie, bez internetu. Najwięcej da się zrobić, gdy zaplanujemy go przed elektryką.',
    snd: 'Przy nagłośnieniu przyjedziemy posłuchać wnętrza. W kościele czy sali pogłos decyduje o doborze głośników.',
    ev: 'Ładowarkę dobieramy do przyłącza. Czasem trzeba zwiększyć moc przyłączeniową (wniosek do operatora sieci).',
    contact:
      'Zostaw numer, a resztę dopytamy przez telefon. Nie wysyłamy reklam. Dane służą tylko do kontaktu w sprawie zgłoszenia.',
    default: 'Wycena po wizji lokalnej, na piśmie, zwykle w wariantach do wyboru.',
  },
  side: {
    eyebrow: 'Twoje zgłoszenie',
    none: 'Nic jeszcze nie wybrano',
    unsure: 'Do doradzenia',
    object: 'Obiekt',
    stage: 'Etap',
    details: 'Szczegóły',
    photos: 'Zdjęcia',
    photosValue: 'mailem po zgłoszeniu',
    town: 'Miejscowość',
    hint: 'Podpowiedź',
    after: 'Co dalej',
    call: 'Wolisz zadzwonić?',
  },
  after: [
    {
      title: 'Odezwiemy się',
      text: 'Do 24 h w dni robocze. Dopytamy o szczegóły i umówimy termin.',
    },
    { title: 'Wizja lokalna', text: 'Oglądamy obiekt, mierzymy, sprawdzamy kable.' },
    { title: 'Wycena na piśmie', text: 'Zwykle w wariantach do wyboru.' },
  ],
  category: 'Instalacje — Zaplanuj',
} as const
