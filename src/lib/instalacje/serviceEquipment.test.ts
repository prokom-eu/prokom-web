import { describe, expect, it } from 'vitest'

import { serviceEquipment } from './serviceEquipment'

const product = (slug: string, category: string, image = true) =>
  ({
    slug,
    categories: [category],
    ...(image && { image: { url: `/${slug}.webp`, alt: slug, width: 1, height: 1 } }),
  }) as never

describe('serviceEquipment (INST-K2)', () => {
  const index = {
    products: [
      product('s1', 'streaming'),
      product('k1', 'kamery-ip'),
      product('s2', 'streaming', false),
      product('p1', 'przesyl-av'),
      product('s3', 'streaming'),
      product('s4', 'streaming'),
    ],
  }

  it('leads „Nagłośnienie” to the streaming equipment with three pictured cards', () => {
    const snd = serviceEquipment('snd', index)
    expect(snd?.href).toBe('/oferta/streaming')
    expect(snd?.products.map((p) => p.slug)).toEqual(['s1', 'p1', 's3'])
  })

  it('has no equipment link for network services (ADR-029 pkt 8) or without cards', () => {
    expect(serviceEquipment('wifi', index)).toBeNull()
    expect(serviceEquipment('kd', index)).toBeNull()
  })
})
