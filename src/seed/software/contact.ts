import type { Payload } from 'payload'

import type { Page } from '../../payload-types'

type Block = NonNullable<Page['layout']>[number]
type ContactPageBlock = Extract<Block, { blockType: 'swContactPage' }>
type FaqBlock = Extract<Block, { blockType: 'faq' }>

export const SOFTWARE_CONTACT_SLUG = 'kontakt'

/** Hints under the description, per topic (board `Kontakt`, `PHM` / `PHD`). */
const HINTS: Record<string, string[]> = {
  none: [
    'Nie mamy strony',
    'Wszystko w Excelu',
    'Program nie ma tej funkcji',
    'Informatyk zniknął',
  ],
  strona: [
    'Nie mamy strony',
    'Strona jest stara i wolna',
    'Chcę sam zmieniać treści',
    'Mało zapytań z Google',
  ],
  system: [
    'Wszystko w Excelu',
    'Zlecenia idą SMS-em',
    'Gubią się zapytania',
    'Rozliczenia zajmują dni',
  ],
  mobile: ['Aplikacja dla ekip', 'Nie ma zasięgu na budowie', 'Aplikacja dla klientów'],
  laczenie: [
    'Program nie ma tej funkcji',
    'Przepisujemy dane ręcznie',
    'Dwa programy się nie dogadują',
  ],
  opieka: ['Informatyk zniknął', 'Nie mamy dostępów', 'Strona nie działa'],
  audyt: ['Czemu nikt nie dzwoni ze strony?', 'Strona wolno działa', 'Nie ma nas w Google'],
  all: ['Nie wiem, od czego zacząć'],
}

/**
 * `/kontakt` of the Software line (spec. §6.10) — texts of the board `Kontakt` (v21). Facts in
 * brackets are filled from the line's settings; a sentence with an empty fact (the Zakopane
 * address) is hidden on production.
 */
