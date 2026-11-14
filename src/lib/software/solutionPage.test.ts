import { describe, expect, it } from 'vitest'

import ikony from '../../../seed/prokomsoftware/ikony.json'
import demo from '../../../seed/prokomsoftware/demo-aplikacja-ekip.json'
import okno from '../../../seed/prokomsoftware/okno-oferty.json'
import { solutionData, solutionsToImport } from '../../seed/software/map'
import { FIELD_CREW_PAGE, FIELD_CREW_SLUG } from '../../seed/software/solutionPages'
import { SOLUTION_PAGE_TEXTS, type SolutionPageText } from '../../seed/software/solutionPageTexts'
import { isIconName } from '../catalog/options'
import {
  buildOfferView,
  type OfferSolution,
  offerSolutionOf,
  type OfferSolutionDoc,
  priceLine,
  softwareOfferSchema,
} from './offer'
import {
  buildSolutionPage,
  type SolutionPageDoc,
  solutionDemoSchema,
  validateSolutionDemo,
} from './solutionPage'
import { richDescription } from './meta'
import { DEFAULT_PRICE_DISPLAY } from './solutionsIndex'

const offer = softwareOfferSchema.parse(okno)
const display = DEFAULT_PRICE_DISPLAY
const seeded = new Map(solutionsToImport().map((item) => [item.slug, solutionData(item)]))

function pageOf(slug: string, page?: SolutionPageDoc | null) {
  const data = seeded.get(slug)
  if (!data) throw new Error(`no ${slug}`)
  const solution: OfferSolution = offerSolutionOf(data as OfferSolutionDoc)
  const view = buildOfferView(solution, {
    offer,
    display,
    related: [],
    fill: (text, term) => text.replace('{termin}', term ?? ''),
  })
  return buildSolutionPage({
    view,
    page: page === undefined ? ((data.page as SolutionPageDoc | undefined) ?? null) : page,
    priceFrom: solution.priceFrom,
    price: priceLine(solution, display),
    moreExamples: solution.moreExamples,
    isIcon: isIconName,
  })
}

describe('Solutions.page.demo schema', () => {
  it('accepts the demo of the seed', () => {
    expect(validateSolutionDemo(FIELD_CREW_PAGE.demo)).toBe(true)
    expect(validateSolutionDemo(null)).toBe(true)
  })

  it('takes steps and tasks from the package 1:1', () => {
    const parsed = solutionDemoSchema.parse(FIELD_CREW_PAGE.demo)
    expect(parsed.steps).toEqual(demo.steps)
    expect(parsed.tasks).toEqual(demo.tasks)
  })

  it('rejects a demo with three steps, with a readable message', () => {
    const broken = { ...FIELD_CREW_PAGE.demo, steps: demo.steps.slice(0, 3) }
    expect(validateSolutionDemo(broken)).toMatch(/^Demo telefonu: steps/)
  })

  it('rejects an unknown kind', () => {
    expect(validateSolutionDemo({ ...FIELD_CREW_PAGE.demo, kind: 'shop' })).not.toBe(true)
  })
})

