import { z } from 'zod'

// Data of the K4i sections (Opieka IT, O firmie, Kontakt — K34 §6–§8, K35 §0, K36 §13). The
// company card, phones, hours and address come from the panel (CompanyData, SiteSettings), not
// from here, so one change in the settings reaches every page.

const text = z.string().trim().min(1)
const slug = z.string().trim().min(1).max(120)
const link = z.object({ label: text, href: text })

/** Tone of a row of the sample IT report. */
export const REPORT_TONES = ['ok', 'warn', 'urgent', 'due'] as const

/** `care-hero`: Opieka IT hero with the sample report card (no price model — K4-FINAL §1). */
export const careHeroSchema = z.object({
  trail: z
    .array(z.object({ name: text, href: text }))
    .max(2)
    .default([]),
  pill: text,
  /** „Umów bezpłatny przegląd IT”: the product it lists and the note. */
  review: z.object({ slug, label: text, note: text }),
  stats: z.array(z.object({ v: text, k: text })).max(4),
  report: z.object({
    title: text,
    sub: text,
    rows: z.array(z.object({ t: text, d: text, s: text, tone: z.enum(REPORT_TONES) })).max(8),
    summary: z.object({ n: text, t: text, d: text }),
    badges: z.array(text).max(3),
  }),
})

/** `care-areas` (#zakres): areas of care as tabs, with the products we work on. */
export const careAreasSchema = z.object({
  areas: z
    .array(
      z.object({
        t: text,
        co: z.array(text).min(1).max(8),
        products: z.array(slug).max(4).default([]),
        image: slug.optional(),
      }),
    )
    .min(1)
    .max(10),
})

/** `switch-steps`: „Start opieki” / „Gdy coś się dzieje” — two step lists behind a switch. */
export const switchStepsSchema = z.object({
  modes: z
    .array(
      z.object({
        t: text,
        steps: z
          .array(z.object({ t: text, d: text }))
          .min(1)
          .max(6),
      }),
    )
    .min(2)
    .max(3),
})

/** `audience`: kinds of firms with what we look after, a product picture each. */
export const audienceSchema = z.object({
  items: z
    .array(z.object({ t: text, k: text, l: z.array(text).max(5), image: slug.optional() }))
    .min(1)
    .max(6),
})

/** `start-calendar`: first weeks of care and the calendar of dates that are easy to miss. */
export const startCalendarSchema = z.object({
  start: z.object({
    eyebrow: text,
    heading: text,
    items: z.array(z.object({ t: text, d: text })).max(8),
  }),
  calendar: z.object({
    eyebrow: text,
    heading: text,
    items: z.array(z.object({ m: text, t: text, d: text })).max(12),
    note: z.string().optional(),
  }),
})

/** `seats`: „Ile masz stanowisk?” — the pick goes into the note of the inquiry position. */
export const seatsSchema = z.object({
  slug,
  options: z.array(text).min(2).max(6),
  /** Button without a pick, and the note without one. */
  label: text,
  note: text,
})

/** `about-hero`: O firmie hero with the business card from the panel and 4 authorizations. */
export const aboutHeroSchema = z.object({
  pill: text,
  actions: z.array(link).max(2),
  stats: z.array(z.object({ v: text, k: text })).max(4),
  /** Brand slugs (Partners) of the authorizations, with the status in full words. */
  authorizations: z.array(z.object({ brand: slug, status: text })).max(4),
  register: link,
  photoNote: z.string().optional(),
})

/** `lines`: the lines of PRO-KOM (Biznes marked „Jesteś tutaj”). */
export const linesSchema = z.object({
  lines: z
    .array(
      z.object({ n: text, t: text, d: text, w: text, u: text, here: z.boolean().default(false) }),
    )
    .min(1)
    .max(6),
  note: z.string().optional(),
})

/** `brands`: groups of brands by status; logos from Partners, names where a brand has none. */
export const brandsSchema = z.object({
  groups: z
    .array(z.object({ k: text, names: z.array(text).min(1).max(30) }))
    .min(1)
    .max(4),
  note: z.string().optional(),
  action: link.optional(),
})

/**
 * `contact-hero`: Kontakt hero — status, 4 channels, the area map (shared `AreaMap`), the week
 * of hours with today marked; all contact data from the panel.
 */
export const contactHeroSchema = z.object({
  pill: z.string().optional(),
  /** „Z kasą do przeglądu możesz przyjechać sam…”. */
  bringNote: z.string().optional(),
})

/** `contact-form` (#formularz): texts on the left, the K4-FINAL §5 form with topic chips. */
export const contactFormSchema = z.object({
  topics: z.array(text).max(10),
  bullets: z.array(text).max(4),
  successText: z.string().optional(),
})
