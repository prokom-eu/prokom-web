import { describe, expect, it } from 'vitest'

import { orderHomeBrands } from './homeBrands'

const doc = (id: number, name: string, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  slug: name.toLowerCase(),
  partnerStatus: 'none' as const,
  width: null,
  height: null,
  url: null,
  ...extra,
})

describe('orderHomeBrands (K35 7a)', () => {
  it('keeps the order of the panel and leaves out ids without a record', () => {
    const brands = orderHomeBrands(
      [3, 9, 1],
      [doc(1, 'Posnet'), doc(3, 'Elzab', { partnerStatus: 'authorized-service' })],
    )
    expect(brands.map((brand) => brand.name)).toEqual(['Elzab', 'Posnet'])
    expect(brands[0]?.status).toBe('authorized-service')
  })

  it('gives the logo only with a size and a file, and the short description trimmed', () => {
    const [withLogo, without] = orderHomeBrands(
      [1, 2],
      [
        doc(1, 'Apple', {
          width: 200,
          height: 80,
          url: '/api/partners/file/apple.webp',
          brandPage: { shortDescription: '  iPhone, iPad i Mac dla firm ' },
        }),
        doc(2, 'APC', { brandPage: { shortDescription: ' ' } }),
      ],
    )
    expect(withLogo?.logo).toMatchObject({ alt: 'Logo Apple', width: 200, height: 80 })
    expect(withLogo?.description).toBe('iPhone, iPad i Mac dla firm')
    expect(without?.logo).toBeNull()
    expect(without?.description).toBeNull()
  })
})
