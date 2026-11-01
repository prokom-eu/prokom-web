import { describe, expect, it } from 'vitest'

import { META_DESCRIPTION_MAX } from '../../lib/seo/description'
import { PAGE_SEO_TITLE_MAX } from '../../lib/seo/title'
import { HOME_SLUG } from '../../lib/pages/slug'
import { SOFTWARE_PAGE_SEO, seoFill } from './seo'

describe('SOFTWARE_PAGE_SEO (spec. §9)', () => {
  it('has a description for every page, short enough for search results', () => {
    for (const [slug, { description }] of Object.entries(SOFTWARE_PAGE_SEO)) {
      expect(description, slug).toBeTruthy()
      expect(description!.length, slug).toBeLessThanOrEqual(META_DESCRIPTION_MAX)
    }
  })

  it('has titles the panel accepts (`Pages.seo.title`), or the seed fails on save', () => {
    for (const [slug, { title }] of Object.entries(SOFTWARE_PAGE_SEO)) {
      expect((title ?? '').length, slug).toBeLessThanOrEqual(PAGE_SEO_TITLE_MAX)
    }
  })

  it('leaves the site name to the title template and has no placeholders', () => {
    // The start page shares the layout's segment, so the template does not reach it.
    expect(SOFTWARE_PAGE_SEO[HOME_SLUG]?.title).toBe(
      'Strony, systemy i aplikacje dla firm — Rabka-Zdrój, Podhale | PRO-KOM Software',
    )
    for (const [slug, { title, description }] of Object.entries(SOFTWARE_PAGE_SEO)) {
      if (slug !== HOME_SLUG) expect(title ?? '', slug).not.toContain('PRO-KOM Software')
      expect(`${title ?? ''} ${description}`, slug).not.toMatch(/\[[^\]]+\]/)
    }
  })
})

describe('seoFill', () => {
  const seed = { title: 'Cennik stron', description: 'Opis.' }

  it('fills empty fields', () => {
    expect(seoFill(null, seed)).toEqual(seed)
    expect(seoFill({ title: ' ', description: null }, seed)).toEqual(seed)
  })

  it('keeps what the panel has and changes nothing when all is filled', () => {
    expect(seoFill({ title: 'Mój tytuł', description: null }, seed)).toEqual({
      title: 'Mój tytuł',
      description: 'Opis.',
    })
    expect(seoFill({ title: 'Mój tytuł', description: 'Mój opis.' }, seed)).toBeNull()
  })
})
