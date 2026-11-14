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
export const cooperationSchema = z.object({
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
})

export type HubCooperation = z.infer<typeof cooperationSchema>

export function validateCooperation(value: unknown): true | string {
  return firstIssue(cooperationSchema, value, 'Współpraca')
}
