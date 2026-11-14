import { z } from 'zod'

import { PROMISE } from './home'
import {
  factKeys,
  faqItem,
  firstIssue,
  hubHref,
  key,
  lineKey,
  nextItem,
  noContactData,
  text,
  titled,
} from './schema'

/*
 * Texts of `/dla-firm` (spec §6.3, board 03 `DlaFirm.dc.html`) as JSON in `HubSettings.forBusiness`
 * (ADR-H002 „Rozstrzygnięcia H1” pkt 8). The industry plans are records of `HubPlans` (type
 * `branza`), the brands come from `HubSettings.brands`, phones and promises from the line panels.
 * A step may say `{obietnica}` (the line's promise); the FAQ `{telefon}`, `{adres}`, `{godziny}`.
 * Configuration, fitting and training appear only as an option (spec §3).
 */
const head = { eyebrow: text(80), title: text(120) }
const step = z.object({ title: text(90), text: text(200) })
const businessLine = z.enum(['biznes', 'instalacje', 'software', 'tech'])

export const forBusinessSchema = z
  .object({
    hero: z.object({
      ...head,
      lead: text(400),
      choose: text(40),
      callNote: text(120),
      stateLabel: text(30),
      stateTag: text(20),
      stateNote: text(80),
      rows: z
        .array(z.object({ line: lineKey, label: text(40), state: text(30) }))
        .min(1)
        .max(8),
      facts: z.array(z.object({ value: text(40), label: text(80), facts: factKeys })).max(4),
    }),
    industries: z.object({
      ...head,
      lead: text(240),
      planFor: text(30),
      start: text(40),
      ask: text(60),
      call: text(30),
      describe: text(30),
      note: text(120),
      subs: z.array(z.object({ plan: key, sub: text(60) })).max(20),
    }),
    areas: z.object({
      ...head,
      inLine: text(30),
      inArea: text(30),
      steps: text(30),
      lines: z
        .array(z.object({ line: businessLine, short: text(60) }))
        .min(1)
        .max(4),
      items: z
        .array(
          z.object({
            line: businessLine,
            title: text(60),
            lead: text(200),
            cta: text(40),
            href: hubHref.nullable(),
            steps: z.array(step).length(3),
            services: z.array(titled).min(1).max(12),
          }),
        )
        .min(1)
        .max(8),
    }),
    situations: z.object({
      ...head,
      lead: text(240),
      label: text(30),
      when: z.array(text(20)).length(3),
      pillars: z.array(text(40)).max(3),
      start: text(20),
      items: z
        .array(
          z.object({
            title: text(60),
            text: text(300),
            order: z.array(z.object({ line: businessLine, what: text(60) })).length(3),
          }),
        )
        .min(1)
        .max(8),
    }),
    rollout: z.object({
      ...head,
      step: text(20),
      we: text(30),
      you: text(30),
      steps: z
        .array(z.object({ title: text(60), text: text(300), we: text(160), you: text(160) }))
        .min(1)
        .max(8),
    }),
    care: z.object({
      ...head,
      lead: text(240),
      items: z
        .array(z.object({ line: businessLine, title: text(60), points: z.array(text(60)).max(4) }))
        .min(1)
        .max(6),
    }),
    compare: z.object({
      ...head,
      topic: text(30),
      many: text(40),
      one: text(40),
      rows: z
        .array(z.object({ topic: text(60), many: text(160), one: text(160) }))
        .min(1)
        .max(8),
    }),
    grants: z.object({
      ...head,
      lead: text(400),
      cta: text(40),
      points: z
        .array(z.object({ icon: z.enum(['doc', 'receipt', 'laptop']), text: text(80) }))
        .max(4),
    }),
    faq: z.object({
      ...head,
      missing: text(80),
      helpLink: text(40),
      items: z.array(faqItem).min(1).max(12),
    }),
    form: z.object({
      ...head,
      afterLabel: text(40),
      after: z.array(text(120)).max(4),
      cta: text(40),
    }),
    next: z.object({ ...head, items: z.array(nextItem).min(1).max(6) }),
    final: z.object({ title: text(120), contact: text(40), lines: text(40) }),
  })
  .strict()
  .superRefine(noContactData)

export type HubForBusiness = z.infer<typeof forBusinessSchema>
export type BusinessLine = z.infer<typeof businessLine>

export function validateForBusiness(value: unknown): true | string {
  return firstIssue(forBusinessSchema, value, 'Dla firm')
}

/** Steps with `{obietnica}` filled from the line's panel; such a step without a promise is left out. */
export function stepsWithPromise(
  steps: readonly { title: string; text: string }[],
  promise: string | null,
): { title: string; text: string }[] {
  return steps.flatMap((item) => {
    if (!item.title.includes(PROMISE)) return [item]
    return promise ? [{ title: item.title.replace(PROMISE, promise), text: item.text }] : []
  })
}
