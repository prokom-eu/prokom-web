import type { Payload } from 'payload'

import { upsertSoftwarePage, type PageBlock } from './page'

export const SOFTWARE_ABOUT_SLUG = 'o-firmie'
export const SOFTWARE_ONE_FIRM_SLUG = 'jedna-firma'

type Count = (name: string, result: boolean | 'updated') => void

type Of<T extends PageBlock['blockType']> = Extract<PageBlock, { blockType: T }>

// TODO(krystian): [SZEF] texts of `/o-firmie` and `/jedna-firma` come from the boards `ONas` and
// `Wszystko` (the package has no JSON for them) — approval before production: „100+ klientów”,
// the people and their roles (photos only with consent), the two examples, the years
// `[ROK ZAKOPANE]` / `[ROK SERWIS KAS]` (empty = the timeline item goes on production).

const ABOUT_HERO: Of<'swPageHero'> = {
  blockType: 'swPageHero',
  eyebrow: 'O firmie',
  title: 'Firma z Rabki.',
  titleAccent: 'Od 2004 roku.',
  lead: 'PRO-KOM to sklepy w Rabce-Zdroju i Zakopanem, serwis, sprzęt i programy dla firm. Software to nasza linia od stron, systemów i aplikacji. Za każdym projektem stoi firma z historią, umową i fakturą VAT.',
  primary: { label: 'Umów rozmowę', href: '/kontakt' },
  secondary: { label: 'Co jeszcze robi PRO-KOM', href: '/jedna-firma' },
  visual: 'photos',
  photos: [
    {
      photoCaption: 'Salon PRO-KOM przy ul. Orkana 16B w Rabce-Zdroju, witryna od ulicy',
      tone: 'violet',
    },
    { photoCaption: 'Rozmowa z klientem w salonie, przy biurku', tone: 'teal' },
    { photoCaption: 'Salon PRO-KOM w Zakopanem', tone: 'copper' },
  ],
  badge: {
    status: 'działa na co dzień',
    title: 'prokomserwis.pl',
    text: 'nasz własny system serwisu',
  },
}

const ABOUT_NUMBERS: Of<'swSteps'> = {
  blockType: 'swSteps',
  variant: 'stats',
  eyebrow: 'W liczbach',
  heading: 'Konkretnie, bez dmuchania.',
  items: [
    { marker: '2004', text: 'rok, od którego PRO-KOM działa na Podhalu' },
    { marker: '100+', text: 'klientów biznesowych na Podhalu i w Małopolsce' },
    { marker: '2', text: 'salony z ludźmi na miejscu: Rabka-Zdrój i Zakopane' },
    { marker: '5', text: 'linii: Software, Biznes, Instalacje, Tech (serwis) i salon w Zakopanem' },
  ],
}

// „Ciągłość” without a promise of a stand-in or a team of developers (spec. §6.6, ZMIANY-v21 §9).
const ABOUT_COMPANY: Of<'swSteps'> = {
  blockType: 'swSteps',
  variant: 'cards',
  eyebrow: 'Co to znaczy dla Ciebie',
  heading: 'Pracujesz z firmą, która działa od 2004 r.',
  lead: 'Strona albo system to praca na lata. Liczy się, kto za nią odpowiada, kiedy coś się zmieni.',
  items: [
    {
      icon: 'users',
      title: 'Ciągłość',
      text: 'Kod, dostępy i dokumentacja są uporządkowane i zapisane w umowie, więc projekt przejmie każdy programista. Nie zostajesz z niczym.',
    },
    {
      icon: 'pin',
      title: 'Na miejscu',
      text: 'Spotkasz się z nami w salonie w Rabce albo w Zakopanem. Zdalnie pracujemy w całej Polsce.',
    },
    {
      icon: 'doc',
      title: 'Na piśmie',
      text: 'Zakres, cena, termin i czas reakcji w opiece są w umowie. Faktura VAT od firmy, która działa od 2004 r.',
    },
  ],
}

