import { describe, expect, it } from 'vitest'

import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { groupSummaries } from './groups'

const image = (slug: string) => ({ url: `/m/${slug}.webp`, alt: slug, width: 480, height: 480 })

const product = (slug: string, group: string | null, extra: Partial<IndexProduct> = {}) =>
  ({
    slug,
    name: slug.toUpperCase(),
    group,
    popularity: 0,
    image: image(slug),
    ...extra,
  }) as IndexProduct

const index = {
  groups: [
    { slug: 'sprz', name: 'Kasy i sprzedaż', icon: 'store', gradient: ['#244FB0', '#4FA3F0'] },
    {
      slug: 'usl',
      name: 'Serwis i usługi',
      icon: 'wrench',
      gradient: ['#C2410C', '#F59E0B'],
      description: 'opieka IT, KSeF, serwis kas',
      showcase: { images: [], statuses: [{ label: 'Opieka IT', value: 'aktywna', tone: 'ok' }] },
    },
  ],
  categories: [
    { slug: 'skanery', name: 'Skanery', group: 'sprz', count: 5 },
    { slug: 'kasy', name: 'Kasy fiskalne', group: 'sprz', count: 9 },
    { slug: 'wagi', name: 'Wagi', group: 'sprz', count: 2 },
    { slug: 'drukarki', name: 'Drukarki fiskalne', group: 'sprz', count: 5 },
    { slug: 'serwis', name: 'Serwis kas', group: 'usl', count: 1 },
  ],
  products: [
    product('ergo', 'sprz', { featuredOrder: 1, popularity: 10 }),
    product('k10', 'sprz', { featuredOrder: 0, popularity: 5 }),
    product('hx', 'sprz', { popularity: 90 }),
    product('temo', 'sprz', { popularity: 50 }),
    product('bez-zdjecia', 'sprz', { popularity: 99, image: undefined }),
    product('przeglad', 'usl', { image: undefined }),
    product('bez-grupy', null),
  ],
} as unknown as Pick<CatalogIndex, 'groups' | 'categories' | 'products'>

describe('groupSummaries', () => {
  it('counts products by the group of their main category', () => {
    const [sprz, usl] = groupSummaries(index)
    expect(sprz).toMatchObject({ slug: 'sprz', name: 'Kasy i sprzedaż', count: 5 })
    expect(usl).toMatchObject({ slug: 'usl', count: 1, description: 'opieka IT, KSeF, serwis kas' })
  })

  it('keeps the order of the groups and their gradient', () => {
    expect(groupSummaries(index).map((group) => group.slug)).toEqual(['sprz', 'usl'])
    expect(groupSummaries(index)[0]?.gradient).toEqual(['#244FB0', '#4FA3F0'])
  })

  it('lists the largest categories first, ties by name, up to the limit', () => {
    const [sprz] = groupSummaries(index)
    expect(sprz?.topCategories.map((category) => category.slug)).toEqual([
      'kasy',
      'drukarki',
      'skanery',
    ])
    expect(sprz?.topCategories[0]).toEqual({ slug: 'kasy', name: 'Kasy fiskalne', count: 9 })
    expect(groupSummaries(index, { topCategories: 1 })[0]?.topCategories).toHaveLength(1)
  })

  it('picks thumbnails with an image: featured in their order, then by popularity', () => {
    const [sprz, usl] = groupSummaries(index, { thumbs: 3 })
    expect(sprz?.thumbs.map((thumb) => thumb.slug)).toEqual(['k10', 'ergo', 'hx'])
    expect(sprz?.thumbs[0]).toEqual({ slug: 'k10', name: 'K10', image: image('k10') })
    expect(usl?.thumbs).toEqual([])
  })

  it('has no description when the group has none', () => {
    expect(groupSummaries(index)[0]?.description).toBeUndefined()
  })

  it('passes the showcase of the department card on', () => {
    expect(groupSummaries(index)[1]?.showcase?.statuses[0]?.value).toBe('aktywna')
    expect(groupSummaries(index)[0]).not.toHaveProperty('showcase')
  })
})
