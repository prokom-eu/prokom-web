import { z } from 'zod'

import { SUPPLY_PAGES, type SupplyPage } from '../../catalog/menu'
import { plural } from '../../plural'
import { applyFlags, NO_FLAGS } from './flags'
import { box } from './schema'

/**
 * „Zaopatrzenie firm” on the home page (ZAOPATRZENIE §8, block `bzProcurement`): JSON from
 * `strona-glowna-k4.json → zaopatrzenie` (images = Media ids). A card shows only while its page
 * is published; the calculator takes the devices per unit from that page's configurator, so
 * the home figure and the page's list never disagree.
 */

const text = z.string().trim().min(1)

const homeCard = z.object({
  page: z.enum(SUPPLY_PAGES),
  badge: text,
  title: text,
  titleAccent: z.string().optional(),
  text,
  scene: z.array(z.object({ image: z.number().int().positive().nullable(), box })).max(6),
  /** `when: pickup` = only with „Odbieramy stary sprzęt 1 za 1” on that page (§0 pkt 1). */
  pills: z.array(z.object({ label: text, when: z.literal('pickup').optional() })).max(4),
  calculator: z.object({
    /** Slugs of the page's configurator types (`?typ=`). */
    types: z
      .array(z.object({ label: text, slug: z.string().regex(/^[a-z0-9-]+$/) }))
      .min(1)
      .max(3),
    count: z.number().int().min(1).max(500),
  }),
  cta: text,
  note: z.string().optional(),
})

export const procurementHomeSchema = z.object({
  cards: z.array(homeCard).min(1).max(2),
  benefits: z
    .array(
      z.object({
        icon: text,
        /** `{callback}` = the promise from `SiteSettings` → „Obietnice”. */
        title: text,
        text: z.string().optional(),
        when: z.enum(['pickup', 'callback']).optional(),
      }),
    )
    .max(4),
})

export type ProcurementHomeData = z.infer<typeof procurementHomeSchema>

/** What the home section needs from a published procurement page. */
export type HomePage = {
  /** `oldEquipmentPickup` of its block (§0 pkt 1). */
  pickup: boolean
  unit: [string, string, string]
  types: readonly { slug: string; items: readonly { qty: number }[] }[]
}

export type CalculatorType = { label: string; slug: string; perUnit: number }

export type HomeCard = Omit<ProcurementHomeData['cards'][number], 'pills' | 'calculator'> & {
  page: SupplyPage
  pills: string[]
  types: CalculatorType[]
  count: number
  unit: [string, string, string]
}

export type HomeBenefit = { icon: string; title: string; text?: string }

const DEVICE: [string, string, string] = ['urządzenie', 'urządzenia', 'urządzeń']

/** The card's types that the page has, with the devices per unit (sum of the item counts). */
export function calculatorTypes(
  types: readonly { label: string; slug: string }[],
  pageTypes: HomePage['types'],
): CalculatorType[] {
  return types.flatMap(({ label, slug }) => {
    const match = pageTypes.find((type) => type.slug === slug)
    if (!match) return []
    return [{ label, slug, perUnit: match.items.reduce((sum, item) => sum + item.qty, 0) }]
  })
}

/** Words after the total: „urządzenia · 12 lokali” (the total itself is drawn larger). */
export function resultLabel(total: number, count: number, unit: [string, string, string]) {
  return `${plural(total, DEVICE)} · ${count} ${plural(count, unit)}`
}

/**
 * The section as rendered, or `null` when nothing would show (wrong data, no published page).
 * The old-equipment benefit follows the AGD page's flag; the call-back one shows only with the
 * panel's promise.
 */
export function buildProcurementHome(
  value: unknown,
  { pages, callback }: { pages: Partial<Record<SupplyPage, HomePage>>; callback: string | null },
): { cards: HomeCard[]; benefits: HomeBenefit[] } | null {
  const result = procurementHomeSchema.safeParse(value ?? null)
  if (!result.success) return null
  const cards = result.data.cards.flatMap(({ pills, calculator, ...card }) => {
    const page = pages[card.page]
    if (!page) return []
    const types = calculatorTypes(calculator.types, page.types)
    if (types.length === 0) return []
    const shown = applyFlags(pills, { ...NO_FLAGS, pickup: page.pickup })
    return [
      {
        ...card,
        pills: shown.map((pill) => pill.label),
        types,
        count: calculator.count,
        unit: page.unit,
      },
    ]
  })
  if (cards.length === 0) return null
  const benefits = applyFlags(result.data.benefits, {
    ...NO_FLAGS,
    pickup: pages['agd-rtv-dla-firm']?.pickup ?? false,
    callback,
  }).map(({ icon, title, text: note }) => ({ icon, title, ...(note && { text: note }) }))
  return { cards, benefits }
}

/** Panel check of the block's JSON. */
export function validateProcurementHome(value: unknown): true | string {
  const result = procurementHomeSchema.safeParse(value ?? null)
  if (result.success) return true
  const [issue] = result.error.issues
  return `Dane sekcji: ${issue?.path.join('.') || '(całość)'} — ${issue?.message ?? 'błąd'}`
}
