import { POST_CATEGORIES } from '../catalog/options'
import { tenantIdOf } from '../tenant/id'

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

type PostLike = {
  slug: string
  title: string
  tenant?: unknown
  category?: string | null
  publishedAt?: string | null
}

const DATE = new Intl.DateTimeFormat('pl-PL', {
  timeZone: 'Europe/Warsaw',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const categoryLabel = (value: string | null | undefined) =>
  POST_CATEGORIES.find((category) => category.value === value)?.label ?? null

/**
 * Cards of the latest posts (home page „Ostatnio w Aktualnościach”, spec. §4 pkt 11). Posts of
 * another tenant are dropped here too, whatever the query did.
 */
export function postCards(posts: readonly PostLike[], tenantId: number): PostCard[] {
  return posts
    .filter((post) => tenantIdOf(post.tenant) === tenantId)
    .map((post) => {
      const published = post.publishedAt ? new Date(post.publishedAt) : null
      const valid = published && !Number.isNaN(published.getTime()) ? published : null
      return {
        slug: post.slug,
        title: post.title,
        href: `/aktualnosci/${encodeURIComponent(post.slug)}`,
        category: categoryLabel(post.category),
        date: valid ? DATE.format(valid) : null,
        dateTime: valid ? valid.toISOString() : null,
      }
    })
}
