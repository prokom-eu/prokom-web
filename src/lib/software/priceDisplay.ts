import { z } from 'zod'

import { label, obj, text } from './schema'

/** A label that must contain the token it is filled with. */
export const template = (token: string) =>
  label.refine((value) => value.includes(token), { message: `Musi zawierać ${token}.` })

/**
 * How prices read on the site (kreator.json → `priceDisplay`): always „od” (v22). Also used by the
 * catalog cards (SW9) and the offer window (SWR3).
 */
export const priceDisplaySchema = obj({
  /** „od {cena} zł netto” — the result and the cards. */
  template: template('{cena}'),
  /** „od {cena} zł” — tiles of step 1 and add-ons. */
  short: template('{cena}'),
  /** Care from its lowest level: „od {cena} zł / mies.”. */
  monthTemplate: template('{cena}'),
  /** The price of one care level: „{cena} zł / mies.”. */
  levelMonthTemplate: template('{cena}'),
  fallback: label,
  termFallback: label,
  priceSub: label,
  /** Under „Potrzebujesz czegoś więcej?” — before and after something is ticked. */
  moreHint: text,
  moreSelectedNote: text,
  /** A result without a price (apps, automations). */
  noPrice: obj({ price: label, term: label, priceSub: label, termSub: text, mobileBar: label }),
  scopeIntro: label,
})

export type PriceDisplay = z.infer<typeof priceDisplaySchema>
