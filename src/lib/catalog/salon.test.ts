import { describe, expect, it } from 'vitest'

import type { Partner, Showroom } from '@/payload-types'

import type { IndexProduct } from './catalogIndex'
import { buildSalonView, salonFacts, salonTitle } from './salon'

const T = 1
const OTHER = 2

const product = (slug: string, tenant = T) => ({ slug, tenant }) as never

const indexed = (slug: string): IndexProduct =>
  ({
    slug,
    name: `Nazwa ${slug}`,
    brand: 'posnet',
    hay: slug,
    image: { url: `/${slug}.webp`, alt: slug, width: 480, height: 480 },
  }) as IndexProduct

const listed = ['ergo', 'bingo', 'neo', 'hx', 'srvkas'].map(indexed)

const partner = (fields: Partial<Partner> = {}): Partner =>
  ({
    id: 10,
    name: 'Posnet',
    slug: 'posnet',
    website: 'https://www.posnet.com.pl',
    partnerStatus: 'authorized-service',
    tenants: [T],
    brandPage: { shortDescription: 'Kasy i drukarki fiskalne' },
    ...fields,
  }) as Partner

const showroom = (fields: Partial<Showroom> = {}): Showroom =>
  ({
    id: 1,
    tenant: T,
    name: 'Posnet',
    slug: 'posnet',
    brands: [partner()],
    pill: 'Autoryzowany serwis Posnet · Rabka-Zdrój',
    h1a: 'Kasy i drukarki Posnet.',
    h1b: 'Z serwisem na miejscu.',
    lead: 'Polski producent.',
    hero: [{ product: product('ergo') }, { product: product('ukryta') }],
    heroCard: { title: 'Kupujesz kasę', items: [{ title: 'Fiskalizacja', text: 'z dokumentami' }] },
    facts: [{ value: '1993', label: 'na rynku' }],
    plans: {
      eyebrow: null,
      title: 'Która kasa Posnet?',
      items: [
        {
          name: 'Ergo',
          audience: 'Mały punkt',
          product: product('ergo'),
          features: ['0,6 kg'],
          tag: 'polecamy na start',
        },
        { name: 'Bingo', product: product('bingo'), features: [], tag: 'najwygodniejszy' },
        { name: 'HX', product: product('hx'), alt: true },
        { name: 'Inna', product: product('neo', OTHER) },
      ],
    },
    compare: {
      title: 'Porównanie kas',
      columns: ['Ergo', 'Bingo'],
      rows: [
        { label: 'Przenośna', values: ['1', '0'] },
        { label: 'Kasjerzy', values: ['16', '35'] },
      ],
    },
    family: [
      { title: 'Kasy', products: [product('ergo'), product('neo'), product('ukryta')] },
      { title: 'Puste', products: [product('ukryta')] },
      { title: 'Drukarki', products: [product('hx'), product('ergo')] },
    ],
    chooser: {
      question: 'Jak sprzedajesz?',
      options: [{ label: 'Mały punkt', products: [product('ergo')], why: 'Lekka kasa.' }],
    },
    service: { title: 'Serwis', items: [{ title: 'Naprawy' }], products: [product('srvkas')] },
    rollout: { title: 'Wdrożenie', steps: [{ title: 'Dobór' }], button: 'Zapytaj o kasę' },
    about: [{ text: 'Pierwszy akapit.' }, { text: 'Drugi akapit.' }],
    brandFacts: [
      { label: 'Rok', value: '1993', sourceUrl: 'https://www.posnet.com.pl/o-firmie' },
      { label: 'Siedziba', value: 'Warszawa', sourceUrl: 'https://posnet.com.pl/kontakt' },
      { label: 'Zły', value: 'x', sourceUrl: 'http://posnet.com.pl' },
    ],
    faq: [{ question: 'Czy?', answer: 'Tak.' }],
    headings: {},
    ...fields,
  }) as Showroom

const build = (doc: Showroom = showroom()) => buildSalonView(doc, T, listed)

