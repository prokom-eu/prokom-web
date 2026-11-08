import { describe, expect, it } from 'vitest'

import { COPY_WORDS } from '../../../lib/instalacje/copyWords'
import { LAW_WORDS } from '../../../lib/instalacje/lawWords'
import { solutionsWord } from './oferta'
import { GUIDE_ANSWERS, GUIDE_CATEGORIES, minutesWord } from './poradnik'
import { FORMER_SLUGS, GUIDE_POSTS, guidePostsForService, guideWords } from './wpisy'

describe('Polish plurals', () => {
  it('reading minutes', () => {
    expect([1, 2, 4, 5, 7, 12, 22, 25].map(minutesWord)).toEqual([
      'minuta',
      'minuty',
      'minuty',
      'minut',
      'minut',
      'minut',
      'minuty',
      'minut',
    ])
  })

  it('offer solutions', () => {
    expect([1, 3, 76, 112].map(solutionsWord)).toEqual([
      'rozwiązanie',
      'rozwiązania',
      'rozwiązań',
      'rozwiązań',
    ])
  })
})

/** Every string inside a value. */
function texts(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => texts(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => texts(v, out))
  return out
}

const keys = new Set(GUIDE_CATEGORIES.map((c) => c.key))

describe('guide hub (runda v6 §3.3)', () => {
  it('no „Przepisy” chip; the short answers: a category of the chips, 3–5 sentences, a section', () => {
    expect(GUIDE_CATEGORIES.map((c) => c.label)).not.toContain('Przepisy')
    for (const a of GUIDE_ANSWERS) {
      expect(keys.has(a.category), a.title).toBe(true)
      expect(a.href).toMatch(/^\/[a-z-]+#[a-z-]+$/)
      const sentences = a.text.split(/(?<=[.?])\s+/).length
      expect(sentences, a.title).toBeGreaterThanOrEqual(3)
      expect(sentences, a.title).toBeLessThanOrEqual(5)
    }
    expect(texts(GUIDE_ANSWERS).filter((t) => COPY_WORDS.test(t) || LAW_WORDS.test(t))).toEqual([])
  })
})

describe.each(GUIDE_POSTS.map((post) => [post.slug, post] as const))(
  'guide post %s (runda v6 §3.2)',
  (_, post) => {
    it('900–1500 words, the title ≤ 60, SEO title ≤ 60 with the site name, description 140–155', () => {
      const words = guideWords(post)
      expect(words).toBeGreaterThanOrEqual(900)
      expect(words).toBeLessThanOrEqual(1500)
      expect(post.title.length).toBeLessThanOrEqual(60)
      // The panel's `Posts.lead` takes 300 characters at most.
      expect(post.lead.length).toBeLessThanOrEqual(300)
      expect(`${post.seo.title} | PRO-KOM Instalacje`.length).toBeLessThanOrEqual(60)
      expect(post.seo.description.length).toBeGreaterThanOrEqual(140)
      expect(post.seo.description.length).toBeLessThanOrEqual(155)
    })

    it('a table of contents per section, 3–4 points „Jak to robimy”, 4–6 questions', () => {
      expect(post.extras.toc).toHaveLength(post.sections.length)
      expect(post.extras.howWeDo.length).toBeGreaterThanOrEqual(3)
      expect(post.extras.howWeDo.length).toBeLessThanOrEqual(4)
      expect(post.extras.faq.length).toBeGreaterThanOrEqual(4)
      expect(post.extras.faq.length).toBeLessThanOrEqual(6)
      expect(post.extras.checklist ?? post.extras.table).toBeTruthy()
      expect(keys.has(post.category)).toBe(true)
    })

    it('headings without a full stop; internal links to the line; no forbidden phrasing or law', () => {
      for (const s of post.sections) expect(s.heading, s.heading).not.toMatch(/\.$/)
      const links = texts(post.sections).flatMap((t) => [...t.matchAll(/\]\(([^)]+)\)/g)])
      expect(links.length).toBeGreaterThanOrEqual(2)
      for (const [, href] of links) expect(href).toMatch(/^\/[a-z0-9/#-]*$/)
      const all = texts(post)
      expect(all.filter((t) => COPY_WORDS.test(t) || LAW_WORDS.test(t))).toEqual([])
      expect(all.filter((t) => /\p{L}!/u.test(t))).toEqual([])
    })
  },
)

describe('guide posts together', () => {
  it('unique slugs, titles and SEO; the former camera address leads to a post', () => {
    for (const field of ['slug', 'title'] as const) {
      const values = GUIDE_POSTS.map((p) => p[field])
      expect(new Set(values).size).toBe(values.length)
    }
    const descriptions = GUIDE_POSTS.map((p) => p.seo.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
    expect(GUIDE_POSTS.map((p) => p.slug)).toContain(FORMER_SLUGS['monitoring-a-rodo'])
  })

  it('„Z Poradnika”: posts of the service category first, at most 3', () => {
    const kam = guidePostsForService('kam', '/monitoring')
    expect(kam.length).toBeLessThanOrEqual(3)
    expect(kam[0]?.category).toBe('monitoring')
    expect(guidePostsForService('ev', '/ladowarki-ev').map((p) => p.slug)).toContain(
      'ladowarka-do-auta-w-domu',
    )
  })
})
