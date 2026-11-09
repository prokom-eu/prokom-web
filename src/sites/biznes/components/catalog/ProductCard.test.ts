import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'

vi.mock('../AddToCartButtonLazy', () => ({ AddToCartButton: () => null }))

const { ProductCard } = await import('./ProductCard')

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
  image: { url: '/api/media/file/ergo.webp', width: 480, height: 480, alt: '' },
}

const index = {
  products: [product],
  brands: [{ slug: 'posnet', name: 'Posnet', status: 'authorized-service' }],
  categories: [],
} as unknown as CatalogIndex

const img = (picture?: 'lazy' | 'eager' | 'priority') => {
  const html = renderToStaticMarkup(
    createElement(ProductCard, { product, index, position: 0, picture }),
  )
  return html.match(/<img[^>]*alt="Posnet Ergo Online"[^>]*>/)?.[0] ?? ''
}

describe('ProductCard: pictures of the first row (Lighthouse LCP, ADR-025)', () => {
  it('priority: loads at once with high priority', () => {
    const tag = img('priority')
    expect(tag).toContain('loading="eager"')
    expect(tag).toContain('fetchPriority="high"')
  })

  it('eager: loads at once, normal priority', () => {
    const tag = img('eager')
    expect(tag).toContain('loading="eager"')
    expect(tag).not.toContain('fetchPriority')
  })

  it('by default the picture stays lazy', () => {
    const tag = img()
    expect(tag).toContain('loading="lazy"')
    expect(tag).not.toContain('fetchPriority')
  })
})
