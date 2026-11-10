import { z } from 'zod'

import { DASH_VARIANTS, isVariantOf, MOCKUP_KINDS, SITE_VARIANTS } from './mockups'
import { WIZARD_FIRMS } from './options'
import { firstIssue, key, label, obj, slug, svgPath, text } from './schema'

/**
 * Texts of the fixed sections of the Software start page and `/o-firmie` (`SoftwareSettings.home`,
 * ADR-014 rozstrz. SW0 7, v20 6). The sections themselves are components placed by `swHomeSection`
 * blocks; their order is the order of those blocks, so `homeOrder` of the package is not stored
 * (decision SWD1 D2). From `strona-glowna.json` only the process stages and the comparison stay;
 * the v23 sections and their keys went with the clean-up (decision D6, 08.11).
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

/** `{v: value, l: label}` — a figure with its caption. */
const figure = obj({ v: label, l: label })

/** Mock-up of a slide: one of the kinds and its variant (`lib/software/mockups`). */
const mockup = obj({ kind: z.enum(MOCKUP_KINDS), variant: key.nullable() }).refine(
  (value) => isVariantOf(value.kind, value.variant),
  { message: 'Wariant makiety nie pasuje do rodzaju.' },
)

/**
 * Hero v24 (ZMIANY-v24 §4.1): „Zrobimy Ci” + the changing word, 7 solutions with their mock-ups in
 * the 3D carousel, the caption with the price and term of the solution (from `Solutions`), trust
 * figures and the band of industries. Optional: while it is missing no hero is shown.
 */
export const heroV24Schema = obj({
  pill: label,
  /** Bold end of the pill („od 2004”). */
  pillBadge: label,
  /** First line of the H1 („Zrobimy Ci”); the second is the word of the slide. */
  title: label,
  lead: text,
  /** Line of the choice panel („Czego potrzebuje Twoja firma?”) and its key hint („wybierz”). */
  query: label,
  queryHint: label,
  /** Button of the caption („Zobacz ofertę →”). */
  offer: label,
  slides: z
    .array(
      obj({
        /** Word of the H1 for this slide („stronę firmową.”). */
        word: label,
        /**
         * Shorter word for a phone (≤ 600 px), so it fits one line of the H1 („automatyzacje.”
         * for „automatyzacje i AI.”, AUDYT-PROD-TELEFON #14). Without it the phone shows `word`.
         */
        wordShort: label.optional(),
        name: label,
        text: label,
        /** Price and term come from this solution. */
        solution: slug,
        mockup,
        icon: svgPath,
      }),
    )
    .min(1)
    .max(9)
    .superRefine((slides, ctx) =>
      slides.forEach((slide, i) => {
        if (slide.wordShort && slide.wordShort.length >= slide.word.length)
          ctx.addIssue({
            code: 'custom',
            path: [i, 'wordShort'],
            message: 'Krótkie słowo musi być krótsze niż słowo slajdu.',
          })
      }),
    ),
  /** Not shown since 08.11 (Krystian: the figures go from the hero); kept so saved settings still read. */
  trust: z.array(figure).max(4).optional(),
  industries: z.array(label).min(1),
})

export type SoftwareHeroV24 = z.infer<typeof heroV24Schema>

/** Eyebrow, H2 (with its highlighted part in `em`) and lead of a v24 section (ZMIANY-v24 §2). */
const WIZARD_FIRM_VALUES = WIZARD_FIRMS.map((firm) => firm.value) as [
  (typeof WIZARD_FIRMS)[number]['value'],
  ...(typeof WIZARD_FIRMS)[number]['value'][],
]

const headV24 = { eyebrow: label, title: label, em: label.optional(), lead: text.optional() }

/**
 * Sections of the v24 start page after the hero (ZMIANY-v24 §4 pkt 2–5, SWA2b). Prices and terms
 * come from the solutions they point to. Optional: a home saved before v24 has none.
 */
