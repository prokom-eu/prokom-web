import { cx } from '@/components/ui/cx'

import { Contours } from './Contours'

export type Rule = { title: string; text?: string | null }

type Props = { rules: readonly Rule[]; className?: string }

/** At most this many rules: Biznes has eight („Osiem zasad”), the board six. */
export const RULES_MAX = 8

/**
 * „Dlaczego PRO-KOM” (spec §6.2 pkt 3, `RulesBento`): the first rule as a large card in the accent
 * with contour lines, the middle ones in a two-column grid, the last as a dark bar across. Takes
 * 6–8 rules (ADR-022 D2-3b — Biznes keeps its eight); a flex-wrap layout, so it works on a phone.
 */
export function RulesBento({ rules, className }: Props) {
  const list = rules.slice(0, RULES_MAX)
  if (list.length === 0) return null
  const [first, ...rest] = list
  const last = rest.length >= 2 ? rest[rest.length - 1] : null
  const middle = last ? rest.slice(0, -1) : rest
  const number = (i: number) => String(i + 1).padStart(2, '0')
  return (
    <ol className={cx('flex flex-wrap gap-3', className)} data-rules-bento>
      <li className="relative isolate flex min-h-[380px] basis-full flex-col justify-end gap-3 overflow-hidden rounded-[28px] bg-accent p-7 text-accent-ink min-[1000px]:basis-[calc(40%-6px)]">
        <Contours className="opacity-80" />
        <span className="font-display text-sm font-extrabold opacity-80">{number(0)}</span>
        <b className="font-display text-[28px] leading-tight font-extrabold">{first!.title}</b>
        {first!.text && <span className="opacity-90">{first!.text}</span>}
      </li>
      <li className="basis-full min-[1000px]:basis-[calc(60%-6px)]">
        <ol className="grid h-full gap-3 min-[640px]:grid-cols-2">
          {middle.map((rule, i) => (
            <li
              key={rule.title}
              className="flex flex-col gap-2 rounded-[22px] border border-border bg-card p-6"
            >
              <span className="font-display text-sm font-extrabold text-accent-text">
                {number(i + 1)}
              </span>
              <b className="font-display text-lg font-extrabold">{rule.title}</b>
              {rule.text && <span className="text-ink-2">{rule.text}</span>}
            </li>
          ))}
        </ol>
      </li>
      {last && (
        <li className="flex basis-full flex-wrap items-center gap-x-6 gap-y-2 rounded-[22px] bg-line-dark p-6 text-line-dark-text">
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
