import type { CSSProperties } from 'react'

import type { SolutionCategory } from '@/lib/software/options'
import type { IndexSolution } from '@/lib/software/solutionsIndex'

/** Area of the category: its gradient token colours the scene (`--grad-area-<key>`). */
const AREA: Record<SolutionCategory, string> = {
  strony: 'www',
  systemy: 'sys',
  aplikacje: 'app',
  automatyzacje: 'auto',
  opieka: 'care',
}

type Props = Pick<IndexSolution, 'category' | 'tag' | 'cardGradient'>

const BAR = 'h-2 rounded-full bg-border'

/**
 * Picture of a solution card (board `Katalog`): a small mock of a site, a panel, a phone, a flow
 * or care checks — HTML, not an image (spec. §8.5), decorative (`aria-hidden`). Colours only from
 * tokens: the category's area gradient or the solution's own card gradient (`cardGradient`); the
 * tag sits on the accent with `--accent-ink`.
 */
export function CardScene({ category, tag, cardGradient }: Props) {
  const fill: CSSProperties = {
    backgroundImage: `var(--grad-${cardGradient ? `card-${cardGradient}` : `area-${AREA[category]}`})`,
  }
  return (
    <div
      aria-hidden="true"
      // Phone: a square thumbnail next to the text (spec. §5, `stany/88a`); wider: the picture on top.
      className="relative h-[104px] overflow-hidden rounded-2xl bg-stage px-2.5 pt-3 sm:h-[132px] sm:px-5 sm:pt-4"
    >
      {tag && (
        <span className="absolute right-3 top-3 z-10 hidden rounded-lg bg-button sm:inline px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent-ink">
          {tag}
        </span>
      )}
      {category === 'strony' && (
        <div className="h-full rounded-t-xl bg-card p-3 shadow-raised">
          <div className="flex gap-1">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-1.5 rounded-full bg-border" />
            ))}
          </div>
          <div className="mt-2 h-8 rounded-lg" style={fill} />
          <div className={`mt-2 w-3/5 ${BAR}`} />
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((cell) => (
              <span key={cell} className="h-4 rounded bg-surface-2" />
            ))}
          </div>
        </div>
      )}
      {category === 'systemy' && (
        <div className="flex h-full overflow-hidden rounded-t-xl bg-card shadow-raised">
          <div className="w-9 space-y-1.5 bg-surface-dark p-2">
            {[0, 1, 2, 3].map((row) => (
              <span key={row} className="block h-1 rounded-full bg-white/40 first:bg-ok" />
            ))}
          </div>
          <div className="flex-1 space-y-2 p-3">
            <div className="flex gap-1.5">
              <span className="h-4 w-12 rounded bg-surface-2" />
              <span className="h-4 w-12 rounded" style={fill} />
            </div>
            <div className={BAR} />
            <div className={`w-4/5 ${BAR}`} />
            <div className="h-2 rounded-full opacity-60" style={fill} />
          </div>
        </div>
      )}
      {category === 'aplikacje' && (
        <div className="mx-auto h-full w-[76px] rounded-t-[18px] border-4 border-b-0 border-ink bg-card p-2">
          <div className="h-6 rounded-md" style={fill} />
          <div className={`mt-2 ${BAR}`} />
          <div className={`mt-1.5 w-2/3 ${BAR}`} />
        </div>
      )}
      {category === 'automatyzacje' && (
        <div className="flex h-full items-center justify-center gap-2 pb-4">
          <span className="size-8 rounded-lg bg-card shadow-raised" />
          <span className="h-0.5 w-6 rounded-full" style={fill} />
          <span className="size-8 rounded-lg bg-accent-soft" />
          <span className="h-0.5 w-6 rounded-full" style={fill} />
          <span className="size-8 rounded-lg shadow-raised" style={fill} />
        </div>
      )}
      {category === 'opieka' && (
        <div className="flex h-full flex-col justify-center gap-2 pb-2 pt-6">
          {['Kopia', 'Aktualizacje', 'Monitoring'].map((row) => (
            <span
              key={row}
              className="flex items-center justify-between rounded-lg bg-card px-3 py-1.5 text-xs font-bold text-ink shadow-raised"
            >
              {row}
              <span className="size-2 rounded-full bg-ok" />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
