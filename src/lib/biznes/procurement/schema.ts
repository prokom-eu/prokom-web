import { z } from 'zod'

import { applyFlags, type ProcurementFlags } from './flags'

/**
 * Data of a procurement page (ZAOPATRZENIE §2): JSON of the `bzProcurementPage` block, from
 * `strony-k4.json → zaopatrzenie.agd|it`. Images are Media ids (the seed resolves the package's
 * file names). A missing section = no section; wrong data = no page content (panel shows why).
 */

const text = z.string().trim().min(1)
const image = z.number().int().positive().nullable()
const forms = z.tuple([text, text, text])
const when = z.enum(['pickup', 'warranty', 'lg', 'services', 'callback'])

/** An item that shows only with a §0 flag, optionally with a text for while it is off. */
function flaggable<S extends z.ZodRawShape>(shape: S) {
  const base = z.object(shape)
  return base.extend({ when: when.optional(), fallback: base.optional() })
}

const head = { eyebrow: z.string().optional(), heading: text, lead: z.string().optional() }
const box = z.object({
  left: z.string().optional(),
  right: z.string().optional(),
  top: z.string().optional(),
  bottom: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  z: z.number().int().optional(),
})
const link = z.object({ label: text, href: text })
const valueLabel = flaggable({ value: text, label: text })
const iconTitleText = z.object({ icon: text, title: text, text: text })

const brand = flaggable({
  name: text,
  /** Partner slug: the logo and link come from `Partners`. */
  partner: z.string().optional(),
  /** Logo from Media when the brand is not a partner (AGD makers). */
  image: image.optional(),
})

const item = z.object({
  image,
  icon: z.string().optional(),
  name: text,
  desc: text,
  qty: z.number().int().min(1).max(20),
  params: z.string().optional(),
  energy: z.string().max(2).optional(),
})

const configurator = z
  .object({
    ...head,
    typeLabel: text,
    countLabel: text,
    unit: forms,
    start: z.number().int().min(1).max(500),
    types: z
      .array(
        z.object({
          title: text,
          short: text,
          slug: z.string().regex(/^[a-z0-9-]+$/),
          items: z.array(item).min(1).max(12),
        }),
      )
      .min(1)
      .max(6),
    classLabel: z.string().optional(),
    classes: z.array(text).max(4).optional(),
    defaultClass: z.number().int().min(0).optional(),
    servicesLabel: z.string().optional(),
    more: z.string().optional(),
    delivery: z.object({
      label: text,
      options: z
        .array(z.object({ label: text, stages: z.number().int().min(1).max(6) }))
        .min(1)
        .max(6),
      defaultStages: z.number().int().min(1).max(6),
      word: forms,
      unit: forms,
      set: forms,
    }),
  })
  .superRefine((value, ctx) => {
    if (value.defaultClass !== undefined && value.defaultClass >= (value.classes?.length ?? 0)) {
      ctx.addIssue({ code: 'custom', path: ['defaultClass'], message: 'nie ma takiej klasy' })
    }
    if (!value.delivery.options.some((option) => option.stages === value.delivery.defaultStages)) {
      ctx.addIssue({
        code: 'custom',
        path: ['delivery', 'defaultStages'],
        message: 'nie ma takiej opcji dostawy',
      })
    }
  })

