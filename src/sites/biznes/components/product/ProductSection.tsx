import type { ReactNode } from 'react'

import { cx } from '@/components/ui/cx'

/**
 * A section of the product page (board `Strona`, widok produkt): „— LABEL”, the H2, an optional
 * lead and a note on the right (e.g. „13 parametrów”). The id is the anchor of the section bar.
 */
export function ProductSection({
  id,
  eyebrow,
  heading,
  lead,
  aside,
  action,
  children,
  className,
}: {
  id: string
  eyebrow: string
  heading: string
  lead?: ReactNode
  aside?: ReactNode
  /** A link or button on the right of the heading (e.g. „Cała oferta Lenovo →”). */
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={cx('scroll-mt-40 flex flex-col gap-7 sm:gap-9', className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="max-w-[46rem]">
          <p className="mb-3 flex items-center gap-2.5 text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
            <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-current" />
            {eyebrow}
          </p>
          <h2
            id={`${id}-h`}
            className="font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.04] font-extrabold tracking-[-0.02em] text-ink font-stretch-110%"
          >
            {heading}
          </h2>
          {lead && <div className="mt-3 text-[1.05rem] leading-relaxed text-ink-2">{lead}</div>}
        </div>
        {action}
        {aside && (
          <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-extrabold text-ink-2">
            {aside}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}
