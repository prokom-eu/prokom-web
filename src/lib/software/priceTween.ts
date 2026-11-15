import { easeOut } from '@/lib/motion/countUp'

/** A price text split around its amount („od 2 490 zł” → „od ”, 2490, „ zł”). */
export type PriceParts = { before: string; value: number; after: string; separator: string }

const AMOUNT = /(\d{1,3}(?:([\s\u00a0\u202f])\d{3})+|\d+)/

/** The first amount of a price text, with the thousands separator it uses; `null` without one. */
export function splitPrice(text: string): PriceParts | null {
  const match = AMOUNT.exec(text)
  if (!match || match.index === undefined) return null
  const [amount, , separator = '\u00a0'] = match
  return {
    before: text.slice(0, match.index),
    value: Number(amount!.replace(/\D/g, '')),
    after: text.slice(match.index + amount!.length),
    separator,
  }
}

/** The text at share `t` (0…1, eased) of the way from `from` to the target price. */
export function priceAt(from: number, to: PriceParts, t: number): string {
  const share = easeOut(Math.min(1, Math.max(0, t)))
  const value = Math.round(from + (to.value - from) * share)
  const grouped = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, to.separator)
  return `${to.before}${grouped}${to.after}`
}
