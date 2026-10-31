import { describe, expect, it } from 'vitest'

import { buildBrandsPage, type BrandsPageInput } from './brandsPage'
import type { CatalogIndex, IndexProduct } from './catalogIndex'

const product = (slug: string, brand: string, image = true): IndexProduct =>
  ({
    slug,
    name: slug,
    brand,
    hay: slug,
    ...(image ? { image: { url: `/${slug}.webp`, alt: slug, width: 480, height: 480 } } : {}),
  }) as IndexProduct

const index = (
  products: IndexProduct[],
  pages: string[] = [],
): Pick<CatalogIndex, 'products' | 'pages'> => ({
  products,
  pages: pages.map((slug) => ({ slug, title: slug })),
})

const partner = (
  id: number,
  slug: string,
  status: BrandsPageInput['partners'][number]['status'] = 'none',
) => ({ id, slug, name: slug.toUpperCase(), status, description: `Opis ${slug}`, logo: null })

const input = (fields: Partial<BrandsPageInput> = {}): BrandsPageInput => ({
  groups: [
    {
      title: 'Kasy, POS i płatności',
      iconPath: 'M1 1',
      description: 'Kasy',
      partnerIds: [1, 2, 3],
    },
    {
      title: 'Komputery, druk i akcesoria',
      iconPath: null,
      description: null,
      partnerIds: [4, 5, 6],
    },
  ],
  partners: [
    partner(1, 'posnet', 'authorized-service'),
    partner(2, 'gopos', 'authorized-partner'),
    partner(3, 'polcard'),
    partner(4, 'kyocera'),
    partner(5, 'hp'),
    partner(6, 'pusta'),
  ],
  showrooms: [
    { slug: 'posnet', brandIds: [1] },
    { slug: 'druk', brandIds: [7, 4] },
  ],
  index: index(
    [
      product('ergo', 'posnet'),
      product('bez-zdjecia', 'posnet', false),
      product('thermal', 'posnet'),
      product('pospay', 'posnet'),
      product('temo', 'posnet'),
      product('gopos-app', 'gopos'),
      product('taskalfa', 'kyocera'),
      product('laserjet', 'hp'),
      product('move5000', 'polcard'),
    ],
    ['gopos'],
  ),
  ...fields,
})

describe('buildBrandsPage', () => {
  it('keeps the groups and brands of the panel in order, with a short tab label', () => {
    const page = buildBrandsPage(input())
    expect(page.groups.map((group) => [group.title, group.short])).toEqual([
      ['Kasy, POS i płatności', 'Kasy'],
      ['Komputery, druk i akcesoria', 'Komputery'],
    ])
    expect(page.groups[0]!.tiles.map((tile) => tile.slug)).toEqual(['posnet', 'gopos', 'polcard'])
  })

  it('leads a brand to its showroom, a theme showroom, its own page or the filtered offer', () => {
    const tiles = buildBrandsPage(input()).groups.flatMap((group) => group.tiles)
    const bySlug = new Map(tiles.map((tile) => [tile.slug, tile]))
    expect(bySlug.get('posnet')).toMatchObject({ href: '/marki/posnet', salon: true })
    expect(bySlug.get('kyocera')).toMatchObject({ href: '/marki/druk', salon: true })
    expect(bySlug.get('gopos')).toMatchObject({ href: '/gopos', salon: true })
    expect(bySlug.get('hp')).toMatchObject({ href: '/oferta?marka=hp', salon: false })
    expect(bySlug.get('polcard')).toMatchObject({ href: '/oferta?marka=polcard', salon: false })
  })

  it('links a special page only when the site has it published', () => {
    const page = buildBrandsPage(input({ index: index([product('gopos-app', 'gopos')]) }))
    expect(page.groups[0]!.tiles.find((tile) => tile.slug === 'gopos')).toMatchObject({
      href: '/oferta?marka=gopos',
      salon: false,
    })
  })

  it('leaves out a brand with nowhere to go (no products, page or showroom)', () => {
    const tiles = buildBrandsPage(input()).groups[1]!.tiles
    expect(tiles.map((tile) => tile.slug)).toEqual(['kyocera', 'hp'])
  })

  it('counts the products and takes the first 3 photos of the brand', () => {
    const posnet = buildBrandsPage(input()).groups[0]!.tiles[0]!
    expect(posnet.count).toBe(5)
    expect(posnet.photos.map((photo) => photo.url)).toEqual([
      '/ergo.webp',
      '/thermal.webp',
      '/pospay.webp',
    ])
  })

  it('counts a brand of two groups once and drops empty groups', () => {
    const page = buildBrandsPage(
      input({
        groups: [
          { title: 'Kasy', iconPath: null, description: null, partnerIds: [1] },
          { title: 'Sale', iconPath: null, description: null, partnerIds: [1, 6] },
          { title: 'Puste', iconPath: null, description: null, partnerIds: [6, 99] },
        ],
      }),
    )
    expect(page.total).toBe(1)
    expect(page.groups.map((group) => [group.title, group.tiles.length])).toEqual([
      ['Kasy', 1],
      ['Sale', 1],
    ])
  })

  it('puts the authorized brands in the header cards, once each, in the panel order', () => {
    const page = buildBrandsPage(input())
    expect(page.authorized.map((tile) => [tile.slug, tile.status])).toEqual([
      ['posnet', 'authorized-service'],
      ['gopos', 'authorized-partner'],
    ])
  })

  it('makes the search text without diacritics from the name and the description', () => {
    const page = buildBrandsPage(
      input({
        partners: [{ ...partner(1, 'posnet'), description: 'Kasy i drukarki fiskalne, łódź' }],
      }),
    )
    expect(page.groups[0]!.tiles[0]!.hay).toBe('posnet kasy i drukarki fiskalne, lodz')
  })
})
