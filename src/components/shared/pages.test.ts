import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { SharedData } from '@/lib/shared/project'

import { AboutPage } from './AboutPage'
import { ContactPage } from './ContactPage'

// D2-4 (plan F3 pkt 4, spec §6.0–§6.2): the shared Kontakt and O firmie templates.
const HOURS = [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }]

const shared = {
  company: {
    name: 'PRO-KOM Tadeusz Wójciak',
    nip: '7352511447',
    email: 'biuro@example.pl',
    address: { street: 'ul. Orkana 16B', postalCode: '34-700', city: 'Rabka-Zdrój' },
    geo: null,
    hours: HOURS,
    holidays: [],
    mapsUrl: 'https://maps.google.com/?q=PRO-KOM',
    ceidgUrl: null,
    legal: {
      privacy: '/polityka-prywatnosci',
      cookies: '/cookies',
      accessibility: '/dostepnosc',
      sitemap: '/mapa-strony',
    },
    consent: { mode: 'checkbox', version: null, clause: null },
    recentlyViewed: false,
    serviceZones: [{ name: 'Podhale', towns: ['Nowy Targ'], note: null }],
  },
  line: {
    phone: '889 003 889',
    phone2: null,
    email: 'kontakt@prokombiznes.pl',
    footerDescription: null,
    contact: {
      h1: 'Zadzwoń albo wpadnij',
      routes: [{ title: 'Awaria', text: 'Coś nie działa', cta: 'Zgłoś', href: '#formularz' }],
      faq: [{ question: 'Czy jest parking?', answer: 'Tak.' }],
    },
    about: {
      h1: 'Lokalna firma IT',
      rules: [{ title: 'Jeden numer' }],
      steps: [{ title: 'Rozmowa' }],
      verify: [{ title: 'CEIDG', href: 'https://www.biznes.gov.pl/' }],
    },
  },
  lines: [
    { key: 'biznes', name: 'Biznes', kind: 'linia', url: 'https://prokombiznes.pl' },
    { key: 'software', name: 'Software', kind: 'linia', url: 'https://prokomsoftware.pl' },
  ],
  salons: [
    {
      key: 'rabka',
      name: 'Salon Rabka',
      street: 'ul. Orkana 16B',
      postalCode: '34-700',
      city: 'Rabka-Zdrój',
      geo: null,
      parkingNote: null,
      hours: HOURS,
    },
  ],
} as unknown as SharedData

const common = {
  shared,
  line: 'biznes' as const,
  origin: 'https://prokombiznes.pl',
}
const slot = (name: string) => createElement('p', { 'data-slot': name }, name)
const order = (markup: string, needles: string[]) => needles.map((n) => markup.indexOf(n))
const contact = (props: Partial<Parameters<typeof ContactPage>[0]> = {}) =>
  renderToStaticMarkup(
    createElement(ContactPage, {
      ...common,
      now: '2026-11-09T09:00:00Z',
      formToken: 't',
      ...props,
    }),
  )

