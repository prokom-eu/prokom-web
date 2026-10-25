import type { Post } from '@/payload-types'

import { publicImage, type PublicImage } from '../media/public'
import { daysUntil } from '../site/days'
import { tenantIdOf } from '../tenant/id'
import { postDate } from './cards'
import { readingMinutes, type RichTextData } from './content'
import { categoryLabel, postHref } from './list'

type Dated = { date: string; dateTime: string }

export type PostSource = { name: string; url: string; verified: Dated | null }

export type PostView = {
  slug: string
  title: string
  href: string
  category: string | null
  published: Dated | null
  /** Set only when the post changed on a later day than it was published and entered. */
  updated: Dated | null
  minutes: number
  lead: string | null
  summary: string | null
  cover: PublicImage | null
  /** The page builds the outline from it (`postOutline`) — after the cache, not before. */
  content: RichTextData
  sources: PostSource[]
  /** The earliest verification date of the sources — what „Sprawdzono” may honestly claim. */
  verified: Dated | null
  cta: { eyebrow: string | null; title: string; text: string | null; link: Link } | null
  countdown: { label: string; date: string; caption: string | null } | null
  contact: { heading: string | null; lead: string | null }
  /** Slugs of related products of the same tenant; the page shows those in its catalog index. */
  relatedProducts: string[]
  seo: { title: string | null; description: string | null }
}

type Link = { label: string; href: string }

const text = (value: string | null | undefined) => value?.trim() || null

const link = (value: { label?: string | null; href?: string | null } | null | undefined) => {
  const label = text(value?.label)
  const href = text(value?.href)
  return label && href ? { label, href } : null
}

const WARSAW_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' })
const dayOf = (iso: string) => WARSAW_DAY.format(new Date(iso))

/**
 * What the post page renders (spec. §6.9, board `Wpis`), from a post read with depth 1. Images
 * and products of another tenant are dropped, as everywhere on the public site.
 */
export function buildPostView(post: Post, tenantId: number, now: Date): PostView {
  const published = postDate(post.publishedAt)
  // A post written today with an earlier publication date was not „updated” today: compare with
  // the later of publication and creation.
  const changed = postDate(post.updatedAt)
  const since = [published?.dateTime, postDate(post.createdAt)?.dateTime]
    .filter((value): value is string => Boolean(value))
    .map(dayOf)
    .sort()
    .at(-1)
  const updated = published && changed && since && dayOf(changed.dateTime) > since ? changed : null

  const sources = (post.sources ?? []).map((source) => ({
    name: source.name.trim(),
    url: source.url,
    verified: postDate(source.verifiedAt),
  }))
  const verified =
    sources
      .map((source) => source.verified)
      .filter((value): value is Dated => value !== null)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))[0] ?? null

  const ctaTitle = text(post.aside?.cta?.title)
  const ctaLink = link(post.aside?.cta?.link)
  const countdownLabel = text(post.aside?.countdown?.label)
  const countdownDate = post.aside?.countdown?.date ?? null

  const lead = text(post.lead)
  const summary = text(post.summary)
  const content = post.content as RichTextData

  return {
    slug: post.slug,
    title: post.title,
    href: postHref(post.slug),
    category: categoryLabel(post.category),
    published,
    updated,
    minutes: readingMinutes(content, [lead, summary]),
    lead,
    summary,
    cover: publicImage(post.cover, tenantId),
    content,
    sources,
    verified,
    cta:
      ctaTitle && ctaLink
        ? {
            eyebrow: text(post.aside?.cta?.eyebrow),
            title: ctaTitle,
            text: text(post.aside?.cta?.text),
            link: ctaLink,
          }
        : null,
    // A counter whose day has passed is left out (as `bzKsef` does).
    countdown:
      countdownLabel && countdownDate && daysUntil(countdownDate, now) !== null
        ? {
            label: countdownLabel,
            date: countdownDate,
            caption: text(post.aside?.countdown?.caption),
          }
        : null,
    contact: { heading: text(post.contact?.heading), lead: text(post.contact?.lead) },
    relatedProducts: (post.relatedProducts ?? []).flatMap((product) =>
      typeof product === 'object' && tenantIdOf(product.tenant) === tenantId ? [product.slug] : [],
    ),
    seo: { title: text(post.seo?.title), description: text(post.seo?.description) },
  }
}
