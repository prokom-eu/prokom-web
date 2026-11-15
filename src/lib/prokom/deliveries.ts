import { z } from 'zod'

import {
  factItem,
  faqItem,
  firstIssue,
  hubHref,
  key,
  lineKey,
  nextItem,
  optionalText,
  text,
  titled,
  uniqueBy,
} from './schema'

/** Highest quantity of one item on the request list (spec §6.5 pkt 3). */
export const MAX_QTY = 999

const listItem = z.object({ key, title: text(80), hint: text(120) })

const segment = z.object({
  key,
  name: text(40),
  sub: text(80),
  line: lineKey,
  eyebrow: text(60),
  heading: text(160),
  start: text(120),
  lines: text(80),
  points: z.array(titled).min(1).max(6),
  cta: z.object({ label: text(60), href: hubHref }),
  form: z.object({
    heading: text(80),
    orgLabel: text(60),
    linkLabel: text(60),
    linkPlaceholder: text(120),
    descPlaceholder: text(240),
  }),
})

const object = z.object({
  key,
  title: text(60),
  example: text(80),
  heading: text(160),
  line: lineKey,
  /** „Wczytaj przykład do listy”: these quantities replace the list (spec §6.5 pkt 4). */
  preset: z
    .array(z.object({ item: key, qty: z.number().int().min(1).max(MAX_QTY) }))
    .min(1)
    .superRefine(uniqueBy((row) => row.item, 'Pozycja')),
  columns: z
    .array(
      z.object({
        title: text(60),
        lines: text(60),
        line: lineKey,
        /** `item` = a key of the request list (its quantity from the preset); `null` = ✓. */
        items: z.array(z.object({ title: text(80), item: key.nullable() })).min(1),
      }),
    )
    .min(1)
    .max(4),
})

const head = { eyebrow: text(80), title: text(120) }

/** Headings and labels of the page (board 17 HTML); the promise of a line comes from its panel. */
const pageSchema = z.object({
  hero: z.object({
    ...head,
    lead: text(400),
    cta: text(40),
    ways: z.array(z.object({ title: text(60), href: hubHref })).length(3),
    segmentsLabel: text(40),
    segmentsHint: text(80),
    start: text(30),
  }),
  areas: z.object({ ...head, lead: text(240), how: text(30), details: text(60) }),
  list: z.object({
    ...head,
    lead: text(240),
    yours: text(30),
    clear: text(20),
    pcs: text(10),
    empty: text(160),
    services: text(30),
    term: text(40),
    tvNote: text(200),
    attach: text(40),
    copy: text(40),
    copied: text(40),
    copyFailed: text(120),
    bar: text(20),
    send: text(30),
  }),
  objects: z.object({ ...head, lead: text(240), load: text(40), note: text(200) }),
  scope: z.object({ ...head, tabsLabel: text(80), optional: text(200) }),
  steps: z.object(head),
  brands: z.object({ ...head, all: text(40), note: text(200) }),
  compare: z.object({ ...head, area: text(20), other: text(30), ours: text(30) }),
  formal: z.object(head),
  after: z.object({ ...head, lead: text(200), towns: text(60), coverage: text(60) }),
  faq: z.object(head),
  form: z.object({ eyebrow: text(40), to: text(20), cta: text(30), note: text(80) }),
  next: z.object(head),
})

/**
 * „Inwestycje i dostawy” (spec §6.5, board 17): segments with their form, the request list,
 * optional services, terms, example objects, the levels and tabs of „Zakres do wyboru”, and the
 * static lists of the page. No prices; configuration, assembly and training only as options.
 */
export const deliveriesSchema = z
  .object({
    segments: z
      .array(segment)
      .min(1)
      .superRefine(uniqueBy((s) => s.key, 'Segment')),
    listGroups: z
      .array(
        z.object({
          key,
          title: text(60),
          lines: text(60),
          line: lineKey,
          note: text(200),
          items: z.array(listItem).min(1),
        }),
      )
      .min(1)
      .superRefine(uniqueBy((g) => g.key, 'Grupa listy')),
    services: z.array(listItem).superRefine(uniqueBy((s) => s.key, 'Usługa')),
    terms: z.array(text(60)).min(1),
    objects: z
      .array(object)
      .min(1)
      .superRefine(uniqueBy((o) => o.key, 'Obiekt')),
    levels: z.array(titled).length(3),
    prepTabs: z.array(
      z.object({
        title: text(60),
        lines: text(60),
        line: lineKey,
        heading: text(120),
        lead: text(400),
        items: z.array(titled).min(1).max(6),
      }),
    ),
    brands: z.array(
      z.object({
        title: text(60),
        line: lineKey,
        items: z.array(z.object({ name: text(40), note: text(80) })),
      }),
    ),
    after: z.array(titled.extend({ line: lineKey })),
    towns: z.array(z.object({ name: text(60), salon: z.boolean() })),
    facts: z.array(factItem),
    areas: z.array(
      z.object({
        title: text(60),
        lines: text(60),
        line: lineKey,
        text: text(300),
        tags: z.array(text(40)),
        how: text(200),
      }),
    ),
    steps: z.array(titled),
    comparison: z.array(
      z.object({ title: text(60), other: text(80), ours: text(80), line: lineKey }),
    ),
    formalities: z.array(titled),
    faq: z.array(faqItem),
    next: z.array(nextItem),
    note: optionalText(300),
    page: pageSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    // Every key of a preset or object column must be an item of the request list.
    const items = value.listGroups.flatMap((group) => group.items.map((item) => item.key))
    const known = new Set(items)
    if (known.size !== items.length) {
      ctx.addIssue({ code: 'custom', path: ['listGroups'], message: 'klucz pozycji jest dwa razy' })
    }
    value.objects.forEach((objectValue, index) => {
      objectValue.preset.forEach((row, rowIndex) => {
        if (!known.has(row.item)) {
          ctx.addIssue({
            code: 'custom',
            path: ['objects', index, 'preset', rowIndex, 'item'],
            message: `„${row.item}” nie ma na liście zapytania`,
          })
        }
      })
      const preset = new Set(objectValue.preset.map((row) => row.item))
      objectValue.columns.forEach((column, columnIndex) =>
        column.items.forEach((item, itemIndex) => {
          if (item.item && !preset.has(item.item)) {
            ctx.addIssue({
              code: 'custom',
              path: ['objects', index, 'columns', columnIndex, 'items', itemIndex, 'item'],
              message: `„${item.item}” nie ma ilości w przykładzie`,
            })
          }
        }),
      )
    })
  })

export type HubDeliveries = z.infer<typeof deliveriesSchema>

export function validateDeliveries(value: unknown): true | string {
  return firstIssue(deliveriesSchema, value, 'Inwestycje i dostawy')
}
