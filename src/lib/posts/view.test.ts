import { describe, expect, it } from 'vitest'

import type { Post } from '@/payload-types'

import { buildPostView } from './view'

const NOW = new Date('2026-10-25T09:00:00.000Z')

const content = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        tag: 'h2',
        version: 1,
        children: [{ type: 'text', text: 'Pierwszy krok' }],
      },
      { type: 'paragraph', version: 1, children: [{ type: 'text', text: 'Treść wpisu.' }] },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
} as Post['content']

const post = (extra: Partial<Post> = {}): Post => ({
  id: 1,
  tenant: 1,
  title: 'KSeF od 1 stycznia 2027',
  slug: 'ksef-2027',
  category: 'ksef',
  publishedAt: '2026-10-14T00:00:00.000Z',
  updatedAt: '2026-10-14T10:00:00.000Z',
  createdAt: '2026-10-14T10:00:00.000Z',
  content,
  ...extra,
})

describe('buildPostView', () => {
  it('gives the date, reading time and category of the post', () => {
    const view = buildPostView(post({ lead: ' Wstęp ' }), 1, NOW)
    expect(view).toMatchObject({
      href: '/aktualnosci/ksef-2027',
      category: 'KSeF',
      published: { date: '14.10.2026' },
      updated: null,
      minutes: 1,
      lead: 'Wstęp',
      summary: null,
    })
  })

  it('shows the update date only for a change on a later day', () => {
    expect(buildPostView(post({ updatedAt: '2026-10-20T08:00:00.000Z' }), 1, NOW).updated).toEqual({
      date: '20.10.2026',
      dateTime: '2026-10-20T08:00:00.000Z',
    })
  })

  it('does not call a post entered later with an earlier date „updated”', () => {
    const entered = post({
      createdAt: '2026-10-25T07:00:00.000Z',
      updatedAt: '2026-10-25T08:00:00.000Z',
    })
    expect(buildPostView(entered, 1, NOW).updated).toBeNull()
  })

  it('claims the earliest verification date of the sources', () => {
    const view = buildPostView(
      post({
        sources: [
          { name: ' MF ', url: 'https://www.gov.pl/', verifiedAt: '2026-10-15T00:00:00.000Z' },
          {
            name: 'KSeF',
            url: 'https://ksef.podatki.gov.pl/',
            verifiedAt: '2026-10-10T00:00:00.000Z',
          },
        ],
      }),
      1,
      NOW,
    )
    expect(view.sources.map(({ name }) => name)).toEqual(['MF', 'KSeF'])
    expect(view.verified?.date).toBe('10.10.2026')
  })

  it('has a CTA only with a title and a whole link, a counter only before its day', () => {
    const view = buildPostView(
      post({
        aside: {
          cta: { title: 'Wdrożymy KSeF', link: { label: 'Zapytaj', href: '/kontakt' } },
          countdown: { label: 'Ile dni do 1.01.2027', date: '2027-01-01T00:00:00.000Z' },
        },
      }),
      1,
      NOW,
    )
    expect(view.cta).toEqual({
      eyebrow: null,
      title: 'Wdrożymy KSeF',
      text: null,
      link: { label: 'Zapytaj', href: '/kontakt' },
    })
    expect(view.countdown?.label).toBe('Ile dni do 1.01.2027')

    const partial = buildPostView(
      post({
        aside: {
          cta: { title: 'Bez linku', link: { label: 'Zapytaj', href: null } },
          countdown: { label: 'Po terminie', date: '2026-10-01T00:00:00.000Z' },
        },
      }),
      1,
      NOW,
    )
    expect(partial.cta).toBeNull()
    expect(partial.countdown).toBeNull()
  })

  it('keeps related products and the cover of the same tenant only', () => {
    const product = (id: number, tenant: number) =>
      ({ id, slug: `p-${id}`, tenant }) as unknown as NonNullable<Post['relatedProducts']>[number]
    const view = buildPostView(post({ relatedProducts: [product(1, 1), product(2, 2), 3] }), 1, NOW)
    expect(view.relatedProducts).toEqual(['p-1'])
    expect(view.cover).toBeNull()
  })

  it('keeps related solutions of the same tenant only and the author with a name (SW11b)', () => {
    const solution = (id: number, tenant: number) =>
      ({ id, slug: `s-${id}`, tenant }) as unknown as NonNullable<Post['relatedSolutions']>[number]
    const view = buildPostView(
      post({
        relatedSolutions: [solution(1, 1), solution(2, 2), 3],
        author: { name: ' Krystian Potaczek ', role: 'PRO-KOM Software', bio: '', photo: null },
      }),
      1,
      NOW,
    )
    expect(view.relatedSolutions).toEqual(['s-1'])
    expect(view.author).toEqual({
      name: 'Krystian Potaczek',
      role: 'PRO-KOM Software',
      bio: null,
      photo: null,
    })
    expect(buildPostView(post({ author: { name: '  ' } }), 1, NOW).author).toBeNull()
  })
})