export const homeV24SectionsSchema = {
  /** 3 promise cards under the hero (replace „Zasady”). */
  promises: z
    .array(obj({ title: label, text, icon: z.array(svgPath).min(1).max(3) }))
    .min(1)
    .max(4)
    .optional(),
  /** „Z czym do nas przychodzisz?” — 4 situations, each with its solution and mock-up. */
  situations: obj({
    ...headV24,
    /** Link of an open situation („Zobacz ofertę”). */
    offer: label,
    items: z
      .array(
        obj({
          short: label,
          question: label,
          answer: text,
          solution: slug,
          mockup,
          phone: z.boolean().optional(),
        }),
      )
      .min(1)
      .max(4),
  }).optional(),
  /** Bento „Cztery rzeczy. Zrobione najlepiej.” — sites, rebuild, systems, automations. */
  bento: obj({
    ...headV24,
    details: label,
    /** Hint of the before/after slider („⇆ Przeciągnij: stara i nowa strona.”). */
    dragHint: label,
    sites: obj({
      title: label,
      variants: z
        .array(obj({ label, solution: slug, variant: z.enum(SITE_VARIANTS), text }))
        .min(1),
    }),
    rebuild: obj({ title: label, solution: slug }),
    systems: obj({
      title: label,
      variants: z.array(obj({ label, solution: slug, variant: z.enum(DASH_VARIANTS) })).min(1),
    }),
    automations: obj({
      eyebrow: label,
      title: label,
      text,
      /** Link of the card („Wycena po rozmowie · szczegóły”). */
      link: label,
      variants: z
        .array(obj({ label, solution: slug, variant: z.enum(['sms', 'faktury', 'raporty', 'ai']) }))
        .min(1),
    }),
  }).optional(),
  /**
   * „Nie składamy stron z szablonu” — 4 tabs (fast, safe, found in Google and AI, built on), each
   * with its picture, text, an optional figure with its source and „them vs us” (ZMIANY-v24 §4.2).
   */
  tech: obj({
    ...headV24,
    tabs: z
      .array(
        obj({
          label,
          title: label,
          text,
          stat: obj({ v: label, t: text }).optional(),
          them: z.tuple([label, label]),
          us: z.tuple([label, label]),
          visual: z.discriminatedUnion('kind', [
            obj({ kind: z.literal('speed'), value: label, caption: label }),
            obj({ kind: z.literal('security'), pills: z.array(label).min(1).max(4) }),
            obj({
              kind: z.literal('search'),
              query: label,
              ours: z.tuple([label, label, label]),
              other: z.tuple([label, label]),
              ai: z.tuple([label, label]),
            }),
            obj({
              kind: z.literal('stack'),
              rows: z
                .array(z.tuple([label, label]))
                .min(1)
                .max(6),
            }),
          ]),
        }),
      )
      .min(1)
      .max(4),
  }).optional(),
  /** „Cena i termin. Od razu.” — filters by group, cards of the solutions with their mock-ups. */
  pricing: obj({
    ...headV24,
    /** First filter („Wszystko”). */
    all: label,
    details: label,
    groups: z
      .array(obj({ label, solutions: z.array(slug).min(1) }))
      .min(1)
      .max(6)
      .superRefine((groups, ctx) => {
        // One card per solution: a second one would count twice under „Wszystko”.
        const seen = new Set<string>()
        for (const solution of groups.flatMap((group) => group.solutions)) {
          if (seen.has(solution)) {
            ctx.addIssue({
              code: 'custom',
              message: `Rozwiązanie „${solution}” jest w cenniku dwa razy.`,
            })
          }
          seen.add(solution)
        }
      }),
  }).optional(),
  /**
   * „Większość płacisz po odbiorze” (ZMIANY-v24 §4 pkt 9): heading of the v24 process; the stages
   * stay in `process`. `stage` = eyebrow of the stage card, `{num}` and `{t}` filled.
   */
  processHead: obj({ ...headV24, stage: label }).optional(),
  /** Showroom „Tak może wyglądać Twoja strona albo system” — industries × 3 views. */
  showroom: obj({
    ...headV24,
    /** Labels of the views: site, phone, system. */
    modes: z.tuple([label, label, label]),
    /** „Strona dla branży:” / „System:” before the industry name. */
    sitePrefix: label,
    systemPrefix: label,
    /** The 3 points of every system view after its own first one. */
    systemFeatures: z.array(label).min(1).max(3),
    cta: label,
    industries: z
      .array(
        obj({
          /** `?firma=` of the wizard (`/dobierz?firma=<key>`): one of its industries. */
          key: z.enum(WIZARD_FIRM_VALUES),
          name: label,
          icon: svgPath,
          site: z.enum(SITE_VARIANTS),
          system: z.enum(DASH_VARIANTS),
          systemName: label,
          features: z.array(label).min(1).max(4),
        }),
      )
      .min(1)
      .max(12),
  }).optional(),
}

/**
 * Small texts of the start page sections kept in `sections` (ADR-014 doprecyzowania SW5): after
 * the v23 clean-up (decision D6, 08.11) only the comparison of `/o-firmie`.
 */
export const homeSectionsSchema = obj({
  /**
   * SW11b — „Freelancer, agencja czy PRO-KOM?” on `/o-firmie` (spec. §6.6, stany/70): the
   * heading and the two switch labels; the rows are `compare` of the package.
   */
  compare: obj({ eyebrow: label, title: label, tabs: z.tuple([label, label]) }).optional(),
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
  /** Rows of „Freelancer, agencja czy PRO-KOM?” (`/o-firmie`). */
  compare: table,
  /** Optional: a home saved before SW5 has none; the comparison is then skipped. */
  sections: homeSectionsSchema.optional(),
  /** Hero v24 (SWA2a); missing → no hero until the data is pasted. */
  hero: heroV24Schema.optional(),
  ...homeV24SectionsSchema,
})

export type SoftwareHome = z.infer<typeof homeSchema>

/** Solution slugs the v24 sections point to (checked on save). */
export function homeSolutionSlugs(home: SoftwareHome): string[] {
  const bento = home.bento
  return [
    ...(home.hero?.slides.map((slide) => slide.solution) ?? []),
    ...(home.situations?.items.map((item) => item.solution) ?? []),
    ...(bento
      ? [
          ...bento.sites.variants.map((v) => v.solution),
          bento.rebuild.solution,
          ...bento.systems.variants.map((v) => v.solution),
          ...bento.automations.variants.map((v) => v.solution),
        ]
      : []),
    ...(home.pricing?.groups.flatMap((group) => group.solutions) ?? []),
  ]
}

export function validateHome(value: unknown): true | string {
  return firstIssue(homeSchema, value, 'Teksty strony głównej')
}

export type SoftwareHomeV24 = Pick<
  SoftwareHome,
  'promises' | 'situations' | 'bento' | 'showroom' | 'tech' | 'pricing' | 'processHead'
>
