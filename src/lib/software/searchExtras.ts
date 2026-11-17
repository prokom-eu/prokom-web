import { categoryLabel, postHref } from '../posts/list'
import { cityHref } from './cities'
import { industryPageHref } from './industryPage'

/**
 * What the Software search window finds beside the offer and the pages (Krystian 16.11: „premium
 * jak w Biznesie”): the published posts, the industry pages and the city pages of one tenant.
 * Served by `/api/software-search` and fetched with the solutions index — never in the page's own
 * payload, so no page grows by it.
 */
export type SearchExtras = {
  posts: {
    slug: string
    title: string
    href: string
    lead: string | null
    /** Category value (the cover's scene and colour) and its label. */
    category: string | null
    categoryLabel: string | null
    minutes: number
  }[]
  industries: { slug: string; name: string; href: string }[]
  cities: { slug: string; name: string; href: string }[]
}

export const EMPTY_EXTRAS: SearchExtras = { posts: [], industries: [], cities: [] }

/** Longest lead kept for the search (the window shows two lines of it). */
const LEAD_MAX = 220

const clip = (text: string | null) =>
  text && text.length > LEAD_MAX ? `${text.slice(0, LEAD_MAX - 1).trimEnd()}…` : text

/** The extras from the tenant's lists (posts newest first, as the news page orders them). */
export function buildSearchExtras(input: {
  posts: readonly {
    slug: string
    title: string
    lead: string | null
    categoryValue: string | null
    minutes: number
  }[]
  industries: readonly { slug: string; name: string }[]
  cities: readonly { slug: string; name: string }[]
}): SearchExtras {
  return {
    posts: input.posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      href: postHref(post.slug, 'software'),
      lead: clip(post.lead),
      category: post.categoryValue,
      categoryLabel: categoryLabel(post.categoryValue),
      minutes: post.minutes,
    })),
    industries: input.industries.map(({ slug, name }) => ({
      slug,
      name,
      href: industryPageHref(slug),
    })),
    cities: input.cities.map(({ slug, name }) => ({ slug, name, href: cityHref(slug) })),
  }
}
