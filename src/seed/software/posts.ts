import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Post } from '../../payload-types'
import { richText } from '../biznes/lexical'
import { parseMarkdownPost } from './markdown'
import type { PostData, SolutionRef } from './map'

/**
 * The Software guide posts of `seed/prokomsoftware/wpisy/*.md` (SEO, 15.11): written in
 * Markdown (`markdown.ts`), imported published with the date of their header. A date in the
 * future hides the post until that day (`publishedUntil`), so the posts come out one by one.
 * Locally `pnpm seed:software`; on staging and production `pnpm software:posts` (REST).
 */

/** Folder of the post files, relative to the repo root (seed and scripts run from there). */
export const GUIDE_POSTS_DIR = join('seed', 'prokomsoftware', 'wpisy')

const CATEGORY: Record<string, Post['category']> = {
  Poradnik: 'poradnik',
  Strony: 'strony',
  Systemy: 'systemy',
  Automatyzacje: 'automatyzacje',
  Bezpieczeństwo: 'bezpieczenstwo',
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

export type GuidePost = {
  file: string
  slug: string
  title: string
  category: Post['category']
  /** `YYYY-MM-DD`; saved as noon UTC, the same day in Polish time. */
  publishedAt: string
  lead: string
  summary: string
  seo: { title: string; description: string }
  relatedSolutions: string[]
  cta: { eyebrow: string; title: string; text: string; label: string; href: string }
  sources: { name: string; url: string; verifiedAt: string }[]
  nodes: object[]
}

function required(meta: Record<string, string>, key: string, file: string): string {
  const value = meta[key]?.trim()
  if (!value) throw new Error(`${file}: brak pola „${key}”.`)
  return value
}

const split = (value: string | undefined) =>
  (value ?? '')
    .split(value?.includes('|') ? '|' : ',')
    .map((part) => part.trim())
    .filter(Boolean)

/** One post file → its data (pure: the checks of the package are in `posts.test.ts`). */
export function guidePostOf(file: string, source: string): GuidePost {
  const { meta, sources, nodes } = parseMarkdownPost(source, file)
  const category = CATEGORY[required(meta, 'category', file)]
  if (!category) throw new Error(`${file}: nieznana kategoria „${meta.category}”.`)
  const publishedAt = required(meta, 'publishedAt', file)
  if (!DATE.test(publishedAt)) throw new Error(`${file}: publishedAt jako RRRR-MM-DD.`)
  // Required: the side card leads to the offer (an empty one would show the audit card instead).
  const ctaParts = split(required(meta, 'cta', file))
  if (ctaParts.length !== 5)
    throw new Error(`${file}: cta = etykieta | tytuł | tekst | przycisk | link.`)
  const [eyebrow = '', title = '', text = '', label = '', href = ''] = ctaParts
  return {
    file,
    slug: required(meta, 'slug', file),
    title: required(meta, 'title', file),
    category,
    publishedAt,
    lead: required(meta, 'lead', file),
    summary: required(meta, 'summary', file),
    seo: {
      title: required(meta, 'seoTitle', file),
      description: required(meta, 'seoDescription', file),
    },
    relatedSolutions: split(meta.relatedSolutions),
    cta: { eyebrow, title, text, label, href },
    sources: sources.map((line) => {
      const [name = '', url = '', verifiedAt = ''] = split(line)
      if (!name || !url || !DATE.test(verifiedAt))
        throw new Error(`${file}: source = nazwa | https://… | RRRR-MM-DD.`)
      return { name, url, verifiedAt }
    }),
    nodes,
  }
}

/** Every post file of the package, in file name order. */
export function guidePosts(dir = GUIDE_POSTS_DIR): GuidePost[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => guidePostOf(name, readFileSync(join(dir, name), 'utf8')))
}

/** The author of the package's posts — the same as the first post (`softwarePostData`). */
export const GUIDE_AUTHOR = {
  name: 'Krystian Potaczek',
  role: 'PRO-KOM Software',
  bio: 'Prowadzi Software w PRO-KOM: buduje strony w Next.js i systemy w Django, w tym nasz prokomserwis.pl.',
}

/**
 * The post as collection data. `solution` finds the id of a solution by slug (the local seed and
 * the REST script have their own lookups); an unknown slug is an error, not a silent gap.
 */
export function guidePostData(post: GuidePost, solution: SolutionRef): PostData {
  return {
    title: post.title,
    slug: post.slug,
    category: post.category,
    publishedAt: `${post.publishedAt}T12:00:00.000Z`,
    lead: post.lead,
    summary: post.summary,
    content: richText<Post['content']>(post.nodes),
    // As Payload stores a day: midnight UTC (compared on the next run, so no new version).
    sources: post.sources.map((s) => ({ ...s, verifiedAt: `${s.verifiedAt}T00:00:00.000Z` })),
    relatedSolutions: post.relatedSolutions.map((slug) => {
      const id = solution(slug)
      if (id === undefined) throw new Error(`${post.file}: nieznane rozwiązanie „${slug}”.`)
      return id
    }),
    author: GUIDE_AUTHOR,
    aside: {
      cta: {
        eyebrow: post.cta.eyebrow,
        title: post.cta.title,
        text: post.cta.text,
        link: { label: post.cta.label, href: post.cta.href },
      },
    },
    seo: { title: post.seo.title, description: post.seo.description },
  } as PostData
}
