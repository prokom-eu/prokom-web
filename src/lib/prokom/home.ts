import { z } from 'zod'

import { faqItem, firstIssue, key, lineKey, optionalText, text, titled } from './schema'
import { HUB_LINES, type HubLine } from './lines'

/*
 * Texts of the home page (spec §6.1, board 01 `Main.dc.html`) kept as JSON in `HubSettings.home`
 * (decision 14.11, ADR-H002 „Rozstrzygnięcia H1” pkt 8). Data read from elsewhere is not here:
 * phones, promises, hours and domains (`CompanyData` / `SiteSettings` of the lines), services,
 * tools, personas and situations (collections `hub-*`). The FAQ may use `{telefon}`, `{adres}` and
 * `{godziny}` — filled in from `CompanyData` on render (spec §3).
 */

const head = { eyebrow: text(60), title: text(120), lead: text(320) }

/** One entry per line of the hub, nothing more (the scene and the hero show all five). */
const byLine = <T extends z.ZodType>(value: T) =>
  z.object(Object.fromEntries(HUB_LINES.map((line) => [line, value])) as Record<HubLine, T>)

/** A counter or trust-bar item tied to a company fact shows only while the fact is visible. */
const fact = z.string().trim().min(1).max(40).nullable()

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

/** No contact data in the texts — the literal test of spec §3 for the panel's JSON. */
const CONTACT_DATA = /\d{3}[ -]?\d{3}[ -]?\d{3}|@|\bul\.\s/

export const homeSchema = z
  .object({
    hero: z.object({
      eyebrow: text(60),
      title: text(120),
      lead: text(240),
      unsure: text(120),
      cta: text(40),
      hints: z.array(z.object({ text: text(60), line: lineKey })).min(1),
      chips: z
        .array(z.object({ label: text(30), line: lineKey }))
        .min(1)
        .max(6),
      counters: z.array(z.object({ value: text(8), label: text(60), fact })).max(4),
      trustBar: z.array(z.object({ line: lineKey, title: text(40), note: text(40), fact })),
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
          facts: z.array(text(90)).max(3),
          more: z.array(text(40)).max(6),
          steps: z.array(titled).length(3),
          status: z.array(z.object({ label: text(40), state: text(30) })).max(4),
        }),
      ),
      techStages: z.array(titled).length(4),
      cameras: z.array(z.object({ label: text(30), kind: z.enum(['cam', 'wifi']) })).max(4),
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
      write: text(40),
      note: text(120),
    }),
    tools: z.object({
      title: text(90),
      lead: text(200),
      all: z.object({ eyebrow: text(60), title: text(90), text: text(240), cta: text(40) }),
    }),
    help: z.object({
      eyebrow: text(40),
      title: text(60),
      allLink: text(60),
      slugs: z.array(key).min(1).max(8),
    }),
    cooperation: z.object({ ...head, cards: z.array(titled).min(1).max(6) }),
    coverage: z.object({
      ...head,
      towns: z.array(text(40)).min(1).max(12),
      mapNote: text(60),
      region: text(40),
    }),
    news: z.object({ eyebrow: text(40), title: text(60) }),
    faq: z.object({ eyebrow: text(40), title: text(60), items: z.array(faqItem).min(1) }),
    contact: z.object({
      eyebrow: text(40),
      title: text(90),
      write: text(90),
      topicsLabel: text(60),
      general: text(40),
      directions: text(40),
    }),
    final: z.object({ title: text(120), write: text(40), choose: text(40) }),
  })
  .strict()
  .superRefine((home, ctx) => {
    const found = JSON.stringify(home).match(CONTACT_DATA)
    if (found) {
      ctx.addIssue({
        code: 'custom',
        message: `dane kontaktowe („${found[0]}”) tylko z danych firmy — użyj {telefon}, {adres}, {godziny}`,
      })
    }
  })

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

/**
 * Counters and trust-bar items whose fact is not visible (on production: not approved) are left
 * out — spec §3 „nic ponad to bez zatwierdzenia”.
 */
export function withVisibleFacts<T extends { fact: string | null }>(
  items: readonly T[],
  visibleFacts: readonly { value: string }[],
): T[] {
  const visible = new Set(visibleFacts.map((row) => row.value))
  return items.filter((item) => item.fact === null || visible.has(item.fact))
}
