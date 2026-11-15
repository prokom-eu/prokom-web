import type { Post } from '../../../payload-types'

/** Biznes post categories (`POST_CATEGORIES`, line `biznes`). */
export type BiznesPostCategory = Extract<
  Post['category'],
  'ksef' | 'kasy' | 'terminale' | 'dofinansowania' | 'programy' | 'it-w-firmie'
>

/**
 * One Biznes guide post written in the repo (audyt 15.11 P1-3, decyzja Krystiana: 24 wpisy,
 * published at once). The seed creates a missing post and never touches an existing one, so an
 * edit in the panel always wins. Every legal fact has an official source (spec. §6.9).
 */
export type BiznesGuidePost = {
  slug: string
  title: string
  category: BiznesPostCategory
  /** Under the title and in the list: at most 300 characters. */
  lead: string
  /** „W skrócie” above the content: 2–3 sentences, at most 400 characters. */
  summary: string
  /** Top-level Lexical nodes (`h2`, `p`, `ul` from `../lexical`). */
  content: object[]
  /** The date every source was checked (ISO day). */
  verifiedAt: string
  sources: { name: string; url: string }[]
  /** Slugs of Biznes product cards shown under the post (at most 6; a missing one is skipped). */
  products: string[]
  cta: { eyebrow: string; title: string; text: string; link: { label: string; href: string } }
  contact: { heading: string; lead: string }
  /** Title (13–43 characters, without the site name) and description (100–155) for search. */
  seo: { title: string; description: string }
}
