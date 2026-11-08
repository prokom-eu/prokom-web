import { describe, expect, it } from 'vitest'

import { buildCatalogIndex } from './catalogIndex'
import { sourceFromSeed } from './seedSource.fixture'
import { biznesSearchProvider, productOfResult } from './searchProvider'

const index = buildCatalogIndex(sourceFromSeed())
const provider = biznesSearchProvider(index)
const titles = (q: string) => provider.query(q).map((group) => group.title)
const group = (q: string, title: string) =>
  provider.query(q).find((item) => item.title === title)?.results ?? []

describe('biznesSearchProvider (plan 0611 §8.1 pkt 5)', () => {
  it('finds registers with a typo and an inflected word, products first', () => {
    for (const q of ['kasa', 'kasy fiskalen']) {
      expect(titles(q)[0]).toBe('Produkty i usługi')
      expect(group(q, 'Kategorie').map((result) => result.title)).toContain('Kasy fiskalne')
    }
  })

  it('links every product to its card and knows the product behind a result', () => {
    const [first] = group('posnet', 'Produkty i usługi')
    expect(first?.href).toMatch(/^\/produkt\//)
    expect(productOfResult(index, first!)?.slug).toBe(first!.href.replace('/produkt/', ''))
  })

  it('ends the products with „all results in the catalog” for the phrase', () => {
    const products = group('laptop', 'Produkty i usługi')
    expect(products.at(-1)).toMatchObject({ href: '/oferta?szukaj=laptop' })
    expect(products.at(-1)?.title).toMatch(/^Wszystkie wyniki w ofercie · \d+ wynik/)
    expect(productOfResult(index, products.at(-1)!)).toBeNull()
  })

  it('finds brands with a page and ready bundles', () => {
    // The seed fixture has no brand pages nor bundles: one of each here.
    const withPages = biznesSearchProvider({
      ...index,
      brands: index.brands.map((brand) =>
        brand.slug === 'lenovo' ? { ...brand, page: true as const } : brand,
      ),
      pages: [...index.pages, { slug: 'zestawy/sklep', title: 'Zestaw dla sklepu' }],
    })
    const found = (q: string, title: string) =>
      withPages.query(q).find((item) => item.title === title)?.results ?? []
    expect(found('lenovo', 'Marki')[0]?.href).toBe('/marki/lenovo')
    expect(found('zestaw sklep', 'Gotowe zestawy')[0]?.href).toBe('/zestawy/sklep')
  })

  it('nothing found → no groups (the dialog offers „Zapytaj o …”)', () => {
    expect(provider.query('qwxzv')).toEqual([])
  })

  it('empty field: shortcuts of the catalog and the popular phrases from the panel', () => {
    const [shortcuts] = provider.empty()
    expect(shortcuts?.title).toBe('Na skróty')
    expect(shortcuts?.results.map((result) => result.href)).toEqual(
      expect.arrayContaining(['/oferta/kasy-fiskalne', '/konfigurator', '/plan-firmy']),
    )
    expect(provider.popular).toEqual(index.search.popular)
  })
})
