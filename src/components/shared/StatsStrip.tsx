import { cx } from '@/components/ui/cx'

export type Stat = {
  value: string
  label: string
  /** „do potwierdzenia przez szefa” — shown as a badge, and never on production (spec §6.2). */
  flag?: string | null
}

type Props = {
  /** The four cards: „2004”, the line's two numbers (`shared.about.stats`), „5 linii”. */
  stats: readonly Stat[]
  /** `SITE_ENV`: on `production` a flagged number is left out. */
  siteEnv: string
  className?: string
}

/** Stats to show: on production none with a flag (the number waits for the boss). */
export function visibleStats(stats: readonly Stat[], siteEnv: string): Stat[] {
  return siteEnv === 'production' ? stats.filter((stat) => !stat.flag) : [...stats]
}

/**
 * Numbers under the O firmie hero (spec §6.2 pkt 2, `StatsStrip`): cards that overlap the hero by
 * 36 px. A number with a flag shows its badge on local and staging only.
 */
export function StatsStrip({ stats, siteEnv, className }: Props) {
  const shown = visibleStats(stats, siteEnv)
  if (shown.length === 0) return null
  return (
    <ul
      className={cx(
        'grid gap-3 min-[640px]:grid-cols-2 min-[1000px]:grid-flow-col min-[1000px]:auto-cols-fr',
        className,
      )}
      data-stats-strip
    >
      {shown.map((stat) => (
        <li
          key={`${stat.value}-${stat.label}`}
          className="flex flex-col gap-1 rounded-[22px] border border-border bg-card p-5 shadow-raised"
        >
          <span className="font-display text-[40px] leading-none font-extrabold text-accent-text">
            {stat.value}
          </span>
          <span className="text-ink-2">{stat.label}</span>
          {stat.flag && (
            <span
              className="mt-1 self-start rounded-full bg-promo px-2 py-0.5 text-xs font-bold text-promo-ink"
              data-stat-flag
            >
              {stat.flag}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
