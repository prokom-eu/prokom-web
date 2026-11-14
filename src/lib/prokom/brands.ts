import { z } from 'zod'

import { firstIssue, lineKey, text, uniqueBy } from './schema'

/**
 * Brands and authorizations (board 01 „Marki”, later `/partnerzy`) as JSON in `HubSettings.brands`
 * (ADR-H002 §2). Only the four authorizations of spec §3 may carry a status; the groups are brands
 * we sell, fit and service — without a status.
 */
export const AUTHORIZED = ['Posnet', 'Elzab', 'GoPOS', 'InsERT'] as const

/** Status of each authorization (K4-FINAL §1) — the panel cannot promote a partner to service. */
const STATUS = {
  Posnet: 'Autoryzowany serwis',
  Elzab: 'Autoryzowany serwis',
  GoPOS: 'Autoryzowany partner',
  InsERT: 'Autoryzowany partner',
} as const

export const brandsSchema = z
  .object({
    eyebrow: text(60),
    title: text(120),
    lead: text(320),
    authorizations: z
      .array(
        z.object({
          name: z.enum(AUTHORIZED),
          status: z.enum(['Autoryzowany serwis', 'Autoryzowany partner']),
          line: lineKey,
          text: text(160),
        }),
      )
      .max(AUTHORIZED.length)
      .superRefine(uniqueBy((row) => row.name, 'Autoryzacja'))
      .superRefine((rows, ctx) =>
        rows.forEach((row, index) => {
          if (row.status !== STATUS[row.name]) {
            ctx.addIssue({ code: 'custom', path: [index, 'status'], message: STATUS[row.name] })
          }
        }),
      ),
    groups: z
      .array(
        z.object({
          line: lineKey,
          title: text(60),
          brands: z.array(text(40)).min(1).max(16),
          text: text(200),
        }),
      )
      .max(5),
    note: text(160),
    allLink: text(60),
  })
  .strict()

export type HubBrands = z.infer<typeof brandsSchema>

export function validateBrands(value: unknown): true | string {
  return firstIssue(brandsSchema, value, 'Marki')
}
