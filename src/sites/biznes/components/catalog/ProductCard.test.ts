import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'

vi.mock('../AddToCartButtonLazy', () => ({ AddToCartButton: () => null }))

const { FIRST_ROW, ProductCard } = await import('./ProductCard')

const product: IndexProduct = {
  slug: 'posnet-ergo-online',
  name: 'Ergo Online',
  brand: 'posnet',
  kind: 'device',
  categories: [],
  group: null,
  industries: [],
  features: [],
  isNew: false,
  authorized: false,
  popularity: 0,
  registerTypes: [],
  hay: 'ergo',
  image: { url: '/api/media/file/ergo.webp', width: 480, height: 480 },
}

const index = {
  products: [product],
  brands: [{ slug: 'posnet', name: 'Posnet', status: 'authorized-service' }],
  categories: [],
} as unknown as CatalogIndex

const picture = (eager?: boolean) => {
  const html = renderToStaticMarkup(
    createElement(ProductCard, { product, index, position: 0, eager }),
  )
  return html.match(/<img[^>]*alt="Posnet Ergo Online"[^>]*>/)?.[0] ?? ''
}

describe('ProductCard: the first row is the largest paint (Lighthouse LCP)', () => {
  it('a first-row picture loads at once with high priority', () => {
    const img = picture(true)
    expect(img).toContain('loading="eager"')
    expect(img).toContain('fetchPriority="high"')
  })

  it('other pictures stay lazy', () => {
    const img = picture()
    expect(img).toContain('loading="lazy"')
    expect(img).not.toContain('fetchPriority')
  })

  it('the first row is three cards (three columns from 1101 px, two on a phone)', () => {
    expect(FIRST_ROW).toBe(3)
  })
})
