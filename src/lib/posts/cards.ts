import { publicImage, type PublicImage } from '../media/public'
import { tenantIdOf } from '../tenant/id'
import type { Line } from '../tenant/lines'
import { categoryLabel, postHref } from './list'

export type PostCard = {
  slug: string
  title: string
  href: string
  category: string | null
  /** "14.10.2026", in Polish time. */
  date: string | null
  /** For `<time dateTime>`. */
  dateTime: string | null
}

/** Card of the news list: the base card plus the lead and the cover. */
export type PostListCard = PostCard & { lead: string | null; cover: PublicImage | null }

type PostLike = {
  slug: string
  title: string
  tenant?: unknown
  category?: string | null
  publishedAt?: string | null
}

type PostListLike = PostLike & { lead?: string | null; cover?: unknown }

const DATE = new Intl.DateTimeFormat('pl-PL', {
  timeZone: 'Europe/Warsaw',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** A date from the panel as "14.10.2026" in Polish time plus its ISO form, or `null`. */
export function postDate(
  value: string | null | undefined,
): { date: string; dateTime: string } | null {
  const parsed = value ? new Date(value) : null
  if (!parsed || Number.isNaN(parsed.getTime())) return null
  return { date: DATE.format(parsed), dateTime: parsed.toISOString() }
}

const ownPosts = <T extends PostLike>(posts: readonly T[], tenantId: number) =>
  posts.filter((post) => tenantIdOf(post.tenant) === tenantId)

const card = (post: PostLike, line?: Line | null): PostCard => {
  const published = postDate(post.publishedAt)
  return {
    slug: post.slug,
    title: post.title,
    href: postHref(post.slug, line),
    category: categoryLabel(post.category),
    date: published?.date ?? null,
    dateTime: published?.dateTime ?? null,
  }
}

/**
 * Cards of `/aktualnosci` and „Czytaj też” (the Instalacje guide with its `line`: `/poradnik/…`).
 * Posts of another tenant are dropped here too, whatever the query did; the cover only when public.
 */
export function postListCards(
  posts: readonly PostListLike[],
  tenantId: number,
  line?: Line | null,
): PostListCard[] {
  return ownPosts(posts, tenantId).map((post) => ({
    ...card(post, line),
    lead: post.lead?.trim() || null,
    cover: publicImage(post.cover, tenantId),
  }))
}