describe('ContactPage (spec §6.1)', () => {
  it('puts every slot in its place, shared sections in the fixed order', () => {
    const markup = contact({
      slots: {
        heroAside: slot('heroAside'),
        afterRoutes: slot('afterRoutes'),
        formPrefill: slot('formPrefill'),
        afterForm: slot('afterForm'),
        beforeFaq: slot('beforeFaq'),
      },
    })
    const at = order(markup, [
      'id="kontakt-h1"',
      'data-slot="heroAside"',
      'id="z-czym-dzwonisz"',
      'data-slot="afterRoutes"',
      'id="formularz"',
      'data-slot="formPrefill"',
      'data-slot="afterForm"',
      'id="dojazd"',
      'id="inne-linie"',
      'data-slot="beforeFaq"',
      'id="pytania"',
    ])
    expect(at.every((index) => index >= 0)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
  })

  it('the optional sections switch off; the phone and JSON-LD come from the data', () => {
    const markup = contact({ showServiceArea: false, showOtherLines: false })
    expect(markup).not.toContain('id="dojazd"')
    expect(markup).not.toContain('id="inne-linie"')
    expect(markup).toContain('href="tel:+48889003889"')
    // Only the breadcrumbs: the Organization and LocalBusiness are the layout's (one @id each).
    expect(markup).toContain('"@type":"BreadcrumbList"')
    expect(markup).not.toContain('"@type":"LocalBusiness"')
  })

  it('the map and route show only on the office card (the drawing is the office)', () => {
    expect(contact()).toContain('data-address-map')
    const zakopane = { ...shared.salons[0]!, key: 'zakopane', city: 'Zakopane' }
    const other = {
      ...shared,
      salons: [...shared.salons, zakopane],
      line: { ...shared.line, contact: { ...shared.line.contact, salonKeys: ['zakopane'] } },
    } as SharedData
    const markup = contact({ shared: other })
    expect(markup).toContain('data-address-card')
    expect(markup).toContain('Zakopane')
    expect(markup).not.toContain('data-address-map')
  })

  it('the other lines leave out the current one', () => {
    const markup = contact()
    expect(markup).toContain('data-other-line="software"')
    expect(markup).not.toContain('data-other-line="biznes"')
  })
})

// Audit 08.11 §2 pkt 1: from 1400 px the content keeps clear of the side rail (`--rail-offset`).
const RAIL_PADDING = 'pl-[calc(32px+var(--rail-offset,0px))]'
const containers = (markup: string) =>
  [...markup.matchAll(/class="([^"]*max-w-\[1344px\][^"]*)"/g)].map((m) => m[1] ?? '')

describe('templates keep clear of the side rail (audit 08.11)', () => {
  it('every content container of Kontakt and O firmie carries the rail offset', () => {
    for (const markup of [
      contact(),
      renderToStaticMarkup(createElement(AboutPage, { ...common, siteEnv: 'local' })),
    ]) {
      const found = containers(markup)
      expect(found.length).toBeGreaterThan(3)
      expect(found.filter((c) => !c.includes(RAIL_PADDING))).toEqual([])
    }
  })

  it('the big phone number in the Kontakt hero never wraps (audit 08.11 §2 pkt 4)', () => {
    const big = /<a href="tel:[^"]*" class="([^"]*font-display[^"]*)"/.exec(contact())?.[1] ?? ''
    expect(big).toContain('whitespace-nowrap')
  })
})

