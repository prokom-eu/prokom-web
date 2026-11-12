import type { PostCategory } from '@/lib/posts/list'

import type { InstIconName } from '../../icons'

/** Categories of the guide hub (runda v6 §3.3, without „Przepisy”). */
export type GuideCategory = Extract<
  PostCategory,
  'monitoring' | 'alarmy' | 'sieci' | 'smart-home' | 'ladowarki' | 'anteny' | 'noclegi'
>

/**
 * Runda v6 §3 (INST-6 PR5): one guide post of `/poradnik/<slug>`, written in the repo. The seed
 * (and `pnpm inst:texts`) writes `title`, `lead`, `content` and `seo` to the panel's post; the
 * rest is rendered by `GuidePost` from code.
 *
 * Content syntax: a section is an h2 (a question people type into Google) and blocks — a string
 * is a paragraph, an array of strings is a bullet list. Inline links: `[text](/path)`, bold:
 * `**text**`.
 */
export type GuideBlock = string | readonly string[]

export type GuideSection = { heading: string; blocks: readonly GuideBlock[] }

export type GuidePostData = {
  slug: string
  /** ≤ 60 characters; the H1. */
  title: string
  category: GuideCategory
  /** ISO date; `updatedAt` of the panel gives the update date. */
  publishedAt: string
  /** The first 2 sentences answer the title's question. */
  lead: string
  sections: readonly GuideSection[]
  /** `title` with „ | PRO-KOM Instalacje” ≤ 60; `description` 140–155. */
  seo: { title: string; description: string }
  extras: GuidePostExtras
}

export type GuidePostExtras = {
  /** Short labels of the table of contents, one per section (same order). */
  toc: readonly string[]
  /** „W skrócie”: 3–4 points at the top. */
  summary: readonly string[]
  /** A checklist with a result (the interactive „Sprawdź” widget) — or a table, or both. */
  checklist?: {
    heading: string
    items: readonly string[]
    /** Items ticked at the start (indexes). */
    initial: readonly number[]
    done: string
    /** „{n} z {all}. …” */
    partial: string
  }
  /** A comparison table (no equipment prices). */
  table?: {
    heading: string
    caption: string
    columns: readonly string[]
    rows: readonly (readonly string[])[]
  }
  /** „Jak to robimy w PRO-KOM”: 3–4 points. */
  howWeDo: readonly string[]
  /** 4–6 questions (`FAQPage`). */
  faq: readonly { question: string; answer: string }[]
  /** The ready description for `/zaplanuj?opis=` and the button label. */
  plan: { opis: string; label: string }
  /** Illustration of the post: an icon of the line's set and its alternative text. */
  art: { icon: InstIconName; alt: string }
  /** The side card. */
  aside: { title: string; text: string; link: { label: string; href: string } }
  /** 2–3 links: the service pages of the post (internal linking). */
  readAlso: readonly { label: string; href: string }[]
  /** The band before the footer. */
  band: { eyebrow: string; heading: string; text: string }
}