export const SW_CONTACT_PAGE: ContactPageBlock = {
  blockType: 'swContactPage',
  eyebrow: 'Kontakt · Rabka-Zdrój · Zakopane · online',
  title: 'Napisz, zadzwoń albo wpadnij.',
  titleAccent: 'Odpowiemy z konkretem.',
  lead: 'Nie musisz znać technologii ani mieć specyfikacji. Napisz kilka zdań po swojemu, a w 1 dzień roboczy odezwie się osoba, która potem buduje Twój projekt.',
  hoursNote: 'formularz działa całą dobę',
  channels: [
    { kind: 'phone', label: 'Zadzwoń', badge: 'Najszybciej', text: '[GODZINY]' },
    { kind: 'email', label: 'Napisz', text: 'odpowiedź w ciągu [CZAS ODPOWIEDZI]' },
    {
      kind: 'salon',
      label: 'Przyjdź do salonu',
      value: 'Rabka-Zdrój, ul. Orkana 16B',
      text: 'albo Zakopane · [ADRES SALONU W ZAKOPANEM]',
      href: '/kontakt#gdzie',
    },
    {
      kind: 'online',
      label: 'Porozmawiajmy online',
      value: 'Wideorozmowa 30 min',
      text: 'z dowolnego miejsca w Polsce',
      href: '/kontakt#formularz',
    },
  ],
  stepsTitle: 'Co dalej po wysłaniu',
  steps: [
    {
      when: '1 dzień roboczy',
      title: 'Odpowiadamy',
      text: 'Oddzwaniamy albo odpisujemy, jak wolisz. Dopytamy o to, czego brakuje w opisie.',
    },
    {
      when: '30 minut',
      title: 'Krótka rozmowa',
      text: 'U Ciebie w firmie, w salonie w Rabce lub w Zakopanem albo online.',
    },
    {
      when: '5–7 dni',
      title: 'Podgląd i wycena na piśmie',
      text: 'Szkic do klikania, zakres, cena i termin. Wycena ważna 30 dni.',
    },
    {
      when: 'Ty decydujesz',
      title: 'Bez zobowiązań',
      text: 'Płacisz dopiero po podpisaniu umowy: [ZALICZKA] zaliczki, reszta po odbiorze albo po etapach.',
    },
  ],
  shortcuts: [
    {
      icon: 'wand',
      title: 'Wolisz kliknąć niż pisać?',
      text: 'Dobierz rozwiązanie w 60 sekund. Cena od razu.',
      href: '/dobierz',
    },
    {
      icon: 'search',
      title: 'Masz już stronę?',
      text: 'Darmowy audyt, raport w [CZAS].',
      href: '/audyt',
    },
  ],
  formEyebrow: 'Formularz',
  formTitle: 'Opisz, co chcesz usprawnić.',
  topicsLabel: 'Czego dotyczy sprawa?',
  messageLabel: 'Opisz krótko, po swojemu',
  messagePlaceholder: 'np. Mamy 3 ekipy, zlecenia idą SMS-em, a protokoły piszemy na kartkach…',
  projectMessageLabel: 'Dodaj kilka słów o firmie (opcjonalnie)',
  projectMessagePlaceholder: 'np. Mamy pensjonat na 12 pokoi, chcemy ruszyć przed sezonem…',
  hintsLabel: 'Podpowiedź:',
  hints: Object.entries(HINTS).flatMap(([topic, texts]) =>
    texts.map((text) => ({
      topic: topic as NonNullable<ContactPageBlock['hints']>[number]['topic'],
      text,
    })),
  ),
  nameLabel: 'Imię i firma',
  namePlaceholder: 'Anna, Twoja Firma',
  contactLabel: 'Telefon albo e-mail',
  contactPlaceholder: 'jak mamy się odezwać?',
  contactHint: 'Telefon albo e-mail, jak wolisz.',
  talkLabel: 'Jak wolisz rozmawiać?',
  submit: 'Wyślij zgłoszenie',
  submitNote: 'Odpowiemy w [CZAS ODPOWIEDZI]. Dane tylko do tej sprawy, bez newslettera.',
  linesEyebrow: 'Inne linie PRO-KOM',
  linesTitle: 'Potrzebujesz czegoś innego niż oprogramowanie?',
  linesText:
    'PRO-KOM to nie tylko Software. Sprzęt, kasy, instalacje i serwis zrobi ta sama firma, z tym samym numerem NIP i tą samą odpowiedzialnością.',
  lines: [
    {
      line: 'biznes',
      label: 'BIZNES',
      text: 'Kasy fiskalne, GoPOS, programy InsERT, opieka IT i sprzęt dla firm.',
      linkLabel: 'prokombiznes.pl',
      href: 'https://prokombiznes.pl',
    },
    {
      line: 'instalacje',
      label: 'INSTALACJE',
      text: 'Monitoring, sieci, smart home i nagłośnienie.',
      linkLabel: 'prokominstalacje.pl',
      href: 'https://prokominstalacje.pl',
    },
    {
      line: 'tech',
      label: 'TECH',
      text: 'Serwis komputerów, laptopów i telefonów.',
      linkLabel: 'prokomserwis.pl',
      href: 'https://prokomserwis.pl',
    },
    {
      line: 'zakopane',
      label: 'ZAKOPANE',
      text: 'Salon PRO-KOM w Zakopanem.',
      linkLabel: 'Gdzie nas znaleźć',
      href: '/kontakt#gdzie',
    },
    {
      line: 'prokom',
      label: 'GŁÓWNA',
      text: 'Wszystkie linie PRO-KOM w jednym miejscu. Od 2004 r. w Rabce-Zdroju i Zakopanem.',
      linkLabel: 'pro-kom.eu',
      href: 'https://pro-kom.eu',
    },
  ],
  linesMore: { label: 'Jedna firma do wszystkiego: jak to działa', href: '/jedna-firma' },
  meetEyebrow: 'Gdzie się spotkamy',
  meetTitle: 'U nas, u Ciebie albo online.',
  places: [
    { title: 'Rabka-Zdrój', text: 'salon · ul. Orkana 16B · [GODZINY]' },
    { title: 'Zakopane', text: 'salon · [ADRES SALONU W ZAKOPANEM]' },
    { title: 'U Ciebie w firmie', text: 'na Podhalu i w Małopolsce, dojeżdżamy' },
    { title: 'Online', text: 'wideorozmowa, z całej Polski' },
  ],
  mapCaption: 'Mapa Google',
  navigateLabel: 'Nawiguj',
  mapHref: 'https://www.google.com/maps/search/?api=1&query=ul.+Orkana+16B+34-700+Rabka-Zdr%C3%B3j',
  companyTitle: 'Dane firmy',
  companyNote: 'od 2004 r.',
}