describe('seed of the solution pages', () => {
  it('writes the page tab for the field crew app and the pages with their texts (SEO etap 2b)', () => {
    const withPage = [...seeded].filter(([, data]) => data.page).map(([slug]) => slug)
    expect(new Set(withPage)).toEqual(
      new Set([FIELD_CREW_SLUG, ...Object.keys(SOLUTION_PAGE_TEXTS)]),
    )
  })

  it('fits the limits of the panel fields (`collections/solutionPage.ts`)', () => {
    const over: string[] = []
    const check = (slug: string, field: string, text: string, max: number) => {
      if (text.length > max) over.push(`${slug} ${field}: ${text.length} > ${max}`)
    }
    for (const [slug, text] of Object.entries(SOLUTION_PAGE_TEXTS)) {
      check(slug, 'eyebrow', text.eyebrow, 90)
      check(slug, 'title', text.title, 90)
      check(slug, 'titleAccent', text.titleAccent, 60)
      check(slug, 'lead', text.lead, 400)
      for (const item of text.compare) {
        check(slug, 'compare.label', item.label, 40)
        check(slug, 'compare.title', item.title, 120)
        check(slug, 'compare.text', item.text, 300)
      }
      check(slug, 'deliverablesTitle', text.deliverablesTitle, 60)
      check(slug, 'faqEyebrow', text.faqEyebrow, 40)
      for (const item of text.faq) {
        check(slug, 'faq.q', item.q, 120)
        check(slug, 'faq.a', item.a, 600)
      }
      check(slug, 'contact.eyebrow', text.contact.eyebrow, 60)
      check(slug, 'contact.title', text.contact.title, 120)
      check(slug, 'contact.lead', text.contact.lead, 300)
      check(slug, 'contact.quoteCaption', text.contact.quoteCaption, 90)
    }
    expect(over).toEqual([])
  })

  it('uses the lead as a whole meta description: 120–155 characters, never cut with „…”', () => {
    for (const [slug, text] of Object.entries(SOLUTION_PAGE_TEXTS)) {
      expect(text.lead.length, slug).toBeGreaterThanOrEqual(120)
      expect(richDescription(text.lead, { priced: true }), slug).not.toMatch(/…$/)
    }
  })

  it('promises nothing the copy budget forbids', () => {
    const all = JSON.stringify(SOLUTION_PAGE_TEXTS)
    expect(all).not.toMatch(/na piśmie|co boli|zapłacisz|robi się samo|Zakopan|zadat/i)
  })

  it('gives every page its own words: no sentence of 6+ words on two pages', () => {
    const owner = new Map<string, string>()
    const pages: [string, SolutionPageText][] = [
      [FIELD_CREW_SLUG, FIELD_CREW_PAGE as unknown as SolutionPageText],
      ...Object.entries(SOLUTION_PAGE_TEXTS),
    ]
    for (const [slug, text] of pages) {
      const parts = [
        text.lead,
        ...text.compare.map((item) => `${item.title}. ${item.text}`),
        ...text.faq.map((item) => item.a),
      ]
      for (const part of parts) {
        for (const sentence of part.split(/(?<=[.!?])\s+/)) {
          const clean = sentence.trim().toLowerCase()
          if (clean.split(/\s+/).length < 6) continue
          const first = owner.get(clean)
          expect(first === undefined || first === slug, `${slug}: „${sentence}”`).toBe(true)
          owner.set(clean, slug)
        }
      }
    }
  })

  it('keeps the drawings of the package where ikony.json has them', () => {
    const icons = ikony.icons as Record<string, string>
    const page = seeded.get(FIELD_CREW_SLUG)!.page!
    demo.included.forEach(([title, , path], i) => {
      const icon = page.deliverables?.[i]?.icon
      expect(page.deliverables?.[i]?.title).toBe(title)
      expect(icon && isIconName(icon)).toBe(true)
      // „Szkolenie ekip” is drawn differently in the package: the shared `users` icon stays.
      if (title !== 'Szkolenie ekip') expect(icons[icon!]).toBe(path)
    })
  })

  it('puts the extras of the demo into „Wyceniane osobno” (moreExamples)', () => {
    expect(seeded.get(FIELD_CREW_SLUG)!.moreExamples).toEqual(demo.extra)
  })
})

