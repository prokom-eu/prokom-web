import { describe, expect, it } from 'vitest'

import { POST_CATEGORIES } from '../../lib/catalog/options'
import { guidePostData, publishedDates } from './guidePosts'
import { BIZNES_GUIDE_POSTS, type BiznesGuidePost } from './wpisy'

type Node = { text?: string; children?: Node[]; fields?: { url?: string } }

/** Every text of the post a reader sees: title, lead, summary, content, CTA and contact. */
function visibleText(post: BiznesGuidePost): string {
  const walk = (node: Node): string[] => [
    ...(node.text ? [node.text] : []),
    ...(node.children ?? []).flatMap(walk),
  ]
  return [
    post.title,
    post.lead,
    post.summary,
    ...(post.content as Node[]).flatMap(walk),
    post.cta.title,
    post.cta.text,
    post.contact.heading,
    post.contact.lead,
    post.seo.description,
  ].join('\n')
}

function links(post: BiznesGuidePost): string[] {
  const walk = (node: Node): string[] => [
    ...(node.fields?.url ? [node.fields.url] : []),
    ...(node.children ?? []).flatMap(walk),
  ]
  return [...(post.content as Node[]).flatMap(walk), post.cta.link.href]
}

/** Amounts of the regulations the posts may quote (K4-FINAL §1: no product prices). */
const LEGAL_AMOUNTS = ['700 zł', '300 zł', '450 zł', '20 000 zł', '10 000 zł']

/** Official sources only (spec. §6.9): MF, government portals, the acts. */
const OFFICIAL = /^https:\/\/([a-z0-9-]+\.)*(gov\.pl|sejm\.gov\.pl)\//

describe('Biznes guide posts — content rules (audyt 15.11 P1-3)', () => {
  it('unique slugs, Biznes categories', () => {
    const slugs = BIZNES_GUIDE_POSTS.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    const allowed = POST_CATEGORIES.filter((c) => c.line === 'biznes').map((c) => c.value)
    for (const post of BIZNES_GUIDE_POSTS) expect(allowed, post.slug).toContain(post.category)
  })

  it.each(BIZNES_GUIDE_POSTS.map((post) => [post.slug, post] as const))(
    '%s: lengths of the fields and search texts',
    (_, post) => {
      expect(post.lead.length).toBeLessThanOrEqual(300)
      expect(post.summary.length).toBeLessThanOrEqual(400)
      expect(post.seo.title.length).toBeGreaterThanOrEqual(13)
      expect(post.seo.title.length).toBeLessThanOrEqual(43)
      expect(post.seo.description.length).toBeGreaterThanOrEqual(100)
      expect(post.seo.description.length).toBeLessThanOrEqual(155)
      expect(post.cta.eyebrow.length).toBeLessThanOrEqual(40)
      expect(post.cta.title.length).toBeLessThanOrEqual(80)
      expect(post.cta.text.length).toBeLessThanOrEqual(240)
      expect(post.contact.heading.length).toBeLessThanOrEqual(80)
      expect(post.contact.lead.length).toBeLessThanOrEqual(240)
      expect(post.products.length).toBeLessThanOrEqual(6)
    },
  )

  it.each(BIZNES_GUIDE_POSTS.map((post) => [post.slug, post] as const))(
    '%s: official sources, internal links, no prices or banned words',
    (_, post) => {
      expect(post.sources.length).toBeGreaterThan(0)
      for (const source of post.sources) expect(source.url).toMatch(OFFICIAL)
      expect(post.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (const href of links(post)) expect(href, href).toMatch(/^\/[a-z0-9/#?=-]*$/)

      const text = visibleText(post)
      const amounts = text.match(/\d[\d\s ]*zł/g) ?? []
      for (const amount of amounts) {
        expect(LEGAL_AMOUNTS, amount).toContain(amount.replace(/[\s ]+/g, ' '))
      }
      expect(text).not.toMatch(/whatsapp|na piśmie|cen[ay] od|promocj/i)
      // KSeF token: kept with no end date (MF, 01.09.2026).
      expect(text).not.toMatch(/token\w* (działa|wygasa)/i)
    },
  )

  it('internal links to posts point to posts of this list', () => {
    const slugs = new Set(BIZNES_GUIDE_POSTS.map((post) => post.slug))
    for (const post of BIZNES_GUIDE_POSTS) {
      for (const href of links(post).filter((link) => link.startsWith('/aktualnosci/'))) {
        expect(slugs, href).toContain(href.replace('/aktualnosci/', ''))
      }
    }
  })
})

describe('guidePostData and publishedDates', () => {
  const [post] = BIZNES_GUIDE_POSTS

  it('stores the post published, with dated sources and at most 6 products', () => {
    const data = guidePostData(post!, [1, 2, 3, 4, 5, 6, 7], '2026-11-15T12:00:00.000Z')
    expect(data._status).toBe('published')
    expect(data.relatedProducts).toEqual([1, 2, 3, 4, 5, 6])
    expect(data.sources?.[0]?.verifiedAt).toBe(`${post!.verifiedAt}T00:00:00.000Z`)
    expect(data.aside?.cta?.link?.href).toBe(post!.cta.link.href)
    expect(guidePostData(post!, [], '2026-11-15T12:00:00.000Z')).not.toHaveProperty(
      'relatedProducts',
    )
  })

  it('dates one minute apart, the first the newest', () => {
    const dates = publishedDates(3, new Date('2026-11-15T12:00:00.000Z'))
    expect(dates).toEqual([
      '2026-11-15T12:00:00.000Z',
      '2026-11-15T11:59:00.000Z',
      '2026-11-15T11:58:00.000Z',
    ])
  })
})
