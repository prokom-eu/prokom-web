import { describe, expect, it } from 'vitest'

import branze from '../../../seed/prokomsoftware/branze.json'
import { industriesToImport, solutionsToImport } from '../../seed/software/map'
import { isIconName } from '../catalog/options'
import { buildIndustryPage, type IndustryDoc, industryWizardHref } from './industryPage'
import { buildSolutionsIndex } from './solutionsIndex'
import { solutionsSourceFromSeed } from './solutionsIndex.fixture'

// Ids as the seed would give them: the position in the package.
const slugs = solutionsToImport().map((item) => item.slug)
const idOf = (slug: string) => slugs.indexOf(slug) + 1
const industries = industriesToImport((slug) => (slugs.includes(slug) ? idOf(slug) : undefined))
const index = buildSolutionsIndex(solutionsSourceFromSeed())
const allIds = new Map(slugs.map((slug) => [idOf(slug), slug]))

function pageOf(slug: string, change: Partial<IndustryDoc> = {}, ids = allIds) {
  const data = industries.find((item) => item.slug === slug)
  if (!data) throw new Error(`no ${slug}`)
  return buildIndustryPage({
    industry: { ...(data as IndustryDoc), ...change },
    solutions: index.solutions,
    slugById: ids,
    isIcon: isIconName,
  })
}

describe('industry page (board Branza v22, construction)', () => {
  const page = pageOf('budownictwo-i-wykonczenia')!

  it('has the H1 with its accent and the eyebrow from the catalog group', () => {
    expect(page.title).toEqual({
      plain: 'Oprogramowanie dla firm, które pracują',
      accent: 'w terenie, nie przy biurku.',
    })
    expect(page.eyebrow).toBe('Branża · Budowlanka i ekipy')
  })

  it('opens the wizard with the kind of firm (no section „W 60 sekund” in v22)', () => {
    expect(page.wizard).toEqual({
      label: 'Złóż system dla swojej firmy',
      href: '/dobierz?firma=bud',
    })
    expect(industryWizardHref(null)).toBe('/dobierz')
  })

  it('lists the four problems with their solution and link', () => {
    expect(page.problems.items.map((item) => item.question)).toEqual(
      branze.budowlanka.problems.map((problem) => problem.q),
    )
    expect(page.problems.items.every((item) => item.solution && item.icon)).toBe(true)
    expect(page.problems.items[0]!.cta).toEqual({
      label: 'Zobacz podgląd na żywo',
      href: '/rozwiazania/aplikacja-dla-ekip-w-terenie',
    })
  })

  it('shows six solution cards in the package order, from the index (prices of Solutions)', () => {
    expect(page.solutions.items.map((item) => item.slug)).toEqual(
      branze.budowlanka.solutions.map((card) => card.solution),
    )
  })

  it('has the offline box with its steps, the modules and four questions', () => {
    expect(page.offline?.title).toBe('Na budowie w górach zasięg bywa słaby.')
    expect(page.offline?.steps).toHaveLength(3)
    expect(page.offline?.note?.value).toBe('PL · UA · EN')
    expect(page.modules.length).toBeGreaterThan(0)
    expect(page.hub).toEqual({ title: '3 ekipy', caption: 'jeden system' })
    expect(page.faq.items).toHaveLength(4)
  })

  it('ends with the dark contact of the board', () => {
    expect(page.contact.title).toBe('Pokaż, jak dziś pracują Twoje ekipy.')
    expect(page.contact.points).toHaveLength(3)
  })
})

describe('industry page — only published solutions of the tenant', () => {
  it('drops a card and a problem link to a solution outside the tenant or unpublished', () => {
    const ids = new Map(allIds)
    ids.delete(idOf('aplikacja-dla-ekip-w-terenie'))
    const page = pageOf('budownictwo-i-wykonczenia', {}, ids)!
    expect(page.solutions.items.map((item) => item.slug)).not.toContain(
      'aplikacja-dla-ekip-w-terenie',
    )
    expect(page.solutions.items).toHaveLength(5)
    const protocols = page.problems.items.find((item) => item.question.startsWith('Protokoły'))
    expect(protocols?.solution).toBeNull()
  })
})

describe('industry page — 404', () => {
  it('is not built for an inactive industry', () => {
    expect(pageOf('budownictwo-i-wykonczenia', { active: false })).toBeNull()
  })

  it('is not built for an industry without its problems (no text yet)', () => {
    expect(pageOf('transport', { active: true })).toBeNull()
  })
})
