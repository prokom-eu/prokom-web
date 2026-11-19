import { z } from 'zod'

import {
  factKeys,
  firstIssue,
  lineKey,
  noContactData,
  text,
  uniqueBy,
  withVisibleFacts,
} from './schema'

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

/**
 * Partner networks (runda 1811, D4): a network of shops, not a producer — shown next to the
 * authorizations as its own card, never counted in them. The same `slug` as the shared `partners`
 * record of Biznes (`alsen`), so both sites speak of one partnership.
 */
export const NETWORKS = ['ALSEN'] as const

/** A network's text that repeats an unconfirmed fact stays hidden until the fact is visible. */
const factText = (max: number) => z.object({ text: text(max), facts: factKeys })

const networkSchema = z
  .object({
    name: z.enum(NETWORKS),
    slug: z.literal('alsen'),
    /** Agreed status only (decision of Krystian 18.11.2026, K4-FINAL §1). */
    status: z.literal('Autoryzowany partner'),
    /** Company fact (`HubSettings.trust` value) that switches the whole network on. */
    fact: text(40),
    line: lineKey,
    label: text(40),
    text: text(200),
    website: z
      .string()
      .url()
      .regex(/^https:\/\//, 'adres https://'),
    linkLabel: text(60),
    aboutTitle: text(120),
    paragraphs: z.array(factText(400)).min(1).max(3),
    /** A short line under the salon card of `/kontakt` — only while its facts are visible. */
    salonNote: factText(80).nullish(),
  })
  .strict()

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
    network: networkSchema.nullish(),
    note: text(160),
    allLink: text(60),
  })
  .strict()
  .superRefine(noContactData)

export type HubBrands = z.infer<typeof brandsSchema>

export function validateBrands(value: unknown): true | string {
  return firstIssue(brandsSchema, value, 'Marki')
}

/**
 * Authorizations shown here: only those whose company fact (`HubSettings.trust`, value = brand
 * name) is visible — on production, approved (spec §3).
 */
export function visibleAuthorizations(
  brands: HubBrands,
  visibleFacts: readonly { value: string }[],
): HubBrands['authorizations'] {
  const visible = new Set(visibleFacts.map((row) => row.value))
  return brands.authorizations.filter((row) => visible.has(row.name))
}

export type HubNetwork = NonNullable<HubBrands['network']>

/** A network ready to show: its paragraphs and salon note filtered by the visible facts. */
export type VisibleNetwork = Omit<HubNetwork, 'paragraphs' | 'salonNote'> & {
  paragraphs: string[]
  salonNote: string | null
}

/**
 * The partner network while its fact is visible (on production: approved), with only the texts
 * whose facts are visible too — unconfirmed figures (number of shops, the Rabka point) stay out.
 */
export function visibleNetwork(
  brands: HubBrands | null,
  visibleFacts: readonly { value: string }[],
): VisibleNetwork | null {
  const network = brands?.network
  if (!network || !visibleFacts.some((row) => row.value === network.fact)) return null
  const paragraphs = withVisibleFacts(network.paragraphs, visibleFacts).map((row) => row.text)
  if (!paragraphs.length) return null
  const [note] = network.salonNote ? withVisibleFacts([network.salonNote], visibleFacts) : []
  return { ...network, paragraphs, salonNote: note?.text ?? null }
}