describe('full solution page (board Rozwiazanie, field crew app)', () => {
  const page = pageOf(FIELD_CREW_SLUG)

  it('has the H1 with its accent and the eyebrow of the board', () => {
    expect(page.title).toEqual({
      plain: 'Aplikacja dla ekip w terenie.',
      accent: 'Działa bez zasięgu.',
    })
    expect(page.eyebrow).toBe('Aplikacja · budowlanka, instalatorzy, serwisy')
  })

  it('starts the tiles with the price of Solutions, then its own three', () => {
    expect(page.tiles.map((tile) => tile.label)).toEqual([
      'Cena',
      'Pierwszy etap',
      'Działa na',
      'Opieka',
    ])
    expect(page.tiles[0]).toMatchObject({ value: 'Wycena po rozmowie', accent: true })
    expect(page.priceFrom).toBeNull()
  })

  it('shows the demo instead of the window steps', () => {
    expect(page.demo?.kind).toBe('fieldCrew')
    expect(page.steps).toEqual([])
    expect(page.howItWorks).toBe(true)
  })

  it('shows the demo only for a solution with a live preview (spec. §6.1)', () => {
    const data = seeded.get(FIELD_CREW_SLUG)!
    const solution = offerSolutionOf({ ...data, hasLivePreview: false } as OfferSolutionDoc)
    const view = buildOfferView(solution, {
      offer,
      display,
      related: [],
      fill: (text, term) => text.replace('{termin}', term ?? ''),
    })
    const page = buildSolutionPage({
      view,
      page: data.page as SolutionPageDoc,
      priceFrom: null,
      price: 'Wycena po rozmowie',
      moreExamples: [],
      isIcon: isIconName,
    })
    expect(page.demo).toBeNull()
    expect(page.steps.length).toBeGreaterThan(0)
  })

  it('lists eight deliverables with icons and the extras', () => {
    expect(page.deliverables.title).toBe('W cenie **wdrożenia**')
    expect(page.deliverables.items).toHaveLength(8)
    expect(page.deliverables.items.every((item) => item.icon !== null)).toBe(true)
    expect(page.deliverables.extra).toEqual(demo.extra)
    expect(page.deliverables.badge.value).toBe('Wycena po rozmowie')
  })

  it('has its own five questions and the browser-or-store choice', () => {
    expect(page.faq.items).toHaveLength(5)
    expect(page.faq.eyebrow).toBe('Pytania o tę aplikację')
    expect(page.choice?.options.map((option) => option.name)).toEqual([
      'Z przeglądarki (PWA)',
      'W sklepach (iOS i Android)',
    ])
  })
})

describe('template page (solution without its own texts)', () => {
  const page = pageOf('rozbudowana-strona-firmowa')

  it('uses the name as H1 and label · for whom as the eyebrow', () => {
    expect(page.title).toEqual({ plain: 'Rozbudowana strona firmowa', accent: null })
    expect(page.eyebrow).toMatch(/^Strona · /)
  })

  it('shows the price, the term and for whom', () => {
    expect(page.tiles.map((tile) => tile.label)).toEqual(['Cena', 'Termin', 'Dla kogo'])
    expect(page.tiles[0]!.value).toMatch(/^od .+ zł netto$/)
    expect(page.tiles[0]!.accent).toBe(false)
    expect(page.priceFrom).toBeGreaterThan(0)
  })

  it('takes deliverables from „W cenie” and the category points, without repeats', () => {
    const titles = page.deliverables.items.map((item) => item.title)
    expect(titles.length).toBeGreaterThan(0)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('has the window steps and questions, no demo and no choice', () => {
    expect(page.demo).toBeNull()
    expect(page.steps.length).toBeGreaterThan(0)
    expect(page.faq.items.length).toBeGreaterThan(0)
    expect(page.choice).toBeNull()
    expect(page.compare).toEqual([])
  })

  it('drops items whose text went empty (a missing fact on production)', () => {
    const page = pageOf('rozbudowana-strona-firmowa', {
      tiles: [
        { label: 'Pierwszy etap', value: '' },
        { label: 'Działa na', value: 'iOS' },
      ],
      compare: [{ label: 'Dziś', title: '' }],
      deliverables: [{ title: '' }, { title: 'Panel' }],
      faq: [{ q: 'Pytanie?', a: '' }],
    })
    expect(page.tiles.map((tile) => tile.label)).toEqual(['Cena', 'Działa na'])
    expect(page.compare).toEqual([])
    expect(page.deliverables.items.map((item) => item.title)).toEqual(['Panel'])
    // No page question left → the window questions.
    expect(page.faq.items.length).toBeGreaterThan(0)
    expect(page.faq.items[0]!.question).not.toBe('Pytanie?')
  })

  it('links „Jak to działa” only when the page has its target', () => {
    expect(page.howItWorks).toBe(true)
  })

  it('ignores a broken demo instead of failing the page', () => {
    expect(pageOf('rozbudowana-strona-firmowa', { demo: { kind: 'x' } }).demo).toBeNull()
  })
})
