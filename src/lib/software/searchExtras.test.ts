import { describe, expect, it } from 'vitest'

import { buildSearchExtras } from './searchExtras'

describe('buildSearchExtras', () => {
  it('gives each item its address and the post its category label', () => {
    const extras = buildSearchExtras({
      posts: [{ slug: 'a', title: 'A', lead: null, categoryValue: 'strony', minutes: 4 }],
      industries: [{ slug: 'noclegi', name: 'Noclegi' }],
      cities: [{ slug: 'rabka-zdroj', name: 'Rabka-Zdrój' }],
    })
    expect(extras.posts[0]).toMatchObject({
      href: '/aktualnosci/a',
      category: 'strony',
      categoryLabel: 'Strony',
    })
    expect(extras.industries[0]?.href).toBe('/dla-branz/noclegi')
    expect(extras.cities[0]?.href).toBe('/miejscowosci/rabka-zdroj')
  })

  it('clips a long lead (the window shows two lines of it)', () => {
    const lead = 'x'.repeat(400)
    const [post] = buildSearchExtras({
      posts: [{ slug: 'a', title: 'A', lead, categoryValue: null, minutes: 1 }],
      industries: [],
      cities: [],
    }).posts
    expect(post?.lead?.length).toBe(220)
    expect(post?.lead?.endsWith('…')).toBe(true)
  })
})