const ABOUT_HISTORY: Of<'swSteps'> = {
  blockType: 'swSteps',
  variant: 'timeline',
  eyebrow: 'Historia',
  heading: 'Najpierw sprzęt i serwis. Potem własne systemy.',
  lead: 'Software nie wziął się znikąd. Najpierw zbudowaliśmy programy dla siebie.',
  items: [
    {
      marker: '2004',
      title: 'Start PRO-KOM w Rabce-Zdroju',
      text: 'Sprzęt komputerowy, serwis i obsługa firm.',
    },
    {
      marker: '[ROK ZAKOPANE]',
      title: 'Salon w Zakopanem',
      text: 'Drugi punkt z ludźmi na miejscu.',
    },
    {
      marker: '[ROK SERWIS KAS]',
      title: 'Autoryzowany serwis kas',
      text: 'Posnet i Elzab, wdrożenia programów InsERT.',
    },
    {
      marker: '2026',
      title: 'prokomserwis.pl',
      text: 'Własny system serwisu: przyjęcia, statusy, SMS-y, panel klienta. Działa na co dzień.',
    },
    {
      marker: '2026',
      title: 'PRO-KOM Software',
      text: 'Strony, systemy i aplikacje dla innych firm, na tym samym fundamencie.',
    },
  ],
}

const ABOUT_TEAM: Of<'swTeam'> = {
  blockType: 'swTeam',
  variant: 'people',
  eyebrow: 'Ludzie',
  heading: 'Kto z Tobą pracuje.',
  members: [
    {
      role: 'PRO-KOM Software',
      name: 'Krystian Potaczek',
      text: 'Prowadzi Software: strony, systemy i aplikacje (Python, Django, Next.js). Z nim ustalasz zakres i odbierasz etapy.',
      photoCaption: 'Portret: Krystian Potaczek',
      tone: 'violet',
    },
    {
      role: 'Właściciel',
      name: 'Tadeusz Wójciak',
      text: 'Właściciel PRO-KOM od 2004 r. Odpowiada za firmę i umowy.',
      photoCaption: 'Portret: Tadeusz Wójciak',
      tone: 'teal',
    },
    {
      role: 'Obsługa i salon',
      name: '[IMIĘ I NAZWISKO]',
      text: 'Pierwszy kontakt na miejscu w Rabce. Umówi spotkanie i przekaże sprawę dalej.',
      photoCaption: 'Portret: obsługa klienta w salonie',
      tone: 'copper',
    },
  ],
}

// The salon cards: one fact per line — a line with a missing fact goes on production, the card
// stays (`swTeam` places). The Rabka phone is in the site settings (spec. §3).
const ABOUT_PLACES: Of<'swTeam'> = {
  blockType: 'swTeam',
  variant: 'places',
  eyebrow: 'Gdzie nas znaleźć',
  heading: 'Dwa salony. Ludzie na miejscu.',
  members: [
    {
      name: 'Rabka-Zdrój',
      details: 'PRO-KOM Tadeusz Wójciak\n[ADRES]\n[GODZINY]\nNIP 7352511447',
      photoCaption: 'Salon w Rabce-Zdroju, wejście od ul. Orkana',
      tone: 'violet',
    },
    {
      name: 'Zakopane',
      details: 'PRO-KOM Zakopane\n[ADRES SALONU W ZAKOPANEM]\n[TELEFON ZAKOPANE]\n[GODZINY]',
      photoCaption: 'Salon w Zakopanem, wnętrze i lada',
      tone: 'copper',
    },
  ],
}

const ABOUT_CTA: Of<'callToAction'> = {
  blockType: 'callToAction',
  heading: 'Poznajmy się. Kawa w salonie albo 30 minut online.',
  text: 'Pokaż, jak dziś pracujesz. Powiemy, co da się uprościć, ile to kosztuje i kiedy może działać. Bez zobowiązań.',
  link: { label: 'Umów rozmowę', href: '/kontakt' },
}

/** `/o-firmie` (spec. §6.6): v21 without „Jak robimy” and „Z czego budujemy” (start page). */
export function softwareAboutLayout(): PageBlock[] {
  return structuredClone([
    ABOUT_HERO,
    ABOUT_NUMBERS,
    ABOUT_COMPANY,
    { blockType: 'swHomeSection', section: 'compare' },
    ABOUT_HISTORY,
    ABOUT_TEAM,
    ABOUT_PLACES,
    ABOUT_CTA,
  ] satisfies PageBlock[])
}

