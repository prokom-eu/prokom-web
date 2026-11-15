import { describe, expect, it } from 'vitest'

import { TITLE_BASE_MAX, TITLE_BASE_MIN } from '../../lib/biznes/seo'
import { nextPageSeo, PAGE_SEO } from './pageSeo'

describe('PAGE_SEO (audit 0611 P1-8)', () => {
  it('has titles of 30–60 characters with the suffix and descriptions of 100–155', () => {
    for (const [slug, { title, description }] of Object.entries(PAGE_SEO)) {
      if (title) {
        expect(title.length, slug).toBeGreaterThanOrEqual(TITLE_BASE_MIN)
        expect(title.length, slug).toBeLessThanOrEqual(TITLE_BASE_MAX)
      }
      if (description) {
        expect(description.length, slug).toBeGreaterThanOrEqual(100)
        expect(description.length, slug).toBeLessThanOrEqual(155)
      }
    }
  })

  it('never names a price or a promise of time', () => {
    expect(JSON.stringify(PAGE_SEO)).not.toMatch(/zł|\d+\s*(h|godz|min)/)
  })
})

describe('nextPageSeo', () => {
  it('fills an empty title and a short description, never a title from the panel', () => {
    expect(nextPageSeo('gopos', { title: null, description: 'x'.repeat(120) })).toEqual({
      title: PAGE_SEO.gopos!.title,
    })
    expect(nextPageSeo('gopos', { title: 'Z panelu' })).toBeNull()
    expect(nextPageSeo('dostepnosc', { title: 'Z panelu', description: 'Krótki.' })).toEqual({
      description: PAGE_SEO.dostepnosc!.description,
    })
    expect(nextPageSeo('nieznana', null)).toBeNull()
  })
})
