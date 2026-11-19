import { describe, expect, it } from 'vitest'

import { featuredProducts, homeDepartments } from './homeCatalog'

const product = (slug: string, group: string, image = true) =>
  ({
    slug,
    name: slug,
    group,
    brand: null,
    kind: 'device',
    categories: [],
    ...(image && { image: { url: `/${slug}.webp`, alt: slug, width: 1200, height: 1200 } }),
  }) as never

describe('home „Sprzęt i marki” (INST-K2)', () => {
  const index = {
    groups: [
      { slug: 'mon', name: 'Monitoring' },
      { slug: 'alarm', name: 'Alarmy' },
      { slug: 'av', name: 'AV' },
    ] as never,
    products: [
      product('k1', 'mon'),
      product('k2', 'mon', false),
      product('k3', 'mon'),
      product('k4', 'mon'),
      product('k5', 'mon'),
      product('a1', 'alarm'),
    ],
  }

  it('lists departments with cards: count, offer filter, three pictured cards', () => {
    const departments = homeDepartments(index)
    expect(departments.map((d) => d.slug)).toEqual(['mon', 'alarm'])
    expect(departments[0]).toMatchObject({
      name: 'Monitoring',
      count: 5,
      href: '/oferta?grupa=mon',
    })
    expect(departments[0]!.products.map((p) => p.slug)).toEqual(['k1', 'k3', 'k4'])
  })

  it('keeps the panel order of „Najczęściej wybierane”, drops unlisted, tops up to eight', () => {
    const many = { products: Array.from({ length: 12 }, (_, i) => product(`p${i}`, 'mon')) }
    const chosen = featuredProducts(many, ['p5', 'gone', 'p2'])
    expect(chosen.map((p) => p.slug)).toEqual(['p5', 'p2', 'p0', 'p1', 'p3', 'p4', 'p6', 'p7'])
  })
})