const ONE_HERO: Of<'swPageHero'> = {
  blockType: 'swPageHero',
  eyebrow: 'PRO-KOM · jedna firma, pięć linii',
  title: 'Strona, program, sprzęt i serwis.',
  titleAccent: 'W jednej firmie.',
  lead: 'Software robi strony i systemy. Resztę, czego potrzebuje firma, załatwisz w PRO-KOM obok: kasy i sprzęt, monitoring i sieci, serwis. Jeden telefon i jedna firma, która zna całość.',
  primary: { label: 'Porozmawiajmy o całości', href: '/kontakt' },
  secondary: { label: 'Dobierz rozwiązanie', href: '/dobierz' },
  visual: 'lines',
  hub: { title: 'Twoja firma', text: 'jeden kontakt' },
  nodes: [
    { name: 'Software', icon: 'site', text: 'strony, systemy, aplikacje', current: true },
    { name: 'Biznes', icon: 'store', text: 'kasy, terminale, programy, opieka IT' },
    { name: 'Instalacje', icon: 'monitor', text: 'monitoring, sieci, smart home' },
    { name: 'Tech', icon: 'wrench', text: 'serwis komputerów i telefonów' },
  ],
}

// Links only to sites that exist (spec. §6.7); „Tech” instead of „Serwis” (v21).
const ONE_LINES: Of<'swLines'> = {
  blockType: 'swLines',
  variant: 'lines',
  eyebrow: 'Linie PRO-KOM',
  heading: 'Każda robi swoje. Razem robią całość.',
  lines: [
    {
      name: 'PRO-KOM Software',
      icon: 'site',
      address: 'prokomsoftware.pl · ta strona',
      points: [
        { text: 'Strony i sklepy internetowe' },
        { text: 'Systemy i panele dla firm' },
        { text: 'Aplikacje na telefon' },
        { text: 'Automatyzacje i opieka' },
      ],
      cta: 'Zobacz ofertę →',
      current: true,
    },
    {
      name: 'PRO-KOM Biznes',
      icon: 'store',
      address: 'prokombiznes.pl',
      href: 'https://prokombiznes.pl',
      points: [
        { text: 'Kasy fiskalne i terminale' },
        { text: 'GoPOS i programy InsERT' },
        { text: 'Komputery i sprzęt dla firm' },
        { text: 'Opieka IT dla firm' },
      ],
    },
    {
      name: 'PRO-KOM Instalacje',
      icon: 'monitor',
      address: 'prokominstalacje.pl',
      href: 'https://prokominstalacje.pl',
      points: [
        { text: 'Monitoring' },
        { text: 'Sieci i Wi-Fi' },
        { text: 'Smart home' },
        { text: 'Nagłośnienie' },
      ],
    },
    {
      name: 'PRO-KOM Tech',
      icon: 'wrench',
      address: 'prokomserwis.pl · serwis',
      href: 'https://prokomserwis.pl',
      points: [
        { text: 'Naprawy komputerów i laptopów' },
        { text: 'Naprawy telefonów' },
        { text: 'Status naprawy online' },
        { text: 'Akcesoria i sprzęt' },
      ],
    },
    {
      name: 'PRO-KOM Zakopane',
      icon: 'pin',
      address: 'salon · [ADRES SALONU W ZAKOPANEM]',
      points: [
        { text: 'Sprzęt i akcesoria na miejscu' },
        { text: 'Otwarte [GODZINY]' },
        { text: 'Spotkanie o stronie albo systemie' },
      ],
    },
  ],
}

