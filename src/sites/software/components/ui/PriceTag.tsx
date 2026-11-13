import type { PriceLine } from '@/lib/software/priceCards'

type Props = {
  line: PriceLine
  /** „od 3 490 zł · od 3 tygodni” — the term after the price (the start page's situations). */
  withTerm?: boolean
}

/**
 * The price slot of a v24 card: the „od” price in the price's type, or — a solution without a
 * price — a small „Wycena po rozmowie” badge in the term's type, so it does not read like a
 * heading (SWA14 §4.1).
 */
export function PriceTag({ line, withTerm = false }: Props) {
  if (line.ask) return <span className="v-ask">{line.price}</span>
  return (
    <span className="v-price-tag">
      <b className="v-price">{line.price}</b>
      {withTerm && line.term && <span className="v-term">· {line.term}</span>}
    </span>
  )
}
