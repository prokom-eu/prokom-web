import { describe, expect, it } from 'vitest'

import fakty from '../../../seed/prokomsoftware/fakty.json'
import rozwiazania from '../../../seed/prokomsoftware/rozwiazania.json'
import wpisy from '../../../seed/prokomsoftware/wpisy.json'
import { plainText } from '../../lib/posts/content'
import { postFaq } from '../../lib/posts/faq'
import { META_DESCRIPTION_MAX } from '../../lib/seo/description'
import { isValidSlug } from '../../lib/tenant/uniqueSlug'
import { linksOf } from './markdown'
import { guidePostData, guidePosts, publishedAtIso } from './posts'

/**
 * Checks of the guide posts in `seed/prokomsoftware/wpisy/*.md` (SEO 15.11) on the real files:
 * the shape the panel accepts, SEO lengths, links that lead somewhere, prices only as tokens of
 * the solutions (zero new amounts), no copied sentences between posts.
 */

const posts = guidePosts()
const solutions = new Map(rozwiazania.items.map((item) => [item.slug, item]))
const facts = fakty.facts as Record<string, string | null>
const slugs = new Set(posts.map((post) => post.slug))

/** Pages of the Software line that a post may link to (besides solutions and posts). */
const PAGES = new Set([
  '/',
  '/rozwiazania',
  '/dobierz',
  '/audyt',
  '/cennik',
  '/kontakt',
  '/o-firmie',
  '/aktualnosci',
])
/** „Title | PRO-KOM Software” must fit the 65 characters results show (`lib/software/meta`). */
const SEO_TITLE_MAX = 65 - ' | PRO-KOM Software'.length
/** Brands of other companies (spec: no competitor names); WordPress is the topic of a post. */
const BRANDS =
  /\b(booking\.?com|airbnb|wix|shopify|shoper|idosell|woocommerce|squarespace|webflow|chatgpt|openai)\b/i

const textOf = (nodes: readonly object[]) => nodes.map(plainText).join('\n')
/** Fields shown unfilled (lists, metadata, the side card); the summary is filled like the text. */
const fields = (post: (typeof posts)[number]) => [
  post.title,
  post.lead,
  post.seo.title,
  post.seo.description,
  post.cta.title,
  post.cta.text,
]

describe('publishedAtIso', () => {
  it('stores a day alone as noon UTC and a day with an hour in Polish time', () => {
    expect(publishedAtIso('2026-11-15')).toBe('2026-11-15T12:00:00.000Z')
    // November: CET (UTC+1); July: CEST (UTC+2).
    expect(publishedAtIso('2026-11-15 12:40')).toBe('2026-11-15T11:40:00.000Z')
    expect(publishedAtIso('2026-07-01 00:10')).toBe('2026-06-30T22:10:00.000Z')
    // Days of the clock change: the offset of the moment itself.
    expect(publishedAtIso('2026-03-29 01:30')).toBe('2026-03-29T00:30:00.000Z')
    expect(publishedAtIso('2026-03-29 03:30')).toBe('2026-03-29T01:30:00.000Z')
    expect(publishedAtIso('2026-10-25 01:30')).toBe('2026-10-24T23:30:00.000Z')
    expect(publishedAtIso('2026-10-25 04:00')).toBe('2026-10-25T03:00:00.000Z')
  })

  it('refuses anything else', () => {
    for (const value of ['15.11.2026', '2026-11-15 24:00', '2026-11-15T12:00', '2026-11-15 9:00'])
      expect(() => publishedAtIso(value), value).toThrow()
  })
})

