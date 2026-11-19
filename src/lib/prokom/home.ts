import { z } from 'zod'

import {
  factKeys,
  faqItem,
  firstIssue,
  hubHref,
  key,
  lineKey,
  noContactData,
  optionalText,
  text,
  titled,
} from './schema'

export { withVisibleFacts } from './schema'

/** Stands for the line's promise (spec §3) — kept in its panel, never in these texts. */
export const PROMISE = '{obietnica}'

import { ICON_NAMES } from '../shared/icons'
import { HUB_LINES, type HubLine } from './lines'

/*
 * Texts of the home page (spec §6.1, board 01 `Main.dc.html`) kept as JSON in `HubSettings.home`
 * (decision 14.11, ADR-H002 „Rozstrzygnięcia H1” pkt 8). Data read from elsewhere is not here:
 * phones, promises, hours and domains (`CompanyData` / `SiteSettings` of the lines), services,
 * tools, personas and situations (collections `hub-*`). The FAQ may use `{telefon}`, `{adres}` and
 * `{godziny}`, the facts and steps of a line `{obietnica}` — filled in on render (spec §3). A text
 * that repeats a company fact names it in `facts` and shows only while the fact is visible.
 */

const head = { eyebrow: text(60), title: text(120), lead: text(320) }

/** One entry per line of the hub, nothing more (the scene and the hero show all five). */
const byLine = <T extends z.ZodType>(value: T) =>
  z.object(Object.fromEntries(HUB_LINES.map((line) => [line, value])) as Record<HubLine, T>)

const vignette = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('rows'),
    rows: z
      .array(z.object({ label: text(40), state: text(30) }))
      .min(1)
      .max(4),
  }),
  z.object({
    kind: z.literal('tiles'),
    tiles: z
      .array(z.object({ label: text(30), icon: z.enum(['cam', 'bars', 'ring']) }))
      .min(1)
      .max(4),
  }),
  z.object({ kind: z.enum(['switch', 'web', 'kanban', 'flow']) }),
])

