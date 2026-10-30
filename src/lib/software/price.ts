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
