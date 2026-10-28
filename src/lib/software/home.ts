import { z } from 'zod'

import { ICON_NAMES } from '../catalog/options'
import { isHttpsUrl } from '../site/link'
import { firstIssue, href, key, label, link, obj, slug, svgPath, text } from './schema'

/**
 * Texts of the fixed sections of the Software start page and `/o-firmie` (`SoftwareSettings.home`,
 * ADR-014 rozstrz. SW0 7, v20 6). The sections themselves are components placed by `swHomeSection`
 * blocks; their order is the order of those blocks, so `homeOrder` of the package is not stored
 * (decision SWD1 D2). Shape: `strona-glowna.json` 1:1, plus `technologie.json` → `technologies`
 * and `popularne.json` → `popular` (the seed of SW3 puts them together).
 */

/** Table cell; may be empty (the corner above the row names). */
const cell = z.string().trim().max(160)

/** Comparison table: every row has one cell per column. */
const table = obj({
  columns: z.array(cell).min(2),
  rows: z.array(z.array(cell)).min(1),
}).superRefine((value, ctx) => {
  value.rows.forEach((row, index) => {
    if (row.length !== value.columns.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['rows', index],
        message: `Wiersz ma ${row.length} komórek, kolumn jest ${value.columns.length}.`,
      })
    }
  })
})

const https = z.string().refine(isHttpsUrl, { message: 'Adres https://.' })

/** `{v: value, l: label}` — a figure with its caption. */
const figure = obj({ v: label, l: label })

/** Two generic cards of „12 rzeczy” that are not a single solution (spec. §4). */
const genericCard = obj({
  genericCard: label,
  /** Catalog category the card filters by. */
  area: key,
  lead: text,
  features: z.array(label).max(3),
  variants: z.array(label),
  tag: label,
  order: z.number().int().min(1),
  href,
})

/** Eyebrow, H2 and lead of a start page section. */
const sectionHead = { eyebrow: label, title: label, lead: text }

/**
 * Headings and small texts of the start page sections built in SW5 — the board `Main` keeps them
 * in its HTML, not in `strona-glowna.json` (ADR-014 doprecyzowania SW5). The wizard section has
 * none: its heading is the wizard's own (`wizard.ui`). Facts (`[OPIEKA OD]`) are filled on render.
 */
export const homeSectionsSchema = obj({
  areas: obj({
    ...sectionHead,
    /** Caption above the area price („Cena”). */
    priceCaption: label,
    /** Button to the wizard next to the area's own CTA („Dobierz w 60 s”). */
    wizardButton: label,
  }),
  popular: obj({
    ...sectionHead,
    /** Number of visible cards: [1, 2–4, 5+] with `{n}`. */
    count: z.tuple([label, label, label]),
    /** Shown after the count („kliknij kartę, żeby rozwinąć”). */
    hint: label,
    /** „A gdy już masz stronę lub system”: links under the cards and the button to the catalog. */
    after: obj({
      title: label,
      items: z
        .array(obj({ title: label, text: label, href, icon: z.enum(ICON_NAMES) }))
        .min(1)
        .max(4),
      button: link,
    }),
  }),
  /** SW6 — optional: a home saved in SW5 has none until the seed (or the panel) adds them. */
  livePreviews: obj({
    ...sectionHead,
    /** Next to the tabs: [switching itself, after the visitor's pick]. */
    hint: z.tuple([label, label]),
    /** Link to the preview's `href` („Otwórz pełny podgląd”). */
    open: label,
    /** „Twój projekt”: [add, already added]. */
    add: z.tuple([label, label]),
  }).optional(),
  process: obj({
    ...sectionHead,
    /** Eyebrow of the stage panel; `{num}` and `{t}` from the stage. */
    stage: label,
    /** Column headings: what you get, what you do. */
    get: label,
    you: label,
  }).optional(),
  /** SW8a — „Zasady”: heading of the guarantee cards and the „Czasem powiemy” block. */
  guarantees: obj({
    eyebrow: label,
    title: label,
    sayNo: obj({ title: label, text }),
  }).optional(),
})

export type SoftwareHomeSections = z.infer<typeof homeSectionsSchema>

export const homeSchema = obj({
  process: z
    .array(
      obj({
        num: label,
        n: label,
        /** Duration, e.g. „30 min”. */
        t: label,
        h: text,
        p: text,
        get: z.array(label),
        you: z.array(label),
        pay: text,
        payd: text,
      }),
    )
    .min(1),
  processShort: z.array(obj({ num: label, title: label, text })),
  guarantees: z.array(obj({ title: label, text, icon: svgPath })),
  compare: table,
  /** [key, name, icon] of the modules on the hero mock-up. */
  heroModules: z.array(z.tuple([key, label, svgPath])),
  livePreviews: z.record(
    key,
    obj({
      label,
      icon: svgPath,
      tag: label,
      title: label,
      text,
      href,
      /** Floating notes of the mock-up: `a`/`b` with their small lines `as`/`bs`. */
      a: label,
      as: label,
      b: label,
      bs: label,
      steps: z.array(z.tuple([label, text])),
    }),
  ),
  showcase: obj({
    title: label,
    lead: text,
    items: z.array(obj({ name: label, status: label, text, url: https })),
    stats: z.array(figure),
  }),
  whyNotWordpress: obj({
    eyebrow: label,
    title: label,
    lead: text,
    /** Every fact with its source (spec. §4, plan SW8a). */
    facts: z.array(obj({ v: label, t: text, src: label })).min(1),
    compare: table,
    cta: obj({ title: label, text, buttons: z.array(link).min(1), link }),
  }),
  /** Sample quote in the process section — a clearly made-up customer. */
  proceduralMock: obj({
    number: label,
    title: label,
    rows: z.array(z.tuple([label, label])).min(1),
    total: label,
    term: label,
    totalLabel: label,
  }),
  technologies: z
    .array(
      obj({
        n: label,
        s: label,
        t: z.array(label),
        ic: svgPath,
        gain: text,
        why: text,
        m: z.array(figure),
        proof: text,
      }),
    )
    .min(1),
  popular: obj({
    /** The 12 cards in order: a solution slug or a generic card. */
    order: z
      .array(z.union([slug, genericCard]))
      .min(1)
      .max(12),
    /** [category key, label] of the filter tabs. */
    tabs: z.array(z.tuple([key, label])).min(1),
  }),
  /** Optional: a home saved before SW5 has none; the sections that need it are then skipped. */
  sections: homeSectionsSchema.optional(),
})

export type SoftwareHome = z.infer<typeof homeSchema>

/** Solution slugs the „12 rzeczy” cards point to (checked against `Solutions` on save). */
export function homeSolutionSlugs(home: SoftwareHome): string[] {
  return home.popular.order.filter((entry): entry is string => typeof entry === 'string')
}

export function validateHome(value: unknown): true | string {
  return firstIssue(homeSchema, value, 'Teksty strony głównej')
}
