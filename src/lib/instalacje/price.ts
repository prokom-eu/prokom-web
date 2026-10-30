/** What a package or tile shows in place of a price (spec §2 decision 11, ADR-I002 §2). */
export type PriceSettings = { showPrices: boolean; noPriceText: string }

// `[CENA]`, `[TELEFON]`… — markers of the package that must never reach a page (spec §2).
const PLACEHOLDER = /\[[^\]]*\]/

/**
 * The price text of a package, or the line's "no price" text. One switch for the whole line:
 * a price shows only when the switch is on and the field holds a real price (not empty, not a
 * marker like `[CENA]`).
 */
export function displayPrice(price: string | null | undefined, settings: PriceSettings): string {
  const text = price?.trim()
  if (!settings.showPrices || !text || PLACEHOLDER.test(text)) return settings.noPriceText
  return text
}
