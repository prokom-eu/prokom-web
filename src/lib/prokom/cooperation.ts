import { z } from 'zod'

import {
  factItem,
  faqItem,
  firstIssue,
  key,
  lineKey,
  nextItem,
  text,
  titled,
  uniqueBy,
} from './schema'

/**
 * „Współpraca” (spec §6.6, board 16): roles with their adaptive form, stages, scope tabs and the
 * static lists. The phone of a role comes from its `line` (CompanyData / SiteSettings), never from
 * the text. No „opiekun” promise until the boss decides (spec §6.6).
 */
const head = { eyebrow: text(80), title: text(120) }

/** Headings and labels of the page (board 16 HTML); contact data and promises from the panels. */
const pageSchema = z.object({
  hero: z.object({
    ...head,
    lead: text(400),
    cta: text(40),
    rolesLabel: text(30),
    rolesHint: text(80),
    start: text(30),
  }),
  stages: z.object({ ...head, lead: text(200), we: text(30), you: text(40) }),
  scope: z.object({
    ...head,
    architectsTitle: text(80),
    architectsText: text(240),
    architectsPath: z.string().regex(/^\/[a-z0-9/-]*$/),
  }),
  deliveries: z.object({ ...head, lead: text(300), cta: text(40) }),
  suppliers: z.object({ ...head, lead: text(300) }),
  rules: z.object(head),
  faq: z.object(head),
  form: z.object({ eyebrow: text(40), note: text(120), to: text(20) }),
  next: z.object(head),
})

export const cooperationSchema = z
  .object({
    roles: z
      .array(
        z.object({
          key,
          name: text(40),
          sub: text(80),
          line: lineKey,
          lines: text(80),
          eyebrow: text(60),
          heading: text(160),
          start: text(120),
          points: z.array(titled).min(1).max(6),
          form: z.object({
            heading: text(80),
            linkLabel: text(60),
            linkPlaceholder: text(120),
            descPlaceholder: text(240),
          }),
        }),
      )
      .min(1)
      .superRefine(uniqueBy((role) => role.key, 'Rola')),
    stages: z
      .array(
        z.object({
          title: text(60),
          when: text(60),
          lead: text(200),
          we: text(300),
          you: text(300),
        }),
      )
      .min(1),
    scopes: z.array(
      z.object({
        name: text(40),
        line: lineKey,
        tag: text(40),
        items: z.array(z.object({ title: text(80), text: text(200), when: text(200) })).min(1),
      }),
    ),
    facts: z.array(factItem),
    deliveries: z.array(titled),
    suppliers: z.array(titled),
    rules: z.array(titled),
    faq: z.array(faqItem),
    next: z.array(nextItem),
    page: pageSchema,
  })
  .strict()

export type HubCooperation = z.infer<typeof cooperationSchema>

export function validateCooperation(value: unknown): true | string {
  return firstIssue(cooperationSchema, value, 'Współpraca')
}
