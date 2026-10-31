import { describe, expect, it } from 'vitest'

import {
  careLevelFromParam,
  levelSlug,
  type ProjectSolution,
  summarizeProject,
} from './projectSummary'

const NBSP = String.fromCharCode(0xa0)
const nb = (text: string) => text.replace(/ /g, NBSP)

const site: ProjectSolution = {
  slug: 'strona-firmowa-z-panelem',
  name: 'Strona firmowa z panelem',
  category: 'strony',
  priceFrom: 2490,
  priceMonthly: false,
  leadTime: 'od 2 tygodni',
  thumbnail: '/software/rozwiazania/strona-firmowa-z-panelem.svg',
  levels: [],
}
const crm: ProjectSolution = {
  ...site,
  slug: 'crm-dla-malej-i-sredniej-firmy',
  name: 'CRM dla małej i średniej firmy',
  category: 'systemy',
  priceFrom: 3490,
  leadTime: 'od 3 tygodni',
}
const app: ProjectSolution = {
  ...site,
  slug: 'aplikacja-dla-ekip-w-terenie',
  name: 'Aplikacja dla ekip w terenie',
  category: 'aplikacje',
  priceFrom: null,
  leadTime: null,
}
const care: ProjectSolution = {
  ...site,
  slug: 'opieka-nad-strona-i-systemem',
  name: 'Opieka nad stroną i systemem',
  category: 'opieka',
  priceFrom: 149,
  priceMonthly: true,
  leadTime: null,
  levels: [
    { name: 'Podstawowa', price: 149, recommended: false },
    { name: 'Rozszerzona', price: 299, recommended: true },
    { name: 'Systemy', price: 790, recommended: false },
  ],
}
const audit: ProjectSolution = {
  ...site,
  slug: 'audyt-strony-lub-programu',
  name: 'Audyt strony lub programu',
  category: 'opieka',
  priceFrom: 0,
  leadTime: '2 dni robocze',
  levels: [
    { name: 'Szybki', price: 0, recommended: false },
    { name: 'Pełny', price: 990, recommended: true },
    { name: 'Strona + program albo dostępność', price: 1990, recommended: false },
  ],
}
const solutions = [site, crm, app, care, audit]

describe('„Twój projekt” on /kontakt (spec. §6.10, ZMIANY-v21 §10.6, §11.2)', () => {
  it('shows one item with its „od” price and term, summed as „Cena (netto)”', () => {
    const summary = summarizeProject([{ id: site.slug, name: site.name }], solutions)
    expect(summary.rows).toEqual([
      {
        id: site.slug,
        name: 'Strona firmowa z panelem',
        sub: `termin ${nb('od 2 tygodni')}`,
        price: nb('od 2 490 zł'),
        ask: false,
        thumbnail: site.thumbnail,
        tone: 'www',
        label: 'Strona firmowa z panelem',
      },
    ])
    expect(summary.sumLabel).toBe('Cena (netto)')
    expect(summary.sum).toBe(nb('od 2 490 zł'))
    expect(summary.note).toBe(
      'Lista pójdzie razem ze zgłoszeniem. Dokładną cenę i termin dostaniesz na piśmie w 5–7 dni.',
    )
    expect(summary.slugs).toEqual([site.slug])
    expect(summary.topic).toBe('strona')
  })

  it('sums one-off prices; care goes apart per month with the level price from its name', () => {
    const summary = summarizeProject(
      [
        { id: site.slug, name: site.name },
        { id: crm.slug, name: crm.name },
        { id: care.slug, name: 'Opieka nad stroną i systemem · poziom Rozszerzona' },
      ],
      solutions,
    )
    expect(summary.rows[2]).toMatchObject({
      price: nb('299 zł/mies.'),
      sub: 'poziom Rozszerzona',
      label: 'Opieka nad stroną i systemem · Rozszerzona',
    })
    expect(summary.sumLabel).toBe('Razem (netto)')
    expect(summary.sum).toBe(`${nb('od 5 980 zł')} + ${nb('299 zł/mies.')}`)
  })

  it('never reads a price from the name: an unknown level is „od” the lowest price', () => {
    const summary = summarizeProject(
      [{ id: care.slug, name: 'Opieka nad stroną i systemem · 999 zł' }],
      solutions,
    )
    expect(summary.rows[0]).toMatchObject({
      price: nb('od 149 zł/mies.'),
      sub: 'poziom opieki dobierzemy razem',
    })
    expect(summary.sum).toBe(nb('od 149 zł/mies.'))
    expect(summary.topic).toBe('opieka')
  })

  it('gives the audit its own topic and the free level „0 zł”', () => {
    const summary = summarizeProject(
      [{ id: audit.slug, name: 'Audyt strony lub programu · Szybki' }],
      solutions,
    )
    expect(summary.rows[0]).toMatchObject({ price: nb('0 zł'), sub: 'Szybki' })
    expect(summary.topic).toBe('audyt')
  })

  it('prices apps „po rozmowie” and says so in the note', () => {
    const summary = summarizeProject(
      [
        { id: app.slug, name: app.name },
        { id: crm.slug, name: crm.name },
      ],
      solutions,
    )
    expect(summary.rows[0]).toMatchObject({
      price: 'po rozmowie',
      sub: 'wycena po krótkiej rozmowie',
      ask: true,
    })
    expect(summary.sum).toBe(nb('od 3 490 zł'))
    expect(summary.note).toMatch(/^Jedna pozycja jest wyceniana po krótkiej rozmowie\. /)
    expect(summary.topic).toBe('mobile')
  })

  it('shows an item no longer offered „do wyceny”, but never sends it', () => {
    const summary = summarizeProject(
      [
        { id: 'stary-modul', name: 'Stary moduł' },
        { id: app.slug, name: app.name },
      ],
      solutions,
    )
    expect(summary.rows[0]).toMatchObject({ price: 'do wyceny', sub: 'do omówienia', ask: true })
    expect(summary.slugs).toEqual([app.slug])
    expect(summary.sum).toBe('po rozmowie')
    expect(summary.note).toMatch(/^Część pozycji wyceniamy po krótkiej rozmowie\. /)
    expect(summary.topic).toBe('mobile')
  })

  it('is empty for an empty list', () => {
    expect(summarizeProject([], solutions)).toMatchObject({ rows: [], slugs: [], topic: null })
  })
})

describe('?poziom= from the price list (spec. §6.4, §6.10)', () => {
  it('names the care level by its address', () => {
    expect(levelSlug('Rozszerzona')).toBe('rozszerzona')
    expect(levelSlug('Strona + program albo dostępność')).toBe('strona-program-albo-dostepnosc')
    expect(careLevelFromParam('rozszerzona', solutions)).toBe('Rozszerzona')
    expect(careLevelFromParam('systemy', solutions)).toBe('Systemy')
  })

  it('ignores an unknown or missing level', () => {
    expect(careLevelFromParam('pelny', solutions)).toBeNull()
    expect(careLevelFromParam(undefined, solutions)).toBeNull()
    expect(careLevelFromParam(['rozszerzona'], solutions)).toBe('Rozszerzona')
  })
})
