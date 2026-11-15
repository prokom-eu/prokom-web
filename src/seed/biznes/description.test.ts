import { describe, expect, it } from 'vitest'

import { nextDescription } from './description'
import { HOME_DESCRIPTION } from './home'
import { k4PageSeeds } from './k4PagesRun'

describe('nextDescription', () => {
  it('fills an empty description and replaces an earlier seed wording only', () => {
    expect(nextDescription(null, 'Nowy')).toBe('Nowy')
    expect(nextDescription('Stary', 'Nowy', ['Stary'])).toBe('Nowy')
    expect(nextDescription('Z panelu', 'Nowy', ['Stary'])).toBeNull()
    expect(nextDescription('Nowy', 'Nowy')).toBeNull()
    expect(nextDescription(null, undefined)).toBeNull()
  })
})

describe('SEO descriptions of the seeded Biznes pages (audit 01.11.2026)', () => {
  const pages = [
    { slug: '/', description: HOME_DESCRIPTION },
    ...k4PageSeeds((id) => id).map(({ slug, description }) => ({ slug: `/${slug}`, description })),
  ]

  it.each(pages)('$slug has a description of at most 155 characters', ({ description }) => {
    expect(description.trim()).not.toBe('')
    expect(description.length).toBeLessThanOrEqual(155)
  })

  it('gives every page its own description', () => {
    const all = pages.map((page) => page.description)
    expect(new Set(all).size).toBe(all.length)
  })

  it('uses the texts of the audit for the home page, GoPOS and InsERT', () => {
    const bySlug = new Map(pages.map((page) => [page.slug, page.description]))
    expect(bySlug.get('/')).toMatch(/^Kasy fiskalne, komputery, programy i opieka IT/)
    expect(bySlug.get('/gopos')).toMatch(/^GoPOS dla gastronomii z wdrożeniem w lokalu/)
    expect(bySlug.get('/insert')).toMatch(/^Subiekt, Rachmistrz i Rewizor z wdrożeniem i KSeF/)
  })
})
