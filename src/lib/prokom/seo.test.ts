import { describe, expect, it } from 'vitest'

import { HUB_DESCRIPTIONS, hubPageMetadata } from './seo'

describe('HUB_DESCRIPTIONS (spec §4, audit H8)', () => {
  it.each(Object.entries(HUB_DESCRIPTIONS))('%s: 140–155 characters, whole', (_, text) => {
    expect(text.length).toBeGreaterThanOrEqual(140)
    // 155 = META_DESCRIPTION_MAX: search results show it without „…”.
    expect(text.length).toBeLessThanOrEqual(155)
  })

  it('names no price, phone or e-mail (spec §3)', () => {
    const all = Object.values(HUB_DESCRIPTIONS).join(' ')
    expect(all).not.toMatch(/\d\s*zł|gratis|w cenie|leasing|\brat\b|@|\d{3}[ -]?\d{3}[ -]?\d{3}/i)
  })
})

describe('hubPageMetadata', () => {
  it('gives title, description, canonical and Open Graph with the picture', () => {
    const image = {
      alt: 'PRO-KOM',
      width: 1200,
      height: 630,
      sources: [{ url: '/brand/prokom-glowna_og.png', width: 1200 }],
    }
    const metadata = hubPageMetadata('/linie', 'Linie PRO-KOM — co gdzie załatwisz', image)
    expect(metadata).toMatchObject({
      title: { absolute: 'Linie PRO-KOM — co gdzie załatwisz' },
      description: HUB_DESCRIPTIONS['/linie'],
      alternates: { canonical: '/linie' },
      openGraph: {
        url: '/linie',
        description: HUB_DESCRIPTIONS['/linie'],
        images: [{ url: '/brand/prokom-glowna_og.png', width: 1200, height: 630 }],
      },
    })
  })
})