describe('guide posts (wpisy/*.md)', () => {
  it('has 10+ posts with unique, valid slugs and no clash with the package post', () => {
    expect(posts.length).toBeGreaterThanOrEqual(10)
    expect(slugs.size).toBe(posts.length)
    for (const post of posts) {
      expect(isValidSlug(post.slug), post.file).toBe(true)
      expect(post.file, post.file).toBe(`${post.slug}.md`)
    }
    for (const item of wpisy.items) expect(slugs.has(item.slug)).toBe(false)
  })

  it('has one moment per post, so „najnowsze” has one order', () => {
    const moments = posts.map((post) => publishedAtIso(post.publishedAt))
    expect(new Set(moments).size).toBe(posts.length)
  })

  it('fits the field limits of the panel and of search results', () => {
    for (const post of posts) {
      expect(post.lead.length, `${post.file} lead`).toBeLessThanOrEqual(300)
      expect(post.summary.length, `${post.file} summary`).toBeLessThanOrEqual(400)
      expect(post.seo.title.length, `${post.file} seoTitle`).toBeLessThanOrEqual(SEO_TITLE_MAX)
      expect(post.seo.description.length, `${post.file} seoDescription`).toBeLessThanOrEqual(
        META_DESCRIPTION_MAX,
      )
      expect(post.seo.description.length, `${post.file} seoDescription`).toBeGreaterThanOrEqual(110)
      expect(post.cta.eyebrow.length, `${post.file} cta`).toBeLessThanOrEqual(40)
      expect(post.cta.title.length, `${post.file} cta`).toBeLessThanOrEqual(80)
      expect(post.cta.text.length, `${post.file} cta`).toBeLessThanOrEqual(240)
    }
  })

  it('has h2 sections, a few hundred words at least and a FAQ of 2+ questions when present', () => {
    for (const post of posts) {
      const data = guidePostData(post, () => 1)
      const h2 = post.nodes.filter((node) => (node as { tag?: string }).tag === 'h2')
      expect(h2.length, post.file).toBeGreaterThanOrEqual(3)
      const words = textOf(post.nodes).split(/\s+/).filter(Boolean).length
      expect(words, post.file).toBeGreaterThanOrEqual(700)
      const faq = postFaq(data.content as never)
      if (faq.length > 0) expect(faq.length, post.file).toBeGreaterThanOrEqual(2)
    }
  })

  it('links only to pages, solutions and posts that exist, and to the wizard and an offer', () => {
    for (const post of posts) {
      const links = [...linksOf(post.nodes), post.cta.href]
      for (const href of links) {
        if (href.startsWith('https://')) continue
        const solution = /^\/rozwiazania\/([a-z0-9-]+)$/.exec(href)?.[1]
        const other = /^\/aktualnosci\/([a-z0-9-]+)$/.exec(href)?.[1]
        // Another post: published on the same day or earlier (a future day is a 404 until then;
        // the hour only orders one day); the package post of `wpisy.json` is a draft, so it is
        // never a link target.
        const target = posts.find((item) => item.slug === other)
        const day = (value: string) => value.slice(0, 10)
        const known =
          PAGES.has(href) ||
          (solution !== undefined && solutions.has(solution)) ||
          (target !== undefined && day(target.publishedAt) <= day(post.publishedAt))
        expect(known, `${post.file}: ${href}`).toBe(true)
      }
      expect(links.includes('/dobierz'), `${post.file}: link do /dobierz`).toBe(true)
      expect(
        links.some((href) => href.startsWith('/rozwiazania/')),
        post.file,
      ).toBe(true)
      expect(post.relatedSolutions.length, post.file).toBeGreaterThanOrEqual(1)
      expect(post.relatedSolutions.length, post.file).toBeLessThanOrEqual(3)
      for (const slug of post.relatedSolutions) expect(solutions.has(slug), slug).toBe(true)
    }
  })

  it('names prices and terms only as tokens of priced solutions and filled facts', () => {
    for (const post of posts) {
      const body = `${textOf(post.nodes)}\n${post.summary}`
      // An amount typed in the text would go stale when the panel price changes (decyzja 10).
      expect(body, post.file).not.toMatch(/\d\s?zł/)
      for (const [, slug] of body.matchAll(/\{cena:([a-z0-9-]+)\}/g)) {
        expect(
          solutions.get(slug ?? '')?.priceFrom,
          `${post.file}: {cena:${slug}}`,
        ).toBeGreaterThan(0)
      }
      for (const [, slug] of body.matchAll(/\{termin:([a-z0-9-]+)\}/g)) {
        expect(solutions.get(slug ?? '')?.leadTime, `${post.file}: {termin:${slug}}`).toBeTruthy()
      }
      for (const [, key] of body.matchAll(/\[([A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ0-9 -]*)\]/g)) {
        expect(facts[key ?? ''], `${post.file}: [${key}]`).toBeTruthy()
      }
      // A heading that drops on production would leave its section (or FAQ answer) under the
      // previous one: headings hold no tokens.
      for (const node of post.nodes.filter((n) => (n as { type?: string }).type === 'heading')) {
        expect(plainText(node), post.file).not.toMatch(/\{(cena|termin)[:}]|\[[A-ZĄĆĘŁŃÓŚŹŻ]/)
      }
      // Title, lead, SEO and the side card are shown unfilled (lists, metadata): no tokens there.
      for (const value of fields(post)) {
        expect(value, post.file).not.toMatch(/\{(cena|termin)[:}]|\[[A-ZĄĆĘŁŃÓŚŹŻ]/)
        expect(value, post.file).not.toMatch(/\d\s?zł/)
      }
    }
  })

  it('names no other companies’ products', () => {
    for (const post of posts) {
      const all = [textOf(post.nodes), post.summary, ...fields(post)].join('\n')
      expect(all, post.file).not.toMatch(BRANDS)
    }
  })

  it('repeats no sentence of 8+ words between posts (SEO: no copied text)', () => {
    const seen = new Map<string, string>()
    for (const post of posts) {
      const sentences = textOf(post.nodes)
        .split(/(?<=[.!?])\s+|\n/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.split(/\s+/).length >= 8)
      for (const sentence of new Set(sentences)) {
        const other = seen.get(sentence)
        expect(other, `${post.file} = ${other}: ${sentence}`).toBeUndefined()
        seen.set(sentence, post.file)
      }
    }
  })
})
