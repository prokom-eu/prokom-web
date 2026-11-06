import type { CSSProperties } from 'react'

import { cx } from '@/components/ui/cx'

import { Contours } from './Contours'

export type Rule = { title: string; text?: string | null }

type Props = { rules: readonly Rule[]; className?: string }

/** At most this many rules: Biznes has eight („Osiem zasad”), the board six. */
export const RULES_MAX = 8

/**
 * „Dlaczego PRO-KOM” (spec §6.2 pkt 3, `RulesBento`): the first rule as a large card in the accent
 * with contour lines, the middle ones in a two-column grid, the last as a dark bar across. Takes
 * 6–8 rules (ADR-022 D2-3b — Biznes keeps its eight). One ordered list (the reader counts every
 * rule); a grid of one column on a phone, two from 640 px, the big card beside the grid from 1000.
 */
export function RulesBento({ rules, className }: Props) {
  const list = rules.slice(0, RULES_MAX)
  const [first, ...rest] = list
  if (!first) return null
  const last = rest.length >= 2 ? rest[rest.length - 1] : null
  const middle = last ? rest.slice(0, -1) : rest
  // Wide: the big card spans the rows of the middle grid (two per row) next to it.
  const rows = Math.max(1, Math.ceil(middle.length / 2))
  const number = (i: number) => String(i + 1).padStart(2, '0')
  return (
    <ol
      className={cx(
        'grid gap-3 min-[640px]:grid-cols-2 min-[1000px]:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)]',
        className,
      )}
      style={{ '--rows': rows } as CSSProperties}
      data-rules-bento
    >
      <li className="relative isolate flex min-h-[380px] flex-col justify-end gap-3 overflow-hidden rounded-[28px] bg-accent p-7 text-accent-ink min-[640px]:col-span-2 min-[1000px]:col-span-1 min-[1000px]:[grid-row:span_var(--rows)]">
        <Contours className="opacity-80" />
        <span className="font-display text-sm font-extrabold opacity-80">{number(0)}</span>
        <b className="font-display text-[28px] leading-tight font-extrabold">{first.title}</b>
        {first.text && <span className="opacity-90">{first.text}</span>}
      </li>
      {middle.map((rule, i) => (
        <li key={i} className="flex flex-col gap-2 rounded-[22px] border border-border bg-card p-6">
          <span className="font-display text-sm font-extrabold text-accent-text">
            {number(i + 1)}
          </span>
          <b className="font-display text-lg font-extrabold">{rule.title}</b>
          {rule.text && <span className="text-ink-2">{rule.text}</span>}
        </li>
      ))}
      {last && (
        <li className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[22px] bg-line-dark p-6 text-line-dark-text min-[640px]:col-span-2 min-[1000px]:col-span-3">
          <span className="font-display text-sm font-extrabold text-on-dark-text">
            {number(list.length - 1)}
          </span>
          <b className="font-display text-lg font-extrabold text-line-dark-ink">{last.title}</b>
          {last.text && <span>{last.text}</span>}
        </li>
      )}
    </ol>
  )
}
