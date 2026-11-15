import { z } from 'zod'

// Data of the K4j sections: /automaty-vendingowe (K32 §2), /ulga-na-kase-fiskalna (K35 §3) and
// the shared source list (sources only as links — K4-FINAL §1).

const text = z.string().trim().min(1)
const slug = z.string().trim().min(1).max(120)
const trail = z
  .array(z.object({ name: text, href: text }))
  .max(2)
  .default([])
const action = z.object({ label: text, href: text })

/** `vending-hero`: Optivendi logo and partner pill, proofs, three machines as a collage. */
export const vendingHeroSchema = z.object({
  trail,
  pill: text,
  logoBrand: slug.optional(),
  proof: z.array(z.object({ t: text, d: text })).max(4),
  collage: z.array(slug).max(3),
  badges: z.array(text).max(3),
  actions: z.array(action).max(2),
})

/** `vending-picker` (#co): what to sell → the machines that fit (product cards). */
export const vendingPickerSchema = z.object({
  tabs: z
    .array(z.object({ t: text, d: text, slugs: z.array(slug).min(1).max(8) }))
    .min(1)
    .max(8),
  /** Note of „+ Do zapytania” on a machine (board: „Automat vendingowy — dobór”). */
  note: text,
})

/** `app-mockup`: features of the machine software and a static phone screen. */
export const appMockupSchema = z.object({
  features: z.array(z.object({ t: text, d: text })).max(6),
  screen: z.object({
    title: text,
    status: text,
    figures: z.array(z.object({ k: text, v: text })).max(2),
    rows: z.array(z.object({ t: text, d: text })).max(4),
  }),
})

/** `catalog-tabs`: catalog cards of one category, a tab per subcategory (counts from the DB). */
export const catalogTabsSchema = z.object({
  category: slug,
  tabs: z
    .array(z.object({ t: text, subcategory: text }))
    .min(1)
    .max(6),
  note: z.string().optional(),
})

/** `sources`: the sources of the page's facts, each a link, and the „stan na” note. */
export const sourcesSchema = z.object({
  items: z
    .array(z.object({ t: text, url: z.string().regex(/^https:\/\//) }))
    .min(1)
    .max(8),
  note: z.string().optional(),
})

/** `ulga-hero`: the relief hero with four cards (K35 §3). */
export const ulgaHeroSchema = z.object({
  trail,
  pill: text,
  cards: z.array(z.object({ k: text, v: text, d: text })).length(4),
  actions: z.array(action).max(2),
})

/** `yes-no`: „Ulga przysługuje” / „Ulga nie przysługuje”. */
export const yesNoSchema = z.object({
  yes: z.object({ t: text, items: z.array(text).min(1).max(6) }),
  no: z.object({ t: text, items: z.array(text).min(1).max(6) }),
})

/** `notice`: a list with a side card („Kiedy trzeba oddać ulgę?”). */
export const noticeSchema = z.object({
  items: z.array(text).min(1).max(6),
  aside: z.object({ t: text, d: text }).optional(),
})
