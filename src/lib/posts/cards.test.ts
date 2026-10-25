import { describe, expect, it } from 'vitest'

import { postCards, postListCards } from './cards'

const post = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  title: slug.toUpperCase(),
  tenant: 1,
  category: 'ksef',
  publishedAt: '2026-10-14T08:00:00.000Z',
  ...extra,
})

describe('postCards', () => {
  it('gives the category label, the date in Poland and the address of the post', () => {
    expect(postCards([post('ksef-2027')], 1)).toEqual([
      {
        slug: 'ksef-2027',
        title: 'KSEF-2027',
        href: '/aktualnosci/ksef-2027',
        category: 'KSeF',
        date: '14.10.2026',
        dateTime: '2026-10-14T08:00:00.000Z',
      },
    ])
  })

  it('reads the date in Polish time (late evening UTC is the next day)', () => {
    expect(postCards([post('a', { publishedAt: '2026-10-13T22:30:00.000Z' })], 1)[0]?.date).toBe(
      '14.10.2026',
    )
  })

  it('drops posts of another tenant', () => {
    expect(
      postCards([post('obcy', { tenant: { id: 2 } }), post('swoj')], 1).map((p) => p.slug),
    ).toEqual(['swoj'])
  })

  it('has no category or date when the post has none', () => {
    expect(postCards([post('a', { category: null, publishedAt: null })], 1)[0]).toMatchObject({
      category: null,
      date: null,
      dateTime: null,
    })
  })
})

describe('postListCards', () => {
  const image = (tenant: number, extra: Record<string, unknown> = {}) => ({
    alt: 'Logo KSeF',
    url: '/api/media/file/ksef.webp',
    width: 400,
    height: 300,
    tenant,
    requiresConsent: false,
    ...extra,
  })

  it('adds the lead and a public cover of the same tenant', () => {
    const [item] = postListCards([post('a', { lead: '  Wstęp  ', cover: image(1) })], 1)
    expect(item?.lead).toBe('Wstęp')
    expect(item?.cover?.alt).toBe('Logo KSeF')
  })

  it('drops covers of another tenant or needing consent, and empty leads', () => {
    const items = postListCards(
      [
        post('obca', { cover: image(2), lead: ' ' }),
        post('zgoda', { cover: image(1, { requiresConsent: true }) }),
      ],
      1,
    )
    expect(items.map(({ cover, lead }) => ({ cover, lead }))).toEqual([
      { cover: null, lead: null },
      { cover: null, lead: null },
    ])
  })
})