describe('buildSalonView', () => {
  it('returns null for another site and keeps only listed products of this site', () => {
    expect(buildSalonView(showroom({ tenant: OTHER }), T, listed)).toBeNull()
    const view = build()!
    expect(view.hero.map((item) => item.product.slug)).toEqual(['ergo'])
    expect(view.plans!.main.map((card) => card.name)).toEqual(['Ergo', 'Bingo', 'Inna'])
    expect(view.plans!.main[2]!.product).toBeNull()
    expect(view.plans!.alt.map((card) => card.name)).toEqual(['HX'])
  })

  it('shows only the allowed tag („polecamy na start”)', () => {
    const [ergo, bingo] = build()!.plans!.main
    expect(ergo!.tag).toBe('polecamy na start')
    expect(bingo!.tag).toBeNull()
  })

  it('drops empty blocks: no plans, chooser, service, rollout, compare, about or faq', () => {
    const view = build(
      showroom({
        plans: { items: [] },
        compare: { columns: [], rows: [] },
        family: [],
        chooser: { options: [] },
        service: { items: [] },
        rollout: { steps: [] },
        about: [],
        brandFacts: [],
        faq: [],
        heroCard: { items: [] },
      }),
    )!
    expect(view).toMatchObject({
      plans: null,
      compare: null,
      family: [],
      chooser: null,
      service: null,
      rollout: null,
      about: null,
      faq: [],
      heroCard: null,
    })
  })

  it('reads compare cells: 1 → yes, 0 → no, the rest as text', () => {
    expect(build()!.compare!.rows).toEqual([
      { label: 'Przenośna', cells: [{ kind: 'yes' }, { kind: 'no' }] },
      {
        label: 'Kasjerzy',
        cells: [
          { kind: 'text', text: '16' },
          { kind: 'text', text: '35' },
        ],
      },
    ])
  })

  it('keeps family tabs with listed products and counts each product once', () => {
    const view = build()!
    expect(view.family.map((tab) => [tab.title, tab.products.map((p) => p.slug)])).toEqual([
      ['Kasy', ['ergo', 'neo']],
      ['Drukarki', ['hx', 'ergo']],
    ])
    expect(view.familyCount).toBe(3)
  })

  it('takes the service product for „Zgłoś do serwisu” and sources from https facts, once per host', () => {
    const view = build()!
    expect(view.service!.product?.slug).toBe('srvkas')
    expect(view.about!.sources).toEqual([
      { host: 'posnet.com.pl', url: 'https://www.posnet.com.pl/o-firmie' },
    ])
    expect(view.about!.facts.map((fact) => fact.sourceUrl)).toEqual([
      'https://www.posnet.com.pl/o-firmie',
      'https://posnet.com.pl/kontakt',
      null,
    ])
  })

  it('names the headings after the brand, or neutrally for a salon of several brands', () => {
    expect(build()!.headings).toEqual({
      offer: 'Oferta Posnet',
      facts: 'O marce Posnet',
      faq: 'Pytania o Posnet',
      ask: 'Zapytaj o Posnet',
      more: 'Więcej o marce Posnet',
    })
    const druk = build(
      showroom({
        name: 'Druk w biurze',
        brands: [partner(), partner({ id: 11, name: 'Kyocera', slug: 'kyocera' })],
        headings: { faq: 'Pytania o druk' },
      }),
    )!
    expect(druk.headings).toEqual({
      offer: 'Oferta',
      facts: 'O markach',
      faq: 'Pytania o druk',
      ask: 'Zapytaj o ofertę',
      more: 'Więcej o markach',
    })
  })

  it('leaves out brands of another site', () => {
    const view = build(showroom({ brands: [partner(), partner({ id: 12, tenants: [OTHER] })] }))!
    expect(view.brands.map((brand) => brand.id)).toEqual([10])
  })
})

describe('salonTitle', () => {
  it('joins the H1 halves and cuts at 60 characters on a word', () => {
    expect(salonTitle('Kasy i drukarki Posnet.', 'Z serwisem na miejscu.')).toBe(
      'Kasy i drukarki Posnet. Z serwisem na miejscu.',
    )
    expect(salonTitle('a'.repeat(30), 'bardzo długi drugi człon tytułu salonu marki')).toBe(
      `${'a'.repeat(30)} bardzo długi drugi człon…`,
    )
  })
})

describe('salonFacts (K4-FINAL §4.4: counts from the catalog)', () => {
  const facts = [
    { value: '44 pozycje', label: 'w ofercie' },
    { value: '16 modeli', label: 'niszczarek' },
    { value: '17 serii', label: 'w salonie' },
    { value: '1993', label: 'na rynku' },
    { value: ' ', label: 'pusty' },
  ]

  it('replaces a typed count with the count of listed products, with Polish forms', () => {
    expect(salonFacts(facts, { products: 5, series: 2 })).toEqual([
      { value: '5 pozycji', label: 'w ofercie' },
      { value: '5 modeli', label: 'niszczarek' },
      { value: '2 serie', label: 'w salonie' },
      { value: '1993', label: 'na rynku' },
    ])
    expect(salonFacts(facts, { products: 1, series: 1 }).map((fact) => fact.value)).toEqual([
      '1 pozycja',
      '1 model',
      '1 seria',
      '1993',
    ])
  })

  it('leaves a count fact out when nothing is listed', () => {
    expect(salonFacts(facts, { products: 0, series: 0 })).toEqual([
      { value: '1993', label: 'na rynku' },
    ])
  })
})

describe('buildSalonView headings', () => {
  it('binds one-letter words in the H1 and the headings from the data', () => {
    const view = build(
      showroom({
        facts: [{ value: '3 pozycje', label: 'w ofercie' }],
        headings: { faq: 'Pytania o druk' },
      }),
    )!
    expect(view.h1a).toBe('Kasy i drukarki Posnet.')
    expect(view.headings.faq).toBe('Pytania o druk')
    // The count of the brand's listed products (all five fixtures are Posnet).
    expect(view.facts).toEqual([{ value: '5 pozycji', label: 'w ofercie' }])
  })
})
