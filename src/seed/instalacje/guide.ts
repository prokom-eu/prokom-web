import type { Payload } from 'payload'

import type { Post } from '../../payload-types'
import { FORMER_SLUGS, GUIDE_POSTS, type GuidePostData } from '../../sites/instalacje/dane/wpisy'
import { h2, p, richText, ul } from '../biznes/lexical'
import { SEED_CONTEXT } from '../config'

type Inline = Parameters<typeof p>[number]
type GuidePostSeed = Pick<
  Post,
  'title' | 'slug' | 'category' | 'publishedAt' | 'lead' | 'content' | 'seo'
>

/** `[text](/path)` → a link, `**text**` → bold, the rest plain text. */
export function inlinePieces(text: string): Inline[] {
  return text
    .split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((piece) => {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(piece)
      if (link) return { text: link[1] ?? '', href: link[2] ?? '' }
      const bold = /^\*\*([^*]+)\*\*$/.exec(piece)
      return bold ? { bold: bold[1] ?? '' } : piece
    })
}

/**
 * Runda v6 §3 (INST-6 PR5): a post of `dane/wpisy` as the panel's `Posts` fields — the sections as
 * h2 + paragraphs and lists. The widgets of the post (summary, checklist, table, FAQ…) stay in code.
 */
export function guidePostSeed(post: GuidePostData): GuidePostSeed {
  const content = post.sections.flatMap((section) => [
    h2(section.heading),
    ...section.blocks.map((block) =>
      typeof block === 'string'
        ? p(...inlinePieces(block))
        : ul(...block.map((item) => inlinePieces(item))),
    ),
  ])
  return {
    title: post.title,
    slug: post.slug,
    category: post.category,
    publishedAt: post.publishedAt,
    lead: post.lead,
    content: richText<Post['content']>(content),
    seo: post.seo,
  }
}

export const guidePostsToImport = (): GuidePostSeed[] => GUIDE_POSTS.map(guidePostSeed)

/** The former slug of a post (D1: `monitoring-a-rodo` → `kamery-w-pensjonacie`), if it had one. */
export const formerSlugOf = (slug: string): string | undefined =>
  Object.entries(FORMER_SLUGS).find(([, now]) => now === slug)?.[0]

type Count = (name: string, result: 'created' | 'updated' | 'skipped') => void

/**
 * Creates and publishes the guide posts of the line while missing; a post still under its former
 * slug gets the new slug and texts. Then they belong to the panel (`pnpm inst:texts` carries later
 * changes of the repo).
 */
export async function seedInstalacjeGuide(payload: Payload, tenantId: number, count: Count) {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  const find = async (slug: string) =>
    (
      await payload.find({
        collection: 'posts',
        where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }] },
        limit: 1,
        ...local,
      })
    ).docs[0]
  for (const post of guidePostsToImport()) {
    if (await find(post.slug)) {
      count('posts', 'skipped')
      continue
    }
    const former = formerSlugOf(post.slug)
    const old = former ? await find(former) : undefined
    if (old) {
      await payload.update({
        collection: 'posts',
        id: old.id,
        data: { ...post, _status: 'published' },
        ...local,
      })
      count('posts', 'updated')
      continue
    }
    await payload.create({
      collection: 'posts',
      data: { ...post, tenant: tenantId, _status: 'published' },
      ...local,
    })
    count('posts', 'created')
  }
}