export const procurementPageSchema = z.object({
  variant: z.enum(['agd', 'it']),
  seo: z.object({ title: text }).optional(),
  hero: z.object({
    title: text,
    crumb: text,
    pill: text,
    heading: text,
    headingAccent: z.string().optional(),
    lead: text,
    action: link,
    marquee: text,
    stats: z.array(valueLabel).max(4),
    scene: z.array(z.object({ image, box })).max(6),
    chips: z.array(flaggable({ text, box, icon: text, live: z.boolean().optional() })).max(4),
  }),
  nav: z.array(z.object({ anchor: z.string().regex(/^[a-z][a-z0-9-]*$/), label: text })).max(10),
  who: z
    .object({
      ...head,
      tabs: z
        .array(
          z.object({
            title: text,
            icon: text,
            seasons: z.boolean().optional(),
            images: z.array(image).max(3),
            caption: z.object({ title: text, text }),
            heading: text,
            text,
            points: z.array(flaggable({ title: text, sub: text })).max(6),
          }),
        )
        .min(1)
        .max(6),
    })
    .optional(),
  seasons: z
    .object({
      heading: text,
      peak: z.array(z.number().int().min(1).max(12)),
      peakLabel: text,
      goodLabel: text,
    })
    .optional(),
  categories: z
    .object({
      ...head,
      list: z
        .array(
          z.object({
            image,
            name: text,
            brands: text,
            category: z.string().optional(),
            note: z.string().optional(),
          }),
        )
        .max(8),
    })
    .optional(),
  configurator,
  prep: z
    .object({
      ...head,
      tag: text,
      list: z
        .array(z.object({ title: text, sub: text }))
        .min(1)
        .max(12),
    })
    .optional(),
  offer: z.object({
    ...head,
    columns: z.array(text).min(4).max(5),
    variants: z.array(text).min(1).max(4),
    callouts: z.array(z.object({ title: text, text })).length(4),
    footer: z.array(flaggable({ text })).max(5),
    note: z.string().optional(),
  }),
  classes: z
    .object({
      heading: text,
      list: z.array(z.object({ name: text, for: text, text, points: z.array(text).max(4) })).max(4),
    })
    .optional(),
  guide: z.object({ ...head, list: z.array(iconTitleText).max(8) }),
  versus: z.object({
    ...head,
    rows: z.array(flaggable({ icon: text, title: text, without: text, with: text })).max(8),
  }),
  steps: z.object({
    ...head,
    items: z
      .array(flaggable({ title: text, text }))
      .min(1)
      .max(6),
    gantt: z.object({ title: text, note: text, unit: text }),
  }),
  programs: z.object({ ...head, list: z.array(brand.extend({ text })).max(6) }).optional(),
  industries: z
    .object({
      ...head,
      list: z.array(z.object({ icon: text, name: text, text, href: z.string().optional() })).max(8),
    })
    .optional(),
  care: z
    .object({
      ...head,
      actions: z.array(link).max(2),
      rows: z
        .array(
          z.object({
            icon: text,
            title: text,
            sub: text,
            status: z.enum(['ok', 'warn']),
            label: text,
          }),
        )
        .max(6),
    })
    .optional(),
  combo: z
    .object({
      ...head,
      link,
      list: z
        .array(z.object({ image, title: text, text, note: text, href: z.string().optional() }))
        .max(4),
    })
    .optional(),
  brands: z.object({ ...head, list: z.array(brand).max(16) }),
  facts: z.array(valueLabel).max(4),
  documents: z.object({
    heading: text,
    list: z.array(flaggable({ icon: text, title: text, sub: text })).max(6),
  }),
  faq: z.array(flaggable({ q: text, a: text })).max(10),
  form: z.object({
    heading: text,
    lead: z.string().optional(),
    who: z.array(text).max(8),
    whoLabel: text,
    whoMulti: z.boolean().optional(),
    countLabel: text,
    messageLabel: text,
    topic: text,
  }),
  cross: z
    .object({
      page: z.string().regex(/^[a-z0-9-]+$/),
      title: text,
      text,
      images: z.array(image).max(3),
    })
    .optional(),
})

export type ProcurementPageData = z.infer<typeof procurementPageSchema>

/** Page data with the §0 flags applied, or `null` when the JSON does not match. */
export function parseProcurementPage(
  value: unknown,
  flags: ProcurementFlags,
  variant: string | null | undefined,
): ProcurementPageData | null {
  const result = procurementPageSchema.safeParse(value ?? null)
  if (!result.success || result.data.variant !== variant) return null
  return applyFlags(result.data, flags)
}

/** Panel check of the block's JSON. */
export function validateProcurementPage(value: unknown): true | string {
  const result = procurementPageSchema.safeParse(value ?? null)
  if (result.success) return true
  const [issue] = result.error.issues
  return `Dane strony: ${issue?.path.join('.') || '(całość)'} — ${issue?.message ?? 'błąd'}`
}