export const homeSchema = z
  .object({
    hero: z.object({
      eyebrow: text(60),
      title: text(120),
      lead: text(240),
      unsure: text(120),
      cta: text(40),
      /** Not shown since 15.11 (the tile has the company numbers); kept so older JSON validates. */
      steps: z.array(text(40)).length(3).nullish(),
      /**
       * „Załatw od razu” in the PRO-KOM tile (Krystian 15.11): the keys of up to four tools of
       * `HubTools` — their titles and deep links come from the records, the line from the tool.
       */
      quick: z.object({ title: text(40), tools: z.array(key).min(1).max(4) }).nullish(),
      hints: z
        .array(z.object({ text: text(60), line: lineKey }))
        .min(1)
        .max(8),
      /** Not shown since 16.11 (hero without hint chips); kept so older JSON validates. */
      chips: z
        .array(z.object({ label: text(30), line: lineKey }))
        .max(6)
        .nullish(),
      counters: z.array(z.object({ value: text(8), label: text(60), facts: factKeys })).max(4),
      trustBar: z
        .array(z.object({ line: lineKey, title: text(40), note: text(40), facts: factKeys }))
        .max(12),
      lines: byLine(
        z.object({
          short: text(60),
          slides: z.array(z.object({ title: text(60), text: optionalText(160) })).length(3),
          vignettes: z.array(vignette).max(3),
        }),
      ),
    }),
    lines: z.object({
      ...head,
      allLink: text(40),
      scene: byLine(
        z.object({
          lead: text(160),
          heading: text(90),
          who: text(160),
          cta: text(40),
          services: z.array(titled).min(1).max(6),
          facts: z.array(z.object({ text: text(90), facts: factKeys })).max(3),
          more: z.array(text(40)).max(6),
          steps: z.array(z.object({ title: text(90), text: text(300) })).length(3),
          status: z.array(z.object({ label: text(40), state: text(30) })).max(4),
        }),
      ),
      techStages: z.array(titled).length(4),
      cameras: z.array(z.object({ label: text(30), kind: z.enum(['cam', 'wifi']) })).max(4),
      cameraNotes: z.object({ camera: text(120), wifi: text(120) }),
    }),
    team: z.object({
      ...head,
      cta: text(60),
      note: text(120),
      examples: z
        .array(z.object({ persona: key, tab: text(30), node: text(40) }))
        .min(1)
        .max(4),
      pillars: z.array(text(60)).length(3),
    }),
    choose: z.object({
      ...head,
      other: titled,
      personas: z.array(z.object({ persona: key, sub: optionalText(60) })).min(1),
      planFor: text(30),
      call: text(30),
      write: text(40),
      note: text(120),
    }),
    tools: z.object({
      title: text(90),
      lead: text(200),
      all: z.object({ eyebrow: text(60), title: text(90), text: text(240), cta: text(40) }),
      /**
       * The hub's own tool (H9, Krystian 15.11): the sixth tile while „Załatw online” is off —
       * the request list of „Inwestycje i dostawy”, a v1 page.
       */
      own: z
        .object({
          eyebrow: text(60),
          title: text(60),
          text: text(240),
          steps: z.array(text(40)).min(2).max(4),
          cta: text(50),
          href: hubHref,
        })
        .nullish(),
    }),
    help: z.object({
      eyebrow: text(40),
      title: text(60),
      allLink: text(60),
      lineLabel: text(40),
      slugs: z.array(key).min(1).max(8),
    }),
    cooperation: z.object({
      ...head,
      links: z
        .array(z.object({ label: text(40), href: hubHref }))
        .min(1)
        .max(2),
      cards: z
        .array(titled.extend({ line: lineKey, href: hubHref }))
        .min(1)
        .max(6),
    }),
    coverage: z.object({
      ...head,
      towns: z.array(text(40)).min(1).max(12),
      mapNote: text(60),
      region: text(40),
      mapLabel: text(120),
      salon: text(40),
      route: text(40),
      check: text(40),
    }),
    news: z.object({ eyebrow: text(40), title: text(60), allLink: text(40), read: text(20) }),
    faq: z.object({
      eyebrow: text(40),
      title: text(60),
      helpLink: text(40),
      items: z.array(faqItem).min(1).max(12),
    }),
    contact: z.object({
      eyebrow: text(40),
      title: text(90),
      write: text(90),
      topicsLabel: text(60),
      general: text(40),
      directions: text(40),
      salon: text(40),
      cta: text(40),
    }),
    final: z.object({ title: text(120), write: text(40), choose: text(40) }),
    /**
     * ALSEN as a premium section above „Współpraca” (runda 1811 D4, Krystian 19.11). Logo,
     * status and the network's site come from `brands.network`, the salon address from the
     * company data; the figure and the salon line only while their facts are visible.
     */
    network: z
      .object({
        ...head,
        stat: z.object({
          value: text(8),
          label: text(60),
          note: text(120),
          facts: factKeys.min(1),
        }),
        point: z.object({ text: text(80), facts: factKeys.min(1) }),
        points: z
          .array(titled.extend({ icon: z.enum(ICON_NAMES) }))
          .min(3)
          .max(4),
        cta: z.object({ label: text(40), href: hubHref }),
        more: z.object({ label: text(40), href: hubHref }),
      })
      .nullish(),
    /**
     * „Zamówienia publiczne, przetargi i większe dostawy” (runda 1811 D14) — optional, so texts
     * stored before it stay valid; the steps come from `HubSettings.deliveries`. Names of buyers
     * (`examples`) only behind facts approved by the boss — none in the package.
     */
    procurement: z
      .object({
        ...head,
        points: z
          .array(titled.extend({ icon: z.enum(ICON_NAMES) }))
          .min(3)
          .max(4),
        stepsLabel: text(40),
        forLabel: text(40),
        audiences: z
          .array(z.object({ icon: z.enum(ICON_NAMES), label: text(40) }))
          .min(1)
          .max(6),
        examplesLabel: text(40),
        examples: z.array(z.object({ text: text(120), facts: factKeys.min(1) })).max(4),
        cta: z.object({ label: text(40), href: hubHref }),
        more: z.object({ label: text(40), href: hubHref }),
      })
      .nullish(),
  })
  .strict()
  .superRefine(noContactData)

export type HubHome = z.infer<typeof homeSchema>

export function validateHome(value: unknown): true | string {
  return firstIssue(homeSchema, value, 'Strona główna')
}

/** Contact data of the company that the FAQ tokens stand for. */
export type FaqTokens = { telefon: string; adres: string; godziny: string }

/** `{telefon}` → the company's phone etc.; an unknown token stays as written. */
export function fillTokens(answer: string, tokens: FaqTokens): string {
  return answer.replace(/\{(telefon|adres|godziny)\}/g, (_, name: keyof FaqTokens) => tokens[name])
}

/** `{obietnica}` → the line's promise from its panel; no promise = the item is left out. */
export function fillPromise(text: string, promise: string | null): string | null {
  if (!text.includes(PROMISE)) return text
  return promise ? text.replace(PROMISE, promise) : null
}
