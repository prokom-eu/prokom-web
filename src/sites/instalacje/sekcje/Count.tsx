import { CountUp } from '@/components/motion/CountUp'

import { splitCount } from './countSplit'

/**
 * A fact figure that counts up once when seen (audit before staging §3, I-M): „od 2004”,
 * „10”, „100+”. Server-rendered final text; the shared `CountUp` does the rest (nothing with
 * reduced motion or for a text it cannot count).
 */
export function Count({ text }: { text: string | null | undefined }) {
  if (!text) return null
  const split = splitCount(text)
  if (!split) return <>{text}</>
  // `data-count`: the figure keeps the look of its `<b>` — the prototype styles every `span` of
  // a fact as its caption (`.kv span`, ruch.css §3b).
  return (
    <span data-count="">
      {split.prefix}
      <CountUp text={split.count} />
    </span>
  )
}