// No client names (spec. §6.7); the guesthouse site „z zapytaniem o termin w kilku językach”.
const ONE_EXAMPLES: Of<'swLines'> = {
  blockType: 'swLines',
  variant: 'examples',
  eyebrow: 'Jak to wygląda w praktyce',
  heading: 'Dwa przykłady z Podhala.',
  examples: [
    {
      eyebrow: 'Przykład',
      title: 'Nowy pensjonat przed sezonem',
      text: 'Właściciel dzwoni raz. Resztę ustalamy między liniami.',
      rows: [
        {
          line: 'Software',
          icon: 'site',
          text: 'Strona z zapytaniem o termin w kilku językach i panel do cen i zdjęć.',
        },
        {
          line: 'Instalacje',
          icon: 'monitor',
          text: 'Wi-Fi dla gości w całym budynku i monitoring parkingu.',
        },
        { line: 'Biznes', icon: 'store', text: 'Kasa fiskalna i terminal płatniczy w recepcji.' },
        {
          line: 'Tech',
          icon: 'wrench',
          text: 'Naprawa laptopa i telefonu właściciela w salonie w Rabce.',
        },
      ],
    },
    {
      eyebrow: 'Przykład',
      title: 'Firma budowlana z trzema ekipami',
      text: 'Zamiast pięciu dostawców jeden, który zna całość.',
      rows: [
        {
          line: 'Software',
          icon: 'site',
          text: 'System zleceń i grafik ekip plus aplikacja z protokołami na telefon.',
        },
        { line: 'Biznes', icon: 'store', text: 'Laptopy i telefony dla ekip, program do faktur.' },
        { line: 'Instalacje', icon: 'monitor', text: 'Monitoring magazynu i placu.' },
        { line: 'Tech', icon: 'wrench', text: 'Szybka naprawa sprzętu, żeby ekipa nie stała.' },
      ],
    },
  ],
}

const ONE_GAINS: Of<'swSteps'> = {
  blockType: 'swSteps',
  variant: 'cards',
  eyebrow: 'Co zyskujesz',
  heading: 'Jeden kontakt zamiast pięciu.',
  items: [
    {
      icon: 'chat',
      title: 'Jeden telefon',
      text: 'Nie szukasz, kto od czego. Dzwonisz do PRO-KOM, a my ustalamy resztę między sobą.',
    },
    {
      icon: 'shield',
      title: 'Nikt nie zrzuca winy',
      text: 'Strona, sieć i sprzęt są od jednej firmy. Gdy coś nie działa, nie słyszysz „to nie u nas”.',
    },
    {
      icon: 'pin',
      title: 'Ludzie na miejscu',
      text: 'Salony w Rabce i Zakopanem. Przyjedziemy albo przyjdziesz do nas.',
    },
  ],
}

const ONE_PLACES: Of<'swTeam'> = {
  blockType: 'swTeam',
  variant: 'people',
  eyebrow: 'Na miejscu',
  heading: 'Dwa salony z ludźmi na miejscu.',
  lead: 'Przyjdź z laptopem, z kasą do serwisu albo z pomysłem na stronę. Wszystko w jednym miejscu.',
  members: [
    {
      name: 'Rabka-Zdrój',
      details: 'ul. Orkana 16B · [GODZINY]',
      photoCaption: 'Salon PRO-KOM w Rabce-Zdroju: lada, sprzęt i miejsce na rozmowę',
      tone: 'violet',
    },
    {
      name: 'Zakopane',
      details: '[ADRES SALONU W ZAKOPANEM]\n[GODZINY]',
      photoCaption: 'Salon PRO-KOM w Zakopanem: witryna i wnętrze',
      tone: 'copper',
    },
  ],
}

const ONE_CTA: Of<'callToAction'> = {
  blockType: 'callToAction',
  heading: 'Opowiedz, co masz i czego brakuje.',
  text: 'Przejrzymy całość i powiemy, co zrobić najpierw. Konkretnie i bez sprzedawania na siłę.',
  link: { label: 'Umów rozmowę', href: '/kontakt' },
}

/** `/jedna-firma` (spec. §6.7): five lines with „Tech”, two examples, gains, salons, CTA. */
export function softwareOneCompanyLayout(): PageBlock[] {
  return structuredClone([
    ONE_HERO,
    ONE_LINES,
    ONE_EXAMPLES,
    ONE_GAINS,
    ONE_PLACES,
    ONE_CTA,
  ] satisfies PageBlock[])
}

/** Creates the published `/o-firmie` and `/jedna-firma` (only while they lack their hero). */
export async function seedSoftwareAbout(payload: Payload, tenantId: number, count: Count) {
  await upsertSoftwarePage(
    payload,
    tenantId,
    {
      slug: SOFTWARE_ABOUT_SLUG,
      title: 'O firmie',
      block: 'swPageHero',
      layout: softwareAboutLayout,
    },
    count,
  )
  await upsertSoftwarePage(
    payload,
    tenantId,
    {
      slug: SOFTWARE_ONE_FIRM_SLUG,
      title: 'Jedna firma do wszystkiego',
      block: 'swPageHero',
      layout: softwareOneCompanyLayout,
    },
    count,
  )
}