describe('AboutPage (spec §6.2)', () => {
  const about = (props: Partial<Parameters<typeof AboutPage>[0]> = {}) =>
    renderToStaticMarkup(createElement(AboutPage, { ...common, siteEnv: 'local', ...props }))

  it('puts every slot in its place, shared sections in the fixed order', () => {
    const markup = about({
      slots: {
        afterStats: slot('afterStats'),
        afterRules: slot('afterRules'),
        afterSteps: slot('afterSteps'),
        beforeVisit: slot('beforeVisit'),
      },
    })
    const at = order(markup, [
      'id="o-firmie-h1"',
      'data-stats-strip',
      'data-slot="afterStats"',
      'id="dlaczego"',
      'data-slot="afterRules"',
      'id="wspolpraca"',
      'data-slot="afterSteps"',
      'id="linie"',
      'id="sprawdz"',
      'data-slot="beforeVisit"',
      'id="wizyta"',
    ])
    expect(at.every((index) => index >= 0)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
  })

  it('„Sprawdź nas” switches off; breadcrumbs data, no people', () => {
    const markup = about({ showVerify: false })
    expect(markup).not.toContain('id="sprawdz"')
    expect(markup).toContain('"@type":"BreadcrumbList"')
    // No „Ludzie” section and no photos (spec §6.2) — the only images are the line logos.
    expect(markup).not.toContain('Ludzie')
    const sources = [...markup.matchAll(/<img[^>]*src="([^"]*)"/g)].map((m) => m[1])
    expect(sources.every((src) => src?.startsWith('/brand/'))).toBe(true)
  })
})

// AUDYT-0811 #11–#13: the highlighted part of H1, contact data never cut, the card's top row.
describe('H1 highlight, contact facts, company card heading', () => {
  const withH1 = (h1: string) => ({
    ...shared,
    line: {
      ...shared.line,
      contact: { ...shared.line.contact, h1 },
      about: { ...shared.line.about, h1 },
    },
  })

  it('the part in **stars** becomes <em>; without stars the H1 is plain text', () => {
    const markup = renderToStaticMarkup(
      createElement(ContactPage, {
        ...common,
        shared: withH1('Porozmawiajmy o **Twoim projekcie.**') as SharedData,
        now: '2026-11-09T09:00:00Z',
        formToken: 't',
      }),
    )
    expect(markup).toMatch(/Porozmawiajmy o <em[^>]*data-heading-em[^>]*>Twoim projekcie\.<\/em>/)
    expect(markup).not.toContain('**')
    const plain = renderToStaticMarkup(
      createElement(AboutPage, {
        ...common,
        shared: withH1('Firma z Podhala') as SharedData,
        siteEnv: 'local',
      }),
    )
    expect(plain).toMatch(/<h1[^>]*>Firma z Podhala<\/h1>/)
  })

  it('a fact value may wrap anywhere (a long e-mail never gets cut off)', () => {
    const facts = [
      { icon: 'mail', label: 'E-mail', kind: 'email', value: 'kontakt@prokomsoftware.pl' },
    ]
    const markup = contact({
      shared: {
        ...shared,
        line: { ...shared.line, contact: { ...shared.line.contact, facts } },
      } as SharedData,
    })
    expect(markup).toMatch(
      /min-w-0 flex-col \[overflow-wrap:anywhere\][^]*kontakt@<wbr\/>prokomsoftware\.pl/,
    )
  })

  it('the company card shows the line’s heading row first', () => {
    const markup = renderToStaticMarkup(
      createElement(AboutPage, {
        ...common,
        siteEnv: 'local',
        cardHeading: createElement('p', { 'data-card-heading': '' }, 'Wizytówka firmy'),
      }),
    )
    expect(markup).toMatch(/data-company-card[^>]*><p data-card-heading="">Wizytówka firmy<\/p><dl/)
  })
})

describe('H2 highlight only for a line that asks for it (AUDYT-0911 #1)', () => {
  const about = (props: Partial<Parameters<typeof AboutPage>[0]> = {}) =>
    renderToStaticMarkup(createElement(AboutPage, { ...common, siteEnv: 'local', ...props }))

  it('without headingEmClass the H2s are plain text, stars never leak', () => {
    for (const markup of [contact(), about()]) {
      expect(markup).not.toContain('**')
      expect(markup).not.toMatch(/<h2[^>]*>[^<]*<em/)
    }
    expect(contact()).toContain('>Z czym dzwonisz?</h2>')
  })

  it('with headingEmClass the chosen word becomes <em class=…>', () => {
    expect(contact({ headingEmClass: 'sw-em' })).toContain(
      'Z czym <em class="sw-em">dzwonisz?</em></h2>',
    )
    expect(about({ headingEmClass: 'sw-em' })).toMatch(
      /<em class="sw-em">PRO-KOM( Gaming)?<\/em><\/h2>/,
    )
  })

  it('a panel map title with **stars**: <em> only for the line with its class', () => {
    const withTitle = {
      shared: {
        ...shared,
        line: {
          ...shared.line,
          contact: { ...shared.line.contact, mapTitle: 'Kawa **w Rabce.**' },
        },
      } as SharedData,
    }
    expect(contact(withTitle)).toContain('>Kawa w Rabce.</h2>')
    expect(contact({ ...withTitle, headingEmClass: 'sw-em' })).toContain(
      'Kawa <em class="sw-em">w Rabce.</em></h2>',
    )
  })
})
