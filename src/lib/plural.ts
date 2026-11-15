/** Polish plural: 1 pozycja, 2–4 pozycje, 5+ pozycji (and 12–14 → pozycji). */
export function plural(n: number, [one, few, many]: [string, string, string]): string {
  if (n === 1) return one
  const tens = n % 100
  return n % 10 >= 2 && n % 10 <= 4 && (tens < 12 || tens > 14) ? few : many
}