/** FAQ of `/kontakt` (board `Kontakt`, 4 questions) — the shared `faq` block, Software look. */
export const SW_CONTACT_FAQ: FaqBlock = {
  blockType: 'faq',
  eyebrow: 'Zanim napiszesz',
  heading: 'Pytania o kontakt',
  lead: 'Nie ma Twojego pytania? Wpisz je w formularzu, odpowiemy konkretnie.',
  items: [
    {
      question: 'Czy rozmowa i wycena coś kosztują?',
      answer:
        'Nie. Pierwsza rozmowa, podgląd i wycena na piśmie są bez zobowiązań. Płacisz dopiero po podpisaniu umowy: 30% zaliczki, reszta po odbiorze strony albo w ratach po etapach systemu.',
    },
    {
      question: 'Nie wiem dokładnie, czego potrzebuję. Czy to problem?',
      answer:
        'Nie. Opisz po swojemu, co dziś zabiera Ci czas albo pieniądze. Resztę dobierzemy razem, a jeśli gotowy program wystarczy, powiemy to wprost.',
    },
    {
      question: 'Pracujecie tylko na Podhalu?',
      answer:
        'Spotykamy się w Rabce-Zdroju, w Zakopanem albo u Ciebie w firmie. Zdalnie pracujemy z firmami z całej Polski.',
    },
    {
      question: 'Co przygotować na rozmowę?',
      answer:
        'Wystarczy to, co masz: adres obecnej strony, przykładowy dokument albo arkusz, listę osób, które będą korzystać. Specyfikacja nie jest potrzebna.',
    },
  ],
}

export function softwareContactLayout(): Block[] {
  return [structuredClone(SW_CONTACT_PAGE), structuredClone(SW_CONTACT_FAQ)]
}

/**
 * The layout to save, or `null` when nothing changes: a page without `swContactPage` (the
 * generic sample page of `pnpm seed`) gets the Software layout; once the block is there the
 * page belongs to the panel.
 */
export function softwareContactUpdate(layout: Page['layout']): Block[] | null {
  return (layout ?? []).some((block) => block.blockType === 'swContactPage')
    ? null
    : softwareContactLayout()
}

type Count = (name: string, result: boolean | 'updated') => void
const local = { overrideAccess: true, context: { seed: true }, depth: 0 } as const

/** Creates the published `/kontakt` of the tenant, or replaces the sample page with it. */
export async function seedSoftwareContact(payload: Payload, tenantId: number, count: Count) {
  const {
    docs: [page],
  } = await payload.find({
    collection: 'pages',
    where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: SOFTWARE_CONTACT_SLUG } }] },
    limit: 1,
    ...local,
  })
  if (!page) {
    await payload.create({
      collection: 'pages',
      data: {
        tenant: tenantId,
        title: 'Kontakt',
        slug: SOFTWARE_CONTACT_SLUG,
        layout: softwareContactLayout(),
        _status: 'published',
      },
      ...local,
    })
    count('pages kontakt', true)
    return
  }
  const layout = softwareContactUpdate(page.layout)
  count('pages kontakt', layout ? 'updated' : false)
  if (!layout) return
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { layout, _status: 'published' },
    ...local,
  })
}
