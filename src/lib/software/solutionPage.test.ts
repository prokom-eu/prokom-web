import { describe, expect, it } from 'vitest'

import ikony from '../../../seed/prokomsoftware/ikony.json'
import demo from '../../../seed/prokomsoftware/demo-aplikacja-ekip.json'
import okno from '../../../seed/prokomsoftware/okno-oferty.json'
import { solutionData, solutionsToImport } from '../../seed/software/map'
import { FIELD_CREW_PAGE, FIELD_CREW_SLUG } from '../../seed/software/solutionPages'
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
  it('writes the page tab only for the field crew app', () => {
    const withPage = [...seeded].filter(([, data]) => data.page).map(([slug]) => slug)
    expect(withPage).toEqual([FIELD_CREW_SLUG])
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
    expect(page.tiles[0]).toMatchObject({ value: 'Zapytaj o wycenę', accent: true })
    expect(page.priceFrom).toBeNull()
  })

  it('shows the demo instead of the window steps', () => {
    expect(page.demo?.kind).toBe('fieldCrew')
    expect(page.steps).toEqual([])
  })

  it('lists eight deliverables with icons and the extras', () => {
    expect(page.deliverables.title).toBe('W cenie wdrożenia')
    expect(page.deliverables.items).toHaveLength(8)
    expect(page.deliverables.items.every((item) => item.icon !== null)).toBe(true)
    expect(page.deliverables.extra).toEqual(demo.extra)
    expect(page.deliverables.badge.value).toBe('Zapytaj o wycenę')
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
  const page = pageOf('strona-firmowa-z-panelem')

  it('uses the name as H1 and label · for whom as the eyebrow', () => {
    expect(page.title).toEqual({ plain: 'Strona firmowa z panelem', accent: null })
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

  it('ignores a broken demo instead of failing the page', () => {
    expect(pageOf('strona-firmowa-z-panelem', { demo: { kind: 'x' } }).demo).toBeNull()
  })
})
