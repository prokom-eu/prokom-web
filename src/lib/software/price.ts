const NBSP = String.fromCharCode(0xa0) // non-breaking space

/**
 * Price in zł as on the boards: thousands grouped with a non-breaking space („2 990”, not
 * `Intl`'s „2990” — Polish grouping starts at 5 digits), grosze only when given.
 */
export function formatPrice(price: number): string {
  const [whole = '0', fraction] = (
    Number.isInteger(price) ? String(price) : price.toFixed(2)
  ).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return fraction ? `${grouped},${fraction}` : grouped
}

/**
 * Prices and terms without a line break inside (SWR4): „od 2 490 zł”, „od 2 tygodni”, „w 5–7 dni”
 * — a non-breaking space after „od”/„w”/„do” before a number and between a number and its unit.
 */
export function keepTogether(text: string): string {
  return text
    .replace(/(^|\s)(od|w|do)\s(?=\d)/g, `$1$2${NBSP}`)
    .replace(/(\d)\s(?=(zł|tyg|tydz|dni|dzień|dnia|mies|godz|h\b))/g, `$1${NBSP}`)
}
