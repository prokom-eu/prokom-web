type Head = { before: string; amount: string; after: string }

/**
 * „od 999 zł netto” as the window's hero price (OKNO-OFERTY-PREMIUM §2.1): the currency goes
 * with the big number, only the rest („netto”, „/ mies.”) stays small.
 */
export function heroHead(head: Head): Head {
  const currency = /^zł(?:\s+(.*))?$/.exec(head.after)
  if (!currency || head.amount.endsWith('zł')) return head
  return { before: head.before, amount: `${head.amount} zł`, after: currency[1] ?? '' }
}
